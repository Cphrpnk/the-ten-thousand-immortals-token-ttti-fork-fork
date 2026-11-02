import { CheckCircle2, Loader2, Play, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import {
  type DexTransferStatus,
  type SweepProgress,
  type SweepSource,
  type SweepTransferView,
  type TokenState,
  Variant_surplus_shortfall_balanced,
} from "../../backend";
import {
  useDexSweepProgress,
  useDexSweepState,
  useDexSweepTransfers,
  useResendDexSweepTransfers,
  useRunDexSweep,
} from "../../hooks/useDexSweep";
import {
  ADMIN_PAGED_LIST_TEXT,
  SWEEP_PROGRESS_TEXT,
} from "../../i18n/pages/pagedList";
import { FiatAmount } from "../FiatAmount";
import { fiatTokenOfDex } from "../dex/DexFiat";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { AdminAccordion, adminTokenSymbol, formatTokenAmount } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

type Feedback = { ok: boolean; text: string } | null;

const COMPARISON_LABELS: Record<Variant_surplus_shortfall_balanced, string> = {
  [Variant_surplus_shortfall_balanced.balanced]: "Balanced",
  [Variant_surplus_shortfall_balanced.surplus]: "Surplus",
  [Variant_surplus_shortfall_balanced.shortfall]: "Shortfall",
};

function transferStatusText(status: DexTransferStatus): string {
  switch (status.__kind__) {
    case "completed":
      return `Completed in block ${status.completed.toString()}`;
    case "needsReview":
      return "To review";
    case "inProgress":
      return "In progress";
    case "failed":
      return `Failed: ${status.failed}`;
  }
}

function sourceText(source: SweepSource): string {
  return source.__kind__ === "pool"
    ? `Pool ${source.pool.toString()}`
    : `User deposit ${source.userDeposit.toText()}`;
}

function summaryText(states: TokenState[]): string {
  const recorded = states.reduce((sum, s) => sum + s.transfersRecorded, 0n);
  const unknown = states.reduce((sum, s) => sum + s.unknownOutcome, 0n);
  return `${recorded.toString()} transfer(s) recorded, ${unknown.toString()} with an unknown outcome.`;
}

function ProgressStat({ label, value }: { label: string; value: bigint }) {
  return (
    <div>
      <dt className="inline text-muted-foreground">{label}: </dt>
      <dd className="inline font-mono">{value.toString()}</dd>
    </div>
  );
}

function SweepProgressSection({ progress }: { progress: SweepProgress }) {
  const text = SWEEP_PROGRESS_TEXT;
  return (
    <section
      className="space-y-3"
      aria-live="polite"
      data-ocid="admin.dex_sweep.progress_panel"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-display text-sm font-medium">{text.title}</h3>
        <Badge
          variant={progress.active ? "default" : "secondary"}
          data-ocid="admin.dex_sweep.progress_status"
        >
          {progress.active ? text.running : text.idle}
        </Badge>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        <span>{text.runLabel(progress.runId.toString())}</span>
        <span>{text.batches(progress.batches.toString())}</span>
        <span>{text.batchSize(progress.batchSize.toString())}</span>
        {progress.startedAt !== undefined && (
          <span>{text.startedAt(formatTimestamp(progress.startedAt))}</span>
        )}
        {progress.lastBatchAt !== undefined && (
          <span>{text.lastBatch(formatTimestamp(progress.lastBatchAt))}</span>
        )}
      </p>
      {progress.tokens.length > 0 && (
        <ul className="space-y-3">
          {progress.tokens.map((t, i) => (
            <li
              key={t.token}
              className="space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0"
              data-ocid={`admin.dex_sweep.progress.${i + 1}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {adminTokenSymbol(t.token)}
                </span>
                <Badge variant={t.done ? "secondary" : "outline"}>
                  {t.done ? text.tokenDone : text.tokenPending}
                </Badge>
              </div>
              <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <ProgressStat label={text.listed} value={t.accountsListed} />
                <ProgressStat label={text.read} value={t.accountsRead} />
                <ProgressStat label={text.withBalance} value={t.withBalance} />
                <ProgressStat
                  label={text.excludedZero}
                  value={t.excludedZero}
                />
                <ProgressStat label={text.skipped} value={t.skipped} />
                <ProgressStat label={text.unreadable} value={t.unreadable} />
                <ProgressStat label={text.inFlight} value={t.inFlight} />
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ComparisonTable({ states }: { states: TokenState[] }) {
  if (states.length === 0)
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.dex_sweep.state_empty_state"
      >
        No sweep state yet. Run a sweep.
      </p>
    );
  return (
    <Table data-ocid="admin.dex_sweep.state_table">
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Last run</TableHead>
          <TableHead className="text-right">Swept</TableHead>
          <TableHead className="text-right">Custody balance</TableHead>
          <TableHead className="text-right">Owed</TableHead>
          <TableHead>Comparison</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {states.map((s, i) => {
          const c = s.comparison;
          return (
            <TableRow
              key={s.token}
              data-ocid={`admin.dex_sweep.state.${i + 1}`}
            >
              <TableCell className="font-medium">
                {adminTokenSymbol(s.token)}
              </TableCell>
              <TableCell>
                {s.lastRunAt !== undefined ? (
                  formatTimestamp(s.lastRunAt)
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {formatTokenAmount(s.ledgerSwept, s.token)}
                <FiatAmount
                  token={fiatTokenOfDex(s.token)}
                  amount={s.ledgerSwept}
                  className="ml-1.5"
                  ocid={`admin.dex_sweep.swept_fiat.${s.token}`}
                />
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {c ? formatTokenAmount(c.custodyLedger, s.token) : "—"}
                {c && (
                  <FiatAmount
                    token={fiatTokenOfDex(s.token)}
                    amount={c.custodyLedger}
                    className="ml-1.5"
                    ocid={`admin.dex_sweep.custody_fiat.${s.token}`}
                  />
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {c ? formatTokenAmount(c.owed, s.token) : "—"}
                {c && (
                  <FiatAmount
                    token={fiatTokenOfDex(s.token)}
                    amount={c.owed}
                    className="ml-1.5"
                    ocid={`admin.dex_sweep.owed_fiat.${s.token}`}
                  />
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex flex-wrap items-center gap-2">
                  {c ? (
                    <>
                      <Badge
                        variant={
                          c.status ===
                          Variant_surplus_shortfall_balanced.shortfall
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {COMPARISON_LABELS[c.status]}
                      </Badge>
                      {c.surplus > 0n && (
                        <span className="font-mono text-xs">
                          +{formatTokenAmount(c.surplus, s.token)}
                        </span>
                      )}
                      {c.shortfall > 0n && (
                        <span className="font-mono text-xs">
                          −{formatTokenAmount(c.shortfall, s.token)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not compared</span>
                  )}
                  {s.comparisonPending && (
                    <Badge variant="outline">Waiting for transfers</Badge>
                  )}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function TransfersTable({ transfers }: { transfers: SweepTransferView[] }) {
  const rows = [...transfers].sort((a, b) => (a.n < b.n ? 1 : -1));
  return (
    <Table data-ocid="admin.dex_sweep.transfers_table">
      <TableHeader>
        <TableRow>
          <TableHead>Transfer</TableHead>
          <TableHead>Token</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((t, i) => (
          <TableRow
            key={t.n.toString()}
            data-ocid={`admin.dex_sweep.transfer.${i + 1}`}
          >
            <TableCell className="font-mono text-xs">
              #{t.n.toString()}
              <span className="block text-muted-foreground">
                {formatTimestamp(t.recordedAt)}
              </span>
            </TableCell>
            <TableCell>{adminTokenSymbol(t.token)}</TableCell>
            <TableCell className="max-w-56 break-all font-mono text-xs">
              {sourceText(t.source)}
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              {formatTokenAmount(t.amount, t.token)}
              <FiatAmount
                token={fiatTokenOfDex(t.token)}
                amount={t.amount}
                className="ml-1.5"
                ocid={`admin.dex_sweep.transfer_fiat.${i + 1}`}
              />
            </TableCell>
            <TableCell className="text-sm">
              {transferStatusText(t.status)}
              {t.lastError && (
                <span className="block text-xs text-muted-foreground">
                  {t.lastError}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Admin: sweeps the legacy DEX accounts into custody and compares custody with the total owed. */
export function DexSweepCard() {
  const state = useDexSweepState();
  const transfers = useDexSweepTransfers();
  const progress = useDexSweepProgress();
  const runSweep = useRunDexSweep();
  const resend = useResendDexSweepTransfers();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const onRun = () => {
    setFeedback(null);
    runSweep.mutate(undefined, {
      onSuccess: (states) =>
        setFeedback({
          ok: true,
          text: `Sweep finished: ${summaryText(states)}`,
        }),
      onError: (e) => setFeedback({ ok: false, text: e.message }),
    });
  };
  const onResend = () => {
    setFeedback(null);
    resend.mutate(undefined, {
      onSuccess: (states) =>
        setFeedback({
          ok: true,
          text: `Unsettled transfers resent: ${summaryText(states)}`,
        }),
      onError: (e) => setFeedback({ ok: false, text: e.message }),
    });
  };

  const busy = runSweep.isPending || resend.isPending;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.dex_sweep_card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Send className="h-5 w-5 text-primary" />
            DEX custody sweep
          </CardTitle>
          <CardDescription>
            Moves the balance of the legacy DEX accounts to the custody
            accounts, then compares each custody balance with the total owed.
            Internal balances are never changed.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={SECONDARY_GOLD}
          disabled={state.isFetching}
          onClick={() => {
            void state.refetch();
            void progress.refetch();
            transfers.refetch();
          }}
          data-ocid="admin.dex_sweep.refresh_button"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${state.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {state.isLoading ? (
          <Skeleton
            className="h-40 w-full"
            data-ocid="admin.dex_sweep.loading_state"
          />
        ) : state.error || !state.data ? (
          <Alert variant="destructive" data-ocid="admin.dex_sweep.error_state">
            <AlertDescription>
              {state.error?.message || "The sweep state could not be loaded."}
            </AlertDescription>
          </Alert>
        ) : (
          <section className="space-y-2">
            <h3 className="font-display text-sm font-medium">
              Custody versus owed, per token
            </h3>
            <ComparisonTable states={state.data} />
          </section>
        )}

        {progress.isLoading ? (
          <Skeleton
            className="h-24 w-full"
            data-ocid="admin.dex_sweep.progress_loading_state"
          />
        ) : progress.isError || !progress.data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.dex_sweep.progress_error_state"
          >
            <AlertDescription>
              {progress.error?.message ||
                "The sweep progress could not be loaded."}
            </AlertDescription>
          </Alert>
        ) : (
          <SweepProgressSection progress={progress.data} />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className={PRIMARY_GOLD}
            disabled={busy}
            onClick={onRun}
            data-ocid="admin.dex_sweep.run_button"
          >
            {runSweep.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {runSweep.isPending ? "Running sweep…" : "Run sweep"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={SECONDARY_GOLD}
            disabled={busy}
            onClick={onResend}
            data-ocid="admin.dex_sweep.resend_button"
          >
            {resend.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {resend.isPending ? "Resending…" : "Resend"}
          </Button>
        </div>

        {feedback && (
          <Alert
            variant={feedback.ok ? "default" : "destructive"}
            data-ocid={
              feedback.ok
                ? "admin.dex_sweep.success_state"
                : "admin.dex_sweep.action_error_state"
            }
          >
            {feedback.ok && <CheckCircle2 className="h-4 w-4" />}
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}

        <AdminAccordion
          label="Sweep transfers"
          count={transfers.items.length}
          ocid="admin.dex_sweep.transfers_accordion"
        >
          {transfers.isLoading ? (
            <Skeleton
              className="h-24 w-full"
              data-ocid="admin.dex_sweep.transfers_loading_state"
            />
          ) : transfers.isError ? (
            <Alert
              variant="destructive"
              data-ocid="admin.dex_sweep.transfers_error_state"
            >
              <AlertDescription className="flex flex-wrap items-center gap-3">
                {ADMIN_PAGED_LIST_TEXT.loadError}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={transfers.retry}
                  data-ocid="admin.dex_sweep.transfers_retry_button"
                >
                  {ADMIN_PAGED_LIST_TEXT.retry}
                </Button>
              </AlertDescription>
            </Alert>
          ) : transfers.isEmpty ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="admin.dex_sweep.transfers_empty_state"
            >
              No sweep transfer recorded.
            </p>
          ) : (
            <div className="space-y-3">
              <TransfersTable transfers={transfers.items} />
              {transfers.isLoadMoreError && (
                <Alert
                  variant="destructive"
                  data-ocid="admin.dex_sweep.transfers_load_more_error_state"
                >
                  <AlertDescription className="flex flex-wrap items-center gap-3">
                    {ADMIN_PAGED_LIST_TEXT.loadMoreError}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={transfers.retry}
                      data-ocid="admin.dex_sweep.transfers_load_more_retry_button"
                    >
                      {ADMIN_PAGED_LIST_TEXT.retry}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {transfers.hasMore && !transfers.isLoadMoreError && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={SECONDARY_GOLD}
                    disabled={transfers.isLoadingMore}
                    onClick={transfers.loadMore}
                    data-ocid="admin.dex_sweep.transfers_load_more_button"
                  >
                    {transfers.isLoadingMore
                      ? ADMIN_PAGED_LIST_TEXT.loadingMore
                      : ADMIN_PAGED_LIST_TEXT.loadMore}
                  </Button>
                )}
                {transfers.isEnd && (
                  <span
                    className="text-xs text-muted-foreground"
                    data-ocid="admin.dex_sweep.transfers_end_state"
                  >
                    {ADMIN_PAGED_LIST_TEXT.noMoreResults}
                  </span>
                )}
              </div>
            </div>
          )}
        </AdminAccordion>
      </CardContent>
    </Card>
  );
}
