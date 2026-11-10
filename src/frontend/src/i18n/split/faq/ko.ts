import type en from "./en";

const ko: typeof en = {
  label: "질문",
  title: "발행하기 전에",
  intro: "토큰, 지갑, 발행 절차에 대한 명확한 답변입니다.",
  whatQ: "TTTI-T란 무엇인가요?",
  whatA:
    "TTTI-T는 Internet Computer 기반 교환 화폐인 TTTI의 테스트 출시 버전입니다. 원장은 소수점 8자리를 사용하며, 이 테스트 출시에는 토큰 하나가 포함됩니다. 결제는 ICP, ckBTC, ckUSDC 또는 ckUSDT로 하며, 다음 질문에서 설명하는 민트 규칙을 따릅니다.",
  mintRuleQ: "민트 결제 금액은 어떻게 계산되나요?",
  noReturns: "어떠한 종류의 수익도 약속하지 않습니다.",
  icpQ: "ICP는 어떻게 구하나요?",
  icpBefore: "TTTI-T는 ICP로 발행합니다. 아직 ICP가 없다면 먼저 ",
  icpLink: "ICP 구하기",
  icpAfter:
    " 페이지에서 ICP를 구매해 지갑으로 보내는 믿을 수 있는 방법을 확인한 뒤, 돌아와서 발행하세요.",
  btcQ: "BTC로 결제할 수 있나요?",
  rateQ: "USD 환율은 어떻게 정해지나요?",
  walletsQ: "어떤 지갑을 지원하나요?",
  walletsA:
    "Internet Identity 또는 Plug 지갑으로 로그인할 수 있습니다. 두 방법 모두 통제권은 귀하에게 있습니다: 앱은 잔액을 읽기만 하고, 모든 전송은 귀하가 직접 서명합니다.",
  whereQ: "발행한 토큰은 어디에 표시되나요?",
  whereBefore: "발행한 TTTI-T는 로그인한 계정으로 지급됩니다. ",
  whereLink: "지갑 페이지",
  whereAfter:
    "의 TTTI-T 항목에 표시됩니다. 원하시면 발행 전에 선택 사항인 지급 주소(Principal ID)를 추가할 수 있습니다. 필수는 아닙니다.",
  supplyQ: "토큰은 최대 몇 개까지 존재할 수 있나요?",
  supplyIntro: "TTTI는 향후 버전이고, TTTI-T는 현재 진행 중인 테스트입니다.",
  liquidityQ: "유동성 풀은 어떻게 작동하나요?",
  liquidityA:
    "누구나 유동성을 공급하고 회수할 수 있습니다. 유동성 포지션은 공개되며 TTTI의 식별자에 연결됩니다. 프로토콜은 가격에 연동된 주문을 절대 내지 않으며 TTTI-T를 생성하지 않습니다. 영구 유동성은 깊이 관리입니다. 프로토콜 몫을 기계적이고 공개적으로 재조정하며, 가격을 조건으로 하지 않습니다. 관측된 수익, 즉 최근 30일 동안 실제로 지급된 수수료만 표시됩니다. 어떠한 수익도 약속하지 않습니다.",
  privacyQ: "무엇이 공개되며, 앱은 무엇을 보관하나요?",
  privacyA:
    "모든 구매와 전송은 사용된 토큰의 원장(ICP, ckBTC, ckUSDC, ckUSDT 또는 TTTI-T)에 공개적이고 영구적으로 기록됩니다. 누구나 금액, 계정, 시간을 볼 수 있습니다. Bitcoin 전송은 Bitcoin 체인에 공개되며, 누구나 그 거래 ID(txid), 주소, 금액을 볼 수 있습니다. 그 밖에 앱이 보관하는 것은 금액과 블록 번호가 포함된 귀하의 구매 기록, 지급 주소, 구매 약관에 동의한 날짜, 그리고 BTC 입금 추적 기록(입금 주소, txid 및 각 입금의 상태)뿐입니다.",
};

export default ko;
