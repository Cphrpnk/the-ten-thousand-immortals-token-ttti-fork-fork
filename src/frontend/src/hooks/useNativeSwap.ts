import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { DexToken, SwapError, backendInterface } from "../backend";
import { SWAP_DEADLINE_NS } from "../components/dex/liquidityFormat";
import { nowNs } from "../lib/approvals";
import { useAccountSigner } from "./useAccountSigner";
import {
  type ConnectedWalletKind,
  type ConnectedWalletValue,
  isSignerKind,
  useConnectedWallet,
} from "./useConnectedWallet";
import {
  useDexPullApproval,
  useInvalidateDexFunds,
  useInvalidateLiquidity,
} from "./useDex";
import { getPlug, usePlug } from "./usePlug";
import { getSignerAgent, walletFailureMessage } from "./useSignerWallet";

export type NativeSwapStep = "approve" | "swap" | "withdraw";

export interface NativeSwapArgs {
  poolId: bigint;
  tokenIn: DexToken;
  tokenOut: DexToken;
  amountIn: bigint;
  minAmountOut: bigint;
}

export type NativeSwapOutcome =
  | { kind: "done"; amountOut: bigint }
  | { kind: "refused"; error: SwapError }
  | { kind: "withdrawFailed"; amountOut: bigint; detail: string };

/** One DEX balance to withdraw to the wallet. */
export interface DexWithdrawal {
  token: DexToken;
  amount: bigint;
}

export type DexWithdrawOutcome =
  | { kind: "done" }
  | { kind: "failed"; detail: string };

const noop = () => undefined;

/** True when the connected wallet is `kind` and holds `owner`. */
function holdsAccount(
  kind: ConnectedWalletKind,
  owner: Principal,
  connected: ConnectedWalletValue,
): boolean {
  return (
    connected.kind === kind && connected.principal?.toText() === owner.toText()
  );
}

/**
 * Principal the wallet signs with right now. Read-only: Plug is only asked
 * `isConnected()` and `getPrincipal()` (never `requestConnect`, never
 * `createActor`); signer wallets answer from the stored account.
 */
async function livePrincipal(
  kind: ConnectedWalletKind,
  owner: Principal,
): Promise<Principal | undefined> {
  if (kind === "plug") {
    const plug = getPlug();
    if (!plug || !(await plug.isConnected())) return undefined;
    return plug.getPrincipal();
  }
  if (isSignerKind(kind)) {
    const agent = await getSignerAgent(kind, owner);
    return agent.getPrincipal();
  }
  return undefined;
}

/**
 * Mount / account-change check, safe without a click: the remembered
 * principal, plus the read-only live principal. A Plug backend is never
 * created here.
 */
async function checkWalletAccount(
  kind: ConnectedWalletKind,
  owner: Principal,
  connected: ConnectedWalletValue,
): Promise<boolean> {
  try {
    if (!holdsAccount(kind, owner, connected)) return false;
    const live = await livePrincipal(kind, owner);
    if (!live || live.toText() !== owner.toText()) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Click-time: backend of the connected wallet, created now, then the live
 * signing principal rechecked against `owner` before anything is signed.
 * Null when the wallet is not `kind`, does not hold `owner`, or signs with
 * another principal.
 */
async function openWalletBackend(
  kind: ConnectedWalletKind,
  owner: Principal,
  connected: ConnectedWalletValue,
): Promise<backendInterface | null> {
  try {
    if (!holdsAccount(kind, owner, connected)) return null;
    const backend = await connected.getBackend();
    const live = await livePrincipal(kind, owner);
    if (!live || live.toText() !== owner.toText()) return null;
    return backend ?? null;
  } catch {
    return null;
  }
}

type WithdrawStepResult =
  | { kind: "ok" }
  | { kind: "err"; detail: string }
  | { kind: "threw"; failure: unknown };

/** withdrawFromDex on the signing backend; never throws. */
async function withdrawToWallet(
  signed: backendInterface,
  token: DexToken,
  amount: bigint,
): Promise<WithdrawStepResult> {
  try {
    const withdrawn = await signed.withdrawFromDex({ token, amount });
    if (withdrawn.__kind__ === "err") {
      return { kind: "err", detail: withdrawn.err.__kind__ };
    }
    return { kind: "ok" };
  } catch (failure) {
    return { kind: "threw", failure };
  }
}

/**
 * Native pool swap from the wallet: the missing funds are pulled into the
 * common DEX guard with an ICRC-2 approval signed by the wallet that holds
 * `owner`, the swap runs in the pool, and the output is withdrawn to the
 * wallet. Call `run` synchronously from the click so the signer window can
 * open. Failures before the swap throw; a failed withdrawal is reported with
 * the amount, which stays in the DEX balance.
 */
export function useNativeWalletSwap(owner: Principal | null | undefined) {
  const { actor, begin, ensureApproved } = useDexPullApproval(owner);
  const signer = useAccountSigner(owner);
  const connected = useConnectedWallet();
  const { principal: plugPrincipal } = usePlug();
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  const queryClient = useQueryClient();

  const ownerText = owner?.toText() ?? null;
  const signerKind = signer.kind;
  const external = ownerText !== null && signerKind !== "ii";
  const walletKind: ConnectedWalletKind | null =
    signerKind === "plug" || signerKind === "oisy" || signerKind === "nfid"
      ? signerKind
      : null;
  const checkKey = [
    ownerText,
    signerKind,
    connected.kind,
    connected.principal?.toText(),
    plugPrincipal?.toText(),
  ].join("|");

  const latest = useRef({ owner, walletKind, connected });
  latest.current = { owner, walletKind, connected };

  const [verified, setVerified] = useState<string | null>(null);

  // Read-only: no Plug backend, session or connect request without a click.
  useEffect(() => {
    const {
      owner: current,
      walletKind: kind,
      connected: wallet,
    } = latest.current;
    if (!current || !kind) {
      setVerified(null);
      return;
    }
    let cancelled = false;
    void checkWalletAccount(kind, current, wallet).then((ok) => {
      if (!cancelled) setVerified(ok ? checkKey : null);
    });
    return () => {
      cancelled = true;
    };
  }, [checkKey]);

  const accountOk = external ? verified === checkKey : true;

  /**
   * One signed session, started from a click: the signer window opens, the
   * wallet backend is created and its live principal checked, then `work`
   * runs. Whatever happens, the session closes and the DEX balances reload.
   */
  const withSession = async <T>(
    work: (signed: backendInterface) => Promise<T>,
  ): Promise<T> => {
    let release: () => void = noop;
    try {
      release = begin();
      let signed: backendInterface;
      if (external) {
        if (!owner || !walletKind) throw new Error("Actor not available");
        const wallet = await openWalletBackend(walletKind, owner, connected);
        if (!wallet) throw new Error("Actor not available");
        signed = wallet;
      } else {
        if (!actor) throw new Error("Actor not available");
        signed = actor;
      }
      return await work(signed);
    } finally {
      try {
        release();
      } finally {
        invalidate();
        invalidateFunds();
        void queryClient.invalidateQueries({ queryKey: ["dexBalances"] });
      }
    }
  };

  const run = (
    args: NativeSwapArgs,
    onStep: (step: NativeSwapStep) => void,
  ): Promise<NativeSwapOutcome> =>
    withSession<NativeSwapOutcome>(async (signed) => {
      if (!actor) throw new Error("Actor not available");
      onStep("approve");
      await ensureApproved(
        actor,
        [{ token: args.tokenIn, amount: args.amountIn }],
        signed === actor ? undefined : signed,
      );
      onStep("swap");
      const swapped = await signed.swap(
        args.poolId,
        args.tokenIn,
        args.amountIn,
        args.minAmountOut,
        nowNs() + SWAP_DEADLINE_NS,
      );
      if (swapped.__kind__ === "err") {
        return { kind: "refused", error: swapped.err };
      }
      const amountOut = swapped.ok.amountOut;
      onStep("withdraw");
      const withdrawn = await withdrawToWallet(
        signed,
        args.tokenOut,
        amountOut,
      );
      if (withdrawn.kind === "err") {
        return {
          kind: "withdrawFailed",
          amountOut,
          detail: withdrawn.detail,
        };
      }
      if (withdrawn.kind === "threw") {
        return {
          kind: "withdrawFailed",
          amountOut,
          detail:
            withdrawn.failure instanceof Error ? withdrawn.failure.message : "",
        };
      }
      return { kind: "done", amountOut };
    });

  /**
   * Withdraw DEX balances to the wallet, signed by the wallet that holds
   * `owner` (same session and signing path as the withdrawal step of `run`).
   * Call synchronously from the click. Stops at the first failure.
   */
  const withdrawDexAll = (
    entries: ReadonlyArray<DexWithdrawal>,
  ): Promise<DexWithdrawOutcome> =>
    withSession<DexWithdrawOutcome>(async (signed) => {
      for (const entry of entries) {
        const withdrawn = await withdrawToWallet(
          signed,
          entry.token,
          entry.amount,
        );
        if (withdrawn.kind === "err") {
          return { kind: "failed", detail: withdrawn.detail };
        }
        if (withdrawn.kind === "threw") {
          const failure = withdrawn.failure;
          return {
            kind: "failed",
            detail:
              walletFailureMessage(failure) ??
              (failure instanceof Error ? failure.message : ""),
          };
        }
      }
      return { kind: "done" };
    });

  const withdrawDex = (
    token: DexToken,
    amount: bigint,
  ): Promise<DexWithdrawOutcome> => withdrawDexAll([{ token, amount }]);

  return {
    run,
    withdrawDex,
    withdrawDexAll,
    ready: external ? accountOk && !!actor : !!actor,
    accountOk,
  };
}
