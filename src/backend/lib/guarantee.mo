import Array "mo:core/Array";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import CreatorFeesLib "creator-fees";
import CyclesReserveLib "cycles-reserve";
import DexLib "dex";
import IcrcLib "icrc";
import OracleLib "oracle";
import PayTokenLib "pay-token";
import RetryLib "retry";
import RouterLib "router";
import SaleLib "presale";
import DexTypes "../types/dex";
import Icrc "../types/icrc";
import Types "../types/guarantee";
import RetryTypes "../types/retry";
import SaleTypes "../types/presale";

// PTM-11 / PTM-11b: common reserve and redemption.
//
// The dedicated per-token internal guarantee accounts (ckUSDC, ckUSDT) of the
// common custody ARE the reserve: 10 000 USD per TTTI-T minted. Any holder,
// minter or not, returns x TTTI-T and is paid min(10 000 USD x x, reserve /
// circulation outside the contract x x), in the reserve tokens in proportion
// to the reserve composition. No fee.
//
// redeem: the wallet-terms acceptance is checked first. Then in ONE
// synchronous block (before the first await) the payouts are reserved in the
// contract's DEX balance, the reserve accounts are debited, the TTTI-T are
// pulled to the dedicated returned account on the own TTTI-T ledger and the
// payouts (memo TTTI-GR-<n>, created_at_time) are recorded. The payouts are
// then sent from the token custody account and resent / renewed with the DEX
// retry rules until they arrive or go to review after 23 h.
module {
  public type Redemption = Types.Redemption;

  // 10 000 USD per TTTI-T, in USD e8 per TTTI-T base unit (1 TTTI-T = 1e8
  // base units = 10 000 USD = 10_000e8 USD e8).
  public let USD_E8_PER_TTTI_UNIT : Nat = 10_000;
  public type GuaranteeContext = {
    // Dedicated internal reserve account per token, in the common custody.
    guaranteeAccount : Types.GuaranteeAccountStore;
    store : Types.RedemptionStore;
    sale : SaleLib.SaleStore;
    ledger : IcrcLib.Ledger;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    dex : RetryLib.DexContext;
    canister : Principal;
    locks : Set.Set<Text>; // transient: redemption locks
    // The creator share bears the ledger fee of a reserve payout.
    creatorFees : CreatorFeesLib.CreatorFeeStore;
    cyclesFees : CyclesReserveLib.CyclesFeeRouting;
    // Wallet-terms acceptances (same store as the mint checks): redemption needs a stored acceptance (any version).
    acknowledgements : SaleTypes.AcknowledgementStore;
  };

  func dexOf(token : Types.PayToken) : Types.DexToken {
    switch (token) {
      case (#icp) #icp;
      case (#ckbtc) #ckbtc;
      case (#ckusdc) #ckusdc;
      case (#ckusdt) #ckusdt;
    };
  };

  func payoutLockKey(id : Types.RedemptionId) : Text {
    "GR/" # id.toText();
  };

  // --- Reserve accounts (one per token, common custody) -------------------------

  // Keys of the account store: "tttiT", "icp", "ckbtc", "ckusdc", "ckusdt".
  public func accountKey(token : Types.DexToken) : Types.TokenKey {
    switch (token) {
      case (#tttiT) "tttiT";
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  public func accountBalance(account : Types.GuaranteeAccountStore, token : Types.DexToken) : Nat {
    account.get(accountKey(token)) ?? 0;
  };

  // The mint and the auction settlement credit the reserve part they create.
  public func creditAccount(account : Types.GuaranteeAccountStore, token : Types.PayToken, amount : Nat) {
    if (amount == 0) return;
    let k = accountKey(dexOf(token));
    account.add(k, (account.get(k) ?? 0) + amount);
  };

  // Redemption debits only this account. False (nothing changed) when it
  // cannot cover the amount.
  public func debitAccount(account : Types.GuaranteeAccountStore, token : Types.PayToken, amount : Nat) : Bool {
    if (amount == 0) return true;
    let k = accountKey(dexOf(token));
    let balance = account.get(k) ?? 0;
    if (balance < amount) return false;
    account.add(k, Nat.sub(balance, amount));
    true;
  };

  // Public: per token, the balance of the dedicated account.
  public func accountViews(account : Types.GuaranteeAccountStore) : [Types.GuaranteeAccountView] {
    DexLib.DEX_TOKENS.map(
      func(token : Types.DexToken) : Types.GuaranteeAccountView {
        { token; accountBalance = accountBalance(account, token) };
      }
    );
  };

  func tttiErrorText(err : Icrc.TransferFromError) : Text {
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

  // --- Reads ------------------------------------------------------------------

  public func redemptionsOf(store : Types.RedemptionStore, owner : Principal) : [Types.Redemption] {
    store.redemptions.values().filter(func(r : Types.Redemption) : Bool = r.owner == owner).toArray().reverse();
  };

  // --- Common reserve -----------------------------------------------------------

  func sat(a : Nat, b : Nat) : Nat = if (a > b) Nat.sub(a, b) else 0;

  // The reserve tokens, in display order. The reserve is held in the token the
  // minter paid in (no conversion) and valued in USD at the oracle rates.
  public let RESERVE_TOKENS : [Types.PayToken] = [#icp, #ckbtc, #ckusdc, #ckusdt];

  func valueUsdE8Of(token : Types.PayToken, amount : Nat, rateUsdE8 : Nat) : Nat {
    amount * rateUsdE8 / (10 ** PayTokenLib.expectedDecimals(token).toNat());
  };

  // TTTI-T minted and held outside the contract: ledger supply minus what the
  // contract holds (returned account, auction lots, unsold remainder). TTTI-T
  // base units.
  public func circulationOutside(ctx : GuaranteeContext) : Nat {
    sat(IcrcLib.totalSupply(ctx.ledger), IcrcLib.balanceOf(ctx.ledger, IcrcLib.returnedAccount(ctx.canister)));
  };

  // The reserve tokens with their balance, usable rate and USD value.
  func reserveLines(ctx : GuaranteeContext, now : Int) : [Types.ReserveTokenLine] {
    RESERVE_TOKENS.map(
      func(token : Types.PayToken) : Types.ReserveTokenLine {
        let balance = accountBalance(ctx.guaranteeAccount, dexOf(token));
        let rate = OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), now);
        let value = switch (rate) {
          case (?r) valueUsdE8Of(token, balance, r);
          case null 0;
        };
        { token; balance; rateUsdE8 = rate; valueUsdE8 = value };
      }
    );
  };

  // Pure: the reserve view from the reserve lines, the circulation outside the
  // contract and the legacy balances.
  public func reserveViewOf(lines : [Types.ReserveTokenLine], circulation : Nat, legacy : [Types.LegacyGuaranteeBalance]) : Types.ReserveView {
    var reserve : Nat = 0;
    for (l in lines.values()) { reserve += l.valueUsdE8 };
    let required = circulation * USD_E8_PER_TTTI_UNIT;
    {
      perToken = lines;
      reserveUsdE8 = reserve;
      circulationOutside = circulation;
      reservePerTtti = if (circulation == 0) null else ?(reserve * 100_000_000 / circulation);
      requiredUsdE8 = required;
      invariantHolds = reserve >= required;
      shortfallUsdE8 = sat(required, reserve);
      legacyPending = legacy;
    };
  };

  // The common reserve: balance of the ICP, ckBTC, ckUSDC and ckUSDT guarantee
  // accounts valued in USD at the stored rates, circulation outside the
  // contract, reserve per TTTI-T, invariant (reserve >= 10 000 USD x
  // circulation) and shortfall. legacyPending is always empty: nothing is
  // converted any more, ICP / ckBTC count in the reserve.
  public func reserveView(ctx : GuaranteeContext, now : Int) : Types.ReserveView {
    reserveViewOf(reserveLines(ctx, now), circulationOutside(ctx), []);
  };

  // --- Quote ------------------------------------------------------------------

  // Pure: amount paid for x TTTI-T. USD = min(10 000 USD x x, reserve USD /
  // circulation x x); split between the reserve tokens in proportion to their
  // USD value, rounded down to the token unit (the dust stays in the reserve).
  public func payoutPlan(lines : [Types.ReserveTokenLine], circulation : Nat, x : Nat) : Result.Result<{ rule : Types.ReserveRedeemRule; parityUsdE8 : Nat; proportionalUsdE8 : Nat; payoutUsdE8 : Nat; reserveUsdE8 : Nat; payouts : [Types.ReservePayoutLine] }, Types.GuaranteeError> {
    if (x == 0) return #err(#amountTooSmall);
    if (x > circulation) return #err(#amountExceedsCirculation({ requested = x; circulation }));
    var reserve : Nat = 0;
    for (l in lines.values()) {
      if (l.balance > 0 and l.rateUsdE8 == null) return #err(#rateUnavailable(l.token));
      reserve += l.valueUsdE8;
    };
    if (reserve == 0) return #err(#reserveEmpty);
    let parity = x * USD_E8_PER_TTTI_UNIT;
    let proportional = reserve * x / circulation;
    let rule : Types.ReserveRedeemRule = if (parity <= proportional) #parity else #reserveShare;
    let payout = Nat.min(parity, proportional);
    let out = List.empty<Types.ReservePayoutLine>();
    for (l in lines.values()) {
      switch (l.rateUsdE8) {
        case (?rate) {
          if (l.valueUsdE8 > 0 and rate > 0) {
            let shareUsd = payout * l.valueUsdE8 / reserve;
            let amount = Nat.min(l.balance, shareUsd * (10 ** PayTokenLib.expectedDecimals(l.token).toNat()) / rate);
            if (amount > 0) {
              out.add({ token = l.token; amount; ledgerFee = PayTokenLib.expectedFee(l.token); valueUsdE8 = valueUsdE8Of(l.token, amount, rate); rateUsdE8 = rate });
            };
          };
        };
        case null {};
      };
    };
    if (out.size() == 0) return #err(#amountTooSmall);
    #ok({ rule; parityUsdE8 = parity; proportionalUsdE8 = proportional; payoutUsdE8 = payout; reserveUsdE8 = reserve; payouts = out.toArray() });
  };

  // Pure preview of redeeming x TTTI-T against the common reserve. Amount in USD = min(10 000 USD x x, reserve USD /
  // circulation outside the contract x x), paid in ckUSDC and ckUSDT in
  // proportion to the reserve composition. No fee. Refused only with
  // #amountExceedsCirculation when x exceeds the circulation outside the
  // contract (also #amountTooSmall, #rateUnavailable, #reserveEmpty).
  public func quote(ctx : GuaranteeContext, x : Nat, now : Int) : Result.Result<Types.RedeemQuote, Types.GuaranteeError> {
    let circulation = circulationOutside(ctx);
    let lines = reserveLines(ctx, now);
    switch (payoutPlan(lines, circulation, x)) {
      case (#err(e)) #err(e);
      case (#ok(p)) {
        let view = reserveViewOf(lines, circulation, []);
        #ok({
          tttiAmount = x;
          rule = p.rule;
          parityUsdE8 = p.parityUsdE8;
          proportionalUsdE8 = p.proportionalUsdE8;
          payoutUsdE8 = p.payoutUsdE8;
          reserveUsdE8 = p.reserveUsdE8;
          reservePerTtti = view.reservePerTtti;
          circulationOutside = circulation;
          payouts = p.payouts;
          tttiTransferFee = IcrcLib.FIXED_FEE;
          tttiAllowanceRequired = x + IcrcLib.FIXED_FEE;
        });
      };
    };
  };

  // --- Recording and payout -----------------------------------------------------

  type Open = {
    owner : Principal;
    token : Types.PayToken;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    rate : ?Nat;
    third : Nat;
    net : Nat;
  };

  // Synchronous: opens the GR payout attempt (memo, created_at_time) and records
  // the redemption. The payout amount (net + third) is already reserved by the
  // caller.
  func record(ctx : GuaranteeContext, o : Open, now : Int) : Types.Redemption {
    let account : Types.Account = { owner = o.owner; subaccount = null };
    let request : RetryTypes.DexTransferRequest = {
      token = dexOf(o.token);
      from = DexLib.custodyAccount(ctx.canister, dexOf(o.token));
      to = account;
      amount = o.net;
      fee = ?o.third;
    };
    let attempt = RetryLib.newDexAttempt(ctx.dex.retry, #GR, null, request, RetryLib.dexNow());
    let r : Types.Redemption = {
      id = attempt.n;
      owner = o.owner;
      account;
      token = o.token;
      tttiAmount = o.tttiAmount;
      tttiPullBlock = o.pullBlock;
      rateUsdE8 = o.rate;
      thirdPartyFee = o.third;
      netAmount = o.net;
      createdAt = now;
      payout = attempt;
      status = #inProgress;
    };
    ctx.store.redemptions.add(r.id, r);
    r;
  };

  func reservedAmount(r : Types.Redemption) : Nat {
    r.payout.request.amount + (r.payout.request.fee ?? 0);
  };

  // Sends the current payout attempt of redemption `id` (the caller holds its
  // payout lock) and applies the classified outcome. Counts the send before
  // the await.
  func sendPayout(ctx : GuaranteeContext, id : Types.RedemptionId) : async Types.Redemption {
    let r = switch (ctx.store.redemptions.get(id)) {
      case (?r) r;
      case null Runtime.trap("Unknown redemption");
    };
    if (r.status != #inProgress) return r;
    let sending = { r.payout with sends = r.payout.sends + 1 };
    ctx.store.redemptions.add(id, { r with payout = sending });
    let done = await RetryLib.sendPayDexAttempt(sending);
    let cur = switch (ctx.store.redemptions.get(id)) {
      case (?c) c;
      case null return r;
    };
    if (cur.status != #inProgress or cur.payout.attempt != sending.attempt) return cur;
    let updated = switch (done.outcome) {
      case (#succeeded(block)) {
        DexLib.settleReserved(ctx.dex.balances, ctx.canister, dexOf(cur.token), reservedAmount(cur));
        { cur with payout = done; status = #completed(block) };
      };
      case (_) { { cur with payout = done } };
    };
    ctx.store.redemptions.add(id, updated);
    updated;
  };

  // --- Redeem ---------------------------------------------------------------------

  // Pure: #acknowledgementRequired unless the caller has a stored acceptance of
  // the wallet terms (any version).
  public func acknowledgementError(store : SaleTypes.AcknowledgementStore, caller : Principal) : ?Types.GuaranteeError {
    if (SaleLib.hasAccepted(store, caller)) null else ?#acknowledgementRequired;
  };

  func redeemLockKey(caller : Principal) : Text {
    "GR-CALLER/" # caller.toText();
  };

  // Where the ledger fee of a reserve payout comes from. The creator
  // share first; otherwise the contract balance outside the reserve
  // (`surplus`); #none only when neither covers it. Never the holder's amount.
  public func ledgerFeeSource(creatorHeld : Nat, surplus : Nat, fee : Nat) : { #creator; #surplus; #none } {
    if (creatorHeld >= fee) #creator else if (surplus >= fee) #surplus else #none;
  };

  // Returns x TTTI-T of any holder to the contract and pays the
  // quoted amount from the common reserve, one payout (Redemption) per reserve
  // token, ledger fees borne by the creator share. Everything up to the payout
  // records is synchronous (one message): reserve the payouts, debit the
  // reserve accounts, pull the TTTI-T on the own ledger, record the payouts.
  // Refused with #slippage when the payout is lower than expectedPayoutUsdE8.
  public func redeem(ctx : GuaranteeContext, caller : Principal, x : Nat, expectedPayoutUsdE8 : Nat) : async Result.Result<[Types.Redemption], Types.GuaranteeError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    switch (acknowledgementError(ctx.acknowledgements, caller)) {
      case (?e) return #err(e);
      case null {};
    };
    if (ctx.sale.salesPaused) return #err(#salesPaused);
    let lk = redeemLockKey(caller);
    if (not RetryLib.tryLock(ctx.locks, lk)) return #err(#redemptionInProgress);
    let payKeys = List.empty<Text>();
    try {
      let now = Time.now();
      let q = switch (quote(ctx, x, now)) {
        case (#ok(q)) q;
        case (#err(e)) return #err(e);
      };
      if (q.payoutUsdE8 < expectedPayoutUsdE8) {
        return #err(#slippage({ expectedPayoutUsdE8; payoutUsdE8 = q.payoutUsdE8 }));
      };
      // Every check that can refuse comes before the TTTI-T pull.
      for (line in q.payouts.values()) {
        let t = dexOf(line.token);
        let balance = accountBalance(ctx.guaranteeAccount, t);
        let avail = DexLib.available(ctx.dex.balances, ctx.canister, t);
        if (balance < line.amount or avail < line.amount) {
          return #err(#callFailed("The reserve held by the contract does not cover the payout"));
        };
        if (ledgerFeeSource(CreatorFeesLib.held(ctx.creatorFees, t), sat(avail, balance), line.ledgerFee) == #none) {
          return #err(#ledgerFeeNotCovered({ token = line.token; fee = line.ledgerFee }));
        };
      };
      let fee = IcrcLib.FIXED_FEE;
      let block = switch (
        IcrcLib.transferFrom(
          ctx.ledger,
          ctx.canister,
          ctx.canister,
          {
            spender_subaccount = null;
            from = { owner = caller; subaccount = null };
            to = IcrcLib.returnedAccount(ctx.canister);
            amount = x;
            fee = ?fee;
            memo = null;
            created_at_time = null;
          },
        )
      ) {
        case (#Ok(b)) b;
        case (#Err(#InsufficientFunds({ balance }))) return #err(#tttiBalanceInsufficient({ balance; required = x + fee }));
        case (#Err(#InsufficientAllowance({ allowance }))) return #err(#allowanceInsufficient({ allowance; required = x + fee }));
        case (#Err(e)) return #err(#pullFailed(tttiErrorText(e)));
      };
      let recs = List.empty<Types.Redemption>();
      var first = true;
      for (line in q.payouts.values()) {
        let t = dexOf(line.token);
        // The ledger fee moves from the creator share to the contract balance,
        // then is reserved with the payout. When the creator share cannot
        // cover it, the fee comes from the contract balance held outside the
        // reserve (already in the balance, nothing to credit).
        if (CreatorFeesLib.bearLedgerFee(ctx.creatorFees, t, line.ledgerFee)) {
          DexLib.credit(ctx.dex.balances, ctx.canister, t, line.ledgerFee);
        };
        ignore DexLib.reserve(ctx.dex.balances, ctx.canister, t, line.amount + line.ledgerFee);
        ignore debitAccount(ctx.guaranteeAccount, line.token, line.amount);
        recs.add(record(ctx, {
          owner = caller;
          token = line.token;
          tttiAmount = if (first) x else 0;
          pullBlock = ?block;
          rate = ?line.rateUsdE8;
          third = line.ledgerFee;
          net = line.amount;
        }, now));
        first := false;
      };
      let out = List.empty<Types.Redemption>();
      for (r in recs.values()) {
        let k = payoutLockKey(r.id);
        if (RetryLib.tryLock(ctx.locks, k)) {
          payKeys.add(k);
          out.add(await sendPayout(ctx, r.id));
        } else {
          out.add(r);
        };
      };
      #ok(out.toArray());
    } finally {
      RetryLib.unlock(ctx.locks, lk);
      for (k in payKeys.values()) { RetryLib.unlock(ctx.locks, k) };
    };
  };

  // PTM-11: the reserve is held in the paid token (ICP, ckBTC, ckUSDC, ckUSDT)
  // and valued in USD, so there is no legacy conversion any more. Kept so that
  // the public interface stays compatible: it moves nothing and always answers
  // #nothingToConvert. Guarantees already converted to ckUSDC stay as they are.
  public func convertLegacy(_ctx : GuaranteeContext, _router : RouterLib.RouterContext, _usdRateOf : DexLib.UsdRateOf) : async Result.Result<[Types.LegacyConversion], Types.GuaranteeError> {
    #err(#nothingToConvert);
  };

  // --- Retry timer -------------------------------------------------------------------

  // Resends / renews the payouts still in progress; the same memo and
  // created_at_time are resent for 23 h, then the payout goes to review. Does
  // nothing while sales are paused.
  public func runRetries(ctx : GuaranteeContext) : async () {
    if (ctx.sale.salesPaused) return;
    let now = RetryLib.dexNow();
    let ids = ctx.store.redemptions.values().filter(func(r : Types.Redemption) : Bool = r.status == #inProgress).map(func(r : Types.Redemption) : Types.RedemptionId = r.id).toArray();
    for (id in ids.values()) {
      let key = payoutLockKey(id);
      if (RetryLib.tryLock(ctx.locks, key)) {
        try {
          switch (ctx.store.redemptions.get(id)) {
            case (?r) {
              if (r.status == #inProgress) {
                switch (RetryLib.dexAction(r.payout, now)) {
                  case (#resend) { ignore await sendPayout(ctx, id) };
                  case (#newAttempt) {
                    let next = RetryLib.newDexAttempt(ctx.dex.retry, #GR, ?r.payout, r.payout.request, now);
                    ctx.store.redemptions.add(id, { r with payout = next });
                    ignore await sendPayout(ctx, id);
                  };
                  case (#needsReview) {
                    ctx.store.redemptions.add(id, { r with status = #needsReview });
                  };
                  case (#done) {};
                };
              };
            };
            case null {};
          };
        } catch (_) {} finally {
          RetryLib.unlock(ctx.locks, key);
        };
      };
    };
  };

  public func startTimer<system>(ctx : GuaranteeContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(RetryLib.TIMER_INTERVAL_SECONDS),
      func() : async () { await runRetries(ctx) },
    );
  };

  // --- Admin review (#GR) ----------------------------------------------------------------

  // Admin "To review" rows (#GR, purchaseId = redemption id): redemption payouts
  // whose outcome is unknown after 23 h.
  public func reviewRows(store : Types.RedemptionStore) : [RetryTypes.TransferReview] {
    store.redemptions.values().filter(func(r : Types.Redemption) : Bool = r.status == #needsReview).map(
      func(r : Types.Redemption) : RetryTypes.TransferReview = RetryLib.dexReview(#GR, r.id, r.owner, r.payout)
    ).toArray();
  };

  // Admin: the payout under review arrived in `block`: #completed, the reserved
  // payout is settled.
  public func markArrived(store : Types.RedemptionStore, balances : DexTypes.DexBalances, canister : Principal, id : Types.RedemptionId, block : Nat) : RetryTypes.ReviewResult {
    let r = switch (store.redemptions.get(id)) {
      case (?r) r;
      case null return #err(#notFound);
    };
    if (r.status != #needsReview) return #err(#notUnderReview);
    DexLib.settleReserved(balances, canister, dexOf(r.token), reservedAmount(r));
    store.redemptions.add(id, { r with status = #completed(block); payout = { r.payout with outcome = #succeeded(block) } });
    #ok(());
  };

  // Admin: the payout under review did not arrive: the attempt is marked
  // failed, the redemption is back in progress and the timer opens a new
  // attempt (new memo suffix and created_at_time).
  public func markNotArrived(store : Types.RedemptionStore, id : Types.RedemptionId) : RetryTypes.ReviewResult {
    let r = switch (store.redemptions.get(id)) {
      case (?r) r;
      case null return #err(#notFound);
    };
    if (r.status != #needsReview) return #err(#notUnderReview);
    let text = "Marked as not arrived by an administrator";
    store.redemptions.add(id, { r with status = #inProgress; payout = { r.payout with outcome = #failed(text); lastError = ?text } });
    #ok(());
  };
};
