import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Account,
  FeeAccountView,
  HistoryPage,
  ReceivingWalletView,
  TokenSettlementView,
} from "../backend";
import type { HistoryFilter, HistoryToken, PayToken } from "../backend";
import { useActor } from "./useActor";
import { treasuryErrorMessage, useAdminGate } from "./useQueries";

export const ADMIN_TREASURY_KEYS = {
  receivingWallets: ["receivingWallets"] as const,
  settlementStatus: ["settlementStatus"] as const,
  mintFeeAccount: ["mintFeeAccount"] as const,
  adminHistory: ["adminHistory"] as const,
};

/** History page size. */
export const HISTORY_PAGE_SIZE = 25;

/** Configured receiving wallet of each pay token (admin). */
export function useReceivingWallets() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();
  return useQuery<ReceivingWalletView[]>({
    queryKey: ADMIN_TREASURY_KEYS.receivingWallets,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getReceivingWallets();
      if (result.__kind__ === "err") {
        throw new Error(treasuryErrorMessage(result.err));
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Set or change the receiving wallet of a pay token (admin). */
export function useSetReceivingWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    ReceivingWalletView,
    Error,
    { token: PayToken; account: Account }
  >({
    mutationFn: async ({ token, account }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.setReceivingWallet(token, account);
      if (result.__kind__ === "err") {
        throw new Error(treasuryErrorMessage(result.err));
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADMIN_TREASURY_KEYS.receivingWallets,
      });
      void queryClient.invalidateQueries({
        queryKey: ADMIN_TREASURY_KEYS.settlementStatus,
      });
      void queryClient.invalidateQueries({
        queryKey: ADMIN_TREASURY_KEYS.adminHistory,
      });
    },
  });
}

/** One-time settlement of the accumulated revenue, per pay token (admin). */
export function useSettlementStatus() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();
  return useQuery<TokenSettlementView[]>({
    queryKey: ADMIN_TREASURY_KEYS.settlementStatus,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getSettlementStatus();
      if (result.__kind__ === "err") {
        throw new Error(treasuryErrorMessage(result.err));
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 30_000,
  });
}

/** Dedicated, non-withdrawable mint fee account (admin, read-only). */
export function useMintFeeAccount() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();
  return useQuery<FeeAccountView>({
    queryKey: ADMIN_TREASURY_KEYS.mintFeeAccount,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getMintFeeAccount();
      if (result.__kind__ === "err") {
        throw new Error(treasuryErrorMessage(result.err));
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Unified admin history, newest first, one page at a time. */
export function useAdminHistory(
  filter: HistoryFilter,
  token: HistoryToken | null,
  page: number,
) {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();
  return useQuery<HistoryPage>({
    queryKey: [...ADMIN_TREASURY_KEYS.adminHistory, filter, token, page],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.listAdminHistory(
        filter,
        token,
        BigInt(page * HISTORY_PAGE_SIZE),
        BigInt(HISTORY_PAGE_SIZE),
      );
      if (result.__kind__ === "err") {
        throw new Error("Only an administrator can read the history.");
      }
      return result.ok;
    },
    enabled: !!actor && !isFetching && isAdmin,
    placeholderData: keepPreviousData,
  });
}
