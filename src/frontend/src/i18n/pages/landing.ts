import { defineSplitDict } from "../core/dict";
import type cap from "../split/cap/en";
import type closing from "../split/closing/en";
import type faq from "../split/faq/en";
import type hero from "../split/hero/en";
import type how from "../split/how/en";
import type mintRule from "../split/mintRule/en";
import type presale from "../split/presale/en";
import type story from "../split/story/en";
import type techBackend from "../split/techBackend/en";
import type techExplorer from "../split/techExplorer/en";
import type tokenDetails from "../split/tokenDetails/en";
import type tokenInfo from "../split/tokenInfo/en";

/**
 * Home page text (pages/LandingPage.tsx, components/landing/*,
 * components/TokenInfo.tsx). English is authoritative and word for word the
 * original copy. Numbers, fees, symbols, IDs and URLs are identical in every
 * language. Text that contains a link is split into before / link / after.
 * Split per language: src/i18n/split/<name>/<lang>.ts.
 */

/** Cap and no-burn statements, shared by Token details, Test release and FAQ. */
export const CAP_TEXT = defineSplitDict<typeof cap>("cap");

export const HERO_TEXT = defineSplitDict<typeof hero>("hero");

/** Narrative and Thermopylae epilogue. Keys double as stable React keys. */
export const STORY_TEXT = defineSplitDict<typeof story>("story");

export const TOKEN_DETAILS_TEXT =
  defineSplitDict<typeof tokenDetails>("tokenDetails");

export const TOKEN_INFO_TEXT = defineSplitDict<typeof tokenInfo>("tokenInfo");

/**
 * Fixed sentences returned in English by getTechnicalDetails. The English
 * entries are the exact backend strings; a value that matches one is shown in
 * the active language, any other value is shown as returned.
 */
export const TECH_BACKEND_TEXT =
  defineSplitDict<typeof techBackend>("techBackend");

/**
 * Mint rule (locked share m, choice A / B for the remainder, payment rule) and
 * redemption rule, shared by the Creator disclosures, the FAQ and the white
 * paper. English is authoritative.
 */
export const MINT_RULE_TEXT = defineSplitDict<typeof mintRule>("mintRule");

export const PRESALE_TEXT = defineSplitDict<typeof presale>("presale");

export const HOW_TEXT = defineSplitDict<typeof how>("how");

export const FAQ_TEXT = defineSplitDict<typeof faq>("faq");

export const CLOSING_TEXT = defineSplitDict<typeof closing>("closing");

/** Technical details explorer labels (TokenInfo, TechnicalBackend). */
export const TECH_EXPLORER_TEXT =
  defineSplitDict<typeof techExplorer>("techExplorer");
