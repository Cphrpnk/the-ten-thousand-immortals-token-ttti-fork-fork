import List "mo:core/List";
import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Lot 7: a BTC deposit tracking is stored only once a check detects a
// deposit. Removes the purchase and wallet trackings whose deposits array is
// empty; every other tracking, field and store is kept unchanged. Touches
// only btcDeposits (never sale.reserved, balances, blocks or other state).
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  type TransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : TransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

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

  type DepositErrorKind = {
    #valueTooSmall;
    #tainted;
    #minterUnavailable;
    #other;
    #unrecoverable;
    #refundFailed;
  };

  type BtcRefundPurpose = { #excess; #fullRefund; #deliveryFailedExcess };

  type BtcRefund = {
    purpose : BtcRefundPurpose;
    attempt : TransferAttempt;
  };

  type BtcCostToRefund = {
    amount : Nat;
    conversionId : ?Nat;
    refundedBlock : ?Nat;
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
    btcRefund : ?BtcRefund;
    costToRefund : ?BtcCostToRefund;
  };

  type Tracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [DepositEntry];
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Int;
  };

  type BtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, Tracking>;
    wallets : Map.Map<CorePrincipal.Principal, Tracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type OldActor = {
    btcDeposits : BtcDepositStore;
  };

  type NewActor = {
    btcDeposits : BtcDepositStore;
  };

  func dropEmpty(m : Map.Map<CorePrincipal.Principal, Tracking>) {
    let empty = List.empty<CorePrincipal.Principal>();
    for ((p, t) in m.entries()) {
      if (t.deposits.size() == 0) empty.add(p);
    };
    for (p in empty.values()) {
      m.remove(p);
    };
  };

  public func migration(old : OldActor) : NewActor {
    dropEmpty(old.btcDeposits.purchases);
    dropEmpty(old.btcDeposits.wallets);
    { btcDeposits = old.btcDeposits };
  };
};
