import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PoolKind, ReferenceSourceKind } from "../../backend";
import type { PoolTokenView, PoolView } from "../../backend";
import {
  useConsolidatedTttiPrice,
  useReferencePrice,
} from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import {
  QUOTE_TTL_MS,
  readSwapQuote,
  resolveSwapPool,
} from "../../lib/icpswap";
import {
  consolidatedPriceUsdE8,
  consolidatedUnavailableText,
} from "./ConsolidatedPrice";
import { useDexUnitsText } from "./DexFiat";
import { TD, TDR, TH, THR, TR, Table } from "./indicatorParts";
import {
  REFERENCE_WARNING_PCT,
  formatBps,
  formatUsdE8,
} from "./liquidityFormat";

/**
 * ICPSwap price shown as a reference only: quote of `amount0` of token0, and
 * the deviation of the deposit ratio amount1 / amount0 from it.
 */
export function IcpswapReference({
  token0,
  token1,
  amount0,
  amount1,
}: {
  token0: PoolTokenView;
  token1: PoolTokenView;
  amount0: bigint;
  amount1: bigint;
}) {
  const t = useDict(DEX_TEXT);
  const unitsText = useDexUnitsText();
  const ledger0 = token0.ledgerId.toText();
  const ledger1 = token1.ledgerId.toText();

  const ref = useQuery({
    queryKey: ["icpswapReference", ledger0, ledger1, amount0.toString()],
    queryFn: async () => {
      const pool = await resolveSwapPool(ledger0, ledger1);
      if (!pool) return null;
      const out = await readSwapQuote(pool, ledger0, amount0);
      return { out };
    },
    enabled: amount0 > 0n,
    staleTime: QUOTE_TTL_MS,
    retry: 1,
  });

  let body: { text: string; warn?: boolean; extra?: string };
  if (ref.isPending) body = { text: t.refLoading };
  else if (ref.isError) body = { text: t.refError };
  else if (!ref.data || ref.data.out === 0n) body = { text: t.refUnavailable };
  else {
    const out = ref.data.out;
    const deviation = Math.abs(Number(amount1) / Number(out) - 1) * 100;
    const pct = formatNumber(deviation, { maximumFractionDigits: 2 });
    const warn = deviation > REFERENCE_WARNING_PCT;
    body = {
      text: t.refQuote(unitsText(amount0, token0), unitsText(out, token1)),
      extra: warn ? t.refDeviationWarning(pct) : t.refDeviation(pct),
      warn,
    };
  }

  return (
    <div
      className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-xs"
      data-ocid="pools.add.reference.panel"
      aria-live="polite"
    >
      <span className="font-medium">{t.refTitle}</span>
      <span className="text-muted-foreground tabular-nums">{body.text}</span>
      {body.extra && (
        <span
          className={body.warn ? "callout-danger px-2 py-1" : "tabular-nums"}
          data-ocid={body.warn ? "pools.add.reference.error_state" : undefined}
        >
          {body.extra}
        </span>
      )}
    </div>
  );
}

const E8 = 100_000_000;
const priceText = (value: bigint) =>
  formatNumber(Number(value) / E8, { maximumFractionDigits: 6 });

/**
 * Reference price of the first deposit of an empty pool: price, each source
 * with its weight, the tolerance band and the unavailable case. Information
 * only, never a recommendation.
 */
export function ReferencePriceBlock({ pool }: { pool: PoolView }) {
  const t = useDict(DEX_TEXT);
  const reference = useReferencePrice(pool.id);
  const consolidated = useConsolidatedTttiPrice();
  const data = reference.data;

  let content: ReactNode;
  if (reference.isPending) {
    content = (
      <span className="text-muted-foreground">{t.referenceLoading}</span>
    );
  } else if (reference.isError) {
    content = (
      <span className="text-muted-foreground">{t.referenceLoadError}</span>
    );
  } else if (!data) {
    content = null;
  } else {
    const unavailable = data.unavailable;
    let unavailableText: string | null = null;
    if (unavailable?.__kind__ === "noReadableSource") {
      unavailableText = t.referenceUnavailableNoSource;
    } else if (unavailable?.__kind__ === "rateUnavailable") {
      const missing = [
        unavailable.rateUnavailable.token0 ? pool.token0.symbol : null,
        unavailable.rateUnavailable.token1 ? pool.token1.symbol : null,
      ].filter((s): s is string => s !== null);
      unavailableText = t.referenceUnavailableRate(missing.join(", "));
    } else if (!data.available) {
      unavailableText = t.referenceUnavailableNoSource;
    }
    const isTtti = data.kind === PoolKind.tttiPair;
    content = (
      <>
        <span className="text-muted-foreground">
          {t.referenceIntro(
            formatNumber(Number(data.toleranceBps) / 100, {
              maximumFractionDigits: 2,
            }),
          )}
        </span>
        {unavailableText && (
          <span
            className="callout-info px-2 py-1 text-foreground"
            data-ocid="pools.reference.unavailable_state"
          >
            {unavailableText}
          </span>
        )}
        {!data.ratesValid && !isTtti && (
          <span className="text-muted-foreground">
            {t.referenceRatesInvalid}
          </span>
        )}
        {isTtti && consolidated.data && (
          <span className="tabular-nums" data-ocid="pools.reference.price">
            {consolidatedPriceUsdE8(consolidated.data) !== null
              ? t.referenceConsolidatedPrice(
                  priceText(consolidatedPriceUsdE8(consolidated.data) ?? 0n),
                )
              : consolidated.data.price.__kind__ === "unavailable"
                ? consolidatedUnavailableText(
                    t,
                    consolidated.data.price.unavailable,
                  )
                : null}
          </span>
        )}
        {data.sources.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">
              {t.referenceSourcesTitle}
            </span>
            <Table
              head={
                <>
                  <th className={TH}>{t.referenceColSource}</th>
                  <th className={THR}>{t.referenceColPrice}</th>
                  <th className={THR}>{t.referenceColDepth}</th>
                  <th className={THR}>{t.referenceColWeight}</th>
                </>
              }
            >
              {data.sources.map((source, i) => (
                <tr
                  key={`${source.kind}-${source.sourceLabel}-${source.poolId?.toString() ?? "ext"}`}
                  className={TR}
                  data-ocid={`pools.reference.source.${i + 1}`}
                >
                  <td className={TD}>
                    {source.sourceLabel ||
                      (source.kind === ReferenceSourceKind.native
                        ? t.referenceSourceNative
                        : t.referenceSourceIcpswap)}
                  </td>
                  <td className={TDR}>{priceText(source.tttiPriceUsdE8)}</td>
                  <td className={TDR}>{formatUsdE8(source.depthUsdE8)}</td>
                  <td className={TDR}>{formatBps(source.weightBps)}</td>
                </tr>
              ))}
            </Table>
          </div>
        )}
        <span className="tabular-nums">
          {t.referenceTolerance(
            formatNumber(Number(data.toleranceBps) / 100, {
              maximumFractionDigits: 2,
            }),
          )}
        </span>
        {!isTtti && (
          <span className="text-muted-foreground">
            {t.referenceUtilityBasis}
          </span>
        )}
      </>
    );
  }
  if (content === null) return null;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-md border border-border px-3 py-2 text-xs"
      data-ocid="pools.reference.panel"
      aria-live="polite"
    >
      <span className="font-medium">{t.referenceTitle}</span>
      {content}
    </div>
  );
}
