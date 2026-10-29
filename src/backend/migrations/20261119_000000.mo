import List "mo:core/List";
import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Treasury under admin control and router 0.1 % redirect.
// 1. ownerRevenue: the per-token automatic destinations are dropped. Accumulated
//    amounts, earlier owner sends (history stays readable), the once-only sweep
//    record, the id counter and the destination change history are kept as is.
//    OwnerSendSource gains #withdrawal; existing sends keep their source.
// 2. router: adds the empty `redirected` map (70 % LP share redirected to the
//    least liquid TTTI-T pool). Swaps, fee totals and set-aside amounts are kept
//    unchanged, so set-aside amounts stay payable to liquidity providers.
// Touches no other field (never sale.reserved, ledger balances, blocks,
// conversions, delivery addresses, purchase acknowledgements, stored rate or
// cycles reserve).
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
  type OldOwnerSendSource = { #mint : Nat; #accumulated; #treasurySweep };
  type NewOwnerSendSource = {
    #mint : Nat;
    #accumulated;
    #treasurySweep;
    #withdrawal : { by : CorePrincipal.Principal; from : { #mintTreasury; #accumulated } };
  };
  type OwnerSendStatus = { #pending; #sent : Nat; #needsReview; #failed : Text };
  type OldOwnerSend = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : OldOwnerSendSource;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Int;
    updatedAt : Int;
  };
  type NewOwnerSend = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : NewOwnerSendSource;
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

  type OldOwnerRevenueStore = {
    destinations : Map.Map<Text, OwnerDestination>;
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

  // --- router ----------------------------------------------------------------

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
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
  type Route = {
    #native : { poolId : Nat };
    #icpswap : { poolCanisterId : CorePrincipal.Principal };
  };
  type RouteFees = {
    #native : { feeBps : Nat; fee : Nat };
    #icpswap : {
      icpswapFeeBps : Nat;
      icpswapFee : Nat;
      protocolFeeBps : Nat;
      protocolFee : Nat;
      protocolLpShare : Nat;
      protocolPermanentShare : Nat;
    };
  };
  type RoutedSwapStage = { #recorded; #movingIn; #depositing; #swapping; #withdrawing; #done };
  type RoutedSwapStatus = {
    #inProgress;
    #completed;
    #failedReturned : Text;
    #needsReview;
    #reviewedArrived : Nat;
    #reviewedNotArrived;
  };
  type RoutedSwap = {
    id : Nat;
    owner : CorePrincipal.Principal;
    createdAt : Int;
    updatedAt : Int;
    route : Route;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    minAmountOut : Nat;
    deadline : Int;
    fees : RouteFees;
    nativePoolId : ?Nat;
    zeroForOne : Bool;
    stage : RoutedSwapStage;
    status : RoutedSwapStatus;
    move : ?DexTransferAttempt;
    lastError : ?Text;
  };
  type RouterFeeTotals = {
    poolId : Nat;
    collected0 : Nat;
    collected1 : Nat;
    lpPaid0 : Nat;
    lpPaid1 : Nat;
    lpSetAside0 : Nat;
    lpSetAside1 : Nat;
    permanent0 : Nat;
    permanent1 : Nat;
  };
  type RouterSetAside = { amount0 : Nat; amount1 : Nat };
  type RouterRedirect = {
    poolId : Nat;
    redirected0 : Nat;
    redirected1 : Nat;
    lastTargetPoolId : ?Nat;
    lastAt : ?Int;
  };
  type OldRouterStore = {
    swaps : Map.Map<Nat, RoutedSwap>;
    var nextSwapId : Nat;
    feeTotals : Map.Map<Nat, RouterFeeTotals>;
    setAside : Map.Map<Nat, RouterSetAside>;
  };
  type NewRouterStore = {
    swaps : Map.Map<Nat, RoutedSwap>;
    var nextSwapId : Nat;
    feeTotals : Map.Map<Nat, RouterFeeTotals>;
    setAside : Map.Map<Nat, RouterSetAside>;
    redirected : Map.Map<Nat, RouterRedirect>;
  };

  type OldActor = {
    ownerRevenue : OldOwnerRevenueStore;
    router : OldRouterStore;
  };

  type NewActor = {
    ownerRevenue : NewOwnerRevenueStore;
    router : NewRouterStore;
  };

  func convertSource(s : OldOwnerSendSource) : NewOwnerSendSource = switch (s) {
    case (#mint(id)) #mint(id);
    case (#accumulated) #accumulated;
    case (#treasurySweep) #treasurySweep;
  };

  public func migration(old : OldActor) : NewActor {
    let sends : Map.Map<Nat, NewOwnerSend> = Map.empty();
    for ((id, s) in old.ownerRevenue.sends.entries()) {
      sends.add(id, { s with source = convertSource(s.source) });
    };
    {
      ownerRevenue = {
        accumulated = old.ownerRevenue.accumulated;
        sends;
        var nextSendId = old.ownerRevenue.nextSendId;
        var sweep = old.ownerRevenue.sweep;
        destinationHistory = old.ownerRevenue.destinationHistory;
      };
      router = {
        swaps = old.router.swaps;
        var nextSwapId = old.router.nextSwapId;
        feeTotals = old.router.feeTotals;
        setAside = old.router.setAside;
        redirected = Map.empty();
      };
    };
  };
};
