import type en from "./en";

const paGuru: typeof en = {
  title: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਅਤੇ ਪੂੰਜੀਕਰਨ",
  loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
  loadError: "ਅੰਕੜੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
  retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  notAvailable: "ਉਪਲਬਧ ਨਹੀਂ",
  poolsValue: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ",
  capitalisation: "ਪੂੰਜੀਕਰਨ",
  currentRatio: "ਮੌਜੂਦਾ ਅਨੁਪਾਤ",
  averageRatio: "24 ਘੰਟਿਆਂ ਦਾ ਔਸਤ ਅਨੁਪਾਤ",
  targetRatio: "ਟੀਚਾ ਅਨੁਪਾਤ",
  lockedShare: "ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ m",
  samples: (count: string) => `${count} ਨਮੂਨੇ`,
  computedAt: (date: string) => `ਗਣਨਾ ਦਾ ਸਮਾਂ: ${date}`,
  noteNoPoolsValue: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਨਹੀਂ: ਕੋਈ ਖੁੱਲ੍ਹਾ TTTI-T ਪੂਲ ਨਹੀਂ ਜਾਂ ਕੋਈ ਵੈਧ ਦਰ ਨਹੀਂ।",
  noteNoCapitalisation: "ਕੋਈ ਪੂੰਜੀਕਰਨ ਉਪਲਬਧ ਨਹੀਂ।",
  referencePrice: "ਪੂੰਜੀਕਰਨ ਦੀ ਹਵਾਲਾ ਕੀਮਤ ਪ੍ਰਤੀ TTTI-T (ਟੀਚਾ)",
  referencePriceNote:
    "ਪੂੰਜੀਕਰਨ ਅਤੇ ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦੇ ਟੀਚੇ ਨਾਲ ਮਾਪੇ ਜਾਂਦੇ ਹਨ।",
  consolidatedInfo: "ਪ੍ਰਤੀ TTTI-T ਇਕਸਾਰ ਕੀਮਤ (ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ)",
  noteNoRatio: "ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਅਤੇ ਪੂੰਜੀਕਰਨ ਦੋਵੇਂ ਲੋੜੀਂਦੇ ਹਨ।",
  noteNoAverage: "ਅਜੇ ਤੱਕ ਕੋਈ ਅਨੁਪਾਤ ਨਮੂਨਾ ਦਰਜ ਨਹੀਂ ਹੋਇਆ।",
  noteLockedDefault: "ਅਜੇ ਕੋਈ ਰੱਖਿਆ ਅਨੁਪਾਤ ਨਹੀਂ: ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ ਵੱਧ ਤੋਂ ਵੱਧ, 50 %, ਹੈ।",
  definitionsToggle: "ਪਰਿਭਾਸ਼ਾਵਾਂ",
  defPoolsValue:
    "ਪੂਲਾਂ ਦਾ ਮੁੱਲ: ਹਰ TTTI-T ਪੂਲ ਦੇ ਸਾਹਮਣੇ ਵਾਲੇ ਰਿਜ਼ਰਵ ਦਾ 2 ਗੁਣਾ, ਔਰੇਕਲ ਦਰਾਂ ਉੱਤੇ। ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦੇ ਟੀਚੇ ਨਾਲ ਮਾਪਿਆ ਜਾਂਦਾ ਹੈ।",
  defCapitalisation:
    "ਪੂੰਜੀਕਰਨ: ਚਲਨ ਵਿੱਚ TTTI-T ਗੁਣਾ ਪ੍ਰਤੀ TTTI-T 10,000 USD ਦਾ ਟੀਚਾ, ਜੋ ਪੂਲਾਂ ਦੇ ਮੁੱਲ ਵਾਲੇ ਹੀ ਸਮੇਂ ਮਾਪਿਆ ਜਾਂਦਾ ਹੈ। ਇਕਸਾਰ ਕੀਮਤ ਸਿਰਫ਼ ਜਾਣਕਾਰੀ ਲਈ ਦਿਖਾਈ ਜਾਂਦੀ ਹੈ।",
  defRatio: "ਅਨੁਪਾਤ: ਪੂਲਾਂ ਦਾ ਮੁੱਲ ਭਾਗ ਪੂੰਜੀਕਰਨ।",
  defLockedShare:
    "ਲਾਕ ਕੀਤਾ ਹਿੱਸਾ m: ਰੱਖੇ ਗਏ ਅਨੁਪਾਤ ਤੋਂ ਨਿਕਲਦਾ ਹੈ, ਜੋ ਮੌਜੂਦਾ ਅਨੁਪਾਤ ਅਤੇ 24 ਘੰਟਿਆਂ ਦੀ ਔਸਤ ਵਿੱਚੋਂ ਘੱਟ ਹੈ।",
};

export default paGuru;
