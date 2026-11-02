import { RefreshCw } from "lucide-react";
import { useState } from "react";
import type { PoolView } from "../backend";
import { AddLiquidityDialog } from "../components/dex/AddLiquidityDialog";
import { ConsolidatedPrice } from "../components/dex/ConsolidatedPrice";
import {
  DexAccordion,
  DexAccordionGroup,
  PoolsSection,
} from "../components/dex/DexAccordion";
import { DexActivityHistory } from "../components/dex/DexActivityHistory";
import { DexBalanceLookup } from "../components/dex/DexBalanceLookup";
import { DexBalancesPanel } from "../components/dex/DexBalancesPanel";
import { DexIndicators } from "../components/dex/DexIndicators";
import { DexPausedNotice } from "../components/dex/DexPausedNotice";
import { HowPoolsWork } from "../components/dex/HowPoolsWork";
import { MyPositions } from "../components/dex/MyPositions";
import { PairRequestsSection } from "../components/dex/PairRequestsSection";
import { PoolPositionsDialog } from "../components/dex/PoolPositionsDialog";
import { type PoolAction, PoolRow } from "../components/dex/PoolRow";
import { PoolsNav } from "../components/dex/PoolsNav";
import { RewardsPanel } from "../components/dex/RewardsPanel";
import { SetAsideInjections } from "../components/dex/SetAsideInjections";
import { SwapDialog } from "../components/dex/SwapDialog";
import { dexTokenOf } from "../components/dex/liquidityFormat";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useDexConfig, useDexPools, useDexTokens } from "../hooks/useDex";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { useDict } from "../i18n/core";
import { DEX_TEXT } from "../i18n/pages/dex";
import { DEX_INDICATORS_TEXT } from "../i18n/pages/dexIndicators";

const POOL_SKELETONS = Array.from(
  { length: 7 },
  (_, i) => `pool-skeleton-${i}`,
);

/** Public Pools page (/pools): sticky section nav and five ledger sections. */
export function PoolsPage() {
  const t = useDict(DEX_TEXT);
  const ti = useDict(DEX_INDICATORS_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const caller = principal && !principal.isAnonymous() ? principal : undefined;
  const signingIn = loginStatus === "logging-in";

  const pools = useDexPools();
  const config = useDexConfig();
  const sortedPools = [...(pools.data ?? [])].sort((a, b) =>
    a.id === b.id ? 0 : a.id < b.id ? -1 : 1,
  );
  const dexTokens = useDexTokens();
  const tokens = dexTokens.data ?? [];
  const [open, setOpen] = useState<{
    poolId: bigint;
    action: PoolAction;
  } | null>(null);
  const openPool = open
    ? sortedPools.find((p) => p.id === open.poolId)
    : undefined;

  const pairInfo = (pool: PoolView) => {
    const info0 = dexTokenOf(tokens, pool.token0);
    const info1 = dexTokenOf(tokens, pool.token1);
    return info0 && info1 ? { info0, info1 } : null;
  };
  const tradeNoteOf = (pool: PoolView) =>
    !caller
      ? t.signInForActions
      : dexTokens.data && !pairInfo(pool)
        ? t.pairTokensUnsupported
        : undefined;
  const openInfo = openPool ? pairInfo(openPool) : null;
  const close = () => setOpen(null);

  return (
    <div className="flex min-w-0 flex-col gap-10" data-ocid="pools.page">
      <PoolsNav />

      <PoolsSection id="pools" index={1} title={t.navPools}>
        <div className="flex flex-col gap-4">
          <DexPausedNotice />
          <h1 className="font-display text-4xl uppercase tracking-[0.25em] md:text-5xl">
            {t.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{t.introShort}</p>
        </div>

        {pools.isPending ? (
          <div
            className="flex flex-col gap-2"
            data-ocid="pools.loading_state"
            aria-label={t.loading}
          >
            {POOL_SKELETONS.map((id) => (
              <Skeleton key={id} className="h-16 w-full" />
            ))}
          </div>
        ) : pools.isError ? (
          <div
            className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            data-ocid="pools.error_state"
          >
            <span>{t.loadError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void pools.refetch()}
              aria-label={t.loadError}
              data-ocid="pools.retry_button"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : sortedPools.length === 0 ? (
          <p
            className="border-t border-border pt-4 text-sm text-muted-foreground"
            data-ocid="pools.empty_state"
          >
            {t.poolsEmpty}
          </p>
        ) : (
          <ul
            className="flex flex-col border-b border-border"
            data-ocid="pools.list"
          >
            {sortedPools.map((pool, i) => (
              <PoolRow
                key={pool.id.toString()}
                pool={pool}
                config={config.data}
                index={i + 1}
                onAction={(action) => setOpen({ poolId: pool.id, action })}
                canTrade={!!caller && !!pairInfo(pool)}
                tradeNote={tradeNoteOf(pool)}
              />
            ))}
          </ul>
        )}

        <DexAccordionGroup>
          <ConsolidatedPrice />
          <HowPoolsWork config={config.data} />
        </DexAccordionGroup>
      </PoolsSection>

      <PoolsSection id="indicators" index={2} title={ti.title}>
        <DexIndicators />
      </PoolsSection>

      <PoolsSection id="my-liquidity" index={3} title={t.navMyLiquidity}>
        <div
          className="flex flex-col gap-1 text-sm text-muted-foreground"
          data-ocid="pools.balances.privacy"
        >
          <p>{t.privacyPositions}</p>
          <p>{t.privacyDeposit}</p>
        </div>
        {caller ? (
          <div className="flex flex-col gap-8">
            <DexBalancesPanel owner={caller} />
            <MyPositions
              owner={caller}
              pools={sortedPools}
              config={config.data}
            />
            <RewardsPanel owner={caller} pools={sortedPools} />
            <DexAccordionGroup>
              <DexActivityHistory owner={caller} />
            </DexAccordionGroup>
          </div>
        ) : (
          <div
            className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
            data-ocid="pools.balances.signin_state"
          >
            <p className="text-sm text-muted-foreground">
              {t.myLiquiditySignIn}
            </p>
            <Button
              type="button"
              onClick={() => login()}
              disabled={signingIn}
              className="min-h-11"
              data-ocid="pools.balances.signin_button"
            >
              {layout.signIn}
            </Button>
          </div>
        )}
      </PoolsSection>

      <PoolsSection id="protocol" index={4} title={t.navProtocol}>
        <DexAccordionGroup>
          <SetAsideInjections pools={sortedPools} />
          <DexAccordion label={t.lookupTitle} ocid="pools.lookup">
            <DexBalanceLookup />
          </DexAccordion>
        </DexAccordionGroup>
      </PoolsSection>

      <PoolsSection id="requests" index={5} title={t.navRequests}>
        <PairRequestsSection
          caller={caller}
          config={config.data}
          configError={config.isError}
          onSignIn={() => login()}
          signingIn={signingIn}
        />
      </PoolsSection>

      {openPool && open?.action === "positions" && (
        <PoolPositionsDialog pool={openPool} onClose={close} />
      )}
      {openPool && open?.action === "add" && caller && config.data && (
        <AddLiquidityDialog
          pool={openPool}
          config={config.data}
          tokens={tokens}
          owner={caller}
          onClose={close}
        />
      )}
      {openPool && open?.action === "swap" && caller && openInfo && (
        <SwapDialog
          pool={openPool}
          info0={openInfo.info0}
          info1={openInfo.info1}
          owner={caller}
          onClose={close}
        />
      )}
    </div>
  );
}
