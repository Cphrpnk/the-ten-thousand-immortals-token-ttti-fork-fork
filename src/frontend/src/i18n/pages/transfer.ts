import { defineSplitDict } from "../core/dict";
import type en from "../split/transfer/en";
import type enExplorer from "../split/transferExplorer/en";

/**
 * Transfer page (pages/TransferPage.tsx). English is authoritative.
 * Amounts, fees, principals and token symbols are passed in unchanged.
 * Split per language: src/i18n/split/transfer/<lang>.ts.
 */
export const TRANSFER_TEXT = defineSplitDict<typeof en>("transfer");

/**
 * Transfer page explorer labels: block number shown after a transfer.
 * Split per language: src/i18n/split/transferExplorer/<lang>.ts.
 */
export const TRANSFER_EXPLORER_TEXT =
  defineSplitDict<typeof enExplorer>("transferExplorer");

export type TransferText = typeof en;

/** Percentage-bar labels of the Transfer form: the shared send-form texts. */
export { SEND_PERCENT_TEXT as TRANSFER_PERCENT_TEXT } from "./wallet";
