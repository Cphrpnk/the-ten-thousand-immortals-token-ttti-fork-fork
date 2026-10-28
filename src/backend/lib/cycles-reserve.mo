import Array "mo:core/Array";
import Cycles "mo:core/Cycles";
import Error "mo:core/Error";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Timer "mo:core/Timer";
import Types "../types/cycles-reserve";
import Treasury "../types/treasury";
import TreasuryLib "treasury";

// Cycles reserve domain logic: reserve share, cached balance, automatic CMC
// top-up (timer), cycles samples, autonomy and the dynamic cycles share of the
// 20 % pool protocol share (DEX lot 4). The reserve has no withdrawal path.
module {
  public type Account = Types.Account;
  public type CyclesReserveStore = Types.CyclesReserveStore;
  public type ReserveLock = Types.ReserveLock;
  public type CyclesStatus = Types.CyclesStatus;
  public type TopUpRecord = Types.TopUpRecord;
  public type TopUpAttempt = Types.TopUpAttempt;
  public type ReserveWithdrawal = Types.ReserveWithdrawal;
  public type ReserveShare = Types.ReserveShare;
  public type Cmc = Types.Cmc;
  public type AutonomyStore = Types.AutonomyStore;
  public type CyclesSample = Types.CyclesSample;
  public type ShareChange = Types.ShareChange;
  public type AutonomyView = Types.AutonomyView;
  public type CyclesShareView = Types.CyclesShareView;

  // --- DEX lot 4: autonomy and cycles share constants (code, not settable) ---

  public let AUTONOMY_TARGET_DAYS : Nat = 90;
  public let MIN_CYCLES_SHARE_BPS : Nat = 500; // 5 % of the 20 % protocol share
  public let MAX_CYCLES_SHARE_BPS : Nat = 4_000; // 40 % of the 20 % protocol share
  public let LOW_AUTONOMY_DAYS : Nat = 45; // max share below
  public let HIGH_AUTONOMY_DAYS : Nat = 180; // min share above
  // At most 10 percentage points (absolute, 1 000 bps) per adjustment.
  public let MAX_SHARE_STEP_BPS : Nat = 1_000;
  public let SHARE_ADJUST_INTERVAL_NS : Nat = 86_400_000_000_000; // 1 day
  public let DAY_NS : Nat = 86_400_000_000_000;

  // --- Constants -------------------------------------------------------------

  // Fixed, published 32-byte ICP subaccount of this canister holding the
  // cycles reserve (printable ASCII). Stable account identifier: never change.
  public let CYCLES_RESERVE_SUBACCOUNT : Blob = "CYCLES-RESERVE-TTTI-T-0000000001";

  // Always kept for cycles (2 ICP); the reserve has no withdrawal path.
  public let RESERVE_FLOOR_E8S : Nat = 200_000_000;
  // Top up when the cycles balance is below 20 T cycles.
  public let TOPUP_THRESHOLD : Nat = 20_000_000_000_000;
  // Each top-up converts about 2 T cycles worth of ICP.
  public let TOPUP_TARGET_CYCLES : Nat = 2_000_000_000_000;
  // Top-up check interval: 6 hours.
  public let TOPUP_INTERVAL_SECONDS : Nat = 21_600;
  // Smallest top-up sent to the CMC (0.001 ICP); smaller amounts are skipped.
  public let MIN_TOPUP_E8S : Nat = 100_000;
  // Identical resend window of a top-up attempt, from its created_at_time:
  // 23 h (same rule as lib/retry.mo, defined here to avoid importing it).
  public let TOPUP_RESEND_WINDOW_NS : Nat = 82_800_000_000_000;

  // Cycles Minting Canister (mainnet).
  public let CMC_CANISTER_ID : Text = "rkp4c-7iaaa-aaaaa-aaaca-cai";
  // CMC top-up memo 'TPUP' = 1347768404 (0x50555054).
  public let TPUP_MEMO : Nat64 = 1_347_768_404;
  // The same memo as the ICRC-1 blob: 8-byte little-endian encoding.
  public let TPUP_MEMO_BLOB : Blob = "\54\50\55\50\00\00\00\00";

  public let RESERVE_RULE : Text = "Fixed 1% fee on every mint (ICP, ckBTC, ckUSDC, ckUSDT; BTC counts as ckBTC): 101 paid for 100 received. The owner share (100/101) is sent in the paid token to the destination configured for that token; the 1/101 fee goes to TTTI-T liquidity. The canister's public cycles reserve was topped up once to 2 ICP from the internal ICP mint treasury and is converted to cycles automatically when the cycles balance is below 20 T cycles. The reserve has no withdrawal path; the 2 ICP floor always stays available for cycles.";

  // --- Accounts and handles --------------------------------------------------

  // The cycles reserve account: this canister + CYCLES_RESERVE_SUBACCOUNT.
  public func reserveAccount(canister : Principal) : Account {
    { owner = canister; subaccount = ?CYCLES_RESERVE_SUBACCOUNT };
  };

  public func cmc() : Cmc = actor (CMC_CANISTER_ID);

  public func icpLedger() : TreasuryLib.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

  // CMC deposit subaccount for a top-up of `canister`: [len, principal bytes, 0...] (32 bytes).
  public func cmcTopUpSubaccount(canister : Principal) : Blob {
    let bytes = canister.toBlob().toArray();
    let n = bytes.size();
    Array.tabulate<Nat8>(
      32,
      func i = if (i == 0) n.toNat8() else if (i <= n) bytes[i - 1] else 0,
    ).toBlob();
  };

  func nowNat64() : Nat64 = Time.now().toNat().toNat64();

  func sat(a : Nat, b : Nat) : Nat = if (a > b) Nat.sub(a, b) else 0;

  // --- Reserve math ----------------------------------------------------------

  // Fee share of a delivered ICP purchase: floor(costE8s * feeBps / (10_000 +
  // feeBps)); new ICP purchases use feeBps = 100 (cost * 100 / 10_100); older
  // conversions keep their recorded feeBps.
  public func reserveShare(costE8s : Nat, feeBps : Nat) : Nat {
    costE8s * feeBps / (10_000 + feeBps);
  };

  // Amount handed to the treasury forward: cost - share, minus the ledger fee
  // the canister pays for the reserve transfer (when there is a share).
  public func treasuryShare(costE8s : Nat, shareE8s : Nat) : Nat {
    let rest = sat(costE8s, shareE8s);
    if (shareE8s == 0) rest else sat(rest, TreasuryLib.ICP_FEE);
  };

  // Base amount a treasury forward (and its retries) uses for a conversion:
  // the recorded treasury share of an ICP conversion, otherwise the full
  // amount collected in the conversion's own pay token.
  public func forwardBase(store : CyclesReserveStore, conversion : Treasury.Conversion) : Nat {
    switch (store.shares.get(conversion.id)) {
      case (?s) { s.treasuryE8s };
      case null {
        switch (conversion.payToken) {
          case (#icp) { conversion.icpAmount };
          case (_) { conversion.payAmount };
        };
      };
    };
  };

  // --- Views -----------------------------------------------------------------

  public func status(store : CyclesReserveStore, canister : Principal) : CyclesStatus {
    {
      cyclesBalance = Cycles.balance();
      topUpThreshold = TOPUP_THRESHOLD;
      reserveAccount = reserveAccount(canister);
      reserveBalanceE8s = store.reserveBalanceE8s;
      reserveFloorE8s = RESERVE_FLOOR_E8S;
      lastTopUp = store.lastTopUp;
      withdrawals = store.withdrawals.toArray();
    };
  };

  // --- DEX lot 4: autonomy, samples and the dynamic cycles share -------------

  // Samples kept: 31 days (one sample before the 30-day window stays as its
  // anchor) and at most MAX_SAMPLES.
  let SAMPLE_RETENTION_DAYS : Nat = 31;
  let MAX_SAMPLES : Nat = 500;
  // An average needs samples spanning at least one timer interval (6 h).
  let MIN_AVERAGE_SPAN_NS : Nat = 21_600_000_000_000;

  // Records a cycles sample (6-hour timer, after each top-up); prunes samples
  // older than 31 days and keeps at most 500.
  public func recordSample(autonomy : AutonomyStore, cyclesBalance : Nat, toppedUpCycles : Nat, now : Int) {
    autonomy.samples.add({ at = now; cyclesBalance; toppedUpCycles });
    let cutoff : Int = now - SAMPLE_RETENTION_DAYS * DAY_NS;
    let all = autonomy.samples.toArray();
    let size = all.size();
    if (size > MAX_SAMPLES or all[0].at < cutoff) {
      autonomy.samples.clear();
      var i = 0;
      for (s in all.values()) {
        if (s.at >= cutoff and i + MAX_SAMPLES >= size) {
          autonomy.samples.add(s);
        };
        i += 1;
      };
    };
  };

  // Average daily consumption over the last `days` days, null without data.
  // Consumption between two samples = previous balance + topped up - balance.
  public func averageCyclesPerDay(autonomy : AutonomyStore, days : Nat, now : Int) : ?Nat {
    let from : Int = now - days * DAY_NS;
    var prev : ?CyclesSample = null;
    var first : ?Int = null;
    var lastAt : Int = 0;
    var consumed = 0;
    for (s in autonomy.samples.values()) {
      if (s.at >= from) {
        switch (prev) {
          case (?p) { consumed += sat(p.cyclesBalance + s.toppedUpCycles, s.cyclesBalance) };
          case null { first := ?s.at };
        };
        prev := ?s;
        lastAt := s.at;
      };
    };
    let start = first ?? (return null);
    let span = lastAt - start;
    if (span < MIN_AVERAGE_SPAN_NS) {
      return null;
    };
    ?(consumed * DAY_NS / span.toNat());
  };

  // Cycles per whole ICP observed at the last notified top-up (the CMC rate
  // of that conversion), null before any notified top-up.
  public func cyclesPerIcpEstimate(store : CyclesReserveStore) : ?Nat {
    switch (store.lastTopUp) {
      case (?r) {
        switch (r.status) {
          case (#notified({ cycles })) { if (r.icpE8s == 0) null else ?(cycles * TreasuryLib.ICP_DECIMALS / r.icpE8s) };
          case (_) { null };
        };
      };
      case null { null };
    };
  };

  // Cycles per whole ICP at the current CMC rate (1 XDR = 1 T cycles), null
  // when the CMC cannot be reached.
  public func liveCyclesPerIcp() : async ?Nat {
    try {
      let permyriad = (await cmc().get_icp_xdr_conversion_rate()).data.xdr_permyriad_per_icp.toNat();
      if (permyriad == 0) null else ?(permyriad * 100_000_000);
    } catch (_) {
      null;
    };
  };

  // Autonomy view: (cycles balance + reserve ICP in cycles) / max(avg7, avg30).
  // `cyclesPerIcp` = cycles per whole ICP at the CMC rate, null when unknown.
  public func autonomyView(store : CyclesReserveStore, autonomy : AutonomyStore, cyclesPerIcp : ?Nat, now : Int) : AutonomyView {
    let cyclesBalance = Cycles.balance();
    let reserveCyclesEstimate : ?Nat = switch (cyclesPerIcp) {
      case (?c) { ?(store.reserveBalanceE8s * c / TreasuryLib.ICP_DECIMALS) };
      case null { null };
    };
    let totalCycles = cyclesBalance + (reserveCyclesEstimate ?? 0);
    let avg7 = averageCyclesPerDay(autonomy, 7, now);
    let avg30 = averageCyclesPerDay(autonomy, 30, now);
    let daily = Nat.max(avg7 ?? 0, avg30 ?? 0);
    {
      computedAt = now;
      cyclesBalance;
      reserveBalanceE8s = store.reserveBalanceE8s;
      reserveCyclesEstimate;
      totalCycles;
      avg7dCyclesPerDay = avg7;
      avg30dCyclesPerDay = avg30;
      autonomyDays = if (daily == 0) null else ?(totalCycles / daily);
      targetDays = AUTONOMY_TARGET_DAYS;
      sampleCount = autonomy.samples.size();
      oldestSampleAt = do ? { autonomy.samples.first()!.at };
    };
  };

  // Autonomy at `now` using the live CMC rate, else the rate of the last
  // notified top-up.
  public func currentAutonomy(store : CyclesReserveStore, autonomy : AutonomyStore) : async AutonomyView {
    let live = await liveCyclesPerIcp();
    let rate = if (live != null) live else cyclesPerIcpEstimate(store);
    autonomyView(store, autonomy, rate, Time.now());
  };

  // Target cycles share: 4000 bps below 45 days (or unknown), 500 bps above
  // 180 days, linear in between.
  public func targetShareBps(autonomyDays : ?Nat) : Nat {
    let days = autonomyDays ?? (return MAX_CYCLES_SHARE_BPS);
    if (days <= LOW_AUTONOMY_DAYS) return MAX_CYCLES_SHARE_BPS;
    if (days >= HIGH_AUTONOMY_DAYS) return MIN_CYCLES_SHARE_BPS;
    let range = Nat.sub(MAX_CYCLES_SHARE_BPS, MIN_CYCLES_SHARE_BPS);
    let down = Nat.sub(days, LOW_AUTONOMY_DAYS) * range / Nat.sub(HIGH_AUTONOMY_DAYS, LOW_AUTONOMY_DAYS);
    Nat.sub(MAX_CYCLES_SHARE_BPS, down);
  };

  // The current cycles share (bps of the 20 % protocol share).
  public func cyclesShareBps(autonomy : AutonomyStore) : Nat {
    Nat.min(MAX_CYCLES_SHARE_BPS, Nat.max(MIN_CYCLES_SHARE_BPS, autonomy.cyclesShareBps));
  };

  public func shareView(autonomy : AutonomyStore, autonomyDays : ?Nat) : CyclesShareView {
    {
      shareBps = cyclesShareBps(autonomy);
      targetShareBps = targetShareBps(autonomyDays);
      minShareBps = MIN_CYCLES_SHARE_BPS;
      maxShareBps = MAX_CYCLES_SHARE_BPS;
      lowAutonomyDays = LOW_AUTONOMY_DAYS;
      highAutonomyDays = HIGH_AUTONOMY_DAYS;
      maxStepBps = MAX_SHARE_STEP_BPS;
      minAdjustIntervalNs = SHARE_ADJUST_INTERVAL_NS;
      lastAdjustAt = autonomy.lastShareAdjustAt;
      nextAdjustAfter = do ? { autonomy.lastShareAdjustAt! + SHARE_ADJUST_INTERVAL_NS };
      autonomyDays;
    };
  };

  // Share changes, newest first.
  public func shareHistory(autonomy : AutonomyStore) : [ShareChange] {
    autonomy.shareHistory.reverseValues().toArray();
  };

  // --- Ledger / CMC operations (never trap, never send cycles) ---------------

  func fetchReserveBalance(canister : Principal) : async ?Nat {
    try {
      ?(await icpLedger().icrc1_balance_of(reserveAccount(canister)));
    } catch (_) {
      null;
    };
  };

  // Re-reads the reserve balance from the ICP ledger into the cache.
  public func refreshReserveBalance(store : CyclesReserveStore, canister : Principal) : async () {
    switch (await fetchReserveBalance(canister)) {
      case (?balance) { store.reserveBalanceE8s := balance };
      case null {};
    };
  };

  // --- Purchase reserve shares -----------------------------------------------

  // Records the fee split of a delivered purchase. A non-zero share is
  // #pending: it is sent to reserveAccount only by the shared retry module
  // (lib/retry.mo, memo TTTI-SH-<n>, recorded request with a fixed
  // created_at_time). A zero share needs no transfer and is #transferred(0).
  public func recordShare(store : CyclesReserveStore, conversionId : Nat, shareE8s : Nat, treasuryE8s : Nat) : ReserveShare {
    let transfer : Types.ReserveTransferStatus = if (shareE8s == 0) #transferred(0) else #pending;
    let share : ReserveShare = { conversionId; shareE8s; treasuryE8s; transfer };
    store.shares.add(conversionId, share);
    share;
  };

  // True once the share has reached the reserve. #pending, #failed (legacy)
  // and #needsReview are all treated as not yet transferred.
  public func isShareTransferred(share : ReserveShare) : Bool {
    switch (share.transfer) {
      case (#transferred(_)) { true };
      case (#pending) { false };
      case (#failed(_)) { false };
      case (#needsReview) { false };
    };
  };

  // --- Top-up ----------------------------------------------------------------

  // True while a recorded top-up transfer has no definite outcome
  // (#pending / #unknown, including needsReview): no other transfer may start.
  public func hasOpenTopUp(store : CyclesReserveStore) : Bool {
    switch (store.pendingTopUp) {
      case (?a) {
        switch (a.outcome) {
          case (#pending or #unknown) { true };
          case (#succeeded(_)) { false };
          case (#failed(_)) { false };
        };
      };
      case null { false };
    };
  };

  func isPendingNotify(store : CyclesReserveStore) : Bool {
    switch (store.lastTopUp) {
      case (?r) { switch (r.status) { case (#transferred) { true }; case (_) { false } } };
      case null { false };
    };
  };

  // Calls notify_top_up for the recorded block (same blockIndex every time).
  func notify(store : CyclesReserveStore, record : TopUpRecord, canister : Principal) : async () {
    let updated : TopUpRecord = try {
      switch (await cmc().notify_top_up({ block_index = record.blockIndex.toNat64(); canister_id = canister })) {
        case (#Ok(cycles)) { { record with status = #notified({ cycles }); lastError = null } };
        case (#Err(#Processing)) {
          { record with lastError = ?"The CMC is still processing this top-up; notify will be retried" };
        };
        case (#Err(#Other({ error_code; error_message }))) {
          { record with lastError = ?("CMC error " # error_code.toText() # ": " # error_message) };
        };
        case (#Err(#Refunded({ reason }))) {
          { record with status = #failed("Refunded by the CMC: " # reason); lastError = ?reason };
        };
        case (#Err(#InvalidTransaction(reason))) {
          { record with status = #failed("Invalid transaction: " # reason); lastError = ?reason };
        };
        case (#Err(#TransactionTooOld(_))) {
          { record with status = #failed("Transaction too old for the CMC"); lastError = ?"Transaction too old" };
        };
      };
    } catch (e) {
      { record with lastError = ?("The CMC could not be reached: " # e.message()) };
    };
    store.lastTopUp := ?updated;
    await refreshReserveBalance(store, canister);
  };

  // Creates and records a new top-up attempt (null when no top-up is needed
  // or possible). Only called when no attempt is open.
  func newAttempt(store : CyclesReserveStore, canister : Principal) : async ?TopUpAttempt {
    if (Cycles.balance() >= TOPUP_THRESHOLD) {
      return null;
    };
    let permyriad = try {
      (await cmc().get_icp_xdr_conversion_rate()).data.xdr_permyriad_per_icp.toNat();
    } catch (_) {
      return null;
    };
    if (permyriad == 0) {
      return null;
    };
    // The rate await may have let another path record an attempt meanwhile.
    if (hasOpenTopUp(store)) {
      return null;
    };
    let wanted = TOPUP_TARGET_CYCLES * 10_000 * 100_000_000 / (permyriad * 1_000_000_000_000);
    let amount = Nat.min(wanted, sat(store.reserveBalanceE8s, TreasuryLib.ICP_FEE));
    if (amount == 0 or amount < MIN_TOPUP_E8S) {
      return null;
    };
    let a : TopUpAttempt = {
      amount;
      created_at_time = nowNat64();
      memo = TPUP_MEMO_BLOB;
      request = {
        from_subaccount = ?CYCLES_RESERVE_SUBACCOUNT;
        to = { owner = Principal.fromText(CMC_CANISTER_ID); subaccount = ?cmcTopUpSubaccount(canister) };
        amount;
        fee = TreasuryLib.ICP_FEE;
      };
      blockIndex = null;
      createdAt = Time.now();
      sends = 0;
      lastError = null;
      outcome = #pending;
      needsReview = false;
    };
    // Recorded in stable state before the transfer await.
    store.pendingTopUp := ?a;
    ?a;
  };

  func topUpPass(store : CyclesReserveStore, canister : Principal) : async () {
    await refreshReserveBalance(store, canister);
    // A transfer awaiting its notify: retry notify only, never a new transfer.
    switch (store.lastTopUp) {
      case (?r) {
        switch (r.status) {
          case (#transferred) {
            await notify(store, r, canister);
            return;
          };
          case (_) {};
        };
      };
      case null {};
    };
    // An open attempt (#pending / #unknown) is resent identically (same
    // created_at_time, memo, amount, fee, destination) for 23 h, then marked
    // needsReview and no longer sent. No other transfer is created meanwhile.
    let open : ?TopUpAttempt = switch (store.pendingTopUp) {
      case (?a) {
        if (a.needsReview) {
          return;
        };
        switch (a.outcome) {
          case (#pending or #unknown) {
            if (Time.now() - a.created_at_time.toNat() >= TOPUP_RESEND_WINDOW_NS) {
              store.pendingTopUp := ?{ a with needsReview = true };
              return;
            };
            ?a;
          };
          case (#succeeded(_)) { null };
          case (#failed(_)) { null };
        };
      };
      case null { null };
    };
    let attempt = switch (open) {
      case (?a) { a };
      case null {
        switch (await newAttempt(store, canister)) {
          case (?a) { a };
          case null { return };
        };
      };
    };
    let sent : TopUpAttempt = { attempt with sends = attempt.sends + 1 };
    store.pendingTopUp := ?sent;
    let req = sent.request;
    let result = try {
      await icpLedger().icrc1_transfer({
        from_subaccount = req.from_subaccount;
        to = req.to;
        amount = req.amount;
        fee = ?req.fee;
        memo = ?sent.memo;
        created_at_time = ?sent.created_at_time;
      });
    } catch (e) {
      // Reject or trap: outcome unknown until an Ok, a #Duplicate or admin verification.
      store.pendingTopUp := ?{
        sent with outcome = #unknown;
        lastError = ?("The ICP ledger could not be reached: " # e.message());
      };
      return;
    };
    let executed : ?Nat = switch (result) {
      case (#Ok(blockIndex)) { ?blockIndex };
      case (#Err(#Duplicate({ duplicate_of }))) { ?duplicate_of };
      case (#Err(err)) {
        // Known ledger failure: the attempt is closed; a later pass may create a new one.
        store.pendingTopUp := ?{
          sent with outcome = #failed(TreasuryLib.transferErrorMessage(err));
          lastError = ?TreasuryLib.transferErrorMessage(err);
        };
        null;
      };
    };
    switch (executed) {
      case (?blockIndex) {
        // Persist the block BEFORE notify so a failed notify is retried with it.
        let record : TopUpRecord = {
          timestamp = Time.now();
          icpE8s = sent.amount;
          blockIndex;
          status = #transferred;
          lastError = null;
        };
        store.lastTopUp := ?record;
        store.pendingTopUp := null;
        await notify(store, record, canister);
      };
      case null {};
    };
  };

  // One timer pass: retries a pending notify (same blockIndex), otherwise when
  // the cycles balance is below TOPUP_THRESHOLD transfers about
  // TOPUP_TARGET_CYCLES worth of reserve ICP to the CMC (TPUP memo), records
  // the blockIndex, then calls notify_top_up. Skipped while the lock is held.
  public func runTopUp(store : CyclesReserveStore, lock : ReserveLock, canister : Principal) : async () {
    if (lock.busy) {
      return;
    };
    lock.busy := true;
    try {
      await topUpPass(store, canister);
    } catch (_) {} finally {
      lock.busy := false;
    };
  };

  func notifiedBlock(store : CyclesReserveStore) : ?Nat {
    switch (store.lastTopUp) {
      case (?r) { switch (r.status) { case (#notified(_)) { ?r.blockIndex }; case (_) { null } } };
      case null { null };
    };
  };

  // Arms the 6-hour top-up timer (called on every install and upgrade). Each
  // tick then records a cycles sample (with the cycles of a top-up notified
  // during that tick). The cycles share is no longer adjusted (read-only history).
  public func startTimer<system>(store : CyclesReserveStore, autonomy : AutonomyStore, lock : ReserveLock, canister : Principal) {
    func tick() : async () {
      let before = notifiedBlock(store);
      await runTopUp(store, lock, canister);
      let toppedUp = switch (store.lastTopUp) {
        case (?r) {
          switch (r.status) {
            case (#notified({ cycles })) { if (before == ?r.blockIndex) 0 else cycles };
            case (_) { 0 };
          };
        };
        case null { 0 };
      };
      recordSample(autonomy, Cycles.balance(), toppedUp, Time.now());
    };
    ignore Timer.setTimer<system>(#seconds(0), tick);
    ignore Timer.recurringTimer<system>(#seconds(TOPUP_INTERVAL_SECONDS), tick);
  };
};
