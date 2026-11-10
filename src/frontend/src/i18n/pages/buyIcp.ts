import { defineSplitDict } from "../core/dict";
import type en from "../split/buyIcp/en";

/**
 * Get ICP page (pages/BuyIcpPage.tsx). The token symbol ICP is never translated.
 * Split per language: src/i18n/split/buyIcp/<lang>.ts.
 */
export const BUY_ICP_TEXT = defineSplitDict<typeof en>("buyIcp");
