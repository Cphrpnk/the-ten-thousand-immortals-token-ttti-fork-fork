import type en from "./en";

const zhHans: typeof en = {
  title: "资金池价值与市值",
  loading: "加载中…",
  loadError: "无法加载这些数据。",
  retry: "重试",
  notAvailable: "不可用",
  poolsValue: "资金池价值",
  capitalisation: "市值",
  currentRatio: "当前比率",
  averageRatio: "24 小时平均比率",
  targetRatio: "目标比率",
  lockedShare: "锁定份额 m",
  samples: (count: string) => `${count} 个样本`,
  computedAt: (date: string) => `计算时间：${date}`,
  noteNoPoolsValue: "无资金池价值：没有开放的 TTTI-T 资金池或没有有效汇率。",
  noteNoCapitalisation: "没有可用的市值。",
  referencePrice: "市值参考价格（每 TTTI-T，目标价）",
  referencePriceNote: "市值和资金池价值按每 TTTI-T 10,000 USD 的目标价计算。",
  consolidatedInfo: "综合价格（每 TTTI-T，仅供参考）",
  noteNoRatio: "需要资金池价值和市值。",
  noteNoAverage: "尚未记录比率样本。",
  noteLockedDefault: "尚无采用的比率：锁定份额为最大值 50%。",
  definitionsToggle: "定义",
  defPoolsValue:
    "资金池价值：每个 TTTI-T 资金池的对手方储备的 2 倍，按预言机汇率计算。资金池价值按每 TTTI-T 10,000 USD 的目标价计算。",
  defCapitalisation:
    "市值：流通中的 TTTI-T 乘以每 TTTI-T 10,000 USD 的目标价，与资金池价值在同一时刻测得。综合价格仅供参考显示。",
  defRatio: "比率：资金池价值除以市值。",
  defLockedShare:
    "锁定份额 m：由采用的比率得出，即当前比率与 24 小时平均值中较低者。",
};

export default zhHans;
