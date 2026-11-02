import Map "mo:core/Map";

// PTM-1: liquidity-forming mint. Adds the `liquidityMints` store (no mint, no
// guarantee, no creator set-aside yet). Every existing field is carried
// forward unchanged; sale.reserved, balances, blocks, pools and positions are
// never touched.
module {
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type MintStatus = { #inProgress; #completed; #refunded; #refundFailed };

  type LiquidityMint = {
    id : Nat;
    payer : Principal;
    owner : Principal;
    token : PayToken;
    tttiAmount : Nat;
    payAmount : Nat;
    rateUsdE8 : Nat;
    poolId : Nat;
    positionId : ?Nat;
    paymentBlock : ?Nat;
    status : MintStatus;
    createdAt : Int;
  };

  type Guarantee = {
    mintId : Nat;
    owner : Principal;
    token : PayToken;
    amount : Nat;
    createdAt : Int;
  };

  type CreatorSetAside = {
    mintId : Nat;
    token : PayToken;
    amount : Nat;
  };

  type LiquidityMintStore = {
    mints : Map.Map<Nat, LiquidityMint>;
    guarantees : Map.Map<Nat, Guarantee>;
    creatorSetAsides : Map.Map<Nat, CreatorSetAside>;
    var nextMintId : Nat;
  };

  type OldActor = {};

  type NewActor = {
    liquidityMints : LiquidityMintStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      liquidityMints = {
        mints = Map.empty();
        guarantees = Map.empty();
        creatorSetAsides = Map.empty();
        var nextMintId = 0;
      };
    };
  };
};
