import Map "mo:core/Map";
import Dex "dex";
import Retry "retry";

// DEX lot 5: ICPSwap router. A routed swap runs on exactly one route: the
// native pool of the registry pair (0.3 %) or the ICPSwap pool of the same
// pair (ICPSwap 0.3 % plus a 0.1 % protocol fee on the input token, split
// 70 % to the native pool LPs and 30 % to its permanent liquidity).
module {
  public type DexToken = Dex.DexToken;
  public type PoolId = Dex.PoolId;
  public type Timestamp = Dex.Timestamp;

  // The single route of a quote or a swap.
  public type Route = {
    #native : { poolId : PoolId };
    #icpswap : { poolCanisterId : Principal };
  };

  // Fees of the chosen route, in tokenIn base units.
  public type RouteFees = {
    #native : {
      feeBps : Nat; // 30
      fee : Nat; // 0.3 % of amountIn
    };
    #icpswap : {
      icpswapFeeBps : Nat; // 30
      icpswapFee : Nat; // 0.3 % of the amount sent to ICPSwap
      protocolFeeBps : Nat; // 10
      protocolFee : Nat; // 0.1 % of amountIn
      protocolLpShare : Nat; // 70 % of protocolFee
      protocolPermanentShare : Nat; // 30 % of protocolFee
    };
  };

  public type RoutedQuoteArgs = {
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    slippageBps : Nat;
  };

  // Why the chosen route won.
  public type RouteReason = {
    #bestAmount; // both routes quoted; the chosen one returns more net of fees
    #nativeUnavailable; // native pool empty, filling or too shallow
    #icpswapUnavailable; // no ICPSwap pool or its quote failed
  };

  // The other route, for information only.
  public type RouteAlternative = {
    route : Route;
    amountOut : Nat;
    fees : RouteFees;
  };

  public type RoutedQuote = {
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    route : Route;
    reason : RouteReason;
    nativePoolId : ?PoolId; // registry pool of the pair (receives the 0.1 %)
    amountOut : Nat; // received, net of all fees
    fees : RouteFees;
    slippageBps : Nat;
    minimumReceived : Nat;
    alternative : ?RouteAlternative;
    maxDeadline : Timestamp; // now + 5 min (ns)
    quotedAt : Timestamp;
  };

  public type RoutedSwapArgs = {
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    minAmountOut : Nat;
    deadline : Timestamp; // ns, at most 5 min ahead
    route : Route;
  };

  public type RoutedSwapResult = {
    id : Nat; // routed swap record id
    route : Route;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    fees : RouteFees;
  };

  public type RouteError = {
    #anonymous;
    #zeroAmount;
    #sameToken;
    #pairNotFound; // not a registry pair
    #pairRemoved;
    #noRouteAvailable;
    #routeMismatch : { expected : Route }; // chosen route no longer matches the pair
    #invalidSlippage : { maximumBps : Nat };
    #deadlineExceeded : { deadline : Timestamp; now : Timestamp };
    #deadlineTooFar : { maximum : Timestamp };
    #insufficientBalance : { token : DexToken; available : Nat; required : Nat };
    #slippageExceeded : { amountOut : Nat; minAmountOut : Nat };
    #operationInProgress;
    #icpswapFailed : { id : Nat; message : Text; fundsReturned : Bool };
    #outcomeUnknown : { id : Nat }; // sent to To review
  };

  // Steps of an ICPSwap routed swap (native swaps go straight to #done).
  public type RoutedSwapStage = {
    #recorded;
    #movingIn; // IR transfer to the ICPSwap deposit subaccount
    #depositing;
    #swapping;
    #withdrawing;
    #done;
  };

  public type RoutedSwapStatus = {
    #inProgress;
    #completed;
    #failedReturned : Text; // ICPSwap failure, input credited back
    #needsReview; // unknown outcome, listed in To review (kind #IR)
    #reviewedArrived : Nat; // admin: the IR transfer arrived in block
    #reviewedNotArrived; // admin: nothing moved, input credited back
  };

  // One routed swap (both routes are recorded).
  public type RoutedSwap = {
    id : Nat;
    owner : Principal;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    route : Route;
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat; // debited from the internal balance
    amountOut : Nat; // credited to the internal balance
    minAmountOut : Nat;
    deadline : Timestamp;
    fees : RouteFees;
    nativePoolId : ?PoolId;
    zeroForOne : Bool; // ICPSwap direction
    stage : RoutedSwapStage;
    status : RoutedSwapStatus;
    move : ?Retry.DexTransferAttempt; // IR transfer (ICPSwap route only)
    lastError : ?Text;
  };

  // Cumulative 0.1 % collected for one native pool (token0 / token1 units).
  public type RouterFeeTotals = {
    poolId : PoolId;
    collected0 : Nat;
    collected1 : Nat;
    lpPaid0 : Nat;
    lpPaid1 : Nat;
    lpSetAside0 : Nat;
    lpSetAside1 : Nat;
    permanent0 : Nat;
    permanent1 : Nat;
  };

  // LP share waiting for LPs of a native pool with no LP yet.
  public type RouterSetAside = {
    amount0 : Nat;
    amount1 : Nat;
  };

  public type RouterFeeView = {
    totals : RouterFeeTotals;
    setAside : RouterSetAside;
  };

  public type RouterAdminError = { #notAuthorized };

  // 70 % LP share of the 0.1 % that went to the LPs of the least liquid TTTI-T
  // pool because the native pool of the pair had no LP (token0 / token1 units
  // of the native pool). Added by migration 20261119_000000; rows start empty.
  // Amounts already set aside stay in RouterSetAside, payable to LPs of the
  // native pool, and are not touched.
  public type RouterRedirect = {
    poolId : PoolId; // native pool of the pair that collected the fee
    redirected0 : Nat;
    redirected1 : Nat;
    lastTargetPoolId : ?PoolId; // least liquid TTTI-T pool that last received
    lastAt : ?Timestamp;
  };

  public type RouterStore = {
    swaps : Map.Map<Nat, RoutedSwap>;
    var nextSwapId : Nat;
    feeTotals : Map.Map<PoolId, RouterFeeTotals>;
    setAside : Map.Map<PoolId, RouterSetAside>;
    redirected : Map.Map<PoolId, RouterRedirect>;
  };
};
