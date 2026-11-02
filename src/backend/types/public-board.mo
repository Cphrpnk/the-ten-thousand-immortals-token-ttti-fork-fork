import CyclesTypes "cycles-reserve";
import CreatorTypes "creator-fees";
import ProtocolFeeTypes "protocol-fees";

// PTM-4: the public board. A single read-only view assembled from the stores
// that already exist; it keeps no state of its own. The creator is never
// named, only called "creator".
module {
  // Cycles reserve. `coverage` is absent while no consumption can be measured:
  // months covered (times 100), the one-year target and the fill are then
  // unknown.
  public type CyclesSection = {
    cyclesBalance : Nat;
    reserveBalanceE8s : Nat; // ICP of the reserve account (cached)
    pendingFeeShareE8s : Nat; // fee shares recorded and not yet received by the reserve
    coverage : ?CyclesTypes.ReserveCoverage;
  };

  // Permanent liquidity: contract-locked shares per pool (never withdrawable),
  // set-aside amounts waiting for injection and the public journal.
  public type PermanentSection = {
    summary : ProtocolFeeTypes.PermanentSummary;
    journalEntries : Nat; // total number of journal entries
    latestEntries : [ProtocolFeeTypes.PermanentLogEntry]; // newest first, at most 10
  };

  // Creator holdings per token (held, paid out, credited by source including
  // the TTTI-T transfer fee) and the TTTI-T transfer fees still held in the
  // fee collector account.
  public type CreatorSection = {
    tokens : [CreatorTypes.CreatorTokenView];
    transferFeeCollectorE8s : Nat;
  };

  public type PublicBoard = {
    cycles : CyclesSection;
    permanentLiquidity : PermanentSection;
    creator : CreatorSection;
  };
};
