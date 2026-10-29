import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Error "mo:core/Error";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Types "../types/dex";
import IndicatorTypes "../types/dex-indicators";

// v2 constant-product pool registry and pair requests (DEX lot 1).
// No Caffeine-specific dependency: ledger transfers and authorization are
// performed by the caller (mixins/dex-api.mo).
module {
  public type PoolId = Types.PoolId;
  public type RequestId = Types.RequestId;
  public type Timestamp = Types.Timestamp;
  public type DexStore = Types.DexStore;
  public type Pool = Types.Pool;
  public type PoolView = Types.PoolView;
  public type PairRequest = Types.PairRequest;
  public type PairRequestView = Types.PairRequestView;
  public type Position = Types.Position;
  public type PositionView = Types.PositionView;

  // Usable USD rate (USD * 1e8 per whole token) of a pool token, or null when
  // missing / expired. Supplied by the caller (mixins/dex-api.mo) from the
  // fixed TTTI-T value and OracleLib.usableRate; never an instantaneous pool price.
  public type UsdRateOf = Types.PoolToken -> ?Nat;

  // DEX lot 3 constants.
  public let MIN_LOCK_NS : Nat = 86_400_000_000_000; // 24 h
  public let MAX_LOCK_NS : Nat = 157_766_400_000_000_000; // 5 years (1826 days)
  public let SWAP_DEADLINE_MAX_NS : Nat = 300_000_000_000; // 5 minutes
  public let BPS_DENOMINATOR : Nat = 10_000;
  // Swap fee: 70 % stays in the reserves (LPs); 30 % kept in protocolFee0/1,
  // then added to the same pool as permanent locked liquidity
  // (ProtocolFeesLib.recyclePoolFees). Nothing goes to cycles.
  public let LP_FEE_SHARE_PERCENT : Nat = 70;
  public let PROTOCOL_FEE_SHARE_PERCENT : Nat = 30;

  // Pair request deposit: 0.0005 TTTI-T.
  public let REQUEST_DEPOSIT : Nat = 50_000;
  // TTTI-T side minimum locked liquidity: 0.0001 TTTI-T.
  public let TTTI_MINIMUM_LOCKED : Nat = 10_000;
  // First deposit >= 10x the minimum locked liquidity.
  public let FIRST_DEPOSIT_MULTIPLIER : Nat = 10;
  public let MAX_PENDING_PER_USER : Nat = 2;
  // 7 days.
  public let REFUSAL_COOLDOWN_NS : Int = 604_800_000_000_000;
  // 30 days.
  public let NEW_PAIR_BADGE_NS : Int = 2_592_000_000_000_000;
  public let MESSAGE_MAX_CHARS : Nat = 280;
  public let REASON_MAX_CHARS : Nat = 280;
  // Fixed 32-byte ASCII request deposit subaccount. Never change these bytes.
  public let REQUEST_DEPOSIT_SUBACCOUNT : Blob = "DEX-REQUEST-DEPOSIT-TTTI-T-00001";
  public let FEE_TIERS : [Types.FeeTier] = [#bps5, #bps30, #bps100];
  public let PROTOCOL_STATEMENT : Text = "The protocol places no price-linked order and creates no TTTI-T; the mint fee (1/101) buys TTTI-T without any price condition to feed pool liquidity.";
  public let LOCKED_SHARES_STATEMENT : Text = "The minimum locked shares √(A×B) belong to the contract forever.";
  public let APPROVAL_STATEMENT : Text = "Approval of a pair is not a recommendation.";

  // Launch depth: the first deposit that launches a pool must total at least
  // 100 USD, both sides combined (USD * 1e8, like the stored usdE8 rates).
  public let USD_RATE_SCALE : Nat = 100_000_000;
  public let LAUNCH_MIN_TOTAL_USD_E8 : Nat = 10_000_000_000;
  // TTTI-T fixed at 10,000 USD per token (same value as PresaleLib.TOKEN_PRICE_USD).
  public let TOKEN_PRICE_USD : Nat = 10_000;
  public let TTTI_T_USD_E8 : Nat = 1_000_000_000_000;
  // Same as OracleLib.VALID_FOR_NS and OracleLib.GRACE_NS (OracleLib.usableRate).
  public let RATE_VALID_FOR_NS : Nat = 3_600_000_000_000;
  public let RATE_GRACE_NS : Nat = 300_000_000_000;
  public let LAUNCH_DEPTH_STATEMENT : Text = "The first deposit that launches a pool must total at least 100 USD, both sides combined. TTTI-T is valued at a fixed 10,000 USD per token; ICP, ckBTC, ckUSDC and ckUSDT at the hourly stored rate, used only within its validity (1 hour plus 5 minutes). This rule adds to the minimum locked liquidity and the 10x first deposit minimum; the most demanding rule applies.";

  // USD value (USD * 1e8) of `amount` base units with `decimals` at `usdE8` per token.
  func usdValueE8(amount : Nat, decimals : Nat8, usdE8 : Nat) : Nat {
    amount * usdE8 / (10 ** decimals.toNat());
  };

  // Combined USD value of a launch deposit (rounded down), or the missing rates.
  // Pure helper for the first add-liquidity (lot 3); rates are usable usdE8 values.
  public func launchUsdValue(amount0 : Nat, decimals0 : Nat8, rate0 : ?Nat, amount1 : Nat, decimals1 : Nat8, rate1 : ?Nat) : Types.LaunchUsdValue {
    switch (rate0, rate1) {
      case (?r0, ?r1) #value(usdValueE8(amount0, decimals0, r0) + usdValueE8(amount1, decimals1, r1));
      case _ #missingRate({ token0 = rate0 == null; token1 = rate1 == null });
    };
  };

  // True when the combined value reaches LAUNCH_MIN_TOTAL_USD_E8.
  public func meetsLaunchDepth(totalUsdE8 : Nat) : Bool {
    totalUsdE8 >= LAUNCH_MIN_TOTAL_USD_E8;
  };

  // Known tokens (ledger id text, symbol, decimals).
  let ICP_LEDGER = "ryjl3-tyaaa-aaaaa-aaaba-cai";
  let CKBTC_LEDGER = "mxzaz-hqaaa-aaaar-qaada-cai";
  let CKUSDC_LEDGER = "xevnm-gaaaa-aaaar-qafnq-cai";
  let CKUSDT_LEDGER = "cngnf-vqaaa-aaaar-qag4q-cai";
  let KNOWN_SYMBOLS : [Text] = ["TTTI-T", "TTTI", "ICP", "ckBTC", "ckUSDC", "ckUSDT", "BTC", "USDC", "USDT"];

  func externalToken(ledgerText : Text, symbol : Text, decimals : Nat8) : Types.PoolToken {
    { ledger = #external(Principal.fromText(ledgerText)); symbol; decimals };
  };

  func tttiToken() : Types.PoolToken {
    { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
  };

  public func feeBps(tier : Types.FeeTier) : Nat {
    switch (tier) {
      case (#bps5) 5;
      case (#bps30) 30;
      case (#bps100) 100;
    };
  };

  // "DEX-POOL-<id>" with the id zero-padded to 32 ASCII bytes.
  public func poolSubaccount(id : PoolId) : Blob {
    var digits = id.toText();
    while (digits.size() < 23) {
      digits := "0" # digits;
    };
    ("DEX-POOL-" # digits).encodeUtf8();
  };

  public func ledgerPrincipal(ledger : Types.TokenLedger, canister : Principal) : Principal {
    switch (ledger) {
      case (#internal) canister;
      case (#external(p)) p;
    };
  };

  // True for the ICP, ckBTC, ckUSDC and ckUSDT ledgers.
  public func isKnownLedger(ledgerId : Principal) : Bool {
    let t = ledgerId.toText();
    t == ICP_LEDGER or t == CKBTC_LEDGER or t == CKUSDC_LEDGER or t == CKUSDT_LEDGER;
  };

  public func kindText(kind : Types.PoolKind) : Text {
    switch (kind) {
      case (#tttiPair) "tttiPair";
      case (#utilityPair) "utilityPair";
    };
  };

  public func poolStatusText(status : Types.PoolStatus) : Text {
    switch (status) {
      case (#filling) "filling";
      case (#active) "active";
      case (#removed) "removed";
    };
  };

  public func requestStatusText(status : Types.RequestStatus) : Text {
    switch (status) {
      case (#pending) "pending";
      case (#approved(_)) "approved";
      case (#refused(_)) "refused";
    };
  };

  public func requestDepositAccount(canister : Principal) : Types.DexAccount {
    { owner = canister; subaccount = ?REQUEST_DEPOSIT_SUBACCOUNT };
  };

  public func config(canister : Principal) : Types.DexConfig {
    {
      requestDeposit = REQUEST_DEPOSIT;
      depositAccount = requestDepositAccount(canister);
      maxPendingPerUser = MAX_PENDING_PER_USER;
      refusalCooldownNs = REFUSAL_COOLDOWN_NS;
      messageMaxChars = MESSAGE_MAX_CHARS;
      reasonMaxChars = REASON_MAX_CHARS;
      newPairBadgeNs = NEW_PAIR_BADGE_NS;
      tttiMinimumLocked = TTTI_MINIMUM_LOCKED;
      firstDepositMultiplier = FIRST_DEPOSIT_MULTIPLIER;
      feeTiers = FEE_TIERS;
      protocolStatement = PROTOCOL_STATEMENT;
      lockedSharesStatement = LOCKED_SHARES_STATEMENT;
      approvalStatement = APPROVAL_STATEMENT;
      launchMinimumTotalUsdE8 = LAUNCH_MIN_TOTAL_USD_E8;
      usdRateScale = USD_RATE_SCALE;
      tttiTUsdE8 = TTTI_T_USD_E8;
      rateValidForNs = RATE_VALID_FOR_NS;
      rateGraceNs = RATE_GRACE_NS;
      launchDepthStatement = LAUNCH_DEPTH_STATEMENT;
      minLockNs = MIN_LOCK_NS;
      maxLockNs = MAX_LOCK_NS;
      swapDeadlineMaxNs = SWAP_DEADLINE_MAX_NS;
      lpFeeSharePercent = LP_FEE_SHARE_PERCENT;
      protocolFeeSharePercent = PROTOCOL_FEE_SHARE_PERCENT;
    };
  };

  func tokenView(token : Types.PoolToken, canister : Principal) : Types.PoolTokenView {
    {
      ledgerId = ledgerPrincipal(token.ledger, canister);
      symbol = token.symbol;
      decimals = token.decimals;
      isTttiT = token.ledger == #internal;
    };
  };

  func timesFirst(m : ?Nat) : ?Nat {
    switch (m) {
      case (?n) ?(n * FIRST_DEPOSIT_MULTIPLIER);
      case null null;
    };
  };

  func minimumsSet(pool : Pool) : Bool {
    switch (pool.kind) {
      case (#tttiPair) pool.minimumLocked.token0 != null or pool.minimumLocked.token1 != null;
      case (#utilityPair) pool.minimumLocked.token0 != null and pool.minimumLocked.token1 != null;
    };
  };

  public func toPoolView(pool : Pool, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : PoolView {
    let set = minimumsSet(pool);
    let status = effectiveStatus(pool, rateOf);
    {
      id = pool.id;
      token0 = tokenView(pool.token0, canister);
      token1 = tokenView(pool.token1, canister);
      feeTier = pool.feeTier;
      feeBps = feeBps(pool.feeTier);
      kind = pool.kind;
      status;
      createdAt = pool.createdAt;
      subaccount = pool.subaccount;
      subaccountText = pool.subaccount.decodeUtf8() ?? "";
      poolAccount = { owner = canister; subaccount = ?pool.subaccount };
      minimumLocked = pool.minimumLocked;
      firstDepositMinimum = {
        token0 = timesFirst(pool.minimumLocked.token0);
        token1 = timesFirst(pool.minimumLocked.token1);
      };
      minimumsSet = set;
      lockedSharesStatement = LOCKED_SHARES_STATEMENT;
      launchMinimumTotalUsdE8 = LAUNCH_MIN_TOTAL_USD_E8;
      newPairBadgeUntil = pool.newPairBadgeUntil;
      newPairBadgeActive = switch (pool.newPairBadgeUntil) {
        case (?until) now < until;
        case null false;
      };
      approvalStatement = switch (pool.requestId) {
        case (?_) ?APPROVAL_STATEMENT;
        case null null;
      };
      requestId = pool.requestId;
      removedAt = pool.removedAt;
      acceptsSwaps = status == #active;
      acceptsDeposits = pool.status != #removed and set;
      acceptsWithdrawals = true;
      reserve0 = pool.reserve0;
      reserve1 = pool.reserve1;
      totalShares = pool.totalShares;
      lockedShares = pool.lockedShares;
      protocolFee0 = pool.protocolFee0;
      protocolFee1 = pool.protocolFee1;
      gauge = usdGauge(pool, rateOf);
    };
  };

  public func toRequestView(request : PairRequest, canister : Principal) : PairRequestView {
    {
      id = request.id;
      requester = request.requester;
      token = request.token;
      counter = tokenView(request.counter, canister);
      feeTier = request.feeTier;
      feeBps = feeBps(request.feeTier);
      kind = request.kind;
      message = request.message;
      createdAt = request.createdAt;
      checks = request.checks;
      copiedSymbol = request.checks.copiedSymbolOf != null;
      depositAmount = request.depositAmount;
      depositBlock = request.depositBlock;
      status = request.status;
      refundBlock = request.refundBlock;
      refundStatus = request.refundStatus;
    };
  };

  public func listPools(store : DexStore, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : [PoolView] {
    store.pools.toArray().map(func((_, p)) = toPoolView(p, canister, now, rateOf));
  };

  public func getPool(store : DexStore, canister : Principal, now : Timestamp, poolId : PoolId, rateOf : UsdRateOf) : ?PoolView {
    switch (store.pools.get(poolId)) {
      case (?p) ?toPoolView(p, canister, now, rateOf);
      case null null;
    };
  };

  public func listRequests(store : DexStore, canister : Principal) : [PairRequestView] {
    store.requests.toArray().map(func((_, r)) = toRequestView(r, canister));
  };

  public func requestsOf(store : DexStore, canister : Principal, requester : Principal) : [PairRequestView] {
    store.requests.toArray().filter(func((_, r)) = r.requester == requester).map(func((_, r)) = toRequestView(r, canister));
  };

  // Message length, pending limit and refusal cooldown (no ledger call).
  public func checkRequestLimits(store : DexStore, requester : Principal, message : Text, now : Timestamp) : ?Types.RequestPairError {
    if (message.size() > MESSAGE_MAX_CHARS) {
      return ?#messageTooLong({ max = MESSAGE_MAX_CHARS });
    };
    var pending = 0;
    for (r in store.requests.values()) {
      if (r.requester == requester and r.status == #pending) {
        pending += 1;
      };
    };
    if (pending >= MAX_PENDING_PER_USER) {
      return ?#tooManyPending({ max = MAX_PENDING_PER_USER });
    };
    switch (store.lastRefusalAt.get(requester)) {
      case (?refusedAt) {
        let until = refusedAt + REFUSAL_COOLDOWN_NS;
        if (now < until) {
          return ?#cooldown({ until });
        };
      };
      case null {};
    };
    null;
  };

  // Counter token resolved to a pool token (known tokens or a token of an existing pool).
  public func resolveCounter(store : DexStore, counter : Types.CounterToken) : Result.Result<Types.PoolToken, Types.RequestPairError> {
    switch (counter) {
      case (#tttiT) #ok(tttiToken());
      case (#icp) #ok(externalToken(ICP_LEDGER, "ICP", 8));
      case (#ckbtc) #ok(externalToken(CKBTC_LEDGER, "ckBTC", 8));
      case (#ckusdc) #ok(externalToken(CKUSDC_LEDGER, "ckUSDC", 6));
      case (#ckusdt) #ok(externalToken(CKUSDT_LEDGER, "ckUSDT", 6));
      case (#poolToken(p)) {
        for (pool in store.pools.values()) {
          if (pool.status != #removed) {
            if (pool.token0.ledger == #external(p)) return #ok(pool.token0);
            if (pool.token1.ledger == #external(p)) return #ok(pool.token1);
          };
        };
        #err(#unknownCounterToken);
      };
    };
  };

  // ICRC-1 / ICRC-2 support (icrc1_supported_standards, then icrc10) and metadata.
  public func readLedger(ledgerId : Principal) : async* Result.Result<(Types.RequestedToken, Types.RequestChecks), Types.RequestPairError> {
    let tokenLedger : Types.TokenLedgerActor = actor (ledgerId.toText());
    var names : [Text] = [];
    var reached = false;
    var lastError = "";
    try {
      let standards = await tokenLedger.icrc1_supported_standards();
      names := standards.map(func s = s.name.toUpper());
      reached := true;
    } catch (e) {
      lastError := e.message();
    };
    if (not (names.contains("ICRC-1") and names.contains("ICRC-2"))) {
      try {
        let more = await tokenLedger.icrc10_supported_standards();
        names := names.concat(more.map(func s = s.name.toUpper()));
        reached := true;
      } catch (e) {
        if (not reached) { lastError := e.message() };
      };
    };
    if (not reached) {
      return #err(#ledgerUnreachable(lastError));
    };
    let icrc1 = names.contains("ICRC-1");
    let icrc2 = names.contains("ICRC-2");
    if (not (icrc1 and icrc2)) {
      return #err(#missingStandards({ icrc1; icrc2 }));
    };
    let (name, symbol, decimals, fee) = try {
      let n = await tokenLedger.icrc1_name();
      let s = await tokenLedger.icrc1_symbol();
      let d = await tokenLedger.icrc1_decimals();
      let f = await tokenLedger.icrc1_fee();
      (n, s, d, f);
    } catch (e) {
      return #err(#metadataUnavailable(e.message()));
    };
    if (symbol.size() == 0) {
      return #err(#metadataUnavailable("The ledger returned an empty symbol"));
    };
    #ok((
      { ledgerId; name; symbol; decimals; fee },
      { icrc1; icrc2; metadataRead = true; pairUnique = false; copiedSymbolOf = null },
    ));
  };

  // Upper-case letters and digits only.
  func normalizeSymbol(symbol : Text) : Text {
    var out = "";
    for (c in symbol.toUpper().toArray().values()) {
      if (c.isAlphabetic() or c.isDigit()) {
        out #= c.toText();
      };
    };
    out;
  };

  // Known token whose symbol the given symbol copies (case and separators ignored).
  public func copiedSymbol(symbol : Text) : ?Text {
    let normalized = normalizeSymbol(symbol);
    KNOWN_SYMBOLS.find(func known = normalizeSymbol(known) == normalized);
  };

  func samePair(x0 : Principal, x1 : Principal, a : Principal, b : Principal) : Bool {
    (x0 == a and x1 == b) or (x0 == b and x1 == a);
  };

  // Same two ledgers and fee tier, either order, among pools and non-refused requests.
  public func findExisting(store : DexStore, canister : Principal, a : Principal, b : Principal, tier : Types.FeeTier) : ?{ poolId : ?PoolId; requestId : ?RequestId } {
    for (pool in store.pools.values()) {
      if (pool.feeTier == tier and samePair(ledgerPrincipal(pool.token0.ledger, canister), ledgerPrincipal(pool.token1.ledger, canister), a, b)) {
        return ?{ poolId = ?pool.id; requestId = pool.requestId };
      };
    };
    for (r in store.requests.values()) {
      let refused = switch (r.status) {
        case (#refused(_)) true;
        case _ false;
      };
      if (not refused and r.feeTier == tier and samePair(r.token.ledgerId, ledgerPrincipal(r.counter.ledger, canister), a, b)) {
        let poolId = switch (r.status) {
          case (#approved(info)) ?info.poolId;
          case _ null;
        };
        return ?{ poolId; requestId = ?r.id };
      };
    };
    null;
  };

  public func addRequest(
    store : DexStore,
    requester : Principal,
    token : Types.RequestedToken,
    counter : Types.PoolToken,
    tier : Types.FeeTier,
    message : Text,
    checks : Types.RequestChecks,
    depositBlock : Nat,
    now : Timestamp,
  ) : PairRequest {
    let id = store.nextRequestId;
    store.nextRequestId += 1;
    let request : PairRequest = {
      id;
      requester;
      token;
      counter;
      feeTier = tier;
      kind = if (counter.ledger == #internal) #tttiPair else #utilityPair;
      message;
      createdAt = now;
      checks;
      depositAmount = REQUEST_DEPOSIT;
      depositBlock;
      status = #pending;
      refundBlock = null;
      refundStatus = #none;
    };
    store.requests.add(id, request);
    request;
  };

  // Pool tokens of a request: TTTI-T first for TTTI-T pairs, otherwise the
  // requested token first and the counter token second.
  func poolTokens(request : PairRequest) : (Types.PoolToken, Types.PoolToken) {
    let requested : Types.PoolToken = {
      ledger = #external(request.token.ledgerId);
      symbol = request.token.symbol;
      decimals = request.token.decimals;
    };
    switch (request.kind) {
      case (#tttiPair) (request.counter, requested);
      case (#utilityPair) (requested, request.counter);
    };
  };

  // Validates an approval before the deposit refund.
  public func prepareApproval(store : DexStore, canister : Principal, requestId : RequestId, minimums : ?Types.TokenMinimums) : Result.Result<PairRequest, Types.ApprovePairError> {
    let request = switch (store.requests.get(requestId)) {
      case (?r) r;
      case null return #err(#requestNotFound);
    };
    if (request.status != #pending) {
      return #err(#notPending);
    };
    switch (request.kind, minimums) {
      case (#tttiPair, ?_) return #err(#minimumsNotAllowed);
      case (#utilityPair, null) return #err(#minimumsRequired);
      case (#utilityPair, ?m) {
        if (m.token0 == 0 or m.token1 == 0) return #err(#invalidMinimums);
      };
      case (#tttiPair, null) {};
    };
    let (token0, token1) = poolTokens(request);
    let a = ledgerPrincipal(token0.ledger, canister);
    let b = ledgerPrincipal(token1.ledger, canister);
    for (pool in store.pools.values()) {
      if (pool.feeTier == request.feeTier and samePair(ledgerPrincipal(pool.token0.ledger, canister), ledgerPrincipal(pool.token1.ledger, canister), a, b)) {
        return #err(#pairExists({ poolId = pool.id }));
      };
    };
    #ok(request);
  };

  // Creates the pool (filling, badge until now + 30 days) and marks the request approved.
  // The DQ refund is recorded and sent afterwards through lib/retry.mo; the
  // approval does not depend on its outcome (refundStatus = #inProgress).
  public func completeApproval(store : DexStore, request : PairRequest, minimums : ?Types.TokenMinimums, now : Timestamp) : Pool {
    let id = store.nextPoolId;
    store.nextPoolId += 1;
    let (token0, token1) = poolTokens(request);
    let minimumLocked : Types.PoolMinimums = switch (request.kind, minimums) {
      case (#utilityPair, ?m) { { token0 = ?m.token0; token1 = ?m.token1 } };
      case (#utilityPair, null) { { token0 = null; token1 = null } };
      case (#tttiPair, _) { { token0 = ?TTTI_MINIMUM_LOCKED; token1 = null } };
    };
    let pool : Pool = {
      id;
      token0;
      token1;
      feeTier = request.feeTier;
      kind = request.kind;
      status = #filling;
      createdAt = now;
      subaccount = poolSubaccount(id);
      minimumLocked;
      newPairBadgeUntil = ?(now + NEW_PAIR_BADGE_NS);
      requestId = ?request.id;
      removedAt = null;
      reserve0 = 0;
      reserve1 = 0;
      totalShares = 0;
      lockedShares = 0;
      protocolFee0 = 0;
      protocolFee1 = 0;
    };
    store.pools.add(id, pool);
    store.requests.add(
      request.id,
      {
        request with
        status = #approved({ poolId = id; at = now });
        refundStatus = #inProgress;
      },
    );
    pool;
  };

  public func refuse(store : DexStore, requestId : RequestId, reason : Text, now : Timestamp) : Result.Result<PairRequest, Types.RefusePairError> {
    let request = switch (store.requests.get(requestId)) {
      case (?r) r;
      case null return #err(#requestNotFound);
    };
    if (request.status != #pending) {
      return #err(#notPending);
    };
    let trimmed = reason.trim(#char ' ');
    if (trimmed.size() == 0) {
      return #err(#reasonRequired);
    };
    if (trimmed.size() > REASON_MAX_CHARS) {
      return #err(#reasonTooLong({ max = REASON_MAX_CHARS }));
    };
    let updated : PairRequest = {
      request with
      status = #refused({ reason = trimmed; at = now });
    };
    store.requests.add(requestId, updated);
    store.lastRefusalAt.add(request.requester, now);
    #ok(updated);
  };

  public func remove(store : DexStore, poolId : PoolId, now : Timestamp) : Result.Result<Pool, Types.RemovePairError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed) {
      return #err(#alreadyRemoved);
    };
    let updated : Pool = { pool with status = #removed; removedAt = ?now };
    store.pools.add(poolId, updated);
    #ok(updated);
  };

  // --- DEX lot 2: per-user deposit subaccounts and internal balances --------

  // Error text of the calls refused while the DEX is paused (DEX lot 6).
  public let PAUSED_MESSAGE : Text = "The DEX is paused after a reserve mismatch. Withdrawals and liquidity removals remain available.";

  public let DEX_TOKENS : [Types.DexToken] = [#tttiT, #icp, #ckbtc, #ckusdc, #ckusdt];
  // Per-user DEX deposit subaccount tag: [0xDD, principal length, principal
  // bytes, zero padding] (32 bytes). No secret: anyone can recompute it. The
  // non-ASCII tag never overlaps the ASCII subaccounts (DEX-POOL-, request
  // deposit, fee collector, buyback escrow, cycles reserve), the BTC 0xBD tag
  // or the null / all-zero default subaccount.
  public let USER_DEPOSIT_TAG : Nat8 = 0xDD;

  public func userDepositSubaccount(owner : Principal) : Blob {
    let bytes = owner.toBlob().toArray();
    let size = bytes.size();
    Blob.fromArray(
      Array.tabulate<Nat8>(
        32,
        func i {
          if (i == 0) USER_DEPOSIT_TAG else if (i == 1) Nat8.fromNat(size) else if (i - 2 < size) bytes[i - 2] else 0;
        },
      )
    );
  };

  public func userDepositAccount(canister : Principal, owner : Principal) : Types.DexAccount {
    { owner = canister; subaccount = ?userDepositSubaccount(owner) };
  };

  public func poolAccount(store : DexStore, canister : Principal, poolId : PoolId) : ?Types.DexAccount {
    switch (store.pools.get(poolId)) {
      case (?pool) ?{ owner = canister; subaccount = ?pool.subaccount };
      case null null;
    };
  };

  // Stable map key of a token ("TTTI-T", "ICP", "ckBTC", "ckUSDC", "ckUSDT").
  public func tokenKey(token : Types.DexToken) : Text {
    tokenSymbol(token);
  };

  public func tokenSymbol(token : Types.DexToken) : Text {
    switch (token) {
      case (#tttiT) "TTTI-T";
      case (#icp) "ICP";
      case (#ckbtc) "ckBTC";
      case (#ckusdc) "ckUSDC";
      case (#ckusdt) "ckUSDT";
    };
  };

  public func tokenDecimals(token : Types.DexToken) : Nat8 {
    switch (token) {
      case (#tttiT or #icp or #ckbtc) 8;
      case (#ckusdc or #ckusdt) 6;
    };
  };

  // TTTI-T = this canister (internal ledger).
  public func tokenLedgerId(token : Types.DexToken, canister : Principal) : Principal {
    switch (token) {
      case (#tttiT) canister;
      case (#icp) Principal.fromText(ICP_LEDGER);
      case (#ckbtc) Principal.fromText(CKBTC_LEDGER);
      case (#ckusdc) Principal.fromText(CKUSDC_LEDGER);
      case (#ckusdt) Principal.fromText(CKUSDT_LEDGER);
    };
  };

  // Deposits and withdrawals must exceed one ledger fee (minimum fee + 1).
  public func tokenInfo(token : Types.DexToken, canister : Principal, fee : Nat) : Types.DexTokenInfo {
    {
      token;
      symbol = tokenSymbol(token);
      ledgerId = tokenLedgerId(token, canister);
      decimals = tokenDecimals(token);
      fee;
      minimumDeposit = fee + 1;
      minimumWithdrawal = fee + 1;
    };
  };

  func balanceOf(balances : Types.DexBalances, owner : Principal, token : Types.DexToken) : ?Types.DexBalance {
    switch (balances.get(owner)) {
      case (?perToken) perToken.get(tokenKey(token));
      case null null;
    };
  };

  func entry(balances : Types.DexBalances, owner : Principal, token : Types.DexToken) : Types.DexBalance {
    let perToken = switch (balances.get(owner)) {
      case (?m) m;
      case null {
        let m = Map.empty<Text, Types.DexBalance>();
        balances.add(owner, m);
        m;
      };
    };
    switch (perToken.get(tokenKey(token))) {
      case (?b) b;
      case null {
        let b : Types.DexBalance = { var available = 0; var reserved = 0 };
        perToken.add(tokenKey(token), b);
        b;
      };
    };
  };

  // One row per supported token, zero when nothing is held.
  public func balancesOf(balances : Types.DexBalances, owner : Principal, canister : Principal) : [Types.DexBalanceView] {
    DEX_TOKENS.map(
      func token {
        let (a, r) = switch (balanceOf(balances, owner, token)) {
          case (?b) (b.available, b.reserved);
          case null (0, 0);
        };
        { token; symbol = tokenSymbol(token); ledgerId = tokenLedgerId(token, canister); available = a; reserved = r };
      }
    );
  };

  public func available(balances : Types.DexBalances, owner : Principal, token : Types.DexToken) : Nat {
    switch (balanceOf(balances, owner, token)) {
      case (?b) b.available;
      case null 0;
    };
  };

  // DD settled: available += amount.
  public func credit(balances : Types.DexBalances, owner : Principal, token : Types.DexToken, amount : Nat) {
    let b = entry(balances, owner, token);
    b.available += amount;
  };

  // DW start: available -> reserved; false when available < amount.
  public func reserve(balances : Types.DexBalances, owner : Principal, token : Types.DexToken, amount : Nat) : Bool {
    if (available(balances, owner, token) < amount) {
      return false;
    };
    let b = entry(balances, owner, token);
    b.available -= amount;
    b.reserved += amount;
    true;
  };

  // DW Err / not arrived: reserved -> available.
  public func release(balances : Types.DexBalances, owner : Principal, token : Types.DexToken, amount : Nat) {
    let b = entry(balances, owner, token);
    let moved = Nat.min(amount, b.reserved);
    b.reserved -= moved;
    b.available += moved;
  };

  // DW Ok / Duplicate / arrived: reserved -= amount (final debit).
  public func settleReserved(balances : Types.DexBalances, owner : Principal, token : Types.DexToken, amount : Nat) {
    let b = entry(balances, owner, token);
    b.reserved -= Nat.min(amount, b.reserved);
  };

  public func refundStatusText(status : Types.PairRefundStatus) : Text {
    switch (status) {
      case (#none) "none";
      case (#inProgress) "inProgress";
      case (#needsReview) "needsReview";
      case (#refunded(_)) "refunded";
    };
  };

  public func setUtilityMinimums(store : DexStore, poolId : PoolId, minimums : Types.TokenMinimums) : Result.Result<Pool, Types.SetMinimumsError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.kind != #utilityPair) {
      return #err(#notUtilityPair);
    };
    if (pool.status == #removed) {
      return #err(#poolRemoved);
    };
    if (pool.status == #active or pool.totalShares > 0) {
      return #err(#liquidityAlreadyAdded);
    };
    if (minimums.token0 == 0 or minimums.token1 == 0) {
      return #err(#invalidMinimums);
    };
    let updated : Pool = {
      pool with
      minimumLocked = { token0 = ?minimums.token0; token1 = ?minimums.token1 };
    };
    store.pools.add(poolId, updated);
    #ok(updated);
  };

  // --- DEX lot 3: filling gauge, liquidity, LP positions, swaps ---------------

  // DexToken of a pool token (TTTI-T = #internal; known external ledgers), or
  // null for a token without internal balances.
  public func poolDexToken(token : Types.PoolToken) : ?Types.DexToken {
    switch (token.ledger) {
      case (#internal) ?#tttiT;
      case (#external(p)) {
        let t = p.toText();
        if (t == ICP_LEDGER) ?#icp else if (t == CKBTC_LEDGER) ?#ckbtc else if (t == CKUSDC_LEDGER) ?#ckusdc else if (t == CKUSDT_LEDGER) ?#ckusdt else null;
      };
    };
  };

  // Integer square root, rounded down.
  public func isqrt(n : Nat) : Nat {
    if (n < 2) return n;
    var x = n;
    var y = (x + 1) / 2;
    while (y < x) {
      x := y;
      y := (x + n / x) / 2;
    };
    x;
  };

  func ceilDiv(a : Nat, b : Nat) : Nat {
    (a + b - 1) / b;
  };

  func gaugeOf(pool : Pool, reserve0 : Nat, reserve1 : Nat, rateOf : UsdRateOf) : Types.UsdGauge {
    switch (launchUsdValue(reserve0, pool.token0.decimals, rateOf(pool.token0), reserve1, pool.token1.decimals, rateOf(pool.token1))) {
      case (#value(v)) {
        {
          currentUsdE8 = ?v;
          targetUsdE8 = LAUNCH_MIN_TOTAL_USD_E8;
          remainingUsdE8 = ?(if (meetsLaunchDepth(v)) 0 else LAUNCH_MIN_TOTAL_USD_E8 - v);
          valueAvailable = true;
          missingRate = { token0 = false; token1 = false };
        };
      };
      case (#missingRate(m)) {
        {
          currentUsdE8 = null;
          targetUsdE8 = LAUNCH_MIN_TOTAL_USD_E8;
          remainingUsdE8 = null;
          valueAvailable = false;
          missingRate = m;
        };
      };
    };
  };

  func reachesTarget(g : Types.UsdGauge) : Bool {
    switch (g.currentUsdE8) {
      case (?v) meetsLaunchDepth(v);
      case null false;
    };
  };

  // Gauge of the reserves' total USD value against LAUNCH_MIN_TOTAL_USD_E8
  // (uses launchUsdValue / meetsLaunchDepth).
  public func usdGauge(pool : Pool, rateOf : UsdRateOf) : Types.UsdGauge {
    gaugeOf(pool, pool.reserve0, pool.reserve1, rateOf);
  };

  // #filling reported as #active once the reserves reach the target with
  // usable rates (read-only; refreshOpening persists it).
  public func effectiveStatus(pool : Pool, rateOf : UsdRateOf) : Types.PoolStatus {
    if (pool.status == #filling and pool.totalShares > 0 and reachesTarget(usdGauge(pool, rateOf))) #active else pool.status;
  };

  // Persists #filling -> #active when the target is reached; returns the pool.
  public func refreshOpening(store : DexStore, poolId : PoolId, rateOf : UsdRateOf) : ?Pool {
    switch (store.pools.get(poolId)) {
      case (?pool) {
        if (pool.status == #filling and effectiveStatus(pool, rateOf) == #active) {
          let opened : Pool = { pool with status = #active };
          store.pools.add(poolId, opened);
          ?opened;
        } else ?pool;
      };
      case null null;
    };
  };

  // Persists #filling -> #active for every filling pool whose reserves now
  // reach the launch target at usable rates (called after a new rate is
  // stored). An absent or expired rate, or an unavailable gauge, opens
  // nothing. Returns the number of pools opened.
  public func openReadyPools(store : DexStore, rateOf : UsdRateOf) : Nat {
    var opened = 0;
    for (poolId in store.pools.keys().toArray().values()) {
      switch (store.pools.get(poolId)) {
        case (?pool) {
          if (pool.status == #filling) {
            switch (refreshOpening(store, poolId, rateOf)) {
              case (?after) { if (after.status == #active) opened += 1 };
              case null {};
            };
          };
        };
        case null {};
      };
    };
    opened;
  };

  // Lock key of a position (one operation at a time per position).
  public func positionLockKey(positionId : Types.PositionId) : Text {
    "DEXPOS/" # positionId.toText();
  };

  // available -= amount; false (no change) when available < amount.
  public func debit(balances : Types.DexBalances, owner : Principal, token : Types.DexToken, amount : Nat) : Bool {
    if (available(balances, owner, token) < amount) {
      return false;
    };
    let b = entry(balances, owner, token);
    b.available -= amount;
    true;
  };

  // Validates lockDurationNs in [MIN_LOCK_NS, MAX_LOCK_NS].
  public func checkLockDuration(lockDurationNs : Nat) : ?Types.AddLiquidityError {
    if (lockDurationNs < MIN_LOCK_NS) return ?#lockTooShort({ minimumNs = MIN_LOCK_NS });
    if (lockDurationNs > MAX_LOCK_NS) return ?#lockTooLong({ maximumNs = MAX_LOCK_NS });
    null;
  };

  // Shares that hold at least `minimum` of a reserve after the first deposit
  // (rounded up, in favor of the pool).
  func sharesForMinimum(minimum : ?Nat, amount : Nat, shares : Nat) : Nat {
    switch (minimum) {
      case (?m) ceilDiv(m * shares, amount);
      case null 0;
    };
  };

  // Amounts and shares for an add: first deposit mints floor(sqrt(A x B)),
  // lockedShares to the contract, checks the minimums (and 10x first deposit);
  // later deposits compute the counter amount from the reserves (rounded up)
  // and mint the lower proportional amount (rounded down).
  public func quoteAddLiquidity(store : DexStore, args : Types.AddLiquidityQuoteArgs, rateOf : UsdRateOf) : Result.Result<Types.AddLiquidityQuote, Types.AddLiquidityError> {
    let pool = switch (store.pools.get(args.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed) return #err(#poolRemoved);
    if (not minimumsSet(pool)) return #err(#minimumsNotSet);
    if (poolDexToken(pool.token0) == null or poolDexToken(pool.token1) == null) return #err(#unsupportedToken);
    if (args.amount == 0) return #err(#zeroAmount);
    let isFirstDeposit = pool.totalShares == 0;
    var amount0 = 0;
    var amount1 = 0;
    var shares = 0;
    var locked = 0;
    if (isFirstDeposit) {
      let counter = switch (args.counterAmount) {
        case (?c) c;
        case null return #err(#counterAmountRequired);
      };
      if (counter == 0) return #err(#zeroAmount);
      switch (args.side) {
        case (#token0) { amount0 := args.amount; amount1 := counter };
        case (#token1) { amount0 := counter; amount1 := args.amount };
      };
      let below = func(m : ?Nat, a : Nat) : Bool = switch (m) {
        case (?min) a < min * FIRST_DEPOSIT_MULTIPLIER;
        case null false;
      };
      if (below(pool.minimumLocked.token0, amount0) or below(pool.minimumLocked.token1, amount1)) {
        return #err(#belowMinimum({ token0Minimum = timesFirst(pool.minimumLocked.token0); token1Minimum = timesFirst(pool.minimumLocked.token1) }));
      };
      let total = isqrt(amount0 * amount1);
      locked := Nat.max(1, Nat.max(sharesForMinimum(pool.minimumLocked.token0, amount0, total), sharesForMinimum(pool.minimumLocked.token1, amount1, total)));
      if (total <= locked) return #err(#zeroShares);
      shares := total - locked;
    } else {
      if (pool.reserve0 == 0 or pool.reserve1 == 0) return #err(#zeroShares);
      let (required, provided) = switch (args.side) {
        case (#token0) {
          amount0 := args.amount;
          amount1 := ceilDiv(args.amount * pool.reserve1, pool.reserve0);
          (amount1, args.counterAmount);
        };
        case (#token1) {
          amount1 := args.amount;
          amount0 := ceilDiv(args.amount * pool.reserve0, pool.reserve1);
          (amount0, args.counterAmount);
        };
      };
      switch (provided) {
        case (?c) { if (c != required) return #err(#ratioMismatch({ requiredCounterAmount = required })) };
        case null {};
      };
      shares := Nat.min(amount0 * pool.totalShares / pool.reserve0, amount1 * pool.totalShares / pool.reserve1);
      if (shares == 0) return #err(#zeroShares);
    };
    let gaugeAfter = gaugeOf(pool, pool.reserve0 + amount0, pool.reserve1 + amount1, rateOf);
    #ok({
      poolId = pool.id;
      isFirstDeposit;
      amount0;
      amount1;
      shares;
      lockedShares = locked;
      totalSharesAfter = pool.totalShares + shares + locked;
      gaugeAfter;
      opensPool = pool.status == #filling and effectiveStatus(pool, rateOf) == #filling and reachesTarget(gaugeAfter);
    });
  };

  // Debits the owner's internal balances, updates reserves / shares, creates
  // the position with its own lock and runs refreshOpening.
  public func addLiquidity(
    store : DexStore,
    balances : Types.DexBalances,
    canister : Principal,
    owner : Principal,
    isCreator : Bool,
    args : Types.AddLiquidityArgs,
    rateOf : UsdRateOf,
    now : Timestamp,
  ) : Result.Result<Types.AddLiquidityResult, Types.AddLiquidityError> {
    switch (checkLockDuration(args.lockDurationNs)) {
      case (?e) return #err(e);
      case null {};
    };
    let q = switch (quoteAddLiquidity(store, { poolId = args.poolId; side = args.side; amount = args.amount; counterAmount = args.counterAmount }, rateOf)) {
      case (#ok(q)) q;
      case (#err(e)) return #err(e);
    };
    let pool = switch (store.pools.get(args.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    let (t0, t1) = switch (poolDexToken(pool.token0), poolDexToken(pool.token1)) {
      case (?a, ?b) (a, b);
      case _ return #err(#unsupportedToken);
    };
    let have0 = available(balances, owner, t0);
    if (have0 < q.amount0) return #err(#insufficientBalance({ token = t0; available = have0; required = q.amount0 }));
    let have1 = available(balances, owner, t1);
    if (have1 < q.amount1) return #err(#insufficientBalance({ token = t1; available = have1; required = q.amount1 }));
    ignore debit(balances, owner, t0, q.amount0);
    ignore debit(balances, owner, t1, q.amount1);
    store.pools.add(
      pool.id,
      {
        pool with
        reserve0 = pool.reserve0 + q.amount0;
        reserve1 = pool.reserve1 + q.amount1;
        totalShares = q.totalSharesAfter;
        lockedShares = pool.lockedShares + q.lockedShares;
      },
    );
    let updated = switch (refreshOpening(store, pool.id, rateOf)) {
      case (?p) p;
      case null pool;
    };
    let id = store.nextPositionId;
    store.nextPositionId += 1;
    let position : Position = {
      id;
      poolId = pool.id;
      owner;
      shares = q.shares;
      createdAt = now;
      lockDurationNs = args.lockDurationNs;
      unlockAt = now + args.lockDurationNs;
      isCreator;
    };
    store.positions.add(id, position);
    #ok({
      position = toPositionView(store, canister, position, now);
      amount0 = q.amount0;
      amount1 = q.amount1;
      shares = q.shares;
      lockedShares = q.lockedShares;
      pool = toPoolView(updated, canister, now, rateOf);
    });
  };

  // Owner only; after unlockAt, or any time on a removed pool. Burns the
  // shares and credits pro rata amounts (rounded down) to internal balances.
  public func removeLiquidity(
    store : DexStore,
    balances : Types.DexBalances,
    canister : Principal,
    owner : Principal,
    positionId : Types.PositionId,
    rateOf : UsdRateOf,
    now : Timestamp,
  ) : Result.Result<Types.RemoveLiquidityResult, Types.RemoveLiquidityError> {
    let position = switch (store.positions.get(positionId)) {
      case (?p) p;
      case null return #err(#positionNotFound);
    };
    if (position.owner != owner) return #err(#notPositionOwner);
    let pool = switch (store.pools.get(position.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status != #removed and now < position.unlockAt) {
      return #err(#positionLocked({ unlockAt = position.unlockAt }));
    };
    let amount0 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve0 / pool.totalShares;
    let amount1 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve1 / pool.totalShares;
    let updated : Pool = {
      pool with
      reserve0 = pool.reserve0 - amount0;
      reserve1 = pool.reserve1 - amount1;
      totalShares = pool.totalShares - Nat.min(position.shares, pool.totalShares);
    };
    store.pools.add(pool.id, updated);
    store.positions.remove(positionId);
    switch (poolDexToken(pool.token0)) {
      case (?t) { if (amount0 > 0) credit(balances, owner, t, amount0) };
      case null {};
    };
    switch (poolDexToken(pool.token1)) {
      case (?t) { if (amount1 > 0) credit(balances, owner, t, amount1) };
      case null {};
    };
    #ok({
      positionId;
      poolId = pool.id;
      shares = position.shares;
      amount0;
      amount1;
      pool = toPoolView(updated, canister, now, rateOf);
    });
  };

  // Owner only; newUnlockAt >= current unlockAt and <= position creation date +
  // MAX_LOCK_NS (5 years from creation, never from now).
  public func extendLock(store : DexStore, canister : Principal, owner : Principal, positionId : Types.PositionId, newUnlockAt : Timestamp, now : Timestamp) : Result.Result<PositionView, Types.ExtendLockError> {
    let position = switch (store.positions.get(positionId)) {
      case (?p) p;
      case null return #err(#positionNotFound);
    };
    if (position.owner != owner) return #err(#notPositionOwner);
    if (newUnlockAt < position.unlockAt) return #err(#cannotShortenLock({ unlockAt = position.unlockAt }));
    let maximumUnlockAt = position.createdAt + MAX_LOCK_NS;
    if (newUnlockAt > maximumUnlockAt) return #err(#lockTooLong({ maximumUnlockAt }));
    let updated : Position = {
      position with
      unlockAt = newUnlockAt;
      lockDurationNs = Int.abs(newUnlockAt - position.createdAt);
    };
    store.positions.add(positionId, updated);
    #ok(toPositionView(store, canister, updated, now));
  };

  public func toPositionView(store : DexStore, canister : Principal, position : Position, now : Timestamp) : PositionView {
    ignore canister;
    let (amount0, amount1, symbol0, symbol1, removed) = switch (store.pools.get(position.poolId)) {
      case (?pool) {
        let a0 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve0 / pool.totalShares;
        let a1 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve1 / pool.totalShares;
        (a0, a1, pool.token0.symbol, pool.token1.symbol, pool.status == #removed);
      };
      case null (0, 0, "", "", false);
    };
    let unlocked = now >= position.unlockAt;
    {
      id = position.id;
      poolId = position.poolId;
      owner = position.owner;
      shares = position.shares;
      amount0;
      amount1;
      token0Symbol = symbol0;
      token1Symbol = symbol1;
      createdAt = position.createdAt;
      lockDurationNs = position.lockDurationNs;
      unlockAt = position.unlockAt;
      isCreator = position.isCreator;
      unlocked;
      withdrawable = unlocked or removed;
    };
  };

  public func getPosition(store : DexStore, canister : Principal, positionId : Types.PositionId, now : Timestamp) : ?PositionView {
    switch (store.positions.get(positionId)) {
      case (?p) ?toPositionView(store, canister, p, now);
      case null null;
    };
  };

  public func positionsOfPool(store : DexStore, canister : Principal, poolId : PoolId, now : Timestamp) : [PositionView] {
    store.positions.toArray().filter(func((_, p)) = p.poolId == poolId).map(func((_, p)) = toPositionView(store, canister, p, now));
  };

  public func positionsOf(store : DexStore, canister : Principal, owner : Principal, now : Timestamp) : [PositionView] {
    store.positions.toArray().filter(func((_, p)) = p.owner == owner).map(func((_, p)) = toPositionView(store, canister, p, now));
  };

  // Constant product v2: fee = ceil(amountIn x feeBps / 10,000) (0 when
  // feeFree); amountOut = floor(reserveOut x net / (reserveIn + net)).
  public func amountOut(reserveIn : Nat, reserveOut : Nat, amountIn : Nat, feeBps : Nat, feeFree : Bool) : { amountOut : Nat; fee : Nat } {
    let fee = if (feeFree) 0 else Nat.min(amountIn, ceilDiv(amountIn * feeBps, BPS_DENOMINATOR));
    let net = amountIn - fee;
    let out = if (reserveIn + net == 0) 0 else reserveOut * net / (reserveIn + net);
    { amountOut = out; fee };
  };

  // Protocol part = floor(fee x 30 / 100); LP part = fee - protocol part.
  public func splitFee(fee : Nat) : { lpFee : Nat; protocolFee : Nat } {
    let protocolFee = fee * PROTOCOL_FEE_SHARE_PERCENT / 100;
    { lpFee = fee - protocolFee; protocolFee };
  };

  // --- DEX lot 7: swap activity recording -------------------------------------

  // The indicators store is passed to swap by its callers (DexContext.indicators).

  public let HOUR_NS : Nat = 3_600_000_000_000;
  // Hourly activity buckets are kept for 7 days.
  public let ACTIVITY_HOURS : Nat = 168;

  // Adds one swap to the pool's current hourly bucket and the running totals,
  // then prunes buckets older than 7 days. Touches only the indicators store.
  func recordSwap(store : IndicatorTypes.IndicatorsStore, poolId : PoolId, zeroForOne : Bool, amountIn : Nat, fee : Nat, now : Timestamp) {
    if (now < 0) return;
    let hour = Int.abs(now) / HOUR_NS;
    if (store.recordingSince == null) store.recordingSince := ?now;
    let activity : IndicatorTypes.PoolActivity = switch (store.activity.get(poolId)) {
      case (?a) a;
      case null {
        let a : IndicatorTypes.PoolActivity = {
          buckets = List.empty();
          var totalSwaps = 0;
          var totalVolume0 = 0;
          var totalVolume1 = 0;
          var totalFee0 = 0;
          var totalFee1 = 0;
        };
        store.activity.add(poolId, a);
        a;
      };
    };
    let bucket : IndicatorTypes.HourBucket = switch (activity.buckets.last()) {
      case (?b) {
        if (b.hour == hour) b else {
          let n : IndicatorTypes.HourBucket = { hour; var swapCount = 0; var volume0 = 0; var volume1 = 0; var fee0 = 0; var fee1 = 0 };
          activity.buckets.add(n);
          activity.buckets.retain(func(x : IndicatorTypes.HourBucket) : Bool = x.hour + ACTIVITY_HOURS > hour);
          n;
        };
      };
      case null {
        let n : IndicatorTypes.HourBucket = { hour; var swapCount = 0; var volume0 = 0; var volume1 = 0; var fee0 = 0; var fee1 = 0 };
        activity.buckets.add(n);
        n;
      };
    };
    bucket.swapCount += 1;
    activity.totalSwaps += 1;
    if (zeroForOne) {
      bucket.volume0 += amountIn;
      bucket.fee0 += fee;
      activity.totalVolume0 += amountIn;
      activity.totalFee0 += fee;
    } else {
      bucket.volume1 += amountIn;
      bucket.fee1 += fee;
      activity.totalVolume1 += amountIn;
      activity.totalFee1 += fee;
    };
  };

  type SwapCalc = {
    pool : Pool;
    zeroForOne : Bool;
    tokenOut : Types.DexToken;
    reserveIn : Nat;
    reserveOut : Nat;
    amountOut : Nat;
    fee : Nat;
    lpFee : Nat;
    protocolFee : Nat;
    feeBps : Nat;
  };

  func swapCalc(store : DexStore, poolId : PoolId, tokenIn : Types.DexToken, amountIn : Nat, feeFree : Bool, rateOf : UsdRateOf) : Result.Result<SwapCalc, Types.SwapError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed) return #err(#poolRemoved);
    switch (effectiveStatus(pool, rateOf)) {
      case (#filling) return #err(#poolFilling({ gauge = usdGauge(pool, rateOf) }));
      case (#removed) return #err(#poolRemoved);
      case (#active) {};
    };
    let (t0, t1) = switch (poolDexToken(pool.token0), poolDexToken(pool.token1)) {
      case (?a, ?b) (a, b);
      case _ return #err(#unsupportedToken);
    };
    let zeroForOne = if (tokenIn == t0) true else if (tokenIn == t1) false else return #err(#tokenNotInPool);
    if (amountIn == 0) return #err(#zeroAmount);
    let (reserveIn, reserveOut, tokenOut) = if (zeroForOne) (pool.reserve0, pool.reserve1, t1) else (pool.reserve1, pool.reserve0, t0);
    if (reserveIn == 0 or reserveOut == 0) return #err(#insufficientLiquidity);
    let bps = feeBps(pool.feeTier);
    let r = amountOut(reserveIn, reserveOut, amountIn, bps, feeFree);
    if (r.amountOut == 0 or r.amountOut >= reserveOut) return #err(#insufficientLiquidity);
    let split = splitFee(r.fee);
    #ok({
      pool;
      zeroForOne;
      tokenOut;
      reserveIn;
      reserveOut;
      amountOut = r.amountOut;
      fee = r.fee;
      lpFee = split.lpFee;
      protocolFee = split.protocolFee;
      feeBps = if (feeFree) 0 else bps;
    });
  };

  public func quoteSwap(store : DexStore, poolId : PoolId, tokenIn : Types.DexToken, amountIn : Nat, slippageBps : Nat, rateOf : UsdRateOf, now : Timestamp) : Result.Result<Types.SwapQuote, Types.SwapError> {
    if (slippageBps > BPS_DENOMINATOR) return #err(#invalidSlippage({ maximumBps = BPS_DENOMINATOR }));
    let c = switch (swapCalc(store, poolId, tokenIn, amountIn, false, rateOf)) {
      case (#ok(c)) c;
      case (#err(e)) return #err(e);
    };
    // Output at the current reserve ratio without impact (net of the fee).
    let ideal = (amountIn - c.fee) * c.reserveOut / c.reserveIn;
    let priceImpactBps = if (ideal == 0 or ideal <= c.amountOut) 0 else ceilDiv((ideal - c.amountOut) * BPS_DENOMINATOR, ideal);
    #ok({
      poolId;
      tokenIn;
      tokenOut = c.tokenOut;
      amountIn;
      amountOut = c.amountOut;
      fee = c.fee;
      lpFee = c.lpFee;
      protocolFee = c.protocolFee;
      feeBps = c.feeBps;
      priceImpactBps;
      slippageBps;
      minimumReceived = c.amountOut * (BPS_DENOMINATOR - slippageBps) / BPS_DENOMINATOR;
      maxDeadlineNs = Int.abs(now) + SWAP_DEADLINE_MAX_NS;
    });
  };

  // From internal balances on an open non-removed pool; refused with no change
  // when amountOut < minAmountOut, now > deadline or deadline > now + 5 min.
  // LP fee stays in the reserves; protocol fee goes to protocolFee0/1.
  // feeFree = contract's own conversions (internal flag, no public endpoint).
  public func swap(
    store : DexStore,
    balances : Types.DexBalances,
    canister : Principal,
    owner : Principal,
    poolId : PoolId,
    tokenIn : Types.DexToken,
    amountIn : Nat,
    minAmountOut : Nat,
    deadline : Timestamp,
    feeFree : Bool,
    rateOf : UsdRateOf,
    now : Timestamp,
    indicators : IndicatorTypes.IndicatorsStore,
  ) : Result.Result<Types.SwapResult, Types.SwapError> {
    if (now > deadline) return #err(#deadlineExceeded({ deadline; now }));
    let maximum = now + SWAP_DEADLINE_MAX_NS;
    if (deadline > maximum) return #err(#deadlineTooFar({ maximum }));
    let c = switch (swapCalc(store, poolId, tokenIn, amountIn, feeFree, rateOf)) {
      case (#ok(c)) c;
      case (#err(e)) return #err(e);
    };
    if (c.amountOut < minAmountOut) return #err(#slippageExceeded({ amountOut = c.amountOut; minAmountOut }));
    let have = available(balances, owner, tokenIn);
    if (have < amountIn) return #err(#insufficientBalance({ available = have }));
    ignore debit(balances, owner, tokenIn, amountIn);
    credit(balances, owner, c.tokenOut, c.amountOut);
    // LP fee stays in the input reserve; the protocol part is kept outside.
    let inReserve = amountIn - c.protocolFee;
    let pool = c.pool;
    let updated : Pool = if (c.zeroForOne) {
      {
        pool with
        status = #active;
        reserve0 = pool.reserve0 + inReserve;
        reserve1 = pool.reserve1 - c.amountOut;
        protocolFee0 = pool.protocolFee0 + c.protocolFee;
      };
    } else {
      {
        pool with
        status = #active;
        reserve1 = pool.reserve1 + inReserve;
        reserve0 = pool.reserve0 - c.amountOut;
        protocolFee1 = pool.protocolFee1 + c.protocolFee;
      };
    };
    store.pools.add(poolId, updated);
    recordSwap(indicators, poolId, c.zeroForOne, amountIn, c.fee, now);
    #ok({
      poolId;
      tokenIn;
      tokenOut = c.tokenOut;
      amountIn;
      amountOut = c.amountOut;
      fee = c.fee;
      lpFee = c.lpFee;
      protocolFee = c.protocolFee;
      pool = toPoolView(updated, canister, now, rateOf);
    });
  };
};
