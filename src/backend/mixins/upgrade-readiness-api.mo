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
import ProtocolFeesLib "../lib/protocol-fees";
import ProtocolFeeTypes "../types/protocol-fees";
import OwnerTypes "../types/owner-revenue";
import MintFeeTypes "../types/mint-fee";

// Admin upgrade readiness: pause, purchases and BTC lock in flight, buybacks
// in flight, reserve lock and stored top-up attempt, open purchase traces,
// sale.reserved and its reconciliation, plus (DEX lot 4) the DC / DL /
// weekly locks and the DC sends and DL claims still in flight.
mixin (
  sale : SaleLib.SaleStore,
  purchasesInFlight : Set.Set<Principal>,
  buybacksInFlight : Set.Set<Text>,
  reserveLock : CyclesReserveLib.ReserveLock,
  cyclesReserve : CyclesReserveLib.CyclesReserveStore,
  retry : RetryTypes.RetryStore,
  reservedReconciliations : Types.ReconciliationStore,
  accessControlState : AccessControl.AccessControlState,
  protocolFeeContext : ProtocolFeesLib.ProtocolFeeContext,
  // Mint revenue correction: owner sends and the one-time treasury sweep.
  ownerRevenue : OwnerTypes.OwnerRevenueStore,
) {
  type UpgradeReadiness = Types.UpgradeReadiness and {
    // Mint revenue correction: owner sends (OW) still #pending, by id.
    ownerSendsInFlight : [Nat];
    // One-time treasury sweep state.
    sweepStatus : OwnerTypes.SweepStatus;
    // Mint-fee claims (MF) still #inProgress, by n.
    mintFeeClaimsInFlight : [Nat];
    // Liquidity injections still #swapping or #addingLiquidity, by id.
    injectionsInFlight : [Nat];
    // DEX lot 4: held DC / DL / WEEKLY lock keys (transient).
    protocolFeeLocks : [Text];
    // DC sends (ICP to the cycles reserve, pools or the bonus subaccount)
    // still #inProgress, by n.
    dcSendsInFlight : [Nat];
    // DL bonus claims still #inProgress, by n.
    bonusClaimsInFlight : [Nat];
  };

  // Admin only (trap "Unauthorized: admin only" otherwise).
  public shared query ({ caller }) func getUpgradeReadiness() : async UpgradeReadiness {
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
      protocolFeeLocks = protocolFeeContext.locks.toArray();
      dcSendsInFlight = protocolFeeContext.store.dcSends.values().filter(func(s : ProtocolFeeTypes.DcSend) : Bool = s.status == #inProgress).map(func(s : ProtocolFeeTypes.DcSend) : Nat = s.n).toArray();
      bonusClaimsInFlight = protocolFeeContext.store.bonusClaims.values().filter(func(c : ProtocolFeeTypes.BonusClaim) : Bool = c.status == #inProgress).map(func(c : ProtocolFeeTypes.BonusClaim) : Nat = c.n).toArray();
      ownerSendsInFlight = ownerRevenue.sends.values().filter(func(s : OwnerTypes.OwnerSend) : Bool = s.status == #pending).map(func(s : OwnerTypes.OwnerSend) : Nat = s.id).toArray();
      sweepStatus = ownerRevenue.sweep.status;
      mintFeeClaimsInFlight = protocolFeeContext.mintFees.claims.values().filter(func(c : MintFeeTypes.MintFeeClaim) : Bool = c.status == #inProgress).map(func(c : MintFeeTypes.MintFeeClaim) : Nat = c.n).toArray();
      injectionsInFlight = protocolFeeContext.mintFees.injections.values().filter(
        func(i : MintFeeTypes.LiquidityInjection) : Bool = switch (i.status) {
          case (#swapping or #addingLiquidity) { true };
          case (_) { false };
        }
      ).map(func(i : MintFeeTypes.LiquidityInjection) : Nat = i.id).toArray();
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
