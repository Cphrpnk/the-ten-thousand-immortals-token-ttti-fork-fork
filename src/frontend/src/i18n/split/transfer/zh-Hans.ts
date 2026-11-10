import type en from "./en";

const zhHans: typeof en = {
  contractAddressRefused: "代币无法销毁；向合约地址的转账将被拒绝。",
  badFee: "转账手续费已变更。请刷新后重试。",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `资金不足。您的余额为 ${balance} ${symbol}。`,
  insufficientFunds: "资金不足，无法完成此转账。",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `授权额度不足。当前授权额度：${allowance} ${symbol}。`,
  insufficientAllowance: "授权额度不足，无法完成此转账。",
  duplicateTransfer: "此交易已处理。",
  temporarilyUnavailable: "账本暂时不可用。请稍后重试。",
  createdInFuture: "账本以创建时间在未来为由拒绝了此操作。请重试。",
  tooOldTransfer: "此交易过旧，无法处理。请重试。",
  genericRejected: "账本拒绝了此请求。请检查目标地址后重试。",
  rejected: "账本拒绝了此请求。",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `授权额度已变更。当前授权额度：${current} ${symbol}。`,
  allowanceChanged: "授权额度已变更。请刷新后重试。",
  approveExpired: "此授权在处理前已过期。",
  approveExpiredFrom: "授权有效期已过。请重试。",
  approveInsufficientFunds: "资金不足，无法支付授权手续费。",
  approveBadFee: "授权手续费已变更。请刷新后重试。",
  approveDuplicate: "此授权已处理。",
  approveTooOld: "此授权过旧，无法处理。请重试。",
  approveRejected: "账本拒绝了此授权。",
  destinationUnavailable: "目标地址验证暂不可用。请稍后重试。",
  invalidAmount: (decimals: number) =>
    `请输入大于 0 的数量，最多 ${decimals} 位小数。`,
  transferFailed: "转账失败。请检查目标地址后重试。",
  amountLabel: (symbol: string) => `数量（${symbol}）`,

  signedOutTitle: "登录以管理您的代币",
  signedOutBody:
    "转账和授权与您的 Internet Identity principal 绑定。请从页眉登录以继续。",
  balanceLabel: "您的余额",

  invalidRecipient: "请输入有效的收款方 Principal ID。",
  transferSent: (amount: string, symbol: string, to: string) =>
    `已向 ${to} 发送 ${amount} ${symbol}。`,
  toastTransfer: "转账完成",
  transferTitle: (symbol: string) => `转账 ${symbol}`,
  transferDescription: (fee: string, symbol: string) =>
    `从您的 principal 向另一账户发送代币。${fee} ${symbol} 的转账手续费将从您的余额中扣除，并记入手续费收取账户。`,
  recipientLabel: "收款方 Principal",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `最多 ${decimals} 位小数。手续费：${fee} ${symbol}。发送方：${from}。`,
  sending: "发送中...",
  sendTokens: "发送代币",

  invalidSpender: "请输入有效的被授权方 Principal ID。",
  invalidAllowance: (decimals: number) =>
    `请输入大于 0 的授权额度，最多 ${decimals} 位小数。`,
  approved: (amount: string, symbol: string, spender: string) =>
    `已授权 ${spender} 使用 ${amount} ${symbol}。`,
  toastApproved: "授权已批准",
  approvalFailed: "授权失败。请重试。",
  approveTitle: "授权被授权方",
  approveDescription: "允许另一个 principal 代表您转账代币。",
  spenderLabel: "被授权方 Principal",
  allowanceLabel: (symbol: string) => `授权额度（${symbol}）`,
  approveHint: (decimals: number, symbol: string) =>
    `最多 ${decimals} 位小数。授权将收取 ${symbol} 转账手续费。`,
  approving: "授权中...",
  approveAllowance: "批准授权额度",
  currentAllowance: "当前授权额度",
  currentAllowanceFor: (spender: string) => `${spender} 的当前授权额度`,
  enterSpenderToView: "输入被授权方以查看",
  loading: "加载中…",

  invalidFrom: "请输入有效的转出方 Principal ID。",
  invalidTo: "请输入有效的转入方 Principal ID。",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `已从 ${from} 向 ${to} 转账 ${amount} ${symbol}。`,
  toastTransferFrom: "授权转账完成",
  transferFromTitle: "从授权额度转账",
  transferFromDescription:
    "使用他人授予您的额度，从另一个 principal 的账户转移代币。",
  fromLabel: "转出方 Principal",
  toLabel: "转入方 Principal",
  transferring: "转账中...",
  transferFromButton: "授权转账",

  pageTitle: "管理代币",
  pageSubtitle: (symbol: string) => `转账、授权及使用 ${symbol} 授权额度。`,
  feeBadge: (fee: string, symbol: string) => `手续费 ${fee} ${symbol}`,
  tabTransfer: "转账",
  tabApprove: "授权",
  tabTransferFrom: "授权转账",
};

export default zhHans;
