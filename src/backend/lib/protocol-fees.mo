import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/protocol-fees";
import DexTypes "../types/dex";
import DexReserveTypes "../types/dex-reserve";
import RetryTypes "../types/retry";
import Treasury "../types/treasury";
import CyclesTypes "../types/cycles-reserve";
import TreasuryLib "treasury";
import DexLib "dex";
import RetryLib "retry";
import Nat8 "mo:core/Nat8";
import PayTokenLib "pay-token";
import IcrcLib "icrc";
import OracleLib "oracle";
import CreatorFeesLib "creator-fees";
import MintFeeTypes "../types/mint-fee";
import PayTypes "../types/pay-token";

// Native swap fees: 70 % stays in the reserves (LPs); the 30 % protocol share
// kept in protocolFee0/1 (and the 30 % of the router 0.1 %) is split in two
// thirds for the creator (lib/creator-fees.mo, credited, kept in the DEX
// custody until paid out) and one third for permanent liquidity, set aside per
// token and rebalanced by the router (lib/router.mo runPermanentLiquidity)
// into contract-locked shares of the least liquid TTTI-T pool (public
// journal). Nothing is recycled into the same pool and nothing goes to cycles
// from swap fees. DC batches stay as read-only history, already-earned DL
// bonuses stay claimable, ICP held in cyclesHeldE8s stays recorded. The
// retired mint fee (1/101) is no longer routed; its stored routings, LP
// mint-fee claims (memo TTTI-MF-<n>) and set-aside amounts stay; the old
// set-aside injection no longer runs. Transfers use
// lib/retry.mo (created_at_time, identical resend for 23 h, then To review).
module {
  public type ProtocolFeeStore = Types.ProtocolFeeStore;
  public type FeeBuckets = Types.FeeBuckets;
  public type DcBatch = Types.DcBatch;
  public type BonusDistribution = Types.BonusDistribution;
  public type ProtocolLiquidityView = Types.ProtocolLiquidityView;
  public type LpBonusView = Types.LpBonusView;
  public type ClaimBonusResult = Types.ClaimBonusResult;

  // --- Constants (code, not admin-settable) ----------------------------------

  // Legacy recycle buckets (stored before PTM-4): a fixed 10 % of the former
  // protocol share; still added as protocol liquidity, never refilled.
  public let RECYCLE_BPS : Nat = 1_000;
  // DC: no conversion when the execution deviates more than 2 % from the average.
  public let DC_MAX_DEVIATION_BPS : Nat = 200;
  // Average price window: samples of the last 60 minutes, covering at least 30.
  public let AVERAGE_WINDOW_MIN_NS : Nat = 1_800_000_000_000;
  public let AVERAGE_WINDOW_MAX_NS : Nat = 3_600_000_000_000;
  // DC: once a day, or as soon as the waiting ICP-equivalent reaches the threshold.
  public let DC_INTERVAL_NS : Nat = 86_400_000_000_000;
  public let DC_THRESHOLD_E8S : Nat = 100_000_000; // 1 ICP
  // DL weight: value in ICP x remaining lock time / 5 years.
  public let FIVE_YEARS_NS : Nat = 157_680_000_000_000_000;
  // Weekly allocation interval.
  public let WEEK_NS : Nat = 604_800_000_000_000;

  // ICP account of the protocol share (DC sends, DL claims): canister +
  // 32-byte ASCII subaccount, distinct from every other subaccount.
  public let PROTOCOL_FEES_SUBACCOUNT : Blob = "DEX-PROTOCOL-FEES-ICP-0000000001";
  // Smallest DL claim: twice the ICP ledger fee.
  public let MIN_CLAIM_E8S : Nat = 20_000; // 2 x TreasuryLib.ICP_FEE (10_000)

  let SAMPLE_INTERVAL_SECONDS : Nat = 300;
  let RETRY_SECONDS : Nat = 600;
  let INJECTION_SECONDS : Nat = 600;

  // Everything the DC / DL / weekly runs need (references, no copy). Transient.
  public type ProtocolFeeContext = {
    store : ProtocolFeeStore;
    dex : DexTypes.DexStore;
    retry : RetryTypes.RetryStore;
    ledger : IcrcLib.Ledger; // TTTI-T in-process ledger (fee-token moves)
    locks : Set.Set<Text>; // transient: one lock per DC / DL transfer
    canister : Principal;
    // Mint revenue correction: mint-fee routing, LP claims, set-aside
    // amounts and liquidity injections; USD rates for the injection threshold.
    mintFees : MintFeeTypes.MintFeeStore;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    // Legacy feeds of refused TTTI-T deposits (history only; nothing is fed to
    // a pool any more).
    refusedFeeds : Map.Map<DexTypes.RequestId, DexTypes.RefusedDepositFeed>;
    // PTM-10c: how each pair request deposit was paid and, after a refusal,
    // its move into the permanent liquidity set-aside.
    payments : Map.Map<Nat, RetryTypes.PairPayDeposit>;
    // DEX lot 6 pause: automatic fee, injection and recycling processing skips while paused.
    pause : DexReserveTypes.PauseState;
    // PTM-4: creator holdings (two thirds of every protocol share) and the
    // permanent liquidity set-aside and journal (one third).
    creator : CreatorFeesLib.CreatorFeeStore;
    permanent : Types.PermanentLiquidityStore;
    // PTM-5: 24 h of consolidated TTTI-T price samples (USD x 1e8).
    consolidated : Types.ConsolidatedPriceStore;
    // PTM-10a: 24 h of pools-to-capitalisation ratio samples.
    ratioSamples : Types.PoolCapRatioStore;
  };

  // Weekly allocation run context. Transient.
  public type WeeklyContext = {
    fees : ProtocolFeeContext;
    allocation : Treasury.AllocationStore;
    treasury : TreasuryLib.TreasuryStore;
    cyclesReserve : CyclesTypes.CyclesReserveStore;
    autonomy : CyclesTypes.AutonomyStore;
  };

  // --- Helpers ---------------------------------------------------------------

  let ZERO_BUCKETS : FeeBuckets = { cycles0 = 0; cycles1 = 0; bonus0 = 0; bonus1 = 0; recycle0 = 0; recycle1 = 0 };

  func sat(a : Nat, b : Nat) : Nat = if (a > b) a - b else 0;

  func ceilDiv(a : Nat, b : Nat) : Nat = if (b == 0) 0 else (a + b - 1) / b;

  func bucketsOf(store : ProtocolFeeStore, poolId : Nat) : FeeBuckets = store.buckets.get(poolId) ?? ZERO_BUCKETS;

  func isIcp(token : DexTypes.PoolToken) : Bool = DexLib.poolDexToken(token) == ?#icp;

  // True from the announcement of a pair removal (adds are suspended) until
  // the pool is #removed.
  func underRemoval(dex : DexTypes.DexStore, poolId : Nat) : Bool {
    switch (dex.removals.get(poolId)) {
      case (?r) {
        switch (r.state) {
          case (#announced) true;
          case (#executing(_)) true;
          case _ false;
        };
      };
      case null false;
    };
  };

  func isOpen(pool : DexTypes.Pool) : Bool {
    pool.status == #active and pool.removedAt == null and pool.reserve0 > 0 and pool.reserve1 > 0 and pool.totalShares > 0;
  };

  func payDex(p : Treasury.PayToken) : DexTypes.DexToken {
    switch (p) {
      case (#icp) #icp;
      case (#ckbtc) #ckbtc;
      case (#ckusdc) #ckusdc;
      case (#ckusdt) #ckusdt;
    };
  };

  func protocolFeesAccount(canister : Principal) : Types.Account {
    { owner = canister; subaccount = ?PROTOCOL_FEES_SUBACCOUNT };
  };

  // Open pool pairing `token` with ICP (lowest id) and whether token is token0.
  func icpPoolFor(dex : DexTypes.DexStore, token : DexTypes.PoolToken) : ?(DexTypes.Pool, Bool) {
    for (pool in dex.pools.values()) {
      if (isOpen(pool)) {
        if (pool.token0.ledger == token.ledger and isIcp(pool.token1)) return ?(pool, true);
        if (pool.token1.ledger == token.ledger and isIcp(pool.token0)) return ?(pool, false);
      };
    };
    null;
  };

  // Value of `amount` of `token` in ICP e8s at the average price, null when unknown.
  // TTTI-T is valued at the consolidated price, never at one pool's price.
  func valueIcp(ctx : ProtocolFeeContext, token : DexTypes.PoolToken, amount : Nat, now : Int) : ?Nat {
    if (amount == 0) return ?0;
    if (isIcp(token)) return ?amount;
    if (DexLib.poolDexToken(token) == ?#tttiT) return tttiValueIcp(ctx, amount, now);
    switch (icpPoolFor(ctx.dex, token)) {
      case (?(pool, zeroForOne)) { referenceOut(ctx.store, pool.id, zeroForOne, amount, now) };
      case null { null };
    };
  };

  func addClaimable(store : ProtocolFeeStore, owner : Principal, amount : Nat) {
    if (amount > 0) {
      store.bonusClaimable.add(owner, (store.bonusClaimable.get(owner) ?? 0) + amount);
    };
  };

  // A conversion leg recorded before this correction arrived: its cycles ICP
  // stays held (recorded) in the protocol fee account; its bonus ICP is no
  // longer credited and is recorded as undistributed.
  func legArrived(ctx : ProtocolFeeContext, n : Nat) {
    switch (ctx.store.dcLegs.take(n)) {
      case (?l) {
        ctx.store.cyclesHeldE8s += l.cyclesE8s;
        ctx.store.bonusUndistributedE8s += l.bonusE8s;
      };
      case null {};
    };
  };

  func setBatchStatus(store : ProtocolFeeStore, batchId : Nat, status : Types.DcBatchStatus) {
    if (batchId == 0) return;
    let size = store.batches.size();
    var i = 0;
    while (i < size) {
      let b = store.batches.at(i);
      if (b.id == batchId) {
        store.batches.put(i, { b with status });
        return;
      };
      i += 1;
    };
  };

  // --- Average price ---------------------------------------------------------

  // Records the reserves of every open pool (timer); keeps the last 60 minutes.
  public func recordPriceSamples(ctx : ProtocolFeeContext, now : Int) {
    for (pool in ctx.dex.pools.values()) {
      if (isOpen(pool)) {
        let samples = switch (ctx.store.priceSamples.get(pool.id)) {
          case (?l) l;
          case null {
            let l = List.empty<Types.PriceSample>();
            ctx.store.priceSamples.add(pool.id, l);
            l;
          };
        };
        samples.add({ at = now; reserve0 = pool.reserve0; reserve1 = pool.reserve1 });
        samples.retain(func(s : Types.PriceSample) : Bool = now - s.at <= AVERAGE_WINDOW_MAX_NS);
      };
    };
    // PTM-5: consolidated USD sample, same timer; samples older than 24 h go.
    switch (DexLib.consolidatedNow(ctx.dex, rateOf(ctx, now), now).price) {
      case (?price) { ctx.consolidated.samples.add({ at = now; priceUsdE8 = price }) };
      case null {};
    };
    ctx.consolidated.samples.retain(func(s : Types.ConsolidatedSample) : Bool = now - s.at <= Types.CONSOLIDATED_RETENTION_NS);
    // PTM-10a: pools-to-capitalisation ratio sample, same timer (only when the
    // ratio is available); samples older than 24 h go.
    switch (poolCapRatioView(ctx, now).currentRatio) {
      case (?ratio) { ctx.ratioSamples.samples.add({ at = now; ratio }) };
      case null {};
    };
    ctx.ratioSamples.samples.retain(func(s : Types.PoolCapRatioSample) : Bool = now - s.at <= Types.CONSOLIDATED_RETENTION_NS);
  };

  // PTM-10a: circulating TTTI-T (base units) = everything minted minus the
  // TTTI-T the contract keeps for auctions (the returned account).
  func circulatingTttiT(ctx : ProtocolFeeContext) : Nat {
    sat(IcrcLib.totalSupply(ctx.ledger), IcrcLib.balanceOf(ctx.ledger, IcrcLib.returnedAccount(ctx.canister)));
  };

  // PTM-10a: public indicators (pools value, capitalisation, ratios, m). The
  // capitalisation uses the fixed reference of 10 000 USD per TTTI-T, not a
  // price derived from the pools; the consolidated price is shown for
  // information only. Nothing is stored.
  public func poolCapRatioView(ctx : ProtocolFeeContext, now : Int) : Types.PoolCapRatioView {
    DexLib.poolCapRatioReport(ctx.dex, rateOf(ctx, now), circulatingTttiT(ctx), DexLib.consolidatedNow(ctx.dex, rateOf(ctx, now), now).price, ctx.ratioSamples.samples, now);
  };

  // PTM-5: hourly average of the consolidated TTTI-T price (USD x 1e8) used by
  // every reader of a TTTI-T price. Like referenceOut, null until the samples
  // cover 30 minutes; with no sample the reader waits.
  public func consolidatedReferenceUsd(ctx : ProtocolFeeContext, now : Int) : ?Nat {
    let w = DexLib.sampleWindow(ctx.consolidated.samples, now, Types.CONSOLIDATED_HOUR_NS);
    if (w.count == 0 or now - w.oldest < AVERAGE_WINDOW_MIN_NS) return null;
    switch (w.average) {
      case (?p) { if (p == 0) null else ?p };
      case null null;
    };
  };

  // TTTI-T in ICP e8s at the consolidated hourly price and the ICP rate.
  func tttiValueIcp(ctx : ProtocolFeeContext, amount : Nat, now : Int) : ?Nat {
    if (amount == 0) return ?0;
    switch (consolidatedReferenceUsd(ctx, now), payRate(ctx, #icp, now)) {
      case (?p, ?icpRate) { if (icpRate == 0) null else ?(amount * p / icpRate) };
      case _ null;
    };
  };

  // (USD e8 rate, decimals) of a pay token at the hourly rate.
  func dexRate(ctx : ProtocolFeeContext, token : DexTypes.DexToken, now : Int) : ?(Nat, Nat) {
    switch (RetryLib.dexPayToken(token)) {
      case (?pay) {
        switch (payRate(ctx, pay, now)) {
          case (?r) { if (r == 0) null else ?(r, PayTokenLib.expectedDecimals(pay).toNat()) };
          case null null;
        };
      };
      case null null;
    };
  };

  // Expected output of a swap between TTTI-T and another token at the
  // consolidated hourly price and the current rate of that token (no price
  // impact). null when the consolidated price or the rate is unavailable, or
  // when the swap does not involve TTTI-T exactly once.
  public func tttiExpectedOut(ctx : ProtocolFeeContext, tokenIn : DexTypes.DexToken, tokenOut : DexTypes.DexToken, amountIn : Nat, now : Int) : ?Nat {
    let p = switch (consolidatedReferenceUsd(ctx, now)) {
      case (?p) p;
      case null return null;
    };
    if (tokenIn == #tttiT and tokenOut != #tttiT) {
      switch (dexRate(ctx, tokenOut, now)) {
        case (?(rate, dec)) { ?(amountIn * p * 10 ** dec / (DexLib.USD_RATE_SCALE * rate)) };
        case null null;
      };
    } else if (tokenOut == #tttiT and tokenIn != #tttiT) {
      switch (dexRate(ctx, tokenIn, now)) {
        case (?(rate, dec)) { ?(amountIn * rate * DexLib.USD_RATE_SCALE / (10 ** dec * p)) };
        case null null;
      };
    } else null;
  };

  // Output of `amountIn` at the average of the samples of the last 60
  // minutes (no price impact); null until the samples cover 30 minutes.
  public func referenceOut(store : ProtocolFeeStore, poolId : Nat, zeroForOne : Bool, amountIn : Nat, now : Int) : ?Nat {
    let samples = switch (store.priceSamples.get(poolId)) {
      case (?l) l;
      case null return null;
    };
    var sum = 0;
    var count = 0;
    var oldest : Int = now;
    for (s in samples.values()) {
      let age = now - s.at;
      if (age >= 0 and age <= AVERAGE_WINDOW_MAX_NS) {
        let (rIn, rOut) = if (zeroForOne) (s.reserve0, s.reserve1) else (s.reserve1, s.reserve0);
        if (rIn > 0) {
          sum += amountIn * rOut / rIn;
          count += 1;
          if (s.at < oldest) oldest := s.at;
        };
      };
    };
    if (count == 0 or now - oldest < AVERAGE_WINDOW_MIN_NS) return null;
    ?(sum / count);
  };

  // --- Transfers (DC / DL) ---------------------------------------------------

  func dcKey(n : Nat) : Text = "DC-" # n.toText();

  func dlKey(owner : Principal) : Text = "DL-" # owner.toText();

  // Sends a recorded DC attempt under its lock. Ok / #Duplicate = completed;
  // known Err: a batch send is closed (#failed, ICP kept for the next batch),
  // a weekly send (batchId 0) gets a new attempt from the retry timer.
  func sendDc(ctx : ProtocolFeeContext, n : Nat) : async () {
    let send = switch (ctx.store.dcSends.get(n)) {
      case (?s) s;
      case null return;
    };
    if (send.status != #inProgress) return;
    let key = dcKey(n);
    if (ctx.locks.contains(key)) return;
    ctx.locks.add(key);
    let sending = { send.attempt with sends = send.attempt.sends + 1 };
    ctx.store.dcSends.add(n, { send with attempt = sending });
    let attempt = try { await RetryLib.sendPayDexAttempt(sending) } finally {
      ctx.locks.remove(key);
    };
    let current = ctx.store.dcSends.get(n) ?? send;
    if (current.status != #inProgress) {
      ctx.store.dcSends.add(n, { current with attempt });
      return;
    };
    switch (attempt.outcome) {
      case (#succeeded(block)) {
        ctx.store.dcSends.add(n, { current with attempt; status = #completed(block) });
        if (ctx.store.dcLegs.containsKey(n)) legArrived(ctx, n) else setBatchStatus(ctx.store, current.batchId, #sent(block));
      };
      case (#failed(text)) {
        // Weekly sends and conversion legs: the retry timer opens a new
        // attempt (the funds stay in their source account).
        if (current.batchId == 0 or ctx.store.dcLegs.containsKey(n)) {
          ctx.store.dcSends.add(n, { current with attempt });
        } else {
          // Cycles send: closed; the ICP stays held in the protocol fee
          // account for the next batch.
          ctx.store.dcSends.add(n, { current with attempt; status = #failed(text) });
          setBatchStatus(ctx.store, current.batchId, #failed(text));
          ctx.store.cyclesHeldE8s += attempt.request.amount + (attempt.request.fee ?? 0);
        };
      };
      case (_) {
        ctx.store.dcSends.add(n, { current with attempt });
      };
    };
  };

  func renewDc(ctx : ProtocolFeeContext, send : Types.DcSend) {
    let attempt = RetryLib.newDexAttempt(ctx.retry, #DC, ?send.attempt, send.attempt.request, RetryLib.dexNow());
    ctx.store.dcSends.add(send.n, { send with attempt; status = #inProgress });
  };

  // Sends a recorded DL claim under the owner's lock. Ok / #Duplicate =
  // claimed; known Err gives the amount back to the claimable bonus.
  func sendClaim(ctx : ProtocolFeeContext, n : Nat) : async ?Types.BonusClaim {
    let claim = switch (ctx.store.bonusClaims.get(n)) {
      case (?c) c;
      case null return null;
    };
    if (claim.status != #inProgress) return ?claim;
    let key = dlKey(claim.owner);
    if (ctx.locks.contains(key)) return ?claim;
    ctx.locks.add(key);
    let sending = { claim.attempt with sends = claim.attempt.sends + 1 };
    ctx.store.bonusClaims.add(n, { claim with attempt = sending });
    let attempt = try { await RetryLib.sendPayDexAttempt(sending) } finally {
      ctx.locks.remove(key);
    };
    let current = ctx.store.bonusClaims.get(n) ?? claim;
    if (current.status != #inProgress) {
      let kept = { current with attempt };
      ctx.store.bonusClaims.add(n, kept);
      return ?kept;
    };
    let status : DexTypes.DexTransferStatus = switch (attempt.outcome) {
      case (#succeeded(block)) {
        ctx.store.bonusClaimed.add(current.owner, (ctx.store.bonusClaimed.get(current.owner) ?? 0) + current.amountE8s);
        #completed(block);
      };
      case (#failed(text)) {
        addClaimable(ctx.store, current.owner, current.amountE8s);
        #failed(text);
      };
      case (_) { #inProgress };
    };
    let updated = { current with attempt; status };
    ctx.store.bonusClaims.add(n, updated);
    ?updated;
  };

  func renewClaim(ctx : ProtocolFeeContext, claim : Types.BonusClaim) {
    let attempt = RetryLib.newDexAttempt(ctx.retry, #DL, ?claim.attempt, claim.attempt.request, RetryLib.dexNow());
    ctx.store.bonusClaims.add(claim.n, { claim with attempt; status = #inProgress });
  };

  // --- Recycling and DC batches ----------------------------------------------

  // Resends recorded DC (history only: no new batch), DL and MF attempts
  // (10-minute retry rule). ICP held in cyclesHeldE8s stays recorded.
  public func runRetries(ctx : ProtocolFeeContext) : async () {
    let now = RetryLib.dexNow();
    for (send in ctx.store.dcSends.values().toArray().values()) {
      if (send.status == #inProgress and not ctx.locks.contains(dcKey(send.n))) {
        switch (RetryLib.dexAction(send.attempt, now)) {
          case (#resend) { await sendDc(ctx, send.n) };
          case (#newAttempt) {
            renewDc(ctx, send);
            await sendDc(ctx, send.n);
          };
          case (#needsReview) {
            ctx.store.dcSends.add(send.n, { send with status = #needsReview });
            setBatchStatus(ctx.store, send.batchId, #needsReview);
          };
          case (#done) {};
        };
      };
    };
    for (claim in ctx.store.bonusClaims.values().toArray().values()) {
      if (claim.status == #inProgress and not ctx.locks.contains(dlKey(claim.owner))) {
        switch (RetryLib.dexAction(claim.attempt, now)) {
          case (#resend) { ignore await sendClaim(ctx, claim.n) };
          case (#newAttempt) {
            renewClaim(ctx, claim);
            ignore await sendClaim(ctx, claim.n);
          };
          case (#needsReview) {
            ctx.store.bonusClaims.add(claim.n, { claim with status = #needsReview });
          };
          case (#done) {};
        };
      };
    };
    for (claim in ctx.mintFees.claims.values().toArray().values()) {
      if (claim.status == #inProgress and not ctx.locks.contains(mfKey(claim.owner, tokenKey(claim.token)))) {
        switch (RetryLib.nextAction(claim.attempt, now)) {
          case (#resend) { ignore await sendMintClaim(ctx, claim.n) };
          case (#newAttempt) {
            let attempt = RetryLib.newAttempt(ctx.retry, #MF, ?claim.attempt, claim.attempt.request, now);
            ctx.mintFees.claims.add(claim.n, { claim with attempt });
            ignore await sendMintClaim(ctx, claim.n);
          };
          case (#needsReview) {
            ctx.mintFees.claims.add(claim.n, { claim with status = #needsReview });
          };
          case (#done) {};
        };
      };
    };
  };

  // DC batches, newest first.
  public func batches(store : ProtocolFeeStore) : [DcBatch] {
    store.batches.reverseValues().toArray();
  };

  // --- DL bonus --------------------------------------------------------------

  // Weights of locked positions of TTTI-T pairs (all owners, or `only`).
  func weights(ctx : ProtocolFeeContext, only : ?Principal, now : Int) : [(Principal, Types.PositionBonusWeight)] {
    let out = List.empty<(Principal, Types.PositionBonusWeight)>();
    // PTM-9d: only the positions of the TTTI-T pairs, through the per-pool index.
    for ((_, pool) in ctx.dex.pools.entries()) {
      if (pool.kind == #tttiPair and pool.removedAt == null and pool.totalShares > 0) {
        for (pos in DexLib.positionsInPool(ctx.dex, pool.id).values()) {
          let matches = switch (only) {
            case (?o) pos.owner == o;
            case null true;
          };
          if (matches and pos.unlockAt > now) {
            let a0 = pos.shares * pool.reserve0 / pool.totalShares;
            let a1 = pos.shares * pool.reserve1 / pool.totalShares;
            let value = (valueIcp(ctx, pool.token0, a0, now) ?? 0) + (valueIcp(ctx, pool.token1, a1, now) ?? 0);
            let remaining = (pos.unlockAt - now).toNat();
            let weight = value * Nat.min(remaining, FIVE_YEARS_NS) / FIVE_YEARS_NS;
            out.add((pos.owner, { positionId = pos.id; poolId = pool.id; valueIcpE8s = value; remainingLockNs = remaining; weight }));
          };
        };
      };
    };
    out.toArray();
  };

  func claimView(c : Types.BonusClaim) : Types.BonusClaimView {
    { n = c.n; amountE8s = c.amountE8s; createdAt = c.createdAt; memoText = c.attempt.memo.decodeUtf8() ?? ""; status = c.status };
  };

  public func myBonus(ctx : ProtocolFeeContext, caller : Principal, now : Int) : LpBonusView {
    let positions = weights(ctx, ?caller, now).map(func((_, w) : (Principal, Types.PositionBonusWeight)) : Types.PositionBonusWeight = w);
    let claims = ctx.store.bonusClaims.values().filter(func(c : Types.BonusClaim) : Bool = c.owner == caller).map(claimView).toArray().sort(func(x : Types.BonusClaimView, y : Types.BonusClaimView) : { #less; #equal; #greater } = Nat.compare(y.n, x.n));
    {
      claimableE8s = ctx.store.bonusClaimable.get(caller) ?? 0;
      claimedE8s = ctx.store.bonusClaimed.get(caller) ?? 0;
      positions;
      claims;
    };
  };

  // Records the DL claim before the first await, then sends it.
  public func claimBonus(ctx : ProtocolFeeContext, caller : Principal) : async ClaimBonusResult {
    if (caller.isAnonymous()) return #err(#anonymous);
    if (ctx.locks.contains(dlKey(caller))) return #err(#claimInProgress);
    for (c in ctx.store.bonusClaims.values()) {
      if (c.owner == caller and (c.status == #inProgress or c.status == #needsReview)) return #err(#claimInProgress);
    };
    let amount = ctx.store.bonusClaimable.get(caller) ?? 0;
    if (amount == 0) return #err(#nothingToClaim);
    if (amount < MIN_CLAIM_E8S) return #err(#belowMinimum({ minimumE8s = MIN_CLAIM_E8S }));
    let fee = TreasuryLib.ICP_FEE;
    ctx.store.bonusClaimable.remove(caller);
    let attempt = RetryLib.newDexAttempt(
      ctx.retry,
      #DL,
      null,
      { token = #icp; from = protocolFeesAccount(ctx.canister); to = { owner = caller; subaccount = null }; amount = Nat.sub(amount, fee); fee = ?fee },
      RetryLib.dexNow(),
    );
    let claim : Types.BonusClaim = { n = attempt.n; owner = caller; amountE8s = amount; createdAt = Time.now(); attempt; status = #inProgress };
    ctx.store.bonusClaims.add(attempt.n, claim);
    let sent = (await sendClaim(ctx, attempt.n)) ?? claim;
    #ok(claimView(sent));
  };

  // --- Protocol liquidity (locked forever) -----------------------------------

  // Adds liquidity at the pool ratio with no swap; nothing on an empty or not
  // yet open pool. Shares rounded down, amounts used rounded up (in favour of
  // the pool). Returns the shares and the amounts used.
  public func addProtocolLiquidity(ctx : ProtocolFeeContext, poolId : Nat, amount0 : Nat, amount1 : Nat, fromTreasury : Bool, now : Int) : { #ok : { shares : Nat; used0 : Nat; used1 : Nat }; #err : Text } {
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?p) p;
      case null return #err("Unknown pool");
    };
    if (pool.status == #removed or pool.removedAt != null) return #err("Pool removed");
    if (pool.status != #active) return #err("Pool not yet open");
    if (pool.reserve0 == 0 or pool.reserve1 == 0 or pool.totalShares == 0) return #err("Empty pool");
    let shares = Nat.min(amount0 * pool.totalShares / pool.reserve0, amount1 * pool.totalShares / pool.reserve1);
    if (shares == 0) return #err("Amounts too small at the pool ratio");
    let used0 = ceilDiv(shares * pool.reserve0, pool.totalShares);
    let used1 = ceilDiv(shares * pool.reserve1, pool.totalShares);
    // PTM-10d: reserves change through DexLib.depositAtRatio (ratio-checked).
    let deposited = DexLib.depositAtRatio(ctx.dex, poolId, used0, used1);
    ctx.dex.pools.add(poolId, { deposited with totalShares = pool.totalShares + shares });
    let current : Types.ProtocolLiquidity = switch (ctx.store.protocolLiquidity.get(poolId)) {
      case (?l) l;
      case null { { poolId; shares = 0; fromFees0 = 0; fromFees1 = 0; fromTreasury0 = 0; fromTreasury1 = 0; lastAddedAt = null } };
    };
    ctx.store.protocolLiquidity.add(
      poolId,
      {
        current with
        shares = current.shares + shares;
        fromFees0 = current.fromFees0 + (if (fromTreasury) 0 else used0);
        fromFees1 = current.fromFees1 + (if (fromTreasury) 0 else used1);
        fromTreasury0 = current.fromTreasury0 + (if (fromTreasury) used0 else 0);
        fromTreasury1 = current.fromTreasury1 + (if (fromTreasury) used1 else 0);
        lastAddedAt = ?now;
      },
    );
    #ok({ shares; used0; used1 });
  };

  public func protocolLiquidity(ctx : ProtocolFeeContext) : [ProtocolLiquidityView] {
    ctx.store.protocolLiquidity.values().filterMap(
      func(l : Types.ProtocolLiquidity) : ?ProtocolLiquidityView {
        switch (ctx.dex.pools.get(l.poolId)) {
          case (?pool) {
            ?{
              poolId = l.poolId;
              token0Symbol = pool.token0.symbol;
              token1Symbol = pool.token1.symbol;
              shares = l.shares;
              totalShares = pool.totalShares;
              amount0 = if (pool.totalShares == 0) 0 else l.shares * pool.reserve0 / pool.totalShares;
              amount1 = if (pool.totalShares == 0) 0 else l.shares * pool.reserve1 / pool.totalShares;
              fromFees0 = l.fromFees0;
              fromFees1 = l.fromFees1;
              fromTreasury0 = l.fromTreasury0;
              fromTreasury1 = l.fromTreasury1;
              lastAddedAt = l.lastAddedAt;
            };
          };
          case null { null };
        };
      }
    ).toArray();
  };

  // --- Review (DC / DL / MF rows of "To review") -----------------------------

  func reviewRow(kind : RetryTypes.TransferKind, n : Nat, buyer : ?Principal, a : RetryTypes.DexTransferAttempt) : RetryTypes.TransferReview {
    {
      kind;
      purchaseId = n;
      block = null;
      collect = null;
      token = a.request.token;
      memoText = a.memo.decodeUtf8();
      memoHex = ?RetryLib.hex(a.memo);
      createdAtTimeNs = ?a.created_at_time;
      amount = a.request.amount;
      fee = a.request.fee;
      destination = ?a.request.to;
      sends = a.sends;
      lastError = a.lastError;
      buyer;
      depositIndex = null;
      conversionId = null;
      refundPurpose = null;
      outcome = ?a.outcome;
    };
  };

  func mfReviewRow(c : MintFeeTypes.MintFeeClaim) : RetryTypes.TransferReview {
    let a = c.attempt;
    {
      kind = #MF;
      purchaseId = c.n;
      block = null;
      collect = null;
      token = payDex(c.token);
      memoText = a.memo.decodeUtf8();
      memoHex = ?RetryLib.hex(a.memo);
      createdAtTimeNs = ?a.created_at_time;
      amount = a.request.amount;
      fee = a.request.fee;
      destination = ?a.request.to;
      sends = a.sends;
      lastError = a.lastError;
      buyer = ?c.owner;
      depositIndex = null;
      conversionId = null;
      refundPurpose = null;
      outcome = ?a.outcome;
    };
  };

  public func toReview(ctx : ProtocolFeeContext) : [RetryTypes.TransferReview] {
    let dc = ctx.store.dcSends.values().filter(func(s : Types.DcSend) : Bool = s.status == #needsReview).map(func(s : Types.DcSend) : RetryTypes.TransferReview = reviewRow(#DC, s.n, null, s.attempt)).toArray();
    let dl = ctx.store.bonusClaims.values().filter(func(c : Types.BonusClaim) : Bool = c.status == #needsReview).map(func(c : Types.BonusClaim) : RetryTypes.TransferReview = reviewRow(#DL, c.n, ?c.owner, c.attempt)).toArray();
    let mf = ctx.mintFees.claims.values().filter(func(c : MintFeeTypes.MintFeeClaim) : Bool = c.status == #needsReview).map(mfReviewRow).toArray();
    dc.concat(dl).concat(mf);
  };

  public func markArrived(ctx : ProtocolFeeContext, kind : RetryTypes.TransferKind, n : Nat, block : Nat) : RetryTypes.ReviewResult {
    switch (kind) {
      case (#DC) {
        let send = ctx.store.dcSends.get(n) ?? (return #err(#notFound));
        if (send.status != #needsReview) return #err(#notUnderReview);
        ctx.store.dcSends.add(n, { send with attempt = { send.attempt with outcome = #succeeded(block) }; status = #completed(block) });
        if (ctx.store.dcLegs.containsKey(n)) legArrived(ctx, n) else setBatchStatus(ctx.store, send.batchId, #sent(block));
        #ok(());
      };
      case (#DL) {
        let claim = ctx.store.bonusClaims.get(n) ?? (return #err(#notFound));
        if (claim.status != #needsReview) return #err(#notUnderReview);
        ctx.store.bonusClaims.add(n, { claim with attempt = { claim.attempt with outcome = #succeeded(block) }; status = #completed(block) });
        ctx.store.bonusClaimed.add(claim.owner, (ctx.store.bonusClaimed.get(claim.owner) ?? 0) + claim.amountE8s);
        #ok(());
      };
      case (#MF) {
        let claim = ctx.mintFees.claims.get(n) ?? (return #err(#notFound));
        if (claim.status != #needsReview) return #err(#notUnderReview);
        ctx.mintFees.claims.add(n, { claim with attempt = { claim.attempt with outcome = #succeeded(block) }; status = #completed(block) });
        let k = tokenKey(claim.token);
        setBalance(ctx.mintFees.claimed, claim.owner, k, balanceIn(ctx.mintFees.claimed, claim.owner, k) + claim.amount);
        #ok(());
      };
      case (_) { #err(#notApplicable) };
    };
  };

  // Not arrived: DC gets a new attempt (same destination, sent by the retry
  // timer); DL is closed and its amount returns to the claimable bonus.
  public func markNotArrived(ctx : ProtocolFeeContext, kind : RetryTypes.TransferKind, n : Nat) : RetryTypes.ReviewResult {
    switch (kind) {
      case (#DC) {
        let send = ctx.store.dcSends.get(n) ?? (return #err(#notFound));
        if (send.status != #needsReview) return #err(#notUnderReview);
        renewDc(ctx, send);
        setBatchStatus(ctx.store, send.batchId, #sending);
        #ok(());
      };
      case (#DL) {
        let claim = ctx.store.bonusClaims.get(n) ?? (return #err(#notFound));
        if (claim.status != #needsReview) return #err(#notUnderReview);
        let text = "Not arrived (admin check); amount returned to the claimable bonus";
        ctx.store.bonusClaims.add(n, { claim with attempt = { claim.attempt with outcome = #failed(text); lastError = ?text }; status = #failed(text) });
        addClaimable(ctx.store, claim.owner, claim.amountE8s);
        #ok(());
      };
      case (#MF) {
        let claim = ctx.mintFees.claims.get(n) ?? (return #err(#notFound));
        if (claim.status != #needsReview) return #err(#notUnderReview);
        let text = "Not arrived (admin check); amount returned to the claimable mint-fee balance";
        ctx.mintFees.claims.add(n, { claim with attempt = { claim.attempt with outcome = #failed(text); lastError = ?text }; status = #failed(text) });
        let k = tokenKey(claim.token);
        setBalance(ctx.mintFees.claimable, claim.owner, k, balanceIn(ctx.mintFees.claimable, claim.owner, k) + claim.amount);
        #ok(());
      };
      case (_) { #err(#notApplicable) };
    };
  };

  // Arms the price sample, retry and fee / injection timers (every
  // install and upgrade). No DC batch or weekly allocation timer.
  public func startTimers<system>(ctx : WeeklyContext) {
    ignore Timer.recurringTimer<system>(
      #seconds SAMPLE_INTERVAL_SECONDS,
      func() : async () { recordPriceSamples(ctx.fees, Time.now()) },
    );
    ignore Timer.recurringTimer<system>(
      #seconds RETRY_SECONDS,
      func() : async () { await runRetries(ctx.fees) },
    );
    ignore Timer.recurringTimer<system>(
      #seconds INJECTION_SECONDS,
      func() : async () {
        let now = Time.now();
        await setAsideRefusedDeposits(ctx.fees, now);
        for (poolId in ctx.fees.dex.pools.keys().toArray().values()) {
          splitPoolFees(ctx.fees, poolId, now);
        };
        markInterruptedInjections(ctx.fees);
      },
    );
  };

  // --- Legacy mint fee (1/101): LP claims, set-aside and injections -----------

  // Set-aside threshold: 0.001 TTTI-T = 10 USD (USD e8).
  public let SET_ASIDE_THRESHOLD_USD_E8 : Nat = 1_000_000_000;

  // TTTI-T account receiving the TTTI-T withdrawn from ICPSwap (the default
  // account of this canister is the TTTI-T minting account): canister +
  // 32-byte ASCII subaccount, distinct from every other subaccount.
  public let INJECTION_SUBACCOUNT : Blob = "DEX-INJECTION-TTTI-T-00000000001";
  // Dedicated legacy mint fee account (1/101 of earlier mints, all pay tokens): canister
  // + 32-byte ASCII subaccount, distinct from every other subaccount. Read-only:
  // no endpoint withdraws from it; MF claims and injections are paid from it.
  public let MINT_FEE_ACCOUNT_SUBACCOUNT : Blob = "MINT-FEE-ACCOUNT-TTTI-T-00000001";

  public type LockedAdd = { shares : Nat; used0 : Nat; used1 : Nat };

  // What injectPermanent needs (a ProtocolFeeContext satisfies it).
  public type InjectContext = {
    store : { protocolLiquidity : Map.Map<DexTypes.PoolId, Types.ProtocolLiquidity> };
    dex : DexTypes.DexStore;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
  };

  // What the reinjection of a removed pair needs (a ProtocolFeeContext satisfies it).
  public type ReinjectContext = {
    store : { protocolLiquidity : Map.Map<DexTypes.PoolId, Types.ProtocolLiquidity> };
    dex : DexTypes.DexStore;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    pause : DexReserveTypes.PauseState;
    permanent : Types.PermanentLiquidityStore;
  };

  func tokenKey(p : PayTypes.PayToken) : Text {
    switch (p) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  func mfKey(owner : Principal, k : Text) : Text = "MF-" # owner.toText() # "-" # k;

  func payRate(ctx : { oracle : OracleLib.OracleStore; tokenRates : OracleLib.TokenRateStore }, p : PayTypes.PayToken, now : Int) : ?Nat {
    OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, p), now);
  };

  // USD e8 rate of a pool token at the hourly rate. TTTI-T has no USD value
  // (no fixed price): null.
  public func rateOf(ctx : { oracle : OracleLib.OracleStore; tokenRates : OracleLib.TokenRateStore }, now : Int) : DexLib.UsdRateOf {
    func(token : DexTypes.PoolToken) : ?Nat {
      switch (DexLib.poolDexToken(token)) {
        case (?#tttiT) null;
        case (?t) {
          switch (RetryLib.dexPayToken(t)) {
            case (?pay) payRate(ctx, pay, now);
            case null null;
          };
        };
        case null null;
      };
    };
  };

  // ?true when TTTI-T is token0 of a TTTI-T/<p> pair, ?false when token1,
  // null for any other pair.
  func tttiSide(pool : DexTypes.Pool, p : PayTypes.PayToken) : ?Bool {
    if (pool.kind != #tttiPair) return null;
    let t : ?DexTypes.DexToken = ?payDex(p);
    let t0 = DexLib.poolDexToken(pool.token0);
    let t1 = DexLib.poolDexToken(pool.token1);
    if (t0 == ?#tttiT and t1 == t) ?true else if (t1 == ?#tttiT and t0 == t) ?false else null;
  };

  // USD depth of a TTTI-T pair (2 x the non-TTTI-T side at the hourly rate);
  // without a usable rate the pair counts as 0 (fed first). TTTI-T is never
  // valued at a fixed price.
  func poolUsd(pool : DexTypes.Pool, tttiIs0 : Bool, rate : DexLib.UsdRateOf) : Nat {
    ignore tttiIs0;
    switch (DexLib.poolDepth(pool, rate).usdE8) {
      case (?v) v;
      case null 0;
    };
  };

  func balanceIn(m : Map.Map<Principal, Map.Map<Text, Nat>>, owner : Principal, k : Text) : Nat {
    switch (m.get(owner)) {
      case (?inner) { inner.get(k) ?? 0 };
      case null { 0 };
    };
  };

  func setBalance(m : Map.Map<Principal, Map.Map<Text, Nat>>, owner : Principal, k : Text, v : Nat) {
    let inner = switch (m.get(owner)) {
      case (?i) i;
      case null {
        let i = Map.empty<Text, Nat>();
        m.add(owner, i);
        i;
      };
    };
    if (v == 0) { inner.remove(k) } else { inner.add(k, v) };
  };

  func setAsideOf(ctx : ProtocolFeeContext, p : PayTypes.PayToken) : MintFeeTypes.SetAside {
    ctx.mintFees.setAside.get(tokenKey(p)) ?? { token = p; amount = 0; totalReceived = 0; totalInjected = 0; lastInjectionAt = null };
  };

  func setAsideValue(ctx : ProtocolFeeContext, p : PayTypes.PayToken, amount : Nat, now : Int) : ?Nat {
    switch (payRate(ctx, p, now)) {
      case (?rate) { ?(amount * rate / 10 ** PayTokenLib.expectedDecimals(p).toNat()) };
      case null { null };
    };
  };

  // The lowest-liquidity TTTI-T/<token> pair (any TTTI-T pair of that pay
  // token, never other pairs, removed pools excluded); null when none exists.
  public func mintFeePool(ctx : ProtocolFeeContext, token : PayTypes.PayToken) : ?Nat {
    leastLiquidTttiPool(ctx.dex, rateOf(ctx, Time.now()), token);
  };

  // Selection rule shared with the router's 0.1 % redirect: the least liquid
  // TTTI-T/<token> pair by USD liquidity, removed pools excluded.
  public func leastLiquidTttiPool(dex : DexTypes.DexStore, rate : DexLib.UsdRateOf, token : PayTypes.PayToken) : ?Nat {
    var best : ?(Nat, Nat) = null;
    for (pool in dex.pools.values()) {
      if (pool.status != #removed and pool.removedAt == null and not underRemoval(dex, pool.id)) {
        switch (tttiSide(pool, token)) {
          case (?tttiIs0) {
            let usd = poolUsd(pool, tttiIs0, rate);
            switch (best) {
              case (?(_, b)) { if (usd < b) best := ?(pool.id, usd) };
              case null { best := ?(pool.id, usd) };
            };
          };
          case null {};
        };
      };
    };
    switch (best) {
      case (?(id, _)) ?id;
      case null null;
    };
  };

  func mintClaimView(c : MintFeeTypes.MintFeeClaim) : MintFeeTypes.MintFeeClaimView {
    { n = c.n; token = c.token; amount = c.amount; createdAt = c.createdAt; memoText = c.attempt.memo.decodeUtf8() ?? ""; status = c.status };
  };

  public func myMintFees(ctx : ProtocolFeeContext, caller : Principal) : MintFeeTypes.MintFeeLpView {
    let balances = PayTokenLib.ALL.map(
      func(p : PayTypes.PayToken) : MintFeeTypes.MintFeeBalance {
        let k = tokenKey(p);
        { token = p; claimable = balanceIn(ctx.mintFees.claimable, caller, k); claimed = balanceIn(ctx.mintFees.claimed, caller, k) };
      }
    );
    let claims = ctx.mintFees.claims.reverseEntries().filter(func((_, c) : (Nat, MintFeeTypes.MintFeeClaim)) : Bool = c.owner == caller).map(func((_, c) : (Nat, MintFeeTypes.MintFeeClaim)) : MintFeeTypes.MintFeeClaimView = mintClaimView(c)).toArray();
    { balances; claims };
  };

  // Sends a recorded MF claim under the owner/token lock. Ok / #Duplicate =
  // claimed; known Err gives the amount back to the claimable balance.
  func sendMintClaim(ctx : ProtocolFeeContext, n : Nat) : async ?MintFeeTypes.MintFeeClaim {
    let claim = ctx.mintFees.claims.get(n) ?? (return null);
    if (claim.status != #inProgress) return ?claim;
    let k = tokenKey(claim.token);
    let key = mfKey(claim.owner, k);
    if (ctx.locks.contains(key)) return ?claim;
    ctx.locks.add(key);
    let attempt = try {
      await RetryLib.send(PayTokenLib.ledger(claim.token), claim.attempt, TreasuryLib.transferErrorMessage);
    } finally {
      ctx.locks.remove(key);
    };
    let current = ctx.mintFees.claims.get(n) ?? claim;
    if (current.status != #inProgress) {
      let kept = { current with attempt };
      ctx.mintFees.claims.add(n, kept);
      return ?kept;
    };
    let status : MintFeeTypes.MintFeeClaimStatus = switch (attempt.outcome) {
      case (#succeeded(block)) {
        setBalance(ctx.mintFees.claimed, current.owner, k, balanceIn(ctx.mintFees.claimed, current.owner, k) + current.amount);
        #completed(block);
      };
      case (#failed(text)) {
        setBalance(ctx.mintFees.claimable, current.owner, k, balanceIn(ctx.mintFees.claimable, current.owner, k) + current.amount);
        #failed(text);
      };
      case (_) { #inProgress };
    };
    let updated = { current with attempt; status };
    ctx.mintFees.claims.add(n, updated);
    ?updated;
  };

  // Claims the caller's whole claimable balance of `token` (memo TTTI-MF-<n>,
  // lib/retry.mo rule), to the caller's default account. The claim (with
  // its created_at_time) is recorded before the first await; the ledger fee
  // is deducted from the amount sent.
  public func claimMintFee(ctx : ProtocolFeeContext, caller : Principal, token : PayTypes.PayToken) : async MintFeeTypes.ClaimMintFeeResult {
    if (caller.isAnonymous()) return #err(#anonymous);
    let k = tokenKey(token);
    if (ctx.locks.contains(mfKey(caller, k))) return #err(#claimInProgress);
    for (c in ctx.mintFees.claims.values()) {
      if (c.owner == caller and c.token == token and (c.status == #inProgress or c.status == #needsReview)) return #err(#claimInProgress);
    };
    let amount = balanceIn(ctx.mintFees.claimable, caller, k);
    if (amount == 0) return #err(#nothingToClaim);
    let fee = PayTokenLib.expectedFee(token);
    if (amount <= fee) return #err(#belowLedgerFee({ fee }));
    setBalance(ctx.mintFees.claimable, caller, k, 0);
    let attempt = RetryLib.newAttempt(
      ctx.retry,
      #MF,
      null,
      { token; from_subaccount = ?MINT_FEE_ACCOUNT_SUBACCOUNT; to = { owner = caller; subaccount = null }; amount = Nat.sub(amount, fee); fee = ?fee },
      RetryLib.dexNow(),
    );
    let claim : MintFeeTypes.MintFeeClaim = { n = attempt.n; owner = caller; token; amount; createdAt = Time.now(); attempt; status = #inProgress };
    ctx.mintFees.claims.add(attempt.n, claim);
    let sent = (await sendMintClaim(ctx, attempt.n)) ?? claim;
    #ok(mintClaimView(sent));
  };

  public func setAsideViews(ctx : ProtocolFeeContext, now : Int) : [MintFeeTypes.SetAsideView] {
    PayTokenLib.ALL.map(
      func(p : PayTypes.PayToken) : MintFeeTypes.SetAsideView {
        let sa = setAsideOf(ctx, p);
        {
          token = p;
          amount = sa.amount;
          valueUsdE8 = setAsideValue(ctx, p, sa.amount, now);
          thresholdUsdE8 = SET_ASIDE_THRESHOLD_USD_E8;
          totalReceived = sa.totalReceived;
          totalInjected = sa.totalInjected;
          lastInjectionAt = sa.lastInjectionAt;
          targetPoolId = mintFeePool(ctx, p);
        };
      }
    );
  };

  // Newest first; `limit` capped at 100.
  public func injections(ctx : ProtocolFeeContext, offset : Nat, limit : Nat) : MintFeeTypes.InjectionPage {
    let all = ctx.mintFees.injections.reverseEntries().map(func((_, i) : (Nat, MintFeeTypes.LiquidityInjection)) : MintFeeTypes.LiquidityInjection = i).toArray();
    let start = Nat.min(offset, all.size());
    let end = Nat.min(start + Nat.min(limit, 100), all.size());
    { items = all.sliceToArray(start, end); total = all.size(); offset };
  };

  func recordLiquidity(ctx : { store : { protocolLiquidity : Map.Map<DexTypes.PoolId, Types.ProtocolLiquidity> } }, poolId : Nat, used0 : Nat, used1 : Nat, shares : Nat, now : Int) {
    let current : Types.ProtocolLiquidity = switch (ctx.store.protocolLiquidity.get(poolId)) {
      case (?l) l;
      case null { { poolId; shares = 0; fromFees0 = 0; fromFees1 = 0; fromTreasury0 = 0; fromTreasury1 = 0; lastAddedAt = null } };
    };
    ctx.store.protocolLiquidity.add(
      poolId,
      {
        current with
        shares = current.shares + shares;
        fromFees0 = current.fromFees0 + used0;
        fromFees1 = current.fromFees1 + used1;
        lastAddedAt = ?now;
      },
    );
  };

  // --- PTM-4: protocol share split and permanent liquidity -------------------

  // A protocol share is split in two thirds for the creator (the remainder)
  // and one third (rounded down) for permanent liquidity: nothing is lost or
  // created.
  public func permanentPart(share : Nat) : Nat = share / 3;

  public func creatorPart(share : Nat) : Nat = share - share / 3;

  public func permanentAmount(store : Types.PermanentLiquidityStore, token : DexTypes.DexToken) : Nat {
    store.setAside.get(DexLib.tokenKey(token)) ?? 0;
  };

  public func setPermanentAmount(store : Types.PermanentLiquidityStore, token : DexTypes.DexToken, amount : Nat) {
    store.setAside.add(DexLib.tokenKey(token), amount);
  };

  // Appends one public journal entry (never rewritten).
  public func logPermanent(
    store : Types.PermanentLiquidityStore,
    kind : Types.PermanentKind,
    token : DexTypes.DexToken,
    amount : Nat,
    otherToken : ?DexTypes.DexToken,
    otherAmount : Nat,
    route : ?Types.PermanentRoute,
    poolId : ?Nat,
    shares : Nat,
    reason : ?Text,
    now : Int,
  ) {
    store.log.add({ id = store.nextLogId; at = now; kind; token; amount; otherToken; otherAmount; route; poolId; shares; reason });
    store.nextLogId += 1;
  };

  // A waiting or failed entry is written once per reason until progress is
  // made (clearPermanentWaiting), so a long wait does not fill the journal.
  public func logPermanentWaiting(store : Types.PermanentLiquidityStore, key : Text, kind : Types.PermanentKind, token : DexTypes.DexToken, amount : Nat, reason : Text, now : Int) {
    if (store.lastWaiting.get(key) == ?reason) return;
    store.lastWaiting.add(key, reason);
    logPermanent(store, kind, token, amount, null, 0, null, null, 0, ?reason, now);
  };

  public func clearPermanentWaiting(store : Types.PermanentLiquidityStore) {
    store.lastWaiting.clear();
  };

  // Sets aside the permanent third (tokens stay in the DEX custody).
  public func addPermanent(ctx : ProtocolFeeContext, token : DexTypes.DexToken, amount : Nat, poolId : ?Nat, now : Int) {
    if (amount == 0) return;
    setPermanentAmount(ctx.permanent, token, permanentAmount(ctx.permanent, token) + amount);
    logPermanent(ctx.permanent, #accrued, token, amount, null, 0, null, poolId, 0, null, now);
  };

  // Splits one protocol share of `token` (native swap fee or 0.1 % routed
  // fee): the creator part is credited, the permanent third is set aside.
  public func splitProtocolShare(ctx : ProtocolFeeContext, poolId : Nat, token : DexTypes.DexToken, share : Nat, source : CreatorFeesLib.CreatorFeeSource, now : Int) {
    if (share == 0) return;
    CreatorFeesLib.credit(ctx.creator, token, creatorPart(share), source, now);
    addPermanent(ctx, token, permanentPart(share), ?poolId, now);
  };

  func poolDexTokens(pool : DexTypes.Pool) : ?(DexTypes.DexToken, DexTypes.DexToken) {
    switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
      case (?a, ?b) ?(a, b);
      case _ null;
    };
  };

  // Native swap fee: the 30 % kept in protocolFee0/1 is split by
  // splitProtocolShare. Amounts accrued before PTM-4 follow the same rule
  // from now on: only the pool counters are reset (their tokens stay in the
  // DEX custody and move to the creator holdings and the set-aside), no
  // balance or block is rewritten.
  public func splitPoolFees(ctx : ProtocolFeeContext, poolId : Nat, now : Int) {
    if (ctx.pause.paused) return;
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?p) p;
      case null return;
    };
    let a0 = pool.protocolFee0;
    let a1 = pool.protocolFee1;
    if (a0 == 0 and a1 == 0) return;
    switch (poolDexTokens(pool)) {
      case (?(t0, t1)) {
        ctx.dex.pools.add(poolId, { pool with protocolFee0 = 0; protocolFee1 = 0 });
        splitProtocolShare(ctx, poolId, t0, a0, #swapFeeShare, now);
        splitProtocolShare(ctx, poolId, t1, a1, #swapFeeShare, now);
      };
      case null {};
    };
  };

  // Adds a0 / a1 (already in the DEX custody) to the pool as contract-held
  // locked shares at the pool ratio. Shares rounded down, used amounts
  // rounded up; the part beyond the ratio is not used (the caller keeps it
  // in the set-aside). Nobody can withdraw these shares.
  public func injectPermanent(ctx : InjectContext, poolId : Nat, a0 : Nat, a1 : Nat, now : Int) : LockedAdd {
    let none = { shares = 0; used0 = 0; used1 = 0 };
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?p) p;
      case null return none;
    };
    if (not isOpen(pool) or underRemoval(ctx.dex, poolId)) return none;
    let shares = Nat.min(a0 * pool.totalShares / pool.reserve0, a1 * pool.totalShares / pool.reserve1);
    if (shares == 0) return none;
    let used0 = Nat.min(a0, ceilDiv(shares * pool.reserve0, pool.totalShares));
    let used1 = Nat.min(a1, ceilDiv(shares * pool.reserve1, pool.totalShares));
    // PTM-10d: reserves change through DexLib.depositAtRatio (ratio-checked).
    let deposited = DexLib.depositAtRatio(ctx.dex, poolId, used0, used1);
    ctx.dex.pools.add(
      poolId,
      {
        deposited with
        totalShares = pool.totalShares + shares;
        lockedShares = pool.lockedShares + shares;
      },
    );
    recordLiquidity(ctx, poolId, used0, used1, shares, now);
    ignore DexLib.refreshOpening(ctx.dex, poolId, rateOf(ctx, now));
    { shares; used0; used1 };
  };

  // PTM-9b: reinjection of the permanent liquidity of a removed TTTI-T pair.
  // The reserves of the contract-held shares of the removed pool (never a
  // wallet's) leave that pool (DexLib.releaseContractReserves) and enter the
  // permanent set-aside (tokens stay in the DEX custody, as for every other
  // permanent amount). When the least liquid other open TTTI-T pool shares the
  // removed pair's counter token, they are injected at once with
  // injectPermanent and a public #injected line; what is not used, or the whole
  // amount when no such pool exists, stays in the set-aside with a public
  // #waiting line and is balanced and injected by the router run. Nothing is
  // lost and no existing balance or block is rewritten. Does nothing while the
  // DEX is paused or when the pool has nothing left to release (idempotent).
  public func reinjectRemovedPool(ctx : ReinjectContext, poolId : Nat, now : Int) {
    if (ctx.pause.paused) return;
    let released = switch (DexLib.releaseContractReserves(ctx.dex, poolId)) {
      case (?r) r;
      case null return;
    };
    let store = ctx.permanent;
    let pair = DexLib.tokenSymbol(released.token0) # "/" # DexLib.tokenSymbol(released.token1);
    let head = "Pair removal " # pair # " (pool #" # poolId.toText() # "): ";
    setPermanentAmount(store, released.token0, permanentAmount(store, released.token0) + released.amount0);
    setPermanentAmount(store, released.token1, permanentAmount(store, released.token1) + released.amount1);
    let tttiIs0 = released.token0 == #tttiT;
    let counter = if (tttiIs0) released.token1 else released.token0;
    let (aT, aX) = if (tttiIs0) (released.amount0, released.amount1) else (released.amount1, released.amount0);
    switch (feedTarget(ctx.dex, rateOf(ctx, now))) {
      case null {
        logPermanent(store, #waiting, #tttiT, aT, ?counter, aX, null, ?poolId, released.shares, ?(head # "no other open TTTI-T pool; reserves wait in the set-aside"), now);
      };
      case (?(target, targetTttiIs0)) {
        let second = switch (DexLib.poolDexToken(if (targetTttiIs0) target.token1 else target.token0)) {
          case (?t) t;
          case null {
            logPermanent(store, #waiting, #tttiT, aT, ?counter, aX, null, ?poolId, released.shares, ?(head # "target pool has an unknown token; reserves wait in the set-aside"), now);
            return;
          };
        };
        if (second != counter) {
          logPermanent(store, #waiting, #tttiT, aT, ?counter, aX, null, ?poolId, released.shares, ?(head # "the least liquid TTTI-T pool pairs with " # DexLib.tokenSymbol(second) # "; reserves wait in the set-aside for the router balance"), now);
          return;
        };
        let (a0, a1) = if (targetTttiIs0) (aT, aX) else (aX, aT);
        let added = injectPermanent(ctx, target.id, a0, a1, now);
        if (added.shares == 0) {
          logPermanent(store, #waiting, #tttiT, aT, ?counter, aX, null, ?poolId, released.shares, ?(head # "injection into pool #" # target.id.toText() # " refused; reserves wait in the set-aside"), now);
          return;
        };
        let (usedT, usedX) = if (targetTttiIs0) (added.used0, added.used1) else (added.used1, added.used0);
        setPermanentAmount(store, #tttiT, sat(permanentAmount(store, #tttiT), usedT));
        setPermanentAmount(store, counter, sat(permanentAmount(store, counter), usedX));
        logPermanent(store, #injected, #tttiT, usedT, ?counter, usedX, null, ?target.id, added.shares, ?(head # "reserves of the contract-held shares reinjected into pool #" # target.id.toText()), now);
        if (aT > usedT or aX > usedX) {
          logPermanent(store, #waiting, #tttiT, sat(aT, usedT), ?counter, sat(aX, usedX), null, ?poolId, 0, ?(head # "the part beyond the pool ratio waits in the set-aside"), now);
        };
      };
    };
  };

  // Reinjects every removed TTTI-T pool that still holds contract-held shares
  // (retry of a removal whose reinjection did not run yet). Called by the
  // router run before the permanent liquidity balance.
  public func reinjectRemovedPools(ctx : ReinjectContext, now : Int) {
    for (pool in ctx.dex.pools.values().toArray().values()) {
      if (pool.status == #removed and pool.kind == #tttiPair and pool.lockedShares > 0) {
        reinjectRemovedPool(ctx, pool.id, now);
      };
    };
  };

  // Value in ICP e8s at the hourly average price; null when unknown (no
  // pool, no samples). PTM-5: TTTI-T is valued at the consolidated hourly
  // price (USD) divided by the ICP rate, never through one pool.
  public func valueIcpDex(ctx : ProtocolFeeContext, token : DexTypes.DexToken, amount : Nat, now : Int) : ?Nat {
    if (amount == 0) return ?0;
    switch (token) {
      case (#icp) ?amount;
      case (#tttiT) tttiValueIcp(ctx, amount, now);
      case _ {
        for (pool in ctx.dex.pools.values()) {
          if (isOpen(pool)) {
            switch (poolDexTokens(pool)) {
              case (?(a, b)) {
                if (a == token and b == #icp) return referenceOut(ctx.store, pool.id, true, amount, now);
                if (b == token and a == #icp) return referenceOut(ctx.store, pool.id, false, amount, now);
              };
              case null {};
            };
          };
        };
        null;
      };
    };
  };

  // Newest first; `limit` capped at 100.
  public func listPermanentLog(store : Types.PermanentLiquidityStore, offset : Nat, limit : Nat) : Types.PermanentLogPage {
    let total = store.log.size();
    let start = Nat.min(offset, total);
    let end = Nat.min(start + Nat.min(limit, 100), total);
    let entries = Array.tabulate(end - start, func(i : Nat) : Types.PermanentLogEntry = store.log.at(total - 1 - (start + i)));
    { total; entries };
  };

  public func permanentSummary(ctx : ProtocolFeeContext, now : Int) : Types.PermanentSummary {
    let rate = rateOf(ctx, now);
    let pools = List.empty<Types.PermanentPoolSummary>();
    var totalLocked = 0;
    for (pool in ctx.dex.pools.values()) {
      if (pool.lockedShares > 0 and pool.totalShares > 0) {
        totalLocked += pool.lockedShares;
        let depth = DexLib.poolDepth(pool, rate);
        pools.add({
          poolId = pool.id;
          token0Symbol = pool.token0.symbol;
          token1Symbol = pool.token1.symbol;
          lockedShares = pool.lockedShares;
          totalShares = pool.totalShares;
          amount0 = pool.reserve0 * pool.lockedShares / pool.totalShares;
          amount1 = pool.reserve1 * pool.lockedShares / pool.totalShares;
          valueUsdE8 = switch (depth.usdE8) {
            case (?v) ?(v * pool.lockedShares / pool.totalShares);
            case null null;
          };
        });
      };
    };
    var setAsideValue : Nat = 0;
    let views = DexLib.DEX_TOKENS.map(
      func(t : DexTypes.DexToken) : Types.PermanentSetAsideView {
        let amount = permanentAmount(ctx.permanent, t);
        let value = valueIcpDex(ctx, t, amount, now);
        switch (value) {
          case (?v) { setAsideValue += v };
          case null {};
        };
        { token = t; symbol = DexLib.tokenSymbol(t); amount; valueIcpE8s = value };
      }
    );
    {
      pools = pools.toArray();
      totalLockedShares = totalLocked;
      setAside = views;
      setAsideValueIcpE8s = setAsideValue;
      thresholdIcpE8s = DC_THRESHOLD_E8S;
      maxDeviationBps = DC_MAX_DEVIATION_BPS;
      targetPoolId = switch (feedTarget(ctx.dex, rate)) {
        case (?(pool, _)) ?pool.id;
        case null null;
      };
    };
  };

  // The old set-aside injection of the mint fee revenue no longer runs: an
  // injection interrupted by an upgrade goes to review, nothing else changes.
  public func markInterruptedInjections(ctx : ProtocolFeeContext) {
    for (inj in ctx.mintFees.injections.values().toArray().values()) {
      switch (inj.status) {
        case (#swapping) {
          ctx.mintFees.injections.add(inj.id, { inj with status = #needsReview; error = ?"Interrupted; the old injection no longer runs"; updatedAt = Time.now() });
        };
        case (#addingLiquidity) {
          ctx.mintFees.injections.add(inj.id, { inj with status = #needsReview; error = ?"Interrupted; the old injection no longer runs"; updatedAt = Time.now() });
        };
        case _ {};
      };
    };
  };

  // Open TTTI-T pair with the least USD liquidity (same rule as the router's
  // redirect) and whether TTTI-T is its token0; null while none is open.
  public func feedTarget(dex : DexTypes.DexStore, rate : DexLib.UsdRateOf) : ?(DexTypes.Pool, Bool) {
    var best : ?(DexTypes.Pool, Bool, Nat) = null;
    for (pool in dex.pools.values()) {
      if (isOpen(pool) and pool.kind == #tttiPair and not underRemoval(dex, pool.id)) {
        let tttiIs0 = DexLib.poolDexToken(pool.token0) == ?#tttiT;
        let tttiIs1 = DexLib.poolDexToken(pool.token1) == ?#tttiT;
        if (tttiIs0 or tttiIs1) {
          let usd = poolUsd(pool, tttiIs0, rate);
          switch (best) {
            case (?(_, _, b)) { if (usd < b) best := ?(pool, tttiIs0, usd) };
            case null { best := ?(pool, tttiIs0, usd) };
          };
        };
      };
    };
    switch (best) {
      case (?(pool, tttiIs0, _)) ?(pool, tttiIs0);
      case null null;
    };
  };

  // PTM-11b: a refused pair-request deposit, whatever token it was paid in
  // (ICP, ckBTC, ckUSDC, ckUSDT, or TTTI-T for requests made before PTM-10c),
  // never touches a pool: it is moved from the request deposit account of its
  // token to the DEX custody account of that token (RD attempt, memo
  // TTTI-RD-<request number>, minus one ledger fee) and counted in the
  // permanent liquidity set-aside, with a public journal line. The router then
  // rebalances it with the rest of the set-aside (best route, at most 2 %
  // below the hourly average) and injectPermanent adds it at the pool ratio.
  // The protocol creates no TTTI-T and places no price-linked order. The
  // outcome of the move and the set-aside credit are recorded in the same
  // step, and a request with `setAsideAt` is skipped, so each deposit is
  // counted exactly once, across retries and upgrades. An unknown outcome of
  // an external ledger is resent identically within 23 h (the ledger
  // deduplicates it); later it stays in review and the amount stays held in
  // the request deposit account. The TTTI-T ledger is in-process: its outcome
  // is known at once. A request deposited in TTTI-T has no PairPayDeposit
  // record: one is created (token #tttiT) when its move starts. Feeds already
  // recorded in refusedFeeds are history and are not moved again.
  public func setAsideRefusedDeposits(ctx : ProtocolFeeContext, now : Int) : async () {
    if (ctx.pause.paused) return;
    let lockKey = "RD-SETASIDE";
    if (not RetryLib.tryLock(ctx.locks, lockKey)) return;
    try {
      for (request in ctx.dex.requests.values().toArray().values()) {
        switch (pendingSetAside(ctx, request)) {
          case (?payment) { await moveRefusedDeposit(ctx, request, payment, now) };
          case null {};
        };
      };
    } catch (_) {} finally {
      RetryLib.unlock(ctx.locks, lockKey);
    };
  };

  // What setAsideRefusedDeposits needs to select a request (pure).
  public type SetAsideSelection = {
    payments : Map.Map<Nat, RetryTypes.PairPayDeposit>;
    refusedFeeds : Map.Map<DexTypes.RequestId, DexTypes.RefusedDepositFeed>;
  };

  // The payment record to move for a refused request without refund that is
  // not yet set aside, or null. A request without a record was deposited in
  // TTTI-T: it gets a record unless a legacy feed already covers it.
  public func pendingSetAside(ctx : SetAsideSelection, request : DexTypes.PairRequest) : ?RetryTypes.PairPayDeposit {
    let refused = switch (request.status) {
      case (#refused(_)) true;
      case (_) false;
    };
    if (not refused or request.refundStatus != #none or request.refundBlock != null) return null;
    switch (ctx.payments.get(request.id)) {
      case (?payment) {
        if (payment.setAsideAt == null) ?payment else null;
      };
      case null {
        if (ctx.refusedFeeds.get(request.id) != null) null else ?{
          requestId = request.id;
          token = #tttiT;
          setAside = null;
          setAsideAt = null;
        };
      };
    };
  };

  // One in-process TTTI-T move of a recorded attempt (sends already counted);
  // returns the attempt with its outcome. Same request fields as the external
  // ledgers: amount delivered, fee charged on top.
  func sendTttiMove(ctx : ProtocolFeeContext, a : RetryTypes.DexTransferAttempt) : RetryTypes.DexTransferAttempt {
    let r = a.request;
    let fee = r.fee ?? IcrcLib.fee(ctx.ledger);
    switch (
      IcrcLib.transfer(
        ctx.ledger,
        ctx.canister,
        ctx.canister,
        {
          from_subaccount = r.from.subaccount;
          to = r.to;
          amount = r.amount;
          fee = ?fee;
          memo = ?a.memo;
          created_at_time = ?a.created_at_time;
        },
      )
    ) {
      case (#Ok(block)) { { a with outcome = #succeeded(block) } };
      case (#Err(#Duplicate({ duplicate_of }))) { { a with outcome = #succeeded(duplicate_of) } };
      case (#Err(err)) {
        let text = "The TTTI-T ledger refused the move: " # debug_show (err);
        { a with outcome = #failed(text); lastError = ?text };
      };
    };
  };

  func moveRefusedDeposit(ctx : ProtocolFeeContext, request : DexTypes.PairRequest, payment : RetryTypes.PairPayDeposit, now : Int) : async () {
    let fee = switch (RetryLib.dexPayToken(payment.token)) {
      case (?pay) PayTokenLib.expectedFee(pay);
      case null IcrcLib.fee(ctx.ledger);
    };
    if (request.depositAmount <= fee) return;
    let transferRequest : RetryTypes.DexTransferRequest = {
      token = payment.token;
      from = DexLib.requestDepositAccountOf(ctx.canister, payment.token);
      to = DexLib.custodyAccount(ctx.canister, payment.token);
      amount = Nat.sub(request.depositAmount, fee);
      fee = ?fee;
    };
    let nowNat = RetryLib.dexNow();
    let attempt = switch (payment.setAside) {
      case null { RetryLib.newDepositMoveAttempt(request.id, null, transferRequest, nowNat) };
      case (?existing) {
        switch (RetryLib.dexAction(existing, nowNat)) {
          case (#done) {
            switch (existing.outcome) {
              case (#succeeded(_)) {
                creditSetAside(ctx, request.id, payment, existing, now);
              };
              case (_) {};
            };
            return;
          };
          case (#needsReview) {
            logPermanentWaiting(ctx.permanent, "rd/" # request.id.toText(), #waiting, payment.token, existing.request.amount, "Refused pair-request deposit " # request.id.toText() # ": the move to the set-aside needs review", now);
            return;
          };
          case (#resend) { existing };
          case (#newAttempt) { RetryLib.newDepositMoveAttempt(request.id, ?existing, transferRequest, nowNat) };
        };
      };
    };
    let sending = { attempt with sends = attempt.sends + 1 };
    ctx.payments.add(request.id, { payment with setAside = ?sending });
    let sent = if (payment.token == #tttiT) { sendTttiMove(ctx, sending) } else {
      await RetryLib.sendPayDexAttempt(sending);
    };
    switch (sent.outcome) {
      case (#succeeded(_)) {
        creditSetAside(ctx, request.id, payment, sent, now);
      };
      case (_) {
        ctx.payments.add(request.id, { payment with setAside = ?sent });
      };
    };
  };

  public type SetAsideCredit = {
    payments : Map.Map<Nat, RetryTypes.PairPayDeposit>;
    permanent : Types.PermanentLiquidityStore;
  };

  // Records the successful move and counts the amount in the set-aside in one
  // synchronous step. Does nothing when the request is already set aside (the
  // passed or the stored record), so a retry or an unknown outcome resolved
  // later never counts the amount twice.
  public func creditSetAside(ctx : SetAsideCredit, requestId : Nat, payment : RetryTypes.PairPayDeposit, attempt : RetryTypes.DexTransferAttempt, now : Int) {
    switch (ctx.payments.get(requestId)) {
      case (?stored) { if (stored.setAsideAt != null) return };
      case null {};
    };
    if (payment.setAsideAt != null) return;
    ctx.payments.add(requestId, { payment with setAside = ?attempt; setAsideAt = ?now });
    let amount = attempt.request.amount;
    setPermanentAmount(ctx.permanent, payment.token, permanentAmount(ctx.permanent, payment.token) + amount);
    logPermanent(ctx.permanent, #accrued, payment.token, amount, null, 0, null, null, 0, ?("Refused pair-request deposit " # requestId.toText() # " (kept deposit, paid in " # DexLib.tokenSymbol(payment.token) # ")"), now);
  };
};
