import Nat "mo:core/Nat";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AuctionLib "../lib/auction";
import IcrcLib "../lib/icrc";
import OracleLib "../lib/oracle";
import RetryLib "../lib/retry";
import Types "../types/auction";
import DexTypes "../types/dex";
import ProtocolFeeTypes "../types/protocol-fees";

// Endpoints of the sealed-bid auction. Before closing nothing here lists,
// counts or reads other people's bids: the public view carries no bid data and
// getMyAuctionBids returns only the caller's own bids. PTM-6b: once an auction
// is closed, getAuctionResult publishes all its bids.
mixin (
  auction : Types.AuctionStore,
  closing : Types.ClosingStore,
  ledger : IcrcLib.Ledger,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
  dexContext : RetryLib.DexContext,
  canister : Principal,
  dex : DexTypes.DexStore,
  consolidatedPrices : ProtocolFeeTypes.ConsolidatedPriceStore,
  settle : AuctionLib.SettleContext, // PTM-6c: settlement context (transient, owned by main)
) {
  // Public: the current auction (open or none), lot size, closing time,
  // reserve price (highest of 10_000 USD, the 24 h average and the current
  // consolidated price, computed on every read) in USD e8 and in each payment
  // token with its three components, minimum quantity,
  // maximum bids per person and the "garantie récupérable" flag.
  public query func getAuctionView() : async Types.AuctionView {
    AuctionLib.view(auction, closing, ledger, canister, oracle, tokenRates, dex, consolidatedPrices.samples, Time.now());
  };

  // The caller's own bids of the current auction. Empty for an anonymous caller.
  public shared query ({ caller }) func getMyAuctionBids() : async [Types.Bid] {
    if (caller.isAnonymous()) { return [] };
    AuctionLib.bidsOf(auction, caller);
  };

  // Required deposit for a bid: ceil(2 x priceB x quantityE8s / (10^8 x 0.99)),
  // in the token's smallest unit. #invalidPrice for a zero price and
  // #quantityBelowMinimum under 100_000 e8s.
  public query func quoteAuctionDeposit(token : Types.PayToken, priceB : Nat, quantityE8s : Nat) : async Result.Result<Nat, Types.BidError> {
    ignore token;
    // PTM-9b: a lot sold in block takes only bids for the entire lot.
    AuctionLib.quoteDepositIn(auction, priceB, quantityE8s);
  };

  // Places a firm bid. The full deposit (depositAmount >= required deposit) is
  // pulled from the caller with icrc2_transfer_from before the bid is recorded.
  // PTM-9d: refused with #priceBelowMinimum when the bid price is under 10_000
  // USD per whole TTTI-T, and with #depositBelowLedgerFee when the deposit does
  // not cover at least the ledger fee of the token (both before any ledger call).
  public shared ({ caller }) func placeAuctionBid(token : Types.PayToken, quantityE8s : Nat, priceB : Nat, depositAmount : Nat) : async Result.Result<Types.Bid, Types.BidError> {
    await AuctionLib.placeBid(auction, closing, ledger, oracle, tokenRates, dexContext, canister, caller, token, quantityE8s, priceB, depositAmount);
  };

  // Anyone may call: opens an auction when none is open and a non-empty lot
  // exists (returned TTTI-T not yet committed to a lot).
  public shared func openAuction() : async Result.Result<Types.Auction, Types.OpenAuctionError> {
    if (dexContext.pause.paused) { return #err(#paused) };
    AuctionLib.openAuction(auction, ledger, canister, Time.now());
  };

  // Settlement of a served bid; derived (#pending / #notRequired) until a
  // settlement is attempted.
  func settlementOf(b : Types.ClosedBid) : Types.BidSettlement {
    switch (closing.settlements.get(b.id)) {
      case (?s) s;
      case null {
        {
          auctionId = b.auctionId;
          bidId = b.id;
          bidder = b.bidder;
          token = b.token;
          status = if (b.servedE8s == 0) #notRequired else #pending;
          settledE8s = 0;
          takenAmount = 0;
          creatorShare = 0;
          positionAmount = 0;
          guaranteeAmount = 0;
          mintedE8s = 0;
          surplusReturned = 0;
          carriedE8s = 0;
          positionId = null;
          failureReason = null;
          attemptedAt = null;
          settledAt = null;
        };
      };
    };
  };

  func summaryOf(a : Types.ClosedAuction) : Types.AuctionSettlementSummary {
    var pendingCount = 0;
    var settledCount = 0;
    var failedCount = 0;
    var settledE8s = 0;
    for (b in (closing.closedBids.get(a.id) ?? []).values()) {
      let s = settlementOf(b);
      switch (s.status) {
        case (#pending) { pendingCount += 1 };
        case (#settled) { settledCount += 1 };
        case (#failed) { failedCount += 1 };
        case (#notRequired) {};
      };
      settledE8s += s.settledE8s;
    };
    { pendingCount; settledCount; failedCount; settledE8s; failedCarriedE8s = closing.failedCarriedE8s.get(a.id) ?? 0 };
  };

  // PTM-6b. Public: every closed auction with its result, newest first. Bids
  // are not included (see getAuctionResult). PTM-6c: each carries the roll-up
  // of its settlement.
  public query func getClosedAuctions() : async [Types.ClosedAuctionView] {
    AuctionLib.closedAuctions(closing).map(func a = { a with settlement = summaryOf(a) });
  };

  // PTM-6b. Public: one closed auction by id with ALL its bids published
  // (bidder, quantity, price, token, outcome, served quantity, price paid,
  // deposit kept, amount returned). null for an unknown or still open auction.
  // PTM-6c: every bid carries its settlement (status, settled quantity, amount
  // taken, creator share, surplus returned, quantity carried to the next lot).
  public query func getAuctionResult(auctionId : Types.AuctionId) : async ?Types.AuctionResultView {
    switch (AuctionLib.auctionResult(closing, auctionId)) {
      case (?r) {
        ?{
          auction = { r.auction with settlement = summaryOf(r.auction) };
          bids = r.bids.map(func b = { b with settlement = settlementOf(b) });
        };
      };
      case null null;
    };
  };

  // PTM-6c. Anyone may call: settles the pending served bids of a closed
  // auction ONE AT A TIME, in ranking order, each through the isolated
  // self-call auctionSettleCore (all or nothing). A refused winner changes
  // nothing for them: the served deposit goes back to their DEX balance
  // (withdrawable with withdrawFromDex) and the quantity to the next lot; the
  // other winners are not touched. Returns #nothingToSettle when no served bid
  // is pending, #inProgress while a run of the same auction is active.
  public shared func settleAuctionWinners(auctionId : Types.AuctionId) : async Result.Result<Types.SettleReport, Types.SettleError> {
    await AuctionLib.settleAuction(settle, auctionId);
  };

  // PTM-6c. Isolated core settling ONE winner (auction id, bid id, owner, paid
  // token, served quantity q, price B). Reserved to the canister itself,
  // reached only through the self-call of settleAuctionWinners. It re-verifies
  // everything, pools the winner like the mint (taken 2 x B x q / 0.99, 1 % to
  // the creator, half in the pool with the q TTTI-T, half as guarantee of B per
  // TTTI-T) and returns the amounts. Every refusal is a trap.
  public shared ({ caller }) func auctionSettleCore(args : Types.SettleCoreArgs) : async Types.SettleCoreResult {
    if (caller != canister) { Runtime.trap("Reserved to the canister itself") };
    AuctionLib.settleCore(settle, args);
  };

  // PTM-6b. The caller's balances, one entry per deposit token with a non-zero
  // amount: withdrawable (unserved offers, unserved parts, deposit excess) and
  // pendingSettlement (deposits of served quantities, not withdrawable).
  // Empty for an anonymous caller.
  public shared query ({ caller }) func getMyWithdrawable() : async [Types.MyBalance] {
    if (caller.isAnonymous()) { return [] };
    AuctionLib.myBalances(closing, caller);
  };
};
