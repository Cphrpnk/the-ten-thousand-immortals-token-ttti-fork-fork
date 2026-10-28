import { useQuery } from "@tanstack/react-query";
import type { PoolTokenView } from "../../backend";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import {
  QUOTE_TTL_MS,
  readSwapQuote,
  resolveSwapPool,
} from "../../lib/icpswap";
import { formatDexUnits } from "./dexFormat";
import { REFERENCE_WARNING_PCT } from "./liquidityFormat";

/**
 * ICPSwap price shown as a reference only: quote of `amount0` of token0, and
 * the deviation of the deposit ratio amount1 / amount0 from it.
 */
export function IcpswapReference({
  token0,
  token1,
  amount0,
  amount1,
}: {
  token0: PoolTokenView;
  token1: PoolTokenView;
  amount0: bigint;
  amount1: bigint;
}) {
  const t = useDict(DEX_TEXT);
  const ledger0 = token0.ledgerId.toText();
  const ledger1 = token1.ledgerId.toText();

  const ref = useQuery({
    queryKey: ["icpswapReference", ledger0, ledger1, amount0.toString()],
    queryFn: async () => {
      const pool = await resolveSwapPool(ledger0, ledger1);
      if (!pool) return null;
      const out = await readSwapQuote(pool, ledger0, amount0);
      return { out };
    },
    enabled: amount0 > 0n,
    staleTime: QUOTE_TTL_MS,
    retry: 1,
  });

  let body: { text: string; warn?: boolean; extra?: string };
  if (ref.isPending) body = { text: t.refLoading };
  else if (ref.isError) body = { text: t.refError };
  else if (!ref.data || ref.data.out === 0n) body = { text: t.refUnavailable };
  else {
    const out = ref.data.out;
    const deviation = Math.abs(Number(amount1) / Number(out) - 1) * 100;
    const pct = formatNumber(deviation, { maximumFractionDigits: 2 });
    const warn = deviation > REFERENCE_WARNING_PCT;
    body = {
      text: t.refQuote(
        formatDexUnits(amount0, token0),
        formatDexUnits(out, token1),
      ),
      extra: warn ? t.refDeviationWarning(pct) : t.refDeviation(pct),
      warn,
    };
  }

  return (
    <div
      className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-xs"
      data-ocid="pools.add.reference.panel"
      aria-live="polite"
    >
      <span className="font-medium">{t.refTitle}</span>
      <span className="text-muted-foreground tabular-nums">{body.text}</span>
      {body.extra && (
        <span
          className={body.warn ? "callout-danger px-2 py-1" : "tabular-nums"}
          data-ocid={body.warn ? "pools.add.reference.error_state" : undefined}
        >
          {body.extra}
        </span>
      )}
    </div>
  );
}
