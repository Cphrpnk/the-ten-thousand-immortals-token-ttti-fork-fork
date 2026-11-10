import type en from "./en";

const share =
  "每次铸造时，所铸造 TTTI-T 中的锁定份额 m 会与其对应的美元一并注入资金池，并以铸造者的名义锁定。m 在付款时根据资金池价值与市值的比率计算，范围在 0 % 至 50 % 之间，并与头寸一同记录。接力机制最迟在 3 个月后解除该锁定。";
const remainder =
  "其余部分（1 − m）由铸造者在付款前选择。选择 A：同样注入资金池，不锁定；该头寸可随时撤回，也可自愿锁定 3 个月至 5 年。选择 B：铸造者将这部分 TTTI-T 保留在钱包中，不支付与之对应的流动性。";
const payment =
  "付款金额为（10,000 USD + 每个 TTTI-T 所投入的流动性）× q ÷ 0.99，其中每个 TTTI-T 所投入的流动性在选择 A 时为 10,000 USD，在选择 B 时为 m × 10,000 USD。10,000 USD × q 始终进入共同储备；所付金额的 1 % 归创建者，在 cycles 储备之后。TTTI-T 绝不会在没有对应美元的情况下进入资金池。拍卖结算时适用相同规则，头寸部分以中标者的价格 B 代替 10,000 USD。";
const redemption =
  "向共同储备赎回：1 个 TTTI-T 最多可赎回 10,000 USD，不收费用。向合约退还 x 个 TTTI-T 时，支付金额取 10,000 USD × x 与（储备 ÷ 合约之外流通的 TTTI-T）× x 两者中的较低者，按储备的构成比例，以 ICP、ckBTC、ckUSDC 和 ckUSDT 支付。";

const zhHans: typeof en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default zhHans;
