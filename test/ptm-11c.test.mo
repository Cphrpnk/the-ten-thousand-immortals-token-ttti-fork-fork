import Array "mo:core/Array";
import Lib "../src/backend/lib/liquidity-mint";
import MintTypes "../src/backend/types/liquidity-mint";
import OracleLib "../src/backend/lib/oracle";
import OracleTypes "../src/backend/types/oracle";

// PTM-10b: the figures of this file are those of choice A (#pool), where the
// price is 20 000 USD / 0.99 per whole TTTI-T whatever the locked share m is
// (the figures of choice B and of every m are covered by ptm-10b.test.mo).
module MintLib {
  public let MIN_MINT_TTTI = Lib.MIN_MINT_TTTI;
  public let costPer100UsdE8 = Lib.costPer100UsdE8;
  public let mintPaymentBalanced = Lib.mintPaymentBalanced;
  public let rateSourcesVerdict = Lib.rateSourcesVerdict;
  public func usdForTtti(q : Nat) : Nat = Lib.usdForTtti(q, #pool, 0);
  public func payForTtti(q : Nat, rate : Nat, dec : Nat) : Nat = Lib.payForTtti(q, rate, dec, #pool, 0);
  public func tttiForPayment(pay : Nat, rate : Nat, dec : Nat) : Nat = Lib.tttiForPayment(pay, rate, dec, #pool, 0);
  public func mintAmounts(q : Nat, rate : Nat, dec : Nat) : Lib.MintAmounts = Lib.mintAmounts(q, rate, dec, 0, #pool);
};

// PTM-11c: the mint price figures shown by the frontend come from the backend.
// Interpreter tests of the pure functions behind getMintPricePreview,
// getMintAmountForPayment and getPayAmountForTtti (MintLib.core and the
// queries that read the stores cannot run here):
//   1. 100 USD / 0.99 = 101.01 USD and 20 000 USD / 0.99 per whole TTTI-T;
//   2. payment <-> TTTI-T for ICP, ckBTC, ckUSDC and ckUSDT;
//   3. rounding in favour of the pool;
//   4. the stale, missing or diverging rate case (never a fallback rate).

let ONE_TTTI : Nat = 100_000_000;
let MIN_TTTI : Nat = MintLib.MIN_MINT_TTTI;

// ICP at 5 USD, BTC at 100 000 USD, both stablecoins at 1 USD (USD x 1e8).
let ICP_RATE : Nat = 500_000_000;
let BTC_RATE : Nat = 100_000 * 100_000_000;
let STABLE_RATE : Nat = 100_000_000;

let DEC8 : Nat = 100_000_000;
let DEC6 : Nat = 1_000_000;

type Case = { token : MintTypes.PayToken; rate : Nat; dec : Nat };

let cases : [Case] = [
  { token = #icp; rate = ICP_RATE; dec = DEC8 },
  { token = #ckbtc; rate = BTC_RATE; dec = DEC8 },
  { token = #ckusdc; rate = STABLE_RATE; dec = DEC6 },
  { token = #ckusdt; rate = STABLE_RATE; dec = DEC6 },
];

// --- 1. 101.01 USD for 100 USD, price per whole TTTI-T ----------------------------

do {
  // 100 USD / 0.99 = 101.01010101... USD, rounded up, in USD x 1e8.
  let cost = MintLib.costPer100UsdE8();
  assert cost == 10_101_010_102;
  // Displayed to the cent: 101.01 USD.
  assert cost / 1_000_000 == 10_101;
  // Never below the exact value, never one unit above it.
  assert cost * 99 >= 100 * 100_000_000 * 100;
  assert (cost - 1) * 99 < 100 * 100_000_000 * 100;

  // One whole TTTI-T: 20 000 USD / 0.99 = 20 202.0202... USD, rounded up.
  assert MintLib.usdForTtti(ONE_TTTI) == 2_020_202_020_203;
  // The minimum mint: 0.0001 TTTI-T.
  assert MintLib.usdForTtti(MIN_TTTI) == 202_020_203;
  // The cost of 100 USD is the price of 0.005 TTTI-T (50 USD x 2 / 0.99).
  assert MintLib.usdForTtti(500_000) == 10_101_010_102;
  assert MintLib.usdForTtti(500_000) == cost;
};

// --- 2. Payment to TTTI-T and back, per pay token -----------------------------------

do {
  // Exact base-unit figures for one whole TTTI-T.
  assert MintLib.payForTtti(ONE_TTTI, STABLE_RATE, DEC6) == 20_202_020_203; // 20 202.020203 ckUSDC
  assert MintLib.payForTtti(ONE_TTTI, ICP_RATE, DEC8) == 404_040_404_041; // 4 040.40404041 ICP
  assert MintLib.payForTtti(ONE_TTTI, BTC_RATE, DEC8) == 20_202_021; // 0.20202021 ckBTC

  // The minimum mint in each token.
  assert MintLib.payForTtti(MIN_TTTI, STABLE_RATE, DEC6) == 2_020_203; // 2.020203 USD
  assert MintLib.payForTtti(MIN_TTTI, ICP_RATE, DEC8) == 40_404_041;
  assert MintLib.payForTtti(MIN_TTTI, BTC_RATE, DEC8) == 2_021;

  for (c in cases.values()) {
    // The query figure equals what the mint charges (mintAmounts).
    for (q in [MIN_TTTI, 12_345_678, 50_000_000, ONE_TTTI].values()) {
      let m = MintLib.mintAmounts(q, c.rate, c.dec);
      assert MintLib.payForTtti(q, c.rate, c.dec) == m.payAmount;
      assert MintLib.usdForTtti(q) == m.payUsdE8;
      // The balance sheet of the mint holds for the figures shown.
      assert MintLib.mintPaymentBalanced(m.payAmount, m.position, m.reserve, m.creator + m.dust, 0);
    };
  };

  // Payment to TTTI-T: paying exactly the price of q gives q.
  for (c in cases.values()) {
    for (q in [MIN_TTTI, 777_777, ONE_TTTI].values()) {
      let pay = MintLib.payForTtti(q, c.rate, c.dec);
      assert MintLib.tttiForPayment(pay, c.rate, c.dec) >= q;
      // Paying one base unit less never gives more than q.
      if (pay > 0) { assert MintLib.tttiForPayment(pay - 1, c.rate, c.dec) <= q };
    };
  };

  // 20 202.020203 ckUSDC buys the whole TTTI-T; 20 202.020202 buys 0.99999999.
  assert MintLib.tttiForPayment(20_202_020_203, STABLE_RATE, DEC6) == ONE_TTTI;
  assert MintLib.tttiForPayment(20_202_020_202, STABLE_RATE, DEC6) == ONE_TTTI - 1;
  // 1 ckBTC would buy more than the cap: the function reports the exact
  // amount, the query clamps it to the cap and to what remains.
  assert MintLib.tttiForPayment(100_000_000, BTC_RATE, DEC8) == 495_000_000;
  // 101.010102 ckUSDT (100 USD / 0.99) buys 0.005 TTTI-T (100 USD x 0.99 / 20 000).
  assert MintLib.tttiForPayment(101_010_102, STABLE_RATE, DEC6) == 500_000;
  // 10 ICP at 5 USD = 50 USD -> 0.002475 TTTI-T.
  assert MintLib.tttiForPayment(1_000_000_000, ICP_RATE, DEC8) == 247_500;
};

// --- 3. Rounding in favour of the pool ---------------------------------------------

do {
  for (c in cases.values()) {
    for (q in [1, 9_999, MIN_TTTI, 1_234_567, 99_999_999, ONE_TTTI].values()) {
      let pay = MintLib.payForTtti(q, c.rate, c.dec);
      // pay x 0.99 x rate >= 20 000 USD x q: the payer never pays less.
      assert pay * 99 * c.rate >= 2_000_000 * q * c.dec;
      // And never more than one base unit above the exact value.
      assert (pay - 1) * 99 * c.rate < 2_000_000 * q * c.dec;
      // Paying the price of q never gives more than q (rounded down).
      let back = MintLib.tttiForPayment(pay, c.rate, c.dec);
      assert back >= q;
      assert MintLib.payForTtti(back, c.rate, c.dec) <= pay;
      // One more base unit of TTTI-T costs more than the payment.
      assert MintLib.payForTtti(back + 1, c.rate, c.dec) > pay;
    };
  };
  // The USD figure is rounded up too.
  for (q in [1, 3, 10_000, 33_333_333].values()) {
    assert MintLib.usdForTtti(q) * 99 >= 2_000_000 * q;
    assert (MintLib.usdForTtti(q) - 1) * 99 < 2_000_000 * q;
  };
  // Without a rate nothing is computed (the queries refuse before this point).
  assert MintLib.payForTtti(ONE_TTTI, 0, DEC8) == 0;
  assert MintLib.tttiForPayment(1_000, STABLE_RATE, 0) == 0;
};

// --- 4. Stale or missing rate: refused, never a fallback ------------------------------

let NOW : Int = 1_900_000_000_000_000_000;

func priceOf(token : MintTypes.PayToken, source : OracleTypes.PriceSource, usdE8 : Nat, usable : Bool, second : ?OracleTypes.SecondSourceObservation) : OracleTypes.TokenPrice {
  {
    secondSource = second;
    token;
    pair = "BTC-USD";
    usdE8;
    source;
    fetchedAt = NOW - 60_000_000_000;
    validUntil = NOW + 3_540_000_000_000;
    usable;
    lastError = null;
    lastSuccessAt = ?(NOW - 60_000_000_000);
  };
};

do {
  let fresh = NOW - 600_000_000_000;
  let good : ?OracleTypes.SecondSourceObservation = ?{ source = #coingecko; usdE8 = BTC_RATE; fetchedAt = fresh };

  // A fresh rate confirmed by the second source: the figures are shown.
  assert MintLib.rateSourcesVerdict(#ckbtc, priceOf(#ckbtc, #coinbase, BTC_RATE, true, good), NOW) == #ok(());

  // Expired rate (not usable): rateUnavailable, no figure.
  let expired : MintTypes.LiquidityMintError = #rateUnavailable({ token = #ckbtc });
  assert MintLib.rateSourcesVerdict(#ckbtc, priceOf(#ckbtc, #coinbase, BTC_RATE, false, good), NOW) == #err(expired);

  // No rate stored at all: the same refusal for every pay token.
  for (c in cases.values()) {
    let none = MintLib.rateSourcesVerdict(c.token, priceOf(c.token, #none, 0, false, null), NOW);
    assert none == #err(#rateUnavailable({ token = c.token }));
  };

  // Second source missing: refused, with no difference reported.
  switch (MintLib.rateSourcesVerdict(#ckbtc, priceOf(#ckbtc, #coinbase, BTC_RATE, true, null), NOW)) {
    case (#err(#rateSourcesDiverge(r))) { assert r.differenceBps == null and r.coingeckoUsdE8 == null };
    case (_) { assert false };
  };

  // Second source older than 1 h 5 min: refused.
  let old = NOW - OracleLib.VALID_FOR_NS - OracleLib.GRACE_NS - 1;
  switch (MintLib.rateSourcesVerdict(#ckbtc, priceOf(#ckbtc, #coinbase, BTC_RATE, true, ?{ source = #coingecko; usdE8 = BTC_RATE; fetchedAt = old }), NOW)) {
    case (#err(#rateSourcesDiverge(_))) {};
    case (_) { assert false };
  };

  // Sources 30 % apart: refused with the difference.
  let far : ?OracleTypes.SecondSourceObservation = ?{ source = #coingecko; usdE8 = BTC_RATE + 30 * BTC_RATE / 100; fetchedAt = fresh };
  switch (MintLib.rateSourcesVerdict(#ckbtc, priceOf(#ckbtc, #coinbase, BTC_RATE, true, far), NOW)) {
    case (#err(#rateSourcesDiverge(r))) { assert r.differenceBps == ?3_000 };
    case (_) { assert false };
  };

  // The refusal arrives before any amount: a payment of any size gets no
  // figure, so there is nothing to fall back to.
  assert Array.size(cases) == 4;
};
