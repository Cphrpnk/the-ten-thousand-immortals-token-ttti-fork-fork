import type { DexConfig } from "../../backend";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT, PLAIN_RULES_TEXT } from "../../i18n/pages/dex";
import { DexAccordion } from "./DexAccordion";
import { formatUsdE8 } from "./liquidityFormat";

/**
 * The single place on the Pools page for the protocol statement, the mint fee
 * split and the pool rules. Closed by default.
 */
export function HowPoolsWork({ config }: { config: DexConfig | undefined }) {
  const t = useDict(DEX_TEXT);
  const m = useDict(MINT_REVENUE_TEXT);
  const p = useDict(PLAIN_RULES_TEXT);
  return (
    <DexAccordion label={t.howPoolsWorkTitle} ocid="pools.how_pools_work">
      <p
        className="callout-info max-w-3xl px-3 py-2 text-sm"
        data-ocid="pools.protocol_statement"
      >
        {t.protocolStatement}
      </p>
      <p
        className="max-w-3xl text-sm text-muted-foreground"
        data-ocid="pools.swap_fee_split"
      >
        {m.swapFeeSplit}
      </p>
      <p
        className="max-w-3xl text-sm text-muted-foreground"
        data-ocid="pools.plain_rules"
      >
        {p.noReward} {p.observedYield}
      </p>
      <div
        className="flex max-w-3xl flex-col gap-1"
        data-ocid="pools.relay_explain"
      >
        <h4 className="text-sm font-medium">{t.relayTitle}</h4>
        <p className="text-sm text-muted-foreground">{t.relayExplain}</p>
      </div>
      <div
        className="flex max-w-3xl flex-col gap-1"
        data-ocid="pools.fee_split_explain"
      >
        <h4 className="text-sm font-medium">{t.feeSplitTitle}</h4>
        <p className="text-sm text-muted-foreground">{t.feeSplitExplain}</p>
      </div>
      <div
        className="flex max-w-3xl flex-col gap-1"
        data-ocid="pools.impermanent_loss"
      >
        <h4 className="text-sm font-medium">{p.ilTitle}</h4>
        <p className="text-sm text-muted-foreground">{p.il}</p>
      </div>
      <div className="flex max-w-3xl flex-col gap-1" data-ocid="pools.exposure">
        <h4 className="text-sm font-medium">{p.exposureTitle}</h4>
        <p className="text-sm text-muted-foreground">{p.exposure}</p>
      </div>
      <ul
        className="flex max-w-3xl list-disc flex-col gap-1.5 ps-5 text-sm text-muted-foreground"
        data-ocid="pools.rules"
      >
        <li>{t.lockedSharesRule}</li>
        {config && config.swapThresholdUsdE8 > 0n && (
          <li>{t.launchDepthRule(formatUsdE8(config.swapThresholdUsdE8))}</li>
        )}
        {config && (
          <li>
            {t.referenceIntro(
              formatNumber(Number(config.referenceToleranceBps) / 100, {
                maximumFractionDigits: 2,
              }),
            )}
          </li>
        )}
        <li>{t.firstDepositRule}</li>
      </ul>
    </DexAccordion>
  );
}
