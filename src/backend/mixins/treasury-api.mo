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
import RetryLib "../lib/retry";
import ProtocolFeesLib "../lib/protocol-fees";
import OwnerTypes "../types/owner-revenue";
import SettlementLib "../lib/settlement";
import List "mo:core/List";
import Time "mo:core/Time";

// Mint treasuries (internal subaccounts of this contract for ICP, ckBTC,
// ckUSDC and ckUSDT; the admin withdraws from them), the weekly allocation
// views, conversion history and the buy-to-mint purchase
// endpoints. Each delivered ICP purchase sends its 1% fee share to the cycles
// reserve and the rest to the ICP mint treasury; ck-token purchases (1% fee
// included) go fully to that token's mint treasury; the TTTI-T fee collector can never be
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
  // FW / SH retry context of the purchase pipeline. Transient, owned by main.mo.
  transferContext : RetryLib.TransferContext,
  // DEX lot 4: weekly allocation state and cached mint treasury balances.
  treasuryAllocation : TreasuryLib.AllocationStore,
  // Mint revenue correction: mint-fee routing context. Transient, owned by main.mo.
  protocolFeeContext : ProtocolFeesLib.ProtocolFeeContext,
  // Mint revenue routing: wallets, fee account and one-time settlement. Transient, owned by main.mo.
  settlementContext : SettlementLib.SettlementContext,
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
      transfers = transferContext;
      protocolFees = protocolFeeContext;
    };
  };

  // --- Configuration ---------------------------------------------------------

  // Admin only: the legacy configuration (old external ICP account, no
  // longer settable; its funds stay where they are).
  public query ({ caller }) func getTreasuryConfig() : async ?Treasury.TreasuryConfig {
    requireAdmin(caller);
    TreasuryLib.getConfig(treasury);
  };

  // Admin only: the internal mint treasuries (ICP, ckBTC, ckUSDC, ckUSDT)
  // that receive new forwards (FW); the admin withdraws with withdrawTreasury.
  public query ({ caller }) func getMintTreasuryAccounts() : async [Treasury.MintTreasuryAccount] {
    requireAdmin(caller);
    TreasuryLib.mintTreasuryAccounts(treasury, treasuryAllocation, canisterPrincipal);
  };

  // Admin only: the last weekly allocation calculation.
  public query ({ caller }) func getLastWeeklyAllocation() : async ?Treasury.WeeklyAllocation {
    requireAdmin(caller);
    TreasuryLib.lastAllocation(treasuryAllocation);
  };

  // Admin only: every weekly allocation calculation, newest first.
  public query ({ caller }) func listWeeklyAllocations() : async [Treasury.WeeklyAllocation] {
    requireAdmin(caller);
    TreasuryLib.allocations(treasuryAllocation);
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

  // --- Mint revenue routing (admin only) -------------------------------------
  // The 100/101 share of each mint is sent directly, in the paid token, to the
  // receiving wallet configured for that token (BTC: the ckBTC wallet); the
  // 1/101 fee goes to the dedicated fee account. Nothing accumulates in the
  // contract and no endpoint withdraws from it.

  // Admin only: sets the receiving wallet of `token` (ICRC account; not
  // anonymous, 32-byte subaccount, not an account of this contract). Records
  // the change; the first configuration starts the token's one-time
  // settlement (a completed settlement is never sent again).
  public shared ({ caller }) func setReceivingWallet(token : Treasury.PayToken, account : Common.Account) : async OwnerTypes.ReceivingWalletResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    let result = SettlementLib.setWallet(settlementContext, token, account, caller, Time.now());
    switch (result) {
      case (#ok(_)) {
        // Starts sending the settlement legs right away (the timer retries).
        await SettlementLib.runPending(settlementContext);
      };
      case (#err(_)) {};
    };
    result;
  };

  // Admin only: the receiving wallet of every pay token (null = not configured).
  public query ({ caller }) func getReceivingWallets() : async OwnerTypes.ReceivingWalletsResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    #ok(SettlementLib.walletViews(settlementContext.transfers.mintRevenue));
  };

  // Admin only: one-time settlement status per pay token.
  public query ({ caller }) func getSettlementStatus() : async OwnerTypes.SettlementStatusResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    #ok(SettlementLib.statusViews(settlementContext));
  };

  // Admin only: the dedicated fee account (owner, subaccount hex, account
  // text, per-token ledger balance, set-aside and redistributed totals).
  // Update call (ledger reads). Read-only: nothing can be withdrawn from it.
  public shared ({ caller }) func getMintFeeAccount() : async OwnerTypes.FeeAccountResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    #ok(await SettlementLib.feeAccountView(settlementContext));
  };

  // Admin only: withdrawals, newest first, `limit` capped at 100: amount, token,
  // destination, date, status and block.
  public query ({ caller }) func listTreasuryWithdrawals(offset : Nat, limit : Nat) : async OwnerTypes.WithdrawalPageResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    #ok(TreasuryLib.withdrawals(transferContext.ownerRevenue, offset, limit));
  };

  // Owner send history (earlier automatic sends and withdrawals), newest first,
  // `limit` capped at 100.
  public query ({ caller }) func listOwnerSends(offset : Nat, limit : Nat) : async OwnerTypes.OwnerSendPage {
    requireAdmin(caller);
    TreasuryLib.ownerSends(transferContext.ownerRevenue, offset, limit);
  };

  // Per-token share accumulated earlier in the default account (part of the
  // admin-managed balance).
  public query ({ caller }) func getOwnerAccumulated() : async [OwnerTypes.OwnerAccumulated] {
    requireAdmin(caller);
    TreasuryLib.ownerAccumulated(transferContext.ownerRevenue);
  };

  // Status of the one-time treasury sweep (history).
  public query ({ caller }) func getTreasurySweepStatus() : async OwnerTypes.TreasurySweepView {
    requireAdmin(caller);
    TreasuryLib.sweepView(transferContext.ownerRevenue);
  };
};
