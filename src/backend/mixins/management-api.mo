import Token "../types/token";
import IcrcLib "../lib/icrc";

// Ledger management. There is no mint and no burn method: TTTI-T is created
// only by the sale purchase pipeline, capped at the max supply, and tokens
// cannot be burned. The transfer fee is fixed and cannot be changed.
mixin (ledger : IcrcLib.Ledger) {
  // Fixed fee: min and max both equal get_fee().
  public query func get_fee_bounds() : async Token.FeeBounds {
    IcrcLib.feeBounds();
  };

  public query func get_fee() : async Nat {
    IcrcLib.getFee(ledger);
  };

  public query func get_max_supply() : async Nat {
    IcrcLib.getMaxSupply();
  };
};
