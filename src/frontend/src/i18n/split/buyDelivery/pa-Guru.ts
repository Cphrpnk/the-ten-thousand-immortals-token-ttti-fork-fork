import type en from "./en";

const paGuru: typeof en = {
  saved: "ਡਿਲੀਵਰੀ ਪਤਾ ਸੰਭਾਲਿਆ ਗਿਆ।",
  saveFailed: "ਪਤਾ ਸੰਭਾਲਣਾ ਅਸਫਲ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  removed: "ਡਿਲੀਵਰੀ ਪਤਾ ਹਟਾਇਆ ਗਿਆ।",
  removeFailed: "ਪਤਾ ਹਟਾਉਣਾ ਅਸਫਲ ਰਿਹਾ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  title: "ਡਿਲੀਵਰੀ ਵਾਲਿਟ ਪਤਾ",
  optional: "ਵਿਕਲਪਿਕ",
  recommended: "ਸਿਫ਼ਾਰਸ਼ੀ",
  descPlug: (symbol: string) =>
    `ਤੁਹਾਡੇ ਜੁੜੇ ਹੋਏ Plug ਦੇ principal ਨਾਲ ਆਪਣੇ-ਆਪ ਭਰਿਆ ਗਿਆ। ਤੁਹਾਡਾ ${symbol} ਇੱਥੇ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।`,
  descIi: (symbol: string) =>
    `ਤੁਹਾਡੇ principal ਨਾਲ ਆਪਣੇ-ਆਪ ਭਰਿਆ ਗਿਆ। ਤੁਹਾਡਾ ${symbol} ਇੱਥੇ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ।`,
  descNone: (symbol: string) =>
    `ਮਿੰਟ ਕਰਨ ਲਈ ਲੋੜੀਂਦਾ ਨਹੀਂ। ਆਪਣੇ ਕੰਟਰੋਲ ਵਾਲੇ ਵਾਲਿਟ ਦਾ Principal ID ਸ਼ਾਮਲ ਕਰੋ ਤਾਂ ਜੋ ਲਾਂਚ ਵੇਲੇ ਤੁਹਾਡਾ ${symbol} ਆਪਣੇ-ਆਪ ਉਸ ਤੱਕ ਪਹੁੰਚ ਜਾਵੇ।`,
  principalId: "Principal ID",
  placeholder: "ਜਿਵੇਂ abcde-fghij-…-cai",
  save: "ਪਤਾ ਸੰਭਾਲੋ",
  clear: "ਸਾਫ਼ ਕਰੋ",
  savedAddress: "ਸੰਭਾਲਿਆ ਪਤਾ",
  loadFailed:
    "ਤੁਹਾਡਾ ਸੰਭਾਲਿਆ ਪਤਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਤੁਸੀਂ ਫਿਰ ਵੀ ਉੱਪਰ ਇੱਕ ਪਤਾ ਦਰਜ ਕਰ ਸਕਦੇ ਹੋ।",
  retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  noneSaved:
    "ਕੋਈ ਪਤਾ ਸੰਭਾਲਿਆ ਨਹੀਂ — ਖਰੀਦਾਂ ਉਸ principal ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀਆਂ ਹਨ ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਖਰੀਦਦੇ ਹੋ।",
};

export default paGuru;
