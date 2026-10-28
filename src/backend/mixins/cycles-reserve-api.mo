import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/cycles-reserve";
import CyclesReserveLib "../lib/cycles-reserve";

// Public cycles reserve transparency and the admin views of the cycles
// autonomy and the dynamic cycles share (DEX lot 4). The reserve has no
// withdrawal path.
mixin (
  cyclesReserve : CyclesReserveLib.CyclesReserveStore,
  cyclesAutonomy : CyclesReserveLib.AutonomyStore,
  accessControlState : AccessControl.AccessControlState,
  canisterPrincipal : Principal,
) {
  func requireCyclesAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only the administrator can read the cycles autonomy");
    };
  };

  // Public: cycles balance, threshold, reserve, floor, last top-up and the
  // past withdrawal history.
  public query func getCyclesStatus() : async Types.CyclesStatus {
    CyclesReserveLib.status(cyclesReserve, canisterPrincipal);
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
};
