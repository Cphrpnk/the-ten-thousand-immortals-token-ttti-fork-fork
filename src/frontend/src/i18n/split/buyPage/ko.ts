import type en from "./en";

const ko: typeof en = {
  title: (symbol: string) => `${symbol} 발행`,
  noExtraTaken:
    "전달되는 항목의 비용을 초과하는 지불 토큰은 일절 가져가지 않습니다.",
  shownAs: (symbol: string) => `지갑에서는 ${symbol}(으)로 표시됩니다.`,
  ackReadFirst: "백서의 ‘먼저 읽어 주세요’ 섹션을 읽었습니다.",
  ackNoRights:
    "TTTI는 아무런 용도도 내재 가치도 없다는 것을 이해합니다. 제가 가진 유일한 권리는 상환권입니다. TTTI-T를 컨트랙트에 반환하고 TTTI-T당 10,000 USD와 공동 준비금의 비례 몫 중 더 낮은 금액을 받을 수 있으며, 가치에 대한 약속은 없습니다.",
  ackPriceZero:
    "그 가격이 0까지 떨어질 수 있으며, 어떤 것도 그 가치를 약속하지 않는다는 것을 이해합니다. 민트된 TTTI-T 1개당 10,000 USD가 공동 준비금에서 USD로 산정되어 지불한 토큰(ICP, ckBTC, ckUSDC 또는 ckUSDT) 그대로 환전 없이 보관되며, 어떤 보유자든 상환 규칙에 따라 TTTI-T를 컨트랙트에 반환할 수 있습니다. 1 TTTI-T는 언제나 어떤 보유자든 10,000 USD로 상환할 수 있습니다.",
  ackIcpCreator:
    "발행 비용은 (10,000 USD + 제가 제공하는 유동성) × q를 0.99로 나눈 금액이며, ICP, ckBTC, ckUSDC 또는 ckUSDT로 지불합니다. 10,000 USD × q는 공동 준비금으로 가고, 제가 지불하는 금액의 1 %는 제작자에게 가며, 나머지는 제가 제공하는 유동성으로 제 포지션에 그대로 제 소유로 남습니다.",
  ackNoProfit:
    "저는 제작자로부터든 다른 누구로부터든 어떠한 수익 약속에도 의존하지 않습니다.",
  ackAffordLoss: "저는 전부 잃어도 감당할 수 있는 금액만 사용합니다.",
  ackLegend: "첫 구매 전에 필요합니다.",
  wtTitle: "지갑 약관",
  wtDescription:
    "아래 여섯 가지 항목을 읽은 뒤 체크박스를 선택하고 동의하십시오. 한 번만 요청되며, 발행 또는 상환에 필요합니다.",
  wtAcceptLabel: "이 약관을 읽었으며 이에 동의합니다",
  wtAcceptButton: "약관에 동의",
  wtBannerText: "지갑 약관에 아직 동의하지 않았습니다.",
  wtBannerButton: "약관 보기",
  wtOpenRefusal: "지갑 약관 확인 및 동의",
  wtPoint1Title: "백서",
  wtPoint2Title: "권리",
  wtPoint3Title: "가격",
  wtPoint4Title: "발행 비용",
  wtPoint5Title: "수익 약속 없음",
  wtPoint6Title: "손실 위험",
  ackWhitePaperLink: "‘먼저 읽어 주세요’ 섹션 열기",
  ackStatusUnavailable: "구매 확인 상태를 확인할 수 없습니다",
  ackTickAll: "발행을 활성화하려면 여섯 가지 진술을 모두 체크하세요.",
  retry: "다시 시도",
  invalidAmountTitle: "잘못된 금액",
  invalidAmountMessage: (symbol: string, decimals: number) =>
    `0보다 크고 소수점 이하 최대 ${decimals}자리인 ${symbol} 금액을 입력하세요.`,
  belowMinimumTitle: "최소 구매량 미만",
  belowMinimumMessage: (
    minimum: string,
    display: string,
    minimumUsd: string,
    symbol: string,
    about: string | null,
  ) =>
    `최소 ${minimum} ${display} (${symbol} 기준 ${minimumUsd})${about !== null ? `, 약 ${about}` : ""}.`,
  aboveRemainingTitle: "남은 수량 초과",
  aboveRemainingMessage: (remaining: string, display: string, max: string) =>
    `${remaining} ${display}만 남아 있습니다 (${max}).`,
  insufficientTitle: (symbol: string, fee: string) =>
    `${symbol} 부족 (금액 + 수수료 ${fee})`,
  insufficientMessage: (required: string) =>
    `수수료를 포함하여 ${required}이(가) 필요합니다.`,
  useMaximum: "최대값 사용",
  approvalFailed: (symbol: string) => `${symbol} 승인 실패`,
  purchaseNotCompleted: "구매가 완료되지 않았습니다",
  purchaseNotSubmitted: "구매를 제출할 수 없습니다. 다시 시도해 주세요.",
  recordingAcks: "구매 확인을 기록하는 중…",
  approving: (symbol: string) => `${symbol} 승인 중…`,
  buying: "발행 중…",
  saleComplete: "판매 종료",
  salesPaused: "판매가 일시 중지되었습니다",
  tokenUnavailable: (symbol: string) => `${symbol} 사용 불가`,
  buyWith: (symbol: string) => `${symbol}(으)로 발행`,
  received: (amount: string, display: string) =>
    `${amount} ${display}을(를) 받았습니다`,
  buyTtti: "TTTI-T 발행",
  buyHeading: "발행",
  mintInfoToggle: "buy-to-mint란 무엇인가요?",
  mintInfoBody1:
    "TTTI-T는 누군가가 표시된 환율로 ICP, ckBTC, ckUSDC 또는 ckUSDT를 지불할 때만 생성됩니다. 발행자가 제공한 유동성은 발행자 본인의 풀 포지션에 그대로 남습니다. 관리자를 포함해 누구도 다른 방법으로 TTTI-T를 생성할 수 없습니다.",
  mintInfoBody2:
    "비트코인은 채굴자가 에너지와 하드웨어라는 실제 자원을 쓸 때만 생겨납니다. TTTI-T는 누군가가 실제 토큰을 가져올 때만 생겨납니다. 양쪽 모두 이것이 실제로 감수하는 몫(skin in the game)입니다.",
  walletPlug: "Plug",
  walletBuiltIn: "내장 지갑",
  balanceLabel: (symbol: string) => `${symbol} 잔액`,
  unavailable: "사용 불가",
  noTreasury: (symbol: string) => `현재 ${symbol}(으)로 발행할 수 없습니다.`,
  youPayIn: (symbol: string) => `${symbol}(으)로 지불`,
  youReceive: "받는 수량",
  withFees: (amount: string) => ` · 수수료 포함 ${amount}`,
  totalDebited: "네트워크 수수료를 포함한 총 차감액:",
  noRateTitle: (symbol: string) =>
    `이번 시간에 유효한 ${symbol}/USD 환율이 없습니다`,
  noRateBody: (symbol: string) =>
    `환율이 설정될 때까지 ${symbol}(으)로 구매할 수 없습니다.`,
  finalMint: (symbol: string) => `${symbol} Mint`,
  finalMinting: "Mint 중…",
  finalConverting: "보유 중인 ckBTC 전환 중…",
  finalMoving: "DEX 잔액을 지갑으로 옮기는 중…",
  finalChecking: "잔액 확인 중…",
  finalSourceLabel: "사용되는 잔액",
  finalSourceWallet: (amount: string) => `지갑: ${amount}`,
  finalSourceDex: (amount: string) => `DEX 내부 잔액: ${amount}`,
  finalSourceContract: (amount: string) => `컨트랙트 보유: ${amount}`,
  finalPreview: (ttti: string, pay: string) => `${ttti} (지불 ${pay})`,
  finalFundFirst: (symbol: string) =>
    `지갑, DEX, 컨트랙트 어디에도 ${symbol}이(가) 없습니다. 먼저 계정에 자금을 넣어 주세요.`,
  finalEnterAmount: "위 양식에 수량을 입력한 다음 Mint를 누르세요.",
  finalDexMoved: (amount: string) =>
    `DEX 잔액에서 지갑으로 ${amount} 출금이 완료되었습니다. 수량을 입력한 다음 Mint를 누르세요.`,
  finalDexFailed: (detail: string) =>
    detail ? `DEX 출금에 실패했습니다. ${detail}` : "DEX 출금에 실패했습니다.",
  finalDexWithdrawing: "2단계 중 1단계: DEX에서 출금 중…",
  finalDexMinting: "2단계 중 2단계: Mint 중…",
  finalDexTooLow: (available: string, required: string) =>
    `원장 수수료를 제외한 DEX 잔액(${available})이 이번 Mint에 필요한 ${required}보다 적습니다. 출금된 금액은 없습니다.`,
  finalDexShort: (balance: string, required: string) =>
    `출금이 완료되었습니다. 지갑 잔액(${balance})이 이번 Mint에 필요한 ${required}보다 적습니다. 자금은 지갑에 남아 있습니다.`,
  finalDexMintKept: (amount: string) =>
    `Mint가 완료되지 않았습니다. ${amount}은(는) 지갑에 남아 있습니다. Mint를 눌러 지갑에서 다시 시도하세요.`,
  finalUseTokenForm:
    "이 잔액은 ckBTC 결제 양식에서 Mint됩니다. Mint를 누르면 해당 양식이 열립니다.",
};

export default ko;
