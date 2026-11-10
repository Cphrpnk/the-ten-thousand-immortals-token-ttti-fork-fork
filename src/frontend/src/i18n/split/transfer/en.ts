const en = {
  // Shared ledger errors
  contractAddressRefused:
    "Tokens cannot be burned; transfers to the contract address are refused.",
  badFee: "The transfer fee changed. Refresh and try again.",
  insufficientFundsBalance: (balance: string, symbol: string) =>
    `Insufficient funds. Your balance is ${balance} ${symbol}.`,
  insufficientFunds: "Insufficient funds for this transfer.",
  insufficientAllowanceAmount: (allowance: string, symbol: string) =>
    `The allowance is too low. Current allowance: ${allowance} ${symbol}.`,
  insufficientAllowance: "The allowance is too low for this transfer.",
  duplicateTransfer: "This transaction was already processed.",
  temporarilyUnavailable:
    "The ledger is temporarily unavailable. Try again shortly.",
  createdInFuture:
    "The ledger rejected this as created in the future. Try again.",
  tooOldTransfer: "This transaction is too old to process. Try again.",
  genericRejected:
    "The ledger rejected this request. Check the destination and try again.",
  rejected: "The ledger rejected this request.",
  allowanceChangedAmount: (current: string, symbol: string) =>
    `The allowance changed. Current allowance: ${current} ${symbol}.`,
  allowanceChanged: "The allowance changed. Refresh and try again.",
  approveExpired: "This approval expired before it was processed.",
  approveExpiredFrom: "The approval window expired. Try again.",
  approveInsufficientFunds: "Insufficient funds to cover the approval fee.",
  approveBadFee: "The approval fee changed. Refresh and try again.",
  approveDuplicate: "This approval was already processed.",
  approveTooOld: "This approval is too old to process. Try again.",
  approveRejected: "The ledger rejected this approval.",
  destinationUnavailable:
    "Destination validation is unavailable. Please try again shortly.",
  invalidAmount: (decimals: number) =>
    `Enter an amount greater than 0 with up to ${decimals} decimals.`,
  transferFailed: "Transfer failed. Check the destination and try again.",
  amountLabel: (symbol: string) => `Amount (${symbol})`,

  // Signed out / balance
  signedOutTitle: "Sign in to manage your tokens",
  signedOutBody:
    "Transfers and approvals are tied to your Internet Identity principal. Sign in from the header to continue.",
  balanceLabel: "Your balance",

  // Transfer
  invalidRecipient: "Enter a valid recipient principal ID.",
  transferSent: (amount: string, symbol: string, to: string) =>
    `Sent ${amount} ${symbol} to ${to}.`,
  toastTransfer: "Transfer complete",
  transferTitle: (symbol: string) => `Transfer ${symbol}`,
  transferDescription: (fee: string, symbol: string) =>
    `Send tokens from your principal to another account. The transfer fee of ${fee} ${symbol} is deducted from your balance and credited to the fee collector.`,
  recipientLabel: "Recipient Principal",
  transferHint: (decimals: number, fee: string, symbol: string, from: string) =>
    `Up to ${decimals} decimals. Fee: ${fee} ${symbol}. Sending from ${from}.`,
  sending: "Sending...",
  sendTokens: "Send Tokens",

  // Approve
  invalidSpender: "Enter a valid spender principal ID.",
  invalidAllowance: (decimals: number) =>
    `Enter an allowance greater than 0 with up to ${decimals} decimals.`,
  approved: (amount: string, symbol: string, spender: string) =>
    `Approved ${amount} ${symbol} for ${spender}.`,
  toastApproved: "Allowance approved",
  approvalFailed: "Approval failed. Please try again.",
  approveTitle: "Approve a Spender",
  approveDescription:
    "Allow another principal to transfer tokens on your behalf.",
  spenderLabel: "Spender Principal",
  allowanceLabel: (symbol: string) => `Allowance (${symbol})`,
  approveHint: (decimals: number, symbol: string) =>
    `Up to ${decimals} decimals. Approving charges the ${symbol} transfer fee.`,
  approving: "Approving...",
  approveAllowance: "Approve Allowance",
  currentAllowance: "Current allowance",
  currentAllowanceFor: (spender: string) => `Current allowance for ${spender}`,
  enterSpenderToView: "Enter a spender to view",
  loading: "Loading…",

  // Transfer from
  invalidFrom: "Enter a valid 'from' principal ID.",
  invalidTo: "Enter a valid 'to' principal ID.",
  transferredFrom: (amount: string, symbol: string, from: string, to: string) =>
    `Transferred ${amount} ${symbol} from ${from} to ${to}.`,
  toastTransferFrom: "Transfer from complete",
  transferFromTitle: "Transfer From an Allowance",
  transferFromDescription:
    "Spend an allowance you were granted to move tokens from another principal's account.",
  fromLabel: "From Principal",
  toLabel: "To Principal",
  transferring: "Transferring...",
  transferFromButton: "Transfer From",

  // Page header and tabs
  pageTitle: "Manage Tokens",
  pageSubtitle: (symbol: string) =>
    `Transfer, approve and spend ${symbol} allowances.`,
  feeBadge: (fee: string, symbol: string) => `Fee ${fee} ${symbol}`,
  tabTransfer: "Transfer",
  tabApprove: "Approve",
  tabTransferFrom: "Transfer From",
};

export default en;
