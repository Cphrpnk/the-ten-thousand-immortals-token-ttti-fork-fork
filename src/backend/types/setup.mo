import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Nanoseconds since epoch (Time.now()).
  public type Timestamp = Int;

  // Per-user wallet setup flow status.
  public type SetupStatus = {
    #notStarted;
    #completed;
    #skipped;
  };

  // Outcome a signed-in caller may record.
  public type SetupOutcome = {
    #completed;
    #skipped;
  };

  // Stored per-principal record.
  public type SetupRecord = {
    status : SetupStatus;
    updatedAt : Timestamp;
  };

  // API view; updatedAt is null when nothing was recorded.
  public type SetupStatusView = {
    status : SetupStatus;
    updatedAt : ?Timestamp;
  };

  public type SetupError = {
    #anonymousCaller;
  };

  public type SetupStore = Map.Map<Principal, SetupRecord>;
};
