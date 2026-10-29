import Set "mo:core/Set";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/upgrade-readiness";
import DexReserveTypes "../types/dex-reserve";
import DexReserveLib "../lib/dex-reserve";
import RetryTypes "../types/retry";
import CyclesReserveLib "../lib/cycles-reserve";
import SaleLib "../lib/presale";
import ProtocolFeesLib "../lib/protocol-fees";
import ProtocolFeeTypes "../types/protocol-fees";
import OwnerTypes "../types/owner-revenue";
import SettlementLib "../lib/settlement";
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
  // Mint revenue routing: one-time settlements per token.
  mintRevenue : OwnerTypes.MintRevenueStore,
  // DEX lot 6: reserve check / pause store and the DD / DW / DQ and IR locks.
  dexReserve : DexReserveTypes.DexReserveStore,
  dexInFlight : Set.Set<Text>,
  routerInFlight : Set.Set<Text>,
) {
  type UpgradeReadiness = Types.UpgradeReadiness and Types.DexReadiness and {
    // Owner sends (OW) of every source still #pending, by id (legacy
    // #withdrawal records included as history).
    ownerSendsInFlight : [Nat];
    // Mint revenue routing: 100/101 revenue sends (OW, source #mint or
    // #settlement) still #pending, by id.
    revenueSendsInFlight : [Nat];
    // Token keys whose one-time settlement is #sending.
    settlementsInFlight : [Text];
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
    let shortfalls = DexReserveLib.shortfallCount(dexReserve);
    let operations = dexInFlight.toArray().concat(routerInFlight.toArray());
    {
      // DEX lot 6: pause state, last reserve check and DEX operations in flight.
      dexPaused = dexReserve.pause.paused;
      dexPauseReason = dexReserve.pause.reason;
      lastReserveCheckAt = switch (dexReserve.lastCheck) {
        case (?c) ?c.checkedAt;
        case null null;
      };
      lastReserveCheckStatus = DexReserveLib.worstStatus(dexReserve);
      unresolvedShortfallCount = shortfalls;
      dexOperationsInFlight = operations;
      dexReady = not dexReserve.pause.paused and shortfalls == 0 and operations.size() == 0;
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
      revenueSendsInFlight = ownerRevenue.sends.values().filter(
        func(s : OwnerTypes.OwnerSend) : Bool = s.status == #pending and (switch (s.source) { case (#mint(_) or #settlement(_)) true; case (_) false })
      ).map(func(s : OwnerTypes.OwnerSend) : Nat = s.id).toArray();
      settlementsInFlight = SettlementLib.inFlight(mintRevenue);
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
