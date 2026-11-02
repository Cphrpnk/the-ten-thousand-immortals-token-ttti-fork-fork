import type { Principal } from "@icp-sdk/core/principal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { DexTransferDirection } from "../../backend";
import {
  type DexTransferView,
  useDexTokens,
  useDexTransfers,
  useMyLpBonus,
  useMyMintFees,
} from "../../hooks/useDex";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { PAGED_LIST_TEXT } from "../../i18n/pages/pagedList";
import { formatPayAmount } from "../../lib/token";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { DexAccordion, DexFilterChips } from "./DexAccordion";
import { DexFiat, fiatTokenOfDex } from "./DexFiat";
import { DexLoadMore } from "./DexTransfersList";
import { claimStatusLabel } from "./MintFeePanel";
import {
  ACTIVITY_PAGE_SIZE,
  ALL_TOKENS,
  type ActivityEntry,
  type ActivityFilter,
  type ActivityState,
  type ActivityToken,
  buildActivity,
  filterActivity,
  readActivityState,
  tokenInfoOf,
  writeActivityState,
} from "./activityState";
import {
  formatBonusIcp,
  formatDexDate,
  formatDexUnits,
  transferStatusLabel,
} from "./dexFormat";

const STATUS_STYLES: Record<DexTransferView["status"]["__kind__"], string> = {
  inProgress: "border-border text-muted-foreground",
  completed: "border-foreground/30 text-foreground",
  failed: "border-destructive/50 text-destructive",
  needsReview: "border-destructive/50 text-destructive",
};

const SKELETONS = Array.from({ length: 3 }, (_, i) => `activity-skeleton-${i}`);

/** Single "My activity" history: DD / DW transfers, mint fee and LP bonus claims. */
export function DexActivityHistory({ owner }: { owner: Principal }) {
  const t = useDict(DEX_TEXT);
  const m = useDict(MINT_REVENUE_TEXT);
  const p = useDict(PAGED_LIST_TEXT);
  const { lang } = useLanguage();
  const ownerText = owner.toText();
  const transfers = useDexTransfers(owner);
  const mintFees = useMyMintFees(ownerText);
  const bonus = useMyLpBonus(ownerText);
  const tokens = useDexTokens().data ?? [];
  const [state, setState] = useState<ActivityState>(readActivityState);

  useEffect(() => {
    writeActivityState(state);
  }, [state]);

  const transfersPending =
    transfers.isLoading ||
    (!transfers.isError && !transfers.isEmpty && transfers.items.length === 0);
  const loading = transfersPending || mintFees.isPending || bonus.isPending;
  const failed = transfers.isError || mintFees.isError || bonus.isError;
  const all = buildActivity(
    transfers.items,
    mintFees.data ?? undefined,
    bonus.data ?? undefined,
  );
  const filtered = filterActivity(all, state);
  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / ACTIVITY_PAGE_SIZE),
  );
  const page = Math.min(state.page, pageCount - 1);
  const visible = filtered.slice(
    page * ACTIVITY_PAGE_SIZE,
    (page + 1) * ACTIVITY_PAGE_SIZE,
  );

  const filters: Array<{ value: ActivityFilter; label: string }> = [
    { value: "all", label: t.filterAll },
    { value: "transfers", label: t.filterTransfers },
    { value: "mintFees", label: t.filterMintFees },
    { value: "lpBonus", label: t.filterLpBonus },
  ];

  return (
    <DexAccordion
      label={t.activityTitle}
      count={
        loading || failed
          ? undefined
          : `${formatNumber(all.length)}${transfers.hasMore ? "+" : ""}`
      }
      ocid="pools.activity"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DexFilterChips
          label={t.activityFilterLabel}
          options={filters}
          value={state.filter}
          onChange={(filter) => setState((s) => ({ ...s, filter, page: 0 }))}
          ocid="pools.activity.filter"
        />
        <Select
          value={state.token}
          onValueChange={(v) =>
            setState((s) => ({ ...s, token: v as ActivityToken, page: 0 }))
          }
        >
          <SelectTrigger
            className="token-select"
            aria-label={t.tokenFilterLabel}
            data-ocid="pools.activity.token_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TOKENS}>{t.allTokens}</SelectItem>
            {tokens.map((info) => (
              <SelectItem key={info.token} value={info.token}>
                {info.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="pools.activity.loading_state"
        >
          {SKELETONS.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : failed ? (
        <div
          className="callout-danger flex flex-wrap items-center gap-3 px-3 py-2 text-sm"
          data-ocid="pools.activity.error_state"
        >
          <span>{t.activityLoadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (transfers.isError) transfers.retry();
              if (mintFees.isError) void mintFees.refetch();
              if (bonus.isError) void bonus.refetch();
            }}
            data-ocid="pools.activity.retry_button"
          >
            {p.retry}
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p
          className="border-t border-border pt-3 text-sm text-muted-foreground"
          data-ocid="pools.activity.empty_state"
        >
          {t.activityEmpty}
        </p>
      ) : (
        <ul
          className="flex flex-col border-t border-border"
          data-ocid="pools.activity.list"
        >
          {visible.map((entry, i) => (
            <EntryRow
              key={entry.key}
              entry={entry}
              index={page * ACTIVITY_PAGE_SIZE + i + 1}
              amount={entryAmount(entry)}
              fiat={entryFiat(entry)}
              date={formatDexDate(entry.time, lang)}
            />
          ))}
        </ul>
      )}

      {!loading && !failed && (
        <DexLoadMore list={transfers} ocid="pools.activity" />
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setState((s) => ({ ...s, page: page - 1 }))}
            data-ocid="pools.activity.pagination_prev"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {m.previous}
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {m.pageOf(formatNumber(page + 1), formatNumber(pageCount))}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pageCount - 1}
            onClick={() => setState((s) => ({ ...s, page: page + 1 }))}
            data-ocid="pools.activity.pagination_next"
          >
            {m.next}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </DexAccordion>
  );

  function entryFiat(entry: ActivityEntry) {
    const raw =
      entry.kind === "transfers"
        ? entry.transfer.amount
        : entry.kind === "mintFees"
          ? entry.claim.amount
          : entry.claim.amountE8s;
    return <DexFiat token={fiatTokenOfDex(entry.token)} amount={raw} />;
  }

  function entryAmount(entry: ActivityEntry): string {
    switch (entry.kind) {
      case "transfers": {
        const info = tokenInfoOf(tokens, entry.token);
        return info
          ? formatDexUnits(entry.transfer.amount, info)
          : formatNumber(entry.transfer.amount);
      }
      case "mintFees":
        return formatPayAmount(entry.claim.amount, entry.claim.token, lang);
      case "lpBonus":
        return formatBonusIcp(entry.claim.amountE8s);
    }
  }
}

function EntryRow({
  entry,
  index,
  amount,
  fiat,
  date,
}: {
  entry: ActivityEntry;
  index: number;
  amount: string;
  fiat: ReactNode;
  date: string;
}) {
  const t = useDict(DEX_TEXT);
  const m = useDict(MINT_REVENUE_TEXT);
  const label =
    entry.kind === "transfers"
      ? entry.transfer.direction === DexTransferDirection.deposit
        ? t.directionDeposit
        : t.directionWithdrawal
      : entry.kind === "mintFees"
        ? t.entryMintFee
        : t.entryLpBonus;
  const status =
    entry.kind === "mintFees"
      ? claimStatusLabel(m, entry.claim.status)
      : entry.kind === "transfers"
        ? transferStatusLabel(t, entry.transfer.status)
        : transferStatusLabel(t, entry.claim.status);
  const memo =
    entry.kind === "transfers" ? entry.transfer.memoText : entry.claim.memoText;
  const s = entry.kind === "transfers" ? entry.transfer.status : null;
  return (
    <li
      className="grid gap-x-4 gap-y-1 border-b border-border py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
      data-ocid={`pools.activity.item.${index}`}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span>{label}</span>
        <span className="font-mono tabular-nums break-all">{amount}</span>
        {fiat}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 text-xs text-muted-foreground">
        <span>{date}</span>
        <span className="break-all">
          {t.memo}: <span className="font-mono">{memo}</span>
        </span>
        {s?.__kind__ === "failed" && (
          <span className="text-destructive break-words">
            {t.transferError(s.failed)}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-1 sm:items-end">
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs",
            entry.kind === "transfers"
              ? STATUS_STYLES[entry.transfer.status.__kind__]
              : "border-border text-muted-foreground",
          )}
          data-ocid={`pools.activity.status.${index}`}
        >
          {status}
        </span>
        {s?.__kind__ === "completed" && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {t.transferBlock(formatNumber(s.completed))}
          </span>
        )}
      </div>
    </li>
  );
}
