import { TrendingUp } from "lucide-react";
import type { PayToken, PriceSource } from "../../backend";
import { formatRateUsd, priceSourceLabel } from "../../hooks/useQueries";
import { type Lang, toIntlLocale } from "../../i18n/core";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";
import { formatTtti, payTokenSymbol } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

/** Hourly USD rate of a pay token. */
export interface TokenRate {
  usdE8: bigint;
  source: PriceSource;
  fetchedAt: bigint;
  validUntil: bigint;
  usable: boolean;
}

interface TokenRateCardProps {
  token: PayToken;
  rate: TokenRate | null;
  /** "Rate for this hour: …", empty without a rate. */
  rateLine: string;
  priceAvailable: boolean;
  isLoading: boolean;
  /** TTTI-T bought with one whole token, null without a rate. */
  oneTokenBuys: bigint | null;
  feeLabel: string;
  /** Smallest mint, e.g. "0.0001 TTTI-T". */
  minimumText: string;
  className: string;
}

function fetchedText(
  timestamp: bigint | undefined,
  never: string,
  lang: Lang,
): string {
  if (timestamp === undefined || timestamp <= 0n) return never;
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return never;
  return date.toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Rate, fee, minimum and treasury of the selected pay token. */
export function TokenRateCard({
  token,
  rate,
  rateLine,
  priceAvailable,
  isLoading,
  oneTokenBuys,
  feeLabel,
  minimumText,
  className,
}: TokenRateCardProps) {
  const t = useDict(BUY_PANELS_TEXT);
  const { lang } = useLanguage();
  const symbol = payTokenSymbol(token);

  return (
    <Card className={className} data-ocid="exchange.price_card">
      <CardHeader className="pb-3">
        <CardTitle className="text-imperial flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          {symbol}/USD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          <Skeleton className="h-8 w-40" />
        ) : (
          <span
            className="block font-mono text-2xl font-bold tabular-nums text-primary"
            data-ocid="exchange.icp_price"
          >
            {rate && rate.usdE8 > 0n ? `${formatRateUsd(rate.usdE8)} USD` : "—"}
          </span>
        )}
        {!isLoading && (
          <p
            className="text-xs tabular-nums text-muted-foreground"
            data-ocid="exchange.hourly_rate"
          >
            {rateLine || t.noRate(symbol)}
          </p>
        )}
        {!isLoading && !priceAvailable && (
          <p
            className="text-xs text-destructive"
            data-ocid="exchange.rate_unusable_note"
          >
            {t.unavailableUntilRate(symbol)}
          </p>
        )}
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t.oneBuys(symbol)}</dt>
            <dd className="font-mono tabular-nums">
              {oneTokenBuys !== null
                ? `${formatTtti(oneTokenBuys)} TTTI-T`
                : "—"}{" "}
              <FiatAmount token="ttti" amount={oneTokenBuys} />
            </dd>
          </div>
          <Separator className="bg-primary/20" />
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t.source}</dt>
            <dd data-ocid="exchange.price_source">
              {rate ? priceSourceLabel(rate.source, lang) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t.fetched}</dt>
            <dd className="text-right">
              {fetchedText(rate?.fetchedAt, t.never, lang)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t.feeFixed}</dt>
            <dd
              className="font-mono tabular-nums"
              data-ocid="exchange.cycles_fee"
            >
              {t.inToken(feeLabel, symbol)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t.minimum}</dt>
            <dd className="font-mono tabular-nums" data-ocid="exchange.minimum">
              {minimumText}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
