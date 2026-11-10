import { defineSplitDict } from "../core/dict";
import type en from "../split/guarantee/en";

/**
 * Redemption screen (route /guarantee): the public common reserve, the quote
 * and the redemption open to any holder, the allowance explanation, the
 * caller's redemption history and every GuaranteeError. English is
 * authoritative; the sentence "In case of conflict, the English version
 * prevails." comes from SITE_TEXT. Amounts, USD values, rates, block indexes
 * and token symbols are passed in already formatted; never translated.
 *
 * Split per language under i18n/split/guarantee/.
 */
export const GUARANTEE_TEXT = defineSplitDict<typeof en>("guarantee");
