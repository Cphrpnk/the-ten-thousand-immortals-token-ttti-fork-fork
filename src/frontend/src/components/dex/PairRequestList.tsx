import type { PairRequestView } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  feeTierLabel,
  formatDexDate,
  refundStatusLabel,
  requestStatusLabel,
} from "./dexFormat";

const STATUS_STYLES = {
  pending: "border-border text-muted-foreground",
  approved: "border-foreground/30 text-foreground",
  refused: "border-destructive/50 text-destructive",
} as const;

const SKELETONS = Array.from({ length: 3 }, (_, i) => `request-skeleton-${i}`);

export function PairRequestList({
  title,
  requests,
  loading,
  ocid,
}: {
  title: string;
  requests: Array<PairRequestView> | undefined;
  loading: boolean;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const sorted = [...(requests ?? [])].sort((a, b) =>
    a.id === b.id ? 0 : a.id > b.id ? -1 : 1,
  );

  return (
    <section className="flex flex-col gap-4" data-ocid={`${ocid}.section`}>
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      {loading ? (
        <div
          className="flex flex-col gap-2"
          data-ocid={`${ocid}.loading_state`}
        >
          {SKELETONS.map((id) => (
            <Skeleton key={id} className="h-14 w-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p
          className="border-t border-border pt-4 text-sm text-muted-foreground"
          data-ocid={`${ocid}.empty_state`}
        >
          {t.noRequests}
        </p>
      ) : (
        <ul
          className="flex flex-col border-t border-border"
          data-ocid={`${ocid}.list`}
        >
          {sorted.map((request, i) => {
            const kind = request.status.__kind__;
            return (
              <li
                key={request.id.toString()}
                className="grid gap-x-6 gap-y-2 border-b border-border py-4 text-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)]"
                data-ocid={`${ocid}.item.${i + 1}`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg break-words">
                    {request.token.symbol}/{request.counter.symbol}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {request.token.name} · {feeTierLabel(t, request.feeTier)} ·{" "}
                    {formatDexDate(request.createdAt, lang)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    {t.ledgerId}
                  </span>
                  <span className="font-mono text-xs break-all">
                    {request.token.ledgerId.toText()}
                  </span>
                  {request.message && (
                    <span className="text-xs text-muted-foreground break-words">
                      {request.message}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col items-start gap-1.5">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs",
                        STATUS_STYLES[kind],
                      )}
                      data-ocid={`${ocid}.status.${i + 1}`}
                    >
                      {requestStatusLabel(t, request.status)}
                    </span>
                    {request.copiedSymbol && (
                      <span
                        className="rounded-full border border-destructive/50 px-2.5 py-0.5 text-xs text-destructive"
                        data-ocid={`${ocid}.copied_symbol.${i + 1}`}
                      >
                        {t.copiedSymbol}
                      </span>
                    )}
                  </div>
                  {request.copiedSymbol && request.checks.copiedSymbolOf && (
                    <span className="text-xs text-muted-foreground">
                      {t.copiedSymbolOf(request.checks.copiedSymbolOf)}
                    </span>
                  )}
                  {kind === "approved" && (
                    <span
                      className="text-xs text-muted-foreground tabular-nums"
                      data-ocid={`${ocid}.refund.${i + 1}`}
                    >
                      {t.refundLabel}:{" "}
                      {refundStatusLabel(t, request.refundStatus)}
                    </span>
                  )}
                  {request.status.__kind__ === "refused" && (
                    <span className="text-xs text-muted-foreground break-words">
                      {t.refusedReason(request.status.refused.reason)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
