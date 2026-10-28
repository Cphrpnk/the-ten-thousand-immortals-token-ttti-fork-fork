import { ChevronDown } from "lucide-react";
import type { PayToken } from "../../backend";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict } from "../../i18n/core/dict";
import {
  MINT_OWNER_UNITS,
  MINT_PAID_UNITS,
  formatPayAmount,
} from "../../lib/token";

interface MintPaymentBreakdownProps {
  token: PayToken;
  /** Amount paid for the mint (ledger fees excluded), 0 without an amount. */
  payAmount: bigint;
}

/** Discreet, collapsible split of the payment: 100/101 owner, 1/101 mint fee. */
export function MintPaymentBreakdown({
  token,
  payAmount,
}: MintPaymentBreakdownProps) {
  const t = useDict(MINT_REVENUE_TEXT);
  const ownerAmount = (payAmount * MINT_OWNER_UNITS) / MINT_PAID_UNITS;
  const feeAmount = payAmount - ownerAmount;

  return (
    <details
      className="group px-1 text-xs text-muted-foreground"
      data-ocid="exchange.payment_breakdown.panel"
    >
      <summary
        className="flex cursor-pointer list-none items-center gap-1 rounded-sm py-1 transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
        data-ocid="exchange.payment_breakdown.toggle"
      >
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
        {t.mintFeeToggle}
      </summary>
      <div className="mt-1 space-y-1 border-l border-border pl-3 leading-relaxed">
        <p>{t.priceRule}</p>
        {payAmount > 0n && (
          <dl
            className="space-y-0.5 font-mono tabular-nums text-foreground"
            data-ocid="exchange.payment_breakdown.amounts"
          >
            <dt className="sr-only">{t.feeHeading}</dt>
            <dd data-ocid="exchange.payment_breakdown.owner">
              {t.ownerAmount(formatPayAmount(ownerAmount, token))}
            </dd>
            <dd data-ocid="exchange.payment_breakdown.fee">
              {t.feeAmount(formatPayAmount(feeAmount, token))}
            </dd>
          </dl>
        )}
        <p>{t.ownerShare}</p>
        <p>{t.feeShare}</p>
        <p>{t.halfLp}</p>
        <p>{t.halfPermanent}</p>
        <p>{t.noTttiCreated}</p>
      </div>
    </details>
  );
}
