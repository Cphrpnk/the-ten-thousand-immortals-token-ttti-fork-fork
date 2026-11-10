import type en from "./en";

const zhHans: typeof en = {
  title: "赎回",
  ruleSummary: "1 TTTI-T 最多可赎回 10,000 USD，不收费用。",
  rulePayout:
    "支付金额为以下两者中较小者：10,000 USD × x，以及储备除以合约之外流通的 TTTI-T 数量 × x，其中 x 为赎回的 TTTI-T 数量。",
  rulePayment:
    "金额以 ICP、ckBTC、ckUSDC 和 ckUSDT 支付，按储备的构成比例分配。单次赎回不能超过合约之外流通的 TTTI-T 数量。",
  ruleAnyHolder:
    "储备由所有持有者共有。任何持有者都可以赎回，包括从未铸造过的持有者。",
  ruleMintLock:
    "铸造时，TTTI-T 的可变份额 m 会以铸造者的名义存入资金池并锁定。中继最迟在 3 个月后将其释放。",
  ruleMintChoice:
    "付款前，铸造者选择将其余部分 (1 − m) 存入资金池（选项 A）或保留在钱包中（选项 B）。",
  ruleMintReserve:
    "无论选择哪一项，共同储备每铸造 1 个 TTTI-T 都会收到 10,000 USD。该金额按美元计算，以所付代币（ICP、ckBTC、ckUSDC 或 ckUSDT）原样保存，不作兑换。",
  redeemHeldNote:
    "任何持有的 TTTI-T 都可以从共同储备中赎回，最高 10,000 USD，包括选项 B 下保留在钱包中的 TTTI-T。",
  signInPrompt: "请登录后赎回 TTTI-T。",
  loadError: "无法加载你的赎回记录。",
  retryButton: "重试",
  reserveTitle: "储备",
  reserveLoading: "正在加载储备…",
  reserveLoadError: "无法加载储备。",
  reserveTotalLabel: "储备 (USD)",
  reserveTokenLabel: (symbol: string) => `${symbol} 储备`,
  circulationLabel: "合约之外流通的 TTTI-T",
  reservePerTtiLabel: "每个 TTTI-T 的储备",
  reservePerTtttiNone: "没有流通的 TTTI-T",
  requiredLabel: "所需 (10,000 USD × 流通量)",
  invariantLabel: "不变条件",
  invariantHolds: "储备不低于所需金额",
  invariantBroken: "储备低于所需金额",
  shortfallLabel: "缺口",
  shortfallNone: "无",
  reserveRateMissing: (symbol: string) => `${symbol} 暂无汇率`,
  redeemTitle: "赎回",
  redeemIntro:
    "将 TTTI-T 退还给共同储备。预览会在签署任何内容之前显示确切的到账金额。",
  amountLabel: "赎回的 TTTI-T",
  amountPlaceholder: "0.0",
  maxButton: "最大",
  amountInvalid: "请输入大于零的金额。",
  redeemButton: "赎回",
  redeemingButton: "正在赎回…",
  previewTitle: "预览",
  previewLoading: "正在计算…",
  previewCap: "10,000 USD × x",
  previewReserveShare: "储备 ÷ 合约之外的流通量 × x",
  previewPaidIn: (symbol: string) => `以 ${symbol} 支付`,
  previewCirculation: "合约之外流通的 TTTI-T",
  previewNet: "你将收到（两者中较小者）",
  previewUsdNote: "USD 价值使用此预览的汇率。",
  previewLedgerFeeNote: "支付的账本费用不会从到账金额中扣除。",
  returnedTttiNote:
    "退还的 TTTI-T 由合约持有，不再计入合约之外的流通量。不会销毁任何代币。",
  allowanceTitle: "TTTI-T 授权",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `退还 TTTI-T 需要一份 ICRC-2 授权，金额为退还数量加上 TTTI-T 账本费用：${amount} + ${fee} = ${required}。`,
  allowanceCurrent: (allowance: string) => `当前授权：${allowance}`,
  allowanceOk: "当前授权足以覆盖本次赎回。",
  allowanceMissing: "当前授权不足。将在赎回之前请求授权。",
  approvingButton: "正在授权…",
  allowanceExpiryNote: "授权始终有有效期。确认前请在钱包中核对金额和日期。",
  historyTitle: "我的赎回",
  historyEmpty: "暂无赎回记录。",
  statusCompleted: "已完成",
  statusInProgress: "进行中",
  statusNeedsReview: "待核查",
  statusFailed: "失败",
  historyReturned: "退还的 TTTI-T",
  historyNet: "已收到",
  historyPullBlock: "TTTI-T 区块",
  historyPayoutBlock: "支付区块",
  resultCompleted: (net: string) => `已完成。你收到了 ${net}。`,
  resultInProgress: "支付正在进行。完成后会显示在下方列表中。",
  resultNeedsReview: "支付需要核查。它会连同状态保留在下方列表中。",
  resultFailed: "支付未完成。",
  errAnonymous: "请登录后再赎回。",
  errSalesPaused: "赎回已暂停。",
  errAmountTooSmall: "金额过小，无法支付。无法赎回。",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `金额 ${requested} 超过合约之外流通的 TTTI-T：${circulation}。`,
  errReserveEmpty: "储备为空。无法赎回。",
  errRateUnavailable: (symbol: string) =>
    `目前没有 ${symbol} 的汇率。请稍后再试。`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `金额不足以覆盖支付的 ${symbol} 账本费用（${fee}）。无法赎回。`,
  errTttiBalance: (balance: string, required: string) =>
    `TTTI-T 余额为 ${balance}；需要 ${required}。`,
  errAllowance: (allowance: string, required: string) =>
    `TTTI-T 授权为 ${allowance}；需要 ${required}。`,
  errSlippage: (payout: string, expected: string) =>
    `到账金额将为 ${payout}，低于预览中显示的 ${expected}。请刷新预览后重试。`,
  errRedemptionInProgress: "已有一笔赎回正在进行。",
  errNothingToConvert: "此操作没有需要转换的内容。",
  errConversionFailed: (detail: string) => `转换失败：${detail}`,
  errPullFailed: (detail: string) => `无法收取 TTTI-T：${detail}`,
  errCallFailed: (detail: string) => `请求失败：${detail}`,
  errInvalidAmount: "请输入有效金额。",
  errAcknowledgementRequired:
    "赎回前必须先接受钱包条款。请打开接受步骤，接受条款后再次赎回。",
  acceptanceChecking: "正在检查钱包条款…",
  acceptanceMissing: "此账户尚未接受钱包条款。赎回前必须先接受。",
  openAcceptanceButton: "查看并接受钱包条款",
  percentShare: "可赎回数量的比例",
  percentComputedOn:
    "按可赎回数量计算：持有的 TTTI-T 与合约之外流通的 TTTI-T 中较小者。",
  balanceNone: "此钱包没有可赎回的 TTTI-T。",
  heldLabel: "持有的 TTTI-T",
  limitedByBalance: (held: string, max: string) =>
    `持有的 TTTI-T（${held}）将金额限制为 ${max}。`,
  limitedByCirculation: (circulation: string, max: string) =>
    `合约之外流通的 TTTI-T（${circulation}）将金额限制为 ${max}。`,
  confirmTitle: "确认赎回",
  confirmIntro:
    "你为合约签署一份 TTTI-T 的 ICRC-2 授权。随后合约收取 TTTI-T，并以储备中的代币（ICP、ckBTC、ckUSDC 和 ckUSDT）支付所示金额。",
  confirmExpiry: "授权在 15 分钟后过期。",
  closeButton: "关闭",
  cancelButton: "取消",
  resultTitle: "结果",
};

export default zhHans;
