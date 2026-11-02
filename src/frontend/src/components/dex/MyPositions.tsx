import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, TriangleAlert } from "lucide-react";
import { type ReactNode, useState } from "react";
import { PoolStatus } from "../../backend";
import type { DexConfig, PoolView, PositionView } from "../../backend";
import {
  useDexPositionsOf,
  useMyDexEstimatedShares,
  useMyPoolSpreadAlerts,
  useRemoveLiquidity,
} from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { formatSignedBps } from "./ConsolidatedPrice";
import { DexTokenAmount, useDexUnitsText } from "./DexFiat";
import { ExtendLockDialog } from "./ExtendLockDialog";
import { EstimatedShareValue } from "./PoolRow";
import { formatDexDate } from "./dexFormat";
import {
  formatRemainingTime,
  formatUsdE8,
  percentText,
  positionStatusText,
  relayReceivedText,
  removeLiquidityErrorText,
} from "./liquidityFormat";

type Feedback = { id: bigint; tone: "info" | "danger"; text: string };

/** Announced, running or completed removal of the pair a position belongs to. */
function RemovalNotice({ pool }: { pool: PoolView }) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const removal = pool.removal;
  if (removal.__kind__ === "announced" || removal.__kind__ === "executing") {
    const detail =
      removal.__kind__ === "announced" ? removal.announced : removal.executing;
    return (
      <div
        className="callout-danger flex flex-col gap-1 px-3 py-2 text-xs break-words"
        data-ocid="pools.my_positions.removal.panel"
      >
        <p className="font-medium">
          {removal.__kind__ === "announced"
            ? t.removalAnnouncedTitle
            : t.removalExecutingTitle}
        </p>
        <p>
          {t.removalReasonLabel}: {detail.reason}
        </p>
        <p className="tabular-nums">
          {t.removalEffectiveAt(formatDexDate(detail.effectiveAt, lang))}
        </p>
        <p>
          {removal.__kind__ === "announced"
            ? t.removalSuspendedNotice
            : t.removalExecutingNotice}
        </p>
      </div>
    );
  }
  if (removal.__kind__ === "completed") {
    return (
      <p
        className="text-xs text-muted-foreground"
        data-ocid="pools.my_positions.removal.panel"
      >
        {t.removalCompletedNotice(
          formatDexDate(removal.completed.completedAt, lang),
        )}
      </p>
    );
  }
  return null;
}

/** Pools where the user holds a position and the spread exceeds the threshold. */
function SpreadAlerts({
  owner,
  pools,
}: { owner: Principal; pools: ReadonlyArray<PoolView> }) {
  const t = useDict(DEX_TEXT);
  const alerts = useMyPoolSpreadAlerts(owner.toText());
  if (!alerts.data || alerts.data.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2" data-ocid="pools.spread_alerts.list">
      {alerts.data.map((alert, i) => {
        const pool = pools.find((p) => p.id === alert.poolId);
        const name = pool
          ? `${pool.token0.symbol}/${pool.token1.symbol}`
          : `TTTI-T/${alert.counterSymbol}`;
        return (
          <li
            key={alert.poolId.toString()}
            className="callout-warning flex flex-col gap-1 px-3 py-2 text-xs break-words"
            data-ocid={`pools.spread_alerts.item.${i + 1}`}
          >
            <p className="flex items-center gap-1.5 font-medium">
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t.spreadAlertTitle}
            </p>
            <p>
              {t.spreadAlert(
                name,
                formatSignedBps(alert.spreadBps),
                percentText(alert.thresholdBps),
              )}
            </p>
            <p className="tabular-nums text-muted-foreground">
              {t.spreadAlertPrices(
                formatUsdE8(alert.poolPriceUsdE8),
                formatUsdE8(alert.consolidatedPriceUsdE8),
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="inline text-muted-foreground">{label}: </dt>
      <dd className="inline">{children}</dd>
    </div>
  );
}

/** The signed-in user's positions, with Withdraw and Extend lock (owner only). */
export function MyPositions({
  owner,
  pools,
  config,
}: {
  owner: Principal;
  pools: ReadonlyArray<PoolView>;
  config: DexConfig | undefined;
}) {
  const t = useDict(DEX_TEXT);
  const unitsText = useDexUnitsText();
  const { lang } = useLanguage();
  const positions = useDexPositionsOf(owner);
  const shares = useMyDexEstimatedShares(owner.toText());
  const remove = useRemoveLiquidity();
  const [extending, setExtending] = useState<PositionView | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const poolOf = (id: bigint) => pools.find((p) => p.id === id);
  const rows = [...(positions.data ?? [])]
    .filter((p) => p.shares > 0n)
    .sort((a, b) => (a.id === b.id ? 0 : a.id < b.id ? -1 : 1));

  const onWithdraw = (p: PositionView) => {
    setFeedback(null);
    remove.mutate(p.id, {
      onSuccess: (outcome) => {
        const pool = poolOf(p.poolId);
        setFeedback(
          outcome.__kind__ === "ok"
            ? {
                id: p.id,
                tone: "info",
                text: t.positionWithdrawn(
                  pool
                    ? unitsText(outcome.ok.amount0, pool.token0)
                    : formatNumber(outcome.ok.amount0),
                  pool
                    ? unitsText(outcome.ok.amount1, pool.token1)
                    : formatNumber(outcome.ok.amount1),
                ),
              }
            : {
                id: p.id,
                tone: "danger",
                text: removeLiquidityErrorText(t, outcome.err, lang),
              },
        );
      },
      onError: (err) =>
        setFeedback({ id: p.id, tone: "danger", text: t.errCall(err.message) }),
    });
  };

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.my_positions.panel">
      <h3 className="font-display text-xl tracking-wide">
        {t.myPositionsTitle}
      </h3>
      <p className="text-xs text-muted-foreground">{t.myPositionsNote}</p>
      <p className="text-xs text-muted-foreground">{t.estimatedShareNote}</p>
      <SpreadAlerts owner={owner} pools={pools} />
      {positions.isPending ? (
        <Skeleton
          className="h-24 rounded-lg"
          data-ocid="pools.my_positions.loading_state"
        />
      ) : positions.isError ? (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="pools.my_positions.error_state"
        >
          {t.positionsLoadError}
        </p>
      ) : rows.length === 0 ? (
        <p
          className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"
          data-ocid="pools.my_positions.empty_state"
        >
          {t.myPositionsEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((p, i) => {
            const pool = poolOf(p.poolId);
            const removed = pool?.status === PoolStatus.removed;
            const removalActive =
              pool?.removal.__kind__ === "announced" ||
              pool?.removal.__kind__ === "executing";
            // Withdrawal depends only on unlockAt, in every pool state.
            const canWithdraw = p.withdrawable;
            const noLock = p.lockDurationNs === 0n;
            const busy = remove.isPending && remove.variables === p.id;
            const fb = feedback?.id === p.id ? feedback : null;
            return (
              <li
                key={p.id.toString()}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm"
                data-ocid={`pools.my_positions.item.${i + 1}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">
                    {t.positionLabel(formatNumber(p.id))} · {p.token0Symbol}/
                    {p.token1Symbol}
                  </span>
                  {p.isCreator && (
                    <span className="rounded-full border border-gold-strong px-2 py-0.5 text-xs text-primary">
                      {t.creatorBadge}
                    </span>
                  )}
                </div>
                <dl className="grid gap-1 tabular-nums sm:grid-cols-2">
                  <Field label={t.colShares}>{formatNumber(p.shares)}</Field>
                  <Field label={t.colAmounts}>
                    {pool ? (
                      <>
                        <DexTokenAmount
                          amount={p.amount0}
                          token={pool.token0}
                        />{" "}
                        ·{" "}
                        <DexTokenAmount
                          amount={p.amount1}
                          token={pool.token1}
                        />
                      </>
                    ) : (
                      `${formatNumber(p.amount0)} ${p.token0Symbol} · ${formatNumber(p.amount1)} ${p.token1Symbol}`
                    )}
                  </Field>
                  <Field label={t.positionLockCommitted}>
                    {noLock
                      ? t.lockNone
                      : formatRemainingTime(t, p.lockDurationNs)}
                  </Field>
                  <Field label={t.colUnlock}>
                    {noLock ? t.lockNone : formatDexDate(p.unlockAt, lang)}
                  </Field>
                  {!noLock && (
                    <Field label={t.positionLockStart}>
                      {formatDexDate(p.lockStartedAt, lang)}
                    </Field>
                  )}
                  <Field label={t.positionTimeRemaining}>
                    {formatRemainingTime(t, p.remainingNs)}
                  </Field>
                  <Field label={t.positionRelayReceived}>
                    {relayReceivedText(t, p.relayReceivedNs)}
                  </Field>
                  <Field label={t.positionFeesCollected}>
                    {pool ? (
                      <>
                        <DexTokenAmount
                          amount={p.feesCollected0}
                          token={pool.token0}
                        />{" "}
                        ·{" "}
                        <DexTokenAmount
                          amount={p.feesCollected1}
                          token={pool.token1}
                        />
                      </>
                    ) : (
                      `${formatNumber(p.feesCollected0)} ${p.token0Symbol} · ${formatNumber(p.feesCollected1)} ${p.token1Symbol}`
                    )}
                  </Field>
                  <Field label={t.estimatedShareLabel}>
                    <EstimatedShareValue
                      share={shares.data?.find((s) => s.positionId === p.id)}
                      pool={pool}
                      ocid={`pools.my_positions.estimated_share.${i + 1}`}
                    />
                  </Field>
                  <Field label={t.positionStatus}>
                    <span data-ocid={`pools.my_positions.status.${i + 1}`}>
                      {positionStatusText(t, p)}
                    </span>
                  </Field>
                </dl>
                <p
                  className="text-xs text-muted-foreground"
                  data-ocid={`pools.my_positions.withdrawable.${i + 1}`}
                >
                  {p.withdrawable
                    ? `${t.unlockedLabel} · ${noLock ? t.lockNoneHint : t.removedWithdrawOpen}`
                    : t.lockedUntil(formatDexDate(p.unlockAt, lang))}
                </p>
                {pool && <RemovalNotice pool={pool} />}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onWithdraw(p)}
                    disabled={!canWithdraw || remove.isPending}
                    data-ocid={`pools.my_positions.withdraw_button.${i + 1}`}
                  >
                    {busy && (
                      <Loader2
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    )}
                    {busy ? t.withdrawingPosition : t.withdrawPosition}
                  </Button>
                  {!removed && !removalActive && config && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setExtending(p)}
                      disabled={remove.isPending}
                      data-ocid={`pools.my_positions.extend_button.${i + 1}`}
                    >
                      {t.extendLockButton}
                    </Button>
                  )}
                </div>
                {fb && (
                  <p
                    aria-live="polite"
                    className={`${fb.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                    data-ocid={
                      fb.tone === "info"
                        ? "pools.my_positions.success_state"
                        : "pools.my_positions.error_state"
                    }
                  >
                    {fb.text}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {extending && config && (
        <ExtendLockDialog
          position={extending}
          minLockNs={config.minLockNs}
          maxLockNs={config.maxLockNs}
          onClose={() => setExtending(null)}
        />
      )}
    </div>
  );
}
