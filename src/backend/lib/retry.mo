import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
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

  // "PC", "RF", "FW", "SH", "BB", "BR".
  public func prefixText(prefix : TransferPrefix) : Text {
    switch (prefix) {
      case (#PC) { "PC" };
      case (#RF) { "RF" };
      case (#FW) { "FW" };
      case (#SH) { "SH" };
      case (#BB) { "BB" };
      case (#BR) { "BR" };
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

  // --- Buyback payouts (BB) ---------------------------------------------------

  // "TTTI-BB-<n>-<m>" (always with the attempt index), <= 32 bytes.
  public func buybackPayoutMemo(n : Nat, m : Nat) : Blob {
    ("TTTI-BB-" # n.toText() # "-" # m.toText()).encodeUtf8();
  };

  // New BB attempt (memo TTTI-BB-<n>-<m>, created_at_time = now, #pending);
  // call before the first await and store it on the buyback record.
  public func newBuybackPayoutAttempt(store : RetryStore, previous : ?TransferAttempt, request : TransferRequest, now : Nat64) : TransferAttempt {
    let a = newAttempt(store, #BB, previous, request, now);
    { a with memo = buybackPayoutMemo(a.n, a.attempt) };
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
  };

  type Plan = {
    #request : TransferRequest;
    #notRequired;
    #noTarget; // treasury account not configured yet: kept pending
  };

  func forwardPlan(ctx : TransferContext, conversion : Treasury.Conversion) : Plan {
    let token = conversion.payToken;
    let target = TreasuryLib.tokenAccount(ctx.treasury, token) ?? (return #noTarget);
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

  func review(kind : TransferKind, purchaseId : Nat, token : Types.PayToken, attempt : ?TransferAttempt, fallback : ?TransferRequest) : TransferReview {
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
    forwards.concat(shares).concat(refunds).concat(payments);
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
      // BTC rows are handled by lib/btc-deposit.mo (deposit entries).
      // BTC rows are handled by lib/btc-deposit.mo, BB rows by lib/buyback.mo.
      case (#BR or #BC or #BM or #BB) { return #err(#notApplicable) };
    };
    #ok;
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
      // BTC rows are handled by lib/btc-deposit.mo (deposit entries).
      // BB rows are handled by lib/buyback.mo.
      case (#BR or #BC or #BM or #BB) { return #err(#notApplicable) };
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
      // BB: buyback payouts are not refunded by hand (cancelBuyback instead).
      case (#BR or #BC or #BM or #BB) { #err(#notApplicable) };
    };
  };
};
