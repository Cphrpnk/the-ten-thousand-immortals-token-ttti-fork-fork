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

// TTTI-T sale: status, buy-to-mint purchase pipeline, delivery addresses and
// the balance snapshot export.
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
  };

  // Minimum purchase: 0.0001 TTTI-T (1.01 USD with the 1% fee in ICP, ckBTC,
  // ckUSDC or ckUSDT).
  public let MIN_PURCHASE : Nat = 10_000;
  // Base price: 1 TTTI-T = 10 000 USD.
  public let TOKEN_PRICE_USD : Nat = 10_000;

  // --- Status and switches ---------------------------------------------------

  // What can still be sold: mintableRemaining + fee-account balance - reserved
  // (saturating at 0).
  public func available(sale : SaleStore, ledger : IcrcLib.Ledger, canister : Principal) : Nat {
    let sellable = IcrcLib.mintableRemaining(ledger) + IcrcLib.balanceOf(ledger, IcrcLib.feeCollectorAccount(canister));
    if (sellable > sale.reserved) Nat.sub(sellable, sale.reserved) else 0;
  };

  func buyerPriceUsd() : Nat {
    TOKEN_PRICE_USD * (10_000 + TreasuryLib.CYCLES_FEE_BPS) / 10_000;
  };

  // Per pay token: fee bps, minimum USD, ledger id, decimals, ledger fee,
  // treasury account configured and rate status at `now`.
  public func payTokenStatuses(treasury : TreasuryLib.TreasuryStore, oracle : OracleLib.OracleStore, tokenRates : OracleLib.TokenRateStore, now : Int) : [PayTokenStatus] {
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
          buyerPriceUsd = PayTokenLib.buyerPriceUsd(token);
          fundsCycles = PayTokenLib.fundsCycles(token);
          treasuryConfigured = TreasuryLib.tokenAccount(treasury, token) != null;
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
    {
      maxSupply = IcrcLib.getMaxSupply();
      totalSupply = IcrcLib.totalSupply(ledger);
      mintableRemaining = IcrcLib.mintableRemaining(ledger);
      feeAccountBalance = IcrcLib.balanceOf(ledger, IcrcLib.feeCollectorAccount(canister));
      sold = sale.sold;
      reserved = sale.reserved;
      available = avail;
      complete = avail == 0 and sale.reserved == 0;
      minPurchase = MIN_PURCHASE;
      tokenPriceUsd = TOKEN_PRICE_USD;
      cyclesFeeBps = TreasuryLib.CYCLES_FEE_BPS;
      buyerPriceUsd = buyerPriceUsd();
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
      buyerPriceUsd = buyerPriceUsd();
      minPurchase = MIN_PURCHASE;
      smallestUnit = 1;
      roundingRule = "TTTI-T amounts are rounded down to 1 base unit (0.00000001 TTTI-T). The cost of a delivered amount is rounded up to 1 base unit of the paid token (ICP and ckBTC: 8 decimals; ckUSDC and ckUSDT: 6 decimals).";
      excessPaymentHandling = "No amount of the paid token beyond the cost of what is delivered is taken.";
      deliveryOrder = "Fresh minting first, up to the 1 TTTI-T max supply (100_000_000 base units); what can still be minted is the max supply minus the total supply. Tokens cannot be burned. Transfer fees collected in the fee account are delivered to buyers against ICP, ckBTC, ckUSDC or ckUSDT only once fresh minting has reached the cap.";
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

  // True when `caller` already accepted the six purchase acknowledgements.
  public func hasAccepted(store : AcknowledgementStore, caller : Principal) : Bool {
    not caller.isAnonymous() and store.containsKey(caller);
  };

  // The caller's acknowledgement (accepted = false, acceptedAt = null when
  // none recorded, including anonymous callers).
  public func getAcknowledgement(store : AcknowledgementStore, caller : Principal) : PurchaseAcknowledgement {
    if (caller.isAnonymous()) {
      return { accepted = false; acceptedAt = null };
    };
    switch (store.get(caller)) {
      case (?at) { { accepted = true; acceptedAt = ?at } };
      case null { { accepted = false; acceptedAt = null } };
    };
  };

  // Records the acceptance once for a signed-in caller (idempotent: a repeat
  // call keeps the first timestamp); anonymous -> #err(#anonymousCaller).
  public func accept(store : AcknowledgementStore, caller : Principal, now : Sale.AcknowledgedAt) : { #ok : PurchaseAcknowledgement; #err : AcknowledgementError } {
    if (caller.isAnonymous()) {
      return #err(#anonymousCaller);
    };
    let at = switch (store.get(caller)) {
      case (?first) { first };
      case null {
        store.add(caller, now);
        now;
      };
    };
    #ok({ accepted = true; acceptedAt = ?at });
  };

  // --- Purchase pipeline -----------------------------------------------------

  func refusal(code : Sale.PurchaseErrorCode, message : Text) : PurchaseError {
    { code; message; conversion = null };
  };

  func priceUnavailableMessage(token : PayToken) : Text {
    "No valid " # PayTokenLib.pair(token) # " rate is available for this hour; no " # PayTokenLib.symbol(token) # " was taken. Please try again in a few minutes";
  };

  // Checks shared by purchases, before any price use.
  func gate(sale : SaleStore, treasury : TreasuryLib.TreasuryStore, ledger : IcrcLib.Ledger, canister : Principal, token : PayToken, amount : Nat) : ?PurchaseError {
    if (treasury.config == null) {
      return ?refusal(#notConfigured, "The TTTI-T sale is not configured yet");
    };
    if (TreasuryLib.tokenAccount(treasury, token) == null) {
      let sym = PayTokenLib.symbol(token);
      return ?refusal(#tokenNotConfigured({ token }), "Purchases with " # sym # " are not open: no treasury account is set for " # sym # "; no " # sym # " was taken");
    };
    if (amount == 0) {
      return ?refusal(#invalidAmount, "The amount must be greater than zero");
    };
    if (sale.salesPaused) {
      return ?refusal(#salesPaused, "Sales are paused");
    };
    if (available(sale, ledger, canister) == 0 and sale.reserved == 0) {
      return ?refusal(#saleComplete, "TTTI-T sale complete: no TTTI-T left to sell");
    };
    null;
  };

  // TTTI-T delivery block: the mint block, else the fee-collector transfer.
  func firstBlock(blockIndices : [Nat]) : ?Nat {
    if (blockIndices.size() > 0) ?blockIndices[0] else null;
  };

  func release(sale : SaleStore, amount : Nat) {
    sale.reserved := if (sale.reserved >= amount) Nat.sub(sale.reserved, amount) else 0;
  };

  // Purchase in any pay token (convertDepositWith; convertDeposit uses #icp):
  // anonymous -> acknowledgements -> ICP configured -> token account
  // configured (#tokenNotConfigured) -> amount -> paused -> complete -> token
  // rate usable (#priceUnavailable, before any ledger call) -> ledger
  // decimals/fee check (#ledgerMismatch) -> amount math at the token decimals
  // and fee bps -> min / remaining -> collect only the cost of what is
  // delivered -> mint first, then fee-collector TTTI-T after the cap -> refund
  // minus the token's ledger fee on failure -> record the conversion. ICP:
  // fee share cost*100/10_100 to the cycles reserve, rest to the treasury ICP
  // account. ck tokens: 100% (1% fee included) minus the ledger fee to the token's treasury
  // account. Never traps.
  // `tttiTarget` = exact TTTI-T to deliver (payAmount is then the approved
  // maximum; only the rounded-up cost of the target is collected), or null
  // to buy what payAmount pays for.
  // BTC deposit purchase: `ckbtcAmount` ckBTC sits in this canister's
  // `subaccount` for `buyer`. Same rules as a ckBTC purchase (acknowledgements,
  // gate, usable rate, min, cap via mintableRemaining, 1% fee); delivers to the
  // buyer's current delivery address; the cost moves with icrc1_transfer
  // from_subaccount to the ckBTC treasury; any part beyond the cap is refunded
  // to the buyer's own account minus the ledger fee. #priceUnavailable means
  // nothing moved (stay pending). Never traps.
  // The excess refund (balance beyond the returned conversion's payAmount) is
  // sent by the caller (lib/btc-deposit.mo), which tracks the refunded amount.
  public func purchaseFromDeposit(ctx : PurchaseContext, buyer : Principal, subaccount : Blob, ckbtcAmount : Nat) : async PurchaseResult {
    let token : PayToken = #ckbtc;
    let sym = PayTokenLib.symbol(token);
    let stays = "; the " # sym # " stays in your deposit account";
    if (buyer.isAnonymous()) {
      return #Err(refusal(#anonymousCaller, "Please sign in to buy TTTI-T"));
    };
    if (not hasAccepted(ctx.acknowledgements, buyer)) {
      return #Err(refusal(#acknowledgementRequired, "Please accept the purchase acknowledgements first" # stays));
    };
    switch (gate(ctx.sale, ctx.treasury, ctx.ledger, ctx.canister, token, ckbtcAmount)) {
      case (?err) { return #Err(err) };
      case null {};
    };
    let rateStore = OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token);
    ignore OracleLib.usableRate(rateStore, Time.now()) ?? (return #Err(refusal(#priceUnavailable({ token }), "No valid BTC-USD rate is available for this hour" # stays)));

    let payLedger = PayTokenLib.ledger(token);
    switch (await PayTokenLib.verifyLedger(payLedger, token)) {
      case (#ok) {};
      case (#mismatch({ decimals; fee })) {
        let expectedDecimals = PayTokenLib.expectedDecimals(token);
        let expectedFee = PayTokenLib.expectedFee(token);
        return #Err(refusal(
          #ledgerMismatch({ token; expectedDecimals; actualDecimals = decimals; expectedFee; actualFee = fee }),
          "The " # sym # " ledger reports " # decimals.toText() # " decimals and a fee of " # fee.toText() # " (expected " # expectedDecimals.toText() # " and " # expectedFee.toText() # ")" # stays,
        ));
      };
      case (#callFailed(reason)) {
        return #Err(refusal(#ledgerError({ token }), "The " # sym # " ledger could not be reached: " # reason # stays));
      };
    };

    // Check again after the await; no await from here until the reservation.
    switch (gate(ctx.sale, ctx.treasury, ctx.ledger, ctx.canister, token, ckbtcAmount)) {
      case (?err) { return #Err(err) };
      case null {};
    };
    let usdE8 = OracleLib.usableRate(rateStore, Time.now()) ?? (return #Err(refusal(#priceUnavailable({ token }), "No valid BTC-USD rate is available for this hour" # stays)));
    let requested = PayTokenLib.tttiFromPay(token, ckbtcAmount, usdE8);
    let avail = available(ctx.sale, ctx.ledger, ctx.canister);
    if (requested < MIN_PURCHASE and requested < avail) {
      return #Err(refusal(
        #belowMinimum({ minimumTtti = MIN_PURCHASE; requestedTtti = requested }),
        "The minimum purchase is 0.0001 TTTI-T (this " # sym # " amount buys " # TreasuryLib.formatE8(requested) # " TTTI-T)",
      ));
    };
    if (avail == 0) {
      return #Err(refusal(
        #aboveRemaining({ token; maximumTtti = 0; maximumPayAmount = 0; requestedTtti = requested }),
        "No TTTI-T is available right now; other purchases are in progress" # stays,
      ));
    };
    let tttiAmount = Nat.min(requested, avail);
    let cost = Nat.min(PayTokenLib.payForExactTtti(token, tttiAmount, usdE8) ?? ckbtcAmount, ckbtcAmount);

    let delivery : Account = ctx.treasury.depositRecipients.get(buyer) ?? { owner = buyer; subaccount = null };
    if (delivery == IcrcLib.feeCollectorAccount(ctx.canister) or delivery == IcrcLib.burnAccount(ctx.canister)) {
      return #Err(refusal(#invalidAmount, "This delivery account cannot receive TTTI-T" # stays));
    };
    let target = TreasuryLib.tokenAccount(ctx.treasury, token) ?? (return #Err(refusal(#tokenNotConfigured({ token }), "No treasury account is set for " # sym # stays)));

    // RESERVE before the ledger await.
    ctx.sale.reserved += tttiAmount;
    let blockIndex = switch (await PayTokenLib.sendFromSubaccount(payLedger, token, subaccount, target, cost)) {
      case (#ok(b)) { b };
      case (#err(reason)) {
        release(ctx.sale, tttiAmount);
        return #Err(refusal(#ledgerError({ token }), "The " # sym # " could not be moved to the treasury: " # reason # stays));
      };
    };

    // Exact fee share of the collected cost (fee included in `cost`) and the
    // net amount converted; recorded once, never recomputed.
    let feeBps = PayTokenLib.feeBps(token);
    let fee = CyclesReserveLib.reserveShare(cost, feeBps);
    let base : Sale.Conversion = {
      id = 0;
      depositor = buyer;
      recipient = delivery;
      payToken = token;
      payAmount = cost;
      feeBps;
      icpAmount = 0;
      tttiAmount;
      status = #completed;
      timestamp = 0;
      priceUsdE8 = usdE8;
      usedFallback = false;
      minted = 0;
      fromCollector = 0;
      forward = #forwarded(blockIndex);
      message = null;
      feeAmount = ?fee;
      netAmount = ?Nat.sub(cost, fee);
      paymentBlock = ?blockIndex;
      mintBlock = null;
    };
    switch (IcrcLib.deliverMintFirst(ctx.ledger, ctx.canister, delivery, tttiAmount)) {
      case (#ok({ minted; fromCollector; blockIndices })) {
        release(ctx.sale, tttiAmount);
        ctx.sale.sold += tttiAmount;
        #Ok(TreasuryLib.recordConversion(ctx.treasury, { base with minted; fromCollector; mintBlock = firstBlock(blockIndices) }));
      };
      case (#err(reason)) {
        release(ctx.sale, tttiAmount);
        let message = "TTTI-T delivery failed (" # reason # ") after the " # sym # " was moved to the treasury; this purchase needs manual follow-up";
        let recorded = TreasuryLib.recordConversion(ctx.treasury, { base with status = #refundFailed; message = ?message });
        #Err({ code = #deliveryFailedRefundFailed; message; conversion = ?recorded });
      };
    };
  };

  public func purchaseWith(ctx : PurchaseContext, buyer : Principal, token : PayToken, recipient : ?Account, payAmount : Nat, tttiTarget : ?Nat) : async PurchaseResult {
    let sym = PayTokenLib.symbol(token);
    // Target cost above the approved maximum -> #invalidAmount, nothing taken.
    func targetRefusal(usdE8 : Nat) : ?PurchaseError {
      switch (tttiTarget) {
        case null { null };
        case (?target) {
          let cost = PayTokenLib.payForExactTtti(token, target, usdE8) ?? (payAmount + 1);
          if (cost > payAmount) {
            ?refusal(#invalidAmount, "This TTTI-T amount costs " # PayTokenLib.formatAmount(token, cost) # " " # sym # ", more than the " # PayTokenLib.formatAmount(token, payAmount) # " " # sym # " maximum; no " # sym # " was taken");
          } else null;
        };
      };
    };
    if (buyer.isAnonymous()) {
      return #Err(refusal(#anonymousCaller, "Please sign in to buy TTTI-T"));
    };
    if (not hasAccepted(ctx.acknowledgements, buyer)) {
      return #Err(refusal(#acknowledgementRequired, "Please accept the purchase acknowledgements first; no " # sym # " was taken"));
    };
    switch (gate(ctx.sale, ctx.treasury, ctx.ledger, ctx.canister, token, payAmount)) {
      case (?err) { return #Err(err) };
      case null {};
    };
    let rateStore = OracleLib.storeFor(ctx.oracle, ctx.tokenRates, token);
    let firstRate = OracleLib.usableRate(rateStore, Time.now()) ?? (return #Err(refusal(#priceUnavailable({ token }), priceUnavailableMessage(token))));
    switch (targetRefusal(firstRate)) {
      case (?err) { return #Err(err) };
      case null {};
    };

    // Runtime check of the ledger metadata before any funds are pulled.
    let payLedger = PayTokenLib.ledger(token);
    switch (await PayTokenLib.verifyLedger(payLedger, token)) {
      case (#ok) {};
      case (#mismatch({ decimals; fee })) {
        let expectedDecimals = PayTokenLib.expectedDecimals(token);
        let expectedFee = PayTokenLib.expectedFee(token);
        return #Err(refusal(
          #ledgerMismatch({ token; expectedDecimals; actualDecimals = decimals; expectedFee; actualFee = fee }),
          "The " # sym # " ledger reports " # decimals.toText() # " decimals and a fee of " # fee.toText() # " (expected " # expectedDecimals.toText() # " and " # expectedFee.toText() # "); no " # sym # " was taken",
        ));
      };
      case (#callFailed(reason)) {
        return #Err(refusal(#ledgerError({ token }), "The " # sym # " ledger could not be reached: " # reason # "; no " # sym # " was taken"));
      };
    };

    // State may have changed during the ledger check: check again, with no
    // await from here until the TTTI-T is reserved.
    switch (gate(ctx.sale, ctx.treasury, ctx.ledger, ctx.canister, token, payAmount)) {
      case (?err) { return #Err(err) };
      case null {};
    };
    let usdE8 = OracleLib.usableRate(rateStore, Time.now()) ?? (return #Err(refusal(#priceUnavailable({ token }), priceUnavailableMessage(token))));

    switch (targetRefusal(usdE8)) {
      case (?err) { return #Err(err) };
      case null {};
    };

    let requested = tttiTarget ?? PayTokenLib.tttiFromPay(token, payAmount, usdE8);
    let avail = available(ctx.sale, ctx.ledger, ctx.canister);
    if (requested < MIN_PURCHASE and requested < avail) {
      return #Err(refusal(
        #belowMinimum({ minimumTtti = MIN_PURCHASE; requestedTtti = requested }),
        "The minimum purchase is 0.0001 TTTI-T (this " # sym # " amount buys " # TreasuryLib.formatE8(requested) # " TTTI-T)",
      ));
    };
    if (avail == 0) {
      return #Err(refusal(
        #aboveRemaining({ token; maximumTtti = 0; maximumPayAmount = 0; requestedTtti = requested }),
        "No TTTI-T is available right now; other purchases are in progress. Please try again in a moment",
      ));
    };
    // An exact target is never cut down: above `available` it is refused.
    if (tttiTarget != null and requested > avail) {
      return #Err(refusal(
        #aboveRemaining({ token; maximumTtti = avail; maximumPayAmount = PayTokenLib.payForExactTtti(token, avail, usdE8) ?? 0; requestedTtti = requested }),
        "Only " # TreasuryLib.formatE8(avail) # " TTTI-T can be bought right now; no " # sym # " was taken",
      ));
    };
    // Cap at what can still be delivered; only its cost is pulled.
    let tttiAmount = Nat.min(requested, avail);
    let cost = PayTokenLib.payForExactTtti(token, tttiAmount, usdE8) ?? payAmount;
    await execute(ctx, buyer, token, payLedger, recipient, tttiAmount, Nat.min(cost, payAmount), usdE8);
  };

  // Reserve -> collect -> deliver (mint first) -> refund on failure -> commit,
  // record, forward. Called with all checks passed and no await since them.
  func execute(ctx : PurchaseContext, buyer : Principal, token : PayToken, payLedger : PayTokenLib.PayLedger, recipient : ?Account, tttiAmount : Nat, cost : Nat, usdE8 : Nat) : async PurchaseResult {
    let sym = PayTokenLib.symbol(token);
    let delivery : Account = switch (recipient) {
      case (?r) { r };
      case null { ctx.treasury.depositRecipients.get(buyer) ?? { owner = buyer; subaccount = null } };
    };
    if (delivery == IcrcLib.feeCollectorAccount(ctx.canister) or delivery == IcrcLib.burnAccount(ctx.canister)) {
      return #Err(refusal(#invalidAmount, "This delivery account cannot receive TTTI-T; no " # sym # " was taken"));
    };
    let target = TreasuryLib.tokenAccount(ctx.treasury, token) ?? (return #Err(refusal(#tokenNotConfigured({ token }), "No treasury account is set for " # sym # "; no " # sym # " was taken")));
    let canisterAccount : Account = { owner = ctx.canister; subaccount = null };
    let feeBps = PayTokenLib.feeBps(token);

    // RESERVE before the first ledger await.
    ctx.sale.reserved += tttiAmount;

    let paymentBlock : Nat = switch (await PayTokenLib.collect(payLedger, buyer, canisterAccount, cost)) {
      case (#ok(b)) { b };
      case (#ledgerError(err)) {
        release(ctx.sale, tttiAmount);
        let message = PayTokenLib.transferFromErrorMessage(token, err);
        let code : Sale.PurchaseErrorCode = switch (err) {
          case (#InsufficientAllowance({ allowance })) { #approvalMissing({ token; allowance }) };
          case (#InsufficientFunds({ balance })) { #insufficientBalance({ token; balance }) };
          case (_) { #ledgerError({ token }) };
        };
        return #Err(refusal(code, message));
      };
      case (#callFailed(reason)) {
        release(ctx.sale, tttiAmount);
        return #Err(refusal(#ledgerError({ token }), "The " # sym # " ledger could not be reached: " # reason));
      };
    };

    // Exact fee share of the collected cost (fee included in `cost`) and the
    // net amount converted; recorded once, never recomputed. For ICP the same
    // `fee` is the cycles reserve share.
    let fee = CyclesReserveLib.reserveShare(cost, feeBps);
    let base : Sale.Conversion = {
      id = 0;
      depositor = buyer;
      recipient = delivery;
      payToken = token;
      payAmount = cost;
      feeBps;
      icpAmount = if (token == #icp) cost else 0;
      tttiAmount;
      status = #completed;
      timestamp = 0;
      priceUsdE8 = usdE8;
      usedFallback = false;
      minted = 0;
      fromCollector = 0;
      forward = #pending;
      message = null;
      feeAmount = ?fee;
      netAmount = ?Nat.sub(cost, fee);
      paymentBlock = ?paymentBlock;
      mintBlock = null;
    };

    switch (IcrcLib.deliverMintFirst(ctx.ledger, ctx.canister, delivery, tttiAmount)) {
      case (#ok({ minted; fromCollector; blockIndices })) {
        release(ctx.sale, tttiAmount);
        ctx.sale.sold += tttiAmount;
        let recorded = TreasuryLib.recordConversion(ctx.treasury, { base with minted; fromCollector; mintBlock = firstBlock(blockIndices) });
        // ICP: the fee share cost * feeBps / (10_000 + feeBps) goes to the
        // cycles reserve (ledger fee paid on top by the canister account) and
        // the rest to the treasury. ck tokens: the whole cost goes to the
        // token's treasury account (minus its ledger fee); no cycles funded.
        let forwardAmount = if (PayTokenLib.fundsCycles(token)) {
          let share = fee;
          let treasuryE8s = CyclesReserveLib.treasuryShare(cost, share);
          let claim = CyclesReserveLib.recordShare(ctx.cyclesReserve, recorded.id, share, treasuryE8s);
          await CyclesReserveLib.transferShare(ctx.cyclesReserve, ctx.icpLedger, ctx.canister, claim);
          treasuryE8s;
        } else {
          cost;
        };
        let forward = await PayTokenLib.forward(payLedger, token, canisterAccount, target, forwardAmount);
        let latest = ctx.treasury.conversions.get(recorded.id) ?? recorded;
        let message : ?Text = switch (forward) {
          case (#failed(reason)) { ?(sym # " forwarding to the treasury failed: " # reason) };
          case (_) { null };
        };
        let updated = { latest with forward; message };
        TreasuryLib.updateConversion(ctx.treasury, updated);
        let reserve = ctx.cyclesReserve;
        await TreasuryLib.retryFailedForwards(ctx.treasury, canisterAccount, func c = CyclesReserveLib.forwardBase(reserve, c));
        await CyclesReserveLib.retryFailedShareTransfers(ctx.cyclesReserve, ctx.icpLedger, ctx.canister);
        #Ok(ctx.treasury.conversions.get(updated.id) ?? updated);
      };
      case (#err(reason)) {
        release(ctx.sale, tttiAmount);
        switch (await PayTokenLib.refund(payLedger, token, buyer, cost)) {
          case (#ok(_)) {
            let message = "TTTI-T delivery failed (" # reason # "); the " # sym # " was refunded minus the " # PayTokenLib.formatAmount(token, PayTokenLib.expectedFee(token)) # " " # sym # " ledger fee";
            let recorded = TreasuryLib.recordConversion(ctx.treasury, { base with status = #refunded; forward = #notRequired; message = ?message });
            #Err({ code = #deliveryFailedRefunded; message; conversion = ?recorded });
          };
          case (#err(refundReason)) {
            let message = "TTTI-T delivery failed (" # reason # ") and the " # sym # " refund also failed (" # refundReason # "); this purchase needs manual follow-up";
            let recorded = TreasuryLib.recordConversion(ctx.treasury, { base with status = #refundFailed; forward = #notRequired; message = ?message });
            #Err({ code = #deliveryFailedRefundFailed; message; conversion = ?recorded });
          };
        };
      };
    };
  };

  // Pipeline: caller not anonymous -> acknowledgement accepted -> configured ->
  // token account configured -> amount > 0 -> not paused -> not complete ->
  // stored hourly USD rate of the paid token usable (refuse #priceUnavailable
  // before any ledger call; no outcall, no fallback rate) -> ledger decimals and
  // fee checked (#ledgerMismatch) -> price at 10 000 USD + fixed fee (1% for
  // every pay token; TTTI-T rounded down to 1 base unit) -> minimum / available
  // checks -> deliver at most `available` and pull only its ceiling cost
  // (excess never pulled) -> RESERVE before the first collect await -> collect
  // -> IcrcLib.deliverMintFirst (fresh mint first, fee account only after the
  // mint cap) -> refund minus the ledger fee on delivery failure -> commit
  // reserved -> sold, record conversion, forward to the treasury account,
  // retry failed forwards. Never traps.

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
