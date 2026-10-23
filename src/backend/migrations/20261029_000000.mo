import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Purchase quantities: every existing conversion gains feeAmount, netAmount,
// paymentBlock and mintBlock = null; all other values are kept as they are.
// The ledger, blocks, balances, total supply, btcDeposits and every other
// state are not touched.
module {
  type Account = {
    owner : CorePrincipal.Principal;
    subaccount : ?Blob;
  };

  type ConversionStatus = { #completed; #failed; #refunded; #refundFailed };

  type ForwardStatus = {
    #notRequired;
    #pending;
    #forwarded : Nat;
    #failed : Text;
  };

  type TreasuryConfig = { icpAccount : Account };

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

  type TokenAccounts = {
    ckbtc : ?Account;
    ckusdc : ?Account;
    ckusdt : ?Account;
  };

  // --- Old state -------------------------------------------------------------

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
    forward : ForwardStatus;
    message : ?Text;
  };

  type OldTreasury = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, OldConversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<CorePrincipal.Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

  type OldActor = {
    treasury : OldTreasury;
  };

  // --- New state -------------------------------------------------------------

  type Conversion = {
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
    forward : ForwardStatus;
    message : ?Text;
    feeAmount : ?Nat;
    netAmount : ?Nat;
    paymentBlock : ?Nat;
    mintBlock : ?Nat;
  };

  type Treasury = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, Conversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<CorePrincipal.Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

  type NewActor = {
    treasury : Treasury;
  };

  // --- Migration -------------------------------------------------------------

  public func migration(old : OldActor) : NewActor {
    let t = old.treasury;
    let conversions = t.conversions.map<Nat, OldConversion, Conversion>(
      func(_, c) = {
        c with
        feeAmount = null;
        netAmount = null;
        paymentBlock = null;
        mintBlock = null;
      }
    );
    {
      treasury = {
        var config = t.config;
        var conversions = conversions;
        var nextConversionId = t.nextConversionId;
        var depositRecipients = t.depositRecipients;
        var tokenAccounts = t.tokenAccounts;
      };
    };
  };
};
