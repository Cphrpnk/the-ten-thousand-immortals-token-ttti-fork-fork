import Map "mo:core/Map";

// PTM-6c: settlement of the auction winners. Additive: the closing store gets
// `settlements` (one record per served bid, written when a settlement is
// attempted; none yet) and `failedCarriedE8s` (per closed auction, quantity of
// failed winners passed to the next lot; none yet) and `moves` (moves of funds
// from the auction custody to the DEX custody; none yet). closingSince, closed
// auctions, closed bids and bidder balances are carried forward by reference.
// sale.reserved, balances, blocks, pools, positions, the ledger and its stored
// fee are never touched.
module {
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

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
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
  };

  type NewClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<Nat, BidSettlement>;
    failedCarriedE8s : Map.Map<Nat, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
  };

  type OldActor = {
    auctionClosing : OldClosingStore;
  };

  type NewActor = {
    auctionClosing : NewClosingStore;
  };

  public func migration(old : OldActor) : NewActor {
    {
      auctionClosing = {
        var closingSince = old.auctionClosing.closingSince;
        closed = old.auctionClosing.closed;
        closedBids = old.auctionClosing.closedBids;
        balances = old.auctionClosing.balances;
        settlements = Map.empty();
        failedCarriedE8s = Map.empty();
        moves = Map.empty();
      };
    };
  };
};
