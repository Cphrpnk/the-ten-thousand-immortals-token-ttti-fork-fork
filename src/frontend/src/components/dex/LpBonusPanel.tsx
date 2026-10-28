import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { PoolView } from "../../backend";
import { useClaimLpBonus, useMyLpBonus } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  claimBonusErrorText,
  formatBonusIcp,
  formatDexDate,
  transferStatusLabel,
} from "./dexFormat";
import { formatBonusWeight, remainingLockText } from "./liquidityFormat";

type Feedback = { tone: "info" | "danger"; text: string };

/** ICP bonus (DL) of the caller's locked positions in TTTI-T pairs. */
export function LpBonusPanel({
  owner,
  pools,
}: {
  owner: Principal | undefined;
  pools: ReadonlyArray<PoolView>;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const bonus = useMyLpBonus(owner?.toText());
  const claim = useClaimLpBonus();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const data = bonus.data;
  const pairOf = (poolId: bigint) => {
    const pool = pools.find((p) => p.id === poolId);
    return pool ? `${pool.token0.symbol}/${pool.token1.symbol}` : "";
  };

  const onClaim = () => {
    setFeedback(null);
    claim.mutate(undefined, {
      onSuccess: (outcome) =>
        setFeedback(
          outcome.__kind__ === "ok"
            ? {
                tone: "info",
                text: t.claimDone(formatBonusIcp(outcome.ok.amountE8s)),
              }
            : { tone: "danger", text: claimBonusErrorText(t, outcome.err) },
        ),
      onError: (err) =>
        setFeedback({ tone: "danger", text: t.errCall(err.message) }),
    });
  };

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.lp_bonus.panel">
      <h3 className="font-display text-xl tracking-wide">{t.bonusTitle}</h3>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>{t.bonusScope}</p>
        <p>{t.bonusWeightRule}</p>
        <p>{t.bonusObservedNote}</p>
      </div>
      {!owner ? null : bonus.isPending ? (
        <Skeleton
          className="h-24 rounded-lg"
          aria-label={t.bonusLoading}
          data-ocid="pools.lp_bonus.loading_state"
        />
      ) : bonus.isError || !data ? (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="pools.lp_bonus.error_state"
        >
          {t.bonusLoadError}
        </p>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 text-sm">
          <div className="flex flex-col gap-1 tabular-nums">
            <p className="font-medium" data-ocid="pools.lp_bonus.claimable">
              {t.bonusClaimable(formatBonusIcp(data.claimableE8s))}
            </p>
            <p className="text-muted-foreground">
              {t.bonusClaimedTotal(formatBonusIcp(data.claimedE8s))}
            </p>
          </div>

          {data.positions.length === 0 ? (
            <p
              className="text-muted-foreground"
              data-ocid="pools.lp_bonus.empty_state"
            >
              {t.bonusNoPositions}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                data-ocid="pools.lp_bonus.table"
              >
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pe-3 text-start font-normal">
                      {t.bonusColPosition}
                    </th>
                    <th className="py-1.5 pe-3 text-end font-normal">
                      {t.bonusColValueIcp}
                    </th>
                    <th className="py-1.5 pe-3 text-end font-normal">
                      {t.bonusColRemainingLock}
                    </th>
                    <th className="py-1.5 text-end font-normal">
                      {t.bonusColWeight}
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.positions.map((p, i) => (
                    <tr
                      key={p.positionId.toString()}
                      className="border-b border-border last:border-0"
                      data-ocid={`pools.lp_bonus.row.${i + 1}`}
                    >
                      <td className="py-1.5 pe-3">
                        {t.positionLabel(formatNumber(p.positionId))}
                        {pairOf(p.poolId) && (
                          <span className="text-muted-foreground">
                            {" "}
                            · {pairOf(p.poolId)}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pe-3 text-end">
                        {formatBonusIcp(p.valueIcpE8s)}
                      </td>
                      <td className="py-1.5 pe-3 text-end">
                        {remainingLockText(t, p.remainingLockNs)}
                      </td>
                      <td className="py-1.5 text-end">
                        {formatBonusWeight(p.weight)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-start gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onClaim}
              disabled={claim.isPending || data.claimableE8s === 0n}
              data-ocid="pools.lp_bonus.claim_button"
            >
              {claim.isPending && (
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {claim.isPending ? t.claiming : t.claimButton}
            </Button>
            {feedback && (
              <p
                aria-live="polite"
                className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                data-ocid={
                  feedback.tone === "info"
                    ? "pools.lp_bonus.success_state"
                    : "pools.lp_bonus.claim_error_state"
                }
              >
                {feedback.text}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="font-medium">{t.bonusClaimsTitle}</p>
            {data.claims.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="pools.lp_bonus.claims_empty_state"
              >
                {t.bonusClaimsEmpty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-xs tabular-nums">
                {data.claims.map((c, i) => (
                  <li
                    key={c.n.toString()}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                    data-ocid={`pools.lp_bonus.claim.item.${i + 1}`}
                  >
                    <span>{formatBonusIcp(c.amountE8s)}</span>
                    <span className="text-muted-foreground">
                      {formatDexDate(c.createdAt, lang)} ·{" "}
                      {transferStatusLabel(t, c.status)}
                    </span>
                    <span className="w-full font-mono text-muted-foreground break-all">
                      {c.memoText}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
