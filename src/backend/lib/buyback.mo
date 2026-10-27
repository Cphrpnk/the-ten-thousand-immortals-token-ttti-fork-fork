import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Result "mo:core/Result";
import Types "../types/buyback";
import Icrc "../types/icrc";
import RetryTypes "../types/retry";
import TreasuryLib "treasury";
import OracleLib "oracle";
import PayTokenLib "pay-token";
import IcrcLib "icrc";
import RetryLib "retry";

module {
  public type Buyback = Types.Buyback;
  public type BuybackMass = Types.BuybackMass;
  public type BuybackQuote = Types.BuybackQuote;
  public type BuybackError = Types.BuybackError;
  public type PayToken = Types.PayToken;
  public type Account = Types.Account;

  // TTTI-T value: 10,000 USD per TTTI-T (8 decimals), so one base unit is
  // worth 10,000 USD * 10^8 / 10^8 = 10,000 USD-e8.
  public let USD_E8_PER_TTTI_UNIT : Nat = 10_000;
  public let BUYBACK_FEE_BPS : Nat = 100; // 1%

  // ICRC-2 allowance query shared by the pay-token ledgers.
  public type AllowanceLedger = actor {
    icrc2_allowance : shared query ({ account : Account; spender : Account }) -> async { allowance : Nat; expires_at : ?Nat64 };
  };

  public func allowanceLedger(token : PayToken) : AllowanceLedger = actor (PayTokenLib.ledgerId(token).toText());

  func scale(token : PayToken) : Nat = 10 ** PayTokenLib.expectedDecimals(token).toNat();

  // Base units of `token` worth `tttiAmount` TTTI-T at `rateUsdE8`.
  public func dayRateQuantity(token : PayToken, tttiAmount : Nat, rateUsdE8 : Nat) : Nat {
    tttiAmount * USD_E8_PER_TTTI_UNIT * scale(token) / rateUsdE8;
  };

  // min(pro-rata net, day-rate quantity) and which one was used.
  public func base(originalNet : Nat, dayQuantity : Nat) : (Nat, Types.BuybackRule) {
    if (originalNet <= dayQuantity) (originalNet, #originalNet) else (dayQuantity, #dayRate);
  };

  public func rateOf(oracle : OracleLib.OracleStore, rates : OracleLib.TokenRateStore, token : PayToken, now : Int) : ?Nat {
    OracleLib.usableRate(OracleLib.storeFor(oracle, rates, token), now);
  };

  // Transient lock key of one mass: buyer principal and mass token.
  public func lockKey(buyer : Principal, token : PayToken) : Text {
    buyer.toText() # ":" # PayTokenLib.symbol(token);
  };

  // TTTI-T of this buyback were pulled and not returned (counted against the mass).
  func pulled(r : Buyback) : Bool {
    switch (r.status) {
      case (#inProgress) { r.pullBlock != null };
      case (#completed) { true };
      case (#payoutFailed) { true };
      case (#cancelled) { false };
    };
  };

  func saturatingSub(a : Nat, b : Nat) : Nat {
    if (a > b) Nat.sub(a, b) else 0;
  };

  // The buyer's mass in `token`: completed conversions with depositor ==
  // buyer, payToken == token, netAmount ?n with n > 0 and tttiAmount > 0,
  // minus every buyback of that buyer in that token (legacy and new).
  public func massOf(
    store : Types.BuybackStore,
    inFlight : Set.Set<Text>,
    treasury : TreasuryLib.TreasuryStore,
    buyer : Principal,
    token : PayToken,
  ) : BuybackMass {
    var purchaseCount = 0;
    var totalNet = 0;
    var totalTtti = 0;
    for (c in treasury.conversions.values()) {
      if (c.depositor == buyer and c.payToken == token and c.status == #completed and c.tttiAmount > 0) {
        switch (c.netAmount) {
          case (?n) {
            if (n > 0) {
              purchaseCount += 1;
              totalNet += n;
              totalTtti += c.tttiAmount;
            };
          };
          case null {};
        };
      };
    };
    var boughtBackNet = 0;
    var boughtBackTtti = 0;
    for (r in store.records.values()) {
      if (r.buyer == buyer and r.originalToken == token and pulled(r)) {
        boughtBackNet += r.originalNetAmount;
        boughtBackTtti += r.tttiAmount;
      };
    };
    {
      buyer;
      token;
      purchaseCount;
      totalNet;
      totalTtti;
      boughtBackNet;
      boughtBackTtti;
      remainingNet = saturatingSub(totalNet, boughtBackNet);
      remainingTtti = saturatingSub(totalTtti, boughtBackTtti);
      inProgress = inFlight.contains(lockKey(buyer, token));
    };
  };

  // The buyer's masses with at least one eligible purchase, in PayTokenLib.ALL order.
  public func massesOf(
    store : Types.BuybackStore,
    inFlight : Set.Set<Text>,
    treasury : TreasuryLib.TreasuryStore,
    buyer : Principal,
  ) : [BuybackMass] {
    PayTokenLib.ALL.map(func t = massOf(store, inFlight, treasury, buyer, t)).filter(func m = m.purchaseCount > 0);
  };

  // Every buyer's masses with at least one eligible purchase (admin view).
  public func allMasses(
    store : Types.BuybackStore,
    inFlight : Set.Set<Text>,
    treasury : TreasuryLib.TreasuryStore,
  ) : [BuybackMass] {
    let buyers = Set.empty<Principal>();
    for (c in treasury.conversions.values()) {
      if (c.status == #completed) buyers.add(c.depositor);
    };
    var out : [BuybackMass] = [];
    for (b in buyers.values()) {
      out := out.concat(massesOf(store, inFlight, treasury, b));
    };
    out;
  };

  // Every check that needs no ledger call, then the full calculation:
  // tttiAmount = remainingTtti * percent / 100 (whole remainder at 100),
  // pro-rata net = remainingNet * tttiAmount / remainingTtti (remainingNet at 100),
  // base = min(pro-rata net, day-rate quantity), then 1% fee and the mass
  // token's ledger fee. Paid only in the mass token (no conversion).
  public func computeQuote(
    store : Types.BuybackStore,
    inFlight : Set.Set<Text>,
    treasury : TreasuryLib.TreasuryStore,
    oracle : OracleLib.OracleStore,
    rates : OracleLib.TokenRateStore,
    tttiFee : Nat,
    caller : Principal,
    massToken : PayToken,
    percent : Nat,
    receiveToken : PayToken,
    now : Int,
  ) : { #ok : BuybackQuote; #err : BuybackError } {
    if (caller.isAnonymous()) return #err(#anonymous);
    if (percent < 1 or percent > 100) return #err(#invalidPercent);
    if (receiveToken != massToken) return #err(#receiveTokenMismatch);
    let mass = massOf(store, inFlight, treasury, caller, massToken);
    if (mass.remainingTtti == 0) return #err(#nothingRemaining);
    if (mass.inProgress) return #err(#massBuybackInProgress);
    let massRate = switch (rateOf(oracle, rates, massToken, now)) {
      case (?r) r;
      case null return #err(#rateUnavailable(massToken));
    };
    let tttiAmount = if (percent == 100) mass.remainingTtti else mass.remainingTtti * percent / 100;
    if (tttiAmount == 0) return #err(#amountTooSmall);
    let originalNetAmount = if (percent == 100) mass.remainingNet else mass.remainingNet * tttiAmount / mass.remainingTtti;
    let (baseAmount, rule) = base(originalNetAmount, dayRateQuantity(massToken, tttiAmount, massRate));
    let baseAmountReturned = baseAmount;
    let buybackFee = baseAmountReturned * BUYBACK_FEE_BPS / 10_000;
    let thirdPartyFees = PayTokenLib.expectedFee(massToken);
    if (baseAmountReturned <= buybackFee + thirdPartyFees) return #err(#amountTooSmall);
    #ok({
      originalToken = massToken;
      tokenReturned = massToken;
      percent;
      massTotalNet = mass.totalNet;
      massTotalTtti = mass.totalTtti;
      massRemainingNet = mass.remainingNet;
      massRemainingTtti = mass.remainingTtti;
      originalRateUsdE8 = massRate;
      returnedRateUsdE8 = massRate;
      rule;
      originalNetAmount;
      baseAmount;
      baseAmountReturned;
      buybackFee;
      thirdPartyFees;
      tttiTransferFee = tttiFee;
      tttiEscrowFee = tttiFee;
      amountReturned = Nat.sub(baseAmountReturned, buybackFee + thirdPartyFees);
      tttiAmount;
      tttiAllowanceRequired = tttiAmount + 2 * tttiFee;
    });
  };

  public func newRecord(q : BuybackQuote, id : Types.BuybackId, buyer : Principal, buyerAccount : Account, now : Int) : Buyback {
    {
      id;
      purchaseId = null;
      buyer;
      buyerAccount;
      timestamp = now;
      originalToken = q.originalToken;
      tokenReturned = q.tokenReturned;
      percent = q.percent;
      massTotalNet = q.massTotalNet;
      massTotalTtti = q.massTotalTtti;
      massRemainingNet = q.massRemainingNet;
      massRemainingTtti = q.massRemainingTtti;
      originalRateUsdE8 = q.originalRateUsdE8;
      returnedRateUsdE8 = q.returnedRateUsdE8;
      rule = q.rule;
      originalNetAmount = q.originalNetAmount;
      baseAmount = q.baseAmount;
      baseAmountReturned = q.baseAmountReturned;
      buybackFee = q.buybackFee;
      thirdPartyFees = q.thirdPartyFees;
      tttiTransferFee = q.tttiTransferFee;
      tttiEscrowFee = q.tttiEscrowFee;
      amountReturned = q.amountReturned;
      tttiAmount = q.tttiAmount;
      pullBlock = null;
      payoutBlock = null;
      payoutAttempts = [];
      releaseBlock = null;
      cancelBlock = null;
      legacy = false;
      status = #inProgress;
      message = null;
    };
  };

  public func forBuyer(store : Types.BuybackStore, buyer : Principal) : [Buyback] {
    store.records.values().filter(func(r : Buyback) : Bool = r.buyer == buyer).toArray();
  };

  // Ledger dedup time for the payout: the record time while inside the
  // ledgers' 24 h window (retries are then deduplicated), otherwise none.
  public func payoutCreatedAt(record : Buyback, now : Int) : ?Nat64 {
    if (now - record.timestamp < 23 * 3_600_000_000_000 and record.timestamp > 0) {
      ?record.timestamp.toNat().toNat64();
    } else null;
  };

  public func tttiErrorText(err : Icrc.TransferFromError) : Text {
    switch (err) {
      case (#InsufficientAllowance({ allowance })) "TTTI-T allowance too low (" # allowance.toText() # " base units)";
      case (#InsufficientFunds({ balance })) "Insufficient TTTI-T balance (" # balance.toText() # " base units)";
      case (#BadFee({ expected_fee })) "TTTI-T fee rejected (expected " # expected_fee.toText() # ")";
      case (#BadBurn(_)) "TTTI-T transfer refused as a burn";
      case (#TooOld) "TTTI-T transfer too old";
      case (#CreatedInFuture(_)) "TTTI-T transfer time rejected";
      case (#Duplicate({ duplicate_of })) "Duplicate TTTI-T transfer (block " # duplicate_of.toText() # ")";
      case (#TemporarilyUnavailable) "TTTI-T ledger temporarily unavailable";
      case (#GenericError({ message })) message;
    };
  };

  // --- Escrowed payout (lot 5) -------------------------------------------------

  // Shared stores of every payout path (request, buyer retry, timer).
  public type PayoutContext = {
    store : Types.BuybackStore;
    inFlight : Set.Set<Text>; // the buyback lock (lockKey), transient
    ledger : IcrcLib.Ledger;
    canister : Principal;
    retry : RetryTypes.RetryStore;
  };

  // The timer opens a new attempt after a known Err only once the previous
  // attempt is at least this old (1 h), so a lasting Err does not pile up
  // attempts every 10 minutes.
  let TIMER_NEW_ATTEMPT_DELAY_NS : Nat64 = 3_600_000_000_000;

  public func contractAccount(canister : Principal) : Account = { owner = canister; subaccount = null };

  // The latest payout attempt, if any.
  public func lastAttempt(record : Buyback) : ?Types.BuybackPayoutAttempt {
    let size = record.payoutAttempts.size();
    if (size == 0) null else ?record.payoutAttempts[size - 1];
  };

  // True when there is at least one attempt and every attempt got a known
  // ledger Err (#failed): a new attempt or a cancellation is allowed.
  public func allAttemptsFailed(record : Buyback) : Bool {
    record.payoutAttempts.size() > 0 and record.payoutAttempts.all(
      func(a : Types.BuybackPayoutAttempt) : Bool = switch (a.attempt.outcome) {
        case (#failed(_)) true;
        case _ false;
      }
    );
  };

  // True when an attempt arrived (#succeeded).
  public func anyAttemptArrived(record : Buyback) : Bool {
    record.payoutAttempts.any(
      func(a : Types.BuybackPayoutAttempt) : Bool = switch (a.attempt.outcome) {
        case (#succeeded(_)) true;
        case _ false;
      }
    );
  };

  // lib/retry.mo rule on the latest attempt: #resend (pending or unknown
  // within 23 h; legacy attempt 0 never resent), #newAttempt (known Err, or
  // no attempt yet), #needsReview (unknown after 23 h), #done (arrived).
  public func payoutAction(record : Buyback, now : Nat64) : RetryTypes.RetryAction {
    switch (lastAttempt(record)) {
      case null #newAttempt;
      case (?a) {
        if (a.attempt.attempt == 0) {
          switch (a.attempt.outcome) {
            case (#succeeded(_)) #done;
            case (#failed(_)) #newAttempt;
            case _ #needsReview;
          };
        } else {
          RetryLib.nextAction(a.attempt, now);
        };
      };
    };
  };

  func replaceLast(record : Buyback, a : Types.BuybackPayoutAttempt) : Buyback {
    let size = record.payoutAttempts.size();
    if (size == 0) return { record with payoutAttempts = [a] };
    { record with payoutAttempts = record.payoutAttempts.sliceToArray(0, size - 1).concat([a]) };
  };

  // Records the attempt to send before the first await: a new attempt
  // (memo TTTI-BB-<n>-<m>, created_at_time = now, request = amountReturned +
  // thirdPartyFees to buyerAccount in the mass token, from `funder`) or the
  // unchanged latest one for a resend. Status #inProgress. The send about to
  // happen is counted in `sends`.
  public func openPayoutAttempt(retry : RetryTypes.RetryStore, record : Buyback, funder : Account, now : Nat64) : Buyback {
    let last = lastAttempt(record);
    let opened = switch (payoutAction(record, now), last) {
      case (#resend, ?a) {
        replaceLast(record, { a with attempt = { a.attempt with sends = a.attempt.sends + 1 } });
      };
      case _ {
        let request : RetryTypes.TransferRequest = {
          token = record.tokenReturned;
          from_subaccount = funder.subaccount;
          to = record.buyerAccount;
          amount = record.amountReturned;
          fee = ?record.thirdPartyFees;
        };
        let previous = switch (last) { case (?a) ?a.attempt; case null null };
        let attempt = RetryLib.newBuybackPayoutAttempt(retry, previous, request, now);
        { record with payoutAttempts = record.payoutAttempts.concat([{ from = funder; attempt = { attempt with sends = 1 } }]) };
      };
    };
    { opened with status = #inProgress; message = null };
  };

  func unknownBefore(a : RetryTypes.TransferAttempt) : Bool {
    switch (a.outcome) {
      case (#unknown) true;
      case (#pending) a.sends > 1;
      case _ false;
    };
  };

  // Sends the latest attempt exactly as recorded (icrc2_transfer_from from
  // its funder, contract as spender, memo and created_at_time) and returns
  // the record with the attempt outcome applied (Ok / #Duplicate ->
  // #succeeded, Err -> #failed, rejection -> #unknown). Does not store.
  public func sendPayout(record : Buyback) : async Buyback {
    let a = switch (lastAttempt(record)) {
      case (?a) a;
      case null return record;
    };
    let req = a.attempt.request;
    let token = req.token;
    let outcome : RetryTypes.TransferAttempt = try {
      let result = await PayTokenLib.ledger(token).icrc2_transfer_from({
        spender_subaccount = null;
        from = a.from;
        to = req.to;
        amount = req.amount;
        fee = req.fee;
        memo = ?a.attempt.memo;
        created_at_time = ?a.attempt.created_at_time;
      });
      switch (result) {
        case (#Ok(block)) { { a.attempt with outcome = #succeeded(block) } };
        case (#Err(#Duplicate({ duplicate_of }))) { { a.attempt with outcome = #succeeded(duplicate_of) } };
        case (#Err(err)) {
          let text = PayTokenLib.transferFromErrorMessage(token, err);
          if (unknownBefore(a.attempt)) {
            { a.attempt with outcome = #unknown; lastError = ?text };
          } else {
            { a.attempt with outcome = #failed(text); lastError = ?text };
          };
        };
      };
    } catch (e) {
      RetryLib.applyReject(a.attempt, "The " # PayTokenLib.symbol(token) # " ledger could not be reached: " # e.message());
    };
    replaceLast(record, { a with attempt = outcome });
  };

  func transferErrorText(err : Icrc.TransferError) : Text {
    switch (err) {
      case (#InsufficientFunds({ balance })) "Insufficient TTTI-T escrow balance (" # balance.toText() # " base units)";
      case (#BadFee({ expected_fee })) "TTTI-T fee rejected (expected " # expected_fee.toText() # ")";
      case (#BadBurn(_)) "TTTI-T transfer refused as a burn";
      case (#TooOld) "TTTI-T transfer too old";
      case (#CreatedInFuture(_)) "TTTI-T transfer time rejected";
      case (#Duplicate({ duplicate_of })) "Duplicate TTTI-T transfer (block " # duplicate_of.toText() # ")";
      case (#TemporarilyUnavailable) "TTTI-T ledger temporarily unavailable";
      case (#GenericError({ message })) message;
    };
  };

  // Escrow -> `to`: debits the escrow exactly what this buyback deposited
  // (tttiAmount + tttiEscrowFee) with the current TTTI-T fee; with an
  // unchanged fee `to` receives exactly tttiAmount.
  func escrowSend(ledger : IcrcLib.Ledger, canister : Principal, record : Buyback, to : Account) : { #ok : Nat; #err : Text } {
    let fee = IcrcLib.fee(ledger);
    let held = record.tttiAmount + record.tttiEscrowFee;
    if (held <= fee) return #err("The escrowed TTTI-T do not cover the TTTI-T fee");
    switch (
      IcrcLib.transfer(
        ledger,
        canister,
        canister,
        {
          from_subaccount = ?IcrcLib.BUYBACK_ESCROW_SUBACCOUNT;
          to;
          amount = Nat.sub(held, fee);
          fee = ?fee;
          memo = null;
          created_at_time = null;
        },
      )
    ) {
      case (#Ok(block)) #ok(block);
      case (#Err(err)) #err(transferErrorText(err));
    };
  };

  // Escrow -> `to` (the funder of the arrived attempt): tttiAmount with the
  // second fee tttiEscrowFee, internal synchronous TTTI-T transfer.
  public func releaseEscrow(ledger : IcrcLib.Ledger, canister : Principal, record : Buyback, to : Account) : { #ok : Nat; #err : Text } {
    escrowSend(ledger, canister, record, to);
  };

  // Escrow -> buyerAccount: tttiAmount with the second fee tttiEscrowFee
  // (the pull fee is not returned), internal synchronous TTTI-T transfer.
  public func refundEscrow(ledger : IcrcLib.Ledger, canister : Principal, record : Buyback) : { #ok : Nat; #err : Text } {
    escrowSend(ledger, canister, record, record.buyerAccount);
  };

  // Applies the latest attempt outcome and stores the record: arrived ->
  // payoutBlock, escrow released to its funder (non-legacy), #completed;
  // otherwise #payoutFailed with the outcome text.
  public func finishPayout(store : Types.BuybackStore, ledger : IcrcLib.Ledger, canister : Principal, record : Buyback) : Result.Result<Buyback, BuybackError> {
    let a = switch (lastAttempt(record)) {
      case (?a) a;
      case null return #err(#notRetryable);
    };
    switch (a.attempt.outcome) {
      case (#succeeded(block)) {
        let paid = { record with payoutBlock = ?block; message = null };
        if (record.legacy or record.releaseBlock != null) {
          let done = { paid with status = #completed };
          store.records.add(record.id, done);
          return #ok(done);
        };
        switch (releaseEscrow(ledger, canister, paid, a.from)) {
          case (#ok(releaseBlock)) {
            let done = { paid with status = #completed; releaseBlock = ?releaseBlock };
            store.records.add(record.id, done);
            #ok(done);
          };
          case (#err(text)) {
            store.records.add(record.id, { paid with status = #completed; message = ?("Payout sent; TTTI-T release from escrow failed: " # text) });
            #err(#releaseFailed(text));
          };
        };
      };
      case (#failed(text)) {
        store.records.add(record.id, { record with status = #payoutFailed; message = ?text });
        #err(#payoutFailed(text));
      };
      case (_) {
        let text = "Payout outcome unknown: " # (a.attempt.lastError ?? "no reply recorded") # "; it is resent identically for 23 h, then checked by the admin";
        store.records.add(record.id, { record with status = #payoutFailed; message = ?text });
        #err(#payoutFailed(text));
      };
    };
  };

  // Admin allowance, expiry and balance on the returned token's ledger.
  public func checkFunding(token : PayToken, funder : Account, required : Nat, canister : Principal) : async ?BuybackError {
    switch (await PayTokenLib.verifyLedger(PayTokenLib.ledger(token), token)) {
      case (#ok) {};
      case (#mismatch(_)) return ?#callFailed("The " # PayTokenLib.symbol(token) # " ledger fee or decimals changed");
      case (#callFailed(msg)) return ?#callFailed(msg);
    };
    let approval = try {
      await allowanceLedger(token).icrc2_allowance({ account = funder; spender = contractAccount(canister) });
    } catch (e) {
      return ?#callFailed(e.message());
    };
    switch (approval.expires_at) {
      case (?exp) {
        if (exp.toNat() <= Time.now()) return ?#adminAllowanceExpired({ token });
      };
      case null {};
    };
    if (approval.allowance < required) {
      return ?#adminAllowanceInsufficient({ token; allowance = approval.allowance; required });
    };
    switch (await PayTokenLib.balanceOf(PayTokenLib.ledger(token), funder)) {
      case (#ok(balance)) {
        if (balance < required) return ?#adminBalanceInsufficient({ token; balance; required });
      };
      case (#err(msg)) return ?#callFailed(msg);
    };
    null;
  };

  // Records the attempt (before the first await), sends it, applies and
  // stores the outcome. Caller holds the buyback lock.
  public func runPayout(ctx : PayoutContext, record : Buyback, funder : Account) : async Result.Result<Buyback, BuybackError> {
    let opened = openPayoutAttempt(ctx.retry, record, funder, RetryLib.now64());
    ctx.store.records.add(record.id, opened);
    let sent = try {
      await sendPayout(opened);
    } catch (e) {
      switch (lastAttempt(opened)) {
        case (?a) replaceLast(opened, { a with attempt = RetryLib.applyReject(a.attempt, e.message()) });
        case null opened;
      };
    };
    finishPayout(ctx.store, ctx.ledger, ctx.canister, sent);
  };

  // A record a retry may act on: #payoutFailed, an #inProgress left by an
  // interrupted call (TTTI-T pulled), or #completed with the escrow release
  // still to do.
  func retryable(r : Buyback) : Bool {
    switch (r.status) {
      case (#payoutFailed) true;
      case (#inProgress) r.pullBlock != null;
      case (#completed) not r.legacy and r.releaseBlock == null and r.payoutBlock != null;
      case (#cancelled) false;
    };
  };

  // One retry step of buyback `id` under the buyback lock (released in a
  // finally): resend within 23 h, a new attempt (new memo and
  // created_at_time) after a known Err, or the pending escrow release.
  // `minAgeNs` delays new attempts (0 for the buyer, 1 h for the timer).
  func retryStep(ctx : PayoutContext, id : Types.BuybackId, minAgeNs : Nat64) : async Result.Result<Buyback, BuybackError> {
    let record = switch (ctx.store.records.get(id)) {
      case (?r) r;
      case null return #err(#buybackNotFound);
    };
    if (not retryable(record)) return #err(#notRetryable);
    let key = lockKey(record.buyer, record.originalToken);
    if (ctx.inFlight.contains(key)) return #err(#buybackInProgress);
    ctx.inFlight.add(key);
    try {
      let now = RetryLib.now64();
      switch (payoutAction(record, now), lastAttempt(record)) {
        case (#done, _) { finishPayout(ctx.store, ctx.ledger, ctx.canister, record) };
        case (#needsReview, _) { #err(#attemptUnknown) };
        case (#resend, ?a) { await runPayout(ctx, record, a.from) };
        case (_, last) {
          switch (last) {
            case (?a) {
              if (minAgeNs > 0 and now < a.attempt.created_at_time + minAgeNs) return #err(#notRetryable);
            };
            case null {};
          };
          let funder = switch (ctx.store.adminAccount) {
            case (?f) f;
            case null return #err(#adminAccountNotSet);
          };
          let funding = try {
            await checkFunding(record.tokenReturned, funder, record.amountReturned + record.thirdPartyFees, ctx.canister);
          } catch (e) {
            ?#callFailed(e.message());
          };
          switch (funding) {
            case (?e) return #err(e);
            case null {};
          };
          let current = switch (ctx.store.records.get(id)) {
            case (?r) r;
            case null return #err(#buybackNotFound);
          };
          await runPayout(ctx, current, funder);
        };
      };
    } finally {
      ctx.inFlight.remove(key);
    };
  };

  // Buyer retry (retryBuybackPayout).
  public func retryPayout(ctx : PayoutContext, id : Types.BuybackId) : async Result.Result<Buyback, BuybackError> {
    await retryStep(ctx, id, 0);
  };

  // Retry timer pass (lib/retry.mo 10-minute timer): every retryable buyback
  // not under review and not locked. Does nothing while sale.salesPaused
  // (checked before each step); attempts stay unchanged until resumed.
  public func runRetries(ctx : PayoutContext, sale : { var salesPaused : Bool }) : async () {
    if (sale.salesPaused) return;
    let now = RetryLib.now64();
    let ids = ctx.store.records.values().filter(
      func(r : Buyback) : Bool = retryable(r) and payoutAction(r, now) != #needsReview and not ctx.inFlight.contains(lockKey(r.buyer, r.originalToken))
    ).map(func(r : Buyback) : Nat = r.id).toArray();
    for (id in ids.values()) {
      if (sale.salesPaused) return;
      try { ignore await retryStep(ctx, id, TIMER_NEW_ATTEMPT_DELAY_NS) } catch (_) {};
    };
  };

  // Shown in "To review": a legacy #payoutFailed record, or a payout whose
  // outcome is unknown after 23 h (legacy unknown at once).
  public func underReview(r : Buyback, now : Nat64) : Bool {
    switch (r.status) {
      case (#payoutFailed or #inProgress) {
        (r.legacy and r.status == #payoutFailed) or (r.payoutAttempts.size() > 0 and payoutAction(r, now) == #needsReview);
      };
      case _ false;
    };
  };

  func reviewRow(r : Buyback) : RetryTypes.TransferReview {
    let a = lastAttempt(r);
    {
      kind = #BB;
      purchaseId = r.id;
      block = r.pullBlock;
      collect = null;
      token = r.tokenReturned;
      memoText = switch (a) { case (?a) { if (a.attempt.memo.size() == 0) null else a.attempt.memo.decodeUtf8() }; case null null };
      memoHex = switch (a) { case (?a) { if (a.attempt.memo.size() == 0) null else ?RetryLib.hex(a.attempt.memo) }; case null null };
      createdAtTimeNs = switch (a) { case (?a) { if (a.attempt.attempt == 0 or a.attempt.created_at_time == 0) null else ?a.attempt.created_at_time }; case null null };
      amount = switch (a) { case (?a) a.attempt.request.amount; case null r.amountReturned };
      fee = switch (a) { case (?a) a.attempt.request.fee; case null ?r.thirdPartyFees };
      destination = switch (a) { case (?a) ?a.attempt.request.to; case null ?r.buyerAccount };
      sends = switch (a) { case (?a) a.attempt.sends; case null 0 };
      lastError = switch (a) { case (?a) { switch (a.attempt.lastError) { case (?e) ?e; case null r.message } }; case null r.message };
      buyer = ?r.buyer;
      depositIndex = null;
      conversionId = null;
      refundPurpose = null;
      outcome = switch (a) { case (?a) ?a.attempt.outcome; case null null };
    };
  };

  // Admin "To review" rows (#BB, purchaseId = buyback id): payout attempts
  // with an unknown outcome after 23 h (legacy unknown at once) and legacy
  // #payoutFailed records.
  public func reviewRows(store : Types.BuybackStore) : [RetryTypes.TransferReview] {
    let now = RetryLib.now64();
    store.records.values().filter(func(r : Buyback) : Bool = underReview(r, now)).map(reviewRow).toArray();
  };

  // Admin: the latest attempt under review arrived in `block`: #succeeded,
  // payoutBlock set, escrow released to its funder (non-legacy), #completed.
  public func markArrived(store : Types.BuybackStore, ledger : IcrcLib.Ledger, canister : Principal, id : Types.BuybackId, block : Nat) : RetryTypes.ReviewResult {
    let r = switch (store.records.get(id)) {
      case (?r) r;
      case null return #err(#notFound);
    };
    if (not underReview(r, RetryLib.now64())) return #err(#notUnderReview);
    let a = switch (lastAttempt(r)) {
      case (?a) a;
      case null return #err(#notApplicable);
    };
    let arrived = replaceLast(r, { a with attempt = { a.attempt with outcome = #succeeded(block) } });
    // The release result is kept on the record (#completed, message on failure).
    ignore finishPayout(store, ledger, canister, arrived);
    #ok;
  };

  // Admin: the latest attempt under review did not arrive: #failed, so the
  // buyer can retry (new attempt) or cancel.
  public func markNotArrived(store : Types.BuybackStore, id : Types.BuybackId) : RetryTypes.ReviewResult {
    let r = switch (store.records.get(id)) {
      case (?r) r;
      case null return #err(#notFound);
    };
    if (not underReview(r, RetryLib.now64())) return #err(#notUnderReview);
    let a = switch (lastAttempt(r)) {
      case (?a) a;
      case null return #err(#notApplicable);
    };
    let text = "Not arrived (admin verification)";
    store.records.add(id, { replaceLast(r, { a with attempt = { a.attempt with outcome = #failed(text); lastError = ?text } }) with status = #payoutFailed; message = ?text });
    #ok;
  };
};
