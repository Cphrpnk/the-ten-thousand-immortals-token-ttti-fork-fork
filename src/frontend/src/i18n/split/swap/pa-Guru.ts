import type en from "./en";

const paGuru: typeof en = {
  description:
    "ਆਪਣੇ ਵਾਲਿਟ ਤੋਂ ICPSwap ਪੂਲ ਰਾਹੀਂ ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT ਅਤੇ ਤੁਹਾਡੇ ਵੱਲੋਂ ਜੋੜੇ ICPSwap-ਸੂਚੀਬੱਧ ਟੋਕਨ ਸਵੈਪ ਕਰੋ।",
  from: "ਤੋਂ",
  to: "ਨੂੰ",
  switchTokens: "ਦੋਵੇਂ ਟੋਕਨ ਬਦਲੋ",
  amount: "ਰਕਮ",
  balance: (amount: string, symbol: string) => `ਬਕਾਇਆ: ${amount} ${symbol}`,
  sameToken: "ਦੋ ਵੱਖਰੇ ਟੋਕਨ ਚੁਣੋ।",
  poolLoading: "ICPSwap ਪੂਲ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  poolError: "ICPSwap ਪੂਲ ਪੜ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਿਆ।",
  noPool: (a: string, b: string) =>
    `ICPSwap ਕੋਲ ${a} ਅਤੇ ${b} ਲਈ ਕੋਈ ਸਿੱਧਾ ਪੂਲ ਨਹੀਂ ਹੈ। ਇਹ ਜੋੜਾ ਇੱਥੇ ਸਵੈਪ ਨਹੀਂ ਹੋ ਸਕਦਾ।`,
  quoteLoading: "ICPSwap ਕੋਟ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  quoteError: "ICPSwap ਪੂਲ ਨੇ ਕੋਈ ਕੋਟ ਨਹੀਂ ਦਿੱਤਾ।",
  livePriceUnavailable:
    "ICPSwap ਦੀ ਲਾਈਵ ਕੀਮਤ ਉਪਲਬਧ ਨਹੀਂ ਹੈ, ਇਸ ਲਈ ਸਵੈਪ ਸ਼ੁਰੂ ਨਹੀਂ ਕੀਤਾ ਗਿਆ। ਕੁਝ ਸਮੇਂ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  quoteExpired: "ਕੋਟ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਹੈ। ਸਵੈਪ ਤੋਂ ਪਹਿਲਾਂ ਇਸਨੂੰ ਤਾਜ਼ਾ ਕਰੋ।",
  refreshQuote: "ਕੋਟ ਤਾਜ਼ਾ ਕਰੋ",
  estimated: "ਅਨੁਮਾਨਿਤ ਪ੍ਰਾਪਤ ਰਕਮ",
  poolFee: "ਪੂਲ ਫੀਸ",
  ledgerFees: "ਲੈਜਰ ਫੀਸਾਂ",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees} (ਮਨਜ਼ੂਰੀ ਅਤੇ ਜਮ੍ਹਾਂ) + ${outFee} (ਕਢਵਾਉਣਾ)`,
  minimumReceived: "ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਪ੍ਰਾਪਤੀ",
  slippage: "ਸਲਿੱਪੇਜ ਸਹਿਣਸ਼ੀਲਤਾ",
  slippageHint: "ਜੇ ਨਤੀਜਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਤੋਂ ਘੱਟ ਹੋਵੇ ਤਾਂ ICPSwap ਸਵੈਪ ਨੂੰ ਇਨਕਾਰ ਕਰਦਾ ਹੈ।",
  slippageInvalid: "0.01 % ਅਤੇ 50 % ਵਿਚਕਾਰ ਸਹਿਣਸ਼ੀਲਤਾ ਦਰਜ ਕਰੋ।",
  amountInvalid: (symbol: string) => `ਇੱਕ ਵੈਧ ${symbol} ਰਕਮ ਦਰਜ ਕਰੋ।`,
  insufficient: (max: string, symbol: string) =>
    `ਰਕਮ ਵਰਤਣਯੋਗ ਬਕਾਏ ਤੋਂ ਵੱਧ ਹੈ। ਵੱਧ ਤੋਂ ਵੱਧ: ${max} ${symbol} (ਬਕਾਇਆ ਘਟਾਓ ਮਨਜ਼ੂਰੀ ਅਤੇ ਜਮ੍ਹਾਂ ਫੀਸਾਂ)।`,
  tooSmall: "ਅਨੁਮਾਨਿਤ ਨਤੀਜਾ ਕਢਵਾਉਣ ਦੀ ਫੀਸ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।",
  connectHint: "ਸਵੈਪ ਕਰਨ ਲਈ ਇੱਕ ਵਾਲਿਟ ਕਨੈਕਟ ਕਰੋ।",
  review: "ਸਵੈਪ ਦੀ ਸਮੀਖਿਆ ਕਰੋ",
  confirmTitle: "ਤੁਸੀਂ ਕੀ ਸਾਈਨ ਕਰਦੇ ਹੋ",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `ਇੱਕ ICRC-2 ਮਨਜ਼ੂਰੀ ਜੋ ICPSwap ਪੂਲ ${pool} ਨੂੰ ਤੁਹਾਡੇ ਖਾਤੇ ਤੋਂ ਬਿਲਕੁਲ ${amount} ${symbol} (ਸਵੈਪ ਰਕਮ ਅਤੇ ਇੱਕ ਲੈਜਰ ਫੀਸ) ਲੈਣ ਦੀ ਆਗਿਆ ਦਿੰਦੀ ਹੈ।`,
  confirmExpiry: (time: string) =>
    `ਮਨਜ਼ੂਰੀ ਸਾਈਨ ਕਰਨ ਤੋਂ 15 ਮਿੰਟ ਬਾਅਦ (ਲਗਭਗ ${time}) ਖਤਮ ਹੋ ਜਾਂਦੀ ਹੈ।`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `ਫਿਰ ਪੂਲ ${symbolIn} ਲੈਂਦਾ ਹੈ (ਜਮ੍ਹਾਂ), ਉਹਨਾਂ ਨੂੰ ਸਵੈਪ ਕਰਦਾ ਹੈ ਅਤੇ ${symbolOut} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਦਾ ਹੈ (ਕਢਵਾਉਣਾ)। ਤੁਹਾਡਾ ਵਾਲਿਟ ਹਰ ਕਦਮ ਦੀ ਪੁਸ਼ਟੀ ਮੰਗ ਸਕਦਾ ਹੈ।`,
  confirmMinimum: (amount: string, symbol: string) =>
    `ਘੱਟੋ-ਘੱਟ ਪ੍ਰਾਪਤੀ: ${amount} ${symbol}। ਇਸ ਤੋਂ ਘੱਟ ਹੋਣ 'ਤੇ ਸਵੈਪ ਇਨਕਾਰ ਹੁੰਦਾ ਹੈ।`,
  confirmSigner: (wallet: string) =>
    `${wallet} ਦੁਆਰਾ ਸਾਈਨ ਕੀਤਾ ਗਿਆ, ਜਿਸ ਕੋਲ ਇਹ ਖਾਤਾ ਹੈ।`,
  warning:
    "ICPSwap ਇੱਕ ਤੀਜੀ-ਧਿਰ ਐਕਸਚੇਂਜ ਹੈ। ਸਵੈਪ ਅੰਤਿਮ ਹਨ ਅਤੇ ਲੈਜਰ ਫੀਸਾਂ ਵਾਪਸ ਨਹੀਂ ਹੁੰਦੀਆਂ। ਜੇ ਕੋਈ ਕਦਮ ਅਸਫਲ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਜਮ੍ਹਾਂ ਰਕਮ ਪੂਲ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਇਸਨੂੰ ਕਢਵਾ ਨਹੀਂ ਲੈਂਦੇ।",
  confirmCheck: "ਮੈਂ ਪੜ੍ਹ ਲਿਆ ਹੈ ਕਿ ਮੈਂ ਕੀ ਸਾਈਨ ਕਰਦਾ ਹਾਂ ਅਤੇ ਇਸ ਸਵੈਪ ਦੀ ਪੁਸ਼ਟੀ ਕਰਦਾ ਹਾਂ।",
  confirm: "ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸਾਈਨ ਕਰੋ",
  back: "ਵਾਪਸ",
  stepApprove: "ਵਾਲਿਟ ਵਿੱਚ ਮਨਜ਼ੂਰੀ…",
  stepDeposit: "ਪੂਲ ਵਿੱਚ ਜਮ੍ਹਾਂ…",
  stepSwap: "ਸਵੈਪ…",
  stepWithdraw: "ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਉਣਾ…",
  refused: "ਦਸਤਖਤ ਇਨਕਾਰ ਕੀਤੇ ਗਏ। ਕੁਝ ਵੀ ਸਵੈਪ ਨਹੀਂ ਹੋਇਆ।",
  slippageError:
    "ਪੂਲ ਨੇ ਸਵੈਪ ਇਨਕਾਰ ਕੀਤਾ: ਨਤੀਜਾ ਗਾਰੰਟੀਸ਼ੁਦਾ ਘੱਟੋ-ਘੱਟ ਤੋਂ ਘੱਟ ਹੋਵੇਗਾ। ਕੋਟ ਤਾਜ਼ਾ ਕਰੋ ਜਾਂ ਸਹਿਣਸ਼ੀਲਤਾ ਵਧਾਓ।",
  failed: (detail: string) => `ਸਵੈਪ ਪੂਰਾ ਨਹੀਂ ਹੋਇਆ: ${detail}`,
  success: (amount: string, symbol: string) =>
    `ਸਵੈਪ ਪੂਰਾ ਹੋਇਆ। ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ${amount} ${symbol} ਪ੍ਰਾਪਤ ਹੋਏ।`,
  newSwap: "ਨਵਾਂ ਸਵੈਪ",
  unusedTitle: "ICPSwap ਪੂਲ ਵਿੱਚ ਬਾਕੀ ਬਕਾਇਆ",
  unusedText: "ਅਧੂਰੇ ਸਵੈਪ ਤੋਂ ਬਾਅਦ ਪੂਲ ਤੁਹਾਡੇ ਖਾਤੇ ਲਈ ਇਹ ਰਕਮ ਰੱਖਦਾ ਹੈ।",
  dexBalanceTitle: "DEX ਵਿੱਚ ਬਾਕੀ ਬਕਾਇਆ",
  dexBalanceText: "ਅਧੂਰੇ ਸਵੈਪ ਤੋਂ ਬਾਅਦ DEX ਤੁਹਾਡੇ ਖਾਤੇ ਲਈ ਇਹ ਰਕਮ ਰੱਖਦਾ ਹੈ।",
  withdrawUnused: "ਮੇਰੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਓ",
  withdrawing: "ਕਢਵਾਇਆ ਜਾ ਰਿਹਾ ਹੈ…",
  withdrawDone: "ਬਕਾਇਆ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਇਆ ਗਿਆ।",
  withdrawFailed: (detail: string) => `ਕਢਵਾਉਣਾ ਅਸਫਲ ਰਿਹਾ: ${detail}`,
  feeError: "ਟੋਕਨ ਲੈਜਰ ਦੀ ਫੀਸ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  addToken: "ਟੋਕਨ ਜੋੜੋ",
  addTokenLabel: "ਚਿੰਨ੍ਹ ਜਾਂ ਲੈਜਰ ID",
  addTokenHint:
    "ICPSwap 'ਤੇ ਸੂਚੀਬੱਧ ਟੋਕਨ ਨੂੰ ਚਿੰਨ੍ਹ ਨਾਲ ਖੋਜੋ, ਜਾਂ ਉਸਦੀ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ। ਜੋੜੇ ਟੋਕਨ ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਰੱਖੇ ਜਾਂਦੇ ਹਨ ਅਤੇ ਸਿਰਫ਼ ਇਸ ਚੋਣਕਾਰ ਵਿੱਚ ਦਿਖਦੇ ਹਨ।",
  addTokenSubmit: "ਜੋੜੋ",
  addTokenReading: "ਟੋਕਨ ਲੈਜਰ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  addTokenListLoading: "ICPSwap ਟੋਕਨ ਸੂਚੀ ਪੜ੍ਹੀ ਜਾ ਰਹੀ ਹੈ…",
  addTokenListError: "ICPSwap ਟੋਕਨ ਸੂਚੀ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕੀ। ਇਸਦੀ ਥਾਂ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ।",
  addTokenNoMatch:
    "ਕੋਈ ICPSwap-ਸੂਚੀਬੱਧ ਟੋਕਨ ਇਸ ਚਿੰਨ੍ਹ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ। ਇਸਦੀ ਥਾਂ ਲੈਜਰ ID ਪੇਸਟ ਕਰੋ।",
  addTokenInvalidId: "ਅਵੈਧ ਲੈਜਰ ID।",
  addTokenNotIcrc:
    "ਇਸ canister ਨੇ ICRC-1 ਟੋਕਨ ਮੈਟਾਡੇਟਾ ਨਹੀਂ ਦਿੱਤਾ। ਇਸਨੂੰ ਜੋੜਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।",
  addTokenAlready: (symbol: string) => `${symbol} ਪਹਿਲਾਂ ਹੀ ਸੂਚੀ ਵਿੱਚ ਹੈ।`,
  addTokenDone: (symbol: string) => `${symbol} ਜੋੜਿਆ ਗਿਆ।`,
  addedTokens: "ਜੋੜੇ ਟੋਕਨ",
  removeToken: (symbol: string) => `${symbol} ਹਟਾਓ`,
  closeAddToken: "ਬੰਦ ਕਰੋ",
  unifiedDescription:
    "ਆਪਣੇ ਵਾਲਿਟ ਤੋਂ ਨੇਟਿਵ ਪੂਲਾਂ ਜਾਂ ICPSwap ਰਾਹੀਂ ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT ਅਤੇ ਤੁਹਾਡੇ ਵੱਲੋਂ ਜੋੜੇ ICPSwap-ਸੂਚੀਬੱਧ ਟੋਕਨ ਸਵੈਪ ਕਰੋ।",
  routesTitle: "ਰੂਟ",
  routeBestPrice: "ਸਭ ਤੋਂ ਵਧੀਆ ਕੀਮਤ",
  routeSelected: "ਚੁਣਿਆ ਗਿਆ",
  routeEnterAmount: "ਇਸ ਰੂਟ ਦਾ ਕੋਟ ਵੇਖਣ ਲਈ ਰਕਮ ਦਾਖਲ ਕਰੋ।",
  routeQuoteLoading: "ਕੋਟ ਪੜ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  routeNativeNoPool: (a: string, b: string) =>
    `${a} ਅਤੇ ${b} ਲਈ ਕੋਈ ਨੇਟਿਵ ਪੂਲ ਮੌਜੂਦ ਨਹੀਂ ਹੈ।`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap ਕੋਲ ${a} ਅਤੇ ${b} ਲਈ ਕੋਈ ਸਿੱਧਾ ਪੂਲ ਨਹੀਂ ਹੈ।`,
  routeNativeAccount: "ਨੇਟਿਵ ਪੂਲ ਰੂਟ ਸਿਰਫ਼ ਇਸ ਸਾਈਟ 'ਤੇ ਸਾਈਨ ਇਨ ਕੀਤੇ ਖਾਤੇ ਲਈ ਉਪਲਬਧ ਹੈ।",
  routeNativeError: "ਨੇਟਿਵ ਪੂਲ ਨੇ ਕੋਈ ਕੋਟ ਨਹੀਂ ਦਿੱਤਾ।",
  routeOnlyIcpswap: "ਇਸ ਜੋੜੇ ਲਈ ਸਿਰਫ਼ ICPSwap ਪੇਸ਼ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
  routeOnlyNative: "ਇਸ ਜੋੜੇ ਲਈ ਸਿਰਫ਼ ਨੇਟਿਵ ਪੂਲ ਪੇਸ਼ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
  bestPriceNote:
    "ਸਭ ਤੋਂ ਵਧੀਆ ਕੀਮਤ: ਫੀਸਾਂ ਸਮੇਤ ਸਭ ਤੋਂ ਵੱਧ ਟੋਕਨ ਦੇਣ ਵਾਲਾ ਰੂਟ। ਜੋ ਰੂਟ ਤੁਸੀਂ ਚੁਣਦੇ ਹੋ, ਉਹੀ ਚਲਾਇਆ ਜਾਂਦਾ ਹੈ।",
  routeUsed: "ਵਰਤਿਆ ਗਿਆ ਰੂਟ",
  amountGiven: "ਦਿੱਤੀ ਜਾਣ ਵਾਲੀ ਰਕਮ",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `ਇੱਕ ICRC-2 ਮਨਜ਼ੂਰੀ ਜੋ DEX ਨੂੰ ਤੁਹਾਡੇ ਖਾਤੇ ਤੋਂ ${amount} ${symbol} ਤੱਕ (ਸਵੈਪ ਰਕਮ ਅਤੇ ਇੱਕ ਲੈਜਰ ਫੀਸ) ਲੈਣ ਦੀ ਆਗਿਆ ਦਿੰਦੀ ਹੈ।`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `ਫਿਰ DEX ${symbolIn} ਲੈਂਦਾ ਹੈ (ਜਮ੍ਹਾਂ), ਉਹਨਾਂ ਨੂੰ ਨੇਟਿਵ ਪੂਲ ਵਿੱਚ ਸਵੈਪ ਕਰਦਾ ਹੈ ਅਤੇ ${symbolOut} ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਭੇਜਦਾ ਹੈ (ਕਢਵਾਉਣਾ)।`,
  warningNative:
    "ਸਵੈਪ ਅੰਤਿਮ ਹਨ ਅਤੇ ਲੈਜਰ ਫੀਸਾਂ ਵਾਪਸ ਨਹੀਂ ਹੁੰਦੀਆਂ। ਜੇ ਕਢਵਾਉਣਾ ਅਸਫਲ ਹੁੰਦਾ ਹੈ, ਤਾਂ ਸਵੈਪ ਕੀਤੀ ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ।",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `ਸਵੈਪ ਪੂਰਾ ਹੋ ਗਿਆ, ਪਰ ${amount} ${symbol} ਨੂੰ ਤੁਹਾਡੇ ਵਾਲਿਟ ਵਿੱਚ ਕਢਵਾਉਣਾ ਅਸਫਲ ਰਿਹਾ: ${detail}। ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਰਹਿੰਦੀ ਹੈ।`,
};

export default paGuru;
