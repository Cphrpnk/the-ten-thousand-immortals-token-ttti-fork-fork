import { RefreshCw } from "lucide-react";
import { ReserveStatus } from "../../backend";
import type { DexTokenInfo, TokenBalanceBreakdown } from "../../backend";
import { useDexBalanceBreakdown } from "../../hooks/useDexIndicators";
import { formatNumber } from "../../i18n/core/lang";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { DexAccordion } from "./DexAccordion";
import { fiatTokenOfDex } from "./DexFiat";
import { formatDexDate } from "./dexFormat";
import {
  Amt,
  type Lang,
  TD,
  TDR,
  TH,
  THR,
  TR,
  Table,
  type Text,
  type Tok,
  proofStatusLabel,
} from "./indicatorParts";

type AmountKey =
  | "poolReserves"
  | "guarantees"
  | "creatorHoldings"
  | "dexBalances"
  | "permanentLiquidity"
  | "requestDeposits"
  | "auctionDeposits"
  | "inFlight"
  | "total"
  | "ledgerBalance"
  | "difference";

type RowDef = { key: AmountKey; label: (t: Text) => string; strong?: boolean };

/** Components of the reserve guard, then the total, the ledger balance and the difference. */
const ROWS: RowDef[] = [
  { key: "poolReserves", label: (t) => t.rowPoolReserves },
  { key: "guarantees", label: (t) => t.rowGuarantees },
  { key: "creatorHoldings", label: (t) => t.rowCreatorHoldings },
  { key: "dexBalances", label: (t) => t.rowDexBalances },
  { key: "permanentLiquidity", label: (t) => t.rowPermanentLiquidity },
  { key: "requestDeposits", label: (t) => t.rowRequestDeposits },
  { key: "auctionDeposits", label: (t) => t.rowAuctionDeposits },
  { key: "inFlight", label: (t) => t.rowInFlight },
  { key: "total", label: (t) => t.rowTotal, strong: true },
  { key: "ledgerBalance", label: (t) => t.rowLedgerBalance, strong: true },
  { key: "difference", label: (t) => t.colDifference },
];

function tokOf(row: TokenBalanceBreakdown, tokens: DexTokenInfo[]): Tok {
  const info = tokens.find((x) => x.token === row.token);
  return info
    ? { ...info, fiat: fiatTokenOfDex(info.token) }
    : { symbol: row.token as string, decimals: 0 };
}

function BreakdownTable({
  t,
  rows,
  tokens,
}: { t: Text; rows: TokenBalanceBreakdown[]; tokens: DexTokenInfo[] }) {
  const columns = rows.map((r) => ({ row: r, tok: tokOf(r, tokens) }));
  return (
    <div data-ocid="pools.indicators.breakdown">
      <Table
        head={
          <>
            <th className={TH}>{t.colComponent}</th>
            {columns.map(({ row, tok }) => (
              <th key={row.token} className={THR}>
                {tok.symbol}
              </th>
            ))}
          </>
        }
      >
        {ROWS.map((def) => (
          <tr
            key={def.key}
            className={def.strong ? `${TR} font-medium` : TR}
            data-ocid={`pools.indicators.breakdown.row.${def.key}`}
          >
            <td className={TD}>{def.label(t)}</td>
            {columns.map(({ row, tok }) => (
              <td key={row.token} className={TDR}>
                <Amt value={row[def.key]} tok={tok} />
              </td>
            ))}
          </tr>
        ))}
        <tr className={TR} data-ocid="pools.indicators.breakdown.row.status">
          <td className={TD}>{t.colStatus}</td>
          {columns.map(({ row }) => (
            <td key={row.token} className={TDR}>
              {proofStatusLabel(t, row.status)}
            </td>
          ))}
        </tr>
      </Table>
    </div>
  );
}

/** Closed accordion beside the proof of reserves: per-token balance breakdown of the guard. */
export function BalanceBreakdownAccordion({
  t,
  lang,
  tokens,
}: { t: Text; lang: Lang; tokens: DexTokenInfo[] }) {
  const query = useDexBalanceBreakdown();
  const snapshot = query.data;
  const matching = snapshot
    ? snapshot.tokens.filter((r) => r.status === ReserveStatus.ok).length
    : 0;
  return (
    <DexAccordion
      label={t.breakdownTitle}
      count={
        snapshot
          ? t.summaryProofsValue(
              formatNumber(matching),
              formatNumber(snapshot.tokens.length),
            )
          : undefined
      }
      ocid="pools.indicators.breakdown_accordion"
    >
      {query.isPending ? (
        <Skeleton
          className="h-32 rounded-lg"
          aria-label={t.loading}
          data-ocid="pools.indicators.breakdown.loading_state"
        />
      ) : query.isError || !snapshot ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="pools.indicators.breakdown.error_state"
        >
          <span>{t.breakdownLoadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            aria-label={t.breakdownLoadError}
            data-ocid="pools.indicators.breakdown.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <>
          <p className="max-w-2xl text-xs text-muted-foreground">
            {t.breakdownNote}
          </p>
          {!snapshot.complete && (
            <p
              className="callout-danger px-4 py-3 text-sm"
              data-ocid="pools.indicators.breakdown.incomplete_state"
            >
              {t.breakdownIncomplete}
            </p>
          )}
          <BreakdownTable t={t} rows={snapshot.tokens} tokens={tokens} />
          <p
            className="text-xs text-muted-foreground"
            data-ocid="pools.indicators.breakdown.checked_at"
          >
            {t.reserveCheckedAt(formatDexDate(snapshot.checkedAt, lang))}
          </p>
        </>
      )}
    </DexAccordion>
  );
}
