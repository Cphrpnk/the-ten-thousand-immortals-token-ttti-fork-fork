import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RedeemQuote } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  formatTttiQuantity,
  formatUsdValue,
  guaranteeFailureMessage,
} from "../../lib/guarantee";
import {
  PAY_TOKEN_ORDER,
  formatPayAmount,
  payTokenSymbol,
} from "../../lib/token";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

interface RedeemPreviewProps {
  query: UseQueryResult<RedeemQuote, Error>;
  /** True when a valid amount is entered, so a quote is expected. */
  hasAmount: boolean;
  ocid: string;
}

function Row({
  label,
  ocid,
  strong = false,
  children,
}: {
  label: string;
  ocid: string;
  strong?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm",
        strong && "font-medium",
      )}
      data-ocid={ocid}
    >
      <dt className="min-w-0 text-muted-foreground">{label}</dt>
      <dd className="flex flex-col items-end font-mono tabular-nums">
        {children}
      </dd>
    </div>
  );
}

/** Live preview of a redemption, from quoteGuaranteeRedeem. */
export function RedeemPreview({ query, hasAmount, ocid }: RedeemPreviewProps) {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();

  let body: ReactNode;
  if (!hasAmount) {
    body = <p className="text-sm text-muted-foreground">{t.amountInvalid}</p>;
  } else if (query.isPending) {
    body = (
      <div
        className="flex flex-col gap-2"
        aria-label={t.previewLoading}
        data-ocid={`${ocid}.loading_state`}
      >
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  } else if (query.isError) {
    body = (
      <p
        className="callout-danger px-3 py-2 text-sm"
        role="alert"
        data-ocid={`${ocid}.error_state`}
      >
        {guaranteeFailureMessage(query.error, lang)}
      </p>
    );
  } else {
    const quote = query.data;
    const lines = [...quote.payouts].sort(
      (a, b) =>
        PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token),
    );
    body = (
      <>
        <dl className="flex flex-col divide-y divide-border">
          <Row label={t.previewCap} ocid={`${ocid}.row.parity`}>
            <span>{formatUsdValue(quote.parityUsdE8, lang)}</span>
          </Row>
          <Row label={t.previewReserveShare} ocid={`${ocid}.row.proportional`}>
            <span>{formatUsdValue(quote.proportionalUsdE8, lang)}</span>
          </Row>
          {lines.map((line) => (
            <Row
              key={line.token}
              label={t.previewPaidIn(payTokenSymbol(line.token))}
              ocid={`${ocid}.row.${line.token}`}
            >
              <span>{formatPayAmount(line.amount, line.token, lang)}</span>
              <span className="text-xs text-muted-foreground">
                ≈ {formatUsdValue(line.valueUsdE8, lang)}
              </span>
            </Row>
          ))}
          <Row label={t.previewCirculation} ocid={`${ocid}.row.circulation`}>
            <span>{formatTttiQuantity(quote.circulationOutside, lang)}</span>
          </Row>
          <Row label={t.previewNet} ocid={`${ocid}.row.net`} strong>
            <span className="text-primary">
              {formatUsdValue(quote.payoutUsdE8, lang)}
            </span>
          </Row>
        </dl>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          <li>{t.previewLedgerFeeNote}</li>
          <li>{t.previewUsdNote}</li>
          <li>{t.returnedTttiNote}</li>
        </ul>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-ocid={ocid} aria-live="polite">
      <h4 className="text-sm font-medium">{t.previewTitle}</h4>
      {body}
    </div>
  );
}
