import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import DexLib "../lib/dex";
import DexSweepLib "../lib/dex-sweep";
import DexTypes "../types/dex";
import BatchTypes "../types/dex-batch";
import PageTypes "../types/page";

// DEX-1: admin sweep of the legacy DEX ledger accounts into the per-token
// custody accounts, and the custody-versus-owed reports. The sweep is not
// blocked by the DEX pause. It never changes internal balances, positions,
// blocks or sale.reserved.
mixin (
  sweepContext : DexSweepLib.SweepContext,
  accessControlState : AccessControl.AccessControlState,
) {
  func requireSweepAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can use the DEX sweep");
    };
  };

  // Custody accounts of the five DEX tokens (public, informational).
  public query func getDexCustodyAccounts() : async [{ token : DexTypes.DexToken; account : DexSweepLib.Account }] {
    DexLib.DEX_TOKENS.map(func t = { token = t; account = DexLib.custodyAccount(sweepContext.dex.canister, t) });
  };

  // Admin only. PTM-9e: one call takes the SWEEP lock for ONE batch of legacy
  // accounts (batch size in the batch store), releases it, and returns the
  // states; the cursor resumes at the next call or timer tick until every token
  // is done. Reads the real ledger balance of the legacy accounts and
  // transfers balance minus the ledger fee to the custody account of the
  // token (memo TTTI-SW-n, created_at_time set, recorded before the first
  // await). Unsettled transfers are resent as recorded first. A balance not
  // above the fee is skipped and noted. Running again moves nothing more once
  // the balances are swept. Afterwards compares custody with the total owed.
  public shared ({ caller }) func runDexSweep() : async Result.Result<[DexSweepLib.TokenState], { #notAdmin; #alreadyRunning }> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    switch (await DexSweepLib.runSweep(sweepContext)) {
      case (#ok(states)) #ok(states);
      case (#err(#alreadyRunning)) #err(#alreadyRunning);
    };
  };

  // Admin only. Resends the unsettled sweep transfers as recorded (the timer
  // does the same every 10 minutes) and refreshes the comparison that only
  // waited for them.
  public shared ({ caller }) func resendDexSweepTransfers() : async Result.Result<[DexSweepLib.TokenState], { #notAdmin }> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAdmin);
    };
    await DexSweepLib.retrySweep(sweepContext);
    #ok(DexSweepLib.states(sweepContext));
  };

  // Admin only. Per token: legacy accounts found, ledger amounts swept,
  // pending and unknown-outcome transfers, notes and the custody versus owed
  // comparison with the surplus.
  public query ({ caller }) func getDexSweepState() : async [DexSweepLib.TokenState] {
    requireSweepAdmin(caller);
    DexSweepLib.states(sweepContext);
  };

  // Admin only. The last custody versus owed comparison per token (null before
  // the first completed comparison).
  public query ({ caller }) func getDexCustodyComparison() : async [{ token : DexTypes.DexToken; comparison : ?DexSweepLib.Comparison }] {
    requireSweepAdmin(caller);
    DexSweepLib.states(sweepContext).map(func s = { token = s.token; comparison = s.comparison });
  };

  // PTM-9e: admin only. Recorded sweep transfers, newest first, one page.
  // `cursor` = transfer number n: the page holds the transfers with a smaller n
  // (null = newest). `limit` 0 = default page size; capped at
  // PageTypes.MAX_PAGE_SIZE. `nextCursor` is null on the last page.
  public query ({ caller }) func listDexSweepTransfers(cursor : ?Nat, limit : Nat) : async PageTypes.Page<DexSweepLib.SweepTransferView> {
    requireSweepAdmin(caller);
    DexSweepLib.listTransfers(sweepContext, cursor, limit);
  };

  // PTM-9e: admin only. Cursor of the batched sweep: current token and account
  // position, batches taken this run, batch size and per-token progress.
  public query ({ caller }) func getDexSweepProgress() : async BatchTypes.SweepProgress {
    requireSweepAdmin(caller);
    DexSweepLib.progressOf(sweepContext);
  };
};
