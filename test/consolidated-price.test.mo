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

// Swap-opening threshold: 10 USD of depth (swaps only). 1 TTTI-T per 1 ckUSDC.
do {
  assert DexLib.SWAP_THRESHOLD_USD_E8 == 1_000_000_000;
  func openAt(counter : Nat) : Bool {
    let p = pool(1, usdcToken, 100_000_000, counter);
    DexLib.swapStateOf(storeOf([p]), p, rateOf, now).open;
  };
  // Depth = 2 x counter side: 9.999998 USD stays closed, 10 USD opens.
  assert not openAt(4_999_999);
  assert openAt(5_000_000);
  // 50 USD of depth was closed under the old 100 USD threshold; it is open now.
  assert openAt(25_000_000);
  // Same pool, below the threshold: the consolidated price leaves it out.
  let p = pool(1, usdcToken, 100_000_000, 4_999_999);
  assert DexLib.consolidatedNow(storeOf([p]), rateOf, now).price == null;
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

// --- 2. Spread against the consolidated price --------------------------------

// consolidated = 116 666 666: pool 1 = (1e8 - c) x 10 000 / c = -1428 (toward
// zero), pool 2 = +714, pool 3 is not open so it has no spread.
do {
  let report = DexLib.poolSpreads(mixed, rateOf, now);
  assert report.consolidatedPriceUsdE8 == ?116_666_666;
  assert report.thresholdBps == 200;
  assert report.pools.size() == 3;
  assert report.pools[0].status == #ok;
  assert report.pools[0].spreadBps == ?(-1428);
  assert report.pools[0].exceedsThreshold;
  assert report.pools[1].status == #ok;
  assert report.pools[1].spreadBps == ?714;
  assert report.pools[1].exceedsThreshold;
  assert report.pools[2].status == #notOpen;
  assert report.pools[2].spreadBps == null;
  assert not report.pools[2].exceedsThreshold;
};

// poolSpreadOf (PoolView.spread) gives the same value as the report.
do {
  switch (mixed.pools.get(2)) {
    case (?p) {
      switch (DexLib.poolSpreadOf(mixed, p, rateOf, now)) {
        case (?s) {
          assert s.spreadBps == ?714;
          assert s.priceUsdE8 == ?125_000_000;
        };
        case null assert false;
      };
    };
    case null assert false;
  };
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

// Prices 1.02 / 0.98 USD at equal depth: consolidated 1.00, spreads exactly
// +200 / -200 bps. Exactly 200 is not above the threshold: no alert.
// TTTI-T reserves: 2.499e12 x 1e8 / 1.02e8 = 2.45e12 and / 0.98e8 = 2.55e12.
do {
  let store = equalDepthPair(2_450_000_000_000, 2_550_000_000_000, 24_990_000_000);
  addPosition(store, 1, 1, alice);
  addPosition(store, 2, 2, alice);
  let c = DexLib.consolidatedNow(store, rateOf, now);
  assert c.price == ?100_000_000;
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.pools[0].spreadBps == ?200;
  assert report.pools[1].spreadBps == ?(-200);
  assert not report.pools[0].exceedsThreshold;
  assert not report.pools[1].exceedsThreshold;
  assert DexLib.spreadAlerts(store, alice, rateOf, now).size() == 0;
};

// Prices 1.03 / 0.97 USD: spreads +300 / -300 bps, above the threshold.
// TTTI-T reserves: 9.991e12 x 1e8 / 1.03e8 = 9.7e12 and / 0.97e8 = 1.03e13.
do {
  let store = equalDepthPair(9_700_000_000_000, 10_300_000_000_000, 99_910_000_000);
  addPosition(store, 1, 1, alice); // alice is an LP of the pool at +300
  addPosition(store, 2, 2, bob); // bob is an LP of the pool at -300
  let report = DexLib.poolSpreads(store, rateOf, now);
  assert report.consolidatedPriceUsdE8 == ?100_000_000;
  assert report.pools[0].spreadBps == ?300;
  assert report.pools[1].spreadBps == ?(-300);
  assert report.pools[0].exceedsThreshold;
  assert report.pools[1].exceedsThreshold;

  let aliceAlerts = DexLib.spreadAlerts(store, alice, rateOf, now);
  assert aliceAlerts.size() == 1;
  assert aliceAlerts[0].poolId == 1;
  assert aliceAlerts[0].spreadBps == 300;
  assert aliceAlerts[0].thresholdBps == 200;
  assert aliceAlerts[0].consolidatedPriceUsdE8 == 100_000_000;
  assert aliceAlerts[0].positionIds == [1];

  let bobAlerts = DexLib.spreadAlerts(store, bob, rateOf, now);
  assert bobAlerts.size() == 1;
  assert bobAlerts[0].poolId == 2;
  assert bobAlerts[0].spreadBps == -300;

  // Not an LP of any pool: no alert. Anonymous caller: no alert.
  assert DexLib.spreadAlerts(store, Principal.fromText("2vxsx-fae"), rateOf, now).size() == 0;
};
