import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import DexLib "../src/backend/lib/dex";
import MintLib "../src/backend/lib/liquidity-mint";
import DexTypes "../src/backend/types/dex";
import Types "../src/backend/types/liquidity-mint";

// PTM-1 liquidity mint: pure tests that run in the interpreter.
//
//  1. Purchase / mint lock: take, release, automatic expiry after LOCK_TTL_NS.
//  2. Mint status follows the refund withdrawal (followWithdrawal).
//  3. The pure state functions the isolated mint core relies on (the DEX
//     internal balances): what a refused core leaves behind.
//
// What an interpreter cannot run is the rollback of a trap inside the isolated
// self-call (`liquidityMintCore`): that needs a replica. It stays covered only
// by the simulated contract scenarios (src/frontend/src/mocks/backend.ts).

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

func lockKey(who : Principal) : Text = "P/" # who.toText();

// --- 1. Mint lock ---------------------------------------------------------------

func freshLocks() : (Map.Map<Text, Int>, Set.Set<Principal>) {
  (Map.empty<Text, Int>(), Set.empty<Principal>());
};

// The lock is free: taking it returns the holder's stamp and marks it held.
do {
  let (times, locks) = freshLocks();
  let stamp = MintLib.takePurchaseLock(times, locks, alice);
  assert stamp != null;
  assert locks.contains(alice);
  assert times.get(lockKey(alice)) == stamp;
};

// A second take while the lock is validly held is refused and changes nothing.
do {
  let (times, locks) = freshLocks();
  let first = MintLib.takePurchaseLock(times, locks, alice);
  assert first != null;
  assert MintLib.takePurchaseLock(times, locks, alice) == null;
  assert locks.contains(alice);
  assert times.get(lockKey(alice)) == first;
};

// The lock is per principal.
do {
  let (times, locks) = freshLocks();
  assert MintLib.takePurchaseLock(times, locks, alice) != null;
  assert MintLib.takePurchaseLock(times, locks, bob) != null;
  assert locks.contains(alice);
  assert locks.contains(bob);
};

// Normal release with the holder's own stamp frees the lock; the next take works.
do {
  let (times, locks) = freshLocks();
  let stamp = switch (MintLib.takePurchaseLock(times, locks, alice)) {
    case (?s) s;
    case null { assert false; 0 };
  };
  MintLib.releasePurchaseLock(times, locks, alice, stamp);
  assert not locks.contains(alice);
  assert times.get(lockKey(alice)) == null;
  assert MintLib.takePurchaseLock(times, locks, alice) != null;
};

// A lock held for less than the delay is still held.
do {
  let (times, locks) = freshLocks();
  locks.add(alice);
  times.add(lockKey(alice), Time.now() - MintLib.LOCK_TTL_NS / 2);
  assert MintLib.takePurchaseLock(times, locks, alice) == null;
};

// A lock left behind by a missed cleanup is released by itself after the delay:
// the next mint of the same payer can start.
do {
  let (times, locks) = freshLocks();
  let abandoned = Time.now() - MintLib.LOCK_TTL_NS - 1;
  locks.add(alice);
  times.add(lockKey(alice), abandoned);
  let taken = MintLib.takePurchaseLock(times, locks, alice);
  assert taken != null;
  assert locks.contains(alice);
  // The new holder has its own, fresh stamp.
  assert times.get(lockKey(alice)) == taken;
  assert times.get(lockKey(alice)) != ?abandoned;

  // The late cleanup of the old holder (its stamp) must not free the new holder's lock.
  MintLib.releasePurchaseLock(times, locks, alice, abandoned);
  assert locks.contains(alice);
  assert times.get(lockKey(alice)) == taken;
  assert MintLib.takePurchaseLock(times, locks, alice) == null;

  // The new holder's own release frees it.
  switch (taken) {
    case (?stamp) { MintLib.releasePurchaseLock(times, locks, alice, stamp) };
    case null { assert false };
  };
  assert not locks.contains(alice);
  assert MintLib.takePurchaseLock(times, locks, alice) != null;
};

// A lock held without a stamp belongs to another module: it is never taken over.
do {
  let (times, locks) = freshLocks();
  locks.add(alice);
  assert MintLib.takePurchaseLock(times, locks, alice) == null;
  assert locks.contains(alice);
};

// Releasing a lock that is not held does nothing.
do {
  let (times, locks) = freshLocks();
  MintLib.releasePurchaseLock(times, locks, alice, 1);
  assert not locks.contains(alice);
};

// --- 2. Mint status follows the refund withdrawal ----------------------------------

func freshStore() : Types.LiquidityMintStore {
  {
    mints = Map.empty<Types.MintId, Types.LiquidityMint>();
    guarantees = Map.empty<Types.MintId, Types.Guarantee>();
    creatorSetAsides = Map.empty<Types.MintId, Types.CreatorSetAside>();
    var nextMintId = 0;
  };
};

func addMint(store : Types.LiquidityMintStore, id : Nat, status : Types.MintStatus, withdrawal : ?Nat) {
  store.mints.add(
    id,
    {
      id;
      payer = alice;
      owner = alice;
      token = #icp;
      tttiAmount = 10_000;
      payAmount = 123_456;
      rateUsdE8 = 500_000_000;
      poolId = 1;
      positionId = null;
      mShareE6 = 0;
      choice = #pool;
      lockedPositionId = null;
      lockedTokenAmount = 0;
      lockedTttiAmount = 0;
      handTttiAmount = 0;
      paymentBlock = ?77;
      status;
      createdAt = 0;
      refundWithdrawalN = withdrawal;
      refusalCause = ?"mint refused";
    },
  );
  if (id >= store.nextMintId) { store.nextMintId := id + 1 };
};

func statusOf(store : Types.LiquidityMintStore, id : Nat) : Types.MintStatus {
  switch (store.mints.get(id)) {
    case (?m) m.status;
    case null { assert false; #inProgress };
  };
};

// Refund in progress -> refunded when the withdrawal succeeds.
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  MintLib.followWithdrawal(store, 7, #completed(900));
  assert statusOf(store, 0) == #refunded;
};

// Refund in progress -> refund failed when the withdrawal fails.
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  MintLib.followWithdrawal(store, 7, #failed("ledger refused"));
  assert statusOf(store, 0) == #refundFailed;
};

// An unsettled withdrawal (in progress, to review) changes nothing.
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  MintLib.followWithdrawal(store, 7, #inProgress);
  assert statusOf(store, 0) == #refunding;
  MintLib.followWithdrawal(store, 7, #needsReview);
  assert statusOf(store, 0) == #refunding;
};

// Only the mint bound to that withdrawal number moves; the others keep their status.
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  addMint(store, 1, #refunding, ?8);
  addMint(store, 2, #completed, null);
  addMint(store, 3, #inProgress, null);
  addMint(store, 4, #refunding, null);
  MintLib.followWithdrawal(store, 7, #completed(1));
  assert statusOf(store, 0) == #refunded;
  assert statusOf(store, 1) == #refunding;
  assert statusOf(store, 2) == #completed;
  assert statusOf(store, 3) == #inProgress;
  assert statusOf(store, 4) == #refunding;
  MintLib.followWithdrawal(store, 8, #failed("x"));
  assert statusOf(store, 1) == #refundFailed;
  assert statusOf(store, 4) == #refunding;
};

// Idempotent: a settled mint is not changed by a later report of the same or another result.
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  MintLib.followWithdrawal(store, 7, #completed(1));
  MintLib.followWithdrawal(store, 7, #completed(1));
  MintLib.followWithdrawal(store, 7, #failed("late"));
  assert statusOf(store, 0) == #refunded;
};

// The other fields of the mint are kept (cause, withdrawal number, payment block).
do {
  let store = freshStore();
  addMint(store, 0, #refunding, ?7);
  MintLib.followWithdrawal(store, 7, #failed("x"));
  switch (store.mints.get(0)) {
    case (?m) {
      assert m.refundWithdrawalN == ?7;
      assert m.refusalCause == ?"mint refused";
      assert m.paymentBlock == ?77;
      assert m.payAmount == 123_456;
      assert m.tttiAmount == 10_000;
    };
    case null { assert false };
  };
};

// --- 3. State the refused isolated core leaves behind ----------------------------------
//
// The core traps before its first mutation when a check fails (cap, slippage,
// balance...). Those checks read the payer's internal DEX balances through
// DexLib.available / DexLib.debit: a refused debit must change nothing, the
// payment must sit in the payer's balance, and no TTTI-T may exist. The trap
// rollback itself (state after a trap in the middle of the core) needs a replica.

func newBalances() : DexTypes.DexBalances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();

// The payment credited before the isolated call sits in the payer's balance, in the paid token only.
do {
  let balances = newBalances();
  DexLib.credit(balances, alice, #icp, 123_456);
  assert DexLib.available(balances, alice, #icp) == 123_456;
  assert DexLib.available(balances, alice, #tttiT) == 0;
  assert DexLib.available(balances, bob, #icp) == 0;
};

// A debit larger than the balance is refused and leaves the balance untouched
// (the core turns that refusal into a trap, before it mints anything).
do {
  let balances = newBalances();
  DexLib.credit(balances, alice, #icp, 123_456);
  assert not DexLib.debit(balances, alice, #icp, 123_457);
  assert DexLib.available(balances, alice, #icp) == 123_456;
  assert DexLib.available(balances, alice, #tttiT) == 0;
  assert not DexLib.reserve(balances, alice, #icp, 123_457);
  assert DexLib.available(balances, alice, #icp) == 123_456;
  // A balance of another payer is never used.
  assert not DexLib.debit(balances, bob, #icp, 1);
  assert DexLib.available(balances, alice, #icp) == 123_456;
};

// With the payment in the balance, the refund withdrawal can reserve all of it,
// and it is then no longer available for another operation.
do {
  let balances = newBalances();
  DexLib.credit(balances, alice, #icp, 123_456);
  assert DexLib.reserve(balances, alice, #icp, 123_456);
  assert DexLib.available(balances, alice, #icp) == 0;
  assert not DexLib.debit(balances, alice, #icp, 1);
};

// A mint recorded #inProgress stays #inProgress when nothing reports a withdrawal for it
// (a refused core does not touch the record: the refund path sets #refunding).
do {
  let store = freshStore();
  addMint(store, 0, #inProgress, null);
  MintLib.followWithdrawal(store, 7, #completed(1));
  assert statusOf(store, 0) == #inProgress;
  assert store.guarantees.size() == 0;
  assert store.creatorSetAsides.size() == 0;
};

// --- 4. Reference price of the mint preview ----------------------------------------------------
//
// mintPoolPreview / listMintPools need a full MintContext (ledger, oracle, sale,
// guarantee stores...), which the interpreter tests do not build. Their
// reference price is `DexLib.consolidatedExcluding(dex, rates, now, targetPool)`
// (referenceExcluding), so the properties below are asserted on that function:
// the targeted pool is left out, neither its current nor its after-zap reserves
// matter, and without another open pool there is no reference (the preview then
// reports noIndependentReference and null gaps, never a gap of 0).

let previewNow : Int = 1_000_000_000_000_000_000;

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = {
  ledger = #external(Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"));
  symbol = "ckUSDC";
  decimals = 6;
};
let usdtToken : DexTypes.PoolToken = {
  ledger = #external(Principal.fromText("cngnf-vqaaa-aaaar-qag4q-cai"));
  symbol = "ckUSDT";
  decimals = 6;
};

func previewRate(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ckUSDC" or token.symbol == "ckUSDT") ?100_000_000 else null;
};

func previewPool(id : Nat, counter : DexTypes.PoolToken, tttiReserve : Nat, counterReserve : Nat) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1 = counter;
    feeTier = #bps30;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = "" : Blob;
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

func previewStore(pools : [DexTypes.Pool]) : DexTypes.DexStore {
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

// Pool 1 (target) at 10 000 USD, pool 2 at 11 000 USD. The reference of pool 1
// is pool 2's price whatever pool 1 holds, before or after the zap.
do {
  let rate = previewRate;
  let other = previewPool(2, usdtToken, 10_000_000, 1_100_000_000);
  let before = previewStore([previewPool(1, usdcToken, 10_000_000, 1_000_000_000), other]);
  // After the zap: the pool received counterpart and TTTI-T, its own price moved.
  let after = previewStore([previewPool(1, usdcToken, 9_000_000, 1_500_000_000), other]);
  let refBefore = DexLib.consolidatedExcluding(before, rate, previewNow, 1);
  let refAfter = DexLib.consolidatedExcluding(after, rate, previewNow, 1);
  assert refBefore.price == ?1_100_000_000_000;
  assert refAfter.price == refBefore.price;
  // The pool's own gap against it is signed and never 0 by construction.
  assert DexLib.consolidatedExcluding(before, rate, previewNow, 2).price == ?1_000_000_000_000;
  // The all-pools consolidated price does move with the zap: it must not be used.
  assert DexLib.consolidatedNow(before, rate, previewNow).price != DexLib.consolidatedNow(after, rate, previewNow).price;
};

// Single pool: no independent reference, before or after the zap.
do {
  let before = previewStore([previewPool(1, usdcToken, 10_000_000, 1_000_000_000)]);
  let after = previewStore([previewPool(1, usdcToken, 9_000_000, 1_500_000_000)]);
  let refBefore = DexLib.consolidatedExcluding(before, previewRate, previewNow, 1);
  let refAfter = DexLib.consolidatedExcluding(after, previewRate, previewNow, 1);
  assert refBefore.price == null;
  assert refBefore.unavailable != null;
  assert refAfter.price == null;
  assert refAfter.unavailable != null;
};
