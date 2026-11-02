import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useDexBalances,
  useDexTokens,
  useWithdrawFromDex,
} from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { buildBalanceRows } from "./DexBalanceTable";
import { DexFiat, useDexUnitsText } from "./DexFiat";
import {
  dexCallErrorText,
  dexTransferErrorText,
  formatDexUnits,
} from "./dexFormat";

type Feedback = { tone: "info" | "danger"; text: string };

/** Discreet DEX balance line and a single button returning it to the wallet. */
export function DexBalancesPanel({ owner }: { owner: Principal }) {
  const t = useDict(DEX_TEXT);
  const tokens = useDexTokens();
  const balances = useDexBalances(owner);
  const withdraw = useWithdrawFromDex();
  const unitsText = useDexUnitsText();
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loading = tokens.isPending || balances.isPending;
  const failed = tokens.isError || balances.isError;
  const rows = buildBalanceRows(tokens.data ?? [], balances.data ?? []);
  const shown = rows.filter((r) => r.available > 0n || r.reserved > 0n);

  const onRecover = async () => {
    if (running) return;
    const targets = rows.filter((r) => r.available > 0n);
    if (targets.length === 0) {
      setFeedback({ tone: "info", text: t.recoverNothing });
      return;
    }
    setRunning(true);
    setFeedback(null);
    const done: Array<string> = [];
    let failure: string | null = null;
    for (const row of targets) {
      try {
        const outcome = await withdraw.mutateAsync({
          token: row.token.token,
          amount: row.available,
        });
        if (outcome.__kind__ === "ok") {
          done.push(unitsText(row.available, row.token));
        } else {
          failure ??= `${row.token.symbol}: ${dexTransferErrorText(t, outcome.err, row.token)}`;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failure ??= `${row.token.symbol}: ${dexCallErrorText(t, message, (d) => d)}`;
      }
    }
    setRunning(false);
    if (failure !== null) {
      setFeedback({ tone: "danger", text: t.recoverError(failure) });
    } else {
      setFeedback({ tone: "info", text: t.recoverDone(done.join(", ")) });
    }
  };

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.balances.panel">
      <h3 className="font-display text-base tracking-wide text-muted-foreground">
        {t.recoverHeading}
      </h3>
      {loading ? (
        <Skeleton
          className="h-5 w-48"
          data-ocid="pools.balances.loading_state"
          aria-label={t.balancesLoading}
        />
      ) : failed ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="pools.balances.error_state"
        >
          {t.balancesLoadError}
        </p>
      ) : (
        shown.length > 0 && (
          <ul
            className="flex flex-col gap-0.5 text-sm text-muted-foreground"
            data-ocid="pools.balances.list"
          >
            {shown.map((row, i) => (
              <li
                key={row.token.token}
                className="font-mono tabular-nums break-all"
                data-ocid={`pools.balances.item.${i + 1}`}
              >
                {formatDexUnits(row.available, row.token)}{" "}
                <DexFiat token={row.token} amount={row.available} />
                {row.reserved > 0n && (
                  <>
                    {` · ${t.colReserved} ${formatDexUnits(row.reserved, row.token)} `}
                    <DexFiat token={row.token} amount={row.reserved} />
                  </>
                )}
              </li>
            ))}
          </ul>
        )
      )}
      <p className="text-xs text-muted-foreground">{t.recoverExplain}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 sm:min-h-9"
          onClick={() => void onRecover()}
          disabled={running || loading}
          data-ocid="pools.balances.recover_button"
        >
          {running ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              {t.recovering}
            </>
          ) : (
            t.recoverButton
          )}
        </Button>
        <div aria-live="polite" className="min-w-0 text-sm">
          {feedback && (
            <p
              className={
                feedback.tone === "info"
                  ? "text-muted-foreground"
                  : "text-destructive break-words"
              }
              data-ocid={
                feedback.tone === "info"
                  ? "pools.balances.success_state"
                  : "pools.balances.recover.error_state"
              }
            >
              {feedback.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
