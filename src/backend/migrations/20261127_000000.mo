import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

// PTM-2: personal guarantee and redemption. Drops the previous fixed-price
// buyback store (`buybacks`; nothing was sold on this fork, so it holds no
// record that matters) and adds `guaranteeMasses` (one mass per minter and
// payment token) and `redemptions` (redemption payouts and the 1 % fees set
// aside for the creator). The masses are built from what the mint already
// recorded: every Guarantee of a #completed liquidity mint adds the mint's
// TTTI-T quantity and the guarantee amount to the mass of its owner in the
// guarantee token. `liquidityMints` is read and carried forward unchanged.
// Every other field is carried forward unchanged; sale.reserved, balances,
// blocks, pools, positions and the ledger are never touched.
module {
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
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

  // --- Removed: the previous buyback store -----------------------------------

  type BuybackRule = { #originalNet; #dayRate };

  type BuybackStatus = { #inProgress; #completed; #payoutFailed; #cancelled };

  type BuybackPayoutAttempt = {
    from : Account;
    attempt : TransferAttempt;
  };

  type Buyback = {
    id : Nat;
    purchaseId : ?Nat;
    buyer : Principal;
    buyerAccount : Account;
    timestamp : Int;
    originalToken : PayToken;
    tokenReturned : PayToken;
    percent : Nat;
    massTotalNet : Nat;
    massTotalTtti : Nat;
    massRemainingNet : Nat;
    massRemainingTtti : Nat;
    originalRateUsdE8 : Nat;
    returnedRateUsdE8 : Nat;
    rule : BuybackRule;
    originalNetAmount : Nat;
    baseAmount : Nat;
    baseAmountReturned : Nat;
    buybackFee : Nat;
    thirdPartyFees : Nat;
    tttiTransferFee : Nat;
    tttiEscrowFee : Nat;
    amountReturned : Nat;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    payoutBlock : ?Nat;
    payoutAttempts : [BuybackPayoutAttempt];
    releaseBlock : ?Nat;
    cancelBlock : ?Nat;
    legacy : Bool;
    status : BuybackStatus;
    message : ?Text;
  };

  type BuybackStore = {
    records : Map.Map<Nat, Buyback>;
    var nextId : Nat;
    var adminAccount : ?Account;
  };

  // --- Read and carried forward: the liquidity mint store --------------------

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

  // --- Added: masses, redemptions and fees ------------------------------------

  type GuaranteeMass = {
    token : PayToken;
    totalTtti : Nat;
    totalGuarantee : Nat;
    remainingTtti : Nat;
    remainingGuarantee : Nat;
    excess : Nat;
  };

  type RedeemPhase = { #duringMint; #afterMint };

  type RedeemRule = { #depositedGuarantee; #dayRate; #proRata };

  type RedemptionKind = { #redeem; #excessWithdrawal };

  type Redemption = {
    id : Nat;
    owner : Principal;
    account : Account;
    kind : RedemptionKind;
    token : PayToken;
    phase : RedeemPhase;
    rule : RedeemRule;
    tttiAmount : Nat;
    tttiPullBlock : ?Nat;
    depositedGuarantee : Nat;
    rateUsdE8 : ?Nat;
    returnedAmount : Nat;
    excessKept : Nat;
    redemptionFee : Nat;
    thirdPartyFee : Nat;
    netAmount : Nat;
    createdAt : Int;
    payout : DexTransferAttempt;
    status : DexTransferStatus;
  };

  type RedemptionFee = {
    redemptionId : Nat;
    token : PayToken;
    amount : Nat;
    createdAt : Int;
  };

  type RedemptionStore = {
    redemptions : Map.Map<Nat, Redemption>;
    fees : Map.Map<Nat, RedemptionFee>;
  };

  type OldActor = {
    buybacks : BuybackStore;
    liquidityMints : LiquidityMintStore;
  };

  type NewActor = {
    liquidityMints : LiquidityMintStore;
    guaranteeMasses : Map.Map<Principal, Map.Map<Text, GuaranteeMass>>;
    redemptions : RedemptionStore;
  };

  func tokenKey(token : PayToken) : Text = switch (token) {
    case (#icp) "icp";
    case (#ckbtc) "ckbtc";
    case (#ckusdc) "ckusdc";
    case (#ckusdt) "ckusdt";
  };

  public func migration(old : OldActor) : NewActor {
    let masses : Map.Map<Principal, Map.Map<Text, GuaranteeMass>> = Map.empty();
    for ((_, g) in old.liquidityMints.guarantees.entries()) {
      switch (old.liquidityMints.mints.get(g.mintId)) {
        case (?m) {
          if (m.status == #completed) {
            let perOwner = switch (masses.get(g.owner)) {
              case (?existing) existing;
              case null {
                let fresh : Map.Map<Text, GuaranteeMass> = Map.empty();
                masses.add(g.owner, fresh);
                fresh;
              };
            };
            let key = tokenKey(g.token);
            let base : GuaranteeMass = switch (perOwner.get(key)) {
              case (?existing) existing;
              case null {
                {
                  token = g.token;
                  totalTtti = 0;
                  totalGuarantee = 0;
                  remainingTtti = 0;
                  remainingGuarantee = 0;
                  excess = 0;
                };
              };
            };
            perOwner.add(
              key,
              {
                base with
                totalTtti = base.totalTtti + m.tttiAmount;
                totalGuarantee = base.totalGuarantee + g.amount;
                remainingTtti = base.remainingTtti + m.tttiAmount;
                remainingGuarantee = base.remainingGuarantee + g.amount;
              },
            );
          };
        };
        case null {};
      };
    };
    ignore old.buybacks;
    {
      liquidityMints = old.liquidityMints;
      guaranteeMasses = masses;
      redemptions = { redemptions = Map.empty(); fees = Map.empty() };
    };
  };
};
