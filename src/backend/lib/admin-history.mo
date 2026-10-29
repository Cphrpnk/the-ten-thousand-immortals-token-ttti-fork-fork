import Blob "mo:core/Blob";
import Int "mo:core/Int";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Types "../types/admin-history";
import BuybackTypes "../types/buyback";
import RetryTypes "../types/retry";
import OwnerTypes "../types/owner-revenue";
import BtcTypes "../types/btc-deposit";
import RetryLib "retry";
import BtcDepositLib "btc-deposit";
import ProtocolFeesLib "protocol-fees";
import RouterLib "router";
import DexLib "dex";

// Unified admin history and the filtered To review list, built only from
// existing records (no new storage).
module {
  public type HistoryContext = {
    transfers : RetryLib.TransferContext; // conversions, refunds, owner sends, wallet changes
    btcDeposits : BtcDepositLib.BtcDepositStore;
    buybacks : BuybackTypes.BuybackStore;
    dex : RetryLib.DexContext; // native swaps and liquidity adds/removes
    fees : ProtocolFeesLib.ProtocolFeeContext; // liquidity injections
    router : RouterLib.RouterContext; // routed swaps
  };

  let DEFAULT_LIMIT : Nat = 25;
  let MAX_LIMIT : Nat = 100;

  // A row plus every token it involves (the token filter matches any of them).
  type Entry = { row : Types.HistoryRow; tokens : [Types.HistoryToken] };

  // --- Text helpers ------------------------------------------------------------

  func accountText(a : RetryTypes.Account) : Text {
    switch (a.subaccount) {
      case (?s) { a.owner.toText() # "." # RetryLib.hex(s) };
      case null { a.owner.toText() };
    };
  };

  func memoOf(memo : Blob) : ?Text {
    if (memo.size() == 0) null else memo.decodeUtf8();
  };

  func outcomeText(o : RetryTypes.AttemptOutcome) : Text {
    switch (o) {
      case (#pending) { "pending" };
      case (#unknown) { "unknown" };
      case (#failed(e)) { "failed: " # e };
      case (#succeeded(_)) { "sent" };
    };
  };

  func outcomeBlock(o : RetryTypes.AttemptOutcome) : ?Nat {
    switch (o) {
      case (#succeeded(b)) { ?b };
      case (_) { null };
    };
  };

  func ownerStatusText(s : OwnerTypes.OwnerSendStatus) : Text {
    switch (s) {
      case (#pending) { "pending" };
      case (#sent(_)) { "sent" };
      case (#needsReview) { "to review" };
      case (#failed(e)) { "failed: " # e };
    };
  };

  func ownerStatusBlock(s : OwnerTypes.OwnerSendStatus) : ?Nat {
    switch (s) {
      case (#sent(b)) { ?b };
      case (_) { null };
    };
  };

  func sourceText(s : OwnerTypes.TreasurySource) : Text {
    switch (s) {
      case (#mintTreasury) { "mint treasury" };
      case (#accumulated) { "accumulated share" };
    };
  };

  func ownerSourceText(s : OwnerTypes.OwnerSendSource) : Text {
    switch (s) {
      case (#mint(id)) { "Mint revenue 100/101, conversion " # id.toText() };
      case (#accumulated) { "Accumulated share send" };
      case (#treasurySweep) { "Treasury sweep send" };
      case (#withdrawal(w)) { "Withdrawal from " # sourceText(w.from) # " by " # w.by.toText() };
      case (#settlement(st)) { "Settlement from " # sourceText(st.from) };
    };
  };

  func legPurposeText(p : OwnerTypes.SettlementLegPurpose) : Text {
    switch (p) {
      case (#ownerAccumulated) { "accumulated share" };
      case (#ownerMintTreasury) { "legacy mint treasury owner share" };
      case (#feePending) { "pending fees" };
      case (#feeLegacy) { "legacy mint treasury fee part" };
    };
  };

  func stageText(s : BtcTypes.DepositStage) : Text {
    switch (s) {
      case (#addressShown) { "address shown" };
      case (#depositDetected) { "deposit detected" };
      case (#confirming(c)) { "confirming " # c.current.toText() # "/" # c.required.toText() };
      case (#minted) { "minted" };
      case (#delivered) { "delivered" };
      case (#refunded) { "refunded" };
      case (#pendingRate) { "waiting for rate" };
      case (#error) { "error" };
    };
  };

  func buybackStatusText(s : BuybackTypes.BuybackStatus) : Text {
    switch (s) {
      case (#inProgress) { "in progress" };
      case (#completed) { "completed" };
      case (#payoutFailed) { "payout failed" };
      case (#cancelled) { "cancelled" };
    };
  };

  func tokenText(t : Types.HistoryToken) : Text {
    switch (t) {
      case (#icp) { "ICP" };
      case (#ckbtc) { "ckBTC" };
      case (#ckusdc) { "ckUSDC" };
      case (#ckusdt) { "ckUSDT" };
      case (#tttiT) { "TTTI-T" };
    };
  };

  func row(id : Text, kind : Types.HistoryKind, token : ?Types.HistoryToken, amount : ?Nat, counterparty : ?Text, status : Text, memo : ?Text, block : ?Nat, timestamp : Int, detail : Text) : Types.HistoryRow {
    { id; kind; token; amount; counterparty; status; memo; block; timestamp; detail };
  };

  // --- Row builders ------------------------------------------------------------

  func addConversions(ctx : HistoryContext, out : List.List<Entry>) {
    for (c in ctx.transfers.treasury.conversions.values()) {
      let ts : Int = c.timestamp.toNat();
      let status = switch (c.status) {
        case (#completed) { "completed" };
        case (#failed) { "failed" };
        case (#refunded) { "refunded" };
        case (#refundFailed) { "refund pending" };
        case (#refundReview) { "refund to review" };
      };
      out.add({
        row = row(
          "CV-" # c.id.toText(),
          #mintDeposit,
          ?c.payToken,
          ?c.payAmount,
          ?c.depositor.toText(),
          status,
          null,
          c.paymentBlock,
          ts,
          "Mint " # c.tttiAmount.toText() # " TTTI-T base units to " # accountText(c.recipient),
        );
        tokens = [c.payToken, #tttiT];
      });
      // Purchase refunds (RF attempt when recorded; legacy records without one).
      switch (c.status) {
        case (#refunded or #refundFailed or #refundReview) {
          switch (ctx.transfers.retry.refunds.get(c.id)) {
            case (?a) {
              out.add({
                row = row(
                  "RF-" # c.id.toText(),
                  #refund,
                  ?c.payToken,
                  ?a.request.amount,
                  ?accountText(a.request.to),
                  status,
                  memoOf(a.memo),
                  outcomeBlock(a.outcome),
                  a.created_at_time.toNat(),
                  "Purchase refund, conversion " # c.id.toText() # ", attempt " # a.attempt.toText() # " (" # outcomeText(a.outcome) # ")",
                );
                tokens = [c.payToken];
              });
            };
            case null {
              out.add({
                row = row(
                  "RF-" # c.id.toText(),
                  #refund,
                  ?c.payToken,
                  ?(c.netAmount ?? c.payAmount),
                  ?c.depositor.toText(),
                  status,
                  null,
                  null,
                  ts,
                  "Purchase refund, conversion " # c.id.toText() # (switch (c.message) { case (?m) { ": " # m }; case null { "" } }),
                );
                tokens = [c.payToken];
              });
            };
          };
        };
        case (_) {};
      };
    };
  };

  func addBtcDeposits(ctx : HistoryContext, out : List.List<Entry>) {
    for ((owner, tracking) in BtcDepositLib.trackingRows(ctx.btcDeposits)) {
      let kindKey = BtcDepositLib.kindText(tracking.kind);
      do {
        for (e in tracking.deposits.values()) {
          let amount = if (e.ckbtcMintedSats > 0) e.ckbtcMintedSats else e.btcDetectedSats;
          let txids = if (e.btcTxids.size() == 0) "" else ", txid " # e.btcTxids.values().join(", ");
          out.add({
            row = row(
              "BD-" # kindKey # "-" # owner.toText() # "-" # e.index.toText(),
              #mintDeposit,
              ?#ckbtc,
              ?amount,
              ?owner.toText(),
              stageText(e.stage) # (switch (e.errorMessage) { case (?m) { ": " # m }; case null { "" } }),
              null,
              e.ckbtcMintBlockIndex,
              e.detectedAt,
              "BTC " # kindKey # " deposit #" # e.index.toText() # " to " # tracking.btcAddress # txids,
            );
            tokens = if (kindKey == "purchase") [#ckbtc, #tttiT] else [#ckbtc];
          });
          switch (e.btcRefund) {
            case (?r) {
              let a = r.attempt;
              let purpose = switch (r.purpose) {
                case (#excess) { "excess" };
                case (#fullRefund) { "full refund" };
                case (#deliveryFailedExcess) { "delivery-failure excess" };
              };
              out.add({
                row = row(
                  "BR-" # a.n.toText() # "-" # a.attempt.toText(),
                  #refund,
                  ?#ckbtc,
                  ?a.request.amount,
                  ?accountText(a.request.to),
                  outcomeText(a.outcome),
                  memoOf(a.memo),
                  outcomeBlock(a.outcome),
                  a.created_at_time.toNat(),
                  "BTC refund (" # purpose # "), deposit #" # e.index.toText() # " of " # owner.toText(),
                );
                tokens = [#ckbtc];
              });
            };
            case null {};
          };
        };
      };
    };
  };

  func addOwnerSends(ctx : HistoryContext, out : List.List<Entry>) {
    for (s in ctx.transfers.ownerRevenue.sends.values()) {
      out.add({
        row = row(
          "OW-" # s.id.toText(),
          #revenueSent,
          ?s.token,
          ?s.attempt.request.amount,
          ?accountText(s.attempt.request.to),
          ownerStatusText(s.status),
          memoOf(s.attempt.memo),
          ownerStatusBlock(s.status),
          s.createdAt,
          ownerSourceText(s.source),
        );
        tokens = [s.token];
      });
    };
  };

  func addBuybacks(ctx : HistoryContext, out : List.List<Entry>) {
    for (b in ctx.buybacks.records.values()) {
      let lastMemo = if (b.payoutAttempts.size() == 0) null else memoOf(b.payoutAttempts[b.payoutAttempts.size() - 1].attempt.memo);
      out.add({
        row = row(
          "BB-" # b.id.toText(),
          #buyback,
          ?b.tokenReturned,
          ?b.amountReturned,
          ?b.buyer.toText(),
          buybackStatusText(b.status),
          lastMemo,
          b.payoutBlock,
          b.timestamp,
          "Buyback " # b.percent.toText() # "% of the " # tokenText(b.originalToken) # " mass: " # b.tttiAmount.toText() # " TTTI-T base units taken back",
        );
        tokens = [b.tokenReturned, b.originalToken, #tttiT];
      });
    };
  };

  func addSwaps(ctx : HistoryContext, out : List.List<Entry>) {
    for (s in ctx.router.store.swaps.values()) {
      let route = switch (s.route) {
        case (#native(n)) { "native pool " # n.poolId.toText() };
        case (#icpswap(p)) { "ICPSwap pool " # p.poolCanisterId.toText() };
      };
      let status = switch (s.status) {
        case (#inProgress) { "in progress" };
        case (#completed) { "completed" };
        case (#failedReturned(e)) { "failed, input returned: " # e };
        case (#needsReview) { "to review" };
        case (#reviewedArrived(_)) { "reviewed: arrived" };
        case (#reviewedNotArrived) { "reviewed: not arrived" };
      };
      let (memo, block) = switch (s.move) {
        case (?m) { (memoOf(m.memo), outcomeBlock(m.outcome)) };
        case null { (null, null) };
      };
      out.add({
        row = row(
          "RS-" # s.id.toText(),
          #swap,
          ?s.tokenIn,
          ?s.amountIn,
          ?s.owner.toText(),
          status,
          memo,
          block,
          s.createdAt,
          "Swap " # tokenText(s.tokenIn) # " -> " # s.amountOut.toText() # " " # tokenText(s.tokenOut) # " via " # route,
        );
        tokens = [s.tokenIn, s.tokenOut];
      });
    };
  };

  func poolTokens(ctx : HistoryContext, poolId : Nat) : [Types.HistoryToken] {
    switch (ctx.dex.dex.pools.get(poolId)) {
      case (?pool) {
        let list = List.empty<Types.HistoryToken>();
        switch (DexLib.poolDexToken(pool.token0)) { case (?t) { list.add(t) }; case null {} };
        switch (DexLib.poolDexToken(pool.token1)) { case (?t) { list.add(t) }; case null {} };
        list.toArray();
      };
      case null { [] };
    };
  };

  func addLiquidity(ctx : HistoryContext, out : List.List<Entry>) {
    // Liquidity adds (open positions).
    for (p in ctx.dex.dex.positions.values()) {
      let tokens = poolTokens(ctx, p.poolId);
      out.add({
        row = row(
          "LP-" # p.id.toText(),
          #liquidity,
          if (tokens.size() == 0) null else ?tokens[0],
          null,
          ?p.owner.toText(),
          "open",
          null,
          null,
          p.createdAt,
          "Liquidity add, pool " # p.poolId.toText() # ", " # p.shares.toText() # " shares, unlock at " # p.unlockAt.toText() # " ns" # (if (p.isCreator) " (creator)" else ""),
        );
        tokens;
      });
    };
    // Liquidity injections from set-aside mint fees.
    for (i in ctx.fees.mintFees.injections.values()) {
      let status = switch (i.status) {
        case (#swapping) { "swapping" };
        case (#addingLiquidity) { "adding liquidity" };
        case (#completed) { "completed" };
        case (#needsReview) { "to review" };
        case (#failed(e)) { "failed: " # e };
      };
      out.add({
        row = row(
          "IN-" # i.id.toText(),
          #liquidity,
          ?i.token,
          ?i.amountIn,
          null,
          status,
          null,
          null,
          i.startedAt,
          "Liquidity injection, pool " # i.poolId.toText() # ": " # i.tttiReceived.toText() # " TTTI-T base units obtained, " # i.liquidityShares.toText() # " locked shares",
        );
        tokens = [i.token, #tttiT];
      });
    };
    // Refused pair-request deposits fed to permanent liquidity.
    for (f in ctx.fees.refusedFeeds.values()) {
      out.add({
        row = row(
          "RD-" # f.requestId.toText(),
          #liquidity,
          ?#tttiT,
          ?f.amount,
          null,
          "completed",
          ?("TTTI-RD-" # f.requestId.toText()),
          ?f.block,
          f.at,
          "Refused pair request " # f.requestId.toText() # " deposit added to pool " # f.poolId.toText() # " permanent liquidity",
        );
        tokens = [#tttiT];
      });
    };
    // Fee-account moves (ST).
    for (m in ctx.transfers.mintRevenue.feeMoves.values()) {
      let purpose = switch (m.purpose) {
        case (#mintFee(id)) { "Mint fee 1/101, conversion " # id.toText() };
        case (#settlement(p)) { "Settlement: " # legPurposeText(p) };
      };
      out.add({
        row = row(
          "ST-" # m.n.toText(),
          #liquidity,
          ?m.token,
          ?m.attempt.request.amount,
          ?accountText(m.attempt.request.to),
          ownerStatusText(m.status),
          memoOf(m.attempt.memo),
          ownerStatusBlock(m.status),
          m.createdAt,
          "Fee account move: " # purpose,
        );
        tokens = [m.token];
      });
    };
  };

  func addDestinations(ctx : HistoryContext, out : List.List<Entry>) {
    for (w in ctx.transfers.mintRevenue.walletChanges.values()) {
      let previous = switch (w.oldAccount) {
        case (?a) { "previous " # accountText(a) };
        case null { "first configuration" };
      };
      out.add({
        row = row(
          "WC-" # w.id.toText(),
          #destination,
          ?w.token,
          null,
          ?accountText(w.newAccount),
          "set",
          null,
          null,
          w.at,
          "Receiving wallet set by " # w.by.toText() # ", " # previous,
        );
        tokens = [w.token];
      });
    };
    var i = 0;
    for (d in ctx.transfers.ownerRevenue.destinationHistory.values()) {
      out.add({
        row = row(
          "DH-" # i.toText(),
          #destination,
          ?d.token,
          null,
          switch (d.account) { case (?a) { ?accountText(a) }; case null { null } },
          switch (d.account) { case (?_) { "set" }; case null { "cleared" } },
          null,
          null,
          d.at,
          "Earlier owner destination change by " # d.by.toText(),
        );
        tokens = [d.token];
      });
      i += 1;
    };
  };

  func kindMatches(filter : Types.HistoryFilter, kind : Types.HistoryKind) : Bool {
    switch (filter) {
      case (#all) { true };
      case (_) { (kind : Types.HistoryFilter) == filter };
    };
  };

  // Rows matching `filter` and `token`, newest first, `limit` capped at 100.
  public func list(ctx : HistoryContext, filter : Types.HistoryFilter, token : ?Types.HistoryToken, offset : Nat, limit : Nat) : Types.HistoryPage {
    let all = List.empty<Entry>();
    if (kindMatches(filter, #mintDeposit) or kindMatches(filter, #refund)) {
      addConversions(ctx, all);
      addBtcDeposits(ctx, all);
    };
    if (kindMatches(filter, #revenueSent)) addOwnerSends(ctx, all);
    if (kindMatches(filter, #buyback)) addBuybacks(ctx, all);
    if (kindMatches(filter, #swap)) addSwaps(ctx, all);
    if (kindMatches(filter, #liquidity)) addLiquidity(ctx, all);
    if (kindMatches(filter, #destination)) addDestinations(ctx, all);

    let matching = all.filter(
      func e = kindMatches(filter, e.row.kind) and (switch (token) { case (?t) { e.tokens.any(func x = x == t) }; case null { true } })
    ).toArray();
    let sorted = matching.sort(
      func(a, b) = switch (Int.compare(b.row.timestamp, a.row.timestamp)) {
        case (#equal) { Text.compare(b.row.id, a.row.id) };
        case (other) { other };
      }
    );
    let lim = if (limit == 0) DEFAULT_LIMIT else Nat.min(limit, MAX_LIMIT);
    let total = sorted.size();
    let start = Nat.min(offset, total);
    let end = Nat.min(offset + lim, total);
    {
      items = sorted.sliceToArray(start, end).map(func e = e.row);
      total;
      offset;
      limit = lim;
    };
  };

  // Keeps the review rows matching `filter`.
  public func filterReview(rows : [RetryTypes.TransferReview], filter : Types.ReviewFilter) : [RetryTypes.TransferReview] {
    rows.filter(
      func r = (filter.kinds.size() == 0 or filter.kinds.any(func k = k == r.kind)) and (switch (filter.token) { case (?t) { r.token == t }; case null { true } })
    );
  };
};
