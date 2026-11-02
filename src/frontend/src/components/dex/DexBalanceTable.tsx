import type { DexBalanceView, DexTokenInfo } from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { DexFiat } from "./DexFiat";
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

const grid = "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]";

export function DexBalanceTable({
  rows,
  ocid,
}: {
  rows: Array<DexBalanceRow>;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);

  return (
    <div className="flex flex-col text-sm" data-ocid={`${ocid}.table`}>
      <div
        className={`hidden gap-4 border-b border-border pb-2 text-xs text-muted-foreground sm:grid ${grid}`}
      >
        <span>{t.colToken}</span>
        <span className="text-end">{t.colAvailable}</span>
        <span className="text-end">{t.colReserved}</span>
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
              <DexFiat token={row.token} amount={row.available} />
            </span>
            <span className="flex flex-col text-end">
              <span className="text-xs text-muted-foreground sm:hidden">
                {t.colReserved}
              </span>
              <span className="font-mono tabular-nums break-all">
                {formatDexUnits(row.reserved, row.token)}
              </span>
              <DexFiat token={row.token} amount={row.reserved} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
