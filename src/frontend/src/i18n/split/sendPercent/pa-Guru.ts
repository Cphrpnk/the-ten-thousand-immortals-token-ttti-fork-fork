import type en from "./en";

const paGuru: typeof en = {
  percentConnect: "ਬਾਰ ਵਰਤਣ ਲਈ ਇੱਕ ਵਾਲਿਟ ਜੋੜੋ।",
  percentLoading: "ਬਕਾਇਆ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",
  percentBalanceUnavailable: "ਬਕਾਇਆ ਉਪਲਬਧ ਨਹੀਂ।",
  percentNotCover: (fee: string) => `ਬਕਾਇਆ ${fee} ਨੈੱਟਵਰਕ ਫੀਸ ਨੂੰ ਪੂਰਾ ਨਹੀਂ ਕਰਦਾ।`,
  percentShare: (symbol: string) => `ਵਾਲਿਟ ${symbol} ਦਾ ਹਿੱਸਾ`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `ਬਕਾਏ ਵਿੱਚੋਂ ${fee} ਨੈੱਟਵਰਕ ਫੀਸ ਘਟਾ ਕੇ ਗਿਣਿਆ ਗਿਆ।`,
};

export default paGuru;
