import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DepositErrorKind gains #unrecoverable and #refundFailed. Every BTC deposit
// record is carried over unchanged (variant widening only). The ledger, blocks,
// balances, conversions and every other state are not touched.
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

  type OldDepositErrorKind = { #valueTooSmall; #tainted; #minterUnavailable; #other };

  type DepositErrorKind = {
    #valueTooSmall;
    #tainted;
    #minterUnavailable;
    #other;
    #unrecoverable;
    #refundFailed;
  };

  type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Int;
  };

  type OldDepositEntry = {
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
    errorKind : ?OldDepositErrorKind;
    errorMessage : ?Text;
  };

  type OldDepositTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [OldDepositEntry];
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?OldDepositErrorKind;
    errorMessage : ?Text;
  };

  type OldBtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, OldDepositTracking>;
    wallets : Map.Map<CorePrincipal.Principal, OldDepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

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

  type OldActor = { btcDeposits : OldBtcDepositStore };
  type NewActor = { btcDeposits : BtcDepositStore };

  func widen(_ : CorePrincipal.Principal, t : OldDepositTracking) : DepositTracking { t };

  public func migration(old : OldActor) : NewActor {
    let d = old.btcDeposits;
    {
      btcDeposits = {
        purchases = d.purchases.map(widen);
        wallets = d.wallets.map(widen);
        var minterInfo = d.minterInfo;
      };
    };
  };
};
