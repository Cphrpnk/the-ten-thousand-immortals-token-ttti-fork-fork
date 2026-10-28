// ICPSwap v3 SwapPool interface (subset): metadata, quote, deposit, swap,
// withdraw. Amounts in base units; `amountIn` / `amountOutMinimum` are text.
module {
  public type IcpSwapError = {
    #CommonError;
    #InternalError : Text;
    #UnsupportedToken : Text;
    #InsufficientFunds;
  };

  public type NatResult = { #ok : Nat; #err : IcpSwapError };

  public type SwapArgs = {
    amountIn : Text;
    zeroForOne : Bool;
    amountOutMinimum : Text;
  };

  public type DepositArgs = { token : Text; amount : Nat; fee : Nat };
  public type WithdrawArgs = { token : Text; amount : Nat; fee : Nat };

  public type PoolToken = { address : Text; standard : Text };

  public type PoolMetadata = {
    token0 : PoolToken;
    token1 : PoolToken;
    fee : Nat;
  };

  public type MetadataResult = { #ok : PoolMetadata; #err : IcpSwapError };

  public type SwapPool = actor {
    metadata : shared query () -> async MetadataResult;
    quote : shared query SwapArgs -> async NatResult;
    deposit : shared DepositArgs -> async NatResult;
    swap : shared SwapArgs -> async NatResult;
    withdraw : shared WithdrawArgs -> async NatResult;
  };

  // Token order of a pool as read from its metadata.
  public type PoolInfo = {
    poolId : Principal;
    tttiIsToken0 : Bool;
    fee : Nat;
  };
};
