import { defineSplitDict } from "../core/dict";
import type en from "../split/walletSigning/en";

/**
 * Automatic wallet signing: errors shown after a wallet signature attempt and
 * the signer texts. English is authoritative.
 * Wallet names and principals are passed in unchanged.
 * Split per language: src/i18n/split/walletSigning/<lang>.ts.
 */
export const WALLET_SIGNING_TEXT = defineSplitDict<typeof en>("walletSigning");
