import {
  type Buyback,
  type BuybackError,
  type BuybackMass,
  type BuybackQuote,
  BuybackRule,
  BuybackStatus,
  type Conversion,
  ConversionStatus,
  type PayToken,
} from "../backend";
import { pickDict } from "../i18n/core/dict";
import { type Lang, toIntlLocale } from "../i18n/core/lang";
import { BUYBACK_TEXT } from "../i18n/pages/buyback";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "./explorer";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  TTTI_DECIMALS,
  TTTI_DIVISOR,
  TTTI_SYMBOL,
  defaultNumberLang,
  feeLabelFor,
  formatPayAmount,
  formatTtti,
  formatUnits,
  payTokenSymbol,
  tokenPriceLabel,
  tttiToUsdE8,
} from "./token";

/**
 * Pure buyback helpers shared by the Exchange section, the TTTI-T wallet card,
 * the purchase history and the admin space. Quantities only.
 */

export type BuybackText = (typeof BUYBACK_TEXT)["en"];

/** Buyback fee in basis points (1%). */
export const BUYBACK_FEE_BPS = 100n;

/** Figures shared by a quote and a recorded buyback. */
export type BuybackFigures = Pick<
  BuybackQuote,
  | "originalToken"
  | "tokenReturned"
  | "percent"
  | "massTotalNet"
  | "massTotalTtti"
  | "massRemainingNet"
  | "massRemainingTtti"
  | "rule"
  | "originalNetAmount"
  | "baseAmount"
  | "baseAmountReturned"
  | "buybackFee"
  | "thirdPartyFees"
  | "tttiTransferFee"
  | "tttiEscrowFee"
  | "amountReturned"
  | "tttiAmount"
>;

/** Error thrown by query hooks when the backend returns a BuybackError. */
export class BuybackFailure extends Error {
  readonly error: BuybackError;
  constructor(error: BuybackError) {
    super(error.__kind__);
    this.name = "BuybackFailure";
    this.error = error;
  }
}

/**
 * Completed purchase with a recorded net amount (Version 26 and later): it
 * counts in the mass of its payment token (BTC purchases in ckBTC).
 */
export function isBuybackEligible(conversion: Conversion): boolean {
  return (
    conversion.status === ConversionStatus.completed &&
    conversion.netAmount !== undefined
  );
}

/** Legacy buyback recorded for one purchase, when any. */
export function buybackForPurchase(
  buybacks: ReadonlyArray<Buyback> | undefined,
  purchaseId: bigint,
): Buyback | undefined {
  return buybacks?.find((b) => b.purchaseId === purchaseId);
}

/** Buybacks of a mass (records without a purchase id), newest first. */
export function massBuybacks(
  buybacks: ReadonlyArray<Buyback> | undefined,
  token?: PayToken,
): Array<Buyback> {
  return (buybacks ?? [])
    .filter(
      (b) =>
        b.purchaseId === undefined &&
        (token === undefined || b.originalToken === token),
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

/** Masses in payment-token order. */
export function sortMasses(
  masses: ReadonlyArray<BuybackMass> | undefined,
): Array<BuybackMass> {
  return [...(masses ?? [])].sort(
    (a, b) =>
      PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token),
  );
}

/**
 * Masses offered in the buyback flow, in payment-token order: those with
 * TTTI-T left to buy back, or with a buyback in progress. Fully bought back
 * masses are not offered.
 */
export function offerableMasses(
  masses: ReadonlyArray<BuybackMass> | undefined,
): Array<BuybackMass> {
  return sortMasses(masses).filter((m) => m.remainingTtti > 0n || m.inProgress);
}

/** Mass of `token`, when any. */
export function massFor(
  masses: ReadonlyArray<BuybackMass> | undefined,
  token: PayToken | undefined,
): BuybackMass | undefined {
  return token === undefined
    ? undefined
    : masses?.find((m) => m.token === token);
}

/**
 * Average ratio of a mass, net paid per 1 TTTI-T received:
 * "1 TTTI-T ≈ 0.1247 ckBTC", or null when the mass is empty.
 */
export function formatMassRatio(
  token: PayToken,
  totalNet: bigint,
  totalTtti: bigint,
  lang: Lang,
): string | null {
  if (totalTtti <= 0n) return null;
  const { decimals, symbol } = PAY_TOKENS[token];
  const perTtti = (totalNet * TTTI_DIVISOR) / totalTtti;
  const one = new Intl.NumberFormat(toIntlLocale(lang)).format(1);
  return `${one} ${TTTI_SYMBOL} ≈ ${formatUnits(perTtti, decimals, 2, lang)} ${symbol}`;
}

/** Percentage in `lang`'s format: "50 %" in French, "50%" in English. */
export function formatBuybackPercent(
  percent: bigint | number,
  lang: Lang,
): string {
  return new Intl.NumberFormat(toIntlLocale(lang), {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(Number(percent) / 100);
}

/** Pro-rata net quantity of the paid token: "0.99 ICP". */
export function formatOriginalNet(f: BuybackFigures, lang: Lang): string {
  return formatPayAmount(f.originalNetAmount, f.originalToken, lang);
}

/** Base quantity in the paid token. */
export function formatBuybackBase(f: BuybackFigures, lang: Lang): string {
  return formatPayAmount(f.baseAmount, f.originalToken, lang);
}

/** Buyback fee in the returned token. */
export function formatBuybackFee(f: BuybackFigures, lang: Lang): string {
  return formatPayAmount(f.buybackFee, f.tokenReturned, lang);
}

/** Third-party transfer fees deducted, in the returned token. */
export function formatThirdPartyFees(f: BuybackFigures, lang: Lang): string {
  return formatPayAmount(f.thirdPartyFees, f.tokenReturned, lang);
}

/** Amount the buyer receives, in the returned token. */
export function formatAmountReturned(f: BuybackFigures, lang: Lang): string {
  return formatPayAmount(f.amountReturned, f.tokenReturned, lang);
}

/** USD value (usdE8) of `amount` base units of `token` at `rateUsdE8` per whole token. */
export function payToUsdE8(
  amount: bigint,
  token: PayToken,
  rateUsdE8: bigint,
): bigint {
  return (amount * rateUsdE8) / 10n ** BigInt(PAY_TOKENS[token].decimals);
}

/**
 * B: base units of `token` worth `tttiAmount` TTTI-T at `rateUsdE8`, exactly
 * as the backend's dayRateQuantity (10,000 USD-e8 per TTTI-T base unit).
 */
export function buybackDayRateQuantity(
  token: PayToken,
  tttiAmount: bigint,
  rateUsdE8: bigint,
): bigint {
  if (rateUsdE8 <= 0n) return 0n;
  return (
    (tttiToUsdE8(tttiAmount) * 10n ** BigInt(PAY_TOKENS[token].decimals)) /
    rateUsdE8
  );
}

/** TTTI-T the backend takes for a whole mass percent: floor(remaining * percent / 100). */
export function massTttiAmount(remaining: bigint, massPercent: number): bigint {
  return (remaining * BigInt(massPercent)) / 100n;
}

/** Buyback cap for one slider position (interface only; backend unchanged). */
export interface BuybackCap {
  /** Wallet balance minus the transfer_from fee, minus the approve fee when still needed. */
  usable: bigint;
  /** min(remaining mass, usable). */
  max: bigint;
  /** True when the usable balance is below the remaining mass. */
  walletLimited: boolean;
  /** Whole mass percent for quoteBuyback/requestBuyback; null below 1 % of the mass. */
  massPercent: number | null;
}

/**
 * Whole mass percent (rounded down, at least 1) whose amount
 * floor(remaining * m / 100) stays within `max` * `percent` / 100.
 * Same as `percent` when `max` covers the whole remaining mass.
 */
function massPercentFor(
  remaining: bigint,
  max: bigint,
  percent: number,
): number | null {
  if (remaining <= 0n || max <= 0n || max * 100n < remaining) return null;
  if (max >= remaining) return percent;
  const target = (max * BigInt(percent)) / 100n;
  const m = Number((target * 100n) / remaining);
  return Math.min(99, Math.max(1, m));
}

/**
 * Cap of a buyback: min(remaining mass, usable TTTI-T balance), where usable =
 * balance − two TTTI-T fees (pull and escrow) − approve fee when the active
 * allowance does not cover the amount plus both fees. `percent` is the slider
 * position (1..100).
 */
export function buybackCap(
  remaining: bigint,
  balance: bigint,
  fee: bigint,
  allowance: bigint,
  percent: number,
): BuybackCap {
  const at = (usable: bigint): BuybackCap => {
    const max = usable < remaining ? usable : remaining;
    return {
      usable,
      max,
      walletLimited: usable < remaining,
      massPercent: massPercentFor(remaining, max, percent),
    };
  };
  const minus = (value: bigint, by: bigint) => (value > by ? value - by : 0n);
  const direct = at(minus(balance, 2n * fee));
  if (
    direct.massPercent !== null &&
    allowance >= massTttiAmount(remaining, direct.massPercent) + 2n * fee
  ) {
    return direct;
  }
  return at(minus(balance, 3n * fee));
}

/** TTTI-T quantity with symbol. */
export function formatTttiQuantity(amount: bigint, lang: Lang): string {
  return `${formatTtti(amount, TTTI_DECIMALS, lang)} ${TTTI_SYMBOL}`;
}

/** Label of the rule applied. */
export function buybackRuleLabel(rule: BuybackRule, t: BuybackText): string {
  return rule === BuybackRule.originalNet ? t.ruleOriginalNet : t.ruleDayRate;
}

/** Label of a buyback status. */
export function buybackStatusLabel(
  status: BuybackStatus,
  t: BuybackText,
): string {
  switch (status) {
    case BuybackStatus.completed:
      return t.statusCompleted;
    case BuybackStatus.inProgress:
      return t.statusInProgress;
    case BuybackStatus.payoutFailed:
      return t.statusPayoutFailed;
    case BuybackStatus.cancelled:
      return t.statusCancelled;
  }
}

/** "1%" in `lang`'s format. */
export function buybackFeeLabel(lang: Lang = defaultNumberLang()): string {
  return feeLabelFor(BUYBACK_FEE_BPS, lang);
}

/** "10,000 USD" in `lang`'s format. */
export function buybackPriceLabel(lang: Lang = defaultNumberLang()): string {
  return tokenPriceLabel(lang);
}

/** Message in `lang` for every BuybackError variant. */
export function buybackErrorMessage(
  error: BuybackError,
  lang: Lang = defaultNumberLang(),
): string {
  const t = pickDict(BUYBACK_TEXT, lang);
  const units = (value: bigint) => formatTttiQuantity(value, lang);
  switch (error.__kind__) {
    case "anonymous":
      return t.errAnonymous;
    case "notBuyer":
      return t.errNotBuyer;
    case "invalidPercent":
      return t.errInvalidPercent;
    case "nothingRemaining":
      return t.errNothingRemaining;
    case "massBuybackInProgress":
      return t.errMassInProgress;
    case "buybackNotFound":
      return t.errBuybackNotFound;
    case "buybackInProgress":
      return t.errInProgress;
    case "rateUnavailable":
      return t.errRateUnavailable(payTokenSymbol(error.rateUnavailable));
    case "adminAccountNotSet":
      return t.errAdminAccountNotSet;
    case "receiveTokenMismatch":
      return t.errReceiveTokenMismatch;
    case "adminAllowanceInsufficient":
      return t.errAdminAllowanceInsufficient(
        payTokenSymbol(error.adminAllowanceInsufficient.token),
      );
    case "adminAllowanceExpired":
      return t.errAdminAllowanceExpired(
        payTokenSymbol(error.adminAllowanceExpired.token),
      );
    case "adminBalanceInsufficient":
      return t.errAdminBalanceInsufficient(
        payTokenSymbol(error.adminBalanceInsufficient.token),
      );
    case "buyerAllowanceInsufficient":
      return t.errBuyerAllowance(
        units(error.buyerAllowanceInsufficient.required),
        units(error.buyerAllowanceInsufficient.allowance),
      );
    case "amountTooSmall":
      return t.errAmountTooSmall;
    case "notRetryable":
      return t.errNotRetryable;
    case "pullFailed":
      return t.errPullFailed(error.pullFailed);
    case "payoutFailed":
      return t.errPayoutFailed(error.payoutFailed);
    case "callFailed":
      return t.errCallFailed(error.callFailed);
    case "notCancellable":
      return t.errNotCancellable;
    case "salesPaused":
      return t.errSalesPaused;
    case "attemptUnknown":
      return t.errAttemptUnknown;
    case "attemptArrived":
      return t.errAttemptArrived;
    case "notLegacy":
      return t.errNotLegacy;
    case "notAuthorized":
      return t.errNotAuthorized;
    case "cancelFailed":
      return t.errCancelFailed(error.cancelFailed);
    case "releaseFailed":
      return t.errReleaseFailed(error.releaseFailed);
  }
}

/** Message for any failure thrown by a buyback hook. */
export function buybackFailureMessage(
  failure: unknown,
  lang: Lang = defaultNumberLang(),
): string {
  if (failure instanceof BuybackFailure) {
    return buybackErrorMessage(failure.error, lang);
  }
  const text = failure instanceof Error ? failure.message : String(failure);
  return pickDict(BUYBACK_TEXT, lang).errCallFailed(text);
}

/** History target of the TTTI-T block taken from the buyer. */
export function pullBlockTarget(buyback: Buyback): BlockLinkTarget | null {
  return buyback.pullBlock === undefined
    ? null
    : tttiBlockTarget(buyback.pullBlock);
}

/** ICP Dashboard target of the payout block on the returned token's ledger. */
export function payoutBlockTarget(buyback: Buyback): BlockLinkTarget | null {
  return buyback.payoutBlock === undefined
    ? null
    : blockLinkTarget(buyback.tokenReturned, buyback.payoutBlock);
}

/** History target of the TTTI-T block that returned the TTTI-T on cancellation. */
export function cancelBlockTarget(buyback: Buyback): BlockLinkTarget | null {
  return buyback.cancelBlock === undefined
    ? null
    : tttiBlockTarget(buyback.cancelBlock);
}

/** 23 h in nanoseconds: an unknown attempt older than this is to review. */
const REVIEW_AFTER_NS = 23n * 3_600n * 1_000_000_000n;

/**
 * Outcome of the latest payout attempt when it did not arrive: failed (with
 * the ledger error), unknown, or to review (unknown after 23 h, or legacy).
 */
export function payoutOutcomeLabel(
  buyback: Buyback,
  t: BuybackText,
  nowNs: bigint = BigInt(Date.now()) * 1_000_000n,
): string | null {
  const latest = buyback.payoutAttempts.at(-1)?.attempt;
  if (!latest) return null;
  switch (latest.outcome.__kind__) {
    case "succeeded":
      return null;
    case "failed":
      return t.attemptFailed(latest.outcome.failed);
    case "pending":
    case "unknown":
      return buyback.legacy ||
        latest.attempt === 0n ||
        nowNs - latest.created_at_time > REVIEW_AFTER_NS
        ? t.attemptToReview
        : t.attemptUnknown;
  }
}

/**
 * The buyer can cancel: #payoutFailed, not legacy, and every payout attempt
 * got a known Err from the ledger.
 */
export function canCancelBuyback(buyback: Buyback): boolean {
  return (
    buyback.status === BuybackStatus.payoutFailed &&
    !buyback.legacy &&
    buyback.payoutAttempts.length > 0 &&
    buyback.payoutAttempts.every((p) => p.attempt.outcome.__kind__ === "failed")
  );
}
