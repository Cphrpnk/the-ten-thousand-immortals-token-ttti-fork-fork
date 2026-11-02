import { Link, useLocation } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { type MintArgs, PayToken, PriceSource } from "../backend";
import { FiatAmount } from "../components/FiatAmount";
import { FlatTokenIcon } from "../components/FlatTokenIcon";
import {
  SlippageField,
  defaultSlippageText,
} from "../components/dex/SlippageField";
import { DEFAULT_SLIPPAGE_BPS } from "../components/dex/liquidityFormat";
import { BtcPurchasePanel } from "../components/exchange/BtcPurchasePanel";
import { DeliveryAddressCard } from "../components/exchange/DeliveryAddressCard";
import { GetIcpFirstPanel } from "../components/exchange/GetIcpFirstPanel";
import { MigrationNotice } from "../components/exchange/MigrationNotice";
import {
  MintOutcomeAlerts,
  type MintOutcomeSource,
} from "../components/exchange/MintOutcomeAlerts";
import { MintPaymentBreakdown } from "../components/exchange/MintPaymentBreakdown";
import {
  type OrderMode,
  OrderModeToggle,
} from "../components/exchange/OrderModeToggle";
import { PayTokenSelector } from "../components/exchange/PayTokenSelector";
import { PoolCapRatio } from "../components/exchange/PoolCapRatio";
import { PresaleProgress } from "../components/exchange/PresaleProgress";
import {
  type TokenRate,
  TokenRateCard,
} from "../components/exchange/TokenRateCard";
import { WalletPercentBar } from "../components/exchange/WalletPercentBar";
import { ZeroBalanceTransferOffer } from "../components/exchange/ZeroBalanceTransferOffer";
import {
  MINT_MIN_TTTI,
  MINT_QUOTE_DEBOUNCE_MS,
  describeMintError,
  formatMintTtti,
  maxPayWithTolerance,
  mintDeadline,
  mintInputKey,
  parseMintInput,
  tttiFromUsdPayment,
  usdFromTokenAmount,
} from "../components/exchange/liquidityMint";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { useBuyFunnel } from "../hooks/useBuyFunnel";
import {
  type ConnectedWalletKind,
  useConnectedWallet,
} from "../hooks/useConnectedWallet";
import { usePayTokenApprove } from "../hooks/useIcpApprove";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useWalletAcceptPurchaseAcknowledgements,
  useWalletApprove,
  useWalletMintLiquidity,
  useWalletPurchaseAcknowledgement,
} from "../hooks/usePlugPurchase";
import {
  findPayTokenStatus,
  formatTokenRateLine,
  isDepositInProgress,
  useAcceptPurchaseAcknowledgements,
  useGetDeliveryAddress,
  useGetMyPurchaseAcknowledgement,
  useGetSaleStatus,
  useLiquidityMintQuote,
  useMintLiquidity,
  useMyBtcDeposits,
  useRefreshOnDepositProgress,
  useWalletBtcDeposits,
} from "../hooks/useQueries";
import { usePayTokenBalance } from "../hooks/useWallet";
import { SITE_TEXT } from "../i18n/common/site";
import { useDict, useLanguage } from "../i18n/core/dict";
import {
  BUY_BTC_TEXT,
  BUY_LIQUIDITY_TEXT,
  BUY_PAGE_TEXT,
} from "../i18n/pages/buy";
import { PLAIN_RULES_TEXT } from "../i18n/pages/dex";
import { requiredTokenBalance } from "../lib/icpLedger";
import {
  BTC_PAY_OPTION,
  PAY_TOKENS,
  type SetupPayChoice,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  encodeAccountText,
  feeLabelFor,
  formatPayAmount,
  tokenForWalletPercent,
  unitsInputValue,
} from "../lib/token";
import { cn } from "../lib/utils";

const DISPLAY_SYMBOL = "TTTI-T";
const BALANCE_POLL_MS = 5_000;
/** The backend never uses a rate beyond validUntil + 5 minutes. */
const RATE_GRACE_MS = 5 * 60_000;

/** Gold & Obsidian surface and action styles shared across this page. */
const CARD_CLASS =
  "rounded-xl border border-gold bg-gradient-surface shadow-elevated transition-smooth";
const GOLD_BUTTON =
  "min-h-12 gap-2 rounded-lg border border-gold-strong bg-gradient-primary text-base font-semibold tracking-wide text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:shadow-none";
const OUTLINE_BUTTON =
  "rounded-lg border-gold bg-transparent text-foreground transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";
const AMOUNT_INPUT =
  "h-14 border-gold bg-background/60 pr-20 font-mono text-xl tabular-nums transition-smooth focus-visible:border-gold-strong focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Six mandatory acknowledgements, asked once at the account's first purchase.
 * Their sentences live in BUY_PAGE_TEXT (i18n/pages/buy.ts).
 */
const ACKNOWLEDGEMENTS = [
  { id: "read-first", textKey: "ackReadFirst" },
  { id: "no-rights", textKey: "ackNoRights" },
  { id: "price-zero", textKey: "ackPriceZero" },
  { id: "icp-creator", textKey: "ackIcpCreator" },
  { id: "no-profit", textKey: "ackNoProfit" },
  { id: "afford-loss", textKey: "ackAffordLoss" },
] as const;
type AcknowledgementId = (typeof ACKNOWLEDGEMENTS)[number]["id"];

type ActiveWallet = ConnectedWalletKind | "internetIdentity";
/** A refused input shown as an alert, in the active language. */
type Validation = { title: string; message: string };

export function ExchangePage() {
  const t = useDict(BUY_PAGE_TEXT);
  const tl = useDict(BUY_LIQUIDITY_TEXT);
  const plain = useDict(PLAIN_RULES_TEXT);
  const tb = useDict(BUY_BTC_TEXT);
  const { lang } = useLanguage();
  const site = useDict(SITE_TEXT);
  const { identity } = useInternetIdentity();
  const connected = useConnectedWallet();
  const externalPrincipal = connected.principal;
  const { openSetup, consumePreselectedPayChoice, payChoiceVersion } =
    useBuyFunnel();
  const iiPrincipal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const wallet: ActiveWallet | null =
    connected.kind && externalPrincipal
      ? connected.kind
      : iiPrincipal
        ? "internetIdentity"
        : null;
  const isExternal = !!wallet && wallet !== "internetIdentity";
  const activePrincipal = externalPrincipal ?? iiPrincipal;
  const activePrincipalText = activePrincipal?.toText() ?? null;

  const [token, setToken] = useState<PayToken>(PayToken.icp);
  // BTC settles as ckBTC; the token value is set to ckBTC while BTC is chosen.
  const [btcSelected, setBtcSelected] = useState(false);
  const descriptor = PAY_TOKENS[token];
  const symbol = descriptor.symbol;
  const decimals = descriptor.decimals;

  const statusQuery = useGetSaleStatus();
  const status = statusQuery.data;
  const balanceQuery = usePayTokenBalance(
    token,
    activePrincipal ? { owner: activePrincipal } : undefined,
  );
  const { refetch: refetchBalance } = balanceQuery;
  const iiAddress = useGetDeliveryAddress();
  const approve = usePayTokenApprove();
  const walletApprove = useWalletApprove();
  const mintLiquidity = useMintLiquidity();
  const walletMintLiquidity = useWalletMintLiquidity();
  // Acknowledgements are read and recorded by the same principal that buys.
  const iiAckQuery = useGetMyPurchaseAcknowledgement(
    wallet === "internetIdentity",
  );
  const walletAckQuery = useWalletPurchaseAcknowledgement(isExternal);
  const iiAcceptAck = useAcceptPurchaseAcknowledgements();
  const walletAcceptAck = useWalletAcceptPurchaseAcknowledgements();
  const ackQuery = isExternal ? walletAckQuery : iiAckQuery;
  const acceptAck = isExternal ? walletAcceptAck : iiAcceptAck;

  const [checked, setChecked] = useState<
    Partial<Record<AcknowledgementId, boolean>>
  >({});
  const [amount, setAmount] = useState("");
  const [tttiAmount, setTttiAmount] = useState("");
  const [mode, setMode] = useState<OrderMode>("ttti");
  const [slippageText, setSlippageText] = useState(defaultSlippageText);
  const [slippageBps, setSlippageBps] = useState<bigint | null>(
    DEFAULT_SLIPPAGE_BPS,
  );
  // A chosen wallet percentage drives the TTTI-T amount from the live balance.
  const [percent, setPercent] = useState<number | null>(null);
  const [step, setStep] = useState<
    "idle" | "accepting" | "approving" | "buying"
  >("idle");
  const [outcomeSource, setOutcome] = useState<MintOutcomeSource | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mintInfoOpen, setMintInfoOpen] = useState(false);
  const busy = step !== "idle";

  // Re-evaluate rate expiry without waiting for the next status poll.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  // Poll the balance so the form appears as soon as funds arrive.
  useEffect(() => {
    if (!activePrincipalText || busy) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refetchBalance();
    }, BALANCE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [activePrincipalText, busy, refetchBalance]);

  const locationHash = useLocation({ select: (loc) => loc.hash });
  useEffect(() => {
    const target =
      locationHash === "delivery-address" ||
      window.location.hash === "#delivery-address";
    if (!wallet || !target) return;
    const timer = window.setTimeout(() => {
      document
        .getElementById("delivery-address")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [wallet, locationHash]);

  const tokenAvailable = (t: PayToken) =>
    t === PayToken.icp ||
    findPayTokenStatus(status, t)?.treasuryConfigured === true;
  const selectedAvailable = tokenAvailable(token);
  // BTC deposits: any signed-in wallet, once the ckBTC treasury is configured.
  const btcAvailable = !!wallet && tokenAvailable(PayToken.ckbtc);
  const btcActive = btcSelected && btcAvailable;

  // ICP stays selected on arrival; a BTC purchase address with deposits is
  // signalled by a status line (in progress or waiting) that opens its tracking.
  // External wallets read it through their signed backend (Plug only polls).
  const iiBtcDeposits = useMyBtcDeposits(!isExternal);
  const walletBtcDeposits = useWalletBtcDeposits(isExternal);
  const myBtcDeposits = isExternal ? walletBtcDeposits : iiBtcDeposits;
  const btcPurchaseTracking = myBtcDeposits.data?.purchase;
  const btcPending = btcAvailable && isDepositInProgress(btcPurchaseTracking);
  const btcWaiting =
    btcAvailable &&
    !btcPending &&
    btcPurchaseTracking !== undefined &&
    btcPurchaseTracking.deposits.length > 0;
  useRefreshOnDepositProgress(btcPurchaseTracking);

  const tokenStatus = findPayTokenStatus(status, token);
  const rate: TokenRate | null = tokenStatus
    ? {
        usdE8: tokenStatus.priceUsdE8,
        source: tokenStatus.priceSource,
        fetchedAt: tokenStatus.priceFetchedAt,
        validUntil: tokenStatus.priceValidUntil,
        usable: tokenStatus.priceUsable,
      }
    : token === PayToken.icp && status
      ? {
          usdE8: status.priceUsdE8,
          source: status.priceSource,
          fetchedAt: status.priceFetchedAt,
          validUntil: status.priceValidUntil,
          usable: status.priceUsable,
        }
      : null;
  const price = rate?.usdE8 ?? 0n;
  const rateExpired =
    !rate ||
    rate.validUntil <= 0n ||
    Number(rate.validUntil / 1_000_000n) + RATE_GRACE_MS < now;
  // Quotes use the hourly rate, the same value the backend uses for the
  // purchase; without a valid rate the purchase is refused and nothing is taken.
  const priceAvailable =
    !!rate &&
    rate.usable &&
    price > 0n &&
    rate.source !== PriceSource.none &&
    !rateExpired;
  const rateLine = priceAvailable ? formatTokenRateLine(token, rate) : "";
  const feeBps = tokenStatus?.feeBps ?? descriptor.feeBps;
  const feeLabel = feeLabelFor(feeBps);

  const closed = !!status?.salesPaused;
  const balance = balanceQuery.data;

  // A wallet percentage turns the spendable token amount into TTTI-T.
  const percentTtti =
    percent !== null && balance !== undefined && priceAvailable
      ? tttiFromUsdPayment(
          usdFromTokenAmount(
            tokenForWalletPercent(balance, token, percent),
            decimals,
            price,
          ),
        )
      : null;
  const typedText =
    mode === "usd"
      ? amount
      : percentTtti !== null
        ? unitsInputValue(percentTtti, TTTI_DECIMALS)
        : tttiAmount;
  const mintInput = parseMintInput(mode, typedText);
  const inputKey = mintInputKey(token, mintInput);

  // The preview is requested once typing pauses; both modes share one quote.
  const [settledKey, setSettledKey] = useState(inputKey);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setSettledKey(inputKey),
      MINT_QUOTE_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [inputKey]);
  const settled = settledKey === inputKey;
  const quoteQuery = useLiquidityMintQuote(
    token,
    mintInput.kind === "ready" && settled ? mintInput.amount : null,
  );
  const quoteData =
    settled && mintInput.kind === "ready" ? quoteQuery.data : undefined;
  const previewQuote = quoteData?.__kind__ === "ok" ? quoteData.ok : null;
  const previewError =
    quoteData?.__kind__ === "err"
      ? describeMintError(quoteData.err, token, "preview", lang)
      : mintInput.kind === "ready" && settled && quoteQuery.isError
        ? { title: tl.previewFailedTitle, message: t.purchaseNotSubmitted }
        : null;
  const previewLoading =
    mintInput.kind === "ready" &&
    (!settled || quoteQuery.isFetching) &&
    previewQuote === null;
  const orderPay = previewQuote?.payAmount ?? 0n;
  const hasAmount = previewQuote !== null;
  const required = hasAmount ? requiredTokenBalance(token, orderPay) : 0n;

  let validation: Validation | null = null;
  let insufficient = false;
  if (typedText.trim() !== "" && mintInput.kind === "invalid") {
    validation = {
      title: t.invalidAmountTitle,
      message: mode === "usd" ? tl.invalidUsd : tl.invalidTtti,
    };
  } else if (typedText.trim() !== "" && mintInput.kind === "belowMinimum") {
    validation = {
      title: t.belowMinimumTitle,
      message: tl.errBelowMinimum(formatMintTtti(MINT_MIN_TTTI)),
    };
  } else if (hasAmount && balance !== undefined && balance < required) {
    insufficient = true;
    validation = {
      title: t.insufficientTitle(
        symbol,
        formatPayAmount(descriptor.fee, token),
      ),
      message: t.insufficientMessage(formatPayAmount(required, token)),
    };
  }

  const showIcpPanel = insufficient && token === PayToken.icp;
  const zeroIcp = token === PayToken.icp && balance === 0n && !busy;
  // ckBTC, ckUSDC, ckUSDT: a loaded zero balance shows the transfer offer.
  const zeroToken =
    token !== PayToken.icp && balance === 0n && !busy && selectedAvailable;
  const walletAddress = activePrincipal
    ? encodeAccountText({ owner: activePrincipal })
    : "";
  const canPurchase =
    !!wallet &&
    !closed &&
    selectedAvailable &&
    previewQuote !== null &&
    slippageBps !== null &&
    !validation &&
    !busy;
  // The acknowledgement status is read for the active wallet's principal.
  const ackKnown = !!wallet && ackQuery.data !== undefined;
  const needsAck = !!wallet && ackQuery.data?.accepted === false;
  const allChecked = ACKNOWLEDGEMENTS.every((item) => checked[item.id]);
  const canSubmit = canPurchase && ackKnown && (!needsAck || allChecked);

  const resetAttempt = () => {
    setOutcome(null);
  };

  const handleTokenChange = (next: PayToken) => {
    if (next === token && !btcSelected) return;
    setBtcSelected(false);
    setToken(next);
    setPercent(null);
    setAmount("");
    resetAttempt();
  };

  const handleBtcSelect = () => {
    if (btcSelected) return;
    setBtcSelected(true);
    setToken(PayToken.ckbtc);
    setPercent(null);
    setAmount("");
    resetAttempt();
  };

  // The setup flow's payment choice is read once on arrival (and again each
  // time the flow finishes while this page is mounted), then applied once the
  // wallet and token availability are known; unavailable choices keep ICP.
  const setupChoice = useRef<SetupPayChoice | null | undefined>(undefined);
  const setupChoiceApplied = useRef(false);
  const seenPayChoiceVersion = useRef(payChoiceVersion);
  const availabilityKnown =
    !!wallet && (statusQuery.data !== undefined || statusQuery.isError);
  useEffect(() => {
    if (seenPayChoiceVersion.current !== payChoiceVersion) {
      seenPayChoiceVersion.current = payChoiceVersion;
      setupChoice.current = undefined;
      setupChoiceApplied.current = false;
    }
    if (setupChoiceApplied.current) return;
    if (setupChoice.current === undefined) {
      setupChoice.current = consumePreselectedPayChoice();
    }
    const choice = setupChoice.current;
    if (choice === null) {
      setupChoiceApplied.current = true;
      return;
    }
    if (!availabilityKnown) return;
    setupChoiceApplied.current = true;
    if (choice === BTC_PAY_OPTION.id) {
      if (btcAvailable) handleBtcSelect();
    } else if (choice !== PayToken.icp && tokenAvailable(choice)) {
      handleTokenChange(choice);
    }
  });

  /** Switch mode, carrying the previewed equivalent into the other field. */
  const handleModeChange = (next: OrderMode) => {
    if (next === mode) return;
    if (previewQuote) {
      if (next === "usd") {
        setAmount(unitsInputValue(previewQuote.payUsdE8, 8));
      } else {
        setTttiAmount(unitsInputValue(previewQuote.tttiAmount, TTTI_DECIMALS));
      }
    }
    setPercent(null);
    setMode(next);
    resetAttempt();
  };

  const handlePercent = (value: number) => {
    setPercent(value);
    setMode("ttti");
    resetAttempt();
  };

  const handleMint = async (event: FormEvent) => {
    event.preventDefault();
    if (!wallet || !canSubmit || !previewQuote || slippageBps === null) return;
    const mintToken = token;
    const frozen = previewQuote;
    const tolerance = slippageBps;
    // OISY/NFID: open the wallet window now, from the click, for the calls below.
    const releaseSession = isExternal ? connected.beginSession() : () => {};
    setOutcome(null);
    try {
      if (needsAck) {
        setStep("accepting");
        await acceptAck.mutateAsync();
      }
      setStep("approving");
      const approval = isExternal
        ? await walletApprove.mutateAsync({
            token: mintToken,
            amount: frozen.payAmount,
            balance,
          })
        : await approve.mutateAsync({
            token: mintToken,
            amount: frozen.payAmount,
            balance,
            wallet: "internetIdentity",
          });
      if (!approval.ok) {
        setOutcome({
          kind: "approval",
          token: mintToken,
          message: approval.message,
        });
        return;
      }
      setStep("buying");
      const args: MintArgs = {
        token: mintToken,
        quantity: {
          __kind__: "baseUnits",
          baseUnits: frozen.tttiAmount,
        },
        maxPayAmount: maxPayWithTolerance(frozen.payAmount, tolerance),
        slippageBps: tolerance,
        deadline: mintDeadline(),
      };
      const result = isExternal
        ? await walletMintLiquidity.mutateAsync(args)
        : await mintLiquidity.mutateAsync(args);
      if (result.__kind__ === "ok") {
        setOutcome({ kind: "minted", result: result.ok, token: mintToken });
        setAmount("");
        setTttiAmount("");
        setPercent(null);
      } else {
        setOutcome({ kind: "refused", error: result.err, token: mintToken });
      }
    } catch (error) {
      setOutcome({
        kind: "thrown",
        message: error instanceof Error && error.message ? error.message : null,
      });
    } finally {
      releaseSession();
      setStep("idle");
      void refetchBalance();
    }
  };

  const buyLabel =
    step === "accepting"
      ? t.recordingAcks
      : step === "approving"
        ? t.approving(symbol)
        : step === "buying"
          ? t.buying
          : status?.salesPaused
            ? t.salesPaused
            : !selectedAvailable
              ? t.tokenUnavailable(symbol)
              : t.buyWith(symbol);

  const outcomeAlerts = <MintOutcomeAlerts source={outcomeSource} />;

  const unitSuffix = (text: string) => (
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-mono text-sm font-semibold text-muted-foreground">
      {text}
    </span>
  );

  // Shared by the token form and the BTC panel: asked once, at the first purchase.
  const acknowledgementBlock = (
    <>
      {!!wallet && ackQuery.isLoading && (
        <Skeleton
          className="h-24 w-full"
          data-ocid="exchange.acknowledgements.loading_state"
        />
      )}

      {!!wallet && ackQuery.isError && (
        <Alert
          variant="destructive"
          data-ocid="exchange.acknowledgements.error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.ackStatusUnavailable}</AlertTitle>
          <AlertDescription>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn("mt-1", OUTLINE_BUTTON)}
              onClick={() => void ackQuery.refetch()}
              disabled={ackQuery.isFetching}
              data-ocid="exchange.acknowledgements.retry_button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {needsAck && (
        <fieldset
          className="space-y-1 rounded-lg border border-border bg-background/60 px-3 py-2"
          data-ocid="exchange.acknowledgements.panel"
        >
          <legend className="px-1 text-xs text-muted-foreground">
            {t.ackLegend}
          </legend>
          {ACKNOWLEDGEMENTS.map((item, index) => (
            <label
              key={item.id}
              htmlFor={`exchange-ack-${item.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-sm"
            >
              <input
                id={`exchange-ack-${item.id}`}
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={(event) => {
                  const value = event.target.checked;
                  setChecked((prev) => ({ ...prev, [item.id]: value }));
                }}
                disabled={busy || closed}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
                data-ocid={`exchange.acknowledgement.checkbox.${index + 1}`}
              />
              <span className="min-w-0 text-muted-foreground">
                {t[item.textKey]}
              </span>
            </label>
          ))}
          {site.conflictNotice && (
            <p
              className="px-1 text-xs text-muted-foreground"
              data-ocid="exchange.acknowledgements.conflict_notice"
            >
              {site.conflictNotice}
            </p>
          )}
          <Link
            to="/white-paper"
            hash="reading-notice"
            className="inline-block px-1 pb-1 text-xs font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="exchange.white_paper.link"
          >
            {t.ackWhitePaperLink}
          </Link>
        </fieldset>
      )}
    </>
  );

  const purchaseCard = !wallet ? (
    <Card className={CARD_CLASS} data-ocid="exchange.connect_card">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center">
        <FlatTokenIcon className="h-14 w-14 rounded-full" alt="" />
        <Button
          type="button"
          className={cn(GOLD_BUTTON, "w-full max-w-xs")}
          onClick={openSetup}
          data-ocid="exchange.buy_ttti.primary_button"
        >
          {t.buyTtti}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  ) : (
    <Card className={CARD_CLASS} data-ocid="exchange.form_card">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-display text-xl">{t.buyHeading}</CardTitle>
          <Badge
            variant="outline"
            className="rounded-full border-gold bg-primary/10 text-primary"
            data-ocid="exchange.wallet_badge"
          >
            {wallet === "internetIdentity"
              ? t.walletBuiltIn
              : wallet === "plug"
                ? t.walletPlug
                : connected.name}
          </Badge>
        </div>
        <PayTokenSelector
          value={token}
          onChange={handleTokenChange}
          available={tokenAvailable}
          disabled={busy}
          btc={{
            selected: btcActive,
            onSelect: handleBtcSelect,
            available: btcAvailable,
          }}
        />
        {(btcPending || btcWaiting) && !btcActive && (
          <p
            className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground"
            aria-live="polite"
            data-ocid="exchange.btc_pending.status"
            data-state={btcPending ? "pending" : "waiting"}
          >
            {btcPending ? (
              <Loader2
                className="h-3 w-3 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Clock className="h-3 w-3" aria-hidden="true" />
            )}
            <span>
              {btcPending ? tb.pendingDepositStatus : tb.waitingDepositStatus}
            </span>
            <button
              type="button"
              onClick={handleBtcSelect}
              disabled={busy}
              className="font-medium text-primary underline-offset-4 transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              data-ocid="exchange.btc_pending.link"
            >
              {btcPending ? tb.pendingDepositLink : tb.waitingDepositLink}
            </button>
          </p>
        )}
        {!btcActive && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              {t.balanceLabel(symbol)}
            </span>
            {balanceQuery.isLoading ? (
              <Skeleton
                className="h-5 w-28"
                data-ocid="exchange.balance.loading_state"
              />
            ) : (
              <span
                className="inline-flex items-center gap-2 font-mono font-semibold tabular-nums text-foreground"
                data-ocid="exchange.icp_balance"
              >
                {balanceQuery.isFetching && (
                  <Loader2
                    className="h-3 w-3 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                {balance !== undefined ? (
                  <>
                    {formatPayAmount(balance, token)}
                    <FiatAmount
                      token={token}
                      amount={balance}
                      ocid="exchange.balance.fiat"
                    />
                  </>
                ) : (
                  t.unavailable
                )}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {btcActive ? (
          <BtcPurchasePanel
            acknowledgements={acknowledgementBlock}
            ackKnown={ackKnown}
            needsAck={needsAck}
            allChecked={allChecked}
            onAccept={() => acceptAck.mutateAsync()}
            closed={closed}
            closedLabel={status?.complete ? t.saleComplete : t.salesPaused}
          />
        ) : (
          <>
            {!selectedAvailable && !statusQuery.isLoading && (
              <Alert data-ocid="exchange.token_unavailable_state">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t.tokenUnavailable(symbol)}</AlertTitle>
                <AlertDescription>{t.noTreasury(symbol)}</AlertDescription>
              </Alert>
            )}
            {zeroIcp && !closed ? (
              <>
                <ZeroBalanceTransferOffer symbol={symbol} />
                <GetIcpFirstPanel address={walletAddress} balanceE8s={0n} />
                {outcomeAlerts}
              </>
            ) : zeroToken && !closed ? (
              <>
                <ZeroBalanceTransferOffer
                  symbol={symbol}
                  address={walletAddress}
                />
                {outcomeAlerts}
              </>
            ) : (
              <form onSubmit={handleMint} className="space-y-4" noValidate>
                <OrderModeToggle
                  mode={mode}
                  onChange={handleModeChange}
                  disabled={closed || busy}
                />
                <div className="space-y-2">
                  <Label
                    htmlFor="mint-amount"
                    className="text-muted-foreground"
                  >
                    {mode === "usd" ? tl.usdLabel : tl.tttiLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="mint-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder={mode === "usd" ? "0.00" : "0.0001"}
                      value={typedText}
                      onChange={(e) => {
                        setPercent(null);
                        if (mode === "usd") setAmount(e.target.value);
                        else setTttiAmount(e.target.value);
                        resetAttempt();
                      }}
                      disabled={closed || busy}
                      autoComplete="off"
                      className={cn(AMOUNT_INPUT, "pr-24")}
                      aria-invalid={!!validation}
                      aria-describedby="mint-amount-hint"
                      data-ocid={
                        mode === "usd"
                          ? "exchange.amount_input"
                          : "exchange.ttti_amount_input"
                      }
                    />
                    {unitSuffix(mode === "usd" ? "USD" : DISPLAY_SYMBOL)}
                  </div>
                  <p
                    id="mint-amount-hint"
                    className="px-1 text-xs text-muted-foreground"
                  >
                    {mode === "usd" ? tl.usdHint : tl.tttiHint}
                  </p>
                </div>

                <MintPaymentBreakdown
                  token={token}
                  quote={previewQuote}
                  loading={previewLoading}
                  error={previewError}
                />

                <WalletPercentBar
                  token={token}
                  balance={balance}
                  walletConnected={!!wallet}
                  percent={percent}
                  currentAmount={orderPay}
                  disabled={closed || busy}
                  quote={(pay) =>
                    priceAvailable
                      ? tttiFromUsdPayment(
                          usdFromTokenAmount(pay, decimals, price),
                        )
                      : null
                  }
                  onSelect={handlePercent}
                />

                <SlippageField
                  value={slippageText}
                  onChange={(text, bps) => {
                    setSlippageText(text);
                    setSlippageBps(bps);
                    resetAttempt();
                  }}
                  disabled={closed || busy}
                  ocidPrefix="exchange.slippage"
                />
                {previewQuote && slippageBps !== null && (
                  <p
                    className="px-1 text-xs tabular-nums text-muted-foreground"
                    data-ocid="exchange.max_pay"
                  >
                    {tl.maxPayLabel}:{" "}
                    <span className="font-mono text-foreground">
                      {formatPayAmount(
                        maxPayWithTolerance(
                          previewQuote.payAmount,
                          slippageBps,
                        ),
                        token,
                      )}
                    </span>{" "}
                    <FiatAmount
                      token={token}
                      amount={maxPayWithTolerance(
                        previewQuote.payAmount,
                        slippageBps,
                      )}
                      ocid="exchange.max_pay.fiat"
                    />
                    . {tl.expiryNote}
                  </p>
                )}

                {validation && !showIcpPanel && (
                  <Alert
                    variant="destructive"
                    data-ocid="exchange.validation_error"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{validation.title}</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>{validation.message}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {showIcpPanel && balance !== undefined && (
                  <GetIcpFirstPanel
                    address={walletAddress}
                    balanceE8s={balance}
                    requiredE8s={required}
                  />
                )}

                {outcomeAlerts}

                {acknowledgementBlock}

                {canPurchase && needsAck && !allChecked && (
                  <p
                    className="text-xs text-muted-foreground"
                    data-ocid="exchange.acknowledgements.hint"
                  >
                    {t.ackTickAll}
                  </p>
                )}

                <Button
                  type="submit"
                  className={cn(GOLD_BUTTON, "w-full")}
                  disabled={!canSubmit}
                  aria-busy={busy}
                  data-ocid="exchange.submit_button"
                >
                  {busy && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      data-ocid="exchange.loading_state"
                    />
                  )}
                  {buyLabel}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div
      className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-10"
      data-ocid="exchange.page"
    >
      <header className="space-y-3">
        <h1 className="text-imperial text-gradient-gold text-3xl font-bold md:text-5xl">
          {t.title(DISPLAY_SYMBOL)}
        </h1>
        <p
          className="max-w-3xl text-sm text-muted-foreground"
          data-ocid="exchange.price_statement"
        >
          {tl.priceStatement}
        </p>
        <p className="text-xs text-muted-foreground">{t.noExtraTaken}</p>
        <p
          className="text-xs text-muted-foreground"
          data-ocid="exchange.token_identity_note"
        >
          {t.shownAs(TTTI_SYMBOL)}
        </p>
        <div className="divider-gold max-w-xs" />
      </header>

      {wallet === "internetIdentity" && iiAddress.data === null && (
        <MigrationNotice />
      )}

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
          {purchaseCard}
          <div className="-mt-3 px-1" data-ocid="exchange.mint_info.section">
            <button
              type="button"
              onClick={() => setMintInfoOpen((open) => !open)}
              aria-expanded={mintInfoOpen}
              aria-controls="exchange-mint-info"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="exchange.mint_info.toggle"
            >
              {t.mintInfoToggle}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  mintInfoOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {mintInfoOpen && (
              <div
                id="exchange-mint-info"
                className="mt-2 max-w-3xl space-y-2 text-xs text-muted-foreground"
                data-ocid="exchange.mint_info.panel"
              >
                <p>{t.mintInfoBody1}</p>
                <p>{t.mintInfoBody2}</p>
                <p>{plain.chance}</p>
                <p>
                  <span className="font-medium">{plain.zapTitle}. </span>
                  {plain.zap}
                </p>
                <p>
                  <span className="font-medium">{plain.guaranteeTitle}. </span>
                  {plain.guarantee}
                </p>
              </div>
            )}
          </div>
          {wallet && (
            <DeliveryAddressCard
              key={wallet}
              wallet={wallet}
              walletPrincipal={externalPrincipal}
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <PresaleProgress status={status} isLoading={statusQuery.isLoading} />
          <TokenRateCard
            token={token}
            rate={rate}
            rateLine={rateLine}
            priceAvailable={priceAvailable}
            isLoading={statusQuery.isLoading}
            oneTokenBuys={
              priceAvailable
                ? tttiFromUsdPayment(
                    usdFromTokenAmount(
                      10n ** BigInt(decimals),
                      decimals,
                      price,
                    ),
                  )
                : null
            }
            feeLabel={feeLabel}
            minimumText={formatMintTtti(MINT_MIN_TTTI)}
            className={CARD_CLASS}
          />
          <PoolCapRatio className={CARD_CLASS} />
        </aside>
      </div>
    </div>
  );
}
