import { RefreshCw } from "lucide-react";
import { useState } from "react";
import type { PoolView } from "../backend";
import { AddLiquidityDialog } from "../components/dex/AddLiquidityDialog";
import { DexBalanceLookup } from "../components/dex/DexBalanceLookup";
import { DexBalancesPanel } from "../components/dex/DexBalancesPanel";
import { DexIndicators } from "../components/dex/DexIndicators";
import { DexPausedNotice } from "../components/dex/DexPausedNotice";
import { LpBonusPanel } from "../components/dex/LpBonusPanel";
import { MintFeePanel } from "../components/dex/MintFeePanel";
import { MyPositions } from "../components/dex/MyPositions";
import { PairRequestForm } from "../components/dex/PairRequestForm";
import { PairRequestList } from "../components/dex/PairRequestList";
import { type PoolAction, PoolCard } from "../components/dex/PoolCard";
import { PoolPositionsDialog } from "../components/dex/PoolPositionsDialog";
import { SetAsideInjections } from "../components/dex/SetAsideInjections";
import { SwapDialog } from "../components/dex/SwapDialog";
import { dexTokenOf } from "../components/dex/liquidityFormat";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  useDexConfig,
  useDexPools,
  useDexTokens,
  useMyPairRequests,
  usePairRequests,
} from "../hooks/useDex";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { MINT_REVENUE_TEXT } from "../i18n/common";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { useDict } from "../i18n/core";
import { DEX_TEXT } from "../i18n/pages/dex";

const POOL_SKELETONS = Array.from(
  { length: 7 },
  (_, i) => `pool-skeleton-${i}`,
);

/** Public Pools page (/pools). */
export function PoolsPage() {
  const t = useDict(DEX_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const m = useDict(MINT_REVENUE_TEXT);
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const caller = principal && !principal.isAnonymous() ? principal : undefined;

  const pools = useDexPools();
  const config = useDexConfig();
  const requests = usePairRequests();
  const myRequests = useMyPairRequests(caller?.toText());

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
    <div className="flex flex-col gap-14" data-ocid="pools.page">
      <header className="flex flex-col gap-4">
        <DexPausedNotice />
        <h1 className="font-display text-4xl uppercase tracking-[0.25em]">
          {t.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t.intro}</p>
        <p
          className="callout-info max-w-2xl px-3 py-2 text-sm"
          data-ocid="pools.protocol_statement"
        >
          {t.protocolStatement}
        </p>
        <p
          className="max-w-2xl text-sm text-muted-foreground"
          data-ocid="pools.swap_fee_split"
        >
          {m.swapFeeSplit}
        </p>
        <div className="divider-gold mt-2" />
      </header>

      <section aria-label={t.title} data-ocid="pools.section">
        {pools.isPending ? (
          <div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            data-ocid="pools.loading_state"
            aria-label={t.loading}
          >
            {POOL_SKELETONS.map((id) => (
              <Skeleton key={id} className="h-80 rounded-lg" />
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
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPools.map((pool, i) => (
              <PoolCard
                key={pool.id.toString()}
                pool={pool}
                config={config.data}
                index={i + 1}
                onAction={(action) => setOpen({ poolId: pool.id, action })}
                canTrade={!!caller && !!pairInfo(pool)}
                tradeNote={tradeNoteOf(pool)}
              />
            ))}
          </div>
        )}
      </section>

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

      <DexIndicators />

      <section
        className="mx-auto flex w-full max-w-3xl flex-col gap-4"
        data-ocid="pools.balances.section"
      >
        <h2 className="font-display text-2xl tracking-wide">
          {t.balancesTitle}
        </h2>
        <div
          className="callout-info flex flex-col gap-1 px-3 py-2 text-sm"
          data-ocid="pools.balances.privacy"
        >
          <p>{t.privacyPositions}</p>
          <p>{t.privacyDeposit}</p>
        </div>
        {caller ? (
          <>
            <DexBalancesPanel owner={caller} />
            <MyPositions
              owner={caller}
              pools={sortedPools}
              config={config.data}
            />
          </>
        ) : (
          <div
            className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
            data-ocid="pools.balances.signin_state"
          >
            <p className="text-sm text-muted-foreground">{t.balancesSignIn}</p>
            <p className="text-sm text-muted-foreground">{t.bonusSignIn}</p>
            <Button
              type="button"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="min-h-11"
              data-ocid="pools.balances.signin_button"
            >
              {layout.signIn}
            </Button>
          </div>
        )}
        <MintFeePanel owner={caller} />
        <LpBonusPanel owner={caller} pools={sortedPools} />
        <DexBalanceLookup />
      </section>

      <SetAsideInjections pools={sortedPools} />

      <section
        className="mx-auto flex w-full max-w-xl flex-col gap-4"
        data-ocid="pair_request.section"
      >
        <h2 className="font-display text-2xl tracking-wide">
          {t.requestTitle}
        </h2>
        {!caller ? (
          <div
            className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
            data-ocid="pair_request.signin_state"
          >
            <p className="text-sm text-muted-foreground">{t.signInNeeded}</p>
            <Button
              type="button"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="min-h-11"
              data-ocid="pair_request.signin_button"
            >
              {layout.signIn}
            </Button>
          </div>
        ) : config.data ? (
          <PairRequestForm config={config.data} />
        ) : config.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pair_request.error_state"
          >
            {t.loadError}
          </p>
        ) : (
          <Skeleton
            className="h-96 rounded-lg"
            data-ocid="pair_request.loading_state"
          />
        )}
      </section>

      {caller && (
        <PairRequestList
          title={t.myRequestsTitle}
          requests={myRequests.data}
          loading={myRequests.isPending}
          ocid="my_requests"
        />
      )}

      <PairRequestList
        title={t.requestsTitle}
        requests={requests.data}
        loading={requests.isPending}
        ocid="pair_requests"
      />
    </div>
  );
}
