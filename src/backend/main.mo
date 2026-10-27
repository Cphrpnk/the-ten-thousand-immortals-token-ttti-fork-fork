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
import Iter "mo:core/Iter";
import RetryTypes "types/retry";
import RetryLib "lib/retry";
import TransferReviewApi "mixins/transfer-review-api";
import UpgradeTypes "types/upgrade-readiness";
import UpgradeReadinessApi "mixins/upgrade-readiness-api";

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

  // One lock per outgoing transfer (RetryLib.lockKey), released in a finally. Transient.
  transient let transfersInFlight = Set.empty<Text>();

  // One buyback in progress per (buyer, mass token), keyed by
  // BuybackLib.lockKey. Transient.
  transient let buybacksInFlight = Set.empty<Text>();

  // Shared lock between the top-up timer and withdrawReserveExcess. Transient.
  transient let reserveLock : CyclesReserveLib.ReserveLock = { var busy = false };

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
  include TreasuryApi(treasury, sale, ledger, accessControlState, canisterPrincipal, oracle, purchaseAcknowledgements, cyclesReserve, tokenRates, purchasesInFlight, transferContext);
  include SaleApi(sale, treasury, ledger, oracle, accessControlState, canisterPrincipal, purchaseAcknowledgements, canisterInfo, tokenRates);
  include OracleApi(oracle, accessControlState, transform, tokenRates);
  include CyclesReserveApi(cyclesReserve, reserveLock, treasury, accessControlState, canisterPrincipal);
  include BtcDepositApi(btcDeposits, btcPurchaseContext, purchasesInFlight, canisterPrincipal);
  include AddressBookApi(addressBook, canisterPrincipal);
  include BuybackApi(buybacks, buybacksInFlight, treasury, ledger, oracle, tokenRates, accessControlState, canisterPrincipal, retry, sale);
  include TransferReviewApi(transferContext, btcDeposits, accessControlState, buybacks, ledger);
  include UpgradeReadinessApi(sale, purchasesInFlight, buybacksInFlight, reserveLock, cyclesReserve, retry, reservedReconciliations, accessControlState);
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
    ];
  });
  include ApiDocMixin();

  // Runs on every install and upgrade: re-certify the ICRC-3 tip so
  // icrc3_get_tip_certificate works immediately after an upgrade.
  IcrcLib.certifyTip(ledger);

  // Runs on every install and upgrade: re-arm the hourly ICP/USD rate timer.
  OracleLib.startTimer<system>(oracle, transform);

  // Runs on every install and upgrade: re-arm the BTC/USDC/USDT rate timers.
  OracleLib.startTokenTimers<system>(tokenRates, transform);

  // Runs on every install and upgrade: re-arm the 6-hour cycles top-up timer.
  CyclesReserveLib.startTimer<system>(cyclesReserve, reserveLock, canisterPrincipal);

  // Runs on every install and upgrade: read canister_info now, then daily.
  CanisterInfoLib.startTimer<system>(canisterInfo, canisterPrincipal);

  // Runs on every install and upgrade: re-arm the BTC deposit timer (minter
  // info refresh, background update_balance of every stable BTC address and
  // purchase finalizations).
  BtcDepositLib.startTimer<system>(btcDeposits, btcPurchaseContext, purchasesInFlight);

  // Runs on every install and upgrade: re-arm the 10-minute FW / SH retry timer.
  RetryLib.startTimer<system>(transferContext);

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
