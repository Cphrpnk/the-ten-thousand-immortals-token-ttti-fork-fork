import type en from "./en";

const paGuru: typeof en = {
  contractAddressRefused:
    "ਟੋਕਨ ਸਾੜੇ ਨਹੀਂ ਜਾ ਸਕਦੇ; ਕੰਟਰੈਕਟ ਪਤੇ ਵੱਲ ਟ੍ਰਾਂਸਫਰ ਰੱਦ ਕੀਤੇ ਜਾਂਦੇ ਹਨ।",
  badFee: "ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `ਨਾਕਾਫ਼ੀ ਫੰਡ। ਤੁਹਾਡਾ ਬਕਾਇਆ ${balance} ${symbol} ਹੈ।`,
  insufficientFunds: "ਇਸ ਟ੍ਰਾਂਸਫਰ ਲਈ ਨਾਕਾਫ਼ੀ ਫੰਡ।",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `ਮਨਜ਼ੂਰ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ: ${allowance} ${symbol}।`,
  insufficientAllowance: "ਇਸ ਟ੍ਰਾਂਸਫਰ ਲਈ ਮਨਜ਼ੂਰ ਰਕਮ ਬਹੁਤ ਘੱਟ ਹੈ।",
  duplicateTransfer: "ਇਹ ਲੈਣ-ਦੇਣ ਪਹਿਲਾਂ ਹੀ ਪ੍ਰੋਸੈਸ ਹੋ ਚੁੱਕਾ ਹੈ।",
  temporarilyUnavailable:
    "ਲੈਜਰ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  createdInFuture: "ਲੈਜਰ ਨੇ ਇਸਨੂੰ ਭਵਿੱਖ ਵਿੱਚ ਬਣਾਇਆ ਮੰਨ ਕੇ ਰੱਦ ਕਰ ਦਿੱਤਾ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  tooOldTransfer: "ਇਹ ਲੈਣ-ਦੇਣ ਪ੍ਰੋਸੈਸ ਕਰਨ ਲਈ ਬਹੁਤ ਪੁਰਾਣਾ ਹੈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  genericRejected: "ਲੈਜਰ ਨੇ ਇਹ ਬੇਨਤੀ ਰੱਦ ਕਰ ਦਿੱਤੀ। ਮੰਜ਼ਿਲ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  rejected: "ਲੈਜਰ ਨੇ ਇਹ ਬੇਨਤੀ ਰੱਦ ਕਰ ਦਿੱਤੀ।",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `ਮਨਜ਼ੂਰ ਰਕਮ ਬਦਲ ਗਈ ਹੈ। ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ: ${current} ${symbol}।`,
  allowanceChanged: "ਮਨਜ਼ੂਰ ਰਕਮ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  approveExpired: "ਇਹ ਮਨਜ਼ੂਰੀ ਪ੍ਰੋਸੈਸ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਮਿਆਦ ਪੁੱਗ ਗਈ।",
  approveExpiredFrom: "ਮਨਜ਼ੂਰੀ ਦੀ ਮਿਆਦ ਪੁੱਗ ਗਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  approveInsufficientFunds: "ਮਨਜ਼ੂਰੀ ਫੀਸ ਭਰਨ ਲਈ ਨਾਕਾਫ਼ੀ ਫੰਡ।",
  approveBadFee: "ਮਨਜ਼ੂਰੀ ਫੀਸ ਬਦਲ ਗਈ ਹੈ। ਰੀਫ੍ਰੈਸ਼ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  approveDuplicate: "ਇਹ ਮਨਜ਼ੂਰੀ ਪਹਿਲਾਂ ਹੀ ਪ੍ਰੋਸੈਸ ਹੋ ਚੁੱਕੀ ਹੈ।",
  approveTooOld: "ਇਹ ਮਨਜ਼ੂਰੀ ਪ੍ਰੋਸੈਸ ਕਰਨ ਲਈ ਬਹੁਤ ਪੁਰਾਣੀ ਹੈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  approveRejected: "ਲੈਜਰ ਨੇ ਇਹ ਮਨਜ਼ੂਰੀ ਰੱਦ ਕਰ ਦਿੱਤੀ।",
  destinationUnavailable:
    "ਮੰਜ਼ਿਲ ਦੀ ਪੁਸ਼ਟੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  invalidAmount: (decimals: number) =>
    `0 ਤੋਂ ਵੱਧ ਰਕਮ ਦਰਜ ਕਰੋ, ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਨਾਲ।`,
  transferFailed: "ਟ੍ਰਾਂਸਫਰ ਅਸਫਲ ਰਿਹਾ। ਮੰਜ਼ਿਲ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  amountLabel: (symbol: string) => `ਰਕਮ (${symbol})`,

  signedOutTitle: "ਆਪਣੇ ਟੋਕਨਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ",
  signedOutBody:
    "ਟ੍ਰਾਂਸਫਰ ਅਤੇ ਮਨਜ਼ੂਰੀਆਂ ਤੁਹਾਡੇ Internet Identity principal ਨਾਲ ਜੁੜੀਆਂ ਹਨ। ਜਾਰੀ ਰੱਖਣ ਲਈ ਹੈਡਰ ਤੋਂ ਸਾਈਨ ਇਨ ਕਰੋ।",
  balanceLabel: "ਤੁਹਾਡਾ ਬਕਾਇਆ",

  invalidRecipient: "ਇੱਕ ਵੈਧ ਪ੍ਰਾਪਤਕਰਤਾ Principal ID ਦਰਜ ਕਰੋ।",
  transferSent: (amount: string, symbol: string, to: string) =>
    `${amount} ${symbol} ${to} ਨੂੰ ਭੇਜੇ ਗਏ।`,
  toastTransfer: "ਟ੍ਰਾਂਸਫਰ ਪੂਰਾ ਹੋਇਆ",
  transferTitle: (symbol: string) => `${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ`,
  transferDescription: (fee: string, symbol: string) =>
    `ਆਪਣੇ principal ਤੋਂ ਕਿਸੇ ਹੋਰ ਖਾਤੇ ਵਿੱਚ ਟੋਕਨ ਭੇਜੋ। ${fee} ${symbol} ਦੀ ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਤੁਹਾਡੇ ਬਕਾਏ ਵਿੱਚੋਂ ਕੱਟੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਫੀਸ ਕਲੈਕਟਰ ਦੇ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੁੰਦੀ ਹੈ।`,
  recipientLabel: "ਪ੍ਰਾਪਤਕਰਤਾ Principal",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕ। ਫੀਸ: ${fee} ${symbol}। ${from} ਤੋਂ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ।`,
  sending: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
  sendTokens: "ਟੋਕਨ ਭੇਜੋ",

  invalidSpender: "ਇੱਕ ਵੈਧ ਖਰਚਕਰਤਾ Principal ID ਦਰਜ ਕਰੋ।",
  invalidAllowance: (decimals: number) =>
    `0 ਤੋਂ ਵੱਧ ਮਨਜ਼ੂਰ ਰਕਮ ਦਰਜ ਕਰੋ, ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕਾਂ ਨਾਲ।`,
  approved: (amount: string, symbol: string, spender: string) =>
    `${spender} ਲਈ ${amount} ${symbol} ਮਨਜ਼ੂਰ ਕੀਤੇ ਗਏ।`,
  toastApproved: "ਮਨਜ਼ੂਰ ਰਕਮ ਪ੍ਰਵਾਨ ਹੋਈ",
  approvalFailed: "ਮਨਜ਼ੂਰੀ ਅਸਫਲ ਰਹੀ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
  approveTitle: "ਖਰਚਕਰਤਾ ਨੂੰ ਮਨਜ਼ੂਰੀ ਦਿਓ",
  approveDescription:
    "ਕਿਸੇ ਹੋਰ principal ਨੂੰ ਤੁਹਾਡੀ ਤਰਫ਼ੋਂ ਟੋਕਨ ਟ੍ਰਾਂਸਫਰ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।",
  spenderLabel: "ਖਰਚਕਰਤਾ Principal",
  allowanceLabel: (symbol: string) => `ਮਨਜ਼ੂਰ ਰਕਮ (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `ਵੱਧ ਤੋਂ ਵੱਧ ${decimals} ਦਸ਼ਮਲਵ ਅੰਕ। ਮਨਜ਼ੂਰੀ 'ਤੇ ${symbol} ਟ੍ਰਾਂਸਫਰ ਫੀਸ ਲੱਗਦੀ ਹੈ।`,
  approving: "ਮਨਜ਼ੂਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
  approveAllowance: "ਮਨਜ਼ੂਰ ਰਕਮ ਪ੍ਰਵਾਨ ਕਰੋ",
  currentAllowance: "ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ",
  currentAllowanceFor: (spender: string) => `${spender} ਲਈ ਮੌਜੂਦਾ ਮਨਜ਼ੂਰ ਰਕਮ`,
  enterSpenderToView: "ਵੇਖਣ ਲਈ ਖਰਚਕਰਤਾ ਦਰਜ ਕਰੋ",
  loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…",

  invalidFrom: "ਇੱਕ ਵੈਧ 'ਤੋਂ' Principal ID ਦਰਜ ਕਰੋ।",
  invalidTo: "ਇੱਕ ਵੈਧ 'ਨੂੰ' Principal ID ਦਰਜ ਕਰੋ।",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `${amount} ${symbol} ${from} ਤੋਂ ${to} ਨੂੰ ਟ੍ਰਾਂਸਫਰ ਕੀਤੇ ਗਏ।`,
  toastTransferFrom: "ਮਨਜ਼ੂਰ ਰਕਮ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਪੂਰਾ ਹੋਇਆ",
  transferFromTitle: "ਮਨਜ਼ੂਰ ਰਕਮ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਕਰੋ",
  transferFromDescription:
    "ਤੁਹਾਨੂੰ ਦਿੱਤੀ ਗਈ ਮਨਜ਼ੂਰ ਰਕਮ ਵਰਤ ਕੇ ਕਿਸੇ ਹੋਰ principal ਦੇ ਖਾਤੇ ਤੋਂ ਟੋਕਨ ਭੇਜੋ।",
  fromLabel: "ਭੇਜਣ ਵਾਲਾ Principal",
  toLabel: "ਪ੍ਰਾਪਤ ਕਰਨ ਵਾਲਾ Principal",
  transferring: "ਟ੍ਰਾਂਸਫਰ ਹੋ ਰਿਹਾ ਹੈ...",
  transferFromButton: "ਇਸ ਤੋਂ ਟ੍ਰਾਂਸਫਰ ਕਰੋ",

  pageTitle: "ਟੋਕਨਾਂ ਦਾ ਪ੍ਰਬੰਧ",
  pageSubtitle: (symbol: string) =>
    `${symbol} ਟ੍ਰਾਂਸਫਰ ਕਰੋ, ਮਨਜ਼ੂਰ ਕਰੋ ਅਤੇ ਮਨਜ਼ੂਰ ਰਕਮਾਂ ਖਰਚੋ।`,
  feeBadge: (fee: string, symbol: string) => `ਫੀਸ ${fee} ${symbol}`,
  tabTransfer: "ਟ੍ਰਾਂਸਫਰ",
  tabApprove: "ਮਨਜ਼ੂਰ ਕਰੋ",
  tabTransferFrom: "ਇਸ ਤੋਂ ਟ੍ਰਾਂਸਫਰ",
};

export default paGuru;
