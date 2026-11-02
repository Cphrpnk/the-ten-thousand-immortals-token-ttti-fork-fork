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
  // Admin only (#err(#unauthorized) otherwise). PTM-9e: one call reads one batch
  // of ledger accounts and resumes the persisted cursor; the view carries
  // `progress`. Compares each account (DEX
  // holdings per token, pair-request deposits, mint fee per paid token,
  // protocol fees) with its own obligations, records one result per account,
  // appends confirmed mismatches to the history and pauses the DEX on a
  // shortfall confirmed by a second ledger read (a surplus never pauses).
  public shared ({ caller }) func runDexReserveCheck() : async Result.Result<Types.ReserveCheckView, Types.DexReserveError> {
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

  // Admin only (#err(#unauthorized) otherwise): last check, per-token and
  // per-account results, pause state (with the account) and mismatch histories.
  // PTM-9f: progress.phase is #inProgress with batch / totalBatches while the
  // cursor has not finished; alert is decided only at the end of the complete
  // run; excludedReread reports the daily re-read of the excluded accounts.
  public shared query ({ caller }) func getDexReserveStatus() : async Result.Result<Types.DexReserveStatus, Types.DexReserveError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    #ok(DexReserveLib.status(reserve.store, reserve.lock, reserve.batch));
  };

  // Public: whether the DEX is paused and the token that caused the pause.
  public query func getDexPauseStatus() : async Types.PublicDexPause {
    DexReserveLib.publicPause(reserve.store);
  };
};
