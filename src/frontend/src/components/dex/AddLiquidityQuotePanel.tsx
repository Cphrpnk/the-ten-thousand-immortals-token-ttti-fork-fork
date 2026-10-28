import { Loader2 } from "lucide-react";
import { PoolSide } from "../../backend";
import type { AddLiquidityQuote, PoolView } from "../../backend";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { IcpswapReference } from "./IcpswapReference";
import { formatDexUnits } from "./dexFormat";
import { gaugeText } from "./liquidityFormat";

/** quoteAddLiquidity result: counter amount, shares, gauge after, reference. */
export function AddLiquidityQuotePanel({
  pool,
  side,
  loading,
  quote,
  error,
  showOpens,
}: {
  pool: PoolView;
  side: PoolSide;
  loading: boolean;
  quote: AddLiquidityQuote | null;
  error: string | null;
  showOpens: boolean;
}) {
  const t = useDict(DEX_TEXT);

  if (loading) {
    return (
      <p
        className="flex items-center gap-2 text-sm text-muted-foreground"
        data-ocid="pools.add.quote.loading_state"
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
        data-ocid="pools.add.quote.error_state"
      >
        {error}
      </p>
    );
  }
  if (!quote) return null;

  const counter =
    side === PoolSide.token0
      ? formatDexUnits(quote.amount1, pool.token1)
      : formatDexUnits(quote.amount0, pool.token0);

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.add.quote.panel">
      <ul className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm tabular-nums">
        {!quote.isFirstDeposit && <li>{t.counterComputed(counter)}</li>}
        <li>{t.sharesToReceive(formatNumber(quote.shares))}</li>
        {quote.lockedShares > 0n && (
          <li className="text-muted-foreground">
            {t.sharesLockedForever(formatNumber(quote.lockedShares))}
          </li>
        )}
        <li>{t.gaugeAfter(gaugeText(t, quote.gaugeAfter))}</li>
        {showOpens && (
          <li
            className={
              quote.opensPool ? "text-foreground" : "text-muted-foreground"
            }
          >
            {quote.opensPool ? t.opensPool : t.staysFilling}
          </li>
        )}
      </ul>
      <IcpswapReference
        token0={pool.token0}
        token1={pool.token1}
        amount0={quote.amount0}
        amount1={quote.amount1}
      />
    </div>
  );
}
