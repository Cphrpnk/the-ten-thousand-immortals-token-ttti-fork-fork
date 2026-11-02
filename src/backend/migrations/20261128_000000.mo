import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// PTM-3: relay lock and LP fee sharing. Every Position gains the lock start
// (= createdAt), the cumulative relay shortening received (0) and the
// cumulative set-aside fees collected per token (0, 0); every Pool gains the
// counters of set-aside fees credited to locked positions (0, 0). Shares,
// owner, createdAt, lockDurationNs and unlockAt of existing positions are
// carried forward unchanged, as is every other pool, request, counter and
// removal. Never touches sale.reserved, any internal balance, any ledger
// balance or block.
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolKind = { #tttiPair; #utilityPair };
  type PoolStatus = { #filling; #active; #removed };
  type TokenLedger = { #internal; #external : CorePrincipal.Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type RequestedToken = {
    ledgerId : CorePrincipal.Principal;
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
    requester : CorePrincipal.Principal;
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
    poolCanister : CorePrincipal.Principal;
    counter : DexToken;
    counterPerTttiE8 : Nat;
    counterReserve : Nat;
    readAt : Int;
  };

  type OldPool = {
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
  };

  type NewPool = {
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

  type OldPosition = {
    id : Nat;
    poolId : Nat;
    owner : CorePrincipal.Principal;
    shares : Nat;
    createdAt : Int;
    lockDurationNs : Nat;
    unlockAt : Int;
    isCreator : Bool;
  };

  type NewPosition = {
    id : Nat;
    poolId : Nat;
    owner : CorePrincipal.Principal;
    shares : Nat;
    createdAt : Int;
    lockDurationNs : Nat;
    unlockAt : Int;
    isCreator : Bool;
    lockStartedAt : Int;
    relayReceivedNs : Nat;
    feesCollected0 : Nat;
    feesCollected1 : Nat;
  };

  type OldDexStore = {
    pools : Map.Map<Nat, OldPool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, OldPosition>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, NewPool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, NewPosition>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
  };

  type OldActor = {
    dex : OldDexStore;
  };

  type NewActor = {
    dex : NewDexStore;
  };

  public func migration(old : OldActor) : NewActor {
    let pools : Map.Map<Nat, NewPool> = Map.empty();
    for ((id, pool) in old.dex.pools.entries()) {
      pools.add(id, { pool with lockedFeesPaid0 = 0; lockedFeesPaid1 = 0 });
    };
    let positions : Map.Map<Nat, NewPosition> = Map.empty();
    for ((id, position) in old.dex.positions.entries()) {
      positions.add(
        id,
        {
          position with
          lockStartedAt = position.createdAt;
          relayReceivedNs = 0;
          feesCollected0 = 0;
          feesCollected1 = 0;
        },
      );
    };
    {
      dex = {
        pools;
        requests = old.dex.requests;
        lastRefusalAt = old.dex.lastRefusalAt;
        var nextPoolId = old.dex.nextPoolId;
        var nextRequestId = old.dex.nextRequestId;
        positions;
        var nextPositionId = old.dex.nextPositionId;
        removals = old.dex.removals;
        icpswapSamples = old.dex.icpswapSamples;
      };
    };
  };
};
