import type { Principal } from "@icp-sdk/core/principal";
import { useState } from "react";
import { DexToken, PayToken } from "../../backend";
import type {
  DepositEntry,
  DepositMintParams,
  DepositTracking,
  RemainderChoice,
} from "../../backend";
import { useConnectedWallet } from "../../hooks/useConnectedWallet";
import { useDexBalances } from "../../hooks/useDex";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useConvertMyHeldBtc,
  useMyBtcDeposits,
  useWalletBtcDeposits,
  useWalletConvertMyHeldBtc,
} from "../../hooks/useQueries";
import { usePayTokenBalance } from "../../hooks/useWallet";
import { maxPayWithTolerance, mintDeadline } from "./liquidityMint";

/** Where the balance behind the final Mint button lives. */
export type MintSourceKind = "wallet" | "dex" | "contract";

export interface MintSources {
  principal: Principal | null;
  /** Wallet balance of the selected pay token; undefined while unknown. */
  wallet: bigint | undefined;
  /** Available DEX balance of the selected pay token; undefined while unknown. */
  dex: bigint | undefined;
  /** ckBTC held by the contract for the buyer (ckBTC only), base units. */
  held: bigint;
  /** Deposit indexes (as text) that make up `held`. */
  heldIndexes: string[];
  /** Wallet and DEX balances are both read. */
  known: boolean;
}

const DEX_TOKEN: Record<PayToken, DexToken> = {
  [PayToken.icp]: DexToken.icp,
  [PayToken.ckbtc]: DexToken.ckbtc,
  [PayToken.ckusdc]: DexToken.ckusdc,
  [PayToken.ckusdt]: DexToken.ckusdt,
};

/** Dex token matching a pay token. */
export function dexTokenOf(token: PayToken): DexToken {
  return DEX_TOKEN[token];
}

function isHeld(entry: DepositEntry): boolean {
  const kind = entry.stage.__kind__;
  return (
    (kind === "minted" || kind === "pendingRate") && entry.ckbtcPendingSats > 0n
  );
}

/** Wallet, DEX and contract-held balances of the selected pay token. */
export function useMintSources(token: PayToken): MintSources {
  const connected = useConnectedWallet();
  const { identity } = useInternetIdentity();
  const external = connected.principal !== null;
  const iiPrincipal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const principal = connected.principal ?? iiPrincipal;
  const balance = usePayTokenBalance(
    token,
    principal ? { owner: principal } : undefined,
  );
  const dexBalances = useDexBalances(principal);
  const iiDeposits = useMyBtcDeposits(!external);
  const walletDeposits = useWalletBtcDeposits(external);
  const deposits = external ? walletDeposits : iiDeposits;

  const dexToken = DEX_TOKEN[token];
  const dex = dexBalances.data
    ? (dexBalances.data.find((row) => row.token === dexToken)?.available ?? 0n)
    : undefined;
  const heldEntries =
    token === PayToken.ckbtc
      ? (deposits.data?.purchase?.deposits.filter(isHeld) ?? [])
      : [];
  const held = heldEntries.reduce((sum, e) => sum + e.ckbtcPendingSats, 0n);

  return {
    principal,
    wallet: balance.data,
    dex,
    held,
    heldIndexes: heldEntries.map((e) => e.index.toString()),
    known:
      balance.data !== undefined &&
      dex !== undefined &&
      !(token === PayToken.ckbtc && deposits.isLoading),
  };
}

/** The balance the Mint click works from; contract-held ckBTC comes first. */
export function pickMintSource(s: MintSources): MintSourceKind | null {
  if (s.held > 0n) return "contract";
  if ((s.wallet ?? 0n) > 0n) return "wallet";
  if ((s.dex ?? 0n) > 0n) return "dex";
  return null;
}

/** What a held-ckBTC conversion produced, amounts as reported by the backend. */
export interface ConvertSummary {
  delivered: bigint;
  refunded: bigint;
  stillHeld: bigint;
  cause: string | undefined;
}

function summarize(
  tracking: DepositTracking,
  indexes: ReadonlyArray<string>,
): ConvertSummary {
  const summary: ConvertSummary = {
    delivered: 0n,
    refunded: 0n,
    stillHeld: 0n,
    cause: undefined,
  };
  for (const entry of tracking.deposits) {
    if (!indexes.includes(entry.index.toString())) continue;
    const kind = entry.stage.__kind__;
    if (kind === "delivered") summary.delivered += entry.tttiDelivered;
    if (kind === "refunded") summary.refunded += entry.refundedSats;
    if (kind === "minted" || kind === "pendingRate") {
      summary.stillHeld += entry.ckbtcPendingSats;
    }
    summary.cause ??= entry.conversionCause ?? entry.errorMessage;
  }
  return summary;
}

/** Values of the mint screen that bound a held-ckBTC conversion. */
export interface HeldConversionInput {
  /** ckBTC held by the contract, as reported by the backend (base units). */
  held: bigint;
  /** Pool the user has the last word on; null while none is selected. */
  poolId: bigint | null;
  choice: RemainderChoice;
  /** Tolerance in basis points; null while the typed text is invalid. */
  slippageBps: bigint | null;
}

/** Backend parameters, or the reason no backend call is made. */
export type HeldConversionPlan =
  | { kind: "ready"; params: DepositMintParams }
  | { kind: "noPool" }
  | { kind: "invalidSlippage" };

/**
 * Parameters of a held-ckBTC conversion: the cap is the held amount (as the
 * backend reports it) plus the user's tolerance, the deadline is 5 minutes
 * from the click. No price is computed here.
 */
export function planHeldConversion(
  input: HeldConversionInput,
): HeldConversionPlan {
  if (input.poolId === null) return { kind: "noPool" };
  if (input.slippageBps === null) return { kind: "invalidSlippage" };
  return {
    kind: "ready",
    params: {
      targetPoolId: input.poolId,
      choice: input.choice,
      slippageBps: input.slippageBps,
      maxPayAmount: maxPayWithTolerance(input.held, input.slippageBps),
      deadline: mintDeadline(),
    },
  };
}

export type ConvertState =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; summary: ConvertSummary }
  | { kind: "failed"; error: unknown };

/** convertMyHeldBtc for the signed-in account (built-in or external wallet). */
export function useHeldBtcConversion() {
  const connected = useConnectedWallet();
  const external = connected.principal !== null;
  const iiConvert = useConvertMyHeldBtc();
  const walletConvert = useWalletConvertMyHeldBtc();
  const [state, setState] = useState<ConvertState>({ kind: "idle" });

  const convert = (
    heldIndexes: ReadonlyArray<string>,
    params: DepositMintParams,
  ) => {
    if (state.kind === "working") return;
    // OISY/NFID: the wallet window opens from the click, before any await.
    const release = external ? connected.beginSession() : () => {};
    setState({ kind: "working" });
    const mutation = external ? walletConvert : iiConvert;
    mutation.mutate(params, {
      onSuccess: (tracking) =>
        setState({ kind: "done", summary: summarize(tracking, heldIndexes) }),
      onError: (error) => setState({ kind: "failed", error }),
      onSettled: () => release(),
    });
  };

  return { state, convert, reset: () => setState({ kind: "idle" }) };
}
