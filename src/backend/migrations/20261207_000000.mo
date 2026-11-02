import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

// PTM-9e: per-owner swap index, in-flight index, reserve and sweep batching
// state. Additive only; nothing existing is altered:
//  - `routerOwnerIndex` (new): owner -> swap ids in creation order (ascending
//    id), built from the current `router.swaps` in one pass. No swap is read
//    for anything but its id and owner, and none is changed.
//  - `inflight` (new): the index of unfinished transfers, deposits,
//    withdrawals and swaps, created empty and not yet backfilled. The one-time
//    backfill (InflightLib.backfill, from the current stores: state, not
//    ledger data) runs at the first start after this migration and sets
//    `backfilled`; the migration cannot call it itself because the deposit and
//    withdrawal stores are not part of this migration's input.
//  - `dexBatch` (new): idle reserve-check and sweep cursors, the default batch
//    size, no alert, no account marked as swept to zero.
//  - `router` is carried forward unchanged (the same value, by reference).
// sale.reserved, balances, blocks, the ledger and its stored fee are never
// touched.
module {
  type Account = { owner : Principal; subaccount : ?Blob };
  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
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
  type Route = {
    #native : { poolId : Nat };
    #icpswap : { poolCanisterId : Principal };
  };
  type RouteFees = {
    #native : { feeBps : Nat; fee : Nat };
    #icpswap : {
      icpswapFeeBps : Nat;
      icpswapFee : Nat;
      protocolFeeBps : Nat;
      protocolFee : Nat;
      protocolLpShare : Nat;
      protocolPermanentShare : Nat;
    };
  };
  type RoutedSwapStage = { #recorded; #movingIn; #depositing; #swapping; #withdrawing; #done };
  type RoutedSwapStatus = {
    #inProgress;
    #completed;
    #failedReturned : Text;
    #needsReview;
    #reviewedArrived : Nat;
    #reviewedNotArrived;
  };
  type RoutedSwap = {
    id : Nat;
    owner : Principal;
    createdAt : Int;
    updatedAt : Int;
    route : Route;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    minAmountOut : Nat;
    deadline : Int;
    fees : RouteFees;
    nativePoolId : ?Nat;
    zeroForOne : Bool;
    stage : RoutedSwapStage;
    status : RoutedSwapStatus;
    move : ?DexTransferAttempt;
    lastError : ?Text;
  };
  type RouterFeeTotals = {
    poolId : Nat;
    collected0 : Nat;
    collected1 : Nat;
    lpPaid0 : Nat;
    lpPaid1 : Nat;
    lpSetAside0 : Nat;
    lpSetAside1 : Nat;
    permanent0 : Nat;
    permanent1 : Nat;
  };
  type RouterSetAside = { amount0 : Nat; amount1 : Nat };
  type RouterRedirect = {
    poolId : Nat;
    redirected0 : Nat;
    redirected1 : Nat;
    lastTargetPoolId : ?Nat;
    lastAt : ?Int;
  };
  type RouterStore = {
    swaps : Map.Map<Nat, RoutedSwap>;
    var nextSwapId : Nat;
    feeTotals : Map.Map<Nat, RouterFeeTotals>;
    setAside : Map.Map<Nat, RouterSetAside>;
    redirected : Map.Map<Nat, RouterRedirect>;
  };

  // --- New: in-flight index (types/inflight.mo) ------------------------------

  type InflightKind = { #deposit; #withdrawal; #sweep; #swap };
  type InflightEntry = {
    kind : InflightKind;
    n : Nat;
    tokens : [DexToken];
    owner : ?Principal;
    since : Int;
  };
  type InflightStore = {
    entries : Map.Map<Text, InflightEntry>;
    var depositMark : Nat;
    var withdrawalMark : Nat;
    var backfilled : Bool;
  };

  // --- New: batching state (types/dex-batch.mo) ------------------------------

  type ReserveRun = {
    var active : Bool;
    var runId : Nat;
    var startedAt : ?Int;
    var targetIndex : Nat;
    var accountIndex : Nat;
    var partialLedger : Nat;
    var owedSnapshot : ?Nat;
    var accountsToCompare : Nat;
    var accountsCompared : Nat;
    var excludedZero : Nat;
    var unreadable : Nat;
    var lastBatchAt : ?Int;
  };
  type ReserveAlert = {
    id : Nat;
    at : Int;
    runId : Nat;
    accountsToCompare : Nat;
    accountsCompared : Nat;
    message : Text;
  };
  type SweepTokenProgress = {
    token : DexToken;
    var accountsListed : Nat;
    var accountsRead : Nat;
    var withBalance : Nat;
    var skipped : Nat;
    var belowFee : Nat;
    var belowFeeTotal : Nat;
    var unreadable : Nat;
    var inFlight : Nat;
    var failedNow : Nat;
    var excludedZero : Nat;
    var done : Bool;
  };
  type SweepRun = {
    var active : Bool;
    var runId : Nat;
    var startedAt : ?Int;
    var tokenIndex : Nat;
    var accountIndex : Nat;
    var batches : Nat;
    var lastBatchAt : ?Int;
    progress : Map.Map<Text, SweepTokenProgress>;
  };
  type BatchStore = {
    var batchSize : Nat;
    reserve : ReserveRun;
    sweep : SweepRun;
    var alert : ?ReserveAlert;
    var nextAlertId : Nat;
    alertHistory : List.List<ReserveAlert>;
    zeroed : Map.Map<Text, Int>;
  };

  type OldActor = {
    router : RouterStore;
  };

  type NewActor = {
    router : RouterStore;
    routerOwnerIndex : Map.Map<Principal, List.List<Nat>>;
    inflight : InflightStore;
    dexBatch : BatchStore;
  };

  // Same value as DEFAULT_BATCH_SIZE in types/dex-batch.mo.
  let DEFAULT_BATCH_SIZE : Nat = 25;

  public func migration(old : OldActor) : NewActor {
    // Swap ids per owner, ascending (the registry is keyed by id).
    let ownerIndex : Map.Map<Principal, List.List<Nat>> = Map.empty();
    for ((id, s) in old.router.swaps.entries()) {
      let ids = switch (ownerIndex.get(s.owner)) {
        case (?list) list;
        case null {
          let list = List.empty<Nat>();
          ownerIndex.add(s.owner, list);
          list;
        };
      };
      ids.add(id);
    };
    {
      router = old.router;
      routerOwnerIndex = ownerIndex;
      inflight = {
        entries = Map.empty();
        var depositMark = 0;
        var withdrawalMark = 0;
        var backfilled = false;
      };
      dexBatch = {
        var batchSize = DEFAULT_BATCH_SIZE;
        reserve = {
          var active = false;
          var runId = 0;
          var startedAt : ?Int = null;
          var targetIndex = 0;
          var accountIndex = 0;
          var partialLedger = 0;
          var owedSnapshot : ?Nat = null;
          var accountsToCompare = 0;
          var accountsCompared = 0;
          var excludedZero = 0;
          var unreadable = 0;
          var lastBatchAt : ?Int = null;
        };
        sweep = {
          var active = false;
          var runId = 0;
          var startedAt : ?Int = null;
          var tokenIndex = 0;
          var accountIndex = 0;
          var batches = 0;
          var lastBatchAt : ?Int = null;
          progress = Map.empty();
        };
        var alert : ?ReserveAlert = null;
        var nextAlertId = 0;
        alertHistory = List.empty();
        zeroed = Map.empty();
      };
    };
  };
};
