import List "mo:core/List";
import Map "mo:core/Map";

// PTM-9f: batch progress of the reserve check and the daily re-read of the
// excluded accounts. Additive only; nothing existing is altered:
//  - `dexBatch.reserve` gains `batches` and `totalBatches` (0: a run in progress
//    at the upgrade recomputes them at its next batch).
//  - `dexBatch.reread` (new): idle cursor of the daily re-read of the accounts
//    swept to zero, no pass finished yet.
//  - `dexBatch.zeroed` is carried forward unchanged (the same value, by
//    reference): every entry stays excluded, with no 30-day delay from now on.
//  - `dexBatch.sweep`, `alertHistory`, `alert`, `nextAlertId` and `batchSize`
//    are carried forward unchanged.
// sale.reserved, balances, blocks, the ledger and its stored fee are never
// touched.
module {
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type OldReserveRun = {
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
  type NewReserveRun = {
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
    var batches : Nat;
    var totalBatches : Nat;
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
  type ExcludedReread = {
    var active : Bool;
    var runId : Nat;
    var startedAt : ?Int;
    var lastKey : ?Text;
    var read : Nat;
    var reincluded : Nat;
    var unreadable : Nat;
    var lastBatchAt : ?Int;
    var lastFinishedAt : ?Int;
  };
  type OldBatchStore = {
    var batchSize : Nat;
    reserve : OldReserveRun;
    sweep : SweepRun;
    var alert : ?ReserveAlert;
    var nextAlertId : Nat;
    alertHistory : List.List<ReserveAlert>;
    zeroed : Map.Map<Text, Int>;
  };
  type NewBatchStore = {
    var batchSize : Nat;
    reserve : NewReserveRun;
    sweep : SweepRun;
    var alert : ?ReserveAlert;
    var nextAlertId : Nat;
    alertHistory : List.List<ReserveAlert>;
    zeroed : Map.Map<Text, Int>;
    reread : ExcludedReread;
  };

  type OldActor = { dexBatch : OldBatchStore };
  type NewActor = { dexBatch : NewBatchStore };

  public func migration(old : OldActor) : NewActor {
    let r = old.dexBatch.reserve;
    {
      dexBatch = {
        var batchSize = old.dexBatch.batchSize;
        reserve = {
          var active = r.active;
          var runId = r.runId;
          var startedAt = r.startedAt;
          var targetIndex = r.targetIndex;
          var accountIndex = r.accountIndex;
          var partialLedger = r.partialLedger;
          var owedSnapshot = r.owedSnapshot;
          var accountsToCompare = r.accountsToCompare;
          var accountsCompared = r.accountsCompared;
          var excludedZero = r.excludedZero;
          var unreadable = r.unreadable;
          var lastBatchAt = r.lastBatchAt;
          var batches = 0;
          var totalBatches = 0;
        };
        sweep = old.dexBatch.sweep;
        var alert = old.dexBatch.alert;
        var nextAlertId = old.dexBatch.nextAlertId;
        alertHistory = old.dexBatch.alertHistory;
        zeroed = old.dexBatch.zeroed;
        reread = {
          var active = false;
          var runId = 0;
          var startedAt : ?Int = null;
          var lastKey : ?Text = null;
          var read = 0;
          var reincluded = 0;
          var unreadable = 0;
          var lastBatchAt : ?Int = null;
          var lastFinishedAt : ?Int = null;
        };
      };
    };
  };
};
