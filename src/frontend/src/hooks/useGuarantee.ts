import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { RedeemQuote, Redemption, ReserveView } from "../backend";
import { GuaranteeFailure } from "../lib/guarantee";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

/** Refresh everything a redemption can change. */
function invalidateGuarantee(queryClient: QueryClient) {
  for (const key of [
    "myRedemptions",
    "reserveView",
    "guaranteeQuote",
    "icrc1BalanceOf",
    "walletBalance",
    "icrc2Allowance",
    "contactAllowance",
    "icrc3GetBlocks",
    "icrc3GetTipCertificate",
    "tokenInfo",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

function useCallerText(): string | undefined {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  return principal && !principal.isAnonymous() ? principal.toText() : undefined;
}

/** Public: the common reserve, the circulation outside the contract and the invariant. */
export function useReserveView() {
  const { actor, isFetching } = useActor();

  return useQuery<ReserveView, Error>({
    queryKey: ["reserveView"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getReserveView();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

/**
 * Quote of the return of `tttiAmount` TTTI-T against the common reserve.
 * Rejects with a GuaranteeFailure when the backend refuses; refreshed every
 * minute.
 */
export function useGuaranteeQuote(tttiAmount: bigint | null) {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<RedeemQuote, Error>({
    queryKey: ["guaranteeQuote", caller, tttiAmount?.toString()],
    queryFn: async () => {
      if (!actor || tttiAmount === null) {
        throw new Error("Actor not available");
      }
      const result = await actor.quoteGuaranteeRedeem(tttiAmount);
      if (result.__kind__ === "err") throw new GuaranteeFailure(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!caller && tttiAmount !== null,
    refetchInterval: 60_000,
    retry: (count, error) => !(error instanceof GuaranteeFailure) && count < 2,
  });
}

/** The caller's redemptions. */
export function useMyRedemptions() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<Array<Redemption>, Error>({
    queryKey: ["myRedemptions", caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listMyRedemptions();
    },
    enabled: !!actor && !isFetching && !!caller,
  });
}

export interface RedeemGuaranteeParams {
  /** TTTI-T to return, in base units. */
  tttiAmount: bigint;
  /** Total payout in USD e8 shown in the preview; the backend refuses a lower one. */
  expectedPayoutUsdE8: bigint;
}

/**
 * Return TTTI-T against the common reserve. Resolves with the recorded
 * redemptions (one per reserve token paid); rejects with a GuaranteeFailure
 * when the backend refuses.
 */
export function useRedeemGuarantee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Array<Redemption>, Error, RedeemGuaranteeParams>({
    mutationFn: async ({ tttiAmount, expectedPayoutUsdE8 }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.redeemGuarantee(
        tttiAmount,
        expectedPayoutUsdE8,
      );
      if (result.__kind__ === "err") throw new GuaranteeFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateGuarantee(queryClient);
    },
  });
}
