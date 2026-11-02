import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  AccountKind,
  type DexTokenInfo,
  ReservePhase,
  ReserveStatus,
} from "../../backend";
import { useDexTokens } from "../../hooks/useDex";
import {
  type AccountMismatch,
  type AccountResult,
  type DexPauseView,
  type ExcludedRereadProgress,
  type Mismatch,
  type ReserveAlert,
  type ReserveProgress,
  useDexReserveStatus,
  useResumeDex,
  useRunDexReserveCheck,
} from "../../hooks/useDexReserve";
import { RESERVE_ALERT_TEXT } from "../../i18n/pages/pagedList";
import { formatUnits } from "../../lib/token";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { DexSweepCard } from "./DexSweepCard";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

type Feedback = { ok: boolean; text: string } | null;

const STATUS_LABELS: Record<ReserveStatus, string> = {
  [ReserveStatus.ok]: "OK",
  [ReserveStatus.surplus]: "Surplus",
  [ReserveStatus.shortfall]: "Shortfall",
};

const KIND_LABELS: Record<AccountKind, string> = {
  [AccountKind.dexHoldings]: "DEX holdings",
  [AccountKind.requestDeposits]: "Pair-request deposits",
  [AccountKind.auctionDeposits]: "Auction deposits",
  [AccountKind.mintFee]: "MINT_FEE",
  [AccountKind.protocolFees]: "PROTOCOL_FEES",
};

const KIND_ORDER: AccountKind[] = [
  AccountKind.dexHoldings,
  AccountKind.requestDeposits,
  AccountKind.auctionDeposits,
  AccountKind.mintFee,
  AccountKind.protocolFees,
];

function accountOrder(a: { kind: AccountKind; token: string }): number {
  return KIND_ORDER.indexOf(a.kind);
}

function tokenLabel(
  token: string,
  tokens: DexTokenInfo[] | undefined,
): { symbol: string; info: DexTokenInfo | undefined } {
  const info = tokens?.find((t) => t.token === token);
  return { symbol: info?.symbol ?? token, info };
}

function amountText(value: bigint, info: DexTokenInfo | undefined): string {
  return info ? formatUnits(value, info.decimals, 0) : value.toString();
}

function Row({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

function PauseRows({
  pause,
  tokens,
}: { pause: DexPauseView; tokens: DexTokenInfo[] | undefined }) {
  const reason = pause.reason;
  const reasonToken = reason ? tokenLabel(reason.token, tokens) : null;
  return (
    <>
      <Row label="DEX status">
        <Badge
          variant={pause.paused ? "destructive" : "secondary"}
          data-ocid="admin.dex_reserve.pause_status"
        >
          {pause.paused ? "Paused" : "Running"}
        </Badge>
      </Row>
      <Row label="Pause reason">
        {reason && reasonToken ? (
          <span data-ocid="admin.dex_reserve.pause_reason">
            Mismatch on{" "}
            {pause.account
              ? `${KIND_LABELS[pause.account.kind]} · ${reasonToken.symbol}`
              : reasonToken.symbol}
            : internal {amountText(reason.internalTotal, reasonToken.info)},
            ledger {amountText(reason.ledgerTotal, reasonToken.info)} ·{" "}
            {formatTimestamp(reason.at)}
          </span>
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
      </Row>
      <Row label="Last resume">
        {pause.resumed ? (
          <span data-ocid="admin.dex_reserve.last_resume">
            {formatTimestamp(pause.resumed.at)}, by{" "}
            <span className="font-mono text-xs">
              {pause.resumed.by.toText()}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Never</span>
        )}
      </Row>
    </>
  );
}

function ReserveAlertBanner({
  alert,
  onRunAgain,
  running,
}: { alert: ReserveAlert; onRunAgain: () => void; running: boolean }) {
  const text = RESERVE_ALERT_TEXT;
  return (
    <Alert variant="destructive" data-ocid="admin.dex_reserve.alert_state">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{text.title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p data-ocid="admin.dex_reserve.alert_message">{alert.message}</p>
        <p
          className="font-semibold"
          data-ocid="admin.dex_reserve.alert_compared"
        >
          {text.accountsCompared(
            alert.accountsCompared.toString(),
            alert.accountsToCompare.toString(),
          )}
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          <span>{text.alertId(alert.id.toString())}</span>
          <span>{text.runLabel(alert.runId.toString())}</span>
          <span>{text.raisedAt(formatTimestamp(alert.at))}</span>
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={running}
          onClick={onRunAgain}
          data-ocid="admin.dex_reserve.alert_run_again_button"
        >
          {text.runAgain}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function ReserveProgressSection({ progress }: { progress: ReserveProgress }) {
  const text = RESERVE_ALERT_TEXT;
  const inProgress = progress.phase === ReservePhase.inProgress;
  const finished = progress.phase === ReservePhase.finished;
  return (
    <section
      className="space-y-2"
      aria-live="polite"
      data-ocid="admin.dex_reserve.progress_panel"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-display text-sm font-medium">
          {text.progressTitle}
        </h3>
        <Badge
          variant={inProgress ? "default" : "secondary"}
          data-ocid="admin.dex_reserve.progress_status"
        >
          {inProgress
            ? text.progressInProgress(
                progress.batch.toString(),
                progress.totalBatches.toString(),
              )
            : finished
              ? text.progressFinished
              : text.progressIdleBadge}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {inProgress ? text.progressRunning : text.progressIdle}
      </p>
      <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        <span>{text.runLabel(progress.runId.toString())}</span>
        <span>
          {text.accountsCompared(
            progress.accountsCompared.toString(),
            progress.accountsToCompare.toString(),
          )}
        </span>
        <span>{text.batchSize(progress.batchSize.toString())}</span>
        <span>{text.excludedZero(progress.excludedZero.toString())}</span>
        <span>{text.unreadable(progress.unreadable.toString())}</span>
        {progress.lastBatchAt !== undefined && (
          <span>{text.lastBatch(formatTimestamp(progress.lastBatchAt))}</span>
        )}
      </p>
    </section>
  );
}

function ExcludedRereadSection({ reread }: { reread: ExcludedRereadProgress }) {
  const text = RESERVE_ALERT_TEXT;
  return (
    <section
      className="space-y-2"
      aria-live="polite"
      data-ocid="admin.dex_reserve.excluded_reread_panel"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-display text-sm font-medium">
          {text.excludedTitle}
        </h3>
        <Badge
          variant={reread.active ? "default" : "secondary"}
          data-ocid="admin.dex_reserve.excluded_reread_status"
        >
          {reread.active ? text.excludedActive : text.excludedIdle}
        </Badge>
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        <span data-ocid="admin.dex_reserve.excluded_reread_read">
          {text.excludedRead(
            reread.read.toString(),
            reread.excludedCount.toString(),
          )}
        </span>
        <span data-ocid="admin.dex_reserve.excluded_reread_reincluded">
          {text.excludedReincluded(reread.reincluded.toString())}
        </span>
        <span>{text.excludedUnreadable(reread.unreadable.toString())}</span>
        <span>{text.excludedBatchSize(reread.batchSize.toString())}</span>
        {reread.startedAt !== undefined && (
          <span>{text.excludedStarted(formatTimestamp(reread.startedAt))}</span>
        )}
        {reread.lastBatchAt !== undefined && (
          <span>
            {text.excludedLastBatch(formatTimestamp(reread.lastBatchAt))}
          </span>
        )}
        <span>
          {text.excludedLastFinished(
            reread.lastFinishedAt !== undefined
              ? formatTimestamp(reread.lastFinishedAt)
              : text.excludedNever,
          )}
        </span>
        <span data-ocid="admin.dex_reserve.excluded_reread_next_run">
          {text.excludedNextRun(
            reread.nextRunAt !== undefined
              ? formatTimestamp(reread.nextRunAt)
              : text.excludedNever,
          )}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">{text.excludedNote}</p>
    </section>
  );
}

function AccountsTable({
  accounts,
  tokens,
}: { accounts: AccountResult[]; tokens: DexTokenInfo[] | undefined }) {
  if (accounts.length === 0)
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.dex_reserve.results_empty_state"
      >
        No account result yet. Run a check.
      </p>
    );
  const rows = [...accounts].sort(
    (a, b) =>
      accountOrder(a) - accountOrder(b) || a.token.localeCompare(b.token),
  );
  return (
    <Table data-ocid="admin.dex_reserve.results_table">
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Ledger balance</TableHead>
          <TableHead className="text-right">Owed</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => {
          const { symbol, info } = tokenLabel(r.token, tokens);
          return (
            <TableRow
              key={`${r.kind}-${r.token}`}
              data-ocid={`admin.dex_reserve.result.${i + 1}`}
            >
              <TableCell className="font-medium">
                {KIND_LABELS[r.kind]}
              </TableCell>
              <TableCell>{symbol}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(r.ledgerBalance, info)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(r.owed, info)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    r.status === ReserveStatus.shortfall
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {STATUS_LABELS[r.status]}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function HistoryTable({
  history,
  legacy,
  tokens,
}: {
  history: AccountMismatch[];
  legacy: Mismatch[];
  tokens: DexTokenInfo[] | undefined;
}) {
  if (history.length === 0 && legacy.length === 0)
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.dex_reserve.history_empty_state"
      >
        No mismatch recorded.
      </p>
    );
  const rows = [
    ...history.map((m) => ({
      id: `${m.id.toString()}-${m.kind}`,
      at: m.at,
      account: KIND_LABELS[m.kind],
      token: m.token,
      owed: m.owed,
      ledger: m.ledgerBalance,
    })),
    ...(history.length === 0
      ? legacy.map((m) => ({
          id: `legacy-${m.id.toString()}`,
          at: m.at,
          account: "—",
          token: m.token,
          owed: m.internalTotal,
          ledger: m.ledgerTotal,
        }))
      : []),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <Table data-ocid="admin.dex_reserve.history_table">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Owed</TableHead>
          <TableHead className="text-right">Ledger balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m, i) => {
          const { symbol, info } = tokenLabel(m.token, tokens);
          return (
            <TableRow
              key={m.id}
              data-ocid={`admin.dex_reserve.history.${i + 1}`}
            >
              <TableCell>{formatTimestamp(m.at)}</TableCell>
              <TableCell className="font-medium">{m.account}</TableCell>
              <TableCell>{symbol}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(m.owed, info)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(m.ledger, info)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Admin: compares internal DEX totals with the ledgers; resumes a paused DEX. */
export function DexReserveCheckCard() {
  const { data, isLoading, isFetching, refetch, error } = useDexReserveStatus();
  const { data: tokens } = useDexTokens();
  const runCheck = useRunDexReserveCheck();
  const resume = useResumeDex();
  const [checkFeedback, setCheckFeedback] = useState<Feedback>(null);
  const [resumeFeedback, setResumeFeedback] = useState<Feedback>(null);

  const onRun = () => {
    setCheckFeedback(null);
    runCheck.mutate(undefined, {
      onSuccess: (check) => {
        const { accountsCompared, accountsToCompare, phase, alertDecided } =
          check.progress;
        const incomplete =
          accountsCompared === 0n || accountsCompared < accountsToCompare;
        const shortfalls = check.accounts.filter(
          (r) => r.status === ReserveStatus.shortfall,
        );
        const when = formatTimestamp(check.checkedAt);
        const counts = RESERVE_ALERT_TEXT.accountsCompared(
          accountsCompared.toString(),
          accountsToCompare.toString(),
        );
        if (phase === ReservePhase.inProgress) {
          setCheckFeedback({
            ok: true,
            text: RESERVE_ALERT_TEXT.checkInProgress(
              check.progress.batch.toString(),
              check.progress.totalBatches.toString(),
            ),
          });
          return;
        }
        if (alertDecided && incomplete) {
          setCheckFeedback({
            ok: false,
            text: `Reserve check finished on ${when} with an alert: ${counts}.`,
          });
          return;
        }
        setCheckFeedback({
          ok: shortfalls.length === 0,
          text:
            shortfalls.length > 0
              ? `Reserve check finished on ${when}: shortfall on ${shortfalls
                  .map(
                    (r) =>
                      `${KIND_LABELS[r.kind]} (${tokenLabel(r.token, tokens).symbol})`,
                  )
                  .join(", ")}.`
              : `Reserve check finished on ${when}: ${counts}, no shortfall.`,
        });
      },
      onError: (e) => setCheckFeedback({ ok: false, text: e.message }),
    });
  };

  const onResume = () => {
    setResumeFeedback(null);
    resume.mutate(undefined, {
      onSuccess: () =>
        setResumeFeedback({ ok: true, text: "The DEX has been resumed." }),
      onError: (e) =>
        setResumeFeedback({
          ok: false,
          text:
            (data?.unresolvedShortfallCount ?? 0n) > 0n
              ? `${e.message} A shortfall remains: resume is refused until it is resolved.`
              : e.message,
        }),
    });
  };

  const paused = data?.pause.paused === true;
  const lastCheck = data?.lastCheck;

  return (
    <div className="space-y-10">
      <Card className={GOLD_CARD} data-ocid="admin.dex_reserve_card">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              DEX reserve check
            </CardTitle>
            <CardDescription>
              Compares the internal DEX totals with the ledger balances. A
              detected mismatch pauses the DEX; nothing is corrected
              automatically.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={SECONDARY_GOLD}
            disabled={isFetching}
            onClick={() => void refetch()}
            data-ocid="admin.dex_reserve.refresh_button"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <Skeleton
              className="h-48 w-full"
              data-ocid="admin.dex_reserve.loading_state"
            />
          ) : error || !data ? (
            <Alert
              variant="destructive"
              data-ocid="admin.dex_reserve.error_state"
            >
              <AlertDescription>
                {error?.message ||
                  "The DEX reserve status could not be loaded."}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {data.alert && data.progress.alertDecided && (
                <ReserveAlertBanner
                  alert={data.alert}
                  onRunAgain={onRun}
                  running={runCheck.isPending}
                />
              )}
              <dl className="grid grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-2 text-sm">
                <PauseRows pause={data.pause} tokens={tokens} />
                <Row label="Last check">
                  {lastCheck ? (
                    <span data-ocid="admin.dex_reserve.last_check">
                      {formatTimestamp(lastCheck.checkedAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </Row>
                <Row label="Last successful check">
                  {lastCheck?.lastSuccessAt !== undefined ? (
                    <span data-ocid="admin.dex_reserve.last_success">
                      {formatTimestamp(lastCheck.lastSuccessAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </Row>
                <Row label="Last check error">
                  {lastCheck?.error ? (
                    <span data-ocid="admin.dex_reserve.last_error">
                      {lastCheck.error.message} ·{" "}
                      {formatTimestamp(lastCheck.error.at)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </Row>
                <Row label="Unresolved shortfalls">
                  <span
                    className="font-mono"
                    data-ocid="admin.dex_reserve.shortfall_count"
                  >
                    {data.unresolvedShortfallCount.toString()}
                  </span>
                </Row>
                <Row label="Check in progress">
                  <Badge
                    variant="secondary"
                    data-ocid="admin.dex_reserve.in_progress"
                  >
                    {data.checkInProgress ? "Yes" : "No"}
                  </Badge>
                </Row>
              </dl>

              <ReserveProgressSection progress={data.progress} />
              <ExcludedRereadSection reread={data.excludedReread} />

              <section className="space-y-2">
                <h3 className="font-display text-sm font-medium">
                  Balances per account and token
                </h3>
                <AccountsTable accounts={data.accounts} tokens={tokens} />
              </section>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className={PRIMARY_GOLD}
              disabled={runCheck.isPending}
              onClick={onRun}
              data-ocid="admin.dex_reserve.run_check_button"
            >
              {runCheck.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {runCheck.isPending ? "Running check…" : "Run check"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={SECONDARY_GOLD}
              disabled={!paused || resume.isPending}
              onClick={onResume}
              data-ocid="admin.dex_reserve.resume_button"
            >
              {resume.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {resume.isPending ? "Resuming…" : "Resume DEX"}
            </Button>
            {!paused && data && (
              <span className="text-xs text-muted-foreground">
                Resume is available only while the DEX is paused.
              </span>
            )}
          </div>

          {checkFeedback && (
            <Alert
              variant={checkFeedback.ok ? "default" : "destructive"}
              data-ocid={
                checkFeedback.ok
                  ? "admin.dex_reserve.check_success_state"
                  : "admin.dex_reserve.check_error_state"
              }
            >
              {checkFeedback.ok && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{checkFeedback.text}</AlertDescription>
            </Alert>
          )}
          {resumeFeedback && (
            <Alert
              variant={resumeFeedback.ok ? "default" : "destructive"}
              data-ocid={
                resumeFeedback.ok
                  ? "admin.dex_reserve.resume_success_state"
                  : "admin.dex_reserve.resume_error_state"
              }
            >
              {resumeFeedback.ok && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{resumeFeedback.text}</AlertDescription>
            </Alert>
          )}

          {data && (
            <AdminAccordion
              label="Recent mismatches"
              count={Math.max(data.accountHistory.length, data.history.length)}
              ocid="admin.dex_reserve.history_accordion"
            >
              <HistoryTable
                history={data.accountHistory}
                legacy={data.history}
                tokens={tokens}
              />
            </AdminAccordion>
          )}
        </CardContent>
      </Card>
      <DexSweepCard />
    </div>
  );
}
