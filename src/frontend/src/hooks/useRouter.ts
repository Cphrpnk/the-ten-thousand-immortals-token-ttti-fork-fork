import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RoutedQuoteArgs,
  RoutedSwap,
  RoutedSwapArgs,
  RouterFeeView,
  backendInterface,
} from "../backend";
import { useActor } from "./useActor";
import { useInvalidateLiquidity } from "./useDex";
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
    refetchInterval: 15_000,
  });
}

/** Routed swap along the quoted route. */
export function useRoutedSwap() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLiquidity();
  return useMutation<RoutedSwapOutcome, Error, RoutedSwapArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      return actor.routedSwap(args);
    },
    onSettled: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ["quoteRoutedSwap"] });
      void queryClient.invalidateQueries({ queryKey: ROUTER_KEYS.adminSwaps });
      void queryClient.invalidateQueries({ queryKey: ROUTER_KEYS.adminFees });
      void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
    },
  });
}

/** Admin: every routed swap, as recorded by the router. */
export function useAdminRoutedSwaps() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<Array<RoutedSwap>>({
    queryKey: ROUTER_KEYS.adminSwaps,
    queryFn: async () => {
      if (!actor) return [];
      const res = await actor.adminListRoutedSwaps();
      if (res.__kind__ === "err") throw new Error("Not authorized");
      return res.ok;
    },
    enabled: !!actor && !isFetching && isAdmin === true,
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
