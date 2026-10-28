import Error "mo:core/Error";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Pay "../types/pay-token";
import Treasury "../types/treasury";

// Pay-token facts (ledger ids, decimals, ledger fees, sale fee bps), the
// generic ICRC-1/ICRC-2 ledger calls used by purchases in any pay token, and
// the price math generalised to the token's decimals.
module {
  public type PayToken = Pay.PayToken;
  public type Account = Treasury.Account;

  // ICRC-1/ICRC-2 interface shared by the ICP, ckBTC, ckUSDC and ckUSDT
  // ledgers. icrc1_decimals / icrc1_fee are checked before each purchase.
  public type PayLedger = actor {
    icrc1_balance_of : shared query ({ owner : Principal; subaccount : ?Blob }) -> async Nat;
    icrc1_decimals : shared query () -> async Nat8;
    icrc1_fee : shared query () -> async Nat;
    icrc1_transfer : shared Treasury.IcpTransferArgs -> async Treasury.IcpTransferResult;
    icrc2_transfer_from : shared Treasury.IcpTransferFromArgs -> async Treasury.IcpTransferFromResult;
  };

  // Outcome of the runtime ledger metadata check.
  public type LedgerCheck = {
    #ok;
    #mismatch : { decimals : Nat8; fee : Nat };
    #callFailed : Text;
  };

  public let ALL : [PayToken] = [#icp, #ckbtc, #ckusdc, #ckusdt];

  public let ICP_LEDGER_ID : Text = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  public let CKBTC_LEDGER_ID : Text = "mxzaz-hqaaa-aaaar-qaada-cai";
  public let CKUSDC_LEDGER_ID : Text = "xevnm-gaaaa-aaaar-qafnq-cai";
  public let CKUSDT_LEDGER_ID : Text = "cngnf-vqaaa-aaaar-qag4q-cai";

  public let ICP_DECIMALS : Nat8 = 8;
  public let CKBTC_DECIMALS : Nat8 = 8;
  public let CKUSDC_DECIMALS : Nat8 = 6;
  public let CKUSDT_DECIMALS : Nat8 = 6;

  public let ICP_LEDGER_FEE : Nat = 10_000;
  public let CKBTC_LEDGER_FEE : Nat = 10;
  public let CKUSDC_LEDGER_FEE : Nat = 10_000;
  public let CKUSDT_LEDGER_FEE : Nat = 10_000;

  // Fixed 1% fee on every pay token. ICP: the fee share goes to the cycles
  // reserve. ckBTC / ckUSDC / ckUSDT: forwarded to the token's treasury, no cycles.
  public let ICP_FEE_BPS : Nat = 100;
  public let CK_FEE_BPS : Nat = 100;

  // Base price of one whole TTTI-T in USD (fee excluded).
  let TOKEN_PRICE_USD : Nat = 10_000;
  // Minimum purchase base, 1 USD * 10^8 (0.0001 TTTI-T), fee excluded.
  let MIN_BASE_USD_E8 : Nat = 100_000_000;

  // --- Token facts -----------------------------------------------------------

  // "ICP", "ckBTC", "ckUSDC", "ckUSDT".
  public func symbol(token : PayToken) : Text {
    switch (token) {
      case (#icp) { "ICP" };
      case (#ckbtc) { "ckBTC" };
      case (#ckusdc) { "ckUSDC" };
      case (#ckusdt) { "ckUSDT" };
    };
  };

  // "ICP-USD", "BTC-USD", "USDC-USD", "USDT-USD" (the rate pair).
  public func pair(token : PayToken) : Text {
    switch (token) {
      case (#icp) { "ICP-USD" };
      case (#ckbtc) { "BTC-USD" };
      case (#ckusdc) { "USDC-USD" };
      case (#ckusdt) { "USDT-USD" };
    };
  };

  func ledgerText(token : PayToken) : Text {
    switch (token) {
      case (#icp) { ICP_LEDGER_ID };
      case (#ckbtc) { CKBTC_LEDGER_ID };
      case (#ckusdc) { CKUSDC_LEDGER_ID };
      case (#ckusdt) { CKUSDT_LEDGER_ID };
    };
  };

  public func ledgerId(token : PayToken) : Principal {
    Principal.fromText(ledgerText(token));
  };

  public func ledger(token : PayToken) : PayLedger = actor (ledgerText(token));

  public func expectedDecimals(token : PayToken) : Nat8 {
    switch (token) {
      case (#icp) { ICP_DECIMALS };
      case (#ckbtc) { CKBTC_DECIMALS };
      case (#ckusdc) { CKUSDC_DECIMALS };
      case (#ckusdt) { CKUSDT_DECIMALS };
    };
  };

  public func expectedFee(token : PayToken) : Nat {
    switch (token) {
      case (#icp) { ICP_LEDGER_FEE };
      case (#ckbtc) { CKBTC_LEDGER_FEE };
      case (#ckusdc) { CKUSDC_LEDGER_FEE };
      case (#ckusdt) { CKUSDT_LEDGER_FEE };
    };
  };

  // 100 (1%) for every pay token.
  public func feeBps(token : PayToken) : Nat {
    switch (token) {
      case (#icp) { ICP_FEE_BPS };
      case (_) { CK_FEE_BPS };
    };
  };

  // Mint revenue correction: no mint fee share goes to the cycles reserve
  // any more (the fee is routed to TTTI-T liquidity), so false for every token.
  public func fundsCycles(token : PayToken) : Bool {
    ignore token;
    false;
  };

  // Minimum purchase in USD * 10^8, fee included: 1.01 USD for every pay token.
  public func minimumUsdE8(token : PayToken) : Nat {
    MIN_BASE_USD_E8 * (10_000 + feeBps(token)) / 10_000;
  };

  // Buyer price per whole TTTI-T in USD: 10_100 for every pay token.
  public func buyerPriceUsd(token : PayToken) : Nat {
    TOKEN_PRICE_USD * (10_000 + feeBps(token)) / 10_000;
  };

  // --- Price math (token decimals generalised) -------------------------------
  //
  // TTTI-T base units = payAmount / 10^dec * usdE8 / 10^8 USD
  //   / (10_000 * (10_000 + bps) / 10_000 USD per TTTI-T) * 10^8
  //   = payAmount * usdE8 / (10^dec * (10_000 + bps)).

  func scale(token : PayToken) : Nat {
    10 ** expectedDecimals(token).toNat();
  };

  func denominator(token : PayToken) : Nat {
    scale(token) * (10_000 + feeBps(token));
  };

  // TTTI-T base units bought by `payAmount` (token base units) at `usdE8`
  // (USD per whole token * 10^8), fee included, rounded down.
  public func tttiFromPay(token : PayToken, payAmount : Nat, usdE8 : Nat) : Nat {
    payAmount * usdE8 / denominator(token);
  };

  // Smallest pay amount (token base units, rounded up) that pays for exactly
  // `tttiAmount` TTTI-T base units, fee included. null when usdE8 is 0.
  public func payForExactTtti(token : PayToken, tttiAmount : Nat, usdE8 : Nat) : ?Nat {
    if (usdE8 == 0) {
      return null;
    };
    let n = tttiAmount * denominator(token);
    let q = n / usdE8;
    ?(if (q * usdE8 == n) q else q + 1);
  };

  // TTTI-T base units per whole token at `usdE8`, fee included; null when 0.
  public func liveRate(token : PayToken, usdE8 : Nat) : ?Nat {
    if (usdE8 == 0) null else ?tttiFromPay(token, scale(token), usdE8);
  };

  // Formats a token base-unit amount as a decimal text.
  public func formatAmount(token : PayToken, amount : Nat) : Text {
    let decimals = expectedDecimals(token).toNat();
    let unit = scale(token);
    let whole = amount / unit;
    let frac = amount % unit;
    if (frac == 0) {
      return whole.toText();
    };
    var digits = frac.toText();
    while (digits.size() < decimals) {
      digits := "0" # digits;
    };
    whole.toText() # "." # digits.trimEnd(#char '0');
  };

  // `amount` minus the token's ledger fee, or 0 when it does not cover it.
  func minusFee(token : PayToken, amount : Nat) : Nat {
    let fee = expectedFee(token);
    if (amount > fee) Nat.sub(amount, fee) else 0;
  };

  func feeText(token : PayToken) : Text {
    formatAmount(token, expectedFee(token)) # " " # symbol(token);
  };

  // --- Ledger calls (try/catch, never trap, no cycles) -----------------------

  // icrc1_decimals / icrc1_fee must equal the expected constants.
  public func verifyLedger(payLedger : PayLedger, token : PayToken) : async LedgerCheck {
    try {
      let decimals = await payLedger.icrc1_decimals();
      let fee = await payLedger.icrc1_fee();
      if (decimals == expectedDecimals(token) and fee == expectedFee(token)) {
        #ok;
      } else {
        #mismatch({ decimals; fee });
      };
    } catch (e) {
      #callFailed(e.message());
    };
  };

  // icrc2_transfer_from(buyer -> canisterAccount, amount); canister is the
  // spender. Always sends the purchase trace memo (TTTI-PC-<n>) and its
  // created_at_time. Ok or #Duplicate -> #ok(block); Err -> #ledgerError;
  // rejected call -> #callFailed (outcome unknown).
  public func collect(payLedger : PayLedger, buyer : Principal, canisterAccount : Account, amount : Nat, memo : Blob, createdAtTime : Nat64) : async Treasury.CollectResult {
    try {
      let result = await payLedger.icrc2_transfer_from({
        spender_subaccount = null;
        from = { owner = buyer; subaccount = null };
        to = canisterAccount;
        amount;
        fee = null;
        memo = ?memo;
        created_at_time = ?createdAtTime;
      });
      switch (result) {
        case (#Ok(blockIndex)) { #ok(blockIndex) };
        case (#Err(#Duplicate({ duplicate_of }))) { #ok(duplicate_of) };
        case (#Err(err)) { #ledgerError(err) };
      };
    } catch (e) {
      #callFailed(e.message());
    };
  };

  // icrc1_transfer(canister `subaccount` -> to, debit - ledger fee, explicit
  // ledger fee) with `memo` and `createdAtTime` passed unchanged: the
  // subaccount is debited exactly `debit`. Ok or #Duplicate -> #ok(block);
  // ledger Err or an amount not covering the fee -> #ledgerError (nothing
  // moved); rejected call -> #callFailed (outcome unknown). Never traps.
  // Outcomes are classified by lib/retry.mo (sendBtcCounted).
  public func sendFromSubaccount(payLedger : PayLedger, token : PayToken, subaccount : Blob, to : Account, debit : Nat, memo : Blob, createdAtTime : Nat64) : async Treasury.CollectResult {
    let net = minusFee(token, debit);
    if (net == 0) {
      return #ledgerError(#GenericError({ error_code = 0; message = "the amount does not cover the " # feeText(token) # " ledger fee" }));
    };
    try {
      let result = await payLedger.icrc1_transfer({
        from_subaccount = ?subaccount;
        to;
        amount = net;
        fee = ?expectedFee(token);
        memo = ?memo;
        created_at_time = ?createdAtTime;
      });
      switch (result) {
        case (#Ok(blockIndex)) { #ok(blockIndex) };
        case (#Err(#Duplicate({ duplicate_of }))) { #ok(duplicate_of) };
        case (#Err(err)) { #ledgerError(err) };
      };
    } catch (e) {
      #callFailed(e.message());
    };
  };

  // icrc1_balance_of of `account` on `payLedger`; #err on a rejected call.
  public func balanceOf(payLedger : PayLedger, account : Account) : async { #ok : Nat; #err : Text } {
    try {
      #ok(await payLedger.icrc1_balance_of(account));
    } catch (e) {
      #err(e.message());
    };
  };

  // User-facing ledger error text naming the token.
  public func transferFromErrorMessage(token : PayToken, err : Treasury.IcpTransferFromError) : Text {
    let sym = symbol(token);
    switch (err) {
      case (#InsufficientAllowance({ allowance })) {
        "Approval missing or too low: approve the amount + " # feeText(token) # " fee (current allowance: " # formatAmount(token, allowance) # " " # sym # ")";
      };
      case (#InsufficientFunds({ balance })) {
        "Insufficient " # sym # " balance: " # formatAmount(token, balance) # " " # sym # " available; the amount plus the " # feeText(token) # " fee is required";
      };
      case (#BadFee({ expected_fee })) {
        "The " # sym # " ledger rejected the fee (expected " # formatAmount(token, expected_fee) # " " # sym # ")";
      };
      case (#BadBurn({ min_burn_amount })) {
        "The " # sym # " ledger rejected the transfer as a burn (minimum " # formatAmount(token, min_burn_amount) # " " # sym # ")";
      };
      case (#TooOld) { "The " # sym # " ledger rejected the transfer as too old; please try again" };
      case (#CreatedInFuture(_)) {
        "The " # sym # " ledger rejected the transfer time; please try again";
      };
      case (#Duplicate({ duplicate_of })) {
        "Duplicate " # sym # " transfer (already recorded in block " # duplicate_of.toText() # ")";
      };
      case (#TemporarilyUnavailable) {
        "The " # sym # " ledger is temporarily unavailable; please try again in a moment";
      };
      case (#GenericError({ message })) { sym # " ledger error: " # message };
    };
  };
};
