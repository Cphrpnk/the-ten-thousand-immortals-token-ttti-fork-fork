import type { Principal } from "@icp-sdk/core/principal";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useDexBalances, useDexTokens } from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { DexAmountDialog, type DexDialogKind } from "./DexAmountDialog";
import {
  type DexBalanceRow,
  DexBalanceTable,
  buildBalanceRows,
} from "./DexBalanceTable";
import { DexDepositSubaccount } from "./DexDepositSubaccount";
import { DexTransfersList } from "./DexTransfersList";

const SKELETONS = Array.from({ length: 5 }, (_, i) => `balance-skeleton-${i}`);

/** Signed-in user's DEX balances, deposit / withdraw dialogs and transfers. */
export function DexBalancesPanel({ owner }: { owner: Principal }) {
  const t = useDict(DEX_TEXT);
  const tokens = useDexTokens();
  const balances = useDexBalances(owner);
  const [dialog, setDialog] = useState<{
    kind: DexDialogKind;
    row: DexBalanceRow;
  } | null>(null);

  const loading = tokens.isPending || balances.isPending;
  const failed = tokens.isError || balances.isError;
  const rows = buildBalanceRows(tokens.data ?? [], balances.data ?? []);
  const empty = rows.every((r) => r.available === 0n && r.reserved === 0n);

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-5 sm:p-6">
      <DexDepositSubaccount owner={owner} ocid="pools.balances.subaccount" />
      {loading ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="pools.balances.loading_state"
          aria-label={t.balancesLoading}
        >
          {SKELETONS.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : failed ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="pools.balances.error_state"
        >
          <span>{t.balancesLoadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void tokens.refetch();
              void balances.refetch();
            }}
            aria-label={t.balancesLoadError}
            data-ocid="pools.balances.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {empty && (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="pools.balances.empty_state"
            >
              {t.balancesEmpty}
            </p>
          )}
          <DexBalanceTable
            rows={rows}
            ocid="pools.balances"
            onAction={(kind, row) => setDialog({ kind, row })}
          />
        </div>
      )}
      <DexTransfersList owner={owner} tokens={tokens.data ?? []} />
      {dialog && (
        <DexAmountDialog
          key={`${dialog.kind}-${dialog.row.token.token}`}
          kind={dialog.kind}
          token={dialog.row.token}
          available={
            rows.find((r) => r.token.token === dialog.row.token.token)
              ?.available ?? dialog.row.available
          }
          owner={owner}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
