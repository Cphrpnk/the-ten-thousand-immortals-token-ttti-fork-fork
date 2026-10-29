import type { ReactNode } from "react";
import { useDexTokens } from "../../hooks/useDex";
import { usePublicDexPause } from "../../hooks/useDexReserve";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/** True while the public DEX pause status reports paused. */
export function useDexPaused(): boolean {
  return usePublicDexPause().data?.paused === true;
}

/** Notice shown at the top of the pools page while the DEX is paused. */
export function DexPausedNotice() {
  const t = useDict(DEX_TEXT);
  const pause = usePublicDexPause();
  const tokens = useDexTokens();
  if (!pause.data?.paused) return null;
  const reason = pause.data.reasonToken;
  const symbol = reason
    ? (tokens.data?.find((info) => info.token === reason)?.symbol ?? reason)
    : "";
  return (
    <div
      className="callout-danger flex max-w-2xl flex-col gap-1 px-3 py-2 text-sm"
      aria-live="polite"
      data-ocid="pools.paused_notice"
    >
      <p className="font-medium">{t.dexPausedTitle}</p>
      <p>{t.dexPausedNotice(symbol)}</p>
    </div>
  );
}

/**
 * Wraps a control that is disabled while the DEX is paused so the reason shows
 * on hover and keyboard focus; renders the child unchanged otherwise.
 */
export function DexPausedHint({
  paused,
  className,
  children,
}: {
  paused: boolean;
  className?: string;
  children: ReactNode;
}) {
  const t = useDict(DEX_TEXT);
  if (!paused) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex", className)}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the disabled button cannot take focus, so the wrapper exposes the tooltip.
          tabIndex={0}
          title={t.dexPausedTooltip}
          data-ocid="pools.paused_hint"
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{t.dexPausedTooltip}</TooltipContent>
    </Tooltip>
  );
}
