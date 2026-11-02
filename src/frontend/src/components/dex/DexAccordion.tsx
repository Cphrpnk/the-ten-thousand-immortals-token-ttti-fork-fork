import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

/**
 * Hairline-ruled disclosure for the Pools page: a single collapsible
 * accordion, closed by default. Stack several inside a DexAccordionGroup.
 */
export function DexAccordion({
  label,
  count,
  ocid,
  children,
  className,
}: {
  label: ReactNode;
  count?: string;
  ocid: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("border-t border-border", className)}
      data-ocid={ocid}
    >
      <AccordionItem value="content" className="border-b-0">
        <AccordionTrigger
          className="min-h-12 items-center rounded-none py-3 text-sm font-normal hover:text-primary hover:no-underline"
          data-ocid={`${ocid}.toggle`}
        >
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pe-2">
            <span className="min-w-0 break-words">{label}</span>
            {count !== undefined && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {count}
              </span>
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 pt-1 pb-6">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/** Closes a stack of DexAccordion rows with a bottom hairline. */
export function DexAccordionGroup({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col border-b border-border", className)}>
      {children}
    </div>
  );
}

/** Numbered page section with the gold hairline header. */
export function PoolsSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="pools-section flex min-w-0 scroll-mt-40 flex-col gap-8 md:scroll-mt-44"
      data-ocid={`pools.${id}.section`}
    >
      <header className="admin-section-header mb-0">
        <span className="admin-section-index text-primary" aria-hidden="true">
          {String(index).padStart(2, "0")}
        </span>
        <h2
          id={headingId}
          className="font-display text-2xl tracking-wide md:text-3xl"
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

/** Pill filter buttons (aria-pressed), shared by the activity and requests lists. */
export function DexFilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  ocid,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  ocid: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2" data-ocid={ocid}>
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="filter-chip"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          data-ocid={`${ocid}.${o.value}`}
        >
          {o.label}
        </button>
      ))}
    </fieldset>
  );
}
