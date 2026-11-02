import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import AuctionLib "../src/backend/lib/auction";
import PayTokenLib "../src/backend/lib/pay-token";
import Types "../src/backend/types/auction";

// PTM-9d: price floor and ledger-fee refusals, dust left in place, moves
// indexed by bidder, settled auctions skipped. Pure tests that run in the
// interpreter (no ledger, no await).

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("2vxsx-fae");

// ICP at 5 USD (USD x 1e8).
let icpRate : ?Nat = ?500_000_000;

func principalOf(i : Nat) : Principal {
  Principal.fromBlob(Blob.fromArray([Nat8.fromNat(i % 256), Nat8.fromNat((i / 256) % 256), Nat8.fromNat(i / 65536), 7]));
};

func isPriceRefusal(r : { #ok : (); #err : Types.BidError }) : Bool {
  switch (r) {
    case (#err(#priceBelowMinimum(_))) true;
    case _ false;
  };
};

// --- 1. A bid at 1 USD per TTTI-T is refused -----------------------------------------------

do {
  // 1 USD per TTTI-T at ICP = 5 USD: 0.2 ICP.
  let r = AuctionLib.checkBidLimits(#icp, 20_000_000, icpRate, 1_000_000_000, 10_000);
  switch (r) {
    case (#err(#priceBelowMinimum({ minimumUsdE8; bidUsdE8 }))) {
      assert minimumUsdE8 == 10_000 * 100_000_000;
      assert bidUsdE8 == ?100_000_000;
    };
    case _ { assert false };
  };
  // One e8 under 10 000 USD is still refused; exactly 10 000 USD passes.
  assert isPriceRefusal(AuctionLib.checkBidLimits(#icp, 199_999_999_999, icpRate, 1_000_000_000, 10_000));
  assert AuctionLib.checkBidLimits(#icp, 200_000_000_000, icpRate, 1_000_000_000, 10_000) == #ok(());
  // No usable rate: the price cannot be checked, the bid is refused.
  switch (AuctionLib.checkBidLimits(#icp, 400_000_000_000, null, 1_000_000_000, 10_000)) {
    case (#err(#priceBelowMinimum({ bidUsdE8 }))) { assert bidUsdE8 == null };
    case _ { assert false };
  };
};

// --- 2. A deposit under the ledger fee is refused ------------------------------------------

do {
  switch (AuctionLib.checkBidLimits(#icp, 400_000_000_000, icpRate, 9_999, 10_000)) {
    case (#err(#depositBelowLedgerFee({ fee; deposited }))) {
      assert fee == 10_000;
      assert deposited == 9_999;
    };
    case _ { assert false };
  };
  assert AuctionLib.checkBidLimits(#icp, 400_000_000_000, icpRate, 10_000, 10_000) == #ok(());
};

// --- 3. 10 000 dust balances: nothing to sweep, no move ------------------------------------

do {
  let closing = AuctionLib.newClosingStore();
  let fee = PayTokenLib.expectedFee(#icp);
  var i = 0;
  while (i < 10_000) {
    let owner = principalOf(i);
    closing.balances.add(
      AuctionLib.balanceKey(owner, #icp),
      { owner; token = #icp; var withdrawable = 1 + (i % fee); var pendingSettlement = 0 },
    );
    i += 1;
  };
  assert closing.balances.size() == 10_000;
  // Every withdrawable amount is <= fee: no target, hence no lock and no move.
  assert AuctionLib.sweepTargets(closing, null).size() == 0;
  assert closing.moves.size() == 0;
  assert closing.activeMoves.size() == 0;
  // A balance above the fee is the only target; the dust stays in place.
  let big = principalOf(20_000);
  closing.balances.add(AuctionLib.balanceKey(big, #icp), { owner = big; token = #icp; var withdrawable = fee + 1; var pendingSettlement = 0 });
  let targets = AuctionLib.sweepTargets(closing, null);
  assert targets.size() == 1;
  assert targets[0].0 == big;
  assert closing.balances.size() == 10_001;
  // The dust balance of one person is untouched (nothing rewritten).
  switch (closing.balances.get(AuctionLib.balanceKey(principalOf(5), #icp))) {
    case (?b) { assert b.withdrawable == 1 + (5 % fee) };
    case null { assert false };
  };
};

// --- 4. hasOpenMove and latestMove read only the bidder's moves ----------------------------

func moveOf(n : Nat, owner : Principal, bidId : ?Nat, status : Types.MoveStatus) : Types.AuctionMove {
  let account = { owner; subaccount = null };
  {
    n;
    owner;
    token = #icp;
    gross = 100;
    fromPending = 0;
    fromWithdrawable = 100;
    credited = 90;
    bidId;
    createdAt = 0;
    attempt = {
      n;
      attempt = 1;
      memo = Blob.fromArray([]);
      created_at_time = 0;
      request = { token = #icp; from = account; to = account; amount = 90; fee = ?10 };
      sends = 0;
      lastError = null;
      outcome = #pending;
    };
    status;
  };
};

// Records a move in the store and in both indexes, as the library does.
func indexMove(closing : Types.ClosingStore, m : Types.AuctionMove, indexed : Bool) {
  closing.moves.add(m.n, m);
  if (indexed) {
    let key = AuctionLib.balanceKey(m.owner, m.token);
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
      case _ {};
    };
  };
};

do {
  let closing = AuctionLib.newClosingStore();
  // 5 000 completed moves of other bidders, all indexed under their own key.
  var i = 0;
  while (i < 5_000) {
    indexMove(closing, moveOf(100 + i, principalOf(1_000 + i), ?(100 + i), #completed(1)), true);
    i += 1;
  };
  // Bob has an open move that is in `moves` but not in the index: if the
  // functions scanned all the moves they would see it for Alice's query.
  indexMove(closing, moveOf(9_000, alice, ?7, #inProgress), false);
  assert not AuctionLib.hasOpenMove(closing, alice, #icp);
  assert AuctionLib.latestMove(closing, alice, #icp, 7) == null;
  // Once indexed, only Alice's own moves answer.
  indexMove(closing, moveOf(1, alice, ?7, #completed(5)), true);
  indexMove(closing, moveOf(2, alice, ?7, #failed("x")), true);
  indexMove(closing, moveOf(3, alice, ?8, #inProgress), true);
  assert AuctionLib.hasOpenMove(closing, alice, #icp);
  assert not AuctionLib.hasOpenMove(closing, bob, #icp);
  assert not AuctionLib.hasOpenMove(closing, alice, #ckbtc);
  switch (AuctionLib.latestMove(closing, alice, #icp, 7)) {
    case (?m) { assert m.n == 2 };
    case null { assert false };
  };
  switch (AuctionLib.latestMove(closing, alice, #icp, 8)) {
    case (?m) { assert m.n == 3 };
    case null { assert false };
  };
  assert AuctionLib.latestMove(closing, bob, #icp, 7) == null;
  // A completed move is not in the active list.
  assert not closing.activeMoves.contains(1);
  assert closing.activeMoves.contains(3);
};

// --- 5. settledAuctions ---------------------------------------------------------------------

do {
  let closing = AuctionLib.newClosingStore();
  // No closed bids entry for the auction: nothing is pending, it is settled.
  AuctionLib.markSettled(closing, 1);
  assert closing.settledAuctions.contains(1);
  assert closing.settledAuctions.size() == 1;
  // Idempotent.
  AuctionLib.markSettled(closing, 1);
  assert closing.settledAuctions.size() == 1;
};
