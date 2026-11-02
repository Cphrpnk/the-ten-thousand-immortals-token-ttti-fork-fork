import {
  type GuaranteeError,
  type GuaranteeMassView,
  type PayToken,
  type RedeemQuote,
  RedeemRule,
  type Redemption,
  RedemptionKind,
} from "../backend";
import { pickDict } from "../i18n/core/dict";
import { type Lang, toIntlLocale } from "../i18n/core/lang";
import { GUARANTEE_TEXT } from "../i18n/pages/guarantee";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "./explorer";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  defaultNumberLang,
  formatPayAmount,
  formatTtti,
  formatUnits,
  formatUsdE8,
  parseTtti,
  payTokenSymbol,
  tttiToUsdE8,
} from "./token";

/**
 * Pure helpers of the personal guarantee screen. Quantities are base units
 * (bigint); texts come from GUARANTEE_TEXT.
 */

export type GuaranteeText = (typeof GUARANTEE_TEXT)["en"];

/** Redemption fee in basis points (1%), set aside for the creator. */
export const REDEMPTION_FEE_BPS = 100n;

/** Error thrown by query hooks when the backend returns a GuaranteeError. */
export class GuaranteeFailure extends Error {
  readonly error: GuaranteeError;
  constructor(error: GuaranteeError) {
    super(error.__kind__);
    this.name = "GuaranteeFailure";
    this.error = error;
  }
}

/** Masses in payment-token order. */
export function sortMasses(
  masses: ReadonlyArray<GuaranteeMassView> | undefined,
): Array<GuaranteeMassView> {
  return [...(masses ?? [])].sort(
    (a, b) =>
      PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token),
  );
}

/** Mass of `token`, when any. */
export function massFor(
  masses: ReadonlyArray<GuaranteeMassView> | undefined,
  token: PayToken | undefined,
): GuaranteeMassView | undefined {
  return token === undefined
    ? undefined
    : masses?.find((m) => m.token === token);
}

/** True when the mass still has TTTI-T that can be returned. */
export function canRedeem(mass: GuaranteeMassView): boolean {
  return mass.remainingTtti > 0n;
}

/** True when the owner can withdraw an excess (mint ended, excess left). */
export function canWithdrawExcess(mass: GuaranteeMassView): boolean {
  return mass.mintEnded && mass.withdrawableExcess > 0n;
}

// --- Amounts -----------------------------------------------------------------

/**
 * TTTI-T amount typed by the user, in base units; '.' and ',' both accepted.
 * Null when empty, malformed or zero.
 */
export function parseTttiAmount(text: string): bigint | null {
  const value = parseTtti(text);
  return value === null || value <= 0n ? null : value;
}

/** TTTI-T quantity with symbol: "0.5 TTTI-T". */
export function formatTttiQuantity(amount: bigint, lang: Lang): string {
  return `${formatTtti(amount, TTTI_DECIMALS, lang)} ${TTTI_SYMBOL}`;
}

/** Token quantity with symbol: "0.001 ckBTC". */
export function formatTokenQuantity(
  amount: bigint,
  token: PayToken,
  lang: Lang,
): string {
  const { decimals, symbol } = PAY_TOKENS[token];
  return `${formatUnits(amount, decimals, 2, lang)} ${symbol}`;
}

/** USD value (usdE8) of `amount` base units of `token` at `rateUsdE8` per whole token. */
export function payToUsdE8(
  amount: bigint,
  token: PayToken,
  rateUsdE8: bigint,
): bigint {
  return (amount * rateUsdE8) / 10n ** BigInt(PAY_TOKENS[token].decimals);
}

/** USD text of a value in usdE8; "–" when the rate is unknown. */
export function formatUsdValue(usdE8: bigint | undefined, lang: Lang): string {
  return usdE8 === undefined ? "–" : formatUsdE8(usdE8, 2, lang);
}

/** Percentage in `lang`'s format: "1%" in English, "1 %" in French. */
export function formatFeePercent(lang: Lang): string {
  return new Intl.NumberFormat(toIntlLocale(lang), {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(Number(REDEMPTION_FEE_BPS) / 10_000);
}

/**
 * Quantity of `token` worth `tttiAmount` TTTI-T at `rateUsdE8`
 * (10,000 USD per TTTI-T), as the backend's dayRateQuantity.
 */
export function dayRateQuantity(
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

/** Redemption fee on a returned amount: 1%, rounded down. */
export function redemptionFeeOf(returned: bigint): bigint {
  return (returned * REDEMPTION_FEE_BPS) / 10_000n;
}

/**
 * TTTI-T allowance the user must approve: the amount returned plus the
 * TTTI-T ledger fee of the transfer_from.
 */
export function requiredTttiAllowance(
  tttiAmount: bigint,
  tttiTransferFee: bigint,
): bigint {
  return tttiAmount + tttiTransferFee;
}

/** True when the active allowance covers the quote. */
export function allowanceCovers(
  allowance: bigint | undefined,
  quote: RedeemQuote,
): boolean {
  return allowance !== undefined && allowance >= quote.tttiAllowanceRequired;
}

// --- Preview ------------------------------------------------------------------

/** One line of the preview, with an optional USD equivalent. */
export interface PreviewRow {
  key:
    | "deposited"
    | "dayRate"
    | "returned"
    | "excessKept"
    | "fee"
    | "thirdPartyFee"
    | "net";
  amount: string;
  usd?: string;
}

/**
 * Lines of the preview of a redemption, in reading order: deposited
 * guarantee, quantity worth 10,000 USD per TTTI-T (during the mint only),
 * returned amount, excess kept, 1% fee, third-party fee and net amount.
 * USD equivalents use the quote's own rate and are absent after the mint.
 */
export function previewRows(quote: RedeemQuote, lang: Lang): Array<PreviewRow> {
  const rate = quote.rateUsdE8;
  const row = (
    key: PreviewRow["key"],
    amount: bigint,
    withUsd: boolean,
  ): PreviewRow => ({
    key,
    amount: formatPayAmount(amount, quote.token, lang),
    ...(withUsd && rate !== undefined
      ? { usd: formatUsdE8(payToUsdE8(amount, quote.token, rate), 2, lang) }
      : {}),
  });
  const rows: Array<PreviewRow> = [
    row("deposited", quote.depositedGuarantee, true),
  ];
  if (quote.dayRateQuantity !== undefined) {
    rows.push(row("dayRate", quote.dayRateQuantity, true));
  }
  rows.push(row("returned", quote.returnedAmount, true));
  if (quote.excessKept > 0n)
    rows.push(row("excessKept", quote.excessKept, true));
  rows.push(row("fee", quote.redemptionFee, false));
  rows.push(row("thirdPartyFee", quote.thirdPartyFee, false));
  rows.push(row("net", quote.netAmount, true));
  return rows;
}

/** Label of a preview line. */
export function previewLabel(key: PreviewRow["key"], t: GuaranteeText): string {
  switch (key) {
    case "deposited":
      return t.previewDeposited;
    case "dayRate":
      return t.previewDayRate;
    case "returned":
      return t.previewReturned;
    case "excessKept":
      return t.previewExcessKept;
    case "fee":
      return t.previewFee;
    case "thirdPartyFee":
      return t.previewThirdPartyFee;
    case "net":
      return t.previewNet;
  }
}

/** Label of the rule applied to a quote or a redemption. */
export function ruleLabel(rule: RedeemRule, t: GuaranteeText): string {
  switch (rule) {
    case RedeemRule.depositedGuarantee:
      return t.ruleDeposited;
    case RedeemRule.dayRate:
      return t.ruleDayRate;
    case RedeemRule.proRata:
      return t.ruleProRata;
  }
}

/** Short explanation of the rule applied. */
export function ruleExplanation(rule: RedeemRule, t: GuaranteeText): string {
  return rule === RedeemRule.proRata ? t.explainProRata : t.explainLowerOfTwo;
}

// --- Redemptions ----------------------------------------------------------------

/** Redemptions of a token (all when omitted), newest first. */
export function redemptionsOf(
  redemptions: ReadonlyArray<Redemption> | undefined,
  token?: PayToken,
): Array<Redemption> {
  return (redemptions ?? [])
    .filter((r) => token === undefined || r.token === token)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Label of a redemption status. */
export function redemptionStatusLabel(
  redemption: Redemption,
  t: GuaranteeText,
): string {
  switch (redemption.status.__kind__) {
    case "completed":
      return t.statusCompleted;
    case "inProgress":
      return t.statusInProgress;
    case "needsReview":
      return t.statusNeedsReview;
    case "failed":
      return t.statusFailed;
  }
}

/** Label of a redemption kind. */
export function redemptionKindLabel(
  kind: RedemptionKind,
  t: GuaranteeText,
): string {
  return kind === RedemptionKind.excessWithdrawal
    ? t.kindExcessWithdrawal
    : t.kindRedeem;
}

/** History target of the TTTI-T block taken from the user, when known. */
export function pullBlockTarget(
  redemption: Redemption,
): BlockLinkTarget | null {
  return redemption.tttiPullBlock === undefined
    ? null
    : tttiBlockTarget(redemption.tttiPullBlock);
}

/** Explorer target of the payout block on the returned token's ledger, when completed. */
export function payoutBlockTarget(
  redemption: Redemption,
): BlockLinkTarget | null {
  return redemption.status.__kind__ === "completed"
    ? blockLinkTarget(redemption.token, redemption.status.completed)
    : null;
}

// --- Errors -----------------------------------------------------------------------

/** Message in `lang` for every GuaranteeError variant. */
export function guaranteeErrorMessage(
  error: GuaranteeError,
  lang: Lang = defaultNumberLang(),
): string {
  const t = pickDict(GUARANTEE_TEXT, lang);
  switch (error.__kind__) {
    case "anonymous":
      return t.errAnonymous;
    case "salesPaused":
      return t.errSalesPaused;
    case "massNotFound":
      return t.errMassNotFound;
    case "nothingRemaining":
      return t.errNothingRemaining;
    case "amountTooSmall":
      return t.errAmountTooSmall;
    case "amountExceedsMass":
      return t.errAmountExceedsMass(
        formatTttiQuantity(error.amountExceedsMass.requested, lang),
        formatTttiQuantity(error.amountExceedsMass.remaining, lang),
      );
    case "rateUnavailable":
      return t.errRateUnavailable(payTokenSymbol(error.rateUnavailable));
    case "tttiBalanceInsufficient":
      return t.errTttiBalance(
        formatTttiQuantity(error.tttiBalanceInsufficient.balance, lang),
        formatTttiQuantity(error.tttiBalanceInsufficient.required, lang),
      );
    case "allowanceInsufficient":
      return t.errAllowance(
        formatTttiQuantity(error.allowanceInsufficient.allowance, lang),
        formatTttiQuantity(error.allowanceInsufficient.required, lang),
      );
    case "slippage":
      return t.errSlippage;
    case "redemptionInProgress":
      return t.errRedemptionInProgress;
    case "mintNotEnded":
      return t.errMintNotEnded;
    case "noExcess":
      return t.errNoExcess;
    case "pullFailed":
      return t.errPullFailed(error.pullFailed);
    case "callFailed":
      return t.errCallFailed(error.callFailed);
  }
}

/** Message for any failure thrown by a guarantee hook. */
export function guaranteeFailureMessage(
  failure: unknown,
  lang: Lang = defaultNumberLang(),
): string {
  if (failure instanceof GuaranteeFailure) {
    return guaranteeErrorMessage(failure.error, lang);
  }
  const text = failure instanceof Error ? failure.message : String(failure);
  return pickDict(GUARANTEE_TEXT, lang).errCallFailed(text);
}
