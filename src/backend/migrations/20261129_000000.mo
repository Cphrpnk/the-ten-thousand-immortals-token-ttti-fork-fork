import List "mo:core/List";
import Map "mo:core/Map";

// PTM-4: creator fees, permanent liquidity and cycles fee routing. Purely
// additive: adds `creatorFees` (no total, no payout), `permanentLiquidity`
// (no set-aside, empty journal, next entry 0, no waiting text) and
// `cyclesFees` (all counters 0, no settlement, no recorded split). Every
// existing field is carried forward unchanged; sale.reserved, balances,
// blocks, pools, positions, the ledger and its stored fee are never touched.
module {
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  type DexTransferRequest = {
    token : DexToken;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type DexTransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : DexTransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  type DexTransferStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat;
    #failed : Text;
  };

  // --- creatorFees -------------------------------------------------------------

  type CreatorTokenTotals = {
    token : DexToken;
    swapFeeShare : Nat;
    routerShare : Nat;
    mintFee : Nat;
    buybackFee : Nat;
    transferFee : Nat;
    paidOut : Nat;
    inFlight : Nat;
    lastCreditAt : ?Int;
  };

  type CreatorPayout = {
    n : Nat;
    token : DexToken;
    grossAmount : Nat;
    netAmount : Nat;
    wallet : Account;
    createdAt : Int;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type CreatorFeeStore = {
    totals : Map.Map<Text, CreatorTokenTotals>;
    payouts : Map.Map<Nat, CreatorPayout>;
  };

  // --- permanentLiquidity ------------------------------------------------------

  type PermanentKind = { #accrued; #rebalanced; #injected; #waiting; #failed };

  type PermanentRoute = { #native : Nat; #icpswap : Principal };

  type PermanentLogEntry = {
    id : Nat;
    at : Int;
    kind : PermanentKind;
    token : DexToken;
    amount : Nat;
    otherToken : ?DexToken;
    otherAmount : Nat;
    route : ?PermanentRoute;
    poolId : ?Nat;
    shares : Nat;
    reason : ?Text;
  };

  type PermanentLiquidityStore = {
    setAside : Map.Map<Text, Nat>;
    log : List.List<PermanentLogEntry>;
    var nextLogId : Nat;
    lastWaiting : Map.Map<Text, Text>;
  };

  // --- cyclesFees --------------------------------------------------------------

  type FeeSplit = {
    cyclesE8s : Nat;
    creator : Nat;
  };

  type CyclesFeeSettlement = {
    n : Nat;
    grossE8s : Nat;
    netE8s : Nat;
    createdAt : Int;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type CyclesFeeStore = {
    var pendingE8s : Nat;
    var inFlightE8s : Nat;
    var settledE8s : Nat;
    var recordedE8s : Nat;
    settlements : Map.Map<Nat, CyclesFeeSettlement>;
    mintSplits : Map.Map<Nat, FeeSplit>;
    buybackSplits : Map.Map<Nat, FeeSplit>;
  };

  type OldActor = {};

  type NewActor = {
    creatorFees : CreatorFeeStore;
    permanentLiquidity : PermanentLiquidityStore;
    cyclesFees : CyclesFeeStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      creatorFees = {
        totals = Map.empty();
        payouts = Map.empty();
      };
      permanentLiquidity = {
        setAside = Map.empty();
        log = List.empty();
        var nextLogId = 0;
        lastWaiting = Map.empty();
      };
      cyclesFees = {
        var pendingE8s = 0;
        var inFlightE8s = 0;
        var settledE8s = 0;
        var recordedE8s = 0;
        settlements = Map.empty();
        mintSplits = Map.empty();
        buybackSplits = Map.empty();
      };
    };
  };
};
