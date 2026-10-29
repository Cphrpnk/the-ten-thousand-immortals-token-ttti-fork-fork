import {
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { type DexTokenInfo, ReserveStatus } from "../../backend";
import { useDexTokens } from "../../hooks/useDex";
import {
  type DexPauseView,
  type Mismatch,
  type TokenReserveResult,
  useDexReserveStatus,
  useResumeDex,
  useRunDexReserveCheck,
} from "../../hooks/useDexReserve";
import { formatUnits } from "../../lib/token";
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
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

type Feedback = { ok: boolean; text: string } | null;

const STATUS_LABELS: Record<ReserveStatus, string> = {
  [ReserveStatus.ok]: "OK",
  [ReserveStatus.surplus]: "Surplus",
  [ReserveStatus.shortfall]: "Shortfall",
};

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
            Mismatch on {reasonToken.symbol}: internal{" "}
            {amountText(reason.internalTotal, reasonToken.info)}, ledger{" "}
            {amountText(reason.ledgerTotal, reasonToken.info)} ·{" "}
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

function ResultsTable({
  results,
  tokens,
}: { results: TokenReserveResult[]; tokens: DexTokenInfo[] | undefined }) {
  if (results.length === 0)
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.dex_reserve.results_empty_state"
      >
        No token result yet. Run a check.
      </p>
    );
  return (
    <Table data-ocid="admin.dex_reserve.results_table">
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Internal total</TableHead>
          <TableHead className="text-right">Ledger total</TableHead>
          <TableHead className="text-right">Difference</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r, i) => {
          const { symbol, info } = tokenLabel(r.token, tokens);
          return (
            <TableRow
              key={r.token}
              data-ocid={`admin.dex_reserve.result.${i + 1}`}
            >
              <TableCell className="font-medium">{symbol}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(r.internalTotal, info)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(r.ledgerTotal, info)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(r.difference, info)}
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
  tokens,
}: { history: Mismatch[]; tokens: DexTokenInfo[] | undefined }) {
  if (history.length === 0)
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.dex_reserve.history_empty_state"
      >
        No mismatch recorded.
      </p>
    );
  const rows = [...history].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <Table data-ocid="admin.dex_reserve.history_table">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Internal total</TableHead>
          <TableHead className="text-right">Ledger total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m, i) => {
          const { symbol, info } = tokenLabel(m.token, tokens);
          return (
            <TableRow
              key={m.id.toString()}
              data-ocid={`admin.dex_reserve.history.${i + 1}`}
            >
              <TableCell>{formatTimestamp(m.at)}</TableCell>
              <TableCell className="font-medium">{symbol}</TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(m.internalTotal, info)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {amountText(m.ledgerTotal, info)}
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
        const shortfalls = check.results.filter(
          (r) => r.status === ReserveStatus.shortfall,
        ).length;
        setCheckFeedback({
          ok: true,
          text:
            shortfalls > 0
              ? `Reserve check finished on ${formatTimestamp(check.checkedAt)}: ${shortfalls} token(s) with a shortfall.`
              : `Reserve check finished on ${formatTimestamp(check.checkedAt)}: no shortfall.`,
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
              {error?.message || "The DEX reserve status could not be loaded."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
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

            <section className="space-y-2">
              <h3 className="font-display text-sm font-medium">
                Balances per token
              </h3>
              <ResultsTable
                results={lastCheck?.results ?? []}
                tokens={tokens}
              />
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
            count={data.history.length}
            ocid="admin.dex_reserve.history_accordion"
          >
            <HistoryTable history={data.history} tokens={tokens} />
          </AdminAccordion>
        )}
      </CardContent>
    </Card>
  );
}
