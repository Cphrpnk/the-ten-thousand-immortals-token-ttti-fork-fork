import {
  AlertCircle,
  Bitcoin,
  CheckCircle2,
  Loader2,
  Undo2,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { BtcDepositErrorCode } from "../../backend";
import {
  BtcDepositFailure,
  btcDepositErrorMessage,
  isDepositTerminal,
  useBtcDepositInfo,
  useCheckBtcPurchaseDeposit,
  useDepositView,
  useGetBtcPurchaseAddress,
  useMyBtcDeposits,
  useMyConversions,
} from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core/dict";
import type { Lang } from "../../i18n/core/lang";
import { BUY_BTC_TEXT } from "../../i18n/pages/buy";
import {
  BTC_PAY_OPTION,
  btcDepositText,
  feeLabelFor,
  formatSats,
  formatTtti,
} from "../../lib/token";
import { cn } from "../../lib/utils";
import { BtcDepositAddressCard } from "../btc/BtcDepositAddressCard";
import { BtcDepositProgress } from "../btc/BtcDepositProgress";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const GOLD_BUTTON =
  "min-h-12 gap-2 rounded-lg border border-gold-strong bg-gradient-primary text-base font-semibold tracking-wide text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:shadow-none";
/** Automatic checks never run more often than this. */
const MIN_AUTO_CHECK_MS = 30_000;
/** Checks for a new transfer once every deposit is final. */
const IDLE_CHECK_MS = 60_000;

interface BtcPurchasePanelProps {
  /** The page's acknowledgement status block (loading, error, checkboxes). */
  acknowledgements: ReactNode;
  /** Acknowledgement status has been read for the signed-in principal. */
  ackKnown: boolean;
  needsAck: boolean;
  allChecked: boolean;
  /** Records the six acknowledgements (existing flow). */
  onAccept: () => Promise<unknown>;
  closed: boolean;
  closedLabel: string;
}

function failureMessage(error: unknown, lang: Lang): string {
  if (error instanceof BtcDepositFailure) {
    return btcDepositErrorMessage(error.code, lang);
  }
  return error instanceof Error && error.message
    ? error.message
    : BUY_BTC_TEXT[lang].requestFailed;
}

/** BTC → ckBTC → TTTI-T purchase: own deposit address, QR code and progress. */
export function BtcPurchasePanel({
  acknowledgements,
  ackKnown,
  needsAck,
  allChecked,
  onAccept,
  closed,
  closedLabel,
}: BtcPurchasePanelProps) {
  const t = useDict(BUY_BTC_TEXT);
  const { lang } = useLanguage();
  const { data: info } = useBtcDepositInfo();
  const deposits = useMyBtcDeposits();
  const getAddress = useGetBtcPurchaseAddress();
  const { mutate: checkDeposit, isPending: checking } =
    useCheckBtcPurchaseDeposit();
  // The raw failure is kept so its text follows a language switch.
  const [failure, setError] = useState<{ error: unknown } | null>(null);
  const error = failure ? failureMessage(failure.error, lang) : null;
  const [accepting, setAccepting] = useState(false);

  // The persisted tracking wins so the panel resumes after refresh or sign-in.
  const tracking = deposits.data?.purchase ?? getAddress.data;
  const view = useDepositView(tracking);
  const hasTracking = !!tracking;
  const settled = !!tracking && isDepositTerminal(tracking);
  const pollMs = Math.max(
    Number(info?.suggestedPollSeconds ?? 60n) * 1000,
    MIN_AUTO_CHECK_MS,
  );
  // Slower checks for a new transfer once every deposit is final.
  const intervalMs = settled ? Math.max(pollMs, IDLE_CHECK_MS) : pollMs;
  const checkingRef = useRef(checking);
  checkingRef.current = checking;

  // Automatic checks while the panel is open, also for a new transfer.
  useEffect(() => {
    if (!hasTracking) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || checkingRef.current) return;
      checkDeposit(undefined, {
        onSuccess: () => setError(null),
        onError: (err) => {
          const benign =
            err instanceof BtcDepositFailure &&
            err.code === BtcDepositErrorCode.purchaseInProgress;
          if (!benign) setError({ error: err });
        },
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [hasTracking, intervalMs, checkDeposit]);

  const handleCheck = () => {
    setError(null);
    checkDeposit(undefined, {
      onError: (err) => setError({ error: err }),
    });
  };

  const handleGetAddress = async () => {
    setError(null);
    try {
      if (needsAck) {
        setAccepting(true);
        await onAccept();
        setAccepting(false);
      }
      await getAddress.mutateAsync();
    } catch (err) {
      setError({ error: err });
    } finally {
      setAccepting(false);
    }
  };

  const requesting = accepting || getAddress.isPending;
  const canRequest =
    !closed && ackKnown && (!needsAck || allChecked) && !requesting;
  const fee = feeLabelFor(BTC_PAY_OPTION.feeBps);

  // TTTI-T mint block of the shown delivered deposit, read from its conversion.
  const conversions = useMyConversions();
  const { refetch: refetchConversions } = conversions;
  const shown = view.focus;
  const stage = shown?.stage.__kind__;
  const conversionId = shown?.conversionId;
  const tttiDelivered = shown?.tttiDelivered ?? 0n;
  const refundedSats = shown?.refundedSats ?? 0n;
  const delivered = stage === "delivered" && conversionId !== undefined;
  const conversion = delivered
    ? conversions.data?.find((c) => c.id === conversionId)
    : undefined;
  const tttiMintBlock = conversion?.mintBlock;
  const conversionMissing =
    delivered && conversions.isSuccess && conversion === undefined;
  const refetchedForRef = useRef<bigint | null>(null);
  useEffect(() => {
    if (!conversionMissing || conversionId === undefined) return;
    if (refetchedForRef.current === conversionId) return;
    refetchedForRef.current = conversionId;
    void refetchConversions();
  }, [conversionMissing, conversionId, refetchConversions]);

  const errorAlert = error ? (
    <Alert variant="destructive" data-ocid="btc.purchase.error_state">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t.errorTitle}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  ) : null;

  if (deposits.isLoading) {
    return (
      <div className="space-y-3" data-ocid="btc.purchase.loading_state">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="space-y-4" data-ocid="btc.purchase.panel">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 px-3 py-3 text-sm text-muted-foreground">
          <Bitcoin
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p>{t.intro(fee)}</p>
        </div>
        {acknowledgements}
        {errorAlert}
        <Button
          type="button"
          className={cn(GOLD_BUTTON, "w-full")}
          onClick={() => void handleGetAddress()}
          disabled={!canRequest}
          aria-busy={requesting}
          data-ocid="btc.purchase.get_address.primary_button"
        >
          {requesting && (
            <Loader2
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {closed
            ? closedLabel
            : accepting
              ? t.recordingAcks
              : getAddress.isPending
                ? t.creatingAddress
                : t.getAddress}
        </Button>
        {!closed && ackKnown && needsAck && !allChecked && (
          <p
            className="text-xs text-muted-foreground"
            data-ocid="btc.purchase.acknowledgements.hint"
          >
            {t.tickAll}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="btc.purchase.panel">
      <BtcDepositAddressCard
        address={tracking.btcAddress}
        label={t.purchaseAddressLabel}
        note={btcDepositText(
          info?.depositMinSats,
          info?.minConfirmations,
          lang,
        )}
        ocidPrefix="btc.purchase.address"
        kind={tracking.kind}
      />
      <p className="px-1 text-xs text-muted-foreground">{t.sentToDelivery}</p>

      {stage === "delivered" && (
        <Alert
          className="border-gold-strong bg-primary/10 shadow-gold"
          data-ocid="btc.purchase.success_state"
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="font-display text-base tabular-nums">
            {t.delivered(formatTtti(tttiDelivered))}
          </AlertTitle>
          <AlertDescription className="text-xs tabular-nums">
            {t.deliveredDetail(fee)}
            {conversionId !== undefined && ` · #${conversionId.toString()}`}
          </AlertDescription>
        </Alert>
      )}
      {stage === "refunded" && (
        <Alert
          className="border-warning/50 bg-warning/10"
          data-ocid="btc.purchase.refunded_state"
        >
          <Undo2 className="h-4 w-4 text-warning" />
          <AlertTitle className="tabular-nums">
            {t.refunded(formatSats(refundedSats, "ckBTC"))}
          </AlertTitle>
          <AlertDescription>{t.refundedDetail}</AlertDescription>
        </Alert>
      )}

      {errorAlert}

      <BtcDepositProgress
        tracking={tracking}
        onCheck={handleCheck}
        checking={checking}
        view={view}
        ocidPrefix="btc.purchase"
        tttiMintBlock={tttiMintBlock}
      />
    </div>
  );
}
