import List "mo:core/List";
import Map "mo:core/Map";

// Mint revenue routing: adds the `mintRevenue` store (no receiving wallet,
// no wallet change, no settlement started, no fee-account move); btcDeposits
// and ownerRevenue are copied with widened variants. Every other
// field is carried forward unchanged (never sale.reserved, ledger balances,
// blocks, owner sends, withdrawals or LP credits).
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
  type OwnerSendStatus = { #pending; #sent : Nat; #needsReview; #failed : Text };

  type ReceivingWallet = {
    token : PayToken;
    account : Account;
    setAt : Int;
    setBy : Principal;
  };
  type WalletChange = {
    id : Nat;
    token : PayToken;
    oldAccount : ?Account;
    newAccount : Account;
    at : Int;
    by : Principal;
  };
  type SettlementStatus = { #pendingWallet; #sending; #sent : [Nat]; #failed : Text; #toReview };
  type SettlementLegPurpose = { #ownerAccumulated; #ownerMintTreasury; #feePending; #feeLegacy };
  type SettlementLeg = {
    purpose : SettlementLegPurpose;
    amount : Nat;
    ownerSendId : ?Nat;
    feeMoveN : ?Nat;
  };
  type TokenSettlement = {
    token : PayToken;
    status : SettlementStatus;
    destination : ?Account;
    legs : [SettlementLeg];
    startedAt : ?Int;
    completedAt : ?Int;
    lastError : ?Text;
  };
  type FeeMovePurpose = { #mintFee : Nat; #settlement : SettlementLegPurpose };
  type FeeMove = {
    n : Nat;
    token : PayToken;
    purpose : FeeMovePurpose;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Int;
    updatedAt : Int;
  };
  type MintRevenueStore = {
    wallets : Map.Map<Text, ReceivingWallet>;
    walletChanges : List.List<WalletChange>;
    var nextWalletChangeId : Nat;
    settlements : Map.Map<Text, TokenSettlement>;
    feeMoves : Map.Map<Nat, FeeMove>;
  };

  // --- btcDeposits: DepositErrorKind gains #receivingWalletNotConfigured ------

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
  type OldDepositErrorKind = {
    #valueTooSmall;
    #tainted;
    #minterUnavailable;
    #other;
    #unrecoverable;
    #refundFailed;
  };
  type NewDepositErrorKind = {
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
  type DepositEntry<E> = {
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
    errorKind : ?E;
    errorMessage : ?Text;
    btcRefund : ?BtcRefund;
    costToRefund : ?BtcCostToRefund;
  };
  type Tracking<E> = {
    kind : DepositKind;
    btcAddress : Text;
    stage : DepositStage;
    deposits : [DepositEntry<E>];
    createdAt : Int;
    lastCheckedAt : ?Int;
    errorKind : ?E;
    errorMessage : ?Text;
  };
  type OldTracking = Tracking<OldDepositErrorKind>;
  type NewTracking = Tracking<NewDepositErrorKind>;
  type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Int;
  };
  type OldBtcDepositStore = {
    purchases : Map.Map<Principal, OldTracking>;
    wallets : Map.Map<Principal, OldTracking>;
    var minterInfo : ?MinterInfoCache;
  };
  type NewBtcDepositStore = {
    purchases : Map.Map<Principal, NewTracking>;
    wallets : Map.Map<Principal, NewTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  // --- ownerRevenue: OwnerSendSource gains #settlement -------------------------

  type TreasurySource = { #mintTreasury; #accumulated };
  type OldOwnerSendSource = {
    #mint : Nat;
    #accumulated;
    #treasurySweep;
    #withdrawal : { by : Principal; from : TreasurySource };
  };
  type NewOwnerSendSource = {
    #mint : Nat;
    #accumulated;
    #treasurySweep;
    #withdrawal : { by : Principal; from : TreasurySource };
    #settlement : { from : TreasurySource };
  };
  type OwnerSend<S> = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : S;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Int;
    updatedAt : Int;
  };
  type OldOwnerSend = OwnerSend<OldOwnerSendSource>;
  type NewOwnerSend = OwnerSend<NewOwnerSendSource>;
  type SweepStatus = { #notStarted; #toppingUpReserve; #sending; #completed };
  type SweepTokenStatus = { #pending; #waitingDestination; #nothingToSend; #sending : Nat; #sent : Nat };
  type SweepToken = { token : PayToken; balance : ?Nat; status : SweepTokenStatus };
  type TreasurySweep = {
    status : SweepStatus;
    startedAt : ?Int;
    completedAt : ?Int;
    reserveTopUpE8s : Nat;
    reserveTopUp : ?TransferAttempt;
    tokens : [SweepToken];
  };
  type DestinationChange = { token : PayToken; account : ?Account; at : Int; by : Principal };
  type OldOwnerRevenueStore = {
    accumulated : Map.Map<Text, Nat>;
    sends : Map.Map<Nat, OldOwnerSend>;
    var nextSendId : Nat;
    var sweep : TreasurySweep;
    destinationHistory : List.List<DestinationChange>;
  };
  type NewOwnerRevenueStore = {
    accumulated : Map.Map<Text, Nat>;
    sends : Map.Map<Nat, NewOwnerSend>;
    var nextSendId : Nat;
    var sweep : TreasurySweep;
    destinationHistory : List.List<DestinationChange>;
  };

  type OldActor = {
    btcDeposits : OldBtcDepositStore;
    ownerRevenue : OldOwnerRevenueStore;
  };

  type NewActor = {
    mintRevenue : MintRevenueStore;
    btcDeposits : NewBtcDepositStore;
    ownerRevenue : NewOwnerRevenueStore;
  };

  // Old values are subtypes of the widened types; entries are copied as is.
  func widenTrackings(m : Map.Map<Principal, OldTracking>) : Map.Map<Principal, NewTracking> {
    m.map(func(_, t) { t });
  };

  public func migration(old : OldActor) : NewActor {
    {
      btcDeposits = {
        purchases = widenTrackings(old.btcDeposits.purchases);
        wallets = widenTrackings(old.btcDeposits.wallets);
        var minterInfo = old.btcDeposits.minterInfo;
      };
      ownerRevenue = {
        accumulated = old.ownerRevenue.accumulated;
        sends = old.ownerRevenue.sends.map(func(_, s) { s });
        var nextSendId = old.ownerRevenue.nextSendId;
        var sweep = old.ownerRevenue.sweep;
        destinationHistory = old.ownerRevenue.destinationHistory;
      };
      mintRevenue = {
        wallets = Map.empty();
        walletChanges = List.empty();
        var nextWalletChangeId = 0;
        settlements = Map.empty();
        feeMoves = Map.empty();
      };
    };
  };
};
