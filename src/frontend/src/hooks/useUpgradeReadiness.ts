import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ReconcileError,
  type ReservedReconciliation,
  type UpgradeReadiness,
} from "../backend";
import { useActor } from "./useActor";

const READINESS_KEY = ["upgradeReadiness"];

/** Admin-only upgrade checklist read from getUpgradeReadiness. */
export function useUpgradeReadiness() {
  const { actor, isFetching } = useActor();
  return useQuery<UpgradeReadiness>({
    queryKey: READINESS_KEY,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUpgradeReadiness();
    },
    enabled: !!actor && !isFetching,
  });
}

/** English reason for every ReconcileError variant. */
export function reconcileErrorMessage(error: ReconcileError): string {
  switch (error) {
    case ReconcileError.notAdmin:
      return "Refused: only the admin can reconcile reserved.";
    case ReconcileError.notPaused:
      return "Refused: sales are not paused. Stop sales first.";
    case ReconcileError.purchaseInFlight:
      return "Refused: a purchase is in flight. Wait until it finishes.";
    case ReconcileError.openTraces:
      return "Refused: open purchase traces remain. Resolve them first.";
  }
}

/** Resets sale.reserved to 0; throws the English refusal reason on #err. */
export function useReconcileReserved() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ReservedReconciliation, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.reconcileReserved();
      if (result.__kind__ === "err") {
        throw new Error(reconcileErrorMessage(result.err));
      }
      return result.ok;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: READINESS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["saleStatus"] });
    },
  });
}
