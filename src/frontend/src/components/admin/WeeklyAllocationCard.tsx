import { CalendarClock } from "lucide-react";
import { useState } from "react";
import type { PoolView, WeeklyAllocation } from "../../backend";
import { useDexPools } from "../../hooks/useDex";
import {
  useLastWeeklyAllocation,
  useWeeklyAllocations,
} from "../../hooks/useQueries";
import { formatIcpE8s } from "../../lib/token";
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
import { formatTimestamp } from "./ConversionsCard";
import {
  formatDays,
  formatTokenAmounts,
  poolLabel,
  poolSideAmount,
} from "./protocolFormat";
import { GOLD_CARD, SECONDARY_GOLD } from "./styles";

const LABEL =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

function AllocationDetails({
  item,
  pools,
}: { item: WeeklyAllocation; pools: PoolView[] | undefined }) {
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Date</dt>
        <dd className="text-right font-mono tabular-nums">
          {formatTimestamp(item.at)}
        </dd>
        <dt className="text-muted-foreground">Autonomy</dt>
        <dd className="text-right font-mono tabular-nums">
          {formatDays(item.autonomyDays)}
        </dd>
        <dt className="text-muted-foreground">To cycles reserve</dt>
        <dd className="text-right font-mono tabular-nums">
          {formatIcpE8s(item.toCyclesReserveE8s, "en")}
        </dd>
        <dt className="text-muted-foreground">Surplus</dt>
        <dd className="text-right font-mono tabular-nums">
          {formatIcpE8s(item.surplusE8s, "en")}
        </dd>
        <dt className="text-muted-foreground">To bonus</dt>
        <dd className="text-right font-mono tabular-nums">
          {formatIcpE8s(item.toBonusE8s, "en")}
        </dd>
        <dt className="text-muted-foreground">To liquidity</dt>
        <dd className="text-right font-mono tabular-nums break-words">
          {formatTokenAmounts(item.toLiquidity)}
        </dd>
        <dt className="text-muted-foreground">Waiting</dt>
        <dd className="text-right font-mono tabular-nums break-words">
          {formatTokenAmounts(item.waiting)}
        </dd>
        <dt className="text-muted-foreground">Treasury balances</dt>
        <dd className="text-right font-mono tabular-nums break-words">
          {formatTokenAmounts(item.treasuryBalances)}
        </dd>
        <dt className="text-muted-foreground">Stock payout cap</dt>
        <dd className="text-right font-mono tabular-nums break-words">
          {formatTokenAmounts(item.stockPayoutCap)}
        </dd>
      </dl>
      <div className="space-y-1">
        <p className={LABEL}>Liquidity adds</p>
        {item.poolAdds.length === 0 ? (
          <p className="text-sm text-muted-foreground">None</p>
        ) : (
          <ul className="divide-y divide-border text-xs font-mono tabular-nums">
            {item.poolAdds.map((add) => (
              <li
                key={add.poolId.toString()}
                className="flex flex-wrap justify-between gap-2 py-1.5"
              >
                <span>{poolLabel(pools, add.poolId)}</span>
                <span>
                  {poolSideAmount(pools, add.poolId, 0, add.amount0)} +{" "}
                  {poolSideAmount(pools, add.poolId, 1, add.amount1)} ·{" "}
                  {add.shares.toString()} shares
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-1">
        <p className={LABEL}>Skipped</p>
        {item.skipped.length === 0 ? (
          <p className="text-sm text-muted-foreground">None</p>
        ) : (
          <ul className="divide-y divide-border text-xs">
            {item.skipped.map((skip) => (
              <li
                key={`${skip.poolId.toString()}-${skip.reason}`}
                className="flex flex-wrap justify-between gap-2 py-1.5"
              >
                <span className="font-mono">
                  {poolLabel(pools, skip.poolId)}
                </span>
                <span className="text-muted-foreground">{skip.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {item.note && (
        <p className="text-xs text-muted-foreground break-words">{item.note}</p>
      )}
    </div>
  );
}

/** Last weekly allocation of the protocol fees and its history. */
export function WeeklyAllocationCard() {
  const last = useLastWeeklyAllocation();
  const all = useWeeklyAllocations();
  const { data: pools } = useDexPools();
  const [openId, setOpenId] = useState<bigint | null>(null);

  return (
    <Card className={GOLD_CARD} data-ocid="admin.weekly_allocation_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <CalendarClock className="h-5 w-5 text-primary" />
          Weekly Allocation (history)
        </CardTitle>
        <CardDescription>
          Read-only history. The weekly allocation is removed; no new
          calculation runs. It sent ICP to cycles under 90 days of autonomy and
          split the surplus into an ICP bonus (DL) and locked liquidity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {last.isLoading ? (
          <Skeleton
            className="h-48 w-full"
            data-ocid="admin.weekly_allocation_loading_state"
          />
        ) : last.isError ? (
          <Alert
            variant="destructive"
            data-ocid="admin.weekly_allocation_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The weekly allocation could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void last.refetch()}
                data-ocid="admin.weekly_allocation_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : last.data ? (
          <div data-ocid="admin.weekly_allocation_last">
            <p className={`${LABEL} mb-2`}>
              Last calculation #{last.data.id.toString()}
            </p>
            <AllocationDetails item={last.data} pools={pools} />
          </div>
        ) : (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.weekly_allocation.empty_state"
          >
            No weekly calculation was made
          </p>
        )}

        <div
          className="space-y-1.5"
          data-ocid="admin.weekly_allocation_history"
        >
          <p className={LABEL}>History</p>
          {all.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : !all.data || all.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            <ul className="max-h-[32rem] divide-y divide-border overflow-auto">
              {all.data.map((item, i) => {
                const open = openId === item.id;
                return (
                  <li key={item.id.toString()} className="space-y-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums">
                      <span className="text-muted-foreground">
                        #{item.id.toString()} · {formatTimestamp(item.at)}
                      </span>
                      <span>
                        Cycles {formatIcpE8s(item.toCyclesReserveE8s, "en")} ·
                        Bonus {formatIcpE8s(item.toBonusE8s, "en")} · Adds{" "}
                        {item.poolAdds.length} · Skipped {item.skipped.length}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className={SECONDARY_GOLD}
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? null : item.id)}
                        data-ocid={`admin.weekly_allocation_history.toggle.${i + 1}`}
                      >
                        {open ? "Hide" : "Details"}
                      </Button>
                    </div>
                    {open && <AllocationDetails item={item} pools={pools} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
