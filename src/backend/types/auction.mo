import Map "mo:core/Map";
import Set "mo:core/Set";
import Pay "pay-token";
import Retry "retry";

// PTM-6a: sealed-bid auction of the returned TTTI-T, offers only. An auction
// opens as soon as a non-empty lot exists and lasts 24 h. The lot is all the
// TTTI-T returned and accumulated on the returned account since the previous
// lot; TTTI-T returned during an open auction belongs to the next lot. A bid
// is firm: it cannot be withdrawn or changed. Bids stay hidden from everyone
// but their author until the closing (a later lot). Closing, settlement and
// the refund of the excess deposit are not part of this lot.
module {
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // ns (Time.now())
  public type AuctionId = Nat;
  public type BidId = Nat;

  // Minimum quantity of one bid: 0.001 TTTI-T in e8s.
  public let MIN_QUANTITY_E8S : Nat = 100_000;
  // Most bids one person can place in an auction.
  public let MAX_BIDS_PER_PERSON : Nat = 10;
  // Duration of an auction: 24 h in ns.
  public let AUCTION_DURATION_NS : Int = 86_400_000_000_000;

  // One auction. lotSizeE8s is fixed at opening; closesAt = openedAt + 24 h.
  // PTM-9b: remainderE8s is the part of the lot that is not on the returned
  // account yet: the unminted remainder at the end of the mint (below the
  // minimum of one mint), carried into the first lot and minted only at
  // settlement, for the winner, pooled with the winner's mass. 0 when none.
  // blockSale is true when the lot is below the minimum of one bid
  // (MIN_QUANTITY_E8S): it is sold whole, each bid being a price per whole
  // TTTI-T for the entire lot (quantityE8s = lotSizeE8s), the best bid wins all.
  public type Auction = {
    id : AuctionId;
    openedAt : Timestamp;
    closesAt : Timestamp;
    lotSizeE8s : Nat;
    blockSale : Bool;
    remainderE8s : Nat;
  };

  // One firm bid. priceB is in the token's smallest unit per whole TTTI-T.
  // requiredDeposit = ceil(2 x priceB x quantityE8s / (10^8 x 0.99)) in the
  // token's smallest unit; deposited >= requiredDeposit (the excess is refunded
  // at the closing, a later lot). memo is the deposit memo TTTI-AB-<n> and
  // block the ledger block of the deposit pull.
  public type Bid = {
    id : BidId;
    auctionId : AuctionId;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Timestamp;
    memo : Blob;
    block : Nat;
  };

  // A bid whose deposit is recorded (attempt opened before the first await)
  // and not yet settled into a Bid. Keyed by the deposit number n (the global
  // retry number of memo TTTI-AB-<n>). It is removed when the deposit succeeded
  // (the Bid is recorded) or failed with a known ledger error (nothing taken).
  public type PendingBid = {
    n : Nat;
    auctionId : AuctionId;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Timestamp;
  };

  // Stable state. current is the open auction (null when none). The returned
  // TTTI-T already committed to lots is committedReturnedE8s, so the next lot
  // = balance of the returned account - committedReturnedE8s. bids holds the
  // bids of the current auction, keyed by bid id; pending the bids whose
  // deposit is not settled yet, keyed by deposit number.
  public type AuctionStore = {
    var current : ?Auction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : AuctionId;
    var nextBidId : BidId;
    // PTM-9b: part of the unminted mint remainder already committed to a lot
    // (the open auction, or a closed one whose winners are not settled yet).
    // It is released when the remainder is minted at settlement, carried over
    // or refused; the next lot takes mintableRemaining minus this amount.
    var remainderCommittedE8s : Nat;
    bids : Map.Map<BidId, Bid>;
    pending : Map.Map<Nat, PendingBid>;
  };

  // Reserve price expressed in one payment token (smallest unit per whole
  // TTTI-T) at the current oracle rate; null when the rate is absent or expired.
  public type TokenReservePrice = {
    token : PayToken;
    price : ?Nat;
  };

  // Which of the three reserve components is the highest (ties: the fixed floor
  // first, then the current consolidated price).
  public type ReserveBinding = {
    #floor;
    #consolidated;
    #dailyAverage;
  };

  // The reserve price in USD x 1e8 per whole TTTI-T, computed on every read and
  // never stored: the highest of the fixed floor (10_000 USD), the 24 h average
  // of the consolidated price and the current consolidated price. An
  // unavailable component is null and ignored.
  public type ReserveBreakdown = {
    reserveUsdE8 : Nat;
    floorUsdE8 : Nat;
    consolidatedUsdE8 : ?Nat;
    dailyAverageUsdE8 : ?Nat;
    binding : ReserveBinding;
  };

  // Public view of the current auction. It carries nothing about the bids of
  // other people, not even a count.
  public type AuctionView = {
    open : Bool;
    auctionId : ?AuctionId;
    lotSizeE8s : Nat; // 0 when no auction is open
    openedAt : ?Timestamp;
    closesAt : ?Timestamp;
    pendingLotE8s : Nat; // next lot: returned TTTI-T not yet committed to a lot, plus pendingRemainderE8s
    // PTM-9b: part of the open lot that is the end-of-mint remainder (0 when
    // no auction is open or none carried); minted at settlement, not before.
    lotRemainderE8s : Nat;
    // PTM-9b: end-of-mint remainder not yet committed to a lot; included in
    // pendingLotE8s and joins the next lot to open.
    pendingRemainderE8s : Nat;
    // PTM-9b: true when the open lot is sold in block (below the minimum of one
    // bid): each bid is a price per whole TTTI-T for the entire lot.
    blockSale : Bool;
    reservePriceUsdE8 : Nat; // effective reserve: highest of the three below, USD x 1e8 per whole TTTI-T
    reserveFloorUsdE8 : Nat; // fixed floor, 10_000 USD x 1e8
    consolidatedPriceUsdE8 : ?Nat; // current consolidated price; null when unavailable
    dailyAverageUsdE8 : ?Nat; // 24 h average of the consolidated price; null without samples
    reserveBinding : ReserveBinding; // which of the three is currently the reserve
    reservePrices : [TokenReservePrice]; // effective reserve in each payment token at its current rate
    minQuantityE8s : Nat; // 100_000
    maxBidsPerPerson : Nat; // 10
    guaranteeRecoverable : Bool; // true: shows "garantie récupérable"
    // PTM-6b: true when the current auction is past closesAt and closing is
    // waiting for a valid oracle rate (no bid has been served yet).
    closingPending : Bool;
  };

  public type BidError = {
    #anonymous;
    #paused;
    #noOpenAuction;
    #quantityBelowMinimum : { minimum : Nat };
    #invalidPrice; // zero price
    #tooManyBids : { maximum : Nat };
    #depositBelowRequired : { required : Nat; deposited : Nat };
    #allowanceInsufficient : { allowance : Nat; required : Nat };
    #insufficientFunds : { balance : Nat; required : Nat };
    #bidInProgress; // one bid at a time per caller
    #ledgerError : Text;
    // PTM-9b: the open lot is sold in block; quantityE8s must equal the lot.
    #wholeLotRequired : { lotSizeE8s : Nat };
    // PTM-9d: the bid price, converted to USD per whole TTTI-T at the current
    // rate of the bid token, is under the floor of 10_000 USD. minimumUsdE8 is
    // the floor (USD x 1e8 per whole TTTI-T); bidUsdE8 the converted bid price.
    #priceBelowMinimum : { minimumUsdE8 : Nat; bidUsdE8 : ?Nat };
    // PTM-9d: the deposit does not cover at least the ledger fee of the bid
    // token (smallest unit), so it could not be moved back.
    #depositBelowLedgerFee : { fee : Nat; deposited : Nat };
  };

  public type OpenAuctionError = {
    #paused;
    #alreadyOpen;
    #emptyLot;
  };

  // --- PTM-6b: closing ---------------------------------------------------------

  // Outcome of one bid of a closed auction.
  public type BidOutcome = {
    #served; // the whole quantity is served
    #partiallyServed; // only a part is served (last served bid)
    #notServed; // valid but not served (lot exhausted, or remainder under the minimum)
    #discardedBelowReserve; // price converted at the closing rate is under the reserve
  };

  // Status of a closed auction.
  public type ClosedStatus = {
    #fullySold; // nothing carried over
    #partiallySold; // some quantity served, the rest carried over
    #unsold; // no valid bid served: the whole lot is carried over
  };

  // The rate used for one payment token at closing: USD x 1e8 per whole token
  // (the usable hourly oracle rate); null when that token had no usable rate.
  public type ClosingRate = {
    token : PayToken;
    usdE8 : ?Nat;
  };

  // A closed auction. reserve carries the reserve applied (USD x 1e8 per whole
  // TTTI-T) with the three compared values, taken at closedAt. servedE8s +
  // carriedOverE8s = lotSizeE8s. carriedOverE8s goes back to the next lot.
  public type ClosedAuction = {
    id : AuctionId;
    openedAt : Timestamp;
    closesAt : Timestamp;
    closedAt : Timestamp; // when closing was executed (>= closesAt)
    lotSizeE8s : Nat;
    blockSale : Bool; // PTM-9b: the lot was sold in block (best bid takes all)
    remainderE8s : Nat; // PTM-9b: part of the lot still to be minted at settlement
    reserve : ReserveBreakdown;
    rates : [ClosingRate]; // one entry per payment token (icp, ckbtc, ckusdc, ckusdt)
    bidCount : Nat;
    servedE8s : Nat;
    carriedOverE8s : Nat;
    status : ClosedStatus;
  };

  // One bid of a closed auction with its outcome. Stored and published as is
  // (memo and ledger block of the deposit are not part of it). Amounts are in
  // the token's smallest unit; quantities in TTTI-T e8s.
  //   pricePaidB    = priceB when servedE8s > 0 (each winner pays their own
  //                   price per whole TTTI-T), 0 otherwise
  //   servedDeposit = deposit required for the served quantity (kept, pending
  //                   settlement); 0 when nothing is served
  //   returned      = deposited - servedDeposit, credited to the withdrawable
  //                   balance at closing
  public type ClosedBid = {
    id : BidId;
    auctionId : AuctionId;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Timestamp;
    outcome : BidOutcome;
    servedE8s : Nat;
    pricePaidB : Nat;
    servedDeposit : Nat;
    returned : Nat;
  };

  // Balance of one bidder in one deposit token. withdrawable: unserved offers,
  // unserved parts and the deposit excess credited at closing (to be paid out
  // by a later lot). pendingSettlement: deposits of served quantities, kept
  // until settlement; not withdrawable.
  public type BidderBalance = {
    owner : Principal;
    token : PayToken;
    var withdrawable : Nat;
    var pendingSettlement : Nat;
  };

  // PTM-6b stable state, next to AuctionStore (which is unchanged). On closing,
  // the bids of the closed auction leave AuctionStore.bids and are recorded in
  // closedBids (key: auction id). balances is keyed by
  // "<principal text>:<token>" with token one of icp, ckbtc, ckusdc, ckusdt.
  // closingSince is set when the closing time has passed and closing waits for
  // a valid oracle rate (closing pending), and cleared when the auction closes.
  // PTM-6c: settlements (one record per served bid, keyed by bid id, written
  // when a settlement is attempted) and, per closed auction, the quantity of
  // failed winners passed to the next lot (key: auction id).
  public type ClosingStore = {
    var closingSince : ?Timestamp;
    closed : Map.Map<AuctionId, ClosedAuction>;
    closedBids : Map.Map<AuctionId, [ClosedBid]>;
    balances : Map.Map<Text, BidderBalance>;
    settlements : Map.Map<BidId, BidSettlement>;
    failedCarriedE8s : Map.Map<AuctionId, Nat>;
    moves : Map.Map<Nat, AuctionMove>;
    // PTM-9d: moves of each bidder and token (key: "<principal text>:<token>",
    // same key as `balances`) as a set of move numbers, so a bidder's moves are
    // read without scanning `moves`. Built by the migration 20261206_000000
    // from the existing moves; kept in step by every new move.
    movesByBidder : Map.Map<Text, Set.Set<Nat>>;
    // PTM-9d: numbers of the moves still unresolved (#inProgress or
    // #needsReview). A move leaves this set when it completes or fails.
    activeMoves : Set.Set<Nat>;
    // PTM-9d: closed auctions whose winners are all settled or not required;
    // runSettlements skips them.
    settledAuctions : Set.Set<AuctionId>;
    // PTM-9d: carried dust per bidder and token (key: "<principal text>:<token>"):
    // a return too small to be moved is added here and joins that person's next
    // return of the same token.
    dust : Map.Map<Text, BidderDust>;
  };

  // PTM-9d: dust carried for one bidder in one token (smallest unit).
  public type BidderDust = {
    owner : Principal;
    token : PayToken;
    var amount : Nat;
  };

  // PTM-6c: status of a move from the auction custody to the DEX custody.
  //   #inProgress  recorded, sent as recorded until Ok / Duplicate or a known error
  //   #completed   the DEX balance was credited and the auction accounting reduced
  //   #failed      known ledger error: nothing moved, nothing credited
  //   #needsReview unknown outcome after 23 h: nothing credited, listed for review
  public type MoveStatus = {
    #inProgress;
    #completed : Nat; // ledger block
    #failed : Text;
    #needsReview;
  };

  // PTM-6c: one physical move of a bidder's funds of one token from the
  // AUCTION-BIDS custody account to the DEX custody account (memo TTTI-SW-n,
  // recorded before the first await, replayed as recorded). gross is taken
  // from the bidder's auction balance (fromPending of pendingSettlement and
  // fromWithdrawable of withdrawable) only when the move completes; the DEX
  // balance is credited with `credited` = gross - ledger fee at the same time.
  // bidId is set for the deposit of a served bid awaiting settlement.
  public type AuctionMove = {
    n : Nat;
    owner : Principal;
    token : PayToken;
    gross : Nat;
    fromPending : Nat;
    fromWithdrawable : Nat;
    credited : Nat;
    bidId : ?BidId;
    createdAt : Timestamp;
    attempt : Retry.DexTransferAttempt;
    status : MoveStatus;
  };

  // Result of one closed auction: the auction and ALL its bids.
  public type AuctionResult = {
    auction : ClosedAuction;
    bids : [ClosedBid];
  };

  // The caller's amounts in one deposit token.
  public type MyBalance = {
    token : PayToken;
    withdrawable : Nat;
    pendingSettlement : Nat;
  };

  // --- PTM-6c: settlement of the winners -------------------------------------

  // Settlement status of one bid of a closed auction.
  //   #notRequired: nothing was served, nothing to settle
  //   #pending:     served, settlement not attempted yet (or retryable)
  //   #settled:     pooled, guaranteed and creator share paid
  //   #failed:      the settlement was refused; the served deposit went back to
  //                 the bidder's DEX balance and the quantity to the next lot
  public type SettlementStatus = {
    #notRequired;
    #pending;
    #settled;
    #failed;
  };

  // Settlement of one served bid. Amounts are in the bid's token (smallest
  // unit), quantities in TTTI-T e8s.
  //   settledE8s      quantity pooled (q); 0 unless #settled
  //   takenAmount     2 x B x q / 0.99 taken from the deposit; 0 unless #settled
  //   creatorShare    1 % of takenAmount, for the creator
  //   positionAmount  half of the rest, formed with q TTTI-T in the pool (zap)
  //   guaranteeAmount the other half: B per TTTI-T, kept in the paid token
  //   surplusReturned credited to the bidder's DEX balance by the settlement:
  //                   the deposit left after takenAmount when #settled, the whole
  //                   served deposit when #failed
  //   carriedE8s      quantity passed to the next lot; q when #failed, else 0
  public type BidSettlement = {
    auctionId : AuctionId;
    bidId : BidId;
    bidder : Principal;
    token : PayToken;
    status : SettlementStatus;
    settledE8s : Nat;
    mintedE8s : Nat; // PTM-9b: part of settledE8s minted fresh at settlement (end-of-mint remainder)
    takenAmount : Nat;
    creatorShare : Nat;
    positionAmount : Nat;
    guaranteeAmount : Nat;
    surplusReturned : Nat;
    carriedE8s : Nat;
    positionId : ?Nat;
    failureReason : ?Text;
    attemptedAt : ?Timestamp;
    settledAt : ?Timestamp;
  };

  // Read-only roll-up of the settlement of one closed auction.
  public type AuctionSettlementSummary = {
    pendingCount : Nat;
    settledCount : Nat;
    failedCount : Nat;
    settledE8s : Nat; // quantity pooled so far
    failedCarriedE8s : Nat; // quantity of failed winners passed to the next lot
  };

  // The closed-auction queries keep their fields and add the settlement.
  public type ClosedBidView = ClosedBid and { settlement : BidSettlement };
  public type ClosedAuctionView = ClosedAuction and { settlement : AuctionSettlementSummary };
  public type AuctionResultView = {
    auction : ClosedAuctionView;
    bids : [ClosedBidView];
  };

  // Argument of the isolated self-call that settles ONE winner. The core
  // re-verifies the bid, the deposit held for it, the pool and the amounts;
  // every refusal is a trap, which undoes the whole message.
  public type SettleCoreArgs = {
    auctionId : AuctionId;
    bidId : BidId;
    owner : Principal;
    token : PayToken;
    quantityE8s : Nat; // served quantity q
    mintE8s : Nat; // PTM-9b: part of q minted fresh now (remainder), pooled with the winner's mass; <= q
    priceB : Nat; // price B per whole TTTI-T, in the paid token
  };

  // What the isolated call did for one winner.
  public type SettleCoreResult = {
    mintedE8s : Nat; // PTM-9b: TTTI-T minted fresh for this winner
    takenAmount : Nat;
    creatorShare : Nat;
    positionAmount : Nat;
    guaranteeAmount : Nat;
    positionId : ?Nat;
    shares : Nat;
  };

  public type SettleError = {
    #paused;
    #unknownAuction;
    #inProgress; // a settlement of this auction is already running
    #nothingToSettle; // no pending served bid
  };

  // Outcome of one settlement run (winners handled one at a time, in ranking order).
  public type SettleReport = {
    auctionId : AuctionId;
    attempted : Nat;
    settled : Nat;
    failed : Nat;
    remaining : Nat;
    settledE8s : Nat;
    carriedE8s : Nat;
  };
};
