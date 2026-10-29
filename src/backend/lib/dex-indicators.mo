import Array "mo:core/Array";
import Error "mo:core/Error";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/dex-indicators";
import DexTypes "../types/dex";
import ReserveTypes "../types/dex-reserve";
import ProtocolTypes "../types/protocol-fees";
import DexLib "dex";

// DEX lot 7: public indicators. The whole snapshot is computed from the current
// stored state by an hourly canister timer and stored; reads only return the
// stored snapshot. Facts only: no APY, no yield projection.
module {
  public let COMPUTE_INTERVAL_SECONDS : Nat = 3600;
  // First computation shortly after start when no snapshot exists.
  public let FIRST_RUN_DELAY_SECONDS : Nat = 30;

  let BPS : Nat = 10_000;
  let DAY_NS : Nat = 86_400_000_000_000;
  let PERIOD_DAYS : Nat = 7;

  // References to the stable stores plus the hourly USD rate lookup. Transient.
  public type IndicatorsContext = {
    store : Types.IndicatorsStore;
    dex : DexTypes.DexStore;
    reserve : ReserveTypes.DexReserveStore;
    protocolLiquidity : Map.Map<Nat, ProtocolTypes.ProtocolLiquidity>;
    rateOf : Int -> DexLib.UsdRateOf;
  };

  // USD (e8) value of `amount` base units; null when the rate is unavailable.
  func usdOf(amount : Nat, decimals : Nat8, rate : ?Nat) : ?Nat {
    switch (rate) {
      case (?r) ?(amount * r / (10 ** decimals.toNat()));
      case null null;
    };
  };

  // USD (e8) of an amount of each pool token; an unused token needs no rate.
  func usdOfPair(pool : DexTypes.Pool, a0 : Nat, a1 : Nat, rateOf : DexLib.UsdRateOf) : ?Nat {
    let v0 : ?Nat = if (a0 == 0) ?0 else usdOf(a0, pool.token0.decimals, rateOf(pool.token0));
    let v1 : ?Nat = if (a1 == 0) ?0 else usdOf(a1, pool.token1.decimals, rateOf(pool.token1));
    switch (v0, v1) {
      case (?x, ?y) ?(x + y);
      case _ null;
    };
  };

  func shareBps(part : Nat, total : Nat) : Nat {
    if (total == 0) 0 else part * BPS / total;
  };

  // Largest input amount whose swap moves the pool price (reserveOut /
  // reserveIn after the swap, reserves updated exactly as a swap does: LP fee
  // stays, protocol fee leaves) by at most `bps`. Fee included, rounding as in
  // the swap (fee rounded up, output rounded down).
  func depthSide(pool : DexTypes.Pool, zeroForOne : Bool, bps : Nat) : Types.DepthSide {
    let zero : Types.DepthSide = { amountIn = 0; amountOut = 0 };
    let (rIn, rOut) = if (zeroForOne) (pool.reserve0, pool.reserve1) else (pool.reserve1, pool.reserve0);
    if (rIn == 0 or rOut == 0) return zero;
    let feeBps = DexLib.feeBps(pool.feeTier);
    func within(a : Nat) : Bool {
      let r = DexLib.amountOut(rIn, rOut, a, feeBps, false);
      let split = DexLib.splitFee(r.fee);
      let newIn = rIn + a - Nat.min(split.protocolFee, a);
      let newOut = rOut - Nat.min(r.amountOut, rOut);
      newOut * rIn * BPS >= rOut * newIn * (BPS - bps);
    };
    var lo : Nat = 0;
    var hi : Nat = rIn * 4;
    while (hi - lo > 1) {
      let mid = (lo + hi) / 2;
      if (within(mid)) lo := mid else hi := mid;
    };
    if (lo == 0) return zero;
    { amountIn = lo; amountOut = DexLib.amountOut(rIn, rOut, lo, feeBps, false).amountOut };
  };

  func depthLevel(pool : DexTypes.Pool, bps : Nat) : Types.DepthLevel {
    { token0In = depthSide(pool, true, bps); token1In = depthSide(pool, false, bps) };
  };

  func depthOf(pool : DexTypes.Pool, open : Bool) : Types.Depth {
    if (not open) {
      let z : Types.DepthLevel = { token0In = { amountIn = 0; amountOut = 0 }; token1In = { amountIn = 0; amountOut = 0 } };
      return { onePercent = z; twoPercent = z; fivePercent = z };
    };
    { onePercent = depthLevel(pool, 100); twoPercent = depthLevel(pool, 200); fivePercent = depthLevel(pool, 500) };
  };

  type WindowSums = { count : Nat; volume0 : Nat; volume1 : Nat; fee0 : Nat; fee1 : Nat };

  // Sums the hourly buckets of the current hour and the previous hours - 1.
  func sumWindow(activity : ?Types.PoolActivity, nowHour : Nat, hours : Nat) : WindowSums {
    var count = 0;
    var v0 = 0;
    var v1 = 0;
    var f0 = 0;
    var f1 = 0;
    switch (activity) {
      case (?a) {
        let minHour = if (nowHour + 1 > hours) nowHour + 1 - hours else 0;
        for (b in a.buckets.values()) {
          if (b.hour >= minHour and b.hour <= nowHour) {
            count += b.swapCount;
            v0 += b.volume0;
            v1 += b.volume1;
            f0 += b.fee0;
            f1 += b.fee1;
          };
        };
      };
      case null {};
    };
    { count; volume0 = v0; volume1 = v1; fee0 = f0; fee1 = f1 };
  };

  func feeTotals(c0 : Nat, c1 : Nat) : Types.FeeTotals {
    let p0 = c0 * DexLib.PROTOCOL_FEE_SHARE_PERCENT / 100;
    let p1 = c1 * DexLib.PROTOCOL_FEE_SHARE_PERCENT / 100;
    { collected0 = c0; collected1 = c1; lp0 = c0 - p0; lp1 = c1 - p1; permanent0 = p0; permanent1 = p1 };
  };

  // Indicators of one pool, or an error text when its shares do not add up.
  func poolIndicators(ctx : IndicatorsContext, pool : DexTypes.Pool, now : Int, rateOf : DexLib.UsdRateOf) : { #ok : Types.PoolIndicators; #err : Text } {
    let total = pool.totalShares;
    let open = DexLib.effectiveStatus(pool, rateOf) == #active;

    func amount0(shares : Nat) : Nat = if (total == 0) 0 else shares * pool.reserve0 / total;
    func amount1(shares : Nat) : Nat = if (total == 0) 0 else shares * pool.reserve1 / total;
    func bucket(shares : Nat) : Types.UnlockBucket = { shares; amount0 = amount0(shares); amount1 = amount1(shares) };

    var freeShares = 0;
    var thisWeek = 0;
    var days30 = 0;
    var days90 = 0;
    var year1 = 0;
    var overYear1 = 0;
    var positionCount = 0;
    var largest = 0;
    // The five largest position share counts, descending.
    var top : [Nat] = [];
    for (p in ctx.dex.positions.values()) {
      if (p.poolId == pool.id) {
        positionCount += 1;
        if (p.shares > largest) largest := p.shares;
        top := top.concat([p.shares]).sort<Nat>(func(a : Nat, b : Nat) = Nat.compare(b, a));
        if (top.size() > 5) top := top.sliceToArray(0, 5);
        if (p.unlockAt <= now) {
          freeShares += p.shares;
        } else {
          let remaining : Nat = Int.abs(p.unlockAt - now);
          if (remaining <= 7 * DAY_NS) thisWeek += p.shares else if (remaining <= 30 * DAY_NS) days30 += p.shares else if (remaining <= 90 * DAY_NS) days90 += p.shares else if (remaining <= 365 * DAY_NS) year1 += p.shares else overYear1 += p.shares;
        };
      };
    };
    let frozen = thisWeek + days30 + days90 + year1 + overYear1;
    // Permanent shares (locked at creation, recycled fees, protocol injections)
    // are the shares no position owns: total minus all position shares. The
    // locked and protocol counters overlap, so they are not summed.
    let positionShares = frozen + freeShares;
    if (positionShares > total) {
      return #err("Pool " # pool.id.toText() # ": position shares " # positionShares.toText() # " exceed total shares " # total.toText());
    };
    let permanentShares : Nat = total - positionShares;
    let firmShares = permanentShares + frozen;
    let firmBps = shareBps(firmShares, total);
    let topFive = top.foldLeft(0, func(acc, x) = acc + x);

    // Activity from the hourly buckets.
    let nowHour : Nat = if (now < 0) 0 else Int.abs(now) / DexLib.HOUR_NS;
    let activity = ctx.store.activity.get(pool.id);
    let w24 = sumWindow(activity, nowHour, 24);
    let w7 = sumWindow(activity, nowHour, DexLib.ACTIVITY_HOURS);
    let value = DexLib.usdGauge(pool, rateOf).currentUsdE8;
    let fees7 = usdOfPair(pool, w7.fee0, w7.fee1, rateOf);
    let feeToLiquidity : ?Nat = switch (fees7, value) {
      case (?f, ?l) { if (l == 0) null else ?(f * BPS / l) };
      case _ null;
    };
    let (cum0, cum1) = switch (activity) {
      case (?a) (a.totalFee0, a.totalFee1);
      case null (0, 0);
    };

    #ok({
      poolId = pool.id;
      token0Symbol = pool.token0.symbol;
      token1Symbol = pool.token1.symbol;
      isOpen = open;
      reserve0 = pool.reserve0;
      reserve1 = pool.reserve1;
      valueUsdE8 = value;
      depth = depthOf(pool, open);
      liquidity = {
        totalShares = total;
        firmShares;
        freeShares;
        firmAmount0 = amount0(firmShares);
        firmAmount1 = amount1(firmShares);
        freeAmount0 = amount0(freeShares);
        freeAmount1 = amount1(freeShares);
        firmBps;
        freeBps = if (total == 0) 0 else BPS - firmBps;
      };
      unlock = {
        thisWeek = bucket(thisWeek);
        days30 = bucket(days30);
        days90 = bucket(days90);
        year1 = bucket(year1);
        overYear1 = bucket(overYear1);
        permanent = bucket(permanentShares);
      };
      concentration = {
        positionCount;
        largestPositionBps = shareBps(largest, total);
        topFiveBps = shareBps(topFive, total);
        permanentProtocolBps = shareBps(permanentShares, total);
      };
      activity = {
        last24h = {
          swapCount = w24.count;
          volume0 = w24.volume0;
          volume1 = w24.volume1;
          volumeUsdE8 = usdOfPair(pool, w24.volume0, w24.volume1, rateOf);
        };
        last7d = {
          swapCount = w7.count;
          volume0 = w7.volume0;
          volume1 = w7.volume1;
          volumeUsdE8 = usdOfPair(pool, w7.volume0, w7.volume1, rateOf);
        };
      };
      fees = {
        last7d = feeTotals(w7.fee0, w7.fee1);
        cumulative = feeTotals(cum0, cum1);
        cumulativeSince = ctx.store.recordingSince;
        observed = {
          periodDays = PERIOD_DAYS;
          feesUsdE8 = fees7;
          liquidityUsdE8 = value;
          feeToLiquidityBps = feeToLiquidity;
        };
      };
    });
  };

  // Computes the whole snapshot from the stored state (no ledger call).
  public func compute(ctx : IndicatorsContext, now : Int) : { #ok : Types.DexIndicatorsSnapshot; #err : Text } {
    let rateOf = ctx.rateOf(now);
    let (proofs, checkedAt) : ([Types.TokenProof], ?Int) = switch (ctx.reserve.lastCheck) {
      case (?c) {
        let rows = c.results.map(
          func(r) = { token = r.token; internalTotal = r.internalTotal; ledgerTotal = r.ledgerTotal; difference = r.difference; status = r.status }
        );
        (rows, if (rows.size() == 0) null else c.lastSuccessAt);
      };
      case null ([], null);
    };
    var pools : [Types.PoolIndicators] = [];
    for (pool in ctx.dex.pools.values()) {
      if (pool.status != #removed) {
        switch (poolIndicators(ctx, pool, now, rateOf)) {
          case (#ok(p)) pools := pools.concat([p]);
          case (#err(message)) return #err(message);
        };
      };
    };
    #ok({ computedAt = now; reserveCheckedAt = checkedAt; proofs; pools });
  };

  // Stores a successful computation.
  public func storeSuccess(ctx : IndicatorsContext, snapshot : Types.DexIndicatorsSnapshot, now : Int) {
    ctx.store.snapshot := ?snapshot;
    ctx.store.lastComputedAt := ?now;
    ctx.store.lastSuccessAt := ?now;
    ctx.store.lastError := null;
  };

  // Stores a failure: the previous snapshot stays with its original time.
  public func storeFailure(ctx : IndicatorsContext, message : Text, now : Int) {
    ctx.store.lastComputedAt := ?now;
    ctx.store.lastError := ?{ message; at = now };
  };

  // One computation; a failure is stored and never thrown to the caller.
  public func run(ctx : IndicatorsContext) : async () {
    let now = Time.now();
    try {
      switch (compute(ctx, now)) {
        case (#ok(snapshot)) storeSuccess(ctx, snapshot, now);
        case (#err(message)) throw Error.reject(message);
      };
    } catch (e) {
      storeFailure(ctx, e.message(), now);
    };
  };

  // Runs on every install and upgrade: a first computation shortly after start
  // when no snapshot exists, then one per hour.
  public func startTimer<system>(ctx : IndicatorsContext) {
    if (ctx.store.snapshot == null) {
      ignore Timer.setTimer<system>(
        #seconds FIRST_RUN_DELAY_SECONDS,
        func() : async () {
          try { await run(ctx) } catch (_) {};
        },
      );
    };
    ignore Timer.recurringTimer<system>(
      #seconds COMPUTE_INTERVAL_SECONDS,
      func() : async () {
        try { await run(ctx) } catch (_) {};
      },
    );
  };

  // Flat OQL rows of the stored snapshot (empty before the first computation).
  public func rows(store : Types.IndicatorsStore) : [Types.IndicatorRow] {
    let snapshot = switch (store.snapshot) {
      case (?s) s;
      case null return [];
    };
    snapshot.pools.map(
      func(p) = {
        poolId = p.poolId;
        computedAt = snapshot.computedAt;
        token0Symbol = p.token0Symbol;
        token1Symbol = p.token1Symbol;
        isOpen = p.isOpen;
        reserve0 = p.reserve0;
        reserve1 = p.reserve1;
        valueUsdE8 = p.valueUsdE8;
        depth1PctToken0In = p.depth.onePercent.token0In.amountIn;
        depth1PctToken1In = p.depth.onePercent.token1In.amountIn;
        depth2PctToken0In = p.depth.twoPercent.token0In.amountIn;
        depth2PctToken1In = p.depth.twoPercent.token1In.amountIn;
        depth5PctToken0In = p.depth.fivePercent.token0In.amountIn;
        depth5PctToken1In = p.depth.fivePercent.token1In.amountIn;
        totalShares = p.liquidity.totalShares;
        firmShares = p.liquidity.firmShares;
        freeShares = p.liquidity.freeShares;
        firmBps = p.liquidity.firmBps;
        freeBps = p.liquidity.freeBps;
        unlockThisWeekShares = p.unlock.thisWeek.shares;
        unlock30dShares = p.unlock.days30.shares;
        unlock90dShares = p.unlock.days90.shares;
        unlock1yShares = p.unlock.year1.shares;
        unlockOver1yShares = p.unlock.overYear1.shares;
        permanentShares = p.unlock.permanent.shares;
        positionCount = p.concentration.positionCount;
        largestPositionBps = p.concentration.largestPositionBps;
        topFiveBps = p.concentration.topFiveBps;
        permanentProtocolBps = p.concentration.permanentProtocolBps;
        swaps24h = p.activity.last24h.swapCount;
        volume0In24h = p.activity.last24h.volume0;
        volume1In24h = p.activity.last24h.volume1;
        volumeUsdE8In24h = p.activity.last24h.volumeUsdE8;
        swaps7d = p.activity.last7d.swapCount;
        volume0In7d = p.activity.last7d.volume0;
        volume1In7d = p.activity.last7d.volume1;
        volumeUsdE8In7d = p.activity.last7d.volumeUsdE8;
        fees7dCollected0 = p.fees.last7d.collected0;
        fees7dCollected1 = p.fees.last7d.collected1;
        feesCumulativeCollected0 = p.fees.cumulative.collected0;
        feesCumulativeCollected1 = p.fees.cumulative.collected1;
        observedFeeToLiquidityBps = p.fees.observed.feeToLiquidityBps;
      }
    );
  };
};
