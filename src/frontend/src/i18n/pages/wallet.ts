import { defineSplitDict } from "../core/dict";
import type enSendPercent from "../split/sendPercent/en";
import type en from "../split/wallet/en";
import type enExplorer from "../split/walletExplorer/en";

/**
 * Wallet page and its panels (components/wallet). English is authoritative.
 * Principals, account IDs, amounts, fees and token symbols are passed in and
 * never translated.
 * Split per language: src/i18n/split/wallet/<lang>.ts.
 */
export const WALLET_TEXT = defineSplitDict<typeof en>("wallet");

/**
 * Wallet explorer labels: purchase history blocks, sends, BTC to ckBTC.
 * Split per language: src/i18n/split/walletExplorer/<lang>.ts.
 */
export const WALLET_EXPLORER_TEXT =
  defineSplitDict<typeof enExplorer>("walletExplorer");

/**
 * Percentage bar of the send forms (wallet Send dialog and Transfer page).
 * A plain transfer keeps one ledger fee out of the balance. Amounts and fees
 * are passed in already formatted in the active language's number format.
 * Split per language: src/i18n/split/sendPercent/<lang>.ts.
 */
export const SEND_PERCENT_TEXT =
  defineSplitDict<typeof enSendPercent>("sendPercent");
