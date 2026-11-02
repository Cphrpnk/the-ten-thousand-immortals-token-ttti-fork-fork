import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useDict, useLanguage } from "../../i18n/core";
import { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import type { RouteKind } from "../../lib/swapRoutes";
import { formatPercent2 } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { Button } from "../ui/button";
import { formatSwapAmount } from "./SwapParts";
import { TokenFiat } from "./TokenFiat";

export interface RouteQuoteDetailsProps {
  route: RouteKind;
  from: TokenDescriptor;
  to: TokenDescriptor;
  amountIn: bigint;
  /** Estimated amount received, ledger fee already deducted. */
  received: bigint;
  /** Guaranteed minimum received, ledger fee already deducted. */
  minReceived: bigint;
  /** Pool fee as a percentage value (0.3 for 0.3 %). */
  feePct: number;
  /** Pool fee in base units of the token given. */
  poolFee: bigint;
  expired: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

function Amount({
  token,
  value,
  ocid,
}: {
  token: TokenDescriptor;
  value: bigint;
  ocid: string;
}) {
  return (
    <span className="flex flex-col items-end">
      <span>{`${formatSwapAmount(value, token.decimals)} ${token.symbol}`}</span>
      <TokenFiat token={token} amount={value} ocid={`${ocid}.fiat`} />
    </span>
  );
}

/**
 * Route used, amount given, estimated amount received, fees and guaranteed
 * minimum of the chosen route, each with its USD equivalent.
 */
export function RouteQuoteDetails({
  route,
  from,
  to,
  amountIn,
  received,
  minReceived,
  feePct,
  poolFee,
  expired,
  refreshing,
  onRefresh,
}: RouteQuoteDetailsProps) {
  const t = useDict(SWAP_TEXT);
  const r = useDict(ROUTER_TEXT);
  const { lang } = useLanguage();
  const rows: Array<[string, ReactNode, string]> = [
    [t.routeUsed, route === "native" ? r.routeNative : r.routeIcpswap, "route"],
    [
      t.amountGiven,
      <Amount
        key="given"
        token={from}
        value={amountIn}
        ocid="wallet.swap.quote.given"
      />,
      "given",
    ],
    [
      t.estimated,
      <Amount
        key="estimated"
        token={to}
        value={received}
        ocid="wallet.swap.quote.estimated"
      />,
      "estimated",
    ],
    [
      t.poolFee,
      <span key="pool-fee" className="flex flex-col items-end">
        <span>{formatPercent2(feePct, lang)}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-xs text-muted-foreground">
            {`${formatSwapAmount(poolFee, from.decimals)} ${from.symbol}`}
          </span>
          <TokenFiat
            token={from}
            amount={poolFee}
            ocid="wallet.swap.quote.pool_fee.fiat"
          />
        </span>
      </span>,
      "pool_fee",
    ],
    [
      t.ledgerFees,
      <span key="ledger" className="flex flex-col items-end">
        <span>
          {t.ledgerFeesValue(
            `${formatSwapAmount(2n * from.fee, from.decimals)} ${from.symbol}`,
            `${formatSwapAmount(to.fee, to.decimals)} ${to.symbol}`,
          )}
        </span>
        <span className="flex items-baseline gap-1.5">
          <TokenFiat
            token={from}
            amount={2n * from.fee}
            ocid="wallet.swap.quote.ledger_fees.fiat_in"
          />
          <TokenFiat
            token={to}
            amount={to.fee}
            ocid="wallet.swap.quote.ledger_fees.fiat_out"
          />
        </span>
      </span>,
      "ledger_fees",
    ],
    [
      t.minimumReceived,
      <Amount
        key="minimum"
        token={to}
        value={minReceived}
        ocid="wallet.swap.quote.minimum"
      />,
      "minimum",
    ],
  ];
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid="wallet.swap.quote.panel"
    >
      <dl className="flex flex-col gap-1.5 text-sm">
        {rows.map(([label, value, id]) => (
          <div key={id} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
              className="text-right font-mono tabular-nums text-foreground"
              data-ocid={`wallet.swap.quote.${id}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {expired && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-destructive">
          <span data-ocid="wallet.swap.quote_expired_state">
            {t.quoteExpired}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            data-ocid="wallet.swap.refresh_quote_button"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {t.refreshQuote}
          </Button>
        </div>
      )}
    </div>
  );
}
