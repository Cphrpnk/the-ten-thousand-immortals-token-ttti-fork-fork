/**
 * On-demand language loading for split dictionaries.
 *
 * A split dictionary lives in src/i18n/split/<name>/<lang>.ts(x), one file per
 * language, each with a default export holding that language's strings. Files
 * are discovered with import.meta.glob and loaded with dynamic import, so a
 * visitor only downloads English (the fallback) and the active language.
 *
 * Dictionaries that are not split yet keep the eager defineDict shape and are
 * unaffected by this module.
 */
import type { Lang } from "./lang";

type SplitModule = { default: unknown };

const FALLBACK_LANG: Lang = "en";
const PATH_PATTERN = /\/split\/([^/]+)\/([^/]+)\.tsx?$/;

const modules = import.meta.glob<SplitModule>("../split/*/*.{ts,tsx}");

/** lang -> dictionary name -> file loader. */
const registry = new Map<string, Map<string, () => Promise<SplitModule>>>();
for (const [path, load] of Object.entries(modules)) {
  const match = PATH_PATTERN.exec(path);
  if (!match) continue;
  const [, name, lang] = match;
  const byName = registry.get(lang) ?? new Map();
  byName.set(name, load);
  registry.set(lang, byName);
}

const names = new Set<string>();
for (const byName of registry.values()) {
  for (const name of byName.keys()) names.add(name);
}

const strings = new Map<string, unknown>();
const loadedLangs = new Set<string>();
const inflight = new Map<string, Promise<void>>();

function key(name: string, lang: string): string {
  return `${name}/${lang}`;
}

/** True when every split dictionary of `lang` is in memory (or none exists). */
export function isLanguageReady(lang: Lang): boolean {
  return loadedLangs.has(lang) || !registry.has(lang);
}

/** Loads every split dictionary of `lang`. Resolves once; rejects on a failed download. */
export function loadLanguage(lang: Lang): Promise<void> {
  if (isLanguageReady(lang)) return Promise.resolve();
  const pending = inflight.get(lang);
  if (pending) return pending;
  const byName = registry.get(lang);
  const entries = byName ? [...byName.entries()] : [];
  const task = Promise.all(
    entries.map(async ([name, load]) => {
      const mod = await load();
      strings.set(key(name, lang), mod.default);
    }),
  ).then(
    () => {
      loadedLangs.add(lang);
      inflight.delete(lang);
    },
    (error: unknown) => {
      inflight.delete(lang);
      throw error;
    },
  );
  inflight.set(lang, task);
  return task;
}

/** Loads `lang` and the English fallback. */
export async function loadLanguageWithFallback(lang: Lang): Promise<void> {
  await Promise.all([loadLanguage(lang), loadLanguage(FALLBACK_LANG)]);
}

/**
 * Strings of split dictionary `name` in `lang`, falling back to English when
 * that language's file is not in memory.
 */
export function readSplit<T>(name: string, lang: Lang): T {
  if (!names.has(name)) {
    throw new Error(`i18n: no split dictionary named "${name}"`);
  }
  const own = strings.get(key(name, lang));
  if (own !== undefined) return own as T;
  const fallback = strings.get(key(name, FALLBACK_LANG));
  if (fallback !== undefined) return fallback as T;
  throw new Error(`i18n: "${name}" is read before its language was loaded`);
}
