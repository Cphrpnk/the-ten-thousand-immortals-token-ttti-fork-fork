import type en from "./en";

const ko: typeof en = {
  getIcpAria: "ICP 추가",
  getIcpAdd: "추가하세요",
  getIcpAddToBuy: "발행하려면 ICP를 추가하세요",
  getIcpBuyAria: "Onramper에서 ICP 구매 (주소를 복사하고 새 탭에서 열림)",
  getIcpBuy: "ICP 구매",
  getIcpCopyAria: "지갑 주소 복사",
  getIcpCopied: "주소가 복사되었습니다",
  getIcpCopyFailed: "복사 실패 — 주소를 클릭하세요",
  getIcpBalance: (amount: string) => `잔액: ${amount} ICP`,
  migrationTitle: (symbol: string) =>
    `출시 시 ${symbol}을(를) 마이그레이션해야 합니다`,
  migrationBody:
    "지갑 주소를 추가하면 자동으로 받을 수 있습니다. 주소 없이도 지금 구매할 수 있습니다.",
  migrationStep1Title: "지갑 만들기",
  migrationStep1Body: "Plug, NNS 또는 OISY를 열고 지갑을 만드세요.",
  migrationStep2Title: "올바른 Principal ID 복사",
  migrationStep2Body: "64자 account ID가 아닌 Principal ID를 복사하세요.",
  migrationStep3Title: "여기에 붙여넣기",
  migrationStep3Body: "아래 전달 주소 입력란에 붙여넣고 저장하세요.",
  opensNewTab: "(새 탭에서 열림)",
  migrationAdd: "주소 추가",
  migrationLater: "나중에",
  orderLegend: "주문 금액",
  orderAmountIn: (symbol: string) => `${symbol} 금액`,
  orderAmountTtti: "TTTI-T 수량",
  payWith: "결제 수단",
  unavailable: "사용 불가",
  maxSupply: "최대 공급량",
  totalSupply: "총 공급량",
  remaining: "남은 수량",
  supplyValueNote: "USD 환산은 TTTI-T 통합 가격(시간 평균)을 사용합니다.",
  complete: "종료",
  paused: "일시 중지",
  live: "진행 중",
  maxReached: "최대 공급량 도달",
  maxReachedBody: (max: string, symbol: string) =>
    `총 공급량이 최대 공급량인 ${max} ${symbol}에 도달했습니다. 구매가 마감되었습니다.`,
  salesPaused: "판매가 일시 중지되었습니다",
  pausedBody:
    "구매가 일시적으로 비활성화되었습니다. 잠시 후 다시 확인해 주세요.",
  totalSupplyPercent: (percent: string) => `총 공급량 ${percent}%`,
  progressAria: (percent: string) => `총 공급량: 최대 공급량의 ${percent}%`,
  reserved: (amount: string, symbol: string) =>
    `${amount} ${symbol}이(가) 진행 중인 구매로 예약되어 있습니다.`,
  never: "없음",
  noRate: (symbol: string) =>
    `이번 시간에 유효한 ${symbol}/USD 환율이 없습니다`,
  unavailableUntilRate: (symbol: string) =>
    `환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
  oneBuys: (symbol: string) => `1 ${symbol}(으)로 구매 가능`,
  source: "출처",
  fetched: "조회 시각",
  minimum: "최소",
  treasury: "재무 계정",
  notConfigured: "구성되지 않음",
  treasuryCopied: (symbol: string) => `재무 ${symbol} 계정이 복사되었습니다`,
  treasuryCopy: (symbol: string) => `재무 ${symbol} 계정 복사`,
  percentConnect: "바를 사용하려면 지갑을 연결하세요.",
  percentBalanceUnavailable: "잔액을 확인할 수 없습니다.",
  percentNotCover: (fees: string) =>
    `잔액이 ${fees}의 네트워크 수수료에 미치지 못합니다.`,
  percentShare: (symbol: string) => `지갑 ${symbol} 잔액 비율`,
  percentSummary: (percent: string, amount: string, ttti: string) =>
    `${percent}% = ${amount} · ${ttti} TTTI-T 수령`,
  percentComputedOn: (fees: string) =>
    `잔액에서 네트워크 수수료 ${fees}을(를) 뺀 금액 기준으로 계산됩니다.`,
};

export default ko;
