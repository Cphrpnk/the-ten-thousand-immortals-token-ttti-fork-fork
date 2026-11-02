import { ReserveBinding } from "../../backend";
import type { ClosedAuctionView } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { PAY_TOKENS, PAY_TOKEN_ORDER, formatUsdE8 } from "../../lib/token";

/** Reserve applied at closing, the three compared values and the rates used. */
export function ClosedReserve({ auction }: { auction: ClosedAuctionView }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const key = auction.id.toString();
  const reserve = auction.reserve;
  const components = [
    {
      binding: ReserveBinding.floor,
      label: t.floorLabel,
      value: reserve.floorUsdE8 as bigint | undefined,
    },
    {
      binding: ReserveBinding.dailyAverage,
      label: t.dailyAverageLabel,
      value: reserve.dailyAverageUsdE8,
    },
    {
      binding: ReserveBinding.consolidated,
      label: t.currentLabel,
      value: reserve.consolidatedUsdE8,
    },
  ];

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-5">
      <h4 className="text-sm font-medium">{t.resultReserveHeading}</h4>
      <div className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-4 text-sm">
        <span className="text-muted-foreground">{t.resultReserveLabel}</span>
        <span
          className="font-mono text-lg tabular-nums"
          data-ocid={`auction.closed.reserve.${key}`}
        >
          {formatUsdE8(reserve.reserveUsdE8, 2, lang)}
        </span>
      </div>
      <p className="text-sm font-medium">{t.componentsHeading}</p>
      <ul className="grid gap-2 text-sm">
        {components.map((c) => (
          <li
            key={c.binding}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-md border border-border px-3 py-2"
          >
            <span className="min-w-0 text-muted-foreground">
              {c.label}
              {c.binding === reserve.binding && (
                <span className="ms-2 rounded-full border border-gold px-2 py-0.5 text-xs font-medium text-primary">
                  {t.appliedBadge}
                </span>
              )}
            </span>
            <span className="font-mono tabular-nums">
              {c.value === undefined
                ? t.consolidatedUnavailable
                : formatUsdE8(c.value, 2, lang)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium">{t.resultRatesHeading}</p>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {PAY_TOKEN_ORDER.map((token) => {
          const rate = auction.rates.find((r) => r.token === token);
          return (
            <li
              key={token}
              className="flex items-baseline justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <span className="font-mono text-muted-foreground">
                {PAY_TOKENS[token].symbol}
              </span>
              <span className="font-mono tabular-nums">
                {rate?.usdE8 === undefined
                  ? t.rateUnavailable
                  : formatUsdE8(rate.usdE8, 2, lang)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
