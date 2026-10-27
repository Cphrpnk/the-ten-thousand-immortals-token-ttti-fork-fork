import type { Principal } from "@icp-sdk/core/principal";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Account } from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { BtcToCkbtcPanel } from "../components/wallet/BtcToCkbtcPanel";
import { DeliveryAddressReminder } from "../components/wallet/DeliveryAddressReminder";
import { PurchaseHistorySection } from "../components/wallet/PurchaseHistorySection";
import { TokenList } from "../components/wallet/TokenList";
import { TttiMovements } from "../components/wallet/TttiMovements";
import {
  type WalletDialogState,
  WalletDialogs,
} from "../components/wallet/WalletDialogs";
import { WalletSummary } from "../components/wallet/WalletSummary";
import { useTokenUsdRates } from "../components/wallet/valuation";
import {
  WALLET_BTC_HASH,
  WALLET_RECEIVE_HASH_PREFIX,
} from "../hooks/useBuyFunnel";
import { useConnectedWallet } from "../hooks/useConnectedWallet";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBtcWalletDepositsFor,
  useGetBtcWalletAddress,
  useGetBtcWalletAddressFor,
  useMyBtcDeposits,
} from "../hooks/useQueries";
import { useListTokens } from "../hooks/useWallet";
import { pickDict, useDict } from "../i18n/core";
import { WALLET_BUY_TEXT } from "../i18n/pages/swap";
import { WALLET_TEXT } from "../i18n/pages/wallet";
import { ONRAMPER_BUY_URL, copyAddressAndOpenOnramper } from "../lib/onramper";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDT_LEDGER_CANISTER_ID,
  ICP_LEDGER_ID,
  encodeAccountText,
} from "../lib/token";
import type { TokenDescriptor } from "../lib/tokenRegistry";

const NO_TOKENS: Array<TokenDescriptor> = [];

const PRIMARY_GOLD =
  "rounded-lg shadow-gold transition-smooth hover:brightness-110";
const OUTLINE_GOLD =
  "rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 22) return principal;
  return `${principal.slice(0, 12)}…${principal.slice(-6)}`;
}

export function WalletPage() {
  const t = useDict(WALLET_TEXT);
  const tbuy = useDict(WALLET_BUY_TEXT);
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const {
    kind: walletKind,
    principal: walletPrincipal,
    name: walletName,
    connectingKind,
    plugAvailable,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useConnectedWallet();
  const walletConnecting = connectingKind !== null;

  const iiPrincipal = identity?.getPrincipal() ?? null;
  const activePrincipal: Principal | null = walletPrincipal ?? iiPrincipal;
  const activeSource =
    walletPrincipal && walletName
      ? walletName
      : iiPrincipal
        ? "Internet Identity"
        : null;
  const account: Account | undefined = activePrincipal
    ? { owner: activePrincipal }
    : undefined;
  const accountText = account ? encodeAccountText(account) : "";

  const {
    data: tokens,
    isLoading: tokensLoading,
    isError: tokensError,
    failureCount: tokensFailureCount,
    isFetching: tokensFetching,
    refetch: refetchTokens,
  } = useListTokens();
  const tokensUnavailable =
    tokensError || (tokens === undefined && tokensFailureCount > 0);
  const tokenList = tokens ?? NO_TOKENS;
  const rates = useTokenUsdRates(tokenList);
  const [dialog, setDialog] = useState<WalletDialogState>(null);
  const [copied, setCopied] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<{ id: string } | null>(null);
  const [btcArrival, setBtcArrival] = useState(false);
  const [stableNote, setStableNote] = useState<string | null>(null);
  const navigate = useNavigate();
  const hash = useLocation({ select: (loc) => loc.hash });

  // Arrival signals: wallet-tokens (kept in the URL), wallet-btc and
  // receive-<ledgerId> (from setup step 3, consumed then cleared).
  useEffect(() => {
    if (hash === "wallet-tokens") {
      setScrollTarget({ id: "wallet-tokens" });
      return;
    }
    if (hash === WALLET_BTC_HASH) {
      setBtcArrival(true);
      setScrollTarget({ id: WALLET_BTC_HASH });
      void navigate({ to: "/wallet", replace: true });
      return;
    }
    if (!hash.startsWith(WALLET_RECEIVE_HASH_PREFIX)) return;
    if (tokens === undefined && !tokensUnavailable) return;
    const tokenId = hash.slice(WALLET_RECEIVE_HASH_PREFIX.length);
    const known = (tokens ?? NO_TOKENS).some(
      (tk) => tk.canisterId.toText() === tokenId,
    );
    setDialog({ kind: "receive", tokenId: known ? tokenId : undefined });
    void navigate({ to: "/wallet", replace: true });
  }, [hash, tokens, tokensUnavailable, navigate]);

  useEffect(() => {
    if (!scrollTarget) return;
    let frame = 0;
    const deadline = performance.now() + 2000;
    const tryScroll = () => {
      const target = document.getElementById(scrollTarget.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (performance.now() < deadline) {
        frame = requestAnimationFrame(tryScroll);
      }
    };
    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [scrollTarget]);

  const handleBuyIcp = () => {
    void copyAddressAndOpenOnramper(accountText).then((ok) => {
      if (ok) toast.success(pickDict(WALLET_TEXT).toastBuyCopied);
      else toast.error(pickDict(WALLET_TEXT).toastCopyFailed);
    });
  };

  // Personal BTC address (stable), when already known for the active account.
  const iiBtc = useMyBtcDeposits(!walletPrincipal);
  const externalBtc = useBtcWalletDepositsFor(walletPrincipal ?? undefined);
  const iiGetBtc = useGetBtcWalletAddress();
  const externalGetBtc = useGetBtcWalletAddressFor(
    walletPrincipal ?? undefined,
  );
  const knownBtcAddress = walletPrincipal
    ? (externalBtc.data?.btcAddress ?? externalGetBtc.data?.btcAddress)
    : (iiBtc.data?.wallet?.btcAddress ?? iiGetBtc.data?.btcAddress);

  // Fetch the (stable) personal BTC address ahead of the Buy click, so the
  // clipboard write can happen inside the click gesture.
  const prefetchBtcAddress = () => {
    if (knownBtcAddress) return;
    if (walletPrincipal) {
      if (!externalGetBtc.isPending) externalGetBtc.mutate();
    } else if (iiPrincipal && !iiGetBtc.isPending) {
      iiGetBtc.mutate();
    }
  };

  const handleSelectToken = (tokenId: string | null) => {
    if (tokenId === CKBTC_LEDGER_CANISTER_ID) prefetchBtcAddress();
  };

  const handleBuy = (tokenId: string) => {
    if (tokenId === CKBTC_LEDGER_CANISTER_ID) {
      setStableNote(null);
      if (knownBtcAddress) {
        void copyAddressAndOpenOnramper(knownBtcAddress).then((ok) => {
          if (ok) toast.success(pickDict(WALLET_BUY_TEXT).btcCopied);
          else toast.error(pickDict(WALLET_TEXT).toastCopyFailed);
        });
      } else {
        prefetchBtcAddress();
        window.open(ONRAMPER_BUY_URL, "_blank", "noopener,noreferrer");
        toast.info(pickDict(WALLET_BUY_TEXT).btcPending);
      }
      setBtcArrival(true);
      setScrollTarget({ id: WALLET_BTC_HASH });
      return;
    }
    handleBuyIcp();
    setStableNote(
      tokenId === CKUSDC_LEDGER_CANISTER_ID ||
        tokenId === CKUSDT_LEDGER_CANISTER_ID
        ? tokenId
        : null,
    );
  };

  const stableToken = stableNote
    ? tokenList.find((tk) => tk.canisterId.toText() === stableNote)
    : undefined;

  const openBuyback = (purchaseId?: bigint) =>
    setDialog({ kind: "buyback", purchaseId });

  const handleCopy = async () => {
    if (!accountText) return;
    try {
      await navigator.clipboard.writeText(accountText);
      setCopied(true);
      toast.success(pickDict(WALLET_TEXT).toastAccountCopiedClipboard);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(pickDict(WALLET_TEXT).toastCopyFailed);
    }
  };

  const handleConnectPlug = async () => {
    try {
      await connectWallet("plug");
      toast.success(pickDict(WALLET_TEXT).toastPlugConnected);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : pickDict(WALLET_TEXT).toastPlugConnectFailed,
      );
    }
  };

  const handleDisconnectWallet = async () => {
    const name = walletName ?? "Plug";
    await disconnectWallet();
    toast.success(
      walletKind === "plug"
        ? pickDict(WALLET_TEXT).toastPlugDisconnected
        : pickDict(WALLET_TEXT).toastWalletDisconnected(name),
    );
  };

  const handleAuth = async () => {
    if (iiPrincipal) {
      await clear();
      toast.success(pickDict(WALLET_TEXT).toastIiSignedOut);
    } else {
      await login();
    }
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12" data-ocid="wallet.page">
      <div className="flex flex-col gap-2">
        <h1 className="text-imperial text-gradient-gold text-3xl leading-tight md:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.intro}</p>
      </div>

      <WalletSummary
        tokens={tokenList}
        account={account}
        rates={rates}
        onReceive={() => setDialog({ kind: "receive" })}
        onSend={() => setDialog({ kind: "send" })}
        onSwap={() => setDialog({ kind: "swap" })}
      />

      <DeliveryAddressReminder enabled={!!activePrincipal} />

      <Card className="rounded-lg border-gold bg-card shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <WalletIcon className="h-5 w-5 text-primary" />
            {t.activeIdentity}
          </CardTitle>
          <CardDescription>
            {activeSource ? t.connectedWith(activeSource) : t.noWalletYet}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t.account}
              </p>
              <p
                className="truncate font-mono text-sm"
                title={accountText || undefined}
                data-ocid="wallet.principal"
              >
                {accountText ? truncatePrincipal(accountText) : t.notConnected}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeSource && (
                <Badge
                  variant="secondary"
                  className="rounded-full border-gold font-mono text-primary"
                >
                  {activeSource}
                </Badge>
              )}
              {activePrincipal && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={OUTLINE_GOLD}
                  onClick={handleCopy}
                  data-ocid="wallet.copy_button"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {t.copy}
                </Button>
              )}
            </div>
          </div>

          <Separator className="divider-gold bg-transparent" />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant={iiPrincipal ? "outline" : "default"}
              onClick={handleAuth}
              disabled={loginStatus === "logging-in"}
              className={iiPrincipal ? OUTLINE_GOLD : PRIMARY_GOLD}
              data-ocid="wallet.ii_button"
            >
              {loginStatus === "logging-in" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : iiPrincipal ? (
                <LogOut className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {iiPrincipal ? t.signOutIi : t.connectIi}
            </Button>

            <Button
              type="button"
              variant={walletPrincipal ? "destructive" : "default"}
              onClick={
                walletPrincipal ? handleDisconnectWallet : handleConnectPlug
              }
              disabled={
                walletConnecting || (!walletPrincipal && !plugAvailable)
              }
              className={
                walletPrincipal ? "rounded-lg transition-smooth" : PRIMARY_GOLD
              }
              data-ocid="wallet.plug_button"
            >
              {walletConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : walletPrincipal ? (
                <LogOut className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {walletPrincipal
                ? walletKind === "plug"
                  ? t.disconnectPlug
                  : t.disconnectWallet(walletName ?? "")
                : t.connectPlug}
            </Button>
          </div>

          {!plugAvailable && !walletPrincipal && (
            <p className="text-xs text-muted-foreground">{t.plugNotDetected}</p>
          )}
        </CardContent>
      </Card>

      <section
        id="wallet-tokens"
        className="flex scroll-mt-24 flex-col gap-4 md:gap-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-imperial text-xl text-foreground md:text-2xl">
            {t.tokens}
          </h2>
          {activePrincipal && (
            <span className="max-w-[50%] truncate font-mono text-xs text-muted-foreground">
              {truncatePrincipal(activePrincipal.toText())}
            </span>
          )}
        </div>

        {tokensUnavailable ? (
          <Card
            className="rounded-lg border-dashed border-gold bg-card"
            data-ocid="wallet.tokens_error_state"
          >
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <p
                className="flex items-center gap-2 text-sm text-destructive"
                aria-live="polite"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {t.tokensUnavailable}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={OUTLINE_GOLD}
                onClick={() => void refetchTokens()}
                disabled={tokensFetching}
                data-ocid="wallet.tokens_retry_button"
              >
                <RefreshCw
                  className={`h-4 w-4 ${tokensFetching ? "animate-spin" : ""}`}
                />
                {t.retry}
              </Button>
            </CardContent>
          </Card>
        ) : tokensLoading ? (
          <Card className="rounded-lg border-gold bg-card shadow-subtle">
            <CardContent className="flex flex-col gap-2 p-2 sm:p-3">
              {Array.from({ length: 5 }, (_, i) => `wallet-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-16 w-full rounded-lg" />
                ),
              )}
            </CardContent>
          </Card>
        ) : tokenList.length === 0 ? (
          <Card
            className="rounded-lg border-dashed border-gold bg-card"
            data-ocid="wallet.empty_state"
          >
            <CardContent className="py-10 text-center text-muted-foreground">
              {t.noTokens}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-lg border-gold bg-card shadow-subtle">
            <CardContent className="p-2 sm:p-3">
              <TokenList
                tokens={tokenList}
                account={account}
                rates={rates}
                onSend={(tokenId) => setDialog({ kind: "send", tokenId })}
                onReceive={(tokenId) => setDialog({ kind: "receive", tokenId })}
                onHistory={(tokenId) => setDialog({ kind: "history", tokenId })}
                onBuyback={() => setDialog({ kind: "buyback" })}
                onBuy={accountText ? handleBuy : undefined}
                onSelect={handleSelectToken}
              />
            </CardContent>
          </Card>
        )}
        {stableToken && (
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            data-ocid="wallet.buy_stable.note"
          >
            <p className="min-w-0 flex-1">
              {tbuy.stableNote(stableToken.symbol)}
            </p>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-primary"
              onClick={() =>
                setDialog({
                  kind: "swap",
                  from: ICP_LEDGER_ID,
                  to: stableToken.canisterId.toText(),
                })
              }
              data-ocid="wallet.buy_stable.swap_link"
            >
              {tbuy.stableNoteLink(stableToken.symbol)}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setStableNote(null)}
              aria-label={tbuy.close}
              title={tbuy.close}
              data-ocid="wallet.buy_stable.close_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      {activePrincipal ? (
        <BtcToCkbtcPanel
          key={activePrincipal.toText()}
          requestAddress={btcArrival}
        />
      ) : null}

      <section
        className="flex flex-col gap-4 md:gap-6"
        data-ocid="wallet.wallet_history.section"
      >
        <h2 className="text-imperial text-xl text-foreground md:text-2xl">
          {t.walletHistoryTitle}
        </h2>
        <TttiMovements account={account} />
        {iiPrincipal && <PurchaseHistorySection onBuyback={openBuyback} />}
      </section>

      <WalletDialogs
        state={dialog}
        onClose={() => setDialog(null)}
        tokens={tokenList}
        account={account}
        hasIi={!!iiPrincipal}
        onBuyback={openBuyback}
      />
    </div>
  );
}
