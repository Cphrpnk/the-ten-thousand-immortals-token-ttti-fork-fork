import { useMemo } from "react";
import {
  DexToken,
  type DexTokenInfo,
  PoolStatus,
  type PoolView,
  type SwapError,
  type SwapQuote,
} from "../backend";
import {
  type RouteIssue,
  type RouteState,
  emptyRoute,
} from "../lib/swapRoutes";
import type { TokenDescriptor } from "../lib/tokenRegistry";
import { isTttiToken } from "../lib/ttti-token";
import { useDexPools, useDexTokens, useQuoteSwap } from "./useDex";

/** Native pool route of a pair: its pool, token rows, quote and route state. */
export interface NativeRoute {
  state: RouteState;
  pool: PoolView | null;
  tokenIn: DexTokenInfo | null;
  tokenOut: DexTokenInfo | null;
  quote: SwapQuote | null;
}

interface NativeRouteArgs {
  from: TokenDescriptor | undefined;
  to: TokenDescriptor | undefined;
  /** Amount to give in base units, null while incomplete. */
  amountIn: bigint | null;
  /** Slippage tolerance in basis points, null while invalid. */
  slippageBps: bigint | null;
  /** False when the connected account is not the one signed in on this site. */
  accountOk: boolean;
}

/** DEX token row of a wallet token, matched by ledger ID (TTTI-T by token). */
function infoOf(
  infos: ReadonlyArray<DexTokenInfo>,
  token: TokenDescriptor,
): DexTokenInfo | null {
  const id = token.canisterId.toText();
  const byLedger = infos.find((info) => info.ledgerId.toText() === id);
  if (byLedger) return byLedger;
  if (isTttiToken(token)) {
    return infos.find((info) => info.token === DexToken.tttiT) ?? null;
  }
  return null;
}

/** Pool that holds exactly the two ledgers; a live pool wins over a removed one. */
function poolOf(
  pools: ReadonlyArray<PoolView>,
  a: DexTokenInfo,
  b: DexTokenInfo,
): PoolView | null {
  const ids = new Set([a.ledgerId.toText(), b.ledgerId.toText()]);
  const found = pools.filter(
    (pool) =>
      ids.has(pool.token0.ledgerId.toText()) &&
      ids.has(pool.token1.ledgerId.toText()) &&
      pool.token0.ledgerId.toText() !== pool.token1.ledgerId.toText(),
  );
  return (
    found.find((pool) => pool.status !== PoolStatus.removed) ?? found[0] ?? null
  );
}

/** Pool refusals that mean "this pool cannot serve the swap now". */
function isUnavailableRefusal(error: SwapError): boolean {
  switch (error.__kind__) {
    case "poolFilling":
    case "poolRemoved":
    case "poolNotOpen":
    case "rateUnavailable":
    case "removalInProgress":
    case "depthBelowThreshold":
    case "poolNotFound":
      return true;
    default:
      return false;
  }
}

function netOf(value: bigint, fee: bigint): bigint {
  return value > fee ? value - fee : 0n;
}

/**
 * Native route: the existing native pool of the pair, quoted with the DEX
 * quoteSwap. An empty, filling, removed or too shallow pool, or no pool at
 * all, leaves the route unavailable so only ICPSwap is offered.
 */
export function useNativeRoute({
  from,
  to,
  amountIn,
  slippageBps,
  accountOk,
}: NativeRouteArgs): NativeRoute {
  const pools = useDexPools();
  const tokens = useDexTokens();
  const infos = tokens.data;
  const tokenIn = from && infos ? infoOf(infos, from) : null;
  const tokenOut = to && infos ? infoOf(infos, to) : null;
  const pool =
    tokenIn && tokenOut && pools.data
      ? poolOf(pools.data, tokenIn, tokenOut)
      : null;

  const usable =
    pool !== null &&
    pool.status !== PoolStatus.removed &&
    pool.acceptsSwaps &&
    pool.swapState.open &&
    pool.reserve0 > 0n &&
    pool.reserve1 > 0n;
  const wantsQuote =
    usable &&
    accountOk &&
    tokenIn !== null &&
    amountIn !== null &&
    amountIn > 0n &&
    slippageBps !== null;
  const quoteQuery = useQuoteSwap(
    wantsQuote && pool && tokenIn && amountIn !== null && slippageBps !== null
      ? {
          poolId: pool.id,
          tokenIn: tokenIn.token,
          amountIn,
          slippageBps,
        }
      : null,
  );
  const outcome = wantsQuote ? quoteQuery.data : undefined;
  const quote = outcome?.__kind__ === "ok" ? outcome.ok : null;

  const state = useMemo<RouteState>(() => {
    if (pools.isLoading || tokens.isLoading)
      return emptyRoute("native", "loading");
    if (pools.isError || tokens.isError) {
      return emptyRoute("native", "error", { kind: "failed" });
    }
    if (!from || !to) return emptyRoute("native", "idle");
    if (!tokenIn || !tokenOut || !pool) {
      return emptyRoute("native", "unavailable", { kind: "noPool" });
    }
    if (!usable) {
      return emptyRoute("native", "unavailable", { kind: "poolState" });
    }
    if (!accountOk) {
      return emptyRoute("native", "unavailable", { kind: "account" });
    }
    if (!wantsQuote) return emptyRoute("native", "idle");
    if (quoteQuery.isError) {
      return emptyRoute("native", "error", { kind: "failed" });
    }
    if (outcome === undefined || outcome === null) {
      return emptyRoute("native", "loading");
    }
    if (outcome.__kind__ === "err") {
      const issue: RouteIssue = isUnavailableRefusal(outcome.err)
        ? { kind: "poolState" }
        : { kind: "swapError", error: outcome.err };
      return emptyRoute(
        "native",
        isUnavailableRefusal(outcome.err) ? "unavailable" : "error",
        issue,
      );
    }
    const ok = outcome.ok;
    return {
      kind: "native",
      status: "ready",
      issue: null,
      received: netOf(ok.amountOut, tokenOut.fee),
      minReceived: netOf(ok.minimumReceived, tokenOut.fee),
      feePct: Number(ok.feeBps) / 100,
      poolFee: ok.fee,
    };
  }, [
    pools.isLoading,
    pools.isError,
    tokens.isLoading,
    tokens.isError,
    from,
    to,
    tokenIn,
    tokenOut,
    pool,
    usable,
    accountOk,
    wantsQuote,
    quoteQuery.isError,
    outcome,
  ]);

  return { state, pool, tokenIn, tokenOut, quote };
}
