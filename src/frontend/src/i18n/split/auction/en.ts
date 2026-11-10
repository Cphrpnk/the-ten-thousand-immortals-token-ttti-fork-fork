const en = {
  title: "Auction",
  intro:
    "Sealed-bid auction of the returned TTTI-T. Offers are firm and stay hidden from everyone except their author. Each bidder pays their own bid. The highest bids win, in price order, until the lot is sold.",
  loading: "Loading the auction…",
  loadError: "The auction could not be loaded.",
  retryButton: "Retry",
  // Summary
  summaryTitle: "Open auction",
  lotSize: "Lot size",
  closesAt: "Closing time",
  timeLeft: "Time left",
  closingReached: "The closing time has been reached.",
  reserveHeading: "Reserve price",
  reserveUsd: "Current reserve price per TTTI-T",
  reserveEquivalents:
    "Equivalent per TTTI-T in each payment token at the current rate",
  reserveRule:
    "The reserve price is the highest of 10,000 USD per TTTI-T, the 24-hour average of the consolidated TTTI-T price and the current consolidated TTTI-T price. No offer below it passes and nothing is reissued below 10,000 USD: the lot stays in the contract.",
  componentsHeading: "Values compared",
  floorLabel: "Fixed floor per TTTI-T",
  dailyAverageLabel: "24-hour average of the consolidated price",
  currentLabel: "Current consolidated price",
  appliedBadge: "Applied",
  bindingFloor:
    "The fixed floor is the highest value and sets the reserve price.",
  bindingDailyAverage:
    "The 24-hour average is the highest value and sets the reserve price.",
  bindingConsolidated:
    "The current consolidated price is the highest value and sets the reserve price.",
  unavailableNote:
    "A value that is not available is left out of the comparison.",
  reserveSettlementNote:
    "The market part of the reserve price ignores price moves caused by pooling the winners at settlement.",
  rateUnavailable: "No rate at the moment",
  consolidatedLabel: "Consolidated TTTI-T price",
  consolidatedUnavailable: "Not available",
  reserveBadge: "Common reserve",
  reserveSentence:
    "10,000 USD × q of each winner's deposit goes to the common reserve.",
  // Empty state
  emptyTitle: "No auction is open",
  emptyBody:
    "An auction lasts 24 hours. It can be opened when returned TTTI-T is waiting in a lot.",
  nextLot: "Next lot",
  nextLotNone: "No returned TTTI-T is waiting for a lot.",
  openButton: "Open the auction",
  openingButton: "Opening…",
  openErrorAlreadyOpen: "An auction is already open.",
  openErrorEmptyLot: "There is no returned TTTI-T to put in a lot.",
  openErrorPaused: "The auction is paused.",
  openErrorUnexpected: "The auction could not be opened. Try again.",
  // Offer form
  formTitle: "Place an offer",
  formIntro:
    "An offer is firm: it cannot be withdrawn or modified. The full deposit is taken when the offer is placed.",
  tokenLegend: "Payment token",
  quantityLabel: "Quantity (TTTI-T)",
  quantityHint: (minimum: string) =>
    `Minimum ${minimum} TTTI-T, up to 8 decimals.`,
  priceLabel: (symbol: string) => `Price per TTTI-T (${symbol})`,
  priceHint: "Price in the token chosen, for one whole TTTI-T.",
  depositLabel: (symbol: string) => `Deposit (${symbol}, optional)`,
  depositHint:
    "Leave empty to deposit the required amount. A deposit larger than the required one hides the size of the budget.",
  requiredDepositLabel: "Required deposit",
  requiredDepositFormula: "(price + 10,000 USD) × quantity ÷ 0.99, rounded up",
  splitHeading:
    "Split of the deposit of a winner at price B for q TTTI-T, with locked share m and remainder choice A or B",
  splitReserve: "Common reserve (10,000 USD × q)",
  splitPosition: "Winner position at price B (zap)",
  splitCreator: "Creator (1 % of the amount paid)",
  splitShare: "Locked share m",
  splitLocked: "Locked part (3 months)",
  splitHand: "TTTI-T delivered to the wallet",
  splitChoicePayment: (choice: string) =>
    `Payment for choice ${choice} at the current m`,
  splitShareNote:
    "m is taken at settlement time: if it changes after this quote, the value at settlement applies.",
  reserveKeptNote: "The reserve part is kept as is in the paid token.",
  depositSentLabel: "Deposit sent",
  requiredDepositPending: "Enter a quantity and a price.",
  errQuantity: "Enter a quantity with at most 8 decimals.",
  errQuantityMin: (minimum: string) =>
    `The minimum quantity is ${minimum} TTTI-T.`,
  errPrice: (decimals: string) =>
    `Enter a price greater than zero with at most ${decimals} decimals.`,
  errDeposit: (decimals: string) =>
    `Enter a deposit with at most ${decimals} decimals.`,
  errDepositBelow: (required: string) =>
    `The deposit cannot be below the required deposit (${required}).`,
  submitButton: "Place the offer",
  approvingButton: "Waiting for the signature…",
  sendingButton: "Sending the offer…",
  successMessage: "Offer recorded.",
  approvalFailed: (detail: string) => `The approval was not signed: ${detail}`,
  unexpectedError: "The offer could not be sent. Try again.",
  signInPrompt: "Sign in to place an offer.",
  // Block sale
  blockSaleLabel: "Sale type",
  blockSaleValue: "Block sale",
  blockSaleBadge: "Block sale",
  blockSaleRule:
    "This lot is a block sale: the best price per TTTI-T wins the whole lot. The same reserve price applies; an offer below it does not pass.",
  blockQuantityLabel: "Quantity (whole lot, TTTI-T)",
  blockQuantityHint: (lot: string) =>
    `The quantity is the entire lot: ${lot} TTTI-T. It is fixed.`,
  blockPriceHint:
    "One price per TTTI-T, for the whole lot. The best price wins the whole lot.",
  bidErrWholeLot: (lot: string) =>
    `This lot is a block sale. An offer must be for the whole lot: ${lot} TTTI-T.`,
  lotRemainderLabel: "Mint remainder in the lot",
  lotRemainderNote:
    "The mint remainder is part of the lot. It is minted only at settlement, for the winner.",
  settleMinted: "TTTI-T minted at settlement",
  outcomeMinted: (amount: string) => `Minted at settlement: ${amount} TTTI-T`,
  // End of mint
  mintEndedBadge: "Mint over",
  mintEndedTitle: "The mint is over",
  mintEndedBody: (remainder: string) =>
    `The remainder of ${remainder} TTTI-T joins the first auction lot. It is minted only at settlement, for the winner.`,
  mintErrEnded:
    "The mint is over. The remainder joins the first auction lot and is minted only at settlement, for the winner.",
  // Bid errors
  bidErrTooMany: (maximum: string) =>
    `The maximum of ${maximum} offers per person is reached.`,
  bidErrInsufficientFunds: (balance: string, required: string) =>
    `Insufficient funds: balance ${balance}, required ${required}.`,
  bidErrQuantityBelow: (minimum: string) =>
    `The quantity is below the minimum of ${minimum} TTTI-T.`,
  bidErrInvalidPrice: "The price must be greater than zero.",
  bidErrAnonymous: "Sign in to place an offer.",
  bidErrLedger: (detail: string) => `Ledger error: ${detail}`,
  bidErrAllowance: (required: string, allowance: string) =>
    `The approval is too low: required ${required}, approved ${allowance}.`,
  bidErrRateUnavailable: (symbol: string) =>
    `No valid ${symbol}/USD rate is available at the moment. The offer was not placed. Try again later.`,
  bidErrNoOpen: "No auction is open.",
  bidErrInProgress: "Another offer of yours is being processed.",
  bidErrDepositBelow: (deposited: string, required: string) =>
    `The deposit (${deposited}) is below the required deposit (${required}).`,
  bidErrPaused: "Offers are paused.",
  bidErrPriceBelowMinimum: (minimum: string) =>
    `The price is below the minimum of ${minimum} per TTTI-T at the current rate.`,
  bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
    `The offered price (${bid} per TTTI-T) is below the minimum of ${minimum} per TTTI-T at the current rate.`,
  bidErrDepositBelowFee: (fee: string, deposited: string) =>
    `The deposit (${deposited}) must cover at least the ledger fee (${fee}).`,
  priceMinimumHint: (minimum: string) =>
    `Minimum price: ${minimum} per TTTI-T at the current rate.`,
  // Own offers
  myOffersTitle: "My offers",
  privacyNote: "Offers are visible only to their author.",
  firmNote: "Offers are firm: this list is read-only.",
  offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
  myOffersEmpty: "You have no offer in this auction.",
  colQuantity: "Quantity (TTTI-T)",
  colPrice: "Price per TTTI-T",
  colToken: "Token",
  colDeposit: "Deposit",
  colDate: "Date",
  // Closing (PTM-6b)
  closingPendingNotice:
    "The closing time has passed. Closing waits for a valid rate. Offers of other people stay hidden until closing.",
  closedTitle: "Closed auctions",
  closedIntro:
    "Newest first. After closing, the result and all offers are published.",
  closedEmpty: "No auction has been closed yet.",
  closedItemLabel: (id: string, date: string) =>
    `Auction ${id} · closed ${date}`,
  resultNotPublished: "The result is not published yet.",
  resultStatusLabel: "Status",
  statusFullySold: "Fully sold",
  statusPartiallySold: "Partially sold",
  statusUnsold: "Unsold",
  resultServedLabel: "Quantity served",
  resultCarriedLabel: "Carried over to the next lot",
  resultOffersLabel: "Offers received",
  resultClosedAtLabel: "Closed at",
  resultReserveHeading: "Reserve applied",
  resultReserveLabel: "Reserve applied per TTTI-T",
  resultRatesHeading: "Rates used at closing",
  offersHeading: "Published offers",
  offersEmpty: "No offer was placed in this auction.",
  colBidder: "Bidder",
  colOutcome: "Outcome",
  colServed: "Served quantity",
  colReturned: "Amount returned",
  colAuction: "Auction",
  youBadge: "You",
  outcomeServed: "Served",
  outcomePartiallyServed: "Partially served",
  outcomeNotServed: "Not served",
  outcomeDiscarded: "Discarded below reserve",
  outcomePending: "Awaiting closing",
  outcomeDetail: (served: string, returned: string) =>
    `Served ${served} TTTI-T · returned ${returned}`,
  outcomeReturnedOnly: (returned: string) => `Returned ${returned}`,
  balanceTitle: "My balance",
  balanceNote:
    "Deposits of served quantities are awaiting settlement. Unserved offers, unserved parts, deposit excess and deposits of failed settlements are returned to your DEX balance.",
  balanceEmpty: "No amount is recorded for your account.",
  colAwaiting: "Awaiting settlement",
  colReturnedBalance: "Returned to the balance",
  balanceRecoverNote:
    "Returned amounts are in your DEX balance. Use the Recover button there to withdraw them. The reserve part of a winner stays in the common reserve.",
  balanceRecoverLink: "Open the DEX balance",
  balanceFailedNote: (count: string) =>
    `The settlement of ${count} of your winning offers failed: the whole deposit was returned to your DEX balance and the quantity was carried to the next lot.`,
  // Settlement of winners (PTM-6c)
  colSettlement: "Settlement",
  settlementPending: "Pending",
  settlementSettled: "Settled",
  settlementFailed: "Failed",
  settlementNotRequired: "Not required",
  settlementFailedCarried: (carried: string) =>
    `${carried} TTTI-T carried to the next lot`,
  settlementSummaryLabel: "Settlement of winners",
  settlementSummary: (settled: string, pending: string, failed: string) =>
    `${settled} settled · ${pending} pending · ${failed} failed`,
  settlementFailedCarriedLabel:
    "Carried to the next lot after failed settlements",
  settlementHeading: "Settlement of winners",
  settlementRule:
    "For a served quantity q at price B, the winner pays (B + 10,000 USD) × q ÷ 0.99, taken from the deposit. 10,000 USD × q goes to the common reserve, B × q and the q TTTI-T go to the winner's position (zap), and 1 % of the amount paid goes to the creator. The reserve part is calculated in USD and held in the token paid (ICP, ckBTC, ckUSDC or ckUSDT), without conversion. The rest of the deposit is returned to the DEX balance. If the settlement of a winner fails, no position is created and nothing is paid into the common reserve, the whole deposit is returned to the DEX balance and the quantity is carried to the next lot. Other winners are not affected.",
  settleTaken: "Amount taken from the deposit",
  settleCreator: "Creator share (1 %)",
  settlePosition: "Position",
  settlePositionValue: (amount: string, quantity: string) =>
    `${amount} with ${quantity} TTTI-T`,
  settleReserve: "Common reserve",
  settleSurplus: "Deposit surplus returned to the DEX balance",
  settleNoPosition: "Position and reserve share",
  settleNone: "None",
  settleDepositReturned: "Whole deposit returned to the DEX balance",
  settleCarried: "Quantity carried to the next lot",
  settleFailureReason: "Reason",
};

export default en;
