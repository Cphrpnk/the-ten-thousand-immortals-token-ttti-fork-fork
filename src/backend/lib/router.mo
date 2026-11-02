import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/router";
import PageTypes "../types/page";
import InflightTypes "../types/inflight";
import PfTypes "../types/protocol-fees";
import RetryTypes "../types/retry";
import DexTypes "../types/dex";
import DexLib "dex";
import RetryLib "retry";
import IcpSwapLib "icpswap";
import ProtocolFeesLib "protocol-fees";
import InflightLib "inflight";

// DEX lot 5: ICPSwap router logic (quote comparison, single-route execution,
// 0.1 % protocol fee split, IR transfers and their review). PTM-4: the 30 %
// protocol share of the 0.1 % is split in two thirds for the creator and one
// third for permanent liquidity (ProtocolFeesLib.splitProtocolShare), and
// runPermanentLiquidity rebalances that third on the best route and injects it
// into the least liquid TTTI-T pool as contract-locked shares. The protocol
// never places a price-linked order and never creates TTTI-T: a routed swap
// only runs when its owner calls routedSwap, from that owner's balances.
module {
  public type RouterContext = {
    store : Types.RouterStore;
    dex : RetryLib.DexContext;
    locks : Set.Set<Text>; // transient: "IR/<routed swap id>" and "PTM-PERMANENT"
    protocol : ProtocolFeesLib.ProtocolFeeContext; // creator holdings and permanent liquidity
    ownerIndex : Types.OwnerSwapIndex; // PTM-9e: owner -> swap ids in creation order (stored)
    inflight : InflightTypes.InflightStore; // PTM-9e: unfinished transfers, deposits, withdrawals, swaps (stored)
  };

  // PTM-9e: the part of the context that paying a pool's set-aside needs
  // (RouterContext is a subtype). Lets tests run it without the full context.
  public type PayContext = {
    store : Types.RouterStore;
    dex : { dex : DexTypes.DexStore; balances : DexTypes.DexBalances; pause : { var paused : Bool } };
  };

  // PTM-9e: the part of the context that the paged lists need.
  public type ListContext = {
    store : Types.RouterStore;
    ownerIndex : Types.OwnerSwapIndex;
  };

  public let PROTOCOL_FEE_BPS : Nat = 10;
  public let PROTOCOL_LP_PERCENT : Nat = 70;
  public let NATIVE_FEE_BPS : Nat = 30;
  public let ICPSWAP_FEE_BPS : Nat = 30;
  public let MAX_DEADLINE_NS : Int = 300_000_000_000;

  let BPS : Nat = 10_000;

  public func lockKey(id : Nat) : Text {
    "IR/" # id.toText();
  };

  // --- Helpers ---------------------------------------------------------------

  func sat(a : Nat, b : Nat) : Nat = if (a > b) a - b else 0;

  func ceilDiv(a : Nat, b : Nat) : Nat = (a + b - 1) / b;

  // 0.1 % of the input (rounded up, never above the input).
  func protocolFeeOf(amountIn : Nat) : Nat = Nat.min(amountIn, ceilDiv(amountIn * PROTOCOL_FEE_BPS, BPS));

  func lpShareOf(fee : Nat) : Nat = fee * PROTOCOL_LP_PERCENT / 100;

  type NativeLookup = { #none; #removed; #pool : DexTypes.Pool };

  // The registry pool of the pair (any token order); #removed when the only
  // pool of the pair was removed by the admin.
  func findNative(ctx : RouterContext, a : DexTypes.DexToken, b : DexTypes.DexToken) : NativeLookup {
    var removed = false;
    for (pool in ctx.dex.dex.pools.values()) {
      switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
        case (?t0, ?t1) {
          if ((t0 == a and t1 == b) or (t0 == b and t1 == a)) {
            if (pool.status == #removed) removed := true else return #pool(pool);
          };
        };
        case _ {};
      };
    };
    if (removed) #removed else #none;
  };

  func poolTokens(pool : DexTypes.Pool) : ?(DexTypes.DexToken, DexTypes.DexToken) {
    switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
      case (?t0, ?t1) ?(t0, t1);
      case _ null;
    };
  };

  type NativeOption = { amountOut : Nat; fees : Types.RouteFees };

  // Native quote; null when the pool is empty, filling, too shallow or closed.
  func nativeOption(ctx : RouterContext, usdRateOf : DexLib.UsdRateOf, pool : DexTypes.Pool, tokenIn : DexTypes.DexToken, amountIn : Nat, slippageBps : Nat, now : Int) : ?NativeOption {
    switch (DexLib.quoteSwap(ctx.dex.dex, pool.id, tokenIn, amountIn, slippageBps, usdRateOf, now)) {
      case (#ok(q)) ?{ amountOut = q.amountOut; fees = #native({ feeBps = q.feeBps; fee = q.fee }) };
      case (#err(_)) null;
    };
  };

  // ICPSwap route plan, net of the 0.1 %, both ledger fees and ICPSwap's fee.
  type IcpswapPlan = {
    poolCanisterId : Principal;
    zeroForOne : Bool;
    protocolFee : Nat;
    sendAmount : Nat; // IR transfer amount (the ledger also takes feeIn)
    feeIn : Nat;
    feeOut : Nat;
    amountOut : Nat; // expected net credit
    fees : Types.RouteFees;
  };

  func icpswapFees(protocolFee : Nat, icpswapFeeBps : Nat, icpswapFee : Nat) : Types.RouteFees {
    let lp = lpShareOf(protocolFee);
    #icpswap({
      icpswapFeeBps;
      icpswapFee;
      protocolFeeBps = PROTOCOL_FEE_BPS;
      protocolFee;
      protocolLpShare = lp;
      protocolPermanentShare = protocolFee - lp;
    });
  };

  // Reads the pool's token order and quotes it; null when the pool does not
  // hold exactly this pair, the call fails or nothing is left after fees.
  func planOn(ctx : RouterContext, poolCanisterId : Principal, tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken, amountIn : Nat) : async ?IcpswapPlan {
    let ledgerIn = DexLib.tokenLedgerId(tokenIn, ctx.dex.canister).toText();
    let ledgerOut = DexLib.tokenLedgerId(tokenOut, ctx.dex.canister).toText();
    let meta = try {
      switch (await IcpSwapLib.pool(poolCanisterId).metadata()) {
        case (#ok(m)) m;
        case (#err(_)) return null;
      };
    } catch (_) {
      return null;
    };
    let zeroForOne = if (meta.token0.address == ledgerIn and meta.token1.address == ledgerOut) true else if (meta.token1.address == ledgerIn and meta.token0.address == ledgerOut) false else return null;
    let protocolFee = protocolFeeOf(amountIn);
    let toSend = amountIn - protocolFee;
    let feeIn = RetryLib.dexFee(ctx.dex, tokenIn);
    let feeOut = RetryLib.dexFee(ctx.dex, tokenOut);
    if (toSend <= 2 * feeIn) return null;
    let sendAmount = toSend - feeIn;
    let credited = sendAmount - feeIn; // ICPSwap deposit takes one ledger fee
    let out = switch (await IcpSwapLib.quote(poolCanisterId, zeroForOne, credited)) {
      case (#ok(v)) v;
      case (#err(_)) return null;
    };
    if (out <= feeOut) return null;
    let icpswapFeeBps = meta.fee / 100; // 3000 = 0.3 % = 30 bps
    ?{
      poolCanisterId;
      zeroForOne;
      protocolFee;
      sendAmount;
      feeIn;
      feeOut;
      amountOut = out - feeOut;
      fees = icpswapFees(protocolFee, icpswapFeeBps, ceilDiv(credited * icpswapFeeBps, BPS));
    };
  };

  func icpswapPlan(ctx : RouterContext, tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken, amountIn : Nat) : async ?IcpswapPlan {
    let found = await IcpSwapLib.findPool(DexLib.tokenLedgerId(tokenIn, ctx.dex.canister), DexLib.tokenLedgerId(tokenOut, ctx.dex.canister));
    switch (found) {
      case (?id) await planOn(ctx, id, tokenIn, tokenOut, amountIn);
      case null null;
    };
  };

  // --- 0.1 % protocol fee: 70 % LPs, 30 % protocol share (2/3 creator, 1/3 permanent) ---

  func totalsOf(ctx : { store : Types.RouterStore }, poolId : Nat) : Types.RouterFeeTotals {
    switch (ctx.store.feeTotals.get(poolId)) {
      case (?t) t;
      case null {
        { poolId; collected0 = 0; collected1 = 0; lpPaid0 = 0; lpPaid1 = 0; lpSetAside0 = 0; lpSetAside1 = 0; permanent0 = 0; permanent1 = 0 };
      };
    };
  };

  func setAsideOf(ctx : { store : Types.RouterStore }, poolId : Nat) : Types.RouterSetAside {
    ctx.store.setAside.get(poolId) ?? { amount0 = 0; amount1 = 0 };
  };

  // Protocol share of the 0.1 % (30 % plus rounding dust): two thirds are
  // credited to the creator, one third is set aside for permanent liquidity.
  // The tokens stay in the DEX custody; no pool counter is touched.
  func toPermanent(ctx : RouterContext, poolId : Nat, side0 : Bool, amount : Nat) {
    if (amount == 0) return;
    switch (ctx.dex.dex.pools.get(poolId)) {
      case (?pool) {
        switch (poolTokens(pool)) {
          case (?(t0, t1)) ProtocolFeesLib.splitProtocolShare(ctx.protocol, poolId, if (side0) t0 else t1, amount, #routerShare, Time.now());
          case null {};
        };
      };
      case null {};
    };
  };

  // Credits `amount` of `token` to the pool's LPs; returns the amount paid
  // (0 when the pool has no LP). PTM-9d: half is added to the pool's pending
  // pot (shared once a day among the locked positions, lib/dex-pot.mo); the
  // other half is credited pro rata on all shares, free or locked.
  func payLps(ctx : PayContext, poolId : Nat, token : DexTypes.DexToken, amount : Nat) : Nat {
    // PTM-9d: only the positions of this pool, through the per-pool index.
    let poolPositions = DexLib.positionsInPool(ctx.dex.dex, poolId);
    var total = 0;
    for (pos in poolPositions.values()) {
      total += pos.shares;
    };
    if (total == 0 or amount == 0) return 0;
    var lockedPaid = 0;
    var proRata = amount;
    switch (ctx.dex.dex.pools.get(poolId)) {
      case (?pool) {
        switch (poolTokens(pool)) {
          case (?(t0, _)) {
            let s = DexLib.shareLpFee(ctx.dex.dex, ctx.dex.balances, poolId, t0 == token, amount, Time.now());
            lockedPaid := s.credited;
            proRata := s.reserve;
          };
          case null {};
        };
      };
      case null {};
    };
    var paid = lockedPaid;
    for (pos in poolPositions.values()) {
      if (pos.shares > 0) {
        let part = proRata * pos.shares / total;
        if (part > 0) {
          DexLib.credit(ctx.dex.balances, pos.owner, token, part);
          paid += part;
        };
      };
    };
    paid;
  };

  // Without a USD rate function (review paths) every pool depth is unknown
  // and counts as 0 in the liquidity ranking (no fixed TTTI-T price).
  func noRate(_ : DexTypes.PoolToken) : ?Nat = null;

  // Splits a collected 0.1 % (in tokenIn units) for the native pool: 70 % to
  // its LPs, 30 % protocol share (permanent totals count the whole share). Without LP in the native pool
  // the 70 % goes to the LPs of the least liquid TTTI-T pool (mint fee rule);
  // without LP there either it is set aside for the native pool.
  func applyProtocolFee(ctx : RouterContext, rateOf : DexLib.UsdRateOf, poolId : Nat, tokenIn : DexTypes.DexToken, fee : Nat) {
    if (fee == 0) return;
    let pool = switch (ctx.dex.dex.pools.get(poolId)) {
      case (?p) p;
      case null return;
    };
    let (side0, other) = switch (poolTokens(pool)) {
      case (?(t0, t1)) (t0 == tokenIn, if (t0 == tokenIn) t1 else t0);
      case null return;
    };
    let lp = lpShareOf(fee);
    let hasLp = DexLib.poolHasLiquidity(ctx.dex.dex, poolId);
    let t = totalsOf(ctx, poolId);
    if (hasLp) {
      let paid = payLps(ctx, poolId, tokenIn, lp);
      let permanent = fee - paid; // 30 % plus rounding dust
      toPermanent(ctx, poolId, side0, permanent);
      ctx.store.feeTotals.add(
        poolId,
        if (side0) { { t with collected0 = t.collected0 + fee; lpPaid0 = t.lpPaid0 + paid; permanent0 = t.permanent0 + permanent } } else {
          { t with collected1 = t.collected1 + fee; lpPaid1 = t.lpPaid1 + paid; permanent1 = t.permanent1 + permanent };
        },
      );
      return;
    };
    // Native pool without LP: least liquid TTTI-T pool of the paid token
    // (the other token of the pair when the fee itself is in TTTI-T).
    let selection = switch (RetryLib.dexPayToken(tokenIn)) {
      case (?p) ?p;
      case null RetryLib.dexPayToken(other);
    };
    let target : ?Nat = switch (selection) {
      case (?p) {
        switch (ProtocolFeesLib.leastLiquidTttiPool(ctx.dex.dex, rateOf, p)) {
          case (?id) {
            if (id != poolId and DexLib.poolHasLiquidity(ctx.dex.dex, id)) ?id else null;
          };
          case null null;
        };
      };
      case null null;
    };
    switch (target) {
      case (?targetId) {
        let paid = payLps(ctx, targetId, tokenIn, lp);
        let permanent = fee - paid; // 30 % plus rounding dust
        toPermanent(ctx, poolId, side0, permanent);
        ctx.store.feeTotals.add(
          poolId,
          if (side0) { { t with collected0 = t.collected0 + fee; lpPaid0 = t.lpPaid0 + paid; permanent0 = t.permanent0 + permanent } } else {
            { t with collected1 = t.collected1 + fee; lpPaid1 = t.lpPaid1 + paid; permanent1 = t.permanent1 + permanent };
          },
        );
        let r : Types.RouterRedirect = ctx.store.redirected.get(poolId) ?? { poolId; redirected0 = 0; redirected1 = 0; lastTargetPoolId = null; lastAt = null };
        ctx.store.redirected.add(
          poolId,
          if (side0) { { r with redirected0 = r.redirected0 + paid; lastTargetPoolId = ?targetId; lastAt = ?Time.now() } } else {
            { r with redirected1 = r.redirected1 + paid; lastTargetPoolId = ?targetId; lastAt = ?Time.now() };
          },
        );
      };
      case null {
        let permanent = fee - lp;
        toPermanent(ctx, poolId, side0, permanent);
        let sa = setAsideOf(ctx, poolId);
        ctx.store.setAside.add(poolId, if (side0) { { sa with amount0 = sa.amount0 + lp } } else { { sa with amount1 = sa.amount1 + lp } });
        ctx.store.feeTotals.add(
          poolId,
          if (side0) { { t with collected0 = t.collected0 + fee; lpSetAside0 = t.lpSetAside0 + lp; permanent0 = t.permanent0 + permanent } } else {
            { t with collected1 = t.collected1 + fee; lpSetAside1 = t.lpSetAside1 + lp; permanent1 = t.permanent1 + permanent };
          },
        );
      };
    };
  };

  // Set-aside LP shares go to the LPs of pools that now have LPs (rounding
  // dust goes to the protocol share). PTM-9e: pays the set-aside LP share of
  // ONE native pool, reading only the positions of that pool through
  // DexStore.poolPositions (payLps), and removes the pool's set-aside entry
  // once both amounts are zero. No effect while the DEX is paused or the pool
  // has no set-aside.
  public func paySetAsideOf(ctx : RouterContext, poolId : DexTypes.PoolId) {
    paySetAsideWith(ctx, poolId, func(side0 : Bool, amount : Nat) { toPermanent(ctx, poolId, side0, amount) });
  };

  // Same as paySetAsideOf with the protocol-share step (rounding dust) given as
  // a function, so it needs only PayContext.
  public func paySetAsideWith(ctx : PayContext, poolId : DexTypes.PoolId, toProtocol : (Bool, Nat) -> ()) {
    if (ctx.dex.pause.paused) return;
    let sa = switch (ctx.store.setAside.get(poolId)) {
      case (?x) x;
      case null return;
    };
    if (sa.amount0 + sa.amount1 == 0) {
      ctx.store.setAside.remove(poolId);
      return;
    };
    let pool = switch (ctx.dex.dex.pools.get(poolId)) {
      case (?p) p;
      case null return;
    };
    let (t0, t1) = switch (poolTokens(pool)) {
      case (?pair) pair;
      case null return;
    };
    let paid0 = payLps(ctx, poolId, t0, sa.amount0);
    let paid1 = payLps(ctx, poolId, t1, sa.amount1);
    if (paid0 == 0 and paid1 == 0) return;
    let dust0 = if (paid0 > 0) sa.amount0 - paid0 else 0;
    let dust1 = if (paid1 > 0) sa.amount1 - paid1 else 0;
    toProtocol(true, dust0);
    toProtocol(false, dust1);
    let left0 = if (paid0 > 0) 0 else sa.amount0;
    let left1 = if (paid1 > 0) 0 else sa.amount1;
    if (left0 + left1 == 0) {
      ctx.store.setAside.remove(poolId);
    } else {
      ctx.store.setAside.add(poolId, { amount0 = left0; amount1 = left1 });
    };
    let t = totalsOf(ctx, poolId);
    ctx.store.feeTotals.add(poolId, { t with lpPaid0 = t.lpPaid0 + paid0; lpPaid1 = t.lpPaid1 + paid1; permanent0 = t.permanent0 + dust0; permanent1 = t.permanent1 + dust1 });
  };

  // Pays every set-aside LP share (timer): one paySetAsideOf per pool that has
  // a set-aside entry (that pool's positions only); zero entries are removed.
  public func paySetAside(ctx : RouterContext) {
    if (ctx.dex.pause.paused) return;
    for (poolId in ctx.store.setAside.keys().toArray().values()) {
      paySetAsideOf(ctx, poolId);
    };
  };

  // --- Quote -----------------------------------------------------------------

  func checkArgs(tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken, amountIn : Nat) : ?Types.RouteError {
    if (amountIn == 0) return ?#zeroAmount;
    if (tokenIn == tokenOut) return ?#sameToken;
    null;
  };

  func pairPool(ctx : RouterContext, tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken) : { #ok : DexTypes.Pool; #err : Types.RouteError } {
    switch (findNative(ctx, tokenIn, tokenOut)) {
      case (#none) #err(#pairNotFound);
      case (#removed) #err(#pairRemoved);
      case (#pool(p)) #ok(p);
    };
  };

  public func routedQuote(ctx : RouterContext, usdRateOf : DexLib.UsdRateOf, args : Types.RoutedQuoteArgs) : async { #ok : Types.RoutedQuote; #err : Types.RouteError } {
    switch (checkArgs(args.tokenIn, args.tokenOut, args.amountIn)) {
      case (?e) return #err(e);
      case null {};
    };
    if (args.slippageBps > BPS) return #err(#invalidSlippage({ maximumBps = BPS }));
    let pool = switch (pairPool(ctx, args.tokenIn, args.tokenOut)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    let native = nativeOption(ctx, usdRateOf, pool, args.tokenIn, args.amountIn, args.slippageBps, Time.now());
    let icp = await icpswapPlan(ctx, args.tokenIn, args.tokenOut, args.amountIn);
    let nativeRoute : Types.Route = #native({ poolId = pool.id });
    let (route, reason, amountOut, fees, alternative) : (Types.Route, Types.RouteReason, Nat, Types.RouteFees, ?Types.RouteAlternative) = switch (native, icp) {
      case (?n, ?i) {
        let icpRoute : Types.Route = #icpswap({ poolCanisterId = i.poolCanisterId });
        if (i.amountOut > n.amountOut) {
          (icpRoute, #bestAmount, i.amountOut, i.fees, ?{ route = nativeRoute; amountOut = n.amountOut; fees = n.fees });
        } else {
          (nativeRoute, #bestAmount, n.amountOut, n.fees, ?{ route = icpRoute; amountOut = i.amountOut; fees = i.fees });
        };
      };
      case (?n, null) (nativeRoute, #icpswapUnavailable, n.amountOut, n.fees, null);
      case (null, ?i) (#icpswap({ poolCanisterId = i.poolCanisterId }), #nativeUnavailable, i.amountOut, i.fees, null);
      case (null, null) return #err(#noRouteAvailable);
    };
    let now = Time.now();
    #ok({
      tokenIn = args.tokenIn;
      tokenOut = args.tokenOut;
      amountIn = args.amountIn;
      route;
      reason;
      nativePoolId = ?pool.id;
      amountOut;
      fees;
      slippageBps = args.slippageBps;
      minimumReceived = amountOut * (BPS - args.slippageBps) / BPS;
      alternative;
      maxDeadline = now + MAX_DEADLINE_NS;
      quotedAt = now;
    });
  };

  // --- Swap ------------------------------------------------------------------

  func save(ctx : RouterContext, s : Types.RoutedSwap) : Types.RoutedSwap {
    let updated = { s with updatedAt = Time.now() };
    // PTM-9e: a new swap joins its owner's index once, when it is created.
    if (not ctx.store.swaps.containsKey(s.id)) {
      let ids = switch (ctx.ownerIndex.get(s.owner)) {
        case (?l) l;
        case null {
          let l = List.empty<Nat>();
          ctx.ownerIndex.add(s.owner, l);
          l;
        };
      };
      ids.add(s.id);
    };
    ctx.store.swaps.add(s.id, updated);
    // PTM-9e: the in-flight index follows the status on every write.
    if (InflightLib.swapUnfinished(updated.status)) {
      InflightLib.enter(ctx.inflight, #swap, updated.id, [updated.tokenIn, updated.tokenOut], ?updated.owner);
    } else {
      InflightLib.leave(ctx.inflight, #swap, updated.id);
    };
    updated;
  };

  func nativeError(e : DexTypes.SwapError, token : DexTypes.DexToken, required : Nat) : Types.RouteError {
    switch (e) {
      case (#anonymous) #anonymous;
      case (#poolNotFound) #pairNotFound;
      case (#poolRemoved) #pairRemoved;
      case (#zeroAmount) #zeroAmount;
      case (#invalidSlippage(x)) #invalidSlippage(x);
      case (#insufficientBalance({ available })) #insufficientBalance({ token; available; required });
      case (#slippageExceeded(x)) #slippageExceeded(x);
      case (#deadlineExceeded(x)) #deadlineExceeded(x);
      case (#deadlineTooFar(x)) #deadlineTooFar(x);
      case (#operationInProgress) #operationInProgress;
      case _ #noRouteAvailable;
    };
  };

  func lockAll(set : Set.Set<Text>, keys : [Text]) : Bool {
    for (i in keys.keys()) {
      if (not RetryLib.tryLock(set, keys[i])) {
        var j = 0;
        while (j < i) {
          RetryLib.unlock(set, keys[j]);
          j += 1;
        };
        return false;
      };
    };
    true;
  };

  func unlockAll(set : Set.Set<Text>, keys : [Text]) {
    for (k in keys.values()) RetryLib.unlock(set, k);
  };

  public func routedSwap(ctx : RouterContext, usdRateOf : DexLib.UsdRateOf, caller : Principal, args : Types.RoutedSwapArgs) : async { #ok : Types.RoutedSwapResult; #err : Types.RouteError } {
    if (caller.isAnonymous()) return #err(#anonymous);
    switch (checkArgs(args.tokenIn, args.tokenOut, args.amountIn)) {
      case (?e) return #err(e);
      case null {};
    };
    let now = Time.now();
    if (now > args.deadline) return #err(#deadlineExceeded({ deadline = args.deadline; now }));
    let maximum = now + MAX_DEADLINE_NS;
    if (args.deadline > maximum) return #err(#deadlineTooFar({ maximum }));
    let pool = switch (pairPool(ctx, args.tokenIn, args.tokenOut)) {
      case (#ok(p)) p;
      case (#err(e)) return #err(e);
    };
    let have = DexLib.available(ctx.dex.balances, caller, args.tokenIn);
    if (have < args.amountIn) return #err(#insufficientBalance({ token = args.tokenIn; available = have; required = args.amountIn }));
    paySetAsideOf(ctx, pool.id);
    // PTM-9f: new activity of the caller: its deposit accounts are read again.
    RetryLib.reincludeOnActivity(ctx.dex.batch, caller, [args.tokenIn, args.tokenOut]);
    let tokenKeys = [RetryLib.dexLockKey(caller, args.tokenIn), RetryLib.dexLockKey(caller, args.tokenOut)];
    switch (args.route) {
      case (#native({ poolId })) {
        if (poolId != pool.id) return #err(#routeMismatch({ expected = #native({ poolId = pool.id }) }));
        if (not lockAll(ctx.dex.locks, tokenKeys)) return #err(#operationInProgress);
        try {
          switch (DexLib.swap(ctx.dex.dex, ctx.dex.balances, ctx.dex.canister, caller, pool.id, args.tokenIn, args.amountIn, args.minAmountOut, args.deadline, false, usdRateOf, now, ctx.dex.indicators)) {
            case (#err(e)) #err(nativeError(e, args.tokenIn, args.amountIn));
            case (#ok(r)) {
              let id = ctx.store.nextSwapId;
              ctx.store.nextSwapId += 1;
              let fees : Types.RouteFees = #native({ feeBps = if (r.fee == 0) 0 else NATIVE_FEE_BPS; fee = r.fee });
              ignore save(
                ctx,
                {
                  id;
                  owner = caller;
                  createdAt = now;
                  updatedAt = now;
                  route = args.route;
                  tokenIn = args.tokenIn;
                  tokenOut = args.tokenOut;
                  amountIn = args.amountIn;
                  amountOut = r.amountOut;
                  minAmountOut = args.minAmountOut;
                  deadline = args.deadline;
                  fees;
                  nativePoolId = ?pool.id;
                  zeroForOne = false;
                  stage = #done;
                  status = #completed;
                  move = null;
                  lastError = null;
                },
              );
              #ok({ id; route = args.route; tokenIn = args.tokenIn; tokenOut = args.tokenOut; amountIn = args.amountIn; amountOut = r.amountOut; fees });
            };
          };
        } finally {
          unlockAll(ctx.dex.locks, tokenKeys);
        };
      };
      case (#icpswap({ poolCanisterId })) {
        let id = ctx.store.nextSwapId;
        let irKey = lockKey(id);
        if (not lockAll(ctx.dex.locks, tokenKeys)) return #err(#operationInProgress);
        if (not RetryLib.tryLock(ctx.locks, irKey)) {
          unlockAll(ctx.dex.locks, tokenKeys);
          return #err(#operationInProgress);
        };
        try {
          await runIcpswap(ctx, usdRateOf, caller, args, pool, poolCanisterId, id, now);
        } finally {
          RetryLib.unlock(ctx.locks, irKey);
          unlockAll(ctx.dex.locks, tokenKeys);
        };
      };
    };
  };

  // ICPSwap leg: the record and the debit are written before the first await.
  func runIcpswap(ctx : RouterContext, usdRateOf : DexLib.UsdRateOf, caller : Principal, args : Types.RoutedSwapArgs, pool : DexTypes.Pool, poolCanisterId : Principal, id : Nat, now : Int) : async { #ok : Types.RoutedSwapResult; #err : Types.RouteError } {
    if (not DexLib.debit(ctx.dex.balances, caller, args.tokenIn, args.amountIn)) {
      return #err(#insufficientBalance({ token = args.tokenIn; available = DexLib.available(ctx.dex.balances, caller, args.tokenIn); required = args.amountIn }));
    };
    ctx.store.nextSwapId += 1;
    let protocolFee = protocolFeeOf(args.amountIn);
    var rec = save(
      ctx,
      {
        id;
        owner = caller;
        createdAt = now;
        updatedAt = now;
        route = args.route;
        tokenIn = args.tokenIn;
        tokenOut = args.tokenOut;
        amountIn = args.amountIn;
        amountOut = 0;
        minAmountOut = args.minAmountOut;
        deadline = args.deadline;
        fees = icpswapFees(protocolFee, ICPSWAP_FEE_BPS, 0);
        nativePoolId = ?pool.id;
        zeroForOne = false;
        stage = #recorded;
        status = #inProgress;
        move = null;
        lastError = null;
      },
    );
    // Nothing has moved yet: the whole input goes back.
    func refuse(e : Types.RouteError, why : Text) : { #ok : Types.RoutedSwapResult; #err : Types.RouteError } {
      DexLib.credit(ctx.dex.balances, caller, args.tokenIn, args.amountIn);
      rec := save(ctx, { rec with status = #failedReturned(why); lastError = ?why });
      #err(e);
    };
    func review(why : Text) {
      rec := save(ctx, { rec with status = #needsReview; lastError = ?why });
    };
    let ledgerIn = DexLib.tokenLedgerId(args.tokenIn, ctx.dex.canister);
    let ledgerOut = DexLib.tokenLedgerId(args.tokenOut, ctx.dex.canister);
    // Only the factory's pool of this pair may receive funds.
    switch (await IcpSwapLib.findPool(ledgerIn, ledgerOut)) {
      case (?found) {
        if (found != poolCanisterId) return refuse(#routeMismatch({ expected = #icpswap({ poolCanisterId = found }) }), "Not the ICPSwap pool of this pair");
      };
      case null return refuse(#noRouteAvailable, "No ICPSwap pool for this pair");
    };
    let plan = switch (await planOn(ctx, poolCanisterId, args.tokenIn, args.tokenOut, args.amountIn)) {
      case (?p) p;
      case null return refuse(#noRouteAvailable, "ICPSwap quote unavailable");
    };
    let checkedAt = Time.now();
    if (checkedAt > args.deadline) return refuse(#deadlineExceeded({ deadline = args.deadline; now = checkedAt }), "Deadline exceeded");
    if (plan.amountOut < args.minAmountOut) return refuse(#slippageExceeded({ amountOut = plan.amountOut; minAmountOut = args.minAmountOut }), "Below the minimum received");
    let attempt = RetryLib.newDexAttempt(
      ctx.dex.retry,
      #IR,
      null,
      {
        token = args.tokenIn;
        from = DexLib.custodyAccount(ctx.dex.canister, args.tokenIn);
        to = { owner = poolCanisterId; subaccount = ?IcpSwapLib.depositSubaccount(ctx.dex.canister) };
        amount = plan.sendAmount;
        fee = ?plan.feeIn;
      },
      RetryLib.dexNow(),
    );
    rec := save(ctx, { rec with fees = plan.fees; zeroForOne = plan.zeroForOne; stage = #movingIn; move = ?attempt });
    var moved = await RetryLib.sendDexAttempt(ctx.dex, attempt);
    switch (moved.outcome) {
      case (#unknown or #pending) {
        // Same memo and created_at_time: the ledger deduplicates the resend.
        moved := await RetryLib.sendDexAttempt(ctx.dex, moved);
      };
      case _ {};
    };
    rec := save(ctx, { rec with move = ?moved });
    switch (moved.outcome) {
      case (#succeeded(_)) {};
      case (#failed(text)) {
        DexLib.credit(ctx.dex.balances, caller, args.tokenIn, args.amountIn);
        rec := save(ctx, { rec with status = #failedReturned(text); lastError = ?text });
        return #err(#icpswapFailed({ id; message = text; fundsReturned = true }));
      };
      case _ {
        review("IR transfer to ICPSwap with unknown outcome: " # (moved.lastError ?? "no reply"));
        return #err(#outcomeUnknown({ id }));
      };
    };
    rec := save(ctx, { rec with stage = #depositing });
    let credited = switch (await IcpSwapLib.deposit(poolCanisterId, ledgerIn, plan.sendAmount, plan.feeIn)) {
      case (#ok(v)) v;
      case (#err(e)) {
        // Known failure: deposit retried, then the input is withdrawn back
        // to the token's DEX custody account; only a failed recovery is
        // listed in To review.
        rec := await recoverInput(ctx, rec, true, "ICPSwap deposit failed: " # e);
        return #err(#icpswapFailed({ id; message = e; fundsReturned = rec.status != #needsReview }));
      };
    };
    rec := save(ctx, { rec with stage = #swapping });
    let out = switch (await IcpSwapLib.swap(poolCanisterId, plan.zeroForOne, credited, args.minAmountOut + plan.feeOut)) {
      case (#ok(v)) v;
      case (#err(e)) {
        // Known failure: the deposited input is withdrawn back to the caller.
        switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerIn, credited, plan.feeIn, DexLib.custodySubaccount(args.tokenIn))) {
          case (#ok(_)) {
            let back = protocolFee + sat(credited, plan.feeIn);
            DexLib.credit(ctx.dex.balances, caller, args.tokenIn, back);
            let why = "ICPSwap swap failed: " # e # "; " # back.toText() # " returned to the internal balance";
            rec := save(ctx, { rec with status = #failedReturned(why); lastError = ?why });
            return #err(#icpswapFailed({ id; message = e; fundsReturned = true }));
          };
          case (#err(w)) {
            review("ICPSwap swap failed: " # e # "; recovery withdrawal failed: " # w);
            return #err(#icpswapFailed({ id; message = e; fundsReturned = false }));
          };
        };
      };
    };
    let net = sat(out, plan.feeOut);
    rec := save(ctx, { rec with stage = #withdrawing; amountOut = net });
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerOut, out, plan.feeOut, DexLib.custodySubaccount(args.tokenOut))) {
      case (#ok(_)) {};
      case (#err(e)) {
        review("ICPSwap output withdrawal failed: " # e # "; the output stays on this canister's ICPSwap balance");
        return #err(#outcomeUnknown({ id }));
      };
    };
    DexLib.credit(ctx.dex.balances, caller, args.tokenOut, net);
    applyProtocolFee(ctx, usdRateOf, pool.id, args.tokenIn, protocolFee);
    rec := save(ctx, { rec with stage = #done; status = #completed; lastError = null });
    #ok({ id; route = args.route; tokenIn = args.tokenIn; tokenOut = args.tokenOut; amountIn = args.amountIn; amountOut = net; fees = rec.fees });
  };

  // --- Views -----------------------------------------------------------------

  func isIcpswap(s : Types.RoutedSwap) : Bool = switch (s.route) {
    case (#icpswap(_)) true;
    case (#native(_)) false;
  };

  // PTM-9e: ICPSwap routed swaps, newest first, one page. `cursor` = swap id
  // of the last item of the previous page: the page holds the swaps with a
  // smaller id (null = newest). `limit` is clamped by PageTypes.clampLimit (cap
  // PageTypes.MAX_PAGE_SIZE). `nextCursor` = id of the last returned swap while
  // older ones remain, else null.
  public func listIcpswapSwaps(ctx : ListContext, cursor : ?Nat, limit : Nat) : PageTypes.Page<Types.RoutedSwap> {
    let size = PageTypes.clampLimit(limit);
    let it = switch (cursor) {
      case null ctx.store.swaps.reverseEntries();
      case (?0) return PageTypes.emptyPage<Types.RoutedSwap>();
      case (?c) ctx.store.swaps.reverseEntriesFrom(c - 1);
    };
    let items = List.empty<Types.RoutedSwap>();
    var more = false;
    label scan for ((_, s) in it) {
      if (isIcpswap(s)) {
        if (items.size() == size) {
          more := true;
          break scan;
        };
        items.add(s);
      };
    };
    pageOf(items, more);
  };

  func pageOf(items : List.List<Types.RoutedSwap>, more : Bool) : PageTypes.Page<Types.RoutedSwap> {
    let n = items.size();
    { items = items.toArray(); nextCursor = if (more and n > 0) ?(items.at(n - 1).id) else null };
  };

  // PTM-9e: swaps of `owner`, newest first, one page, read through
  // ctx.ownerIndex (ids ascending, binary search for the cursor); never the
  // whole registry.
  public func listByOwner(ctx : ListContext, owner : Principal, cursor : ?Nat, limit : Nat) : PageTypes.Page<Types.RoutedSwap> {
    let size = PageTypes.clampLimit(limit);
    let ids = switch (ctx.ownerIndex.get(owner)) {
      case (?l) l;
      case null return PageTypes.emptyPage<Types.RoutedSwap>();
    };
    // Number of ids strictly below the cursor.
    var count = ids.size();
    switch (cursor) {
      case (?c) {
        var lo = 0;
        var hi = ids.size();
        while (lo < hi) {
          let mid = (lo + hi) / 2;
          if (ids.at(mid) < c) lo := mid + 1 else hi := mid;
        };
        count := lo;
      };
      case null {};
    };
    let items = List.empty<Types.RoutedSwap>();
    var more = false;
    var i = count;
    while (i > 0) {
      i -= 1;
      switch (ctx.store.swaps.get(ids.at(i))) {
        case (?s) {
          if (items.size() == size) {
            more := true;
            i := 0;
          } else {
            items.add(s);
          };
        };
        case null {};
      };
    };
    pageOf(items, more);
  };

  public func feeViews(ctx : RouterContext) : [Types.RouterFeeView] {
    ctx.store.feeTotals.values().map(func t = { totals = t; setAside = setAsideOf(ctx, t.poolId) }).toArray();
  };

  // --- Recovery -------------------------------------------------------------

  func recordedProtocolFee(s : Types.RoutedSwap) : Nat = switch (s.fees) {
    case (#icpswap(f)) f.protocolFee;
    case (#native(_)) 0;
  };

  func icpswapPoolOf(s : Types.RoutedSwap) : ?Principal = switch (s.route) {
    case (#icpswap({ poolCanisterId })) ?poolCanisterId;
    case (#native(_)) null;
  };

  // Gets the input back from ICPSwap (deposit first when `deposit`, as the
  // IR amount may still sit on the deposit subaccount), withdrawn to the
  // token's DEX custody account, and credits the internal balance (the 0.1 %
  // kept here included): #failedReturned. On failure: #needsReview.
  func recoverInput(ctx : RouterContext, s : Types.RoutedSwap, deposit : Bool, why : Text) : async Types.RoutedSwap {
    let poolCanisterId = switch (icpswapPoolOf(s)) {
      case (?p) p;
      case null return s;
    };
    let ledgerIn = DexLib.tokenLedgerId(s.tokenIn, ctx.dex.canister);
    let feeIn = RetryLib.dexFee(ctx.dex, s.tokenIn);
    let sent = switch (s.move) {
      case (?a) a.request.amount;
      case null 0;
    };
    var credited = sat(sent, feeIn); // ICPSwap deposit takes one ledger fee
    if (deposit) {
      switch (await IcpSwapLib.deposit(poolCanisterId, ledgerIn, sent, feeIn)) {
        case (#ok(v)) credited := v;
        case (#err(_)) {}; // possibly already credited by an earlier deposit call
      };
    };
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerIn, credited, feeIn, DexLib.custodySubaccount(s.tokenIn))) {
      case (#ok(_)) {
        let back = recordedProtocolFee(s) + sat(credited, feeIn);
        DexLib.credit(ctx.dex.balances, s.owner, s.tokenIn, back);
        let text = why # "; " # back.toText() # " returned to the internal balance";
        save(ctx, { s with status = #failedReturned(text); lastError = ?text });
      };
      case (#err(w)) {
        let text = why # "; recovery withdrawal failed: " # w # "; the input stays on this canister's ICPSwap balance";
        save(ctx, { s with status = #needsReview; lastError = ?text });
      };
    };
  };

  // Retries the output withdrawal; on success credits the output and splits
  // the 0.1 % (#completed), otherwise stays in To review.
  func retryOutput(ctx : RouterContext, s : Types.RoutedSwap) : async () {
    let poolCanisterId = switch (icpswapPoolOf(s)) {
      case (?p) p;
      case null return;
    };
    let ledgerOut = DexLib.tokenLedgerId(s.tokenOut, ctx.dex.canister);
    let feeOut = RetryLib.dexFee(ctx.dex, s.tokenOut);
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerOut, s.amountOut + feeOut, feeOut, DexLib.custodySubaccount(s.tokenOut))) {
      case (#ok(_)) {
        DexLib.credit(ctx.dex.balances, s.owner, s.tokenOut, s.amountOut);
        switch (s.nativePoolId) {
          case (?poolId) applyProtocolFee(ctx, noRate, poolId, s.tokenIn, recordedProtocolFee(s));
          case null {};
        };
        ignore save(ctx, { s with stage = #done; status = #completed; lastError = null });
      };
      case (#err(e)) {
        ignore save(ctx, { s with status = #needsReview; lastError = ?("Reviewed: output withdrawal retried and failed: " # e # "; the output stays on this canister's ICPSwap balance") });
      };
    };
  };

  // --- To review (kind #IR) --------------------------------------------------

  // Every IR transfer in #needsReview (purchaseId = routed swap id).
  public func toReview(ctx : RouterContext) : [RetryTypes.TransferReview] {
    ctx.store.swaps.values().filter(func s = s.status == #needsReview).filterMap(
      func s = switch (s.move) {
        case (?a) ?RetryLib.dexReview(#IR, s.id, s.owner, a);
        case null null;
      }
    ).toArray();
  };

  // Arrived: at the withdrawal stage the output reached the owner's deposit
  // subaccount (credited, 0.1 % split). At earlier stages the IR transfer
  // reached ICPSwap: the input is recovered (deposit, withdrawal to the
  // token's DEX custody account) and credited back with the 0.1 %; if the
  // recovery fails the swap stays in To review.
  public func markArrived(ctx : RouterContext, id : Nat, block : Nat) : async RetryTypes.ReviewResult {
    let s = switch (ctx.store.swaps.get(id)) {
      case (?s) s;
      case null return #err(#notFound);
    };
    if (s.status != #needsReview) return #err(#notUnderReview);
    switch (s.stage) {
      case (#withdrawing) {
        DexLib.credit(ctx.dex.balances, s.owner, s.tokenOut, s.amountOut);
        switch (s.nativePoolId) {
          case (?poolId) applyProtocolFee(ctx, noRate, poolId, s.tokenIn, recordedProtocolFee(s));
          case null {};
        };
        ignore save(ctx, { s with status = #reviewedArrived(block) });
      };
      case (#movingIn or #depositing or #swapping) {
        // #inProgress before the first await: a second review call is refused.
        let busy = save(ctx, { s with status = #inProgress; stage = if (s.stage == #swapping) #swapping else #depositing });
        ignore await recoverInput(ctx, busy, busy.stage == #depositing, "Reviewed: IR transfer arrived in block " # block.toText());
      };
      case (_) return #err(#notApplicable);
    };
    #ok(());
  };

  // Not arrived: on the IR transfer itself (nothing moved) the whole input is
  // credited back. After a recorded IR success the input is recovered from
  // ICPSwap as for Arrived; at the withdrawal stage the output withdrawal is
  // retried. A failed recovery stays in To review.
  public func markNotArrived(ctx : RouterContext, id : Nat) : async RetryTypes.ReviewResult {
    let s = switch (ctx.store.swaps.get(id)) {
      case (?s) s;
      case null return #err(#notFound);
    };
    if (s.status != #needsReview) return #err(#notUnderReview);
    switch (s.stage) {
      case (#recorded or #movingIn) {
        DexLib.credit(ctx.dex.balances, s.owner, s.tokenIn, s.amountIn);
        ignore save(ctx, { s with status = #reviewedNotArrived });
      };
      case (#depositing or #swapping) {
        let busy = save(ctx, { s with status = #inProgress });
        ignore await recoverInput(ctx, busy, s.stage == #depositing, "Reviewed: IR transfer recorded as succeeded");
      };
      case (#withdrawing) {
        let busy = save(ctx, { s with status = #inProgress });
        await retryOutput(ctx, busy);
      };
      case (#done) return #err(#notApplicable);
    };
    #ok(());
  };

  // --- PTM-4: permanent liquidity rebalance and injection ---------------------

  let PERMANENT_LOCK : Text = "PTM-PERMANENT";
  let PERMANENT_DEADLINE_NS : Int = 120_000_000_000;

  // Internal DEX owner of the rebalance swaps: nobody holds its key, it only
  // carries the swapped amounts for the duration of one swap.
  func permanentOwner() : Principal = Principal.fromBlob("PERMANENT-LIQ".encodeUtf8());

  func journalRoute(route : Types.Route) : PfTypes.PermanentRoute = switch (route) {
    case (#native({ poolId })) #native(poolId);
    case (#icpswap({ poolCanisterId })) #icpswap(poolCanisterId);
  };

  func routeErrorText(e : Types.RouteError) : Text = switch (e) {
    case (#slippageExceeded(_)) "Result below the minimum allowed by the hourly average";
    case (#noRouteAvailable) "No route available";
    case (#icpswapFailed(x)) "ICPSwap swap failed: " # x.message;
    case (#outcomeUnknown(x)) "ICPSwap outcome unknown, routed swap " # x.id.toText() # " is in To review";
    case (#insufficientBalance(_)) "Insufficient set-aside balance";
    case (#operationInProgress) "Operation in progress";
    case (#deadlineExceeded(_)) "Deadline exceeded";
    case _ "Swap refused";
  };

  // Moves what the internal owner holds (a refused swap, a swap returned by
  // To review) back to the permanent set-aside.
  func sweepOwner(ctx : RouterContext, now : Int) {
    let store = ctx.protocol.permanent;
    for (token in DexLib.DEX_TOKENS.values()) {
      let have = DexLib.available(ctx.dex.balances, permanentOwner(), token);
      if (have > 0 and DexLib.debit(ctx.dex.balances, permanentOwner(), token, have)) {
        ProtocolFeesLib.setPermanentAmount(store, token, ProtocolFeesLib.permanentAmount(store, token) + have);
        ProtocolFeesLib.logPermanent(store, #accrued, token, have, null, 0, null, null, 0, ?"Returned by a refused or reviewed rebalance swap", now);
      };
    };
  };

  func waitOn(ctx : RouterContext, key : Text, token : DexTypes.DexToken, amount : Nat, reason : Text, now : Int) {
    ProtocolFeesLib.logPermanentWaiting(ctx.protocol.permanent, key, #waiting, token, amount, reason, now);
  };

  // Sells `amountIn` of the set-aside on the best route (native pool versus
  // ICPSwap, as routedQuote compares them), only when the value is at least
  // 1 ICP and the result stays within 2 % of the hourly average. Returns the
  // amount received (now in the set-aside) or null (journal entry written).
  func rebalanceSwap(ctx : RouterContext, tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken, amountIn : Nat) : async ?Nat {
    let pf = ctx.protocol;
    let store = pf.permanent;
    let key = "swap/" # DexLib.tokenKey(tokenIn) # "/" # DexLib.tokenKey(tokenOut);
    let now = Time.now();
    let have = ProtocolFeesLib.permanentAmount(store, tokenIn);
    if (amountIn == 0 or amountIn > have) return null;
    switch (ProtocolFeesLib.valueIcpDex(pf, tokenIn, amountIn, now)) {
      case (?v) {
        if (v < ProtocolFeesLib.DC_THRESHOLD_E8S) {
          waitOn(ctx, key, tokenIn, amountIn, "Below the 1 ICP threshold", now);
          return null;
        };
      };
      case null {
        waitOn(ctx, key, tokenIn, amountIn, "Rate absent or expired", now);
        return null;
      };
    };
    // PTM-5: a swap that involves TTTI-T is checked against the consolidated
    // hourly price (all open native TTTI-T pools, converted with the current
    // rates), never against one pool; without it the guard waits and no swap
    // is routed. Other pairs keep the pair's own hourly average.
    let reference : Nat = if (tokenIn == #tttiT or tokenOut == #tttiT) {
      switch (ProtocolFeesLib.tttiExpectedOut(pf, tokenIn, tokenOut, amountIn, now)) {
        case (?r) r;
        case null {
          waitOn(ctx, key, tokenIn, amountIn, "Consolidated TTTI-T hourly price absent", now);
          return null;
        };
      };
    } else {
      let pool = switch (findNative(ctx, tokenIn, tokenOut)) {
        case (#pool(p)) p;
        case _ {
          waitOn(ctx, key, tokenIn, amountIn, "No pair to compare with the hourly average", now);
          return null;
        };
      };
      let zeroForOne = switch (poolTokens(pool)) {
        case (?(t0, _)) t0 == tokenIn;
        case null return null;
      };
      switch (ProtocolFeesLib.referenceOut(pf.store, pool.id, zeroForOne, amountIn, now)) {
        case (?r) r;
        case null {
          waitOn(ctx, key, tokenIn, amountIn, "Hourly average price absent", now);
          return null;
        };
      };
    };
    let minOut = reference * (BPS - ProtocolFeesLib.DC_MAX_DEVIATION_BPS) / BPS;
    let rate = ProtocolFeesLib.rateOf(pf, now);
    let quote = switch (await routedQuote(ctx, rate, { tokenIn; tokenOut; amountIn; slippageBps = ProtocolFeesLib.DC_MAX_DEVIATION_BPS })) {
      case (#ok(q)) q;
      case (#err(_)) {
        waitOn(ctx, key, tokenIn, amountIn, "No route available", Time.now());
        return null;
      };
    };
    if (quote.amountOut < minOut) {
      waitOn(ctx, key, tokenIn, amountIn, "Best route is more than 2 % below the hourly average", Time.now());
      return null;
    };
    // Recorded before the swap: the amount leaves the set-aside and is carried
    // by the internal owner; a refusal sweeps it back.
    let owner = permanentOwner();
    ProtocolFeesLib.setPermanentAmount(store, tokenIn, ProtocolFeesLib.permanentAmount(store, tokenIn) - amountIn);
    DexLib.credit(ctx.dex.balances, owner, tokenIn, amountIn);
    let at = Time.now();
    let result = await routedSwap(ctx, rate, owner, { tokenIn; tokenOut; amountIn; minAmountOut = minOut; deadline = at + PERMANENT_DEADLINE_NS; route = quote.route });
    switch (result) {
      case (#ok(r)) {
        let moved = DexLib.debit(ctx.dex.balances, owner, tokenOut, r.amountOut);
        if (moved) {
          ProtocolFeesLib.setPermanentAmount(store, tokenOut, ProtocolFeesLib.permanentAmount(store, tokenOut) + r.amountOut);
        };
        ProtocolFeesLib.logPermanent(store, #rebalanced, tokenIn, amountIn, ?tokenOut, r.amountOut, ?journalRoute(r.route), null, 0, null, Time.now());
        ProtocolFeesLib.clearPermanentWaiting(store);
        ?r.amountOut;
      };
      case (#err(e)) {
        sweepOwner(ctx, Time.now());
        ProtocolFeesLib.logPermanentWaiting(store, key, #failed, tokenIn, amountIn, routeErrorText(e), Time.now());
        null;
      };
    };
  };

  // One run: sweeps returned amounts, converts every other set-aside token to
  // the target pool's second token, balances the pair at the pool ratio and
  // injects it as contract-locked shares of the least liquid TTTI-T pool.
  // The protocol never places a price-linked order and never creates TTTI-T:
  // TTTI-T only comes from the set-aside itself or from a market swap.
  public func runPermanentLiquidity(ctx : RouterContext) : async () {
    let pf = ctx.protocol;
    let store = pf.permanent;
    if (ctx.dex.pause.paused) return;
    if (not RetryLib.tryLock(ctx.locks, PERMANENT_LOCK)) return;
    try {
      sweepOwner(ctx, Time.now());
      // PTM-9b: reserves of removed TTTI-T pairs go back into the least liquid pool first.
      ProtocolFeesLib.reinjectRemovedPools(pf, Time.now());
      let now = Time.now();
      let (pool, tttiIs0) = switch (ProtocolFeesLib.feedTarget(pf.dex, ProtocolFeesLib.rateOf(pf, now))) {
        case (?t) t;
        case null {
          waitOn(ctx, "target", #tttiT, ProtocolFeesLib.permanentAmount(store, #tttiT), "No open TTTI-T pool", now);
          return;
        };
      };
      let second = switch (DexLib.poolDexToken(if (tttiIs0) pool.token1 else pool.token0)) {
        case (?t) t;
        case null return;
      };
      // 1. Every other token goes to the second token of the target pool.
      for (token in DexLib.DEX_TOKENS.values()) {
        if (token != #tttiT and token != second) {
          let amount = ProtocolFeesLib.permanentAmount(store, token);
          if (amount > 0) ignore await rebalanceSwap(ctx, token, second, amount);
        };
      };
      // 2. Balance the pair at the target pool ratio (half of the excess).
      var current = switch (pf.dex.pools.get(pool.id)) {
        case (?p) p;
        case null return;
      };
      let (rT, rX) = if (tttiIs0) (current.reserve0, current.reserve1) else (current.reserve1, current.reserve0);
      if (rT == 0 or rX == 0) {
        waitOn(ctx, "target", #tttiT, ProtocolFeesLib.permanentAmount(store, #tttiT), "Target pool has no reserves", now);
        return;
      };
      let sT = ProtocolFeesLib.permanentAmount(store, #tttiT);
      let sX = ProtocolFeesLib.permanentAmount(store, second);
      if (sX * rT > sT * rX) {
        let z = (sX * rT - sT * rX) / (2 * rT);
        ignore await rebalanceSwap(ctx, second, #tttiT, z);
      } else if (sT * rX > sX * rT) {
        let z = (sT * rX - sX * rT) / (2 * rX);
        ignore await rebalanceSwap(ctx, #tttiT, second, z);
      };
      // 3. Inject at the pool ratio.
      let at = Time.now();
      let t = ProtocolFeesLib.permanentAmount(store, #tttiT);
      let x = ProtocolFeesLib.permanentAmount(store, second);
      if (t == 0 or x == 0) {
        waitOn(ctx, "inject", second, x, "One side of the pair is empty", at);
        return;
      };
      let vT = ProtocolFeesLib.valueIcpDex(pf, #tttiT, t, at);
      let vX = ProtocolFeesLib.valueIcpDex(pf, second, x, at);
      switch (vT, vX) {
        case (?a, ?b) {
          if (a + b < ProtocolFeesLib.DC_THRESHOLD_E8S) {
            waitOn(ctx, "inject", second, x, "Below the 1 ICP threshold", at);
            return;
          };
        };
        case _ {
          waitOn(ctx, "inject", second, x, "Rate absent or expired", at);
          return;
        };
      };
      let (a0, a1) = if (tttiIs0) (t, x) else (x, t);
      let added = ProtocolFeesLib.injectPermanent(pf, pool.id, a0, a1, at);
      if (added.shares == 0) {
        ProtocolFeesLib.logPermanentWaiting(store, "inject", #failed, second, x, "Injection refused by the target pool", at);
        return;
      };
      let (usedT, usedX) = if (tttiIs0) (added.used0, added.used1) else (added.used1, added.used0);
      ProtocolFeesLib.setPermanentAmount(store, #tttiT, sat(t, usedT));
      ProtocolFeesLib.setPermanentAmount(store, second, sat(x, usedX));
      ProtocolFeesLib.logPermanent(store, #injected, #tttiT, usedT, ?second, usedX, null, ?pool.id, added.shares, null, at);
      ProtocolFeesLib.clearPermanentWaiting(store);
    } finally {
      RetryLib.unlock(ctx.locks, PERMANENT_LOCK);
    };
  };
};
