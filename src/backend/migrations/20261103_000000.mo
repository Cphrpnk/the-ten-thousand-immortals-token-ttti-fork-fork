import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Adds the TTTI-T buyback store (empty, no admin account). The ledger, blocks,
// balances, conversions, treasury, stored rates, cycles reserve, address book,
// acknowledgements and every other state are not touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type BuybackRule = { #originalNet; #dayRate };

  type BuybackStatus = { #inProgress; #completed; #payoutFailed };

  type Buyback = {
    purchaseId : Nat;
    buyer : CorePrincipal.Principal;
    buyerAccount : Account;
    timestamp : Int;
    originalToken : PayToken;
    tokenReturned : PayToken;
    originalRateUsdE8 : Nat;
    returnedRateUsdE8 : Nat;
    rule : BuybackRule;
    originalNetAmount : Nat;
    baseAmount : Nat;
    baseAmountReturned : Nat;
    buybackFee : Nat;
    thirdPartyFees : Nat;
    tttiTransferFee : Nat;
    amountReturned : Nat;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    payoutBlock : ?Nat;
    status : BuybackStatus;
    message : ?Text;
  };

  type BuybackStore = {
    records : Map.Map<Nat, Buyback>;
    var adminAccount : ?Account;
  };

  type OldActor = {};
  type NewActor = { buybacks : BuybackStore };

  public func migration(_ : OldActor) : NewActor {
    {
      buybacks = {
        records = Map.empty();
        var adminAccount = null;
      };
    };
  };
};
