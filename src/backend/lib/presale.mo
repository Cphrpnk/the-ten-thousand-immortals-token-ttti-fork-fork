import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import Sale "../types/presale";
import Pay "../types/pay-token";
import IcrcLib "icrc";
import TreasuryLib "treasury";
import PayTokenLib "pay-token";
import OracleLib "oracle";
import CyclesReserveLib "cycles-reserve";
import CanisterInfoLib "canister-info";
import CkbtcMinterLib "ckbtc-minter";
import RetryLib "retry";

// TTTI-T sale: status, acknowledgements, delivery addresses and the balance
// snapshot export.
module {
  public type Account = Common.Account;
  public type SaleStatus = Sale.SaleStatus;
  public type TechnicalDetails = Sale.TechnicalDetails;
  public type AcknowledgementStore = Sale.AcknowledgementStore;
  public type PurchaseAcknowledgement = Sale.PurchaseAcknowledgement;
  public type AcknowledgementError = Sale.AcknowledgementError;
  public type PurchaseResult = Sale.PurchaseResult;
  public type PurchaseError = Sale.PurchaseError;
  public type DeliveryAddressResult = Sale.DeliveryAddressResult;
  public type DeliveryAddressError = Sale.DeliveryAddressError;
  public type BalanceSnapshot = Sale.BalanceSnapshot;
  public type PayTokenStatus = Sale.PayTokenStatus;
  public type PayToken = Pay.PayToken;

  // Stable sale state. `sold` = TTTI-T delivered by the sale (cumulative);
  // `reserved` = TTTI-T held for in-flight purchases (reserved before the first
  // await, released on failure, moved to `sold` on success).
  public type SaleStore = {
    var sold : Nat;
    var reserved : Nat;
    var salesPaused : Bool;
  };

  // Everything the purchase pipeline touches.
  public type PurchaseContext = {
    sale : SaleStore;
    treasury : TreasuryLib.TreasuryStore;
    ledger : IcrcLib.Ledger;
    oracle : OracleLib.OracleStore;
    tokenRates : OracleLib.TokenRateStore;
    acknowledgements : AcknowledgementStore;
    icpLedger : TreasuryLib.IcpLedger;
    canister : Principal;
    cyclesReserve : CyclesReserveLib.CyclesReserveStore;
    // Retry module context for the purchase's forward (FW) and reserve share (SH).
    transfers : RetryLib.TransferContext;
  };

  // Minimum purchase: 0.0001 TTTI-T (1.01 USD with the 1% fee in ICP, ckBTC,
  // ckUSDC or ckUSDT).
  public let MIN_PURCHASE : Nat = 10_000;
  // Base price: 1 TTTI-T = 10 000 USD.
  public let TOKEN_PRICE_USD : Nat = 10_000;

  // --- Status and switches ---------------------------------------------------

  // What can still be sold: fresh minting only, mintableRemaining - reserved
  // (saturating at 0). PTM-9b: transfer fees belong to the creator and are
  // never part of what is available.
  public func available(sale : SaleStore, ledger : IcrcLib.Ledger, canister : Principal) : Nat {
    ignore canister;
    let sellable = IcrcLib.mintableRemaining(ledger);
    if (sellable > sale.reserved) Nat.sub(sellable, sale.reserved) else 0;
  };

  // Per pay token: fee bps, minimum USD, ledger id, decimals, ledger fee,
  // treasury account configured and rate status at `now`.
  public func payTokenStatuses(_treasury : TreasuryLib.TreasuryStore, oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, now : Int) : [PayTokenStatus] {
    PayTokenLib.ALL.map(
      func token {
        let rate = OracleLib.storeFor(oracle, tokenRates, token);
        {
          token;
          symbol = PayTokenLib.symbol(token);
          ledgerCanisterId = PayTokenLib.ledgerId(token);
          decimals = PayTokenLib.expectedDecimals(token);
          ledgerFee = PayTokenLib.expectedFee(token);
          feeBps = PayTokenLib.feeBps(token);
          minimumUsdE8 = PayTokenLib.minimumUsdE8(token);
          fundsCycles = PayTokenLib.fundsCycles(token);
          // Mint revenue: 1 % of the amount paid goes to the creator after the cycles reserve.
          treasuryConfigured = true;
          priceUsdE8 = rate.usdE8;
          priceSource = rate.source;
          priceFetchedAt = rate.fetchedAt;
          priceValidUntil = rate.validUntil;
          priceUsable = OracleLib.isUsable(rate, now);
          liveRate = PayTokenLib.liveRate(token, rate.usdE8);
        };
      }
    );
  };

  public func status(sale : SaleStore, treasury : TreasuryLib.TreasuryStore, ledger : IcrcLib.Ledger, oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, canister : Principal) : SaleStatus {
    let avail = available(sale, ledger, canister);
    let now = Time.now();
    let mintable = IcrcLib.mintableRemaining(ledger);
    let ended = mintable < MIN_PURCHASE;
    {
      maxSupply = IcrcLib.getMaxSupply();
      totalSupply = IcrcLib.totalSupply(ledger);
      mintableRemaining = mintable;
      mintEnded = ended;
      remainderE8s = if ended mintable else 0;
      feeAccountBalance = IcrcLib.balanceOf(ledger, IcrcLib.feeCollectorAccount(canister));
      sold = sale.sold;
      reserved = sale.reserved;
      available = avail;
      complete = avail == 0 and sale.reserved == 0;
      minPurchase = MIN_PURCHASE;
      tokenPriceUsd = TOKEN_PRICE_USD;
      cyclesFeeBps = TreasuryLib.CYCLES_FEE_BPS;
      salesPaused = sale.salesPaused;
      priceUsdE8 = oracle.usdE8;
      priceSource = oracle.source;
      priceFetchedAt = oracle.fetchedAt;
      priceValidUntil = oracle.validUntil;
      priceUsable = OracleLib.isUsable(oracle, now);
      liveRate = PayTokenLib.liveRate(#icp, oracle.usdE8);
      payTokens = payTokenStatuses(treasury, oracle, tokenRates, now);
    };
  };

  // Static facts plus live ledger figures shown on the site.
  public func technicalDetails(ledger : IcrcLib.Ledger, canister : Principal, canisterInfo : CanisterInfoLib.CanisterInfoStore, treasury : TreasuryLib.TreasuryStore, oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore) : TechnicalDetails {
    let feeAccount = IcrcLib.feeCollectorAccount(canister);
    {
      ledgerCanisterId = canister;
      tokenName = IcrcLib.tokenName();
      tokenSymbol = IcrcLib.tokenSymbol();
      decimals = IcrcLib.decimals();
      standards = IcrcLib.supportedStandards().map(func s = s.name);
      icpLedgerCanisterId = TreasuryLib.icpLedger();
      oracleSources = [
        "Coinbase spot price for ICP-USD, BTC-USD, USDC-USD and USDT-USD (https://api.coinbase.com/v2/prices/<PAIR>/spot)",
        "CoinGecko simple price for internet-computer, bitcoin, usd-coin and tether, if Coinbase is unavailable (https://api.coingecko.com/api/v3/simple/price)",
      ];
      refreshPolicy = "The USD rate of ICP, BTC, USDC and USDT is fetched once an hour (Coinbase first, then CoinGecko) and is valid for one hour. A purchase is refused when the rate of the paid token has expired.";
      maxRateAgeSeconds = OracleLib.MAX_RATE_AGE_NS / 1_000_000_000;
      tokenPriceUsd = TOKEN_PRICE_USD;
      cyclesFeeBps = TreasuryLib.CYCLES_FEE_BPS;
      minPurchase = MIN_PURCHASE;
      smallestUnit = 1;
      roundingRule = "TTTI-T amounts are rounded down to 1 base unit (0.00000001 TTTI-T). The cost of a delivered amount is rounded up to 1 base unit of the paid token (ICP and ckBTC: 8 decimals; ckUSDC and ckUSDT: 6 decimals).";
      excessPaymentHandling = "No amount of the paid token beyond the cost of what is delivered is taken.";
      deliveryOrder = "Fresh minting first, up to the 1 TTTI-T max supply (100_000_000 base units); what can still be minted is the max supply minus the total supply. Tokens cannot be burned. Transfer fees collected in the fee account belong to the creator and are never delivered to buyers.";
      transferFee = IcrcLib.getFee(ledger);
      maxSupply = IcrcLib.getMaxSupply();
      totalSupply = IcrcLib.totalSupply(ledger);
      feeAccount;
      feeAccountBalance = IcrcLib.balanceOf(ledger, feeAccount);
      cyclesReserveAccount = CyclesReserveLib.reserveAccount(canister);
      reserveFloorE8s = CyclesReserveLib.RESERVE_FLOOR_E8S;
      reserveRule = CyclesReserveLib.RESERVE_RULE;
      controllers = canisterInfo.controllers;
      moduleHash = CanisterInfoLib.moduleHashHex(canisterInfo);
      canisterInfoFetchedAt = canisterInfo.fetchedAt;
      legacyBlockBoundary = IcrcLib.legacyBlockInfo(ledger).boundaryIndex;
      payTokens = payTokenStatuses(treasury, oracle, tokenRates, Time.now());
      ckbtcMinterId = Principal.fromText(CkbtcMinterLib.MINTER_ID);
    };
  };

  public func setSalesPaused(sale : SaleStore, paused : Bool) : () {
    sale.salesPaused := paused;
  };

  // --- One-time purchase acknowledgement -------------------------------------

  // Version of the wallet terms shown at a new acceptance (3 since PTM-11b:
  // common reserve redemption). The acceptance is one-time: a stored record of
  // ANY version counts as accepted, so a later bump never asks anyone again.
  // `version` in the record only proves which text was shown.
  public let CURRENT_ACK_VERSION : Nat = 3;

  // True when `caller` has a stored acknowledgement record of any version.
  public func hasAccepted(store : AcknowledgementStore, caller : Principal) : Bool {
    if (caller.isAnonymous()) return false;
    switch (store.get(caller)) {
      case (?_) { true };
      case null { false };
    };
  };

  // The caller's acknowledgement: accepted = true with the stored acceptedAt for
  // a record of any version (accepted = false, acceptedAt = null otherwise,
  // including anonymous callers).
  public func getAcknowledgement(store : AcknowledgementStore, caller : Principal) : PurchaseAcknowledgement {
    if (caller.isAnonymous()) {
      return { accepted = false; acceptedAt = null };
    };
    switch (store.get(caller)) {
      case (?record) { { accepted = true; acceptedAt = ?record.acceptedAt } };
      case null { { accepted = false; acceptedAt = null } };
    };
  };

  // Records the acceptance for a signed-in caller. Idempotent for a record of
  // any version (keeps the first acceptedAt and its version as the proof); a
  // new acceptance stores { acceptedAt = now; version = CURRENT_ACK_VERSION }.
  // Anonymous -> #err(#anonymousCaller).
  public func accept(store : AcknowledgementStore, caller : Principal, now : Sale.AcknowledgedAt) : { #ok : PurchaseAcknowledgement; #err : AcknowledgementError } {
    if (caller.isAnonymous()) {
      return #err(#anonymousCaller);
    };
    let at = switch (store.get(caller)) {
      case (?record) { record.acceptedAt };
      case null {
        store.add(caller, { acceptedAt = now; version = CURRENT_ACK_VERSION });
        now;
      };
    };
    #ok({ accepted = true; acceptedAt = ?at });
  };


  // --- Delivery address ------------------------------------------------------

  func addressError(code : Sale.DeliveryAddressErrorCode, message : Text) : DeliveryAddressError {
    { code; message };
  };

  func isHex(text : Text) : Bool {
    text.chars().all(func c = (c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F'));
  };

  // Validates principal text without trapping (base32 + CRC32 round-trip via
  // Principal.fromBlob(...).toText() == input). Rejects empty text, a
  // 64-hex-character legacy account identifier ("This is an account ID; please
  // paste your Principal ID instead"), invalid text and the anonymous principal.
  public func parseDeliveryAddress(text : Text) : { #ok : Principal; #err : DeliveryAddressError } {
    let trimmed = text.trim(#predicate(func c = c == ' ' or c == '\t' or c == '\n' or c == '\r'));
    if (trimmed.size() == 0) {
      return #err(addressError(#empty, "Please paste your Principal ID"));
    };
    if (trimmed.size() == 64 and isHex(trimmed)) {
      return #err(addressError(#accountIdentifier, "This is an account ID; please paste your Principal ID instead"));
    };
    let invalid = addressError(#invalidPrincipal, "This is not a valid Principal ID; please check it and paste it again");
    let lower = trimmed.toLower();

    // Base32 (RFC 4648, lowercase, no padding) decode, ignoring dashes.
    let bytes = List.empty<Nat8>();
    var buffer = 0;
    var bits = 0;
    for (c in lower.chars()) {
      if (c != '-') {
        let code = c.toNat32().toNat();
        let value : Int = if (code >= 97 and code <= 122) {
          code - 97;
        } else if (code >= 50 and code <= 55) {
          code - 24;
        } else {
          -1;
        };
        if (value < 0) {
          return #err(invalid);
        };
        buffer := buffer * 32 + value.toNat();
        bits += 5;
        if (bits >= 8) {
          let rest : Int = bits - 8;
          bits := rest.toNat();
          let divisor = 2 ** bits;
          bytes.add((buffer / divisor).toNat8());
          buffer := buffer % divisor;
        };
      };
    };
    // 4 CRC32 bytes + 1..29 principal bytes.
    if (bytes.size() < 5 or bytes.size() > 33) {
      return #err(invalid);
    };
    let body = List.empty<Nat8>();
    var index = 0;
    for (b in bytes.values()) {
      if (index >= 4) {
        body.add(b);
      };
      index += 1;
    };
    let principal = Principal.fromBlob(body.toArray().toBlob());
    // The canonical text re-encodes the CRC and dash grouping.
    if (principal.toText() != lower) {
      return #err(invalid);
    };
    if (principal.isAnonymous()) {
      return #err(addressError(#anonymousPrincipal, "The anonymous principal cannot receive TTTI-T; please paste your own Principal ID"));
    };
    #ok(principal);
  };

  // Stores { owner = parsed; subaccount = null } for `caller` (anonymous caller refused).
  public func setDeliveryAddress(addresses : Map.Map<Principal, Account>, caller : Principal, text : Text) : DeliveryAddressResult {
    if (caller.isAnonymous()) {
      return #Err(addressError(#anonymousCaller, "Please sign in to set a delivery address"));
    };
    switch (parseDeliveryAddress(text)) {
      case (#ok(owner)) {
        let account : Account = { owner; subaccount = null };
        addresses.add(caller, account);
        #Ok(account);
      };
      case (#err(err)) { #Err(err) };
    };
  };

  public func getDeliveryAddress(addresses : Map.Map<Principal, Account>, caller : Principal) : ?Account {
    addresses.get(caller);
  };

  // Returns true when an address was removed.
  public func clearDeliveryAddress(addresses : Map.Map<Principal, Account>, caller : Principal) : Bool {
    switch (addresses.take(caller)) {
      case (?_) { true };
      case null { false };
    };
  };

  // --- Balance snapshot ------------------------------------------------------

  // Built from IcrcLib.listBalances: non-zero balances, delivery address per
  // holder principal, needsMigration = no delivery address (false for the fee
  // collector, which is labeled #feeCollector).
  public func snapshot(ledger : IcrcLib.Ledger, canister : Principal, addresses : Map.Map<Principal, Account>) : BalanceSnapshot {
    let feeCollector = IcrcLib.feeCollectorAccount(canister);
    func entry(holding : IcrcLib.HolderBalance) : Sale.SnapshotEntry {
      if (holding.account == feeCollector) {
        {
          account = holding.account;
          balance = holding.balance;
          deliveryAddress = null;
          needsMigration = false;
          kind = #feeCollector;
        };
      } else {
        let deliveryAddress = addresses.get(holding.account.owner);
        {
          account = holding.account;
          balance = holding.balance;
          deliveryAddress;
          needsMigration = deliveryAddress == null;
          kind = #holder;
        };
      };
    };
    {
      exportedAt = Time.now().toNat().toNat64();
      totalSupply = IcrcLib.totalSupply(ledger);
      decimals = IcrcLib.decimals();
      holders = IcrcLib.listBalances(ledger).filter(func h = h.balance > 0).map(entry);
    };
  };
};
