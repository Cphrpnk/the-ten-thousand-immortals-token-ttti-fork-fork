import List "mo:core/List";
import Map "mo:core/Map";

// DEX-1: per-token custody sweep and per-account reserve check.
// Adds the `dexSweep` store (no transfer recorded, no report, no run) and
// rebuilds `dexReserve` with the new per-account fields (no account result, no
// account mismatch, no account-caused pause); lastCheck, history and pause are
// copied unchanged. Every other field is carried forward unchanged (never
// sale.reserved, ledger balances, blocks, pools, positions or internal DEX
// balances).
module {
  type Account = { owner : Principal; subaccount : ?Blob };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  // --- dexReserve ------------------------------------------------------------

  type ReserveStatus = { #ok; #surplus; #shortfall };

  type TokenReserveResult = {
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
    difference : Int;
    status : ReserveStatus;
  };

  type LastError = { message : Text; at : Int };

  type ReserveCheck = {
    checkedAt : Int;
    results : [TokenReserveResult];
    lastSuccessAt : ?Int;
    error : ?LastError;
  };

  type Mismatch = {
    id : Nat;
    at : Int;
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
  };

  type PauseReason = {
    token : DexToken;
    internalTotal : Nat;
    ledgerTotal : Nat;
    at : Int;
  };

  type ResumeRecord = { by : Principal; at : Int };

  type PauseState = {
    var paused : Bool;
    var reason : ?PauseReason;
    var resumed : ?ResumeRecord;
  };

  type AccountKind = { #dexHoldings; #requestDeposits; #mintFee; #protocolFees };

  type AccountResult = {
    kind : AccountKind;
    accountLabel : Text;
    token : DexToken;
    ledgerBalance : Nat;
    owed : Nat;
    difference : Int;
    status : ReserveStatus;
    checkedAt : Int;
  };

  type AccountRef = {
    kind : AccountKind;
    accountLabel : Text;
    token : DexToken;
  };

  type AccountMismatch = {
    id : Nat;
    at : Int;
    kind : AccountKind;
    accountLabel : Text;
    token : DexToken;
    owed : Nat;
    ledgerBalance : Nat;
  };

  type OldDexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
  };

  type NewDexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
    var accounts : [AccountResult];
    accountHistory : List.List<AccountMismatch>;
    var pauseAccount : ?AccountRef;
  };

  // --- dexSweep --------------------------------------------------------------

  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };

  type DexTransferRequest = {
    token : DexToken;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type DexTransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : DexTransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  type SweepSource = { #userDeposit : Principal; #pool : Nat };

  type SweepTransfer = {
    n : Nat;
    token : DexToken;
    source : SweepSource;
    ledgerBalance : Nat;
    recordedAt : Int;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type Comparison = {
    checkedAt : Int;
    custodyLedger : Nat;
    userBalances : Nat;
    poolReserves : Nat;
    poolProtocolFees : Nat;
    routerSetAside : Nat;
    owed : Nat;
    surplus : Nat;
    shortfall : Nat;
    status : { #balanced; #surplus; #shortfall };
  };

  type TokenReport = {
    token : DexToken;
    lastRunAt : ?Int;
    legacyAccountsFound : Nat;
    accountsWithBalance : Nat;
    accountsSkipped : Nat;
    notes : [Text];
    comparison : ?Comparison;
    comparisonPending : Bool;
  };

  type SweepStore = {
    transfers : Map.Map<Nat, SweepTransfer>;
    reports : Map.Map<Text, TokenReport>;
    var runs : Nat;
    var lastRunAt : ?Int;
  };

  type OldActor = {
    dexReserve : OldDexReserveStore;
  };

  type NewActor = {
    dexSweep : SweepStore;
    dexReserve : NewDexReserveStore;
  };

  public func migration(old : OldActor) : NewActor {
    {
      dexSweep = {
        transfers = Map.empty();
        reports = Map.empty();
        var runs = 0;
        var lastRunAt = null;
      };
      dexReserve = {
        var lastCheck = old.dexReserve.lastCheck;
        history = old.dexReserve.history;
        pause = old.dexReserve.pause;
        var accounts = [];
        accountHistory = List.empty();
        var pauseAccount = null;
      };
    };
  };
};
