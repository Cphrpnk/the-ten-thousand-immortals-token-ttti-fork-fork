import type { ReactNode } from "react";
import { type AuctionView, ReserveBinding } from "../../backend";
import { useAuctionView } from "../../hooks/useAuction";
import { useCountdown } from "../../hooks/useCountdown";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  formatPayAmount,
  formatUsdE8,
} from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { formatDexDate } from "../dex/dexFormat";
import { formatTttiE8 } from "./auctionFormat";

function Row({
  label,
  ocid,
  children,
}: { label: string; ocid: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 tabular-nums sm:text-end" data-ocid={ocid}>
        {children}
      </dd>
    </div>
  );
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** Summary of the open auction: lot, closing, reserve price and the guarantee. */
export function AuctionSummary({ view }: { view: AuctionView }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const countdown = useCountdown(view.closesAt);
  const { isFetching } = useAuctionView();
  const floorUsd = view.reserveFloorUsdE8;
  // The reserve is never shown below the fixed floor.
  const reserveUsd =
    view.reservePriceUsdE8 < floorUsd ? floorUsd : view.reservePriceUsdE8;
  const components = [
    {
      binding: ReserveBinding.floor,
      label: t.floorLabel,
      value: floorUsd as bigint | undefined,
      ocid: "auction.reserve_floor",
    },
    {
      binding: ReserveBinding.dailyAverage,
      label: t.dailyAverageLabel,
      value: view.dailyAverageUsdE8,
      ocid: "auction.reserve_daily_average",
    },
    {
      binding: ReserveBinding.consolidated,
      label: t.currentLabel,
      value: view.consolidatedPriceUsdE8,
      ocid: "auction.reserve_current",
    },
  ];
  const bindingText = {
    [ReserveBinding.floor]: t.bindingFloor,
    [ReserveBinding.dailyAverage]: t.bindingDailyAverage,
    [ReserveBinding.consolidated]: t.bindingConsolidated,
  }[view.reserveBinding];
  const hours = countdown.days * 24 + countdown.hours;

  return (
    <section
      className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6"
      aria-labelledby="auction-summary-title"
      data-ocid="auction.summary"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="auction-summary-title"
          className="font-display text-lg uppercase tracking-[0.2em]"
        >
          {t.summaryTitle}
        </h2>
        <span
          className="rounded-full border border-gold px-3 py-1 text-xs font-medium text-primary"
          data-ocid="auction.reserve_badge"
        >
          {t.reserveBadge}
        </span>
      </div>

      <dl className="flex flex-col gap-3 text-sm">
        <Row label={t.lotSize} ocid="auction.lot_size">
          <span className="font-mono">
            {formatTttiE8(view.lotSizeE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={view.lotSizeE8s}
              className="ml-1.5"
              ocid="auction.lot_size_fiat"
            />
          </span>
        </Row>
        {view.blockSale && (
          <Row label={t.blockSaleLabel} ocid="auction.block_sale">
            {t.blockSaleValue}
          </Row>
        )}
        {view.lotRemainderE8s > 0n && (
          <Row label={t.lotRemainderLabel} ocid="auction.lot_remainder">
            <span className="font-mono">
              {formatTttiE8(view.lotRemainderE8s, lang)} TTTI-T
              <FiatAmount
                token="ttti"
                amount={view.lotRemainderE8s}
                className="ml-1.5"
                ocid="auction.lot_remainder_fiat"
              />
            </span>
          </Row>
        )}
        {view.closesAt !== undefined && (
          <Row label={t.closesAt} ocid="auction.closes_at">
            {formatDexDate(view.closesAt, lang)}
          </Row>
        )}
        <Row label={t.timeLeft} ocid="auction.countdown">
          {countdown.reached ? (
            t.closingReached
          ) : (
            <time className="font-mono">
              {hours}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
            </time>
          )}
        </Row>
      </dl>

      {view.blockSale && (
        <p
          className="callout-info px-3 py-2 text-sm"
          data-ocid="auction.block_sale_rule"
        >
          {t.blockSaleRule}
        </p>
      )}
      {view.lotRemainderE8s > 0n && (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="auction.lot_remainder_note"
        >
          {t.lotRemainderNote}
        </p>
      )}

      <div
        className="flex flex-col gap-4 border-t border-border pt-5"
        aria-busy={isFetching}
      >
        <h3 className="text-sm font-medium">{t.reserveHeading}</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-4">
            <dt className="text-muted-foreground">{t.reserveUsd}</dt>
            <dd
              className="font-mono text-lg tabular-nums"
              data-ocid="auction.reserve_usd"
            >
              {formatUsdE8(reserveUsd, 2, lang)}
            </dd>
          </div>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-4">
            <dt className="text-muted-foreground">{t.consolidatedLabel}</dt>
            <dd
              className="font-mono text-lg tabular-nums"
              data-ocid="auction.consolidated_price"
            >
              {view.consolidatedPriceUsdE8 === undefined
                ? t.consolidatedUnavailable
                : formatUsdE8(view.consolidatedPriceUsdE8, 2, lang)}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t.reserveRule}</p>
          <p className="text-sm font-medium">{t.componentsHeading}</p>
          <ul
            className="grid gap-2 text-sm"
            data-ocid="auction.reserve_components"
          >
            {components.map((c) => (
              <li
                key={c.binding}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-md border border-border px-3 py-2"
              >
                <span className="min-w-0 text-muted-foreground">
                  {c.label}
                  {c.binding === view.reserveBinding && (
                    <span
                      className="ms-2 rounded-full border border-gold px-2 py-0.5 text-xs font-medium text-primary"
                      data-ocid="auction.reserve_binding_badge"
                    >
                      {t.appliedBadge}
                    </span>
                  )}
                </span>
                <span className="font-mono tabular-nums" data-ocid={c.ocid}>
                  {c.value === undefined
                    ? t.consolidatedUnavailable
                    : formatUsdE8(c.value, 2, lang)}
                </span>
              </li>
            ))}
          </ul>
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.reserve_binding_note"
          >
            {bindingText} {t.unavailableNote}
          </p>
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.reserve_settlement_note"
          >
            {t.reserveSettlementNote}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {t.reserveEquivalents}
          </p>
          <ul
            className="grid gap-2 text-sm sm:grid-cols-2"
            data-ocid="auction.reserve_equivalents"
          >
            {PAY_TOKEN_ORDER.map((token) => {
              const entry = view.reservePrices.find((e) => e.token === token);
              return (
                <li
                  key={token}
                  className="flex items-baseline justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <span className="font-mono text-muted-foreground">
                    {PAY_TOKENS[token].symbol}
                  </span>
                  <span className="min-w-0 break-words text-end font-mono tabular-nums">
                    {entry?.price === undefined
                      ? t.rateUnavailable
                      : formatPayAmount(entry.price, token, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p
        className="callout-info px-3 py-2 text-sm"
        data-ocid="auction.reserve_note"
      >
        {t.reserveSentence}
      </p>
    </section>
  );
}
