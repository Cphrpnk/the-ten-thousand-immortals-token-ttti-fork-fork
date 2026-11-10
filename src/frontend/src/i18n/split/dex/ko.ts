import type en from "./en";

const ko: typeof en = {
  title: "풀",
  intro:
    "이 컨트랙트가 보유한 상수곱 풀입니다. 각 페어에는 수수료 등급과 고유한 풀 하위 계정이 있습니다.",
  statusFilling: "채우는 중",
  statusActive: "활성",
  statusRemoved: "제거됨",
  newPairBadge: "새 페어",
  approvalNotRecommendation: "페어 승인은 추천이 아닙니다.",
  tttiPair: "TTTI-T 페어",
  utilityPair: "유틸리티 페어",
  feeTier: "수수료 등급",
  feeTierBps5: "0.05%",
  feeTierBps30: "0.3%",
  feeTierBps100: "1%",
  poolSubaccount: "풀 하위 계정",
  minimumLocked: "최소 잠금 유동성",
  minimumTttiSide: (amount: string) => `TTTI-T 쪽 ${amount} TTTI-T`,
  minimumPerToken: "토큰별 최소값, 관리자가 설정",
  minimumNotSet: "아직 설정되지 않음",
  firstDepositRule: "빈 풀의 첫 예치에는 최소값이 없습니다.",
  launchDepthRule: (amount: string) =>
    `TTTI-T 페어는 풀 내 TTTI-T가 ${amount} USD(풀 가격 기준 TTTI-T 쪽 가치로, 오라클 환율 기준 다른 쪽 가치와 같음)에 도달하면, 유틸리티 페어는 깊이가 ${amount} USD(시간별 환율로 양쪽 합산)에 도달하면 스왑이 열립니다. 이 임계값 미만에서는 풀이 채우는 중 상태로 유지되며, 풀 생성, 예치, 유동성 추가, 구매, 민트는 계속 가능하고 스왑만 닫힙니다.`,
  lockedSharesRule:
    "최소 잠금 지분은 첫 예치 시 √(A×B)로 계산되며 영구적으로 컨트랙트에 귀속됩니다.",
  removedNotice:
    "이 페어는 제거되었습니다. 모든 포지션이 청산되었습니다. 스왑과 추가는 닫혀 있습니다.",
  protocolStatement:
    "프로토콜은 가격과 연동된 주문을 절대 하지 않으며 풀을 위해 TTTI-T를 생성하지 않습니다. 영구 유동성은 깊이 관리입니다. 프로토콜 몫을 기계적이고 공개적으로 재조정하며, 가격을 조건으로 하지 않습니다. 스왑 수수료 중 프로토콜 몫은 3분의 2가 생성자에게, 3분의 1이 아무도 인출할 수 없는 영구 유동성에 배분됩니다.",
  loading: "풀을 불러오는 중…",
  loadError: "풀을 불러올 수 없습니다.",
  requestTitle: "페어 요청",
  ledgerId: "원장 ID",
  ledgerIdPlaceholder: "원장 캐니스터 ID",
  ledgerIdInvalid: "올바른 원장 캐니스터 ID를 입력하십시오.",
  counterToken: "상대 토큰",
  counterTokenPlaceholder: "토큰 선택",
  message: "메시지",
  messageMax: (max: string) => `최대 ${max}자.`,
  deposit: (amount: string) => `보증금: ${amount}`,
  depositApproval: (amount: string, margin: string) =>
    `요청 전에 컨트랙트에 최대 ${amount}를 승인합니다. 보증금, 환율 변동에 대한 ${margin} 여유분, 원장 수수료가 포함됩니다. 정확한 보증금만 징수됩니다. 승인은 15분 후 만료됩니다.`,
  depositRule: (usd: string, ttti: string) =>
    `보증금은 약 ${usd}이며, 현재 시간별 환율 기준으로 민트 가격의 ${ttti} TTTI-T에 해당합니다. 요청이 승인되면 결제한 토큰으로 반환됩니다. 거절되면 보관되어 영구 유동성 준비금에 편입됩니다.`,
  payToken: "보증금 토큰",
  depositRateUnavailable: (symbol: string) =>
    `${symbol} 환율을 사용할 수 없어 보증금을 계산할 수 없습니다.`,
  depositApprovedNote: "보증금은 결제한 토큰으로 반환됩니다.",
  depositRefusedNote: "보증금은 보관되어 영구 유동성 준비금에 편입됩니다.",
  errPayTokenNotAccepted: (symbol: string) =>
    `${symbol}는 보증금으로 받지 않습니다.`,
  errDepositRateUnavailable: (symbol: string) =>
    `${symbol} 환율을 사용할 수 없거나 만료되었습니다. 나중에 다시 시도하거나 다른 토큰을 선택하세요.`,
  errRequestInProgress:
    "계정의 요청이 이미 처리 중입니다. 잠시 후 다시 시도하세요.",
  approving: "승인 중…",
  submit: "요청 제출",
  submitting: "제출 중…",
  submitted: "요청이 제출되었습니다.",
  signInNeeded: "페어를 요청하려면 로그인하십시오.",
  requestsTitle: "요청",
  myRequestsTitle: "내 요청",
  noRequests: "페어 요청이 없습니다.",
  requestStatusPending: "대기 중",
  requestStatusApproved: "승인됨",
  requestStatusRefused: "거절됨",
  refusedReason: (reason: string) => `사유: ${reason}`,
  copiedSymbol: "복제된 심볼",
  copiedSymbolOf: (symbol: string) => `${symbol}이(가) 이미 사용하는 심볼`,
  errAnonymous: "페어를 요청하려면 로그인하십시오.",
  errMessageTooLong: (max: string) => `메시지가 ${max}자를 초과합니다.`,
  errInvalidToken: (detail: string) =>
    `이 원장은 사용할 수 없습니다: ${detail}`,
  errUnknownCounterToken: "상대 토큰을 사용할 수 없습니다.",
  errLedgerUnreachable: (detail: string) =>
    `원장에 연결할 수 없습니다: ${detail}`,
  errMissingStandards: (standards: string) =>
    `원장이 ${standards}을(를) 지원하지 않습니다.`,
  errMetadataUnavailable: (detail: string) =>
    `원장 메타데이터를 읽을 수 없습니다: ${detail}`,
  errPairExists: "이 페어는 이미 존재하거나 이미 요청되었습니다.",
  errTooManyPending: (max: string) =>
    `이미 대기 중인 요청이 ${max}개 있습니다.`,
  errCooldown: (date: string) =>
    `거절 후에는 ${date}부터 새 요청이 가능합니다.`,
  errInsufficientAllowance: (allowance: string, required: string) =>
    `승인 금액은 ${allowance}이며, ${required}가 필요합니다.`,
  errInsufficientFunds: (balance: string) =>
    `잔액(${balance})으로 보증금과 수수료를 충당할 수 없습니다.`,
  errDepositFailed: (detail: string) => `보증금을 받을 수 없습니다: ${detail}`,
  errApprovalFailed: (detail: string) => `승인에 실패했습니다: ${detail}`,
  balancesTitle: "내 DEX 잔액",
  balancesSignIn: "DEX 잔액을 보려면 로그인하세요.",
  balancesLoading: "잔액을 불러오는 중…",
  balancesLoadError: "잔액을 불러올 수 없습니다.",
  balancesEmpty: "DEX 잔액이 없습니다.",
  colToken: "토큰",
  colAvailable: "사용 가능",
  colReserved: "예약됨",
  depositButton: "예치",
  withdrawButton: "출금",
  depositTitle: (symbol: string) => `${symbol} 예치`,
  withdrawTitle: (symbol: string) => `${symbol} 출금`,
  amountLabel: "금액",
  amountPlaceholder: "0.00",
  amountInvalid: "올바른 금액을 입력하세요.",
  availableAmount: (amount: string) => `사용 가능: ${amount}`,
  minimumDeposit: (amount: string) => `최소 예치: ${amount}`,
  minimumWithdrawal: (amount: string) => `최소 출금: ${amount}`,
  depositFeeNote: (fee: string) =>
    `금액에 원장 수수료(${fee})를 더한 만큼 컨트랙트에 승인합니다. 승인은 15분 후 만료됩니다.`,
  withdrawFeeNote: (fee: string) =>
    `원장 수수료(${fee})는 출금 금액에서 차감됩니다.`,
  withdrawReceive: (amount: string) => `받는 금액: ${amount}`,
  confirmDeposit: "예치 확인",
  confirmWithdraw: "출금 확인",
  cancel: "취소",
  depositing: "예치 중…",
  withdrawing: "출금 중…",
  depositDone: "예치가 완료되었습니다.",
  withdrawDone: "출금이 완료되었습니다.",
  transfersTitle: "DEX 이체",
  noTransfers: "DEX 이체가 없습니다.",
  directionDeposit: "예치",
  directionWithdrawal: "출금",
  transferStatusInProgress: "진행 중",
  transferStatusCompleted: "완료",
  transferStatusFailed: "실패",
  transferStatusNeedsReview: "확인 필요",
  transferBlock: (block: string) => `블록 ${block}`,
  transferError: (detail: string) => `오류: ${detail}`,
  memo: "Memo",
  errDexAnonymous: "예치하거나 출금하려면 로그인하세요.",
  errAmountTooSmall: (minimum: string) => `최소 금액은 ${minimum}입니다.`,
  errTransferInProgress:
    "이 토큰의 이체가 이미 진행 중입니다. 나중에 다시 시도하세요.",
  errDexInsufficientAllowance: (allowance: string, required: string) =>
    `승인 금액은 ${allowance}이며, ${required}이(가) 필요합니다.`,
  errDexInsufficientFunds: (balance: string) =>
    `잔액(${balance})이 금액과 수수료를 충당하지 못합니다.`,
  errDexInsufficientBalance: (available: string) =>
    `사용 가능한 DEX 잔액은 ${available}입니다.`,
  errLedger: (detail: string) => `원장이 오류를 반환했습니다: ${detail}`,
  errDexApprovalFailed: (detail: string) => `승인에 실패했습니다: ${detail}`,
  lookupTitle: "식별자별 DEX 잔액",
  lookupLabel: "Principal",
  lookupPlaceholder: "Principal ID",
  lookupButton: "조회",
  lookupInvalid: "올바른 principal을 입력하세요.",
  lookupEmpty: "이 principal의 DEX 잔액이 없습니다.",
  depositSubaccount: "예치 하위 계정",
  copyDepositSubaccount: "예치 하위 계정 복사",
  copied: "복사됨",
  refundLabel: "보증금 환불",
  refundNone: "환불 없음",
  refundInProgress: "환불 진행 중",
  refundNeedsReview: "환불 확인 필요",
  refundRefunded: (block: string) => `환불됨 (블록 ${block})`,
  privacyPositions:
    "유동성 포지션은 공개되며 TTTI에서의 귀하의 식별자에 연결됩니다.",
  privacyDeposit: "귀하의 예치금은 체인에서 계속 확인할 수 있습니다.",
  gaugeLabel: "채우기 게이지",
  gaugeFilling: (current: string, target: string, remaining: string) =>
    `${current} / ${target} USD — 스왑 임계값까지 ${remaining} USD 남음`,
  gaugeOpen: (current: string, target: string) => `${current} / ${target} USD`,
  gaugeUnavailable: "가치를 일시적으로 확인할 수 없음",
  reserves: "준비금",
  totalShares: "총 지분",
  addLiquidityButton: "유동성 추가",
  swapButton: "스왑",
  positionsButton: "포지션",
  signInForActions: "유동성을 추가하거나 스왑하려면 로그인하세요.",
  pairTokensUnsupported:
    "이 페어의 토큰에는 유동성과 스왑을 사용할 수 없습니다.",
  swapsClosedFilling: (gauge: string) =>
    `풀이 채우는 중인 동안 스왑은 닫혀 있습니다: ${gauge}`,
  addTitle: (pair: string) => `유동성 추가 · ${pair}`,
  addIntro:
    "금액은 사용 가능한 DEX 잔액에서 차감됩니다. 유동성 포지션은 공개되며 TTTI에서의 귀하의 식별자에 연결됩니다. 귀하의 예치금은 체인에서 계속 확인할 수 있습니다.",
  sideLabel: "입력한 토큰",
  tokenAmountLabel: (symbol: string) => `${symbol} 금액`,
  firstDepositNote:
    "첫 공급: 두 금액을 모두 입력하세요. 두 금액의 비율이 풀의 비율이 됩니다.",
  counterComputed: (amount: string) => `풀 비율에 따른 상대 금액: ${amount}`,
  sharesToReceive: (shares: string) => `받을 지분: ${shares}`,
  sharesLockedForever: (shares: string) =>
    `컨트랙트에 영구히 잠기는 지분: ${shares}`,
  gaugeAfter: (gauge: string) => `공급 후 게이지: ${gauge}`,
  opensPool: "이 공급으로 풀이 스왑에 열립니다.",
  staysFilling: "이 공급 후에도 풀은 채우는 중 상태입니다.",
  quoting: "견적 계산 중…",
  lockLabel: "잠금 기간",
  lockHint: (min: string, max: string) =>
    `선택 사항: 기본값은 잠금 없음입니다. 잠금 기간은 ${min}부터 ${max}까지입니다. 소유자는 잠금을 연장할 수 있으며 단축할 수 없습니다.`,
  lockPreset1d: "1일",
  lockPreset7d: "7일",
  lockPreset30d: "30일",
  lockPreset90d: "90일",
  lockPreset3m: "3개월",
  lockPreset2y: "2년",
  lockPreset3y: "3년",
  lockPreset4y: "4년",
  lockPreset1y: "1년",
  lockPreset5y: "5년",
  lockCustom: "직접 입력",
  lockCustomDays: "일수",
  lockInvalid: (min: string, max: string) =>
    `${min}부터 ${max}까지의 기간을 입력하세요.`,
  durationDays: (days: string) => `${days}일`,
  durationOneDay: "1일",
  unlockOn: (date: string) => `잠금 해제: ${date}`,
  confirmAdd: "유동성 추가",
  adding: "유동성 추가 중…",
  addDone: (id: string, shares: string) =>
    `포지션 #${id}이(가) 지분 ${shares}로 생성되었습니다.`,
  refTitle: "ICPSwap 참고 가격",
  refQuote: (input: string, output: string) =>
    `ICPSwap 견적: ${input} → ${output} (ICPSwap 수수료 포함). 참고용입니다.`,
  refDeviation: (pct: string) =>
    `공급 비율이 이 참고 가격과 ${pct} % 차이가 납니다.`,
  refDeviationWarning: (pct: string) =>
    `주의: 공급 비율이 ICPSwap 참고 가격과 ${pct} % 차이가 나며, 2 %를 넘습니다.`,
  refUnavailable: "이 페어의 ICPSwap 풀이 없어 참고 가격을 사용할 수 없습니다.",
  refError: "ICPSwap 참고 가격을 읽을 수 없습니다.",
  refLoading: "ICPSwap 가격을 읽는 중…",
  positionsTitle: (pair: string) => `포지션 · ${pair}`,
  positionsEmpty: "이 풀에는 포지션이 없습니다.",
  positionsLoading: "포지션을 불러오는 중…",
  positionsLoadError: "포지션을 불러올 수 없습니다.",
  colOwner: "소유자",
  colPair: "페어",
  colShares: "지분",
  colAmounts: "금액",
  colLock: "잠금",
  colUnlock: "잠금 해제",
  creatorBadge: "생성자",
  copyPrincipal: "Principal 복사",
  unlockedLabel: "잠금 해제됨",
  positionLabel: (id: string) => `포지션 #${id}`,
  myPositionsTitle: "내 포지션",
  myPositionsEmpty: "유동성 포지션이 없습니다.",
  myPositionsNote:
    "포지션을 출금하면 DEX 잔액에 적립됩니다. 토큰을 지갑으로 보내려면 내 DEX 잔액의 출금을 사용하세요.",
  withdrawPosition: "출금",
  withdrawingPosition: "출금 중…",
  positionWithdrawn: (amount0: string, amount1: string) =>
    `출금 완료: ${amount0} 및 ${amount1}이(가) DEX 잔액에 적립되었습니다.`,
  lockedUntil: (date: string) => `${date}까지 잠김.`,
  removedWithdrawOpen: "출금은 모든 풀 상태에서 잠금 해제일을 따릅니다.",
  extendLockButton: "잠금 연장",
  extendTitle: (id: string) => `잠금 연장 · 포지션 #${id}`,
  extendCurrent: (date: string) => `현재 잠금 해제: ${date}`,
  extendModeDate: "날짜",
  extendModeDays: "일수",
  extendDateLabel: "새 잠금 해제 날짜",
  extendDaysLabel: "현재 잠금 해제에 더할 일수",
  extendNewUnlock: (date: string) => `새 잠금 해제: ${date}`,
  extendTooEarly: "새 잠금 해제는 현재 잠금 해제보다 늦어야 합니다.",
  extendTooLate: (date: string) =>
    `새 잠금 해제는 ${date}보다 늦을 수 없습니다.`,
  confirmExtend: "연장 확인",
  extending: "연장 중…",
  extendDone: (date: string) => `잠금이 ${date}까지 연장되었습니다.`,
  swapTitle: (pair: string) => `스왑 · ${pair}`,
  swapIntro:
    "스왑은 사용 가능한 DEX 잔액을 사용하며, 받은 금액은 DEX 잔액에 적립됩니다.",
  swapFrom: "판매할 토큰",
  swapAmountOut: "받을 금액(추정)",
  swapFee: (pct: string) => `수수료(${pct})`,
  swapPriceImpact: "가격 영향",
  swapMinimum: "최소 수령액",
  slippageLabel: "슬리피지 허용치(%)",
  slippageInvalid: "0부터 50 %까지의 허용치를 입력하세요.",
  swapDeadlineNote: "마감 시간은 확인 후 5분으로 설정됩니다.",
  confirmSwap: "스왑 확인",
  swapping: "스왑 중…",
  swapDone: (input: string, output: string) =>
    `${input}을(를) ${output}(으)로 스왑했습니다.`,
  errLiqAnonymous: "풀을 사용하려면 로그인하세요.",
  errPoolNotFound: "이 풀은 존재하지 않습니다.",
  errPoolRemoved: "이 페어는 제거되었습니다. 예치와 스왑이 차단됩니다.",
  errMinimumsNotSet: "이 페어의 최소값이 아직 설정되지 않았습니다.",
  errUnsupportedToken: "이 토큰은 DEX에서 지원되지 않습니다.",
  errZeroAmount: "0보다 큰 금액을 입력하세요.",
  errCounterAmountRequired: "첫 공급: 두 금액을 모두 입력하세요.",
  errLiqInsufficientBalance: (available: string, required: string) =>
    `사용 가능한 DEX 잔액은 ${available}이며, ${required}이(가) 필요합니다.`,
  errBelowMinimum: (minimums: string) =>
    `공급액이 최소값보다 적습니다: ${minimums}.`,
  errRatioMismatch: (required: string) =>
    `풀 비율에 따라 상대 금액은 ${required}이어야 합니다.`,
  errLockTooShort: (min: string) => `잠금 기간이 너무 짧습니다. 최소: ${min}.`,
  errLockTooLong: (max: string) => `잠금 기간이 너무 깁니다. 최대: ${max}.`,
  errZeroShares: "이 공급액은 너무 적어 지분을 받을 수 없습니다.",
  errOperationInProgress:
    "이 계정에서 다른 작업이 진행 중입니다. 잠시 후 다시 시도하세요.",
  errPositionNotFound: "이 포지션은 존재하지 않습니다.",
  errNotPositionOwner: "이 포지션은 다른 principal의 것입니다.",
  errPositionLocked: (date: string) => `이 포지션은 ${date}까지 잠겨 있습니다.`,
  errCannotShortenLock: (date: string) =>
    `잠금은 단축할 수 없습니다. 현재 잠금 해제: ${date}.`,
  errUnlockTooLate: (date: string) =>
    `잠금 해제 날짜는 ${date}보다 늦을 수 없습니다.`,
  errPoolFilling: (gauge: string) => `풀이 아직 채우는 중입니다: ${gauge}`,
  errPoolNotOpen: "이 풀은 스왑에 열려 있지 않습니다.",
  errRateUnavailable:
    "USD 환율 하나를 일시적으로 사용할 수 없어 풀 가치를 확인할 수 없습니다.",
  errTokenNotInPool: "이 토큰은 이 페어에 속하지 않습니다.",
  errInvalidSlippage: (max: string) => `슬리피지 허용치는 최대 ${max} %입니다.`,
  errSwapInsufficientBalance: (available: string) =>
    `사용 가능한 DEX 잔액은 ${available}입니다.`,
  errInsufficientLiquidity: "이 스왑에 필요한 풀 유동성이 부족합니다.",
  errSlippageExceeded: (out: string, min: string) =>
    `슬리피지 초과: 스왑 결과가 ${out}(으)로 최소값 ${min}보다 적습니다. 새 견적을 받으세요.`,
  errDeadlineExceeded: (date: string) =>
    `마감 시간(${date})이 지났습니다. 다시 확인하세요.`,
  errDeadlineTooFar: (date: string) =>
    `마감 시간이 너무 멉니다. 허용되는 가장 늦은 시간은 ${date}입니다.`,
  errCall: (detail: string) => `호출 실패: ${detail}`,
  bonusTitle: "잠긴 포지션의 ICP 보너스",
  bonusScope:
    "TTTI-T 페어의 잠긴 포지션이 이미 획득한 ICP 보너스는 계속 청구할 수 있습니다. 스왑 수수료는 새 보너스를 추가하지 않습니다.",
  bonusWeightRule: "포지션 가중치 = ICP 가치 × 남은 잠금 기간 ÷ 5년.",
  bonusObservedNote:
    "보너스는 관측된 금액만 표시합니다. 향후 금액은 추정하거나 약속하지 않습니다.",
  bonusSignIn: "ICP 보너스를 보려면 로그인하세요.",
  bonusLoading: "보너스를 불러오는 중…",
  bonusLoadError: "보너스를 불러올 수 없습니다.",
  bonusClaimable: (amount: string) => `청구 가능: ${amount}`,
  bonusClaimedTotal: (amount: string) => `총 청구액: ${amount}`,
  bonusNoPositions: "TTTI-T 페어에 잠긴 포지션이 없습니다.",
  bonusColPosition: "포지션",
  bonusColValueIcp: "ICP 가치",
  bonusColRemainingLock: "남은 잠금",
  bonusColWeight: "가중치",
  bonusClaimsTitle: "청구 내역",
  bonusClaimsEmpty: "아직 청구 내역이 없습니다.",
  claimButton: "ICP 보너스 청구",
  claiming: "청구 중…",
  claimDone: (amount: string) =>
    `${amount} 청구가 기록되었습니다. ICP는 지갑으로 전송됩니다.`,
  errClaimAnonymous: "보너스를 청구하려면 로그인하세요.",
  errClaimNothing: "청구할 금액이 없습니다.",
  errClaimBelowMinimum: (minimum: string) =>
    `청구 가능 금액이 최소 금액 ${minimum}보다 적습니다.`,
  errClaimInProgress: "이미 청구가 진행 중입니다. 잠시 후 다시 시도하세요.",
  protocolLiquidityTitle: "프로토콜 유동성",
  protocolLiquidityLocked: "영구적으로 잠겨 있으며 인출 경로가 없습니다.",
  protocolLiquidityHeld: (amount0: string, amount1: string) =>
    `보유: ${amount0} 및 ${amount1}`,
  protocolLiquidityFromFees: (amount0: string, amount1: string) =>
    `수수료에서: ${amount0} 및 ${amount1}`,
  protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
    `트레저리에서: ${amount0} 및 ${amount1}`,
  protocolLiquidityShare: (pct: string) => `풀 지분의 ${pct} %`,
  protocolLiquidityLastAdded: (date: string) => `마지막 추가: ${date}`,
  protocolLiquidityNone: "이 풀에는 프로토콜 유동성이 없습니다.",
  dexPausedTitle: "DEX 일시 중지됨",
  dexPausedNotice: (token: string) =>
    `준비금 점검에서 ${token}의 부족분이 확인되어 DEX가 일시 중지되었습니다. 스왑, 입금, 유동성 추가는 사용할 수 없습니다. 출금과 유동성 제거는 계속 사용할 수 있습니다.`,
  dexPausedTooltip: "DEX가 일시 중지된 동안에는 사용할 수 없습니다.",
  errDexPaused:
    "준비금 점검 후 DEX가 일시 중지되었습니다. 스왑, 입금, 유동성 추가는 사용할 수 없습니다. 출금과 유동성 제거는 계속 사용할 수 있습니다.",
  navLabel: "풀 페이지 섹션",
  navPools: "풀",
  navIndicators: "지표",
  navMyLiquidity: "내 유동성",
  navProtocol: "프로토콜",
  navRequests: "요청",
  introShort: "이 컨트랙트가 보유한 상수곱 풀입니다.",
  statusWaiting: "유동성 대기 중",
  statusOpen: "열림",
  detailsLabel: "세부 정보",
  addShort: "추가",
  howPoolsWorkTitle: "풀 작동 방식",
  permanentLiquidity: "영구 유동성",
  permanentLiquidityValue: (shares: string, pct: string) =>
    `${shares} 지분 (풀의 ${pct}%)`,
  myLiquiditySignIn:
    "로그인하면 DEX 잔액, 유동성 포지션 및 받은 수수료를 볼 수 있습니다.",
  rewardsTitle: "받은 수수료",
  activityTitle: "내 활동",
  activityFilterLabel: "활동 유형",
  filterAll: "전체",
  filterTransfers: "입금 및 출금",
  filterMintFees: "민트 수수료",
  filterLpBonus: "LP 보너스",
  tokenFilterLabel: "토큰",
  allTokens: "모든 토큰",
  activityEmpty: "이 필터에 해당하는 활동이 없습니다.",
  activityLoadError: "활동을 불러올 수 없습니다.",
  entryMintFee: "민트 수수료 수령",
  entryLpBonus: "LP 보너스 수령",
  requestsFilterLabel: "요청 필터",
  filterRejected: "거절됨",
  requestsEmptyFiltered: "이 필터에 해당하는 요청이 없습니다.",
  poolsEmpty: "아직 풀이 없습니다.",
  depthLabel: "깊이",
  depthValue: (usd: string) => `${usd} USD`,
  depthBasisTwice: "풀 가격 기준, TTTI-T가 아닌 쪽 USD 가치의 두 배입니다.",
  depthBasisSum: "풀 가격과 시간별 환율 기준, 양쪽 USD 가치의 합계입니다.",
  depthUnavailable:
    "깊이를 일시적으로 확인할 수 없습니다: USD 환율이 없습니다.",
  depthMissingRate: (tokens: string) => `없는 환율: ${tokens}.`,
  thresholdLabel: "스왑 임계값",
  thresholdValueTtti: (usd: string) => `풀 내 TTTI-T ${usd} USD`,
  thresholdProgressTtti: (measured: string, threshold: string) =>
    `풀 내 TTTI-T ${measured} USD / ${threshold} USD`,
  thresholdValueDepth: (usd: string) => `깊이 ${usd} USD`,
  thresholdRule: (usd: string) =>
    `깊이가 ${usd} USD 이상이고 USD 환율을 사용할 수 있는 동안 스왑이 열려 있습니다. 임계값은 스왑에만 적용되며 호출할 때마다 확인합니다.`,
  swapStateLabel: "스왑",
  swapStateOpen: "열림",
  swapStateClosed: "닫힘",
  swapClosedBelowThreshold: (measured: string, threshold: string) =>
    `스왑이 닫혀 있습니다: 풀은 현재 ${measured} USD로 스왑 임계값(${threshold})보다 낮습니다. 이 임계값에 도달하면 스왑이 열립니다. 예치, 유동성 추가, 민트에는 영향이 없습니다.`,
  swapClosedRateUnavailable:
    "스왑이 닫혀 있습니다: USD 환율을 일시적으로 사용할 수 없습니다.",
  swapClosedRemovalAnnounced: (date: string) =>
    `스왑이 중단되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
  swapClosedRemovalExecuting:
    "스왑이 닫혀 있습니다: 이 페어의 제거가 진행 중입니다.",
  swapClosedRemoved: "스왑이 닫혀 있습니다: 이 페어는 제거되었습니다.",
  errDepthBelowThreshold: (measured: string, threshold: string) =>
    `스왑이 거부되었습니다: 풀은 현재 ${measured} USD로 ${threshold} USD 스왑 임계값보다 낮습니다.`,
  errSwapRateUnavailable:
    "스왑이 거부되었습니다: USD 환율을 일시적으로 사용할 수 없습니다.",
  errRemovalInProgress: (date: string) =>
    `스왑이 거부되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
  errSwapPoolRemoved: "스왑이 거부되었습니다: 이 페어는 제거되었습니다.",
  fixedSideLabel: "고정 쪽",
  fixedSideHint: "이 금액을 직접 입력합니다. 변경되지 않습니다.",
  counterSideLabel: "상대 쪽(계산됨)",
  counterSideNote:
    "예치 시점의 풀 비율로 계산되며 슬리피지 허용치 안에서 적용됩니다.",
  counterSideRange: (min: string, max: string) =>
    `허용되는 상대 금액: ${min} ~ ${max}`,
  addSlippageLabel: "슬리피지 허용치 (%)",
  addSlippageHint: "견적과 실행 사이에 상대 금액이 변할 수 있는 최대 폭입니다.",
  addSlippageDefault: "기본값: 0.5 %",
  addSlippageInvalid: (max: string) =>
    `0부터 ${max} %까지의 허용치를 입력하세요.`,
  depthAfter: (depth: string) => `예치 후 깊이: ${depth} USD`,
  surplusKept: (amount: string) =>
    `사용되지 않음: ${amount}. 내부 DEX 잔액에 남습니다.`,
  addDoneSurplus: (id: string, shares: string, surplus: string) =>
    `포지션 #${id}이(가) 지분 ${shares}(으)로 생성되었습니다. 사용되지 않음: ${surplus}, 내부 DEX 잔액에 남아 있습니다.`,
  errAddInvalidSlippage: (max: string) =>
    `슬리피지 허용치는 최대 ${max} %여야 합니다.`,
  errAddSlippageExceeded: (
    tolerance: string,
    expected: string,
    actual: string,
  ) =>
    `상대 금액이 ${tolerance} % 허용치를 넘어 변했습니다: 예상 ${expected}, 현재 ${actual}. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다. 새 견적을 받으세요.`,
  errAddReferenceOutOfBand: (
    expected: string,
    deviation: string,
    tolerance: string,
  ) =>
    `첫 예치 비율이 기준 가격과 ${deviation} % 차이 나며 ${tolerance} % 범위를 벗어납니다. 예상: ${expected}. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다.`,
  errAddReferenceUnavailable:
    "기준 가격을 사용할 수 없어 첫 예치를 확인할 수 없습니다. 차감된 금액은 없으며 자금은 내부 잔액에 남아 있습니다.",
  errAddRemovalAnnounced: (date: string) =>
    `유동성 추가가 중단되었습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다. 인출은 포지션 잠금에 따라 계속 가능합니다.`,
  referenceTitle: "기준 가격",
  referenceIntro: (tolerance: string) =>
    `빈 풀의 첫 예치는 기준 가격의 ${tolerance} % 이내여야 합니다.`,
  referenceTttiPrice: (price: string) => `TTTI-T 기준 가격: ${price} USD`,
  referenceExpected: (expected: string) => `예상 비율: ${expected}`,
  referenceSourcesTitle: "출처",
  referenceColSource: "출처",
  referenceColPrice: "가격 (USD)",
  referenceColDepth: "깊이 (USD)",
  referenceColWeight: "가중치",
  referenceSourceNative: "네이티브 풀",
  referenceSourceIcpswap: "ICPSwap",
  referenceReadAt: (date: string) => `${date}에 읽음`,
  referenceTolerance: (pct: string) => `허용치: ${pct} %`,
  referenceUtilityBasis: "유틸리티 페어는 시간별 USD 환율을 사용합니다.",
  referenceUnavailableNoSource:
    "기준 가격을 사용할 수 없습니다: 읽을 수 있는 출처가 없습니다.",
  referenceUnavailableRate: (tokens: string) =>
    `기준 가격을 사용할 수 없습니다: ${tokens}의 USD 환율이 없습니다.`,
  referenceRatesInvalid:
    "시간별 USD 환율이 유효하지 않아 유틸리티 페어 확인을 사용할 수 없습니다.",
  referenceWithin: (deviation: string) => `범위 이내: 편차 ${deviation} %.`,
  referenceOutside: (deviation: string, tolerance: string) =>
    `범위 밖: 편차 ${deviation} %, 허용치 ${tolerance} %.`,
  referenceNotApplicable: "기준 확인 없음: 풀에 이미 유동성이 있습니다.",
  referenceRefresh: "출처 다시 읽기",
  referenceRefreshing: "출처를 읽는 중…",
  referenceRefreshed: (count: string) => `출처 ${count}개를 읽었습니다.`,
  referenceLoading: "기준 가격을 불러오는 중…",
  referenceLoadError: "기준 가격을 불러올 수 없습니다.",
  lockNone: "잠금 없음",
  lockNoneHint: "잠금 없음: 포지션을 언제든지 인출할 수 있습니다.",
  lockPickerLabel: "잠금(선택)",
  lockUpTo: (max: string) =>
    `잠금 기간은 3개월부터 ${max}까지입니다. 소유자는 잠금을 연장할 수 있으며 단축할 수 없습니다.`,
  lockEnforced:
    "잠금 해제일은 제거된 페어를 포함한 모든 풀 상태에서 적용됩니다. 누구도 잠금을 취소할 수 없으며, 풀의 새 약정에 따른 릴레이만 잠금을 단축할 수 있습니다.",
  positionLiquidated: "페어 제거 시 청산된 포지션입니다.",
  removalTitle: "페어 제거",
  removalBadge: "제거 예정 공지됨",
  removalAnnouncedTitle: "제거 예정 공지됨",
  removalReasonLabel: "사유",
  removalAnnouncedAt: (date: string) => `공지일: ${date}`,
  removalEffectiveAt: (date: string) => `시행일: ${date}`,
  removalRemaining: (remaining: string) => `남은 시간: ${remaining}`,
  removalSuspendedNotice:
    "스왑과 유동성 추가가 중단되었습니다. 인출은 포지션 잠금에 따라 계속 가능합니다.",
  removalLiquidationNotice:
    "시행일에 잠긴 포지션을 포함한 모든 포지션이 청산되고 풀은 제거됨으로 표시됩니다.",
  removalCancelledTitle: "제거 취소됨",
  removalCancelledNotice: (date: string) =>
    `공지된 제거가 ${date}에 취소되었습니다. 스왑과 추가는 다시 풀 깊이를 따릅니다.`,
  removalExecutingTitle: "제거 진행 중",
  removalExecutingNotice:
    "포지션을 청산하는 중입니다. 스왑과 추가는 닫혀 있습니다.",
  removalCompletedTitle: "페어 제거됨",
  removalCompletedNotice: (date: string) =>
    `${date}에 제거되었습니다. 모든 포지션이 청산되었습니다.`,
  removalReviewNotice:
    "결과를 확인할 수 없는 지급은 관리자의 검토 목록에 표시됩니다.",
  poolDepthShort: (usd: string) => `깊이 ${usd} USD`,
  swapsOpenBadge: "스왑 열림",
  swapsClosedBadge: "스왑 닫힘",
  dexPercentConnect: "바를 사용하려면 지갑을 연결하세요.",
  dexPercentLoading: "잔액을 불러오는 중…",
  dexPercentUnavailable: "잔액을 확인할 수 없습니다.",
  dexPercentNotCover: (fees: string) =>
    `지갑과 DEX 잔액이 ${fees}의 네트워크 수수료에 미치지 못합니다.`,
  dexPercentShare: (symbol: string) => `${symbol} 비율 (지갑 + DEX)`,
  dexPercentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  dexPercentBase: (wallet: string, dex: string, total: string) =>
    `기준: 지갑 ${wallet} + DEX ${dex} = ${total}`,
  dexPercentComputedOn: (fees: string) =>
    `지갑 잔액과 사용 가능한 DEX 잔액의 합계를 기준으로 계산하며, 지갑에서 가져오는 부분의 원장 수수료 ${fees}을(를) 뺍니다.`,
  slippageFieldHint: "견적 금액과 실행 금액 사이의 최대 차이입니다.",
  emptyPoolTitle: "빈 풀의 첫 예치",
  emptyPoolNote:
    "이 풀에는 아직 유동성이 없습니다. 금액을 하나 입력하세요. 다른 쪽은 기준 가격으로 계산되며 추가 시 허용치에 따라 확인됩니다.",
  expectedOtherAmountLabel: (symbol: string) =>
    `기준 가격 기준 예상 ${symbol} 수량`,
  expectedOtherAmountUnavailable: "사용할 수 있는 기준 가격이 없습니다.",
  addReferenceBlockTitle: "첫 예치의 기준 가격",
  poolSwapStateLabel: "스왑 상태",
  depthBarOpen: "열림: 스왑 임계값에 도달했습니다",
  depthBarClosed: "닫힘: 스왑 임계값 미만입니다",
  depthBarAriaLabel: (pair: string) =>
    `스왑 임계값 대비 ${pair} 풀의 TTTI-T 수량`,
  countdownLabel: "남은 시간",
  countdownDays: (count: string) => `${count}일`,
  countdownHours: (count: string) => `${count}시간`,
  countdownMinutes: (count: string) => `${count}분`,
  countdownSeconds: (count: string) => `${count}초`,
  countdownReached: "적용일에 도달했습니다.",
  recoverHeading: "내 DEX 잔액",
  recoverButton: "되찾기",
  recoverExplain:
    "잔액이 지갑으로 돌아갑니다. 원장 수수료는 각 금액에서 차감됩니다.",
  recovering: "되찾는 중…",
  recoverDone: (amounts: string) => `지갑으로 되찾음: ${amounts}.`,
  recoverNothing: "되찾을 DEX 잔액이 없습니다.",
  recoverError: (detail: string) => `잔액을 되찾지 못했습니다: ${detail}`,
  durationOneYear: "1년",
  durationYears: (count: string) => `${count}년`,
  durationOneMonth: "1개월",
  durationMonths: (count: string) => `${count}개월`,
  positionLockCommitted: "약정한 잠금",
  positionLockStart: "잠금 시작",
  positionTimeRemaining: "남은 시간",
  positionRelayReceived: "받은 릴레이",
  relayReceivedNone: "없음",
  positionFeesCollected: "수취한 수수료",
  pendingPotLabel: "대기 중인 풀",
  pendingPotNext: (date: string) => `다음 분배: ${date}`,
  pendingPotRunning: "분배 진행 중",
  pendingPotNote:
    "이 풀에는 마지막 분배 이후 지급된 LP 수수료 중 잠금 몫의 절반이 들어 있습니다. 하루에 한 번, 그날 잠겨 있던 포지션끼리 분배됩니다.",
  estimatedShareLabel: "오늘의 예상 몫",
  estimatedShareDetail: (fraction: string, date: string) =>
    `하루 중 잠긴 비율 ${fraction} · 다음 분배 ${date}`,
  estimatedShareNote:
    "당일 추정치입니다. 포지션의 가중치와 하루 중 잠겨 있던 시간의 비율에 비례합니다. 실제 지급액은 다음 분배 시점의 풀에 따라 달라집니다.",
  estimatedShareNone: "오늘 잠긴 시간 없음",
  positionStatus: "상태",
  positionStatusLocked: "잠김",
  positionStatusFree: "자유",
  positionStatusFreeNoLock: "자유 · 잠금 없음",
  positionFreeAfter: "릴레이 또는 만기 후 자유",
  guaranteedDepthLabel: "보장 깊이",
  guaranteedDepthHint: "잠긴 포지션과 영구 유동성의 합계입니다.",
  consolidatedTitle: "TTTI-T 통합 가격",
  consolidatedUsd: (price: string) => `${price} USD`,
  consolidatedCurrent: "가격",
  consolidatedHourly: "1시간 평균",
  consolidatedDaily: "24시간 평균",
  consolidatedSamples: (count: string) => `샘플 ${count}개`,
  consolidatedNotAvailable: "사용 불가",
  consolidatedComputedLabel: "계산 시각",
  consolidatedSource: (symbol: string, price: string, weight: string) =>
    `TTTI-T/${symbol}: ${price} USD · 가중치 ${weight}`,
  consolidatedNote:
    "풀 깊이로 가중하고 현재 시간별 환율로 USD로 환산한 값입니다.",
  consolidatedUnavailableNoRate:
    "통합 가격을 사용할 수 없습니다: 유효한 시간별 환율이 없습니다.",
  consolidatedUnavailableNoPool:
    "통합 가격을 사용할 수 없습니다: 스왑이 열려 있는 TTTI-T 풀이 없습니다.",
  consolidatedLoadError: "통합 가격을 불러올 수 없습니다.",
  spreadLabel: "다른 열린 풀 대비 스프레드",
  spreadNoIndependentReference: "독립적인 기준 없음",
  spreadAboveThreshold: (threshold: string) => `스프레드 ${threshold} % 초과`,
  spreadReasonEmpty: "이 풀에 유동성이 없습니다.",
  spreadReasonNotOpen: "스왑이 열려 있지 않습니다.",
  spreadReasonNoRate: "이 쌍에 유효한 시간별 환율이 없습니다.",
  spreadReasonNoConsolidated: "통합 가격이 없습니다.",
  spreadReasonLoadError: "스프레드를 불러올 수 없습니다.",
  poolPriceLabel: "풀 가격",
  spreadAlertTitle: "임계값 초과 스프레드",
  spreadAlert: (pool: string, spread: string, threshold: string) =>
    `풀 ${pool}: 이 풀의 가격을 다른 열린 풀의 가격과 비교합니다. 스프레드는 ${spread}로 ${threshold} % 임계값을 초과합니다. 이 풀에 포지션을 보유하고 있습니다.`,
  spreadAlertPrices: (poolPrice: string, consolidated: string) =>
    `풀 가격 ${poolPrice} USD · 다른 열린 풀의 가격 ${consolidated} USD`,
  referenceConsolidatedPrice: (price: string) =>
    `TTTI-T 통합 가격: ${price} USD`,
  guaranteedDepthReserves: (amount0: string, amount1: string) =>
    `보장 준비금: ${amount0} 및 ${amount1}`,
  relayTitle: "약정 릴레이",
  relayExplain:
    "릴레이 잠금은 선택 사항이며 3개월에서 5년 동안 지속됩니다. 새 약정마다 가중치의 3분의 1이 풀의 다른 잠금 포지션의 부담을 덜어 줍니다. 소유자는 기간을 연장할 수 있습니다. 부담이 덜어졌거나 만료된 포지션은 퇴출 없이 잠금이 해제되며 자유 유동성으로 풀에 남습니다.",
  relayResult: (shortened: string, freed: string) =>
    `릴레이: 포지션 ${shortened}개 단축, ${freed}개 해제.`,
  relayResultNone: "릴레이: 단축된 다른 포지션이 없습니다.",
  feeSplitTitle: "잠긴 포지션과의 수수료 분배",
  feeSplitExplain:
    "유동성 공급자 수수료의 절반은 지분에 비례하여 준비금에 남습니다. 나머지 절반은 따로 적립되어 자본 × (남은 시간 ÷ 5년)의 제곱근에 따라 잠긴 포지션끼리 나눕니다. 실제로 지불된 수수료만 분배됩니다.",
  errExtendRemovalAnnounced: (date: string) =>
    `잠금을 연장할 수 없습니다: 이 페어의 제거가 ${date}에 예정되어 공지되었습니다.`,
  extendRemainingRule: (min: string, max: string) =>
    `연장 후 남은 기간은 ${min}에서 ${max} 사이여야 합니다.`,
  extendMaxDate: (date: string) => `가능한 가장 늦은 잠금 해제: ${date}`,
  extendCurrentRemaining: (remaining: string) => `현재 남은 기간: ${remaining}`,
  extendNewRemaining: (remaining: string) => `연장 후 남은 기간: ${remaining}`,
  extendFreeNote:
    "이 포지션에는 활성 잠금이 없습니다. 연장하면 지금부터 계산되는 새 잠금이 설정됩니다.",
  extendRemainingTooShort: (min: string) =>
    `연장 후 남은 기간은 최소 ${min} 이상이어야 합니다.`,
  extendRemainingTooLong: (max: string) =>
    `연장 후 남은 기간은 ${max}를 초과할 수 없습니다.`,
  errExtendLockTooShort: (min: string) =>
    `연장 후 남은 기간이 최소 ${min}보다 짧습니다.`,
  errExtendLockTooLong: (date: string) =>
    `잠금은 ${date} 이후에 끝날 수 없습니다.`,
  extendRelayNote:
    "추가된 기간 가중치의 3분의 1이 풀의 다른 잠금 포지션을 단축합니다. 연장한 포지션 자체는 그 연장으로 단축되지 않습니다.",
  feeSplitProtocolTitle: "스왑 수수료 배분",
  feeSplitProtocolRule:
    "스왑 수수료는 유동성 공급자 70 %와 프로토콜 몫 30 %로 나뉩니다.",
  feeSplitLpLine: "수수료의 70 %는 유동성 공급자에게 돌아갑니다.",
  feeSplitCreatorLine:
    "프로토콜 몫의 3분의 2(수수료의 20 %)는 생성자에게 돌아갑니다.",
  feeSplitPermanentLine:
    "프로토콜 몫의 3분의 1(수수료의 10 %)은 아무도 인출할 수 없는 영구 유동성으로 들어갑니다.",
  feeSplitRouterNote: "ICPSwap 라우터의 0.1 % 수수료도 같은 배분을 따릅니다.",
  feeSplitMintNote:
    "민트의 1 % 수수료는 먼저 측정된 소비량 1년분까지 Cycles 준비금을 채우고, 나머지는 생성자에게 돌아갑니다.",
  transferFeeFixedTitle: "TTTI-T 전송 수수료",
  transferFeeFixed:
    "TTTI-T 전송 수수료는 0.000001 TTTI-T로 고정되어 있으며 생성자에게 지급됩니다.",
  boardTitle: "공개 현황판",
  boardIntro:
    "컨트랙트에서 읽은 수치: Cycles 준비금, 영구 유동성, 생성자 보유분.",
  boardLoading: "공개 현황판을 불러오는 중…",
  boardLoadError: "공개 현황판을 불러올 수 없습니다.",
  boardCyclesTitle: "Cycles 준비금",
  boardCyclesMonths: (months: string) => `측정된 소비량 ${months}개월분`,
  boardCyclesTarget: "목표: 소비량 1년분",
  boardCyclesFill: (pct: string) => `1년 목표의 ${pct} %`,
  boardCyclesFillAria: "1년 목표를 향한 Cycles 준비금 충전률",
  boardCyclesReserve: (amount: string) => `준비금: ${amount}`,
  boardCyclesBalance: (cycles: string) => `캐니스터 Cycles: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `아직 준비금에 정산되지 않은 수수료 몫: ${amount}`,
  boardCyclesUnknown:
    "소비량이 아직 측정되지 않았거나 환율을 사용할 수 없어 커버리지를 계산할 수 없습니다.",
  boardTopUpHint: "누구나 캐니스터의 Cycles를 충전할 수 있습니다.",
  boardTopUpButton: "Cycles 충전",
  boardTopUpRunning: "충전 중…",
  boardTopUpDone: (cycles: string) =>
    `충전이 완료되었습니다. 캐니스터 Cycles: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `충전이 필요하지 않습니다. Cycles가 기준값 ${threshold}보다 많습니다.`,
  boardTopUpBusy: "이미 충전이 진행 중입니다.",
  boardTopUpError: (detail: string) => `충전에 실패했습니다: ${detail}`,
  boardPermanentTitle: "영구 유동성",
  boardPermanentIntro:
    "아무도 인출할 수 없는 잠긴 풀 지분입니다. 유동성이 가장 적은 TTTI-T 풀에 추가되며 공개 기록에 남습니다.",
  boardPermanentNone: "아직 영구 유동성이 없습니다.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `영구 지분 ${shares} (풀의 ${pct} %)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `영구 지분이 보유한 자산: ${amount0} 및 ${amount1}`,
  boardPermanentValue: (usd: string) => `가치: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `따로 보관 중, 다음 투입 대기: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `다음 풀: ${pair}`,
  boardPermanentThreshold: (amount: string) => `투입 기준값: ${amount}`,
  boardJournalTitle: "최근 기록",
  boardJournalEmpty: "아직 기록이 없습니다.",
  boardJournalTotal: (count: string) => `${count}건`,
  boardJournalColDate: "날짜",
  boardJournalColKind: "유형",
  boardJournalColAmount: "금액",
  boardJournalColShares: "지분",
  boardJournalColDetail: "상세",
  boardJournalRouteNative: "네이티브 풀",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "이전",
  boardJournalNext: "다음",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} / ${total}`,
  permKindAccrued: "적립됨",
  permKindRebalanced: "재조정됨",
  permKindInjected: "투입됨",
  permKindWaiting: "대기 중",
  permKindFailed: "실패",
  permKindAccruedHint: "영구 유동성을 위해 따로 보관한 프로토콜 몫입니다.",
  permKindRebalancedHint: "따로 보관한 금액을 페어 비율에 맞게 교환했습니다.",
  permKindInjectedHint: "잠긴 지분으로 풀에 추가되었습니다.",
  permKindWaitingHint: "환율 또는 기준값을 기다리는 중입니다.",
  permKindFailedHint: "단계가 실패했으며 기록에 남습니다.",
  boardCreatorTitle: "생성자 보유분",
  boardCreatorIntro:
    "컨트랙트가 토큰별로 생성자를 위해 보유한 금액과 TTTI-T로 받은 수수료입니다.",
  boardCreatorNone: "아직 생성자 보유분이 없습니다.",
  boardCreatorHeld: "보유",
  boardCreatorPaid: "지급됨",
  boardCreatorInFlight: "전송 중",
  boardCreatorMintFee: "민트 수수료",
  boardCreatorSwapFee: "스왑 수수료 몫",
  boardCreatorRouterShare: "라우터 수수료 몫",
  boardCreatorTransferFee: "전송 수수료",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `TTTI-T로 받은 전송 수수료: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `수수료 계정의 TTTI-T 잔액: ${amount}`,
  boardCreatorLastCredit: (date: string) => `마지막 입금: ${date}`,
};
export default ko;
