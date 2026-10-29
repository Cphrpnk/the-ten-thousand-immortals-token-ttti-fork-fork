import List "mo:core/List";
import Map "mo:core/Map";
import Dex "dex";
import DexReserve "dex-reserve";

// DEX lot 7: public indicators computed once per hour and stored. Facts only:
// no APY, no yield projection. Percentages are basis points (10_000 = 100 %).
// Token amounts are base units of the token concerned; USD values are USD with
// 8 decimals (usdE8) and absent when the hourly rate is absent or expired.
module {
  // Nanoseconds since the epoch (Time.now()).
  public type Timestamp = Int;

  public type PoolId = Dex.PoolId;

  // TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT.
  public type DexToken = Dex.DexToken;

  public type ReserveStatus = DexReserve.ReserveStatus;

  // --- Snapshot (public) -----------------------------------------------------

  // Proof of reserves of one token, copied from the latest reserve check.
  // difference = ledgerTotal - internalTotal.
  public type TokenProof = {
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
    difference : Int;
    status : ReserveStatus;
  };

  // Amount in and the amount out it buys (fees included), in the pool's tokens.
  public type DepthSide = {
    amountIn : Nat;
    amountOut : Nat;
  };

  // Largest swap that moves the price by the stated percent, per direction
  // (token0In = token0 swapped for token1; token1In = the reverse). 0 for an
  // empty or not-yet-open pool.
  public type DepthLevel = {
    token0In : DepthSide;
    token1In : DepthSide;
  };

  public type Depth = {
    onePercent : DepthLevel;
    twoPercent : DepthLevel;
    fivePercent : DepthLevel;
  };

  // Firm = frozen position shares + the permanent protocol minimum shares +
  // the protocol liquidity shares; free = position shares whose lock has
  // ended. firm + free = the pool's total shares. Amounts are the token
  // amounts those shares represent at the reserves of the computation.
  public type LiquidityBreakdown = {
    totalShares : Nat;
    firmShares : Nat;
    freeShares : Nat;
    firmAmount0 : Nat;
    firmAmount1 : Nat;
    freeAmount0 : Nat;
    freeAmount1 : Nat;
    firmBps : Nat;
    freeBps : Nat;
  };

  // Shares (and the token amounts they represent) that unlock in a period.
  public type UnlockBucket = {
    shares : Nat;
    amount0 : Nat;
    amount1 : Nat;
  };

  // Frozen position shares grouped by unlock date (days from the computation:
  // thisWeek <= 7, days30 <= 30, days90 <= 90, year1 <= 365, overYear1 > 365)
  // plus permanent = protocol minimum and protocol liquidity. The six buckets
  // plus the free shares add up to the pool's total shares.
  public type UnlockSchedule = {
    thisWeek : UnlockBucket;
    days30 : UnlockBucket;
    days90 : UnlockBucket;
    year1 : UnlockBucket;
    overYear1 : UnlockBucket;
    permanent : UnlockBucket;
  };

  public type Concentration = {
    positionCount : Nat;
    largestPositionBps : Nat;
    topFiveBps : Nat;
    permanentProtocolBps : Nat;
  };

  // Swaps of a window: volume = amount swapped in, per pool token.
  public type ActivityWindow = {
    swapCount : Nat;
    volume0 : Nat;
    volume1 : Nat;
    volumeUsdE8 : ?Nat;
  };

  public type Activity = {
    last24h : ActivityWindow;
    last7d : ActivityWindow;
  };

  // Fees collected and their 70 / 30 split (LP part and permanent-liquidity
  // part), per pool token.
  public type FeeTotals = {
    collected0 : Nat;
    collected1 : Nat;
    lp0 : Nat;
    lp1 : Nat;
    permanent0 : Nat;
    permanent1 : Nat;
  };

  // Plain figure over the period: fees collected in the period against the
  // pool liquidity, both in USD, in basis points. No annualisation.
  public type ObservedFee = {
    periodDays : Nat;
    feesUsdE8 : ?Nat;
    liquidityUsdE8 : ?Nat;
    feeToLiquidityBps : ?Nat;
  };

  public type FeeSharing = {
    last7d : FeeTotals;
    // Since the activity recording started (cumulativeSince).
    cumulative : FeeTotals;
    cumulativeSince : ?Timestamp;
    observed : ObservedFee;
  };

  public type PoolIndicators = {
    poolId : PoolId;
    token0Symbol : Text;
    token1Symbol : Text;
    isOpen : Bool;
    reserve0 : Nat;
    reserve1 : Nat;
    valueUsdE8 : ?Nat;
    depth : Depth;
    liquidity : LiquidityBreakdown;
    unlock : UnlockSchedule;
    concentration : Concentration;
    activity : Activity;
    fees : FeeSharing;
  };

  public type DexIndicatorsSnapshot = {
    computedAt : Timestamp;
    // checkedAt of the reserve check the proofs come from (null: no check yet,
    // proofs empty).
    reserveCheckedAt : ?Timestamp;
    proofs : [TokenProof];
    pools : [PoolIndicators];
  };

  // One flat row per pool of the stored snapshot (OQL entity dexIndicator).
  public type IndicatorRow = {
    poolId : PoolId;
    computedAt : Timestamp;
    token0Symbol : Text;
    token1Symbol : Text;
    isOpen : Bool;
    reserve0 : Nat;
    reserve1 : Nat;
    valueUsdE8 : ?Nat;
    depth1PctToken0In : Nat;
    depth1PctToken1In : Nat;
    depth2PctToken0In : Nat;
    depth2PctToken1In : Nat;
    depth5PctToken0In : Nat;
    depth5PctToken1In : Nat;
    totalShares : Nat;
    firmShares : Nat;
    freeShares : Nat;
    firmBps : Nat;
    freeBps : Nat;
    unlockThisWeekShares : Nat;
    unlock30dShares : Nat;
    unlock90dShares : Nat;
    unlock1yShares : Nat;
    unlockOver1yShares : Nat;
    permanentShares : Nat;
    positionCount : Nat;
    largestPositionBps : Nat;
    topFiveBps : Nat;
    permanentProtocolBps : Nat;
    swaps24h : Nat;
    volume0In24h : Nat;
    volume1In24h : Nat;
    volumeUsdE8In24h : ?Nat;
    swaps7d : Nat;
    volume0In7d : Nat;
    volume1In7d : Nat;
    volumeUsdE8In7d : ?Nat;
    fees7dCollected0 : Nat;
    fees7dCollected1 : Nat;
    feesCumulativeCollected0 : Nat;
    feesCumulativeCollected1 : Nat;
    observedFeeToLiquidityBps : ?Nat;
  };

  // --- Stored state ----------------------------------------------------------

  public type LastError = {
    message : Text; // exact text
    at : Timestamp;
  };

  // Swap activity of one pool during one hour (hour = Time.now() / 1 h).
  public type HourBucket = {
    hour : Nat;
    var swapCount : Nat;
    var volume0 : Nat; // token0 swapped in
    var volume1 : Nat; // token1 swapped in
    var fee0 : Nat; // fees collected in token0
    var fee1 : Nat; // fees collected in token1
  };

  // Hourly buckets kept for 7 days (oldest first) and the running totals since
  // the recording started.
  public type PoolActivity = {
    buckets : List.List<HourBucket>;
    var totalSwaps : Nat;
    var totalVolume0 : Nat;
    var totalVolume1 : Nat;
    var totalFee0 : Nat;
    var totalFee1 : Nat;
  };

  public type IndicatorsStore = {
    var snapshot : ?DexIndicatorsSnapshot;
    var lastComputedAt : ?Timestamp;
    var lastError : ?LastError; // cleared by a successful computation
    var lastSuccessAt : ?Timestamp;
    var recordingSince : ?Timestamp;
    activity : Map.Map<PoolId, PoolActivity>;
  };

  // --- API boundary ----------------------------------------------------------

  public type ComputationResult = { #ok; #failed };

  public type IndicatorsStatus = {
    snapshotAt : ?Timestamp;
    lastComputedAt : ?Timestamp;
    lastResult : ?ComputationResult;
    lastError : ?LastError;
    lastSuccessAt : ?Timestamp;
  };

  public type DexIndicatorsError = {
    #unauthorized; // caller is not an admin
  };
};
