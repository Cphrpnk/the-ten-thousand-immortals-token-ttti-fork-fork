import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownLeft,
  CreditCard,
  History,
  RefreshCw,
  Send,
  Undo2,
} from "lucide-react";
import type { Account } from "../../backend";
import { useWalletBalance } from "../../hooks/useWallet";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import { formatUnits } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { isTttiToken } from "./TokenBalanceCard";
import { TokenLogo } from "./TokenLogo";
import {
  NO_VALUE,
  formatUnitPrice,
  formatUsdValue,
  usdValueE8,
} from "./valuation";

const ACTION_BUTTON =
  "min-h-11 flex-1 rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground sm:min-h-9 sm:flex-none";

interface TokenRowProps {
  token: TokenDescriptor;
  account: Account | undefined;
  rateUsdE8: bigint | null;
  index: number;
  selected: boolean;
  onToggle: () => void;
  onSend: () => void;
  onReceive: () => void;
  onHistory: () => void;
  /** Buyback action; shown on the TTTI-T card only. */
  onBuyback?: () => void;
  /** Buy via Onramper; given for the ICP, ckBTC, ckUSDC and ckUSDT cards. */
  onBuy?: () => void;
}

export function TokenRow({
  token,
  account,
  rateUsdE8,
  index,
  selected,
  onToggle,
  onSend,
  onReceive,
  onHistory,
  onBuyback,
  onBuy,
}: TokenRowProps) {
  const t = useDict(WALLET_TEXT);
  const tb = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const id = token.canisterId.toText();
  const actionsId = `token-actions-${index}`;
  const { data, isError, failureCount, refetch, isFetching } = useWalletBalance(
    token.canisterId,
    account,
  );
  // Leave the placeholder as soon as one attempt fails, even while the
  // query keeps retrying in the background.
  const unavailable =
    !!account && (isError || (data === undefined && failureCount > 0));
  const value =
    data !== undefined && rateUsdE8 !== null
      ? usdValueE8(data, token.decimals, rateUsdE8)
      : null;

  return (
    <li
      data-token-row={id}
      className={cn(
        "rounded-lg border transition-smooth",
        selected
          ? "border-gold-strong bg-primary/5 shadow-gold"
          : "border-transparent hover:border-gold hover:bg-muted/40",
      )}
      data-ocid={`wallet.item.${index}`}
    >
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={selected}
          aria-controls={selected ? actionsId : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          data-ocid={`wallet.row.${index}`}
        >
          <TokenLogo canisterId={id} symbol={token.symbol} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-foreground">
                {token.symbol}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {rateUsdE8 === null
                  ? NO_VALUE
                  : formatUnitPrice(rateUsdE8, lang)}
                {isTttiToken(token) && rateUsdE8 !== null && (
                  <span className="ml-1">({t.calculationValue})</span>
                )}
              </span>
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {token.name}
            </span>
          </span>
          <span className="flex min-w-0 max-w-[45%] shrink-0 flex-col items-end text-right">
            {!account ? (
              <>
                <span className="font-semibold text-foreground">
                  {NO_VALUE}
                </span>
                <span className="text-xs text-muted-foreground">
                  {NO_VALUE}
                </span>
              </>
            ) : unavailable ? (
              <span
                className="flex items-center gap-1.5 text-xs text-destructive"
                aria-live="polite"
                data-ocid={`wallet.error_state.${index}`}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {t.balanceUnavailable}
              </span>
            ) : data === undefined ? (
              <span
                className="flex flex-col items-end gap-1.5"
                data-ocid={`wallet.loading_state.${index}`}
              >
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-14" />
              </span>
            ) : (
              <>
                <span
                  className="max-w-full break-all font-semibold text-foreground tabular-nums"
                  data-ocid={`wallet.balance.${index}`}
                >
                  {formatUnits(data, token.decimals, 2, lang)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {value === null ? NO_VALUE : formatUsdValue(value, lang)}
                </span>
              </>
            )}
          </span>
        </button>
        {unavailable && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label={`${t.retry} · ${t.refreshBalance(token.symbol)}`}
            data-ocid={`wallet.retry_button.${index}`}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
            />
          </Button>
        )}
      </div>
      {selected && (
        <fieldset
          id={actionsId}
          aria-label={t.tokenActions(token.symbol)}
          className="m-0 flex min-w-0 flex-wrap gap-2 border-0 px-3 pb-3 animate-fade-in"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={ACTION_BUTTON}
            onClick={onSend}
            data-ocid={`wallet.row_send_button.${index}`}
          >
            <Send className="h-4 w-4" />
            {t.send}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={ACTION_BUTTON}
            onClick={onReceive}
            data-ocid={`wallet.row_receive_button.${index}`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            {t.receive}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={ACTION_BUTTON}
            onClick={onHistory}
            data-ocid={`wallet.row_history_button.${index}`}
          >
            <History className="h-4 w-4" />
            {t.historyButton}
          </Button>
          {onBuy && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={ACTION_BUTTON}
              onClick={onBuy}
              data-ocid={`wallet.row_buy_button.${index}`}
            >
              <CreditCard className="h-4 w-4" />
              {t.buy}
            </Button>
          )}
          {onBuyback && isTttiToken(token) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={ACTION_BUTTON}
              onClick={onBuyback}
              title={tb.walletEntryHint}
              data-ocid={`wallet.row_buyback_button.${index}`}
            >
              <Undo2 className="h-4 w-4" />
              {tb.walletEntry}
            </Button>
          )}
          {isTttiToken(token) && (
            <Link
              to="/transfer"
              className="basis-full rounded text-xs text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid={`wallet.row_advanced_transfer_link.${index}`}
            >
              {t.advancedTransfer}
            </Link>
          )}
        </fieldset>
      )}
    </li>
  );
}
