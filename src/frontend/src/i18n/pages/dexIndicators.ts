import { defineSplitDict } from "../core/dict";
import type en from "../split/dexIndicators/en";

/**
 * Public Pools page, Indicators section (DEX lot 7): proof of reserves, depth,
 * liquidity, unlock schedule, concentration, activity and fee sharing.
 * English is authoritative. Amounts, symbols, dates and percentages are passed
 * in already formatted for the active language. Wording stays factual.
 * Split per language: src/i18n/split/dexIndicators/<lang>.ts.
 */
export const DEX_INDICATORS_TEXT = defineSplitDict<typeof en>("dexIndicators");
