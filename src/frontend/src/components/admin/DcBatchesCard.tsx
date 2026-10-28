import { ArrowRightLeft } from "lucide-react";
import { DcTrigger, type PoolView } from "../../backend";
import type { DcBatchStatus, DcLeg } from "../../hooks/useDex";
import { useDcBatches, useDexPools } from "../../hooks/useDex";
import { formatIcpE8s } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
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
import { formatBpsEn, poolLabel, poolSideAmount } from "./protocolFormat";
import { GOLD_CARD } from "./styles";

const TRIGGER_LABELS: Record<DcTrigger, string> = {
  [DcTrigger.daily]: "Daily",
  [DcTrigger.threshold]: "Threshold reached",
};

function statusText(status: DcBatchStatus): string {
  switch (status.__kind__) {
    case "sent":
      return `Sent to the cycles reserve in block ${status.sent.toString()}`;
    case "nothingToConvert":
      return "Nothing to convert";
    case "sending":
      return "Sending";
    case "needsReview":
      return "To review";
    case "failed":
      return `Failed: ${status.failed}`;
    case "waitingPriceDeviation":
      return "Waiting: price deviation above 2 %";
  }
}

/** Fee token side of a leg: the pool side whose symbol matches. */
function legAmount(pools: PoolView[] | undefined, leg: DcLeg): string {
  const pool = pools?.find((p) => p.id === leg.poolId);
  if (pool?.token1.symbol === leg.tokenSymbol) {
    return poolSideAmount(pools, leg.poolId, 1, leg.amountIn);
  }
  if (pool?.token0.symbol === leg.tokenSymbol) {
    return poolSideAmount(pools, leg.poolId, 0, leg.amountIn);
  }
  return `${leg.amountIn.toString()} ${leg.tokenSymbol}`;
}

/** DC batches: protocol fees converted to ICP and sent to the cycles reserve. */
export function DcBatchesCard() {
  const { data: batches, isLoading, isError, refetch } = useDcBatches();
  const { data: pools } = useDexPools();

  return (
    <Card className={GOLD_CARD} data-ocid="admin.dc_batches_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          Fee Conversion Batches (DC, history)
        </CardTitle>
        <CardDescription>
          Read-only history. The DC fee conversion is removed; no new batch
          runs. Protocol fees were converted to ICP and sent to the cycles
          reserve.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton
            className="h-32 w-full"
            data-ocid="admin.dc_batches_loading_state"
          />
        ) : isError || !batches ? (
          <Alert variant="destructive" data-ocid="admin.dc_batches_error_state">
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The conversion batches could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.dc_batches_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : batches.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.dc_batches.empty_state"
          >
            No batch was made
          </p>
        ) : (
          <ul
            className="max-h-[32rem] overflow-auto"
            data-ocid="admin.dc_batches_list"
          >
            {batches.map((batch, i) => (
              <li
                key={batch.id.toString()}
                className="space-y-3 border-t border-border py-4 first:border-t-0"
                data-ocid={`admin.dc_batches.item.${i + 1}`}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-mono text-sm font-semibold text-primary">
                    DC #{batch.id.toString()}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(batch.at)}
                  </span>
                  <Badge variant="secondary">
                    {TRIGGER_LABELS[batch.trigger]}
                  </Badge>
                  <span className="text-sm">{statusText(batch.status)}</span>
                </div>
                {batch.legs.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-muted-foreground">
                        <tr>
                          <th className="py-1 text-left font-normal">Pool</th>
                          <th className="py-1 text-right font-normal">In</th>
                          <th className="py-1 text-right font-normal">
                            Reference ICP
                          </th>
                          <th className="py-1 text-right font-normal">
                            Execution ICP
                          </th>
                          <th className="py-1 text-right font-normal">
                            Deviation
                          </th>
                          <th className="py-1 text-right font-normal">
                            Converted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono tabular-nums">
                        {batch.legs.map((leg) => (
                          <tr
                            key={`${leg.poolId.toString()}-${leg.tokenSymbol}`}
                          >
                            <td className="py-1">
                              {poolLabel(pools, leg.poolId)}
                            </td>
                            <td className="py-1 text-right">
                              {legAmount(pools, leg)}
                            </td>
                            <td className="py-1 text-right">
                              {formatIcpE8s(leg.referenceIcpOutE8s, "en")}
                            </td>
                            <td className="py-1 text-right">
                              {formatIcpE8s(leg.executionIcpOutE8s, "en")}
                            </td>
                            <td className="py-1 text-right">
                              {formatBpsEn(leg.deviationBps)}
                            </td>
                            <td className="py-1 text-right">
                              {leg.converted ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  To cycles {formatIcpE8s(batch.toCyclesE8s, "en")} · To bonus{" "}
                  {formatIcpE8s(batch.toBonusE8s, "en")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
