import type en from "./en";

const paGuru: typeof en = {
  fallbackMessage:
    "ਇਸ ਮੰਜ਼ਿਲ ਲਈ ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋ ਸਕੀ। ਪ੍ਰਾਪਤਕਰਤਾ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  server: (server: string) => server,
  reference: (id: string) => ` ਹਵਾਲਾ: ਖਰੀਦ #${id}।`,
  contactTeam: " ਇਸ ਹਵਾਲੇ ਨਾਲ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
  refundedTitle: (symbol: string, fee: string) =>
    `ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ — ਤੁਹਾਡਾ ${symbol} ${fee} ਫੀਸ ਘਟਾ ਕੇ ਵਾਪਸ ਕਰ ਦਿੱਤਾ ਗਿਆ`,
  refundFailed: "ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ ਅਤੇ ਆਟੋਮੈਟਿਕ ਰਿਫੰਡ ਵੀ ਅਸਫਲ ਰਿਹਾ",
  refundedMessage: () =>
    "TTTI-T ਦੀ ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ; ਭੁਗਤਾਨ ledger ਫੀਸ ਘਟਾ ਕੇ ਵਾਪਸ ਕਰ ਦਿੱਤਾ ਗਿਆ।",
  refundFailedMessage: () =>
    "TTTI-T ਦੀ ਡਿਲੀਵਰੀ ਅਸਫਲ ਰਹੀ ਅਤੇ ਰਿਫੰਡ ਵੀ ਅਸਫਲ ਰਿਹਾ; ਇਸ ਖਰੀਦ ਲਈ ਹੱਥੀਂ ਪੈਰਵੀ ਦੀ ਲੋੜ ਹੈ।",
  salesPausedTitle: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
  salesPausedMessage: () => "ਖਰੀਦਾਂ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਬੰਦ ਹਨ।",
  saleCompleteTitle: "ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ",
  saleCompleteMessage: () =>
    "TTTI-T ਦੀ ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ: ਵੇਚਣ ਲਈ ਕੋਈ TTTI-T ਬਾਕੀ ਨਹੀਂ ਹੈ।",
  belowMinimumTitle: "ਘੱਟੋ-ਘੱਟ ਖਰੀਦ ਤੋਂ ਘੱਟ",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `ਘੱਟੋ-ਘੱਟ ${minimum} ${display} (${symbol} ਵਿੱਚ ${minimumUsd}) ਹੈ; ਤੁਸੀਂ ${requested} ${display} ਦੀ ਬੇਨਤੀ ਕੀਤੀ।`,
  aboveRemainingTitle: "ਬਾਕੀ ਰਕਮ ਤੋਂ ਵੱਧ",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `ਵੱਧ ਤੋਂ ਵੱਧ ਉਪਲਬਧ ${maximum} ${display} (${maximumPay}) ਹੈ; ਤੁਸੀਂ ${requested} ${display} ਦੀ ਬੇਨਤੀ ਕੀਤੀ।`,
  priceUnavailableTitle: (symbol: string) =>
    `ਖਰੀਦ ਅਸਵੀਕਾਰ: ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਿਰਧਾਰਤ ਨਹੀਂ ਹੈ`,
  priceUnavailableMessage: (symbol: string) =>
    `ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ। ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
  notConfiguredTitle: (symbol: string) => `${symbol} ਸੰਰਚਿਤ ਨਹੀਂ ਹੈ`,
  notConfiguredMessage: (symbol: string) =>
    `ਵਿਕਰੀ ਅਜੇ ਸੰਰਚਿਤ ਨਹੀਂ ਹੈ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
  ledgerMismatchTitle: (symbol: string) => `${symbol} ledger ਬੇਮੇਲ`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `${symbol} ledger ${actualDecimals} ਦਸ਼ਮਲਵ ਅੰਕ ਅਤੇ ${actualFee} ਦੀ ਫੀਸ ਦੱਸਦਾ ਹੈ; ਉਮੀਦ ${expectedDecimals} ਦਸ਼ਮਲਵ ਅੰਕ ਅਤੇ ${expectedFee} ਸੀ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
  ackRequiredTitle: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਲੋੜੀਂਦੀਆਂ ਹਨ",
  ackRequiredMessage: (symbol: string) =>
    `ਇਸ ਖਾਤੇ ਨੇ ਛੇ ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤੀਆਂ। ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
  invalidAmountTitle: "ਅਵੈਧ ਰਕਮ",
  invalidAmountMessage: () =>
    "ਇਹ ਰਕਮ ਜਾਂ ਇਹ ਡਿਲੀਵਰੀ ਖਾਤਾ ਸਵੀਕਾਰ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ। ਕੁਝ ਵੀ ਨਹੀਂ ਲਿਆ ਗਿਆ।",
  insufficientTitle: (symbol: string) => `${symbol} ਬਕਾਇਆ ਨਾਕਾਫ਼ੀ`,
  insufficientMessage: (_server: string, balance: string) =>
    `ਬਕਾਇਆ ਇਸ ਖਰੀਦ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ। ਬਕਾਇਆ: ${balance}।`,
  approvalMissingTitle: (symbol: string) => `${symbol} ਮਨਜ਼ੂਰੀ ਮੌਜੂਦ ਨਹੀਂ`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸੀਮਾ ਇਸ ਖਰੀਦ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦੀ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ਸੀਮਾ: ${allowance}।`,
  inProgressTitle: "ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ",
  inProgressMessage: (symbol: string) =>
    `ਇਸ ਖਾਤੇ ਲਈ ਇੱਕ ਖਰੀਦ ਪਹਿਲਾਂ ਹੀ ਜਾਰੀ ਹੈ। ਇਸਦੇ ਪੂਰਾ ਹੋਣ ਦੀ ਉਡੀਕ ਕਰੋ, ਫਿਰ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ। ਇਸ ਬੇਨਤੀ ਲਈ ਕੋਈ ${symbol} ਨਹੀਂ ਲਿਆ ਗਿਆ।`,
  ledgerErrorTitle: (symbol: string) => `${symbol} ledger ਗੜਬੜ`,
  ledgerErrorMessage: () =>
    "ledger ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ ਜਾਂ ਕਾਰਵਾਈ ਅਸਫਲ ਰਹੀ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  signInTitle: "ਮਿੰਟ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
  signInMessage: () => "TTTI-T ਮਿੰਟ ਕਰਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਸਾਈਨ ਇਨ ਕਰੋ।",
  notCompletedTitle: "ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋਈ",
  failedTitle: "ਖਰੀਦ ਅਸਫਲ ਰਹੀ",
};

export default paGuru;
