import type en from "./en";

const ko: typeof en = {
  requestFailed: "요청을 완료할 수 없습니다. 다시 시도하세요.",
  errorTitle: "비트코인 구매",
  intro:
    "본인의 비트코인 주소로 BTC를 보내세요. BTC는 ckBTC로 전환된 후 시간별 환율에 따라 TTTI-T로 전환됩니다. 금액의 1 %는 제작자에게 갑니다.",
  recordingAcks: "구매 확인을 기록하는 중…",
  creatingAddress: "주소 생성 중…",
  getAddress: "내 비트코인 주소 받기",
  tickAll: "주소를 받으려면 여섯 가지 진술을 모두 체크하세요.",
  purchaseAddressLabel: "내 비트코인 구매 주소",
  sentToDelivery: "TTTI-T는 아래의 전달 주소로 전송됩니다.",
  keepPageOpen:
    "입금이 감지될 때까지 이 페이지를 열어 두세요. 페이지를 떠나면, 이 페이지로 돌아왔을 때 그 시점의 환율로 구매가 완료됩니다. 그때 판매가 이미 종료되었다면 ckBTC로 환불됩니다.",
  delivered: (amount: string) => `${amount} TTTI-T 전달됨`,
  deliveredDetail: "시간별 ckBTC 환율 적용",
  refunded: (amount: string) => `${amount}이(가) 지갑으로 반환됨`,
  refundedDetail: "전환을 완료할 수 없어 ckBTC가 자동으로 반환되었습니다.",
  addressDefaultLabel: "비트코인 입금 주소",
  addressCopiedToast: "비트코인 주소가 복사되었습니다",
  addressCopyFailedToast: "주소를 복사할 수 없습니다",
  qrTitle: (address: string) => `비트코인 주소 ${address}의 QR 코드`,
  copyAddressAria: (address: string) => `비트코인 주소 ${address} 복사`,
  copied: "복사됨",
  clickToCopy: "주소를 클릭하면 복사됩니다.",
  errValueTooSmall: (minimum: string) =>
    `입금액이 너무 적습니다: 최소 금액 ${minimum} 미만입니다. 전환되지 않았습니다.`,
  errTainted: "ckBTC minter가 입금을 거부했습니다.",
  errMinterUnavailable:
    "ckBTC minter를 사용할 수 없습니다. 나중에 다시 확인하세요.",
  errOther: (server: string | undefined) =>
    server
      ? `입금을 처리할 수 없습니다. ${server}`
      : "입금을 처리할 수 없습니다.",
  notYet: "아직 아님",
  finalWallet: "지갑에 ckBTC 입금됨",
  finalRefunded: "ckBTC로 환불됨",
  finalDelivered: "TTTI-T 전달됨",
  stepAddress: "주소 표시됨",
  stepDetected: "입금 감지됨",
  stepConfirmations: (count: string) => `컨펌 ${count}`,
  stepMinted: "ckBTC 생성됨",
  amountBtcDetected: "감지된 BTC",
  amountCkbtcCreated: "생성된 ckBTC",
  amountCkbtcPending: "대기 중인 ckBTC",
  amountRefunded: "환불됨",
  amountTttiDelivered: "전달된 TTTI-T",
  progressAria: "비트코인 입금 진행 상황",
  pendingRate:
    "환율을 사용할 수 없습니다. ckBTC는 다음 시간별 환율까지 보관됩니다.",
  lastChecked: (time: string) => `마지막 확인: ${time}`,
  checking: "확인 중…",
  check: "확인",
  flowWallet: "BTC → ckBTC (지갑)",
  flowPurchase: "BTC → TTTI-T (구매)",
  noDepositYet: "이 주소로 아직 입금되지 않았습니다.",
  earlierDeposits: "이 주소의 이전 입금",
  depositNumber: (n: string) => `입금 ${n}`,
  detectedOn: (time: string) => `감지: ${time}`,
  stagePendingRate: "시간별 환율 대기 중",
  conversionCauseLine: (cause: string) => `변환 상태: ${cause}`,
  pendingDepositStatus: "비트코인 입금 진행 중.",
  pendingDepositLink: "비트코인 입금 보기",
  errUnrecoverable: (server: string | undefined) =>
    server
      ? `이 입금은 처리할 수 없습니다. ${server}`
      : "이 입금은 처리할 수 없습니다.",
  refundFailed: (amount: string) =>
    `초과분 환불에 실패했습니다. ${amount}이(가) 아직 보관되어 있으며, 환불은 자동으로 다시 시도됩니다.`,
  waitingNewTransfer: "이 주소로의 새 전송을 기다리는 중입니다.",
  depositFinished: (n: string, status: string) => `입금 ${n}: ${status}.`,
  waitForNew: "새 전송 기다리기",
  otherDeposits: "이 주소의 다른 입금",
  reuseWallet:
    "어떤 비트코인 지갑에서든 이 주소로 BTC를 보내십시오. 새 전송은 각각 자동으로 ckBTC로 변환됩니다. 같은 주소를 다시 사용할 수 있습니다.",
  reusePurchase:
    "어떤 비트코인 지갑에서든 이 주소로 BTC를 보내십시오. 새 전송은 각각 자동으로 변환되어 TTTI-T로 전달됩니다. 같은 주소를 다시 사용할 수 있습니다.",
  waitingDepositStatus: "비트코인 주소가 새 전송을 기다리는 중입니다.",
  waitingDepositLink: "비트코인 주소 보기",
  refundCause: (cause: string) => `원인: ${cause}`,
  refundPurposeFull: "전액 반환됨",
  refundPurposeExcess: "초과분 반환됨",
  refundPurposeDeliveryFailed: "전달 실패, 금액 반환됨",
  refundSending: "환불을 전송하는 중입니다.",
  refundRetrying: "환불이 자동으로 다시 시도됩니다.",
  refundTxLabel: "환불 거래",
  heldNote: (amount: string) =>
    `컨트랙트가 ${amount}을(를) 보유하고 있습니다. 아래 Mint 버튼으로 지금 전환할 수 있습니다. 전환을 완료할 수 없으면 지갑으로의 환불이 자동으로 시작됩니다.`,
  convertDelivered: (amount: string) => `${amount} TTTI-T 전달됨`,
  convertRefunded: (amount: string) => `${amount}이(가) 지갑으로 반환됨`,
  convertStillHeld: (amount: string) =>
    `컨트랙트가 아직 ${amount}을(를) 보유하고 있습니다. 전환은 자동으로 다시 시도됩니다.`,
  convertNothing: "전환을 기다리는 ckBTC가 없습니다.",
  convertFailedTitle: "전환이 완료되지 않음",
  convertNothingTaken:
    "아무것도 차감되지 않았습니다. 자금은 그대로 보관되거나 지갑으로 반환됩니다. Mint를 다시 클릭할 수 있습니다.",
  depositAlertDeliveredTitle: "비트코인 입금 전달됨",
  depositAlertDeliveredText: (amount: string) =>
    `비트코인 입금에 대해 ${amount}을(를) 받았습니다.`,
  depositAlertRefundedTitle: "비트코인 입금 환불됨",
  depositAlertRefundedText: (amount: string) =>
    `${amount}이(가) 지갑으로 반환되었습니다. 전환을 완료할 수 없었습니다.`,
  depositAlertViewDeposit: "입금 보기",
  depositAlertViewHistory: "내역 보기",
};

export default ko;
