import Map "mo:core/Map";

// PTM-6b: closing state of the sealed-bid auction. Purely additive: adds the
// stable field `auctionClosing` (no closing pending, no closed auction, no
// outcome, no withdrawable balance). The existing `auction` store (current
// auction, ids, bids, pending bids) and every other field are carried forward
// untouched; sale.reserved, balances, blocks, pools, positions, the ledger and
// its stored fee are never touched.
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

  type ClosingStore = {
    var closingSince : ?Int;
    closed : Map.Map<Nat, ClosedAuction>;
    closedBids : Map.Map<Nat, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
  };

  type OldActor = {};

  type NewActor = {
    auctionClosing : ClosingStore;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      auctionClosing = {
        var closingSince = null;
        closed = Map.empty();
        closedBids = Map.empty();
        balances = Map.empty();
      };
    };
  };
};
