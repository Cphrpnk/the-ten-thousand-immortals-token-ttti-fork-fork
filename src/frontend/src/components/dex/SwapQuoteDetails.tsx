import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import type { SwapQuote } from "../../backend";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { formatDexUnits } from "./dexFormat";
import { formatBps } from "./liquidityFormat";

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end tabular-nums">{children}</dd>
    </div>
  );
}

/** quoteSwap result: amount out, fee, price impact, minimum received. */
export function SwapQuoteDetails({
  loading,
  quote,
  tokenIn,
  tokenOut,
  error,
}: {
  loading: boolean;
  quote: SwapQuote | null;
  /** The fee is taken from the input amount. */
  tokenIn: { decimals: number; symbol: string };
  tokenOut: { decimals: number; symbol: string };
  error: string | null;
}) {
  const t = useDict(DEX_TEXT);
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
  return (
    <dl
      className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm"
      data-ocid="pools.swap.quote.panel"
    >
      <Line label={t.swapAmountOut}>
        {formatDexUnits(quote.amountOut, tokenOut)}
      </Line>
      <Line label={t.swapFee(formatBps(quote.feeBps))}>
        {formatDexUnits(quote.fee, tokenIn)}
      </Line>
      <Line label={t.swapPriceImpact}>{formatBps(quote.priceImpactBps)}</Line>
      <Line label={t.swapMinimum}>
        {formatDexUnits(quote.minimumReceived, tokenOut)}
      </Line>
    </dl>
  );
}
