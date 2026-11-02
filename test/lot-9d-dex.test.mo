import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import DexLib "../src/backend/lib/dex";
import DexPotLib "../src/backend/lib/dex-pot";
import DexTypes "../src/backend/types/dex";
import IndicatorTypes "../src/backend/types/dex-indicators";

// PTM-9d: per-pool LP fee pot and daily sliced sharing.
//   - the swap path (shareLpFee) adds to the pending pot and touches no position;
//   - sharing in slices gives exactly what a single pass gives;
//   - a position locked half the day receives half the share of a position
//     locked all day (same weight);
//   - an unpaid share of a removed position is paid at the sharing;
//   - without any locked position the pot goes to the pool reserves.

let DAY : Int = DexTypes.SHARING_DAY_NS;
let YEAR : Int = 365 * DAY;

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")); symbol = "ICP"; decimals = 8 };

func owner(i : Nat) : Principal {
  Principal.fromBlob(Blob.fromArray([1, Nat8.fromNat(i)]));
};

func pool() : DexTypes.Pool {
  {
    id = 1;
    token0 = tttiToken;
    token1 = icpToken;
    feeTier = #bps30;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    minimumLocked = { token0 = null; token1 = null };
    newPairBadgeUntil = null;
    requestId = null;
    removedAt = null;
    reserve0 = 100_000_000_000;
    reserve1 = 1_000_000_000;
    totalShares = 1_000_000;
    lockedShares = 1_000;
    protocolFee0 = 0;
    protocolFee1 = 0;
    lockedFeesPaid0 = 0;
    lockedFeesPaid1 = 0;
  };
};

func store() : DexTypes.DexStore {
  let pools = Map.empty<Nat, DexTypes.Pool>();
  pools.add(1, pool());
  {
    pools;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 2;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 100;
    removals = Map.empty<DexTypes.PoolId, DexTypes.PairRemoval>();
    icpswapSamples = Map.empty<Text, DexTypes.IcpSwapSample>();
    poolPositions = Map.empty<DexTypes.PoolId, Set.Set<DexTypes.PositionId>>();
    fees = {
      var dayStart = 0;
      var nextSharingAt = DAY;
      pots = Map.empty<DexTypes.PoolId, DexTypes.PoolPot>();
      locks = Map.empty<DexTypes.PositionId, DexTypes.PositionLock>();
      unpaid = Map.empty<Text, DexTypes.UnpaidShare>();
    };
  };
};

// Locked position of the pool, locked at `at`.
func addLocked(s : DexTypes.DexStore, id : Nat, who : Principal, shares : Nat, unlockAt : Int, at : Int) {
  let p : DexTypes.Position = {
    id;
    poolId = 1;
    owner = who;
    shares;
    createdAt = at;
    lockDurationNs = 0;
    unlockAt;
    isCreator = false;
    lockStartedAt = at;
    relayReceivedNs = 0;
    feesCollected0 = 0;
    feesCollected1 = 0;
  };
  s.positions.add(id, p);
  DexLib.indexAdd(s, 1, id);
  DexLib.startLock(s, p, at);
};

func reserves0(s : DexTypes.DexStore) : Nat {
  switch (s.pools.get(1)) {
    case (?p) p.reserve0;
    case null 0;
  };
};

func reserves1(s : DexTypes.DexStore) : Nat {
  switch (s.pools.get(1)) {
    case (?p) p.reserve1;
    case null 0;
  };
};

func addPending(s : DexTypes.DexStore, a0 : Nat, a1 : Nat) {
  let pot = DexLib.potOf(s, 1);
  pot.pending0 += a0;
  pot.pending1 += a1;
};

// Runs the sharing of pool 1 until done; returns the number of slices.
func runAll(s : DexTypes.DexStore, balances : DexTypes.DexBalances, sliceSize : Nat) : Nat {
  var calls = 0;
  var more = true;
  while (more and calls < 1_000) {
    let r = DexPotLib.runSlice(s, balances, 1, sliceSize);
    more := r.more;
    calls += 1;
  };
  assert not more;
  calls;
};

// --- A swap touches no position ------------------------------------------------

do {
  let s = store();
  for (i in Nat.range(0, 5)) {
    addLocked(s, i + 1, owner(i), 1_000 * (i + 1), YEAR * (i + 1), 0);
  };
  let before = s.positions.values().toArray();
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  let share0 = DexLib.shareLpFee(s, balances, 1, true, 1_001, 10);
  let share1 = DexLib.shareLpFee(s, balances, 1, false, 400, 11);
  // Half stays in the reserves (the odd unit too), half goes to the pot.
  assert share0.credited == 500 and share0.reserve == 501 and share0.positions == 0;
  assert share1.credited == 200 and share1.reserve == 200;
  let pot = DexLib.potOf(s, 1);
  assert pot.pending0 == 500 and pot.pending1 == 200;
  // No position was read for writing, no balance was touched.
  assert s.positions.values().toArray() == before;
  assert balances.size() == 0;
  assert DexLib.potOwed(s, 1) == (500, 200);
  // The estimated share exists before the sharing.
  let est = DexPotLib.estimatedSharesOf(s, owner(0), DAY / 2);
  assert est.size() == 1;
  assert est[0].estimated0 > 0;
};

// --- Sliced sharing = single pass ----------------------------------------------

func sharing(sliceSize : Nat) : ([(Nat, Nat)], Nat, Nat, Nat, Nat) {
  let s = store();
  let n = 23;
  for (i in Nat.range(0, n)) {
    addLocked(s, i + 1, owner(i), 1_000 + 137 * i, YEAR + DAY * (i + 1) * 17, 0);
  };
  addPending(s, 1_000_003, 777);
  let r0 = reserves0(s);
  let r1 = reserves1(s);
  let roll = DexPotLib.startDayRoll(s, DAY);
  assert roll.rolled and roll.poolsStarted == 1;
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  let calls = runAll(s, balances, sliceSize);
  let paid = Array.tabulate<(Nat, Nat)>(n, func(i) = (DexLib.available(balances, owner(i), #tttiT), DexLib.available(balances, owner(i), #icp)));
  var sum0 = 0;
  var sum1 = 0;
  for ((a, b) in paid.values()) {
    sum0 += a;
    sum1 += b;
  };
  // Conservation: paid + remainder kept in the reserves = the frozen pot.
  assert sum0 + (reserves0(s) - r0) == 1_000_003;
  assert sum1 + (reserves1(s) - r1) == 777;
  // Nothing left in the pot, nothing owed any more.
  assert DexLib.potOwed(s, 1) == (0, 0);
  // Lock records opened for the new day.
  switch (s.fees.locks.get(1)) {
    case (?l) { assert l.lockedFrom == DAY and l.lockedUntil == null };
    case null { assert false };
  };
  (paid, sum0, sum1, calls, reserves0(s));
};

do {
  let (single, s0, s1, callsSingle, res0) = sharing(10_000);
  let (sliced, t0, t1, callsSliced, res0b) = sharing(5);
  assert single == sliced;
  assert s0 == t0 and s1 == t1 and res0 == res0b;
  // Several slices were really needed, and the rounding remainder is small.
  assert callsSingle == 2;
  assert callsSliced > 2;
  assert 1_000_003 - s0 < 23;
  assert s0 > 0 and s1 > 0;
};

// A second day roll before the next day does nothing.
do {
  let s = store();
  addLocked(s, 1, owner(0), 1_000, YEAR, 0);
  addPending(s, 100, 0);
  assert not DexPotLib.startDayRoll(s, DAY - 1).rolled;
  assert DexPotLib.startDayRoll(s, DAY).rolled;
  // The previous sharing is still running: no new roll.
  assert not DexPotLib.startDayRoll(s, 3 * DAY).rolled;
  assert DexPotLib.runningPools(s) == [1];
};

// --- Half a day locked = half the share ----------------------------------------

do {
  let s = store();
  addLocked(s, 1, owner(1), 1_000, 2 * YEAR, 0); // locked all day
  addLocked(s, 2, owner(2), 1_000, 2 * YEAR, DAY / 2); // locked the second half
  // Same weight for both, so that only the locked time differs.
  let w = switch (s.fees.locks.get(1)) {
    case (?l) l.weight;
    case null 0;
  };
  switch (s.fees.locks.get(2)) {
    case (?l) { l.weight := w };
    case null { assert false };
  };
  assert w > 0;
  switch (s.fees.locks.get(1), s.fees.locks.get(2)) {
    case (?a, ?b) {
      let pa = DexLib.lockProduct(a, 2 * YEAR, 0, DAY);
      let pb = DexLib.lockProduct(b, 2 * YEAR, 0, DAY);
      assert pa == w * Int.abs(DAY);
      assert pb * 2 == pa;
    };
    case _ { assert false };
  };
  addPending(s, 3_000, 0);
  ignore DexPotLib.startDayRoll(s, DAY);
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  ignore runAll(s, balances, 5_000);
  assert DexLib.available(balances, owner(1), #tttiT) == 2_000;
  assert DexLib.available(balances, owner(2), #tttiT) == 1_000;
  // feesCollected and lockedFeesPaid follow the credits.
  switch (s.positions.get(1)) {
    case (?p) { assert p.feesCollected0 == 2_000 };
    case null { assert false };
  };
  switch (s.pools.get(1)) {
    case (?p) { assert p.lockedFeesPaid0 == 3_000 };
    case null { assert false };
  };
};

// --- Unpaid share of a position removed during the day ---------------------------

do {
  let s = store();
  addLocked(s, 1, owner(1), 1_000, 2 * YEAR, 0);
  let w = switch (s.fees.locks.get(1)) {
    case (?l) l.weight;
    case null 0;
  };
  // A position of owner 9 locked half the day, then removed: its product is
  // recorded under owner and pool.
  let gone = owner(9);
  s.fees.unpaid.add(DexLib.unpaidKey(gone, 1), { owner = gone; poolId = 1; var productNs = w * Int.abs(DAY / 2) });
  addPending(s, 3_000, 0);
  ignore DexPotLib.startDayRoll(s, DAY);
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  ignore runAll(s, balances, 5_000);
  assert DexLib.available(balances, owner(1), #tttiT) == 2_000;
  assert DexLib.available(balances, gone, #tttiT) == 1_000;
  assert s.fees.unpaid.size() == 0;
};

// --- Nobody locked during the day: the pot goes to the reserves -----------------

do {
  let s = store();
  // A free position (no lock record).
  let p : DexTypes.Position = {
    id = 1;
    poolId = 1;
    owner = owner(1);
    shares = 1_000;
    createdAt = 0;
    lockDurationNs = 0;
    unlockAt = 0;
    isCreator = false;
    lockStartedAt = 0;
    relayReceivedNs = 0;
    feesCollected0 = 0;
    feesCollected1 = 0;
  };
  s.positions.add(1, p);
  DexLib.indexAdd(s, 1, 1);
  addPending(s, 900, 90);
  let r0 = reserves0(s);
  let r1 = reserves1(s);
  ignore DexPotLib.startDayRoll(s, DAY);
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  ignore runAll(s, balances, 5_000);
  assert balances.size() == 0;
  assert reserves0(s) == r0 + 900 and reserves1(s) == r1 + 90;
  assert DexLib.potOwed(s, 1) == (0, 0);
};

// --- A swap reads no position ------------------------------------------------------

func indicatorsStore() : IndicatorTypes.IndicatorsStore {
  {
    var snapshot = null;
    var lastComputedAt = null;
    var lastError = null;
    var lastSuccessAt = null;
    var recordingSince = null;
    activity = Map.empty<Nat, IndicatorTypes.PoolActivity>();
  };
};

// ICP at 500 USD: the pool is deep enough to be open for swaps.
func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ICP") ?(500 * 100_000_000) else null;
};

do {
  let s = store();
  let now : Int = DAY / 2;
  for (i in Nat.range(0, 5)) {
    addLocked(s, i + 1, owner(i), 1_000 * (i + 1), YEAR * (i + 1), 0);
  };
  DexLib.refreshLockedShares(s, 1, now);
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner(7), #icp, 10_000_000);
  // Honest positions: the swap result carries the exact guaranteed depth.
  let exact = DexLib.guaranteedDepthOf(s, pool(), rateOf, now).lockedPositionShares;
  assert exact == 15_000;
  // Now corrupt every stored position (free, 7 shares): a swap that read a
  // position would report 0 locked shares.
  for (i in Nat.range(0, 5)) {
    switch (s.positions.get(i + 1)) {
      case (?p) s.positions.add(i + 1, { p with shares = 7; unlockAt = 0 });
      case null { assert false };
    };
  };
  let tampered = s.positions.values().toArray();
  let result = switch (DexLib.swap(s, balances, owner(99), owner(7), 1, #icp, 1_000_000, 0, now + 60_000_000_000, false, rateOf, now, indicatorsStore())) {
    case (#ok(r)) r;
    case (#err(_)) { assert false; loop {} };
  };
  assert result.pool.guaranteedDepth.lockedPositionShares == 15_000;
  assert result.pool.guaranteedDepth.permanentShares == 1_000;
  // The swap neither read nor wrote any position.
  assert s.positions.values().toArray() == tampered;
  // The public views keep the exact value (a scan of the current positions).
  assert DexLib.guaranteedDepthOf(s, pool(), rateOf, now).lockedPositionShares == 0;
  // A position operation refreshes the maintained figure.
  DexLib.refreshLockedShares(s, 1, now);
  assert DexLib.potOf(s, 1).lockedPositionShares == 0;
};

// The daily pass refreshes the maintained figure over the slices.
do {
  let s = store();
  for (i in Nat.range(0, 23)) {
    // Every third position ends its lock before the end of the day.
    addLocked(s, i + 1, owner(i), 1_000 + i, if (i % 3 == 0) DAY / 2 else 2 * YEAR, 0);
  };
  DexLib.refreshLockedShares(s, 1, 0);
  addPending(s, 1_000, 10);
  assert DexPotLib.startDayRoll(s, DAY).rolled;
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  ignore runAll(s, balances, 5);
  let pot = DexLib.potOf(s, 1);
  assert pot.lockedPositionShares == DexLib.guaranteedDepthOf(s, pool(), rateOf, DAY).lockedPositionShares;
  assert pot.lockedPositionShares > 0;
};

// --- Day roll anchored to the previous boundary --------------------------------------

do {
  let HOUR : Int = 3_600_000_000_000;
  let s = store();
  addLocked(s, 1, owner(0), 1_000, 2 * YEAR, 0);
  addPending(s, 100, 0);
  // The pass runs 3 hours after the boundary: the next boundary stays at 2 days.
  assert DexPotLib.startDayRoll(s, DAY + 3 * HOUR).rolled;
  assert s.fees.nextSharingAt == 2 * DAY;
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  ignore runAll(s, balances, 5_000);
  addPending(s, 100, 0);
  // The next day's pass, which arrives 1 hour after its boundary, rolls.
  assert DexPotLib.startDayRoll(s, 2 * DAY + HOUR).rolled;
  assert s.fees.nextSharingAt == 3 * DAY;
  ignore runAll(s, balances, 5_000);
  // After a long gap the boundary moves to the first one after the pass.
  addPending(s, 100, 0);
  assert DexPotLib.startDayRoll(s, 7 * DAY + 5).rolled;
  assert s.fees.nextSharingAt == 8 * DAY;
};
