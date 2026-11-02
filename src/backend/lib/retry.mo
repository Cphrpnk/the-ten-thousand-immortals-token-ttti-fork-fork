import Array "mo:core/Array";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/retry";
import Treasury "../types/treasury";
import CyclesTypes "../types/cycles-reserve";
import TreasuryLib "treasury";
import CyclesReserveLib "cycles-reserve";
import PayTokenLib "pay-token";
import IcrcLib "icrc";
import DexTypes "../types/dex";
import DexReserveTypes "../types/dex-reserve";
import BatchTypes "../types/dex-batch";
import PageTypes "../types/page";
import IndicatorTypes "../types/dex-indicators";
import DexLib "dex";
import OwnerTypes "../types/owner-revenue";

// Common retry module for outgoing ledger transfers, and its use by treasury
// forwards (FW) and reserve shares (SH).
module {
  public type TransferPrefix = Types.TransferPrefix;
  public type TransferKind = Types.TransferKind;
  public type TransferRequest = Types.TransferRequest;
  public type TransferAttempt = Types.TransferAttempt;
  public type RetryStore = Types.RetryStore;
  public type RetryAction = Types.RetryAction;
  public type TransferReview = Types.TransferReview;
  public type ReviewResult = Types.ReviewResult;
  public type TransferLedger = Types.TransferLedger;
  public type PurchaseTrace = Types.PurchaseTrace;
  public type PaymentToRefund = Types.PaymentToRefund;
  public type CollectState = Types.CollectState;

  // Same attempt resent identically for 23 h after its created_at_time.
  public let RESEND_WINDOW_NS : Nat64 = 82_800_000_000_000;
  // Retry timer interval: 10 minutes.
  public let TIMER_INTERVAL_SECONDS : Nat = 600;
  public let MAX_MEMO_BYTES : Nat = 32;

  let HEX_DIGITS : [Text] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

  func nowNat64() : Nat64 = Time.now().toNat().toNat64();

  // --- Generic retry rule ----------------------------------------------------

  // "PC", "RF", "FW", "SH", "GR", "BR", "DD", "DW", "DQ".
  public func prefixText(prefix : TransferPrefix) : Text {
    switch (prefix) {
      case (#PC) { "PC" };
      case (#RF) { "RF" };
      case (#FW) { "FW" };
      case (#SH) { "SH" };
      case (#GR) { "GR" };
      case (#BR) { "BR" };
      case (#DD) { "DD" };
      case (#DW) { "DW" };
      case (#DQ) { "DQ" };
      case (#DC) { "DC" };
      case (#DL) { "DL" };
      case (#OW) { "OW" };
      case (#SR) { "SR" };
      case (#MF) { "MF" };
      case (#IR) { "IR" };
      case (#ST) { "ST" };
      case (#SW) { "SW" };
      case (#LQ) { "LQ" };
      case (#CF) { "CF" };
      case (#CY) { "CY" };
      case (#AB) { "AB" };
    };
  };

  // "TTTI-<prefix>-<n>" for m = 1, else "TTTI-<prefix>-<n>-<m>".
  public func memoText(prefix : TransferPrefix, n : Nat, m : Nat) : Text {
    let base = "TTTI-" # prefixText(prefix) # "-" # n.toText();
    if (m <= 1) base else base # "-" # m.toText();
  };

  // memoText as UTF-8 bytes (at most MAX_MEMO_BYTES).
  public func memoBlob(prefix : TransferPrefix, n : Nat, m : Nat) : Blob {
    let bytes = memoText(prefix, n, m).encodeUtf8();
    if (bytes.size() <= MAX_MEMO_BYTES) {
      bytes;
    } else {
      bytes.toArray().sliceToArray(0, MAX_MEMO_BYTES).toBlob();
    };
  };

  // Lowercase hex of `bytes`.
  public func hex(bytes : Blob) : Text {
    var out = "";
    for (b in bytes.toArray().values()) {
      let v = b.toNat();
      out #= HEX_DIGITS[v / 16] # HEX_DIGITS[v % 16];
    };
    out;
  };

  // Records a new attempt (call before the first await): n from `previous`
  // or a fresh global n, m = previous.attempt + 1 or 1, new memo and
  // created_at_time = now, outcome #pending, sends 0.
  public func newAttempt(store : RetryStore, prefix : TransferPrefix, previous : ?TransferAttempt, request : TransferRequest, now : Nat64) : TransferAttempt {
    let (n, m) = switch (previous) {
      case (?p) { (p.n, p.attempt + 1) };
      case null {
        let fresh = store.nextN;
        store.nextN += 1;
        (fresh, 1);
      };
    };
    {
      n;
      attempt = m;
      memo = memoBlob(prefix, n, m);
      created_at_time = now;
      request;
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
  };

  // icrc1_transfer arguments built exactly from the recorded attempt.
  public func transferArgs(attempt : TransferAttempt) : Treasury.IcpTransferArgs {
    {
      from_subaccount = attempt.request.from_subaccount;
      to = attempt.request.to;
      amount = attempt.request.amount;
      fee = attempt.request.fee;
      memo = ?attempt.memo;
      created_at_time = ?attempt.created_at_time;
    };
  };

  // The outcome of an earlier send is unknown: marked #unknown, or #pending
  // with an earlier send whose reply was never recorded (sends already counts
  // the current send).
  func outcomeUnknown(attempt : TransferAttempt) : Bool {
    switch (attempt.outcome) {
      case (#unknown) { true };
      case (#pending) { attempt.sends > 1 };
      case (_) { false };
    };
  };

  // Ok or #Duplicate -> #succeeded(block); Err -> #failed(text), except an
  // #unknown attempt stays #unknown (lastError updated).
  public func applyResult(attempt : TransferAttempt, result : Treasury.IcpTransferResult, describe : Treasury.IcpTransferError -> Text) : TransferAttempt {
    switch (result) {
      case (#Ok(block)) { { attempt with outcome = #succeeded(block) } };
      case (#Err(#Duplicate({ duplicate_of }))) {
        { attempt with outcome = #succeeded(duplicate_of) };
      };
      case (#Err(err)) {
        let text = describe(err);
        if (outcomeUnknown(attempt)) {
          { attempt with outcome = #unknown; lastError = ?text };
        } else {
          { attempt with outcome = #failed(text); lastError = ?text };
        };
      };
    };
  };

  // Rejected or trapped send -> #unknown, lastError = message.
  public func applyReject(attempt : TransferAttempt, message : Text) : TransferAttempt {
    { attempt with outcome = #unknown; lastError = ?message };
  };

  // One send of an attempt whose `sends` already counts this send.
  func sendCounted(ledger : TransferLedger, attempt : TransferAttempt, describe : Treasury.IcpTransferError -> Text) : async TransferAttempt {
    try {
      applyResult(attempt, await ledger.icrc1_transfer(transferArgs(attempt)), describe);
    } catch (e) {
      applyReject(attempt, "The ledger call was rejected: " # e.message());
    };
  };

  // One send of the recorded request (sends + 1), classified. Never traps.
  public func send(ledger : TransferLedger, attempt : TransferAttempt, describe : Treasury.IcpTransferError -> Text) : async TransferAttempt {
    await sendCounted(ledger, { attempt with sends = attempt.sends + 1 }, describe);
  };

  func withinWindow(attempt : TransferAttempt, now : Nat64) : Bool {
    now < attempt.created_at_time or now - attempt.created_at_time < RESEND_WINDOW_NS;
  };

  // The retry rule for `attempt` at `now`.
  public func nextAction(attempt : TransferAttempt, now : Nat64) : RetryAction {
    switch (attempt.outcome) {
      case (#succeeded(_)) { #done };
      case (#failed(_)) { #newAttempt };
      case (#unknown) { if (withinWindow(attempt, now)) #resend else #needsReview };
      case (#pending) {
        if (withinWindow(attempt, now)) {
          #resend;
        } else if (attempt.sends == 0) {
          // Never sent: its created_at_time is too old, so a new attempt.
          #newAttempt;
        } else {
          #needsReview;
        };
      };
    };
  };

  // Lock key of one transfer, e.g. "FW:12".
  public func lockKey(prefix : TransferPrefix, id : Nat) : Text {
    prefixText(prefix) # ":" # id.toText();
  };

  // Takes the transfer's lock; false when it is already held.
  public func tryLock(locks : Set.Set<Text>, key : Text) : Bool {
    if (locks.contains(key)) {
      return false;
    };
    locks.add(key);
    true;
  };

  // Releases the lock (called in a finally).
  public func unlock(locks : Set.Set<Text>, key : Text) {
    locks.remove(key);
  };

  // --- BTC (ckBTC) sends: refunds (BR) and cost sends (BC) -------------------

  // "TTTI-BR-<n>-<m>" (always with the attempt index), <= 32 bytes.
  public func btcRefundMemo(n : Nat, m : Nat) : Blob {
    ("TTTI-BR-" # n.toText() # "-" # m.toText()).encodeUtf8();
  };

  // New BR attempt (memo TTTI-BR-<n>-<m>, created_at_time = now, #pending);
  // call before the first await and store it on the deposit entry.
  public func newBtcRefundAttempt(store : RetryStore, previous : ?TransferAttempt, request : TransferRequest, now : Nat64) : TransferAttempt {
    let a = newAttempt(store, #BR, previous, request, now);
    { a with memo = btcRefundMemo(a.n, a.attempt) };
  };

  // --- Guarantee redemption payouts (GR) ----------------------------------------

  // "TTTI-GR-<n>-<m>" (always with the attempt index), <= 32 bytes.
  public func redemptionPayoutMemo(n : Nat, m : Nat) : Blob {
    ("TTTI-GR-" # n.toText() # "-" # m.toText()).encodeUtf8();
  };

  // New GR attempt (memo TTTI-GR-<n>-<m>, created_at_time = now, #pending);
  // call before the first await and store it on the redemption record.
  public func newRedemptionPayoutAttempt(store : RetryStore, previous : ?TransferAttempt, request : TransferRequest, now : Nat64) : TransferAttempt {
    let a = newAttempt(store, #GR, previous, request, now);
    { a with memo = redemptionPayoutMemo(a.n, a.attempt) };
  };

  // Legacy BTC refund failure whose outcome is unknown (rejected call, trap or
  // ambiguous message), recorded without memo nor created_at_time: goes
  // straight to review, never resent.
  public func legacyUnknownBtcRefund(store : RetryStore, request : TransferRequest, message : ?Text) : TransferAttempt {
    let n = store.nextN;
    store.nextN += 1;
    {
      n;
      attempt = 0;
      memo = "" : Blob;
      created_at_time = 0 : Nat64;
      request;
      sends = 1;
      lastError = message;
      outcome = #unknown;
    };
  };

  // A legacy failure text is a known ledger Err unless it is ambiguous. The
  // ledger Err texts "The <sym> ledger rejected the ..." (BadFee, BadBurn,
  // TooOld, CreatedInFuture) stay known Errs; any other "rejected" is a call
  // rejection, so ambiguous.
  public func ambiguousFailure(message : ?Text) : Bool {
    switch (message) {
      case (?m) {
        m.contains(#text "could not be reached") or m.contains(#text "interrupted") or (m.contains(#text "rejected") and not m.contains(#text "ledger rejected the "));
      };
      case null { true };
    };
  };

  // One send of a ckBTC attempt (whose `sends` already counts this send)
  // through PayTokenLib.sendFromSubaccount with the attempt's memo and
  // created_at_time, classified: Ok / #Duplicate -> #succeeded; ledger Err ->
  // #failed (an unknown outcome stays #unknown); rejected call -> #unknown.
  public func sendBtcCounted(attempt : TransferAttempt) : async TransferAttempt {
    let token = attempt.request.token;
    let fee = attempt.request.fee ?? PayTokenLib.expectedFee(token);
    let subaccount = attempt.request.from_subaccount ?? ("" : Blob);
    try {
      switch (await PayTokenLib.sendFromSubaccount(PayTokenLib.ledger(token), token, subaccount, attempt.request.to, attempt.request.amount + fee, attempt.memo, attempt.created_at_time)) {
        case (#ok(block)) { { attempt with outcome = #succeeded(block) } };
        case (#ledgerError(err)) {
          let text = PayTokenLib.transferFromErrorMessage(token, err);
          if (outcomeUnknown(attempt)) {
            { attempt with outcome = #unknown; lastError = ?text };
          } else {
            { attempt with outcome = #failed(text); lastError = ?text };
          };
        };
        case (#callFailed(m)) {
          applyReject(attempt, "the " # PayTokenLib.symbol(token) # " ledger could not be reached: " # m);
        };
      };
    } catch (e) {
      applyReject(attempt, "the " # PayTokenLib.symbol(token) # " ledger could not be reached: " # e.message());
    };
  };

  // Records the BTC cost send of purchase trace `trace` (its TTTI-PC-<n> memo
  // and created_at_time, this send counted) before the first await.
  public func openBtcCost(ctx : TransferContext, trace : PurchaseTrace, depositIndex : Nat, request : TransferRequest) : TransferAttempt {
    let attempt : TransferAttempt = {
      n = trace.n;
      attempt = 1;
      memo = trace.memo;
      created_at_time = trace.created_at_time;
      request;
      sends = 1;
      lastError = null;
      outcome = #pending;
    };
    ctx.retry.btcCosts.add(trace.n, { buyer = trace.buyer; depositIndex; conversionId = null; attempt });
    attempt;
  };

  // Stores the classified attempt of BTC cost send `n`.
  public func setBtcCostAttempt(ctx : TransferContext, n : Nat, attempt : TransferAttempt) {
    switch (ctx.retry.btcCosts.get(n)) {
      case (?c) { ctx.retry.btcCosts.add(n, { c with attempt }) };
      case null {};
    };
  };

  // Links BTC cost send `n` to its recorded conversion.
  public func setBtcCostConversion(ctx : TransferContext, n : Nat, conversionId : Nat) {
    switch (ctx.retry.btcCosts.get(n)) {
      case (?c) { ctx.retry.btcCosts.add(n, { c with conversionId = ?conversionId }) };
      case null {};
    };
  };

  // Known ledger Err on the first cost send: nothing moved, record removed.
  public func dropBtcCost(ctx : TransferContext, n : Nat) {
    ctx.retry.btcCosts.remove(n);
  };

  // Payment to refund `n` confirmed in `block` (a cost send whose outcome
  // was unknown arrived).
  public func confirmPayment(ctx : TransferContext, n : Nat, block : Nat) {
    switch (ctx.retry.toRefund.get(n)) {
      case (?p) { ctx.retry.toRefund.add(n, { p with collect = #confirmed; block = ?block }) };
      case null {};
    };
  };

  // Removes payment to refund `n` (the cost send never happened).
  public func dropPayment(ctx : TransferContext, n : Nat) {
    ctx.retry.toRefund.remove(n);
  };

  public func now64() : Nat64 = nowNat64();

  // --- Forwards (FW) and reserve shares (SH) ---------------------------------

  public type TransferContext = {
    retry : RetryStore;
    treasury : TreasuryLib.TreasuryStore;
    cyclesReserve : CyclesTypes.CyclesReserveStore;
    locks : Set.Set<Text>; // transient, one lock per transfer
    canister : Principal;
    // The sale store (same object as PurchaseContext.sale): `reserved` is
    // changed only through purchase traces (openTrace / releaseTrace).
    // While salesPaused is true no FW, SH, RF or BR transfer is sent.
    sale : { var reserved : Nat; var salesPaused : Bool };
    // Mint revenue: accumulated shares, owner sends and admin withdrawals
    // (OW) and the one-time treasury sweep (SR + OW, history).
    ownerRevenue : OwnerTypes.OwnerRevenueStore;
    // Mint revenue routing: receiving wallets, wallet changes, one-time
    // settlements and fee-account moves (ST).
    mintRevenue : OwnerTypes.MintRevenueStore;
  };

  type Plan = {
    #request : TransferRequest;
    #notRequired;
    #noTarget; // treasury account not configured yet: kept pending
  };

  func forwardPlan(ctx : TransferContext, conversion : Treasury.Conversion) : Plan {
    let token = conversion.payToken;
    // New forwards go to the contract's own mint treasury account; funds
    // already at the old external accounts are left where they are.
    let target = TreasuryLib.mintTreasuryAccount(ctx.canister, token);
    let canisterAccount : Types.Account = { owner = ctx.canister; subaccount = null };
    if (target == canisterAccount) {
      return #notRequired;
    };
    let fee = PayTokenLib.expectedFee(token);
    let base = CyclesReserveLib.forwardBase(ctx.cyclesReserve, conversion);
    if (base <= fee) {
      return #notRequired;
    };
    #request({ token; from_subaccount = null; to = target; amount = Nat.sub(base, fee); fee = ?fee });
  };

  // The forward request of a conversion (treasury token account, forward base
  // minus the ledger fee); null when not required (zero amount or canister account).
  public func forwardRequest(ctx : TransferContext, conversion : Treasury.Conversion) : ?TransferRequest {
    switch (forwardPlan(ctx, conversion)) {
      case (#request(r)) { ?r };
      case (_) { null };
    };
  };

  // The reserve share request (default account -> reserve account, ICP fee).
  public func shareRequest(ctx : TransferContext, share : CyclesTypes.ReserveShare) : ?TransferRequest {
    if (share.shareE8s == 0) {
      return null;
    };
    ?{
      token = #icp;
      from_subaccount = null;
      to = CyclesReserveLib.reserveAccount(ctx.canister);
      amount = share.shareE8s;
      fee = ?TreasuryLib.ICP_FEE;
    };
  };

  func describeFor(token : Types.PayToken) : Treasury.IcpTransferError -> Text {
    func(err : Treasury.IcpTransferError) : Text {
      PayTokenLib.transferFromErrorMessage(token, err);
    };
  };

  func setForward(ctx : TransferContext, id : Nat, forward : Treasury.ForwardStatus) {
    switch (ctx.treasury.conversions.get(id)) {
      case (?c) { ctx.treasury.conversions.add(id, { c with forward }) };
      case null {};
    };
  };

  func setShare(ctx : TransferContext, id : Nat, transfer : CyclesTypes.ReserveTransferStatus) {
    switch (ctx.cyclesReserve.shares.get(id)) {
      case (?s) { ctx.cyclesReserve.shares.add(id, { s with transfer }) };
      case null {};
    };
  };

  // One step of the rule for a #pending forward: at most one send. Caller holds the lock.
  func stepForward(ctx : TransferContext, id : Nat) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let conversion = ctx.treasury.conversions.get(id) ?? (return);
    if (conversion.status != #completed or conversion.forward != #pending) {
      return;
    };
    let now = nowNat64();
    let existing = ctx.retry.forwards.get(id);
    let attempt = switch (existing) {
      case (?a) {
        switch (nextAction(a, now)) {
          case (#done) {
            switch (a.outcome) {
              case (#succeeded(block)) { setForward(ctx, id, #forwarded(block)) };
              case (_) {};
            };
            return;
          };
          case (#needsReview) {
            setForward(ctx, id, #needsReview);
            return;
          };
          case (#resend) { a };
          case (#newAttempt) {
            switch (forwardPlan(ctx, conversion)) {
              case (#request(r)) { newAttempt(ctx.retry, #FW, existing, r, now) };
              case (#notRequired) {
                setForward(ctx, id, #notRequired);
                return;
              };
              case (#noTarget) { return };
            };
          };
        };
      };
      case null {
        switch (forwardPlan(ctx, conversion)) {
          case (#request(r)) { newAttempt(ctx.retry, #FW, null, r, now) };
          case (#notRequired) {
            setForward(ctx, id, #notRequired);
            return;
          };
          case (#noTarget) { return };
        };
      };
    };
    // Recorded (with this send counted) before the await.
    let sending = { attempt with sends = attempt.sends + 1 };
    ctx.retry.forwards.add(id, sending);
    let token = sending.request.token;
    let result = await sendCounted(PayTokenLib.ledger(token), sending, describeFor(token));
    ctx.retry.forwards.add(id, result);
    switch (result.outcome) {
      case (#succeeded(block)) { setForward(ctx, id, #forwarded(block)) };
      case (_) {};
    };
  };

  // One step of the rule for a #pending reserve share: at most one send. Caller holds the lock.
  func stepShare(ctx : TransferContext, id : Nat) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let share = ctx.cyclesReserve.shares.get(id) ?? (return);
    if (share.transfer != #pending) {
      return;
    };
    let now = nowNat64();
    let existing = ctx.retry.shares.get(id);
    let attempt = switch (existing) {
      case (?a) {
        switch (nextAction(a, now)) {
          case (#done) {
            switch (a.outcome) {
              case (#succeeded(block)) { setShare(ctx, id, #transferred(block)) };
              case (_) {};
            };
            return;
          };
          case (#needsReview) {
            setShare(ctx, id, #needsReview);
            return;
          };
          case (#resend) { a };
          case (#newAttempt) {
            switch (shareRequest(ctx, share)) {
              case (?r) { newAttempt(ctx.retry, #SH, existing, r, now) };
              case null {
                setShare(ctx, id, #transferred(0));
                return;
              };
            };
          };
        };
      };
      case null {
        switch (shareRequest(ctx, share)) {
          case (?r) { newAttempt(ctx.retry, #SH, null, r, now) };
          case null {
            setShare(ctx, id, #transferred(0));
            return;
          };
        };
      };
    };
    let sending = { attempt with sends = attempt.sends + 1 };
    ctx.retry.shares.add(id, sending);
    let result = await sendCounted(CyclesReserveLib.icpLedger(), sending, describeFor(#icp));
    ctx.retry.shares.add(id, result);
    switch (result.outcome) {
      case (#succeeded(block)) {
        setShare(ctx, id, #transferred(block));
        await CyclesReserveLib.refreshReserveBalance(ctx.cyclesReserve, ctx.canister);
      };
      case (_) {};
    };
  };

  // Used by the purchase execute: records the forward attempt (or
  // #notRequired) and sends it once, without retry, under its lock.
  public func sendForward(ctx : TransferContext, conversionId : Nat) : async () {
    let key = lockKey(#FW, conversionId);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepForward(ctx, conversionId);
    } catch (_) {} finally {
      unlock(ctx.locks, key);
    };
  };

  // Same for the reserve share of an ICP purchase.
  public func sendShare(ctx : TransferContext, conversionId : Nat) : async () {
    let key = lockKey(#SH, conversionId);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepShare(ctx, conversionId);
    } catch (_) {} finally {
      unlock(ctx.locks, key);
    };
  };

  // --- Purchase refunds (RF) -------------------------------------------------

  // Refund of `amount` paid by `buyer`: amount minus the ledger fee to the
  // buyer's default account, explicit fee; null when the amount does not
  // cover the fee.
  public func refundRequest(token : Types.PayToken, buyer : Principal, amount : Nat) : ?TransferRequest {
    let fee = PayTokenLib.expectedFee(token);
    if (amount <= fee) {
      return null;
    };
    ?{ token; from_subaccount = null; to = { owner = buyer; subaccount = null }; amount = Nat.sub(amount, fee); fee = ?fee };
  };

  func setStatus(ctx : TransferContext, id : Nat, status : Treasury.ConversionStatus, message : ?Text) {
    switch (ctx.treasury.conversions.get(id)) {
      case (?c) {
        ctx.treasury.conversions.add(id, { c with status; message = switch (message) { case (?m) { ?m }; case null { c.message } } });
      };
      case null {};
    };
  };

  func refundedMessage(token : Types.PayToken, block : Nat, how : Text) : Text {
    let sym = PayTokenLib.symbol(token);
    "TTTI-T delivery failed; the " # sym # " was refunded minus the " # PayTokenLib.formatAmount(token, PayTokenLib.expectedFee(token)) # " " # sym # " ledger fee (" # how # ", block " # block.toText() # ")";
  };

  // Sets conversion `id` #refunded in `block` (and its RF attempt #succeeded).
  func refundedIn(ctx : TransferContext, conversion : Treasury.Conversion, block : Nat, how : Text) {
    switch (ctx.retry.refunds.get(conversion.id)) {
      case (?a) { ctx.retry.refunds.add(conversion.id, { a with outcome = #succeeded(block) }) };
      case null {};
    };
    setStatus(ctx, conversion.id, #refunded, ?refundedMessage(conversion.payToken, block, how));
  };

  // Records the first RF attempt (memo TTTI-RF-<n>) of conversion `id`. Call
  // before any await, with the conversion recorded #refundFailed.
  public func openRefund(ctx : TransferContext, id : Nat, request : TransferRequest) {
    ctx.retry.refunds.add(id, newAttempt(ctx.retry, #RF, null, request, nowNat64()));
  };

  // One step of the rule for a #refundFailed purchase: at most one send, and
  // only when the canister balance covers amount plus fee (otherwise it
  // waits). Caller holds the lock.
  func stepRefund(ctx : TransferContext, id : Nat) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let conversion = ctx.treasury.conversions.get(id) ?? (return);
    if (conversion.status != #refundFailed) {
      return;
    };
    let now = nowNat64();
    let existing = ctx.retry.refunds.get(id);
    let attempt = switch (existing) {
      case (?a) {
        switch (nextAction(a, now)) {
          case (#done) {
            switch (a.outcome) {
              case (#succeeded(block)) { refundedIn(ctx, conversion, block, "TTTI-RF transfer") };
              case (_) {};
            };
            return;
          };
          case (#needsReview) {
            setStatus(ctx, id, #refundReview, null);
            return;
          };
          case (#resend) { a };
          case (#newAttempt) {
            let fresh = newAttempt(ctx.retry, #RF, existing, a.request, now);
            ctx.retry.refunds.add(id, fresh);
            fresh;
          };
        };
      };
      case null {
        switch (refundRequest(conversion.payToken, conversion.depositor, conversion.payAmount)) {
          case (?r) {
            let fresh = newAttempt(ctx.retry, #RF, null, r, now);
            ctx.retry.refunds.add(id, fresh);
            fresh;
          };
          case null {
            setStatus(ctx, id, #refundReview, null);
            return;
          };
        };
      };
    };
    let token = attempt.request.token;
    let ledger = PayTokenLib.ledger(token);
    let fee = attempt.request.fee ?? PayTokenLib.expectedFee(token);
    switch (await PayTokenLib.balanceOf(ledger, { owner = ctx.canister; subaccount = attempt.request.from_subaccount })) {
      case (#ok(balance)) {
        if (balance < attempt.request.amount + fee) {
          return;
        };
      };
      case (#err(_)) { return };
    };
    // Re-read after the balance await: send only the attempt still recorded.
    let current = ctx.treasury.conversions.get(id) ?? (return);
    let latest = ctx.retry.refunds.get(id) ?? (return);
    if (ctx.sale.salesPaused or current.status != #refundFailed or latest.n != attempt.n or latest.attempt != attempt.attempt) {
      return;
    };
    let sending = { latest with sends = latest.sends + 1 };
    ctx.retry.refunds.add(id, sending);
    let result = await sendCounted(ledger, sending, describeFor(token));
    ctx.retry.refunds.add(id, result);
    switch (result.outcome) {
      case (#succeeded(block)) { refundedIn(ctx, current, block, "TTTI-RF transfer") };
      case (_) {};
    };
  };

  // Used by the purchase execute and the timer: one step of the refund of
  // conversion `conversionId` under its lock (released in a finally).
  public func sendRefund(ctx : TransferContext, conversionId : Nat) : async () {
    let key = lockKey(#RF, conversionId);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepRefund(ctx, conversionId);
    } catch (_) {} finally {
      unlock(ctx.locks, key);
    };
  };

  // --- Purchase traces (PC) and payments to refund ---------------------------

  // Writes the purchase trace (memo TTTI-PC-<n>, created_at_time = now),
  // reserves `reserved` TTTI-T in sale.reserved and takes the trace lock.
  // Call before the collect await; release the lock with endTrace in a finally.
  public func openTrace(ctx : TransferContext, buyer : Principal, token : Types.PayToken, amount : Nat, reserved : Nat) : PurchaseTrace {
    let n = ctx.retry.nextN;
    ctx.retry.nextN += 1;
    let trace : PurchaseTrace = {
      n;
      buyer;
      token;
      amount;
      reserved;
      created_at_time = nowNat64();
      memo = memoBlob(#PC, n, 1);
    };
    ctx.retry.traces.add(n, trace);
    ctx.sale.reserved += reserved;
    ignore tryLock(ctx.locks, lockKey(#PC, n));
    trace;
  };

  // Releases the trace lock (the purchase is no longer in flight).
  public func endTrace(ctx : TransferContext, n : Nat) {
    unlock(ctx.locks, lockKey(#PC, n));
  };

  // The single place where sale.reserved is released: removes trace `n` and
  // its reservation. No trace -> nothing released (no double release).
  func releaseTrace(ctx : TransferContext, n : Nat) : ?PurchaseTrace {
    switch (ctx.retry.traces.take(n)) {
      case (?trace) {
        ctx.sale.reserved := if (ctx.sale.reserved >= trace.reserved) Nat.sub(ctx.sale.reserved, trace.reserved) else 0;
        ?trace;
      };
      case null { null };
    };
  };

  // Purchase recorded (the reservation then counts as sold) or known Err on
  // the collect: trace removed, reservation released.
  public func closeTrace(ctx : TransferContext, n : Nat) {
    ignore releaseTrace(ctx, n);
  };

  // Unknown collect outcome or crash after the debit: the trace becomes a
  // payment to refund and its reservation is released.
  public func traceToRefund(ctx : TransferContext, n : Nat, collect : CollectState, block : ?Nat) {
    switch (releaseTrace(ctx, n)) {
      case (?t) {
        ctx.retry.toRefund.add(
          n,
          {
            n;
            buyer = t.buyer;
            token = t.token;
            amount = t.amount;
            reserved = t.reserved;
            created_at_time = t.created_at_time;
            memo = t.memo;
            collect;
            block;
            detectedAt = Time.now();
          },
        );
      };
      case null {};
    };
  };

  // True while trace `n` exists.
  public func hasTrace(ctx : TransferContext, n : Nat) : Bool {
    ctx.retry.traces.containsKey(n);
  };

  // Traces left by a crash or an upgrade (no purchase in flight holds their
  // lock) -> payments to refund with collect #unknown.
  func sweepTraces(ctx : TransferContext) {
    let stale = ctx.retry.traces.keys().filter(func(n : Nat) : Bool = not ctx.locks.contains(lockKey(#PC, n))).toArray();
    for (n in stale.values()) {
      traceToRefund(ctx, n, #unknown, null);
    };
  };

  // Timer pass: leftover purchase traces become payments to refund; every
  // #pending FW/SH transfer and #refundFailed purchase refund follows
  // nextAction (resend, new attempt, or review after 23 h of unknown outcome).
  // While sales are paused nothing is sent; stored attempts stay unchanged.
  public func runRetries(ctx : TransferContext) : async () {
    sweepTraces(ctx);
    // Owner sends (OW) and the one-time treasury sweep (SR first); owner
    // sends follow the pause inside.
    try { await runOwnerRetries(ctx) } catch (_) {};
    if (ctx.sale.salesPaused) {
      return;
    };
    let forwardIds = ctx.treasury.conversions.values().filter(
      func c = c.status == #completed and c.forward == #pending
    ).map(func c = c.id).toArray();
    for (id in forwardIds.values()) {
      await sendForward(ctx, id);
    };
    let shareIds = ctx.cyclesReserve.shares.values().filter(
      func s = s.transfer == #pending
    ).map(func s = s.conversionId).toArray();
    for (id in shareIds.values()) {
      await sendShare(ctx, id);
    };
    let refundIds = ctx.treasury.conversions.values().filter(
      func c = c.status == #refundFailed
    ).map(func c = c.id).toArray();
    for (id in refundIds.values()) {
      await sendRefund(ctx, id);
    };
  };

  // 10-minute recurring timer; armed on every install and upgrade.
  public func startTimer<system>(ctx : TransferContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(TIMER_INTERVAL_SECONDS),
      func() : async () { await runRetries(ctx) },
    );
  };

  public func review(kind : TransferKind, purchaseId : Nat, token : Types.PayToken, attempt : ?TransferAttempt, fallback : ?TransferRequest) : TransferReview {
    switch (attempt) {
      case (?a) {
        {
          kind;
          purchaseId;
          block = null;
          collect = null;
          token = a.request.token;
          memoText = a.memo.decodeUtf8();
          memoHex = ?hex(a.memo);
          createdAtTimeNs = ?a.created_at_time;
          amount = a.request.amount;
          fee = a.request.fee;
          destination = ?a.request.to;
          sends = a.sends;
          lastError = a.lastError;
          buyer = null;
          depositIndex = null;
          conversionId = null;
          refundPurpose = null;
          outcome = ?a.outcome;
        };
      };
      case null {
        // Legacy transfer sent without memo or created_at_time.
        {
          kind;
          purchaseId;
          block = null;
          collect = null;
          token;
          memoText = null;
          memoHex = null;
          createdAtTimeNs = null;
          amount = switch (fallback) { case (?r) { r.amount }; case null { 0 } };
          fee = switch (fallback) { case (?r) { r.fee }; case null { null } };
          destination = switch (fallback) { case (?r) { ?r.to }; case null { null } };
          sends = 0;
          lastError = null;
          buyer = null;
          depositIndex = null;
          conversionId = null;
          refundPurpose = null;
          outcome = null;
        };
      };
    };
  };

  func paymentReview(p : PaymentToRefund) : TransferReview {
    {
      kind = #PC;
      purchaseId = p.n;
      block = p.block;
      collect = ?p.collect;
      token = p.token;
      memoText = p.memo.decodeUtf8();
      memoHex = ?hex(p.memo);
      createdAtTimeNs = ?p.created_at_time;
      amount = p.amount;
      fee = ?PayTokenLib.expectedFee(p.token);
      destination = ?{ owner = p.buyer; subaccount = null };
      sends = 1;
      lastError = ?(
        switch (p.collect) {
          case (#confirmed) { "Collected, but no purchase was recorded" };
          case (#unknown) { "Collect outcome unknown (rejected call, crash or upgrade); the debit may not exist" };
        }
      );
      buyer = null;
      depositIndex = null;
      conversionId = null;
      refundPurpose = null;
      outcome = null;
    };
  };

  // Every FW and SH transfer in #needsReview, every #refundReview purchase
  // refund (RF) and every payment to refund (PC).
  public func toReview(ctx : TransferContext) : [TransferReview] {
    let forwards = ctx.treasury.conversions.values().filter(
      func c = c.forward == #needsReview
    ).map(
      func c = review(#FW, c.id, c.payToken, ctx.retry.forwards.get(c.id), forwardRequest(ctx, c))
    ).toArray();
    let shares = ctx.cyclesReserve.shares.values().filter(
      func s = s.transfer == #needsReview
    ).map(
      func s = review(#SH, s.conversionId, #icp, ctx.retry.shares.get(s.conversionId), shareRequest(ctx, s))
    ).toArray();
    let refunds = ctx.treasury.conversions.values().filter(
      func c = c.status == #refundReview
    ).map(
      func c = review(#RF, c.id, c.payToken, ctx.retry.refunds.get(c.id), refundRequest(c.payToken, c.depositor, c.payAmount))
    ).toArray();
    let payments = ctx.retry.toRefund.values().map(paymentReview).toArray();
    let owners = ctx.ownerRevenue.sends.values().filter(
      func(s : OwnerTypes.OwnerSend) : Bool = s.status == #needsReview
    ).map(
      func(s : OwnerTypes.OwnerSend) : TransferReview = review(#OW, s.id, s.token, ?s.attempt, null)
    ).toArray();
    let reserveTopUp = switch (ctx.ownerRevenue.sweep.reserveTopUp) {
      case (?a) {
        switch (nextAction(a, nowNat64())) {
          case (#needsReview) { [review(#SR, a.n, #icp, ?a, null)] };
          case (_) { [] };
        };
      };
      case null { [] };
    };
    forwards.concat(shares).concat(refunds).concat(payments).concat(owners).concat(reserveTopUp);
  };

  // The #refundReview conversion `id`, or the review error.
  func refundUnderReview(ctx : TransferContext, id : Nat) : { #ok : Treasury.Conversion; #err : Types.ReviewError } {
    switch (ctx.treasury.conversions.get(id)) {
      case (?c) { if (c.status == #refundReview) #ok(c) else #err(#notUnderReview) };
      case null { #err(#notFound) };
    };
  };

  // Admin verification: the transfer arrived in `block` -> #forwarded / #transferred.
  public func markArrived(ctx : TransferContext, kind : TransferKind, purchaseId : Nat, block : Nat) : ReviewResult {
    switch (kind) {
      case (#FW) {
        let conversion = ctx.treasury.conversions.get(purchaseId) ?? (return #err(#notFound));
        if (conversion.forward != #needsReview) {
          return #err(#notUnderReview);
        };
        switch (ctx.retry.forwards.get(purchaseId)) {
          case (?a) { ctx.retry.forwards.add(purchaseId, { a with outcome = #succeeded(block) }) };
          case null {};
        };
        setForward(ctx, purchaseId, #forwarded(block));
      };
      case (#SH) {
        let share = ctx.cyclesReserve.shares.get(purchaseId) ?? (return #err(#notFound));
        if (share.transfer != #needsReview) {
          return #err(#notUnderReview);
        };
        switch (ctx.retry.shares.get(purchaseId)) {
          case (?a) { ctx.retry.shares.add(purchaseId, { a with outcome = #succeeded(block) }) };
          case null {};
        };
        setShare(ctx, purchaseId, #transferred(block));
      };
      case (#RF) {
        switch (refundUnderReview(ctx, purchaseId)) {
          case (#ok(c)) { refundedIn(ctx, c, block, "verified by the admin") };
          case (#err(e)) { return #err(e) };
        };
      };
      case (#PC) { return #err(#notApplicable) };
      case (#OW) {
        let s = ctx.ownerRevenue.sends.get(purchaseId) ?? (return #err(#notFound));
        if (s.status != #needsReview) {
          return #err(#notUnderReview);
        };
        storeOwnerSend(ctx, { s with attempt = { s.attempt with outcome = #succeeded(block) }; status = #sent(block) });
      };
      case (#SR) {
        let a = reserveTopUpUnderReview(ctx, purchaseId) ?? (return #err(#notUnderReview));
        setSweep(ctx, { ctx.ownerRevenue.sweep with reserveTopUp = ?{ a with outcome = #succeeded(block) } });
      };
      // BTC rows are handled by lib/btc-deposit.mo (deposit entries).
      // BTC rows are handled by lib/btc-deposit.mo, GR rows by lib/guarantee.mo.
      // DEX rows (DD, DW, DQ) are handled by markDexArrived.
      // Mint-fee rows (MF) are not handled here.
      case (#BR or #BC or #BM or #GR or #DD or #DW or #DQ or #DC or #DL or #MF or #IR or #ST or #SW or #LQ or #CS) { return #err(#notApplicable) };
    };
    #ok;
  };

  // The SR attempt `n` when it is under review.
  func reserveTopUpUnderReview(ctx : TransferContext, n : Nat) : ?TransferAttempt {
    let a = ctx.ownerRevenue.sweep.reserveTopUp ?? (return null);
    if (a.n != n) {
      return null;
    };
    switch (nextAction(a, nowNat64())) {
      case (#needsReview) { ?a };
      case (_) { null };
    };
  };

  // Admin verification: not arrived -> a new attempt (#pending), sent by the
  // timer (#FW / #SH / #RF); #PC: the payment never happened, removed.
  public func markNotArrived(ctx : TransferContext, kind : TransferKind, purchaseId : Nat) : ReviewResult {
    let now = nowNat64();
    switch (kind) {
      case (#FW) {
        let conversion = ctx.treasury.conversions.get(purchaseId) ?? (return #err(#notFound));
        if (conversion.forward != #needsReview) {
          return #err(#notUnderReview);
        };
        let existing = ctx.retry.forwards.get(purchaseId);
        switch (forwardPlan(ctx, conversion)) {
          case (#request(r)) {
            ctx.retry.forwards.add(purchaseId, newAttempt(ctx.retry, #FW, existing, r, now));
            setForward(ctx, purchaseId, #pending);
          };
          case (#notRequired) { setForward(ctx, purchaseId, #notRequired) };
          case (#noTarget) {
            // No account yet: the timer opens the new attempt once configured.
            switch (existing) {
              case (?a) {
                ctx.retry.forwards.add(purchaseId, { a with outcome = #failed("Not arrived (admin verification)") });
              };
              case null {};
            };
            setForward(ctx, purchaseId, #pending);
          };
        };
      };
      case (#SH) {
        let share = ctx.cyclesReserve.shares.get(purchaseId) ?? (return #err(#notFound));
        if (share.transfer != #needsReview) {
          return #err(#notUnderReview);
        };
        switch (shareRequest(ctx, share)) {
          case (?r) {
            ctx.retry.shares.add(purchaseId, newAttempt(ctx.retry, #SH, ctx.retry.shares.get(purchaseId), r, now));
            setShare(ctx, purchaseId, #pending);
          };
          case null { setShare(ctx, purchaseId, #transferred(0)) };
        };
      };
      case (#RF) {
        let conversion = switch (refundUnderReview(ctx, purchaseId)) {
          case (#ok(c)) { c };
          case (#err(e)) { return #err(e) };
        };
        let existing = ctx.retry.refunds.get(purchaseId);
        let request = switch (existing) {
          case (?a) { ?a.request };
          case null { refundRequest(conversion.payToken, conversion.depositor, conversion.payAmount) };
        };
        switch (request) {
          case (?r) {
            ctx.retry.refunds.add(purchaseId, newAttempt(ctx.retry, #RF, existing, r, now));
            setStatus(ctx, purchaseId, #refundFailed, null);
          };
          case null { return #err(#notApplicable) }; // amount does not cover the fee
        };
      };
      case (#PC) {
        switch (ctx.retry.toRefund.take(purchaseId)) {
          case (?_) {};
          case null { return #err(#notFound) };
        };
      };
      case (#OW) {
        let s = ctx.ownerRevenue.sends.get(purchaseId) ?? (return #err(#notFound));
        if (s.status != #needsReview) {
          return #err(#notUnderReview);
        };
        // New attempt, same request (destination chosen by the admin at withdrawal).
        storeOwnerSend(ctx, { s with attempt = newAttempt(ctx.retry, #OW, ?s.attempt, s.attempt.request, now); status = #pending });
      };
      case (#SR) {
        let a = reserveTopUpUnderReview(ctx, purchaseId) ?? (return #err(#notUnderReview));
        setSweep(ctx, { ctx.ownerRevenue.sweep with reserveTopUp = ?newAttempt(ctx.retry, #SR, ?a, a.request, now) });
      };
      // BTC rows are handled by lib/btc-deposit.mo (deposit entries).
      // GR rows are handled by lib/guarantee.mo.
      // DEX rows (DD, DW, DQ) are handled by markDexNotArrived.
      // Mint-fee rows (MF) are not handled here.
      case (#BR or #BC or #BM or #GR or #DD or #DW or #DQ or #DC or #DL or #MF or #IR or #ST or #SW or #LQ or #CS) { return #err(#notApplicable) };
    };
    #ok;
  };

  // Admin: refunded by hand in `block`. #RF (#refundReview only) -> #refunded
  // with that block; #PC -> the payment to refund is removed. #FW / #SH ->
  // #notApplicable.
  public func markRefunded(ctx : TransferContext, kind : TransferKind, purchaseId : Nat, block : Nat) : ReviewResult {
    switch (kind) {
      case (#FW or #SH) { #err(#notApplicable) };
      case (#RF) {
        switch (refundUnderReview(ctx, purchaseId)) {
          case (#ok(c)) {
            refundedIn(ctx, c, block, "refunded by hand by the admin");
            #ok;
          };
          case (#err(e)) { #err(e) };
        };
      };
      case (#PC) {
        switch (ctx.retry.toRefund.take(purchaseId)) {
          case (?_) { #ok };
          case null { #err(#notFound) };
        };
      };
      // BTC rows are handled by lib/btc-deposit.mo (deposit entries).
      // GR: redemption payouts are not refunded by hand.
      // DEX rows: no hand refund.
      case (#BR or #BC or #BM or #GR or #DD or #DW or #DQ or #DC or #DL or #OW or #SR or #MF or #IR or #ST or #SW or #LQ or #CS) { #err(#notApplicable) };
    };
  };

  // --- DEX transfers (DD deposits, DW withdrawals, DQ pair refunds) ---------
  // TTTI-T goes through the in-process ledger (synchronous); ICP, ckBTC,
  // ckUSDC and ckUSDT through their external ledgers (async).

  public type DexContext = {
    retry : RetryStore; // global n (nextN)
    transfers : Types.DexTransferStore;
    balances : DexTypes.DexBalances;
    dex : DexTypes.DexStore;
    ledger : IcrcLib.Ledger; // TTTI-T in-process ledger
    locks : Set.Set<Text>; // transient: "<owner>/<token>" and "DQ/<request id>"
    canister : Principal;
    pause : DexReserveTypes.PauseState; // DEX lot 6 pause (retries keep running)
    indicators : IndicatorTypes.IndicatorsStore; // DEX lot 7 swap activity recording
    batch : BatchTypes.BatchStore; // PTM-9f: zeroed-account exclusions (re-included on activity)
    // Called with the withdrawal number and its status each time a DW withdrawal
    // settles (completed or failed), so a liquidity mint refund follows it.
    onWithdrawal : (Nat, DexTypes.DexTransferStatus) -> ();
  };

  // PTM-9f: re-includes the user deposit accounts of `owner` for `tokens` after
  // new DEX activity (deposit, pair request, swap, withdrawal): the zero mark
  // written by the sweep is removed, so the next reserve check and the next
  // sweep read the account again. Key = "<tokenKey>/<owner text>" (the key of
  // lib/dex-sweep.mo zeroKey). Removes a mark only; no balance, block or
  // sale.reserved is touched. No effect when the account is not excluded.
  public func reincludeOnActivity(batch : BatchTypes.BatchStore, owner : Principal, tokens : [DexTypes.DexToken]) {
    let suffix = "/" # owner.toText();
    for (token in tokens.values()) {
      batch.zeroed.remove(DexLib.tokenKey(token) # suffix);
    };
  };

  // Lock key of one deposit or withdrawal in flight per principal and token.
  public func dexLockKey(owner : Principal, token : DexTypes.DexToken) : Text {
    owner.toText() # "/" # DexLib.tokenKey(token);
  };

  public func dexRequestLockKey(requestId : Nat) : Text {
    "DQ/" # requestId.toText();
  };

  // Pay token of an external DEX token; null for TTTI-T.
  public func dexPayToken(token : DexTypes.DexToken) : ?Types.PayToken {
    switch (token) {
      case (#tttiT) { null };
      case (#icp) { ?#icp };
      case (#ckbtc) { ?#ckbtc };
      case (#ckusdc) { ?#ckusdc };
      case (#ckusdt) { ?#ckusdt };
    };
  };

  // Ledger fee of a DEX token (TTTI-T: IcrcLib.fee; others: expectedFee).
  public func dexFee(ctx : DexContext, token : DexTypes.DexToken) : Nat {
    switch (dexPayToken(token)) {
      case (?p) { PayTokenLib.expectedFee(p) };
      case null { IcrcLib.fee(ctx.ledger) };
    };
  };

  // New DD / DW / DQ attempt: next global n (or same n with m + 1 after a
  // previous attempt), memo TTTI-<prefix>-<n>[-<m>], created_at_time = now.
  public func newDexAttempt(store : RetryStore, prefix : TransferPrefix, previous : ?Types.DexTransferAttempt, request : Types.DexTransferRequest, now : Nat64) : Types.DexTransferAttempt {
    let (n, m) = switch (previous) {
      case (?p) { (p.n, p.attempt + 1) };
      case null {
        let fresh = store.nextN;
        store.nextN += 1;
        (fresh, 1);
      };
    };
    {
      n;
      attempt = m;
      memo = memoBlob(prefix, n, m);
      created_at_time = now;
      request;
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
  };

  // New DQ attempt: the number n is the pair request number (never the global
  // counter); memo TTTI-DQ-<request number>[-<m>], m = previous attempt + 1.
  // Every new attempt gets a new memo (for m > 1) and a new created_at_time.
  public func newPairRefundAttempt(requestId : Nat, previous : ?Types.DexTransferAttempt, request : Types.DexTransferRequest, now : Nat64) : Types.DexTransferAttempt {
    let m = switch (previous) {
      case (?p) { p.attempt + 1 };
      case null { 1 };
    };
    {
      n = requestId;
      attempt = m;
      memo = memoBlob(#DQ, requestId, m);
      created_at_time = now;
      request;
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
  };

  func dexWithinWindow(a : Types.DexTransferAttempt, now : Nat64) : Bool {
    now < a.created_at_time or now - a.created_at_time < RESEND_WINDOW_NS;
  };

  // Same rule as nextAction for a DEX attempt.
  func dexNextAction(a : Types.DexTransferAttempt, now : Nat64) : RetryAction {
    switch (a.outcome) {
      case (#succeeded(_)) { #done };
      case (#failed(_)) { #newAttempt };
      case (#unknown) { if (dexWithinWindow(a, now)) #resend else #needsReview };
      case (#pending) {
        if (dexWithinWindow(a, now)) #resend else if (a.sends == 0) #newAttempt else #needsReview;
      };
    };
  };

  func dexOutcomeUnknown(a : Types.DexTransferAttempt) : Bool {
    switch (a.outcome) {
      case (#unknown) { true };
      case (#pending) { a.sends > 1 };
      case (_) { false };
    };
  };

  // Known ledger Err text (the variants are those of ICRC-2 transfer_from).
  func dexErrorText(token : DexTypes.DexToken, err : Treasury.IcpTransferFromError) : Text {
    switch (dexPayToken(token)) {
      case (?p) { PayTokenLib.transferFromErrorMessage(p, err) };
      case null {
        switch (err) {
          case (#InsufficientAllowance({ allowance })) { "TTTI-T approval missing or too low (allowance " # allowance.toText() # ")" };
          case (#InsufficientFunds({ balance })) { "Insufficient TTTI-T balance (" # balance.toText() # ")" };
          case (#GenericError({ message })) { "The TTTI-T ledger refused the transfer: " # message };
          case (other) { "The TTTI-T ledger refused the transfer: " # debug_show (other) };
        };
      };
    };
  };

  // Classified ledger reply of one send (sends already counted).
  type DexSendResult = {
    #ok : Nat;
    #err : Treasury.IcpTransferFromError;
    #rejected : Text;
  };

  func applyDexResult(a : Types.DexTransferAttempt, result : DexSendResult) : Types.DexTransferAttempt {
    switch (result) {
      case (#ok(block)) { { a with outcome = #succeeded(block) } };
      case (#err(err)) {
        let text = dexErrorText(a.request.token, err);
        if (dexOutcomeUnknown(a)) {
          { a with outcome = #unknown; lastError = ?text };
        } else {
          { a with outcome = #failed(text); lastError = ?text };
        };
      };
      case (#rejected(m)) {
        { a with outcome = #unknown; lastError = ?("the " # DexLib.tokenSymbol(a.request.token) # " ledger could not be reached: " # m) };
      };
    };
  };

  func fromCollect(r : Treasury.CollectResult) : DexSendResult {
    switch (r) {
      case (#ok(block)) { #ok(block) };
      case (#ledgerError(err)) { #err(err) };
      case (#callFailed(m)) { #rejected(m) };
    };
  };

  // icrc1_transfer of the recorded request (TTTI-T in-process, others async).
  func dexTransferSend(ctx : DexContext, a : Types.DexTransferAttempt) : async DexSendResult {
    let r = a.request;
    let fee = r.fee ?? dexFee(ctx, r.token);
    switch (dexPayToken(r.token)) {
      case null {
        switch (
          IcrcLib.transfer(
            ctx.ledger,
            ctx.canister,
            ctx.canister,
            {
              from_subaccount = r.from.subaccount;
              to = r.to;
              amount = r.amount;
              fee = ?fee;
              memo = ?a.memo;
              created_at_time = ?a.created_at_time;
            },
          )
        ) {
          case (#Ok(block)) { #ok(block) };
          case (#Err(#Duplicate({ duplicate_of }))) { #ok(duplicate_of) };
          case (#Err(err)) { #err(err) };
        };
      };
      case (?p) {
        try {
          fromCollect(await PayTokenLib.sendFromSubaccount(PayTokenLib.ledger(p), p, r.from.subaccount ?? ("" : Blob), r.to, r.amount + fee, a.memo, a.created_at_time));
        } catch (e) {
          #rejected(e.message());
        };
      };
    };
  };

  // DEX lot 4 (DC / DL): retry decision of a recorded DEX attempt.
  public func dexAction(a : Types.DexTransferAttempt, now : Nat64) : RetryAction {
    dexNextAction(a, now);
  };

  // DEX lot 4 (DC / DL): created_at_time base for a new attempt.
  public func dexNow() : Nat64 = nowNat64();

  // DEX lot 4 (DC / DL): sends a recorded pay-token attempt (sends already
  // counted by the caller) and returns it with its classified outcome.
  // Never traps; TTTI-T is not sent here (#failed outcome).
  public func sendPayDexAttempt(a : Types.DexTransferAttempt) : async Types.DexTransferAttempt {
    let r = a.request;
    switch (dexPayToken(r.token)) {
      case null {
        { a with outcome = #failed("TTTI-T is not sent by this transfer"); lastError = ?"TTTI-T is not sent by this transfer" };
      };
      case (?p) {
        let fee = r.fee ?? PayTokenLib.expectedFee(p);
        let result : DexSendResult = try {
          fromCollect(await PayTokenLib.sendFromSubaccount(PayTokenLib.ledger(p), p, r.from.subaccount ?? ("" : Blob), r.to, r.amount + fee, a.memo, a.created_at_time));
        } catch (e) {
          #rejected(e.message());
        };
        applyDexResult(a, result);
      };
    };
  };

  // DEX lot 5 (IR): one icrc1_transfer of a recorded attempt (sends counted
  // here; TTTI-T in-process, others async), returned with its classified
  // outcome. Resending the same attempt reuses memo and created_at_time, so
  // the ledger deduplicates it. Never traps.
  public func sendDexAttempt(ctx : DexContext, a : Types.DexTransferAttempt) : async Types.DexTransferAttempt {
    let counted = { a with sends = a.sends + 1 };
    applyDexResult(counted, await dexTransferSend(ctx, counted));
  };

  // icrc2_transfer_from of the recorded DD request (canister = spender).
  func dexTransferFromSend(ctx : DexContext, a : Types.DexTransferAttempt) : async DexSendResult {
    let r = a.request;
    switch (dexPayToken(r.token)) {
      case null {
        switch (
          IcrcLib.transferFrom(
            ctx.ledger,
            ctx.canister,
            ctx.canister,
            {
              spender_subaccount = null;
              from = r.from;
              to = r.to;
              amount = r.amount;
              fee = null;
              memo = ?a.memo;
              created_at_time = ?a.created_at_time;
            },
          )
        ) {
          case (#Ok(block)) { #ok(block) };
          case (#Err(#Duplicate({ duplicate_of }))) { #ok(duplicate_of) };
          case (#Err(err)) { #err(err) };
        };
      };
      case (?p) {
        try {
          fromCollect(await PayTokenLib.collect(PayTokenLib.ledger(p), r.from.owner, r.to, r.amount, a.memo, a.created_at_time));
        } catch (e) {
          #rejected(e.message());
        };
      };
    };
  };

  // DD: records the attempt (before any await) and the deposit #inProgress.
  // The transfer_from goes from the owner's default account into the token's
  // DEX custody account (DEX-1).
  public func openDexDeposit(ctx : DexContext, owner : Principal, token : DexTypes.DexToken, amount : Nat) : Types.DexTransfer {
    let request : Types.DexTransferRequest = {
      token;
      from = { owner; subaccount = null };
      to = DexLib.custodyAccount(ctx.canister, token);
      amount;
      fee = ?dexFee(ctx, token);
    };
    let attempt = newDexAttempt(ctx.retry, #DD, null, request, nowNat64());
    let transfer : Types.DexTransfer = { n = attempt.n; owner; token; amount; attempt; status = #inProgress };
    ctx.transfers.deposits.add(attempt.n, transfer);
    reincludeOnActivity(ctx.batch, owner, [token]);
    transfer;
  };

  // --- PTM-6a: auction bid deposits (AB) ---------------------------------------
  // The deposit of a sealed bid is an ICRC-2 transfer_from recorded as a DD
  // transfer (same attempt, resend and To review rules) whose destination is
  // the token's auction custody account. It never credits an internal DEX
  // balance; lib/auction.mo records the bid when the transfer succeeded.

  // 32-byte ASCII subaccount "AUCTION-BIDS-<symbol>-" padded with "0". The
  // prefix "AUCTION-BIDS-" overlaps no other custody, pool, fee, deposit,
  // mint, returned or injection subaccount.
  public func auctionCustodySubaccount(token : DexTypes.DexToken) : Blob {
    var text = "AUCTION-BIDS-" # DexLib.tokenSymbol(token) # "-";
    while (text.size() < 32) {
      text := text # "0";
    };
    text.encodeUtf8();
  };

  public func auctionCustodyAccount(canister : Principal, token : DexTypes.DexToken) : DexTypes.DexAccount {
    { owner = canister; subaccount = ?auctionCustodySubaccount(token) };
  };

  // Lock key of one auction bid in flight per principal.
  public func auctionLockKey(owner : Principal) : Text {
    "AB/" # owner.toText();
  };

  // True for a DD transfer whose destination is an auction custody account.
  public func isAuctionDeposit(t : Types.DexTransfer) : Bool {
    t.attempt.request.to.subaccount == ?auctionCustodySubaccount(t.token);
  };

  // AB: records the deposit attempt (before any await): transfer_from of
  // `amount` from the owner's default account into the token's auction
  // custody account, memo TTTI-AB-<n>, created_at_time = now. Credits nothing.
  public func openAuctionDeposit(ctx : DexContext, owner : Principal, token : DexTypes.DexToken, amount : Nat) : Types.DexTransfer {
    let request : Types.DexTransferRequest = {
      token;
      from = { owner; subaccount = null };
      to = auctionCustodyAccount(ctx.canister, token);
      amount;
      fee = ?dexFee(ctx, token);
    };
    let attempt = newDexAttempt(ctx.retry, #AB, null, request, nowNat64());
    let transfer : Types.DexTransfer = { n = attempt.n; owner; token; amount; attempt; status = #inProgress };
    ctx.transfers.deposits.add(attempt.n, transfer);
    transfer;
  };

  // One DD send with the ledger Err (if any). Credits exactly once: only an
  // #inProgress deposit moves to #completed.
  public func sendDexDepositDetailed(ctx : DexContext, n : Nat) : async (Types.DexTransfer, ?Treasury.IcpTransferFromError) {
    let transfer = ctx.transfers.deposits.get(n) ?? Runtime.trap("Unknown DEX deposit");
    if (transfer.status != #inProgress) {
      return (transfer, null);
    };
    let sending = { transfer.attempt with sends = transfer.attempt.sends + 1 };
    ctx.transfers.deposits.add(n, { transfer with attempt = sending });
    let result = await dexTransferFromSend(ctx, sending);
    let current = ctx.transfers.deposits.get(n) ?? Runtime.trap("Unknown DEX deposit");
    let attempt = applyDexResult(sending, result);
    if (current.status != #inProgress) {
      ctx.transfers.deposits.add(n, { current with attempt });
      return (current, null);
    };
    let status : DexTypes.DexTransferStatus = switch (attempt.outcome) {
      case (#succeeded(block)) {
        // An auction deposit (AB) never credits an internal DEX balance.
        if (not isAuctionDeposit(current)) {
          DexLib.credit(ctx.balances, current.owner, current.token, current.amount);
        };
        #completed(block);
      };
      case (#failed(text)) { #failed(text) };
      case (_) { #inProgress };
    };
    let updated = { current with attempt; status };
    ctx.transfers.deposits.add(n, updated);
    let err = switch (result, status) {
      case (#err(e), #failed(_)) { ?e };
      case _ { null };
    };
    (updated, err);
  };

  // DD: sends the recorded transfer_from as recorded; Ok / #Duplicate credits
  // the internal balance exactly once; Err credits nothing (#failed); a
  // reject or trap keeps it #inProgress (unknown outcome).
  public func sendDexDeposit(ctx : DexContext, n : Nat) : async Types.DexTransfer {
    (await sendDexDepositDetailed(ctx, n)).0;
  };

  // DW: reserves `amount` of the internal balance and records the attempt
  // (amount - fee sent from the token's DEX custody account to the owner's
  // default account). Null when the
  // available balance does not cover `amount`.
  public func openDexWithdrawal(ctx : DexContext, owner : Principal, token : DexTypes.DexToken, amount : Nat, fee : Nat) : ?Types.DexTransfer {
    if (amount <= fee or not DexLib.reserve(ctx.balances, owner, token, amount)) {
      return null;
    };
    let request : Types.DexTransferRequest = {
      token;
      from = DexLib.custodyAccount(ctx.canister, token);
      to = { owner; subaccount = null };
      amount = Nat.sub(amount, fee);
      fee = ?fee;
    };
    let attempt = newDexAttempt(ctx.retry, #DW, null, request, nowNat64());
    let transfer : Types.DexTransfer = { n = attempt.n; owner; token; amount; attempt; status = #inProgress };
    ctx.transfers.withdrawals.add(attempt.n, transfer);
    reincludeOnActivity(ctx.batch, owner, [token]);
    ?transfer;
  };

  // DW: Ok / #Duplicate = final debit; Err gives the balance back (#failed);
  // a reject or trap keeps it reserved and #inProgress.
  public func sendDexWithdrawal(ctx : DexContext, n : Nat) : async Types.DexTransfer {
    let transfer = ctx.transfers.withdrawals.get(n) ?? Runtime.trap("Unknown DEX withdrawal");
    if (transfer.status != #inProgress) {
      return transfer;
    };
    let sending = { transfer.attempt with sends = transfer.attempt.sends + 1 };
    ctx.transfers.withdrawals.add(n, { transfer with attempt = sending });
    let result = await dexTransferSend(ctx, sending);
    let current = ctx.transfers.withdrawals.get(n) ?? Runtime.trap("Unknown DEX withdrawal");
    let attempt = applyDexResult(sending, result);
    if (current.status != #inProgress) {
      ctx.transfers.withdrawals.add(n, { current with attempt });
      return current;
    };
    let status : DexTypes.DexTransferStatus = switch (attempt.outcome) {
      case (#succeeded(block)) {
        DexLib.settleReserved(ctx.balances, current.owner, current.token, current.amount);
        #completed(block);
      };
      case (#failed(text)) {
        DexLib.release(ctx.balances, current.owner, current.token, current.amount);
        #failed(text);
      };
      case (_) { #inProgress };
    };
    let updated = { current with attempt; status };
    ctx.transfers.withdrawals.add(n, updated);
    ctx.onWithdrawal(n, status);
    updated;
  };

  func setRefundStatus(ctx : DexContext, requestId : Nat, refundStatus : DexTypes.PairRefundStatus) {
    switch (ctx.dex.requests.get(requestId)) {
      case (?r) {
        let refundBlock = switch (refundStatus) {
          case (#refunded(block)) { ?block };
          case (_) { r.refundBlock };
        };
        ctx.dex.requests.add(requestId, { r with refundStatus; refundBlock });
      };
      case null {};
    };
  };

  // DQ: records the refund attempt of an approved request (deposit minus one
  // TTTI-T fee, from the request deposit subaccount to the requester).
  public func openPairRefund(ctx : DexContext, requestId : Nat) : ?Types.DexTransferAttempt {
    let request = ctx.dex.requests.get(requestId) ?? (return null);
    if (request.refundStatus != #inProgress or request.refundBlock != null) {
      return null;
    };
    switch (ctx.transfers.pairRefunds.get(requestId)) {
      case (?existing) { return ?existing };
      case null {};
    };
    let fee = IcrcLib.fee(ctx.ledger);
    if (request.depositAmount <= fee) {
      return null;
    };
    let attempt = newPairRefundAttempt(
      requestId,
      null,
      {
        token = #tttiT;
        from = DexLib.requestDepositAccount(ctx.canister);
        to = { owner = request.requester; subaccount = null };
        amount = Nat.sub(request.depositAmount, fee);
        fee = ?fee;
      },
      nowNat64(),
    );
    ctx.transfers.pairRefunds.add(requestId, attempt);
    ?attempt;
  };

  // DQ: sends the recorded refund on the in-process TTTI-T ledger and keeps
  // the request refundStatus up to date. Caller holds the request lock.
  public func sendPairRefund(ctx : DexContext, requestId : Nat) {
    let request = ctx.dex.requests.get(requestId) ?? (return);
    if (request.refundStatus != #inProgress) {
      return;
    };
    let existing = switch (ctx.transfers.pairRefunds.get(requestId)) {
      case (?a) { a };
      case null { openPairRefund(ctx, requestId) ?? (return) };
    };
    let now = nowNat64();
    let attempt = switch (dexNextAction(existing, now)) {
      case (#done) {
        switch (existing.outcome) {
          case (#succeeded(block)) { setRefundStatus(ctx, requestId, #refunded(block)) };
          case (_) {};
        };
        return;
      };
      case (#needsReview) {
        setRefundStatus(ctx, requestId, #needsReview);
        return;
      };
      case (#resend) { existing };
      case (#newAttempt) { newPairRefundAttempt(requestId, ?existing, existing.request, now) };
    };
    let sending = { attempt with sends = attempt.sends + 1 };
    ctx.transfers.pairRefunds.add(requestId, sending);
    let fee = sending.request.fee ?? IcrcLib.fee(ctx.ledger);
    let result : DexSendResult = switch (
      IcrcLib.transfer(
        ctx.ledger,
        ctx.canister,
        ctx.canister,
        {
          from_subaccount = sending.request.from.subaccount;
          to = sending.request.to;
          amount = sending.request.amount;
          fee = ?fee;
          memo = ?sending.memo;
          created_at_time = ?sending.created_at_time;
        },
      )
    ) {
      case (#Ok(block)) { #ok(block) };
      case (#Err(#Duplicate({ duplicate_of }))) { #ok(duplicate_of) };
      case (#Err(err)) { #err(err) };
    };
    let classified = applyDexResult(sending, result);
    ctx.transfers.pairRefunds.add(requestId, classified);
    switch (classified.outcome) {
      case (#succeeded(block)) { setRefundStatus(ctx, requestId, #refunded(block)) };
      case (_) {};
    };
  };

  // One timer step of an #inProgress DD / DW: resend within 23 h, review
  // after; never sent and too old -> #failed (nothing moved).
  func dexTransferAction(t : Types.DexTransfer, now : Nat64) : RetryAction {
    dexNextAction(t.attempt, now);
  };

  // Resends unknown DD / DW / DQ attempts within 23 h, marks them for review
  // after 23 h, sends pending DQ attempts (new attempt after a known Err).
  public func runDexRetries(ctx : DexContext) : async () {
    let now = nowNat64();
    let deposits = ctx.transfers.deposits.values().filter(func t = t.status == #inProgress).toArray();
    for (t in deposits.values()) {
      let key = if (isAuctionDeposit(t)) auctionLockKey(t.owner) else dexLockKey(t.owner, t.token);
      if (tryLock(ctx.locks, key)) {
        try {
          switch (dexTransferAction(t, now)) {
            case (#resend) { ignore await sendDexDeposit(ctx, t.n) };
            case (#needsReview) { ctx.transfers.deposits.add(t.n, { t with status = #needsReview }) };
            case (#newAttempt) {
              ctx.transfers.deposits.add(t.n, { t with status = #failed("Not sent within 23 h; nothing was taken") });
            };
            case (#done) {};
          };
        } catch (_) {} finally {
          unlock(ctx.locks, key);
        };
      };
    };
    let withdrawals = ctx.transfers.withdrawals.values().filter(func t = t.status == #inProgress).toArray();
    for (t in withdrawals.values()) {
      let key = dexLockKey(t.owner, t.token);
      if (tryLock(ctx.locks, key)) {
        try {
          switch (dexTransferAction(t, now)) {
            case (#resend) { ignore await sendDexWithdrawal(ctx, t.n) };
            case (#needsReview) { ctx.transfers.withdrawals.add(t.n, { t with status = #needsReview }) };
            case (#newAttempt) {
              DexLib.release(ctx.balances, t.owner, t.token, t.amount);
              let text = "Not sent within 23 h; the balance was given back";
              ctx.transfers.withdrawals.add(t.n, { t with status = #failed(text) });
              ctx.onWithdrawal(t.n, #failed(text));
            };
            case (#done) {};
          };
        } catch (_) {} finally {
          unlock(ctx.locks, key);
        };
      };
    };
    let requestIds = ctx.dex.requests.values().filter(func r = r.refundStatus == #inProgress).map(func r = r.id).toArray();
    for (id in requestIds.values()) {
      let key = dexRequestLockKey(id);
      if (tryLock(ctx.locks, key)) {
        try {
          sendPairRefund(ctx, id);
        } catch (_) {} finally {
          unlock(ctx.locks, key);
        };
      };
    };
    // DEX-2: announced pair removals due, and LQ payout resend / retry.
    try { await processPairRemovals(ctx) } catch (_) {};
  };

  // 10-minute recurring timer; armed on every install and upgrade.
  public func startDexTimer<system>(ctx : DexContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(TIMER_INTERVAL_SECONDS),
      func() : async () { await runDexRetries(ctx) },
    );
  };

  public func dexTransferView(ctx : DexContext, transfer : Types.DexTransfer, direction : DexTypes.DexTransferDirection) : DexTypes.DexTransferView {
    let a = transfer.attempt;
    {
      n = transfer.n;
      direction;
      owner = transfer.owner;
      token = transfer.token;
      amount = transfer.amount;
      ledgerAmount = a.request.amount;
      fee = a.request.fee ?? dexFee(ctx, transfer.token);
      from = a.request.from;
      to = a.request.to;
      memoText = a.memo.decodeUtf8() ?? "";
      createdAtTimeNs = a.created_at_time;
      attempt = a.attempt;
      sends = a.sends;
      status = transfer.status;
      lastError = a.lastError;
    };
  };

  // Deposits and withdrawals of `owner`, newest first.
  public func dexTransfersOf(ctx : DexContext, owner : Principal) : [DexTypes.DexTransferView] {
    let deposits = ctx.transfers.deposits.values().filter(func t = t.owner == owner and not isAuctionDeposit(t)).map(func t = dexTransferView(ctx, t, #deposit)).toArray();
    let withdrawals = ctx.transfers.withdrawals.values().filter(func t = t.owner == owner).map(func t = dexTransferView(ctx, t, #withdrawal)).toArray();
    deposits.concat(withdrawals).sort(func(x, y) = Nat.compare(y.n, x.n));
  };

  // PTM-9f: deposits and withdrawals of `owner`, newest first, by pages. The
  // transfer number n is global and unique across deposits and withdrawals, so
  // it is the cursor: cursor = null starts at the newest transfer, cursor = ?c
  // returns the transfers with n strictly below c. `limit` is clamped by
  // PageTypes.clampLimit. nextCursor = n of the last returned transfer while
  // older ones remain, null on the last page. Same transfers as dexTransfersOf
  // (auction bid deposits left out); each one appears exactly once across pages.
  public func dexTransfersPageOf(ctx : DexContext, owner : Principal, cursor : ?Nat, limit : Nat) : PageTypes.Page<DexTypes.DexTransferView> {
    dexTransfersPageWith(ctx.transfers, owner, cursor, limit, func(t, direction) = dexTransferView(ctx, t, direction));
  };

  // The paging itself, over the transfer stores and a view function (lets the
  // interpreter tests run it without a full DexContext).
  public func dexTransfersPageWith(
    transfers : Types.DexTransferStore,
    owner : Principal,
    cursor : ?Nat,
    limit : Nat,
    view : (Types.DexTransfer, DexTypes.DexTransferDirection) -> DexTypes.DexTransferView,
  ) : PageTypes.Page<DexTypes.DexTransferView> {
    let size = PageTypes.clampLimit(limit);
    let (depositsIt, withdrawalsIt) = switch (cursor) {
      case null (transfers.deposits.reverseEntries(), transfers.withdrawals.reverseEntries());
      case (?0) return PageTypes.emptyPage<DexTypes.DexTransferView>();
      case (?c) (transfers.deposits.reverseEntriesFrom(c - 1), transfers.withdrawals.reverseEntriesFrom(c - 1));
    };
    // At most size + 1 matching transfers of each kind: enough to fill the page
    // and to know whether an older one remains.
    let found = List.empty<(Nat, DexTypes.DexTransferDirection, Types.DexTransfer)>();
    var taken = 0;
    label deposits for ((n, t) in depositsIt) {
      if (t.owner == owner and not isAuctionDeposit(t)) {
        found.add((n, #deposit, t));
        taken += 1;
        if (taken > size) break deposits;
      };
    };
    taken := 0;
    label withdrawals for ((n, t) in withdrawalsIt) {
      if (t.owner == owner) {
        found.add((n, #withdrawal, t));
        taken += 1;
        if (taken > size) break withdrawals;
      };
    };
    let sorted = found.toArray().sort(func(x, y) = Nat.compare(y.0, x.0));
    let more = sorted.size() > size;
    let count = Nat.min(sorted.size(), size);
    let items = Array.tabulate(count, func i = view(sorted[i].2, sorted[i].1));
    { items; nextCursor = if (more and count > 0) ?(items[count - 1].n) else null };
  };

  public func dexReview(kind : TransferKind, id : Nat, owner : Principal, a : Types.DexTransferAttempt) : TransferReview {
    {
      kind;
      purchaseId = id;
      block = null;
      collect = null;
      token = a.request.token;
      memoText = a.memo.decodeUtf8();
      memoHex = ?hex(a.memo);
      createdAtTimeNs = ?a.created_at_time;
      amount = a.request.amount;
      fee = a.request.fee;
      destination = ?a.request.to;
      sends = a.sends;
      lastError = a.lastError;
      buyer = ?owner;
      depositIndex = null;
      conversionId = null;
      refundPurpose = null;
      outcome = ?a.outcome;
    };
  };

  // Every DD / DW in #needsReview (purchaseId = n) and every DQ to review
  // (purchaseId = request id), with all fields.
  public func dexToReview(ctx : DexContext) : [TransferReview] {
    let deposits = ctx.transfers.deposits.values().filter(func t = t.status == #needsReview).map(func t = dexReview(#DD, t.n, t.owner, t.attempt)).toArray();
    let withdrawals = ctx.transfers.withdrawals.values().filter(func t = t.status == #needsReview).map(func t = dexReview(#DW, t.n, t.owner, t.attempt)).toArray();
    let refunds = ctx.dex.requests.values().filter(func r = r.refundStatus == #needsReview).filterMap(
      func r = switch (ctx.transfers.pairRefunds.get(r.id)) {
        case (?a) { ?dexReview(#DQ, r.id, r.requester, a) };
        case null { null };
      }
    ).toArray();
    deposits.concat(withdrawals).concat(refunds).concat(liquidationToReview(ctx));
  };

  // DD: credits the balance once; DW: final debit; DQ: request refunded.
  public func markDexArrived(ctx : DexContext, kind : TransferKind, id : Nat, block : Nat) : ReviewResult {
    switch (kind) {
      case (#DD) {
        let t = ctx.transfers.deposits.get(id) ?? (return #err(#notFound));
        if (t.status != #needsReview) { return #err(#notUnderReview) };
        if (not isAuctionDeposit(t)) {
          DexLib.credit(ctx.balances, t.owner, t.token, t.amount);
        };
        ctx.transfers.deposits.add(id, { t with status = #completed(block); attempt = { t.attempt with outcome = #succeeded(block) } });
      };
      case (#DW) {
        let t = ctx.transfers.withdrawals.get(id) ?? (return #err(#notFound));
        if (t.status != #needsReview) { return #err(#notUnderReview) };
        DexLib.settleReserved(ctx.balances, t.owner, t.token, t.amount);
        ctx.transfers.withdrawals.add(id, { t with status = #completed(block); attempt = { t.attempt with outcome = #succeeded(block) } });
        ctx.onWithdrawal(id, #completed(block));
      };
      case (#DQ) {
        let r = ctx.dex.requests.get(id) ?? (return #err(#notFound));
        if (r.refundStatus != #needsReview) { return #err(#notUnderReview) };
        switch (ctx.transfers.pairRefunds.get(id)) {
          case (?a) { ctx.transfers.pairRefunds.add(id, { a with outcome = #succeeded(block) }) };
          case null {};
        };
        setRefundStatus(ctx, id, #refunded(block));
      };
      case (#LQ) { return markLiquidationArrived(ctx, id, block) };
      case (_) { return #err(#notApplicable) };
    };
    #ok;
  };

  // DD: nothing credited (#failed); DW: balance given back; DQ: new attempt
  // (new memo and created_at_time) sent by the timer.
  public func markDexNotArrived(ctx : DexContext, kind : TransferKind, id : Nat) : ReviewResult {
    let text = "Not arrived (admin verification)";
    switch (kind) {
      case (#DD) {
        let t = ctx.transfers.deposits.get(id) ?? (return #err(#notFound));
        if (t.status != #needsReview) { return #err(#notUnderReview) };
        ctx.transfers.deposits.add(id, { t with status = #failed(text); attempt = { t.attempt with outcome = #failed(text) } });
      };
      case (#DW) {
        let t = ctx.transfers.withdrawals.get(id) ?? (return #err(#notFound));
        if (t.status != #needsReview) { return #err(#notUnderReview) };
        DexLib.release(ctx.balances, t.owner, t.token, t.amount);
        ctx.transfers.withdrawals.add(id, { t with status = #failed(text); attempt = { t.attempt with outcome = #failed(text) } });
        ctx.onWithdrawal(id, #failed(text));
      };
      case (#DQ) {
        let r = ctx.dex.requests.get(id) ?? (return #err(#notFound));
        if (r.refundStatus != #needsReview) { return #err(#notUnderReview) };
        let previous = ctx.transfers.pairRefunds.get(id) ?? (return #err(#notFound));
        ctx.transfers.pairRefunds.add(id, newPairRefundAttempt(id, ?previous, previous.request, nowNat64()));
        setRefundStatus(ctx, id, #inProgress);
      };
      case (#LQ) { return markLiquidationNotArrived(ctx, id) };
      case (_) { return #err(#notApplicable) };
    };
    #ok;
  };

  // --- DEX-2: LQ liquidation payouts of an announced pair removal -----------
  // A payout whose amount did not cover the ledger fee: never sent, nothing
  // reserved (request amount 0). It stays #needsReview for the admin and the
  // amount stays in the owner's internal balance.
  func liquidationUnfunded(t : Types.LiquidationPayout) : Bool {
    t.attempt.request.amount == 0;
  };

  // Listed in To review: #needsReview (unknown outcome older than 23 h, or not
  // covering the fee), or still #inProgress with a known ledger Err (a new
  // attempt follows) or an unknown outcome (resent identically within 23 h).
  func liquidationListed(t : Types.LiquidationPayout) : Bool {
    switch (t.status) {
      case (#needsReview) { true };
      case (#inProgress) {
        switch (t.attempt.outcome) {
          case (#failed(_) or #unknown) { true };
          case (_) { false };
        };
      };
      case (_) { false };
    };
  };

  func liquidationReview(t : Types.LiquidationPayout) : TransferReview {
    let base = dexReview(#LQ, t.n, t.owner, t.attempt);
    // conversionId = pool id, depositIndex = position id for LQ rows.
    {
      base with
      amount = if (liquidationUnfunded(t)) t.amount else base.amount;
      conversionId = ?t.poolId;
      depositIndex = ?t.positionId;
    };
  };

  // LQ: reserves `amount` of the owner's internal balance (credited by
  // DexLib.liquidatePosition) and records the attempt with memo
  // TTTI-LQ-<n> and created_at_time before any await (amount - fee sent from
  // the token's custody account to the owner's default account). A payout whose
  // amount does not cover the fee is recorded #needsReview without a send and
  // without reserving anything (the amount stays in the internal balance). Null
  // for a zero amount, or when the balance cannot be reserved.
  public func openLiquidationPayout(ctx : DexContext, poolId : Nat, positionId : Nat, owner : Principal, token : DexTypes.DexToken, amount : Nat, fee : Nat) : ?Types.LiquidationPayout {
    if (amount == 0) {
      return null;
    };
    let now = nowNat64();
    let funded = amount > fee;
    if (funded and not DexLib.reserve(ctx.balances, owner, token, amount)) {
      return null;
    };
    let request : Types.DexTransferRequest = {
      token;
      from = DexLib.custodyAccount(ctx.canister, token);
      to = { owner; subaccount = null };
      amount = if (funded) Nat.sub(amount, fee) else 0;
      fee = ?fee;
    };
    let fresh = newDexAttempt(ctx.retry, #LQ, null, request, now);
    let attempt = if (funded) {
      fresh;
    } else {
      { fresh with lastError = ?("The amount does not cover the " # DexLib.tokenSymbol(token) # " ledger fee; it was not sent and stays in the owner's internal balance") };
    };
    let payout : Types.LiquidationPayout = {
      n = attempt.n;
      poolId;
      positionId;
      owner;
      token;
      amount;
      attempt;
      status = if (funded) #inProgress else #needsReview;
    };
    ctx.transfers.liquidations.add(payout.n, payout);
    ?payout;
  };

  // LQ: sends the recorded request. Ok / #Duplicate = final debit (#completed);
  // known Err = outcome #failed, the payout stays #inProgress, is listed in To
  // review and the timer opens a new attempt (new memo and created_at_time);
  // reject or trap = stays #inProgress (unknown outcome) and is resent
  // identically for 23 h, then #needsReview. Caller holds the payout lock.
  public func sendLiquidationPayout(ctx : DexContext, n : Nat) : async Types.LiquidationPayout {
    let payout = ctx.transfers.liquidations.get(n) ?? Runtime.trap("Unknown liquidation payout");
    if (payout.status != #inProgress or liquidationUnfunded(payout)) {
      return payout;
    };
    // Recorded (with this send counted) before the await.
    let sending = { payout.attempt with sends = payout.attempt.sends + 1 };
    ctx.transfers.liquidations.add(n, { payout with attempt = sending });
    let result = await dexTransferSend(ctx, sending);
    let current = ctx.transfers.liquidations.get(n) ?? Runtime.trap("Unknown liquidation payout");
    if (current.status != #inProgress or current.attempt.attempt != sending.attempt) {
      // Settled by the admin meanwhile: nothing is changed or debited twice.
      return current;
    };
    let attempt = applyDexResult(sending, result);
    let status : DexTypes.DexTransferStatus = switch (attempt.outcome) {
      case (#succeeded(block)) {
        DexLib.settleReserved(ctx.balances, current.owner, current.token, current.amount);
        #completed(block);
      };
      case (_) { #inProgress };
    };
    let updated = { current with attempt; status };
    ctx.transfers.liquidations.add(n, updated);
    updated;
  };

  // Every LQ payout to check by hand (#needsReview, or failed / ambiguous),
  // purchaseId = n, buyer = owner, conversionId = pool id, depositIndex =
  // position id.
  public func liquidationToReview(ctx : DexContext) : [TransferReview] {
    ctx.transfers.liquidations.values().filter(liquidationListed).map(liquidationReview).toArray();
  };

  // LQ Arrived: final debit of the reserved amount, payout #completed(block).
  // A payout that never reserved anything (amount below the fee) has nothing
  // to confirm.
  public func markLiquidationArrived(ctx : DexContext, n : Nat, block : Nat) : ReviewResult {
    let t = ctx.transfers.liquidations.get(n) ?? (return #err(#notFound));
    if (not liquidationListed(t)) {
      return #err(#notUnderReview);
    };
    if (liquidationUnfunded(t)) {
      return #err(#notApplicable);
    };
    DexLib.settleReserved(ctx.balances, t.owner, t.token, t.amount);
    ctx.transfers.liquidations.add(n, { t with status = #completed(block); attempt = { t.attempt with outcome = #succeeded(block) } });
    #ok;
  };

  // LQ Not arrived: new attempt (new memo and created_at_time) sent by the
  // timer. Refused while an unknown attempt is still being resent within 23 h
  // or a send is in flight. A payout below the fee is closed (#failed).
  public func markLiquidationNotArrived(ctx : DexContext, n : Nat) : ReviewResult {
    let t = ctx.transfers.liquidations.get(n) ?? (return #err(#notFound));
    if (not liquidationListed(t) or ctx.locks.contains(lockKey(#LQ, n))) {
      return #err(#notUnderReview);
    };
    if (liquidationUnfunded(t)) {
      ctx.transfers.liquidations.add(n, { t with status = #failed("Closed by the admin; nothing was sent and the amount stays in the owner's internal balance") });
      return #ok;
    };
    switch (t.status) {
      case (#needsReview) {};
      case (_) {
        switch (t.attempt.outcome) {
          case (#failed(_)) {};
          case (_) { return #err(#notUnderReview) };
        };
      };
    };
    ctx.transfers.liquidations.add(
      n,
      {
        t with
        attempt = newDexAttempt(ctx.retry, #LQ, ?t.attempt, t.attempt.request, nowNat64());
        status = #inProgress;
      },
    );
    #ok;
  };

  // One step of the retry rule for an #inProgress LQ payout: at most one send.
  func stepLiquidation(ctx : DexContext, n : Nat) : async () {
    let t = ctx.transfers.liquidations.get(n) ?? (return);
    if (t.status != #inProgress or liquidationUnfunded(t)) {
      return;
    };
    let now = nowNat64();
    switch (dexNextAction(t.attempt, now)) {
      case (#done) {
        switch (t.attempt.outcome) {
          case (#succeeded(block)) {
            DexLib.settleReserved(ctx.balances, t.owner, t.token, t.amount);
            ctx.transfers.liquidations.add(n, { t with status = #completed(block) });
          };
          case (_) {};
        };
      };
      case (#needsReview) {
        ctx.transfers.liquidations.add(n, { t with status = #needsReview });
      };
      case (#resend) {
        ignore await sendLiquidationPayout(ctx, n);
      };
      case (#newAttempt) {
        // Known Err (or never sent and too old): nothing moved. New memo and
        // created_at_time, recorded before the send.
        ctx.transfers.liquidations.add(n, { t with attempt = newDexAttempt(ctx.retry, #LQ, ?t.attempt, t.attempt.request, now) });
        ignore await sendLiquidationPayout(ctx, n);
      };
    };
  };

  // One step of LQ payout `n` under its lock (released in a finally).
  func runLiquidationStep(ctx : DexContext, n : Nat) : async () {
    let key = lockKey(#LQ, n);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepLiquidation(ctx, n);
    } catch (_) {
      // The attempt stays recorded; the timer applies the rule again.
    } finally {
      unlock(ctx.locks, key);
    };
  };

  func removalLockKey(poolId : Nat) : Text {
    "LQP/" # poolId.toText();
  };

  // One removal run for a due pool: starts the execution (idempotent), then
  // for every remaining position liquidates it and opens its payouts in one
  // synchronous section (so a position is paid exactly once), sends the
  // payouts, and finishes the removal once no position remains.
  func stepPairRemoval(ctx : DexContext, poolId : Nat) : async () {
    if (not DexLib.startRemovalExecution(ctx.dex, poolId, Time.now())) {
      return;
    };
    // PTM-9d: positions of this pool through the per-pool index.
    let positionIds = DexLib.positionsInPool(ctx.dex, poolId).map(func p = p.id);
    for (positionId in positionIds.values()) {
      if (ctx.pause.paused) {
        return;
      };
      let opened : [Nat] = switch (DexLib.liquidatePosition(ctx.dex, ctx.balances, positionId)) {
        case (#err(#positionNotFound)) { [] }; // withdrawn by its owner meanwhile
        case (#err(_)) { return };
        case (#ok(acc)) {
          var ns : [Nat] = [];
          for ((token, amount) in [(acc.token0, acc.amount0), (acc.token1, acc.amount1)].values()) {
            switch (openLiquidationPayout(ctx, poolId, positionId, acc.owner, token, amount, dexFee(ctx, token))) {
              case (?payout) { ns := ns.concat([payout.n]) };
              case null {};
            };
          };
          ns;
        };
      };
      for (n in opened.values()) {
        await runLiquidationStep(ctx, n);
      };
    };
    if (not DexLib.poolHasPositions(ctx.dex, poolId)) {
      ignore DexLib.finishRemoval(ctx.dex, poolId, Time.now());
    };
  };

  // Called by the retry timer: for every due announced removal (DexLib.dueRemovals)
  // starts execution, liquidates each remaining position (DexLib.liquidatePosition),
  // opens and sends its LQ payouts, then DexLib.finishRemoval once none remains.
  // Resumes after an upgrade; also resends unknown LQ attempts within 23 h,
  // opens new attempts after a known Err and marks them for review after 23 h.
  // Nothing runs while the DEX is paused.
  public func processPairRemovals(ctx : DexContext) : async () {
    if (ctx.pause.paused) {
      return;
    };
    for (poolId in DexLib.dueRemovals(ctx.dex, Time.now()).values()) {
      if (ctx.pause.paused) {
        return;
      };
      let key = removalLockKey(poolId);
      if (tryLock(ctx.locks, key)) {
        try {
          await stepPairRemoval(ctx, poolId);
        } catch (_) {
          // Resumed by the next timer pass.
        } finally {
          unlock(ctx.locks, key);
        };
      };
    };
    let ids = ctx.transfers.liquidations.values().filter(func t = t.status == #inProgress and not liquidationUnfunded(t)).map(func t = t.n).toArray();
    for (n in ids.values()) {
      if (ctx.pause.paused) {
        return;
      };
      await runLiquidationStep(ctx, n);
    };
  };

  // --- Mint owner revenue (OW) and one-time treasury sweep (SR) -------------

  func storeOwnerSend(ctx : TransferContext, s : OwnerTypes.OwnerSend) {
    ctx.ownerRevenue.sends.add(s.id, { s with updatedAt = Time.now() });
  };

  func ownerSendActive(s : OwnerTypes.OwnerSend) : Bool {
    switch (s.status) {
      case (#pending or #failed(_)) { true };
      case (#sent(_) or #needsReview) { false };
    };
  };

  // Debited amount of the earlier admin withdrawals from the legacy
  // MINT-TREASURY of `token` that are not settled yet (pending, failed, to
  // review): the ledger balance does not reflect them yet.
  public func unsettledMintTreasuryWithdrawals(ctx : TransferContext, token : Types.PayToken) : Nat {
    var unsettled = 0;
    for (s in ctx.ownerRevenue.sends.values()) {
      switch (s.source) {
        case (#withdrawal({ from = #mintTreasury })) {
          let settled = switch (s.status) {
            case (#sent(_)) { true };
            case (_) { false };
          };
          if (s.token == token and not settled) {
            unsettled += s.amount;
          };
        };
        case (_) {};
      };
    };
    unsettled;
  };

  // Records an owner send (OW, memo TTTI-OW-<n>, created_at_time = now) of
  // `amount` (received) plus `fee` (debited on top) from `fromSubaccount` to
  // `to`. Call before the first await and send it with sendOwner.
  public func openOwnerSend(ctx : TransferContext, token : Types.PayToken, source : OwnerTypes.OwnerSendSource, fromSubaccount : ?Blob, to : Types.Account, amount : Nat, fee : Nat) : OwnerTypes.OwnerSend {
    let id = ctx.ownerRevenue.nextSendId;
    ctx.ownerRevenue.nextSendId += 1;
    let request : TransferRequest = { token; from_subaccount = fromSubaccount; to; amount; fee = ?fee };
    let now = Time.now();
    let send : OwnerTypes.OwnerSend = {
      id;
      token;
      amount = amount + fee;
      source;
      attempt = newAttempt(ctx.retry, #OW, null, request, nowNat64());
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    ctx.ownerRevenue.sends.add(id, send);
    send;
  };

  // --- Fee-account moves (ST) -------------------------------------------------

  public func feeMoveActive(m : OwnerTypes.FeeMove) : Bool {
    switch (m.status) {
      case (#pending or #failed(_)) { true };
      case (#sent(_) or #needsReview) { false };
    };
  };

  func storeFeeMove(ctx : TransferContext, m : OwnerTypes.FeeMove) {
    ctx.mintRevenue.feeMoves.add(m.n, { m with updatedAt = Time.now() });
  };

  // Records a move (ST, memo TTTI-ST-<n>, created_at_time = now) of `amount`
  // (received) plus `fee` from `fromSubaccount` to `to` (the fee account).
  // Keyed by the global transfer number n. Call before the first await.
  public func openFeeMove(ctx : TransferContext, token : Types.PayToken, purpose : OwnerTypes.FeeMovePurpose, fromSubaccount : ?Blob, to : Types.Account, amount : Nat, fee : Nat) : OwnerTypes.FeeMove {
    let request : TransferRequest = { token; from_subaccount = fromSubaccount; to; amount; fee = ?fee };
    let attempt = newAttempt(ctx.retry, #ST, null, request, nowNat64());
    let now = Time.now();
    let move : OwnerTypes.FeeMove = { n = attempt.n; token; purpose; attempt; status = #pending; createdAt = now; updatedAt = now };
    ctx.mintRevenue.feeMoves.add(move.n, move);
    move;
  };

  func stepFeeMove(ctx : TransferContext, n : Nat) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let m = ctx.mintRevenue.feeMoves.get(n) ?? (return);
    if (not feeMoveActive(m)) {
      return;
    };
    let now = nowNat64();
    let attempt = switch (nextAction(m.attempt, now)) {
      case (#done) {
        switch (m.attempt.outcome) {
          case (#succeeded(block)) { storeFeeMove(ctx, { m with status = #sent(block) }) };
          case (_) {};
        };
        return;
      };
      case (#needsReview) {
        storeFeeMove(ctx, { m with status = #needsReview });
        return;
      };
      case (#resend) { m.attempt };
      case (#newAttempt) { newAttempt(ctx.retry, #ST, ?m.attempt, m.attempt.request, now) };
    };
    // Recorded (with this send counted) before the await.
    let sending = { attempt with sends = attempt.sends + 1 };
    storeFeeMove(ctx, { m with attempt = sending; status = #pending });
    let result = await sendCounted(PayTokenLib.ledger(m.token), sending, describeFor(m.token));
    let current = ctx.mintRevenue.feeMoves.get(n) ?? (return);
    let status : OwnerTypes.OwnerSendStatus = switch (result.outcome) {
      case (#succeeded(block)) { #sent(block) };
      case (#failed(text)) { #failed(text) };
      case (_) { #pending };
    };
    storeFeeMove(ctx, { current with attempt = result; status });
  };

  // Sends (or resends identically within 23 h) the recorded ST move `n`.
  public func sendFeeMove(ctx : TransferContext, n : Nat) : async () {
    let key = lockKey(#ST, n);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepFeeMove(ctx, n);
    } catch (_) {
      // The attempt stays recorded; the timer applies the rule again.
    } finally {
      unlock(ctx.locks, key);
    };
  };

  // Admin review of an ST move: arrived in `block`.
  public func markFeeMoveArrived(ctx : TransferContext, n : Nat, block : Nat) : Types.ReviewResult {
    let m = ctx.mintRevenue.feeMoves.get(n) ?? (return #err(#notFound));
    if (m.status != #needsReview) {
      return #err(#notUnderReview);
    };
    storeFeeMove(ctx, { m with attempt = { m.attempt with outcome = #succeeded(block) }; status = #sent(block) });
    #ok;
  };

  // Admin review of an ST move: did not arrive; a new attempt (new memo and
  // created_at_time, same request) is sent by the timer.
  public func markFeeMoveNotArrived(ctx : TransferContext, n : Nat) : Types.ReviewResult {
    let m = ctx.mintRevenue.feeMoves.get(n) ?? (return #err(#notFound));
    if (m.status != #needsReview) {
      return #err(#notUnderReview);
    };
    storeFeeMove(ctx, { m with attempt = newAttempt(ctx.retry, #ST, ?m.attempt, m.attempt.request, nowNat64()); status = #pending });
    #ok;
  };

  // One step of the rule for an active OW send. Caller holds the lock.
  func stepOwner(ctx : TransferContext, id : Nat) : async () {
    if (ctx.sale.salesPaused) {
      return;
    };
    let s = ctx.ownerRevenue.sends.get(id) ?? (return);
    if (not ownerSendActive(s)) {
      return;
    };
    let now = nowNat64();
    let attempt = switch (nextAction(s.attempt, now)) {
      case (#done) {
        switch (s.attempt.outcome) {
          case (#succeeded(block)) { storeOwnerSend(ctx, { s with status = #sent(block) }) };
          case (_) {};
        };
        return;
      };
      case (#needsReview) {
        storeOwnerSend(ctx, { s with status = #needsReview });
        return;
      };
      case (#resend) { s.attempt };
      case (#newAttempt) {
        newAttempt(ctx.retry, #OW, ?s.attempt, s.attempt.request, now);
      };
    };
    // Recorded (with this send counted) before the await.
    let sending = { attempt with sends = attempt.sends + 1 };
    storeOwnerSend(ctx, { s with attempt = sending; status = #pending });
    let result = await sendCounted(PayTokenLib.ledger(s.token), sending, describeFor(s.token));
    let current = ctx.ownerRevenue.sends.get(id) ?? (return);
    let status : OwnerTypes.OwnerSendStatus = switch (result.outcome) {
      case (#succeeded(block)) { #sent(block) };
      case (#failed(text)) { #failed(text) };
      case (_) { #pending };
    };
    storeOwnerSend(ctx, { current with attempt = result; status });
  };

  // Sends (or resends identically within 23 h) the recorded OW send `id`.
  public func sendOwner(ctx : TransferContext, id : Nat) : async () {
    let key = lockKey(#OW, id);
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepOwner(ctx, id);
    } catch (_) {
      // The attempt stays recorded; the timer applies the rule again.
    } finally {
      unlock(ctx.locks, key);
    };
  };

  func setSweep(ctx : TransferContext, sweep : OwnerTypes.TreasurySweep) {
    ctx.ownerRevenue.sweep := sweep;
  };

  func setSweepToken(ctx : TransferContext, token : Types.PayToken, balance : ?Nat, status : OwnerTypes.SweepTokenStatus) {
    let sweep = ctx.ownerRevenue.sweep;
    setSweep(ctx, { sweep with tokens = sweep.tokens.map(func(t : OwnerTypes.SweepToken) : OwnerTypes.SweepToken = if (t.token == token) { { t with balance; status } } else t) });
  };

  // One send of the recorded SR attempt (sends + 1). True once it succeeded.
  func sendReserveTopUp(ctx : TransferContext, attempt : TransferAttempt) : async Bool {
    let sending = { attempt with sends = attempt.sends + 1 };
    setSweep(ctx, { ctx.ownerRevenue.sweep with reserveTopUp = ?sending });
    let result = await sendCounted(PayTokenLib.ledger(#icp), sending, describeFor(#icp));
    setSweep(ctx, { ctx.ownerRevenue.sweep with reserveTopUp = ?result });
    switch (result.outcome) {
      case (#succeeded(_)) {
        await CyclesReserveLib.refreshReserveBalance(ctx.cyclesReserve, ctx.canister);
        true;
      };
      case (_) { false };
    };
  };

  // Once only: tops the cycles reserve up to 2 ICP from MINT-TREASURY-ICP
  // (memo TTTI-SR-<n>). True when done (sent, or nothing to send).
  func stepReserveTopUp(ctx : TransferContext) : async Bool {
    let now = nowNat64();
    switch (ctx.ownerRevenue.sweep.reserveTopUp) {
      case (?a) {
        switch (nextAction(a, now)) {
          case (#done) { true };
          case (#needsReview) { false }; // waits for the admin (To review)
          case (#resend) { await sendReserveTopUp(ctx, a) };
          case (#newAttempt) { await sendReserveTopUp(ctx, newAttempt(ctx.retry, #SR, ?a, a.request, now)) };
        };
      };
      case null {
        let ledger = PayTokenLib.ledger(#icp);
        let treasuryBalance = switch (await PayTokenLib.balanceOf(ledger, TreasuryLib.mintTreasuryAccount(ctx.canister, #icp))) {
          case (#ok(v)) { v };
          case (#err(_)) { return false };
        };
        let reserveBalance = switch (await PayTokenLib.balanceOf(ledger, CyclesReserveLib.reserveAccount(ctx.canister))) {
          case (#ok(v)) { v };
          case (#err(_)) { return false };
        };
        // Re-checked after the awaits: never opened twice.
        if (ctx.ownerRevenue.sweep.reserveTopUp != null or ctx.ownerRevenue.sweep.status != #toppingUpReserve) {
          return false;
        };
        let fee = TreasuryLib.ICP_FEE;
        let need = if (CyclesReserveLib.RESERVE_FLOOR_E8S > reserveBalance) Nat.sub(CyclesReserveLib.RESERVE_FLOOR_E8S, reserveBalance) else 0;
        let available = if (treasuryBalance > fee) Nat.sub(treasuryBalance, fee) else 0;
        let amount = Nat.min(need, available);
        if (amount == 0) {
          return true;
        };
        let request : TransferRequest = {
          token = #icp;
          from_subaccount = ?TreasuryLib.mintTreasurySubaccount(#icp);
          to = CyclesReserveLib.reserveAccount(ctx.canister);
          amount;
          fee = ?fee;
        };
        let attempt = newAttempt(ctx.retry, #SR, null, request, nowNat64());
        setSweep(ctx, { ctx.ownerRevenue.sweep with reserveTopUp = ?attempt; reserveTopUpE8s = amount });
        await sendReserveTopUp(ctx, attempt);
      };
    };
  };

  // Sweep of one internal mint treasury. True when this token is finished.
  func stepSweepToken(ctx : TransferContext, token : Types.PayToken) : async Bool {
    let entry = ctx.ownerRevenue.sweep.tokens.find(func(t : OwnerTypes.SweepToken) : Bool = t.token == token) ?? (return true);
    switch (entry.status) {
      case (#nothingToSend or #sent(_)) { true };
      case (#sending(id)) {
        let s = ctx.ownerRevenue.sends.get(id) ?? (return false);
        switch (s.status) {
          case (#sent(_)) {
            setSweepToken(ctx, token, entry.balance, #sent(id));
            true;
          };
          case (_) { false }; // retried by runOwnerRetries / To review
        };
      };
      case (#pending or #waitingDestination) {
        let balance = switch (await PayTokenLib.balanceOf(PayTokenLib.ledger(token), TreasuryLib.mintTreasuryAccount(ctx.canister, token))) {
          case (#ok(v)) { v };
          case (#err(_)) { return false };
        };
        if (balance <= PayTokenLib.expectedFee(token)) {
          setSweepToken(ctx, token, ?balance, #nothingToSend);
          return true;
        };
        // No automatic destination exists any more: the balance is part of the
        // admin-managed treasury and is not swept.
        setSweepToken(ctx, token, ?balance, #nothingToSend);
        true;
      };
    };
  };

  func stepSweep(ctx : TransferContext) : async () {
    if (ctx.ownerRevenue.sweep.status == #notStarted) {
      setSweep(ctx, {
        ctx.ownerRevenue.sweep with
        status = #toppingUpReserve;
        startedAt = ?Time.now();
        tokens = PayTokenLib.ALL.map(func(t : Types.PayToken) : OwnerTypes.SweepToken = { token = t; balance = null; status = #pending });
      });
    };
    if (ctx.ownerRevenue.sweep.status == #toppingUpReserve) {
      if (not (await stepReserveTopUp(ctx))) {
        return;
      };
      setSweep(ctx, { ctx.ownerRevenue.sweep with status = #sending });
    };
    if (ctx.ownerRevenue.sweep.status == #sending) {
      var finished = true;
      for (token in PayTokenLib.ALL.values()) {
        if (not (await stepSweepToken(ctx, token))) {
          finished := false;
        };
      };
      if (finished) {
        setSweep(ctx, { ctx.ownerRevenue.sweep with status = #completed; completedAt = ?Time.now() });
      };
    };
  };

  // Runs the once-only treasury sweep step by step (top-up of the cycles
  // reserve to 2 ICP from MINT-TREASURY-ICP, then one #treasurySweep OW send
  // per token). No-op once #completed or never started.
  public func runTreasurySweep(ctx : TransferContext) : async () {
    // A sweep that never started stays unstarted: mint revenue is managed by the admin.
    if (ctx.ownerRevenue.sweep.status == #completed or ctx.ownerRevenue.sweep.status == #notStarted) {
      return;
    };
    let key = "SWEEP";
    if (not tryLock(ctx.locks, key)) {
      return;
    };
    try {
      await stepSweep(ctx);
    } catch (_) {
      // State is recorded step by step; the next timer pass continues.
    } finally {
      unlock(ctx.locks, key);
    };
  };

  // Retry pass for OW and SR (called by the 10-minute retry timer). The pause
  // blocks owner sends; the reserve top-up (SR) continues.
  public func runOwnerRetries(ctx : TransferContext) : async () {
    await runTreasurySweep(ctx);
    if (ctx.sale.salesPaused) {
      return;
    };
    let ids = ctx.ownerRevenue.sends.values().filter(ownerSendActive).map(func(s : OwnerTypes.OwnerSend) : Nat = s.id).toArray();
    for (id in ids.values()) {
      await sendOwner(ctx, id);
    };
    let moves = ctx.mintRevenue.feeMoves.values().filter(feeMoveActive).map(func(m : OwnerTypes.FeeMove) : Nat = m.n).toArray();
    for (n in moves.values()) {
      await sendFeeMove(ctx, n);
    };
  };

  // --- PTM-4: settlement of the cycles share of the 1 % mint and buyback fees ---
  //
  // The share is recorded synchronously with the fee (CyclesFeeStore.pendingE8s)
  // and stays in the contract's ICP DEX balance. The settlement moves it from
  // the ICP custody account to the cycles reserve account, recorded before the
  // first await (memo TTTI-CY-<n>, created_at_time), resent identically for
  // 23 h, then To review (admin). While a settlement is open its gross amount
  // is reserved in the contract's DEX balance. It lives in this module because
  // lib/cycles-reserve.mo cannot import it (this module imports that one).

  public type CyclesFeeContext = {
    fees : CyclesTypes.CyclesFeeStore;
    reserve : CyclesTypes.CyclesReserveStore;
    dex : DexContext;
  };

  let CYCLES_FEE_LOCK : Text = "CY";

  func cySat(a : Nat, b : Nat) : Nat = if (a > b) Nat.sub(a, b) else 0;

  func cyclesFeeIsOpen(s : CyclesTypes.CyclesFeeSettlement) : Bool {
    switch (s.status) {
      case (#inProgress) { true };
      case (#needsReview) { true };
      case (_) { false };
    };
  };

  // Closes an open settlement: #completed finalises the debit and counts the
  // net amount in the cached reserve balance (the next refresh overwrites it
  // with the ledger value); any other status returns the amount to pending.
  func closeCyclesFee(ctx : CyclesFeeContext, s : CyclesTypes.CyclesFeeSettlement, attempt : Types.DexTransferAttempt, status : DexTypes.DexTransferStatus) {
    if (not cyclesFeeIsOpen(s)) {
      return;
    };
    switch (status) {
      case (#completed(_)) {
        DexLib.settleReserved(ctx.dex.balances, ctx.dex.canister, #icp, s.grossE8s);
        ctx.fees.inFlightE8s := cySat(ctx.fees.inFlightE8s, s.grossE8s);
        ctx.fees.settledE8s += s.grossE8s;
        ctx.reserve.reserveBalanceE8s += s.netE8s;
      };
      case (_) {
        DexLib.release(ctx.dex.balances, ctx.dex.canister, #icp, s.grossE8s);
        ctx.fees.inFlightE8s := cySat(ctx.fees.inFlightE8s, s.grossE8s);
        ctx.fees.pendingE8s += s.grossE8s;
      };
    };
    ctx.fees.settlements.add(s.n, { s with attempt; status });
  };

  func applyCyclesFeeSend(ctx : CyclesFeeContext, n : Nat, sent : Types.DexTransferAttempt) {
    let s = switch (ctx.fees.settlements.get(n)) {
      case (?s) { s };
      case null { return };
    };
    switch (sent.outcome) {
      case (#succeeded(block)) { closeCyclesFee(ctx, s, sent, #completed(block)) };
      case (#failed(reason)) { closeCyclesFee(ctx, s, sent, #failed(reason)) };
      case (_) { ctx.fees.settlements.add(n, { s with attempt = sent }) };
    };
  };

  func openCyclesFeeSettlement(ctx : CyclesFeeContext) : Bool {
    for (s in ctx.fees.settlements.values()) {
      if (cyclesFeeIsOpen(s)) {
        return true;
      };
    };
    false;
  };

  // Sends the pending cycles share to the reserve account (one open
  // settlement at a time). Never changes a balance before the transfer is
  // recorded; a fresh send is identical on resend (same memo and time).
  public func settleCyclesFees(ctx : CyclesFeeContext, now : Int) : async CyclesTypes.SettleResult {
    if (ctx.dex.locks.contains(CYCLES_FEE_LOCK) or openCyclesFeeSettlement(ctx)) {
      return #inProgress;
    };
    let pending = ctx.fees.pendingE8s;
    if (pending == 0) {
      return #nothingToSettle;
    };
    let fee = dexFee(ctx.dex, #icp);
    if (pending < CyclesReserveLib.MIN_SETTLE_E8S or pending <= fee) {
      return #belowMinimum({ pendingE8s = pending; minimumE8s = Nat.max(CyclesReserveLib.MIN_SETTLE_E8S, fee + 1) });
    };
    if (not DexLib.reserve(ctx.dex.balances, ctx.dex.canister, #icp, pending)) {
      return #notCovered;
    };
    let net = Nat.sub(pending, fee);
    let request : Types.DexTransferRequest = {
      token = #icp;
      from = DexLib.custodyAccount(ctx.dex.canister, #icp);
      to = CyclesReserveLib.reserveAccount(ctx.dex.canister);
      amount = net;
      fee = ?fee;
    };
    // Recorded before the first await.
    let attempt = newDexAttempt(ctx.dex.retry, #CY, null, request, nowNat64());
    let record : CyclesTypes.CyclesFeeSettlement = {
      n = attempt.n;
      grossE8s = pending;
      netE8s = net;
      createdAt = now;
      attempt;
      status = #inProgress;
    };
    ctx.fees.pendingE8s := 0;
    ctx.fees.inFlightE8s += pending;
    ctx.fees.settlements.add(record.n, record);
    ctx.dex.locks.add(CYCLES_FEE_LOCK);
    try {
      let sent = await sendDexAttempt(ctx.dex, attempt);
      applyCyclesFeeSend(ctx, record.n, sent);
    } finally {
      ctx.dex.locks.remove(CYCLES_FEE_LOCK);
    };
    #sent(ctx.fees.settlements.get(record.n) ?? record);
  };

  // Timer (10 minutes): resends a settlement whose outcome is unknown with
  // the identical request, moves it to review after 23 h, then settles any
  // newly recorded share. The DEX pause does not stop it.
  public func runCyclesFeeSettlement(ctx : CyclesFeeContext) : async () {
    let now = nowNat64();
    for (s in ctx.fees.settlements.values().toArray().values()) {
      if (s.status == #inProgress and not ctx.dex.locks.contains(CYCLES_FEE_LOCK)) {
        switch (dexNextAction(s.attempt, now)) {
          case (#resend) {
            ctx.dex.locks.add(CYCLES_FEE_LOCK);
            try {
              let sent = await sendDexAttempt(ctx.dex, s.attempt);
              applyCyclesFeeSend(ctx, s.n, sent);
            } finally {
              ctx.dex.locks.remove(CYCLES_FEE_LOCK);
            };
          };
          case (#newAttempt) {
            // Never sent, or a known ledger error: the amount returns to pending.
            closeCyclesFee(ctx, s, s.attempt, #failed(s.attempt.lastError ?? "Transfer not sent"));
          };
          case (#needsReview) {
            ctx.fees.settlements.add(s.n, { s with status = #needsReview });
          };
          case (#done) {};
        };
      };
    };
    ignore await settleCyclesFees(ctx, Time.now());
  };

  // Arms the 10-minute settlement timer (call on every install and upgrade).
  public func startCyclesFeeTimer<system>(ctx : CyclesFeeContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(TIMER_INTERVAL_SECONDS),
      func() : async () { await runCyclesFeeSettlement(ctx) },
    );
  };

  // Admin: settlements waiting for review (outcome unknown after 23 h).
  public func cyclesFeesToReview(ctx : CyclesFeeContext) : [CyclesTypes.CyclesFeeSettlement] {
    ctx.fees.settlements.values().filter(func s = s.status == #needsReview).toArray();
  };

  // Admin: the ledger shows the settlement arrived at `block`.
  public func markCyclesFeeArrived(ctx : CyclesFeeContext, n : Nat, block : Nat) : { #ok; #err : Text } {
    switch (ctx.fees.settlements.get(n)) {
      case (?s) {
        if (s.status != #needsReview) {
          return #err("Settlement is not waiting for review");
        };
        closeCyclesFee(ctx, s, { s.attempt with outcome = #succeeded(block) }, #completed(block));
        #ok;
      };
      case null { #err("Unknown settlement") };
    };
  };

  // Admin: the ledger shows the settlement did not arrive; the amount returns
  // to pending and a new settlement sends it.
  public func markCyclesFeeNotArrived(ctx : CyclesFeeContext, n : Nat) : { #ok; #err : Text } {
    switch (ctx.fees.settlements.get(n)) {
      case (?s) {
        if (s.status != #needsReview) {
          return #err("Settlement is not waiting for review");
        };
        let text = "Not arrived (admin verification)";
        closeCyclesFee(ctx, s, { s.attempt with outcome = #failed(text) }, #failed(text));
        #ok;
      };
      case null { #err("Unknown settlement") };
    };
  };
};
