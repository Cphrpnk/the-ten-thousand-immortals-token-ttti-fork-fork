import { AlertTriangle, Bitcoin, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Account,
  DepositKind,
  type DepositTracking,
  PayToken,
} from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  depositCkbtcMintBlock,
  depositTxids,
  isDepositTerminal,
  useBtcDepositInfo,
  useCheckBtcWalletDeposit,
  useDepositView,
  useGetBtcWalletAddress,
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
  /** True when the balances shown above belong to another wallet (Plug). */
  otherWalletActive?: boolean;
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

/** BTC → ckBTC conversion into the signed-in user's own wallet. */
export function BtcToCkbtcPanel({ otherWalletActive }: BtcToCkbtcPanelProps) {
  const t = useDict(WALLET_TEXT);
  const { identity } = useInternetIdentity();
  const { data: info } = useBtcDepositInfo();
  const { data: deposits, isLoading } = useMyBtcDeposits();
  const getAddress = useGetBtcWalletAddress();
  const check = useCheckBtcWalletDeposit();
  const [autoError, setAutoError] = useState<string | null>(null);

  const tracking = freshestTracking([
    deposits?.wallet,
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

  // The ckBTC land in the internal (Internet Identity) wallet.
  const iiPrincipal = identity?.getPrincipal();
  const iiAccount: Account | undefined = iiPrincipal
    ? { owner: iiPrincipal }
    : undefined;
  const iiBalance = usePayTokenBalance(
    PayToken.ckbtc,
    otherWalletActive ? iiAccount : undefined,
  );

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

  const handleGetAddress = () => {
    getAddress.mutate(undefined, {
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
      className="rounded-lg border-gold bg-card shadow-subtle"
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
        {otherWalletActive && !tracking ? (
          <p className="text-xs text-muted-foreground">{t.btcCreditedToIi}</p>
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
            {otherWalletActive ? (
              <div
                className="flex flex-col gap-2 rounded-lg border border-gold bg-primary/10 px-4 py-3 text-sm"
                data-ocid="wallet.btc.internal_wallet.panel"
              >
                <p className="text-foreground">{t.btcCreditedToIi}</p>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">
                    {t.btcInternalBalance}
                  </span>
                  {iiBalance.isLoading ? (
                    <Skeleton
                      className="h-5 w-28"
                      data-ocid="wallet.btc.internal_balance.loading_state"
                    />
                  ) : (
                    <span
                      className="font-mono font-semibold tabular-nums text-foreground"
                      data-ocid="wallet.btc.internal_balance"
                    >
                      {iiBalance.data !== undefined
                        ? formatSats(iiBalance.data, "ckBTC")
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
