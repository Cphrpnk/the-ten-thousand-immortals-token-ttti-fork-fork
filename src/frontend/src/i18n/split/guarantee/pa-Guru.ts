import type en from "./en";

const paGuru: typeof en = {
  title: "ਰਿਡੈਂਪਸ਼ਨ",
  ruleSummary: "1 TTTI-T ਵੱਧ ਤੋਂ ਵੱਧ 10,000 USD ਵਿੱਚ ਰਿਡੀਮ ਹੁੰਦਾ ਹੈ, ਬਿਨਾਂ ਕਿਸੇ ਫੀਸ ਦੇ।",
  rulePayout:
    "ਅਦਾ ਕੀਤੀ ਰਕਮ ਇਨ੍ਹਾਂ ਦੋਵਾਂ ਵਿੱਚੋਂ ਘੱਟ ਹੁੰਦੀ ਹੈ: 10,000 USD × x, ਅਤੇ ਰਿਜ਼ਰਵ ÷ ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T × x, ਜਿੱਥੇ x ਰਿਡੀਮ ਕੀਤੇ TTTI-T ਹਨ।",
  rulePayment:
    "ਰਕਮ ਰਿਜ਼ਰਵ ਦੀ ਬਣਤਰ ਦੇ ਅਨੁਪਾਤ ਵਿੱਚ ICP, ckBTC, ckUSDC ਅਤੇ ckUSDT ਵਿੱਚ ਅਦਾ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਇੱਕ ਰਿਡੈਂਪਸ਼ਨ ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋ ਸਕਦੀ।",
  ruleAnyHolder:
    "ਰਿਜ਼ਰਵ ਸਾਰੇ ਧਾਰਕਾਂ ਲਈ ਸਾਂਝਾ ਹੈ। ਕੋਈ ਵੀ ਧਾਰਕ ਰਿਡੀਮ ਕਰ ਸਕਦਾ ਹੈ, ਉਹ ਵੀ ਜਿਸਨੇ ਕਦੇ ਮਿੰਟ ਨਹੀਂ ਕੀਤਾ।",
  ruleMintLock:
    "ਮਿੰਟ ਸਮੇਂ, TTTI-T ਦਾ ਇੱਕ ਬਦਲਦਾ ਹਿੱਸਾ m ਪੂਲ ਵਿੱਚ ਪਾਇਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਮਿੰਟ ਕਰਨ ਵਾਲੇ ਦੇ ਨਾਮ 'ਤੇ ਲਾਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਰਿਲੇ ਇਸਨੂੰ ਵੱਧ ਤੋਂ ਵੱਧ 3 ਮਹੀਨਿਆਂ ਬਾਅਦ ਜਾਰੀ ਕਰਦਾ ਹੈ।",
  ruleMintChoice:
    "ਭੁਗਤਾਨ ਤੋਂ ਪਹਿਲਾਂ, ਮਿੰਟ ਕਰਨ ਵਾਲਾ ਬਾਕੀ ਹਿੱਸਾ (1 − m) ਪੂਲ ਵਿੱਚ ਪਾਉਣ (ਵਿਕਲਪ A) ਜਾਂ ਵਾਲੇਟ ਵਿੱਚ ਰੱਖਣ (ਵਿਕਲਪ B) ਦੀ ਚੋਣ ਕਰਦਾ ਹੈ।",
  ruleMintReserve:
    "ਚੋਣ ਜੋ ਵੀ ਹੋਵੇ, ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਨੂੰ ਹਰ ਮਿੰਟ ਕੀਤੇ TTTI-T ਪਿੱਛੇ 10,000 USD ਮਿਲਦੇ ਹਨ। ਇਹ USD ਵਿੱਚ ਗਿਣੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਅਦਾ ਕੀਤੇ ਟੋਕਨ (ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT) ਵਿੱਚ ਬਿਨਾਂ ਤਬਦੀਲੀ ਦੇ ਰੱਖੀ ਜਾਂਦੀ ਹੈ।",
  redeemHeldNote:
    "ਰੱਖਿਆ ਹੋਇਆ ਕੋਈ ਵੀ TTTI-T ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਤੋਂ ਵੱਧ ਤੋਂ ਵੱਧ 10,000 USD ਵਿੱਚ ਰਿਡੀਮ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ, ਵਿਕਲਪ B ਅਧੀਨ ਵਾਲੇਟ ਵਿੱਚ ਰੱਖਿਆ TTTI-T ਵੀ ਸ਼ਾਮਲ।",
  signInPrompt: "TTTI-T ਰਿਡੀਮ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
  loadError: "ਤੁਹਾਡੇ ਰਿਡੈਂਪਸ਼ਨ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
  retryButton: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  reserveTitle: "ਰਿਜ਼ਰਵ",
  reserveLoading: "ਰਿਜ਼ਰਵ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
  reserveLoadError: "ਰਿਜ਼ਰਵ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ।",
  reserveTotalLabel: "ਰਿਜ਼ਰਵ (USD)",
  reserveTokenLabel: (symbol: string) => `${symbol} ਵਿੱਚ ਰਿਜ਼ਰਵ`,
  circulationLabel: "ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T",
  reservePerTtiLabel: "ਪ੍ਰਤੀ TTTI-T ਰਿਜ਼ਰਵ",
  reservePerTtttiNone: "ਕੋਈ TTTI-T ਚੱਲ ਨਹੀਂ ਰਿਹਾ",
  requiredLabel: "ਲੋੜੀਂਦਾ (10,000 USD × ਚਲਦੇ TTTI-T)",
  invariantLabel: "ਸਥਿਰ ਸ਼ਰਤ",
  invariantHolds: "ਰਿਜ਼ਰਵ ਲੋੜੀਂਦੀ ਰਕਮ ਦੇ ਬਰਾਬਰ ਜਾਂ ਵੱਧ ਹੈ",
  invariantBroken: "ਰਿਜ਼ਰਵ ਲੋੜੀਂਦੀ ਰਕਮ ਤੋਂ ਘੱਟ ਹੈ",
  shortfallLabel: "ਘਾਟ",
  shortfallNone: "ਕੋਈ ਨਹੀਂ",
  reserveRateMissing: (symbol: string) => `${symbol} ਲਈ ਕੋਈ ਦਰ ਨਹੀਂ`,
  redeemTitle: "ਰਿਡੀਮ ਕਰੋ",
  redeemIntro:
    "ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਦੇ ਵਿਰੁੱਧ TTTI-T ਵਾਪਸ ਕਰੋ। ਪੂਰਵ-ਦਰਸ਼ਨ ਕੋਈ ਵੀ ਦਸਤਖਤ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਮਿਲਣ ਵਾਲੀ ਸਹੀ ਰਕਮ ਦਿਖਾਉਂਦਾ ਹੈ।",
  amountLabel: "ਰਿਡੀਮ ਕਰਨ ਲਈ TTTI-T",
  amountPlaceholder: "0.0",
  maxButton: "ਵੱਧ ਤੋਂ ਵੱਧ",
  amountInvalid: "ਸਿਫ਼ਰ ਤੋਂ ਵੱਡੀ ਰਕਮ ਦਰਜ ਕਰੋ।",
  redeemButton: "ਰਿਡੀਮ ਕਰੋ",
  redeemingButton: "ਰਿਡੀਮ ਹੋ ਰਿਹਾ ਹੈ…",
  previewTitle: "ਪੂਰਵ-ਦਰਸ਼ਨ",
  previewLoading: "ਗਣਨਾ ਹੋ ਰਹੀ ਹੈ…",
  previewCap: "10,000 USD × x",
  previewReserveShare: "ਰਿਜ਼ਰਵ ÷ ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚਲਤ ਮਾਤਰਾ × x",
  previewPaidIn: (symbol: string) => `${symbol} ਵਿੱਚ ਭੁਗਤਾਨ`,
  previewCirculation: "ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T",
  previewNet: "ਤੁਹਾਨੂੰ ਮਿਲੇਗਾ (ਦੋਵਾਂ ਵਿੱਚੋਂ ਘੱਟ)",
  previewUsdNote: "USD ਮੁੱਲ ਇਸ ਪੂਰਵ-ਦਰਸ਼ਨ ਦੀ ਦਰ ਵਰਤਦੇ ਹਨ।",
  previewLedgerFeeNote: "ਭੁਗਤਾਨ ਦੀਆਂ ਲੈਜਰ ਫੀਸਾਂ ਮਿਲਣ ਵਾਲੀ ਰਕਮ ਵਿੱਚੋਂ ਨਹੀਂ ਕੱਟੀਆਂ ਜਾਂਦੀਆਂ।",
  returnedTttiNote:
    "ਵਾਪਸ ਕੀਤੇ TTTI-T ਕੰਟਰੈਕਟ ਕੋਲ ਰਹਿੰਦੇ ਹਨ ਅਤੇ ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਦੀ ਚਲਤ ਮਾਤਰਾ ਤੋਂ ਨਿਕਲ ਜਾਂਦੇ ਹਨ। ਕੁਝ ਵੀ ਸਾੜਿਆ ਨਹੀਂ ਜਾਂਦਾ।",
  allowanceTitle: "TTTI-T ਮਨਜ਼ੂਰੀ",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `TTTI-T ਵਾਪਸ ਕਰਨ ਲਈ ਵਾਪਸ ਕੀਤੀ ਰਕਮ ਅਤੇ TTTI-T ਲੈਜਰ ਫੀਸ ਜੋੜ ਕੇ ਇੱਕ ICRC-2 ਮਨਜ਼ੂਰੀ ਲੋੜੀਂਦੀ ਹੈ: ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) => `ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ: ${allowance}`,
  allowanceOk: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ ਇਸ ਰਿਡੈਂਪਸ਼ਨ ਨੂੰ ਕਵਰ ਕਰਦੀ ਹੈ।",
  allowanceMissing: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰੀ ਕਾਫ਼ੀ ਨਹੀਂ ਹੈ। ਇਹ ਰਿਡੈਂਪਸ਼ਨ ਤੋਂ ਪਹਿਲਾਂ ਮੰਗੀ ਜਾਂਦੀ ਹੈ।",
  approvingButton: "ਮਨਜ਼ੂਰ ਹੋ ਰਿਹਾ ਹੈ…",
  allowanceExpiryNote:
    "ਮਨਜ਼ੂਰੀ ਦੀ ਹਮੇਸ਼ਾ ਮਿਆਦ ਹੁੰਦੀ ਹੈ। ਪੁਸ਼ਟੀ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਵਾਲੇਟ ਵਿੱਚ ਰਕਮ ਅਤੇ ਤਾਰੀਖ਼ ਦੀ ਜਾਂਚ ਕਰੋ।",
  historyTitle: "ਮੇਰੇ ਰਿਡੈਂਪਸ਼ਨ",
  historyEmpty: "ਅਜੇ ਕੋਈ ਰਿਡੈਂਪਸ਼ਨ ਨਹੀਂ।",
  statusCompleted: "ਪੂਰਾ ਹੋਇਆ",
  statusInProgress: "ਜਾਰੀ ਹੈ",
  statusNeedsReview: "ਜਾਂਚ ਲਈ",
  statusFailed: "ਅਸਫਲ",
  historyReturned: "ਵਾਪਸ ਕੀਤੇ TTTI-T",
  historyNet: "ਪ੍ਰਾਪਤ",
  historyPullBlock: "TTTI-T ਬਲਾਕ",
  historyPayoutBlock: "ਭੁਗਤਾਨ ਬਲਾਕ",
  resultCompleted: (net: string) => `ਪੂਰਾ ਹੋਇਆ। ਤੁਹਾਨੂੰ ${net} ਮਿਲਿਆ।`,
  resultInProgress: "ਭੁਗਤਾਨ ਜਾਰੀ ਹੈ। ਪੂਰਾ ਹੋਣ 'ਤੇ ਇਹ ਹੇਠਾਂ ਸੂਚੀ ਵਿੱਚ ਦਿਖਾਈ ਦੇਵੇਗਾ।",
  resultNeedsReview:
    "ਭੁਗਤਾਨ ਦੀ ਜਾਂਚ ਲੋੜੀਂਦੀ ਹੈ। ਇਹ ਆਪਣੀ ਸਥਿਤੀ ਸਮੇਤ ਹੇਠਾਂ ਸੂਚੀ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ।",
  resultFailed: "ਭੁਗਤਾਨ ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ।",
  errAnonymous: "ਰਿਡੀਮ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।",
  errSalesPaused: "ਰਿਡੈਂਪਸ਼ਨ ਰੋਕੇ ਗਏ ਹਨ।",
  errAmountTooSmall: "ਰਕਮ ਇੰਨੀ ਛੋਟੀ ਹੈ ਕਿ ਅਦਾ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕਦੀ। ਰਿਡੈਂਪਸ਼ਨ ਸੰਭਵ ਨਹੀਂ।",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `ਰਕਮ ${requested} ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T ${circulation} ਤੋਂ ਵੱਧ ਹੈ।`,
  errReserveEmpty: "ਰਿਜ਼ਰਵ ਖਾਲੀ ਹੈ। ਰਿਡੈਂਪਸ਼ਨ ਸੰਭਵ ਨਹੀਂ।",
  errRateUnavailable: (symbol: string) =>
    `ਇਸ ਸਮੇਂ ${symbol} ਲਈ ਕੋਈ ਦਰ ਉਪਲਬਧ ਨਹੀਂ। ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `ਰਕਮ ਭੁਗਤਾਨ ਦੀ ${symbol} ਲੈਜਰ ਫੀਸ (${fee}) ਪੂਰੀ ਨਹੀਂ ਕਰਦੀ। ਰਿਡੈਂਪਸ਼ਨ ਸੰਭਵ ਨਹੀਂ।`,
  errTttiBalance: (balance: string, required: string) =>
    `TTTI-T ਬਕਾਇਆ ${balance} ਹੈ; ${required} ਲੋੜੀਂਦਾ ਹੈ।`,
  errAllowance: (allowance: string, required: string) =>
    `TTTI-T ਮਨਜ਼ੂਰੀ ${allowance} ਹੈ; ${required} ਲੋੜੀਂਦੀ ਹੈ।`,
  errSlippage: (payout: string, expected: string) =>
    `ਮਿਲਣ ਵਾਲੀ ਰਕਮ ${payout} ਹੋਵੇਗੀ, ਜੋ ਪੂਰਵ-ਦਰਸ਼ਨ ਵਿੱਚ ਦਿਖਾਈ ${expected} ਤੋਂ ਘੱਟ ਹੈ। ਪੂਰਵ-ਦਰਸ਼ਨ ਤਾਜ਼ਾ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`,
  errRedemptionInProgress: "ਇੱਕ ਰਿਡੈਂਪਸ਼ਨ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ।",
  errNothingToConvert: "ਇਸ ਕਾਰਵਾਈ ਲਈ ਬਦਲਣ ਲਈ ਕੁਝ ਨਹੀਂ ਹੈ।",
  errConversionFailed: (detail: string) => `ਤਬਦੀਲੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
  errPullFailed: (detail: string) => `TTTI-T ਲਏ ਨਹੀਂ ਜਾ ਸਕੇ: ${detail}`,
  errCallFailed: (detail: string) => `ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ: ${detail}`,
  errInvalidAmount: "ਵੈਧ ਰਕਮ ਦਰਜ ਕਰੋ।",
  errAcknowledgementRequired:
    "ਰਿਡੀਮ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਵਾਲੇਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਮੰਨਣੀਆਂ ਲਾਜ਼ਮੀ ਹਨ। ਮਨਜ਼ੂਰੀ ਵਾਲਾ ਪੜਾਅ ਖੋਲ੍ਹੋ, ਸ਼ਰਤਾਂ ਮੰਨੋ ਅਤੇ ਫਿਰ ਮੁੜ ਰਿਡੀਮ ਕਰੋ।",
  acceptanceChecking: "ਵਾਲੇਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ…",
  acceptanceMissing:
    "ਇਸ ਖਾਤੇ ਲਈ ਵਾਲੇਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਮੰਨੀਆਂ ਨਹੀਂ ਗਈਆਂ। ਰਿਡੀਮ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਇਹ ਮੰਨਣੀਆਂ ਲਾਜ਼ਮੀ ਹਨ।",
  openAcceptanceButton: "ਵਾਲਿਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਵੇਖੋ ਅਤੇ ਮਨਜ਼ੂਰ ਕਰੋ",
  percentShare: "ਛੁਡਾਉਣਯੋਗ ਰਕਮ ਦਾ ਹਿੱਸਾ",
  percentComputedOn:
    "ਛੁਡਾਉਣਯੋਗ ਰਕਮ ਉੱਤੇ ਗਿਣਿਆ: ਰੱਖੇ TTTI-T ਅਤੇ ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T ਵਿੱਚੋਂ ਘੱਟ।",
  balanceNone: "ਇਸ ਵਾਲਿਟ ਵਿੱਚ ਰਿਡੀਮ ਕਰਨ ਲਈ ਕੋਈ TTTI-T ਨਹੀਂ ਹੈ।",
  heldLabel: "ਰੱਖੇ TTTI-T",
  limitedByBalance: (held: string, max: string) =>
    `ਰੱਖੇ TTTI-T (${held}) ਰਕਮ ਨੂੰ ${max} ਤੱਕ ਸੀਮਤ ਕਰਦੇ ਹਨ।`,
  limitedByCirculation: (circulation: string, max: string) =>
    `ਕੰਟਰੈਕਟ ਤੋਂ ਬਾਹਰ ਚੱਲ ਰਹੇ TTTI-T (${circulation}) ਰਕਮ ਨੂੰ ${max} ਤੱਕ ਸੀਮਤ ਕਰਦੇ ਹਨ।`,
  confirmTitle: "ਰਿਡੈਂਪਸ਼ਨ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
  confirmIntro:
    "ਤੁਸੀਂ ਕੰਟਰੈਕਟ ਲਈ TTTI-T ਦੀ ICRC-2 ਮਨਜ਼ੂਰੀ ਉੱਤੇ ਦਸਤਖ਼ਤ ਕਰਦੇ ਹੋ; ਫਿਰ ਕੰਟਰੈਕਟ TTTI-T ਲੈਂਦਾ ਹੈ ਅਤੇ ਦਿਖਾਈ ਗਈ ਰਕਮ ਰਿਜ਼ਰਵ ਦੇ ਟੋਕਨਾਂ (ICP, ckBTC, ckUSDC ਅਤੇ ckUSDT) ਵਿੱਚ ਅਦਾ ਕਰਦਾ ਹੈ।",
  confirmExpiry: "ਮਨਜ਼ੂਰੀ 15 ਮਿੰਟ ਵਿੱਚ ਖ਼ਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।",
  closeButton: "ਬੰਦ ਕਰੋ",
  cancelButton: "ਰੱਦ ਕਰੋ",
  resultTitle: "ਨਤੀਜਾ",
};

export default paGuru;
