import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import DexReserveLib "../lib/dex-reserve";
import Types "../types/dex-reserve";

// DEX lot 6: admin reserve check, DEX pause and resume, and the public pause
// notice.
mixin (
  reserve : DexReserveLib.ReserveContext,
  accessControlState : AccessControl.AccessControlState,
) {
  // Admin only (#err(#unauthorized) otherwise). Compares, per DEX token, the
  // internal total with the ledger balance, records the result, appends
  // confirmed mismatches to the history and pauses the DEX on a shortfall.
  public shared ({ caller }) func runDexReserveCheck() : async Result.Result<Types.ReserveCheck, Types.DexReserveError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    await DexReserveLib.runCheck(reserve);
  };

  // Admin only (#err(#unauthorized) otherwise). Runs a fresh check first and
  // clears the DEX pause only when no shortfall remains; records who resumed
  // and when.
  public shared ({ caller }) func resumeDex() : async Result.Result<Types.DexPauseView, Types.DexReserveError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    await DexReserveLib.resume(reserve, caller);
  };

  // Admin only (#err(#unauthorized) otherwise): last check, per-token results,
  // pause state and mismatch history.
  public shared query ({ caller }) func getDexReserveStatus() : async Result.Result<Types.DexReserveStatus, Types.DexReserveError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    #ok(DexReserveLib.status(reserve.store, reserve.lock));
  };

  // Public: whether the DEX is paused and the token that caused the pause.
  public query func getDexPauseStatus() : async Types.PublicDexPause {
    DexReserveLib.publicPause(reserve.store);
  };
};
