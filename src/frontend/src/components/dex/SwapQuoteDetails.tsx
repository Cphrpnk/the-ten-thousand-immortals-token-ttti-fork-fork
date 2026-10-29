import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { RouteReason } from "../../backend";
import type { RouteFees, RoutedQuote } from "../../backend";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
import { formatDexUnits } from "./dexFormat";
import { formatBps } from "./liquidityFormat";
import { routeName } from "./routeFormat";

type TokenFormat = { decimals: number; symbol: string };

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end tabular-nums">{children}</dd>
    </div>
  );
}

/** Fees of the chosen route, in input-token units. */
function FeeLines({
  fees,
  tokenIn,
}: { fees: RouteFees; tokenIn: TokenFormat }) {
  const t = useDict(DEX_TEXT);
  const r = useDict(ROUTER_TEXT);
  if (fees.__kind__ === "native") {
    return (
      <Line label={t.swapFee(formatBps(fees.native.feeBps))}>
        {formatDexUnits(fees.native.fee, tokenIn)}
      </Line>
    );
  }
  const f = fees.icpswap;
  return (
    <>
      <Line label={r.icpswapFee(formatBps(f.icpswapFeeBps))}>
        {formatDexUnits(f.icpswapFee, tokenIn)}
      </Line>
      <Line label={r.protocolFee(formatBps(f.protocolFeeBps))}>
        {formatDexUnits(f.protocolFee, tokenIn)}
      </Line>
      <p className="text-xs text-muted-foreground">
        {r.protocolSplit(
          formatDexUnits(f.protocolLpShare, tokenIn),
          formatDexUnits(f.protocolPermanentShare, tokenIn),
        )}
      </p>
    </>
  );
}

const REASON_KEY = {
  [RouteReason.bestAmount]: "reasonBestAmount",
  [RouteReason.nativeUnavailable]: "reasonNativeUnavailable",
  [RouteReason.icpswapUnavailable]: "reasonIcpswapUnavailable",
} as const;

/** quoteRoutedSwap result: route, amount out, fees, minimum, other route. */
export function SwapQuoteDetails({
  loading,
  quote,
  tokenIn,
  tokenOut,
  error,
}: {
  loading: boolean;
  quote: RoutedQuote | null;
  /** Fees are taken from the input amount. */
  tokenIn: TokenFormat;
  tokenOut: TokenFormat;
  error: string | null;
}) {
  const t = useDict(DEX_TEXT);
  const r = useDict(ROUTER_TEXT);
  if (loading) {
    return (
      <p
        className="flex items-center gap-2 text-sm text-muted-foreground"
        data-ocid="pools.swap.quote.loading_state"
      >
        <Loader2
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        {t.quoting}
      </p>
    );
  }
  if (error) {
    return (
      <p
        className="callout-danger px-3 py-2 text-sm break-words"
        data-ocid="pools.swap.quote.error_state"
      >
        {error}
      </p>
    );
  }
  if (!quote) return null;
  const alt = quote.alternative;
  return (
    <dl
      className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm"
      data-ocid="pools.swap.quote.panel"
    >
      <Line label={r.routeLabel}>
        <span className="font-medium" data-ocid="pools.swap.quote.route">
          {routeName(r, quote.route)}
        </span>
      </Line>
      <p className="text-xs text-muted-foreground">
        {r[REASON_KEY[quote.reason]]}
      </p>
      <Line label={t.swapAmountOut}>
        {formatDexUnits(quote.amountOut, tokenOut)}
      </Line>
      <FeeLines fees={quote.fees} tokenIn={tokenIn} />
      <Line label={t.swapMinimum}>
        {formatDexUnits(quote.minimumReceived, tokenOut)}
      </Line>
      {alt ? (
        <Line label={r.alternativeLabel(routeName(r, alt.route))}>
          {formatDexUnits(alt.amountOut, tokenOut)}
        </Line>
      ) : (
        <Line label={r.alternativeNone}>{r.alternativeUnavailable}</Line>
      )}
    </dl>
  );
}
