import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/dex-indicators";

// DEX lot 7: public indicators snapshot (computed once per hour by a timer) and
// its admin status.
mixin (
  indicators : Types.IndicatorsStore,
  accessControlState : AccessControl.AccessControlState,
) {
  // Public: the stored snapshot, null until the first computation. Never
  // recomputes on read.
  public query func getDexIndicators() : async ?Types.DexIndicatorsSnapshot {
    indicators.snapshot;
  };

  // Admin only (#err(#unauthorized) otherwise): snapshot time, last computation
  // result, last error text with its date and the last success time.
  public shared query ({ caller }) func getDexIndicatorsStatus() : async Result.Result<Types.IndicatorsStatus, Types.DexIndicatorsError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    let snapshotAt = switch (indicators.snapshot) {
      case (?s) ?s.computedAt;
      case null null;
    };
    let lastResult : ?Types.ComputationResult = switch (indicators.lastComputedAt) {
      case null null;
      case (?_) {
        switch (indicators.lastError) {
          case (?_) ?#failed;
          case null ?#ok;
        };
      };
    };
    #ok({
      snapshotAt;
      lastComputedAt = indicators.lastComputedAt;
      lastResult;
      lastError = indicators.lastError;
      lastSuccessAt = indicators.lastSuccessAt;
    });
  };
};
