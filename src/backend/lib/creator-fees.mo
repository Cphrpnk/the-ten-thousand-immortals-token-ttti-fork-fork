import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Types "../types/creator-fees";
import PayTypes "../types/pay-token";
import DexLib "dex";
import RetryLib "retry";
import IcrcLib "icrc";

// PTM-4: creator holdings. Credits are recorded per DEX token with a source;
// the funds stay in the contract's DEX custody until payout (so a credit moves
// no ledger funds and never rewrites a balance or block). A payout sends the
// whole held amount from the token's custody account to the receiving wallet
// configured for the token (TTTI-T is paid to the ICP wallet), through
// lib/retry.mo: recorded before the first await, memo TTTI-CF-<n> (renewals
// "-<m>"), created_at_time, identical resend for 23 h, then To review.
module {
  public type CreatorFeeStore = Types.CreatorFeeStore;
  public type CreatorFeeSource = Types.CreatorFeeSource;
  public type CreatorHoldingsView = Types.CreatorHoldingsView;
  public type PayoutResult = Types.PayoutResult;

  // Everything the payout and its retries need (references). Transient.
  public type CreatorFeeContext = {
    store : Types.CreatorFeeStore;
    dex : RetryLib.DexContext;
    // Receiving wallet configured per pay token (SettlementLib.walletOf).
    walletOf : PayTypes.PayToken -> ?Types.Account;
  };

  func sat(a : Nat, b : Nat) : Nat = if (a > b) a - b else 0;

  func emptyTotals(token : Types.DexToken) : Types.CreatorTokenTotals {
    { token; swapFeeShare = 0; routerShare = 0; mintFee = 0; buybackFee = 0; transferFee = 0; paidOut = 0; inFlight = 0; lastCreditAt = null };
  };

  func totalsOf(store : Types.CreatorFeeStore, token : Types.DexToken) : Types.CreatorTokenTotals {
    store.totals.get(DexLib.tokenKey(token)) ?? emptyTotals(token);
  };

  func creditedOf(t : Types.CreatorTokenTotals) : Nat = t.swapFeeShare + t.routerShare + t.mintFee + t.buybackFee + t.transferFee;

  // Amount credited and neither paid out nor in a payout in flight.
  public func held(store : Types.CreatorFeeStore, token : Types.DexToken) : Nat {
    let t = totalsOf(store, token);
    sat(creditedOf(t), t.paidOut + t.inFlight);
  };

  // Credits `amount` of `token` to the creator's holdings with its source.
  // Synchronous accounting only: the funds already sit in DEX custody.
  public func credit(store : Types.CreatorFeeStore, token : Types.DexToken, amount : Nat, source : Types.CreatorFeeSource, now : Int) {
    if (amount == 0) return;
    let t = totalsOf(store, token);
    let next = switch (source) {
      case (#swapFeeShare) { { t with swapFeeShare = t.swapFeeShare + amount } };
      case (#routerShare) { { t with routerShare = t.routerShare + amount } };
      case (#mintFee) { { t with mintFee = t.mintFee + amount } };
      case (#buybackFee) { { t with buybackFee = t.buybackFee + amount } };
      case (#transferFee) { { t with transferFee = t.transferFee + amount } };
    };
    store.totals.add(DexLib.tokenKey(token), { next with lastCreditAt = ?now });
  };

  // PTM-9b: the TTTI-T transfer fees really go to the creator. The whole
  // fee collector balance moves, on the TTTI-T ledger, to the TTTI-T DEX
  // custody (fee-0 block, nothing minted) and the creator holdings are credited
  // with source #transferFee, in one synchronous block (like the other creator
  // credits, the funds are held in custody until payout, with no internal balance). After that the fee
  // collector holds nothing: the fees are never part of the TTTI-T available
  // at the mint. Returns the amount credited.
  public func collectTransferFees(store : Types.CreatorFeeStore, ledger : IcrcLib.Ledger, canister : Principal, now : Int) : Nat {
    let moved = IcrcLib.sweepFeeCollector(ledger, canister, DexLib.custodyAccount(canister, #tttiT));
    if (moved == 0) return 0;
    credit(store, #tttiT, moved, #transferFee, now);
    moved;
  };

  // Amount of `token` owed to the creator (held + in flight), for the DEX
  // reserve comparison: the funds are part of the DEX custody balances.
  public func owed(store : Types.CreatorFeeStore, token : Types.DexToken) : Nat {
    let t = totalsOf(store, token);
    sat(creditedOf(t), t.paidOut);
  };

  func payoutView(p : Types.CreatorPayout) : Types.CreatorPayoutView {
    {
      n = p.n;
      symbol = DexLib.tokenSymbol(p.token);
      grossAmount = p.grossAmount;
      netAmount = p.netAmount;
      createdAt = p.createdAt;
      memoText = p.attempt.memo.decodeUtf8() ?? "";
      status = p.status;
    };
  };

  // Public view: every DEX token (zero rows included), the TTTI-T balance of
  // the fee collector account (read only) and the last 20 payouts.
  public func holdingsView(ctx : CreatorFeeContext) : Types.CreatorHoldingsView {
    let tokens = DexLib.DEX_TOKENS.map(
      func(token : Types.DexToken) : Types.CreatorTokenView {
        let t = totalsOf(ctx.store, token);
        {
          token;
          symbol = DexLib.tokenSymbol(token);
          held = sat(creditedOf(t), t.paidOut + t.inFlight);
          paidOut = t.paidOut;
          inFlight = t.inFlight;
          swapFeeShare = t.swapFeeShare;
          routerShare = t.routerShare;
          mintFee = t.mintFee;
          buybackFee = t.buybackFee;
          transferFee = t.transferFee;
          lastCreditAt = t.lastCreditAt;
        };
      }
    );
    let sorted = ctx.store.payouts.values().toArray().sort(func(a, b) = Nat.compare(b.n, a.n));
    let recent = if (sorted.size() > 20) sorted.sliceToArray(0, 20) else sorted;
    {
      tokens;
      transferFeeCollectorE8s = IcrcLib.feeCollectorBalance(ctx.dex.ledger, ctx.dex.canister);
      payouts = recent.map(payoutView);
    };
  };

  // --- Payout ------------------------------------------------------------------

  func lockKey(token : Types.DexToken) : Text = "CF-" # DexLib.tokenKey(token);

  // Closes a payout in flight: `paid` moves its gross amount to paidOut,
  // otherwise it returns to the held amount. Only an open payout is closed.
  func close(ctx : CreatorFeeContext, p : Types.CreatorPayout, attempt : Types.DexTransferAttempt, status : Types.DexTransferStatus) {
    let open = switch (p.status) {
      case (#inProgress) true;
      case (#needsReview) true;
      case (_) false;
    };
    if (not open) return;
    let t = totalsOf(ctx.store, p.token);
    let paid = switch (status) {
      case (#completed(_)) true;
      case (_) false;
    };
    ctx.store.totals.add(
      DexLib.tokenKey(p.token),
      { t with inFlight = sat(t.inFlight, p.grossAmount); paidOut = t.paidOut + (if (paid) p.grossAmount else 0) },
    );
    ctx.store.payouts.add(p.n, { p with attempt; status });
  };

  // Applies the outcome of a send to the recorded payout.
  func settle(ctx : CreatorFeeContext, n : Nat, sent : Types.DexTransferAttempt) {
    let p = switch (ctx.store.payouts.get(n)) {
      case (?p) p;
      case null return;
    };
    switch (sent.outcome) {
      case (#succeeded(block)) { close(ctx, p, sent, #completed(block)) };
      case (#failed(reason)) { close(ctx, p, sent, #failed(reason)) };
      case (_) { ctx.store.payouts.add(n, { p with attempt = sent }) };
    };
  };

  func isOpen(p : Types.CreatorPayout) : Bool {
    switch (p.status) {
      case (#inProgress) true;
      case (#needsReview) true;
      case (_) false;
    };
  };

  // Admin payout of the whole held amount of `token` to its receiving wallet
  // (the ledger fee is taken from the amount). One open payout per token.
  public func payout(ctx : CreatorFeeContext, token : Types.DexToken, now : Int) : async Types.PayoutResult {
    if (ctx.dex.pause.paused) return #err(#paused);
    // PTM-9b: the transfer fees collected so far are credited first.
    ignore collectTransferFees(ctx.store, ctx.dex.ledger, ctx.dex.canister, now);
    let key = lockKey(token);
    if (ctx.dex.locks.contains(key)) return #err(#payoutInProgress);
    for (p in ctx.store.payouts.values()) {
      if (p.token == token and isOpen(p)) return #err(#payoutInProgress);
    };
    let pay = switch (RetryLib.dexPayToken(token)) {
      case (?p) p;
      case null #icp; // TTTI-T is paid to the ICP wallet account
    };
    let wallet = switch (ctx.walletOf(pay)) {
      case (?w) w;
      case null return #err(#noWallet);
    };
    let amount = held(ctx.store, token);
    if (amount == 0) return #err(#nothingToPay);
    let fee = RetryLib.dexFee(ctx.dex, token);
    if (amount <= fee) return #err(#belowFee({ held = amount; fee }));
    // Recorded before the first await: the amount leaves the held balance. The
    // send debits amount + fee from the custody, so amount = gross - fee keeps
    // the custody exact.
    let request = { token; from = DexLib.custodyAccount(ctx.dex.canister, token); to = wallet; amount = amount - fee; fee = ?fee };
    let attempt = RetryLib.newDexAttempt(ctx.dex.retry, #CF, null, request, RetryLib.dexNow());
    let record : Types.CreatorPayout = { n = attempt.n; token; grossAmount = amount; netAmount = amount - fee; wallet; createdAt = now; attempt; status = #inProgress };
    let t = totalsOf(ctx.store, token);
    ctx.store.totals.add(DexLib.tokenKey(token), { t with inFlight = t.inFlight + amount });
    ctx.store.payouts.add(record.n, record);
    ctx.dex.locks.add(key);
    try {
      let sent = await RetryLib.sendDexAttempt(ctx.dex, attempt);
      settle(ctx, record.n, sent);
    } finally {
      ctx.dex.locks.remove(key);
    };
    switch (ctx.store.payouts.get(record.n)) {
      case (?p) #ok(payoutView(p));
      case null #ok(payoutView(record));
    };
  };

  // Timer (10 minutes): resends a payout whose outcome is unknown with the
  // identical request, moves it to review after 23 h. The pause does not
  // stop retries.
  public func runRetries(ctx : CreatorFeeContext) : async () {
    let now = RetryLib.dexNow();
    for (p in ctx.store.payouts.values().toArray().values()) {
      if (p.status == #inProgress and not ctx.dex.locks.contains(lockKey(p.token))) {
        switch (RetryLib.dexAction(p.attempt, now)) {
          case (#resend) {
            ctx.dex.locks.add(lockKey(p.token));
            try {
              let sent = await RetryLib.sendDexAttempt(ctx.dex, p.attempt);
              settle(ctx, p.n, sent);
            } finally {
              ctx.dex.locks.remove(lockKey(p.token));
            };
          };
          case (#newAttempt) {
            // A known ledger error closes the payout when the send returns,
            // so this only covers an interrupted close: the funds return to held.
            close(ctx, p, p.attempt, #failed(p.attempt.lastError ?? "Transfer failed"));
          };
          case (#needsReview) {
            ctx.store.payouts.add(p.n, { p with status = #needsReview });
          };
          case (#done) {};
        };
      };
    };
  };

  // Payouts waiting for the admin check (timeout).
  public func toReview(store : Types.CreatorFeeStore) : [Types.CreatorPayoutView] {
    store.payouts.values().filter(func p = p.status == #needsReview).toArray().map(payoutView);
  };

  // Admin: the ledger shows the payout arrived at `block`.
  public func markArrived(ctx : CreatorFeeContext, n : Nat, block : Nat) : { #ok; #err : Text } {
    switch (ctx.store.payouts.get(n)) {
      case (?p) {
        if (p.status != #needsReview) return #err("Payout is not waiting for review");
        close(ctx, p, p.attempt, #completed(block));
        #ok;
      };
      case null #err("Unknown payout");
    };
  };

  // Admin: the ledger shows the payout did not arrive; the amount returns to
  // the held holdings.
  public func markNotArrived(ctx : CreatorFeeContext, n : Nat) : { #ok; #err : Text } {
    switch (ctx.store.payouts.get(n)) {
      case (?p) {
        if (p.status != #needsReview) return #err("Payout is not waiting for review");
        close(ctx, p, p.attempt, #failed("Marked as not arrived by the admin"));
        #ok;
      };
      case null #err("Unknown payout");
    };
  };
};
