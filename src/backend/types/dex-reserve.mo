import List "mo:core/List";
import Dex "dex";
import Batch "dex-batch";

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

  // One token of a check, for the DEX holdings account of that token only.
  // internalTotal = pool reserves + protocol fee amounts + router set-aside +
  // user balances (available + reserved) of that token; ledgerTotal = the
  // balance of the custody account plus the legacy deposit and pool
  // subaccounts (and the TTTI-T injection account) on the token's ledger.
  public type TokenReserveResult = {
    token : DexToken;
    internalTotal : Nat; // base units
    ledgerTotal : Nat; // base units
    difference : Int; // ledgerTotal - internalTotal
    status : ReserveStatus;
  };

  // PTM-10d: per-token balance breakdown. `total` is the guard: what the
  // contract must hold of the token. total = poolReserves + guarantees +
  // creatorHoldings + dexBalances + permanentLiquidity + requestDeposits +
  // auctionDeposits + inFlight. All amounts are base units of `token`.
  // `guarantees` is the common reserve (ckUSDC / ckUSDT) plus the legacy
  // guarantee amounts of earlier mints, which are read-only history.
  public type TokenBalanceBreakdown = {
    token : DexToken;
    poolReserves : Nat; // reserves of the native pools
    guarantees : Nat; // common reserve plus read-only legacy guarantee amounts
    creatorHoldings : Nat; // declared creator holdings and set-aside fees
    dexBalances : Nat; // user DEX balances (available + reserved)
    permanentLiquidity : Nat; // set aside, not yet injected into a pool
    requestDeposits : Nat; // pair-request deposits
    auctionDeposits : Nat; // auction bid deposits
    inFlight : Nat; // operations started and not settled
    total : Nat; // sum of the eight parts above
    ledgerBalance : Nat; // balance read on the token's ledger
    difference : Int; // ledgerBalance - total
    status : ReserveStatus;
  };

  // Public snapshot of the breakdowns, one per token. checkedAt = time of the
  // check it comes from (0 before any check). complete = every account of the
  // check was read (false while a batched run is in progress or before a check).
  public type DexBalanceBreakdownSnapshot = {
    tokens : [TokenBalanceBreakdown];
    checkedAt : Timestamp;
    complete : Bool;
  };

  // Accounts compared separately, each against its own obligations only.
  // #dexHoldings = custody + legacy DEX subaccounts per token; #requestDeposits
  // = pair-request deposit account (TTTI-T); #mintFee = MINT_FEE account per
  // paid token; #protocolFees = PROTOCOL_FEES account (ICP); #auctionDeposits =
  // auction bid custody account per paid token (PTM-6a).
  public type AccountKind = { #dexHoldings; #requestDeposits; #mintFee; #protocolFees; #auctionDeposits };

  // The latest result of one account and token.
  public type AccountResult = {
    kind : AccountKind;
    accountLabel : Text; // English label shown on the admin screen
    token : DexToken;
    ledgerBalance : Nat; // base units
    owed : Nat; // base units, this account's own obligations
    difference : Int; // ledgerBalance - owed
    status : ReserveStatus;
    checkedAt : Timestamp;
  };

  public type AccountRef = {
    kind : AccountKind;
    accountLabel : Text;
    token : DexToken;
  };

  // A confirmed account mismatch kept in the account history (newest last).
  public type AccountMismatch = {
    id : Nat;
    at : Timestamp;
    kind : AccountKind;
    accountLabel : Text;
    token : DexToken;
    owed : Nat;
    ledgerBalance : Nat;
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
  // lastCheck.results and history keep the per-token DEX holdings view; the
  // per-account view is in accounts and accountHistory.
  public type DexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
    var accounts : [AccountResult];
    accountHistory : List.List<AccountMismatch>;
    var pauseAccount : ?AccountRef;
  };

  // One check at a time. Transient.
  public type CheckLock = { var busy : Bool };

  // --- API boundary ----------------------------------------------------------

  public type DexPauseView = {
    paused : Bool;
    reason : ?PauseReason;
    resumed : ?ResumeRecord;
    account : ?AccountRef; // account that caused the pause
  };

  // Result of runDexReserveCheck: the stored check plus the latest result of
  // every account.
  public type ReserveCheckView = {
    checkedAt : Timestamp;
    results : [TokenReserveResult];
    lastSuccessAt : ?Timestamp;
    error : ?LastError;
    accounts : [AccountResult];
    // PTM-9e: where the batched run stands (one batch per call; the timer
    // resumes the cursor at the next tick).
    progress : Batch.ReserveProgress;
  };

  // Public: lets the pools page show a notice.
  public type PublicDexPause = {
    paused : Bool;
    reasonToken : ?DexToken;
  };

  public type DexReserveStatus = {
    lastCheck : ?ReserveCheck;
    // Accounts with #shortfall in accounts.
    unresolvedShortfallCount : Nat;
    checkInProgress : Bool;
    pause : DexPauseView;
    history : [Mismatch]; // oldest first
    accounts : [AccountResult];
    accountHistory : [AccountMismatch]; // oldest first
    // PTM-9e: cursor of the batched run and the alert raised when a run
    // finished with zero accounts compared while there were accounts to compare
    // (null when none; cleared by a later run that compares at least one).
    progress : Batch.ReserveProgress;
    alert : ?Batch.ReserveAlert;
    // PTM-9f: daily batched re-read of the accounts swept to zero.
    excludedReread : Batch.ExcludedRereadProgress;
  };

  public type DexReserveError = {
    #unauthorized; // caller is not an admin
    #checkInProgress;
    #notPaused; // resumeDex while the DEX is not paused
    #checkFailed : Text; // a ledger balance could not be read
  };
};
