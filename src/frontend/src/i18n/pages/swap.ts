import { defineSplitDict } from "../core/dict";
import type en from "../split/swap/en";
import type enBuy from "../split/walletBuy/en";

/**
 * Wallet swap dialog (ICPSwap) and its entry points: the Mint TTTI-T header
 * button and the Onramper Buy notes. English is authoritative. Amounts,
 * symbols, canister IDs and times are passed in unchanged.
 * Split per language: src/i18n/split/swap/<lang>.ts.
 */
export const SWAP_TEXT = defineSplitDict<typeof en>("swap");

/**
 * Mint TTTI-T header button and the Onramper Buy notes of the token rows.
 * Split per language: src/i18n/split/walletBuy/<lang>.ts.
 */
export const WALLET_BUY_TEXT = defineSplitDict<typeof enBuy>("walletBuy");
