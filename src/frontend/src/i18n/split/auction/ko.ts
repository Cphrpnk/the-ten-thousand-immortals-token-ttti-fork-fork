import type en from "./en";

const ko: typeof en = {
  title: "경매",
  intro:
    "반환된 TTTI-T의 밀봉 입찰 경매입니다. 입찰은 확정적이며 작성자 외에는 누구에게도 공개되지 않습니다. 각 입찰자는 자신의 입찰가를 지불합니다. 가장 높은 입찰가부터 가격순으로 낙찰되며, 로트가 모두 판매될 때까지 이어집니다.",
  loading: "경매를 불러오는 중…",
  loadError: "경매를 불러오지 못했습니다.",
  retryButton: "다시 시도",
  summaryTitle: "진행 중인 경매",
  lotSize: "로트 크기",
  closesAt: "마감 시각",
  timeLeft: "남은 시간",
  closingReached: "마감 시각이 되었습니다.",
  reserveHeading: "최저 가격",
  reserveUsd: "TTTI-T당 현재 최저 가격",
  reserveEquivalents: "현재 환율 기준 각 결제 토큰으로 환산한 TTTI-T당 금액",
  reserveRule:
    "최저 가격은 TTTI-T당 10,000 USD, TTTI-T 통합 가격의 24시간 평균, TTTI-T의 현재 통합 가격 중 가장 높은 값입니다. 그 아래의 입찰은 통과하지 못하며 10,000 USD 미만으로는 아무것도 재발행되지 않습니다. 해당 물량은 컨트랙트에 남습니다.",
  componentsHeading: "비교하는 값",
  floorLabel: "TTTI-T당 고정 하한",
  dailyAverageLabel: "통합 가격의 24시간 평균",
  currentLabel: "현재 통합 가격",
  appliedBadge: "적용됨",
  bindingFloor: "고정 하한이 가장 높은 값이며 최저 가격을 정합니다.",
  bindingDailyAverage: "24시간 평균이 가장 높은 값이며 최저 가격을 정합니다.",
  bindingConsolidated:
    "현재 통합 가격이 가장 높은 값이며 최저 가격을 정합니다.",
  unavailableNote: "사용할 수 없는 값은 비교에서 제외됩니다.",
  reserveSettlementNote:
    "최저 가격의 시장 부분은 정산 시 낙찰자를 풀에 모으면서 생기는 가격 변동을 반영하지 않습니다.",
  rateUnavailable: "현재 환율 없음",
  consolidatedLabel: "TTTI-T 통합 가격",
  consolidatedUnavailable: "사용할 수 없음",
  reserveBadge: "공동 준비금",
  reserveSentence:
    "각 낙찰자 예치금 중 10,000 USD × q는 공동 준비금으로 들어갑니다.",
  emptyTitle: "진행 중인 경매가 없습니다",
  emptyBody:
    "경매는 24시간 동안 진행됩니다. 반환된 TTTI-T가 로트에서 대기 중일 때 경매를 열 수 있습니다.",
  nextLot: "다음 로트",
  nextLotNone: "로트에서 대기 중인 반환된 TTTI-T가 없습니다.",
  openButton: "경매 열기",
  openingButton: "여는 중…",
  openErrorAlreadyOpen: "이미 경매가 열려 있습니다.",
  openErrorEmptyLot: "로트로 만들 반환된 TTTI-T가 없습니다.",
  openErrorPaused: "경매가 일시 중지되었습니다.",
  openErrorUnexpected: "경매를 열지 못했습니다. 다시 시도하십시오.",
  formTitle: "입찰하기",
  formIntro:
    "입찰은 확정적이어서 철회하거나 수정할 수 없습니다. 입찰 시 예치금 전액이 인출됩니다.",
  tokenLegend: "결제 토큰",
  quantityLabel: "수량 (TTTI-T)",
  quantityHint: (minimum: string) =>
    `최소 ${minimum} TTTI-T, 소수점 8자리까지.`,
  priceLabel: (symbol: string) => `TTTI-T당 가격 (${symbol})`,
  priceHint: "선택한 토큰으로 표시한 TTTI-T 1개의 가격입니다.",
  depositLabel: (symbol: string) => `예치금 (${symbol}, 선택)`,
  depositHint:
    "비워 두면 필요한 금액을 예치합니다. 필요한 금액보다 많이 예치하면 예산 규모가 드러나지 않습니다.",
  requiredDepositLabel: "필요 예치금",
  requiredDepositFormula: "(가격 + 10,000 USD) × 수량 ÷ 0.99, 올림",
  splitHeading:
    "가격 B로 q TTTI-T를 낙찰받은 사람의 예치금 배분 (잠금 비율 m, 나머지 선택 A 또는 B)",
  splitReserve: "공동 준비금 (10,000 USD × q)",
  splitPosition: "가격 B의 낙찰자 포지션(zap)",
  splitCreator: "제작자 (지불 금액의 1 %)",
  splitShare: "잠금 비율 m",
  splitLocked: "잠금 부분 (3개월)",
  splitHand: "지갑으로 전달되는 TTTI-T",
  splitChoicePayment: (choice: string) => `현재 m 기준 선택 ${choice}의 결제액`,
  splitShareNote:
    "m은 정산 시점에 적용됩니다. 이 견적 이후 바뀌면 정산 시점의 값이 적용됩니다.",
  reserveKeptNote: "준비금 부분은 지불한 토큰 그대로 보관됩니다.",
  depositSentLabel: "전송된 예치금",
  requiredDepositPending: "수량과 가격을 입력하십시오.",
  errQuantity: "소수점 8자리 이하의 수량을 입력하십시오.",
  errQuantityMin: (minimum: string) => `최소 수량은 ${minimum} TTTI-T입니다.`,
  errPrice: (decimals: string) =>
    `0보다 크고 소수점 ${decimals}자리 이하인 가격을 입력하십시오.`,
  errDeposit: (decimals: string) =>
    `소수점 ${decimals}자리 이하의 예치금을 입력하십시오.`,
  errDepositBelow: (required: string) =>
    `예치금은 필요 예치금(${required})보다 적을 수 없습니다.`,
  submitButton: "입찰하기",
  approvingButton: "서명 대기 중…",
  sendingButton: "입찰 전송 중…",
  successMessage: "입찰이 기록되었습니다.",
  approvalFailed: (detail: string) => `승인에 서명하지 않았습니다: ${detail}`,
  unexpectedError: "입찰을 전송하지 못했습니다. 다시 시도하십시오.",
  signInPrompt: "입찰하려면 로그인하십시오.",
  blockSaleLabel: "판매 방식",
  blockSaleValue: "일괄 판매",
  blockSaleBadge: "일괄 판매",
  blockSaleRule:
    "이 로트는 일괄 판매입니다. TTTI-T당 가장 높은 가격이 로트 전체를 가져갑니다. 동일한 최저 가격이 적용되며, 그보다 낮은 입찰은 통과하지 않습니다.",
  blockQuantityLabel: "수량(로트 전체, TTTI-T)",
  blockQuantityHint: (lot: string) =>
    `수량은 로트 전체인 ${lot} TTTI-T입니다. 변경할 수 없습니다.`,
  blockPriceHint:
    "로트 전체에 대해 TTTI-T당 하나의 가격을 입력합니다. 가장 높은 가격이 로트 전체를 가져갑니다.",
  bidErrWholeLot: (lot: string) =>
    `이 로트는 일괄 판매입니다. 입찰은 로트 전체(${lot} TTTI-T)에 대해서만 가능합니다.`,
  lotRemainderLabel: "로트에 포함된 발행 잔량",
  lotRemainderNote:
    "발행 잔량은 로트에 포함됩니다. 정산 시에만 낙찰자를 위해 발행됩니다.",
  settleMinted: "정산 시 발행된 TTTI-T",
  outcomeMinted: (amount: string) => `정산 시 발행: ${amount} TTTI-T`,
  mintEndedBadge: "발행 종료",
  mintEndedTitle: "발행이 종료되었습니다",
  mintEndedBody: (remainder: string) =>
    `잔량 ${remainder} TTTI-T는 첫 번째 경매 로트에 합류합니다. 정산 시에만 낙찰자를 위해 발행됩니다.`,
  mintErrEnded:
    "발행이 종료되었습니다. 잔량은 첫 번째 경매 로트에 합류하며 정산 시에만 낙찰자를 위해 발행됩니다.",
  bidErrTooMany: (maximum: string) =>
    `1인당 최대 ${maximum}건의 입찰 한도에 도달했습니다.`,
  bidErrInsufficientFunds: (balance: string, required: string) =>
    `잔액 부족: 잔액 ${balance}, 필요 ${required}.`,
  bidErrQuantityBelow: (minimum: string) =>
    `수량이 최소 ${minimum} TTTI-T보다 적습니다.`,
  bidErrInvalidPrice: "가격은 0보다 커야 합니다.",
  bidErrAnonymous: "입찰하려면 로그인하십시오.",
  bidErrLedger: (detail: string) => `원장 오류: ${detail}`,
  bidErrAllowance: (required: string, allowance: string) =>
    `승인 금액이 부족합니다: 필요 ${required}, 승인 ${allowance}.`,
  bidErrRateUnavailable: (symbol: string) =>
    `현재 유효한 ${symbol}/USD 환율이 없습니다. 입찰이 접수되지 않았습니다. 나중에 다시 시도하십시오.`,
  bidErrNoOpen: "진행 중인 경매가 없습니다.",
  bidErrInProgress: "다른 입찰이 처리 중입니다.",
  bidErrDepositBelow: (deposited: string, required: string) =>
    `예치금(${deposited})이 필요 예치금(${required})보다 적습니다.`,
  bidErrPaused: "입찰이 일시 중지되었습니다.",
  bidErrPriceBelowMinimum: (minimum: string) =>
    `가격이 현재 환율 기준 TTTI-T당 최소 ${minimum}보다 낮습니다.`,
  bidErrPriceBelowMinimumBid: (minimum: string, bid: string) =>
    `제시한 가격(TTTI-T당 ${bid})이 현재 환율 기준 TTTI-T당 최소 ${minimum}보다 낮습니다.`,
  bidErrDepositBelowFee: (fee: string, deposited: string) =>
    `예치금(${deposited})은 최소한 원장 수수료(${fee})를 충당해야 합니다.`,
  priceMinimumHint: (minimum: string) =>
    `최소 가격: 현재 환율 기준 TTTI-T당 ${minimum}.`,
  myOffersTitle: "내 입찰",
  privacyNote: "입찰은 작성자에게만 보입니다.",
  firmNote: "입찰은 확정적입니다. 이 목록은 읽기 전용입니다.",
  offerCount: (used: string, maximum: string) => `${used} / ${maximum}`,
  myOffersEmpty: "이 경매에 입찰한 내역이 없습니다.",
  colQuantity: "수량 (TTTI-T)",
  colPrice: "TTTI-T당 가격",
  colToken: "토큰",
  colDeposit: "예치금",
  colDate: "날짜",
  closingPendingNotice:
    "마감 시각이 지났습니다. 마감은 유효한 환율을 기다리고 있습니다. 다른 사람의 입찰은 마감 때까지 공개되지 않습니다.",
  closedTitle: "마감된 경매",
  closedIntro: "최신 순입니다. 마감 후 결과와 모든 입찰이 공개됩니다.",
  closedEmpty: "아직 마감된 경매가 없습니다.",
  closedItemLabel: (id: string, date: string) => `경매 ${id} · ${date} 마감`,
  resultNotPublished: "결과가 아직 공개되지 않았습니다.",
  resultStatusLabel: "상태",
  statusFullySold: "전량 판매",
  statusPartiallySold: "일부 판매",
  statusUnsold: "미판매",
  resultServedLabel: "체결 수량",
  resultCarriedLabel: "다음 로트로 이월된 수량",
  resultOffersLabel: "접수된 입찰",
  resultClosedAtLabel: "마감 시각",
  resultReserveHeading: "적용된 최저 가격",
  resultReserveLabel: "TTTI-T당 적용된 최저 가격",
  resultRatesHeading: "마감 시 사용한 환율",
  offersHeading: "공개된 입찰",
  offersEmpty: "이 경매에는 입찰이 없었습니다.",
  colBidder: "입찰자",
  colOutcome: "결과",
  colServed: "체결 수량",
  colReturned: "반환 금액",
  colAuction: "경매",
  youBadge: "본인",
  outcomeServed: "체결",
  outcomePartiallyServed: "일부 체결",
  outcomeNotServed: "미체결",
  outcomeDiscarded: "최저 가격 미만으로 제외",
  outcomePending: "마감 대기 중",
  outcomeDetail: (served: string, returned: string) =>
    `체결 ${served} TTTI-T · 반환 ${returned}`,
  outcomeReturnedOnly: (returned: string) => `반환 ${returned}`,
  balanceTitle: "내 잔액",
  balanceNote:
    "체결된 수량의 예치금은 정산 대기 중입니다. 체결되지 않은 입찰, 체결되지 않은 부분, 초과 예치금, 정산에 실패한 예치금은 DEX 잔액으로 반환됩니다.",
  balanceEmpty: "내 계정에 기록된 금액이 없습니다.",
  colAwaiting: "정산 대기",
  colReturnedBalance: "잔액으로 반환",
  balanceRecoverNote:
    "반환된 금액은 DEX 잔액에 있습니다. 그곳의 되찾기 버튼으로 인출하세요. 낙찰자의 준비금 부분은 공동 준비금에 남습니다.",
  balanceRecoverLink: "DEX 잔액 열기",
  balanceFailedNote: (count: string) =>
    `낙찰된 입찰 ${count}건의 정산이 실패했습니다. 예치금 전액이 DEX 잔액으로 반환되었고 해당 수량은 다음 로트로 이월되었습니다.`,
  colSettlement: "정산",
  settlementPending: "대기",
  settlementSettled: "정산 완료",
  settlementFailed: "실패",
  settlementNotRequired: "해당 없음",
  settlementFailedCarried: (carried: string) =>
    `${carried} TTTI-T 다음 로트로 이월`,
  settlementSummaryLabel: "낙찰자 정산",
  settlementSummary: (settled: string, pending: string, failed: string) =>
    `정산 완료 ${settled} · 대기 ${pending} · 실패 ${failed}`,
  settlementFailedCarriedLabel: "정산 실패 후 다음 로트로 이월된 수량",
  settlementHeading: "낙찰자 정산",
  settlementRule:
    "가격 B로 체결된 수량 q에 대해 낙찰자는 (B + 10,000 USD) × q ÷ 0.99를 지불하며, 이 금액은 예치금에서 차감됩니다. 10,000 USD × q는 공동 준비금으로, B × q와 q TTTI-T는 낙찰자의 포지션(zap)으로, 지불 금액의 1 %는 제작자에게 지급됩니다. 준비금 부분은 USD로 산정되며 지불한 토큰(ICP, ckBTC, ckUSDC 또는 ckUSDT) 그대로 환전 없이 보관됩니다. 예치금의 나머지는 DEX 잔액으로 반환됩니다. 낙찰자의 정산이 실패하면 포지션은 생성되지 않고 공동 준비금에도 아무것도 납입되지 않으며, 예치금 전액이 DEX 잔액으로 반환되고 해당 수량은 다음 로트로 이월됩니다. 다른 낙찰자는 영향을 받지 않습니다.",
  settleTaken: "예치금에서 차감된 금액",
  settleCreator: "제작자 몫 (1 %)",
  settlePosition: "포지션",
  settlePositionValue: (amount: string, quantity: string) =>
    `${amount}, ${quantity} TTTI-T 포함`,
  settleReserve: "공동 준비금",
  settleSurplus: "DEX 잔액으로 반환된 예치금 잔여분",
  settleNoPosition: "포지션 및 준비금 몫",
  settleNone: "없음",
  settleDepositReturned: "예치금 전액 DEX 잔액으로 반환",
  settleCarried: "다음 로트로 이월된 수량",
  settleFailureReason: "사유",
};

export default ko;
