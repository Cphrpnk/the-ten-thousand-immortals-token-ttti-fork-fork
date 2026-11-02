import type { ReactNode } from "react";
import { useMyRedemptions } from "../../hooks/useGuarantee";
import { EXPLORER_TEXT } from "../../i18n/common/explorer";
import { useDict, useLanguage } from "../../i18n/core";
import { toIntlLocale } from "../../i18n/core/lang";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  formatTttiQuantity,
  payoutBlockTarget,
  pullBlockTarget,
  redemptionKindLabel,
  redemptionStatusLabel,
  redemptionsOf,
} from "../../lib/guarantee";
import { PAY_TOKENS, formatPayAmount, timestampToDate } from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { FiatAmount, type FiatToken } from "../FiatAmount";
import { DexAccordion } from "../dex/DexAccordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

/** Redemptions and excess withdrawals of the person, in a closed accordion. */
export function RedemptionHistory() {
  const t = useDict(GUARANTEE_TEXT);
  const tx = useDict(EXPLORER_TEXT);
  const { lang } = useLanguage();
  const query = useMyRedemptions();
  const rows = redemptionsOf(query.data);

  return (
    <DexAccordion
      label={t.historyTitle}
      count={query.data ? String(rows.length) : undefined}
      ocid="guarantee.history"
    >
      {query.isPending ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="guarantee.history.loading_state"
        >
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : query.isError ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="guarantee.history.error_state"
        >
          <span>{t.loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            className="min-h-11 sm:min-h-9"
            data-ocid="guarantee.history.retry_button"
          >
            {t.retryButton}
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="guarantee.history.empty_state"
        >
          {t.historyEmpty}
        </p>
      ) : (
        <ul
          className="flex flex-col divide-y divide-border"
          data-ocid="guarantee.history.list"
        >
          {rows.map((r, i) => {
            const date = timestampToDate(r.createdAt);
            const pull = pullBlockTarget(r);
            const payout = payoutBlockTarget(r);
            const ocid = `guarantee.history.item.${i + 1}`;
            return (
              <li
                key={r.id.toString()}
                className="flex flex-col gap-2 py-3 text-sm"
                data-ocid={ocid}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">
                    {redemptionKindLabel(r.kind, t)} ·{" "}
                    {PAY_TOKENS[r.token].symbol}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      r.status.__kind__ === "completed"
                        ? "border-gold text-primary"
                        : r.status.__kind__ === "failed"
                          ? "border-destructive/50 text-destructive"
                          : ""
                    }
                    data-ocid={`${ocid}.status`}
                  >
                    {redemptionStatusLabel(r, t)}
                  </Badge>
                </div>
                {date && (
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleString(toIntlLocale(lang), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                  {r.tttiAmount > 0n && (
                    <HistoryField
                      label={t.historyReturned}
                      value={formatTttiQuantity(r.tttiAmount, lang)}
                      fiatToken="ttti"
                      fiatAmount={r.tttiAmount}
                      fiatOcid={`${ocid}.returned_fiat`}
                    />
                  )}
                  <HistoryField
                    label={t.historyNet}
                    value={formatPayAmount(r.netAmount, r.token, lang)}
                    fiatToken={r.token}
                    fiatAmount={r.netAmount}
                    fiatOcid={`${ocid}.net_fiat`}
                  />
                  {pull && r.tttiPullBlock !== undefined && (
                    <HistoryField label={t.historyPullBlock}>
                      <ExplorerLink
                        target={pull}
                        label={tx.viewBlockInHistory}
                        data-ocid={`${ocid}.pull_block.link`}
                      >
                        {r.tttiPullBlock.toString()}
                      </ExplorerLink>
                    </HistoryField>
                  )}
                  {payout && r.status.__kind__ === "completed" && (
                    <HistoryField label={t.historyPayoutBlock}>
                      <ExplorerLink
                        target={payout}
                        label={tx.viewOnIcpDashboard}
                        data-ocid={`${ocid}.payout_block.link`}
                      >
                        {r.status.completed.toString()}
                      </ExplorerLink>
                    </HistoryField>
                  )}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </DexAccordion>
  );
}

function HistoryField({
  label,
  value,
  children,
  fiatToken,
  fiatAmount,
  fiatOcid,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  fiatToken?: FiatToken;
  fiatAmount?: bigint;
  fiatOcid?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums">
        {children ?? value}
        {fiatToken !== undefined && (
          <FiatAmount
            token={fiatToken}
            amount={fiatAmount}
            className="ml-1.5"
            ocid={fiatOcid}
          />
        )}
      </dd>
    </div>
  );
}
