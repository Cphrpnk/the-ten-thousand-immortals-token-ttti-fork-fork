import { useState } from "react";
import type { GuaranteeMassView, Redemption } from "../../backend";
import { useWithdrawGuaranteeExcess } from "../../hooks/useGuarantee";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  canWithdrawExcess,
  formatTokenQuantity,
  guaranteeFailureMessage,
} from "../../lib/guarantee";
import { FiatAmount } from "../FiatAmount";
import { Button } from "../ui/button";
import { RedemptionOutcome } from "./RedeemConfirmDialog";

interface ExcessWithdrawProps {
  mass: GuaranteeMassView;
  index: number;
}

/** Withdraw-excess control: enabled only after the mint ended with an excess left. */
export function ExcessWithdraw({ mass, index }: ExcessWithdrawProps) {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const withdraw = useWithdrawGuaranteeExcess();
  const [result, setResult] = useState<Redemption | null>(null);
  const ocid = `guarantee.excess.${index}`;
  const enabled = canWithdrawExcess(mass);

  const hint = !mass.mintEnded
    ? t.excessBeforeEnd
    : mass.withdrawableExcess === 0n
      ? t.excessNone
      : null;

  const run = () => {
    setResult(null);
    withdraw.mutate(mass.token, {
      onSuccess: (redemption) => setResult(redemption),
    });
  };

  return (
    <div className="flex flex-col gap-3" data-ocid={ocid}>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t.excessTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.excessExplain}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={run}
          disabled={!enabled || withdraw.isPending}
          className="min-h-11 sm:min-h-9"
          data-ocid={`${ocid}.withdraw_button`}
        >
          {withdraw.isPending ? t.withdrawingButton : t.withdrawButton}
          {enabled && (
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatTokenQuantity(mass.withdrawableExcess, mass.token, lang)}
              <FiatAmount
                token={mass.token}
                amount={mass.withdrawableExcess}
                className="ml-1.5"
                ocid={`${ocid}.fiat`}
              />
            </span>
          )}
        </Button>
        {hint && (
          <p
            className="text-sm text-muted-foreground"
            data-ocid={`${ocid}.hint`}
          >
            {hint}
          </p>
        )}
      </div>
      {withdraw.isError && (
        <p
          className="callout-danger px-3 py-2 text-sm"
          role="alert"
          data-ocid={`${ocid}.error_state`}
        >
          {guaranteeFailureMessage(withdraw.error, lang)}
        </p>
      )}
      {result && (
        <div className="rounded-lg border border-border p-3">
          <RedemptionOutcome redemption={result} ocid={`${ocid}.result`} />
        </div>
      )}
    </div>
  );
}
