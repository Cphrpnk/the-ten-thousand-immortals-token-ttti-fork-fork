// PTM-10d: adds the stable field `secondRates` (the other feed's rate per pay
// token), all empty. Purely additive: every existing field, including the
// stored rates, balances, blocks and sale.reserved, is carried forward
// untouched.
module {
  type PriceSource = { #none; #coinbase; #coingecko };

  type SecondSourceObservation = {
    source : PriceSource;
    usdE8 : Nat;
    fetchedAt : Int;
  };

  type SecondRateStore = {
    var icp : ?SecondSourceObservation;
    var ckbtc : ?SecondSourceObservation;
    var ckusdc : ?SecondSourceObservation;
    var ckusdt : ?SecondSourceObservation;
  };

  type OldActor = {};

  type NewActor = {
    secondRates : SecondRateStore;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      secondRates = {
        var icp = null;
        var ckbtc = null;
        var ckusdc = null;
        var ckusdt = null;
      };
    };
  };
};
