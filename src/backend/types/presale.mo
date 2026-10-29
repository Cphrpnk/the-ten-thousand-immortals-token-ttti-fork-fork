import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Common "common";
import Oracle "oracle";
import Treasury "treasury";
import Pay "pay-token";

module {
  public type Account = Common.Account;
  public type Timestamp = Common.Timestamp;
  public type Conversion = Treasury.Conversion;
  public type PayToken = Pay.PayToken;

  // --- Per pay token figures (SaleStatus and TechnicalDetails) ---------------

  public type PayTokenStatus = {
    token : PayToken;
    symbol : Text; // "ICP", "ckBTC", "ckUSDC", "ckUSDT"
    ledgerCanisterId : Principal;
    decimals : Nat8; // expected ledger decimals (checked at purchase)
    ledgerFee : Nat; // expected ledger transfer fee, token base units
    feeBps : Nat; // 100 (1%) for every pay token
    minimumUsdE8 : Nat; // minimum purchase, fee included: 1.01 USD * 10^8
    buyerPriceUsd : Nat; // 10_100 USD per whole TTTI-T for every pay token
    fundsCycles : Bool; // true only for ICP
    treasuryConfigured : Bool; // receiving account set
    priceUsdE8 : Nat; // USD per whole token * 10^8, 0 = no rate
    priceSource : Oracle.PriceSource;
    priceFetchedAt : Oracle.Timestamp;
    priceValidUntil : Oracle.Timestamp;
    priceUsable : Bool;
    liveRate : ?Nat; // TTTI-T base units per whole token, fee included
  };

  // --- Sale status -----------------------------------------------------------

  // All TTTI-T amounts are base units (8 decimals, 1 TTTI-T = 100_000_000).
  // `mintableRemaining` = max(0, maxSupply - totalSupply) (fresh minting left;
  // tokens cannot be burned, so total supply never decreases).
  // `available` = mintableRemaining + feeAccountBalance - reserved: what can
  // still be sold (fee-account tokens are sold only after the mint cap).
  // `complete` = available == 0 and nothing is reserved.
  public type SaleStatus = {
    maxSupply : Nat; // 100_000_000 (1 TTTI-T)
    totalSupply : Nat;
    mintableRemaining : Nat;
    feeAccountBalance : Nat;
    sold : Nat; // delivered by the sale (cumulative)
    reserved : Nat; // held for in-flight purchases
    available : Nat;
    complete : Bool;
    minPurchase : Nat; // 10_000 (0.0001 TTTI-T)
    tokenPriceUsd : Nat; // 10_000 USD per whole TTTI-T (base price)
    cyclesFeeBps : Nat; // 100 = fixed 1% fee on ICP purchases, share kept for cycles
    buyerPriceUsd : Nat; // 10_100 USD per whole TTTI-T (base price + 1% fee)
    salesPaused : Bool;
    // The stored hourly ICP/USD rate, exactly the one convertDeposit applies.
    priceUsdE8 : Nat; // ICP/USD * 10^8, 0 = no rate
    priceSource : Oracle.PriceSource;
    priceFetchedAt : Oracle.Timestamp; // nanoseconds (Int), 0 = never
    priceValidUntil : Oracle.Timestamp; // fetchedAt + 1 h, nanoseconds (Int), 0 = never
    priceUsable : Bool; // rate exists and now <= validUntil + 5 minutes
    liveRate : ?Nat; // TTTI-T base units per whole ICP at the stored rate, fee included
    payTokens : [PayTokenStatus]; // #icp, #ckbtc, #ckusdc, #ckusdt
  };

  // --- One-time purchase acknowledgement -------------------------------------

  // Nanoseconds since epoch (Time.now()).
  public type AcknowledgedAt = Int;

  // When the caller accepted the purchase acknowledgements and which terms
  // version (records from before versioning are version 1).
  public type AcknowledgementRecord = {
    acceptedAt : AcknowledgedAt;
    version : Nat;
  };

  // Per principal: the caller's latest acceptance of the purchase acknowledgements.
  public type AcknowledgementStore = Map.Map<Principal, AcknowledgementRecord>;

  public type PurchaseAcknowledgement = {
    accepted : Bool;
    acceptedAt : ?AcknowledgedAt; // null when not accepted
  };

  public type AcknowledgementError = {
    #anonymousCaller;
  };

  // --- Technical details (public) ---------------------------------------------

  public type TechnicalDetails = {
    ledgerCanisterId : Principal; // this canister
    tokenName : Text; // "TTTI-T"
    tokenSymbol : Text; // "TTTI-T"
    decimals : Nat8; // 8
    standards : [Text]; // ICRC-1, ICRC-2, ICRC-3, ICRC-10
    icpLedgerCanisterId : Principal; // ryjl3-tyaaa-aaaaa-aaaba-cai
    oracleSources : [Text]; // Coinbase spot, CoinGecko backup (ICP, BTC, USDC, USDT)
    refreshPolicy : Text; // hourly rate, valid for one hour
    maxRateAgeSeconds : Nat; // 300
    tokenPriceUsd : Nat; // 10_000
    cyclesFeeBps : Nat; // 100 (ICP purchases)
    buyerPriceUsd : Nat; // 10_100
    minPurchase : Nat; // 10_000 base units
    smallestUnit : Nat; // 1 base unit = 0.00000001 TTTI-T
    roundingRule : Text;
    excessPaymentHandling : Text;
    deliveryOrder : Text;
    transferFee : Nat; // current transfer fee, base units
    maxSupply : Nat;
    totalSupply : Nat;
    feeAccount : Account;
    feeAccountBalance : Nat;
    cyclesReserveAccount : Account; // this canister + CYCLES_RESERVE subaccount
    reserveFloorE8s : Nat; // 200_000_000 (2 ICP) always kept for cycles
    reserveRule : Text;
    // From the management canister's canister_info (cached; null until read).
    controllers : ?[Principal];
    moduleHash : ?Text; // lowercase hex SHA-256 of the installed Wasm
    canisterInfoFetchedAt : ?Int; // nanoseconds, last successful read
    // Blocks with index < legacyBlockBoundary come from earlier test versions (4 decimals).
    legacyBlockBoundary : Nat;
    payTokens : [PayTokenStatus]; // #icp, #ckbtc, #ckusdc, #ckusdt
    // ckBTC minter used for native BTC deposits (BTC -> ckBTC [-> TTTI-T]).
    ckbtcMinterId : Principal;
  };

  // --- Purchase pipeline -----------------------------------------------------

  public type PurchaseErrorCode = {
    #anonymousCaller;
    // The caller already has a purchase in flight (any token); refused
    // immediately, with no external call.
    #purchaseInProgress;
    #acknowledgementRequired; // the current version of the six purchase acknowledgements is not accepted
    #notConfigured; // ICP treasury account not set
    #tokenNotConfigured : { token : PayToken }; // receiving account of this ck token not set
    // No receiving wallet configured by the admin for this token (BTC: the
    // ckBTC wallet); refused before any funds are taken.
    #receivingWalletNotConfigured : { token : PayToken };
    // icrc1_decimals / icrc1_fee of the ledger differ from the expected values.
    #ledgerMismatch : { token : PayToken; expectedDecimals : Nat8; actualDecimals : Nat8; expectedFee : Nat; actualFee : Nat };
    #salesPaused; // "Sales are paused"
    #saleComplete; // "TTTI-T sale complete: no TTTI-T left to sell"
    #invalidAmount;
    #belowMinimum : { minimumTtti : Nat; requestedTtti : Nat };
    // maximumPayAmount in the token's base units.
    #aboveRemaining : { token : PayToken; maximumTtti : Nat; maximumPayAmount : Nat; requestedTtti : Nat };
    // No stored USD rate for the token, or past validUntil + 5 minutes; nothing taken.
    #priceUnavailable : { token : PayToken };
    #approvalMissing : { token : PayToken; allowance : Nat };
    #insufficientBalance : { token : PayToken; balance : Nat };
    #ledgerError : { token : PayToken }; // any other ledger error or rejected call
    #deliveryFailedRefunded;
    #deliveryFailedRefundFailed;
  };

  // `message` is the user-facing text. `conversion` is the recorded conversion
  // when one was written (failed / refunded / refundFailed), otherwise null.
  public type PurchaseError = {
    code : PurchaseErrorCode;
    message : Text;
    conversion : ?Conversion;
  };

  public type PurchaseResult = {
    #Ok : Conversion;
    #Err : PurchaseError;
  };

  // --- Delivery address ------------------------------------------------------

  public type DeliveryAddressErrorCode = {
    #anonymousCaller;
    #empty;
    #accountIdentifier; // "This is an account ID; please paste your Principal ID instead"
    #invalidPrincipal;
    #anonymousPrincipal;
  };

  public type DeliveryAddressError = {
    code : DeliveryAddressErrorCode;
    message : Text;
  };

  public type DeliveryAddressResult = {
    #Ok : Account;
    #Err : DeliveryAddressError;
  };

  // --- Balance snapshot export -----------------------------------------------

  public type HolderKind = {
    #holder;
    #feeCollector;
  };

  // `needsMigration` is true when the holder principal has no delivery address
  // (always false for the fee collector).
  public type SnapshotEntry = {
    account : Account;
    balance : Nat;
    deliveryAddress : ?Account;
    needsMigration : Bool;
    kind : HolderKind;
  };

  public type BalanceSnapshot = {
    exportedAt : Timestamp; // nanoseconds
    totalSupply : Nat;
    decimals : Nat8;
    holders : [SnapshotEntry]; // non-zero balances only
  };
};
