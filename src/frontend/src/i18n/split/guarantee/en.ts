const en = {
  title: "Redemption",
  ruleSummary: "1 TTTI-T redeems for at most 10,000 USD, with no fee.",
  rulePayout:
    "The amount paid is the lower of 10,000 USD × x and the reserve divided by the TTTI-T in circulation outside the contract × x, where x is the TTTI-T redeemed.",
  rulePayment:
    "It is paid in ICP, ckBTC, ckUSDC and ckUSDT, in proportion to the composition of the reserve. A redemption cannot exceed the TTTI-T in circulation outside the contract.",
  ruleAnyHolder:
    "The reserve is common to all holders. Any holder can redeem, including one who never minted.",
  ruleMintLock:
    "At a mint, a variable share m of the TTTI-T is pooled and locked in the minter's name. The relay releases it after 3 months at the latest.",
  ruleMintChoice:
    "Before paying, the minter chooses to pool the remainder (1 − m) (choice A) or to keep it in the wallet (choice B).",
  ruleMintReserve:
    "The common reserve receives 10,000 USD per TTTI-T minted, whatever the choice. It is calculated in USD and held in the token paid (ICP, ckBTC, ckUSDC or ckUSDT), without conversion.",
  redeemHeldNote:
    "Any held TTTI-T can be redeemed at up to 10,000 USD from the common reserve, including TTTI-T kept in the wallet under choice B.",
  signInPrompt: "Sign in to redeem TTTI-T.",
  loadError: "Your redemptions could not be loaded.",
  retryButton: "Retry",
  reserveTitle: "Reserve",
  reserveLoading: "Loading the reserve…",
  reserveLoadError: "The reserve could not be loaded.",
  reserveTotalLabel: "Reserve (USD)",
  reserveTokenLabel: (symbol: string) => `Reserve in ${symbol}`,
  circulationLabel: "TTTI-T in circulation outside the contract",
  reservePerTtiLabel: "Reserve per TTTI-T",
  reservePerTtttiNone: "No TTTI-T in circulation",
  requiredLabel: "Required (10,000 USD × circulation)",
  invariantLabel: "Invariant",
  invariantHolds: "Reserve at least equal to the required amount",
  invariantBroken: "Reserve below the required amount",
  shortfallLabel: "Shortfall",
  shortfallNone: "None",
  reserveRateMissing: (symbol: string) => `no rate for ${symbol}`,
  redeemTitle: "Redeem",
  redeemIntro:
    "Return TTTI-T against the common reserve. The preview shows the exact amount received before anything is signed.",
  amountLabel: "TTTI-T to redeem",
  amountPlaceholder: "0.0",
  maxButton: "Max",
  amountInvalid: "Enter an amount greater than zero.",
  redeemButton: "Redeem",
  redeemingButton: "Redeeming…",
  previewTitle: "Preview",
  previewLoading: "Calculating…",
  previewCap: "10,000 USD × x",
  previewReserveShare: "Reserve ÷ circulation outside the contract × x",
  previewPaidIn: (symbol: string) => `Paid in ${symbol}`,
  previewCirculation: "TTTI-T in circulation outside the contract",
  previewNet: "You receive (the lower of the two)",
  previewUsdNote: "USD values use the rates of this preview.",
  previewLedgerFeeNote:
    "The ledger fees of the payout are not deducted from the amount received.",
  returnedTttiNote:
    "Returned TTTI-T are held by the contract and leave the circulation outside the contract. Nothing is burned.",
  allowanceTitle: "TTTI-T approval",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `Returning TTTI-T requires an ICRC-2 approval for the amount returned plus the TTTI-T ledger fee: ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) => `Current approval: ${allowance}`,
  allowanceOk: "The current approval covers this redemption.",
  allowanceMissing:
    "The current approval is not enough. It is requested before the redemption.",
  approvingButton: "Approving…",
  allowanceExpiryNote:
    "An approval always has an expiration. Check the amount and the date in your wallet before confirming.",
  historyTitle: "My redemptions",
  historyEmpty: "No redemption yet.",
  statusCompleted: "Completed",
  statusInProgress: "In progress",
  statusNeedsReview: "Needs review",
  statusFailed: "Failed",
  historyReturned: "TTTI-T returned",
  historyNet: "Received",
  historyPullBlock: "TTTI-T block",
  historyPayoutBlock: "Payout block",
  resultCompleted: (net: string) => `Completed. You received ${net}.`,
  resultInProgress:
    "The payout is in progress. It appears in the list below once completed.",
  resultNeedsReview:
    "The payout needs to be checked. It stays in the list below with its status.",
  resultFailed: "The payout did not complete.",
  errAnonymous: "Sign in to redeem.",
  errSalesPaused: "Redemptions are paused.",
  errAmountTooSmall:
    "The amount is too small to be paid out. Redemption is not possible.",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `The amount ${requested} exceeds the TTTI-T in circulation outside the contract: ${circulation}.`,
  errReserveEmpty: "The reserve is empty. Redemption is not possible.",
  errRateUnavailable: (symbol: string) =>
    `No rate is available for ${symbol} right now. Try again later.`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `The amount does not cover the ${symbol} ledger fee of the payout (${fee}). Redemption is not possible.`,
  errTttiBalance: (balance: string, required: string) =>
    `The TTTI-T balance is ${balance}; ${required} is required.`,
  errAllowance: (allowance: string, required: string) =>
    `The TTTI-T approval is ${allowance}; ${required} is required.`,
  errSlippage: (payout: string, expected: string) =>
    `The amount received would be ${payout}, lower than the ${expected} shown in the preview. Refresh the preview and try again.`,
  errRedemptionInProgress: "A redemption is already in progress.",
  errNothingToConvert: "There is nothing to convert for this operation.",
  errConversionFailed: (detail: string) => `The conversion failed: ${detail}`,
  errPullFailed: (detail: string) =>
    `The TTTI-T could not be collected: ${detail}`,
  errCallFailed: (detail: string) => `The request failed: ${detail}`,
  errInvalidAmount: "Enter a valid amount.",
  errAcknowledgementRequired:
    "The wallet terms must be accepted before redeeming. Open the acceptance step, accept the terms, then redeem again.",
  acceptanceChecking: "Checking the wallet terms…",
  acceptanceMissing:
    "The wallet terms have not been accepted for this account. They must be accepted before redeeming.",
  openAcceptanceButton: "Review and accept the wallet terms",
  percentShare: "Share of the redeemable amount",
  percentComputedOn:
    "Computed on the redeemable amount: the lower of the TTTI-T held and the TTTI-T in circulation outside the contract.",
  balanceNone: "This wallet holds no TTTI-T that can be redeemed.",
  heldLabel: "TTTI-T held",
  limitedByBalance: (held: string, max: string) =>
    `The TTTI-T held (${held}) limit the amount to ${max}.`,
  limitedByCirculation: (circulation: string, max: string) =>
    `The TTTI-T in circulation outside the contract (${circulation}) limit the amount to ${max}.`,
  confirmTitle: "Confirm redemption",
  confirmIntro:
    "You sign an ICRC-2 approval of TTTI-T for the contract. The contract then collects the TTTI-T and pays the amount shown, in the tokens of the reserve (ICP, ckBTC, ckUSDC and ckUSDT).",
  confirmExpiry: "The approval expires after 15 minutes.",
  closeButton: "Close",
  cancelButton: "Cancel",
  resultTitle: "Result",
};

export default en;
