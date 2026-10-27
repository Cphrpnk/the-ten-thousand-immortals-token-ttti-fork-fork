import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Btc "../types/btc-deposit";
import BtcDepositLib "../lib/btc-deposit";
import SaleLib "../lib/presale";

// Native BTC deposits via the ckBTC minter: purchase flow (BTC -> ckBTC ->
// TTTI-T) and wallet-only flow (BTC -> ckBTC in the caller's wallet), with
// per-caller progress tracking. Existing endpoints act only on the caller; the
// *For endpoints serve the wallet path for a given owner principal.
mixin (
  btcDeposits : BtcDepositLib.BtcDepositStore,
  purchaseContext : SaleLib.PurchaseContext,
  purchasesInFlight : Set.Set<Principal>,
  canisterPrincipal : Principal,
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

  // Wallet path only (BTC -> ckBTC minted to `owner`'s own account, subaccount
  // null), for a principal known to the frontend (Plug, OISY, NFID) without a
  // signature. Rejects the anonymous principal and this canister as owner.
  func btcWalletOwnerAllowed(owner : Principal) : Bool {
    not owner.isAnonymous() and owner != canisterPrincipal;
  };

  func btcWalletOwnerRefused() : Btc.BtcDepositResult {
    #Err({ code = #anonymousCaller; message = "The anonymous principal and this canister cannot own a Bitcoin wallet deposit address" });
  };

  public shared func getBtcWalletAddressFor(owner : Principal) : async Btc.BtcDepositResult {
    if (not btcWalletOwnerAllowed(owner)) return btcWalletOwnerRefused();
    await* BtcDepositLib.walletAddress(btcDeposits, owner);
  };

  public shared func checkBtcWalletDepositFor(owner : Principal) : async Btc.BtcDepositResult {
    if (not btcWalletOwnerAllowed(owner)) return btcWalletOwnerRefused();
    await* BtcDepositLib.checkWallet(btcDeposits, owner);
  };

  // Only `owner`'s wallet-path tracking; never purchase-path data.
  public query func getBtcWalletDepositsFor(owner : Principal) : async ?Btc.DepositTracking {
    if (not btcWalletOwnerAllowed(owner)) return null;
    btcDeposits.wallets.get(owner);
  };
};
