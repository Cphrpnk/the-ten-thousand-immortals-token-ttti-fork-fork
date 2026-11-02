import type { Principal } from "@icp-sdk/core/principal";
import type { DexToken, SwapError } from "../backend";
import { SWAP_DEADLINE_NS } from "../components/dex/liquidityFormat";
import { nowNs } from "../lib/approvals";
import {
  useDexPullApproval,
  useInvalidateDexFunds,
  useInvalidateLiquidity,
} from "./useDex";

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
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();

  const run = async (
    args: NativeSwapArgs,
    onStep: (step: NativeSwapStep) => void,
  ): Promise<NativeSwapOutcome> => {
    const release = begin();
    try {
      if (!actor) throw new Error("Actor not available");
      onStep("approve");
      await ensureApproved(actor, [
        { token: args.tokenIn, amount: args.amountIn },
      ]);
      onStep("swap");
      const swapped = await actor.swap(
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
      try {
        const withdrawn = await actor.withdrawFromDex({
          token: args.tokenOut,
          amount: amountOut,
        });
        if (withdrawn.__kind__ === "err") {
          return {
            kind: "withdrawFailed",
            amountOut,
            detail: withdrawn.err.__kind__,
          };
        }
      } catch (failure) {
        return {
          kind: "withdrawFailed",
          amountOut,
          detail: failure instanceof Error ? failure.message : "",
        };
      }
      return { kind: "done", amountOut };
    } finally {
      release();
      invalidate();
      invalidateFunds();
    }
  };

  return { run, ready: !!actor };
}
