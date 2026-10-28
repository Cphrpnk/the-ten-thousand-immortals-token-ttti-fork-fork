import List "mo:core/List";
import Map "mo:core/Map";
import Result "mo:core/Result";
import Common "common";
import Pay "pay-token";
import Retry "retry";

// Mint owner revenue: the 100/101 share of every mint goes, in the paid token,
// to the destination account the admin configured for that token (BTC counts
// as ckBTC). Without a destination the share accumulates per token and is sent
// once a destination is configured. Sends use lib/retry.mo (memo TTTI-OW-<n>,
// created_at_time, identical resend for 23 h, then To review).
// The one-time treasury sweep first tops the cycles reserve up to 2 ICP from
// MINT-TREASURY-ICP (memo TTTI-SR-<n>), then sends every remaining internal
// mint treasury balance to the owner destination of its token.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // ns
  public type TransferAttempt = Retry.TransferAttempt;

  // Key of the per-token maps: "icp", "ckbtc", "ckusdc", "ckusdt".
  public type TokenKey = Text;

  public type OwnerDestination = {
    token : PayToken;
    account : Account;
    setAt : Timestamp;
    setBy : Principal;
  };

  // Where an owner send comes from.
  public type OwnerSendSource = {
    #mint : Nat; // conversion id of the mint
    #accumulated; // share accumulated while no destination was configured
    #treasurySweep; // one-time sweep of an internal mint treasury
  };

  public type OwnerSendStatus = {
    #pending;
    #sent : Nat; // ledger block
    #needsReview;
    #failed : Text; // known ledger Err (a new attempt follows)
  };

  // One owner send, keyed by id. `attempt` holds memo, created_at_time, the
  // full request (source subaccount, destination, amount, fee) and the block.
  public type OwnerSend = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    source : OwnerSendSource;
    attempt : TransferAttempt;
    status : OwnerSendStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // --- One-time treasury sweep -----------------------------------------------

  public type SweepStatus = {
    #notStarted;
    #toppingUpReserve;
    #sending;
    #completed;
  };

  public type SweepTokenStatus = {
    #pending; // balance not read yet
    #waitingDestination; // no destination configured for this token
    #nothingToSend; // balance at or below the ledger fee
    #sending : Nat; // owner send id
    #sent : Nat; // owner send id
  };

  public type SweepToken = {
    token : PayToken;
    balance : ?Nat; // balance read before the send
    status : SweepTokenStatus;
  };

  // Stored once-only record: `status` never returns to #notStarted.
  public type TreasurySweep = {
    status : SweepStatus;
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    reserveTopUpE8s : Nat; // ICP moved from MINT-TREASURY-ICP to the cycles reserve
    reserveTopUp : ?TransferAttempt; // memo TTTI-SR-<n>
    tokens : [SweepToken];
  };

  // Stable owner revenue state (new stable field `ownerRevenue`).
  public type OwnerRevenueStore = {
    destinations : Map.Map<TokenKey, OwnerDestination>;
    accumulated : Map.Map<TokenKey, Nat>; // not yet sent, per token
    sends : Map.Map<Nat, OwnerSend>;
    var nextSendId : Nat;
    var sweep : TreasurySweep;
    destinationHistory : List.List<DestinationChange>;
  };

  public type DestinationChange = {
    token : PayToken;
    account : ?Account; // null = cleared
    at : Timestamp;
    by : Principal;
  };

  // --- Views -----------------------------------------------------------------

  public type OwnerDestinationView = {
    token : PayToken;
    account : ?Account;
    setAt : ?Timestamp;
    accumulated : Nat;
  };

  public type OwnerAccumulated = { token : PayToken; amount : Nat };

  public type OwnerSendView = {
    id : Nat;
    token : PayToken;
    amount : Nat;
    fee : ?Nat;
    destination : Account;
    source : OwnerSendSource;
    status : OwnerSendStatus;
    block : ?Nat;
    memoText : Text;
    createdAtTimeNs : Nat64;
    attempt : Nat;
    sends : Nat;
    lastError : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type OwnerSendPage = {
    items : [OwnerSendView]; // newest first
    total : Nat;
    offset : Nat;
  };

  public type TreasurySweepView = {
    status : SweepStatus;
    startedAt : ?Timestamp;
    completedAt : ?Timestamp;
    reserveTopUpE8s : Nat;
    reserveTopUpBlock : ?Nat;
    reserveTopUpMemo : ?Text;
    tokens : [SweepToken];
  };

  public type OwnerRevenueError = {
    #notAdmin;
    #anonymousOwner; // destination owner is the anonymous principal
    #invalidSubaccount; // subaccount not 32 bytes
    #contractAccount; // destination is an account of this contract
    #notConfigured; // clear on a token without destination
  };

  public type OwnerDestinationResult = Result.Result<OwnerDestinationView, OwnerRevenueError>;
};
