import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import AuctionLib "../src/backend/lib/auction";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";
import MintLib "../src/backend/lib/liquidity-mint";
import MintTypes "../src/backend/types/liquidity-mint";

// PTM-10b: the locked share m of the mint and of an auction settlement.
// Interpreter tests of the pure functions (MintLib.core and settleWinner cannot
// run here): both choices (#pool = A, #wallet = B) at m = 50 % and m = 0 %,
// for the mint (mintAmounts) and for an auction settlement (settleAmounts):
//   - the balance sheet balances exactly (paid and TTTI-T identities);
//   - 10 000 USD x q goes to the common reserve, 1 % of the payment to the creator;
//   - choice B delivers (1 - m) x q TTTI-T to the hand and takes no dollars for it;
//   - no TTTI-T is pooled without its dollars (each fraction enters with its own);
//   - the locked position records m and a 3-month lock;
//   - the pool price moves only through the zap (none here: the pool is at the price).

let alice = Principal.fromText("aaaaa-aa");
let canister = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
let now : Int = 1_000_000_000_000_000_000;

let ONE : Nat = 100_000_000;
let USDC : Nat = 1_000_000;
let RATE : Nat = 100_000_000; // ckUSDC at 1 USD (USD x 1e8)
let HALF : Nat = 500_000; // m = 50 % (scale 10^6)

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai")); symbol = "ckUSDC"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ckUSDC") ?RATE else null;
};

// A TTTI-T / ckUSDC pool at `price` ckUSDC base units per whole TTTI-T, with 10 TTTI-T.
func storeAt(price : Nat) : DexTypes.DexStore {
  let pools = Map.empty<Nat, DexTypes.Pool>();
  let reserve0 = 10 * ONE;
  let reserve1 = 10 * price;
  pools.add(
    1,
    {
      id = 1;
      token0 = tttiToken;
      token1 = usdcToken;
      feeTier = #bps30;
      kind = #tttiPair;
      status = #active;
      createdAt = 0;
      subaccount = Blob.fromArray([]);
      minimumLocked = { token0 = ?DexLib.TTTI_MINIMUM_LOCKED; token1 = null };
      newPairBadgeUntil = null;
      requestId = null;
      removedAt = null;
      reserve0;
      reserve1;
      totalShares = 10_000_000_000;
      lockedShares = DexLib.TTTI_MINIMUM_LOCKED;
      protocolFee0 = 0;
      protocolFee1 = 0;
      lockedFeesPaid0 = 0;
      lockedFeesPaid1 = 0;
    },
  );
  {
    pools;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 2;
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

func reservesOf(store : DexTypes.DexStore) : (Nat, Nat) {
  switch (store.pools.get(1)) {
    case (?p) (p.reserve0, p.reserve1);
    case null { assert false; (0, 0) };
  };
};

func positionOf(store : DexTypes.DexStore, id : Nat) : DexTypes.Position {
  switch (store.positions.get(id)) {
    case (?p) p;
    case null { assert false; loop {} };
  };
};

// Deposits the split of a mint or of a settlement into the pool at its ratio, as
// MintLib.depositParts does: the locked part (3 months, m recorded) first, then
// the free part, each fraction with its own dollars. Checks the identities.
func simulate(price : Nat, q : Nat, split : MintLib.Split, m : Nat, handExpected : Nat) {
  let store = storeAt(price);
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  // The minter holds the q TTTI-T just minted and the dollars of the position (+ 1 unit of surplus).
  DexLib.credit(balances, alice, #tttiT, q);
  DexLib.credit(balances, alice, #ckusdc, split.pooledToken + 1);
  let (before0, before1) = reservesOf(store);
  var tttiIn = 0;
  var tokenIn = 0;
  var lockedId : ?Nat = null;
  var freeId : ?Nat = null;
  if (split.lockedTtti > 0) {
    let args : DexTypes.AddLiquidityArgs = { poolId = 1; side = #token0; amount = split.lockedTtti; counterAmount = null; slippageBps = null; lockDurationNs = ?DexLib.MIN_LOCK_NS };
    switch (DexLib.addLiquidityShare(store, balances, canister, alice, false, args, rateOf, now, false, m)) {
      case (#ok(r)) {
        tttiIn += r.amount0;
        tokenIn += r.amount1;
        lockedId := ?r.position.id;
        // The dollars of the locked fraction: m x full, rounded up.
        assert r.amount0 == split.lockedTtti;
        assert r.amount1 == split.lockedToken;
      };
      case (#err(_)) assert false;
    };
  };
  let freeTtti = Nat.sub(split.pooledTtti, split.lockedTtti);
  if (freeTtti > 0) {
    let args : DexTypes.AddLiquidityArgs = { poolId = 1; side = #token0; amount = freeTtti; counterAmount = null; slippageBps = null; lockDurationNs = null };
    switch (DexLib.addLiquidityShare(store, balances, canister, alice, false, args, rateOf, now, false, m)) {
      case (#ok(r)) {
        tttiIn += r.amount0;
        tokenIn += r.amount1;
        freeId := ?r.position.id;
        assert r.amount0 == freeTtti;
        assert r.amount1 == Nat.sub(split.pooledToken, split.lockedToken);
      };
      case (#err(_)) assert false;
    };
  };
  // TTTI-T never enters a pool without its dollars: what entered is exactly the pooled split.
  assert tttiIn == split.pooledTtti;
  assert tokenIn == split.pooledToken;
  assert DexLib.available(balances, alice, #ckusdc) == 1;
  // TTTI-T minted = pooled + hand (no zap).
  let hand = DexLib.available(balances, alice, #tttiT);
  assert hand == handExpected;
  assert MintLib.mintTttiBalanced(q, tttiIn, hand, 0, 0);
  // The pool price moves only through the zap: with no zap the ratio is unchanged.
  let (after0, after1) = reservesOf(store);
  assert after0 == before0 + tttiIn;
  assert after1 == before1 + tokenIn;
  assert after1 * before0 == before1 * after0;
  assert DexLib.ratioHeld(before0, before1, after0, after1);
  // The locked position: owner, m recorded, 3 months, lock-time record opened.
  switch (lockedId) {
    case (?id) {
      let p = positionOf(store, id);
      assert p.owner == alice;
      assert p.mintShareE6 == m;
      assert p.lockDurationNs == DexLib.MIN_LOCK_NS;
      assert p.unlockAt == now + DexLib.MIN_LOCK_NS;
      assert store.fees.locks.containsKey(id);
    };
    case null { assert m == 0 or split.lockedTtti == 0 };
  };
  // The free position: no lock, withdrawable at any time, m recorded too.
  switch (freeId) {
    case (?id) {
      let p = positionOf(store, id);
      assert p.owner == alice;
      assert p.mintShareE6 == m;
      assert p.lockDurationNs == 0;
      assert p.unlockAt <= now;
      assert not store.fees.locks.containsKey(id);
    };
    case null {};
  };
};

type Case = { name : Text; choice : MintTypes.RemainderChoice; m : Nat };
let cases : [Case] = [
  { name = "A m=50%"; choice = #pool; m = HALF },
  { name = "B m=50%"; choice = #wallet; m = HALF },
  { name = "A m=0"; choice = #pool; m = 0 },
  { name = "B m=0"; choice = #wallet; m = 0 },
];

func ceilDiv(a : Nat, b : Nat) : Nat = (a + b - 1) / b;

// --- 1. The mint: 1 TTTI-T paid in ckUSDC -----------------------------------------

do {
  let q = ONE;
  for (c in cases.values()) {
    let a = MintLib.mintAmounts(q, RATE, USDC, c.m, c.choice);
    let reserve = 10_000 * USDC;
    // 10 000 USD x q always goes to the common reserve.
    assert a.reserve == reserve;
    // Payment: (10 000 USD + L) x q / 0.99, L = 10 000 USD (A) or m x 10 000 USD (B).
    let liquidity = switch (c.choice) {
      case (#pool) 10_000 * USDC;
      case (#wallet) c.m * 10_000 * USDC / 1_000_000;
    };
    assert a.payAmount == ceilDiv((reserve + liquidity) * 100, 99);
    assert a.payAmount * 99 >= (reserve + liquidity) * 100;
    assert (a.payAmount - 1) * 99 < (reserve + liquidity) * 100;
    // The queries show the same figure.
    assert MintLib.payForTtti(q, RATE, USDC, c.choice, c.m) == a.payAmount;
    assert MintLib.usdForTtti(q, c.choice, c.m) == a.payUsdE8;
    // 1 % of the payment to the creator.
    assert a.creator == a.payAmount / 100;
    // The contributed liquidity (pooled counterpart, locked + free).
    assert a.position == liquidity;
    assert a.split.pooledToken == liquidity;
    // Balance sheet: paid = reserve + liquidity + creator + dust.
    assert a.reserve + a.position + a.creator + a.dust == a.payAmount;
    assert MintLib.mintPaymentBalanced(a.payAmount, a.reserve, a.position, a.creator + a.dust, 0);
    assert MintLib.mintPaymentBalanced(a.payAmount + 10, a.reserve, a.position, a.creator + a.dust, 10);
    // The locked part is m x q TTTI-T with m x 10 000 USD x q.
    assert a.split.lockedTtti == c.m * q / 1_000_000;
    assert a.split.lockedToken == c.m * reserve / 1_000_000;
    assert MintLib.mintContributionOk(c.choice, a.reserve, c.m, a.split.lockedToken, Nat.sub(a.split.pooledToken, a.split.lockedToken));
    assert MintLib.mintContributionBalanced(a.split.lockedToken, Nat.sub(a.split.pooledToken, a.split.lockedToken), a.position);
    switch (c.choice) {
      case (#pool) {
        // A: everything pooled, nothing in the hand.
        assert a.split.pooledTtti == q;
        assert a.split.handTtti == 0;
        assert a.payAmount == ceilDiv(20_000 * USDC * 100, 99);
      };
      case (#wallet) {
        // B: (1 - m) x q in the hand, without its dollars.
        assert a.split.pooledTtti == a.split.lockedTtti;
        assert a.split.handTtti == q - a.split.lockedTtti;
        assert a.split.handTtti == (1_000_000 - c.m) * q / 1_000_000;
        assert a.payAmount < ceilDiv(20_000 * USDC * 100, 99) or c.m == 1_000_000;
      };
    };
    assert MintLib.mintTttiBalanced(q, a.split.pooledTtti, a.split.handTtti, 0, 0);
    // Pool simulation at the price of the mint (10 000 USD per TTTI-T): no zap, the price does not move.
    simulate(10_000 * USDC, q, a.split, c.m, a.split.handTtti);
  };
  // m = 50 %: A pays 20 202.02 USD, B pays 15 151.52 USD (rounded up).
  assert MintLib.mintAmounts(q, RATE, USDC, HALF, #pool).payAmount == 20_202_020_203;
  assert MintLib.mintAmounts(q, RATE, USDC, HALF, #wallet).payAmount == 15_151_515_152;
  // m = 0: B pays only the reserve part (10 101.01 USD), nothing is pooled, all q in the hand.
  let b0 = MintLib.mintAmounts(q, RATE, USDC, 0, #wallet);
  assert b0.payAmount == 10_101_010_102;
  assert b0.position == 0;
  assert b0.split.pooledTtti == 0 and b0.split.handTtti == q;
  // m = 0 with A is the former mint: no locked position, everything free.
  let a0 = MintLib.mintAmounts(q, RATE, USDC, 0, #pool);
  assert a0.split.lockedTtti == 0 and a0.split.lockedToken == 0;
};

// --- 2. Several quantities and rates: identities hold, rounding favours the pool ----

do {
  for (q in [10_000, 12_345_678, 77_777_777, ONE].values()) {
    for (c in cases.values()) {
      for (r in [RATE, 500_000_000, 100_000 * 100_000_000].values()) {
        let dec = if (r == RATE) USDC else ONE;
        let a = MintLib.mintAmounts(q, r, dec, c.m, c.choice);
        assert a.reserve + a.position + a.creator + a.dust == a.payAmount or a.reserve + a.position + a.creator > a.payAmount;
        assert a.split.pooledTtti + a.split.handTtti == q;
        assert a.split.lockedTtti <= a.split.pooledTtti;
        assert a.split.lockedToken <= a.split.pooledToken;
        // The locked part is rounded up (rounding favours the pool).
        assert a.split.lockedTtti * 1_000_000 >= c.m * q;
        assert a.split.lockedToken * 1_000_000 >= c.m * a.reserve;
      };
    };
  };
  // m read at payment time: a different m gives different amounts for B, the same payment for A.
  let atHalf = MintLib.mintAmounts(ONE, RATE, USDC, HALF, #wallet);
  let atQuarter = MintLib.mintAmounts(ONE, RATE, USDC, 250_000, #wallet);
  assert atHalf.payAmount != atQuarter.payAmount;
  assert atHalf.split.handTtti != atQuarter.split.handTtti;
  assert MintLib.mintAmounts(ONE, RATE, USDC, HALF, #pool).payAmount == MintLib.mintAmounts(ONE, RATE, USDC, 250_000, #pool).payAmount;
  // The sheet refuses every single-unit difference.
  assert MintLib.mintPaymentBalanced(1_000, 400, 500, 99, 1);
  assert not MintLib.mintPaymentBalanced(1_000, 400, 500, 100, 1);
  assert not MintLib.mintPaymentBalanced(1_000, 400, 499, 99, 1);
  assert not MintLib.mintPaymentBalanced(1_001, 400, 500, 99, 1);
  assert MintLib.mintPaymentBalanced(1_000, 400, 500, 100, 0);
};

// --- 3. The auction settlement: B = 15 000 USD, q = 2 TTTI-T ---------------------------

do {
  let q = 2 * ONE;
  let priceB = 15_000 * USDC;
  let reserveUnit = 10_000 * USDC;
  for (c in cases.values()) {
    let a = AuctionLib.settleAmounts(priceB, reserveUnit, q, c.m, c.choice);
    let liquidityPerTtti = switch (c.choice) {
      case (#pool) priceB;
      case (#wallet) c.m * priceB / 1_000_000;
    };
    // Payment: (10 000 USD + L) x q / 0.99 with B in place of 10 000 USD for the position.
    assert a.taken == ceilDiv((reserveUnit + liquidityPerTtti) * 2 * 100, 99);
    assert a.taken == MintLib.winnerTaken(priceB, reserveUnit, q, c.m, c.choice);
    // 10 000 USD x q to the common reserve, 1 % to the creator.
    assert a.guarantee == 20_000 * USDC;
    assert a.creator == a.taken / 100;
    assert a.position == liquidityPerTtti * 2;
    assert a.creator + a.position + a.guarantee + a.dust == a.taken;
    let split = MintLib.splitOf(c.choice, c.m, q, priceB * q / ONE);
    assert a.locked == split.lockedToken;
    assert a.handE8s == split.handTtti;
    switch (c.choice) {
      case (#pool) assert a.handE8s == 0;
      case (#wallet) assert a.handE8s == q - split.lockedTtti;
    };
    assert MintLib.mintTttiBalanced(q, split.pooledTtti, a.handE8s, 0, 0);
    assert MintLib.mintContributionOk(c.choice, priceB * q / ONE, c.m, split.lockedToken, Nat.sub(split.pooledToken, split.lockedToken));
    // Pool simulation at the price B: no zap, the price does not move.
    simulate(priceB, q, split, c.m, a.handE8s);
  };
  // Figures: A pays (10 000 + 15 000) x 2 / 0.99; B at m = 50 % pays (10 000 + 7 500) x 2 / 0.99; B at m = 0 pays 10 000 x 2 / 0.99.
  assert AuctionLib.settleAmounts(priceB, reserveUnit, q, HALF, #pool).taken == 50_505_050_506;
  assert AuctionLib.settleAmounts(priceB, reserveUnit, q, HALF, #wallet).taken == 35_353_535_354;
  let b0 = AuctionLib.settleAmounts(priceB, reserveUnit, q, 0, #wallet);
  assert b0.taken == 20_202_020_203;
  assert b0.position == 0 and b0.locked == 0 and b0.handE8s == q;
};

// --- 4. The locked share m of PTM-10a ----------------------------------------------

do {
  // Without circulating TTTI-T or without a retained ratio: the maximum (50 %).
  assert DexLib.lockedShare(0, 0, null) == DexLib.LOCKED_SHARE_MAX;
  assert DexLib.lockedShare(ONE, 1, null) == DexLib.LOCKED_SHARE_MAX;
  // At or above the target ratio: 0, no locked position is created.
  assert DexLib.lockedShare(ONE, 1, ?DexLib.POOL_CAP_RATIO_TARGET) == 0;
  assert DexLib.lockedShare(ONE, 1, ?(DexLib.POOL_CAP_RATIO_TARGET * 2)) == 0;
  // An empty ratio gives the maximum, never above it.
  assert DexLib.lockedShare(ONE, 1, ?0) == DexLib.LOCKED_SHARE_MAX;
  assert DexLib.lockedShare(ONE, 1, ?(DexLib.POOL_CAP_RATIO_TARGET / 2)) <= DexLib.LOCKED_SHARE_MAX;
};
