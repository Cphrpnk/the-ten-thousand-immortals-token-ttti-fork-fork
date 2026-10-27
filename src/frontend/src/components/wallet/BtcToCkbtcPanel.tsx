import { AlertTriangle, Bitcoin, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Account,
  DepositKind,
  type DepositTracking,
  PayToken,
} from "../../backend";
import { useConnectedWallet } from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  btcAddressShownBefore,
  depositCkbtcMintBlock,
  depositTxids,
  isDepositTerminal,
  rememberBtcAddressShown,
  useBtcDepositInfo,
  useBtcWalletDepositsFor,
  useCheckBtcWalletDeposit,
  useCheckBtcWalletDepositFor,
  useDepositView,
  useGetBtcWalletAddress,
  useGetBtcWalletAddressFor,
  useMyBtcDeposits,
  usePayTokenBalance,
  useRefreshOnDepositProgress,
} from "../../hooks/useQueries";
import { useDict } from "../../i18n/core";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import {
  BTC_DEFAULT_DEPOSIT_MIN_SATS,
  BTC_DEFAULT_MIN_CONFIRMATIONS,
  formatSats,
} from "../../lib/token";
import { BtcDepositAddressCard } from "../btc/BtcDepositAddressCard";
import { BtcDepositProgress } from "../btc/BtcDepositProgress";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface BtcToCkbtcPanelProps {
  /** Request the personal BTC address once when none exists yet (setup step 3). */
  requestAddress?: boolean;
}

/** Checks for a new transfer once every deposit is final. */
const IDLE_CHECK_MS = 60_000;

/** Progress rank of a tracking: more txids, minted sats or a known mint block rank higher. */
function progressRank(tracking: DepositTracking): bigint {
  return (
    (tracking.lastCheckedAt ?? tracking.createdAt) * 4n +
    BigInt(Math.min(depositTxids(tracking).length, 1)) +
    (depositCkbtcMintBlock(tracking) === null ? 0n : 2n)
  );
}

/**
 * Most recent wallet tracking among the persisted query and the latest
 * get/check results, so txids and the ckBTC mint block show as soon as known.
 */
function freshestTracking(
  candidates: Array<DepositTracking | undefined>,
): DepositTracking | undefined {
  let best: DepositTracking | undefined;
  for (const candidate of candidates) {
    if (candidate === undefined) continue;
    if (candidate.kind !== DepositKind.wallet) continue;
    if (best === undefined) {
      best = candidate;
      continue;
    }
    if (candidate.btcAddress !== best.btcAddress) continue;
    if (progressRank(candidate) > progressRank(best)) best = candidate;
  }
  return best;
}

/** BTC → ckBTC conversion into the active wallet (built-in or external). */
export function BtcToCkbtcPanel({ requestAddress }: BtcToCkbtcPanelProps) {
  const t = useDict(WALLET_TEXT);
  const { principal: externalPrincipal, name: walletName } =
    useConnectedWallet();
  // External wallets (Plug, OISY, NFID) use the unsigned *For calls.
  const owner = externalPrincipal ?? undefined;
  const external = owner !== undefined;
  const { identity } = useInternetIdentity();
  const principalText = external
    ? owner.toText()
    : identity?.getPrincipal().toText();
  const { data: info } = useBtcDepositInfo();
  const mine = useMyBtcDeposits(!external);
  const forOwner = useBtcWalletDepositsFor(owner);
  const iiGetAddress = useGetBtcWalletAddress();
  const iiCheck = useCheckBtcWalletDeposit();
  const ownerGetAddress = useGetBtcWalletAddressFor(owner);
  const ownerCheck = useCheckBtcWalletDepositFor(owner);
  const getAddress = external ? ownerGetAddress : iiGetAddress;
  const check = external ? ownerCheck : iiCheck;
  const isLoading = external ? !forOwner.isFetched : mine.isLoading;
  const deposits = external ? undefined : mine.data;
  const [autoError, setAutoError] = useState<string | null>(null);

  const tracking = freshestTracking([
    external ? (forOwner.data ?? undefined) : deposits?.wallet,
    check.data,
    getAddress.data,
  ]);
  const view = useDepositView(tracking);
  const hasTracking = tracking !== undefined;
  const settled = tracking !== undefined && isDepositTerminal(tracking);
  const minSats = info?.depositMinSats ?? BTC_DEFAULT_DEPOSIT_MIN_SATS;
  const confirmations = info?.minConfirmations ?? BTC_DEFAULT_MIN_CONFIRMATIONS;
  const pollMs = Math.max(
    Number(info?.suggestedPollSeconds ?? 60n) * 1000,
    30_000,
  );
  // Slower checks for a new transfer once every deposit is final.
  const intervalMs = settled ? Math.max(pollMs, IDLE_CHECK_MS) : pollMs;

  // The ckBTC land in the external wallet's own account.
  const ownerAccount: Account | undefined = owner ? { owner } : undefined;
  const ownerBalance = usePayTokenBalance(PayToken.ckbtc, ownerAccount);

  const checkRef = useRef(check);
  checkRef.current = check;
  const firstRunRef = useRef(true);

  // Automatic checks while the panel is open, also for a new transfer.
  useEffect(() => {
    if (!hasTracking) return;
    const run = () => {
      if (document.visibilityState !== "visible") return;
      if (checkRef.current.isPending) return;
      checkRef.current.mutate(undefined, {
        onSuccess: () => setAutoError(null),
        onError: (error) => setAutoError(error.message),
      });
    };
    if (firstRunRef.current) {
      firstRunRef.current = false;
      run();
    }
    const timer = window.setInterval(run, intervalMs);
    return () => window.clearInterval(timer);
  }, [hasTracking, intervalMs]);

  // Refresh balances and history on new deposits, mints and settled purchases.
  useRefreshOnDepositProgress(tracking);
  useRefreshOnDepositProgress(deposits?.purchase);

  // Setup step 3, or back on the page before any deposit: fetch the (stable)
  // personal address once, so it shows and the automatic checks resume.
  const { mutate: requestBtcAddress, isPending: addressPending } = getAddress;
  const addressRequestedRef = useRef(false);
  useEffect(() => {
    if (addressRequestedRef.current) return;
    if (!requestAddress && !btcAddressShownBefore("wallet", principalText)) {
      return;
    }
    if (isLoading || hasTracking || addressPending) return;
    addressRequestedRef.current = true;
    requestBtcAddress(undefined, {
      onSuccess: () => rememberBtcAddressShown("wallet", principalText),
      onError: (error) => toast.error(error.message),
    });
  }, [
    requestAddress,
    principalText,
    isLoading,
    hasTracking,
    addressPending,
    requestBtcAddress,
  ]);

  const handleGetAddress = () => {
    getAddress.mutate(undefined, {
      onSuccess: () => rememberBtcAddressShown("wallet", principalText),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleCheck = () => {
    check.mutate(undefined, {
      onSuccess: () => setAutoError(null),
      onError: (error) => toast.error(error.message),
    });
  };

  const fact = t.btcFact(formatSats(minSats), confirmations.toString());

  return (
    <Card
      id="wallet-btc"
      className="scroll-mt-24 rounded-lg border-gold bg-card shadow-subtle"
      data-ocid="wallet.btc.panel"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Bitcoin className="h-5 w-5 text-primary" />
          BTC → ckBTC
        </CardTitle>
        <CardDescription data-ocid="wallet.btc.fact">{fact}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {external && walletName && !tracking ? (
          <p className="text-xs text-muted-foreground">
            {t.btcCreditedTo(walletName)}
          </p>
        ) : null}

        {isLoading ? (
          <Skeleton
            className="h-44 w-full rounded-lg"
            data-ocid="wallet.btc.loading_state"
          />
        ) : tracking ? (
          <>
            <BtcDepositAddressCard
              address={tracking.btcAddress}
              label={t.btcAddressLabel}
              ocidPrefix="wallet.btc.address"
              kind={tracking.kind}
            />
            <BtcDepositProgress
              tracking={tracking}
              onCheck={handleCheck}
              checking={check.isPending}
              view={view}
              ocidPrefix="wallet.btc"
            />
            {external && walletName ? (
              <div
                className="flex flex-col gap-2 rounded-lg border border-gold bg-primary/10 px-4 py-3 text-sm"
                data-ocid="wallet.btc.internal_wallet.panel"
              >
                <p className="text-foreground">{t.btcCreditedTo(walletName)}</p>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t.btcWalletBalance(walletName)}
                  </span>
                  {ownerBalance.isLoading ? (
                    <Skeleton
                      className="h-5 w-28"
                      data-ocid="wallet.btc.internal_balance.loading_state"
                    />
                  ) : (
                    <span
                      className="font-mono font-semibold tabular-nums text-foreground"
                      data-ocid="wallet.btc.internal_balance"
                    >
                      {ownerBalance.data !== undefined
                        ? formatSats(ownerBalance.data, "ckBTC")
                        : t.btcBalanceUnavailable}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
            {autoError ? (
              <p
                className="flex items-start gap-2 text-sm text-destructive"
                aria-live="polite"
                data-ocid="wallet.btc.error_state"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {autoError}
              </p>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <Button
              type="button"
              onClick={handleGetAddress}
              disabled={getAddress.isPending}
              className="rounded-lg shadow-gold transition-smooth hover:brightness-110"
              data-ocid="wallet.btc.get_address_button"
            >
              {getAddress.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Bitcoin className="h-4 w-4" />
              )}
              {t.btcGetAddress}
            </Button>
            {getAddress.isError ? (
              <p
                className="text-sm text-destructive"
                aria-live="polite"
                data-ocid="wallet.btc.address_error_state"
              >
                {getAddress.error.message}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
