import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Common "../types/common";
import PurchaseLib "../lib/purchase";

mixin (profileState : PurchaseLib.ProfileState) {
  public query ({ caller }) func getCallerUserProfile() : async ?Common.UserProfile {
    PurchaseLib.getCallerUserProfile(profileState, caller);
  };

  // Anonymous callers are refused.
  public shared ({ caller }) func saveCallerUserProfile(profile : Common.UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: please sign in to save a profile");
    };
    PurchaseLib.saveCallerUserProfile(profileState, caller, profile);
  };
};
