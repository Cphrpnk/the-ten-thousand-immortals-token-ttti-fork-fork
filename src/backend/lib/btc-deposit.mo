import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Btc "../types/btc-deposit";
import RetryTypes "../types/retry";
import SaleLib "presale";
import RetryLib "retry";
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
      btcRefund = null;
      costToRefund = null;
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

  // Check outcome: #Err when the minter was unreachable and nothing further
  // was reached, else the tracking.
  func checkResult(t : DepositTracking, outcome : MinterLib.UpdateOutcome) : BtcDepositResult {
    switch (outcome) {
      case (#callFailed(message)) {
        if (t.stage == #error) {
          return failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
        };
      };
      case (_) {};
    };
    #Ok(t);
  };

  // Purchase flow: requires accepted acknowledgements; address of
  // owner = canister, subaccount = purchaseSubaccount(caller). Nothing is
  // stored: without a stored tracking, an unsaved #addressShown tracking.
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
        #Ok(store.purchases.get(caller) ?? newTracking(#purchase, address));
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

  // --- BTC refunds (BR) and cost sends (BC) through lib/retry.mo -------------

  type TransferContext = RetryLib.TransferContext;

  func entryOf(store : BtcDepositStore, caller : Principal, index : Nat) : ?Btc.DepositEntry {
    switch (store.purchases.get(caller)) {
      case (?t) { t.deposits.find(func(e : Btc.DepositEntry) : Bool = e.index == index) };
      case null { null };
    };
  };

  func updateEntry(store : BtcDepositStore, caller : Principal, index : Nat, f : Btc.DepositEntry -> Btc.DepositEntry) {
    switch (store.purchases.get(caller)) {
      case (?t) {
        switch (t.deposits.find(func(e : Btc.DepositEntry) : Bool = e.index == index)) {
          case (?e) { store.purchases.add(caller, setEntry(t, f(e))) };
          case null {};
        };
      };
      case null {};
    };
  };

  // Refund of `debit` sats from the buyer's deposit subaccount to the default
  // account of `caller` (who created the tracking): debit - FEE, explicit
  // FEE; null when debit <= FEE (remainder of 10 sat or less, never refunded).
  func btcRefundRequest(caller : Principal, debit : Nat) : ?RetryTypes.TransferRequest {
    if (debit <= FEE) {
      return null;
    };
    ?{ token = #ckbtc; from_subaccount = ?purchaseSubaccount(caller); to = { owner = caller; subaccount = null }; amount = Nat.sub(debit, FEE); fee = ?FEE };
  };

  // New BR attempt (memo TTTI-BR-<n>-1), recorded before the first await.
  func openBtcRefund(tctx : TransferContext, caller : Principal, purpose : RetryTypes.BtcRefundPurpose, debit : Nat) : ?Btc.BtcRefund {
    switch (btcRefundRequest(caller, debit)) {
      case (?r) { ?{ purpose; attempt = RetryLib.newBtcRefundAttempt(tctx.retry, null, r, RetryLib.now64()) } };
      case null { null };
    };
  };

  // Effects of a BR refund that arrived in `block`.
  func refundArrived(e : Btc.DepositEntry, r : Btc.BtcRefund, block : Nat) : Btc.DepositEntry {
    let base = {
      e with
      btcRefund = ?{ r with attempt = { r.attempt with outcome = #succeeded(block) } };
      ckbtcPendingSats = 0;
      refundedSats = e.refundedSats + r.attempt.request.amount;
    };
    switch (r.purpose) {
      case (#excess) { { base with errorKind = null; errorMessage = null } };
      case (#fullRefund) {
        { base with stage = #refunded; errorKind = null; errorMessage = ?("The ckBTC was refunded to your account minus the 10 sat ledger fee (block " # block.toText() # ")") };
      };
      case (#deliveryFailedExcess) { base };
    };
  };

  // A BR send that did not succeed (known Err or unknown outcome).
  func refundNotDone(e : Btc.DepositEntry, r : Btc.BtcRefund) : Btc.DepositEntry {
    let reason = r.attempt.lastError ?? "outcome unknown";
    let entry = { e with btcRefund = ?r };
    switch (r.purpose) {
      case (#excess) { { entry with errorKind = ?#refundFailed; errorMessage = ?(REFUND_FAILED_TEXT # reason) } };
      case (#fullRefund) { { entry with errorMessage = ?("The purchase was not possible and the ckBTC refund is not confirmed yet: " # reason) } };
      case (#deliveryFailedExcess) { entry };
    };
  };

  // BR attempt the rule still sends (resend within 23 h or new attempt).
  func brActive(e : Btc.DepositEntry, now : Nat64) : Bool {
    switch (e.btcRefund) {
      case (?r) {
        switch (RetryLib.nextAction(r.attempt, now)) {
          case (#resend or #newAttempt) { true };
          case (_) { false };
        };
      };
      case null { false };
    };
  };

  // One step of the rule for the BR refund of entry (caller, index): at most
  // one send, only when the deposit subaccount balance covers amount plus
  // fee, under the transfer lock (released in a finally).
  // Nothing is sent (nor a new attempt opened) while sales are paused: the
  // recorded attempt stays on the entry for the timer after the pause.
  func stepBtcRefund(store : BtcDepositStore, tctx : TransferContext, caller : Principal, index : Nat) : async () {
    if (tctx.sale.salesPaused) {
      return;
    };
    let e = entryOf(store, caller, index) ?? (return);
    let r = e.btcRefund ?? (return);
    let now = RetryLib.now64();
    let attempt = switch (RetryLib.nextAction(r.attempt, now)) {
      case (#done or #needsReview) { return };
      case (#resend) { r.attempt };
      case (#newAttempt) {
        let fresh = RetryLib.newBtcRefundAttempt(tctx.retry, ?r.attempt, r.attempt.request, now);
        updateEntry(store, caller, index, func x = { x with btcRefund = ?{ r with attempt = fresh } });
        fresh;
      };
    };
    let key = RetryLib.lockKey(#BR, attempt.n);
    if (not RetryLib.tryLock(tctx.locks, key)) {
      return;
    };
    try {
      let fee = attempt.request.fee ?? FEE;
      let account = { owner = tctx.canister; subaccount = attempt.request.from_subaccount };
      switch (await PayTokenLib.balanceOf(PayTokenLib.ledger(#ckbtc), account)) {
        case (#ok(balance)) {
          if (balance < attempt.request.amount + fee) {
            return;
          };
        };
        case (#err(_)) { return };
      };
      // Re-read after the balance await: send only the attempt still recorded.
      let cur = entryOf(store, caller, index) ?? (return);
      let latest = cur.btcRefund ?? (return);
      if (tctx.sale.salesPaused or latest.attempt.n != attempt.n or latest.attempt.attempt != attempt.attempt) {
        return;
      };
      switch (latest.attempt.outcome) {
        case (#succeeded(_)) { return };
        case (_) {};
      };
      let sending = { latest.attempt with sends = latest.attempt.sends + 1 };
      updateEntry(store, caller, index, func x = { x with btcRefund = ?{ latest with attempt = sending } });
      let result = await RetryLib.sendBtcCounted(sending);
      let done = { latest with attempt = result };
      updateEntry(
        store,
        caller,
        index,
        func x = switch (result.outcome) {
          case (#succeeded(b)) { refundArrived(x, done, b) };
          case (_) { refundNotDone(x, done) };
        },
      );
    } catch (_) {} finally {
      RetryLib.unlock(tctx.locks, key);
    };
  };

  // Legacy entry without a BR attempt (no created_at_time): a failure that
  // is a ledger Err gets a new attempt; a reject, trap or ambiguous message
  // is an unknown outcome sent to review without a resend.
  func legacyRefund(tctx : TransferContext, caller : Principal, e : Btc.DepositEntry) : ?Btc.DepositEntry {
    switch (e.btcRefund) { case (?_) { return null }; case null {} };
    let purpose : RetryTypes.BtcRefundPurpose = if (e.stage == #delivered and e.errorKind == ?#refundFailed) {
      #excess;
    } else if (e.stage == #error and e.errorKind == ?#unrecoverable and e.conversionId == null) {
      #fullRefund;
    } else if (e.stage == #error and e.errorKind == ?#unrecoverable) {
      #deliveryFailedExcess;
    } else {
      return null;
    };
    let request = btcRefundRequest(caller, e.ckbtcPendingSats) ?? (return null);
    let attempt = if (purpose != #deliveryFailedExcess and RetryLib.ambiguousFailure(e.errorMessage)) {
      RetryLib.legacyUnknownBtcRefund(tctx.retry, request, e.errorMessage);
    } else {
      // The excess of a delivery failure was never sent: a new attempt.
      RetryLib.newBtcRefundAttempt(tctx.retry, null, request, RetryLib.now64());
    };
    ?{ e with btcRefund = ?{ purpose; attempt } };
  };

  // Legacy delivery-and-refund failure: its BTC cost (the conversion's
  // payAmount) becomes a cost to refund by hand while the purchase is under
  // #refundReview.
  func legacyCost(tctx : TransferContext, e : Btc.DepositEntry) : ?Btc.DepositEntry {
    switch (e.costToRefund) { case (?_) { return null }; case null {} };
    if (e.stage != #error or e.errorKind != ?#unrecoverable) {
      return null;
    };
    let id = e.conversionId ?? (return null);
    let c = tctx.treasury.conversions.get(id) ?? (return null);
    if (c.status != #refundReview) {
      return null;
    };
    ?{ e with costToRefund = ?{ amount = c.payAmount; conversionId = ?id; refundedBlock = null } };
  };

  func legacyPending(e : Btc.DepositEntry) : Bool {
    let failed = (e.stage == #delivered and e.errorKind == ?#refundFailed) or (e.stage == #error and e.errorKind == ?#unrecoverable);
    let noRefund = switch (e.btcRefund) { case (?_) { false }; case null { true } };
    failed and noRefund and e.ckbtcPendingSats > FEE or (e.costToRefund == null and e.stage == #error and e.errorKind == ?#unrecoverable and e.conversionId != null);
  };

  // Entry `index` of `caller` has a BTC cost send whose outcome is not
  // settled: it is not converted again until the send is resolved.
  func costOpen(tctx : TransferContext, caller : Principal, index : Nat) : Bool {
    for (c in tctx.retry.btcCosts.values()) {
      if (c.buyer == caller and c.depositIndex == index) {
        switch (c.attempt.outcome) {
          case (#succeeded(_)) {};
          case (_) { return true };
        };
      };
    };
    false;
  };

  // BTC cost send `n` arrived in `block`. Purchase not recorded (unknown
  // first outcome): its payment to refund is confirmed with that block and
  // the deposit entry no longer accounts for the cost.
  func costArrived(store : BtcDepositStore, tctx : TransferContext, n : Nat, block : Nat) {
    let c = tctx.retry.btcCosts.get(n) ?? (return);
    tctx.retry.btcCosts.add(n, { c with attempt = { c.attempt with outcome = #succeeded(block) } });
    if (c.conversionId == null) {
      RetryLib.confirmPayment(tctx, n, block);
      let debit = c.attempt.request.amount + (c.attempt.request.fee ?? FEE);
      updateEntry(store, c.buyer, c.depositIndex, func e = { e with ckbtcPendingSats = if (e.ckbtcPendingSats > debit) Nat.sub(e.ckbtcPendingSats, debit) else 0 });
    };
  };

  // Retry timer: resends BTC cost send `n` identically (same memo,
  // created_at_time and request) within 23 h, under its trace lock (also held
  // by a purchase in flight), released in a finally.
  func stepBtcCost(store : BtcDepositStore, tctx : TransferContext, n : Nat) : async () {
    let c = tctx.retry.btcCosts.get(n) ?? (return);
    switch (RetryLib.nextAction(c.attempt, RetryLib.now64())) {
      case (#resend) {};
      case (_) { return };
    };
    let key = RetryLib.lockKey(#PC, n);
    if (not RetryLib.tryLock(tctx.locks, key)) {
      return;
    };
    try {
      let sending = { c.attempt with sends = c.attempt.sends + 1 };
      RetryLib.setBtcCostAttempt(tctx, n, sending);
      let result = await RetryLib.sendBtcCounted(sending);
      RetryLib.setBtcCostAttempt(tctx, n, result);
      switch (result.outcome) {
        case (#succeeded(b)) { costArrived(store, tctx, n, b) };
        case (_) {};
      };
    } catch (_) {} finally {
      RetryLib.unlock(tctx.locks, key);
    };
  };

  // Timer pass over every unsettled BTC cost send (not while sales are paused).
  func retryBtcCosts(store : BtcDepositStore, ctx : SaleLib.PurchaseContext) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let now = RetryLib.now64();
    let ids = ctx.transfers.retry.btcCosts.entries().filter(
      func((_, c) : (Nat, RetryTypes.BtcCostSend)) : Bool = RetryLib.nextAction(c.attempt, now) == #resend
    ).map(func((n, _) : (Nat, RetryTypes.BtcCostSend)) : Nat = n).toArray();
    for (n in ids.values()) {
      await stepBtcCost(store, ctx.transfers, n);
    };
  };

  func btcRow(kind : RetryTypes.TransferKind, id : Nat, buyer : Principal, depositIndex : Nat, conversionId : ?Nat, purpose : ?RetryTypes.BtcRefundPurpose, a : RetryTypes.TransferAttempt) : RetryTypes.TransferReview {
    let noMemo = a.memo.size() == 0;
    {
      kind;
      purchaseId = id;
      block = switch (a.outcome) { case (#succeeded(b)) { ?b }; case (_) { null } };
      collect = null;
      token = a.request.token;
      memoText = if (noMemo) null else a.memo.decodeUtf8();
      memoHex = if (noMemo) null else ?RetryLib.hex(a.memo);
      createdAtTimeNs = if (a.created_at_time == 0) null else ?a.created_at_time;
      amount = a.request.amount;
      fee = a.request.fee;
      destination = ?a.request.to;
      sends = a.sends;
      lastError = a.lastError;
      buyer = ?buyer;
      depositIndex = ?depositIndex;
      conversionId;
      refundPurpose = purpose;
      outcome = ?a.outcome;
    };
  };

  // Admin "To review" BTC rows: BR refunds and BC cost sends to verify
  // (unknown outcome after 23 h), and BM costs to refund by hand.
  public func btcReview(store : BtcDepositStore, tctx : TransferContext) : [RetryTypes.TransferReview] {
    let now = RetryLib.now64();
    let rows = List.empty<RetryTypes.TransferReview>();
    for ((p, t) in store.purchases.entries()) {
      for (e in t.deposits.values()) {
        switch (e.btcRefund) {
          case (?r) {
            if (RetryLib.nextAction(r.attempt, now) == #needsReview) {
              rows.add(btcRow(#BR, r.attempt.n, p, e.index, e.conversionId, ?r.purpose, r.attempt));
            };
          };
          case null {};
        };
        switch (e.costToRefund) {
          case (?c) {
            switch (c.conversionId, c.refundedBlock) {
              case (?id, null) {
                rows.add({
                  kind = #BM;
                  purchaseId = id;
                  block = null;
                  collect = null;
                  token = #ckbtc;
                  memoText = null;
                  memoHex = null;
                  createdAtTimeNs = null;
                  amount = c.amount;
                  fee = null;
                  destination = ?{ owner = p; subaccount = null };
                  sends = 0;
                  lastError = ?"TTTI-T delivery failed after the ckBTC cost was sent to the treasury; refund it by hand";
                  buyer = ?p;
                  depositIndex = ?e.index;
                  conversionId = ?id;
                  refundPurpose = null;
                  outcome = null;
                });
              };
              case (_) {};
            };
          };
          case null {};
        };
      };
    };
    for ((n, c) in tctx.retry.btcCosts.entries()) {
      if (RetryLib.nextAction(c.attempt, now) == #needsReview) {
        rows.add(btcRow(#BC, n, c.buyer, c.depositIndex, c.conversionId, null, c.attempt));
      };
    };
    rows.toArray();
  };

  func findBr(store : BtcDepositStore, n : Nat) : ?(Principal, Btc.DepositEntry, Btc.BtcRefund) {
    for ((p, t) in store.purchases.entries()) {
      for (e in t.deposits.values()) {
        switch (e.btcRefund) {
          case (?r) { if (r.attempt.n == n) return ?(p, e, r) };
          case null {};
        };
      };
    };
    null;
  };

  // Admin: BR (id = BR attempt n) or BC (id = trace n) under review arrived
  // in `block`. Other kinds -> #notApplicable.
  public func markBtcArrived(store : BtcDepositStore, tctx : TransferContext, kind : RetryTypes.TransferKind, id : Nat, block : Nat) : RetryTypes.ReviewResult {
    let now = RetryLib.now64();
    switch (kind) {
      case (#BR) {
        let (p, e, r) = findBr(store, id) ?? (return #err(#notFound));
        if (RetryLib.nextAction(r.attempt, now) != #needsReview) {
          return #err(#notUnderReview);
        };
        updateEntry(store, p, e.index, func x = refundArrived(x, r, block));
        #ok;
      };
      case (#BC) {
        let c = tctx.retry.btcCosts.get(id) ?? (return #err(#notFound));
        if (RetryLib.nextAction(c.attempt, now) != #needsReview) {
          return #err(#notUnderReview);
        };
        costArrived(store, tctx, id, block);
        #ok;
      };
      case (_) { #err(#notApplicable) };
    };
  };

  // Admin: BR not arrived -> a new attempt (new memo and created_at_time)
  // sent by the timer. BC not arrived -> nothing was moved: the cost send and
  // its payment to refund are removed and the deposit is converted again by
  // the timer (a new purchase with a new trace and cost send).
  public func markBtcNotArrived(store : BtcDepositStore, tctx : TransferContext, kind : RetryTypes.TransferKind, id : Nat) : RetryTypes.ReviewResult {
    let now = RetryLib.now64();
    switch (kind) {
      case (#BR) {
        let (p, e, r) = findBr(store, id) ?? (return #err(#notFound));
        if (RetryLib.nextAction(r.attempt, now) != #needsReview) {
          return #err(#notUnderReview);
        };
        let fresh = RetryLib.newBtcRefundAttempt(tctx.retry, ?r.attempt, r.attempt.request, now);
        updateEntry(store, p, e.index, func x = { x with btcRefund = ?{ r with attempt = fresh } });
        #ok;
      };
      case (#BC) {
        let c = tctx.retry.btcCosts.get(id) ?? (return #err(#notFound));
        if (RetryLib.nextAction(c.attempt, now) != #needsReview) {
          return #err(#notUnderReview);
        };
        RetryLib.dropBtcCost(tctx, id);
        RetryLib.dropPayment(tctx, id);
        #ok;
      };
      case (_) { #err(#notApplicable) };
    };
  };

  // Records `block` on the BM cost to refund of conversion `conversionId`;
  // false when there is none still open.
  public func costRefunded(store : BtcDepositStore, conversionId : Nat, block : Nat) : Bool {
    for ((p, t) in store.purchases.entries()) {
      for (e in t.deposits.values()) {
        switch (e.costToRefund) {
          case (?c) {
            if (c.conversionId == ?conversionId and c.refundedBlock == null) {
              updateEntry(store, p, e.index, func x = { x with costToRefund = ?{ c with refundedBlock = ?block } });
              return true;
            };
          };
          case null {};
        };
      };
    };
    false;
  };

  // Admin: BM (id = conversion id) refunded by hand in `block`; the purchase
  // under #refundReview is set #refunded with the same block. Other kinds ->
  // #notApplicable.
  public func markBtcRefunded(store : BtcDepositStore, tctx : TransferContext, kind : RetryTypes.TransferKind, id : Nat, block : Nat) : RetryTypes.ReviewResult {
    switch (kind) {
      case (#BM) {
        if (not costRefunded(store, id, block)) {
          return #err(#notFound);
        };
        ignore RetryLib.markRefunded(tctx, #RF, id, block);
        #ok;
      };
      case (_) { #err(#notApplicable) };
    };
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

    let tctx = ctx.transfers;
    let queue = current().deposits.filter(func(e : Btc.DepositEntry) : Bool = toConvert(e) > FEE and not costOpen(tctx, caller, e.index)).reverse();
    for (queued in queue.values()) {
      let i = queued.index;
      let wanted = switch (entryAt(i)) { case (?e) { if (costOpen(tctx, caller, i)) 0 else toConvert(e) }; case null { 0 } };
      if (wanted > FEE) {
        let balance = switch (await PayTokenLib.balanceOf(payLedger, depositAccount)) {
          case (#ok(b)) { b };
          case (#err(_)) { return current() };
        };
        let amount = Nat.min(wanted, balance);
        if (amount > FEE) {
          switch (await SaleLib.purchaseFromDeposit(ctx, caller, subaccount, i, amount)) {
            case (#Ok(conversion)) {
              let excess = if (amount > conversion.payAmount) Nat.sub(amount, conversion.payAmount) else 0;
              // R1: the excess refund attempt is recorded before its send.
              let refund = openBtcRefund(tctx, caller, #excess, excess);
              save(
                i,
                func e = {
                  e with
                  stage = #delivered;
                  tttiDelivered = e.tttiDelivered + conversion.tttiAmount;
                  ckbtcPendingSats = excess;
                  conversionId = ?conversion.id;
                  errorKind = null;
                  errorMessage = null;
                  btcRefund = switch (refund) { case (?r) { ?r }; case null { e.btcRefund } };
                },
              );
              if (refund != null) await stepBtcRefund(store, tctx, caller, i);
            };
            case (#Err(err)) {
              switch (err.code) {
                case (#priceUnavailable(_)) {
                  save(i, func e = { e with stage = #pendingRate; ckbtcPendingSats = amount; errorKind = null; errorMessage = ?err.message });
                };
                case (#saleComplete or #belowMinimum(_)) {
                  // R2: the full refund attempt is recorded before its send.
                  let refund = openBtcRefund(tctx, caller, #fullRefund, amount);
                  save(i, func e = { e with stage = #error; ckbtcPendingSats = amount; errorKind = ?#unrecoverable; errorMessage = ?(err.message # "; the ckBTC is being refunded to your account minus the 10 sat ledger fee"); btcRefund = switch (refund) { case (?r) { ?r }; case null { e.btcRefund } } });
                  if (refund != null) await stepBtcRefund(store, tctx, caller, i);
                };
                case (#deliveryFailedRefundFailed) {
                  let paid = switch (err.conversion) { case (?c) { c.payAmount }; case null { 0 } };
                  let excess = if (amount > paid) Nat.sub(amount, paid) else 0;
                  let convId = switch (err.conversion) { case (?c) { ?c.id }; case null { null } };
                  // The excess goes through lib/retry.mo; the cost is refunded by hand (BM).
                  let refund = openBtcRefund(tctx, caller, #deliveryFailedExcess, excess);
                  save(
                    i,
                    func e = {
                      e with
                      stage = #error;
                      ckbtcPendingSats = excess;
                      conversionId = switch (convId) { case (?id) { ?id }; case null { e.conversionId } };
                      errorKind = ?#unrecoverable;
                      errorMessage = ?err.message;
                      btcRefund = switch (refund) { case (?r) { ?r }; case null { e.btcRefund } };
                      costToRefund = ?{ amount = paid; conversionId = convId; refundedBlock = null };
                    },
                  );
                  if (refund != null) await stepBtcRefund(store, tctx, caller, i);
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

    // Legacy entries (no created_at_time) are classified at first use.
    for (e in current().deposits.values()) {
      let withCost = legacyCost(tctx, e);
      let base = withCost ?? e;
      let withRefund = legacyRefund(tctx, caller, base);
      if (withCost != null or withRefund != null) {
        let updated = withRefund ?? base;
        save(e.index, func _ = updated);
      };
    };

    // R3: every BR attempt still to send follows the lib/retry.mo rule (same
    // request resent for 23 h, new attempt only after a known Err); not while
    // sales are paused.
    if (not ctx.sale.salesPaused) {
      let now = RetryLib.now64();
      for (e in current().deposits.values()) {
        if (brActive(e, now)) {
          await stepBtcRefund(store, tctx, caller, e.index);
        };
      };
    };
    current();
  };

  // Purchase flow: update_balance for the buyer subaccount, then finalize any
  // ckBTC available (delivery, refund beyond cap, or #pendingRate). The caller
  // (mixin or timer) holds the purchase lock for `caller`. Without a stored
  // tracking (acknowledgements required), the address is derived and a
  // tracking is stored only when a deposit is detected; otherwise an unsaved
  // #addressShown tracking with no deposits is returned ("no deposit yet").
  public func checkPurchase(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to check a Bitcoin deposit");
    };
    let fresh : ?DepositTracking = switch (store.purchases.get(caller)) {
      case (?_) { null };
      case null {
        if (not SaleLib.hasAccepted(ctx.acknowledgements, caller)) {
          return failure(#acknowledgementRequired, "Please accept the purchase acknowledgements first");
        };
        switch (await MinterLib.getBtcAddress(ctx.canister, ?purchaseSubaccount(caller))) {
          case (#ok(address)) { ?newTracking(#purchase, address) };
          case (#err(message)) {
            return failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
          };
        };
      };
    };
    let outcome = await MinterLib.updateBalance(ctx.canister, ?purchaseSubaccount(caller));
    let existing = store.purchases.get(caller);
    let latest = existing ?? (fresh ?? newTracking(#purchase, ""));
    let updated = { applyUpdate(latest, outcome) with lastCheckedAt = ?Time.now() };
    if (existing == null and updated.deposits.size() == 0) {
      return checkResult(updated, outcome);
    };
    store.purchases.add(caller, updated);
    let tracking = await* finalize(store, ctx, caller, updated);
    checkResult(tracking, outcome);
  };

  // Wallet flow: address of owner = caller, no subaccount. Nothing is stored.
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
        #Ok(store.wallets.get(caller) ?? newTracking(#wallet, address));
      };
      case (#err(message)) {
        failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
      };
    };
  };

  // Wallet flow: update_balance for owner = caller; records progress only.
  // Without a stored tracking, one is stored only when a deposit is detected.
  public func checkWallet(store : BtcDepositStore, caller : Principal) : async* BtcDepositResult {
    if (caller.isAnonymous()) {
      return failure(#anonymousCaller, "Please sign in to check a Bitcoin deposit");
    };
    let fresh : ?DepositTracking = switch (store.wallets.get(caller)) {
      case (?_) { null };
      case null {
        switch (await MinterLib.getBtcAddress(caller, null)) {
          case (#ok(address)) { ?newTracking(#wallet, address) };
          case (#err(message)) {
            return failure(#minterUnavailable, "The ckBTC minter could not be reached: " # message);
          };
        };
      };
    };
    let outcome = await MinterLib.updateBalance(caller, null);
    let existing = store.wallets.get(caller);
    let latest = existing ?? (fresh ?? newTracking(#wallet, ""));
    let updated = { applyUpdate(latest, outcome) with lastCheckedAt = ?Time.now() };
    if (existing != null or updated.deposits.size() > 0) {
      store.wallets.add(caller, updated);
    };
    checkResult(updated, outcome);
  };

  // Purchase ckBTC waiting for conversion or a failed excess refund (no minter
  // call needed).
  func needsFinalize(t : DepositTracking) : Bool {
    let now = RetryLib.now64();
    t.deposits.any(func(e : Btc.DepositEntry) : Bool = toConvert(e) > FEE or brActive(e, now) or legacyPending(e));
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
    activeAt : Int; // latest deposit updatedAt / detectedAt or lastCheckedAt
  };

  func lastActivity(t : DepositTracking) : Int {
    var at : Int = t.lastCheckedAt ?? 0;
    for (e in t.deposits.values()) {
      at := Int.max(at, Int.max(e.updatedAt, e.detectedAt));
    };
    at;
  };

  func mostRecentFirst(a : Candidate, b : Candidate) : Order.Order {
    Int.compare(b.activeAt, a.activeAt);
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

  // Background watch of the stored trackings, which all have at least one
  // deposit (a tracking is stored only once a deposit is detected): calls
  // update_balance so further deposits and confirmations are detected while
  // the page is closed, and finalizes purchase ckBTC into TTTI-T. Trackings
  // checked in the last 5 minutes are skipped; at most
  // MAX_MINTER_CALLS_PER_TICK minter calls, all purchase trackings first, then
  // wallet trackings, each group from the most recently active. Purchases
  // take the shared purchase lock per principal.
  public func retryPending(store : BtcDepositStore, ctx : SaleLib.PurchaseContext, inFlight : Set.Set<Principal>) : async* () {
    let now = Time.now();
    let purchasePolls = List.empty<Candidate>();
    let walletPolls = List.empty<Candidate>();
    let finalizeOnly = List.empty<Principal>();
    for ((principal, t) in store.purchases.entries()) {
      if (t.deposits.size() > 0) {
        if (checkedRecently(t, now)) {
          if (needsFinalize(t)) finalizeOnly.add(principal);
        } else {
          purchasePolls.add({ principal; kind = #purchase; activeAt = lastActivity(t) });
        };
      };
    };
    for ((principal, t) in store.wallets.entries()) {
      if (t.deposits.size() > 0 and not checkedRecently(t, now)) {
        walletPolls.add({ principal; kind = #wallet; activeAt = lastActivity(t) });
      };
    };
    let ordered = purchasePolls.toArray().sort(mostRecentFirst).concat(walletPolls.toArray().sort(mostRecentFirst));
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
    await retryBtcCosts(store, ctx);
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
