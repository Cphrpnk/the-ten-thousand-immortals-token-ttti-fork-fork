import type en from "./en";

const paGuru: typeof en = {
  heading: "ਪੂਲ",
  legend: "ਲਿਕਵਿਡਿਟੀ ਪ੍ਰਾਪਤ ਕਰਨ ਵਾਲਾ ਪੂਲ",
  recommended: "ਸਿਫ਼ਾਰਸ਼ੀ",
  feeTier: "ਫੀਸ ਦਾ ਪੱਧਰ",
  depth: "ਡੂੰਘਾਈ",
  price: "ਕੀਮਤ",
  gap: "ਇਕਸਾਰ ਕੀਮਤ ਨਾਲ ਅੰਤਰ",
  selectedPool: "ਚੁਣਿਆ ਪੂਲ",
  poolLabel: (id: string) => `ਪੂਲ #${id}`,
  single: (fee: string) => `ਇੱਕੋ ਪੂਲ, ਫੀਸ ਦਾ ਪੱਧਰ ${fee}`,
  selectPrompt: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਇੱਕ ਪੂਲ ਚੁਣੋ।",
  noPool: "ਇਸ ਟੋਕਨ ਲਈ ਕੋਈ ਪੂਲ ਉਪਲਬਧ ਨਹੀਂ। ਮਿੰਟ ਉਪਲਬਧ ਨਹੀਂ।",
  loading: "ਪੂਲ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…",
  loadError: "ਪੂਲ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੇ।",
  retry: "ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
  fallbackNotice: "ਤੁਹਾਡਾ ਚੁਣਿਆ ਪੂਲ ਹੁਣ ਉਪਲਬਧ ਨਹੀਂ। ਇਸ ਦੀ ਥਾਂ ਸਿਫ਼ਾਰਸ਼ੀ ਪੂਲ ਚੁਣਿਆ ਗਿਆ ਹੈ।",
  errUnknownPool: "ਚੁਣਿਆ ਪੂਲ ਮੌਜੂਦ ਨਹੀਂ। ਪੂਲ ਦੁਬਾਰਾ ਚੁਣੋ।",
  errOtherPair: "ਚੁਣਿਆ ਪੂਲ ਇਸ ਟੋਕਨ ਦਾ ਪੂਲ ਨਹੀਂ। ਪੂਲ ਦੁਬਾਰਾ ਚੁਣੋ।",
  errPoolRemoved: "ਚੁਣਿਆ ਪੂਲ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਪੂਲ ਦੁਬਾਰਾ ਚੁਣੋ।",
  errPoolRemovalAnnounced: (date: string) =>
    `ਚੁਣੇ ਪੂਲ ਨੂੰ ${date} ਨੂੰ ਹਟਾਉਣ ਦਾ ਐਲਾਨ ਕੀਤਾ ਗਿਆ ਹੈ। ਪੂਲ ਦੁਬਾਰਾ ਚੁਣੋ।`,
};

export default paGuru;
