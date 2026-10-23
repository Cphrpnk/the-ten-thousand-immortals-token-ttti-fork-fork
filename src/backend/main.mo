import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Set "mo:core/Set";
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

actor TTTIToken {
  // --- Stable state (initialized by the migration chain) ---------------------

  let ledger : IcrcLib.Ledger;
  let treasury : TreasuryLib.TreasuryStore;
  let oracle : OracleLib.OracleStore;
  // USD rates of the ck pay tokens (BTC, USDC, USDT); ICP stays in `oracle`.
  let tokenRates : OracleLib.TokenRateStore;
  let sale : SaleLib.SaleStore;
  let accessControlState : AccessControl.AccessControlState;
  // Per principal: when the six purchase acknowledgements were accepted.
  let purchaseAcknowledgements : SaleTypes.AcknowledgementStore;
  // ICP cycles reserve (share of the 1% fee on ICP purchases), top-up record
  // and withdrawal history.
  let cyclesReserve : CyclesReserveLib.CyclesReserveStore;
  // Cached canister_info (controllers, module hash) shown in Technical details.
  let canisterInfo : CanisterInfoLib.CanisterInfoStore;
  // Per-principal BTC deposit tracking (purchase and wallet flows) and the
  // cached ckBTC minter info.
  let btcDeposits : BtcDepositLib.BtcDepositStore;

  // Shared lock between the top-up timer and withdrawReserveExcess. Transient.
  transient let reserveLock : CyclesReserveLib.ReserveLock = { var busy = false; var unconfirmedTopUp = null };

  // The canister's own principal: the spender the frontend must approve for
  // the ICRC-2 icrc2_transfer_from in the treasury conversion. Transient.
  transient let canisterPrincipal = Principal.fromActor(TTTIToken);

  // One purchase in flight per principal, shared by convertDeposit /
  // convertDepositWith and the BTC deposit finalization. Transient.
  transient let purchasesInFlight = Set.empty<Principal>();

  // The ICP ledger handle used by the BTC deposit purchase context. Transient.
  transient let icpLedgerActor : TreasuryLib.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

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
  include TreasuryApi(treasury, sale, ledger, accessControlState, canisterPrincipal, oracle, purchaseAcknowledgements, cyclesReserve, tokenRates, purchasesInFlight);
  include SaleApi(sale, treasury, ledger, oracle, accessControlState, canisterPrincipal, purchaseAcknowledgements, canisterInfo, tokenRates);
  include OracleApi(oracle, accessControlState, transform, tokenRates);
  include CyclesReserveApi(cyclesReserve, reserveLock, treasury, accessControlState, canisterPrincipal);
  include BtcDepositApi(btcDeposits, btcPurchaseContext, purchasesInFlight);
  // OQL: purchase history (conversions) and BTC deposit trackings, readable
  // by controllers and app admins only; no other app data is exposed.
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
  include Expose({
    entities = [
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
        .payload("status", func c = switch (c.status) { case (#completed) "completed"; case (#failed) "failed"; case (#refunded) "refunded"; case (#refundFailed) "refundFailed" })
        .payload("timestamp", func c = c.timestamp)
        .payload("priceUsdE8", func c = c.priceUsdE8)
        .payload("usedFallback", func c = c.usedFallback)
        .payload("minted", func c = c.minted)
        .payload("fromCollector", func c = c.fromCollector)
        .payload("forward", func c = switch (c.forward) { case (#notRequired) "notRequired"; case (#pending) "pending"; case (#forwarded(_)) "forwarded"; case (#failed(_)) "failed" })
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
};
