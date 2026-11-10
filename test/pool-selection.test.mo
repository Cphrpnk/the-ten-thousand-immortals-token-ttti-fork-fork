import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import DexLib "../src/backend/lib/dex";
import MintLib "../src/backend/lib/liquidity-mint";
import DexTypes "../src/backend/types/dex";
import Types "../src/backend/types/liquidity-mint";

// Manual choice of the mint target pool: pure tests that run in the interpreter.
//
//  1. Recommendation: the eligible pool of the pair with the lowest liquidity.
//  2. A chosen pool overrides the recommendation.
//  3. Invalid choices (unknown, other pair, removed, removal announced) are
//     refused with the precise reason; nothing is touched.
//  4. Two pools of the same pair with different fee tiers: the deposit lands in
//     the chosen pool and the other pool stays unchanged.

let alice = Principal.fromText("aaaaa-aa");
let canister = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let now : Int = 1_000_000_000_000_000_000;

let ICP = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let CKUSDC = "xevnm-gaaaa-aaaar-qafnq-cai";

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(ICP)); symbol = "ICP"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(CKUSDC)); symbol = "ckUSDC"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ICP") ?500_000_000 else if (token.symbol == "ckUSDC") ?100_000_000 else null;
};

func pool(id : Nat, counter : DexTypes.PoolToken, tier : DexTypes.FeeTier, tttiReserve : Nat, counterReserve : Nat) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1 = counter;
    feeTier = tier;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    minimumLocked = { token0 = ?DexLib.TTTI_MINIMUM_LOCKED; token1 = null };
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

func announce(store : DexTypes.DexStore, poolId : Nat, effectiveAt : Int) {
  store.removals.add(poolId, { poolId; reason = "test"; announcedAt = 0; effectiveAt; state = #announced });
};

func reserveOf(store : DexTypes.DexStore, id : Nat) : (Nat, Nat) {
  switch (store.pools.get(id)) {
    case (?p) (p.reserve0, p.reserve1);
    case null { assert false; (0, 0) };
  };
};

// Pools: 1 = TTTI-T/ICP 0.30 % (shallow), 2 = TTTI-T/ICP 1 % (deep),
// 3 = TTTI-T/ckUSDC, 4 = TTTI-T/ICP removed, 5 = TTTI-T/ICP removal announced.
func fixture() : DexTypes.DexStore {
  let removed = { pool(4, icpToken, #bps5, 1_000, 1_000) with status = #removed : DexTypes.PoolStatus; removedAt = ?(5 : Int) };
  let s = storeOf([
    pool(1, icpToken, #bps30, 100_000_000_000, 10_000_000_000),
    pool(2, icpToken, #bps100, 900_000_000_000, 90_000_000_000),
    pool(3, usdcToken, #bps30, 500_000_000_000, 5_000_000_000),
    removed,
    pool(5, icpToken, #bps5, 1_000_000_000, 100_000_000),
  ]);
  announce(s, 5, now + 86_400_000_000_000);
  s;
};

func idOf(r : { #ok : DexTypes.Pool; #err : Types.LiquidityMintError }) : ?Nat {
  switch (r) {
    case (#ok(p)) ?p.id;
    case (#err(_)) null;
  };
};

func reasonOf(r : { #ok : DexTypes.Pool; #err : Types.LiquidityMintError }) : ?Types.InvalidTargetReason {
  switch (r) {
    case (#err(#invalidTargetPool(t))) ?t.reason;
    case _ null;
  };
};

// --- 1. Recommendation ------------------------------------------------------------

// Only pools 1 and 2 are eligible; the recommendation is the shallower one.
do {
  let s = fixture();
  let eligible = MintLib.eligiblePools(s, #icp);
  assert eligible.size() == 2;
  assert eligible[0].id == 1 and eligible[1].id == 2;
  switch (MintLib.recommendedPool(s, rateOf, #icp)) {
    case (?p) assert p.id == 1;
    case null assert false;
  };
  // No chosen pool: the recommendation.
  assert idOf(MintLib.selectPool(s, rateOf, #icp, null)) == ?1;
  // The other pair has its own single pool.
  assert idOf(MintLib.selectPool(s, rateOf, #ckusdc, null)) == ?3;
};

// The recommendation follows the liquidity, not the pool id.
do {
  let s = storeOf([
    pool(1, icpToken, #bps30, 900_000_000_000, 90_000_000_000),
    pool(2, icpToken, #bps100, 100_000_000_000, 10_000_000_000),
  ]);
  assert idOf(MintLib.selectPool(s, rateOf, #icp, null)) == ?2;
};

// --- 2. Manual choice -------------------------------------------------------------

do {
  let s = fixture();
  assert idOf(MintLib.selectPool(s, rateOf, #icp, ?2)) == ?2;
  assert idOf(MintLib.selectPool(s, rateOf, #icp, ?1)) == ?1;
};

// --- 3. Invalid choices -----------------------------------------------------------

do {
  let s = fixture();
  assert reasonOf(MintLib.selectPool(s, rateOf, #icp, ?99)) == ?#unknownPool;
  assert reasonOf(MintLib.selectPool(s, rateOf, #icp, ?3)) == ?#otherPair;
  assert reasonOf(MintLib.selectPool(s, rateOf, #icp, ?4)) == ?#removed;
  assert reasonOf(MintLib.selectPool(s, rateOf, #icp, ?5)) == ?#removalAnnounced({ effectiveAt = now + 86_400_000_000_000 });
  // The error carries the chosen pool id.
  switch (MintLib.selectPool(s, rateOf, #icp, ?3)) {
    case (#err(#invalidTargetPool(t))) assert t.poolId == 3;
    case _ assert false;
  };
  // A refusal changes nothing.
  assert reserveOf(s, 1) == (100_000_000_000, 10_000_000_000);
  assert reserveOf(s, 2) == (900_000_000_000, 90_000_000_000);
};

// Without a choice and nothing eligible: the existing errors.
do {
  let s = storeOf([]);
  switch (MintLib.selectPool(s, rateOf, #icp, null)) {
    case (#err(#poolNotFound(_))) {};
    case _ assert false;
  };
  let t = storeOf([pool(1, icpToken, #bps30, 1_000, 1_000)]);
  announce(t, 1, now);
  switch (MintLib.selectPool(t, rateOf, #icp, null)) {
    case (#err(#removalAnnounced(_))) {};
    case _ assert false;
  };
};

// --- 4. Two pools of the same pair: the deposit lands in the chosen one -----------

do {
  let s = fixture();
  let balances : DexTypes.DexBalances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, alice, #tttiT, 10_000_000_000);
  DexLib.credit(balances, alice, #icp, 10_000_000_000);
  let chosen = switch (MintLib.selectPool(s, rateOf, #icp, ?2)) {
    case (#ok(p)) p;
    case (#err(_)) { assert false; pool(0, icpToken, #bps5, 0, 0) };
  };
  assert chosen.id == 2;
  let before1 = reserveOf(s, 1);
  let before2 = reserveOf(s, 2);
  let args : DexTypes.AddLiquidityArgs = {
    poolId = chosen.id;
    side = #token0;
    amount = 1_000_000_000;
    counterAmount = null;
    slippageBps = null;
    lockDurationNs = null;
  };
  switch (DexLib.addLiquidityShare(s, balances, canister, alice, false, args, rateOf, now, false, 0)) {
    case (#ok(_)) {};
    case (#err(_)) assert false;
  };
  // The chosen pool grew, the recommended one did not move.
  let after2 = reserveOf(s, 2);
  assert after2.0 > before2.0 and after2.1 > before2.1;
  assert reserveOf(s, 1) == before1;
};
