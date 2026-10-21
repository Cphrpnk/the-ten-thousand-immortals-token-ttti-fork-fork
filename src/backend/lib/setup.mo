import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Types "../types/setup";

module {
  // Caller's status; #notStarted with updatedAt = null when none recorded
  // (including anonymous callers).
  public func getStatus(store : Types.SetupStore, caller : Principal) : Types.SetupStatusView {
    if (caller.isAnonymous()) {
      return { status = #notStarted; updatedAt = null };
    };
    switch (store.get(caller)) {
      case (?record) { { status = record.status; updatedAt = ?record.updatedAt } };
      case null { { status = #notStarted; updatedAt = null } };
    };
  };

  // Records #completed or #skipped for a signed-in caller; anonymous callers
  // receive #err(#anonymousCaller).
  public func setStatus(
    store : Types.SetupStore,
    caller : Principal,
    outcome : Types.SetupOutcome,
    now : Types.Timestamp,
  ) : Result.Result<Types.SetupStatusView, Types.SetupError> {
    if (caller.isAnonymous()) {
      return #err(#anonymousCaller);
    };
    let status : Types.SetupStatus = switch (outcome) {
      case (#completed) { #completed };
      case (#skipped) { #skipped };
    };
    store.add(caller, { status; updatedAt = now });
    #ok({ status; updatedAt = ?now });
  };
};
