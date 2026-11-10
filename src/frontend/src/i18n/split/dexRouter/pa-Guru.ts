import type en from "./en";

const paGuru: typeof en = {
  routeLabel: "ਰੂਟ",
  routeNative: "ਨੇਟਿਵ ਪੂਲ",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "ਚੁਣਿਆ ਗਿਆ: ਫੀਸਾਂ ਸਮੇਤ ਵੱਧ ਮਿਲਣ ਵਾਲੀ ਰਕਮ।",
  reasonNativeUnavailable:
    "ਨੇਟਿਵ ਪੂਲ ਖਾਲੀ ਹੈ, ਭਰਿਆ ਜਾ ਰਿਹਾ ਹੈ ਜਾਂ ਇਸ ਰਕਮ ਲਈ ਬਹੁਤ ਘੱਟ ਡੂੰਘਾ ਹੈ।",
  reasonIcpswapUnavailable: "ਇਸ ਜੋੜੀ ਲਈ ਕੋਈ ICPSwap ਕੋਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
  icpswapFee: (pct: string) => `ICPSwap ਫੀਸ (${pct})`,
  protocolFee: (pct: string) => `ਪ੍ਰੋਟੋਕੋਲ ਫੀਸ (${pct})`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % ਨੇਟਿਵ ਪੂਲ ਦੇ LP ਨੂੰ: ${lp} · 30 % ਇਸ ਦੀ ਸਥਾਈ ਤਰਲਤਾ ਨੂੰ: ${permanent}`,
  alternativeLabel: (route: string) => `ਦੂਜਾ ਰੂਟ (${route})`,
  alternativeNone: "ਦੂਜਾ ਰੂਟ",
  alternativeUnavailable: "ਉਪਲਬਧ ਨਹੀਂ",
  routeRule:
    "ਹਰ ਸਵੈਪ ਲਈ ਇੱਕ ਰੂਟ: ਨੇਟਿਵ ਪੂਲ (0.3 %) ਜਾਂ ICPSwap (0.3 % ਨਾਲ 0.1 % ਪ੍ਰੋਟੋਕੋਲ ਫੀਸ), ਜੋ ਵੀ ਫੀਸਾਂ ਸਮੇਤ ਵੱਧ ਰਕਮ ਦੇਵੇ। ਕੋਟ ਵਾਲਾ ਰੂਟ ਸਵੈਪ ਨਾਲ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ।",
  fillingViaIcpswap: (gauge: string) =>
    `ਨੇਟਿਵ ਪੂਲ ਭਰੇ ਜਾਣ ਦੌਰਾਨ ਉਸ ਦੇ ਸਵੈਪ ਬੰਦ ਹਨ: ${gauge}। ਸਵੈਪ ICPSwap ਰਾਹੀਂ ਹੋ ਸਕਦਾ ਹੈ।`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `${route} ਰਾਹੀਂ ${input} ਨੂੰ ${output} ਨਾਲ ਸਵੈਪ ਕੀਤਾ ਗਿਆ।`,
  errSameToken: "ਦੋਵੇਂ ਟੋਕਨ ਵੱਖਰੇ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।",
  errPairNotFound: "ਇਹ ਜੋੜੀ ਰਜਿਸਟਰੀ ਵਿੱਚ ਨਹੀਂ ਹੈ।",
  errNoRoute: "ਇਸ ਵੇਲੇ ਇਸ ਸਵੈਪ ਲਈ ਕੋਈ ਰੂਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
  errRouteMismatch: (route: string) =>
    `ਰੂਟ ਹੁਣ ${route} ਹੈ। ਨਵਾਂ ਕੋਟ ਵੇਖੋ ਅਤੇ ਦੁਬਾਰਾ ਪੁਸ਼ਟੀ ਕਰੋ।`,
  errIcpswapReturned: (message: string) =>
    `ICPSwap ਨੇ ਸਵੈਪ ਪੂਰਾ ਨਹੀਂ ਕੀਤਾ: ${message}। ਭੇਜੀ ਰਕਮ ਤੁਹਾਡੇ DEX ਬਕਾਏ ਵਿੱਚ ਵਾਪਸ ਆ ਗਈ ਹੈ।`,
  errIcpswapHeld: (id: string, message: string) =>
    `ICPSwap ਨੇ ਰੂਟ ਕੀਤਾ ਸਵੈਪ #${id} ਪੂਰਾ ਨਹੀਂ ਕੀਤਾ: ${message}। ਭੇਜੀ ਰਕਮ ਅਜੇ ਵਾਪਸ ਨਹੀਂ ਆਈ; ਇਸ ਦੀ ਨਿਗਰਾਨੀ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।`,
  errOutcomeUnknown: (id: string) =>
    `ਰੂਟ ਕੀਤੇ ਸਵੈਪ #${id} ਦਾ ਨਤੀਜਾ ਅਜੇ ਪਤਾ ਨਹੀਂ ਹੈ। ਐਡਮਿਨ ਇਸ ਦੀ ਜਾਂਚ ਕਰਦਾ ਹੈ; ਪੁਸ਼ਟੀ ਹੋਣ 'ਤੇ ਤੁਹਾਡਾ DEX ਬਕਾਇਆ ਅੱਪਡੇਟ ਹੁੰਦਾ ਹੈ।`,
};

export default paGuru;
