import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/auction";
import DexTypes "../types/dex";
import RetryTypes "../types/retry";
import ProtocolFeeTypes "../types/protocol-fees";
import DexLib "dex";
import IcrcLib "icrc";
import LiquidityMintLib "liquidity-mint";
import OracleLib "oracle";
import PayTokenLib "pay-token";
import PresaleLib "presale";
import RetryLib "retry";

// PTM-6a: sealed-bid auction of the returned TTTI-T (offers). PTM-6b: closing
// (reserve at closing, ordering, own-price service, returns to the withdrawable
// balance, carry-over, publication). Withdrawal of the withdrawable balance,
// settlement of the served deposits and re-issuing the TTTI-T belong to later
// lots. Nothing here burns or sends TTTI-T and no ledger balance or block is
// rewritten; the lot is only a number derived from the balance of the returned
// account.
module {
  // Largest amount accepted for a price, a quantity or a deposit (2^128 - 1).
  public let MAX_AMOUNT : Nat = 340_282_366_920_938_463_463_374_607_431_768_211_455;
  // Largest quantity of one bid in e8s (2^64 - 1).
  public let MAX_QUANTITY_E8S : Nat = 18_446_744_073_709_551_615;
  // Interval of the opening / reconciliation timer.
  public let TIMER_SECONDS : Nat = 60;

  let TTTI_E8S : Nat = 100_000_000;

  public func newStore() : Types.AuctionStore {
    {
      var current = null;
      var committedReturnedE8s = 0;
      var remainderCommittedE8s = 0;
      var nextAuctionId = 1;
      var nextBidId = 1;
      bids = Map.empty();
      pending = Map.empty();
    };
  };

  // PTM-9d: an empty closing store (no closed auction, no balance, no move).
  public func newClosingStore() : Types.ClosingStore {
    {
      var closingSince = null;
      closed = Map.empty();
      closedBids = Map.empty();
      balances = Map.empty();
      settlements = Map.empty();
      failedCarriedE8s = Map.empty();
      moves = Map.empty();
      movesByBidder = Map.empty();
      activeMoves = Set.empty();
      settledAuctions = Set.empty();
      dust = Map.empty();
    };
  };

  func dexToken(token : Types.PayToken) : DexTypes.DexToken {
    switch (token) {
      case (#icp) #icp;
      case (#ckbtc) #ckbtc;
      case (#ckusdc) #ckusdc;
      case (#ckusdt) #ckusdt;
    };
  };

  // --- Deposit ---------------------------------------------------------------

  // PTM-11: ceil((priceB + reserveUnit) x quantityE8s x 100 / (99 x 10^8)):
  // (B + 10 000 USD) x quantity / 0.99 in the token's smallest unit (priceB and
  // reserveUnit per whole TTTI-T, quantity in e8s). reserveUnit is 10 000 USD
  // in the token's smallest unit at the current rate (see reserveUnitOf).
  // PTM-10b: this is the payment of choice #pool (A), the maximum; it is the
  // deposit basis of every bid. The payment of the bid's choice at the
  // locked share m is LiquidityMintLib.winnerTaken.
  public func depositFormula(priceB : Nat, reserveUnit : Nat, quantityE8s : Nat) : Nat {
    let numerator = (priceB + reserveUnit) * quantityE8s * 100;
    let denominator = 99 * TTTI_E8S;
    (numerator + denominator - 1) / denominator;
  };

  // PTM-11: 10 000 USD per whole TTTI-T in the token's smallest unit at the
  // usable rate of the token; null when the rate is absent or expired.
  public func reserveUnitOf(oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, token : Types.PayToken, now : Int) : ?Nat {
    switch (OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, token), now)) {
      case (?rate) {
        let unit = LiquidityMintLib.mintTargetTokenPerTtti(rate, 10 ** PayTokenLib.expectedDecimals(token).toNat());
        if (unit == 0) null else ?unit;
      };
      case null null;
    };
  };

  // PTM-11: the reserve part of a bid is held in the paid token itself, so no
  // conversion cost is added to the deposit: the buffer is always 0.
  public func conversionBuffer(_token : Types.PayToken, _reserveAmount : Nat) : Nat = 0;

  // Required deposit of a bid, or the reason it is refused. Shared by the quote
  // and by the bid placement.
  public func quoteDeposit(priceB : Nat, reserveUnit : Nat, quantityE8s : Nat) : Result.Result<Nat, Types.BidError> {
    if (quantityE8s < Types.MIN_QUANTITY_E8S) {
      return #err(#quantityBelowMinimum({ minimum = Types.MIN_QUANTITY_E8S }));
    };
    if (priceB == 0 or priceB > MAX_AMOUNT or quantityE8s > MAX_QUANTITY_E8S) {
      return #err(#invalidPrice);
    };
    let required = depositFormula(priceB, reserveUnit, quantityE8s);
    if (required > MAX_AMOUNT) {
      return #err(#invalidPrice);
    };
    #ok(required);
  };

  // PTM-9b: deposit of a bid on `auction`. A lot sold in block (below the
  // minimum of one bid) takes only bids for the entire lot: quantityE8s must
  // equal the lot (#wholeLotRequired otherwise) and priceB is the price per
  // whole TTTI-T for all of it. Other lots follow quoteDeposit.
  public func quoteDepositFor(auction : Types.Auction, priceB : Nat, reserveUnit : Nat, quantityE8s : Nat) : Result.Result<Nat, Types.BidError> {
    if (not auction.blockSale) { return quoteDeposit(priceB, reserveUnit, quantityE8s) };
    if (quantityE8s != auction.lotSizeE8s) {
      return #err(#wholeLotRequired({ lotSizeE8s = auction.lotSizeE8s }));
    };
    if (priceB == 0 or priceB > MAX_AMOUNT) { return #err(#invalidPrice) };
    let required = depositFormula(priceB, reserveUnit, quantityE8s);
    if (required > MAX_AMOUNT) { return #err(#invalidPrice) };
    #ok(required);
  };

  // PTM-11: deposit quote against the open auction (block sale aware): payment
  // (B + 10 000 USD) x q / 0.99, its split (position B x q, reserve 10 000 USD
  // x q, creator 1 %) and the conversion buffer. #rateUnavailable without a
  // usable rate of the token.
  public func depositQuote(store : Types.AuctionStore, oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, token : Types.PayToken, priceB : Nat, quantityE8s : Nat, choice : Types.RemainderChoice, mShareE6 : Nat, now : Int) : Result.Result<Types.DepositQuote, Types.BidError> {
    let reserveUnit = switch (reserveUnitOf(oracle, tokenRates, token, now)) {
      case (?u) u;
      case null return #err(#rateUnavailable({ token }));
    };
    let payment = switch (store.current) {
      case (?auction) quoteDepositFor(auction, priceB, reserveUnit, quantityE8s);
      case null quoteDeposit(priceB, reserveUnit, quantityE8s);
    };
    let paid = switch (payment) {
      case (#ok(n)) n;
      case (#err(e)) return #err(e);
    };
    let reserveAmount = reserveUnit * quantityE8s / TTTI_E8S;
    let buffer = conversionBuffer(token, reserveAmount);
    let split = LiquidityMintLib.splitOf(choice, mShareE6, quantityE8s, priceB * quantityE8s / TTTI_E8S);
    #ok({
      token;
      choice;
      mShareE6;
      choicePayment = LiquidityMintLib.winnerTaken(priceB, reserveUnit, quantityE8s, mShareE6, choice);
      choicePooledAmount = split.pooledToken;
      lockedAmount = split.lockedToken;
      handE8s = split.handTtti;
      required = paid + buffer;
      payment = paid;
      positionAmount = priceB * quantityE8s / TTTI_E8S;
      reserveAmount;
      creatorAmount = paid * 100 / 10_000;
      reserveToken = token;
      conversionApplies = false;
      conversionBuffer = buffer;
      rateUsdE8 = OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, token), now) ?? 0;
    });
  };

  // --- Lot -------------------------------------------------------------------

  // PTM-9b: what remains to mint once the mint is over (below the minimum of
  // one mint), else 0. It is not minted before settlement.
  public func mintRemainder(ledger : IcrcLib.Ledger) : Nat {
    let mintable = IcrcLib.mintableRemaining(ledger);
    if (mintable < LiquidityMintLib.MIN_MINT_TTTI) mintable else 0;
  };

  // The end-of-mint remainder not yet committed to a lot.
  public func pendingRemainder(store : Types.AuctionStore, remainder : Nat) : Nat {
    Nat.sub(remainder, Nat.min(remainder, store.remainderCommittedE8s));
  };

  // TTTI-T on the returned account not committed to an earlier lot.
  public func pendingLot(store : Types.AuctionStore, returnedBalance : Nat) : Nat {
    Nat.sub(returnedBalance, Nat.min(returnedBalance, store.committedReturnedE8s));
  };

  // Opens an auction with the pending lot when none is open and the lot is
  // non-empty. The lot size is fixed here; TTTI-T returned later forms the next
  // lot because it is only counted above the committed amount.
  public func openWith(store : Types.AuctionStore, returnedBalance : Nat, now : Types.Timestamp) : Result.Result<Types.Auction, Types.OpenAuctionError> {
    openWithRemainder(store, returnedBalance, 0, now);
  };

  // PTM-9b: like openWith, with the end-of-mint remainder (`remainder` = all
  // that remains to mint; the part already committed is deducted). The
  // remainder joins the lot; it is minted only at settlement. A lot below the
  // minimum of one bid is sold in block.
  public func openWithRemainder(store : Types.AuctionStore, returnedBalance : Nat, remainder : Nat, now : Types.Timestamp) : Result.Result<Types.Auction, Types.OpenAuctionError> {
    switch (store.current) {
      case (?_) { return #err(#alreadyOpen) };
      case null {};
    };
    let fromReturned = pendingLot(store, returnedBalance);
    let fromRemainder = pendingRemainder(store, remainder);
    let lot = fromReturned + fromRemainder;
    if (lot == 0) {
      return #err(#emptyLot);
    };
    let auction : Types.Auction = {
      id = store.nextAuctionId;
      openedAt = now;
      closesAt = now + Types.AUCTION_DURATION_NS;
      lotSizeE8s = lot;
      blockSale = lot < Types.MIN_QUANTITY_E8S;
      remainderE8s = fromRemainder;
    };
    store.current := ?auction;
    store.nextAuctionId += 1;
    store.committedReturnedE8s += fromReturned;
    store.remainderCommittedE8s += fromRemainder;
    #ok(auction);
  };

  func returnedBalance(ledger : IcrcLib.Ledger, canister : Principal) : Nat {
    IcrcLib.balanceOf(ledger, IcrcLib.returnedAccount(canister));
  };

  public func openAuction(store : Types.AuctionStore, ledger : IcrcLib.Ledger, canister : Principal, now : Types.Timestamp) : Result.Result<Types.Auction, Types.OpenAuctionError> {
    openWithRemainder(store, returnedBalance(ledger, canister), mintRemainder(ledger), now);
  };

  // --- Reserve price -----------------------------------------------------------

  // The fixed floor in USD x 1e8 per whole TTTI-T (10_000 USD).
  public func reserveFloorUsdE8() : Nat {
    PresaleLib.TOKEN_PRICE_USD * 100_000_000;
  };

  // Pure rule: the reserve is the highest of the floor, the current consolidated
  // price and the 24 h average. A null component is ignored, so the reserve
  // never falls below the floor.
  public func reserveFrom(consolidated : ?Nat, dailyAverage : ?Nat) : Types.ReserveBreakdown {
    let floor = reserveFloorUsdE8();
    let c = consolidated ?? 0;
    let d = dailyAverage ?? 0;
    let (reserve, binding) = if (floor >= c and floor >= d) (floor, #floor) else if (c >= d) (c, #consolidated) else (d, #dailyAverage);
    {
      reserveUsdE8 = reserve;
      floorUsdE8 = floor;
      consolidatedUsdE8 = consolidated;
      dailyAverageUsdE8 = dailyAverage;
      binding;
    };
  };

  // Usable hourly USD rate of a DEX token (TTTI-T has none); null when absent
  // or expired.
  public func usdRateOf(oracle : OracleLib.OracleStore, rates : OracleLib.TokenRateStore, now : Types.Timestamp) : DexLib.UsdRateOf {
    func(token : DexTypes.PoolToken) : ?Nat {
      switch (DexLib.poolDexToken(token)) {
        case (?#tttiT) null;
        case (?t) {
          switch (RetryLib.dexPayToken(t)) {
            case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, rates, pay), now);
            case null null;
          };
        };
        case null null;
      };
    };
  };

  // The reserve at `now` from the consolidated price (PTM-5) and its 24 h
  // average. Computed on every call; nothing is stored. This form counts every
  // sample and the live price; the auction reads use
  // reserveBreakdownOutsideSettlement below.
  public func reserveBreakdown(
    dex : DexTypes.DexStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    rateOf : DexLib.UsdRateOf,
    now : Types.Timestamp,
  ) : Types.ReserveBreakdown {
    let consolidated = DexLib.consolidatedNow(dex, rateOf, now).price;
    let day = DexLib.sampleWindow(samples, now, ProtocolFeeTypes.CONSOLIDATED_RETENTION_NS);
    reserveFrom(consolidated, day.average);
  };

  // A period during which the winners of a closed auction are being pooled.
  // It starts when the auction closes and ends at the last final settlement of
  // its winners (`to` = null while one is still pending).
  public type SettlementWindow = { from : Types.Timestamp; to : ?Types.Timestamp };

  // Settlement periods that matter to the reserve, derived from the closed
  // auctions and their settlements (nothing is stored). Auctions with no served
  // bid have none; fully settled ones older than the 24 h sample retention are
  // skipped.
  public func settlementWindows(closing : Types.ClosingStore, now : Types.Timestamp) : [SettlementWindow] {
    let out = List.empty<SettlementWindow>();
    for (auction in closing.closed.values()) {
      let bids = switch (closing.closedBids.get(auction.id)) {
        case (?b) b;
        case null [];
      };
      var hasServed = false;
      var open = false;
      var last = auction.closedAt;
      for (b in bids.values()) {
        if (b.servedE8s > 0) {
          hasServed := true;
          switch (closing.settlements.get(b.id)) {
            case (?st) {
              if (st.status == #pending) {
                open := true;
              } else {
                let t = switch (st.settledAt, st.attemptedAt) {
                  case (?t, _) t;
                  case (null, ?t) t;
                  case (null, null) last;
                };
                if (t > last) { last := t };
              };
            };
            case null { open := true };
          };
        };
      };
      if (hasServed and (open or now - last <= ProtocolFeeTypes.CONSOLIDATED_RETENTION_NS)) {
        out.add({ from = auction.closedAt; to = if (open) null else ?last });
      };
    };
    out.toArray();
  };

  // The reserve at `now` where the pooling of winners at settlement does not
  // raise the market part: samples taken during a settlement window are left
  // out of the 24 h average, and while a settlement is still running the
  // current price is the last sample taken before it started (the live price
  // already contains the pooling). Outside any settlement it equals
  // reserveBreakdown. Nothing is stored.
  public func reserveBreakdownOutsideSettlement(
    dex : DexTypes.DexStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    rateOf : DexLib.UsdRateOf,
    windows : [SettlementWindow],
    now : Types.Timestamp,
  ) : Types.ReserveBreakdown {
    if (windows.size() == 0) { return reserveBreakdown(dex, samples, rateOf, now) };
    func inWindow(t : Types.Timestamp) : Bool {
      windows.any(
        func(w : SettlementWindow) : Bool {
          t >= w.from and (switch (w.to) { case (?e) t <= e; case null true });
        }
      );
    };
    let outside = samples.filter(func(sm : ProtocolFeeTypes.ConsolidatedSample) : Bool { not inWindow(sm.at) });
    let day = DexLib.sampleWindow(outside, now, ProtocolFeeTypes.CONSOLIDATED_RETENTION_NS);
    // Start of the earliest settlement still running, if any.
    var runningFrom : ?Types.Timestamp = null;
    for (w in windows.values()) {
      if (w.to == null) {
        switch (runningFrom) {
          case (?f) { if (w.from < f) { runningFrom := ?w.from } };
          case null { runningFrom := ?w.from };
        };
      };
    };
    let consolidated : ?Nat = switch (runningFrom) {
      case null { DexLib.consolidatedNow(dex, rateOf, now).price };
      case (?from) {
        var best : ?ProtocolFeeTypes.ConsolidatedSample = null;
        for (sm in outside.values()) {
          if (sm.at < from) {
            switch (best) {
              case (?b) { if (sm.at > b.at) { best := ?sm } };
              case null { best := ?sm };
            };
          };
        };
        switch (best) {
          case (?b) ?b.priceUsdE8;
          case null null;
        };
      };
    };
    reserveFrom(consolidated, day.average);
  };

  // Effective reserve in USD x 1e8 per whole TTTI-T at `now`.
  public func effectiveReserveUsdE8(
    dex : DexTypes.DexStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    rateOf : DexLib.UsdRateOf,
    now : Types.Timestamp,
  ) : Nat {
    reserveBreakdown(dex, samples, rateOf, now).reserveUsdE8;
  };

  // A reserve of `reserveUsdE8` in the token's smallest unit per whole TTTI-T at
  // the stored rate: ceil(reserveUsdE8 x 10^decimals / usdE8). Null when the
  // rate is absent or expired.
  public func reservePriceFor(token : Types.PayToken, reserveUsdE8 : Nat, usdE8 : ?Nat) : ?Nat {
    switch (usdE8) {
      case (?rate) {
        let scale = 10 ** PayTokenLib.expectedDecimals(token).toNat();
        ?((reserveUsdE8 * scale + rate - 1) / rate);
      };
      case null null;
    };
  };

  // The fixed floor in the token's smallest unit at the stored rate.
  public func reservePriceIn(token : Types.PayToken, usdE8 : ?Nat) : ?Nat {
    reservePriceFor(token, reserveFloorUsdE8(), usdE8);
  };

  func reservePrices(oracle : OracleLib.OracleStore, rates : OracleLib.TokenRateStore, reserveUsdE8 : Nat, now : Types.Timestamp) : [Types.TokenReservePrice] {
    let tokens : [Types.PayToken] = [#icp, #ckbtc, #ckusdc, #ckusdt];
    tokens.map(
      func(token : Types.PayToken) : Types.TokenReservePrice {
        let rate = OracleLib.usableRate(OracleLib.storeFor(oracle, rates, token), now);
        { token; price = reservePriceFor(token, reserveUsdE8, rate) };
      }
    );
  };

  // --- Views -------------------------------------------------------------------

  // Public view. Nothing about any bid: no content, no count, no deposit total.
  public func buildView(store : Types.AuctionStore, returnedBalance : Nat, reserve : Types.ReserveBreakdown, prices : [Types.TokenReservePrice], now : Types.Timestamp) : Types.AuctionView {
    buildViewWith(store, returnedBalance, 0, reserve, prices, now);
  };

  // PTM-9b: with the end-of-mint remainder (all that remains to mint).
  public func buildViewWith(store : Types.AuctionStore, returnedBalance : Nat, remainder : Nat, reserve : Types.ReserveBreakdown, prices : [Types.TokenReservePrice], now : Types.Timestamp) : Types.AuctionView {
    let (open, id, lot, openedAt, closesAt, lotRemainder, block) = switch (store.current) {
      case (?a) (now < a.closesAt, ?a.id, a.lotSizeE8s, ?a.openedAt, ?a.closesAt, a.remainderE8s, a.blockSale);
      case null (false, null, 0, null, null, 0, false);
    };
    let pendingRem = pendingRemainder(store, remainder);
    {
      open;
      auctionId = id;
      lotSizeE8s = lot;
      openedAt;
      closesAt;
      pendingLotE8s = pendingLot(store, returnedBalance) + pendingRem;
      lotRemainderE8s = lotRemainder;
      pendingRemainderE8s = pendingRem;
      blockSale = block;
      reservePriceUsdE8 = reserve.reserveUsdE8;
      reserveFloorUsdE8 = reserve.floorUsdE8;
      consolidatedPriceUsdE8 = reserve.consolidatedUsdE8;
      dailyAverageUsdE8 = reserve.dailyAverageUsdE8;
      reserveBinding = reserve.binding;
      reservePrices = prices;
      minQuantityE8s = Types.MIN_QUANTITY_E8S;
      maxBidsPerPerson = Types.MAX_BIDS_PER_PERSON;
      guaranteeRecoverable = true;
      closingPending = false;
    };
  };

  public func view(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    ledger : IcrcLib.Ledger,
    canister : Principal,
    oracle : OracleLib.OracleStore,
    rates : OracleLib.TokenRateStore,
    dex : DexTypes.DexStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    now : Types.Timestamp,
  ) : Types.AuctionView {
    let reserve = reserveBreakdownOutsideSettlement(dex, samples, usdRateOf(oracle, rates, now), settlementWindows(closing, now), now);
    let base = buildViewWith(store, returnedBalance(ledger, canister), mintRemainder(ledger), reserve, reservePrices(oracle, rates, reserve.reserveUsdE8, now), now);
    { base with closingPending = switch (closing.closingSince) { case (?_) true; case null false } };
  };

  // The caller's own bids, in bid order.
  public func bidsOf(store : Types.AuctionStore, who : Principal) : [Types.Bid] {
    store.bids.values().filter(func(b : Types.Bid) : Bool { b.bidder == who }).toArray();
  };

  public func bidCount(store : Types.AuctionStore, who : Principal, auctionId : Types.AuctionId) : Nat {
    var count = 0;
    for (b in store.bids.values()) {
      if (b.bidder == who and b.auctionId == auctionId) { count += 1 };
    };
    // Bids whose deposit is not settled yet count too.
    for (p in store.pending.values()) {
      if (p.bidder == who and p.auctionId == auctionId) { count += 1 };
    };
    count;
  };

  // --- Deposits held ---------------------------------------------------------------

  // What the auction custody account of `token` must hold: the deposits of the
  // open bids, the deposits in flight (not failed) and, after closing, every
  // withdrawable and pending-settlement balance of that token.
  public func heldDeposits(store : Types.AuctionStore, closing : Types.ClosingStore, dex : RetryLib.DexContext, token : DexTypes.DexToken) : Nat {
    var total = 0;
    for (bal in closing.balances.values()) {
      if (dexToken(bal.token) == token) { total += bal.withdrawable + bal.pendingSettlement };
    };
    for (b in store.bids.values()) {
      if (dexToken(b.token) == token) { total += b.deposited };
    };
    for (p in store.pending.values()) {
      if (dexToken(p.token) == token) {
        switch (dex.transfers.deposits.get(p.n)) {
          case (?t) {
            switch (t.status) {
              case (#failed(_)) {};
              case _ { total += p.deposited };
            };
          };
          case null {};
        };
      };
    };
    total;
  };

  // --- Settling a deposit into a bid ---------------------------------------------------

  // The bid recorded for deposit n (matched on the deposit memo).
  func bidOfDeposit(store : Types.AuctionStore, dex : RetryLib.DexContext, n : Nat) : ?Types.Bid {
    switch (dex.transfers.deposits.get(n)) {
      case (?t) {
        for (b in store.bids.values()) {
          if (b.memo == t.attempt.memo) { return ?b };
        };
        null;
      };
      case null null;
    };
  };

  // Records the bid of a pending deposit that completed; removes the pending
  // entry of a deposit that failed. Idempotent. Returns the bid when recorded.
  func settle(store : Types.AuctionStore, closing : Types.ClosingStore, dex : RetryLib.DexContext, n : Nat) : ?Types.Bid {
    switch (store.pending.get(n)) {
      case null { bidOfDeposit(store, dex, n) };
      case (?p) {
        switch (dex.transfers.deposits.get(n)) {
          case null { null };
          case (?t) {
            switch (t.status) {
              case (#completed(block)) {
                // The auction of this deposit already closed: the whole
                // deposit goes to the bidder's withdrawable balance.
                let live = switch (store.current) {
                  case (?a) a.id == p.auctionId;
                  case null false;
                };
                if (not live) {
                  credit(closing, p.bidder, p.token, p.deposited, 0);
                  store.pending.remove(n);
                  return null;
                };
                let bid : Types.Bid = {
                  id = store.nextBidId;
                  auctionId = p.auctionId;
                  bidder = p.bidder;
                  token = p.token;
                  quantityE8s = p.quantityE8s;
                  priceB = p.priceB;
                  requiredDeposit = p.requiredDeposit;
                  deposited = p.deposited;
                  createdAt = p.createdAt;
                  choice = p.choice;
                  memo = t.attempt.memo;
                  block;
                };
                store.nextBidId += 1;
                store.bids.add(bid.id, bid);
                store.pending.remove(n);
                ?bid;
              };
              case (#failed(_)) {
                store.pending.remove(n);
                null;
              };
              case _ { null };
            };
          };
        };
      };
    };
  };

  // Settles every pending deposit that reached a final state (retries and the
  // To review flow resolve unknown outcomes).
  public func reconcile(store : Types.AuctionStore, closing : Types.ClosingStore, dex : RetryLib.DexContext) {
    let numbers = store.pending.keys().toArray();
    for (n in numbers.values()) {
      ignore settle(store, closing, dex, n);
    };
  };

  // --- Placing a bid ------------------------------------------------------------------

  // PTM-9d: the two refusals that need no movement and no state. A bid whose
  // price, converted to USD per whole TTTI-T at `usdE8` (the current usable
  // rate of its token), is under the 10_000 USD floor can never win: it is
  // refused with #priceBelowMinimum (bidUsdE8 is null when the token has no
  // usable rate, so the price cannot be checked). A deposit that does not cover
  // the ledger fee of the token could not be moved back: #depositBelowLedgerFee.
  public func checkBidLimits(token : Types.PayToken, priceB : Nat, usdE8 : ?Nat, deposited : Nat, fee : Nat) : Result.Result<(), Types.BidError> {
    let floor = reserveFloorUsdE8();
    switch (usdE8) {
      case (?rate) {
        let scaled = priceScaled(token, priceB, rate);
        if (scaled < floor * TTTI_E8S) {
          return #err(#priceBelowMinimum({ minimumUsdE8 = floor; bidUsdE8 = ?(scaled / TTTI_E8S) }));
        };
      };
      case null {
        return #err(#priceBelowMinimum({ minimumUsdE8 = floor; bidUsdE8 = null }));
      };
    };
    if (deposited < fee) {
      return #err(#depositBelowLedgerFee({ fee; deposited }));
    };
    #ok(());
  };

  public func placeBid(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    ledger : IcrcLib.Ledger,
    oracle : OracleLib.OracleStore,
    tokenRates : OracleLib.TokenRateStore,
    dex : RetryLib.DexContext,
    canister : Principal,
    caller : Principal,
    token : Types.PayToken,
    quantityE8s : Nat,
    priceB : Nat,
    depositAmount : Nat,
    choice : Types.RemainderChoice,
  ) : async Result.Result<Types.Bid, Types.BidError> {
    // 1. Validation: nothing below takes funds before it all passes.
    if (caller.isAnonymous()) { return #err(#anonymous) };
    if (dex.pause.paused) { return #err(#paused) };
    let now = Time.now();
    ignore openAuction(store, ledger, canister, now);
    let auction = switch (store.current) {
      case (?a) {
        if (now >= a.closesAt) { return #err(#noOpenAuction) };
        a;
      };
      case null { return #err(#noOpenAuction) };
    };
    let reserveUnit = switch (reserveUnitOf(oracle, tokenRates, token, now)) {
      case (?u) { u };
      case null { return #err(#rateUnavailable({ token })) };
    };
    let payment = switch (quoteDepositFor(auction, priceB, reserveUnit, quantityE8s)) {
      case (#err(e)) { return #err(e) };
      case (#ok(r)) { r };
    };
    // PTM-11: the reserve is not converted, so the buffer is 0.
    let required = payment + conversionBuffer(token, reserveUnit * quantityE8s / TTTI_E8S);
    if (required > MAX_AMOUNT) { return #err(#invalidPrice) };
    if (bidCount(store, caller, auction.id) >= Types.MAX_BIDS_PER_PERSON) {
      return #err(#tooManyBids({ maximum = Types.MAX_BIDS_PER_PERSON }));
    };
    if (depositAmount < required) {
      return #err(#depositBelowRequired({ required; deposited = depositAmount }));
    };
    if (depositAmount > MAX_AMOUNT) {
      return #err(#invalidPrice);
    };
    // PTM-9d: floor price and ledger fee, refused before any movement or state change.
    let usdE8 = OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, token), now);
    switch (checkBidLimits(token, priceB, usdE8, depositAmount, RetryLib.dexFee(dex, dexToken(token)))) {
      case (#err(e)) { return #err(e) };
      case (#ok(_)) {};
    };

    // 2. One bid at a time per caller; the lock is released in every case.
    let key = RetryLib.auctionLockKey(caller);
    if (not RetryLib.tryLock(dex.locks, key)) {
      return #err(#bidInProgress);
    };
    try {
      // The deposit attempt is recorded before the first await.
      let opened = RetryLib.openAuctionDeposit(dex, caller, dexToken(token), depositAmount);
      store.pending.add(
        opened.n,
        {
          n = opened.n;
          auctionId = auction.id;
          bidder = caller;
          token;
          quantityE8s;
          priceB;
          requiredDeposit = required;
          deposited = depositAmount;
          createdAt = now;
          choice;
        },
      );
      let (transfer, err) = await RetryLib.sendDexDepositDetailed(dex, opened.n);
      let fee = RetryLib.dexFee(dex, dexToken(token));
      switch (err) {
        case (?#InsufficientAllowance({ allowance })) {
          store.pending.remove(opened.n);
          return #err(#allowanceInsufficient({ allowance; required = depositAmount + fee }));
        };
        case (?#InsufficientFunds({ balance })) {
          store.pending.remove(opened.n);
          return #err(#insufficientFunds({ balance; required = depositAmount + fee }));
        };
        case (?_) {
          store.pending.remove(opened.n);
          let text = switch (transfer.status) { case (#failed(t)) t; case _ "ledger error" };
          return #err(#ledgerError(text));
        };
        case null {};
      };
      switch (transfer.status) {
        case (#completed(_)) {
          switch (settle(store, closing, dex, opened.n)) {
            case (?bid) { #ok(bid) };
            case null { #err(#ledgerError("The deposit was taken but the bid could not be recorded; if the auction closed, the deposit is in your withdrawable balance, otherwise see To review")) };
          };
        };
        case (#failed(text)) {
          store.pending.remove(opened.n);
          #err(#ledgerError(text));
        };
        case _ {
          // Unknown outcome: the deposit is retried by the retry timer and, if
          // still unresolved, listed in To review. The bid is recorded as soon
          // as the deposit is confirmed; no new bid is needed.
          #err(#ledgerError("The ledger reply is unknown. The deposit (memo " # RetryLib.memoText(#AB, opened.n, 1) # ") is retried automatically and, if unresolved, listed in To review. The bid is recorded once the deposit is confirmed; do not place it again."));
        };
      };
    } finally {
      RetryLib.unlock(dex.locks, key);
    };
  };

  // --- Closing (PTM-6b) ----------------------------------------------------------------

  let PAY_TOKENS : [Types.PayToken] = [#icp, #ckbtc, #ckusdc, #ckusdt];

  func tokenText(token : Types.PayToken) : Text {
    switch (token) {
      case (#icp) "icp";
      case (#ckbtc) "ckbtc";
      case (#ckusdc) "ckusdc";
      case (#ckusdt) "ckusdt";
    };
  };

  // Key of a bidder balance: "<principal text>:<icp|ckbtc|ckusdc|ckusdt>".
  public func balanceKey(owner : Principal, token : Types.PayToken) : Text {
    owner.toText() # ":" # tokenText(token);
  };

  // Adds to the bidder's balance in a token (creating it when absent).
  func credit(closing : Types.ClosingStore, owner : Principal, token : Types.PayToken, withdrawable : Nat, pending : Nat) {
    if (withdrawable == 0 and pending == 0) { return };
    let key = balanceKey(owner, token);
    switch (closing.balances.get(key)) {
      case (?b) {
        b.withdrawable += withdrawable;
        b.pendingSettlement += pending;
      };
      case null {
        closing.balances.add(key, { owner; token; var withdrawable = withdrawable; var pendingSettlement = pending });
      };
    };
    syncDust(closing, owner, token);
  };

  // Ledger fee of a return in a token (static for the four pay tokens).
  func ledgerFee(token : Types.PayToken) : Nat { PayTokenLib.expectedFee(token) };

  // PTM-9d: a withdrawable balance not above the ledger fee is dust. It stays in
  // the balance (nothing is rewritten) and joins the next return of the same
  // person; `closing.dust` only mirrors that amount for reading, and is never
  // counted on top of the balance.
  func syncDust(closing : Types.ClosingStore, owner : Principal, token : Types.PayToken) {
    let key = balanceKey(owner, token);
    let w = switch (closing.balances.get(key)) {
      case (?b) b.withdrawable;
      case null 0;
    };
    if (w > 0 and w <= ledgerFee(token)) {
      switch (closing.dust.get(key)) {
        case (?d) { d.amount := w };
        case null { closing.dust.add(key, { owner; token; var amount = w }) };
      };
    } else {
      closing.dust.remove(key);
    };
  };

  // PTM-9d: stores a move and keeps both indexes consistent with its status:
  // movesByBidder (every move of one person and token) and activeMoves (moves
  // that are not completed or failed: #inProgress and #needsReview).
  func putMove(closing : Types.ClosingStore, m : Types.AuctionMove) {
    closing.moves.add(m.n, m);
    let key = balanceKey(m.owner, m.token);
    let ns = switch (closing.movesByBidder.get(key)) {
      case (?s) s;
      case null {
        let s = Set.empty<Nat>();
        closing.movesByBidder.add(key, s);
        s;
      };
    };
    ns.add(m.n);
    switch (m.status) {
      case (#inProgress or #needsReview) { closing.activeMoves.add(m.n) };
      case _ { closing.activeMoves.remove(m.n) };
    };
  };

  // PTM-9d: adds the auction to settledAuctions when every winner is settled.
  func allSettled(closing : Types.ClosingStore, auctionId : Types.AuctionId) : Bool {
    switch (closing.closedBids.get(auctionId)) {
      case null true;
      case (?bids) {
        for (b in bids.values()) {
          if (b.servedE8s > 0) {
            switch (closing.settlements.get(b.id)) {
              case (?s) { if (s.status == #pending or s.status == #failed) { return false } };
              case null { return false };
            };
          };
        };
        true;
      };
    };
  };

  public func markSettled(closing : Types.ClosingStore, auctionId : Types.AuctionId) {
    if (not closing.settledAuctions.contains(auctionId) and allSettled(closing, auctionId)) {
      closing.settledAuctions.add(auctionId);
    };
  };

  // An offer price in USD x 1e8 per whole TTTI-T, multiplied by 10^8 so the
  // division by the token's decimals is exact: priceB x rate x 10^(8 - decimals).
  public func priceScaled(token : Types.PayToken, priceB : Nat, usdE8 : Nat) : Nat {
    let decimals = PayTokenLib.expectedDecimals(token).toNat();
    priceB * usdE8 * 10 ** Nat.sub(8, Nat.min(8, decimals));
  };

  func rateOf(rates : [Types.ClosingRate], token : Types.PayToken) : ?Nat {
    switch (rates.find(func(r : Types.ClosingRate) : Bool { r.token == token })) {
      case (?r) r.usdE8;
      case null null;
    };
  };

  // Result of the pure computation: the closed auction and all its bids.
  public type ClosingResult = {
    auction : Types.ClosedAuction;
    bids : [Types.ClosedBid];
  };

  type Ranked = { bid : Types.Bid; price : Nat; volume : Nat };

  // Pure. Discards the offers under the reserve (price converted at the closing
  // rate of its token), orders the others by price (descending), volume
  // quantity x price (descending), age (createdAt ascending, then id) and serves
  // in that order until the lot is exhausted. The last served offer may be
  // partial; a remainder under the minimum quantity is not served. Each served
  // offer pays its own price. Writes nothing.
  public func computeClosing(
    auction : Types.Auction,
    bids : [Types.Bid],
    reserve : Types.ReserveBreakdown,
    rates : [Types.ClosingRate],
    now : Types.Timestamp,
  ) : ClosingResult {
    let threshold = reserve.reserveUsdE8 * TTTI_E8S;
    let valid = List.empty<Ranked>();
    let discarded = Set.empty<Types.BidId>();
    for (bid in bids.values()) {
      switch (rateOf(rates, bid.token)) {
        case (?rate) {
          let price = priceScaled(bid.token, bid.priceB, rate);
          if (price >= threshold) {
            valid.add({ bid; price; volume = bid.quantityE8s * price });
          } else {
            discarded.add(bid.id);
          };
        };
        case null { discarded.add(bid.id) };
      };
    };
    let ranked = valid.toArray().sort(
      func(a : Ranked, b : Ranked) : { #less; #equal; #greater } {
        if (a.price != b.price) {
          if (a.price > b.price) #less else #greater;
        } else if (a.volume != b.volume) {
          if (a.volume > b.volume) #less else #greater;
        } else if (a.bid.createdAt != b.bid.createdAt) {
          if (a.bid.createdAt < b.bid.createdAt) #less else #greater;
        } else if (a.bid.id < b.bid.id) #less else if (a.bid.id > b.bid.id) #greater else #equal;
      }
    );
    let served = Map.empty<Types.BidId, Nat>();
    var remaining = auction.lotSizeE8s;
    if (auction.blockSale) {
      // PTM-9b: a lot below the minimum of one bid is sold in block. Each bid
      // is a price for the entire lot: the best price (ranking above) wins all.
      var sold = false;
      for (r in ranked.values()) {
        if (not sold and r.bid.quantityE8s == auction.lotSizeE8s) {
          served.add(r.bid.id, auction.lotSizeE8s);
          sold := true;
        };
      };
    } else {
      for (r in ranked.values()) {
        if (remaining >= Types.MIN_QUANTITY_E8S) {
          let q = Nat.min(r.bid.quantityE8s, remaining);
          served.add(r.bid.id, q);
          remaining := Nat.sub(remaining, q);
        };
      };
    };
    let closedBids = bids.map(
      func(bid : Types.Bid) : Types.ClosedBid {
        let q = switch (served.get(bid.id)) { case (?v) v; case null 0 };
        let outcome : Types.BidOutcome = if (q == 0) {
          if (discarded.contains(bid.id)) #discardedBelowReserve else #notServed;
        } else if (q == bid.quantityE8s) #served else #partiallyServed;
        let servedDeposit = if (q == 0) 0 else Nat.min((bid.requiredDeposit * q + bid.quantityE8s - 1) / bid.quantityE8s, bid.deposited);
        {
          id = bid.id;
          auctionId = bid.auctionId;
          bidder = bid.bidder;
          token = bid.token;
          quantityE8s = bid.quantityE8s;
          priceB = bid.priceB;
          requiredDeposit = bid.requiredDeposit;
          deposited = bid.deposited;
          createdAt = bid.createdAt;
          choice = bid.choice;
          outcome;
          servedE8s = q;
          pricePaidB = if (q == 0) 0 else bid.priceB;
          servedDeposit;
          returned = Nat.sub(bid.deposited, servedDeposit);
        };
      }
    );
    let totalServed = closedBids.foldLeft(0, func(acc : Nat, b : Types.ClosedBid) : Nat { acc + b.servedE8s });
    let carried = Nat.sub(auction.lotSizeE8s, Nat.min(auction.lotSizeE8s, totalServed));
    let status : Types.ClosedStatus = if (totalServed == 0) #unsold else if (carried == 0) #fullySold else #partiallySold;
    {
      auction = {
        id = auction.id;
        openedAt = auction.openedAt;
        closesAt = auction.closesAt;
        closedAt = now;
        lotSizeE8s = auction.lotSizeE8s;
        blockSale = auction.blockSale;
        remainderE8s = auction.remainderE8s;
        reserve;
        rates;
        bidCount = bids.size();
        servedE8s = totalServed;
        carriedOverE8s = carried;
        status;
      };
      bids = closedBids;
    };
  };

  // Records a computed closing. No await is involved: the open bids leave
  // AuctionStore.bids for closedBids, the returns and the pending settlement
  // amounts are credited, the unsold quantity is released from the committed
  // returned TTTI-T and the auction is no longer current. No ledger balance or
  // block is touched.
  public func applyClosing(store : Types.AuctionStore, closing : Types.ClosingStore, result : ClosingResult) {
    for (b in result.bids.values()) {
      credit(closing, b.bidder, b.token, b.returned, b.servedDeposit);
    };
    let ids = store.bids.values().filter(func(b : Types.Bid) : Bool { b.auctionId == result.auction.id }).map(func(b : Types.Bid) : Types.BidId { b.id }).toArray();
    for (id in ids.values()) { store.bids.remove(id) };
    closing.closed.add(result.auction.id, result.auction);
    closing.closedBids.add(result.auction.id, result.bids);
    markSettled(closing, result.auction.id);
    // The unsold quantity is released first from the end-of-mint remainder, which
    // was never minted, then from the returned TTTI-T.
    let carried = result.auction.carriedOverE8s;
    let fromRemainder = Nat.min(result.auction.remainderE8s, carried);
    store.remainderCommittedE8s := Nat.sub(store.remainderCommittedE8s, Nat.min(store.remainderCommittedE8s, fromRemainder));
    store.committedReturnedE8s := Nat.sub(store.committedReturnedE8s, Nat.min(store.committedReturnedE8s, Nat.sub(carried, fromRemainder)));
    store.current := null;
    closing.closingSince := null;
  };

  // The hourly rate of each payment token usable at `now`.
  public func closingRates(oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, now : Types.Timestamp) : [Types.ClosingRate] {
    PAY_TOKENS.map(
      func(token : Types.PayToken) : Types.ClosingRate {
        { token; usdE8 = OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, token), now) };
      }
    );
  };

  func closeLocked(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    dex : RetryLib.DexContext,
    oracle : OracleLib.OracleStore,
    tokenRates : OracleLib.TokenRateStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    now : Types.Timestamp,
  ) : Bool {
    let auction = switch (store.current) {
      case (?a) a;
      case null { return false };
    };
    if (now < auction.closesAt) { return false };
    let bids = store.bids.values().filter(func(b : Types.Bid) : Bool { b.auctionId == auction.id }).toArray();
    let rates = closingRates(oracle, tokenRates, now);
    // A valid rate is required for every payment token used by an offer.
    var missing = false;
    for (bid in bids.values()) {
      if (rateOf(rates, bid.token) == null) { missing := true };
    };
    // The ICP rate and the rate of the counter token of every non-empty TTTI-T
    // pool are also required: the consolidated price depends on them.
    let rateOfToken = usdRateOf(oracle, tokenRates, now);
    if (rateOf(rates, #icp) == null) { missing := true };
    for ((_, pool) in dex.dex.pools.entries()) {
      if (pool.kind == #tttiPair and pool.status != #removed and pool.removedAt == null and pool.totalShares > 0 and pool.reserve0 > 0 and pool.reserve1 > 0) {
        let counter = if (pool.token0.ledger == #internal) pool.token1 else pool.token0;
        let isTtti = switch (DexLib.poolDexToken(counter)) {
          case (?#tttiT) true;
          case _ false;
        };
        if (not isTtti and rateOfToken(counter) == null) { missing := true };
      };
    };
    if (missing) {
      if (closing.closingSince == null) { closing.closingSince := ?now };
      return false;
    };
    let reserve = reserveBreakdownOutsideSettlement(dex.dex, samples, rateOfToken, settlementWindows(closing, now), now);
    applyClosing(store, closing, computeClosing(auction, bids, reserve, rates, now));
    true;
  };

  // Closes the current auction once its closing time has passed (not while
  // paused), under a lock so it runs once. Without a valid rate for a token
  // used by an offer it only marks closing as pending and retries on the next
  // tick. Returns true when the auction was closed.
  public func closeIfDue(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    dex : RetryLib.DexContext,
    oracle : OracleLib.OracleStore,
    tokenRates : OracleLib.TokenRateStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    now : Types.Timestamp,
  ) : Bool {
    if (dex.pause.paused) { return false };
    let key = "AUCTION/CLOSE";
    if (not RetryLib.tryLock(dex.locks, key)) { return false };
    let closed = closeLocked(store, closing, dex, oracle, tokenRates, samples, now);
    RetryLib.unlock(dex.locks, key);
    closed;
  };

  // --- Readers (PTM-6b) -------------------------------------------------------------------

  // Every closed auction, newest first. Bids are not included.
  public func closedAuctions(closing : Types.ClosingStore) : [Types.ClosedAuction] {
    closing.closed.reverseEntries().map(func(e : (Types.AuctionId, Types.ClosedAuction)) : Types.ClosedAuction { e.1 }).toArray();
  };

  // A closed auction with all its bids; null for an unknown or open auction.
  public func auctionResult(closing : Types.ClosingStore, auctionId : Types.AuctionId) : ?Types.AuctionResult {
    switch (closing.closed.get(auctionId)) {
      case (?auction) {
        let bids = switch (closing.closedBids.get(auctionId)) { case (?b) b; case null [] };
        ?{ auction; bids };
      };
      case null null;
    };
  };

  // The caller's non-zero balances, one entry per deposit token.
  public func myBalances(closing : Types.ClosingStore, who : Principal) : [Types.MyBalance] {
    let out = List.empty<Types.MyBalance>();
    for (token in PAY_TOKENS.values()) {
      switch (closing.balances.get(balanceKey(who, token))) {
        case (?b) {
          if (b.withdrawable > 0 or b.pendingSettlement > 0) {
            out.add({ token; withdrawable = b.withdrawable; pendingSettlement = b.pendingSettlement });
          };
        };
        case null {};
      };
    };
    out.toArray();
  };

  // --- Settlement of the winners (PTM-6c) --------------------------------------------------
  //
  // Custody: the deposits of the bids sit on the AUCTION-BIDS custody account
  // of their token, while DEX balances, pools, guarantees and creator fees are
  // backed by the DEX custody account. Anything credited to a bidder's DEX
  // internal balance is first moved on the ledger from the auction custody to
  // the DEX custody (a recorded move, memo TTTI-SW-n, created_at_time set,
  // replayed as recorded for 23 h, then listed for review). Only when the move
  // succeeded is the DEX balance credited (move amount net of the ledger fee)
  // and the bidder's auction balance reduced by the gross amount, in the same
  // synchronous block, so the reserve check never counts the funds twice.

  public type SettleContext = {
    store : Types.AuctionStore;
    closing : Types.ClosingStore;
    mint : LiquidityMintLib.MintContext;
    locks : Set.Set<Text>; // transient: one run per auction
    // Isolated self-call of the core settling one winner (auctionSettleCore).
    isolated : Types.SettleCoreArgs -> async Types.SettleCoreResult;
  };

  public type SettleAmounts = {
    taken : Nat; // PTM-10b: (10 000 USD + L) x q / 0.99, rounded up (in favor of the pools), L = B (choice #pool) or m x B (#wallet) per TTTI-T
    creator : Nat; // 1 % of taken
    position : Nat; // pooled token side: B x q (#pool) or m x B x q (#wallet), with its TTTI-T in the pool
    locked : Nat; // PTM-10b: m x B x q, pooled and locked 3 months in the winner's name
    handE8s : Nat; // PTM-10b: (1 - m) x q TTTI-T that stay in the winner's hand (choice #wallet)
    guarantee : Nat; // PTM-11: 10 000 USD x q for the common reserve, in the paid token
    dust : Nat; // what the roundings leave, added to the pool deposit
  };

  // Amounts of the settlement of a winner served for q at price B (B per whole
  // TTTI-T in the paid token's smallest unit, q in e8s).
  public func settleAmounts(priceB : Nat, reserveUnit : Nat, quantityE8s : Nat, mShareE6 : Nat, choice : Types.RemainderChoice) : SettleAmounts {
    let taken = LiquidityMintLib.winnerTaken(priceB, reserveUnit, quantityE8s, mShareE6, choice);
    let creator = taken * 100 / 10_000;
    let split = LiquidityMintLib.splitOf(choice, mShareE6, quantityE8s, priceB * quantityE8s / TTTI_E8S);
    let reserve = reserveUnit * quantityE8s / TTTI_E8S;
    let used = creator + split.pooledToken + reserve;
    { taken; creator; position = split.pooledToken; locked = split.lockedToken; handE8s = split.handTtti; guarantee = reserve; dust = Nat.sub(taken, Nat.min(taken, used)) };
  };

  // PTM-11: 10 000 USD in the paid token's smallest unit per whole TTTI-T at the
  // settlement rate; the settlement of a winner is refused when the rate is not
  // usable.
  func settleReserveUnit(mint : LiquidityMintLib.MintContext, token : Types.PayToken, now : Int) : ?Nat {
    reserveUnitOf(mint.oracle, mint.tokenRates, token, now);
  };

  // The part of the ledger fee of the internal move (auction custody to DEX
  // custody) carried by the creator share: the fee, at most the 1 % of the
  // amount taken (the creator is credited net of it, never below zero).
  public func feeBorneByCreator(amounts : SettleAmounts, fee : Nat) : Nat = Nat.min(fee, amounts.creator);

  // What a move must credit for the winner to be settled: the amount taken
  // less the fee borne by the creator share.
  public func requiredCredit(amounts : SettleAmounts, fee : Nat) : Nat = Nat.sub(amounts.taken, feeBorneByCreator(amounts, fee));

  func isFinal(closing : Types.ClosingStore, bidId : Types.BidId) : Bool {
    switch (closing.settlements.get(bidId)) {
      case (?s) { s.status == #settled or s.status == #failed };
      case null false;
    };
  };

  // The served bids of a closed auction whose settlement is not final, in
  // ranking order: price converted at the closing rate (descending), volume
  // (descending), age (ascending), id (ascending).
  public func pendingWinners(closing : Types.ClosingStore, auction : Types.ClosedAuction) : [Types.ClosedBid] {
    rankServed(closing, auction, true);
  };

  // All served bids in ranking order; `onlyPending` keeps the non-final ones.
  func rankServed(closing : Types.ClosingStore, auction : Types.ClosedAuction, onlyPending : Bool) : [Types.ClosedBid] {
    let all = switch (closing.closedBids.get(auction.id)) { case (?b) b; case null [] };
    let served = all.filter(func(b : Types.ClosedBid) : Bool { b.servedE8s > 0 and (not onlyPending or not isFinal(closing, b.id)) });
    func priceOf(b : Types.ClosedBid) : Nat {
      switch (rateOf(auction.rates, b.token)) {
        case (?rate) priceScaled(b.token, b.priceB, rate);
        case null 0;
      };
    };
    served.sort(
      func(a : Types.ClosedBid, b : Types.ClosedBid) : { #less; #equal; #greater } {
        let pa = priceOf(a);
        let pb = priceOf(b);
        if (pa != pb) {
          if (pa > pb) #less else #greater;
        } else if (a.quantityE8s * pa != b.quantityE8s * pb) {
          if (a.quantityE8s * pa > b.quantityE8s * pb) #less else #greater;
        } else if (a.createdAt != b.createdAt) {
          if (a.createdAt < b.createdAt) #less else #greater;
        } else if (a.id < b.id) #less else if (a.id > b.id) #greater else #equal;
      }
    );
  };

  // PTM-9b: the part of this winner's served quantity that is the end-of-mint
  // remainder, minted only at its settlement. The lot is served in ranking
  // order: the returned TTTI-T cover the first (lot - remainder) E8s, the
  // remainder covers what follows, so the winners beyond the returned part
  // are minted for exactly their share. 0 when the lot has no remainder.
  public func mintAllocation(closing : Types.ClosingStore, bid : Types.ClosedBid) : Nat {
    let auction = switch (closing.closed.get(bid.auctionId)) {
      case (?a) a;
      case null { return 0 };
    };
    if (auction.remainderE8s == 0) { return 0 };
    let returnedPart = Nat.sub(auction.lotSizeE8s, auction.remainderE8s);
    var cum : Nat = 0;
    for (b in rankServed(closing, auction, false).values()) {
      if (b.id == bid.id) {
        let end = cum + b.servedE8s;
        let start = Nat.max(cum, returnedPart);
        return if (end > start) Nat.sub(end, start) else 0;
      };
      cum += b.servedE8s;
    };
    0;
  };

  func settlementBase(bid : Types.ClosedBid, status : Types.SettlementStatus, now : Types.Timestamp) : Types.BidSettlement {
    {
      auctionId = bid.auctionId;
      bidId = bid.id;
      bidder = bid.bidder;
      token = bid.token;
      status;
      settledE8s = 0;
      takenAmount = 0;
      creatorShare = 0;
      positionAmount = 0;
      guaranteeAmount = 0;
      mintedE8s = 0;
      surplusReturned = 0;
      carriedE8s = 0;
      positionId = null;
      mShareE6 = 0;
      choice = bid.choice;
      lockedAmount = 0;
      lockedPositionId = null;
      handE8s = 0;
      failureReason = null;
      attemptedAt = ?now;
      settledAt = null;
    };
  };

  // Records a refused settlement. `credited` is what sits in the winner's DEX
  // balance (the whole moved deposit). The quantity joins the next lot: it is
  // no longer committed, and the TTTI-T never left the returned account.
  public func recordFailure(store : Types.AuctionStore, closing : Types.ClosingStore, bid : Types.ClosedBid, credited : Nat, reason : Text, now : Types.Timestamp) {
    if (isFinal(closing, bid.id)) { return };
    closing.settlements.add(
      bid.id,
      {
        settlementBase(bid, #failed, now) with
        surplusReturned = credited;
        carriedE8s = bid.servedE8s;
        failureReason = ?reason;
      },
    );
    // The part that was to be minted (end-of-mint remainder) was never minted: it
    // is simply released for the next lot.
    let mintPart = mintAllocation(closing, bid);
    store.remainderCommittedE8s := Nat.sub(store.remainderCommittedE8s, Nat.min(store.remainderCommittedE8s, mintPart));
    store.committedReturnedE8s := Nat.sub(store.committedReturnedE8s, Nat.min(store.committedReturnedE8s, Nat.sub(bid.servedE8s, mintPart)));
    let before = switch (closing.failedCarriedE8s.get(bid.auctionId)) { case (?v) v; case null 0 };
    closing.failedCarriedE8s.add(bid.auctionId, before + bid.servedE8s);
  };

  // --- Moves from the auction custody to the DEX custody ------------------------------------

  // PTM-9d: the latest (highest n) move of one bid, read from the moves of its
  // bidder and token only (movesByBidder), never from all the moves.
  public func latestMove(closing : Types.ClosingStore, owner : Principal, token : Types.PayToken, bidId : Types.BidId) : ?Types.AuctionMove {
    switch (closing.movesByBidder.get(balanceKey(owner, token))) {
      case null null;
      case (?ns) {
        for (n in ns.reverseValues()) {
          switch (closing.moves.get(n)) {
            case (?m) { if (m.bidId == ?bidId) { return ?m } };
            case null {};
          };
        };
        null;
      };
    };
  };

  // A move of this bidder and token still unresolved (in progress or to review);
  // reads only that bidder's moves (movesByBidder).
  public func hasOpenMove(closing : Types.ClosingStore, owner : Principal, token : Types.PayToken) : Bool {
    switch (closing.movesByBidder.get(balanceKey(owner, token))) {
      case null false;
      case (?ns) {
        for (n in ns.values()) {
          if (closing.activeMoves.contains(n)) {
            switch (closing.moves.get(n)) {
              case (?m) {
                switch (m.status) {
                  case (#inProgress or #needsReview) { return true };
                  case _ {};
                };
              };
              case null {};
            };
          };
        };
        false;
      };
    };
  };

  // Records a move (before any await): gross is taken from the bidder's auction
  // balance only when it completes. Null when gross does not exceed the fee.
  func openMove(ctx : SettleContext, owner : Principal, token : Types.PayToken, fromPending : Nat, fromWithdrawable : Nat, bidId : ?Types.BidId) : ?Types.AuctionMove {
    let dex = ctx.mint.dex;
    let dexT = dexToken(token);
    let gross = fromPending + fromWithdrawable;
    let fee = RetryLib.dexFee(dex, dexT);
    if (gross <= fee) { return null };
    let request : RetryTypes.DexTransferRequest = {
      token = dexT;
      from = RetryLib.auctionCustodyAccount(ctx.mint.canister, dexT);
      to = DexLib.custodyAccount(ctx.mint.canister, dexT);
      amount = Nat.sub(gross, fee);
      fee = ?fee;
    };
    let attempt = RetryLib.newDexAttempt(dex.retry, #SW, null, request, RetryLib.dexNow());
    let move : Types.AuctionMove = {
      n = attempt.n;
      owner;
      token;
      gross;
      fromPending;
      fromWithdrawable;
      credited = Nat.sub(gross, fee);
      bidId;
      createdAt = Time.now();
      attempt;
      status = #inProgress;
    };
    putMove(ctx.closing, move);
    ?move;
  };

  // The move succeeded: credits the DEX balance with what the DEX custody
  // received and reduces the bidder's auction balance by the gross amount, in
  // one synchronous block.
  func completeMove(ctx : SettleContext, move : Types.AuctionMove, attempt : RetryTypes.DexTransferAttempt, block : Nat) {
    switch (ctx.closing.balances.get(balanceKey(move.owner, move.token))) {
      case (?b) {
        b.pendingSettlement := Nat.sub(b.pendingSettlement, Nat.min(b.pendingSettlement, move.fromPending));
        b.withdrawable := Nat.sub(b.withdrawable, Nat.min(b.withdrawable, move.fromWithdrawable));
      };
      case null {};
    };
    DexLib.credit(ctx.mint.dex.balances, move.owner, dexToken(move.token), move.credited);
    putMove(ctx.closing, { move with attempt; status = #completed(block) });
    syncDust(ctx.closing, move.owner, move.token);
  };

  // Sends the recorded move as recorded (same memo and created_at_time). The
  // send count is stored before the await; the lock of the transfer is
  // released in a finally. Never traps on a ledger error.
  func sendMove(ctx : SettleContext, n : Nat) : async () {
    let key = RetryLib.lockKey(#SW, n);
    if (not RetryLib.tryLock(ctx.mint.dex.locks, key)) { return };
    try {
      let m = switch (ctx.closing.moves.get(n)) {
        case (?m) m;
        case null { return };
      };
      if (m.status != #inProgress) { return };
      putMove(ctx.closing, { m with attempt = { m.attempt with sends = m.attempt.sends + 1 } });
      let done = await RetryLib.sendDexAttempt(ctx.mint.dex, m.attempt);
      let current = switch (ctx.closing.moves.get(n)) {
        case (?c) c;
        case null { return };
      };
      if (current.status != #inProgress) {
        putMove(ctx.closing, { current with attempt = done });
        return;
      };
      switch (done.outcome) {
        case (#succeeded(block)) { completeMove(ctx, current, done, block) };
        case (#failed(text)) { putMove(ctx.closing, { current with attempt = done; status = #failed(text) }) };
        case _ { putMove(ctx.closing, { current with attempt = done }) };
      };
    } finally {
      RetryLib.unlock(ctx.mint.dex.locks, key);
    };
  };

  // Resends the moves in progress as recorded within 23 h; an unknown outcome
  // after 23 h is listed for review; a move never sent and too old is closed.
  public func resendMoves(ctx : SettleContext) : async () {
    let now = RetryLib.dexNow();
    let open = ctx.closing.moves.values().filter(func(m : Types.AuctionMove) : Bool { m.status == #inProgress }).toArray();
    for (m in open.values()) {
      if (not ctx.mint.dex.locks.contains(RetryLib.lockKey(#SW, m.n))) {
        switch (RetryLib.dexAction(m.attempt, now)) {
          case (#resend) { await sendMove(ctx, m.n) };
          case (#needsReview) { putMove(ctx.closing, { m with status = #needsReview }) };
          case (#newAttempt) {
            let text = "Not sent within 23 h; nothing moved";
            putMove(ctx.closing, { m with status = #failed(text); attempt = { m.attempt with outcome = #failed(text) } });
          };
          case (#done) {};
        };
      };
    };
  };

  // Moves the withdrawable balances (unserved deposits, unserved parts, deposit
  // excesses) of the bidders to the DEX custody and credits their DEX balance,
  // so the existing withdrawFromDex pays them out. One bidder and token at a
  // time, under their DEX lock; `only` restricts to the bidders of an auction.
  // PTM-9d: the (owner, token) balances a sweep has to move. A withdrawable
  // balance not above the ledger fee of its token is dust: it is ignored, stays
  // in place and is added to the next return of the same person. Dust balances
  // cost neither a lock, nor a set entry, nor a move.
  public func sweepTargets(closing : Types.ClosingStore, only : ?Types.AuctionId) : [(Principal, Types.PayToken)] {
    let todo = List.empty<(Principal, Types.PayToken)>();
    switch (only) {
      case (?auctionId) {
        for (b in (switch (closing.closedBids.get(auctionId)) { case (?x) x; case null [] }).values()) {
          switch (closing.balances.get(balanceKey(b.bidder, b.token))) {
            case (?bal) { if (bal.withdrawable > ledgerFee(b.token)) { todo.add((b.bidder, b.token)) } };
            case null {};
          };
        };
      };
      case null {
        for (b in closing.balances.values()) {
          if (b.withdrawable > ledgerFee(b.token)) { todo.add((b.owner, b.token)) };
        };
      };
    };
    todo.toArray();
  };

  public func sweepReturns(ctx : SettleContext, only : ?Types.AuctionId) : async () {
    let dex = ctx.mint.dex;
    let todo = sweepTargets(ctx.closing, only);
    let seen = Set.empty<Text>();
    for ((owner, token) in todo.values()) {
      let k = balanceKey(owner, token);
      if (not seen.contains(k)) {
        seen.add(k);
        if (dex.pause.paused) { return };
        let amount = switch (ctx.closing.balances.get(k)) { case (?b) b.withdrawable; case null 0 };
        if (amount > ledgerFee(token) and not hasOpenMove(ctx.closing, owner, token)) {
          let lockKey = RetryLib.dexLockKey(owner, dexToken(token));
          if (RetryLib.tryLock(dex.locks, lockKey)) {
            try {
              // Re-read under the lock: the balance can have moved meanwhile.
              let again = switch (ctx.closing.balances.get(k)) { case (?b) b.withdrawable; case null 0 };
              if (again > ledgerFee(token) and not hasOpenMove(ctx.closing, owner, token)) {
                switch (openMove(ctx, owner, token, 0, again, null)) {
                  case (?m) { await sendMove(ctx, m.n) };
                  case null {};
                };
              };
            } finally {
              RetryLib.unlock(dex.locks, lockKey);
            };
          };
        };
      };
    };
  };

  // --- Settlement of one winner -----------------------------------------------------------------

  // Isolated core, reached only through the self-call of settleAuctionWinners.
  // Re-verifies the bid, the deposit that reached the winner's DEX balance and
  // the returned TTTI-T, pools the winner and records the settlement. Every
  // refusal is a trap, which undoes the whole message.
  public func settleCore(ctx : SettleContext, a : Types.SettleCoreArgs) : Types.SettleCoreResult {
    let closing = ctx.closing;
    let now = Time.now();
    if (ctx.mint.dex.pause.paused) { Runtime.trap("The DEX is paused") };
    let bids = switch (closing.closedBids.get(a.auctionId)) {
      case (?b) b;
      case null { Runtime.trap("Unknown closed auction") };
    };
    let bid = switch (bids.find(func(b : Types.ClosedBid) : Bool { b.id == a.bidId })) {
      case (?b) b;
      case null { Runtime.trap("Unknown bid") };
    };
    if (bid.bidder != a.owner or bid.token != a.token or bid.servedE8s != a.quantityE8s or bid.priceB != a.priceB or a.quantityE8s == 0) {
      Runtime.trap("The bid does not match");
    };
    if (isFinal(closing, a.bidId)) { Runtime.trap("This bid is already settled") };
    let credited = switch (latestMove(closing, a.owner, a.token, a.bidId)) {
      case (?m) {
        switch (m.status) {
          case (#completed(_)) m.credited;
          case _ { Runtime.trap("The deposit has not reached the DEX balance") };
        };
      };
      case null { Runtime.trap("No deposit move for this bid") };
    };
    let reserveUnit = switch (settleReserveUnit(ctx.mint, a.token, Time.now())) {
      case (?u) u;
      case null { Runtime.trap("The rate of the paid token is not usable") };
    };
    // PTM-10b: m is read here, at settlement time; the bid's choice was stored with the bid.
    if (bid.choice != a.choice) { Runtime.trap("The choice does not match the bid") };
    let mShare = LiquidityMintLib.shareNow(ctx.mint, now);
    let amounts = settleAmounts(a.priceB, reserveUnit, a.quantityE8s, mShare, bid.choice);
    let moveFee = switch (latestMove(closing, a.owner, a.token, a.bidId)) { case (?m) Nat.sub(m.gross, m.credited); case null 0 };
    let borne = feeBorneByCreator(amounts, moveFee);
    if (credited < requiredCredit(amounts, moveFee)) { Runtime.trap("The deposit is lower than the amount to take") };
    // PTM-9b: the end-of-mint remainder share of this winner is minted now.
    let mintE8s = mintAllocation(closing, bid);
    if (a.mintE8s != mintE8s) { Runtime.trap("The quantity to mint does not match") };
    let fromReturned = Nat.sub(a.quantityE8s, mintE8s);
    let committed = ctx.store.committedReturnedE8s;
    if (committed < fromReturned) { Runtime.trap("The quantity is not committed") };
    if (ctx.store.remainderCommittedE8s < mintE8s) { Runtime.trap("The remainder is not committed") };
    let balance = IcrcLib.balanceOf(ctx.mint.ledger, IcrcLib.returnedAccount(ctx.mint.canister));
    // What the returned account may release: its balance less the other commitments.
    let spare = Nat.sub(balance, Nat.min(balance, Nat.sub(committed, fromReturned)));
    let r = LiquidityMintLib.settleWinner(
      ctx.mint,
      { bidId = a.bidId; owner = a.owner; token = a.token; q = a.quantityE8s; priceB = a.priceB; reserveUnit; mShareE6 = mShare; choice = bid.choice; taken = amounts.taken; feeBorne = borne; spareTtti = spare; mintE8s; conversionAllowance = Nat.sub(credited, requiredCredit(amounts, moveFee)) },
    );
    ctx.store.committedReturnedE8s := Nat.sub(committed, fromReturned);
    ctx.store.remainderCommittedE8s := Nat.sub(ctx.store.remainderCommittedE8s, mintE8s);
    closing.settlements.add(
      a.bidId,
      {
        settlementBase(bid, #settled, now) with
        settledE8s = a.quantityE8s;
        takenAmount = r.taken;
        creatorShare = r.creator;
        positionAmount = r.position;
        guaranteeAmount = r.guarantee;
        mintedE8s = r.minted;
        surplusReturned = Nat.sub(credited, Nat.min(credited, r.charged + r.conversionCost));
        positionId = r.positionId;
        mShareE6 = r.mShareE6;
        choice = bid.choice;
        lockedAmount = r.lockedAmount;
        lockedPositionId = r.lockedPositionId;
        handE8s = r.handE8s;
        settledAt = ?now;
      },
    );
    markSettled(closing, a.auctionId);
    {
      takenAmount = r.taken;
      creatorShare = r.creator;
      positionAmount = r.position;
      guaranteeAmount = r.guarantee;
      reserveToken = r.reserveToken;
      conversionCost = r.conversionCost;
      mintedE8s = r.minted;
      positionId = r.positionId;
      mShareE6 = r.mShareE6;
      lockedAmount = r.lockedAmount;
      lockedPositionId = r.lockedPositionId;
      handE8s = r.handE8s;
      shares = r.shares;
    };
  };

  // Step 1 then step 2 for ONE winner, under the winner's DEX lock for the
  // token (so withdrawFromDex cannot take the credited deposit in between).
  // Leaves the bid pending when it cannot be decided now (move unresolved,
  // lock taken, pause).
  func settleOne(ctx : SettleContext, bid : Types.ClosedBid) : async () {
    let dex = ctx.mint.dex;
    let lockKey = RetryLib.dexLockKey(bid.bidder, dexToken(bid.token));
    if (not RetryLib.tryLock(dex.locks, lockKey)) { return };
    try {
      if (isFinal(ctx.closing, bid.id)) { return };
      // Step 1: the served deposit reaches the winner's DEX balance.
      let existing = latestMove(ctx.closing, bid.bidder, bid.token, bid.id);
      let move : ?Types.AuctionMove = switch (existing) {
        case (?m) {
          switch (m.status) {
            case (#failed(_)) {
              if (hasOpenMove(ctx.closing, bid.bidder, bid.token)) { null } else { openBidMove(ctx, bid) };
            };
            case _ ?m;
          };
        };
        case null {
          if (hasOpenMove(ctx.closing, bid.bidder, bid.token)) { null } else { openBidMove(ctx, bid) };
        };
      };
      let m0 = switch (move) {
        case (?m) m;
        case null { return };
      };
      if (m0.status == #inProgress) { await sendMove(ctx, m0.n) };
      let m1 = switch (ctx.closing.moves.get(m0.n)) {
        case (?m) m;
        case null { return };
      };
      switch (m1.status) {
        case (#completed(_)) {};
        case _ { return };
      };
      // Step 2: the isolated, all-or-nothing settlement.
      if (dex.pause.paused) { return };
      let now = Time.now();
      // PTM-11: without a usable rate the settlement waits, nothing is decided.
      let reserveUnit = switch (settleReserveUnit(ctx.mint, bid.token, now)) {
        case (?u) u;
        case null { return };
      };
      let amounts = settleAmounts(bid.priceB, reserveUnit, bid.servedE8s, LiquidityMintLib.shareNow(ctx.mint, now), bid.choice);
      let required = requiredCredit(amounts, Nat.sub(m1.gross, m1.credited));
      if (m1.credited < required) {
        recordFailure(
          ctx.store,
          ctx.closing,
          bid,
          m1.credited,
          "The deposit net of the internal move fee (" # m1.credited.toText() # ") is lower than the amount to take net of the fee borne by the creator share (" # required.toText() # ")",
          now,
        );
        return;
      };
      try {
        ignore await ctx.isolated({ auctionId = bid.auctionId; bidId = bid.id; owner = bid.bidder; token = bid.token; quantityE8s = bid.servedE8s; priceB = bid.priceB; choice = bid.choice; mintE8s = mintAllocation(ctx.closing, bid) });
      } catch (e) {
        // The core may have run to the end with only its reply lost: keep that settlement.
        if (not isFinal(ctx.closing, bid.id)) {
          recordFailure(ctx.store, ctx.closing, bid, m1.credited, LiquidityMintLib.refusalCause(e.message()), now);
        };
      };
    } finally {
      RetryLib.unlock(dex.locks, lockKey);
    };
  };

  // Records the move of a served deposit (from pendingSettlement). When the
  // deposit cannot cover the ledger fee it cannot be moved: the settlement
  // fails and the amount becomes withdrawable.
  func openBidMove(ctx : SettleContext, bid : Types.ClosedBid) : ?Types.AuctionMove {
    let available = switch (ctx.closing.balances.get(balanceKey(bid.bidder, bid.token))) {
      case (?b) b.pendingSettlement;
      case null 0;
    };
    if (available < bid.servedDeposit) { return null };
    // The deposit formula leaves no room for the ledger fee of the internal move
    // (servedDeposit equals the amount to take). The creator share (1 % of the
    // amount taken) bears the fee first; only a shortfall is covered by the
    // winner's own bid excess, moved with the deposit. Neither covering it, the
    // settlement refuses with the credited deposit left in the DEX balance.
    let reserveUnit = switch (settleReserveUnit(ctx.mint, bid.token, Time.now())) {
      case (?u) u;
      case null { return null };
    };
    let fee = RetryLib.dexFee(ctx.mint.dex, dexToken(bid.token));
    let shortfall = Nat.sub(fee, feeBorneByCreator(settleAmounts(bid.priceB, reserveUnit, bid.servedE8s, LiquidityMintLib.shareNow(ctx.mint, Time.now()), bid.choice), fee));
    let spare = switch (ctx.closing.balances.get(balanceKey(bid.bidder, bid.token))) {
      case (?b) b.withdrawable;
      case null 0;
    };
    let extra = Nat.min(shortfall, Nat.min(bid.returned, spare));
    switch (openMove(ctx, bid.bidder, bid.token, bid.servedDeposit, extra, ?bid.id)) {
      case (?m) ?m;
      case null {
        switch (ctx.closing.balances.get(balanceKey(bid.bidder, bid.token))) {
          case (?b) {
            b.pendingSettlement := Nat.sub(b.pendingSettlement, bid.servedDeposit);
            b.withdrawable += bid.servedDeposit;
          };
          case null {};
        };
        recordFailure(ctx.store, ctx.closing, bid, 0, "The served deposit does not cover the ledger fee of the move to the DEX", Time.now());
        null;
      };
    };
  };

  // Settles the pending served bids of a closed auction ONE AT A TIME, in
  // ranking order, then moves the returns of its bidders to their DEX balance.
  public func settleAuction(ctx : SettleContext, auctionId : Types.AuctionId) : async Result.Result<Types.SettleReport, Types.SettleError> {
    if (ctx.mint.dex.pause.paused) { return #err(#paused) };
    let auction = switch (ctx.closing.closed.get(auctionId)) {
      case (?a) a;
      case null { return #err(#unknownAuction) };
    };
    let key = "AUCTION/SETTLE/" # auctionId.toText();
    if (not RetryLib.tryLock(ctx.locks, key)) { return #err(#inProgress) };
    try {
      let winners = pendingWinners(ctx.closing, auction);
      if (winners.size() == 0) {
        await sweepReturns(ctx, ?auctionId);
        return #err(#nothingToSettle);
      };
      var attempted = 0;
      var settled = 0;
      var failed = 0;
      var settledE8s = 0;
      var carriedE8s = 0;
      for (bid in winners.values()) {
        if (not ctx.mint.dex.pause.paused) {
          await settleOne(ctx, bid);
          switch (ctx.closing.settlements.get(bid.id)) {
            case (?s) {
              attempted += 1;
              switch (s.status) {
                case (#settled) { settled += 1; settledE8s += s.settledE8s };
                case (#failed) { failed += 1; carriedE8s += s.carriedE8s };
                case _ {};
              };
            };
            case null {};
          };
        };
      };
      await sweepReturns(ctx, ?auctionId);
      markSettled(ctx.closing, auctionId);
      let remaining = pendingWinners(ctx.closing, auction).size();
      #ok({ auctionId; attempted; settled; failed; remaining; settledE8s; carriedE8s });
    } finally {
      RetryLib.unlock(ctx.locks, key);
    };
  };

  // Timer pass: resends the moves in progress, settles every closed auction
  // that still has a pending winner (unless paused) and moves the returns.
  public func runSettlements(ctx : SettleContext) : async () {
    let key = "AUCTION/SETTLE-RUN";
    if (not RetryLib.tryLock(ctx.locks, key)) { return };
    try {
      await resendMoves(ctx);
      if (ctx.mint.dex.pause.paused) { return };
      let ids = ctx.closing.closed.keys().toArray();
      for (id in ids.values()) {
        // PTM-9d: a fully settled auction is skipped without scanning its settlements.
        if (not ctx.closing.settledAuctions.contains(id)) {
          switch (ctx.closing.closed.get(id)) {
            case (?a) {
              markSettled(ctx.closing, id);
              if (not ctx.closing.settledAuctions.contains(id) and pendingWinners(ctx.closing, a).size() > 0) {
                ignore await settleAuction(ctx, id);
              };
            };
            case null {};
          };
        };
      };
      await sweepReturns(ctx, null);
    } finally {
      RetryLib.unlock(ctx.locks, key);
    };
  };

  // --- Timer ---------------------------------------------------------------------------

  // Settles deposits that resolved, closes the auction whose closing time has
  // passed, then opens the next one when possible. Re-armed on every install
  // and upgrade (timers do not survive an upgrade).
  public func step(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    ledger : IcrcLib.Ledger,
    dex : RetryLib.DexContext,
    canister : Principal,
    oracle : OracleLib.OracleStore,
    tokenRates : OracleLib.TokenRateStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
  ) {
    reconcile(store, closing, dex);
    let now = Time.now();
    ignore closeIfDue(store, closing, dex, oracle, tokenRates, samples, now);
    if (not dex.pause.paused) {
      ignore openAuction(store, ledger, canister, now);
    };
  };

  // PTM-6c: after each step the settlement pass runs (moves, winners, returns).
  public func startTimer<system>(
    store : Types.AuctionStore,
    closing : Types.ClosingStore,
    ledger : IcrcLib.Ledger,
    dex : RetryLib.DexContext,
    canister : Principal,
    oracle : OracleLib.OracleStore,
    tokenRates : OracleLib.TokenRateStore,
    samples : List.List<ProtocolFeeTypes.ConsolidatedSample>,
    settle : SettleContext,
  ) {
    ignore Timer.recurringTimer<system>(
      #seconds TIMER_SECONDS,
      func() : async () {
        step(store, closing, ledger, dex, canister, oracle, tokenRates, samples);
        await runSettlements(settle);
      },
    );
    ignore Timer.setTimer<system>(
      #seconds 5,
      func() : async () {
        step(store, closing, ledger, dex, canister, oracle, tokenRates, samples);
        await runSettlements(settle);
      },
    );
  };
};
