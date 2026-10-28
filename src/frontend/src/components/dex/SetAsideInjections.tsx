import { useState } from "react";
import type { PoolId, PoolView } from "../../backend";
import {
  type InjectionStatus,
  type LiquidityInjection,
  useLiquidityInjections,
  useSetAsideAmounts,
} from "../../hooks/useDex";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import {
  SET_ASIDE_THRESHOLD_USD,
  TTTI_SYMBOL,
  formatPayAmount,
  payTokenSymbol,
} from "../../lib/token";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { formatDexDate, formatTttiAmount } from "./dexFormat";
import { formatUsdE8 } from "./liquidityFormat";

type MintText = (typeof MINT_REVENUE_TEXT)["en"];

const PAGE_SIZE = 10n;
const TH = "py-1.5 pe-3 font-normal";

function injectionStatusLabel(m: MintText, status: InjectionStatus): string {
  switch (status.__kind__) {
    case "completed":
      return m.injCompleted;
    case "addingLiquidity":
      return m.injAdding;
    case "swapping":
      return m.injSwapping;
    case "needsReview":
      return m.statusReview;
    case "failed":
      return `${m.statusFailed}: ${status.failed}`;
  }
}

function venueLabel(m: MintText, inj: LiquidityInjection): string {
  return inj.venue.__kind__ === "icpswap" ? m.venueIcpswap : m.venueNative;
}

/** Public: mint fee halves set aside per token and recent liquidity injections. */
export function SetAsideInjections({
  pools,
}: {
  pools: ReadonlyArray<PoolView>;
}) {
  const m = useDict(MINT_REVENUE_TEXT);
  const { lang } = useLanguage();
  const setAside = useSetAsideAmounts();
  const [page, setPage] = useState(0n);
  const injections = useLiquidityInjections(page * PAGE_SIZE, PAGE_SIZE);
  const pairOf = (poolId: PoolId | undefined) => {
    const pool = pools.find((p) => p.id === poolId);
    return pool ? `${pool.token0.symbol}/${pool.token1.symbol}` : "—";
  };
  const total = injections.data?.total ?? 0n;
  const pageCount = total === 0n ? 1n : (total + PAGE_SIZE - 1n) / PAGE_SIZE;

  return (
    <section
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
      data-ocid="pools.set_aside.section"
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">
          {m.setAsideTitle}
        </h2>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p>{m.setAsideScope}</p>
          <p>{m.setAsideThreshold(formatNumber(SET_ASIDE_THRESHOLD_USD))}</p>
        </div>
        {setAside.isPending ? (
          <Skeleton
            className="h-24 rounded-lg"
            aria-label={m.setAsideLoading}
            data-ocid="pools.set_aside.loading_state"
          />
        ) : setAside.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pools.set_aside.error_state"
          >
            {m.setAsideLoadError}
          </p>
        ) : (setAside.data ?? []).length === 0 ? (
          <p
            className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
            data-ocid="pools.set_aside.empty_state"
          >
            {m.setAsideEmpty}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
            <table className="w-full text-xs" data-ocid="pools.set_aside.table">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className={`${TH} text-start`}>{m.colToken}</th>
                  <th className={`${TH} text-end`}>{m.colAmount}</th>
                  <th className={`${TH} text-end`}>{m.colValue}</th>
                  <th className={`${TH} text-start`}>{m.colTargetPool}</th>
                  <th className={`${TH} text-end`}>{m.colInjected}</th>
                  <th className="py-1.5 text-end font-normal">
                    {m.colLastInjection}
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {(setAside.data ?? []).map((s, i) => {
                  const threshold = formatUsdE8(s.thresholdUsdE8);
                  return (
                    <tr
                      key={s.token}
                      className="border-b border-border align-top last:border-0"
                      data-ocid={`pools.set_aside.row.${i + 1}`}
                    >
                      <td className="py-1.5 pe-3">{payTokenSymbol(s.token)}</td>
                      <td className="py-1.5 pe-3 text-end">
                        {formatPayAmount(s.amount, s.token, lang)}
                      </td>
                      <td className="py-1.5 pe-3 text-end">
                        {s.valueUsdE8 === undefined ? (
                          <span className="text-muted-foreground">
                            {m.valueUnavailable}
                          </span>
                        ) : s.valueUsdE8 < s.thresholdUsdE8 ? (
                          m.waitingBelowThreshold(
                            formatUsdE8(s.valueUsdE8),
                            threshold,
                          )
                        ) : (
                          `${formatUsdE8(s.valueUsdE8)} USD`
                        )}
                      </td>
                      <td className="py-1.5 pe-3">{pairOf(s.targetPoolId)}</td>
                      <td className="py-1.5 pe-3 text-end">
                        {formatPayAmount(s.totalInjected, s.token, lang)}
                      </td>
                      <td className="py-1.5 text-end">
                        {s.lastInjectionAt === undefined
                          ? "—"
                          : formatDexDate(s.lastInjectionAt, lang)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3" data-ocid="pools.injections.panel">
        <h3 className="font-display text-xl tracking-wide">
          {m.injectionsTitle}
        </h3>
        {injections.isPending ? (
          <Skeleton
            className="h-24 rounded-lg"
            aria-label={m.injectionsLoading}
            data-ocid="pools.injections.loading_state"
          />
        ) : injections.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pools.injections.error_state"
          >
            {m.injectionsLoadError}
          </p>
        ) : injections.data.items.length === 0 ? (
          <p
            className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
            data-ocid="pools.injections.empty_state"
          >
            {m.injectionsEmpty}
          </p>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                data-ocid="pools.injections.table"
              >
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className={`${TH} text-start`}>{m.colDate}</th>
                    <th className={`${TH} text-start`}>{m.colPool}</th>
                    <th className={`${TH} text-start`}>{m.colVenue}</th>
                    <th className={`${TH} text-end`}>{m.colAmount}</th>
                    <th className={`${TH} text-end`}>{m.colSwapped}</th>
                    <th className={`${TH} text-end`}>{m.colTttiReceived}</th>
                    <th className="py-1.5 text-start font-normal">
                      {m.colStatus}
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {injections.data.items.map((inj, i) => (
                    <tr
                      key={inj.id.toString()}
                      className="border-b border-border align-top last:border-0"
                      data-ocid={`pools.injections.row.${i + 1}`}
                    >
                      <td className="py-1.5 pe-3">
                        {formatDexDate(inj.startedAt, lang)}
                      </td>
                      <td className="py-1.5 pe-3">{pairOf(inj.poolId)}</td>
                      <td className="py-1.5 pe-3">{venueLabel(m, inj)}</td>
                      <td className="py-1.5 pe-3 text-end">
                        {formatPayAmount(inj.amountIn, inj.token, lang)}
                      </td>
                      <td className="py-1.5 pe-3 text-end">
                        {formatPayAmount(inj.swapAmountIn, inj.token, lang)}
                      </td>
                      <td className="py-1.5 pe-3 text-end">
                        {`${formatTttiAmount(inj.tttiReceived)} ${TTTI_SYMBOL}`}
                      </td>
                      <td className="py-1.5 break-words">
                        {injectionStatusLabel(m, inj.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pageCount > 1n && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => (p > 0n ? p - 1n : 0n))}
                  disabled={page === 0n}
                  data-ocid="pools.injections.pagination_prev"
                >
                  {m.previous}
                </Button>
                <span className="text-muted-foreground tabular-nums">
                  {m.pageOf(formatNumber(page + 1n), formatNumber(pageCount))}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => p + 1n)}
                  disabled={page + 1n >= pageCount}
                  data-ocid="pools.injections.pagination_next"
                >
                  {m.next}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
