import type en from "./en";

const zhHans: typeof en = {
  oracleCoinbase:
    "Coinbase 的 ICP-USD、BTC-USD、USDC-USD 和 USDT-USD 现货价格（https://api.coinbase.com/v2/prices/<PAIR>/spot）",
  oracleCoingecko:
    "Coinbase 不可用时，使用 CoinGecko 的 internet-computer、bitcoin、usd-coin 和 tether 简单价格（https://api.coingecko.com/api/v3/simple/price）",
  refreshPolicy:
    "ICP、BTC、USDC 和 USDT 的美元汇率每小时获取一次（先 Coinbase，后 CoinGecko），有效期为一小时。所支付代币的汇率过期时，购买将被拒绝。",
  roundingRule:
    "TTTI-T 金额向下取整至 1 个基本单位（0.00000001 TTTI-T）。所交付金额的费用向上取整至所支付代币的 1 个基本单位（ICP 和 ckBTC：8 位小数；ckUSDC 和 ckUSDT：6 位小数）。",
  excessPaymentHandling: "所支付代币中超出所交付内容费用的部分一概不收取。",
  deliveryOrder:
    "先进行新铸造，直至 1 TTTI-T 的最大供应量（100_000_000 个基本单位）；仍可铸造的数量为最大供应量减去总供应量。代币无法销毁。手续费账户中收取的转账手续费，仅在新铸造达到上限之后，才会以 ICP、ckBTC、ckUSDC 或 ckUSDT 为对价交付给买方。",
};

export default zhHans;
