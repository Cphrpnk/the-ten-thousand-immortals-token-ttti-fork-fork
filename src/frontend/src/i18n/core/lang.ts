/**
 * Active-language store shared by React (useLanguage) and non-React code
 * (getLang). Detection: a saved choice in localStorage (ttti.lang) wins;
 * otherwise the first supported entry of navigator.languages (French,
 * Spanish, Simplified Chinese, Portuguese, Korean, Punjabi in Gurmukhi), else
 * English. Only an explicit setLang() call is persisted.
 */

/** BCP 47 language tags. */
export type Lang = "en" | "fr" | "es" | "zh-Hans" | "pt-BR" | "ko" | "pa-Guru";

/** Supported languages in picker order. Add a new language here first. */
export const LANGS: ReadonlyArray<Lang> = [
  "en",
  "fr",
  "es",
  "zh-Hans",
  "pt-BR",
  "ko",
  "pa-Guru",
];

export const DEFAULT_LANG: Lang = "en";

export const LANG_STORAGE_KEY = "ttti.lang";

/**
 * The single language-to-locale mapping, used for both dates and numbers.
 * pa-IN formats with Latin digits (0-9), its CLDR default.
 */
export const LOCALE_BY_LANG: { readonly [L in Lang]: string } = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  "zh-Hans": "zh-CN",
  "pt-BR": "pt-BR",
  ko: "ko-KR",
  "pa-Guru": "pa-IN",
};

/** Intl locale for `lang`, for dates and numbers alike (Intl.DateTimeFormat, Intl.NumberFormat). */
export function toIntlLocale(lang: Lang): string {
  return LOCALE_BY_LANG[lang];
}

/**
 * Number formatted in the locale of `lang` (default: the active language),
 * always with Latin digits. Pass Intl options for decimals, e.g.
 * `formatNumber(1.01, { minimumFractionDigits: 2 })`.
 */
export function formatNumber(
  value: number | bigint,
  options?: Intl.NumberFormatOptions,
  lang?: Lang,
): string {
  return new Intl.NumberFormat(toIntlLocale(lang ?? getLang()), {
    numberingSystem: "latn",
    ...options,
  }).format(value);
}

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === "string" &&
    (LANGS as ReadonlyArray<string>).includes(value)
  );
}

function readStoredLang(): Lang | null {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Supported language for one browser tag, or null when unsupported. */
function matchTag(tag: string): Lang | null {
  const t = tag.trim().replace(/_/g, "-").toLowerCase();
  if (/^en(-|$)/.test(t)) return "en";
  if (/^fr(-|$)/.test(t)) return "fr";
  if (/^es(-|$)/.test(t)) return "es";
  if (t === "zh" || /^zh-hans(-|$)/.test(t) || /^zh-(cn|sg)(-|$)/.test(t)) {
    return "zh-Hans";
  }
  if (/^pt(-|$)/.test(t)) return "pt-BR";
  if (/^ko(-|$)/.test(t)) return "ko";
  if (t === "pa" || /^pa-(in|guru)(-|$)/.test(t)) return "pa-Guru";
  return null;
}

/**
 * Language suggested by the browser: navigator.languages scanned in order;
 * fr*, es*, en* match directly; zh, zh-CN, zh-SG and zh-Hans* give zh-Hans;
 * pt and any pt-* give pt-BR; ko* gives ko; pa, pa-IN and pa-Guru* give
 * pa-Guru. Traditional Chinese (zh-TW, zh-HK, zh-Hant), Shahmukhi Punjabi
 * (pa-Arab, pa-PK) and unknown tags are skipped, falling back to English.
 */
export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const tags =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language ?? ""];
  for (const tag of tags) {
    const match = matchTag(tag ?? "");
    if (match) return match;
  }
  return DEFAULT_LANG;
}

function initialLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  return readStoredLang() ?? detectBrowserLang();
}

let current: Lang = initialLang();
const listeners = new Set<() => void>();

/** Active language, readable from hooks, lib helpers and event handlers. */
export function getLang(): Lang {
  return current;
}

/** Switch language instantly (no reload) and remember the visitor's choice. */
export function setLang(lang: Lang): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this visit.
  }
  if (lang === current) return;
  current = lang;
  for (const listener of listeners) listener();
}

export function subscribeLang(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
