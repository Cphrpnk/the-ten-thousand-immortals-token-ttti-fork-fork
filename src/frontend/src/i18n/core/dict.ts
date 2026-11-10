import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { LANGS, type Lang, getLang, setLang, subscribeLang } from "./lang";
import { readSplit } from "./loader";

/** A dictionary value: plain text, or a function for interpolated values / links. */
export type DictEntry = string | ((...args: never[]) => ReactNode);

/** Shape of one language's strings. */
export type DictShape = Record<string, DictEntry>;

/** Strings of every supported language, keyed by Lang. */
export type Dict<T extends DictShape> = { readonly [L in Lang]: T };

/**
 * Declare a dictionary. The English object fixes the keys and value types;
 * every other language must provide exactly the same keys with compatible
 * values (a missing or extra key fails the typecheck).
 */
export function defineDict<T extends DictShape>(
  dict: { en: T } & {
    [L in Exclude<Lang, "en">]: NoInfer<{ [K in keyof T]: T[K] }>;
  },
): Dict<T> {
  return dict;
}

/**
 * Declare a dictionary split into one file per language under
 * src/i18n/split/<name>/<lang>.ts(x) (default export = that language's
 * strings). `T` is the shape of the English file: `typeof en`, imported with
 * `import type en from "../split/<name>/en"`. Each language is downloaded on
 * demand; LanguageProvider holds rendering until the active language and
 * English are loaded, so reading `dict[lang]` is synchronous like defineDict.
 * Do not read a split dictionary while a module is being evaluated.
 */
export function defineSplitDict<T extends DictShape>(name: string): Dict<T> {
  const dict = {} as { [L in Lang]: T };
  for (const lang of LANGS) {
    Object.defineProperty(dict, lang, {
      enumerable: true,
      get: () => readSplit<T>(name, lang),
    });
  }
  return dict;
}

/** Strings of `dict` in `lang` (default: the active language). Non-React code. */
export function pickDict<T extends DictShape>(
  dict: Dict<T>,
  lang: Lang = getLang(),
): T {
  return dict[lang];
}

export interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/** Active language; the calling component re-renders when it changes. */
export function useLanguage(): LanguageState {
  const lang = useSyncExternalStore(subscribeLang, getLang, getLang);
  return { lang, setLang };
}

/** Strings of `dict` in the active language; re-renders on a switch. */
export function useDict<T extends DictShape>(dict: Dict<T>): T {
  const { lang } = useLanguage();
  return dict[lang];
}
