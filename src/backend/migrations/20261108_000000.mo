import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// BTC refunds and BTC cost sends through the common retry (lot 4). Adds to
// the retry store the BTC cost sends to the treasury (keyed by the trace
// number n), empty; adds to every BTC deposit entry the current BTC refund
// attempt and the cost to refund by hand, both null: legacy entries recorded
// without created_at_time get no attempt. Ledger, blocks, balances,
// conversions, deposit amounts, stages and error fields are not touched.
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

  type CollectState = { #confirmed; #unknown };

  type PurchaseTrace = {
    n : Nat;
    buyer : CorePrincipal.Principal;
    token : PayToken;
    amount : Nat;
    reserved : Nat;
    created_at_time : Nat64;
    memo : Blob;
  };

  type PaymentToRefund = {
    n : Nat;
    buyer : CorePrincipal.Principal;
    token : PayToken;
    amount : Nat;
    reserved : Nat;
    created_at_time : Nat64;
    memo : Blob;
    collect : CollectState;
    block : ?Nat;
    detectedAt : Int;
  };

  type BtcCostSend = {
    buyer : CorePrincipal.Principal;
    depositIndex : Nat;
    conversionId : ?Nat;
    attempt : TransferAttempt;
  };

  type OldRetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
    refunds : Map.Map<Nat, TransferAttempt>;
    traces : Map.Map<Nat, PurchaseTrace>;
    toRefund : Map.Map<Nat, PaymentToRefund>;
  };

  type NewRetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
    refunds : Map.Map<Nat, TransferAttempt>;
    traces : Map.Map<Nat, PurchaseTrace>;
    toRefund : Map.Map<Nat, PaymentToRefund>;
    btcCosts : Map.Map<Nat, BtcCostSend>;
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
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  type NewDepositEntry = {
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

  type OldTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [OldDepositEntry];
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?DepositErrorKind;
    errorMessage : ?Text;
  };

  type NewTracking = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [NewDepositEntry];
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

  type OldBtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, OldTracking>;
    wallets : Map.Map<CorePrincipal.Principal, OldTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type NewBtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, NewTracking>;
    wallets : Map.Map<CorePrincipal.Principal, NewTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type OldActor = {
    retry : OldRetryStore;
    btcDeposits : OldBtcDepositStore;
  };

  type NewActor = {
    retry : NewRetryStore;
    btcDeposits : NewBtcDepositStore;
  };

  func migrateEntry(e : OldDepositEntry) : NewDepositEntry {
    { e with btcRefund = null : ?BtcRefund; costToRefund = null : ?BtcCostToRefund };
  };

  func migrateTracking(_ : CorePrincipal.Principal, t : OldTracking) : NewTracking {
    { t with deposits = t.deposits.map(migrateEntry) };
  };

  public func migration(old : OldActor) : NewActor {
    {
      retry = {
        var nextN = old.retry.nextN;
        forwards = old.retry.forwards;
        shares = old.retry.shares;
        refunds = old.retry.refunds;
        traces = old.retry.traces;
        toRefund = old.retry.toRefund;
        btcCosts = Map.empty();
      };
      btcDeposits = {
        purchases = old.btcDeposits.purchases.map(migrateTracking);
        wallets = old.btcDeposits.wallets.map(migrateTracking);
        var minterInfo = old.btcDeposits.minterInfo;
      };
    };
  };
};
