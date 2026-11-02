import Map "mo:core/Map";
import Dex "dex";

// PTM-9e: index of the unfinished transfers, deposits, withdrawals and swaps.
//
// Which statuses count as unfinished (the entry is in the index):
//  - #deposit (DD) and #withdrawal (DW) transfers: DexTransferStatus
//    #inProgress or #needsReview. #completed and #failed are finished.
//  - #sweep (SW) transfers: DexTransferStatus #inProgress or #needsReview.
//  - #swap (routed swap): RoutedSwapStatus #inProgress or #needsReview.
//    #completed, #failedReturned, #reviewedArrived and #reviewedNotArrived are
//    finished.
// The index holds bookkeeping state only; it never holds ledger data and never
// changes a balance, a block or sale.reserved.
module {
  // Kind tag of an entry; part of its key.
  public type Kind = { #deposit; #withdrawal; #sweep; #swap };

  // One unfinished operation. `tokens` = the tokens it moves (one for a
  // transfer, tokenIn and tokenOut for a swap). `owner` = the DEX user whose
  // legacy deposit account it uses (null for a pool sweep transfer).
  public type Entry = {
    kind : Kind;
    n : Nat; // transfer number n, or routed swap id
    tokens : [Dex.DexToken];
    owner : ?Principal;
    since : Int; // ns, when the entry joined the index
  };

  // Stored index. Initial value: InflightLib.emptyStore(); filled once by
  // InflightLib.backfill.
  public type InflightStore = {
    // key = InflightLib.keyOf(kind, n)
    entries : Map.Map<Text, Entry>;
    // Every deposit / withdrawal number below the mark has been looked at by
    // InflightLib.syncTransfers (the transfer store itself is written by
    // lib/retry.mo; the index catches up on the newer numbers only).
    var depositMark : Nat;
    var withdrawalMark : Nat;
    var backfilled : Bool;
  };

  // A recorded sweep transfer as seen by the backfill (the sweep store type
  // lives in lib/dex-sweep.mo, which imports the index).
  public type SweepRef = {
    n : Nat;
    token : Dex.DexToken;
    owner : ?Principal;
    status : Dex.DexTransferStatus;
  };
};
