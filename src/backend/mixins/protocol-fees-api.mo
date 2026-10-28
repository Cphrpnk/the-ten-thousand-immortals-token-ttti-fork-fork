import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/protocol-fees";
import ProtocolFeesLib "../lib/protocol-fees";
import MintFeeTypes "../types/mint-fee";
import PayTypes "../types/pay-token";

// DC batch history (admin, read-only: no new batch runs), protocol liquidity
// locked forever (public), the caller's already-earned locked-LP bonus (DL),
// mint-fee LP balances, set-aside amounts and liquidity injections.
mixin (
  protocolFeeContext : ProtocolFeesLib.ProtocolFeeContext,
  accessControlState : AccessControl.AccessControlState,
) {
  // Admin only: DC batches, newest first, including waits for price deviation.
  public query ({ caller }) func listDcBatches() : async [Types.DcBatch] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can read the DC batches");
    };
    ProtocolFeesLib.batches(protocolFeeContext.store);
  };

  // Public: protocol-owned liquidity per pool (locked forever).
  public query func getProtocolLiquidity() : async [Types.ProtocolLiquidityView] {
    ProtocolFeesLib.protocolLiquidity(protocolFeeContext);
  };

  // Signed-in caller: claimable and claimed bonus, weights of the caller's
  // locked TTTI-T-pair positions and claims. Anonymous: zero view.
  public query ({ caller }) func getMyLpBonus() : async Types.LpBonusView {
    if (caller.isAnonymous()) {
      return { claimableE8s = 0; claimedE8s = 0; positions = []; claims = [] };
    };
    ProtocolFeesLib.myBonus(protocolFeeContext, caller, Time.now());
  };

  // Signed-in caller: claims the whole claimable bonus in ICP (memo TTTI-DL-<n>).
  public shared ({ caller }) func claimLpBonus() : async Types.ClaimBonusResult {
    await ProtocolFeesLib.claimBonus(protocolFeeContext, caller);
  };

  // --- Mint fee (1/101): LP balances, set-aside amounts, injections ---------

  // Signed-in caller: claimable and claimed mint-fee balances per pay token
  // and claims. Anonymous: empty view.
  public query ({ caller }) func getMyMintFees() : async MintFeeTypes.MintFeeLpView {
    if (caller.isAnonymous()) {
      return { balances = []; claims = [] };
    };
    ProtocolFeesLib.myMintFees(protocolFeeContext, caller);
  };

  // Signed-in caller: claims the whole claimable balance of `token`
  // (no threshold beyond the ledger fee; memo TTTI-MF-<n>).
  public shared ({ caller }) func claimMintFee(token : PayTypes.PayToken) : async MintFeeTypes.ClaimMintFeeResult {
    await ProtocolFeesLib.claimMintFee(protocolFeeContext, caller, token);
  };

  // Public: set-aside amount per pay token, value and threshold.
  public query func getSetAsideAmounts() : async [MintFeeTypes.SetAsideView] {
    ProtocolFeesLib.setAsideViews(protocolFeeContext, Time.now());
  };

  // Public: liquidity injections, newest first, `limit` capped at 100.
  public query func listLiquidityInjections(offset : Nat, limit : Nat) : async MintFeeTypes.InjectionPage {
    ProtocolFeesLib.injections(protocolFeeContext, offset, limit);
  };
};
