import { useQuery } from "@tanstack/react-query";
import type {
  ComputationResult,
  DexBalanceBreakdownSnapshot,
  DexIndicatorsSnapshot,
  FeeSharing,
  FeeTotals,
  IndicatorsStatus,
  PoolIndicators,
  TokenBalanceBreakdown,
  TokenProof,
} from "../backend";
import { DexIndicatorsError } from "../backend";
import { useActor } from "./useActor";
import { useIsCallerAdmin } from "./useQueries";

export type {
  ComputationResult,
  DexBalanceBreakdownSnapshot,
  DexIndicatorsSnapshot,
  FeeSharing,
  FeeTotals,
  IndicatorsStatus,
  PoolIndicators,
  TokenBalanceBreakdown,
  TokenProof,
};

export const DEX_INDICATORS_KEYS = {
  snapshot: ["dexIndicators"],
  status: ["dexIndicatorsStatus"],
  balanceBreakdown: ["dexBalanceBreakdown"],
} as const;

const REFETCH_MS = 60_000;

/** Public: last stored indicators snapshot, or null before the first computation. */
export function useDexIndicators() {
  const { actor, isFetching } = useActor();
  return useQuery<DexIndicatorsSnapshot | null>({
    queryKey: DEX_INDICATORS_KEYS.snapshot,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexIndicators();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: REFETCH_MS,
  });
}

/** Public: balance breakdown per token behind the proof of reserves. */
export function useDexBalanceBreakdown() {
  const { actor, isFetching } = useActor();
  return useQuery<DexBalanceBreakdownSnapshot>({
    queryKey: DEX_INDICATORS_KEYS.balanceBreakdown,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexBalanceBreakdown();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: REFETCH_MS,
  });
}

/** Admin: snapshot time, last computation result, last error and last success. */
export function useDexIndicatorsStatus() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<IndicatorsStatus>({
    queryKey: DEX_INDICATORS_KEYS.status,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getDexIndicatorsStatus();
      if (result.__kind__ === "err") {
        throw new Error(
          result.err === DexIndicatorsError.unauthorized
            ? "Refused: only the admin can read the indicators status."
            : "The indicators status could not be read.",
        );
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin === true,
    refetchInterval: REFETCH_MS,
  });
}
