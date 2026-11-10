import type en from "./en";

const paGuru: typeof en = {
  getIcpAria: "ICP ਸ਼ਾਮਲ ਕਰੋ",
  getIcpAdd: "ਸ਼ਾਮਲ ਕਰੋ",
  getIcpAddToBuy: "ਮਿੰਟ ਕਰਨ ਲਈ ICP ਸ਼ਾਮਲ ਕਰੋ",
  getIcpBuyAria:
    "Onramper 'ਤੇ ICP ਖਰੀਦੋ (ਤੁਹਾਡਾ ਪਤਾ ਕਾਪੀ ਕਰਦਾ ਹੈ, ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹਦਾ ਹੈ)",
  getIcpBuy: "ICP ਖਰੀਦੋ",
  getIcpCopyAria: "ਵਾਲਿਟ ਪਤਾ ਕਾਪੀ ਕਰੋ",
  getIcpCopied: "ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
  getIcpCopyFailed: "ਕਾਪੀ ਅਸਫਲ — ਪਤੇ 'ਤੇ ਕਲਿੱਕ ਕਰੋ",
  getIcpBalance: (amount: string) => `ਬਕਾਇਆ: ${amount} ICP`,
  migrationTitle: (symbol: string) =>
    `ਲਾਂਚ ਵੇਲੇ ਤੁਹਾਡੇ ${symbol} ਨੂੰ ਮਾਈਗ੍ਰੇਟ ਕਰਨ ਦੀ ਲੋੜ ਪਵੇਗੀ`,
  migrationBody:
    "ਇਹਨਾਂ ਨੂੰ ਆਪਣੇ-ਆਪ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਇੱਕ ਵਾਲਿਟ ਪਤਾ ਸ਼ਾਮਲ ਕਰੋ। ਤੁਸੀਂ ਪਤੇ ਤੋਂ ਬਿਨਾਂ ਵੀ ਹੁਣੇ ਖਰੀਦ ਸਕਦੇ ਹੋ।",
  migrationStep1Title: "ਇੱਕ ਵਾਲਿਟ ਬਣਾਓ",
  migrationStep1Body: "Plug, NNS ਜਾਂ OISY ਖੋਲ੍ਹੋ ਅਤੇ ਇੱਕ ਵਾਲਿਟ ਬਣਾਓ।",
  migrationStep2Title: "ਸਹੀ Principal ID ਕਾਪੀ ਕਰੋ",
  migrationStep2Body: "Principal ID ਕਾਪੀ ਕਰੋ — 64 ਅੱਖਰਾਂ ਵਾਲਾ account ID ਨਹੀਂ।",
  migrationStep3Title: "ਇਸਨੂੰ ਇੱਥੇ ਪੇਸਟ ਕਰੋ",
  migrationStep3Body: "ਇਸਨੂੰ ਹੇਠਾਂ ਦਿੱਤੇ ਡਿਲੀਵਰੀ ਪਤੇ ਵਾਲੇ ਖੇਤਰ ਵਿੱਚ ਪੇਸਟ ਕਰੋ ਅਤੇ ਸੰਭਾਲੋ।",
  opensNewTab: "(ਨਵੀਂ ਟੈਬ ਵਿੱਚ ਖੁੱਲ੍ਹਦਾ ਹੈ)",
  migrationAdd: "ਪਤਾ ਸ਼ਾਮਲ ਕਰੋ",
  migrationLater: "ਬਾਅਦ ਵਿੱਚ",
  orderLegend: "ਆਰਡਰ ਰਕਮ",
  orderAmountIn: (symbol: string) => `${symbol} ਵਿੱਚ ਰਕਮ`,
  orderAmountTtti: "TTTI-T ਵਿੱਚ ਮਾਤਰਾ",
  payWith: "ਇਸ ਨਾਲ ਭੁਗਤਾਨ ਕਰੋ",
  unavailable: "ਉਪਲਬਧ ਨਹੀਂ",
  maxSupply: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ",
  totalSupply: "ਕੁੱਲ ਸਪਲਾਈ",
  remaining: "ਬਾਕੀ",
  supplyValueNote: "USD ਬਰਾਬਰੀ TTTI-T ਦੀ ਇਕਸਾਰ ਕੀਮਤ (ਘੰਟੇ ਦੀ ਔਸਤ) ਵਰਤਦੀ ਹੈ।",
  complete: "ਪੂਰੀ",
  paused: "ਰੋਕੀ ਗਈ",
  live: "ਜਾਰੀ",
  maxReached: "ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਪੂਰੀ ਹੋਈ",
  maxReachedBody: (max: string, symbol: string) =>
    `ਕੁੱਲ ਸਪਲਾਈ ${max} ${symbol} ਦੀ ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਤੱਕ ਪਹੁੰਚ ਗਈ ਹੈ। ਖਰੀਦਾਂ ਬੰਦ ਹਨ।`,
  salesPaused: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
  pausedBody: "ਖਰੀਦਾਂ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਬੰਦ ਹਨ। ਕਿਰਪਾ ਕਰਕੇ ਜਲਦੀ ਮੁੜ ਦੇਖੋ।",
  totalSupplyPercent: (percent: string) => `ਕੁੱਲ ਸਪਲਾਈ ${percent}%`,
  progressAria: (percent: string) => `ਕੁੱਲ ਸਪਲਾਈ: ਵੱਧ ਤੋਂ ਵੱਧ ਸਪਲਾਈ ਦਾ ${percent}%`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol} ਜਾਰੀ ਖਰੀਦਾਂ ਵੱਲੋਂ ਰਾਖਵੇਂ ਹਨ।`,
  never: "ਕਦੇ ਨਹੀਂ",
  noRate: (symbol: string) => `ਇਸ ਘੰਟੇ ਲਈ ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਹੀਂ`,
  unavailableUntilRate: (symbol: string) =>
    `ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
  oneBuys: (symbol: string) => `1 ${symbol} ਨਾਲ ਮਿਲਦਾ ਹੈ`,
  source: "ਸਰੋਤ",
  fetched: "ਪ੍ਰਾਪਤ ਕੀਤਾ",
  minimum: "ਘੱਟੋ-ਘੱਟ",
  treasury: "ਖ਼ਜ਼ਾਨਾ",
  notConfigured: "ਸੰਰਚਿਤ ਨਹੀਂ",
  treasuryCopied: (symbol: string) => `ਖ਼ਜ਼ਾਨਾ ${symbol} ਖਾਤਾ ਕਾਪੀ ਹੋ ਗਿਆ`,
  treasuryCopy: (symbol: string) => `ਖ਼ਜ਼ਾਨਾ ${symbol} ਖਾਤਾ ਕਾਪੀ ਕਰੋ`,
  percentConnect: "ਬਾਰ ਵਰਤਣ ਲਈ ਇੱਕ ਵਾਲਿਟ ਜੋੜੋ।",
  percentBalanceUnavailable: "ਬਕਾਇਆ ਉਪਲਬਧ ਨਹੀਂ।",
  percentNotCover: (fees: string) => `ਬਕਾਇਆ ${fees} ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।`,
  percentShare: (symbol: string) => `ਵਾਲਿਟ ${symbol} ਦਾ ਹਿੱਸਾ`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · ਤੁਹਾਨੂੰ ${ttti} TTTI-T ਮਿਲਦਾ ਹੈ`,
  percentComputedOn: (fees: string) =>
    `ਬਕਾਏ ਵਿੱਚੋਂ ${fees} ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਘਟਾ ਕੇ ਗਿਣਿਆ ਗਿਆ।`,
};

export default paGuru;
