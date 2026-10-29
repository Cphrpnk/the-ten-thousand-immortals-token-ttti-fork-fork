import List "mo:core/List";
import Map "mo:core/Map";

// DEX lot 7: public indicators store.
// Adds the `dexIndicators` store: no snapshot yet, no error, empty swap
// activity. Every other field is carried forward unchanged (never sale.reserved,
// ledger balances, blocks, pools, positions or internal DEX balances).
module {
  type OldActor = {};

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type ReserveStatus = { #ok; #surplus; #shortfall };

  type TokenProof = {
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
    difference : Int;
    status : ReserveStatus;
  };

  type DepthSide = { amountIn : Nat; amountOut : Nat };
  type DepthLevel = { token0In : DepthSide; token1In : DepthSide };
  type Depth = {
    onePercent : DepthLevel;
    twoPercent : DepthLevel;
    fivePercent : DepthLevel;
  };

  type LiquidityBreakdown = {
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

  type UnlockBucket = { shares : Nat; amount0 : Nat; amount1 : Nat };
  type UnlockSchedule = {
    thisWeek : UnlockBucket;
    days30 : UnlockBucket;
    days90 : UnlockBucket;
    year1 : UnlockBucket;
    overYear1 : UnlockBucket;
    permanent : UnlockBucket;
  };

  type Concentration = {
    positionCount : Nat;
    largestPositionBps : Nat;
    topFiveBps : Nat;
    permanentProtocolBps : Nat;
  };

  type ActivityWindow = {
    swapCount : Nat;
    volume0 : Nat;
    volume1 : Nat;
    volumeUsdE8 : ?Nat;
  };
  type Activity = { last24h : ActivityWindow; last7d : ActivityWindow };

  type FeeTotals = {
    collected0 : Nat;
    collected1 : Nat;
    lp0 : Nat;
    lp1 : Nat;
    permanent0 : Nat;
    permanent1 : Nat;
  };

  type ObservedFee = {
    periodDays : Nat;
    feesUsdE8 : ?Nat;
    liquidityUsdE8 : ?Nat;
    feeToLiquidityBps : ?Nat;
  };

  type FeeSharing = {
    last7d : FeeTotals;
    cumulative : FeeTotals;
    cumulativeSince : ?Int;
    observed : ObservedFee;
  };

  type PoolIndicators = {
    poolId : Nat;
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

  type DexIndicatorsSnapshot = {
    computedAt : Int;
    reserveCheckedAt : ?Int;
    proofs : [TokenProof];
    pools : [PoolIndicators];
  };

  type LastError = { message : Text; at : Int };

  type HourBucket = {
    hour : Nat;
    var swapCount : Nat;
    var volume0 : Nat;
    var volume1 : Nat;
    var fee0 : Nat;
    var fee1 : Nat;
  };

  type PoolActivity = {
    buckets : List.List<HourBucket>;
    var totalSwaps : Nat;
    var totalVolume0 : Nat;
    var totalVolume1 : Nat;
    var totalFee0 : Nat;
    var totalFee1 : Nat;
  };

  type IndicatorsStore = {
    var snapshot : ?DexIndicatorsSnapshot;
    var lastComputedAt : ?Int;
    var lastError : ?LastError;
    var lastSuccessAt : ?Int;
    var recordingSince : ?Int;
    activity : Map.Map<Nat, PoolActivity>;
  };

  type NewActor = {
    dexIndicators : IndicatorsStore;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      dexIndicators = {
        var snapshot = null;
        var lastComputedAt = null;
        var lastError = null;
        var lastSuccessAt = null;
        var recordingSince = null;
        activity = Map.empty();
      };
    };
  };
};
