import { PackageCheck } from "lucide-react";
import type { SweepTokenStatus } from "../../backend";
import { SweepStatus } from "../../backend";
import { useTreasurySweepStatus } from "../../hooks/useQueries";
import {
  RESERVE_FLOOR_E8S,
  formatIcpE8s,
  formatPayAmount,
  payTokenSymbol,
} from "../../lib/token";
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
import { PAY_TOKEN_KEYS } from "./protocolFormat";
import { GOLD_CARD } from "./styles";

const LABEL =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

const SWEEP_LABELS: Record<SweepStatus, string> = {
  [SweepStatus.notStarted]: "Not started",
  [SweepStatus.toppingUpReserve]: "Topping up the cycles reserve",
  [SweepStatus.sending]: "Sending to the owner destinations",
  [SweepStatus.completed]: "Completed",
};

function tokenStatusText(status: SweepTokenStatus): string {
  switch (status.__kind__) {
    case "pending":
      return "Pending";
    case "waitingDestination":
      return "Waiting for a destination";
    case "nothingToSend":
      return "Nothing to send";
    case "sending":
      return `Sending (owner send #${status.sending.toString()})`;
    case "sent":
      return `Sent (owner send #${status.sent.toString()})`;
  }
}

/** Admin: one-time sweep of the internal mint treasuries to the owner. */
export function TreasurySweepCard() {
  const { data, isLoading, isError, refetch } = useTreasurySweepStatus();

  return (
    <Card className={GOLD_CARD} data-ocid="admin.treasury_sweep_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <PackageCheck className="h-5 w-5 text-primary" />
          One-time Treasury Sweep
        </CardTitle>
        <CardDescription>
          The internal mint treasuries are emptied once to the owner
          destinations, after the cycles reserve is topped up to{" "}
          {formatIcpE8s(RESERVE_FLOOR_E8S, "en")} with the ICP they hold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton
            className="h-40 w-full"
            data-ocid="admin.treasury_sweep_loading_state"
          />
        ) : isError || !data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.treasury_sweep_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The treasury sweep status could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.treasury_sweep_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="text-right">
                <Badge
                  variant="secondary"
                  data-ocid="admin.treasury_sweep_status"
                >
                  {SWEEP_LABELS[data.status]}
                </Badge>
              </dd>
              <dt className="text-muted-foreground">Started</dt>
              <dd className="text-right font-mono tabular-nums">
                {data.startedAt === undefined
                  ? "—"
                  : formatTimestamp(data.startedAt)}
              </dd>
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="text-right font-mono tabular-nums">
                {data.completedAt === undefined
                  ? "—"
                  : formatTimestamp(data.completedAt)}
              </dd>
              <dt className="text-muted-foreground">Reserve top-up</dt>
              <dd
                className="text-right font-mono tabular-nums"
                data-ocid="admin.treasury_sweep_top_up"
              >
                {formatIcpE8s(data.reserveTopUpE8s, "en")}
              </dd>
              <dt className="text-muted-foreground">Top-up block</dt>
              <dd className="text-right font-mono tabular-nums">
                {data.reserveTopUpBlock?.toString() ?? "—"}
              </dd>
              <dt className="text-muted-foreground">Top-up memo</dt>
              <dd className="text-right font-mono break-all">
                {data.reserveTopUpMemo ?? "—"}
              </dd>
            </dl>
            <div
              className="space-y-1.5"
              data-ocid="admin.treasury_sweep_tokens"
            >
              <p className={LABEL}>Per token</p>
              <ul className="divide-y divide-border text-sm">
                {PAY_TOKEN_KEYS.flatMap((token) =>
                  data.tokens.filter((t) => t.token === token),
                ).map((t, i) => (
                  <li
                    key={t.token}
                    className="flex flex-wrap justify-between gap-2 py-1.5"
                    data-ocid={`admin.treasury_sweep_tokens.item.${i + 1}`}
                  >
                    <span className="font-mono">
                      {payTokenSymbol(t.token)}
                      <span className="ml-2 text-muted-foreground tabular-nums">
                        {t.balance === undefined
                          ? "—"
                          : formatPayAmount(t.balance, t.token, "en")}
                      </span>
                    </span>
                    <span>{tokenStatusText(t.status)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
