import type en from "./en";

const paGuru: typeof en = {
  mint: "TTTI-T ਮਿੰਟ ਕਰੋ",
  btcCopied: "BTC ਪਤਾ ਕਾਪੀ ਹੋ ਗਿਆ — ਇਸਨੂੰ Onramper ਵਿੱਚ ਪੇਸਟ ਕਰੋ",
  btcPending:
    "ਤੁਹਾਡਾ BTC ਪਤਾ BTC → ckBTC ਪੈਨਲ ਵਿੱਚ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ। ਉੱਥੋਂ ਕਾਪੀ ਕਰਕੇ Onramper ਵਿੱਚ ਪੇਸਟ ਕਰੋ।",
  stableNote: (symbol: string) =>
    `Onramper ਇਸ ਪਤੇ 'ਤੇ ICP ਵੇਚਦਾ ਹੈ। ICP ਪਹੁੰਚਣ ਤੋਂ ਬਾਅਦ, ਇਸਨੂੰ ${symbol} ਲਈ ਸਵੈਪ ਕਰੋ।`,
  stableNoteLink: (symbol: string) => `ICP → ${symbol} ਸਵੈਪ ਕਰੋ`,
  close: "ਬੰਦ ਕਰੋ",
};

export default paGuru;
