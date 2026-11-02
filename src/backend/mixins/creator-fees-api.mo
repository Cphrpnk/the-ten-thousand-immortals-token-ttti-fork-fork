import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/creator-fees";
import CreatorFeesLib "../lib/creator-fees";
import DexTypes "../types/dex";

// PTM-4: public creator holdings and the admin payout to the receiving
// wallet already configured per token.
mixin (
  creatorFeeContext : CreatorFeesLib.CreatorFeeContext,
  accessControlState : AccessControl.AccessControlState,
) {
  func requireCreatorFeesAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can manage the creator fees");
    };
  };

  // Public: per token the amount held, the amount paid out and the credited
  // amounts by source, the TTTI-T balance of the fee collector account and
  // the latest payouts.
  public query func getCreatorHoldings() : async Types.CreatorHoldingsView {
    CreatorFeesLib.holdingsView(creatorFeeContext);
  };

  // Admin only: pays the whole held amount of `token` to its receiving wallet
  // (memo TTTI-CF-<n>). TTTI-T is paid to the ICP wallet.
  public shared ({ caller }) func payCreatorFees(token : DexTypes.DexToken) : async Types.PayoutResult {
    requireCreatorFeesAdmin(caller);
    await CreatorFeesLib.payout(creatorFeeContext, token, Time.now());
  };

  // Admin only: payouts whose outcome stayed unknown for 23 hours.
  public query ({ caller }) func listCreatorPayoutsToReview() : async [Types.CreatorPayoutView] {
    requireCreatorFeesAdmin(caller);
    CreatorFeesLib.toReview(creatorFeeContext.store);
  };

  // Admin only: the ledger shows the payout arrived at `block`.
  public shared ({ caller }) func markCreatorPayoutArrived(n : Nat, block : Nat) : async { #ok; #err : Text } {
    requireCreatorFeesAdmin(caller);
    CreatorFeesLib.markArrived(creatorFeeContext, n, block);
  };

  // Admin only: the ledger shows the payout did not arrive; the amount is held again.
  public shared ({ caller }) func markCreatorPayoutNotArrived(n : Nat) : async { #ok; #err : Text } {
    requireCreatorFeesAdmin(caller);
    CreatorFeesLib.markNotArrived(creatorFeeContext, n);
  };
};
