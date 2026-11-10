import type { Principal } from "@icp-sdk/core/principal";
import type { RedeemQuote, Redemption } from "../../backend";
import { EXPLORER_TEXT } from "../../i18n/common/explorer";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  GuaranteeFailure,
  allowanceCovers,
  formatTttiQuantity,
  formatUsdValue,
  guaranteeFailureMessage,
  payoutBlockTarget,
  pullBlockTarget,
  redemptionStatusLabel,
} from "../../lib/guarantee";
import { formatPayAmount, payTokenSymbol } from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { FiatAmount } from "../FiatAmount";
import { WalletTermsOpenButton, useWalletTerms } from "../acceptance";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useGuaranteeRedeem } from "./useGuaranteeRedeem";

interface RedeemConfirmDialogProps {
  owner: Principal | undefined;
  quote: RedeemQuote;
  /** Active TTTI-T allowance for the contract, in base units. */
  allowance: bigint | undefined;
  /** Called when the dialog closes; `done` is true after a recorded redemption. */
  onClose: (done: boolean) => void;
}

/** Outcome line of one recorded redemption (one per reserve token paid). */
function RedemptionOutcomeLine({
  redemption,
  ocid,
}: { redemption: Redemption; ocid: string }) {
  const t = useDict(GUARANTEE_TEXT);
  const tx = useDict(EXPLORER_TEXT);
  const { lang } = useLanguage();
  const pull = pullBlockTarget(redemption);
  const payout = payoutBlockTarget(redemption);
  const status = redemption.status;
  const message =
    status.__kind__ === "completed"
      ? t.resultCompleted(
          formatPayAmount(redemption.netAmount, redemption.token, lang),
        )
      : status.__kind__ === "inProgress"
        ? t.resultInProgress
        : status.__kind__ === "needsReview"
          ? t.resultNeedsReview
          : `${t.resultFailed} ${status.failed}`;
  return (
    <div className="flex flex-col gap-3 text-sm" data-ocid={ocid}>
      <p className="font-medium" data-ocid={`${ocid}.status`}>
        {payTokenSymbol(redemption.token)} ·{" "}
        {redemptionStatusLabel(redemption, t)}
      </p>
      <p>{message}</p>
      <dl className="flex flex-col gap-1 text-muted-foreground">
        {pull && redemption.tttiPullBlock !== undefined && (
          <div className="flex flex-wrap justify-between gap-2">
            <dt>{t.historyPullBlock}</dt>
            <dd>
              <ExplorerLink
                target={pull}
                label={tx.viewBlockInHistory}
                data-ocid={`${ocid}.pull_block.link`}
              >
                {redemption.tttiPullBlock.toString()}
              </ExplorerLink>
            </dd>
          </div>
        )}
        {payout && redemption.status.__kind__ === "completed" && (
          <div className="flex flex-wrap justify-between gap-2">
            <dt>{t.historyPayoutBlock}</dt>
            <dd>
              <ExplorerLink
                target={payout}
                label={tx.viewOnIcpDashboard}
                data-ocid={`${ocid}.payout_block.link`}
              >
                {redemption.status.completed.toString()}
              </ExplorerLink>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/** Outcome of a redemption: one block per reserve token paid. */
export function RedemptionOutcome({
  redemptions,
  ocid,
}: { redemptions: ReadonlyArray<Redemption>; ocid: string }) {
  return (
    <div className="flex flex-col gap-4" data-ocid={ocid}>
      {redemptions.map((redemption) => (
        <RedemptionOutcomeLine
          key={redemption.id.toString()}
          redemption={redemption}
          ocid={`${ocid}.${redemption.token}`}
        />
      ))}
    </div>
  );
}

/** Explains what is signed, requests the allowance if needed, then redeems. */
export function RedeemConfirmDialog({
  owner,
  quote,
  allowance,
  onClose,
}: RedeemConfirmDialogProps) {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const flow = useGuaranteeRedeem(owner);
  const busy = flow.phase !== "idle";
  const covered = allowanceCovers(allowance, quote);
  // Wallet terms are accepted once, through the shared status that also drives
  // the banner; the backend answers #acknowledgementRequired when they are
  // missing.
  const { status: terms } = useWalletTerms();
  const ackRefused =
    flow.error instanceof GuaranteeFailure &&
    flow.error.error.__kind__ === "acknowledgementRequired";
  const ackMissing = !terms.accepted && (terms.needsAcceptance || ackRefused);
  const ackReady = terms.accepted;
  const ackChecking = terms.signedIn && !terms.known && !terms.isError;
  // Once the terms are accepted, a refusal for missing acceptance is stale.
  const shownError = ackRefused && terms.accepted ? null : flow.error;

  const close = () => {
    if (!busy) onClose(flow.result !== null);
  };

  const label =
    flow.phase === "approving"
      ? t.approvingButton
      : flow.phase === "redeeming"
        ? t.redeemingButton
        : t.redeemButton;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
        data-ocid="guarantee.confirm.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide">
            {flow.result ? t.resultTitle : t.confirmTitle}
          </DialogTitle>
          <DialogDescription>
            {flow.result ? "" : t.confirmIntro}
          </DialogDescription>
        </DialogHeader>

        {flow.result ? (
          <RedemptionOutcome
            redemptions={flow.result}
            ocid="guarantee.confirm.result"
          />
        ) : (
          <div className="flex flex-col gap-4 text-sm">
            <div className="callout-warning flex flex-col gap-2 px-3 py-3">
              <p className="font-medium">{t.allowanceTitle}</p>
              <p>
                {t.allowanceExplain(
                  formatTttiQuantity(quote.tttiAmount, lang),
                  formatTttiQuantity(quote.tttiTransferFee, lang),
                  formatTttiQuantity(quote.tttiAllowanceRequired, lang),
                )}
              </p>
              <p>{t.confirmExpiry}</p>
              <p className="text-muted-foreground">{t.allowanceExpiryNote}</p>
            </div>
            <div
              className="flex flex-col gap-1"
              data-ocid="guarantee.confirm.allowance"
            >
              <p className="text-muted-foreground">
                {t.allowanceCurrent(formatTttiQuantity(allowance ?? 0n, lang))}
              </p>
              <p>{covered ? t.allowanceOk : t.allowanceMissing}</p>
            </div>
            <dl className="flex flex-col divide-y divide-border border-y border-border">
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{t.amountLabel}</dt>
                <dd className="font-mono tabular-nums">
                  {formatTttiQuantity(quote.tttiAmount, lang)}
                  <FiatAmount
                    token="ttti"
                    amount={quote.tttiAmount}
                    className="ml-1.5"
                    ocid="guarantee.confirm.amount_fiat"
                  />
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">{t.previewCap}</dt>
                <dd className="font-mono tabular-nums">
                  {formatUsdValue(quote.parityUsdE8, lang)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-muted-foreground">
                  {t.previewReserveShare}
                </dt>
                <dd className="font-mono tabular-nums">
                  {formatUsdValue(quote.proportionalUsdE8, lang)}
                </dd>
              </div>
              {quote.payouts.map((line) => (
                <div
                  key={line.token}
                  className="flex justify-between gap-3 py-2"
                >
                  <dt className="text-muted-foreground">
                    {t.previewPaidIn(payTokenSymbol(line.token))}
                  </dt>
                  <dd className="font-mono tabular-nums">
                    {formatPayAmount(line.amount, line.token, lang)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 py-2 font-medium">
                <dt className="text-muted-foreground">{t.previewNet}</dt>
                <dd
                  className="font-mono tabular-nums text-primary"
                  data-ocid="guarantee.confirm.payout"
                >
                  {formatUsdValue(quote.payoutUsdE8, lang)}
                </dd>
              </div>
            </dl>
            {ackChecking && (
              <p
                className="text-muted-foreground"
                data-ocid="guarantee.confirm.acknowledgement_loading_state"
              >
                {t.acceptanceChecking}
              </p>
            )}
            {ackMissing && (
              <div
                className="callout-warning flex flex-col items-start gap-2 px-3 py-3"
                role="alert"
                data-ocid="guarantee.confirm.acknowledgement_required"
              >
                <p>{t.acceptanceMissing}</p>
                <WalletTermsOpenButton ocid="guarantee.confirm.acknowledgement_link" />
              </div>
            )}
            {shownError !== null && (
              <div
                className="callout-danger flex flex-col items-start gap-2 px-3 py-2"
                role="alert"
                data-ocid="guarantee.confirm.error_state"
              >
                <p>{guaranteeFailureMessage(shownError, lang)}</p>
                {ackRefused && !terms.needsAcceptance && (
                  <WalletTermsOpenButton ocid="guarantee.confirm.error_acknowledgement_button" />
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {flow.result ? (
            <Button
              type="button"
              onClick={close}
              className="min-h-11 sm:min-h-9"
              data-ocid="guarantee.confirm.close_button"
            >
              {t.closeButton}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={close}
                disabled={busy}
                className="min-h-11 sm:min-h-9"
                data-ocid="guarantee.confirm.cancel_button"
              >
                {t.cancelButton}
              </Button>
              <Button
                type="button"
                onClick={() => void flow.confirm(quote, allowance)}
                disabled={busy || !flow.ready || !ackReady}
                className="min-h-11 sm:min-h-9"
                data-ocid="guarantee.confirm.confirm_button"
              >
                {label}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
