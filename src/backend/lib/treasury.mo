import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Treasury "../types/treasury";
import PayTokenLib "pay-token";
import OwnerTypes "../types/owner-revenue";

module {
  public type TreasuryConfig = Treasury.TreasuryConfig;
  public type Conversion = Treasury.Conversion;
  public type ConversionStatus = Treasury.ConversionStatus;
  public type ForwardStatus = Treasury.ForwardStatus;
  public type Account = Treasury.Account;
  public type CollectResult = Treasury.CollectResult;
  public type PublicTreasuryInfo = Treasury.PublicTreasuryInfo;
  public type TokenAccounts = Treasury.TokenAccounts;
  public type TokenAccountInfo = Treasury.TokenAccountInfo;
  public type PayToken = Treasury.PayToken;
  public type MintTreasuryAccount = Treasury.MintTreasuryAccount;
  public type TokenAmounts = Treasury.TokenAmounts;
  public type WeeklyAllocation = Treasury.WeeklyAllocation;
  public type AllocationStore = Treasury.AllocationStore;

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

  // --- DEX lot 4: internal mint treasuries (no withdrawal path) --------------

  // Fixed 32-byte subaccount of this canister holding the mint treasury of
  // `token` (printable ASCII, never overlapping an existing subaccount).
  public func mintTreasurySubaccount(token : PayToken) : Blob {
    // Each text is exactly 32 ASCII bytes; the "MINT-TREASURY-" prefix is used
    // by no other subaccount of this canister.
    switch (token) {
      case (#icp) { "MINT-TREASURY-ICP-TTTI-T-0000001" };
      case (#ckbtc) { "MINT-TREASURY-CKBTC-TTTI-T-00001" };
      case (#ckusdc) { "MINT-TREASURY-CKUSDC-TTTI-T-0001" };
      case (#ckusdt) { "MINT-TREASURY-CKUSDT-TTTI-T-0001" };
    };
  };

  // canister + mintTreasurySubaccount(token): where new forwards (FW) go.
  public func mintTreasuryAccount(canister : Principal, token : PayToken) : Account {
    { owner = canister; subaccount = ?mintTreasurySubaccount(token) };
  };

  public func amountOf(amounts : TokenAmounts, token : PayToken) : Nat {
    switch (token) {
      case (#icp) { amounts.icp };
      case (#ckbtc) { amounts.ckbtc };
      case (#ckusdc) { amounts.ckusdc };
      case (#ckusdt) { amounts.ckusdt };
    };
  };

  public let ZERO_AMOUNTS : TokenAmounts = { icp = 0; ckbtc = 0; ckusdc = 0; ckusdt = 0 };

  // Every mint treasury (ICP, ckBTC, ckUSDC, ckUSDT) with its cached balance
  // and the old external account, if any.
  public func mintTreasuryAccounts(store : TreasuryStore, allocation : AllocationStore, canister : Principal) : [MintTreasuryAccount] {
    PayTokenLib.ALL.map(
      func token = ({
        token;
        account = mintTreasuryAccount(canister, token);
        balance = if (allocation.lastRunAt == null) null else ?amountOf(allocation.balances, token);
        legacyExternalAccount = tokenAccount(store, token);
      } : MintTreasuryAccount)
    );
  };

  // --- DEX lot 4: weekly allocation ------------------------------------------

  func sat(a : Nat, b : Nat) : Nat = if (a > b) Nat.sub(a, b) else 0;

  func ceilDiv(a : Nat, b : Nat) : Nat = (a + b - 1) / b;

  // Per-token split of a treasury balance: (cap paid from the accumulated
  // stock this week, new funds received after the stock was fixed).
  func stockSplit(allocation : AllocationStore, balances : TokenAmounts, token : PayToken) : (Nat, Nat) {
    let base = amountOf(allocation.stockBase ?? balances, token);
    let balance = amountOf(balances, token);
    let remaining = sat(base, amountOf(allocation.stockPaid, token));
    let stockPart = Nat.min(balance, remaining);
    let cap = Nat.min(stockPart, ceilDiv(base, 12));
    (cap, sat(balance, stockPart));
  };

  func amounts(f : PayToken -> Nat) : TokenAmounts {
    { icp = f(#icp); ckbtc = f(#ckbtc); ckusdc = f(#ckusdc); ckusdt = f(#ckusdt) };
  };

  // Target that keeps the planned surplus "beyond about 100 days".
  public let SURPLUS_AFTER_DAYS : Nat = 100;
  public let AUTONOMY_TARGET_DAYS : Nat = 90;

  // Decision of one weekly calculation (no transfer): below 90 days of
  // autonomy, ICP to the cycles reserve first; ICP beyond about 100 days is
  // surplus, 50 % DL bonus / 50 % fixed protocol liquidity; the accumulated
  // stock is paid out at most 1/12 per week. Pool adds are filled by the run.
  public func planWeeklyAllocation(allocation : AllocationStore, balances : TokenAmounts, autonomyDays : ?Nat, cyclesPerDay : ?Nat, cyclesPerIcp : ?Nat, now : Int) : WeeklyAllocation {
    let stockPayoutCap = amounts(func t = stockSplit(allocation, balances, t).0);
    let spendable = amounts(func t { let (cap, fresh) = stockSplit(allocation, balances, t); cap + fresh });
    let base = {
      id = allocation.nextId;
      at = now;
      autonomyDays;
      treasuryBalances = balances;
      stockPayoutCap;
      poolAdds = [];
      skipped = [];
      waiting = ZERO_AMOUNTS;
    };
    switch (autonomyDays, cyclesPerDay, cyclesPerIcp) {
      case (?days, ?perDay, ?perIcp) {
        if (perDay == 0 or perIcp == 0) {
          return { base with toCyclesReserveE8s = 0; surplusE8s = 0; toBonusE8s = 0; toLiquidity = ZERO_AMOUNTS; note = "Consumption or CMC rate is zero; nothing allocated this week" };
        };
        // ICP e8s worth `d` days of consumption at the CMC rate (rounded up).
        func icpForDays(d : Nat) : Nat = ceilDiv(d * perDay * ICP_DECIMALS, perIcp);
        let toCycles = Nat.min(spendable.icp, icpForDays(sat(AUTONOMY_TARGET_DAYS, days)));
        let rest = sat(spendable.icp, toCycles);
        let daysAfter = days + toCycles * perIcp / ICP_DECIMALS / perDay;
        let hold = Nat.min(rest, icpForDays(sat(SURPLUS_AFTER_DAYS, daysAfter)));
        let surplus = sat(rest, hold);
        let toBonus = surplus / 2;
        let hasSurplus = daysAfter >= SURPLUS_AFTER_DAYS;
        let toLiquidity : TokenAmounts = {
          icp = sat(surplus, toBonus);
          ckbtc = if (hasSurplus) spendable.ckbtc else 0;
          ckusdc = if (hasSurplus) spendable.ckusdc else 0;
          ckusdt = if (hasSurplus) spendable.ckusdt else 0;
        };
        let note = if (toCycles > 0 and surplus == 0) {
          "Autonomy " # days.toText() # " days: treasury ICP sent to the cycles reserve first; no surplus beyond " # SURPLUS_AFTER_DAYS.toText() # " days";
        } else if (surplus > 0) {
          "Autonomy " # days.toText() # " days: surplus beyond " # SURPLUS_AFTER_DAYS.toText() # " days split 50 % DL bonus / 50 % fixed protocol liquidity";
        } else {
          "Autonomy " # days.toText() # " days: no transfer to the cycles reserve and no surplus this week";
        };
        { base with toCyclesReserveE8s = toCycles; surplusE8s = surplus; toBonusE8s = toBonus; toLiquidity; note };
      };
      case _ {
        { base with toCyclesReserveE8s = 0; surplusE8s = 0; toBonusE8s = 0; toLiquidity = ZERO_AMOUNTS; note = "Autonomy, consumption or CMC rate unknown; treasury funds wait" };
      };
    };
  };

  // Records a completed weekly calculation (the run fills poolAdds, skipped
  // and waiting first). The part spent beyond new funds counts as stock paid.
  public func recordAllocation(allocation : AllocationStore, result : WeeklyAllocation) {
    let balances = result.treasuryBalances;
    let spent = amounts(
      func t {
        let liquidity = sat(amountOf(result.toLiquidity, t), amountOf(result.waiting, t));
        switch (t) {
          case (#icp) { result.toCyclesReserveE8s + result.toBonusE8s + liquidity };
          case (_) { liquidity };
        };
      }
    );
    let paidNow = amounts(
      func t {
        let (cap, fresh) = stockSplit(allocation, balances, t);
        Nat.min(cap, sat(amountOf(spent, t), fresh));
      }
    );
    if (allocation.stockBase == null) {
      allocation.stockBase := ?balances;
    };
    allocation.stockPaid := amounts(func t = amountOf(allocation.stockPaid, t) + amountOf(paidNow, t));
    allocation.history.add(result);
    allocation.nextId := Nat.max(allocation.nextId, result.id) + 1;
    allocation.lastRunAt := ?result.at;
  };

  // Latest weekly calculation, null before the first one.
  public func lastAllocation(allocation : AllocationStore) : ?WeeklyAllocation {
    allocation.history.last();
  };

  // Weekly calculations, newest first.
  public func allocations(allocation : AllocationStore) : [WeeklyAllocation] {
    allocation.history.reverseValues().toArray();
  };

  // The old external (legacy, read-only) account of `token`, null when none
  // was set. New forwards use mintTreasuryAccount.
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

  // --- Mint owner revenue: views ----------------------------

  // "icp", "ckbtc", "ckusdc", "ckusdt": key of the per-token owner maps.
  public func tokenKey(token : PayToken) : Text {
    switch (token) {
      case (#icp) { "icp" };
      case (#ckbtc) { "ckbtc" };
      case (#ckusdc) { "ckusdc" };
      case (#ckusdt) { "ckusdt" };
    };
  };

  public func ownerAccumulated(store : OwnerTypes.OwnerRevenueStore) : [OwnerTypes.OwnerAccumulated] {
    PayTokenLib.ALL.map(func token = ({ token; amount = store.accumulated.get(tokenKey(token)) ?? 0 } : OwnerTypes.OwnerAccumulated));
  };

  // Share of `token` accumulated in the contract default account.
  public func accumulatedOf(store : OwnerTypes.OwnerRevenueStore, token : PayToken) : Nat {
    store.accumulated.get(tokenKey(token)) ?? 0;
  };

  func withdrawalView(s : OwnerTypes.OwnerSend, by : Principal, source : OwnerTypes.TreasurySource) : OwnerTypes.WithdrawalView {
    {
      id = s.id;
      token = s.token;
      amount = s.attempt.request.amount;
      fee = s.attempt.request.fee ?? PayTokenLib.expectedFee(s.token);
      destination = s.attempt.request.to;
      source;
      requestedBy = by;
      status = s.status;
      block = switch (s.status) { case (#sent(b)) { ?b }; case _ { null } };
      memoText = s.attempt.memo.decodeUtf8() ?? "";
      createdAtTimeNs = s.attempt.created_at_time;
      attempt = s.attempt.attempt;
      sends = s.attempt.sends;
      lastError = s.attempt.lastError;
      createdAt = s.createdAt;
      updatedAt = s.updatedAt;
    };
  };

  // The withdrawal with owner send id `id`; null when it is not a withdrawal.
  public func withdrawalById(store : OwnerTypes.OwnerRevenueStore, id : Nat) : ?OwnerTypes.WithdrawalView {
    let s = store.sends.get(id) ?? (return null);
    switch (s.source) {
      case (#withdrawal(w)) { ?withdrawalView(s, w.by, w.from) };
      case (_) { null };
    };
  };

  // Admin withdrawals, newest first; `limit` capped at 100.
  public func withdrawals(store : OwnerTypes.OwnerRevenueStore, offset : Nat, limit : Nat) : OwnerTypes.WithdrawalPage {
    let cap = Nat.min(limit, 100);
    let all = List.empty<OwnerTypes.WithdrawalView>();
    for ((_, s) in store.sends.reverseEntries()) {
      switch (s.source) {
        case (#withdrawal(w)) { all.add(withdrawalView(s, w.by, w.from)) };
        case (_) {};
      };
    };
    { items = all.values().drop(offset).take(cap).toArray(); total = all.size(); offset };
  };

  func sendView(s : OwnerTypes.OwnerSend) : OwnerTypes.OwnerSendView {
    {
      id = s.id;
      token = s.token;
      amount = s.attempt.request.amount;
      fee = s.attempt.request.fee;
      destination = s.attempt.request.to;
      source = s.source;
      status = s.status;
      block = switch (s.status) { case (#sent(b)) { ?b }; case _ { null } };
      memoText = s.attempt.memo.decodeUtf8() ?? "";
      createdAtTimeNs = s.attempt.created_at_time;
      attempt = s.attempt.attempt;
      sends = s.attempt.sends;
      lastError = s.attempt.lastError;
      createdAt = s.createdAt;
      updatedAt = s.updatedAt;
    };
  };

  // Newest first; `limit` capped at 100.
  public func ownerSends(store : OwnerTypes.OwnerRevenueStore, offset : Nat, limit : Nat) : OwnerTypes.OwnerSendPage {
    let cap = Nat.min(limit, 100);
    let items = store.sends.reverseEntries().map(func((_, s) : (Nat, OwnerTypes.OwnerSend)) : OwnerTypes.OwnerSend = s).drop(offset).take(cap).map(sendView).toArray();
    { items; total = store.sends.size(); offset };
  };

  public func sweepView(store : OwnerTypes.OwnerRevenueStore) : OwnerTypes.TreasurySweepView {
    let sweep = store.sweep;
    {
      status = sweep.status;
      startedAt = sweep.startedAt;
      completedAt = sweep.completedAt;
      reserveTopUpE8s = sweep.reserveTopUpE8s;
      reserveTopUpBlock = switch (sweep.reserveTopUp) {
        case (?a) { switch (a.outcome) { case (#succeeded(b)) { ?b }; case _ { null } } };
        case null { null };
      };
      reserveTopUpMemo = switch (sweep.reserveTopUp) {
        case (?a) { a.memo.decodeUtf8() };
        case null { null };
      };
      tokens = sweep.tokens;
    };
  };
};
