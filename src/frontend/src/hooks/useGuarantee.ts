import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  GuaranteeAccountView,
  GuaranteeMassView,
  PayToken,
  RedeemQuote,
  Redemption,
  RedemptionFee,
  UnclaimedMassTotal,
} from "../backend";
import { GuaranteeFailure } from "../lib/guarantee";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { useIsCallerAdmin } from "./useQueries";

/** Refresh everything a redemption or an excess withdrawal can change. */
function invalidateGuarantee(queryClient: QueryClient) {
  for (const key of [
    "myGuaranteeMasses",
    "myRedemptions",
    "unclaimedMassTotal",
    "guaranteeAccounts",
    "guaranteeQuote",
    "redemptionFees",
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

/** The caller's personal masses, one per payment token that has a mint. */
export function useGuaranteeMasses() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<Array<GuaranteeMassView>, Error>({
    queryKey: ["myGuaranteeMasses", caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyGuaranteeMasses();
    },
    enabled: !!actor && !isFetching && !!caller,
  });
}

/**
 * Quote of the return of `tttiAmount` TTTI-T from the mass of `token`.
 * Rejects with a GuaranteeFailure when the backend refuses; refreshed every
 * minute.
 */
export function useGuaranteeQuote(
  token: PayToken | undefined,
  tttiAmount: bigint | null,
) {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<RedeemQuote, Error>({
    queryKey: ["guaranteeQuote", caller, token, tttiAmount?.toString()],
    queryFn: async () => {
      if (!actor || !token || tttiAmount === null) {
        throw new Error("Actor not available");
      }
      const result = await actor.quoteGuaranteeRedeem(token, tttiAmount);
      if (result.__kind__ === "err") throw new GuaranteeFailure(result.err);
      return result.ok;
    },
    enabled:
      !!actor && !isFetching && !!caller && !!token && tttiAmount !== null,
    refetchInterval: 60_000,
    retry: (count, error) => !(error instanceof GuaranteeFailure) && count < 2,
  });
}

/** The caller's redemptions and excess withdrawals. */
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

/** Public total of the masses not yet claimed; no sign-in needed. */
export function useUnclaimedMassTotal() {
  const { actor, isFetching } = useActor();

  return useQuery<UnclaimedMassTotal, Error>({
    queryKey: ["unclaimedMassTotal"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUnclaimedMassTotal();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public: per token, the sum of all masses and the guarantee account balance. */
export function useGuaranteeAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<GuaranteeAccountView>, Error>({
    queryKey: ["guaranteeAccounts"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGuaranteeAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface RedeemGuaranteeParams {
  token: PayToken;
  /** TTTI-T to return, in base units. */
  tttiAmount: bigint;
  /** Net amount shown in the preview; the backend refuses a lower one. */
  expectedNetAmount: bigint;
}

/**
 * Return TTTI-T against the guarantee. Resolves with the recorded
 * Redemption; rejects with a GuaranteeFailure when the backend refuses.
 */
export function useRedeemGuarantee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Redemption, Error, RedeemGuaranteeParams>({
    mutationFn: async ({ token, tttiAmount, expectedNetAmount }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.redeemGuarantee(
        token,
        tttiAmount,
        expectedNetAmount,
      );
      if (result.__kind__ === "err") throw new GuaranteeFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateGuarantee(queryClient);
    },
  });
}

/**
 * Withdraw the excess of a mass once the mint has ended. Rejects with a
 * GuaranteeFailure when the backend refuses.
 */
export function useWithdrawGuaranteeExcess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Redemption, Error, PayToken>({
    mutationFn: async (token) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.withdrawGuaranteeExcess(token);
      if (result.__kind__ === "err") throw new GuaranteeFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateGuarantee(queryClient);
    },
  });
}

/** Redemption fees set aside for the creator (admin-only endpoint). */
export function useRedemptionFees(offset = 0n, limit = 100n) {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<RedemptionFee>, Error>({
    queryKey: ["redemptionFees", offset.toString(), limit.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listRedemptionFees(offset, limit);
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}
