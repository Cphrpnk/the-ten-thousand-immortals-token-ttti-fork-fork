import { ChevronDown, TriangleAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  DepthBasis,
  PoolKind,
  PoolStatus,
  SpreadStatus,
  ThresholdBasis,
} from "../../backend";
import type {
  DexConfig,
  EstimatedShareView,
  PendingPotView,
  PoolSpread,
  PoolTokenView,
  PoolView,
} from "../../backend";
import { useCountdown } from "../../hooks/useCountdown";
import {
  type PoolReferenceState,
  useDexPendingPots,
  usePoolPositions,
  usePoolSpreads,
} from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { type Lang, formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Progress } from "../ui/progress";
import { formatSignedBps } from "./ConsolidatedPrice";
import { DexTokenAmount, useDexFiatText, useDexUnitsText } from "./DexFiat";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { DexPairLogos } from "./DexTokenLogo";
import { ReferencePriceBlock } from "./IcpswapReference";
import {
  type DexText,
  feeTierLabel,
  formatDexDate,
  formatTokenAmount,
  formatTttiAmount,
} from "./dexFormat";
import {
  formatBps,
  formatUsdE8,
  percentText,
  thresholdPct,
  thresholdText,
} from "./liquidityFormat";

export type PoolAction = "add" | "swap" | "positions";

type RowStatus = "waiting" | "filling" | "open" | "removed";

/** Removal completed or pool marked removed. */
function isRemoved(pool: PoolView): boolean {
  return (
    pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed"
  );
}

/** Additions are suspended by an announced, executing or completed removal. */
export function removalBlocksLiquidity(pool: PoolView): boolean {
  const kind = pool.removal.__kind__;
  return isRemoved(pool) || kind === "announced" || kind === "executing";
}

/** Swaps are refused for a removal reason (never for depth or rates). */
export function swapsBlockedByRemoval(pool: PoolView): boolean {
  const kind = pool.swapState.reason.__kind__;
  return (
    isRemoved(pool) ||
    kind === "removalAnnounced" ||
    kind === "removalExecuting" ||
    kind === "removed"
  );
}

function rowStatus(pool: PoolView): RowStatus {
  if (isRemoved(pool)) return "removed";
  if (pool.swapState.open) return "open";
  return pool.totalShares === 0n ? "waiting" : "filling";
}

function statusText(t: DexText, status: RowStatus): string {
  switch (status) {
    case "waiting":
      return t.statusWaiting;
    case "filling":
      return t.swapsClosedBadge;
    case "open":
      return t.swapsOpenBadge;
    case "removed":
      return t.statusRemoved;
  }
}

/** Depth in USD, or the unavailable text naming the missing rates. */
export function poolDepthText(t: DexText, pool: PoolView): string {
  const { usdE8, missingRate } = pool.depth;
  if (usdE8 !== undefined) return t.depthValue(formatUsdE8(usdE8));
  const missing = [
    missingRate.token0 ? pool.token0.symbol : null,
    missingRate.token1 ? pool.token1.symbol : null,
  ].filter((s): s is string => s !== null);
  return missing.length > 0
    ? `${t.depthUnavailable} ${t.depthMissingRate(missing.join(", "))}`
    : t.depthUnavailable;
}

/** Guaranteed depth: USD value of locked positions plus permanent liquidity, or the unavailable text. */
export function guaranteedDepthText(t: DexText, pool: PoolView): string {
  const { usdE8, missingRate } = pool.guaranteedDepth.depth;
  if (usdE8 !== undefined) return t.depthValue(formatUsdE8(usdE8));
  const missing = [
    missingRate.token0 ? pool.token0.symbol : null,
    missingRate.token1 ? pool.token1.symbol : null,
  ].filter((s): s is string => s !== null);
  return missing.length > 0
    ? `${t.depthUnavailable} ${t.depthMissingRate(missing.join(", "))}`
    : t.depthUnavailable;
}

/** Guaranteed reserves of both tokens. */
export function guaranteedReservesText(
  t: DexText,
  pool: PoolView,
  format: (amount: bigint, token: PoolTokenView) => string = formatTokenAmount,
): string {
  return t.guaranteedDepthReserves(
    format(pool.guaranteedDepth.amount0, pool.token0),
    format(pool.guaranteedDepth.amount1, pool.token1),
  );
}

/** Clear reason why swaps are closed, or null while they are open. */
export function swapClosedText(
  t: DexText,
  pool: PoolView,
  lang: Lang,
): string | null {
  const reason = pool.swapState.reason;
  switch (reason.__kind__) {
    case "open":
      return null;
    case "belowThreshold":
      return t.swapClosedBelowThreshold(
        formatUsdE8(reason.belowThreshold.depthUsdE8),
        thresholdText(t, pool),
      );
    case "rateUnavailable":
      return t.swapClosedRateUnavailable;
    case "removalAnnounced":
      return t.swapClosedRemovalAnnounced(
        formatDexDate(reason.removalAnnounced.effectiveAt, lang),
      );
    case "removalExecuting":
      return t.swapClosedRemovalExecuting;
    case "removed":
      return t.swapClosedRemoved;
  }
}

/** Short label of the removal state. */
export function removalLabel(t: DexText, pool: PoolView, lang: Lang): string {
  const removal = pool.removal;
  switch (removal.__kind__) {
    case "none":
      return t.adminRemovalNone;
    case "announced":
      return `${t.removalBadge} · ${t.removalEffectiveAt(
        formatDexDate(removal.announced.effectiveAt, lang),
      )}`;
    case "cancelled":
      return t.removalCancelledTitle;
    case "executing":
      return t.removalExecutingTitle;
    case "completed":
      return t.removalCompletedTitle;
  }
}

/** Live countdown to the effective date of a removal. */
function RemovalCountdown({
  effectiveAt,
  index,
}: {
  effectiveAt: bigint;
  index: number;
}) {
  const t = useDict(DEX_TEXT);
  const c = useCountdown(effectiveAt);
  const parts: string[] = [];
  if (c.days > 0) parts.push(t.countdownDays(String(c.days)));
  if (c.days > 0 || c.hours > 0) parts.push(t.countdownHours(String(c.hours)));
  if (c.days > 0 || c.hours > 0 || c.minutes > 0) {
    parts.push(t.countdownMinutes(String(c.minutes)));
  }
  parts.push(t.countdownSeconds(String(c.seconds)));
  return (
    <span
      className="tabular-nums"
      data-ocid={`pools.removal_countdown.${index}`}
    >
      {c.reached ? (
        t.countdownReached
      ) : (
        <>
          {t.countdownLabel}:{" "}
          <strong className="font-medium">{parts.join(" ")}</strong>
        </>
      )}
    </span>
  );
}

/** Public removal announcement and the later removal states. */
function RemovalNotice({ pool, index }: { pool: PoolView; index: number }) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const removal = pool.removal;
  const date = (ts: bigint) => formatDexDate(ts, lang);
  let body: ReactNode = null;
  switch (removal.__kind__) {
    case "none":
      return null;
    case "announced":
      body = (
        <>
          <strong className="font-medium">{t.removalAnnouncedTitle}</strong>
          <span className="break-words">
            {t.removalReasonLabel}: {removal.announced.reason}
          </span>
          <span className="tabular-nums">
            {t.removalAnnouncedAt(date(removal.announced.announcedAt))}
            {" · "}
            {t.removalEffectiveAt(date(removal.announced.effectiveAt))}
          </span>
          <RemovalCountdown
            effectiveAt={removal.announced.effectiveAt}
            index={index}
          />
          <span>{t.removalSuspendedNotice}</span>
          <span>{t.removalLiquidationNotice}</span>
        </>
      );
      break;
    case "cancelled":
      body = (
        <>
          <strong className="font-medium">{t.removalCancelledTitle}</strong>
          <span className="break-words">
            {t.removalReasonLabel}: {removal.cancelled.reason}
          </span>
          <span>
            {t.removalCancelledNotice(date(removal.cancelled.cancelledAt))}
          </span>
        </>
      );
      break;
    case "executing":
      body = (
        <>
          <strong className="font-medium">{t.removalExecutingTitle}</strong>
          <span className="break-words">
            {t.removalReasonLabel}: {removal.executing.reason}
          </span>
          <RemovalCountdown
            effectiveAt={removal.executing.effectiveAt}
            index={index}
          />
          <span>{t.removalExecutingNotice}</span>
        </>
      );
      break;
    case "completed":
      body = (
        <>
          <strong className="font-medium">{t.removalCompletedTitle}</strong>
          <span className="break-words">
            {t.removalReasonLabel}: {removal.completed.reason}
          </span>
          <span>
            {t.removalCompletedNotice(date(removal.completed.completedAt))}
          </span>
        </>
      );
      break;
  }
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-3 py-2 text-xs",
        removal.__kind__ === "cancelled" ? "callout-info" : "callout-danger",
      )}
      data-ocid={`pools.removal_notice.${index}`}
    >
      {body}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 tabular-nums sm:text-end">{children}</dd>
    </div>
  );
}

/** Pending pot of a pool (both tokens) and its next sharing time; a dash while unavailable. */
export function PendingPotDisplay({
  pot,
  pending,
  pool,
  ocid,
}: {
  pot: PendingPotView | null | undefined;
  pending: boolean;
  pool: PoolView;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  if (!pot) {
    return (
      <span data-ocid={ocid}>
        {pending ? t.positionsLoading : <span aria-hidden="true">—</span>}
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-0.5 sm:items-end" data-ocid={ocid}>
      <span>
        <DexTokenAmount amount={pot.pending0} token={pool.token0} /> ·{" "}
        <DexTokenAmount amount={pot.pending1} token={pool.token1} />
      </span>
      <span className="text-xs text-muted-foreground">
        {pot.sharingRunning
          ? t.pendingPotRunning
          : t.pendingPotNext(formatDexDate(pot.nextSharingAt, lang))}
      </span>
    </span>
  );
}

/** Pending pot of a pool, read from the list of every pool's pending pot. */
export function PendingPotValue({
  pool,
  ocid,
}: { pool: PoolView; ocid: string }) {
  const pots = useDexPendingPots();
  const pot = pots.data?.find((p) => p.poolId === pool.id);
  return (
    <PendingPotDisplay
      pot={pot}
      pending={pots.isPending}
      pool={pool}
      ocid={ocid}
    />
  );
}

/** Estimated share of the current day of one position, in both tokens. */
export function EstimatedShareValue({
  share,
  pool,
  ocid,
}: {
  share: EstimatedShareView | null | undefined;
  pool: PoolView | undefined;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  if (!share) {
    return (
      <span data-ocid={ocid}>
        <span aria-hidden="true">—</span>
      </span>
    );
  }
  const amounts = pool ? (
    <>
      <DexTokenAmount amount={share.estimated0} token={pool.token0} /> ·{" "}
      <DexTokenAmount amount={share.estimated1} token={pool.token1} />
    </>
  ) : (
    `${formatNumber(share.estimated0)} · ${formatNumber(share.estimated1)}`
  );
  return (
    <span className="flex flex-col gap-0.5" data-ocid={ocid}>
      <span>{amounts}</span>
      <span className="text-xs text-muted-foreground">
        {share.dayFractionBps === 0n
          ? t.estimatedShareNone
          : t.estimatedShareDetail(
              formatBps(share.dayFractionBps),
              formatDexDate(share.nextSharingAt, lang),
            )}
      </span>
    </span>
  );
}

/** Permanent DEX shares = total shares minus all position shares. */
function PermanentLiquidity({ pool }: { pool: PoolView }) {
  const t = useDict(DEX_TEXT);
  const positions = usePoolPositions(pool.id);
  if (positions.isPending) return <>{t.positionsLoading}</>;
  if (positions.isError) return <>{t.loadError}</>;
  const held = (positions.data ?? []).reduce((s, p) => s + p.shares, 0n);
  const permanent = pool.totalShares > held ? pool.totalShares - held : 0n;
  const pct =
    pool.totalShares === 0n
      ? 0
      : Number((permanent * 10_000n) / pool.totalShares) / 100;
  return (
    <>
      {t.permanentLiquidityValue(
        formatNumber(permanent),
        formatNumber(pct, { maximumFractionDigits: 2 }),
      )}
    </>
  );
}

/** Short factual reason why a pool has no spread. */
function spreadReasonText(t: DexText, spread: PoolSpread | undefined): string {
  switch (spread?.status) {
    case SpreadStatus.empty:
      return t.spreadReasonEmpty;
    case SpreadStatus.noRate:
      return t.spreadReasonNoRate;
    case SpreadStatus.noConsolidatedPrice:
      return t.spreadReasonNoConsolidated;
    case SpreadStatus.noIndependentReference:
      return t.spreadNoIndependentReference;
    default:
      return t.spreadReasonNotOpen;
  }
}

/** Signed spread versus the other open pools, or a neutral dash with the reason. */
function SpreadLine({
  index,
  spread,
  thresholdBps,
  pending,
  failed,
}: {
  index: number;
  spread: PoolSpread | undefined;
  thresholdBps: bigint | undefined;
  pending: boolean;
  failed: boolean;
}) {
  const t = useDict(DEX_TEXT);
  const value =
    spread?.status === SpreadStatus.ok ? spread.spreadBps : undefined;
  const exceeds = value !== undefined && spread?.exceedsThreshold === true;
  const warning =
    thresholdBps !== undefined
      ? t.spreadAboveThreshold(percentText(thresholdBps))
      : t.spreadAlertTitle;
  let reason: string | null = null;
  if (value === undefined) {
    reason = pending
      ? null
      : failed
        ? t.spreadReasonLoadError
        : spreadReasonText(t, spread);
  }
  return (
    <span
      className="flex min-w-0 flex-wrap items-center gap-x-1.5 break-words text-xs"
      data-ocid={`pools.spread.${index}`}
      data-exceeds={exceeds ? "true" : "false"}
    >
      <span className="text-muted-foreground">{t.spreadLabel}:</span>
      {value !== undefined ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 tabular-nums",
            exceeds ? "text-warning" : "text-foreground",
          )}
          title={exceeds ? warning : undefined}
        >
          {exceeds && (
            <TriangleAlert
              className="h-3.5 w-3.5"
              aria-label={warning}
              data-ocid={`pools.spread_warning.${index}`}
            />
          )}
          {formatSignedBps(value)}
        </span>
      ) : (
        <span className="text-muted-foreground">
          <span aria-hidden="true">—</span>
          {reason && <span className="ms-1.5">{reason}</span>}
        </span>
      )}
    </span>
  );
}

export function PoolRow({
  pool,
  config,
  index,
  onAction,
  canTrade,
  tradeNote,
  reference,
  onDetailsOpenChange,
}: {
  pool: PoolView;
  config: DexConfig | undefined;
  index: number;
  onAction: (action: PoolAction) => void;
  /** Signed in and both pair tokens are DEX tokens. */
  canTrade: boolean;
  /** Why Add / Swap are unavailable, when they are. */
  tradeNote?: string;
  /** Reference price of this pool from the page's shared query. */
  reference?: PoolReferenceState;
  /** Told when the details open or close, so the page reads only what is shown. */
  onDetailsOpenChange?: (poolId: bigint, open: boolean) => void;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const unitsText = useDexUnitsText();
  const fiatText = useDexFiatText();
  const paused = useDexPaused();
  const spreads = usePoolSpreads();
  const spread = spreads.data?.pools.find((p) => p.poolId === pool.id);
  const [open, setOpen] = useState(false);
  const status = rowStatus(pool);
  const removed = status === "removed";
  const isTtti = pool.kind === PoolKind.tttiPair;
  const unavailable = pool.depth.usdE8 === undefined;
  const swapBlocked = swapsBlockedByRemoval(pool);
  const addBlocked = removalBlocksLiquidity(pool);
  const closedReason = swapClosedText(t, pool, lang);
  const removalKind = pool.removal.__kind__;
  const removalVisible =
    removalKind === "announced" || removalKind === "executing";
  const sides: Array<{ token: PoolTokenView; min: bigint | undefined }> = [
    { token: pool.token0, min: pool.minimumLocked.token0 },
    { token: pool.token1, min: pool.minimumLocked.token1 },
  ];
  const tttiMin =
    sides.find((s) => s.token.isTttiT)?.min ?? config?.tttiMinimumLocked;
  const pct = thresholdPct(pool);
  const pairName = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const measured = pool.thresholdMeasuredUsdE8 ?? pool.gauge.currentUsdE8;
  let depthLine: string;
  if (measured === undefined) {
    depthLine = unavailable ? poolDepthText(t, pool) : t.depthUnavailable;
  } else if (pool.thresholdBasis === ThresholdBasis.tttiSideAtPoolPrice) {
    depthLine = t.thresholdProgressTtti(
      formatUsdE8(measured),
      formatUsdE8(pool.swapThresholdUsdE8),
    );
  } else {
    depthLine = `${formatUsdE8(measured)} USD / ${thresholdText(t, pool)}`;
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onDetailsOpenChange?.(pool.id, next);
      }}
      asChild
    >
      <li
        className={cn("pool-row", removed && "opacity-80")}
        data-ocid={`pools.item.${index}`}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="pool-pair min-w-0">
            <DexPairLogos token0={pool.token0} token1={pool.token1} />
            <span className="break-all">
              {pool.token0.symbol}/{pool.token1.symbol}
            </span>
          </span>
          {removalKind === "announced" && (
            <span
              className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
              data-ocid={`pools.removal_badge.${index}`}
            >
              {t.removalBadge}
            </span>
          )}
          {pool.newPairBadgeActive && (
            <span
              className="rounded-full border border-gold-strong px-2 py-0.5 text-[0.6875rem] text-primary"
              data-ocid={`pools.new_pair_badge.${index}`}
            >
              {t.newPairBadge}
            </span>
          )}
        </div>
        <span
          className="pool-status justify-self-end md:justify-self-start"
          data-status={status}
          data-ocid={`pools.status.${index}`}
        >
          {statusText(t, status)}
        </span>
        <div
          className="col-span-2 flex min-w-0 flex-col gap-1.5 md:col-span-1"
          title={depthLine}
        >
          <div className="flex items-center gap-2">
            <Progress
              value={pct}
              className="h-2.5 flex-1 border border-gold bg-background/60 [&>div]:bg-gradient-primary"
              aria-label={t.depthBarAriaLabel(pairName)}
              data-ocid={`pools.progress.${index}`}
            />
            <span
              className="font-mono text-xs tabular-nums text-primary"
              data-ocid={`pools.progress_percent.${index}`}
            >
              {formatNumber(pct, { maximumFractionDigits: 0 })}%
            </span>
          </div>
          <span
            className="break-words text-xs text-muted-foreground tabular-nums md:truncate"
            data-ocid={`pools.gauge.${index}`}
          >
            {depthLine}
          </span>
          <span
            className="break-words text-xs"
            data-open={pool.swapState.open ? "true" : "false"}
            data-ocid={`pools.swap_state_label.${index}`}
          >
            <span className="text-muted-foreground">
              {t.poolSwapStateLabel}:{" "}
            </span>
            <span
              className={
                pool.swapState.open ? "text-primary" : "text-muted-foreground"
              }
            >
              {pool.swapState.open ? t.depthBarOpen : t.depthBarClosed}
            </span>
          </span>
          {isTtti && (
            <SpreadLine
              index={index}
              spread={spread}
              thresholdBps={spreads.data?.thresholdBps}
              pending={spreads.isPending}
              failed={spreads.isError}
            />
          )}
        </div>
        <span className="pool-fee">{feeTierLabel(t, pool.feeTier)}</span>
        <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-start gap-2 md:col-span-1 md:justify-end">
          <DexPausedHint paused={paused}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onAction("swap")}
              disabled={!canTrade || paused || swapBlocked}
              data-ocid={`pools.swap_button.${index}`}
            >
              {t.swapButton}
            </Button>
          </DexPausedHint>
          {!removed && (
            <DexPausedHint paused={paused}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-full border-primary/70 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => onAction("add")}
                disabled={!canTrade || paused || addBlocked}
                data-ocid={`pools.add_liquidity_button.${index}`}
              >
                {t.addShort}
              </Button>
            </DexPausedHint>
          )}
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-1 text-muted-foreground"
              data-ocid={`pools.details_toggle.${index}`}
            >
              {t.detailsLabel}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open && "rotate-180",
                )}
                aria-hidden="true"
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        {removalVisible && (
          <div className="col-span-full">
            <RemovalNotice pool={pool} index={index} />
          </div>
        )}
        {tradeNote && !open && (
          <p className="col-span-full text-end text-xs text-muted-foreground">
            {tradeNote}
          </p>
        )}
        <CollapsibleContent
          className="pool-details"
          data-ocid={`pools.details.${index}`}
        >
          <dl className="flex flex-col gap-2 text-sm">
            <Detail label={t.depthLabel}>
              <span data-ocid={`pools.depth.${index}`}>
                {poolDepthText(t, pool)}
              </span>
            </Detail>
            <Detail label={t.guaranteedDepthLabel}>
              <span
                className="flex flex-col gap-0.5 sm:items-end"
                data-ocid={`pools.guaranteed_depth.${index}`}
              >
                <span>{guaranteedDepthText(t, pool)}</span>
                <span>{guaranteedReservesText(t, pool, unitsText)}</span>
                <span className="text-xs text-muted-foreground">
                  {t.guaranteedDepthHint}
                </span>
              </span>
            </Detail>
            {isTtti && (
              <Detail label={t.poolPriceLabel}>
                <span data-ocid={`pools.pool_price.${index}`}>
                  {spread?.priceUsdE8 !== undefined
                    ? t.consolidatedUsd(formatUsdE8(spread.priceUsdE8))
                    : "—"}
                </span>
              </Detail>
            )}
            <Detail label={t.thresholdLabel}>{thresholdText(t, pool)}</Detail>
            <Detail label={t.swapStateLabel}>
              <span data-ocid={`pools.swap_state.${index}`}>
                {pool.swapState.open ? t.swapStateOpen : t.swapStateClosed}
              </span>
            </Detail>
            <Detail label={t.poolSubaccount}>
              <span className="font-mono text-xs break-all">
                {pool.subaccountText || `DEX-POOL-${pool.id.toString()}`}
              </span>
            </Detail>
            <Detail label={t.totalShares}>
              {formatNumber(pool.totalShares)}
            </Detail>
            <Detail label={t.minimumLocked}>
              {isTtti ? (
                tttiMin !== undefined &&
                t.minimumTttiSide(
                  `${formatTttiAmount(tttiMin)} ${fiatText("ttti", tttiMin)}`,
                )
              ) : (
                <span className="flex flex-col gap-0.5">
                  {sides.map(({ token, min }) => (
                    <span key={token.ledgerId.toText()}>
                      {token.symbol}{" "}
                      {min !== undefined ? (
                        <DexTokenAmount amount={min} token={token} />
                      ) : (
                        t.minimumNotSet
                      )}
                    </span>
                  ))}
                </span>
              )}
            </Detail>
            <Detail label={t.permanentLiquidity}>
              <PermanentLiquidity pool={pool} />
            </Detail>
            <Detail label={t.pendingPotLabel}>
              <PendingPotValue
                pool={pool}
                ocid={`pools.pending_pot.${index}`}
              />
            </Detail>
          </dl>
          {!unavailable && (
            <p className="mt-3 text-xs text-muted-foreground">
              {pool.depth.basis === DepthBasis.twiceNonTttiSide
                ? t.depthBasisTwice
                : t.depthBasisSum}
            </p>
          )}
          {closedReason && (
            <p
              className="callout-info mt-3 px-3 py-2 text-xs text-foreground"
              data-ocid={`pools.swap_closed_reason.${index}`}
            >
              {closedReason}
            </p>
          )}
          {pool.newPairBadgeActive && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t.approvalNotRecommendation}
            </p>
          )}
          {!removalVisible && removalKind !== "none" && (
            <div className="mt-3">
              <RemovalNotice pool={pool} index={index} />
            </div>
          )}
          {removed && removalKind !== "completed" && (
            <p
              className="callout-danger mt-3 px-3 py-2 text-xs"
              data-ocid={`pools.removed_notice.${index}`}
            >
              {t.removedNotice}
            </p>
          )}
          {pool.totalShares === 0n && !addBlocked && (
            <div className="mt-3">
              <ReferencePriceBlock pool={pool} shared={reference} />
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAction("positions")}
              data-ocid={`pools.positions_button.${index}`}
            >
              {t.positionsButton}
            </Button>
            {tradeNote && (
              <span className="text-xs text-muted-foreground">{tradeNote}</span>
            )}
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  );
}
