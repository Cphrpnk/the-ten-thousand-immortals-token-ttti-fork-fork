import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// BTC deposits via the ckBTC minter: adds the empty per-principal deposit
// tracking store. Nothing else (ledger, balances, blocks, conversions,
// delivery addresses, acknowledgements, rates, cycles reserve, canister info)
// is touched.
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
  };

  type MinterInfoCache = {
    minConfirmations : Nat;
    depositMinSats : Nat;
    checkFeeSats : Nat;
    retrieveMinSats : Nat;
    fetchedAt : Int;
  };

  type BtcDepositStore = {
    purchases : Map.Map<CorePrincipal.Principal, DepositTracking>;
    wallets : Map.Map<CorePrincipal.Principal, DepositTracking>;
    var minterInfo : ?MinterInfoCache;
  };

  type OldActor = {};

  type NewActor = {
    btcDeposits : BtcDepositStore;
  };

  public func migration(_old : OldActor) : NewActor {
    {
      btcDeposits = {
        purchases = Map.empty();
        wallets = Map.empty();
        var minterInfo = null;
      };
    };
  };
};
