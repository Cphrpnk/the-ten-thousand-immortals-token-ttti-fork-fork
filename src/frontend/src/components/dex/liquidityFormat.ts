import type { Principal } from "@icp-sdk/core/principal";
import { ThresholdBasis } from "../../backend";
import type {
  AddLiquidityError,
  DexToken,
  DexTokenInfo,
  ExtendLockError,
  PoolTokenView,
  PoolView,
  PositionView,
  ProtocolLiquidityView,
  ReferenceUnavailable,
  RelayOutcome,
  RemoveLiquidityError,
  SwapError,
  UsdGauge,
} from "../../backend";
import { type Lang, formatNumber } from "../../i18n/core/lang";
import { type DexText, formatDexDate, formatDexUnits } from "./dexFormat";

const USD_E8 = 100_000_000;
export const DAY_NS = 86_400_000_000_000n;
/** Swap deadline sent with each swap: now + 5 minutes. */
export const SWAP_DEADLINE_NS = 300_000_000_000n;
/** Default slippage tolerance: 0.5 %. */
export const DEFAULT_SLIPPAGE_BPS = 50n;
/** ICPSwap reference: warning above a 2 % ratio deviation. */
export const REFERENCE_WARNING_PCT = 2;

export function formatUsdE8(value: bigint): string {
  return formatNumber(Number(value) / USD_E8, { maximumFractionDigits: 2 });
}

/** "7 / 10 USD — 3 USD remaining…", or the unavailable text. */
export function gaugeText(t: DexText, gauge: UsdGauge): string {
  if (!gauge.valueAvailable || gauge.currentUsdE8 === undefined) {
    return t.gaugeUnavailable;
  }
  const current = formatUsdE8(gauge.currentUsdE8);
  const target = formatUsdE8(gauge.targetUsdE8);
  const remaining = gauge.remainingUsdE8 ?? 0n;
  return remaining > 0n
    ? t.gaugeFilling(current, target, formatUsdE8(remaining))
    : t.gaugeOpen(current, target);
}

/** Swap threshold in the pool's own measure: "10 USD of TTTI-T in the pool" or "10 USD of depth". */
export function thresholdText(t: DexText, pool: PoolView): string {
  const usd = formatUsdE8(pool.swapThresholdUsdE8);
  return pool.thresholdBasis === ThresholdBasis.tttiSideAtPoolPrice
    ? t.thresholdValueTtti(usd)
    : t.thresholdValueDepth(usd);
}

/** Threshold measure over threshold, as a 0 to 100 gauge fill. */
export function thresholdPct(pool: PoolView): number {
  const measured = pool.thresholdMeasuredUsdE8 ?? pool.gauge.currentUsdE8;
  if (measured === undefined || pool.swapThresholdUsdE8 === 0n) return 0;
  const pct = Number((measured * 10_000n) / pool.swapThresholdUsdE8) / 100;
  return Math.max(0, Math.min(100, pct));
}

/** Basis points as a localized percentage, e.g. 30 → "0.3 %". */
export function formatBps(bps: bigint): string {
  return `${formatNumber(Number(bps) / 100, { maximumFractionDigits: 2 })} %`;
}

/** Slippage text in percent ('.' or ',') → basis points, or null. */
export function parsePercentBps(text: string): bigint | null {
  const raw = text.trim().replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(raw)) return null;
  const bps = Math.round(Number(raw) * 100);
  return bps >= 0 && bps <= 5000 ? BigInt(bps) : null;
}

/** Whole or fractional days ('.' or ',') → nanoseconds, or null. */
export function parseDaysNs(text: string): bigint | null {
  const raw = text.trim().replace(",", ".");
  if (!/^\d+(\.\d{0,4})?$/.test(raw)) return null;
  const ns = BigInt(Math.round(Number(raw) * 86_400_000)) * 1_000_000n;
  return ns > 0n ? ns : null;
}

export function durationText(t: DexText, ns: bigint): string {
  if (ns === DAY_NS) return t.durationOneDay;
  const days = Number(ns) / Number(DAY_NS);
  return t.durationDays(formatNumber(days, { maximumFractionDigits: 2 }));
}

/** Fallback minimum lock: 3 months (91 days); config.minLockNs is preferred. */
export const MIN_LOCK_NS = 91n * DAY_NS;
const YEAR_DAYS = 365n;
const MONTH_DAYS = 30n;

/**
 * Years, months and days of a duration (365-day years, 30-day months), e.g.
 * "1 year 6 months 3 days". Zero or negative values read as "0 days".
 */
export function formatRemainingTime(t: DexText, ns: bigint): string {
  let days = ns > 0n ? ns / DAY_NS : 0n;
  const years = days / YEAR_DAYS;
  days -= years * YEAR_DAYS;
  const months = days / MONTH_DAYS;
  days -= months * MONTH_DAYS;
  const parts: string[] = [];
  if (years > 0n) {
    parts.push(
      years === 1n ? t.durationOneYear : t.durationYears(formatNumber(years)),
    );
  }
  if (months > 0n) {
    parts.push(
      months === 1n
        ? t.durationOneMonth
        : t.durationMonths(formatNumber(months)),
    );
  }
  if (days > 0n || parts.length === 0) {
    parts.push(
      days === 1n ? t.durationOneDay : t.durationDays(formatNumber(days)),
    );
  }
  return parts.join(" ");
}

/** Lock bound in an error: "3 months" for the minimum, otherwise the duration. */
export function lockBoundText(t: DexText, ns: bigint): string {
  if (ns >= MIN_LOCK_NS - DAY_NS && ns <= MIN_LOCK_NS + DAY_NS) {
    return t.lockPreset3m;
  }
  if (ns === FIVE_YEARS_NS) return t.lockPreset5y;
  return durationText(t, ns);
}

/** Relay received by a position, or the "None" text when it received none. */
export function relayReceivedText(t: DexText, ns: bigint): string {
  return ns > 0n ? formatRemainingTime(t, ns) : t.relayReceivedNone;
}

/** Status of a position: locked, free after a relay or its term, or free without a lock. */
export function positionStatusText(
  t: DexText,
  position: Pick<PositionView, "locked" | "lockDurationNs">,
): string {
  if (position.locked) return t.positionStatusLocked;
  return position.lockDurationNs > 0n
    ? t.positionFreeAfter
    : t.positionStatusFreeNoLock;
}

/** Summary line of a relay outcome, or the "no position shortened" text. */
export function relayOutcomeText(t: DexText, relay: RelayOutcome): string {
  if (relay.positionsShortened === 0n && relay.positionsFreed === 0n) {
    return t.relayResultNone;
  }
  return t.relayResult(
    formatNumber(relay.positionsShortened),
    formatNumber(relay.positionsFreed),
  );
}

/** Why the first-deposit reference price cannot be read. */
export function referenceUnavailableText(
  t: DexText,
  unavailable: ReferenceUnavailable,
  pool: PoolView,
): string {
  if (unavailable.__kind__ === "noReadableSource") {
    return t.referenceUnavailableNoSource;
  }
  const missing = [
    unavailable.rateUnavailable.token0 ? pool.token0.symbol : null,
    unavailable.rateUnavailable.token1 ? pool.token1.symbol : null,
  ].filter((s): s is string => s !== null);
  return t.referenceUnavailableRate(missing.join(", "));
}

export function shortPrincipal(principal: Principal): string {
  const text = principal.toText();
  return text.length > 15 ? `${text.slice(0, 8)}…${text.slice(-5)}` : text;
}

/** DEX token row of a pool token, matched by ledger ID. */
export function dexTokenOf(
  tokens: ReadonlyArray<DexTokenInfo>,
  token: PoolTokenView,
): DexTokenInfo | undefined {
  const id = token.ledgerId.toText();
  return tokens.find((info) => info.ledgerId.toText() === id);
}

function tokenUnits(
  tokens: ReadonlyArray<DexTokenInfo>,
  token: DexToken,
  value: bigint,
): string {
  const info = tokens.find((i) => i.token === token);
  return info ? formatDexUnits(value, info) : formatNumber(value);
}

export function addLiquidityErrorText(
  t: DexText,
  error: AddLiquidityError,
  pool: PoolView,
  counter: PoolTokenView,
  tokens: ReadonlyArray<DexTokenInfo>,
  lang: Lang,
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errLiqAnonymous;
    case "poolNotFound":
      return t.errPoolNotFound;
    case "poolRemoved":
      return t.errPoolRemoved;
    case "minimumsNotSet":
      return t.errMinimumsNotSet;
    case "unsupportedToken":
      return t.errUnsupportedToken;
    case "zeroAmount":
      return t.errZeroAmount;
    case "counterAmountRequired":
      return t.errCounterAmountRequired;
    case "insufficientBalance": {
      const e = error.insufficientBalance;
      return t.errLiqInsufficientBalance(
        tokenUnits(tokens, e.token, e.available),
        tokenUnits(tokens, e.token, e.required),
      );
    }
    case "belowMinimum": {
      const e = error.belowMinimum;
      const parts = [
        e.token0Minimum !== undefined
          ? formatDexUnits(e.token0Minimum, pool.token0)
          : null,
        e.token1Minimum !== undefined
          ? formatDexUnits(e.token1Minimum, pool.token1)
          : null,
      ].filter((p): p is string => p !== null);
      return t.errBelowMinimum(parts.join(", "));
    }
    case "ratioMismatch":
      return t.errRatioMismatch(
        formatDexUnits(error.ratioMismatch.requiredCounterAmount, counter),
      );
    case "lockTooShort":
      return t.errLockTooShort(lockBoundText(t, error.lockTooShort.minimumNs));
    case "lockTooLong":
      return t.errLockTooLong(lockBoundText(t, error.lockTooLong.maximumNs));
    case "zeroShares":
      return t.errZeroShares;
    case "operationInProgress":
      return t.errOperationInProgress;
    case "invalidSlippage":
      return t.errAddInvalidSlippage(
        formatNumber(Number(error.invalidSlippage.maximumBps) / 100, {
          maximumFractionDigits: 2,
        }),
      );
    case "slippageExceeded": {
      const e = error.slippageExceeded;
      return t.errAddSlippageExceeded(
        percentText(e.toleranceBps),
        formatDexUnits(e.expectedCounterAmount, counter),
        formatDexUnits(e.actualCounterAmount, counter),
      );
    }
    case "referenceOutOfBand": {
      const e = error.referenceOutOfBand;
      return t.errAddReferenceOutOfBand(
        ratioText(e.expected, pool),
        percentText(e.deviationBps),
        percentText(e.toleranceBps),
      );
    }
    case "referenceUnavailable":
      return t.errAddReferenceUnavailable;
    case "removalAnnounced":
      return t.errAddRemovalAnnounced(
        formatDexDate(error.removalAnnounced.effectiveAt, lang),
      );
  }
}

/** Basis points as a bare localized percentage, e.g. 200 → "2". */
export function percentText(bps: bigint): string {
  return formatNumber(Number(bps) / 100, { maximumFractionDigits: 2 });
}

/** Expected raw ratio amount1 / amount0 as "1 SYM0 = X SYM1" in display units. */
export function ratioText(
  ratio: { numerator: bigint; denominator: bigint },
  pool: PoolView,
): string {
  if (ratio.denominator === 0n) return "—";
  const value =
    (Number(ratio.numerator) / Number(ratio.denominator)) *
    10 ** (pool.token0.decimals - pool.token1.decimals);
  return `1 ${pool.token0.symbol} = ${formatNumber(value, {
    maximumFractionDigits: 6,
  })} ${pool.token1.symbol}`;
}

export function removeLiquidityErrorText(
  t: DexText,
  error: RemoveLiquidityError,
  lang: Lang,
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errLiqAnonymous;
    case "positionNotFound":
      return t.errPositionNotFound;
    case "notPositionOwner":
      return t.errNotPositionOwner;
    case "poolNotFound":
      return t.errPoolNotFound;
    case "positionLocked":
      return t.errPositionLocked(
        formatDexDate(error.positionLocked.unlockAt, lang),
      );
    case "operationInProgress":
      return t.errOperationInProgress;
  }
}

export function extendLockErrorText(
  t: DexText,
  error: ExtendLockError,
  lang: Lang,
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errLiqAnonymous;
    case "positionNotFound":
      return t.errPositionNotFound;
    case "notPositionOwner":
      return t.errNotPositionOwner;
    case "cannotShortenLock":
      return t.errCannotShortenLock(
        formatDexDate(error.cannotShortenLock.unlockAt, lang),
      );
    case "lockTooLong":
      return t.errUnlockTooLate(
        formatDexDate(error.lockTooLong.maximumUnlockAt, lang),
      );
    case "lockTooShort":
      return t.errLockTooShort(lockBoundText(t, error.lockTooShort.minimumNs));
    case "poolNotFound":
      return t.errPoolNotFound;
    case "poolRemoved":
      return t.errPoolRemoved;
    case "removalAnnounced":
      return t.errExtendRemovalAnnounced(
        formatDexDate(error.removalAnnounced.effectiveAt, lang),
      );
    case "operationInProgress":
      return t.errOperationInProgress;
  }
}

export function swapErrorText(
  t: DexText,
  error: SwapError,
  tokenIn: { decimals: number; symbol: string },
  tokenOut: { decimals: number; symbol: string },
  lang: Lang,
): string {
  switch (error.__kind__) {
    case "anonymous":
      return t.errLiqAnonymous;
    case "poolNotFound":
      return t.errPoolNotFound;
    case "poolFilling":
      return t.errPoolFilling(gaugeText(t, error.poolFilling.gauge));
    case "poolRemoved":
      return t.errPoolRemoved;
    case "poolNotOpen":
      return t.errPoolNotOpen;
    case "rateUnavailable":
      return t.errRateUnavailable;
    case "unsupportedToken":
      return t.errUnsupportedToken;
    case "tokenNotInPool":
      return t.errTokenNotInPool;
    case "zeroAmount":
      return t.errZeroAmount;
    case "invalidSlippage":
      return t.errInvalidSlippage(
        formatNumber(Number(error.invalidSlippage.maximumBps) / 100, {
          maximumFractionDigits: 2,
        }),
      );
    case "insufficientBalance":
      return t.errSwapInsufficientBalance(
        formatDexUnits(error.insufficientBalance.available, tokenIn),
      );
    case "insufficientLiquidity":
      return t.errInsufficientLiquidity;
    case "slippageExceeded":
      return t.errSlippageExceeded(
        formatDexUnits(error.slippageExceeded.amountOut, tokenOut),
        formatDexUnits(error.slippageExceeded.minAmountOut, tokenOut),
      );
    case "deadlineExceeded":
      return t.errDeadlineExceeded(
        formatDexDate(error.deadlineExceeded.deadline, lang),
      );
    case "deadlineTooFar":
      return t.errDeadlineTooFar(
        formatDexDate(error.deadlineTooFar.maximum, lang),
      );
    case "operationInProgress":
      return t.errOperationInProgress;
    case "removalInProgress":
      return t.errRemovalInProgress(
        formatDexDate(error.removalInProgress.effectiveAt, lang),
      );
    case "depthBelowThreshold":
      return t.errDepthBelowThreshold(
        formatUsdE8(error.depthBelowThreshold.depthUsdE8),
        formatUsdE8(error.depthBelowThreshold.thresholdUsdE8),
      );
  }
}

// DEX lot 4: ICP bonus weight and protocol liquidity.

/** Five years in nanoseconds, the maximum lock and the bonus weight divisor (as in the backend). */
export const FIVE_YEARS_NS = 157_766_400_000_000_000n;

/**
 * Bonus weight = value in ICP x remaining lock time / 5 years. The backend
 * weight is in e8s of ICP; shown as an ICP-equivalent number.
 */
export function formatBonusWeight(weight: bigint): string {
  return formatNumber(Number(weight) / 1e8, { maximumFractionDigits: 4 });
}

/** Remaining lock (ns) as a localized number of days. */
export function remainingLockText(t: DexText, ns: bigint): string {
  return durationText(t, ns > 0n ? ns : 0n);
}

/** Protocol liquidity share of the pool, e.g. "3.25" (percent, no sign). */
export function protocolSharePct(view: ProtocolLiquidityView): string {
  if (view.totalShares === 0n) return formatNumber(0);
  const pct = (Number(view.shares) / Number(view.totalShares)) * 100;
  return formatNumber(pct, { maximumFractionDigits: 2 });
}

function symbolUnits(
  tokens: ReadonlyArray<DexTokenInfo>,
  symbol: string,
  value: bigint,
  units: (value: bigint, info: DexTokenInfo) => string,
): string {
  const info = tokens.find((i) => i.symbol === symbol);
  return info ? units(value, info) : `${formatNumber(value)} ${symbol}`;
}

/** Localized lines of one pool's protocol liquidity (held, from fees, from treasury). */
export function protocolLiquidityLines(
  t: DexText,
  view: ProtocolLiquidityView,
  tokens: ReadonlyArray<DexTokenInfo>,
  lang: Lang,
  units: (value: bigint, info: DexTokenInfo) => string = formatDexUnits,
): {
  held: string;
  fromFees: string;
  fromTreasury: string;
  share: string;
  lastAdded: string | null;
} {
  const a = (v: bigint) => symbolUnits(tokens, view.token0Symbol, v, units);
  const b = (v: bigint) => symbolUnits(tokens, view.token1Symbol, v, units);
  return {
    held: t.protocolLiquidityHeld(a(view.amount0), b(view.amount1)),
    fromFees: t.protocolLiquidityFromFees(a(view.fromFees0), b(view.fromFees1)),
    fromTreasury: t.protocolLiquidityFromTreasury(
      a(view.fromTreasury0),
      b(view.fromTreasury1),
    ),
    share: t.protocolLiquidityShare(protocolSharePct(view)),
    lastAdded:
      view.lastAddedAt === undefined
        ? null
        : t.protocolLiquidityLastAdded(formatDexDate(view.lastAddedAt, lang)),
  };
}
