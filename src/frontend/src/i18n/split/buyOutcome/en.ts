const en = {
  fallbackMessage:
    "The purchase could not be completed for this destination. Check the recipient and try again.",
  server: (server: string) => server,
  reference: (id: string) => ` Reference: purchase #${id}.`,
  contactTeam: " Contact the team with this reference.",
  refundedTitle: (symbol: string, fee: string) =>
    `Delivery failed — your ${symbol} was refunded minus the ${fee} fee`,
  refundFailed: "Delivery failed and the automatic refund also failed",
  refundedMessage: (server: string) => server,
  refundFailedMessage: (server: string) => server,
  salesPausedTitle: "Sales are paused",
  salesPausedMessage: (server: string) => server,
  saleCompleteTitle: "Sale complete",
  saleCompleteMessage: (server: string) => server,
  belowMinimumTitle: "Below the minimum purchase",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `The minimum is ${minimum} ${display} (${minimumUsd} in ${symbol}); you requested ${requested} ${display}.`,
  aboveRemainingTitle: "Above the remaining amount",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `The maximum available is ${maximum} ${display} (${maximumPay}); you requested ${requested} ${display}.`,
  priceUnavailableTitle: (symbol: string) =>
    `Purchase refused: no valid ${symbol}/USD rate is set`,
  priceUnavailableMessage: (symbol: string) =>
    `No ${symbol} was taken. Purchases in ${symbol} are unavailable until a rate is set.`,
  notConfiguredTitle: (symbol: string) => `${symbol} is not configured`,
  notConfiguredMessage: (symbol: string) =>
    `The sale is not configured yet. No ${symbol} was taken.`,
  ledgerMismatchTitle: (symbol: string) => `${symbol} ledger mismatch`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `The ${symbol} ledger reports ${actualDecimals} decimals and a fee of ${actualFee}; expected ${expectedDecimals} decimals and ${expectedFee}. No ${symbol} was taken.`,
  ackRequiredTitle: "Acknowledgements required",
  ackRequiredMessage: (symbol: string) =>
    `This account has not accepted the six purchase acknowledgements. No ${symbol} was taken.`,
  invalidAmountTitle: "Invalid amount",
  invalidAmountMessage: (server: string) => server,
  insufficientTitle: (symbol: string) => `Insufficient ${symbol} balance`,
  insufficientMessage: (server: string, balance: string) =>
    `${server} Balance: ${balance}.`,
  approvalMissingTitle: (symbol: string) => `${symbol} approval missing`,
  approvalMissingMessage: (server: string, allowance: string) =>
    `${server} Current allowance: ${allowance}.`,
  inProgressTitle: "Purchase already in progress",
  inProgressMessage: (symbol: string) =>
    `A purchase is already in progress for this account. Wait for it to finish, then try again. No ${symbol} was taken for this request.`,
  ledgerErrorTitle: (symbol: string) => `${symbol} ledger error`,
  ledgerErrorMessage: (server: string) => server,
  signInTitle: "Sign in to mint",
  signInMessage: (_server: string) => "Please sign in to mint TTTI-T.",
  notCompletedTitle: "Purchase not completed",
  failedTitle: "Purchase failed",
};

export default en;
