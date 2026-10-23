import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Btc "../types/btc-deposit";
import BtcDepositLib "../lib/btc-deposit";
import SaleLib "../lib/presale";

// Native BTC deposits via the ckBTC minter: purchase flow (BTC -> ckBTC ->
// TTTI-T) and wallet-only flow (BTC -> ckBTC in the caller's wallet), with
// per-caller progress tracking. Every endpoint acts only on the caller.
mixin (
  btcDeposits : BtcDepositLib.BtcDepositStore,
  purchaseContext : SaleLib.PurchaseContext,
  purchasesInFlight : Set.Set<Principal>,
) {
  public shared ({ caller }) func getBtcPurchaseAddress() : async Btc.BtcDepositResult {
    await* BtcDepositLib.purchaseAddress(btcDeposits, purchaseContext, caller);
  };

  public shared ({ caller }) func checkBtcPurchaseDeposit() : async Btc.BtcDepositResult {
    if (caller.isAnonymous()) {
      return #Err({ code = #anonymousCaller; message = "Please sign in to check a Bitcoin deposit" });
    };
    if (purchasesInFlight.contains(caller)) {
      return #Err({ code = #purchaseInProgress; message = "A purchase is already in progress for this account; please wait for it to finish" });
    };
    purchasesInFlight.add(caller);
    try {
      await* BtcDepositLib.checkPurchase(btcDeposits, purchaseContext, caller);
    } finally {
      purchasesInFlight.remove(caller);
    };
  };

  public shared ({ caller }) func getBtcWalletAddress() : async Btc.BtcDepositResult {
    await* BtcDepositLib.walletAddress(btcDeposits, caller);
  };

  public shared ({ caller }) func checkBtcWalletDeposit() : async Btc.BtcDepositResult {
    await* BtcDepositLib.checkWallet(btcDeposits, caller);
  };

  public query ({ caller }) func getMyBtcDeposits() : async Btc.MyBtcDeposits {
    BtcDepositLib.myDeposits(btcDeposits, caller);
  };

  public query func getBtcDepositInfo() : async Btc.BtcDepositInfo {
    BtcDepositLib.depositInfo(btcDeposits);
  };
};
