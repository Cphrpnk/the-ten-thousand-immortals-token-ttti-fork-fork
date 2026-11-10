import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";
import Btc "../types/btc-deposit";
import BtcDepositLib "../lib/btc-deposit";
import SaleLib "../lib/presale";
import LiquidityMintLib "../lib/liquidity-mint";

// Admin recovery of a ckBTC -> TTTI-T mint that did not run on its own.
// Both endpoints take `input`: a buyer principal in text form OR the
// 64-hex-character deposit subaccount (byte 0xBD, a length byte, then that
// many principal bytes, zero padded to 32 bytes). Both inputs resolve to the
// same buyer principal. Admin only; non-admin and anonymous callers trap like
// the other admin endpoints.
mixin (
  btcDeposits : BtcDepositLib.BtcDepositStore,
  purchaseContext : SaleLib.PurchaseContext,
  mintContext : LiquidityMintLib.MintContext,
  purchasesInFlight : Set.Set<Principal>,
  accessControlState : AccessControl.AccessControlState,
  canisterPrincipal : Principal,
) {
  // An UPDATE call, not a query: it reads the real ckBTC ledger balance of the
  // deposit subaccount (inter-canister call to another subnet, which a query or
  // composite query cannot make). It changes no state beyond the cause fields
  // it may refresh on the deposit entry. Safe to repeat.
  public shared ({ caller }) func diagnoseBtcMint(input : Text) : async Btc.BtcMintDiagnosis {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can diagnose a ckBTC mint");
    };
    let buyer = switch (BtcDepositLib.buyerOfInput(input)) {
      case (#ok(p)) p;
      case (#err(message)) Runtime.trap(message);
    };
    await* BtcDepositLib.diagnose(btcDeposits, purchaseContext, mintContext, purchasesInFlight, buyer);
  };

  // Finishes the mint of the newest purchase deposit of the buyer (refund =
  // false), or opens its ckBTC refund (refund = true, explicit confirmation).
  // Safe to repeat: a done mint answers #alreadyDone, an open refund is not
  // opened twice. No external call before every check has passed.
  public shared ({ caller }) func finishBtcMint(input : Text, refund : Bool) : async Btc.FinishMintResult {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can finish a ckBTC mint");
    };
    let buyer = switch (BtcDepositLib.buyerOfInput(input)) {
      case (#ok(p)) p;
      case (#err(message)) return #refused(message);
    };
    await* BtcDepositLib.finish(btcDeposits, purchaseContext, mintContext, purchasesInFlight, buyer, refund);
  };
};
