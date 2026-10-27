import { Info } from "lucide-react";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { buybackFeeLabel, buybackPriceLabel } from "../../lib/buyback";
import { CK_FEE_BPS, feeLabelFor } from "../../lib/token";
import { cn } from "../../lib/utils";

/** Factual explanation of how a mass buyback amount is set. */
export function BuybackExplanation({ className }: { className?: string }) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const lines = [
    t.explainMass,
    t.explainRatio,
    t.explainPercent,
    t.explainRule(buybackPriceLabel(lang)),
    t.explainFees(buybackFeeLabel(lang)),
    t.explainPurchaseFee(feeLabelFor(CK_FEE_BPS, lang)),
    t.explainBtc,
    t.explainEligibility,
    t.explainFunding,
  ];
  return (
    <section
      className={cn("callout-info flex flex-col gap-2 px-3 py-3", className)}
      data-ocid="buyback.explanation"
    >
      <h4 className="flex items-center gap-2 font-display text-sm font-medium">
        <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {t.explainTitle}
      </h4>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
