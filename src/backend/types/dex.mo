import Map "mo:core/Map";

// DEX lot 1: v2 constant-product pool registry and pair requests.
// Self-contained (mo:core only) so the module can be moved later.
module {
  public type PoolId = Nat;
  public type RequestId = Nat;
  // Nanoseconds since the epoch (Time.now()).
  public type Timestamp = Int;

  // 5, 30 or 100 basis points (0.05 %, 0.3 %, 1 %).
  public type FeeTier = { #bps5; #bps30; #bps100 };

  // DEX lot 3: #filling = approved pool collecting liquidity (swaps closed)
  // until both reserves total LAUNCH_MIN_TOTAL_USD_E8; #active = open (stays
  // open); #removed = swaps and adds closed, LP withdrawals always open.
  public type PoolStatus = { #filling; #active; #removed };

  public type PoolKind = { #tttiPair; #utilityPair };

  // #internal = this contract's own TTTI-T ledger.
  public type TokenLedger = { #internal; #external : Principal };

  public type PoolToken = {
    ledger : TokenLedger;
    symbol : Text;
    decimals : Nat8;
  };

  // Minimum locked liquidity per token (base units); null = not set.
  public type PoolMinimums = {
    token0 : ?Nat;
    token1 : ?Nat;
  };

  // Admin-supplied minimums for a utility pair (base units).
  public type TokenMinimums = {
    token0 : Nat;
    token1 : Nat;
  };

  public type Pool = {
    id : PoolId;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Timestamp;
    // 32-byte ASCII "DEX-POOL-<id>" (id zero-padded).
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    // Approval + 30 days, for pools created from a request.
    newPairBadgeUntil : ?Timestamp;
    requestId : ?RequestId;
    removedAt : ?Timestamp;
    // DEX lot 3: v2 constant-product reserves (base units, LP fee share included).
    reserve0 : Nat;
    reserve1 : Nat;
    // All LP shares, including the contract-owned minimum shares.
    totalShares : Nat;
    // Minimum shares minted at the first deposit, owned by the contract forever.
    lockedShares : Nat;
    // 20 % protocol share of each fee, accumulated only (not in the reserves).
    protocolFee0 : Nat;
    protocolFee1 : Nat;
  };

  // --- DEX lot 3: LP positions -----------------------------------------------

  public type PositionId = Nat;

  // One position per liquidity add, with its own lock.
  public type Position = {
    id : PositionId;
    poolId : PoolId;
    owner : Principal;
    shares : Nat;
    createdAt : Timestamp;
    lockDurationNs : Nat;
    unlockAt : Timestamp;
    // Owner was the admin / creator at add time (same rules apply).
    isCreator : Bool;
  };

  // Counter token of a pair request.
  public type CounterToken = {
    #icp;
    #ckbtc;
    #ckusdc;
    #ckusdt;
    #tttiT;
    #poolToken : Principal;
  };

  // Metadata read from the requested ledger.
  public type RequestedToken = {
    ledgerId : Principal;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
  };

  public type RequestChecks = {
    icrc1 : Bool;
    icrc2 : Bool;
    metadataRead : Bool;
    pairUnique : Bool;
    // Known token symbol the requested symbol copies (flag for the admin).
    copiedSymbolOf : ?Text;
  };

  public type RequestStatus = {
    #pending;
    #approved : { poolId : PoolId; at : Timestamp };
    #refused : { reason : Text; at : Timestamp };
  };

  // DQ refund of the request deposit (DEX lot 2):
  // #none        = no refund due (pending or refused request);
  // #inProgress  = approved, DQ attempt recorded and retried by lib/retry.mo;
  // #needsReview = outcome still unknown 23 h after its created_at_time;
  // #refunded    = Ok / #Duplicate (or admin "Arrived"), with the block.
  public type PairRefundStatus = {
    #none;
    #inProgress;
    #needsReview;
    #refunded : Nat;
  };

  public type PairRequest = {
    id : RequestId;
    requester : Principal;
    token : RequestedToken;
    counter : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    message : Text;
    createdAt : Timestamp;
    checks : RequestChecks;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    // Lot 1 refund block, kept unchanged; also set when a DQ refund succeeds.
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  public type DexStore = {
    pools : Map.Map<PoolId, Pool>;
    requests : Map.Map<RequestId, PairRequest>;
    // Last refusal per requester (cooldown start).
    lastRefusalAt : Map.Map<Principal, Timestamp>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    // DEX lot 3: LP positions keyed by position id.
    positions : Map.Map<PositionId, Position>;
    var nextPositionId : Nat;
  };

  // --- DEX lot 2: deposits (DD), withdrawals (DW), internal balances ---------

  // Supported DEX tokens; any other token is refused (Candid variant).
  public type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  // Internal balance of one principal for one token (base units).
  // `reserved` = held for a withdrawal in flight.
  public type DexBalance = {
    var available : Nat;
    var reserved : Nat;
  };

  // Per principal, per token key (DexLib.tokenKey).
  public type DexBalances = Map.Map<Principal, Map.Map<Text, DexBalance>>;

  // #inProgress  = recorded, sent or resent (unknown outcome within 23 h);
  // #needsReview = outcome unknown 23 h after created_at_time ("To review");
  // #completed   = Ok / #Duplicate (or admin "Arrived"), with the block;
  // #failed      = known ledger Err (DD: nothing credited; DW: balance given back).
  public type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  public type DexTransferDirection = { #deposit; #withdrawal };

  // --- API boundary ----------------------------------------------------------

  public type DexAccount = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type PoolTokenView = {
    ledgerId : Principal;
    symbol : Text;
    decimals : Nat8;
    isTttiT : Bool;
  };

  public type PoolView = {
    id : PoolId;
    token0 : PoolTokenView;
    token1 : PoolTokenView;
    feeTier : FeeTier;
    feeBps : Nat;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Timestamp;
    subaccount : Blob;
    subaccountText : Text;
    poolAccount : DexAccount;
    minimumLocked : PoolMinimums;
    // 10x minimumLocked; null while the minimum is not set.
    firstDepositMinimum : PoolMinimums;
    minimumsSet : Bool;
    lockedSharesStatement : Text;
    // Launch depth: first deposit >= this total USD value (USD * 1e8), both sides.
    launchMinimumTotalUsdE8 : Nat;
    newPairBadgeUntil : ?Timestamp;
    newPairBadgeActive : Bool;
    approvalStatement : ?Text;
    requestId : ?RequestId;
    removedAt : ?Timestamp;
    acceptsSwaps : Bool;
    acceptsDeposits : Bool;
    acceptsWithdrawals : Bool;
    // DEX lot 3.
    reserve0 : Nat;
    reserve1 : Nat;
    totalShares : Nat;
    lockedShares : Nat;
    protocolFee0 : Nat;
    protocolFee1 : Nat;
    gauge : UsdGauge;
  };

  // --- DEX lot 3: filling gauge, liquidity, positions, swaps -----------------

  // Total USD value of both reserves (USD * 1e8) against the opening target.
  // currentUsdE8 / remainingUsdE8 = null: value momentarily unavailable
  // (missing or expired rate).
  public type UsdGauge = {
    currentUsdE8 : ?Nat;
    targetUsdE8 : Nat;
    remainingUsdE8 : ?Nat;
    valueAvailable : Bool;
    missingRate : { token0 : Bool; token1 : Bool };
  };

  public type PoolSide = { #token0; #token1 };

  // `amount` of `side`; the contract computes the counter amount from the
  // reserve ratio (rounded up, in favor of the pool). First deposit:
  // `counterAmount` is required and fixes the ratio. Later deposits:
  // `counterAmount`, when given, must equal the required counter amount
  // (otherwise #ratioMismatch with the required amount).
  public type AddLiquidityQuoteArgs = {
    poolId : PoolId;
    side : PoolSide;
    amount : Nat;
    counterAmount : ?Nat;
  };

  public type AddLiquidityArgs = {
    poolId : PoolId;
    side : PoolSide;
    amount : Nat;
    counterAmount : ?Nat;
    // 24 h minimum, 5 years maximum.
    lockDurationNs : Nat;
  };

  public type AddLiquidityQuote = {
    poolId : PoolId;
    isFirstDeposit : Bool;
    amount0 : Nat;
    amount1 : Nat;
    // Shares the depositor receives (first deposit: sqrt(A x B) minus lockedShares).
    shares : Nat;
    // First deposit only: shares owned by the contract forever.
    lockedShares : Nat;
    totalSharesAfter : Nat;
    gaugeAfter : UsdGauge;
    opensPool : Bool;
  };

  public type PositionView = {
    id : PositionId;
    poolId : PoolId;
    owner : Principal;
    shares : Nat;
    // Token amounts the shares correspond to (pro rata, rounded down).
    amount0 : Nat;
    amount1 : Nat;
    token0Symbol : Text;
    token1Symbol : Text;
    createdAt : Timestamp;
    lockDurationNs : Nat;
    unlockAt : Timestamp;
    isCreator : Bool;
    unlocked : Bool;
    // Unlocked, or the pair is removed.
    withdrawable : Bool;
  };

  public type AddLiquidityResult = {
    position : PositionView;
    amount0 : Nat;
    amount1 : Nat;
    shares : Nat;
    lockedShares : Nat;
    pool : PoolView;
  };

  public type RemoveLiquidityResult = {
    positionId : PositionId;
    poolId : PoolId;
    shares : Nat;
    amount0 : Nat;
    amount1 : Nat;
    pool : PoolView;
  };

  public type SwapQuote = {
    poolId : PoolId;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    // Total fee on the input (rounded up), then its LP (80 %) and protocol (20 %) parts.
    fee : Nat;
    lpFee : Nat;
    protocolFee : Nat;
    feeBps : Nat;
    priceImpactBps : Nat;
    slippageBps : Nat;
    minimumReceived : Nat;
    // Latest deadline swap accepts: call time + 5 minutes.
    maxDeadlineNs : Nat;
  };

  public type SwapResult = {
    poolId : PoolId;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    fee : Nat;
    lpFee : Nat;
    protocolFee : Nat;
    pool : PoolView;
  };

  public type AddLiquidityError = {
    #anonymous;
    #poolNotFound;
    #poolRemoved;
    #minimumsNotSet;
    #unsupportedToken;
    #zeroAmount;
    #counterAmountRequired;
    #insufficientBalance : { token : DexToken; available : Nat; required : Nat };
    #belowMinimum : { token0Minimum : ?Nat; token1Minimum : ?Nat };
    #ratioMismatch : { requiredCounterAmount : Nat };
    #lockTooShort : { minimumNs : Nat };
    #lockTooLong : { maximumNs : Nat };
    #zeroShares;
    #operationInProgress;
  };

  public type RemoveLiquidityError = {
    #anonymous;
    #positionNotFound;
    #notPositionOwner;
    #poolNotFound;
    #positionLocked : { unlockAt : Timestamp };
    #operationInProgress;
  };

  public type ExtendLockError = {
    #anonymous;
    #positionNotFound;
    #notPositionOwner;
    #cannotShortenLock : { unlockAt : Timestamp };
    #lockTooLong : { maximumUnlockAt : Timestamp };
    #operationInProgress;
  };

  public type SwapError = {
    #anonymous;
    #poolNotFound;
    #poolFilling : { gauge : UsdGauge };
    #poolRemoved;
    #poolNotOpen;
    #rateUnavailable;
    #unsupportedToken;
    #tokenNotInPool;
    #zeroAmount;
    #invalidSlippage : { maximumBps : Nat };
    #insufficientBalance : { available : Nat };
    #insufficientLiquidity;
    #slippageExceeded : { amountOut : Nat; minAmountOut : Nat };
    #deadlineExceeded : { deadline : Timestamp; now : Timestamp };
    #deadlineTooFar : { maximum : Timestamp };
    #operationInProgress;
  };

  public type PairRequestView = {
    id : RequestId;
    requester : Principal;
    token : RequestedToken;
    counter : PoolTokenView;
    feeTier : FeeTier;
    feeBps : Nat;
    kind : PoolKind;
    message : Text;
    createdAt : Timestamp;
    checks : RequestChecks;
    copiedSymbol : Bool;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  public type DexTokenInfo = {
    token : DexToken;
    symbol : Text;
    ledgerId : Principal;
    decimals : Nat8;
    fee : Nat;
    // Smallest deposit amount accepted (base units).
    minimumDeposit : Nat;
    // Smallest withdrawal amount accepted (above the ledger fee).
    minimumWithdrawal : Nat;
  };

  public type DexBalanceView = {
    token : DexToken;
    symbol : Text;
    ledgerId : Principal;
    available : Nat;
    reserved : Nat;
  };

  public type DexAmountArgs = {
    token : DexToken;
    amount : Nat;
  };

  public type DexTransferView = {
    n : Nat;
    direction : DexTransferDirection;
    owner : Principal;
    token : DexToken;
    // Internal balance amount credited (deposit) or debited (withdrawal).
    amount : Nat;
    // Amount moved on the ledger (withdrawal: amount minus the ledger fee).
    ledgerAmount : Nat;
    fee : Nat;
    from : DexAccount;
    to : DexAccount;
    memoText : Text;
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    status : DexTransferStatus;
    lastError : ?Text;
  };

  public type DexDepositError = {
    #anonymous;
    #amountTooSmall : { minimum : Nat };
    #transferInProgress;
    #insufficientAllowance : { allowance : Nat; required : Nat };
    #insufficientFunds : { balance : Nat };
    #ledgerError : Text;
  };

  public type DexWithdrawError = {
    #anonymous;
    #amountTooSmall : { minimum : Nat };
    #insufficientBalance : { available : Nat };
    #transferInProgress;
    #ledgerError : Text;
  };

  public type DexConfig = {
    requestDeposit : Nat;
    depositAccount : DexAccount;
    maxPendingPerUser : Nat;
    refusalCooldownNs : Int;
    messageMaxChars : Nat;
    reasonMaxChars : Nat;
    newPairBadgeNs : Int;
    tttiMinimumLocked : Nat;
    firstDepositMultiplier : Nat;
    feeTiers : [FeeTier];
    protocolStatement : Text;
    lockedSharesStatement : Text;
    approvalStatement : Text;
    // Launch depth rule (computed constants, USD * 1e8).
    launchMinimumTotalUsdE8 : Nat;
    usdRateScale : Nat;
    // TTTI-T valued at a fixed 10,000 USD per token.
    tttiTUsdE8 : Nat;
    // ICP, ckBTC, ckUSDC, ckUSDT: hourly stored rate, valid 1 h + 5 min grace.
    rateValidForNs : Nat;
    rateGraceNs : Nat;
    launchDepthStatement : Text;
    // DEX lot 3.
    minLockNs : Nat;
    maxLockNs : Nat;
    swapDeadlineMaxNs : Nat;
    lpFeeSharePercent : Nat;
    protocolFeeSharePercent : Nat;
  };

  // Combined USD value of a launch deposit (USD * 1e8), or which rate is missing.
  public type LaunchUsdValue = {
    #value : Nat;
    #missingRate : { token0 : Bool; token1 : Bool };
  };

  public type RequestPairArgs = {
    ledgerId : Principal;
    counter : CounterToken;
    feeTier : FeeTier;
    message : Text;
  };

  public type RequestPairError = {
    #anonymous;
    #messageTooLong : { max : Nat };
    #invalidToken : Text;
    #unknownCounterToken;
    #ledgerUnreachable : Text;
    #missingStandards : { icrc1 : Bool; icrc2 : Bool };
    #metadataUnavailable : Text;
    #pairExists : { poolId : ?PoolId; requestId : ?RequestId };
    #tooManyPending : { max : Nat };
    #cooldown : { until : Timestamp };
    #insufficientAllowance : { allowance : Nat; required : Nat };
    #insufficientFunds : { balance : Nat };
    #depositFailed : Text;
  };

  public type ApprovePairError = {
    #notAuthorized;
    #requestNotFound;
    #notPending;
    #minimumsRequired;
    #minimumsNotAllowed;
    #invalidMinimums;
    #pairExists : { poolId : PoolId };
    #refundFailed : Text;
  };

  public type RefusePairError = {
    #notAuthorized;
    #requestNotFound;
    #notPending;
    #reasonRequired;
    #reasonTooLong : { max : Nat };
  };

  public type RemovePairError = {
    #notAuthorized;
    #poolNotFound;
    #alreadyRemoved;
  };

  public type SetMinimumsError = {
    #notAuthorized;
    #poolNotFound;
    #notUtilityPair;
    #poolRemoved;
    #liquidityAlreadyAdded;
    #invalidMinimums;
  };

  // ICRC-1 / ICRC-2 / ICRC-10 surface read during the request checks.
  public type MetadataValue = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
  };

  public type StandardRecord = { name : Text; url : Text };

  public type TokenLedgerActor = actor {
    icrc1_supported_standards : shared query () -> async [StandardRecord];
    icrc10_supported_standards : shared query () -> async [StandardRecord];
    icrc1_metadata : shared query () -> async [(Text, MetadataValue)];
    icrc1_name : shared query () -> async Text;
    icrc1_symbol : shared query () -> async Text;
    icrc1_decimals : shared query () -> async Nat8;
    icrc1_fee : shared query () -> async Nat;
  };
};
