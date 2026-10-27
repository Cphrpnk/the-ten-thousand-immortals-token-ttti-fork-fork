import List "mo:core/List";
import Map "mo:core/Map";
import Common "common";

// Cycles reserve: the 1% fee share of each delivered ICP purchase is kept in a
// dedicated ICP subaccount of this canister and converted to cycles through
// the Cycles Minting Canister (CMC) when the cycles balance runs low.
module {
  public type Account = Common.Account;

  // Nanoseconds since epoch (Time.now()).
  public type Timestamp = Int;

  // State of the latest top-up:
  // #transferred = ICP sent to the CMC, notify_top_up not yet confirmed
  //                (retried with the same blockIndex, never a second transfer);
  // #notified    = the CMC minted `cycles` to this canister;
  // #failed      = the CMC definitively rejected the notification.
  public type TopUpStatus = {
    #transferred;
    #notified : { cycles : Nat };
    #failed : Text;
  };

  public type TopUpRecord = {
    timestamp : Timestamp; // when the ICP transfer to the CMC was made
    icpE8s : Nat; // ICP sent to the CMC (e8s)
    blockIndex : Nat; // ICP ledger block of that transfer
    status : TopUpStatus;
    lastError : ?Text; // last notify error, if any
  };

  public type ReserveWithdrawal = {
    timestamp : Timestamp;
    amountE8s : Nat;
    blockIndex : Nat; // ICP ledger block of the transfer to the treasury
  };

  // Public transparency view (getCyclesStatus).
  public type CyclesStatus = {
    cyclesBalance : Nat;
    topUpThreshold : Nat;
    reserveAccount : Account;
    reserveBalanceE8s : Nat; // cached; refreshed by the timer and after each reserve movement
    reserveFloorE8s : Nat;
    withdrawableExcessE8s : Nat; // max(0, reserve - floor - ICP fee)
    lastTopUp : ?TopUpRecord;
    withdrawals : [ReserveWithdrawal];
    withdrawalAllowed : Bool; // true when withdrawalBlockedReason is null
    withdrawalBlockedReason : ?WithdrawalBlockedReason;
  };

  // Why withdrawReserveExcess is currently refused (factual reason).
  public type WithdrawalBlockedReason = {
    #cyclesBelowThreshold; // cycles balance below TOPUP_THRESHOLD (3T)
    #topUpRunning; // a top-up or another withdrawal holds the lock
    #topUpAwaitingConfirmation; // a top-up transfer awaits notify_top_up / ledger reply
  };

  // Non-admin callers are refused by a trap, not by a variant.
  public type WithdrawReserveResult = {
    #ok : Nat; // ICP ledger block index
    #cyclesBelowThreshold : { cyclesBalance : Nat; topUpThreshold : Nat }; // no ledger call
    #noExcess;
    #amountExceedsExcess : { withdrawableE8s : Nat };
    #treasuryNotConfigured;
    #busy; // a top-up or another withdrawal is running
    #topUpPendingNotify; // a top-up transfer still awaits its notify_top_up
    #ledgerError : Text;
  };

  // Transfer of a purchase's reserve share into the reserve subaccount.
  public type ReserveTransferStatus = {
    #pending; // an attempt is open (RetryStore.shares); sent or resent by the 10-min timer
    #transferred : Nat; // ICP ledger block index
    #failed : Text; // legacy failure text
    #needsReview; // outcome unknown after 23 h (or legacy): admin verification required
  };

  // Fee split of one delivered purchase (keyed by conversion id).
  // shareE8s goes to the reserve; treasuryE8s is the amount handed to the
  // treasury forward (which itself deducts its ledger fee). Failed-forward
  // retries forward treasuryE8s only, never the reserve share again.
  public type ReserveShare = {
    conversionId : Nat;
    shareE8s : Nat;
    treasuryE8s : Nat;
    transfer : ReserveTransferStatus;
  };

  // Outcome of a recorded top-up transfer, same rule as lib/retry.mo:
  // #pending   = recorded, not sent yet;
  // #unknown   = a send was rejected or trapped; stays unknown until an Ok or
  //              a #Duplicate (resent identically within 23 h);
  // #failed    = known ledger Err: a new attempt is allowed;
  // #succeeded = Ok or #Duplicate, with the ICP ledger block index.
  public type TopUpOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  // The complete recorded ICP transfer to the CMC; a resend uses it unchanged.
  public type TopUpTransferRequest = {
    from_subaccount : ?Blob; // CYCLES_RESERVE_SUBACCOUNT
    to : Account; // CMC top-up account of this canister
    amount : Nat; // e8s
    fee : Nat; // e8s
  };

  // The cycles top-up transfer attempt, recorded before the first await and
  // kept in stable state so it survives upgrades. memo is the CMC TPUP memo
  // blob; created_at_time is fixed for the attempt. After 23 h with an
  // unknown outcome, needsReview = true and it is no longer resent.
  public type TopUpAttempt = {
    amount : Nat; // e8s
    created_at_time : Nat64; // ns
    memo : Blob; // TPUP_MEMO_BLOB
    request : TopUpTransferRequest;
    blockIndex : ?Nat; // ICP ledger block when known
    createdAt : Timestamp;
    sends : Nat;
    lastError : ?Text;
    outcome : TopUpOutcome;
    needsReview : Bool;
  };

  // Stable reserve state.
  public type CyclesReserveStore = {
    var reserveBalanceE8s : Nat;
    var lastTopUp : ?TopUpRecord;
    withdrawals : List.List<ReserveWithdrawal>;
    shares : Map.Map<Nat, ReserveShare>;
    var pendingTopUp : ?TopUpAttempt; // the stored top-up attempt, null when none
  };

  // Shared (transient) lock: top-up and withdrawal never run at the same time.
  // The top-up attempt itself is stored in CyclesReserveStore.pendingTopUp.
  public type ReserveLock = {
    var busy : Bool;
  };

  // --- Cycles Minting Canister (rkp4c-7iaaa-aaaaa-aaaca-cai) -----------------

  public type NotifyTopUpArg = {
    block_index : Nat64;
    canister_id : Principal;
  };

  public type NotifyError = {
    #Refunded : { reason : Text; block_index : ?Nat64 };
    #Processing;
    #TransactionTooOld : Nat64;
    #InvalidTransaction : Text;
    #Other : { error_code : Nat64; error_message : Text };
  };

  public type NotifyTopUpResult = {
    #Ok : Nat; // cycles
    #Err : NotifyError;
  };

  public type IcpXdrConversionRate = {
    timestamp_seconds : Nat64;
    xdr_permyriad_per_icp : Nat64;
  };

  public type IcpXdrConversionRateResponse = {
    data : IcpXdrConversionRate;
    hash_tree : Blob;
    certificate : Blob;
  };

  public type Cmc = actor {
    notify_top_up : shared NotifyTopUpArg -> async NotifyTopUpResult;
    get_icp_xdr_conversion_rate : shared query () -> async IcpXdrConversionRateResponse;
  };
};
