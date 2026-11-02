import { Loader2 } from "lucide-react";
import { PoolSide } from "../../backend";
import type {
  AddLiquidityQuote,
  PoolView,
  ReferenceCheck,
} from "../../backend";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { DexFiat, useDexUnitsText } from "./DexFiat";
import { IcpswapReference } from "./IcpswapReference";
import { formatDexUnits } from "./dexFormat";
import {
  formatUsdE8,
  percentText,
  ratioText,
  referenceUnavailableText,
} from "./liquidityFormat";

const BPS = 10_000n;

/** quoteAddLiquidity result: computed counter amount, shares, depth after, reference check. */
export function AddLiquidityQuotePanel({
  pool,
  loading,
  quote,
  error,
}: {
  pool: PoolView;
  loading: boolean;
  quote: AddLiquidityQuote | null;
  error: string | null;
}) {
  const t = useDict(DEX_TEXT);
  const unitsText = useDexUnitsText();

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

  const counterToken =
    quote.counterSide === PoolSide.token0 ? pool.token0 : pool.token1;
  const lowBps = quote.slippageBps > BPS ? BPS : quote.slippageBps;
  const low = (quote.counterAmount * (BPS - lowBps)) / BPS;
  const high = (quote.counterAmount * (BPS + quote.slippageBps)) / BPS;
  const check = quote.referenceCheck;

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.add.quote.panel">
      <ul className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm tabular-nums">
        {!quote.isFirstDeposit && (
          <>
            <li data-ocid="pools.add.quote.counter">
              {t.counterSideLabel}:{" "}
              <span className="font-medium">
                {formatDexUnits(quote.counterAmount, counterToken)}
              </span>{" "}
              <DexFiat token={counterToken} amount={quote.counterAmount} />
            </li>
            <li className="text-xs text-muted-foreground">
              {t.counterSideNote}
            </li>
            <li className="text-xs text-muted-foreground">
              {t.counterSideRange(
                unitsText(low, counterToken),
                unitsText(high, counterToken),
              )}
            </li>
          </>
        )}
        <li>{t.sharesToReceive(formatNumber(quote.shares))}</li>
        {quote.lockedShares > 0n && (
          <li className="text-muted-foreground">
            {t.sharesLockedForever(formatNumber(quote.lockedShares))}
          </li>
        )}
        <li data-ocid="pools.add.quote.depth">
          {quote.depthAfterUsdE8 !== undefined
            ? t.depthAfter(formatUsdE8(quote.depthAfterUsdE8))
            : t.depthUnavailable}
        </li>
      </ul>
      {check.applicable && <ReferenceCheckBlock pool={pool} check={check} />}
      <IcpswapReference
        token0={pool.token0}
        token1={pool.token1}
        amount0={quote.amount0}
        amount1={quote.amount1}
      />
    </div>
  );
}

/** First deposit into an empty pool: result of the reference-price check. */
function ReferenceCheckBlock({
  pool,
  check,
}: {
  pool: PoolView;
  check: ReferenceCheck;
}) {
  const t = useDict(DEX_TEXT);
  const tone = check.withinBand
    ? "callout-info text-foreground"
    : "callout-danger";
  return (
    <div
      className={`${tone} flex flex-col gap-1 px-3 py-2 text-sm break-words`}
      data-ocid="pools.add.reference.panel"
    >
      <p className="font-medium">{t.referenceTitle}</p>
      {check.unavailable ? (
        <p data-ocid="pools.add.reference.error_state">
          {referenceUnavailableText(t, check.unavailable, pool)}
        </p>
      ) : (
        <>
          {check.expected && (
            <p className="tabular-nums">
              {t.referenceExpected(ratioText(check.expected, pool))}
            </p>
          )}
          {check.deviationBps !== undefined && (
            <p
              className="tabular-nums"
              data-ocid={
                check.withinBand
                  ? "pools.add.reference.success_state"
                  : "pools.add.reference.error_state"
              }
            >
              {check.withinBand
                ? t.referenceWithin(percentText(check.deviationBps))
                : t.referenceOutside(
                    percentText(check.deviationBps),
                    percentText(check.toleranceBps),
                  )}
            </p>
          )}
        </>
      )}
    </div>
  );
}
