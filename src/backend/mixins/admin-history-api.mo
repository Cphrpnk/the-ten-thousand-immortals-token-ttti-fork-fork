import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/admin-history";
import AdminHistoryLib "../lib/admin-history";

// Admin unified history: newest first, paginated (the UI uses 25 per page),
// filter by kind and optional token.
mixin (
  historyContext : AdminHistoryLib.HistoryContext,
  accessControlState : AccessControl.AccessControlState,
) {
  // Admin only (#err(#notAdmin) otherwise). `limit` capped at 100.
  public query ({ caller }) func listAdminHistory(filter : Types.HistoryFilter, token : ?Types.HistoryToken, offset : Nat, limit : Nat) : async Types.HistoryResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    #ok(AdminHistoryLib.list(historyContext, filter, token, offset, limit));
  };
};
