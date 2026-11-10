import type en from "./en";

const ko: typeof en = {
  fallbackMessage:
    "이 대상에 대한 구매를 완료할 수 없습니다. 수령인을 확인한 후 다시 시도하세요.",
  server: (server: string) => server,
  reference: (id: string) => ` 참조: 구매 #${id}.`,
  contactTeam: " 이 참조 번호로 팀에 문의하세요.",
  refundedTitle: (symbol: string, fee: string) =>
    `전달 실패 — ${fee} 수수료를 제외한 ${symbol}이(가) 환불되었습니다`,
  refundFailed: "전달에 실패했으며 자동 환불도 실패했습니다",
  refundedMessage: () =>
    "TTTI-T 전달에 실패했습니다. 원장 수수료를 제외한 결제 금액이 환불되었습니다.",
  refundFailedMessage: () =>
    "TTTI-T 전달에 실패했으며 환불도 실패했습니다. 이 구매는 수동 후속 조치가 필요합니다.",
  salesPausedTitle: "판매가 일시 중지되었습니다",
  salesPausedMessage: () => "구매가 일시적으로 비활성화되었습니다.",
  saleCompleteTitle: "판매 종료",
  saleCompleteMessage: () =>
    "TTTI-T 판매가 종료되었습니다. 판매할 TTTI-T가 남아 있지 않습니다.",
  belowMinimumTitle: "최소 구매량 미만",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    requested: string,
  ) =>
    `최소량은 ${minimum} ${display} (${symbol} 기준 ${minimumUsd})이며, 요청하신 수량은 ${requested} ${display}입니다.`,
  aboveRemainingTitle: "남은 수량 초과",
  aboveRemainingMessage: (
    maximum: string,
    display: string,
    maximumPay: string,
    requested: string,
  ) =>
    `구매 가능한 최대량은 ${maximum} ${display} (${maximumPay})이며, 요청하신 수량은 ${requested} ${display}입니다.`,
  priceUnavailableTitle: (symbol: string) =>
    `구매 거부: 유효한 ${symbol}/USD 환율이 설정되어 있지 않습니다`,
  priceUnavailableMessage: (symbol: string) =>
    `${symbol}은(는) 전혀 차감되지 않았습니다. 환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
  notConfiguredTitle: (symbol: string) =>
    `${symbol}이(가) 구성되어 있지 않습니다`,
  notConfiguredMessage: (symbol: string) =>
    `판매가 아직 구성되지 않았습니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
  ledgerMismatchTitle: (symbol: string) => `${symbol} 원장 불일치`,
  ledgerMismatchMessage: (
    symbol: string,
    actualDecimals: string,
    actualFee: string,
    expectedDecimals: string,
    expectedFee: string,
  ) =>
    `${symbol} 원장이 소수점 ${actualDecimals}자리와 수수료 ${actualFee}을(를) 보고했습니다. 예상 값은 소수점 ${expectedDecimals}자리와 ${expectedFee}입니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
  ackRequiredTitle: "구매 확인 필요",
  ackRequiredMessage: (symbol: string) =>
    `이 계정은 여섯 가지 구매 확인을 수락하지 않았습니다. ${symbol}은(는) 전혀 차감되지 않았습니다.`,
  invalidAmountTitle: "잘못된 금액",
  invalidAmountMessage: () =>
    "이 금액 또는 이 전달 계정은 허용될 수 없습니다. 아무것도 차감되지 않았습니다.",
  insufficientTitle: (symbol: string) => `${symbol} 잔액 부족`,
  insufficientMessage: (_server: string, balance: string) =>
    `잔액이 이 구매 금액에 미치지 못합니다. 잔액: ${balance}.`,
  approvalMissingTitle: (symbol: string) => `${symbol} 승인 없음`,
  approvalMissingMessage: (_server: string, allowance: string) =>
    `승인 한도가 이 구매 금액에 미치지 못합니다. 현재 승인 한도: ${allowance}.`,
  inProgressTitle: "이미 진행 중인 구매",
  inProgressMessage: (symbol: string) =>
    `이 계정에 대해 이미 진행 중인 구매가 있습니다. 완료될 때까지 기다린 후 다시 시도하세요. 이 요청에 대해 ${symbol}은(는) 전혀 차감되지 않았습니다.`,
  ledgerErrorTitle: (symbol: string) => `${symbol} 원장 오류`,
  ledgerErrorMessage: () =>
    "원장에 연결할 수 없거나 작업이 실패했습니다. 다시 시도하세요.",
  signInTitle: "발행하려면 로그인하세요",
  signInMessage: () => "TTTI-T를 발행하려면 로그인하세요.",
  notCompletedTitle: "구매가 완료되지 않았습니다",
  failedTitle: "구매 실패",
};

export default ko;
