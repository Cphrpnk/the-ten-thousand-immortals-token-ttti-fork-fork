import List "mo:core/List";
import Map "mo:core/Map";
import Common "common";
import Pay "pay-token";
import Retry "retry";

// Mint fee (1/101 of each mint) routing, in the paid token, always for the
// lowest-liquidity TTTI-T/<paid token> pair: half A to that pair's LPs pro
// rata as an internal claimable balance (to the set-aside amount when the
// pair has no LP), half B to the set-aside amount. Set-aside amounts wait
// until worth 0.001 TTTI-T (10 USD), then 50 % is swapped into TTTI-T
// (ICPSwap while no native pool of the pair is open, else the native pool)
// and paired with the other 50 % as permanent liquidity (locked shares).
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // ns
  public type PoolId = Nat;
  public type TransferAttempt = Retry.TransferAttempt;
  public type TokenKey = Text; // "icp", "ckbtc", "ckusdc", "ckusdt"

  // One routed mint fee.
  public type MintFeeRouting = {
    id : Nat;
    at : Timestamp;
    conversionId : Nat;
    token : PayToken;
    poolId : ?PoolId; // the lowest-liquidity TTTI-T pair (null: none exists)
    feeAmount : Nat;
    halfA : Nat;
    halfB : Nat;
    toLps : Nat; // half A credited to LPs (0 when no LP)
    toSetAside : Nat; // half B (+ half A when no LP)
    lpCount : Nat;
  };

  public type MintFeeClaimStatus = {
    #inProgress;
    #needsReview;
    #completed : Nat; // ledger block
    #failed : Text;
  };

  // One LP claim of a mint-fee balance (memo TTTI-MF-<n>), keyed by n.
  public type MintFeeClaim = {
    n : Nat;
    owner : Principal;
    token : PayToken;
    amount : Nat;
    createdAt : Timestamp;
    attempt : TransferAttempt;
    status : MintFeeClaimStatus;
  };

  // Set-aside amount of one pay token, waiting for the next injection.
  public type SetAside = {
    token : PayToken;
    amount : Nat; // waiting
    totalReceived : Nat;
    totalInjected : Nat;
    lastInjectionAt : ?Timestamp;
  };

  public type SwapVenue = { #icpswap : Principal; #native : PoolId };

  public type InjectionStatus = {
    #swapping;
    #addingLiquidity;
    #completed;
    #needsReview;
    #failed : Text;
  };

  // One liquidity injection from a set-aside amount.
  public type LiquidityInjection = {
    id : Nat;
    token : PayToken;
    poolId : PoolId; // native TTTI-T pair receiving the liquidity
    amountIn : Nat; // set-aside amount taken
    swapAmountIn : Nat; // 50 % swapped into TTTI-T
    pairAmountIn : Nat; // 50 % paired with the TTTI-T obtained
    venue : SwapVenue;
    minTttiOut : Nat; // bounded slippage
    tttiReceived : Nat;
    liquidityShares : Nat; // locked shares added
    used0 : Nat;
    used1 : Nat;
    status : InjectionStatus;
    error : ?Text;
    startedAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Stable mint-fee state (new stable field `mintFees`).
  public type MintFeeStore = {
    claimable : Map.Map<Principal, Map.Map<TokenKey, Nat>>;
    claimed : Map.Map<Principal, Map.Map<TokenKey, Nat>>;
    claims : Map.Map<Nat, MintFeeClaim>;
    routings : List.List<MintFeeRouting>;
    var nextRoutingId : Nat;
    setAside : Map.Map<TokenKey, SetAside>;
    injections : Map.Map<Nat, LiquidityInjection>;
    var nextInjectionId : Nat;
  };

  // --- Views -----------------------------------------------------------------

  public type MintFeeBalance = { token : PayToken; claimable : Nat; claimed : Nat };

  public type MintFeeClaimView = {
    n : Nat;
    token : PayToken;
    amount : Nat;
    createdAt : Timestamp;
    memoText : Text;
    status : MintFeeClaimStatus;
  };

  public type MintFeeLpView = {
    balances : [MintFeeBalance];
    claims : [MintFeeClaimView];
  };

  public type ClaimMintFeeError = {
    #anonymous;
    #nothingToClaim;
    #belowLedgerFee : { fee : Nat };
    #claimInProgress;
  };

  public type ClaimMintFeeResult = {
    #ok : MintFeeClaimView;
    #err : ClaimMintFeeError;
  };

  public type SetAsideView = {
    token : PayToken;
    amount : Nat;
    valueUsdE8 : ?Nat; // null = rate missing or expired (waits)
    thresholdUsdE8 : Nat; // 10 USD = 0.001 TTTI-T
    totalReceived : Nat;
    totalInjected : Nat;
    lastInjectionAt : ?Timestamp;
    targetPoolId : ?PoolId;
  };

  public type InjectionPage = {
    items : [LiquidityInjection]; // newest first
    total : Nat;
    offset : Nat;
  };
};
