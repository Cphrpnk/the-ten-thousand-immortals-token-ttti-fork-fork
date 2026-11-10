import type {
  GuaranteeError,
  PayToken,
  RedeemQuote,
  Redemption,
} from "../backend";
import { pickDict } from "../i18n/core/dict";
import type { Lang } from "../i18n/core/lang";
import { GUARANTEE_TEXT } from "../i18n/pages/guarantee";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "./explorer";
import {
  PAY_TOKENS,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  defaultNumberLang,
  formatPayAmount,
  formatTtti,
  formatUnits,
  formatUsdE8,
  parseTtti,
  payTokenSymbol,
} from "./token";

/**
 * Pure helpers of the common reserve screen. Quantities are base units
 * (bigint); USD values are usdE8; texts come from GUARANTEE_TEXT.
 */

export type GuaranteeText = (typeof GUARANTEE_TEXT)["en"];

/** Error thrown by query hooks when the backend returns a GuaranteeError. */
export class GuaranteeFailure extends Error {
  readonly error: GuaranteeError;
  constructor(error: GuaranteeError) {
    super(error.__kind__);
    this.name = "GuaranteeFailure";
    this.error = error;
  }
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

/** USD text of a value in usdE8; "–" when the value is unknown. */
export function formatUsdValue(usdE8: bigint | undefined, lang: Lang): string {
  return usdE8 === undefined ? "–" : formatUsdE8(usdE8, 2, lang);
}

/**
 * TTTI-T the holder can return: the lower of the usable balance (balance
 * minus the ledger fee of the pull) and the circulation outside the contract.
 * Undefined while either figure is unknown.
 */
export function redeemableAmount(
  usable: bigint | undefined,
  circulation: bigint | undefined,
): bigint | undefined {
  if (usable === undefined || circulation === undefined) return undefined;
  return usable < circulation ? usable : circulation;
}

/** True when the active allowance covers the quote. */
export function allowanceCovers(
  allowance: bigint | undefined,
  quote: RedeemQuote,
): boolean {
  return allowance !== undefined && allowance >= quote.tttiAllowanceRequired;
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
    case "amountTooSmall":
      return t.errAmountTooSmall;
    case "amountExceedsCirculation":
      return t.errAmountExceedsCirculation(
        formatTttiQuantity(error.amountExceedsCirculation.requested, lang),
        formatTttiQuantity(error.amountExceedsCirculation.circulation, lang),
      );
    case "reserveEmpty":
      return t.errReserveEmpty;
    case "rateUnavailable":
      return t.errRateUnavailable(payTokenSymbol(error.rateUnavailable));
    case "ledgerFeeNotCovered":
      return t.errLedgerFeeNotCovered(
        payTokenSymbol(error.ledgerFeeNotCovered.token),
        formatPayAmount(
          error.ledgerFeeNotCovered.fee,
          error.ledgerFeeNotCovered.token,
          lang,
        ),
      );
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
      return t.errSlippage(
        formatUsdE8(error.slippage.payoutUsdE8, 2, lang),
        formatUsdE8(error.slippage.expectedPayoutUsdE8, 2, lang),
      );
    case "redemptionInProgress":
      return t.errRedemptionInProgress;
    case "acknowledgementRequired":
      return t.errAcknowledgementRequired;
    case "nothingToConvert":
      return t.errNothingToConvert;
    case "conversionFailed":
      return t.errConversionFailed(error.conversionFailed);
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
