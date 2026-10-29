import List "mo:core/List";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import OwnerTypes "../types/owner-revenue";
import PayTypes "../types/pay-token";
import RetryTypes "../types/retry";
import Common "../types/common";
import RetryLib "retry";
import ProtocolFeesLib "protocol-fees";
import TreasuryLib "treasury";
import PayTokenLib "pay-token";
import CyclesReserveLib "cycles-reserve";

// Mint revenue routing: receiving wallets per pay token, the dedicated fee
// account (read-only) and the one-time per-token settlement of revenue held
// earlier in the contract. Sends go through lib/retry.mo (memo,
// created_at_time, identical resend for 23 h, then To review).
module {
  public type SettlementContext = {
    transfers : RetryLib.TransferContext; // retry, ownerRevenue, mintRevenue, locks, sale
    fees : ProtocolFeesLib.ProtocolFeeContext; // mint-fee accounting (set-aside, LP credits)
    allocation : TreasuryLib.AllocationStore; // cached legacy mint treasury balances
  };

  let TIMER_INTERVAL_SECONDS : Nat = 600;
  let LOCK : Text = "SETTLEMENT";

  // The dedicated fee account of this contract.
  public func feeAccount(canister : Principal) : Common.Account {
    { owner = canister; subaccount = ?ProtocolFeesLib.MINT_FEE_ACCOUNT_SUBACCOUNT };
  };

  func sat(a : Nat, b : Nat) : Nat = if (a > b) Nat.sub(a, b) else 0;

  // --- ICRC-1 textual account ------------------------------------------------

  func crc32(bytes : [Nat8]) : Nat32 {
    var c : Nat32 = 0xFFFFFFFF;
    for (b in bytes.values()) {
      c := c ^ Nat32.fromNat(b.toNat());
      var i = 0;
      while (i < 8) {
        c := if (c & 1 == 1) (c >> 1) ^ 0xEDB88320 else c >> 1;
        i += 1;
      };
    };
    c ^ 0xFFFFFFFF;
  };

  // Base32 (RFC 4648, lowercase, no padding) of a 32-bit checksum: 7 chars.
  func base32(n : Nat32) : Text {
    let alphabet = "abcdefghijklmnopqrstuvwxyz234567".toArray();
    let bits = n.toNat() * 8; // 35 bits, the last 3 zero
    var out = "";
    var shift = 30;
    var i = 0;
    while (i < 7) {
      let index = (bits / (2 ** shift)) % 32;
      out #= Text.fromChar(alphabet[index]);
      if (shift >= 5) shift -= 5;
      i += 1;
    };
    out;
  };

  public func accountText(a : Common.Account) : Text {
    let ownerText = a.owner.toText();
    let sub = switch (a.subaccount) {
      case (?s) { s };
      case null { return ownerText };
    };
    let trimmed = RetryLib.hex(sub).trimStart(#char '0');
    if (trimmed == "") {
      return ownerText;
    };
    let checksum = crc32(a.owner.toBlob().toArray().concat(sub.toArray()));
    ownerText # "-" # base32(checksum) # "." # trimmed;
  };

  // --- Receiving wallets -----------------------------------------------------

  // Configured wallet of `token` (BTC mints use #ckbtc), if any.
  public func walletOf(store : OwnerTypes.MintRevenueStore, token : PayTypes.PayToken) : ?Common.Account {
    switch (store.wallets.get(TreasuryLib.tokenKey(token))) {
      case (?w) { ?w.account };
      case null { null };
    };
  };

  func walletView(store : OwnerTypes.MintRevenueStore, token : PayTypes.PayToken) : OwnerTypes.ReceivingWalletView {
    switch (store.wallets.get(TreasuryLib.tokenKey(token))) {
      case (?w) { { token; wallet = ?w.account; accountText = ?accountText(w.account); setAt = ?w.setAt; setBy = ?w.setBy } };
      case null { { token; wallet = null; accountText = null; setAt = null; setBy = null } };
    };
  };

  // Every pay token with its wallet (or null).
  public func walletViews(store : OwnerTypes.MintRevenueStore) : [OwnerTypes.ReceivingWalletView] {
    PayTokenLib.ALL.map(func(t : PayTypes.PayToken) : OwnerTypes.ReceivingWalletView = walletView(store, t));
  };

  // Validates and stores the wallet, records a WalletChange and, on the first
  // configuration of the token, starts its one-time settlement.
  public func setWallet(ctx : SettlementContext, token : PayTypes.PayToken, account : Common.Account, by : Principal, now : Int) : OwnerTypes.ReceivingWalletResult {
    if (account.owner.isAnonymous()) {
      return #err(#anonymousOwner);
    };
    switch (account.subaccount) {
      case (?s) { if (s.size() != 32) return #err(#invalidSubaccount) };
      case null {};
    };
    // Covers the mint (default) account, the fee account and every subaccount of this contract.
    if (account.owner == ctx.transfers.canister) {
      return #err(#contractAccount);
    };
    let store = ctx.transfers.mintRevenue;
    let k = TreasuryLib.tokenKey(token);
    let old = walletOf(store, token);
    store.wallets.add(k, { token; account; setAt = now; setBy = by });
    store.walletChanges.add({ id = store.nextWalletChangeId; token; oldAccount = old; newAccount = account; at = now; by });
    store.nextWalletChangeId += 1;
    if (old == null) {
      start(ctx, token, now);
    };
    #ok(walletView(store, token));
  };

  // Wallet changes, newest first.
  public func walletChanges(store : OwnerTypes.MintRevenueStore) : [OwnerTypes.WalletChange] {
    store.walletChanges.toArray().reverse();
  };

  // --- Fee account -----------------------------------------------------------

  // Owner, subaccount hex, account text, per-token ledger balance and totals.
  public func feeAccountView(ctx : SettlementContext) : async OwnerTypes.FeeAccountView {
    let canister = ctx.transfers.canister;
    let account = feeAccount(canister);
    let tokens = List.empty<OwnerTypes.FeeAccountTokenView>();
    for (token in PayTokenLib.ALL.values()) {
      let balance = switch (await PayTokenLib.balanceOf(PayTokenLib.ledger(token), account)) {
        case (#ok(b)) { ?b };
        case (#err(_)) { null };
      };
      var received = 0;
      for (m in ctx.transfers.mintRevenue.feeMoves.values()) {
        switch (m.status) {
          case (#sent(_)) { if (m.token == token) received += m.attempt.request.amount };
          case (_) {};
        };
      };
      var redistributedToLps = 0;
      for (r in ctx.fees.mintFees.routings.values()) {
        if (r.token == token) redistributedToLps += r.toLps;
      };
      let (setAside, injected) = switch (ctx.fees.mintFees.setAside.get(TreasuryLib.tokenKey(token))) {
        case (?sa) { (sa.amount, sa.totalInjected) };
        case null { (0, 0) };
      };
      tokens.add({ token; balance; received; setAside; redistributedToLps; injected });
    };
    {
      owner = canister;
      subaccountHex = RetryLib.hex(ProtocolFeesLib.MINT_FEE_ACCOUNT_SUBACCOUNT);
      accountText = accountText(account);
      tokens = tokens.toArray();
      readAt = Time.now();
    };
  };

  // --- One-time settlement ---------------------------------------------------

  func ownerLeg(ctx : SettlementContext, token : PayTypes.PayToken, purpose : OwnerTypes.SettlementLegPurpose, from : OwnerTypes.TreasurySource, fromSubaccount : ?Blob, wallet : Common.Account, amount : Nat) : OwnerTypes.SettlementLeg {
    let fee = PayTokenLib.expectedFee(token);
    if (amount <= fee) {
      return { purpose; amount; ownerSendId = null; feeMoveN = null }; // not required
    };
    let send = RetryLib.openOwnerSend(ctx.transfers, token, #settlement({ from }), fromSubaccount, wallet, Nat.sub(amount, fee), fee);
    { purpose; amount; ownerSendId = ?send.id; feeMoveN = null };
  };

  func feeLeg(ctx : SettlementContext, token : PayTypes.PayToken, purpose : OwnerTypes.SettlementLegPurpose, fromSubaccount : ?Blob, amount : Nat) : OwnerTypes.SettlementLeg {
    let fee = PayTokenLib.expectedFee(token);
    if (amount <= fee) {
      return { purpose; amount; ownerSendId = null; feeMoveN = null }; // not required
    };
    let move = RetryLib.openFeeMove(ctx.transfers, token, #settlement(purpose), fromSubaccount, feeAccount(ctx.transfers.canister), Nat.sub(amount, fee), fee);
    { purpose; amount; ownerSendId = null; feeMoveN = ?move.n };
  };

  func hasLegacyLegs(s : OwnerTypes.TokenSettlement) : Bool {
    s.legs.find(func(l : OwnerTypes.SettlementLeg) : Bool = l.purpose == #ownerMintTreasury) != null;
  };

  // Records the legs of `token`'s settlement when its wallet is configured
  // and it has not started yet. Never restarts a completed settlement.
  // Default-account legs are recorded here at once (accumulated owner share,
  // not-yet-redistributed fee amounts); the legacy MINT-TREASURY legs need a
  // ledger balance read and are recorded by the next runPending pass.
  public func start(ctx : SettlementContext, token : PayTypes.PayToken, now : Int) {
    let store = ctx.transfers.mintRevenue;
    let k = TreasuryLib.tokenKey(token);
    switch (store.settlements.get(k)) {
      case (?s) { if (s.status != #pendingWallet) return };
      case null {};
    };
    let wallet = walletOf(store, token) ?? (return);
    let fee = PayTokenLib.expectedFee(token);

    // Accumulated 100/101 share: the counter is cleared, the funds belong to the leg.
    let accumulated = ctx.transfers.ownerRevenue.accumulated.get(k) ?? 0;
    if (accumulated > 0) {
      ctx.transfers.ownerRevenue.accumulated.add(k, 0);
    };
    let accLeg = ownerLeg(ctx, token, #ownerAccumulated, #accumulated, null, wallet, accumulated);

    // Fee amounts not yet redistributed (set-aside and unclaimed LP credits),
    // held in the default account. LP credits are unchanged; the ledger fee
    // of the move is taken from the set-aside amount when it covers it.
    var claimable = 0;
    for (inner in ctx.fees.mintFees.claimable.values()) {
      claimable += inner.get(k) ?? 0;
    };
    let setAside = switch (ctx.fees.mintFees.setAside.get(k)) {
      case (?sa) { sa.amount };
      case null { 0 };
    };
    let pending = setAside + claimable;
    let pendingLeg = feeLeg(ctx, token, #feePending, null, pending);
    if (pendingLeg.feeMoveN != null) {
      switch (ctx.fees.mintFees.setAside.get(k)) {
        case (?sa) { if (sa.amount >= fee) ctx.fees.mintFees.setAside.add(k, { sa with amount = Nat.sub(sa.amount, fee) }) };
        case null {};
      };
    };

    store.settlements.add(k, {
      token;
      status = #sending;
      destination = ?wallet;
      legs = [accLeg, pendingLeg];
      startedAt = ?now;
      completedAt = null;
      lastError = null;
    });
  };

  func setError(ctx : SettlementContext, k : Text, error : Text) {
    switch (ctx.transfers.mintRevenue.settlements.get(k)) {
      case (?s) { ctx.transfers.mintRevenue.settlements.add(k, { s with lastError = ?error }) };
      case null {};
    };
  };

  // Fee part of the earlier forwards into the legacy MINT-TREASURY of
  // `token`: forward base minus the net amount of each forwarded conversion.
  func legacyFeePart(ctx : SettlementContext, token : PayTypes.PayToken) : Nat {
    let target = TreasuryLib.mintTreasuryAccount(ctx.transfers.canister, token);
    var sum = 0;
    for (c in ctx.transfers.treasury.conversions.values()) {
      if (c.payToken == token) {
        switch (c.forward, ctx.transfers.retry.forwards.get(c.id)) {
          case (#forwarded(_), ?a) {
            if (a.request.to == target) {
              let base = CyclesReserveLib.forwardBase(ctx.transfers.cyclesReserve, c);
              let net = c.netAmount ?? sat(c.payAmount, c.feeAmount ?? 0);
              sum += sat(base, net);
            };
          };
          case (_) {};
        };
      };
    };
    sum;
  };

  // Records the legacy MINT-TREASURY legs (owner share minus unsettled
  // withdrawals, and the fee part) from one ledger balance read.
  func addLegacyLegs(ctx : SettlementContext, token : PayTypes.PayToken) : async () {
    let k = TreasuryLib.tokenKey(token);
    let canister = ctx.transfers.canister;
    // The one-time reserve top-up may still spend MINT-TREASURY-ICP: wait for it.
    if (token == #icp and ctx.transfers.ownerRevenue.sweep.status == #toppingUpReserve) {
      return;
    };
    let account = TreasuryLib.mintTreasuryAccount(canister, token);
    let isDefault = account == { owner = canister; subaccount = null };
    let balance = if (isDefault) 0 else switch (await PayTokenLib.balanceOf(PayTokenLib.ledger(token), account)) {
      case (#ok(b)) { b };
      case (#err(e)) { setError(ctx, k, "Legacy mint treasury balance read failed: " # e); return };
    };
    // Re-checked after the await: never recorded twice.
    let s = ctx.transfers.mintRevenue.settlements.get(k) ?? (return);
    if (hasLegacyLegs(s) or s.status == #pendingWallet) {
      return;
    };
    let wallet = switch (s.destination) {
      case (?w) { w };
      case null { walletOf(ctx.transfers.mintRevenue, token) ?? (return) };
    };
    let available = sat(balance, RetryLib.unsettledMintTreasuryWithdrawals(ctx.transfers, token));
    let feePart = Nat.min(legacyFeePart(ctx, token), available);
    let ownerPart = Nat.sub(available, feePart);
    let sub = ?TreasuryLib.mintTreasurySubaccount(token);
    let legs = if (isDefault) [
      { purpose = #ownerMintTreasury; amount = 0; ownerSendId = null; feeMoveN = null } : OwnerTypes.SettlementLeg,
      { purpose = #feeLegacy; amount = 0; ownerSendId = null; feeMoveN = null } : OwnerTypes.SettlementLeg,
    ] else [
      ownerLeg(ctx, token, #ownerMintTreasury, #mintTreasury, sub, wallet, ownerPart),
      feeLeg(ctx, token, #feeLegacy, sub, feePart),
    ];
    ctx.transfers.mintRevenue.settlements.add(k, { s with legs = s.legs.concat(legs); lastError = null });
  };

  func legStatus(ctx : SettlementContext, leg : OwnerTypes.SettlementLeg) : ?(OwnerTypes.OwnerSendStatus, RetryTypes.TransferAttempt) {
    switch (leg.ownerSendId, leg.feeMoveN) {
      case (?id, _) {
        switch (ctx.transfers.ownerRevenue.sends.get(id)) {
          case (?s) { ?(s.status, s.attempt) };
          case null { null };
        };
      };
      case (null, ?n) {
        switch (ctx.transfers.mintRevenue.feeMoves.get(n)) {
          case (?m) { ?(m.status, m.attempt) };
          case null { null };
        };
      };
      case (null, null) { null }; // not required
    };
  };

  func isActive(status : OwnerTypes.OwnerSendStatus) : Bool {
    switch (status) {
      case (#pending or #failed(_)) { true };
      case (#sent(_) or #needsReview) { false };
    };
  };

  // Recomputes the settlement status from its legs.
  func refresh(ctx : SettlementContext, token : PayTypes.PayToken) {
    let k = TreasuryLib.tokenKey(token);
    let s = ctx.transfers.mintRevenue.settlements.get(k) ?? (return);
    switch (s.status) {
      case (#sent(_) or #pendingWallet) { return };
      case (_) {};
    };
    if (not hasLegacyLegs(s)) {
      return;
    };
    let blocks = List.empty<Nat>();
    var review = false;
    var failed : ?Text = null;
    var open = false;
    for (leg in s.legs.values()) {
      switch (legStatus(ctx, leg)) {
        case (?(#sent(b), _)) { blocks.add(b) };
        case (?(#needsReview, _)) { review := true };
        case (?(#failed(t), _)) { failed := ?t };
        case (?(#pending, _)) { open := true };
        case null {};
      };
    };
    let status : OwnerTypes.SettlementStatus = if (review) #toReview else switch (failed) {
      case (?t) { #failed(t) };
      case null { if (open) #sending else #sent(blocks.toArray()) };
    };
    let completedAt = switch (status) {
      case (#sent(_)) { ?Time.now() };
      case (_) { null };
    };
    ctx.transfers.mintRevenue.settlements.add(k, { s with status; completedAt });
  };

  func stepToken(ctx : SettlementContext, token : PayTypes.PayToken) : async () {
    let k = TreasuryLib.tokenKey(token);
    let store = ctx.transfers.mintRevenue;
    switch (store.settlements.get(k)) {
      case (?s) { if (s.status == #pendingWallet) start(ctx, token, Time.now()) };
      case null { start(ctx, token, Time.now()) };
    };
    let s = store.settlements.get(k) ?? (return);
    switch (s.status) {
      case (#sent(_) or #pendingWallet) { return };
      case (_) {};
    };
    if (not hasLegacyLegs(s)) {
      await addLegacyLegs(ctx, token);
    };
    let current = store.settlements.get(k) ?? (return);
    for (leg in current.legs.values()) {
      switch (legStatus(ctx, leg)) {
        case (?(status, _)) {
          if (isActive(status) and not ctx.transfers.sale.salesPaused) {
            switch (leg.ownerSendId, leg.feeMoveN) {
              case (?id, _) { await RetryLib.sendOwner(ctx.transfers, id) };
              case (null, ?n) { await RetryLib.sendFeeMove(ctx.transfers, n) };
              case (null, null) {};
            };
          };
        };
        case null {};
      };
    };
    refresh(ctx, token);
  };

  // Sends or resends every pending leg (timer pass). The sales pause blocks
  // it, like the other automatic retries.
  public func runPending(ctx : SettlementContext) : async () {
    if (ctx.transfers.sale.salesPaused) {
      return;
    };
    if (not RetryLib.tryLock(ctx.transfers.locks, LOCK)) {
      return;
    };
    try {
      for (token in PayTokenLib.ALL.values()) {
        await stepToken(ctx, token);
      };
    } catch (_) {
      // Legs are recorded before their sends; the next pass continues.
    } finally {
      RetryLib.unlock(ctx.transfers.locks, LOCK);
    };
  };

  // 10-minute settlement timer, re-armed on every install and upgrade.
  public func startTimer<system>(ctx : SettlementContext) {
    ignore Timer.recurringTimer<system>(
      #seconds(TIMER_INTERVAL_SECONDS),
      func() : async () { await runPending(ctx) },
    );
  };

  // Per-token settlement status (every pay token).
  public func statusViews(ctx : SettlementContext) : [OwnerTypes.TokenSettlementView] {
    PayTokenLib.ALL.map(
      func(token : PayTypes.PayToken) : OwnerTypes.TokenSettlementView {
        switch (ctx.transfers.mintRevenue.settlements.get(TreasuryLib.tokenKey(token))) {
          case null {
            { token; status = #pendingWallet; destination = null; ownerAmount = 0; feeAmount = 0; legs = []; startedAt = null; completedAt = null; lastError = null };
          };
          case (?s) {
            var ownerAmount = 0;
            var feeAmount = 0;
            let legs = s.legs.filterMap(
              func(leg : OwnerTypes.SettlementLeg) : ?OwnerTypes.SettlementLegView {
                let (status, attempt) = legStatus(ctx, leg) ?? (return null);
                if (leg.ownerSendId != null) ownerAmount += leg.amount else feeAmount += leg.amount;
                ?{
                  purpose = leg.purpose;
                  amount = leg.amount;
                  destination = attempt.request.to;
                  status;
                  block = switch (status) { case (#sent(b)) { ?b }; case (_) { null } };
                  memoText = attempt.memo.decodeUtf8() ?? "";
                };
              }
            );
            {
              token;
              status = s.status;
              destination = s.destination;
              ownerAmount;
              feeAmount;
              legs;
              startedAt = s.startedAt;
              completedAt = s.completedAt;
              lastError = s.lastError;
            };
          };
        };
      }
    );
  };

  // Token keys whose settlement is #sending.
  public func inFlight(store : OwnerTypes.MintRevenueStore) : [Text] {
    store.settlements.entries().filter(
      func((_, s) : (Text, OwnerTypes.TokenSettlement)) : Bool = s.status == #sending
    ).map(func((k, _) : (Text, OwnerTypes.TokenSettlement)) : Text = k).toArray();
  };

  // ST fee-account moves (per-mint 1/101 and settlement fee legs) whose
  // outcome is unknown after 23 h. Owner legs are OW sends, listed by lib/retry.mo.
  public func toReview(ctx : SettlementContext) : [RetryTypes.TransferReview] {
    ctx.transfers.mintRevenue.feeMoves.values().filter(
      func(m : OwnerTypes.FeeMove) : Bool = m.status == #needsReview
    ).map(
      func(m : OwnerTypes.FeeMove) : RetryTypes.TransferReview = RetryLib.review(#ST, m.n, m.token, ?m.attempt, null)
    ).toArray();
  };

  func refreshMove(ctx : SettlementContext, n : Nat) {
    switch (ctx.transfers.mintRevenue.feeMoves.get(n)) {
      case (?m) { refresh(ctx, m.token) };
      case null {};
    };
  };

  // Admin review of an ST move `n`: arrived in `block`.
  public func markArrived(ctx : SettlementContext, n : Nat, block : Nat) : RetryTypes.ReviewResult {
    let result = RetryLib.markFeeMoveArrived(ctx.transfers, n, block);
    refreshMove(ctx, n);
    result;
  };

  // Admin review of an ST move `n`: did not arrive; opens a new attempt.
  public func markNotArrived(ctx : SettlementContext, n : Nat) : RetryTypes.ReviewResult {
    let result = RetryLib.markFeeMoveNotArrived(ctx.transfers, n);
    refreshMove(ctx, n);
    result;
  };
};
