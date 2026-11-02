import { useEffect, useRef, useState } from "react";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";

export const POOLS_SECTION_IDS = [
  "pools",
  "indicators",
  "my-liquidity",
  "protocol",
  "requests",
] as const;
export type PoolsSectionId = (typeof POOLS_SECTION_IDS)[number];

/** Sticky jump links for the five Pools page sections; active one in gold. */
export function PoolsNav() {
  const t = useDict(DEX_TEXT);
  const [active, setActive] = useState<PoolsSectionId>("pools");
  const listRef = useRef<HTMLUListElement>(null);
  const labels: Record<PoolsSectionId, string> = {
    pools: t.navPools,
    indicators: t.navIndicators,
    "my-liquidity": t.navMyLiquidity,
    protocol: t.navProtocol,
    requests: t.navRequests,
  };

  useEffect(() => {
    const onScroll = () => {
      // The active section is the last one whose top passed the sticky bars.
      // Slightly larger than the sections' scroll-margin-top (10rem / 11rem).
      const offset = 192;
      let current: PoolsSectionId = POOLS_SECTION_IDS[0];
      for (const id of POOLS_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      setActive(
        atBottom ? POOLS_SECTION_IDS[POOLS_SECTION_IDS.length - 1] : current,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const jump = (id: PoolsSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Sections carry scroll-margin-top for the header + sticky nav.
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  // Keep the active link visible inside the horizontally scrolling bar
  // (narrow screens) without moving the page vertically.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-nav-id="${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label={t.navLabel}
      className="pools-nav -mx-4 top-[4.5rem] min-w-0 px-4 md:top-20"
      data-ocid="pools.nav"
    >
      <ul
        ref={listRef}
        className="relative flex max-w-full gap-1 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {POOLS_SECTION_IDS.map((id, i) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              data-nav-id={id}
              className={cn(
                "admin-nav-link gap-2 whitespace-nowrap",
                active === id &&
                  "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
              )}
              aria-current={active === id ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                jump(id);
              }}
              data-ocid={`pools.nav.${id}`}
            >
              <span className="font-mono text-[0.6875rem] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {labels[id]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
