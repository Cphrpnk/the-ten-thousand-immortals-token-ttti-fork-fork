import type { Agent } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { pickDict } from "../i18n/core/dict";
import { WALLET_SIGNING_TEXT } from "../i18n/pages/walletSigning";
import {
  approveWithLedgerIdentity,
  approveWithPlugWallet,
  approveWithSignerWallet,
} from "../lib/approvals";
import {
  type ApproveOutcome,
  type RawApproveArgs,
  createLedgerAgent,
} from "../lib/icpLedger";
import type { TokenDescriptor } from "../lib/tokenRegistry";
import {
  type ConnectedWalletKind,
  WALLET_NAMES,
  isSignerKind,
  useConnectedWallet,
} from "./useConnectedWallet";
import { useInternetIdentity } from "./useInternetIdentity";
import { getPlug, usePlug } from "./usePlug";
import {
  connectSigner,
  getSignerAgent,
  openSignerSession,
  readStoredAccount,
} from "./useSignerWallet";

/** Wallet that signs for an account: an external wallet or Internet Identity. */
export type AccountSignerKind = ConnectedWalletKind | "ii";

export const SIGNER_NAMES: Record<AccountSignerKind, string> = {
  ...WALLET_NAMES,
  ii: "Internet Identity",
};

// ------------------------------------------- wallet remembered per account

const ACCOUNT_WALLET_PREFIX = "ttti.accountWallet.";
const listeners = new Set<() => void>();

function readAccountWallet(ownerText: string): ConnectedWalletKind | null {
  try {
    const value = window.localStorage.getItem(
      `${ACCOUNT_WALLET_PREFIX}${ownerText}`,
    );
    return value === "plug" || value === "oisy" || value === "nfid"
      ? value
      : null;
  } catch {
    return null;
  }
}

/** Remember on this device which wallet holds `ownerText`. */
export function rememberAccountWallet(
  ownerText: string,
  kind: ConnectedWalletKind,
) {
  try {
    window.localStorage.setItem(`${ACCOUNT_WALLET_PREFIX}${ownerText}`, kind);
  } catch {
    // Storage unavailable: the match lasts for this visit only.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const noop = () => undefined;

function isSignerAccountKind(
  kind: AccountSignerKind | null,
): kind is "oisy" | "nfid" {
  return kind !== "ii" && isSignerKind(kind);
}

export interface AccountSigner {
  /** Wallet that signs for the owner, or null when none is known here. */
  kind: AccountSignerKind | null;
  /**
   * Call synchronously from the click, before any await: opens the OISY /
   * NFID window so the signature reuses it. Returns a release function.
   */
  begin: () => () => void;
  /** icrc2_approve with exactly `args`, signed by the owner's wallet. */
  approve: (
    token: TokenDescriptor,
    args: RawApproveArgs,
  ) => Promise<ApproveOutcome>;
  /** Agent for ledger calls signed by Internet Identity, OISY or NFID. */
  ledgerAgent: () => Promise<Agent>;
  /** Mark the owner's wallet as known after a successful signature. */
  remember: () => void;
  /** Call from a click: connect `kind` and return the account it holds. */
  connect: (kind: ConnectedWalletKind) => Promise<Principal>;
}

/**
 * Pick the wallet that holds `owner` among Internet Identity, the connected
 * wallet, Plug, the stored OISY / NFID account and the wallet remembered for
 * this account on this device. No manual choice.
 */
export function useAccountSigner(
  owner: Principal | null | undefined,
): AccountSigner {
  const { identity } = useInternetIdentity();
  const connected = useConnectedWallet();
  const { principal: plugPrincipal, connect: plugConnect } = usePlug();
  const ownerText = owner?.toText() ?? null;
  const remembered = useSyncExternalStore(
    subscribe,
    () => (ownerText ? readAccountWallet(ownerText) : null),
    () => null,
  );

  const iiPrincipal = identity?.getPrincipal();
  let kind: AccountSignerKind | null = null;
  if (ownerText) {
    const stored = readStoredAccount();
    if (
      iiPrincipal &&
      !iiPrincipal.isAnonymous() &&
      iiPrincipal.toText() === ownerText
    ) {
      kind = "ii";
    } else if (connected.kind && connected.principal?.toText() === ownerText) {
      kind = connected.kind;
    } else if (plugPrincipal?.toText() === ownerText) {
      kind = "plug";
    } else if (stored && stored.principal.toText() === ownerText) {
      kind = stored.kind;
    } else {
      kind = remembered;
    }
  }

  const begin = useCallback(
    () => (isSignerAccountKind(kind) ? openSignerSession(kind) : noop),
    [kind],
  );

  const remember = useCallback(() => {
    if (ownerText && kind && kind !== "ii") {
      rememberAccountWallet(ownerText, kind);
    }
  }, [ownerText, kind]);

  const approve = useCallback(
    async (
      token: TokenDescriptor,
      args: RawApproveArgs,
    ): Promise<ApproveOutcome> => {
      const missing = {
        ok: false as const,
        message: pickDict(WALLET_SIGNING_TEXT).noSigner,
      };
      if (!owner || !kind) return missing;
      let outcome: ApproveOutcome;
      if (kind === "ii") {
        if (!identity) return missing;
        outcome = await approveWithLedgerIdentity(identity, token, args);
      } else if (kind === "plug") {
        outcome = await approveWithPlugWallet(token, args, owner);
      } else {
        outcome = await approveWithSignerWallet(kind, owner, token, args);
      }
      if (outcome.ok) remember();
      return outcome;
    },
    [owner, kind, identity, remember],
  );

  const ledgerAgent = useCallback(async (): Promise<Agent> => {
    if (owner && isSignerAccountKind(kind)) return getSignerAgent(kind, owner);
    if (kind === "ii" && identity) return createLedgerAgent(identity);
    throw new Error(pickDict(WALLET_SIGNING_TEXT).noSigner);
  }, [owner, kind, identity]);

  const connect = useCallback(
    async (target: ConnectedWalletKind): Promise<Principal> => {
      let principal: Principal;
      if (target === "plug") {
        await plugConnect();
        const plug = getPlug();
        if (!plug) throw new Error(pickDict(WALLET_SIGNING_TEXT).failed);
        principal = await plug.getPrincipal();
      } else {
        principal = await connectSigner(target);
      }
      if (ownerText && principal.toText() === ownerText) {
        rememberAccountWallet(ownerText, target);
      }
      return principal;
    },
    [plugConnect, ownerText],
  );

  return useMemo(
    () => ({ kind, begin, approve, ledgerAgent, remember, connect }),
    [kind, begin, approve, ledgerAgent, remember, connect],
  );
}
