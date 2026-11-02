import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import GuaranteeLib "../lib/guarantee";
import Types "../types/guarantee";

// PTM-2 endpoints of the personal guarantee and redemption. Each caller's mass
// is private to the caller; the only public figure is the total unclaimed
// mass. The context carries the stores, the TTTI-T ledger, the stored rates,
// the DEX context used for the payout and the transient redemption locks.
// PTM-9b: guaranteeAccount is the dedicated internal guarantee account per
// token (balance in the common custody).
mixin (
  guaranteeContext : GuaranteeLib.GuaranteeContext,
  guaranteeAccount : Types.GuaranteeAccountStore,
  accessControlState : AccessControl.AccessControlState,
) {
  func requireGuaranteeAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
  };

  // Public, no authentication: per token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT),
  // the sum of every guarantee mass, the balance of the dedicated internal
  // guarantee account and whether they are equal.
  public query func getGuaranteeAccounts() : async [Types.GuaranteeAccountView] {
    GuaranteeLib.accountViews(guaranteeContext.masses, guaranteeAccount);
  };

  // The caller's masses, one per payment token: TTTI-T mass remaining,
  // guarantee remaining, excess and the part of it withdrawable now.
  public shared query ({ caller }) func getMyGuaranteeMasses() : async [Types.GuaranteeMassView] {
    GuaranteeLib.massViews(guaranteeContext, caller, Time.now());
  };

  // Preview of returning tttiAmount of the caller's mass in `token`. During the
  // mint: min(deposited guarantee for the amount, quantity worth 10 000 USD x
  // amount at the stored rate), refused without a rate. After the mint: pro
  // rata of the mass, in kind. Less the 1 % fee and the ledger fee.
  public shared query ({ caller }) func quoteGuaranteeRedeem(token : Types.PayToken, tttiAmount : Nat) : async Result.Result<Types.RedeemQuote, Types.GuaranteeError> {
    GuaranteeLib.quote(guaranteeContext, caller, token, tttiAmount, Time.now());
  };

  // Returns tttiAmount of TTTI-T (any the caller holds) to the contract and
  // pays the guarantee back in `token`. Refused with #slippage when the net
  // amount is lower than expectedNetAmount. The pull, the mass update and the
  // recorded payout happen before the first await.
  public shared ({ caller }) func redeemGuarantee(token : Types.PayToken, tttiAmount : Nat, expectedNetAmount : Nat) : async Result.Result<Types.Redemption, Types.GuaranteeError> {
    await GuaranteeLib.redeem(guaranteeContext, caller, token, tttiAmount, expectedNetAmount);
  };

  // Pays the caller's excess in `token`, only once the mint has ended.
  public shared ({ caller }) func withdrawGuaranteeExcess(token : Types.PayToken) : async Result.Result<Types.Redemption, Types.GuaranteeError> {
    await GuaranteeLib.withdrawExcess(guaranteeContext, caller, token);
  };

  // The caller's redemptions and excess withdrawals: status, amounts, blocks,
  // outcome.
  public shared query ({ caller }) func listMyRedemptions() : async [Types.Redemption] {
    GuaranteeLib.redemptionsOf(guaranteeContext.store, caller);
  };

  // Public, no authentication: the sum of every remaining TTTI-T mass and the
  // guarantee totals per token.
  public query func getUnclaimedMassTotal() : async Types.UnclaimedMassTotal {
    GuaranteeLib.unclaimedTotal(guaranteeContext);
  };

  // Admin: the 1 % redemption fees set aside for the creator, paged.
  public shared query ({ caller }) func listRedemptionFees(offset : Nat, limit : Nat) : async [Types.RedemptionFee] {
    requireGuaranteeAdmin(caller);
    GuaranteeLib.listFees(guaranteeContext.store, offset, limit);
  };
};
