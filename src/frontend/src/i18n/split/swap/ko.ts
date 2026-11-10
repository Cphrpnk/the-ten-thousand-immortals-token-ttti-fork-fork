import type en from "./en";

const ko: typeof en = {
  description:
    "본인 지갑에서 ICPSwap 풀을 통해 ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT 및 추가한 ICPSwap 상장 토큰을 스왑합니다.",
  from: "보내는 토큰",
  to: "받는 토큰",
  switchTokens: "두 토큰 바꾸기",
  amount: "수량",
  balance: (amount: string, symbol: string) => `잔액: ${amount} ${symbol}`,
  sameToken: "서로 다른 두 토큰을 선택하세요.",
  poolLoading: "ICPSwap 풀을 찾는 중…",
  poolError: "ICPSwap 풀을 읽을 수 없습니다.",
  noPool: (a: string, b: string) =>
    `ICPSwap에 ${a}와 ${b}의 직접 풀이 없습니다. 이 쌍은 여기에서 스왑할 수 없습니다.`,
  quoteLoading: "ICPSwap 견적을 읽는 중…",
  quoteError: "ICPSwap 풀이 견적을 반환하지 않았습니다.",
  livePriceUnavailable:
    "ICPSwap 실시간 가격을 사용할 수 없어 스왑을 시작하지 않았습니다. 잠시 후 다시 시도하세요.",
  quoteExpired: "견적이 만료되었습니다. 스왑 전에 새로 고치세요.",
  refreshQuote: "견적 새로 고침",
  estimated: "예상 수령액",
  poolFee: "풀 수수료",
  ledgerFees: "원장 수수료",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees}(승인 및 입금) + ${outFee}(출금)`,
  minimumReceived: "보장 최소 수령액",
  slippage: "슬리피지 허용 범위",
  slippageHint: "결과가 보장 최소액보다 적으면 ICPSwap이 스왑을 거부합니다.",
  slippageInvalid: "0.01 %에서 50 % 사이의 허용 범위를 입력하세요.",
  amountInvalid: (symbol: string) => `유효한 ${symbol} 수량을 입력하세요.`,
  insufficient: (max: string, symbol: string) =>
    `사용 가능한 잔액을 초과했습니다. 최대: ${max} ${symbol}(잔액에서 승인 및 입금 수수료를 뺀 값).`,
  tooSmall: "예상 결과가 출금 수수료를 충당하지 못합니다.",
  connectHint: "스왑하려면 지갑을 연결하세요.",
  review: "스왑 검토",
  confirmTitle: "서명하는 내용",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `ICPSwap 풀 ${pool}이 귀하의 계정에서 정확히 ${amount} ${symbol}(스왑 수량과 원장 수수료 1회분)을 가져갈 수 있도록 허용하는 ICRC-2 승인입니다.`,
  confirmExpiry: (time: string) =>
    `승인은 서명 후 15분 뒤(약 ${time})에 만료됩니다.`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `그런 다음 풀이 ${symbolIn}을 가져가고(입금), 스왑한 뒤 ${symbolOut}을 귀하의 지갑으로 보냅니다(출금). 지갑에서 각 단계의 확인을 요청할 수 있습니다.`,
  confirmMinimum: (amount: string, symbol: string) =>
    `최소 수령액: ${amount} ${symbol}. 그보다 적으면 스왑이 거부됩니다.`,
  confirmSigner: (wallet: string) => `이 계정을 보유한 ${wallet}이 서명합니다.`,
  warning:
    "ICPSwap은 제3자 거래소입니다. 스왑은 최종적이며 원장 수수료는 환불되지 않습니다. 한 단계가 실패하면 입금된 금액은 출금할 때까지 풀에 남습니다.",
  confirmCheck: "서명 내용을 읽었으며 이 스왑을 확인합니다.",
  confirm: "확인 및 서명",
  back: "뒤로",
  stepApprove: "지갑에서 승인 중…",
  stepDeposit: "풀에 입금 중…",
  stepSwap: "스왑 중…",
  stepWithdraw: "지갑으로 출금 중…",
  refused: "서명이 거부되었습니다. 아무것도 스왑되지 않았습니다.",
  slippageError:
    "풀이 스왑을 거부했습니다: 결과가 보장 최소액보다 적습니다. 견적을 새로 고치거나 허용 범위를 높이세요.",
  failed: (detail: string) => `스왑이 완료되지 않았습니다: ${detail}`,
  success: (amount: string, symbol: string) =>
    `스왑 완료. 지갑에 ${amount} ${symbol}을 받았습니다.`,
  newSwap: "새 스왑",
  unusedTitle: "ICPSwap 풀에 남은 잔액",
  unusedText:
    "스왑이 완료되지 않아 풀이 귀하의 계정을 위해 이 금액을 보관합니다.",
  dexBalanceTitle: "DEX에 남은 잔액",
  dexBalanceText:
    "스왑이 완료되지 않아 DEX가 귀하의 계정을 위해 이 금액을 보관합니다.",
  withdrawUnused: "내 지갑으로 출금",
  withdrawing: "출금 중…",
  withdrawDone: "잔액이 지갑으로 출금되었습니다.",
  withdrawFailed: (detail: string) => `출금에 실패했습니다: ${detail}`,
  feeError: "토큰 원장 수수료를 읽을 수 없습니다. 다시 시도하세요.",
  addToken: "토큰 추가",
  addTokenLabel: "심볼 또는 원장 ID",
  addTokenHint:
    "ICPSwap에 상장된 토큰을 심볼로 검색하거나 원장 ID를 붙여넣으세요. 추가한 토큰은 이 브라우저에 저장되며 이 선택기에만 표시됩니다.",
  addTokenSubmit: "추가",
  addTokenReading: "토큰 원장을 읽는 중…",
  addTokenListLoading: "ICPSwap 토큰 목록을 읽는 중…",
  addTokenListError:
    "ICPSwap 토큰 목록을 읽을 수 없습니다. 대신 원장 ID를 붙여넣으세요.",
  addTokenNoMatch:
    "이 심볼과 일치하는 ICPSwap 상장 토큰이 없습니다. 대신 원장 ID를 붙여넣으세요.",
  addTokenInvalidId: "유효하지 않은 원장 ID입니다.",
  addTokenNotIcrc:
    "이 canister가 ICRC-1 토큰 메타데이터를 반환하지 않았습니다. 추가할 수 없습니다.",
  addTokenAlready: (symbol: string) => `${symbol}은 이미 목록에 있습니다.`,
  addTokenDone: (symbol: string) => `${symbol}을 추가했습니다.`,
  addedTokens: "추가한 토큰",
  removeToken: (symbol: string) => `${symbol} 제거`,
  closeAddToken: "닫기",
  unifiedDescription:
    "본인 지갑에서 네이티브 풀 또는 ICPSwap을 통해 ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT 및 추가한 ICPSwap 상장 토큰을 스왑합니다.",
  routesTitle: "경로",
  routeBestPrice: "최적 가격",
  routeSelected: "선택됨",
  routeEnterAmount: "금액을 입력하면 이 경로의 견적이 표시됩니다.",
  routeQuoteLoading: "견적을 읽는 중…",
  routeNativeNoPool: (a: string, b: string) =>
    `${a}와(과) ${b}에 대한 네이티브 풀이 없습니다.`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap에는 ${a}와(과) ${b}의 직접 풀이 없습니다.`,
  routeNativeAccount:
    "네이티브 풀 경로는 이 사이트에 로그인한 계정에서만 사용할 수 있습니다.",
  routeNativeError: "네이티브 풀이 견적을 반환하지 않았습니다.",
  routeOnlyIcpswap: "이 쌍에는 ICPSwap만 제공됩니다.",
  routeOnlyNative: "이 쌍에는 네이티브 풀만 제공됩니다.",
  bestPriceNote:
    "최적 가격: 수수료 포함 가장 많은 토큰을 돌려주는 경로입니다. 선택하신 경로가 실행됩니다.",
  routeUsed: "사용 경로",
  amountGiven: "보내는 금액",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `DEX가 계정에서 최대 ${amount} ${symbol}(스왑 금액 + 원장 수수료 1회)을 가져갈 수 있도록 허용하는 ICRC-2 승인입니다.`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `이후 DEX가 ${symbolIn}을(를) 가져오고(입금), 네이티브 풀에서 스왑한 뒤 ${symbolOut}을(를) 지갑으로 보냅니다(출금).`,
  warningNative:
    "스왑은 최종적이며 원장 수수료는 환불되지 않습니다. 출금이 실패하면 스왑된 금액은 DEX 잔액에 남습니다.",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `스왑은 완료되었지만 ${amount} ${symbol}을(를) 지갑으로 출금하지 못했습니다: ${detail}. 해당 금액은 DEX 잔액에 남습니다.`,
};

export default ko;
