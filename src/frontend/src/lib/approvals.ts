import { Actor, type Identity } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { PayToken } from "../backend";
import { ensurePlugSession, getPlug, plugWhitelist } from "../hooks/usePlug";
import {
  type SignerWalletKind,
  getSignerAgent,
  walletConfig,
  walletFailureMessage,
} from "../hooks/useSignerWallet";
import { pickDict } from "../i18n/core/dict";
import { WALLET_SIGNING_TEXT } from "../i18n/pages/walletSigning";
import {
  type ApproveOutcome,
  type IcpLedgerActor,
  type RawApproveArgs,
  createLedgerActor,
  describeCallFailure,
  icpLedgerIdlFactory,
  mapApproveResult,
} from "./icpLedger";
import { PAY_TOKENS, type PayTokenDescriptor } from "./token";
import type { TokenDescriptor } from "./tokenRegistry";

const NS_PER_MS = 1_000_000n;
const MINUTE_NS = 60n * 1_000_000_000n;

/** Expiration choices offered for an approval. */
export type ApprovalExpiryChoice = "15m" | "1h" | "24h" | "7d" | "custom";

export const APPROVAL_EXPIRY_PRESETS: ReadonlyArray<
  Exclude<ApprovalExpiryChoice, "custom">
> = ["15m", "1h", "24h", "7d"];

const PRESET_NS: Record<Exclude<ApprovalExpiryChoice, "custom">, bigint> = {
  "15m": 15n * MINUTE_NS,
  "1h": 60n * MINUTE_NS,
  "24h": 24n * 60n * MINUTE_NS,
  "7d": 7n * 24n * 60n * MINUTE_NS,
};

/** Above this lifetime the stronger warning applies. */
export const LONG_APPROVAL_NS = PRESET_NS["24h"];

export function nowNs(): bigint {
  return BigInt(Date.now()) * NS_PER_MS;
}

/**
 * expires_at in nanoseconds for a choice; null when the custom date is
 * missing, invalid or not in the future. Never returns "no expiration".
 */
export function resolveExpiresAt(
  choice: ApprovalExpiryChoice,
  customDate?: Date | null,
  now: bigint = nowNs(),
): bigint | null {
  if (choice !== "custom") return now + PRESET_NS[choice];
  if (!customDate || Number.isNaN(customDate.getTime())) return null;
  const at = BigInt(customDate.getTime()) * NS_PER_MS;
  return at > now ? at : null;
}

/** Current allowance of `spender` on the owner's default account. */
export interface AllowanceState {
  allowance: bigint;
  /** Nanoseconds, undefined when the ledger reports no expiration. */
  expiresAt: bigint | undefined;
}

export function isAllowanceExpired(
  state: AllowanceState,
  now: bigint = nowNs(),
): boolean {
  return state.expiresAt !== undefined && state.expiresAt <= now;
}

/** Allowance still usable (non-zero and not expired). */
export function isAllowanceActive(state: AllowanceState): boolean {
  return state.allowance > 0n && !isAllowanceExpired(state);
}

/** Read icrc2_allowance(owner, spender) on a ledger, anonymously. */
export async function readAllowance(
  ledgerId: string,
  owner: Principal,
  spender: Principal,
): Promise<AllowanceState> {
  const ledger = await createLedgerActor(ledgerId);
  const result = await ledger.icrc2_allowance({
    account: { owner, subaccount: [] },
    spender: { owner: spender, subaccount: [] },
  });
  return { allowance: result.allowance, expiresAt: result.expires_at[0] };
}

/**
 * Approve args for an arbitrary spender. `expectedAllowance` is the
 * allowance read before signing, so a concurrent change is refused.
 */
export function buildSpenderApproveArgs(params: {
  spender: Principal;
  amount: bigint;
  fee: bigint;
  expiresAt: bigint;
  expectedAllowance: bigint;
}): RawApproveArgs {
  return {
    fee: [params.fee],
    memo: [],
    from_subaccount: [],
    created_at_time: [nowNs()],
    amount: params.amount,
    expected_allowance: [params.expectedAllowance],
    expires_at: [params.expiresAt],
    spender: { owner: params.spender, subaccount: [] },
  };
}

/** Revoke: an approval of 0 that expires in 15 minutes. */
export function buildRevokeArgs(params: {
  spender: Principal;
  fee: bigint;
  expectedAllowance: bigint;
}): RawApproveArgs {
  return buildSpenderApproveArgs({
    ...params,
    amount: 0n,
    expiresAt: nowNs() + PRESET_NS["15m"],
  });
}

/**
 * Stronger warning: the amount exceeds the current balance, or the
 * approval lasts more than 24 hours.
 */
export function needsStrongWarning(params: {
  amount: bigint;
  balance: bigint | undefined;
  expiresAt: bigint | null;
  now?: bigint;
}): { overBalance: boolean; longLived: boolean } {
  const now = params.now ?? nowNs();
  return {
    overBalance: params.balance !== undefined && params.amount > params.balance,
    longLived:
      params.expiresAt !== null && params.expiresAt - now > LONG_APPROVAL_NS,
  };
}

/** Shape the shared approve error mapper expects, for any wallet token. */
function errorDescriptor(token: TokenDescriptor): PayTokenDescriptor {
  return {
    ...PAY_TOKENS[PayToken.icp],
    symbol: token.symbol,
    name: token.name,
    ledgerCanisterId: token.canisterId.toText(),
    decimals: token.decimals,
    fee: token.fee,
  };
}

/** Sign icrc2_approve with an Internet Identity on the token's ledger. */
export async function approveWithLedgerIdentity(
  identity: Identity,
  token: TokenDescriptor,
  args: RawApproveArgs,
): Promise<ApproveOutcome> {
  try {
    const ledger = await createLedgerActor(token.canisterId.toText(), identity);
    return mapApproveResult(
      await ledger.icrc2_approve(args),
      errorDescriptor(token),
    );
  } catch (error) {
    return { ok: false, message: describeCallFailure(error, token.symbol) };
  }
}

/**
 * Sign icrc2_approve with Plug on the token's ledger (whitelisted). With
 * `expectedOwner`, nothing is signed when Plug holds another account.
 */
export async function approveWithPlugWallet(
  token: TokenDescriptor,
  args: RawApproveArgs,
  expectedOwner?: Principal,
): Promise<ApproveOutcome> {
  try {
    const plug = getPlug();
    if (!plug) throw new Error("Plug not available");
    const config = await walletConfig();
    const whitelist = plugWhitelist(config.backend_canister_id);
    const ledgerId = token.canisterId.toText();
    if (!whitelist.includes(ledgerId)) whitelist.push(ledgerId);
    await ensurePlugSession(plug, whitelist, config.backend_host);
    if (expectedOwner) {
      const current = await plug.getPrincipal();
      if (current.toText() !== expectedOwner.toText()) {
        return {
          ok: false,
          message: pickDict(WALLET_SIGNING_TEXT).wrongAccount,
        };
      }
    }
    const ledger = await plug.createActor<IcpLedgerActor>({
      canisterId: ledgerId,
      interfaceFactory: icpLedgerIdlFactory,
    });
    return mapApproveResult(
      await ledger.icrc2_approve(args),
      errorDescriptor(token),
    );
  } catch (error) {
    return {
      ok: false,
      message:
        walletFailureMessage(error) ?? describeCallFailure(error, token.symbol),
    };
  }
}

/**
 * Sign icrc2_approve with OISY or NFID Wallet (ICRC-49) on the token's
 * ledger, with the same arguments as the other wallets. Open the wallet
 * window from the click first (openSignerSession).
 */
export async function approveWithSignerWallet(
  kind: SignerWalletKind,
  owner: Principal,
  token: TokenDescriptor,
  args: RawApproveArgs,
): Promise<ApproveOutcome> {
  try {
    const agent = await getSignerAgent(kind, owner);
    const ledger = Actor.createActor<IcpLedgerActor>(icpLedgerIdlFactory, {
      agent,
      canisterId: token.canisterId.toText(),
    });
    return mapApproveResult(
      await ledger.icrc2_approve(args),
      errorDescriptor(token),
    );
  } catch (error) {
    return {
      ok: false,
      message:
        walletFailureMessage(error) ?? describeCallFailure(error, token.symbol),
    };
  }
}
