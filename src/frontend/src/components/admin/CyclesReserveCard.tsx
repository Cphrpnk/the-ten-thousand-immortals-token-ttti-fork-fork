import { Battery, Copy, Lock } from "lucide-react";
import { toast } from "sonner";
import type { TopUpStatus } from "../../backend";
import { useCyclesStatus } from "../../hooks/useQueries";
import { icpDashboardTxUrl } from "../../lib/explorer";
import {
  ICP_LEDGER_ID,
  RESERVE_FLOOR_E8S,
  encodeAccountText,
  formatIcpE8s,
} from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
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
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD } from "./styles";

function formatCycles(cycles: bigint): string {
  return `${(Number(cycles) / 1e12).toFixed(3)} T cycles`;
}

function topUpStatusText(status: TopUpStatus): string {
  switch (status.__kind__) {
    case "transferred":
      return "Transferred, awaiting cycles notification";
    case "notified":
      return `Completed (${formatCycles(status.notified.cycles)})`;
    case "failed":
      return `Failed: ${status.failed}`;
  }
}

/** ICP ledger block index linked to its ICP Dashboard transaction page. */
function IcpBlockLink({
  blockIndex,
  ocid,
  className,
}: {
  blockIndex: bigint;
  ocid: string;
  className?: string;
}) {
  const href = icpDashboardTxUrl(ICP_LEDGER_ID, blockIndex);
  if (href === null) return <>{blockIndex.toString()}</>;
  return (
    <ExplorerLink
      target={href}
      label="View on the ICP Dashboard"
      className={className}
      data-ocid={ocid}
    >
      {blockIndex.toString()}
    </ExplorerLink>
  );
}

export function CyclesReserveCard() {
  const { data: status, isLoading, isError, refetch } = useCyclesStatus();

  const floor = status?.reserveFloorE8s ?? RESERVE_FLOOR_E8S;
  const accountText = status ? encodeAccountText(status.reserveAccount) : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountText);
      toast.success("Reserve account copied");
    } catch {
      toast.error("The account could not be copied.");
    }
  };

  return (
    <Card className={GOLD_CARD} data-ocid="admin.cycles_reserve_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Battery className="h-5 w-5 text-primary" />
          Cycles Reserve
        </CardTitle>
        <CardDescription>
          ICP held for cycles, converted through the CMC when the cycles balance
          falls below the{" "}
          {status ? formatCycles(status.topUpThreshold) : "top-up"} threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton
            className="h-40 w-full"
            data-ocid="admin.cycles_reserve_loading_state"
          />
        ) : isError || !status ? (
          <Alert
            variant="destructive"
            data-ocid="admin.cycles_reserve_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The cycles status could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.cycles_reserve_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reserve account</p>
              <div className="flex items-center gap-2">
                <code
                  className="min-w-0 flex-1 break-all font-mono text-xs"
                  data-ocid="admin.reserve_account"
                >
                  {accountText}
                </code>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-11 w-11 shrink-0"
                  onClick={() => void handleCopy()}
                  aria-label="Copy reserve account"
                  data-ocid="admin.reserve_copy_button"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Reserve balance</dt>
              <dd
                className="text-right font-mono tabular-nums"
                data-ocid="admin.reserve_balance"
              >
                {formatIcpE8s(status.reserveBalanceE8s)}
              </dd>
              <dt className="text-muted-foreground">Floor</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatIcpE8s(floor)}
              </dd>
              <dt className="text-muted-foreground">Cycles balance</dt>
              <dd
                className="text-right font-mono tabular-nums"
                data-ocid="admin.cycles_balance"
              >
                {formatCycles(status.cyclesBalance)}
              </dd>
              <dt className="text-muted-foreground">Top-up threshold</dt>
              <dd className="text-right font-mono tabular-nums">
                {formatCycles(status.topUpThreshold)}
              </dd>
            </dl>

            <div
              className="space-y-1.5 border-l border-border pl-4 text-sm"
              data-ocid="admin.last_topup"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Last top-up
              </p>
              {status.lastTopUp ? (
                <>
                  <p className="font-mono tabular-nums">
                    {formatTimestamp(status.lastTopUp.timestamp)} ·{" "}
                    {formatIcpE8s(status.lastTopUp.icpE8s)} · block{" "}
                    <IcpBlockLink
                      blockIndex={status.lastTopUp.blockIndex}
                      ocid="admin.last_topup_block_link"
                    />
                  </p>
                  <p>{topUpStatusText(status.lastTopUp.status)}</p>
                  <p className="break-words text-muted-foreground">
                    Last error:{" "}
                    {status.lastTopUp.lastError ? (
                      <span className="text-destructive">
                        {status.lastTopUp.lastError}
                      </span>
                    ) : (
                      "None"
                    )}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">None</p>
              )}
            </div>

            <div className="space-y-1.5" data-ocid="admin.reserve_withdrawals">
              <AdminAccordion
                label="Reserve withdrawals"
                count={status.withdrawals.length}
                ocid="admin.reserve_withdrawals_accordion"
              >
                {status.withdrawals.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground"
                    data-ocid="admin.reserve_withdrawals.empty_state"
                  >
                    None
                  </p>
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {status.withdrawals.map((w, i) => (
                      <li
                        key={w.blockIndex.toString()}
                        className="flex flex-wrap justify-between gap-2 py-1.5 font-mono tabular-nums"
                        data-ocid={`admin.reserve_withdrawals.item.${i + 1}`}
                      >
                        <span className="text-muted-foreground">
                          {formatTimestamp(w.timestamp)}
                        </span>
                        <span>{formatIcpE8s(w.amountE8s)}</span>
                        <span className="text-muted-foreground">
                          block{" "}
                          <IcpBlockLink
                            blockIndex={w.blockIndex}
                            ocid={`admin.reserve_withdrawals.link.${i + 1}`}
                            className="text-muted-foreground"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AdminAccordion>
            </div>
          </>
        )}
        <p
          className="flex items-start gap-2 text-xs text-muted-foreground"
          data-ocid="admin.reserve_note"
        >
          <Lock
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          The {formatIcpE8s(RESERVE_FLOOR_E8S)} floor always stays available for
          cycles.
        </p>
      </CardContent>
    </Card>
  );
}
