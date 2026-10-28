import type { PoolId } from "../../backend";
import { useDexTokens, useProtocolLiquidity } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Skeleton } from "../ui/skeleton";
import { protocolLiquidityLines } from "./liquidityFormat";

/** Protocol-owned liquidity of one pool, locked forever. */
export function ProtocolLiquidityInfo({
  poolId,
  index,
}: {
  poolId: PoolId;
  index: number;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const protocol = useProtocolLiquidity();
  const tokens = useDexTokens();
  const view = protocol.data?.find((v) => v.poolId === poolId);
  const lines =
    view && view.shares > 0n
      ? protocolLiquidityLines(t, view, tokens.data ?? [], lang)
      : null;

  return (
    <div
      className="flex flex-col gap-1 border-t border-border pt-3 text-xs"
      data-ocid={`pools.protocol_liquidity.panel.${index}`}
    >
      <p className="text-sm text-muted-foreground">
        {t.protocolLiquidityTitle}
      </p>
      {protocol.isPending ? (
        <Skeleton
          className="h-10 rounded-md"
          data-ocid={`pools.protocol_liquidity.loading_state.${index}`}
        />
      ) : !lines ? (
        <p
          className="text-muted-foreground"
          data-ocid={`pools.protocol_liquidity.empty_state.${index}`}
        >
          {t.protocolLiquidityNone}
        </p>
      ) : (
        <ul className="flex flex-col gap-0.5 tabular-nums break-words">
          <li className="text-muted-foreground">{t.protocolLiquidityLocked}</li>
          <li>{lines.held}</li>
          <li>{lines.share}</li>
          <li className="text-muted-foreground">{lines.fromFees}</li>
          <li className="text-muted-foreground">{lines.fromTreasury}</li>
          {lines.lastAdded && (
            <li className="text-muted-foreground">{lines.lastAdded}</li>
          )}
        </ul>
      )}
    </div>
  );
}
