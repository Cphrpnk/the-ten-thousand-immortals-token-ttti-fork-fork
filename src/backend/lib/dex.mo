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
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/dex";
import IndicatorTypes "../types/dex-indicators";
import ProtocolFeeTypes "../types/protocol-fees";

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
  // missing / expired. Supplied by the caller (mixins/dex-api.mo) from
  // OracleLib.usableRate; TTTI-T has no USD value, never an instantaneous pool price.
  public type UsdRateOf = Types.PoolToken -> ?Nat;

  // DEX lot 3 constants.
  // PTM-3: the lock is optional; 0 = no lock (free position). A lock lasts at
  // least 3 months and at most 5 years, at opening and after an extension (the
  // only rule is the remaining time). FIVE_YEARS is the single 5-year
  // constant: MAX_LOCK_NS and the fee weight sqrt(remaining / FIVE_YEARS).
  public let MIN_LOCK_NS : Nat = 7_862_400_000_000_000; // 3 months (91 days)
  public let FIVE_YEARS : Nat = 157_766_400_000_000_000; // 5 years (1826 days)
  public let MAX_LOCK_NS : Nat = FIVE_YEARS;
  // PTM-3: the relay budget of a commitment is one third of its weight.
  public let RELAY_DIVISOR : Nat = 3;
  // PTM-3: half of the LP fee is set aside for the locked positions.
  public let LOCKED_FEE_SHARE_PERCENT : Nat = 50;
  public let SWAP_DEADLINE_MAX_NS : Nat = 300_000_000_000; // 5 minutes
  public let BPS_DENOMINATOR : Nat = 10_000;
  // DEX-2 constants.
  // Swap opening threshold: 10 USD (USD x 1e8). TTTI-T pairs: the TTTI-T side
  // at the pool price (= the counterpart reserve at the oracle rate); utility
  // pairs: total depth (sum of both sides). It applies to swaps only: pool
  // creation, deposits, liquidity changes, buying and the mint are never
  // refused because of it.
  public let SWAP_THRESHOLD_USD_E8 : Nat = 1_000_000_000;
  public let DEFAULT_SLIPPAGE_BPS : Nat = 50; // 0.5 %
  public let MAX_SLIPPAGE_BPS : Nat = 10_000;
  // First deposit within 2 % of the reference ratio.
  public let REFERENCE_TOLERANCE_BPS : Nat = 200;
  // Announced pair removal: effective 5 days after the announcement.
  public let REMOVAL_NOTICE_NS : Nat = 432_000_000_000_000;
  // An ICPSwap reading older than 6 hours is no longer a reference source.
  public let SAMPLE_MAX_AGE_NS : Nat = 21_600_000_000_000;
  // Swap fee: 70 % stays in the reserves (LPs); 30 % protocol share accrued in
  // protocolFee0/1, then split by the protocol fees library
  // (ProtocolFeesLib.splitPoolFees): two thirds to the creator, one third to
  // permanent liquidity. Nothing is recycled into the same pool.
  public let LP_FEE_SHARE_PERCENT : Nat = 70;
  public let PROTOCOL_FEE_SHARE_PERCENT : Nat = 30;

  // Pair request deposit: 0.0005 TTTI-T.
  public let REQUEST_DEPOSIT : Nat = 50_000;
  // TTTI-T side minimum locked liquidity: 0.0001 TTTI-T.
  public let TTTI_MINIMUM_LOCKED : Nat = 10_000;
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
  public let PROTOCOL_STATEMENT : Text = "The protocol never places a price-linked order. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. No reward is created: everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it. TTTI-T generates nothing by itself; swap fees pay the liquidity provided, and only the fees actually paid over the past 30 days are shown. No text here promises or aims at a price rise.";
  public let LOCKED_SHARES_STATEMENT : Text = "The minimum locked shares √(A×B) belong to the contract forever.";
  public let APPROVAL_STATEMENT : Text = "Approval of a pair is not a recommendation.";

  // USD * 1e8, like the stored usdE8 rates. There is no minimum to create or
  // fund a pool; 10 USD is the swap-opening threshold only.
  public let USD_RATE_SCALE : Nat = 100_000_000;
  public let TOKEN_PRICE_USD : Nat = 10_000;
  // PTM-10c: value of a pair request deposit, 0.0005 TTTI-T at the mint price
  // (10,000 USD per TTTI-T) = 5 USD, in USD * 1e8.
  public let REQUEST_DEPOSIT_USD_E8 : Nat = 500_000_000; // = REQUEST_DEPOSIT x TOKEN_PRICE_USD
  // Same as OracleLib.VALID_FOR_NS and OracleLib.GRACE_NS (OracleLib.usableRate).
  public let RATE_VALID_FOR_NS : Nat = 3_600_000_000_000;
  public let RATE_GRACE_NS : Nat = 300_000_000_000;
  public let LAUNCH_DEPTH_STATEMENT : Text = "A pool accepts swaps only while it meets a threshold of 10 USD: for a TTTI-T pair, the TTTI-T side valued at the pool price must be worth at least 10 USD, which equals a counterpart reserve of at least 10 USD at the hourly stored rate (TTTI-T is never valued at a fixed price); for a utility pair, the total depth (both sides at the hourly stored rate) must be at least 10 USD. Rates are used only within their validity (1 hour plus 5 minutes). The check is repeated at every swap, so a pool reopens as soon as the threshold is met and closes again when its depth falls. The threshold applies to swaps only: creating a pool, depositing, adding or removing liquidity, buying and the mint are never refused because of it, and every deposit grows the pool capitalisation. Adding liquidity is suspended while a pair removal is announced; voluntary withdrawals stay allowed, subject to position locks. There is no minimum to create a pool or make its first deposit: the first deposit receives √(A×B) shares, of which the minimum locked shares stay with the contract forever, never more than half of the shares it creates.";

  // USD value (USD * 1e8) of `amount` base units with `decimals` at `usdE8` per token.
  func usdValueE8(amount : Nat, decimals : Nat8, usdE8 : Nat) : Nat {
    amount * usdE8 / (10 ** decimals.toNat());
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

  // PTM-10c: one request deposit subaccount per accepted token, 32 bytes of
  // ASCII ("DEX-REQUEST-DEPOSIT-" plus 12 characters). TTTI-T keeps the
  // subaccount of the earlier requests. Never change these bytes.
  public func requestDepositSubaccount(token : Types.DexToken) : Blob {
    switch (token) {
      case (#tttiT) REQUEST_DEPOSIT_SUBACCOUNT;
      case (#icp) "DEX-REQUEST-DEPOSIT-ICP-00000001";
      case (#ckbtc) "DEX-REQUEST-DEPOSIT-CKBTC-000001";
      case (#ckusdc) "DEX-REQUEST-DEPOSIT-CKUSDC-00001";
      case (#ckusdt) "DEX-REQUEST-DEPOSIT-CKUSDT-00001";
    };
  };

  public func requestDepositAccountOf(canister : Principal, token : Types.DexToken) : Types.DexAccount {
    { owner = canister; subaccount = ?requestDepositSubaccount(token) };
  };

  public func isRequestDepositSubaccount(sub : Blob) : Bool {
    for (token in DEX_TOKENS.values()) {
      if (sub == requestDepositSubaccount(token)) return true;
    };
    false;
  };

  // Amount of an accepted token worth 5 USD at the hourly rate `usdE8` (USD *
  // 1e8 per whole token), rounded up; `decimals` are the token decimals.
  public func requestDepositAmount(usdE8 : Nat, decimals : Nat) : Nat {
    if (usdE8 == 0) return 0;
    (REQUEST_DEPOSIT_USD_E8 * (10 ** decimals) + usdE8 - 1) / usdE8;
  };

  public func config(canister : Principal) : Types.DexConfig {
    {
      requestDeposit = REQUEST_DEPOSIT;
      depositAccount = requestDepositAccount(canister);
      requestDepositUsdE8 = REQUEST_DEPOSIT_USD_E8;
      requestDepositAccounts = DEX_TOKENS.filter(func t = t != #tttiT).map(func t = { token = t; account = requestDepositAccountOf(canister, t) });
      maxPendingPerUser = MAX_PENDING_PER_USER;
      refusalCooldownNs = REFUSAL_COOLDOWN_NS;
      messageMaxChars = MESSAGE_MAX_CHARS;
      reasonMaxChars = REASON_MAX_CHARS;
      newPairBadgeNs = NEW_PAIR_BADGE_NS;
      tttiMinimumLocked = TTTI_MINIMUM_LOCKED;
      // No longer enforced: kept at 0 for compatibility.
      firstDepositMultiplier = 0;
      feeTiers = FEE_TIERS;
      protocolStatement = PROTOCOL_STATEMENT;
      lockedSharesStatement = LOCKED_SHARES_STATEMENT;
      approvalStatement = APPROVAL_STATEMENT;
      launchMinimumTotalUsdE8 = 0;
      usdRateScale = USD_RATE_SCALE;
      tttiTUsdE8 = 0;
      rateValidForNs = RATE_VALID_FOR_NS;
      rateGraceNs = RATE_GRACE_NS;
      launchDepthStatement = LAUNCH_DEPTH_STATEMENT;
      minLockNs = MIN_LOCK_NS;
      maxLockNs = MAX_LOCK_NS;
      swapDeadlineMaxNs = SWAP_DEADLINE_MAX_NS;
      lpFeeSharePercent = LP_FEE_SHARE_PERCENT;
      protocolFeeSharePercent = PROTOCOL_FEE_SHARE_PERCENT;
      swapThresholdUsdE8 = SWAP_THRESHOLD_USD_E8;
      defaultSlippageBps = DEFAULT_SLIPPAGE_BPS;
      referenceToleranceBps = REFERENCE_TOLERANCE_BPS;
      removalNoticeNs = REMOVAL_NOTICE_NS;
      relayDivisor = RELAY_DIVISOR;
      lockedFeeSharePercent = LOCKED_FEE_SHARE_PERCENT;
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

  // No first-deposit minimum: 0 once the minimum is set (compatibility field).
  func noFirstMinimum(m : ?Nat) : ?Nat {
    switch (m) {
      case (?_) ?0;
      case null null;
    };
  };

  func minimumsSet(pool : Pool) : Bool {
    switch (pool.kind) {
      case (#tttiPair) pool.minimumLocked.token0 != null or pool.minimumLocked.token1 != null;
      case (#utilityPair) pool.minimumLocked.token0 != null and pool.minimumLocked.token1 != null;
    };
  };

  // Pool view with the exact guaranteed depth (scans the pool's positions
  // through the index): queries and the liquidity operations.
  public func toPoolView(store : DexStore, pool : Pool, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : PoolView {
    poolViewWith(store, pool, canister, now, rateOf, guaranteedDepthOf(store, pool, rateOf, now), independentReferenceFor(store, pool, rateOf, now));
  };

  // Pool view of the swap path: the guaranteed depth comes from the figure
  // maintained per pool (PoolPot.lockedPositionShares), so a swap reads no
  // position whatever the number of positions in the pool.
  public func toPoolViewCached(store : DexStore, pool : Pool, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : PoolView {
    poolViewWith(store, pool, canister, now, rateOf, cachedGuaranteedDepth(store, pool, rateOf), independentReferenceFor(store, pool, rateOf, now));
  };

  // Independent reference needed by the spread of one pool: the consolidated
  // price without that pool; not computed for a pool that has no spread
  // (utility pair).
  func independentReferenceFor(store : DexStore, pool : Pool, rateOf : UsdRateOf, now : Timestamp) : ?Nat {
    if (tttiCounterOf(pool) == null) null else consolidatedExcluding(store, rateOf, now, pool.id).price;
  };

  // `reference` is the independent reference (consolidated price without this
  // pool) of the same instant.
  func poolViewWith(store : DexStore, pool : Pool, canister : Principal, now : Timestamp, rateOf : UsdRateOf, guaranteed : Types.GuaranteedDepth, reference : ?Nat) : PoolView {
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
        token0 = noFirstMinimum(pool.minimumLocked.token0);
        token1 = noFirstMinimum(pool.minimumLocked.token1);
      };
      minimumsSet = set;
      lockedSharesStatement = LOCKED_SHARES_STATEMENT;
      launchMinimumTotalUsdE8 = 0;
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
      acceptsSwaps = swapStateOf(store, pool, rateOf, now).open;
      acceptsDeposits = pool.status != #removed and set and (switch (store.removals.get(pool.id)) {
        case (?r) {
          switch (r.state) {
            case (#announced) false;
            case (#executing(_)) false;
            case _ true;
          };
        };
        case null true;
      });
      acceptsWithdrawals = true;
      reserve0 = pool.reserve0;
      reserve1 = pool.reserve1;
      totalShares = pool.totalShares;
      lockedShares = pool.lockedShares;
      protocolFee0 = pool.protocolFee0;
      protocolFee1 = pool.protocolFee1;
      gauge = usdGauge(pool, rateOf);
      depth = poolDepth(pool, rateOf);
      guaranteedDepth = guaranteed;
      swapThresholdUsdE8 = SWAP_THRESHOLD_USD_E8;
      thresholdBasis = thresholdBasisOf(pool);
      thresholdMeasuredUsdE8 = thresholdMeasureAt(pool, pool.reserve0, pool.reserve1, rateOf);
      swapState = swapStateOf(store, pool, rateOf, now);
      removal = removalViewOf(store, pool.id);
      spread = if (tttiCounterOf(pool) == null) null else spreadWith(pool, reference, store, rateOf, now);
    };
  };

  public func toRequestView(request : PairRequest, canister : Principal, depositToken : Types.DexToken) : PairRequestView {
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
      depositToken;
      depositAmount = request.depositAmount;
      depositBlock = request.depositBlock;
      status = request.status;
      refundBlock = request.refundBlock;
      refundStatus = request.refundStatus;
    };
  };

  public func listPools(store : DexStore, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : [PoolView] {
    // The raw consolidated inputs are the same for every pool of the list:
    // computed once; each pool takes its own leave-one-out reference from them.
    let raw = consolidatedRaw(store, rateOf, now, null);
    store.pools.toArray().map(
      func((_, p)) = poolViewWith(
        store,
        p,
        canister,
        now,
        rateOf,
        guaranteedDepthOf(store, p, rateOf, now),
        if (tttiCounterOf(p) == null) null else combineConsolidated(raw, ?p.id).price,
      )
    );
  };

  // --- Speed: transient read caches (never stored, never part of the state) ---
  //
  // Holds the last listDexPools result and the last consolidated price view.
  // An entry is served only when (a) the fingerprint of everything the result
  // depends on is unchanged (every pool field shown in a view, the usable
  // rates of the pool tokens, removals, maintained locked shares, badge state,
  // the consolidated samples) and (b) it is at most VIEW_CACHE_TTL_NS old. A
  // changed pool, an absent or expired rate therefore always recomputes.
  // A query call discards its writes, so an entry is stored only by the update
  // calls that warm the cache (warmViewCaches); a query then reads it.
  public type ViewCache = {
    var poolsFingerprint : [Int];
    var poolsAt : Timestamp;
    var poolsViews : ?[PoolView];
    var priceFingerprint : [Int];
    var priceAt : Timestamp;
    var priceView : ?Types.ConsolidatedPrice;
  };

  // Maximum age of a cached entry (5 s).
  public let VIEW_CACHE_TTL_NS : Int = 5_000_000_000;

  public func newViewCache() : ViewCache {
    { var poolsFingerprint = []; var poolsAt = 0; var poolsViews = null; var priceFingerprint = []; var priceAt = 0; var priceView = null };
  };

  func optInt(v : ?Int) : Int = switch (v) { case (?x) x; case null -1 };
  func optNat(v : ?Nat) : Int = switch (v) { case (?x) x; case null -1 };

  // Everything a pool view depends on, as a flat list compared for equality.
  public func poolsFingerprint(store : DexStore, rateOf : UsdRateOf, now : Timestamp) : [Int] {
    let out = List.empty<Int>();
    out.add(store.pools.size());
    for ((id, p) in store.pools.entries()) {
      out.add(id);
      out.add(switch (p.status) { case (#filling) 0; case (#active) 1; case (#removed) 2 });
      out.add(p.reserve0);
      out.add(p.reserve1);
      out.add(p.totalShares);
      out.add(p.lockedShares);
      out.add(p.protocolFee0);
      out.add(p.protocolFee1);
      out.add(optInt(p.removedAt));
      out.add(optInt(p.newPairBadgeUntil));
      out.add(switch (p.newPairBadgeUntil) { case (?until) { if (now < until) 1 else 0 }; case null 0 });
      out.add(optNat(p.minimumLocked.token0));
      out.add(optNat(p.minimumLocked.token1));
      out.add(optNat(rateOf(p.token0)));
      out.add(optNat(rateOf(p.token1)));
      out.add(switch (store.fees.pots.get(id)) { case (?pot) pot.lockedPositionShares; case null -1 });
      out.add(switch (store.poolPositions.get(id)) { case (?ids) ids.size(); case null 0 });
      switch (store.removals.get(id)) {
        case null { out.add(-1) };
        case (?r) {
          let (code, at) : (Int, Int) = switch (r.state) {
            case (#announced) (0, 0);
            case (#cancelled(c)) (1, c.cancelledAt);
            case (#executing(e)) (2, e.startedAt);
            case (#completed(c)) (3, c.completedAt);
          };
          out.add(code);
          out.add(at);
          out.add(r.announcedAt);
          out.add(r.effectiveAt);
        };
      };
    };
    out.toArray();
  };

  func cacheFresh(at : Timestamp, now : Timestamp) : Bool = now >= at and now - at <= VIEW_CACHE_TTL_NS;

  // Same result as listPools; served from the cache when still valid.
  public func listPoolsCached(cache : ViewCache, store : DexStore, canister : Principal, now : Timestamp, rateOf : UsdRateOf) : [PoolView] {
    let fp = poolsFingerprint(store, rateOf, now);
    switch (cache.poolsViews) {
      case (?views) {
        if (cacheFresh(cache.poolsAt, now) and cache.poolsFingerprint == fp) return views;
      };
      case null {};
    };
    let views = listPools(store, canister, now, rateOf);
    cache.poolsViews := ?views;
    cache.poolsFingerprint := fp;
    cache.poolsAt := now;
    views;
  };

  // Same result as getPool; read from a valid cached list, else computed.
  public func getPoolCached(cache : ViewCache, store : DexStore, canister : Principal, now : Timestamp, poolId : PoolId, rateOf : UsdRateOf) : ?PoolView {
    switch (cache.poolsViews) {
      case (?views) {
        if (cacheFresh(cache.poolsAt, now) and cache.poolsFingerprint == poolsFingerprint(store, rateOf, now)) {
          return views.find(func v = v.id == poolId);
        };
      };
      case null {};
    };
    getPool(store, canister, now, poolId, rateOf);
  };

  // Same result as consolidatedPriceView; served from the cache when valid.
  public func consolidatedPriceCached(cache : ViewCache, store : DexStore, samples : List.List<ProtocolFeeTypes.ConsolidatedSample>, rateOf : UsdRateOf, now : Timestamp) : Types.ConsolidatedPrice {
    let last = switch (samples.last()) { case (?s) s.at; case null -1 };
    let fp = poolsFingerprint(store, rateOf, now).concat([samples.size(), last]);
    switch (cache.priceView) {
      case (?view) {
        if (cacheFresh(cache.priceAt, now) and cache.priceFingerprint == fp) return view;
      };
      case null {};
    };
    let view = consolidatedPriceView(store, samples, rateOf, now);
    cache.priceView := ?view;
    cache.priceFingerprint := fp;
    cache.priceAt := now;
    view;
  };

  // Refreshes both entries; for update calls and timers (a query discards it).
  public func warmViewCaches(cache : ViewCache, store : DexStore, samples : List.List<ProtocolFeeTypes.ConsolidatedSample>, canister : Principal, now : Timestamp, rateOf : UsdRateOf) {
    ignore listPoolsCached(cache, store, canister, now, rateOf);
    ignore consolidatedPriceCached(cache, store, samples, rateOf, now);
  };

  public func getPool(store : DexStore, canister : Principal, now : Timestamp, poolId : PoolId, rateOf : UsdRateOf) : ?PoolView {
    switch (store.pools.get(poolId)) {
      case (?p) ?toPoolView(store, p, canister, now, rateOf);
      case null null;
    };
  };

  public func listRequests(store : DexStore, canister : Principal, tokenOf : RequestId -> Types.DexToken) : [PairRequestView] {
    store.requests.toArray().map(func((_, r)) = toRequestView(r, canister, tokenOf(r.id)));
  };

  public func requestsOf(store : DexStore, canister : Principal, requester : Principal, tokenOf : RequestId -> Types.DexToken) : [PairRequestView] {
    store.requests.toArray().filter(func((_, r)) = r.requester == requester).map(func((_, r)) = toRequestView(r, canister, tokenOf(r.id)));
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
    depositAmount : Nat,
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
      depositAmount;
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
      lockedFeesPaid0 = 0;
      lockedFeesPaid1 = 0;
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

  // --- DEX lot 2: per-user deposit subaccounts and internal balances --------

  // Error text of the calls refused while the DEX is paused (DEX lot 6).
  public let PAUSED_MESSAGE : Text = "The DEX is paused after a reserve mismatch. Withdrawals and liquidity removals remain available.";

  public let DEX_TOKENS : [Types.DexToken] = [#tttiT, #icp, #ckbtc, #ckusdc, #ckusdt];
  // Per-user DEX deposit subaccount tag: [0xDD, principal length, principal
  // bytes, zero padding] (32 bytes). No secret: anyone can recompute it. The
  // non-ASCII tag never overlaps the ASCII subaccounts (DEX-POOL-, request
  // deposit, fee collector, returned TTTI-T account, cycles reserve), the BTC 0xBD tag
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

  // --- DEX-1: per-token custody account ---------------------------------------

  // Ledger funds of the DEX are held in one canister account per DEX token.
  // Its subaccount is the 32-byte ASCII string "DEX-CUSTODY-<symbol>-" padded
  // with "0". The prefix "DEX-CUSTODY-" differs from "DEX-POOL-", "DEX-REQUEST-",
  // "DEX-PROTOCOL-", "DEX-INJECTION-" and "MINT-FEE-"; the user deposit tag is the
  // non-ASCII byte 0xDD, and the mint, fee collector and returned TTTI-T
  // accounts use other subaccounts. The internal balances remain the record
  // of what each user is owed.
  public let CUSTODY_PREFIX : Text = "DEX-CUSTODY-";

  public func custodySubaccount(token : Types.DexToken) : Blob {
    var text = CUSTODY_PREFIX # tokenSymbol(token) # "-";
    while (text.size() < 32) {
      text := text # "0";
    };
    text.encodeUtf8();
  };

  // The custody account of `token` on this canister (owner = canister).
  public func custodyAccount(canister : Principal, token : Types.DexToken) : Types.DexAccount {
    { owner = canister; subaccount = ?custodySubaccount(token) };
  };

  public func isCustodySubaccount(sub : Blob) : Bool {
    for (token in DEX_TOKENS.values()) {
      if (sub == custodySubaccount(token)) return true;
    };
    false;
  };

  // Non-overlap by construction: every custody subaccount is 32 bytes, they
  // are pairwise distinct, none starts with the pool prefix or the user
  // deposit tag byte, none equals the request deposit subaccount, and none
  // equals a pool subaccount (the pool prefix differs from the first byte
  // on). Returns false if any of these properties fails.
  public func custodyNonOverlapCheck() : Bool {
    let subs = DEX_TOKENS.map(custodySubaccount);
    for (t in DEX_TOKENS.values()) {
      if (requestDepositSubaccount(t).size() != 32) return false;
    };
    var i = 0;
    while (i < subs.size()) {
      let s = subs[i];
      if (s.size() != 32) return false;
      if (isRequestDepositSubaccount(s)) return false;
      if (s.toArray()[0] == USER_DEPOSIT_TAG) return false;
      switch (s.decodeUtf8()) {
        case (?text) {
          if (not text.startsWith(#text CUSTODY_PREFIX)) return false;
          if (text.startsWith(#text "DEX-POOL-")) return false;
        };
        case null return false;
      };
      var j = i + 1;
      while (j < subs.size()) {
        if (subs[j] == s) return false;
        j += 1;
      };
      i += 1;
    };
    // Pool subaccounts always start with "DEX-POOL-", never with the custody prefix.
    switch (poolSubaccount(0).decodeUtf8()) {
      case (?text) not text.startsWith(#text CUSTODY_PREFIX);
      case null false;
    };
  };

  // --- DEX-1: checks that run before an automatic pull into custody -----------

  // Every swap check except the balance one; null when the swap would be
  // accepted with enough balance.
  public func swapPrecheck(
    store : DexStore,
    poolId : PoolId,
    tokenIn : Types.DexToken,
    amountIn : Nat,
    minAmountOut : Nat,
    deadline : Timestamp,
    rateOf : UsdRateOf,
    now : Timestamp,
  ) : ?Types.SwapError {
    if (now > deadline) return ?#deadlineExceeded({ deadline; now });
    let maximum = now + SWAP_DEADLINE_MAX_NS;
    if (deadline > maximum) return ?#deadlineTooFar({ maximum });
    switch (swapCalc(store, poolId, tokenIn, amountIn, false, rateOf, now)) {
      case (#err(e)) ?e;
      case (#ok(c)) {
        if (c.amountOut < minAmountOut) ?#slippageExceeded({ amountOut = c.amountOut; minAmountOut }) else null;
      };
    };
  };

  public type LiquidityNeed = {
    token0 : Types.DexToken;
    token1 : Types.DexToken;
    amount0 : Nat;
    amount1 : Nat;
  };

  // Every addLiquidity check except the balance ones, with the two amounts
  // the call would debit.
  public func addLiquidityNeed(store : DexStore, args : Types.AddLiquidityArgs, rateOf : UsdRateOf, now : Timestamp) : Result.Result<LiquidityNeed, Types.AddLiquidityError> {
    switch (checkLockDuration(lockOf(args))) {
      case (?e) return #err(e);
      case null {};
    };
    let q = switch (quoteAddLiquidity(store, { poolId = args.poolId; side = args.side; amount = args.amount; counterAmount = args.counterAmount; slippageBps = args.slippageBps }, rateOf, now)) {
      case (#ok(q)) q;
      case (#err(e)) return #err(e);
    };
    switch (referenceError(q)) {
      case (?e) return #err(e);
      case null {};
    };
    let pool = switch (store.pools.get(args.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    switch (poolDexToken(pool.token0), poolDexToken(pool.token1)) {
      case (?a, ?b) #ok({ token0 = a; token1 = b; amount0 = q.amount0; amount1 = q.amount1 });
      case _ #err(#unsupportedToken);
    };
  };

  // First-deposit refusal from the reference check (null when not applicable
  // or within the band).
  func referenceError(q : Types.AddLiquidityQuote) : ?Types.AddLiquidityError {
    let c = q.referenceCheck;
    if (not c.applicable) return null;
    switch (c.unavailable) {
      case (?u) return ?#referenceUnavailable(u);
      case null {};
    };
    if (c.withinBand) return null;
    switch (c.deviationBps, c.expected) {
      case (?d, ?e) ?#referenceOutOfBand({ deviationBps = d; toleranceBps = c.toleranceBps; expected = e });
      case _ ?#referenceUnavailable(#noReadableSource);
    };
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

  // Gauge of the swap-opening measure (thresholdMeasureAt) against
  // SWAP_THRESHOLD_USD_E8.
  func gaugeOf(pool : Pool, reserve0 : Nat, reserve1 : Nat, rateOf : UsdRateOf) : Types.UsdGauge {
    let d = poolDepthAt(pool, reserve0, reserve1, rateOf);
    switch (thresholdMeasureAt(pool, reserve0, reserve1, rateOf)) {
      case (?v) {
        {
          currentUsdE8 = ?v;
          targetUsdE8 = SWAP_THRESHOLD_USD_E8;
          remainingUsdE8 = ?(if (v >= SWAP_THRESHOLD_USD_E8) 0 else SWAP_THRESHOLD_USD_E8 - v);
          valueAvailable = true;
          missingRate = { token0 = false; token1 = false };
        };
      };
      case null {
        {
          currentUsdE8 = null;
          targetUsdE8 = SWAP_THRESHOLD_USD_E8;
          remainingUsdE8 = null;
          valueAvailable = false;
          missingRate = d.missingRate;
        };
      };
    };
  };

  func reachesTarget(g : Types.UsdGauge) : Bool {
    switch (g.currentUsdE8) {
      case (?v) v >= SWAP_THRESHOLD_USD_E8;
      case null false;
    };
  };

  // Gauge of the swap-opening measure against SWAP_THRESHOLD_USD_E8.
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

  // Lock requested by the owner: null or 0 = no lock.
  public func lockOf(args : Types.AddLiquidityArgs) : Nat {
    switch (args.lockDurationNs) {
      case (?n) n;
      case null 0;
    };
  };

  // Validates lockDurationNs: 0 (free position) or in [MIN_LOCK_NS (3 months),
  // MAX_LOCK_NS (5 years)].
  public func checkLockDuration(lockDurationNs : Nat) : ?Types.AddLiquidityError {
    if (lockDurationNs == 0) return null;
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
  // lockedShares to the contract (the usual minimum, never more than half of
  // the shares created, at least 1 when total >= 2); no first-deposit minimum.
  // Later deposits compute the counter amount from the reserves (rounded up)
  // and mint the lower proportional amount (rounded down).
  public func quoteAddLiquidity(store : DexStore, args : Types.AddLiquidityQuoteArgs, rateOf : UsdRateOf, now : Timestamp) : Result.Result<Types.AddLiquidityQuote, Types.AddLiquidityError> {
    let pool = switch (store.pools.get(args.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed) return #err(#poolRemoved);
    // DEX-2: liquidity adds are suspended from the announcement of a removal.
    switch (store.removals.get(pool.id)) {
      case (?r) {
        switch (r.state) {
          case (#announced) return #err(#removalAnnounced({ effectiveAt = r.effectiveAt }));
          case (#executing(_)) return #err(#removalAnnounced({ effectiveAt = r.effectiveAt }));
          case _ {};
        };
      };
      case null {};
    };
    let slippage = switch (args.slippageBps) {
      case (?b) b;
      case null DEFAULT_SLIPPAGE_BPS;
    };
    if (slippage > MAX_SLIPPAGE_BPS) return #err(#invalidSlippage({ maximumBps = MAX_SLIPPAGE_BPS }));
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
      // amount0, amount1 >= 1, so total >= 1.
      let total = isqrt(amount0 * amount1);
      let usual = Nat.max(1, Nat.max(sharesForMinimum(pool.minimumLocked.token0, amount0, total), sharesForMinimum(pool.minimumLocked.token1, amount1, total)));
      locked := if (total >= 2) Nat.max(1, Nat.min(usual, total / 2)) else 0;
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
        case (?c) {
          // The counter amount is computed at execution; it must stay within
          // the tolerance of the amount the user expected (c).
          let high = c * (BPS_DENOMINATOR + slippage);
          let low = c * (BPS_DENOMINATOR - Nat.min(slippage, BPS_DENOMINATOR));
          if (required * BPS_DENOMINATOR > high or required * BPS_DENOMINATOR < low) {
            return #err(#slippageExceeded({ expectedCounterAmount = c; actualCounterAmount = required; toleranceBps = slippage }));
          };
        };
        case null {};
      };
      shares := Nat.min(amount0 * pool.totalShares / pool.reserve0, amount1 * pool.totalShares / pool.reserve1);
      if (shares == 0) return #err(#zeroShares);
    };
    let gaugeAfter = gaugeOf(pool, pool.reserve0 + amount0, pool.reserve1 + amount1, rateOf);
    // DEX-2: the first deposit is checked against the reference price; the
    // swap-opening threshold never applies here (minimum liquidity stays).
    let referenceCheck : Types.ReferenceCheck = if (isFirstDeposit) {
      checkFirstDeposit(store, pool, amount0, amount1, rateOf, now);
    } else {
      { applicable = false; withinBand = true; deviationBps = null; toleranceBps = REFERENCE_TOLERANCE_BPS; expected = null; unavailable = null };
    };
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
      counterSide = switch (args.side) { case (#token0) #token1; case (#token1) #token0 };
      counterAmount = switch (args.side) { case (#token0) amount1; case (#token1) amount0 };
      slippageBps = slippage;
      depthAfterUsdE8 = poolDepthAt(pool, pool.reserve0 + amount0, pool.reserve1 + amount1, rateOf).usdE8;
      referenceCheck;
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
    addLiquidityWith(store, balances, canister, owner, isCreator, args, rateOf, now, true);
  };

  // --- PTM-10d: the only way reserves change outside a swap -------------------
  //
  // Only a swap changes the price of a pool. Every other change of reserve0 /
  // reserve1 (a user's position, the part of a mint deposited after the zap,
  // an auction settlement, permanent liquidity, a reinjection, the fee pot
  // returned to the reserves, a removal or liquidation) goes through
  // depositAtRatio or withdrawAtRatio. Both check, after the change, that
  // reserve0 / reserve1 did not move beyond one unit of rounding, using the
  // cross product, and call Runtime.trap otherwise (the whole message is
  // rolled back). Only the reserves are written: shares, locks and balances
  // stay with the caller.

  // Ratio test on the cross product. For a deposit or withdrawal of (a0, a1)
  // the cross difference is a0 * before1 - a1 * before0; one unit of rounding
  // on either amount moves it by less than max(before0, before1). A pool with
  // no ratio to preserve (a reserve at zero before) always passes.
  public func ratioHeld(before0 : Nat, before1 : Nat, after0 : Nat, after1 : Nat) : Bool {
    if (before0 == 0 or before1 == 0) return true;
    let cross0 = after0 * before1;
    let cross1 = after1 * before0;
    Int.abs(cross0.toInt() - cross1.toInt()) <= Nat.max(before0, before1);
  };

  // Largest part of (available0, available1) that can be deposited into the
  // pool at its current ratio (rounded down). A pool with no ratio (a reserve
  // at zero, or no shares: first deposit) takes both amounts as they are.
  public func fitAtRatio(pool : Pool, available0 : Nat, available1 : Nat) : (Nat, Nat) {
    if (pool.totalShares == 0 or pool.reserve0 == 0 or pool.reserve1 == 0) return (available0, available1);
    if (available0 * pool.reserve1 <= available1 * pool.reserve0) {
      (available0, available0 * pool.reserve1 / pool.reserve0);
    } else {
      (available1 * pool.reserve0 / pool.reserve1, available1);
    };
  };

  // Adds (amount0, amount1) to the reserves of the pool. Traps if the pool is
  // unknown or if reserve0 / reserve1 moves (cross product, one unit of
  // rounding). The first deposit of an empty pool (no shares, or a reserve at
  // zero) has no ratio to preserve and is the only exception. Returns the
  // updated pool (already stored); the caller sets shares, if any.
  //   depositAtRatio(store, poolId, amount0, amount1) : Pool
  public func depositAtRatio(store : DexStore, poolId : PoolId, amount0 : Nat, amount1 : Nat) : Pool {
    let pool = store.pools.get(poolId) ?? Runtime.trap("Liquidity deposit: unknown pool #" # poolId.toText());
    let updated : Pool = { pool with reserve0 = pool.reserve0 + amount0; reserve1 = pool.reserve1 + amount1 };
    if (pool.totalShares > 0 and not ratioHeld(pool.reserve0, pool.reserve1, updated.reserve0, updated.reserve1)) {
      Runtime.trap(
        "Liquidity deposit refused: it would move the price of pool #" # poolId.toText() # " (reserves " # pool.reserve0.toText() # "/" # pool.reserve1.toText() #
        ", deposit " # amount0.toText() # "/" # amount1.toText() # ")"
      );
    };
    store.pools.add(poolId, updated);
    updated;
  };

  // Takes (amount0, amount1) out of the reserves of the pool. Traps if the
  // pool is unknown, if an amount exceeds its reserve or if reserve0 /
  // reserve1 moves (cross product, one unit of rounding). Returns the updated
  // pool (already stored); the caller sets shares, if any.
  //   withdrawAtRatio(store, poolId, amount0, amount1) : Pool
  public func withdrawAtRatio(store : DexStore, poolId : PoolId, amount0 : Nat, amount1 : Nat) : Pool {
    let pool = store.pools.get(poolId) ?? Runtime.trap("Liquidity withdrawal: unknown pool #" # poolId.toText());
    if (amount0 > pool.reserve0 or amount1 > pool.reserve1) {
      Runtime.trap("Liquidity withdrawal refused: amounts exceed the reserves of pool #" # poolId.toText());
    };
    let updated : Pool = { pool with reserve0 = pool.reserve0 - amount0; reserve1 = pool.reserve1 - amount1 };
    if (not ratioHeld(pool.reserve0, pool.reserve1, updated.reserve0, updated.reserve1)) {
      Runtime.trap(
        "Liquidity withdrawal refused: it would move the price of pool #" # poolId.toText() # " (reserves " # pool.reserve0.toText() # "/" # pool.reserve1.toText() #
        ", withdrawal " # amount0.toText() # "/" # amount1.toText() # ")"
      );
    };
    store.pools.add(poolId, updated);
    updated;
  };

  // PTM-1: addLiquidity with an option to skip the first-deposit reference
  // band (the liquidity mint seeds an empty pool at its own price, 10 000 USD
  // per TTTI-T). Minimums, locked shares and every other rule are unchanged.
  public func addLiquidityWith(
    store : DexStore,
    balances : Types.DexBalances,
    canister : Principal,
    owner : Principal,
    isCreator : Bool,
    args : Types.AddLiquidityArgs,
    rateOf : UsdRateOf,
    now : Timestamp,
    checkReference : Bool,
  ) : Result.Result<Types.AddLiquidityResult, Types.AddLiquidityError> {
    addLiquidityShare(store, balances, canister, owner, isCreator, args, rateOf, now, checkReference, 0);
  };

  // PTM-10b: same as addLiquidityWith, recording the locked share m (scale
  // 10^6) of the mint or auction settlement on the position (0 otherwise).
  public func addLiquidityShare(
    store : DexStore,
    balances : Types.DexBalances,
    canister : Principal,
    owner : Principal,
    isCreator : Bool,
    args : Types.AddLiquidityArgs,
    rateOf : UsdRateOf,
    now : Timestamp,
    checkReference : Bool,
    mintShareE6 : Nat,
  ) : Result.Result<Types.AddLiquidityResult, Types.AddLiquidityError> {
    switch (checkLockDuration(lockOf(args))) {
      case (?e) return #err(e);
      case null {};
    };
    let q = switch (quoteAddLiquidity(store, { poolId = args.poolId; side = args.side; amount = args.amount; counterAmount = args.counterAmount; slippageBps = args.slippageBps }, rateOf, now)) {
      case (#ok(q)) q;
      case (#err(e)) return #err(e);
    };
    if (checkReference) {
      switch (referenceError(q)) {
        case (?e) return #err(e);
        case null {};
      };
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
    // PTM-10d: the reserves change through the single ratio-checked deposit.
    let deposited = depositAtRatio(store, pool.id, q.amount0, q.amount1);
    store.pools.add(
      pool.id,
      {
        deposited with
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
      lockDurationNs = lockOf(args);
      unlockAt = now + lockOf(args);
      isCreator;
      lockStartedAt = now;
      relayReceivedNs = 0;
      feesCollected0 = 0;
      feesCollected1 = 0;
      mintShareE6;
    };
    store.positions.add(id, position);
    // PTM-9d: per-pool index and lock-time record of a new commitment.
    indexAdd(store, pool.id, id);
    startLock(store, position, now);
    // PTM-3: a commitment relieves the other locked positions of the pool.
    let relay = if (lockOf(args) == 0) NO_RELAY else relayPositions(store, pool.id, id, weightOf(q.shares, lockOf(args)), now);
    refreshLockedShares(store, pool.id, now);
    // The counter amount the user expected beyond what was computed is not
    // debited: it stays in the internal balance.
    let surplus = switch (args.counterAmount) {
      case (?c) { if (not q.isFirstDeposit and c > q.counterAmount) c - q.counterAmount else 0 };
      case null 0;
    };
    let surplus0 = if (q.counterSide == #token0) surplus else 0;
    let surplus1 = if (q.counterSide == #token1) surplus else 0;
    #ok({
      position = toPositionView(store, canister, position, now);
      amount0 = q.amount0;
      amount1 = q.amount1;
      shares = q.shares;
      lockedShares = q.lockedShares;
      surplus0 = surplus0;
      surplus1 = surplus1;
      relay;
      pool = toPoolView(store, updated, canister, now, rateOf);
    });
  };

  // Owner only; after unlockAt (every pool state; no lock = any time). Burns the
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
    // DEX-2: unlockAt applies in every pool state, #removed included.
    if (now < position.unlockAt) {
      return #err(#positionLocked({ unlockAt = position.unlockAt }));
    };
    let amount0 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve0 / pool.totalShares;
    let amount1 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve1 / pool.totalShares;
    // PTM-10d: the reserves change through the single ratio-checked withdrawal.
    let withdrawn = withdrawAtRatio(store, pool.id, amount0, amount1);
    let updated : Pool = {
      withdrawn with
      totalShares = pool.totalShares - Nat.min(position.shares, pool.totalShares);
    };
    store.pools.add(pool.id, updated);
    store.positions.remove(positionId);
    dropPosition(store, position, now);
    refreshLockedShares(store, pool.id, now);
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
      pool = toPoolView(store, updated, canister, now, rateOf);
    });
  };

  // PTM-3 contract stubs (logic in the develop task).

  // No relay applied (free position).
  let NO_RELAY : Types.RelayOutcome = {
    weight = 0;
    relayWeight = 0;
    shortenedWeight = 0;
    positionsShortened = 0;
    positionsFreed = 0;
  };

  // Weight of a commitment: capital (shares) x duration (ns).
  public func weightOf(shares : Nat, durationNs : Nat) : Nat {
    shares * durationNs;
  };

  // Time already served by a position (ns), 0 before its lock start.
  func servedOf(position : Position, now : Timestamp) : Nat {
    if (now > position.lockStartedAt) Int.abs(now - position.lockStartedAt) else 0;
  };

  // Relay: shortens the still-locked positions of `poolId` other than
  // `excludePositionId` by weight / RELAY_DIVISOR in proportion to shares x time
  // served (now - lockStartedAt), never lengthening, each capped at its
  // remaining time; updates unlockAt and relayReceivedNs. Returns what was applied.
  public func relayPositions(store : DexStore, poolId : PoolId, excludePositionId : Types.PositionId, weight : Nat, now : Timestamp) : Types.RelayOutcome {
    let relayWeight = weight / RELAY_DIVISOR;
    let none : Types.RelayOutcome = { weight; relayWeight; shortenedWeight = 0; positionsShortened = 0; positionsFreed = 0 };
    if (relayWeight == 0) return none;
    let candidates = positionsInPool(store, poolId).filter(
      func(p) = p.id != excludePositionId and p.shares > 0 and p.unlockAt > now and servedOf(p, now) > 0
    );
    var total = 0;
    for (p in candidates.values()) {
      total += p.shares * servedOf(p, now);
    };
    if (total == 0) return none;
    var shortenedWeight = 0;
    var positionsShortened = 0;
    var positionsFreed = 0;
    for (p in candidates.values()) {
      let allotted = relayWeight * (p.shares * servedOf(p, now)) / total;
      let remaining = Int.abs(p.unlockAt - now);
      let reduction = Nat.min(allotted / p.shares, remaining);
      if (reduction > 0) {
        store.positions.add(p.id, { p with relayReceivedNs = p.relayReceivedNs + reduction; unlockAt = p.unlockAt - reduction });
        shortenedWeight += reduction * p.shares;
        positionsShortened += 1;
        if (reduction == remaining) positionsFreed += 1;
      };
    };
    { weight; relayWeight; shortenedWeight; positionsShortened; positionsFreed };
  };

  // Fixed-point scale of the square root in the fee weight (1e12 squared).
  let SQRT_SCALE_SQ : Nat = 1_000_000_000_000_000_000_000_000;

  // Fee weight of a locked position: shares x sqrt(remaining / FIVE_YEARS),
  // remaining = unlockAt - now (0 for a free position). Fixed-point scale
  // chosen by the implementation.
  public func feeWeight(position : Position, now : Timestamp) : Nat {
    if (position.unlockAt <= now) return 0;
    let remaining = Int.abs(position.unlockAt - now);
    position.shares * isqrt(remaining * SQRT_SCALE_SQ / FIVE_YEARS);
  };

  // PTM-9d: one LP fee (token side `token0Side`) paid by a swap. Half stays
  // in the reserves pro rata to shares. The other half is added to the pool's
  // pending pot (shared once a day among the locked positions by
  // lib/dex-pot.mo); no position is read or written here. `balances` is
  // unused and kept for the callers' signature. `reserve + credited = lpFee`;
  // `credited` is the amount set aside in the pot; `positions` is always 0.
  public func shareLpFee(store : DexStore, balances : Types.DexBalances, poolId : PoolId, token0Side : Bool, lpFee : Nat, now : Timestamp) : Types.LpFeeShare {
    ignore (balances, now);
    let unshared : Types.LpFeeShare = { reserve = lpFee; credited = 0; positions = 0 };
    let half = lpFee * LOCKED_FEE_SHARE_PERCENT / 100;
    if (half == 0) return unshared;
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return unshared;
    };
    switch (poolDexToken(if (token0Side) pool.token0 else pool.token1)) {
      case (?_) {};
      case null return unshared;
    };
    let pot = potOf(store, poolId);
    if (token0Side) { pot.pending0 += half } else { pot.pending1 += half };
    { reserve = lpFee - half; credited = half; positions = 0 };
  };

  // --- PTM-9d: per-pool position index, fee pot and lock-time records ---------

  // Positions of one pool, read through the per-pool index only.
  public func positionsInPool(store : DexStore, poolId : PoolId) : [Position] {
    switch (store.poolPositions.get(poolId)) {
      case (?ids) {
        let out = List.empty<Position>();
        for (id in ids.values()) {
          switch (store.positions.get(id)) {
            case (?p) out.add(p);
            case null {};
          };
        };
        out.toArray();
      };
      case null [];
    };
  };

  // True when the pool still has at least one position.
  public func poolHasPositions(store : DexStore, poolId : PoolId) : Bool {
    switch (store.poolPositions.get(poolId)) {
      case (?ids) ids.size() > 0;
      case null false;
    };
  };

  // True when the pool has a position with shares (read through the index).
  public func poolHasLiquidity(store : DexStore, poolId : PoolId) : Bool {
    switch (store.poolPositions.get(poolId)) {
      case (?ids) {
        for (id in ids.values()) {
          switch (store.positions.get(id)) {
            case (?p) { if (p.shares > 0) return true };
            case null {};
          };
        };
        false;
      };
      case null false;
    };
  };

  public func indexAdd(store : DexStore, poolId : PoolId, id : Types.PositionId) {
    let ids = switch (store.poolPositions.get(poolId)) {
      case (?s) s;
      case null {
        let s = Set.empty<Types.PositionId>();
        store.poolPositions.add(poolId, s);
        s;
      };
    };
    ids.add(id);
  };

  public func indexRemove(store : DexStore, poolId : PoolId, id : Types.PositionId) {
    switch (store.poolPositions.get(poolId)) {
      case (?ids) ids.remove(id);
      case null {};
    };
  };

  // Pending pot of a pool, created empty when absent.
  public func potOf(store : DexStore, poolId : PoolId) : Types.PoolPot {
    switch (store.fees.pots.get(poolId)) {
      case (?p) p;
      case null {
        let p : Types.PoolPot = {
          poolId;
          var pending0 = 0;
          var pending1 = 0;
          var phase : Types.SharingPhase = #idle;
          var frozen0 = 0;
          var frozen1 = 0;
          var cursor : ?Types.PositionId = null;
          var totalProductNs = 0;
          var paid0 = 0;
          var paid1 = 0;
          var sharedDayStart = store.fees.dayStart;
          var sharedDayEnd = store.fees.dayStart;
          var lockedPositionShares = 0;
          var lockedScan = 0;
        };
        store.fees.pots.add(poolId, p);
        p;
      };
    };
  };

  // Amounts of a pool still owed by its fee pot, per pool token: pending pot
  // plus the part of the running sharing not yet credited. These amounts are
  // outside the pool reserves (reserve checks count them as owed).
  public func potOwed(store : DexStore, poolId : PoolId) : (Nat, Nat) {
    switch (store.fees.pots.get(poolId)) {
      case (?p) (p.pending0 + (p.frozen0 - Nat.min(p.frozen0, p.paid0)), p.pending1 + (p.frozen1 - Nat.min(p.frozen1, p.paid1)));
      case null (0, 0);
    };
  };

  // Weight of a lock at `at`: capital (shares) x sqrt(remaining / FIVE_YEARS),
  // same fixed-point rule as feeWeight; 0 when not locked at `at`.
  public func lockWeightAt(shares : Nat, unlockAt : Timestamp, at : Timestamp) : Nat {
    if (unlockAt <= at) return 0;
    shares * isqrt(Int.abs(unlockAt - at) * SQRT_SCALE_SQ / FIVE_YEARS);
  };

  // Weighted product of a lock record inside [from, until]: weight x ns
  // locked, limited by the unlock time and by the removal time.
  public func lockProduct(lock : Types.PositionLock, unlockAt : Timestamp, from : Timestamp, until : Timestamp) : Nat {
    var end = if (until < unlockAt) until else unlockAt;
    switch (lock.lockedUntil) {
      case (?u) { if (u < end) end := u };
      case null {};
    };
    let start = if (lock.lockedFrom > from) lock.lockedFrom else from;
    if (end <= start) 0 else lock.weight * Int.abs(end - start);
  };

  public func unpaidKey(owner : Principal, poolId : PoolId) : Text {
    owner.toText() # ":" # poolId.toText();
  };

  func addUnpaidKey(store : DexStore, key : Text, owner : Principal, poolId : PoolId, product : Nat) {
    if (product == 0) return;
    switch (store.fees.unpaid.get(key)) {
      case (?u) { u.productNs += product };
      case null { store.fees.unpaid.add(key, { owner; poolId; var productNs = product }) };
    };
  };

  func addUnpaid(store : DexStore, owner : Principal, poolId : PoolId, product : Nat) {
    addUnpaidKey(store, unpaidKey(owner, poolId), owner, poolId, product);
  };

  // Opens the lock-time record of a position locked at `now` (weight taken now).
  public func startLock(store : DexStore, position : Position, now : Timestamp) {
    if (position.shares == 0 or position.unlockAt <= now) return;
    let record : Types.PositionLock = {
      positionId = position.id;
      poolId = position.poolId;
      owner = position.owner;
      var weight = lockWeightAt(position.shares, position.unlockAt, now);
      var lockedFrom = now;
      var lockedUntil : ?Timestamp = null;
    };
    store.fees.locks.add(position.id, record);
  };

  // Closes the lock-time record of a position (removal, or before a new lock
  // replaces it): its weighted product so far is kept in UnpaidShare under
  // owner and pool and paid to the owner at the next sharing. While a sharing
  // of the pool is running and the record still belongs to the shared day, the
  // product stops at the end of that shared day (the few minutes after the
  // roll are not counted) and the running sharing is kept consistent:
  //   #summing, position already summed: its product leaves the total (the
  //     unpaid entry joins the total at the end of the pass, once);
  //   #paying, position not yet paid: the product is kept under the key
  //     "S:" # unpaidKey and paid at the end of the paying pass, from the
  //     frozen pot, since it is already part of the total.
  func bankLock(store : DexStore, position : Position, now : Timestamp) {
    switch (store.fees.locks.get(position.id)) {
      case (?l) {
        l.lockedUntil := ?now;
        var sharedKey = false;
        let product = switch (store.fees.pots.get(position.poolId)) {
          case (?p) {
            if (p.phase != #idle and l.lockedFrom < p.sharedDayEnd) {
              let old = lockProduct(l, position.unlockAt, p.sharedDayStart, p.sharedDayEnd);
              let visited = switch (p.cursor) {
                case (?c) position.id <= c;
                case null false;
              };
              if (p.phase == #summing and visited) {
                p.totalProductNs -= Nat.min(p.totalProductNs, old);
              };
              if (p.phase == #paying and not visited) sharedKey := true;
              old;
            } else {
              lockProduct(l, position.unlockAt, store.fees.dayStart, now);
            };
          };
          case null lockProduct(l, position.unlockAt, store.fees.dayStart, now);
        };
        if (sharedKey) {
          addUnpaidKey(store, "S:" # unpaidKey(position.owner, position.poolId), position.owner, position.poolId, product);
        } else {
          addUnpaid(store, position.owner, position.poolId, product);
        };
        store.fees.locks.remove(position.id);
      };
      case null {};
    };
  };

  // Gives a position to another owner (mint deliveries): the lock record and
  // the owner of its future share follow.
  public func setPositionOwner(store : DexStore, positionId : Types.PositionId, owner : Principal) {
    switch (store.positions.get(positionId)) {
      case (?pos) {
        store.positions.add(positionId, { pos with owner });
        switch (store.fees.locks.get(positionId)) {
          case (?l) {
            store.fees.locks.add(positionId, { positionId; poolId = l.poolId; owner; var weight = l.weight; var lockedFrom = l.lockedFrom; var lockedUntil = l.lockedUntil });
          };
          case null {};
        };
      };
      case null {};
    };
  };

  // A position is gone (removal or liquidation): index and lock record.
  func dropPosition(store : DexStore, position : Position, now : Timestamp) {
    bankLock(store, position, now);
    indexRemove(store, position.poolId, position.id);
  };

  // Locked positions (unlockAt > now) plus permanent liquidity of a pool.
  public func guaranteedDepthOf(store : DexStore, pool : Pool, rateOf : UsdRateOf, now : Timestamp) : Types.GuaranteedDepth {
    var lockedPositionShares = 0;
    for (p in positionsInPool(store, pool.id).values()) {
      if (p.unlockAt > now) lockedPositionShares += p.shares;
    };
    guaranteedDepthFrom(pool, lockedPositionShares, rateOf);
  };

  func guaranteedDepthFrom(pool : Pool, lockedPositionShares : Nat, rateOf : UsdRateOf) : Types.GuaranteedDepth {
    let permanentShares = pool.lockedShares;
    let shares = lockedPositionShares + permanentShares;
    let amount0 = if (pool.totalShares == 0) 0 else shares * pool.reserve0 / pool.totalShares;
    let amount1 = if (pool.totalShares == 0) 0 else shares * pool.reserve1 / pool.totalShares;
    { lockedPositionShares; permanentShares; amount0; amount1; depth = poolDepthAt(pool, amount0, amount1, rateOf) };
  };

  // Guaranteed depth from the maintained figure; reads no position. The figure
  // is refreshed whenever a position changes and by every daily pass, so it
  // lags only by locks that ended since the last of those.
  func cachedGuaranteedDepth(store : DexStore, pool : Pool, rateOf : UsdRateOf) : Types.GuaranteedDepth {
    let shares = switch (store.fees.pots.get(pool.id)) {
      case (?pot) pot.lockedPositionShares;
      case null 0;
    };
    guaranteedDepthFrom(pool, shares, rateOf);
  };

  // Recomputes the maintained figure of a pool from its positions. Called by
  // the operations that change a position (never by a swap).
  public func refreshLockedShares(store : DexStore, poolId : PoolId, now : Timestamp) {
    var shares = 0;
    for (p in positionsInPool(store, poolId).values()) {
      if (p.unlockAt > now) shares += p.shares;
    };
    potOf(store, poolId).lockedPositionShares := shares;
  };

  // Owner only. Never shortens. The only rule is the remaining time: a locked
  // position gets newUnlockAt >= unlockAt, with 3 months to 5 years remaining
  // after the extension (even beyond lockStartedAt + 5 years); a free position
  // is committed anew (lockStartedAt = now, 3 months to 5 years from now). The added weight
  // (shares x added ns only) triggers the relay on the other positions; the
  // extending position is excluded.
  public func extendLock(store : DexStore, canister : Principal, owner : Principal, positionId : Types.PositionId, newUnlockAt : Timestamp, rateOf : UsdRateOf, now : Timestamp) : Result.Result<Types.ExtendLockResult, Types.ExtendLockError> {
    let position = switch (store.positions.get(positionId)) {
      case (?p) p;
      case null return #err(#positionNotFound);
    };
    if (position.owner != owner) return #err(#notPositionOwner);
    let pool = switch (store.pools.get(position.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed) return #err(#poolRemoved);
    switch (store.removals.get(pool.id)) {
      case (?r) {
        switch (r.state) {
          case (#announced) return #err(#removalAnnounced({ effectiveAt = r.effectiveAt }));
          case (#executing(_)) return #err(#removalAnnounced({ effectiveAt = r.effectiveAt }));
          case _ {};
        };
      };
      case null {};
    };
    let locked = position.unlockAt > now;
    let (updated, added) : (Position, Nat) = if (locked) {
      if (newUnlockAt < position.unlockAt) return #err(#cannotShortenLock({ unlockAt = position.unlockAt }));
      // Remaining time after the extension: 3 months to 5 years, as for a new commitment.
      if (newUnlockAt <= now) return #err(#lockTooShort({ minimumNs = MIN_LOCK_NS }));
      let remaining = Int.abs(newUnlockAt - now);
      if (remaining < MIN_LOCK_NS) return #err(#lockTooShort({ minimumNs = MIN_LOCK_NS }));
      if (remaining > MAX_LOCK_NS) return #err(#lockTooLong({ maximumUnlockAt = now + MAX_LOCK_NS }));
      let added = Int.abs(newUnlockAt - position.unlockAt);
      ({ position with unlockAt = newUnlockAt; lockDurationNs = position.lockDurationNs + added }, added);
    } else {
      // Free or expired position: committed anew from now.
      if (newUnlockAt <= now) return #err(#lockTooShort({ minimumNs = MIN_LOCK_NS }));
      let duration = Int.abs(newUnlockAt - now);
      if (duration < MIN_LOCK_NS) return #err(#lockTooShort({ minimumNs = MIN_LOCK_NS }));
      if (duration > MAX_LOCK_NS) return #err(#lockTooLong({ maximumUnlockAt = now + MAX_LOCK_NS }));
      ({ position with lockStartedAt = now; lockDurationNs = duration; relayReceivedNs = 0; unlockAt = newUnlockAt }, duration);
    };
    store.positions.add(positionId, updated);
    // PTM-9d: the lock record restarts with the new remaining time.
    bankLock(store, position, now);
    startLock(store, updated, now);
    let relay = if (added == 0) NO_RELAY else relayPositions(store, pool.id, positionId, weightOf(updated.shares, added), now);
    refreshLockedShares(store, pool.id, now);
    #ok({
      position = toPositionView(store, canister, updated, now);
      relay;
      pool = toPoolView(store, pool, canister, now, rateOf);
    });
  };

  public func toPositionView(store : DexStore, canister : Principal, position : Position, now : Timestamp) : PositionView {
    ignore canister;
    let (amount0, amount1, symbol0, symbol1) = switch (store.pools.get(position.poolId)) {
      case (?pool) {
        let a0 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve0 / pool.totalShares;
        let a1 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve1 / pool.totalShares;
        (a0, a1, pool.token0.symbol, pool.token1.symbol);
      };
      case null (0, 0, "", "");
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
      withdrawable = unlocked;
      lockStartedAt = position.lockStartedAt;
      remainingNs = if (unlocked) 0 else Int.abs(position.unlockAt - now);
      locked = not unlocked;
      relayReceivedNs = position.relayReceivedNs;
      feesCollected0 = position.feesCollected0;
      feesCollected1 = position.feesCollected1;
      mintShareE6 = position.mintShareE6;
    };
  };

  public func getPosition(store : DexStore, canister : Principal, positionId : Types.PositionId, now : Timestamp) : ?PositionView {
    switch (store.positions.get(positionId)) {
      case (?p) ?toPositionView(store, canister, p, now);
      case null null;
    };
  };

  public func positionsOfPool(store : DexStore, canister : Principal, poolId : PoolId, now : Timestamp) : [PositionView] {
    positionsInPool(store, poolId).map(func(p) = toPositionView(store, canister, p, now));
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

  func swapCalc(store : DexStore, poolId : PoolId, tokenIn : Types.DexToken, amountIn : Nat, feeFree : Bool, rateOf : UsdRateOf, now : Timestamp) : Result.Result<SwapCalc, Types.SwapError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    // DEX-2: opening is evaluated from the current reserves at every call;
    // the persisted status is not relied on.
    switch (swapStateOf(store, pool, rateOf, now).reason) {
      case (#open) {};
      case (#removed) return #err(#poolRemoved);
      case (#removalAnnounced(a)) return #err(#removalInProgress({ effectiveAt = a.effectiveAt }));
      case (#removalExecuting) return #err(#removalInProgress({ effectiveAt = effectiveAtOf(store, poolId, now) }));
      case (#rateUnavailable) return #err(#rateUnavailable);
      case (#belowThreshold(b)) return #err(#depthBelowThreshold(b));
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
    let c = switch (swapCalc(store, poolId, tokenIn, amountIn, false, rateOf, now)) {
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
    let c = switch (swapCalc(store, poolId, tokenIn, amountIn, feeFree, rateOf, now)) {
      case (#ok(c)) c;
      case (#err(e)) return #err(e);
    };
    if (c.amountOut < minAmountOut) return #err(#slippageExceeded({ amountOut = c.amountOut; minAmountOut }));
    let have = available(balances, owner, tokenIn);
    if (have < amountIn) return #err(#insufficientBalance({ available = have }));
    ignore debit(balances, owner, tokenIn, amountIn);
    credit(balances, owner, c.tokenOut, c.amountOut);
    // PTM-3: half of the LP fee stays in the input reserve (free and locked
    // shares alike); the other half is credited to the locked positions
    // (internal balances) when the pool has any. The protocol part is kept outside.
    let share = shareLpFee(store, balances, poolId, c.zeroForOne, c.lpFee, now);
    let inReserve = amountIn - c.protocolFee - share.credited;
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null c.pool;
    };
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
      pool = toPoolViewCached(store, updated, canister, now, rateOf);
    });
  };

  // --- DEX-2: depth, swap opening, announced removal, reference price ---------

  // Depth at the pool price for the given reserves. TTTI-T pairs: 2 x USD
  // value of the non-TTTI-T side at the hourly rate (TTTI-T never at a fixed
  // USD value). Utility pairs: both sides at the hourly rates. Missing or
  // expired rate: usdE8 = null.
  public func poolDepthAt(pool : Pool, reserve0 : Nat, reserve1 : Nat, rateOf : UsdRateOf) : Types.PoolDepth {
    switch (pool.kind) {
      case (#tttiPair) {
        let tttiIs0 = pool.token0.ledger == #internal;
        let (amount, token) = if (tttiIs0) (reserve1, pool.token1) else (reserve0, pool.token0);
        let rate = rateOf(token);
        let missing = rate == null;
        {
          usdE8 = switch (rate) {
            case (?r) ?(2 * usdValueE8(amount, token.decimals, r));
            case null null;
          };
          basis = #twiceNonTttiSide;
          missingRate = { token0 = missing and not tttiIs0; token1 = missing and tttiIs0 };
        };
      };
      case (#utilityPair) {
        let r0 = rateOf(pool.token0);
        let r1 = rateOf(pool.token1);
        {
          usdE8 = switch (r0, r1) {
            case (?a, ?b) ?(usdValueE8(reserve0, pool.token0.decimals, a) + usdValueE8(reserve1, pool.token1.decimals, b));
            case _ null;
          };
          basis = #sumOfSides;
          missingRate = { token0 = r0 == null; token1 = r1 == null };
        };
      };
    };
  };

  public func poolDepth(pool : Pool, rateOf : UsdRateOf) : Types.PoolDepth {
    poolDepthAt(pool, pool.reserve0, pool.reserve1, rateOf);
  };

  public func thresholdBasisOf(pool : Pool) : Types.ThresholdBasis {
    switch (pool.kind) {
      case (#tttiPair) #tttiSideAtPoolPrice;
      case (#utilityPair) #sumOfSides;
    };
  };

  // Swap-opening measure (USD x 1e8). TTTI-T pairs: the TTTI-T side at the
  // pool price, i.e. the counterpart reserve at the oracle rate (half the
  // displayed depth). Utility pairs: the total depth (sum of both sides).
  // Missing or expired rate: null.
  public func thresholdMeasureAt(pool : Pool, reserve0 : Nat, reserve1 : Nat, rateOf : UsdRateOf) : ?Nat {
    switch (pool.kind) {
      case (#tttiPair) {
        let (amount, token) = if (pool.token0.ledger == #internal) (reserve1, pool.token1) else (reserve0, pool.token0);
        switch (rateOf(token)) {
          case (?r) ?usdValueE8(amount, token.decimals, r);
          case null null;
        };
      };
      case (#utilityPair) poolDepthAt(pool, reserve0, reserve1, rateOf).usdE8;
    };
  };

  // Swap opening state: open only when the threshold measure >= 10 USD, rate
  // valid, and no removal announced / executing / completed. Re-evaluated on
  // every call, so an active pool whose measure falls back closes again.
  public func swapStateOf(store : DexStore, pool : Pool, rateOf : UsdRateOf, now : Timestamp) : Types.SwapState {
    ignore now;
    if (pool.status == #removed) return { open = false; reason = #removed };
    switch (store.removals.get(pool.id)) {
      case (?r) {
        switch (r.state) {
          case (#announced) return { open = false; reason = #removalAnnounced({ effectiveAt = r.effectiveAt }) };
          case (#executing(_)) return { open = false; reason = #removalExecuting };
          case _ {};
        };
      };
      case null {};
    };
    switch (thresholdMeasureAt(pool, pool.reserve0, pool.reserve1, rateOf)) {
      case null ({ open = false; reason = #rateUnavailable });
      case (?v) {
        if (v < SWAP_THRESHOLD_USD_E8) {
          { open = false; reason = #belowThreshold({ depthUsdE8 = v; thresholdUsdE8 = SWAP_THRESHOLD_USD_E8 }) };
        } else {
          { open = true; reason = #open };
        };
      };
    };
  };

  func effectiveAtOf(store : DexStore, poolId : PoolId, fallback : Timestamp) : Timestamp {
    switch (store.removals.get(poolId)) {
      case (?r) r.effectiveAt;
      case null fallback;
    };
  };

  func poolTokenOfDex(token : Types.DexToken) : Types.PoolToken {
    switch (token) {
      case (#tttiT) tttiToken();
      case (#icp) externalToken(ICP_LEDGER, "ICP", 8);
      case (#ckbtc) externalToken(CKBTC_LEDGER, "ckBTC", 8);
      case (#ckusdc) externalToken(CKUSDC_LEDGER, "ckUSDC", 6);
      case (#ckusdt) externalToken(CKUSDT_LEDGER, "ckUSDT", 6);
    };
  };

  // Public removal state of a pool (#none when never announced).
  public func removalViewOf(store : DexStore, poolId : PoolId) : Types.RemovalView {
    switch (store.removals.get(poolId)) {
      case null #none;
      case (?r) {
        switch (r.state) {
          case (#announced) #announced({ reason = r.reason; announcedAt = r.announcedAt; effectiveAt = r.effectiveAt });
          case (#cancelled(c)) #cancelled({ reason = r.reason; announcedAt = r.announcedAt; effectiveAt = r.effectiveAt; cancelledAt = c.cancelledAt });
          case (#executing(e)) #executing({ reason = r.reason; announcedAt = r.announcedAt; effectiveAt = r.effectiveAt; startedAt = e.startedAt });
          case (#completed(c)) #completed({ reason = r.reason; announcedAt = r.announcedAt; effectiveAt = r.effectiveAt; completedAt = c.completedAt });
        };
      };
    };
  };

  // Admin: stores the announcement (reason trimmed, 1..REASON_MAX_CHARS chars,
  // effectiveAt = now + REMOVAL_NOTICE_NS). Refused when already announced or
  // removed. Does not touch pool.status.
  public func announceRemoval(store : DexStore, poolId : PoolId, reason : Text, now : Timestamp) : Result.Result<Pool, Types.RemovePairError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    if (pool.status == #removed or pool.removedAt != null) return #err(#alreadyRemoved);
    switch (store.removals.get(poolId)) {
      case (?r) {
        switch (r.state) {
          case (#announced) return #err(#alreadyAnnounced({ effectiveAt = r.effectiveAt }));
          case (#executing(_)) return #err(#alreadyAnnounced({ effectiveAt = r.effectiveAt }));
          case (#completed(_)) return #err(#alreadyRemoved);
          case (#cancelled(_)) {};
        };
      };
      case null {};
    };
    let trimmed = reason.trim(#char ' ');
    if (trimmed.size() == 0) return #err(#reasonEmpty);
    if (trimmed.size() > REASON_MAX_CHARS) return #err(#reasonTooLong({ maximumChars = REASON_MAX_CHARS }));
    store.removals.add(
      poolId,
      {
        poolId;
        reason = trimmed;
        announcedAt = now;
        effectiveAt = now + REMOVAL_NOTICE_NS;
        state = #announced;
      },
    );
    #ok(pool);
  };

  // Admin: cancels an #announced removal before effectiveAt; the pool resumes.
  public func cancelRemoval(store : DexStore, poolId : PoolId, now : Timestamp) : Result.Result<Pool, Types.CancelRemovalError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    let r = switch (store.removals.get(poolId)) {
      case (?r) r;
      case null return #err(#noAnnouncement);
    };
    switch (r.state) {
      case (#cancelled(_)) return #err(#alreadyCancelled);
      case (#executing(_)) return #err(#alreadyExecuting);
      case (#completed(_)) return #err(#alreadyCompleted);
      case (#announced) {};
    };
    if (now >= r.effectiveAt) return #err(#alreadyExecuting);
    store.removals.add(poolId, { r with state = #cancelled({ cancelledAt = now }) });
    #ok(pool);
  };

  // Pools whose announcement is #announced with effectiveAt <= now, or already
  // #executing (resumed after an upgrade or a failed run).
  public func dueRemovals(store : DexStore, now : Timestamp) : [PoolId] {
    let due = List.empty<PoolId>();
    for ((id, r) in store.removals.entries()) {
      switch (r.state) {
        case (#announced) { if (now >= r.effectiveAt) due.add(id) };
        case (#executing(_)) { due.add(id) };
        case _ {};
      };
    };
    due.toArray();
  };

  // #announced -> #executing (idempotent); false when not due.
  public func startRemovalExecution(store : DexStore, poolId : PoolId, now : Timestamp) : Bool {
    switch (store.removals.get(poolId)) {
      case (?r) {
        switch (r.state) {
          case (#executing(_)) true;
          case (#announced) {
            if (now < r.effectiveAt) return false;
            store.removals.add(poolId, { r with state = #executing({ startedAt = now }) });
            true;
          };
          case _ false;
        };
      };
      case null false;
    };
  };

  // Liquidates one position of an #executing pool regardless of unlockAt:
  // debits the pool reserves / shares, deletes the position and credits the
  // owner's internal balances, exactly once (the position is removed in the
  // same synchronous step). The payout transfer is opened afterwards by
  // RetryLib.openLiquidationPayout.
  public func liquidatePosition(store : DexStore, balances : Types.DexBalances, positionId : Types.PositionId) : Result.Result<Types.LiquidationAccounting, Types.LiquidationError> {
    let position = switch (store.positions.get(positionId)) {
      case (?p) p;
      case null return #err(#positionNotFound);
    };
    let pool = switch (store.pools.get(position.poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    switch (store.removals.get(pool.id)) {
      case (?r) {
        switch (r.state) {
          case (#executing(_)) {};
          case _ return #err(#notExecuting);
        };
      };
      case null return #err(#notExecuting);
    };
    let (t0, t1) = switch (poolDexToken(pool.token0), poolDexToken(pool.token1)) {
      case (?a, ?b) (a, b);
      case _ return #err(#poolNotFound);
    };
    // Pro rata, rounded down (the remainder stays in the pool).
    let amount0 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve0 / pool.totalShares;
    let amount1 = if (pool.totalShares == 0) 0 else position.shares * pool.reserve1 / pool.totalShares;
    // PTM-10d: the reserves change through the single ratio-checked withdrawal.
    let withdrawn = withdrawAtRatio(store, pool.id, amount0, amount1);
    store.pools.add(
      pool.id,
      {
        withdrawn with
        totalShares = pool.totalShares - Nat.min(position.shares, pool.totalShares);
      },
    );
    store.positions.remove(positionId);
    dropPosition(store, position, Time.now());
    refreshLockedShares(store, pool.id, Time.now());
    if (amount0 > 0) credit(balances, position.owner, t0, amount0);
    if (amount1 > 0) credit(balances, position.owner, t1, amount1);
    #ok({
      poolId = pool.id;
      positionId;
      owner = position.owner;
      token0 = t0;
      token1 = t1;
      amount0;
      amount1;
    });
  };

  // Marks the pool #removed (removedAt) and the removal #completed once no
  // position of the pool remains. Error #notExecuting otherwise.
  public func finishRemoval(store : DexStore, poolId : PoolId, now : Timestamp) : Result.Result<Pool, Types.LiquidationError> {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return #err(#poolNotFound);
    };
    let r = switch (store.removals.get(poolId)) {
      case (?r) r;
      case null return #err(#notExecuting);
    };
    switch (r.state) {
      case (#executing(_)) {};
      case _ return #err(#notExecuting);
    };
    if (poolHasPositions(store, poolId)) return #err(#notExecuting);
    // PTM-9d: the pending pot of a pool with no position left goes to the
    // pool reserves (the running sharing, if any, ends on its own). PTM-10d:
    // only the part that fits the pool ratio is deposited, through
    // depositAtRatio; the rest stays in the pending pot (still owed).
    let pot = potOf(store, poolId);
    let (put0, put1) = fitAtRatio(pool, pot.pending0, pot.pending1);
    pot.pending0 := pot.pending0 - put0;
    pot.pending1 := pot.pending1 - put1;
    let deposited = depositAtRatio(store, poolId, put0, put1);
    let removed : Pool = { deposited with status = #removed; removedAt = ?now };
    store.pools.add(poolId, removed);
    store.removals.add(poolId, { r with state = #completed({ completedAt = now }) });
    #ok(removed);
  };

  // PTM-9b: reserves of the contract-held shares (permanent liquidity) of a
  // removed TTTI-T pair, taken out of the pool so they can be reinjected into
  // another TTTI-T pool. Only a #removed #tttiPair pool with no position left
  // and lockedShares > 0 releases anything, once: the pool then keeps no
  // contract-held share and the released amounts leave its reserves. Only
  // reserve0 / reserve1 / totalShares / lockedShares of that pool change;
  // no balance, block or position is touched, and nothing goes to a wallet.
  public type ReleasedReserves = {
    poolId : PoolId;
    token0 : Types.DexToken;
    token1 : Types.DexToken;
    amount0 : Nat;
    amount1 : Nat;
    shares : Nat;
  };

  public func releaseContractReserves(store : DexStore, poolId : PoolId) : ?ReleasedReserves {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return null;
    };
    if (pool.status != #removed or pool.kind != #tttiPair or pool.lockedShares == 0 or pool.totalShares == 0) return null;
    if (poolHasPositions(store, poolId)) return null;
    let t0 = switch (poolDexToken(pool.token0)) {
      case (?t) t;
      case null return null;
    };
    let t1 = switch (poolDexToken(pool.token1)) {
      case (?t) t;
      case null return null;
    };
    let shares = Nat.min(pool.lockedShares, pool.totalShares);
    let amount0 = Nat.min(pool.reserve0, shares * pool.reserve0 / pool.totalShares);
    let amount1 = Nat.min(pool.reserve1, shares * pool.reserve1 / pool.totalShares);
    // PTM-10d: the reserves change through the single ratio-checked withdrawal.
    let withdrawn = withdrawAtRatio(store, poolId, amount0, amount1);
    store.pools.add(
      poolId,
      {
        withdrawn with
        totalShares = pool.totalShares - shares;
        lockedShares = pool.lockedShares - shares;
      },
    );
    ?{ poolId; token0 = t0; token1 = t1; amount0; amount1; shares };
  };

  // Reference ratio of a pool (see Types.ReferencePrice).
  func ratioOrNull(numerator : Nat, denominator : Nat) : ?Types.Ratio {
    if (numerator == 0 or denominator == 0) null else ?{ numerator; denominator };
  };

  // TTTI-T pairs: depth-weighted TTTI-T USD price across stored ICPSwap
  // samples and open native TTTI-T pools (excluding `poolId`); utility pairs:
  // ratio of the hourly rates. Public, with sources and weights.
  public func referencePrice(store : DexStore, poolId : PoolId, rateOf : UsdRateOf, now : Timestamp) : ?Types.ReferencePrice {
    let pool = switch (store.pools.get(poolId)) {
      case (?p) p;
      case null return null;
    };
    let r0 = rateOf(pool.token0);
    let r1 = rateOf(pool.token1);
    switch (pool.kind) {
      case (#utilityPair) {
        let valid = r0 != null and r1 != null;
        let expected : ?Types.Ratio = switch (r0, r1) {
          case (?a, ?b) ratioOrNull(a * 10 ** pool.token1.decimals.toNat(), b * 10 ** pool.token0.decimals.toNat());
          case _ null;
        };
        let available = expected != null;
        ?{
          poolId;
          kind = pool.kind;
          computedAt = now;
          available;
          unavailable = if (available) null else ?#rateUnavailable({ token0 = r0 == null; token1 = r1 == null });
          tttiPriceUsdE8 = null;
          expected;
          toleranceBps = REFERENCE_TOLERANCE_BPS;
          sources = [];
          ratesValid = valid;
        };
      };
      case (#tttiPair) {
        let tttiIs0 = pool.token0.ledger == #internal;
        let (counterToken, counterRate) = if (tttiIs0) (pool.token1, r1) else (pool.token0, r0);
        let ratesValid = counterRate != null;
        let missing = { token0 = (not tttiIs0) and counterRate == null; token1 = tttiIs0 and counterRate == null };
        // Candidate sources: (kind, label, poolId, counter, price, depth, readAt).
        let raw = List.empty<{ kind : Types.ReferenceSourceKind; sourceLabel : Text; poolId : ?PoolId; counter : Types.DexToken; price : Nat; depth : Nat; readAt : Timestamp }>();
        for ((_, s) in store.icpswapSamples.entries()) {
          if (now >= s.readAt and now - s.readAt <= SAMPLE_MAX_AGE_NS and s.counter != #tttiT) {
            let ct = poolTokenOfDex(s.counter);
            switch (rateOf(ct)) {
              case (?rate) {
                let depth = 2 * usdValueE8(s.counterReserve, ct.decimals, rate);
                let price = s.counterPerTttiE8 * rate / USD_RATE_SCALE;
                if (depth > 0 and price > 0) {
                  raw.add({ kind = #icpswap; sourceLabel = "ICPSwap TTTI-T/" # ct.symbol # " " # s.poolCanister.toText(); poolId = null; counter = s.counter; price; depth; readAt = s.readAt });
                };
              };
              case null {};
            };
          };
        };
        for ((id, p) in store.pools.entries()) {
          if (id != poolId and p.kind == #tttiPair) {
            let pIs0 = p.token0.ledger == #internal;
            let (ct, counterReserve, tttiReserve) = if (pIs0) (p.token1, p.reserve1, p.reserve0) else (p.token0, p.reserve0, p.reserve1);
            if (swapStateOf(store, p, rateOf, now).open and tttiReserve > 0) {
              switch (rateOf(ct), poolDexToken(ct)) {
                case (?rate, ?dex) {
                  let counterUsd = usdValueE8(counterReserve, ct.decimals, rate);
                  let price = counterUsd * USD_RATE_SCALE / tttiReserve;
                  if (counterUsd > 0 and price > 0) {
                    raw.add({ kind = #native; sourceLabel = "TTTI-T/" # ct.symbol # " native pool #" # id.toText(); poolId = ?id; counter = dex; price; depth = 2 * counterUsd; readAt = now });
                  };
                };
                case _ {};
              };
            };
          };
        };
        let items = raw.toArray();
        var total = 0;
        for (i in items.values()) { total += i.depth };
        var weighted = 0;
        for (i in items.values()) { weighted += i.price * i.depth };
        let price = if (total == 0) 0 else weighted / total;
        let expected : ?Types.Ratio = switch (counterRate) {
          case (?rate) {
            if (price == 0) null else if (tttiIs0) {
              ratioOrNull(price * 10 ** counterToken.decimals.toNat(), rate * USD_RATE_SCALE);
            } else {
              ratioOrNull(rate * USD_RATE_SCALE, price * 10 ** counterToken.decimals.toNat());
            };
          };
          case null null;
        };
        var assigned = 0;
        let lastIndex : Nat = if (items.size() == 0) 0 else items.size() - 1;
        let sources : [Types.ReferenceSource] = Array.tabulate(
          items.size(),
          func(idx : Nat) : Types.ReferenceSource {
            let i = items[idx];
            let w = if (idx == lastIndex) BPS_DENOMINATOR - Nat.min(assigned, BPS_DENOMINATOR) else i.depth * BPS_DENOMINATOR / total;
            assigned += w;
            {
              kind = i.kind;
              sourceLabel = i.sourceLabel;
              poolId = i.poolId;
              counter = i.counter;
              tttiPriceUsdE8 = i.price;
              depthUsdE8 = i.depth;
              weightBps = w;
              readAt = i.readAt;
            };
          },
        );
        let available = expected != null;
        let unavailable : ?Types.ReferenceUnavailable = if (available) null else if (counterRate == null) ?#rateUnavailable(missing) else ?#noReadableSource;
        ?{
          poolId;
          kind = pool.kind;
          computedAt = now;
          available;
          unavailable;
          tttiPriceUsdE8 = if (price == 0) null else ?price;
          expected;
          toleranceBps = REFERENCE_TOLERANCE_BPS;
          sources = if (available) sources else [];
          ratesValid;
        };
      };
    };
  };

  // --- PTM-5: consolidated TTTI-T price, averages and per-pool spread ---------

  // Raw consolidated price of the current reserves and rates; the single
  // source for every reader of a TTTI-T price.
  public type ConsolidatedNow = {
    price : ?Nat; // USD x 1e8 per TTTI-T
    unavailable : ?Types.ConsolidatedUnavailable;
    sources : [Types.ConsolidatedSource];
  };

  // (counter token, counter reserve, TTTI-T reserve) of a TTTI-T pair whose
  // counter is a known DEX token (ICP, ckBTC, ckUSDC, ckUSDT).
  func tttiCounterOf(pool : Pool) : ?(Types.PoolToken, Nat, Nat) {
    if (pool.kind != #tttiPair) return null;
    let tttiIs0 = pool.token0.ledger == #internal;
    let (ct, counterReserve, tttiReserve) = if (tttiIs0) (pool.token1, pool.reserve1, pool.reserve0) else (pool.token0, pool.reserve0, pool.reserve1);
    switch (poolDexToken(ct)) {
      case (?#tttiT) null;
      case (?_) ?(ct, counterReserve, tttiReserve);
      case null null;
    };
  };

  // USD price (x 1e8) of one TTTI-T in a pool, from its reserves and the
  // current rate of its counter token.
  func nativePrice(counterReserve : Nat, tttiReserve : Nat, ct : Types.PoolToken, rate : Nat) : Nat {
    if (tttiReserve == 0) return 0;
    usdValueE8(counterReserve, ct.decimals, rate) * USD_RATE_SCALE / tttiReserve;
  };

  // Inputs of the consolidated price: every open native TTTI-T pool with its
  // USD price and depth, plus the pools that were candidates (non-empty, not
  // removed) and the candidates whose counter token has no valid rate.
  type ConsolidatedRaw = {
    items : [{ poolId : PoolId; counterSymbol : Text; price : Nat; depth : Nat }];
    candidateIds : [PoolId];
    missingRateIds : [PoolId];
  };

  func consolidatedRaw(store : DexStore, rateOf : UsdRateOf, now : Timestamp, override : ?{ poolId : PoolId; reserve0 : Nat; reserve1 : Nat; totalShares : Nat }) : ConsolidatedRaw {
    let raw = List.empty<{ poolId : PoolId; counterSymbol : Text; price : Nat; depth : Nat }>();
    let candidateIds = List.empty<PoolId>();
    let missingRateIds = List.empty<PoolId>();
    for ((id, stored) in store.pools.entries()) {
      let p : Pool = switch (override) {
        case (?o) {
          if (o.poolId == id) { { stored with reserve0 = o.reserve0; reserve1 = o.reserve1; totalShares = o.totalShares } } else stored;
        };
        case null stored;
      };
      switch (tttiCounterOf(p)) {
        case (?(ct, counterReserve, tttiReserve)) {
          if (p.status != #removed and p.removedAt == null and p.totalShares > 0 and counterReserve > 0 and tttiReserve > 0) {
            candidateIds.add(id);
            switch (rateOf(ct)) {
              case null { missingRateIds.add(id) };
              case (?rate) {
                if (swapStateOf(store, p, rateOf, now).open) {
                  let price = nativePrice(counterReserve, tttiReserve, ct, rate);
                  let depth = 2 * usdValueE8(counterReserve, ct.decimals, rate);
                  if (price > 0 and depth > 0) {
                    raw.add({ poolId = id; counterSymbol = ct.symbol; price; depth });
                  };
                };
              };
            };
          };
        };
        case null {};
      };
    };
    { items = raw.toArray(); candidateIds = candidateIds.toArray(); missingRateIds = missingRateIds.toArray() };
  };

  // Depth-weighted average of the raw items, leaving out `exclude` when set.
  // With no usable pool the price is null (never invented).
  func combineConsolidated(raw : ConsolidatedRaw, exclude : ?PoolId) : ConsolidatedNow {
    let kept = func(id : PoolId) : Bool = switch (exclude) {
      case (?x) id != x;
      case null true;
    };
    let items = raw.items.filter(func i = kept(i.poolId));
    if (items.size() == 0) {
      let candidates = raw.candidateIds.filter(kept).size();
      let rateMissing = raw.missingRateIds.filter(kept).size() > 0;
      return { price = null; unavailable = ?(if (candidates > 0 and rateMissing) #noValidRate else #noOpenPool); sources = [] };
    };
    var total = 0;
    var weighted = 0;
    for (i in items.values()) {
      total += i.depth;
      weighted += i.price * i.depth;
    };
    var assigned = 0;
    let lastIndex : Nat = items.size() - 1;
    let sources : [Types.ConsolidatedSource] = Array.tabulate(
      items.size(),
      func(idx : Nat) : Types.ConsolidatedSource {
        let i = items[idx];
        let w = if (idx == lastIndex) BPS_DENOMINATOR - Nat.min(assigned, BPS_DENOMINATOR) else i.depth * BPS_DENOMINATOR / total;
        assigned += w;
        { poolId = i.poolId; counterSymbol = i.counterSymbol; priceUsdE8 = i.price; depthUsdE8 = i.depth; weightBps = w };
      },
    );
    let price = weighted / total;
    if (price == 0) return { price = null; unavailable = ?#noOpenPool; sources = [] };
    { price = ?price; unavailable = null; sources };
  };

  // Depth-weighted USD price of every open native TTTI-T pool. A pool that is
  // empty, not open (depth under 10 USD, removal) or without a valid rate is
  // left out; with no usable pool the price is null (never invented).
  public func consolidatedNow(store : DexStore, rateOf : UsdRateOf, now : Timestamp) : ConsolidatedNow {
    consolidatedWith(store, rateOf, now, null);
  };

  // Same computation with the reserves and shares of one pool replaced by a
  // planned after-state (quote of an operation); nothing is stored.
  public func consolidatedWith(store : DexStore, rateOf : UsdRateOf, now : Timestamp, override : ?{ poolId : PoolId; reserve0 : Nat; reserve1 : Nat; totalShares : Nat }) : ConsolidatedNow {
    combineConsolidated(consolidatedRaw(store, rateOf, now, override), null);
  };

  // Independent reference of one pool: the consolidated price WITHOUT that pool
  // (leave-one-out), weighted by the depth of the other open pools. The pool
  // being measured never influences its own reference. price is null (and
  // `unavailable` set) when no other pool is open.
  public func consolidatedExcluding(store : DexStore, rateOf : UsdRateOf, now : Timestamp, excluded : PoolId) : ConsolidatedNow {
    combineConsolidated(consolidatedRaw(store, rateOf, now, null), ?excluded);
  };

  // Mean of the samples of the last `windowNs`: (average, count, oldest sample).
  public func sampleWindow(samples : List.List<ProtocolFeeTypes.ConsolidatedSample>, now : Timestamp, windowNs : Int) : { average : ?Nat; count : Nat; oldest : Timestamp } {
    var sum = 0;
    var count = 0;
    var oldest : Timestamp = now;
    for (s in samples.values()) {
      let age = now - s.at;
      if (age >= 0 and age <= windowNs) {
        sum += s.priceUsdE8;
        count += 1;
        if (s.at < oldest) oldest := s.at;
      };
    };
    { average = if (count == 0) null else ?(sum / count); count; oldest };
  };

  // --- PTM-10a: pools-to-capitalisation ratio and locked share m -------------

  // Fixed point of the ratio: 10^12 = 100 %. Exact Nat arithmetic throughout.
  public let RATIO_SCALE : Nat = 1_000_000_000_000;
  // Target pools / capitalisation ratio: 50 %.
  public let POOL_CAP_RATIO_TARGET : Nat = 500_000_000_000;
  // Precision of the locked share m: 10^6 = 100 % (0.0001 % steps), rounded
  // upward. Its maximum is 50 %.
  public let LOCKED_SHARE_SCALE : Nat = 1_000_000;
  public let LOCKED_SHARE_MAX : Nat = 500_000;
  // One whole TTTI-T in base units (8 decimals).
  let TTTI_UNIT : Nat = 100_000_000;
  // Reference price of the capitalisation: the target of 10 000 USD per whole
  // TTTI-T (USD x 1e8). Independent of the pool reserves.
  public let CAPITALISATION_REFERENCE_USD_E8 : Nat = 1_000_000_000_000;

  // Value of the native TTTI-T pools in USD x 1e8: for each pool of kind
  // #tttiPair that is not removed and holds a counterpart reserve (ICP, ckBTC,
  // ckUSDC or ckUSDT), 2 x the counterpart reserve at the oracle rate. The
  // reserves already hold every share (free, locked, permanent). When a needed
  // rate is absent or expired the value is null (no fallback rate). No pool:
  // value 0 with poolCount 0.
  public func tttiPoolsValue(store : DexStore, rateOf : UsdRateOf) : { valueUsdE8 : ?Nat; poolCount : Nat } {
    var sum = 0;
    var count = 0;
    var missing = false;
    for (p in store.pools.values()) {
      switch (tttiCounterOf(p)) {
        case (?(ct, counterReserve, _)) {
          if (p.status != #removed and p.removedAt == null and counterReserve > 0) {
            count += 1;
            switch (rateOf(ct)) {
              case (?rate) { sum += 2 * usdValueE8(counterReserve, ct.decimals, rate) };
              case null { missing := true };
            };
          };
        };
        case null {};
      };
    };
    { valueUsdE8 = if (missing) null else ?sum; poolCount = count };
  };

  // Capitalisation (USD x 1e8) = circulating TTTI-T x `priceUsdE8`, and ratio
  // (RATIO_SCALE) = pools value / capitalisation, rounded down. null when an
  // input is unavailable or the capitalisation is zero. The report passes the
  // fixed reference CAPITALISATION_REFERENCE_USD_E8, never a price derived from
  // the pools.
  public func poolCapRatio(poolsValueUsdE8 : ?Nat, circulating : Nat, priceUsdE8 : ?Nat) : { capitalisationUsdE8 : ?Nat; ratio : ?Nat } {
    switch (priceUsdE8) {
      case (?price) {
        let capScaled = circulating * price; // USD x 1e8 x 1e8
        let ratio = switch (poolsValueUsdE8) {
          case (?pools) { if (capScaled == 0) null else ?(pools * TTTI_UNIT * RATIO_SCALE / capScaled) };
          case null null;
        };
        { capitalisationUsdE8 = ?(capScaled / TTTI_UNIT); ratio };
      };
      case null { { capitalisationUsdE8 = null; ratio = null } };
    };
  };

  // Mean ratio of the samples of the last `windowNs` and their count.
  public func ratioWindow(samples : List.List<ProtocolFeeTypes.PoolCapRatioSample>, now : Timestamp, windowNs : Int) : { average : ?Nat; count : Nat } {
    var sum = 0;
    var count = 0;
    for (s in samples.values()) {
      let age = now - s.at;
      if (age >= 0 and age <= windowNs) {
        sum += s.ratio;
        count += 1;
      };
    };
    { average = if (count == 0) null else ?(sum / count); count };
  };

  // Retained ratio: the lower of the current ratio and the 24 h average (the
  // current ratio alone when there is no sample). null without a current ratio.
  public func retainedRatio(current : ?Nat, average : ?Nat) : ?Nat {
    switch (current, average) {
      case (?c, ?a) ?Nat.min(c, a);
      case (?c, null) ?c;
      case (null, _) null;
    };
  };

  // Locked share m = 50 % x (50 % - retained ratio) / 50 %, between 0 and 50 %,
  // rounded upward at LOCKED_SHARE_SCALE (10^6 = 100 %). 50 % (LOCKED_SHARE_MAX)
  // without circulating TTTI-T, without any pool, or when the retained ratio
  // is unavailable (pools value or capitalisation unavailable).
  public func lockedShare(circulating : Nat, poolCount : Nat, retained : ?Nat) : Nat {
    if (circulating == 0 or poolCount == 0) return LOCKED_SHARE_MAX;
    switch (retained) {
      case null LOCKED_SHARE_MAX;
      case (?r) {
        if (r >= POOL_CAP_RATIO_TARGET) return 0;
        let gap = POOL_CAP_RATIO_TARGET - r;
        let num = POOL_CAP_RATIO_TARGET * gap * LOCKED_SHARE_SCALE;
        let den = POOL_CAP_RATIO_TARGET * RATIO_SCALE;
        Nat.min(LOCKED_SHARE_MAX, (num + den - 1) / den);
      };
    };
  };

  // Whole PTM-10a computation from its inputs: the pools value at the oracle
  // rates, the capitalisation at the fixed reference of 10 000 USD per TTTI-T
  // and `circulating` TTTI-T (base units), the stored ratio samples of the last
  // 24 h, the retained ratio and m. `priceUsdE8` (consolidated price, null when
  // unavailable) is shown in the report for information and does not enter the
  // ratio. Pure.
  public func poolCapRatioReport(store : DexStore, rateOf : UsdRateOf, circulating : Nat, priceUsdE8 : ?Nat, ratioSamples : List.List<ProtocolFeeTypes.PoolCapRatioSample>, now : Timestamp) : ProtocolFeeTypes.PoolCapRatioView {
    let pools = tttiPoolsValue(store, rateOf);
    let r = poolCapRatio(pools.valueUsdE8, circulating, ?CAPITALISATION_REFERENCE_USD_E8);
    let w = ratioWindow(ratioSamples, now, ProtocolFeeTypes.CONSOLIDATED_RETENTION_NS);
    let retained = retainedRatio(r.ratio, w.average);
    {
      computedAt = now;
      poolsValueUsdE8 = pools.valueUsdE8;
      poolCount = pools.poolCount;
      circulatingTttiT = circulating;
      consolidatedPriceUsdE8 = priceUsdE8;
      capitalisationReferenceUsdE8 = CAPITALISATION_REFERENCE_USD_E8;
      capitalisationReference = #targetPrice;
      capitalisationUsdE8 = r.capitalisationUsdE8;
      currentRatio = r.ratio;
      averageRatio24h = w.average;
      samples = w.count;
      retainedRatio = retained;
      targetRatio = POOL_CAP_RATIO_TARGET;
      lockedShare = lockedShare(circulating, pools.poolCount, retained);
      ratioScale = RATIO_SCALE;
      lockedShareScale = LOCKED_SHARE_SCALE;
    };
  };

  public func consolidatedPriceView(store : DexStore, samples : List.List<ProtocolFeeTypes.ConsolidatedSample>, rateOf : UsdRateOf, now : Timestamp) : Types.ConsolidatedPrice {
    let c = consolidatedNow(store, rateOf, now);
    let hour = sampleWindow(samples, now, ProtocolFeeTypes.CONSOLIDATED_HOUR_NS);
    let day = sampleWindow(samples, now, ProtocolFeeTypes.CONSOLIDATED_RETENTION_NS);
    {
      computedAt = now;
      price = switch (c.price, c.unavailable) {
        case (?p, _) #available(p);
        case (null, ?u) #unavailable(u);
        case (null, null) #unavailable(#noOpenPool);
      };
      hourlyAverageUsdE8 = hour.average;
      hourlySamples = hour.count;
      dailyAverageUsdE8 = day.average;
      dailySamples = day.count;
      sources = c.sources;
    };
  };

  // Spread of one pool against its INDEPENDENT reference: the consolidated price
  // of the other open pools (leave-one-out). `reference` is that price, null
  // when no other pool is open (#noIndependentReference, never 0 bps).
  func spreadWith(pool : Pool, reference : ?Nat, store : DexStore, rateOf : UsdRateOf, now : Timestamp) : ?Types.PoolSpread {
    if (pool.status == #removed or pool.removedAt != null) return null;
    switch (tttiCounterOf(pool)) {
      case null null;
      case (?(ct, counterReserve, tttiReserve)) {
        let mk = func(status : Types.SpreadStatus, price : ?Nat, spread : ?Int, exceeds : Bool) : Types.PoolSpread {
          { poolId = pool.id; counterSymbol = ct.symbol; status; priceUsdE8 = price; spreadBps = spread; exceedsThreshold = exceeds; referencePriceUsdE8 = reference };
        };
        if (tttiReserve == 0 or counterReserve == 0 or pool.totalShares == 0) return ?mk(#empty, null, null, false);
        let rate = switch (rateOf(ct)) {
          case (?r) r;
          case null return ?mk(#noRate, null, null, false);
        };
        let price = nativePrice(counterReserve, tttiReserve, ct, rate);
        if (not swapStateOf(store, pool, rateOf, now).open) return ?mk(#notOpen, ?price, null, false);
        switch (reference) {
          case null ?mk(#noIndependentReference, ?price, null, false);
          case (?c) {
            let spread : Int = (price.toInt() - c.toInt()) * BPS_DENOMINATOR.toInt() / c.toInt();
            ?mk(#ok, ?price, ?spread, Int.abs(spread) > Types.SPREAD_ALERT_BPS);
          };
        };
      };
    };
  };

  // Spread of one pool against the consolidated price of the other pools
  // (PoolView.spread); the same value as the entry of poolSpreads.
  public func poolSpreadOf(store : DexStore, pool : Pool, rateOf : UsdRateOf, now : Timestamp) : ?Types.PoolSpread {
    if (tttiCounterOf(pool) == null) return null;
    spreadWith(pool, independentReferenceFor(store, pool, rateOf, now), store, rateOf, now);
  };

  public func poolSpreads(store : DexStore, rateOf : UsdRateOf, now : Timestamp) : Types.PoolSpreadReport {
    let raw = consolidatedRaw(store, rateOf, now, null);
    let consolidated = combineConsolidated(raw, null).price;
    let out = List.empty<Types.PoolSpread>();
    for ((_, p) in store.pools.entries()) {
      switch (spreadWith(p, combineConsolidated(raw, ?p.id).price, store, rateOf, now)) {
        case (?s) out.add(s);
        case null {};
      };
    };
    { computedAt = now; consolidatedPriceUsdE8 = consolidated; thresholdBps = Types.SPREAD_ALERT_BPS; pools = out.toArray() };
  };

  // Pools where `caller` holds a position and the independent spread exceeds
  // the threshold now. Without an independent reference there is no spread and
  // no alert. Computed on each call, nothing stored.
  public func spreadAlerts(store : DexStore, caller : Principal, rateOf : UsdRateOf, now : Timestamp) : [Types.PoolSpreadAlert] {
    if (caller.isAnonymous()) return [];
    let report = poolSpreads(store, rateOf, now);
    let out = List.empty<Types.PoolSpreadAlert>();
    for (s in report.pools.values()) {
      switch (s.spreadBps, s.priceUsdE8, s.referencePriceUsdE8) {
        case (?bps, ?price, ?reference) {
          if (s.status == #ok and s.exceedsThreshold) {
            let ids = List.empty<Types.PositionId>();
            for (pos in positionsInPool(store, s.poolId).values()) {
              if (pos.owner == caller and pos.shares > 0) ids.add(pos.id);
            };
            if (ids.size() > 0) {
              out.add({
                poolId = s.poolId;
                counterSymbol = s.counterSymbol;
                positionIds = ids.toArray();
                spreadBps = bps;
                poolPriceUsdE8 = price;
                consolidatedPriceUsdE8 = reference;
                thresholdBps = Types.SPREAD_ALERT_BPS;
                computedAt = now;
              });
            };
          };
        };
        case _ {};
      };
    };
    out.toArray();
  };

  // First deposit check: amount1 / amount0 within REFERENCE_TOLERANCE_BPS of
  // the reference ratio; unavailable reference or expired rate: not within band.
  public func checkFirstDeposit(store : DexStore, pool : Pool, amount0 : Nat, amount1 : Nat, rateOf : UsdRateOf, now : Timestamp) : Types.ReferenceCheck {
    if (pool.totalShares > 0) {
      return { applicable = false; withinBand = true; deviationBps = null; toleranceBps = REFERENCE_TOLERANCE_BPS; expected = null; unavailable = null };
    };
    let notBanded = func(expected : ?Types.Ratio, unavailable : ?Types.ReferenceUnavailable) : Types.ReferenceCheck {
      { applicable = true; withinBand = false; deviationBps = null; toleranceBps = REFERENCE_TOLERANCE_BPS; expected; unavailable };
    };
    let ref = switch (referencePrice(store, pool.id, rateOf, now)) {
      case (?r) r;
      case null return notBanded(null, ?#noReadableSource);
    };
    let e = switch (ref.expected) {
      case (?e) e;
      case null return notBanded(null, switch (ref.unavailable) { case (?u) ?u; case null ?#noReadableSource });
    };
    if (amount0 == 0 or amount1 == 0) return notBanded(?e, null);
    // |amount1 / amount0 - n / d| / (n / d) = |amount1 x d - n x amount0| / (n x amount0)
    let lhs = amount1 * e.denominator;
    let rhs = e.numerator * amount0;
    let diff = if (lhs > rhs) lhs - rhs else rhs - lhs;
    let deviation = ceilDiv(diff * BPS_DENOMINATOR, rhs);
    {
      applicable = true;
      withinBand = deviation <= REFERENCE_TOLERANCE_BPS;
      deviationBps = ?deviation;
      toleranceBps = REFERENCE_TOLERANCE_BPS;
      expected = ?e;
      unavailable = null;
    };
  };

  // Stores the latest reading of an ICPSwap TTTI-T pair.
  public func recordIcpSwapSample(store : DexStore, sample : Types.IcpSwapSample) {
    store.icpswapSamples.add(sample.poolCanister.toText(), sample);
  };

  // Stores the last reading of an ICPSwap pair (successful or not), keyed by
  // the counter token symbol. Informational only: it never feeds a price.
  public func recordReferenceReading(store : DexStore, reading : Types.ReferenceReading) {
    store.referenceReadings.add(tokenSymbol(reading.counter), reading);
  };

  // Last reading of every ICPSwap pair (DEX_TOKENS order, without TTTI-T);
  // #notReadYet when none is stored.
  public func referenceReadingEntries(store : DexStore) : [Types.ReferenceReadingEntry] {
    DEX_TOKENS.filter(func t = t != #tttiT).map(
      func counter = switch (store.referenceReadings.get(tokenSymbol(counter))) {
        case (?r) #read(r);
        case null #notReadYet({ counter });
      }
    );
  };
};
