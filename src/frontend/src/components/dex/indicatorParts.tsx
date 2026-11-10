import type { ReactNode } from "react";
import { ReserveStatus } from "../../backend";
import type { PoolIndicators } from "../../backend";
import { formatNumber } from "../../i18n/core/lang";
import type { DEX_INDICATORS_TEXT } from "../../i18n/pages/dexIndicators";
import { formatUnits } from "../../lib/token";
import type { FiatToken } from "../FiatAmount";
import { DexFiat } from "./DexFiat";
import { formatDexDate } from "./dexFormat";
import { formatBps, formatUsdE8 } from "./liquidityFormat";

export type Text = (typeof DEX_INDICATORS_TEXT)["en"];
/** Token metadata of an indicator; `fiat` is unset when the token is unresolved. */
export type Tok = { symbol: string; decimals: number; fiat?: FiatToken };
export type Lang = Parameters<typeof formatDexDate>[1];
/** One snapshot pool with its resolved token metadata. */
export type PoolItem = { p: PoolIndicators; tok0: Tok; tok1: Tok };

export const TH = "py-1.5 pe-3 text-start font-normal text-muted-foreground";
export const THR = "py-1.5 ps-3 text-end font-normal text-muted-foreground";
export const TD = "py-1.5 pe-3";
export const TDR = "py-1.5 ps-3 text-end tabular-nums";
export const DEPTH_LEVELS = [
  { key: "onePercent", bps: 100n },
  { key: "twoPercent", bps: 200n },
  { key: "fivePercent", bps: 500n },
] as const;

export const amount = (value: bigint, tok: Tok) =>
  `${formatUnits(value, tok.decimals, 0)} ${tok.symbol}`;

/** Amount of a token followed by its discreet USD equivalent (a dash when unknown). */
export function AmtFiat({ value, tok }: { value: bigint; tok: Tok }) {
  return tok.fiat ? (
    <DexFiat token={tok.fiat} amount={value} />
  ) : (
    <Muted>{"—"}</Muted>
  );
}

export function Amt({ value, tok }: { value: bigint; tok: Tok }) {
  return (
    <>
      {amount(value, tok)} <AmtFiat value={value} tok={tok} />
    </>
  );
}

export const usdText = (t: Text, value: bigint | undefined) =>
  value === undefined ? t.unavailable : `${formatUsdE8(value)} USD`;

export const pairLabel = (item: PoolItem) =>
  `${item.tok0.symbol} / ${item.tok1.symbol}`;

export function Row({
  label,
  children,
}: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-end tabular-nums">{children}</dd>
    </div>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

export function Table({
  head,
  children,
}: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const TR = "border-b border-border last:border-0";

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
    <Table
      head={
        <>
          <th className={TH}>{firstCol}</th>
          <th className={THR}>{tok0.symbol}</th>
          <th className={THR}>{tok1.symbol}</th>
          {hasExtra && <th className={THR}>{t.colShare}</th>}
        </>
      }
    >
      {rows.map((r) => (
        <tr key={r.key} className={TR}>
          <td className={TD}>{r.label}</td>
          <td className={TDR}>
            {formatUnits(r.v0, tok0.decimals, 0)}{" "}
            <AmtFiat value={r.v0} tok={tok0} />
          </td>
          <td className={TDR}>
            {formatUnits(r.v1, tok1.decimals, 0)}{" "}
            <AmtFiat value={r.v1} tok={tok1} />
          </td>
          {hasExtra && <td className={TDR}>{r.extra}</td>}
        </tr>
      ))}
    </Table>
  );
}

export function ReservesBody({ t, item }: { t: Text; item: PoolItem }) {
  const { p, tok0, tok1 } = item;
  return (
    <dl className="flex flex-col gap-1.5">
      <Row label={tok0.symbol}>
        <Amt value={p.reserve0} tok={tok0} />
      </Row>
      <Row label={tok1.symbol}>
        <Amt value={p.reserve1} tok={tok1} />
      </Row>
      <Row label={t.valueUsd}>
        {p.valueUsdE8 === undefined ? (
          <Muted>{t.unavailable}</Muted>
        ) : (
          usdText(t, p.valueUsdE8)
        )}
      </Row>
    </dl>
  );
}

export function LiquidityBody({ t, item }: { t: Text; item: PoolItem }) {
  const l = item.p.liquidity;
  return (
    <AmountsTable
      t={t}
      tok0={item.tok0}
      tok1={item.tok1}
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
  );
}

export function DepthBody({ t, item }: { t: Text; item: PoolItem }) {
  const { p, tok0, tok1 } = item;
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.depthMove}</th>
          <th className={THR}>{t.depthIn(tok0.symbol)}</th>
          <th className={THR}>{t.depthIn(tok1.symbol)}</th>
        </>
      }
    >
      {DEPTH_LEVELS.map(({ key, bps }) => {
        const level = p.depth[key];
        const cell = (side: typeof level.token0In, inTok: Tok, outTok: Tok) =>
          p.isOpen ? (
            <>
              <Amt value={side.amountIn} tok={inTok} /> →{" "}
              <Amt value={side.amountOut} tok={outTok} />
            </>
          ) : (
            <Muted>{t.notOpen}</Muted>
          );
        return (
          <tr key={key} className={TR}>
            <td className={TD}>{formatBps(bps)}</td>
            <td className={TDR}>{cell(level.token0In, tok0, tok1)}</td>
            <td className={TDR}>{cell(level.token1In, tok1, tok0)}</td>
          </tr>
        );
      })}
    </Table>
  );
}

export function UnlockBody({ t, item }: { t: Text; item: PoolItem }) {
  const u = item.p.unlock;
  const buckets = [
    { key: "thisWeek", label: t.bucketThisWeek, b: u.thisWeek },
    { key: "days30", label: t.bucket30, b: u.days30 },
    { key: "days90", label: t.bucket90, b: u.days90 },
    { key: "year1", label: t.bucket1y, b: u.year1 },
    { key: "overYear1", label: t.bucketOver1y, b: u.overYear1 },
    { key: "permanent", label: t.bucketPermanent, b: u.permanent },
  ];
  return (
    <AmountsTable
      t={t}
      tok0={item.tok0}
      tok1={item.tok1}
      firstCol={t.colBucket}
      rows={buckets.map(({ key, label, b }) => ({
        key,
        label,
        v0: b.amount0,
        v1: b.amount1,
      }))}
    />
  );
}

export function ConcentrationBody({ t, item }: { t: Text; item: PoolItem }) {
  const c = item.p.concentration;
  return (
    <dl className="flex flex-col gap-1.5">
      <Row label={t.positionCount}>{formatNumber(c.positionCount)}</Row>
      <Row label={t.largestPosition}>{formatBps(c.largestPositionBps)}</Row>
      <Row label={t.topFive}>{formatBps(c.topFiveBps)}</Row>
      <Row label={t.permanentProtocol}>{formatBps(c.permanentProtocolBps)}</Row>
    </dl>
  );
}

export function ActivityBody({ t, item }: { t: Text; item: PoolItem }) {
  const { p, tok0, tok1 } = item;
  const windows = [
    { key: "24h", label: t.window24h, w: p.activity.last24h },
    { key: "7d", label: t.window7d, w: p.activity.last7d },
  ];
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.colPeriod}</th>
          <th className={THR}>{t.swapCount}</th>
          <th className={THR}>{`${t.volume} ${tok0.symbol}`}</th>
          <th className={THR}>{`${t.volume} ${tok1.symbol}`}</th>
          <th className={THR}>{t.volumeUsd}</th>
        </>
      }
    >
      {windows.map(({ key, label, w }) => (
        <tr key={key} className={TR}>
          <td className={TD}>{label}</td>
          <td className={TDR}>{formatNumber(w.swapCount)}</td>
          <td className={TDR}>
            {formatUnits(w.volume0, tok0.decimals, 0)}{" "}
            <AmtFiat value={w.volume0} tok={tok0} />
          </td>
          <td className={TDR}>
            {formatUnits(w.volume1, tok1.decimals, 0)}{" "}
            <AmtFiat value={w.volume1} tok={tok1} />
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
    </Table>
  );
}

export function FeesBody({
  t,
  item,
  lang,
}: { t: Text; item: PoolItem; lang: Lang }) {
  const { tok0, tok1 } = item;
  const f = item.p.fees;
  const pair = (v0: bigint, v1: bigint) => (
    <>
      <Amt value={v0} tok={tok0} /> · <Amt value={v1} tok={tok1} />
    </>
  );
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
    <div className="flex flex-col gap-3">
      <Table
        head={
          <>
            <th className={TH}>{t.colPeriod}</th>
            <th className={THR}>{t.last7d}</th>
            <th className={THR}>{t.cumulative}</th>
          </>
        }
      >
        {lines.map((l) => (
          <tr key={l.key} className={TR}>
            <td className={TD}>{l.label}</td>
            <td className={TDR}>{l.w}</td>
            <td className={TDR}>{l.c}</td>
          </tr>
        ))}
      </Table>
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
    </div>
  );
}

/** Label of a reserve status: match, surplus or shortfall. */
export function proofStatusLabel(t: Text, status: ReserveStatus): string {
  switch (status) {
    case ReserveStatus.ok:
      return t.statusMatch;
    case ReserveStatus.surplus:
      return t.statusSurplus;
    case ReserveStatus.shortfall:
      return t.statusShortfall;
  }
}
