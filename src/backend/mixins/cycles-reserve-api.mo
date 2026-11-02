import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/cycles-reserve";
import CyclesReserveLib "../lib/cycles-reserve";
import RetryLib "../lib/retry";
import Nat "mo:core/Nat";

// Public cycles reserve transparency and the admin views of the cycles
// autonomy and the dynamic cycles share (DEX lot 4). The reserve has no
// withdrawal path.
mixin (
  cyclesReserve : CyclesReserveLib.CyclesReserveStore,
  cyclesAutonomy : CyclesReserveLib.AutonomyStore,
  cyclesReserveLock : CyclesReserveLib.ReserveLock,
  cyclesFeeContext : RetryLib.CyclesFeeContext,
  accessControlState : AccessControl.AccessControlState,
  canisterPrincipal : Principal,
) {
  func requireCyclesAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only the administrator can read the cycles autonomy");
    };
  };

  // Public: cycles balance, threshold, reserve, floor, last top-up and the
  // past withdrawal history. PTM-4: also the fee shares waiting for the
  // reserve and the coverage (months of measured consumption covered by the
  // reserve, the one-year target and the fill), absent without measured
  // consumption.
  public query func getCyclesStatus() : async Types.CyclesStatus {
    CyclesReserveLib.status(cyclesReserve, cyclesAutonomy, cyclesFeeContext.fees, canisterPrincipal, Time.now());
  };

  // Public, any caller (anonymous included): runs the same top-up pass as the
  // 6-hour timer, with the same lock. Does nothing while the cycles balance is
  // at or above the 20 T threshold and no top-up is waiting, or while another
  // pass runs. The reserve has no withdrawal path: this only converts reserve
  // ICP to cycles for this canister.
  public shared func topUpCycles() : async Types.TopUpResult {
    await CyclesReserveLib.topUpNow(cyclesReserve, cyclesReserveLock, canisterPrincipal);
  };

  // Admin only: autonomy in days, 7- and 30-day average consumption. The
  // reserve ICP is converted at the CMC rate of the last notified top-up.
  public query ({ caller }) func getCyclesAutonomy() : async Types.AutonomyView {
    requireCyclesAdmin(caller);
    autonomyNow();
  };

  func autonomyNow() : Types.AutonomyView {
    CyclesReserveLib.autonomyView(cyclesReserve, cyclesAutonomy, CyclesReserveLib.cyclesPerIcpEstimate(cyclesReserve), Time.now());
  };

  // Admin only: current cycles share, its target and the fixed code bounds.
  public query ({ caller }) func getCyclesShare() : async Types.CyclesShareView {
    requireCyclesAdmin(caller);
    CyclesReserveLib.shareView(cyclesAutonomy, autonomyNow().autonomyDays);
  };

  // Admin only: share changes (date, old share, new share, autonomy), newest first.
  public query ({ caller }) func getCyclesShareHistory() : async [Types.ShareChange] {
    requireCyclesAdmin(caller);
    CyclesReserveLib.shareHistory(cyclesAutonomy);
  };

  // Admin only: the cycles shares of the 1 % mint and buyback fees, their
  // totals (waiting, in flight, settled) and the recorded settlements, newest first.
  public query ({ caller }) func listCyclesFeeSettlements(offset : Nat, limit : Nat) : async [Types.CyclesFeeSettlement] {
    requireCyclesAdmin(caller);
    let all = cyclesFeeContext.fees.settlements.values().toArray().sort(func(a, b) = Nat.compare(b.n, a.n));
    if (offset >= all.size()) return [];
    all.sliceToArray(offset, Nat.min(all.size(), offset + limit));
  };

  // Admin only: the split recorded with each 1 % mint fee and buyback fee
  // (cycles part and creator part), by fee entry id, paged.
  public query ({ caller }) func listCyclesFeeSplits(source : Types.FeeSplitSource, offset : Nat, limit : Nat) : async [Types.FeeSplitRow] {
    requireCyclesAdmin(caller);
    let map = switch (source) {
      case (#mint) cyclesFeeContext.fees.mintSplits;
      case (#buyback) cyclesFeeContext.fees.buybackSplits;
    };
    let all = map.entries().toArray();
    if (offset >= all.size()) return [];
    all.sliceToArray(offset, Nat.min(all.size(), offset + limit)).map(func((id, split)) = { id; source; split });
  };

  // Admin only: settlements whose outcome stayed unknown after 23 h.
  public query ({ caller }) func listCyclesFeeSettlementsToReview() : async [Types.CyclesFeeSettlement] {
    requireCyclesAdmin(caller);
    RetryLib.cyclesFeesToReview(cyclesFeeContext);
  };

  // Admin only: the ledger shows the settlement arrived at `block`.
  public shared ({ caller }) func markCyclesFeeSettlementArrived(n : Nat, block : Nat) : async { #ok; #err : Text } {
    requireCyclesAdmin(caller);
    RetryLib.markCyclesFeeArrived(cyclesFeeContext, n, block);
  };

  // Admin only: the ledger shows the settlement did not arrive; the amount is sent again.
  public shared ({ caller }) func markCyclesFeeSettlementNotArrived(n : Nat) : async { #ok; #err : Text } {
    requireCyclesAdmin(caller);
    RetryLib.markCyclesFeeNotArrived(cyclesFeeContext, n);
  };
};
