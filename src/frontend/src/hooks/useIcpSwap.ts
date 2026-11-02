import { loadConfig } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  QUOTE_TTL_MS,
  type SwapPoolInfo,
  type TttiPriceReading,
  isPriceFresh,
  loadCachedTttiPrice,
  readIcpswapTttiUsdE8,
  readSwapQuote,
  readUnusedBalance,
  resolveSwapPool,
  storeTttiPrice,
} from "../lib/icpswap";
import {
  type ListedToken,
  addedSwapTokensSnapshot,
  readIcpSwapTokenList,
  subscribeAddedSwapTokens,
} from "../lib/swapTokens";
import type { TokenDescriptor } from "../lib/tokenRegistry";
import { useGetIcpPrice } from "./useQueries";
import { usableBtcUsdE8, useBtcUsdRate } from "./useWallet";

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

const TTTI_PRICE_KEY = ["icpswapTttiPrice"] as const;

/** Ledger and USD rates needed to turn an ICPSwap TTTI-T pair into a USD price. */
function usePriceInputs() {
  const { data: ledger } = useTttiLedgerId();
  const { data: icpPrice } = useGetIcpPrice();
  const { data: btcRate } = useBtcUsdRate();
  const icpUsdE8 =
    icpPrice?.usable && icpPrice.usdE8 > 0n ? icpPrice.usdE8 : null;
  const btcUsdE8 = usableBtcUsdE8(btcRate, Date.now());
  return { ledger, icpUsdE8, btcUsdE8 };
}

/**
 * Read the price from ICPSwap and store it. A failed read keeps the last
 * stored price (if any) so the wallet is not left without a value.
 */
async function readAndStore(
  ledger: string,
  icpUsdE8: bigint | null,
  btcUsdE8: bigint | null,
): Promise<TttiPriceReading | null> {
  const usdE8 = await readIcpswapTttiUsdE8(ledger, icpUsdE8, btcUsdE8);
  if (usdE8 === null) return loadCachedTttiPrice();
  const reading = { usdE8, readAt: Date.now() };
  storeTttiPrice(reading);
  return reading;
}

/**
 * TTTI-T price used to value the wallet: the browser cache while it is under
 * 24 hours old (no ICPSwap call), otherwise a fresh ICPSwap read.
 */
export function useIcpswapTttiPrice() {
  const { ledger, icpUsdE8, btcUsdE8 } = usePriceInputs();
  const hasRate = icpUsdE8 !== null || btcUsdE8 !== null;
  return useQuery<TttiPriceReading | null>({
    queryKey: TTTI_PRICE_KEY,
    queryFn: () => {
      const cached = loadCachedTttiPrice();
      if (isPriceFresh(cached) || !ledger) return cached;
      return readAndStore(ledger, icpUsdE8, btcUsdE8);
    },
    enabled: !!ledger && (hasRate || isPriceFresh(loadCachedTttiPrice())),
    staleTime: 60_000,
    retry: false,
  });
}

/** Re-read the price from ICPSwap right now, whatever the age of the cache. */
export function useRefreshIcpswapTttiPrice() {
  const queryClient = useQueryClient();
  const { ledger, icpUsdE8, btcUsdE8 } = usePriceInputs();
  return useMutation<TttiPriceReading | null>({
    mutationFn: () => {
      if (!ledger) throw new Error("No TTTI-T ledger");
      return readAndStore(ledger, icpUsdE8, btcUsdE8);
    },
    onSuccess: (reading) => queryClient.setQueryData(TTTI_PRICE_KEY, reading),
  });
}
