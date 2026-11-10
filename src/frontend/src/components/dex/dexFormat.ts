import { DexToken, FeeTier, PayToken, PoolStatus } from "../../backend";
import type {
  ClaimBonusError,
  DexDepositError,
  DexTokenInfo,
  DexTransferStatus,
  DexWithdrawError,
  PairRefundStatus,
  PoolTokenView,
  RequestPairError,
  RequestStatus,
} from "../../backend";
import { type Lang, formatNumber, toIntlLocale } from "../../i18n/core/lang";
import type { DEX_TEXT } from "../../i18n/pages/dex";
import {
  PAY_TOKENS,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  formatUnits,
  timestampToDate,
} from "../../lib/token";

export type DexText = (typeof DEX_TEXT)["en"];

export const FEE_TIER_ORDER: ReadonlyArray<FeeTier> = [
  FeeTier.bps5,
  FeeTier.bps30,
  FeeTier.bps100,
];

export function feeTierLabel(t: DexText, tier: FeeTier): string {
  switch (tier) {
    case FeeTier.bps5:
      return t.feeTierBps5;
    case FeeTier.bps30:
      return t.feeTierBps30;
    case FeeTier.bps100:
      return t.feeTierBps100;
  }
}

export function poolStatusLabel(t: DexText, status: PoolStatus): string {
  switch (status) {
    case PoolStatus.filling:
      return t.statusFilling;
    case PoolStatus.active:
      return t.statusActive;
    case PoolStatus.removed:
      return t.statusRemoved;
  }
}

export function requestStatusLabel(t: DexText, status: RequestStatus): string {
  switch (status.__kind__) {
    case "pending":
      return t.requestStatusPending;
    case "approved":
      return t.requestStatusApproved;
    case "refused":
      return t.requestStatusRefused;
  }
}

/** TTTI-T amount in the active number format, trailing zeros trimmed. */
export function formatTttiAmount(value: bigint): string {
  return formatUnits(value, TTTI_DECIMALS, 0);
}

export function formatTokenAmount(value: bigint, token: PoolTokenView): string {
  return `${formatUnits(value, token.decimals, 0)} ${token.symbol}`;
}

export function formatDexDate(timestamp: bigint, lang: Lang): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return new Intl.DateTimeFormat(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Localized message for every requestPair error variant. */
export function requestErrorText(
  t: DexText,
  error: RequestPairError,
  lang: Lang,
  deposit: { decimals: number; symbol: string },
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errAnonymous;
    case "messageTooLong":
      return t.errMessageTooLong(formatNumber(error.messageTooLong.max));
    case "invalidToken":
      return t.errInvalidToken(error.invalidToken);
    case "unknownCounterToken":
      return t.errUnknownCounterToken;
    case "ledgerUnreachable":
      return t.errLedgerUnreachable(error.ledgerUnreachable);
    case "missingStandards": {
      const missing = [
        error.missingStandards.icrc1 ? null : "ICRC-1",
        error.missingStandards.icrc2 ? null : "ICRC-2",
      ].filter((s): s is string => s !== null);
      return t.errMissingStandards(missing.join(", ") || "ICRC-1, ICRC-2");
    }
    case "metadataUnavailable":
      return t.errMetadataUnavailable(error.metadataUnavailable);
    case "pairExists":
      return t.errPairExists;
    case "tooManyPending":
      return t.errTooManyPending(formatNumber(error.tooManyPending.max));
    case "cooldown":
      return t.errCooldown(formatDexDate(error.cooldown.until, lang));
    case "insufficientAllowance":
      return t.errInsufficientAllowance(
        formatDexUnits(error.insufficientAllowance.allowance, deposit),
        formatDexUnits(error.insufficientAllowance.required, deposit),
      );
    case "insufficientFunds":
      return t.errInsufficientFunds(
        formatDexUnits(error.insufficientFunds.balance, deposit),
      );
    case "depositFailed":
      return t.errDepositFailed(error.depositFailed);
    case "payTokenNotAccepted":
      return t.errPayTokenNotAccepted(deposit.symbol);
    case "rateUnavailable":
      return t.errDepositRateUnavailable(deposit.symbol);
    case "requestInProgress":
      return t.errRequestInProgress;
  }
}

/** DEX token order: TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT. */
export const DEX_TOKEN_ORDER: ReadonlyArray<DexToken> = [
  DexToken.tttiT,
  DexToken.icp,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
];

/** Decimals and symbol of a DEX token (TTTI-T or a pay token). */
export function dexTokenUnits(token: DexToken): {
  decimals: number;
  symbol: string;
} {
  switch (token) {
    case DexToken.tttiT:
      return { decimals: TTTI_DECIMALS, symbol: TTTI_SYMBOL };
    case DexToken.icp:
      return PAY_TOKENS[PayToken.icp];
    case DexToken.ckbtc:
      return PAY_TOKENS[PayToken.ckbtc];
    case DexToken.ckusdc:
      return PAY_TOKENS[PayToken.ckusdc];
    case DexToken.ckusdt:
      return PAY_TOKENS[PayToken.ckusdt];
  }
}

/** Tokens accepted for a pair-request deposit, in display order. */
export const REQUEST_DEPOSIT_TOKENS: ReadonlyArray<DexToken> = [
  DexToken.icp,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
];

/** Margin, in basis points, added to the approved allowance for rate changes. */
export const REQUEST_ALLOWANCE_MARGIN_BPS = 500n;

/**
 * Deposit in base units of a token whose price is `rateUsdE8` per whole
 * token, rounded up: `usdE8` of value. Null when the rate is missing.
 */
export function requestDepositIn(
  usdE8: bigint,
  decimals: number,
  rateUsdE8: bigint | null,
): bigint | null {
  if (rateUsdE8 === null || rateUsdE8 <= 0n) return null;
  const scale = 10n ** BigInt(decimals);
  return (usdE8 * scale + rateUsdE8 - 1n) / rateUsdE8;
}

/** Amount in base units with its symbol, in the active number format. */
export function formatDexUnits(
  value: bigint,
  token: { decimals: number; symbol: string },
): string {
  return `${formatUnits(value, token.decimals, 0)} ${token.symbol}`;
}

/** Pool-token view of a DEX token, for the shared token logo. */
export function dexLogoToken(token: DexTokenInfo): PoolTokenView {
  return {
    decimals: token.decimals,
    ledgerId: token.ledgerId,
    isTttiT: token.token === DexToken.tttiT,
    symbol: token.symbol,
  };
}

export function transferStatusLabel(
  t: DexText,
  status: DexTransferStatus,
): string {
  switch (status.__kind__) {
    case "inProgress":
      return t.transferStatusInProgress;
    case "completed":
      return t.transferStatusCompleted;
    case "failed":
      return t.transferStatusFailed;
    case "needsReview":
      return t.transferStatusNeedsReview;
  }
}

export function refundStatusLabel(
  t: DexText,
  status: PairRefundStatus,
): string {
  switch (status.__kind__) {
    case "none":
      return t.refundNone;
    case "inProgress":
      return t.refundInProgress;
    case "needsReview":
      return t.refundNeedsReview;
    case "refunded":
      return t.refundRefunded(formatNumber(status.refunded));
  }
}

/** Localized message for every depositToDex / withdrawFromDex error variant. */
export function dexTransferErrorText(
  t: DexText,
  error: DexDepositError | DexWithdrawError,
  token: { decimals: number; symbol: string },
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errDexAnonymous;
    case "amountTooSmall":
      return t.errAmountTooSmall(
        formatDexUnits(error.amountTooSmall.minimum, token),
      );
    case "transferInProgress":
      return t.errTransferInProgress;
    case "insufficientAllowance":
      return t.errDexInsufficientAllowance(
        formatDexUnits(error.insufficientAllowance.allowance, token),
        formatDexUnits(error.insufficientAllowance.required, token),
      );
    case "insufficientFunds":
      return t.errDexInsufficientFunds(
        formatDexUnits(error.insufficientFunds.balance, token),
      );
    case "insufficientBalance":
      return t.errDexInsufficientBalance(
        formatDexUnits(error.insufficientBalance.available, token),
      );
    case "ledgerError":
      return t.errLedger(error.ledgerError);
  }
}

// DEX lot 4: ICP bonus (DL) claims.

/** The bonus is held and paid in ICP (8 decimals). */
export const ICP_BONUS_UNITS = { decimals: 8, symbol: "ICP" } as const;

/** ICP bonus amount (e8s) in the active number format, e.g. "0.0125 ICP". */
export function formatBonusIcp(e8s: bigint): string {
  return formatDexUnits(e8s, ICP_BONUS_UNITS);
}

/** Localized text of a claimLpBonus error. */
export function claimBonusErrorText(t: DexText, err: ClaimBonusError): string {
  switch (err.__kind__) {
    case "anonymous":
      return t.errClaimAnonymous;
    case "nothingToClaim":
      return t.errClaimNothing;
    case "belowMinimum":
      return t.errClaimBelowMinimum(
        formatBonusIcp(err.belowMinimum.minimumE8s),
      );
    case "claimInProgress":
      return t.errClaimInProgress;
  }
}

/** The backend traps with this text when a call is refused because the DEX is paused. */
const DEX_PAUSED_REJECT = "The DEX is paused";

export function isDexPausedMessage(message: string): boolean {
  return message.includes(DEX_PAUSED_REJECT);
}

/** Error text of a failed call: errDexPaused for a pause refusal, else the given fallback. */
export function dexCallErrorText(
  t: DexText,
  message: string,
  fallback: (detail: string) => string = t.errCall,
): string {
  return isDexPausedMessage(message) ? t.errDexPaused : fallback(message);
}
