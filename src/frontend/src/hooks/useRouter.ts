import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RoutedQuoteArgs,
  RoutedSwap,
  RoutedSwapArgs,
  RouterFeeView,
  backendInterface,
} from "../backend";
import { QUOTE_TTL_MS } from "../lib/icpswap";
import { useActor } from "./useActor";
import {
  useDexPullApproval,
  useInvalidateDexFunds,
  useInvalidateLiquidity,
} from "./useDex";
import { useInternetIdentity } from "./useInternetIdentity";
import { type PagedList, usePagedList } from "./usePagedList";
import { useIsCallerAdmin } from "./useQueries";

export type {
  Route,
  RouteError,
  RouteFees,
  RoutedQuote,
  RoutedQuoteArgs,
  RoutedSwap,
  RoutedSwapArgs,
  RoutedSwapResult,
  RoutedSwapStatus,
  RouterFeeView,
} from "../backend";

type Outcome<K extends keyof backendInterface> = Awaited<
  ReturnType<backendInterface[K]>
>;
export type QuoteRoutedSwapOutcome = Outcome<"quoteRoutedSwap">;
export type RoutedSwapOutcome = Outcome<"routedSwap">;

export const ROUTER_KEYS = {
  adminSwaps: ["adminRoutedSwaps"],
  mySwaps: ["myRoutedSwaps"],
  adminFees: ["adminRouterFees"],
} as const;

/** Routed quote (native pool or ICPSwap); pass null while the input is incomplete. */
export function useQuoteRoutedSwap(args: RoutedQuoteArgs | null) {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteRoutedSwapOutcome | null>({
    queryKey: [
      "quoteRoutedSwap",
      args?.tokenIn ?? "",
      args?.tokenOut ?? "",
      args?.amountIn.toString() ?? "",
      args?.slippageBps.toString() ?? "",
    ],
    queryFn: async () => {
      if (!actor || !args) return null;
      return actor.quoteRoutedSwap(args);
    },
    enabled: !!actor && !isFetching && !!args,
    refetchInterval: QUOTE_TTL_MS,
  });
}

/**
 * Routed swap along the quoted route. The amount in minus the DEX balance is
 * approved to the canister automatically, signed by the wallet that holds
 * `owner`.
 */
export function useRoutedSwap(owner?: Principal | null) {
  const { actor, begin, ensureApproved } = useDexPullApproval(owner);
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  return useMutation<RoutedSwapOutcome, Error, RoutedSwapArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      const release = begin();
      try {
        await ensureApproved(actor, [
          { token: args.tokenIn, amount: args.amountIn },
        ]);
        return await actor.routedSwap(args);
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
      invalidateFunds();
      void queryClient.invalidateQueries({ queryKey: ["quoteRoutedSwap"] });
      void queryClient.invalidateQueries({ queryKey: ROUTER_KEYS.adminSwaps });
      void queryClient.invalidateQueries({ queryKey: ROUTER_KEYS.mySwaps });
      void queryClient.invalidateQueries({ queryKey: ROUTER_KEYS.adminFees });
      void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
    },
  });
}

const routedSwapKey = (swap: RoutedSwap): string => swap.id.toString();

/** Admin: every routed swap, as recorded by the router, one page at a time. */
export function useAdminRoutedSwaps(): PagedList<RoutedSwap> {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return usePagedList<RoutedSwap>({
    queryKey: ROUTER_KEYS.adminSwaps,
    enabled: !!actor && !isFetching && isAdmin === true,
    getKey: routedSwapKey,
    fetchPage: async (cursor, limit) => {
      if (!actor) throw new Error("Actor not available");
      const res = await actor.adminListRoutedSwaps(cursor, limit);
      if (res.__kind__ === "err") throw new Error("Not authorized");
      return res.ok;
    },
  });
}

/** The signed-in caller's own routed swaps, one page at a time. */
export function useMyRoutedSwaps(): PagedList<RoutedSwap> {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const callerText =
    principal && !principal.isAnonymous() ? principal.toText() : undefined;
  return usePagedList<RoutedSwap>({
    queryKey: [...ROUTER_KEYS.mySwaps, callerText ?? ""],
    enabled: !!actor && !isFetching && !!callerText,
    getKey: routedSwapKey,
    fetchPage: async (cursor, limit) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyRoutedSwaps(cursor, limit);
    },
  });
}

/** Admin: the 0.1 % protocol fee collected per native pool. */
export function useAdminRouterFees() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<Array<RouterFeeView>>({
    queryKey: ROUTER_KEYS.adminFees,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.adminGetRouterFees();
      if (res.__kind__ === "err") throw new Error("Not authorized");
      return res.ok;
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}
