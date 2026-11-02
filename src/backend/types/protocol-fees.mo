import List "mo:core/List";
import Map "mo:core/Map";
import Common "common";
import Dex "dex";
import Retry "retry";

// DEX lot 4: protocol fee types (DC batches, locked-LP bonus DL, protocol
// liquidity locked forever). PTM-4: the protocol share is 30 % of the native
// swap fee and of the 0.1 % routed via ICPSwap; two thirds go to the creator
// (types/creator-fees.mo) and one third to permanent liquidity, injected into
// the least liquid TTTI-T pool as contract-locked shares (journal below). The
// protocol never places price-based orders and never creates TTTI-T.
module {
  public type Account = Common.Account;
  public type Timestamp = Int;
  public type PoolId = Nat;
  public type DexTransferAttempt = Retry.DexTransferAttempt;
  public type DexTransferStatus = Dex.DexTransferStatus;

  // Waiting split of one pool's protocol share (base units of each pool
  // token, outside reserves). `cycles*` and `bonus*` wait for the next DC
  // batch; `recycle*` waits to be added as protocol liquidity.
  public type FeeBuckets = {
    cycles0 : Nat;
    cycles1 : Nat;
    bonus0 : Nat;
    bonus1 : Nat;
    recycle0 : Nat;
    recycle1 : Nat;
  };

  // One pool reserve sample for the 30 to 60 minute average price.
  public type PriceSample = {
    at : Timestamp;
    reserve0 : Nat;
    reserve1 : Nat;
  };

  // PTM-5: one sample of the consolidated TTTI-T price (USD x 1e8), taken by
  // the same 5-minute timer as PriceSample. Separate from PriceSample (60 min
  // reserve window used by referenceOut): kept 24 h.
  public type ConsolidatedSample = {
    at : Timestamp;
    priceUsdE8 : Nat;
  };

  // Stable consolidated price samples (new stable field `consolidatedPrices`),
  // oldest first.
  public type ConsolidatedPriceStore = {
    samples : List.List<ConsolidatedSample>;
  };

  public let CONSOLIDATED_HOUR_NS : Int = 3_600_000_000_000;
  public let CONSOLIDATED_RETENTION_NS : Int = 86_400_000_000_000;

  // PTM-10a: one pools-to-capitalisation ratio sample, taken by the same
  // 5-minute timer as the consolidated price, kept 24 h. `ratio` is fixed
  // point: DexLib.RATIO_SCALE (10^12) = 100 %.
  public type PoolCapRatioSample = {
    at : Timestamp;
    ratio : Nat;
  };

  // Stable ratio samples (new stable field `poolCapRatioSamples`), oldest first.
  public type PoolCapRatioStore = {
    samples : List.List<PoolCapRatioSample>;
  };

  // PTM-10a: public pools / capitalisation indicators. Amounts in USD x 1e8,
  // ratios with `ratioScale` (10^12 = 100 %), `lockedShare` with
  // `lockedShareScale` (10^6 = 100 %). Not used by the mint yet.
  public type PoolCapRatioView = {
    computedAt : Timestamp;
    poolsValueUsdE8 : ?Nat; // null when a needed oracle rate is absent or expired
    poolCount : Nat; // native TTTI-T pools counted (not removed, counterpart reserve > 0)
    circulatingTttiT : Nat; // base units: total minted minus the auction account
    consolidatedPriceUsdE8 : ?Nat; // hourly average, null until 30 minutes of samples
    capitalisationUsdE8 : ?Nat;
    currentRatio : ?Nat;
    averageRatio24h : ?Nat;
    samples : Nat; // ratio samples in the last 24 h
    retainedRatio : ?Nat; // lower of the current ratio and the 24 h average
    targetRatio : Nat; // 50 %
    lockedShare : Nat; // m, rounded upward
    ratioScale : Nat;
    lockedShareScale : Nat;
  };

  public type DcTrigger = { #daily; #threshold };

  // One conversion leg of a DC batch (one pool, fee-free in the app's pool).
  public type DcLeg = {
    poolId : PoolId;
    tokenSymbol : Text; // token converted
    amountIn : Nat;
    referenceIcpOutE8s : Nat; // at the 30-60 min average price
    executionIcpOutE8s : Nat; // at the pool reserves at execution
    deviationBps : Nat;
    converted : Bool; // false = deviation above 2 %, waits for the next batch
  };

  // #waitingPriceDeviation = at least one leg deviated more than 2 % from the
  // average and was not converted; #sent / #needsReview / #failed follow the
  // DC transfer (lib/retry.mo).
  public type DcBatchStatus = {
    #nothingToConvert;
    #waitingPriceDeviation;
    #sending;
    #sent : Nat; // ICP ledger block
    #needsReview;
    #failed : Text;
  };

  public type DcBatch = {
    id : Nat;
    at : Timestamp;
    trigger : DcTrigger;
    legs : [DcLeg];
    toCyclesE8s : Nat; // converted ICP sent to the cycles reserve (memo DC)
    toBonusE8s : Nat; // converted ICP credited to the DL bonus
    status : DcBatchStatus;
  };

  // One DC send (ICP to the cycles reserve), keyed by n.
  public type DcSend = {
    n : Nat;
    batchId : Nat;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  // One DL claim (ICP to the LP), keyed by n.
  public type BonusClaim = {
    n : Nat;
    owner : Principal;
    amountE8s : Nat;
    createdAt : Timestamp;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  // One bonus distribution to locked positions of TTTI-T pairs.
  public type BonusSource = { #fees; #treasury };

  public type BonusDistribution = {
    id : Nat;
    at : Timestamp;
    source : BonusSource;
    totalE8s : Nat;
    totalWeight : Nat;
    positions : Nat;
  };

  // Protocol-owned liquidity of one pool, locked forever (no withdrawal path).
  // `shares` are counted in pool.totalShares with no position.
  public type ProtocolLiquidity = {
    poolId : PoolId;
    shares : Nat;
    fromFees0 : Nat;
    fromFees1 : Nat;
    fromTreasury0 : Nat;
    fromTreasury1 : Nat;
    lastAddedAt : ?Timestamp;
  };

  // Stable protocol fee state (new stable field `protocolFees`).
  public type ProtocolFeeStore = {
    buckets : Map.Map<PoolId, FeeBuckets>;
    priceSamples : Map.Map<PoolId, List.List<PriceSample>>;
    batches : List.List<DcBatch>;
    var nextBatchId : Nat;
    var lastBatchAt : ?Timestamp;
    dcSends : Map.Map<Nat, DcSend>;
    var bonusUndistributedE8s : Nat;
    bonusClaimable : Map.Map<Principal, Nat>;
    bonusClaimed : Map.Map<Principal, Nat>;
    bonusDistributions : List.List<BonusDistribution>;
    var nextDistributionId : Nat;
    bonusClaims : Map.Map<Nat, BonusClaim>;
    protocolLiquidity : Map.Map<PoolId, ProtocolLiquidity>;
    // ICP held in DEX-PROTOCOL-FEES-ICP-0000000001 for the next DC send.
    var cyclesHeldE8s : Nat;
    // DC conversion legs in flight (keyed by DcSend n): the cycles and bonus
    // ICP each one brings to the protocol fee account when it arrives
    // (0 / 0 for a fee-token move into the converting ICP pool).
    dcLegs : Map.Map<Nat, DcLegSplit>;
  };

  public type DcLegSplit = { cyclesE8s : Nat; bonusE8s : Nat };

  // --- Views -----------------------------------------------------------------

  // Public view of the protocol liquidity of one pool.
  public type ProtocolLiquidityView = {
    poolId : PoolId;
    token0Symbol : Text;
    token1Symbol : Text;
    shares : Nat;
    totalShares : Nat;
    amount0 : Nat; // current share of reserve0
    amount1 : Nat; // current share of reserve1
    fromFees0 : Nat;
    fromFees1 : Nat;
    fromTreasury0 : Nat;
    fromTreasury1 : Nat;
    lastAddedAt : ?Timestamp;
  };

  // Bonus weight of one locked TTTI-T-pair position of the caller.
  public type PositionBonusWeight = {
    positionId : Nat;
    poolId : PoolId;
    valueIcpE8s : Nat; // at the average price
    remainingLockNs : Nat;
    weight : Nat; // valueIcpE8s * remainingLockNs / 5 years
  };

  public type BonusClaimView = {
    n : Nat;
    amountE8s : Nat;
    createdAt : Timestamp;
    memoText : Text;
    status : DexTransferStatus;
  };

  // The caller's observed bonus (ICP e8s), no projection.
  public type LpBonusView = {
    claimableE8s : Nat;
    claimedE8s : Nat;
    positions : [PositionBonusWeight];
    claims : [BonusClaimView];
  };

  public type ClaimBonusError = {
    #anonymous;
    #nothingToClaim;
    #belowMinimum : { minimumE8s : Nat };
    #claimInProgress;
  };

  // #ok = the claim is recorded and sent (or resent by the timer).
  public type ClaimBonusResult = {
    #ok : BonusClaimView;
    #err : ClaimBonusError;
  };

  // --- PTM-4: permanent liquidity journal and set-aside -----------------------

  public type DexToken = Dex.DexToken;

  // #accrued = one third of a protocol share set aside; #rebalanced = one swap
  // leg toward the TTTI-T pair; #injected = contract-locked shares added;
  // #waiting = nothing done yet (reason given); #failed = a leg failed.
  public type PermanentKind = { #accrued; #rebalanced; #injected; #waiting; #failed };

  public type PermanentRoute = { #native : PoolId; #icpswap : Principal };

  // One journal entry (stable, public, never rewritten). Amounts are base
  // units. #accrued: token / amount set aside, poolId = pool where the fee
  // arose (null for the router share). #rebalanced: token / amount sold for
  // otherToken / otherAmount on `route`. #injected: token / amount and
  // otherToken / otherAmount added to poolId for `shares` locked shares.
  public type PermanentLogEntry = {
    id : Nat;
    at : Timestamp;
    kind : PermanentKind;
    token : DexToken;
    amount : Nat;
    otherToken : ?DexToken;
    otherAmount : Nat;
    route : ?PermanentRoute;
    poolId : ?PoolId;
    shares : Nat;
    reason : ?Text;
  };

  // Stable permanent liquidity state (new stable field `permanentLiquidity`).
  public type PermanentLiquidityStore = {
    setAside : Map.Map<Text, Nat>; // one third of the protocol share per token symbol, waiting
    log : List.List<PermanentLogEntry>; // oldest first
    var nextLogId : Nat;
    lastWaiting : Map.Map<Text, Text>; // last waiting / failed text per key (no repeated entries)
  };

  public type PermanentLogPage = {
    total : Nat;
    entries : [PermanentLogEntry]; // newest first
  };

  public type PermanentPoolSummary = {
    poolId : PoolId;
    token0Symbol : Text;
    token1Symbol : Text;
    lockedShares : Nat; // contract-locked shares, nobody can withdraw them
    totalShares : Nat;
    amount0 : Nat; // current share of reserve0
    amount1 : Nat;
    valueUsdE8 : ?Nat; // null without a usable rate
  };

  public type PermanentSetAsideView = {
    token : DexToken;
    symbol : Text;
    amount : Nat;
    valueIcpE8s : ?Nat; // at the hourly average, null when unknown
  };

  public type PermanentSummary = {
    pools : [PermanentPoolSummary];
    totalLockedShares : Nat;
    setAside : [PermanentSetAsideView];
    setAsideValueIcpE8s : Nat;
    thresholdIcpE8s : Nat;
    maxDeviationBps : Nat;
    targetPoolId : ?PoolId; // least liquid open TTTI-T pool, the next injection
  };
};
