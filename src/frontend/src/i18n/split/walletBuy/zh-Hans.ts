import type en from "./en";

const zhHans: typeof en = {
  mint: "铸造 TTTI-T",
  btcCopied: "BTC 地址已复制——请粘贴到 Onramper 中",
  btcPending:
    "您的 BTC 地址正在 BTC → ckBTC 面板中创建。请从该面板复制到 Onramper。",
  stableNote: (symbol: string) =>
    `Onramper 向此地址出售 ICP。ICP 到账后，将其兑换为 ${symbol}。`,
  stableNoteLink: (symbol: string) => `兑换 ICP → ${symbol}`,
  close: "关闭",
};

export default zhHans;
