import { DexToken, FeeTier, PoolStatus } from "../../backend";
import type {
  ApproveError,
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
import { describeApproveError } from "../../lib/icpLedger";
import {
  PAY_TOKENS,
  type PayTokenDescriptor,
  TOKEN_NAME,
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
        formatTttiAmount(error.insufficientAllowance.allowance),
        formatTttiAmount(error.insufficientAllowance.required),
      );
    case "insufficientFunds":
      return t.errInsufficientFunds(
        formatTttiAmount(error.insufficientFunds.balance),
      );
    case "depositFailed":
      return t.errDepositFailed(error.depositFailed);
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

/** Localized TTTI-T approval failure. */
export function approvalErrorText(
  t: DexText,
  error: ApproveError,
  fee: bigint,
): string {
  const ttti: PayTokenDescriptor = {
    ...PAY_TOKENS.icp,
    symbol: TTTI_SYMBOL,
    name: TOKEN_NAME,
    ledgerCanisterId: "",
    decimals: TTTI_DECIMALS,
    fee,
  };
  return t.errApprovalFailed(describeApproveError(error, ttti));
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
