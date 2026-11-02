import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/inflight";
import DexTypes "../types/dex";
import RetryTypes "../types/retry";
import RouterTypes "../types/router";

// PTM-9e: index of the unfinished transfers, deposits, withdrawals and swaps.
//
// Readers (resendPending, tokenBusy, hasUnsettledSweep, legacyInFlight,
// tokenInFlight) walk this index instead of the whole history.
//
// Unfinished statuses (see types/inflight.mo):
//  - deposit / withdrawal / sweep transfer: #inProgress, #needsReview.
//  - routed swap: #inProgress, #needsReview.
//
// Writers: lib/router.mo (swaps) and lib/dex-sweep.mo (sweep transfers) call
// enter / leave where they write the record. Deposits and withdrawals are
// written by lib/retry.mo; the index catches up on them with syncTransfers,
// which looks only at numbers above the mark and at the entries already in the
// index, never at the whole history.
//
// Imports types only, so every lib module can import it.
module {
  public func emptyStore() : Types.InflightStore {
    {
      entries = Map.empty();
      var depositMark = 0;
      var withdrawalMark = 0;
      var backfilled = false;
    };
  };

  func tag(kind : Types.Kind) : Text {
    switch (kind) {
      case (#deposit) "DD";
      case (#withdrawal) "DW";
      case (#sweep) "SW";
      case (#swap) "IR";
    };
  };

  // Kind-tagged key, e.g. "DD/12", "SW/3", "IR/40".
  public func keyOf(kind : Types.Kind, n : Nat) : Text {
    tag(kind) # "/" # n.toText();
  };

  // --- Unfinished statuses ---------------------------------------------------

  public func transferUnfinished(status : DexTypes.DexTransferStatus) : Bool {
    switch (status) {
      case (#inProgress or #needsReview) true;
      case (#completed(_) or #failed(_)) false;
    };
  };

  public func swapUnfinished(status : RouterTypes.RoutedSwapStatus) : Bool {
    switch (status) {
      case (#inProgress or #needsReview) true;
      case (#completed or #failedReturned(_) or #reviewedArrived(_) or #reviewedNotArrived) false;
    };
  };

  // --- Writers ---------------------------------------------------------------

  // Adds (or replaces) the entry of an unfinished operation.
  public func enter(store : Types.InflightStore, kind : Types.Kind, n : Nat, tokens : [DexTypes.DexToken], owner : ?Principal) {
    let key = keyOf(kind, n);
    let since = switch (store.entries.get(key)) {
      case (?e) e.since;
      case null Time.now();
    };
    store.entries.add(key, { kind; n; tokens; owner; since });
  };

  // Removes the entry when the operation is finished. No effect when absent.
  public func leave(store : Types.InflightStore, kind : Types.Kind, n : Nat) {
    store.entries.remove(keyOf(kind, n));
  };

  // --- Readers ---------------------------------------------------------------

  public func contains(store : Types.InflightStore, kind : Types.Kind, n : Nat) : Bool {
    store.entries.containsKey(keyOf(kind, n));
  };

  public func count(store : Types.InflightStore) : Nat {
    store.entries.size();
  };

  public func countOfKind(store : Types.InflightStore, kind : Types.Kind) : Nat {
    var total = 0;
    for (e in store.entries.values()) {
      if (e.kind == kind) total += 1;
    };
    total;
  };

  func hasToken(e : Types.Entry, token : DexTypes.DexToken) : Bool {
    for (t in e.tokens.values()) {
      if (t == token) return true;
    };
    false;
  };

  // Snapshot of the entries of one kind (safe to leave / enter while iterating).
  public func entriesOfKind(store : Types.InflightStore, kind : Types.Kind) : [Types.Entry] {
    store.entries.values().filter(func e = e.kind == kind).toArray();
  };

  // Snapshot of the entries that move `token`, of any kind.
  public func entriesOfToken(store : Types.InflightStore, token : DexTypes.DexToken) : [Types.Entry] {
    store.entries.values().filter(func e = hasToken(e, token)).toArray();
  };

  // Snapshot of the entries of one kind that move `token`.
  public func entriesOfKindAndToken(store : Types.InflightStore, kind : Types.Kind, token : DexTypes.DexToken) : [Types.Entry] {
    store.entries.values().filter(func e = e.kind == kind and hasToken(e, token)).toArray();
  };

  public func forEachOfKind(store : Types.InflightStore, kind : Types.Kind, f : Types.Entry -> ()) {
    for (e in entriesOfKind(store, kind).values()) { f(e) };
  };

  public func forEachOfToken(store : Types.InflightStore, token : DexTypes.DexToken, f : Types.Entry -> ()) {
    for (e in entriesOfToken(store, token).values()) { f(e) };
  };

  // True while an unfinished operation moves `token`.
  public func anyOfToken(store : Types.InflightStore, token : DexTypes.DexToken) : Bool {
    for (e in store.entries.values()) {
      if (hasToken(e, token)) return true;
    };
    false;
  };

  // True while an unfinished operation of the DEX user `owner` moves `token`.
  public func anyOfOwnerAndToken(store : Types.InflightStore, owner : Principal, token : DexTypes.DexToken) : Bool {
    for (e in store.entries.values()) {
      if (e.owner == ?owner and hasToken(e, token)) return true;
    };
    false;
  };

  // --- Catch-up for deposits and withdrawals ----------------------------------

  // Brings the deposit and withdrawal entries up to date, touching only
  //  - the numbers at or above the marks (newer records), and
  //  - the entries already in the index (to drop the ones that finished).
  // The marks only move forward.
  public func syncTransfers(store : Types.InflightStore, transfers : RetryTypes.DexTransferStore) {
    // Entries that finished since the last call leave the index.
    for (kind in ([#deposit, #withdrawal] : [Types.Kind]).values()) {
      for (e in entriesOfKind(store, kind).values()) {
        let record = switch (kind) {
          case (#deposit) transfers.deposits.get(e.n);
          case (_) transfers.withdrawals.get(e.n);
        };
        switch (record) {
          case (?t) { if (not transferUnfinished(t.status)) leave(store, kind, e.n) };
          case null { leave(store, kind, e.n) };
        };
      };
    };
    // Newer records.
    scanNew(store, #deposit, transfers.deposits);
    scanNew(store, #withdrawal, transfers.withdrawals);
  };

  func scanNew(store : Types.InflightStore, kind : Types.Kind, records : Map.Map<Nat, RetryTypes.DexTransfer>) {
    let mark = switch (kind) {
      case (#deposit) store.depositMark;
      case (_) store.withdrawalMark;
    };
    var top = mark;
    let iter = records.reverseEntries();
    var more = true;
    while (more) {
      switch (iter.next()) {
        case null { more := false };
        case (?(n, t)) {
          if (n < mark) {
            more := false;
          } else {
            if (n + 1 > top) top := n + 1;
            if (transferUnfinished(t.status)) {
              enter(store, kind, n, [t.token], ?t.owner);
            };
          };
        };
      };
    };
    switch (kind) {
      case (#deposit) { store.depositMark := top };
      case (_) { store.withdrawalMark := top };
    };
  };

  // --- One-time backfill -------------------------------------------------------

  // Adds every existing unfinished deposit, withdrawal, sweep transfer and
  // routed swap from the current stores (state, not ledger data) and moves the
  // deposit / withdrawal marks past the highest number seen. Runs once: returns
  // 0 and does nothing when the index is already backfilled. Returns the number
  // of entries added. Called from main.mo at start-up.
  public func backfill(
    store : Types.InflightStore,
    transfers : RetryTypes.DexTransferStore,
    swaps : Map.Map<Nat, RouterTypes.RoutedSwap>,
    sweeps : [Types.SweepRef],
  ) : Nat {
    if (store.backfilled) return 0;
    let before = store.entries.size();
    scanNew(store, #deposit, transfers.deposits);
    scanNew(store, #withdrawal, transfers.withdrawals);
    for ((id, s) in swaps.entries()) {
      if (swapUnfinished(s.status)) {
        enter(store, #swap, id, [s.tokenIn, s.tokenOut], ?s.owner);
      };
    };
    for (r in sweeps.values()) {
      if (transferUnfinished(r.status)) {
        enter(store, #sweep, r.n, [r.token], r.owner);
      };
    };
    store.backfilled := true;
    let after = store.entries.size();
    if (after > before) Nat.sub(after, before) else 0;
  };
};
