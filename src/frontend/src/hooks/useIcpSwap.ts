import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import {
  QUOTE_TTL_MS,
  type SwapPoolInfo,
  readSwapQuote,
  readUnusedBalance,
  resolveSwapPool,
} from "../lib/icpswap";

/** Direct ICPSwap pool of a pair; null when ICPSwap has none. */
export function useSwapPool(fromLedger: string, toLedger: string) {
  return useQuery<SwapPoolInfo | null>({
    queryKey: ["icpswapPool", fromLedger, toLedger],
    queryFn: () => resolveSwapPool(fromLedger, toLedger),
    enabled: !!fromLedger && !!toLedger && fromLedger !== toLedger,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
}

/** Live ICPSwap quote for `amountIn` of `fromLedger` (output before withdrawal fee). */
export function useSwapQuote(
  pool: SwapPoolInfo | null | undefined,
  fromLedger: string,
  amountIn: bigint | null,
) {
  return useQuery<bigint>({
    queryKey: ["icpswapQuote", pool?.poolId, fromLedger, amountIn?.toString()],
    queryFn: () => {
      if (!pool || amountIn === null) throw new Error("No pool");
      return readSwapQuote(pool, fromLedger, amountIn);
    },
    enabled: !!pool && amountIn !== null && amountIn > 0n,
    staleTime: QUOTE_TTL_MS,
    retry: 1,
  });
}

/** Balance of `owner` left in the pool, keyed by ledger ID. */
export function useSwapUnusedBalance(
  pool: SwapPoolInfo | null | undefined,
  owner: Principal | null,
) {
  return useQuery<Record<string, bigint>>({
    queryKey: ["icpswapUnused", pool?.poolId, owner?.toText()],
    queryFn: () => {
      if (!pool || !owner) throw new Error("No pool");
      return readUnusedBalance(pool, owner);
    },
    enabled: !!pool && !!owner,
    retry: 1,
  });
}
