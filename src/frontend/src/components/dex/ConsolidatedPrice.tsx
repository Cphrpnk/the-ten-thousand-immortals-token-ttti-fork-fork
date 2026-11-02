import type { ReactNode } from "react";
import { ConsolidatedUnavailable } from "../../backend";
import type { ConsolidatedPrice as ConsolidatedPriceView } from "../../backend";
import { useConsolidatedTttiPrice } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { DexAccordion } from "./DexAccordion";
import { type DexText, formatDexDate } from "./dexFormat";
import { formatBps, formatUsdE8 } from "./liquidityFormat";

/** Basis points as a signed localized percentage, e.g. 308 → "+3.08 %". */
export function formatSignedBps(bps: bigint): string {
  return `${formatNumber(Number(bps) / 100, {
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  })} %`;
}

/** Short factual text for an unavailable consolidated price. */
export function consolidatedUnavailableText(
  t: DexText,
  reason: ConsolidatedUnavailable,
): string {
  return reason === ConsolidatedUnavailable.noValidRate
    ? t.consolidatedUnavailableNoRate
    : t.consolidatedUnavailableNoPool;
}

/** The consolidated price in USD, or null while unavailable. */
export function consolidatedPriceUsdE8(
  price: ConsolidatedPriceView | undefined,
): bigint | null {
  return price?.price.__kind__ === "available" ? price.price.available : null;
}

function Row({
  label,
  ocid,
  children,
}: {
  label: string;
  ocid: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 tabular-nums sm:text-end" data-ocid={ocid}>
        {children}
      </dd>
    </div>
  );
}

/** Average with its sample count, or the not-available text. */
function averageText(
  t: DexText,
  value: bigint | undefined,
  samples: bigint,
): string {
  const count = t.consolidatedSamples(formatNumber(samples));
  return value === undefined
    ? `${t.consolidatedNotAvailable} · ${count}`
    : `${t.consolidatedUsd(formatUsdE8(value))} · ${count}`;
}

function ConsolidatedBody({ price }: { price: ConsolidatedPriceView }) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const current = consolidatedPriceUsdE8(price);
  if (price.price.__kind__ === "unavailable") {
    return (
      <p
        className="callout-info px-3 py-2 text-sm text-foreground"
        data-ocid="pools.consolidated_price.unavailable_state"
      >
        {consolidatedUnavailableText(t, price.price.unavailable)}
      </p>
    );
  }
  return (
    <>
      <dl className="flex flex-col gap-2 text-sm">
        <Row
          label={t.consolidatedCurrent}
          ocid="pools.consolidated_price.value"
        >
          {current === null
            ? t.consolidatedNotAvailable
            : t.consolidatedUsd(formatUsdE8(current))}
        </Row>
        <Row
          label={t.consolidatedHourly}
          ocid="pools.consolidated_price.hourly"
        >
          {averageText(t, price.hourlyAverageUsdE8, price.hourlySamples)}
        </Row>
        <Row label={t.consolidatedDaily} ocid="pools.consolidated_price.daily">
          {averageText(t, price.dailyAverageUsdE8, price.dailySamples)}
        </Row>
        <Row
          label={t.consolidatedComputedLabel}
          ocid="pools.consolidated_price.computed_at"
        >
          {formatDexDate(price.computedAt, lang)}
        </Row>
      </dl>
      {price.sources.length > 0 && (
        <ul
          className="flex flex-col gap-1 text-xs text-muted-foreground tabular-nums"
          data-ocid="pools.consolidated_price.sources"
        >
          {price.sources.map((source) => (
            <li key={source.poolId.toString()}>
              {t.consolidatedSource(
                source.counterSymbol,
                formatUsdE8(source.priceUsdE8),
                formatBps(source.weightBps),
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t.consolidatedNote}</p>
    </>
  );
}

/**
 * Consolidated TTTI-T price (USD, weighted by pool depth) with its hourly and
 * 24 h averages, in a closed accordion. Shown once on the pools page.
 */
export function ConsolidatedPrice() {
  const t = useDict(DEX_TEXT);
  const query = useConsolidatedTttiPrice();
  const current = consolidatedPriceUsdE8(query.data);

  let body: ReactNode;
  if (query.isPending) {
    body = (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="pools.consolidated_price.loading_state"
      >
        {t.loading}
      </p>
    );
  } else if (query.isError || !query.data) {
    body = (
      <p
        className="callout-danger px-3 py-2 text-sm"
        data-ocid="pools.consolidated_price.error_state"
      >
        {t.consolidatedLoadError}
      </p>
    );
  } else {
    body = <ConsolidatedBody price={query.data} />;
  }

  return (
    <DexAccordion
      label={t.consolidatedTitle}
      count={
        current === null ? undefined : t.consolidatedUsd(formatUsdE8(current))
      }
      ocid="pools.consolidated_price"
    >
      {body}
    </DexAccordion>
  );
}
