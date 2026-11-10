import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import DexLib "../src/backend/lib/dex";
import DexTypes "../src/backend/types/dex";

// PTM-9c point 4: relay (relayPositions), extension (extendLock) and fee
// weight (feeWeight) of lib/dex.mo. The LP fee sharing (shareLpFee) is not
// tested here: it is reworked in the next lot.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let carol = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
let canister = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
let now : Int = 1_000_000_000_000_000_000;

let THREE_MONTHS : Nat = DexLib.MIN_LOCK_NS;
let SIX_MONTHS : Nat = 2 * THREE_MONTHS;
let FIVE_YEARS : Nat = DexLib.MAX_LOCK_NS;
let YEAR : Nat = 31_536_000_000_000_000; // 365 days in ns
let D : Nat = 1_000_000_000_000; // unit of shortening used by the relay tests

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai")); symbol = "ckUSDC"; decimals = 6 };

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ckUSDC") ?100_000_000 else null;
};

func poolWith(id : Nat, status : DexTypes.PoolStatus) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1 = usdcToken;
    feeTier = #bps30;
    kind = #tttiPair;
    status;
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

// Pools 1 and 2, both active.
func store() : DexTypes.DexStore {
  let pools = Map.empty<Nat, DexTypes.Pool>();
  pools.add(1, poolWith(1, #active));
  pools.add(2, poolWith(2, #active));
  {
    pools;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 3;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 100;
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

func positionOf(id : Nat, poolId : Nat, owner : Principal, shares : Nat, startedAt : Int, unlockAt : Int) : DexTypes.Position {
  {
    id;
    poolId;
    owner;
    shares;
    createdAt = startedAt;
    lockDurationNs = if (unlockAt == 0) 0 else Int.abs(unlockAt - startedAt);
    unlockAt;
    isCreator = false;
    lockStartedAt = startedAt;
    relayReceivedNs = 0;
    feesCollected0 = 0;
    feesCollected1 = 0;
    mintShareE6 = 0;
  };
};

func put(s : DexTypes.DexStore, p : DexTypes.Position) {
  s.positions.add(p.id, p);
  DexLib.indexAdd(s, p.poolId, p.id);
};

func unlockOf(s : DexTypes.DexStore, id : Nat) : Int {
  switch (s.positions.get(id)) {
    case (?p) p.unlockAt;
    case null { assert false; 0 };
  };
};

func relayReceivedOf(s : DexTypes.DexStore, id : Nat) : Nat {
  switch (s.positions.get(id)) {
    case (?p) p.relayReceivedNs;
    case null { assert false; 0 };
  };
};

func relay(s : DexTypes.DexStore, excluded : Nat, weight : Nat) : DexTypes.RelayOutcome {
  DexLib.relayPositions(s, 1, excluded, weight, now);
};

func extend(s : DexTypes.DexStore, id : Nat, owner : Principal, newUnlockAt : Int) : Result.Result<DexTypes.ExtendLockResult, DexTypes.ExtendLockError> {
  DexLib.extendLock(s, canister, owner, id, newUnlockAt, rateOf, now);
};

// --- Constants -----------------------------------------------------------------

do {
  // The relay gives one third of the weight of a commitment.
  assert DexLib.RELAY_DIVISOR == 3;
  assert DexLib.MIN_LOCK_NS == 91 * 86_400 * 1_000_000_000;
  assert DexLib.MAX_LOCK_NS == 1826 * 86_400 * 1_000_000_000;
  // weightOf = capital x duration.
  assert DexLib.weightOf(10_000, D) == 10_000 * D;
  assert DexLib.weightOf(0, D) == 0;
  assert DexLib.weightOf(10_000, 0) == 0;
};

// --- Relay: relayPositions ---------------------------------------------------------

do {
  // No position at all: nothing to shorten, the budget is still reported.
  let s = store();
  let r = relay(s, 99, 30_000 * D);
  assert r.weight == 30_000 * D;
  assert r.relayWeight == 10_000 * D;
  assert r.shortenedWeight == 0;
  assert r.positionsShortened == 0;
  assert r.positionsFreed == 0;
};

do {
  // Zero weight: nothing happens.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR));
  let r = relay(s, 99, 0);
  assert r.relayWeight == 0;
  assert r.positionsShortened == 0;
  assert unlockOf(s, 10) == now + YEAR;
  assert relayReceivedOf(s, 10) == 0;
};

do {
  // RELAY_DIVISOR governs the amount: relayWeight = weight / 3, rounded down.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR));
  let a = relay(s, 99, 3 * 40_000 * D);
  assert a.relayWeight == 40_000 * D;
  assert a.relayWeight == a.weight / DexLib.RELAY_DIVISOR;
  // One lone position takes the whole budget: shortened by relayWeight / shares.
  assert a.shortenedWeight == 40_000 * D;
  assert unlockOf(s, 10) == now + YEAR - 4 * D;
  assert relayReceivedOf(s, 10) == 4 * D;

  let t = store();
  put(t, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR));
  let b = relay(t, 99, 3 * 40_000 * D + 2);
  assert b.relayWeight == 40_000 * D; // 2 left over by the division are dropped
  assert unlockOf(t, 10) == now + YEAR - 4 * D;
};

do {
  // A weight under the divisor gives a zero budget.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR));
  let r = relay(s, 99, DexLib.RELAY_DIVISOR - 1);
  assert r.relayWeight == 0;
  assert r.positionsShortened == 0;
  assert unlockOf(s, 10) == now + YEAR;
};

do {
  // Pro rata to shares x time served: same shares, 1 year and 3 years served.
  // Budget 40_000 D over 10_000 x (1 + 3) years: 1/4 and 3/4 of it.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + 2 * YEAR));
  put(s, positionOf(11, 1, bob, 10_000, now - 3 * YEAR, now + 2 * YEAR));
  let r = relay(s, 99, 3 * 40_000 * D);
  assert r.positionsShortened == 2;
  assert r.positionsFreed == 0;
  assert unlockOf(s, 10) == now + 2 * YEAR - D;
  assert unlockOf(s, 11) == now + 2 * YEAR - 3 * D;
  assert relayReceivedOf(s, 10) == D;
  assert relayReceivedOf(s, 11) == 3 * D;
  // Weight removed = shares x shortening.
  assert r.shortenedWeight == 10_000 * D + 10_000 * 3 * D;
};

do {
  // Different capital, same time served: every share is shortened by the same
  // amount, so the larger position gets the larger share of the budget.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + 2 * YEAR));
  put(s, positionOf(11, 1, bob, 30_000, now - YEAR, now + 2 * YEAR));
  let r = relay(s, 99, 3 * 40_000 * D);
  assert unlockOf(s, 10) == now + 2 * YEAR - D;
  assert unlockOf(s, 11) == now + 2 * YEAR - D;
  assert r.shortenedWeight == 40_000 * D;
  assert r.positionsShortened == 2;
};

do {
  // The shortened weight never exceeds the budget (rounding goes down).
  let s = store();
  put(s, positionOf(10, 1, alice, 7_000, now - YEAR, now + 2 * YEAR));
  put(s, positionOf(11, 1, bob, 13_000, now - 2 * YEAR, now + 2 * YEAR));
  put(s, positionOf(12, 1, carol, 5_000, now - 3 * YEAR, now + 2 * YEAR));
  let r = relay(s, 99, 3 * 123_456_789_012_345);
  assert r.shortenedWeight <= r.relayWeight;
  assert r.positionsShortened == 3;
};

do {
  // Never lengthened, and the excluded position, other pools, free, expired
  // and not-yet-served positions are untouched.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR)); // relayed
  put(s, positionOf(11, 1, bob, 10_000, now - YEAR, now + YEAR)); // excluded
  put(s, positionOf(12, 2, bob, 10_000, now - YEAR, now + YEAR)); // other pool
  put(s, positionOf(13, 1, carol, 10_000, now - YEAR, 0)); // free
  put(s, positionOf(14, 1, carol, 10_000, now - YEAR, now)); // arrived at term
  put(s, positionOf(15, 1, carol, 10_000, now - 2 * YEAR, now - YEAR)); // expired
  put(s, positionOf(16, 1, carol, 10_000, now, now + YEAR)); // lock starts now: nothing served
  put(s, positionOf(17, 1, carol, 0, now - YEAR, now + YEAR)); // no capital
  let r = relay(s, 11, 3 * 10_000 * D);
  assert r.positionsShortened == 1;
  assert unlockOf(s, 10) == now + YEAR - D;
  assert unlockOf(s, 11) == now + YEAR;
  assert unlockOf(s, 12) == now + YEAR;
  assert unlockOf(s, 13) == 0;
  assert unlockOf(s, 14) == now;
  assert unlockOf(s, 15) == now - YEAR;
  assert unlockOf(s, 16) == now + YEAR;
  assert unlockOf(s, 17) == now + YEAR;
  for ((id, p) in s.positions.entries()) {
    if (id != 10) assert p.relayReceivedNs == 0;
  };
};

do {
  // Only positions that cannot be relayed: nothing to shorten.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, 0));
  put(s, positionOf(11, 1, bob, 10_000, now - 2 * YEAR, now - YEAR));
  let r = relay(s, 99, 3 * 10_000 * D);
  assert r.relayWeight == 10_000 * D;
  assert r.shortenedWeight == 0;
  assert r.positionsShortened == 0;
  assert r.positionsFreed == 0;
};

do {
  // Capped at the remaining time: a position that has little time left is
  // freed, never pushed before now, and counted as freed.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + 10));
  let r = relay(s, 99, 3 * 100_000 * D);
  assert unlockOf(s, 10) == now;
  assert relayReceivedOf(s, 10) == 10;
  assert r.positionsShortened == 1;
  assert r.positionsFreed == 1;
  assert r.shortenedWeight == 10_000 * 10;
  // The freed position stays in the store as free liquidity (not expelled).
  assert s.positions.get(10) != null;
  // A second relay finds nothing to shorten.
  let again = relay(s, 99, 3 * 100_000 * D);
  assert again.positionsShortened == 0;
};

do {
  // Position at the minimum lock: the relay is not bound by the 3 months
  // minimum, which applies to commitments only.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + THREE_MONTHS));
  let r = relay(s, 99, 3 * 10_000 * D);
  assert r.positionsShortened == 1;
  assert r.positionsFreed == 0;
  assert unlockOf(s, 10) == now + THREE_MONTHS - D;
  assert unlockOf(s, 10) - now < THREE_MONTHS;
  assert unlockOf(s, 10) > now;
};

do {
  // Shortening smaller than one ns per share is not applied.
  let s = store();
  put(s, positionOf(10, 1, alice, 10_000, now - YEAR, now + YEAR));
  let r = relay(s, 99, 3 * 9_999);
  assert r.relayWeight == 9_999;
  assert r.positionsShortened == 0;
  assert r.shortenedWeight == 0;
  assert unlockOf(s, 10) == now + YEAR;
};

// --- Extension: extendLock -------------------------------------------------------------

do {
  // The relay is computed on the added duration only, and the extending
  // position does not relay itself.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(s, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));
  let added = THREE_MONTHS;
  let newUnlockAt : Int = now + SIX_MONTHS + added;
  switch (extend(s, 1, alice, newUnlockAt)) {
    case (#ok(v)) {
      // Weight = shares x added ns, not shares x the whole new lock.
      assert v.relay.weight == 10_000 * added;
      assert v.relay.weight != 10_000 * Int.abs(newUnlockAt - now);
      assert v.relay.relayWeight == 10_000 * added / DexLib.RELAY_DIVISOR;
      assert v.relay.positionsShortened == 1;
      assert v.position.unlockAt == newUnlockAt;
      assert v.position.lockDurationNs == SIX_MONTHS + SIX_MONTHS + added;
    };
    case _ assert false;
  };
  // Bob (only candidate, all the budget) is shortened by added / 3 ns.
  assert added % 3 == 0;
  assert unlockOf(s, 2) == now + 2 * YEAR - added / 3;
  assert relayReceivedOf(s, 2) == added / 3;
  // The extending position did not relay itself.
  assert unlockOf(s, 1) == newUnlockAt;
  assert relayReceivedOf(s, 1) == 0;
};

do {
  // Extending alone (no other position): the relay is empty but the extension
  // still goes through.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  switch (extend(s, 1, alice, now + YEAR)) {
    case (#ok(v)) {
      assert v.relay.weight == 10_000 * (YEAR - SIX_MONTHS);
      assert v.relay.positionsShortened == 0;
      assert v.relay.shortenedWeight == 0;
      assert v.position.unlockAt == now + YEAR;
    };
    case _ assert false;
  };
  assert relayReceivedOf(s, 1) == 0;
};

do {
  // The same unlock date is accepted for a locked position but adds nothing:
  // no relay, nobody moves.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(s, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));
  switch (extend(s, 1, alice, now + SIX_MONTHS)) {
    case (#ok(v)) {
      assert v.relay.weight == 0;
      assert v.relay.relayWeight == 0;
      assert v.relay.positionsShortened == 0;
      assert v.position.unlockAt == now + SIX_MONTHS;
    };
    case _ assert false;
  };
  assert unlockOf(s, 2) == now + 2 * YEAR;
};

do {
  // A free position is committed anew: the whole duration from now is the
  // added weight, lockStartedAt = now and relayReceivedNs restarts at 0.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - YEAR, 0));
  put(s, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));
  switch (extend(s, 1, alice, now + SIX_MONTHS)) {
    case (#ok(v)) {
      assert v.relay.weight == 10_000 * SIX_MONTHS;
      assert v.position.lockStartedAt == now;
      assert v.position.lockDurationNs == SIX_MONTHS;
      assert v.position.relayReceivedNs == 0;
      assert v.position.unlockAt == now + SIX_MONTHS;
    };
    case _ assert false;
  };
  assert SIX_MONTHS % 3 == 0;
  assert unlockOf(s, 2) == now + 2 * YEAR - SIX_MONTHS / 3;
  assert unlockOf(s, 1) == now + SIX_MONTHS;
  assert relayReceivedOf(s, 1) == 0;
};

do {
  // An expired position is committed anew like a free one.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - 2 * YEAR, now - YEAR));
  switch (extend(s, 1, alice, now + THREE_MONTHS)) {
    case (#ok(v)) {
      assert v.position.lockStartedAt == now;
      assert v.position.lockDurationNs == THREE_MONTHS;
      assert v.relay.weight == 10_000 * THREE_MONTHS;
    };
    case _ assert false;
  };
};

do {
  // The relay does not touch positions of another pool.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(s, positionOf(2, 2, bob, 10_000, now - YEAR, now + 2 * YEAR));
  switch (extend(s, 1, alice, now + YEAR)) {
    case (#ok(v)) assert v.relay.positionsShortened == 0;
    case _ assert false;
  };
  assert unlockOf(s, 2) == now + 2 * YEAR;
};

do {
  // MAX_LOCK_NS ceiling: exactly 5 years remaining is accepted, 1 ns more is
  // refused with the maximum unlock date; the refusal relays nothing.
  let ok = store();
  put(ok, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(ok, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));
  switch (extend(ok, 1, alice, now + FIVE_YEARS)) {
    case (#ok(v)) {
      assert v.position.unlockAt == now + FIVE_YEARS;
      assert v.relay.weight == 10_000 * (FIVE_YEARS - SIX_MONTHS);
    };
    case _ assert false;
  };

  let refused = store();
  put(refused, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(refused, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));
  switch (extend(refused, 1, alice, now + FIVE_YEARS + 1)) {
    case (#err(#lockTooLong(e))) assert e.maximumUnlockAt == now + FIVE_YEARS;
    case _ assert false;
  };
  assert unlockOf(refused, 1) == now + SIX_MONTHS;
  assert unlockOf(refused, 2) == now + 2 * YEAR;
  assert relayReceivedOf(refused, 2) == 0;

  // Free position: same ceiling from now.
  let free = store();
  put(free, positionOf(1, 1, alice, 10_000, now - YEAR, 0));
  switch (extend(free, 1, alice, now + FIVE_YEARS + 1)) {
    case (#err(#lockTooLong(e))) assert e.maximumUnlockAt == now + FIVE_YEARS;
    case _ assert false;
  };
};

do {
  // Rejected extensions leave the store untouched and relay nothing.
  let s = store();
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  put(s, positionOf(2, 1, bob, 10_000, now - YEAR, now + 2 * YEAR));

  // Not the owner.
  switch (extend(s, 1, bob, now + YEAR)) {
    case (#err(#notPositionOwner)) {};
    case _ assert false;
  };
  // Unknown position.
  switch (extend(s, 77, alice, now + YEAR)) {
    case (#err(#positionNotFound)) {};
    case _ assert false;
  };
  // Never shortens.
  switch (extend(s, 1, alice, now + THREE_MONTHS)) {
    case (#err(#cannotShortenLock(e))) assert e.unlockAt == now + SIX_MONTHS;
    case _ assert false;
  };
  // Locked position: remaining time under 3 months after the extension is
  // impossible without shortening, so check the date in the past / now on a
  // position that is still locked for a short time.
  let short = store();
  put(short, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + THREE_MONTHS / 3));
  switch (extend(short, 1, alice, now + THREE_MONTHS - 1)) {
    case (#err(#lockTooShort(e))) assert e.minimumNs == THREE_MONTHS;
    case _ assert false;
  };
  // Free position: under 3 months and a date in the past.
  let free = store();
  put(free, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, 0));
  switch (extend(free, 1, alice, now + THREE_MONTHS - 1)) {
    case (#err(#lockTooShort(_))) {};
    case _ assert false;
  };
  switch (extend(free, 1, alice, now)) {
    case (#err(#lockTooShort(_))) {};
    case _ assert false;
  };
  switch (extend(free, 1, alice, now - 1)) {
    case (#err(#lockTooShort(_))) {};
    case _ assert false;
  };

  assert unlockOf(s, 1) == now + SIX_MONTHS;
  assert unlockOf(s, 2) == now + 2 * YEAR;
  assert relayReceivedOf(s, 2) == 0;
  assert unlockOf(free, 1) == 0;
};

do {
  // A removed pool refuses the extension.
  let s = store();
  s.pools.add(1, poolWith(1, #removed));
  put(s, positionOf(1, 1, alice, 10_000, now - SIX_MONTHS, now + SIX_MONTHS));
  switch (extend(s, 1, alice, now + YEAR)) {
    case (#err(#poolRemoved)) {};
    case _ assert false;
  };
  assert unlockOf(s, 1) == now + SIX_MONTHS;
};

// --- Fee weight: feeWeight -------------------------------------------------------------------

// Fixed-point scale of the square root: sqrt(remaining / 5 years) x 1e12.
let SCALE : Nat = 1_000_000_000_000;

func weightAt(shares : Nat, startedAt : Int, unlockAt : Int) : Nat {
  DexLib.feeWeight(positionOf(1, 1, alice, shares, startedAt, unlockAt), now);
};

do {
  // A free position has no weight.
  assert weightAt(10_000, now - YEAR, 0) == 0;
  // Neither has one that has arrived at term or expired.
  assert weightAt(10_000, now - YEAR, now) == 0;
  assert weightAt(10_000, now - 2 * YEAR, now - 1) == 0;
  assert weightAt(10_000, now - 2 * YEAR, now - YEAR) == 0;
  // No capital, no weight.
  assert weightAt(0, now - YEAR, now + YEAR) == 0;
};

do {
  // capital x sqrt(remaining / 5 years): full five years remaining.
  assert weightAt(10_000, now, now + FIVE_YEARS) == 10_000 * SCALE;
  // A quarter of the time: half the weight per share.
  assert weightAt(10_000, now, now + FIVE_YEARS / 4) == 10_000 * SCALE / 2;
  // A hundredth of the time: a tenth of the weight per share.
  assert weightAt(10_000, now, now + FIVE_YEARS / 100) == 10_000 * SCALE / 10;
  // 1/16: a quarter.
  assert weightAt(10_000, now, now + FIVE_YEARS / 16) == 10_000 * SCALE / 4;
  // The 3 month minimum.
  let atMinimum = weightAt(10_000, now, now + THREE_MONTHS);
  assert atMinimum > 0;
  assert atMinimum < 10_000 * SCALE;
  // sqrt of (91 / 1826) = 0.2232...: between 0.22 and 0.23 of the full weight.
  assert atMinimum > 10_000 * SCALE * 22 / 100;
  assert atMinimum < 10_000 * SCALE * 23 / 100;
};

do {
  // Linear in capital.
  let one = weightAt(1_000, now, now + YEAR);
  assert weightAt(2_000, now, now + YEAR) == 2 * one;
  assert weightAt(7_000, now, now + YEAR) == 7 * one;
  // Quadrupling the remaining time doubles the weight.
  assert weightAt(1_000, now, now + FIVE_YEARS / 4) == 2 * weightAt(1_000, now, now + FIVE_YEARS / 16);
  // Monotonic in the remaining time.
  assert weightAt(1_000, now, now + 2 * YEAR) > weightAt(1_000, now, now + YEAR);
};

do {
  // The weight reads the time left, not the lock start nor the original
  // duration: a relayed (shortened) position weighs less than before.
  assert weightAt(10_000, now - YEAR, now + YEAR) == weightAt(10_000, now - 3 * YEAR, now + YEAR);
  assert weightAt(10_000, now, now + YEAR - D) < weightAt(10_000, now, now + YEAR);
  // It decreases as time passes.
  let p = positionOf(1, 1, alice, 10_000, now, now + 2 * YEAR);
  assert DexLib.feeWeight(p, now + YEAR) < DexLib.feeWeight(p, now);
  assert DexLib.feeWeight(p, now + 2 * YEAR) == 0;
  assert DexLib.feeWeight(p, now + 3 * YEAR) == 0;
};

do {
  // The last nanosecond of a lock still counts.
  assert weightAt(10_000, now - YEAR, now + 1) > 0;
};

do {
  // The weight of one position is the fraction of the pool weight it gets:
  // equal capital and time give equal weight, free positions are out.
  let a = weightAt(10_000, now - YEAR, now + YEAR);
  let b = weightAt(10_000, now - YEAR, now + YEAR);
  let c = weightAt(10_000, now - YEAR, 0);
  assert a == b;
  assert a > 0;
  assert c == 0;
};
