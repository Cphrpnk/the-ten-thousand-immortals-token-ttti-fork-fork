/**
 * i18n core (dependency-free). English is authoritative.
 *
 * Convention:
 * - Each page owns a dictionary at src/i18n/pages/<page>.ts (use .tsx when an
 *   entry returns JSX). Shared text lives in src/i18n/common.
 * - Declare it with defineDict({ en: {...}, fr: {...}, es: {...},
 *   "zh-Hans": {...}, "pt-BR": {...}, ko: {...}, "pa-Guru": {...} }); every
 *   language must have exactly the en keys, so a missing translation fails
 *   `pnpm typecheck`. Quote the hyphenated keys.
 * - Dates and numbers: format with toIntlLocale(lang) (LOCALE_BY_LANG is the
 *   single mapping) or formatNumber(value, options, lang?). Values stay the
 *   same; only their local notation changes.
 * - Values are strings, functions for interpolated values
 *   (`(amount: string) => \`Minimum ${amount}\``), or functions returning
 *   ReactNode for text with links (`(link: ReactNode) => <>Read {link}.</>`).
 * - In components: `const t = useDict(PAGE_TEXT)`. In hooks/lib helpers and
 *   event handlers: `pickDict(PAGE_TEXT)` or `getLang()`.
 * - Technical values (canister IDs, rates, fees, amounts, token symbols, URLs)
 *   are passed in or copied identically; never translate them.
 * - A new language: add it to Lang/LANGS in lang.ts, then add its entries to
 *   every dictionary (the typecheck lists each one missing).
 */
export {
  type Lang,
  LANGS,
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  LOCALE_BY_LANG,
  toIntlLocale,
  formatNumber,
  isLang,
  detectBrowserLang,
  getLang,
  setLang,
  subscribeLang,
} from "./lang";
export {
  type Dict,
  type DictEntry,
  type DictShape,
  type LanguageState,
  defineDict,
  pickDict,
  useDict,
  useLanguage,
} from "./dict";
export { LanguageProvider } from "./LanguageProvider";
