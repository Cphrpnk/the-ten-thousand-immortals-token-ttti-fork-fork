import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import {
  type BuybackFigures,
  buybackFeeLabel,
  buybackRuleLabel,
  formatAmountReturned,
  formatBuybackBase,
  formatBuybackFee,
  formatBuybackPercent,
  formatMassRatio,
  formatOriginalNet,
  formatThirdPartyFees,
  formatTttiQuantity,
} from "../../lib/buyback";

/** Figures of a quote or a recorded mass buyback, as a two-column list. */
export function BuybackDetails({
  figures,
  ocid = "buyback.quote",
}: {
  figures: BuybackFigures;
  ocid?: string;
}) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const ratio = formatMassRatio(
    figures.originalToken,
    figures.massTotalNet,
    figures.massTotalTtti,
    lang,
  );
  const rows: Array<[string, string]> = [
    [t.percentLabel, formatBuybackPercent(figures.percent, lang)],
    [t.massRatioLabel, ratio ?? t.notRecorded],
    [t.tttiReturnedLabel, formatTttiQuantity(figures.tttiAmount, lang)],
    [t.originalNetLabel, formatOriginalNet(figures, lang)],
    [t.baseLabel, formatBuybackBase(figures, lang)],
    [t.ruleLabel, buybackRuleLabel(figures.rule, t)],
    [t.feeLabel(buybackFeeLabel(lang)), formatBuybackFee(figures, lang)],
    [t.thirdPartyLabel, formatThirdPartyFees(figures, lang)],
    [t.tttiFeeLabel, formatTttiQuantity(figures.tttiTransferFee, lang)],
    [t.tttiEscrowFeeLabel, formatTttiQuantity(figures.tttiEscrowFee, lang)],
  ];
  return (
    <dl
      className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-muted/50 p-3 text-sm"
      data-ocid={ocid}
    >
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right font-mono tabular-nums break-words">
            {value}
          </dd>
        </div>
      ))}
      <dt className="border-t border-border pt-2 font-medium">
        {t.amountReturnedLabel}
      </dt>
      <dd
        className="border-t border-border pt-2 text-right font-mono font-semibold tabular-nums text-primary"
        data-ocid={`${ocid}.amount_returned`}
      >
        {formatAmountReturned(figures, lang)}
      </dd>
    </dl>
  );
}
