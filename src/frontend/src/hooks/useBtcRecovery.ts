import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BtcMintDiagnosis, FinishMintResult } from "../backend";
import { useActor } from "./useActor";

/** Read-only report on a stuck ckBTC deposit (admin only). */
export function useDiagnoseBtcMint() {
  const { actor } = useActor();
  return useMutation<BtcMintDiagnosis, Error, string>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.diagnoseBtcMint(input);
    },
  });
}

export interface FinishBtcMintInput {
  input: string;
  refund: boolean;
}

/** Finish the TTTI-T mint of a ckBTC deposit, or refund the ckBTC to the buyer. */
export function useFinishBtcMint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<FinishMintResult, Error, FinishBtcMintInput>({
    mutationFn: async ({ input, refund }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.finishBtcMint(input, refund);
    },
    onSuccess: () => {
      for (const key of [
        "transfersToReview",
        "adminHistory",
        "conversions",
        "btcDepositInfo",
        "myBtcDeposits",
        "btcWalletDepositsFor",
        "walletBtcDeposits",
      ]) {
        void queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}
