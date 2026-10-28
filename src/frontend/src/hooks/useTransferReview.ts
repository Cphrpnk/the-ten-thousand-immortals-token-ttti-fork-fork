import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TransferKind } from "../backend";
import type { Buyback, ReviewResult, TransferReview } from "../backend";
import { BuybackFailure } from "../lib/buyback";
import { useActor } from "./useActor";
import { useIsCallerAdmin } from "./useQueries";

/** Transfers whose outcome is unknown after 23 h (admin only). */
export function useTransfersToReview() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<TransferReview>>({
    queryKey: ["transfersToReview"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listTransfersToReview();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

function useInvalidateReview() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
    void queryClient.invalidateQueries({ queryKey: ["conversions"] });
    void queryClient.invalidateQueries({ queryKey: ["cyclesStatus"] });
    void queryClient.invalidateQueries({ queryKey: ["allBuybacks"] });
    void queryClient.invalidateQueries({ queryKey: ["myBuybacks"] });
    void queryClient.invalidateQueries({ queryKey: ["allBuybackMasses"] });
    void queryClient.invalidateQueries({ queryKey: ["myBuybackMasses"] });
    void queryClient.invalidateQueries({ queryKey: ["dexBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["dexTransfers"] });
    void queryClient.invalidateQueries({ queryKey: ["pairRequests"] });
    void queryClient.invalidateQueries({ queryKey: ["dcBatches"] });
    void queryClient.invalidateQueries({ queryKey: ["myLpBonus"] });
    void queryClient.invalidateQueries({ queryKey: ["cyclesAutonomy"] });
  };
}

/**
 * DEX lot 4 review kinds, both ICP sends of the protocol fees:
 * DC = converted fees sent to the cycles reserve (id = DC send n, memo TTTI-DC-<n>);
 * DL = an LP bonus claim paid to the LP (id = claim n, memo TTTI-DL-<n>).
 * Arrived records the block; Not arrived opens a new attempt; no manual refund.
 */
export const PROTOCOL_FEE_REVIEW_KINDS: ReadonlyArray<TransferKind> = [
  TransferKind.DC,
  TransferKind.DL,
];

export function isProtocolFeeReviewKind(kind: TransferKind): boolean {
  return kind === TransferKind.DC || kind === TransferKind.DL;
}

export interface MarkBuybackCancelledInput {
  buybackId: bigint;
  /** TTTI-T ledger block of the TTTI-T returned by hand. */
  block: bigint;
}

/**
 * Admin: record a legacy #payoutFailed buyback as cancelled with the block of
 * the TTTI-T returned by hand. Rejects with a BuybackFailure on a refusal.
 */
export function useMarkBuybackCancelled() {
  const { actor } = useActor();
  const invalidate = useInvalidateReview();
  return useMutation<Buyback, Error, MarkBuybackCancelledInput>({
    mutationFn: async ({ buybackId, block }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.markBuybackCancelled(buybackId, block);
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidate();
    },
  });
}

export interface MarkArrivedInput {
  kind: TransferKind;
  purchaseId: bigint;
  block: bigint;
}

/** Record that a transfer under review arrived, with its ledger block. */
export function useMarkTransferArrived() {
  const { actor } = useActor();
  const invalidate = useInvalidateReview();
  return useMutation<ReviewResult, Error, MarkArrivedInput>({
    mutationFn: async ({ kind, purchaseId, block }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markTransferArrived(kind, purchaseId, block);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/**
 * Record that a refund (RF), a payment to refund (PC) or a delivery-failure
 * cost (BM) was refunded by hand, with its ledger block; the item leaves the list.
 */
export function useMarkRefundedManually() {
  const { actor } = useActor();
  const invalidate = useInvalidateReview();
  return useMutation<ReviewResult, Error, MarkArrivedInput>({
    mutationFn: async ({ kind, purchaseId, block }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markRefundedManually(kind, purchaseId, block);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export interface MarkNotArrivedInput {
  kind: TransferKind;
  purchaseId: bigint;
}

/** Record that a transfer under review did not arrive: a new attempt opens. */
export function useMarkTransferNotArrived() {
  const { actor } = useActor();
  const invalidate = useInvalidateReview();
  return useMutation<ReviewResult, Error, MarkNotArrivedInput>({
    mutationFn: async ({ kind, purchaseId }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.markTransferNotArrived(kind, purchaseId);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
