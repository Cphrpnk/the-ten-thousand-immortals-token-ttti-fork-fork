import type en from "./en";

const paGuru: typeof en = {
  title: (symbol: string) => `${symbol} ਮਿੰਟ ਕਰੋ`,
  noExtraTaken:
    "ਜੋ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ ਉਸਦੀ ਲਾਗਤ ਤੋਂ ਵੱਧ ਭੁਗਤਾਨ ਕੀਤੇ ਟੋਕਨ ਦੀ ਕੋਈ ਵੀ ਰਕਮ ਨਹੀਂ ਲਈ ਜਾਂਦੀ।",
  shownAs: (symbol: string) => `ਵਾਲਿਟਾਂ ਵਿੱਚ ${symbol} ਵਜੋਂ ਦਿਖਾਇਆ ਜਾਂਦਾ ਹੈ।`,
  ackReadFirst: "ਮੈਂ ਵ੍ਹਾਈਟਪੇਪਰ ਦਾ “ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ” ਭਾਗ ਪੜ੍ਹ ਲਿਆ ਹੈ।",
  ackNoRights:
    "ਮੈਨੂੰ ਸਮਝ ਹੈ ਕਿ TTTI ਦੀ ਕੋਈ ਵਰਤੋਂ ਨਹੀਂ ਅਤੇ ਕੋਈ ਅੰਦਰੂਨੀ ਮੁੱਲ ਨਹੀਂ। ਮੇਰਾ ਇੱਕੋ-ਇੱਕ ਅਧਿਕਾਰ ਰੀਡੈਂਪਸ਼ਨ ਦਾ ਅਧਿਕਾਰ ਹੈ: ਮੈਂ TTTI-T ਕੰਟਰੈਕਟ ਨੂੰ ਮੋੜ ਕੇ ਪ੍ਰਤੀ TTTI-T 10,000 USD ਜਾਂ ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਦੇ ਅਨੁਪਾਤੀ ਹਿੱਸੇ ਵਿੱਚੋਂ ਘੱਟ ਰਕਮ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦਾ ਹਾਂ, ਅਤੇ ਮੁੱਲ ਦਾ ਕੋਈ ਵਾਅਦਾ ਨਹੀਂ।",
  ackPriceZero:
    "ਮੈਨੂੰ ਸਮਝ ਹੈ ਕਿ ਇਸਦੀ ਕੀਮਤ ਸਿਫ਼ਰ ਤੱਕ ਡਿੱਗ ਸਕਦੀ ਹੈ ਅਤੇ ਕੋਈ ਵੀ ਚੀਜ਼ ਇਸਦੇ ਮੁੱਲ ਦਾ ਵਾਅਦਾ ਨਹੀਂ ਕਰਦੀ। ਮਿੰਟ ਕੀਤੇ ਹਰ TTTI-T ਪਿੱਛੇ 10,000 USD USD ਵਿੱਚ ਗਿਣੇ ਜਾ ਕੇ ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਵਿੱਚ ਅਦਾ ਕੀਤੇ ਟੋਕਨ (ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT) ਵਿੱਚ, ਬਿਨਾਂ ਤਬਦੀਲੀ ਦੇ, ਰੱਖੇ ਜਾਂਦੇ ਹਨ, ਅਤੇ ਕੋਈ ਵੀ ਧਾਰਕ ਰੀਡੈਂਪਸ਼ਨ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ TTTI-T ਕੰਟਰੈਕਟ ਨੂੰ ਮੋੜ ਸਕਦਾ ਹੈ। 1 TTTI-T ਨੂੰ ਕੋਈ ਵੀ ਧਾਰਕ ਹਮੇਸ਼ਾ 10,000 USD ਵਿੱਚ ਰੀਡੀਮ ਕਰ ਸਕਦਾ ਹੈ।",
  ackIcpCreator:
    "ਮਿੰਟ ਦੀ ਲਾਗਤ (10,000 USD + ਮੇਰੀ ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ) × q ਨੂੰ 0.99 ਨਾਲ ਭਾਗ ਦਿੱਤੀ ਰਕਮ ਹੈ, ਜੋ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਅਦਾ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। 10,000 USD × q ਸਾਂਝੇ ਰਿਜ਼ਰਵ ਵਿੱਚ ਜਾਂਦੇ ਹਨ, ਮੇਰੇ ਵੱਲੋਂ ਅਦਾ ਕੀਤੀ ਰਕਮ ਦਾ 1 % ਸਿਰਜਣਹਾਰ ਨੂੰ ਜਾਂਦਾ ਹੈ, ਅਤੇ ਬਾਕੀ ਮੇਰੀ ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ ਹੈ, ਜੋ ਮੇਰੀ ਪੋਜ਼ੀਸ਼ਨ ਵਿੱਚ ਮੇਰੀ ਹੀ ਰਹਿੰਦੀ ਹੈ।",
  ackNoProfit: "ਮੈਂ ਨਿਰਮਾਤਾ ਜਾਂ ਕਿਸੇ ਹੋਰ ਵੱਲੋਂ ਮੁਨਾਫ਼ੇ ਦੇ ਕਿਸੇ ਵੀ ਵਾਅਦੇ 'ਤੇ ਨਿਰਭਰ ਨਹੀਂ ਹਾਂ।",
  ackAffordLoss:
    "ਮੇਰੇ ਵੱਲੋਂ ਖਰਚੀ ਜਾ ਰਹੀ ਰਕਮ ਸਿਰਫ਼ ਉਹੀ ਹੈ ਜਿਸਦਾ ਪੂਰਾ ਨੁਕਸਾਨ ਮੇਰੇ ਲਈ ਸਹਿਣਯੋਗ ਹੈ।",
  ackLegend: "ਤੁਹਾਡੀ ਪਹਿਲੀ ਖਰੀਦ ਤੋਂ ਪਹਿਲਾਂ ਲੋੜੀਂਦਾ।",
  wtTitle: "ਵਾਲਿਟ ਦੀਆਂ ਸ਼ਰਤਾਂ",
  wtDescription:
    "ਹੇਠਾਂ ਦਿੱਤੇ ਛੇ ਨੁਕਤੇ ਪੜ੍ਹੋ, ਫਿਰ ਬਾਕਸ ਨੂੰ ਚੁਣੋ ਅਤੇ ਮਨਜ਼ੂਰ ਕਰੋ। ਇਹ ਸਿਰਫ਼ ਇੱਕ ਵਾਰ ਮੰਗਿਆ ਜਾਂਦਾ ਹੈ ਅਤੇ ਮਿੰਟ ਜਾਂ ਰਿਡੀਮ ਕਰਨ ਲਈ ਲਾਜ਼ਮੀ ਹੈ।",
  wtAcceptLabel: "ਮੈਂ ਇਹ ਸ਼ਰਤਾਂ ਪੜ੍ਹ ਲਈਆਂ ਹਨ ਅਤੇ ਇਨ੍ਹਾਂ ਨੂੰ ਮਨਜ਼ੂਰ ਕਰਦਾ/ਕਰਦੀ ਹਾਂ",
  wtAcceptButton: "ਸ਼ਰਤਾਂ ਮਨਜ਼ੂਰ ਕਰੋ",
  wtBannerText: "ਵਾਲਿਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਜੇ ਮਨਜ਼ੂਰ ਨਹੀਂ ਕੀਤੀਆਂ ਗਈਆਂ।",
  wtBannerButton: "ਸ਼ਰਤਾਂ ਵੇਖੋ",
  wtOpenRefusal: "ਵਾਲਿਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਵੇਖੋ ਅਤੇ ਮਨਜ਼ੂਰ ਕਰੋ",
  wtPoint1Title: "ਵਾਈਟ ਪੇਪਰ",
  wtPoint2Title: "ਅਧਿਕਾਰ",
  wtPoint3Title: "ਕੀਮਤ",
  wtPoint4Title: "ਮਿੰਟ ਦੀ ਲਾਗਤ",
  wtPoint5Title: "ਮੁਨਾਫ਼ੇ ਦਾ ਕੋਈ ਵਾਅਦਾ ਨਹੀਂ",
  wtPoint6Title: "ਨੁਕਸਾਨ ਦਾ ਜੋਖਮ",
  ackWhitePaperLink: "“ਪਹਿਲਾਂ ਇਹ ਪੜ੍ਹੋ” ਭਾਗ ਖੋਲ੍ਹੋ",
  ackStatusUnavailable: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦੀ ਸਥਿਤੀ ਉਪਲਬਧ ਨਹੀਂ",
  ackTickAll: "ਮਿੰਟਿੰਗ ਨੂੰ ਚਾਲੂ ਕਰਨ ਲਈ ਸਾਰੇ ਛੇ ਕਥਨਾਂ 'ਤੇ ਨਿਸ਼ਾਨ ਲਗਾਓ।",
  retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  invalidAmountTitle: "ਅਵੈਧ ਰਕਮ",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `0 ਤੋਂ ਵੱਧ ਅਤੇ ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਵਾਲੀ ${symbol} ਰਕਮ ਦਰਜ ਕਰੋ।`,
  belowMinimumTitle: "ਘੱਟੋ-ਘੱਟ ਖਰੀਦ ਤੋਂ ਘੱਟ",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `ਘੱਟੋ-ਘੱਟ ${minimum} ${display} (${symbol} ਵਿੱਚ ${minimumUsd})${about !== null ? `, ਲਗਭਗ ${about}` : ""}।`,
  aboveRemainingTitle: "ਬਾਕੀ ਰਕਮ ਤੋਂ ਵੱਧ",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `ਸਿਰਫ਼ ${remaining} ${display} ਬਾਕੀ ਹਨ (${max})।`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} ਨਾਕਾਫ਼ੀ (ਰਕਮ + ${fee} ਫੀਸਾਂ)`,
  insufficientMessage: (required: string) =>
    `ਤੁਹਾਨੂੰ ਫੀਸਾਂ ਸਮੇਤ ${required} ਦੀ ਲੋੜ ਹੈ।`,
  useMaximum: "ਵੱਧ ਤੋਂ ਵੱਧ ਵਰਤੋ",
  approvalFailed: (symbol: string) => `${symbol} ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ`,
  purchaseNotCompleted: "ਖਰੀਦ ਪੂਰੀ ਨਹੀਂ ਹੋਈ",
  purchaseNotSubmitted: "ਖਰੀਦ ਜਮ੍ਹਾਂ ਨਹੀਂ ਕੀਤੀ ਜਾ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  recordingAcks: "ਖਰੀਦ ਪੁਸ਼ਟੀਆਂ ਦਰਜ ਕੀਤੀਆਂ ਜਾ ਰਹੀਆਂ ਹਨ…",
  approving: (symbol: string) => `${symbol} ਦੀ ਮਨਜ਼ੂਰੀ ਦਿੱਤੀ ਜਾ ਰਹੀ ਹੈ…`,
  buying: "ਮਿੰਟਿੰਗ ਜਾਰੀ ਹੈ…",
  saleComplete: "ਵਿਕਰੀ ਪੂਰੀ ਹੋਈ",
  salesPaused: "ਵਿਕਰੀ ਰੋਕੀ ਗਈ ਹੈ",
  tokenUnavailable: (symbol: string) => `${symbol} ਉਪਲਬਧ ਨਹੀਂ`,
  buyWith: (symbol: string) => `${symbol} ਨਾਲ ਮਿੰਟ ਕਰੋ`,
  received: (amount: string, display: string) =>
    `ਤੁਹਾਨੂੰ ${amount} ${display} ਪ੍ਰਾਪਤ ਹੋਏ`,
  buyTtti: "TTTI-T ਮਿੰਟ ਕਰੋ",
  buyHeading: "ਮਿੰਟ ਕਰੋ",
  mintInfoToggle: "buy-to-mint ਕੀ ਹੈ?",
  mintInfoBody1:
    "TTTI-T ਸਿਰਫ਼ ਉਦੋਂ ਬਣਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਦਿਖਾਈ ਗਈ ਦਰ 'ਤੇ ICP, ckBTC, ckUSDC ਜਾਂ ckUSDT ਵਿੱਚ ਭੁਗਤਾਨ ਕਰਦਾ ਹੈ। ਮਿੰਟ ਕਰਨ ਵਾਲੇ ਵੱਲੋਂ ਦਿੱਤੀ ਲਿਕਵਿਡਿਟੀ ਉਸੇ ਦੀ ਰਹਿੰਦੀ ਹੈ, ਉਸਦੀ ਆਪਣੀ ਪੂਲ ਪੋਜ਼ੀਸ਼ਨ ਵਿੱਚ। ਕੋਈ ਵੀ, ਐਡਮਿਨ ਸਮੇਤ, ਕਿਸੇ ਹੋਰ ਤਰੀਕੇ ਨਾਲ TTTI-T ਨਹੀਂ ਬਣਾ ਸਕਦਾ।",
  mintInfoBody2:
    "ਇੱਕ ਬਿਟਕੋਇਨ ਸਿਰਫ਼ ਉਦੋਂ ਹੋਂਦ ਵਿੱਚ ਆਉਂਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਮਾਈਨਰ ਅਸਲ ਸਰੋਤ ਖਰਚਦਾ ਹੈ: ਊਰਜਾ ਅਤੇ ਹਾਰਡਵੇਅਰ। ਇੱਕ TTTI-T ਸਿਰਫ਼ ਉਦੋਂ ਹੋਂਦ ਵਿੱਚ ਆਉਂਦਾ ਹੈ ਜਦੋਂ ਕੋਈ ਅਸਲ ਟੋਕਨ ਲਿਆਉਂਦਾ ਹੈ। ਦੋਵੇਂ ਪਾਸੇ, ਇਹੀ ਅਸਲ ਦਾਅ (skin in the game) ਹੈ।",
  walletPlug: "Plug",
  walletBuiltIn: "ਬਿਲਟ-ਇਨ ਵਾਲਿਟ",
  balanceLabel: (symbol: string) => `${symbol} ਬਕਾਇਆ`,
  unavailable: "ਉਪਲਬਧ ਨਹੀਂ",
  noTreasury: (symbol: string) => `ਇਸ ਸਮੇਂ ${symbol} ਨਾਲ ਮਿੰਟ ਕਰਨਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।`,
  youPayIn: (symbol: string) => `ਤੁਸੀਂ ${symbol} ਵਿੱਚ ਭੁਗਤਾਨ ਕਰਦੇ ਹੋ`,
  youReceive: "ਤੁਹਾਨੂੰ ਮਿਲਦਾ ਹੈ",
  withFees: (amount: string) => ` · ਫੀਸਾਂ ਸਮੇਤ ${amount}`,
  totalDebited: "ਨੈੱਟਵਰਕ ਫੀਸਾਂ ਸਮੇਤ ਕੁੱਲ ਕੱਟੀ ਗਈ ਰਕਮ:",
  noRateTitle: (symbol: string) => `ਇਸ ਘੰਟੇ ਲਈ ਕੋਈ ਵੈਧ ${symbol}/USD ਦਰ ਨਹੀਂ`,
  noRateBody: (symbol: string) =>
    `ਦਰ ਨਿਰਧਾਰਤ ਹੋਣ ਤੱਕ ${symbol} ਵਿੱਚ ਖਰੀਦਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹਨ।`,
  finalMint: (symbol: string) => `${symbol} Mint ਕਰੋ`,
  finalMinting: "Mint ਹੋ ਰਿਹਾ ਹੈ…",
  finalConverting: "ਕੰਟਰੈਕਟ ਕੋਲ ਮੌਜੂਦ ckBTC ਬਦਲਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  finalMoving: "DEX ਬਕਾਇਆ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  finalChecking: "ਬਕਾਏ ਜਾਂਚੇ ਜਾ ਰਹੇ ਹਨ…",
  finalSourceLabel: "ਵਰਤਿਆ ਜਾਣ ਵਾਲਾ ਬਕਾਇਆ",
  finalSourceWallet: (amount: string) => `ਵਾਲਿਟ: ${amount}`,
  finalSourceDex: (amount: string) => `DEX ਅੰਦਰੂਨੀ ਬਕਾਇਆ: ${amount}`,
  finalSourceContract: (amount: string) => `ਕੰਟਰੈਕਟ ਕੋਲ: ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti}, ਅਦਾਇਗੀ ${pay}`,
  finalFundFirst: (symbol: string) =>
    `ਤੁਹਾਡੇ ਵਾਲਿਟ, DEX ਜਾਂ ਕੰਟਰੈਕਟ ਕੋਲ ਕੋਈ ${symbol} ਨਹੀਂ ਹੈ। ਪਹਿਲਾਂ ਖਾਤੇ ਵਿੱਚ ਰਕਮ ਪਾਓ।`,
  finalEnterAmount: "ਉੱਪਰ ਦੇ ਫਾਰਮ ਵਿੱਚ ਮਾਤਰਾ ਦਰਜ ਕਰੋ, ਫਿਰ Mint ਦਬਾਓ।",
  finalDexMoved: (amount: string) =>
    `DEX ਬਕਾਏ ਵਿੱਚੋਂ ${amount} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾ ਲਏ ਗਏ। ਮਾਤਰਾ ਦਰਜ ਕਰੋ, ਫਿਰ Mint ਦਬਾਓ।`,
  finalDexFailed: (detail: string) =>
    detail ? `DEX ਤੋਂ ਕਢਵਾਉਣਾ ਅਸਫਲ ਰਿਹਾ। ${detail}` : "DEX ਤੋਂ ਕਢਵਾਉਣਾ ਅਸਫਲ ਰਿਹਾ।",
  finalDexWithdrawing: "ਕਦਮ 1 / 2: DEX ਤੋਂ ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
  finalDexMinting: "ਕਦਮ 2 / 2: Mint ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…",
  finalDexTooLow: (available: string, required: string) =>
    `ਲੈਜਰ ਫੀਸ ਤੋਂ ਬਾਅਦ DEX ਬਕਾਇਆ (${available}) ਇਸ Mint ਲਈ ਲੋੜੀਂਦੇ ${required} ਤੋਂ ਘੱਟ ਹੈ। ਕੁਝ ਵੀ ਨਹੀਂ ਕਢਵਾਇਆ ਗਿਆ।`,
  finalDexShort: (balance: string, required: string) =>
    `ਕਢਵਾਉਣਾ ਪੂਰਾ ਹੋ ਗਿਆ। ਵਾਲਿਟ ਬਕਾਇਆ (${balance}) ਇਸ Mint ਲਈ ਲੋੜੀਂਦੇ ${required} ਤੋਂ ਘੱਟ ਹੈ। ਫੰਡ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ।`,
  finalDexMintKept: (amount: string) =>
    `Mint ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ। ${amount} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਰਹਿੰਦੇ ਹਨ। ਵਾਲਿਟ ਤੋਂ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰਨ ਲਈ Mint ਦਬਾਓ।`,
  finalUseTokenForm:
    "ਇਹ ਬਕਾਇਆ ckBTC ਭੁਗਤਾਨ ਫਾਰਮ ਤੋਂ Mint ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਜੋ Mint ਦਬਾਉਣ ’ਤੇ ਖੁੱਲ੍ਹਦਾ ਹੈ।",
};

export default paGuru;
