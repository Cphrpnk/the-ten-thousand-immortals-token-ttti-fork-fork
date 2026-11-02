import Int "mo:core/Int";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Types "../types/dex";
import DexLib "dex";

// PTM-9d: per-pool LP fee pot and daily sliced sharing.
//
// A swap adds the locked-share half of each LP fee to the pool's pending pot
// (DexLib.shareLpFee) and touches no position. Once a day startDayRoll freezes
// every pot and starts the sharing; runSlice then handles at most `sliceSize`
// positions of one pool per call, in two passes:
//   #summing  sums the weighted products (weight x ns locked during the day);
//             at the end of the pass the unpaid shares of positions removed
//             during the day join the sum and are paid.
//   #paying   credits each position floor(frozen x product / total) in the
//             pool's two tokens (internal DEX balance, feesCollected,
//             lockedFeesPaid) and opens its record for the new day.
// The rounding remainder, and the whole pot when nobody was locked, goes to
// the pool reserves. Every amount is a floor division of the same frozen
// amounts, so the total paid does not depend on the slice size.
module {
  func idleReport(poolId : Types.PoolId) : Types.PotSliceReport {
    { poolId; phase = #idle; processed = 0; more = false; paid0 = 0; paid1 = 0 };
  };

  // Keys of the unpaid shares of a pool: those of the positions removed
  // before the sharing (shared = false) or, while it is paying, those of the
  // positions removed before being paid (shared = true, key "S:...").
  func unpaidKeysOf(store : Types.DexStore, poolId : Types.PoolId, sharedKey : Bool) : [Text] {
    let keys = List.empty<Text>();
    for ((key, u) in store.fees.unpaid.entries()) {
      if (u.poolId == poolId and key.startsWith(#text "S:") == sharedKey) keys.add(key);
    };
    keys.toArray();
  };

  // Pools whose sharing is running (the composition calls runSlice for each
  // until it reports more = false).
  public func runningPools(store : Types.DexStore) : [Types.PoolId] {
    let out = List.empty<Types.PoolId>();
    for ((poolId, pot) in store.fees.pots.entries()) {
      if (pot.phase != #idle) out.add(poolId);
    };
    out.toArray();
  };

  // Day roll. Does nothing before nextSharingAt, nor while a sharing of the
  // previous day is still running. Otherwise, for every pool with a pending
  // pot or positions: freezes the pot and starts the sliced sharing of the day
  // [fees.dayStart, now]; then starts a new day at `now`. The next boundary is
  // the one just passed plus one day (see below), so a pass that runs shortly
  // after its timer does not skip the following day.
  public func startDayRoll(store : Types.DexStore, now : Types.Timestamp) : Types.DayRollReport {
    let fees = store.fees;
    let notRolled : Types.DayRollReport = { rolled = false; dayStart = fees.dayStart; nextSharingAt = fees.nextSharingAt; poolsStarted = 0 };
    if (now < fees.nextSharingAt) return notRolled;
    for (pot in fees.pots.values()) {
      if (pot.phase != #idle) return notRolled;
    };
    let dayStart = fees.dayStart;
    var started = 0;
    for ((poolId, _) in store.pools.entries()) {
      let pot = DexLib.potOf(store, poolId);
      let hasPot = pot.pending0 > 0 or pot.pending1 > 0;
      if (hasPot or DexLib.poolHasPositions(store, poolId)) {
        pot.sharedDayStart := dayStart;
        pot.sharedDayEnd := now;
        pot.frozen0 := pot.pending0;
        pot.frozen1 := pot.pending1;
        pot.pending0 := 0;
        pot.pending1 := 0;
        pot.paid0 := 0;
        pot.paid1 := 0;
        pot.totalProductNs := 0;
        pot.cursor := null;
        if (hasPot) {
          pot.phase := #summing;
        } else {
          // Nothing to share: only the lock records open for the new day.
          for (key in unpaidKeysOf(store, poolId, false).values()) fees.unpaid.remove(key);
          pot.phase := #paying;
        };
        started += 1;
      } else {
        for (key in unpaidKeysOf(store, poolId, false).values()) fees.unpaid.remove(key);
      };
    };
    fees.dayStart := now;
    // Anchored to the boundary just passed, not to the time the pass actually
    // ran: a pass that runs a little after its timer fired cannot push the
    // next boundary beyond the next pass, so the sharing runs once a day. After
    // a long gap the boundary moves to the first one after `now`.
    let boundary = fees.nextSharingAt;
    let anchored = boundary + Types.SHARING_DAY_NS;
    fees.nextSharingAt := if (anchored > now) anchored else boundary + Types.SHARING_DAY_NS * (1 + (now - boundary) / Types.SHARING_DAY_NS);
    { rolled = true; dayStart = fees.dayStart; nextSharingAt = fees.nextSharingAt; poolsStarted = started };
  };

  // One slice of the sharing of one pool (at most `sliceSize` positions).
  // Does nothing when no sharing is running for the pool.
  public func runSlice(store : Types.DexStore, balances : Types.DexBalances, poolId : Types.PoolId, sliceSize : Nat) : Types.PotSliceReport {
    let pot = switch (store.fees.pots.get(poolId)) {
      case (?p) p;
      case null return idleReport(poolId);
    };
    if (pot.phase == #idle) return idleReport(poolId);
    let phase = pot.phase;
    let pool0 = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return idleReport(poolId);
    };
    let tokens = (DexLib.poolDexToken(pool0.token0), DexLib.poolDexToken(pool0.token1));

    // Next ids after the cursor, in increasing order.
    let ids = List.empty<Types.PositionId>();
    var exhausted = true;
    switch (store.poolPositions.get(poolId)) {
      case (?set) {
        let iter = switch (pot.cursor) {
          case (?c) set.valuesFrom(c);
          case null set.values();
        };
        var going = true;
        while (going) {
          if (ids.size() >= sliceSize) {
            exhausted := false;
            going := false;
          } else {
            switch (iter.next()) {
              case (?id) {
                let past = switch (pot.cursor) {
                  case (?c) id <= c;
                  case null false;
                };
                if (not past) ids.add(id);
              };
              case null { going := false };
            };
          };
        };
      };
      case null {};
    };

    var slicePaid0 = 0;
    var slicePaid1 = 0;
    var lastId = pot.cursor;

    // Credits `owner` its share of the frozen pot for `product`.
    let pay = func(owner : Principal, product : Nat, positionId : ?Types.PositionId) {
      if (product == 0 or pot.totalProductNs == 0) return;
      let left0 = pot.frozen0 - Nat.min(pot.frozen0, pot.paid0);
      let left1 = pot.frozen1 - Nat.min(pot.frozen1, pot.paid1);
      let s0 = Nat.min(pot.frozen0 * product / pot.totalProductNs, left0);
      let s1 = Nat.min(pot.frozen1 * product / pot.totalProductNs, left1);
      if (s0 > 0) {
        switch (tokens.0) {
          case (?t) DexLib.credit(balances, owner, t, s0);
          case null {};
        };
      };
      if (s1 > 0) {
        switch (tokens.1) {
          case (?t) DexLib.credit(balances, owner, t, s1);
          case null {};
        };
      };
      pot.paid0 += s0;
      pot.paid1 += s1;
      slicePaid0 += s0;
      slicePaid1 += s1;
      switch (positionId) {
        case (?id) {
          switch (store.positions.get(id)) {
            case (?pos) store.positions.add(id, { pos with feesCollected0 = pos.feesCollected0 + s0; feesCollected1 = pos.feesCollected1 + s1 });
            case null {};
          };
        };
        case null {};
      };
    };

    switch (phase) {
      case (#summing) {
        var sum = 0;
        for (id in ids.values()) {
          lastId := ?id;
          switch (store.positions.get(id), store.fees.locks.get(id)) {
            case (?pos, ?l) {
              if (l.lockedFrom < pot.sharedDayEnd) {
                sum += DexLib.lockProduct(l, pos.unlockAt, pot.sharedDayStart, pot.sharedDayEnd);
              };
            };
            case _ {};
          };
        };
        pot.totalProductNs += sum;
        if (exhausted) {
          // Shares of positions removed during the day join the sum and are paid.
          let keys = unpaidKeysOf(store, poolId, false);
          for (key in keys.values()) {
            switch (store.fees.unpaid.get(key)) {
              case (?u) pot.totalProductNs += u.productNs;
              case null {};
            };
          };
          if (pot.totalProductNs == 0) {
            // Nobody was locked during the day: the pot goes to the reserves.
            let pool = switch (store.pools.get(poolId)) {
              case (?p) p;
              case null pool0;
            };
            store.pools.add(poolId, { pool with reserve0 = pool.reserve0 + pot.frozen0; reserve1 = pool.reserve1 + pot.frozen1 });
            pot.frozen0 := 0;
            pot.frozen1 := 0;
          } else {
            for (key in keys.values()) {
              switch (store.fees.unpaid.get(key)) {
                case (?u) {
                  pay(u.owner, u.productNs, null);
                  store.fees.unpaid.remove(key);
                };
                case null {};
              };
            };
          };
          pot.phase := #paying;
          pot.cursor := null;
        } else {
          pot.cursor := lastId;
        };
      };
      case (#paying) {
        // The pass over the positions also refreshes the maintained
        // locked-shares figure that the swap path reads (no position is read
        // by a swap): accumulated here, published with the last slice.
        if (pot.cursor == null) pot.lockedScan := 0;
        for (id in ids.values()) {
          lastId := ?id;
          switch (store.positions.get(id)) {
            case (?pos) { if (pos.unlockAt > pot.sharedDayEnd) pot.lockedScan += pos.shares };
            case null {};
          };
          switch (store.positions.get(id), store.fees.locks.get(id)) {
            case (?pos, ?l) {
              if (l.lockedFrom < pot.sharedDayEnd) {
                pay(pos.owner, DexLib.lockProduct(l, pos.unlockAt, pot.sharedDayStart, pot.sharedDayEnd), ?id);
                // Open the record for the new day, or close it when the lock ended.
                if (pos.unlockAt > pot.sharedDayEnd and pos.shares > 0) {
                  l.weight := DexLib.lockWeightAt(pos.shares, pos.unlockAt, pot.sharedDayEnd);
                  l.lockedFrom := pot.sharedDayEnd;
                  l.lockedUntil := null;
                } else {
                  store.fees.locks.remove(id);
                };
              };
            };
            case _ {};
          };
        };
        if (exhausted) {
          // Positions removed before being paid: already in the total.
          for (key in unpaidKeysOf(store, poolId, true).values()) {
            switch (store.fees.unpaid.get(key)) {
              case (?u) {
                pay(u.owner, u.productNs, null);
                store.fees.unpaid.remove(key);
              };
              case null {};
            };
          };
          // Rounding remainder to the reserves, in favour of the pool.
          let pool = switch (store.pools.get(poolId)) {
            case (?p) p;
            case null pool0;
          };
          store.pools.add(
            poolId,
            {
              pool with
              reserve0 = pool.reserve0 + (pot.frozen0 - Nat.min(pot.frozen0, pot.paid0));
              reserve1 = pool.reserve1 + (pot.frozen1 - Nat.min(pot.frozen1, pot.paid1));
            },
          );
          pot.frozen0 := 0;
          pot.frozen1 := 0;
          pot.paid0 := 0;
          pot.paid1 := 0;
          pot.totalProductNs := 0;
          pot.cursor := null;
          pot.lockedPositionShares := pot.lockedScan;
          pot.lockedScan := 0;
          pot.phase := #idle;
        } else {
          pot.cursor := lastId;
        };
      };
      case (#idle) {};
    };

    if (slicePaid0 > 0 or slicePaid1 > 0) {
      let pool = switch (store.pools.get(poolId)) {
        case (?p) p;
        case null pool0;
      };
      store.pools.add(poolId, { pool with lockedFeesPaid0 = pool.lockedFeesPaid0 + slicePaid0; lockedFeesPaid1 = pool.lockedFeesPaid1 + slicePaid1 });
    };
    {
      poolId;
      phase;
      processed = ids.size();
      more = pot.phase != #idle;
      paid0 = slicePaid0;
      paid1 = slicePaid1;
    };
  };

  // --- Views -------------------------------------------------------------------

  func pendingViewOf(store : Types.DexStore, poolId : Types.PoolId) : Types.PendingPotView {
    let (p0, p1, running) = switch (store.fees.pots.get(poolId)) {
      case (?pot) (pot.pending0, pot.pending1, pot.phase != #idle);
      case null (0, 0, false);
    };
    {
      poolId;
      pending0 = p0;
      pending1 = p1;
      dayStart = store.fees.dayStart;
      nextSharingAt = store.fees.nextSharingAt;
      sharingRunning = running;
    };
  };

  public func pendingPots(store : Types.DexStore) : [Types.PendingPotView] {
    let out = List.empty<Types.PendingPotView>();
    for ((poolId, _) in store.pools.entries()) {
      out.add(pendingViewOf(store, poolId));
    };
    out.toArray();
  };

  public func pendingPot(store : Types.DexStore, poolId : Types.PoolId) : ?Types.PendingPotView {
    switch (store.pools.get(poolId)) {
      case (?_) ?pendingViewOf(store, poolId);
      case null null;
    };
  };

  // Sum, over the pool, of the weighted products of the current day so far
  // (with the unpaid shares of removed positions).
  public func poolProductNow(store : Types.DexStore, poolId : Types.PoolId, now : Types.Timestamp) : Nat {
    var total = 0;
    for (pos in DexLib.positionsInPool(store, poolId).values()) {
      switch (store.fees.locks.get(pos.id)) {
        case (?l) { total += DexLib.lockProduct(l, pos.unlockAt, store.fees.dayStart, now) };
        case null {};
      };
    };
    for ((_, u) in store.fees.unpaid.entries()) {
      if (u.poolId == poolId) total += u.productNs;
    };
    total;
  };

  // Estimated share of one position for the current day, as if the pending
  // pot were shared now with the same weight rule. `poolProduct` is
  // poolProductNow of the position's pool.
  public func estimatedShare(store : Types.DexStore, pos : Types.Position, poolProduct : Nat, now : Types.Timestamp) : Types.EstimatedShareView {
    var weight = 0;
    var lockedNs = 0;
    var product = 0;
    switch (store.fees.locks.get(pos.id)) {
      case (?l) {
        weight := l.weight;
        product := DexLib.lockProduct(l, pos.unlockAt, store.fees.dayStart, now);
        let start = if (l.lockedFrom > store.fees.dayStart) l.lockedFrom else store.fees.dayStart;
        let end = if (now < pos.unlockAt) now else pos.unlockAt;
        lockedNs := if (end > start) Int.abs(end - start) else 0;
      };
      case null {};
    };
    let (p0, p1) = switch (store.fees.pots.get(pos.poolId)) {
      case (?pot) (pot.pending0, pot.pending1);
      case null (0, 0);
    };
    let day = Int.abs(Types.SHARING_DAY_NS);
    {
      positionId = pos.id;
      poolId = pos.poolId;
      owner = pos.owner;
      weight;
      lockedNs;
      dayFractionBps = Nat.min(10_000, lockedNs * 10_000 / day);
      estimated0 = if (poolProduct == 0) 0 else p0 * product / poolProduct;
      estimated1 = if (poolProduct == 0) 0 else p1 * product / poolProduct;
      nextSharingAt = store.fees.nextSharingAt;
    };
  };

  public func estimatedShareOf(store : Types.DexStore, positionId : Types.PositionId, now : Types.Timestamp) : ?Types.EstimatedShareView {
    switch (store.positions.get(positionId)) {
      case (?pos) ?estimatedShare(store, pos, poolProductNow(store, pos.poolId, now), now);
      case null null;
    };
  };

  // The caller's positions with their estimated share, pool by pool.
  public func estimatedSharesOf(store : Types.DexStore, owner : Principal, now : Types.Timestamp) : [Types.EstimatedShareView] {
    let out = List.empty<Types.EstimatedShareView>();
    if (owner.isAnonymous()) return [];
    for ((poolId, _) in store.pools.entries()) {
      let mine = DexLib.positionsInPool(store, poolId).filter(func(p) = p.owner == owner);
      if (mine.size() > 0) {
        let total = poolProductNow(store, poolId, now);
        for (pos in mine.values()) {
          out.add(estimatedShare(store, pos, total, now));
        };
      };
    };
    out.toArray();
  };
};
