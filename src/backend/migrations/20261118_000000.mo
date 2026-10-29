import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DEX lot 5: adds the empty ICPSwap router state (routed swaps, cumulative
// 0.1 % totals and set-aside LP share per native pool). Touches no existing
// field (never sale.reserved, ledger balances, blocks, DEX balances or pools).
module {
  type Account = { owner : CorePrincipal.Principal; subaccount : ?Blob };
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };
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
  type RouterStore = {
    swaps : Map.Map<Nat, RoutedSwap>;
    var nextSwapId : Nat;
    feeTotals : Map.Map<Nat, RouterFeeTotals>;
    setAside : Map.Map<Nat, RouterSetAside>;
  };

  type OldActor = {};

  type NewActor = {
    router : RouterStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      router = {
        swaps = Map.empty();
        var nextSwapId = 0;
        feeTotals = Map.empty();
        setAside = Map.empty();
      };
    };
  };
};
