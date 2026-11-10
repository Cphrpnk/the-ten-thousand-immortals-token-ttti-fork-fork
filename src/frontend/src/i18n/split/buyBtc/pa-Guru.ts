import type en from "./en";

const paGuru: typeof en = {
  requestFailed: "ਬੇਨਤੀ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  errorTitle: "Bitcoin ਖਰੀਦ",
  intro:
    "ਆਪਣੇ ਖੁਦ ਦੇ Bitcoin ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਇਹ ckBTC ਬਣ ਜਾਂਦਾ ਹੈ, ਫਿਰ ਘੰਟਾਵਾਰ ਦਰ 'ਤੇ TTTI-T। ਰਕਮ ਦਾ 1 % ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ।",
  recordingAcks: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦਰਜ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ…",
  creatingAddress: "ਪਤਾ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
  getAddress: "ਮੇਰਾ Bitcoin ਪਤਾ ਪ੍ਰਾਪਤ ਕਰੋ",
  tickAll: "ਆਪਣਾ ਪਤਾ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਾਰੇ ਛੇ ਕਥਨਾਂ 'ਤੇ ਨਿਸ਼ਾਨ ਲਗਾਓ।",
  purchaseAddressLabel: "ਤੁਹਾਡਾ Bitcoin ਖਰੀਦ ਪਤਾ",
  sentToDelivery: "TTTI-T ਹੇਠਾਂ ਦਿੱਤੇ ਤੁਹਾਡੇ ਡਿਲੀਵਰੀ ਪਤੇ 'ਤੇ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।",
  keepPageOpen:
    "ਜਦੋਂ ਤੱਕ ਤੁਹਾਡੀ ਜਮ੍ਹਾਂ ਰਕਮ ਦਾ ਪਤਾ ਨਹੀਂ ਲੱਗ ਜਾਂਦਾ, ਇਸ ਪੰਨੇ ਨੂੰ ਖੁੱਲ੍ਹਾ ਰੱਖੋ। ਜੇਕਰ ਤੁਸੀਂ ਚਲੇ ਜਾਂਦੇ ਹੋ, ਤਾਂ ਤੁਹਾਡੀ ਖਰੀਦ ਉਦੋਂ ਪੂਰੀ ਹੋਵੇਗੀ ਜਦੋਂ ਤੁਸੀਂ ਇਸ ਪੰਨੇ 'ਤੇ ਵਾਪਸ ਆਓਗੇ, ਉਸ ਸਮੇਂ ਦੀ ਵਟਾਂਦਰਾ ਦਰ 'ਤੇ। ਜੇਕਰ ਉਦੋਂ ਤੱਕ ਵਿਕਰੀ ਖਤਮ ਹੋ ਚੁੱਕੀ ਹੈ, ਤਾਂ ਤੁਹਾਨੂੰ ckBTC ਵਿੱਚ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਜਾਵੇਗੀ।",
  delivered: (amount: string) => `${amount} TTTI-T ਡਿਲੀਵਰ ਕੀਤੇ ਗਏ`,
  deliveredDetail: "ਘੰਟਾਵਾਰ ckBTC ਦਰ 'ਤੇ",
  refunded: (amount: string) => `${amount} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਭੇਜੇ ਗਏ`,
  refundedDetail: "ਤਬਦੀਲੀ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ, ਇਸ ਲਈ ckBTC ਆਪਣੇ-ਆਪ ਵਾਪਸ ਭੇਜ ਦਿੱਤਾ ਗਿਆ।",
  addressDefaultLabel: "Bitcoin ਜਮ੍ਹਾਂ ਪਤਾ",
  addressCopiedToast: "Bitcoin ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
  addressCopyFailedToast: "ਪਤਾ ਕਾਪੀ ਨਹੀਂ ਹੋ ਸਕਿਆ",
  qrTitle: (address: string) => `Bitcoin ਪਤੇ ${address} ਦਾ QR ਕੋਡ`,
  copyAddressAria: (address: string) => `Bitcoin ਪਤਾ ${address} ਕਾਪੀ ਕਰੋ`,
  copied: "ਕਾਪੀ ਹੋ ਗਿਆ",
  clickToCopy: "ਪਤਾ ਕਾਪੀ ਕਰਨ ਲਈ ਇਸ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
  errValueTooSmall: (minimum: string) =>
    `ਜਮ੍ਹਾਂ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ: ${minimum} ਦੀ ਘੱਟੋ-ਘੱਟ ਸੀਮਾ ਤੋਂ ਘੱਟ। ਇਸਨੂੰ ਬਦਲਿਆ ਨਹੀਂ ਗਿਆ।`,
  errTainted: "ckBTC minter ਨੇ ਜਮ੍ਹਾਂ ਰਕਮ ਅਸਵੀਕਾਰ ਕਰ ਦਿੱਤੀ।",
  errMinterUnavailable: "ckBTC minter ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਬਾਅਦ ਵਿੱਚ ਮੁੜ ਜਾਂਚ ਕਰੋ।",
  errOther: (server: string | undefined) =>
    server
      ? `ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਹੋ ਸਕੀ। ${server}`
      : "ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਹੋ ਸਕੀ।",
  notYet: "ਅਜੇ ਨਹੀਂ",
  finalWallet: "ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ckBTC",
  finalRefunded: "ckBTC ਵਿੱਚ ਵਾਪਸ ਕੀਤਾ ਗਿਆ",
  finalDelivered: "TTTI-T ਡਿਲੀਵਰ ਕੀਤਾ ਗਿਆ",
  stepAddress: "ਪਤਾ ਦਿਖਾਇਆ ਗਿਆ",
  stepDetected: "ਜਮ੍ਹਾਂ ਰਕਮ ਮਿਲੀ",
  stepConfirmations: (count: string) => `ਪੁਸ਼ਟੀਆਂ ${count}`,
  stepMinted: "ckBTC ਬਣਾਇਆ ਗਿਆ",
  amountBtcDetected: "ਮਿਲਿਆ BTC",
  amountCkbtcCreated: "ਬਣਾਇਆ ਗਿਆ ckBTC",
  amountCkbtcPending: "ਲੰਬਿਤ ckBTC",
  amountRefunded: "ਵਾਪਸ ਕੀਤਾ ਗਿਆ",
  amountTttiDelivered: "ਡਿਲੀਵਰ ਕੀਤਾ TTTI-T",
  progressAria: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਗਤੀ",
  pendingRate: "ਦਰ ਉਪਲਬਧ ਨਹੀਂ। ckBTC ਅਗਲੀ ਘੰਟਾਵਾਰ ਦਰ ਤੱਕ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।",
  lastChecked: (time: string) => `ਆਖਰੀ ਜਾਂਚ: ${time}`,
  checking: "ਜਾਂਚ ਜਾਰੀ ਹੈ…",
  check: "ਜਾਂਚ ਕਰੋ",
  flowWallet: "BTC → ckBTC (ਵਾਲਿਟ)",
  flowPurchase: "BTC → TTTI-T (ਖਰੀਦ)",
  noDepositYet: "ਇਸ ਪਤੇ 'ਤੇ ਅਜੇ ਕੋਈ ਜਮ੍ਹਾਂ ਰਕਮ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋਈ।",
  earlierDeposits: "ਇਸ ਪਤੇ 'ਤੇ ਪਿਛਲੀਆਂ ਜਮ੍ਹਾਂ ਰਕਮਾਂ",
  depositNumber: (n: string) => `ਜਮ੍ਹਾਂ ਰਕਮ ${n}`,
  detectedOn: (time: string) => `ਮਿਲੀ: ${time}`,
  stagePendingRate: "ਘੰਟਾਵਾਰ ਦਰ ਦੀ ਉਡੀਕ",
  conversionCauseLine: (cause: string) => `ਤਬਦੀਲੀ ਦੀ ਸਥਿਤੀ: ${cause}`,
  pendingDepositStatus: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਜਾਰੀ ਹੈ।",
  pendingDepositLink: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਵੇਖੋ",
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `ਇਸ ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ${server}`
      : "ਇਸ ਜਮ੍ਹਾਂ ਰਕਮ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ।",
  refundFailed: (amount: string) =>
    `ਵਾਧੂ ਰਕਮ ਦੀ ਵਾਪਸੀ ਅਸਫਲ ਰਹੀ। ${amount} ਅਜੇ ਵੀ ਰੱਖੇ ਹੋਏ ਹਨ; ਵਾਪਸੀ ਦੀ ਆਪਣੇ ਆਪ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।`,
  waitingNewTransfer: "ਇਸ ਪਤੇ 'ਤੇ ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਹੋ ਰਹੀ ਹੈ।",
  depositFinished: (n: string, status: string) => `ਜਮ੍ਹਾਂ ਰਕਮ ${n}: ${status}।`,
  waitForNew: "ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਕਰੋ",
  otherDeposits: "ਇਸ ਪਤੇ 'ਤੇ ਹੋਰ ਜਮ੍ਹਾਂ ਰਕਮਾਂ",
  reuseWallet:
    "ਕਿਸੇ ਵੀ Bitcoin ਵਾਲਿਟ ਤੋਂ ਇਸ ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਹਰ ਨਵਾਂ ਟ੍ਰਾਂਸਫਰ ਆਪਣੇ ਆਪ ckBTC ਵਿੱਚ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ। ਇਹੀ ਪਤਾ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
  reusePurchase:
    "ਕਿਸੇ ਵੀ Bitcoin ਵਾਲਿਟ ਤੋਂ ਇਸ ਪਤੇ 'ਤੇ BTC ਭੇਜੋ। ਹਰ ਨਵਾਂ ਟ੍ਰਾਂਸਫਰ ਆਪਣੇ ਆਪ ਬਦਲਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ TTTI-T ਵਜੋਂ ਪਹੁੰਚਾਇਆ ਜਾਂਦਾ ਹੈ। ਇਹੀ ਪਤਾ ਦੁਬਾਰਾ ਵਰਤਿਆ ਜਾ ਸਕਦਾ ਹੈ।",
  waitingDepositStatus: "Bitcoin ਪਤਾ ਨਵੇਂ ਟ੍ਰਾਂਸਫਰ ਦੀ ਉਡੀਕ ਕਰ ਰਿਹਾ ਹੈ।",
  waitingDepositLink: "Bitcoin ਪਤਾ ਵੇਖੋ",
  refundCause: (cause: string) => `ਕਾਰਨ: ${cause}`,
  refundPurposeFull: "ਪੂਰੀ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਗਈ",
  refundPurposeExcess: "ਵਾਧੂ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਗਈ",
  refundPurposeDeliveryFailed: "ਡਿਲੀਵਰੀ ਅਸਫਲ, ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਗਈ",
  refundSending: "ਰਿਫੰਡ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ।",
  refundRetrying: "ਰਿਫੰਡ ਆਪਣੇ-ਆਪ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
  refundTxLabel: "ਰਿਫੰਡ ਲੈਣ-ਦੇਣ",
  heldNote: (amount: string) =>
    `${amount} ਕੰਟਰੈਕਟ ਕੋਲ ਹੈ। ਇਸਨੂੰ ਹੁਣੇ ਬਦਲਣ ਲਈ ਹੇਠਾਂ ਦਿੱਤਾ Mint ਬਟਨ ਵਰਤੋ। ਜੇ ਤਬਦੀਲੀ ਪੂਰੀ ਨਾ ਹੋ ਸਕੇ, ਤਾਂ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਿਫੰਡ ਆਪਣੇ-ਆਪ ਖੁੱਲ੍ਹ ਜਾਂਦਾ ਹੈ।`,
  convertDelivered: (amount: string) => `${amount} TTTI-T ਪਹੁੰਚਾਏ ਗਏ`,
  convertRefunded: (amount: string) => `${amount} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਭੇਜੇ ਗਏ`,
  convertStillHeld: (amount: string) =>
    `${amount} ਹਾਲੇ ਵੀ ਕੰਟਰੈਕਟ ਕੋਲ ਹੈ। ਤਬਦੀਲੀ ਆਪਣੇ-ਆਪ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।`,
  convertNothing: "ਤਬਦੀਲੀ ਦੀ ਉਡੀਕ ਵਿੱਚ ਕੋਈ ckBTC ਨਹੀਂ ਸੀ।",
  convertFailedTitle: "ਤਬਦੀਲੀ ਪੂਰੀ ਨਹੀਂ ਹੋਈ",
  convertNothingTaken:
    "ਕੁਝ ਵੀ ਨਹੀਂ ਕੱਟਿਆ ਗਿਆ: ਤੁਹਾਡੇ ਫੰਡ ਤੁਹਾਡੇ ਕੋਲ ਰਹਿੰਦੇ ਹਨ ਜਾਂ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਭੇਜ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ। ਤੁਸੀਂ ਦੁਬਾਰਾ Mint ਤੇ ਕਲਿੱਕ ਕਰ ਸਕਦੇ ਹੋ।",
  depositAlertDeliveredTitle: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਡਿਲੀਵਰ ਹੋਈ",
  depositAlertDeliveredText: (amount: string) =>
    `ਤੁਹਾਡੀ Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਲਈ ${amount} ਪ੍ਰਾਪਤ ਹੋਏ।`,
  depositAlertRefundedTitle: "Bitcoin ਜਮ੍ਹਾਂ ਰਕਮ ਵਾਪਸ ਕੀਤੀ ਗਈ",
  depositAlertRefundedText: (amount: string) =>
    `${amount} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਵਾਪਸ ਭੇਜੇ ਗਏ। ਤਬਦੀਲੀ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ।`,
  depositAlertViewDeposit: "ਜਮ੍ਹਾਂ ਰਕਮ ਵੇਖੋ",
  depositAlertViewHistory: "ਇਤਿਹਾਸ ਵੇਖੋ",
};

export default paGuru;
