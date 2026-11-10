const en = {
  title: "Pools",
  intro:
    "Constant-product pools held by this contract. Each pair has a fee tier and its own pool subaccount.",
  statusFilling: "Filling",
  statusActive: "Active",
  statusRemoved: "Removed",
  newPairBadge: "New pair",
  approvalNotRecommendation: "Approval of a pair is not a recommendation.",
  tttiPair: "TTTI-T pair",
  utilityPair: "Utility pair",
  feeTier: "Fee tier",
  feeTierBps5: "0.05 %",
  feeTierBps30: "0.3 %",
  feeTierBps100: "1 %",
  poolSubaccount: "Pool subaccount",
  minimumLocked: "Minimum locked liquidity",
  minimumTttiSide: (amount: string) => `${amount} TTTI-T on the TTTI-T side`,
  minimumPerToken: "Minimum per token, set by the admin",
  minimumNotSet: "Not set yet",
  firstDepositRule: "The first deposit of an empty pool has no minimum.",
  launchDepthRule: (amount: string) =>
    `Swaps open when a TTTI-T pair holds ${amount} USD of TTTI-T in the pool (its TTTI-T side at the pool price, equal to its other side at the oracle rate), or when a utility pair reaches ${amount} USD of depth (both sides added at the hourly rates). Below this threshold the pool stays filling: creating the pool, depositing, adding liquidity, buying and minting remain open; only swaps are closed.`,
  lockedSharesRule:
    "The minimum locked shares, computed as √(A×B) at the first deposit, belong to the contract forever.",
  removedNotice:
    "This pair has been removed. All positions were liquidated. Swaps and additions are closed.",
  protocolStatement:
    "The protocol never places a price-linked order and creates no TTTI-T for pools. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. The protocol share of swap fees goes two thirds to the creator and one third to permanent liquidity, which nobody can withdraw.",
  loading: "Loading pools…",
  loadError: "The pools could not be loaded.",
  requestTitle: "Request a pair",
  ledgerId: "Ledger ID",
  ledgerIdPlaceholder: "Ledger canister ID",
  ledgerIdInvalid: "Enter a valid ledger canister ID.",
  counterToken: "Counter token",
  counterTokenPlaceholder: "Choose a token",
  message: "Message",
  messageMax: (max: string) => `${max} characters max.`,
  deposit: (amount: string) => `Deposit: ${amount}`,
  depositApproval: (amount: string, margin: string) =>
    `Before the request, you approve up to ${amount} to the contract: the deposit, a ${margin} margin for rate changes, and the ledger fee. Only the exact deposit is taken. The approval expires after 15 minutes.`,
  depositRule: (usd: string, ttti: string) =>
    `The deposit is about ${usd}, the equivalent of ${ttti} TTTI-T at the mint price, at the current hourly rates. If the request is approved, it is returned in the paid token. If it is refused, it is kept and joins the permanent liquidity reserve.`,
  payToken: "Deposit token",
  depositRateUnavailable: (symbol: string) =>
    `The ${symbol} rate is unavailable, so the deposit cannot be calculated.`,
  depositApprovedNote: "The deposit is returned in the paid token.",
  depositRefusedNote:
    "The deposit is kept and joins the permanent liquidity reserve.",
  errPayTokenNotAccepted: (symbol: string) =>
    `${symbol} is not accepted for the deposit.`,
  errDepositRateUnavailable: (symbol: string) =>
    `The ${symbol} rate is unavailable or has expired. Try again later or choose another token.`,
  errRequestInProgress:
    "A request from your account is already in progress. Try again in a moment.",
  approving: "Approving…",
  submit: "Submit request",
  submitting: "Submitting…",
  submitted: "Request submitted.",
  signInNeeded: "Sign in to request a pair.",
  requestsTitle: "Requests",
  myRequestsTitle: "My requests",
  noRequests: "No pair requests.",
  requestStatusPending: "Pending",
  requestStatusApproved: "Approved",
  requestStatusRefused: "Refused",
  refusedReason: (reason: string) => `Reason: ${reason}`,
  copiedSymbol: "Copied symbol",
  copiedSymbolOf: (symbol: string) => `Symbol also used by ${symbol}`,
  errAnonymous: "Sign in to request a pair.",
  errMessageTooLong: (max: string) =>
    `The message is longer than ${max} characters.`,
  errInvalidToken: (detail: string) => `This ledger cannot be used: ${detail}`,
  errUnknownCounterToken: "The counter token is not available.",
  errLedgerUnreachable: (detail: string) =>
    `The ledger could not be reached: ${detail}`,
  errMissingStandards: (standards: string) =>
    `The ledger does not support ${standards}.`,
  errMetadataUnavailable: (detail: string) =>
    `The ledger metadata could not be read: ${detail}`,
  errPairExists: "This pair already exists or is already requested.",
  errTooManyPending: (max: string) =>
    `You already have ${max} pending requests.`,
  errCooldown: (date: string) =>
    `After a refusal, a new request is possible from ${date}.`,
  errInsufficientAllowance: (allowance: string, required: string) =>
    `The approval covers ${allowance}; ${required} is required.`,
  errInsufficientFunds: (balance: string) =>
    `Your balance (${balance}) does not cover the deposit and the fee.`,
  errDepositFailed: (detail: string) =>
    `The deposit could not be taken: ${detail}`,
  errApprovalFailed: (detail: string) => `The approval failed: ${detail}`,
  balancesTitle: "My DEX balances",
  balancesSignIn: "Sign in to see your DEX balances.",
  balancesLoading: "Loading balances…",
  balancesLoadError: "The balances could not be loaded.",
  balancesEmpty: "No DEX balance.",
  colToken: "Token",
  colAvailable: "Available",
  colReserved: "Reserved",
  depositButton: "Deposit",
  withdrawButton: "Withdraw",
  depositTitle: (symbol: string) => `Deposit ${symbol}`,
  withdrawTitle: (symbol: string) => `Withdraw ${symbol}`,
  amountLabel: "Amount",
  amountPlaceholder: "0.00",
  amountInvalid: "Enter a valid amount.",
  availableAmount: (amount: string) => `Available: ${amount}`,
  minimumDeposit: (amount: string) => `Minimum deposit: ${amount}`,
  minimumWithdrawal: (amount: string) => `Minimum withdrawal: ${amount}`,
  depositFeeNote: (fee: string) =>
    `You approve the amount plus the ledger fee (${fee}) to the contract. The approval expires after 15 minutes.`,
  withdrawFeeNote: (fee: string) =>
    `The ledger fee (${fee}) is deducted from the amount withdrawn.`,
  withdrawReceive: (amount: string) => `You receive: ${amount}`,
  confirmDeposit: "Confirm deposit",
  confirmWithdraw: "Confirm withdrawal",
  cancel: "Cancel",
  depositing: "Depositing…",
  withdrawing: "Withdrawing…",
  depositDone: "Deposit completed.",
  withdrawDone: "Withdrawal completed.",
  transfersTitle: "DEX transfers",
  noTransfers: "No DEX transfers.",
  directionDeposit: "Deposit",
  directionWithdrawal: "Withdrawal",
  transferStatusInProgress: "In progress",
  transferStatusCompleted: "Completed",
  transferStatusFailed: "Failed",
  transferStatusNeedsReview: "To review",
  transferBlock: (block: string) => `Block ${block}`,
  transferError: (detail: string) => `Error: ${detail}`,
  memo: "Memo",
  errDexAnonymous: "Sign in to deposit or withdraw.",
  errAmountTooSmall: (minimum: string) => `The minimum is ${minimum}.`,
  errTransferInProgress:
    "A transfer of this token is already in progress. Try again later.",
  errDexInsufficientAllowance: (allowance: string, required: string) =>
    `The approval covers ${allowance}; ${required} is required.`,
  errDexInsufficientFunds: (balance: string) =>
    `Your balance (${balance}) does not cover the amount and the fee.`,
  errDexInsufficientBalance: (available: string) =>
    `Your available DEX balance is ${available}.`,
  errLedger: (detail: string) => `The ledger returned an error: ${detail}`,
  errDexApprovalFailed: (detail: string) => `The approval failed: ${detail}`,
  lookupTitle: "DEX balances by identifier",
  lookupLabel: "Principal",
  lookupPlaceholder: "Principal ID",
  lookupButton: "Look up",
  lookupInvalid: "Enter a valid principal.",
  lookupEmpty: "No DEX balance for this principal.",
  depositSubaccount: "Deposit subaccount",
  copyDepositSubaccount: "Copy deposit subaccount",
  copied: "Copied",
  refundLabel: "Deposit refund",
  refundNone: "No refund",
  refundInProgress: "Refund in progress",
  refundNeedsReview: "Refund to review",
  refundRefunded: (block: string) => `Refunded (block ${block})`,
  privacyPositions:
    "Liquidity positions are public and linked to your identifier on TTTI.",
  privacyDeposit: "Your deposit stays visible on the chain.",
  // DEX lot 3: filling gauge, liquidity positions, swaps.
  // Amounts, USD values, percentages and dates are passed formatted.
  gaugeLabel: "Filling gauge",
  gaugeFilling: (current: string, target: string, remaining: string) =>
    `${current} / ${target} USD — ${remaining} USD remaining to reach the swap threshold`,
  gaugeOpen: (current: string, target: string) => `${current} / ${target} USD`,
  gaugeUnavailable: "Value momentarily unavailable",
  reserves: "Reserves",
  totalShares: "Total shares",
  addLiquidityButton: "Add liquidity",
  swapButton: "Swap",
  positionsButton: "Positions",
  signInForActions: "Sign in to add liquidity or swap.",
  pairTokensUnsupported:
    "Liquidity and swaps are not available for the tokens of this pair.",
  swapsClosedFilling: (gauge: string) =>
    `Swaps are closed while the pool is filling: ${gauge}`,
  addTitle: (pair: string) => `Add liquidity · ${pair}`,
  addIntro:
    "The amounts are taken from your available DEX balances. Liquidity positions are public and linked to your identifier on TTTI. Your deposit stays visible on the chain.",
  sideLabel: "Token entered",
  tokenAmountLabel: (symbol: string) => `${symbol} amount`,
  firstDepositNote:
    "First deposit: enter both amounts. Their ratio sets the pool ratio.",
  counterComputed: (amount: string) =>
    `Counter amount at the pool ratio: ${amount}`,
  sharesToReceive: (shares: string) => `Shares to receive: ${shares}`,
  sharesLockedForever: (shares: string) =>
    `Shares locked to the contract forever: ${shares}`,
  gaugeAfter: (gauge: string) => `Gauge after the deposit: ${gauge}`,
  opensPool: "This deposit opens the pool to swaps.",
  staysFilling: "The pool stays in filling after this deposit.",
  quoting: "Computing the quote…",
  lockLabel: "Lock duration",
  lockHint: (min: string, max: string) =>
    `Optional: no lock by default. A lock lasts from ${min} to ${max}. Its owner can extend it, never shorten it.`,
  lockPreset1d: "1 day",
  lockPreset7d: "7 days",
  lockPreset30d: "30 days",
  lockPreset90d: "90 days",
  lockPreset3m: "3 months",
  lockPreset2y: "2 years",
  lockPreset3y: "3 years",
  lockPreset4y: "4 years",
  lockPreset1y: "1 year",
  lockPreset5y: "5 years",
  lockCustom: "Custom",
  lockCustomDays: "Number of days",
  lockInvalid: (min: string, max: string) =>
    `Enter a duration from ${min} to ${max}.`,
  durationDays: (days: string) => `${days} days`,
  durationOneDay: "1 day",
  unlockOn: (date: string) => `Unlock: ${date}`,
  confirmAdd: "Add liquidity",
  adding: "Adding liquidity…",
  addDone: (id: string, shares: string) =>
    `Position #${id} created with ${shares} shares.`,
  refTitle: "ICPSwap reference price",
  refQuote: (input: string, output: string) =>
    `ICPSwap quote: ${input} → ${output} (ICPSwap fee included). Reference only.`,
  refDeviation: (pct: string) =>
    `Your deposit ratio differs from this reference by ${pct} %.`,
  refDeviationWarning: (pct: string) =>
    `Warning: your deposit ratio differs from the ICPSwap reference by ${pct} %, more than 2 %.`,
  refUnavailable:
    "No ICPSwap pool exists for this pair; the reference price is unavailable.",
  refError: "The ICPSwap reference price could not be read.",
  refLoading: "Reading the ICPSwap price…",
  positionsTitle: (pair: string) => `Positions · ${pair}`,
  positionsEmpty: "No position in this pool.",
  positionsLoading: "Loading positions…",
  positionsLoadError: "The positions could not be loaded.",
  colOwner: "Owner",
  colPair: "Pair",
  colShares: "Shares",
  colAmounts: "Amounts",
  colLock: "Lock",
  colUnlock: "Unlock",
  creatorBadge: "Creator",
  copyPrincipal: "Copy principal",
  unlockedLabel: "Unlocked",
  positionLabel: (id: string) => `Position #${id}`,
  myPositionsTitle: "My positions",
  myPositionsEmpty: "You have no liquidity position.",
  myPositionsNote:
    "Withdrawing a position credits your DEX balances. Use Withdraw in My DEX balances to send the tokens to your wallet.",
  withdrawPosition: "Withdraw",
  withdrawingPosition: "Withdrawing…",
  positionWithdrawn: (amount0: string, amount1: string) =>
    `Withdrawn: ${amount0} and ${amount1} credited to your DEX balances.`,
  lockedUntil: (date: string) => `Locked until ${date}.`,
  removedWithdrawOpen:
    "Withdrawal follows the unlock date in every pool state.",
  extendLockButton: "Extend lock",
  extendTitle: (id: string) => `Extend lock · position #${id}`,
  extendCurrent: (date: string) => `Current unlock: ${date}`,
  extendModeDate: "Date",
  extendModeDays: "Days",
  extendDateLabel: "New unlock date",
  extendDaysLabel: "Days added to the current unlock",
  extendNewUnlock: (date: string) => `New unlock: ${date}`,
  extendTooEarly: "The new unlock must be later than the current unlock.",
  extendTooLate: (date: string) =>
    `The new unlock cannot be later than ${date}.`,
  confirmExtend: "Confirm extension",
  extending: "Extending…",
  extendDone: (date: string) => `Lock extended until ${date}.`,
  swapTitle: (pair: string) => `Swap · ${pair}`,
  swapIntro:
    "The swap uses your available DEX balances; the output is credited to them.",
  swapFrom: "Token sold",
  swapAmountOut: "You receive (estimate)",
  swapFee: (pct: string) => `Fee (${pct})`,
  swapPriceImpact: "Price impact",
  swapMinimum: "Minimum received",
  slippageLabel: "Slippage tolerance (%)",
  slippageInvalid: "Enter a tolerance from 0 to 50 %.",
  swapDeadlineNote: "The deadline is set to 5 minutes after confirmation.",
  confirmSwap: "Confirm swap",
  swapping: "Swapping…",
  swapDone: (input: string, output: string) =>
    `Swapped ${input} for ${output}.`,
  errLiqAnonymous: "Sign in to use the pools.",
  errPoolNotFound: "This pool does not exist.",
  errPoolRemoved: "This pair has been removed. Deposits and swaps are blocked.",
  errMinimumsNotSet: "The minimums of this pair are not set yet.",
  errUnsupportedToken: "This token is not supported by the DEX.",
  errZeroAmount: "Enter an amount above zero.",
  errCounterAmountRequired: "First deposit: enter both amounts.",
  errLiqInsufficientBalance: (available: string, required: string) =>
    `Your available DEX balance is ${available}; ${required} is required.`,
  errBelowMinimum: (minimums: string) =>
    `The deposit is below the minimum: ${minimums}.`,
  errRatioMismatch: (required: string) =>
    `At the pool ratio, the counter amount must be ${required}.`,
  errLockTooShort: (min: string) => `The lock is too short. Minimum: ${min}.`,
  errLockTooLong: (max: string) => `The lock is too long. Maximum: ${max}.`,
  errZeroShares: "This deposit is too small to receive shares.",
  errOperationInProgress:
    "Another operation on this account is in progress. Try again shortly.",
  errPositionNotFound: "This position does not exist.",
  errNotPositionOwner: "This position belongs to another principal.",
  errPositionLocked: (date: string) => `This position is locked until ${date}.`,
  errCannotShortenLock: (date: string) =>
    `A lock cannot be shortened. Current unlock: ${date}.`,
  errUnlockTooLate: (date: string) =>
    `The unlock date cannot be later than ${date}.`,
  errPoolFilling: (gauge: string) => `The pool is still filling: ${gauge}`,
  errPoolNotOpen: "This pool is not open to swaps.",
  errRateUnavailable:
    "A USD rate is momentarily unavailable; the pool value cannot be checked.",
  errTokenNotInPool: "This token is not part of the pair.",
  errInvalidSlippage: (max: string) =>
    `The slippage tolerance must be at most ${max} %.`,
  errSwapInsufficientBalance: (available: string) =>
    `Your available DEX balance is ${available}.`,
  errInsufficientLiquidity:
    "The pool does not have enough liquidity for this swap.",
  errSlippageExceeded: (out: string, min: string) =>
    `Slippage exceeded: the swap would give ${out}, below the minimum ${min}. Get a new quote.`,
  errDeadlineExceeded: (date: string) =>
    `The deadline (${date}) has passed. Confirm again.`,
  errDeadlineTooFar: (date: string) =>
    `The deadline is too far; the latest accepted is ${date}.`,
  errCall: (detail: string) => `The call failed: ${detail}`,
  // DEX lot 4: ICP bonus (DL) of locked TTTI-T-pair positions, protocol liquidity.
  // Amounts, percentages and dates are passed formatted. Observed amounts only.
  bonusTitle: "ICP bonus for locked positions",
  bonusScope:
    "ICP bonuses already earned by locked positions in TTTI-T pairs remain claimable. Swap fees add no new bonus.",
  bonusWeightRule:
    "Weight of a position = value in ICP × remaining lock time ÷ 5 years.",
  bonusObservedNote:
    "The bonus shows observed amounts only. No future amount is estimated or promised.",
  bonusSignIn: "Sign in to see your ICP bonus.",
  bonusLoading: "Loading the bonus…",
  bonusLoadError: "The bonus could not be loaded.",
  bonusClaimable: (amount: string) => `Claimable: ${amount}`,
  bonusClaimedTotal: (amount: string) => `Claimed in total: ${amount}`,
  bonusNoPositions: "No locked position in a TTTI-T pair.",
  bonusColPosition: "Position",
  bonusColValueIcp: "Value in ICP",
  bonusColRemainingLock: "Remaining lock",
  bonusColWeight: "Weight",
  bonusClaimsTitle: "Claims",
  bonusClaimsEmpty: "No claim yet.",
  claimButton: "Claim ICP bonus",
  claiming: "Claiming…",
  claimDone: (amount: string) =>
    `Claim of ${amount} recorded. The ICP is sent to your wallet.`,
  errClaimAnonymous: "Sign in to claim the bonus.",
  errClaimNothing: "There is nothing to claim.",
  errClaimBelowMinimum: (minimum: string) =>
    `The claimable amount is below the minimum of ${minimum}.`,
  errClaimInProgress: "A claim is already in progress. Try again shortly.",
  protocolLiquidityTitle: "Protocol liquidity",
  protocolLiquidityLocked: "Locked forever. It has no withdrawal path.",
  protocolLiquidityHeld: (amount0: string, amount1: string) =>
    `Held: ${amount0} and ${amount1}`,
  protocolLiquidityFromFees: (amount0: string, amount1: string) =>
    `From fees: ${amount0} and ${amount1}`,
  protocolLiquidityFromTreasury: (amount0: string, amount1: string) =>
    `From the treasury: ${amount0} and ${amount1}`,
  protocolLiquidityShare: (pct: string) => `${pct} % of the pool shares`,
  protocolLiquidityLastAdded: (date: string) => `Last added: ${date}`,
  protocolLiquidityNone: "No protocol liquidity in this pool.",
  dexPausedTitle: "DEX paused",
  dexPausedNotice: (token: string) =>
    `The DEX is paused after a reserve check found a shortfall for ${token}. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.`,
  dexPausedTooltip: "Unavailable while the DEX is paused.",
  errDexPaused:
    "The DEX is paused after a reserve check. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.",
  // Pools page layout: section nav, rows, accordions, filters.
  navLabel: "Pools page sections",
  navPools: "Pools",
  navIndicators: "Indicators",
  navMyLiquidity: "My liquidity",
  navProtocol: "Protocol",
  navRequests: "Requests",
  introShort: "Constant-product pools held by this contract.",
  statusWaiting: "Waiting for liquidity",
  statusOpen: "Open",
  detailsLabel: "Details",
  addShort: "Add",
  howPoolsWorkTitle: "How pools work",
  permanentLiquidity: "Permanent liquidity",
  permanentLiquidityValue: (shares: string, pct: string) =>
    `${shares} shares (${pct} % of the pool)`,
  myLiquiditySignIn:
    "Sign in to see your DEX balances, liquidity positions and fees received.",
  rewardsTitle: "Fees received",
  activityTitle: "My activity",
  activityFilterLabel: "Activity type",
  filterAll: "All",
  filterTransfers: "Deposits & withdrawals",
  filterMintFees: "Mint fees",
  filterLpBonus: "LP bonus",
  tokenFilterLabel: "Token",
  allTokens: "All tokens",
  activityEmpty: "No activity for these filters.",
  activityLoadError: "Your activity could not be loaded.",
  entryMintFee: "Mint fee claim",
  entryLpBonus: "LP bonus claim",
  requestsFilterLabel: "Request filter",
  filterRejected: "Rejected",
  requestsEmptyFiltered: "No requests for this filter.",
  poolsEmpty: "No pools yet.",
  // DEX-2: depth, swap threshold, swap state, slippage, reference price,
  // optional locks and pair removal. Values are passed already formatted.
  depthLabel: "Depth",
  depthValue: (usd: string) => `${usd} USD`,
  depthBasisTwice:
    "Twice the USD value of the non-TTTI-T side, at the pool price.",
  depthBasisSum:
    "Sum of both sides in USD, at the pool price and the hourly rates.",
  depthUnavailable: "Depth momentarily unavailable: a USD rate is missing.",
  depthMissingRate: (tokens: string) => `Missing rate: ${tokens}.`,
  thresholdLabel: "Swap threshold",
  thresholdValueTtti: (usd: string) => `${usd} USD of TTTI-T in the pool`,
  thresholdProgressTtti: (measured: string, threshold: string) =>
    `${measured} USD of TTTI-T / ${threshold} USD of TTTI-T in the pool`,
  thresholdValueDepth: (usd: string) => `${usd} USD of depth`,
  thresholdRule: (usd: string) =>
    `Swaps are open while the depth is at or above ${usd} USD and the USD rates are available. The threshold applies only to swaps and is checked at every call.`,
  swapStateLabel: "Swaps",
  swapStateOpen: "Open",
  swapStateClosed: "Closed",
  swapClosedBelowThreshold: (measured: string, threshold: string) =>
    `Swaps are closed: the pool is at ${measured} USD, below the swap threshold of ${threshold}. They open once that threshold is reached. Deposits, liquidity additions and minting are not affected.`,
  swapClosedRateUnavailable:
    "Swaps are closed: a USD rate is momentarily unavailable.",
  swapClosedRemovalAnnounced: (date: string) =>
    `Swaps are suspended: the removal of this pair is announced for ${date}.`,
  swapClosedRemovalExecuting:
    "Swaps are closed: the removal of this pair is in progress.",
  swapClosedRemoved: "Swaps are closed: this pair has been removed.",
  errDepthBelowThreshold: (measured: string, threshold: string) =>
    `Swap refused: the pool is at ${measured} USD, below the ${threshold} USD swap threshold.`,
  errSwapRateUnavailable:
    "Swap refused: a USD rate is momentarily unavailable.",
  errRemovalInProgress: (date: string) =>
    `Swap refused: the removal of this pair is announced for ${date}.`,
  errSwapPoolRemoved: "Swap refused: this pair has been removed.",
  fixedSideLabel: "Fixed side",
  fixedSideHint: "You enter this amount. It does not change.",
  counterSideLabel: "Counter side (computed)",
  counterSideNote:
    "Computed at the pool ratio when the deposit is made, within the slippage tolerance.",
  counterSideRange: (min: string, max: string) =>
    `Accepted counter amount: ${min} to ${max}`,
  addSlippageLabel: "Slippage tolerance (%)",
  addSlippageHint:
    "Maximum change of the counter amount between the quote and the execution.",
  addSlippageDefault: "Default: 0.5 %",
  addSlippageInvalid: (max: string) => `Enter a tolerance from 0 to ${max} %.`,
  depthAfter: (depth: string) => `Depth after the deposit: ${depth} USD`,
  surplusKept: (amount: string) =>
    `Not used: ${amount}. It stays in your internal DEX balance.`,
  addDoneSurplus: (id: string, shares: string, surplus: string) =>
    `Position #${id} created with ${shares} shares. Not used: ${surplus}, kept in your internal DEX balance.`,
  errAddInvalidSlippage: (max: string) =>
    `The slippage tolerance must be at most ${max} %.`,
  errAddSlippageExceeded: (
    tolerance: string,
    expected: string,
    actual: string,
  ) =>
    `The counter amount moved beyond the ${tolerance} % tolerance: expected ${expected}, now ${actual}. Nothing was debited; the funds stay in your internal balance. Get a new quote.`,
  errAddReferenceOutOfBand: (
    expected: string,
    deviation: string,
    tolerance: string,
  ) =>
    `The first deposit ratio differs from the reference price by ${deviation} %, beyond the ${tolerance} % band. Expected: ${expected}. Nothing was debited; the funds stay in your internal balance.`,
  errAddReferenceUnavailable:
    "The reference price is unavailable, so the first deposit cannot be checked. Nothing was debited; the funds stay in your internal balance.",
  errAddRemovalAnnounced: (date: string) =>
    `Liquidity additions are suspended: the removal of this pair is announced for ${date}. Withdrawals stay open, subject to position locks.`,
  referenceTitle: "Reference price",
  referenceIntro: (tolerance: string) =>
    `The first deposit of an empty pool must be within ${tolerance} % of the reference price.`,
  referenceTttiPrice: (price: string) => `TTTI-T reference price: ${price} USD`,
  referenceExpected: (expected: string) => `Expected ratio: ${expected}`,
  referenceSourcesTitle: "Sources",
  referenceColSource: "Source",
  referenceColPrice: "Price (USD)",
  referenceColDepth: "Depth (USD)",
  referenceColWeight: "Weight",
  referenceSourceNative: "Native pool",
  referenceSourceIcpswap: "ICPSwap",
  referenceReadAt: (date: string) => `Read ${date}`,
  referenceTolerance: (pct: string) => `Tolerance: ${pct} %`,
  referenceUtilityBasis: "Utility pairs use the hourly USD rates.",
  referenceUnavailableNoSource:
    "Reference price unavailable: no source can be read.",
  referenceUnavailableRate: (tokens: string) =>
    `Reference price unavailable: USD rate missing for ${tokens}.`,
  referenceRatesInvalid:
    "The hourly USD rates are not valid; the check of utility pairs is unavailable.",
  referenceWithin: (deviation: string) =>
    `Within the band: deviation ${deviation} %.`,
  referenceOutside: (deviation: string, tolerance: string) =>
    `Outside the band: deviation ${deviation} %, tolerance ${tolerance} %.`,
  referenceNotApplicable:
    "No reference check: the pool already holds liquidity.",
  referenceRefresh: "Read the sources again",
  referenceRefreshing: "Reading the sources…",
  referenceRefreshed: (count: string) => `${count} source(s) read.`,
  referenceLoading: "Loading the reference price…",
  referenceLoadError: "The reference price could not be loaded.",
  lockNone: "No lock",
  lockNoneHint: "No lock: the position can be withdrawn at any time.",
  lockPickerLabel: "Lock (optional)",
  lockUpTo: (max: string) =>
    `A lock lasts from 3 months to ${max}. Its owner can extend it, never shorten it.`,
  lockEnforced:
    "The unlock date applies in every pool state, including a removed pair. Nobody can cancel a lock; only the relay of new commitments in the pool can shorten it.",
  positionLiquidated: "Position liquidated at the removal of the pair.",
  removalTitle: "Pair removal",
  removalBadge: "Removal announced",
  removalAnnouncedTitle: "Removal announced",
  removalReasonLabel: "Reason",
  removalAnnouncedAt: (date: string) => `Announced: ${date}`,
  removalEffectiveAt: (date: string) => `Effective: ${date}`,
  removalRemaining: (remaining: string) => `Remaining: ${remaining}`,
  removalSuspendedNotice:
    "Swaps and liquidity additions are suspended. Withdrawals stay open, subject to position locks.",
  removalLiquidationNotice:
    "At the effective date, all positions are liquidated, locked positions included, and the pool is marked removed.",
  removalCancelledTitle: "Removal cancelled",
  removalCancelledNotice: (date: string) =>
    `The announced removal was cancelled on ${date}. Swaps and additions follow the pool depth again.`,
  removalExecutingTitle: "Removal in progress",
  removalExecutingNotice:
    "Positions are being liquidated. Swaps and additions are closed.",
  removalCompletedTitle: "Pair removed",
  removalCompletedNotice: (date: string) =>
    `Removed on ${date}. All positions were liquidated.`,
  removalReviewNotice:
    "A payout whose outcome could not be confirmed is listed for review by the admin.",
  poolDepthShort: (usd: string) => `Depth ${usd} USD`,
  swapsOpenBadge: "Swaps open",
  swapsClosedBadge: "Swaps closed",
  // DEX lot 8: percent bar, shared tolerance field, first deposit of an
  // empty pool, depth bar, withdrawal countdown and balance recovery.
  dexPercentConnect: "Connect a wallet to use the bar.",
  dexPercentLoading: "Loading balances…",
  dexPercentUnavailable: "Balance unavailable.",
  dexPercentNotCover: (fees: string) =>
    `The wallet and DEX balance do not cover the ${fees} network fees.`,
  dexPercentShare: (symbol: string) => `Share of ${symbol} (wallet + DEX)`,
  dexPercentSummary: (percent: string, amount: string) =>
    `${percent}% = ${amount}`,
  dexPercentBase: (wallet: string, dex: string, total: string) =>
    `Base: wallet ${wallet} + DEX ${dex} = ${total}`,
  dexPercentComputedOn: (fees: string) =>
    `Computed on the wallet balance plus the available DEX balance, minus ${fees} in ledger fees on the part taken from the wallet.`,
  slippageFieldHint:
    "Maximum difference between the quoted amount and the executed amount.",
  emptyPoolTitle: "First deposit of an empty pool",
  emptyPoolNote:
    "This pool holds no liquidity yet. Enter one amount; the other side is computed at the reference price and checked against the tolerance when you add.",
  expectedOtherAmountLabel: (symbol: string) =>
    `Expected ${symbol} amount at the reference price`,
  expectedOtherAmountUnavailable: "No reference price is available.",
  addReferenceBlockTitle: "Reference price for the first deposit",
  poolSwapStateLabel: "Swap state",
  depthBarOpen: "Open: the swap threshold is reached",
  depthBarClosed: "Closed: below the swap threshold",
  depthBarAriaLabel: (pair: string) =>
    `TTTI-T amount of the ${pair} pool toward the swap threshold`,
  countdownLabel: "Time remaining",
  countdownDays: (count: string) => `${count} d`,
  countdownHours: (count: string) => `${count} h`,
  countdownMinutes: (count: string) => `${count} min`,
  countdownSeconds: (count: string) => `${count} s`,
  countdownReached: "The effective date has been reached.",
  recoverHeading: "Your DEX balance",
  recoverButton: "Recover",
  recoverExplain:
    "The balance returns to your wallet. The ledger fee is deducted from each amount.",
  recovering: "Recovering…",
  recoverDone: (amounts: string) => `Recovered to your wallet: ${amounts}.`,
  recoverNothing: "There is no DEX balance to recover.",
  recoverError: (detail: string) =>
    `The balance could not be recovered: ${detail}`,
  durationOneYear: "1 year",
  durationYears: (count: string) => `${count} years`,
  durationOneMonth: "1 month",
  durationMonths: (count: string) => `${count} months`,
  positionLockCommitted: "Lock committed",
  positionLockStart: "Lock start",
  positionTimeRemaining: "Time remaining",
  positionRelayReceived: "Relay received",
  relayReceivedNone: "None",
  positionFeesCollected: "Fees collected",
  pendingPotLabel: "Pending pot",
  pendingPotNext: (date: string) => `Next sharing: ${date}`,
  pendingPotRunning: "Sharing in progress",
  pendingPotNote:
    "The pot holds the locked half of the LP fees paid since the last sharing. It is shared once a day between the positions locked during the day.",
  estimatedShareLabel: "Estimated share today",
  estimatedShareDetail: (fraction: string, date: string) =>
    `${fraction} of the day locked · next sharing ${date}`,
  estimatedShareNote:
    "Estimate for the current day: proportional to the weight of the position and to the fraction of the day it is locked. The amount paid depends on the pot at the next sharing.",
  estimatedShareNone: "No locked time today",
  positionStatus: "Status",
  positionStatusLocked: "Locked",
  positionStatusFree: "Free",
  positionStatusFreeNoLock: "Free · no lock",
  positionFreeAfter: "Free after relay or term",
  guaranteedDepthLabel: "Guaranteed depth",
  guaranteedDepthHint: "Locked positions plus permanent liquidity.",
  consolidatedTitle: "Consolidated TTTI-T price",
  consolidatedUsd: (price: string) => `${price} USD`,
  consolidatedCurrent: "Price",
  consolidatedHourly: "Hourly average",
  consolidatedDaily: "24 h average",
  consolidatedSamples: (count: string) => `${count} samples`,
  consolidatedNotAvailable: "Not available",
  consolidatedComputedLabel: "Computed",
  consolidatedSource: (symbol: string, price: string, weight: string) =>
    `TTTI-T/${symbol}: ${price} USD · weight ${weight}`,
  consolidatedNote:
    "Weighted by pool depth and converted to USD at the current hourly rates.",
  consolidatedUnavailableNoRate:
    "The consolidated price is unavailable: no valid hourly rate.",
  consolidatedUnavailableNoPool:
    "The consolidated price is unavailable: no TTTI-T pool is open for swaps.",
  consolidatedLoadError: "The consolidated price could not be loaded.",
  spreadLabel: "Spread vs other open pools",
  spreadNoIndependentReference: "No independent reference",
  spreadAboveThreshold: (threshold: string) => `Spread above ${threshold} %`,
  spreadReasonEmpty: "No liquidity in this pool.",
  spreadReasonNotOpen: "Swaps are not open.",
  spreadReasonNoRate: "No valid hourly rate for this pair.",
  spreadReasonNoConsolidated: "No consolidated price.",
  spreadReasonLoadError: "Spreads could not be loaded.",
  poolPriceLabel: "Pool price",
  spreadAlertTitle: "Spread above threshold",
  spreadAlert: (pool: string, spread: string, threshold: string) =>
    `Pool ${pool}: the pool price is compared to the price of the other open pools. The spread is ${spread}, above the ${threshold} % threshold. You hold a position in this pool.`,
  spreadAlertPrices: (poolPrice: string, consolidated: string) =>
    `Pool price ${poolPrice} USD · price of the other open pools ${consolidated} USD`,
  referenceConsolidatedPrice: (price: string) =>
    `TTTI-T consolidated price: ${price} USD`,
  guaranteedDepthReserves: (amount0: string, amount1: string) =>
    `Guaranteed reserves: ${amount0} and ${amount1}`,
  relayTitle: "Relay of commitments",
  relayExplain:
    "The relay lock is optional and lasts from 3 months to 5 years. A third of the weight of each new commitment relieves the other locked positions of the pool. An owner can extend. A relieved or expired position is unlocked without eviction: it stays in the pool as free liquidity.",
  relayResult: (shortened: string, freed: string) =>
    `Relay: ${shortened} position(s) shortened, ${freed} freed.`,
  relayResultNone: "Relay: no other position was shortened.",
  feeSplitTitle: "Fee split with locked positions",
  feeSplitExplain:
    "Half of the LP fee stays in the reserves, pro rata to shares. The other half is set aside and shared among the locked positions by capital × the square root of (remaining time ÷ 5 years). Only fees actually paid are shared.",
  errExtendRemovalAnnounced: (date: string) =>
    `The lock cannot be extended: the removal of this pair is announced for ${date}.`,
  extendRemainingRule: (min: string, max: string) =>
    `After the extension, the remaining time must be between ${min} and ${max}.`,
  extendMaxDate: (date: string) => `Latest possible unlock: ${date}`,
  extendCurrentRemaining: (remaining: string) =>
    `Current remaining time: ${remaining}`,
  extendNewRemaining: (remaining: string) =>
    `Remaining time after the extension: ${remaining}`,
  extendFreeNote:
    "This position has no active lock. Extending it commits a new lock counted from now.",
  extendRemainingTooShort: (min: string) =>
    `The remaining time after the extension must be at least ${min}.`,
  extendRemainingTooLong: (max: string) =>
    `The remaining time after the extension cannot exceed ${max}.`,
  errExtendLockTooShort: (min: string) =>
    `The remaining time after the extension is below the minimum of ${min}.`,
  errExtendLockTooLong: (date: string) =>
    `The lock cannot end later than ${date}.`,
  extendRelayNote:
    "One third of the weight of the added duration shortens the other committed positions of the pool. The extended position is not shortened by its own extension.",
  feeSplitProtocolTitle: "Split of swap fees",
  feeSplitProtocolRule:
    "A swap fee is split into 70 % for liquidity providers and a 30 % protocol share.",
  feeSplitLpLine: "70 % of the fee goes to liquidity providers.",
  feeSplitCreatorLine:
    "Two thirds of the protocol share (20 % of the fee) go to the creator.",
  feeSplitPermanentLine:
    "One third of the protocol share (10 % of the fee) goes to permanent liquidity, which nobody can withdraw.",
  feeSplitRouterNote: "The 0.1 % ICPSwap router fee follows the same split.",
  feeSplitMintNote:
    "The 1 % mint fee fills the cycles reserve first, up to one year of measured consumption. The remainder goes to the creator.",
  transferFeeFixedTitle: "TTTI-T transfer fee",
  transferFeeFixed:
    "The TTTI-T transfer fee is fixed at 0.000001 TTTI-T and is paid to the creator.",
  boardTitle: "Public board",
  boardIntro:
    "Figures read from the contract: cycles reserve, permanent liquidity and creator holdings.",
  boardLoading: "Loading the public board…",
  boardLoadError: "The public board could not be loaded.",
  boardCyclesTitle: "Cycles reserve",
  boardCyclesMonths: (months: string) =>
    `${months} months of measured consumption`,
  boardCyclesTarget: "Target: one year of consumption",
  boardCyclesFill: (pct: string) => `${pct} % of the one-year target`,
  boardCyclesFillAria: "Cycles reserve filling toward the one-year target",
  boardCyclesReserve: (amount: string) => `Reserve: ${amount}`,
  boardCyclesBalance: (cycles: string) => `Canister cycles: ${cycles}`,
  boardCyclesPending: (amount: string) =>
    `Fee share not yet settled to the reserve: ${amount}`,
  boardCyclesUnknown:
    "Consumption is not measured yet or a rate is unavailable; the coverage cannot be computed.",
  boardTopUpHint: "Anyone can top up the cycles of the canister.",
  boardTopUpButton: "Top up cycles",
  boardTopUpRunning: "Topping up…",
  boardTopUpDone: (cycles: string) =>
    `Top-up done. Canister cycles: ${cycles}.`,
  boardTopUpNotNeeded: (threshold: string) =>
    `No top-up needed: the cycles are above the threshold of ${threshold}.`,
  boardTopUpBusy: "A top-up is already in progress.",
  boardTopUpError: (detail: string) => `The top-up failed: ${detail}`,
  boardPermanentTitle: "Permanent liquidity",
  boardPermanentIntro:
    "Locked pool shares that nobody can withdraw. They are added to the least liquid TTTI-T pool and recorded in a public journal.",
  boardPermanentNone: "No permanent liquidity yet.",
  boardPermanentPoolShares: (shares: string, pct: string) =>
    `${shares} permanent shares (${pct} % of the pool)`,
  boardPermanentHeld: (amount0: string, amount1: string) =>
    `Held by the permanent shares: ${amount0} and ${amount1}`,
  boardPermanentValue: (usd: string) => `Value: ${usd} USD`,
  boardPermanentSetAside: (amounts: string) =>
    `Set aside, waiting for the next injection: ${amounts}`,
  boardPermanentNextPool: (pair: string) => `Next pool: ${pair}`,
  boardPermanentThreshold: (amount: string) => `Injection threshold: ${amount}`,
  boardJournalTitle: "Latest journal entries",
  boardJournalEmpty: "No journal entry yet.",
  boardJournalTotal: (count: string) => `${count} entries`,
  boardJournalColDate: "Date",
  boardJournalColKind: "Kind",
  boardJournalColAmount: "Amount",
  boardJournalColShares: "Shares",
  boardJournalColDetail: "Detail",
  boardJournalRouteNative: "Native pool",
  boardJournalRouteIcpswap: "ICPSwap",
  boardJournalPrev: "Previous",
  boardJournalNext: "Next",
  boardJournalRange: (from: string, to: string, total: string) =>
    `${from}–${to} of ${total}`,
  permKindAccrued: "Accrued",
  permKindRebalanced: "Rebalanced",
  permKindInjected: "Injected",
  permKindWaiting: "Waiting",
  permKindFailed: "Failed",
  permKindAccruedHint: "Protocol share set aside for permanent liquidity.",
  permKindRebalancedHint: "Set-aside amounts swapped toward the pair ratio.",
  permKindInjectedHint: "Added to a pool as locked shares.",
  permKindWaitingHint: "Waiting for a rate or for the threshold.",
  permKindFailedHint: "The step failed and stays in the journal.",
  boardCreatorTitle: "Creator holdings",
  boardCreatorIntro:
    "Amounts held by the contract for the creator, per token, with the fees received in TTTI-T.",
  boardCreatorNone: "No creator holding yet.",
  boardCreatorHeld: "Held",
  boardCreatorPaid: "Paid out",
  boardCreatorInFlight: "In transit",
  boardCreatorMintFee: "Mint fees",
  boardCreatorSwapFee: "Swap fee share",
  boardCreatorRouterShare: "Router fee share",
  boardCreatorTransferFee: "Transfer fees",
  boardCreatorTransferFeesTttiT: (amount: string) =>
    `Transfer fees received in TTTI-T: ${amount}`,
  boardCreatorCollector: (amount: string) =>
    `Fee account balance in TTTI-T: ${amount}`,
  boardCreatorLastCredit: (date: string) => `Last credit: ${date}`,
};
export default en;
