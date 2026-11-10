import type en from "./en";

const zhHans: typeof en = {
  priceStatement:
    "价格：每 TTTI-T 10,000 美元，可随时按 10,000 美元赎回。对于 q 个 TTTI-T，应付金额为（10,000 美元 + 您提供的流动性）× q ÷ 0.99，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。最少：0.0001 TTTI-T。",
  modeLegend: "金额输入方式",
  modeTtti: "以 TTTI-T 输入",
  modeUsd: "以美元输入",
  tttiLabel: "铸造的 TTTI-T",
  tttiHint: "最少 0.0001 TTTI-T，最多 8 位小数。",
  usdLabel: "支付金额（美元）",
  usdHint: "支付的美元价值。TTTI-T 数量向下取整到 8 位小数。",
  invalidTtti: "请输入最多 8 位小数的 TTTI-T 数量。可使用句点或逗号。",
  invalidUsd: "请输入大于 0 且最多 8 位小数的美元金额。可使用句点或逗号。",
  previewHeading: "预览",
  previewIdle: "输入金额以查看预览。",
  previewLoading: "正在计算预览…",
  rowMinted: "铸造的 TTTI-T",
  rowPay: "您支付",
  splitHeading: "付款分配",
  rowPosition: "流动性头寸",
  rowGuarantee: "共同储备",
  rowFee: "费用：1 %",
  rowPrice: "价格",
  priceValue: "每 TTTI-T 10,000 美元，可随时按 10,000 美元赎回",
  rowLiquidity: "您提供的流动性",
  liquidityNote: "仍归您所有，保留在您的头寸中",
  holdingsHeading: "铸造后您持有",
  rowLocked: "锁定部分",
  rowHand: "手中的 TTTI-T",
  lockedShareLabel: "锁定比例 m",
  lockedShareNote:
    "m 是头寸中锁定 3 个月的比例。它在付款时确定：若在本次预览后发生变化，以付款时的值为准。",
  choiceLegend: "剩余部分的选择 (1 − m)",
  choicePoolTitle: "A · 将剩余部分放入资金池",
  choicePoolText: "剩余部分放入您头寸所在的资金池，不锁定。",
  choiceWalletTitle: "B · 保留在钱包中",
  choiceWalletText:
    "剩余部分以 TTTI-T 形式留在您的钱包中；对应的流动性无需支付。",
  paymentRule:
    "付款：（10,000 美元 + 您提供的流动性）× q ÷ 0.99，向上取整。10,000 美元 × q 进入共同储备，所付金额的 1 % 归创建者。其余部分是您提供的流动性，仍归您所有并保留在您的头寸中。",
  lockedRule:
    "头寸的 m 部分锁定 3 个月。剩余部分 (1 − m) 按您的选择处理：A 放入资金池且不锁定；B 将对应的 TTTI-T 留在您的钱包中。",
  rowDust: "舍入余额",
  poolPriceHeading: "目标池价格，zap 前后",
  priceBefore: "之前",
  priceAfter: "之后",
  emptyPool: "空池",
  consolidatedPriceHeading: "综合价格（参考）",
  consolidatedPriceNote:
    "每 TTTI-T 的美元：其他已开放池的价格（不含目标池），按其深度加权。",
  poolPriceNote: "所付代币的 TTTI-T 池中每 TTTI-T 的美元。",
  gapHeading: "池价格与参考价格之间的价差",
  gapUnavailable: "价差不可用",
  noIndependentReference: "没有独立参考价",
  firstDepositNote:
    "空池：首笔存入按 1 比 1 进行，价格为每 TTTI-T 10,000 美元。",
  zapLabel: "平衡兑换",
  noZap: "无需平衡兑换。",
  maxPayLabel: "此容差下的最高支付额",
  expiryNote: "若 5 分钟内未执行，铸造将被拒绝。",
  previewFailedTitle: "预览不可用",
  mintFailedTitle: "铸造未完成",
  successTitle: (amount: string) => `已铸造 ${amount}`,
  successPaid: (pay: string, id: string) => `已支付 ${pay} · 铸造 #${id}`,
  successPosition: (id: string) => `流动性头寸 #${id}`,
  successHoldings: (token: string, ttti: string) =>
    `该头寸包含 ${token} 和 ${ttti}。`,
  successGuarantee: (amount: string) => `共同储备：${amount}。`,
  successLink: "查看我的流动性头寸",
  errAnonymous: "请登录或连接钱包后再铸造。",
  errRateUnavailable: (symbol: string) =>
    `目前没有有效的 ${symbol}/USD 汇率。未扣除任何款项。请稍后重试。`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `最低为 ${minimum}${minimumUsd ? `（${minimumUsd}）` : ""}。`,
  errTooManyDecimals: (max: string, step: string) =>
    `TTTI-T 数量最多 ${max} 位小数（最小单位 ${step}）。`,
  errInvalidAmount: "请输入大于 0 的金额。",
  errAboveCap: (cap: string, remaining: string) =>
    `已达到或将超过总上限 ${cap}。剩余：${remaining}。`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
    `${symbol} 余额不足：含账本手续费需要 ${required}，可用 ${balance}。`,
  errInsufficientAllowance: (
    symbol: string,
    required: string,
    allowance: string,
  ) =>
    `${symbol} 授权额度过低：需要 ${required}，已授权 ${allowance}。请重新授权后重试。`,
  errSlippageExceeded: (percent: string) =>
    `池价格变动超出 ${percent} % 的容差。未铸造任何内容。请重试或提高容差。`,
  errInvalidSlippage: (percent: string) => `容差不能超过 ${percent} %。`,
  errMaxPayExceeded: (pay: string, max: string) =>
    `应付金额现为 ${pay}，高于根据预览设定的上限 ${max}。请刷新预览后重试。`,
  errDeadlineExpired: "在铸造执行前已超过 5 分钟期限。请重试。",
  errInProgress: "此账户已有一笔铸造正在进行。",
  errAcknowledgements: "请先接受确认声明再铸造。",
  errSalesPaused: "铸造已暂停。",
  rateSourceMissing: "不可用",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `铸造被拒绝：${symbol} 的 Coinbase 与 CoinGecko 汇率相差超过 ${maxPercent}%，或其中一个缺失。Coinbase：${coinbase}。CoinGecko：${coingecko}。未扣除任何款项。`,
  errDexPaused: "资金池已暂停，无法铸造。",
  errPoolRemoved: (symbol: string) => `TTTI-T/${symbol} 池已被移除。`,
  errRemovalAnnounced: (symbol: string, date: string) =>
    `已公告 TTTI-T/${symbol} 池将于 ${date} 移除。向该池的铸造已暂停。`,
  errPoolNotFound: (symbol: string) => `不存在 TTTI-T/${symbol} 池。`,
  errMinimumsNotSet: "池的最低限额尚未设置。",
  errLedger: (symbol: string, message: string) =>
    `${symbol} 账本错误：${message}`,
  errDepositRefunded: (id: string) =>
    `向池存入失败。款项已退还（扣除账本手续费）（铸造 #${id}）。`,
  refundingTitle: "款项退还中",
  errDepositRefunding: (id: string) =>
    `向池存入失败。款项正在退还，在此期间仍保留在您的钱包余额中（铸造 #${id}）。`,
  errDepositRefundFailed: (id: string) =>
    `向池存入失败，且退款未完成（铸造 #${id}）。请保留此编号。`,
  errGeneric: "铸造被拒绝。",
};

export default zhHans;
