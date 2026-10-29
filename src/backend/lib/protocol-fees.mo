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
import IcpSwapLib "icpswap";
import MintFeeTypes "../types/mint-fee";
import PayTypes "../types/pay-token";

// Native swap fees: 70 % stays in the reserves (LPs), 30 % is added to the
// same pool as permanent locked liquidity (recyclePoolFees); nothing goes to
// cycles. DC batches, the dynamic cycles share, the DL bonus credited from
// swap fees and the weekly allocation no longer run: DC batches stay as
// read-only history, already-earned DL bonuses stay claimable, ICP held in
// cyclesHeldE8s stays recorded. Mint fee (1/101) routing, LP mint-fee claims
// (memo TTTI-MF-<n>), set-aside amounts and liquidity injections. Transfers
// use lib/retry.mo (created_at_time, identical resend for 23 h, then To review).
module {
  public type ProtocolFeeStore = Types.ProtocolFeeStore;
  public type FeeBuckets = Types.FeeBuckets;
  public type DcBatch = Types.DcBatch;
  public type BonusDistribution = Types.BonusDistribution;
  public type ProtocolLiquidityView = Types.ProtocolLiquidityView;
  public type LpBonusView = Types.LpBonusView;
  public type ClaimBonusResult = Types.ClaimBonusResult;

  // --- Constants (code, not admin-settable) ----------------------------------

  // Recycling: a fixed 10 % of the 20 % protocol share (bps of that share).
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

  let BPS : Nat = 10_000;
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
    // Refused pair-request deposits already fed to the protocol liquidity
    // (keyed by pair request id; stable, so each deposit counts exactly once).
    refusedFeeds : Map.Map<DexTypes.RequestId, DexTypes.RefusedDepositFeed>;
    // DEX lot 6 pause: automatic fee, injection and recycling processing skips while paused.
    pause : DexReserveTypes.PauseState;
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
  func valueIcp(ctx : ProtocolFeeContext, token : DexTypes.PoolToken, amount : Nat, now : Int) : ?Nat {
    if (amount == 0) return ?0;
    if (isIcp(token)) return ?amount;
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

  // Adds the recycle buckets as protocol liquidity at the pool ratio; the
  // part beyond the ratio waits in the bucket.
  func recycleFees(ctx : ProtocolFeeContext, now : Int) {
    if (ctx.pause.paused) return;
    for ((poolId, b) in ctx.store.buckets.entries().toArray().values()) {
      if (b.recycle0 > 0 and b.recycle1 > 0) {
        switch (addProtocolLiquidity(ctx, poolId, b.recycle0, b.recycle1, false, now)) {
          case (#ok(r)) {
            let fresh = bucketsOf(ctx.store, poolId);
            ctx.store.buckets.add(poolId, { fresh with recycle0 = sat(fresh.recycle0, r.used0); recycle1 = sat(fresh.recycle1, r.used1) });
          };
          case (#err(_)) {};
        };
      };
    };
  };

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
    for (pos in ctx.dex.positions.values()) {
      let matches = switch (only) {
        case (?o) pos.owner == o;
        case null true;
      };
      if (matches and pos.unlockAt > now) {
        switch (ctx.dex.pools.get(pos.poolId)) {
          case (?pool) {
            if (pool.kind == #tttiPair and pool.removedAt == null and pool.totalShares > 0) {
              let a0 = pos.shares * pool.reserve0 / pool.totalShares;
              let a1 = pos.shares * pool.reserve1 / pool.totalShares;
              let value = (valueIcp(ctx, pool.token0, a0, now) ?? 0) + (valueIcp(ctx, pool.token1, a1, now) ?? 0);
              let remaining = (pos.unlockAt - now).toNat();
              let weight = value * Nat.min(remaining, FIVE_YEARS_NS) / FIVE_YEARS_NS;
              out.add((pos.owner, { positionId = pos.id; poolId = pool.id; valueIcpE8s = value; remainingLockNs = remaining; weight }));
            };
          };
          case null {};
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
    ctx.dex.pools.add(poolId, { pool with reserve0 = pool.reserve0 + used0; reserve1 = pool.reserve1 + used1; totalShares = pool.totalShares + shares });
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

  // Arms the price sample, retry and fee-recycling / injection timers (every
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
        feedRefusedDeposits(ctx.fees, now);
        for (poolId in ctx.fees.dex.pools.keys().toArray().values()) {
          recyclePoolFees(ctx.fees, poolId, now);
        };
        recycleFees(ctx.fees, now);
        await runInjections(ctx.fees, now);
      },
    );
  };

  // --- Mint fee routing (1/101), LP claims, set-aside and injections ---------

  // Set-aside threshold: 0.001 TTTI-T = 10 USD (USD e8).
  public let SET_ASIDE_THRESHOLD_USD_E8 : Nat = 1_000_000_000;
  // Bounded slippage of the injection swap (bps).
  public let INJECTION_MAX_SLIPPAGE_BPS : Nat = 100;

  // TTTI-T account receiving the TTTI-T withdrawn from ICPSwap (the default
  // account of this canister is the TTTI-T minting account): canister +
  // 32-byte ASCII subaccount, distinct from every other subaccount.
  public let INJECTION_SUBACCOUNT : Blob = "DEX-INJECTION-TTTI-T-00000000001";
  // Dedicated mint fee account (1/101 of every mint, all pay tokens): canister
  // + 32-byte ASCII subaccount, distinct from every other subaccount. Read-only:
  // no endpoint withdraws from it; MF claims and injections are paid from it.
  public let MINT_FEE_ACCOUNT_SUBACCOUNT : Blob = "MINT-FEE-ACCOUNT-TTTI-T-00000001";
  let INJECTIONS_LOCK : Text = "MF-INJECTIONS";

  type LockedAdd = { shares : Nat; used0 : Nat; used1 : Nat };
  type InjectionPlan = { amountIn : Nat; swapAmountIn : Nat; pairAmountIn : Nat };

  func tokenKey(p : PayTypes.PayToken) : Text {
    switch (p) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  func mfKey(owner : Principal, k : Text) : Text = "MF-" # owner.toText() # "-" # k;

  func payRate(ctx : ProtocolFeeContext, p : PayTypes.PayToken, now : Int) : ?Nat {
    OracleLib.usableRate(OracleLib.storeFor(ctx.oracle, ctx.tokenRates, p), now);
  };

  // USD e8 rate of a pool token: TTTI-T fixed, others at the hourly rate.
  public func rateOf(ctx : ProtocolFeeContext, now : Int) : DexLib.UsdRateOf {
    func(token : DexTypes.PoolToken) : ?Nat {
      switch (DexLib.poolDexToken(token)) {
        case (?#tttiT) ?DexLib.TTTI_T_USD_E8;
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

  // USD liquidity of a TTTI-T pair; without a usable rate, twice the TTTI-T side.
  func poolUsd(pool : DexTypes.Pool, tttiIs0 : Bool, rate : DexLib.UsdRateOf) : Nat {
    switch (DexLib.usdGauge(pool, rate).currentUsdE8) {
      case (?v) v;
      case null {
        let r = if (tttiIs0) pool.reserve0 else pool.reserve1;
        2 * r * DexLib.TTTI_T_USD_E8 / 100_000_000;
      };
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

  // Adds to the waiting set-aside amount (`received`: new mint-fee income).
  func addSetAside(ctx : ProtocolFeeContext, p : PayTypes.PayToken, amount : Nat, received : Bool) {
    if (amount == 0) return;
    let sa = setAsideOf(ctx, p);
    ctx.mintFees.setAside.add(tokenKey(p), { sa with amount = sa.amount + amount; totalReceived = sa.totalReceived + (if (received) amount else 0) });
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
      if (pool.status != #removed and pool.removedAt == null) {
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

  // Called by lib/presale.mo once a mint is delivered, with the paid token
  // and the 1/101 fee (held in the canister default account of that token).
  // Synchronous accounting only: half A to LP claimable balances pro rata to
  // position shares (set-aside when no LP), half B to set-aside.
  public func routeMintFee(ctx : ProtocolFeeContext, token : PayTypes.PayToken, feeAmount : Nat, conversionId : Nat, now : Int) : MintFeeTypes.MintFeeRouting {
    let halfA = feeAmount / 2;
    let halfB = sat(feeAmount, halfA);
    let poolId = mintFeePool(ctx, token);
    let k = tokenKey(token);
    var toLps = 0;
    let owners = Set.empty<Principal>();
    switch (poolId) {
      case (?id) {
        // Position shares only: the contract-held locked shares have no position.
        var total = 0;
        for (pos in ctx.dex.positions.values()) {
          if (pos.poolId == id) total += pos.shares;
        };
        if (total > 0 and halfA > 0) {
          for (pos in ctx.dex.positions.values()) {
            if (pos.poolId == id and pos.shares > 0) {
              let share = halfA * pos.shares / total;
              if (share > 0) {
                setBalance(ctx.mintFees.claimable, pos.owner, k, balanceIn(ctx.mintFees.claimable, pos.owner, k) + share);
                toLps += share;
                owners.add(pos.owner);
              };
            };
          };
        };
      };
      case null {};
    };
    // Half B, half A without LP and rounding remainders.
    let toSetAside = sat(feeAmount, toLps);
    addSetAside(ctx, token, toSetAside, true);
    let id = if (ctx.mintFees.nextRoutingId == 0) 1 else ctx.mintFees.nextRoutingId;
    ctx.mintFees.nextRoutingId := id + 1;
    let routing : MintFeeTypes.MintFeeRouting = {
      id;
      at = now;
      conversionId;
      token;
      poolId;
      feeAmount;
      halfA;
      halfB;
      toLps;
      toSetAside;
      lpCount = owners.size();
    };
    ctx.mintFees.routings.add(routing);
    routing;
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

  // --- Injections ------------------------------------------------------------

  func poolAccount(ctx : ProtocolFeeContext, pool : DexTypes.Pool) : Types.Account {
    { owner = ctx.canister; subaccount = ?pool.subaccount };
  };

  func memoOf(a : RetryTypes.DexTransferAttempt) : Text = a.memo.decodeUtf8() ?? "";

  // One recorded pay-token move from the dedicated fee account (memo
  // TTTI-MF-<n>, created_at_time), sent once; the outcome stays on the
  // injection record.
  func payMove(ctx : ProtocolFeeContext, p : PayTypes.PayToken, to : Types.Account, amount : Nat) : async RetryTypes.DexTransferAttempt {
    let fee = PayTokenLib.expectedFee(p);
    let a = RetryLib.newDexAttempt(ctx.retry, #MF, null, { token = payDex(p); from = { owner = ctx.canister; subaccount = ?MINT_FEE_ACCOUNT_SUBACCOUNT }; to; amount; fee = ?fee }, RetryLib.dexNow());
    await RetryLib.sendPayDexAttempt({ a with sends = 1 });
  };

  func putInjection(ctx : ProtocolFeeContext, inj : MintFeeTypes.LiquidityInjection) {
    ctx.mintFees.injections.add(inj.id, { inj with updatedAt = Time.now() });
  };

  func endInjection(ctx : ProtocolFeeContext, inj : MintFeeTypes.LiquidityInjection, status : MintFeeTypes.InjectionStatus, error : Text) {
    putInjection(ctx, { inj with status; error = ?error });
  };

  func completeInjection(ctx : ProtocolFeeContext, inj : MintFeeTypes.LiquidityInjection, r : LockedAdd) {
    putInjection(ctx, { inj with liquidityShares = r.shares; used0 = r.used0; used1 = r.used1; status = #completed; error = null });
    let sa = setAsideOf(ctx, inj.token);
    ctx.mintFees.setAside.add(tokenKey(inj.token), { sa with totalInjected = sa.totalInjected + inj.amountIn; lastInjectionAt = ?Time.now() });
  };

  // Amount already in the pool subaccount that waits in the pool's protocol
  // fee (added as permanent liquidity by recyclePoolFees).
  func toPoolFee(ctx : ProtocolFeeContext, poolId : Nat, side0 : Bool, amount : Nat) {
    switch (ctx.dex.pools.get(poolId)) {
      case (?pool) {
        ctx.dex.pools.add(poolId, if (side0) { { pool with protocolFee0 = pool.protocolFee0 + amount } } else { { pool with protocolFee1 = pool.protocolFee1 + amount } });
      };
      case null {};
    };
  };

  func recordLiquidity(ctx : ProtocolFeeContext, poolId : Nat, used0 : Nat, used1 : Nat, shares : Nat, now : Int) {
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

  // Adds amounts already in the pool subaccount as contract-held locked
  // shares (no position): at the pool ratio, or both sides at the given ratio
  // on an empty pool (sqrt(a0 x a1)). The part beyond the ratio waits in the
  // pool's protocol fee. Shares rounded down, used amounts rounded up.
  func addLocked(ctx : ProtocolFeeContext, poolId : Nat, a0 : Nat, a1 : Nat, now : Int) : LockedAdd {
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?p) p;
      case null return { shares = 0; used0 = 0; used1 = 0 };
    };
    var shares = 0;
    var used0 = 0;
    var used1 = 0;
    if (pool.status != #removed and pool.removedAt == null) {
      if (pool.totalShares == 0) {
        if (a0 > 0 and a1 > 0) {
          shares := DexLib.isqrt(a0 * a1);
          if (shares > 0) {
            used0 := a0;
            used1 := a1;
          };
        };
      } else if (pool.reserve0 > 0 and pool.reserve1 > 0) {
        shares := Nat.min(a0 * pool.totalShares / pool.reserve0, a1 * pool.totalShares / pool.reserve1);
        if (shares > 0) {
          used0 := Nat.min(a0, ceilDiv(shares * pool.reserve0, pool.totalShares));
          used1 := Nat.min(a1, ceilDiv(shares * pool.reserve1, pool.totalShares));
        };
      };
    };
    ctx.dex.pools.add(
      poolId,
      {
        pool with
        reserve0 = pool.reserve0 + used0;
        reserve1 = pool.reserve1 + used1;
        totalShares = pool.totalShares + shares;
        lockedShares = pool.lockedShares + shares;
        protocolFee0 = pool.protocolFee0 + sat(a0, used0);
        protocolFee1 = pool.protocolFee1 + sat(a1, used1);
      },
    );
    if (shares > 0) {
      recordLiquidity(ctx, poolId, used0, used1, shares, now);
      ignore DexLib.refreshOpening(ctx.dex, poolId, rateOf(ctx, now));
    };
    { shares; used0; used1 };
  };

  // 50 / 50 split of the whole set-aside amount when it is worth at least
  // the threshold at a usable rate (missing or expired rate: wait). Never
  // depends on the price of TTTI-T.
  func planFor(ctx : ProtocolFeeContext, p : PayTypes.PayToken, now : Int) : ?InjectionPlan {
    let sa = setAsideOf(ctx, p);
    let value = switch (setAsideValue(ctx, p, sa.amount, now)) {
      case (?v) v;
      case null return null;
    };
    if (value < SET_ASIDE_THRESHOLD_USD_E8) return null;
    let fee = PayTokenLib.expectedFee(p);
    let swapAmountIn = sa.amount / 2;
    let pairAmountIn = sat(sa.amount, swapAmountIn);
    if (swapAmountIn <= 2 * fee or pairAmountIn <= 2 * fee) return null;
    ?{ amountIn = sa.amount; swapAmountIn; pairAmountIn };
  };

  // Takes the planned amount out of the set-aside amount and records the
  // injection (before any transfer).
  func openInjection(ctx : ProtocolFeeContext, p : PayTypes.PayToken, poolId : Nat, plan : InjectionPlan, venue : MintFeeTypes.SwapVenue, now : Int) : MintFeeTypes.LiquidityInjection {
    let sa = setAsideOf(ctx, p);
    ctx.mintFees.setAside.add(tokenKey(p), { sa with amount = sat(sa.amount, plan.amountIn) });
    let id = if (ctx.mintFees.nextInjectionId == 0) 1 else ctx.mintFees.nextInjectionId;
    ctx.mintFees.nextInjectionId := id + 1;
    let inj : MintFeeTypes.LiquidityInjection = {
      id;
      token = p;
      poolId;
      amountIn = plan.amountIn;
      swapAmountIn = plan.swapAmountIn;
      pairAmountIn = plan.pairAmountIn;
      venue;
      minTttiOut = 0;
      tttiReceived = 0;
      liquidityShares = 0;
      used0 = 0;
      used1 = 0;
      status = #swapping;
      error = null;
      startedAt = now;
      updatedAt = now;
    };
    ctx.mintFees.injections.add(id, inj);
    inj;
  };

  // Native venue (pool open): the whole amount goes to the pool subaccount,
  // 50 % is swapped fee-free inside the pool, the TTTI-T obtained is paired
  // with the other 50 % as locked shares.
  func injectNative(ctx : ProtocolFeeContext, p : PayTypes.PayToken, pool : DexTypes.Pool, plan : InjectionPlan, now : Int) : async () {
    let fee = PayTokenLib.expectedFee(p);
    let inj = openInjection(ctx, p, pool.id, plan, #native(pool.id), now);
    let arrived = sat(plan.amountIn, fee);
    let a = await payMove(ctx, p, poolAccount(ctx, pool), arrived);
    switch (a.outcome) {
      case (#succeeded(_)) {};
      case (#failed(text)) {
        addSetAside(ctx, p, plan.amountIn, false);
        endInjection(ctx, inj, #failed(text), "Transfer to the native pool refused; amount returned to the set-aside amount: " # text);
        return;
      };
      case (_) {
        endInjection(ctx, inj, #needsReview, "Transfer to the native pool with unknown outcome (memo " # memoOf(a) # "); amount recorded in this injection");
        return;
      };
    };
    let current = ctx.dex.pools.get(pool.id) ?? pool;
    let tttiIs0 = tttiSide(current, p) ?? true;
    let swapIn = Nat.min(plan.swapAmountIn, arrived);
    let pairIn = sat(arrived, swapIn);
    let (rPay, rTtti) = if (tttiIs0) (current.reserve1, current.reserve0) else (current.reserve0, current.reserve1);
    let out = DexLib.amountOut(rPay, rTtti, swapIn, 0, true).amountOut;
    if (not isOpen(current) or out == 0 or out >= rTtti) {
      toPoolFee(ctx, pool.id, not tttiIs0, arrived);
      let text = "Native swap not possible; the amount waits in the pool's protocol fee for permanent liquidity";
      endInjection(ctx, inj, #failed(text), text);
      return;
    };
    let swapped : DexTypes.Pool = if (tttiIs0) {
      { current with reserve0 = Nat.sub(current.reserve0, out); reserve1 = current.reserve1 + swapIn };
    } else {
      { current with reserve1 = Nat.sub(current.reserve1, out); reserve0 = current.reserve0 + swapIn };
    };
    ctx.dex.pools.add(pool.id, swapped);
    let adding = { inj with minTttiOut = out; tttiReceived = out; status = #addingLiquidity };
    putInjection(ctx, adding);
    let r = if (tttiIs0) addLocked(ctx, pool.id, out, pairIn, Time.now()) else addLocked(ctx, pool.id, pairIn, out, Time.now());
    completeInjection(ctx, adding, r);
  };

  // Gets the deposited swap half back from ICPSwap after a failed quote or
  // swap; on failure it stays on this canister's ICPSwap balance (review).
  func recoverDeposit(ctx : ProtocolFeeContext, p : PayTypes.PayToken, inj : MintFeeTypes.LiquidityInjection, swapPool : Principal, credited : Nat, why : Text) : async () {
    let fee = PayTokenLib.expectedFee(p);
    switch (await IcpSwapLib.withdraw(swapPool, PayTokenLib.ledgerId(p), credited, fee)) {
      case (#ok(_)) {
        addSetAside(ctx, p, inj.pairAmountIn + sat(credited, fee), false);
        endInjection(ctx, inj, #failed(why), why # "; amounts returned to the set-aside amount");
      };
      case (#err(e)) {
        addSetAside(ctx, p, inj.pairAmountIn, false);
        endInjection(ctx, inj, #needsReview, why # "; ICPSwap withdrawal failed: " # e # "; the swap half stays on this canister's ICPSwap balance, the pair half returned to the set-aside amount");
      };
    };
  };

  // ICPSwap venue (native pool not open): deposit, swap with a bounded
  // amountOutMinimum, TTTI-T withdrawn to INJECTION_SUBACCOUNT, then both
  // sides moved into the native pool subaccount and added as locked shares.
  func injectIcpswap(ctx : ProtocolFeeContext, p : PayTypes.PayToken, pool : DexTypes.Pool, plan : InjectionPlan, now : Int) : async () {
    let ledgerId = PayTokenLib.ledgerId(p);
    let swapPool = switch (await IcpSwapLib.findPool(ledgerId, ctx.canister)) {
      case (?id) id;
      case null return; // no ICPSwap pool: waits
    };
    let info = switch (await IcpSwapLib.info(swapPool, ctx.canister)) {
      case (#ok(i)) i;
      case (#err(_)) return; // waits
    };
    let fee = PayTokenLib.expectedFee(p);
    let inj = openInjection(ctx, p, pool.id, plan, #icpswap(swapPool), now);
    let toDeposit = sat(plan.swapAmountIn, fee);
    let t1 = await payMove(ctx, p, { owner = swapPool; subaccount = ?IcpSwapLib.depositSubaccount(ctx.canister) }, toDeposit);
    switch (t1.outcome) {
      case (#succeeded(_)) {};
      case (#failed(text)) {
        addSetAside(ctx, p, plan.amountIn, false);
        endInjection(ctx, inj, #failed(text), "Transfer to ICPSwap refused; amount returned to the set-aside amount: " # text);
        return;
      };
      case (_) {
        addSetAside(ctx, p, plan.pairAmountIn, false);
        endInjection(ctx, inj, #needsReview, "Transfer to ICPSwap with unknown outcome (memo " # memoOf(t1) # "); the swap half is recorded in this injection, the pair half returned to the set-aside amount");
        return;
      };
    };
    let credited = switch (await IcpSwapLib.deposit(swapPool, ledgerId, toDeposit, fee)) {
      case (#ok(v)) v;
      case (#err(e)) {
        addSetAside(ctx, p, plan.pairAmountIn, false);
        endInjection(ctx, inj, #needsReview, "ICPSwap deposit failed: " # e # "; the swap half stays on this canister's ICPSwap deposit subaccount, the pair half returned to the set-aside amount");
        return;
      };
    };
    let zeroForOne = not info.tttiIsToken0;
    let quoted = switch (await IcpSwapLib.quote(swapPool, zeroForOne, credited)) {
      case (#ok(q)) q;
      case (#err(e)) {
        await recoverDeposit(ctx, p, inj, swapPool, credited, "ICPSwap quote failed: " # e);
        return;
      };
    };
    let minOut = quoted * (BPS - INJECTION_MAX_SLIPPAGE_BPS) / BPS;
    let quotedInj = { inj with minTttiOut = minOut };
    putInjection(ctx, quotedInj);
    if (minOut == 0) {
      await recoverDeposit(ctx, p, quotedInj, swapPool, credited, "ICPSwap quote gives no TTTI-T");
      return;
    };
    let out = switch (await IcpSwapLib.swap(swapPool, zeroForOne, credited, minOut)) {
      case (#ok(v)) v;
      case (#err(e)) {
        await recoverDeposit(ctx, p, quotedInj, swapPool, credited, "ICPSwap swap failed: " # e);
        return;
      };
    };
    let tttiFee = IcrcLib.fee(ctx.ledger);
    let injAccount : Types.Account = { owner = ctx.canister; subaccount = ?INJECTION_SUBACCOUNT };
    let before = IcrcLib.balanceOf(ctx.ledger, injAccount);
    switch (await IcpSwapLib.withdrawToSubaccount(swapPool, ctx.canister, out, tttiFee, INJECTION_SUBACCOUNT)) {
      case (#ok(_)) {};
      case (#err(e)) {
        addSetAside(ctx, p, plan.pairAmountIn, false);
        endInjection(ctx, { quotedInj with tttiReceived = out }, #needsReview, "ICPSwap TTTI-T withdrawal failed: " # e # "; the TTTI-T obtained stays on this canister's ICPSwap balance, the pair half returned to the set-aside amount");
        return;
      };
    };
    let received = sat(IcrcLib.balanceOf(ctx.ledger, injAccount), before);
    if (received <= tttiFee) {
      addSetAside(ctx, p, plan.pairAmountIn, false);
      endInjection(ctx, { quotedInj with tttiReceived = received }, #needsReview, "No usable TTTI-T received on the injection subaccount; the pair half returned to the set-aside amount");
      return;
    };
    let tttiNet = sat(received, tttiFee);
    let target = poolAccount(ctx, pool);
    let move = RetryLib.newDexAttempt(ctx.retry, #MF, null, { token = #tttiT; from = injAccount; to = target; amount = tttiNet; fee = ?tttiFee }, RetryLib.dexNow());
    switch (IcrcLib.transfer(ctx.ledger, ctx.canister, ctx.canister, { from_subaccount = ?INJECTION_SUBACCOUNT; to = target; amount = tttiNet; fee = ?tttiFee; memo = ?move.memo; created_at_time = ?move.created_at_time })) {
      case (#Ok(_)) {};
      case (#Err(#Duplicate(_))) {};
      case (#Err(_)) {
        addSetAside(ctx, p, plan.pairAmountIn, false);
        endInjection(ctx, { quotedInj with tttiReceived = received }, #needsReview, "TTTI-T move to the native pool refused; the TTTI-T stays on the injection subaccount, the pair half returned to the set-aside amount");
        return;
      };
    };
    let adding = { quotedInj with tttiReceived = tttiNet; status = #addingLiquidity };
    putInjection(ctx, adding);
    let pairNet = sat(plan.pairAmountIn, fee);
    let t2 = await payMove(ctx, p, target, pairNet);
    let current = ctx.dex.pools.get(pool.id) ?? pool;
    let tttiIs0 = tttiSide(current, p) ?? true;
    switch (t2.outcome) {
      case (#succeeded(_)) {
        let r = if (tttiIs0) addLocked(ctx, pool.id, tttiNet, pairNet, Time.now()) else addLocked(ctx, pool.id, pairNet, tttiNet, Time.now());
        completeInjection(ctx, adding, r);
      };
      case (#failed(text)) {
        toPoolFee(ctx, pool.id, tttiIs0, tttiNet);
        addSetAside(ctx, p, plan.pairAmountIn, false);
        endInjection(ctx, adding, #failed(text), "Pair half transfer refused: " # text # "; returned to the set-aside amount; the TTTI-T waits in the pool's protocol fee for permanent liquidity");
      };
      case (_) {
        toPoolFee(ctx, pool.id, tttiIs0, tttiNet);
        endInjection(ctx, adding, #needsReview, "Pair half transfer with unknown outcome (memo " # memoOf(t2) # "); the TTTI-T waits in the pool's protocol fee for permanent liquidity");
      };
    };
  };

  func injectToken(ctx : ProtocolFeeContext, p : PayTypes.PayToken, now : Int) : async () {
    let plan = switch (planFor(ctx, p, now)) {
      case (?pl) pl;
      case null return;
    };
    let poolId = switch (mintFeePool(ctx, p)) {
      case (?id) id;
      case null return;
    };
    ignore DexLib.refreshOpening(ctx.dex, poolId, rateOf(ctx, now));
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?pl) pl;
      case null return;
    };
    if (isOpen(pool)) await injectNative(ctx, p, pool, plan, now) else await injectIcpswap(ctx, p, pool, plan, now);
  };

  // Threshold-triggered injection pass (timer): for each token whose
  // set-aside is worth >= 10 USD at a valid rate, swap 50 % into TTTI-T
  // (ICPSwap while no native pool of the pair is open, else native) and add
  // the TTTI-T with the other 50 % as locked protocol liquidity. One pass at
  // a time, so one injection in flight per token.
  public func runInjections(ctx : ProtocolFeeContext, now : Int) : async () {
    if (ctx.pause.paused) return;
    if (ctx.locks.contains(INJECTIONS_LOCK)) return;
    ctx.locks.add(INJECTIONS_LOCK);
    try {
      // An injection still open here was interrupted (upgrade or trap).
      for (inj in ctx.mintFees.injections.values().toArray().values()) {
        if (inj.status == #swapping or inj.status == #addingLiquidity) {
          endInjection(ctx, inj, #needsReview, "Interrupted before completion; amounts recorded in this injection");
        };
      };
      for (p in PayTokenLib.ALL.values()) {
        await injectToken(ctx, p, now);
      };
    } finally {
      ctx.locks.remove(INJECTIONS_LOCK);
    };
  };

  // Native swap fee split: the 30 % kept in protocolFee0/1 is added to the
  // same pool's reserves as contract-held locked shares, minted on the
  // growth of sqrt(reserve0 x reserve1) (LP share value unchanged).
  public func recyclePoolFees(ctx : ProtocolFeeContext, poolId : Nat, now : Int) {
    if (ctx.pause.paused) return;
    let pool = switch (ctx.dex.pools.get(poolId)) {
      case (?p) p;
      case null return;
    };
    let a0 = pool.protocolFee0;
    let a1 = pool.protocolFee1;
    if (a0 == 0 and a1 == 0) return;
    if (pool.status == #removed or pool.removedAt != null) return;
    if (pool.reserve0 == 0 or pool.reserve1 == 0 or pool.totalShares == 0) return;
    let rootK = DexLib.isqrt(pool.reserve0 * pool.reserve1);
    let rootK2 = DexLib.isqrt((pool.reserve0 + a0) * (pool.reserve1 + a1));
    if (rootK == 0 or rootK2 <= rootK) return;
    let shares = pool.totalShares * (rootK2 - rootK) / rootK;
    if (shares == 0) return;
    ctx.dex.pools.add(
      poolId,
      {
        pool with
        reserve0 = pool.reserve0 + a0;
        reserve1 = pool.reserve1 + a1;
        totalShares = pool.totalShares + shares;
        lockedShares = pool.lockedShares + shares;
        protocolFee0 = 0;
        protocolFee1 = 0;
      },
    );
    recordLiquidity(ctx, poolId, a0, a1, shares, now);
  };

  // Open TTTI-T pair with the least USD liquidity (same rule as the router's
  // redirect) and whether TTTI-T is its token0; null while none is open.
  func feedTarget(dex : DexTypes.DexStore, rate : DexLib.UsdRateOf) : ?(DexTypes.Pool, Bool) {
    var best : ?(DexTypes.Pool, Bool, Nat) = null;
    for (pool in dex.pools.values()) {
      if (isOpen(pool) and pool.kind == #tttiPair) {
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

  // Refused pair-request deposits feed the protocol liquidity. The 0.0005
  // TTTI-T kept in DEX-REQUEST-DEPOSIT-TTTI-T-00001 for a refused request is
  // moved (in-process ledger, synchronous) to the subaccount of the least
  // liquid open TTTI-T pair, minus one ledger fee, and added to that pool's
  // protocolFee side, which recyclePoolFees turns into contract-held
  // permanent liquidity (as for the native 30 % fee). The transfer and the
  // refusedFeeds record happen in the same message without an await, so each
  // refused request is counted exactly once, across retries and upgrades.
  // Nothing happens while no TTTI-T pair is open (the deposit waits). Pending
  // and approved requests (deposit refunded) are never touched. No TTTI-T is
  // created and no price-linked order is placed.
  public func feedRefusedDeposits(ctx : ProtocolFeeContext, now : Int) {
    if (ctx.pause.paused) return;
    let fee = IcrcLib.fee(ctx.ledger);
    let rate = rateOf(ctx, now);
    for (request in ctx.dex.requests.values().toArray().values()) {
      let refused = switch (request.status) {
        case (#refused(_)) true;
        case (_) false;
      };
      if (refused and request.refundStatus == #none and request.refundBlock == null and request.depositAmount > fee and ctx.refusedFeeds.get(request.id) == null) {
        switch (feedTarget(ctx.dex, rate)) {
          case (?(pool, tttiIs0)) {
            let amount = Nat.sub(request.depositAmount, fee);
            let result = IcrcLib.transfer(
              ctx.ledger,
              ctx.canister,
              ctx.canister,
              {
                from_subaccount = DexLib.requestDepositAccount(ctx.canister).subaccount;
                to = { owner = ctx.canister; subaccount = ?pool.subaccount };
                amount;
                fee = ?fee;
                memo = ?("TTTI-RD-" # request.id.toText()).encodeUtf8();
                created_at_time = null;
              },
            );
            switch (result) {
              case (#Ok(block)) {
                ctx.refusedFeeds.add(request.id, { requestId = request.id; poolId = pool.id; amount; fee; block; at = now });
                toPoolFee(ctx, pool.id, tttiIs0, amount);
                recyclePoolFees(ctx, pool.id, now);
              };
              case (#Err(_)) {};
            };
          };
          case null {};
        };
      };
    };
  };
};
