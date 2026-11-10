import { defineSplitDict } from "../core/dict";
import type en from "../split/addressBook/en";

/**
 * Address book, contact card, Send suggestions, transfer memo and ICRC-2
 * approvals. English is authoritative. Principals, amounts, fees, dates and
 * token symbols are passed in already formatted and never translated.
 * Split per language: src/i18n/split/addressBook/<lang>.ts.
 */
export const ADDRESS_BOOK_TEXT = defineSplitDict<typeof en>("addressBook");
