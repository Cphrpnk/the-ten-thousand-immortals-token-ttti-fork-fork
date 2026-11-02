import List "mo:core/List";
import Map "mo:core/Map";

// PTM-6a: sealed-bid auction store. Purely additive: adds the stable field
// `auction` with no auction open, nothing committed and no bid. Every existing
// field is carried forward unchanged; sale.reserved, balances, blocks, pools,
// positions, price samples, the ledger and its stored fee are never touched.
// `dexReserve` is rebuilt only because the account kind gains #auctionDeposits
// (var fields are invariant, so stable compatibility needs an explicit step):
// lastCheck, history, pause and every account record are copied unchanged.
module {
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

  type OldAccountKind = { #dexHoldings; #requestDeposits; #mintFee; #protocolFees };
  type NewAccountKind = { #dexHoldings; #requestDeposits; #mintFee; #protocolFees; #auctionDeposits };

  type OldAccountResult = {
    kind : OldAccountKind;
    accountLabel : Text;
    token : DexToken;
    ledgerBalance : Nat;
    owed : Nat;
    difference : Int;
    status : ReserveStatus;
    checkedAt : Int;
  };

  type NewAccountResult = {
    kind : NewAccountKind;
    accountLabel : Text;
    token : DexToken;
    ledgerBalance : Nat;
    owed : Nat;
    difference : Int;
    status : ReserveStatus;
    checkedAt : Int;
  };

  type OldAccountRef = { kind : OldAccountKind; accountLabel : Text; token : DexToken };
  type NewAccountRef = { kind : NewAccountKind; accountLabel : Text; token : DexToken };

  type OldAccountMismatch = {
    id : Nat;
    at : Int;
    kind : OldAccountKind;
    accountLabel : Text;
    token : DexToken;
    owed : Nat;
    ledgerBalance : Nat;
  };

  type NewAccountMismatch = {
    id : Nat;
    at : Int;
    kind : NewAccountKind;
    accountLabel : Text;
    token : DexToken;
    owed : Nat;
    ledgerBalance : Nat;
  };

  type OldDexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
    var accounts : [OldAccountResult];
    accountHistory : List.List<OldAccountMismatch>;
    var pauseAccount : ?OldAccountRef;
  };

  type NewDexReserveStore = {
    var lastCheck : ?ReserveCheck;
    history : List.List<Mismatch>;
    pause : PauseState;
    var accounts : [NewAccountResult];
    accountHistory : List.List<NewAccountMismatch>;
    var pauseAccount : ?NewAccountRef;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type Auction = {
    id : Nat;
    openedAt : Int;
    closesAt : Int;
    lotSizeE8s : Nat;
  };

  type Bid = {
    id : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
    memo : Blob;
    block : Nat;
  };

  type PendingBid = {
    n : Nat;
    auctionId : Nat;
    bidder : Principal;
    token : PayToken;
    quantityE8s : Nat;
    priceB : Nat;
    requiredDeposit : Nat;
    deposited : Nat;
    createdAt : Int;
  };

  type AuctionStore = {
    var current : ?Auction;
    var committedReturnedE8s : Nat;
    var nextAuctionId : Nat;
    var nextBidId : Nat;
    bids : Map.Map<Nat, Bid>;
    pending : Map.Map<Nat, PendingBid>;
  };

  type OldActor = {
    dexReserve : OldDexReserveStore;
  };

  type NewActor = {
    auction : AuctionStore;
    dexReserve : NewDexReserveStore;
  };

  func widenResult(r : OldAccountResult) : NewAccountResult {
    {
      kind = r.kind;
      accountLabel = r.accountLabel;
      token = r.token;
      ledgerBalance = r.ledgerBalance;
      owed = r.owed;
      difference = r.difference;
      status = r.status;
      checkedAt = r.checkedAt;
    };
  };

  func widenRef(r : OldAccountRef) : NewAccountRef {
    { kind = r.kind; accountLabel = r.accountLabel; token = r.token };
  };

  func widenMismatch(m : OldAccountMismatch) : NewAccountMismatch {
    {
      id = m.id;
      at = m.at;
      kind = m.kind;
      accountLabel = m.accountLabel;
      token = m.token;
      owed = m.owed;
      ledgerBalance = m.ledgerBalance;
    };
  };

  public func migration(old : OldActor) : NewActor {
    {
      dexReserve = {
        var lastCheck = old.dexReserve.lastCheck;
        history = old.dexReserve.history;
        pause = old.dexReserve.pause;
        var accounts = old.dexReserve.accounts.map(widenResult);
        accountHistory = old.dexReserve.accountHistory.map(widenMismatch);
        var pauseAccount = switch (old.dexReserve.pauseAccount) {
          case (?r) { ?widenRef(r) };
          case null { null };
        };
      };
      auction = {
        var current = null;
        var committedReturnedE8s = 0;
        var nextAuctionId = 1;
        var nextBidId = 1;
        bids = Map.empty();
        pending = Map.empty();
      };
    };
  };
};
