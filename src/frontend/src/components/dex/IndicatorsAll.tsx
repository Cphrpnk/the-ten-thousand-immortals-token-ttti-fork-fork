import type { ReactNode } from "react";
import { formatNumber } from "../../i18n/core/lang";
import {
  Amt,
  Muted,
  type PoolItem,
  TD,
  TDR,
  TH,
  THR,
  TR,
  Table,
  type Text,
  pairLabel,
  usdText,
} from "./indicatorParts";
import { formatBps } from "./liquidityFormat";

/* "All pools" views of the indicator blocks. Pools hold different tokens, so
 * token amounts are listed per pool and only USD values and counts are summed. */

const sumDefined = (values: Array<bigint | undefined>) => {
  const defined = values.filter((v): v is bigint => v !== undefined);
  return defined.length === 0 ? undefined : defined.reduce((s, v) => s + v, 0n);
};

const pairs = (item: PoolItem, v0: bigint, v1: bigint) => (
  <>
    <Amt value={v0} tok={item.tok0} /> · <Amt value={v1} tok={item.tok1} />
  </>
);

function TotalRow({ t, cells }: { t: Text; cells: ReactNode[] }) {
  return (
    <tr className="border-t border-primary/30 font-medium">
      <td className={TD}>{t.total}</td>
      {cells.map((c, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed column order
        <td key={i} className={TDR}>
          {c}
        </td>
      ))}
    </tr>
  );
}

export function AllReserves({ t, items }: { t: Text; items: PoolItem[] }) {
  const total = sumDefined(items.map((i) => i.p.valueUsdE8));
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.colPair}</th>
          <th className={THR}>{t.reservesTitle}</th>
          <th className={THR}>{t.valueUsd}</th>
        </>
      }
    >
      {items.map((item) => (
        <tr key={item.p.poolId.toString()} className={TR}>
          <td className={TD}>{pairLabel(item)}</td>
          <td className={TDR}>
            {pairs(item, item.p.reserve0, item.p.reserve1)}
          </td>
          <td className={TDR}>
            {item.p.valueUsdE8 === undefined ? (
              <Muted>{t.unavailable}</Muted>
            ) : (
              usdText(t, item.p.valueUsdE8)
            )}
          </td>
        </tr>
      ))}
      <TotalRow
        t={t}
        cells={[
          "",
          total === undefined ? (
            <Muted key="total-unavailable">{t.unavailable}</Muted>
          ) : (
            usdText(t, total)
          ),
        ]}
      />
    </Table>
  );
}

export function AllLiquidity({ t, items }: { t: Text; items: PoolItem[] }) {
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.colPair}</th>
          <th className={THR}>{t.firmLiquidity}</th>
          <th className={THR}>{t.freeLiquidity}</th>
        </>
      }
    >
      {items.map((item) => {
        const l = item.p.liquidity;
        return (
          <tr key={item.p.poolId.toString()} className={TR}>
            <td className={TD}>{pairLabel(item)}</td>
            <td className={TDR}>
              <span className="block">{formatBps(l.firmBps)}</span>
              <span className="block text-muted-foreground">
                {pairs(item, l.firmAmount0, l.firmAmount1)}
              </span>
            </td>
            <td className={TDR}>
              <span className="block">{formatBps(l.freeBps)}</span>
              <span className="block text-muted-foreground">
                {pairs(item, l.freeAmount0, l.freeAmount1)}
              </span>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

export function AllConcentration({ t, items }: { t: Text; items: PoolItem[] }) {
  const positions = items.reduce(
    (s, i) => s + i.p.concentration.positionCount,
    0n,
  );
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.colPair}</th>
          <th className={THR}>{t.positionCount}</th>
          <th className={THR}>{t.largestPosition}</th>
          <th className={THR}>{t.topFive}</th>
          <th className={THR}>{t.permanentProtocol}</th>
        </>
      }
    >
      {items.map((item) => {
        const c = item.p.concentration;
        return (
          <tr key={item.p.poolId.toString()} className={TR}>
            <td className={TD}>{pairLabel(item)}</td>
            <td className={TDR}>{formatNumber(c.positionCount)}</td>
            <td className={TDR}>{formatBps(c.largestPositionBps)}</td>
            <td className={TDR}>{formatBps(c.topFiveBps)}</td>
            <td className={TDR}>{formatBps(c.permanentProtocolBps)}</td>
          </tr>
        );
      })}
      <TotalRow t={t} cells={[formatNumber(positions), "", "", ""]} />
    </Table>
  );
}

export function AllActivity({ t, items }: { t: Text; items: PoolItem[] }) {
  const swaps24 = items.reduce(
    (s, i) => s + i.p.activity.last24h.swapCount,
    0n,
  );
  const swaps7 = items.reduce((s, i) => s + i.p.activity.last7d.swapCount, 0n);
  const usd = (v: bigint | undefined) =>
    v === undefined ? <Muted>{t.unavailable}</Muted> : usdText(t, v);
  return (
    <Table
      head={
        <>
          <th className={TH}>{t.colPair}</th>
          <th className={THR}>{`${t.swapCount} · ${t.window24h}`}</th>
          <th className={THR}>{`${t.swapCount} · ${t.window7d}`}</th>
          <th className={THR}>{`${t.volumeUsd} · ${t.window24h}`}</th>
          <th className={THR}>{`${t.volumeUsd} · ${t.window7d}`}</th>
        </>
      }
    >
      {items.map((item) => {
        const a = item.p.activity;
        return (
          <tr key={item.p.poolId.toString()} className={TR}>
            <td className={TD}>{pairLabel(item)}</td>
            <td className={TDR}>{formatNumber(a.last24h.swapCount)}</td>
            <td className={TDR}>{formatNumber(a.last7d.swapCount)}</td>
            <td className={TDR}>{usd(a.last24h.volumeUsdE8)}</td>
            <td className={TDR}>{usd(a.last7d.volumeUsdE8)}</td>
          </tr>
        );
      })}
      <TotalRow
        t={t}
        cells={[
          formatNumber(swaps24),
          formatNumber(swaps7),
          usd(sumDefined(items.map((i) => i.p.activity.last24h.volumeUsdE8))),
          usd(sumDefined(items.map((i) => i.p.activity.last7d.volumeUsdE8))),
        ]}
      />
    </Table>
  );
}

/** Lists one pool-level body per pool, under the pair name. */
export function PerPoolList({
  items,
  render,
}: { items: PoolItem[]; render: (item: PoolItem) => ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <div key={item.p.poolId.toString()} className="flex flex-col gap-2">
          <h4 className="font-mono text-xs tracking-wide text-primary">
            {pairLabel(item)}
          </h4>
          {render(item)}
        </div>
      ))}
    </div>
  );
}
