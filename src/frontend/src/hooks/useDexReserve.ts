import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReservePhase } from "../backend";
import type {
  AccountMismatch,
  AccountResult,
  DexPauseView,
  DexReserveError,
  DexReserveStatus,
  ExcludedRereadProgress,
  Mismatch,
  PublicDexPause,
  ReserveAlert,
  ReserveCheck,
  ReserveCheckView,
  ReserveProgress,
  TokenReserveResult,
} from "../backend";
import { useActor } from "./useActor";
import { useIsCallerAdmin } from "./useQueries";
import { UPGRADE_READINESS_KEY } from "./useUpgradeReadiness";

export type {
  AccountMismatch,
  AccountResult,
  DexPauseView,
  DexReserveError,
  DexReserveStatus,
  ExcludedRereadProgress,
  Mismatch,
  PublicDexPause,
  ReserveAlert,
  ReserveCheck,
  ReserveCheckView,
  ReserveProgress,
  TokenReserveResult,
};

/** React Query keys of the DEX reserve check and pause status. */
export const DEX_RESERVE_KEYS = {
  status: ["dexReserveStatus"],
  publicPause: ["dexPauseStatus"],
} as const;

/** Refresh interval of the reserve status while a check is running. */
const RESERVE_PROGRESS_REFRESH_MS = 10_000;

/** English text of every DexReserveError variant. */
export const DEX_RESERVE_ERROR_TEXT = {
  unauthorized: "Refused: only the admin can run or resume the reserve check.",
  checkInProgress: "A reserve check is already running. Try again shortly.",
  notPaused: "Refused: the DEX is not paused.",
  checkFailed: (message: string) => `The reserve check failed: ${message}`,
} as const;

export function dexReserveErrorMessage(error: DexReserveError): string {
  switch (error.__kind__) {
    case "unauthorized":
      return DEX_RESERVE_ERROR_TEXT.unauthorized;
    case "checkInProgress":
      return DEX_RESERVE_ERROR_TEXT.checkInProgress;
    case "notPaused":
      return DEX_RESERVE_ERROR_TEXT.notPaused;
    case "checkFailed":
      return DEX_RESERVE_ERROR_TEXT.checkFailed(error.checkFailed);
  }
}

/**
 * Admin: last reserve check, unresolved shortfalls, pause and mismatch history,
 * the batch progress, and the visible `alert` (shown when a check compared no
 * account or fewer than expected) exactly as returned by the backend.
 */
export function useDexReserveStatus() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<DexReserveStatus>({
    queryKey: DEX_RESERVE_KEYS.status,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getDexReserveStatus();
      if (result.__kind__ === "err") {
        throw new Error(dexReserveErrorMessage(result.err));
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin === true,
    refetchInterval: (query) => {
      const status = query.state.data;
      return status?.checkInProgress ||
        status?.progress.phase === ReservePhase.inProgress ||
        status?.excludedReread.active
        ? RESERVE_PROGRESS_REFRESH_MS
        : false;
    },
  });
}

/** Public: whether the DEX is paused and the token that caused the pause. */
export function usePublicDexPause() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicDexPause>({
    queryKey: DEX_RESERVE_KEYS.publicPause,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexPauseStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

function useInvalidateReserve() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_RESERVE_KEYS.status });
    void queryClient.invalidateQueries({
      queryKey: DEX_RESERVE_KEYS.publicPause,
    });
    void queryClient.invalidateQueries({ queryKey: UPGRADE_READINESS_KEY });
  };
}

/** Admin: compares the internal DEX totals with the ledgers; may pause the DEX. */
export function useRunDexReserveCheck() {
  const { actor } = useActor();
  const invalidate = useInvalidateReserve();
  return useMutation<ReserveCheckView, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.runDexReserveCheck();
      if (result.__kind__ === "err") {
        throw new Error(dexReserveErrorMessage(result.err));
      }
      return result.ok;
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/** Admin: resumes the DEX after a pause; refused while a shortfall remains. */
export function useResumeDex() {
  const { actor } = useActor();
  const invalidate = useInvalidateReserve();
  return useMutation<DexPauseView, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.resumeDex();
      if (result.__kind__ === "err") {
        throw new Error(dexReserveErrorMessage(result.err));
      }
      return result.ok;
    },
    onSettled: () => {
      invalidate();
    },
  });
}
