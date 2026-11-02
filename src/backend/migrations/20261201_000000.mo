import List "mo:core/List";

// PTM-5: consolidated TTTI-T price samples. Purely additive: adds the stable
// field `consolidatedPrices` with an empty sample list. Every existing field
// is carried forward unchanged; sale.reserved, balances, blocks, pools,
// positions, price samples, the ledger and its stored fee are never touched.
module {
  type ConsolidatedSample = {
    at : Int;
    priceUsdE8 : Nat;
  };

  type ConsolidatedPriceStore = {
    samples : List.List<ConsolidatedSample>;
  };

  type OldActor = {};

  type NewActor = {
    consolidatedPrices : ConsolidatedPriceStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      consolidatedPrices = {
        samples = List.empty();
      };
    };
  };
};
