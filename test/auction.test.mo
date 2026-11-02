import Principal "mo:core/Principal";
import AuctionLib "../src/backend/lib/auction";
import Types "../src/backend/types/auction";

// PTM-6a sealed-bid auction offers: pure tests that run in the interpreter.
//
//  1. Deposit formula ceil(2 x B x q x 100 / (99 x 10^8)) for the four tokens.
//  2. Minimum quantity 0.001 TTTI-T and zero price.
//  3. Ten bids per person.
//  4. Lot fixed at opening; TTTI-T returned later forms the next lot.
//  5. The public view reveals nothing about the bids.
//  6. PTM-6b closing: sorting, partial service, reserve floor, own-price
//     payment, returns, carry-over, publication.
//
// The ledger pull (icrc2_transfer_from) and the timer are not run here: they
// need a replica.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

let ONE : Nat = 100_000_000; // 1 TTTI-T in e8s
let NS_24H : Int = 86_400_000_000_000;

func unwrap(r : { #ok : Nat; #err : Types.BidError }) : Nat {
  switch (r) {
    case (#ok(v)) v;
    case (#err(_)) 0;
  };
};

func bidOf(id : Nat, who : Principal) : Types.Bid {
  {
    id;
    auctionId = 1;
    bidder = who;
    token = #icp;
    quantityE8s = ONE;
    priceB = 5;
    requiredDeposit = 11;
    deposited = 12;
    createdAt = 1;
    memo = "TTTI-AB-1";
    block = 7;
  };
};

// --- 1. Deposit formula -------------------------------------------------------

do {
  // 1 TTTI-T at B = 10_000 USD: 2 x 10_000 / 0.99 = 20_202.0202... USD.
  // ckUSDC / ckUSDT (6 decimals): B = 10_000 x 10^6 = 10_000_000_000.
  let b6 : Nat = 10_000_000_000;
  // 2 x 10^10 x 10^8 x 100 / (99 x 10^8) = 20_202_020_202.02..., rounded up.
  assert unwrap(AuctionLib.quoteDeposit(b6, ONE)) == 20_202_020_203;
  assert unwrap(AuctionLib.quoteDeposit(b6, ONE)) == AuctionLib.depositFormula(b6, ONE);
  // ICP (8 decimals) at B = 1_000 ICP: 2 x 1_000 x 10^8 / 0.99 = 202_020_202_020.2..., up.
  let b8 : Nat = 100_000_000_000;
  assert unwrap(AuctionLib.quoteDeposit(b8, ONE)) == 202_020_202_021;
  // ckBTC (8 decimals) at B = 0.1 BTC = 10_000_000 sat: 20_202_021 (exact value 20_202_020.2...).
  let bBtc : Nat = 10_000_000;
  assert unwrap(AuctionLib.quoteDeposit(bBtc, ONE)) == 20_202_021;
  // Half a TTTI-T halves the deposit, rounded up.
  assert unwrap(AuctionLib.quoteDeposit(b6, ONE / 2)) == 10_101_010_102;
  // An exact multiple is not rounded: B = 99, q = 1 TTTI-T -> 2 x 99 / 0.99 = 200.
  assert unwrap(AuctionLib.quoteDeposit(99, ONE)) == 200;
};

// --- 2. Minimum quantity and price ----------------------------------------------

do {
  assert AuctionLib.quoteDeposit(5, 99_999) == #err(#quantityBelowMinimum({ minimum = 100_000 }));
  assert AuctionLib.quoteDeposit(5, 0) == #err(#quantityBelowMinimum({ minimum = 100_000 }));
  // 0.001 TTTI-T is accepted: 2 x 5 x 100_000 x 100 / (99 x 10^8) rounds up to 1.
  assert AuctionLib.quoteDeposit(5, 100_000) == #ok(1);
  assert AuctionLib.quoteDeposit(0, ONE) == #err(#invalidPrice);
  assert AuctionLib.quoteDeposit(AuctionLib.MAX_AMOUNT + 1, ONE) == #err(#invalidPrice);
  assert AuctionLib.quoteDeposit(AuctionLib.MAX_AMOUNT, ONE) == #err(#invalidPrice);
  assert AuctionLib.quoteDeposit(5, AuctionLib.MAX_QUANTITY_E8S + 1) == #err(#invalidPrice);
};

// --- 3. Ten bids per person -------------------------------------------------------

do {
  let store = AuctionLib.newStore();
  var i = 1;
  while (i <= 10) {
    store.bids.add(i, bidOf(i, alice));
    i += 1;
  };
  store.bids.add(11, bidOf(11, bob));
  assert AuctionLib.bidCount(store, alice, 1) == 10;
  assert AuctionLib.bidCount(store, alice, 1) >= Types.MAX_BIDS_PER_PERSON;
  assert AuctionLib.bidCount(store, bob, 1) == 1;
  assert AuctionLib.bidCount(store, bob, 1) < Types.MAX_BIDS_PER_PERSON;
  // A bid whose deposit is not settled yet counts too.
  store.pending.add(
    12,
    {
      n = 12;
      auctionId = 1;
      bidder = bob;
      token = #ckusdc;
      quantityE8s = ONE;
      priceB = 5;
      requiredDeposit = 11;
      deposited = 11;
      createdAt = 1;
    },
  );
  assert AuctionLib.bidCount(store, bob, 1) == 2;
  // Each person reads only their own bids.
  assert AuctionLib.bidsOf(store, alice).size() == 10;
  assert AuctionLib.bidsOf(store, bob).size() == 1;
  assert AuctionLib.bidsOf(store, bob)[0].bidder == bob;
};

// --- 4. Lot fixed at opening ---------------------------------------------------------

do {
  let store = AuctionLib.newStore();
  // Empty returned account: nothing opens.
  assert AuctionLib.openWith(store, 0, 1_000) == #err(#emptyLot);
  assert store.current == null;
  // 3 TTTI-T returned: an auction opens with a 3 TTTI-T lot, closing 24 h later.
  switch (AuctionLib.openWith(store, 3 * ONE, 1_000)) {
    case (#ok(a)) {
      assert a.id == 1;
      assert a.lotSizeE8s == 3 * ONE;
      assert a.openedAt == 1_000;
      assert a.closesAt == 1_000 + NS_24H;
    };
    case (#err(_)) assert false;
  };
  // 2 more TTTI-T returned while the auction is open: the lot is unchanged and
  // no second auction opens; the 2 TTTI-T form the next lot.
  assert AuctionLib.openWith(store, 5 * ONE, 2_000) == #err(#alreadyOpen);
  let during = AuctionLib.buildView(store, 5 * ONE, AuctionLib.reserveFrom(null, null), [], 2_000);
  assert during.lotSizeE8s == 3 * ONE;
  assert during.pendingLotE8s == 2 * ONE;
  assert during.open;
  assert during.closesAt == ?(1_000 + NS_24H);
  assert AuctionLib.pendingLot(store, 5 * ONE) == 2 * ONE;
  // The returned account is never debited here, so the committed amount never
  // exceeds the balance in the lot arithmetic.
  assert AuctionLib.pendingLot(store, 0) == 0;
};

// --- 5. Privacy of the public view ------------------------------------------------------

do {
  let empty = AuctionLib.newStore();
  let busy = AuctionLib.newStore();
  ignore AuctionLib.openWith(empty, 2 * ONE, 10);
  ignore AuctionLib.openWith(busy, 2 * ONE, 10);
  busy.bids.add(1, bidOf(1, alice));
  busy.bids.add(2, bidOf(2, bob));
  busy.pending.add(
    3,
    {
      n = 3;
      auctionId = 1;
      bidder = bob;
      token = #icp;
      quantityE8s = ONE;
      priceB = 5;
      requiredDeposit = 11;
      deposited = 50;
      createdAt = 1;
    },
  );
  let prices : [Types.TokenReservePrice] = [{ token = #icp; price = ?1 }, { token = #ckbtc; price = null }];
  // Same view whether the auction holds no bid or several bids: no bid, no
  // number of bids, no total deposited and no participation is exposed.
  let reserve = AuctionLib.reserveFrom(null, null);
  assert AuctionLib.buildView(busy, 2 * ONE, reserve, prices, 20) == AuctionLib.buildView(empty, 2 * ONE, reserve, prices, 20);
  let v = AuctionLib.buildView(busy, 2 * ONE, reserve, prices, 20);
  assert v.guaranteeRecoverable;
  assert v.minQuantityE8s == 100_000;
  assert v.maxBidsPerPerson == 10;
  assert v.reservePriceUsdE8 == 10_000 * ONE;
  assert v.reserveFloorUsdE8 == 10_000 * ONE;
  assert v.consolidatedPriceUsdE8 == null;
  assert v.dailyAverageUsdE8 == null;
  assert v.reserveBinding == #floor;
  // Past closesAt the view reports the auction as no longer open.
  assert not AuctionLib.buildView(busy, 2 * ONE, reserve, prices, 10 + NS_24H).open;
};

// --- Reserve price in a token -------------------------------------------------------------

do {
  // ICP at 10 USD: 10_000 / 10 = 1_000 ICP per TTTI-T = 100_000_000_000 e8s.
  assert AuctionLib.reservePriceIn(#icp, ?(10 * ONE)) == ?100_000_000_000;
  // ckUSDC at 1 USD (6 decimals): 10_000 USDC = 10_000_000_000.
  assert AuctionLib.reservePriceIn(#ckusdc, ?ONE) == ?10_000_000_000;
  // Absent or expired rate: no value.
  assert AuctionLib.reservePriceIn(#ckbtc, null) == null;
};

// --- Reserve: highest of floor, 24 h average and current consolidated price ---------

do {
  let usd : Nat = ONE; // 1 USD in USD x 1e8
  // Consolidated 12000, average 11000: the current price is the reserve.
  let a = AuctionLib.reserveFrom(?(12_000 * usd), ?(11_000 * usd));
  assert a.reserveUsdE8 == 12_000 * usd;
  assert a.binding == #consolidated;
  // Consolidated 11000, average 13000: the 24 h average is the reserve.
  let b = AuctionLib.reserveFrom(?(11_000 * usd), ?(13_000 * usd));
  assert b.reserveUsdE8 == 13_000 * usd;
  assert b.binding == #dailyAverage;
  // Market under 10000: the floor stays; no offer below it can pass.
  let c = AuctionLib.reserveFrom(?(9_000 * usd), ?(9_500 * usd));
  assert c.reserveUsdE8 == 10_000 * usd;
  assert c.binding == #floor;
  assert c.consolidatedUsdE8 == ?(9_000 * usd);
  assert c.dailyAverageUsdE8 == ?(9_500 * usd);
  // Unavailable components are ignored.
  let d = AuctionLib.reserveFrom(null, null);
  assert d.reserveUsdE8 == 10_000 * usd;
  assert d.binding == #floor;
  // One component available only.
  assert AuctionLib.reserveFrom(?(12_000 * usd), null).reserveUsdE8 == 12_000 * usd;
  assert AuctionLib.reserveFrom(null, ?(14_000 * usd)).reserveUsdE8 == 14_000 * usd;
  assert AuctionLib.reserveFrom(null, ?(14_000 * usd)).binding == #dailyAverage;
  // Ties go to the floor, then to the current consolidated price.
  assert AuctionLib.reserveFrom(?(10_000 * usd), ?(10_000 * usd)).binding == #floor;
  assert AuctionLib.reserveFrom(?(12_000 * usd), ?(12_000 * usd)).binding == #consolidated;
  // The view carries the effective reserve and its three components.
  let store = AuctionLib.newStore();
  let v = AuctionLib.buildView(store, 0, b, [], 1);
  assert v.reservePriceUsdE8 == 13_000 * usd;
  assert v.reserveFloorUsdE8 == 10_000 * usd;
  assert v.consolidatedPriceUsdE8 == ?(11_000 * usd);
  assert v.dailyAverageUsdE8 == ?(13_000 * usd);
  assert v.reserveBinding == #dailyAverage;
  // Per-token equivalent of the effective reserve at the current rate.
  // ICP at 10 USD: 13_000 / 10 = 1_300 ICP = 130_000_000_000 e8s.
  assert AuctionLib.reservePriceFor(#icp, 13_000 * usd, ?(10 * ONE)) == ?130_000_000_000;
  // ckUSDC at 1 USD (6 decimals): 12_000 USDC.
  assert AuctionLib.reservePriceFor(#ckusdc, 12_000 * usd, ?ONE) == ?12_000_000_000;
  // Absent or expired rate: no value.
  assert AuctionLib.reservePriceFor(#ckbtc, 13_000 * usd, null) == null;
};

// --- 6. PTM-6b closing ---------------------------------------------------------------------

func newClosing() : Types.ClosingStore {
  AuctionLib.newClosingStore();
};

// A bid with a deposit of the required amount plus 10 (the excess).
func cbid(id : Nat, who : Principal, token : Types.PayToken, q : Nat, price : Nat, createdAt : Int) : Types.Bid {
  let required = AuctionLib.depositFormula(price, q);
  {
    id;
    auctionId = 1;
    bidder = who;
    token;
    quantityE8s = q;
    priceB = price;
    requiredDeposit = required;
    deposited = required + 10;
    createdAt;
    memo = "TTTI-AB-1";
    block = 1;
  };
};

func auctionOf(lot : Nat) : Types.Auction {
  { id = 1; openedAt = 1; closesAt = 1 + NS_24H; lotSizeE8s = lot; blockSale = false; remainderE8s = 0 };
};

// ICP at 10 USD and ckUSDC at 1 USD; ckBTC and ckUSDT as given.
func ratesOf(ckbtc : ?Nat, ckusdt : ?Nat) : [Types.ClosingRate] {
  [{ token = #icp; usdE8 = ?(10 * ONE) }, { token = #ckbtc; usdE8 = ckbtc }, { token = #ckusdc; usdE8 = ?ONE }, { token = #ckusdt; usdE8 = ckusdt }];
};

func outcomeOf(r : AuctionLib.ClosingResult, id : Nat) : Types.ClosedBid {
  switch (r.bids.find(func(b : Types.ClosedBid) : Bool { b.id == id })) {
    case (?b) b;
    case null { assert false; r.bids[0] };
  };
};

// Offers (price in USD, quantity, createdAt):
//  1: alice ICP    15_000 USD x 1 TTTI-T, created 5
//  2: bob   ckUSDC 15_000 USD x 2 TTTI-T, created 3  (same price, larger volume)
//  3: alice ICP    10_000 USD x 1 TTTI-T, created 4  (exactly the floor)
//  4: bob   ICP    just under 10_000 USD x 1 TTTI-T  (below the floor)
//  5: alice ckUSDC 15_000 USD x 1 TTTI-T, created 2  (same price and volume as 1, older)
let offers : [Types.Bid] = [
  cbid(1, alice, #icp, ONE, 150_000_000_000, 5),
  cbid(2, bob, #ckusdc, 2 * ONE, 15_000_000_000, 3),
  cbid(3, alice, #icp, ONE, 100_000_000_000, 4),
  cbid(4, bob, #icp, ONE, 99_999_999_999, 1),
  cbid(5, alice, #ckusdc, ONE, 15_000_000_000, 2),
];

// Sorting, partial service, reserve floor (market under 10_000 USD), own price.
do {
  let floor = AuctionLib.reserveFrom(?(9_000 * ONE), ?(9_500 * ONE));
  assert floor.reserveUsdE8 == 10_000 * ONE;
  // Lot 3.5 TTTI-T: offer 2 (volume), offer 5 (older than 1), then 1 in part.
  let r = AuctionLib.computeClosing(auctionOf(3 * ONE + ONE / 2), offers, floor, ratesOf(null, null), 2 + NS_24H);
  let b1 = outcomeOf(r, 1);
  let b2 = outcomeOf(r, 2);
  let b3 = outcomeOf(r, 3);
  let b4 = outcomeOf(r, 4);
  let b5 = outcomeOf(r, 5);
  assert b2.outcome == #served and b2.servedE8s == 2 * ONE;
  assert b5.outcome == #served and b5.servedE8s == ONE;
  // The last served offer is served in part; offer 3 is not reached.
  assert b1.outcome == #partiallyServed and b1.servedE8s == ONE / 2;
  assert b3.outcome == #notServed and b3.servedE8s == 0;
  // Under the floor: discarded, although in the market's range.
  assert b4.outcome == #discardedBelowReserve and b4.servedE8s == 0;
  // Each winner pays their own price.
  assert b1.pricePaidB == 150_000_000_000;
  assert b2.pricePaidB == 15_000_000_000;
  assert b3.pricePaidB == 0 and b4.pricePaidB == 0;
  // Deposit of the served quantity at the offer's own price, the rest returned.
  assert b2.servedDeposit == AuctionLib.depositFormula(15_000_000_000, 2 * ONE);
  assert b2.returned == 10;
  assert b1.servedDeposit == AuctionLib.depositFormula(150_000_000_000, ONE / 2);
  assert b1.returned == b1.deposited - b1.servedDeposit;
  assert b1.returned > 10;
  // Unserved and discarded offers get the whole deposit back.
  assert b3.servedDeposit == 0 and b3.returned == b3.deposited;
  assert b4.servedDeposit == 0 and b4.returned == b4.deposited;
  // Nothing is lost: kept + returned = deposited for every offer.
  for (b in r.bids.values()) { assert b.servedDeposit + b.returned == b.deposited };
  assert r.auction.status == #fullySold;
  assert r.auction.servedE8s == 3 * ONE + ONE / 2;
  assert r.auction.carriedOverE8s == 0;
  assert r.auction.bidCount == 5;
  assert r.auction.reserve.reserveUsdE8 == 10_000 * ONE;
  assert r.auction.reserve.consolidatedUsdE8 == ?(9_000 * ONE);
  assert r.auction.reserve.dailyAverageUsdE8 == ?(9_500 * ONE);
  assert r.auction.closedAt == 2 + NS_24H;
};

// Reserve above the floor: an offer at the floor no longer passes; the
// serving order does not depend on the input order.
do {
  let high = AuctionLib.reserveFrom(?(12_000 * ONE), null);
  let reversed = offers.reverse();
  let r = AuctionLib.computeClosing(auctionOf(10 * ONE), reversed, high, ratesOf(null, null), 2 + NS_24H);
  assert outcomeOf(r, 3).outcome == #discardedBelowReserve;
  assert outcomeOf(r, 4).outcome == #discardedBelowReserve;
  // 2 + 1 + 1 = 4 TTTI-T served of 10: the rest is carried over.
  assert r.auction.servedE8s == 4 * ONE;
  assert r.auction.carriedOverE8s == 6 * ONE;
  assert r.auction.status == #partiallySold;
  let again = AuctionLib.computeClosing(auctionOf(10 * ONE), offers, high, ratesOf(null, null), 2 + NS_24H);
  assert again.bids.size() == 5;
  assert outcomeOf(again, 1).servedE8s == outcomeOf(r, 1).servedE8s;
};

// Remainder under the minimum quantity is not served and is carried over.
do {
  let floor = AuctionLib.reserveFrom(null, null);
  let lot = 2 * ONE + 99_999;
  let r = AuctionLib.computeClosing(auctionOf(lot), offers, floor, ratesOf(null, null), 2 + NS_24H);
  assert outcomeOf(r, 2).outcome == #served;
  // 99_999 e8s remain, under 100_000: offer 5 is not served.
  assert outcomeOf(r, 5).outcome == #notServed;
  assert outcomeOf(r, 1).outcome == #notServed;
  assert r.auction.servedE8s == 2 * ONE;
  assert r.auction.carriedOverE8s == 99_999;
  assert r.auction.status == #partiallySold;
  // A remainder exactly at the minimum is served.
  let r2 = AuctionLib.computeClosing(auctionOf(2 * ONE + 100_000), offers, floor, ratesOf(null, null), 2 + NS_24H);
  assert outcomeOf(r2, 5).outcome == #partiallyServed;
  assert outcomeOf(r2, 5).servedE8s == 100_000;
};

// No valid offer: unsold, the whole lot is carried over.
do {
  let floor = AuctionLib.reserveFrom(null, null);
  let low = [cbid(1, alice, #icp, ONE, 5, 1)];
  let r = AuctionLib.computeClosing(auctionOf(ONE), low, floor, ratesOf(null, null), 2 + NS_24H);
  assert r.auction.status == #unsold;
  assert r.auction.servedE8s == 0;
  assert r.auction.carriedOverE8s == ONE;
  assert outcomeOf(r, 1).outcome == #discardedBelowReserve;
  assert outcomeOf(r, 1).returned == outcomeOf(r, 1).deposited;
  let none = AuctionLib.computeClosing(auctionOf(ONE), [], floor, ratesOf(null, null), 2 + NS_24H);
  assert none.auction.status == #unsold;
  assert none.auction.bidCount == 0;
  assert none.auction.carriedOverE8s == ONE;
};

// applyClosing: bids leave the open store, balances are credited, the unsold
// quantity is released, readers publish the result.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  ignore AuctionLib.openWith(store, 3 * ONE + ONE / 2, 1);
  assert store.committedReturnedE8s == 3 * ONE + ONE / 2;
  // Lot 3.5 with only offers 1, 2 and 3 valid: 2 and 1 served, 3 not.
  for (b in offers.values()) { store.bids.add(b.id, b) };
  closing.closingSince := ?5;
  let floor = AuctionLib.reserveFrom(null, null);
  let auction = switch (store.current) { case (?a) a; case null { assert false; auctionOf(0) } };
  let bidsNow = AuctionLib.bidsOf(store, alice).concat(AuctionLib.bidsOf(store, bob));
  let r = AuctionLib.computeClosing(auction, bidsNow, floor, ratesOf(null, null), 2 + NS_24H);
  // Reading does not write anything.
  assert store.bids.size() == 5;
  assert closing.closed.size() == 0;
  AuctionLib.applyClosing(store, closing, r);
  assert store.current == null;
  assert store.bids.size() == 0;
  assert closing.closingSince == null;
  assert closing.closed.size() == 1;
  // Fully sold: nothing released from the committed returned TTTI-T.
  assert store.committedReturnedE8s == 3 * ONE + ONE / 2;
  // Alice: offers 1 (part), 3 (nothing), 5 (served) in ICP and ckUSDC.
  let aliceBalances = AuctionLib.myBalances(closing, alice);
  assert aliceBalances.size() == 2;
  let aliceIcp = aliceBalances[0];
  assert aliceIcp.token == #icp;
  assert aliceIcp.pendingSettlement == outcomeOf(r, 1).servedDeposit;
  assert aliceIcp.withdrawable == outcomeOf(r, 1).returned + outcomeOf(r, 3).returned;
  let aliceUsdc = aliceBalances[1];
  assert aliceUsdc.token == #ckusdc;
  assert aliceUsdc.pendingSettlement == outcomeOf(r, 5).servedDeposit;
  assert aliceUsdc.withdrawable == 10;
  // Bob: offer 2 (served) in ckUSDC and offer 4 (discarded) in ICP.
  let bobBalances = AuctionLib.myBalances(closing, bob);
  assert bobBalances.size() == 2;
  assert bobBalances[1].pendingSettlement == outcomeOf(r, 2).servedDeposit;
  assert bobBalances[0].withdrawable == outcomeOf(r, 4).deposited;
  assert bobBalances[0].pendingSettlement == 0;
  // Every deposit is held again, as pending settlement or withdrawable.
  var held = 0;
  for (b in closing.balances.values()) { held += b.withdrawable + b.pendingSettlement };
  var deposited = 0;
  for (b in offers.values()) { deposited += b.deposited };
  // Different tokens are added as raw amounts here, only to check conservation.
  assert held == deposited;
  // Nobody else has a balance.
  assert AuctionLib.myBalances(closing, Principal.fromText("2vxsx-fae")).size() == 0;
  // Publication: all bids of the closed auction, none while unknown.
  switch (AuctionLib.auctionResult(closing, 1)) {
    case (?res) {
      assert res.bids.size() == 5;
      assert res.auction.id == 1;
    };
    case null assert false;
  };
  assert AuctionLib.auctionResult(closing, 2) == null;
  // Newest first.
  closing.closed.add(2, { r.auction with id = 2 });
  let listed = AuctionLib.closedAuctions(closing);
  assert listed.size() == 2;
  assert listed[0].id == 2;
  assert listed[1].id == 1;
  // The next lot opens with the remaining returned TTTI-T.
  assert AuctionLib.pendingLot(store, 5 * ONE) == ONE + ONE / 2;
};

// Carry-over is released from the committed amount.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  ignore AuctionLib.openWith(store, 10 * ONE, 1);
  let auction = switch (store.current) { case (?a) a; case null { assert false; auctionOf(0) } };
  let high = AuctionLib.reserveFrom(?(12_000 * ONE), null);
  let r = AuctionLib.computeClosing(auction, offers, high, ratesOf(null, null), 2 + NS_24H);
  AuctionLib.applyClosing(store, closing, r);
  // 4 TTTI-T served stay committed; 6 TTTI-T join the next lot.
  assert store.committedReturnedE8s == 4 * ONE;
  assert AuctionLib.pendingLot(store, 10 * ONE) == 6 * ONE;
  assert closing.closed.size() == 1;
  // The next auction id follows.
  switch (AuctionLib.openWith(store, 10 * ONE, 3 + NS_24H)) {
    case (#ok(a)) { assert a.id == 2; assert a.lotSizeE8s == 6 * ONE };
    case (#err(_)) assert false;
  };
};

// Offer price conversion: priceB x rate / 10^decimals in USD x 1e8, scaled by 1e8.
do {
  // 1_000 ICP at 10 USD = 10_000 USD.
  assert AuctionLib.priceScaled(#icp, 100_000_000_000, 10 * ONE) == 10_000 * ONE * ONE;
  // 10_000 ckUSDC at 1 USD = 10_000 USD.
  assert AuctionLib.priceScaled(#ckusdc, 10_000_000_000, ONE) == 10_000 * ONE * ONE;
  // Balance key.
  assert AuctionLib.balanceKey(alice, #ckusdt) == "aaaaa-aa:ckusdt";
};

// --- 7. PTM-6c settlement of the winners ---------------------------------------------------

// Amounts: taken = 2 x B x q / 0.99 (rounded up), 1 % to the creator, B x q
// for the position and B x q for the guarantee.
do {
  // 1 TTTI-T at 1_500 ICP (e8s): B x q = 1_500 ICP.
  let a = AuctionLib.settleAmounts(150_000_000_000, ONE);
  assert a.position == 150_000_000_000;
  assert a.guarantee == 150_000_000_000;
  assert a.taken == AuctionLib.depositFormula(150_000_000_000, ONE);
  assert a.taken * 99 >= 2 * 150_000_000_000 * 100; // rounded up
  assert a.taken * 99 < 2 * 150_000_000_000 * 100 + 99;
  assert a.creator == a.taken / 100;
  assert a.creator + 2 * a.position + a.dust == a.taken;
  // Half a TTTI-T halves the position.
  let h = AuctionLib.settleAmounts(150_000_000_000, ONE / 2);
  assert h.position == 75_000_000_000;
};

// Fee of the internal move (auction custody to DEX custody): borne by the
// creator share first (never below zero), the rest by the winner's own excess.
do {
  // 1 TTTI-T at 1_500 ICP: creator share is about 30.3 ICP, far above the 10_000 e8s fee.
  let a = AuctionLib.settleAmounts(150_000_000_000, ONE);
  let fee = 10_000;
  assert AuctionLib.feeBorneByCreator(a, fee) == fee;
  // An exact deposit (credit = taken - fee) is enough: the credit plus the fee borne equals taken.
  assert AuctionLib.requiredCredit(a, fee) == a.taken - fee;
  assert a.taken - fee + AuctionLib.feeBorneByCreator(a, fee) == a.taken;
  // The creator is credited 1 % net of the fee, and the amounts of the position and guarantee stay exact.
  assert a.creator - AuctionLib.feeBorneByCreator(a, fee) == a.taken / 100 - fee;
  assert a.position == 150_000_000_000 and a.guarantee == 150_000_000_000;
  // Creator share smaller than the fee: the creator bears all of it (net zero), the winner's excess covers the rest.
  let small = AuctionLib.settleAmounts(100, 1_000_000); // B x q = 1, taken = 3, creator = 0
  assert small.creator == 0;
  assert AuctionLib.feeBorneByCreator(small, 5) == 0;
  assert AuctionLib.requiredCredit(small, 5) == small.taken;
  let mid = AuctionLib.settleAmounts(100_000, ONE); // B x q = 100_000, taken = 202_021, creator = 2_020
  assert mid.creator == 2_020;
  assert AuctionLib.feeBorneByCreator(mid, 10_000) == 2_020;
  assert AuctionLib.requiredCredit(mid, 10_000) == mid.taken - 2_020;
  // Shortfall the winner's excess must cover: fee - fee borne.
  assert 10_000 - AuctionLib.feeBorneByCreator(mid, 10_000) == 7_980;
  assert 10_000 - AuctionLib.feeBorneByCreator(a, 10_000) == 0;
  // Zero fee: nothing borne, the whole amount is required.
  assert AuctionLib.requiredCredit(a, 0) == a.taken;
};

// Ranking of the pending winners, and the failure case.
do {
  let store = AuctionLib.newStore();
  let closing = newClosing();
  ignore AuctionLib.openWith(store, 10 * ONE, 1);
  let auction = switch (store.current) { case (?a) a; case null { assert false; auctionOf(0) } };
  let high = AuctionLib.reserveFrom(?(12_000 * ONE), null);
  let r = AuctionLib.computeClosing(auction, offers, high, ratesOf(null, null), 2 + NS_24H);
  AuctionLib.applyClosing(store, closing, r);
  assert store.committedReturnedE8s == 4 * ONE;
  // Same price: larger volume first (2), then the older of equal volumes (5 before 1).
  let winners = AuctionLib.pendingWinners(closing, r.auction);
  assert winners.size() == 3;
  assert winners[0].id == 2;
  assert winners[1].id == 5;
  assert winners[2].id == 1;
  // Winner 5 fails: its quantity leaves the commitment and is carried; the others stay pending.
  let w5 = winners[1];
  AuctionLib.recordFailure(store, closing, w5, w5.servedDeposit, "test", 10);
  assert store.committedReturnedE8s == 3 * ONE;
  assert closing.failedCarriedE8s.get(1) == ?ONE;
  switch (closing.settlements.get(5)) {
    case (?st) {
      assert st.status == #failed;
      assert st.surplusReturned == w5.servedDeposit;
      assert st.carriedE8s == ONE;
      assert st.settledE8s == 0;
      assert st.positionId == null;
    };
    case null assert false;
  };
  let after = AuctionLib.pendingWinners(closing, r.auction);
  assert after.size() == 2;
  assert after[0].id == 2 and after[1].id == 1;
  // A failure is final: recording it again changes nothing.
  AuctionLib.recordFailure(store, closing, w5, w5.servedDeposit, "again", 11);
  assert store.committedReturnedE8s == 3 * ONE;
  assert closing.failedCarriedE8s.get(1) == ?ONE;
};
