import {
  AlertCircle,
  Bitcoin,
  CheckCircle2,
  Loader2,
  Undo2,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { BtcDepositErrorCode, PayToken } from "../../backend";
import type { RemainderChoice } from "../../backend";
import {
  isSignerKind,
  useConnectedWallet,
} from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  BtcDepositFailure,
  btcAddressShownBefore,
  btcDepositErrorMessage,
  isDepositTerminal,
  rememberBtcAddressShown,
  useBtcDepositInfo,
  useCheckBtcPurchaseDeposit,
  useDepositView,
  useGetBtcPurchaseAddress,
  useMyBtcDeposits,
  useMyConversions,
  useWalletBtcDeposits,
  useWalletCheckBtcPurchaseDeposit,
  useWalletGetBtcPurchaseAddress,
} from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core/dict";
import type { Lang } from "../../i18n/core/lang";
import {
  BUY_BTC_TEXT,
  BUY_MINT_POOL_TEXT,
  BUY_PAGE_TEXT,
} from "../../i18n/pages/buy";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import {
  BTC_PAY_OPTION,
  btcDepositText,
  encodeAccountText,
  formatSats,
  formatTtti,
} from "../../lib/token";
import { cn } from "../../lib/utils";
import { FiatAmount } from "../FiatAmount";
import { WalletTermsOpenButton } from "../acceptance";
import { BtcDepositAddressCard } from "../btc/BtcDepositAddressCard";
import { BtcDepositProgress } from "../btc/BtcDepositProgress";
import { RefundDetails } from "../btc/RefundDetails";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ConvertNotice, FinalMintButton } from "./FinalMintButton";
import { ZeroBalanceTransferOffer } from "./ZeroBalanceTransferOffer";
import {
  type MintSourceKind,
  planHeldConversion,
  useHeldBtcConversion,
  useMintSources,
} from "./mintSources";

const GOLD_BUTTON =
  "min-h-12 gap-2 rounded-lg border border-gold-strong bg-gradient-primary text-base font-semibold tracking-wide text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:shadow-none";
/** Automatic checks never run more often than this. */
const MIN_AUTO_CHECK_MS = 30_000;
/** Checks for a new transfer once every deposit is final. */
const IDLE_CHECK_MS = 60_000;

interface BtcPurchasePanelProps {
  /** The page's wallet terms block (loading, error, single checkbox). */
  acknowledgements: ReactNode;
  /** Acknowledgement status has been read for the signed-in principal. */
  ackKnown: boolean;
  needsAck: boolean;
  /** The single wallet terms checkbox is ticked. */
  allChecked: boolean;
  /** Records the acceptance (existing flow). */
  onAccept: () => Promise<unknown>;
  closed: boolean;
  closedLabel: string;
  /** Opens the ckBTC payment form, for a ckBTC balance held in the wallet or DEX. */
  onUseTokenForm: () => void;
  /** Pool selected on the mint screen; null while none is selected. */
  poolId: bigint | null;
  /** Remainder choice of the mint screen. */
  choice: RemainderChoice;
  /** Slippage tolerance of the mint screen; null while its text is invalid. */
  slippageBps: bigint | null;
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
  onUseTokenForm,
  poolId,
  choice,
  slippageBps,
}: BtcPurchasePanelProps) {
  const t = useDict(BUY_BTC_TEXT);
  const tp = useDict(BUY_PAGE_TEXT);
  const tpool = useDict(BUY_MINT_POOL_TEXT);
  const tdex = useDict(DEX_TEXT);
  const [finalNotice, setFinalNotice] = useState<string | null>(null);
  const mintSources = useMintSources(PayToken.ckbtc);
  const heldConversion = useHeldBtcConversion();
  const tw = useDict(WALLET_TEXT);
  const { lang } = useLanguage();
  const connected = useConnectedWallet();
  // External wallets (Plug, OISY, NFID) sign the purchase-path calls.
  const external = connected.principal !== null;
  const signer = external && isSignerKind(connected.kind);
  const { identity } = useInternetIdentity();
  const principalText = external
    ? connected.principal?.toText()
    : identity?.getPrincipal().toText();
  const { data: info } = useBtcDepositInfo();
  const iiDeposits = useMyBtcDeposits(!external);
  const walletDeposits = useWalletBtcDeposits(external);
  const deposits = external ? walletDeposits : iiDeposits;
  const iiGetAddress = useGetBtcPurchaseAddress();
  const walletGetAddress = useWalletGetBtcPurchaseAddress();
  const getAddress = external ? walletGetAddress : iiGetAddress;
  const iiCheck = useCheckBtcPurchaseDeposit();
  const walletCheck = useWalletCheckBtcPurchaseDeposit();
  const {
    mutate: checkDeposit,
    isPending: checking,
    data: checked,
  } = external ? walletCheck : iiCheck;
  // The raw failure is kept so its text follows a language switch.
  const [failure, setError] = useState<{ error: unknown } | null>(null);
  const error = failure ? failureMessage(failure.error, lang) : null;
  const [accepting, setAccepting] = useState(false);

  // The stored tracking (once a deposit is detected) wins; before that the
  // unsaved tracking of the latest check or address call is shown.
  const tracking = deposits.data?.purchase ?? checked ?? getAddress.data;
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
  // OISY/NFID open a window per signed call: manual checks only.
  useEffect(() => {
    if (!hasTracking || signer) return;
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
  }, [hasTracking, signer, intervalMs, checkDeposit]);

  // Back on the page before any deposit: fetch the same address again, so it
  // shows and the automatic checks resume. OISY/NFID: by hand (signed call).
  const { mutate: fetchAddress, isPending: fetchingAddress } = getAddress;
  const autoFetchedRef = useRef(false);
  useEffect(() => {
    if (autoFetchedRef.current || signer || hasTracking || fetchingAddress) {
      return;
    }
    if (deposits.isLoading || !ackKnown || needsAck) return;
    if (!btcAddressShownBefore("purchase", principalText)) return;
    autoFetchedRef.current = true;
    fetchAddress(undefined, { onError: (err) => setError({ error: err }) });
  }, [
    signer,
    hasTracking,
    fetchingAddress,
    deposits.isLoading,
    ackKnown,
    needsAck,
    principalText,
    fetchAddress,
  ]);

  // OISY/NFID: the wallet window opens from the click, before any await.
  const openSession = () => (external ? connected.beginSession() : () => {});

  const handleCheck = () => {
    setError(null);
    const release = openSession();
    checkDeposit(undefined, {
      onError: (err) => setError({ error: err }),
      onSettled: () => release(),
    });
  };

  const handleGetAddress = async () => {
    setError(null);
    const release = openSession();
    try {
      if (needsAck) {
        setAccepting(true);
        await onAccept();
        setAccepting(false);
      }
      await getAddress.mutateAsync();
      rememberBtcAddressShown("purchase", principalText);
    } catch (err) {
      setError({ error: err });
    } finally {
      setAccepting(false);
      release();
    }
  };

  const requesting = accepting || getAddress.isPending;
  const canRequest =
    !closed && ackKnown && (!needsAck || allChecked) && !requesting;

  // TTTI-T mint block of the shown delivered deposit, read from its conversion.
  const conversions = useMyConversions();
  const { refetch: refetchConversions } = conversions;
  const shown = view.focus;
  const stage = shown?.stage.__kind__;
  const conversionId = shown?.conversionId;
  const tttiDelivered = shown?.tttiDelivered ?? 0n;
  const refundedSats = shown?.refundedSats ?? 0n;
  // External wallets: the conversion list is not read (signed call).
  const delivered =
    !external && stage === "delivered" && conversionId !== undefined;
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

  const handleFinalMint = (source: MintSourceKind) => {
    setFinalNotice(null);
    if (source === "contract") {
      const plan = planHeldConversion({
        held: mintSources.held,
        poolId,
        choice,
        slippageBps,
      });
      if (plan.kind !== "ready") {
        heldConversion.reset();
        setFinalNotice(
          plan.kind === "noPool" ? tpool.noPool : tdex.slippageInvalid,
        );
        return;
      }
      heldConversion.convert(mintSources.heldIndexes, plan.params);
      return;
    }
    heldConversion.reset();
    onUseTokenForm();
  };
  const finalSource = mintSources.held > 0n ? "contract" : "token";

  const termsRefused =
    failure?.error instanceof BtcDepositFailure &&
    failure.error.code === BtcDepositErrorCode.acknowledgementRequired;

  const errorAlert = error ? (
    <>
      <Alert variant="destructive" data-ocid="btc.purchase.error_state">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t.errorTitle}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      {termsRefused && (
        <WalletTermsOpenButton ocid="btc.purchase.terms.open_button" />
      )}
    </>
  ) : null;

  const signatureNote =
    signer && connected.name ? (
      <p
        className="px-1 text-xs text-muted-foreground"
        data-ocid="btc.purchase.signature_note"
      >
        {tw.btcSignatureEachCheck(connected.name)}
      </p>
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
          <p>{t.intro}</p>
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
        {signatureNote}
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
      <p
        className="px-1 text-xs text-muted-foreground"
        data-ocid="btc.purchase.keep_page_open"
      >
        {t.keepPageOpen}
      </p>

      {stage === "delivered" && (
        <Alert
          className="border-gold-strong bg-primary/10 shadow-gold"
          data-ocid="btc.purchase.success_state"
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="font-display text-base tabular-nums">
            {t.delivered(formatTtti(tttiDelivered))}
            <FiatAmount
              token="ttti"
              amount={tttiDelivered}
              className="ml-1.5"
              ocid="btc.purchase.delivered_fiat"
            />
          </AlertTitle>
          <AlertDescription className="text-xs tabular-nums">
            {t.deliveredDetail}
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
            <FiatAmount
              token={PayToken.ckbtc}
              amount={refundedSats}
              className="ml-1.5"
              ocid="btc.purchase.refunded_fiat"
            />
          </AlertTitle>
          <AlertDescription className="space-y-1">
            <span className="block">{t.refundedDetail}</span>
            {shown && (
              <RefundDetails
                entry={shown}
                ocid="btc.purchase.refunded_details"
              />
            )}
          </AlertDescription>
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
      {signatureNote}
      <FinalMintButton
        token={PayToken.ckbtc}
        symbol="ckBTC"
        sources={mintSources}
        busyLabel={
          heldConversion.state.kind === "working" ? tp.finalConverting : null
        }
        blocked={closed}
        onMint={handleFinalMint}
        notice={
          <>
            {finalNotice !== null && (
              <p
                className="px-1 text-sm text-muted-foreground"
                role="alert"
                data-ocid="exchange.final_mint.notice"
              >
                {finalNotice}
              </p>
            )}
            {finalSource === "token" &&
              (mintSources.wallet ?? 0n) + (mintSources.dex ?? 0n) > 0n && (
                <p className="px-1 text-xs text-muted-foreground">
                  {tp.finalUseTokenForm}
                </p>
              )}
            <ConvertNotice state={heldConversion.state} />
          </>
        }
        offer={
          <ZeroBalanceTransferOffer
            symbol="ckBTC"
            address={
              mintSources.principal
                ? encodeAccountText({ owner: mintSources.principal })
                : undefined
            }
          />
        }
        ocidPrefix="exchange.final_mint"
      />
    </div>
  );
}
