import type { ReactNode } from "react";
import { type BuybackQuote, BuybackRule } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { toIntlLocale } from "../../i18n/core/lang";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import {
  buybackDayRateQuantity,
  buybackFeeLabel,
  buybackPriceLabel,
  formatMassRatio,
  formatTttiQuantity,
  payToUsdE8,
} from "../../lib/buyback";
import {
  TTTI_DIVISOR,
  formatPayAmount,
  formatUsdE8,
  payTokenSymbol,
  tttiToUsdE8,
} from "../../lib/token";

interface Row {
  key: string;
  label: string;
  value: string;
  usd?: string;
}

const DL_CLASS =
  "grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-muted/50 p-3 text-sm";

function Rows({
  rows,
  ocid,
  children,
}: {
  rows: Array<Row>;
  ocid: string;
  children?: ReactNode;
}) {
  return (
    <dl className={DL_CLASS} data-ocid={ocid}>
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd
            className="text-right font-mono tabular-nums break-words"
            data-ocid={`${ocid}.${row.key}`}
          >
            {row.value}
            {row.usd && (
              <span className="block text-xs text-muted-foreground">
                ≈ {row.usd}
              </span>
            )}
          </dd>
        </div>
      ))}
      {children}
    </dl>
  );
}

/**
 * Step-by-step lower-of-two calculation of a buyback quote, with USD
 * equivalents at the quote's own rates. Quote screen only.
 */
export function BuybackBreakdown({ quote }: { quote: BuybackQuote }) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const paid = quote.originalToken;
  const paidRate = quote.originalRateUsdE8;
  const usd = (usdE8: bigint) => formatUsdE8(usdE8, 2, lang);
  const paidUsd = (amount: bigint) => usd(payToUsdE8(amount, paid, paidRate));
  const pay = (amount: bigint) => formatPayAmount(amount, paid, lang);
  const ttti = (amount: bigint) => formatTttiQuantity(amount, lang);
  const one = new Intl.NumberFormat(toIntlLocale(lang)).format(1);
  const rateText = `${one} ${payTokenSymbol(paid)} = ${formatUsdE8(paidRate, 4, lang)}`;

  const priorNet = quote.massTotalNet - quote.massRemainingNet;
  const priorTtti = quote.massTotalTtti - quote.massRemainingTtti;
  const perTtti =
    quote.massRemainingTtti > 0n
      ? (quote.massRemainingNet * TTTI_DIVISOR) / quote.massRemainingTtti
      : 0n;
  const a = quote.originalNetAmount;
  const b = buybackDayRateQuantity(paid, quote.tttiAmount, paidRate);

  const before: Array<Row> = [
    {
      key: "mass",
      label: t.bdMassLabel(payTokenSymbol(paid)),
      value: `${pay(quote.massTotalNet)} / ${ttti(quote.massTotalTtti)}`,
      usd: paidUsd(quote.massTotalNet),
    },
    {
      key: "prior",
      label: t.bdPriorLabel,
      value: `−${pay(priorNet)} / −${ttti(priorTtti)}`,
      usd: paidUsd(priorNet),
    },
    {
      key: "ratio",
      label: t.bdRatioLabel,
      value:
        formatMassRatio(
          paid,
          quote.massRemainingNet,
          quote.massRemainingTtti,
          lang,
        ) ?? t.notRecorded,
      usd: paidUsd(perTtti),
    },
    {
      key: "ttti",
      label: t.bdTttiLabel(buybackPriceLabel(lang)),
      value: ttti(quote.tttiAmount),
      usd: usd(tttiToUsdE8(quote.tttiAmount)),
    },
    { key: "rate_paid", label: t.bdRateLabel, value: rateText },
    { key: "a", label: t.bdALabel, value: pay(a), usd: paidUsd(a) },
    { key: "b", label: t.bdBLabel, value: pay(b), usd: paidUsd(b) },
  ];

  const after: Array<Row> = [
    {
      key: "fee",
      label: t.feeLabel(buybackFeeLabel(lang)),
      value: `−${pay(quote.buybackFee)}`,
      usd: paidUsd(quote.buybackFee),
    },
    {
      key: "third_party",
      label: t.bdReturnedFeeLabel(payTokenSymbol(paid)),
      value: `−${pay(quote.thirdPartyFees)}`,
      usd: paidUsd(quote.thirdPartyFees),
    },
    {
      key: "ttti_fee",
      label: t.bdTttiFeeLabel,
      value: ttti(quote.tttiTransferFee),
      usd: usd(tttiToUsdE8(quote.tttiTransferFee)),
    },
    {
      key: "ttti_escrow_fee",
      label: t.bdTttiEscrowFeeLabel,
      value: ttti(quote.tttiEscrowFee),
      usd: usd(tttiToUsdE8(quote.tttiEscrowFee)),
    },
  ];

  const usesA = quote.rule === BuybackRule.originalNet;

  return (
    <section className="flex flex-col gap-2" data-ocid="buyback.breakdown">
      <h4 className="font-display text-sm font-medium">{t.breakdownTitle}</h4>
      <Rows rows={before} ocid="buyback.breakdown.inputs" />
      <p
        className="callout-info px-3 py-2 text-sm"
        data-ocid="buyback.breakdown.rule"
      >
        {usesA ? t.bdUsesA(pay(a), pay(b)) : t.bdUsesB(pay(a), pay(b))}
      </p>
      <Rows rows={after} ocid="buyback.breakdown.result">
        <dt className="border-t border-border pt-2 font-medium">
          {t.amountReturnedLabel}
        </dt>
        <dd
          className="border-t border-border pt-2 text-right font-mono font-semibold tabular-nums text-primary break-words"
          data-ocid="buyback.breakdown.amount_returned"
        >
          {pay(quote.amountReturned)}
          <span className="block text-xs font-normal text-muted-foreground">
            ≈ {paidUsd(quote.amountReturned)}
          </span>
        </dd>
      </Rows>
    </section>
  );
}
