import Array "mo:core/Array";
import Map "mo:core/Map";

// Stuck ckBTC mint recovery: every btcDeposits entry gains `conversionCause`
// (null) and `causePermanent` (false). Every other field of btcDeposits is
// carried forward unchanged. sale.reserved, balances, blocks and the ledger are
// never touched.
module {
  type Account = { owner : Principal; subaccount : ?Blob };
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };
  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };
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
    #receivingWalletNotConfigured;
  };
  type BtcRefundPurpose = { #excess; #fullRefund; #deliveryFailedExcess };
  type BtcRefund = { purpose : BtcRefundPurpose; attempt : TransferAttempt };
  type BtcCostToRefund = { amount : Nat; conversionId : ?Nat; refundedBlock : ?Nat };

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
    btcRefund : ?BtcRefund;
    costToRefund : ?BtcCostToRefund;
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
    conversionCause : ?Text;
    causePermanent : Bool;
  };
  type Tracking<D> = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [D];
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
    purchases : Map.Map<Principal, Tracking<OldDepositEntry>>;
    wallets : Map.Map<Principal, Tracking<OldDepositEntry>>;
    var minterInfo : ?MinterInfoCache;
  };
  type NewBtcDepositStore = {
    purchases : Map.Map<Principal, Tracking<NewDepositEntry>>;
    wallets : Map.Map<Principal, Tracking<NewDepositEntry>>;
    var minterInfo : ?MinterInfoCache;
  };

  type OldActor = { btcDeposits : OldBtcDepositStore };
  type NewActor = { btcDeposits : NewBtcDepositStore };

  func migrateEntry(e : OldDepositEntry) : NewDepositEntry {
    { e with conversionCause = null : ?Text; causePermanent = false };
  };

  func migrateTracking(t : Tracking<OldDepositEntry>) : Tracking<NewDepositEntry> {
    { t with deposits = t.deposits.map(migrateEntry) };
  };

  public func migration(old : OldActor) : NewActor {
    {
      btcDeposits = {
        purchases = old.btcDeposits.purchases.map(func(_, t) { migrateTracking(t) });
        wallets = old.btcDeposits.wallets.map(func(_, t) { migrateTracking(t) });
        var minterInfo = old.btcDeposits.minterInfo;
      };
    };
  };
};
