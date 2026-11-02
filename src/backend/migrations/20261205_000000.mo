import Map "mo:core/Map";
import Text "mo:core/Text";

// PTM-9b: block-sale lots, end-of-mint remainder and the dedicated guarantee
// account. Additive reshaping only:
//  - `auction`: the open auction gains blockSale = false and remainderE8s = 0;
//    the store gains remainderCommittedE8s = 0. Ids, committed returned TTTI-T,
//    bids and pending bids are carried forward by reference.
//  - `auctionClosing`: closed auctions gain blockSale = false and
//    remainderE8s = 0, settlements gain mintedE8s = 0. closingSince, closed
//    bids, bidder balances, failed carry-over and moves are carried forward.
//  - `guaranteeAccount` (new): the internal guarantee account per token, seeded
//    with the sum of the existing masses (remainingGuarantee + excess) so that
//    the sum of the masses equals the balance from the start.
// sale.reserved, balances, blocks, masses, pools, positions, the ledger and
// its stored fee are never touched.
module {
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type Auction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    lotSizeE8s : Nat;
  };

  type NewAuction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    lotSizeE8s : Nat;
    blockSale : Bool;
    remainderE8s : Nat;
  };

  type Bid = {
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

  type PendingBid = {
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

  type OldAuctionStore = {
    var current : ?Auction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : Nat;
    var nextBidId : Nat;
    bids : Map.Map<Nat, Bid>;
    pending : Map.Map<Nat, PendingBid>;
  };

  type NewAuctionStore = {
    var current : ?NewAuction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : Nat;
    var nextBidId : Nat;
    var remainderCommittedE8s : Nat;
    bids : Map.Map<Nat, Bid>;
    pending : Map.Map<Nat, PendingBid>;
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

  type OldClosedAuction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    closedAt : Int;
    lotSizeE8s : Nat;
    reserve : ReserveBreakdown;
    rates : [ClosingRate];
    bidCount : Nat;
    servedE8s : Nat;
    carriedOverE8s : Nat;
    status : { #fullySold; #partiallySold; #unsold };
  };

  type NewClosedAuction = {
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

  type OldBidSettlement = {
    auctionId : Nat;
    bidId : Nat;
    bidder : Principal;
    token : PayToken;
    status : { #notRequired; #pending; #settled; #failed };
    settledE8s : Nat;
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
    failureReason : ?Text;
    attemptedAt : ?Int;
    settledAt : ?Int;
  };

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

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

  type OldClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, OldClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, OldBidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
  };

  type NewClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, NewClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, NewBidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
  };

  type GuaranteeMass = {
    token : PayToken;
    totalTtti : Nat;
    totalGuarantee : Nat;
    remainingTtti : Nat;
    remainingGuarantee : Nat;
    excess : Nat;
  };

  type OldActor = {
    auction : OldAuctionStore;
    auctionClosing : OldClosingStore;
    guaranteeMasses : Map.Map<Principal, Map.Map<Text, GuaranteeMass>>;
  };

  type NewActor = {
    auction : NewAuctionStore;
    auctionClosing : NewClosingStore;
    guaranteeAccount : Map.Map<Text, Nat>;
    guaranteeMasses : Map.Map<Principal, Map.Map<Text, GuaranteeMass>>;
  };

  public func migration(old : OldActor) : NewActor {
    let guaranteeAccount = Map.empty<Text, Nat>();
    for (key in ["tttiT", "icp", "ckbtc", "ckusdc", "ckusdt"].values()) {
      guaranteeAccount.add(key, 0);
    };
    for (perToken in old.guaranteeMasses.values()) {
      for ((key, mass) in perToken.entries()) {
        let current = guaranteeAccount.get(key) ?? 0;
        guaranteeAccount.add(key, current + mass.remainingGuarantee + mass.excess);
      };
    };
    {
      auction = {
        var current = switch (old.auction.current) {
          case (?a) { ?{ a with blockSale = false; remainderE8s = 0 } };
          case null { null };
        };
        var committedReturnedE8s = old.auction.committedReturnedE8s;
        var nextAuctionId = old.auction.nextAuctionId;
        var nextBidId = old.auction.nextBidId;
        var remainderCommittedE8s = 0;
        bids = old.auction.bids;
        pending = old.auction.pending;
      };
      auctionClosing = {
        var closingSince = old.auctionClosing.closingSince;
        closed = old.auctionClosing.closed.map(
          func(_, a) { { a with blockSale = false; remainderE8s = 0 } }
        );
        closedBids = old.auctionClosing.closedBids;
        balances = old.auctionClosing.balances;
        settlements = old.auctionClosing.settlements.map(
          func(_, s) { { s with mintedE8s = 0 } }
        );
        failedCarriedE8s = old.auctionClosing.failedCarriedE8s;
        moves = old.auctionClosing.moves;
      };
      guaranteeAccount;
      guaranteeMasses = old.guaranteeMasses;
    };
  };
};
