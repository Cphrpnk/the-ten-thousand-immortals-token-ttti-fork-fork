import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import CorePrincipal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

// Purchase traces and refunds (lot 3). Adds to the retry store the purchase
// refund attempts (RF, keyed by purchase id), the active purchase traces (PC)
// and the payments to refund (both keyed by the trace number n), all empty
// except the RF attempts below; adds the #refundReview conversion status.
// Old #refundFailed purchases whose refund got a ledger Err -> a pending RF
// attempt (memo TTTI-RF-<n>, sent by the timer), status kept #refundFailed;
// every other old #refundFailed (unreached ledger, amount below the fee, BTC
// path) -> #refundReview. Ledger, blocks, balances, conversion amounts,
// forwards, shares, buybacks, stored rates and the cycles reserve are not
// touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type OldConversionStatus = { #completed; #failed; #refunded; #refundFailed };

  type NewConversionStatus = {
    #completed;
    #failed;
    #refunded;
    #refundFailed;
    #refundReview;
  };

  type ForwardStatus = {
    #notRequired;
    #pending;
    #forwarded : Nat;
    #failed : Text;
    #needsReview;
  };

  type OldConversion = {
    id : Nat;
    depositor : CorePrincipal.Principal;
    recipient : Account;
    payToken : PayToken;
    payAmount : Nat;
    feeBps : Nat;
    icpAmount : Nat;
    tttiAmount : Nat;
    status : OldConversionStatus;
    timestamp : Nat64;
    priceUsdE8 : Nat;
    usedFallback : Bool;
    minted : Nat;
    fromCollector : Nat;
    forward : ForwardStatus;
    message : ?Text;
    feeAmount : ?Nat;
    netAmount : ?Nat;
    paymentBlock : ?Nat;
    mintBlock : ?Nat;
  };

  type NewConversion = {
    id : Nat;
    depositor : CorePrincipal.Principal;
    recipient : Account;
    payToken : PayToken;
    payAmount : Nat;
    feeBps : Nat;
    icpAmount : Nat;
    tttiAmount : Nat;
    status : NewConversionStatus;
    timestamp : Nat64;
    priceUsdE8 : Nat;
    usedFallback : Bool;
    minted : Nat;
    fromCollector : Nat;
    forward : ForwardStatus;
    message : ?Text;
    feeAmount : ?Nat;
    netAmount : ?Nat;
    paymentBlock : ?Nat;
    mintBlock : ?Nat;
  };

  type TreasuryConfig = { icpAccount : Account };

  type TokenAccounts = {
    ckbtc : ?Account;
    ckusdc : ?Account;
    ckusdt : ?Account;
  };

  type OldTreasuryStore = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, OldConversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<CorePrincipal.Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

  type NewTreasuryStore = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, NewConversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<CorePrincipal.Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

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

  type OldRetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
  };

  type NewRetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
    refunds : Map.Map<Nat, TransferAttempt>;
    traces : Map.Map<Nat, PurchaseTrace>;
    toRefund : Map.Map<Nat, PaymentToRefund>;
  };

  type OldActor = {
    treasury : OldTreasuryStore;
    retry : OldRetryStore;
  };

  type NewActor = {
    treasury : NewTreasuryStore;
    retry : NewRetryStore;
  };

  func ledgerFee(token : PayToken) : Nat {
    switch (token) {
      case (#icp) { 10_000 };
      case (#ckbtc) { 10 };
      case (#ckusdc) { 10_000 };
      case (#ckusdt) { 10_000 };
    };
  };

  // The non-BTC path wrote "... refund also failed (<reason>) ..."; a reason
  // "could not be reached" is an unknown outcome and "does not cover" a
  // pre-check (nothing sent). Any other reason is a ledger Err. The BTC path
  // never wrote "refund also failed".
  func refundLedgerErr(message : ?Text) : Bool {
    switch (message) {
      case (?t) {
        t.contains(#text "refund also failed") and not t.contains(#text "could not be reached") and not t.contains(#text "does not cover");
      };
      case null { false };
    };
  };

  public func migration(old : OldActor) : NewActor {
    let now : Nat64 = Time.now().toNat().toNat64();
    let counter = { var nextN = old.retry.nextN };
    let refunds = Map.empty<Nat, TransferAttempt>();
    let conversions = Map.empty<Nat, NewConversion>();

    for ((id, c) in old.treasury.conversions.entries()) {
      let status : NewConversionStatus = switch (c.status) {
        case (#completed) { #completed };
        case (#failed) { #failed };
        case (#refunded) { #refunded };
        case (#refundFailed) {
          let fee = ledgerFee(c.payToken);
          if (refundLedgerErr(c.message) and c.payAmount > fee) {
            let n = counter.nextN;
            counter.nextN += 1;
            refunds.add(
              id,
              {
                n;
                attempt = 1;
                memo = ("TTTI-RF-" # n.toText()).encodeUtf8();
                created_at_time = now;
                request = {
                  token = c.payToken;
                  from_subaccount = null;
                  to = { owner = c.depositor; subaccount = null };
                  amount = Nat.sub(c.payAmount, fee);
                  fee = ?fee;
                };
                sends = 0;
                lastError = null;
                outcome = #pending;
              },
            );
            #refundFailed;
          } else {
            #refundReview;
          };
        };
      };
      conversions.add(id, { c with status });
    };

    {
      treasury = {
        var config = old.treasury.config;
        var conversions = conversions;
        var nextConversionId = old.treasury.nextConversionId;
        var depositRecipients = old.treasury.depositRecipients;
        var tokenAccounts = old.treasury.tokenAccounts;
      };
      retry = {
        var nextN = counter.nextN;
        forwards = old.retry.forwards;
        shares = old.retry.shares;
        refunds;
        traces = Map.empty();
        toRefund = Map.empty();
      };
    };
  };
};
