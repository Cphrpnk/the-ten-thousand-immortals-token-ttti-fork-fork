import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { PoolView } from "../../backend";
import {
  useDexEstimatedShare,
  useDexPendingPot,
  usePoolPositions,
} from "../../hooks/useDex";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { CopyPrincipal } from "./CopyPrincipal";
import { DexTokenAmount } from "./DexFiat";
import { EstimatedShareValue, PendingPotDisplay } from "./PoolRow";
import { formatDexDate } from "./dexFormat";
import { formatRemainingTime, positionStatusText } from "./liquidityFormat";

/** Rows per page; the estimated share is only looked up for the visible rows. */
const POSITIONS_PAGE_SIZE = 25;

/** Estimated share of the current day of one position, where the data is available. */
function ShareCell({
  positionId,
  pool,
  ocid,
}: { positionId: bigint; pool: PoolView; ocid: string }) {
  const share = useDexEstimatedShare(positionId);
  return <EstimatedShareValue share={share.data} pool={pool} ocid={ocid} />;
}

/** Public list of every position of one pool. */
export function PoolPositionsDialog({
  pool,
  onClose,
}: {
  pool: PoolView;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const m = useDict(MINT_REVENUE_TEXT);
  const { lang } = useLanguage();
  const [page, setPage] = useState(0);
  const positions = usePoolPositions(pool.id);
  const pot = useDexPendingPot(pool.id);
  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const rows = [...(positions.data ?? [])].sort((a, b) =>
    a.id === b.id ? 0 : a.id < b.id ? -1 : 1,
  );
  const pageCount = Math.max(1, Math.ceil(rows.length / POSITIONS_PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const offset = current * POSITIONS_PAGE_SIZE;
  const visible = rows.slice(offset, offset + POSITIONS_PAGE_SIZE);

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
        data-ocid="pools.positions.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {t.positionsTitle(pair)}
          </DialogTitle>
          <DialogDescription>{t.privacyPositions}</DialogDescription>
        </DialogHeader>
        <div
          className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm"
          data-ocid="pools.positions.pending_pot"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-muted-foreground">{t.pendingPotLabel}</span>
            <PendingPotDisplay
              pot={pot.data}
              pending={pot.isPending}
              pool={pool}
              ocid="pools.positions.pending_pot_value"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t.pendingPotNote}</p>
        </div>
        {positions.isPending ? (
          <Skeleton
            className="h-32 rounded-md"
            data-ocid="pools.positions.loading_state"
            aria-label={t.positionsLoading}
          />
        ) : positions.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pools.positions.error_state"
          >
            {t.positionsLoadError}
          </p>
        ) : rows.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="pools.positions.empty_state"
          >
            {t.positionsEmpty}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {t.estimatedShareNote}
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm"
                data-ocid="pools.positions.table"
              >
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pe-3 text-start font-normal">#</th>
                    <th className="py-2 pe-3 text-start font-normal">
                      {t.colOwner}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.colShares}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.colAmounts}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.colLock}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.positionTimeRemaining}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.colUnlock}
                    </th>
                    <th className="py-2 pe-3 text-end font-normal">
                      {t.estimatedShareLabel}
                    </th>
                    <th className="py-2 text-end font-normal">
                      {t.positionStatus}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p, j) => {
                    const i = offset + j;
                    return (
                      <tr
                        key={p.id.toString()}
                        className="border-b border-border/60 align-top"
                        data-ocid={`pools.positions.row.${i + 1}`}
                      >
                        <td className="py-2 pe-3 tabular-nums">
                          {formatNumber(p.id)}
                        </td>
                        <td className="py-2 pe-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <CopyPrincipal
                              principal={p.owner}
                              ocid={`pools.positions.copy_button.${i + 1}`}
                            />
                            {p.isCreator && (
                              <span className="rounded-full border border-gold-strong px-2 py-0.5 text-xs text-primary">
                                {t.creatorBadge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          {formatNumber(p.shares)}
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          <div>
                            <DexTokenAmount
                              amount={p.amount0}
                              token={pool.token0}
                            />
                          </div>
                          <div>
                            <DexTokenAmount
                              amount={p.amount1}
                              token={pool.token1}
                            />
                          </div>
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          {p.lockDurationNs === 0n
                            ? t.lockNone
                            : formatRemainingTime(t, p.lockDurationNs)}
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          {formatRemainingTime(t, p.remainingNs)}
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          {p.lockDurationNs === 0n
                            ? t.lockNone
                            : formatDexDate(p.unlockAt, lang)}
                        </td>
                        <td className="py-2 pe-3 text-end tabular-nums">
                          <ShareCell
                            positionId={p.id}
                            pool={pool}
                            ocid={`pools.positions.estimated_share.${i + 1}`}
                          />
                        </td>
                        <td
                          className="py-2 text-end"
                          data-ocid={`pools.positions.status.${i + 1}`}
                        >
                          {positionStatusText(t, p)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                  data-ocid="pools.positions.pagination_prev"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  {m.previous}
                </Button>
                <span className="font-mono text-xs text-muted-foreground">
                  {m.pageOf(formatNumber(current + 1), formatNumber(pageCount))}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={current >= pageCount - 1}
                  onClick={() => setPage(current + 1)}
                  data-ocid="pools.positions.pagination_next"
                >
                  {m.next}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
