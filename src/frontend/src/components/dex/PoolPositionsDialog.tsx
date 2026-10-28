import type { PoolView } from "../../backend";
import { usePoolPositions } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { CopyPrincipal } from "./CopyPrincipal";
import { formatDexDate, formatTokenAmount } from "./dexFormat";
import { durationText } from "./liquidityFormat";

/** Public list of every position of one pool. */
export function PoolPositionsDialog({
  pool,
  onClose,
}: {
  pool: PoolView;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const positions = usePoolPositions(pool.id);
  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const rows = [...(positions.data ?? [])].sort((a, b) =>
    a.id === b.id ? 0 : a.id < b.id ? -1 : 1,
  );

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="pools.positions.table">
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
                  <th className="py-2 text-end font-normal">{t.colUnlock}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
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
                      <div>{formatTokenAmount(p.amount0, pool.token0)}</div>
                      <div>{formatTokenAmount(p.amount1, pool.token1)}</div>
                    </td>
                    <td className="py-2 pe-3 text-end">
                      {durationText(t, p.lockDurationNs)}
                    </td>
                    <td className="py-2 text-end tabular-nums">
                      <div>{formatDexDate(p.unlockAt, lang)}</div>
                      {p.unlocked && (
                        <div className="text-xs text-muted-foreground">
                          {t.unlockedLabel}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
