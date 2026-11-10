const en = {
  percentConnect: "Connect a wallet to use the bar.",
  percentLoading: "Loading balance…",
  percentBalanceUnavailable: "Balance unavailable.",
  percentNotCover: (fee: string) =>
    `Balance does not cover the ${fee} network fee.`,
  percentShare: (symbol: string) => `Share of wallet ${symbol}`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) =>
    `Computed on balance minus the ${fee} network fee.`,
};

export default en;
