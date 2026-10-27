import List "mo:core/List";
import Map "mo:core/Map";

// Lot 6. Adds to the cycles reserve the stored top-up attempt (null) and adds
// the sale.reserved reconciliation store (no reconciliation yet). The sale
// store, the ledger, blocks, balances and every other field are not touched.
module {
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type TopUpStatus = {
    #transferred;
    #notified : { cycles : Nat };
    #failed : Text;
  };

  type TopUpRecord = {
    timestamp : Int;
    icpE8s : Nat;
    blockIndex : Nat;
    status : TopUpStatus;
    lastError : ?Text;
  };

  type ReserveWithdrawal = {
    timestamp : Int;
    amountE8s : Nat;
    blockIndex : Nat;
  };

  type ReserveTransferStatus = {
    #pending;
    #transferred : Nat;
    #failed : Text;
    #needsReview;
  };

  type ReserveShare = {
    conversionId : Nat;
    shareE8s : Nat;
    treasuryE8s : Nat;
    transfer : ReserveTransferStatus;
  };

  type TopUpOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  type TopUpTransferRequest = {
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : Nat;
  };

  type TopUpAttempt = {
    amount : Nat;
    created_at_time : Nat64;
    memo : Blob;
    request : TopUpTransferRequest;
    blockIndex : ?Nat;
    createdAt : Int;
    sends : Nat;
    lastError : ?Text;
    outcome : TopUpOutcome;
    needsReview : Bool;
  };

  type OldCyclesReserveStore = {
    var reserveBalanceE8s : Nat;
    var lastTopUp : ?TopUpRecord;
    withdrawals : List.List<ReserveWithdrawal>;
    shares : Map.Map<Nat, ReserveShare>;
  };

  type NewCyclesReserveStore = {
    var reserveBalanceE8s : Nat;
    var lastTopUp : ?TopUpRecord;
    withdrawals : List.List<ReserveWithdrawal>;
    shares : Map.Map<Nat, ReserveShare>;
    var pendingTopUp : ?TopUpAttempt;
  };

  type ReservedReconciliation = {
    previousReserved : Nat;
    reconciledAt : Int;
    by : Principal;
  };

  type ReconciliationStore = {
    var last : ?ReservedReconciliation;
    history : List.List<ReservedReconciliation>;
  };

  type OldActor = {
    cyclesReserve : OldCyclesReserveStore;
  };

  type NewActor = {
    cyclesReserve : NewCyclesReserveStore;
    reservedReconciliations : ReconciliationStore;
  };

  public func migration(old : OldActor) : NewActor {
    {
      cyclesReserve = {
        var reserveBalanceE8s = old.cyclesReserve.reserveBalanceE8s;
        var lastTopUp = old.cyclesReserve.lastTopUp;
        withdrawals = old.cyclesReserve.withdrawals;
        shares = old.cyclesReserve.shares;
        var pendingTopUp = null : ?TopUpAttempt;
      };
      reservedReconciliations = {
        var last = null : ?ReservedReconciliation;
        history = List.empty();
      };
    };
  };
};
