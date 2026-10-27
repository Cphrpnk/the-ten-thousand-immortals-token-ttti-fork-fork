import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/upgrade-readiness";
import RetryTypes "../types/retry";
import CyclesReserveLib "../lib/cycles-reserve";
import SaleLib "../lib/presale";

// Admin upgrade readiness: pause, purchases and BTC lock in flight, buybacks
// in flight, reserve lock and stored top-up attempt, open purchase traces,
// sale.reserved and its reconciliation.
mixin (
  sale : SaleLib.SaleStore,
  purchasesInFlight : Set.Set<Principal>,
  buybacksInFlight : Set.Set<Text>,
  reserveLock : CyclesReserveLib.ReserveLock,
  cyclesReserve : CyclesReserveLib.CyclesReserveStore,
  retry : RetryTypes.RetryStore,
  reservedReconciliations : Types.ReconciliationStore,
  accessControlState : AccessControl.AccessControlState,
) {
  // Admin only (trap "Unauthorized: admin only" otherwise).
  public shared query ({ caller }) func getUpgradeReadiness() : async Types.UpgradeReadiness {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    {
      salesPaused = sale.salesPaused;
      purchasesInFlightCount = purchasesInFlight.size();
      purchasesInFlight = purchasesInFlight.toArray();
      btcLockHeld = not purchasesInFlight.isEmpty();
      buybacksInFlightCount = buybacksInFlight.size();
      buybacksInFlight = buybacksInFlight.toArray();
      reserveLockBusy = reserveLock.busy;
      pendingTopUp = cyclesReserve.pendingTopUp;
      openTraceCount = retry.traces.size();
      openTraces = retry.traces.values().toArray();
      reserved = sale.reserved;
      lastReconciliation = reservedReconciliations.last;
    };
  };

  // Admin only. Sets sale.reserved to 0 and records the previous value; only
  // while paused, with no purchase in flight and no open purchase trace.
  public shared ({ caller }) func reconcileReserved() : async Result.Result<Types.ReservedReconciliation, Types.ReconcileError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAdmin);
    if (not sale.salesPaused) return #err(#notPaused);
    if (not purchasesInFlight.isEmpty()) return #err(#purchaseInFlight);
    if (not retry.traces.isEmpty()) return #err(#openTraces);
    let record : Types.ReservedReconciliation = {
      previousReserved = sale.reserved;
      reconciledAt = Time.now();
      by = caller;
    };
    reservedReconciliations.last := ?record;
    reservedReconciliations.history.add(record);
    sale.reserved := 0;
    #ok(record);
  };
};
