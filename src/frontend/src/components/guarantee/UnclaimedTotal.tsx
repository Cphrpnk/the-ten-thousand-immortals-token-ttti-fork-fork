import { RefreshCw } from "lucide-react";
import { useUnclaimedMassTotal } from "../../hooks/useGuarantee";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import { formatTokenQuantity, formatTttiQuantity } from "../../lib/guarantee";
import { PAY_TOKEN_ORDER, formatInteger } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

/** Public total of the unclaimed masses; visible without signing in. */
export function UnclaimedTotal() {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const query = useUnclaimedMassTotal();
  const total = query.data;

  const perToken = [...(total?.perToken ?? [])].sort(
    (a, b) =>
      PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token),
  );

  return (
    <section
      aria-labelledby="guarantee-unclaimed-title"
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 md:p-6"
      data-ocid="guarantee.unclaimed.section"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="guarantee-unclaimed-title"
          className="font-display text-xl tracking-wide md:text-2xl"
        >
          {t.unclaimedTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{t.unclaimedIntro}</p>
      </div>

      {query.isPending ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="guarantee.unclaimed.loading_state"
        >
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-full max-w-sm" />
        </div>
      ) : query.isError || !total ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="guarantee.unclaimed.error_state"
        >
          <span>{t.loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            className="min-h-11 sm:min-h-9"
            data-ocid="guarantee.unclaimed.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.retryButton}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {t.unclaimedTtti}
              </dt>
              <dd
                className="font-mono text-2xl tabular-nums text-primary"
                data-ocid="guarantee.unclaimed.ttti"
              >
                {formatTttiQuantity(total.remainingTtti, lang)}
                <FiatAmount
                  token="ttti"
                  amount={total.remainingTtti}
                  className="ml-1.5"
                  ocid="guarantee.unclaimed.ttti_fiat"
                />
              </dd>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p data-ocid="guarantee.unclaimed.count">
                {t.unclaimedCount(formatInteger(total.massCount, lang))}
              </p>
              <p data-ocid="guarantee.unclaimed.mint_state">
                {total.mintEnded
                  ? t.unclaimedMintEnded
                  : t.unclaimedMintOngoing}
              </p>
            </div>
          </dl>

          {perToken.length > 0 && (
            <ul
              className="flex flex-col divide-y divide-border border-y border-border"
              data-ocid="guarantee.unclaimed.list"
            >
              {perToken.map((entry, i) => (
                <li
                  key={entry.token}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm"
                  data-ocid={`guarantee.unclaimed.item.${i + 1}`}
                >
                  <span className="text-muted-foreground">
                    {t.unclaimedGuarantee}
                  </span>
                  <span className="flex flex-col items-end font-mono tabular-nums">
                    <span>
                      {formatTokenQuantity(
                        entry.remainingGuarantee,
                        entry.token,
                        lang,
                      )}
                      <FiatAmount
                        token={entry.token}
                        amount={entry.remainingGuarantee}
                        className="ml-1.5"
                        ocid={`guarantee.unclaimed.fiat.${i + 1}`}
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTttiQuantity(entry.remainingTtti, lang)}
                      <FiatAmount
                        token="ttti"
                        amount={entry.remainingTtti}
                        className="ml-1.5"
                        ocid={`guarantee.unclaimed.ttti_fiat.${i + 1}`}
                      />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
