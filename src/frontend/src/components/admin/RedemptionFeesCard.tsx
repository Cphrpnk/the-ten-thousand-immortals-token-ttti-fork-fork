import type { PayToken } from "../../backend";
import { useRedemptionFees } from "../../hooks/useGuarantee";
import { formatTokenQuantity } from "../../lib/guarantee";
import { PAY_TOKEN_ORDER } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";

/** Read-only list of the 1 percent redemption fees set aside for the creator. */
export function RedemptionFeesCard({ className }: { className?: string }) {
  const { data: fees, isLoading, isError, refetch } = useRedemptionFees();

  const totals = PAY_TOKEN_ORDER.map((token: PayToken) => ({
    token,
    amount: (fees ?? [])
      .filter((fee) => fee.token === token)
      .reduce((sum, fee) => sum + fee.amount, 0n),
  }));

  return (
    <div
      className={`space-y-5 ${className ?? ""}`}
      data-ocid="admin.redemption_fees_card"
    >
      <p className="max-w-3xl text-sm text-muted-foreground">
        The 1 percent fee of each guarantee redemption is set aside for the
        creator, in the token returned. Read-only.
      </p>
      {isLoading ? (
        <Skeleton
          className="h-24 w-full rounded-lg"
          data-ocid="admin.redemption_fees_loading_state"
        />
      ) : isError || !fees ? (
        <Alert
          variant="destructive"
          data-ocid="admin.redemption_fees_error_state"
        >
          <AlertDescription className="flex flex-wrap items-center gap-3">
            The redemption fees could not be loaded.
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <dl
            className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]"
            data-ocid="admin.redemption_fees_totals"
          >
            {totals.map(({ token, amount }) => (
              <div key={token} className="contents">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-mono tabular-nums">
                  {formatTokenQuantity(amount, token, "en")}
                </dd>
              </div>
            ))}
          </dl>
          <AdminAccordion
            label="Redemption fees"
            count={fees.length}
            ocid="admin.redemption_fees_accordion"
          >
            {fees.length === 0 ? (
              <p
                className="text-sm text-muted-foreground"
                data-ocid="admin.redemption_fees_empty_state"
              >
                No redemption fee has been set aside yet.
              </p>
            ) : (
              <ul data-ocid="admin.redemption_fees_list">
                {fees.map((fee, index) => (
                  <li
                    key={`${fee.token}-${fee.redemptionId.toString()}`}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border py-3 text-xs first:border-t-0"
                    data-ocid={`admin.redemption_fees_item.${index + 1}`}
                  >
                    <span className="font-mono text-muted-foreground">
                      Redemption #{fee.redemptionId.toString()}
                    </span>
                    <span className="font-mono tabular-nums">
                      {formatTokenQuantity(fee.amount, fee.token, "en")}
                    </span>
                    <span className="text-muted-foreground">
                      {formatTimestamp(fee.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminAccordion>
        </>
      )}
    </div>
  );
}
