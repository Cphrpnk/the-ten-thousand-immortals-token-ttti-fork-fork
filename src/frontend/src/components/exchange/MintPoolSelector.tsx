import { AlertCircle, Info, Loader2, RefreshCw } from "lucide-react";
import type { MintPoolOption } from "../../backend";
import type { MintPoolSelection } from "../../hooks/useMintPreview";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { formatNumber } from "../../i18n/core/lang";
import { BUY_LIQUIDITY_TEXT, BUY_MINT_POOL_TEXT } from "../../i18n/pages/buy";
import { formatUsdE8 } from "../../lib/token";
import { cn } from "../../lib/utils";
import { formatSignedBps } from "../dex/ConsolidatedPrice";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface MintPoolSelectorProps {
  selection: MintPoolSelection;
  /** Disables the choice while a payment is in progress. */
  disabled?: boolean;
}

/** Fee tier in basis points as a percentage, e.g. 30 → "0.30 %". */
export function formatFeeTier(feeBps: bigint): string {
  return `${formatNumber(Number(feeBps) / 100, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;
}

/** Pool choice of the mint: the backend's pools, the recommended one preselected. */
export function MintPoolSelector({
  selection,
  disabled = false,
}: MintPoolSelectorProps) {
  const t = useDict(BUY_MINT_POOL_TEXT);
  const l = useDict(BUY_LIQUIDITY_TEXT);
  const { lang } = useLanguage();
  const { pools, selectedPoolId } = selection;
  const single = pools.length === 1 ? pools[0] : undefined;

  const priceText = (option: MintPoolOption) =>
    option.price.usdPerTtti === undefined || option.price.reserveTtti === 0n
      ? l.emptyPool
      : `${formatUsdE8(option.price.usdPerTtti, 4, lang)} USD`;

  const recommendedBadge = (
    <Badge
      variant="outline"
      className="rounded-full border-gold bg-primary/10 px-2 py-0 text-xs font-medium text-primary"
      data-ocid="exchange.pool_selector.recommended_badge"
    >
      {t.recommended}
    </Badge>
  );

  return (
    <section
      className="space-y-2 rounded-lg border border-border bg-background/60 px-3 py-3 text-sm"
      aria-labelledby="mint-pool-selector-heading"
      data-ocid="exchange.pool_selector.panel"
    >
      <h2
        id="mint-pool-selector-heading"
        className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {t.heading}
        {selection.isLoading && (
          <Loader2
            className="h-3 w-3 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </h2>

      {selection.isLoading && (
        <div
          className="space-y-2"
          data-ocid="exchange.pool_selector.loading_state"
        >
          <Skeleton className="h-10 w-full" />
          <p className="text-xs text-muted-foreground">{t.loading}</p>
        </div>
      )}

      {selection.isError && (
        <Alert
          variant="destructive"
          data-ocid="exchange.pool_selector.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>{t.loadError}</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg border-gold bg-transparent transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              onClick={selection.retry}
              data-ocid="exchange.pool_selector.retry_button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {selection.noPool && (
        <Alert
          variant="destructive"
          data-ocid="exchange.pool_selector.empty_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t.noPool}</AlertDescription>
        </Alert>
      )}

      {selection.fellBack && (
        <p
          className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
          aria-live="polite"
          data-ocid="exchange.pool_selector.fallback_notice"
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t.fallbackNotice}
        </p>
      )}

      {single && (
        <p
          className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-gold bg-primary/10 px-3 py-2"
          data-ocid="exchange.pool_selector.single_pool"
        >
          <span className="font-medium text-foreground">
            {t.single(formatFeeTier(single.feeBps))}
          </span>
          {single.recommended && recommendedBadge}
        </p>
      )}

      {pools.length > 1 && (
        <fieldset
          className="space-y-2"
          disabled={disabled}
          data-ocid="exchange.pool_selector.list"
        >
          <legend className="sr-only">{t.legend}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {pools.map((option, index) => {
              const id = option.poolId.toString();
              const checked = selectedPoolId === option.poolId;
              return (
                <label
                  key={id}
                  htmlFor={`mint-pool-${id}`}
                  className={cn(
                    "flex min-w-0 cursor-pointer flex-col gap-2 rounded-md border px-3 py-2 transition-smooth focus-within:ring-2 focus-within:ring-ring",
                    checked
                      ? "border-gold bg-primary/10"
                      : "border-border hover:border-gold",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                  data-ocid={`exchange.pool_selector.item.${index + 1}`}
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <input
                      id={`mint-pool-${id}`}
                      type="radio"
                      name="mint-target-pool"
                      checked={checked}
                      onChange={() => selection.choose(option.poolId)}
                      disabled={disabled}
                      className="h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none"
                      data-ocid={`exchange.pool_selector.radio.${index + 1}`}
                    />
                    <span className="font-medium text-foreground">
                      {t.feeTier} {formatFeeTier(option.feeBps)}
                    </span>
                    {option.recommended && recommendedBadge}
                  </span>
                  <dl className="space-y-0.5 text-xs">
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="text-muted-foreground">{t.depth}</dt>
                      <dd className="ml-auto font-mono tabular-nums">
                        {option.depthUsdE8 === undefined
                          ? "—"
                          : `${formatUsdE8(option.depthUsdE8, 2, lang)} USD`}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="text-muted-foreground">{t.price}</dt>
                      <dd className="ml-auto font-mono tabular-nums">
                        {priceText(option)}
                      </dd>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-2">
                      <dt className="text-muted-foreground">{t.gap}</dt>
                      <dd className="ml-auto font-mono tabular-nums">
                        {option.gapBps === undefined
                          ? l.gapUnavailable
                          : formatSignedBps(option.gapBps)}
                      </dd>
                    </div>
                  </dl>
                </label>
              );
            })}
          </div>
          {selectedPoolId === null && (
            <p
              className="text-xs text-muted-foreground"
              data-ocid="exchange.pool_selector.select_prompt"
            >
              {t.selectPrompt}
            </p>
          )}
        </fieldset>
      )}
    </section>
  );
}
