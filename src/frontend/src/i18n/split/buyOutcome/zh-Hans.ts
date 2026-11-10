import type en from "./en";

const zhHans: typeof en = {
  fallbackMessage: "无法为此目标完成购买。请检查收款方后重试。",
  server: (server: string) => server,
  reference: (id: string) => ` 参考编号：购买 #${id}。`,
  contactTeam: " 请凭此参考编号联系团队。",
  refundedTitle: (symbol: string, fee: string) =>
    `交付失败 — 您的 ${symbol} 已退还，扣除 ${fee} 手续费`,
  refundFailed: "交付失败，自动退款也失败了",
  refundedMessage: () => "TTTI-T 交付失败；付款已退还，扣除账本手续费。",
  refundFailedMessage: () =>
    "TTTI-T 交付失败，退款也失败了；此购买需要人工跟进。",
  salesPausedTitle: "销售已暂停",
  salesPausedMessage: () => "购买功能暂时停用。",
  saleCompleteTitle: "销售已结束",
  saleCompleteMessage: () =>
    "TTTI-T 销售已结束：已没有剩余的 TTTI-T 可供出售。",
  belowMinimumTitle: "低于最低购买量",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `最低为 ${minimum} ${display}（以 ${symbol} 计 ${minimumUsd}）；您请求了 ${requested} ${display}。`,
  aboveRemainingTitle: "超过剩余数量",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `最多可购买 ${maximum} ${display}（${maximumPay}）；您请求了 ${requested} ${display}。`,
  priceUnavailableTitle: (symbol: string) =>
    `购买被拒绝：未设定有效的 ${symbol}/USD 汇率`,
  priceUnavailableMessage: (symbol: string) =>
    `未扣取任何 ${symbol}。在设定汇率之前，无法使用 ${symbol} 购买。`,
  notConfiguredTitle: (symbol: string) => `${symbol} 未配置`,
  notConfiguredMessage: (symbol: string) =>
    `销售尚未配置。未扣取任何 ${symbol}。`,
  ledgerMismatchTitle: (symbol: string) => `${symbol} 账本不一致`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `${symbol} 账本报告 ${actualDecimals} 位小数、手续费 ${actualFee}；预期为 ${expectedDecimals} 位小数和 ${expectedFee}。未扣取任何 ${symbol}。`,
  ackRequiredTitle: "需要购买确认",
  ackRequiredMessage: (symbol: string) =>
    `此账户尚未接受六项购买确认。未扣取任何 ${symbol}。`,
  invalidAmountTitle: "金额无效",
  invalidAmountMessage: () => "无法接受此金额或此交付账户。未扣取任何款项。",
  insufficientTitle: (symbol: string) => `${symbol} 余额不足`,
  insufficientMessage: (_server: string, balance: string) =>
    `余额不足以支付此次购买。余额：${balance}。`,
  approvalMissingTitle: (symbol: string) => `缺少 ${symbol} 授权`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `授权额度不足以支付此次购买。当前授权额度：${allowance}。`,
  inProgressTitle: "购买已在进行中",
  inProgressMessage: (symbol: string) =>
    `此账户已有一笔购买正在进行。请等待其完成后重试。此请求未扣取任何 ${symbol}。`,
  ledgerErrorTitle: (symbol: string) => `${symbol} 账本错误`,
  ledgerErrorMessage: () => "无法连接账本或操作失败。请重试。",
  signInTitle: "登录以铸造",
  signInMessage: () => "请登录以铸造 TTTI-T。",
  notCompletedTitle: "购买未完成",
  failedTitle: "购买失败",
};

export default zhHans;
