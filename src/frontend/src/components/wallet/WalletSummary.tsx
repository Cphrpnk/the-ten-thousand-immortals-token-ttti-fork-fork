import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  Coins,
  RefreshCw,
  Send,
} from "lucide-react";
import type { Account } from "../../backend";
import { useConsolidatedTttiPrice } from "../../hooks/useDex";
import { fiatUsdE8, useFiatRates } from "../../hooks/useFiatValue";
import { useWalletBalances } from "../../hooks/useWallet";
import { useDict, useLanguage } from "../../i18n/core";
import { WALLET_BUY_TEXT } from "../../i18n/pages/swap";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { isTttiToken } from "../../lib/ttti-token";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { NO_VALUE, fiatTokenOfDescriptor, formatUsdValue } from "./valuation";

const ACTION =
  "h-auto min-h-11 flex-col gap-1.5 whitespace-normal rounded-lg px-2 py-3 text-center leading-tight transition-smooth";
const PRIMARY = `${ACTION} shadow-gold hover:brightness-110`;
const OUTLINE = `${ACTION} border-gold hover:border-gold-strong hover:bg-primary/10 hover:text-foreground`;

interface WalletSummaryProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  /** Kept for the page contract; USD values follow the shared fiat rates. */
  rates?: Map<string, bigint | null>;
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
}

/** Total USD value of the known balances and the Receive / Send / Swap / Mint actions. */
export function WalletSummary({
  tokens,
  account,
  onReceive,
  onSend,
  onSwap,
}: WalletSummaryProps) {
  const t = useDict(WALLET_TEXT);
  const tm = useDict(WALLET_BUY_TEXT);
  const { lang } = useLanguage();
  const fiatRates = useFiatRates();
  const balances = useWalletBalances(
    tokens.map((token) => token.canisterId),
    account,
  );

  let total = 0n;
  let known = 0;
  let pending = false;
  tokens.forEach((token, i) => {
    const query = balances[i];
    if (query?.data !== undefined) {
      const fiat = fiatTokenOfDescriptor(token);
      const value =
        fiat === null ? null : fiatUsdE8(fiatRates, fiat, query.data);
      if (value !== null) {
        total += value;
        known += 1;
      }
    } else if (query && !query.isError && query.failureCount === 0) {
      pending = true;
    }
  });
  const loading = !!account && (tokens.length === 0 || pending);

  const {
    isPending: priceLoading,
    isFetching: priceFetching,
    refetch: refetchPrice,
  } = useConsolidatedTttiPrice();
  const tttiUnvalued =
    !priceLoading &&
    tokens.some(
      (token) => isTttiToken(token) && fiatRates.usdE8PerToken("ttti") === null,
    );

  return (
    <Card
      className="rounded-lg border-gold bg-gradient-surface shadow-elevated"
      data-ocid="wallet.summary.card"
    >
      <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t.totalValue}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => void refetchPrice()}
              disabled={priceFetching}
              aria-label={t.refreshPrice}
              title={t.refreshPrice}
              data-ocid="wallet.summary.refresh_button"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${priceFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
            </Button>
          </div>
          {loading ? (
            <Skeleton
              className="h-11 w-48"
              data-ocid="wallet.summary.loading_state"
            />
          ) : (
            <p
              className="font-display text-4xl font-semibold text-foreground tabular-nums md:text-5xl"
              data-ocid="wallet.summary.total"
            >
              {account && known > 0 ? formatUsdValue(total, lang) : NO_VALUE}
            </p>
          )}
          {account && (
            <Link
              to="/guarantee"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-smooth hover:text-foreground"
              data-ocid="wallet.summary.reserve_link"
            >
              {t.reserveLink}
            </Link>
          )}
        </div>

        <div className="grid w-full max-w-md grid-cols-4 gap-3">
          <Button
            type="button"
            className={PRIMARY}
            onClick={onReceive}
            data-ocid="wallet.summary.receive_button"
          >
            <ArrowDownLeft className="h-5 w-5" />
            {t.receive}
          </Button>
          <Button
            type="button"
            className={PRIMARY}
            onClick={onSend}
            data-ocid="wallet.summary.send_button"
          >
            <Send className="h-5 w-5" />
            {t.send}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={OUTLINE}
            onClick={onSwap}
            data-ocid="wallet.summary.swap_button"
          >
            <ArrowLeftRight className="h-5 w-5" />
            {t.swap}
          </Button>
          <Button
            asChild
            variant="outline"
            className={OUTLINE}
            data-ocid="wallet.summary.mint_button"
          >
            <Link to="/buy">
              <Coins className="h-5 w-5" />
              {tm.mint}
            </Link>
          </Button>
        </div>

        <p className="max-w-md text-xs text-muted-foreground">
          {t.totalNote}
          {tttiUnvalued && ` ${t.tttiUnvalued}`}
        </p>
      </CardContent>
    </Card>
  );
}
