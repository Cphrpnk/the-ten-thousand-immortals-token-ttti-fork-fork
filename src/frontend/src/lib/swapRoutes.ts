import type { SwapError } from "../backend";

/** The two routes of the wallet swap: native pool (base) and ICPSwap (last resort). */
export type RouteKind = "native" | "icpswap";

/** Why a route has no quote, as a code the UI turns into a sentence. */
export type RouteIssue =
  | { kind: "noPool" }
  | { kind: "poolState" }
  | { kind: "account" }
  | { kind: "failed" }
  | { kind: "swapError"; error: SwapError };

export type RouteStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error"
  | "unavailable";

/** Quote state of one route; each route is read and shown on its own. */
export interface RouteState {
  kind: RouteKind;
  status: RouteStatus;
  issue: RouteIssue | null;
  /** Estimated amount received in the wallet (output minus withdrawal fee). */
  received: bigint | null;
  /** Guaranteed minimum received in the wallet. */
  minReceived: bigint | null;
  /** Pool fee as a percentage value (0.3 for 0.3 %). */
  feePct: number | null;
  /** Pool fee in base units of the token given. */
  poolFee: bigint | null;
}

export function emptyRoute(
  kind: RouteKind,
  status: RouteStatus,
  issue: RouteIssue | null = null,
): RouteState {
  return {
    kind,
    status,
    issue,
    received: null,
    minReceived: null,
    feePct: null,
    poolFee: null,
  };
}

/**
 * Route returning the most tokens, fees included. Only routes with a quote
 * count; a tie goes to the native pool, the base route.
 */
export function suggestRoute(
  routes: ReadonlyArray<RouteState>,
): RouteKind | null {
  let best: RouteState | null = null;
  for (const route of routes) {
    if (route.status !== "ready" || route.received === null) continue;
    if (
      best === null ||
      best.received === null ||
      route.received > best.received ||
      (route.received === best.received && route.kind === "native")
    ) {
      best = route;
    }
  }
  return best?.kind ?? null;
}

/**
 * Route that will be executed: the one the user picked while it has a quote,
 * otherwise the suggestion. A manual choice always overrides the suggestion.
 */
export function activeRoute(
  routes: ReadonlyArray<RouteState>,
  chosen: RouteKind | null,
): RouteKind | null {
  const picked = routes.find((route) => route.kind === chosen);
  if (picked && picked.status === "ready") return picked.kind;
  return suggestRoute(routes);
}

/** True when more than one route has a quote, so a comparison exists. */
export function hasComparison(routes: ReadonlyArray<RouteState>): boolean {
  return routes.filter((route) => route.status === "ready").length > 1;
}
