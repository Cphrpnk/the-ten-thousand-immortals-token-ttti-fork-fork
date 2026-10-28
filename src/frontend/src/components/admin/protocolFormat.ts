import type { PoolView, TokenAmounts } from "../../backend";
import { PayToken } from "../../backend";
import { formatPayAmount, formatUnits } from "../../lib/token";

export const PAY_TOKEN_KEYS: ReadonlyArray<PayToken> = [
  PayToken.icp,
  PayToken.ckbtc,
  PayToken.ckusdc,
  PayToken.ckusdt,
];

/** "3.25 %" from basis points, English format. */
export function formatBpsEn(bps: bigint): string {
  return `${(Number(bps) / 100).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} %`;
}

export function formatCyclesPerDay(cycles: bigint | undefined): string {
  if (cycles === undefined) return "Not enough data";
  return `${(Number(cycles) / 1e12).toFixed(3)} T cycles / day`;
}

export function formatDays(days: bigint | undefined): string {
  return days === undefined ? "Not enough data" : `${days.toString()} days`;
}

export function poolLabel(
  pools: ReadonlyArray<PoolView> | undefined,
  poolId: bigint,
): string {
  const pool = pools?.find((p) => p.id === poolId);
  return pool
    ? `${pool.token0.symbol}/${pool.token1.symbol} (#${poolId.toString()})`
    : `Pool #${poolId.toString()}`;
}

/** Amount of one pool side (0 or 1) with the pool token's decimals. */
export function poolSideAmount(
  pools: ReadonlyArray<PoolView> | undefined,
  poolId: bigint,
  side: 0 | 1,
  value: bigint,
): string {
  const pool = pools?.find((p) => p.id === poolId);
  if (!pool) return value.toString();
  const token = side === 0 ? pool.token0 : pool.token1;
  return `${formatUnits(value, token.decimals, 2, "en")} ${token.symbol}`;
}

/** Non-zero entries of a per-token amount record, or "None". */
export function formatTokenAmounts(amounts: TokenAmounts): string {
  const parts = PAY_TOKEN_KEYS.filter((token) => amounts[token] > 0n).map(
    (token) => formatPayAmount(amounts[token], token, "en"),
  );
  return parts.length === 0 ? "None" : parts.join(" · ");
}
