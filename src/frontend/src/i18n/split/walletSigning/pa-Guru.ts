import type en from "./en";

const paGuru: typeof en = {
  refused: "ਵਾਲਿਟ ਵਿੱਚ ਬੇਨਤੀ ਰੱਦ ਕੀਤੀ ਗਈ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
  closed: "ਵਾਲਿਟ ਦੀ ਵਿੰਡੋ ਬੰਦ ਹੋ ਗਈ ਜਾਂ ਜਵਾਬ ਨਹੀਂ ਦਿੱਤਾ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
  wrongAccount: "ਵਾਲਿਟ ਕਿਸੇ ਹੋਰ ਖਾਤੇ ਨਾਲ ਸਾਈਨ ਇਨ ਹੈ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
  failed: "ਵਾਲਿਟ ਬੇਨਤੀ 'ਤੇ ਦਸਤਖਤ ਨਹੀਂ ਕਰ ਸਕਿਆ। ਕੁਝ ਨਹੀਂ ਬਦਲਿਆ।",
  noSigner: "ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਇਹ ਖਾਤਾ ਰੱਖਣ ਵਾਲਾ ਕੋਈ ਵਾਲਿਟ ਉਪਲਬਧ ਨਹੀਂ।",
  fundingHelp:
    "ਫੰਡਿੰਗ ਖਾਤਾ Internet Identity, OISY, NFID Wallet ਜਾਂ Plug ਨਾਲ ਰੱਖਿਆ ਜਾ ਸਕਦਾ ਹੈ। ਹਰ ਮਨਜ਼ੂਰੀ ਉਸ ਵਾਲਿਟ ਨਾਲ ਦਸਤਖਤ ਹੁੰਦੀ ਹੈ ਜਿਸ ਵਿੱਚ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਹੈ (ਉਹੀ principal, ਡਿਫਾਲਟ ਸਬ-ਖਾਤਾ)।",
  fundingSignedWith: (wallet: string) =>
    `ਮਨਜ਼ੂਰੀਆਂ ${wallet} ਨਾਲ ਦਸਤਖਤ ਹੁੰਦੀਆਂ ਹਨ, ਜਿਸ ਵਿੱਚ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਹੈ।`,
  fundingNoMatch:
    "ਇਸ ਡਿਵਾਈਸ 'ਤੇ ਕੋਈ ਜਾਣਿਆ ਵਾਲਿਟ ਰਜਿਸਟਰ ਕੀਤਾ ਖਾਤਾ ਨਹੀਂ ਰੱਖਦਾ। ਉਹ ਵਾਲਿਟ ਜੋੜੋ ਜਿਸ ਵਿੱਚ ਇਹ ਖਾਤਾ ਹੈ।",
  fundingSubaccount:
    "ਇੱਥੇ ਮਨਜ਼ੂਰੀਆਂ ਸਿਰਫ਼ ਡਿਫਾਲਟ ਸਬ-ਖਾਤੇ ਵਾਲੇ ਖਾਤੇ ਲਈ ਦਸਤਖਤ ਹੋ ਸਕਦੀਆਂ ਹਨ।",
  fundingExpected: "ਉਮੀਦ ਕੀਤਾ ਖਾਤਾ",
  fundingConnected: "ਜੁੜਿਆ ਖਾਤਾ",
  fundingNone: "ਕੋਈ ਨਹੀਂ",
  fundingConnect: (wallet: string) => `${wallet} ਜੋੜੋ`,
  fundingMismatch: "ਜੁੜਿਆ ਖਾਤਾ ਰਜਿਸਟਰ ਕੀਤਾ ਫੰਡਿੰਗ ਖਾਤਾ ਨਹੀਂ ਹੈ।",
};

export default paGuru;
