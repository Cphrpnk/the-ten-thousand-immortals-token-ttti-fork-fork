import { Gauge } from "lucide-react";
import { useCyclesAutonomy } from "../../hooks/useQueries";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AdminStat } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { formatCyclesPerDay, formatDays } from "./protocolFormat";

/** Current cycles autonomy: reserve ÷ the higher of the 7- and 30-day averages. */
export function CyclesAutonomyCard() {
  const autonomy = useCyclesAutonomy();
  const a = autonomy.data;

  return (
    <div className="space-y-4" data-ocid="admin.cycles_autonomy_card">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
        Autonomy = cycles reserve ÷ the higher of the 7- and 30-day average
        consumption.
      </p>
      {autonomy.isLoading ? (
        <Skeleton
          className="h-16 w-full"
          data-ocid="admin.cycles_autonomy_loading_state"
        />
      ) : autonomy.isError || !a ? (
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
              onClick={() => void autonomy.refetch()}
              data-ocid="admin.cycles_autonomy_retry_button"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStat
            label="Autonomy"
            value={
              <span className="text-primary">{formatDays(a.autonomyDays)}</span>
            }
            hint={`Target ${formatDays(a.targetDays)}`}
            ocid="admin.cycles_autonomy_days"
          />
          <AdminStat
            label="7-day average"
            value={formatCyclesPerDay(a.avg7dCyclesPerDay)}
          />
          <AdminStat
            label="30-day average"
            value={formatCyclesPerDay(a.avg30dCyclesPerDay)}
          />
          <AdminStat
            label="Computed"
            value={
              <span className="text-sm">{formatTimestamp(a.computedAt)}</span>
            }
            hint={`${a.sampleCount.toString()} samples`}
          />
        </div>
      )}
    </div>
  );
}
