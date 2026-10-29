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
import DexLib "dex";
import IcrcLib "icrc";
import PayTokenLib "pay-token";
import ProtocolFeesLib "protocol-fees";
import RetryLib "retry";
import RouterLib "router";

// DEX lot 6: reserve check (internal DEX totals against the real ledger
// balances of the DEX-controlled accounts) and the DEX-specific pause.
// Reserves are bookkeeping only, so the comparison is made per token over the
// whole set of DEX accounts, never per account. Nothing here corrects a
// difference, sends an alert or touches the sale.
module {
  // Hourly check.
  public let CHECK_INTERVAL_SECONDS : Nat = 3600;
  // Short mismatch history.
  public let MAX_HISTORY : Nat = 50;

  // Everything the check reads (references, no copy). Transient.
  public type ReserveContext = {
    store : Types.DexReserveStore;
    lock : Types.CheckLock;
    dex : RetryLib.DexContext;
    fees : ProtocolFeesLib.ProtocolFeeContext;
    router : RouterLib.RouterContext;
  };

  type Account = { owner : Principal; subaccount : ?Blob };

  type Outcome = {
    check : Types.ReserveCheck;
    fresh : Bool; // at least one token was compared during this attempt
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

  // User balances (available + reserved), pool reserves, protocol fees, the
  // router set-aside, the request deposits (TTTI-T) and the ICP held in the
  // protocol fee account.
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
      if (isToken(pool.token0, token)) {
        total += pool.reserve0 + pool.protocolFee0;
      };
      if (isToken(pool.token1, token)) {
        total += pool.reserve1 + pool.protocolFee1;
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
    if (token == #tttiT) {
      total += heldRequestDeposits(ctx);
    };
    if (token == #icp) {
      total += ctx.fees.store.cyclesHeldE8s;
    };
    total;
  };

  // --- Ledger accounts and balances ------------------------------------------

  // Every DEX-controlled account that can hold `token`.
  func accountsOf(ctx : ReserveContext, token : DexTypes.DexToken) : [Account] {
    let canister = ctx.dex.canister;
    let accounts = List.empty<Account>();
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
      accounts.add({ owner = canister; subaccount = ?DexLib.userDepositSubaccount(owner) });
    };
    for (pool in ctx.dex.dex.pools.values()) {
      if (isToken(pool.token0, token) or isToken(pool.token1, token)) {
        accounts.add({ owner = canister; subaccount = ?pool.subaccount });
      };
    };
    if (token == #tttiT) {
      accounts.add({ owner = canister; subaccount = DexLib.requestDepositAccount(canister).subaccount });
      accounts.add({ owner = canister; subaccount = ?ProtocolFeesLib.INJECTION_SUBACCOUNT });
    };
    if (token == #icp) {
      accounts.add({ owner = canister; subaccount = ?ProtocolFeesLib.PROTOCOL_FEES_SUBACCOUNT });
    };
    accounts.toArray();
  };

  // Fresh read of the ledger total of `token` over the DEX accounts. The
  // error text is the exact text of the failed ledger call.
  func readLedger(ctx : ReserveContext, token : DexTypes.DexToken) : async { #ok : Nat; #err : Text } {
    let accounts = accountsOf(ctx, token);
    var total = 0;
    switch (token) {
      case (#tttiT) {
        for (account in accounts.values()) {
          total += IcrcLib.balanceOf(ctx.dex.ledger, account);
        };
        #ok(total);
      };
      case (_) {
        let pay = switch (RetryLib.dexPayToken(token)) {
          case (?p) p;
          case null return #err("No ledger for token " # DexLib.tokenKey(token));
        };
        let ledger = PayTokenLib.ledger(pay);
        for (account in accounts.values()) {
          switch (await PayTokenLib.balanceOf(ledger, account)) {
            case (#ok(n)) { total += n };
            case (#err(e)) return #err(e);
          };
        };
        #ok(total);
      };
    };
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
    for (t in ctx.dex.transfers.deposits.values()) {
      if (t.token == token and unsettled(t.status)) return true;
    };
    for (t in ctx.dex.transfers.withdrawals.values()) {
      if (t.token == token and unsettled(t.status)) return true;
    };
    if (token == #tttiT) {
      for (request in ctx.dex.dex.requests.values()) {
        switch (request.refundStatus) {
          case (#inProgress or #needsReview) return true;
          case (_) {};
        };
      };
    };
    for (swap in ctx.router.store.swaps.values()) {
      let open = switch (swap.status) {
        case (#inProgress or #needsReview) true;
        case (_) false;
      };
      if (open and (swap.tokenIn == token or swap.tokenOut == token)) return true;
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

  func resultOf(token : DexTypes.DexToken, internal : Nat, ledger : Nat) : Types.TokenReserveResult {
    {
      token;
      internalTotal = internal;
      ledgerTotal = ledger;
      difference = ledger.toInt() - internal.toInt();
      status = if (ledger == internal) #ok else if (ledger > internal) #surplus else #shortfall;
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

  public func shortfallCount(store : Types.DexReserveStore) : Nat {
    switch (store.lastCheck) {
      case (?c) c.results.filter(func r = r.status == #shortfall).size();
      case null 0;
    };
  };

  // Worst status of the last check (#shortfall, then #surplus, else #ok).
  public func worstStatus(store : Types.DexReserveStore) : ?Types.ReserveStatus {
    switch (store.lastCheck) {
      case (?c) {
        if (c.results.size() == 0) return null;
        if (c.results.any(func r = r.status == #shortfall)) return ?#shortfall;
        if (c.results.any(func r = r.status == #surplus)) return ?#surplus;
        ?#ok;
      };
      case null null;
    };
  };

  func recordMismatch(store : Types.DexReserveStore, r : Types.TokenReserveResult, now : Int) {
    var duplicate = false;
    for (m in store.history.values()) {
      // The latest record of the token with the same amounts is the same mismatch.
      if (m.token == r.token) {
        duplicate := m.internalTotal == r.internalTotal and m.ledgerTotal == r.ledgerTotal;
      };
    };
    if (duplicate) return;
    let id = switch (store.history.last()) {
      case (?m) m.id + 1;
      case null 0;
    };
    store.history.add({ id; at = now; token = r.token; internalTotal = r.internalTotal; ledgerTotal = r.ledgerTotal });
    let size = store.history.size();
    if (size > MAX_HISTORY) {
      let all = store.history.toArray();
      store.history.clear();
      var i = 0;
      for (m in all.values()) {
        if (i + MAX_HISTORY >= size) store.history.add(m);
        i += 1;
      };
    };
  };

  // --- Check -----------------------------------------------------------------

  func check(ctx : ReserveContext) : async Outcome {
    let now = Time.now();
    let previous = ctx.store.lastCheck;
    var results : [Types.TokenReserveResult] = switch (previous) {
      case (?c) c.results;
      case null [];
    };
    var errorText : ?Text = null;
    let confirmed = List.empty<Types.TokenReserveResult>();
    var compared = 0;
    for (token in DexLib.DEX_TOKENS.values()) {
      if (not tokenInFlight(ctx, token)) {
        let internal = internalTotal(ctx, token);
        switch (await readLedger(ctx, token)) {
          case (#err(e)) {
            if (errorText == null) errorText := ?(DexLib.tokenKey(token) # ": " # e);
          };
          case (#ok(first)) {
            // Funds moved during the read: not a mismatch, check again later.
            var usable = not tokenInFlight(ctx, token) and internalTotal(ctx, token) == internal;
            var ledgerTotal = first;
            // A shortfall counts only after a second fresh ledger read.
            if (usable and first < internal) {
              switch (await readLedger(ctx, token)) {
                case (#err(e)) {
                  usable := false;
                  if (errorText == null) errorText := ?(DexLib.tokenKey(token) # ": " # e);
                };
                case (#ok(second)) {
                  usable := not tokenInFlight(ctx, token) and internalTotal(ctx, token) == internal;
                  ledgerTotal := second;
                };
              };
            };
            if (usable) {
              let r = resultOf(token, internal, ledgerTotal);
              results := upsert(results, r);
              compared += 1;
              if (r.status == #shortfall) confirmed.add(r);
            };
          };
        };
      };
    };
    if (compared == 0 and errorText == null) {
      let unchanged : Types.ReserveCheck = switch (previous) {
        case (?c) c;
        case null { { checkedAt = now; results = []; lastSuccessAt = null; error = null } };
      };
      return { check = unchanged; fresh = false };
    };
    let lastSuccessAt = switch (errorText) {
      case null ?now;
      case (_) { switch (previous) { case (?c) c.lastSuccessAt; case null null } };
    };
    let updated : Types.ReserveCheck = {
      checkedAt = now;
      results;
      lastSuccessAt;
      error = switch (errorText) {
        case (?message) ?{ message; at = now };
        case null null;
      };
    };
    ctx.store.lastCheck := ?updated;
    for (r in confirmed.values()) {
      recordMismatch(ctx.store, r, now);
      if (not ctx.store.pause.paused) {
        ctx.store.pause.paused := true;
        ctx.store.pause.reason := ?{ token = r.token; internalTotal = r.internalTotal; ledgerTotal = r.ledgerTotal; at = now };
      };
    };
    { check = updated; fresh = true };
  };

  // On demand and timer entry. One check at a time (the check lock).
  public func runCheck(ctx : ReserveContext) : async Result.Result<Types.ReserveCheck, Types.DexReserveError> {
    if (ctx.lock.busy) return #err(#checkInProgress);
    ctx.lock.busy := true;
    try {
      let outcome = await check(ctx);
      #ok(outcome.check);
    } finally {
      ctx.lock.busy := false;
    };
  };

  // Clears the pause after a fresh check finds no shortfall.
  public func resume(ctx : ReserveContext, caller : Principal) : async Result.Result<Types.DexPauseView, Types.DexReserveError> {
    if (not ctx.store.pause.paused) return #err(#notPaused);
    if (ctx.lock.busy) return #err(#checkInProgress);
    ctx.lock.busy := true;
    try {
      let outcome = await check(ctx);
      switch (outcome.check.error) {
        case (?e) return #err(#checkFailed(e.message));
        case null {};
      };
      if (not outcome.fresh) {
        return #err(#checkFailed("DEX operations are in flight; no token could be re-checked now"));
      };
      for (r in outcome.check.results.values()) {
        if (r.status == #shortfall) {
          return #err(#checkFailed("Shortfall remains on " # DexLib.tokenKey(r.token) # ": ledger " # r.ledgerTotal.toText() # ", internal " # r.internalTotal.toText()));
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
    { paused = store.pause.paused; reason = store.pause.reason; resumed = store.pause.resumed };
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

  public func status(store : Types.DexReserveStore, lock : Types.CheckLock) : Types.DexReserveStatus {
    {
      lastCheck = store.lastCheck;
      unresolvedShortfallCount = shortfallCount(store);
      checkInProgress = lock.busy;
      pause = pauseView(store);
      history = store.history.toArray();
    };
  };

  // Hourly timer, re-armed on every install and upgrade (main.mo).
  public func startReserveTimer<system>(ctx : ReserveContext) {
    ignore Timer.recurringTimer<system>(
      #seconds CHECK_INTERVAL_SECONDS,
      func() : async () {
        try {
          ignore await runCheck(ctx);
        } catch (_) {};
      },
    );
  };
};
