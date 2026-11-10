import { ReserveStatus } from "../../backend";
import type { DexTokenInfo, TokenBalanceBreakdown } from "../../backend";
import { useDexBalanceBreakdown } from "../../hooks/useDexIndicators";
import { formatUnits } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatTimestamp } from "./ConversionsCard";

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

const ROWS: Array<{ key: AmountKey; label: string; strong?: boolean }> = [
  { key: "poolReserves", label: "Pool reserves" },
  { key: "guarantees", label: "Redemption reserve" },
  { key: "creatorHoldings", label: "Creator holdings" },
  { key: "dexBalances", label: "DEX balances" },
  { key: "permanentLiquidity", label: "Permanent liquidity set aside" },
  { key: "requestDeposits", label: "Pair-request deposits" },
  { key: "auctionDeposits", label: "Auction deposits" },
  { key: "inFlight", label: "In-flight operations" },
  { key: "total", label: "Total", strong: true },
  { key: "ledgerBalance", label: "Ledger balance", strong: true },
  { key: "difference", label: "Difference" },
];

const STATUS_LABELS: Record<ReserveStatus, string> = {
  [ReserveStatus.ok]: "OK",
  [ReserveStatus.surplus]: "Surplus",
  [ReserveStatus.shortfall]: "Shortfall",
};

function amountOf(
  row: TokenBalanceBreakdown,
  key: AmountKey,
  info: DexTokenInfo | undefined,
): string {
  const value = row[key];
  return info ? formatUnits(value, info.decimals, 0) : value.toString();
}

/** Balance breakdown per token, from the public getDexBalanceBreakdown query. */
export function DexBalanceBreakdown({
  tokens,
}: { tokens: DexTokenInfo[] | undefined }) {
  const { data, isLoading, error } = useDexBalanceBreakdown();
  if (isLoading)
    return (
      <Skeleton
        className="h-32 w-full"
        data-ocid="admin.dex_reserve.breakdown_loading_state"
      />
    );
  if (error || !data)
    return (
      <Alert
        variant="destructive"
        data-ocid="admin.dex_reserve.breakdown_error_state"
      >
        <AlertDescription>
          {error?.message || "The balance breakdown could not be loaded."}
        </AlertDescription>
      </Alert>
    );
  const columns = data.tokens.map((row) => ({
    row,
    info: tokens?.find((t) => t.token === row.token),
  }));
  return (
    <div className="space-y-2">
      {!data.complete && (
        <Alert
          variant="destructive"
          data-ocid="admin.dex_reserve.breakdown_incomplete_state"
        >
          <AlertDescription>
            Some components could not be read. The figures are incomplete.
          </AlertDescription>
        </Alert>
      )}
      <Table data-ocid="admin.dex_reserve.breakdown_table">
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            {columns.map(({ row, info }) => (
              <TableHead key={row.token} className="text-right">
                {info?.symbol ?? row.token}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((def) => (
            <TableRow
              key={def.key}
              data-ocid={`admin.dex_reserve.breakdown_row.${def.key}`}
            >
              <TableCell className={def.strong ? "font-medium" : undefined}>
                {def.label}
              </TableCell>
              {columns.map(({ row, info }) => (
                <TableCell
                  key={row.token}
                  className={`text-right font-mono text-xs ${def.strong ? "font-medium" : ""}`}
                >
                  {amountOf(row, def.key, info)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow data-ocid="admin.dex_reserve.breakdown_row.status">
            <TableCell>Status</TableCell>
            {columns.map(({ row }) => (
              <TableCell key={row.token} className="text-right">
                <Badge
                  variant={
                    row.status === ReserveStatus.shortfall
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {STATUS_LABELS[row.status]}
                </Badge>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
      <p
        className="text-xs text-muted-foreground"
        data-ocid="admin.dex_reserve.breakdown_checked_at"
      >
        Checked {formatTimestamp(data.checkedAt)}
      </p>
    </div>
  );
}
