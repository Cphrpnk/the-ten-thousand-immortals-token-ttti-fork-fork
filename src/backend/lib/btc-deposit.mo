import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Btc "../types/btc-deposit";
import SaleLib "presale";
import MinterLib "ckbtc-minter";
import PayTokenLib "pay-token";

// BTC deposit flows through the ckBTC minter: per-buyer deposit subaccount,
// update_balance progress tracking, purchase finalization (ckBTC -> TTTI-T)
// and the wallet-only BTC -> ckBTC conversion.
module {
  public type BtcDepositStore = Btc.BtcDepositStore;
  public type DepositTracking = Btc.DepositTracking;
  public type DepositKind = Btc.DepositKind;
  public type BtcDepositResult = Btc.BtcDepositResult;
  public type MyBtcDeposits = Btc.MyBtcDeposits;
  public type BtcDepositInfo = Btc.BtcDepositInfo;

  public let SUGGESTED_POLL_SECONDS : Nat = 60;
  public let RETRY_TIMER_SECONDS : Nat = 600;
  // At most this many minter update_balance calls per timer tick.
  public let MAX_MINTER_CALLS_PER_TICK : Nat = 25;
  // The timer skips a tracking checked less than 5 minutes ago (ns).
  let RECENT_CHECK_NS : Int = 300_000_000_000;

  // Every tracking of both flows with its principal (OQL rows).
  public func trackingRows(store : BtcDepositStore) : Iter.Iter<(Principal, DepositTracking)> {
    store.purchases.entries().concat(store.wallets.entries());
  };

  public func kindText(k : DepositKind) : Text {
    switch (k) { case (#purchase) "purchase"; case (#wallet) "wallet" };
  };

  public func stageText(s : Btc.DepositStage) : Text {
    switch (s) {
      case (#addressShown) "addressShown";
      case (#depositDetected) "depositDetected";
      case (#confirming(_)) "confirming";
      case (#minted) "minted";
      case (#delivered) "delivered";
      case (#refunded) "refunded";
      case (#pendingRate) "pendingRate";
      case (#error) "error";
    };
  };

  public func errorKindText(k : ?Btc.DepositErrorKind) : ?Text {
    switch (k) {
      case (?#valueTooSmall) ?"valueTooSmall";
      case (?#tainted) ?"tainted";
      case (?#minterUnavailable) ?"minterUnavailable";
      case (?#other) ?"other";
      case (?#unrecoverable) ?"unrecoverable";
      case (?#refundFailed) ?"refundFailed";
      case null null;
    };
  };

  // Sum of one per-deposit amount over every entry of a tracking.
  public func total(t : DepositTracking, f : Btc.DepositEntry -> Nat) : Nat {
    t.deposits.foldLeft(0, func(acc, e) = acc + f(e));
  };

  // First byte of every purchase deposit subaccount; not printable ASCII, so it
  // never equals the fee collector or cycles reserve subaccounts.
  let SUBACCOUNT_TAG : Nat8 = 0xBD;

  // Deterministic 32-byte subaccount of this canister for a buyer's purchase
  // deposits: [0xBD, principal length, principal bytes, zero padding].
  public func purchaseSubaccount(buyer : Principal) : Blob {
    let bytes = buyer.toBlob().toArray();
    let n = bytes.size();
    Array.tabulate<Nat8>(
      32,
      func i = if (i == 0) SUBACCOUNT_TAG else if (i == 1) n.toNat8() else if (i < n + 2) bytes[Nat.sub(i, 2)] else 0,
    ).toBlob();
  };

  public func myDeposits(store : BtcDepositStore, caller : Principal) : MyBtcDeposits {
    {
      purchase = store.purchases.get(caller);
      wallet = store.wallets.get(caller);
    };
  };

  public func depositInfo(store : BtcDepositStore) : BtcDepositInfo {
    let base = {
      minterCanisterId = Principal.fromText(MinterLib.MINTER_ID);
      ckbtcLedgerId = PayTokenLib.ledgerId(#ckbtc);
      purchaseFeeBps = PayTokenLib.CK_FEE_BPS;
      suggestedPollSeconds = SUGGESTED_POLL_SECONDS;
    };
    switch (store.minterInfo) {
      case (?info) {
        {
          base with
          minConfirmations = info.minConfirmations;
          depositMinSats = info.depositMinSats;
          checkFeeSats = info.checkFeeSats;
          infoFetchedAt = ?info.fetchedAt;
        };
      };
      case null {
        {
          base with
          minConfirmations = MinterLib.DEFAULT_MIN_CONFIRMATIONS;
          depositMinSats = MinterLib.DEFAULT_DEPOSIT_MIN_SATS;
          checkFeeSats = MinterLib.DEFAULT_CHECK_FEE_SATS;
          infoFetchedAt = null;
        };
      };
    };
  };

  func failure(code : Btc.BtcDepositErrorCode, message : Text) : BtcDepositResult {
    #Err({ code; message });
  };

  func newTracking(kind : DepositKind, btcAddress : Text) : DepositTracking {
    {
      kind;
      btcAddress;
      stage = #addressShown;
      deposits = [];
      createdAt = Time.now();
      lastCheckedAt = null;
      errorKind = null;
      errorMessage = null;
    };
  };

  func newEntry(index : Nat) : Btc.DepositEntry {
    let now = Time.now();
    {
      index;
      stage = #depositDetected;
      btcDetectedSats = 0;
      ckbtcMintedSats = 0;
      ckbtcPendingSats = 0;
      tttiDelivered = 0;
      refundedSats = 0;
      conversionId = null;
      btcTxids = [];
      ckbtcMintBlockIndex = null;
      detectedAt = now;
      updatedAt = now;
      errorKind = null;
      errorMessage = null;
    };
  };

  // Newest deposit entry, if any.
  func latest(t : DepositTracking) : ?Btc.DepositEntry {
    if (t.deposits.size() == 0) null else ?t.deposits[0];
  };

  func nextIndex(t : DepositTracking) : Nat {
    switch (latest(t)) { case (?e) { e.index + 1 }; case null { 0 } };
  };

  // Entry still waiting for its UTXOs to be minted.
  func isPending(stage : Btc.DepositStage) : Bool {
    switch (stage) {
      case (#depositDetected or #confirming(_)) { true };
      case (_) { false };
    };
  };

  // Entry of a Bitcoin transaction: the one already listing its txid, else a
  // waiting entry recorded without txid (legacy), else a new entry. A UTXO of
  // another transaction never joins an entry that has a txid.
  func entryForTxid(t : DepositTracking, hex : Text) : Btc.DepositEntry {
    switch (t.deposits.find(func(e : Btc.DepositEntry) : Bool = e.btcTxids.contains(hex))) {
      case (?e) { e };
      case null {
        switch (t.deposits.find(func(e : Btc.DepositEntry) : Bool = e.btcTxids.size() == 0 and isPending(e.stage))) {
          case (?e) { e };
          case null { newEntry(nextIndex(t)) };
        };
      };
    };
  };

  // Replaces the entry with the same index, else prepends it (newest first).
  func setEntry(t : DepositTracking, entry : Btc.DepositEntry) : DepositTracking {
    let e = { entry with updatedAt = Time.now() };
    let deposits = if (t.deposits.any(func(d : Btc.DepositEntry) : Bool = d.index == e.index)) {
      t.deposits.map(func(d : Btc.DepositEntry) : Btc.DepositEntry = if (d.index == e.index) e else d);
    } else [e].concat(t.deposits);
    { t with stage = deposits[0].stage; deposits };
  };

  // Successful minter check: tracking-level error cleared, stage from newest entry.
  func cleared(t : DepositTracking) : DepositTracking {
    {
      t with
      stage = switch (latest(t)) { case (?e) { e.stage }; case null { #addressShown } };
      errorKind = null;
      errorMessage = null;
    };
  };

  let HEX : [Text] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  // Bitcoin display-order txid: the outpoint bytes reversed, lowercase hex.
  func txidHex(txid : Blob) : Text {
    var out = "";
    for (b in txid.toArray().values()) {
      let v = b.toNat();
      out := HEX[v / 16] # HEX[v % 16] # out;
    };
    out;
  };

  func withTxid(existing : [Text], hex : Text) : [Text] {
    if (existing.contains(hex)) existing else existing.concat([hex]);
  };

  // Detected amount: a waiting entry already counts its pending UTXOs.
  func detected(e : Btc.DepositEntry, value : Nat) : Nat {
    if (isPending(e.stage)) Nat.max(e.btcDetectedSats, value) else e.btcDetectedSats + value;
  };

  func confirming(e : Btc.DepositEntry, current : Nat, required : Nat, sats : Nat) : Btc.DepositEntry {
    {
      e with
      stage = #confirming({ current; required });
      btcDetectedSats = sats;
      errorKind = null;
      errorMessage = null;
    };
  };

  func isWaiting(stage : Btc.DepositStage) : Bool {
    switch (stage) {
      case (#addressShown or #depositDetected or #confirming(_) or #error) { true };
      case (_) { false };
    };
  };

  // Error outcome: the stage becomes #error only while nothing further was
  // reached (a minted / delivered / refunded / pendingRate stage is kept).
  func withError(t : DepositTracking, kind : Btc.DepositErrorKind, message : Text) : DepositTracking {
    {
      t with
      stage = if (isWaiting(t.stage)) #error else t.stage;
      errorKind = ?kind;
      errorMessage = ?message;
    };
  };

  func entryError(e : Btc.DepositEntry, kind : Btc.DepositErrorKind, message : Text) : Btc.DepositEntry {
    {
      e with
      stage = if (isWaiting(e.stage)) #error else e.stage;
      errorKind = ?kind;
      errorMessage = ?message;
    };
  };

  // Applies one update_balance UTXO status to the entry of its transaction.
  func applyStatus(t : DepositTracking, status : Btc.UtxoStatus) : DepositTracking {
    switch (status) {
      case (#Minted(m)) {
        let hex = txidHex(m.utxo.outpoint.txid);
        let e = entryForTxid(t, hex);
        let minted = m.minted_amount.toNat();
        setEntry(
          t,
          {
            e with
            stage = #minted;
            btcDetectedSats = detected(e, m.utxo.value.toNat());
            ckbtcMintedSats = e.ckbtcMintedSats + minted;
            ckbtcPendingSats = if (t.kind == #purchase) e.ckbtcPendingSats + minted else e.ckbtcPendingSats;
            btcTxids = withTxid(e.btcTxids, hex);
            ckbtcMintBlockIndex = ?m.block_index.toNat();
            errorKind = null;
            errorMessage = null;
          },
        );
      };
      case (#Checked(u)) {
        let hex = txidHex(u.outpoint.txid);
        let e = entryForTxid(t, hex);
        let next = { e with btcDetectedSats = detected(e, u.value.toNat()); btcTxids = withTxid(e.btcTxids, hex) };
        setEntry(t, if (isPending(e.stage)) ({ next with stage = #depositDetected; errorKind = null; errorMessage = null }) else next);
      };
      case (#ValueTooSmall(u)) {
        let hex = txidHex(u.outpoint.txid);
        let e = entryForTxid(t, hex);
        setEntry(t, entryError({ e with btcDetectedSats = detected(e, u.value.toNat()); btcTxids = withTxid(e.btcTxids, hex) }, #valueTooSmall, "This Bitcoin deposit is below the ckBTC minter minimum; no ckBTC was minted"));
      };
      case (#Tainted(u)) {
        let hex = txidHex(u.outpoint.txid);
        let e = entryForTxid(t, hex);
        setEntry(t, entryError({ e with btcDetectedSats = detected(e, u.value.toNat()); btcTxids = withTxid(e.btcTxids, hex) }, #tainted, "The ckBTC minter refused this Bitcoin deposit after its check; no ckBTC was minted"));
      };
    };
  };

  // Applies an update_balance outcome to the tracking (no I/O). Each Bitcoin
  // transaction (txid) is its own entry with its own confirmations.
  func applyUpdate(t : DepositTracking, outcome : MinterLib.UpdateOutcome) : DepositTracking {
    switch (outcome) {
      case (#ok(statuses)) {
        var next = cleared(t);
        for (status in statuses.values()) {
          next := applyStatus(next, status);
        };
        next;
      };
      case (#err(#NoNewUtxos({ current_confirmations; required_confirmations; pending_utxos }))) {
        let pending = pending_utxos ?? [];
        let required = required_confirmations.toNat();
        var next = cleared(t);
        if (pending.size() == 0) {
          switch (current_confirmations) {
            case (?c) {
              let e = switch (next.deposits.find(func(d : Btc.DepositEntry) : Bool = isPending(d.stage))) {
                case (?d) { d };
                case null { newEntry(nextIndex(next)) };
              };
              next := setEntry(next, confirming(e, c.toNat(), required, e.btcDetectedSats));
            };
            case null {};
          };
          return next;
        };
        var txids : [Text] = [];
        for (u in pending.values()) {
          txids := withTxid(txids, txidHex(u.outpoint.txid));
        };
        for (hex in txids.values()) {
          var sats = 0;
          var conf = 0;
          for (u in pending.values()) {
            if (txidHex(u.outpoint.txid) == hex) {
              sats += u.value.toNat();
              conf := Nat.max(conf, u.confirmations.toNat());
            };
          };
          let e = entryForTxid(next, hex);
          if (isPending(e.stage)) {
            next := setEntry(next, confirming({ e with btcTxids = withTxid(e.btcTxids, hex) }, conf, required, Nat.max(e.btcDetectedSats, sats)));
          };
        };
        next;
      };
      case (#err(#AlreadyProcessing)) { t };
      case (#err(#TemporarilyUnavailable(message))) {
        withError(t, #minterUnavailable, "The ckBTC minter is temporarily unavailable: " # message);
      };
      case (#err(#GenericError({ error_message }))) {
        withError(t, #other, "ckBTC minter error: " # error_message);
      };
      case (#callFailed(message)) {
        withError(t, #minterUnavailable, "The ckBTC minter could not be reached: " # message);
      };
    };
  };

  // Purchase flow: requires accepted acknowledgements; address of
  // owner = canister, subaccount = purchaseSubaccount(caller).
  public func purchaseAddress(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to get a Bitcoin deposit address");
    };
    if (not SaleLib.hasAccepted(ctx.acknowledgements, caller)) {
      return failure(#acknowledgementRequired, "Please accept the purchase acknowledgements first");
    };
    switch (store.purchases.get(caller)) {
      case (?existing) { return #Ok(existing) };
      case null {};
    };
    switch (await MinterLib.getBtcAddress(ctx.canister, ?purchaseSubaccount(caller))) {
      case (#ok(address)) {
        let tracking = store.purchases.get(caller) ?? newTracking(#purchase, address);
        store.purchases.add(caller, tracking);
        #Ok(tracking);
      };
      case (#err(message)) {
        failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
      };
    };
  };

  let FEE = PayTokenLib.CKBTC_LEDGER_FEE;
  let REFUND_FAILED_TEXT = "The ckBTC beyond the delivered TTTI-T could not be refunded yet: ";

  // ckBTC of a purchase entry still to convert into TTTI-T (its own amount).
  func toConvert(e : Btc.DepositEntry) : Nat {
    switch (e.stage) {
      case (#minted or #pendingRate) {
        if (e.ckbtcPendingSats > 0) e.ckbtcPendingSats else if (e.conversionId == null and e.refundedSats == 0) e.ckbtcMintedSats else 0;
      };
      case (_) { 0 };
    };
  };

  // Delivered purchase entry whose excess refund failed and is still owed.
  func refundOwed(e : Btc.DepositEntry) : Nat {
    if (e.stage == #delivered and e.errorKind == ?#refundFailed and e.ckbtcPendingSats > FEE) e.ckbtcPendingSats else 0;
  };

  // ckBTC this entry still accounts for in the buyer subaccount.
  func held(e : Btc.DepositEntry) : Nat = Nat.max(e.ckbtcPendingSats, toConvert(e));

  // Converts each minted purchase entry for its own amount, oldest first, one
  // at a time (excess beyond the delivered amount is refunded), then retries
  // failed excess refunds. The caller holds the purchase lock for `caller`.
  func finalize(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, caller : Principal, t : DepositTracking) : async* DepositTracking {
    let subaccount = purchaseSubaccount(caller);
    let payLedger = PayTokenLib.ledger(#ckbtc);
    let own = { owner = caller; subaccount = null };
    let depositAccount = { owner = ctx.canister; subaccount = ?subaccount };
    func current() : DepositTracking = store.purchases.get(caller) ?? t;
    func entryAt(index : Nat) : ?Btc.DepositEntry {
      current().deposits.find(func(e : Btc.DepositEntry) : Bool = e.index == index);
    };
    func save(index : Nat, f : Btc.DepositEntry -> Btc.DepositEntry) {
      switch (entryAt(index)) {
        case (?e) { store.purchases.add(caller, setEntry(current(), f(e))) };
        case null {};
      };
    };

    let queue = current().deposits.filter(func(e : Btc.DepositEntry) : Bool = toConvert(e) > FEE).reverse();
    for (queued in queue.values()) {
      let i = queued.index;
      let wanted = switch (entryAt(i)) { case (?e) { toConvert(e) }; case null { 0 } };
      if (wanted > FEE) {
        let balance = switch (await PayTokenLib.balanceOf(payLedger, depositAccount)) {
          case (#ok(b)) { b };
          case (#err(_)) { return current() };
        };
        let amount = Nat.min(wanted, balance);
        if (amount > FEE) {
          switch (await SaleLib.purchaseFromDeposit(ctx, caller, subaccount, amount)) {
            case (#Ok(conversion)) {
              let excess = if (amount > conversion.payAmount) Nat.sub(amount, conversion.payAmount) else 0;
              var refunded = 0;
              var left = excess;
              var kind : ?Btc.DepositErrorKind = null;
              var message : ?Text = null;
              if (excess > FEE) {
                switch (await PayTokenLib.sendFromSubaccount(payLedger, #ckbtc, subaccount, own, excess)) {
                  case (#ok(_)) {
                    refunded := Nat.sub(excess, FEE);
                    left := 0;
                  };
                  case (#err(reason)) {
                    kind := ?#refundFailed;
                    message := ?(REFUND_FAILED_TEXT # reason);
                  };
                };
              };
              let refundedNow = refunded;
              let leftNow = left;
              let kindNow = kind;
              let messageNow = message;
              save(
                i,
                func e = {
                  e with
                  stage = #delivered;
                  tttiDelivered = e.tttiDelivered + conversion.tttiAmount;
                  refundedSats = e.refundedSats + refundedNow;
                  ckbtcPendingSats = leftNow;
                  conversionId = ?conversion.id;
                  errorKind = kindNow;
                  errorMessage = messageNow;
                },
              );
            };
            case (#Err(err)) {
              switch (err.code) {
                case (#priceUnavailable(_)) {
                  save(i, func e = { e with stage = #pendingRate; ckbtcPendingSats = amount; errorKind = null; errorMessage = ?err.message });
                };
                case (#saleComplete or #belowMinimum(_)) {
                  switch (await PayTokenLib.sendFromSubaccount(payLedger, #ckbtc, subaccount, own, amount)) {
                    case (#ok(_)) {
                      save(
                        i,
                        func e = {
                          e with
                          stage = #refunded;
                          refundedSats = e.refundedSats + Nat.sub(amount, FEE);
                          ckbtcPendingSats = 0;
                          errorKind = null;
                          errorMessage = ?(err.message # "; the ckBTC was refunded to your account minus the 10 sat ledger fee");
                        },
                      );
                    };
                    case (#err(reason)) {
                      save(i, func e = { e with stage = #error; ckbtcPendingSats = amount; errorKind = ?#unrecoverable; errorMessage = ?(err.message # "; the ckBTC refund failed: " # reason) });
                    };
                  };
                };
                case (#deliveryFailedRefundFailed) {
                  let paid = switch (err.conversion) { case (?c) { c.payAmount }; case null { 0 } };
                  save(
                    i,
                    func e = {
                      e with
                      stage = #error;
                      ckbtcPendingSats = if (amount > paid) Nat.sub(amount, paid) else 0;
                      conversionId = switch (err.conversion) { case (?c) { ?c.id }; case null { e.conversionId } };
                      errorKind = ?#unrecoverable;
                      errorMessage = ?err.message;
                    },
                  );
                };
                case (_) {
                  save(i, func e = { e with stage = #minted; ckbtcPendingSats = amount; errorKind = null; errorMessage = ?err.message });
                };
              };
            };
          };
        };
      };
    };

    // Failed excess refunds are retried only while the subaccount still holds
    // every amount the entries account for.
    let owedList = current().deposits.filter(func(e : Btc.DepositEntry) : Bool = refundOwed(e) > 0);
    for (owedEntry in owedList.values()) {
      let i = owedEntry.index;
      let owed = switch (entryAt(i)) { case (?e) { refundOwed(e) }; case null { 0 } };
      if (owed > 0) {
        switch (await PayTokenLib.balanceOf(payLedger, depositAccount)) {
          case (#ok(balance)) {
            if (balance >= total(current(), held)) {
              switch (await PayTokenLib.sendFromSubaccount(payLedger, #ckbtc, subaccount, own, owed)) {
                case (#ok(_)) {
                  save(i, func e = { e with ckbtcPendingSats = 0; refundedSats = e.refundedSats + Nat.sub(owed, FEE); errorKind = null; errorMessage = null });
                };
                case (#err(reason)) {
                  save(i, func e = { e with errorMessage = ?(REFUND_FAILED_TEXT # reason) });
                };
              };
            };
          };
          case (#err(_)) {};
        };
      };
    };
    current();
  };

  // Purchase flow: update_balance for the buyer subaccount, then finalize any
  // ckBTC available (delivery, refund beyond cap, or #pendingRate). The caller
  // (mixin or timer) holds the purchase lock for `caller`.
  public func checkPurchase(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to check a Bitcoin deposit");
    };
    if (store.purchases.get(caller) == null) {
      return failure(#noAddressYet, "Request the Bitcoin deposit address first");
    };
    let outcome = await MinterLib.updateBalance(ctx.canister, ?purchaseSubaccount(caller));
    let latest = store.purchases.get(caller) ?? newTracking(#purchase, "");
    let updated = { applyUpdate(latest, outcome) with lastCheckedAt = ?Time.now() };
    store.purchases.add(caller, updated);
    let tracking = await* finalize(store, ctx, caller, updated);
    switch (outcome) {
      case (#callFailed(message)) {
        if (tracking.stage == #error) {
          return failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
        };
      };
      case (_) {};
    };
    #Ok(tracking);
  };

  // Wallet flow: address of owner = caller, no subaccount.
  public func walletAddress(store : BtcDepositStore, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to get a Bitcoin deposit address");
    };
    switch (store.wallets.get(caller)) {
      case (?existing) { return #Ok(existing) };
      case null {};
    };
    switch (await MinterLib.getBtcAddress(caller, null)) {
      case (#ok(address)) {
        let tracking = store.wallets.get(caller) ?? newTracking(#wallet, address);
        store.wallets.add(caller, tracking);
        #Ok(tracking);
      };
      case (#err(message)) {
        failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
      };
    };
  };

  // Wallet flow: update_balance for owner = caller; records progress only.
  public func checkWallet(store : BtcDepositStore, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to check a Bitcoin deposit");
    };
    if (store.wallets.get(caller) == null) {
      return failure(#noAddressYet, "Request the Bitcoin deposit address first");
    };
    let outcome = await MinterLib.updateBalance(caller, null);
    let latest = store.wallets.get(caller) ?? newTracking(#wallet, "");
    let updated = { applyUpdate(latest, outcome) with lastCheckedAt = ?Time.now() };
    store.wallets.add(caller, updated);
    switch (outcome) {
      case (#callFailed(message)) {
        if (updated.stage == #error) {
          return failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
        };
      };
      case (_) {};
    };
    #Ok(updated);
  };

  // Purchase ckBTC waiting for conversion or a failed excess refund (no minter
  // call needed).
  func needsFinalize(t : DepositTracking) : Bool {
    t.deposits.any(func(e : Btc.DepositEntry) : Bool = toConvert(e) > FEE or refundOwed(e) > 0);
  };

  func checkedRecently(t : DepositTracking, now : Int) : Bool {
    switch (t.lastCheckedAt) {
      case (?at) { now - at < RECENT_CHECK_NS };
      case null { false };
    };
  };

  type Candidate = {
    principal : Principal;
    kind : DepositKind;
    active : Bool; // deposit seen and still confirming
    checkedAt : Int;
  };

  // Purchase finalization only, under the shared purchase lock.
  func finalizeLocked(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, inFlight : Set.Set<Principal>, principal : Principal) : async* () {
    if (inFlight.contains(principal)) return;
    switch (store.purchases.get(principal)) {
      case (?t) {
        if (not needsFinalize(t)) return;
        inFlight.add(principal);
        try {
          ignore await* finalize(store, ctx, principal, t);
        } finally {
          inFlight.remove(principal);
        };
      };
      case null {};
    };
  };

  // Background watch of every stable address: calls update_balance for
  // purchase and wallet trackings at any stage (address shown, confirming,
  // finished), so deposits sent while the page is closed are detected, and
  // finalizes purchase ckBTC into TTTI-T. Trackings checked in the last
  // 5 minutes are skipped; at most MAX_MINTER_CALLS_PER_TICK minter calls,
  // confirming deposits first, then the least recently checked. Purchases
  // take the shared purchase lock per principal.
  public func retryPending(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, inFlight : Set.Set<Principal>) : async* () {
    let now = Time.now();
    let polls = List.empty<Candidate>();
    let finalizeOnly = List.empty<Principal>();
    for ((principal, t) in store.purchases.entries()) {
      if (checkedRecently(t, now)) {
        if (needsFinalize(t)) finalizeOnly.add(principal);
      } else {
        polls.add({ principal; kind = #purchase; active = hasPendingEntry(t); checkedAt = t.lastCheckedAt ?? 0 });
      };
    };
    for ((principal, t) in store.wallets.entries()) {
      if (not checkedRecently(t, now)) {
        polls.add({ principal; kind = #wallet; active = hasPendingEntry(t); checkedAt = t.lastCheckedAt ?? 0 });
      };
    };
    let ordered = polls.toArray().sort(
      func(a, b) = if (a.active != b.active) { if (a.active) #less else #greater } else Int.compare(a.checkedAt, b.checkedAt)
    );
    var calls = 0;
    for (c in ordered.values()) {
      switch (c.kind) {
        case (#wallet) {
          if (calls < MAX_MINTER_CALLS_PER_TICK) {
            calls += 1;
            ignore await* checkWallet(store, c.principal);
          };
        };
        case (#purchase) {
          if (calls < MAX_MINTER_CALLS_PER_TICK) {
            if (not inFlight.contains(c.principal)) {
              calls += 1;
              inFlight.add(c.principal);
              try {
                ignore await* checkPurchase(store, ctx, c.principal);
              } finally {
                inFlight.remove(c.principal);
              };
            };
          } else {
            await* finalizeLocked(store, ctx, inFlight, c.principal);
          };
        };
      };
    };
    for (principal in finalizeOnly.values()) {
      await* finalizeLocked(store, ctx, inFlight, principal);
    };
  };

  // Any entry still waiting for confirmations or its mint.
  func hasPendingEntry(t : DepositTracking) : Bool {
    t.deposits.any(func(e : Btc.DepositEntry) : Bool = isPending(e.stage));
  };

  // Caches get_minter_info; failures keep the previous cache.
  public func refreshMinterInfo(store : BtcDepositStore) : async* () {
    switch (await MinterLib.getMinterInfo()) {
      case (#ok(info)) {
        store.minterInfo := ?{
          minConfirmations = info.min_confirmations.toNat();
          depositMinSats = switch (info.deposit_btc_min_amount) {
            case (?v) { v.toNat() };
            case null { MinterLib.DEFAULT_DEPOSIT_MIN_SATS };
          };
          checkFeeSats = info.kyt_fee.toNat();
          retrieveMinSats = info.retrieve_btc_min_amount.toNat();
          fetchedAt = Time.now();
        };
      };
      case (#err(_)) {};
    };
  };

  // Re-armed on every install and upgrade from the actor body.
  public func startTimer<system>(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, inFlight : Set.Set<Principal>) : () {
    ignore Timer.setTimer<system>(
      #seconds 0,
      func() : async () {
        await* refreshMinterInfo(store);
        await* retryPending(store, ctx, inFlight);
      },
    );
    ignore Timer.recurringTimer<system>(
      #seconds RETRY_TIMER_SECONDS,
      func() : async () {
        await* refreshMinterInfo(store);
        await* retryPending(store, ctx, inFlight);
      },
    );
  };
};
