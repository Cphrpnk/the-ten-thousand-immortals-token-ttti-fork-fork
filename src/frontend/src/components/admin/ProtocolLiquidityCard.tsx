import { Layers } from "lucide-react";
import { useDexTokens, useProtocolLiquidity } from "../../hooks/useDex";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { protocolLiquidityLines } from "../dex/liquidityFormat";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminAccordion } from "./AdminUi";
import { GOLD_CARD } from "./styles";

/** Protocol-owned liquidity per pool, locked forever. */
export function ProtocolLiquidityCard() {
  const { data: views, isLoading, isError, refetch } = useProtocolLiquidity();
  const { data: tokens } = useDexTokens();
  const t = DEX_TEXT.en;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.protocol_liquidity_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Protocol Liquidity
        </CardTitle>
        <CardDescription>{t.protocolLiquidityLocked}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton
            className="h-32 w-full"
            data-ocid="admin.protocol_liquidity_loading_state"
          />
        ) : isError || !views ? (
          <Alert
            variant="destructive"
            data-ocid="admin.protocol_liquidity_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The protocol liquidity could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.protocol_liquidity_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : views.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.protocol_liquidity.empty_state"
          >
            {t.protocolLiquidityNone}
          </p>
        ) : (
          <AdminAccordion
            label="Protocol liquidity per pool"
            count={views.length}
            ocid="admin.protocol_liquidity_accordion"
          >
            <ul className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              {views.map((view, i) => {
                const lines = protocolLiquidityLines(
                  t,
                  view,
                  tokens ?? [],
                  "en",
                );
                return (
                  <li
                    key={view.poolId.toString()}
                    className="space-y-1 border-l border-border pl-4 text-sm"
                    data-ocid={`admin.protocol_liquidity.item.${i + 1}`}
                  >
                    <p className="font-mono font-semibold text-primary">
                      {view.token0Symbol}/{view.token1Symbol} (#
                      {view.poolId.toString()})
                    </p>
                    {view.shares === 0n ? (
                      <p className="text-muted-foreground">
                        {t.protocolLiquidityNone}
                      </p>
                    ) : (
                      <>
                        <p className="font-mono tabular-nums">{lines.held}</p>
                        <p className="text-muted-foreground">
                          {lines.fromFees}
                        </p>
                        <p className="text-muted-foreground">
                          {lines.fromTreasury}
                        </p>
                        <p className="text-muted-foreground">{lines.share}</p>
                        {lines.lastAdded && (
                          <p className="text-muted-foreground">
                            {lines.lastAdded}
                          </p>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </AdminAccordion>
        )}
      </CardContent>
    </Card>
  );
}
