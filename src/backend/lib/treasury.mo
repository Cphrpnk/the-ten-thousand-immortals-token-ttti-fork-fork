import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Treasury "../types/treasury";
import PayTokenLib "pay-token";

module {
  public type TreasuryConfig = Treasury.TreasuryConfig;
  public type Conversion = Treasury.Conversion;
  public type ConversionStatus = Treasury.ConversionStatus;
  public type ForwardStatus = Treasury.ForwardStatus;
  public type TreasuryConfigResult = Treasury.TreasuryConfigResult;
  public type Account = Treasury.Account;
  public type CollectResult = Treasury.CollectResult;
  public type PublicTreasuryInfo = Treasury.PublicTreasuryInfo;
  public type TokenAccounts = Treasury.TokenAccounts;
  public type TokenAccountInfo = Treasury.TokenAccountInfo;
  public type TokenAccountResult = Treasury.TokenAccountResult;
  public type PayToken = Treasury.PayToken;

  // The ICP ledger canister (mainnet) exposed through its ICRC-1 interface.
  public func icpLedger() : Principal = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

  // ICP ICRC-1/ICRC-2 interface. Error variants include every ICRC-2
  // transfer_from variant (InsufficientAllowance etc.) so replies decode.
  public type IcpLedger = actor {
    icrc1_balance_of : shared query ({ owner : Principal; subaccount : ?Blob }) -> async Nat;
    icrc1_transfer : shared Treasury.IcpTransferArgs -> async Treasury.IcpTransferResult;
    icrc2_transfer_from : shared Treasury.IcpTransferFromArgs -> async Treasury.IcpTransferFromResult;
  };

  // ICP base units per whole ICP (8 decimals).
  public let ICP_DECIMALS : Nat = 100_000_000;

  // ICP ledger transfer fee in e8s (0.0001 ICP).
  public let ICP_FEE : Nat = 10_000;

  // Stable treasury state. `depositRecipients` is the per-caller optional
  // delivery address map (principal -> { owner; subaccount = null }).
  public type TreasuryStore = {
    var config : ?TreasuryConfig;
    var conversions : Map.Map<Nat, Conversion>;
    var nextConversionId : Nat;
    var depositRecipients : Map.Map<Principal, Account>;
    var tokenAccounts : TokenAccounts;
  };

  // --- Configuration ---------------------------------------------------------

  public func getConfig(store : TreasuryStore) : ?TreasuryConfig {
    store.config;
  };

  // Fixed fee on ICP purchases: 100 bps = 1%; its share goes to the cycles
  // reserve. A code constant; no method changes it. The buyer pays 10 100 USD
  // per TTTI-T. ck-token purchases use PayTokenLib.CK_FEE_BPS (also 1%).
  public let CYCLES_FEE_BPS : Nat = 100;

  // Stores the account that receives the creator's ICP.
  public func setConfig(store : TreasuryStore, config : TreasuryConfig) : TreasuryConfigResult {
    store.config := ?config;
    #Ok(config);
  };

  // Sets the receiving account of `token` (#icp updates config.icpAccount).
  public func setTokenAccount(store : TreasuryStore, token : PayToken, account : Account) : TokenAccountResult {
    switch (token) {
      case (#icp) { store.config := ?{ icpAccount = account } };
      case (#ckbtc) { store.tokenAccounts := { store.tokenAccounts with ckbtc = ?account } };
      case (#ckusdc) { store.tokenAccounts := { store.tokenAccounts with ckusdc = ?account } };
      case (#ckusdt) { store.tokenAccounts := { store.tokenAccounts with ckusdt = ?account } };
    };
    #Ok({ token; account = ?account });
  };

  // The receiving account of `token`, or null while not configured.
  public func tokenAccount(store : TreasuryStore, token : PayToken) : ?Account {
    switch (token) {
      case (#icp) { do ? { store.config!.icpAccount } };
      case (#ckbtc) { store.tokenAccounts.ckbtc };
      case (#ckusdc) { store.tokenAccounts.ckusdc };
      case (#ckusdt) { store.tokenAccounts.ckusdt };
    };
  };

  // What the Buy page needs (ICP account plus every pay token's account);
  // null while the ICP account is not configured.
  public func publicInfo(store : TreasuryStore) : ?PublicTreasuryInfo {
    let config = store.config ?? (return null);
    ?{
      icpAccount = config.icpAccount;
      tokenAccounts = PayTokenLib.ALL.map(func token = ({ token; account = tokenAccount(store, token) } : TokenAccountInfo));
    };
  };

  // --- State -----------------------------------------------------------------

  public func getConversions(store : TreasuryStore) : [Conversion] {
    store.conversions.values().toArray();
  };

  // Conversions where `caller` is the depositor or the recipient owner,
  // newest (highest id) first; [] for the anonymous principal.
  public func myConversions(store : TreasuryStore, caller : Principal) : [Conversion] {
    if (caller.isAnonymous()) {
      return [];
    };
    store.conversions.reverseEntries().map(func((_, c)) = c).filter(func c = c.depositor == caller or c.recipient.owner == caller).toArray();
  };

  func isFailedForward(c : Conversion) : Bool {
    c.status == #completed and (switch (c.forward) { case (#failed(_)) { true }; case (_) { false } });
  };

  // Automatic rule (no admin endpoint): re-sends, once each, the treasury part
  // of conversions whose forward is #failed, in the conversion's own pay token
  // to that token's treasury account (amount = forwardBase(conversion) minus
  // the token's ledger fee; forwardBase excludes the cycles reserve share of
  // ICP conversions, so it is never sent again). Each is re-checked and marked
  // #pending synchronously before its ledger await so it can never forward
  // twice; ends as #forwarded(blockIndex) or #failed(reason). Called after a
  // successful delivery. Never traps.
  public func retryFailedForwards(store : TreasuryStore, canisterAccount : Account, forwardBase : Conversion -> Nat) : async () {
    let failed = store.conversions.values().filter(isFailedForward).toArray();
    for (candidate in failed.values()) {
      let current = store.conversions.get(candidate.id) ?? candidate;
      switch (if (isFailedForward(current)) tokenAccount(store, current.payToken) else null) {
        case (?target) {
          store.conversions.add(current.id, { current with forward = #pending });
          let forward = await PayTokenLib.forward(PayTokenLib.ledger(current.payToken), current.payToken, canisterAccount, target, forwardBase(current));
          let latest = store.conversions.get(current.id) ?? current;
          store.conversions.add(current.id, { latest with forward });
        };
        case null {};
      };
    };
  };

  // --- Conversion records ----------------------------------------------------

  // Stores `conversion` under a fresh id (store.nextConversionId) with
  // timestamp = now; the input's id and timestamp are ignored. Returns the
  // stored record.
  public func recordConversion(store : TreasuryStore, conversion : Conversion) : Conversion {
    let id = store.nextConversionId;
    store.nextConversionId += 1;
    let stored = { conversion with id; timestamp = Time.now().toNat().toNat64() };
    store.conversions.add(id, stored);
    stored;
  };

  // Replaces the stored record with the same id (e.g. forward status update).
  public func updateConversion(store : TreasuryStore, conversion : Conversion) : () {
    store.conversions.add(conversion.id, conversion);
  };

  // --- Formatting ------------------------------------------------------------
  //
  // Purchase math in every pay token's decimals lives in lib/pay-token.mo.

  // Formats an 8-decimal base-unit amount (ICP e8s or TTTI-T) as a decimal.
  public func formatE8(amount : Nat) : Text {
    let whole = amount / 100_000_000;
    let frac = amount % 100_000_000;
    if (frac == 0) {
      return whole.toText();
    };
    var digits = frac.toText();
    while (digits.size() < 8) {
      digits := "0" # digits;
    };
    whole.toText() # "." # digits.trimEnd(#char '0');
  };

  // --- ICP ledger error messages ----------------------------------------------

  // User-facing messages, e.g. #InsufficientAllowance ->
  // "Approval missing or too low: approve the amount + 0.0001 ICP fee".
  public func transferFromErrorMessage(err : Treasury.IcpTransferFromError) : Text {
    switch (err) {
      case (#InsufficientAllowance({ allowance })) {
        "Approval missing or too low: approve the amount + 0.0001 ICP fee (current allowance: " # formatE8(allowance) # " ICP)";
      };
      case (#InsufficientFunds({ balance })) {
        "Insufficient ICP balance: " # formatE8(balance) # " ICP available; the amount plus the 0.0001 ICP fee is required";
      };
      case (#BadFee({ expected_fee })) {
        "The ICP ledger rejected the fee (expected " # formatE8(expected_fee) # " ICP)";
      };
      case (#BadBurn({ min_burn_amount })) {
        "The ICP ledger rejected the transfer as a burn (minimum " # formatE8(min_burn_amount) # " ICP)";
      };
      case (#TooOld) { "The ICP ledger rejected the transfer as too old; please try again" };
      case (#CreatedInFuture(_)) {
        "The ICP ledger rejected the transfer time; please try again";
      };
      case (#Duplicate({ duplicate_of })) {
        "Duplicate ICP transfer (already recorded in block " # duplicate_of.toText() # ")";
      };
      case (#TemporarilyUnavailable) {
        "The ICP ledger is temporarily unavailable; please try again in a moment";
      };
      case (#GenericError({ message })) { "ICP ledger error: " # message };
    };
  };

  // icrc1_transfer errors are a subset of the transfer_from errors.
  public func transferErrorMessage(err : Treasury.IcpTransferError) : Text {
    transferFromErrorMessage(err);
  };
};
