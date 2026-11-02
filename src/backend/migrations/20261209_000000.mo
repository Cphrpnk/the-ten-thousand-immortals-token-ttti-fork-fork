import List "mo:core/List";

// PTM-10a: pools-to-capitalisation ratio samples. Purely additive: adds the
// stable field `poolCapRatioSamples` with an empty sample list. Every existing
// field is carried forward unchanged; sale.reserved, balances, blocks, pools,
// positions, price samples, the ledger and its stored fee are never touched.
module {
  type PoolCapRatioSample = {
    at : Int;
    ratio : Nat;
  };

  type PoolCapRatioStore = {
    samples : List.List<PoolCapRatioSample>;
  };

  type OldActor = {};

  type NewActor = {
    poolCapRatioSamples : PoolCapRatioStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      poolCapRatioSamples = {
        samples = List.empty();
      };
    };
  };
};
