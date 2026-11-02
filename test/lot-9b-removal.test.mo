import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";
import FeeLib "../src/backend/lib/protocol-fees";
import FeeTypes "../src/backend/types/protocol-fees";
import OracleLib "../src/backend/lib/oracle";
import ReserveTypes "../src/backend/types/dex-reserve";

// PTM-9b point 6: when a TTTI-T pair is removed, the reserves of its
// contract-held shares (permanent liquidity) are reinjected with injectPermanent
// into the least liquid other TTTI-T pool, with a public journal line. They
// never go to a wallet and never stay in the removed pool. When no pool can take
// them they wait in the permanent set-aside (logged), never lost.

let wallet = Principal.fromText("aaaaa-aa");
let now : Int = 1_000_000_000_000_000_000;

let ICP = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let CKUSDC = "xevnm-gaaaa-aaaar-qafnq-cai";

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(ICP)); symbol = "ICP"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(CKUSDC)); symbol = "ckUSDC"; decimals = 6 };

// TTTI-T / counter pool (TTTI-T is token0).
func pool(id : Nat, counter : DexTypes.PoolToken, tttiReserve : Nat, counterReserve : Nat, totalShares : Nat, lockedShares : Nat) : DexTypes.Pool {
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
    totalShares;
    lockedShares;
    protocolFee0 = 0;
    protocolFee1 = 0;
    lockedFeesPaid0 = 0;
    lockedFeesPaid1 = 0;
  };
};

// A pool whose removal completed: status #removed, no position left.
func removedPool(id : Nat, counter : DexTypes.PoolToken, tttiReserve : Nat, counterReserve : Nat, shares : Nat) : DexTypes.Pool {
  { pool(id, counter, tttiReserve, counterReserve, shares, shares) with status = #removed; removedAt = ?now };
};

func storeOf(pools : [DexTypes.Pool]) : DexTypes.DexStore {
  let map = Map.empty<Nat, DexTypes.Pool>();
  let removals = Map.empty<DexTypes.PoolId, DexTypes.PairRemoval>();
  for (p in pools.values()) {
    map.add(p.id, p);
    if (p.status == #removed) {
      removals.add(p.id, { poolId = p.id; reason = "test"; announcedAt = 0; effectiveAt = 0; state = #completed({ completedAt = now }) });
    };
  };
  {
    pools = map;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = pools.size() + 1;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 1;
    removals;
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

func oracleOf(usdE8 : Nat) : OracleLib.OracleStore {
  {
    var usdE8;
    var source = #coinbase;
    var fetchedAt = now;
    var validUntil = now + 3_600_000_000_000;
    var lastError = null;
    var lastSuccessAt = ?now;
  };
};

type Fixture = {
  store : { protocolLiquidity : Map.Map<DexTypes.PoolId, FeeTypes.ProtocolLiquidity> };
  dex : DexTypes.DexStore;
  oracle : OracleLib.OracleStore;
  tokenRates : OracleLib.TokenRateStore;
  pause : ReserveTypes.PauseState;
  permanent : FeeTypes.PermanentLiquidityStore;
};

func fixture(pools : [DexTypes.Pool]) : Fixture {
  {
    store = { protocolLiquidity = Map.empty<DexTypes.PoolId, FeeTypes.ProtocolLiquidity>() };
    dex = storeOf(pools);
    oracle = oracleOf(500_000_000); // ICP 5 USD
    tokenRates = { ckbtc = oracleOf(6_000_000_000_000); ckusdc = oracleOf(100_000_000); ckusdt = oracleOf(100_000_000) };
    pause = { var paused = false; var reason = null; var resumed = null };
    permanent = { setAside = Map.empty<Text, Nat>(); log = List.empty<FeeTypes.PermanentLogEntry>(); var nextLogId = 1; lastWaiting = Map.empty<Text, Text>() };
  };
};

func reservesOf(f : Fixture, id : Nat) : (Nat, Nat, Nat, Nat) {
  switch (f.dex.pools.get(id)) {
    case (?p) (p.reserve0, p.reserve1, p.totalShares, p.lockedShares);
    case null (0, 0, 0, 0);
  };
};

func logOf(f : Fixture) : [FeeTypes.PermanentLogEntry] = f.permanent.log.toArray();

func contains(text : Text, part : Text) : Bool = text.contains(#text part);

// Removed pool #1: TTTI-T 10 000 000 000 / ckUSDC 100 000 000, all of it held
// by the contract (100 000 shares, no liquidity provider left).
// Pool #2 (ckUSDC 5 000 USDC) is deeper than pool #3 (ckUSDC 1 000 USDC), so
// the reserves go to pool #3 (the least liquid). Same price ratio 100 : 1.
let T0 = 10_000_000_000;
let X0 = 100_000_000;

// A wallet balance of the DEX must not move.
let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
DexLib.credit(balances, wallet, #tttiT, 777);
DexLib.credit(balances, wallet, #icp, 55);

// --- 1. Reinjection into the least liquid TTTI-T pool ---------------------------

do {
  let f = fixture([
    removedPool(1, usdcToken, T0, X0, 100_000),
    pool(2, usdcToken, 500_000_000_000, 5_000_000_000, 1_000_000, 1_000),
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  let (deepR0, deepR1, deepShares, deepLocked) = reservesOf(f, 2);
  FeeLib.reinjectRemovedPool(f, 1, now);
  // The removed pool holds nothing any more.
  assert reservesOf(f, 1) == (0, 0, 0, 0);
  // Pool #2 (deeper) is untouched.
  assert reservesOf(f, 2) == (deepR0, deepR1, deepShares, deepLocked);
  // Pool #3 received the reserves as contract-held locked shares.
  let (r0, r1, total, locked) = reservesOf(f, 3);
  assert r0 > 100_000_000_000 and r0 <= 100_000_000_000 + T0;
  assert r1 > 1_000_000_000 and r1 <= 1_000_000_000 + X0;
  assert locked > 1_000;
  assert total - locked == 1_000_000 - 1_000; // not a single provider share created
  assert total > 1_000_000;
  // The injected shares are recorded as protocol liquidity of pool #3.
  switch (f.store.protocolLiquidity.get(3)) {
    case (?l) assert l.shares == locked - 1_000;
    case null assert false;
  };
  // One public journal line #injected naming the pair removal and the target pool.
  let log = logOf(f);
  assert log.size() >= 1;
  let line = log[0];
  assert line.kind == #injected;
  assert line.poolId == ?3;
  assert line.shares == locked - 1_000;
  switch (line.reason) {
    case (?reason) assert contains(reason, "Pair removal TTTI-T/ckUSDC") and contains(reason, "pool #1");
    case null assert false;
  };
  // Everything left over (ratio rounding) stays in the set-aside, nothing is lost:
  // reserves added to pool #3 + set-aside = what the removed pool held.
  let addedT = r0 - 100_000_000_000;
  let addedX = r1 - 1_000_000_000;
  assert addedT + FeeLib.permanentAmount(f.permanent, #tttiT) == T0;
  assert addedX + FeeLib.permanentAmount(f.permanent, #ckusdc) == X0;
  // No wallet balance changed.
  assert DexLib.available(balances, wallet, #tttiT) == 777;
  assert DexLib.available(balances, wallet, #icp) == 55;
  // The public view of the journal shows the line.
  let page = FeeLib.listPermanentLog(f.permanent, 0, 10);
  assert page.total == log.size();
};

// Running it again changes nothing (the removed pool has nothing left).
do {
  let f = fixture([
    removedPool(1, usdcToken, T0, X0, 100_000),
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  FeeLib.reinjectRemovedPool(f, 1, now);
  let after = reservesOf(f, 3);
  let lines = logOf(f).size();
  FeeLib.reinjectRemovedPool(f, 1, now);
  FeeLib.reinjectRemovedPools(f, now);
  assert reservesOf(f, 3) == after;
  assert logOf(f).size() == lines;
};

// The sweep reinjects every removed pool that still holds contract shares.
do {
  let f = fixture([
    removedPool(1, usdcToken, T0, X0, 100_000),
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  FeeLib.reinjectRemovedPools(f, now);
  assert reservesOf(f, 1) == (0, 0, 0, 0);
  assert reservesOf(f, 3).3 > 1_000;
};

// An active pool or a pool under removal is never emptied.
do {
  let f = fixture([
    pool(1, usdcToken, T0, X0, 100_000, 100_000),
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  FeeLib.reinjectRemovedPool(f, 1, now);
  assert reservesOf(f, 1) == (T0, X0, 100_000, 100_000);
  assert logOf(f).size() == 0;
};

// --- 2. No other TTTI-T pool: the amount waits, logged ---------------------------

do {
  let f = fixture([removedPool(1, usdcToken, T0, X0, 100_000)]);
  FeeLib.reinjectRemovedPool(f, 1, now);
  // Nothing stays in the removed pool.
  assert reservesOf(f, 1) == (0, 0, 0, 0);
  // The amounts are recorded in the permanent set-aside, so the router retries them.
  assert FeeLib.permanentAmount(f.permanent, #tttiT) == T0;
  assert FeeLib.permanentAmount(f.permanent, #ckusdc) == X0;
  let log = logOf(f);
  assert log.size() == 1;
  assert log[0].kind == #waiting;
  assert log[0].poolId == ?1;
  assert log[0].amount == T0;
  assert log[0].otherAmount == X0;
  switch (log[0].reason) {
    case (?reason) assert contains(reason, "Pair removal TTTI-T/ckUSDC");
    case null assert false;
  };
  assert DexLib.available(balances, wallet, #tttiT) == 777;
};

// --- 3. Least liquid pool pairs with another token: waits for the router balance -

do {
  let f = fixture([
    removedPool(1, usdcToken, T0, X0, 100_000),
    pool(4, icpToken, 100_000_000_000, 2_000_000_000, 1_000_000, 1_000),
  ]);
  FeeLib.reinjectRemovedPool(f, 1, now);
  assert reservesOf(f, 1) == (0, 0, 0, 0);
  // The target pool is untouched; the reserves wait in the set-aside.
  assert reservesOf(f, 4) == (100_000_000_000, 2_000_000_000, 1_000_000, 1_000);
  assert FeeLib.permanentAmount(f.permanent, #tttiT) == T0;
  assert FeeLib.permanentAmount(f.permanent, #ckusdc) == X0;
  let log = logOf(f);
  assert log.size() == 1;
  assert log[0].kind == #waiting;
};

// --- 4. Pause: nothing moves, retried later --------------------------------------

do {
  let f = fixture([
    removedPool(1, usdcToken, T0, X0, 100_000),
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  f.pause.paused := true;
  FeeLib.reinjectRemovedPool(f, 1, now);
  assert reservesOf(f, 1) == (T0, X0, 100_000, 100_000);
  assert logOf(f).size() == 0;
  f.pause.paused := false;
  FeeLib.reinjectRemovedPool(f, 1, now);
  assert reservesOf(f, 1) == (0, 0, 0, 0);
};

// --- 5. Provider shares of the removed pool are untouched ------------------------

do {
  // Contract shares 1 000 of 11 000: only their part leaves the pool.
  let f = fixture([
    { pool(1, usdcToken, 11_000_000_000, 110_000_000, 11_000, 1_000) with status = #removed; removedAt = ?now },
    pool(3, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
  ]);
  switch (DexLib.releaseContractReserves(f.dex, 1)) {
    case (?r) {
      assert r.amount0 == 1_000_000_000;
      assert r.amount1 == 10_000_000;
      assert r.shares == 1_000;
    };
    case null assert false;
  };
  assert reservesOf(f, 1) == (10_000_000_000, 100_000_000, 10_000, 0);
};
