import { BtcRefundPurpose, PayToken } from "../../backend";
import type { DepositEntry } from "../../backend";
import { useDict } from "../../i18n/core/dict";
import { BUY_BTC_TEXT, BUY_EXPLORER_TEXT } from "../../i18n/pages/buy";
import { icpDashboardTxUrl } from "../../lib/explorer";
import { ExplorerLink } from "../ExplorerLink";

/** Cause recorded for an entry, when it has one. */
export function refundCause(entry: DepositEntry): string | undefined {
  const cause = entry.conversionCause ?? entry.errorMessage;
  return cause && cause.trim() !== "" ? cause : undefined;
}

/**
 * Automatic ckBTC refund of one deposit: what was returned, the cause and the
 * ledger transaction link once the transfer succeeded.
 */
export function RefundDetails({
  entry,
  ocid,
}: {
  entry: DepositEntry;
  ocid: string;
}) {
  const t = useDict(BUY_BTC_TEXT);
  const tx = useDict(BUY_EXPLORER_TEXT);
  const refund = entry.btcRefund;
  const cause = refundCause(entry);
  if (!refund && cause === undefined) return null;

  const outcome = refund?.attempt.outcome;
  const block = outcome?.__kind__ === "succeeded" ? outcome.succeeded : null;
  const url = block === null ? null : icpDashboardTxUrl(PayToken.ckbtc, block);
  const purposeText =
    refund?.purpose === BtcRefundPurpose.fullRefund
      ? t.refundPurposeFull
      : refund?.purpose === BtcRefundPurpose.excess
        ? t.refundPurposeExcess
        : refund?.purpose === BtcRefundPurpose.deliveryFailedExcess
          ? t.refundPurposeDeliveryFailed
          : null;

  return (
    <div
      className="flex flex-col gap-1 text-xs text-muted-foreground"
      data-ocid={ocid}
    >
      {purposeText !== null && <p>{purposeText}</p>}
      {cause !== undefined && (
        <p className="min-w-0 break-words">{t.refundCause(cause)}</p>
      )}
      {block !== null && url !== null ? (
        <p className="flex flex-wrap items-baseline gap-2">
          <span>{t.refundTxLabel}</span>
          <ExplorerLink
            target={url}
            label={tx.viewOnIcpDashboard}
            className="text-xs"
            data-ocid={`${ocid}.tx_link`}
          >
            {block.toString()}
          </ExplorerLink>
        </p>
      ) : refund && outcome?.__kind__ === "failed" ? (
        <p>{t.refundRetrying}</p>
      ) : refund ? (
        <p>{t.refundSending}</p>
      ) : null}
    </div>
  );
}
