import Array "mo:core/Array";
import Map "mo:core/Map";
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
import SaleLib "presale";
import DexTypes "../types/dex";
import Icrc "../types/icrc";
import Types "../types/guarantee";
import RetryTypes "../types/retry";

// PTM-2: personal guarantee and redemption.
//
// Each minter has one mass per payment token (TTTI-T minted and the matching
// guarantee), built by the liquidity mint in the same synchronous block that
// records the Guarantee. The right to redeem belongs to the person: any TTTI-T
// she holds permits redeeming up to her remaining mass.
//
// redeem: in ONE synchronous block (before the first await) the guarantee
// payout is reserved in the contract's DEX balance, the TTTI-T are pulled to
// the dedicated returned account on the own TTTI-T ledger, the mass is
// updated and the payout (memo TTTI-GR-<n>, created_at_time) is recorded.
// The payout is then sent from the token custody account and resent / renewed
// with the DEX retry rules until it arrives or goes to review after 23 h.
module {
  public type GuaranteeMass = Types.GuaranteeMass;
  public type Redemption = Types.Redemption;

  // 10 000 USD per TTTI-T, in USD e8 per TTTI-T base unit (1 TTTI-T = 1e8
  // base units = 10 000 USD = 10_000e8 USD e8).
  public let USD_E8_PER_TTTI_UNIT : Nat = 10_000;
  // Redemption fee: 1 % of the redeemed amount. PTM-4: the ICP part fills the
  // cycles reserve first (up to one year of measured consumption), the rest
  // is credited to the creator holdings (source #buybackFee).
  public let REDEMPTION_FEE_BPS : Nat = 100;

  public type GuaranteeContext = {
    masses : Types.GuaranteeMassStore;
    // PTM-9b: dedicated internal guarantee account per token, in the common custody.
    guaranteeAccount : Types.GuaranteeAccountStore;
    store : Types.RedemptionStore;
    sale : SaleLib.SaleStore;
    ledger : IcrcLib.Ledger;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    dex : RetryLib.DexContext;
    canister : Principal;
    locks : Set.Set<Text>; // transient: redemption locks
    // PTM-4: where the 1 % redemption fee goes (the cycles reserve first, then the creator).
    creatorFees : CreatorFeesLib.CreatorFeeStore;
    cyclesFees : CyclesReserveLib.CyclesFeeRouting;
  };

  public func tokenKey(token : Types.PayToken) : Types.TokenKey {
    switch (token) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  func dexOf(token : Types.PayToken) : Types.DexToken {
    switch (token) {
      case (#icp) #icp;
      case (#ckbtc) #ckbtc;
      case (#ckusdc) #ckusdc;
      case (#ckusdt) #ckusdt;
    };
  };

  // Transient lock key of one mass: owner principal and mass token.
  public func lockKey(owner : Principal, token : Types.PayToken) : Text {
    "GM/" # owner.toText() # "/" # tokenKey(token);
  };

  func payoutLockKey(id : Types.RedemptionId) : Text {
    "GR/" # id.toText();
  };

  // Token quantity worth 10 000 USD x tttiAmount at `rateUsdE8` (USD e8 per
  // whole token). 0 when the rate is 0.
  public func dayRateQuantity(token : Types.PayToken, tttiAmount : Nat, rateUsdE8 : Nat) : Nat {
    if (rateUsdE8 == 0) return 0;
    let scale = 10 ** PayTokenLib.expectedDecimals(token).toNat();
    tttiAmount * USD_E8_PER_TTTI_UNIT * scale / rateUsdE8;
  };

  // PTM-9b: the mint has ended when what remains to mint is below the minimum
  // of one mint. That remainder joins the first auction lot.
  public func mintEnded(ledger : IcrcLib.Ledger, sale : SaleLib.SaleStore, canister : Principal) : Bool {
    ignore (sale, canister);
    IcrcLib.mintableRemaining(ledger) < SaleLib.MIN_PURCHASE;
  };

  // --- PTM-9b: dedicated guarantee account (one per token, common custody) -----

  // Keys of the account store and of the masses: "tttiT", "icp", "ckbtc", "ckusdc", "ckusdt".
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

  // The mint and the auction settlement credit the guarantee they create.
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

  // Public: per token, the sum of every mass (remaining guarantee + excess)
  // against the balance of the dedicated account.
  public func accountViews(masses : Types.GuaranteeMassStore, account : Types.GuaranteeAccountStore) : [Types.GuaranteeAccountView] {
    DexLib.DEX_TOKENS.map(
      func(token : Types.DexToken) : Types.GuaranteeAccountView {
        var total : Nat = 0;
        for (perOwner in masses.values()) {
          switch (perOwner.get(accountKey(token))) {
            case (?m) { total += m.remainingGuarantee + m.excess };
            case null {};
          };
        };
        let balance = accountBalance(account, token);
        { token; massTotal = total; accountBalance = balance; equal = total == balance };
      }
    );
  };

  public func massOf(masses : Types.GuaranteeMassStore, owner : Principal, token : Types.PayToken) : ?Types.GuaranteeMass {
    switch (masses.get(owner)) {
      case (?perOwner) perOwner.get(tokenKey(token));
      case null null;
    };
  };

  public func setMass(masses : Types.GuaranteeMassStore, owner : Principal, mass : Types.GuaranteeMass) {
    let perOwner = switch (masses.get(owner)) {
      case (?m) m;
      case null {
        let fresh : Map.Map<Types.TokenKey, Types.GuaranteeMass> = Map.empty();
        masses.add(owner, fresh);
        fresh;
      };
    };
    perOwner.add(tokenKey(mass.token), mass);
  };

  // Called by the liquidity mint, in the same synchronous block that records
  // the Guarantee: adds the minted TTTI-T and the guarantee to the owner's mass.
  public func addMass(masses : Types.GuaranteeMassStore, owner : Principal, token : Types.PayToken, ttti : Nat, guarantee : Nat) {
    let base : Types.GuaranteeMass = switch (massOf(masses, owner, token)) {
      case (?m) m;
      case null {
        { token; totalTtti = 0; totalGuarantee = 0; remainingTtti = 0; remainingGuarantee = 0; excess = 0 };
      };
    };
    setMass(masses, owner, {
      base with
      totalTtti = base.totalTtti + ttti;
      totalGuarantee = base.totalGuarantee + guarantee;
      remainingTtti = base.remainingTtti + ttti;
      remainingGuarantee = base.remainingGuarantee + guarantee;
    });
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

  public func massViews(ctx : GuaranteeContext, owner : Principal, now : Int) : [Types.GuaranteeMassView] {
    let ended = mintEnded(ctx.ledger, ctx.sale, ctx.canister);
    switch (ctx.masses.get(owner)) {
      case null [];
      case (?perOwner) {
        perOwner.values().map(
          func(m : Types.GuaranteeMass) : Types.GuaranteeMassView {
            let value = m.remainingGuarantee + m.excess;
            let rate = OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, m.token), now);
            let usd = switch (rate) {
              case (?r) ?(value * r / (10 ** PayTokenLib.expectedDecimals(m.token).toNat()));
              case null null;
            };
            {
              token = m.token;
              totalTtti = m.totalTtti;
              totalGuarantee = m.totalGuarantee;
              remainingTtti = m.remainingTtti;
              remainingGuarantee = m.remainingGuarantee;
              excess = m.excess;
              withdrawableExcess = if (ended) m.excess else 0;
              guaranteeValue = value;
              rateUsdE8 = rate;
              guaranteeValueUsdE8 = usd;
              mintEnded = ended;
            };
          }
        ).toArray();
      };
    };
  };

  public func unclaimedTotal(ctx : GuaranteeContext) : Types.UnclaimedMassTotal {
    var ttti : Nat = 0;
    var count : Nat = 0;
    let perToken = PayTokenLib.ALL.map(
      func(token : Types.PayToken) : Types.TokenGuaranteeTotal {
        var t : Nat = 0;
        var g : Nat = 0;
        var e : Nat = 0;
        for (perOwner in ctx.masses.values()) {
          switch (perOwner.get(tokenKey(token))) {
            case (?m) {
              t += m.remainingTtti;
              g += m.remainingGuarantee;
              e += m.excess;
            };
            case null {};
          };
        };
        { token; remainingTtti = t; remainingGuarantee = g; excess = e };
      },
    );
    for (perOwner in ctx.masses.values()) {
      for (m in perOwner.values()) {
        ttti += m.remainingTtti;
        if (m.remainingTtti > 0 or m.remainingGuarantee > 0 or m.excess > 0) count += 1;
      };
    };
    { remainingTtti = ttti; massCount = count; perToken; mintEnded = mintEnded(ctx.ledger, ctx.sale, ctx.canister) };
  };

  public func redemptionsOf(store : Types.RedemptionStore, owner : Principal) : [Types.Redemption] {
    store.redemptions.values().filter(func(r : Types.Redemption) : Bool = r.owner == owner).toArray().reverse();
  };

  public func listFees(store : Types.RedemptionStore, offset : Nat, limit : Nat) : [Types.RedemptionFee] {
    let all = store.fees.values().toArray();
    if (offset >= all.size()) return [];
    all.sliceToArray(offset, Nat.min(all.size(), offset + limit));
  };

  // --- Quote ------------------------------------------------------------------

  type Basis = {
    phase : Types.RedeemPhase;
    rule : Types.RedeemRule;
    dayQuantity : ?Nat;
    rate : ?Nat;
    returned : Nat;
  };

  // Pure preview of redeeming x of `owner`'s mass in `token`. Reads the stored
  // rate only; refuses with #rateUnavailable during the mint when it is absent
  // or expired.
  public func quote(ctx : GuaranteeContext, owner : Principal, token : Types.PayToken, x : Nat, now : Int) : Result.Result<Types.RedeemQuote, Types.GuaranteeError> {
    if (owner.isAnonymous()) return #err(#anonymous);
    let mass = switch (massOf(ctx.masses, owner, token)) {
      case (?m) m;
      case null return #err(#massNotFound);
    };
    if (mass.remainingTtti == 0) return #err(#nothingRemaining);
    if (x == 0) return #err(#amountTooSmall);
    if (x > mass.remainingTtti) return #err(#amountExceedsMass({ requested = x; remaining = mass.remainingTtti }));
    let deposited = mass.remainingGuarantee * x / mass.remainingTtti;
    let basis : Basis = if (mintEnded(ctx.ledger, ctx.sale, ctx.canister)) {
      { phase = #afterMint; rule = #proRata; dayQuantity = null; rate = null; returned = deposited };
    } else {
      switch (OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), now)) {
        case null return #err(#rateUnavailable(token));
        case (?r) {
          let q = dayRateQuantity(token, x, r);
          if (deposited <= q) {
            { phase = #duringMint; rule = #depositedGuarantee; dayQuantity = ?q; rate = ?r; returned = deposited };
          } else {
            { phase = #duringMint; rule = #dayRate; dayQuantity = ?q; rate = ?r; returned = q };
          };
        };
      };
    };
    let fee = basis.returned * REDEMPTION_FEE_BPS / 10_000;
    let third = PayTokenLib.expectedFee(token);
    if (basis.returned <= fee + third) return #err(#amountTooSmall);
    let tttiFee = IcrcLib.fee(ctx.ledger);
    #ok({
      token;
      tttiAmount = x;
      phase = basis.phase;
      rule = basis.rule;
      depositedGuarantee = deposited;
      dayRateQuantity = basis.dayQuantity;
      rateUsdE8 = basis.rate;
      returnedAmount = basis.returned;
      excessKept = Nat.sub(deposited, basis.returned);
      redemptionFee = fee;
      thirdPartyFee = third;
      netAmount = Nat.sub(basis.returned, fee + third);
      tttiTransferFee = tttiFee;
      tttiAllowanceRequired = x + tttiFee;
    });
  };

  // --- Recording and payout -----------------------------------------------------

  type Open = {
    owner : Principal;
    token : Types.PayToken;
    kind : Types.RedemptionKind;
    phase : Types.RedeemPhase;
    rule : Types.RedeemRule;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    deposited : Nat;
    rate : ?Nat;
    returned : Nat;
    excessKept : Nat;
    fee : Nat;
    third : Nat;
    net : Nat;
  };

  // Synchronous: opens the GR payout attempt (memo, created_at_time), records
  // the redemption and its fee. The payout amount (net + third) is already
  // reserved by the caller.
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
      kind = o.kind;
      token = o.token;
      phase = o.phase;
      rule = o.rule;
      tttiAmount = o.tttiAmount;
      tttiPullBlock = o.pullBlock;
      depositedGuarantee = o.deposited;
      rateUsdE8 = o.rate;
      returnedAmount = o.returned;
      excessKept = o.excessKept;
      redemptionFee = o.fee;
      thirdPartyFee = o.third;
      netAmount = o.net;
      createdAt = now;
      payout = attempt;
      status = #inProgress;
    };
    ctx.store.redemptions.add(r.id, r);
    if (o.fee > 0) {
      ctx.store.fees.add(r.id, { redemptionId = r.id; token = o.token; amount = o.fee; createdAt = now });
      splitFee(ctx, r.id, o.token, o.fee, now);
    };
    r;
  };

  // PTM-4, synchronous (no await, no new way to fail): splits the fee already
  // sitting in the contract's DEX balance. The creator part moves to the
  // creator holdings; the cycles part stays in the ICP balance as a pending
  // share sent later by the settlement. If the balance cannot give the
  // creator part, nothing is moved and the fee keeps its previous meaning.
  func splitFee(ctx : GuaranteeContext, id : Types.RedemptionId, token : Types.PayToken, fee : Nat, now : Int) {
    let split = CyclesReserveLib.planFeeSplit(ctx.cyclesFees, token == #icp, fee, now);
    if (not DexLib.debit(ctx.dex.balances, ctx.canister, dexOf(token), split.creator)) return;
    CyclesReserveLib.recordCyclesShare(ctx.cyclesFees.fees, split.cyclesE8s);
    CreatorFeesLib.credit(ctx.creatorFees, dexOf(token), split.creator, #buybackFee, now);
    ctx.cyclesFees.fees.buybackSplits.add(id, split);
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

  // Returns x TTTI-T of the caller's mass in `token`. Everything up to the
  // payout record is synchronous (one message): reserve the guarantee payout,
  // pull the TTTI-T on the own ledger, update the mass, record the payout.
  public func redeem(ctx : GuaranteeContext, caller : Principal, token : Types.PayToken, x : Nat, expectedNet : Nat) : async Result.Result<Types.Redemption, Types.GuaranteeError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    if (ctx.sale.salesPaused) return #err(#salesPaused);
    let lk = lockKey(caller, token);
    if (not RetryLib.tryLock(ctx.locks, lk)) return #err(#redemptionInProgress);
    var payKey : ?Text = null;
    try {
      let now = Time.now();
      let q = switch (quote(ctx, caller, token, x, now)) {
        case (#ok(q)) q;
        case (#err(e)) return #err(e);
      };
      if (q.netAmount < expectedNet) {
        return #err(#slippage({ expectedNetAmount = expectedNet; netAmount = q.netAmount }));
      };
      let account : Types.Account = { owner = caller; subaccount = null };
      let balance = IcrcLib.balanceOf(ctx.ledger, account);
      if (balance < q.tttiAllowanceRequired) {
        return #err(#tttiBalanceInsufficient({ balance; required = q.tttiAllowanceRequired }));
      };
      let allowance = IcrcLib.allowance(ctx.ledger, { account; spender = { owner = ctx.canister; subaccount = null } }).allowance;
      if (allowance < q.tttiAllowanceRequired) {
        return #err(#allowanceInsufficient({ allowance; required = q.tttiAllowanceRequired }));
      };
      let mass = switch (massOf(ctx.masses, caller, token)) {
        case (?m) m;
        case null return #err(#massNotFound);
      };
      // Reserve the payout first (reversible); the pull comes next.
      let payoutDebit = q.netAmount + q.thirdPartyFee;
      // PTM-9b: the redemption is paid out of the dedicated guarantee account only.
      if (accountBalance(ctx.guaranteeAccount, dexOf(token)) < q.returnedAmount) {
        return #err(#callFailed("The guarantee account does not cover the redemption"));
      };
      if (not DexLib.reserve(ctx.dex.balances, ctx.canister, dexOf(token), payoutDebit)) {
        return #err(#callFailed("The guarantee balance held by the contract does not cover the payout"));
      };
      let block = switch (IcrcLib.transferFrom(ctx.ledger, ctx.canister, ctx.canister, {
        spender_subaccount = null;
        from = account;
        to = IcrcLib.returnedAccount(ctx.canister);
        amount = x;
        fee = ?q.tttiTransferFee;
        memo = null;
        created_at_time = null;
      })) {
        case (#Ok(b)) b;
        case (#Err(e)) {
          DexLib.release(ctx.dex.balances, ctx.canister, dexOf(token), payoutDebit);
          return #err(#pullFailed(tttiErrorText(e)));
        };
      };
      ignore debitAccount(ctx.guaranteeAccount, token, q.returnedAmount);
      ignore CreatorFeesLib.collectTransferFees(ctx.creatorFees, ctx.ledger, ctx.canister, now);
      setMass(ctx.masses, caller, {
        mass with
        remainingTtti = Nat.sub(mass.remainingTtti, x);
        remainingGuarantee = Nat.sub(mass.remainingGuarantee, q.depositedGuarantee);
        excess = mass.excess + q.excessKept;
      });
      let r = record(ctx, {
        owner = caller;
        token;
        kind = #redeem;
        phase = q.phase;
        rule = q.rule;
        tttiAmount = x;
        pullBlock = ?block;
        deposited = q.depositedGuarantee;
        rate = q.rateUsdE8;
        returned = q.returnedAmount;
        excessKept = q.excessKept;
        fee = q.redemptionFee;
        third = q.thirdPartyFee;
        net = q.netAmount;
      }, now);
      let k = payoutLockKey(r.id);
      ignore RetryLib.tryLock(ctx.locks, k);
      payKey := ?k;
      #ok(await sendPayout(ctx, r.id));
    } finally {
      RetryLib.unlock(ctx.locks, lk);
      switch (payKey) {
        case (?k) RetryLib.unlock(ctx.locks, k);
        case null {};
      };
    };
  };

  // Pays the caller's excess in `token`, once the mint has ended.
  public func withdrawExcess(ctx : GuaranteeContext, caller : Principal, token : Types.PayToken) : async Result.Result<Types.Redemption, Types.GuaranteeError> {
    if (caller.isAnonymous()) return #err(#anonymous);
    if (ctx.sale.salesPaused) return #err(#salesPaused);
    let lk = lockKey(caller, token);
    if (not RetryLib.tryLock(ctx.locks, lk)) return #err(#redemptionInProgress);
    var payKey : ?Text = null;
    try {
      let mass = switch (massOf(ctx.masses, caller, token)) {
        case (?m) m;
        case null return #err(#massNotFound);
      };
      if (mass.excess == 0) return #err(#noExcess);
      if (not mintEnded(ctx.ledger, ctx.sale, ctx.canister)) return #err(#mintNotEnded);
      let third = PayTokenLib.expectedFee(token);
      if (mass.excess <= third) return #err(#amountTooSmall);
      let net = Nat.sub(mass.excess, third);
      if (accountBalance(ctx.guaranteeAccount, dexOf(token)) < mass.excess) {
        return #err(#callFailed("The guarantee account does not cover the withdrawal"));
      };
      if (not DexLib.reserve(ctx.dex.balances, ctx.canister, dexOf(token), mass.excess)) {
        return #err(#callFailed("The guarantee balance held by the contract does not cover the payout"));
      };
      ignore debitAccount(ctx.guaranteeAccount, token, mass.excess);
      setMass(ctx.masses, caller, { mass with excess = 0 });
      let r = record(ctx, {
        owner = caller;
        token;
        kind = #excessWithdrawal;
        phase = #afterMint;
        rule = #depositedGuarantee;
        tttiAmount = 0;
        pullBlock = null;
        deposited = mass.excess;
        rate = null;
        returned = mass.excess;
        excessKept = 0;
        fee = 0;
        third;
        net;
      }, Time.now());
      let k = payoutLockKey(r.id);
      ignore RetryLib.tryLock(ctx.locks, k);
      payKey := ?k;
      #ok(await sendPayout(ctx, r.id));
    } finally {
      RetryLib.unlock(ctx.locks, lk);
      switch (payKey) {
        case (?k) RetryLib.unlock(ctx.locks, k);
        case null {};
      };
    };
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
