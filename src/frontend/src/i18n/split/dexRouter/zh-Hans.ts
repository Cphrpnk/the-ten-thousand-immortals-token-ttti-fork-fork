import type en from "./en";

const zhHans: typeof en = {
  routeLabel: "路由",
  routeNative: "原生池",
  routeIcpswap: "ICPSwap",
  reasonBestAmount: "已选择：含费用后收到的金额更高。",
  reasonNativeUnavailable: "原生池为空、正在注入中，或对该金额深度不足。",
  reasonIcpswapUnavailable: "该交易对没有可用的 ICPSwap 报价。",
  icpswapFee: (pct: string) => `ICPSwap 费用（${pct}）`,
  protocolFee: (pct: string) => `协议费用（${pct}）`,
  protocolSplit: (lp: string, permanent: string) =>
    `70 % 给原生池的 LP：${lp} · 30 % 计入其永久流动性：${permanent}`,
  alternativeLabel: (route: string) => `另一路由（${route}）`,
  alternativeNone: "另一路由",
  alternativeUnavailable: "不可用",
  routeRule:
    "每次兑换只走一条路由：原生池（0.3 %）或 ICPSwap（0.3 % 加 0.1 % 协议费用），取含费用后收到金额更高者。报价中的路由随兑换一并发送。",
  fillingViaIcpswap: (gauge: string) =>
    `原生池注入期间其兑换关闭：${gauge}。兑换可经由 ICPSwap 进行。`,
  swapDoneRoute: (input: string, output: string, route: string) =>
    `已经由 ${route} 用 ${input} 兑换 ${output}。`,
  errSameToken: "两个代币必须不同。",
  errPairNotFound: "该交易对不在登记册中。",
  errNoRoute: "目前该兑换没有可用的路由。",
  errRouteMismatch: (route: string) =>
    `路由现为 ${route}。请查看新报价并重新确认。`,
  errIcpswapReturned: (message: string) =>
    `ICPSwap 未完成兑换：${message}。投入金额已退回您的 DEX 余额。`,
  errIcpswapHeld: (id: string, message: string) =>
    `ICPSwap 未完成路由兑换 #${id}：${message}。投入金额尚未退回；正在跟进。`,
  errOutcomeUnknown: (id: string) =>
    `路由兑换 #${id} 的结果尚未确定。由管理员核实；确认后您的 DEX 余额将更新。`,
};

export default zhHans;
