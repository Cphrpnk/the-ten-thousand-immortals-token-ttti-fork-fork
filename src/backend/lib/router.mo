import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/router";
import RetryTypes "../types/retry";
import DexTypes "../types/dex";
import DexLib "dex";
import RetryLib "retry";
import IcpSwapLib "icpswap";
import ProtocolFeesLib "protocol-fees";

// DEX lot 5: ICPSwap router logic (quote comparison, single-route execution,
// 0.1 % protocol fee split, IR transfers and their review). The protocol
// never places a price-linked order and never creates TTTI-T: a routed swap
// only runs when its owner calls routedSwap, from that owner's balances.
module {
  public type RouterContext = {
    store : Types.RouterStore;
    dex : RetryLib.DexContext;
    locks : Set.Set<Text>; // transient: "IR/<routed swap id>"
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

  // --- 0.1 % protocol fee: 70 % LPs, 30 % permanent liquidity ----------------

  func totalsOf(ctx : RouterContext, poolId : Nat) : Types.RouterFeeTotals {
    switch (ctx.store.feeTotals.get(poolId)) {
      case (?t) t;
      case null {
        { poolId; collected0 = 0; collected1 = 0; lpPaid0 = 0; lpPaid1 = 0; lpSetAside0 = 0; lpSetAside1 = 0; permanent0 = 0; permanent1 = 0 };
      };
    };
  };

  func setAsideOf(ctx : RouterContext, poolId : Nat) : Types.RouterSetAside {
    ctx.store.setAside.get(poolId) ?? { amount0 = 0; amount1 = 0 };
  };

  // Adds to the pool's protocol fee (recycled into permanent locked shares).
  func toPermanent(ctx : RouterContext, poolId : Nat, side0 : Bool, amount : Nat) {
    if (amount == 0) return;
    switch (ctx.dex.dex.pools.get(poolId)) {
      case (?pool) {
        ctx.dex.dex.pools.add(poolId, if (side0) { { pool with protocolFee0 = pool.protocolFee0 + amount } } else { { pool with protocolFee1 = pool.protocolFee1 + amount } });
      };
      case null {};
    };
  };

  // Credits `amount` of `token` to the pool's LPs pro rata on their shares;
  // returns the amount paid (0 when the pool has no LP).
  func payLps(ctx : RouterContext, poolId : Nat, token : DexTypes.DexToken, amount : Nat) : Nat {
    var total = 0;
    for (pos in ctx.dex.dex.positions.values()) {
      if (pos.poolId == poolId) total += pos.shares;
    };
    if (total == 0 or amount == 0) return 0;
    var paid = 0;
    for (pos in ctx.dex.dex.positions.values()) {
      if (pos.poolId == poolId and pos.shares > 0) {
        let part = amount * pos.shares / total;
        if (part > 0) {
          DexLib.credit(ctx.dex.balances, pos.owner, token, part);
          paid += part;
        };
      };
    };
    paid;
  };

  // Without a USD rate function (review paths) the liquidity ranking falls
  // back to twice the TTTI-T side, as for the mint fee without a usable rate.
  func noRate(_ : DexTypes.PoolToken) : ?Nat = null;

  // Splits a collected 0.1 % (in tokenIn units) for the native pool: 70 % to
  // its LPs, 30 % to its permanent liquidity. Without LP in the native pool
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
    let hasLp = ctx.dex.dex.positions.values().any(func p = p.poolId == poolId and p.shares > 0);
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
            if (id != poolId and ctx.dex.dex.positions.values().any(func x = x.poolId == id and x.shares > 0)) ?id else null;
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

  // Pays every set-aside LP share to the LPs of pools that now have LPs
  // (rounding dust goes to permanent liquidity). Called on every routed swap
  // and by the 10-minute timer in main.mo.
  public func paySetAside(ctx : RouterContext) {
    if (ctx.dex.pause.paused) return;
    for ((poolId, sa) in ctx.store.setAside.entries().toArray().values()) {
      if (sa.amount0 + sa.amount1 > 0) {
        switch (ctx.dex.dex.pools.get(poolId)) {
          case (?pool) {
            switch (poolTokens(pool)) {
              case (?(t0, t1)) {
                let paid0 = payLps(ctx, poolId, t0, sa.amount0);
                let paid1 = payLps(ctx, poolId, t1, sa.amount1);
                if (paid0 > 0 or paid1 > 0) {
                  let dust0 = if (paid0 > 0) sa.amount0 - paid0 else 0;
                  let dust1 = if (paid1 > 0) sa.amount1 - paid1 else 0;
                  toPermanent(ctx, poolId, true, dust0);
                  toPermanent(ctx, poolId, false, dust1);
                  ctx.store.setAside.add(poolId, { amount0 = if (paid0 > 0) 0 else sa.amount0; amount1 = if (paid1 > 0) 0 else sa.amount1 });
                  let t = totalsOf(ctx, poolId);
                  ctx.store.feeTotals.add(poolId, { t with lpPaid0 = t.lpPaid0 + paid0; lpPaid1 = t.lpPaid1 + paid1; permanent0 = t.permanent0 + dust0; permanent1 = t.permanent1 + dust1 });
                };
              };
              case null {};
            };
          };
          case null {};
        };
      };
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
    ctx.store.swaps.add(s.id, updated);
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
    paySetAside(ctx);
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
        from = DexLib.userDepositAccount(ctx.dex.canister, caller);
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
        // to the caller's deposit subaccount; only a failed recovery is
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
        switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerIn, credited, plan.feeIn, DexLib.userDepositSubaccount(caller))) {
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
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerOut, out, plan.feeOut, DexLib.userDepositSubaccount(caller))) {
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

  public func listIcpswapSwaps(ctx : RouterContext) : [Types.RoutedSwap] {
    ctx.store.swaps.values().filter(isIcpswap).toArray().sort(func(x, y) = Nat.compare(y.id, x.id));
  };

  public func listByOwner(ctx : RouterContext, owner : Principal) : [Types.RoutedSwap] {
    ctx.store.swaps.values().filter(func s = s.owner == owner).toArray().sort(func(x, y) = Nat.compare(y.id, x.id));
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
  // owner's deposit subaccount, and credits the internal balance (the 0.1 %
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
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerIn, credited, feeIn, DexLib.userDepositSubaccount(s.owner))) {
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
    switch (await IcpSwapLib.withdrawToSubaccount(poolCanisterId, ledgerOut, s.amountOut + feeOut, feeOut, DexLib.userDepositSubaccount(s.owner))) {
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
  // owner's deposit subaccount) and credited back with the 0.1 %; if the
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
};
