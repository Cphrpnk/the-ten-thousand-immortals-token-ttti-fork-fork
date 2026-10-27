import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import RetryTypes "../types/retry";
import BuybackTypes "../types/buyback";
import RetryLib "../lib/retry";
import BtcDepositLib "../lib/btc-deposit";
import BuybackLib "../lib/buyback";
import IcrcLib "../lib/icrc";

// Admin review ("To review") of forwards (FW), reserve shares (SH) and
// purchase refunds (RF) whose outcome is unknown after 23 h, payments to
// refund (PC), BTC refunds (BR) and BTC cost sends to the treasury (BC) under
// review, BTC costs of delivery-and-refund failures to refund by hand (BM),
// and buyback payouts (BB) under review plus legacy #payoutFailed buybacks.
mixin (
  transferContext : RetryLib.TransferContext,
  btcDeposits : BtcDepositLib.BtcDepositStore,
  accessControlState : AccessControl.AccessControlState,
  buybacks : BuybackTypes.BuybackStore,
  ledger : IcrcLib.Ledger,
) {
  // Admin only: every FW, SH, RF transfer needing review, every payment to
  // refund, every BR / BC send under review, every BM cost to refund and
  // every BB buyback payout to check.
  public query ({ caller }) func listTransfersToReview() : async [RetryTypes.TransferReview] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can review transfers");
    };
    RetryLib.toReview(transferContext).concat(BtcDepositLib.btcReview(btcDeposits, transferContext)).concat(BuybackLib.reviewRows(buybacks));
  };

  // Admin only, only on a #FW / #SH / #RF / #BR / #BC / #BB transfer needing
  // review: it arrived in `block` (#RF sets the purchase #refunded; #BB
  // releases the escrowed TTTI-T to the funder and completes the buyback).
  // #PC / #BM -> #notApplicable.
  public shared ({ caller }) func markTransferArrived(kind : RetryTypes.TransferKind, purchaseId : Nat, block : Nat) : async RetryTypes.ReviewResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (kind) {
      case (#BR or #BC or #BM) { BtcDepositLib.markBtcArrived(btcDeposits, transferContext, kind, purchaseId, block) };
      case (#BB) { BuybackLib.markArrived(buybacks, ledger, transferContext.canister, purchaseId, block) };
      case (_) { RetryLib.markArrived(transferContext, kind, purchaseId, block) };
    };
  };

  // Admin only, only on an item under review. #FW / #SH / #RF / #BR: it did
  // not arrive; opens a new attempt that the timer sends. #BC: nothing was
  // moved; the cost send and its payment to refund are removed and the
  // deposit is converted again by the timer. #PC (`purchaseId` = trace
  // number n): the payment never happened; it is removed from the list. #BB
  // (`purchaseId` = buyback id): the attempt is marked failed, so the buyer
  // can retry or cancel. #BM -> #notApplicable.
  public shared ({ caller }) func markTransferNotArrived(kind : RetryTypes.TransferKind, purchaseId : Nat) : async RetryTypes.ReviewResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (kind) {
      case (#BR or #BC or #BM) { BtcDepositLib.markBtcNotArrived(btcDeposits, transferContext, kind, purchaseId) };
      case (#BB) { BuybackLib.markNotArrived(buybacks, purchaseId) };
      case (_) { RetryLib.markNotArrived(transferContext, kind, purchaseId) };
    };
  };

  // Admin only, only on a #RF refund under review (`purchaseId` = conversion
  // id), a #PC payment to refund (`purchaseId` = trace number n) or a #BM
  // cost to refund (`purchaseId` = conversion id): refunded by hand in
  // `block`. #RF sets the purchase #refunded; #BM records the block on the
  // deposit entry; all remove the item. #FW / #SH / #BR / #BC / #BB ->
  // #notApplicable.
  public shared ({ caller }) func markRefundedManually(kind : RetryTypes.TransferKind, purchaseId : Nat, block : Nat) : async RetryTypes.ReviewResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (kind) {
      case (#BR or #BC or #BM) { BtcDepositLib.markBtcRefunded(btcDeposits, transferContext, kind, purchaseId, block) };
      case (#RF) {
        let result = RetryLib.markRefunded(transferContext, kind, purchaseId, block);
        // The same BTC cost may also be listed as a BM cost to refund.
        if (result == #ok) ignore BtcDepositLib.costRefunded(btcDeposits, purchaseId, block);
        result;
      };
      case (_) { RetryLib.markRefunded(transferContext, kind, purchaseId, block) };
    };
  };
};
