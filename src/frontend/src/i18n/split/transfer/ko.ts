import type en from "./en";

const ko: typeof en = {
  contractAddressRefused:
    "토큰은 소각할 수 없으며, 컨트랙트 주소로의 전송은 거부됩니다.",
  badFee: "전송 수수료가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `잔액이 부족합니다. 현재 잔액은 ${balance} ${symbol}입니다.`,
  insufficientFunds: "이 전송을 위한 잔액이 부족합니다.",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `허용 한도가 부족합니다. 현재 허용 한도: ${allowance} ${symbol}.`,
  insufficientAllowance: "이 전송을 위한 허용 한도가 부족합니다.",
  duplicateTransfer: "이미 처리된 거래입니다.",
  temporarilyUnavailable:
    "원장을 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
  createdInFuture:
    "생성 시각이 미래로 되어 있어 원장이 거부했습니다. 다시 시도하세요.",
  tooOldTransfer: "너무 오래된 거래라 처리할 수 없습니다. 다시 시도하세요.",
  genericRejected:
    "원장이 이 요청을 거부했습니다. 대상을 확인한 후 다시 시도하세요.",
  rejected: "원장이 이 요청을 거부했습니다.",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `허용 한도가 변경되었습니다. 현재 허용 한도: ${current} ${symbol}.`,
  allowanceChanged: "허용 한도가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
  approveExpired: "이 승인은 처리되기 전에 만료되었습니다.",
  approveExpiredFrom: "승인 기간이 만료되었습니다. 다시 시도하세요.",
  approveInsufficientFunds: "승인 수수료를 낼 잔액이 부족합니다.",
  approveBadFee: "승인 수수료가 변경되었습니다. 새로 고친 후 다시 시도하세요.",
  approveDuplicate: "이미 처리된 승인입니다.",
  approveTooOld: "너무 오래된 승인이라 처리할 수 없습니다. 다시 시도하세요.",
  approveRejected: "원장이 이 승인을 거부했습니다.",
  destinationUnavailable:
    "대상 확인을 사용할 수 없습니다. 잠시 후 다시 시도하세요.",
  invalidAmount: (decimals: number) =>
    `0보다 큰 수량을 소수점 이하 최대 ${decimals}자리까지 입력하세요.`,
  transferFailed: "전송에 실패했습니다. 대상을 확인한 후 다시 시도하세요.",
  amountLabel: (symbol: string) => `수량 (${symbol})`,

  signedOutTitle: "토큰을 관리하려면 로그인하세요",
  signedOutBody:
    "전송과 승인은 Internet Identity principal에 연결됩니다. 계속하려면 헤더에서 로그인하세요.",
  balanceLabel: "내 잔액",

  invalidRecipient: "유효한 수신자 Principal ID를 입력하세요.",
  transferSent: (amount: string, symbol: string, to: string) =>
    `${to}에게 ${amount} ${symbol}을(를) 보냈습니다.`,
  toastTransfer: "전송 완료",
  transferTitle: (symbol: string) => `${symbol} 전송`,
  transferDescription: (fee: string, symbol: string) =>
    `내 principal에서 다른 계정으로 토큰을 보냅니다. 전송 수수료 ${fee} ${symbol}은(는) 잔액에서 차감되어 수수료 수취 계정에 입금됩니다.`,
  recipientLabel: "수신자 Principal",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `소수점 이하 최대 ${decimals}자리. 수수료: ${fee} ${symbol}. 보내는 계정: ${from}.`,
  sending: "보내는 중...",
  sendTokens: "토큰 보내기",

  invalidSpender: "유효한 사용자(spender) Principal ID를 입력하세요.",
  invalidAllowance: (decimals: number) =>
    `0보다 큰 허용 한도를 소수점 이하 최대 ${decimals}자리까지 입력하세요.`,
  approved: (amount: string, symbol: string, spender: string) =>
    `${spender}에게 ${amount} ${symbol}을(를) 승인했습니다.`,
  toastApproved: "허용 한도 승인됨",
  approvalFailed: "승인에 실패했습니다. 다시 시도하세요.",
  approveTitle: "사용자(spender) 승인",
  approveDescription:
    "다른 principal이 나를 대신해 토큰을 전송하도록 허용합니다.",
  spenderLabel: "사용자(spender) Principal",
  allowanceLabel: (symbol: string) => `허용 한도 (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `소수점 이하 최대 ${decimals}자리. 승인 시 ${symbol} 전송 수수료가 부과됩니다.`,
  approving: "승인 중...",
  approveAllowance: "허용 한도 승인",
  currentAllowance: "현재 허용 한도",
  currentAllowanceFor: (spender: string) => `${spender}의 현재 허용 한도`,
  enterSpenderToView: "확인하려면 사용자(spender)를 입력하세요",
  loading: "불러오는 중…",

  invalidFrom: "유효한 보내는 쪽 Principal ID를 입력하세요.",
  invalidTo: "유효한 받는 쪽 Principal ID를 입력하세요.",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `${from}에서 ${to}(으)로 ${amount} ${symbol}을(를) 전송했습니다.`,
  toastTransferFrom: "허용 한도 전송 완료",
  transferFromTitle: "허용 한도에서 전송",
  transferFromDescription:
    "부여받은 허용 한도를 사용해 다른 principal의 계정에서 토큰을 옮깁니다.",
  fromLabel: "보내는 쪽 Principal",
  toLabel: "받는 쪽 Principal",
  transferring: "전송 중...",
  transferFromButton: "허용 한도 전송",

  pageTitle: "토큰 관리",
  pageSubtitle: (symbol: string) => `${symbol} 전송, 승인 및 허용 한도 사용.`,
  feeBadge: (fee: string, symbol: string) => `수수료 ${fee} ${symbol}`,
  tabTransfer: "전송",
  tabApprove: "승인",
  tabTransferFrom: "허용 한도 전송",
};

export default ko;
