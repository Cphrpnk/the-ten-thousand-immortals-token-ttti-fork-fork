import { useDexPools } from "../../hooks/useDex";
import { useAdminRouterFees } from "../../hooks/useRouter";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { poolLabel, poolSideAmount } from "./protocolFormat";

/** The 0.1 % protocol fee of ICPSwap routed swaps, per native pool. */
export function RouterFeesTable() {
  const { data: fees, isLoading, isError } = useAdminRouterFees();
  const { data: pools } = useDexPools();

  if (isLoading) {
    return (
      <Skeleton
        className="h-24 w-full"
        data-ocid="admin.router_fees_loading_state"
      />
    );
  }
  if (isError || !fees) {
    return (
      <Alert variant="destructive" data-ocid="admin.router_fees_error_state">
        <AlertDescription>
          The router fees could not be loaded.
        </AlertDescription>
      </Alert>
    );
  }
  if (fees.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.router_fees.empty_state"
      >
        No 0.1 % protocol fee collected yet
      </p>
    );
  }
  const both = (poolId: bigint, v0: bigint, v1: bigint) => (
    <>
      <span className="block">{poolSideAmount(pools, poolId, 0, v0)}</span>
      <span className="block">{poolSideAmount(pools, poolId, 1, v1)}</span>
    </>
  );
  return (
    <div className="overflow-x-auto" data-ocid="admin.router_fees_table">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Native pool</th>
            <th className="py-2 pr-4 font-medium">Collected (0.1 %)</th>
            <th className="py-2 pr-4 font-medium">LP paid (70 %)</th>
            <th className="py-2 pr-4 font-medium">LP set aside (70 %)</th>
            <th className="py-2 pr-4 font-medium">Permanent (30 %)</th>
            <th className="py-2 font-medium">Waiting for LPs</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs tabular-nums">
          {fees.map(({ totals: f, setAside }, i) => (
            <tr
              key={f.poolId.toString()}
              className="border-t border-border align-top"
              data-ocid={`admin.router_fees.item.${i + 1}`}
            >
              <td className="py-2 pr-4 font-sans text-sm">
                {poolLabel(pools, f.poolId)}
              </td>
              <td className="py-2 pr-4">
                {both(f.poolId, f.collected0, f.collected1)}
              </td>
              <td className="py-2 pr-4">
                {both(f.poolId, f.lpPaid0, f.lpPaid1)}
              </td>
              <td className="py-2 pr-4">
                {both(f.poolId, f.lpSetAside0, f.lpSetAside1)}
              </td>
              <td className="py-2 pr-4">
                {both(f.poolId, f.permanent0, f.permanent1)}
              </td>
              <td className="py-2">
                {both(f.poolId, setAside.amount0, setAside.amount1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
