import { defineSplitDict } from "../core/dict";
import type en from "../split/whitePaper/en";

/**
 * White paper page interface and corrected-edition section 01 "Read this first".
 * Sections 02 to 07 stay in English in every language.
 */
export const WHITE_PAPER_TEXT = defineSplitDict<typeof en>("whitePaper");
