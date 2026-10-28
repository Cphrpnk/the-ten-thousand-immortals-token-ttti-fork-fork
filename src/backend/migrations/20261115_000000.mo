import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DEX lot 3: pool status #awaitingFirstLiquidity becomes #filling (#active and
// #removed unchanged); every pool gains zero reserves, zero shares, zero
// contract-owned locked shares and zero protocol fee accumulators; the DEX
// store gains an empty LP position map and its id counter. Touches only `dex`
// (never sale.reserved, ledger balances, blocks, DEX balances or transfers).
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolKind = { #tttiPair; #utilityPair };
  type TokenLedger = { #internal; #external : CorePrincipal.Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };

  type OldPoolStatus = { #awaitingFirstLiquidity; #active; #removed };
  type NewPoolStatus = { #filling; #active; #removed };

  type OldPool = {
    id : Nat;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : OldPoolStatus;
    createdAt : Int;
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    newPairBadgeUntil : ?Int;
    requestId : ?Nat;
    removedAt : ?Int;
  };

  type NewPool = {
    id : Nat;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : NewPoolStatus;
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

  type Position = {
    id : Nat;
    poolId : Nat;
    owner : CorePrincipal.Principal;
    shares : Nat;
    createdAt : Int;
    lockDurationNs : Nat;
    unlockAt : Int;
    isCreator : Bool;
  };

  type OldDexStore = {
    pools : Map.Map<Nat, OldPool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, NewPool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
  };

  type OldActor = {
    dex : OldDexStore;
  };

  type NewActor = {
    dex : NewDexStore;
  };

  public func migration(old : OldActor) : NewActor {
    let pools = old.dex.pools.map<Nat, OldPool, NewPool>(
      func(_, p) = {
        p with
        status = switch (p.status) {
          case (#awaitingFirstLiquidity) #filling;
          case (#active) #active;
          case (#removed) #removed;
        };
        reserve0 = 0;
        reserve1 = 0;
        totalShares = 0;
        lockedShares = 0;
        protocolFee0 = 0;
        protocolFee1 = 0;
      }
    );
    {
      dex = {
        pools;
        requests = old.dex.requests;
        lastRefusalAt = old.dex.lastRefusalAt;
        var nextPoolId = old.dex.nextPoolId;
        var nextRequestId = old.dex.nextRequestId;
        positions = Map.empty();
        var nextPositionId = 1;
      };
    };
  };
};
