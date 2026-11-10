import type en from "./en";

const ko: typeof en = {
  priceStatement:
    "가격: TTTI-T당 10,000 USD이며 언제든 10,000 USD에 환매할 수 있습니다. q TTTI-T의 지불 금액은 (10,000 USD + 제공하는 유동성) × q ÷ 0.99이며 ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 최소: 0.0001 TTTI-T.",
  modeLegend: "금액 입력",
  modeTtti: "TTTI-T 수량으로 입력",
  modeUsd: "달러 금액으로 입력",
  tttiLabel: "발행할 TTTI-T",
  tttiHint: "최소 0.0001 TTTI-T, 소수점 8자리까지.",
  usdLabel: "지불할 금액(달러)",
  usdHint: "지불의 달러 가치입니다. TTTI-T 수량은 소수점 8자리로 내림됩니다.",
  invalidTtti:
    "소수점 8자리 이하의 TTTI-T 수량을 입력하세요. 점 또는 쉼표를 사용할 수 있습니다.",
  invalidUsd:
    "0보다 크고 소수점 8자리 이하인 달러 금액을 입력하세요. 점 또는 쉼표를 사용할 수 있습니다.",
  previewHeading: "미리보기",
  previewIdle: "금액을 입력하면 미리보기가 표시됩니다.",
  previewLoading: "미리보기 계산 중…",
  rowMinted: "발행되는 TTTI-T",
  rowPay: "지불 금액",
  splitHeading: "결제 분배",
  rowPosition: "유동성 포지션",
  rowGuarantee: "공동 준비금",
  rowFee: "수수료: 1 %",
  rowPrice: "가격",
  priceValue: "TTTI-T당 10,000 USD, 언제든 10,000 USD에 환매 가능",
  rowLiquidity: "제공하는 유동성",
  liquidityNote: "내 포지션에 그대로 내 소유로 남음",
  holdingsHeading: "민트 후 보유",
  rowLocked: "잠금 부분",
  rowHand: "보유 TTTI-T",
  lockedShareLabel: "잠금 비율 m",
  lockedShareNote:
    "m은 3개월간 잠기는 포지션의 비율입니다. 결제 시점에 적용되며, 이 미리보기 이후 바뀌면 결제 시점의 값이 적용됩니다.",
  choiceLegend: "나머지 선택 (1 − m)",
  choicePoolTitle: "A · 나머지를 풀에 넣기",
  choicePoolText: "나머지는 잠금 없이 내 포지션의 풀에 들어갑니다.",
  choiceWalletTitle: "B · 지갑에 보관",
  choiceWalletText:
    "나머지는 TTTI-T로 지갑에 남으며, 해당 유동성은 지불하지 않습니다.",
  paymentRule:
    "결제: (10,000 USD + 제공하는 유동성) × q ÷ 0.99, 올림. 10,000 USD × q는 공동 준비금으로 가고 지불 금액의 1 %는 제작자에게 갑니다. 나머지는 제공하는 유동성으로, 내 포지션에 그대로 내 소유로 남습니다.",
  lockedRule:
    "포지션의 m 비율은 3개월간 잠깁니다. 나머지 (1 − m)는 선택에 따릅니다. A는 잠금 없이 풀에 넣고, B는 해당 TTTI-T를 지갑에 보관합니다.",
  rowDust: "반올림 잔액",
  poolPriceHeading: "대상 풀 가격, zap 전과 후",
  priceBefore: "이전",
  priceAfter: "이후",
  emptyPool: "빈 풀",
  consolidatedPriceHeading: "통합 가격 (참고)",
  consolidatedPriceNote:
    "TTTI-T당 USD: 대상 풀을 제외한 다른 열린 풀의 가격, 깊이로 가중.",
  poolPriceNote: "지불 토큰의 TTTI-T 풀에서 TTTI-T당 USD.",
  gapHeading: "풀 가격과 기준 가격의 차이",
  gapUnavailable: "차이를 사용할 수 없음",
  noIndependentReference: "독립적인 기준 없음",
  firstDepositNote:
    "빈 풀: 첫 예치는 1 대 1, TTTI-T당 10,000 USD로 이루어집니다.",
  zapLabel: "균형 스왑",
  noZap: "균형 스왑이 필요하지 않습니다.",
  maxPayLabel: "이 허용 범위의 최대 지불액",
  expiryNote: "5분 안에 실행되지 않으면 발행이 거부됩니다.",
  previewFailedTitle: "미리보기를 사용할 수 없음",
  mintFailedTitle: "발행이 완료되지 않았습니다",
  successTitle: (amount: string) => `${amount} 발행됨`,
  successPaid: (pay: string, id: string) => `지불 ${pay} · 발행 #${id}`,
  successPosition: (id: string) => `유동성 포지션 #${id}`,
  successHoldings: (token: string, ttti: string) =>
    `포지션에는 ${token}와(과) ${ttti}이(가) 들어 있습니다.`,
  successGuarantee: (amount: string) => `공동 준비금: ${amount}.`,
  successLink: "내 유동성 포지션 보기",
  errAnonymous: "발행하려면 로그인하거나 지갑을 연결하세요.",
  errRateUnavailable: (symbol: string) =>
    `현재 유효한 ${symbol}/USD 환율이 없습니다. 아무것도 차감되지 않았습니다. 나중에 다시 시도하세요.`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `최소 수량은 ${minimum}${minimumUsd ? `(${minimumUsd})` : ""}입니다.`,
  errTooManyDecimals: (max: string, step: string) =>
    `TTTI-T 수량은 소수점 ${max}자리까지입니다(최소 단위 ${step}).`,
  errInvalidAmount: "0보다 큰 금액을 입력하세요.",
  errAboveCap: (cap: string, remaining: string) =>
    `총 한도 ${cap}에 도달했거나 초과하게 됩니다. 남은 수량: ${remaining}.`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
    `${symbol} 잔액 부족: 원장 수수료 포함 ${required} 필요, 사용 가능 ${balance}.`,
  errInsufficientAllowance: (
    symbol: string,
    required: string,
    allowance: string,
  ) =>
    `${symbol} 승인 한도가 부족합니다: ${required} 필요, ${allowance} 승인됨. 다시 승인한 후 재시도하세요.`,
  errSlippageExceeded: (percent: string) =>
    `풀 가격이 허용 범위 ${percent} %를 벗어났습니다. 발행되지 않았습니다. 다시 시도하거나 허용 범위를 높이세요.`,
  errInvalidSlippage: (percent: string) =>
    `허용 범위는 ${percent} %를 넘을 수 없습니다.`,
  errMaxPayExceeded: (pay: string, max: string) =>
    `지불액이 현재 ${pay}로, 미리보기를 기준으로 정한 최대 ${max}를 넘었습니다. 미리보기를 새로고침한 후 재시도하세요.`,
  errDeadlineExpired:
    "발행이 실행되기 전에 5분 기한이 지났습니다. 다시 시도하세요.",
  errInProgress: "이 계정의 발행이 이미 진행 중입니다.",
  errAcknowledgements: "발행하려면 확인 사항에 동의하세요.",
  errSalesPaused: "발행이 일시 중지되었습니다.",
  rateSourceMissing: "사용할 수 없음",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `발행이 거부되었습니다: ${symbol}의 Coinbase와 CoinGecko 환율이 ${maxPercent}% 넘게 차이나거나 둘 중 하나가 없습니다. Coinbase: ${coinbase}. CoinGecko: ${coingecko}. 아무것도 차감되지 않았습니다.`,
  errDexPaused: "풀이 일시 중지되어 발행할 수 없습니다.",
  errPoolRemoved: (symbol: string) => `TTTI-T/${symbol} 풀이 제거되었습니다.`,
  errRemovalAnnounced: (symbol: string, date: string) =>
    `TTTI-T/${symbol} 풀의 제거가 ${date}에 예정되어 있습니다. 이 풀로의 발행은 중단되었습니다.`,
  errPoolNotFound: (symbol: string) => `TTTI-T/${symbol} 풀이 없습니다.`,
  errMinimumsNotSet: "풀 최소 한도가 아직 설정되지 않았습니다.",
  errLedger: (symbol: string, message: string) =>
    `${symbol} 원장 오류: ${message}`,
  errDepositRefunded: (id: string) =>
    `풀 예치에 실패했습니다. 결제금이 원장 수수료를 제외하고 환불되었습니다(발행 #${id}).`,
  refundingTitle: "결제금 반환 중",
  errDepositRefunding: (id: string) =>
    `풀 예치에 실패했습니다. 결제금이 반환되는 중이며, 그동안 지갑 잔액에 남아 있습니다(발행 #${id}).`,
  errDepositRefundFailed: (id: string) =>
    `풀 예치에 실패했고 환불이 완료되지 않았습니다(발행 #${id}). 이 번호를 보관하세요.`,
  errGeneric: "발행이 거부되었습니다.",
};

export default ko;
