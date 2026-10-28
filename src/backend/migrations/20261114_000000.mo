import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DEX lot 2: adds refundStatus to every pair request (refundBlock kept
// unchanged; a request already refunded in lot 1 becomes #refunded with that
// block), and the new empty DEX balance and DD / DW / DQ transfer stores.
// Touches only `dex`, `dexBalances` and `dexTransfers` (never sale.reserved,
// ledger balances, blocks or other state).
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolStatus = { #awaitingFirstLiquidity; #active; #removed };
  type PoolKind = { #tttiPair; #utilityPair };
  type TokenLedger = { #internal; #external : CorePrincipal.Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };

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

  type OldPairRequest = {
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
  };

  type PairRefundStatus = {
    #none;
    #inProgress;
    #needsReview;
    #refunded : Nat;
  };

  type NewPairRequest = {
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

  type OldDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, OldPairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, NewPairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
  };

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type DexBalance = { var available : Nat; var reserved : Nat };
  type Account = { owner : CorePrincipal.Principal; subaccount : ?Blob };

  type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  type DexTransferRequest = {
    token : DexToken;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type DexTransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : DexTransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  type DexTransfer = {
    n : Nat;
    owner : CorePrincipal.Principal;
    token : DexToken;
    amount : Nat;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type DexTransferStore = {
    deposits : Map.Map<Nat, DexTransfer>;
    withdrawals : Map.Map<Nat, DexTransfer>;
    pairRefunds : Map.Map<Nat, DexTransferAttempt>;
  };

  type OldActor = {
    dex : OldDexStore;
  };

  type NewActor = {
    dex : NewDexStore;
    dexBalances : Map.Map<CorePrincipal.Principal, Map.Map<Text, DexBalance>>;
    dexTransfers : DexTransferStore;
  };

  public func migration(old : OldActor) : NewActor {
    let requests = old.dex.requests.map<Nat, OldPairRequest, NewPairRequest>(
      func(_, r) = {
        r with
        refundStatus = switch (r.refundBlock) {
          case (?block) #refunded(block);
          case null #none;
        };
      }
    );
    {
      dex = {
        pools = old.dex.pools;
        requests;
        lastRefusalAt = old.dex.lastRefusalAt;
        var nextPoolId = old.dex.nextPoolId;
        var nextRequestId = old.dex.nextRequestId;
      };
      dexBalances = Map.empty();
      dexTransfers = {
        deposits = Map.empty();
        withdrawals = Map.empty();
        pairRefunds = Map.empty();
      };
    };
  };
};
