import type en from "./en";

const zhHans: typeof en = {
  title: (symbol: string) => `铸造 ${symbol}`,
  noExtraTaken: "除所交付内容的成本外，不会收取任何额外的支付代币。",
  shownAs: (symbol: string) => `在钱包中显示为 ${symbol}。`,
  ackReadFirst: "我已阅读白皮书中的“请先阅读”部分。",
  ackNoRights:
    "我理解 TTTI 没有任何用途，也没有内在价值。我唯一享有的权利是赎回权：我可以将 TTTI-T 退还给合约，并收到每个 TTTI-T 10,000 USD 与共同储备按比例份额两者中的较低者，也不承诺任何价值。",
  ackPriceZero:
    "我理解其价格可能跌至零，且没有任何东西承诺其价值。每铸造 1 个 TTTI-T，就有 10,000 USD 按美元计算，以所付代币（ICP、ckBTC、ckUSDC 或 ckUSDT）原样存放在共同储备中，不作兑换，任何持有者都可以按赎回规则将 TTTI-T 退还给合约。1 个 TTTI-T 始终可由任何持有者赎回 10,000 USD。",
  ackIcpCreator:
    "铸造成本为（10,000 USD + 我提供的流动性）× q 除以 0.99，以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付。10,000 USD × q 进入共同储备，我所付金额的 1 % 归创建者，其余部分是我提供的流动性，仍归我所有并保留在我的头寸中。",
  ackNoProfit: "我不依赖任何来自创建者或任何其他人的盈利承诺。",
  ackAffordLoss: "我只花费我能够承受全部损失的金额。",
  ackLegend: "首次购买前需确认。",
  wtTitle: "钱包条款",
  wtDescription:
    "请阅读下列六点，然后勾选复选框并接受。此项仅需确认一次，铸造或赎回前必须完成。",
  wtAcceptLabel: "我已阅读并接受这些条款",
  wtAcceptButton: "接受条款",
  wtBannerText: "钱包条款尚未接受。",
  wtBannerButton: "查看条款",
  wtOpenRefusal: "查看并接受钱包条款",
  wtPoint1Title: "白皮书",
  wtPoint2Title: "权利",
  wtPoint3Title: "价格",
  wtPoint4Title: "铸造成本",
  wtPoint5Title: "无盈利承诺",
  wtPoint6Title: "损失风险",
  ackWhitePaperLink: "打开“请先阅读”部分",
  ackStatusUnavailable: "无法获取购买确认状态",
  ackTickAll: "勾选全部六项声明以启用铸造。",
  retry: "重试",
  invalidAmountTitle: "金额无效",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `请输入大于 0 的 ${symbol} 金额，最多 ${decimals} 位小数。`,
  belowMinimumTitle: "低于最低购买量",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `最低 ${minimum} ${display}（以 ${symbol} 计 ${minimumUsd}）${about !== null ? `，约 ${about}` : ""}。`,
  aboveRemainingTitle: "超过剩余数量",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `仅剩 ${remaining} ${display}（${max}）。`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} 不足（金额 + ${fee} 手续费）`,
  insufficientMessage: (required: string) => `您需要 ${required}（含手续费）。`,
  useMaximum: "使用最大值",
  approvalFailed: (symbol: string) => `${symbol} 授权失败`,
  purchaseNotCompleted: "购买未完成",
  purchaseNotSubmitted: "无法提交购买。请重试。",
  recordingAcks: "正在记录购买确认…",
  approving: (symbol: string) => `正在授权 ${symbol}…`,
  buying: "正在铸造…",
  saleComplete: "销售已结束",
  salesPaused: "销售已暂停",
  tokenUnavailable: (symbol: string) => `${symbol} 不可用`,
  buyWith: (symbol: string) => `使用 ${symbol} 铸造`,
  received: (amount: string, display: string) =>
    `您已收到 ${amount} ${display}`,
  buyTtti: "铸造 TTTI-T",
  buyHeading: "铸造",
  mintInfoToggle: "什么是 buy-to-mint（买即铸造）？",
  mintInfoBody1:
    "只有当有人按显示的汇率以 ICP、ckBTC、ckUSDC 或 ckUSDT 付款时，才会创建 TTTI-T。铸造者提供的流动性仍归其所有，保留在其自己的资金池头寸中。任何人，包括管理员，都无法以其他方式创建 TTTI-T。",
  mintInfoBody2:
    "只有当矿工投入真实资源（能源和硬件）时，比特币才会产生。只有当有人带来真实的代币时，TTTI-T 才会产生。双方都以此承担真实的投入（skin in the game）。",
  walletPlug: "Plug",
  walletBuiltIn: "内置钱包",
  balanceLabel: (symbol: string) => `${symbol} 余额`,
  unavailable: "不可用",
  noTreasury: (symbol: string) => `目前无法使用 ${symbol} 铸造。`,
  youPayIn: (symbol: string) => `您以 ${symbol} 支付`,
  youReceive: "您将收到",
  withFees: (amount: string) => ` · 含手续费 ${amount}`,
  totalDebited: "含网络手续费的扣款总额：",
  noRateTitle: (symbol: string) => `本小时没有有效的 ${symbol}/USD 汇率`,
  noRateBody: (symbol: string) => `在设定汇率之前，无法使用 ${symbol} 购买。`,
  finalMint: (symbol: string) => `Mint ${symbol}`,
  finalMinting: "正在 Mint…",
  finalConverting: "正在转换持有的 ckBTC…",
  finalMoving: "正在将 DEX 余额转入钱包…",
  finalChecking: "正在检查余额…",
  finalSourceLabel: "使用的余额",
  finalSourceWallet: (amount: string) => `钱包：${amount}`,
  finalSourceDex: (amount: string) => `DEX 内部余额：${amount}`,
  finalSourceContract: (amount: string) => `合约持有：${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti}，需支付 ${pay}`,
  finalFundFirst: (symbol: string) =>
    `您的钱包、DEX 和合约中都没有 ${symbol}。请先为账户充值。`,
  finalEnterAmount: "请在上方表单中输入数量，然后点击 Mint。",
  finalDexMoved: (amount: string) =>
    `已将 ${amount} 从 DEX 余额提取到您的钱包。请输入数量，然后点击 Mint。`,
  finalDexFailed: (detail: string) =>
    detail ? `DEX 提取失败。${detail}` : "DEX 提取失败。",
  finalDexWithdrawing: "第 1 步（共 2 步）：正在从 DEX 提取…",
  finalDexMinting: "第 2 步（共 2 步）：正在 Mint…",
  finalDexTooLow: (available: string, required: string) =>
    `扣除账本手续费后的 DEX 余额（${available}）低于本次 Mint 所需的 ${required}。未提取任何资金。`,
  finalDexShort: (balance: string, required: string) =>
    `提取已完成。钱包余额（${balance}）低于本次 Mint 所需的 ${required}。资金仍在您的钱包中。`,
  finalDexMintKept: (amount: string) =>
    `Mint 未完成。${amount} 仍在您的钱包中。点击 Mint 可从钱包重试。`,
  finalUseTokenForm:
    "此余额通过 ckBTC 支付表单进行 Mint，点击 Mint 后将打开该表单。",
};

export default zhHans;
