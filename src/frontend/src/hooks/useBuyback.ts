import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Account,
  Buyback,
  BuybackFunding,
  BuybackMass,
  BuybackQuote,
  PayToken,
} from "../backend";
import { BuybackFailure } from "../lib/buyback";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { useIsCallerAdmin } from "./useQueries";

/** Refresh everything a buyback request or payout retry can change. */
function invalidateBuyback(queryClient: QueryClient) {
  for (const key of [
    "myBuybacks",
    "allBuybacks",
    "myBuybackMasses",
    "allBuybackMasses",
    "buybackQuote",
    "buybackFunding",
    "myConversions",
    "conversions",
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

/**
 * The caller's average masses, one per payment token. Rejects with a
 * BuybackFailure when the backend refuses.
 */
export function useBuybackMasses() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<Array<BuybackMass>, Error>({
    queryKey: ["myBuybackMasses", caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.listMyBuybackMasses();
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!caller,
  });
}

/**
 * Quote of a buyback of `percent` % of a mass remainder, returned in
 * `receiveToken`. Rejects with a BuybackFailure when the backend refuses;
 * refreshed every minute.
 */
export function useBuybackQuote(
  massToken: PayToken | undefined,
  percent: number | null,
  receiveToken: PayToken | undefined,
) {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<BuybackQuote, Error>({
    queryKey: ["buybackQuote", caller, massToken, percent, receiveToken],
    queryFn: async () => {
      if (!actor || !massToken || percent === null || !receiveToken) {
        throw new Error("Actor not available");
      }
      const result = await actor.quoteBuyback(
        massToken,
        BigInt(percent),
        receiveToken,
      );
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    enabled:
      !!actor &&
      !isFetching &&
      !!caller &&
      !!massToken &&
      percent !== null &&
      !!receiveToken,
    refetchInterval: 60_000,
    retry: (count, error) => !(error instanceof BuybackFailure) && count < 2,
  });
}

/** The caller's buybacks. Rejects with a BuybackFailure on a backend refusal. */
export function useMyBuybacks() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();

  return useQuery<Array<Buyback>, Error>({
    queryKey: ["myBuybacks", caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.listMyBuybacks();
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!caller,
  });
}

export interface RequestBuybackParams {
  massToken: PayToken;
  /** Percentage of the mass remainder, 1 to 100. */
  percent: number;
  receiveToken: PayToken;
  /** Subaccount holding the TTTI-T; null for the default account. */
  fromSubaccount?: Uint8Array | null;
}

/**
 * Request the buyback of a share of a mass. Resolves with the recorded
 * Buyback; rejects with a BuybackFailure when the backend refuses.
 */
export function useRequestBuyback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Buyback, Error, RequestBuybackParams>({
    mutationFn: async ({
      massToken,
      percent,
      receiveToken,
      fromSubaccount,
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.requestBuyback(
        massToken,
        BigInt(percent),
        receiveToken,
        fromSubaccount ?? null,
      );
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateBuyback(queryClient);
    },
  });
}

/**
 * Retry the failed payout of a buyback, by buyback id. Rejects with a
 * BuybackFailure on a backend refusal.
 */
export function useRetryBuybackPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Buyback, Error, bigint>({
    mutationFn: async (buybackId) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.retryBuybackPayout(buybackId);
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateBuyback(queryClient);
    },
  });
}

/**
 * Cancel a buyback whose every payout attempt got a known Err (buyer or
 * admin): the escrowed TTTI-T are returned. Rejects with a BuybackFailure on
 * a backend refusal.
 */
export function useCancelBuyback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<Buyback, Error, bigint>({
    mutationFn: async (buybackId) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.cancelBuyback(buybackId);
      if (result.__kind__ === "err") throw new BuybackFailure(result.err);
      return result.ok;
    },
    onSettled: () => {
      invalidateBuyback(queryClient);
    },
  });
}

// --- Admin ---------------------------------------------------------------

/** Every buyback (admin-only endpoint; never called for non-admins). */
export function useAllBuybacks() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<Buyback>>({
    queryKey: ["allBuybacks"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listAllBuybacks();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

/** Every buyer's masses (admin-only endpoint; never called for non-admins). */
export function useAllBuybackMasses() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<BuybackMass>>({
    queryKey: ["allBuybackMasses"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listAllBuybackMasses();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

/** Admin account that funds buybacks and receives the TTTI-T bought back. */
export function useBuybackAdminAccount() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Account | null>({
    queryKey: ["buybackAdminAccount"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBuybackAdminAccount();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

export function useSetBuybackAdminAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, Account>({
    mutationFn: async (account) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setBuybackAdminAccount(account);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["buybackAdminAccount"],
      });
      void queryClient.invalidateQueries({ queryKey: ["buybackFunding"] });
      void queryClient.invalidateQueries({ queryKey: ["buybackQuote"] });
    },
  });
}

/** Admin allowance, expiry and balance per returnable token (update call). */
export function useBuybackFunding() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();

  return useQuery<Array<BuybackFunding>>({
    queryKey: ["buybackFunding"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBuybackFunding();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
    staleTime: 30_000,
  });
}
