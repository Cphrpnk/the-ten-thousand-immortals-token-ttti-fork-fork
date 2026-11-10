import mintRule from "../mintRule/zh-Hans";
import type en from "./en";

const zhHans: typeof en = {
  eyebrow: "文档 / 白皮书",
  title: "万名不朽者",
  subtitle: "与当前应用源代码保持一致的修订版。",
  identityHeading: "本版本的标识",
  identityBefore: "ledger 的名称和代码均为 ",
  identityAfter:
    "，即当前的测试版本。TTTI 是未来版本。较早的交易可能使用旧的小数位编码。",
  contentsAria: "修订版目录",
  contentsHeading: "目录",
  contentsReading: "请先阅读",
  contentsLedger: "代币与供应量",
  contentsMechanics: "购买机制",
  mintInfoHeading: "Buy-to-mint（买即铸造）",
  contentsControls: "控制与风险",
  contentsDisclosures: "创建者披露",
  contentsPrivacy: "隐私",
  contentsVerification: "验证",
  readingEyebrow: "修订版 / 与源代码一致",
  readingTitle: "01 / 请先阅读",
  readingP1: `TTTI 是一种投机性的 meme 代币，不代表对任何企业的权利，也不构成任何盈利承诺。它没有内在价值、没有收益权，也没有保证的市场。${mintRule.all} 被拒绝的交易对申请押金，无论何种代币（包括 TTTI-T），都进入预留的永久流动性；路由器对其再平衡，并按池的比例注入。不承诺任何价值。其市场价格（如有）可能跌至零。请勿使用您无法承受全部损失的资金购买。`,
  readingP2:
    "本版本说明当前应用源代码所实现的内容。它不能证明任何特定部署，不是独立审计，不代表实时账户余额，也不保证现在能够完成购买。",
  englishOnlyNotice: "以下第 02 至 07 节仅提供英文版本。",
};

export default zhHans;
