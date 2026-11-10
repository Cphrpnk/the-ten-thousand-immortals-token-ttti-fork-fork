import type en from "./en";

const zhHans: typeof en = {
  percentConnect: "连接钱包以使用此滑块。",
  percentLoading: "正在加载余额…",
  percentBalanceUnavailable: "余额不可用。",
  percentNotCover: (fee: string) => `余额不足以支付 ${fee} 的网络手续费。`,
  percentShare: (symbol: string) => `钱包 ${symbol} 余额占比`,
  percentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  percentComputedOn: (fee: string) => `按余额减去 ${fee} 网络手续费计算。`,
};

export default zhHans;
