import type en from "./en";

const ko: typeof en = {
  title: "상환",
  ruleSummary: "1 TTTI-T는 최대 10,000 USD로 상환되며 수수료가 없습니다.",
  rulePayout:
    "지급액은 다음 둘 중 더 작은 값입니다: 10,000 USD × x, 그리고 준비금 ÷ 컨트랙트 밖에서 유통되는 TTTI-T × x. 여기서 x는 상환하는 TTTI-T입니다.",
  rulePayment:
    "금액은 준비금의 구성 비율에 따라 ICP, ckBTC, ckUSDC, ckUSDT로 지급됩니다. 상환은 컨트랙트 밖에서 유통되는 TTTI-T를 초과할 수 없습니다.",
  ruleAnyHolder:
    "준비금은 모든 보유자가 공동으로 사용합니다. 민트한 적이 없는 보유자를 포함해 모든 보유자가 상환할 수 있습니다.",
  ruleMintLock:
    "민트 시 TTTI-T의 가변 비율 m은 풀에 넣어지고 민트한 사람의 이름으로 잠깁니다. 릴레이가 늦어도 3개월 후에 이를 해제합니다.",
  ruleMintChoice:
    "결제 전에 민트하는 사람은 나머지 (1 − m)를 풀에 넣을지(선택 A) 지갑에 보관할지(선택 B) 선택합니다.",
  ruleMintReserve:
    "선택과 관계없이 공동 준비금은 민트된 TTTI-T당 10,000 USD를 받습니다. 이 금액은 USD로 산정되며 지불한 토큰(ICP, ckBTC, ckUSDC 또는 ckUSDT) 그대로 환전 없이 보관됩니다.",
  redeemHeldNote:
    "보유한 모든 TTTI-T는 공동 준비금에서 최대 10,000 USD로 상환할 수 있으며, 선택 B에 따라 지갑에 보관한 TTTI-T도 포함됩니다.",
  signInPrompt: "TTTI-T를 상환하려면 로그인하세요.",
  loadError: "상환 내역을 불러오지 못했습니다.",
  retryButton: "다시 시도",
  reserveTitle: "준비금",
  reserveLoading: "준비금을 불러오는 중…",
  reserveLoadError: "준비금을 불러오지 못했습니다.",
  reserveTotalLabel: "준비금 (USD)",
  reserveTokenLabel: (symbol: string) => `${symbol} 준비금`,
  circulationLabel: "컨트랙트 밖에서 유통되는 TTTI-T",
  reservePerTtiLabel: "TTTI-T당 준비금",
  reservePerTtttiNone: "유통 중인 TTTI-T 없음",
  requiredLabel: "필요 금액 (10,000 USD × 유통량)",
  invariantLabel: "불변 조건",
  invariantHolds: "준비금이 필요 금액 이상입니다",
  invariantBroken: "준비금이 필요 금액보다 적습니다",
  shortfallLabel: "부족분",
  shortfallNone: "없음",
  reserveRateMissing: (symbol: string) => `${symbol} 환율 없음`,
  redeemTitle: "상환",
  redeemIntro:
    "공동 준비금을 상대로 TTTI-T를 반환합니다. 서명하기 전에 미리보기에서 정확한 수령 금액을 확인할 수 있습니다.",
  amountLabel: "상환할 TTTI-T",
  amountPlaceholder: "0.0",
  maxButton: "최대",
  amountInvalid: "0보다 큰 금액을 입력하세요.",
  redeemButton: "상환",
  redeemingButton: "상환 중…",
  previewTitle: "미리보기",
  previewLoading: "계산 중…",
  previewCap: "10,000 USD × x",
  previewReserveShare: "준비금 ÷ 컨트랙트 밖의 유통량 × x",
  previewPaidIn: (symbol: string) => `${symbol}(으)로 지급`,
  previewCirculation: "컨트랙트 밖에서 유통되는 TTTI-T",
  previewNet: "수령액 (둘 중 더 작은 값)",
  previewUsdNote: "USD 값은 이 미리보기의 환율을 사용합니다.",
  previewLedgerFeeNote: "지급의 원장 수수료는 수령액에서 차감되지 않습니다.",
  returnedTttiNote:
    "반환된 TTTI-T는 컨트랙트가 보관하며 컨트랙트 밖의 유통량에서 제외됩니다. 소각되지 않습니다.",
  allowanceTitle: "TTTI-T 승인",
  allowanceExplain: (amount: string, fee: string, required: string) =>
    `TTTI-T를 반환하려면 반환 수량에 TTTI-T 원장 수수료를 더한 금액에 대한 ICRC-2 승인이 필요합니다: ${amount} + ${fee} = ${required}.`,
  allowanceCurrent: (allowance: string) => `현재 승인: ${allowance}`,
  allowanceOk: "현재 승인으로 이 상환을 처리할 수 있습니다.",
  allowanceMissing: "현재 승인이 부족합니다. 상환 전에 승인이 요청됩니다.",
  approvingButton: "승인 중…",
  allowanceExpiryNote:
    "승인에는 항상 만료 시점이 있습니다. 확인하기 전에 지갑에서 금액과 날짜를 확인하세요.",
  historyTitle: "내 상환 내역",
  historyEmpty: "아직 상환 내역이 없습니다.",
  statusCompleted: "완료",
  statusInProgress: "진행 중",
  statusNeedsReview: "확인 필요",
  statusFailed: "실패",
  historyReturned: "반환된 TTTI-T",
  historyNet: "수령액",
  historyPullBlock: "TTTI-T 블록",
  historyPayoutBlock: "지급 블록",
  resultCompleted: (net: string) => `완료되었습니다. ${net}을(를) 받았습니다.`,
  resultInProgress: "지급이 진행 중입니다. 완료되면 아래 목록에 표시됩니다.",
  resultNeedsReview:
    "지급 확인이 필요합니다. 상태와 함께 아래 목록에 남아 있습니다.",
  resultFailed: "지급이 완료되지 않았습니다.",
  errAnonymous: "상환하려면 로그인하세요.",
  errSalesPaused: "상환이 일시 중지되었습니다.",
  errAmountTooSmall: "금액이 너무 작아 지급할 수 없습니다. 상환할 수 없습니다.",
  errAmountExceedsCirculation: (requested: string, circulation: string) =>
    `금액 ${requested}이(가) 컨트랙트 밖에서 유통되는 TTTI-T ${circulation}을(를) 초과합니다.`,
  errReserveEmpty: "준비금이 비어 있습니다. 상환할 수 없습니다.",
  errRateUnavailable: (symbol: string) =>
    `현재 ${symbol}의 환율을 사용할 수 없습니다. 나중에 다시 시도하세요.`,
  errLedgerFeeNotCovered: (symbol: string, fee: string) =>
    `금액이 지급의 ${symbol} 원장 수수료(${fee})를 충당하지 못합니다. 상환할 수 없습니다.`,
  errTttiBalance: (balance: string, required: string) =>
    `TTTI-T 잔액은 ${balance}이며 ${required}이(가) 필요합니다.`,
  errAllowance: (allowance: string, required: string) =>
    `TTTI-T 승인은 ${allowance}이며 ${required}이(가) 필요합니다.`,
  errSlippage: (payout: string, expected: string) =>
    `수령액이 ${payout}(으)로, 미리보기의 ${expected}보다 낮아집니다. 미리보기를 새로 고친 후 다시 시도하세요.`,
  errRedemptionInProgress: "이미 진행 중인 상환이 있습니다.",
  errNothingToConvert: "이 작업에는 전환할 항목이 없습니다.",
  errConversionFailed: (detail: string) => `전환에 실패했습니다: ${detail}`,
  errPullFailed: (detail: string) => `TTTI-T를 수령하지 못했습니다: ${detail}`,
  errCallFailed: (detail: string) => `요청에 실패했습니다: ${detail}`,
  errInvalidAmount: "올바른 금액을 입력하세요.",
  errAcknowledgementRequired:
    "상환하기 전에 지갑 약관에 동의해야 합니다. 동의 단계를 열어 약관에 동의한 뒤 다시 상환하세요.",
  acceptanceChecking: "지갑 약관을 확인하는 중…",
  acceptanceMissing:
    "이 계정은 지갑 약관에 동의하지 않았습니다. 상환하기 전에 동의해야 합니다.",
  openAcceptanceButton: "지갑 약관 확인 및 동의",
  percentShare: "상환 가능 금액의 비율",
  percentComputedOn:
    "상환 가능 금액 기준: 보유한 TTTI-T와 컨트랙트 밖에서 유통되는 TTTI-T 중 더 작은 값.",
  balanceNone: "이 지갑에는 상환할 수 있는 TTTI-T가 없습니다.",
  heldLabel: "보유한 TTTI-T",
  limitedByBalance: (held: string, max: string) =>
    `보유한 TTTI-T(${held})로 인해 금액이 ${max}(으)로 제한됩니다.`,
  limitedByCirculation: (circulation: string, max: string) =>
    `컨트랙트 밖에서 유통되는 TTTI-T(${circulation})로 인해 금액이 ${max}(으)로 제한됩니다.`,
  confirmTitle: "상환 확인",
  confirmIntro:
    "컨트랙트에 대한 TTTI-T ICRC-2 승인에 서명하면, 컨트랙트가 TTTI-T를 가져가고 표시된 금액을 준비금의 토큰(ICP, ckBTC, ckUSDC, ckUSDT)으로 지급합니다.",
  confirmExpiry: "승인은 15분 후에 만료됩니다.",
  closeButton: "닫기",
  cancelButton: "취소",
  resultTitle: "결과",
};

export default ko;
