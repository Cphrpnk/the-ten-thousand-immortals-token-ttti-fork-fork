import List "mo:core/List";
import Dex "dex";

// DEX lot 6: reserve check (internal DEX totals against the ledger balances)
// and the DEX-specific pause. Separate from sale.salesPaused.
module {
  // Nanoseconds since the epoch (Time.now()).
  public type Timestamp = Int;

  // TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT.
  public type DexToken = Dex.DexToken;

  // #ok = ledger total equals the internal total; #surplus = ledger total is
  // higher; #shortfall = ledger total is lower than the internal total.
  public type ReserveStatus = { #ok; #surplus; #shortfall };

  // One token of a check. internalTotal = pool reserves + protocol fees +
  // user balances (available + reserved) of that token; ledgerTotal = the
  // canister's balance on the token's ledger across the DEX accounts.
  public type TokenReserveResult = {
    token : DexToken;
    internalTotal : Nat; // base units
    ledgerTotal : Nat; // base units
    difference : Int; // ledgerTotal - internalTotal
    status : ReserveStatus;
  };

  public type LastError = {
    message : Text; // exact text
    at : Timestamp;
  };

  // The last check. checkedAt = time of the last attempt. results = the
  // per-token results of the last check that read every ledger (a failed
  // attempt keeps the previous results, sets `error` and leaves lastSuccessAt
  // unchanged). A successful attempt clears `error`.
  public type ReserveCheck = {
    checkedAt : Timestamp;
    results : [TokenReserveResult];
    lastSuccessAt : ?Timestamp;
    error : ?LastError;
  };

  // A confirmed mismatch kept in the history (newest last, ids from 0).
  public type Mismatch = {
    id : Nat;
    at : Timestamp;
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
  };

  // Why the DEX was paused.
  public type PauseReason = {
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
    at : Timestamp;
  };

  // Who resumed the DEX and when (kept after the resume).
  public type ResumeRecord = {
    by : Principal;
    at : Timestamp;
  };

  // DEX-specific pause flag, kept across upgrades.
  public type PauseState = {
    var paused : Bool;
    var reason : ?PauseReason;
    var resumed : ?ResumeRecord;
  };

  // Stable state of the reserve check and the DEX pause.
  public type DexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
  };

  // One check at a time. Transient.
  public type CheckLock = { var busy : Bool };

  // --- API boundary ----------------------------------------------------------

  public type DexPauseView = {
    paused : Bool;
    reason : ?PauseReason;
    resumed : ?ResumeRecord;
  };

  // Public: lets the pools page show a notice.
  public type PublicDexPause = {
    paused : Bool;
    reasonToken : ?DexToken;
  };

  public type DexReserveStatus = {
    lastCheck : ?ReserveCheck;
    // Tokens with #shortfall in lastCheck.results.
    unresolvedShortfallCount : Nat;
    checkInProgress : Bool;
    pause : DexPauseView;
    history : [Mismatch]; // oldest first
  };

  public type DexReserveError = {
    #unauthorized; // caller is not an admin
    #checkInProgress;
    #notPaused; // resumeDex while the DEX is not paused
    #checkFailed : Text; // a ledger balance could not be read
  };
};
