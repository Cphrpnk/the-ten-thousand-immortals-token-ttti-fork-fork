import type en from "./en";

const zhHans: typeof en = {
  description:
    "通过 ICPSwap 资金池，从您自己的钱包兑换 ICP、TTTI-T、ckBTC、ckUSDC、ckUSDT 以及您添加的 ICPSwap 上架代币。",
  from: "从",
  to: "到",
  switchTokens: "互换两个代币",
  amount: "数量",
  balance: (amount: string, symbol: string) => `余额：${amount} ${symbol}`,
  sameToken: "请选择两个不同的代币。",
  poolLoading: "正在查找 ICPSwap 资金池…",
  poolError: "无法读取 ICPSwap 资金池。",
  noPool: (a: string, b: string) =>
    `ICPSwap 没有 ${a} 与 ${b} 的直接资金池。此交易对无法在此兑换。`,
  quoteLoading: "正在读取 ICPSwap 报价…",
  quoteError: "ICPSwap 资金池未返回报价。",
  livePriceUnavailable:
    "无法获取 ICPSwap 实时价格，因此未发起兑换。请稍后重试。",
  quoteExpired: "报价已过期。兑换前请刷新。",
  refreshQuote: "刷新报价",
  estimated: "预计收到",
  poolFee: "资金池费用",
  ledgerFees: "账本费用",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees}（授权和存入）+ ${outFee}（提取）`,
  minimumReceived: "保证最低收到",
  slippage: "滑点容差",
  slippageHint: "如果兑换结果低于保证最低值，ICPSwap 将拒绝兑换。",
  slippageInvalid: "请输入 0.01 % 到 50 % 之间的容差。",
  amountInvalid: (symbol: string) => `请输入有效的 ${symbol} 数量。`,
  insufficient: (max: string, symbol: string) =>
    `数量超过可用余额。最大值：${max} ${symbol}（余额减去授权和存入费用）。`,
  tooSmall: "预计兑换结果不足以支付提取费用。",
  connectHint: "请连接钱包以进行兑换。",
  review: "检查兑换",
  confirmTitle: "您签署的内容",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `一项 ICRC-2 授权，允许 ICPSwap 资金池 ${pool} 从您的账户中提取恰好 ${amount} ${symbol}（兑换数量加一笔账本费用）。`,
  confirmExpiry: (time: string) => `该授权在签署 15 分钟后过期（约 ${time}）。`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `随后资金池提取 ${symbolIn}（存入），进行兑换，并将 ${symbolOut} 发送到您的钱包（提取）。您的钱包可能会要求确认每个步骤。`,
  confirmMinimum: (amount: string, symbol: string) =>
    `最低收到：${amount} ${symbol}。低于此值，兑换将被拒绝。`,
  confirmSigner: (wallet: string) => `由持有此账户的 ${wallet} 签署。`,
  warning:
    "ICPSwap 是第三方交易平台。兑换是最终的，账本费用不予退还。如果某个步骤失败，已存入的数量会留在资金池中，直到您将其提取。",
  confirmCheck: "我已阅读签署内容并确认此次兑换。",
  confirm: "确认并签署",
  back: "返回",
  stepApprove: "正在钱包中授权…",
  stepDeposit: "正在存入资金池…",
  stepSwap: "正在兑换…",
  stepWithdraw: "正在提取到您的钱包…",
  refused: "签名被拒绝。未进行任何兑换。",
  slippageError:
    "资金池拒绝了兑换：兑换结果将低于保证最低值。请刷新报价或提高容差。",
  failed: (detail: string) => `兑换未完成：${detail}`,
  success: (amount: string, symbol: string) =>
    `兑换完成。您的钱包已收到 ${amount} ${symbol}。`,
  newSwap: "新的兑换",
  unusedTitle: "留在 ICPSwap 资金池中的余额",
  unusedText: "兑换未完成后，资金池为您的账户保留此数量。",
  dexBalanceTitle: "留在 DEX 中的余额",
  dexBalanceText: "兑换未完成后，DEX 为您的账户保留此数量。",
  withdrawUnused: "提取到我的钱包",
  withdrawing: "正在提取…",
  withdrawDone: "余额已提取到您的钱包。",
  withdrawFailed: (detail: string) => `提取失败：${detail}`,
  feeError: "无法读取代币账本费用。请重试。",
  addToken: "添加代币",
  addTokenLabel: "符号或账本 ID",
  addTokenHint:
    "按符号搜索 ICPSwap 上架的代币，或粘贴其账本 ID。添加的代币保存在此浏览器中，仅显示在此选择器中。",
  addTokenSubmit: "添加",
  addTokenReading: "正在读取代币账本…",
  addTokenListLoading: "正在读取 ICPSwap 代币列表…",
  addTokenListError: "无法读取 ICPSwap 代币列表。请改为粘贴账本 ID。",
  addTokenNoMatch: "没有与此符号匹配的 ICPSwap 上架代币。请改为粘贴账本 ID。",
  addTokenInvalidId: "账本 ID 无效。",
  addTokenNotIcrc: "此 canister 未返回 ICRC-1 代币元数据，无法添加。",
  addTokenAlready: (symbol: string) => `${symbol} 已在列表中。`,
  addTokenDone: (symbol: string) => `已添加 ${symbol}。`,
  addedTokens: "已添加的代币",
  removeToken: (symbol: string) => `移除 ${symbol}`,
  closeAddToken: "关闭",
  unifiedDescription:
    "通过原生池或 ICPSwap，从您自己的钱包兑换 ICP、TTTI-T、ckBTC、ckUSDC、ckUSDT 以及您添加的 ICPSwap 上架代币。",
  routesTitle: "路线",
  routeBestPrice: "最优价格",
  routeSelected: "已选择",
  routeEnterAmount: "输入金额以查看此路线的报价。",
  routeQuoteLoading: "正在读取报价…",
  routeNativeNoPool: (a: string, b: string) => `${a} 与 ${b} 没有原生池。`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap 没有 ${a} 与 ${b} 的直接池。`,
  routeNativeAccount: "原生池路线仅适用于在本站登录的账户。",
  routeNativeError: "原生池未返回报价。",
  routeOnlyIcpswap: "此交易对仅提供 ICPSwap。",
  routeOnlyNative: "此交易对仅提供原生池。",
  bestPriceNote: "最优价格：含费用后返还代币最多的路线。执行的是您选择的路线。",
  routeUsed: "所用路线",
  amountGiven: "支付金额",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `一项 ICRC-2 授权，允许 DEX 从您的账户中最多划走 ${amount} ${symbol}（兑换金额加一笔账本费用）。`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `随后 DEX 划走 ${symbolIn}（存入），在原生池中兑换，并将 ${symbolOut} 发送到您的钱包（提取）。`,
  warningNative:
    "兑换不可撤销，账本费用不予退还。若提取失败，已兑换的金额将保留在您的 DEX 余额中。",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `兑换已完成，但将 ${amount} ${symbol} 提取到您的钱包失败：${detail}。该金额保留在您的 DEX 余额中。`,
};

export default zhHans;
