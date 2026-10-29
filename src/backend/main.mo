import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import Nat64Value "mo:caffeineai-oql/Nat64Value";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import TreasuryTypes "types/treasury";
import BtcTypes "types/btc-deposit";

import IcrcLib "lib/icrc";
import TreasuryLib "lib/treasury";
import OracleLib "lib/oracle";
import SaleLib "lib/presale";

import IcrcApi "mixins/icrc-api";
import IndexApi "mixins/index-api";
import ManagementApi "mixins/management-api";
import TreasuryApi "mixins/treasury-api";
import SaleApi "mixins/presale-api";
import OracleApi "mixins/oracle-api";
import ApiDocMixin "mixins/api-doc";
import SaleTypes "types/presale";
import CyclesReserveLib "lib/cycles-reserve";
import CyclesReserveApi "mixins/cycles-reserve-api";
import CanisterInfoLib "lib/canister-info";
import BtcDepositLib "lib/btc-deposit";
import BtcDepositApi "mixins/btc-deposit-api";
import AddressBookTypes "types/address-book";
import AddressBookApi "mixins/address-book-api";
import AddressBookLib "lib/address-book";
import BuybackTypes "types/buyback";
import BuybackApi "mixins/buyback-api";
import BuybackLib "lib/buyback";
import Timer "mo:core/Timer";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import RetryTypes "types/retry";
import RetryLib "lib/retry";
import TransferReviewApi "mixins/transfer-review-api";
import UpgradeTypes "types/upgrade-readiness";
import UpgradeReadinessApi "mixins/upgrade-readiness-api";
import DexTypes "types/dex";
import DexApi "mixins/dex-api";
import DexLib "lib/dex";
import DexReserveTypes "types/dex-reserve";
import DexReserveApi "mixins/dex-reserve-api";
import DexReserveLib "lib/dex-reserve";
import DexIndicatorTypes "types/dex-indicators";
import DexIndicatorsApi "mixins/dex-indicators-api";
import DexIndicatorsLib "lib/dex-indicators";
import ProtocolFeesLib "lib/protocol-fees";
import ProtocolFeesApi "mixins/protocol-fees-api";
import ProtocolFeeTypes "types/protocol-fees";
import OwnerRevenueTypes "types/owner-revenue";
import MintFeeTypes "types/mint-fee";
import RouterTypes "types/router";
import RouterLib "lib/router";
import RouterApi "mixins/router-api";
import SettlementLib "lib/settlement";
import AdminHistoryLib "lib/admin-history";
import AdminHistoryApi "mixins/admin-history-api";
import Nat8 "mo:core/Nat8";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Blob "mo:core/Blob";

actor TTTIToken {
  // --- Stable state (initialized by the migration chain) ---------------------

  let ledger : IcrcLib.Ledger;
  let treasury : TreasuryLib.TreasuryStore;
  let oracle : OracleLib.OracleStore;
  // USD rates of the ck pay tokens (BTC, USDC, USDT); ICP stays in `oracle`.
  let tokenRates : OracleLib.TokenRateStore;
  let sale : SaleLib.SaleStore;
  let accessControlState : AccessControl.AccessControlState;
  // Per principal: when and which version of the purchase acknowledgements was accepted.
  let purchaseAcknowledgements : SaleTypes.AcknowledgementStore;
  // ICP cycles reserve (share of the 1% fee on ICP purchases), top-up record
  // and withdrawal history.
  let cyclesReserve : CyclesReserveLib.CyclesReserveStore;
  // Cached canister_info (controllers, module hash) shown in Technical details.
  let canisterInfo : CanisterInfoLib.CanisterInfoStore;
  // Per-principal BTC deposit tracking (purchase and wallet flows) and the
  // cached ckBTC minter info.
  let btcDeposits : BtcDepositLib.BtcDepositStore;
  // Private address book per caller principal.
  let addressBook : AddressBookTypes.AddressBookStore;
  // TTTI-T buybacks (keyed by buyback id) and the admin funding/receiving account.
  let buybacks : BuybackTypes.BuybackStore;
  // Common transfer retry: global memo counter, the recorded forward (FW),
  // reserve share (SH) and purchase refund (RF) attempts keyed by purchase id,
  // active purchase traces (PC) and payments to refund keyed by trace n.
  let retry : RetryTypes.RetryStore;
  // Last sale.reserved reconciliation (previous value kept visible) and history.
  let reservedReconciliations : UpgradeTypes.ReconciliationStore;
  // DEX lot 1: pool registry (7 starting pairs) and pair requests.
  let dex : DexTypes.DexStore;
  // DEX lot 2: internal balances per principal and token, and the recorded
  // DD / DW transfers (keyed by n) and DQ refunds (keyed by request id).
  let dexBalances : DexTypes.DexBalances;
  let dexTransfers : RetryTypes.DexTransferStore;
  // DEX lot 4: cycles samples, dynamic cycles share and its history.
  let cyclesAutonomy : CyclesReserveLib.AutonomyStore;
  // DEX lot 4: protocol fee split, DC batches, DL bonus and protocol liquidity.
  let protocolFees : ProtocolFeesLib.ProtocolFeeStore;
  // DEX lot 4: weekly allocation calculations and mint treasury balances.
  let treasuryAllocation : TreasuryLib.AllocationStore;
  // Mint revenue: owner sends (OW: direct mint sends, settlement legs and
  // earlier withdrawals), the legacy accumulated counter and the one-time
  // treasury sweep (history).
  let ownerRevenue : OwnerRevenueTypes.OwnerRevenueStore;
  // Mint revenue correction: 1/101 mint fee routing, LP claimable balances,
  // set-aside amounts and liquidity injections.
  let mintFees : MintFeeTypes.MintFeeStore;
  // DEX lot 5: ICPSwap router (routed swaps, 0.1 % totals, set-aside LP share
  // and 70 % LP share redirected to the least liquid TTTI-T pool).
  let router : RouterTypes.RouterStore;
  // Refused pair-request deposits already fed to the protocol liquidity (one
  // record per pair request id, so each deposit counts exactly once).
  let refusedDepositFeeds : Map.Map<Nat, DexTypes.RefusedDepositFeed>;
  // DEX lot 6: last reserve check, mismatch history and the DEX-specific pause.
  let dexReserve : DexReserveTypes.DexReserveStore;
  // DEX lot 7: stored public indicators snapshot, its status and the hourly
  // swap activity buckets.
  let dexIndicators : DexIndicatorTypes.IndicatorsStore;
  // Mint revenue routing: receiving wallet per pay token, wallet changes,
  // one-time settlements and fee-account moves (ST).
  let mintRevenue : OwnerRevenueTypes.MintRevenueStore;

  // One reserve check at a time. Transient.
  transient let dexReserveLock : DexReserveTypes.CheckLock = { var busy = false };
  // One lock per routed ICPSwap swap ("IR/<id>"). Transient.
  transient let routerInFlight = Set.empty<Text>();
  // One DD / DW in flight per (principal, token) and one DQ per request. Transient.
  transient let dexInFlight = Set.empty<Text>();
  // One lock per outgoing transfer (RetryLib.lockKey), released in a finally. Transient.
  transient let transfersInFlight = Set.empty<Text>();

  // One buyback in progress per (buyer, mass token), keyed by
  // BuybackLib.lockKey. Transient.
  transient let buybacksInFlight = Set.empty<Text>();

  // Shared lock of the cycles top-up timer. Transient.
  transient let reserveLock : CyclesReserveLib.ReserveLock = { var busy = false };

  // One lock per DC send and DL claim. Transient.
  transient let protocolFeesInFlight = Set.empty<Text>();

  // The canister's own principal: the spender the frontend must approve for
  // the ICRC-2 icrc2_transfer_from in the treasury conversion. Transient.
  transient let canisterPrincipal = Principal.fromActor(TTTIToken);

  // One purchase in flight per principal, shared by convertDeposit /
  // convertDepositWith and the BTC deposit finalization. Transient.
  transient let purchasesInFlight = Set.empty<Principal>();

  // The ICP ledger handle used by the BTC deposit purchase context. Transient.
  transient let icpLedgerActor : TreasuryLib.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

  // FW / SH retry context (references the stable stores above, no copy). Transient.
  transient let transferContext : RetryLib.TransferContext = {
    retry;
    treasury;
    cyclesReserve;
    locks = transfersInFlight;
    canister = canisterPrincipal;
    sale;
    ownerRevenue;
    mintRevenue;
  };

  // DEX lot 4: DC / DL / protocol liquidity context (references); mint-fee
  // routing, set-aside and injections. Transient.
  transient let protocolFeeContext : ProtocolFeesLib.ProtocolFeeContext = {
    store = protocolFees;
    dex;
    retry;
    ledger;
    locks = protocolFeesInFlight;
    canister = canisterPrincipal;
    mintFees;
    oracle;
    tokenRates;
    refusedFeeds = refusedDepositFeeds;
    pause = dexReserve.pause;
  };

  // Purchase pipeline stores for the BTC deposit finalization (references the
  // stable stores above, no copy). Transient.
  transient let btcPurchaseContext : SaleLib.PurchaseContext = {
    sale;
    treasury;
    ledger;
    oracle;
    tokenRates;
    acknowledgements = purchaseAcknowledgements;
    icpLedger = icpLedgerActor;
    canister = canisterPrincipal;
    cyclesReserve;
    transfers = transferContext;
    protocolFees = protocolFeeContext;
  };

  // DEX DD / DW / DQ retry context (references the stable stores). Transient.
  transient let dexContext : RetryLib.DexContext = {
    retry;
    transfers = dexTransfers;
    balances = dexBalances;
    dex;
    ledger;
    locks = dexInFlight;
    canister = canisterPrincipal;
    pause = dexReserve.pause;
    indicators = dexIndicators;
  };

  // DEX lot 5: router context (references). Transient.
  transient let routerContext : RouterLib.RouterContext = {
    store = router;
    dex = dexContext;
    locks = routerInFlight;
  };

  // DEX lot 6: reserve check context (references). Transient.
  transient let dexReserveContext : DexReserveLib.ReserveContext = {
    store = dexReserve;
    lock = dexReserveLock;
    dex = dexContext;
    fees = protocolFeeContext;
    router = routerContext;
  };

  // DEX lot 7: indicators context (references; hourly USD rates). Transient.
  transient let dexIndicatorsContext : DexIndicatorsLib.IndicatorsContext = {
    store = dexIndicators;
    dex;
    reserve = dexReserve;
    protocolLiquidity = protocolFees.protocolLiquidity;
    rateOf = func(now : Int) : DexLib.UsdRateOf = ProtocolFeesLib.rateOf(protocolFeeContext, now);
  };

  // DEX lot 4: weekly allocation context (references). Transient.
  transient let weeklyContext : ProtocolFeesLib.WeeklyContext = {
    fees = protocolFeeContext;
    allocation = treasuryAllocation;
    treasury;
    cyclesReserve;
    autonomy = cyclesAutonomy;
  };

  // Mint revenue routing: wallets, fee account and settlement (references). Transient.
  transient let settlementContext : SettlementLib.SettlementContext = {
    transfers = transferContext;
    fees = protocolFeeContext;
    allocation = treasuryAllocation;
  };

  // Unified admin history (references). Transient.
  transient let historyContext : AdminHistoryLib.HistoryContext = {
    transfers = transferContext;
    btcDeposits;
    buybacks;
    dex = dexContext;
    fees = protocolFeeContext;
    router = routerContext;
  };

  // The outcall transform callback for the ICP/BTC/USDC/USDT USD price feeds: keeps only
  // the extracted price so every replica sees an identical response.
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OracleLib.transform(input);
  };

  // --- Composition -----------------------------------------------------------

  include MixinAuthorization(accessControlState, null);

  include IcrcApi(ledger, canisterPrincipal);
  include IndexApi(ledger, canisterPrincipal);
  include ManagementApi(ledger, accessControlState);
  include TreasuryApi(treasury, sale, ledger, accessControlState, canisterPrincipal, oracle, purchaseAcknowledgements, cyclesReserve, tokenRates, purchasesInFlight, transferContext, treasuryAllocation, protocolFeeContext, settlementContext);
  include SaleApi(sale, treasury, ledger, oracle, accessControlState, canisterPrincipal, purchaseAcknowledgements, canisterInfo, tokenRates);
  include OracleApi(oracle, accessControlState, transform, tokenRates);
  include CyclesReserveApi(cyclesReserve, cyclesAutonomy, accessControlState, canisterPrincipal);
  include BtcDepositApi(btcDeposits, btcPurchaseContext, purchasesInFlight, canisterPrincipal);
  include AddressBookApi(addressBook, canisterPrincipal);
  include BuybackApi(buybacks, buybacksInFlight, treasury, ledger, oracle, tokenRates, accessControlState, canisterPrincipal, retry, sale);
  include TransferReviewApi(transferContext, btcDeposits, accessControlState, buybacks, ledger, dexContext, protocolFeeContext, routerContext, settlementContext);
  include UpgradeReadinessApi(sale, purchasesInFlight, buybacksInFlight, reserveLock, cyclesReserve, retry, reservedReconciliations, accessControlState, protocolFeeContext, ownerRevenue, mintRevenue, dexReserve, dexInFlight, routerInFlight);
  include AdminHistoryApi(historyContext, accessControlState);
  include DexApi(dex, ledger, accessControlState, canisterPrincipal, dexContext, oracle, tokenRates);
  include DexReserveApi(dexReserveContext, accessControlState);
  include DexIndicatorsApi(dexIndicators, accessControlState);
  include ProtocolFeesApi(protocolFeeContext, accessControlState);
  include RouterApi(routerContext, accessControlState, oracle, tokenRates);
  // OQL: purchase history (conversions) and BTC deposit trackings, readable
  // by controllers and app admins only; address book contacts, readable by
  // controllers, app admins and their owner.
  transient let conversionSample : TreasuryTypes.Conversion = {
    id = 0;
    depositor = canisterPrincipal;
    recipient = { owner = canisterPrincipal; subaccount = null };
    payToken = #icp;
    payAmount = 0;
    feeBps = 0;
    icpAmount = 0;
    tttiAmount = 0;
    status = #completed;
    timestamp = 0;
    priceUsdE8 = 0;
    usedFallback = false;
    minted = 0;
    fromCollector = 0;
    forward = #notRequired;
    message = ?"";
    feeAmount = ?0;
    netAmount = ?0;
    paymentBlock = ?0;
    mintBlock = ?0;
  };
  transient let btcTrackingSample : (Principal, BtcTypes.DepositTracking) = (
    canisterPrincipal,
    {
      kind = #purchase;
      btcAddress = "";
      stage = #addressShown;
      deposits = [];
      createdAt = 0;
      lastCheckedAt = ?0;
      errorKind = ?#other;
      errorMessage = ?"";
    },
  );
  transient let contactSample : (Principal, AddressBookTypes.Contact) = (
    canisterPrincipal,
    {
      id = 0;
      nickname = "";
      principal = canisterPrincipal;
      memo = null;
      createdAt = 0;
      updatedAt = 0;
    },
  );
  transient let buybackSample : BuybackTypes.Buyback = {
    id = 0;
    purchaseId = ?0;
    buyer = canisterPrincipal;
    buyerAccount = { owner = canisterPrincipal; subaccount = null };
    timestamp = 0;
    originalToken = #icp;
    tokenReturned = #icp;
    percent = 0;
    massTotalNet = 0;
    massTotalTtti = 0;
    massRemainingNet = 0;
    massRemainingTtti = 0;
    originalRateUsdE8 = 0;
    returnedRateUsdE8 = 0;
    rule = #originalNet;
    originalNetAmount = 0;
    baseAmount = 0;
    baseAmountReturned = 0;
    buybackFee = 0;
    thirdPartyFees = 0;
    tttiTransferFee = 0;
    tttiEscrowFee = 0;
    amountReturned = 0;
    tttiAmount = 0;
    pullBlock = ?0;
    payoutBlock = ?0;
    payoutAttempts = [];
    releaseBlock = ?0;
    cancelBlock = ?0;
    legacy = false;
    status = #completed;
    message = ?"";
  };
  transient let attemptSample : (Nat, RetryTypes.TransferAttempt) = (
    0,
    {
      n = 0;
      attempt = 1;
      memo = "" : Blob;
      created_at_time = 0 : Nat64;
      request = {
        token = #icp;
        from_subaccount = null;
        to = { owner = canisterPrincipal; subaccount = null };
        amount = 0;
        fee = ?0;
      };
      sends = 0;
      lastError = ?"";
      outcome = #pending;
    },
  );
  transient let paymentToRefundSample : (Nat, RetryTypes.PaymentToRefund) = (
    0,
    {
      n = 0;
      buyer = canisterPrincipal;
      token = #icp;
      amount = 0;
      reserved = 0;
      created_at_time = 0 : Nat64;
      memo = "" : Blob;
      collect = #unknown;
      block = ?0;
      detectedAt = 0;
    },
  );
  transient let traceSample : (Nat, RetryTypes.PurchaseTrace) = (
    0,
    {
      n = 0;
      buyer = canisterPrincipal;
      token = #icp;
      amount = 0;
      reserved = 0;
      created_at_time = 0 : Nat64;
      memo = "" : Blob;
    },
  );
  transient let btcCostSample : (Nat, RetryTypes.BtcCostSend) = (0, { buyer = canisterPrincipal; depositIndex = 0; conversionId = ?0; attempt = attemptSample.1 });
  transient let reconciliationSample : UpgradeTypes.ReservedReconciliation = {
    previousReserved = 0;
    reconciledAt = 0;
    by = canisterPrincipal;
  };
  transient let topUpSample : UpgradeTypes.TopUpAttempt = {
    amount = 0;
    created_at_time = 0 : Nat64;
    memo = "" : Blob;
    request = {
      from_subaccount = null;
      to = { owner = canisterPrincipal; subaccount = null };
      amount = 0;
      fee = 0;
    };
    blockIndex = ?0;
    createdAt = 0;
    sends = 0;
    lastError = ?"";
    outcome = #pending;
    needsReview = false;
  };
  transient let dexPoolSample : DexTypes.Pool = {
    id = 0;
    token0 = { ledger = #internal; symbol = ""; decimals = 8 };
    token1 = { ledger = #external(canisterPrincipal); symbol = ""; decimals = 8 };
    feeTier = #bps30;
    kind = #tttiPair;
    status = #filling;
    createdAt = 0;
    subaccount = "" : Blob;
    minimumLocked = { token0 = ?0; token1 = ?0 };
    newPairBadgeUntil = ?0;
    requestId = ?0;
    removedAt = ?0;
    reserve0 = 0;
    reserve1 = 0;
    totalShares = 0;
    lockedShares = 0;
    protocolFee0 = 0;
    protocolFee1 = 0;
  };
  transient let dexPositionSample : DexTypes.Position = {
    id = 0;
    poolId = 0;
    owner = canisterPrincipal;
    shares = 0;
    createdAt = 0;
    lockDurationNs = 0;
    unlockAt = 0;
    isCreator = false;
  };
  transient let refusedDepositFeedSample : DexTypes.RefusedDepositFeed = { requestId = 0; poolId = 0; amount = 0; fee = 0; block = 0; at = 0 };
  transient let dexReserveMismatchSample : DexReserveTypes.Mismatch = { id = 0; at = 0; token = #tttiT; internalTotal = 0; ledgerTotal = 0 };
  type DexPauseRow = { key : Text; paused : Bool; reasonToken : ?Text; reasonInternalTotal : ?Nat; reasonLedgerTotal : ?Nat; pausedAt : ?Int; resumedBy : ?Text; resumedAt : ?Int };
  transient let dexReserveResultSample : DexReserveTypes.TokenReserveResult = { token = #tttiT; internalTotal = 0; ledgerTotal = 0; difference = 0; status = #ok };
  transient let dexIndicatorSample : DexIndicatorTypes.IndicatorRow = {
    poolId = 0;
    computedAt = 0;
    token0Symbol = "";
    token1Symbol = "";
    isOpen = false;
    reserve0 = 0;
    reserve1 = 0;
    valueUsdE8 = null;
    depth1PctToken0In = 0;
    depth1PctToken1In = 0;
    depth2PctToken0In = 0;
    depth2PctToken1In = 0;
    depth5PctToken0In = 0;
    depth5PctToken1In = 0;
    totalShares = 0;
    firmShares = 0;
    freeShares = 0;
    firmBps = 0;
    freeBps = 0;
    unlockThisWeekShares = 0;
    unlock30dShares = 0;
    unlock90dShares = 0;
    unlock1yShares = 0;
    unlockOver1yShares = 0;
    permanentShares = 0;
    positionCount = 0;
    largestPositionBps = 0;
    topFiveBps = 0;
    permanentProtocolBps = 0;
    swaps24h = 0;
    volume0In24h = 0;
    volume1In24h = 0;
    volumeUsdE8In24h = null;
    swaps7d = 0;
    volume0In7d = 0;
    volume1In7d = 0;
    volumeUsdE8In7d = null;
    fees7dCollected0 = 0;
    fees7dCollected1 = 0;
    feesCumulativeCollected0 = 0;
    feesCumulativeCollected1 = 0;
    observedFeeToLiquidityBps = null;
  };
  type DexActivityRow = { key : Text; poolId : Nat; hour : Nat; swapCount : Nat; volume0 : Nat; volume1 : Nat; fee0 : Nat; fee1 : Nat };
  transient let dexActivitySample : DexActivityRow = { key = ""; poolId = 0; hour = 0; swapCount = 0; volume0 = 0; volume1 = 0; fee0 = 0; fee1 = 0 };
  func dexActivityRows() : [DexActivityRow] {
    let rows = List.empty<DexActivityRow>();
    for ((poolId, activity) in dexIndicators.activity.entries()) {
      for (b in activity.buckets.values()) {
        rows.add({ key = poolId.toText() # "/" # b.hour.toText(); poolId; hour = b.hour; swapCount = b.swapCount; volume0 = b.volume0; volume1 = b.volume1; fee0 = b.fee0; fee1 = b.fee1 });
      };
    };
    rows.toArray();
  };
  transient let dexPauseSample : DexPauseRow = { key = ""; paused = false; reasonToken = null; reasonInternalTotal = null; reasonLedgerTotal = null; pausedAt = null; resumedBy = null; resumedAt = null };
  func dexReserveStatusText(status : DexReserveTypes.ReserveStatus) : Text = switch (status) {
    case (#ok) "ok";
    case (#surplus) "surplus";
    case (#shortfall) "shortfall";
  };
  func dexPauseRows() : [DexPauseRow] {
    let pause = dexReserve.pause;
    [{
      key = "dexPause";
      paused = pause.paused;
      reasonToken = switch (pause.reason) { case (?r) ?DexLib.tokenSymbol(r.token); case null null };
      reasonInternalTotal = switch (pause.reason) { case (?r) ?r.internalTotal; case null null };
      reasonLedgerTotal = switch (pause.reason) { case (?r) ?r.ledgerTotal; case null null };
      pausedAt = switch (pause.reason) { case (?r) ?r.at; case null null };
      resumedBy = switch (pause.resumed) { case (?r) ?r.by.toText(); case null null };
      resumedAt = switch (pause.resumed) { case (?r) ?r.at; case null null };
    }];
  };
  func dexReserveResultRows() : [DexReserveTypes.TokenReserveResult] = switch (dexReserve.lastCheck) {
    case (?c) c.results;
    case null [];
  };
  transient let dexRequestSample : DexTypes.PairRequest = {
    id = 0;
    requester = canisterPrincipal;
    token = { ledgerId = canisterPrincipal; name = ""; symbol = ""; decimals = 8; fee = 0 };
    counter = { ledger = #internal; symbol = ""; decimals = 8 };
    feeTier = #bps30;
    kind = #tttiPair;
    message = "";
    createdAt = 0;
    checks = { icrc1 = true; icrc2 = true; metadataRead = true; pairUnique = true; copiedSymbolOf = ?"" };
    depositAmount = 0;
    depositBlock = 0;
    status = #refused({ reason = ""; at = 0 });
    refundBlock = ?0;
    refundStatus = #refunded(0);
  };
  func dexFeeTierText(t : DexTypes.FeeTier) : Text = switch (t) {
    case (#bps5) "bps5";
    case (#bps30) "bps30";
    case (#bps100) "bps100";
  };
  func dexRequestReason(s : DexTypes.RequestStatus) : ?Text = switch (s) {
    case (#refused(r)) ?r.reason;
    case _ null;
  };
  func dexRequestPoolId(s : DexTypes.RequestStatus) : ?Nat = switch (s) {
    case (#approved(a)) ?a.poolId;
    case _ null;
  };
  func dexRequestDecidedAt(s : DexTypes.RequestStatus) : ?Int = switch (s) {
    case (#approved(a)) ?a.at;
    case (#refused(r)) ?r.at;
    case (#pending) null;
  };
  func pendingTopUpRows() : Iter.Iter<UpgradeTypes.TopUpAttempt> = switch (cyclesReserve.pendingTopUp) {
    case (?a) [a].values();
    case null ([] : [UpgradeTypes.TopUpAttempt]).values();
  };
  func attemptTokenText(t : RetryTypes.PayToken) : Text = switch (t) {
    case (#icp) "icp";
    case (#ckbtc) "ckbtc";
    case (#ckusdc) "ckusdc";
    case (#ckusdt) "ckusdt";
  };
  func attemptOutcomeText(o : RetryTypes.AttemptOutcome) : Text = switch (o) {
    case (#pending) "pending";
    case (#unknown) "unknown";
    case (#failed(_)) "failed";
    case (#succeeded(_)) "succeeded";
  };
  func attemptBlock(o : RetryTypes.AttemptOutcome) : ?Nat = switch (o) {
    case (#succeeded(b)) ?b;
    case _ null;
  };
  type DexBalanceRow = { key : Text; owner : Principal; token : Text; available : Nat; reserved : Nat };
  type DexTransferRow = { key : Text; kind : Text; id : Nat; owner : Principal; amount : Nat; attempt : RetryTypes.DexTransferAttempt; status : Text };
  transient let dexBalanceSample : DexBalanceRow = { key = ""; owner = canisterPrincipal; token = ""; available = 0; reserved = 0 };
  transient let dexTransferSample : DexTransferRow = {
    key = "";
    kind = "";
    id = 0;
    owner = canisterPrincipal;
    amount = 0;
    attempt = {
      n = 0;
      attempt = 1;
      memo = "" : Blob;
      created_at_time = 0;
      request = { token = #tttiT; from = { owner = canisterPrincipal; subaccount = null }; to = { owner = canisterPrincipal; subaccount = null }; amount = 0; fee = ?0 };
      sends = 0;
      lastError = ?"";
      outcome = #pending;
    };
    status = "";
  };
  func dexStatusText(s : DexTypes.DexTransferStatus) : Text = switch (s) {
    case (#inProgress) "inProgress";
    case (#needsReview) "needsReview";
    case (#completed(_)) "completed";
    case (#failed(_)) "failed";
  };
  func dexBalanceRows() : [DexBalanceRow] {
    let rows = List.empty<DexBalanceRow>();
    for ((owner, perToken) in dexBalances.entries()) {
      for ((token, b) in perToken.entries()) {
        rows.add({ key = owner.toText() # "/" # token; owner; token; available = b.available; reserved = b.reserved });
      };
    };
    rows.toArray();
  };
  func dexTransferRows() : [DexTransferRow] {
    let rows = List.empty<DexTransferRow>();
    for (t in dexTransfers.deposits.values()) {
      rows.add({ key = "DD-" # t.n.toText(); kind = "DD"; id = t.n; owner = t.owner; amount = t.amount; attempt = t.attempt; status = dexStatusText(t.status) });
    };
    for (t in dexTransfers.withdrawals.values()) {
      rows.add({ key = "DW-" # t.n.toText(); kind = "DW"; id = t.n; owner = t.owner; amount = t.amount; attempt = t.attempt; status = dexStatusText(t.status) });
    };
    for ((requestId, a) in dexTransfers.pairRefunds.entries()) {
      let (owner, status) = switch (dex.requests.get(requestId)) {
        case (?r) (r.requester, DexLib.refundStatusText(r.refundStatus));
        case null (a.request.to.owner, "unknown");
      };
      // Review row of a DQ refund: id = pair request number (memo TTTI-DQ-<pair request number>).
      rows.add({ key = "DQ-" # requestId.toText(); kind = "DQ"; id = requestId; owner; amount = a.request.amount; attempt = a; status });
    };
    rows.toArray();
  };
  // DEX lot 4 OQL rows and samples.
  type PriceSampleRow = { key : Text; poolId : Nat; at : Int; reserve0 : Nat; reserve1 : Nat };
  type BonusBalanceRow = { owner : Principal; claimableE8s : Nat; claimedE8s : Nat };
  type MintTreasuryRow = { token : Text; balance : Nat; lastRunAt : ?Int };
  transient let cyclesSampleRowSample : CyclesReserveLib.CyclesSample = { at = 0; cyclesBalance = 0; toppedUpCycles = 0 };
  transient let shareChangeSample : CyclesReserveLib.ShareChange = { at = 0; oldShareBps = 0; newShareBps = 0; autonomyDays = ?0 };
  transient let weeklyAllocationSample : TreasuryLib.WeeklyAllocation = {
    id = 0;
    at = 0;
    autonomyDays = ?0;
    treasuryBalances = TreasuryLib.ZERO_AMOUNTS;
    stockPayoutCap = TreasuryLib.ZERO_AMOUNTS;
    toCyclesReserveE8s = 0;
    surplusE8s = 0;
    toBonusE8s = 0;
    toLiquidity = TreasuryLib.ZERO_AMOUNTS;
    poolAdds = [];
    skipped = [];
    waiting = TreasuryLib.ZERO_AMOUNTS;
    note = "";
  };
  transient let dcBatchSample : ProtocolFeeTypes.DcBatch = { id = 0; at = 0; trigger = #daily; legs = []; toCyclesE8s = 0; toBonusE8s = 0; status = #sent(0) };
  transient let dcSendSample : ProtocolFeeTypes.DcSend = { n = 0; batchId = 0; attempt = dexTransferSample.attempt; status = #inProgress };
  transient let bonusClaimSample : ProtocolFeeTypes.BonusClaim = { n = 0; owner = canisterPrincipal; amountE8s = 0; createdAt = 0; attempt = dexTransferSample.attempt; status = #inProgress };
  transient let bonusDistributionSample : ProtocolFeeTypes.BonusDistribution = { id = 0; at = 0; source = #fees; totalE8s = 0; totalWeight = 0; positions = 0 };
  transient let protocolLiquiditySample : ProtocolFeeTypes.ProtocolLiquidity = { poolId = 0; shares = 0; fromFees0 = 0; fromFees1 = 0; fromTreasury0 = 0; fromTreasury1 = 0; lastAddedAt = ?0 };
  transient let feeBucketsSample : (Nat, ProtocolFeeTypes.FeeBuckets) = (0, { cycles0 = 0; cycles1 = 0; bonus0 = 0; bonus1 = 0; recycle0 = 0; recycle1 = 0 });
  transient let priceSampleRowSample : PriceSampleRow = { key = ""; poolId = 0; at = 0; reserve0 = 0; reserve1 = 0 };
  transient let bonusBalanceSample : BonusBalanceRow = { owner = canisterPrincipal; claimableE8s = 0; claimedE8s = 0 };
  transient let mintTreasurySample : MintTreasuryRow = { token = ""; balance = 0; lastRunAt = ?0 };
  func dcBatchStatusText(s : ProtocolFeeTypes.DcBatchStatus) : Text = switch (s) {
    case (#nothingToConvert) "nothingToConvert";
    case (#waitingPriceDeviation) "waitingPriceDeviation";
    case (#sending) "sending";
    case (#sent(_)) "sent";
    case (#needsReview) "needsReview";
    case (#failed(_)) "failed";
  };
  func dcBatchBlock(s : ProtocolFeeTypes.DcBatchStatus) : ?Nat = switch (s) {
    case (#sent(b)) ?b;
    case _ null;
  };
  func convertedLegCount(legs : [ProtocolFeeTypes.DcLeg]) : Nat {
    var count = 0;
    for (l in legs.values()) { if (l.converted) count += 1 };
    count;
  };
  func dexStatusBlock(s : DexTypes.DexTransferStatus) : ?Nat = switch (s) {
    case (#completed(b)) ?b;
    case _ null;
  };
  func priceSampleRows() : [PriceSampleRow] {
    let rows = List.empty<PriceSampleRow>();
    for ((poolId, samples) in protocolFees.priceSamples.entries()) {
      for (s in samples.values()) {
        rows.add({ key = poolId.toText() # "/" # s.at.toText(); poolId; at = s.at; reserve0 = s.reserve0; reserve1 = s.reserve1 });
      };
    };
    rows.toArray();
  };
  func bonusBalanceRows() : [BonusBalanceRow] {
    let rows = List.empty<BonusBalanceRow>();
    for ((owner, claimable) in protocolFees.bonusClaimable.entries()) {
      rows.add({ owner; claimableE8s = claimable; claimedE8s = protocolFees.bonusClaimed.get(owner) ?? 0 });
    };
    for ((owner, claimed) in protocolFees.bonusClaimed.entries()) {
      if (protocolFees.bonusClaimable.get(owner) == null) {
        rows.add({ owner; claimableE8s = 0; claimedE8s = claimed });
      };
    };
    rows.toArray();
  };
  func mintTreasuryRows() : [MintTreasuryRow] {
    let b = treasuryAllocation.balances;
    let at = treasuryAllocation.lastRunAt;
    [
      { token = "icp"; balance = b.icp; lastRunAt = at },
      { token = "ckbtc"; balance = b.ckbtc; lastRunAt = at },
      { token = "ckusdc"; balance = b.ckusdc; lastRunAt = at },
      { token = "ckusdt"; balance = b.ckusdt; lastRunAt = at },
    ];
  };
  // Mint revenue correction OQL rows and samples.
  type SweepRow = {
    key : Text;
    status : Text;
    startedAt : ?Int;
    completedAt : ?Int;
    reserveTopUpE8s : Nat;
    reserveTopUpMemo : ?Text;
    reserveTopUpBlock : ?Nat;
    tokenCount : Nat;
    tokensSent : Nat;
    // History of the one-time sweep: tokens that stayed in the legacy
    // #waitingDestination state (no destination exists anymore).
    tokensWaitingDestination : Nat;
  };
  type MintFeeBalanceRow = { key : Text; owner : Principal; token : Text; claimable : Nat; claimed : Nat };
  transient let routerRedirectSample : RouterTypes.RouterRedirect = {
    poolId = 0;
    redirected0 = 0;
    redirected1 = 0;
    lastTargetPoolId = ?0;
    lastAt = ?0;
  };
  transient let ownerSendSample : OwnerRevenueTypes.OwnerSend = {
    id = 0;
    token = #icp;
    amount = 0;
    source = #accumulated;
    attempt = attemptSample.1;
    status = #pending;
    createdAt = 0;
    updatedAt = 0;
  };
  transient let sweepRowSample : SweepRow = {
    key = "";
    status = "";
    startedAt = ?0;
    completedAt = ?0;
    reserveTopUpE8s = 0;
    reserveTopUpMemo = ?"";
    reserveTopUpBlock = ?0;
    tokenCount = 0;
    tokensSent = 0;
    tokensWaitingDestination = 0;
  };
  transient let mintFeeRoutingSample : MintFeeTypes.MintFeeRouting = {
    id = 0;
    at = 0;
    conversionId = 0;
    token = #icp;
    poolId = ?0;
    feeAmount = 0;
    halfA = 0;
    halfB = 0;
    toLps = 0;
    toSetAside = 0;
    lpCount = 0;
  };
  transient let mintFeeBalanceSample : MintFeeBalanceRow = { key = ""; owner = canisterPrincipal; token = ""; claimable = 0; claimed = 0 };
  transient let mintFeeClaimSample : MintFeeTypes.MintFeeClaim = {
    n = 0;
    owner = canisterPrincipal;
    token = #icp;
    amount = 0;
    createdAt = 0;
    attempt = attemptSample.1;
    status = #inProgress;
  };
  transient let setAsideSample : MintFeeTypes.SetAside = { token = #icp; amount = 0; totalReceived = 0; totalInjected = 0; lastInjectionAt = ?0 };
  transient let injectionSample : MintFeeTypes.LiquidityInjection = {
    id = 0;
    token = #icp;
    poolId = 0;
    amountIn = 0;
    swapAmountIn = 0;
    pairAmountIn = 0;
    venue = #native(0);
    minTttiOut = 0;
    tttiReceived = 0;
    liquidityShares = 0;
    used0 = 0;
    used1 = 0;
    status = #completed;
    error = ?"";
    startedAt = 0;
    updatedAt = 0;
  };
  func ownerSendStatusText(s : OwnerRevenueTypes.OwnerSendStatus) : Text = switch (s) {
    case (#pending) "pending";
    case (#sent(_)) "sent";
    case (#needsReview) "needsReview";
    case (#failed(_)) "failed";
  };
  func ownerSendBlock(s : OwnerRevenueTypes.OwnerSendStatus) : ?Nat = switch (s) {
    case (#sent(b)) ?b;
    case _ null;
  };
  func ownerSourceText(s : OwnerRevenueTypes.OwnerSendSource) : Text = switch (s) {
    case (#mint(_)) "mint";
    case (#accumulated) "accumulated";
    case (#treasurySweep) "treasurySweep";
    case (#withdrawal(_)) "withdrawal";
    case (#settlement(_)) "settlement";
  };
  func ownerSourceConversion(s : OwnerRevenueTypes.OwnerSendSource) : ?Nat = switch (s) {
    case (#mint(id)) ?id;
    case _ null;
  };
  // Mint revenue routing OQL helpers and samples.
  func optAccountText(a : ?OwnerRevenueTypes.Account) : ?Text = switch (a) {
    case (?acc) ?SettlementLib.accountText(acc);
    case null null;
  };
  func legPurposeText(p : OwnerRevenueTypes.SettlementLegPurpose) : Text = switch (p) {
    case (#ownerAccumulated) "ownerAccumulated";
    case (#ownerMintTreasury) "ownerMintTreasury";
    case (#feePending) "feePending";
    case (#feeLegacy) "feeLegacy";
  };
  func settlementStatusText(s : OwnerRevenueTypes.SettlementStatus) : Text = switch (s) {
    case (#pendingWallet) "pendingWallet";
    case (#sending) "sending";
    case (#sent(_)) "sent";
    case (#failed(_)) "failed";
    case (#toReview) "toReview";
  };
  func feeMovePurposeText(p : OwnerRevenueTypes.FeeMovePurpose) : Text = switch (p) {
    case (#mintFee(_)) "mintFee";
    case (#settlement(l)) "settlement:" # legPurposeText(l);
  };
  func feeMoveConversion(p : OwnerRevenueTypes.FeeMovePurpose) : ?Nat = switch (p) {
    case (#mintFee(id)) ?id;
    case _ null;
  };
  func legsTotal(legs : [OwnerRevenueTypes.SettlementLeg], owner : Bool) : Nat {
    var total = 0;
    for (l in legs.values()) {
      let isOwner = switch (l.purpose) {
        case (#ownerAccumulated or #ownerMintTreasury) true;
        case _ false;
      };
      if (isOwner == owner) total += l.amount;
    };
    total;
  };
  transient let sampleAccount : OwnerRevenueTypes.Account = { owner = canisterPrincipal; subaccount = null };
  transient let receivingWalletSample : OwnerRevenueTypes.ReceivingWallet = {
    token = #icp;
    account = sampleAccount;
    setAt = 0;
    setBy = canisterPrincipal;
  };
  transient let walletChangeSample : OwnerRevenueTypes.WalletChange = {
    id = 0;
    token = #icp;
    oldAccount = ?sampleAccount;
    newAccount = sampleAccount;
    at = 0;
    by = canisterPrincipal;
  };
  transient let tokenSettlementSample : OwnerRevenueTypes.TokenSettlement = {
    token = #icp;
    status = #pendingWallet;
    destination = ?sampleAccount;
    legs = [];
    startedAt = ?0;
    completedAt = ?0;
    lastError = ?"";
  };
  transient let feeMoveSample : OwnerRevenueTypes.FeeMove = {
    n = 0;
    token = #icp;
    purpose = #mintFee(0);
    attempt = attemptSample.1;
    status = #pending;
    createdAt = 0;
    updatedAt = 0;
  };
  func sweepStatusText(s : OwnerRevenueTypes.SweepStatus) : Text = switch (s) {
    case (#notStarted) "notStarted";
    case (#toppingUpReserve) "toppingUpReserve";
    case (#sending) "sending";
    case (#completed) "completed";
  };
  func sweepRows() : [SweepRow] {
    let s = ownerRevenue.sweep;
    var sent = 0;
    var waiting = 0;
    for (t in s.tokens.values()) {
      switch (t.status) {
        case (#sent(_)) sent += 1;
        case (#waitingDestination) waiting += 1;
        case _ {};
      };
    };
    let (memo, block) : (?Text, ?Nat) = switch (s.reserveTopUp) {
      case (?a) (a.memo.decodeUtf8(), attemptBlock(a.outcome));
      case null (null, null);
    };
    [{
      key = "sweep";
      status = sweepStatusText(s.status);
      startedAt = s.startedAt;
      completedAt = s.completedAt;
      reserveTopUpE8s = s.reserveTopUpE8s;
      reserveTopUpMemo = memo;
      reserveTopUpBlock = block;
      tokenCount = s.tokens.size();
      tokensSent = sent;
      tokensWaitingDestination = waiting;
    }];
  };
  func mintFeeClaimStatusText(s : MintFeeTypes.MintFeeClaimStatus) : Text = switch (s) {
    case (#inProgress) "inProgress";
    case (#needsReview) "needsReview";
    case (#completed(_)) "completed";
    case (#failed(_)) "failed";
  };
  func mintFeeClaimBlock(s : MintFeeTypes.MintFeeClaimStatus) : ?Nat = switch (s) {
    case (#completed(b)) ?b;
    case _ null;
  };
  func injectionStatusText(s : MintFeeTypes.InjectionStatus) : Text = switch (s) {
    case (#swapping) "swapping";
    case (#addingLiquidity) "addingLiquidity";
    case (#completed) "completed";
    case (#needsReview) "needsReview";
    case (#failed(_)) "failed";
  };
  func venueText(v : MintFeeTypes.SwapVenue) : Text = switch (v) {
    case (#icpswap(_)) "icpswap";
    case (#native(_)) "native";
  };
  func mintFeeBalanceRows() : [MintFeeBalanceRow] {
    let rows = List.empty<MintFeeBalanceRow>();
    for ((owner, perToken) in mintFees.claimable.entries()) {
      for ((token, amount) in perToken.entries()) {
        let claimed = switch (mintFees.claimed.get(owner)) {
          case (?m) m.get(token) ?? 0;
          case null 0;
        };
        rows.add({ key = owner.toText() # "/" # token; owner; token; claimable = amount; claimed });
      };
    };
    for ((owner, perToken) in mintFees.claimed.entries()) {
      for ((token, amount) in perToken.entries()) {
        let listed = switch (mintFees.claimable.get(owner)) {
          case (?m) m.containsKey(token);
          case null false;
        };
        if (not listed) {
          rows.add({ key = owner.toText() # "/" # token; owner; token; claimable = 0; claimed = amount });
        };
      };
    };
    rows.toArray();
  };
  func isAppAdmin(caller : Principal) : Bool = accessControlState.userRoles.get(caller) == ?#admin;
  // DEX lot 5: router OQL rows.
  transient let routedSwapSample : RouterTypes.RoutedSwap = {
    id = 0;
    owner = canisterPrincipal;
    createdAt = 0;
    updatedAt = 0;
    route = #icpswap({ poolCanisterId = canisterPrincipal });
    tokenIn = #icp;
    tokenOut = #tttiT;
    amountIn = 0;
    amountOut = 0;
    minAmountOut = 0;
    deadline = 0;
    fees = #native({ feeBps = 0; fee = 0 });
    nativePoolId = ?0;
    zeroForOne = false;
    stage = #done;
    status = #completed;
    move = null;
    lastError = ?"";
  };
  transient let routerFeeSample : RouterTypes.RouterFeeTotals = {
    poolId = 0;
    collected0 = 0;
    collected1 = 0;
    lpPaid0 = 0;
    lpPaid1 = 0;
    lpSetAside0 = 0;
    lpSetAside1 = 0;
    permanent0 = 0;
    permanent1 = 0;
  };
  func routeText(r : RouterTypes.Route) : Text = switch (r) {
    case (#native(_)) "native";
    case (#icpswap(_)) "icpswap";
  };
  func routePool(r : RouterTypes.Route) : Text = switch (r) {
    case (#native({ poolId })) poolId.toText();
    case (#icpswap({ poolCanisterId })) poolCanisterId.toText();
  };
  func routeFeeTotal(f : RouterTypes.RouteFees) : Nat = switch (f) {
    case (#native({ fee })) fee;
    case (#icpswap({ icpswapFee; protocolFee })) icpswapFee + protocolFee;
  };
  func routeProtocolFee(f : RouterTypes.RouteFees) : Nat = switch (f) {
    case (#native(_)) 0;
    case (#icpswap({ protocolFee })) protocolFee;
  };
  func routedStageText(s : RouterTypes.RoutedSwapStage) : Text = switch (s) {
    case (#recorded) "recorded";
    case (#movingIn) "movingIn";
    case (#depositing) "depositing";
    case (#swapping) "swapping";
    case (#withdrawing) "withdrawing";
    case (#done) "done";
  };
  func routedStatusText(s : RouterTypes.RoutedSwapStatus) : Text = switch (s) {
    case (#inProgress) "inProgress";
    case (#completed) "completed";
    case (#failedReturned(_)) "failedReturned";
    case (#needsReview) "needsReview";
    case (#reviewedArrived(_)) "reviewedArrived";
    case (#reviewedNotArrived) "reviewedNotArrived";
  };
  include Expose({
    entities = [
      OQL.Entity.manual<(Nat, RetryTypes.TransferAttempt)>("forwardAttempt", func() = retry.forwards.entries(), "ForwardAttempt", "purchaseId")
        .sample(attemptSample)
        .payload("purchaseId", func((id, _)) = id)
        .payload("n", func((_, a)) = a.n)
        .payload("attempt", func((_, a)) = a.attempt)
        .payload("memo", func((_, a)) = a.memo.decodeUtf8())
        .payload("createdAtTime", func((_, a)) = a.created_at_time)
        .payload("token", func((_, a)) = attemptTokenText(a.request.token))
        .payload("toOwner", func((_, a)) = a.request.to.owner)
        .payload("amount", func((_, a)) = a.request.amount)
        .payload("fee", func((_, a)) = a.request.fee)
        .payload("sends", func((_, a)) = a.sends)
        .payload("lastError", func((_, a)) = a.lastError)
        .payload("outcome", func((_, a)) = attemptOutcomeText(a.outcome))
        .payload("block", func((_, a)) = attemptBlock(a.outcome))
        .ownedByWith("purchaseId", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Nat, RetryTypes.TransferAttempt)>("shareAttempt", func() = retry.shares.entries(), "ShareAttempt", "purchaseId")
        .sample(attemptSample)
        .payload("purchaseId", func((id, _)) = id)
        .payload("n", func((_, a)) = a.n)
        .payload("attempt", func((_, a)) = a.attempt)
        .payload("memo", func((_, a)) = a.memo.decodeUtf8())
        .payload("createdAtTime", func((_, a)) = a.created_at_time)
        .payload("token", func((_, a)) = attemptTokenText(a.request.token))
        .payload("toOwner", func((_, a)) = a.request.to.owner)
        .payload("amount", func((_, a)) = a.request.amount)
        .payload("fee", func((_, a)) = a.request.fee)
        .payload("sends", func((_, a)) = a.sends)
        .payload("lastError", func((_, a)) = a.lastError)
        .payload("outcome", func((_, a)) = attemptOutcomeText(a.outcome))
        .payload("block", func((_, a)) = attemptBlock(a.outcome))
        .ownedByWith("purchaseId", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Nat, RetryTypes.TransferAttempt)>("refundAttempt", func() = retry.refunds.entries(), "RefundAttempt", "purchaseId")
        .sample(attemptSample)
        .payload("purchaseId", func((id, _)) = id)
        .payload("n", func((_, a)) = a.n)
        .payload("attempt", func((_, a)) = a.attempt)
        .payload("memo", func((_, a)) = a.memo.decodeUtf8())
        .payload("createdAtTime", func((_, a)) = a.created_at_time)
        .payload("token", func((_, a)) = attemptTokenText(a.request.token))
        .payload("toOwner", func((_, a)) = a.request.to.owner)
        .payload("amount", func((_, a)) = a.request.amount)
        .payload("fee", func((_, a)) = a.request.fee)
        .payload("sends", func((_, a)) = a.sends)
        .payload("lastError", func((_, a)) = a.lastError)
        .payload("outcome", func((_, a)) = attemptOutcomeText(a.outcome))
        .payload("block", func((_, a)) = attemptBlock(a.outcome))
        .ownedByWith("purchaseId", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Nat, RetryTypes.PurchaseTrace)>("purchaseTrace", func() = retry.traces.entries(), "PurchaseTrace", "n")
        .sample(traceSample)
        .payload("n", func((n, _)) = n)
        .payload("buyer", func((_, t)) = t.buyer)
        .payload("token", func((_, t)) = attemptTokenText(t.token))
        .payload("amount", func((_, t)) = t.amount)
        .payload("reserved", func((_, t)) = t.reserved)
        .payload("createdAtTime", func((_, t)) = t.created_at_time)
        .payload("memo", func((_, t)) = t.memo.decodeUtf8())
        .ownedByWith("n", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Nat, RetryTypes.PaymentToRefund)>("paymentToRefund", func() = retry.toRefund.entries(), "PaymentToRefund", "n")
        .sample(paymentToRefundSample)
        .payload("n", func((n, _)) = n)
        .payload("buyer", func((_, p)) = p.buyer)
        .payload("token", func((_, p)) = attemptTokenText(p.token))
        .payload("amount", func((_, p)) = p.amount)
        .payload("reserved", func((_, p)) = p.reserved)
        .payload("createdAtTime", func((_, p)) = p.created_at_time)
        .payload("memo", func((_, p)) = p.memo.decodeUtf8())
        .payload("collect", func((_, p)) = switch (p.collect) { case (#confirmed) "confirmed"; case (#unknown) "unknown" })
        .payload("block", func((_, p)) = p.block)
        .payload("detectedAt", func((_, p)) = p.detectedAt)
        .ownedByWith("n", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Nat, RetryTypes.BtcCostSend)>("btcCostSend", func() = retry.btcCosts.entries(), "BtcCostSend", "n")
        .sample(btcCostSample)
        .payload("n", func((n, _)) = n)
        .payload("buyer", func((_, c)) = c.buyer)
        .payload("depositIndex", func((_, c)) = c.depositIndex)
        .payload("conversionId", func((_, c)) = c.conversionId)
        .payload("attempt", func((_, c)) = c.attempt.attempt)
        .payload("memo", func((_, c)) = c.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func((_, c)) = c.attempt.created_at_time)
        .payload("toOwner", func((_, c)) = c.attempt.request.to.owner)
        .payload("amount", func((_, c)) = c.attempt.request.amount)
        .payload("fee", func((_, c)) = c.attempt.request.fee)
        .payload("sends", func((_, c)) = c.attempt.sends)
        .payload("lastError", func((_, c)) = c.attempt.lastError)
        .payload("outcome", func((_, c)) = attemptOutcomeText(c.attempt.outcome))
        .payload("block", func((_, c)) = attemptBlock(c.attempt.outcome))
        .ownedByWith("n", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<BuybackTypes.Buyback>("buyback", func() = buybacks.records.values(), "Buyback", "id")
        .sample(buybackSample)
        .payload("id", func b = b.id)
        .payload("purchaseId", func b = b.purchaseId)
        .payload("buyer", func b = b.buyer)
        .payload("timestamp", func b = b.timestamp)
        .payload("originalToken", func b = switch (b.originalToken) { case (#icp) "icp"; case (#ckbtc) "ckbtc"; case (#ckusdc) "ckusdc"; case (#ckusdt) "ckusdt" })
        .payload("tokenReturned", func b = switch (b.tokenReturned) { case (#icp) "icp"; case (#ckbtc) "ckbtc"; case (#ckusdc) "ckusdc"; case (#ckusdt) "ckusdt" })
        .payload("percent", func b = b.percent)
        .payload("massTotalNet", func b = b.massTotalNet)
        .payload("massTotalTtti", func b = b.massTotalTtti)
        .payload("massRemainingNet", func b = b.massRemainingNet)
        .payload("massRemainingTtti", func b = b.massRemainingTtti)
        .payload("originalRateUsdE8", func b = b.originalRateUsdE8)
        .payload("returnedRateUsdE8", func b = b.returnedRateUsdE8)
        .payload("rule", func b = switch (b.rule) { case (#originalNet) "originalNet"; case (#dayRate) "dayRate" })
        .payload("originalNetAmount", func b = b.originalNetAmount)
        .payload("baseAmount", func b = b.baseAmount)
        .payload("baseAmountReturned", func b = b.baseAmountReturned)
        .payload("buybackFee", func b = b.buybackFee)
        .payload("thirdPartyFees", func b = b.thirdPartyFees)
        .payload("tttiTransferFee", func b = b.tttiTransferFee)
        .payload("tttiEscrowFee", func b = b.tttiEscrowFee)
        .payload("amountReturned", func b = b.amountReturned)
        .payload("tttiAmount", func b = b.tttiAmount)
        .payload("pullBlock", func b = b.pullBlock)
        .payload("payoutBlock", func b = b.payoutBlock)
        .payload("payoutAttemptCount", func b = b.payoutAttempts.size())
        .payload("releaseBlock", func b = b.releaseBlock)
        .payload("cancelBlock", func b = b.cancelBlock)
        .payload("legacy", func b = b.legacy)
        .payload("status", func b = switch (b.status) { case (#inProgress) "inProgress"; case (#completed) "completed"; case (#payoutFailed) "payoutFailed"; case (#cancelled) "cancelled" })
        .payload("message", func b = b.message)
        .ownedByWith("buyer", func(caller, owner) = accessControlState.userRoles.get(caller) == ?#admin or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<UpgradeTypes.ReservedReconciliation>("reservedReconciliation", func() = reservedReconciliations.history.values(), "ReservedReconciliation", "reconciledAt")
        .sample(reconciliationSample)
        .payload("reconciledAt", func r = r.reconciledAt)
        .payload("previousReserved", func r = r.previousReserved)
        .payload("by", func r = r.by)
        .ownedByWith("reconciledAt", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<UpgradeTypes.TopUpAttempt>("cyclesTopUpAttempt", pendingTopUpRows, "CyclesTopUpAttempt", "createdAtTime")
        .sample(topUpSample)
        .payload("createdAtTime", func a = a.created_at_time)
        .payload("memo", func a = a.memo.decodeUtf8())
        .payload("amount", func a = a.amount)
        .payload("fee", func a = a.request.fee)
        .payload("toOwner", func a = a.request.to.owner)
        .payload("blockIndex", func a = a.blockIndex)
        .payload("createdAt", func a = a.createdAt)
        .payload("sends", func a = a.sends)
        .payload("lastError", func a = a.lastError)
        .payload("outcome", func a = switch (a.outcome) { case (#pending) "pending"; case (#unknown) "unknown"; case (#failed(_)) "failed"; case (#succeeded(_)) "succeeded" })
        .payload("needsReview", func a = a.needsReview)
        .ownedByWith("createdAtTime", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<TreasuryTypes.Conversion>("conversion", func() = treasury.conversions.values(), "Conversion", "id")
        .sample(conversionSample)
        .payload("id", func c = c.id)
        .payload("depositor", func c = c.depositor)
        .payload("recipientOwner", func c = c.recipient.owner)
        .payload("payToken", func c = switch (c.payToken) { case (#icp) "icp"; case (#ckbtc) "ckbtc"; case (#ckusdc) "ckusdc"; case (#ckusdt) "ckusdt" })
        .payload("payAmount", func c = c.payAmount)
        .payload("feeAmount", func c = c.feeAmount)
        .payload("netAmount", func c = c.netAmount)
        .payload("feeBps", func c = c.feeBps)
        .payload("icpAmount", func c = c.icpAmount)
        .payload("tttiAmount", func c = c.tttiAmount)
        .payload("status", func c = switch (c.status) { case (#completed) "completed"; case (#failed) "failed"; case (#refunded) "refunded"; case (#refundFailed) "refundFailed"; case (#refundReview) "refundReview" })
        .payload("timestamp", func c = c.timestamp)
        .payload("priceUsdE8", func c = c.priceUsdE8)
        .payload("usedFallback", func c = c.usedFallback)
        .payload("minted", func c = c.minted)
        .payload("fromCollector", func c = c.fromCollector)
        .payload("forward", func c = switch (c.forward) { case (#notRequired) "notRequired"; case (#pending) "pending"; case (#forwarded(_)) "forwarded"; case (#failed(_)) "failed"; case (#needsReview) "needsReview" })
        .payload("message", func c = c.message)
        .payload("paymentBlock", func c = c.paymentBlock)
        .payload("mintBlock", func c = c.mintBlock)
        .ownedByWith("depositor", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal, BtcTypes.DepositTracking)>("btcDepositTracking", func() = BtcDepositLib.trackingRows(btcDeposits), "BtcDepositTracking", "key")
        .sample(btcTrackingSample)
        .payload("key", func((p, t)) = p.toText() # ":" # BtcDepositLib.kindText(t.kind))
        .payload("principal", func((p, _)) = p)
        .payload("kind", func((_, t)) = BtcDepositLib.kindText(t.kind))
        .payload("btcAddress", func((_, t)) = t.btcAddress)
        .payload("stage", func((_, t)) = BtcDepositLib.stageText(t.stage))
        .payload("depositCount", func((_, t)) = t.deposits.size())
        .payload("btcDetectedSats", func((_, t)) = BtcDepositLib.total(t, func e = e.btcDetectedSats))
        .payload("ckbtcMintedSats", func((_, t)) = BtcDepositLib.total(t, func e = e.ckbtcMintedSats))
        .payload("ckbtcPendingSats", func((_, t)) = BtcDepositLib.total(t, func e = e.ckbtcPendingSats))
        .payload("tttiDelivered", func((_, t)) = BtcDepositLib.total(t, func e = e.tttiDelivered))
        .payload("refundedSats", func((_, t)) = BtcDepositLib.total(t, func e = e.refundedSats))
        .payload("createdAt", func((_, t)) = t.createdAt)
        .payload("lastCheckedAt", func((_, t)) = t.lastCheckedAt)
        .payload("errorKind", func((_, t)) = BtcDepositLib.errorKindText(t.errorKind))
        .payload("errorMessage", func((_, t)) = t.errorMessage)
        .ownedByWith("principal", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<(Principal, AddressBookTypes.Contact)>("addressBookContact", func() = AddressBookLib.contactRows(addressBook), "AddressBookContact", "id")
        .sample(contactSample)
        .payload("id", func((_, c)) = c.id)
        .payload("owner", func((o, _)) = o)
        .payload("nickname", func((_, c)) = c.nickname)
        .payload("principal", func((_, c)) = c.principal)
        .payload("memoBytes", func((_, c)) = switch (c.memo) { case (?m) m.size(); case null 0 })
        .payload("createdAt", func((_, c)) = c.createdAt)
        .payload("updatedAt", func((_, c)) = c.updatedAt)
        .ownedByWith("owner", func(caller, owner) = owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexTypes.Pool>("dexPool", func() = dex.pools.values(), "DexPool", "id")
        .sample(dexPoolSample)
        .payload("id", func p = p.id)
        .payload("token0Symbol", func p = p.token0.symbol)
        .payload("token0Ledger", func p = DexLib.ledgerPrincipal(p.token0.ledger, canisterPrincipal))
        .payload("token1Symbol", func p = p.token1.symbol)
        .payload("token1Ledger", func p = DexLib.ledgerPrincipal(p.token1.ledger, canisterPrincipal))
        .payload("feeTier", func p = dexFeeTierText(p.feeTier))
        .payload("feeBps", func p = DexLib.feeBps(p.feeTier))
        .payload("kind", func p = DexLib.kindText(p.kind))
        .payload("status", func p = DexLib.poolStatusText(p.status))
        .payload("createdAt", func p = p.createdAt)
        .payload("subaccount", func p = p.subaccount.decodeUtf8())
        .payload("minimumLocked0", func p = p.minimumLocked.token0)
        .payload("minimumLocked1", func p = p.minimumLocked.token1)
        .payload("newPairBadgeUntil", func p = p.newPairBadgeUntil)
        .payload("requestId", func p = p.requestId)
        .payload("removedAt", func p = p.removedAt)
        .payload("reserve0", func p = p.reserve0)
        .payload("reserve1", func p = p.reserve1)
        .payload("totalShares", func p = p.totalShares)
        .payload("lockedShares", func p = p.lockedShares)
        .payload("protocolFee0", func p = p.protocolFee0)
        .payload("protocolFee1", func p = p.protocolFee1)
        .ownedByWith("id", func(caller, _) = accessControlState.userRoles.get(caller) == ?#admin)
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexTypes.Position>("dexPosition", func() = dex.positions.values(), "DexPosition", "id")
        .sample(dexPositionSample)
        .payload("id", func p = p.id)
        .payload("poolId", func p = p.poolId)
        .payload("owner", func p = p.owner)
        .payload("shares", func p = p.shares)
        .payload("createdAt", func p = p.createdAt)
        .payload("lockDurationNs", func p = p.lockDurationNs)
        .payload("unlockAt", func p = p.unlockAt)
        .payload("isCreator", func p = p.isCreator)
        .public_()
        .build(),
      OQL.Entity.manual<DexTypes.PairRequest>("dexPairRequest", func() = dex.requests.values(), "DexPairRequest", "id")
        .sample(dexRequestSample)
        .payload("id", func r = r.id)
        .payload("requester", func r = r.requester)
        .payload("ledgerId", func r = r.token.ledgerId)
        .payload("tokenName", func r = r.token.name)
        .payload("tokenSymbol", func r = r.token.symbol)
        .payload("tokenDecimals", func r = r.token.decimals.toNat())
        .payload("tokenFee", func r = r.token.fee)
        .payload("counterSymbol", func r = r.counter.symbol)
        .payload("counterLedger", func r = DexLib.ledgerPrincipal(r.counter.ledger, canisterPrincipal))
        .payload("feeTier", func r = dexFeeTierText(r.feeTier))
        .payload("feeBps", func r = DexLib.feeBps(r.feeTier))
        .payload("kind", func r = DexLib.kindText(r.kind))
        .payload("message", func r = r.message)
        .payload("createdAt", func r = r.createdAt)
        .payload("icrc1", func r = r.checks.icrc1)
        .payload("icrc2", func r = r.checks.icrc2)
        .payload("metadataRead", func r = r.checks.metadataRead)
        .payload("pairUnique", func r = r.checks.pairUnique)
        .payload("copiedSymbolOf", func r = r.checks.copiedSymbolOf)
        .payload("depositAmount", func r = r.depositAmount)
        .payload("depositBlock", func r = r.depositBlock)
        .payload("status", func r = DexLib.requestStatusText(r.status))
        .payload("reason", func r = dexRequestReason(r.status))
        .payload("poolId", func r = dexRequestPoolId(r.status))
        .payload("decidedAt", func r = dexRequestDecidedAt(r.status))
        .payload("refundBlock", func r = r.refundBlock)
        .ownedByWith("requester", func(caller, owner) = accessControlState.userRoles.get(caller) == ?#admin or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexBalanceRow>("dexBalance", func() = dexBalanceRows().values(), "DexBalance", "key")
        .sample(dexBalanceSample)
        .payload("key", func r = r.key)
        .payload("owner", func r = r.owner)
        .payload("token", func r = r.token)
        .payload("available", func r = r.available)
        .payload("reserved", func r = r.reserved)
        .public_()
        .build(),
      OQL.Entity.manual<DexTransferRow>("dexTransfer", func() = dexTransferRows().values(), "DexTransfer", "key")
        .sample(dexTransferSample)
        .payload("key", func r = r.key)
        .payload("kind", func r = r.kind)
        .payload("id", func r = r.id)
        .payload("owner", func r = r.owner)
        .payload("token", func r = DexLib.tokenSymbol(r.attempt.request.token))
        .payload("amount", func r = r.amount)
        .payload("ledgerAmount", func r = r.attempt.request.amount)
        .payload("fee", func r = r.attempt.request.fee)
        .payload("toOwner", func r = r.attempt.request.to.owner)
        .payload("n", func r = r.attempt.n)
        .payload("attempt", func r = r.attempt.attempt)
        .payload("memo", func r = r.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func r = r.attempt.created_at_time)
        .payload("sends", func r = r.attempt.sends)
        .payload("lastError", func r = r.attempt.lastError)
        .payload("outcome", func r = attemptOutcomeText(r.attempt.outcome))
        .payload("block", func r = attemptBlock(r.attempt.outcome))
        .payload("status", func r = r.status)
        .public_()
        .build(),
      // --- DEX lot 4 ---------------------------------------------------------
      OQL.Entity.manual<CyclesReserveLib.CyclesSample>("cyclesSample", func() = cyclesAutonomy.samples.values(), "CyclesSample", "at")
        .sample(cyclesSampleRowSample)
        .payload("at", func s = s.at)
        .payload("cyclesBalance", func s = s.cyclesBalance)
        .payload("toppedUpCycles", func s = s.toppedUpCycles)
        .ownedByWith("at", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<CyclesReserveLib.ShareChange>("cyclesShareChange", func() = cyclesAutonomy.shareHistory.values(), "CyclesShareChange", "at")
        .sample(shareChangeSample)
        .payload("at", func c = c.at)
        .payload("oldShareBps", func c = c.oldShareBps)
        .payload("newShareBps", func c = c.newShareBps)
        .payload("autonomyDays", func c = c.autonomyDays)
        .ownedByWith("at", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<TreasuryLib.WeeklyAllocation>("weeklyAllocation", func() = treasuryAllocation.history.values(), "WeeklyAllocation", "id")
        .sample(weeklyAllocationSample)
        .payload("id", func w = w.id)
        .payload("at", func w = w.at)
        .payload("autonomyDays", func w = w.autonomyDays)
        .payload("treasuryIcp", func w = w.treasuryBalances.icp)
        .payload("treasuryCkbtc", func w = w.treasuryBalances.ckbtc)
        .payload("treasuryCkusdc", func w = w.treasuryBalances.ckusdc)
        .payload("treasuryCkusdt", func w = w.treasuryBalances.ckusdt)
        .payload("stockCapIcp", func w = w.stockPayoutCap.icp)
        .payload("stockCapCkbtc", func w = w.stockPayoutCap.ckbtc)
        .payload("stockCapCkusdc", func w = w.stockPayoutCap.ckusdc)
        .payload("stockCapCkusdt", func w = w.stockPayoutCap.ckusdt)
        .payload("toCyclesReserveE8s", func w = w.toCyclesReserveE8s)
        .payload("surplusE8s", func w = w.surplusE8s)
        .payload("toBonusE8s", func w = w.toBonusE8s)
        .payload("liquidityIcp", func w = w.toLiquidity.icp)
        .payload("liquidityCkbtc", func w = w.toLiquidity.ckbtc)
        .payload("liquidityCkusdc", func w = w.toLiquidity.ckusdc)
        .payload("liquidityCkusdt", func w = w.toLiquidity.ckusdt)
        .payload("poolAddCount", func w = w.poolAdds.size())
        .payload("skippedCount", func w = w.skipped.size())
        .payload("waitingIcp", func w = w.waiting.icp)
        .payload("waitingCkbtc", func w = w.waiting.ckbtc)
        .payload("waitingCkusdc", func w = w.waiting.ckusdc)
        .payload("waitingCkusdt", func w = w.waiting.ckusdt)
        .payload("note", func w = w.note)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<MintTreasuryRow>("mintTreasuryBalance", func() = mintTreasuryRows().values(), "MintTreasuryBalance", "token")
        .sample(mintTreasurySample)
        .payload("token", func r = r.token)
        .payload("balance", func r = r.balance)
        .payload("lastRunAt", func r = r.lastRunAt)
        .ownedByWith("token", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<ProtocolFeeTypes.DcBatch>("dcBatch", func() = protocolFees.batches.values(), "DcBatch", "id")
        .sample(dcBatchSample)
        .payload("id", func b = b.id)
        .payload("at", func b = b.at)
        .payload("trigger", func b = switch (b.trigger) { case (#daily) "daily"; case (#threshold) "threshold" })
        .payload("legCount", func b = b.legs.size())
        .payload("convertedLegs", func b = convertedLegCount(b.legs))
        .payload("toCyclesE8s", func b = b.toCyclesE8s)
        .payload("toBonusE8s", func b = b.toBonusE8s)
        .payload("status", func b = dcBatchStatusText(b.status))
        .payload("block", func b = dcBatchBlock(b.status))
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<ProtocolFeeTypes.DcSend>("dcSend", func() = protocolFees.dcSends.values(), "DcSend", "n")
        .sample(dcSendSample)
        .payload("n", func s = s.n)
        .payload("batchId", func s = s.batchId)
        .payload("token", func s = DexLib.tokenSymbol(s.attempt.request.token))
        .payload("toOwner", func s = s.attempt.request.to.owner)
        .payload("amount", func s = s.attempt.request.amount)
        .payload("fee", func s = s.attempt.request.fee)
        .payload("attempt", func s = s.attempt.attempt)
        .payload("memo", func s = s.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func s = s.attempt.created_at_time)
        .payload("sends", func s = s.attempt.sends)
        .payload("lastError", func s = s.attempt.lastError)
        .payload("outcome", func s = attemptOutcomeText(s.attempt.outcome))
        .payload("status", func s = dexStatusText(s.status))
        .payload("block", func s = dexStatusBlock(s.status))
        .ownedByWith("n", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<ProtocolFeeTypes.BonusClaim>("lpBonusClaim", func() = protocolFees.bonusClaims.values(), "LpBonusClaim", "n")
        .sample(bonusClaimSample)
        .payload("n", func c = c.n)
        .payload("owner", func c = c.owner)
        .payload("amountE8s", func c = c.amountE8s)
        .payload("createdAt", func c = c.createdAt)
        .payload("attempt", func c = c.attempt.attempt)
        .payload("memo", func c = c.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func c = c.attempt.created_at_time)
        .payload("sends", func c = c.attempt.sends)
        .payload("lastError", func c = c.attempt.lastError)
        .payload("outcome", func c = attemptOutcomeText(c.attempt.outcome))
        .payload("status", func c = dexStatusText(c.status))
        .payload("block", func c = dexStatusBlock(c.status))
        .ownedByWith("owner", func(caller, owner) = isAppAdmin(caller) or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<BonusBalanceRow>("lpBonusBalance", func() = bonusBalanceRows().values(), "LpBonusBalance", "owner")
        .sample(bonusBalanceSample)
        .payload("owner", func r = r.owner)
        .payload("claimableE8s", func r = r.claimableE8s)
        .payload("claimedE8s", func r = r.claimedE8s)
        .ownedByWith("owner", func(caller, owner) = isAppAdmin(caller) or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<ProtocolFeeTypes.BonusDistribution>("lpBonusDistribution", func() = protocolFees.bonusDistributions.values(), "LpBonusDistribution", "id")
        .sample(bonusDistributionSample)
        .payload("id", func d = d.id)
        .payload("at", func d = d.at)
        .payload("source", func d = switch (d.source) { case (#fees) "fees"; case (#treasury) "treasury" })
        .payload("totalE8s", func d = d.totalE8s)
        .payload("totalWeight", func d = d.totalWeight)
        .payload("positions", func d = d.positions)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<ProtocolFeeTypes.ProtocolLiquidity>("protocolLiquidity", func() = protocolFees.protocolLiquidity.values(), "ProtocolLiquidity", "poolId")
        .sample(protocolLiquiditySample)
        .payload("poolId", func l = l.poolId)
        .payload("shares", func l = l.shares)
        .payload("fromFees0", func l = l.fromFees0)
        .payload("fromFees1", func l = l.fromFees1)
        .payload("fromTreasury0", func l = l.fromTreasury0)
        .payload("fromTreasury1", func l = l.fromTreasury1)
        .payload("lastAddedAt", func l = l.lastAddedAt)
        .public_()
        .build(),
      OQL.Entity.manual<(Nat, ProtocolFeeTypes.FeeBuckets)>("protocolFeeBucket", func() = protocolFees.buckets.entries(), "ProtocolFeeBucket", "poolId")
        .sample(feeBucketsSample)
        .payload("poolId", func((id, _)) = id)
        .payload("cycles0", func((_, b)) = b.cycles0)
        .payload("cycles1", func((_, b)) = b.cycles1)
        .payload("bonus0", func((_, b)) = b.bonus0)
        .payload("bonus1", func((_, b)) = b.bonus1)
        .payload("recycle0", func((_, b)) = b.recycle0)
        .payload("recycle1", func((_, b)) = b.recycle1)
        .ownedByWith("poolId", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<PriceSampleRow>("poolPriceSample", func() = priceSampleRows().values(), "PoolPriceSample", "key")
        .sample(priceSampleRowSample)
        .payload("key", func r = r.key)
        .payload("poolId", func r = r.poolId)
        .payload("at", func r = r.at)
        .payload("reserve0", func r = r.reserve0)
        .payload("reserve1", func r = r.reserve1)
        .public_()
        .build(),
      // --- Mint revenue: owner sends and the earlier sweep (admin only) ------
      OQL.Entity.manual<OwnerRevenueTypes.OwnerSend>("ownerSend", func() = ownerRevenue.sends.values(), "OwnerSend", "id")
        .sample(ownerSendSample)
        .payload("id", func s = s.id)
        .payload("token", func s = attemptTokenText(s.token))
        .payload("amount", func s = s.amount)
        .payload("fee", func s = s.attempt.request.fee)
        .payload("toOwner", func s = s.attempt.request.to.owner)
        .payload("source", func s = ownerSourceText(s.source))
        .payload("conversionId", func s = ownerSourceConversion(s.source))
        .payload("n", func s = s.attempt.n)
        .payload("attempt", func s = s.attempt.attempt)
        .payload("memo", func s = s.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func s = s.attempt.created_at_time)
        .payload("sends", func s = s.attempt.sends)
        .payload("lastError", func s = s.attempt.lastError)
        .payload("outcome", func s = attemptOutcomeText(s.attempt.outcome))
        .payload("status", func s = ownerSendStatusText(s.status))
        .payload("block", func s = ownerSendBlock(s.status))
        .payload("createdAt", func s = s.createdAt)
        .payload("updatedAt", func s = s.updatedAt)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<SweepRow>("treasurySweep", func() = sweepRows().values(), "TreasurySweep", "key")
        .sample(sweepRowSample)
        .payload("key", func r = r.key)
        .payload("status", func r = r.status)
        .payload("startedAt", func r = r.startedAt)
        .payload("completedAt", func r = r.completedAt)
        .payload("reserveTopUpE8s", func r = r.reserveTopUpE8s)
        .payload("reserveTopUpMemo", func r = r.reserveTopUpMemo)
        .payload("reserveTopUpBlock", func r = r.reserveTopUpBlock)
        .payload("tokenCount", func r = r.tokenCount)
        .payload("tokensSent", func r = r.tokensSent)
        .payload("tokensWaitingDestination", func r = r.tokensWaitingDestination)
        .ownedByWith("key", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      // --- Mint revenue routing: receiving wallets, settlement, fee account --
      OQL.Entity.manual<OwnerRevenueTypes.ReceivingWallet>("receivingWallet", func() = mintRevenue.wallets.values(), "ReceivingWallet", "token")
        .sample(receivingWalletSample)
        .payload("token", func w = attemptTokenText(w.token))
        .payload("owner", func w = w.account.owner)
        .payload("accountText", func w = SettlementLib.accountText(w.account))
        .payload("setAt", func w = w.setAt)
        .payload("setBy", func w = w.setBy)
        .ownedByWith("token", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<OwnerRevenueTypes.WalletChange>("walletChange", func() = mintRevenue.walletChanges.values(), "WalletChange", "id")
        .sample(walletChangeSample)
        .payload("id", func c = c.id)
        .payload("token", func c = attemptTokenText(c.token))
        .payload("oldAccountText", func c = optAccountText(c.oldAccount))
        .payload("newOwner", func c = c.newAccount.owner)
        .payload("newAccountText", func c = SettlementLib.accountText(c.newAccount))
        .payload("at", func c = c.at)
        .payload("by", func c = c.by)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<OwnerRevenueTypes.TokenSettlement>("revenueSettlement", func() = mintRevenue.settlements.values(), "RevenueSettlement", "token")
        .sample(tokenSettlementSample)
        .payload("token", func s = attemptTokenText(s.token))
        .payload("status", func s = settlementStatusText(s.status))
        .payload("destinationText", func s = optAccountText(s.destination))
        .payload("legCount", func s = s.legs.size())
        .payload("ownerAmount", func s = legsTotal(s.legs, true))
        .payload("feeAmount", func s = legsTotal(s.legs, false))
        .payload("startedAt", func s = s.startedAt)
        .payload("completedAt", func s = s.completedAt)
        .payload("lastError", func s = s.lastError)
        .ownedByWith("token", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<OwnerRevenueTypes.FeeMove>("feeMove", func() = mintRevenue.feeMoves.values(), "FeeMove", "n")
        .sample(feeMoveSample)
        .payload("n", func m = m.n)
        .payload("token", func m = attemptTokenText(m.token))
        .payload("purpose", func m = feeMovePurposeText(m.purpose))
        .payload("conversionId", func m = feeMoveConversion(m.purpose))
        .payload("amount", func m = m.attempt.request.amount)
        .payload("fee", func m = m.attempt.request.fee)
        .payload("attempt", func m = m.attempt.attempt)
        .payload("memo", func m = m.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func m = m.attempt.created_at_time)
        .payload("sends", func m = m.attempt.sends)
        .payload("lastError", func m = m.attempt.lastError)
        .payload("outcome", func m = attemptOutcomeText(m.attempt.outcome))
        .payload("status", func m = ownerSendStatusText(m.status))
        .payload("block", func m = ownerSendBlock(m.status))
        .payload("createdAt", func m = m.createdAt)
        .payload("updatedAt", func m = m.updatedAt)
        .ownedByWith("n", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<MintFeeTypes.MintFeeRouting>("mintFeeRouting", func() = mintFees.routings.values(), "MintFeeRouting", "id")
        .sample(mintFeeRoutingSample)
        .payload("id", func r = r.id)
        .payload("at", func r = r.at)
        .payload("conversionId", func r = r.conversionId)
        .payload("token", func r = attemptTokenText(r.token))
        .payload("poolId", func r = r.poolId)
        .payload("feeAmount", func r = r.feeAmount)
        .payload("halfA", func r = r.halfA)
        .payload("halfB", func r = r.halfB)
        .payload("toLps", func r = r.toLps)
        .payload("toSetAside", func r = r.toSetAside)
        .payload("lpCount", func r = r.lpCount)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<MintFeeBalanceRow>("mintFeeBalance", func() = mintFeeBalanceRows().values(), "MintFeeBalance", "key")
        .sample(mintFeeBalanceSample)
        .payload("key", func r = r.key)
        .payload("owner", func r = r.owner)
        .payload("token", func r = r.token)
        .payload("claimable", func r = r.claimable)
        .payload("claimed", func r = r.claimed)
        .ownedByWith("owner", func(caller, owner) = isAppAdmin(caller) or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<MintFeeTypes.MintFeeClaim>("mintFeeClaim", func() = mintFees.claims.values(), "MintFeeClaim", "n")
        .sample(mintFeeClaimSample)
        .payload("n", func c = c.n)
        .payload("owner", func c = c.owner)
        .payload("token", func c = attemptTokenText(c.token))
        .payload("amount", func c = c.amount)
        .payload("createdAt", func c = c.createdAt)
        .payload("attempt", func c = c.attempt.attempt)
        .payload("memo", func c = c.attempt.memo.decodeUtf8())
        .payload("createdAtTime", func c = c.attempt.created_at_time)
        .payload("sends", func c = c.attempt.sends)
        .payload("lastError", func c = c.attempt.lastError)
        .payload("outcome", func c = attemptOutcomeText(c.attempt.outcome))
        .payload("status", func c = mintFeeClaimStatusText(c.status))
        .payload("block", func c = mintFeeClaimBlock(c.status))
        .ownedByWith("owner", func(caller, owner) = isAppAdmin(caller) or owner == #text(caller.toText()))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<MintFeeTypes.SetAside>("setAsideAmount", func() = mintFees.setAside.values(), "SetAsideAmount", "token")
        .sample(setAsideSample)
        .payload("token", func s = attemptTokenText(s.token))
        .payload("amount", func s = s.amount)
        .payload("totalReceived", func s = s.totalReceived)
        .payload("totalInjected", func s = s.totalInjected)
        .payload("lastInjectionAt", func s = s.lastInjectionAt)
        .public_()
        .build(),
      OQL.Entity.manual<MintFeeTypes.LiquidityInjection>("liquidityInjection", func() = mintFees.injections.values(), "LiquidityInjection", "id")
        .sample(injectionSample)
        .payload("id", func i = i.id)
        .payload("token", func i = attemptTokenText(i.token))
        .payload("poolId", func i = i.poolId)
        .payload("amountIn", func i = i.amountIn)
        .payload("swapAmountIn", func i = i.swapAmountIn)
        .payload("pairAmountIn", func i = i.pairAmountIn)
        .payload("venue", func i = venueText(i.venue))
        .payload("minTttiOut", func i = i.minTttiOut)
        .payload("tttiReceived", func i = i.tttiReceived)
        .payload("liquidityShares", func i = i.liquidityShares)
        .payload("used0", func i = i.used0)
        .payload("used1", func i = i.used1)
        .payload("status", func i = injectionStatusText(i.status))
        .payload("error", func i = i.error)
        .payload("startedAt", func i = i.startedAt)
        .payload("updatedAt", func i = i.updatedAt)
        .public_()
        .build(),
      // --- DEX lot 5: ICPSwap router ------------------------------------------
      OQL.Entity.manual<RouterTypes.RoutedSwap>("routedSwap", func() = router.swaps.values(), "RoutedSwap", "id")
        .sample(routedSwapSample)
        .payload("id", func s = s.id)
        .payload("owner", func s = s.owner)
        .payload("createdAt", func s = s.createdAt)
        .payload("updatedAt", func s = s.updatedAt)
        .payload("route", func s = routeText(s.route))
        .payload("routePool", func s = routePool(s.route))
        .payload("tokenIn", func s = DexLib.tokenSymbol(s.tokenIn))
        .payload("tokenOut", func s = DexLib.tokenSymbol(s.tokenOut))
        .payload("amountIn", func s = s.amountIn)
        .payload("amountOut", func s = s.amountOut)
        .payload("minAmountOut", func s = s.minAmountOut)
        .payload("deadline", func s = s.deadline)
        .payload("feeTotal", func s = routeFeeTotal(s.fees))
        .payload("protocolFee", func s = routeProtocolFee(s.fees))
        .payload("nativePoolId", func s = s.nativePoolId)
        .payload("stage", func s = routedStageText(s.stage))
        .payload("status", func s = routedStatusText(s.status))
        .payload("memo", func s = switch (s.move) { case (?a) a.memo.decodeUtf8(); case null null })
        .payload("lastError", func s = s.lastError)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<RouterTypes.RouterFeeTotals>("routerFeeTotals", func() = router.feeTotals.values(), "RouterFeeTotals", "poolId")
        .sample(routerFeeSample)
        .payload("poolId", func t = t.poolId)
        .payload("collected0", func t = t.collected0)
        .payload("collected1", func t = t.collected1)
        .payload("lpPaid0", func t = t.lpPaid0)
        .payload("lpPaid1", func t = t.lpPaid1)
        .payload("lpSetAside0", func t = t.lpSetAside0)
        .payload("lpSetAside1", func t = t.lpSetAside1)
        .payload("permanent0", func t = t.permanent0)
        .payload("permanent1", func t = t.permanent1)
        .payload("waiting0", func t = switch (router.setAside.get(t.poolId)) { case (?sa) sa.amount0; case null 0 })
        .payload("waiting1", func t = switch (router.setAside.get(t.poolId)) { case (?sa) sa.amount1; case null 0 })
        .ownedByWith("poolId", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexTypes.RefusedDepositFeed>("refusedDepositFeed", func() = refusedDepositFeeds.values(), "RefusedDepositFeed", "requestId")
        .sample(refusedDepositFeedSample)
        .payload("requestId", func r = r.requestId)
        .payload("poolId", func r = r.poolId)
        .payload("amount", func r = r.amount)
        .payload("fee", func r = r.fee)
        .payload("block", func r = r.block)
        .payload("at", func r = r.at)
        .ownedByWith("requestId", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<RouterTypes.RouterRedirect>("routerRedirect", func() = router.redirected.values(), "RouterRedirect", "poolId")
        .sample(routerRedirectSample)
        .payload("poolId", func r = r.poolId)
        .payload("redirected0", func r = r.redirected0)
        .payload("redirected1", func r = r.redirected1)
        .payload("lastTargetPoolId", func r = r.lastTargetPoolId)
        .payload("lastAt", func r = r.lastAt)
        .ownedByWith("poolId", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      // --- DEX lot 6: reserve check ------------------------------------------
      OQL.Entity.manual<DexReserveTypes.Mismatch>("dexReserveMismatch", func() = dexReserve.history.values(), "DexReserveMismatch", "id")
        .sample(dexReserveMismatchSample)
        .payload("id", func m = m.id)
        .payload("at", func m = m.at)
        .payload("token", func m = DexLib.tokenSymbol(m.token))
        .payload("internalTotal", func m = m.internalTotal)
        .payload("ledgerTotal", func m = m.ledgerTotal)
        .ownedByWith("id", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexReserveTypes.TokenReserveResult>("dexReserveResult", func() = dexReserveResultRows().values(), "DexReserveResult", "token")
        .sample(dexReserveResultSample)
        .payload("token", func r = DexLib.tokenSymbol(r.token))
        .payload("internalTotal", func r = r.internalTotal)
        .payload("ledgerTotal", func r = r.ledgerTotal)
        .payload("difference", func r = r.difference)
        .payload("status", func r = dexReserveStatusText(r.status))
        .ownedByWith("token", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      OQL.Entity.manual<DexPauseRow>("dexPause", func() = dexPauseRows().values(), "DexPause", "key")
        .sample(dexPauseSample)
        .payload("key", func r = r.key)
        .payload("paused", func r = r.paused)
        .payload("reasonToken", func r = r.reasonToken)
        .payload("reasonInternalTotal", func r = r.reasonInternalTotal)
        .payload("reasonLedgerTotal", func r = r.reasonLedgerTotal)
        .payload("pausedAt", func r = r.pausedAt)
        .payload("resumedBy", func r = r.resumedBy)
        .payload("resumedAt", func r = r.resumedAt)
        .ownedByWith("key", func(caller, _) = isAppAdmin(caller))
        .controllerOrScoped()
        .build(),
      // --- DEX lot 7: indicators (stored hourly snapshot, public) ------------
      OQL.Entity.manual<DexIndicatorTypes.IndicatorRow>("dexIndicator", func() = DexIndicatorsLib.rows(dexIndicators).values(), "DexIndicator", "poolId")
        .sample(dexIndicatorSample)
        .payload("poolId", func r = r.poolId)
        .payload("computedAt", func r = r.computedAt)
        .payload("token0Symbol", func r = r.token0Symbol)
        .payload("token1Symbol", func r = r.token1Symbol)
        .payload("isOpen", func r = r.isOpen)
        .payload("reserve0", func r = r.reserve0)
        .payload("reserve1", func r = r.reserve1)
        .payload("valueUsdE8", func r = r.valueUsdE8)
        .payload("depth1PctToken0In", func r = r.depth1PctToken0In)
        .payload("depth1PctToken1In", func r = r.depth1PctToken1In)
        .payload("depth2PctToken0In", func r = r.depth2PctToken0In)
        .payload("depth2PctToken1In", func r = r.depth2PctToken1In)
        .payload("depth5PctToken0In", func r = r.depth5PctToken0In)
        .payload("depth5PctToken1In", func r = r.depth5PctToken1In)
        .payload("totalShares", func r = r.totalShares)
        .payload("firmShares", func r = r.firmShares)
        .payload("freeShares", func r = r.freeShares)
        .payload("firmBps", func r = r.firmBps)
        .payload("freeBps", func r = r.freeBps)
        .payload("unlockThisWeekShares", func r = r.unlockThisWeekShares)
        .payload("unlock30dShares", func r = r.unlock30dShares)
        .payload("unlock90dShares", func r = r.unlock90dShares)
        .payload("unlock1yShares", func r = r.unlock1yShares)
        .payload("unlockOver1yShares", func r = r.unlockOver1yShares)
        .payload("permanentShares", func r = r.permanentShares)
        .payload("positionCount", func r = r.positionCount)
        .payload("largestPositionBps", func r = r.largestPositionBps)
        .payload("topFiveBps", func r = r.topFiveBps)
        .payload("permanentProtocolBps", func r = r.permanentProtocolBps)
        .payload("swaps24h", func r = r.swaps24h)
        .payload("volume0In24h", func r = r.volume0In24h)
        .payload("volume1In24h", func r = r.volume1In24h)
        .payload("volumeUsdE8In24h", func r = r.volumeUsdE8In24h)
        .payload("swaps7d", func r = r.swaps7d)
        .payload("volume0In7d", func r = r.volume0In7d)
        .payload("volume1In7d", func r = r.volume1In7d)
        .payload("volumeUsdE8In7d", func r = r.volumeUsdE8In7d)
        .payload("fees7dCollected0", func r = r.fees7dCollected0)
        .payload("fees7dCollected1", func r = r.fees7dCollected1)
        .payload("feesCumulativeCollected0", func r = r.feesCumulativeCollected0)
        .payload("feesCumulativeCollected1", func r = r.feesCumulativeCollected1)
        .payload("observedFeeToLiquidityBps", func r = r.observedFeeToLiquidityBps)
        .public_()
        .build(),
      OQL.Entity.manual<DexActivityRow>("dexSwapActivity", func() = dexActivityRows().values(), "DexSwapActivity", "key")
        .sample(dexActivitySample)
        .payload("key", func r = r.key)
        .payload("poolId", func r = r.poolId)
        .payload("hour", func r = r.hour)
        .payload("swapCount", func r = r.swapCount)
        .payload("volume0", func r = r.volume0)
        .payload("volume1", func r = r.volume1)
        .payload("fee0", func r = r.fee0)
        .payload("fee1", func r = r.fee1)
        .public_()
        .build(),
    ];
  });
  include ApiDocMixin();

  // Persists every filling pool that now reaches the launch target at the
  // usable stored rates (absent or expired rates open nothing).
  func openReadyPools() {
    ignore DexLib.openReadyPools(dex, ProtocolFeesLib.rateOf(protocolFeeContext, Time.now()));
  };

  // Runs on every install and upgrade: re-certify the ICRC-3 tip so
  // icrc3_get_tip_certificate works immediately after an upgrade.
  IcrcLib.certifyTip(ledger);

  // Runs on every install and upgrade: re-arm the hourly ICP/USD rate timer.
  OracleLib.startTimer<system>(oracle, transform, openReadyPools);

  // Runs on every install and upgrade: re-arm the BTC/USDC/USDT rate timers.
  OracleLib.startTokenTimers<system>(tokenRates, transform, openReadyPools);

  // Runs on every install and upgrade: a 1-minute sweep persists the opening
  // of filling pools after a rate stored outside the timers (admin refresh).
  ignore Timer.recurringTimer<system>(#seconds 60, func() : async () { openReadyPools() });

  // Runs on every install and upgrade: re-arm the 6-hour cycles top-up timer
  // (also records the cycles sample and adjusts the cycles share once a day).
  CyclesReserveLib.startTimer<system>(cyclesReserve, cyclesAutonomy, reserveLock, canisterPrincipal);

  // Runs on every install and upgrade (mint revenue correction): price samples
  // (5 min), 10-minute DL / MF retries and the 10-minute fee recycling and
  // liquidity injection pass. No DC batch and no weekly allocation timer (DC,
  // dynamic cycles share and weekly allocation stay as read-only history).
  ProtocolFeesLib.startTimers<system>(weeklyContext);

  // Runs on every install and upgrade: read canister_info now, then daily.
  CanisterInfoLib.startTimer<system>(canisterInfo, canisterPrincipal);

  // Runs on every install and upgrade: re-arm the BTC deposit timer (minter
  // info refresh, background update_balance of every stable BTC address and
  // purchase finalizations).
  BtcDepositLib.startTimer<system>(btcDeposits, btcPurchaseContext, purchasesInFlight);

  // Runs on every install and upgrade: re-arm the 10-minute retry timer
  // (FW / SH / RF, then owner sends OW and the one-time treasury sweep SR + OW,
  // which run before the pause check; owner sends follow the pause).
  RetryLib.startTimer<system>(transferContext);
  RetryLib.startDexTimer<system>(dexContext);

  // Mint revenue routing: 10-minute one-time settlement pass, re-armed on
  // every install and upgrade.
  SettlementLib.startTimer<system>(settlementContext);

  // DEX lot 6: hourly reserve check, re-armed on every install and upgrade.
  DexReserveLib.startReserveTimer<system>(dexReserveContext);

  // DEX lot 7: the hourly snapshot timer is re-armed on every install and
  // upgrade and runs once shortly after start when no snapshot exists.
  DexIndicatorsLib.startTimer<system>(dexIndicatorsContext);

  // Runs on every install and upgrade (DEX lot 5): every 10 minutes, pays the
  // set-aside 70 % of the router's 0.1 % to native pools that now have LPs.
  ignore Timer.recurringTimer<system>(
    #seconds(RetryLib.TIMER_INTERVAL_SECONDS),
    func() : async () {
      RouterLib.paySetAside(routerContext);
    },
  );

  // Runs on every install and upgrade: re-arm the 10-minute buyback payout
  // retry (resend within 23 h, new attempt after a ledger Err, under the
  // buyback lock).
  ignore Timer.recurringTimer<system>(
    #seconds(RetryLib.TIMER_INTERVAL_SECONDS),
    func() : async () {
      await BuybackLib.runRetries({ store = buybacks; inFlight = buybacksInFlight; ledger; canister = canisterPrincipal; retry }, sale);
    },
  );
};
