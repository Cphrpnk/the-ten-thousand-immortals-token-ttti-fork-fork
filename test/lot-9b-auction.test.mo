import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import AuctionLib "../src/backend/lib/auction";
import Types "../src/backend/types/auction";

// PTM-9b points 2 and 3: the end-of-mint remainder joins the first auction lot
// and is minted only at settlement, for the winner; a lot under the minimum of
// one bid is sold in block (best price for the whole lot wins). Pure tests that
// run in the interpreter.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("2vxsx-fae");
let carol = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
let now : Int = 1_000_000_000_000_000_000;

func newClosing() : Types.ClosingStore {
  AuctionLib.newClosingStore();
};

// ICP at 5 USD: the reserve (10 000 USD per TTTI-T) is 2 000 ICP per TTTI-T.
let rates : [Types.ClosingRate] = [{ token = #icp; usdE8 = ?500_000_000 }];
let reserve = AuctionLib.reserveFrom(null, null);

let aboveReserveLow : Nat = 250_000_000_000; // 2 500 ICP per TTTI-T
let aboveReserveHigh : Nat = 400_000_000_000; // 4 000 ICP per TTTI-T
let belowReserve : Nat = 100_000_000_000; // 1 000 ICP per TTTI-T

func bidOf(id : Nat, auction : Types.Auction, who : Principal, quantity : Nat, priceB : Nat) : Types.Bid {
  let required = AuctionLib.depositFormula(priceB, quantity);
  {
    id;
    auctionId = auction.id;
    bidder = who;
    token = #icp;
    quantityE8s = quantity;
    priceB;
    requiredDeposit = required;
    deposited = required;
    createdAt = now + id;
    memo = Blob.fromArray([]);
    block = id;
  };
};

func servedOf(result : AuctionLib.ClosingResult, id : Nat) : Nat {
  switch (result.bids.find(func(b : Types.ClosedBid) : Bool { b.id == id })) {
    case (?b) b.servedE8s;
    case null 0;
  };
};

func bidById(result : AuctionLib.ClosingResult, id : Nat) : Types.ClosedBid {
  switch (result.bids.find(func(b : Types.ClosedBid) : Bool { b.id == id })) {
    case (?b) b;
    case null { assert false; loop {} };
  };
};

func opened(store : Types.AuctionStore, returned : Nat, remainder : Nat) : Types.Auction {
  switch (AuctionLib.openWithRemainder(store, returned, remainder, now)) {
    case (#ok(a)) a;
    case (#err(_)) { assert false; loop {} };
  };
};

// --- Point 2: the remainder joins the first lot ----------------------------------------

// The remainder alone makes a lot under the minimum of one bid: it is sold in block.
do {
  let store = AuctionLib.newStore();
  let a = opened(store, 0, 5_000);
  assert a.lotSizeE8s == 5_000;
  assert a.remainderE8s == 5_000;
  assert a.blockSale;
  assert store.remainderCommittedE8s == 5_000;
  assert store.committedReturnedE8s == 0;
};

// Returned TTTI-T and the remainder are added in the lot; each is committed once.
do {
  let store = AuctionLib.newStore();
  let a = opened(store, 250_000, 9_000);
  assert a.lotSizeE8s == 259_000;
  assert a.remainderE8s == 9_000;
  assert not a.blockSale;
  assert store.committedReturnedE8s == 250_000;
  assert store.remainderCommittedE8s == 9_000;
  // The pending lot and remainder show what is not committed yet.
  assert AuctionLib.pendingLot(store, 250_000) == 0;
  assert AuctionLib.pendingRemainder(store, 9_000) == 0;
  assert AuctionLib.pendingLot(store, 300_000) == 50_000;
};

// The remainder is never counted twice: nothing is left once it is committed.
do {
  let store = AuctionLib.newStore();
  ignore opened(store, 0, 5_000);
  store.current := null;
  switch (AuctionLib.openWithRemainder(store, 0, 5_000, now)) {
    case (#err(#emptyLot)) {};
    case _ assert false;
  };
  assert store.remainderCommittedE8s == 5_000;
};

// The view carries the remainder of the open lot and what is pending for the next one.
do {
  let store = AuctionLib.newStore();
  let view0 = AuctionLib.buildViewWith(store, 0, 7_000, reserve, [], now);
  assert view0.pendingRemainderE8s == 7_000;
  assert view0.pendingLotE8s == 7_000;
  assert view0.lotRemainderE8s == 0;
  assert not view0.blockSale;
  ignore opened(store, 0, 7_000);
  let view1 = AuctionLib.buildViewWith(store, 0, 7_000, reserve, [], now);
  assert view1.lotSizeE8s == 7_000;
  assert view1.lotRemainderE8s == 7_000;
  assert view1.pendingRemainderE8s == 0;
  assert view1.pendingLotE8s == 0;
  assert view1.blockSale;
};

// Without a winner the remainder is not minted and stays available for the next lot.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 0, 5_000);
  let result = AuctionLib.computeClosing(a, [], reserve, rates, now);
  assert result.auction.servedE8s == 0;
  assert result.auction.carriedOverE8s == 5_000;
  assert result.auction.remainderE8s == 5_000;
  AuctionLib.applyClosing(store, closing, result);
  assert store.remainderCommittedE8s == 0;
  assert store.committedReturnedE8s == 0;
  // The same remainder opens the next lot.
  let next = opened(store, 0, 5_000);
  assert next.lotSizeE8s == 5_000;
  assert next.remainderE8s == 5_000;
};

// The remainder is minted only at settlement, for the winner. A whole-lot winner
// owns the whole remainder; it stays committed until the settlement.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 0, 5_000);
  let result = AuctionLib.computeClosing(a, [bidOf(1, a, alice, 5_000, aboveReserveLow)], reserve, rates, now);
  assert result.auction.servedE8s == 5_000;
  assert result.auction.carriedOverE8s == 0;
  AuctionLib.applyClosing(store, closing, result);
  // Nothing minted yet: still committed to the winner.
  assert store.remainderCommittedE8s == 5_000;
  assert AuctionLib.pendingRemainder(store, 5_000) == 0;
  assert AuctionLib.mintAllocation(closing, bidById(result, 1)) == 5_000;
};

// Returned TTTI-T are served first; only the winners beyond them are minted.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 450_000, 9_000);
  let bids = [
    bidOf(1, a, alice, 200_000, aboveReserveHigh),
    bidOf(2, a, bob, 300_000, aboveReserveLow),
  ];
  let result = AuctionLib.computeClosing(a, bids, reserve, rates, now);
  assert servedOf(result, 1) == 200_000;
  assert servedOf(result, 2) == 259_000;
  AuctionLib.applyClosing(store, closing, result);
  assert AuctionLib.mintAllocation(closing, bidById(result, 1)) == 0;
  assert AuctionLib.mintAllocation(closing, bidById(result, 2)) == 9_000;
  assert store.committedReturnedE8s == 450_000;
  assert store.remainderCommittedE8s == 9_000;
  // The winner who owns the remainder fails: it is released, never minted, and
  // the returned part is released too.
  AuctionLib.recordFailure(store, closing, bidById(result, 2), 0, "test", now);
  assert store.remainderCommittedE8s == 0;
  assert store.committedReturnedE8s == 200_000;
  assert AuctionLib.pendingRemainder(store, 9_000) == 9_000;
};

// Unsold quantity is released first from the remainder (never minted), then from the returned TTTI-T.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 450_000, 9_000);
  let result = AuctionLib.computeClosing(a, [bidOf(1, a, alice, 400_000, aboveReserveHigh)], reserve, rates, now);
  assert result.auction.carriedOverE8s == 59_000;
  AuctionLib.applyClosing(store, closing, result);
  assert store.remainderCommittedE8s == 0;
  assert store.committedReturnedE8s == 400_000;
  assert AuctionLib.mintAllocation(closing, bidById(result, 1)) == 0;
};

// --- Point 3: block sale ---------------------------------------------------------------

// A lot of exactly the minimum of one bid is not sold in block; one e8s below is.
do {
  let s1 = AuctionLib.newStore();
  assert not (opened(s1, Types.MIN_QUANTITY_E8S, 0)).blockSale;
  let s2 = AuctionLib.newStore();
  assert (opened(s2, Types.MIN_QUANTITY_E8S - 1, 0)).blockSale;
};

// A bid for less than the whole lot is refused with #wholeLotRequired; the whole lot is quoted.
do {
  let store = AuctionLib.newStore();
  let a = opened(store, 0, 5_000);
  switch (AuctionLib.quoteDepositFor(a, aboveReserveLow, 4_000)) {
    case (#err(#wholeLotRequired({ lotSizeE8s }))) { assert lotSizeE8s == 5_000 };
    case _ assert false;
  };
  switch (AuctionLib.quoteDepositFor(a, aboveReserveLow, 6_000)) {
    case (#err(#wholeLotRequired(_))) {};
    case _ assert false;
  };
  switch (AuctionLib.quoteDepositIn(store, aboveReserveLow, 4_000)) {
    case (#err(#wholeLotRequired(_))) {};
    case _ assert false;
  };
  switch (AuctionLib.quoteDepositFor(a, aboveReserveLow, 5_000)) {
    case (#ok(required)) { assert required == AuctionLib.depositFormula(aboveReserveLow, 5_000) };
    case _ assert false;
  };
  switch (AuctionLib.quoteDepositFor(a, 0, 5_000)) {
    case (#err(#invalidPrice)) {};
    case _ assert false;
  };
};

// A normal lot still takes partial bids, with the usual minimum.
do {
  let store = AuctionLib.newStore();
  let a = opened(store, 500_000, 0);
  assert not a.blockSale;
  switch (AuctionLib.quoteDepositFor(a, aboveReserveLow, 200_000)) {
    case (#ok(_)) {};
    case _ assert false;
  };
  switch (AuctionLib.quoteDepositFor(a, aboveReserveLow, 50_000)) {
    case (#err(#quantityBelowMinimum(_))) {};
    case _ assert false;
  };
};

// The best price per TTTI-T for the whole lot wins everything; the others are not served.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 0, 5_000);
  let bids = [
    bidOf(1, a, alice, 5_000, aboveReserveLow),
    bidOf(2, a, bob, 5_000, aboveReserveHigh),
    bidOf(3, a, carol, 5_000, aboveReserveLow + 1),
  ];
  let result = AuctionLib.computeClosing(a, bids, reserve, rates, now);
  assert result.auction.blockSale;
  assert servedOf(result, 2) == 5_000;
  assert servedOf(result, 1) == 0;
  assert servedOf(result, 3) == 0;
  assert result.auction.servedE8s == 5_000;
  assert result.auction.carriedOverE8s == 0;
  assert (bidById(result, 2)).pricePaidB == aboveReserveHigh;
  assert (bidById(result, 1)).outcome == #notServed;
  AuctionLib.applyClosing(store, closing, result);
  switch (closing.closed.get(a.id)) {
    case (?c) { assert c.blockSale };
    case null assert false;
  };
};

// Equal prices: the older bid wins the whole lot.
do {
  let store = AuctionLib.newStore();
  let a = opened(store, 0, 5_000);
  let bids = [bidOf(7, a, alice, 5_000, aboveReserveLow), bidOf(6, a, bob, 5_000, aboveReserveLow)];
  let result = AuctionLib.computeClosing(a, bids, reserve, rates, now);
  assert servedOf(result, 6) == 5_000;
  assert servedOf(result, 7) == 0;
};

// Below the reserve there is no sale: the whole lot is carried over.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 0, 5_000);
  let result = AuctionLib.computeClosing(a, [bidOf(1, a, alice, 5_000, belowReserve)], reserve, rates, now);
  assert servedOf(result, 1) == 0;
  assert (bidById(result, 1)).outcome == #discardedBelowReserve;
  assert result.auction.servedE8s == 0;
  assert result.auction.carriedOverE8s == 5_000;
  assert result.auction.status == #unsold;
  AuctionLib.applyClosing(store, closing, result);
  assert store.remainderCommittedE8s == 0;
};

// The reserve price in the paid token is the same rule as for the other lots.
do {
  assert AuctionLib.reservePriceFor(#icp, reserve.reserveUsdE8, ?500_000_000) == ?200_000_000_000;
};

// A block-sale lot made of returned TTTI-T only: the winner mints nothing.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  let a = opened(store, 40_000, 0);
  assert a.blockSale;
  assert a.remainderE8s == 0;
  let result = AuctionLib.computeClosing(a, [bidOf(1, a, alice, 40_000, aboveReserveLow)], reserve, rates, now);
  AuctionLib.applyClosing(store, closing, result);
  assert AuctionLib.mintAllocation(closing, bidById(result, 1)) == 0;
  assert store.committedReturnedE8s == 40_000;
};
