import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import DexLib "../lib/dex";
import GuaranteeLib "../lib/guarantee";
import OracleLib "../lib/oracle";
import RetryLib "../lib/retry";
import RouterLib "../lib/router";
import DexTypes "../types/dex";
import Types "../types/guarantee";

// Endpoints of the common reserve and its redemption. The reserve is public;
// any holder redeems TTTI-T against it. The context carries the stores, the
// TTTI-T ledger, the stored rates, the wallet-terms acceptances, the DEX
// context used for the payout and the transient redemption locks.
// guaranteeAccount is the dedicated internal reserve account per token
// (balance in the common custody).
mixin (
  guaranteeContext : GuaranteeLib.GuaranteeContext,
  guaranteeAccount : Types.GuaranteeAccountStore,
  accessControlState : AccessControl.AccessControlState,
  router : RouterLib.RouterContext,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
) {
  // Same USD rates as mixins/router-api.mo (oracle rates; TTTI-T has none).
  func legacyUsdRateOf(token : DexTypes.PoolToken) : ?Nat {
    switch (DexLib.poolDexToken(token)) {
      case (?#tttiT) null;
      case (?t) {
        switch (RetryLib.dexPayToken(t)) {
          case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, pay), Time.now());
          case null null;
        };
      };
      case null null;
    };
  };

  func requireGuaranteeAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
  };

  // Public, no authentication: per token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT),
  // the balance of the dedicated internal account. The ckUSDC and ckUSDT
  // balances are the common reserve.
  public query func getGuaranteeAccounts() : async [Types.GuaranteeAccountView] {
    GuaranteeLib.accountViews(guaranteeAccount);
  };

  // Public, no authentication: the common reserve. Reserve value in
  // USD per token (ckUSDC, ckUSDT), TTTI-T in circulation outside the
  // contract, reserve per TTTI-T, invariant (reserve >= 10 000 USD x
  // circulation) and shortfall (0 when none).
  public query func getReserveView() : async Types.ReserveView {
    GuaranteeLib.reserveView(guaranteeContext, Time.now());
  };

  // Public, no authentication: preview of redeeming tttiAmount (TTTI-T
  // base units) against the common reserve. Amount in USD = min(10 000 USD x
  // amount, reserve USD / circulation outside the contract x amount), paid in
  // ckUSDC and ckUSDT in proportion to the reserve composition. No fee; the
  // ledger fee is borne by the creator share. Refused only when the amount
  // exceeds the circulation outside the contract.
  public query func quoteGuaranteeRedeem(tttiAmount : Nat) : async Result.Result<Types.RedeemQuote, Types.GuaranteeError> {
    GuaranteeLib.quote(guaranteeContext, tttiAmount, Time.now());
  };

  // Returns tttiAmount of TTTI-T (any the caller holds, minter or not) to the
  // contract and pays the quoted amount from the common reserve, one
  // Redemption per reserve token. Refused with #acknowledgementRequired, before
  // any transfer, unless the caller accepted the current wallet terms. Refused
  // with #slippage when the payout in USD
  // e8 is lower than expectedPayoutUsdE8. The pull, the reserve debit and the
  // recorded payouts happen before the first await.
  public shared ({ caller }) func redeemGuarantee(tttiAmount : Nat, expectedPayoutUsdE8 : Nat) : async Result.Result<[Types.Redemption], Types.GuaranteeError> {
    await GuaranteeLib.redeem(guaranteeContext, caller, tttiAmount, expectedPayoutUsdE8);
  };

  // Admin only. Kept for compatibility: the reserve is held in the paid token
  // (ICP and ckBTC included) and nothing is converted, so this moves nothing and
  // answers #nothingToConvert.
  public shared ({ caller }) func convertLegacyGuarantees() : async Result.Result<[Types.LegacyConversion], Types.GuaranteeError> {
    requireGuaranteeAdmin(caller);
    await GuaranteeLib.convertLegacy(guaranteeContext, router, legacyUsdRateOf);
  };

  // The caller's redemptions (one entry per payout): status, amounts, blocks,
  // outcome.
  public shared query ({ caller }) func listMyRedemptions() : async [Types.Redemption] {
    GuaranteeLib.redemptionsOf(guaranteeContext.store, caller);
  };
};
