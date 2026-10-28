import List "mo:core/List";
import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// DEX lot 4: adds the empty cycles autonomy state (cycles share starts at the
// 40 % maximum), the empty protocol fee state (buckets, price samples, DC
// batches, DL bonus, protocol liquidity) and the empty weekly allocation
// state. Touches no existing field (never sale.reserved, ledger balances,
// blocks, DEX balances, transfers or treasury records).
module {
  type Account = { owner : CorePrincipal.Principal; subaccount : ?Blob };

  // --- cyclesAutonomy --------------------------------------------------------

  type CyclesSample = { at : Int; cyclesBalance : Nat; toppedUpCycles : Nat };
  type ShareChange = { at : Int; oldShareBps : Nat; newShareBps : Nat; autonomyDays : ?Nat };
  type AutonomyStore = {
    samples : List.List<CyclesSample>;
    var cyclesShareBps : Nat;
    var lastShareAdjustAt : ?Int;
    shareHistory : List.List<ShareChange>;
  };

  // --- protocolFees ----------------------------------------------------------

  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };
  type AttemptOutcome = { #pending; #unknown; #failed : Text; #succeeded : Nat };
  type DexTransferRequest = { token : DexToken; from : Account; to : Account; amount : Nat; fee : ?Nat };
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
  type DexTransferStatus = { #inProgress; #needsReview; #completed : Nat; #failed : Text };

  type FeeBuckets = { cycles0 : Nat; cycles1 : Nat; bonus0 : Nat; bonus1 : Nat; recycle0 : Nat; recycle1 : Nat };
  type PriceSample = { at : Int; reserve0 : Nat; reserve1 : Nat };
  type DcLeg = {
    poolId : Nat;
    tokenSymbol : Text;
    amountIn : Nat;
    referenceIcpOutE8s : Nat;
    executionIcpOutE8s : Nat;
    deviationBps : Nat;
    converted : Bool;
  };
  type DcBatchStatus = { #nothingToConvert; #waitingPriceDeviation; #sending; #sent : Nat; #needsReview; #failed : Text };
  type DcBatch = {
    id : Nat;
    at : Int;
    trigger : { #daily; #threshold };
    legs : [DcLeg];
    toCyclesE8s : Nat;
    toBonusE8s : Nat;
    status : DcBatchStatus;
  };
  type DcSend = { n : Nat; batchId : Nat; attempt : DexTransferAttempt; status : DexTransferStatus };
  type BonusClaim = {
    n : Nat;
    owner : CorePrincipal.Principal;
    amountE8s : Nat;
    createdAt : Int;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };
  type BonusDistribution = {
    id : Nat;
    at : Int;
    source : { #fees; #treasury };
    totalE8s : Nat;
    totalWeight : Nat;
    positions : Nat;
  };
  type ProtocolLiquidity = {
    poolId : Nat;
    shares : Nat;
    fromFees0 : Nat;
    fromFees1 : Nat;
    fromTreasury0 : Nat;
    fromTreasury1 : Nat;
    lastAddedAt : ?Int;
  };
  type ProtocolFeeStore = {
    buckets : Map.Map<Nat, FeeBuckets>;
    priceSamples : Map.Map<Nat, List.List<PriceSample>>;
    batches : List.List<DcBatch>;
    var nextBatchId : Nat;
    var lastBatchAt : ?Int;
    dcSends : Map.Map<Nat, DcSend>;
    var bonusUndistributedE8s : Nat;
    bonusClaimable : Map.Map<CorePrincipal.Principal, Nat>;
    bonusClaimed : Map.Map<CorePrincipal.Principal, Nat>;
    bonusDistributions : List.List<BonusDistribution>;
    var nextDistributionId : Nat;
    bonusClaims : Map.Map<Nat, BonusClaim>;
    protocolLiquidity : Map.Map<Nat, ProtocolLiquidity>;
    var cyclesHeldE8s : Nat;
    dcLegs : Map.Map<Nat, { cyclesE8s : Nat; bonusE8s : Nat }>;
  };

  // --- treasuryAllocation ----------------------------------------------------

  type TokenAmounts = { icp : Nat; ckbtc : Nat; ckusdc : Nat; ckusdt : Nat };
  type WeeklyAllocation = {
    id : Nat;
    at : Int;
    autonomyDays : ?Nat;
    treasuryBalances : TokenAmounts;
    stockPayoutCap : TokenAmounts;
    toCyclesReserveE8s : Nat;
    surplusE8s : Nat;
    toBonusE8s : Nat;
    toLiquidity : TokenAmounts;
    poolAdds : [{ poolId : Nat; amount0 : Nat; amount1 : Nat; shares : Nat }];
    skipped : [{ poolId : Nat; reason : Text }];
    waiting : TokenAmounts;
    note : Text;
  };
  type AllocationStore = {
    var nextId : Nat;
    var lastRunAt : ?Int;
    history : List.List<WeeklyAllocation>;
    var stockBase : ?TokenAmounts;
    var stockPaid : TokenAmounts;
    var balances : TokenAmounts;
  };

  type OldActor = {};

  type NewActor = {
    cyclesAutonomy : AutonomyStore;
    protocolFees : ProtocolFeeStore;
    treasuryAllocation : AllocationStore;
  };

  public func migration(_ : OldActor) : NewActor {
    let zero : TokenAmounts = { icp = 0; ckbtc = 0; ckusdc = 0; ckusdt = 0 };
    {
      cyclesAutonomy = {
        samples = List.empty();
        var cyclesShareBps = 4_000;
        var lastShareAdjustAt = null;
        shareHistory = List.empty();
      };
      protocolFees = {
        buckets = Map.empty();
        priceSamples = Map.empty();
        batches = List.empty();
        var nextBatchId = 0;
        var lastBatchAt = null;
        dcSends = Map.empty();
        var bonusUndistributedE8s = 0;
        bonusClaimable = Map.empty();
        bonusClaimed = Map.empty();
        bonusDistributions = List.empty();
        var nextDistributionId = 0;
        bonusClaims = Map.empty();
        protocolLiquidity = Map.empty();
        var cyclesHeldE8s = 0;
        dcLegs = Map.empty();
      };
      treasuryAllocation = {
        var nextId = 0;
        var lastRunAt = null;
        history = List.empty();
        var stockBase = null;
        var stockPaid = zero;
        var balances = zero;
      };
    };
  };
};
