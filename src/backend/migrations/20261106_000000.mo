import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import CorePrincipal "mo:core/Principal";
import Text "mo:core/Text";

// Common transfer retry (lot 2). Adds the retry store (global counter n and
// the recorded FW / SH attempts) and the #needsReview status.
// Forwards and reserve shares: old #pending -> #needsReview; old #failed with
// a ledger Err text -> #pending (a new attempt, recorded and sent by the
// timer); every other old #failed -> #needsReview. A forward whose amount
// does not cover the ledger fee -> #notRequired. Ledger, blocks, balances,
// purchases, buybacks, stored rates and the cycles reserve balance are not
// touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type ConversionStatus = { #completed; #failed; #refunded; #refundFailed };

  type OldForwardStatus = {
    #notRequired;
    #pending;
    #forwarded : Nat;
    #failed : Text;
  };

  type NewForwardStatus = {
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
    status : ConversionStatus;
    timestamp : Nat64;
    priceUsdE8 : Nat;
    usedFallback : Bool;
    minted : Nat;
    fromCollector : Nat;
    forward : OldForwardStatus;
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
    status : ConversionStatus;
    timestamp : Nat64;
    priceUsdE8 : Nat;
    usedFallback : Bool;
    minted : Nat;
    fromCollector : Nat;
    forward : NewForwardStatus;
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

  type TopUpStatus = {
    #transferred;
    #notified : { cycles : Nat };
    #failed : Text;
  };

  type TopUpRecord = {
    timestamp : Int;
    icpE8s : Nat;
    blockIndex : Nat;
    status : TopUpStatus;
    lastError : ?Text;
  };

  type ReserveWithdrawal = {
    timestamp : Int;
    amountE8s : Nat;
    blockIndex : Nat;
  };

  type OldReserveTransferStatus = {
    #pending;
    #transferred : Nat;
    #failed : Text;
  };

  type NewReserveTransferStatus = {
    #pending;
    #transferred : Nat;
    #failed : Text;
    #needsReview;
  };

  type OldReserveShare = {
    conversionId : Nat;
    shareE8s : Nat;
    treasuryE8s : Nat;
    transfer : OldReserveTransferStatus;
  };

  type NewReserveShare = {
    conversionId : Nat;
    shareE8s : Nat;
    treasuryE8s : Nat;
    transfer : NewReserveTransferStatus;
  };

  type OldCyclesReserveStore = {
    var reserveBalanceE8s : Nat;
    var lastTopUp : ?TopUpRecord;
    withdrawals : List.List<ReserveWithdrawal>;
    shares : Map.Map<Nat, OldReserveShare>;
  };

  type NewCyclesReserveStore = {
    var reserveBalanceE8s : Nat;
    var lastTopUp : ?TopUpRecord;
    withdrawals : List.List<ReserveWithdrawal>;
    shares : Map.Map<Nat, NewReserveShare>;
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

  type RetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
  };

  type OldActor = {
    treasury : OldTreasuryStore;
    cyclesReserve : OldCyclesReserveStore;
  };

  type NewActor = {
    treasury : NewTreasuryStore;
    cyclesReserve : NewCyclesReserveStore;
    retry : RetryStore;
  };

  // A rejected ledger call ("could not be reached") has an unknown outcome;
  // "does not cover" is a pre-check, nothing was sent. Any other #failed text
  // is a ledger Err.
  func isUnreached(t : Text) : Bool = t.contains(#text "could not be reached");

  func isZeroAmount(t : Text) : Bool = t.contains(#text "does not cover");

  func ledgerFee(token : PayToken) : Nat {
    switch (token) {
      case (#icp) { 10_000 };
      case (#ckbtc) { 10 };
      case (#ckusdc) { 10_000 };
      case (#ckusdt) { 10_000 };
    };
  };

  public func migration(old : OldActor) : NewActor {
    let oldShares = old.cyclesReserve.shares;

    func forwardBase(c : OldConversion) : Nat {
      switch (oldShares.get(c.id)) {
        case (?s) { s.treasuryE8s };
        case null {
          switch (c.payToken) {
            case (#icp) { c.icpAmount };
            case (_) { c.payAmount };
          };
        };
      };
    };

    let conversions = old.treasury.conversions.map<Nat, OldConversion, NewConversion>(
      func(_, c) {
        let zero = forwardBase(c) <= ledgerFee(c.payToken);
        let forward : NewForwardStatus = switch (c.forward) {
          case (#notRequired) { #notRequired };
          case (#forwarded(block)) { #forwarded(block) };
          case (#pending) { if (zero) #notRequired else #needsReview };
          case (#failed(t)) {
            if (zero or isZeroAmount(t)) #notRequired
            else if (isUnreached(t)) #needsReview
            else #pending;
          };
        };
        { c with forward };
      }
    );

    let shares = oldShares.map<Nat, OldReserveShare, NewReserveShare>(
      func(_, s) {
        let transfer : NewReserveTransferStatus = switch (s.transfer) {
          case (#transferred(block)) { #transferred(block) };
          case (#pending) { #needsReview };
          case (#failed(t)) {
            if (isUnreached(t) or isZeroAmount(t)) #needsReview else #pending;
          };
        };
        { s with transfer };
      }
    );

    {
      treasury = {
        var config = old.treasury.config;
        var conversions = conversions;
        var nextConversionId = old.treasury.nextConversionId;
        var depositRecipients = old.treasury.depositRecipients;
        var tokenAccounts = old.treasury.tokenAccounts;
      };
      cyclesReserve = {
        var reserveBalanceE8s = old.cyclesReserve.reserveBalanceE8s;
        var lastTopUp = old.cyclesReserve.lastTopUp;
        withdrawals = old.cyclesReserve.withdrawals;
        shares;
      };
      retry = {
        var nextN = 0;
        forwards = Map.empty();
        shares = Map.empty();
      };
    };
  };
};
