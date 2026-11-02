import Int "mo:core/Int";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";

// PTM-9d: per-pool LP fee pot, per-pool position index, auction move index,
// settled-auction marking and carried dust. Additive reshaping only:
//  - `dex`: gains `poolPositions` (pool id -> ids of its positions, built from
//    the current positions) and `fees` (day start = now, next sharing = now + 1
//    day, an empty pot per existing pool, a lock-time record for every
//    position still locked now, no unpaid share). Pools, requests, positions,
//    counters, removals and ICPSwap samples are carried forward by reference.
//  - `auctionClosing`: gains `movesByBidder` and `activeMoves` (built from the
//    current moves; #inProgress and #needsReview moves are active),
//    `settledAuctions` (closed auctions whose winners are all settled or not
//    required) and an empty `dust` map. Every other field is carried forward.
// sale.reserved, balances, blocks, masses, the ledger and its stored fee are
// never touched.
module {
  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolKind = { #tttiPair; #utilityPair };
  type PoolStatus = { #filling; #active; #removed };
  type TokenLedger = { #internal; #external : Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type RequestedToken = {
    ledgerId : Principal;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
  };

  type RequestChecks = {
    icrc1 : Bool;
    icrc2 : Bool;
    metadataRead : Bool;
    pairUnique : Bool;
    copiedSymbolOf : ?Text;
  };

  type RequestStatus = {
    #pending;
    #approved : { poolId : Nat; at : Int };
    #refused : { reason : Text; at : Int };
  };

  type PairRefundStatus = {
    #none;
    #inProgress;
    #needsReview;
    #refunded : Nat;
  };

  type PairRequest = {
    id : Nat;
    requester : Principal;
    token : RequestedToken;
    counter : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    message : Text;
    createdAt : Int;
    checks : RequestChecks;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    refundBlock : ?Nat;
    refundStatus : PairRefundStatus;
  };

  type RemovalState = {
    #announced;
    #cancelled : { cancelledAt : Int };
    #executing : { startedAt : Int };
    #completed : { completedAt : Int };
  };

  type PairRemoval = {
    poolId : Nat;
    reason : Text;
    announcedAt : Int;
    effectiveAt : Int;
    state : RemovalState;
  };

  type IcpSwapSample = {
    poolCanister : Principal;
    counter : DexToken;
    counterPerTttiE8 : Nat;
    counterReserve : Nat;
    readAt : Int;
  };

  type Pool = {
    id : Nat;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Int;
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    newPairBadgeUntil : ?Int;
    requestId : ?Nat;
    removedAt : ?Int;
    reserve0 : Nat;
    reserve1 : Nat;
    totalShares : Nat;
    lockedShares : Nat;
    protocolFee0 : Nat;
    protocolFee1 : Nat;
    lockedFeesPaid0 : Nat;
    lockedFeesPaid1 : Nat;
  };

  type Position = {
    id : Nat;
    poolId : Nat;
    owner : Principal;
    shares : Nat;
    createdAt : Int;
    lockDurationNs : Nat;
    unlockAt : Int;
    isCreator : Bool;
    lockStartedAt : Int;
    relayReceivedNs : Nat;
    feesCollected0 : Nat;
    feesCollected1 : Nat;
  };

  type SharingPhase = { #idle; #summing; #paying };

  type PoolPot = {
    poolId : Nat;
    var pending0 : Nat;
    var pending1 : Nat;
    var phase : SharingPhase;
    var frozen0 : Nat;
    var frozen1 : Nat;
    var cursor : ?Nat;
    var totalProductNs : Nat;
    var paid0 : Nat;
    var paid1 : Nat;
    var sharedDayStart : Int;
    var sharedDayEnd : Int;
    var lockedPositionShares : Nat;
    var lockedScan : Nat;
  };

  type PositionLock = {
    positionId : Nat;
    poolId : Nat;
    owner : Principal;
    var weight : Nat;
    var lockedFrom : Int;
    var lockedUntil : ?Int;
  };

  type UnpaidShare = {
    owner : Principal;
    poolId : Nat;
    var productNs : Nat;
  };

  type FeePotStore = {
    var dayStart : Int;
    var nextSharingAt : Int;
    pots : Map.Map<Nat, PoolPot>;
    locks : Map.Map<Nat, PositionLock>;
    unpaid : Map.Map<Text, UnpaidShare>;
  };

  type OldDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, Position>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    poolPositions : Map.Map<Nat, Set.Set<Nat>>;
    fees : FeePotStore;
  };

  type ReserveBinding = { #floor; #consolidated; #dailyAverage };

  type ReserveBreakdown = {
    reserveUsdE8 : Nat;
    floorUsdE8 : Nat;
    consolidatedUsdE8 : ?Nat;
    dailyAverageUsdE8 : ?Nat;
    binding : ReserveBinding;
  };

  type ClosingRate = { token : PayToken; usdE8 : ?Nat };

  type ClosedAuction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    closedAt : Int;
    lotSizeE8s : Nat;
    blockSale : Bool;
    remainderE8s : Nat;
    reserve : ReserveBreakdown;
    rates : [ClosingRate];
    bidCount : Nat;
    servedE8s : Nat;
    carriedOverE8s : Nat;
    status : { #fullySold; #partiallySold; #unsold };
  };

  type ClosedBid = {
    id : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    outcome : { #served; #partiallyServed; #notServed; #discardedBelowReserve };
    servedE8s : Nat;
    pricePaidB : Nat;
    servedDeposit : Nat;
    returned : Nat;
  };

  type BidderBalance = {
    owner : Principal;
    token : PayToken;
    var withdrawable : Nat;
    var pendingSettlement : Nat;
  };

  type BidSettlement = {
    auctionId : Nat;
    bidId : Nat;
    bidder : Principal;
    token : PayToken;
    status : { #notRequired; #pending; #settled; #failed };
    settledE8s : Nat;
    mintedE8s : Nat;
    takenAmount : Nat;
    creatorShare : Nat;
    positionAmount : Nat;
    guaranteeAmount : Nat;
    surplusReturned : Nat;
    carriedE8s : Nat;
    positionId : ?Nat;
    failureReason : ?Text;
    attemptedAt : ?Int;
    settledAt : ?Int;
  };

  type Account = { owner : Principal; subaccount : ?Blob };

  type DexTransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : {
      token : DexToken;
      from : Account;
      to : Account;
      amount : Nat;
      fee : ?Nat;
    };
    sends : Nat;
    lastError : ?Text;
    outcome : { #pending; #unknown; #failed : Text; #succeeded : Nat };
  };

  type AuctionMove = {
    n : Nat;
    owner : Principal;
    token : PayToken;
    gross : Nat;
    fromPending : Nat;
    fromWithdrawable : Nat;
    credited : Nat;
    bidId : ?Nat;
    createdAt : Int;
    attempt : DexTransferAttempt;
    status : { #inProgress; #completed : Nat; #failed : Text; #needsReview };
  };

  type BidderDust = {
    owner : Principal;
    token : PayToken;
    var amount : Nat;
  };

  type OldClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, BidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
  };

  type NewClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, BidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
    movesByBidder : Map.Map<Text, Set.Set<Nat>>;
    activeMoves : Set.Set<Nat>;
    settledAuctions : Set.Set<Nat>;
    dust : Map.Map<Text, BidderDust>;
  };

  type OldActor = {
    dex : OldDexStore;
    auctionClosing : OldClosingStore;
  };

  type NewActor = {
    dex : NewDexStore;
    auctionClosing : NewClosingStore;
  };

  // Same constants and rule as lib/dex.mo feeWeight: capital x
  // sqrt(remaining / FIVE_YEARS), fixed-point scale 1e12 squared.
  let FIVE_YEARS : Nat = 157_766_400_000_000_000;
  let SQRT_SCALE_SQ : Nat = 1_000_000_000_000_000_000_000_000;

  func isqrt(n : Nat) : Nat {
    if (n < 2) return n;
    var x = n;
    var y = (x + 1) / 2;
    while (y < x) {
      x := y;
      y := (x + n / x) / 2;
    };
    x;
  };

  func tokenText(token : PayToken) : Text {
    switch (token) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  public func migration(old : OldActor) : NewActor {
    let now = Time.now();
    let dayNs : Int = 86_400_000_000_000;

    // --- dex: per-pool position index, pots and lock-time records ------------
    let poolPositions : Map.Map<Nat, Set.Set<Nat>> = Map.empty();
    let pots : Map.Map<Nat, PoolPot> = Map.empty();
    for ((poolId, _) in old.dex.pools.entries()) {
      poolPositions.add(poolId, Set.empty<Nat>());
      pots.add(
        poolId,
        {
          poolId;
          var pending0 = 0;
          var pending1 = 0;
          var phase : SharingPhase = #idle;
          var frozen0 = 0;
          var frozen1 = 0;
          var cursor : ?Nat = null;
          var totalProductNs = 0;
          var paid0 = 0;
          var paid1 = 0;
          var sharedDayStart = now;
          var sharedDayEnd = now;
          var lockedPositionShares = 0;
          var lockedScan = 0;
        },
      );
    };
    let locks : Map.Map<Nat, PositionLock> = Map.empty();
    for ((id, p) in old.dex.positions.entries()) {
      let ids = switch (poolPositions.get(p.poolId)) {
        case (?set) set;
        case null {
          let set = Set.empty<Nat>();
          poolPositions.add(p.poolId, set);
          set;
        };
      };
      ids.add(id);
      if (p.unlockAt > now) {
        switch (pots.get(p.poolId)) {
          case (?pot) { pot.lockedPositionShares += p.shares };
          case null {};
        };
      };
      if (p.shares > 0 and p.unlockAt > now) {
        let remaining = Int.abs(p.unlockAt - now);
        locks.add(
          id,
          {
            positionId = id;
            poolId = p.poolId;
            owner = p.owner;
            var weight = p.shares * isqrt(remaining * SQRT_SCALE_SQ / FIVE_YEARS);
            var lockedFrom = now;
            var lockedUntil : ?Int = null;
          },
        );
      };
    };

    // --- auctionClosing: move index, settled marking, dust -------------------
    let movesByBidder : Map.Map<Text, Set.Set<Nat>> = Map.empty();
    let activeMoves = Set.empty<Nat>();
    for ((n, m) in old.auctionClosing.moves.entries()) {
      let key = m.owner.toText() # ":" # tokenText(m.token);
      let ns = switch (movesByBidder.get(key)) {
        case (?set) set;
        case null {
          let set = Set.empty<Nat>();
          movesByBidder.add(key, set);
          set;
        };
      };
      ns.add(n);
      switch (m.status) {
        case (#inProgress or #needsReview) { activeMoves.add(n) };
        case _ {};
      };
    };
    let settledAuctions = Set.empty<Nat>();
    for ((auctionId, _) in old.auctionClosing.closed.entries()) {
      var allDone = true;
      switch (old.auctionClosing.closedBids.get(auctionId)) {
        case (?bids) {
          for (b in bids.values()) {
            if (b.servedE8s > 0) {
              switch (old.auctionClosing.settlements.get(b.id)) {
                case (?{ status = #settled }) {};
                case _ { allDone := false };
              };
            };
          };
        };
        case null {};
      };
      if (allDone) { settledAuctions.add(auctionId) };
    };

    {
      dex = {
        pools = old.dex.pools;
        requests = old.dex.requests;
        lastRefusalAt = old.dex.lastRefusalAt;
        var nextPoolId = old.dex.nextPoolId;
        var nextRequestId = old.dex.nextRequestId;
        positions = old.dex.positions;
        var nextPositionId = old.dex.nextPositionId;
        removals = old.dex.removals;
        icpswapSamples = old.dex.icpswapSamples;
        poolPositions;
        fees = {
          var dayStart = now;
          var nextSharingAt = now + dayNs;
          pots;
          locks;
          unpaid = Map.empty();
        };
      };
      auctionClosing = {
        var closingSince = old.auctionClosing.closingSince;
        closed = old.auctionClosing.closed;
        closedBids = old.auctionClosing.closedBids;
        balances = old.auctionClosing.balances;
        settlements = old.auctionClosing.settlements;
        failedCarriedE8s = old.auctionClosing.failedCarriedE8s;
        moves = old.auctionClosing.moves;
        movesByBidder;
        activeMoves;
        settledAuctions;
        dust = Map.empty();
      };
    };
  };
};
