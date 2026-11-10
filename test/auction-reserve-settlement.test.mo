import Blob "mo:core/Blob";
import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import AuctionLib "../src/backend/lib/auction";
import DexTypes "../src/backend/types/dex";
import FeeTypes "../src/backend/types/protocol-fees";
import Types "../src/backend/types/auction";

// Auction reserve outside settlement windows: pure tests that run in the
// interpreter.
//
//  1. settlementWindows: derived from closed auctions and their settlements.
//  2. reserveBreakdownOutsideSettlement:
//     - no window: identical to reserveBreakdown;
//     - finished window: its samples leave the 24 h average;
//     - running window: the current price is the last sample taken before it
//       started (the live price already contains the pooling).
//
// Prices are USD x 1e8 per whole TTTI-T. The reserve floor is 10 000 USD.

let alice = Principal.fromText("aaaaa-aa");
let now : Int = 1_000_000_000_000_000_000;
let HOUR : Int = 3_600_000_000_000;
let USD : Nat = 100_000_000;

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let usdcToken : DexTypes.PoolToken = {
  ledger = #external(Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"));
  symbol = "ckUSDC";
  decimals = 6;
};

func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ckUSDC") ?USD else null;
};

// One TTTI-T/ckUSDC pool at `usd` USD per TTTI-T (0.1 TTTI-T against usd/10 USDC).
func storeAt(usd : Nat) : DexTypes.DexStore {
  let pool : DexTypes.Pool = {
    id = 1;
    token0 = tttiToken;
    token1 = usdcToken;
    feeTier = #bps30;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    minimumLocked = { token0 = null; token1 = null };
    newPairBadgeUntil = null;
    requestId = null;
    removedAt = null;
    reserve0 = 10_000_000;
    reserve1 = usd / 10 * 1_000_000;
    totalShares = 1_000_000;
    lockedShares = 0;
    protocolFee0 = 0;
    protocolFee1 = 0;
    lockedFeesPaid0 = 0;
    lockedFeesPaid1 = 0;
  };
  let map = Map.empty<Nat, DexTypes.Pool>();
  map.add(1, pool);
  {
    pools = map;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 2;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 1;
    removals = Map.empty<DexTypes.PoolId, DexTypes.PairRemoval>();
    icpswapSamples = Map.empty<Text, DexTypes.IcpSwapSample>();
    referenceReadings = Map.empty<Text, DexTypes.ReferenceReading>();
    poolPositions = Map.empty<DexTypes.PoolId, Set.Set<DexTypes.PositionId>>();
    fees = {
      var dayStart = 0;
      var nextSharingAt = 86_400_000_000_000;
      pots = Map.empty<DexTypes.PoolId, DexTypes.PoolPot>();
      locks = Map.empty<DexTypes.PositionId, DexTypes.PositionLock>();
      unpaid = Map.empty<Text, DexTypes.UnpaidShare>();
    };
  };
};

func samplesOf(items : [(Int, Nat)]) : List.List<FeeTypes.ConsolidatedSample> {
  let list = List.empty<FeeTypes.ConsolidatedSample>();
  for ((at, usd) in items.values()) { list.add({ at; priceUsdE8 = usd * USD }) };
  list;
};

// --- 1. settlementWindows -------------------------------------------------------------------

func closedAuction(id : Nat, closedAt : Int) : Types.ClosedAuction {
  {
    id;
    openedAt = closedAt - HOUR;
    closesAt = closedAt;
    closedAt;
    lotSizeE8s = 10_000_000;
    blockSale = false;
    remainderE8s = 0;
    reserve = AuctionLib.reserveFrom(null, null);
    rates = [];
    bidCount = 1;
    servedE8s = 10_000_000;
    carriedOverE8s = 0;
    status = #fullySold;
  };
};

func closedBid(id : Nat, auctionId : Nat, served : Nat) : Types.ClosedBid {
  {
    id;
    auctionId;
    bidder = alice;
    token = #ckusdc;
    quantityE8s = 10_000_000;
    priceB = 0;
    requiredDeposit = 0;
    deposited = 0;
    createdAt = 0;
    choice = #pool;
    outcome = if (served > 0) #served else #notServed;
    servedE8s = served;
    pricePaidB = 0;
    servedDeposit = 0;
    returned = 0;
  };
};

func settlement(auctionId : Nat, bidId : Nat, status : Types.SettlementStatus, settledAt : ?Int) : Types.BidSettlement {
  {
    auctionId;
    bidId;
    bidder = alice;
    token = #ckusdc;
    status;
    settledE8s = 0;
    mintedE8s = 0;
    takenAmount = 0;
    creatorShare = 0;
    positionAmount = 0;
    guaranteeAmount = 0;
    surplusReturned = 0;
    carriedE8s = 0;
    positionId = null;
    mShareE6 = 0;
    choice = #pool;
    lockedAmount = 0;
    lockedPositionId = null;
    handE8s = 0;
    failureReason = null;
    attemptedAt = null;
    settledAt;
  };
};

// A settlement still pending: the window is open (no end).
do {
  let closing = AuctionLib.newClosingStore();
  closing.closed.add(1, closedAuction(1, now - 5 * HOUR));
  closing.closedBids.add(1, [closedBid(10, 1, 10_000_000)]);
  closing.settlements.add(10, settlement(1, 10, #pending, null));
  let w = AuctionLib.settlementWindows(closing, now);
  assert w.size() == 1;
  assert w[0].from == now - 5 * HOUR;
  assert w[0].to == null;
};

// A settled auction: the window ends at the last final settlement.
do {
  let closing = AuctionLib.newClosingStore();
  closing.closed.add(1, closedAuction(1, now - 5 * HOUR));
  closing.closedBids.add(1, [closedBid(10, 1, 6_000_000), closedBid(11, 1, 4_000_000)]);
  closing.settlements.add(10, settlement(1, 10, #settled, ?(now - 4 * HOUR)));
  closing.settlements.add(11, settlement(1, 11, #settled, ?(now - 3 * HOUR)));
  let w = AuctionLib.settlementWindows(closing, now);
  assert w.size() == 1;
  assert w[0].from == now - 5 * HOUR;
  assert w[0].to == ?(now - 3 * HOUR);
};

// No served bid: no window. Fully settled and older than 24 h: skipped.
do {
  let closing = AuctionLib.newClosingStore();
  closing.closed.add(1, closedAuction(1, now - 5 * HOUR));
  closing.closedBids.add(1, [closedBid(10, 1, 0)]);
  assert AuctionLib.settlementWindows(closing, now).size() == 0;

  closing.closed.add(2, closedAuction(2, now - 40 * HOUR));
  closing.closedBids.add(2, [closedBid(20, 2, 10_000_000)]);
  closing.settlements.add(20, settlement(2, 20, #settled, ?(now - 39 * HOUR)));
  assert AuctionLib.settlementWindows(closing, now).size() == 0;
};

// --- 2. Reserve outside the settlement windows ------------------------------------------------

// Samples (USD): before the window 12 000 (10 h ago) and 13 000 (8 h ago),
// during the window 30 000 (4 h ago, raised by the pooling), after it 12 500 (2 h ago).
let samples = samplesOf([(now - 10 * HOUR, 12_000), (now - 8 * HOUR, 13_000), (now - 4 * HOUR, 30_000), (now - 2 * HOUR, 12_500)]);

// No window: identical to the plain reserve (every sample counts, live price).
do {
  let dex = storeAt(12_000);
  let plain = AuctionLib.reserveBreakdown(dex, samples, rateOf, now);
  let outside = AuctionLib.reserveBreakdownOutsideSettlement(dex, samples, rateOf, [], now);
  assert outside == plain;
  assert plain.consolidatedUsdE8 == ?(12_000 * USD);
  assert plain.dailyAverageUsdE8 == ?(16_875 * USD); // (12 + 13 + 30 + 12.5) / 4 thousand
  assert plain.reserveUsdE8 == 16_875 * USD;
  assert plain.binding == #dailyAverage;
};

// Finished window [5 h ago, 3 h ago]: the 30 000 sample leaves the average.
do {
  let dex = storeAt(12_000);
  let windows : [AuctionLib.SettlementWindow] = [{ from = now - 5 * HOUR; to = ?(now - 3 * HOUR) }];
  let r = AuctionLib.reserveBreakdownOutsideSettlement(dex, samples, rateOf, windows, now);
  assert r.dailyAverageUsdE8 == ?(12_500 * USD); // (12 + 13 + 12.5) / 3 thousand
  assert r.consolidatedUsdE8 == ?(12_000 * USD); // live price: the settlement is over
  assert r.reserveUsdE8 == 12_500 * USD;
  assert r.binding == #dailyAverage;
  // The boundaries belong to the window.
  let edge : [AuctionLib.SettlementWindow] = [{ from = now - 4 * HOUR; to = ?(now - 4 * HOUR) }];
  let e = AuctionLib.reserveBreakdownOutsideSettlement(dex, samples, rateOf, edge, now);
  assert e.dailyAverageUsdE8 == ?(12_500 * USD);
};

// Running settlement from 5 h ago, pool price already pushed to 20 000 by the
// pooling: the current price is the last sample before the window (13 000),
// never the live 20 000, and the in-window samples leave the average.
do {
  let dex = storeAt(20_000);
  let windows : [AuctionLib.SettlementWindow] = [{ from = now - 5 * HOUR; to = null }];
  let plain = AuctionLib.reserveBreakdown(dex, samples, rateOf, now);
  assert plain.consolidatedUsdE8 == ?(20_000 * USD);
  let r = AuctionLib.reserveBreakdownOutsideSettlement(dex, samples, rateOf, windows, now);
  assert r.consolidatedUsdE8 == ?(13_000 * USD);
  assert r.dailyAverageUsdE8 == ?(12_500 * USD); // only the two samples before the window
  assert r.reserveUsdE8 == 13_000 * USD;
  assert r.binding == #consolidated;
  assert r.reserveUsdE8 < plain.reserveUsdE8;
};

// Running settlement with no sample before it: no current price and no average,
// the reserve falls back to the floor (the live price is not used).
do {
  let dex = storeAt(20_000);
  let windows : [AuctionLib.SettlementWindow] = [{ from = now - 11 * HOUR; to = null }];
  let r = AuctionLib.reserveBreakdownOutsideSettlement(dex, samples, rateOf, windows, now);
  assert r.consolidatedUsdE8 == null;
  assert r.dailyAverageUsdE8 == null;
  assert r.reserveUsdE8 == 10_000 * USD;
  assert r.binding == #floor;
};

// The floor still applies when the prices outside the window are low.
do {
  let dex = storeAt(12_000);
  let low = samplesOf([(now - 8 * HOUR, 9_000), (now - 4 * HOUR, 30_000)]);
  let windows : [AuctionLib.SettlementWindow] = [{ from = now - 5 * HOUR; to = null }];
  let r = AuctionLib.reserveBreakdownOutsideSettlement(dex, low, rateOf, windows, now);
  assert r.consolidatedUsdE8 == ?(9_000 * USD);
  assert r.reserveUsdE8 == 10_000 * USD;
  assert r.binding == #floor;
};
