import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import type {
  Account,
  IndexTransaction,
  TransactionWithId,
} from "../../backend";
import {
  WALLET_HISTORY_PAGE_SIZE,
  useTttiAccountTransactions,
} from "../../hooks/useWallet";
import { type Lang, toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { WALLET_EXPLORER_TEXT, WALLET_TEXT } from "../../i18n/pages/wallet";
import { tttiBlockTarget } from "../../lib/explorer";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  encodeAccountText,
  formatUnits,
} from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { HistoryPager } from "./HistoryPager";

type WalletText = (typeof WALLET_TEXT)["en"];

interface Movement {
  label: string;
  incoming: boolean | null;
  amount: bigint;
  counterpartyLabel: string | null;
  counterparty: Account | null;
}

/** The movement of `tx` as seen from `own` (account text). */
function describe(tx: IndexTransaction, own: string, t: WalletText): Movement {
  if (tx.transfer) {
    const outgoing = encodeAccountText(tx.transfer.from) === own;
    return {
      label: outgoing ? t.movementSent : t.movementReceived,
      incoming: !outgoing,
      amount: tx.transfer.amount,
      counterpartyLabel: outgoing ? t.movementTo : t.movementFrom,
      counterparty: outgoing ? tx.transfer.to : tx.transfer.from,
    };
  }
  const mint = tx.mint ?? tx.authorized_mint;
  if (mint) {
    return {
      label: t.movementMinted,
      incoming: true,
      amount: mint.amount,
      counterpartyLabel: null,
      counterparty: null,
    };
  }
  const burn = tx.burn ?? tx.authorized_burn;
  if (burn) {
    return {
      label: t.movementSent,
      incoming: false,
      amount: burn.amount,
      counterpartyLabel: null,
      counterparty: null,
    };
  }
  if (tx.approve) {
    return {
      label: t.movementApproval,
      incoming: null,
      amount: tx.approve.amount,
      counterpartyLabel: t.movementTo,
      counterparty: tx.approve.spender,
    };
  }
  return {
    label: tx.kind,
    incoming: null,
    amount: 0n,
    counterpartyLabel: null,
    counterparty: null,
  };
}

function formatNanos(nanos: bigint, lang: Lang): string {
  return new Date(Number(nanos / 1_000_000n)).toLocaleString(
    toIntlLocale(lang),
    { dateStyle: "medium", timeStyle: "short" },
  );
}

function MovementRow({
  item,
  own,
  index,
}: {
  item: TransactionWithId;
  own: string;
  index: number;
}) {
  const t = useDict(WALLET_TEXT);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const { lang } = useLanguage();
  const m = describe(item.transaction, own, t);
  const Icon = m.incoming === false ? ArrowUpRight : ArrowDownLeft;
  const sign = m.incoming === true ? "+" : m.incoming === false ? "−" : "";

  return (
    <li
      className="flex items-start gap-3 rounded-lg border border-gold bg-muted/30 p-3"
      data-ocid={`wallet.movements.item.${index}`}
    >
      <span
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold text-primary"
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="font-semibold text-foreground">{m.label}</span>
          <span className="font-semibold text-foreground tabular-nums">
            {sign}
            {formatUnits(m.amount, TTTI_DECIMALS, 2, lang)} {TTTI_SYMBOL}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatNanos(item.transaction.timestamp, lang)}</span>
          <ExplorerLink
            target={tttiBlockTarget(item.id)}
            label={tx.viewBlockInHistory}
            data-ocid={`wallet.movements.block_link.${index}`}
          >
            {tx.block} {item.id.toString()}
          </ExplorerLink>
        </div>
        {m.counterparty && m.counterpartyLabel && (
          <p className="break-all font-mono text-xs text-muted-foreground">
            {m.counterpartyLabel}: {encodeAccountText(m.counterparty)}
          </p>
        )}
      </div>
    </li>
  );
}

/** TTTI-T ledger movements involving `account`, 25 per page, newest first. */
export function TttiMovements({ account }: { account: Account | undefined }) {
  const t = useDict(WALLET_TEXT);
  // Exclusive upper-bound block index of each visited page (undefined = newest).
  const [starts, setStarts] = useState<Array<bigint | undefined>>([undefined]);
  const start = starts[starts.length - 1];
  const { data, isError, isFetching, refetch } = useTttiAccountTransactions(
    account,
    start,
  );
  const own = account ? encodeAccountText(account) : "";
  const items = data?.transactions ?? [];
  const last = items[items.length - 1];
  const hasNext =
    items.length >= WALLET_HISTORY_PAGE_SIZE &&
    !!last &&
    data?.oldest_tx_id !== last.id;

  return (
    <Card
      className="rounded-lg border-gold bg-card shadow-subtle"
      data-ocid="wallet.movements.section"
    >
      <CardHeader>
        <CardTitle className="font-display text-lg">
          {t.movementsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!account ? (
          <p className="text-sm text-muted-foreground">{t.movementsConnect}</p>
        ) : isError ? (
          <div
            className="flex flex-col items-center gap-4 py-8 text-center"
            data-ocid="wallet.movements.error_state"
          >
            <p
              className="flex items-center gap-2 text-sm text-destructive"
              aria-live="polite"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t.movementsError}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground"
              onClick={() => void refetch()}
              disabled={isFetching}
              data-ocid="wallet.movements.retry_button"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
              />
              {t.retry}
            </Button>
          </div>
        ) : data === undefined ? (
          <div
            className="flex flex-col gap-3"
            aria-busy="true"
            data-ocid="wallet.movements.loading_state"
          >
            <span className="sr-only">{t.movementsLoading}</span>
            {["m-1", "m-2", "m-3"].map((id) => (
              <Skeleton key={id} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 && starts.length === 1 ? (
          <p
            className="rounded-lg border border-dashed border-gold py-8 text-center text-muted-foreground"
            data-ocid="wallet.movements.empty_state"
          >
            {t.movementsEmpty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2" data-ocid="wallet.movements.list">
            {items.map((item, i) => (
              <MovementRow
                key={item.id.toString()}
                item={item}
                own={own}
                index={(starts.length - 1) * WALLET_HISTORY_PAGE_SIZE + i + 1}
              />
            ))}
          </ul>
        )}
        {account && (starts.length > 1 || hasNext) && (
          <HistoryPager
            page={starts.length}
            hasNext={hasNext}
            onPrevious={() => setStarts((s) => s.slice(0, -1))}
            onNext={() => last && setStarts((s) => [...s, last.id])}
            disabled={isFetching}
            ocid="wallet.movements"
          />
        )}
      </CardContent>
    </Card>
  );
}
