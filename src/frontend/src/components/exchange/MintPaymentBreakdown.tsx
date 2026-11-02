import { Loader2 } from "lucide-react";
import type {
  ConsolidatedMintPrice,
  ConsolidatedUnavailable,
  LiquidityMintQuote,
  PayToken,
  PoolPrice,
} from "../../backend";
import type { Lang } from "../../i18n/core";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_LIQUIDITY_TEXT } from "../../i18n/pages/buy";
import { DEX_TEXT, PLAIN_RULES_TEXT } from "../../i18n/pages/dex";
import { formatPayAmount, formatUsdE8 } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import {
  consolidatedUnavailableText,
  formatSignedBps,
} from "../dex/ConsolidatedPrice";
import { dexAmountText, formatMintTtti } from "./liquidityMint";
import type { Notice } from "./purchaseOutcome";

interface MintPaymentBreakdownProps {
  token: PayToken;
  /** Preview of the typed amount, null until one is available. */
  quote: LiquidityMintQuote | null;
  /** True while an amount is typed and its preview is being requested. */
  loading: boolean;
  /** Refusal of the preview, shown instead of the figures. */
  error: Notice | null;
}

/** Pool price in USD per TTTI-T, "—" for an empty pool. */
function priceText(price: PoolPrice, emptyLabel: string, lang: Lang) {
  if (price.usdPerTtti === undefined || price.reserveTtti === 0n) {
    return emptyLabel;
  }
  return `${formatUsdE8(price.usdPerTtti, 4, lang)} USD`;
}

/** Consolidated TTTI-T price in USD, or the factual reason it is unavailable. */
function consolidatedText(
  price: ConsolidatedMintPrice,
  unavailable: (reason: ConsolidatedUnavailable) => string,
  lang: Lang,
) {
  return price.__kind__ === "available"
    ? `${formatUsdE8(price.available, 4, lang)} USD`
    : unavailable(price.unavailable);
}

/**
 * Signed gap of the pool price versus the consolidated price, in basis points.
 * Null when either price is unavailable or the pool is empty.
 */
function gapBps(
  pool: PoolPrice,
  consolidated: ConsolidatedMintPrice,
): bigint | null {
  if (
    pool.usdPerTtti === undefined ||
    pool.reserveTtti === 0n ||
    consolidated.__kind__ !== "available" ||
    consolidated.available === 0n
  ) {
    return null;
  }
  return (
    ((pool.usdPerTtti - consolidated.available) * 10_000n) /
    consolidated.available
  );
}

/** Preview of a liquidity mint: payment, split and pool price before and after. */
export function MintPaymentBreakdown({
  token,
  quote,
  loading,
  error,
}: MintPaymentBreakdownProps) {
  const t = useDict(BUY_LIQUIDITY_TEXT);
  const dex = useDict(DEX_TEXT);
  const plain = useDict(PLAIN_RULES_TEXT);
  const { lang } = useLanguage();

  return (
    <section
      className="space-y-2 rounded-lg border border-border bg-background/60 px-3 py-3 text-sm"
      aria-live="polite"
      aria-labelledby="mint-preview-heading"
      data-ocid="exchange.payment_breakdown.panel"
    >
      <h2
        id="mint-preview-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {t.previewHeading}
        {loading && (
          <Loader2
            className="h-3 w-3 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
            data-ocid="exchange.preview.loading_state"
          />
        )}
      </h2>
      {error ? (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="exchange.preview.error_state"
        >
          {error.message}
        </p>
      ) : !quote ? (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="exchange.preview.empty_state"
        >
          {loading ? t.previewLoading : t.previewIdle}
        </p>
      ) : (
        <div className="space-y-3" data-ocid="exchange.preview_panel">
          <dl className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t.rowMinted}</dt>
              <dd
                className="break-all font-mono font-semibold tabular-nums text-primary"
                data-ocid="exchange.ttti_output"
              >
                {formatMintTtti(quote.tttiAmount)}
                <FiatAmount
                  token="ttti"
                  amount={quote.tttiAmount}
                  className="ml-1.5 font-normal"
                  ocid="exchange.ttti_output_fiat"
                />
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t.rowPay}</dt>
              <dd
                className="break-all font-mono font-semibold tabular-nums"
                data-ocid="exchange.required_icp_output"
              >
                {formatPayAmount(quote.payAmount, token)}
                <span className="block text-right text-xs font-normal text-muted-foreground">
                  ≈ {formatUsdE8(quote.payUsdE8, 2)}
                </span>
              </dd>
            </div>
          </dl>
          <div className="space-y-1 border-t border-border pt-2">
            <h3 className="text-xs text-muted-foreground">{t.splitHeading}</h3>
            <dl
              className="space-y-1 font-mono text-xs tabular-nums"
              data-ocid="exchange.payment_breakdown.amounts"
            >
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.position"
              >
                <dt className="font-sans text-muted-foreground">
                  {t.rowPosition}
                </dt>
                <dd className="text-right">
                  {formatPayAmount(quote.positionTokenAmount, token)}
                  <FiatAmount
                    token={token}
                    amount={quote.positionTokenAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.position_token_fiat"
                  />
                  <br />
                  {formatMintTtti(quote.positionTttiAmount)}
                  <FiatAmount
                    token="ttti"
                    amount={quote.positionTttiAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.position_ttti_fiat"
                  />
                </dd>
              </div>
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.guarantee"
              >
                <dt className="font-sans text-muted-foreground">
                  {t.rowGuarantee}
                </dt>
                <dd className="text-right">
                  {formatPayAmount(quote.guaranteeAmount, token)}
                  <FiatAmount
                    token={token}
                    amount={quote.guaranteeAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.guarantee_fiat"
                  />
                </dd>
              </div>
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.fee"
              >
                <dt className="font-sans text-muted-foreground">{t.rowFee}</dt>
                <dd className="text-right">
                  {formatPayAmount(quote.creatorAmount, token)}
                  <FiatAmount
                    token={token}
                    amount={quote.creatorAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.fee_fiat"
                  />
                </dd>
              </div>
              {quote.dustAmount > 0n && (
                <div className="flex justify-between gap-3">
                  <dt className="font-sans text-muted-foreground">
                    {t.rowDust}
                  </dt>
                  <dd className="text-right">
                    {formatPayAmount(quote.dustAmount, token)}
                    <FiatAmount
                      token={token}
                      amount={quote.dustAmount}
                      className="ml-1.5"
                      ocid="exchange.payment_breakdown.dust_fiat"
                    />
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <section
            className="space-y-1 rounded-md border border-border px-3 py-2"
            aria-labelledby="mint-consolidated-heading"
            data-ocid="exchange.preview.consolidated_block"
          >
            <h3
              id="mint-consolidated-heading"
              className="text-xs font-medium text-foreground"
            >
              {t.consolidatedPriceHeading}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t.consolidatedPriceNote}
            </p>
            <dl
              className="space-y-1 font-mono text-xs tabular-nums"
              data-ocid="exchange.preview.consolidated_price"
            >
              {(
                [
                  ["before", t.priceBefore, quote.consolidatedPriceBefore],
                  ["after", t.priceAfter, quote.consolidatedPriceAfter],
                ] as const
              ).map(([key, label, price]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="font-sans text-muted-foreground">{label}</dt>
                  <dd
                    className={
                      price.__kind__ === "available"
                        ? undefined
                        : "font-sans text-right"
                    }
                    data-ocid={`exchange.preview.consolidated_price.${key}`}
                  >
                    {consolidatedText(
                      price,
                      (reason) => consolidatedUnavailableText(dex, reason),
                      lang,
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section
            className="space-y-1 rounded-md border border-border px-3 py-2"
            aria-labelledby="mint-pool-heading"
            data-ocid="exchange.preview.pool_block"
          >
            <h3
              id="mint-pool-heading"
              className="text-xs font-medium text-foreground"
            >
              {t.poolPriceHeading}
            </h3>
            <p className="text-xs text-muted-foreground">{t.poolPriceNote}</p>
            <p className="text-xs text-muted-foreground">{plain.zap}</p>
            <dl
              className="space-y-1 font-mono text-xs tabular-nums"
              data-ocid="exchange.preview.pool_price"
            >
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.priceBefore}
                </dt>
                <dd className="text-right">
                  {priceText(quote.priceBefore, t.emptyPool, lang)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.priceAfter}
                </dt>
                <dd className="text-right">
                  {priceText(quote.priceAfter, t.emptyPool, lang)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.zapLabel}
                </dt>
                <dd className="text-right">
                  {quote.zap
                    ? `${dexAmountText(quote.zap.tokenIn, quote.zap.amountIn)} → ${dexAmountText(quote.zap.tokenOut, quote.zap.amountOut)}`
                    : "—"}
                </dd>
              </div>
            </dl>
            <div className="space-y-1 border-t border-border pt-2">
              <h4 className="text-xs text-muted-foreground">{t.gapHeading}</h4>
              <dl
                className="space-y-1 font-mono text-xs tabular-nums"
                data-ocid="exchange.preview.price_gap"
              >
                {(
                  [
                    [
                      "before",
                      t.priceBefore,
                      quote.priceBefore,
                      quote.consolidatedPriceBefore,
                    ],
                    [
                      "after",
                      t.priceAfter,
                      quote.priceAfter,
                      quote.consolidatedPriceAfter,
                    ],
                  ] as const
                ).map(([key, label, pool, consolidated]) => {
                  const gap = gapBps(pool, consolidated);
                  return (
                    <div key={key} className="flex justify-between gap-3">
                      <dt className="font-sans text-muted-foreground">
                        {label}
                      </dt>
                      <dd
                        className={
                          gap === null ? "font-sans text-right" : "text-right"
                        }
                        data-ocid={`exchange.preview.price_gap.${key}`}
                      >
                        {gap === null ? t.gapUnavailable : formatSignedBps(gap)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            {quote.firstDeposit && (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="exchange.preview.first_deposit_note"
              >
                {t.firstDepositNote}
              </p>
            )}
            {!quote.zap && !quote.firstDeposit && (
              <p className="text-xs text-muted-foreground">{t.noZap}</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
