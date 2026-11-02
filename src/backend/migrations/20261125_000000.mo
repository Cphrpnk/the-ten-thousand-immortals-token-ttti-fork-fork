import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DEX-2: announced pair removals, first-deposit reference samples and LQ
// liquidation payouts. Adds to `dex` an empty `removals` map (no removal is
// announced) and an empty `icpswapSamples` map (no reading yet), and to
// `dexTransfers` an empty `liquidations` map (no LQ payout). Every pool,
// request, position, refusal date, counter, deposit, withdrawal and pair
// refund is carried forward unchanged: pool status, reserves, shares, position
// shares and unlockAt included. Never touches sale.reserved, any internal
// balance, any ledger balance or block.
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolKind = { #tttiPair; #utilityPair };
  type PoolStatus = { #filling; #active; #removed };
  type TokenLedger = { #internal; #external : CorePrincipal.Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type Account = { owner : CorePrincipal.Principal; subaccount : ?Blob };

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

  type OldDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
  };

  // --- dexTransfers ------------------------------------------------------------

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

  type LiquidationPayout = {
    n : Nat;
    poolId : Nat;
    positionId : Nat;
    owner : CorePrincipal.Principal;
    token : DexToken;
    amount : Nat;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type OldDexTransferStore = {
    deposits : Map.Map<Nat, DexTransfer>;
    withdrawals : Map.Map<Nat, DexTransfer>;
    pairRefunds : Map.Map<Nat, DexTransferAttempt>;
  };

  type NewDexTransferStore = {
    deposits : Map.Map<Nat, DexTransfer>;
    withdrawals : Map.Map<Nat, DexTransfer>;
    pairRefunds : Map.Map<Nat, DexTransferAttempt>;
    liquidations : Map.Map<Nat, LiquidationPayout>;
  };

  type OldActor = {
    dex : OldDexStore;
    dexTransfers : OldDexTransferStore;
  };

  type NewActor = {
    dex : NewDexStore;
    dexTransfers : NewDexTransferStore;
  };

  public func migration(old : OldActor) : NewActor {
    {
      dex = {
        pools = old.dex.pools;
        requests = old.dex.requests;
        lastRefusalAt = old.dex.lastRefusalAt;
        var nextPoolId = old.dex.nextPoolId;
        var nextRequestId = old.dex.nextRequestId;
        positions = old.dex.positions;
        var nextPositionId = old.dex.nextPositionId;
        removals = Map.empty();
        icpswapSamples = Map.empty();
      };
      dexTransfers = {
        deposits = old.dexTransfers.deposits;
        withdrawals = old.dexTransfers.withdrawals;
        pairRefunds = old.dexTransfers.pairRefunds;
        liquidations = Map.empty();
      };
    };
  };
};
