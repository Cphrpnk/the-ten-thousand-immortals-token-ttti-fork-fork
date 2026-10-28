import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import DexLib "../lib/dex";
import IcrcLib "../lib/icrc";
import OracleLib "../lib/oracle";
import RetryLib "../lib/retry";
import Types "../types/dex";

// DEX lot 1 endpoints: pool registry, pair requests and admin review.
// DEX lot 2: deposit subaccounts, internal balances, DD / DW and DQ refunds.
// DEX lot 3: filling gauge, liquidity, LP positions, quotes and swaps.
mixin (
  dex : Types.DexStore,
  ledger : IcrcLib.Ledger,
  accessControlState : AccessControl.AccessControlState,
  canister : Principal,
  dexContext : RetryLib.DexContext,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
) {
  // Usable USD rate of a pool token: TTTI-T fixed (DexLib.TTTI_T_USD_E8);
  // ICP / ckBTC / ckUSDC / ckUSDT via RetryLib.dexPayToken,
  // OracleLib.storeFor and OracleLib.usableRate; null otherwise.
  func usdRateOf(token : Types.PoolToken) : ?Nat {
    switch (DexLib.poolDexToken(token)) {
      case (?#tttiT) ?DexLib.TTTI_T_USD_E8;
      case (?t) {
        switch (RetryLib.dexPayToken(t)) {
          case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, pay), Time.now());
          case null null;
        };
      };
      case null null;
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
    #ok(DexLib.toRequestView(request, canister));
  };

  // Creates the pool, then records and sends the DQ refund through
  // lib/retry.mo under the request lock; approval does not depend on it.
  public shared ({ caller }) func approvePair(requestId : Nat, minimums : ?Types.TokenMinimums) : async Result.Result<Types.PoolView, Types.ApprovePairError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
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
    #ok(DexLib.toPoolView(pool, canister, Time.now(), usdRateOf));
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

  public query func getDexTransfers(owner : Principal) : async [Types.DexTransferView] {
    RetryLib.dexTransfersOf(dexContext, owner);
  };

  // DD: ICRC-2 transfer_from (amount + ledger fee approved) into the
  // caller's DEX deposit subaccount.
  public shared ({ caller }) func depositToDex(args : Types.DexAmountArgs) : async Result.Result<Types.DexTransferView, Types.DexDepositError> {
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

  // DW: internal balance to the caller's default account, ledger fee deducted.
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

  public shared ({ caller }) func removePair(poolId : Nat) : async Result.Result<Types.PoolView, Types.RemovePairError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    let now = Time.now();
    switch (DexLib.remove(dex, poolId, now)) {
      case (#ok(p)) #ok(DexLib.toPoolView(p, canister, now, usdRateOf));
      case (#err(e)) #err(e);
    };
  };

  public shared ({ caller }) func setUtilityPairMinimums(poolId : Nat, minimums : Types.TokenMinimums) : async Result.Result<Types.PoolView, Types.SetMinimumsError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    switch (DexLib.setUtilityMinimums(dex, poolId, minimums)) {
      case (#ok(p)) #ok(DexLib.toPoolView(p, canister, Time.now(), usdRateOf));
      case (#err(e)) #err(e);
    };
  };

  // --- DEX lot 3 ---------------------------------------------------------

  public query func quoteAddLiquidity(args : Types.AddLiquidityQuoteArgs) : async Result.Result<Types.AddLiquidityQuote, Types.AddLiquidityError> {
    DexLib.quoteAddLiquidity(dex, args, usdRateOf);
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

  // From the caller's internal available balances on a filling or open pool;
  // one new position with its own lock (24 h to 5 years).
  public shared ({ caller }) func addLiquidity(args : Types.AddLiquidityArgs) : async Result.Result<Types.AddLiquidityResult, Types.AddLiquidityError> {
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
      let isCreator = AccessControl.isAdmin(accessControlState, caller);
      DexLib.addLiquidity(dex, dexContext.balances, canister, caller, isCreator, args, usdRateOf, Time.now());
    } finally {
      unlockAll(keys);
    };
  };

  // Position owner only; after the unlock date, or any time on a removed pair.
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

  // Position owner only; never shortens, at most 5 years from now.
  public shared ({ caller }) func extendLock(positionId : Nat, newUnlockAt : Int) : async Result.Result<Types.PositionView, Types.ExtendLockError> {
    if (caller.isAnonymous()) {
      return #err(#anonymous);
    };
    let keys = [DexLib.positionLockKey(positionId)];
    if (not lockAll(keys)) {
      return #err(#operationInProgress);
    };
    try {
      DexLib.extendLock(dex, canister, caller, positionId, newUnlockAt, Time.now());
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

  // Exact input from internal balances; deadline at most 5 minutes after the call.
  public shared ({ caller }) func swap(poolId : Nat, tokenIn : Types.DexToken, amountIn : Nat, minAmountOut : Nat, deadline : Int) : async Result.Result<Types.SwapResult, Types.SwapError> {
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
      DexLib.swap(dex, dexContext.balances, canister, caller, poolId, tokenIn, amountIn, minAmountOut, deadline, false, usdRateOf, Time.now());
    } finally {
      unlockAll(keys);
    };
  };
};
