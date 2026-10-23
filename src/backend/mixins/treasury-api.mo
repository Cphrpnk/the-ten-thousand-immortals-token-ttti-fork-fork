import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Treasury "../types/treasury";
import Sale "../types/presale";
import TreasuryLib "../lib/treasury";
import SaleLib "../lib/presale";
import IcrcLib "../lib/icrc";
import OracleLib "../lib/oracle";
import CyclesReserveLib "../lib/cycles-reserve";
import PayTokenLib "../lib/pay-token";

// Treasury configuration (the accounts that receive the creator's ICP, ckBTC,
// ckUSDC and ckUSDT), conversion history and the buy-to-mint purchase
// endpoints. Each delivered ICP purchase sends its 1% fee share to the cycles
// reserve and the rest to the treasury; ck-token purchases (1% fee included)
// go fully to that token's treasury account; the TTTI-T fee collector can never be
// withdrawn.
mixin (
  treasury : TreasuryLib.TreasuryStore,
  sale : SaleLib.SaleStore,
  ledger : IcrcLib.Ledger,
  accessControlState : AccessControl.AccessControlState,
  canisterPrincipal : Principal,
  oracle : OracleLib.OracleStore,
  acknowledgements : Sale.AcknowledgementStore,
  cyclesReserve : CyclesReserveLib.CyclesReserveStore,
  tokenRates : OracleLib.TokenRateStore,
  // Principals with a purchase in flight (one per principal), shared with the
  // BTC deposit finalization. Transient, owned by main.mo.
  purchasesInFlight : Set.Set<Principal>,
) {
  // The ICP ledger canister (mainnet). Transient: a capability handle.
  transient let icpLedger : TreasuryLib.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

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
      tokenRates;
      acknowledgements;
      icpLedger;
      canister = canisterPrincipal;
      cyclesReserve;
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

  // Admin only: the receiving account of one pay token (#icp updates the
  // treasury ICP account). ck-token purchases are refused until it is set.
  public shared ({ caller }) func setPayTokenAccount(token : Treasury.PayToken, account : Common.Account) : async Treasury.TokenAccountResult {
    requireAdmin(caller);
    TreasuryLib.setTokenAccount(treasury, token, account);
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

  // Signed-in caller: own conversions only (caller is the depositor or the
  // recipient account owner), newest first. Anonymous callers get [].
  public query ({ caller }) func getMyConversions() : async [Treasury.Conversion] {
    TreasuryLib.myConversions(treasury, caller);
  };

  // --- Purchase (signed-in callers who accepted the acknowledgements) --------

  // `recipient` = explicit delivery account, or null to use the caller's
  // stored delivery address, otherwise the caller's principal. Only the cost
  // of the TTTI-T actually delivered is pulled; the rest is never taken.
  // One purchase in flight per principal: a second concurrent call is refused
  // with #purchaseInProgress before any await or external call. The lock is
  // released on every exit (including a trap after an await) by `finally`.
  public shared ({ caller }) func convertDeposit(recipient : ?Common.Account, icpAmount : Nat) : async Sale.PurchaseResult {
    await* purchaseLocked(caller, #icp, recipient, icpAmount, null);
  };

  // Shared lock for both purchase endpoints: set before any await, removed
  // in `finally` on every exit.
  func purchaseLocked(caller : Principal, token : Treasury.PayToken, recipient : ?Common.Account, payAmount : Nat, tttiTarget : ?Nat) : async* Sale.PurchaseResult {
    if (purchasesInFlight.contains(caller)) {
      return #Err({
        code = #purchaseInProgress;
        message = "A purchase is already in progress for this account; please wait for it to finish. No " # PayTokenLib.symbol(token) # " was taken";
        conversion = null;
      });
    };
    purchasesInFlight.add(caller);
    try {
      await SaleLib.purchaseWith(purchaseContext(), caller, token, recipient, payAmount, tttiTarget);
    } finally {
      purchasesInFlight.remove(caller);
    };
  };

  // Purchase in any pay token (ICP, ckBTC, ckUSDC, ckUSDT). The buyer first
  // calls icrc2_approve on that token's ledger (payAmount + ledger fee,
  // expires_at = now + 15 minutes) with this canister as spender. Shares the
  // one-purchase-per-principal lock with convertDeposit (#purchaseInProgress
  // before any external call; released on every exit). `tttiTarget` = exact
  // TTTI-T to deliver (payAmount = approved maximum), or null.
  public shared ({ caller }) func convertDepositWith(token : Treasury.PayToken, recipient : ?Common.Account, payAmount : Nat, tttiTarget : ?Nat) : async Sale.PurchaseResult {
    await* purchaseLocked(caller, token, recipient, payAmount, tttiTarget);
  };
};
