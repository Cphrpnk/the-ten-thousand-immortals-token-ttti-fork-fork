import mintRule from "../mintRule/zh-Hans";
import type en from "./en";

const zhHans: typeof en = {
  label: "测试版",
  intro:
    "这是一个测试版：一枚代币 TTTI-T，总计 10,000 USD，1 USD 起购。与未来任何 TTTI 价格相同：无折扣、无奖励、无优势。如果将来推出完整版，TTTI-T 将按 1:1 转换为 TTTI。完整版也可能永远不会推出。",
  errorText: "实时分配数据暂时不可用。",
  retry: "重试",
  statusComplete: "分配已完成",
  statusPaused: "购买已暂停",
  statusCurrent: "当前分配",
  pricePerToken: "每枚 TTTI-T 价格（不含手续费）",
  totalSupply: "总供应量",
  remaining: "剩余",
  progressAria: (percent: string) => `总供应量：最大供应量的 ${percent}%`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `总供应量：${total} / ${max} ${symbol}（${percent}%）`,
  disclosuresTitle: "创建者声明",
  disclosure1: `${mintRule.all} 被拒绝的交易对申请押金，无论何种代币（包括 TTTI-T），都进入预留的永久流动性。创建者的持有量已申报并公开：为创建者持有的金额按代币列在 Pools 页面上。创建者不维护任何价格，也不为制造交易量而交易。任何人，包括创建者，均可自行决定提供流动性，并可按锁定规则撤回。只相信您能够验证的内容。`,
  disclosure2:
    "TTTI 与 THAT 出自同一创建者。TTTI 与 THAT 没有任何关联：它不能兑换为 THAT，不能在 THAT 中使用，也不能转换为任何其他东西。",
};

export default zhHans;
