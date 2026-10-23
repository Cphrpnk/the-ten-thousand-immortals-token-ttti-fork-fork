import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { type Lang, getLang, setLang, subscribeLang } from "./lang";

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
