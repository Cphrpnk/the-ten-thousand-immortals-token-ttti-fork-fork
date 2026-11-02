import Int "mo:core/Int";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/dex-reserve";
import DexTypes "../types/dex";
import BatchTypes "../types/dex-batch";
import InflightTypes "../types/inflight";
import CreatorFeesLib "creator-fees";
import DexLib "dex";
import IcrcLib "icrc";
import PayTokenLib "pay-token";
import ProtocolFeesLib "protocol-fees";
import RetryLib "retry";
import InflightLib "inflight";
import RouterLib "router";
import AuctionLib "auction";
import AuctionTypes "../types/auction";

// DEX lot 6: reserve check and the DEX-specific pause. Each ledger account is
// compared only with its own obligations, never mixed with another account:
// DEX holdings per token, pair-request deposits, MINT_FEE per paid token and
// PROTOCOL_FEES. Reserves are bookkeeping only; nothing here corrects a
// difference, sends an alert or touches the sale.
module {
  // Hourly check.
  public let CHECK_INTERVAL_SECONDS : Nat = 3600;
  // Short mismatch history.
  public let MAX_HISTORY : Nat = 50;

  let PAY_TOKENS : [DexTypes.DexToken] = [#icp, #ckbtc, #ckusdc, #ckusdt];

  // Everything the check reads (references, no copy). Transient.
  public type ReserveContext = {
    store : Types.DexReserveStore;
    lock : Types.CheckLock;
    dex : RetryLib.DexContext;
    fees : ProtocolFeesLib.ProtocolFeeContext;
    router : RouterLib.RouterContext;
    auction : AuctionTypes.AuctionStore; // PTM-6a: bids and deposits in flight
    closing : AuctionTypes.ClosingStore; // PTM-6b: withdrawable and pending-settlement balances
    inflight : InflightTypes.InflightStore; // PTM-9e: stored index of unfinished operations
    batch : BatchTypes.BatchStore; // PTM-9e: stored cursor, batch size, alert, zeroed accounts
  };

  type Account = { owner : Principal; subaccount : ?Blob };

  // A lock older than this is treated as released (a trap after an await cannot
  // leave the check locked for good).
  let LOCK_EXPIRY_NS : Int = 1_200_000_000_000; // 20 minutes
  // A run that stays active longer than this is abandoned and restarted.
  let RUN_MAX_AGE_NS : Int = 43_200_000_000_000; // 12 hours
  // Continuation timer: resumes an active run between two hourly checks.
  public let RESUME_INTERVAL_SECONDS : Nat = 60;
  // Safety bound of a run completed in one call (resume).
  let MAX_BATCHES_PER_CALL : Nat = 400;

  public type Target = { kind : Types.AccountKind; token : DexTypes.DexToken };

  public func accountLabel(kind : Types.AccountKind) : Text {
    switch (kind) {
      case (#dexHoldings) "DEX holdings";
      case (#requestDeposits) "Pair-request deposits";
      case (#mintFee) "Mint fee account";
      case (#protocolFees) "Protocol fees account";
      case (#auctionDeposits) "Auction deposits";
    };
  };

  // Every account compared by a check, in display order.
  public func targets() : [Target] {
    let out = List.empty<Target>();
    for (token in DexLib.DEX_TOKENS.values()) {
      out.add({ kind = #dexHoldings; token });
    };
    out.add({ kind = #requestDeposits; token = #tttiT });
    for (token in PAY_TOKENS.values()) {
      out.add({ kind = #mintFee; token });
    };
    out.add({ kind = #protocolFees; token = #icp });
    // PTM-6a: one auction custody account per paid token.
    for (token in PAY_TOKENS.values()) {
      out.add({ kind = #auctionDeposits; token });
    };
    out.toArray();
  };

  // --- Internal totals -------------------------------------------------------

  func isToken(t : DexTypes.PoolToken, token : DexTypes.DexToken) : Bool {
    DexLib.poolDexToken(t) == ?token;
  };

  // TTTI-T held in the request deposit subaccount: pending requests, refused
  // requests not yet fed to the protocol liquidity (and not refunded), and
  // approved requests whose DQ refund has not completed.
  func heldRequestDeposits(ctx : ReserveContext) : Nat {
    var total = 0;
    for (request in ctx.dex.dex.requests.values()) {
      let held = switch (request.status) {
        case (#pending) true;
        case (#refused(_)) request.refundBlock == null and ctx.fees.refusedFeeds.get(request.id) == null;
        case (#approved(_)) {
          switch (request.refundStatus) {
            case (#inProgress or #needsReview) true;
            case (_) false;
          };
        };
      };
      if (held) {
        total += request.depositAmount;
      };
    };
    total;
  };

  // Obligations of the DEX holdings of `token`: user balances (available +
  // reserved), pool reserves and protocol fee amounts, router set-aside
  // amounts. Request deposits, MINT_FEE and PROTOCOL_FEES are separate accounts.
  public func internalTotal(ctx : ReserveContext, token : DexTypes.DexToken) : Nat {
    var total = 0;
    let key = DexLib.tokenKey(token);
    for (inner in ctx.dex.balances.values()) {
      switch (inner.get(key)) {
        case (?b) { total += b.available + b.reserved };
        case null {};
      };
    };
    for (pool in ctx.dex.dex.pools.values()) {
      // PTM-9d: the pool's fee pot (pending and not yet credited) is owed too.
      let (pot0, pot1) = DexLib.potOwed(ctx.dex.dex, pool.id);
      if (isToken(pool.token0, token)) {
        total += pool.reserve0 + pool.protocolFee0 + pot0;
      };
      if (isToken(pool.token1, token)) {
        total += pool.reserve1 + pool.protocolFee1 + pot1;
      };
    };
    for ((poolId, sa) in ctx.router.store.setAside.entries()) {
      switch (ctx.dex.dex.pools.get(poolId)) {
        case (?pool) {
          if (isToken(pool.token0, token)) {
            total += sa.amount0;
          };
          if (isToken(pool.token1, token)) {
            total += sa.amount1;
          };
        };
        case null {};
      };
    };
    // PTM-4: creator holdings kept in the DEX custody (credited and not paid
    // out: held plus the payouts in flight, so a payout in flight stays
    // counted until it succeeds) and the permanent-liquidity set-aside.
    total += CreatorFeesLib.owed(ctx.fees.creator, token);
    total += ProtocolFeesLib.permanentAmount(ctx.fees.permanent, token);
    total;
  };

  func mintFeeKey(token : DexTypes.DexToken) : Text {
    switch (token) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
      case (#tttiT) "";
    };
  };

  // Claimable mint-fee balances plus the set-aside amount of the paid token.
  func mintFeeOwed(ctx : ReserveContext, token : DexTypes.DexToken) : Nat {
    let key = mintFeeKey(token);
    var total = 0;
    for (inner in ctx.fees.mintFees.claimable.values()) {
      switch (inner.get(key)) {
        case (?n) { total += n };
        case null {};
      };
    };
    switch (ctx.fees.mintFees.setAside.get(key)) {
      case (?s) { total += s.amount };
      case null {};
    };
    total;
  };

  // ICP behind the claimable LP bonuses plus the cycles ICP held.
  func protocolFeesOwed(ctx : ReserveContext) : Nat {
    var total = ctx.fees.store.cyclesHeldE8s;
    for (n in ctx.fees.store.bonusClaimable.values()) {
      total += n;
    };
    total;
  };

  // What the account of `target` owes, from its own obligations only.
  func owedOf(ctx : ReserveContext, target : Target) : Nat {
    switch (target.kind) {
      case (#dexHoldings) internalTotal(ctx, target.token);
      case (#requestDeposits) heldRequestDeposits(ctx);
      case (#mintFee) mintFeeOwed(ctx, target.token);
      case (#protocolFees) protocolFeesOwed(ctx);
      case (#auctionDeposits) AuctionLib.heldDeposits(ctx.auction, ctx.closing, ctx.dex, target.token);
    };
  };

  // --- Ledger accounts and balances ------------------------------------------

  // The ledger accounts that make up one compared account. DEX holdings: the
  // custody account, every legacy user deposit subaccount, the DEX-POOL
  // subaccounts of the token and, for TTTI-T, the injection account.
  // PTM-9e: the deposit accounts already swept to zero are left out (`excluded`
  // counts them). The custody account is read first.
  type Listing = { accounts : [Account]; excluded : Nat };

  // Mark written by the sweep: the account was swept to zero. PTM-9f: it has
  // no expiry; the account stays excluded until new DEX activity or the daily
  // re-read removes the mark.
  func zeroedAccount(ctx : ReserveContext, token : DexTypes.DexToken, suffix : Text) : Bool {
    ctx.batch.zeroed.containsKey(DexLib.tokenKey(token) # "/" # suffix);
  };

  func accountsOf(ctx : ReserveContext, target : Target) : Listing {
    let canister = ctx.dex.canister;
    switch (target.kind) {
      case (#requestDeposits) {
        { accounts = [{ owner = canister; subaccount = DexLib.requestDepositAccount(canister).subaccount }]; excluded = 0 };
      };
      case (#mintFee) {
        { accounts = [{ owner = canister; subaccount = ?ProtocolFeesLib.MINT_FEE_ACCOUNT_SUBACCOUNT }]; excluded = 0 };
      };
      case (#protocolFees) {
        { accounts = [{ owner = canister; subaccount = ?ProtocolFeesLib.PROTOCOL_FEES_SUBACCOUNT }]; excluded = 0 };
      };
      case (#auctionDeposits) {
        { accounts = [{ owner = canister; subaccount = RetryLib.auctionCustodyAccount(canister, target.token).subaccount }]; excluded = 0 };
      };
      case (#dexHoldings) {
        let token = target.token;
        var excluded = 0;
        let accounts = List.empty<Account>();
        accounts.add({ owner = canister; subaccount = DexLib.custodyAccount(canister, token).subaccount });
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
        for (owner in owners.values()) {
          if (zeroedAccount(ctx, token, owner.toText())) {
            excluded += 1;
          } else {
            accounts.add({ owner = canister; subaccount = ?DexLib.userDepositSubaccount(owner) });
          };
        };
        for (pool in ctx.dex.dex.pools.values()) {
          if (isToken(pool.token0, token) or isToken(pool.token1, token)) {
            if (zeroedAccount(ctx, token, "P" # pool.id.toText())) {
              excluded += 1;
            } else {
              accounts.add({ owner = canister; subaccount = ?pool.subaccount });
            };
          };
        };
        if (token == #tttiT) {
          accounts.add({ owner = canister; subaccount = ?ProtocolFeesLib.INJECTION_SUBACCOUNT });
        };
        { accounts = accounts.toArray(); excluded };
      };
    };
  };

  // Ledger balance of one account. The error text is the exact text of the
  // failed ledger call.
  func readOne(ctx : ReserveContext, token : DexTypes.DexToken, account : Account) : async { #ok : Nat; #err : Text } {
    switch (token) {
      case (#tttiT) #ok(IcrcLib.balanceOf(ctx.dex.ledger, account));
      case (_) {
        let pay = switch (RetryLib.dexPayToken(token)) {
          case (?p) p;
          case null return #err("No ledger for token " # DexLib.tokenKey(token));
        };
        await PayTokenLib.balanceOf(PayTokenLib.ledger(pay), account);
      };
    };
  };

  // Fresh read of the whole ledger total of one compared account (used only to
  // confirm a shortfall).
  func readLedger(ctx : ReserveContext, target : Target) : async { #ok : Nat; #err : Text } {
    var total = 0;
    for (account in accountsOf(ctx, target).accounts.values()) {
      switch (await readOne(ctx, target.token, account)) {
        case (#ok(n)) { total += n };
        case (#err(e)) return #err(e);
      };
    };
    #ok(total);
  };

  // --- Operations in flight --------------------------------------------------

  func unsettled(status : DexTypes.DexTransferStatus) : Bool {
    switch (status) {
      case (#inProgress or #needsReview) true;
      case (_) false;
    };
  };

  // True while an operation that moves funds of `token` is running or
  // unresolved: DD / DW / DQ transfers and locks, router swaps, and fee and
  // injection processing. The token check is deferred then.
  public func tokenInFlight(ctx : ReserveContext, token : DexTypes.DexToken) : Bool {
    if (ctx.fees.locks.size() > 0 or ctx.router.locks.size() > 0) return true;
    let suffix = "/" # DexLib.tokenKey(token);
    for (k in ctx.dex.locks.values()) {
      if (k.startsWith(#text "DQ/")) {
        if (token == #tttiT) return true;
      } else if (k.endsWith(#text suffix)) {
        return true;
      };
    };
    // PTM-9e: deposits, withdrawals and swaps come from the in-flight index
    // (sweep transfers do not change the total of the account), never from
    // the whole history.
    InflightLib.syncTransfers(ctx.inflight, ctx.dex.transfers);
    var open = false;
    InflightLib.forEachOfToken(
      ctx.inflight,
      token,
      func(e : InflightTypes.Entry) {
        if (e.kind != #sweep) open := true;
      },
    );
    if (open) return true;
    if (token == #tttiT) {
      for (request in ctx.dex.dex.requests.values()) {
        switch (request.refundStatus) {
          case (#inProgress or #needsReview) return true;
          case (_) {};
        };
      };
    };
    if (token == #icp) {
      for (send in ctx.fees.store.dcSends.values()) {
        if (unsettled(send.status)) return true;
      };
      if (ctx.fees.store.dcLegs.size() > 0) return true;
    };
    false;
  };

  // --- Results ---------------------------------------------------------------

  func statusOf(owed : Nat, ledger : Nat) : Types.ReserveStatus {
    if (ledger == owed) #ok else if (ledger > owed) #surplus else #shortfall;
  };

  func accountResultOf(target : Target, owed : Nat, ledger : Nat, now : Int) : Types.AccountResult {
    {
      kind = target.kind;
      accountLabel = accountLabel(target.kind);
      token = target.token;
      ledgerBalance = ledger;
      owed;
      difference = ledger.toInt() - owed.toInt();
      status = statusOf(owed, ledger);
      checkedAt = now;
    };
  };

  func tokenResultOf(r : Types.AccountResult) : Types.TokenReserveResult {
    {
      token = r.token;
      internalTotal = r.owed;
      ledgerTotal = r.ledgerBalance;
      difference = r.difference;
      status = r.status;
    };
  };

  func upsert(results : [Types.TokenReserveResult], r : Types.TokenReserveResult) : [Types.TokenReserveResult] {
    let out = List.empty<Types.TokenReserveResult>();
    for (token in DexLib.DEX_TOKENS.values()) {
      if (token == r.token) {
        out.add(r);
      } else {
        for (x in results.values()) {
          if (x.token == token) out.add(x);
        };
      };
    };
    out.toArray();
  };

  // Replaces the result of the same account and token, in display order.
  func upsertAccount(results : [Types.AccountResult], r : Types.AccountResult) : [Types.AccountResult] {
    let out = List.empty<Types.AccountResult>();
    for (target in targets().values()) {
      if (target.kind == r.kind and target.token == r.token) {
        out.add(r);
      } else {
        for (x in results.values()) {
          if (x.kind == target.kind and x.token == target.token) out.add(x);
        };
      };
    };
    out.toArray();
  };

  func worstOf(statuses : [Types.ReserveStatus]) : ?Types.ReserveStatus {
    if (statuses.size() == 0) return null;
    if (statuses.any(func s = s == #shortfall)) return ?#shortfall;
    if (statuses.any(func s = s == #surplus)) return ?#surplus;
    ?#ok;
  };

  // Accounts with a shortfall in the last check. Before the first per-account
  // check the per-token results are used.
  public func shortfallCount(store : Types.DexReserveStore) : Nat {
    if (store.accounts.size() > 0) {
      return store.accounts.filter(func r = r.status == #shortfall).size();
    };
    switch (store.lastCheck) {
      case (?c) c.results.filter(func r = r.status == #shortfall).size();
      case null 0;
    };
  };

  // Worst status over all accounts of the last check (#shortfall, then
  // #surplus, else #ok).
  public func worstStatus(store : Types.DexReserveStore) : ?Types.ReserveStatus {
    if (store.accounts.size() > 0) {
      return worstOf(store.accounts.map(func r = r.status));
    };
    switch (store.lastCheck) {
      case (?c) worstOf(c.results.map(func r = r.status));
      case null null;
    };
  };

  func trim<T>(list : List.List<T>) {
    let size = list.size();
    if (size > MAX_HISTORY) {
      let all = list.toArray();
      list.clear();
      var i = 0;
      for (m in all.values()) {
        if (i + MAX_HISTORY >= size) list.add(m);
        i += 1;
      };
    };
  };

  func recordMismatch(store : Types.DexReserveStore, r : Types.AccountResult, now : Int) {
    var duplicate = false;
    for (m in store.accountHistory.values()) {
      // The latest record of the account and token with the same amounts is the same mismatch.
      if (m.kind == r.kind and m.token == r.token) {
        duplicate := m.owed == r.owed and m.ledgerBalance == r.ledgerBalance;
      };
    };
    if (duplicate) return;
    let id = switch (store.accountHistory.last()) {
      case (?m) m.id + 1;
      case null 0;
    };
    store.accountHistory.add({ id; at = now; kind = r.kind; accountLabel = r.accountLabel; token = r.token; owed = r.owed; ledgerBalance = r.ledgerBalance });
    trim(store.accountHistory);
    // The per-token history keeps the DEX holdings mismatches.
    if (r.kind == #dexHoldings) {
      let legacyId = switch (store.history.last()) {
        case (?m) m.id + 1;
        case null 0;
      };
      store.history.add({ id = legacyId; at = now; token = r.token; internalTotal = r.owed; ledgerTotal = r.ledgerBalance });
      trim(store.history);
    };
  };

  // --- Check -----------------------------------------------------------------

  // --- Check (PTM-9e: batched, persisted cursor) -----------------------------
  //
  // The synchronous core below moves the cursor and records the results; the
  // async driver further down feeds it with the ledger reads. Splitting the two
  // keeps the logic testable in the interpreter without a ledger.

  func resetCursor(run : BatchTypes.ReserveRun) {
    run.accountIndex := 0;
    run.partialLedger := 0;
    run.owedSnapshot := null;
  };

  func advanceTarget(run : BatchTypes.ReserveRun) {
    run.targetIndex += 1;
    resetCursor(run);
  };

  // Starts a new run (the previous summary is replaced).
  public func beginRun(batch : BatchTypes.BatchStore, now : Int) {
    let run = batch.reserve;
    run.active := true;
    run.runId += 1;
    run.startedAt := ?now;
    run.targetIndex := 0;
    resetCursor(run);
    run.accountsToCompare := 0;
    run.accountsCompared := 0;
    run.excludedZero := 0;
    run.unreadable := 0;
    run.batches := 0;
    run.totalBatches := 0;
  };

  // PTM-9f: a batch of the run starts. `batches` counts the batches started
  // (the batch being read, or the last one read between two ticks), so the
  // status reads "in progress (batch batches of totalBatches)". The alert is
  // never decided here: only finishRun decides it, at the end of the run.
  public func startBatch(batch : BatchTypes.BatchStore, now : Int) {
    let run = batch.reserve;
    if (not run.active) return;
    run.batches += 1;
    run.lastBatchAt := ?now;
    if (run.totalBatches < run.batches) {
      run.totalBatches := run.batches;
    };
  };

  // First step of a compared account: counts it, applies the zero exclusion and
  // the in-flight deferral, and takes the snapshot of its obligations. This is
  // the moment of the first ledger read: the snapshot is never taken earlier in
  // the run. `accountCount` = ledger accounts left to read after the exclusion.
  public func openTarget(batch : BatchTypes.BatchStore, accountCount : Nat, excluded : Nat, inFlight : Bool, owedNow : Nat) : { #skipped; #reading } {
    let run = batch.reserve;
    run.excludedZero += excluded;
    if (accountCount == 0) {
      advanceTarget(run);
      return #skipped;
    };
    run.accountsToCompare += 1;
    if (inFlight) {
      run.unreadable += 1;
      advanceTarget(run);
      return #skipped;
    };
    run.owedSnapshot := ?owedNow;
    run.partialLedger := 0;
    run.accountIndex := 0;
    // PTM-9f: estimate of the batches of the whole run: those already started
    // before this one, plus ceil((ledger accounts of this target + one read per
    // later target) / batchSize). Only ever raised; finishRun fixes the exact
    // number.
    let size = Nat.max(1, batch.batchSize);
    let later = Nat.sub(targets().size(), Nat.min(targets().size(), run.targetIndex + 1));
    let before = if (run.batches > 0) run.batches - 1 else 0;
    let estimate = before + (accountCount + later + size - 1) / size;
    if (run.totalBatches < estimate) {
      run.totalBatches := estimate;
    };
    #reading;
  };

  // One ledger balance of the current compared account has been read.
  public func recordBalance(batch : BatchTypes.BatchStore, balance : Nat) {
    let run = batch.reserve;
    run.partialLedger += balance;
    run.accountIndex += 1;
  };

  // The current compared account could not be compared (failed read, in flight).
  public func skipTarget(batch : BatchTypes.BatchStore) {
    let run = batch.reserve;
    run.unreadable += 1;
    advanceTarget(run);
  };

  // The error of the run in progress, if any (first one wins).
  func runError(store : Types.DexReserveStore, run : BatchTypes.ReserveRun) : ?Types.LastError {
    switch (store.lastCheck, run.startedAt) {
      case (?c, ?started) {
        switch (c.error) {
          case (?e) { if (e.at >= started) ?e else null };
          case null null;
        };
      };
      case _ null;
    };
  };

  func noteError(store : Types.DexReserveStore, run : BatchTypes.ReserveRun, message : Text, now : Int) {
    if (runError(store, run) != null) return;
    let prev = store.lastCheck;
    store.lastCheck := ?{
      checkedAt = now;
      results = switch (prev) { case (?c) c.results; case null [] };
      lastSuccessAt = switch (prev) { case (?c) c.lastSuccessAt; case null null };
      error = ?{ message; at = now };
    };
  };

  // Compares the current compared account with the snapshot taken when its
  // balance was read. A ledger total below the snapshot is a shortfall only
  // after a second read: #needsConfirm asks the driver for it (a fresh
  // snapshot `owed` and a fresh total `ledger`, passed back as `confirm`).
  // Records the result, the mismatch and the pause, and moves to the next
  // compared account.
  public func compareTarget(
    batch : BatchTypes.BatchStore,
    store : Types.DexReserveStore,
    target : Target,
    now : Int,
    confirm : ?{ owed : Nat; ledger : Nat },
  ) : { #needsConfirm; #compared : Types.AccountResult } {
    let run = batch.reserve;
    let snapshot = switch (run.owedSnapshot) { case (?o) o; case null 0 };
    var owed = snapshot;
    var ledger = run.partialLedger;
    switch (confirm) {
      case (?c) {
        owed := c.owed;
        ledger := c.ledger;
      };
      case null { if (ledger < owed) return #needsConfirm };
    };
    let r = accountResultOf(target, owed, ledger, now);
    store.accounts := upsertAccount(store.accounts, r);
    if (target.kind == #dexHoldings) {
      let prev = store.lastCheck;
      store.lastCheck := ?{
        checkedAt = switch (prev) { case (?c) c.checkedAt; case null now };
        results = upsert(switch (prev) { case (?c) c.results; case null [] }, tokenResultOf(r));
        lastSuccessAt = switch (prev) { case (?c) c.lastSuccessAt; case null null };
        error = switch (prev) { case (?c) c.error; case null null };
      };
    };
    run.accountsCompared += 1;
    if (r.status == #shortfall) {
      recordMismatch(store, r, now);
      if (not store.pause.paused) {
        store.pause.paused := true;
        store.pause.reason := ?{ token = r.token; internalTotal = r.owed; ledgerTotal = r.ledgerBalance; at = now };
        store.pauseAccount := ?{ kind = r.kind; accountLabel = r.accountLabel; token = r.token };
      };
    };
    advanceTarget(run);
    #compared(r);
  };

  // Ends the run. Zero accounts compared while there were accounts to compare
  // raises the visible alert (never a silent success); a run that compares at
  // least one account clears it. A run with nothing to compare raises nothing.
  public func finishRun(batch : BatchTypes.BatchStore, store : Types.DexReserveStore, now : Int) {
    let run = batch.reserve;
    if (not run.active) return;
    run.active := false;
    run.lastBatchAt := ?now;
    // PTM-9f: the run is complete: the total is the number of batches taken.
    if (run.batches > 0) {
      run.totalBatches := run.batches;
    };
    let failed = runError(store, run);
    if (run.accountsToCompare > 0 and run.accountsCompared == 0) {
      let id = batch.nextAlertId;
      batch.nextAlertId += 1;
      let alert : BatchTypes.ReserveAlert = {
        id;
        at = now;
        runId = run.runId;
        accountsToCompare = run.accountsToCompare;
        accountsCompared = 0;
        message = "Reserve check #" # run.runId.toText() # " compared 0 of " # run.accountsToCompare.toText() # " accounts (" # run.unreadable.toText() # " left uncompared: read failed or operations in flight). The reserve was not verified.";
      };
      batch.alert := ?alert;
      batch.alertHistory.add(alert);
      trim(batch.alertHistory);
    } else if (run.accountsCompared > 0) {
      batch.alert := null;
    };
    if (run.accountsCompared > 0 or failed != null) {
      let prev = store.lastCheck;
      store.lastCheck := ?{
        checkedAt = now;
        results = switch (prev) { case (?c) c.results; case null [] };
        lastSuccessAt = if (failed == null) ?now else (switch (prev) { case (?c) c.lastSuccessAt; case null null });
        error = failed;
      };
    };
  };

  // --- Async driver ----------------------------------------------------------

  // Reads up to `budget` ledger balances of the current compared account and
  // moves the cursor; compares the account once all of them are read. Returns
  // the number of ledger reads made.
  func stepTarget(ctx : ReserveContext, target : Target, budget : Nat) : async Nat {
    let run = ctx.batch.reserve;
    let id = run.runId;
    let token = target.token;
    let errPrefix = accountLabel(target.kind) # " " # DexLib.tokenKey(token) # ": ";
    if (run.owedSnapshot == null) {
      let listing = accountsOf(ctx, target);
      // The snapshot is taken here, in the same step as the first read.
      switch (openTarget(ctx.batch, listing.accounts.size(), listing.excluded, tokenInFlight(ctx, token), owedOf(ctx, target))) {
        case (#skipped) return 0;
        case (#reading) {};
      };
    };
    let accounts = accountsOf(ctx, target).accounts;
    var used = 0;
    while (used < budget and run.accountIndex < accounts.size()) {
      switch (await readOne(ctx, token, accounts[run.accountIndex])) {
        case (#ok(n)) {
          if (run.runId != id) return used;
          recordBalance(ctx.batch, n);
          used += 1;
        };
        case (#err(e)) {
          if (run.runId != id) return used;
          noteError(ctx.store, run, errPrefix # e, Time.now());
          skipTarget(ctx.batch);
          return used + 1;
        };
      };
    };
    // Rest of the accounts at the next tick.
    if (run.accountIndex < accounts.size()) return used;
    switch (compareTarget(ctx.batch, ctx.store, target, Time.now(), null)) {
      case (#compared(_)) return used;
      case (#needsConfirm) {};
    };
    // Possible shortfall: a second, fresh snapshot and a second full read.
    if (tokenInFlight(ctx, token)) {
      skipTarget(ctx.batch);
      return used;
    };
    let fresh = owedOf(ctx, target);
    let second = await readLedger(ctx, target);
    if (run.runId != id) return used;
    switch (second) {
      case (#err(e)) {
        noteError(ctx.store, run, errPrefix # e, Time.now());
        skipTarget(ctx.batch);
      };
      case (#ok(ledger)) {
        ignore compareTarget(ctx.batch, ctx.store, target, Time.now(), ?{ owed = fresh; ledger });
      };
    };
    used + 1;
  };

  // One batch: up to batchSize ledger reads, then the cursor is stored and the
  // next tick resumes. Finishes the run when the last compared account is done.
  func reserveBatch(ctx : ReserveContext) : async () {
    let run = ctx.batch.reserve;
    startBatch(ctx.batch, Time.now());
    let all = targets();
    var budget = if (ctx.batch.batchSize == 0) 1 else ctx.batch.batchSize;
    var rounds = 0;
    while (run.active and budget > 0 and rounds < 128) {
      rounds += 1;
      if (run.targetIndex >= all.size()) {
        finishRun(ctx.batch, ctx.store, Time.now());
      } else {
        let used = await stepTarget(ctx, all[run.targetIndex], budget);
        budget := Nat.sub(budget, Nat.min(used, budget));
      };
    };
    if (run.active and run.targetIndex >= all.size()) {
      finishRun(ctx.batch, ctx.store, Time.now());
    };
  };

  // One check at a time. A lock left by a trap expires after LOCK_EXPIRY_NS.
  func takeLock(ctx : ReserveContext) : Bool {
    let now = Time.now();
    if (ctx.lock.busy) {
      let stale = switch (ctx.batch.reserve.lastBatchAt) {
        case (?t) now - t > LOCK_EXPIRY_NS;
        case null false;
      };
      if (not stale) return false;
    };
    ctx.lock.busy := true;
    ctx.batch.reserve.lastBatchAt := ?now;
    true;
  };

  // Continues the run in progress, or starts a new one (also when the active
  // run is older than RUN_MAX_AGE_NS).
  func ensureRun(ctx : ReserveContext) {
    let run = ctx.batch.reserve;
    let stale = switch (run.startedAt) {
      case (?s) Time.now() - s > RUN_MAX_AGE_NS;
      case null true;
    };
    if (not run.active or stale) beginRun(ctx.batch, Time.now());
  };

  func checkView(ctx : ReserveContext) : Types.ReserveCheckView {
    let now = Time.now();
    switch (ctx.store.lastCheck) {
      case (?c) {
        { checkedAt = c.checkedAt; results = c.results; lastSuccessAt = c.lastSuccessAt; error = c.error; accounts = ctx.store.accounts; progress = progressOf(ctx) };
      };
      case null {
        { checkedAt = now; results = []; lastSuccessAt = null; error = null; accounts = ctx.store.accounts; progress = progressOf(ctx) };
      };
    };
  };

  // On demand and timer entry: reads ONE batch of ledger accounts and keeps the
  // cursor; the next call (or the continuation timer) resumes it. One check at
  // a time (the check lock).
  public func runCheck(ctx : ReserveContext) : async Result.Result<Types.ReserveCheckView, Types.DexReserveError> {
    if (not takeLock(ctx)) return #err(#checkInProgress);
    try {
      ensureRun(ctx);
      await reserveBatch(ctx);
      #ok(checkView(ctx));
    } finally {
      ctx.lock.busy := false;
    };
  };

  // Clears the pause after a fresh check (a new run taken to the end) finds no
  // shortfall.
  public func resume(ctx : ReserveContext, caller : Principal) : async Result.Result<Types.DexPauseView, Types.DexReserveError> {
    if (not ctx.store.pause.paused) return #err(#notPaused);
    if (not takeLock(ctx)) return #err(#checkInProgress);
    try {
      let run = ctx.batch.reserve;
      beginRun(ctx.batch, Time.now());
      var batches = 0;
      while (run.active and batches < MAX_BATCHES_PER_CALL) {
        await reserveBatch(ctx);
        batches += 1;
      };
      if (run.active) return #err(#checkFailed("The reserve check did not finish; try again"));
      switch (runError(ctx.store, run)) {
        case (?e) return #err(#checkFailed(e.message));
        case null {};
      };
      if (run.accountsCompared == 0) {
        return #err(#checkFailed("DEX operations are in flight; no token could be re-checked now"));
      };
      for (r in ctx.store.accounts.values()) {
        if (r.status == #shortfall) {
          return #err(#checkFailed("Shortfall remains on " # r.accountLabel # " " # DexLib.tokenKey(r.token) # ": ledger " # r.ledgerBalance.toText() # ", owed " # r.owed.toText()));
        };
      };
      ctx.store.pause.paused := false;
      ctx.store.pause.resumed := ?{ by = caller; at = Time.now() };
      #ok(pauseView(ctx.store));
    } finally {
      ctx.lock.busy := false;
    };
  };

  // --- Views -----------------------------------------------------------------

  public func pauseView(store : Types.DexReserveStore) : Types.DexPauseView {
    { paused = store.pause.paused; reason = store.pause.reason; resumed = store.pause.resumed; account = store.pauseAccount };
  };

  public func publicPause(store : Types.DexReserveStore) : Types.PublicDexPause {
    {
      paused = store.pause.paused;
      reasonToken = if (store.pause.paused) {
        switch (store.pause.reason) {
          case (?r) ?r.token;
          case null null;
        };
      } else null;
    };
  };

  // PTM-9e: the cursor of the batched run, for the status views.
  public func progressView(batch : BatchTypes.BatchStore) : BatchTypes.ReserveProgress {
    let r = batch.reserve;
    let phase : BatchTypes.ReservePhase = if (r.active) #inProgress else if (r.runId > 0) #finished else #idle;
    {
      phase;
      // Batches started: the batch being read (or the last one read between two
      // ticks) while in progress, at least 1; the batches of the run once done.
      batch = if (r.active) Nat.max(1, r.batches) else r.batches;
      totalBatches = r.totalBatches;
      alertDecided = not r.active and r.runId > 0;
      active = r.active;
      runId = r.runId;
      startedAt = r.startedAt;
      targetIndex = r.targetIndex;
      targetCount = targets().size();
      accountIndex = r.accountIndex;
      accountsToCompare = r.accountsToCompare;
      accountsCompared = r.accountsCompared;
      excludedZero = r.excludedZero;
      unreadable = r.unreadable;
      batchSize = batch.batchSize;
      lastBatchAt = r.lastBatchAt;
    };
  };

  public func progressOf(ctx : ReserveContext) : BatchTypes.ReserveProgress = progressView(ctx.batch);

  // PTM-9f: state of the daily re-read of the excluded accounts.
  public func rereadView(batch : BatchTypes.BatchStore) : BatchTypes.ExcludedRereadProgress {
    let r = batch.reread;
    {
      active = r.active;
      runId = r.runId;
      startedAt = r.startedAt;
      excludedCount = batch.zeroed.size();
      read = r.read;
      reincluded = r.reincluded;
      unreadable = r.unreadable;
      batchSize = batch.batchSize;
      lastBatchAt = r.lastBatchAt;
      lastFinishedAt = r.lastFinishedAt;
      nextRunAt = switch (r.lastFinishedAt) {
        case (?t) ?(t + BatchTypes.REREAD_INTERVAL_NS);
        case null null;
      };
    };
  };

  // PTM-9e: gains `batch` (progress and alert).
  public func status(store : Types.DexReserveStore, lock : Types.CheckLock, batch : BatchTypes.BatchStore) : Types.DexReserveStatus {
    {
      lastCheck = store.lastCheck;
      unresolvedShortfallCount = shortfallCount(store);
      checkInProgress = lock.busy;
      pause = pauseView(store);
      history = store.history.toArray();
      accounts = store.accounts;
      accountHistory = store.accountHistory.toArray();
      progress = progressView(batch);
      alert = batch.alert;
      excludedReread = rereadView(batch);
    };
  };

  // Hourly timer (starts a run) and a one-minute continuation timer (resumes
  // an active run at the next batch), both re-armed on every install and
  // upgrade (main.mo).
  public func startReserveTimer<system>(ctx : ReserveContext) {
    ignore Timer.recurringTimer<system>(
      #seconds CHECK_INTERVAL_SECONDS,
      func() : async () {
        try {
          ignore await runCheck(ctx);
        } catch (_) {};
      },
    );
    ignore Timer.recurringTimer<system>(
      #seconds RESUME_INTERVAL_SECONDS,
      func() : async () {
        if (ctx.batch.reserve.active) {
          try {
            ignore await runCheck(ctx);
          } catch (_) {};
        };
      },
    );
  };
};
