import List "mo:core/List";
import Retry "retry";
import CyclesReserve "cycles-reserve";
import DexReserve "dex-reserve";

// Upgrade readiness (admin): pause, in-flight locks, open purchase traces and
// the sale.reserved reconciliation.
module {
  public type PurchaseTrace = Retry.PurchaseTrace;
  public type TopUpAttempt = CyclesReserve.TopUpAttempt;

  // One reconciliation of sale.reserved to 0; previousReserved keeps the old
  // value visible.
  public type ReservedReconciliation = {
    previousReserved : Nat; // TTTI-T base units
    reconciledAt : Int; // ns (Time.now())
    by : Principal; // the admin who reconciled
  };

  // Stable reconciliation state: the last one and the full history (oldest first).
  public type ReconciliationStore = {
    var last : ?ReservedReconciliation;
    history : List.List<ReservedReconciliation>;
  };

  public type ReconcileError = {
    #notAdmin;
    #notPaused; // sale.salesPaused is false
    #purchaseInFlight; // purchasesInFlight (the BTC lock included) is not empty
    #openTraces; // retry.traces is not empty
  };

  // DEX lot 6 part of the readiness. dexReady is false while the DEX is
  // paused, a shortfall is unresolved, or DEX operations are in flight.
  public type DexReadiness = {
    dexPaused : Bool;
    dexPauseReason : ?DexReserve.PauseReason;
    lastReserveCheckAt : ?Int; // ns of the last attempt
    // Worst token status of the last check's results (#shortfall first,
    // then #surplus, else #ok); null before the first check.
    lastReserveCheckStatus : ?DexReserve.ReserveStatus;
    unresolvedShortfallCount : Nat;
    // Held dexInFlight (DD / DW / DQ) and routerInFlight (IR) lock keys.
    dexOperationsInFlight : [Text];
    dexReady : Bool;
  };

  public type UpgradeReadiness = {
    salesPaused : Bool;
    purchasesInFlightCount : Nat;
    purchasesInFlight : [Principal];
    // The BTC lock is the same purchasesInFlight set (BTC finalization).
    btcLockHeld : Bool;
    buybacksInFlightCount : Nat;
    buybacksInFlight : [Text]; // BuybackLib.lockKey keys
    reserveLockBusy : Bool;
    pendingTopUp : ?TopUpAttempt; // stored cycles top-up attempt
    openTraceCount : Nat;
    openTraces : [PurchaseTrace];
    reserved : Nat; // current sale.reserved
    lastReconciliation : ?ReservedReconciliation;
  };
};
