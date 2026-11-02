import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import DexLib "../src/backend/lib/dex";
import DexReserveLib "../src/backend/lib/dex-reserve";
import DexSweepLib "../src/backend/lib/dex-sweep";
import InflightLib "../src/backend/lib/inflight";
import BatchTypes "../src/backend/types/dex-batch";
import ReserveTypes "../src/backend/types/dex-reserve";
import InflightTypes "../src/backend/types/inflight";
import RetryTypes "../src/backend/types/retry";

// PTM-9e: batched reserve check, alert, zero exclusion, sweep lock and in-flight
// index. Pure tests that run in the interpreter (no ledger, no await): the
// reserve check core (openTarget, recordBalance, compareTarget, finishRun) is
// driven by hand the way the async driver drives it.
//   1. DEX activity during the read: every account is compared with its own
//      snapshot (taken when its balance is read);
//   2. a possible shortfall needs a second read; a confirmed one pauses;
//   3. a run that ends with zero accounts compared raises the alert; a run
//      with nothing to compare raises none; a later good run clears it;
//   4. accounts swept to zero are excluded, with no expiry (PTM-9f);
//   5. the batch cursor resumes at the next tick and the run finishes;
//   6. the sweep lock is released between batches and expires after a trap;
//   7. in-flight index scans touch only unfinished entries.

func newBatch() : BatchTypes.BatchStore {
  {
    var batchSize = 25;
    reserve = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var targetIndex = 0;
      var accountIndex = 0;
      var partialLedger = 0;
      var owedSnapshot = null;
      var accountsToCompare = 0;
      var accountsCompared = 0;
      var excludedZero = 0;
      var unreadable = 0;
      var lastBatchAt = null;
      var batches = 0;
      var totalBatches = 0;
    };
    sweep = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var tokenIndex = 0;
      var accountIndex = 0;
      var batches = 0;
      var lastBatchAt = null;
      progress = Map.empty();
    };
    var alert = null;
    var nextAlertId = 0;
    alertHistory = List.empty();
    zeroed = Map.empty();
    reread = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var lastKey = null;
      var read = 0;
      var reincluded = 0;
      var unreadable = 0;
      var lastBatchAt = null;
      var lastFinishedAt = null;
    };
  };
};

func newStore() : ReserveTypes.DexReserveStore {
  {
    var lastCheck = null;
    history = List.empty();
    pause = { var paused = false; var reason = null; var resumed = null };
    var accounts = [];
    accountHistory = List.empty();
    var pauseAccount = null;
  };
};

func owner(i : Nat) : Principal {
  Principal.fromBlob(Blob.fromArray([1, Nat8.fromNat(i)]));
};

let icpHoldings : DexReserveLib.Target = { kind = #dexHoldings; token = #icp };

// Reads `count` ledger balances of `each` and returns the sum.
func readAll(batch : BatchTypes.BatchStore, count : Nat, each : Nat) {
  var i = 0;
  while (i < count) {
    DexReserveLib.recordBalance(batch, each);
    i += 1;
  };
};

// --- 1. Activity during the read: each account is compared with its own snapshot ---

do {
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  let all = DexReserveLib.targets();
  assert all.size() > 0;
  var i = 0;
  while (i < all.size()) {
    let target = all[i];
    // Obligations at the moment of the read: 1000 + i. While the balances are
    // read the DEX moves (the live obligations would now be 5000), but the
    // snapshot stays: the comparison still happens, against 1000 + i.
    let owedAtRead = 1000 + i;
    assert DexReserveLib.openTarget(batch, 4, 0, false, owedAtRead) == #reading;
    assert batch.reserve.owedSnapshot == ?owedAtRead;
    readAll(batch, 3, 250);
    DexReserveLib.recordBalance(batch, owedAtRead - 750);
    switch (DexReserveLib.compareTarget(batch, store, target, 11, null)) {
      case (#compared(r)) {
        assert r.owed == owedAtRead;
        assert r.ledgerBalance == owedAtRead;
        assert r.status == #ok;
      };
      case (#needsConfirm) { assert false };
    };
    i += 1;
  };
  assert batch.reserve.accountsToCompare == all.size();
  assert batch.reserve.accountsCompared == all.size();
  assert store.accounts.size() == all.size();
  DexReserveLib.finishRun(batch, store, 12);
  assert not batch.reserve.active;
  assert batch.alert == null;
  assert batch.alertHistory.size() == 0;
  assert not store.pause.paused;
};

// --- 2. Shortfall: second read, then pause; activity that settles is no mismatch ---

do {
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  // First read below the snapshot: a second read is needed, nothing recorded yet.
  assert DexReserveLib.openTarget(batch, 2, 0, false, 1000) == #reading;
  readAll(batch, 2, 450);
  assert DexReserveLib.compareTarget(batch, store, icpHoldings, 11, null) == #needsConfirm;
  assert batch.reserve.accountsCompared == 0;
  assert batch.reserve.targetIndex == 0;
  assert store.accounts.size() == 0;
  // Second read with a fresh snapshot: the activity (a deposit) settled, equal.
  switch (DexReserveLib.compareTarget(batch, store, icpHoldings, 12, ?{ owed = 1200; ledger = 1200 })) {
    case (#compared(r)) { assert r.status == #ok };
    case (#needsConfirm) { assert false };
  };
  assert not store.pause.paused;
  assert batch.reserve.accountsCompared == 1;
  assert batch.reserve.targetIndex == 1;

  // A shortfall that stays after the second read pauses the DEX.
  let t2 : DexReserveLib.Target = { kind = #dexHoldings; token = #ckbtc };
  assert DexReserveLib.openTarget(batch, 1, 0, false, 500) == #reading;
  readAll(batch, 1, 400);
  assert DexReserveLib.compareTarget(batch, store, t2, 13, null) == #needsConfirm;
  switch (DexReserveLib.compareTarget(batch, store, t2, 14, ?{ owed = 500; ledger = 400 })) {
    case (#compared(r)) {
      assert r.status == #shortfall;
      assert r.difference == -100;
    };
    case (#needsConfirm) { assert false };
  };
  assert store.pause.paused;
  assert store.accountHistory.size() == 1;
  assert DexReserveLib.shortfallCount(store) == 1;
};

// --- 3. Alert: zero compared while accounts existed; none when nothing to compare ---

do {
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 100);
  let all = DexReserveLib.targets();
  // Every account is in flight during the run: none can be compared.
  var i = 0;
  while (i < all.size()) {
    assert DexReserveLib.openTarget(batch, 3, 0, true, 777) == #skipped;
    i += 1;
  };
  assert batch.reserve.accountsToCompare == all.size();
  assert batch.reserve.accountsCompared == 0;
  assert batch.reserve.unreadable == all.size();
  DexReserveLib.finishRun(batch, store, 101);
  assert not batch.reserve.active;
  switch (batch.alert) {
    case (?a) {
      assert a.id == 0;
      assert a.runId == batch.reserve.runId;
      assert a.accountsToCompare == all.size();
      assert a.accountsCompared == 0;
      assert a.at == 101;
    };
    case null { assert false };
  };
  assert batch.alertHistory.size() == 1;
  // Finishing twice raises nothing more.
  DexReserveLib.finishRun(batch, store, 102);
  assert batch.alertHistory.size() == 1;

  // A second silent run raises a second alert; the history keeps both.
  DexReserveLib.beginRun(batch, 200);
  i := 0;
  while (i < all.size()) {
    ignore DexReserveLib.openTarget(batch, 1, 0, true, 5);
    i += 1;
  };
  DexReserveLib.finishRun(batch, store, 201);
  assert batch.alertHistory.size() == 2;
  switch (batch.alert) {
    case (?a) { assert a.id == 1 };
    case null { assert false };
  };

  // A run that compares at least one account clears the visible alert.
  DexReserveLib.beginRun(batch, 300);
  assert DexReserveLib.openTarget(batch, 1, 0, false, 40) == #reading;
  readAll(batch, 1, 40);
  switch (DexReserveLib.compareTarget(batch, store, all[0], 301, null)) {
    case (#compared(_)) {};
    case (#needsConfirm) { assert false };
  };
  DexReserveLib.finishRun(batch, store, 302);
  assert batch.alert == null;
  assert batch.alertHistory.size() == 2;
};

do {
  // Nothing to compare (every account excluded): no alert.
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  let all = DexReserveLib.targets();
  for (_ in all.values()) {
    assert DexReserveLib.openTarget(batch, 0, 2, false, 0) == #skipped;
  };
  assert batch.reserve.accountsToCompare == 0;
  assert batch.reserve.excludedZero == 2 * all.size();
  DexReserveLib.finishRun(batch, store, 11);
  assert batch.alert == null;
  assert batch.alertHistory.size() == 0;
};

// --- 4. Accounts swept to zero are excluded ----------------------------------------------

do {
  let batch = newBatch();
  let p = owner(7);
  assert not DexSweepLib.isZeroed(batch, #icp, #userDeposit(p));
  DexSweepLib.markZeroed(batch, #icp, #userDeposit(p));
  DexSweepLib.markZeroed(batch, #ckbtc, #pool(3));
  assert DexSweepLib.isZeroed(batch, #icp, #userDeposit(p));
  assert not DexSweepLib.isZeroed(batch, #ckbtc, #userDeposit(p));
  assert DexSweepLib.isZeroed(batch, #ckbtc, #pool(3));
  // The key the reserve check reads is "<tokenKey>/<owner text>" and
  // "<tokenKey>/P<pool id>".
  assert batch.zeroed.get(DexLib.tokenKey(#icp) # "/" # p.toText()) != null;
  assert batch.zeroed.get(DexLib.tokenKey(#ckbtc) # "/P3") != null;
  // PTM-9f: no expiry. A mark written long ago (timestamp 0) still excludes.
  batch.zeroed.add(DexLib.tokenKey(#ckusdc) # "/" # p.toText(), 0);
  assert DexSweepLib.isZeroed(batch, #ckusdc, #userDeposit(p));
  batch.zeroed.remove(DexLib.tokenKey(#ckusdc) # "/" # p.toText());
  // The mark is removed explicitly (new activity of the account).
  DexSweepLib.clearZeroed(batch, #icp, #userDeposit(p));
  assert not DexSweepLib.isZeroed(batch, #icp, #userDeposit(p));

  // The exclusion shows in the run summary and does not count as a comparison.
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  assert DexReserveLib.openTarget(batch, 2, 5, false, 90) == #reading;
  assert batch.reserve.excludedZero == 5;
  assert batch.reserve.accountsToCompare == 1;
  assert batch.reserve.accountsCompared == 0;
  readAll(batch, 2, 45);
  ignore DexReserveLib.compareTarget(batch, store, icpHoldings, 11, null);
  assert batch.reserve.accountsCompared == 1;
};

// --- 5. The batch cursor resumes at the next tick and finishes ------------------------------

do {
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  let all = DexReserveLib.targets();
  // The first compared account has 60 ledger accounts: batches of 25, 25, 10.
  assert DexReserveLib.openTarget(batch, 60, 0, false, 600) == #reading;
  readAll(batch, 25, 10); // tick 1
  assert batch.reserve.accountIndex == 25;
  assert batch.reserve.targetIndex == 0;
  assert batch.reserve.owedSnapshot == ?600; // not taken again
  assert batch.reserve.active;
  readAll(batch, 25, 10); // tick 2 (next timer tick resumes the cursor)
  assert batch.reserve.accountIndex == 50;
  assert batch.reserve.owedSnapshot == ?600;
  readAll(batch, 10, 10); // tick 3
  assert batch.reserve.accountIndex == 60;
  switch (DexReserveLib.compareTarget(batch, store, all[0], 20, null)) {
    case (#compared(r)) {
      assert r.owed == 600;
      assert r.ledgerBalance == 600;
    };
    case (#needsConfirm) { assert false };
  };
  assert batch.reserve.targetIndex == 1;
  assert batch.reserve.accountIndex == 0;
  assert batch.reserve.owedSnapshot == null;
  // The other accounts follow, one batch each; the run finishes.
  var i = 1;
  while (i < all.size()) {
    assert batch.reserve.active;
    ignore DexReserveLib.openTarget(batch, 1, 0, false, 5);
    readAll(batch, 1, 5);
    ignore DexReserveLib.compareTarget(batch, store, all[i], 21, null);
    i += 1;
  };
  assert batch.reserve.targetIndex == all.size();
  DexReserveLib.finishRun(batch, store, 22);
  assert not batch.reserve.active;
  assert batch.reserve.accountsCompared == all.size();
  assert batch.alert == null;
  // The summary stays readable after the run.
  let view = DexReserveLib.progressView(batch);
  assert view.accountsToCompare == all.size();
  assert view.accountsCompared == all.size();
  assert not view.active;
  assert view.batchSize == 25;
};

// --- 6. The sweep lock is released between batches and cannot stay held ---------------------

do {
  let locks = Set.empty<Text>();
  var batches = 0;
  while (batches < 10) {
    assert DexSweepLib.takeRunLock(locks);
    // A second run cannot start while the batch holds the lock.
    assert not DexSweepLib.takeRunLock(locks);
    DexSweepLib.releaseRunLock(locks);
    // Between two batches nothing is held.
    assert locks.size() == 0;
    batches += 1;
  };
  // A lock left by a batch that trapped (taken long ago) is taken over.
  locks.add("SWEEP");
  locks.add("SWEEP@-2000000000000");
  assert DexSweepLib.takeRunLock(locks);
  DexSweepLib.releaseRunLock(locks);
  assert locks.size() == 0;
  // A transfer lock of another key is left alone by the release.
  locks.add("SW:4");
  assert DexSweepLib.takeRunLock(locks);
  DexSweepLib.releaseRunLock(locks);
  assert locks.contains("SW:4");
  assert not locks.contains("SWEEP");
};

// --- 7. In-flight index scans touch only unfinished entries --------------------------------

do {
  let account = { owner = owner(1); subaccount = null };
  func attemptOf(n : Nat) : RetryTypes.DexTransferAttempt {
    {
      n;
      attempt = 1;
      memo = Blob.fromArray([1]);
      created_at_time = 1;
      request = { token = #icp; from = account; to = account; amount = 10; fee = null };
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
  };
  func transferOf(n : Nat, token : RetryTypes.DexToken, status : { #inProgress; #needsReview; #completed : Nat; #failed : Text }) : RetryTypes.DexTransfer {
    { n; owner = owner(n % 5); token; amount = 10; attempt = attemptOf(n); status };
  };
  let transfers : RetryTypes.DexTransferStore = {
    deposits = Map.empty();
    withdrawals = Map.empty();
    pairRefunds = Map.empty();
    liquidations = Map.empty();
  };
  // 10 000 finished deposits ...
  var n = 0;
  while (n < 10_000) {
    transfers.deposits.add(n, transferOf(n, #icp, #completed(n)));
    n += 1;
  };
  // ... three unfinished ICP deposits and one withdrawal to review (ckBTC).
  transfers.deposits.add(10_000, transferOf(10_000, #icp, #inProgress));
  transfers.deposits.add(10_001, transferOf(10_001, #icp, #needsReview));
  transfers.deposits.add(10_002, transferOf(10_002, #icp, #inProgress));
  transfers.withdrawals.add(5, transferOf(5, #ckbtc, #needsReview));

  let index = InflightLib.emptyStore();
  InflightLib.syncTransfers(index, transfers);
  // Only the four unfinished operations are in the index.
  assert InflightLib.count(index) == 4;
  assert InflightLib.countOfKind(index, #deposit) == 3;
  assert InflightLib.countOfKind(index, #withdrawal) == 1;

  var visitedIcp = 0;
  InflightLib.forEachOfToken(index, #icp, func(e : InflightTypes.Entry) { visitedIcp += 1; assert e.kind == #deposit });
  assert visitedIcp == 3;
  var visitedBtc = 0;
  InflightLib.forEachOfToken(index, #ckbtc, func(_ : InflightTypes.Entry) { visitedBtc += 1 });
  assert visitedBtc == 1;
  assert InflightLib.anyOfToken(index, #icp);
  assert not InflightLib.anyOfToken(index, #ckusdc);

  // A deposit finishes and a new finished one arrives: the next sync drops the
  // first and never adds the second.
  transfers.deposits.add(10_000, transferOf(10_000, #icp, #completed(1)));
  transfers.deposits.add(10_003, transferOf(10_003, #icp, #completed(2)));
  InflightLib.syncTransfers(index, transfers);
  assert InflightLib.count(index) == 3;
  assert not InflightLib.contains(index, #deposit, 10_000);
  assert not InflightLib.contains(index, #deposit, 10_003);
  assert InflightLib.contains(index, #deposit, 10_001);
  var visited = 0;
  InflightLib.forEachOfKind(index, #deposit, func(_ : InflightTypes.Entry) { visited += 1 });
  assert visited == 2;

  // The last unfinished ICP deposits finish: the token is idle again.
  transfers.deposits.add(10_001, transferOf(10_001, #icp, #failed("x")));
  transfers.deposits.add(10_002, transferOf(10_002, #icp, #completed(3)));
  InflightLib.syncTransfers(index, transfers);
  assert not InflightLib.anyOfToken(index, #icp);
  assert InflightLib.anyOfToken(index, #ckbtc);
  assert InflightLib.count(index) == 1;
};
