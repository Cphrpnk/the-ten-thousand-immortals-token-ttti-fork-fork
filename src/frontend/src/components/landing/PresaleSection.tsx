import { RefreshCw } from "lucide-react";
import { useGetSaleStatus } from "../../hooks/useQueries";
import { useDict } from "../../i18n/core";
import { CAP_TEXT, PRESALE_TEXT } from "../../i18n/pages/landing";
import {
  TOKEN_PRICE_USD,
  TTTI_SYMBOL,
  formatDecimal,
  formatInteger,
  formatTtti,
  useCyclesFeeText,
  usePriceText,
} from "../../lib/token";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";

export function PresaleSection() {
  const { data: status, isLoading, isError, refetch } = useGetSaleStatus();
  const t = useDict(PRESALE_TEXT);
  const cap = useDict(CAP_TEXT);
  const priceText = usePriceText();
  const cyclesFeeText = useCyclesFeeText();
  const percent =
    status && status.maxSupply > 0n
      ? Number((status.totalSupply * 10_000n) / status.maxSupply) / 100
      : 0;

  return (
    <section
      aria-labelledby="test-offering-title"
      className="bg-card/40 section-breathing"
      data-ocid="landing.snapshot.section"
    >
      <div className="container mx-auto px-4">
        <div className="rounded-lg border border-border bg-card px-6 py-8 md:px-10 md:py-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-muted-foreground">
              {t.label}
            </p>
            <h2
              id="test-offering-title"
              className="mt-3 font-display text-3xl text-foreground md:text-4xl"
            >
              TTTI-T
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t.intro}
            </p>
            <p
              className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base"
              data-ocid="landing.snapshot.cap_note"
            >
              {cap.tttiT}
            </p>
          </div>

          {isLoading ? (
            <div
              className="mt-9 grid gap-6 border-t border-border pt-7 sm:grid-cols-3"
              data-ocid="landing.snapshot.loading_state"
            >
              {(["price", "sold", "remaining"] as const).map((id) => (
                <Skeleton key={id} className="h-16 w-full" />
              ))}
            </div>
          ) : isError || !status ? (
            <div
              className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7"
              data-ocid="landing.snapshot.error_state"
            >
              <p className="text-sm text-muted-foreground">{t.errorText}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="landing.snapshot.retry_button"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.retry}
              </Button>
            </div>
          ) : (
            <div
              className="mt-9 border-t border-border pt-7"
              data-ocid="landing.snapshot.panel"
            >
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {status.complete
                  ? t.statusComplete
                  : status.salesPaused
                    ? t.statusPaused
                    : t.statusCurrent}
              </p>
              <dl className="grid gap-8 sm:grid-cols-3">
                <div data-ocid="landing.snapshot.price_card">
                  <dt className="text-xs text-muted-foreground">
                    {t.pricePerToken}
                  </dt>
                  <dd className="mt-2 font-display text-2xl tabular-nums text-foreground">
                    {formatInteger(TOKEN_PRICE_USD)}{" "}
                    <span className="font-body text-xs">USD</span>
                  </dd>
                </div>
                <div data-ocid="landing.snapshot.sold_card">
                  <dt className="text-xs text-muted-foreground">
                    {t.totalSupply}
                  </dt>
                  <dd className="mt-2 font-display text-2xl tabular-nums text-foreground">
                    {formatTtti(status.totalSupply)}{" "}
                    <span className="font-body text-xs">{TTTI_SYMBOL}</span>
                  </dd>
                </div>
                <div data-ocid="landing.snapshot.remaining_card">
                  <dt className="text-xs text-muted-foreground">
                    {t.remaining}
                  </dt>
                  <dd className="mt-2 font-display text-2xl tabular-nums text-foreground">
                    {formatTtti(status.mintableRemaining)}{" "}
                    <span className="font-body text-xs">{TTTI_SYMBOL}</span>
                  </dd>
                </div>
              </dl>
              <p
                className="mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground"
                data-ocid="landing.snapshot.fee_note"
              >
                {priceText} {cyclesFeeText}
              </p>
              <div className="mt-8 max-w-xl">
                <Progress
                  value={Math.min(percent, 100)}
                  aria-label={t.progressAria(formatDecimal(percent, 2, 2))}
                  className="h-1 bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
                  data-ocid="landing.snapshot.progress"
                />
                <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                  {t.totalSupplyLine(
                    formatTtti(status.totalSupply),
                    formatTtti(status.maxSupply),
                    TTTI_SYMBOL,
                    formatDecimal(percent, 2, 2),
                  )}
                </p>
              </div>
            </div>
          )}

          <div
            className="mt-9 max-w-3xl border-t border-border pt-7"
            data-ocid="landing.snapshot.disclosures.panel"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t.disclosuresTitle}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t.disclosure1}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.disclosure2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
