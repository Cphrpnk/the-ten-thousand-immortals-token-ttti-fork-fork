/** /wallet hash that opens the Receive dialog on a ledger: receive-<ledgerId>. */
export const WALLET_RECEIVE_HASH_PREFIX = "receive-";
/** /wallet hash that scrolls to the BTC → ckBTC conversion. */
export const WALLET_BTC_HASH = "wallet-btc";

/**
 * Where finishSetup goes: "buy" (default, /buy + mint card), "stay" (no
 * navigation) or /wallet with the given hash.
 */
export type SetupExit = "buy" | "stay" | { walletHash: string };
