import type en from "./en";

const paGuru: typeof en = {
  aria: (symbol: string) => `ਇਸ ਵਾਲਿਟ ਵਿੱਚ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ`,
  zeroBalance: (symbol: string) => `ਤੁਹਾਡਾ ${symbol} ਬਕਾਇਆ 0 ਹੈ।`,
  transferTo: (symbol: string) =>
    `ਮਿੰਟ ਕਰਨ ਲਈ ਇਸ ਵਾਲਿਟ ਪਤੇ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ।`,
  transferOrBuy: (symbol: string) =>
    `ਹੇਠਾਂ ਦਿੱਤੇ ਵਾਲਿਟ ਪਤੇ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ, ਜਾਂ ${symbol} ਖਰੀਦੋ।`,
  copyAria: "ਵਾਲਿਟ ਪਤਾ ਕਾਪੀ ਕਰੋ",
  copied: "ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ",
  copyFailed: "ਕਾਪੀ ਅਸਫਲ ਰਹੀ। ਪਤਾ ਚੁਣੋ ਅਤੇ ਇਸਨੂੰ ਕਾਪੀ ਕਰੋ।",
};

export default paGuru;
