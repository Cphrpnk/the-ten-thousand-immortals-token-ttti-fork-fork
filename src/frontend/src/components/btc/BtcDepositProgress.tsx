import { AlertTriangle, Check, Clock, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { DepositErrorKind, DepositKind, PayToken } from "../../backend";
import type {
  DepositEntry,
  DepositStage,
  DepositTracking,
} from "../../backend";
import {
  type DepositView,
  depositCkbtcMintBlock,
  depositTxids,
  isDepositEntryTerminal,
  latestDeposit,
  useBtcDepositInfo,
} from "../../hooks/useQueries";
import { type Lang, toIntlLocale } from "../../i18n/core";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_BTC_TEXT, BUY_EXPLORER_TEXT } from "../../i18n/pages/buy";
import {
  icpDashboardTxUrl,
  mempoolTxUrl,
  tttiBlockTarget,
} from "../../lib/explorer";
import {
  BTC_DEFAULT_DEPOSIT_MIN_SATS,
  BTC_DEFAULT_MIN_CONFIRMATIONS,
  formatInteger,
  formatSats,
  formatTtti,
  timestampToDate,
} from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Button } from "../ui/button";

type StepState = "done" | "current" | "failed" | "pending";
type BtcText = (typeof BUY_BTC_TEXT)["en"];
type ExplorerText = (typeof BUY_EXPLORER_TEXT)["en"];

interface BtcDepositProgressProps {
  /** Persisted tracking from getMyBtcDeposits or a get/check call. */
  tracking: DepositTracking;
  onCheck: () => void;
  checking: boolean;
  /** Display state from useDepositView (deposit in progress, summary, waiting). */
  view: DepositView;
  ocidPrefix?: string;
  /**
   * TTTI-T ledger mint block of the newest delivered purchase deposit
   * (Conversion.mintBlock), shown as a /history link once known.
   */
  tttiMintBlock?: bigint;
}

/** Amounts of one deposit; all zero before the first deposit. */
type Amounts = Pick<
  DepositEntry,
  | "btcDetectedSats"
  | "ckbtcMintedSats"
  | "ckbtcPendingSats"
  | "tttiDelivered"
  | "refundedSats"
>;

const NO_AMOUNTS: Amounts = {
  btcDetectedSats: 0n,
  ckbtcMintedSats: 0n,
  ckbtcPendingSats: 0n,
  tttiDelivered: 0n,
  refundedSats: 0n,
};

/** Index of the step where a deposit stands (0..4), and whether it is complete. */
function position(
  kind: DepositKind,
  stage: DepositStage,
  amounts: Amounts,
): { index: number; complete: boolean } {
  switch (stage.__kind__) {
    case "addressShown":
      return { index: 1, complete: false };
    case "depositDetected":
    case "confirming":
      return { index: 2, complete: false };
    case "minted":
      return kind === DepositKind.wallet
        ? { index: 5, complete: true }
        : { index: 4, complete: false };
    case "pendingRate":
      return { index: 4, complete: false };
    case "delivered":
    case "refunded":
      return { index: 5, complete: true };
    case "error":
      if (amounts.ckbtcMintedSats > 0n) return { index: 4, complete: false };
      if (amounts.btcDetectedSats > 0n) return { index: 2, complete: false };
      return { index: 1, complete: false };
  }
}

function errorText(
  errorKind: DepositErrorKind | undefined,
  errorMessage: string | undefined,
  minSats: bigint,
  t: BtcText,
): string {
  switch (errorKind) {
    case DepositErrorKind.valueTooSmall:
      return t.errValueTooSmall(formatSats(minSats));
    case DepositErrorKind.tainted:
      return t.errTainted;
    case DepositErrorKind.minterUnavailable:
      return t.errMinterUnavailable;
    case DepositErrorKind.unrecoverable:
      return t.errUnrecoverable(errorMessage);
    default:
      return t.errOther(errorMessage);
  }
}

function formatTime(
  timestamp: bigint | undefined,
  notYet: string,
  lang: Lang,
): string {
  const date = timestampToDate(timestamp);
  return date
    ? date.toLocaleString(toIntlLocale(lang), {
        dateStyle: "short",
        timeStyle: "short",
      })
    : notYet;
}

/** Amount rows of one deposit, in display order. */
function amountRows(
  amounts: Amounts,
  purchase: boolean,
  t: BtcText,
): Array<{ id: string; label: string; value: string }> {
  const rows = [
    {
      id: "btc_detected",
      label: t.amountBtcDetected,
      value: formatSats(amounts.btcDetectedSats),
    },
    {
      id: "ckbtc_created",
      label: t.amountCkbtcCreated,
      value: formatSats(amounts.ckbtcMintedSats, "ckBTC"),
    },
  ];
  if (amounts.ckbtcPendingSats > 0n) {
    rows.push({
      id: "ckbtc_pending",
      label: t.amountCkbtcPending,
      value: formatSats(amounts.ckbtcPendingSats, "ckBTC"),
    });
  }
  if (purchase && amounts.refundedSats > 0n) {
    rows.push({
      id: "refunded",
      label: t.amountRefunded,
      value: formatSats(amounts.refundedSats, "ckBTC"),
    });
  } else if (purchase) {
    rows.push({
      id: "ttti_delivered",
      label: t.amountTttiDelivered,
      value: `${formatTtti(amounts.tttiDelivered)} TTTI-T`,
    });
  }
  return rows;
}

/** Short stage label of a deposit, for the compact earlier-deposit rows. */
function stageLabel(
  entry: DepositEntry,
  kind: DepositKind,
  minSats: bigint,
  t: BtcText,
): string {
  const { stage } = entry;
  switch (stage.__kind__) {
    case "addressShown":
      return t.stepAddress;
    case "depositDetected":
      return t.stepDetected;
    case "confirming":
      return t.stepConfirmations(
        `${stage.confirming.current} / ${stage.confirming.required}`,
      );
    case "minted":
      return kind === DepositKind.wallet ? t.finalWallet : t.stepMinted;
    case "pendingRate":
      return t.stagePendingRate;
    case "delivered":
      return t.finalDelivered;
    case "refunded":
      return t.finalRefunded;
    case "error":
      return errorText(entry.errorKind, entry.errorMessage, minSats, t);
  }
}

const STEP_IDS = ["address", "detected", "confirmations", "minted", "final"];

const STEP_ICON: Record<StepState, ReactNode> = {
  done: <Check className="h-3.5 w-3.5" />,
  current: (
    <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
  ),
  failed: <AlertTriangle className="h-3.5 w-3.5" />,
  pending: <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />,
};

const STEP_CLASS: Record<StepState, string> = {
  done: "border-gold-strong bg-primary/15 text-primary",
  current: "border-gold text-primary",
  failed: "border-destructive bg-destructive/10 text-destructive",
  pending: "border-border text-muted-foreground",
};

/** Mempool txid links and the ckBTC mint link of one deposit. */
function DepositLinks({
  entry,
  tx,
  ocid,
  compact = false,
}: {
  entry: DepositEntry;
  tx: ExplorerText;
  ocid: string;
  compact?: boolean;
}) {
  const txids = depositTxids(entry);
  const mintBlock = depositCkbtcMintBlock(entry);
  const mintUrl =
    mintBlock === null ? null : icpDashboardTxUrl(PayToken.ckbtc, mintBlock);
  if (txids.length === 0 && mintBlock === null) return null;
  return (
    <>
      {txids.length > 0 ? (
        <div className="flex flex-col gap-1">
          <dt className="text-muted-foreground">
            {txids.length > 1 ? tx.btcTransactions : tx.btcTransaction}
          </dt>
          {txids.map((txid, i) => (
            <dd key={txid} className="min-w-0">
              <ExplorerLink
                target={mempoolTxUrl(txid)}
                label={tx.trackOnMempool}
                className="text-xs"
                data-ocid={`${ocid}.txid_link.${i + 1}`}
              >
                {txid}
              </ExplorerLink>
            </dd>
          ))}
        </div>
      ) : null}
      {mintBlock !== null && mintUrl !== null ? (
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">{tx.ckbtcMintBlock}</dt>
          <dd className="min-w-0 text-right">
            <ExplorerLink
              target={mintUrl}
              label={tx.viewOnIcpDashboard}
              className={compact ? "text-xs" : undefined}
              data-ocid={`${ocid}.ckbtc_mint_link`}
            >
              {mintBlock.toString()}
            </ExplorerLink>
          </dd>
        </div>
      ) : null}
    </>
  );
}

const WAITING_STAGE: DepositStage = {
  __kind__: "addressShown",
  addressShown: null,
};

/** Refund failure of a delivered purchase deposit: message and amount held. */
function RefundFailedNote({
  entry,
  t,
  ocid,
}: {
  entry: DepositEntry;
  t: BtcText;
  ocid: string;
}) {
  return (
    <p
      className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning"
      data-ocid={ocid}
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="flex flex-col gap-1">
        <span>
          {t.refundFailed(formatSats(entry.ckbtcPendingSats, "ckBTC"))}
        </span>
        {entry.errorMessage ? (
          <span className="break-words">{entry.errorMessage}</span>
        ) : null}
      </span>
    </p>
  );
}

/**
 * Step-by-step progress of the deposit in progress on the tracking's address
 * (or the waiting state), with every other deposit listed compactly below.
 */
export function BtcDepositProgress({
  tracking,
  onCheck,
  checking,
  view,
  ocidPrefix = `btc.${tracking.kind}`,
  tttiMintBlock,
}: BtcDepositProgressProps) {
  const t = useDict(BUY_BTC_TEXT);
  const tx = useDict(BUY_EXPLORER_TEXT);
  const { lang } = useLanguage();
  const { data: info } = useBtcDepositInfo();
  const required = info?.minConfirmations ?? BTC_DEFAULT_MIN_CONFIRMATIONS;
  const minSats = info?.depositMinSats ?? BTC_DEFAULT_DEPOSIT_MIN_SATS;
  const { kind } = tracking;
  const purchase = kind === DepositKind.purchase;
  const entry = view.focus;
  const earlier = tracking.deposits.filter(
    (item) => entry === null || item.index !== entry.index,
  );
  const hasNewer =
    entry !== null && earlier.some((item) => item.index > entry.index);

  // A failed last check (e.g. minter unavailable) is reported on the tracking;
  // an error that only mirrors the newest deposit belongs to that deposit.
  const newest = latestDeposit(tracking);
  const trackingError =
    tracking.stage.__kind__ === "error" &&
    tracking.errorKind !== undefined &&
    !(
      newest?.stage.__kind__ === "error" &&
      newest.errorKind === tracking.errorKind
    );
  const stage = trackingError
    ? tracking.stage
    : entry
      ? entry.stage
      : WAITING_STAGE;
  const amounts: Amounts = entry ?? NO_AMOUNTS;
  const failed = stage.__kind__ === "error";
  const failureText = trackingError
    ? errorText(tracking.errorKind, tracking.errorMessage, minSats, t)
    : errorText(entry?.errorKind, entry?.errorMessage, minSats, t);
  const { index, complete } = position(kind, stage, amounts);
  const showTttiMint = purchase && tttiMintBlock !== undefined;

  const confirmations =
    stage.__kind__ === "confirming"
      ? `${stage.confirming.current} / ${stage.confirming.required}`
      : index > 2 || complete
        ? `${required} / ${required}`
        : `0 / ${required}`;
  const finalLabel = !purchase
    ? t.finalWallet
    : stage.__kind__ === "refunded"
      ? t.finalRefunded
      : t.finalDelivered;
  const labels = [
    t.stepAddress,
    t.stepDetected,
    t.stepConfirmations(confirmations),
    t.stepMinted,
    finalLabel,
  ];

  const stateOf = (step: number): StepState => {
    if (complete || step < index) return "done";
    if (step === index) return failed ? "failed" : "current";
    return "pending";
  };

  const hasLinks =
    entry !== null &&
    (depositTxids(entry).length > 0 || depositCkbtcMintBlock(entry) !== null);

  return (
    <section
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5"
      aria-label={t.progressAria}
      data-ocid={`${ocidPrefix}.progress.panel`}
    >
      <ol
        className="flex flex-col gap-3"
        data-ocid={`${ocidPrefix}.progress.list`}
      >
        {labels.map((label, step) => {
          const state = stateOf(step);
          return (
            <li
              key={STEP_IDS[step]}
              className="flex items-center gap-3"
              data-ocid={`${ocidPrefix}.progress.item.${step + 1}`}
              data-state={state}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-smooth ${STEP_CLASS[state]}`}
              >
                {STEP_ICON[state]}
              </span>
              <span
                className={
                  state === "pending"
                    ? "text-sm text-muted-foreground"
                    : "text-sm text-foreground"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {failed ? (
        <p
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid={`${ocidPrefix}.progress.error_state`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {failureText}
        </p>
      ) : null}
      {stage.__kind__ === "pendingRate" ? (
        <output
          className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning"
          data-ocid={`${ocidPrefix}.progress.pending_rate_state`}
        >
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          {t.pendingRate}
        </output>
      ) : null}
      {entry === null && !failed ? (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-ocid={`${ocidPrefix}.progress.empty_state`}
          data-waiting={view.waiting ? "true" : "false"}
        >
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {tracking.deposits.length === 0
            ? t.noDepositYet
            : t.waitingNewTransfer}
        </p>
      ) : null}
      {entry !== null && entry.errorKind === DepositErrorKind.refundFailed ? (
        <RefundFailedNote
          entry={entry}
          t={t}
          ocid={`${ocidPrefix}.progress.refund_failed_state`}
        />
      ) : null}
      {view.finished ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold bg-primary/10 px-3 py-2 text-sm"
          data-ocid={`${ocidPrefix}.progress.success_state`}
        >
          {failed ? (
            <span className="text-muted-foreground">
              {t.depositNumber(formatInteger(view.finished.index + 1n, lang))}
            </span>
          ) : (
            <output className="flex items-center gap-2 text-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {t.depositFinished(
                formatInteger(view.finished.index + 1n, lang),
                stageLabel(view.finished, kind, minSats, t),
              )}
            </output>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={view.returnToWaiting}
            className="h-8 rounded-lg px-2 text-xs text-primary hover:bg-primary/10"
            data-ocid={`${ocidPrefix}.wait_button`}
          >
            {t.waitForNew}
          </Button>
        </div>
      ) : null}

      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-2">
        {amountRows(amounts, purchase, t).map((item) => (
          <div
            key={item.id}
            className="flex items-baseline justify-between gap-3"
            data-ocid={`${ocidPrefix}.progress.${item.id}`}
          >
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {hasLinks || showTttiMint ? (
        <dl
          className="flex flex-col gap-2 border-t border-border pt-4 text-sm"
          data-ocid={`${ocidPrefix}.progress.explorer_list`}
        >
          {entry ? (
            <DepositLinks
              entry={entry}
              tx={tx}
              ocid={`${ocidPrefix}.progress`}
            />
          ) : null}
          {showTttiMint && tttiMintBlock !== undefined ? (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{tx.tttiMintBlock}</dt>
              <dd className="min-w-0 text-right">
                <ExplorerLink
                  target={tttiBlockTarget(tttiMintBlock)}
                  label={tx.viewBlockInHistory}
                  data-ocid={`${ocidPrefix}.progress.ttti_mint_link`}
                >
                  {tttiMintBlock.toString()}
                </ExplorerLink>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {earlier.length > 0 ? (
        <div
          className="flex flex-col gap-3 border-t border-border pt-4"
          data-ocid={`${ocidPrefix}.earlier.list`}
        >
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
            {hasNewer ? t.otherDeposits : t.earlierDeposits}
          </h4>
          <ul className="flex flex-col gap-3">
            {earlier.map((item, i) => {
              const ocid = `${ocidPrefix}.earlier.item.${i + 1}`;
              const itemFailed = item.stage.__kind__ === "error";
              const itemOpen = !isDepositEntryTerminal(item, kind);
              return (
                <li
                  key={item.index.toString()}
                  className="flex flex-col gap-2 rounded-md border border-border bg-background/60 px-3 py-2.5 text-sm"
                  data-ocid={ocid}
                  data-state={itemOpen ? "open" : "final"}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-medium text-foreground">
                      {t.depositNumber(formatInteger(item.index + 1n, lang))}
                    </span>
                    <span
                      className={
                        itemFailed
                          ? "flex items-center gap-1.5 text-xs text-destructive"
                          : "flex items-center gap-1.5 text-xs text-muted-foreground"
                      }
                    >
                      {itemOpen ? (
                        <Loader2
                          className="h-3 w-3 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : null}
                      {stageLabel(item, kind, minSats, t)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.detectedOn(formatTime(item.detectedAt, t.notYet, lang))}
                  </p>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                    {amountRows(item, purchase, t).map((row) => (
                      <div
                        key={row.id}
                        className="flex items-baseline justify-between gap-3"
                      >
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-mono tabular-nums text-foreground">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {item.errorKind === DepositErrorKind.refundFailed ? (
                    <RefundFailedNote
                      entry={item}
                      t={t}
                      ocid={`${ocid}.refund_failed_state`}
                    />
                  ) : null}
                  {depositTxids(item).length > 0 ||
                  depositCkbtcMintBlock(item) !== null ? (
                    <dl className="flex flex-col gap-1 text-xs">
                      <DepositLinks entry={item} tx={tx} ocid={ocid} compact />
                    </dl>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-xs text-muted-foreground"
          data-ocid={`${ocidPrefix}.progress.last_checked`}
        >
          {t.lastChecked(formatTime(tracking.lastCheckedAt, t.notYet, lang))}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCheck}
          disabled={checking}
          className="rounded-lg"
          data-ocid={`${ocidPrefix}.check_button`}
        >
          <RefreshCw
            className={
              checking
                ? "mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                : "mr-2 h-4 w-4"
            }
          />
          {checking ? t.checking : t.check}
        </Button>
      </div>
    </section>
  );
}
