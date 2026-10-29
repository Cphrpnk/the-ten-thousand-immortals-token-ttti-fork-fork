import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useEffect, useState } from "react";
import type { HistoryRow } from "../../backend";
import {
  DexToken,
  HistoryFilter,
  HistoryKind,
  HistoryToken,
} from "../../backend";
import {
  HISTORY_PAGE_SIZE,
  useAdminHistory,
} from "../../hooks/useAdminTreasury";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  ALL_TOKENS,
  AdminAccordion,
  BlockRef,
  type ChipOption,
  FilterChips,
  RevealText,
  type TokenChoice,
  TokenSelect,
  formatTokenAmount,
} from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";

const FILTERS: ReadonlyArray<ChipOption<HistoryFilter>> = [
  { value: HistoryFilter.all, label: "All" },
  { value: HistoryFilter.mintDeposit, label: "Mint/Deposit" },
  { value: HistoryFilter.revenueSent, label: "Revenue sent" },
  { value: HistoryFilter.refund, label: "Refund" },
  { value: HistoryFilter.buyback, label: "Buyback" },
  { value: HistoryFilter.swap, label: "Swap" },
  { value: HistoryFilter.liquidity, label: "Liquidity" },
  { value: HistoryFilter.destination, label: "Destination" },
];

const KIND_LABELS: Record<HistoryKind, string> = {
  [HistoryKind.mintDeposit]: "Mint/Deposit",
  [HistoryKind.revenueSent]: "Revenue sent",
  [HistoryKind.refund]: "Refund",
  [HistoryKind.buyback]: "Buyback",
  [HistoryKind.swap]: "Swap",
  [HistoryKind.liquidity]: "Liquidity",
  [HistoryKind.destination]: "Destination",
};

const HISTORY_TOKENS: ReadonlyArray<HistoryToken> = [
  HistoryToken.icp,
  HistoryToken.ckbtc,
  HistoryToken.ckusdc,
  HistoryToken.ckusdt,
  HistoryToken.tttiT,
];

/** DexToken of a history token (same keys). */
const AS_DEX: Record<HistoryToken, DexToken> = {
  [HistoryToken.icp]: DexToken.icp,
  [HistoryToken.ckbtc]: DexToken.ckbtc,
  [HistoryToken.ckusdc]: DexToken.ckusdc,
  [HistoryToken.ckusdt]: DexToken.ckusdt,
  [HistoryToken.tttiT]: DexToken.tttiT,
};

const PARAM_FILTER = "hf";
const PARAM_TOKEN = "ht";
const PARAM_PAGE = "hp";

interface HistoryState {
  filter: HistoryFilter;
  token: TokenChoice<HistoryToken>;
  page: number;
}

function readState(): HistoryState {
  const params = new URLSearchParams(window.location.search);
  const f = params.get(PARAM_FILTER);
  const t = params.get(PARAM_TOKEN);
  const p = Number.parseInt(params.get(PARAM_PAGE) ?? "1", 10);
  return {
    filter: FILTERS.some((o) => o.value === f)
      ? (f as HistoryFilter)
      : HistoryFilter.all,
    token: HISTORY_TOKENS.some((k) => k === t)
      ? (t as HistoryToken)
      : ALL_TOKENS,
    page: Number.isFinite(p) && p > 0 ? p - 1 : 0,
  };
}

function writeState(state: HistoryState) {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (state.filter === HistoryFilter.all) params.delete(PARAM_FILTER);
  else params.set(PARAM_FILTER, state.filter);
  if (state.token === ALL_TOKENS) params.delete(PARAM_TOKEN);
  else params.set(PARAM_TOKEN, state.token);
  if (state.page === 0) params.delete(PARAM_PAGE);
  else params.set(PARAM_PAGE, String(state.page + 1));
  const next = `${url.pathname}${params.toString() ? `?${params}` : ""}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
}

function Row({ row, index }: { row: HistoryRow; index: number }) {
  const dexToken = row.token === undefined ? null : AS_DEX[row.token];
  const ocid = `admin.history.item.${index + 1}`;
  return (
    <li
      className="grid gap-x-6 gap-y-2 py-4 text-sm md:grid-cols-[9rem_1fr_auto]"
      data-ocid={ocid}
    >
      <div className="space-y-1">
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {formatTimestamp(row.timestamp)}
        </p>
        <Badge variant="secondary" className="font-normal">
          {KIND_LABELS[row.kind]}
        </Badge>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="break-words">{row.detail}</p>
        {row.counterparty && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Counterparty</span>
            <RevealText
              text={row.counterparty}
              label="counterparty"
              ocid={`${ocid}_counterparty`}
            />
          </div>
        )}
        {row.memo && (
          <p className="font-mono text-xs text-muted-foreground break-all">
            {row.memo}
          </p>
        )}
      </div>
      <div className="space-y-1 md:text-right">
        <p className="font-mono tabular-nums">
          {row.amount !== undefined && dexToken !== null
            ? formatTokenAmount(row.amount, dexToken)
            : (row.amount?.toString() ?? "—")}
        </p>
        <p className="text-xs text-muted-foreground">{row.status}</p>
        {row.block !== undefined && dexToken !== null && (
          <BlockRef token={dexToken} block={row.block} ocid={`${ocid}_block`} />
        )}
      </div>
    </li>
  );
}

/** Unified admin history: newest first, 25 per page, filters in the URL. */
export function HistoryCard() {
  const [state, setState] = useState<HistoryState>(readState);
  const { filter, token, page } = state;
  const query = useAdminHistory(
    filter,
    token === ALL_TOKENS ? null : token,
    page,
  );

  useEffect(() => {
    writeState(state);
  }, [state]);

  const total = query.data ? Number(query.data.total) : 0;
  const pages = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const items = query.data?.items ?? [];

  useEffect(() => {
    if (query.data && page > 0 && page >= pages) {
      setState((s) => ({ ...s, page: pages - 1 }));
    }
  }, [query.data, page, pages]);

  return (
    <div className="space-y-5" data-ocid="admin.history_card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          options={FILTERS}
          value={filter}
          onChange={(value) =>
            setState((s) => ({ ...s, filter: value, page: 0 }))
          }
          label="History type"
          ocid="admin.history_filter"
        />
        <TokenSelect
          tokens={HISTORY_TOKENS}
          value={token}
          onChange={(value) =>
            setState((s) => ({ ...s, token: value, page: 0 }))
          }
          label="History token"
          ocid="admin.history_token_select"
          allowAll
        />
      </div>

      <AdminAccordion
        label="Transactions"
        count={query.data ? total : undefined}
        ocid="admin.history_list"
      >
        {query.isLoading ? (
          <div className="space-y-3" data-ocid="admin.history_loading_state">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : query.isError ? (
          <Alert variant="destructive" data-ocid="admin.history_error_state">
            <AlertDescription className="flex flex-wrap items-center gap-3">
              {query.error.message || "The history could not be loaded."}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void query.refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"
            data-ocid="admin.history_empty_state"
          >
            <History className="h-5 w-5 text-primary" aria-hidden="true" />
            No transaction matches these filters.
          </div>
        ) : (
          <>
            <ul
              className={`divide-y divide-border ${query.isPlaceholderData ? "opacity-60" : ""}`}
              aria-busy={query.isPlaceholderData}
            >
              {items.map((row, index) => (
                <Row key={row.id} row={row} index={index} />
              ))}
            </ul>
            <nav
              className="flex items-center justify-between gap-3 border-t border-border pt-4"
              aria-label="History pages"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setState((s) => ({ ...s, page: s.page - 1 }))}
                data-ocid="admin.history_prev_button"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Newer
              </Button>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                Page {page + 1} of {pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= pages}
                onClick={() => setState((s) => ({ ...s, page: s.page + 1 }))}
                data-ocid="admin.history_next_button"
              >
                Older
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </nav>
          </>
        )}
      </AdminAccordion>
    </div>
  );
}
