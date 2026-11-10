import { defineSplitDict } from "../core/dict";
import type en from "../split/auction/en";

/**
 * Auction page (sealed-bid auction of the returned TTTI-T): summary, empty
 * state, offer form and the caller's own offers. English is authoritative;
 * the sentence "In case of conflict, the English version prevails." comes
 * from SITE_TEXT. Amounts, prices, times and token symbols are passed in
 * already formatted and never translated.
 * Split per language under i18n/split/auction/.
 */
export const AUCTION_TEXT = defineSplitDict<typeof en>("auction");
