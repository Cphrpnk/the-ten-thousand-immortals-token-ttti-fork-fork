import type en from "./en";

const zhHans: typeof en = {
  label: "常见问题",
  title: "铸造之前",
  intro: "关于代币、钱包以及铸造流程的清晰解答。",
  whatQ: "TTTI-T 是什么？",
  whatA:
    "TTTI-T 是 TTTI 的测试版，TTTI 是 Internet Computer 上的一种交换货币。账本使用 8 位小数，本测试版包含一枚代币。以 ICP、ckBTC、ckUSDC 或 ckUSDT 支付，遵循下一个问题中说明的铸造规则。",
  mintRuleQ: "铸造的付款金额如何计算？",
  noReturns: "不存在任何形式的收益承诺。",
  icpQ: "如何获得 ICP？",
  icpBefore: "TTTI-T 需用 ICP 铸造。如果您还没有 ICP，请先访问",
  icpLink: "获取 ICP",
  icpAfter: "，了解购买 ICP 并将其发送到您钱包的可靠方式，然后返回进行铸造。",
  btcQ: "可以用 BTC 支付吗？",
  rateQ: "美元汇率如何确定？",
  walletsQ: "支持哪些钱包？",
  walletsA:
    "您可以使用 Internet Identity 或 Plug 钱包登录。两者都让您保有控制权：应用读取您的余额，每笔转账都由您亲自签名。",
  whereQ: "铸造的代币显示在哪里？",
  whereBefore: "您铸造的 TTTI-T 会交付到您登录所用的账户，显示在",
  whereLink: "钱包页面",
  whereAfter:
    "的 TTTI-T 下。如果您愿意，可以在铸造前添加一个可选的交付地址（Principal ID），但这从来不是必需的。",
  supplyQ: "最多可以存在多少枚代币？",
  supplyIntro: "TTTI 是未来版本；TTTI-T 是正在进行的测试。",
  liquidityQ: "流动性池如何运作？",
  liquidityA:
    "任何人都可以提供流动性并将其撤回。流动性头寸是公开的，并与 TTTI 上的标识符相关联。协议从不下达任何与价格挂钩的订单，也不创建任何 TTTI-T。永久流动性是深度管理：对协议份额进行机械、公开的再平衡，从不以价格为条件。仅显示已观察到的收益，即过去 30 天内实际支付的手续费。不存在任何收益承诺。",
  privacyQ: "哪些信息是公开的？应用会保留什么？",
  privacyA:
    "每一笔购买和转账都会公开、永久地记录在所用代币的账本上：ICP、ckBTC、ckUSDC、ckUSDT 或 TTTI-T。任何人都可以看到金额、账户和时间。Bitcoin 转账在 Bitcoin 链上公开：任何人都可以看到其交易 ID（txid）、地址和金额。除此之外，应用只保留您的购买记录（含金额和区块编号）、您的交付地址、您接受购买条款的日期以及您的 BTC 存款跟踪记录（存款地址、txid 及每笔存款的状态）。",
};

export default zhHans;
