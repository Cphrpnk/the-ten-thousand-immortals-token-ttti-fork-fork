import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import DexLib "../src/backend/lib/dex";
import RouterLib "../src/backend/lib/router";
import DexTypes "../src/backend/types/dex";
import PageTypes "../src/backend/types/page";
import RouterTypes "../src/backend/types/router";

// PTM-9e: paged swap lists, owner index and the set-aside of one pool.
//   - 10 000 ICPSwap swaps (among native ones) are read by pages: every swap
//     exactly once, newest first, no native swap, server-side page cap;
//   - listByOwner reads the owner index only: the owner's swaps and no other,
//     and a swap missing from the index is not returned;
//   - paySetAside of one pool reads the positions of that pool only and
//     removes the entries that reach zero.

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")); symbol = "ICP"; decimals = 8 };
let ckbtcToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("mxzaz-hqaaa-aaaar-qaada-cai")); symbol = "ckBTC"; decimals = 8 };

func owner(i : Nat) : Principal {
  Principal.fromBlob(Blob.fromArray([1, Nat8.fromNat(i)]));
};

// --- Swaps -----------------------------------------------------------------------

let TOTAL = 15_000; // ids 0..14 999; id % 3 == 2 is a native swap, the rest ICPSwap
let OWNERS = 7;

func isNative(id : Nat) : Bool = id % 3 == 2;

func mkSwap(id : Nat) : RouterTypes.RoutedSwap {
  {
    id;
    owner = owner(id % OWNERS);
    createdAt = id;
    updatedAt = id;
    route = if (isNative(id)) #native({ poolId = 1 }) else #icpswap({ poolCanisterId = owner(100) });
    tokenIn = #icp;
    tokenOut = #tttiT;
    amountIn = 1_000 + id;
    amountOut = 900 + id;
    minAmountOut = 0;
    deadline = 0;
    fees = #native({ feeBps = 30; fee = 3 });
    nativePoolId = ?1;
    zeroForOne = false;
    stage = #done;
    status = #completed;
    move = null;
    lastError = null;
  };
};

func routerStore() : RouterTypes.RouterStore {
  {
    swaps = Map.empty<Nat, RouterTypes.RoutedSwap>();
    var nextSwapId = 0;
    feeTotals = Map.empty<DexTypes.PoolId, RouterTypes.RouterFeeTotals>();
    setAside = Map.empty<DexTypes.PoolId, RouterTypes.RouterSetAside>();
    redirected = Map.empty<DexTypes.PoolId, RouterTypes.RouterRedirect>();
  };
};

// Registry of TOTAL swaps, indexed by owner in creation order.
func listContext() : RouterLib.ListContext {
  let store = routerStore();
  let ownerIndex : RouterTypes.OwnerSwapIndex = Map.empty<Principal, List.List<Nat>>();
  for (id in Nat.range(0, TOTAL)) {
    let s = mkSwap(id);
    store.swaps.add(id, s);
    let ids = switch (ownerIndex.get(s.owner)) {
      case (?l) l;
      case null {
        let l = List.empty<Nat>();
        ownerIndex.add(s.owner, l);
        l;
      };
    };
    ids.add(id);
  };
  store.nextSwapId := TOTAL;
  { store; ownerIndex };
};

// --- 10 000 ICPSwap swaps read by pages -------------------------------------------

do {
  let ctx = listContext();
  var cursor : ?Nat = null;
  var count = 0;
  var pages = 0;
  var expected = TOTAL; // next expected id is below this
  var finished = false;
  while (not finished) {
    let page = RouterLib.listIcpswapSwaps(ctx, cursor, 100);
    pages += 1;
    assert page.items.size() <= PageTypes.MAX_PAGE_SIZE;
    for (s in page.items.values()) {
      // Newest first, no omission: the next ICPSwap id below the previous one.
      expected -= 1;
      while (isNative(expected)) { expected -= 1 };
      assert s.id == expected;
      switch (s.route) {
        case (#icpswap(_)) {};
        case (#native(_)) { assert false };
      };
      count += 1;
    };
    switch (page.nextCursor) {
      case (?c) {
        assert page.items.size() == 100;
        assert page.items[99].id == c;
        cursor := ?c;
      };
      case null finished := true;
    };
    assert pages <= 200;
  };
  assert count == 10_000;
  assert pages == 100;
  // Nothing older remains.
  assert expected == 0;
};

// --- Page size: 0 = default, above the cap = cap; cursor 0 = nothing ---------------

do {
  let ctx = listContext();
  assert RouterLib.listIcpswapSwaps(ctx, null, 0).items.size() == PageTypes.DEFAULT_PAGE_SIZE;
  assert RouterLib.listIcpswapSwaps(ctx, null, 1_000_000).items.size() == PageTypes.MAX_PAGE_SIZE;
  assert RouterLib.listIcpswapSwaps(ctx, null, 3).items.size() == 3;
  let empty = RouterLib.listIcpswapSwaps(ctx, ?0, 10);
  assert empty.items.size() == 0 and empty.nextCursor == null;
  // The page after the first one starts below its last id.
  let first = RouterLib.listIcpswapSwaps(ctx, null, 10);
  let second = RouterLib.listIcpswapSwaps(ctx, first.nextCursor, 10);
  assert second.items[0].id < first.items[9].id;
  // The oldest ICPSwap swap is id 0 and ends the list.
  let last = RouterLib.listIcpswapSwaps(ctx, ?2, 10);
  assert last.items.size() == 2 and last.items[0].id == 1 and last.items[1].id == 0;
  assert last.nextCursor == null;
};

// --- listByOwner reads the owner index ---------------------------------------------

do {
  let ctx = listContext();
  for (k in Nat.range(0, OWNERS)) {
    let who = owner(k);
    var expected = 0; // number of ids of this owner
    for (id in Nat.range(0, TOTAL)) { if (id % OWNERS == k) expected += 1 };
    var cursor : ?Nat = null;
    var count = 0;
    var previous = TOTAL;
    var finished = false;
    while (not finished) {
      let page = RouterLib.listByOwner(ctx, who, cursor, 100);
      assert page.items.size() <= 100;
      for (s in page.items.values()) {
        assert s.owner == who;
        assert s.id < previous; // newest first, no duplicate
        previous := s.id;
        count += 1;
      };
      switch (page.nextCursor) {
        case (?c) {
          assert page.items.size() == 100;
          cursor := ?c;
        };
        case null finished := true;
      };
    };
    assert count == expected;
  };
  // An owner without swap.
  let nobody = RouterLib.listByOwner(ctx, owner(200), null, 50);
  assert nobody.items.size() == 0 and nobody.nextCursor == null;
};

do {
  // A swap that is in the registry but not in the owner index is not returned
  // (the registry is not scanned); an index id without swap is skipped.
  let ctx = listContext();
  let who = owner(50);
  let indexed = mkSwap(1_000_000);
  let unindexed = mkSwap(1_000_001);
  ctx.store.swaps.add(indexed.id, { indexed with owner = who });
  ctx.store.swaps.add(unindexed.id, { unindexed with owner = who });
  let ids = List.empty<Nat>();
  ids.add(999_999); // no such swap
  ids.add(indexed.id);
  ctx.ownerIndex.add(who, ids);
  let page = RouterLib.listByOwner(ctx, who, null, 100);
  assert page.items.size() == 1 and page.items[0].id == 1_000_000 and page.nextCursor == null;
};

// --- Set-aside of one pool ----------------------------------------------------------

func pool(id : Nat, token1 : DexTypes.PoolToken) : DexTypes.Pool {
  {
    id;
    token0 = tttiToken;
    token1;
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

func dexStore() : DexTypes.DexStore {
  let pools = Map.empty<Nat, DexTypes.Pool>();
  pools.add(1, pool(1, icpToken));
  pools.add(2, pool(2, ckbtcToken));
  pools.add(3, pool(3, icpToken));
  {
    pools;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 4;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 100;
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

func addPosition(s : DexTypes.DexStore, id : Nat, poolId : Nat, who : Principal, shares : Nat) {
  let p : DexTypes.Position = {
    id;
    poolId;
    owner = who;
    shares;
    createdAt = 0;
    lockDurationNs = 0;
    unlockAt = 0;
    isCreator = false;
    lockStartedAt = 0;
    relayReceivedNs = 0;
    feesCollected0 = 0;
    feesCollected1 = 0;
  };
  s.positions.add(id, p);
  DexLib.indexAdd(s, poolId, id);
};

do {
  let ds = dexStore();
  let balances : DexTypes.DexBalances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  let a = owner(1);
  let b = owner(2);
  let c = owner(3);
  addPosition(ds, 1, 1, a, 1);
  addPosition(ds, 2, 1, b, 3);
  addPosition(ds, 3, 2, c, 5);
  let rs = routerStore();
  rs.setAside.add(1, { amount0 = 1_001; amount1 = 2_000 });
  rs.setAside.add(2, { amount0 = 500; amount1 = 300 });
  rs.setAside.add(3, { amount0 = 7; amount1 = 0 }); // pool without position
  rs.setAside.add(4, { amount0 = 0; amount1 = 0 }); // zero entry
  let pause = { var paused = false };
  let ctx : RouterLib.PayContext = { store = rs; dex = { dex = ds; balances; pause } };
  var dust0 = 0;
  var dust1 = 0;
  func toProtocol(side0 : Bool, amount : Nat) {
    if (side0) { dust0 += amount } else { dust1 += amount };
  };

  // Only pool 1 is paid.
  RouterLib.paySetAsideWith(ctx, 1, toProtocol);
  assert rs.setAside.get(1) == null; // reached zero: removed
  let pot = DexLib.potOf(ds, 1);
  // Conservation: paid to the positions + pot (locked half) + dust = set-aside.
  let paid0 = DexLib.available(balances, a, #tttiT) + DexLib.available(balances, b, #tttiT);
  let paid1 = DexLib.available(balances, a, #icp) + DexLib.available(balances, b, #icp);
  assert paid0 + pot.pending0 + dust0 == 1_001;
  assert paid1 + pot.pending1 + dust1 == 2_000;
  assert paid0 > 0 and paid1 > 0;
  // Pro rata on the shares of pool 1 only (1 : 3).
  assert DexLib.available(balances, b, #tttiT) == 3 * DexLib.available(balances, a, #tttiT) or DexLib.available(balances, b, #tttiT) == 3 * DexLib.available(balances, a, #tttiT) + 2;
  // Pool 2: owner and entry untouched.
  assert DexLib.available(balances, c, #tttiT) == 0;
  assert DexLib.available(balances, c, #ckbtc) == 0;
  assert rs.setAside.get(2) == ?{ amount0 = 500; amount1 = 300 };
  let pot2 = DexLib.potOf(ds, 2);
  assert pot2.pending0 == 0 and pot2.pending1 == 0;
  // Fee totals of pool 1 follow the payment.
  switch (rs.feeTotals.get(1)) {
    case (?t) { assert t.lpPaid0 == 1_001 - dust0 and t.lpPaid1 == 2_000 - dust1 };
    case null { assert false };
  };
  assert rs.feeTotals.get(2) == null;

  // Pool 3 has no position: nothing paid, entry kept.
  RouterLib.paySetAsideWith(ctx, 3, toProtocol);
  assert rs.setAside.get(3) == ?{ amount0 = 7; amount1 = 0 };

  // A zero entry is removed, whatever the pool.
  RouterLib.paySetAsideWith(ctx, 4, toProtocol);
  assert rs.setAside.get(4) == null;

  // Paused: nothing moves.
  pause.paused := true;
  RouterLib.paySetAsideWith(ctx, 2, toProtocol);
  assert rs.setAside.get(2) == ?{ amount0 = 500; amount1 = 300 };
  assert DexLib.available(balances, c, #tttiT) == 0;
  pause.paused := false;

  // Pool 2 is paid when it is its turn; pool 1 is not paid twice.
  let before = DexLib.available(balances, a, #tttiT);
  RouterLib.paySetAsideWith(ctx, 2, toProtocol);
  assert rs.setAside.get(2) == null;
  assert DexLib.available(balances, c, #tttiT) > 0;
  assert DexLib.available(balances, a, #tttiT) == before;
};
