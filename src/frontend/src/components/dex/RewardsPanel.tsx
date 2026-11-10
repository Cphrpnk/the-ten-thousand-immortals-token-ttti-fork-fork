import type { Principal } from "@icp-sdk/core/principal";
import type { PoolView } from "../../backend";
import { useDict } from "../../i18n/core";
import { DEX_TEXT, PLAIN_RULES_TEXT } from "../../i18n/pages/dex";
import { LpBonusPanel } from "./LpBonusPanel";

/** Rewards widget: the LP bonus and its claims. */
export function RewardsPanel({
  owner,
  pools,
}: {
  owner: Principal;
  pools: ReadonlyArray<PoolView>;
}) {
  const t = useDict(DEX_TEXT);
  const p = useDict(PLAIN_RULES_TEXT);
  return (
    <div
      className="flex flex-col gap-6 rounded-lg border border-border bg-card p-5 md:p-6"
      data-ocid="pools.rewards.panel"
    >
      <h3 className="font-display text-xl tracking-wide">{t.rewardsTitle}</h3>
      <p className="-mt-3 max-w-3xl text-sm text-muted-foreground">
        {p.noReward}
      </p>
      <LpBonusPanel owner={owner} pools={pools} />
    </div>
  );
}
