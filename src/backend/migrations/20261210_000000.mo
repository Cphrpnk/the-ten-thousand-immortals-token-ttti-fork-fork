import Map "mo:core/Map";

// PTM-10c: pair request deposits paid in an accepted token. Purely additive:
// adds the stable field `requestPayments` (empty). A pair request without a
// record keeps its TTTI-T deposit, so earlier requests are refunded or kept as
// before. Every existing field is carried forward unchanged; sale.reserved,
// balances, blocks, pools, positions, refusedDepositFeeds and the ledger are
// never touched.
module {
  type DexToken = { #tttiT; #icp; #ckbtc; #ckusdc; #ckusdt };

  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type DexTransferRequest = {
    token : DexToken;
    from : Account;
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

  type PairPayDeposit = {
    requestId : Nat;
    token : DexToken;
    setAside : ?DexTransferAttempt;
    setAsideAt : ?Int;
  };

  type OldActor = {};

  type NewActor = {
    requestPayments : Map.Map<Nat, PairPayDeposit>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      requestPayments = Map.empty();
    };
  };
};
