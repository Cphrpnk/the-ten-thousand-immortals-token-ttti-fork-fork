import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import DexLib "../src/backend/lib/dex";
import DexReserveLib "../src/backend/lib/dex-reserve";
import DexSweepLib "../src/backend/lib/dex-sweep";
import RetryLib "../src/backend/lib/retry";
import BatchTypes "../src/backend/types/dex-batch";
import DexTypes "../src/backend/types/dex";
import PageTypes "../src/backend/types/page";
import ReserveTypes "../src/backend/types/dex-reserve";
import RetryTypes "../src/backend/types/retry";

// PTM-9f: pure tests that run in the interpreter (no ledger, no await).
//   1. a multi-batch reserve check is "in progress (batch x of y)" after its
//      first batch and no zero-compared alert exists until the run has ended;
//   2. an account swept to zero (no expiry) that then receives new activity is
//      read again: its zero mark is removed;
//   3. the DEX history of a user is read by pages: no duplicate, no omission up
//      to the last page, page size capped.

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

func readAll(batch : BatchTypes.BatchStore, count : Nat, each : Nat) {
  var i = 0;
  while (i < count) {
    DexReserveLib.recordBalance(batch, each);
    i += 1;
  };
};

// --- 1. In progress (batch x of y) after the first batch; alert only at the end ---

do {
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  let all = DexReserveLib.targets();
  // Batch 1: the first compared account has 60 ledger accounts (batches of 25),
  // 25 of them are read.
  DexReserveLib.startBatch(batch, 11);
  assert DexReserveLib.openTarget(batch, 60, 0, false, 600) == #reading;
  readAll(batch, 25, 10);
  let view = DexReserveLib.progressView(batch);
  assert view.phase == #inProgress;
  assert view.active;
  assert view.batch == 1;
  assert view.totalBatches >= 3; // 60 accounts + one read per later target
  assert view.totalBatches >= view.batch;
  assert not view.alertDecided;
  // No zero-compared alert exists although nothing has been compared yet.
  assert view.accountsToCompare == 1;
  assert view.accountsCompared == 0;
  assert batch.alert == null;
  assert batch.alertHistory.size() == 0;

  // Batches 2 and 3 finish the first account.
  DexReserveLib.startBatch(batch, 12);
  readAll(batch, 25, 10);
  let second = DexReserveLib.progressView(batch);
  assert second.phase == #inProgress;
  assert second.batch == 2;
  assert batch.alert == null;
  DexReserveLib.startBatch(batch, 13);
  readAll(batch, 10, 10);
  switch (DexReserveLib.compareTarget(batch, store, all[0], 14, null)) {
    case (#compared(r)) { assert r.status == #ok };
    case (#needsConfirm) { assert false };
  };
  // The other accounts are in flight: skipped, still no alert.
  var i = 1;
  while (i < all.size()) {
    assert DexReserveLib.openTarget(batch, 1, 0, true, 5) == #skipped;
    i += 1;
  };
  assert batch.alert == null;
  assert not DexReserveLib.progressView(batch).alertDecided;

  // The run ends: the decision is taken now, and one account was compared.
  DexReserveLib.finishRun(batch, store, 15);
  let done = DexReserveLib.progressView(batch);
  assert done.phase == #finished;
  assert done.alertDecided;
  assert done.batch == 3;
  assert done.totalBatches == 3;
  assert batch.alert == null;
};

do {
  // A run that compares nothing: the alert exists only once the run has ended.
  let batch = newBatch();
  let store = newStore();
  DexReserveLib.beginRun(batch, 10);
  let all = DexReserveLib.targets();
  DexReserveLib.startBatch(batch, 11);
  assert DexReserveLib.openTarget(batch, 1, 0, true, 5) == #skipped;
  assert batch.alert == null;
  assert DexReserveLib.progressView(batch).phase == #inProgress;
  var i = 1;
  while (i < all.size()) {
    ignore DexReserveLib.openTarget(batch, 1, 0, true, 5);
    i += 1;
  };
  assert batch.alert == null; // still undecided: finishRun was not called
  DexReserveLib.finishRun(batch, store, 12);
  assert batch.alert != null;
  assert DexReserveLib.progressView(batch).alertDecided;
};

// --- 2. An account swept to zero that receives activity is read again -------------

do {
  let batch = newBatch();
  let p = owner(7);
  let q = owner(8);
  DexSweepLib.markZeroed(batch, #icp, #userDeposit(p));
  DexSweepLib.markZeroed(batch, #ckbtc, #userDeposit(p));
  DexSweepLib.markZeroed(batch, #icp, #userDeposit(q));
  // Long after the mark (the 30-day expiry is gone): still excluded.
  batch.zeroed.add(DexLib.tokenKey(#icp) # "/" # p.toText(), 0);
  assert DexSweepLib.isZeroed(batch, #icp, #userDeposit(p));
  // A deposit of p in ICP re-includes that account only.
  RetryLib.reincludeOnActivity(batch, p, [#icp]);
  assert not DexSweepLib.isZeroed(batch, #icp, #userDeposit(p));
  assert DexSweepLib.isZeroed(batch, #ckbtc, #userDeposit(p));
  assert DexSweepLib.isZeroed(batch, #icp, #userDeposit(q));
  assert batch.zeroed.size() == 2;
  // A swap on a pair re-includes both of its tokens; re-including an account
  // that is not excluded changes nothing.
  RetryLib.reincludeOnActivity(batch, p, [#ckbtc, #icp, #tttiT]);
  assert not DexSweepLib.isZeroed(batch, #ckbtc, #userDeposit(p));
  assert batch.zeroed.size() == 1;
  // The next reserve check lists the account again: nothing excluded for it.
  assert DexReserveLib.openTarget(batch, 3, 0, false, 30) == #reading;
  assert batch.reserve.excludedZero == 0;
  // The daily re-read is due before the first pass and 24 h after a pass.
  assert DexSweepLib.rereadDue(batch, 100);
  batch.reread.lastFinishedAt := ?1_000;
  assert not DexSweepLib.rereadDue(batch, 1_000 + BatchTypes.REREAD_INTERVAL_NS - 1);
  assert DexSweepLib.rereadDue(batch, 1_000 + BatchTypes.REREAD_INTERVAL_NS);
  DexSweepLib.beginReread(batch, 5);
  assert batch.reread.active;
  assert not DexSweepLib.rereadDue(batch, 1_000 + 2 * BatchTypes.REREAD_INTERVAL_NS);
  let view = DexReserveLib.rereadView(batch);
  assert view.active;
  assert view.excludedCount == 1;
};

// --- 3. DEX history read by pages ---------------------------------------------------

do {
  let canister = owner(200);
  let a = owner(1);
  let b = owner(2);
  func accountOf(p : Principal) : DexTypes.DexAccount = { owner = p; subaccount = null };
  func transferOf(n : Nat, who : Principal, to : DexTypes.DexAccount) : RetryTypes.DexTransfer {
    let request : RetryTypes.DexTransferRequest = { token = #icp; from = accountOf(who); to; amount = 10; fee = ?1 };
    let attempt : RetryTypes.DexTransferAttempt = {
      n;
      attempt = 1;
      memo = Blob.fromArray([1]);
      created_at_time = 1;
      request;
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
    { n; owner = who; token = #icp; amount = 10; attempt; status = #completed(n) };
  };
  func viewOf(t : RetryTypes.DexTransfer, direction : DexTypes.DexTransferDirection) : DexTypes.DexTransferView {
    let r = t.attempt.request;
    {
      n = t.n;
      direction;
      owner = t.owner;
      token = t.token;
      amount = t.amount;
      ledgerAmount = r.amount;
      fee = 1;
      from = r.from;
      to = r.to;
      memoText = "";
      createdAtTimeNs = t.attempt.created_at_time;
      attempt = t.attempt.attempt;
      sends = t.attempt.sends;
      status = t.status;
      lastError = null;
    };
  };

  let transfers : RetryTypes.DexTransferStore = {
    deposits = Map.empty();
    withdrawals = Map.empty();
    pairRefunds = Map.empty();
    liquidations = Map.empty();
  };
  // n = 0..899: n % 3 == 0 deposit of a, n % 3 == 1 withdrawal of a,
  // n % 3 == 2 deposit of b; every 10th deposit of a is an auction bid deposit
  // (left out of the DEX history).
  let TOTAL = 900;
  let expected = List.empty<Nat>();
  var n = 0;
  while (n < TOTAL) {
    if (n % 3 == 0) {
      let auction = n % 30 == 0;
      let to = if (auction) RetryLib.auctionCustodyAccount(canister, #icp) else DexLib.custodyAccount(canister, #icp);
      transfers.deposits.add(n, transferOf(n, a, to));
      if (not auction) expected.add(n);
    } else if (n % 3 == 1) {
      transfers.withdrawals.add(n, transferOf(n, a, accountOf(a)));
      expected.add(n);
    } else {
      transfers.deposits.add(n, transferOf(n, b, DexLib.custodyAccount(canister, #icp)));
    };
    n += 1;
  };
  let newestFirst = expected.toArray().sort(func(x, y) = Nat.compare(y, x));

  // Reads every page with `limit`, checks order, no duplicate, no omission and
  // the page cap, and returns the number of pages.
  func readAllPages(limit : Nat, pageCap : Nat) : Nat {
    let seen = List.empty<Nat>();
    var cursor : ?Nat = null;
    var pages = 0;
    var running = true;
    while (running) {
      let page = RetryLib.dexTransfersPageWith(transfers, a, cursor, limit, viewOf);
      pages += 1;
      assert page.items.size() <= pageCap;
      assert pages <= 1000;
      for (item in page.items.values()) {
        assert item.owner == a;
        seen.add(item.n);
      };
      switch (page.nextCursor) {
        case (?c) {
          // A next cursor means a full page and the cursor is its last item.
          assert page.items.size() == pageCap;
          assert c == page.items[page.items.size() - 1].n;
          cursor := ?c;
        };
        case null { running := false };
      };
    };
    // Same transfers, same order, each exactly once.
    assert seen.toArray() == newestFirst;
    pages;
  };

  assert newestFirst.size() == 570; // 300 withdrawals + 300 deposits - 30 auction
  assert readAllPages(7, 7) == 82; // ceil(570 / 7)
  assert readAllPages(1, 1) == 570;
  // limit 0 -> default page size; a huge limit is capped by the server.
  assert readAllPages(0, PageTypes.DEFAULT_PAGE_SIZE) == 12;
  assert readAllPages(1_000_000, PageTypes.MAX_PAGE_SIZE) == 6;

  // The first page is the newest transfers; the cursor is exclusive.
  let first = RetryLib.dexTransfersPageWith(transfers, a, null, 3, viewOf);
  assert first.items.map(func v = v.n) == [898, 897, 895];
  assert first.items[0].direction == #withdrawal;
  assert first.nextCursor == ?895;
  let next = RetryLib.dexTransfersPageWith(transfers, a, first.nextCursor, 3, viewOf);
  assert next.items.map(func v = v.n) == [894, 892, 891];
  // The last page has no next cursor, even when it is full.
  let last = RetryLib.dexTransfersPageWith(transfers, a, ?4, 3, viewOf);
  assert last.items.map(func v = v.n) == [3, 1];
  assert last.nextCursor == null;
  // The user's own history only; cursor 0 is the end.
  assert RetryLib.dexTransfersPageWith(transfers, a, ?0, 10, viewOf).items.size() == 0;
  assert RetryLib.dexTransfersPageWith(transfers, owner(99), null, 10, viewOf).items.size() == 0;
};
