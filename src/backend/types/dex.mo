import Map "mo:core/Map";
import Set "mo:core/Set";

// DEX lot 1: v2 constant-product pool registry and pair requests.
// Self-contained (mo:core only) so the module can be moved later.
module {
  public type PoolId = Nat;
  public type RequestId = Nat;
  // Nanoseconds since the epoch (Time.now()).
  public type Timestamp = Int;

  // 5, 30 or 100 basis points (0.05 %, 0.3 %, 1 %).
  public type FeeTier = { #bps5; #bps30; #bps100 };

  // DEX lot 3: #filling = approved pool collecting liquidity (swaps closed)
  // until both reserves total LAUNCH_MIN_TOTAL_USD_E8; #active = open (stays
  // open); #removed = swaps and adds closed, LP withdrawals always open.
  public type PoolStatus = { #filling; #active; #removed };

  public type PoolKind = { #tttiPair; #utilityPair };

  // #internal = this contract's own TTTI-T ledger.
  public type TokenLedger = { #internal; #external : Principal };

  public type PoolToken = {
    ledger : TokenLedger;
    symbol : Text;
    decimals : Nat8;
  };

  // Minimum locked liquidity per token (base units); null = not set.
  public type PoolMinimums = {
    token0 : ?Nat;
    token1 : ?Nat;
  };

  // Admin-supplied minimums for a utility pair (base units).
  public type TokenMinimums = {
    token0 : Nat;
    token1 : Nat;
  };

  public type Pool = {
    id : PoolId;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Timestamp;
    // 32-byte ASCII "DEX-POOL-<id>" (id zero-padded).
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    // Approval + 30 days, for pools created from a request.
    newPairBadgeUntil : ?Timestamp;
    requestId : ?RequestId;
    removedAt : ?Timestamp;
    // DEX lot 3: v2 constant-product reserves (base units, LP fee share included).
    reserve0 : Nat;
    reserve1 : Nat;
    // All LP shares, including the contract-owned minimum shares.
    totalShares : Nat;
    // Minimum shares minted at the first deposit, owned by the contract forever.
    lockedShares : Nat;
    // 30 % protocol share of each fee, accumulated only (not in the reserves).
    protocolFee0 : Nat;
    protocolFee1 : Nat;
    // PTM-3: cumulative LP fees set aside and credited to the internal
    // balances of locked positions (see "LP fee sharing" below). Informational
    // counters, never part of the reserves.
    lockedFeesPaid0 : Nat;
    lockedFeesPaid1 : Nat;
  };

  // --- DEX lot 3: LP positions -----------------------------------------------

  public type PositionId = Nat;

  // --- PTM-3: relay lock and LP fee sharing ---------------------------------
  //
  // Optional lock: none (free position) or between 3 months (MIN_LOCK_NS) and
  // 5 years (MAX_LOCK_NS = FIVE_YEARS). Only the position owner commits or
  // extends; no admin function opens, extends or shortens a lock.
  //
  // Capital of a position = its `shares` (its share of the pool).
  // Weight of a commitment = capital x duration (shares x ns).
  //
  // Relay: each new commitment in a pool (addLiquidity with a lock, or
  // extendLock adding time) has a relay budget of one third of its weight.
  // It shortens the OTHER still-locked positions of that pool (unlockAt > now)
  // in proportion to their capital x time already served
  // (shares x (now - lockStartedAt)); older and heavier positions are relieved
  // the most. A position is never lengthened by the relay. A shortening is
  // capped at the position's remaining time.
  //
  // Stored lock state of a position:
  //   unlockAt = lockStartedAt + lockDurationNs - relayReceivedNs
  // lockDurationNs is the committed duration (original or extended, before
  // relay); relayReceivedNs is the cumulative shortening (ns). A position that
  // reached its term or was relieved (unlockAt <= now) stays in the pool as
  // free liquidity until the owner removes it; it is not evicted.
  // A free position that the owner commits again (extendLock) restarts its
  // lock: lockStartedAt = now, relayReceivedNs = 0.
  //
  // LP fee sharing (70 % of the native swap fee and the LP part of routed
  // fees): the LP fee is split in two halves.
  //   - Half A stays in the reserves, pro rata to shares (free or locked), as
  //     before.
  //   - Half B is set aside and shared among the locked positions of the pool
  //     only (unlockAt > now), by weight shares x sqrt(remaining / FIVE_YEARS),
  //     remaining = unlockAt - now. No fixed multiple.
  // Accounting choice: half B is NOT added to the pool reserves; it is credited
  // at once to the owners' internal DEX balances (available) and recorded on
  // each position (feesCollected0/1), and added to the pool counters
  // lockedFeesPaid0/1. Total owed (reserves + internal balances + protocol
  // fees) is unchanged by the split, so the reserve checks of lib/dex-reserve.mo
  // and lib/dex-sweep.mo stay consistent with the ledger. With no locked
  // position when the fee is paid, half B stays in the reserves pro rata to
  // shares. Rounding dust of the shared half stays in the reserves. Only fees
  // actually paid are shared.

  // One position per liquidity add, with its own lock.
  public type Position = {
    id : PositionId;
    poolId : PoolId;
    owner : Principal;
    shares : Nat;
    createdAt : Timestamp;
    lockDurationNs : Nat;
    unlockAt : Timestamp;
    // Owner was the admin / creator at add time (same rules apply).
    isCreator : Bool;
    // PTM-3: start of the current lock (= createdAt for positions that existed
    // before PTM-3 and for new positions).
    lockStartedAt : Timestamp;
    // PTM-3: cumulative relay shortening received (ns); never decreases.
    relayReceivedNs : Nat;
    // PTM-3: cumulative set-aside LP fees credited to the owner, per pool token.
    feesCollected0 : Nat;
    feesCollected1 : Nat;
  };

  // Relay applied to other positions by one commitment.
  public type RelayOutcome = {
    // Weight of the commitment (shares x ns added).
    weight : Nat;
    // Relay budget = weight / 3.
    relayWeight : Nat;
    // Total weight (shares x ns) actually removed from other positions.
    shortenedWeight : Nat;
    positionsShortened : Nat;
    // Positions that became free because of this relay.
    positionsFreed : Nat;
  };

  // Split of one LP fee (one token side) between the reserves and the locked
  // positions. reserve + credited = lpFee.
  public type LpFeeShare = {
    reserve : Nat;
    credited : Nat;
    positions : Nat;
  };

  // Guaranteed depth of a pool: shares of locked positions (unlockAt > now)
  // plus permanent liquidity (Pool.lockedShares), with the token amounts they
  // correspond to and the USD depth at the pool price (PoolDepth rules).
  public type GuaranteedDepth = {
    lockedPositionShares : Nat;
    permanentShares : Nat;
    amount0 : Nat;
    amount1 : Nat;
    depth : PoolDepth;
  };

  // Counter token of a pair request.
  public type CounterToken = {
    #icp;
    #ckbtc;
    #ckusdc;
    #ckusdt;
    #tttiT;
    #poolToken : Principal;
  };

  // Metadata read from the requested ledger.
  public type RequestedToken = {
    ledgerId : Principal;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
  };

  public type RequestChecks = {
    icrc1 : Bool;
    icrc2 : Bool;
    metadataRead : Bool;
    pairUnique : Bool;
    // Known token symbol the requested symbol copies (flag for the admin).
    copiedSymbolOf : ?Text;
  };

  public type RequestStatus = {
    #pending;
    #approved : { poolId : PoolId; at : Timestamp };
    #refused : { reason : Text; at : Timestamp };
  };

  // DQ refund of the request deposit (DEX lot 2):
  // #none        = no refund due (pending or refused request);
  // #inProgress  = approved, DQ attempt recorded and retried by lib/retry.mo;
  // #needsReview = outcome still unknown 23 h after its created_at_time;
  // #refunded    = Ok / #Duplicate (or admin "Arrived"), with the block.
  public type PairRefundStatus = {
    #none;
    #inProgress;
    #needsReview;
    #refunded : Nat;
  };

  public type PairRequest = {
    id : RequestId;
    requester : Principal;
    token : RequestedToken;
    counter : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    message : Text;
    createdAt : Timestamp;
    checks : RequestChecks;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    // Lot 1 refund block, kept unchanged; also set when a DQ refund succeeds.
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  // Record of one refused pair-request deposit fed to the protocol liquidity
  // (one entry per refused request, never counted twice). `amount` is the
  // TTTI-T credited to the pool's permanent liquidity (deposit minus one
  // TTTI-T ledger fee, which goes to the fee collector as for every transfer).
  public type RefusedDepositFeed = {
    requestId : RequestId;
    poolId : PoolId;
    amount : Nat;
    fee : Nat;
    block : Nat;
    at : Timestamp;
  };

  public type DexStore = {
    pools : Map.Map<PoolId, Pool>;
    requests : Map.Map<RequestId, PairRequest>;
    // Last refusal per requester (cooldown start).
    lastRefusalAt : Map.Map<Principal, Timestamp>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    // DEX lot 3: LP positions keyed by position id.
    positions : Map.Map<PositionId, Position>;
    var nextPositionId : Nat;
    // DEX-2: latest announced pair removal per pool (kept after cancellation
    // or completion so the pool page can show it).
    removals : Map.Map<PoolId, PairRemoval>;
    // DEX-2: last reading of each ICPSwap TTTI-T pair, keyed by the ICPSwap
    // pool canister id (text); input of the first-deposit reference price.
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    // PTM-9d: ids of the positions of each pool, so that every per-pool
    // computation reads only that pool's positions. Kept in step with
    // `positions` (add on creation, delete on removal); built by the
    // migration 20261206_000000 from the existing positions.
    poolPositions : Map.Map<PoolId, Set.Set<PositionId>>;
    // PTM-9d: per-pool pending pot of the locked-share half of the LP fees,
    // the daily sharing state and the per-position lock-time records.
    fees : FeePotStore;
  };

  // --- PTM-9d: per-pool LP fee pot and daily sliced sharing -------------------
  //
  // The locked-share half of every LP fee (LOCKED_FEE_SHARE_PERCENT of the fee,
  // see lib/dex.mo) is no longer shared by a scan of the positions at swap time:
  // it is added to the pool's pending pot (pending0 / pending1, in the pool's
  // two tokens). Once a day a timer shares each pot, in slices of SLICE_SIZE
  // positions per message, among the positions locked during the day.
  //
  // Weight of a position for a day = capital x sqrt(remaining time / 5 years)
  //   (capital = shares; same fixed-point rule as lib/dex.mo feeWeight),
  // computed at the start of the day, or at the lock start when the lock begins
  // during the day. Share = pot x (weight x ns locked during the day) / sum of
  // the same product over the pool. A position removed during the day keeps its
  // product in `unpaid` (per owner and pool); it is paid to the owner at the
  // next sharing. A pool with no locked position at sharing time moves its pot
  // to the pool reserves.

  // Positions handled per message by one sharing slice.
  public let SLICE_SIZE : Nat = 5_000;
  // Length of one sharing day (ns).
  public let SHARING_DAY_NS : Int = 86_400_000_000_000;

  // #idle    : nothing running; pending0/1 accumulate the next sharing.
  // #summing : first pass, accumulates totalProductNs over the pool's positions.
  // #paying  : second pass, credits each position its share of frozen0/1.
  public type SharingPhase = { #idle; #summing; #paying };

  // Pending pot and sliced-sharing cursor of one pool (key: pool id).
  //   pending0/1       fees received since the last freeze (the next pot)
  //   frozen0/1        amounts being shared by the running sharing
  //   cursor           last position id handled by the running pass (null: start)
  //   totalProductNs   sum over the pool of weight x ns locked, for the day shared
  //   paid0/1          amounts credited so far by the running sharing
  //   dayStart/dayEnd  the day being shared
  public type PoolPot = {
    poolId : PoolId;
    var pending0 : Nat;
    var pending1 : Nat;
    var phase : SharingPhase;
    var frozen0 : Nat;
    var frozen1 : Nat;
    var cursor : ?PositionId;
    var totalProductNs : Nat;
    var paid0 : Nat;
    var paid1 : Nat;
    var sharedDayStart : Timestamp;
    var sharedDayEnd : Timestamp;
    // Maintained figure for the swap path: shares of the pool's positions with
    // unlockAt > now, refreshed by every operation that changes a position and
    // by the daily pass (lockedScan accumulates the pass over the slices). A
    // swap reads this figure and no position.
    var lockedPositionShares : Nat;
    var lockedScan : Nat;
  };

  // Lock-time record of a position for the current day (key: position id).
  //   weight       capital x sqrt(remaining / 5 years) taken at lockedFrom
  //   lockedFrom   max(day start, lock start)
  //   lockedUntil  null while the position is still locked; set to the removal
  //                time when the position is removed during the day. The locked
  //                time of the day is min(lockedUntil or day end, unlockAt, day
  //                end) - lockedFrom.
  public type PositionLock = {
    positionId : PositionId;
    poolId : PoolId;
    owner : Principal;
    var weight : Nat;
    var lockedFrom : Timestamp;
    var lockedUntil : ?Timestamp;
  };

  // Unpaid share of an owner in a pool for positions removed during the day
  // (key: "<owner text>:<pool id>"). productNs = sum of weight x ns locked of
  // the owner's removed positions; paid to the owner at the next sharing, then
  // reset to 0.
  public type UnpaidShare = {
    owner : Principal;
    poolId : PoolId;
    var productNs : Nat;
  };

  // State of the fee pots. dayStart = start of the current sharing day;
  // nextSharingAt = dayStart + SHARING_DAY_NS.
  public type FeePotStore = {
    var dayStart : Timestamp;
    var nextSharingAt : Timestamp;
    pots : Map.Map<PoolId, PoolPot>;
    locks : Map.Map<PositionId, PositionLock>;
    unpaid : Map.Map<Text, UnpaidShare>;
  };

  // Public view of the pending pot of one pool (amounts in the pool's token0
  // and token1 base units).
  public type PendingPotView = {
    poolId : PoolId;
    pending0 : Nat;
    pending1 : Nat;
    dayStart : Timestamp;
    nextSharingAt : Timestamp;
    sharingRunning : Bool; // a sliced sharing of the previous pot is still running
  };

  // Public view of the estimated share of a position for the current day, as if
  // the pot were shared now with the same weight rule.
  //   weight           capital x sqrt(remaining / 5 years) at lockedFrom
  //   lockedNs         ns locked so far during the current day
  //   dayFractionBps   lockedNs as basis points of SHARING_DAY_NS (0..10_000)
  //   estimated0/1     estimated amount per pool token; 0 for a free position
  public type EstimatedShareView = {
    positionId : PositionId;
    poolId : PoolId;
    owner : Principal;
    weight : Nat;
    lockedNs : Nat;
    dayFractionBps : Nat;
    estimated0 : Nat;
    estimated1 : Nat;
    nextSharingAt : Timestamp;
  };

  // Outcome of one sharing slice for a pool.
  //   processed  positions handled by this call
  //   more       true when the sharing of this pool has more slices to run
  public type PotSliceReport = {
    poolId : PoolId;
    phase : SharingPhase;
    processed : Nat;
    more : Bool;
    paid0 : Nat;
    paid1 : Nat;
  };

  // Outcome of the daily day-roll.
  //   rolled       false when the day was not over yet (nothing done)
  //   poolsStarted pools whose sliced sharing was started by this call
  public type DayRollReport = {
    rolled : Bool;
    dayStart : Timestamp;
    nextSharingAt : Timestamp;
    poolsStarted : Nat;
  };

  // --- DEX-2: announced pair removal -----------------------------------------

  // #announced  = published, effective at effectiveAt (5 days after announcedAt);
  // #cancelled  = cancelled by the admin before effectiveAt, the pool resumes;
  // #executing  = effectiveAt reached, positions are being liquidated;
  // #completed  = every position paid out, the pool is #removed.
  public type RemovalState = {
    #announced;
    #cancelled : { cancelledAt : Timestamp };
    #executing : { startedAt : Timestamp };
    #completed : { completedAt : Timestamp };
  };

  public type PairRemoval = {
    poolId : PoolId;
    reason : Text;
    announcedAt : Timestamp;
    effectiveAt : Timestamp;
    state : RemovalState;
  };

  // Public removal state shown on the pool page.
  public type RemovalView = {
    #none;
    #announced : { reason : Text; announcedAt : Timestamp; effectiveAt : Timestamp };
    #cancelled : { reason : Text; announcedAt : Timestamp; effectiveAt : Timestamp; cancelledAt : Timestamp };
    #executing : { reason : Text; announcedAt : Timestamp; effectiveAt : Timestamp; startedAt : Timestamp };
    #completed : { reason : Text; announcedAt : Timestamp; effectiveAt : Timestamp; completedAt : Timestamp };
  };

  // Accounting of one liquidated position: the pool was debited and the
  // owner's internal balances credited, exactly once.
  public type LiquidationAccounting = {
    poolId : PoolId;
    positionId : PositionId;
    owner : Principal;
    token0 : DexToken;
    token1 : DexToken;
    amount0 : Nat;
    amount1 : Nat;
  };

  public type LiquidationError = {
    #poolNotFound;
    #positionNotFound;
    // The pool has no removal in #executing state.
    #notExecuting;
  };

  public type CancelRemovalError = {
    #notAuthorized;
    #poolNotFound;
    #noAnnouncement;
    #alreadyCancelled;
    // effectiveAt reached: the removal can no longer be cancelled.
    #alreadyExecuting;
    #alreadyCompleted;
  };

  // --- DEX-2: first-deposit reference price -----------------------------------

  // amount1 / amount0 in base units, as numerator / denominator.
  public type Ratio = { numerator : Nat; denominator : Nat };

  // Last reading of an ICPSwap TTTI-T/<counter> pair. counterPerTttiE8 = counter
  // whole tokens (x 1e8) per whole TTTI-T; counterReserve = counter side
  // reserve in base units (depth = 2 x its USD value at the hourly rate).
  public type IcpSwapSample = {
    poolCanister : Principal;
    counter : DexToken;
    counterPerTttiE8 : Nat;
    counterReserve : Nat;
    readAt : Timestamp;
  };

  public type ReferenceSourceKind = { #icpswap; #native };

  // One source of the TTTI-T reference price. tttiPriceUsdE8 = USD x 1e8 per
  // whole TTTI-T implied by this source at the hourly rate; depthUsdE8 = 2 x
  // the USD value of the non-TTTI-T side; weightBps = depthUsdE8 share of the
  // total depth (the weights sum to 10,000).
  public type ReferenceSource = {
    kind : ReferenceSourceKind;
    sourceLabel : Text;
    poolId : ?PoolId;
    counter : DexToken;
    tttiPriceUsdE8 : Nat;
    depthUsdE8 : Nat;
    weightBps : Nat;
    readAt : Timestamp;
  };

  public type ReferenceUnavailable = {
    // TTTI-T pair with no readable ICPSwap or open native TTTI-T source.
    #noReadableSource;
    // A required hourly rate is absent or expired.
    #rateUnavailable : { token0 : Bool; token1 : Bool };
  };

  // Reference ratio of a pool (amount1 per amount0, base units). TTTI-T pairs:
  // depth-weighted average TTTI-T price (ICPSwap TTTI-T pairs plus native open
  // TTTI-T pools other than this pool) converted at the hourly rate. Utility
  // pairs: ratio of the two hourly rates, with no sources.
  public type ReferencePrice = {
    poolId : PoolId;
    kind : PoolKind;
    computedAt : Timestamp;
    available : Bool;
    unavailable : ?ReferenceUnavailable;
    // TTTI-T pairs only: weighted TTTI-T price, USD x 1e8.
    tttiPriceUsdE8 : ?Nat;
    expected : ?Ratio;
    toleranceBps : Nat;
    sources : [ReferenceSource];
    // Hourly rates in force for the pair tokens; false when absent or expired.
    ratesValid : Bool;
  };

  // Result of the first-deposit check of a quote.
  public type ReferenceCheck = {
    // False when the pool already has liquidity (no reference check).
    applicable : Bool;
    withinBand : Bool;
    deviationBps : ?Nat;
    toleranceBps : Nat;
    expected : ?Ratio;
    unavailable : ?ReferenceUnavailable;
  };

  // --- DEX-2: pool depth and swap opening --------------------------------------

  public type DepthBasis = { #twiceNonTttiSide; #sumOfSides };

  // Measure used by the 10 USD swap-opening threshold: TTTI-T pairs = the
  // TTTI-T side at the pool price (= the counterpart reserve at the oracle
  // rate); utility pairs = total depth (sum of both sides).
  public type ThresholdBasis = { #tttiSideAtPoolPrice; #sumOfSides };

  // Depth at the pool price: TTTI-T pairs = 2 x USD value of the non-TTTI-T
  // side (TTTI-T is never counted at a fixed USD value); utility pairs = sum
  // of both sides at the hourly rates. usdE8 null: missing or expired rate.
  public type PoolDepth = {
    usdE8 : ?Nat;
    basis : DepthBasis;
    missingRate : { token0 : Bool; token1 : Bool };
  };

  public type SwapStateReason = {
    #open;
    // depthUsdE8 = the threshold measure (see ThresholdBasis), not the depth.
    #belowThreshold : { depthUsdE8 : Nat; thresholdUsdE8 : Nat };
    #rateUnavailable;
    #removalAnnounced : { effectiveAt : Timestamp };
    #removalExecuting;
    #removed;
  };

  public type SwapState = {
    open : Bool;
    reason : SwapStateReason;
  };

  // --- DEX lot 2: deposits (DD), withdrawals (DW), internal balances ---------

  // Supported DEX tokens; any other token is refused (Candid variant).
  public type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  // Internal balance of one principal for one token (base units).
  // `reserved` = held for a withdrawal in flight.
  public type DexBalance = {
    var available : Nat;
    var reserved : Nat;
  };

  // Per principal, per token key (DexLib.tokenKey).
  public type DexBalances = Map.Map<Principal, Map.Map<Text, DexBalance>>;

  // #inProgress  = recorded, sent or resent (unknown outcome within 23 h);
  // #needsReview = outcome unknown 23 h after created_at_time ("To review");
  // #completed   = Ok / #Duplicate (or admin "Arrived"), with the block;
  // #failed      = known ledger Err (DD: nothing credited; DW: balance given back).
  public type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  public type DexTransferDirection = { #deposit; #withdrawal };

  // --- API boundary ----------------------------------------------------------

  public type DexAccount = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type PoolTokenView = {
    ledgerId : Principal;
    symbol : Text;
    decimals : Nat8;
    isTttiT : Bool;
  };

  public type PoolView = {
    id : PoolId;
    token0 : PoolTokenView;
    token1 : PoolTokenView;
    feeTier : FeeTier;
    feeBps : Nat;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Timestamp;
    subaccount : Blob;
    subaccountText : Text;
    poolAccount : DexAccount;
    minimumLocked : PoolMinimums;
    // No longer enforced: 0 once the minimum is set, null otherwise (compatibility).
    firstDepositMinimum : PoolMinimums;
    minimumsSet : Bool;
    lockedSharesStatement : Text;
    // Launch depth: first deposit >= this total USD value (USD * 1e8), both sides.
    launchMinimumTotalUsdE8 : Nat;
    newPairBadgeUntil : ?Timestamp;
    newPairBadgeActive : Bool;
    approvalStatement : ?Text;
    requestId : ?RequestId;
    removedAt : ?Timestamp;
    acceptsSwaps : Bool;
    acceptsDeposits : Bool;
    acceptsWithdrawals : Bool;
    // DEX lot 3.
    reserve0 : Nat;
    reserve1 : Nat;
    totalShares : Nat;
    lockedShares : Nat;
    protocolFee0 : Nat;
    protocolFee1 : Nat;
    gauge : UsdGauge;
    // DEX-2: depth at the pool price, swap opening threshold (USD x 1e8),
    // dynamic swap state and announced removal.
    depth : PoolDepth;
    // PTM-3: locked positions + permanent liquidity.
    guaranteedDepth : GuaranteedDepth;
    swapThresholdUsdE8 : Nat;
    // Measure compared with swapThresholdUsdE8 and its current value (USD x
    // 1e8; null when a rate is missing or expired).
    thresholdBasis : ThresholdBasis;
    thresholdMeasuredUsdE8 : ?Nat;
    swapState : SwapState;
    removal : RemovalView;
    // PTM-5: spread against the consolidated TTTI-T price; null for pools that
    // are not native TTTI-T pools (utility pairs) and for removed pools.
    spread : ?PoolSpread;
  };

  // --- DEX lot 3: filling gauge, liquidity, positions, swaps -----------------

  // Swap-opening measure (see ThresholdBasis) against the 10 USD target.
  // currentUsdE8 / remainingUsdE8 = null: value momentarily unavailable
  // (missing or expired rate).
  public type UsdGauge = {
    currentUsdE8 : ?Nat;
    targetUsdE8 : Nat;
    remainingUsdE8 : ?Nat;
    valueAvailable : Bool;
    missingRate : { token0 : Bool; token1 : Bool };
  };

  public type PoolSide = { #token0; #token1 };

  // `amount` of `side`; the contract computes the counter amount from the
  // reserve ratio (rounded up, in favor of the pool). First deposit:
  // `counterAmount` is required and fixes the ratio. Later deposits:
  // `counterAmount`, when given, must equal the required counter amount
  // (otherwise #ratioMismatch with the required amount).
  //
  // DEX-2: `side` / `amount` is the fixed side; the other side is computed at
  // the pool ratio at execution, after the funds arrived. `counterAmount`:
  // first deposit = the counter amount that fixes the ratio (required); later
  // deposits = the counter amount seen in the quote, the slippage reference.
  // `slippageBps` null = 50 (0.5 %).
  public type AddLiquidityQuoteArgs = {
    poolId : PoolId;
    side : PoolSide;
    amount : Nat;
    counterAmount : ?Nat;
    slippageBps : ?Nat;
  };

  public type AddLiquidityArgs = {
    poolId : PoolId;
    side : PoolSide;
    amount : Nat;
    counterAmount : ?Nat;
    // DEX-2: null = 50 (0.5 %), at most 10,000.
    slippageBps : ?Nat;
    // PTM-3: optional lock, null or 0 = no lock (free position); otherwise at
    // least 3 months and at most 5 years.
    lockDurationNs : ?Nat;
  };

  public type AddLiquidityQuote = {
    poolId : PoolId;
    isFirstDeposit : Bool;
    amount0 : Nat;
    amount1 : Nat;
    // Shares the depositor receives (first deposit: sqrt(A x B) minus lockedShares).
    shares : Nat;
    // First deposit only: shares owned by the contract forever.
    lockedShares : Nat;
    totalSharesAfter : Nat;
    gaugeAfter : UsdGauge;
    opensPool : Bool;
    // DEX-2: the computed counter side, its amount, and the tolerance used.
    counterSide : PoolSide;
    counterAmount : Nat;
    slippageBps : Nat;
    // Pool depth after the add (USD x 1e8); null when a rate is missing.
    depthAfterUsdE8 : ?Nat;
    // First deposit only: check against the reference price.
    referenceCheck : ReferenceCheck;
  };

  public type PositionView = {
    id : PositionId;
    poolId : PoolId;
    owner : Principal;
    shares : Nat;
    // Token amounts the shares correspond to (pro rata, rounded down).
    amount0 : Nat;
    amount1 : Nat;
    token0Symbol : Text;
    token1Symbol : Text;
    createdAt : Timestamp;
    lockDurationNs : Nat;
    unlockAt : Timestamp;
    isCreator : Bool;
    unlocked : Bool;
    // DEX-2: depends only on unlockAt (every pool state).
    withdrawable : Bool;
    // PTM-3: lock start, time left (0 when free), locked or free, relay
    // received (ns) and set-aside fees collected per pool token.
    lockStartedAt : Timestamp;
    remainingNs : Nat;
    locked : Bool;
    relayReceivedNs : Nat;
    feesCollected0 : Nat;
    feesCollected1 : Nat;
  };

  public type AddLiquidityResult = {
    position : PositionView;
    amount0 : Nat;
    amount1 : Nat;
    shares : Nat;
    lockedShares : Nat;
    // DEX-2: unused amount of either side, left in the internal balance.
    surplus0 : Nat;
    surplus1 : Nat;
    // PTM-3: relay applied to other positions by this commitment (all zeros
    // when the position has no lock).
    relay : RelayOutcome;
    pool : PoolView;
  };

  // PTM-3: result of extendLock.
  public type ExtendLockResult = {
    position : PositionView;
    relay : RelayOutcome;
    pool : PoolView;
  };

  public type RemoveLiquidityResult = {
    positionId : PositionId;
    poolId : PoolId;
    shares : Nat;
    amount0 : Nat;
    amount1 : Nat;
    pool : PoolView;
  };

  public type SwapQuote = {
    poolId : PoolId;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    // Total fee on the input (rounded up), then its LP (70 %) and protocol (30 %) parts.
    fee : Nat;
    lpFee : Nat;
    protocolFee : Nat;
    feeBps : Nat;
    priceImpactBps : Nat;
    slippageBps : Nat;
    minimumReceived : Nat;
    // Latest deadline swap accepts: call time + 5 minutes.
    maxDeadlineNs : Nat;
  };

  public type SwapResult = {
    poolId : PoolId;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    fee : Nat;
    lpFee : Nat;
    protocolFee : Nat;
    pool : PoolView;
  };

  public type AddLiquidityError = {
    #anonymous;
    #poolNotFound;
    #poolRemoved;
    #minimumsNotSet;
    #unsupportedToken;
    #zeroAmount;
    #counterAmountRequired;
    #insufficientBalance : { token : DexToken; available : Nat; required : Nat };
    // Compatibility only: no longer returned (no first-deposit minimum).
    #belowMinimum : { token0Minimum : ?Nat; token1Minimum : ?Nat };
    #ratioMismatch : { requiredCounterAmount : Nat };
    #lockTooShort : { minimumNs : Nat };
    #lockTooLong : { maximumNs : Nat };
    #zeroShares;
    #operationInProgress;
    // DEX-2.
    #invalidSlippage : { maximumBps : Nat };
    // Counter amount at execution outside the tolerance: nothing added, the
    // funds stay in the internal balance.
    #slippageExceeded : { expectedCounterAmount : Nat; actualCounterAmount : Nat; toleranceBps : Nat };
    // First deposit outside 2 % of the reference ratio.
    #referenceOutOfBand : { deviationBps : Nat; toleranceBps : Nat; expected : Ratio };
    // First deposit with no readable reference or an expired rate.
    #referenceUnavailable : ReferenceUnavailable;
    // Liquidity adds are suspended during an announced removal.
    #removalAnnounced : { effectiveAt : Timestamp };
  };

  public type RemoveLiquidityError = {
    #anonymous;
    #positionNotFound;
    #notPositionOwner;
    #poolNotFound;
    #positionLocked : { unlockAt : Timestamp };
    #operationInProgress;
  };

  public type ExtendLockError = {
    #anonymous;
    #positionNotFound;
    #notPositionOwner;
    #cannotShortenLock : { unlockAt : Timestamp };
    #lockTooLong : { maximumUnlockAt : Timestamp };
    // PTM-3: committing a free position needs at least 3 months from now.
    #lockTooShort : { minimumNs : Nat };
    #poolNotFound;
    #poolRemoved;
    #removalAnnounced : { effectiveAt : Timestamp };
    #operationInProgress;
  };

  public type SwapError = {
    #anonymous;
    #poolNotFound;
    #poolFilling : { gauge : UsdGauge };
    #poolRemoved;
    #poolNotOpen;
    #rateUnavailable;
    #unsupportedToken;
    #tokenNotInPool;
    #zeroAmount;
    #invalidSlippage : { maximumBps : Nat };
    #insufficientBalance : { available : Nat };
    #insufficientLiquidity;
    #slippageExceeded : { amountOut : Nat; minAmountOut : Nat };
    #deadlineExceeded : { deadline : Timestamp; now : Timestamp };
    #deadlineTooFar : { maximum : Timestamp };
    #operationInProgress;
    // DEX-2: depth below the 10 USD swap threshold (USD x 1e8).
    #depthBelowThreshold : { depthUsdE8 : Nat; thresholdUsdE8 : Nat };
    // DEX-2: removal announced or in progress.
    #removalInProgress : { effectiveAt : Timestamp };
  };

  public type PairRequestView = {
    id : RequestId;
    requester : Principal;
    token : RequestedToken;
    counter : PoolTokenView;
    feeTier : FeeTier;
    feeBps : Nat;
    kind : PoolKind;
    message : Text;
    createdAt : Timestamp;
    checks : RequestChecks;
    copiedSymbol : Bool;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  public type DexTokenInfo = {
    token : DexToken;
    symbol : Text;
    ledgerId : Principal;
    decimals : Nat8;
    fee : Nat;
    // Smallest deposit amount accepted (base units).
    minimumDeposit : Nat;
    // Smallest withdrawal amount accepted (above the ledger fee).
    minimumWithdrawal : Nat;
  };

  public type DexBalanceView = {
    token : DexToken;
    symbol : Text;
    ledgerId : Principal;
    available : Nat;
    reserved : Nat;
  };

  public type DexAmountArgs = {
    token : DexToken;
    amount : Nat;
  };

  public type DexTransferView = {
    n : Nat;
    direction : DexTransferDirection;
    owner : Principal;
    token : DexToken;
    // Internal balance amount credited (deposit) or debited (withdrawal).
    amount : Nat;
    // Amount moved on the ledger (withdrawal: amount minus the ledger fee).
    ledgerAmount : Nat;
    fee : Nat;
    from : DexAccount;
    to : DexAccount;
    memoText : Text;
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    status : DexTransferStatus;
    lastError : ?Text;
  };

  public type DexDepositError = {
    #anonymous;
    #amountTooSmall : { minimum : Nat };
    #transferInProgress;
    #insufficientAllowance : { allowance : Nat; required : Nat };
    #insufficientFunds : { balance : Nat };
    #ledgerError : Text;
  };

  public type DexWithdrawError = {
    #anonymous;
    #amountTooSmall : { minimum : Nat };
    #insufficientBalance : { available : Nat };
    #transferInProgress;
    #ledgerError : Text;
  };

  public type DexConfig = {
    requestDeposit : Nat;
    depositAccount : DexAccount;
    maxPendingPerUser : Nat;
    refusalCooldownNs : Int;
    messageMaxChars : Nat;
    reasonMaxChars : Nat;
    newPairBadgeNs : Int;
    tttiMinimumLocked : Nat;
    // No longer enforced: always 0 (compatibility).
    firstDepositMultiplier : Nat;
    feeTiers : [FeeTier];
    protocolStatement : Text;
    lockedSharesStatement : Text;
    approvalStatement : Text;
    // Launch depth rule (computed constants, USD * 1e8).
    launchMinimumTotalUsdE8 : Nat;
    usdRateScale : Nat;
    // TTTI-T valued at a fixed 10,000 USD per token.
    tttiTUsdE8 : Nat;
    // ICP, ckBTC, ckUSDC, ckUSDT: hourly stored rate, valid 1 h + 5 min grace.
    rateValidForNs : Nat;
    rateGraceNs : Nat;
    launchDepthStatement : Text;
    // DEX lot 3.
    minLockNs : Nat;
    maxLockNs : Nat;
    swapDeadlineMaxNs : Nat;
    lpFeeSharePercent : Nat;
    protocolFeeSharePercent : Nat;
    // DEX-2.
    swapThresholdUsdE8 : Nat;
    defaultSlippageBps : Nat;
    referenceToleranceBps : Nat;
    removalNoticeNs : Nat;
    // PTM-3: relay budget = weight / relayDivisor (3); percent of the LP fee
    // set aside for locked positions (50).
    relayDivisor : Nat;
    lockedFeeSharePercent : Nat;
  };

  // Combined USD value of a launch deposit (USD * 1e8), or which rate is missing.
  public type LaunchUsdValue = {
    #value : Nat;
    #missingRate : { token0 : Bool; token1 : Bool };
  };

  public type RequestPairArgs = {
    ledgerId : Principal;
    counter : CounterToken;
    feeTier : FeeTier;
    message : Text;
  };

  public type RequestPairError = {
    #anonymous;
    #messageTooLong : { max : Nat };
    #invalidToken : Text;
    #unknownCounterToken;
    #ledgerUnreachable : Text;
    #missingStandards : { icrc1 : Bool; icrc2 : Bool };
    #metadataUnavailable : Text;
    #pairExists : { poolId : ?PoolId; requestId : ?RequestId };
    #tooManyPending : { max : Nat };
    #cooldown : { until : Timestamp };
    #insufficientAllowance : { allowance : Nat; required : Nat };
    #insufficientFunds : { balance : Nat };
    #depositFailed : Text;
  };

  public type ApprovePairError = {
    #notAuthorized;
    #requestNotFound;
    #notPending;
    #minimumsRequired;
    #minimumsNotAllowed;
    #invalidMinimums;
    #pairExists : { poolId : PoolId };
    #refundFailed : Text;
  };

  public type RefusePairError = {
    #notAuthorized;
    #requestNotFound;
    #notPending;
    #reasonRequired;
    #reasonTooLong : { max : Nat };
  };

  public type RemovePairError = {
    #notAuthorized;
    #poolNotFound;
    #alreadyRemoved;
    // DEX-2.
    #alreadyAnnounced : { effectiveAt : Timestamp };
    #reasonEmpty;
    #reasonTooLong : { maximumChars : Nat };
  };

  public type SetMinimumsError = {
    #notAuthorized;
    #poolNotFound;
    #notUtilityPair;
    #poolRemoved;
    #liquidityAlreadyAdded;
    #invalidMinimums;
  };

  // ICRC-1 / ICRC-2 / ICRC-10 surface read during the request checks.
  public type MetadataValue = {
    #Nat : Nat;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
  };

  public type StandardRecord = { name : Text; url : Text };

  // --- PTM-5: consolidated TTTI-T price and per-pool spread ---------------------

  // Spread alert threshold: 2 % (200 bps), strictly above.
  public let SPREAD_ALERT_BPS : Nat = 200;

  // Why no consolidated price exists: no open native TTTI-T pool, or no open
  // pool whose counter token has a valid (non-expired) oracle rate.
  public type ConsolidatedUnavailable = { #noOpenPool; #noValidRate };

  // One pool feeding the consolidated price: its own USD price (USD x 1e8 per
  // TTTI-T), its depth (USD x 1e8) and its weight (depth share, bps).
  public type ConsolidatedSource = {
    poolId : PoolId;
    counterSymbol : Text; // ICP, ckBTC, ckUSDC or ckUSDT
    priceUsdE8 : Nat;
    depthUsdE8 : Nat;
    weightBps : Nat;
  };

  // Consolidated TTTI-T price in USD x 1e8, computed from all open native
  // TTTI-T pools with the current oracle rates, weighted by depth. The hourly
  // (60 min) and 24 h averages come from the 5-minute samples; null while no
  // sample falls in the window. `price` is #unavailable when no pool is usable.
  public type ConsolidatedPrice = {
    computedAt : Timestamp;
    price : { #available : Nat; #unavailable : ConsolidatedUnavailable };
    hourlyAverageUsdE8 : ?Nat;
    hourlySamples : Nat;
    dailyAverageUsdE8 : ?Nat;
    dailySamples : Nat;
    sources : [ConsolidatedSource];
  };

  // #ok = spread computed; the others are the explicit no-spread states.
  public type SpreadStatus = {
    #ok;
    #empty;
    #notOpen;
    #noRate;
    #noConsolidatedPrice;
  };

  // Spread of one native TTTI-T pool against the consolidated price. spreadBps
  // = (pool price - consolidated) x 10000 / consolidated, signed (negative: the
  // pool is cheaper). exceedsThreshold = |spreadBps| > 200.
  public type PoolSpread = {
    poolId : PoolId;
    counterSymbol : Text;
    status : SpreadStatus;
    priceUsdE8 : ?Nat;
    spreadBps : ?Int;
    exceedsThreshold : Bool;
  };

  public type PoolSpreadReport = {
    computedAt : Timestamp;
    consolidatedPriceUsdE8 : ?Nat;
    thresholdBps : Nat;
    pools : [PoolSpread]; // the four native TTTI-T pools, by pool id
  };

  // Computed in-app alert for an LP: a pool where the caller holds a position
  // and whose spread exceeds the threshold now. Not stored; it disappears when
  // the spread falls back to 2 % or less.
  public type PoolSpreadAlert = {
    poolId : PoolId;
    counterSymbol : Text;
    positionIds : [PositionId];
    spreadBps : Int;
    poolPriceUsdE8 : Nat;
    consolidatedPriceUsdE8 : Nat;
    thresholdBps : Nat;
    computedAt : Timestamp;
  };

  public type TokenLedgerActor = actor {
    icrc1_supported_standards : shared query () -> async [StandardRecord];
    icrc10_supported_standards : shared query () -> async [StandardRecord];
    icrc1_metadata : shared query () -> async [(Text, MetadataValue)];
    icrc1_name : shared query () -> async Text;
    icrc1_symbol : shared query () -> async Text;
    icrc1_decimals : shared query () -> async Nat8;
    icrc1_fee : shared query () -> async Nat;
  };
};
