import { defineSplitDict } from "../core/dict";
import type en from "../split/setup/en";

/**
 * Guided setup flow, sign-in choice dialog and Mint TTTI-T button.
 * Product names (Plug, Internet Identity, Onramper, TTTI-T, ICP) stay identical.
 */
export const SETUP_TEXT = defineSplitDict<typeof en>("setup");
