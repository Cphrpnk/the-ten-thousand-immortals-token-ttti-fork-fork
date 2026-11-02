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
