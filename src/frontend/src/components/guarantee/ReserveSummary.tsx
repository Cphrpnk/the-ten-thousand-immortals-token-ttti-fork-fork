import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useReserveView } from "../../hooks/useGuarantee";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  formatTokenQuantity,
  formatTttiQuantity,
  formatUsdValue,
} from "../../lib/guarantee";
import { PAY_TOKEN_ORDER, payTokenSymbol } from "../../lib/token";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function Stat({
  label,
  ocid,
  accent = false,
  children,
}: {
  label: string;
  ocid: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`break-words font-mono text-lg tabular-nums ${accent ? "text-primary" : ""}`}
        data-ocid={ocid}
      >
        {children}
      </dd>
    </div>
  );
}

/** Public view of the common reserve: per token, circulation, invariant, shortfall. */
export function ReserveSummary() {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const reserve = useReserveView();

  if (reserve.isPending) {
    return (
      <div
        className="flex flex-col gap-3"
        aria-label={t.reserveLoading}
        data-ocid="guarantee.reserve.loading_state"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (reserve.isError) {
    return (
      <div
        className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
        data-ocid="guarantee.reserve.error_state"
      >
        <span>{t.reserveLoadError}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void reserve.refetch()}
          className="min-h-11 sm:min-h-9"
          data-ocid="guarantee.reserve.retry_button"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t.retryButton}
        </Button>
      </div>
    );
  }

  const view = reserve.data;
  const lines = [...view.perToken].sort(
    (a, b) =>
      PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token),
  );

  return (
    <section
      className="flex flex-col gap-6 rounded-lg border border-border bg-card p-5 md:p-6"
      aria-labelledby="guarantee-reserve-title"
      data-ocid="guarantee.reserve.card"
    >
      <h2
        id="guarantee-reserve-title"
        className="font-display text-xl tracking-wide md:text-2xl"
      >
        {t.reserveTitle}
      </h2>

      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Stat label={t.reserveTotalLabel} ocid="guarantee.reserve.total" accent>
          {formatUsdValue(view.reserveUsdE8, lang)}
        </Stat>
        <Stat label={t.circulationLabel} ocid="guarantee.reserve.circulation">
          {formatTttiQuantity(view.circulationOutside, lang)}
        </Stat>
        {lines.map((line) => (
          <Stat
            key={line.token}
            label={t.reserveTokenLabel(payTokenSymbol(line.token))}
            ocid={`guarantee.reserve.${line.token}`}
          >
            {formatUsdValue(line.valueUsdE8, lang)}
            <span className="block text-xs text-muted-foreground">
              {formatTokenQuantity(line.balance, line.token, lang)}
              {line.rateUsdE8 === undefined && (
                <> · {t.reserveRateMissing(payTokenSymbol(line.token))}</>
              )}
            </span>
          </Stat>
        ))}
        <Stat label={t.reservePerTtiLabel} ocid="guarantee.reserve.per_ttti">
          {view.reservePerTtti === undefined
            ? t.reservePerTtttiNone
            : formatUsdValue(view.reservePerTtti, lang)}
        </Stat>
        <Stat label={t.requiredLabel} ocid="guarantee.reserve.required">
          {formatUsdValue(view.requiredUsdE8, lang)}
        </Stat>
        <Stat label={t.invariantLabel} ocid="guarantee.reserve.invariant">
          <span className="font-sans text-base">
            {view.invariantHolds ? t.invariantHolds : t.invariantBroken}
          </span>
        </Stat>
        <Stat label={t.shortfallLabel} ocid="guarantee.reserve.shortfall">
          {view.shortfallUsdE8 === 0n
            ? t.shortfallNone
            : formatUsdValue(view.shortfallUsdE8, lang)}
        </Stat>
      </dl>
    </section>
  );
}
