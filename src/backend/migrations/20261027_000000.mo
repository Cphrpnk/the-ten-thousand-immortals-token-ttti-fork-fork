import Map "mo:core/Map";
import CorePrincipal "mo:core/Principal";

// Multi-token purchases: every existing conversion gains payToken = #icp,
// payAmount = icpAmount and feeBps = 100 (nothing else changed); the treasury
// gains per-ck-token receiving accounts (all unset); the BTC/USDC/USDT rate
// stores start empty. Ledger, acknowledgements, delivery addresses, the
// stored ICP rate and the cycles reserve are not touched.
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

  // --- Old state -------------------------------------------------------------

  type OldConversion = {
    id : Nat;
    depositor : CorePrincipal.Principal;
    recipient : Account;
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
  };

  type OldActor = {
    treasury : OldTreasury;
  };

  // --- New state -------------------------------------------------------------

  type PayToken = { #icp; #ckbtc; #ckusdc; #ckusdt };

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
  };

  type TokenAccounts = {
    ckbtc : ?Account;
    ckusdc : ?Account;
    ckusdt : ?Account;
  };

  type Treasury = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, Conversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<CorePrincipal.Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

  type PriceSource = { #none; #coinbase; #coingecko };

  type PriceError = { message : Text; at : Int };

  type RateStore = {
    var usdE8 : Nat;
    var source : PriceSource;
    var fetchedAt : Int;
    var validUntil : Int;
    var lastError : ?PriceError;
    var lastSuccessAt : ?Int;
  };

  type TokenRateStore = {
    ckbtc : RateStore;
    ckusdc : RateStore;
    ckusdt : RateStore;
  };

  type NewActor = {
    treasury : Treasury;
    tokenRates : TokenRateStore;
  };

  // --- Migration -------------------------------------------------------------

  func emptyRate() : RateStore {
    {
      var usdE8 = 0;
      var source = #none;
      var fetchedAt = 0;
      var validUntil = 0;
      var lastError = null;
      var lastSuccessAt = null;
    };
  };

  public func migration(old : OldActor) : NewActor {
    let t = old.treasury;
    let conversions = t.conversions.map<Nat, OldConversion, Conversion>(
      func(_, c) = { c with payToken = #icp; payAmount = c.icpAmount; feeBps = 100 }
    );
    {
      treasury = {
        var config = t.config;
        var conversions = conversions;
        var nextConversionId = t.nextConversionId;
        var depositRecipients = t.depositRecipients;
        var tokenAccounts = { ckbtc = null; ckusdc = null; ckusdt = null };
      };
      tokenRates = {
        ckbtc = emptyRate();
        ckusdc = emptyRate();
        ckusdt = emptyRate();
      };
    };
  };
};
