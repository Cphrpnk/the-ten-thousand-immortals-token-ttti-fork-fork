import { Gauge } from "lucide-react";
import {
  useCyclesAutonomy,
  useCyclesShare,
  useCyclesShareHistory,
} from "../../hooks/useQueries";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { formatTimestamp } from "./ConversionsCard";
import { formatBpsEn, formatCyclesPerDay, formatDays } from "./protocolFormat";
import { GOLD_CARD } from "./styles";

const LABEL =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

/** Cycles autonomy, cycles share of the protocol fees and its change history. */
export function CyclesAutonomyCard() {
  const autonomy = useCyclesAutonomy();
  const share = useCyclesShare();
  const history = useCyclesShareHistory();
  const a = autonomy.data;
  const s = share.data;
  const isLoading = autonomy.isLoading || share.isLoading;
  const isError = autonomy.isError || share.isError || !a || !s;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.cycles_autonomy_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Gauge className="h-5 w-5 text-primary" />
          Cycles Autonomy
        </CardTitle>
        <CardDescription>
          Autonomy = cycles reserve ÷ the higher of the 7- and 30-day average
          consumption. The dynamic cycles share of the protocol fees is removed;
          its last values and changes are shown read-only as history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton
            className="h-40 w-full"
            data-ocid="admin.cycles_autonomy_loading_state"
          />
        ) : isError ? (
          <Alert
            variant="destructive"
            data-ocid="admin.cycles_autonomy_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The cycles autonomy could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  void autonomy.refetch();
                  void share.refetch();
                }}
                data-ocid="admin.cycles_autonomy_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Autonomy</dt>
              <dd
                className="text-right font-mono tabular-nums"
                data-ocid="admin.cycles_autonomy_days"
              >
                {formatDays(a.autonomyDays)}
              </dd>
              <dt className="text-muted-foreground">Target</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatDays(a.targetDays)}
              </dd>
              <dt className="text-muted-foreground">7-day average</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatCyclesPerDay(a.avg7dCyclesPerDay)}
              </dd>
              <dt className="text-muted-foreground">30-day average</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatCyclesPerDay(a.avg30dCyclesPerDay)}
              </dd>
              <dt className="text-muted-foreground">Samples</dt>
              <dd className="text-right font-mono tabular-nums">
                {a.sampleCount.toString()}
              </dd>
              <dt className="text-muted-foreground">Computed</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatTimestamp(a.computedAt)}
              </dd>
            </dl>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className={`${LABEL} col-span-2`}>Cycles share (history)</dt>
              <dt className="text-muted-foreground">Last share</dt>
              <dd
                className="text-right font-mono tabular-nums text-primary"
                data-ocid="admin.cycles_share_current"
              >
                {formatBpsEn(s.shareBps)}
              </dd>
              <dt className="text-muted-foreground">Last target share</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatBpsEn(s.targetShareBps)}
              </dd>
              <dt className="text-muted-foreground">Bounds</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatBpsEn(s.minShareBps)} to {formatBpsEn(s.maxShareBps)}
              </dd>
              <dt className="text-muted-foreground">Last adjustment</dt>
              <dd className="text-right font-mono tabular-nums">
                {s.lastAdjustAt === undefined
                  ? "None"
                  : formatTimestamp(s.lastAdjustAt)}
              </dd>
            </dl>
          </div>
        )}

        <div className="space-y-1.5" data-ocid="admin.cycles_share_history">
          <p className={LABEL}>Share changes (history)</p>
          {history.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : !history.data || history.data.length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="admin.cycles_share_history.empty_state"
            >
              No change was made
            </p>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1.5 text-left font-normal">Date</th>
                    <th className="py-1.5 text-right font-normal">Old</th>
                    <th className="py-1.5 text-right font-normal">New</th>
                    <th className="py-1.5 text-right font-normal">Autonomy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono tabular-nums">
                  {history.data.map((c, i) => (
                    <tr
                      key={`${c.at.toString()}-${c.newShareBps.toString()}`}
                      data-ocid={`admin.cycles_share_history.row.${i + 1}`}
                    >
                      <td className="py-1.5 text-muted-foreground">
                        {formatTimestamp(c.at)}
                      </td>
                      <td className="py-1.5 text-right">
                        {formatBpsEn(c.oldShareBps)}
                      </td>
                      <td className="py-1.5 text-right">
                        {formatBpsEn(c.newShareBps)}
                      </td>
                      <td className="py-1.5 text-right">
                        {formatDays(c.autonomyDays)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
