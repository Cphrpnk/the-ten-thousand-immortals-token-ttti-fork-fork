import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import CorePrincipal "mo:core/Principal";

// Escrowed buyback (lot 5). Adds to every buyback record the second TTTI-T
// fee (0), the payout attempts, the release and cancel blocks (null) and the
// legacy flag (true: these TTTI-T went straight to the admin). BuybackStatus
// gains #cancelled. Legacy #inProgress records with a pull block and legacy
// #payoutFailed records get one legacy payout attempt (attempt 0, no memo,
// created_at_time = record time, a fresh global n): #unknown for an
// in-progress pull or an ambiguous / missing message, #failed for a known
// ledger Err; those #inProgress records become #payoutFailed. The ledger,
// blocks, balances, amounts and every other field are not touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
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

  type TransferAttempt = {
    n : Nat;
    attempt : Nat;
    memo : Blob;
    created_at_time : Nat64;
    request : TransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  type CollectState = { #confirmed; #unknown };

  type PurchaseTrace = {
    n : Nat;
    buyer : CorePrincipal.Principal;
    token : PayToken;
    amount : Nat;
    reserved : Nat;
    created_at_time : Nat64;
    memo : Blob;
  };

  type PaymentToRefund = {
    n : Nat;
    buyer : CorePrincipal.Principal;
    token : PayToken;
    amount : Nat;
    reserved : Nat;
    created_at_time : Nat64;
    memo : Blob;
    collect : CollectState;
    block : ?Nat;
    detectedAt : Int;
  };

  type BtcCostSend = {
    buyer : CorePrincipal.Principal;
    depositIndex : Nat;
    conversionId : ?Nat;
    attempt : TransferAttempt;
  };

  type RetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
    refunds : Map.Map<Nat, TransferAttempt>;
    traces : Map.Map<Nat, PurchaseTrace>;
    toRefund : Map.Map<Nat, PaymentToRefund>;
    btcCosts : Map.Map<Nat, BtcCostSend>;
  };

  type BuybackRule = { #originalNet; #dayRate };

  type OldBuybackStatus = { #inProgress; #completed; #payoutFailed };

  type NewBuybackStatus = { #inProgress; #completed; #payoutFailed; #cancelled };

  type BuybackPayoutAttempt = {
    from : Account;
    attempt : TransferAttempt;
  };

  type OldBuyback = {
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
    status : OldBuybackStatus;
    message : ?Text;
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
    tttiEscrowFee : Nat;
    amountReturned : Nat;
    tttiAmount : Nat;
    pullBlock : ?Nat;
    payoutBlock : ?Nat;
    payoutAttempts : [BuybackPayoutAttempt];
    releaseBlock : ?Nat;
    cancelBlock : ?Nat;
    legacy : Bool;
    status : NewBuybackStatus;
    message : ?Text;
  };

  type OldBuybackStore = {
    records : Map.Map<Nat, OldBuyback>;
    var nextId : Nat;
    var adminAccount : ?Account;
  };

  type NewBuybackStore = {
    records : Map.Map<Nat, NewBuyback>;
    var nextId : Nat;
    var adminAccount : ?Account;
  };

  type OldActor = {
    retry : RetryStore;
    buybacks : OldBuybackStore;
  };

  type NewActor = {
    retry : RetryStore;
    buybacks : NewBuybackStore;
  };

  // Same rule as RetryLib.ambiguousFailure: "ledger rejected the " texts are
  // known Errs; any other "rejected", "could not be reached", "interrupted"
  // or a missing message is an unknown outcome.
  func ambiguous(message : ?Text) : Bool {
    switch (message) {
      case (?m) {
        m.contains(#text "could not be reached") or m.contains(#text "interrupted") or (m.contains(#text "rejected") and not m.contains(#text "ledger rejected the "));
      };
      case null { true };
    };
  };

  func legacyAttempt(retry : RetryStore, funder : ?Account, r : OldBuyback, outcome : AttemptOutcome) : BuybackPayoutAttempt {
    let n = retry.nextN;
    retry.nextN += 1;
    {
      // Buybacks could only be requested with the admin account set.
      from = funder ?? r.buyerAccount;
      attempt = {
        n;
        attempt = 0;
        memo = "" : Blob;
        created_at_time = if (r.timestamp > 0) { r.timestamp.toNat().toNat64() } else { 0 : Nat64 };
        request = {
          token = r.tokenReturned;
          from_subaccount = null;
          to = r.buyerAccount;
          amount = r.amountReturned;
          fee = ?r.thirdPartyFees;
        };
        sends = 1;
        lastError = r.message;
        outcome;
      };
    };
  };

  func migrateRecord(retry : RetryStore, funder : ?Account, r : OldBuyback) : NewBuyback {
    let (status, payoutAttempts) : (NewBuybackStatus, [BuybackPayoutAttempt]) = switch (r.status) {
      case (#completed) { (#completed, []) };
      case (#inProgress) {
        if (r.pullBlock == null) { (#inProgress, []) } else {
          (#payoutFailed, [legacyAttempt(retry, funder, r, #unknown)]);
        };
      };
      case (#payoutFailed) {
        let outcome : AttemptOutcome = if (ambiguous(r.message)) #unknown else #failed(r.message ?? "");
        (#payoutFailed, [legacyAttempt(retry, funder, r, outcome)]);
      };
    };
    {
      r with
      status;
      payoutAttempts;
      tttiEscrowFee = 0;
      releaseBlock = null : ?Nat;
      cancelBlock = null : ?Nat;
      legacy = true;
    };
  };

  public func migration(old : OldActor) : NewActor {
    let funder = old.buybacks.adminAccount;
    let records = old.buybacks.records.map<Nat, OldBuyback, NewBuyback>(func(_, r) = migrateRecord(old.retry, funder, r));
    {
      retry = old.retry;
      buybacks = {
        records;
        var nextId = old.buybacks.nextId;
        var adminAccount = old.buybacks.adminAccount;
      };
    };
  };
};
