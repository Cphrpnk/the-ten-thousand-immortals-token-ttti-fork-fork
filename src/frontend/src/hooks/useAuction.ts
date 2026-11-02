import { Principal } from "@icp-sdk/core/principal";
import {
  type QueryClient,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  AuctionId,
  AuctionResultView,
  AuctionView,
  BidError,
  BidSettlement,
  ClosedBidView,
  PayToken,
} from "../backend";
import { buildApproveArgs } from "../lib/icpLedger";
import { PAY_TOKENS, ceilDiv } from "../lib/token";
import type { TokenDescriptor } from "../lib/tokenRegistry";
import { useAccountSigner } from "./useAccountSigner";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";
import { useGetCanisterPrincipal } from "./useQueries";

const AUCTION_KEYS = {
  view: "auctionView",
  mine: "myAuctionBids",
  quote: "auctionDepositQuote",
  closed: "closedAuctions",
  result: "auctionResult",
  withdrawable: "myWithdrawable",
} as const;

/** Refresh interval while winners of a closed auction are still pending settlement. */
const SETTLEMENT_REFRESH_MS = 15_000;

function useCallerText(): string | undefined {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  return principal && !principal.isAnonymous() ? principal.toText() : undefined;
}

/** Refresh everything an offer can change. */
function invalidateAfterBid(queryClient: QueryClient) {
  for (const key of [
    AUCTION_KEYS.view,
    AUCTION_KEYS.mine,
    AUCTION_KEYS.withdrawable,
    "icrc1BalanceOf",
    "walletBalance",
    "icrc2Allowance",
    "contactAllowance",
    "icrc3GetBlocks",
    "tokenInfo",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

/** Public state of the auction: lot, closing time, reserve prices. */
export function useAuctionView() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: [AUCTION_KEYS.view],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAuctionView();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: (query) =>
      query.state.data?.closingPending ? 15_000 : 60_000,
  });
}

/** Closed auctions, newest first. */
export function useClosedAuctions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: [AUCTION_KEYS.closed],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getClosedAuctions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 120_000,
  });
}

/** Result and published offers of one closed auction; null while it is open. */
export function useAuctionResult(auctionId: AuctionId, enabled = true) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: [AUCTION_KEYS.result, auctionId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAuctionResult(auctionId);
    },
    enabled: !!actor && !isFetching && enabled,
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data && query.state.data.auction.settlement.pendingCount > 0n
        ? SETTLEMENT_REFRESH_MS
        : false,
  });
}

/** The caller's own offers found in the published results of closed auctions. */
export function useMyClosedBids() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();
  const closed = useClosedAuctions();
  const results = useQueries({
    queries: (closed.data ?? []).map((auction) => ({
      queryKey: [AUCTION_KEYS.result, auction.id.toString()],
      queryFn: async () => {
        if (!actor) throw new Error("Actor not available");
        return actor.getAuctionResult(auction.id);
      },
      enabled: !!actor && !isFetching && !!caller,
      staleTime: 60_000,
      refetchInterval: (query: {
        state: { data?: AuctionResultView | null };
      }) =>
        query.state.data &&
        query.state.data.auction.settlement.pendingCount > 0n
          ? SETTLEMENT_REFRESH_MS
          : false,
    })),
  });
  const bids: ClosedBidView[] = caller
    ? results.flatMap((r) =>
        (r.data?.bids ?? []).filter((b) => b.bidder.toText() === caller),
      )
    : [];
  return {
    bids,
    isPending:
      !!caller && (closed.isPending || results.some((r) => r.isPending)),
    isError: closed.isError || results.some((r) => r.isError),
  };
}

/** Settlement records of the caller's own winning offers, newest auction first as published. */
export function useMyBidSettlements() {
  const mine = useMyClosedBids();
  const settlements: BidSettlement[] = mine.bids.map((b) => b.settlement);
  return {
    settlements,
    isPending: mine.isPending,
    isError: mine.isError,
  };
}

/** The caller's balance per token: returned to the balance and awaiting settlement. */
export function useMyWithdrawable() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();
  return useQuery({
    queryKey: [AUCTION_KEYS.withdrawable, caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyWithdrawable();
    },
    enabled: !!actor && !isFetching && !!caller,
    refetchInterval: 60_000,
  });
}

/** Refreshes the closing data whenever the auction view changes (open, closing, closed). */
export function useAuctionViewSync(view: AuctionView | undefined) {
  const queryClient = useQueryClient();
  const signature = view
    ? `${view.open}|${view.auctionId?.toString() ?? ""}|${view.closingPending}`
    : "";
  useEffect(() => {
    if (!signature) return;
    for (const key of [
      AUCTION_KEYS.closed,
      AUCTION_KEYS.result,
      AUCTION_KEYS.withdrawable,
      AUCTION_KEYS.mine,
    ]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }, [signature, queryClient]);
}

/** The caller's own offers; the contract returns no one else's. */
export function useMyAuctionBids() {
  const { actor, isFetching } = useActor();
  const caller = useCallerText();
  return useQuery({
    queryKey: [AUCTION_KEYS.mine, caller],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyAuctionBids();
    },
    enabled: !!actor && !isFetching && !!caller,
  });
}

/** Required deposit computed by the contract; undefined when it refuses. */
export function useAuctionDepositQuote(
  token: PayToken,
  priceB: bigint | null,
  quantityE8s: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint | undefined>({
    queryKey: [
      AUCTION_KEYS.quote,
      token,
      priceB?.toString(),
      quantityE8s?.toString(),
    ],
    queryFn: async () => {
      if (!actor || priceB === null || quantityE8s === null) return undefined;
      const result = await actor.quoteAuctionDeposit(
        token,
        priceB,
        quantityE8s,
      );
      return result.__kind__ === "ok" ? result.ok : undefined;
    },
    enabled: !!actor && !isFetching && priceB !== null && quantityE8s !== null,
  });
}

/** Opens the next auction; the contract refuses when none can be opened. */
export function useOpenAuction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.openAuction();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [AUCTION_KEYS.view] });
    },
  });
}

/** Required deposit: ceil(2 x B x quantity / 0.99), as in the contract. */
export function localRequiredDeposit(
  priceB: bigint,
  quantityE8s: bigint,
): bigint {
  return ceilDiv(2n * priceB * quantityE8s * 100n, 10n ** 8n * 99n);
}

export interface PlaceBidInput {
  token: PayToken;
  quantityE8s: bigint;
  priceB: bigint;
  deposit: bigint;
}

export type BidPhase = "idle" | "approving" | "sending";

export type BidFailure =
  | { kind: "approval"; message: string }
  | { kind: "bid"; error: BidError }
  | { kind: "unexpected" };

function payTokenDescriptor(token: PayToken): TokenDescriptor {
  const pay = PAY_TOKENS[token];
  return {
    canisterId: Principal.fromText(pay.ledgerCanisterId),
    name: pay.name,
    symbol: pay.symbol,
    decimals: pay.decimals,
    fee: pay.fee,
  };
}

/**
 * Offer flow: signs the ICRC-2 approval of the deposit with the wallet that
 * holds the account, then places the offer.
 */
export function usePlaceAuctionBid(owner: Principal | undefined) {
  const { actor } = useActor();
  const signer = useAccountSigner(owner);
  const spender = useGetCanisterPrincipal();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<BidPhase>("idle");
  const [failure, setFailure] = useState<BidFailure | null>(null);
  const [placed, setPlaced] = useState(false);

  const place = useMutation({
    mutationFn: async (input: PlaceBidInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.placeAuctionBid(
        input.token,
        input.quantityE8s,
        input.priceB,
        input.deposit,
      );
    },
    onSuccess: () => invalidateAfterBid(queryClient),
  });

  const submit = async (input: PlaceBidInput): Promise<boolean> => {
    if (!spender.data) {
      setFailure({ kind: "unexpected" });
      return false;
    }
    setFailure(null);
    setPlaced(false);
    const release = signer.begin();
    try {
      setPhase("approving");
      const descriptor = payTokenDescriptor(input.token);
      const outcome = await signer.approve(
        descriptor,
        buildApproveArgs(spender.data, input.deposit, descriptor.fee),
      );
      if (!outcome.ok) {
        setFailure({ kind: "approval", message: outcome.message });
        return false;
      }
      setPhase("sending");
      const result = await place.mutateAsync(input);
      if (result.__kind__ === "err") {
        setFailure({ kind: "bid", error: result.err });
        return false;
      }
      setPlaced(true);
      return true;
    } catch {
      setFailure({ kind: "unexpected" });
      return false;
    } finally {
      release();
      setPhase("idle");
    }
  };

  return { phase, failure, placed, submit, ready: !!spender.data };
}
