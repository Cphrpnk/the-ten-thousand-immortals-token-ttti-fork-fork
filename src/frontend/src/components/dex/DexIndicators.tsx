import { RefreshCw } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ReserveStatus } from "../../backend";
import type {
  DexTokenInfo,
  PoolIndicators,
  PoolView,
  TokenProof,
} from "../../backend";
import { useDexPools, useDexTokens } from "../../hooks/useDex";
import { useDexIndicators } from "../../hooks/useDexIndicators";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_INDICATORS_TEXT } from "../../i18n/pages/dexIndicators";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { DexAccordion, DexAccordionGroup } from "./DexAccordion";
import { dexFiatToken, fiatTokenOfDex } from "./DexFiat";
import { IndicatorsWidget } from "./IndicatorsWidget";
import { formatDexDate } from "./dexFormat";
import {
  Amt,
  type Lang,
  Muted,
  type PoolItem,
  TD,
  TDR,
  TH,
  THR,
  TR,
  Table,
  type Text,
  type Tok,
  usdText,
} from "./indicatorParts";

function proofStatusLabel(t: Text, status: ReserveStatus): string {
  switch (status) {
    case ReserveStatus.ok:
      return t.statusMatch;
    case ReserveStatus.surplus:
      return t.statusSurplus;
    case ReserveStatus.shortfall:
      return t.statusShortfall;
  }
}

function ProofTable({
  t,
  proofs,
  tokens,
}: { t: Text; proofs: TokenProof[]; tokens: DexTokenInfo[] }) {
  return (
    <div data-ocid="pools.indicators.proofs">
      <Table
        head={
          <>
            <th className={TH}>{t.colToken}</th>
            <th className={THR}>{t.colInternal}</th>
            <th className={THR}>{t.colLedger}</th>
            <th className={THR}>{t.colDifference}</th>
            <th className={THR}>{t.colStatus}</th>
          </>
        }
      >
        {proofs.map((p, i) => {
          const info = tokens.find((x) => x.token === p.token);
          const tok: Tok = info
            ? { ...info, fiat: fiatTokenOfDex(info.token) }
            : { symbol: p.token as string, decimals: 0 };
          return (
            <tr
              key={p.token}
              className={TR}
              data-ocid={`pools.indicators.proof.${i + 1}`}
            >
              <td className={TD}>{tok.symbol}</td>
              <td className={TDR}>
                <Amt value={p.internalTotal} tok={tok} />
              </td>
              <td className={TDR}>
                <Amt value={p.ledgerTotal} tok={tok} />
              </td>
              <td className={TDR}>
                <Amt value={p.difference} tok={tok} />
              </td>
              <td className={TDR}>{proofStatusLabel(t, p.status)}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-t border-border pt-3">
      <dt className="admin-stat-label">{label}</dt>
      <dd className="admin-stat-value break-words">{children}</dd>
    </div>
  );
}

function Summary({
  t,
  pools,
  proofs,
  reserveCheckedAt,
  lang,
}: {
  t: Text;
  pools: PoolIndicators[];
  proofs: TokenProof[];
  reserveCheckedAt: bigint | undefined;
  lang: Lang;
}) {
  const valued = pools.filter((p) => p.valueUsdE8 !== undefined);
  const total = valued.reduce((sum, p) => sum + (p.valueUsdE8 ?? 0n), 0n);
  const volumes = pools
    .map((p) => p.activity.last24h.volumeUsdE8)
    .filter((v): v is bigint => v !== undefined);
  const matching = proofs.filter((p) => p.status === ReserveStatus.ok).length;
  const swaps = pools.reduce((s, p) => s + p.activity.last24h.swapCount, 0n);
  const missing = pools.length - valued.length;
  return (
    <div className="flex flex-col gap-3" data-ocid="pools.indicators.summary">
      <h3 className="sr-only">{t.summaryTitle}</h3>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 xl:grid-cols-6">
        <Stat label={t.summaryPools}>{formatNumber(pools.length)}</Stat>
        <Stat label={t.summaryOpenPools}>
          {formatNumber(pools.filter((p) => p.isOpen).length)}
        </Stat>
        <Stat label={t.summaryValue}>
          {valued.length === 0 ? (
            <Muted>{t.unavailable}</Muted>
          ) : (
            usdText(t, total)
          )}
        </Stat>
        <Stat label={t.summarySwaps24h}>{formatNumber(swaps)}</Stat>
        <Stat label={t.summaryVolume24h}>
          {volumes.length === 0 ? (
            <Muted>{t.unavailable}</Muted>
          ) : (
            usdText(
              t,
              volumes.reduce((s, v) => s + v, 0n),
            )
          )}
        </Stat>
        <Stat label={t.summaryProofs}>
          {t.summaryProofsValue(
            formatNumber(matching),
            formatNumber(proofs.length),
          )}
        </Stat>
      </dl>
      {valued.length > 0 && missing > 0 && (
        <p className="text-xs text-muted-foreground">
          {t.summaryValueExcluding(formatNumber(missing))}
        </p>
      )}
      {reserveCheckedAt !== undefined && (
        <p className="text-xs text-muted-foreground">
          {t.reserveCheckedAt(formatDexDate(reserveCheckedAt, lang))}
        </p>
      )}
    </div>
  );
}

function resolveTok(
  pool: PoolView | undefined,
  side: "token0" | "token1",
  symbol: string,
  tokens: DexTokenInfo[],
): Tok {
  const view = pool?.[side];
  if (view) {
    return {
      symbol: view.symbol,
      decimals: view.decimals,
      fiat: dexFiatToken(view) ?? undefined,
    };
  }
  const info = tokens.find((x) => x.symbol === symbol);
  return {
    symbol,
    decimals: info?.decimals ?? 0,
    fiat: info ? fiatTokenOfDex(info.token) : undefined,
  };
}

/** Indicators section body of the Pools page: reads the stored snapshot. */
export function DexIndicators() {
  const t = useDict(DEX_INDICATORS_TEXT);
  const { lang } = useLanguage();
  const indicators = useDexIndicators();
  const pools = useDexPools();
  const dexTokens = useDexTokens();
  const [selected, setSelected] = useState("all");
  const snapshot = indicators.data;
  const tokens = dexTokens.data ?? [];
  const sorted = snapshot
    ? [...snapshot.pools].sort((a, b) =>
        a.poolId === b.poolId ? 0 : a.poolId < b.poolId ? -1 : 1,
      )
    : [];
  const items: PoolItem[] = sorted.map((p) => {
    const view = (pools.data ?? []).find((v) => v.id === p.poolId);
    return {
      p,
      tok0: resolveTok(view, "token0", p.token0Symbol, tokens),
      tok1: resolveTok(view, "token1", p.token1Symbol, tokens),
    };
  });

  return (
    <div className="flex flex-col gap-8" data-ocid="pools.indicators">
      <div className="flex flex-col gap-1">
        <span
          className="font-mono text-xs text-muted-foreground"
          data-ocid="pools.indicators.computed_at"
        >
          {snapshot
            ? t.computedAt(formatDexDate(snapshot.computedAt, lang))
            : indicators.isSuccess
              ? t.notComputed
              : null}
        </span>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t.introShort}
        </p>
      </div>

      {indicators.isPending ? (
        <Skeleton
          className="h-48 rounded-lg"
          aria-label={t.loading}
          data-ocid="pools.indicators.loading_state"
        />
      ) : indicators.isError ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="pools.indicators.error_state"
        >
          <span>{t.loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void indicators.refetch()}
            aria-label={t.loadError}
            data-ocid="pools.indicators.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : !snapshot ? (
        <p
          className="border-y border-border py-4 text-sm text-muted-foreground"
          data-ocid="pools.indicators.empty_state"
        >
          {t.notComputedHint}
        </p>
      ) : (
        <>
          <Summary
            t={t}
            pools={sorted}
            proofs={snapshot.proofs}
            reserveCheckedAt={snapshot.reserveCheckedAt}
            lang={lang}
          />
          <IndicatorsWidget
            t={t}
            lang={lang}
            items={items}
            selected={selected}
            onSelect={setSelected}
          />
          <DexAccordionGroup>
            <DexAccordion
              label={t.proofTitle}
              count={t.summaryProofsValue(
                formatNumber(
                  snapshot.proofs.filter((p) => p.status === ReserveStatus.ok)
                    .length,
                ),
                formatNumber(snapshot.proofs.length),
              )}
              ocid="pools.indicators.proof_accordion"
            >
              <ProofTable t={t} proofs={snapshot.proofs} tokens={tokens} />
            </DexAccordion>
          </DexAccordionGroup>
        </>
      )}
    </div>
  );
}
