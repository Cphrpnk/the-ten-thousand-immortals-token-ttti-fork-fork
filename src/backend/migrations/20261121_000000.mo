import List "mo:core/List";

// DEX lot 6: reserve check and DEX pause.
// Adds the `dexReserve` store: no check yet, empty mismatch history, DEX not
// paused. Every other field is carried forward unchanged (never sale.reserved,
// ledger balances, blocks, pools, positions or internal DEX balances).
module {
  type OldActor = {};

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
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

  type DexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
  };

  type NewActor = {
    dexReserve : DexReserveStore;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      dexReserve = {
        var lastCheck = null;
        history = List.empty();
        pause = { var paused = false; var reason = null; var resumed = null };
      };
    };
  };
};
