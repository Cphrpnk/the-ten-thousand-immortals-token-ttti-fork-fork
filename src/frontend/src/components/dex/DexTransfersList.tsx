import type { Principal } from "@icp-sdk/core/principal";
import { DexTransferDirection } from "../../backend";
import {
  type DexTokenInfo,
  type DexTransferView,
  useDexTransfers,
} from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  formatDexDate,
  formatDexUnits,
  transferStatusLabel,
} from "./dexFormat";

const RECENT_LIMIT = 25;
const SKELETONS = Array.from({ length: 3 }, (_, i) => `transfer-skeleton-${i}`);

const STATUS_STYLES: Record<DexTransferView["status"]["__kind__"], string> = {
  inProgress: "border-border text-muted-foreground",
  completed: "border-foreground/30 text-foreground",
  failed: "border-destructive/50 text-destructive",
  needsReview: "border-destructive/50 text-destructive",
};

/** Recent DD deposits and DW withdrawals of `owner`. */
export function DexTransfersList({
  owner,
  tokens,
}: {
  owner: Principal;
  tokens: Array<DexTokenInfo>;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const transfers = useDexTransfers(owner);
  const recent = [...(transfers.data ?? [])]
    .sort((a, b) =>
      a.createdAtTimeNs === b.createdAtTimeNs
        ? 0
        : a.createdAtTimeNs > b.createdAtTimeNs
          ? -1
          : 1,
    )
    .slice(0, RECENT_LIMIT);

  return (
    <div
      className="flex flex-col gap-3"
      data-ocid="pools.balances.transfers.section"
    >
      <h3 className="font-display text-lg tracking-wide">{t.transfersTitle}</h3>
      {transfers.isPending ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="pools.balances.transfers.loading_state"
        >
          {SKELETONS.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : transfers.isError ? (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="pools.balances.transfers.error_state"
        >
          {t.balancesLoadError}
        </p>
      ) : recent.length === 0 ? (
        <p
          className="border-t border-border pt-3 text-sm text-muted-foreground"
          data-ocid="pools.balances.transfers.empty_state"
        >
          {t.noTransfers}
        </p>
      ) : (
        <ul
          className="flex flex-col border-t border-border"
          data-ocid="pools.balances.transfers.list"
        >
          {recent.map((tr, i) => {
            const info = tokens.find((x) => x.token === tr.token);
            const amount = info
              ? formatDexUnits(tr.amount, info)
              : formatNumber(tr.amount);
            const s = tr.status;
            return (
              <li
                key={`${tr.direction}-${tr.n.toString()}`}
                className="grid gap-x-4 gap-y-1.5 border-b border-border py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]"
                data-ocid={`pools.balances.transfers.item.${i + 1}`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">
                    {tr.direction === DexTransferDirection.deposit
                      ? t.directionDeposit
                      : t.directionWithdrawal}
                  </span>
                  <span className="font-mono tabular-nums break-all">
                    {amount}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-xs text-muted-foreground">
                  <span className="break-all">
                    {t.memo}: <span className="font-mono">{tr.memoText}</span>
                  </span>
                  <span>{formatDexDate(tr.createdAtTimeNs, lang)}</span>
                  {s.__kind__ === "failed" && (
                    <span className="text-destructive break-words">
                      {t.transferError(s.failed)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs",
                      STATUS_STYLES[s.__kind__],
                    )}
                    data-ocid={`pools.balances.transfers.status.${i + 1}`}
                  >
                    {transferStatusLabel(t, s)}
                  </span>
                  {s.__kind__ === "completed" && (
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {t.transferBlock(formatNumber(s.completed))}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
