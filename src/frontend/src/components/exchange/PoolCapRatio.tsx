import type { ReactNode } from "react";
import type { PoolCapRatioView } from "../../backend";
import { usePoolCapRatio } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { formatNumber } from "../../i18n/core/lang";
import { BUY_POOL_CAP_TEXT } from "../../i18n/pages/buy";
import { formatUsdE8 } from "../../lib/token";
import { DexAccordion } from "../dex/DexAccordion";
import { formatDexDate } from "../dex/dexFormat";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const CARD_CLASS =
  "rounded-xl border border-gold bg-gradient-surface shadow-elevated transition-smooth";

/** value ÷ scale as a localized percentage; the scale comes from the backend. */
function formatScaled(value: bigint, scale: bigint): string {
  if (scale === 0n) return "—";
  return formatNumber(Number(value) / Number(scale), {
    style: "percent",
    maximumFractionDigits: 2,
  });
}

function Row({
  label,
  ocid,
  value,
  note,
}: {
  label: string;
  ocid: string;
  value: ReactNode;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="min-w-0 tabular-nums sm:text-end" data-ocid={ocid}>
          {value}
        </dd>
      </div>
      {note !== undefined && (
        <p className="text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

function PoolCapBody({ data }: { data: PoolCapRatioView }) {
  const t = useDict(BUY_POOL_CAP_TEXT);
  const { lang } = useLanguage();
  const dash = "—";
  const usd = (value: bigint | undefined) =>
    value === undefined ? dash : formatUsdE8(value, 2);
  const ratio = (value: bigint | undefined) =>
    value === undefined ? dash : formatScaled(value, data.ratioScale);

  return (
    <>
      <dl className="flex flex-col gap-3 text-sm">
        <Row
          label={t.poolsValue}
          ocid="exchange.pool_cap.pools_value"
          value={usd(data.poolsValueUsdE8)}
          note={
            data.poolsValueUsdE8 === undefined ? t.noteNoPoolsValue : undefined
          }
        />
        <Row
          label={t.capitalisation}
          ocid="exchange.pool_cap.capitalisation"
          value={usd(data.capitalisationUsdE8)}
          note={
            data.capitalisationUsdE8 === undefined
              ? t.noteNoCapitalisation
              : undefined
          }
        />
        <Row
          label={t.currentRatio}
          ocid="exchange.pool_cap.current_ratio"
          value={ratio(data.currentRatio)}
          note={data.currentRatio === undefined ? t.noteNoRatio : undefined}
        />
        <Row
          label={t.averageRatio}
          ocid="exchange.pool_cap.average_ratio"
          value={
            data.averageRatio24h === undefined
              ? dash
              : `${ratio(data.averageRatio24h)} · ${t.samples(formatNumber(data.samples))}`
          }
          note={
            data.averageRatio24h === undefined ? t.noteNoAverage : undefined
          }
        />
        <Row
          label={t.targetRatio}
          ocid="exchange.pool_cap.target_ratio"
          value={ratio(data.targetRatio)}
        />
        <Row
          label={t.lockedShare}
          ocid="exchange.pool_cap.locked_share"
          value={formatScaled(data.lockedShare, data.lockedShareScale)}
          note={
            data.retainedRatio === undefined ? t.noteLockedDefault : undefined
          }
        />
      </dl>
      <p className="text-xs text-muted-foreground tabular-nums">
        {t.computedAt(formatDexDate(data.computedAt, lang))}
      </p>
    </>
  );
}

/**
 * Pools value versus capitalisation: the six public figures of
 * getPoolCapRatio, with the definitions in a closed accordion.
 */
export function PoolCapRatio({ className }: { className?: string }) {
  const t = useDict(BUY_POOL_CAP_TEXT);
  const query = usePoolCapRatio();

  let body: ReactNode;
  if (query.isPending) {
    body = (
      <div className="space-y-2" data-ocid="exchange.pool_cap.loading_state">
        <span className="sr-only">{t.loading}</span>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  } else if (query.isError || !query.data) {
    body = (
      <div
        className="callout-danger flex flex-col gap-2 px-3 py-2 text-sm"
        data-ocid="exchange.pool_cap.error_state"
      >
        <p>{t.loadError}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => void query.refetch()}
          data-ocid="exchange.pool_cap.retry_button"
        >
          {t.retry}
        </Button>
      </div>
    );
  } else {
    body = <PoolCapBody data={query.data} />;
  }

  return (
    <Card
      className={className ?? CARD_CLASS}
      data-ocid="exchange.pool_cap.card"
    >
      <CardHeader>
        <CardTitle className="text-base font-medium">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {body}
        <DexAccordion
          label={t.definitionsToggle}
          ocid="exchange.pool_cap.definitions"
          className="border-t"
        >
          <p className="text-xs text-muted-foreground">{t.defPoolsValue}</p>
          <p className="text-xs text-muted-foreground">{t.defCapitalisation}</p>
          <p className="text-xs text-muted-foreground">{t.defRatio}</p>
          <p className="text-xs text-muted-foreground">{t.defLockedShare}</p>
        </DexAccordion>
      </CardContent>
    </Card>
  );
}
