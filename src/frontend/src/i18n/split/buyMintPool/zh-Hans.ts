import type en from "./en";

const zhHans: typeof en = {
  heading: "池",
  legend: "接收流动性的池",
  recommended: "推荐",
  feeTier: "费率档位",
  depth: "深度",
  price: "价格",
  gap: "与综合价格的价差",
  selectedPool: "所选池",
  poolLabel: (id: string) => `池 #${id}`,
  single: (fee: string) => `唯一的池，费率档位 ${fee}`,
  selectPrompt: "请选择一个池以继续。",
  noPool: "此代币没有可用的池。无法铸造。",
  loading: "正在加载池…",
  loadError: "无法加载池。",
  retry: "重试",
  fallbackNotice: "您选择的池已不可用。已改为选择推荐的池。",
  errUnknownPool: "所选池不存在。请重新选择池。",
  errOtherPair: "所选池不属于此代币。请重新选择池。",
  errPoolRemoved: "所选池已被移除。请重新选择池。",
  errPoolRemovalAnnounced: (date: string) =>
    `所选池已宣布将于 ${date} 移除。请重新选择池。`,
};

export default zhHans;
