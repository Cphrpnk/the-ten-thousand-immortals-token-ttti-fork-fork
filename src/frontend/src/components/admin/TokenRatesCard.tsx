import { AlertCircle, Loader2, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { PayToken, TokenPrice } from "../../backend";
import {
  PRICE_SOURCE_LABELS,
  formatRateUsd,
  useGetTokenPrices,
  useRefreshTokenPrice,
} from "../../hooks/useQueries";
import { PAY_TOKEN_ORDER, payTokenSymbol } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, SECONDARY_GOLD } from "./styles";

interface RateRowProps {
  token: PayToken;
  price: TokenPrice | undefined;
  index: number;
  isRefreshing: boolean;
  refreshBusy: boolean;
  onRefresh: (token: PayToken) => void;
}

function RateRow({
  token,
  price,
  index,
  isRefreshing,
  refreshBusy,
  onRefresh,
}: RateRowProps) {
  const symbol = payTokenSymbol(token);
  const usable = price?.usable ?? false;
  const hasRate = !!price && price.usdE8 > 0n;

  return (
    <div
      className="space-y-4 border-t border-border pt-6 first:border-t-0 first:pt-0"
      data-ocid={`admin.rate.item.${index}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-16 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {symbol}
          </span>
          <p
            className="font-mono text-xl font-semibold tabular-nums tracking-tight text-primary"
            data-ocid={`admin.rate.price.${index}`}
          >
            {hasRate && price ? `${formatRateUsd(price.usdE8)} USD` : "—"}
          </p>
          <Badge variant="outline" data-ocid={`admin.rate.source.${index}`}>
            {price ? PRICE_SOURCE_LABELS[price.source] : "No rate"}
          </Badge>
          <Badge
            variant={usable ? "default" : "destructive"}
            data-ocid={`admin.rate.status.${index}`}
          >
            {usable ? "Usable" : hasRate ? "Expired" : "Absent"}
          </Badge>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={SECONDARY_GOLD}
          onClick={() => onRefresh(token)}
          disabled={refreshBusy || usable}
          title={
            usable
              ? "Refresh is allowed only when the rate is expired or absent."
              : undefined
          }
          data-ocid={`admin.rate.refresh_button.${index}`}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh {symbol}
            </>
          )}
        </Button>
      </div>

      <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
        <dt className="text-muted-foreground">Valid until</dt>
        <dd className="font-mono tabular-nums">
          {price && price.validUntil > 0n
            ? formatTimestamp(price.validUntil)
            : "—"}
        </dd>
        <dt className="text-muted-foreground">Last success</dt>
        <dd
          className="font-mono tabular-nums"
          data-ocid={`admin.rate.last_success.${index}`}
        >
          {price?.lastSuccessAt !== undefined && price.lastSuccessAt !== null
            ? formatTimestamp(price.lastSuccessAt)
            : "None"}
        </dd>
        <dt className="text-muted-foreground">Last error</dt>
        <dd
          className="min-w-0 sm:col-span-3"
          data-ocid={`admin.rate.last_error.${index}`}
        >
          {price?.lastError ? (
            <>
              <span className="break-words text-destructive">
                {price.lastError.message}
              </span>
              <span className="block font-mono text-xs tabular-nums text-muted-foreground">
                {formatTimestamp(price.lastError.at)}
              </span>
            </>
          ) : (
            "None"
          )}
        </dd>
      </dl>
    </div>
  );
}

/** Hourly USD rates of ICP, ckBTC, ckUSDC and ckUSDT with per-token refresh. */
export function TokenRatesCard() {
  const { data: prices, isLoading, isError } = useGetTokenPrices();
  const refresh = useRefreshTokenPrice();

  const handleRefresh = (token: PayToken) => {
    const symbol = payTokenSymbol(token);
    refresh.mutate(token, {
      onSuccess: () => toast.success(`${symbol}/USD rate refreshed`),
      onError: (error) =>
        toast.error(error.message || `The ${symbol} rate refresh failed.`),
    });
  };

  return (
    <Card className={GOLD_CARD} data-ocid="admin.oracle_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          USD Rates
        </CardTitle>
        <CardDescription>
          Each rate is set once an hour from Coinbase, or from CoinGecko if
          Coinbase is unavailable. Manual refresh is allowed only when a rate is
          expired or absent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4" data-ocid="admin.oracle_loading_state">
            {PAY_TOKEN_ORDER.map((token) => (
              <Skeleton key={token} className="h-16 w-full" />
            ))}
          </div>
        ) : isError || !prices ? (
          <Alert variant="destructive" data-ocid="admin.oracle_error_state">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>The rates could not be loaded.</AlertDescription>
          </Alert>
        ) : (
          PAY_TOKEN_ORDER.map((token, i) => (
            <RateRow
              key={token}
              token={token}
              index={i + 1}
              price={prices.find((p) => p.token === token)}
              isRefreshing={refresh.isPending && refresh.variables === token}
              refreshBusy={refresh.isPending}
              onRefresh={handleRefresh}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
