import Map "mo:core/Map";
import Nat "mo:core/Nat";
import CorePrincipal "mo:core/Principal";

// Buyback store reshaped from one record per purchase to records keyed by
// buyback id. Every Version 42 record is kept with all its fields, in
// purchase-id order, with purchaseId = ?purchase, percent = 100 and mass
// figures equal to that purchase's net and TTTI-T. The admin account is kept.
// The ledger, blocks, balances, conversions and every other state are not
// touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type BuybackRule = { #originalNet; #dayRate };

  type BuybackStatus = { #inProgress; #completed; #payoutFailed };

  type OldBuyback = {
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

  type OldBuybackStore = {
    records : Map.Map<Nat, OldBuyback>;
    var adminAccount : ?Account;
  };

  type NewBuyback = {
    id : Nat;
    purchaseId : ?Nat;
    buyer : CorePrincipal.Principal;
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
    amountReturned : Nat;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    payoutBlock : ?Nat;
    status : BuybackStatus;
    message : ?Text;
  };

  type NewBuybackStore = {
    records : Map.Map<Nat, NewBuyback>;
    var nextId : Nat;
    var adminAccount : ?Account;
  };

  type OldActor = { buybacks : OldBuybackStore };
  type NewActor = { buybacks : NewBuybackStore };

  public func migration(old : OldActor) : NewActor {
    let records = Map.empty<Nat, NewBuyback>();
    var nextId = 0;
    for ((_, r) in old.buybacks.records.entries()) {
      records.add(
        nextId,
        {
          id = nextId;
          purchaseId = ?r.purchaseId;
          buyer = r.buyer;
          buyerAccount = r.buyerAccount;
          timestamp = r.timestamp;
          originalToken = r.originalToken;
          tokenReturned = r.tokenReturned;
          percent = 100;
          massTotalNet = r.originalNetAmount;
          massTotalTtti = r.tttiAmount;
          massRemainingNet = r.originalNetAmount;
          massRemainingTtti = r.tttiAmount;
          originalRateUsdE8 = r.originalRateUsdE8;
          returnedRateUsdE8 = r.returnedRateUsdE8;
          rule = r.rule;
          originalNetAmount = r.originalNetAmount;
          baseAmount = r.baseAmount;
          baseAmountReturned = r.baseAmountReturned;
          buybackFee = r.buybackFee;
          thirdPartyFees = r.thirdPartyFees;
          tttiTransferFee = r.tttiTransferFee;
          amountReturned = r.amountReturned;
          tttiAmount = r.tttiAmount;
          pullBlock = r.pullBlock;
          payoutBlock = r.payoutBlock;
          status = r.status;
          message = r.message;
        },
      );
      nextId += 1;
    };
    {
      buybacks = {
        records;
        var nextId = nextId;
        var adminAccount = old.buybacks.adminAccount;
      };
    };
  };
};
