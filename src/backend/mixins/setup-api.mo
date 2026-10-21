import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/setup";
import SetupLib "../lib/setup";

mixin (setupStatuses : Types.SetupStore) {
  public query ({ caller }) func getMySetupStatus() : async Types.SetupStatusView {
    SetupLib.getStatus(setupStatuses, caller);
  };

  public shared ({ caller }) func setMySetupStatus(outcome : Types.SetupOutcome) : async Result.Result<Types.SetupStatusView, Types.SetupError> {
    SetupLib.setStatus(setupStatuses, caller, outcome, Time.now());
  };
};
