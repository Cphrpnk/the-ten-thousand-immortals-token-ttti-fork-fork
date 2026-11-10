const en = {
  description:
    "Swap ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT and the ICPSwap-listed tokens you add, through an ICPSwap pool, from your own wallet.",
  from: "From",
  to: "To",
  switchTokens: "Switch the two tokens",
  amount: "Amount",
  balance: (amount: string, symbol: string) => `Balance: ${amount} ${symbol}`,
  sameToken: "Choose two different tokens.",
  poolLoading: "Looking up the ICPSwap pool…",
  poolError: "The ICPSwap pool could not be read.",
  noPool: (a: string, b: string) =>
    `ICPSwap has no direct pool for ${a} and ${b}. This pair cannot be swapped here.`,
  quoteLoading: "Reading the ICPSwap quote…",
  quoteError: "The ICPSwap pool did not return a quote.",
  livePriceUnavailable:
    "The live ICPSwap price is unavailable, so the swap was not started. Try again in a moment.",
  quoteExpired: "The quote has expired. Refresh it before swapping.",
  refreshQuote: "Refresh quote",
  estimated: "Estimated received",
  poolFee: "Pool fee",
  ledgerFees: "Ledger fees",
  ledgerFeesValue: (inFees: string, outFee: string) =>
    `${inFees} (approval and deposit) + ${outFee} (withdrawal)`,
  minimumReceived: "Guaranteed minimum received",
  slippage: "Slippage tolerance",
  slippageHint:
    "ICPSwap refuses the swap if the output is below the guaranteed minimum.",
  slippageInvalid: "Enter a tolerance between 0.01 % and 50 %.",
  amountInvalid: (symbol: string) => `Enter a valid ${symbol} amount.`,
  insufficient: (max: string, symbol: string) =>
    `Amount above the usable balance. Maximum: ${max} ${symbol} (balance minus the approval and deposit fees).`,
  tooSmall: "The estimated output does not cover the withdrawal fee.",
  connectHint: "Connect a wallet to swap.",
  review: "Review swap",
  confirmTitle: "What you sign",
  confirmApproval: (amount: string, symbol: string, pool: string) =>
    `An ICRC-2 approval allowing the ICPSwap pool ${pool} to take exactly ${amount} ${symbol} (swap amount plus one ledger fee) from your account.`,
  confirmExpiry: (time: string) =>
    `The approval expires 15 minutes after signing (around ${time}).`,
  confirmSteps: (symbolIn: string, symbolOut: string) =>
    `The pool then takes the ${symbolIn} (deposit), swaps them and sends the ${symbolOut} to your wallet (withdrawal). Your wallet may ask you to confirm each step.`,
  confirmMinimum: (amount: string, symbol: string) =>
    `Minimum received: ${amount} ${symbol}. Below that, the swap is refused.`,
  confirmSigner: (wallet: string) =>
    `Signed by ${wallet}, which holds this account.`,
  warning:
    "ICPSwap is a third-party exchange. Swaps are final and ledger fees are not refunded. If a step fails, the deposited amount stays in the pool until you withdraw it.",
  confirmCheck: "I have read what I sign and confirm this swap.",
  confirm: "Confirm and sign",
  back: "Back",
  stepApprove: "Approval in the wallet…",
  stepDeposit: "Deposit into the pool…",
  stepSwap: "Swap…",
  stepWithdraw: "Withdrawal to your wallet…",
  refused: "The signature was refused. Nothing was swapped.",
  slippageError:
    "The pool refused the swap: the output would be below the guaranteed minimum. Refresh the quote or raise the tolerance.",
  failed: (detail: string) => `The swap did not complete: ${detail}`,
  success: (amount: string, symbol: string) =>
    `Swap completed. ${amount} ${symbol} received in your wallet.`,
  newSwap: "New swap",
  unusedTitle: "Balance left in the ICPSwap pool",
  unusedText:
    "The pool holds this amount for your account after an incomplete swap.",
  dexBalanceTitle: "Balance left in the DEX",
  dexBalanceText:
    "The DEX holds this amount for your account after an incomplete swap.",
  withdrawUnused: "Withdraw to my wallet",
  withdrawing: "Withdrawing…",
  withdrawDone: "Balance withdrawn to your wallet.",
  withdrawFailed: (detail: string) => `The withdrawal failed: ${detail}`,
  feeError: "The token ledger fee could not be read. Try again.",
  addToken: "Add a token",
  addTokenLabel: "Symbol or ledger ID",
  addTokenHint:
    "Search a token listed on ICPSwap by symbol, or paste its ledger ID. Added tokens are kept in this browser and appear only in this selector.",
  addTokenSubmit: "Add",
  addTokenReading: "Reading the token ledger…",
  addTokenListLoading: "Reading the ICPSwap token list…",
  addTokenListError:
    "The ICPSwap token list could not be read. Paste the ledger ID instead.",
  addTokenNoMatch:
    "No ICPSwap-listed token matches this symbol. Paste the ledger ID instead.",
  addTokenInvalidId: "Invalid ledger ID.",
  addTokenNotIcrc:
    "This canister did not return ICRC-1 token metadata. It cannot be added.",
  addTokenAlready: (symbol: string) => `${symbol} is already in the list.`,
  addTokenDone: (symbol: string) => `${symbol} added.`,
  addedTokens: "Added tokens",
  removeToken: (symbol: string) => `Remove ${symbol}`,
  closeAddToken: "Close",
  unifiedDescription:
    "Swap ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT and the ICPSwap-listed tokens you add, through the native pools or ICPSwap, from your own wallet.",
  routesTitle: "Routes",
  routeBestPrice: "Best price",
  routeSelected: "Selected",
  routeEnterAmount: "Enter an amount to see this route's quote.",
  routeQuoteLoading: "Reading the quote…",
  routeNativeNoPool: (a: string, b: string) =>
    `No native pool exists for ${a} and ${b}.`,
  routeIcpswapNoPool: (a: string, b: string) =>
    `ICPSwap has no direct pool for ${a} and ${b}.`,
  routeNativeAccount:
    "The native pool route is available only for the account signed in on this site.",
  routeNativeError: "The native pool did not return a quote.",
  routeOnlyIcpswap: "Only ICPSwap is offered for this pair.",
  routeOnlyNative: "Only the native pool is offered for this pair.",
  bestPriceNote:
    "Best price: the route returning the most tokens, fees included. The route you select is the one executed.",
  routeUsed: "Route used",
  amountGiven: "Amount given",
  confirmNativeApproval: (amount: string, symbol: string) =>
    `An ICRC-2 approval allowing the DEX to take up to ${amount} ${symbol} (swap amount plus one ledger fee) from your account.`,
  confirmNativeSteps: (symbolIn: string, symbolOut: string) =>
    `The DEX then takes the ${symbolIn} (deposit), swaps them in the native pool and sends the ${symbolOut} to your wallet (withdrawal).`,
  warningNative:
    "Swaps are final and ledger fees are not refunded. If the withdrawal fails, the swapped amount stays in your DEX balance.",
  nativeWithdrawFailed: (amount: string, symbol: string, detail: string) =>
    `The swap completed, but the withdrawal of ${amount} ${symbol} to your wallet failed: ${detail}. The amount stays in your DEX balance.`,
};

export default en;
