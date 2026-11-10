import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  LiquidityMintError,
  MintPoolList,
  MintPoolOption,
  MintPricePreview,
  PayToken,
  PaymentToMint,
  RemainderChoice,
  TttiToPay,
} from "../backend";
import { useActor } from "./useActor";

/** Result of a mint amount query: the backend's answer or its refusal. */
export type MintQueryResult<T> =
  | { __kind__: "ok"; ok: T }
  | { __kind__: "err"; err: LiquidityMintError };

/** Cache key part of the chosen pool. */
export function poolKey(poolId: bigint | null): string {
  return poolId === null ? "none" : poolId.toString();
}

/**
 * Mint price preview (public query): cost per 100 USD for the mint and the
 * prepaid redemption, price per TTTI-T, minimums and the per-token figures.
 */
export function useMintPricePreview() {
  const { actor, isFetching } = useActor();

  return useQuery<MintPricePreview>({
    queryKey: ["mintPricePreview"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMintPricePreview();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

/**
 * TTTI-T received for a total payment in a pay token and a remainder choice
 * (public query). Disabled without a positive amount.
 */
export function useMintAmountForPayment(
  token: PayToken,
  payAmount: bigint | null,
  choice: RemainderChoice,
  poolId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery<MintQueryResult<PaymentToMint>>({
    queryKey: [
      "mintAmountForPayment",
      token,
      choice,
      poolKey(poolId),
      payAmount === null ? "none" : payAmount.toString(),
    ],
    queryFn: async () => {
      if (!actor || payAmount === null || poolId === null) {
        throw new Error("Actor not available");
      }
      return actor.getMintAmountForPayment({
        token,
        payAmount,
        choice,
        targetPoolId: poolId,
      });
    },
    enabled:
      !!actor &&
      !isFetching &&
      poolId !== null &&
      payAmount !== null &&
      payAmount > 0n,
    staleTime: 10_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

/**
 * Total payment in a pay token for a TTTI-T quantity in base units and a
 * remainder choice (public query). Disabled without a positive quantity.
 */
export function usePayAmountForTtti(
  token: PayToken,
  tttiAmount: bigint | null,
  choice: RemainderChoice,
  poolId: bigint | null,
) {
  const { actor, isFetching } = useActor();

  return useQuery<MintQueryResult<TttiToPay>>({
    queryKey: [
      "payAmountForTtti",
      token,
      choice,
      poolKey(poolId),
      tttiAmount === null ? "none" : tttiAmount.toString(),
    ],
    queryFn: async () => {
      if (!actor || tttiAmount === null || poolId === null) {
        throw new Error("Actor not available");
      }
      return actor.getPayAmountForTtti({
        token,
        tttiAmount,
        choice,
        targetPoolId: poolId,
      });
    },
    enabled:
      !!actor &&
      !isFetching &&
      poolId !== null &&
      tttiAmount !== null &&
      tttiAmount > 0n,
    staleTime: 10_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}

/**
 * Pools that can take a mint paid in a token, with the backend's
 * recommendation (public query).
 */
export function useMintPools(token: PayToken, enabled = true) {
  const { actor, isFetching } = useActor();

  return useQuery<MintPoolList>({
    queryKey: ["mintPools", token],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listMintPools(token);
    },
    enabled: enabled && !!actor && !isFetching,
    staleTime: 10_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}

/** The pool a mint goes to, and where that choice comes from. */
export interface MintPoolSelection {
  /** Pools of the pay token as last returned by the backend. */
  pools: ReadonlyArray<MintPoolOption>;
  /** Pool of the backend recommendation, null when it names none. */
  recommendedPoolId: bigint | null;
  /** Pool every mint request targets, null until the list is known. */
  selectedPoolId: bigint | null;
  /** True once the user picked a pool for this token. */
  manual: boolean;
  /** True when a picked pool left the list and the recommendation took over. */
  fellBack: boolean;
  isLoading: boolean;
  isError: boolean;
  /** True when the list is known and holds no pool. */
  noPool: boolean;
  choose: (poolId: bigint) => void;
  retry: () => void;
}

/**
 * Pool choice for the mint page. The backend recommendation is preselected on
 * arrival and on every pay token change; a manual pick is kept through list
 * refreshes and only given up when its pool leaves the list.
 */
export function useMintPoolSelection(
  token: PayToken,
  enabled = true,
): MintPoolSelection {
  const query = useMintPools(token, enabled);
  const [picked, setPicked] = useState<{
    token: PayToken;
    poolId: bigint;
  } | null>(null);
  const [fellBackFor, setFellBackFor] = useState<PayToken | null>(null);

  const list = query.data?.token === token ? query.data : undefined;
  const pools = list?.pools ?? [];
  const pick = picked?.token === token ? picked.poolId : null;
  const pickStillListed = pick !== null && pools.some((p) => p.poolId === pick);

  const listedRecommended = list?.recommendedPoolId;
  const recommendedPoolId =
    listedRecommended ??
    pools.find((p) => p.recommended)?.poolId ??
    (pools.length === 1 ? (pools[0]?.poolId ?? null) : null);
  const selectedPoolId = pickStillListed ? pick : recommendedPoolId;

  // A pool picked earlier is gone from the refreshed list: back to the
  // recommendation, with a notice. A pick made for another token is dropped.
  useEffect(() => {
    if (picked === null) return;
    if (picked.token !== token) {
      setPicked(null);
      return;
    }
    if (list && !list.pools.some((p) => p.poolId === picked.poolId)) {
      setPicked(null);
      setFellBackFor(token);
    }
  }, [picked, token, list]);

  const { refetch } = query;
  return {
    pools,
    recommendedPoolId,
    selectedPoolId,
    manual: pickStillListed,
    fellBack: fellBackFor === token && !pickStillListed,
    isLoading: enabled && !list && !query.isError,
    isError: !list && query.isError,
    noPool: !!list && list.pools.length === 0,
    choose: (poolId) => {
      setPicked({ token, poolId });
      setFellBackFor(null);
    },
    retry: () => {
      void refetch();
    },
  };
}
