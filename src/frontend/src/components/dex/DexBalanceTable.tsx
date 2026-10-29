import type { DexBalanceView, DexTokenInfo } from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import type { DexDialogKind } from "./DexAmountDialog";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { DexTokenLogo } from "./DexTokenLogo";
import { DEX_TOKEN_ORDER, dexLogoToken, formatDexUnits } from "./dexFormat";

export interface DexBalanceRow {
  token: DexTokenInfo;
  available: bigint;
  reserved: bigint;
}

/** One row per DEX token in the fixed order, zero when no balance is stored. */
export function buildBalanceRows(
  tokens: Array<DexTokenInfo>,
  balances: Array<DexBalanceView>,
): Array<DexBalanceRow> {
  return [...tokens]
    .sort(
      (a, b) =>
        DEX_TOKEN_ORDER.indexOf(a.token) - DEX_TOKEN_ORDER.indexOf(b.token),
    )
    .map((token) => {
      const b = balances.find((x) => x.token === token.token);
      return {
        token,
        available: b?.available ?? 0n,
        reserved: b?.reserved ?? 0n,
      };
    });
}

export function DexBalanceTable({
  rows,
  ocid,
  onAction,
}: {
  rows: Array<DexBalanceRow>;
  ocid: string;
  onAction?: (kind: DexDialogKind, row: DexBalanceRow) => void;
}) {
  const t = useDict(DEX_TEXT);
  const paused = useDexPaused();
  const grid = onAction
    ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
    : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

  return (
    <div className="flex flex-col text-sm" data-ocid={`${ocid}.table`}>
      <div
        className={`hidden gap-4 border-b border-border pb-2 text-xs text-muted-foreground sm:grid ${grid}`}
      >
        <span>{t.colToken}</span>
        <span className="text-end">{t.colAvailable}</span>
        <span className="text-end">{t.colReserved}</span>
        {onAction && <span className="sr-only">{t.depositButton}</span>}
      </div>
      <ul className="flex flex-col">
        {rows.map((row, i) => (
          <li
            key={row.token.token}
            className={`grid grid-cols-2 items-center gap-x-4 gap-y-2 border-b border-border py-3 ${grid}`}
            data-ocid={`${ocid}.row.${i + 1}`}
          >
            <span className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
              <DexTokenLogo token={dexLogoToken(row.token)} />
              <span className="truncate font-medium">{row.token.symbol}</span>
            </span>
            <span className="flex flex-col sm:text-end">
              <span className="text-xs text-muted-foreground sm:hidden">
                {t.colAvailable}
              </span>
              <span className="font-mono tabular-nums break-all">
                {formatDexUnits(row.available, row.token)}
              </span>
            </span>
            <span className="flex flex-col text-end">
              <span className="text-xs text-muted-foreground sm:hidden">
                {t.colReserved}
              </span>
              <span className="font-mono tabular-nums break-all">
                {formatDexUnits(row.reserved, row.token)}
              </span>
            </span>
            {onAction && (
              <span className="col-span-2 flex gap-2 sm:col-span-1 sm:justify-end">
                <DexPausedHint paused={paused} className="flex-1 sm:flex-none">
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-11 flex-1 sm:min-h-9 sm:flex-none"
                    onClick={() => onAction("deposit", row)}
                    disabled={paused}
                    data-ocid={`${ocid}.deposit_button.${i + 1}`}
                  >
                    {t.depositButton}
                  </Button>
                </DexPausedHint>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-11 flex-1 sm:min-h-9 sm:flex-none"
                  onClick={() => onAction("withdraw", row)}
                  disabled={row.available === 0n}
                  data-ocid={`${ocid}.withdraw_button.${i + 1}`}
                >
                  {t.withdrawButton}
                </Button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
