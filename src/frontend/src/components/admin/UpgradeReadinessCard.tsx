import { CheckCircle2, ClipboardCheck, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { ReservedReconciliation, TopUpAttempt } from "../../backend";
import { SweepStatus } from "../../backend";
import {
  useReconcileReserved,
  useUpgradeReadiness,
} from "../../hooks/useUpgradeReadiness";
import { formatIcpE8s, formatPayAmount, formatTtti } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
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
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

const memoText = (memo: Uint8Array) => new TextDecoder().decode(memo);

const SWEEP_LABELS: Record<SweepStatus, string> = {
  [SweepStatus.notStarted]: "Not started",
  [SweepStatus.toppingUpReserve]: "Topping up the cycles reserve",
  [SweepStatus.sending]: "Sending",
  [SweepStatus.completed]: "Completed",
};

function outcomeText(outcome: TopUpAttempt["outcome"]): string {
  switch (outcome.__kind__) {
    case "pending":
      return "Pending";
    case "unknown":
      return "Unknown";
    case "failed":
      return `Failed: ${outcome.failed}`;
    case "succeeded":
      return `Succeeded (block ${outcome.succeeded.toString()})`;
  }
}

function Row({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </>
  );
}

/** Yes/No badge; red when the value blocks an upgrade. */
function Flag({
  on,
  ocid,
  warnWhen = true,
}: { on: boolean; ocid: string; warnWhen?: boolean }) {
  return (
    <Badge
      variant={on === warnWhen ? "destructive" : "secondary"}
      data-ocid={ocid}
    >
      {on ? "Yes" : "No"}
    </Badge>
  );
}

function List({ items, ocid }: { items: string[]; ocid: string }) {
  if (items.length === 0)
    return <span className="block text-muted-foreground">None</span>;
  return (
    <ul className="space-y-1 font-mono text-xs" data-ocid={ocid}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function reconciliationText(r: ReservedReconciliation): string {
  return `${formatTtti(r.previousReserved)} TTTI-T on ${formatTimestamp(r.reconciledAt)}`;
}

/** Admin checklist before an upgrade, with the reserved reconciliation. */
export function UpgradeReadinessCard() {
  const { data, isLoading, isFetching, refetch, error } = useUpgradeReadiness();
  const reconcile = useReconcileReserved();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const onReconcile = () => {
    setFeedback(null);
    reconcile.mutate(undefined, {
      onSuccess: (r) =>
        setFeedback({
          ok: true,
          text: `Reserved reconciled. Previous value: ${reconciliationText(r)}.`,
        }),
      onError: (e) => setFeedback({ ok: false, text: e.message }),
    });
  };

  const topUp = data?.pendingTopUp;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.upgrade_readiness_card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Upgrade readiness
          </CardTitle>
          <CardDescription>
            State to check before an upgrade. Reconcile reserved only while
            sales are paused.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={SECONDARY_GOLD}
          disabled={isFetching}
          onClick={() => void refetch()}
          data-ocid="admin.upgrade_readiness.refresh_button"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton
            className="h-48 w-full"
            data-ocid="admin.upgrade_readiness.loading_state"
          />
        ) : error || !data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.upgrade_readiness.error_state"
          >
            <AlertDescription>
              {error?.message || "Upgrade readiness could not be loaded."}
            </AlertDescription>
          </Alert>
        ) : (
          <dl className="grid grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-2 text-sm">
            <Row label="Sales paused">
              <Flag
                on={data.salesPaused}
                warnWhen={false}
                ocid="admin.upgrade_readiness.sales_paused"
              />
            </Row>
            <Row label="Purchases in flight">
              <span className="block font-mono">
                {data.purchasesInFlightCount.toString()}
              </span>
              <List
                items={data.purchasesInFlight.map((p) => p.toText())}
                ocid="admin.upgrade_readiness.purchases_list"
              />
            </Row>
            <Row label="BTC lock held">
              <Flag
                on={data.btcLockHeld}
                ocid="admin.upgrade_readiness.btc_lock"
              />
            </Row>
            <Row label="Buybacks in flight">
              <span className="block font-mono">
                {data.buybacksInFlightCount.toString()}
              </span>
              <List
                items={data.buybacksInFlight}
                ocid="admin.upgrade_readiness.buybacks_list"
              />
            </Row>
            <Row label="Reserve lock busy">
              <Flag
                on={data.reserveLockBusy}
                ocid="admin.upgrade_readiness.reserve_lock"
              />
            </Row>
            <Row label="Pending cycles top-up">
              {topUp ? (
                <span
                  className="space-y-0.5"
                  data-ocid="admin.upgrade_readiness.top_up"
                >
                  <span className="block">
                    Amount: {formatIcpE8s(topUp.amount, "en")}
                  </span>
                  <span className="block font-mono text-xs">
                    created_at_time: {topUp.created_at_time.toString()}
                  </span>
                  <span className="block">
                    Memo:{" "}
                    <span className="font-mono">{memoText(topUp.memo)}</span> ·
                    sends: {topUp.sends.toString()}
                  </span>
                  <span className="block">
                    Outcome: {outcomeText(topUp.outcome)}
                  </span>
                  <span className="block">
                    Block: {topUp.blockIndex?.toString() ?? "—"}
                  </span>
                  {topUp.lastError && (
                    <span className="block text-muted-foreground">
                      Last error: {topUp.lastError}
                    </span>
                  )}
                  <span className="block">
                    Needs review:{" "}
                    <Flag
                      on={topUp.needsReview}
                      ocid="admin.upgrade_readiness.top_up_review"
                    />
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </Row>
            <Row label="Owner sends in flight">
              <List
                items={data.ownerSendsInFlight.map((n) => `#${n.toString()}`)}
                ocid="admin.upgrade_readiness.owner_sends_list"
              />
            </Row>
            <Row label="Treasury sweep">
              <span data-ocid="admin.upgrade_readiness.sweep_status">
                {SWEEP_LABELS[data.sweepStatus]}
              </span>
            </Row>
            <Row label="Mint fee claims in flight">
              <List
                items={data.mintFeeClaimsInFlight.map(
                  (n) => `#${n.toString()}`,
                )}
                ocid="admin.upgrade_readiness.mint_fee_claims_list"
              />
            </Row>
            <Row label="Liquidity injections in flight">
              <List
                items={data.injectionsInFlight.map((n) => `#${n.toString()}`)}
                ocid="admin.upgrade_readiness.injections_list"
              />
            </Row>
            <Row label="Open purchase traces">
              <span className="font-mono">
                {data.openTraceCount.toString()}
              </span>
              {data.openTraces.length > 0 && (
                <ul
                  className="mt-1 space-y-1 text-xs"
                  data-ocid="admin.upgrade_readiness.traces_list"
                >
                  {data.openTraces.map((t, i) => (
                    <li
                      key={t.n.toString()}
                      className="font-mono"
                      data-ocid={`admin.upgrade_readiness.trace.${i + 1}`}
                    >
                      #{t.n.toString()} · {memoText(t.memo)} ·{" "}
                      {formatPayAmount(t.amount, t.token)} · reserved{" "}
                      {formatTtti(t.reserved)} TTTI-T · buyer {t.buyer.toText()}{" "}
                      · created_at_time {t.created_at_time.toString()}
                    </li>
                  ))}
                </ul>
              )}
            </Row>
            <Row label="Current reserved">
              <span
                className="font-mono"
                data-ocid="admin.upgrade_readiness.reserved"
              >
                {formatTtti(data.reserved)} TTTI-T
              </span>
            </Row>
            <Row label="Last reconciliation">
              {data.lastReconciliation ? (
                <span data-ocid="admin.upgrade_readiness.last_reconciliation">
                  Previous {reconciliationText(data.lastReconciliation)}, by{" "}
                  <span className="font-mono">
                    {data.lastReconciliation.by.toText()}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Never</span>
              )}
            </Row>
          </dl>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              className={PRIMARY_GOLD}
              disabled={reconcile.isPending}
              data-ocid="admin.upgrade_readiness.reconcile_button"
            >
              {reconcile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reconcile reserved
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="admin.upgrade_readiness.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Reconcile reserved?</AlertDialogTitle>
              <AlertDialogDescription>
                Sets reserved to 0 and keeps the previous value visible. Allowed
                only while sales are paused, with no purchase in flight and no
                open purchase trace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="admin.upgrade_readiness.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onReconcile}
                data-ocid="admin.upgrade_readiness.confirm_button"
              >
                Reconcile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {feedback && (
          <Alert
            variant={feedback.ok ? "default" : "destructive"}
            data-ocid={
              feedback.ok
                ? "admin.upgrade_readiness.success_state"
                : "admin.upgrade_readiness.reconcile_error_state"
            }
          >
            {feedback.ok && <CheckCircle2 className="h-4 w-4" />}
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
