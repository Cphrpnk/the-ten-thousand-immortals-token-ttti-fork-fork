import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RedeemQuote } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  formatFeePercent,
  guaranteeFailureMessage,
  previewLabel,
  previewRows,
  ruleLabel,
} from "../../lib/guarantee";
import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

interface RedeemPreviewProps {
  query: UseQueryResult<RedeemQuote, Error>;
  /** True when a valid amount is entered, so a quote is expected. */
  hasAmount: boolean;
  ocid: string;
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
    body = (
      <>
        <dl className="flex flex-col divide-y divide-border">
          {previewRows(quote, lang).map((row) => (
            <div
              key={row.key}
              className={cn(
                "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm",
                row.key === "net" && "font-medium",
              )}
              data-ocid={`${ocid}.row.${row.key}`}
            >
              <dt className="min-w-0 text-muted-foreground">
                {previewLabel(row.key, t)}
              </dt>
              <dd className="flex flex-col items-end font-mono tabular-nums">
                <span
                  className={row.key === "net" ? "text-primary" : undefined}
                >
                  {row.amount}
                </span>
                {row.usd !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ≈ {row.usd}
                  </span>
                )}
              </dd>
            </div>
          ))}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 py-2 text-sm">
            <dt className="text-muted-foreground">{t.previewRule}</dt>
            <dd data-ocid={`${ocid}.rule`}>{ruleLabel(quote.rule, t)}</dd>
          </div>
        </dl>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          <li>{t.previewFeeNote(formatFeePercent(lang))}</li>
          {quote.rateUsdE8 !== undefined && <li>{t.previewUsdNote}</li>}
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
