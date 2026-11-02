import { BidOutcome, ClosedStatus, OpenAuctionError } from "../../backend";
import type { BidError, PayToken } from "../../backend";
import type { BidFailure } from "../../hooks/useAuction";
import type { Lang } from "../../i18n/core";
import type { AUCTION_TEXT } from "../../i18n/pages/auction";
import { TTTI_DECIMALS, formatPayAmount, formatUnits } from "../../lib/token";

export type AuctionText = (typeof AUCTION_TEXT)["en"];

/** TTTI-T amount (8 decimals) without the symbol. */
export function formatTttiE8(value: bigint, lang: Lang): string {
  return formatUnits(value, TTTI_DECIMALS, 0, lang);
}

/** USD per TTTI-T amount (8 decimals), with the currency code. */
export function formatUsdPerTtti(usdE8: bigint, lang: Lang): string {
  return `${formatUnits(usdE8, 8, 0, lang)} USD`;
}

/** Translated outcome of a published offer. */
export function outcomeText(t: AuctionText, outcome: BidOutcome): string {
  switch (outcome) {
    case BidOutcome.served:
      return t.outcomeServed;
    case BidOutcome.partiallyServed:
      return t.outcomePartiallyServed;
    case BidOutcome.notServed:
      return t.outcomeNotServed;
    case BidOutcome.discardedBelowReserve:
      return t.outcomeDiscarded;
  }
}

/** Translated status of a closed auction. */
export function closedStatusText(t: AuctionText, status: ClosedStatus): string {
  switch (status) {
    case ClosedStatus.fullySold:
      return t.statusFullySold;
    case ClosedStatus.partiallySold:
      return t.statusPartiallySold;
    case ClosedStatus.unsold:
      return t.statusUnsold;
  }
}

/** Principal text shortened for tables; the full text goes in the title. */
export function shortPrincipal(text: string): string {
  return text.length <= 15 ? text : `${text.slice(0, 5)}…${text.slice(-5)}`;
}

/** Translated message for every BidError variant. */
export function bidErrorText(
  t: AuctionText,
  error: BidError,
  token: PayToken,
  lang: Lang,
): string {
  const pay = (amount: bigint) => formatPayAmount(amount, token, lang);
  switch (error.__kind__) {
    case "tooManyBids":
      return t.bidErrTooMany(error.tooManyBids.maximum.toString());
    case "insufficientFunds":
      return t.bidErrInsufficientFunds(
        pay(error.insufficientFunds.balance),
        pay(error.insufficientFunds.required),
      );
    case "quantityBelowMinimum":
      return t.bidErrQuantityBelow(
        formatTttiE8(error.quantityBelowMinimum.minimum, lang),
      );
    case "invalidPrice":
      return t.bidErrInvalidPrice;
    case "anonymous":
      return t.bidErrAnonymous;
    case "ledgerError":
      return t.bidErrLedger(error.ledgerError);
    case "allowanceInsufficient":
      return t.bidErrAllowance(
        pay(error.allowanceInsufficient.required),
        pay(error.allowanceInsufficient.allowance),
      );
    case "noOpenAuction":
      return t.bidErrNoOpen;
    case "bidInProgress":
      return t.bidErrInProgress;
    case "depositBelowRequired":
      return t.bidErrDepositBelow(
        pay(error.depositBelowRequired.deposited),
        pay(error.depositBelowRequired.required),
      );
    case "paused":
      return t.bidErrPaused;
    case "priceBelowMinimum": {
      const { minimumUsdE8, bidUsdE8 } = error.priceBelowMinimum;
      const minimum = formatUsdPerTtti(minimumUsdE8, lang);
      return bidUsdE8 === undefined
        ? t.bidErrPriceBelowMinimum(minimum)
        : t.bidErrPriceBelowMinimumBid(
            minimum,
            formatUsdPerTtti(bidUsdE8, lang),
          );
    }
    case "depositBelowLedgerFee":
      return t.bidErrDepositBelowFee(
        pay(error.depositBelowLedgerFee.fee),
        pay(error.depositBelowLedgerFee.deposited),
      );
    case "wholeLotRequired":
      return t.bidErrWholeLot(
        formatTttiE8(error.wholeLotRequired.lotSizeE8s, lang),
      );
  }
}

export function failureText(
  t: AuctionText,
  failure: BidFailure,
  token: PayToken,
  lang: Lang,
): string {
  switch (failure.kind) {
    case "approval":
      return t.approvalFailed(failure.message);
    case "bid":
      return bidErrorText(t, failure.error, token, lang);
    case "unexpected":
      return t.unexpectedError;
  }
}

export function openErrorText(t: AuctionText, error: OpenAuctionError): string {
  switch (error) {
    case OpenAuctionError.alreadyOpen:
      return t.openErrorAlreadyOpen;
    case OpenAuctionError.emptyLot:
      return t.openErrorEmptyLot;
    case OpenAuctionError.paused:
      return t.openErrorPaused;
  }
}
