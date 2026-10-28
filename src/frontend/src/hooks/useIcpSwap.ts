import { loadConfig } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  QUOTE_TTL_MS,
  type SwapPoolInfo,
  readSwapQuote,
  readUnusedBalance,
  resolveSwapPool,
} from "../lib/icpswap";
import {
  type ListedToken,
  addedSwapTokensSnapshot,
  readIcpSwapTokenList,
  subscribeAddedSwapTokens,
} from "../lib/swapTokens";
import type { TokenDescriptor } from "../lib/tokenRegistry";

const noTokens: Array<TokenDescriptor> = [];

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

/** Tokens added to the swap selector in this browser. */
export function useAddedSwapTokens(): Array<TokenDescriptor> {
  return useSyncExternalStore(
    subscribeAddedSwapTokens,
    addedSwapTokensSnapshot,
    () => noTokens,
  );
}

/** TTTI-T ledger ID: the backend canister ID read from the runtime config. */
export function useTttiLedgerId() {
  return useQuery<string>({
    queryKey: ["tttiLedgerId"],
    queryFn: async () => (await loadConfig()).backend_canister_id,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** ICPSwap's on-chain token list, for symbol search. */
export function useIcpSwapTokenList(enabled: boolean) {
  return useQuery<Array<ListedToken>>({
    queryKey: ["icpswapTokenList"],
    queryFn: readIcpSwapTokenList,
    enabled,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
