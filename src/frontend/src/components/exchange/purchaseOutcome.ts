import type {
  Conversion,
  PayToken,
  PurchaseError,
  PurchaseResult,
} from "../../backend";
import { ConversionStatus } from "../../backend";
import { pickDict } from "../../i18n/core/dict";
import type { Lang } from "../../i18n/core/lang";
import { BUY_OUTCOME_TEXT } from "../../i18n/pages/buy";
import {
  PAY_TOKENS,
  formatPayAmount,
  formatTtti,
  minimumUsdLabel,
  payTokenSymbol,
} from "../../lib/token";

const DISPLAY_SYMBOL = "TTTI-T";

export type Notice = { title: string; message: string; refunded?: boolean };
export type Outcome =
  | { kind: "success"; conversion: Conversion }
  | ({ kind: "error" } & Notice);

export function safePurchaseMessage(
  message: string | undefined,
  lang?: Lang,
): string {
  if (!message) {
    return pickDict(BUY_OUTCOME_TEXT, lang).fallbackMessage;
  }
  return message;
}

/** "Delivery failed — your ckBTC was refunded minus the 0.0000001 ckBTC fee". */
export function refundedTitle(token: PayToken, lang?: Lang): string {
  return pickDict(BUY_OUTCOME_TEXT, lang).refundedTitle(
    payTokenSymbol(token),
    formatPayAmount(PAY_TOKENS[token].fee, token),
  );
}

/** Notice for a purchase error; `selected` names the token when the code carries none. */
export function describePurchaseError(
  err: PurchaseError,
  selected: PayToken,
  lang?: Lang,
): Notice {
  const t = pickDict(BUY_OUTCOME_TEXT, lang);
  const server = safePurchaseMessage(err.message, lang);
  const ref = err.conversion ? t.reference(err.conversion.id.toString()) : "";
  const symbol = payTokenSymbol(err.conversion?.payToken ?? selected);
  const code = err.code;
  switch (code.__kind__) {
    case "salesPaused":
      return {
        title: t.salesPausedTitle,
        message: t.salesPausedMessage(server),
      };
    case "saleComplete":
      return {
        title: t.saleCompleteTitle,
        message: t.saleCompleteMessage(server),
      };
    case "belowMinimum":
      return {
        title: t.belowMinimumTitle,
        message: t.belowMinimumMessage(
          formatTtti(code.belowMinimum.minimumTtti),
          DISPLAY_SYMBOL,
          minimumUsdLabel(selected),
          symbol,
          formatTtti(code.belowMinimum.requestedTtti),
        ),
      };
    case "aboveRemaining":
      return {
        title: t.aboveRemainingTitle,
        message: t.aboveRemainingMessage(
          formatTtti(code.aboveRemaining.maximumTtti),
          DISPLAY_SYMBOL,
          formatPayAmount(
            code.aboveRemaining.maximumPayAmount,
            code.aboveRemaining.token,
          ),
          formatTtti(code.aboveRemaining.requestedTtti),
        ),
      };
    case "priceUnavailable": {
      const sym = payTokenSymbol(code.priceUnavailable.token);
      return {
        title: t.priceUnavailableTitle(sym),
        message: t.priceUnavailableMessage(sym),
      };
    }
    case "tokenNotConfigured": {
      const sym = payTokenSymbol(code.tokenNotConfigured.token);
      return {
        title: t.notConfiguredTitle(sym),
        message: t.notConfiguredMessage(sym),
      };
    }
    case "ledgerMismatch": {
      const m = code.ledgerMismatch;
      const sym = payTokenSymbol(m.token);
      return {
        title: t.ledgerMismatchTitle(sym),
        message: t.ledgerMismatchMessage(
          sym,
          m.actualDecimals.toString(),
          formatPayAmount(m.actualFee, m.token),
          m.expectedDecimals.toString(),
          formatPayAmount(m.expectedFee, m.token),
        ),
      };
    }
    case "acknowledgementRequired":
      return {
        title: t.ackRequiredTitle,
        message: t.ackRequiredMessage(symbol),
      };
    case "invalidAmount":
      return {
        title: t.invalidAmountTitle,
        message: t.invalidAmountMessage(server),
      };
    case "insufficientBalance":
      return {
        title: t.insufficientTitle(
          payTokenSymbol(code.insufficientBalance.token),
        ),
        message: t.insufficientMessage(
          server,
          formatPayAmount(
            code.insufficientBalance.balance,
            code.insufficientBalance.token,
          ),
        ),
      };
    case "approvalMissing":
      return {
        title: t.approvalMissingTitle(
          payTokenSymbol(code.approvalMissing.token),
        ),
        message: t.approvalMissingMessage(
          server,
          formatPayAmount(
            code.approvalMissing.allowance,
            code.approvalMissing.token,
          ),
        ),
      };
    case "purchaseInProgress":
      return {
        title: t.inProgressTitle,
        message: t.inProgressMessage(symbol),
      };
    case "deliveryFailedRefunded":
      return {
        title: refundedTitle(err.conversion?.payToken ?? selected, lang),
        message: t.refundedMessage(server) + ref,
        refunded: true,
      };
    case "deliveryFailedRefundFailed":
      return {
        title: t.refundFailed,
        message: `${t.refundFailedMessage(server)}${ref}${t.contactTeam}`,
      };
    case "ledgerError":
      return {
        title: t.ledgerErrorTitle(payTokenSymbol(code.ledgerError.token)),
        message: t.ledgerErrorMessage(server),
      };
    case "anonymousCaller":
      return {
        title: t.signInTitle,
        message: t.signInMessage(server),
      };
    default:
      return {
        title: t.notCompletedTitle,
        message: t.server(server),
      };
  }
}

export function outcomeFromResult(
  result: PurchaseResult,
  selected: PayToken,
  lang?: Lang,
): Outcome {
  if (result.__kind__ === "Err") {
    return {
      kind: "error",
      ...describePurchaseError(result.Err, selected, lang),
    };
  }
  const t = pickDict(BUY_OUTCOME_TEXT, lang);
  const c = result.Ok;
  const ref = t.reference(c.id.toString());
  const server = safePurchaseMessage(c.message, lang);
  if (c.status === ConversionStatus.completed) {
    return { kind: "success", conversion: c };
  }
  if (c.status === ConversionStatus.refunded) {
    return {
      kind: "error",
      title: refundedTitle(c.payToken, lang),
      message: t.refundedMessage(server) + ref,
      refunded: true,
    };
  }
  if (c.status === ConversionStatus.refundFailed) {
    return {
      kind: "error",
      title: t.refundFailed,
      message: `${t.refundFailedMessage(server)}${ref}${t.contactTeam}`,
    };
  }
  return {
    kind: "error",
    title: t.failedTitle,
    message: t.server(server) + ref,
  };
}
