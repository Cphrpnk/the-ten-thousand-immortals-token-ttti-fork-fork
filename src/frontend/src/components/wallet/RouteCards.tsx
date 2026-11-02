import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import {
  type RouteKind,
  type RouteState,
  hasComparison,
} from "../../lib/swapRoutes";
import { formatPercent2 } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { swapErrorText } from "../dex/liquidityFormat";
import { Badge } from "../ui/badge";
import { formatSwapAmount } from "./SwapParts";
import { TokenFiat } from "./TokenFiat";

interface RouteCardsProps {
  routes: ReadonlyArray<RouteState>;
  from: TokenDescriptor;
  to: TokenDescriptor;
  /** True once an amount is entered, so a quote is expected. */
  amountEntered: boolean;
  suggested: RouteKind | null;
  active: RouteKind | null;
  disabled: boolean;
  onSelect: (route: RouteKind) => void;
}

/**
 * Every available route side by side, each with its estimated amount
 * received (fees included) and its own loading, error or unavailable state.
 * The route with the highest amount carries a Best price badge; the user's
 * choice always decides which route is executed.
 */
export function RouteCards({
  routes,
  from,
  to,
  amountEntered,
  suggested,
  active,
  disabled,
  onSelect,
}: RouteCardsProps) {
  const t = useDict(SWAP_TEXT);
  const r = useDict(ROUTER_TEXT);
  const dex = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const comparing = hasComparison(routes);

  const unavailableText = (route: RouteState): string => {
    const issue = route.issue;
    if (issue === null) return "";
    switch (issue.kind) {
      case "noPool":
        return route.kind === "native"
          ? t.routeNativeNoPool(from.symbol, to.symbol)
          : t.routeIcpswapNoPool(from.symbol, to.symbol);
      case "poolState":
        return route.kind === "native"
          ? r.reasonNativeUnavailable
          : r.reasonIcpswapUnavailable;
      case "account":
        return t.routeNativeAccount;
      case "failed":
        return route.kind === "native" ? t.routeNativeError : t.quoteError;
      case "swapError":
        return swapErrorText(dex, issue.error, from, to, lang);
    }
  };

  const onlyOne = routes.filter((route) => route.status !== "unavailable");
  const note =
    routes.length === 2 && onlyOne.length === 1 && amountEntered
      ? onlyOne[0].kind === "icpswap"
        ? t.routeOnlyIcpswap
        : t.routeOnlyNative
      : null;

  return (
    <div className="flex flex-col gap-2" data-ocid="wallet.swap.routes">
      <p className="text-sm font-medium text-foreground">{t.routesTitle}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {routes.map((route) => {
          const name = route.kind === "native" ? r.routeNative : r.routeIcpswap;
          const ready = route.status === "ready" && route.received !== null;
          const selected = active === route.kind;
          return (
            <button
              key={route.kind}
              type="button"
              aria-pressed={selected}
              disabled={disabled || !ready}
              onClick={() => onSelect(route.kind)}
              className={`flex flex-col gap-1.5 rounded-lg border px-3 py-3 text-left transition-smooth disabled:cursor-default ${
                selected && ready
                  ? "border-gold bg-gold/5"
                  : "border-border bg-background/60"
              }`}
              data-ocid={`wallet.swap.route.${route.kind}`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {name}
                </span>
                {comparing && suggested === route.kind && (
                  <Badge
                    variant="secondary"
                    data-ocid={`wallet.swap.route.${route.kind}.best_price`}
                  >
                    {t.routeBestPrice}
                  </Badge>
                )}
                {selected && ready && (
                  <span className="text-xs text-muted-foreground">
                    {t.routeSelected}
                  </span>
                )}
              </span>
              {ready && route.received !== null ? (
                <>
                  <span
                    className="font-mono text-sm tabular-nums text-foreground"
                    data-ocid={`wallet.swap.route.${route.kind}.received`}
                  >
                    {`${formatSwapAmount(route.received, to.decimals)} ${to.symbol}`}
                  </span>
                  <TokenFiat
                    token={to}
                    amount={route.received}
                    ocid={`wallet.swap.route.${route.kind}.received.fiat`}
                  />
                  {route.feePct !== null && (
                    <span className="flex flex-wrap items-baseline gap-1.5 text-xs text-muted-foreground">
                      <span>
                        {`${t.poolFee}: ${formatPercent2(route.feePct, lang)}`}
                      </span>
                      {route.poolFee !== null && (
                        <TokenFiat
                          token={from}
                          amount={route.poolFee}
                          ocid={`wallet.swap.route.${route.kind}.fee.fiat`}
                        />
                      )}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className={`text-xs ${route.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
                  data-ocid={`wallet.swap.route.${route.kind}.${route.status}_state`}
                >
                  {route.status === "loading"
                    ? t.routeQuoteLoading
                    : route.status === "idle"
                      ? t.routeEnterAmount
                      : unavailableText(route)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {note && (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="wallet.swap.routes.only_state"
        >
          {note}
        </p>
      )}
      {comparing && (
        <p className="text-xs text-muted-foreground">{t.bestPriceNote}</p>
      )}
    </div>
  );
}
