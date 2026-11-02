import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import DexTypes "../types/dex";
import BatchTypes "../types/dex-batch";
import InflightTypes "../types/inflight";
import PageTypes "../types/page";
import RetryTypes "../types/retry";
import DexLib "dex";
import IcrcLib "icrc";
import InflightLib "inflight";
import PayTokenLib "pay-token";
import RetryLib "retry";
import RouterLib "router";

// DEX-1: one-time (repeatable) sweep of the legacy DEX ledger accounts (every
// user deposit subaccount and every DEX-POOL-id subaccount) into the per-token
// custody account, then a per-token comparison of the custody ledger balance
// with the total owed.
//
// The sweep moves the whole real ledger balance of a legacy account minus the
// ledger fee (not only the credited amount). It never modifies internal
// balances, positions, blocks or sale.reserved. Each transfer is recorded
// through lib/retry.mo (prefix SW, memo TTTI-SW-n, created_at_time always set)
// before its first await and resent unchanged for 23 h, then listed in To
// review. A custody surplus is listed in To review (kind CS) and credited to
// no one.
//
// PTM-9e: the sweep reads the ledger balances in batches (BatchStore.batchSize
// accounts) from a persisted cursor; the SWEEP lock is taken per batch and
// released between batches (and expires by itself). Accounts already swept to
// zero are excluded. The readers of unfinished work walk the in-flight index.
module {
  // Timer period of the resend step.
  public let SWEEP_TIMER_SECONDS : Nat = 600;
  // At most this many notes are kept per token and run.
  let MAX_NOTES : Nat = 20;
  // Transient lock of ONE sweep batch (taken per batch, released between batches).
  let RUN_LOCK : Text = "SWEEP";
  // Companion lock key carrying the time the lock was taken: "SWEEP@<ns>". A lock
  // older than LOCK_EXPIRY_NS is treated as released (a trap after an await
  // skips the finally block, so the lock must expire by itself).
  let RUN_LOCK_TIME : Text = "SWEEP@";
  let LOCK_EXPIRY_NS : Int = 1_200_000_000_000; // 20 minutes
  // A sweep run older than this is restarted by the next admin call.
  let MAX_RUN_AGE_NS : Int = 172_800_000_000_000; // 2 days
  // Batches the timer takes in one tick (the lock is released between them).
  let BATCHES_PER_TICK : Nat = 4;

  public type Account = { owner : Principal; subaccount : ?Blob };

  // Where the swept funds came from.
  public type SweepSource = {
    #userDeposit : Principal; // user deposit subaccount of this principal
    #pool : Nat; // DEX-POOL-id subaccount of this pool
  };

  // One recorded sweep transfer (stored; keyed by the global number n).
  public type SweepTransfer = {
    n : Nat;
    token : DexTypes.DexToken;
    source : SweepSource;
    ledgerBalance : Nat; // balance read just before the transfer was recorded
    recordedAt : Int;
    attempt : RetryTypes.DexTransferAttempt; // request.amount = balance - fee
    status : DexTypes.DexTransferStatus;
  };

  // Custody ledger balance against the total owed, per token.
  public type Comparison = {
    checkedAt : Int;
    custodyLedger : Nat;
    userBalances : Nat; // available + reserved
    poolReserves : Nat;
    poolProtocolFees : Nat;
    routerSetAside : Nat;
    owed : Nat; // sum of the four lines above
    surplus : Nat; // custodyLedger - owed when positive
    shortfall : Nat; // owed - custodyLedger when positive
    status : { #balanced; #surplus; #shortfall };
  };

  // Result of the last run for one token (stored).
  public type TokenReport = {
    token : DexTypes.DexToken;
    lastRunAt : ?Int;
    legacyAccountsFound : Nat;
    accountsWithBalance : Nat; // balance above the fee at the last read
    accountsSkipped : Nat; // not above the fee, in flight, or not readable
    notes : [Text];
    comparison : ?Comparison; // last completed comparison
    // True when the comparison waits only for sweep transfers still unsettled.
    comparisonPending : Bool;
  };

  // Stored sweep state. Initial value: emptyStore().
  public type SweepStore = {
    transfers : Map.Map<Nat, SweepTransfer>;
    reports : Map.Map<Text, TokenReport>; // key = DexLib.tokenKey(token)
    var runs : Nat;
    var lastRunAt : ?Int;
  };

  public func emptyStore() : SweepStore {
    {
      transfers = Map.empty();
      reports = Map.empty();
      var runs = 0;
      var lastRunAt = null;
    };
  };

  // Everything the sweep reads (references, no copy).
  public type SweepContext = {
    store : SweepStore;
    dex : RetryLib.DexContext;
    router : RouterLib.RouterContext;
    locks : Set.Set<Text>; // transient: "SW:<n>" per transfer and "SWEEP" (taken per batch only)
    inflight : InflightTypes.InflightStore; // PTM-9e: stored index of unfinished operations
    batch : BatchTypes.BatchStore; // PTM-9e: stored cursor, batch size, alert, zeroed accounts
  };

  public type SweepError = { #alreadyRunning };

  public type TokenState = {
    token : DexTypes.DexToken;
    custodyAccount : Account;
    lastRunAt : ?Int;
    legacyAccountsFound : Nat;
    accountsWithBalance : Nat;
    accountsSkipped : Nat;
    transfersRecorded : Nat;
    ledgerSwept : Nat; // sum of the amounts received by custody (completed transfers)
    feesPaid : Nat; // ledger fees of the completed transfers
    pending : Nat; // #inProgress
    unknownOutcome : Nat; // #needsReview or outcome unknown
    failed : Nat;
    notes : [Text];
    comparison : ?Comparison;
    comparisonPending : Bool;
  };

  public type SweepTransferView = {
    n : Nat;
    token : DexTypes.DexToken;
    source : SweepSource;
    from : Account;
    to : Account;
    ledgerBalance : Nat;
    amount : Nat; // received by custody
    fee : Nat;
    memoText : Text;
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    status : DexTypes.DexTransferStatus;
    lastError : ?Text;
    recordedAt : Int;
  };

  // --- Helpers -----------------------------------------------------------------

  func isToken(t : DexTypes.PoolToken, token : DexTypes.DexToken) : Bool {
    DexLib.poolDexToken(t) == ?token;
  };

  func unsettled(status : DexTypes.DexTransferStatus) : Bool {
    switch (status) {
      case (#inProgress or #needsReview) true;
      case (_) false;
    };
  };

  func addNote(notes : List.List<Text>, text : Text) {
    if (notes.size() < MAX_NOTES) {
      notes.add(text);
    };
  };

  func ledgerBalance(ctx : SweepContext, token : DexTypes.DexToken, account : Account) : async { #ok : Nat; #err : Text } {
    switch (RetryLib.dexPayToken(token)) {
      case null #ok(IcrcLib.balanceOf(ctx.dex.ledger, account));
      case (?p) await PayTokenLib.balanceOf(PayTokenLib.ledger(p), account);
    };
  };

  func tokenIndex(token : DexTypes.DexToken) : Nat {
    var i = 0;
    for (t in DexLib.DEX_TOKENS.values()) {
      if (t == token) return i;
      i += 1;
    };
    0;
  };

  func ownerOfSource(source : SweepSource) : ?Principal {
    switch (source) {
      case (#userDeposit(p)) ?p;
      case (#pool(_)) null;
    };
  };

  // Stores a sweep transfer and keeps the in-flight index in step: unfinished
  // transfers are in the index, finished ones are not. Every write of a sweep
  // transfer goes through here.
  func putTransfer(ctx : SweepContext, t : SweepTransfer) {
    ctx.store.transfers.add(t.n, t);
    if (unsettled(t.status)) {
      InflightLib.enter(ctx.inflight, #sweep, t.n, [t.token], ownerOfSource(t.source));
    } else {
      InflightLib.leave(ctx.inflight, #sweep, t.n);
    };
  };

  // --- Lock of one batch -------------------------------------------------------

  // Time the SWEEP lock was taken, from its companion key.
  func lockSince(locks : Set.Set<Text>) : ?Int {
    for (k in locks.values()) {
      switch (k.stripStart(#text RUN_LOCK_TIME)) {
        case (?rest) { return Int.fromText(rest) };
        case null {};
      };
    };
    null;
  };

  public func releaseRunLock(locks : Set.Set<Text>) {
    RetryLib.unlock(locks, RUN_LOCK);
    for (k in locks.values().filter(func k = k.startsWith(#text RUN_LOCK_TIME)).toArray().values()) {
      RetryLib.unlock(locks, k);
    };
  };

  // Takes the lock of ONE batch. A lock older than LOCK_EXPIRY_NS (a batch that
  // trapped after an await never reaches its finally) is taken over.
  public func takeRunLock(locks : Set.Set<Text>) : Bool {
    if (not RetryLib.tryLock(locks, RUN_LOCK)) {
      let expired = switch (lockSince(locks)) {
        case (?since) Time.now() - since > LOCK_EXPIRY_NS;
        case null true;
      };
      if (not expired) return false;
      releaseRunLock(locks);
      if (not RetryLib.tryLock(locks, RUN_LOCK)) return false;
    };
    locks.add(RUN_LOCK_TIME # Time.now().toText());
    true;
  };

  // --- Legacy accounts ---------------------------------------------------------

  type Legacy = { source : SweepSource; account : Account };

  // The legacy accounts to read and the number of accounts excluded because
  // they were already swept to zero.
  type Listing = { accounts : [Legacy]; excluded : Nat };

  // Every user deposit subaccount of a principal with an internal balance, a
  // deposit or withdrawal record (routed swap owners via the owner index, LP
  // position owners included) and every DEX-POOL-id subaccount of a pool of
  // `token`, minus the accounts already swept to zero.
  func legacyAccounts(ctx : SweepContext, token : DexTypes.DexToken) : Listing {
    let canister = ctx.dex.canister;
    let owners = Set.empty<Principal>();
    for (owner in ctx.dex.balances.keys()) {
      owners.add(owner);
    };
    for (t in ctx.dex.transfers.deposits.values()) {
      owners.add(t.owner);
    };
    for (t in ctx.dex.transfers.withdrawals.values()) {
      owners.add(t.owner);
    };
    for (owner in ctx.router.ownerIndex.keys()) {
      owners.add(owner);
    };
    for (p in ctx.dex.dex.positions.values()) {
      owners.add(p.owner);
    };
    var excluded = 0;
    let out = List.empty<Legacy>();
    for (owner in owners.values()) {
      let source : SweepSource = #userDeposit(owner);
      if (isZeroed(ctx.batch, token, source)) {
        excluded += 1;
      } else {
        out.add({ source; account = { owner = canister; subaccount = ?DexLib.userDepositSubaccount(owner) } });
      };
    };
    for (pool in ctx.dex.dex.pools.values()) {
      if (isToken(pool.token0, token) or isToken(pool.token1, token)) {
        let source : SweepSource = #pool(pool.id);
        if (isZeroed(ctx.batch, token, source)) {
          excluded += 1;
        } else {
          out.add({ source; account = { owner = canister; subaccount = ?pool.subaccount } });
        };
      };
    };
    { accounts = out.toArray(); excluded };
  };

  // Reads only the sweep entries of the in-flight index.
  func hasUnsettledSweep(ctx : SweepContext, token : DexTypes.DexToken, account : Account) : Bool {
    for (e in InflightLib.entriesOfKindAndToken(ctx.inflight, #sweep, token).values()) {
      switch (ctx.store.transfers.get(e.n)) {
        case (?t) {
          if (t.attempt.request.from == account and unsettled(t.status)) return true;
        };
        case null {};
      };
    };
    false;
  };

  // A legacy transfer, routed swap or user operation still using this
  // account: the sweep leaves it for a later run. Reads only the in-flight
  // index.
  func legacyInFlight(ctx : SweepContext, token : DexTypes.DexToken, source : SweepSource) : Bool {
    switch (source) {
      case (#pool(_)) false;
      case (#userDeposit(owner)) {
        if (ctx.dex.locks.contains(RetryLib.dexLockKey(owner, token))) return true;
        InflightLib.syncTransfers(ctx.inflight, ctx.dex.transfers);
        InflightLib.anyOfOwnerAndToken(ctx.inflight, owner, token);
      };
    };
  };

  // --- Sending -----------------------------------------------------------------

  // Sends the recorded request of transfer n as recorded (same memo and
  // created_at_time). The send count is stored before the await; the
  // transfer's lock is released in a finally.
  func sendRecorded(ctx : SweepContext, n : Nat) : async () {
    let key = RetryLib.lockKey(#SW, n);
    if (not RetryLib.tryLock(ctx.locks, key)) return;
    try {
      let t = switch (ctx.store.transfers.get(n)) {
        case (?t) t;
        case null return;
      };
      if (t.status != #inProgress) return;
      putTransfer(ctx, { t with attempt = { t.attempt with sends = t.attempt.sends + 1 } });
      // sendDexAttempt counts this send itself; the stored copy above already
      // carries the same count, so a trap during the await keeps it.
      let done = await RetryLib.sendDexAttempt(ctx.dex, t.attempt);
      let current = switch (ctx.store.transfers.get(n)) {
        case (?c) c;
        case null return;
      };
      if (current.status != #inProgress) {
        putTransfer(ctx, { current with attempt = done });
        return;
      };
      let status : DexTypes.DexTransferStatus = switch (done.outcome) {
        case (#succeeded(block)) #completed(block);
        case (#failed(text)) #failed(text);
        case (_) #inProgress;
      };
      putTransfer(ctx, { current with attempt = done; status });
    } finally {
      RetryLib.unlock(ctx.locks, key);
    };
  };

  // Records the sweep of one legacy account (before any await on the ledger
  // transfer), then sends it. `ok` is true unless the transfer failed with a
  // known ledger error; `completed` is true when the transfer reached custody
  // (the account is then at zero).
  func sweepOne(ctx : SweepContext, token : DexTypes.DexToken, legacy : Legacy, balance : Nat, fee : Nat) : async { ok : Bool; completed : Bool } {
    let custody = DexLib.custodyAccount(ctx.dex.canister, token);
    let attempt = RetryLib.newDexAttempt(
      ctx.dex.retry,
      #SW,
      null,
      { token; from = legacy.account; to = custody; amount = Nat.sub(balance, fee); fee = ?fee },
      RetryLib.dexNow(),
    );
    putTransfer(ctx, { n = attempt.n; token; source = legacy.source; ledgerBalance = balance; recordedAt = Time.now(); attempt; status = #inProgress });
    await sendRecorded(ctx, attempt.n);
    switch (ctx.store.transfers.get(attempt.n)) {
      case (?t) {
        switch (t.status) {
          case (#failed(_)) ({ ok = false; completed = false });
          case (#completed(_)) ({ ok = true; completed = true });
          case (_) ({ ok = true; completed = false });
        };
      };
      case null ({ ok = true; completed = false });
    };
  };

  // Resends the in-progress transfers as recorded within 23 h; unknown after
  // 23 h goes to To review; never sent and too old is closed as failed. Reads
  // only the sweep entries of the in-flight index.
  func resendPending(ctx : SweepContext) : async () {
    let now = RetryLib.dexNow();
    for (e in InflightLib.entriesOfKind(ctx.inflight, #sweep).values()) {
      switch (ctx.store.transfers.get(e.n)) {
        case null { InflightLib.leave(ctx.inflight, #sweep, e.n) };
        case (?t) {
          if (t.status == #inProgress and not ctx.locks.contains(RetryLib.lockKey(#SW, t.n))) {
            switch (RetryLib.dexAction(t.attempt, now)) {
              case (#resend) { await sendRecorded(ctx, t.n) };
              case (#needsReview) { putTransfer(ctx, { t with status = #needsReview }) };
              case (#newAttempt) {
                let text = "Not sent within 23 h; nothing moved";
                putTransfer(ctx, { t with status = #failed(text); attempt = { t.attempt with outcome = #failed(text) } });
              };
              case (#done) {};
            };
          };
        };
      };
    };
  };

  // --- Owed and comparison -----------------------------------------------------

  type Owed = {
    userBalances : Nat;
    poolReserves : Nat;
    poolProtocolFees : Nat;
    routerSetAside : Nat;
  };

  // What the DEX owes in `token`: user balances (available + reserved), pool
  // reserves, pool protocol fee amounts and router set-aside amounts. Request
  // deposits, MINT_FEE and PROTOCOL_FEES obligations have their own accounts.
  func owedOf(ctx : SweepContext, token : DexTypes.DexToken) : Owed {
    var users = 0;
    let key = DexLib.tokenKey(token);
    for (inner in ctx.dex.balances.values()) {
      switch (inner.get(key)) {
        case (?b) { users += b.available + b.reserved };
        case null {};
      };
    };
    var reserves = 0;
    var fees = 0;
    for (pool in ctx.dex.dex.pools.values()) {
      // PTM-9d: the pool's fee pot (pending and not yet credited) is owed too.
      let (pot0, pot1) = DexLib.potOwed(ctx.dex.dex, pool.id);
      if (isToken(pool.token0, token)) {
        reserves += pool.reserve0 + pot0;
        fees += pool.protocolFee0;
      };
      if (isToken(pool.token1, token)) {
        reserves += pool.reserve1 + pot1;
        fees += pool.protocolFee1;
      };
    };
    var aside = 0;
    for ((poolId, sa) in ctx.router.store.setAside.entries()) {
      switch (ctx.dex.dex.pools.get(poolId)) {
        case (?pool) {
          if (isToken(pool.token0, token)) { aside += sa.amount0 };
          if (isToken(pool.token1, token)) { aside += sa.amount1 };
        };
        case null {};
      };
    };
    { userBalances = users; poolReserves = reserves; poolProtocolFees = fees; routerSetAside = aside };
  };

  // True while an operation moving `token` ledger funds is running or
  // unresolved; the comparison is deferred then. Reads only the in-flight index
  // (sweep transfers excluded: they only move funds between accounts the
  // comparison adds up).
  func tokenBusy(ctx : SweepContext, token : DexTypes.DexToken) : Bool {
    if (ctx.router.locks.size() > 0) return true;
    let suffix = "/" # DexLib.tokenKey(token);
    for (k in ctx.dex.locks.values()) {
      if (k.startsWith(#text "DQ/")) {
        if (token == #tttiT) return true;
      } else if (k.endsWith(#text suffix)) {
        return true;
      };
    };
    InflightLib.syncTransfers(ctx.inflight, ctx.dex.transfers);
    for (e in InflightLib.entriesOfToken(ctx.inflight, token).values()) {
      if (e.kind != #sweep) return true;
    };
    false;
  };

  func unsettledSweepCount(ctx : SweepContext, token : DexTypes.DexToken) : Nat {
    var count = 0;
    for (e in InflightLib.entriesOfKindAndToken(ctx.inflight, #sweep, token).values()) {
      switch (ctx.store.transfers.get(e.n)) {
        case (?t) { if (unsettled(t.status)) count += 1 };
        case null {};
      };
    };
    count;
  };

  // Reads the custody ledger balance and compares it with the total owed.
  // Null when a ledger read failed or an operation moving this token was in
  // flight (before or after the read).
  func compareToken(ctx : SweepContext, token : DexTypes.DexToken) : async ?Comparison {
    if (tokenBusy(ctx, token)) return null;
    let custody = DexLib.custodyAccount(ctx.dex.canister, token);
    let balance = switch (await ledgerBalance(ctx, token, custody)) {
      case (#ok(b)) b;
      case (#err(_)) return null;
    };
    if (tokenBusy(ctx, token)) return null;
    let owed = owedOf(ctx, token);
    let total = owed.userBalances + owed.poolReserves + owed.poolProtocolFees + owed.routerSetAside;
    ?{
      checkedAt = Time.now();
      custodyLedger = balance;
      userBalances = owed.userBalances;
      poolReserves = owed.poolReserves;
      poolProtocolFees = owed.poolProtocolFees;
      routerSetAside = owed.routerSetAside;
      owed = total;
      surplus = if (balance > total) Nat.sub(balance, total) else 0;
      shortfall = if (total > balance) Nat.sub(total, balance) else 0;
      status = if (balance == total) #balanced else if (balance > total) #surplus else #shortfall;
    };
  };

  func reportOf(ctx : SweepContext, token : DexTypes.DexToken) : ?TokenReport {
    ctx.store.reports.get(DexLib.tokenKey(token));
  };

  // After resends: compares the tokens whose comparison only waited for the
  // sweep transfers, once none is unsettled any more.
  func refreshComparisons(ctx : SweepContext) : async () {
    for (token in DexLib.DEX_TOKENS.values()) {
      switch (reportOf(ctx, token)) {
        case (?r) {
          if (r.comparisonPending and unsettledSweepCount(ctx, token) == 0) {
            switch (await compareToken(ctx, token)) {
              case (?c) {
                let latest = switch (reportOf(ctx, token)) {
                  case (?x) x;
                  case null r;
                };
                ctx.store.reports.add(DexLib.tokenKey(token), { latest with comparison = ?c; comparisonPending = false });
              };
              case null {};
            };
          };
        };
        case null {};
      };
    };
  };

  // --- Sweep -------------------------------------------------------------------

  func newProgress(token : DexTypes.DexToken) : BatchTypes.SweepTokenProgress {
    {
      token;
      var accountsListed = 0;
      var accountsRead = 0;
      var withBalance = 0;
      var skipped = 0;
      var belowFee = 0;
      var belowFeeTotal = 0;
      var unreadable = 0;
      var inFlight = 0;
      var failedNow = 0;
      var excludedZero = 0;
      var done = false;
    };
  };

  func mergeNotes(old : [Text], added : List.List<Text>) : [Text] {
    let out = List.fromArray(old);
    for (n in added.values()) {
      addNote(out, n);
    };
    out.toArray();
  };

  func beginSweepRun(ctx : SweepContext) {
    let run = ctx.batch.sweep;
    let now = Time.now();
    run.active := true;
    run.runId += 1;
    run.startedAt := ?now;
    run.tokenIndex := 0;
    run.accountIndex := 0;
    run.batches := 0;
    run.lastBatchAt := null;
    run.progress.clear();
    ctx.store.runs += 1;
    ctx.store.lastRunAt := ?now;
  };

  // Resumes the running sweep, or starts a new one when none is running (or the
  // running one is older than MAX_RUN_AGE_NS).
  func ensureSweepRun(ctx : SweepContext) {
    let run = ctx.batch.sweep;
    if (run.active) {
      let stale = switch (run.startedAt) {
        case (?t) Time.now() - t > MAX_RUN_AGE_NS;
        case null false;
      };
      if (stale) beginSweepRun(ctx);
    } else {
      beginSweepRun(ctx);
    };
  };

  // Reads and sweeps up to `budget` legacy accounts of `token` from the run's
  // cursor. The cursor is stored before each account is handled, so an account
  // that traps is skipped by this run instead of blocking it. An account swept
  // to zero leaves the list, so the cursor does not move past it. When the
  // token is done: comparison with the owed total, then the cursor moves to the
  // next token. Returns the ledger reads used.
  func sweepTokenStep(ctx : SweepContext, token : DexTypes.DexToken, budget : Nat) : async Nat {
    let run = ctx.batch.sweep;
    let key = DexLib.tokenKey(token);
    let listing = legacyAccounts(ctx, token);
    let legacy = listing.accounts;
    let fee = RetryLib.dexFee(ctx.dex, token);
    let symbol = DexLib.tokenSymbol(token);
    let notes = List.empty<Text>();
    let prog = switch (run.progress.get(key)) {
      case (?p) p;
      case null {
        let p = newProgress(token);
        p.accountsListed := legacy.size();
        run.progress.add(key, p);
        let previousComparison = switch (ctx.store.reports.get(key)) {
          case (?r) r.comparison;
          case null null;
        };
        ctx.store.reports.add(
          key,
          {
            token;
            lastRunAt = ?Time.now();
            legacyAccountsFound = legacy.size();
            accountsWithBalance = 0;
            accountsSkipped = 0;
            notes = [];
            comparison = previousComparison;
            comparisonPending = false;
          },
        );
        p;
      };
    };
    prog.excludedZero := listing.excluded;
    let start = run.accountIndex;
    var processed = 0;
    var zeroedNew = 0;
    var used = 0;
    var finished = false;
    while (used < budget and not finished) {
      let i = start + processed;
      if (i >= legacy.size()) {
        finished := true;
      } else {
        let l = legacy[i];
        processed += 1;
        used += 1;
        run.accountIndex := Nat.sub(start + processed, zeroedNew);
        prog.accountsRead += 1;
        var zeroedNow = false;
        if (hasUnsettledSweep(ctx, token, l.account)) {
          prog.skipped += 1;
          prog.inFlight += 1;
          addNote(notes, "A sweep transfer of a " # symbol # " legacy account is still unsettled; skipped.");
        } else if (legacyInFlight(ctx, token, l.source)) {
          prog.skipped += 1;
          prog.inFlight += 1;
          addNote(notes, "A " # symbol # " operation is in flight on a legacy account; skipped until a later run.");
        } else {
          switch (await ledgerBalance(ctx, token, l.account)) {
            case (#err(e)) {
              prog.skipped += 1;
              prog.unreadable += 1;
              addNote(notes, "Could not read a " # symbol # " legacy account balance: " # e);
            };
            case (#ok(balance)) {
              if (balance <= fee) {
                prog.skipped += 1;
                if (balance > 0) {
                  prog.belowFee += 1;
                  prog.belowFeeTotal += balance;
                } else {
                  zeroedNow := true;
                };
              } else {
                prog.withBalance += 1;
                let r = await sweepOne(ctx, token, l, balance, fee);
                if (not r.ok) {
                  prog.failedNow += 1;
                };
                if (r.completed) {
                  zeroedNow := true;
                };
              };
            };
          };
        };
        if (zeroedNow) {
          markZeroed(ctx.batch, token, l.source);
          zeroedNew += 1;
          run.accountIndex := Nat.sub(start + processed, zeroedNew);
        };
      };
    };
    var newComparison : ?Comparison = null;
    var pendingOnly = false;
    if (finished) {
      if (prog.belowFee > 0) {
        addNote(notes, prog.belowFee.toText() # " " # symbol # " legacy account(s) with a balance not above the ledger fee (" # fee.toText() # ") were skipped; " # prog.belowFeeTotal.toText() # " base units in total.");
      };
      if (prog.excludedZero > 0) {
        addNote(notes, prog.excludedZero.toText() # " " # symbol # " legacy account(s) already swept to zero were not read.");
      };
      let open = unsettledSweepCount(ctx, token);
      if (prog.unreadable == 0 and prog.inFlight == 0 and prog.failedNow == 0) {
        if (open == 0) {
          used += 1;
          switch (await compareToken(ctx, token)) {
            case (?c) { newComparison := ?c };
            case null { addNote(notes, "Custody comparison deferred: an operation on " # symbol # " is in flight or the custody balance could not be read.") };
          };
        } else {
          pendingOnly := true;
          addNote(notes, "Custody comparison deferred until " # open.toText() # " sweep transfer(s) are settled.");
        };
      } else {
        addNote(notes, "Custody comparison deferred: some legacy accounts were skipped, unreadable or failed; run the sweep again.");
      };
    };
    switch (ctx.store.reports.get(key)) {
      case (?r) {
        ctx.store.reports.add(
          key,
          {
            r with
            lastRunAt = ?Time.now();
            legacyAccountsFound = prog.accountsListed;
            accountsWithBalance = prog.withBalance;
            accountsSkipped = prog.skipped;
            notes = mergeNotes(r.notes, notes);
            comparison = if (finished) {
              switch (newComparison) {
                case (?c) ?c;
                case null r.comparison;
              };
            } else r.comparison;
            comparisonPending = if (finished) pendingOnly else r.comparisonPending;
          },
        );
      };
      case null {};
    };
    if (finished) {
      prog.done := true;
      run.tokenIndex += 1;
      run.accountIndex := 0;
    };
    used;
  };

  // One batch of the running sweep: at most `batchSize` ledger reads, over one
  // or more tokens, from the persisted cursor. The caller holds the batch lock.
  func sweepBatch(ctx : SweepContext) : async () {
    let run = ctx.batch.sweep;
    if (not run.active) return;
    run.batches += 1;
    run.lastBatchAt := ?Time.now();
    var budget = Nat.max(1, ctx.batch.batchSize);
    var rounds = 0;
    while (run.active and budget > 0 and rounds < 64) {
      rounds += 1;
      if (run.tokenIndex >= DexLib.DEX_TOKENS.size()) {
        run.active := false;
      } else {
        let used = await sweepTokenStep(ctx, DexLib.DEX_TOKENS[run.tokenIndex], budget);
        budget := if (used >= budget) 0 else Nat.sub(budget, used);
      };
    };
    if (run.tokenIndex >= DexLib.DEX_TOKENS.size()) {
      run.active := false;
    };
  };

  // Admin run: resends the unsettled transfers, then reads ONE batch of the
  // sweep (starting a new run when none is running). The SWEEP lock is held for
  // this batch only; the cursor resumes at the next call or timer tick. Not
  // blocked by the DEX pause. Running again moves nothing more once the
  // balances are swept.
  public func runSweep(ctx : SweepContext) : async Result.Result<[TokenState], SweepError> {
    if (not takeRunLock(ctx.locks)) return #err(#alreadyRunning);
    try {
      ensureSweepRun(ctx);
      await resendPending(ctx);
      await sweepBatch(ctx);
      #ok(states(ctx));
    } finally {
      releaseRunLock(ctx.locks);
    };
  };

  // Resend step (admin endpoint and timer): resends as recorded, refreshes the
  // comparisons that only waited for the transfers, then resumes a running
  // sweep for a few batches. The lock is taken per batch and released between
  // batches.
  public func retrySweep(ctx : SweepContext) : async () {
    var i = 0;
    while (i < BATCHES_PER_TICK) {
      if (not takeRunLock(ctx.locks)) return;
      try {
        if (i == 0) {
          await resendPending(ctx);
          await refreshComparisons(ctx);
        };
        if (ctx.batch.sweep.active) {
          await sweepBatch(ctx);
        };
      } finally {
        releaseRunLock(ctx.locks);
      };
      if (not ctx.batch.sweep.active) return;
      i += 1;
    };
  };

  // 10-minute recurring resend timer; armed on every install and upgrade.
  public func startSweepTimer<system>(ctx : SweepContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(SWEEP_TIMER_SECONDS),
      func() : async () { await retrySweep(ctx) },
    );
  };

  // --- Views -------------------------------------------------------------------

  public func stateOf(ctx : SweepContext, token : DexTypes.DexToken) : TokenState {
    var recorded = 0;
    var swept = 0;
    var fees = 0;
    var pending = 0;
    var unknown = 0;
    var failed = 0;
    for (t in ctx.store.transfers.values()) {
      if (t.token == token) {
        recorded += 1;
        switch (t.status) {
          case (#completed(_)) {
            swept += t.attempt.request.amount;
            fees += t.attempt.request.fee ?? 0;
          };
          case (#inProgress) {
            pending += 1;
            if (t.attempt.outcome == #unknown) unknown += 1;
          };
          case (#needsReview) { unknown += 1 };
          case (#failed(_)) { failed += 1 };
        };
      };
    };
    let r = reportOf(ctx, token);
    {
      token;
      custodyAccount = DexLib.custodyAccount(ctx.dex.canister, token);
      lastRunAt = switch (r) { case (?x) x.lastRunAt; case null null };
      legacyAccountsFound = switch (r) { case (?x) x.legacyAccountsFound; case null 0 };
      accountsWithBalance = switch (r) { case (?x) x.accountsWithBalance; case null 0 };
      accountsSkipped = switch (r) { case (?x) x.accountsSkipped; case null 0 };
      transfersRecorded = recorded;
      ledgerSwept = swept;
      feesPaid = fees;
      pending;
      unknownOutcome = unknown;
      failed;
      notes = switch (r) { case (?x) x.notes; case null [] };
      comparison = switch (r) { case (?x) x.comparison; case null null };
      comparisonPending = switch (r) { case (?x) x.comparisonPending; case null false };
    };
  };

  public func states(ctx : SweepContext) : [TokenState] {
    DexLib.DEX_TOKENS.map(func t = stateOf(ctx, t));
  };

  public func transferView(t : SweepTransfer) : SweepTransferView {
    {
      n = t.n;
      token = t.token;
      source = t.source;
      from = t.attempt.request.from;
      to = t.attempt.request.to;
      ledgerBalance = t.ledgerBalance;
      amount = t.attempt.request.amount;
      fee = t.attempt.request.fee ?? 0;
      memoText = t.attempt.memo.decodeUtf8() ?? "";
      createdAtTimeNs = t.attempt.created_at_time;
      attempt = t.attempt.attempt;
      sends = t.attempt.sends;
      status = t.status;
      lastError = t.attempt.lastError;
      recordedAt = t.recordedAt;
    };
  };

  // PTM-9e: recorded sweep transfers, newest first, one page. `cursor` = a
  // transfer number n: the page holds the transfers with a number strictly below
  // it (null = newest). `limit` is clamped by PageTypes.clampLimit. nextCursor =
  // number of the last returned transfer when older ones remain, else null.
  public func listTransfers(ctx : SweepContext, cursor : ?Nat, limit : Nat) : PageTypes.Page<SweepTransferView> {
    let size = PageTypes.clampLimit(limit);
    let it = switch (cursor) {
      case null ctx.store.transfers.reverseEntries();
      case (?0) return PageTypes.emptyPage<SweepTransferView>();
      case (?c) ctx.store.transfers.reverseEntriesFrom(c - 1);
    };
    let items = List.empty<SweepTransferView>();
    var more = false;
    label scan for ((_, t) in it) {
      if (items.size() == size) {
        more := true;
        break scan;
      };
      items.add(transferView(t));
    };
    let count = items.size();
    { items = items.toArray(); nextCursor = if (more and count > 0) ?(items.at(count - 1).n) else null };
  };

  // Every recorded sweep transfer, newest first. Not paged: for the OQL
  // entity in main.mo only; no public endpoint returns it.
  public func allTransfers(ctx : SweepContext) : [SweepTransferView] {
    ctx.store.transfers.values().map(transferView).toArray().sort(func(x, y) = Nat.compare(y.n, x.n));
  };

  // --- PTM-9e: batching state --------------------------------------------------

  // Zero-account mark key: "<tokenKey>/<owner text>" for a user deposit account,
  // "<tokenKey>/P<poolId>" for a pool account.
  public func zeroKey(token : DexTypes.DexToken, source : SweepSource) : Text {
    let suffix = switch (source) {
      case (#userDeposit(p)) p.toText();
      case (#pool(id)) "P" # id.toText();
    };
    DexLib.tokenKey(token) # "/" # suffix;
  };

  // True when the account was swept to zero and has not been re-included: it is
  // excluded from the sweep and from the reserve check. PTM-9f: the mark has no
  // expiry; it stays until new DEX activity (RetryLib.reincludeOnActivity) or the
  // daily re-read (runReread) removes it.
  public func isZeroed(batch : BatchTypes.BatchStore, token : DexTypes.DexToken, source : SweepSource) : Bool {
    batch.zeroed.containsKey(zeroKey(token, source));
  };

  public func markZeroed(batch : BatchTypes.BatchStore, token : DexTypes.DexToken, source : SweepSource) {
    batch.zeroed.add(zeroKey(token, source), Time.now());
  };

  // Removes the mark (a new deposit or withdrawal of that owner and token).
  public func clearZeroed(batch : BatchTypes.BatchStore, token : DexTypes.DexToken, source : SweepSource) {
    batch.zeroed.remove(zeroKey(token, source));
  };

  // --- PTM-9f: daily batched re-read of the excluded accounts ------------------

  // Inverse of zeroKey: "<tokenKey>/<owner text>" or "<tokenKey>/P<poolId>".
  // Null for a key that matches no DEX token or has an unreadable suffix.
  func parseZeroKey(key : Text) : ?(DexTypes.DexToken, SweepSource) {
    let parts = key.split(#char '/').toArray();
    if (parts.size() != 2) return null;
    var token : ?DexTypes.DexToken = null;
    for (t in DexLib.DEX_TOKENS.values()) {
      if (DexLib.tokenKey(t) == parts[0]) token := ?t;
    };
    let t = switch (token) {
      case (?t) t;
      case null return null;
    };
    let suffix = parts[1];
    switch (suffix.stripStart(#text "P")) {
      case (?rest) {
        switch (Nat.fromText(rest)) {
          case (?id) return ?(t, #pool(id));
          case null return null;
        };
      };
      case null {};
    };
    if (suffix == "") return null;
    ?(t, #userDeposit(Principal.fromText(suffix)));
  };

  // True when no pass is running and the last complete pass is at least
  // REREAD_INTERVAL_NS old (or there has been none yet).
  public func rereadDue(batch : BatchTypes.BatchStore, now : Int) : Bool {
    let r = batch.reread;
    if (r.active) return false;
    switch (r.lastFinishedAt) {
      case (?t) now >= t + BatchTypes.REREAD_INTERVAL_NS;
      case null true;
    };
  };

  public func beginReread(batch : BatchTypes.BatchStore, now : Int) {
    let r = batch.reread;
    r.active := true;
    r.runId += 1;
    r.startedAt := ?now;
    r.lastKey := null;
    r.read := 0;
    r.reincluded := 0;
    r.unreadable := 0;
    r.lastBatchAt := null;
  };

  // Next batch of excluded keys: up to batchSize keys strictly after lastKey.
  func nextRereadKeys(batch : BatchTypes.BatchStore) : [Text] {
    let size = Nat.max(1, batch.batchSize);
    let r = batch.reread;
    let it = switch (r.lastKey) {
      case (?k) batch.zeroed.entriesFrom(k);
      case null batch.zeroed.entries();
    };
    let keys = List.empty<Text>();
    label scan for ((k, _) in it) {
      if (r.lastKey == ?k) continue scan;
      keys.add(k);
      if (keys.size() >= size) break scan;
    };
    keys.toArray();
  };

  // One batch of the pass: reads the ledger balance of up to batchSize excluded
  // accounts (cursor = lastKey). A non-zero balance removes the zero mark at
  // once (the account is re-included: the reserve check and the sweep read it
  // again); a zero balance keeps the exclusion; a failed read keeps it and is
  // counted as unreadable (read again at the next pass). Read only: no transfer,
  // no balance, block or sale.reserved changes. The pass ends when a batch finds
  // no key left.
  func rereadBatch(ctx : SweepContext) : async () {
    let r = ctx.batch.reread;
    if (not r.active) return;
    let id = r.runId;
    r.lastBatchAt := ?Time.now();
    let keys = nextRereadKeys(ctx.batch);
    for (key in keys.values()) {
      switch (parseZeroKey(key)) {
        case null {
          r.read += 1;
          r.unreadable += 1;
        };
        case (?(token, source)) {
          let subaccount : ?Blob = switch (source) {
            case (#userDeposit(p)) ?DexLib.userDepositSubaccount(p);
            case (#pool(poolId)) {
              switch (ctx.dex.dex.pools.get(poolId)) {
                case (?pool) ?pool.subaccount;
                case null null;
              };
            };
          };
          switch (subaccount) {
            case null {
              r.read += 1;
              r.unreadable += 1;
            };
            case (?sub) {
              let result = await ledgerBalance(ctx, token, { owner = ctx.dex.canister; subaccount = ?sub });
              // The pass was restarted while the read was out: leave it alone.
              if (not r.active or r.runId != id) return;
              r.read += 1;
              switch (result) {
                case (#ok(balance)) {
                  if (balance > 0) {
                    ctx.batch.zeroed.remove(key);
                    r.reincluded += 1;
                  };
                };
                case (#err(_)) { r.unreadable += 1 };
              };
            };
          };
        };
      };
      r.lastKey := ?key;
    };
    if (keys.size() < Nat.max(1, ctx.batch.batchSize)) {
      r.active := false;
      r.lastKey := null;
      r.lastBatchAt := ?Time.now();
      r.lastFinishedAt := ?Time.now();
    };
  };

  // Starts a pass when one is due, then takes up to BATCHES_PER_TICK batches.
  // The SWEEP lock is taken per batch and released between batches, so a pass
  // over thousands of accounts never holds it for long; the cursor resumes at the
  // next tick. Read only, so (like the reserve check and the sweep) it is not
  // blocked by the DEX pause.
  public func runReread(ctx : SweepContext) : async () {
    if (ctx.batch.reread.active == false) {
      if (not rereadDue(ctx.batch, Time.now())) return;
      beginReread(ctx.batch, Time.now());
    };
    var i = 0;
    while (i < BATCHES_PER_TICK and ctx.batch.reread.active) {
      if (not takeRunLock(ctx.locks)) return;
      try {
        await rereadBatch(ctx);
      } finally {
        releaseRunLock(ctx.locks);
      };
      i += 1;
    };
  };

  // Timer of the daily re-read, re-armed on every install and upgrade
  // (main.mo). It ticks every SWEEP_TIMER_SECONDS: a pass starts only when
  // now >= lastFinishedAt + REREAD_INTERVAL_NS, and a running pass resumes from
  // its persisted cursor.
  public func startRereadTimer<system>(ctx : SweepContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(SWEEP_TIMER_SECONDS),
      func() : async () {
        try { await runReread(ctx) } catch (_) {};
      },
    );
  };

  // Admin view of the sweep cursor: position, batches taken and per-token
  // progress. Read only.
  public func progressOf(ctx : SweepContext) : BatchTypes.SweepProgress {
    let run = ctx.batch.sweep;
    let tokens = List.empty<BatchTypes.SweepTokenProgressView>();
    for (token in DexLib.DEX_TOKENS.values()) {
      switch (run.progress.get(DexLib.tokenKey(token))) {
        case (?p) {
          tokens.add({
            token = p.token;
            accountsListed = p.accountsListed;
            accountsRead = p.accountsRead;
            withBalance = p.withBalance;
            skipped = p.skipped;
            unreadable = p.unreadable;
            inFlight = p.inFlight;
            excludedZero = p.excludedZero;
            done = p.done;
          });
        };
        case null {};
      };
    };
    {
      active = run.active;
      runId = run.runId;
      startedAt = run.startedAt;
      tokenIndex = run.tokenIndex;
      accountIndex = run.accountIndex;
      batches = run.batches;
      batchSize = ctx.batch.batchSize;
      lastBatchAt = run.lastBatchAt;
      tokens = tokens.toArray();
    };
  };

  // --- To review ---------------------------------------------------------------

  // SW transfers with unknown outcome after 23 h (purchaseId = n) and one CS
  // row per token whose last comparison shows a custody surplus (purchaseId =
  // index of the token in DexLib.DEX_TOKENS; amount = surplus). A surplus is
  // credited to no one and has no automatic action.
  public func toReview(ctx : SweepContext) : [RetryTypes.TransferReview] {
    let canister = ctx.dex.canister;
    let rows = List.empty<RetryTypes.TransferReview>();
    // needsReview is an unfinished status, so these transfers are in the index.
    for (e in InflightLib.entriesOfKind(ctx.inflight, #sweep).values()) {
      switch (ctx.store.transfers.get(e.n)) {
        case (?t) {
          if (t.status == #needsReview) {
            let row = RetryLib.dexReview(#SW, t.n, canister, t.attempt);
            rows.add({ row with buyer = ownerOfSource(t.source) });
          };
        };
        case null {};
      };
    };
    let transfers = rows.toArray().sort(func(x, y) = Nat.compare(x.purchaseId, y.purchaseId));
    let surpluses = List.empty<RetryTypes.TransferReview>();
    for (token in DexLib.DEX_TOKENS.values()) {
      switch (reportOf(ctx, token)) {
        case (?r) {
          switch (r.comparison) {
            case (?c) {
              if (c.surplus > 0) {
                surpluses.add({
                  kind = #CS;
                  purchaseId = tokenIndex(token);
                  block = null;
                  collect = null;
                  token;
                  memoText = null;
                  memoHex = null;
                  createdAtTimeNs = ?c.checkedAt.toNat().toNat64();
                  amount = c.surplus;
                  fee = null;
                  destination = ?DexLib.custodyAccount(canister, token);
                  sends = 0;
                  lastError = ?("Custody surplus: the " # DexLib.tokenSymbol(token) # " custody account holds " # c.surplus.toText() # " base units more than the total owed. Credited to no one; no automatic action.");
                  buyer = null;
                  depositIndex = null;
                  conversionId = null;
                  refundPurpose = null;
                  outcome = null;
                });
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
    transfers.concat(surpluses.toArray());
  };

  // Arrived (SW only): the transfer reached custody; nothing else changes.
  public func markArrived(ctx : SweepContext, kind : RetryTypes.TransferKind, n : Nat, block : Nat) : RetryTypes.ReviewResult {
    if (kind != #SW) return #err(#notApplicable);
    let t = switch (ctx.store.transfers.get(n)) {
      case (?t) t;
      case null return #err(#notFound);
    };
    if (t.status != #needsReview) return #err(#notUnderReview);
    putTransfer(ctx, { t with status = #completed(block); attempt = { t.attempt with outcome = #succeeded(block) } });
    #ok;
  };

  // Not arrived (SW only): the transfer is closed as failed; the legacy
  // account keeps its balance and a later sweep run moves it with a new
  // transfer. The pending comparison is cancelled.
  public func markNotArrived(ctx : SweepContext, kind : RetryTypes.TransferKind, n : Nat) : RetryTypes.ReviewResult {
    if (kind != #SW) return #err(#notApplicable);
    let t = switch (ctx.store.transfers.get(n)) {
      case (?t) t;
      case null return #err(#notFound);
    };
    if (t.status != #needsReview) return #err(#notUnderReview);
    let text = "Not arrived (admin verification)";
    putTransfer(ctx, { t with status = #failed(text); attempt = { t.attempt with outcome = #failed(text) } });
    switch (reportOf(ctx, t.token)) {
      case (?r) {
        let notes = r.notes.concat(["Sweep transfer " # n.toText() # " did not arrive; run the sweep again."]);
        ctx.store.reports.add(DexLib.tokenKey(t.token), { r with comparisonPending = false; notes });
      };
      case null {};
    };
    #ok;
  };
};
