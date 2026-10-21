import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import DocumentTypes "types/document";

import IcrcLib "lib/icrc";
import PurchaseLib "lib/purchase";
import TreasuryLib "lib/treasury";
import OracleLib "lib/oracle";
import SaleLib "lib/presale";

import IcrcApi "mixins/icrc-api";
import IndexApi "mixins/index-api";
import ManagementApi "mixins/management-api";
import PurchaseApi "mixins/purchase-api";
import TreasuryApi "mixins/treasury-api";
import SaleApi "mixins/presale-api";
import OracleApi "mixins/oracle-api";
import WalletApi "mixins/wallet-api";
import OqlApi "mixins/oql-api";
import ApiDocMixin "mixins/api-doc";
import DocumentApi "mixins/document-api";
import SetupTypes "types/setup";
import SaleTypes "types/presale";
import SetupApi "mixins/setup-api";

actor TTTIToken {
  // --- Stable state (initialized by the migration chain) ---------------------

  let ledger : IcrcLib.Ledger;
  let profileState : PurchaseLib.ProfileState;
  let treasury : TreasuryLib.TreasuryStore;
  let oracle : OracleLib.OracleStore;
  let sale : SaleLib.SaleStore;
  let accessControlState : AccessControl.AccessControlState;
  let documentState : DocumentTypes.DocumentState;
  let setupStatuses : SetupTypes.SetupStore;
  // Per principal: when the six purchase acknowledgements were accepted.
  let purchaseAcknowledgements : SaleTypes.AcknowledgementStore;

  // The canister's own principal: the spender the frontend must approve for
  // the ICRC-2 icrc2_transfer_from in the treasury conversion. Transient.
  transient let canisterPrincipal = Principal.fromActor(TTTIToken);

  // --- Composition -----------------------------------------------------------

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();
  include DocumentApi(documentState, accessControlState);

  include IcrcApi(ledger, canisterPrincipal);
  include IndexApi(ledger, canisterPrincipal);
  include ManagementApi(ledger, accessControlState, canisterPrincipal);
  include PurchaseApi(profileState);
  include TreasuryApi(treasury, sale, ledger, accessControlState, canisterPrincipal, oracle, purchaseAcknowledgements);
  include SaleApi(sale, treasury, ledger, oracle, accessControlState, canisterPrincipal, purchaseAcknowledgements);
  include OracleApi(oracle, accessControlState);
  include WalletApi(canisterPrincipal);
  include SetupApi(setupStatuses);
  include OqlApi(treasury, profileState.profiles, oracle, sale, ledger, canisterPrincipal, documentState, setupStatuses, purchaseAcknowledgements, accessControlState);
  include ApiDocMixin();

  // Runs on every install and upgrade: re-certify the ICRC-3 tip so
  // icrc3_get_tip_certificate works immediately after an upgrade.
  IcrcLib.certifyTip(ledger);
};
