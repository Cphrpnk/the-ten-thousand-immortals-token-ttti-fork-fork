import type en from "./en";

const zhHans: typeof en = {
  saved: "交付地址已保存。",
  saveFailed: "地址保存失败。请重试。",
  removed: "交付地址已删除。",
  removeFailed: "地址删除失败。请重试。",
  title: "交付钱包地址",
  optional: "可选",
  recommended: "推荐",
  descPlug: (symbol: string) =>
    `已自动填入您所连接 Plug 的 principal。您的 ${symbol} 将存入此处。`,
  descIi: (symbol: string) =>
    `已自动填入您的 principal。您的 ${symbol} 将存入此处。`,
  descNone: (symbol: string) =>
    `铸造时无需填写。添加您所控制钱包的 Principal ID，您的 ${symbol} 将在上线时自动转入该钱包。`,
  principalId: "Principal ID",
  placeholder: "例如 abcde-fghij-…-cai",
  save: "保存地址",
  clear: "清除",
  savedAddress: "已保存的地址",
  loadFailed: "无法加载您已保存的地址。您仍可在上方输入地址。",
  retry: "重试",
  noneSaved: "未保存地址 — 购买将存入您用于购买的 principal。",
};

export default zhHans;
