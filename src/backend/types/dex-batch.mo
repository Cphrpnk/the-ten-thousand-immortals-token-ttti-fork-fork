import List "mo:core/List";
import Map "mo:core/Map";
import Dex "dex";

// PTM-9e: batching state of the reserve check and the custody sweep.
//
// Both runs read ledger balances in batches of `batchSize` accounts. A run
// keeps a persisted cursor and resumes from it on the next timer tick. The
// admin-visible alert is raised when a reserve check run finishes with zero
// accounts compared although there were accounts to compare.
module {
  public type Timestamp = Int;

  // Default number of ledger accounts read per batch (stored in
  // BatchStore.batchSize so it survives upgrades).
  public let DEFAULT_BATCH_SIZE : Nat = 25;

  // --- Reserve check cursor --------------------------------------------------

  // Position of the reserve check run. A compared account (kind and token) is
  // read over several ledger accounts; the obligations of the compared account
  // are snapshotted when its first ledger balance is read (`owedSnapshot`), and
  // the comparison uses that snapshot, so DEX activity during the reads does not
  // invalidate it.
  public type ReserveRun = {
    var active : Bool; // a run is in progress (cursor valid)
    var runId : Nat;
    var startedAt : ?Timestamp;
    var targetIndex : Nat; // position in the ordered list of compared accounts
    var accountIndex : Nat; // position in the ledger accounts of that target
    var partialLedger : Nat; // ledger balances summed so far for that target
    var owedSnapshot : ?Nat; // obligations at the moment of the first read
    var accountsToCompare : Nat; // compared accounts this run had to compare
    var accountsCompared : Nat; // compared accounts actually compared
    var excludedZero : Nat; // deposit accounts excluded (already swept to zero)
    var unreadable : Nat; // compared accounts left uncompared (read failed, in flight)
    var lastBatchAt : ?Timestamp;
    // PTM-9f: batches started in this run (the batch being read, or the last
    // one read between two ticks) and the estimated total of the run, ceil(ledger accounts to
    // read / batchSize), refreshed each time a target is opened. Reset by
    // beginRun. Both 0 while the run has not opened its first target.
    var batches : Nat;
    var totalBatches : Nat;
  };

  // Raised when a run ends with accountsCompared == 0 and accountsToCompare > 0.
  // Never a silent success: the reserve status exposes it until a later run
  // compares at least one account.
  public type ReserveAlert = {
    id : Nat;
    at : Timestamp;
    runId : Nat;
    accountsToCompare : Nat;
    accountsCompared : Nat; // 0
    message : Text;
  };

  // --- Sweep cursor ----------------------------------------------------------

  // Per-token progress of the running sweep.
  public type SweepTokenProgress = {
    token : Dex.DexToken;
    var accountsListed : Nat; // legacy accounts to read for this token
    var accountsRead : Nat; // read so far
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

  public type SweepRun = {
    var active : Bool;
    var runId : Nat;
    var startedAt : ?Timestamp;
    var tokenIndex : Nat; // position in DexLib.DEX_TOKENS
    var accountIndex : Nat; // position in the legacy accounts of that token
    var batches : Nat; // batches taken this run
    var lastBatchAt : ?Timestamp;
    // key = DexLib.tokenKey(token)
    progress : Map.Map<Text, SweepTokenProgress>;
  };

  // --- Excluded accounts: daily batched re-read (PTM-9f) ----------------------

  // Interval between two passes of the daily re-read of the excluded accounts
  // (24 h). Replaces the 30-day exclusion delay (ZERO_TTL_NS), which is removed.
  public let REREAD_INTERVAL_NS : Int = 86_400_000_000_000;

  // Persisted cursor of the re-read of the accounts swept to zero. A pass walks
  // BatchStore.zeroed in key order, `batchSize` accounts per batch, and resumes
  // from `lastKey` (the next batch starts strictly after it). An account whose
  // ledger balance is non-zero is removed from `zeroed` at once (re-included),
  // which makes the reserve check and the sweep read it again. An account that
  // is still zero stays excluded. A failed read leaves the account excluded and
  // counts it in `unreadable`; it is read again at the next pass.
  public type ExcludedReread = {
    var active : Bool; // a pass is in progress (cursor valid)
    var runId : Nat;
    var startedAt : ?Timestamp;
    var lastKey : ?Text; // last zeroed key read by this pass; null = from the start
    var read : Nat; // accounts read this pass
    var reincluded : Nat; // accounts re-included this pass (non-zero balance)
    var unreadable : Nat; // accounts whose read failed this pass
    var lastBatchAt : ?Timestamp;
    var lastFinishedAt : ?Timestamp; // end of the last complete pass; the next starts at +REREAD_INTERVAL_NS
  };

  // --- Stored state ----------------------------------------------------------

  // Stored batching state. Initial value: built by the migration
  // 20261207_000000 (idle runs, DEFAULT_BATCH_SIZE, no alert, nothing zeroed);
  // reserve.batches, reserve.totalBatches and reread are added by the migration
  // 20261208_000000.
  public type BatchStore = {
    var batchSize : Nat; // ledger accounts read per batch
    reserve : ReserveRun;
    sweep : SweepRun;
    var alert : ?ReserveAlert; // latest unresolved alert
    var nextAlertId : Nat;
    alertHistory : List.List<ReserveAlert>; // newest last, short
    // Legacy deposit / pool accounts already swept to zero, excluded from the
    // sweep and the reserve check. Key = "<tokenKey>/<owner text>" for a user
    // deposit account and "<tokenKey>/P<poolId>" for a pool account; value =
    // when it was marked. PTM-9f: the exclusion has no delay (no 30-day TTL):
    // an entry stays until it is removed, and it is removed (the account is
    // re-included) (1) when the DEX records a new deposit, pair request, swap or
    // withdrawal for that owner and token, or (2) when the daily re-read
    // (`reread`) finds a non-zero ledger balance.
    zeroed : Map.Map<Text, Timestamp>;
    reread : ExcludedReread;
  };

  // --- API boundary ----------------------------------------------------------

  // PTM-9f: #inProgress while the cursor has not finished (read as
  // "in progress (batch x of y)"), #finished after a complete
  // run, #idle before the first run.
  public type ReservePhase = { #idle; #inProgress; #finished };

  public type ReserveProgress = {
    // PTM-9f: phase, current batch number (batches started, at least 1, while
    // #inProgress, else the batches the last run took) and total number of batches of the
    // run. alertDecided is true only once the complete run has ended: the
    // zero-compared alert is never decided after a single batch.
    phase : ReservePhase;
    batch : Nat;
    totalBatches : Nat;
    alertDecided : Bool;
    active : Bool;
    runId : Nat;
    startedAt : ?Timestamp;
    targetIndex : Nat;
    targetCount : Nat;
    accountIndex : Nat;
    accountsToCompare : Nat;
    accountsCompared : Nat;
    excludedZero : Nat;
    unreadable : Nat;
    batchSize : Nat;
    lastBatchAt : ?Timestamp;
  };

  // PTM-9f: state of the daily re-read of the excluded accounts.
  public type ExcludedRereadProgress = {
    active : Bool;
    runId : Nat;
    startedAt : ?Timestamp;
    excludedCount : Nat; // accounts currently excluded (BatchStore.zeroed.size())
    read : Nat;
    reincluded : Nat;
    unreadable : Nat;
    batchSize : Nat;
    lastBatchAt : ?Timestamp;
    lastFinishedAt : ?Timestamp;
    nextRunAt : ?Timestamp; // lastFinishedAt + REREAD_INTERVAL_NS; null before the first pass
  };

  public type SweepTokenProgressView = {
    token : Dex.DexToken;
    accountsListed : Nat;
    accountsRead : Nat;
    withBalance : Nat;
    skipped : Nat;
    unreadable : Nat;
    inFlight : Nat;
    excludedZero : Nat;
    done : Bool;
  };

  public type SweepProgress = {
    active : Bool;
    runId : Nat;
    startedAt : ?Timestamp;
    tokenIndex : Nat;
    accountIndex : Nat;
    batches : Nat;
    batchSize : Nat;
    lastBatchAt : ?Timestamp;
    tokens : [SweepTokenProgressView];
  };
};
