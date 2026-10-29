import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { ReserveStatus } from "../../backend";
import type {
  DexTokenInfo,
  PoolIndicators,
  PoolView,
  TokenProof,
} from "../../backend";
import { useDexPools, useDexTokens } from "../../hooks/useDex";
import { useDexIndicators } from "../../hooks/useDexIndicators";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_INDICATORS_TEXT } from "../../i18n/pages/dexIndicators";
import { formatUnits } from "../../lib/token";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { formatDexDate } from "./dexFormat";
import { formatBps, formatUsdE8 } from "./liquidityFormat";

type Text = (typeof DEX_INDICATORS_TEXT)["en"];
type Tok = { symbol: string; decimals: number };

const TH = "py-1.5 pe-3 text-start font-normal text-muted-foreground";
const THR = "py-1.5 ps-3 text-end font-normal text-muted-foreground";
const TD = "py-1.5 pe-3";
const TDR = "py-1.5 ps-3 text-end tabular-nums";
const DEPTH_LEVELS = [
  { key: "onePercent", bps: 100n },
  { key: "twoPercent", bps: 200n },
  { key: "fivePercent", bps: 500n },
] as const;

const amount = (value: bigint, tok: Tok) =>
  `${formatUnits(value, tok.decimals, 0)} ${tok.symbol}`;

const usdText = (t: Text, value: bigint | undefined) =>
  value === undefined ? t.unavailable : `${formatUsdE8(value)} USD`;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h4 className="font-display text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-end tabular-nums">{children}</dd>
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function proofStatusLabel(t: Text, status: ReserveStatus): string {
  switch (status) {
    case ReserveStatus.ok:
      return t.statusMatch;
    case ReserveStatus.surplus:
      return t.statusSurplus;
    case ReserveStatus.shortfall:
      return t.statusShortfall;
  }
}

function ProofTable({
  t,
  proofs,
  tokens,
}: { t: Text; proofs: TokenProof[]; tokens: DexTokenInfo[] }) {
  return (
    <Block title={t.proofTitle}>
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
        <table className="w-full text-xs" data-ocid="pools.indicators.proofs">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>{t.colToken}</th>
              <th className={THR}>{t.colInternal}</th>
              <th className={THR}>{t.colLedger}</th>
              <th className={THR}>{t.colDifference}</th>
              <th className={THR}>{t.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {proofs.map((p, i) => {
              const info = tokens.find((x) => x.token === p.token);
              const tok = info ?? { symbol: p.token as string, decimals: 0 };
              return (
                <tr
                  key={p.token}
                  className="border-b border-border last:border-0"
                  data-ocid={`pools.indicators.proof.${i + 1}`}
                >
                  <td className={TD}>{tok.symbol}</td>
                  <td className={TDR}>{amount(p.internalTotal, tok)}</td>
                  <td className={TDR}>{amount(p.ledgerTotal, tok)}</td>
                  <td className={TDR}>{amount(p.difference, tok)}</td>
                  <td className={TDR}>{proofStatusLabel(t, p.status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

function Summary({
  t,
  pools,
  proofs,
  reserveCheckedAt,
  lang,
}: {
  t: Text;
  pools: PoolIndicators[];
  proofs: TokenProof[];
  reserveCheckedAt: bigint | undefined;
  lang: Parameters<typeof formatDexDate>[1];
}) {
  const valued = pools.filter((p) => p.valueUsdE8 !== undefined);
  const total = valued.reduce((sum, p) => sum + (p.valueUsdE8 ?? 0n), 0n);
  const volumes = pools
    .map((p) => p.activity.last24h.volumeUsdE8)
    .filter((v): v is bigint => v !== undefined);
  const matching = proofs.filter((p) => p.status === ReserveStatus.ok).length;
  const swaps = pools.reduce((s, p) => s + p.activity.last24h.swapCount, 0n);
  const missing = pools.length - valued.length;
  return (
    <Block title={t.summaryTitle}>
      <dl
        className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4"
        data-ocid="pools.indicators.summary"
      >
        <Row label={t.summaryPools}>{formatNumber(pools.length)}</Row>
        <Row label={t.summaryOpenPools}>
          {formatNumber(pools.filter((p) => p.isOpen).length)}
        </Row>
        <Row label={t.summaryValue}>
          {valued.length === 0 ? (
            <Muted>{t.unavailable}</Muted>
          ) : (
            usdText(t, total)
          )}
        </Row>
        <Row label={t.summarySwaps24h}>{formatNumber(swaps)}</Row>
        <Row label={t.summaryVolume24h}>
          {volumes.length === 0 ? (
            <Muted>{t.unavailable}</Muted>
          ) : (
            usdText(
              t,
              volumes.reduce((s, v) => s + v, 0n),
            )
          )}
        </Row>
        <Row label={t.summaryProofs}>
          {t.summaryProofsValue(
            formatNumber(matching),
            formatNumber(proofs.length),
          )}
        </Row>
        {valued.length > 0 && missing > 0 && (
          <p className="text-xs text-muted-foreground">
            {t.summaryValueExcluding(formatNumber(missing))}
          </p>
        )}
        {reserveCheckedAt !== undefined && (
          <p className="text-xs text-muted-foreground">
            {t.reserveCheckedAt(formatDexDate(reserveCheckedAt, lang))}
          </p>
        )}
      </dl>
    </Block>
  );
}

function DepthBlock({
  t,
  p,
  tok0,
  tok1,
}: { t: Text; p: PoolIndicators; tok0: Tok; tok1: Tok }) {
  return (
    <Block title={t.depthTitle}>
      <p className="text-xs text-muted-foreground">{t.depthNote}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>{t.depthMove}</th>
              <th className={THR}>{t.depthIn(tok0.symbol)}</th>
              <th className={THR}>{t.depthIn(tok1.symbol)}</th>
            </tr>
          </thead>
          <tbody>
            {DEPTH_LEVELS.map(({ key, bps }) => {
              const level = p.depth[key];
              const cell = (
                side: typeof level.token0In,
                inTok: Tok,
                outTok: Tok,
              ) =>
                p.isOpen ? (
                  `${amount(side.amountIn, inTok)} → ${amount(side.amountOut, outTok)}`
                ) : (
                  <Muted>{t.notOpen}</Muted>
                );
              return (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className={TD}>{formatBps(bps)}</td>
                  <td className={TDR}>{cell(level.token0In, tok0, tok1)}</td>
                  <td className={TDR}>{cell(level.token1In, tok1, tok0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

function AmountsTable({
  t,
  tok0,
  tok1,
  firstCol,
  rows,
}: {
  t: Text;
  tok0: Tok;
  tok1: Tok;
  firstCol: string;
  rows: {
    key: string;
    label: string;
    v0: bigint;
    v1: bigint;
    extra?: string;
  }[];
}) {
  const hasExtra = rows.some((r) => r.extra !== undefined);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>{firstCol}</th>
            <th className={THR}>{tok0.symbol}</th>
            <th className={THR}>{tok1.symbol}</th>
            {hasExtra && <th className={THR}>{t.colShare}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-border last:border-0">
              <td className={TD}>{r.label}</td>
              <td className={TDR}>{formatUnits(r.v0, tok0.decimals, 0)}</td>
              <td className={TDR}>{formatUnits(r.v1, tok1.decimals, 0)}</td>
              {hasExtra && <td className={TDR}>{r.extra}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityBlock({
  t,
  p,
  tok0,
  tok1,
}: { t: Text; p: PoolIndicators; tok0: Tok; tok1: Tok }) {
  const windows = [
    { key: "24h", label: t.window24h, w: p.activity.last24h },
    { key: "7d", label: t.window7d, w: p.activity.last7d },
  ];
  return (
    <Block title={t.activityTitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>{t.colPeriod}</th>
              <th className={THR}>{t.swapCount}</th>
              <th className={THR}>{`${t.volume} ${tok0.symbol}`}</th>
              <th className={THR}>{`${t.volume} ${tok1.symbol}`}</th>
              <th className={THR}>{t.volumeUsd}</th>
            </tr>
          </thead>
          <tbody>
            {windows.map(({ key, label, w }) => (
              <tr key={key} className="border-b border-border last:border-0">
                <td className={TD}>{label}</td>
                <td className={TDR}>{formatNumber(w.swapCount)}</td>
                <td className={TDR}>
                  {formatUnits(w.volume0, tok0.decimals, 0)}
                </td>
                <td className={TDR}>
                  {formatUnits(w.volume1, tok1.decimals, 0)}
                </td>
                <td className={TDR}>
                  {w.volumeUsdE8 === undefined ? (
                    <Muted>{t.unavailable}</Muted>
                  ) : (
                    usdText(t, w.volumeUsdE8)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Block>
  );
}

function FeesBlock({
  t,
  p,
  tok0,
  tok1,
  lang,
}: {
  t: Text;
  p: PoolIndicators;
  tok0: Tok;
  tok1: Tok;
  lang: Parameters<typeof formatDexDate>[1];
}) {
  const f = p.fees;
  const pair = (v0: bigint, v1: bigint) =>
    `${amount(v0, tok0)} · ${amount(v1, tok1)}`;
  const lines = [
    {
      key: "collected",
      label: t.feesCollected,
      w: pair(f.last7d.collected0, f.last7d.collected1),
      c: pair(f.cumulative.collected0, f.cumulative.collected1),
    },
    {
      key: "lp",
      label: t.feesLp,
      w: pair(f.last7d.lp0, f.last7d.lp1),
      c: pair(f.cumulative.lp0, f.cumulative.lp1),
    },
    {
      key: "permanent",
      label: t.feesPermanent,
      w: pair(f.last7d.permanent0, f.last7d.permanent1),
      c: pair(f.cumulative.permanent0, f.cumulative.permanent1),
    },
  ];
  const o = f.observed;
  return (
    <Block title={t.feesTitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className={TH}>{t.colPeriod}</th>
              <th className={THR}>{t.last7d}</th>
              <th className={THR}>{t.cumulative}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.key} className="border-b border-border last:border-0">
                <td className={TD}>{l.label}</td>
                <td className={TDR}>{l.w}</td>
                <td className={TDR}>{l.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {f.cumulativeSince !== undefined && (
        <p className="text-xs text-muted-foreground">
          {t.cumulativeSince(formatDexDate(f.cumulativeSince, lang))}
        </p>
      )}
      <dl className="flex flex-col gap-1.5 border-t border-border pt-2">
        <p className="text-xs font-medium">{t.observedTitle}</p>
        <p className="text-xs text-muted-foreground">
          {t.observedPeriod(formatNumber(o.periodDays))}
        </p>
        <Row label={t.observedFees}>{usdText(t, o.feesUsdE8)}</Row>
        <Row label={t.observedLiquidity}>{usdText(t, o.liquidityUsdE8)}</Row>
        <Row label={t.observedRatio}>
          {o.feeToLiquidityBps === undefined ? (
            <Muted>{t.unavailable}</Muted>
          ) : (
            formatBps(o.feeToLiquidityBps)
          )}
        </Row>
      </dl>
    </Block>
  );
}

function PoolIndicatorCard({
  t,
  p,
  index,
  tok0,
  tok1,
  lang,
}: {
  t: Text;
  p: PoolIndicators;
  index: number;
  tok0: Tok;
  tok1: Tok;
  lang: Parameters<typeof formatDexDate>[1];
}) {
  const l = p.liquidity;
  const buckets = [
    { key: "thisWeek", label: t.bucketThisWeek, b: p.unlock.thisWeek },
    { key: "days30", label: t.bucket30, b: p.unlock.days30 },
    { key: "days90", label: t.bucket90, b: p.unlock.days90 },
    { key: "year1", label: t.bucket1y, b: p.unlock.year1 },
    { key: "overYear1", label: t.bucketOver1y, b: p.unlock.overYear1 },
    { key: "permanent", label: t.bucketPermanent, b: p.unlock.permanent },
  ];
  const c = p.concentration;
  return (
    <article
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5"
      data-ocid={`pools.indicators.card.${index}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <h3 className="font-display text-lg tracking-wide">
            {tok0.symbol} / {tok1.symbol}
          </h3>
          <span className="text-xs text-muted-foreground">
            {t.poolId(p.poolId.toString())}
          </span>
        </div>
        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
          {p.isOpen ? t.open : t.closed}
        </span>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Block title={t.reservesTitle}>
          <dl className="flex flex-col gap-1.5">
            <Row label={tok0.symbol}>{amount(p.reserve0, tok0)}</Row>
            <Row label={tok1.symbol}>{amount(p.reserve1, tok1)}</Row>
            <Row label={t.valueUsd}>
              {p.valueUsdE8 === undefined ? (
                <Muted>{t.unavailable}</Muted>
              ) : (
                usdText(t, p.valueUsdE8)
              )}
            </Row>
          </dl>
        </Block>
        <Block title={t.liquidityTitle}>
          <AmountsTable
            t={t}
            tok0={tok0}
            tok1={tok1}
            firstCol={t.colKind}
            rows={[
              {
                key: "firm",
                label: t.firmLiquidity,
                v0: l.firmAmount0,
                v1: l.firmAmount1,
                extra: formatBps(l.firmBps),
              },
              {
                key: "free",
                label: t.freeLiquidity,
                v0: l.freeAmount0,
                v1: l.freeAmount1,
                extra: formatBps(l.freeBps),
              },
            ]}
          />
        </Block>
        <DepthBlock t={t} p={p} tok0={tok0} tok1={tok1} />
        <Block title={t.unlockTitle}>
          <AmountsTable
            t={t}
            tok0={tok0}
            tok1={tok1}
            firstCol={t.colBucket}
            rows={buckets.map(({ key, label, b }) => ({
              key,
              label,
              v0: b.amount0,
              v1: b.amount1,
            }))}
          />
        </Block>
        <Block title={t.concentrationTitle}>
          <dl className="flex flex-col gap-1.5">
            <Row label={t.positionCount}>{formatNumber(c.positionCount)}</Row>
            <Row label={t.largestPosition}>
              {formatBps(c.largestPositionBps)}
            </Row>
            <Row label={t.topFive}>{formatBps(c.topFiveBps)}</Row>
            <Row label={t.permanentProtocol}>
              {formatBps(c.permanentProtocolBps)}
            </Row>
          </dl>
        </Block>
        <ActivityBlock t={t} p={p} tok0={tok0} tok1={tok1} />
      </div>
      <FeesBlock t={t} p={p} tok0={tok0} tok1={tok1} lang={lang} />
    </article>
  );
}

function resolveTok(
  pool: PoolView | undefined,
  side: "token0" | "token1",
  symbol: string,
  tokens: DexTokenInfo[],
): Tok {
  const view = pool?.[side];
  if (view) return { symbol: view.symbol, decimals: view.decimals };
  const info = tokens.find((x) => x.symbol === symbol);
  return { symbol, decimals: info?.decimals ?? 0 };
}

/** Public Indicators section of the Pools page: reads the stored snapshot. */
export function DexIndicators() {
  const t = useDict(DEX_INDICATORS_TEXT);
  const { lang } = useLanguage();
  const indicators = useDexIndicators();
  const pools = useDexPools();
  const dexTokens = useDexTokens();
  const snapshot = indicators.data;
  const tokens = dexTokens.data ?? [];
  const sortedPools = snapshot
    ? [...snapshot.pools].sort((a, b) =>
        a.poolId === b.poolId ? 0 : a.poolId < b.poolId ? -1 : 1,
      )
    : [];

  return (
    <section
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      aria-label={t.title}
      data-ocid="pools.indicators.section"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl tracking-wide">{t.title}</h2>
          <span
            className="text-sm text-muted-foreground"
            data-ocid="pools.indicators.computed_at"
          >
            {snapshot
              ? t.computedAt(formatDexDate(snapshot.computedAt, lang))
              : indicators.isSuccess
                ? t.notComputed
                : null}
          </span>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">{t.intro}</p>
      </div>

      {indicators.isPending ? (
        <Skeleton
          className="h-64 rounded-lg"
          aria-label={t.loading}
          data-ocid="pools.indicators.loading_state"
        />
      ) : indicators.isError ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="pools.indicators.error_state"
        >
          <span>{t.loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void indicators.refetch()}
            aria-label={t.loadError}
            data-ocid="pools.indicators.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : !snapshot ? (
        <p
          className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
          data-ocid="pools.indicators.empty_state"
        >
          {t.notComputedHint}
        </p>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <Summary
              t={t}
              pools={sortedPools}
              proofs={snapshot.proofs}
              reserveCheckedAt={snapshot.reserveCheckedAt}
              lang={lang}
            />
            <ProofTable t={t} proofs={snapshot.proofs} tokens={tokens} />
          </div>
          <Block title={t.perPoolTitle}>
            <div className="grid gap-5 xl:grid-cols-2">
              {sortedPools.map((p, i) => {
                const view = (pools.data ?? []).find((v) => v.id === p.poolId);
                return (
                  <PoolIndicatorCard
                    key={p.poolId.toString()}
                    t={t}
                    p={p}
                    index={i + 1}
                    tok0={resolveTok(view, "token0", p.token0Symbol, tokens)}
                    tok1={resolveTok(view, "token1", p.token1Symbol, tokens)}
                    lang={lang}
                  />
                );
              })}
            </div>
          </Block>
        </>
      )}
    </section>
  );
}
