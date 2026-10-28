import List "mo:core/List";
import Map "mo:core/Map";
import Common "common";
import Dex "dex";
import Retry "retry";

// DEX lot 4: split of the 20 % pool protocol share (cycles, locked-LP bonus
// DL, recycling as protocol liquidity locked forever), batched fee conversion
// to ICP (DC) and the claimable locked-LP bonus. The protocol never places
// price-based orders.
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
};
