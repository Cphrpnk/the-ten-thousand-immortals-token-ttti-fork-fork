import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import CreatorFeesLib "creator-fees";
import CyclesReserveLib "cycles-reserve";
import DexLib "dex";
import GuaranteeLib "guarantee";
import GuaranteeTypes "../types/guarantee";
import IcrcLib "icrc";
import OracleLib "oracle";
import PayTokenLib "pay-token";
import RetryLib "retry";
import SaleLib "presale";
import SaleTypes "../types/presale";
import DexTypes "../types/dex";
import Treasury "../types/treasury";
import Types "../types/liquidity-mint";

// PTM-1 liquidity-forming mint.
//
// Flow of `mint`: validate everything (no funds moved) -> collect the payment
// into the payer's internal DEX balance with the DD retry rules (ICRC-2
// transfer_from, memo, created_at_time) -> in ONE synchronous block: mint
// exactly q TTTI-T into the TTTI-T DEX custody, balance the pair by swapping
// the surplus side in the same pool, deposit the rest at the pool ratio, hand
// the position to its owner, keep the guarantee and the creator set-aside in
// the paid token inside the contract's DEX custody. Any failure before TTTI-T
// is minted refunds the payment through the DW retry rules.
module {
  public type MintContext = {
    store : Types.LiquidityMintStore;
    masses : GuaranteeTypes.GuaranteeMassStore; // PTM-2 personal masses
    guaranteeAccount : GuaranteeTypes.GuaranteeAccountStore; // PTM-9b: dedicated guarantee account per token
    sale : SaleLib.SaleStore;
    ledger : IcrcLib.Ledger;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    acknowledgements : SaleTypes.AcknowledgementStore;
    dex : RetryLib.DexContext;
    transfers : RetryLib.TransferContext;
    canister : Principal;
    // PTM-4: where the 1 % creator set-aside goes (the cycles reserve first, then the creator).
    creatorFees : CreatorFeesLib.CreatorFeeStore;
    cyclesFees : CyclesReserveLib.CyclesFeeRouting;
    // Isolated self-call of the mint core (`liquidityMintCore`, reserved to the canister).
    isolated : CoreArgs -> async Types.LiquidityMintResult;
    // Take time of the transient locks (self-releasing after LOCK_TTL_NS).
    lockTimes : Map.Map<Text, Int>;
  };

  type Err = Types.LiquidityMintError;
  type DexToken = DexTypes.DexToken;
  type PayToken = Types.PayToken;

  // Price of one TTTI-T: 10 000 USD, the same for everyone.
  public let TOKEN_PRICE_USD : Nat = 10_000;
  // Minimum mint 0.0001 TTTI-T (8-decimal base units) = 1 USD at the 10 000 USD
  // price. Never refused because the target pool is below the swap threshold.
  public let MIN_MINT_TTTI : Nat = 10_000;
  // Finest granularity 0.00000001 TTTI-T = 1 base unit.
  public let GRANULARITY_TTTI : Nat = 1;
  public let MAX_DECIMALS : Nat = 8;
  // Total cap 1 TTTI-T in base units.
  public let CAP_TTTI : Nat = 100_000_000;
  // Creator set-aside: 1 % of the amount paid (100 bps). PTM-4: the ICP part
  // fills the cycles reserve first (up to one year of measured consumption),
  // the rest is credited to the creator holdings (source #mintFee).
  public let CREATOR_BPS : Nat = 100;

  let DEFAULT_SLIPPAGE_BPS : Nat = 50;
  let BPS : Nat = 10_000;
  let SWAP_DEADLINE_NS : Int = 60_000_000_000;

  func dexOf(token : PayToken) : DexToken {
    switch (token) {
      case (#icp) #icp;
      case (#ckbtc) #ckbtc;
      case (#ckusdc) #ckusdc;
      case (#ckusdt) #ckusdt;
    };
  };

  func ceilDiv(a : Nat, b : Nat) : Nat {
    if (b == 0) 0 else (a + b - 1) / b;
  };

  func pow10(d : Nat8) : Nat = 10 ** d.toNat();

  func rateOf(ctx : MintContext) : DexLib.UsdRateOf {
    func(token : DexTypes.PoolToken) : ?Nat {
      switch (DexLib.poolDexToken(token)) {
        case (?#tttiT) null;
        case (?t) {
          switch (RetryLib.dexPayToken(t)) {
            case (?pay) OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, pay), Time.now());
            case null null;
          };
        };
        case null null;
      };
    };
  };

  // --- Amounts ---------------------------------------------------------------

  public type Prepared = {
    token : PayToken;
    q : Nat;
    rateUsdE8 : Nat;
    validUntil : Int;
    payAmount : Nat;
    payUsdE8 : Nat;
    positionToken : Nat;
    guarantee : Nat;
    creator : Nat;
    dust : Nat;
    ledgerFee : Nat;
  };

  func parseDecimal(t : Text) : Result.Result<Nat, Err> {
    let parts = t.split(#char '.').toArray();
    if (parts.size() == 0 or parts.size() > 2) return #err(#invalidAmount);
    let whole = parts[0];
    let frac = if (parts.size() == 2) parts[1] else "";
    if (whole == "" and frac == "") return #err(#invalidAmount);
    for (c in whole.chars()) { if (not c.isDigit()) return #err(#invalidAmount) };
    for (c in frac.chars()) { if (not c.isDigit()) return #err(#invalidAmount) };
    if (frac.size() > MAX_DECIMALS) {
      return #err(#tooManyDecimals({ maxDecimals = MAX_DECIMALS; minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; given = t }));
    };
    var padded = frac;
    while (padded.size() < MAX_DECIMALS) { padded #= "0" };
    let w = if (whole == "") 0 else (Nat.fromText(whole) ?? return #err(#invalidAmount));
    let f = Nat.fromText(padded) ?? return #err(#invalidAmount);
    #ok(w * 100_000_000 + f);
  };

  func parseQuantity(qty : Types.Quantity) : Result.Result<Nat, Err> {
    switch (qty) {
      case (#baseUnits(n)) #ok(n);
      case (#decimal(t)) parseDecimal(t);
    };
  };

  func prepare(ctx : MintContext, token : PayToken, quantity : Types.MintAmount, now : Int) : Result.Result<Prepared, Err> {
    if (ctx.sale.salesPaused) return #err(#salesPaused);
    if (ctx.dex.pause.paused) return #err(#dexPaused);
    // PTM-9b: the mint is over when what remains to mint is below the minimum
    // of one mint; that remainder joins the first auction lot.
    if (IcrcLib.mintableRemaining(ctx.ledger) < MIN_MINT_TTTI) return #err(#mintEnded);
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), token, now);
    if (not price.usable) return #err(#rateUnavailable({ token }));
    let q = switch (quantity) {
      case (#ttti(qty)) {
        switch (parseQuantity(qty)) {
          case (#ok(n)) n;
          case (#err(e)) return #err(e);
        };
      };
      case (#usd(usdE8)) usdE8 * 99 / 2_000_000;
    };
    if (q < MIN_MINT_TTTI) {
      return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = q }));
    };
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    let returned : Nat = 0; // PTM-9b: transfer fees belong to the creator, never to buyers
    if (q > CAP_TTTI or q > avail) {
      return #err(#aboveCap({ capTtti = CAP_TTTI; remainingTtti = Nat.min(avail, CAP_TTTI); requestedTtti = q; soldTtti = ctx.sale.sold; returnedToContractTtti = returned }));
    };
    let dec = pow10(PayTokenLib.expectedDecimals(token));
    let rate = price.usdE8;
    let payAmount = ceilDiv(2_000_000 * q * dec, 99 * rate);
    let payUsdE8 = ceilDiv(2_000_000 * q, 99);
    let position = TOKEN_PRICE_USD * q * dec / rate;
    let creator = payAmount * CREATOR_BPS / BPS;
    let used = position + position + creator;
    if (position == 0 or used > payAmount) return #err(#invalidAmount);
    #ok({
      token;
      q;
      rateUsdE8 = rate;
      validUntil = price.validUntil;
      payAmount;
      payUsdE8;
      positionToken = position;
      guarantee = position;
      creator;
      dust = Nat.sub(payAmount, used);
      ledgerFee = PayTokenLib.expectedFee(token);
    });
  };

  // --- Pool plan (pure) ------------------------------------------------------

  type Plan = {
    pool : DexTypes.Pool;
    tttiIs0 : Bool;
    first : Bool;
    zap : ?Types.ZapSwap;
    shares : Nat;
    before : Types.PoolPrice;
    after : Types.PoolPrice;
  };

  func reservesOf(pool : DexTypes.Pool, tttiIs0 : Bool) : (Nat, Nat) {
    if (tttiIs0) (pool.reserve0, pool.reserve1) else (pool.reserve1, pool.reserve0);
  };

  func priceOf(rt : Nat, rp : Nat, rate : Nat, dec : Nat) : Types.PoolPrice {
    if (rt == 0 or rp == 0) {
      { reserveTtti = rt; reserveToken = rp; tokenPerTtti = null; usdPerTtti = null };
    } else {
      let perTtti = rp * 100_000_000 / rt;
      { reserveTtti = rt; reserveToken = rp; tokenPerTtti = ?perTtti; usdPerTtti = ?(perTtti * rate / dec) };
    };
  };

  // Which side to fix when depositing (a TTTI-T, b token) into reserves (rt, rp):
  // returns (fixTtti, depositTtti, depositToken).
  func chooseDeposit(rt : Nat, rp : Nat, a : Nat, b : Nat) : (Bool, Nat, Nat) {
    let needP = ceilDiv(a * rp, rt);
    if (needP <= b) (true, a, needP) else (false, ceilDiv(b * rt, rp), b);
  };

  type ZapCalc = { tokenInIsTtti : Bool; x : Nat; y : Nat; fee : Nat; pf : Nat };

  // Largest swap of the surplus side that leaves the other side deposit-able at
  // the post-swap ratio (binary search over the pool's own swap rules).
  func zapCalc(rt : Nat, rp : Nat, a : Nat, b : Nat, bps : Nat) : ?ZapCalc {
    let tttiSurplus = a * rp > b * rt;
    func sim(x : Nat) : ?{ out : Nat; fee : Nat; pf : Nat } {
      let (rin, rout) = if (tttiSurplus) (rt, rp) else (rp, rt);
      let r = DexLib.amountOut(rin, rout, x, bps, false);
      if (r.amountOut == 0 or r.amountOut >= rout) null else ?{ out = r.amountOut; fee = r.fee; pf = DexLib.splitFee(r.fee).protocolFee };
    };
    func feasible(x : Nat) : Bool {
      switch (sim(x)) {
        case null false;
        case (?s) {
          if (tttiSurplus) {
            let rt2 = rt + Nat.sub(x, s.pf);
            let rp2 = rp - s.out;
            a >= x and Nat.sub(a, x) >= ceilDiv((b + s.out) * rt2, rp2);
          } else {
            let rp2 = rp + Nat.sub(x, s.pf);
            let rt2 = rt - s.out;
            b >= x and Nat.sub(b, x) >= ceilDiv((a + s.out) * rp2, rt2);
          };
        };
      };
    };
    var lo = 0;
    var hi = if (tttiSurplus) a else b;
    while (hi > lo + 1) {
      let mid = (lo + hi) / 2;
      if (feasible(mid)) lo := mid else hi := mid;
    };
    if (lo == 0) return null;
    switch (sim(lo)) {
      case (?s) ?{ tokenInIsTtti = tttiSurplus; x = lo; y = s.out; fee = s.fee; pf = s.pf };
      case null null;
    };
  };

  // No first-deposit minimum: #firstDepositBelowMinimum is never returned.
  func mapAddError(e : DexTypes.AddLiquidityError) : Err {
    switch (e) {
      case (#poolRemoved) #poolRemoved;
      case (#removalAnnounced(r)) #removalAnnounced(r);
      case (#minimumsNotSet) #minimumsNotSet;
      case (#invalidSlippage(m)) #invalidSlippage(m);
      case (#slippageExceeded(s)) #slippageExceeded({ toleranceBps = s.toleranceBps });
      case (#insufficientBalance(_)) #poolUnavailable({ message = "Insufficient internal balance for the deposit" });
      case (_) #poolUnavailable({ message = "The pool refused the deposit" });
    };
  };

  func planFor(ctx : MintContext, p : Prepared, now : Int) : Result.Result<Plan, Err> {
    let want = dexOf(p.token);
    var found : ?DexTypes.Pool = null;
    var removed = false;
    for (pool in ctx.dex.dex.pools.values()) {
      switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
        case (?t0, ?t1) {
          if ((t0 == #tttiT and t1 == want) or (t1 == #tttiT and t0 == want)) {
            if (pool.status == #removed) removed := true else found := ?pool;
          };
        };
        case _ {};
      };
    };
    let pool = switch (found) {
      case (?pl) pl;
      case null { return #err(if (removed) #poolRemoved else #poolNotFound({ token = p.token })) };
    };
    let tttiIs0 = pool.token0.ledger == #internal;
    let dec = pow10(PayTokenLib.expectedDecimals(p.token));
    let depositToken = p.positionToken + p.dust;
    let (rt, rp) = reservesOf(pool, tttiIs0);
    let before = priceOf(rt, rp, p.rateUsdE8, dec);
    let tttiSide : DexTypes.PoolSide = if (tttiIs0) #token0 else #token1;
    let first = pool.totalShares == 0;
    let quoted = DexLib.quoteAddLiquidity(
      ctx.dex.dex,
      { poolId = pool.id; side = tttiSide; amount = p.q; counterAmount = if (first) ?depositToken else null; slippageBps = null },
      rateOf(ctx),
      now,
    );
    let quote = switch (quoted) {
      case (#ok(qq)) qq;
      case (#err(e)) return #err(mapAddError(e));
    };
    if (first) {
      return #ok({
        pool;
        tttiIs0;
        first;
        zap = null;
        shares = quote.shares;
        before;
        after = priceOf(p.q, depositToken, p.rateUsdE8, dec);
      });
    };
    if (rt == 0 or rp == 0) return #err(#poolUnavailable({ message = "The pool has an empty side" }));
    let bps = DexLib.feeBps(pool.feeTier);
    var rt2 = rt;
    var rp2 = rp;
    var a = p.q;
    var b = depositToken;
    var zap : ?Types.ZapSwap = null;
    // The balancing zap needs a swap in the pool. The swap-opening threshold
    // (10 USD) applies to swaps only: when the pool is not open for swaps the
    // mint is never refused; it deposits at the pool ratio without any swap
    // and the unmatched side stays on the minter's DEX balance.
    if (a * rp != b * rt and DexLib.swapStateOf(ctx.dex.dex, pool, rateOf(ctx), now).open) {
      switch (zapCalc(rt, rp, a, b, bps)) {
        case (?z) {
          if (z.tokenInIsTtti) {
            a := Nat.sub(a, z.x);
            b += z.y;
            rt2 := rt + Nat.sub(z.x, z.pf);
            rp2 := rp - z.y;
            zap := ?{ tokenIn = #tttiT; tokenOut = want; amountIn = z.x; amountOut = z.y; feeAmount = z.fee };
          } else {
            b := Nat.sub(b, z.x);
            a += z.y;
            rp2 := rp + Nat.sub(z.x, z.pf);
            rt2 := rt - z.y;
            zap := ?{ tokenIn = want; tokenOut = #tttiT; amountIn = z.x; amountOut = z.y; feeAmount = z.fee };
          };
        };
        case null {};
      };
    };
    let (_, dT, dP) = chooseDeposit(rt2, rp2, a, b);
    let total = pool.totalShares;
    let shares = Nat.min(dT * total / rt2, dP * total / rp2);
    if (shares == 0) return #err(#poolUnavailable({ message = "The deposit would create no shares" }));
    #ok({ pool; tttiIs0; first; zap; shares; before; after = priceOf(rt2 + dT, rp2 + dP, p.rateUsdE8, dec) });
  };

  // PTM-5: consolidated TTTI-T price (all open native TTTI-T pools, current
  // oracle rates, depth-weighted) before the operation and after zap + deposit
  // of `plan` (after-state reserves of the pool being minted into). Returns
  // #unavailable instead of trapping.
  func consolidatedAround(ctx : MintContext, plan : Plan, now : Int) : (Types.ConsolidatedMintPrice, Types.ConsolidatedMintPrice) {
    func toMint(c : DexLib.ConsolidatedNow) : Types.ConsolidatedMintPrice {
      switch (c.price, c.unavailable) {
        case (?price, _) #available(price);
        case (null, ?u) #unavailable(u);
        case (null, null) #unavailable(#noOpenPool);
      };
    };
    let rates = rateOf(ctx);
    let before = toMint(DexLib.consolidatedNow(ctx.dex.dex, rates, now));
    let (r0, r1) = if (plan.tttiIs0) (plan.after.reserveTtti, plan.after.reserveToken) else (plan.after.reserveToken, plan.after.reserveTtti);
    let after = toMint(
      DexLib.consolidatedWith(
        ctx.dex.dex,
        rates,
        now,
        ?{ poolId = plan.pool.id; reserve0 = r0; reserve1 = r1; totalShares = plan.pool.totalShares + plan.shares },
      )
    );
    (before, after);
  };

  // --- Quote -----------------------------------------------------------------

  // Quote (query): rate, split, target pool, prices before / after the zap.
  // Rounding favors the pool: pay rounded up, position / guarantee / creator
  // rounded down. Cannot check wallet or allowance (a query has no ledger call).
  public func quote(ctx : MintContext, args : Types.QuoteArgs, now : Int) : Result.Result<Types.LiquidityMintQuote, Types.LiquidityMintError> {
    let p = switch (prepare(ctx, args.token, args.amount, now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    let plan = switch (planFor(ctx, p, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let (consolidatedPriceBefore, consolidatedPriceAfter) = consolidatedAround(ctx, plan, now);
    #ok({
      token = p.token;
      tttiAmount = p.q;
      rateUsdE8 = p.rateUsdE8;
      rateValidUntil = p.validUntil;
      payAmount = p.payAmount;
      payUsdE8 = p.payUsdE8;
      positionTokenAmount = p.positionToken;
      positionTttiAmount = p.q;
      guaranteeAmount = p.guarantee;
      creatorAmount = p.creator;
      dustAmount = p.dust;
      ledgerFee = p.ledgerFee;
      poolId = plan.pool.id;
      firstDeposit = plan.first;
      priceBefore = plan.before;
      priceAfter = plan.after;
      consolidatedPriceBefore;
      consolidatedPriceAfter;
      zap = plan.zap;
      shares = plan.shares;
      quotedAt = now;
    });
  };

  // --- Mint ------------------------------------------------------------------

  // --- Self-releasing locks -------------------------------------------------

  // A lock held longer than this is considered abandoned (a missed finally) and
  // is taken over by the next caller. Lock times are transient.
  public let LOCK_TTL_NS : Int = 600_000_000_000;

  // Takes a DEX lock key; an expired one is taken over. Returns the stamp that
  // identifies this holder, or null when the lock is validly held.
  func takeKey(ctx : MintContext, key : Text) : ?Int {
    let now = Time.now();
    if (ctx.dex.locks.contains(key)) {
      switch (ctx.lockTimes.get(key)) {
        case (?at) { if (now - at < LOCK_TTL_NS) return null };
        // Held without a stamp: taken by another module, which releases it.
        case null return null;
      };
    };
    ctx.dex.locks.add(key);
    ctx.lockTimes.add(key, now);
    ?now;
  };

  func releaseKey(ctx : MintContext, key : Text, stamp : Int) {
    switch (ctx.lockTimes.get(key)) {
      case (?at) {
        // A different stamp means the lock was taken over after it expired: leave it.
        if (at == stamp) {
          ctx.dex.locks.remove(key);
          ctx.lockTimes.remove(key);
        };
      };
      case null {};
    };
  };

  func lockPayer(ctx : MintContext, payer : Principal, token : PayToken) : ?[(Text, Int)] {
    let a = RetryLib.dexLockKey(payer, #tttiT);
    let b = RetryLib.dexLockKey(payer, dexOf(token));
    let sa = switch (takeKey(ctx, a)) { case (?s) s; case null return null };
    let sb = switch (takeKey(ctx, b)) {
      case (?s) s;
      case null {
        releaseKey(ctx, a, sa);
        return null;
      };
    };
    ?[(a, sa), (b, sb)];
  };

  func unlockPayer(ctx : MintContext, keys : [(Text, Int)]) {
    for ((k, stamp) in keys.values()) { releaseKey(ctx, k, stamp) };
  };

  // The per-principal purchase lock shared with the BTC finalization. Takes it
  // (taking over an expired one) and returns this holder's stamp, or null when
  // it is validly held.
  public func takePurchaseLock(times : Map.Map<Text, Int>, locks : Set.Set<Principal>, who : Principal) : ?Int {
    let key = "P/" # who.toText();
    let now = Time.now();
    if (locks.contains(who)) {
      switch (times.get(key)) {
        case (?at) { if (now - at < LOCK_TTL_NS) return null };
        case null return null;
      };
    };
    locks.add(who);
    times.add(key, now);
    ?now;
  };

  // Normal release, on every exit (finally). Does nothing when the lock was
  // taken over after it expired.
  public func releasePurchaseLock(times : Map.Map<Text, Int>, locks : Set.Set<Principal>, who : Principal, stamp : Int) {
    let key = "P/" # who.toText();
    switch (times.get(key)) {
      case (?at) {
        if (at == stamp) {
          locks.remove(who);
          times.remove(key);
        };
      };
      case null {};
    };
  };

  func setMint(ctx : MintContext, id : Types.MintId, f : Types.LiquidityMint -> Types.LiquidityMint) {
    switch (ctx.store.mints.get(id)) {
      case (?m) { ctx.store.mints.add(id, f(m)) };
      case null {};
    };
  };

  // The mint status follows the DW refund withdrawal: called when a refund
  // withdrawal settles (immediate send, timer retry, admin Arrived / Not
  // arrived). Idempotent; an unsettled status changes nothing.
  public func followWithdrawal(store : Types.LiquidityMintStore, n : Nat, status : DexTypes.DexTransferStatus) {
    let next : Types.MintStatus = switch (status) {
      case (#completed(_)) #refunded;
      case (#failed(_)) #refundFailed;
      case _ return;
    };
    let ids = store.mints.values().filter(func(m : Types.LiquidityMint) : Bool = m.status == #refunding and m.refundWithdrawalN == ?n).map(func(m : Types.LiquidityMint) : Nat = m.id).toArray();
    for (id in ids.values()) {
      switch (store.mints.get(id)) {
        case (?m) { store.mints.add(id, { m with status = next }) };
        case null {};
      };
    };
  };

  // --- Isolated mint core ----------------------------------------------------

  public let MAX_CAUSE_CHARS : Nat = 300;
  let REFUSAL_MARKER : Text = "mint refused: ";

  // Everything the isolated core needs; the core re-verifies all of it.
  public type CoreArgs = {
    payer : Principal;
    owner : Principal;
    p : Prepared;
    expectedShares : Nat;
    slippage : Nat;
    mintId : Types.MintId;
    paymentBlock : Nat;
    // Mint deadline (the BTC path has none).
    deadline : ?Int;
  };

  // Every refusal of the core is a trap: in Motoko only a trap rolls back the
  // state of the message, so a refused mint leaves no trace.
  func refuse(cause : Text) : None = Runtime.trap(REFUSAL_MARKER # cause);

  func causeOf(e : Err) : Text {
    switch (e) {
      case (#salesPaused) "Sales are paused";
      case (#dexPaused) "The DEX is paused";
      case (#aboveCap(c)) "The 1 TTTI-T cap leaves " # c.remainingTtti.toText() # " base units, " # c.requestedTtti.toText() # " requested";
      case (#slippageExceeded(s)) "Slippage exceeded (tolerance " # s.toleranceBps.toText() # " bps)";
      case (#poolNotFound(_)) "Pool not found";
      case (#poolRemoved) "The pool was removed";
      case (#poolUnavailable(m)) m.message;
      case (#ledgerError(m)) m.message;
      case _ debug_show e;
    };
  };

  // PTM-6c: short cause taken from the rejection of an isolated call.
  public func refusalCause(message : Text) : Text = causeFromReject(message);

  func bounded(t : Text) : Text {
    if (t.size() <= MAX_CAUSE_CHARS) t else Text.fromIter(t.chars().take(MAX_CAUSE_CHARS));
  };

  // Short cause kept with the mint, taken from the rejection of the isolated call.
  func causeFromReject(message : Text) : Text {
    let parts = message.split(#text REFUSAL_MARKER).toArray();
    bounded(if (parts.size() >= 2) parts[parts.size() - 1] else message);
  };

  // The synchronous core, with no await, run as a self-call of the canister
  // (`liquidityMintCore` in main.mo). It re-verifies everything before mutating
  // (other messages ran since the payment credit), then re-plans against the
  // current pool, mints q TTTI-T, zaps, deposits, hands over the position,
  // books the guarantee and the creator set-aside. Any failure TRAPS.
  public func core(ctx : MintContext, a : CoreArgs) : Types.LiquidityMintResult {
    let payer = a.payer;
    let owner = a.owner;
    let p = a.p;
    let mintId = a.mintId;
    let slippage = a.slippage;
    let now = Time.now();
    // 1. Checks (no state change yet).
    switch (a.deadline) {
      case (?d) { if (now > d) refuse("The mint deadline expired") };
      case null {};
    };
    if (slippage > BPS) refuse("Invalid slippage tolerance");
    switch (ctx.store.mints.get(mintId)) {
      case (?m) {
        if (m.status != #inProgress or m.payer != payer or m.payAmount != p.payAmount or m.tttiAmount != p.q) {
          refuse("The mint record does not match");
        };
      };
      case null refuse("Mint record not found");
    };
    if (ctx.sale.salesPaused) refuse(causeOf(#salesPaused));
    if (ctx.dex.pause.paused) refuse(causeOf(#dexPaused));
    if (p.q < MIN_MINT_TTTI) refuse("Below the minimum mint");
    if (IcrcLib.mintableRemaining(ctx.ledger) < MIN_MINT_TTTI) refuse("The mint has ended");
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    if (p.q > CAP_TTTI or p.q > avail) {
      refuse(causeOf(#aboveCap({ capTtti = CAP_TTTI; remainingTtti = Nat.min(avail, CAP_TTTI); requestedTtti = p.q; soldTtti = ctx.sale.sold; returnedToContractTtti = 0 })));
    };
    let want = dexOf(p.token);
    let kept = p.guarantee + p.creator;
    if (p.positionToken + p.positionToken + p.creator > p.payAmount) refuse("Invalid amounts");
    if (DexLib.available(ctx.dex.balances, payer, want) < p.payAmount) {
      refuse("Insufficient internal balance of the payer for the payment");
    };
    let plan = switch (planFor(ctx, p, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) refuse(causeOf(e));
    };
    if (plan.shares * BPS < a.expectedShares * Nat.sub(BPS, Nat.min(slippage, BPS))) {
      refuse(causeOf(#slippageExceeded({ toleranceBps = slippage })));
    };
    // 2. Mutations: from here on a trap undoes all of them.
    // Exactly q TTTI-T are minted (never burned) straight into the TTTI-T DEX custody.
    switch (IcrcLib.deliverMintFirst(ctx.ledger, ctx.canister, DexLib.custodyAccount(ctx.canister, #tttiT), p.q)) {
      case (#ok(_)) {};
      case (#err(msg)) refuse(msg);
    };
    let balances = ctx.dex.balances;
    DexLib.credit(balances, payer, #tttiT, p.q);
    let depositToken = p.positionToken + p.dust;
    var x = p.q;
    var y = depositToken;
    let usd = rateOf(ctx);
    // Balancing swap in the same pool, at the market price, with the minter's funds.
    switch (plan.zap) {
      case (?z) {
        let minOut = z.amountOut * Nat.sub(BPS, Nat.min(slippage, BPS)) / BPS;
        switch (DexLib.swap(ctx.dex.dex, balances, ctx.canister, payer, plan.pool.id, z.tokenIn, z.amountIn, minOut, now + SWAP_DEADLINE_NS, false, usd, now, ctx.dex.indicators)) {
          case (#ok(r)) {
            if (z.tokenIn == #tttiT) {
              x := Nat.sub(x, r.amountIn);
              y += r.amountOut;
            } else {
              y := Nat.sub(y, r.amountIn);
              x += r.amountOut;
            };
          };
          case (#err(e)) refuse("The balancing swap was refused: " # debug_show e);
        };
      };
      case null {};
    };
    let pool = switch (ctx.dex.dex.pools.get(plan.pool.id)) {
      case (?pl) pl;
      case null refuse("Pool not found");
    };
    let (rt, rp) = reservesOf(pool, plan.tttiIs0);
    let (fixTtti, amount, counter) = if (plan.first) {
      (true, x, y);
    } else {
      let (f, dT, dP) = chooseDeposit(rt, rp, x, y);
      if (f) (true, dT, dP) else (false, dP, dT);
    };
    let side : DexTypes.PoolSide = if (fixTtti == plan.tttiIs0) #token0 else #token1;
    let args : DexTypes.AddLiquidityArgs = {
      poolId = pool.id;
      side;
      amount;
      counterAmount = if (plan.first) ?counter else null;
      slippageBps = ?slippage;
      lockDurationNs = null;
    };
    let added = switch (DexLib.addLiquidityWith(ctx.dex.dex, balances, ctx.canister, payer, false, args, usd, now, false)) {
      case (#ok(r)) r;
      case (#err(e)) refuse("The liquidity deposit was refused: " # debug_show e);
    };
    let positionId = added.position.id;
    if (owner != payer) {
      switch (ctx.dex.dex.positions.get(positionId)) {
        case (?_) { DexLib.setPositionOwner(ctx.dex.dex, positionId, owner) };
        case null refuse("Position not found");
      };
    };
    // Guarantee and creator set-aside: kept in the paid token, inside the
    // contract's DEX custody, under the contract's own internal balance.
    if (not DexLib.debit(balances, payer, want, kept)) {
      refuse("Insufficient internal balance for the guarantee");
    };
    DexLib.credit(balances, ctx.canister, want, kept);
    ctx.store.guarantees.add(mintId, { mintId; owner; token = p.token; amount = p.guarantee; createdAt = now });
    // PTM-9b: the guarantee created by the mint is credited to the dedicated account.
    GuaranteeLib.creditAccount(ctx.guaranteeAccount, p.token, p.guarantee);
    // PTM-2: the owner's personal mass grows by the minted TTTI-T and its guarantee, in this same synchronous block.
    GuaranteeLib.addMass(ctx.masses, owner, p.token, p.q, p.guarantee);
    ctx.store.creatorSetAsides.add(mintId, { mintId; token = p.token; amount = p.creator });
    // PTM-4, synchronous: the fee split is recorded here; the creator part
    // moves from the contract's DEX balance to the creator holdings, the
    // cycles part stays in the ICP balance as a pending share (sent later by
    // the settlement).
    if (p.creator > 0) {
      let split = CyclesReserveLib.planFeeSplit(ctx.cyclesFees, p.token == #icp, p.creator, now);
      if (not DexLib.debit(balances, ctx.canister, want, split.creator)) {
        refuse("Insufficient internal balance for the creator set-aside");
      };
      CyclesReserveLib.recordCyclesShare(ctx.cyclesFees.fees, split.cyclesE8s);
      CreatorFeesLib.credit(ctx.creatorFees, want, split.creator, #mintFee, now);
      ctx.cyclesFees.fees.mintSplits.add(mintId, split);
    };
    // PTM-9b: the transfer fees collected so far really go to the creator.
    ignore CreatorFeesLib.collectTransferFees(ctx.creatorFees, ctx.ledger, ctx.canister, now);
    setMint(ctx, mintId, func m = { m with positionId = ?positionId; status = #completed });
    let after = switch (ctx.dex.dex.pools.get(pool.id)) {
      case (?pl) {
        let (r1, r2) = reservesOf(pl, plan.tttiIs0);
        priceOf(r1, r2, p.rateUsdE8, pow10(PayTokenLib.expectedDecimals(p.token)));
      };
      case null plan.after;
    };
    {
      mintId;
      token = p.token;
      tttiAmount = p.q;
      payAmount = p.payAmount;
      paymentBlock = a.paymentBlock;
      owner;
      poolId = pool.id;
      positionId;
      shares = added.shares;
      positionTokenAmount = p.positionToken;
      positionTttiAmount = p.q;
      guaranteeAmount = p.guarantee;
      creatorAmount = p.creator;
      zap = plan.zap;
      priceBefore = plan.before;
      priceAfter = after;
      rateUsdE8 = p.rateUsdE8;
      createdAt = now;
    };
  };

  // --- PTM-6c: pooling of an auction winner ---------------------------------------

  public type WinnerArgs = {
    bidId : Nat;
    owner : Principal;
    token : PayToken;
    q : Nat; // served quantity (TTTI-T e8s)
    priceB : Nat; // price per whole TTTI-T in the paid token's smallest unit
    taken : Nat; // 2 x B x q / 0.99 rounded up: the amount to take
    feeBorne : Nat; // ledger fee of the internal move carried by the creator share (at most 1 % of taken): not on the winner's DEX balance
    spareTtti : Nat; // most TTTI-T (q - mintE8s and the ledger fee included) the returned account may release
    mintE8s : Nat; // PTM-9b: part of q minted fresh now (end-of-mint remainder), pooled with the winner's mass; <= q
  };

  public type WinnerResult = {
    poolId : Nat;
    positionId : Nat;
    shares : Nat;
    taken : Nat;
    charged : Nat; // taken from the winner's DEX balance: taken less the fee borne by the creator share
    creator : Nat; // credited to the creator: 1 % of taken, net of the fee borne
    position : Nat;
    guarantee : Nat;
    minted : Nat; // PTM-9b: TTTI-T minted fresh for this winner (end-of-mint remainder)
  };

  // Synchronous core of the settlement of ONE auction winner, run inside the
  // isolated self-call (no await; every refusal is a trap, which undoes the
  // whole message). It takes `taken` from the winner's DEX balance, moves the
  // q TTTI-T already held on the returned account to the TTTI-T DEX custody
  // (nothing is minted or burned), forms the winner's position with them (zap
  // as at the mint, the position belongs to the winner), keeps B per TTTI-T as
  // the winner's guarantee in the paid token and credits 1 % to the creator.
  public func settleWinner(ctx : MintContext, a : WinnerArgs) : WinnerResult {
    let owner = a.owner;
    let now = Time.now();
    if (ctx.dex.pause.paused) refuse(causeOf(#dexPaused));
    if (a.q == 0) refuse("Nothing to settle");
    if (a.mintE8s > a.q) refuse("The quantity to mint exceeds the quantity served");
    // PTM-9b: the part of q that is the end-of-mint remainder is minted now; the
    // rest comes from the returned account.
    let fromReturned = Nat.sub(a.q, a.mintE8s);
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, a.token), a.token, now);
    if (not price.usable) refuse(causeOf(#rateUnavailable({ token = a.token })));
    let position = a.priceB * a.q / 100_000_000;
    let creatorFull = a.taken * CREATOR_BPS / BPS;
    let used = position + position + creatorFull;
    if (position == 0 or used > a.taken) refuse("Invalid amounts");
    // The ledger fee of the internal move is carried by the creator share (never below zero).
    let borne = Nat.min(a.feeBorne, creatorFull);
    let creator = Nat.sub(creatorFull, borne);
    let charged = Nat.sub(a.taken, borne);
    let p : Prepared = {
      token = a.token;
      q = a.q;
      rateUsdE8 = price.usdE8;
      validUntil = price.validUntil;
      payAmount = a.taken;
      payUsdE8 = 0;
      positionToken = position;
      guarantee = position;
      creator;
      dust = Nat.sub(a.taken, used);
      ledgerFee = PayTokenLib.expectedFee(a.token);
    };
    let want = dexOf(a.token);
    let balances = ctx.dex.balances;
    if (DexLib.available(balances, owner, want) < charged) {
      refuse("Insufficient internal balance of the winner for the settlement");
    };
    let tttiFee = IcrcLib.fee(ctx.ledger);
    if (fromReturned > 0 and fromReturned + tttiFee > a.spareTtti) {
      refuse("The returned TTTI-T cannot cover the quantity and the ledger fee");
    };
    if (a.mintE8s > IcrcLib.mintableRemaining(ctx.ledger)) {
      refuse("The remainder to mint exceeds what can still be minted");
    };
    let plan = switch (planFor(ctx, p, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) refuse(causeOf(e));
    };
    // Mutations: from here on a trap undoes all of them.
    // The returned part moves from the returned account into the TTTI-T DEX custody.
    if (fromReturned > 0) {
      switch (
        IcrcLib.transfer(
          ctx.ledger,
          ctx.canister,
          ctx.canister,
          {
            from_subaccount = ?IcrcLib.RETURNED_SUBACCOUNT;
            to = DexLib.custodyAccount(ctx.canister, #tttiT);
            amount = fromReturned;
            fee = ?tttiFee;
            memo = ?(("TTTI-AW-" # a.bidId.toText()).encodeUtf8());
            created_at_time = null;
          },
        )
      ) {
        case (#Ok(_)) {};
        case (#Err(err)) refuse("The TTTI-T move was refused: " # debug_show err);
      };
    };
    // The end-of-mint remainder is minted now, fresh, straight into the TTTI-T custody.
    if (a.mintE8s > 0) {
      switch (IcrcLib.deliverMintFirst(ctx.ledger, ctx.canister, DexLib.custodyAccount(ctx.canister, #tttiT), a.mintE8s)) {
        case (#ok(_)) {};
        case (#err(msg)) refuse(msg);
      };
    };
    DexLib.credit(balances, owner, #tttiT, a.q);
    let slippage = DEFAULT_SLIPPAGE_BPS;
    let depositToken = p.positionToken + p.dust;
    var x = p.q;
    var y = depositToken;
    let usd = rateOf(ctx);
    switch (plan.zap) {
      case (?z) {
        let minOut = z.amountOut * Nat.sub(BPS, Nat.min(slippage, BPS)) / BPS;
        switch (DexLib.swap(ctx.dex.dex, balances, ctx.canister, owner, plan.pool.id, z.tokenIn, z.amountIn, minOut, now + SWAP_DEADLINE_NS, false, usd, now, ctx.dex.indicators)) {
          case (#ok(r)) {
            if (z.tokenIn == #tttiT) {
              x := Nat.sub(x, r.amountIn);
              y += r.amountOut;
            } else {
              y := Nat.sub(y, r.amountIn);
              x += r.amountOut;
            };
          };
          case (#err(e)) refuse("The balancing swap was refused: " # debug_show e);
        };
      };
      case null {};
    };
    let pool = switch (ctx.dex.dex.pools.get(plan.pool.id)) {
      case (?pl) pl;
      case null refuse("Pool not found");
    };
    let (rt, rp) = reservesOf(pool, plan.tttiIs0);
    let (fixTtti, amount, counter) = if (plan.first) {
      (true, x, y);
    } else {
      let (f, dT, dP) = chooseDeposit(rt, rp, x, y);
      if (f) (true, dT, dP) else (false, dP, dT);
    };
    let side : DexTypes.PoolSide = if (fixTtti == plan.tttiIs0) #token0 else #token1;
    let args : DexTypes.AddLiquidityArgs = {
      poolId = pool.id;
      side;
      amount;
      counterAmount = if (plan.first) ?counter else null;
      slippageBps = ?slippage;
      lockDurationNs = null;
    };
    let added = switch (DexLib.addLiquidityWith(ctx.dex.dex, balances, ctx.canister, owner, false, args, usd, now, false)) {
      case (#ok(r)) r;
      case (#err(e)) refuse("The liquidity deposit was refused: " # debug_show e);
    };
    // Guarantee and creator share leave the winner's balance; the guarantee
    // stays in the contract's DEX custody under the contract's own balance.
    if (not DexLib.debit(balances, owner, want, p.guarantee + p.creator)) {
      refuse("Insufficient internal balance for the guarantee");
    };
    DexLib.credit(balances, ctx.canister, want, p.guarantee + p.creator);
    GuaranteeLib.creditAccount(ctx.guaranteeAccount, a.token, p.guarantee);
    GuaranteeLib.addMass(ctx.masses, owner, a.token, p.q, p.guarantee);
    if (p.creator > 0) {
      if (not DexLib.debit(balances, ctx.canister, want, p.creator)) {
        refuse("Insufficient internal balance for the creator share");
      };
      CreatorFeesLib.credit(ctx.creatorFees, want, p.creator, #mintFee, now);
    };
    ignore CreatorFeesLib.collectTransferFees(ctx.creatorFees, ctx.ledger, ctx.canister, now);
    {
      poolId = pool.id;
      positionId = added.position.id;
      shares = added.shares;
      taken = a.taken;
      charged;
      creator = p.creator;
      position = p.positionToken;
      guarantee = p.guarantee;
      minted = a.mintE8s;
    };
  };

  // Refund of the payment from the payer's internal balance (DW rules) after
  // the isolated core refused: nothing was minted, nothing else changed.
  func refund(ctx : MintContext, payer : Principal, p : Prepared, mintId : Types.MintId, cause : Text) : async Result.Result<Types.LiquidityMintResult, Err> {
    let dtoken = dexOf(p.token);
    let fee = RetryLib.dexFee(ctx.dex, dtoken);
    switch (RetryLib.openDexWithdrawal(ctx.dex, payer, dtoken, p.payAmount, fee)) {
      case null {
        // No withdrawal could be opened: the payment stays withdrawable in the payer's internal balance.
        setMint(ctx, mintId, func m = { m with status = #refundFailed; refusalCause = ?cause });
        #err(#depositFailedRefundFailed({ mintId }));
      };
      case (?t) {
        setMint(ctx, mintId, func m = { m with status = #refunding; refundWithdrawalN = ?t.n; refusalCause = ?cause });
        let sent = await RetryLib.sendDexWithdrawal(ctx.dex, t.n);
        followWithdrawal(ctx.store, t.n, sent.status);
        switch (sent.status) {
          case (#completed(_)) #err(#depositFailedRefunded({ mintId }));
          case (#failed(_)) #err(#depositFailedRefundFailed({ mintId }));
          case _ #err(#depositFailedRefunding({ mintId }));
        };
      };
    };
  };

  // After the payment sits in the payer's internal balance (committed, never
  // undone): record the mint, run the isolated core as a self-call, and refund
  // through the DW rules when the core refused (its state was rolled back).
  func settle(ctx : MintContext, payer : Principal, owner : Principal, p : Prepared, plan : Plan, slippage : Nat, paymentBlock : Nat, deadline : ?Int) : async Result.Result<Types.LiquidityMintResult, Err> {
    let mintId = ctx.store.nextMintId;
    ctx.store.nextMintId += 1;
    ctx.store.mints.add(
      mintId,
      {
        id = mintId;
        payer;
        owner;
        token = p.token;
        tttiAmount = p.q;
        payAmount = p.payAmount;
        rateUsdE8 = p.rateUsdE8;
        poolId = plan.pool.id;
        positionId = null;
        paymentBlock = ?paymentBlock;
        status = #inProgress;
        createdAt = Time.now();
        refundWithdrawalN = null;
        refusalCause = null;
      },
    );
    let outcome : { #done : Types.LiquidityMintResult; #refused : Text } = try {
      #done(await ctx.isolated({ payer; owner; p; expectedShares = plan.shares; slippage; mintId; paymentBlock; deadline }));
    } catch (e) {
      #refused(causeFromReject(e.message()));
    };
    switch (outcome) {
      case (#done(r)) #ok(r);
      case (#refused(cause)) {
        let completed = switch (ctx.store.mints.get(mintId)) {
          case (?m) m.status == #completed;
          case null false;
        };
        if (completed) {
          // Defensive: the core ran to the end, only its reply was lost. Never refund a completed mint.
          #err(#ledgerError({ token = p.token; message = "The mint completed but its reply was lost; see getMyLiquidityMints" }));
        } else {
          await refund(ctx, payer, p, mintId, cause);
        };
      };
    };
  };

  func depositError(token : PayToken, required : Nat, err : ?Treasury.IcpTransferFromError, status : DexTypes.DexTransferStatus) : Err {
    switch (err) {
      case (?#InsufficientFunds({ balance })) #insufficientBalance({ token; balance; required });
      case (?#InsufficientAllowance({ allowance })) #insufficientAllowance({ token; allowance; required });
      case (?e) #ledgerError({ token; message = PayTokenLib.transferFromErrorMessage(token, e) });
      case null {
        switch (status) {
          case (#failed(text)) #ledgerError({ token; message = text });
          case _ #ledgerError({ token; message = "The payment has an unknown outcome; it is resent identically for 23 hours and, if it arrives, credited to your DEX balance" });
        };
      };
    };
  };

  // Mint: validates everything before any funds are taken, then collects the
  // payment (ICRC-2), mints q TTTI-T, zap-swaps, adds the liquidity in the
  // minter's name, records the guarantee and the creator set-aside. The
  // caller holds the per-principal purchase lock.
  public func mint(ctx : MintContext, caller : Principal, args : Types.MintArgs) : async Result.Result<Types.LiquidityMintResult, Types.LiquidityMintError> {
    if (caller.isAnonymous()) return #err(#anonymousCaller);
    let owner = args.recipient ?? caller;
    if (owner.isAnonymous()) return #err(#anonymousCaller);
    if (not SaleLib.hasAccepted(ctx.acknowledgements, caller)) return #err(#acknowledgementRequired);
    let now = Time.now();
    if (now > args.deadline) return #err(#deadlineExpired({ deadline = args.deadline; now }));
    let slippage = args.slippageBps ?? DEFAULT_SLIPPAGE_BPS;
    if (slippage > BPS) return #err(#invalidSlippage({ maximumBps = BPS }));
    let p = switch (prepare(ctx, args.token, #ttti(args.quantity), now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    if (p.payAmount > args.maxPayAmount) {
      return #err(#maxPayExceeded({ payAmount = p.payAmount; maxPayAmount = args.maxPayAmount }));
    };
    let plan = switch (planFor(ctx, p, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let keys = switch (lockPayer(ctx, caller, args.token)) {
      case (?k) k;
      case null return #err(#purchaseInProgress);
    };
    try {
      let dtoken = dexOf(args.token);
      let deposit = RetryLib.openDexDeposit(ctx.dex, caller, dtoken, p.payAmount);
      let (done, err) = await RetryLib.sendDexDepositDetailed(ctx.dex, deposit.n);
      switch (done.status) {
        case (#completed(block)) await settle(ctx, caller, owner, p, plan, slippage, block, ?args.deadline);
        case (status) #err(depositError(args.token, p.payAmount + p.ledgerFee, err, status));
      };
    } finally {
      unlockPayer(ctx, keys);
    };
  };

  // BTC -> ckBTC deposit path: the ckBTC found in the buyer's deposit
  // subaccount (ckbtcAmount) gives the largest q whose payable amount plus the
  // ledger fee fits, the payment moves from the deposit subaccount into the
  // ckBTC DEX custody (BC retry rules), then the same flow as `mint` runs.
  // The leftover is handled by the excess refund of lib/btc-deposit.mo.
  public func mintFromDeposit(ctx : MintContext, buyer : Principal, subaccount : Blob, depositIndex : Nat, ckbtcAmount : Nat) : async Result.Result<Types.LiquidityMintResult, Types.LiquidityMintError> {
    let token : PayToken = #ckbtc;
    if (buyer.isAnonymous()) return #err(#anonymousCaller);
    if (not SaleLib.hasAccepted(ctx.acknowledgements, buyer)) return #err(#acknowledgementRequired);
    let now = Time.now();
    let fee = PayTokenLib.expectedFee(token);
    if (ckbtcAmount <= fee) {
      return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = 0 }));
    };
    let budget = Nat.sub(ckbtcAmount, fee);
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), token, now);
    if (not price.usable) return #err(#rateUnavailable({ token }));
    let dec = pow10(PayTokenLib.expectedDecimals(token));
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    var q = Nat.min(Nat.min(budget * price.usdE8 * 99 / (2_000_000 * dec), CAP_TTTI), avail);
    var guard = 0;
    while (q > 0 and guard < 8 and ceilDiv(2_000_000 * q * dec, 99 * price.usdE8) > budget) {
      q -= 1;
      guard += 1;
    };
    let p = switch (prepare(ctx, token, #ttti(#baseUnits(q)), now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    if (p.payAmount > budget) return #err(#invalidAmount);
    let plan = switch (planFor(ctx, p, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let keys = switch (lockPayer(ctx, buyer, token)) {
      case (?k) k;
      case null return #err(#purchaseInProgress);
    };
    try {
      let request = {
        token;
        from_subaccount = ?subaccount;
        to = DexLib.custodyAccount(ctx.canister, #ckbtc);
        amount = p.payAmount;
        fee = ?fee;
      };
      let fresh = RetryLib.newAttempt(ctx.transfers.retry, #PC, null, request, RetryLib.now64());
      let attempt = { fresh with sends = 1 };
      let pcKey = RetryLib.lockKey(#PC, attempt.n);
      ignore RetryLib.tryLock(ctx.transfers.locks, pcKey);
      ctx.transfers.retry.btcCosts.add(attempt.n, { buyer; depositIndex; conversionId = null; attempt });
      let result = await RetryLib.sendBtcCounted(attempt);
      RetryLib.setBtcCostAttempt(ctx.transfers, attempt.n, result);
      RetryLib.unlock(ctx.transfers.locks, pcKey);
      switch (result.outcome) {
        case (#succeeded(block)) {
          // The ckBTC is in the DEX custody: credit it, then the same flow as `mint`.
          RetryLib.dropBtcCost(ctx.transfers, attempt.n);
          DexLib.credit(ctx.dex.balances, buyer, #ckbtc, p.payAmount);
          await settle(ctx, buyer, buyer, p, plan, DEFAULT_SLIPPAGE_BPS * 2, block, null);
        };
        case (#failed(text)) {
          RetryLib.dropBtcCost(ctx.transfers, attempt.n);
          #err(#ledgerError({ token; message = text }));
        };
        case (_) {
          #err(#ledgerError({ token; message = "The ckBTC move has an unknown outcome (" # (result.lastError ?? "") # "); it is resent identically for 23 hours" }));
        };
      };
    } finally {
      unlockPayer(ctx, keys);
    };
  };

  // Typed refusal of convertDeposit / convertDepositWith.
  public func oldPurchaseRefusal(token : Types.PayToken) : SaleTypes.PurchaseError {
    {
      code = #replacedByLiquidityMint;
      message = "Buying TTTI-T with " # PayTokenLib.symbol(token) # " is replaced by the liquidity mint: call quoteLiquidityMint, then mintLiquidity (each TTTI-T is minted into a liquidity position in your name)";
      conversion = null;
    };
  };

  // Mints of `owner` (as payer or as owner of the position), newest first.
  public func mintsOf(store : Types.LiquidityMintStore, owner : Principal) : [Types.LiquidityMint] {
    store.mints.values().filter(func(m : Types.LiquidityMint) : Bool = m.owner == owner or m.payer == owner).toArray().reverse();
  };

  public func guaranteesOf(store : Types.LiquidityMintStore, owner : Principal) : [Types.Guarantee] {
    store.guarantees.values().filter(func(g : Types.Guarantee) : Bool = g.owner == owner).toArray();
  };

  func page<T>(all : [T], offset : Nat, limit : Nat) : [T] {
    if (offset >= all.size()) return [];
    let end = Nat.min(all.size(), offset + limit);
    all.sliceToArray(offset, end);
  };

  public func listGuarantees(store : Types.LiquidityMintStore, offset : Nat, limit : Nat) : [Types.Guarantee] {
    page(store.guarantees.values().toArray(), offset, limit);
  };

  public func listCreatorSetAsides(store : Types.LiquidityMintStore, offset : Nat, limit : Nat) : [Types.CreatorSetAside] {
    page(store.creatorSetAsides.values().toArray(), offset, limit);
  };
};
