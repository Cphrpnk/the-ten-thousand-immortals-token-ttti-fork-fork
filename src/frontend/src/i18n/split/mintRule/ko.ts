import type en from "./en";

const share =
  "민트할 때마다 민트된 TTTI-T 중 잠금 비율 m은 대응하는 달러와 함께 풀에 넣어지고 민트하는 사람의 명의로 잠깁니다. m은 결제 시점에 풀 가치와 시가총액의 비율로부터 계산되며 0 %에서 50 % 사이이고, 포지션과 함께 기록됩니다. 릴레이는 이 잠금을 늦어도 3개월 후에 해제합니다.";
const remainder =
  "나머지(1 − m)는 결제 전에 민트하는 사람이 선택합니다. 선택 A: 이 부분도 풀에 넣으며 잠금은 없습니다. 포지션은 언제든 회수하거나 3개월에서 5년까지 자발적으로 잠글 수 있습니다. 선택 B: 민트하는 사람이 그 TTTI-T를 지갑에 보관하고 해당 유동성은 지불하지 않습니다.";
const payment =
  "결제 금액은 (10,000 USD + TTTI-T당 공급한 유동성) × q ÷ 0.99이며, TTTI-T당 공급한 유동성은 선택 A에서 10,000 USD, 선택 B에서 m × 10,000 USD입니다. 10,000 USD × q는 항상 공동 준비금으로 들어가며, 지불 금액의 1 %는 사이클 준비금을 제외하고 창작자에게 돌아갑니다. TTTI-T는 대응하는 달러 없이는 풀에 들어가지 않습니다. 경매 정산에도 같은 규칙이 적용되며, 포지션 부분에는 10,000 USD 대신 낙찰자의 가격 B가 사용됩니다.";
const redemption =
  "공동 준비금에서의 상환: 1 TTTI-T는 최대 10,000 USD로 상환되며 수수료는 없습니다. 컨트랙트에 x TTTI-T를 반환하면 지급액은 10,000 USD × x와 (준비금 ÷ 컨트랙트 밖에서 유통되는 TTTI-T) × x 중 더 낮은 금액이며, 준비금의 구성 비율에 따라 ICP, ckBTC, ckUSDC, ckUSDT로 나누어 지급됩니다.";

const ko: typeof en = {
  share,
  remainder,
  payment,
  redemption,
  all: `${share} ${remainder} ${payment} ${redemption}`,
};

export default ko;
