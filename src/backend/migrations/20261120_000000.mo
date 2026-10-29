import Map "mo:core/Map";

// Refused pair-request deposits feed the protocol liquidity.
// Adds the empty `refusedDepositFeeds` map (one record per refused pair
// request whose kept 0.0005 TTTI-T deposit was fed to the protocol liquidity).
// Requests refused before this change have no record yet, so the next
// fee-recycling pass feeds each of their deposits exactly once. Every other
// field is carried forward unchanged (never sale.reserved, ledger balances,
// blocks, pair requests, pools or positions).
module {
  type OldActor = {};

  type RefusedDepositFeed = {
    requestId : Nat;
    poolId : Nat;
    amount : Nat;
    fee : Nat;
    block : Nat;
    at : Int;
  };

  type NewActor = {
    refusedDepositFeeds : Map.Map<Nat, RefusedDepositFeed>;
  };

  public func migration(_old : OldActor) : NewActor {
    { refusedDepositFeeds = Map.empty() };
  };
};
