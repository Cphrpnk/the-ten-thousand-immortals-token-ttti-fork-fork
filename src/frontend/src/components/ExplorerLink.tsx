import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { EXPLORER_TEXT } from "../i18n/common/explorer";
import { useDict } from "../i18n/core/dict";
import type { BlockLinkTarget } from "../lib/explorer";
import { cn } from "../lib/utils";

interface ExplorerLinkProps {
  /** External URL, or a block target from lib/explorer (blockLinkTarget). */
  target: BlockLinkTarget | string;
  /** Identifier text shown unchanged (block index, txid, address, canister ID). */
  children: ReactNode;
  /** Tooltip and accessible label, e.g. EXPLORER_TEXT.viewOnIcpDashboard. */
  label: string;
  className?: string;
  /** Hide the icon (e.g. in very dense rows). */
  hideIcon?: boolean;
  "data-ocid"?: string;
}

const LINK_CLASS =
  "inline-flex max-w-full items-center gap-1 rounded-sm font-mono break-all text-foreground underline decoration-border underline-offset-4 transition-smooth hover:text-primary hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background";
const ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-muted-foreground";

/**
 * Identifier rendered as an explorer link. External links open in a new tab;
 * TTTI-T blocks link to the in-app History page through the router.
 */
export function ExplorerLink({
  target,
  children,
  label,
  className,
  hideIcon = false,
  "data-ocid": ocid,
}: ExplorerLinkProps) {
  const t = useDict(EXPLORER_TEXT);
  const resolved: BlockLinkTarget =
    typeof target === "string" ? { kind: "external", href: target } : target;

  if (resolved.kind === "history") {
    return (
      <Link
        to={resolved.to}
        hash={resolved.hash}
        title={label}
        className={cn(LINK_CLASS, className)}
        data-ocid={ocid}
      >
        <span className="min-w-0">{children}</span>
        {hideIcon ? null : (
          <ArrowUpRight className={ICON_CLASS} aria-hidden="true" />
        )}
        <span className="sr-only">{` (${label})`}</span>
      </Link>
    );
  }

  return (
    <a
      href={resolved.href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className={cn(LINK_CLASS, className)}
      data-ocid={ocid}
    >
      <span className="min-w-0">{children}</span>
      {hideIcon ? null : (
        <ExternalLink className={ICON_CLASS} aria-hidden="true" />
      )}
      <span className="sr-only">{` (${label}, ${t.newTab})`}</span>
    </a>
  );
}
