import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";
import FeeLib "../src/backend/lib/protocol-fees";
import FeeTypes "../src/backend/types/protocol-fees";
import OracleLib "../src/backend/lib/oracle";
import ReserveTypes "../src/backend/types/dex-reserve";
import DexReserveLib "../src/backend/lib/dex-reserve";
import RetryTypes "../src/backend/types/retry";
import Text "mo:core/Text";

// PTM-10c: pure tests that run in the interpreter.
//   1. No minimum at the first deposit of a pool: the shares kept by the
//      contract are max(1, min(usual minimum, total / 2)), never more than half
//      of the shares created; a tiny first deposit succeeds (no #belowMinimum,
//      no #zeroShares); a second deposit afterward receives its shares.
//   2. A refused pair-request deposit never changes the price of a pool: it is
//      credited to the permanent set-aside (in the paid token) and
//      injectPermanent adds it at the pool ratio only. There is no one-sided
//      addition any more (feedRefusedDeposits / lockGrowth are gone).
//   3. PTM-11b: a refused deposit held in TTTI-T (no PairPayDeposit record)
//      follows the same flow as the other tokens: selected once
//      (FeeLib.pendingSetAside), credited once to the permanent set-aside in
//      TTTI-T with a #accrued journal line (FeeLib.creditSetAside), counted as
//      held by the reserve check until then (DexReserveLib.requestDepositHeld),
//      then injected at the pool ratio without changing the pool price.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let canister = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
let now : Int = 1_000_000_000_000_000_000;

let ICP = "ryjl3-tyaaa-aaaaa-aaaba-cai";
let CKUSDC = "xevnm-gaaaa-aaaar-qafnq-cai";

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(ICP)); symbol = "ICP"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText(CKUSDC)); symbol = "ckUSDC"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ICP") ?500_000_000 else if (token.symbol == "ckUSDC" or token.symbol == "ckUSDT") ?100_000_000 else null;
};

// TTTI-T / ckUSDC pool (TTTI-T is token0). `status` and the reserves let the
// same builder make an empty pool awaiting its first deposit.
func pool(id : Nat, status : DexTypes.PoolStatus, counter : DexTypes.PoolToken, tttiReserve : Nat, counterReserve : Nat, totalShares : Nat, lockedShares : Nat) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1 = counter;
    feeTier = #bps30;
    kind = #tttiPair;
    status;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    // The usual minimum of a TTTI-T pair (set at creation by the contract).
    minimumLocked = { token0 = ?DexLib.TTTI_MINIMUM_LOCKED; token1 = null };
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

func poolOf(store : DexTypes.DexStore, id : Nat) : DexTypes.Pool {
  switch (store.pools.get(id)) {
    case (?p) p;
    case null { assert false; pool(0, #filling, usdcToken, 0, 0, 0, 0) };
  };
};

func balancesWith(owner : Principal, tttiAmount : Nat, usdcAmount : Nat) : DexTypes.DexBalances {
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner, #tttiT, tttiAmount);
  DexLib.credit(balances, owner, #ckusdc, usdcAmount);
  balances;
};

func addArgs(side : DexTypes.PoolSide, amount : Nat, counter : ?Nat) : DexTypes.AddLiquidityArgs {
  { poolId = 1; side; amount; counterAmount = counter; slippageBps = null; lockDurationNs = null };
};

// --- 1. No minimum at the first deposit ---------------------------------------

// Equal amounts: total = sqrt(A x B) = A, the usual minimum holds exactly
// TTTI_MINIMUM_LOCKED (10 000) shares. They stay with the contract, so the
// depositor gets total - 10 000.
do {
  assert DexLib.TTTI_MINIMUM_LOCKED == 10_000;
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 1_000_000, 1_000_000);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 1_000_000, ?1_000_000), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.lockedShares == 10_000;
      assert r.shares == 990_000;
      assert r.shares + r.lockedShares == 1_000_000;
      assert r.lockedShares <= (r.shares + r.lockedShares) / 2;
    };
    case (#err(_)) assert false;
  };
  let p = poolOf(store, 1);
  assert p.totalShares == 1_000_000;
  assert p.lockedShares == 10_000;
  assert p.reserve0 == 1_000_000 and p.reserve1 == 1_000_000;
};

// Skewed amounts: the usual minimum is the number of shares that hold 10 000
// base units of TTTI-T (rounded up). TTTI-T 1e10, ckUSDC 1e4: total = 1e7, so
// 10 000 x 1e7 / 1e10 = 10 shares.
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 10_000_000_000, 10_000);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 10_000_000_000, ?10_000), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.lockedShares == 10;
      assert r.shares == 10_000_000 - 10;
    };
    case (#err(_)) assert false;
  };
};

// The shares kept by the contract are never more than half of those created:
// a small deposit (total 2 000) would hold 10 000 shares by the usual minimum,
// so the cap of total / 2 applies.
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 2_000, 2_000);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 2_000, ?2_000), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.lockedShares == 1_000;
      assert r.shares == 1_000;
      assert 2 * r.lockedShares <= r.shares + r.lockedShares;
    };
    case (#err(_)) assert false;
  };
};

// Tiny first deposits succeed: no #belowMinimum, no #zeroShares.
//   - TTTI-T 4, ckUSDC 1: total 2, one share kept by the contract, one for the
//     depositor (max(1, min(5 000, 1)) = 1).
//   - TTTI-T 1, ckUSDC 1: total 1, the depositor keeps the single share.
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 4, 1);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 4, ?1), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.lockedShares == 1;
      assert r.shares == 1;
      assert r.amount0 == 4 and r.amount1 == 1;
    };
    case (#err(_)) assert false;
  };
};

do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 1, 1);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 1, ?1), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.lockedShares == 0;
      assert r.shares == 1;
    };
    case (#err(_)) assert false;
  };
};

// The quote of a first deposit never returns #belowMinimum or #zeroShares, at
// any size, and its locked shares follow max(1, min(usual, total / 2)).
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  for (amount in [1, 2, 3, 5, 10, 99, 1_000, 20_000, 1_000_000].values()) {
    switch (DexLib.quoteAddLiquidity(store, { poolId = 1; side = #token0; amount; counterAmount = ?amount; slippageBps = null }, rateOf, now)) {
      case (#ok(q)) {
        assert q.isFirstDeposit;
        let total = DexLib.isqrt(amount * amount);
        assert q.shares + q.lockedShares == total;
        if (total >= 2) {
          assert q.lockedShares >= 1;
          assert q.lockedShares <= total / 2;
          assert q.lockedShares <= DexLib.TTTI_MINIMUM_LOCKED;
          // Equal amounts: usual minimum = TTTI_MINIMUM_LOCKED.
          assert q.lockedShares == (if (DexLib.TTTI_MINIMUM_LOCKED < total / 2) DexLib.TTTI_MINIMUM_LOCKED else total / 2);
        } else {
          assert q.lockedShares == 0;
        };
        assert q.shares >= 1;
      };
      case (#err(_)) assert false;
    };
  };
};

// A second deposit afterward receives its shares. First deposit: TTTI-T 4 /
// ckUSDC 1 (total 2, 1 locked, 1 for alice). Second (bob): 8 TTTI-T requires
// ceil(8 x 1 / 4) = 2 ckUSDC and mints min(8 x 2 / 4, 2 x 2 / 1) = 4 shares.
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 4, 1);
  DexLib.credit(balances, bob, #tttiT, 8);
  DexLib.credit(balances, bob, #ckusdc, 2);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 4, ?1), rateOf, now, false)) {
    case (#ok(_)) {};
    case (#err(_)) assert false;
  };
  switch (DexLib.addLiquidityWith(store, balances, canister, bob, false, addArgs(#token0, 8, null), rateOf, now, false)) {
    case (#ok(r)) {
      assert not r.position.isCreator;
      assert r.amount0 == 8 and r.amount1 == 2;
      assert r.shares == 4;
      assert r.lockedShares == 0;
    };
    case (#err(_)) assert false;
  };
  let p = poolOf(store, 1);
  assert p.totalShares == 6;
  assert p.lockedShares == 1;
  assert p.reserve0 == 12 and p.reserve1 == 3;
  assert DexLib.available(balances, bob, #tttiT) == 0;
  assert DexLib.available(balances, bob, #ckusdc) == 0;
};

// A larger pool: the second depositor receives proportional shares and the
// contract's locked shares do not grow.
do {
  let store = storeOf([pool(1, #filling, usdcToken, 0, 0, 0, 0)]);
  let balances = balancesWith(alice, 1_000_000, 1_000_000);
  DexLib.credit(balances, bob, #tttiT, 500_000);
  DexLib.credit(balances, bob, #ckusdc, 500_000);
  switch (DexLib.addLiquidityWith(store, balances, canister, alice, false, addArgs(#token0, 1_000_000, ?1_000_000), rateOf, now, false)) {
    case (#ok(_)) {};
    case (#err(_)) assert false;
  };
  switch (DexLib.addLiquidityWith(store, balances, canister, bob, false, addArgs(#token0, 500_000, null), rateOf, now, false)) {
    case (#ok(r)) {
      assert r.shares == 500_000;
      assert r.amount1 == 500_000;
    };
    case (#err(_)) assert false;
  };
  let p = poolOf(store, 1);
  assert p.totalShares == 1_500_000;
  assert p.lockedShares == 10_000;
};

// --- 2. A refused pair-request deposit leaves every pool price unchanged --------

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

// Price of a pool = counter reserve / TTTI-T reserve; two prices are equal when
// the cross products are equal.
func samePrice(a : DexTypes.Pool, b : DexTypes.Pool) : Bool = a.reserve1 * b.reserve0 == b.reserve1 * a.reserve0;

// The deposit of a refused request is 0.0005 TTTI-T at the mint price (5 USD),
// paid in an accepted token: 5 ckUSDC = 5_000_000 base units. The refused
// deposit is credited to the set-aside of its token (what creditSetAside does)
// with a public journal line; the router balances it with the other set-aside
// amounts; injectPermanent then adds it at the pool ratio.
//
// Pool 1: TTTI-T 1e11 / ckUSDC 1e9 (1 000 TTTI-T, 1 000 USDC), 1 000 000 shares.
// Pool 2 (other pool): TTTI-T 5e10 / ICP 2.5e9, untouched.
do {
  let f = fixture([
    pool(1, #active, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000),
    pool(2, #active, icpToken, 50_000_000_000, 2_500_000_000, 500_000, 1_000),
  ]);
  let before1 = poolOf(f.dex, 1);
  let before2 = poolOf(f.dex, 2);

  // The refused deposit enters the set-aside in the paid token (no TTTI-T).
  let deposit = 5_000_000;
  FeeLib.setPermanentAmount(f.permanent, #ckusdc, FeeLib.permanentAmount(f.permanent, #ckusdc) + deposit);
  FeeLib.logPermanent(f.permanent, #accrued, #ckusdc, deposit, null, 0, null, null, 0, ?"Refused pair-request deposit 1", now);
  assert FeeLib.permanentAmount(f.permanent, #ckusdc) == deposit;
  assert FeeLib.permanentAmount(f.permanent, #tttiT) == 0;
  // Crediting the set-aside touches no pool: no price change, no reserve change.
  assert poolOf(f.dex, 1) == before1;
  assert poolOf(f.dex, 2) == before2;

  // Balanced by the router: the 5 ckUSDC are split at the pool ratio into
  // 0.005 TTTI-T... here the router has produced 50_000_000 TTTI-T (0.5 TTTI-T)
  // against 500_000 ckUSDC (0.5 USDC), exactly the pool ratio (100 : 1).
  FeeLib.setPermanentAmount(f.permanent, #tttiT, 50_000_000);
  FeeLib.setPermanentAmount(f.permanent, #ckusdc, 500_000);
  let added = FeeLib.injectPermanent(f, 1, 50_000_000, 500_000, now);
  assert added.shares == 500; // 50_000_000 x 1_000_000 / 1e11
  assert added.used0 == 50_000_000;
  assert added.used1 == 500_000;

  let after1 = poolOf(f.dex, 1);
  // Both reserves grew in proportion: the price is exactly the same.
  assert after1.reserve0 == before1.reserve0 + 50_000_000;
  assert after1.reserve1 == before1.reserve1 + 500_000;
  assert samePrice(before1, after1);
  // The shares are contract-held and locked: nobody's wallet received any.
  assert after1.totalShares == before1.totalShares + 500;
  assert after1.lockedShares == before1.lockedShares + 500;
  // The other pool is untouched.
  assert poolOf(f.dex, 2) == before2;
  assert f.dex.positions.size() == 0;
  // The injection is recorded as protocol liquidity of pool 1.
  switch (f.store.protocolLiquidity.get(1)) {
    case (?l) assert l.shares == 500;
    case null assert false;
  };
};

// Amounts beyond the pool ratio are not added: only the part at the ratio is
// used, the rest stays in the set-aside, and the price is unchanged. Here the
// ckUSDC side is twice what the ratio takes.
do {
  let f = fixture([pool(1, #active, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000)]);
  let before = poolOf(f.dex, 1);
  let added = FeeLib.injectPermanent(f, 1, 100_000_000, 2_000_000, now);
  assert added.shares == 1_000;
  assert added.used0 == 100_000_000;
  assert added.used1 == 1_000_000; // not 2_000_000
  let after = poolOf(f.dex, 1);
  assert samePrice(before, after);
  assert after.reserve1 == before.reserve1 + 1_000_000;
};

// There is no one-sided addition: a deposit with a single side adds nothing and
// the pool is left exactly as it was (price included). This is what the removed
// feedRefusedDeposits / lockGrowth used to do with the TTTI-T deposit.
do {
  let f = fixture([pool(1, #active, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000)]);
  let before = poolOf(f.dex, 1);
  let tttiOnly = FeeLib.injectPermanent(f, 1, 5_000_000, 0, now);
  assert tttiOnly.shares == 0 and tttiOnly.used0 == 0 and tttiOnly.used1 == 0;
  assert poolOf(f.dex, 1) == before;
  let counterOnly = FeeLib.injectPermanent(f, 1, 0, 5_000_000, now);
  assert counterOnly.shares == 0 and counterOnly.used0 == 0 and counterOnly.used1 == 0;
  assert poolOf(f.dex, 1) == before;
  assert f.store.protocolLiquidity.size() == 0;
};

// A pool that is not open (filling) takes nothing: the amount waits in the
// set-aside and the pool is unchanged.
do {
  let f = fixture([pool(1, #filling, usdcToken, 100_000_000_000, 1_000_000_000, 1_000_000, 1_000)]);
  let before = poolOf(f.dex, 1);
  let added = FeeLib.injectPermanent(f, 1, 50_000_000, 500_000, now);
  assert added.shares == 0;
  assert poolOf(f.dex, 1) == before;
};

// --- 3. PTM-11b: a refused deposit held in TTTI-T goes to the permanent liquidity ---

func refusedRequest(id : Nat, status : DexTypes.RequestStatus, refundStatus : DexTypes.PairRefundStatus, refundBlock : ?Nat) : DexTypes.PairRequest {
  {
    id;
    requester = alice;
    token = { ledgerId = bob; name = "Test"; symbol = "TST"; decimals = 8; fee = 0 };
    counter = tttiToken;
    feeTier = #bps30;
    kind = #utilityPair;
    message = "";
    createdAt = 0;
    checks = { icrc1 = true; icrc2 = true; metadataRead = true; pairUnique = true; copiedSymbolOf = null };
    depositAmount = 100_100;
    depositBlock = 5;
    status;
    refundBlock;
    refundStatus;
  };
};

func refusedStatus() : DexTypes.RequestStatus = #refused({ reason = "test"; at = now });

// The RD attempt that moved the deposit minus one fee (100) to the custody.
func moveAttempt(requestId : Nat, token : DexTypes.DexToken, amount : Nat) : RetryTypes.DexTransferAttempt {
  {
    n = requestId;
    attempt = 1;
    memo = Text.encodeUtf8("TTTI-RD-" # debug_show (requestId));
    created_at_time = 1;
    request = {
      token;
      from = DexLib.requestDepositAccountOf(canister, token);
      to = DexLib.custodyAccount(canister, token);
      amount;
      fee = ?100;
    };
    sends = 1;
    lastError = null;
    outcome = #succeeded(7);
  };
};

// A refused TTTI-T deposit with no record: selected once, credited once,
// journaled, no longer held, then injected at the ratio with the price unchanged.
do {
  // Pool 1: TTTI-T 10 / ckUSDC 0.1 (ratio 100 : 1), 1 000 000 shares.
  let f = fixture([pool(1, #active, usdcToken, 1_000_000_000, 10_000_000, 1_000_000, 1_000)]);
  let payments = Map.empty<Nat, RetryTypes.PairPayDeposit>();
  let feeds = Map.empty<DexTypes.RequestId, DexTypes.RefusedDepositFeed>();
  let credit = { payments; permanent = f.permanent };
  let selection = { payments; refusedFeeds = feeds };
  let request = refusedRequest(1, refusedStatus(), #none, null);

  // Selected as a TTTI-T deposit, and still held by the reserve check.
  let selected = switch (FeeLib.pendingSetAside(selection, request)) {
    case (?p) p;
    case null { assert false; { requestId = 0; token = #tttiT; setAside = null; setAsideAt = null } };
  };
  assert selected.requestId == 1 and selected.token == #tttiT;
  assert selected.setAside == null and selected.setAsideAt == null;
  assert DexReserveLib.requestDepositHeld(request, null, false);

  // Credit once: 100 000 in TTTI-T, one #accrued line in the public journal.
  let attempt = moveAttempt(1, #tttiT, 100_000);
  FeeLib.creditSetAside(credit, 1, selected, attempt, now);
  assert FeeLib.permanentAmount(f.permanent, #tttiT) == 100_000;
  assert f.permanent.log.size() == 1;
  switch (f.permanent.log.get(0)) {
    case (?entry) {
      assert entry.kind == #accrued;
      assert entry.token == #tttiT and entry.amount == 100_000;
    };
    case null assert false;
  };
  switch (payments.get(1)) {
    case (?p) { assert p.token == #tttiT and p.setAsideAt == ?now and p.setAside != null };
    case null assert false;
  };

  // A retry, or an unknown outcome resolved afterwards, credits nothing more.
  FeeLib.creditSetAside(credit, 1, selected, attempt, now + 1);
  assert FeeLib.permanentAmount(f.permanent, #tttiT) == 100_000;
  assert f.permanent.log.size() == 1;

  // No longer selected and no longer held once set aside.
  assert FeeLib.pendingSetAside(selection, request) == null;
  assert not DexReserveLib.requestDepositHeld(request, payments.get(1), false);

  // The router balances the set-aside at the pool ratio (100 : 1): 50 000
  // TTTI-T against 500 ckUSDC; injectPermanent adds them without moving the price.
  let before = poolOf(f.dex, 1);
  FeeLib.setPermanentAmount(f.permanent, #ckusdc, 500);
  let added = FeeLib.injectPermanent(f, 1, 50_000, 500, now);
  assert added.shares == 50; // 50_000 x 1_000_000 / 1e9
  assert added.used0 == 50_000 and added.used1 == 500;
  let after = poolOf(f.dex, 1);
  assert after.reserve0 == before.reserve0 + 50_000;
  assert after.reserve1 == before.reserve1 + 500;
  assert samePrice(before, after);
  assert f.dex.positions.size() == 0;
};

// The pool price is unchanged by the deposit itself: crediting the set-aside
// touches no pool, whichever token the refused deposit was paid in.
do {
  let f = fixture([
    pool(1, #active, usdcToken, 1_000_000_000, 10_000_000, 1_000_000, 1_000),
    pool(2, #active, icpToken, 500_000_000, 25_000_000, 500_000, 1_000),
  ]);
  let before1 = poolOf(f.dex, 1);
  let before2 = poolOf(f.dex, 2);
  let payments = Map.empty<Nat, RetryTypes.PairPayDeposit>();
  let credit = { payments; permanent = f.permanent };
  let tttiPayment : RetryTypes.PairPayDeposit = { requestId = 1; token = #tttiT; setAside = null; setAsideAt = null };
  FeeLib.creditSetAside(credit, 1, tttiPayment, moveAttempt(1, #tttiT, 100_000), now);
  assert poolOf(f.dex, 1) == before1;
  assert poolOf(f.dex, 2) == before2;
  assert f.store.protocolLiquidity.size() == 0;
};

// Selection rules: legacy feeds stay history and are not moved again; a pay
// token record is selected until set aside; pending, approved and refunded
// requests are never selected; a request not yet set aside stays held.
do {
  let payments = Map.empty<Nat, RetryTypes.PairPayDeposit>();
  let feeds = Map.empty<DexTypes.RequestId, DexTypes.RefusedDepositFeed>();
  let selection = { payments; refusedFeeds = feeds };
  let fed : DexTypes.RefusedDepositFeed = { requestId = 2; poolId = 1; amount = 99_900; fee = 100; block = 9; at = now };
  feeds.add(2, fed);
  let legacy = refusedRequest(2, refusedStatus(), #none, null);
  assert FeeLib.pendingSetAside(selection, legacy) == null;
  assert not DexReserveLib.requestDepositHeld(legacy, null, true);
  assert feeds.get(2) == ?fed; // the feed is not rewritten
  assert feeds.size() == 1;

  payments.add(3, { requestId = 3; token = #ckusdc; setAside = null; setAsideAt = null });
  switch (FeeLib.pendingSetAside(selection, refusedRequest(3, refusedStatus(), #none, null))) {
    case (?p) assert p.token == #ckusdc;
    case null assert false;
  };

  assert FeeLib.pendingSetAside(selection, refusedRequest(4, #pending, #none, null)) == null;
  assert FeeLib.pendingSetAside(selection, refusedRequest(5, #approved({ poolId = 1; at = now }), #none, null)) == null;
  assert FeeLib.pendingSetAside(selection, refusedRequest(6, refusedStatus(), #refunded(3), ?3)) == null;
  assert FeeLib.pendingSetAside(selection, refusedRequest(7, refusedStatus(), #none, ?3)) == null;
  // A pending request is held; a refunded refused one is not.
  assert DexReserveLib.requestDepositHeld(refusedRequest(4, #pending, #none, null), null, false);
  assert not DexReserveLib.requestDepositHeld(refusedRequest(6, refusedStatus(), #refunded(3), ?3), null, false);
};
