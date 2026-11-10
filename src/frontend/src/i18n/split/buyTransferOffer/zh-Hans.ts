import type en from "./en";

const zhHans: typeof en = {
  aria: (symbol: string) => `将 ${symbol} 转入此钱包`,
  zeroBalance: (symbol: string) => `您的 ${symbol} 余额为 0。`,
  transferTo: (symbol: string) => `将 ${symbol} 转入此钱包地址即可铸造。`,
  transferOrBuy: (symbol: string) =>
    `将 ${symbol} 转入下方的钱包地址，或购买 ${symbol}。`,
  copyAria: "复制钱包地址",
  copied: "地址已复制",
  copyFailed: "复制失败。请选中地址并复制。",
};

export default zhHans;
