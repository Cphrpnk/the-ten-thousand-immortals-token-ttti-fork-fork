import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";
import FeeTypes "../src/backend/types/protocol-fees";

// PTM-10a: pools-to-capitalisation ratio and locked share m. Pure tests that
// run in the interpreter, through the real lib functions
// (DexLib.tttiPoolsValue / poolCapRatio / ratioWindow / retainedRatio /
// lockedShare / poolCapRatioReport / consolidatedNow).
//
//  1. m = 50 / 30 / 10 / 0 % at a retained ratio of 0 / 20 / 40 / 50 %.
//  2. no circulating TTTI-T, no pool, unavailable ratio: m = 50 %.
//  3. rounding is upward and m stays between 0 and 50 %.
//  4. the retained ratio is the lower of the current ratio and the 24 h average.
//  5. a purchase of TTTI-T in a pool (the price rises).
//  6. a liquidity addition just before a calculation, and a removal.
//
// Units: amounts USD x 1e8; ratio RATIO_SCALE = 10^12 (100 %); m
// LOCKED_SHARE_SCALE = 10^6 (100 %, 500_000 = 50 %). Rates: ICP 5 USD,
// ckUSDC / ckUSDT 1 USD. TTTI-T has 8 decimals, ckUSDC 6.

let now : Int = 1_000_000_000_000_000_000;
let STEP_NS : Nat = 300_000_000_000;

let ICP = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let CKUSDC = "xevnm-gaaaa-aaaar-qafnq-cai";
let CKUSDT = "cngnf-vqaaa-aaaar-qag4q-cai";

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(ICP)); symbol = "ICP"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(CKUSDC)); symbol = "ckUSDC"; decimals = 6 };
let usdtToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(CKUSDT)); symbol = "ckUSDT"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ICP") ?500_000_000 else if (token.symbol == "ckUSDC" or token.symbol == "ckUSDT") ?100_000_000 else null;
};

func noRateOf(_ : DexTypes.PoolToken) : ?Nat = null;

// TTTI-T / counter pool (TTTI-T is token0).
func pool(id : Nat, counter : DexTypes.PoolToken, tttiReserve : Nat, counterReserve : Nat) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1 = counter;
    feeTier = #bps30;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    minimumLocked = { token0 = null; token1 = null };
    newPairBadgeUntil = null;
    requestId = null;
    removedAt = null;
    reserve0 = tttiReserve;
    reserve1 = counterReserve;
    totalShares = 1_000_000;
    lockedShares = 0;
    protocolFee0 = 0;
    protocolFee1 = 0;
    lockedFeesPaid0 = 0;
    lockedFeesPaid1 = 0;
  };
};

func storeOf(pools : [DexTypes.Pool]) : DexTypes.DexStore {
  let map = Map.empty<Nat, DexTypes.Pool>();
  for (p in pools.values()) { map.add(p.id, p) };
  {
    pools = map;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = pools.size() + 1;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 1;
    removals = Map.empty<DexTypes.PoolId, DexTypes.PairRemoval>();
    icpswapSamples = Map.empty<Text, DexTypes.IcpSwapSample>();
    referenceReadings = Map.empty<Text, DexTypes.ReferenceReading>();
    poolPositions = Map.empty<DexTypes.PoolId, Set.Set<DexTypes.PositionId>>();
    fees = {
      var dayStart = 0;
      var nextSharingAt = 86_400_000_000_000;
      pots = Map.empty<DexTypes.PoolId, DexTypes.PoolPot>();
      locks = Map.empty<DexTypes.PositionId, DexTypes.PositionLock>();
      unpaid = Map.empty<Text, DexTypes.UnpaidShare>();
    };
  };
};

// `count` ratio samples of the same value, 5 minutes apart, ending now.
func ratioSamples(count : Nat, ratio : Nat) : List.List<FeeTypes.PoolCapRatioSample> {
  let l = List.empty<FeeTypes.PoolCapRatioSample>();
  var i = 0;
  while (i < count) {
    l.add({ at = now - (i * STEP_NS).toInt(); ratio });
    i += 1;
  };
  l;
};

let noSamples = List.empty<FeeTypes.PoolCapRatioSample>();

let R = DexLib.RATIO_SCALE;
let HALF = DexLib.POOL_CAP_RATIO_TARGET;

// Base scenario: one ckUSDC pool, 0.1 TTTI-T against 1 000 ckUSDC (price
// 10 000 USD, pools value 2 000 USD = 2e11). 0.5 TTTI-T circulate and the
// hourly average is 10 000 USD (1e12): capitalisation 5 000 USD, ratio 40 %.
let CIRCULATING : Nat = 50_000_000;
let HOURLY : Nat = 1_000_000_000_000;
let T0 : Nat = 10_000_000;
let C0 : Nat = 1_000_000_000;

func report(store : DexTypes.DexStore, price : ?Nat, samples : List.List<FeeTypes.PoolCapRatioSample>) : FeeTypes.PoolCapRatioView {
  DexLib.poolCapRatioReport(store, rateOf, CIRCULATING, price, samples, now);
};

// --- 1. m at a retained ratio of 0 / 20 / 40 / 50 % ---------------------------

do {
  assert DexLib.LOCKED_SHARE_SCALE == 1_000_000;
  assert DexLib.LOCKED_SHARE_MAX == 500_000;
  assert HALF == R / 2;
  assert DexLib.lockedShare(CIRCULATING, 1, ?0) == 500_000; // 50 %
  assert DexLib.lockedShare(CIRCULATING, 1, ?(R / 5)) == 300_000; // 30 %
  assert DexLib.lockedShare(CIRCULATING, 1, ?(R * 2 / 5)) == 100_000; // 10 %
  assert DexLib.lockedShare(CIRCULATING, 1, ?(R / 2)) == 0; // 0 %

  // End to end on the base scenario: ratio 40 % gives m = 10 %.
  let v = report(storeOf([pool(1, usdcToken, T0, C0)]), ?HOURLY, noSamples);
  assert v.poolsValueUsdE8 == ?200_000_000_000;
  assert v.poolCount == 1;
  assert v.capitalisationUsdE8 == ?500_000_000_000;
  assert v.currentRatio == ?400_000_000_000;
  assert v.averageRatio24h == null;
  assert v.samples == 0;
  assert v.retainedRatio == ?400_000_000_000;
  assert v.targetRatio == 500_000_000_000;
  assert v.lockedShare == 100_000;
};

// --- 2. 50 % without circulating TTTI-T, without pool, without a ratio --------

do {
  assert DexLib.lockedShare(0, 1, ?(R * 2 / 5)) == 500_000; // nothing circulates
  assert DexLib.lockedShare(CIRCULATING, 0, ?(R * 2 / 5)) == 500_000; // no pool
  assert DexLib.lockedShare(CIRCULATING, 1, null) == 500_000; // ratio unavailable

  let empty = storeOf([]);
  let none = DexLib.tttiPoolsValue(empty, rateOf);
  assert none.poolCount == 0;
  assert none.valueUsdE8 == ?0;
  let v = report(empty, ?HOURLY, noSamples);
  assert v.poolCount == 0;
  assert v.lockedShare == 500_000;

  // Nothing circulates: no ratio (zero capitalisation), m = 50 %.
  let w = DexLib.poolCapRatioReport(storeOf([pool(1, usdcToken, T0, C0)]), rateOf, 0, ?HOURLY, noSamples, now);
  assert w.capitalisationUsdE8 == ?0;
  assert w.currentRatio == null;
  assert w.lockedShare == 500_000;

  // Hourly/consolidated price unavailable: the capitalisation does not read it
  // (fixed 10 000 USD reference), so the ratio and m are computed all the same.
  let x = report(storeOf([pool(1, usdcToken, T0, C0)]), null, noSamples);
  assert x.consolidatedPriceUsdE8 == null;
  assert x.capitalisationUsdE8 == ?500_000_000_000;
  assert x.currentRatio == ?400_000_000_000;
  assert x.retainedRatio == ?400_000_000_000;
  assert x.lockedShare == 100_000;

  // Oracle rate absent or expired: no pools value, no fallback rate, m = 50 %.
  let y = DexLib.poolCapRatioReport(storeOf([pool(1, usdcToken, T0, C0)]), noRateOf, CIRCULATING, ?HOURLY, noSamples, now);
  assert y.poolsValueUsdE8 == null;
  assert y.currentRatio == null;
  assert y.lockedShare == 500_000;
};

// Pools value: ICP and ckUSDC pools add up; a removed pool and a pool with no
// counterpart reserve are left out; locked shares do not change the value
// (the reserves already hold every share).
do {
  let icpPool = pool(2, icpToken, 5_000_000, 10_000_000_000); // 100 ICP = 500 USD
  let removed : DexTypes.Pool = { pool(3, usdtToken, T0, C0) with status = #removed };
  let removedAt : DexTypes.Pool = { pool(4, usdtToken, T0, C0) with removedAt = ?5 };
  let drained = pool(5, usdtToken, T0, 0);
  let locked : DexTypes.Pool = { pool(1, usdcToken, T0, C0) with lockedShares = 600_000 };
  let v = DexLib.tttiPoolsValue(storeOf([locked, icpPool, removed, removedAt, drained]), rateOf);
  assert v.poolCount == 2;
  assert v.valueUsdE8 == ?300_000_000_000; // 2 x 1 000 + 2 x 500 USD
  assert DexLib.tttiPoolsValue(storeOf([pool(1, usdcToken, T0, C0)]), rateOf).valueUsdE8 == ?200_000_000_000;
};

// --- 3. Rounding is upward, m stays between 0 and 50 % -----------------------

do {
  // m = (50 % - r) at 1e-6: 3 000 000 / 1e12 = 0.0003 % exactly gives 499 997.
  assert DexLib.lockedShare(CIRCULATING, 1, ?3_000_000) == 499_997;
  // One more unit of ratio (1e-12) leaves a fraction that rounds up, not down.
  assert DexLib.lockedShare(CIRCULATING, 1, ?3_000_001) == 499_997;
  assert DexLib.lockedShare(CIRCULATING, 1, ?3_999_999) == 499_997;
  assert DexLib.lockedShare(CIRCULATING, 1, ?4_000_000) == 499_996;
  // A ratio of one unit still gives the full 50 % after rounding up.
  assert DexLib.lockedShare(CIRCULATING, 1, ?1) == 500_000;
  // Just under the target: any positive gap rounds up to at least 1e-6.
  assert DexLib.lockedShare(CIRCULATING, 1, ?(HALF - 1)) == 1;
  assert DexLib.lockedShare(CIRCULATING, 1, ?HALF) == 0;
  // Never outside 0 .. 50 %.
  for (r in [0, 1, R / 10, R / 2 - 1, R / 2, R / 2 + 1, R, 3 * R, 1_000_000 * R].values()) {
    let m = DexLib.lockedShare(CIRCULATING, 1, ?r);
    assert m <= 500_000;
    if (r >= HALF) { assert m == 0 };
  };
};

// --- 4. Retained ratio: the lower of the current ratio and the 24 h average ---

do {
  assert DexLib.retainedRatio(?30, ?20) == ?20;
  assert DexLib.retainedRatio(?20, ?30) == ?20;
  assert DexLib.retainedRatio(?20, null) == ?20; // no sample yet
  assert DexLib.retainedRatio(null, ?20) == null; // no current ratio

  // Window: only the samples of the last 24 h count, the average is their mean.
  let l = List.empty<FeeTypes.PoolCapRatioSample>();
  l.add({ at = now - 90_000_000_000_000; ratio = 900 }); // 25 h old: left out
  l.add({ at = now - 3_600_000_000_000; ratio = 100 });
  l.add({ at = now; ratio = 300 });
  let w = DexLib.ratioWindow(l, now, FeeTypes.CONSOLIDATED_RETENTION_NS);
  assert w.count == 2;
  assert w.average == ?200;

  // Current ratio 40 %: a lower 24 h average (30 %) is retained, m = 20 %.
  let store = storeOf([pool(1, usdcToken, T0, C0)]);
  let low = report(store, ?HOURLY, ratioSamples(288, 300_000_000_000));
  assert low.samples == 288;
  assert low.averageRatio24h == ?300_000_000_000;
  assert low.currentRatio == ?400_000_000_000;
  assert low.retainedRatio == ?300_000_000_000;
  assert low.lockedShare == 200_000;
  // A higher average (45 %) never lifts the retained ratio above the current one.
  let high = report(store, ?HOURLY, ratioSamples(288, 450_000_000_000));
  assert high.retainedRatio == ?400_000_000_000;
  assert high.lockedShare == 100_000;
};

// --- 5. A pool that moves its own price: the capitalisation does not follow ---
//
// The capitalisation is circulating TTTI-T x the fixed reference of 10 000 USD
// per whole TTTI-T (CAPITALISATION_REFERENCE_USD_E8), never a price read from
// the pools. A pool therefore cannot move the denominator of its own ratio:
// the ratio and m depend on the pools value (counterpart reserves at the oracle
// rate) alone, whatever consolidated price is passed along for display.
//
// Buying with 200 ckUSDC (constant product, fee ignored): the counter reserve
// goes from 1 000 to 1 200 USDC and the TTTI-T reserve from 0.1 to 0.08333334.
// Spot price: 10 000 -> 14 400 USD, pools value 2 000 -> 2 400 USD.

let C1 : Nat = 1_200_000_000;
let T1 : Nat = T0 - T0 * 200_000_000 / C1; // 8 333_334
let afterBuy = storeOf([pool(1, usdcToken, T1, C1)]);

do {
  let before = report(storeOf([pool(1, usdcToken, T0, C0)]), ?HOURLY, ratioSamples(288, 400_000_000_000));
  assert before.lockedShare == 100_000;
  let spot = switch (DexLib.consolidatedNow(afterBuy, rateOf, now).price) {
    case (?p) p;
    case null { assert false; 0 };
  };
  assert spot > HOURLY; // the purchase made the price rise
  assert spot == 1_439_999_884_800; // 14 399.998848 USD x 1e8

  // (a) The pools value rose (2 000 -> 2 400 USD) over an unchanged
  // capitalisation (5 000 USD), so the current ratio rises 40 % -> 48 %. With no
  // ratio sample the retained ratio is the current one and m falls from 10 % to
  // 2 %. With a 24 h average of 40 % the retained ratio stays 40 % and m is
  // unchanged (10 %).
  let noHistory = report(afterBuy, ?HOURLY, noSamples);
  assert noHistory.poolsValueUsdE8 == ?240_000_000_000;
  assert noHistory.capitalisationUsdE8 == ?500_000_000_000;
  assert noHistory.currentRatio == ?480_000_000_000;
  assert noHistory.lockedShare == 20_000; // 2 %: lower, not higher
  let withHistory = report(afterBuy, ?HOURLY, ratioSamples(288, 400_000_000_000));
  assert withHistory.retainedRatio == ?400_000_000_000;
  assert withHistory.lockedShare == 100_000; // unchanged

  // (b) The price passed along (hourly, spot or absent) is shown but never
  // enters the ratio: the same pools give the same capitalisation, ratio and m.
  let atSpot = report(afterBuy, ?spot, noSamples);
  assert atSpot.consolidatedPriceUsdE8 == ?spot;
  assert atSpot.capitalisationUsdE8 == noHistory.capitalisationUsdE8;
  assert atSpot.currentRatio == noHistory.currentRatio;
  assert atSpot.lockedShare == noHistory.lockedShare;
  let noPrice = report(afterBuy, null, noSamples);
  assert noPrice.consolidatedPriceUsdE8 == null;
  assert noPrice.currentRatio == noHistory.currentRatio;
  assert noPrice.lockedShare == noHistory.lockedShare;
  // With the 24 h average the spot price does not lift m either (it used to
  // rise to 16.67 % once the denominator followed the pool's own price).
  let spotWithHistory = report(afterBuy, ?spot, ratioSamples(288, 400_000_000_000));
  assert spotWithHistory.currentRatio == ?480_000_000_000;
  assert spotWithHistory.retainedRatio == ?400_000_000_000;
  assert spotWithHistory.lockedShare == before.lockedShare;
};

// A pool that moves its own price without changing its counterpart reserve
// (the TTTI-T side halves or doubles, the price doubles or halves): the pools
// value, the capitalisation, the ratio and m are exactly those of the base case.
do {
  let base = report(storeOf([pool(1, usdcToken, T0, C0)]), ?HOURLY, noSamples);
  for (tttiReserve in [T0 / 2, T0 * 2].values()) {
    let moved = storeOf([pool(1, usdcToken, tttiReserve, C0)]);
    let price = switch (DexLib.consolidatedNow(moved, rateOf, now).price) {
      case (?p) p;
      case null { assert false; 0 };
    };
    assert price != HOURLY; // the pool really moved its own price
    for (shown in [?HOURLY, ?price, null].values()) {
      let r = report(moved, shown, noSamples);
      assert r.poolsValueUsdE8 == base.poolsValueUsdE8;
      assert r.capitalisationUsdE8 == base.capitalisationUsdE8;
      assert r.currentRatio == base.currentRatio;
      assert r.retainedRatio == base.retainedRatio;
      assert r.lockedShare == base.lockedShare;
    };
  };
  assert base.capitalisationReferenceUsdE8 == DexLib.CAPITALISATION_REFERENCE_USD_E8;
  assert base.capitalisationReferenceUsdE8 == 1_000_000_000_000; // 10 000 USD
  assert base.capitalisationReference == #targetPrice;
};

// --- 6. Liquidity added just before a calculation, then removed --------------

do {
  let base = report(storeOf([pool(1, usdcToken, T0, C0)]), ?HOURLY, noSamples);
  assert base.lockedShare == 100_000;

  // +1 % of both reserves: the price is unchanged, the pools value rises 1 %,
  // the ratio 40 % -> 40.4 %, m 10 % -> 9.6 %: a 0.4 point move, nothing more.
  let added = report(storeOf([pool(1, usdcToken, T0 * 101 / 100, C0 * 101 / 100)]), ?HOURLY, noSamples);
  assert added.currentRatio == ?404_000_000_000;
  assert added.lockedShare == 96_000;
  assert base.lockedShare - added.lockedShare <= 5_000;
  // With the 24 h average (40 %) the retained ratio ignores the addition.
  let addedWithHistory = report(storeOf([pool(1, usdcToken, T0 * 101 / 100, C0 * 101 / 100)]), ?HOURLY, ratioSamples(288, 400_000_000_000));
  assert addedWithHistory.lockedShare == base.lockedShare;

  // -10 % of both reserves: the pools value falls, the ratio 40 % -> 36 %, m
  // rises at once from 10 % to 14 %, with or without the 24 h average.
  let removedPool = storeOf([pool(1, usdcToken, T0 * 90 / 100, C0 * 90 / 100)]);
  let removed = report(removedPool, ?HOURLY, noSamples);
  assert removed.currentRatio == ?360_000_000_000;
  assert removed.lockedShare == 140_000;
  assert removed.lockedShare > base.lockedShare;
  let removedWithHistory = report(removedPool, ?HOURLY, ratioSamples(288, 400_000_000_000));
  assert removedWithHistory.retainedRatio == ?360_000_000_000;
  assert removedWithHistory.lockedShare == 140_000;
};
