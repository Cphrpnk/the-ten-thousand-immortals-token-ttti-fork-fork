import type { ReactNode } from "react";
import { PoolKind, PoolStatus } from "../../backend";
import type { DexConfig, PoolTokenView, PoolView } from "../../backend";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { DexPairLogos } from "./DexTokenLogo";
import { ProtocolLiquidityInfo } from "./ProtocolLiquidityInfo";
import {
  feeTierLabel,
  formatTokenAmount,
  formatTttiAmount,
  poolStatusLabel,
} from "./dexFormat";
import { gaugeText } from "./liquidityFormat";

export type PoolAction = "add" | "swap" | "positions";

const STATUS_STYLES: Record<PoolStatus, string> = {
  [PoolStatus.filling]: "border-border text-muted-foreground",
  [PoolStatus.active]: "border-foreground/30 text-foreground",
  [PoolStatus.removed]: "border-destructive/50 text-destructive",
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end tabular-nums">{children}</dd>
    </div>
  );
}

export function PoolCard({
  pool,
  config,
  index,
  onAction,
  canTrade,
  tradeNote,
}: {
  pool: PoolView;
  config: DexConfig | undefined;
  index: number;
  onAction: (action: PoolAction) => void;
  /** Signed in and both pair tokens are DEX tokens. */
  canTrade: boolean;
  /** Why Add liquidity / Swap are unavailable, when they are. */
  tradeNote?: string;
}) {
  const t = useDict(DEX_TEXT);
  const paused = useDexPaused();
  const isTtti = pool.kind === PoolKind.tttiPair;
  const removed = pool.status === PoolStatus.removed;
  const sides: Array<{ token: PoolTokenView; min: bigint | undefined }> = [
    { token: pool.token0, min: pool.minimumLocked.token0 },
    { token: pool.token1, min: pool.minimumLocked.token1 },
  ];
  const tttiMin =
    sides.find((s) => s.token.isTttiT)?.min ?? config?.tttiMinimumLocked;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-smooth",
        removed && "opacity-80",
      )}
      data-ocid={`pools.card.${index}`}
    >
      <div className="flex items-start justify-between gap-3">
        <DexPairLogos token0={pool.token0} token1={pool.token1} />
        {pool.newPairBadgeActive && (
          <span
            className="rounded-full border border-gold-strong px-2.5 py-0.5 text-xs text-primary"
            data-ocid={`pools.new_pair_badge.${index}`}
          >
            {t.newPairBadge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl tracking-wide break-words">
          {pool.token0.symbol}/{pool.token1.symbol}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5",
              STATUS_STYLES[pool.status],
            )}
            data-ocid={`pools.status.${index}`}
          >
            {poolStatusLabel(t, pool.status)}
          </span>
          <span className="text-muted-foreground">
            {isTtti ? t.tttiPair : t.utilityPair}
          </span>
        </div>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">{t.gaugeLabel}</dt>
          <dd className="tabular-nums" data-ocid={`pools.gauge.${index}`}>
            {gaugeText(t, pool.gauge)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">{t.reserves}</dt>
          <dd className="flex flex-col gap-0.5 tabular-nums">
            <span>{formatTokenAmount(pool.reserve0, pool.token0)}</span>
            <span>{formatTokenAmount(pool.reserve1, pool.token1)}</span>
          </dd>
        </div>
        <Row label={t.totalShares}>{formatNumber(pool.totalShares)}</Row>
        <Row label={t.feeTier}>{feeTierLabel(t, pool.feeTier)}</Row>
        <Row label={t.poolSubaccount}>
          <span className="font-mono text-xs break-all">
            {pool.subaccountText || `DEX-POOL-${pool.id.toString()}`}
          </span>
        </Row>
        <div className="flex flex-col gap-1.5">
          <dt className="text-muted-foreground">{t.minimumLocked}</dt>
          <dd className="tabular-nums">
            {isTtti ? (
              tttiMin !== undefined &&
              t.minimumTttiSide(formatTttiAmount(tttiMin))
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {t.minimumPerToken}
                </span>
                {sides.map(({ token, min }) => (
                  <span
                    key={token.ledgerId.toText()}
                    className="flex justify-between gap-3"
                  >
                    <span>{token.symbol}</span>
                    <span>
                      {min !== undefined
                        ? formatTokenAmount(min, token)
                        : t.minimumNotSet}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </dd>
        </div>
      </dl>

      <ul className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
        {config && (
          <li>
            {t.firstDepositRule(formatNumber(config.firstDepositMultiplier))}
          </li>
        )}
        {config && config.usdRateScale > 0n && (
          <li>
            {t.launchDepthRule(
              formatNumber(
                Number(
                  pool.launchMinimumTotalUsdE8 ||
                    config.launchMinimumTotalUsdE8,
                ) / Number(config.usdRateScale),
                { maximumFractionDigits: 2 },
              ),
            )}
          </li>
        )}
        <li>{t.lockedSharesRule}</li>
        {pool.newPairBadgeActive && <li>{t.approvalNotRecommendation}</li>}
      </ul>

      <ProtocolLiquidityInfo poolId={pool.id} index={index} />

      {removed && (
        <p
          className="callout-danger px-3 py-2 text-xs"
          data-ocid={`pools.removed_notice.${index}`}
        >
          {t.removedNotice}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex flex-wrap gap-2">
          {!removed && (
            <DexPausedHint paused={paused}>
              <Button
                type="button"
                size="sm"
                onClick={() => onAction("add")}
                disabled={!canTrade || paused}
                data-ocid={`pools.add_liquidity_button.${index}`}
              >
                {t.addLiquidityButton}
              </Button>
            </DexPausedHint>
          )}
          <DexPausedHint paused={paused}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAction("swap")}
              disabled={!canTrade || paused}
              data-ocid={`pools.swap_button.${index}`}
            >
              {t.swapButton}
            </Button>
          </DexPausedHint>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAction("positions")}
            data-ocid={`pools.positions_button.${index}`}
          >
            {t.positionsButton}
          </Button>
        </div>
        {tradeNote && (
          <p className="text-xs text-muted-foreground">{tradeNote}</p>
        )}
      </div>
    </article>
  );
}
