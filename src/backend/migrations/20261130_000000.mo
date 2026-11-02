import Map "mo:core/Map";

// Atomic liquidity mint. Widens MintStatus with #refunding (a refund
// withdrawal is in progress) and adds two optional fields to every stored
// LiquidityMint: `refundWithdrawalN` (DW withdrawal number of the refund) and
// `refusalCause` (why the isolated mint core refused). Existing mints get
// null for both and keep their status. Guarantees, set-asides and the next
// mint id are carried forward unchanged; every other field is untouched, and
// sale.reserved, balances, blocks, pools, positions and the ledger are never
// touched.
module {
  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type OldMintStatus = { #inProgress; #completed; #refunded; #refundFailed };

  type NewMintStatus = {
    #inProgress;
    #completed;
    #refunding;
    #refunded;
    #refundFailed;
  };

  type OldLiquidityMint = {
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
    status : OldMintStatus;
    createdAt : Int;
  };

  type NewLiquidityMint = {
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
    status : NewMintStatus;
    createdAt : Int;
    refundWithdrawalN : ?Nat;
    refusalCause : ?Text;
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

  type OldStore = {
    mints : Map.Map<Nat, OldLiquidityMint>;
    guarantees : Map.Map<Nat, Guarantee>;
    creatorSetAsides : Map.Map<Nat, CreatorSetAside>;
    var nextMintId : Nat;
  };

  type NewStore = {
    mints : Map.Map<Nat, NewLiquidityMint>;
    guarantees : Map.Map<Nat, Guarantee>;
    creatorSetAsides : Map.Map<Nat, CreatorSetAside>;
    var nextMintId : Nat;
  };

  type OldActor = { liquidityMints : OldStore };

  type NewActor = { liquidityMints : NewStore };

  func widen(status : OldMintStatus) : NewMintStatus = switch (status) {
    case (#inProgress) #inProgress;
    case (#completed) #completed;
    case (#refunded) #refunded;
    case (#refundFailed) #refundFailed;
  };

  public func migration(old : OldActor) : NewActor {
    let mints : Map.Map<Nat, NewLiquidityMint> = Map.empty();
    for ((id, m) in old.liquidityMints.mints.entries()) {
      mints.add(
        id,
        {
          id = m.id;
          payer = m.payer;
          owner = m.owner;
          token = m.token;
          tttiAmount = m.tttiAmount;
          payAmount = m.payAmount;
          rateUsdE8 = m.rateUsdE8;
          poolId = m.poolId;
          positionId = m.positionId;
          paymentBlock = m.paymentBlock;
          status = widen(m.status);
          createdAt = m.createdAt;
          refundWithdrawalN = null;
          refusalCause = null;
        },
      );
    };
    {
      liquidityMints = {
        mints;
        guarantees = old.liquidityMints.guarantees;
        creatorSetAsides = old.liquidityMints.creatorSetAsides;
        var nextMintId = old.liquidityMints.nextMintId;
      };
    };
  };
};
