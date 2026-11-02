import { useDict } from "../../i18n/core";
import { PLAIN_RULES_TEXT } from "../../i18n/pages/dex";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import { DexAccordion } from "../dex/DexAccordion";

/** Long explanations of the amount returned, closed by default. */
export function RuleExplanations() {
  const t = useDict(GUARANTEE_TEXT);
  const plain = useDict(PLAIN_RULES_TEXT);
  return (
    <DexAccordion label={t.explainTitle} ocid="guarantee.rules">
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p data-ocid="guarantee.rules.recoverable">{plain.guarantee}</p>
        <p data-ocid="guarantee.rules.lower_of_two">{t.explainLowerOfTwo}</p>
        <p data-ocid="guarantee.rules.pro_rata">{t.explainProRata}</p>
        <p data-ocid="guarantee.rules.account">{t.explainAccount}</p>
        <p
          className="callout-info px-3 py-2"
          data-ocid="guarantee.rules.example"
        >
          {t.explainProRataExample}
        </p>
      </div>
    </DexAccordion>
  );
}
