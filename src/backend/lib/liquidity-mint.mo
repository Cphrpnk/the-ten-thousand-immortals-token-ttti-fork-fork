import Array "mo:core/Array";
import Int "mo:core/Int";
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

// PTM-1 liquidity-forming mint, PTM-10b locked share.
//
// Price (PTM-10b): the minter pays (10 000 USD + L) x q / 0.99 where L is the
// liquidity contributed per TTTI-T: 10 000 USD with choice #pool (A) or m x
// 10 000 USD with choice #wallet (B); m is the locked share of PTM-10a read at
// payment time (scale 10^6). m x q TTTI-T with m x 10 000 USD x q of the paid
// token are pooled and locked 3 months in the minter's name (m recorded with
// the position); (1 - m) is pooled too without lock (A) or stays in the minter's
// hand without its dollars (B). 10 000 USD x q always goes to the common
// reserve; 1 % of the payment goes to the creator.
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
    guaranteeAccount : GuaranteeTypes.GuaranteeAccountStore; // dedicated reserve account per token
    sale : SaleLib.SaleStore;
    ledger : IcrcLib.Ledger;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    secondRates : OracleLib.SecondRateStore; // PTM-10d: other feed's observation per paid token
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
    // PTM-10b: locked share m (scale 10^6) of PTM-10a at the given time.
    lockedShareE6 : Int -> Nat;
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

  // --- PTM-10d: pure checks (no state) -----------------------------------------

  // The two sources of the paid token's rate agree when they differ by at most
  // 2 % (200 bps), measured against the lower rate.
  public let MAX_SOURCE_DIFFERENCE_BPS : Nat = 200;

  // Difference in bps (rounded up) between two rates, measured against the
  // lower one, and whether it is within MAX_SOURCE_DIFFERENCE_BPS. A zero rate
  // never agrees.
  public func sourceAgreement(rateA : Nat, rateB : Nat) : { differenceBps : Nat; agree : Bool } {
    let low = Nat.min(rateA, rateB);
    let high = Nat.max(rateA, rateB);
    if (low == 0) return { differenceBps = BPS; agree = false };
    let scaled = Nat.sub(high, low) * BPS;
    { differenceBps = ceilDiv(scaled, low); agree = scaled <= MAX_SOURCE_DIFFERENCE_BPS * low };
  };

  // Verdict on the rate of the paid token at `now`: the rate itself must be
  // usable (existing freshness rule), the second source must exist, be fresh
  // by the same rule (fetchedAt + 1 h + 5 min) and agree within 2 %.
  // #rateUnavailable when the rate is not usable; #rateSourcesDiverge for a
  // missing, stale or diverging second source.
  public func rateSourcesVerdict(token : PayToken, price : OracleLib.TokenPrice, now : Int) : Result.Result<(), Err> {
    if (not price.usable) return #err(#rateUnavailable({ token }));
    var coinbase : ?Nat = null;
    var coingecko : ?Nat = null;
    switch (price.source) {
      case (#coinbase) { coinbase := ?price.usdE8 };
      case (#coingecko) { coingecko := ?price.usdE8 };
      case (#none) {};
    };
    switch (price.secondSource) {
      case (?o) {
        if (o.usdE8 > 0 and now <= o.fetchedAt + OracleLib.VALID_FOR_NS + OracleLib.GRACE_NS) {
          switch (o.source) {
            case (#coinbase) { if (coinbase == null) coinbase := ?o.usdE8 };
            case (#coingecko) { if (coingecko == null) coingecko := ?o.usdE8 };
            case (#none) {};
          };
        };
      };
      case null {};
    };
    switch (coinbase, coingecko) {
      case (?a, ?b) {
        let r = sourceAgreement(a, b);
        if (r.agree) return #ok(());
        #err(#rateSourcesDiverge({ token; coinbaseUsdE8 = coinbase; coingeckoUsdE8 = coingecko; differenceBps = ?r.differenceBps; maximumBps = MAX_SOURCE_DIFFERENCE_BPS }));
      };
      case _ {
        #err(#rateSourcesDiverge({ token; coinbaseUsdE8 = coinbase; coingeckoUsdE8 = coingecko; differenceBps = null; maximumBps = MAX_SOURCE_DIFFERENCE_BPS }));
      };
    };
  };

  // Balance sheet of a mint (PTM-10b, valid for both choices): what the payer
  // gave up (amount paid plus ledger fee) equals the 10 000 USD x q reserve,
  // the liquidity contributed (locked plus free counterpart, measured before
  // the zap), the fees (creator share and the rounding remainder) and the
  // ledger fee.
  public func mintPaymentBalanced(paid : Nat, reserve : Nat, contributed : Nat, fees : Nat, ledgerFee : Nat) : Bool {
    paid == reserve + contributed + fees + ledgerFee;
  };

  // PTM-10b: the contributed liquidity is the locked part plus the free part.
  public func mintContributionBalanced(lockedCounterpart : Nat, freeCounterpart : Nat, contributed : Nat) : Bool {
    lockedCounterpart + freeCounterpart == contributed;
  };

  // PTM-10b: the contributed liquidity of a choice. `full` = 10 000 USD x q in
  // the paid token (rounded down), m = locked share (scale 10^6). Choice #pool:
  // everything is pooled (locked part m x full rounded up, free part the rest).
  // Choice #wallet: only the locked part is contributed, nothing is free.
  public func mintContributionOk(choice : Types.RemainderChoice, full : Nat, mShareE6 : Nat, lockedCounterpart : Nat, freeCounterpart : Nat) : Bool {
    let locked = ceilDiv(mShareE6 * full, M_SCALE);
    switch (choice) {
      case (#pool) lockedCounterpart == locked and lockedCounterpart + freeCounterpart == full;
      case (#wallet) lockedCounterpart == locked and freeCounterpart == 0;
    };
  };

  // TTTI-T minted (plus any TTTI-T bought by the zap) equals the TTTI-T
  // deposited in the position, the TTTI-T left in the minter's hand and the
  // TTTI-T sold by the zap.
  public func mintTttiBalanced(minted : Nat, inPosition : Nat, inHand : Nat, zapSold : Nat, zapBought : Nat) : Bool {
    minted + zapBought == inPosition + inHand + zapSold;
  };

  // 10 000 USD per whole TTTI-T in the pool token's base units, at `rateUsdE8`
  // (`tokenUnit` = 10^decimals of the pool token). 0 without a rate.
  public func mintTargetTokenPerTtti(rateUsdE8 : Nat, tokenUnit : Nat) : Nat {
    if (rateUsdE8 == 0) 0 else TOKEN_PRICE_USD * 100_000_000 * tokenUnit / rateUsdE8;
  };

  // Rounding allowance of the direction check, in pool-token base units.
  public let DIRECTION_SLACK_UNITS : Nat = 16;

  // Direction of a mint on the targeted pool, from (reserve TTTI-T, reserve
  // token) before and after. The pool price is closer to the target, or equal,
  // and never passes it to the other side. A gap within `slackUnits` token base
  // units counts as being on the target (rounding); an empty pool before counts
  // as on the target.
  public func mintDirectionOk(before : (Nat, Nat), after : (Nat, Nat), targetTokenPerTtti : Nat, slackUnits : Nat) : Bool {
    func gap(r : (Nat, Nat)) : Int {
      let (rt, rp) = r;
      if (rt == 0 or rp == 0) return 0;
      let g : Int = (rp * 100_000_000).toInt() - (targetTokenPerTtti * rt).toInt();
      if (Int.abs(g) <= slackUnits * 100_000_000) 0 else g;
    };
    let b = gap(before);
    let a = gap(after);
    if (a == 0) return true;
    if (b == 0) return false;
    Int.abs(a) <= Int.abs(b) and ((a > 0) == (b > 0));
  };

  // --- Amounts ---------------------------------------------------------------

  public type Prepared = {
    token : PayToken;
    q : Nat;
    rateUsdE8 : Nat;
    validUntil : Int;
    payAmount : Nat;
    payUsdE8 : Nat;
    // PTM-10b: locked share m (scale 10^6) read when this was prepared, the
    // minter's choice for the share (1 - m) and how q is split.
    mShareE6 : Nat;
    choice : Types.RemainderChoice;
    lockedToken : Nat; // m x 10 000 USD x q, pooled and locked 3 months
    lockedTtti : Nat; // m x q
    pooledTtti : Nat; // TTTI-T pooled (q for #pool, m x q for #wallet)
    handTtti : Nat; // TTTI-T that stay in the hand (#wallet)
    positionToken : Nat; // token side pooled (locked + free)
    guarantee : Nat; // 10 000 USD x q: the common reserve
    creator : Nat;
    dust : Nat;
    ledgerFee : Nat;
    // PTM-11: conversion cost of the reserve part: always 0 (no conversion).
    conversionCost : Nat;
  };

  // PTM-10b: scale of the locked share m.
  public let M_SCALE : Nat = 1_000_000;

  // The liquidity factor (scale 10^6) of a choice: 10^6 for #pool (A), m for
  // #wallet (B). The amount paid is (10^6 + factor) x 10 000 USD x q / (10^6 x 0.99).
  public func liquidityFactorE6(choice : Types.RemainderChoice, mShareE6 : Nat) : Nat {
    switch (choice) {
      case (#pool) M_SCALE;
      case (#wallet) mShareE6;
    };
  };

  // PTM-10b: how a quantity q is split between the locked position, the free
  // position and the minter's hand. `full` is the token side of the whole
  // position (10 000 USD x q for the mint, B x q at an auction settlement),
  // rounded down. The locked part is rounded up (rounding favours the pool).
  public type Split = {
    lockedToken : Nat; // m x full, pooled and locked 3 months
    lockedTtti : Nat; // m x q
    pooledToken : Nat; // locked + free token side
    pooledTtti : Nat; // locked + free TTTI-T
    handTtti : Nat; // TTTI-T that stay in the hand (choice #wallet): q - pooledTtti
  };

  public func splitOf(choice : Types.RemainderChoice, mShareE6 : Nat, q : Nat, full : Nat) : Split {
    let lockedToken = Nat.min(ceilDiv(mShareE6 * full, M_SCALE), full);
    let lockedTtti = Nat.min(ceilDiv(mShareE6 * q, M_SCALE), q);
    switch (choice) {
      case (#pool) ({ lockedToken; lockedTtti; pooledToken = full; pooledTtti = q; handTtti = 0 });
      case (#wallet) ({ lockedToken; lockedTtti; pooledToken = lockedToken; pooledTtti = lockedTtti; handTtti = Nat.sub(q, lockedTtti) });
    };
  };

  public type MintAmounts = {
    payAmount : Nat;
    payUsdE8 : Nat;
    position : Nat; // token side pooled (locked + free), before the zap
    reserve : Nat; // 10 000 USD x q, rounded down: the common reserve
    creator : Nat;
    dust : Nat;
    split : Split;
  };

  // PTM-10b: pure amounts of a mint of `q` TTTI-T at `rateUsdE8` (token base
  // units, `dec` = 10^decimals), locked share `mShareE6` and `choice`:
  // (10 000 USD + L) x q / 0.99 paid (rounded up), L = 10 000 USD (#pool) or
  // m x 10 000 USD (#wallet); the reserve part 10 000 USD x q (rounded down);
  // the position (pooled counterpart) 10 000 USD x q (#pool) or m x 10 000 USD
  // x q (#wallet); the 1 % creator share of the amount paid; the remainder is
  // rounding dust.
  public func mintAmounts(q : Nat, rateUsdE8 : Nat, dec : Nat, mShareE6 : Nat, choice : Types.RemainderChoice) : MintAmounts {
    let factor = liquidityFactorE6(choice, mShareE6);
    let payAmount = ceilDiv(q * (M_SCALE + factor) * dec, 99 * rateUsdE8);
    let payUsdE8 = ceilDiv(q * (M_SCALE + factor), 99);
    let full = TOKEN_PRICE_USD * q * dec / rateUsdE8;
    let split = splitOf(choice, mShareE6, q, full);
    let creator = payAmount * CREATOR_BPS / BPS;
    let used = split.pooledToken + full + creator;
    { payAmount; payUsdE8; position = split.pooledToken; reserve = full; creator; dust = if (used > payAmount) 0 else payAmount - used; split };
  };

  // --- PTM-11: common reserve (pure) ----------------------------------------------

  // The reserve part (10 000 USD x q) is held in the paid token itself: no
  // token is converted, for any of ICP, ckBTC, ckUSDC and ckUSDT.
  public func reserveConverts(_token : PayToken) : Bool = false;

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

  // PTM-10b: locked share m at `now` (PTM-10a), never above its maximum.
  public func shareNow(ctx : MintContext, now : Int) : Nat {
    Nat.min(ctx.lockedShareE6(now), DexLib.LOCKED_SHARE_MAX);
  };

  // PTM-10b: the Prepared record of q TTTI-T at a rate, with the split of choice.
  func preparedWith(token : PayToken, q : Nat, rateUsdE8 : Nat, validUntil : Int, mShareE6 : Nat, choice : Types.RemainderChoice) : Prepared {
    let m = mintAmounts(q, rateUsdE8, pow10(PayTokenLib.expectedDecimals(token)), mShareE6, choice);
    {
      token;
      q;
      rateUsdE8;
      validUntil;
      payAmount = m.payAmount;
      payUsdE8 = m.payUsdE8;
      mShareE6;
      choice;
      lockedToken = m.split.lockedToken;
      lockedTtti = m.split.lockedTtti;
      pooledTtti = m.split.pooledTtti;
      handTtti = m.split.handTtti;
      positionToken = m.position;
      guarantee = m.reserve;
      creator = m.creator;
      dust = m.dust;
      ledgerFee = PayTokenLib.expectedFee(token);
      conversionCost = 0;
    };
  };

  func prepare(ctx : MintContext, token : PayToken, quantity : Types.MintAmount, choice : Types.RemainderChoice, now : Int) : Result.Result<Prepared, Err> {
    if (ctx.sale.salesPaused) return #err(#salesPaused);
    if (ctx.dex.pause.paused) return #err(#dexPaused);
    // PTM-9b: the mint is over when what remains to mint is below the minimum
    // of one mint; that remainder joins the first auction lot.
    if (IcrcLib.mintableRemaining(ctx.ledger) < MIN_MINT_TTTI) return #err(#mintEnded);
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), ctx.secondRates, token, now);
    // PTM-10d: fresh rate confirmed by the second source, before anything is taken.
    switch (rateSourcesVerdict(token, price, now)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    let q = switch (quantity) {
      case (#ttti(qty)) {
        switch (parseQuantity(qty)) {
          case (#ok(n)) n;
          case (#err(e)) return #err(e);
        };
      };
      case (#usd(usdE8)) usdE8 * 99 / (M_SCALE + liquidityFactorE6(choice, shareNow(ctx, now)));
    };
    if (q < MIN_MINT_TTTI) {
      return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = q }));
    };
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    let returned : Nat = 0; // PTM-9b: transfer fees belong to the creator, never to buyers
    if (q > CAP_TTTI or q > avail) {
      return #err(#aboveCap({ capTtti = CAP_TTTI; remainingTtti = Nat.min(avail, CAP_TTTI); requestedTtti = q; soldTtti = ctx.sale.sold; returnedToContractTtti = returned }));
    };
    let rate = price.usdE8;
    let p = preparedWith(token, q, rate, price.validUntil, shareNow(ctx, now), choice);
    let used = p.positionToken + p.guarantee + p.creator;
    // Nothing pooled is legitimate only for choice #wallet with m = 0; TTTI-T is never pooled without dollars.
    if (p.guarantee == 0 or used > p.payAmount or (p.pooledTtti > 0 and p.positionToken == 0) or (p.pooledTtti == 0 and p.positionToken > 0)) return #err(#invalidAmount);
    if (p.positionToken == 0 and p.choice == #pool) return #err(#invalidAmount);
    #ok(p);
  };

  // --- Pool plan (pure) ------------------------------------------------------

  public type Plan = {
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

  // --- Target pool selection -----------------------------------------------------

  // True when the pool is a TTTI-T/<token> pool.
  func isPairPool(pool : DexTypes.Pool, want : DexToken) : Bool {
    switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
      case (?t0, ?t1) (t0 == #tttiT and t1 == want) or (t1 == #tttiT and t0 == want);
      case _ false;
    };
  };

  // Effective date of an announced or executing removal of the pool, if any.
  func removalOf(dex : DexTypes.DexStore, poolId : DexTypes.PoolId) : ?Int {
    switch (dex.removals.get(poolId)) {
      case (?r) {
        switch (r.state) {
          case (#announced) ?r.effectiveAt;
          case (#executing(_)) ?r.effectiveAt;
          case _ null;
        };
      };
      case null null;
    };
  };

  func isRemoved(pool : DexTypes.Pool) : Bool = pool.status == #removed or pool.removedAt != null;

  // Pools of the pair TTTI-T/<token> that can take a mint: not removed and no
  // removal announced. Ascending pool id.
  public func eligiblePools(dex : DexTypes.DexStore, token : PayToken) : [DexTypes.Pool] {
    let want = dexOf(token);
    dex.pools.values().filter(
      func(pool : DexTypes.Pool) : Bool = isPairPool(pool, want) and not isRemoved(pool) and removalOf(dex, pool.id) == null
    ).toArray();
  };

  // Liquidity used to rank the pools (USD e8); a missing rate counts as 0.
  func depthOf(rates : DexLib.UsdRateOf, pool : DexTypes.Pool) : Nat {
    switch (DexLib.poolDepth(pool, rates).usdE8) {
      case (?v) v;
      case null 0;
    };
  };

  // The backend recommendation: the eligible pool with the lowest liquidity
  // (the lowest pool id on a tie); null when none is eligible.
  public func recommendedPool(dex : DexTypes.DexStore, rates : DexLib.UsdRateOf, token : PayToken) : ?DexTypes.Pool {
    var best : ?(DexTypes.Pool, Nat) = null;
    for (pool in eligiblePools(dex, token).values()) {
      let depth = depthOf(rates, pool);
      switch (best) {
        case (?(_, b)) { if (depth < b) best := ?(pool, depth) };
        case null { best := ?(pool, depth) };
      };
    };
    switch (best) {
      case (?(pool, _)) ?pool;
      case null null;
    };
  };

  // The pool a mint lands in. With a chosen pool it must exist, belong to the
  // TTTI-T/<token> pair, not be removed and have no removal announced; otherwise
  // #invalidTargetPool with the precise reason. Without one, the recommendation.
  public func selectPool(dex : DexTypes.DexStore, rates : DexLib.UsdRateOf, token : PayToken, target : ?DexTypes.PoolId) : Result.Result<DexTypes.Pool, Err> {
    switch (target) {
      case (?id) {
        let pool = switch (dex.pools.get(id)) {
          case (?pl) pl;
          case null return #err(#invalidTargetPool({ poolId = id; reason = #unknownPool }));
        };
        if (not isPairPool(pool, dexOf(token))) return #err(#invalidTargetPool({ poolId = id; reason = #otherPair }));
        if (isRemoved(pool)) return #err(#invalidTargetPool({ poolId = id; reason = #removed }));
        switch (removalOf(dex, id)) {
          case (?effectiveAt) return #err(#invalidTargetPool({ poolId = id; reason = #removalAnnounced({ effectiveAt }) }));
          case null {};
        };
        #ok(pool);
      };
      case null {
        switch (recommendedPool(dex, rates, token)) {
          case (?pool) #ok(pool);
          case null {
            // Nothing eligible: say why (announced removal, removed pool, or no pool).
            let want = dexOf(token);
            var announced : ?Int = null;
            var removed = false;
            for (pool in dex.pools.values()) {
              if (isPairPool(pool, want)) {
                if (isRemoved(pool)) removed := true else {
                  switch (removalOf(dex, pool.id)) {
                    case (?e) { announced := ?e };
                    case null {};
                  };
                };
              };
            };
            switch (announced) {
              case (?effectiveAt) #err(#removalAnnounced({ effectiveAt }));
              case null #err(if (removed) #poolRemoved else #poolNotFound({ token }));
            };
          };
        };
      };
    };
  };

  func planFor(ctx : MintContext, p : Prepared, target : ?DexTypes.PoolId, now : Int) : Result.Result<Plan, Err> {
    let want = dexOf(p.token);
    let pool = switch (selectPool(ctx.dex.dex, rateOf(ctx), p.token, target)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let tttiIs0 = pool.token0.ledger == #internal;
    let dec = pow10(PayTokenLib.expectedDecimals(p.token));
    let depositToken = p.positionToken + p.dust;
    let (rt, rp) = reservesOf(pool, tttiIs0);
    let before = priceOf(rt, rp, p.rateUsdE8, dec);
    let tttiSide : DexTypes.PoolSide = if (tttiIs0) #token0 else #token1;
    // PTM-10b: choice #wallet with m = 0 pools nothing (the pool is left untouched).
    if (p.pooledTtti == 0) {
      return #ok({ pool; tttiIs0; first = false; zap = null; shares = 0; before; after = before });
    };
    let first = pool.totalShares == 0;
    let quoted = DexLib.quoteAddLiquidity(
      ctx.dex.dex,
      { poolId = pool.id; side = tttiSide; amount = p.pooledTtti; counterAmount = if (first) ?depositToken else null; slippageBps = null },
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
        after = priceOf(p.pooledTtti, depositToken, p.rateUsdE8, dec);
      });
    };
    if (rt == 0 or rp == 0) return #err(#poolUnavailable({ message = "The pool has an empty side" }));
    let bps = DexLib.feeBps(pool.feeTier);
    var rt2 = rt;
    var rp2 = rp;
    var a = p.pooledTtti;
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
    // PTM-10b: the locked part must itself create shares.
    if (p.lockedTtti > 0 and shares * p.lockedTtti / p.pooledTtti == 0) {
      return #err(#poolUnavailable({ message = "The locked part of the deposit would create no shares" }));
    };
    #ok({ pool; tttiIs0; first; zap; shares; before; after = priceOf(rt2 + dT, rp2 + dP, p.rateUsdE8, dec) });
  };

  func toMintPrice(c : DexLib.ConsolidatedNow) : Types.ConsolidatedMintPrice {
    switch (c.price, c.unavailable) {
      case (?price, _) #available(price);
      case (null, ?u) #unavailable(u);
      case (null, null) #unavailable(#noOpenPool);
    };
  };

  // Independent reference of the targeted pool: the consolidated TTTI-T price
  // of the OTHER open native pools (current oracle rates, depth-weighted), so
  // neither the pool's current reserves nor its after-zap reserves influence it.
  // #unavailable when no other pool is open (never a trap, never a gap of 0).
  func referenceExcluding(ctx : MintContext, poolId : DexTypes.PoolId, now : Int) : Types.ConsolidatedMintPrice {
    toMintPrice(DexLib.consolidatedExcluding(ctx.dex.dex, rateOf(ctx), now, poolId));
  };

  // PTM-5: reference price before the operation and after zap + deposit of
  // `plan`. The reference excludes the targeted pool, and the mint touches no
  // other pool, so it is the same before and after: both are returned for the
  // two blocks of the preview.
  func consolidatedAround(ctx : MintContext, plan : Plan, now : Int) : (Types.ConsolidatedMintPrice, Types.ConsolidatedMintPrice) {
    let reference = referenceExcluding(ctx, plan.pool.id, now);
    (reference, reference);
  };

  func isUnavailable(c : Types.ConsolidatedMintPrice) : Bool = switch (c) {
    case (#unavailable(_)) true;
    case (#available(_)) false;
  };

  // --- Quote -----------------------------------------------------------------

  // Quote (query): rate, split, target pool, prices before / after the zap.
  // Rounding favors the pool: pay rounded up, position / guarantee / creator
  // rounded down. Cannot check wallet or allowance (a query has no ledger call).
  type ReservePlan = {
    applies : Bool;
    reserveToken : PayToken;
    reserveAmount : Nat;
    input : Nat; // always 0: nothing is swapped for the reserve
    cost : Nat; // always 0: nothing is added to the payment
  };

  // PTM-11: the reserve part of `p` is kept in the paid token: no conversion,
  // no native pool, no deviation check.
  func planReserve(_ctx : MintContext, p : Prepared, _now : Int) : Result.Result<ReservePlan, Err> {
    #ok({ applies = false; reserveToken = p.token; reserveAmount = p.guarantee; input = 0; cost = 0 });
  };

  func quoteOfPlan(r : ReservePlan) : Types.ReserveConversionQuote {
    {
      applies = r.applies;
      reserveToken = r.reserveToken;
      reserveAmount = r.reserveAmount;
      conversionInput = r.input;
      conversionCost = r.cost;
      route = null;
      maxDeviationBps = 0;
    };
  };

  // PTM-11: where the reserve part of a mint goes: the paid token itself
  // (ICP, ckBTC, ckUSDC or ckUSDT), credited as is, no conversion, no cost.
  public func reserveConversionQuote(_ctx : MintContext, p : Prepared, _now : Int) : Types.ReserveConversionQuote {
    quoteOfPlan({ applies = false; reserveToken = p.token; reserveAmount = p.guarantee; input = 0; cost = 0 });
  };

  // PTM-11: inside the isolated core, moves the reserve part (10 000 USD x q in
  // the paid token) from the payer's internal balance to the contract and
  // credits it to the common reserve (guarantee account) in the same token.
  // Traps on any refusal so that the whole mint is undone.
  func creditReserve(ctx : MintContext, payer : Principal, p : Prepared) : { reserveToken : PayToken; reserveAmount : Nat; cost : Nat } {
    let want = dexOf(p.token);
    if (not DexLib.debit(ctx.dex.balances, payer, want, p.guarantee)) refuse("Insufficient internal balance for the reserve");
    DexLib.credit(ctx.dex.balances, ctx.canister, want, p.guarantee);
    GuaranteeLib.creditAccount(ctx.guaranteeAccount, p.token, p.guarantee);
    { reserveToken = p.token; reserveAmount = p.guarantee; cost = 0 };
  };

  // PTM-10b: the figures of one choice (pure).
  public func figuresOf(p : Prepared, conversionCost : Nat) : Types.MintChoiceFigures {
    {
      choice = p.choice;
      payAmount = p.payAmount;
      payUsdE8 = p.payUsdE8;
      totalPayAmount = p.payAmount + conversionCost;
      conversionCost;
      liquidityUsdE8 = TOKEN_PRICE_USD * p.q * liquidityFactorE6(p.choice, p.mShareE6) / M_SCALE;
      pooledTokenAmount = p.positionToken;
      pooledTttiAmount = p.pooledTtti;
      lockedTokenAmount = p.lockedToken;
      lockedTttiAmount = p.lockedTtti;
      freeTokenAmount = Nat.sub(p.positionToken, p.lockedToken);
      freeTttiAmount = Nat.sub(p.pooledTtti, p.lockedTtti);
      handTttiAmount = p.handTtti;
      creatorAmount = p.creator;
      dustAmount = p.dust;
    };
  };

  func otherChoice(c : Types.RemainderChoice) : Types.RemainderChoice {
    switch (c) {
      case (#pool) #wallet;
      case (#wallet) #pool;
    };
  };

  public func quote(ctx : MintContext, args : Types.QuoteArgs, now : Int) : Result.Result<Types.LiquidityMintQuote, Types.LiquidityMintError> {
    let p = switch (prepare(ctx, args.token, args.amount, args.choice, now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    let plan = switch (planFor(ctx, p, args.targetPoolId, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let (consolidatedPriceBefore, consolidatedPriceAfter) = consolidatedAround(ctx, plan, now);
    // PTM-11: the reserve part stays in the paid token (never refused).
    let reserve = switch (planReserve(ctx, p, now)) {
      case (#ok(r)) quoteOfPlan(r);
      case (#err(e)) return #err(e);
    };
    // PTM-10b: both choices for the same q and the same m (the conversion cost
    // depends only on the 10 000 USD x q reserve part, so it is the same).
    let other = preparedWith(p.token, p.q, p.rateUsdE8, p.validUntil, p.mShareE6, otherChoice(p.choice));
    let mine = figuresOf(p, reserve.conversionCost);
    let theirs = figuresOf(other, reserve.conversionCost);
    let choices = switch (p.choice) {
      case (#pool) ({ pool = mine; wallet = theirs });
      case (#wallet) ({ pool = theirs; wallet = mine });
    };
    #ok({
      token = p.token;
      mShareE6 = p.mShareE6;
      choice = p.choice;
      choices;
      handTttiAmount = p.handTtti;
      lockedTokenAmount = p.lockedToken;
      lockedTttiAmount = p.lockedTtti;
      tttiAmount = p.q;
      rateUsdE8 = p.rateUsdE8;
      rateValidUntil = p.validUntil;
      payAmount = p.payAmount;
      payUsdE8 = p.payUsdE8;
      positionTokenAmount = p.positionToken;
      positionTttiAmount = p.pooledTtti;
      guaranteeAmount = p.guarantee;
      reserve;
      totalPayAmount = p.payAmount + reserve.conversionCost;
      creatorAmount = p.creator;
      dustAmount = p.dust;
      ledgerFee = p.ledgerFee;
      poolId = plan.pool.id;
      firstDeposit = plan.first;
      priceBefore = plan.before;
      priceAfter = plan.after;
      consolidatedPriceBefore;
      consolidatedPriceAfter;
      noIndependentReference = isUnavailable(consolidatedPriceBefore);
      zap = plan.zap;
      shares = plan.shares;
      quotedAt = now;
    });
  };

  // --- Manual choice of the target pool: list and preview ---------------------------

  func consolidatedNowOf(ctx : MintContext, now : Int) : Types.ConsolidatedMintPrice {
    toMintPrice(DexLib.consolidatedNow(ctx.dex.dex, rateOf(ctx), now));
  };

  // Signed gap in bps of a pool price (USD e8 per TTTI-T) against the
  // independent reference (consolidated price without that pool):
  // (pool - reference) x 10 000 / reference.
  func gapBps(poolUsd : ?Nat, consolidated : Types.ConsolidatedMintPrice) : ?Int {
    switch (poolUsd, consolidated) {
      case (?u, #available(c)) {
        if (c == 0) return null;
        let pool : Int = u;
        let reference : Int = c;
        ?((pool - reference) * 10_000 / reference);
      };
      case _ null;
    };
  };

  // Every eligible TTTI-T/<token> pool, the recommended one first, then by pool id.
  public func listMintPools(ctx : MintContext, token : PayToken, now : Int) : Types.MintPoolList {
    let consolidated = consolidatedNowOf(ctx, now);
    let price = tokenPriceOf(ctx, token, now);
    let dec = pow10(PayTokenLib.expectedDecimals(token));
    let rates = rateOf(ctx);
    let recommendedId : ?DexTypes.PoolId = switch (recommendedPool(ctx.dex.dex, rates, token)) {
      case (?pool) ?pool.id;
      case null null;
    };
    func optionOf(pool : DexTypes.Pool) : Types.MintPoolOption {
      let tttiIs0 = pool.token0.ledger == #internal;
      let (rt, rp) = reservesOf(pool, tttiIs0);
      let raw = priceOf(rt, rp, price.usdE8, dec);
      let poolPrice = if (price.usable) raw else ({ raw with usdPerTtti = null });
      // The gap is measured against the consolidated price of the other pools.
      let reference = referenceExcluding(ctx, pool.id, now);
      {
        poolId = pool.id;
        feeBps = DexLib.feeBps(pool.feeTier);
        depthUsdE8 = DexLib.poolDepth(pool, rates).usdE8;
        price = poolPrice;
        gapBps = gapBps(poolPrice.usdPerTtti, reference);
        referencePrice = reference;
        noIndependentReference = isUnavailable(reference);
        recommended = ?pool.id == recommendedId;
      };
    };
    let eligible = eligiblePools(ctx.dex.dex, token).map(optionOf);
    let first = eligible.filter(func(o : Types.MintPoolOption) : Bool = o.recommended);
    let rest = eligible.filter(func(o : Types.MintPoolOption) : Bool = not o.recommended);
    {
      token;
      pools = first.concat(rest);
      recommendedPoolId = recommendedId;
      consolidatedPrice = consolidated;
      computedAt = now;
    };
  };

  // Pool price before and after the zap for the chosen pool (null = the
  // recommendation), with the signed gaps against the independent reference.
  public func mintPoolPreview(ctx : MintContext, args : Types.QuoteArgs, now : Int) : Result.Result<Types.MintPoolPreview, Err> {
    let p = switch (prepare(ctx, args.token, args.amount, args.choice, now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    let plan = switch (planFor(ctx, p, args.targetPoolId, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let (consolidatedPriceBefore, consolidatedPriceAfter) = consolidatedAround(ctx, plan, now);
    let recommendedId : ?DexTypes.PoolId = switch (recommendedPool(ctx.dex.dex, rateOf(ctx), p.token)) {
      case (?pool) ?pool.id;
      case null null;
    };
    #ok({
      token = p.token;
      poolId = plan.pool.id;
      feeBps = DexLib.feeBps(plan.pool.feeTier);
      isRecommended = recommendedId == ?plan.pool.id;
      recommendedPoolId = recommendedId;
      tttiAmount = p.q;
      priceBefore = plan.before;
      priceAfter = plan.after;
      consolidatedPriceBefore;
      consolidatedPriceAfter;
      gapBeforeBps = gapBps(plan.before.usdPerTtti, consolidatedPriceBefore);
      gapAfterBps = gapBps(plan.after.usdPerTtti, consolidatedPriceAfter);
      noIndependentReference = isUnavailable(consolidatedPriceBefore);
      zap = plan.zap;
      firstDeposit = plan.first;
      quotedAt = now;
    });
  };

  // --- PTM-11c: mint price figures ------------------------------------------------
  // Every amount the screens show about the mint price comes from here. The
  // rounding is the mint's own (mintAmounts): (10 000 USD + L) x q / 0.99
  // rounded up in favour of the pool (L = 10 000 USD for #pool, m x 10 000 USD
  // for #wallet); the conversion cost is the one quote() reports.

  // Cost in USD (e8) of 100 USD of value at the 1/0.99 rule: 101.01 USD, rounded up.
  public func costPer100UsdE8() : Nat = ceilDiv(100 * 100_000_000 * 100, 99);

  // Full mint price of q TTTI-T in USD (e8): (10 000 USD + L) x q / 0.99,
  // rounded up (L per choice, m = locked share, scale 10^6).
  public func usdForTtti(q : Nat, choice : Types.RemainderChoice, mShareE6 : Nat) : Nat = ceilDiv(q * (M_SCALE + liquidityFactorE6(choice, mShareE6)), 99);

  // Amount paid in a token (base units, `dec` = 10^decimals) for q TTTI-T,
  // before any conversion cost; rounded up. 0 without a rate.
  public func payForTtti(q : Nat, rateUsdE8 : Nat, dec : Nat, choice : Types.RemainderChoice, mShareE6 : Nat) : Nat {
    if (rateUsdE8 == 0) 0 else ceilDiv(q * (M_SCALE + liquidityFactorE6(choice, mShareE6)) * dec, 99 * rateUsdE8);
  };

  // Largest q (base units) with payForTtti(q) <= payAmount. Rounded down, so
  // the minter never gets more than paid for. 0 without a rate.
  public func tttiForPayment(payAmount : Nat, rateUsdE8 : Nat, dec : Nat, choice : Types.RemainderChoice, mShareE6 : Nat) : Nat {
    if (dec == 0) 0 else 99 * rateUsdE8 * payAmount / ((M_SCALE + liquidityFactorE6(choice, mShareE6)) * dec);
  };

  // Conversion cost of the reserve part for q TTTI-T, as quote() reports it.
  func conversionCostFor(ctx : MintContext, token : PayToken, q : Nat, rateUsdE8 : Nat, validUntil : Int, now : Int) : Result.Result<Nat, Err> {
    // The cost depends only on the reserve part (10 000 USD x q): any choice gives the same.
    switch (planReserve(ctx, preparedWith(token, q, rateUsdE8, validUntil, shareNow(ctx, now), #pool), now)) {
      case (#ok(r)) #ok(r.cost);
      case (#err(e)) #err(e);
    };
  };

  // The refusals every mint shares before it looks at the amount.
  func mintGate(ctx : MintContext) : ?Err {
    if (ctx.sale.salesPaused) return ?#salesPaused;
    if (ctx.dex.pause.paused) return ?#dexPaused;
    if (IcrcLib.mintableRemaining(ctx.ledger) < MIN_MINT_TTTI) return ?#mintEnded;
    null;
  };

  func tokenPriceOf(ctx : MintContext, token : PayToken, now : Int) : OracleLib.TokenPrice {
    OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), ctx.secondRates, token, now);
  };

  // The price figures of one pay token: all null when the mint would refuse the
  // rate (absent, expired, second source missing or diverging); never a fallback.
  func mintTokenPrice(ctx : MintContext, token : PayToken, now : Int, mShareE6 : Nat) : Types.MintTokenPrice {
    let price = tokenPriceOf(ctx, token, now);
    switch (rateSourcesVerdict(token, price, now)) {
      case (#err(_)) {
        {
          token;
          rateUsdE8 = null;
          rateValidUntil = null;
          payAmountPerTtti = null;
          conversionCostPerTtti = null;
          totalPayAmountPerTtti = null;
          minimumPayAmount = null;
          minimumConversionCost = null;
          minimumTotalPayAmount = null;
          walletPayAmountPerTtti = null;
          walletTotalPayAmountPerTtti = null;
          walletMinimumPayAmount = null;
          walletMinimumTotalPayAmount = null;
        };
      };
      case (#ok(_)) {
        let dec = pow10(PayTokenLib.expectedDecimals(token));
        let rate = price.usdE8;
        let wholePay = payForTtti(CAP_TTTI, rate, dec, #pool, mShareE6);
        let minPay = payForTtti(MIN_MINT_TTTI, rate, dec, #pool, mShareE6);
        let wholePayB = payForTtti(CAP_TTTI, rate, dec, #wallet, mShareE6);
        let minPayB = payForTtti(MIN_MINT_TTTI, rate, dec, #wallet, mShareE6);
        let wholeCost = switch (conversionCostFor(ctx, token, CAP_TTTI, rate, price.validUntil, now)) {
          case (#ok(c)) ?c;
          case (#err(_)) null;
        };
        let minCost = switch (conversionCostFor(ctx, token, MIN_MINT_TTTI, rate, price.validUntil, now)) {
          case (#ok(c)) ?c;
          case (#err(_)) null;
        };
        {
          token;
          rateUsdE8 = ?rate;
          rateValidUntil = ?price.validUntil;
          payAmountPerTtti = ?wholePay;
          conversionCostPerTtti = wholeCost;
          totalPayAmountPerTtti = switch (wholeCost) { case (?c) ?(wholePay + c); case null null };
          minimumPayAmount = ?minPay;
          minimumConversionCost = minCost;
          minimumTotalPayAmount = switch (minCost) { case (?c) ?(minPay + c); case null null };
          walletPayAmountPerTtti = ?wholePayB;
          walletTotalPayAmountPerTtti = switch (wholeCost) { case (?c) ?(wholePayB + c); case null null };
          walletMinimumPayAmount = ?minPayB;
          walletMinimumTotalPayAmount = switch (minCost) { case (?c) ?(minPayB + c); case null null };
        };
      };
    };
  };

  public func mintPricePreview(ctx : MintContext, now : Int) : Types.MintPricePreview {
    let m = shareNow(ctx, now);
    {
      mShareE6 = m;
      pricePerTttiWalletUsdE8 = usdForTtti(CAP_TTTI, #wallet, m);
      minimumMintWalletUsdE8 = usdForTtti(MIN_MINT_TTTI, #wallet, m);
      mintCostPer100UsdE8 = costPer100UsdE8();
      prepaidRedemptionCostPer100UsdE8 = costPer100UsdE8();
      pricePerTttiUsdE8 = usdForTtti(CAP_TTTI, #pool, m);
      minimumTtti = MIN_MINT_TTTI;
      minimumMintUsdE8 = usdForTtti(MIN_MINT_TTTI, #pool, m);
      tokens = [
        mintTokenPrice(ctx, #icp, now, m),
        mintTokenPrice(ctx, #ckbtc, now, m),
        mintTokenPrice(ctx, #ckusdc, now, m),
        mintTokenPrice(ctx, #ckusdt, now, m),
      ];
      computedAt = now;
    };
  };

  // The pay-token amount for a TTTI-T amount, with the refusals of the mint.
  public func payAmountForTtti(ctx : MintContext, args : Types.TttiToPayArgs, now : Int) : Result.Result<Types.TttiToPay, Err> {
    switch (mintGate(ctx)) {
      case (?e) return #err(e);
      case null {};
    };
    let price = tokenPriceOf(ctx, args.token, now);
    switch (rateSourcesVerdict(args.token, price, now)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    switch (args.targetPoolId) {
      case (?_) {
        switch (selectPool(ctx.dex.dex, rateOf(ctx), args.token, args.targetPoolId)) {
          case (#err(e)) return #err(e);
          case (#ok(_)) {};
        };
      };
      case null {};
    };
    let q = args.tttiAmount;
    if (q < MIN_MINT_TTTI) {
      return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = q }));
    };
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    if (q > CAP_TTTI or q > avail) {
      return #err(#aboveCap({ capTtti = CAP_TTTI; remainingTtti = Nat.min(avail, CAP_TTTI); requestedTtti = q; soldTtti = ctx.sale.sold; returnedToContractTtti = 0 }));
    };
    let dec = pow10(PayTokenLib.expectedDecimals(args.token));
    let m = shareNow(ctx, now);
    let pay = payForTtti(q, price.usdE8, dec, args.choice, m);
    let cost = switch (conversionCostFor(ctx, args.token, q, price.usdE8, price.validUntil, now)) {
      case (#ok(c)) c;
      case (#err(e)) return #err(e);
    };
    #ok({
      token = args.token;
      choice = args.choice;
      mShareE6 = m;
      tttiAmount = q;
      payAmount = pay;
      payUsdE8 = usdForTtti(q, args.choice, m);
      conversionCost = cost;
      totalPayAmount = pay + cost;
      rateUsdE8 = price.usdE8;
      rateValidUntil = price.validUntil;
    });
  };

  // Maximum number of passes that lower q until payment + conversion cost fits.
  let FIT_PASSES : Nat = 24;

  // The largest q whose total (amount paid + conversion cost) does not exceed
  // the payment. q is also bounded by the TTTI-T still available to mint.
  public func mintAmountForPayment(ctx : MintContext, args : Types.PaymentToMintArgs, now : Int) : Result.Result<Types.PaymentToMint, Err> {
    switch (mintGate(ctx)) {
      case (?e) return #err(e);
      case null {};
    };
    let price = tokenPriceOf(ctx, args.token, now);
    switch (rateSourcesVerdict(args.token, price, now)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    switch (args.targetPoolId) {
      case (?_) {
        switch (selectPool(ctx.dex.dex, rateOf(ctx), args.token, args.targetPoolId)) {
          case (#err(e)) return #err(e);
          case (#ok(_)) {};
        };
      };
      case null {};
    };
    let dec = pow10(PayTokenLib.expectedDecimals(args.token));
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    let m = shareNow(ctx, now);
    var q = Nat.min(tttiForPayment(args.payAmount, price.usdE8, dec, args.choice, m), Nat.min(CAP_TTTI, avail));
    var pass = 0;
    while (pass < FIT_PASSES) {
      if (q < MIN_MINT_TTTI) {
        return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = q }));
      };
      let pay = payForTtti(q, price.usdE8, dec, args.choice, m);
      let cost = switch (conversionCostFor(ctx, args.token, q, price.usdE8, price.validUntil, now)) {
        case (#ok(c)) c;
        case (#err(e)) return #err(e);
      };
      let total = pay + cost;
      if (total <= args.payAmount) {
        return #ok({
          token = args.token;
          choice = args.choice;
          mShareE6 = m;
          payAmountGiven = args.payAmount;
          tttiAmount = q;
          payAmount = pay;
          payUsdE8 = usdForTtti(q, args.choice, m);
          conversionCost = cost;
          totalPayAmount = total;
          rateUsdE8 = price.usdE8;
          rateValidUntil = price.validUntil;
        });
      };
      pass += 1;
      q := q * args.payAmount / total;
    };
    #err(#reserveConversionFailed({ message = "The payment could not be fitted to the requested amount" }));
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
        case null {
          // Held without a stamp (raw add elsewhere): stamp it now so it
          // expires after LOCK_TTL_NS instead of blocking retries forever.
          times.add(key, now);
          return null;
        };
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
    // The pool resolved at planning time; the core validates it again.
    targetPoolId : ?Types.PoolId;
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
      case (#rateUnavailable(r)) "The " # PayTokenLib.symbol(r.token) # " rate is not fresh; nothing was taken";
      case (#rateSourcesDiverge(r)) "The " # PayTokenLib.symbol(r.token) # " rate is not confirmed by both Coinbase and CoinGecko within " # r.maximumBps.toText() # " bps (difference " # (switch (r.differenceBps) { case (?d) d.toText() # " bps"; case null "unknown, a source is missing" }) # "); nothing was taken";
      case (#reserveConversionFailed(m)) m.message;
      case (#reserveConversionDeviation(d)) "The reserve conversion deviates " # d.deviationBps.toText() # " bps from the hourly average, above " # d.maximumBps.toText() # " bps; nothing was taken";
      case (#poolNotFound(_)) "Pool not found";
      case (#poolRemoved) "The pool was removed";
      case (#invalidTargetPool(t)) {
        "The chosen pool " # t.poolId.toText() # " cannot take the mint: " # (
          switch (t.reason) {
            case (#unknownPool) "it does not exist";
            case (#otherPair) "it is not a TTTI-T pool of the paid token";
            case (#removed) "it was removed";
            case (#removalAnnounced(_)) "its removal is announced";
          }
        );
      };
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

  // PTM-10b: the pooled deposit of a mint or of an auction settlement, after
  // the zap: x TTTI-T and y paid-token units are in the minter's balances. The
  // deposit is chosen at the pool ratio (as before) and split between the
  // locked position (m, 3 months, in the minter's name) and the free one, each
  // fraction entering with its own dollars. Traps on any refusal.
  public type Deposited = {
    lockedId : ?Nat;
    freeId : ?Nat;
    shares : Nat;
    tttiDeposited : Nat;
  };

  public func depositParts(ctx : MintContext, payer : Principal, plan : Plan, x : Nat, y : Nat, lockedTtti : Nat, pooledTtti : Nat, mShareE6 : Nat, slippage : Nat, now : Int) : Deposited {
    let balances = ctx.dex.balances;
    let usd = rateOf(ctx);
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
    let lockedAmount = if (lockedTtti == 0 or pooledTtti == 0) 0 else Nat.min(amount, ceilDiv(amount * lockedTtti, pooledTtti));
    let lockedCounter = if (lockedTtti == 0 or pooledTtti == 0) 0 else Nat.min(counter, ceilDiv(counter * lockedTtti, pooledTtti));
    if (lockedTtti > 0 and (lockedAmount == 0 or lockedCounter == 0)) refuse("The locked part of the deposit is empty");
    var first = plan.first;
    var shares = 0;
    var tttiDeposited = 0;
    var lockedId : ?Nat = null;
    var freeId : ?Nat = null;
    // The locked part first (it creates the pool when this is the first deposit).
    if (lockedAmount > 0) {
      let args : DexTypes.AddLiquidityArgs = {
        poolId = pool.id;
        side;
        amount = lockedAmount;
        counterAmount = if (first) ?lockedCounter else null;
        slippageBps = ?slippage;
        lockDurationNs = ?DexLib.MIN_LOCK_NS;
      };
      switch (DexLib.addLiquidityShare(ctx.dex.dex, balances, ctx.canister, payer, false, args, usd, now, false, mShareE6)) {
        case (#ok(r)) {
          shares += r.shares;
          tttiDeposited += if (plan.tttiIs0) r.amount0 else r.amount1;
          lockedId := ?r.position.id;
        };
        case (#err(e)) refuse("The locked liquidity deposit was refused: " # debug_show e);
      };
      first := false;
    };
    let freeAmount = Nat.sub(amount, lockedAmount);
    let freeCounter = Nat.sub(counter, lockedCounter);
    if (freeAmount > 0) {
      let args : DexTypes.AddLiquidityArgs = {
        poolId = pool.id;
        side;
        amount = freeAmount;
        counterAmount = if (first) ?freeCounter else null;
        slippageBps = ?slippage;
        lockDurationNs = null;
      };
      switch (DexLib.addLiquidityShare(ctx.dex.dex, balances, ctx.canister, payer, false, args, usd, now, false, mShareE6)) {
        case (#ok(r)) {
          shares += r.shares;
          tttiDeposited += if (plan.tttiIs0) r.amount0 else r.amount1;
          freeId := ?r.position.id;
        };
        case (#err(e)) refuse("The liquidity deposit was refused: " # debug_show e);
      };
    };
    { lockedId; freeId; shares; tttiDeposited };
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
    // PTM-10d: the paid token's rate is fresh and confirmed by both sources.
    let rateNow = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, p.token), ctx.secondRates, p.token, now);
    switch (rateSourcesVerdict(p.token, rateNow, now)) {
      case (#err(e)) refuse(causeOf(e));
      case (#ok(_)) {};
    };
    if (p.positionToken + p.guarantee + p.creator > p.payAmount) refuse("Invalid amounts");
    // PTM-10b: the amounts must be those of m and the choice (recomputed here).
    if (p.mShareE6 > DexLib.LOCKED_SHARE_MAX) refuse("Invalid locked share");
    let chk = mintAmounts(p.q, p.rateUsdE8, pow10(PayTokenLib.expectedDecimals(p.token)), p.mShareE6, p.choice);
    if (chk.payAmount != p.payAmount or chk.position != p.positionToken or chk.reserve != p.guarantee or chk.creator != p.creator or chk.split.lockedToken != p.lockedToken or chk.split.lockedTtti != p.lockedTtti or chk.split.pooledTtti != p.pooledTtti or chk.split.handTtti != p.handTtti) {
      refuse("The amounts do not match the locked share and the choice");
    };
    if (DexLib.available(ctx.dex.balances, payer, want) < p.payAmount + p.conversionCost) {
      refuse("Insufficient internal balance of the payer for the payment");
    };
    // The chosen pool is re-validated here: it may have become ineligible since the plan.
    let plan = switch (planFor(ctx, p, a.targetPoolId, now)) {
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
    // PTM-10d: TTTI-T already in the minter's hand, and the token side of the
    // position before the zap (the deposit without the rounding remainder).
    let handBefore = DexLib.available(balances, payer, #tttiT);
    DexLib.credit(balances, payer, #tttiT, p.q);
    let pooled = p.pooledTtti > 0;
    let depositToken = if (pooled) p.positionToken + p.dust else 0;
    var x = p.pooledTtti;
    var y = depositToken;
    let counterpartBeforeZap = p.positionToken;
    var zapSold = 0;
    var zapBought = 0;
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
              zapSold += r.amountIn;
            } else {
              y := Nat.sub(y, r.amountIn);
              x += r.amountOut;
              zapBought += r.amountOut;
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
    // PTM-10b: the locked part (m) and the free part, each with its dollars.
    let dep : Deposited = if (pooled) {
      depositParts(ctx, payer, plan, x, y, p.lockedTtti, p.pooledTtti, p.mShareE6, slippage, now);
    } else {
      { lockedId = null; freeId = null; shares = 0; tttiDeposited = 0 };
    };
    // PTM-10d: TTTI-T deposited in the position(s) and TTTI-T left in the minter's hand.
    let tttiDeposited = dep.tttiDeposited;
    let handAfter = DexLib.available(balances, payer, #tttiT);
    if (handAfter < handBefore) refuse("Mint balance sheet: the minter's TTTI-T decreased");
    let handNow = Nat.sub(handAfter, handBefore);
    if (not mintTttiBalanced(p.q, tttiDeposited, handNow, zapSold, zapBought)) {
      refuse("Mint balance sheet: TTTI-T minted differs from TTTI-T in the position plus TTTI-T in hand");
    };
    if (handNow < p.handTtti) refuse("Mint balance sheet: the TTTI-T kept in hand is below (1 - m) x q");
    let positionId : ?Nat = switch (dep.freeId) {
      case (?f) ?f;
      case null dep.lockedId;
    };
    if (owner != payer) {
      for (id in [dep.lockedId, dep.freeId].values()) {
        switch (id) {
          case (?i) {
            switch (ctx.dex.dex.positions.get(i)) {
              case (?_) { DexLib.setPositionOwner(ctx.dex.dex, i, owner) };
              case null refuse("Position not found");
            };
          };
          case null {};
        };
      };
    };
    // The reserve part goes to the common reserve in the paid token itself
    // (no conversion), through the dedicated reserve account.
    let reserve = creditReserve(ctx, payer, p);
    // The creator set-aside is kept in the paid token, inside the contract's DEX custody.
    if (not DexLib.debit(balances, payer, want, p.creator)) {
      refuse("Insufficient internal balance for the creator set-aside");
    };
    DexLib.credit(balances, ctx.canister, want, p.creator);
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
    // PTM-10d: balance sheet of the payment and direction of the price; a
    // difference traps and the whole mint is rolled back.
    let guaranteeBooked = p.guarantee;
    let creatorBooked = switch (ctx.store.creatorSetAsides.get(mintId)) {
      case (?c) c.amount;
      case null 0;
    };
    if (not mintContributionOk(p.choice, guaranteeBooked, p.mShareE6, p.lockedToken, Nat.sub(counterpartBeforeZap, p.lockedToken))) {
      refuse("Mint balance sheet: the contributed liquidity differs from the locked and free parts of the choice");
    };
    if (not mintPaymentBalanced(p.payAmount + p.ledgerFee, guaranteeBooked, counterpartBeforeZap, creatorBooked + p.dust, p.ledgerFee)) {
      refuse("Mint balance sheet: amount paid differs from reserve + liquidity + fees");
    };
    let poolAfter = switch (ctx.dex.dex.pools.get(pool.id)) {
      case (?pl) pl;
      case null refuse("Pool not found");
    };
    if (pooled and not mintDirectionOk((plan.before.reserveTtti, plan.before.reserveToken), reservesOf(poolAfter, plan.tttiIs0), mintTargetTokenPerTtti(p.rateUsdE8, pow10(PayTokenLib.expectedDecimals(p.token))), DIRECTION_SLACK_UNITS + p.dust)) {
      refuse("Mint direction: the pool price moved away from 10 000 USD or passed it");
    };
    setMint(ctx, mintId, func m = { m with positionId; mShareE6 = p.mShareE6; choice = p.choice; lockedPositionId = dep.lockedId; lockedTokenAmount = p.lockedToken; lockedTttiAmount = p.lockedTtti; handTttiAmount = handNow; status = #completed });
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
      lockedPositionId = dep.lockedId;
      freePositionId = dep.freeId;
      mShareE6 = p.mShareE6;
      choice = p.choice;
      lockedTokenAmount = p.lockedToken;
      lockedTttiAmount = p.lockedTtti;
      handTttiAmount = handNow;
      shares = dep.shares;
      positionTokenAmount = p.positionToken;
      positionTttiAmount = p.pooledTtti;
      guaranteeAmount = p.guarantee;
      creatorAmount = p.creator;
      reserveToken = reserve.reserveToken;
      reserveAmount = reserve.reserveAmount;
      conversionCost = reserve.cost;
      totalPaid = p.payAmount + reserve.cost;
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
    reserveUnit : Nat; // PTM-11: 10 000 USD per whole TTTI-T in the paid token's smallest unit, at the settlement rate
    mShareE6 : Nat; // PTM-10b: locked share m (scale 10^6) at the settlement
    choice : Types.RemainderChoice; // PTM-10b: the bid's choice for the share (1 - m)
    taken : Nat; // PTM-10b: (10 000 USD + L) x q / 0.99 rounded up (L = B or m x B per TTTI-T): the amount to take
    feeBorne : Nat; // ledger fee of the internal move carried by the creator share (at most 1 % of taken): not on the winner's DEX balance
    spareTtti : Nat; // most TTTI-T (q - mintE8s and the ledger fee included) the returned account may release
    mintE8s : Nat; // PTM-9b: part of q minted fresh now (end-of-mint remainder), pooled with the winner's position; <= q
    conversionAllowance : Nat; // PTM-11: most the reserve conversion may cost on top of `taken`, from the winner's deposit surplus
  };

  public type WinnerResult = {
    poolId : Nat;
    positionId : ?Nat; // the free position, else the locked one; null when nothing was pooled
    lockedPositionId : ?Nat;
    mShareE6 : Nat;
    lockedAmount : Nat; // m x B x q in the paid token, locked 3 months
    handE8s : Nat; // TTTI-T left in the winner's hand
    shares : Nat;
    taken : Nat;
    charged : Nat; // taken from the winner's DEX balance: taken less the fee borne by the creator share
    creator : Nat; // credited to the creator: 1 % of taken, net of the fee borne
    position : Nat; // token side pooled (locked + free)
    guarantee : Nat; // PTM-11: 10 000 USD x q paid into the common reserve
    reserveToken : PayToken; // PTM-11: token the reserve part was credited in
    conversionCost : Nat; // PTM-11: 0 without conversion
    minted : Nat; // PTM-9b: TTTI-T minted fresh for this winner (end-of-mint remainder)
  };

  // PTM-10b: the amount to take from an auction winner: (10 000 USD + L) x q /
  // 0.99 rounded up, L = B per TTTI-T (choice #pool) or m x B (choice #wallet).
  // `reserveUnit` is 10 000 USD per whole TTTI-T in the paid token's smallest unit.
  public func winnerTaken(priceB : Nat, reserveUnit : Nat, q : Nat, mShareE6 : Nat, choice : Types.RemainderChoice) : Nat {
    ceilDiv((reserveUnit * M_SCALE + priceB * liquidityFactorE6(choice, mShareE6)) * q * 100, M_SCALE * 99 * 100_000_000);
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
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, a.token), ctx.secondRates, a.token, now);
    if (not price.usable) refuse(causeOf(#rateUnavailable({ token = a.token })));
    if (a.mShareE6 > DexLib.LOCKED_SHARE_MAX) refuse("Invalid locked share");
    if (a.taken != winnerTaken(a.priceB, a.reserveUnit, a.q, a.mShareE6, a.choice)) refuse("The amount to take does not match the locked share and the choice");
    // PTM-10b: B x q is the full position; m x B x q of it is locked (choice #wallet pools only that).
    let fullPosition = a.priceB * a.q / 100_000_000;
    let split = splitOf(a.choice, a.mShareE6, a.q, fullPosition);
    let position = split.pooledToken;
    // PTM-11: 10 000 USD x q goes to the common reserve.
    let reservePart = a.reserveUnit * a.q / 100_000_000;
    let creatorFull = a.taken * CREATOR_BPS / BPS;
    let used = position + reservePart + creatorFull;
    if (fullPosition == 0 or reservePart == 0 or used > a.taken) refuse("Invalid amounts");
    if ((split.pooledTtti > 0) != (position > 0)) refuse("TTTI-T would be pooled without its dollars");
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
      mShareE6 = a.mShareE6;
      choice = a.choice;
      lockedToken = split.lockedToken;
      lockedTtti = split.lockedTtti;
      pooledTtti = split.pooledTtti;
      handTtti = split.handTtti;
      positionToken = position;
      guarantee = reservePart;
      creator;
      dust = Nat.sub(a.taken, used);
      ledgerFee = PayTokenLib.expectedFee(a.token);
      conversionCost = a.conversionAllowance;
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
    let plan = switch (planFor(ctx, p, null, now)) {
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
    let handBefore = DexLib.available(balances, owner, #tttiT);
    DexLib.credit(balances, owner, #tttiT, a.q);
    let slippage = DEFAULT_SLIPPAGE_BPS;
    let pooled = p.pooledTtti > 0;
    let depositToken = if (pooled) p.positionToken + p.dust else 0;
    var x = p.pooledTtti;
    var y = depositToken;
    let counterpartBeforeZap = p.positionToken;
    var zapSold = 0;
    var zapBought = 0;
    let usd = rateOf(ctx);
    switch (plan.zap) {
      case (?z) {
        let minOut = z.amountOut * Nat.sub(BPS, Nat.min(slippage, BPS)) / BPS;
        switch (DexLib.swap(ctx.dex.dex, balances, ctx.canister, owner, plan.pool.id, z.tokenIn, z.amountIn, minOut, now + SWAP_DEADLINE_NS, false, usd, now, ctx.dex.indicators)) {
          case (#ok(r)) {
            if (z.tokenIn == #tttiT) {
              x := Nat.sub(x, r.amountIn);
              y += r.amountOut;
              zapSold += r.amountIn;
            } else {
              y := Nat.sub(y, r.amountIn);
              x += r.amountOut;
              zapBought += r.amountOut;
            };
          };
          case (#err(e)) refuse("The balancing swap was refused: " # debug_show e);
        };
      };
      case null {};
    };
    // PTM-10b: the locked part (m, 3 months) and the free part, each with its dollars.
    let dep : Deposited = if (pooled) {
      depositParts(ctx, owner, plan, x, y, p.lockedTtti, p.pooledTtti, p.mShareE6, slippage, now);
    } else {
      { lockedId = null; freeId = null; shares = 0; tttiDeposited = 0 };
    };
    // PTM-10d: same balance sheet as a user mint.
    let tttiDeposited = dep.tttiDeposited;
    let handAfter = DexLib.available(balances, owner, #tttiT);
    if (handAfter < handBefore) refuse("Mint balance sheet: the winner's TTTI-T decreased");
    let handNow = Nat.sub(handAfter, handBefore);
    if (not mintTttiBalanced(a.q, tttiDeposited, handNow, zapSold, zapBought)) {
      refuse("Mint balance sheet: TTTI-T minted differs from TTTI-T in the position plus TTTI-T in hand");
    };
    if (handNow < p.handTtti) refuse("Mint balance sheet: the TTTI-T kept in hand is below (1 - m) x q");
    let positionId : ?Nat = switch (dep.freeId) {
      case (?f) ?f;
      case null dep.lockedId;
    };
    if (not mintContributionOk(a.choice, fullPosition, a.mShareE6, p.lockedToken, Nat.sub(counterpartBeforeZap, p.lockedToken))) {
      refuse("Mint balance sheet: the contributed liquidity differs from the locked and free parts of the choice");
    };
    if (not mintPaymentBalanced(a.taken, reservePart, counterpartBeforeZap, p.creator + p.dust, borne)) {
      refuse("Mint balance sheet: amount paid differs from reserve + liquidity + fees");
    };
    let poolAfter = switch (ctx.dex.dex.pools.get(plan.pool.id)) {
      case (?pl) pl;
      case null refuse("Pool not found");
    };
    if (pooled and not mintDirectionOk((plan.before.reserveTtti, plan.before.reserveToken), reservesOf(poolAfter, plan.tttiIs0), mintTargetTokenPerTtti(p.rateUsdE8, pow10(PayTokenLib.expectedDecimals(p.token))), DIRECTION_SLACK_UNITS + p.dust)) {
      refuse("Mint direction: the pool price moved away from 10 000 USD or passed it");
    };
    // PTM-11: the reserve part (in the paid token, no conversion) goes to the
    // common reserve; the creator share leaves the winner's balance.
    let reserve = creditReserve(ctx, owner, p);
    if (p.creator > 0) {
      if (not DexLib.debit(balances, owner, want, p.creator)) {
        refuse("Insufficient internal balance for the creator share");
      };
      CreatorFeesLib.credit(ctx.creatorFees, want, p.creator, #mintFee, now);
    };
    ignore CreatorFeesLib.collectTransferFees(ctx.creatorFees, ctx.ledger, ctx.canister, now);
    {
      poolId = plan.pool.id;
      positionId;
      lockedPositionId = dep.lockedId;
      mShareE6 = a.mShareE6;
      lockedAmount = split.lockedToken;
      handE8s = handNow;
      shares = dep.shares;
      taken = a.taken;
      charged;
      creator = p.creator;
      position = p.positionToken;
      guarantee = reserve.reserveAmount;
      reserveToken = reserve.reserveToken;
      conversionCost = reserve.cost;
      minted = a.mintE8s;
    };
  };

  // Refund of the payment from the payer's internal balance (DW rules) after
  // the isolated core refused: nothing was minted, nothing else changed.
  func refund(ctx : MintContext, payer : Principal, p : Prepared, mintId : Types.MintId, cause : Text) : async Result.Result<Types.LiquidityMintResult, Err> {
    let dtoken = dexOf(p.token);
    let fee = RetryLib.dexFee(ctx.dex, dtoken);
    switch (RetryLib.openDexWithdrawal(ctx.dex, payer, dtoken, p.payAmount + p.conversionCost, fee)) {
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
        mShareE6 = p.mShareE6;
        choice = p.choice;
        lockedPositionId = null;
        lockedTokenAmount = p.lockedToken;
        lockedTttiAmount = p.lockedTtti;
        handTttiAmount = p.handTtti;
        paymentBlock = ?paymentBlock;
        status = #inProgress;
        createdAt = Time.now();
        refundWithdrawalN = null;
        refusalCause = null;
      },
    );
    let outcome : { #done : Types.LiquidityMintResult; #refused : Text } = try {
      #done(await ctx.isolated({ payer; owner; p; expectedShares = plan.shares; slippage; mintId; paymentBlock; deadline; targetPoolId = ?plan.pool.id }));
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
    let p0 = switch (prepare(ctx, args.token, #ttti(args.quantity), args.choice, now)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    // PTM-11: no conversion cost is added to the amount paid.
    let reservePlan = switch (planReserve(ctx, p0, now)) {
      case (#ok(r)) r;
      case (#err(e)) return #err(e);
    };
    let p = { p0 with conversionCost = reservePlan.cost };
    let totalPay = p.payAmount + p.conversionCost;
    if (totalPay > args.maxPayAmount) {
      return #err(#maxPayExceeded({ payAmount = totalPay; maxPayAmount = args.maxPayAmount }));
    };
    let plan = switch (planFor(ctx, p, args.targetPoolId, now)) {
      case (#ok(pl)) pl;
      case (#err(e)) return #err(e);
    };
    let keys = switch (lockPayer(ctx, caller, args.token)) {
      case (?k) k;
      case null return #err(#purchaseInProgress);
    };
    try {
      let dtoken = dexOf(args.token);
      let deposit = RetryLib.openDexDeposit(ctx.dex, caller, dtoken, totalPay);
      let (done, err) = await RetryLib.sendDexDepositDetailed(ctx.dex, deposit.n);
      switch (done.status) {
        case (#completed(block)) await settle(ctx, caller, owner, p, plan, slippage, block, ?args.deadline);
        case (status) #err(depositError(args.token, totalPay + p.ledgerFee, err, status));
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
  public func mintFromDeposit(ctx : MintContext, buyer : Principal, subaccount : Blob, depositIndex : Nat, ckbtcAmount : Nat, params : Types.DepositMintParams) : async Result.Result<Types.LiquidityMintResult, Types.LiquidityMintError> {
    let token : PayToken = #ckbtc;
    if (buyer.isAnonymous()) return #err(#anonymousCaller);
    if (not SaleLib.hasAccepted(ctx.acknowledgements, buyer)) return #err(#acknowledgementRequired);
    let now = Time.now();
    // The user's rules, checked before anything is moved (same order as `mint`).
    if (now > params.deadline) return #err(#deadlineExpired({ deadline = params.deadline; now }));
    let slippage = params.slippageBps;
    if (slippage > BPS) return #err(#invalidSlippage({ maximumBps = BPS }));
    switch (selectPool(ctx.dex.dex, rateOf(ctx), token, ?params.targetPoolId)) {
      case (#err(e)) return #err(e);
      case (#ok(_)) {};
    };
    let fee = PayTokenLib.expectedFee(token);
    if (ckbtcAmount <= fee) {
      return #err(#belowMinimum({ minimumTtti = MIN_MINT_TTTI; granularityTtti = GRANULARITY_TTTI; requestedTtti = 0 }));
    };
    let budget = Nat.sub(ckbtcAmount, fee);
    let price = OracleLib.getTokenPrice(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token), ctx.secondRates, token, now);
    if (not price.usable) return #err(#rateUnavailable({ token }));
    let dec = pow10(PayTokenLib.expectedDecimals(token));
    let avail = SaleLib.available(ctx.sale, ctx.ledger, ctx.canister);
    let m = shareNow(ctx, now);
    var q = Nat.min(Nat.min(tttiForPayment(budget, price.usdE8, dec, params.choice, m), CAP_TTTI), avail);
    var guard = 0;
    while (q > 0 and guard < 8 and payForTtti(q, price.usdE8, dec, params.choice, m) > budget) {
      q -= 1;
      guard += 1;
    };
    // PTM-11: the amount paid fits the budget;
    // q is scaled down a few times when it does not.
    var attempt = 0;
    var found : ?(Prepared, Plan) = null;
    label fit while (attempt < 6 and q > 0) {
      let candidate = switch (prepare(ctx, token, #ttti(#baseUnits(q)), params.choice, now)) {
        case (#ok(c)) c;
        case (#err(e)) return #err(e);
      };
      let reservePlan = switch (planReserve(ctx, candidate, now)) {
        case (#ok(r)) r;
        case (#err(e)) return #err(e);
      };
      let total = candidate.payAmount + reservePlan.cost;
      if (total <= budget) {
        let p1 = { candidate with conversionCost = reservePlan.cost };
        switch (planFor(ctx, p1, ?params.targetPoolId, now)) {
          case (#ok(pl)) { found := ?(p1, pl) };
          case (#err(e)) return #err(e);
        };
        break fit;
      };
      q := Nat.sub(q * budget / total, 1);
      attempt += 1;
    };
    let (p, plan) = switch (found) {
      case (?f) f;
      case null return #err(#invalidAmount);
    };
    let totalPay = p.payAmount + p.conversionCost;
    if (totalPay > params.maxPayAmount) {
      return #err(#maxPayExceeded({ payAmount = totalPay; maxPayAmount = params.maxPayAmount }));
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
        amount = totalPay;
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
          DexLib.credit(ctx.dex.balances, buyer, #ckbtc, totalPay);
          await settle(ctx, buyer, buyer, p, plan, slippage, block, ?params.deadline);
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
