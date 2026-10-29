import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import RetryTypes "../types/retry";
import BuybackTypes "../types/buyback";
import RetryLib "../lib/retry";
import BtcDepositLib "../lib/btc-deposit";
import BuybackLib "../lib/buyback";
import IcrcLib "../lib/icrc";
import ProtocolFeesLib "../lib/protocol-fees";
import RouterLib "../lib/router";
import SettlementLib "../lib/settlement";
import AdminHistoryLib "../lib/admin-history";
import HistoryTypes "../types/admin-history";

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
  dexContext : RetryLib.DexContext,
  // DEX lot 4: DC sends and DL claims (`purchaseId` = n). Mint revenue
  // correction: MF mint-fee claims (`purchaseId` = n); OW owner sends
  // (`purchaseId` = owner send id) and SR reserve top-up (attempt n) go
  // through RetryLib.
  protocolFeeContext : ProtocolFeesLib.ProtocolFeeContext,
  // DEX lot 5: IR ICPSwap route transfers (`purchaseId` = routed swap id).
  routerContext : RouterLib.RouterContext,
  // Mint revenue routing: ST fee-account moves (`purchaseId` = n); revenue
  // and settlement owner sends are OW rows.
  settlementContext : SettlementLib.SettlementContext,
) {
  func allReviewRows() : [RetryTypes.TransferReview] {
    RetryLib.toReview(transferContext).concat(BtcDepositLib.btcReview(btcDeposits, transferContext)).concat(BuybackLib.reviewRows(buybacks)).concat(RetryLib.dexToReview(dexContext)).concat(ProtocolFeesLib.toReview(protocolFeeContext)).concat(RouterLib.toReview(routerContext)).concat(SettlementLib.toReview(settlementContext));
  };

  // Admin only: every FW, SH, RF transfer needing review, every payment to
  // refund, every BR / BC send under review, every BM cost to refund and
  // every BB buyback payout to check, plus DEX DD / DW / DQ rows to review.
  public query ({ caller }) func listTransfersToReview() : async [RetryTypes.TransferReview] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can review transfers");
    };
    allReviewRows();
  };

  // Admin only: the same list filtered by kinds (empty = all) and token.
  public query ({ caller }) func listTransfersToReviewFiltered(filter : HistoryTypes.ReviewFilter) : async [RetryTypes.TransferReview] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can review transfers");
    };
    AdminHistoryLib.filterReview(allReviewRows(), filter);
  };

  // Admin only, only on a #FW / #SH / #RF / #BR / #BC / #BB transfer needing
  // review: it arrived in `block` (#RF sets the purchase #refunded; #BB
  // releases the escrowed TTTI-T to the funder and completes the buyback).
  // #DD credits the DEX balance; #DW is the final debit; #DQ sets the request
  // refunded. #PC / #BM -> #notApplicable.
  public shared ({ caller }) func markTransferArrived(kind : RetryTypes.TransferKind, purchaseId : Nat, block : Nat) : async RetryTypes.ReviewResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (kind) {
      case (#BR or #BC or #BM) { BtcDepositLib.markBtcArrived(btcDeposits, transferContext, kind, purchaseId, block) };
      case (#BB) { BuybackLib.markArrived(buybacks, ledger, transferContext.canister, purchaseId, block) };
      case (#DD or #DW or #DQ) { RetryLib.markDexArrived(dexContext, kind, purchaseId, block) };
      case (#DC or #DL or #MF) { ProtocolFeesLib.markArrived(protocolFeeContext, kind, purchaseId, block) };
      case (#IR) { await RouterLib.markArrived(routerContext, purchaseId, block) };
      case (#ST) { SettlementLib.markArrived(settlementContext, purchaseId, block) };
      case (_) { RetryLib.markArrived(transferContext, kind, purchaseId, block) };
    };
  };

  // Admin only, only on an item under review. #FW / #SH / #RF / #BR: it did
  // not arrive; opens a new attempt that the timer sends. #BC: nothing was
  // moved; the cost send and its payment to refund are removed and the
  // deposit is converted again by the timer. #PC (`purchaseId` = trace
  // number n): the payment never happened; it is removed from the list. #BB
  // (`purchaseId` = buyback id): the attempt is marked failed, so the buyer
  // can retry or cancel. #DD: nothing credited; #DW: the balance is given
  // back; #DQ (`purchaseId` = request id): new attempt sent by the timer.
  // #BM -> #notApplicable.
  public shared ({ caller }) func markTransferNotArrived(kind : RetryTypes.TransferKind, purchaseId : Nat) : async RetryTypes.ReviewResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (kind) {
      case (#BR or #BC or #BM) { BtcDepositLib.markBtcNotArrived(btcDeposits, transferContext, kind, purchaseId) };
      case (#BB) { BuybackLib.markNotArrived(buybacks, purchaseId) };
      case (#DD or #DW or #DQ) { RetryLib.markDexNotArrived(dexContext, kind, purchaseId) };
      case (#DC or #DL or #MF) { ProtocolFeesLib.markNotArrived(protocolFeeContext, kind, purchaseId) };
      case (#IR) { await RouterLib.markNotArrived(routerContext, purchaseId) };
      case (#ST) { SettlementLib.markNotArrived(settlementContext, purchaseId) };
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
      case (#DC or #DL or #MF or #IR or #ST) { #err(#notApplicable) };
      case (_) { RetryLib.markRefunded(transferContext, kind, purchaseId, block) };
    };
  };
};
