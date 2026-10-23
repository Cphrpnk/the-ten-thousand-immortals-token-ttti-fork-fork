import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// BTC deposit tracking gains btcTxids = [] and ckbtcMintBlockIndex = null on
// every existing record; all other values are kept as they are. The ledger,
// blocks, balances, conversions and every other state are not touched.
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

  type DepositTracking = {
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

  type BtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, DepositTracking>;
    wallets : Map.Map<CorePrincipal.Principal, DepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type NewActor = {
    btcDeposits : BtcDepositStore;
  };

  // --- Migration -------------------------------------------------------------

  func upgrade(t : OldDepositTracking) : DepositTracking {
    { t with btcTxids = []; ckbtcMintBlockIndex = null };
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
