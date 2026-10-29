import { Route as RouteIcon } from "lucide-react";
import { RoutedSwapStage } from "../../backend";
import type { RoutedSwap, RoutedSwapStatus } from "../../hooks/useRouter";
import { useAdminRoutedSwaps } from "../../hooks/useRouter";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminAccordion, formatTokenAmount } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { RouterFeesTable } from "./RouterFeesTable";
import { GOLD_CARD } from "./styles";

const STAGE_LABELS: Record<RoutedSwapStage, string> = {
  [RoutedSwapStage.recorded]: "Recorded",
  [RoutedSwapStage.movingIn]: "IR transfer to ICPSwap",
  [RoutedSwapStage.depositing]: "Depositing on ICPSwap",
  [RoutedSwapStage.swapping]: "Swapping on ICPSwap",
  [RoutedSwapStage.withdrawing]: "Withdrawing from ICPSwap",
  [RoutedSwapStage.done]: "Done",
};

function statusInfo(status: RoutedSwapStatus): {
  text: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (status.__kind__) {
    case "inProgress":
      return { text: "In progress", variant: "secondary" };
    case "completed":
      return { text: "Completed", variant: "default" };
    case "failedReturned":
      return {
        text: `Failed, input returned: ${status.failedReturned}`,
        variant: "outline",
      };
    case "needsReview":
      return { text: "To review (IR)", variant: "destructive" };
    case "reviewedArrived":
      return {
        text: `Reviewed: arrived in block ${status.reviewedArrived.toString()}`,
        variant: "secondary",
      };
    case "reviewedNotArrived":
      return {
        text: "Reviewed: not arrived, input returned",
        variant: "outline",
      };
  }
}

function SwapRow({ swap, index }: { swap: RoutedSwap; index: number }) {
  const status = statusInfo(swap.status);
  const fees = swap.fees.__kind__ === "icpswap" ? swap.fees.icpswap : null;
  const pool =
    swap.route.__kind__ === "icpswap"
      ? swap.route.icpswap.poolCanisterId.toText()
      : "—";
  return (
    <li
      className="space-y-2 border-t border-border py-4 first:border-t-0"
      data-ocid={`admin.routed_swaps.item.${index}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-sm font-semibold text-primary">
          Routed swap #{swap.id.toString()}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatTimestamp(swap.createdAt)}
        </span>
        <Badge variant={status.variant}>{status.text}</Badge>
        <Badge variant="outline">{STAGE_LABELS[swap.stage]}</Badge>
      </div>
      <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
        <div>
          <dt className="inline text-muted-foreground">In: </dt>
          <dd className="inline font-mono">
            {formatTokenAmount(swap.amountIn, swap.tokenIn)}
          </dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground">Out: </dt>
          <dd className="inline font-mono">
            {formatTokenAmount(swap.amountOut, swap.tokenOut)} (minimum{" "}
            {formatTokenAmount(swap.minAmountOut, swap.tokenOut)})
          </dd>
        </div>
        {fees && (
          <>
            <div>
              <dt className="inline text-muted-foreground">ICPSwap fee: </dt>
              <dd className="inline font-mono">
                {formatTokenAmount(fees.icpswapFee, swap.tokenIn)}
              </dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">
                Protocol fee (LP 70 % / permanent 30 %):{" "}
              </dt>
              <dd className="inline font-mono">
                {formatTokenAmount(fees.protocolFee, swap.tokenIn)} (
                {formatTokenAmount(fees.protocolLpShare, swap.tokenIn)} /{" "}
                {formatTokenAmount(fees.protocolPermanentShare, swap.tokenIn)})
              </dd>
            </div>
          </>
        )}
        <div>
          <dt className="inline text-muted-foreground">Owner: </dt>
          <dd className="inline break-all font-mono">{swap.owner.toText()}</dd>
        </div>
        <div>
          <dt className="inline text-muted-foreground">ICPSwap pool: </dt>
          <dd className="inline break-all font-mono">{pool}</dd>
        </div>
        {swap.move && (
          <div>
            <dt className="inline text-muted-foreground">IR transfer: </dt>
            <dd className="inline font-mono">
              n {swap.move.n.toString()} · attempt{" "}
              {swap.move.attempt.toString()} · sends{" "}
              {swap.move.sends.toString()}
            </dd>
          </div>
        )}
        {swap.lastError && (
          <div className="sm:col-span-2">
            <dt className="inline text-muted-foreground">Last error: </dt>
            <dd className="inline break-words">{swap.lastError}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

/** Routed swaps that went through ICPSwap, and the 0.1 % per native pool. */
export function RoutedSwapsCard() {
  const { data, isLoading, isError, refetch } = useAdminRoutedSwaps();
  const swaps = (data ?? [])
    .filter((s) => s.route.__kind__ === "icpswap")
    .sort((a, b) => (a.id < b.id ? 1 : -1));

  return (
    <Card className={GOLD_CARD} data-ocid="admin.routed_swaps_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <RouteIcon className="h-5 w-5 text-primary" />
          ICPSwap Routed Swaps
        </CardTitle>
        <CardDescription>
          Swaps routed through ICPSwap (0.3 % ICPSwap fee plus a 0.1 % protocol
          fee on the input token). The 0.1 % goes 70 % to the native pool LPs
          (set aside while the pool has no LP) and 30 % to its permanent
          liquidity. IR transfers with an unknown outcome are listed in To
          review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <Skeleton
            className="h-32 w-full"
            data-ocid="admin.routed_swaps_loading_state"
          />
        ) : isError ? (
          <Alert
            variant="destructive"
            data-ocid="admin.routed_swaps_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The routed swaps could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.routed_swaps_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : swaps.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.routed_swaps.empty_state"
          >
            No swap was routed through ICPSwap
          </p>
        ) : (
          <AdminAccordion
            label="Routed swaps"
            count={swaps.length}
            ocid="admin.routed_swaps_accordion"
          >
            <ul data-ocid="admin.routed_swaps_list">
              {swaps.map((swap, i) => (
                <SwapRow key={swap.id.toString()} swap={swap} index={i + 1} />
              ))}
            </ul>
          </AdminAccordion>
        )}
        <AdminAccordion
          label="0.1 % protocol fee per native pool"
          ocid="admin.router_fees_accordion"
        >
          <RouterFeesTable />
        </AdminAccordion>
      </CardContent>
    </Card>
  );
}
