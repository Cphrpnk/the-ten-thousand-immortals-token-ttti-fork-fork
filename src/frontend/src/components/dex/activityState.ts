import { DexToken, DexTransferDirection } from "../../backend";
import type {
  DexTokenInfo,
  DexTransferView,
  LpBonusView,
  MintFeeLpView,
} from "../../backend";

/* My activity: URL state (af / at / ap, distinct from the admin hf / ht / hp)
 * and the merged, newest-first entry list. */

export const ACTIVITY_PAGE_SIZE = 25;
export const ACTIVITY_FILTERS = [
  "all",
  "transfers",
  "mintFees",
  "lpBonus",
] as const;
export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];
export const ALL_TOKENS = "all";
export type ActivityToken = DexToken | typeof ALL_TOKENS;

const PARAM_FILTER = "af";
const PARAM_TOKEN = "at";
const PARAM_PAGE = "ap";
const DEX_TOKENS = Object.values(DexToken) as string[];

export interface ActivityState {
  filter: ActivityFilter;
  token: ActivityToken;
  page: number;
}

export function readActivityState(): ActivityState {
  const params = new URLSearchParams(window.location.search);
  const f = params.get(PARAM_FILTER);
  const t = params.get(PARAM_TOKEN);
  const p = Number.parseInt(params.get(PARAM_PAGE) ?? "1", 10);
  return {
    filter: ACTIVITY_FILTERS.some((o) => o === f)
      ? (f as ActivityFilter)
      : "all",
    token: t !== null && DEX_TOKENS.includes(t) ? (t as DexToken) : ALL_TOKENS,
    page: Number.isFinite(p) && p > 0 ? p - 1 : 0,
  };
}

export function writeActivityState(state: ActivityState) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (state.filter === "all") params.delete(PARAM_FILTER);
  else params.set(PARAM_FILTER, state.filter);
  if (state.token === ALL_TOKENS) params.delete(PARAM_TOKEN);
  else params.set(PARAM_TOKEN, state.token);
  if (state.page === 0) params.delete(PARAM_PAGE);
  else params.set(PARAM_PAGE, String(state.page + 1));
  const next = `${url.pathname}${params.toString() ? `?${params}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

export type ActivityEntry =
  | {
      kind: "transfers";
      key: string;
      time: bigint;
      token: DexToken;
      transfer: DexTransferView;
    }
  | {
      kind: "mintFees";
      key: string;
      time: bigint;
      token: DexToken;
      claim: MintFeeLpView["claims"][number];
    }
  | {
      kind: "lpBonus";
      key: string;
      time: bigint;
      token: DexToken;
      claim: LpBonusView["claims"][number];
    };

export function buildActivity(
  transfers: DexTransferView[],
  mintFees: MintFeeLpView | undefined,
  bonus: LpBonusView | undefined,
): ActivityEntry[] {
  const entries: ActivityEntry[] = [
    ...transfers.map(
      (tr): ActivityEntry => ({
        kind: "transfers",
        key: `tr-${tr.direction === DexTransferDirection.deposit ? "dd" : "dw"}-${tr.n.toString()}`,
        time: tr.createdAtTimeNs,
        token: tr.token,
        transfer: tr,
      }),
    ),
    ...(mintFees?.claims ?? []).map(
      (c): ActivityEntry => ({
        kind: "mintFees",
        key: `mf-${c.n.toString()}`,
        time: c.createdAt,
        token: c.token as string as DexToken,
        claim: c,
      }),
    ),
    ...(bonus?.claims ?? []).map(
      (c): ActivityEntry => ({
        kind: "lpBonus",
        key: `lb-${c.n.toString()}`,
        time: c.createdAt,
        token: DexToken.icp,
        claim: c,
      }),
    ),
  ];
  return entries.sort((a, b) =>
    a.time === b.time ? 0 : a.time > b.time ? -1 : 1,
  );
}

export function filterActivity(
  entries: ActivityEntry[],
  state: ActivityState,
): ActivityEntry[] {
  return entries.filter(
    (e) =>
      (state.filter === "all" || e.kind === state.filter) &&
      (state.token === ALL_TOKENS || e.token === state.token),
  );
}

export const tokenInfoOf = (tokens: DexTokenInfo[], token: DexToken) =>
  tokens.find((x) => x.token === token);
