import { AlertTriangle, Loader2, RotateCcw, Undo2 } from "lucide-react";
import { useState } from "react";
import {
  type Buyback,
  type BuybackMass,
  BuybackStatus,
  type Conversion,
} from "../../backend";
import { useRetryBuybackPayout } from "../../hooks/useBuyback";
import { toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { WALLET_EXPLORER_TEXT } from "../../i18n/pages/wallet";
import {
  buybackFailureMessage,
  buybackStatusLabel,
  canCancelBuyback,
  cancelBlockTarget,
  formatAmountReturned,
  formatBuybackPercent,
  formatTttiQuantity,
  isBuybackEligible,
  payoutBlockTarget,
  payoutOutcomeLabel,
  pullBlockTarget,
} from "../../lib/buyback";
import { payTokenSymbol } from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { BuybackCancelButton } from "../buyback/BuybackCancelButton";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const OUTLINE_GOLD =
  "rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

const STATUS_CLASS: Record<BuybackStatus, string> = {
  [BuybackStatus.completed]: "border-gold text-primary",
  [BuybackStatus.inProgress]: "border-border text-muted-foreground",
  [BuybackStatus.payoutFailed]: "border-destructive/50 text-destructive",
  [BuybackStatus.cancelled]: "border-border text-muted-foreground",
};

interface PurchaseBuybackStateProps {
  conversion: Conversion;
  /** Legacy buyback recorded for this purchase, when any. */
  buyback: Buyback | undefined;
  /** Mass of the purchase's payment token, when loaded. */
  mass: BuybackMass | undefined;
  /** False while the caller's buybacks and masses are not loaded yet. */
  buybacksReady: boolean;
  /** Whether the caller paid this purchase (only the buyer can request). */
  isBuyer: boolean;
  index: number;
  /** Opens the buyback flow on the purchase's mass. */
  onBuyback?: (purchaseId: bigint) => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * Buyback state of one purchase in the purchase history: its legacy buyback
 * record, or the state of the mass it counts in.
 */
export function PurchaseBuybackState({
  conversion,
  buyback,
  mass,
  buybacksReady,
  isBuyer,
  index,
  onBuyback,
}: PurchaseBuybackStateProps) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();

  if (!buybacksReady) return null;
  if (buyback) {
    return (
      <BuybackRecordState
        buyback={buyback}
        isBuyer={isBuyer}
        index={index}
        ocid="wallet.history.buyback"
      />
    );
  }

  const eligible = isBuybackEligible(conversion);
  const symbol = payTokenSymbol(conversion.payToken);
  const open =
    eligible && !!mass && mass.remainingTtti > 0n && !mass.inProgress;
  const massState = !mass
    ? null
    : mass.inProgress
      ? t.historyMassInProgress
      : mass.remainingTtti > 0n
        ? t.historyMassRemaining(formatTttiQuantity(mass.remainingTtti, lang))
        : t.historyMassDone;
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
      data-ocid={`wallet.history.buyback.panel.${index}`}
    >
      <div className="flex flex-col gap-1">
        <SectionLabel>{t.historyLabel}</SectionLabel>
        <p
          className={`text-sm ${eligible ? "text-foreground" : "text-muted-foreground"}`}
        >
          {eligible ? t.historyInMass(symbol) : t.historyNotEligible}
        </p>
        {eligible && massState && (
          <p
            className="text-sm text-muted-foreground tabular-nums"
            data-ocid={`wallet.history.buyback.mass_state.${index}`}
          >
            {massState}
          </p>
        )}
      </div>
      {open && isBuyer && onBuyback && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`min-h-11 sm:min-h-9 ${OUTLINE_GOLD}`}
          onClick={() => onBuyback(conversion.id)}
          data-ocid={`wallet.history.buyback.open_modal_button.${index}`}
        >
          <Undo2 className="h-4 w-4" />
          {t.walletEntry}
        </Button>
      )}
    </div>
  );
}

/**
 * One recorded buyback (mass or legacy per-purchase) with its figures, block
 * links and, for a failed payout, a retry by buyback id.
 */
export function BuybackRecordState({
  buyback,
  isBuyer,
  index,
  ocid,
  bordered = true,
}: {
  buyback: Buyback;
  isBuyer: boolean;
  index: number;
  /** data-ocid prefix, e.g. "wallet.history.buyback". */
  ocid: string;
  /** Top border separating the record from the purchase above. */
  bordered?: boolean;
}) {
  const t = useDict(BUYBACK_TEXT);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const { lang } = useLanguage();
  const retry = useRetryBuybackPayout();
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const isMass = buyback.purchaseId === undefined;

  const pull = pullBlockTarget(buyback);
  const payout = payoutBlockTarget(buyback);
  const cancelBlock = cancelBlockTarget(buyback);
  const outcome =
    buyback.status === BuybackStatus.payoutFailed
      ? payoutOutcomeLabel(buyback, t)
      : null;
  const symbol = payTokenSymbol(buyback.tokenReturned);
  const date = new Date(Number(buyback.timestamp / 1_000_000n));
  const dateText = Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString(toIntlLocale(lang), {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const onRetry = async () => {
    setError(null);
    try {
      await retry.mutateAsync(buyback.id);
    } catch (failure) {
      setError(buybackFailureMessage(failure, lang));
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 ${bordered ? "border-t border-border pt-4" : ""}`}
      data-ocid={`${ocid}.panel.${index}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>
          {isMass
            ? t.historyMassRecord(
                formatBuybackPercent(buyback.percent, lang),
                payTokenSymbol(buyback.originalToken),
              )
            : t.historyLabel}
        </SectionLabel>
        <Badge
          variant="outline"
          className={`rounded-full font-mono ${STATUS_CLASS[buyback.status]}`}
          data-ocid={`${ocid}.status.${index}`}
        >
          {buybackStatusLabel(buyback.status, t)}
        </Badge>
      </div>
      <p className="text-sm font-semibold text-foreground tabular-nums">
        {t.historyReturned(formatAmountReturned(buyback, lang))}
      </p>
      <p className="text-sm text-muted-foreground tabular-nums">
        {t.historyBoughtBack(formatTttiQuantity(buyback.tttiAmount, lang))}
      </p>
      {dateText && (
        <p className="text-sm text-muted-foreground tabular-nums">
          {t.historyDate(dateText)}
        </p>
      )}
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{t.pullBlockLabel}</dt>
          <dd className="font-mono tabular-nums">
            {pull && buyback.pullBlock !== undefined ? (
              <ExplorerLink
                target={pull}
                label={tx.viewBlockInHistory}
                data-ocid={`${ocid}.pull_link.${index}`}
              >
                {buyback.pullBlock.toString()}
              </ExplorerLink>
            ) : (
              <span className="text-muted-foreground">{t.notRecorded}</span>
            )}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="text-xs text-muted-foreground">
            {t.payoutBlockLabel(symbol)}
          </dt>
          <dd className="font-mono tabular-nums">
            {payout && buyback.payoutBlock !== undefined ? (
              <ExplorerLink
                target={payout}
                label={tx.viewOnIcpDashboard}
                data-ocid={`${ocid}.payout_link.${index}`}
              >
                {buyback.payoutBlock.toString()}
              </ExplorerLink>
            ) : (
              <span className="text-muted-foreground">{t.notRecorded}</span>
            )}
          </dd>
        </div>
        {cancelBlock && buyback.cancelBlock !== undefined && (
          <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-xs text-muted-foreground">
              {t.cancelBlockLabel}
            </dt>
            <dd className="font-mono tabular-nums">
              <ExplorerLink
                target={cancelBlock}
                label={tx.viewBlockInHistory}
                data-ocid={`${ocid}.cancel_link.${index}`}
              >
                {buyback.cancelBlock.toString()}
              </ExplorerLink>
            </dd>
          </div>
        )}
      </dl>
      {outcome && (
        <p
          className="text-sm text-muted-foreground break-words"
          data-ocid={`${ocid}.attempt_outcome.${index}`}
        >
          {outcome}
        </p>
      )}
      {cancelled && buyback.status === BuybackStatus.cancelled && (
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
          data-ocid={`${ocid}.cancel_success.${index}`}
        >
          {t.cancelDone}
        </p>
      )}
      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid={`${ocid}.error_state.${index}`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {buyback.status === BuybackStatus.payoutFailed && isBuyer && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`min-h-11 sm:min-h-9 ${OUTLINE_GOLD}`}
            onClick={() => void onRetry()}
            disabled={retry.isPending}
            data-ocid={`${ocid}.retry_button.${index}`}
          >
            {retry.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {retry.isPending ? t.retrying : t.retryPayout}
          </Button>
          {canCancelBuyback(buyback) && (
            <BuybackCancelButton
              buyback={buyback}
              ocid={`${ocid}.${index}`}
              size="sm"
              className="min-h-11 rounded-lg sm:min-h-9"
              disabled={retry.isPending}
              onCancelled={() => setCancelled(true)}
              onError={setError}
            />
          )}
        </div>
      )}
    </div>
  );
}
