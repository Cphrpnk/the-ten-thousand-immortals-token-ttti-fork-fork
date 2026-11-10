import Map "mo:core/Map";
import Set "mo:core/Set";

// PTM-10b: the mint and the auction settlement lock the share m. Stored shapes
// that gain fields (existing records read as m = 0, remainder choice #pool, i.e.
// the behaviour they had; nothing is recomputed or rewritten):
//  - `dex.positions`: every Position gains `mintShareE6 = 0`. Pools, requests,
//    counters, removals, ICPSwap samples, the pool index and the fee pot are
//    carried forward by reference.
//  - `liquidityMints.mints`: every LiquidityMint gains `mShareE6 = 0`,
//    `choice = #pool`, `lockedPositionId = null`, `lockedTokenAmount = 0`,
//    `lockedTttiAmount = 0`, `handTttiAmount = 0`. Guarantees, set-asides and
//    the counter are carried forward.
//  - `auction.bids` and `auction.pending`: every Bid and PendingBid gains
//    `choice = #pool`.
//  - `auctionClosing.closedBids`: every ClosedBid gains `choice = #pool`;
//    `auctionClosing.settlements`: every BidSettlement gains `mShareE6 = 0`,
//    `choice = #pool`, `lockedAmount = 0`, `lockedPositionId = null`,
//    `handE8s = 0`. Every other field of the closing store is carried forward.
// sale.reserved, balances, blocks, the ledger and its stored fee are never
// touched.
module {
  type RemainderChoice = { #pool; #wallet };

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

  type OldPosition = {
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

  type NewPosition = {
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
    mintShareE6 : Nat;
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


  type BidderBalance = {
    owner : Principal;
    token : PayToken;
    var withdrawable : Nat;
    var pendingSettlement : Nat;
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

  type OldClosedBid = {
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

  type NewClosedBid = {
    id : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    choice : RemainderChoice;
    outcome : { #served; #partiallyServed; #notServed; #discardedBelowReserve };
    servedE8s : Nat;
    pricePaidB : Nat;
    servedDeposit : Nat;
    returned : Nat;
  };

  type OldBidSettlement = {
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

  type NewBidSettlement = {
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
    mShareE6 : Nat;
    choice : RemainderChoice;
    lockedAmount : Nat;
    lockedPositionId : ?Nat;
    handE8s : Nat;
    failureReason : ?Text;
    attemptedAt : ?Int;
    settledAt : ?Int;
  };

  // --- liquidity mints -----------------------------------------------------------

  type MintStatus = { #inProgress; #completed; #refunding; #refunded; #refundFailed };

  type OldLiquidityMint = {
    id : Nat;
    payer : Principal;
    owner : Principal;
    token : PayToken;
    tttiAmount : Nat;
    payAmount : Nat;
    rateUsdE8 : Nat;
    poolId : Nat;
    positionId : ?Nat;
    paymentBlock : ?Nat;
    status : MintStatus;
    createdAt : Int;
    refundWithdrawalN : ?Nat;
    refusalCause : ?Text;
  };

  type NewLiquidityMint = {
    id : Nat;
    payer : Principal;
    owner : Principal;
    token : PayToken;
    tttiAmount : Nat;
    payAmount : Nat;
    rateUsdE8 : Nat;
    poolId : Nat;
    positionId : ?Nat;
    mShareE6 : Nat;
    choice : RemainderChoice;
    lockedPositionId : ?Nat;
    lockedTokenAmount : Nat;
    lockedTttiAmount : Nat;
    handTttiAmount : Nat;
    paymentBlock : ?Nat;
    status : MintStatus;
    createdAt : Int;
    refundWithdrawalN : ?Nat;
    refusalCause : ?Text;
  };

  type Guarantee = {
    mintId : Nat;
    owner : Principal;
    token : PayToken;
    amount : Nat;
    createdAt : Int;
  };

  type CreatorSetAside = {
    mintId : Nat;
    token : PayToken;
    amount : Nat;
  };

  type OldLiquidityMintStore = {
    mints : Map.Map<Nat, OldLiquidityMint>;
    guarantees : Map.Map<Nat, Guarantee>;
    creatorSetAsides : Map.Map<Nat, CreatorSetAside>;
    var nextMintId : Nat;
  };

  type NewLiquidityMintStore = {
    mints : Map.Map<Nat, NewLiquidityMint>;
    guarantees : Map.Map<Nat, Guarantee>;
    creatorSetAsides : Map.Map<Nat, CreatorSetAside>;
    var nextMintId : Nat;
  };

  // --- dex ---------------------------------------------------------------------

  type OldDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, OldPosition>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    poolPositions : Map.Map<Nat, Set.Set<Nat>>;
    fees : FeePotStore;
  };

  type NewDexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
    positions : Map.Map<Nat, NewPosition>;
    var nextPositionId : Nat;
    removals : Map.Map<Nat, PairRemoval>;
    icpswapSamples : Map.Map<Text, IcpSwapSample>;
    poolPositions : Map.Map<Nat, Set.Set<Nat>>;
    fees : FeePotStore;
  };

  // --- auction -------------------------------------------------------------------

  type Auction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    lotSizeE8s : Nat;
    blockSale : Bool;
    remainderE8s : Nat;
  };

  type OldBid = {
    id : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    memo : Blob;
    block : Nat;
  };

  type NewBid = {
    id : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    choice : RemainderChoice;
    memo : Blob;
    block : Nat;
  };

  type OldPendingBid = {
    n : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
  };

  type NewPendingBid = {
    n : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    choice : RemainderChoice;
  };

  type OldAuctionStore = {
    var current : ?Auction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : Nat;
    var nextBidId : Nat;
    var remainderCommittedE8s : Nat;
    bids : Map.Map<Nat, OldBid>;
    pending : Map.Map<Nat, OldPendingBid>;
  };

  type NewAuctionStore = {
    var current : ?Auction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : Nat;
    var nextBidId : Nat;
    var remainderCommittedE8s : Nat;
    bids : Map.Map<Nat, NewBid>;
    pending : Map.Map<Nat, NewPendingBid>;
  };

  type OldClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [OldClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, OldBidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
    movesByBidder : Map.Map<Text, Set.Set<Nat>>;
    activeMoves : Set.Set<Nat>;
    settledAuctions : Set.Set<Nat>;
    dust : Map.Map<Text, BidderDust>;
  };

  type NewClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [NewClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, NewBidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
    movesByBidder : Map.Map<Text, Set.Set<Nat>>;
    activeMoves : Set.Set<Nat>;
    settledAuctions : Set.Set<Nat>;
    dust : Map.Map<Text, BidderDust>;
  };

  type OldActor = {
    dex : OldDexStore;
    liquidityMints : OldLiquidityMintStore;
    auction : OldAuctionStore;
    auctionClosing : OldClosingStore;
  };

  type NewActor = {
    dex : NewDexStore;
    liquidityMints : NewLiquidityMintStore;
    auction : NewAuctionStore;
    auctionClosing : NewClosingStore;
  };

  public func migration(old : OldActor) : NewActor {
    let d = old.dex;
    let dex : NewDexStore = {
      pools = d.pools;
      requests = d.requests;
      lastRefusalAt = d.lastRefusalAt;
      var nextPoolId = d.nextPoolId;
      var nextRequestId = d.nextRequestId;
      positions = d.positions.map(func(_, p) { { p with mintShareE6 = 0 } });
      var nextPositionId = d.nextPositionId;
      removals = d.removals;
      icpswapSamples = d.icpswapSamples;
      poolPositions = d.poolPositions;
      fees = d.fees;
    };

    let lm = old.liquidityMints;
    let liquidityMints : NewLiquidityMintStore = {
      mints = lm.mints.map(
        func(_, m) {
          {
            m with
            mShareE6 = 0;
            choice = #pool;
            lockedPositionId = null;
            lockedTokenAmount = 0;
            lockedTttiAmount = 0;
            handTttiAmount = 0;
          };
        }
      );
      guarantees = lm.guarantees;
      creatorSetAsides = lm.creatorSetAsides;
      var nextMintId = lm.nextMintId;
    };

    let a = old.auction;
    let auction : NewAuctionStore = {
      var current = a.current;
      var committedReturnedE8s = a.committedReturnedE8s;
      var nextAuctionId = a.nextAuctionId;
      var nextBidId = a.nextBidId;
      var remainderCommittedE8s = a.remainderCommittedE8s;
      bids = a.bids.map(func(_, b) { { b with choice = #pool } });
      pending = a.pending.map(func(_, b) { { b with choice = #pool } });
    };

    let c = old.auctionClosing;
    let auctionClosing : NewClosingStore = {
      var closingSince = c.closingSince;
      closed = c.closed;
      closedBids = c.closedBids.map(
        func(_, bids) { bids.map(func(b : OldClosedBid) : NewClosedBid = { b with choice = #pool }) }
      );
      balances = c.balances;
      settlements = c.settlements.map(
        func(_, s) {
          {
            s with
            mShareE6 = 0;
            choice = #pool;
            lockedAmount = 0;
            lockedPositionId = null;
            handE8s = 0;
          };
        }
      );
      failedCarriedE8s = c.failedCarriedE8s;
      moves = c.moves;
      movesByBidder = c.movesByBidder;
      activeMoves = c.activeMoves;
      settledAuctions = c.settledAuctions;
      dust = c.dust;
    };

    { dex; liquidityMints; auction; auctionClosing };
  };
};
