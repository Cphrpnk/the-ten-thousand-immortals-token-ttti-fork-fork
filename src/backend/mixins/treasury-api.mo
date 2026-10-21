import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Common "../types/common";
import Treasury "../types/treasury";
import Sale "../types/presale";
import TreasuryLib "../lib/treasury";
import SaleLib "../lib/presale";
import IcrcLib "../lib/icrc";
import OracleLib "../lib/oracle";

// Treasury configuration (the account that receives the creator's ICP),
// conversion history and the buy-to-mint purchase endpoint. No endpoint can
// move ICP or collected fees outside the automatic purchase rules.
mixin (
  treasury : TreasuryLib.TreasuryStore,
  sale : SaleLib.SaleStore,
  ledger : IcrcLib.Ledger,
  accessControlState : AccessControl.AccessControlState,
  canisterPrincipal : Principal,
  oracle : OracleLib.OracleStore,
  acknowledgements : Sale.AcknowledgementStore,
) {
  // The ICP ledger canister (mainnet). Transient: a capability handle.
  transient let icpLedger : TreasuryLib.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

  // This canister seen as an actor, so the pipeline can pass the actor-level
  // `transform` query (declared in oracle-api) to the price outcalls.
  transient let selfActor : actor { transform : OutCall.Transform } = actor (canisterPrincipal.toText());

  // The canister's own principal: the ICRC-2 spender the buyer must approve
  // on the ICP ledger, and the owner of the account ICP is collected into.
  public query func getCanisterPrincipal() : async Principal {
    canisterPrincipal;
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can manage the treasury");
    };
  };

  func purchaseContext() : SaleLib.PurchaseContext {
    {
      sale;
      treasury;
      ledger;
      oracle;
      acknowledgements;
      icpLedger;
      transform = selfActor.transform;
      canister = canisterPrincipal;
    };
  };

  // --- Configuration ---------------------------------------------------------

  // Admin only: the account that receives the creator's ICP.
  public shared ({ caller }) func setTreasuryConfig(config : Treasury.TreasuryConfig) : async Treasury.TreasuryConfigResult {
    requireAdmin(caller);
    TreasuryLib.setConfig(treasury, config);
  };

  // Admin only: the full configuration.
  public query ({ caller }) func getTreasuryConfig() : async ?Treasury.TreasuryConfig {
    requireAdmin(caller);
    TreasuryLib.getConfig(treasury);
  };

  // Public: what the Buy page needs (no buyer data).
  public query func getPublicTreasuryInfo() : async ?Treasury.PublicTreasuryInfo {
    TreasuryLib.publicInfo(treasury);
  };

  // Admin only: every recorded conversion (purchase history).
  public query ({ caller }) func getConversions() : async [Treasury.Conversion] {
    requireAdmin(caller);
    TreasuryLib.getConversions(treasury);
  };

  public shared ({ caller }) func getCallerIcpBalance() : async Nat {
    await TreasuryLib.getIcpBalance(icpLedger, caller);
  };

  // --- Purchase (signed-in callers who accepted the acknowledgements) --------

  // `recipient` = explicit delivery account, or null to use the caller's
  // stored delivery address, otherwise the caller's principal. Only the cost
  // of the TTTI-T actually delivered is pulled; the rest is never taken.
  public shared ({ caller }) func convertDeposit(recipient : ?Common.Account, icpAmount : Nat) : async Sale.PurchaseResult {
    await SaleLib.purchase(purchaseContext(), caller, recipient, icpAmount);
  };
};
