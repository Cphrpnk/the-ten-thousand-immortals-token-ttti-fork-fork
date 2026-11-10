import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";

// PTM-9b point 4: voluntary lock from 3 months to 5 years, at opening
// (addLiquidity / checkLockDuration) and after an extension (extendLock).
// The only rule is the remaining time; there is no "lock start + 5 years" cap.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let canister = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
let now : Int = 1_000_000_000_000_000_000;

let THREE_MONTHS : Nat = DexLib.MIN_LOCK_NS;
let FIVE_YEARS : Nat = DexLib.MAX_LOCK_NS;

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai")); symbol = "ckUSDC"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ckUSDC") ?100_000_000 else null;
};

func pool() : DexTypes.Pool {
  {
    id = 1;
    token0 = tttiToken;
    token1 = usdcToken;
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
    var nextPositionId = 2;
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

// Position of `owner` locked until `unlockAt` (0 = free), committed at `startedAt`.
func addPosition(s : DexTypes.DexStore, owner : Principal, startedAt : Int, unlockAt : Int) {
  s.positions.add(
    1,
    {
      id = 1;
      poolId = 1;
      owner;
      shares = 10_000;
      createdAt = startedAt;
      lockDurationNs = if (unlockAt == 0) 0 else Int.abs(unlockAt - startedAt);
      unlockAt;
      isCreator = false;
      lockStartedAt = startedAt;
      relayReceivedNs = 0;
      feesCollected0 = 0;
      feesCollected1 = 0;
      mintShareE6 = 0;
    },
  );
  DexLib.indexAdd(s, 1, 1);
};

func extend(s : DexTypes.DexStore, owner : Principal, newUnlockAt : Int) : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError> {
  DexLib.extendLock(s, canister, owner, 1, newUnlockAt, rateOf, now);
};

func isTooShort(r : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError>) : Bool {
  switch (r) {
    case (#err(#lockTooShort(_))) true;
    case _ false;
  };
};

func isTooLong(r : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError>) : Bool {
  switch (r) {
    case (#err(#lockTooLong(_))) true;
    case _ false;
  };
};

func isOk(r : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError>) : Bool {
  switch (r) {
    case (#ok(_)) true;
    case _ false;
  };
};

func isUnlockAt(r : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError>, expected : Int) : Bool {
  switch (r) {
    case (#ok(v)) v.position.unlockAt == expected;
    case _ false;
  };
};

// --- Constants ---------------------------------------------------------------

// 3 months is 91 days, 5 years is 1826 days (nanoseconds).
do {
  assert THREE_MONTHS == 91 * 86_400 * 1_000_000_000;
  assert FIVE_YEARS == 1826 * 86_400 * 1_000_000_000;
  assert DexLib.FIVE_YEARS == FIVE_YEARS;
};

// --- Opening: checkLockDuration ----------------------------------------------

do {
  // No lock stays free.
  assert DexLib.checkLockDuration(0) == null;
  // Exactly 3 months and exactly 5 years are accepted.
  assert DexLib.checkLockDuration(THREE_MONTHS) == null;
  assert DexLib.checkLockDuration(FIVE_YEARS) == null;
  // 18 months, the former minimum, is of course still fine.
  assert DexLib.checkLockDuration(47_347_200_000_000_000) == null;
  // Just under 3 months is refused.
  assert DexLib.checkLockDuration(THREE_MONTHS - 1) == ?#lockTooShort({ minimumNs = THREE_MONTHS });
  assert DexLib.checkLockDuration(1) == ?#lockTooShort({ minimumNs = THREE_MONTHS });
  // Just over 5 years is refused.
  assert DexLib.checkLockDuration(FIVE_YEARS + 1) == ?#lockTooLong({ maximumNs = FIVE_YEARS });
};

// The configuration published to the frontend carries the same bounds.
do {
  let args = func(lock : ?Nat) : DexTypes.AddLiquidityArgs = {
    poolId = 1;
    side = #token0;
    amount = 1_000_000_000;
    counterAmount = null;
    slippageBps = null;
    lockDurationNs = lock;
  };
  let s = store();
  func refusedWith(lock : Nat) : ?DexTypes.AddLiquidityError {
    switch (DexLib.addLiquidityNeed(s, args(?lock), rateOf, now)) {
      case (#err(e)) ?e;
      case (#ok(_)) null;
    };
  };
  // The lock check of addLiquidity runs first: both boundaries pass it.
  assert refusedWith(THREE_MONTHS - 1) == ?#lockTooShort({ minimumNs = THREE_MONTHS });
  assert refusedWith(FIVE_YEARS + 1) == ?#lockTooLong({ maximumNs = FIVE_YEARS });
  switch (refusedWith(THREE_MONTHS)) {
    case (?#lockTooShort(_)) assert false;
    case (?#lockTooLong(_)) assert false;
    case _ {};
  };
  switch (refusedWith(FIVE_YEARS)) {
    case (?#lockTooShort(_)) assert false;
    case (?#lockTooLong(_)) assert false;
    case _ {};
  };
};

// --- Extension of a locked position --------------------------------------------

// Position locked for 6 months from `now`.
let SIX_MONTHS : Nat = 2 * THREE_MONTHS;

do {
  // Remaining time exactly 5 years: accepted.
  let s = store();
  addPosition(s, alice, now, now + SIX_MONTHS);
  let r = extend(s, alice, now + FIVE_YEARS);
  assert isUnlockAt(r, now + FIVE_YEARS);
};

do {
  // Remaining time just over 5 years: refused.
  let s = store();
  addPosition(s, alice, now, now + SIX_MONTHS);
  assert isTooLong(extend(s, alice, now + FIVE_YEARS + 1));
  // Nothing was stored.
  switch (s.positions.get(1)) {
    case (?p) assert p.unlockAt == now + SIX_MONTHS;
    case null assert false;
  };
};

do {
  // Locked since 4 years and 6 months: an extension reaching 4 years from now
  // ends beyond lockStartedAt + 5 years and is accepted, because the only rule
  // is the remaining time.
  let FOUR_YEARS : Nat = FIVE_YEARS * 4 / 5;
  let startedAt : Int = now - (FIVE_YEARS * 9 / 10);
  let s = store();
  addPosition(s, alice, startedAt, now + SIX_MONTHS);
  let target : Int = now + FOUR_YEARS;
  assert target > startedAt + FIVE_YEARS;
  assert isUnlockAt(extend(s, alice, target), target);
};

do {
  // Remaining time under 3 months after the extension is refused. A locked
  // position cannot be shortened, so use a lock that still has 1 month and
  // extend it to just under 3 months from now.
  let s = store();
  addPosition(s, alice, now - SIX_MONTHS, now + THREE_MONTHS / 3);
  assert isTooShort(extend(s, alice, now + THREE_MONTHS - 1));
};

do {
  // Remaining time exactly 3 months after the extension: accepted.
  let s = store();
  addPosition(s, alice, now - SIX_MONTHS, now + THREE_MONTHS / 3);
  assert isUnlockAt(extend(s, alice, now + THREE_MONTHS), now + THREE_MONTHS);
};

do {
  // A free position is committed anew: same bounds from now.
  let a = store();
  addPosition(a, alice, now - SIX_MONTHS, 0);
  assert isTooShort(extend(a, alice, now + THREE_MONTHS - 1));
  let b = store();
  addPosition(b, alice, now - SIX_MONTHS, 0);
  assert isTooLong(extend(b, alice, now + FIVE_YEARS + 1));
  let c = store();
  addPosition(c, alice, now - SIX_MONTHS, 0);
  assert isUnlockAt(extend(c, alice, now + THREE_MONTHS), now + THREE_MONTHS);
  let d = store();
  addPosition(d, alice, now - SIX_MONTHS, 0);
  assert isUnlockAt(extend(d, alice, now + FIVE_YEARS), now + FIVE_YEARS);
};

do {
  // Only the owner extends, and a lock is never shortened.
  let s = store();
  addPosition(s, alice, now, now + SIX_MONTHS);
  switch (extend(s, bob, now + FIVE_YEARS)) {
    case (#err(#notPositionOwner)) {};
    case _ assert false;
  };
  switch (extend(s, alice, now + THREE_MONTHS)) {
    case (#err(#cannotShortenLock(_))) {};
    case _ assert false;
  };
};
