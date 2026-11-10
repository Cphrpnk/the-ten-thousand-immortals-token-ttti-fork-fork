const en = {
  aria: (symbol: string) => `Transfer ${symbol} to this wallet`,
  zeroBalance: (symbol: string) => `Your ${symbol} balance is 0.`,
  transferTo: (symbol: string) =>
    `Transfer ${symbol} to this wallet address to mint.`,
  transferOrBuy: (symbol: string) =>
    `Transfer ${symbol} to the wallet address below, or buy ${symbol}.`,
  copyAria: "Copy wallet address",
  copied: "Address copied",
  copyFailed: "Copy failed. Select the address and copy it.",
};

export default en;
