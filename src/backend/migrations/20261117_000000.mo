import List "mo:core/List";
import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Mint revenue correction: adds the empty owner revenue state (destinations,
// accumulated owner shares, owner sends, once-only treasury sweep not started)
// and the empty mint-fee state (LP claimable balances, claims, routings,
// set-aside amounts, liquidity injections). Touches no existing field (never
// sale.reserved, ledger balances, blocks, DEX balances or treasury records).
module {
  type Account = { owner : CorePrincipal.Principal; subaccount : ?Blob };
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };
  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };
  type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
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

  // --- ownerRevenue ----------------------------------------------------------

  type OwnerDestination = { token : PayToken; account : Account; setAt : Int; setBy : CorePrincipal.Principal };
  type OwnerSendSource = { #mint : Nat; #accumulated; #treasurySweep };
  type OwnerSendStatus = { #pending; #sent : Nat; #needsReview; #failed : Text };
  type OwnerSend = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : OwnerSendSource;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Int;
    updatedAt : Int;
  };
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
  type DestinationChange = { token : PayToken; account : ?Account; at : Int; by : CorePrincipal.Principal };
  type OwnerRevenueStore = {
    destinations : Map.Map<Text, OwnerDestination>;
    accumulated : Map.Map<Text, Nat>;
    sends : Map.Map<Nat, OwnerSend>;
    var nextSendId : Nat;
    var sweep : TreasurySweep;
    destinationHistory : List.List<DestinationChange>;
  };

  // --- mintFees --------------------------------------------------------------

  type MintFeeRouting = {
    id : Nat;
    at : Int;
    conversionId : Nat;
    token : PayToken;
    poolId : ?Nat;
    feeAmount : Nat;
    halfA : Nat;
    halfB : Nat;
    toLps : Nat;
    toSetAside : Nat;
    lpCount : Nat;
  };
  type MintFeeClaim = {
    n : Nat;
    owner : CorePrincipal.Principal;
    token : PayToken;
    amount : Nat;
    createdAt : Int;
    attempt : TransferAttempt;
    status : { #inProgress; #needsReview; #completed : Nat; #failed : Text };
  };
  type SetAside = {
    token : PayToken;
    amount : Nat;
    totalReceived : Nat;
    totalInjected : Nat;
    lastInjectionAt : ?Int;
  };
  type LiquidityInjection = {
    id : Nat;
    token : PayToken;
    poolId : Nat;
    amountIn : Nat;
    swapAmountIn : Nat;
    pairAmountIn : Nat;
    venue : { #icpswap : CorePrincipal.Principal; #native : Nat };
    minTttiOut : Nat;
    tttiReceived : Nat;
    liquidityShares : Nat;
    used0 : Nat;
    used1 : Nat;
    status : { #swapping; #addingLiquidity; #completed; #needsReview; #failed : Text };
    error : ?Text;
    startedAt : Int;
    updatedAt : Int;
  };
  type MintFeeStore = {
    claimable : Map.Map<CorePrincipal.Principal, Map.Map<Text, Nat>>;
    claimed : Map.Map<CorePrincipal.Principal, Map.Map<Text, Nat>>;
    claims : Map.Map<Nat, MintFeeClaim>;
    routings : List.List<MintFeeRouting>;
    var nextRoutingId : Nat;
    setAside : Map.Map<Text, SetAside>;
    injections : Map.Map<Nat, LiquidityInjection>;
    var nextInjectionId : Nat;
  };

  type OldActor = {};

  type NewActor = {
    ownerRevenue : OwnerRevenueStore;
    mintFees : MintFeeStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      ownerRevenue = {
        destinations = Map.empty();
        accumulated = Map.empty();
        sends = Map.empty();
        var nextSendId = 0;
        var sweep = {
          status = #notStarted;
          startedAt = null;
          completedAt = null;
          reserveTopUpE8s = 0;
          reserveTopUp = null;
          tokens = [];
        };
        destinationHistory = List.empty();
      };
      mintFees = {
        claimable = Map.empty();
        claimed = Map.empty();
        claims = Map.empty();
        routings = List.empty();
        var nextRoutingId = 0;
        setAside = Map.empty();
        injections = Map.empty();
        var nextInjectionId = 0;
      };
    };
  };
};
