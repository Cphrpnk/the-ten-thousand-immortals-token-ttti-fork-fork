import { LineChart, RefreshCw } from "lucide-react";
import { ComputationResult, ReserveStatus } from "../../backend";
import type {
  DexIndicatorsSnapshot,
  PoolIndicators,
  TokenProof,
} from "../../backend";
import { useDexPools, useDexTokens } from "../../hooks/useDex";
import {
  useDexIndicators,
  useDexIndicatorsStatus,
} from "../../hooks/useDexIndicators";
import { formatUnits } from "../../lib/token";
import { formatBps, formatUsdE8 } from "../dex/liquidityFormat";
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
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, SECONDARY_GOLD } from "./styles";

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

const Never = ({ text }: { text: string }) => (
  <span className="text-muted-foreground">{text}</span>
);

type Tok = { symbol: string; decimals: number };

const TH = "py-1.5 pe-3 text-start font-normal text-muted-foreground";
const THR = "py-1.5 ps-3 text-end font-normal text-muted-foreground";
const TD = "py-1.5 pe-3";
const TDR = "py-1.5 ps-3 text-end tabular-nums";
const DEPTH_LEVELS = [
  { key: "onePercent", label: "1 %" },
  { key: "twoPercent", label: "2 %" },
  { key: "fivePercent", label: "5 %" },
] as const;

const amount = (value: bigint, tok: Tok) =>
  `${formatUnits(value, tok.decimals, 0)} ${tok.symbol}`;

const usd = (value: bigint | undefined) =>
  value === undefined ? "Unavailable" : `${formatUsdE8(value)} USD`;

const PROOF_STATUS: Record<ReserveStatus, string> = {
  [ReserveStatus.ok]: "Match",
  [ReserveStatus.surplus]: "Surplus",
  [ReserveStatus.shortfall]: "Shortfall",
};

function Fig({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-end tabular-nums">{children}</dd>
    </div>
  );
}

function PoolFigures({
  p,
  tok0,
  tok1,
}: { p: PoolIndicators; tok0: Tok; tok1: Tok }) {
  const l = p.liquidity;
  const a = p.activity;
  const f = p.fees;
  const c = p.concentration;
  const unlock = [
    ["This week", p.unlock.thisWeek],
    ["Within 30 days", p.unlock.days30],
    ["Within 90 days", p.unlock.days90],
    ["Within 1 year", p.unlock.year1],
    ["Beyond 1 year", p.unlock.overYear1],
    ["Permanent", p.unlock.permanent],
  ] as const;
  return (
    <article
      className="flex flex-col gap-3 rounded-lg border border-border p-4 text-xs"
      data-ocid={`admin.dex_indicators.pool.${p.poolId.toString()}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-sm">
          {tok0.symbol} / {tok1.symbol}{" "}
          <span className="text-muted-foreground">
            (pool {p.poolId.toString()})
          </span>
        </h4>
        <Badge variant="secondary">{p.isOpen ? "Open" : "Not open"}</Badge>
      </header>
      <dl className="flex flex-col gap-1">
        <Fig label={`Reserve ${tok0.symbol}`}>{amount(p.reserve0, tok0)}</Fig>
        <Fig label={`Reserve ${tok1.symbol}`}>{amount(p.reserve1, tok1)}</Fig>
        <Fig label="Value">{usd(p.valueUsdE8)}</Fig>
        <Fig label="Firm liquidity">
          {amount(l.firmAmount0, tok0)} · {amount(l.firmAmount1, tok1)} (
          {formatBps(l.firmBps)})
        </Fig>
        <Fig label="Free liquidity">
          {amount(l.freeAmount0, tok0)} · {amount(l.freeAmount1, tok1)} (
          {formatBps(l.freeBps)})
        </Fig>
        <Fig label="Positions">{c.positionCount.toString()}</Fig>
        <Fig label="Largest position">{formatBps(c.largestPositionBps)}</Fig>
        <Fig label="Top five positions">{formatBps(c.topFiveBps)}</Fig>
        <Fig label="Permanent protocol share">
          {formatBps(c.permanentProtocolBps)}
        </Fig>
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>Depth (move)</th>
              <th className={THR}>{tok0.symbol} in</th>
              <th className={THR}>{tok1.symbol} in</th>
            </tr>
          </thead>
          <tbody>
            {DEPTH_LEVELS.map(({ key, label }) => {
              const d = p.depth[key];
              return (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className={TD}>{label}</td>
                  <td className={TDR}>
                    {p.isOpen
                      ? `${amount(d.token0In.amountIn, tok0)} → ${amount(d.token0In.amountOut, tok1)}`
                      : "Not open"}
                  </td>
                  <td className={TDR}>
                    {p.isOpen
                      ? `${amount(d.token1In.amountIn, tok1)} → ${amount(d.token1In.amountOut, tok0)}`
                      : "Not open"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>Unlock</th>
              <th className={THR}>{tok0.symbol}</th>
              <th className={THR}>{tok1.symbol}</th>
            </tr>
          </thead>
          <tbody>
            {unlock.map(([label, b]) => (
              <tr key={label} className="border-b border-border last:border-0">
                <td className={TD}>{label}</td>
                <td className={TDR}>
                  {formatUnits(b.amount0, tok0.decimals, 0)}
                </td>
                <td className={TDR}>
                  {formatUnits(b.amount1, tok1.decimals, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>Activity</th>
              <th className={THR}>Swaps</th>
              <th className={THR}>Volume {tok0.symbol}</th>
              <th className={THR}>Volume {tok1.symbol}</th>
              <th className={THR}>Volume (USD)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Last 24 hours", a.last24h],
              ["Last 7 days", a.last7d],
            ].map(([label, w]) => {
              const win = w as typeof a.last24h;
              return (
                <tr
                  key={label as string}
                  className="border-b border-border last:border-0"
                >
                  <td className={TD}>{label as string}</td>
                  <td className={TDR}>{win.swapCount.toString()}</td>
                  <td className={TDR}>
                    {formatUnits(win.volume0, tok0.decimals, 0)}
                  </td>
                  <td className={TDR}>
                    {formatUnits(win.volume1, tok1.decimals, 0)}
                  </td>
                  <td className={TDR}>{usd(win.volumeUsdE8)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>Fees</th>
              <th className={THR}>Last 7 days</th>
              <th className={THR}>Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Collected",
                f.last7d.collected0,
                f.last7d.collected1,
                f.cumulative.collected0,
                f.cumulative.collected1,
              ],
              [
                "To LPs",
                f.last7d.lp0,
                f.last7d.lp1,
                f.cumulative.lp0,
                f.cumulative.lp1,
              ],
              [
                "Permanent",
                f.last7d.permanent0,
                f.last7d.permanent1,
                f.cumulative.permanent0,
                f.cumulative.permanent1,
              ],
            ].map(([label, w0, w1, c0, c1]) => (
              <tr
                key={label as string}
                className="border-b border-border last:border-0"
              >
                <td className={TD}>{label as string}</td>
                <td className={TDR}>
                  {amount(w0 as bigint, tok0)} · {amount(w1 as bigint, tok1)}
                </td>
                <td className={TDR}>
                  {amount(c0 as bigint, tok0)} · {amount(c1 as bigint, tok1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="flex flex-col gap-1 border-t border-border pt-2">
        <Fig label="Observed period">
          {f.observed.periodDays.toString()} days
        </Fig>
        <Fig label="Observed fees">{usd(f.observed.feesUsdE8)}</Fig>
        <Fig label="Observed liquidity">{usd(f.observed.liquidityUsdE8)}</Fig>
        <Fig label="Fees / liquidity">
          {f.observed.feeToLiquidityBps === undefined
            ? "Unavailable"
            : formatBps(f.observed.feeToLiquidityBps)}
        </Fig>
        {f.cumulativeSince !== undefined && (
          <Fig label="Cumulative since">
            {formatTimestamp(f.cumulativeSince)}
          </Fig>
        )}
      </dl>
    </article>
  );
}

function SnapshotFigures({ snapshot }: { snapshot: DexIndicatorsSnapshot }) {
  const dexTokens = useDexTokens();
  const dexPools = useDexPools();
  const tokens = dexTokens.data ?? [];
  const views = dexPools.data ?? [];
  const pools = [...snapshot.pools].sort((x, y) =>
    x.poolId === y.poolId ? 0 : x.poolId < y.poolId ? -1 : 1,
  );
  const resolve = (
    poolId: bigint,
    side: "token0" | "token1",
    symbol: string,
  ): Tok => {
    const view = views.find((v) => v.id === poolId)?.[side];
    if (view) return { symbol: view.symbol, decimals: view.decimals };
    const info = tokens.find((x) => x.symbol === symbol);
    return { symbol, decimals: info?.decimals ?? 0 };
  };
  return (
    <div
      className="flex flex-col gap-4"
      data-ocid="admin.dex_indicators.figures"
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-xs"
          data-ocid="admin.dex_indicators.proofs"
        >
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>Token</th>
              <th className={THR}>Internal total</th>
              <th className={THR}>Ledger total</th>
              <th className={THR}>Difference</th>
              <th className={THR}>Status</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.proofs.map((proof: TokenProof) => {
              const info = tokens.find((x) => x.token === proof.token);
              const tok: Tok = info ?? {
                symbol: proof.token as string,
                decimals: 0,
              };
              return (
                <tr
                  key={proof.token}
                  className="border-b border-border last:border-0"
                >
                  <td className={TD}>{tok.symbol}</td>
                  <td className={TDR}>{amount(proof.internalTotal, tok)}</td>
                  <td className={TDR}>{amount(proof.ledgerTotal, tok)}</td>
                  <td className={TDR}>{amount(proof.difference, tok)}</td>
                  <td className={TDR}>{PROOF_STATUS[proof.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {pools.map((p) => (
          <PoolFigures
            key={p.poolId.toString()}
            p={p}
            tok0={resolve(p.poolId, "token0", p.token0Symbol)}
            tok1={resolve(p.poolId, "token1", p.token1Symbol)}
          />
        ))}
      </div>
    </div>
  );
}

/** Admin: status of the stored DEX indicators snapshot. */
export function DexIndicatorsCard() {
  const { data, isLoading, isFetching, refetch, error } =
    useDexIndicatorsStatus();
  const snapshotQuery = useDexIndicators();
  const snapshot = snapshotQuery.data;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.dex_indicators_card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <LineChart className="h-5 w-5 text-primary" />
            DEX indicators
          </CardTitle>
          <CardDescription>
            Status of the stored indicators snapshot shown on the Pools page,
            with the same figures. The snapshot is not recalculated when it is
            read.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={SECONDARY_GOLD}
          disabled={isFetching}
          onClick={() => void refetch()}
          data-ocid="admin.dex_indicators.refresh_button"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton
            className="h-32 w-full"
            data-ocid="admin.dex_indicators.loading_state"
          />
        ) : error || !data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.dex_indicators.error_state"
          >
            <AlertDescription>
              {error?.message || "The indicators status could not be loaded."}
            </AlertDescription>
          </Alert>
        ) : (
          <dl className="grid grid-cols-[minmax(0,14rem)_1fr] gap-x-4 gap-y-2 text-sm">
            <Row label="Snapshot time">
              {data.snapshotAt !== undefined ? (
                <span data-ocid="admin.dex_indicators.snapshot_at">
                  {formatTimestamp(data.snapshotAt)}
                </span>
              ) : (
                <Never text="Not yet computed" />
              )}
            </Row>
            <Row label="Last computation">
              {data.lastComputedAt !== undefined ? (
                <span data-ocid="admin.dex_indicators.last_computed">
                  {formatTimestamp(data.lastComputedAt)}
                </span>
              ) : (
                <Never text="Never" />
              )}
            </Row>
            <Row label="Last result">
              {data.lastResult !== undefined ? (
                <Badge
                  variant={
                    data.lastResult === ComputationResult.failed
                      ? "destructive"
                      : "secondary"
                  }
                  data-ocid="admin.dex_indicators.last_result"
                >
                  {data.lastResult === ComputationResult.failed
                    ? "Failed"
                    : "OK"}
                </Badge>
              ) : (
                <Never text="None" />
              )}
            </Row>
            <Row label="Last success">
              {data.lastSuccessAt !== undefined ? (
                <span data-ocid="admin.dex_indicators.last_success">
                  {formatTimestamp(data.lastSuccessAt)}
                </span>
              ) : (
                <Never text="Never" />
              )}
            </Row>
            <Row label="Last error">
              {data.lastError ? (
                <span data-ocid="admin.dex_indicators.last_error">
                  {data.lastError.message} ·{" "}
                  {formatTimestamp(data.lastError.at)}
                </span>
              ) : (
                <Never text="None" />
              )}
            </Row>
          </dl>
        )}
        {snapshot ? (
          <div className="mt-6">
            <AdminAccordion
              label="Figures in the snapshot"
              count={snapshot.pools.length}
              ocid="admin.dex_indicators.figures_accordion"
            >
              <SnapshotFigures snapshot={snapshot} />
            </AdminAccordion>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
