import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Variant_alreadyRunning_notAdmin } from "../backend";
import type { SweepProgress, SweepTransferView, TokenState } from "../backend";
import { useActor } from "./useActor";
import { type PagedList, usePagedList } from "./usePagedList";
import { useIsCallerAdmin } from "./useQueries";

export type {
  SweepProgress,
  SweepTokenProgressView,
  SweepTransferView,
  TokenState,
} from "../backend";

/** React Query keys of the DEX legacy-account sweep. */
export const DEX_SWEEP_KEYS = {
  state: ["dexSweepState"],
  transfers: ["dexSweepTransfers"],
  progress: ["dexSweepProgress"],
} as const;

/** Refresh interval of the sweep progress while a sweep is running. */
const SWEEP_PROGRESS_REFRESH_MS = 10_000;

/** English text of the sweep refusals. */
export const DEX_SWEEP_ERROR_TEXT = {
  alreadyRunning: "A sweep is already running. Try again shortly.",
  notAdmin: "Refused: only the admin can run the sweep.",
  historyNotAdmin: "Refused: only the admin can resend sweep transfers.",
} as const;

/** Admin: per-token sweep state, including the custody versus owed comparison. */
export function useDexSweepState() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<Array<TokenState>>({
    queryKey: DEX_SWEEP_KEYS.state,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexSweepState();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

const sweepTransferKey = (transfer: SweepTransferView): string =>
  transfer.n.toString();

/** Admin: the sweep transfers recorded so far, with their status, one page at a time. */
export function useDexSweepTransfers(): PagedList<SweepTransferView> {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return usePagedList<SweepTransferView>({
    queryKey: DEX_SWEEP_KEYS.transfers,
    enabled: !!actor && !isFetching && isAdmin === true,
    getKey: sweepTransferKey,
    fetchPage: async (cursor, limit) => {
      if (!actor) throw new Error("Actor not available");
      return actor.listDexSweepTransfers(cursor, limit);
    },
  });
}

/** Admin: batch progress of the running (or last) sweep, refreshed while active. */
export function useDexSweepProgress() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<SweepProgress>({
    queryKey: DEX_SWEEP_KEYS.progress,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexSweepProgress();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
    refetchInterval: (query) =>
      query.state.data?.active ? SWEEP_PROGRESS_REFRESH_MS : false,
  });
}

function useInvalidateSweep() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_SWEEP_KEYS.state });
    void queryClient.invalidateQueries({ queryKey: DEX_SWEEP_KEYS.transfers });
    void queryClient.invalidateQueries({ queryKey: DEX_SWEEP_KEYS.progress });
    void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
  };
}

/** Admin: moves the balance of the legacy accounts to the custody accounts. */
export function useRunDexSweep() {
  const { actor } = useActor();
  const invalidate = useInvalidateSweep();
  return useMutation<Array<TokenState>, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.runDexSweep();
      if (result.__kind__ === "err") {
        throw new Error(
          result.err === Variant_alreadyRunning_notAdmin.alreadyRunning
            ? DEX_SWEEP_ERROR_TEXT.alreadyRunning
            : DEX_SWEEP_ERROR_TEXT.notAdmin,
        );
      }
      return result.ok;
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/** Admin: resends the unsettled sweep transfers unchanged. */
export function useResendDexSweepTransfers() {
  const { actor } = useActor();
  const invalidate = useInvalidateSweep();
  return useMutation<Array<TokenState>, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.resendDexSweepTransfers();
      if (result.__kind__ === "err") {
        throw new Error(DEX_SWEEP_ERROR_TEXT.historyNotAdmin);
      }
      return result.ok;
    },
    onSettled: () => {
      invalidate();
    },
  });
}
