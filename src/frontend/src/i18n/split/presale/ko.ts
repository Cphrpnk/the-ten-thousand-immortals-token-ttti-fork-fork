import mintRule from "../mintRule/ko";
import type en from "./en";

const ko: typeof en = {
  label: "테스트 출시",
  intro:
    "이것은 테스트 출시입니다: 토큰 하나, TTTI-T, 총 10,000 USD, 1 USD부터. 향후 모든 TTTI와 같은 가격입니다: 할인 없음, 보너스 없음, 혜택 없음. 정식 출시가 이루어지면 TTTI-T는 1:1로 TTTI로 전환됩니다. 정식 출시는 끝내 이루어지지 않을 수도 있습니다.",
  errorText: "실시간 할당 수치를 일시적으로 사용할 수 없습니다.",
  retry: "다시 시도",
  statusComplete: "할당 완료",
  statusPaused: "구매 일시 중지",
  statusCurrent: "현재 할당",
  pricePerToken: "TTTI-T당 가격 (수수료 제외)",
  totalSupply: "총 공급량",
  remaining: "남은 수량",
  progressAria: (percent: string) => `총 공급량: 최대 공급량의 ${percent}%`,
  totalSupplyLine: (
    total: string,
    max: string,
    symbol: string,
    percent: string,
  ) => `총 공급량: ${total} / ${max} ${symbol} (${percent}%)`,
  disclosuresTitle: "창작자 고지",
  disclosure1: `${mintRule.all} 거절된 페어 요청의 보증금은 토큰(TTTI-T 포함)과 관계없이 따로 보관되는 영구 유동성으로 들어갑니다. 창작자의 보유량은 공시되며 공개됩니다. 창작자를 위해 보유된 금액은 토큰별로 Pools 페이지에 표시됩니다. 창작자는 가격을 방어하지 않고 거래량을 만들기 위해 거래하지 않습니다. 창작자를 포함한 누구나 자신의 재량으로 유동성을 공급할 수 있으며 잠금 규칙에 따라 회수할 수 있습니다. 직접 확인할 수 있는 것만 신뢰하세요.`,
  disclosure2:
    "TTTI와 THAT은 창작자가 같습니다. TTTI는 THAT과 아무 관련이 없습니다: THAT으로 교환할 수 없고, THAT 안에서 사용할 수 없으며, 다른 어떤 것으로도 전환할 수 없습니다.",
};

export default ko;
