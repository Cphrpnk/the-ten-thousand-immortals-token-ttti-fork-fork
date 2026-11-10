const en = {
  priceStatement:
    "Price: 10,000 USD per TTTI-T, redeemable for 10,000 USD at any time. For q TTTI-T, the amount payable is (10,000 USD + the liquidity you contribute) × q ÷ 0.99, in ICP, ckBTC, ckUSDC or ckUSDT. Minimum: 0.0001 TTTI-T.",
  modeLegend: "Amount entry",
  modeTtti: "Amount in TTTI-T",
  modeUsd: "Amount in dollars",
  tttiLabel: "TTTI-T to mint",
  tttiHint: "Minimum 0.0001 TTTI-T, up to 8 decimals.",
  usdLabel: "Amount to pay, in dollars",
  usdHint:
    "Dollar value of the payment. The TTTI-T quantity is rounded down to 8 decimals.",
  invalidTtti:
    "Enter a TTTI-T amount with up to 8 decimals. A dot or a comma may be used.",
  invalidUsd:
    "Enter a dollar amount greater than 0 with up to 8 decimals. A dot or a comma may be used.",
  previewHeading: "Preview",
  previewIdle: "Enter an amount to see the preview.",
  previewLoading: "Calculating the preview…",
  rowMinted: "TTTI-T minted",
  rowPay: "You pay",
  splitHeading: "Split of the payment",
  rowPosition: "Liquidity position",
  rowGuarantee: "Common reserve",
  rowFee: "Fee: 1 %",
  rowPrice: "Price",
  priceValue: "10,000 USD per TTTI-T, redeemable for 10,000 USD at any time",
  rowLiquidity: "Liquidity you contribute",
  liquidityNote: "stays yours, in your position",
  holdingsHeading: "You hold after the mint",
  rowLocked: "Locked part",
  rowHand: "TTTI-T in hand",
  lockedShareLabel: "Locked share m",
  lockedShareNote:
    "m is the share of the position locked for 3 months. It is taken at payment time: if it changes after this preview, the value at payment time applies.",
  choiceLegend: "Remainder choice (1 − m)",
  choicePoolTitle: "A · Pool the remainder",
  choicePoolText: "The remainder is pooled in your position with no lock.",
  choiceWalletTitle: "B · Keep in wallet",
  choiceWalletText:
    "The remainder stays in your wallet as TTTI-T; the matching liquidity is not paid.",
  paymentRule:
    "Payment: (10,000 USD + the liquidity you contribute) × q ÷ 0.99, rounded up. 10,000 USD × q goes to the common reserve and 1 % of the amount paid goes to the creator. The rest is the liquidity you contribute, which stays yours in your position.",
  lockedRule:
    "A share m of the position is locked for 3 months. The remainder (1 − m) follows your choice: A pools it with no lock; B keeps the matching TTTI-T in your wallet.",
  rowDust: "Rounding remainder",
  poolPriceHeading: "Targeted pool price, before and after the zap",
  priceBefore: "Before",
  priceAfter: "After",
  emptyPool: "Empty pool",
  consolidatedPriceHeading: "Consolidated price (reference)",
  consolidatedPriceNote:
    "USD per TTTI-T: the price of the other open pools, without the targeted pool, weighted by their depth.",
  poolPriceNote: "USD per TTTI-T in the TTTI-T pool of the paid token.",
  gapHeading: "Gap between the pool price and the reference price",
  gapUnavailable: "Gap not available",
  noIndependentReference: "No independent reference",
  firstDepositNote:
    "Empty pool: the first deposit is made 1 to 1, at 10,000 USD per TTTI-T.",
  zapLabel: "Balancing swap",
  noZap: "No balancing swap is needed.",
  maxPayLabel: "Maximum payment at this tolerance",
  expiryNote: "The mint is refused if it is not executed within 5 minutes.",
  previewFailedTitle: "Preview unavailable",
  mintFailedTitle: "Mint not completed",
  successTitle: (amount: string) => `${amount} minted`,
  successPaid: (pay: string, id: string) => `Paid ${pay} · mint #${id}`,
  successPosition: (id: string) => `Liquidity position #${id}`,
  successHoldings: (token: string, ttti: string) =>
    `The position holds ${token} and ${ttti}.`,
  successGuarantee: (amount: string) => `Common reserve: ${amount}.`,
  successLink: "View my liquidity positions",
  errAnonymous: "Sign in or connect a wallet to mint.",
  errRateUnavailable: (symbol: string) =>
    `No valid ${symbol}/USD rate is available at the moment. Nothing was taken. Try again later.`,
  errBelowMinimum: (minimum: string, minimumUsd?: string) =>
    `The minimum is ${minimum}${minimumUsd ? ` (${minimumUsd})` : ""}.`,
  errTooManyDecimals: (max: string, step: string) =>
    `A TTTI-T amount has at most ${max} decimals (smallest step ${step}).`,
  errInvalidAmount: "Enter an amount greater than 0.",
  errAboveCap: (cap: string, remaining: string) =>
    `The total cap of ${cap} is reached or would be exceeded. Remaining: ${remaining}.`,
  errInsufficientBalance: (symbol: string, required: string, balance: string) =>
    `Insufficient ${symbol} balance: ${required} needed including ledger fees, ${balance} available.`,
  errInsufficientAllowance: (
    symbol: string,
    required: string,
    allowance: string,
  ) =>
    `The ${symbol} approval is too low: ${required} required, ${allowance} approved. Approve again and retry.`,
  errSlippageExceeded: (percent: string) =>
    `The pool price moved beyond the tolerance of ${percent} %. Nothing was minted. Retry or raise the tolerance.`,
  errInvalidSlippage: (percent: string) =>
    `The tolerance cannot exceed ${percent} %.`,
  errMaxPayExceeded: (pay: string, max: string) =>
    `The amount payable is now ${pay}, above the maximum of ${max} set from the preview. Refresh the preview and retry.`,
  errDeadlineExpired:
    "The 5-minute deadline passed before the mint was executed. Retry.",
  errInProgress: "A mint from this account is already in progress.",
  errAcknowledgements: "Accept the acknowledgements to mint.",
  errSalesPaused: "Minting is paused.",
  rateSourceMissing: "unavailable",
  errRateSourcesDiverge: (
    symbol: string,
    coinbase: string,
    coingecko: string,
    maxPercent: string,
  ) =>
    `The mint was refused: the Coinbase and CoinGecko rates for ${symbol} differ by more than ${maxPercent}% or one of them is missing. Coinbase: ${coinbase}. CoinGecko: ${coingecko}. Nothing was taken.`,
  errDexPaused: "Pools are paused. Minting is unavailable.",
  errPoolRemoved: (symbol: string) =>
    `The TTTI-T/${symbol} pool has been removed.`,
  errRemovalAnnounced: (symbol: string, date: string) =>
    `A removal of the TTTI-T/${symbol} pool is announced for ${date}. Minting into it is suspended.`,
  errPoolNotFound: (symbol: string) => `There is no TTTI-T/${symbol} pool.`,
  errMinimumsNotSet: "The pool minimums are not set yet.",
  errLedger: (symbol: string, message: string) =>
    `${symbol} ledger error: ${message}`,
  errDepositRefunded: (id: string) =>
    `The deposit into the pool failed. The payment was refunded, minus ledger fees (mint #${id}).`,
  refundingTitle: "Payment being returned",
  errDepositRefunding: (id: string) =>
    `The deposit into the pool failed. The payment is being returned and remains in your wallet balance in the meantime (mint #${id}).`,
  errDepositRefundFailed: (id: string) =>
    `The deposit into the pool failed and the refund did not complete (mint #${id}). Keep this reference.`,
  errGeneric: "The mint was refused.",
};

export default en;
