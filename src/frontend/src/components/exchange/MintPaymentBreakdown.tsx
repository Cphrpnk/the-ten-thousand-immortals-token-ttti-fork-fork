import { Loader2 } from "lucide-react";
import {
  type ConsolidatedMintPrice,
  type ConsolidatedUnavailable,
  type LiquidityMintQuote,
  type MintPoolPreview,
  type PayToken,
  type PoolPrice,
  RemainderChoice,
} from "../../backend";
import type { Lang } from "../../i18n/core";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_LIQUIDITY_TEXT, BUY_MINT_POOL_TEXT } from "../../i18n/pages/buy";
import { DEX_TEXT, PLAIN_RULES_TEXT } from "../../i18n/pages/dex";
import { formatPayAmount, formatUsdE8 } from "../../lib/token";
import { cn } from "../../lib/utils";
import { FiatAmount } from "../FiatAmount";
import {
  consolidatedUnavailableText,
  formatSignedBps,
} from "../dex/ConsolidatedPrice";
import { formatFeeTier } from "./MintPoolSelector";
import {
  choiceFigures,
  dexAmountText,
  formatLockedShare,
  formatMintTtti,
} from "./liquidityMint";
import { MINT_RESERVE_TEXT } from "./mintReserveText";
import type { Notice } from "./purchaseOutcome";

interface MintPaymentBreakdownProps {
  token: PayToken;
  /** Preview of the typed amount, null until one is available. */
  quote: LiquidityMintQuote | null;
  /** True while an amount is typed and its preview is being requested. */
  loading: boolean;
  /** Refusal of the preview, shown instead of the figures. */
  error: Notice | null;
  /**
   * Backend pool preview of the selected pool: prices before and after and
   * their gaps with the consolidated price. Null until it is available.
   */
  poolPreview: MintPoolPreview | null;
  /** Remainder choice the figures follow: A pool, B keep in wallet. */
  choice: RemainderChoice;
  onChoiceChange: (choice: RemainderChoice) => void;
  /** Disables the choice while a payment is in progress. */
  choiceDisabled?: boolean;
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

/** Preview of a liquidity mint: payment, split and pool price before and after. */
export function MintPaymentBreakdown({
  token,
  quote,
  loading,
  error,
  poolPreview,
  choice,
  onChoiceChange,
  choiceDisabled = false,
}: MintPaymentBreakdownProps) {
  const t = useDict(BUY_LIQUIDITY_TEXT);
  const pt = useDict(BUY_MINT_POOL_TEXT);
  const r = useDict(MINT_RESERVE_TEXT);
  const dex = useDict(DEX_TEXT);
  const plain = useDict(PLAIN_RULES_TEXT);
  const { lang } = useLanguage();
  const figures = quote ? choiceFigures(quote, choice) : null;
  // Pool figures follow the selected pool; the quote targets the same pool.
  const pool = poolPreview ?? quote;
  const noReference = pool?.noIndependentReference === true;
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
      ) : !quote || !figures ? (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="exchange.preview.empty_state"
        >
          {loading ? t.previewLoading : t.previewIdle}
        </p>
      ) : (
        <div className="space-y-3" data-ocid="exchange.preview_panel">
          <div
            className="space-y-1 rounded-md border border-border px-3 py-2"
            data-ocid="exchange.preview.locked_share"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground">
                {t.lockedShareLabel}
              </span>
              <span
                className="font-mono font-semibold tabular-nums"
                data-ocid="exchange.preview.locked_share_value"
              >
                {formatLockedShare(quote.mShareE6)}
              </span>
            </div>
            <p
              className="text-xs text-muted-foreground"
              data-ocid="exchange.preview.locked_share_note"
            >
              {t.lockedShareNote}
            </p>
          </div>
          <fieldset
            className="space-y-2"
            disabled={choiceDisabled}
            data-ocid="exchange.preview.choice_group"
          >
            <legend className="text-xs font-medium text-foreground">
              {t.choiceLegend}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  [
                    RemainderChoice.pool,
                    "pool",
                    t.choicePoolTitle,
                    t.choicePoolText,
                    quote.choices.pool,
                  ],
                  [
                    RemainderChoice.wallet,
                    "wallet",
                    t.choiceWalletTitle,
                    t.choiceWalletText,
                    quote.choices.wallet,
                  ],
                ] as const
              ).map(([value, key, title, text, option]) => (
                <label
                  key={key}
                  htmlFor={`mint-choice-${key}`}
                  className={cn(
                    "flex min-w-0 cursor-pointer flex-col gap-2 rounded-md border px-3 py-2 transition-smooth focus-within:ring-2 focus-within:ring-ring",
                    choice === value
                      ? "border-gold bg-primary/10"
                      : "border-border hover:border-gold",
                    choiceDisabled && "cursor-not-allowed opacity-60",
                  )}
                  data-ocid={`exchange.preview.choice.${key}`}
                >
                  <span className="flex items-start gap-2">
                    <input
                      id={`mint-choice-${key}`}
                      type="radio"
                      name="mint-remainder-choice"
                      checked={choice === value}
                      onChange={() => onChoiceChange(value)}
                      disabled={choiceDisabled}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none"
                      data-ocid={`exchange.preview.choice_radio.${key}`}
                    />
                    <span className="min-w-0 font-medium text-foreground">
                      {title}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">{text}</span>
                  <dl className="space-y-0.5 font-mono text-xs tabular-nums">
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="font-sans text-muted-foreground">
                        {t.rowPosition}
                      </dt>
                      <dd className="ml-auto min-w-0 max-w-full break-all text-right">
                        {formatPayAmount(option.pooledTokenAmount, token)}
                        <br />
                        {formatMintTtti(option.pooledTttiAmount)}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="font-sans text-muted-foreground">
                        {t.rowLocked}
                      </dt>
                      <dd className="ml-auto min-w-0 max-w-full break-all text-right">
                        {formatPayAmount(option.lockedTokenAmount, token)}
                        <br />
                        {formatMintTtti(option.lockedTttiAmount)}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="font-sans text-muted-foreground">
                        {t.rowHand}
                      </dt>
                      <dd className="ml-auto min-w-0 max-w-full break-all text-right">
                        {formatMintTtti(option.handTttiAmount)}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="font-sans text-muted-foreground">
                        {r.rowTotal}
                      </dt>
                      <dd className="ml-auto min-w-0 max-w-full break-all text-right font-semibold">
                        {formatPayAmount(option.totalPayAmount, token)}
                      </dd>
                    </div>
                  </dl>
                </label>
              ))}
            </div>
          </fieldset>
          <dl className="space-y-1" data-ocid="exchange.preview.mint_lines">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{t.rowPrice}</dt>
              <dd
                className="text-right text-xs"
                data-ocid="exchange.preview.price_line"
              >
                {t.priceValue}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <dt className="text-muted-foreground">
                {t.rowLiquidity}
                <span className="block text-xs">{t.liquidityNote}</span>
              </dt>
              <dd
                className="ml-auto min-w-0 max-w-full break-all font-mono tabular-nums"
                data-ocid="exchange.preview.liquidity_line"
              >
                {formatUsdE8(figures.liquidityUsdE8, 2, lang)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <dt className="text-muted-foreground">{t.rowFee}</dt>
              <dd
                className="ml-auto min-w-0 max-w-full break-all font-mono tabular-nums"
                data-ocid="exchange.payment_breakdown.fee"
              >
                {formatPayAmount(figures.creatorAmount, token)}
                <FiatAmount
                  token={token}
                  amount={figures.creatorAmount}
                  className="ml-1.5 font-normal"
                  ocid="exchange.payment_breakdown.fee_fiat"
                />
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <dt className="text-muted-foreground">{r.rowTotal}</dt>
              <dd
                className="ml-auto min-w-0 max-w-full break-all font-mono font-semibold tabular-nums"
                data-ocid="exchange.required_icp_output"
              >
                {formatPayAmount(figures.totalPayAmount, token)}
                <FiatAmount
                  token={token}
                  amount={figures.totalPayAmount}
                  className="ml-1.5 block text-right text-xs font-normal"
                  ocid="exchange.required_icp_output_fiat"
                />
              </dd>
            </div>
          </dl>
          <div className="space-y-1 border-t border-border pt-2">
            <h3 className="text-xs text-muted-foreground">
              {t.holdingsHeading}
            </h3>
            <dl
              className="space-y-1 font-mono text-xs tabular-nums"
              data-ocid="exchange.preview.holdings"
            >
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.position"
              >
                <dt className="font-sans text-muted-foreground">
                  {t.rowPosition}
                </dt>
                <dd className="text-right">
                  {formatPayAmount(figures.pooledTokenAmount, token)}
                  <FiatAmount
                    token={token}
                    amount={figures.pooledTokenAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.position_token_fiat"
                  />
                  <br />
                  {formatMintTtti(figures.pooledTttiAmount)}
                  <FiatAmount
                    token="ttti"
                    amount={figures.pooledTttiAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.position_ttti_fiat"
                  />
                </dd>
              </div>
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.locked"
              >
                <dt className="font-sans text-muted-foreground">
                  {t.rowLocked}
                </dt>
                <dd className="text-right">
                  {formatPayAmount(figures.lockedTokenAmount, token)}
                  <br />
                  {formatMintTtti(figures.lockedTttiAmount)}
                </dd>
              </div>
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.hand"
              >
                <dt className="font-sans text-muted-foreground">{t.rowHand}</dt>
                <dd className="text-right" data-ocid="exchange.ttti_output">
                  {formatMintTtti(figures.handTttiAmount)}
                  <FiatAmount
                    token="ttti"
                    amount={figures.handTttiAmount}
                    className="ml-1.5"
                    ocid="exchange.ttti_output_fiat"
                  />
                </dd>
              </div>
            </dl>
          </div>
          <div className="space-y-1 border-t border-border pt-2">
            <h3 className="text-xs text-muted-foreground">{t.splitHeading}</h3>
            <dl
              className="space-y-1 font-mono text-xs tabular-nums"
              data-ocid="exchange.payment_breakdown.amounts"
            >
              <div
                className="flex justify-between gap-3"
                data-ocid="exchange.payment_breakdown.reserve"
              >
                <dt className="font-sans text-muted-foreground">
                  {r.rowReserve}
                </dt>
                <dd className="text-right">
                  {formatPayAmount(
                    quote.reserve.reserveAmount,
                    quote.reserve.reserveToken,
                  )}
                  <FiatAmount
                    token={quote.reserve.reserveToken}
                    amount={quote.reserve.reserveAmount}
                    className="ml-1.5"
                    ocid="exchange.payment_breakdown.reserve_fiat"
                  />
                </dd>
              </div>
              {figures.dustAmount > 0n && (
                <div className="flex justify-between gap-3">
                  <dt className="font-sans text-muted-foreground">
                    {t.rowDust}
                  </dt>
                  <dd className="text-right">
                    {formatPayAmount(figures.dustAmount, token)}
                    <FiatAmount
                      token={token}
                      amount={figures.dustAmount}
                      className="ml-1.5"
                      ocid="exchange.payment_breakdown.dust_fiat"
                    />
                  </dd>
                </div>
              )}
            </dl>
            <p
              className="text-xs text-muted-foreground"
              data-ocid="exchange.payment_breakdown.reserve_note"
            >
              {r.reserveNoteKept}
            </p>
            <p
              className="text-xs text-muted-foreground"
              data-ocid="exchange.payment_breakdown.fee_note"
            >
              {r.feeNote}
            </p>
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
                  ["before", t.priceBefore, pool?.consolidatedPriceBefore],
                  ["after", t.priceAfter, pool?.consolidatedPriceAfter],
                ] as const
              ).map(([key, label, price]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="font-sans text-muted-foreground">{label}</dt>
                  <dd
                    className={
                      price?.__kind__ === "available"
                        ? undefined
                        : "font-sans text-right"
                    }
                    data-ocid={`exchange.preview.consolidated_price.${key}`}
                  >
                    {price
                      ? price.__kind__ !== "available" && noReference
                        ? t.noIndependentReference
                        : consolidatedText(
                            price,
                            (reason) =>
                              consolidatedUnavailableText(dex, reason),
                            lang,
                          )
                      : "—"}
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
              {poolPreview && (
                <div
                  className="flex justify-between gap-3"
                  data-ocid="exchange.preview.selected_pool"
                >
                  <dt className="font-sans text-muted-foreground">
                    {pt.selectedPool}
                  </dt>
                  <dd className="text-right font-sans">
                    {pt.poolLabel(poolPreview.poolId.toString())} ·{" "}
                    {formatFeeTier(poolPreview.feeBps)}
                    {poolPreview.isRecommended && ` · ${pt.recommended}`}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.priceBefore}
                </dt>
                <dd className="text-right">
                  {priceText(
                    pool?.priceBefore ?? quote.priceBefore,
                    t.emptyPool,
                    lang,
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.priceAfter}
                </dt>
                <dd className="text-right">
                  {priceText(
                    pool?.priceAfter ?? quote.priceAfter,
                    t.emptyPool,
                    lang,
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-sans text-muted-foreground">
                  {t.zapLabel}
                </dt>
                <dd className="text-right">
                  {pool?.zap
                    ? `${dexAmountText(pool.zap.tokenIn, pool.zap.amountIn)} → ${dexAmountText(pool.zap.tokenOut, pool.zap.amountOut)}`
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
                    ["before", t.priceBefore, poolPreview?.gapBeforeBps],
                    ["after", t.priceAfter, poolPreview?.gapAfterBps],
                  ] as const
                ).map(([key, label, gap]) => (
                  <div key={key} className="flex justify-between gap-3">
                    <dt className="font-sans text-muted-foreground">{label}</dt>
                    <dd
                      className={
                        gap === undefined
                          ? "font-sans text-right"
                          : "text-right"
                      }
                      data-ocid={`exchange.preview.price_gap.${key}`}
                    >
                      {gap === undefined
                        ? noReference
                          ? t.noIndependentReference
                          : t.gapUnavailable
                        : formatSignedBps(gap)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {(pool?.firstDeposit ?? quote.firstDeposit) && (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="exchange.preview.first_deposit_note"
              >
                {t.firstDepositNote}
              </p>
            )}
            {!pool?.zap && !(pool?.firstDeposit ?? quote.firstDeposit) && (
              <p className="text-xs text-muted-foreground">{t.noZap}</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
