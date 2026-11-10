import Map "mo:core/Map";
import Set "mo:core/Set";

// DEX-2 reading fix: stores the last ICPSwap reading of each pair used by the
// first-deposit reference price. `dex` gains `referenceReadings`, initially
// empty; every other field (pools, requests, positions, removals, ICPSwap
// samples, the pool index and the fee pot) is carried forward by reference.
// sale.reserved, balances, blocks, the ledger and its stored fee are never
// touched.
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolKind = { #tttiPair; #utilityPair };
  type PoolStatus = { #filling; #active; #removed };
  type TokenLedger = { #internal; #external : Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type RequestedToken = {
    ledgerId : Principal;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
  };

  type RequestChecks = {
    icrc1 : Bool;
    icrc2 : Bool;
    metadataRead : Bool;
    pairUnique : Bool;
    copiedSymbolOf : ?Text;
  };

  type RequestStatus = {
    #pending;
    #approved : { poolId : Nat; at : Int };
    #refused : { reason : Text; at : Int };
  };

  type PairRefundStatus = {
    #none;
    #inProgress;
    #needsReview;
    #refunded : Nat;
  };

  type PairRequest = {
    id : Nat;
    requester : Principal;
    token : RequestedToken;
    counter : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    message : Text;
    createdAt : Int;
    checks : RequestChecks;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  type RemovalState = {
    #announced;
    #cancelled : { cancelledAt : Int };
    #executing : { startedAt : Int };
    #completed : { completedAt : Int };
  };

  type PairRemoval = {
    poolId : Nat;
    reason : Text;
    announcedAt : Int;
    effectiveAt : Int;
    state : RemovalState;
  };

  type IcpSwapSample = {
    poolCanister : Principal;
    counter : DexToken;
    counterPerTttiE8 : Nat;
    counterReserve : Nat;
    readAt : Int;
  };

  type Pool = {
    id : Nat;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Int;
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    newPairBadgeUntil : ?Int;
    requestId : ?Nat;
    removedAt : ?Int;
    reserve0 : Nat;
    reserve1 : Nat;
    totalShares : Nat;
    lockedShares : Nat;
    protocolFee0 : Nat;
    protocolFee1 : Nat;
    lockedFeesPaid0 : Nat;
    lockedFeesPaid1 : Nat;
  };

  type Position = {
    id : Nat;
    poolId : Nat;
    owner : Principal;
    shares : Nat;
    createdAt : Int;
    lockDurationNs : Nat;
    unlockAt : Int;
    isCreator : Bool;
    lockStartedAt : Int;
    relayReceivedNs : Nat;
    feesCollected0 : Nat;
    feesCollected1 : Nat;
    mintShareE6 : Nat;
  };

  type SharingPhase = { #idle; #summing; #paying };

  type PoolPot = {
    poolId : Nat;
    var pending0 : Nat;
    var pending1 : Nat;
    var phase : SharingPhase;
    var frozen0 : Nat;
    var frozen1 : Nat;
    var cursor : ?Nat;
    var totalProductNs : Nat;
    var paid0 : Nat;
    var paid1 : Nat;
    var sharedDayStart : Int;
    var sharedDayEnd : Int;
    var lockedPositionShares : Nat;
    var lockedScan : Nat;
  };

  type PositionLock = {
    positionId : Nat;
    poolId : Nat;
    owner : Principal;
    var weight : Nat;
    var lockedFrom : Int;
    var lockedUntil : ?Int;
  };

  type UnpaidShare = {
    owner : Principal;
    poolId : Nat;
    var productNs : Nat;
  };

  type FeePotStore = {
    var dayStart : Int;
    var nextSharingAt : Int;
    pots : Map.Map<Nat, PoolPot>;
    locks : Map.Map<Nat, PositionLock>;
    unpaid : Map.Map<Text, UnpaidShare>;
  };

  type ReadingStep = { #poolLookup; #metadata; #spotPrice; #quote; #reserve };
  type ReadingMethod = { #spot; #quote };

  type ReadingOutcome = {
    #ok : { counterPerTttiE8 : Nat; method : ReadingMethod };
    #failed : { step : ReadingStep; detail : ?Text };
  };

  type ReferenceReading = {
    counter : DexToken;
    poolCanister : ?Principal;
    readAt : Int;
    outcome : ReadingOutcome;
  };

  type OldDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    poolPositions : Map.Map<Nat, Set.Set<Nat>>;
    fees : FeePotStore;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    poolPositions : Map.Map<Nat, Set.Set<Nat>>;
    fees : FeePotStore;
    referenceReadings : Map.Map<Text, ReferenceReading>;
  };

  type OldActor = { dex : OldDexStore };
  type NewActor = { dex : NewDexStore };

  public func migration(old : OldActor) : NewActor {
    let d = old.dex;
    let dex : NewDexStore = {
      pools = d.pools;
      requests = d.requests;
      lastRefusalAt = d.lastRefusalAt;
      var nextPoolId = d.nextPoolId;
      var nextRequestId = d.nextRequestId;
      positions = d.positions;
      var nextPositionId = d.nextPositionId;
      removals = d.removals;
      icpswapSamples = d.icpswapSamples;
      poolPositions = d.poolPositions;
      fees = d.fees;
      referenceReadings = Map.empty();
    };
    { dex };
  };
};
