import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import DexLib "../lib/dex";
import DexPotLib "../lib/dex-pot";
import IcrcLib "../lib/icrc";
import OracleLib "../lib/oracle";
import RetryLib "../lib/retry";
import Types "../types/dex";
import PageTypes "../types/page";
import ProtocolFeeTypes "../types/protocol-fees";

// DEX lot 1 endpoints: pool registry, pair requests and admin review.
// DEX lot 2: deposit subaccounts, internal balances, DD / DW and DQ refunds.
// DEX lot 3: filling gauge, liquidity, LP positions, quotes and swaps.
// PTM-5: consolidated TTTI-T price, per-pool spread and in-app LP alerts.
mixin (
  dex : Types.DexStore,
  ledger : IcrcLib.Ledger,
  accessControlState : AccessControl.AccessControlState,
  canister : Principal,
  dexContext : RetryLib.DexContext,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
  refreshSources : () -> async Nat,
  consolidatedPrices : ProtocolFeeTypes.ConsolidatedPriceStore,
) {
  // Usable hourly USD rate of a pool token: ICP / ckBTC / ckUSDC / ckUSDT via
  // RetryLib.dexPayToken, OracleLib.storeFor and OracleLib.usableRate. TTTI-T
  // has no USD rate (DEX-2: never valued at a fixed price); null when the rate
  // is absent or expired.
  func usdRateOf(token : Types.PoolToken) : ?Nat {
    switch (DexLib.poolDexToken(token)) {
      case (?#tttiT) null;
      case (?t) {
        switch (RetryLib.dexPayToken(t)) {
          case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, pay), Time.now());
          case null null;
        };
      };
      case null null;
    };
  };

  // PTM-9f: the DEX tokens of a pool (the deposit accounts a swap on it touches).
  func poolDexTokens(poolId : Nat) : [Types.DexToken] {
    switch (dex.pools.get(poolId)) {
      case (?p) {
        switch (DexLib.poolDexToken(p.token0), DexLib.poolDexToken(p.token1)) {
          case (?a, ?b) [a, b];
          case (?a, null) [a];
          case (null, ?b) [b];
          case (null, null) [];
        };
      };
      case null [];
    };
  };

  // DEX lot 6: calls that add to the DEX are refused while it is paused.
  func requireNotPaused() {
    if (dexContext.pause.paused) {
      Runtime.trap(DexLib.PAUSED_MESSAGE);
    };
  };

  public query func listDexPools() : async [Types.PoolView] {
    DexLib.listPools(dex, canister, Time.now(), usdRateOf);
  };

  public query func getDexPool(poolId : Nat) : async ?Types.PoolView {
    DexLib.getPool(dex, canister, Time.now(), poolId, usdRateOf);
  };

  public query func getDexConfig() : async Types.DexConfig {
    DexLib.config(canister);
  };

  public query func listPairRequests() : async [Types.PairRequestView] {
    DexLib.listRequests(dex, canister);
  };

  public shared query ({ caller }) func getMyPairRequests() : async [Types.PairRequestView] {
    DexLib.requestsOf(dex, canister, caller);
  };

  public shared ({ caller }) func requestPair(args : Types.RequestPairArgs) : async Result.Result<Types.PairRequestView, Types.RequestPairError> {
    requireNotPaused();
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    switch (DexLib.checkRequestLimits(dex, caller, args.message, Time.now())) {
      case (?e) return #err(e);
      case null {};
    };
    if (args.ledgerId == canister or args.ledgerId.isAnonymous()) {
      return #err(#invalidToken("The requested ledger must be an external ICRC ledger other than TTTI-T"));
    };
    let counter = switch (DexLib.resolveCounter(dex, args.counter)) {
      case (#ok(c)) c;
      case (#err(e)) return #err(e);
    };
    let counterLedger = DexLib.ledgerPrincipal(counter.ledger, canister);
    if (counterLedger == args.ledgerId) {
      return #err(#invalidToken("The requested token and the counter token are the same ledger"));
    };
    switch (DexLib.findExisting(dex, canister, args.ledgerId, counterLedger, args.feeTier)) {
      case (?existing) return #err(#pairExists(existing));
      case null {};
    };
    let (token, readChecks) = switch (await* DexLib.readLedger(args.ledgerId)) {
      case (#ok(result)) result;
      case (#err(e)) return #err(e);
    };
    // State may have changed during the ledger calls: check again.
    let now = Time.now();
    switch (DexLib.checkRequestLimits(dex, caller, args.message, now)) {
      case (?e) return #err(e);
      case null {};
    };
    switch (DexLib.findExisting(dex, canister, args.ledgerId, counterLedger, args.feeTier)) {
      case (?existing) return #err(#pairExists(existing));
      case null {};
    };
    let copiedSymbolOf = if (DexLib.isKnownLedger(args.ledgerId)) null else DexLib.copiedSymbol(token.symbol);
    let checks : Types.RequestChecks = { readChecks with pairUnique = true; copiedSymbolOf };
    let required = DexLib.REQUEST_DEPOSIT + IcrcLib.fee(ledger);
    let depositBlock = switch (
      IcrcLib.transferFrom(
        ledger,
        canister,
        canister,
        {
          spender_subaccount = null;
          from = { owner = caller; subaccount = null };
          to = DexLib.requestDepositAccount(canister);
          amount = DexLib.REQUEST_DEPOSIT;
          fee = null;
          memo = null;
          created_at_time = null;
        },
      )
    ) {
      case (#Ok(block)) block;
      case (#Err(#InsufficientAllowance({ allowance }))) return #err(#insufficientAllowance({ allowance; required }));
      case (#Err(#InsufficientFunds({ balance }))) return #err(#insufficientFunds({ balance }));
      case (#Err(e)) return #err(#depositFailed(debug_show (e)));
    };
    let request = DexLib.addRequest(dex, caller, token, counter, args.feeTier, args.message, checks, depositBlock, now);
    // PTM-9f: new activity of the caller: its deposit account is read again.
    RetryLib.reincludeOnActivity(dexContext.batch, caller, [#tttiT]);
    #ok(DexLib.toRequestView(request, canister));
  };

  // Creates the pool, then records and sends the DQ refund through
  // lib/retry.mo under the request lock; approval does not depend on it.
  public shared ({ caller }) func approvePair(requestId : Nat, minimums : ?Types.TokenMinimums) : async Result.Result<Types.PoolView, Types.ApprovePairError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    requireNotPaused();
    let request = switch (DexLib.prepareApproval(dex, canister, requestId, minimums)) {
      case (#ok(r)) r;
      case (#err(e)) return #err(e);
    };
    let pool = DexLib.completeApproval(dex, request, minimums, Time.now());
    let key = RetryLib.dexRequestLockKey(requestId);
    if (RetryLib.tryLock(dexContext.locks, key)) {
      try {
        RetryLib.sendPairRefund(dexContext, requestId);
      } finally {
        RetryLib.unlock(dexContext.locks, key);
      };
    };
    #ok(DexLib.toPoolView(dex, pool, canister, Time.now(), usdRateOf));
  };

  // --- DEX lot 2 ---------------------------------------------------------

  public query func getDexTokens() : async [Types.DexTokenInfo] {
    DexLib.DEX_TOKENS.map(func t = DexLib.tokenInfo(t, canister, RetryLib.dexFee(dexContext, t)));
  };

  public query func getDexDepositAccount(owner : Principal) : async Types.DexAccount {
    DexLib.userDepositAccount(canister, owner);
  };

  public query func getDexPoolAccount(poolId : Nat) : async ?Types.DexAccount {
    DexLib.poolAccount(dex, canister, poolId);
  };

  public query func getDexBalances(owner : Principal) : async [Types.DexBalanceView] {
    DexLib.balancesOf(dexContext.balances, owner, canister);
  };

  // Unpaged. Kept only while the frontend (hooks/useDex.ts) still calls it;
  // replaced by getDexTransfersPage and removed once the frontend has moved.
  public query func getDexTransfers(owner : Principal) : async [Types.DexTransferView] {
    RetryLib.dexTransfersOf(dexContext, owner);
  };

  // PTM-9f: deposits and withdrawals of `owner`, newest first, by pages. The
  // cursor is the transfer number `n` (global, unique across deposits and
  // withdrawals): cursor = null returns the newest `limit` transfers, cursor =
  // ?c the transfers with n strictly below c. `limit` is clamped by
  // PageTypes.clampLimit (0 -> 50, cap PageTypes.MAX_PAGE_SIZE = 100).
  // nextCursor = n of the last returned transfer while older ones may remain,
  // null on the last page.
  public query func getDexTransfersPage(owner : Principal, cursor : ?Nat, limit : Nat) : async PageTypes.Page<Types.DexTransferView> {
    RetryLib.dexTransfersPageOf(dexContext, owner, cursor, limit);
  };

  // DD: ICRC-2 transfer_from (amount + ledger fee approved) from the caller's
  // default account into the token's DEX custody account (DEX-1).
  public shared ({ caller }) func depositToDex(args : Types.DexAmountArgs) : async Result.Result<Types.DexTransferView, Types.DexDepositError> {
    requireNotPaused();
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    let fee = RetryLib.dexFee(dexContext, args.token);
    if (args.amount <= fee) {
      return #err(#amountTooSmall({ minimum = fee + 1 }));
    };
    let key = RetryLib.dexLockKey(caller, args.token);
    if (not RetryLib.tryLock(dexContext.locks, key)) {
      return #err(#transferInProgress);
    };
    try {
      let opened = RetryLib.openDexDeposit(dexContext, caller, args.token, args.amount);
      let (transfer, err) = await RetryLib.sendDexDepositDetailed(dexContext, opened.n);
      switch (err) {
        case (?#InsufficientAllowance({ allowance })) #err(#insufficientAllowance({ allowance; required = args.amount + fee }));
        case (?#InsufficientFunds({ balance })) #err(#insufficientFunds({ balance }));
        case (?_) {
          let text = switch (transfer.status) { case (#failed(t)) t; case _ "ledger error" };
          #err(#ledgerError(text));
        };
        case null #ok(RetryLib.dexTransferView(dexContext, transfer, #deposit));
      };
    } finally {
      RetryLib.unlock(dexContext.locks, key);
    };
  };

  // DW: internal balance to the caller's default account, ledger fee deducted,
  // paid from the token's DEX custody account (DEX-1).
  public shared ({ caller }) func withdrawFromDex(args : Types.DexAmountArgs) : async Result.Result<Types.DexTransferView, Types.DexWithdrawError> {
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    let fee = RetryLib.dexFee(dexContext, args.token);
    if (args.amount <= fee) {
      return #err(#amountTooSmall({ minimum = fee + 1 }));
    };
    let availableNow = DexLib.available(dexContext.balances, caller, args.token);
    if (args.amount > availableNow) {
      return #err(#insufficientBalance({ available = availableNow }));
    };
    let key = RetryLib.dexLockKey(caller, args.token);
    if (not RetryLib.tryLock(dexContext.locks, key)) {
      return #err(#transferInProgress);
    };
    try {
      let opened = switch (RetryLib.openDexWithdrawal(dexContext, caller, args.token, args.amount, fee)) {
        case (?t) t;
        case null return #err(#insufficientBalance({ available = DexLib.available(dexContext.balances, caller, args.token) }));
      };
      let transfer = await RetryLib.sendDexWithdrawal(dexContext, opened.n);
      switch (transfer.status) {
        case (#failed(text)) #err(#ledgerError(text));
        case _ #ok(RetryLib.dexTransferView(dexContext, transfer, #withdrawal));
      };
    } finally {
      RetryLib.unlock(dexContext.locks, key);
    };
  };

  public shared ({ caller }) func refusePair(requestId : Nat, reason : Text) : async Result.Result<Types.PairRequestView, Types.RefusePairError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    switch (DexLib.refuse(dex, requestId, reason, Time.now())) {
      case (#ok(r)) #ok(DexLib.toRequestView(r, canister));
      case (#err(e)) #err(e);
    };
  };

  // DEX-2: announces the removal (no immediate removal). Public reason,
  // effectiveAt = now + 5 days. From the announcement swaps and liquidity
  // adds are suspended in the pool; voluntary removals stay allowed subject to
  // unlockAt. At effectiveAt every remaining position is liquidated and paid to
  // the owner's wallet (LQ), then the pool becomes #removed.
  public shared ({ caller }) func removePair(poolId : Nat, reason : Text) : async Result.Result<Types.PoolView, Types.RemovePairError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    let now = Time.now();
    switch (DexLib.announceRemoval(dex, poolId, reason, now)) {
      case (#ok(pool)) #ok(DexLib.toPoolView(dex, pool, canister, now, usdRateOf));
      case (#err(e)) #err(e);
    };
  };

  // DEX-2: admin cancels an announced removal before its effective date; the
  // pool resumes normally.
  public shared ({ caller }) func cancelPairRemoval(poolId : Nat) : async Result.Result<Types.PoolView, Types.CancelRemovalError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    let now = Time.now();
    switch (DexLib.cancelRemoval(dex, poolId, now)) {
      case (#ok(pool)) #ok(DexLib.toPoolView(dex, pool, canister, now, usdRateOf));
      case (#err(e)) #err(e);
    };
  };

  // DEX-2: first-deposit reference price of a pool, public: TTTI-T price
  // (depth-weighted), sources and weights, rate validity, readable /
  // unavailable status. Null when the pool does not exist.
  public query func getReferencePrice(poolId : Nat) : async ?Types.ReferencePrice {
    DexLib.referencePrice(dex, poolId, usdRateOf, Time.now());
  };

  // PTM-5: consolidated TTTI-T price (USD x 1e8) from all open native TTTI-T
  // pools, current oracle rates, depth-weighted, with the hourly and 24 h
  // averages. `price` is #unavailable when no pool or no valid rate is usable.
  public query func getConsolidatedTttiPrice() : async Types.ConsolidatedPrice {
    DexLib.consolidatedPriceView(dex, consolidatedPrices.samples, usdRateOf, Time.now());
  };

  // PTM-5: spread of each native TTTI-T pool against the consolidated price
  // (signed bps), the pool's own USD price and the 2 % alert flag.
  public query func getPoolSpreads() : async Types.PoolSpreadReport {
    DexLib.poolSpreads(dex, usdRateOf, Time.now());
  };

  // PTM-5: pools where the caller holds a liquidity position and whose spread
  // currently exceeds 2 %. Computed on each call, nothing stored; empty for an
  // anonymous caller and once the spread is back to 2 % or less.
  public shared query ({ caller }) func getMyPoolSpreadAlerts() : async [Types.PoolSpreadAlert] {
    DexLib.spreadAlerts(dex, caller, usdRateOf, Time.now());
  };

  // DEX-2: reads the ICPSwap TTTI-T pairs and stores their latest prices and
  // depths (input of getReferencePrice). Returns the number of readable pairs.
  // Admin only; the hourly timer runs the same read. Read only: no order, no
  // transfer, no TTTI-T created.
  public shared ({ caller }) func refreshReferenceSources() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only an admin can refresh the reference sources");
    };
    await refreshSources();
  };

  public shared ({ caller }) func setUtilityPairMinimums(poolId : Nat, minimums : Types.TokenMinimums) : async Result.Result<Types.PoolView, Types.SetMinimumsError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    switch (DexLib.setUtilityMinimums(dex, poolId, minimums)) {
      case (#ok(p)) #ok(DexLib.toPoolView(dex, p, canister, Time.now(), usdRateOf));
      case (#err(e)) #err(e);
    };
  };

  // --- DEX lot 3 ---------------------------------------------------------

  public query func quoteAddLiquidity(args : Types.AddLiquidityQuoteArgs) : async Result.Result<Types.AddLiquidityQuote, Types.AddLiquidityError> {
    DexLib.quoteAddLiquidity(dex, args, usdRateOf, Time.now());
  };

  // Takes every key or none; false when one is already held.
  func lockAll(keys : [Text]) : Bool {
    for (i in keys.keys()) {
      if (not RetryLib.tryLock(dexContext.locks, keys[i])) {
        var j = 0;
        while (j < i) {
          RetryLib.unlock(dexContext.locks, keys[j]);
          j += 1;
        };
        return false;
      };
    };
    true;
  };

  func unlockAll(keys : [Text]) {
    for (k in keys.values()) {
      RetryLib.unlock(dexContext.locks, k);
    };
  };

  // Owner token lock keys of a pool's DEX tokens.
  func poolTokenKeys(owner : Principal, poolId : Nat) : [Text] {
    switch (dex.pools.get(poolId)) {
      case (?pool) {
        let keys = switch (DexLib.poolDexToken(pool.token0), DexLib.poolDexToken(pool.token1)) {
          case (?a, ?b) [RetryLib.dexLockKey(owner, a), RetryLib.dexLockKey(owner, b)];
          case (?a, null) [RetryLib.dexLockKey(owner, a)];
          case (null, ?b) [RetryLib.dexLockKey(owner, b)];
          case (null, null) [];
        };
        keys;
      };
      case null [];
    };
  };

  // DEX-1: pulls `shortfall` of `token` from the caller's default account into
  // the token's custody account (ICRC-2 transfer_from, memo DD, created_at_time,
  // retry rules of lib/retry.mo) and credits the internal balance on Ok /
  // Duplicate. The caller already holds the owner token lock. #err carries the
  // additional amount the allowance or balance would have allowed (nothing is
  // credited).
  func pullShortfall(caller : Principal, token : Types.DexToken, shortfall : Nat) : async* { #ok; #err : Nat } {
    let fee = RetryLib.dexFee(dexContext, token);
    let opened = RetryLib.openDexDeposit(dexContext, caller, token, shortfall);
    let (transfer, err) = await RetryLib.sendDexDepositDetailed(dexContext, opened.n);
    switch (transfer.status) {
      case (#completed(_)) #ok;
      case (_) {
        let usable = switch (err) {
          case (?#InsufficientAllowance({ allowance })) { if (allowance > fee) Nat.sub(allowance, fee) else 0 };
          case (?#InsufficientFunds({ balance })) { if (balance > fee) Nat.sub(balance, fee) else 0 };
          case (_) 0;
        };
        #err(usable);
      };
    };
  };

  // From the caller's internal available balances on a filling or open pool;
  // one new position with its own optional lock (none by default; otherwise
  // 3 months to 5 years). DEX-2: the fixed side is `amount`; the other side is computed at
  // the pool ratio after the funds arrived, within slippageBps (default 50);
  // outside the tolerance the add is refused and the funds stay in the
  // internal balance, as does any surplus. Any shortfall of
  // either pool token is first pulled into custody by ICRC-2 transfer_from
  // and credited (DEX-1); without enough allowance or balance the call is
  // refused with #insufficientBalance.
  public shared ({ caller }) func addLiquidity(args : Types.AddLiquidityArgs) : async Result.Result<Types.AddLiquidityResult, Types.AddLiquidityError> {
    requireNotPaused();
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    if (dex.pools.get(args.poolId) == null) {
      return #err(#poolNotFound);
    };
    let keys = poolTokenKeys(caller, args.poolId);
    if (not lockAll(keys)) {
      return #err(#operationInProgress);
    };
    try {
      let need = switch (DexLib.addLiquidityNeed(dex, args, usdRateOf, Time.now())) {
        case (#ok(n)) n;
        case (#err(e)) return #err(e);
      };
      let have0 = DexLib.available(dexContext.balances, caller, need.token0);
      if (have0 < need.amount0) {
        switch (await* pullShortfall(caller, need.token0, Nat.sub(need.amount0, have0))) {
          case (#ok) {};
          case (#err(usable)) return #err(#insufficientBalance({ token = need.token0; available = have0 + usable; required = need.amount0 }));
        };
      };
      let have1 = DexLib.available(dexContext.balances, caller, need.token1);
      if (have1 < need.amount1) {
        switch (await* pullShortfall(caller, need.token1, Nat.sub(need.amount1, have1))) {
          case (#ok) {};
          case (#err(usable)) return #err(#insufficientBalance({ token = need.token1; available = have1 + usable; required = need.amount1 }));
        };
      };
      let isCreator = AccessControl.isAdmin(accessControlState, caller);
      DexLib.addLiquidity(dex, dexContext.balances, canister, caller, isCreator, args, usdRateOf, Time.now());
    } finally {
      unlockAll(keys);
    };
  };

  // Position owner only; after the unlock date in every pool state (no lock =
  // any time). Allowed during an announced removal.
  public shared ({ caller }) func removeLiquidity(positionId : Nat) : async Result.Result<Types.RemoveLiquidityResult, Types.RemoveLiquidityError> {
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    let position = switch (dex.positions.get(positionId)) {
      case (?p) p;
      case null return #err(#positionNotFound);
    };
    if (position.owner != caller) {
      return #err(#notPositionOwner);
    };
    let keys = [DexLib.positionLockKey(positionId)].concat(poolTokenKeys(caller, position.poolId));
    if (not lockAll(keys)) {
      return #err(#operationInProgress);
    };
    try {
      DexLib.removeLiquidity(dex, dexContext.balances, canister, caller, positionId, usdRateOf, Time.now());
    } finally {
      unlockAll(keys);
    };
  };

  // Position owner only; never shortens, at most 5 years from the lock start,
  // 3 months to 5 years remaining after the extension.
  // PTM-3: the added weight relieves the other locked positions of the pool.
  public shared ({ caller }) func extendLock(positionId : Nat, newUnlockAt : Int) : async Result.Result<Types.ExtendLockResult, Types.ExtendLockError> {
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    let keys = [DexLib.positionLockKey(positionId)];
    if (not lockAll(keys)) {
      return #err(#operationInProgress);
    };
    try {
      DexLib.extendLock(dex, canister, caller, positionId, newUnlockAt, usdRateOf, Time.now());
    } finally {
      unlockAll(keys);
    };
  };

  public query func getDexPosition(positionId : Nat) : async ?Types.PositionView {
    DexLib.getPosition(dex, canister, positionId, Time.now());
  };

  public query func listPoolPositions(poolId : Nat) : async [Types.PositionView] {
    DexLib.positionsOfPool(dex, canister, poolId, Time.now());
  };

  public query func listDexPositionsOf(owner : Principal) : async [Types.PositionView] {
    DexLib.positionsOf(dex, canister, owner, Time.now());
  };

  public query func quoteSwap(poolId : Nat, tokenIn : Types.DexToken, amountIn : Nat, slippageBps : Nat) : async Result.Result<Types.SwapQuote, Types.SwapError> {
    DexLib.quoteSwap(dex, poolId, tokenIn, amountIn, slippageBps, usdRateOf, Time.now());
  };

  // Exact input from internal balances; deadline at most 5 minutes after the
  // call. A shortfall of the input token is first pulled into custody by
  // ICRC-2 transfer_from and credited (DEX-1); without enough allowance or
  // balance the call is refused with #insufficientBalance before any effect.
  public shared ({ caller }) func swap(poolId : Nat, tokenIn : Types.DexToken, amountIn : Nat, minAmountOut : Nat, deadline : Int) : async Result.Result<Types.SwapResult, Types.SwapError> {
    requireNotPaused();
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    if (dex.pools.get(poolId) == null) {
      return #err(#poolNotFound);
    };
    let keys = poolTokenKeys(caller, poolId);
    if (not lockAll(keys)) {
      return #err(#operationInProgress);
    };
    try {
      // PTM-9f: new activity of the caller: its deposit accounts are read again.
      RetryLib.reincludeOnActivity(dexContext.batch, caller, poolDexTokens(poolId));
      let have = DexLib.available(dexContext.balances, caller, tokenIn);
      if (have < amountIn) {
        switch (DexLib.swapPrecheck(dex, poolId, tokenIn, amountIn, minAmountOut, deadline, usdRateOf, Time.now())) {
          case (?e) return #err(e);
          case null {};
        };
        switch (await* pullShortfall(caller, tokenIn, Nat.sub(amountIn, have))) {
          case (#ok) {};
          case (#err(usable)) return #err(#insufficientBalance({ available = have + usable }));
        };
      };
      DexLib.swap(dex, dexContext.balances, canister, caller, poolId, tokenIn, amountIn, minAmountOut, deadline, false, usdRateOf, Time.now(), dexContext.indicators);
    } finally {
      unlockAll(keys);
    };
  };

  // --- PTM-9d: per-pool LP fee pot and daily sliced sharing --------------------
  // Logic in lib/dex-pot.mo.

  // Public: pending pot of every pool (amount in each of the pool's two tokens)
  // and the time of the next sharing.
  public query func getDexPendingPots() : async [Types.PendingPotView] {
    DexPotLib.pendingPots(dex);
  };

  // Public: pending pot of one pool; null when the pool does not exist.
  public query func getDexPendingPot(poolId : Nat) : async ?Types.PendingPotView {
    DexPotLib.pendingPot(dex, poolId);
  };

  // Public (positions are public): estimated share of one position for the
  // current day, with the same weight rule as the sharing; null when the
  // position does not exist.
  public query func getDexEstimatedShare(positionId : Nat) : async ?Types.EstimatedShareView {
    DexPotLib.estimatedShareOf(dex, positionId, Time.now());
  };

  // The caller's positions with their estimated share for the current day.
  // Empty for an anonymous caller.
  public shared query ({ caller }) func getMyDexEstimatedShares() : async [Types.EstimatedShareView] {
    DexPotLib.estimatedSharesOf(dex, caller, Time.now());
  };

  // Timer entry: runs ONE slice (Types.SLICE_SIZE positions) of the daily
  // sharing of one pool. Anyone may call; it does nothing when no sharing is
  // running for the pool. The composition wires it to the recurring timer.
  public shared func runDexPotSlice(poolId : Nat) : async Types.PotSliceReport {
    DexPotLib.runSlice(dex, dexContext.balances, poolId, Types.SLICE_SIZE);
  };

  // Timer entry: starts the daily day-roll once the day is over (freezes each
  // pool's pending pot and starts its sliced sharing). Anyone may call; it does
  // nothing before the next sharing time. The composition wires it to a timer.
  public shared func startDexDayRoll() : async Types.DayRollReport {
    DexPotLib.startDayRoll(dex, Time.now());
  };
};
