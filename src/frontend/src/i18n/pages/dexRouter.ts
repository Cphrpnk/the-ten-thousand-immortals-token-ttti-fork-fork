import { defineSplitDict } from "../core/dict";
import type en from "../split/dexRouter/en";

/**
 * DEX lot 5: routed swap (native pool or ICPSwap) in the swap dialog.
 * English is authoritative. Amounts, percentages and routes are passed in
 * already formatted for the active language.
 * Split per language: src/i18n/split/dexRouter/<lang>.ts.
 */
export const ROUTER_TEXT = defineSplitDict<typeof en>("dexRouter");
