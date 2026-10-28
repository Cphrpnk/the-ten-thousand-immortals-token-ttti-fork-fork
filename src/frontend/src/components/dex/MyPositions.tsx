import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PoolStatus } from "../../backend";
import type { DexConfig, PoolView, PositionView } from "../../backend";
import { useDexPositionsOf, useRemoveLiquidity } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ExtendLockDialog } from "./ExtendLockDialog";
import { formatDexDate, formatTokenAmount } from "./dexFormat";
import { durationText, removeLiquidityErrorText } from "./liquidityFormat";

type Feedback = { id: bigint; tone: "info" | "danger"; text: string };

/** The signed-in user's positions, with Withdraw and Extend lock. */
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
  const { lang } = useLanguage();
  const positions = useDexPositionsOf(owner);
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
                    ? formatTokenAmount(outcome.ok.amount0, pool.token0)
                    : formatNumber(outcome.ok.amount0),
                  pool
                    ? formatTokenAmount(outcome.ok.amount1, pool.token1)
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
            const canWithdraw = removed || p.withdrawable;
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
                  <div>
                    <dt className="inline text-muted-foreground">
                      {t.colShares}:{" "}
                    </dt>
                    <dd className="inline">{formatNumber(p.shares)}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">
                      {t.colLock}:{" "}
                    </dt>
                    <dd className="inline">
                      {durationText(t, p.lockDurationNs)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">
                      {t.colAmounts}:{" "}
                    </dt>
                    <dd className="inline">
                      {pool
                        ? `${formatTokenAmount(p.amount0, pool.token0)} · ${formatTokenAmount(p.amount1, pool.token1)}`
                        : `${formatNumber(p.amount0)} ${p.token0Symbol} · ${formatNumber(p.amount1)} ${p.token1Symbol}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-muted-foreground">
                      {t.colUnlock}:{" "}
                    </dt>
                    <dd className="inline">
                      {formatDexDate(p.unlockAt, lang)}
                    </dd>
                  </div>
                </dl>
                {removed ? (
                  <p className="text-xs text-muted-foreground">
                    {t.removedWithdrawOpen}
                  </p>
                ) : !p.withdrawable ? (
                  <p className="text-xs text-muted-foreground">
                    {t.lockedUntil(formatDexDate(p.unlockAt, lang))}
                  </p>
                ) : null}
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
                  {!removed && config && (
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
          maxLockNs={config.maxLockNs}
          onClose={() => setExtending(null)}
        />
      )}
    </div>
  );
}
