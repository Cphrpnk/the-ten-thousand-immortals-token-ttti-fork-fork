import type { AnyRouter } from "@tanstack/react-router";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { SITE_TEXT } from "../common/site";
import { useLanguage } from "./dict";
import { getLang } from "./lang";
import { isLanguageReady, loadLanguageWithFallback } from "./loader";

const noopSubscribe = () => () => {};

/**
 * Keeps <html lang> and document.title in sync with the active language.
 * Wrap it high in the provider stack; the language itself lives in a store,
 * so switching never remounts the tree (route and state are kept).
 * Admin pages (/admin*) stay English, so their title and html lang are English.
 */
export function LanguageProvider({
  children,
  router,
}: {
  children: ReactNode;
  router?: AnyRouter;
}) {
  const { lang } = useLanguage();
  const subscribe = useCallback(
    (onChange: () => void) =>
      router ? router.subscribe("onResolved", onChange) : noopSubscribe(),
    [router],
  );
  const pathname = useSyncExternalStore(subscribe, () =>
    router ? router.state.location.pathname : window.location.pathname,
  );
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const pageLang = isAdmin ? "en" : lang;
    document.documentElement.lang = pageLang;
    document.title = SITE_TEXT[pageLang].title;
  }, [lang, isAdmin]);

  const [ready, setReady] = useState(
    () => isLanguageReady(getLang()) && isLanguageReady("en"),
  );
  useEffect(() => {
    if (ready) return;
    let active = true;
    const release = () => {
      if (active) setReady(true);
    };
    loadLanguageWithFallback(getLang()).then(release, release);
    return () => {
      active = false;
    };
  }, [ready]);

  // Nothing renders until the active language and English are in memory, so
  // there is never a flash of untranslated text.
  return ready ? <>{children}</> : null;
}
