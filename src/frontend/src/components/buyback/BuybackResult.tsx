import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { type Buyback, BuybackStatus } from "../../backend";
import { useRetryBuybackPayout } from "../../hooks/useBuyback";
import { EXPLORER_TEXT } from "../../i18n/common/explorer";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import {
  buybackFailureMessage,
  buybackStatusLabel,
  canCancelBuyback,
  cancelBlockTarget,
  payoutBlockTarget,
  payoutOutcomeLabel,
  pullBlockTarget,
} from "../../lib/buyback";
import { payTokenSymbol } from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Button } from "../ui/button";
import { BuybackCancelButton } from "./BuybackCancelButton";
import { BuybackDetails } from "./BuybackDetails";

/**
 * Recorded buyback with explorer links; a failed payout offers a retry and,
 * when every attempt was refused, a cancellation.
 */
export function BuybackResult({
  buyback,
  onNew,
}: {
  buyback: Buyback;
  onNew?: () => void;
}) {
  const t = useDict(BUYBACK_TEXT);
  const e = useDict(EXPLORER_TEXT);
  const { lang } = useLanguage();
  const retry = useRetryBuybackPayout();
  const [current, setCurrent] = useState(buyback);
  const [error, setError] = useState<string | null>(null);
  const pull = pullBlockTarget(current);
  const payout = payoutBlockTarget(current);
  const cancelBlock = cancelBlockTarget(current);
  const outcome =
    current.status === BuybackStatus.payoutFailed
      ? payoutOutcomeLabel(current, t)
      : null;
  const symbol = payTokenSymbol(current.tokenReturned);

  const onRetry = async () => {
    setError(null);
    try {
      setCurrent(await retry.mutateAsync(current.id));
    } catch (failure) {
      setError(buybackFailureMessage(failure, lang));
    }
  };

  const headline =
    current.status === BuybackStatus.completed
      ? t.resultCompleted
      : current.status === BuybackStatus.inProgress
        ? t.resultInProgress
        : current.status === BuybackStatus.cancelled
          ? t.resultCancelled
          : current.legacy
            ? t.resultPayoutFailed
            : t.resultEscrowPayoutFailed;
  const ok =
    current.status === BuybackStatus.completed ||
    current.status === BuybackStatus.cancelled;

  return (
    <section className="flex flex-col gap-3" data-ocid="buyback.result.panel">
      <p
        className={
          ok
            ? "flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
            : "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        }
        aria-live="polite"
        data-ocid={
          ok ? "buyback.result.success_state" : "buyback.result.error_state"
        }
      >
        {ok ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>
          {headline}
          <span className="sr-only">
            {" "}
            {buybackStatusLabel(current.status, t)}
          </span>
        </span>
      </p>
      {current.message && (
        <p className="text-xs text-muted-foreground break-words">
          {t.resultMessage(current.message)}
        </p>
      )}
      {outcome && (
        <p
          className="text-xs text-muted-foreground break-words"
          data-ocid="buyback.result.attempt_outcome"
        >
          {outcome}
        </p>
      )}

      <BuybackDetails figures={current} ocid="buyback.result" />

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-muted-foreground">{t.pullBlockLabel}</dt>
        <dd className="text-right">
          {pull && current.pullBlock !== undefined ? (
            <ExplorerLink
              target={pull}
              label={e.viewBlockInHistory}
              data-ocid="buyback.result.pull_link"
            >
              {current.pullBlock.toString()}
            </ExplorerLink>
          ) : (
            <span className="text-muted-foreground">{t.notRecorded}</span>
          )}
        </dd>
        <dt className="text-muted-foreground">{t.payoutBlockLabel(symbol)}</dt>
        <dd className="text-right">
          {payout && current.payoutBlock !== undefined ? (
            <ExplorerLink
              target={payout}
              label={e.viewOnIcpDashboard}
              data-ocid="buyback.result.payout_link"
            >
              {current.payoutBlock.toString()}
            </ExplorerLink>
          ) : (
            <span className="text-muted-foreground">{t.notRecorded}</span>
          )}
        </dd>
        {cancelBlock && current.cancelBlock !== undefined && (
          <>
            <dt className="text-muted-foreground">{t.cancelBlockLabel}</dt>
            <dd className="text-right">
              <ExplorerLink
                target={cancelBlock}
                label={e.viewBlockInHistory}
                data-ocid="buyback.result.cancel_link"
              >
                {current.cancelBlock.toString()}
              </ExplorerLink>
            </dd>
          </>
        )}
      </dl>

      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid="buyback.result.retry_error"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {current.status === BuybackStatus.payoutFailed && (
          <Button
            type="button"
            onClick={() => void onRetry()}
            disabled={retry.isPending}
            className="rounded-lg shadow-gold"
            data-ocid="buyback.result.retry_button"
          >
            {retry.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.retrying}
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                {t.retryPayout}
              </>
            )}
          </Button>
        )}
        {canCancelBuyback(current) && (
          <BuybackCancelButton
            buyback={current}
            ocid="buyback.result"
            className="rounded-lg"
            disabled={retry.isPending}
            onCancelled={setCurrent}
            onError={setError}
          />
        )}
        {onNew && (
          <Button
            type="button"
            variant="outline"
            onClick={onNew}
            disabled={retry.isPending}
            className="rounded-lg"
            data-ocid="buyback.result.new_button"
          >
            {t.newBuyback}
          </Button>
        )}
      </div>
    </section>
  );
}
