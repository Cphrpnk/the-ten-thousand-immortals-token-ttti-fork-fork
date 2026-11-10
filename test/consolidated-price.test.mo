import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";
import FeeTypes "../src/backend/types/protocol-fees";

// PTM-5 consolidated TTTI-T price: pure tests that run in the interpreter.
//
//  1. Depth-weighted consolidated price (pools left out when not open).
//  2. Per-pool spread against the consolidated price.
//  3. Hour / 24 h windows over the consolidated samples (old samples trimmed).
//  4. The alert fires only when |spread| is strictly above 200 bps.
//
// Prices are USD x 1e8 per whole TTTI-T (8 decimals). Rates: ICP 5 USD,
// ckUSDC / ckUSDT 1 USD, all USD x 1e8.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let now : Int = 1_000_000_000_000_000_000;

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

func addPosition(store : DexStore, id : Nat, poolId : Nat, owner : Principal) {
  store.positions.add(
    id,
    {
      id;
      poolId;
      owner;
      shares = 1_000;
      createdAt = 0;
      lockDurationNs = 0;
      unlockAt = 0;
      isCreator = false;
      lockStartedAt = 0;
      relayReceivedNs = 0;
      feesCollected0 = 0;
      feesCollected1 = 0;
      mintShareE6 = 0;
    },
  );
  DexLib.indexAdd(store, poolId, id);
};

type DexStore = DexTypes.DexStore;

// Pair of pools of equal depth (24 990 USD each side) whose prices are
// price1 / price2: the consolidated price is their mean, so each pool's spread
// is exactly (price - mean) / mean.
//   U = counter USD value = 2.499e12; TTTI-T reserve = U x 1e8 / price.
func equalDepthPair(tttiX : Nat, tttiY : Nat, counter : Nat) : DexStore {
  storeOf([pool(1, usdcToken, tttiX, counter), pool(2, usdtToken, tttiY, counter)]);
};

// --- 1. Depth-weighted consolidated price ------------------------------------

// Pool 1 (ckUSDC): price 1.00 USD, depth 2 000 USD.
// Pool 2 (ICP at 5 USD): price 1.25 USD, depth 4 000 USD.
// Pool 3 (ckUSDT): depth 2 USD, under the 10 USD threshold: left out.
// (1e8 x 2e11 + 1.25e8 x 4e11) / 6e11 = 116 666 666 (rounded down).
let mixed = storeOf([
  pool(1, usdcToken, 100_000_000_000, 1_000_000_000),
  pool(2, icpToken, 160_000_000_000, 40_000_000_000),
  pool(3, usdtToken, 100_000_000, 1_000_000),
]);

do {
  let c = DexLib.consolidatedNow(mixed, rateOf, now);
  assert c.price == ?116_666_666;
  assert c.unavailable == null;
  assert c.sources.size() == 2;
  assert c.sources[0].poolId == 1;
  assert c.sources[0].priceUsdE8 == 100_000_000;
  assert c.sources[0].depthUsdE8 == 200_000_000_000;
  assert c.sources[0].weightBps == 3333;
  assert c.sources[1].poolId == 2;
  assert c.sources[1].priceUsdE8 == 125_000_000;
  assert c.sources[1].depthUsdE8 == 400_000_000_000;
  // The weights always sum to 10 000.
  assert c.sources[0].weightBps + c.sources[1].weightBps == 10_000;
};

// Swap-opening threshold: 10 USD (SWAP_THRESHOLD_USD_E8). The measure depends
// on the kind of pair (DexLib.thresholdMeasureAt):
//   - TTTI-T pair: the TTTI-T side at the pool price, i.e. the counterpart
//     reserve at the oracle rate (the sum of both sides is not used);
//   - utility pair: the sum of both sides.
do {
  assert DexLib.SWAP_THRESHOLD_USD_E8 == 1_000_000_000;

  // TTTI-T / ckUSDC pair, 1 TTTI-T per 1 ckUSDC (ckUSDC has 6 decimals, so
  // 10_000_000 base units = 10 USD).
  func openAt(counter : Nat) : Bool {
    let p = pool(1, usdcToken, 100_000_000, counter);
    DexLib.swapStateOf(storeOf([p]), p, rateOf, now).open;
  };
  // The TTTI-T side at the pool price is worth the counter reserve: 9.999999
  // USD stays closed, 10 USD opens (the old rule, 2 x counterpart >= 10 USD,
  // opened at 5 USD).
  assert not openAt(9_999_999);
  assert openAt(10_000_000);
  // 5 USD on each side (10 USD of total depth) is below the threshold now.
  assert not openAt(5_000_000);
  assert not openAt(4_999_999);
  assert openAt(25_000_000);
  do {
    let p = pool(1, usdcToken, 100_000_000, 10_000_000);
    assert DexLib.thresholdMeasureAt(p, p.reserve0, p.reserve1, rateOf) == ?1_000_000_000;
    let q = pool(1, usdcToken, 100_000_000, 9_999_999);
    assert DexLib.thresholdMeasureAt(q, q.reserve0, q.reserve1, rateOf) == ?999_999_900;
  };
  // The measure follows the pool price, not the TTTI-T amount.
  do {
    let p = pool(1, usdcToken, 1_000_000_000_000, 9_999_999);
    assert not DexLib.swapStateOf(storeOf([p]), p, rateOf, now).open;
  };

  // TTTI-T / ICP pair (ICP at 5 USD, 8 decimals): 2 ICP = 10 USD.
  func openIcpAt(counter : Nat) : Bool {
    let p = pool(1, icpToken, 100_000_000, counter);
    DexLib.swapStateOf(storeOf([p]), p, rateOf, now).open;
  };
  assert not openIcpAt(199_999_999);
  assert openIcpAt(200_000_000);

  // Utility pair (ckUSDC / ckUSDT): the sum of both sides >= 10 USD.
  func utility(reserve0 : Nat, reserve1 : Nat) : DexTypes.Pool {
    { pool(1, usdtToken, reserve0, reserve1) with token0 = usdcToken; kind = #utilityPair };
  };
  func utilityOpen(reserve0 : Nat, reserve1 : Nat) : Bool {
    let p = utility(reserve0, reserve1);
    DexLib.swapStateOf(storeOf([p]), p, rateOf, now).open;
  };
  assert not utilityOpen(4_999_999, 5_000_000); // 9.999999 USD
  assert utilityOpen(5_000_000, 5_000_000); // 10 USD
  assert utilityOpen(1_000_000, 9_000_000); // 10 USD, uneven sides
  assert utilityOpen(10_000_000, 0); // one side only still sums to 10 USD
  assert not utilityOpen(0, 9_999_999);
  do {
    let p = utility(3_000_000, 7_000_000);
    assert DexLib.thresholdMeasureAt(p, p.reserve0, p.reserve1, rateOf) == ?1_000_000_000;
  };

  // Same pool, below the threshold: the consolidated price leaves it out.
  let p = pool(1, usdcToken, 100_000_000, 9_999_999);
  assert DexLib.consolidatedNow(storeOf([p]), rateOf, now).price == null;
  let open = pool(1, usdcToken, 100_000_000, 10_000_000);
  assert DexLib.consolidatedNow(storeOf([open]), rateOf, now).price != null;
};

// A single usable pool: the consolidated price is that pool's price.
do {
  let c = DexLib.consolidatedNow(storeOf([pool(1, icpToken, 160_000_000_000, 40_000_000_000)]), rateOf, now);
  assert c.price == ?125_000_000;
};

// No pool: unavailable, no price invented.
do {
  let c = DexLib.consolidatedNow(storeOf([]), rateOf, now);
  assert c.price == null;
  assert c.unavailable == ?#noOpenPool;
  assert c.sources.size() == 0;
};

// A pool whose rate is absent is left out (here: the only pool).
do {
  let noRate : DexLib.UsdRateOf = func(_ : DexTypes.PoolToken) : ?Nat = null;
  let c = DexLib.consolidatedNow(mixed, noRate, now);
  assert c.price == null;
  assert c.unavailable == ?#noValidRate;
};

// A planned after-state replaces only the target pool's reserves: pool 1 with
// a doubled counter side (price 2.00 USD, depth 4 000 USD) against pool 2.
// (2e8 x 4e11 + 1.25e8 x 4e11) / 8e11 = 162 500 000.
do {
  let c = DexLib.consolidatedWith(
    mixed,
    rateOf,
    now,
    ?{ poolId = 1; reserve0 = 100_000_000_000; reserve1 = 2_000_000_000; totalShares = 1_000_000 },
  );
  assert c.price == ?162_500_000;
  // Nothing is stored: the plain read is unchanged.
  assert DexLib.consolidatedNow(mixed, rateOf, now).price == ?116_666_666;
};

// --- 2. Spread against the independent (leave-one-out) reference --------------

// Each pool is measured against the consolidated price of the OTHER open pools,
// never against a price that includes itself. mixed: pool 1 (1.00 USD) has
// pool 2 (1.25 USD) as reference: (1e8 - 1.25e8) x 10 000 / 1.25e8 = -2000;
// pool 2 has pool 1 as reference: +2500. Pool 3 is not open: no spread, and
// its reference is the consolidated price itself (it is not part of it).
do {
  let report = DexLib.poolSpreads(mixed, rateOf, now);
  assert report.consolidatedPriceUsdE8 == ?116_666_666;
  assert report.thresholdBps == 200;
  assert report.pools.size() == 3;
  assert report.pools[0].status == #ok;
  assert report.pools[0].referencePriceUsdE8 == ?125_000_000;
  assert report.pools[0].spreadBps == ?(-2000);
  assert report.pools[0].exceedsThreshold;
  assert report.pools[1].status == #ok;
  assert report.pools[1].referencePriceUsdE8 == ?100_000_000;
  assert report.pools[1].spreadBps == ?2500;
  assert report.pools[1].exceedsThreshold;
  assert report.pools[2].status == #notOpen;
  assert report.pools[2].spreadBps == null;
  assert report.pools[2].referencePriceUsdE8 == ?116_666_666;
  assert not report.pools[2].exceedsThreshold;
};

// poolSpreadOf (PoolView.spread) gives the same value as the report.
do {
  switch (mixed.pools.get(2)) {
    case (?p) {
      switch (DexLib.poolSpreadOf(mixed, p, rateOf, now)) {
        case (?s) {
          assert s.spreadBps == ?2500;
          assert s.priceUsdE8 == ?125_000_000;
          assert s.referencePriceUsdE8 == ?100_000_000;
        };
        case null assert false;
      };
    };
    case null assert false;
  };
};

// consolidatedExcluding leaves the named pool out: with one other open pool it
// is that pool's price, with none it is unavailable.
do {
  assert DexLib.consolidatedExcluding(mixed, rateOf, now, 1).price == ?125_000_000;
  assert DexLib.consolidatedExcluding(mixed, rateOf, now, 2).price == ?100_000_000;
  let single = storeOf([pool(1, icpToken, 160_000_000_000, 40_000_000_000)]);
  let c = DexLib.consolidatedExcluding(single, rateOf, now, 1);
  assert c.price == null;
  assert c.unavailable == ?#noOpenPool;
};

// A pool cannot move its own reference: pool 1 at 2.00 USD is still measured
// against pool 2 alone (1.25 USD), and pool 2 against pool 1 alone.
do {
  let moved = storeOf([
    pool(1, usdcToken, 100_000_000_000, 2_000_000_000), // price 2.00 USD
    pool(2, icpToken, 160_000_000_000, 40_000_000_000), // price 1.25 USD
  ]);
  let report = DexLib.poolSpreads(moved, rateOf, now);
  assert report.pools[0].referencePriceUsdE8 == ?125_000_000;
  // (2e8 - 1.25e8) x 10 000 / 1.25e8 = +6000
  assert report.pools[0].spreadBps == ?6000;
  assert report.pools[1].referencePriceUsdE8 == ?200_000_000;
  // (1.25e8 - 2e8) x 10 000 / 2e8 = -3750
  assert report.pools[1].spreadBps == ?(-3750);
};

// Single open pool: no independent reference. The status says so, the spread is
// absent (never 0), the threshold is not exceeded and no alert is raised even
// for an LP of that pool.
do {
  let store = storeOf([pool(1, icpToken, 160_000_000_000, 40_000_000_000)]);
  addPosition(store, 1, 1, alice);
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.consolidatedPriceUsdE8 == ?125_000_000;
  assert report.pools.size() == 1;
  assert report.pools[0].status == #noIndependentReference;
  assert report.pools[0].priceUsdE8 == ?125_000_000;
  assert report.pools[0].spreadBps == null;
  assert report.pools[0].referencePriceUsdE8 == null;
  assert not report.pools[0].exceedsThreshold;
  assert DexLib.spreadAlerts(store, alice, rateOf, now).size() == 0;
  switch (store.pools.get(1)) {
    case (?p) {
      switch (DexLib.poolSpreadOf(store, p, rateOf, now)) {
        case (?s) {
          assert s.status == #noIndependentReference;
          assert s.spreadBps == null;
        };
        case null assert false;
      };
    };
    case null assert false;
  };
};

// A second pool that is not open provides no reference either.
do {
  let store = storeOf([
    pool(1, icpToken, 160_000_000_000, 40_000_000_000),
    pool(2, usdtToken, 100_000_000, 1_000_000), // 2 USD: not open
  ]);
  addPosition(store, 1, 1, alice);
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.pools[0].status == #noIndependentReference;
  assert report.pools[0].spreadBps == null;
  assert report.pools[1].status == #notOpen;
  assert DexLib.spreadAlerts(store, alice, rateOf, now).size() == 0;
};

// A utility pair has no spread.
do {
  let utility : DexTypes.Pool = { pool(9, usdtToken, 1, 1) with token0 = usdcToken; kind = #utilityPair };
  assert DexLib.poolSpreadOf(mixed, utility, rateOf, now) == null;
};

// --- 3. Hour and 24 h windows -----------------------------------------------

let HOUR : Int = 3_600_000_000_000;
let DAY : Int = 24 * HOUR;
let MINUTE : Int = 60_000_000_000;

func sample(age : Int, price : Nat) : FeeTypes.ConsolidatedSample = { at = now - age; priceUsdE8 = price };

do {
  let samples = List.empty<FeeTypes.ConsolidatedSample>();
  samples.add(sample(DAY + 5 * MINUTE, 900_000_000)); // older than 24 h: trimmed
  samples.add(sample(DAY, 800_000_000)); // exactly 24 h: still inside
  samples.add(sample(23 * HOUR, 200_000_000));
  samples.add(sample(2 * HOUR, 400_000_000));
  samples.add(sample(30 * MINUTE, 100_000_000));
  samples.add(sample(5 * MINUTE, 300_000_000));

  let day = DexLib.sampleWindow(samples, now, FeeTypes.CONSOLIDATED_RETENTION_NS);
  assert day.count == 5;
  // (8 + 2 + 4 + 1 + 3) x 1e8 / 5 = 3.6e8: the 25 h-old sample is ignored.
  assert day.average == ?360_000_000;
  assert day.oldest == now - DAY;

  let hour = DexLib.sampleWindow(samples, now, FeeTypes.CONSOLIDATED_HOUR_NS);
  assert hour.count == 2;
  assert hour.average == ?200_000_000;
  assert hour.oldest == now - 30 * MINUTE;

  // The retention used by the timer keeps exactly what the 24 h window reads.
  samples.retain(func(s : FeeTypes.ConsolidatedSample) : Bool = now - s.at <= FeeTypes.CONSOLIDATED_RETENTION_NS);
  assert samples.size() == 5;
  assert DexLib.sampleWindow(samples, now, FeeTypes.CONSOLIDATED_RETENTION_NS).average == ?360_000_000;
};

// No sample in the window: no average, count 0.
do {
  let samples = List.empty<FeeTypes.ConsolidatedSample>();
  samples.add(sample(DAY + MINUTE, 500_000_000));
  let day = DexLib.sampleWindow(samples, now, FeeTypes.CONSOLIDATED_RETENTION_NS);
  assert day.count == 0;
  assert day.average == null;
};

// --- 4. Alert only strictly above 200 bps -----------------------------------

// Pool 1 at 1.02 USD, pool 2 at 1.00 USD, equal depth. Pool 1 is measured
// against pool 2 alone: (1.02 - 1.00) / 1.00 = exactly +200 bps. Pool 2 is
// measured against pool 1 alone: (1.00 - 1.02) / 1.02 = -196 bps (toward zero).
// Exactly 200 is not above the threshold: no alert.
// TTTI-T reserves: 2.499e12 x 1e8 / 1.02e8 = 2.45e12, and 2.499e12 at 1.00.
do {
  let store = equalDepthPair(2_450_000_000_000, 2_499_000_000_000, 24_990_000_000);
  addPosition(store, 1, 1, alice);
  addPosition(store, 2, 2, alice);
  let c = DexLib.consolidatedNow(store, rateOf, now);
  assert c.price == ?101_000_000; // the mean of both pools
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.pools[0].referencePriceUsdE8 == ?100_000_000;
  assert report.pools[0].spreadBps == ?200;
  assert report.pools[1].referencePriceUsdE8 == ?102_000_000;
  assert report.pools[1].spreadBps == ?(-196);
  assert not report.pools[0].exceedsThreshold;
  assert not report.pools[1].exceedsThreshold;
  assert DexLib.spreadAlerts(store, alice, rateOf, now).size() == 0;
};

// Prices 1.03 / 0.97 USD: the consolidated price is 1.00, but each pool is
// measured against the other one. Pool 1: (1.03 - 0.97) x 10 000 / 0.97 = +618;
// pool 2: (0.97 - 1.03) x 10 000 / 1.03 = -582 (both toward zero). Both exceed
// the threshold.
// TTTI-T reserves: 9.991e12 x 1e8 / 1.03e8 = 9.7e12 and / 0.97e8 = 1.03e13.
do {
  let store = equalDepthPair(9_700_000_000_000, 10_300_000_000_000, 99_910_000_000);
  addPosition(store, 1, 1, alice); // alice is an LP of the pool at +618
  addPosition(store, 2, 2, bob); // bob is an LP of the pool at -582
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.consolidatedPriceUsdE8 == ?100_000_000;
  assert report.pools[0].referencePriceUsdE8 == ?97_000_000;
  assert report.pools[0].spreadBps == ?618;
  assert report.pools[1].referencePriceUsdE8 == ?103_000_000;
  assert report.pools[1].spreadBps == ?(-582);
  assert report.pools[0].exceedsThreshold;
  assert report.pools[1].exceedsThreshold;

  let aliceAlerts = DexLib.spreadAlerts(store, alice, rateOf, now);
  assert aliceAlerts.size() == 1;
  assert aliceAlerts[0].poolId == 1;
  assert aliceAlerts[0].spreadBps == 618;
  assert aliceAlerts[0].thresholdBps == 200;
  assert aliceAlerts[0].poolPriceUsdE8 == 103_000_000;
  // The alert carries the independent reference, not the consolidated price.
  assert aliceAlerts[0].consolidatedPriceUsdE8 == 97_000_000;
  assert aliceAlerts[0].positionIds == [1];

  let bobAlerts = DexLib.spreadAlerts(store, bob, rateOf, now);
  assert bobAlerts.size() == 1;
  assert bobAlerts[0].poolId == 2;
  assert bobAlerts[0].spreadBps == -582;
  assert bobAlerts[0].consolidatedPriceUsdE8 == 103_000_000;

  // Not an LP of any pool: no alert. Anonymous caller: no alert.
  assert DexLib.spreadAlerts(store, Principal.fromText("2vxsx-fae"), rateOf, now).size() == 0;
};
