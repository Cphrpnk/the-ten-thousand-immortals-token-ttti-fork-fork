const en = {
  // BtcPurchasePanel
  requestFailed: "The request could not be completed. Try again.",
  errorTitle: "Bitcoin purchase",
  intro:
    "Send BTC to your own Bitcoin address. It becomes ckBTC, then TTTI-T at the hourly rate. 1 % of the amount goes to the creator.",
  recordingAcks: "Recording acknowledgements…",
  creatingAddress: "Creating address…",
  getAddress: "Get my Bitcoin address",
  tickAll: "Tick all six statements to get your address.",
  purchaseAddressLabel: "Your Bitcoin purchase address",
  sentToDelivery: "TTTI-T is sent to your delivery address below.",
  keepPageOpen:
    "Keep this page open until your deposit is detected. If you leave, your purchase will be completed when you come back to this page, at the exchange rate of that moment. If the sale has ended by then, you will be refunded in ckBTC.",
  delivered: (amount: string) => `${amount} TTTI-T delivered`,
  deliveredDetail: "At the hourly ckBTC rate",
  refunded: (amount: string) => `${amount} returned to your wallet`,
  refundedDetail:
    "The conversion could not be completed, so the ckBTC was sent back automatically.",
  // BtcDepositAddressCard
  addressDefaultLabel: "Bitcoin deposit address",
  addressCopiedToast: "Bitcoin address copied",
  addressCopyFailedToast: "Unable to copy the address",
  qrTitle: (address: string) => `QR code of the Bitcoin address ${address}`,
  copyAddressAria: (address: string) => `Copy Bitcoin address ${address}`,
  copied: "Copied",
  clickToCopy: "Click the address to copy it.",
  // BtcDepositProgress
  errValueTooSmall: (minimum: string) =>
    `Deposit too small: below the ${minimum} minimum. It was not converted.`,
  errTainted: "Deposit refused by the ckBTC minter.",
  errMinterUnavailable: "The ckBTC minter is unavailable. Check again later.",
  errOther: (server: string | undefined) =>
    server
      ? `The deposit could not be processed. ${server}`
      : "The deposit could not be processed.",
  notYet: "Not yet",
  finalWallet: "ckBTC in your wallet",
  finalRefunded: "Refunded in ckBTC",
  finalDelivered: "TTTI-T delivered",
  stepAddress: "Address shown",
  stepDetected: "Deposit detected",
  stepConfirmations: (count: string) => `Confirmations ${count}`,
  stepMinted: "ckBTC created",
  amountBtcDetected: "BTC detected",
  amountCkbtcCreated: "ckBTC created",
  amountCkbtcPending: "ckBTC pending",
  amountRefunded: "Refunded",
  amountTttiDelivered: "TTTI-T delivered",
  progressAria: "Bitcoin deposit progress",
  pendingRate:
    "Rate unavailable. The ckBTC is held until the next hourly rate.",
  lastChecked: (time: string) => `Last checked: ${time}`,
  checking: "Checking…",
  check: "Check",
  // Per-deposit tracking
  flowWallet: "BTC → ckBTC (wallet)",
  flowPurchase: "BTC → TTTI-T (purchase)",
  noDepositYet: "No deposit received on this address yet.",
  earlierDeposits: "Earlier deposits on this address",
  depositNumber: (n: string) => `Deposit ${n}`,
  detectedOn: (time: string) => `Detected ${time}`,
  stagePendingRate: "Waiting for the hourly rate",
  conversionCauseLine: (cause: string) => `Conversion status: ${cause}`,
  pendingDepositStatus: "Bitcoin deposit in progress.",
  pendingDepositLink: "View Bitcoin deposit",
  // Waiting state, completion summary and per-deposit errors
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `This deposit cannot be processed. ${server}`
      : "This deposit cannot be processed.",
  refundFailed: (amount: string) =>
    `The refund of the excess failed. ${amount} still held; the refund is retried automatically.`,
  waitingNewTransfer: "Waiting for a new transfer to this address.",
  depositFinished: (n: string, status: string) => `Deposit ${n}: ${status}.`,
  waitForNew: "Wait for a new transfer",
  otherDeposits: "Other deposits on this address",
  reuseWallet:
    "Send BTC to this address from any Bitcoin wallet. Each new transfer is converted to ckBTC automatically. The same address can be reused.",
  reusePurchase:
    "Send BTC to this address from any Bitcoin wallet. Each new transfer is converted and delivered as TTTI-T automatically. The same address can be reused.",
  waitingDepositStatus: "Bitcoin address waiting for a new transfer.",
  waitingDepositLink: "View Bitcoin address",
  // Automatic refund, held ckBTC and the conversion started by the Mint button
  refundCause: (cause: string) => `Cause: ${cause}`,
  refundPurposeFull: "Full amount returned",
  refundPurposeExcess: "Excess returned",
  refundPurposeDeliveryFailed: "Delivery failed, amount returned",
  refundSending: "The refund is being sent.",
  refundRetrying: "The refund is retried automatically.",
  refundTxLabel: "Refund transaction",
  heldNote: (amount: string) =>
    `${amount} held by the contract. Use the Mint button below to convert it now. If the conversion cannot complete, a refund to your wallet opens automatically.`,
  convertDelivered: (amount: string) => `${amount} TTTI-T delivered`,
  convertRefunded: (amount: string) => `${amount} returned to your wallet`,
  convertStillHeld: (amount: string) =>
    `${amount} still held by the contract. The conversion is retried automatically.`,
  convertNothing: "No ckBTC was waiting for conversion.",
  convertFailedTitle: "Conversion not completed",
  convertNothingTaken:
    "Nothing was taken: your funds stay with you or are returned to your wallet. You can click Mint again.",
  // DepositAlerts
  depositAlertDeliveredTitle: "Bitcoin deposit delivered",
  depositAlertDeliveredText: (amount: string) =>
    `${amount} received for your Bitcoin deposit.`,
  depositAlertRefundedTitle: "Bitcoin deposit refunded",
  depositAlertRefundedText: (amount: string) =>
    `${amount} returned to your wallet. The conversion could not be completed.`,
  depositAlertViewDeposit: "View deposit",
  depositAlertViewHistory: "View history",
};

export default en;
