import Time "mo:core/Time";
import CyclesReserveLib "cycles-reserve";
import CreatorFeesLib "creator-fees";
import ProtocolFeesLib "protocol-fees";
import CyclesTypes "../types/cycles-reserve";
import Types "../types/public-board";

// PTM-4: the public board. Reads existing stores only; no state of its own.
module {
  // References to the existing stores. Transient.
  public type BoardContext = {
    cyclesReserve : CyclesReserveLib.CyclesReserveStore;
    autonomy : CyclesReserveLib.AutonomyStore;
    cyclesFees : CyclesTypes.CyclesFeeStore;
    creator : CreatorFeesLib.CreatorFeeContext;
    protocol : ProtocolFeesLib.ProtocolFeeContext;
    canister : Principal;
  };

  let LATEST_ENTRIES : Nat = 10;

  public func board(ctx : BoardContext, now : Int) : Types.PublicBoard {
    let cycles = CyclesReserveLib.status(ctx.cyclesReserve, ctx.autonomy, ctx.cyclesFees, ctx.canister, now);
    let journal = ProtocolFeesLib.listPermanentLog(ctx.protocol.permanent, 0, LATEST_ENTRIES);
    let holdings = CreatorFeesLib.holdingsView(ctx.creator);
    {
      cycles = {
        cyclesBalance = cycles.cyclesBalance;
        reserveBalanceE8s = cycles.reserveBalanceE8s;
        pendingFeeShareE8s = cycles.pendingFeeShareE8s;
        coverage = cycles.coverage;
      };
      permanentLiquidity = {
        summary = ProtocolFeesLib.permanentSummary(ctx.protocol, now);
        journalEntries = journal.total;
        latestEntries = journal.entries;
      };
      creator = {
        tokens = holdings.tokens;
        transferFeeCollectorE8s = holdings.transferFeeCollectorE8s;
      };
    };
  };

  public func currentBoard(ctx : BoardContext) : Types.PublicBoard = board(ctx, Time.now());
};
