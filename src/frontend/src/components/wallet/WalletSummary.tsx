import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowLeftRight, Coins, Send } from "lucide-react";
import type { Account } from "../../backend";
import { useWalletBalances } from "../../hooks/useWallet";
import { useDict, useLanguage } from "../../i18n/core";
import { WALLET_BUY_TEXT } from "../../i18n/pages/swap";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import { formatUsdE8 } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  NO_VALUE,
  TTTI_CALCULATION_USD_E8,
  formatUsdValue,
  usdValueE8,
} from "./valuation";

const ACTION =
  "h-auto min-h-11 flex-col gap-1.5 whitespace-normal rounded-lg px-2 py-3 text-center leading-tight transition-smooth";
const PRIMARY = `${ACTION} shadow-gold hover:brightness-110`;
const OUTLINE = `${ACTION} border-gold hover:border-gold-strong hover:bg-primary/10 hover:text-foreground`;

interface WalletSummaryProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  rates: Map<string, bigint | null>;
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
}

/** Total USD value of the known balances and the Receive / Send / Swap / Mint actions. */
export function WalletSummary({
  tokens,
  account,
  rates,
  onReceive,
  onSend,
  onSwap,
}: WalletSummaryProps) {
  const t = useDict(WALLET_TEXT);
  const tm = useDict(WALLET_BUY_TEXT);
  const { lang } = useLanguage();
  const balances = useWalletBalances(
    tokens.map((token) => token.canisterId),
    account,
  );

  let total = 0n;
  let known = 0;
  let pending = false;
  tokens.forEach((token, i) => {
    const query = balances[i];
    const rate = rates.get(token.canisterId.toText()) ?? null;
    if (query?.data !== undefined) {
      if (rate !== null) {
        total += usdValueE8(query.data, token.decimals, rate);
        known += 1;
      }
    } else if (query && !query.isError && query.failureCount === 0) {
      pending = true;
    }
  });
  const loading = !!account && (tokens.length === 0 || pending);

  return (
    <Card
      className="rounded-lg border-gold bg-gradient-surface shadow-elevated"
      data-ocid="wallet.summary.card"
    >
      <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.totalValue}
          </p>
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
          {t.totalNote(formatUsdE8(TTTI_CALCULATION_USD_E8, 2, lang))}
        </p>
      </CardContent>
    </Card>
  );
}
