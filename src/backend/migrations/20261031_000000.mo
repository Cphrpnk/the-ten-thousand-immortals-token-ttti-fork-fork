import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// BTC deposit tracking becomes one stable address per principal per flow with
// a per-deposit history. Each existing record keeps its address, kind, stage,
// timestamps and errors; its cumulative content becomes the first deposit
// entry (none when nothing was ever seen). The ledger, blocks, balances,
// conversions and every other state are not touched.
module {
  type DepositKind = { #purchase; #wallet };

  type DepositStage = {
    #addressShown;
    #depositDetected;
    #confirming : { current : Nat; required : Nat };
    #minted;
    #delivered;
    #refunded;
    #pendingRate;
    #error;
  };

  type DepositErrorKind = { #valueTooSmall; #tainted; #minterUnavailable; #other };

  type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Int;
  };

  // --- Old state -------------------------------------------------------------

  type OldDepositTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    btcDetectedSats : Nat;
    ckbtcMintedSats : Nat;
    ckbtcPendingSats : Nat;
    tttiDelivered : Nat;
    refundedSats : Nat;
    conversionId : ?Nat;
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
    btcTxids : [Text];
    ckbtcMintBlockIndex : ?Nat;
  };

  type OldBtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, OldDepositTracking>;
    wallets : Map.Map<CorePrincipal.Principal, OldDepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type OldActor = {
    btcDeposits : OldBtcDepositStore;
  };

  // --- New state -------------------------------------------------------------

  type DepositEntry = {
    index : Nat;
    stage : DepositStage;
    btcDetectedSats : Nat;
    ckbtcMintedSats : Nat;
    ckbtcPendingSats : Nat;
    tttiDelivered : Nat;
    refundedSats : Nat;
    conversionId : ?Nat;
    btcTxids : [Text];
    ckbtcMintBlockIndex : ?Nat;
    detectedAt : Int;
    updatedAt : Int;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  type DepositTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [DepositEntry];
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  type BtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, DepositTracking>;
    wallets : Map.Map<CorePrincipal.Principal, DepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type NewActor = {
    btcDeposits : BtcDepositStore;
  };

  // --- Migration -------------------------------------------------------------

  func nothingSeen(t : OldDepositTracking) : Bool {
    switch (t.stage) {
      case (#addressShown) {
        t.btcDetectedSats == 0 and t.ckbtcMintedSats == 0 and t.btcTxids.size() == 0 and t.conversionId == null
      };
      case _ { false };
    };
  };

  func upgrade(t : OldDepositTracking) : DepositTracking {
    let deposits : [DepositEntry] = if (nothingSeen(t)) { [] } else {
      [{
        index = 0;
        stage = t.stage;
        btcDetectedSats = t.btcDetectedSats;
        ckbtcMintedSats = t.ckbtcMintedSats;
        ckbtcPendingSats = t.ckbtcPendingSats;
        tttiDelivered = t.tttiDelivered;
        refundedSats = t.refundedSats;
        conversionId = t.conversionId;
        btcTxids = t.btcTxids;
        ckbtcMintBlockIndex = t.ckbtcMintBlockIndex;
        detectedAt = t.createdAt;
        updatedAt = t.lastCheckedAt ?? t.createdAt;
        errorKind = t.errorKind;
        errorMessage = t.errorMessage;
      }];
    };
    {
      kind = t.kind;
      btcAddress = t.btcAddress;
      stage = t.stage;
      deposits;
      createdAt = t.createdAt;
      lastCheckedAt = t.lastCheckedAt;
      errorKind = t.errorKind;
      errorMessage = t.errorMessage;
    };
  };

  public func migration(old : OldActor) : NewActor {
    let d = old.btcDeposits;
    {
      btcDeposits = {
        purchases = d.purchases.map(func(_, t) = upgrade(t));
        wallets = d.wallets.map(func(_, t) = upgrade(t));
        var minterInfo = d.minterInfo;
      };
    };
  };
};
