import { Link } from "@tanstack/react-router";
import { SettlementStatus__1 } from "../../backend";
import { useMyBidSettlements, useMyWithdrawable } from "../../hooks/useAuction";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { PAY_TOKENS, PAY_TOKEN_ORDER, formatPayAmount } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";

/** The caller's amounts per token: awaiting settlement and returned to the DEX balance. */
export function MyBalances() {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const balances = useMyWithdrawable();
  const mine = useMyBidSettlements();
  const failedCount = mine.settlements.filter(
    (s) => s.status === SettlementStatus__1.failed,
  ).length;
  const rows = PAY_TOKEN_ORDER.flatMap((token) => {
    const entry = balances.data?.find((b) => b.token === token);
    return entry && (entry.withdrawable > 0n || entry.pendingSettlement > 0n)
      ? [entry]
      : [];
  });
  const hasReturned = rows.some((row) => row.withdrawable > 0n);

  return (
    <section
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
      data-ocid="auction.balance"
    >
      <h2 className="font-display text-lg uppercase tracking-[0.2em]">
        {t.balanceTitle}
      </h2>
      <p className="text-sm text-muted-foreground">{t.balanceNote}</p>
      {balances.isPending ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="auction.balance.loading_state"
        >
          {t.loading}
        </p>
      ) : balances.isError ? (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="auction.balance.error_state"
        >
          {t.loadError}
        </p>
      ) : rows.length === 0 ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="auction.balance.empty_state"
        >
          {t.balanceEmpty}
        </p>
      ) : (
        <ul className="grid gap-2 text-sm" data-ocid="auction.balance.list">
          {rows.map((row, index) => (
            <li
              key={row.token}
              className="grid gap-2 rounded-md border border-border px-3 py-2 sm:grid-cols-[6rem_1fr_1fr] sm:items-baseline"
              data-ocid={`auction.balance.item.${index + 1}`}
            >
              <span className="font-mono text-muted-foreground">
                {PAY_TOKENS[row.token].symbol}
              </span>
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-muted-foreground">{t.colAwaiting}</span>
                <span className="font-mono tabular-nums">
                  {formatPayAmount(row.pendingSettlement, row.token, lang)}
                  <FiatAmount
                    token={row.token}
                    amount={row.pendingSettlement}
                    className="ml-1.5"
                    ocid={`auction.balance.awaiting_fiat.${index + 1}`}
                  />
                </span>
              </span>
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-muted-foreground">
                  {t.colReturnedBalance}
                </span>
                <span className="font-mono tabular-nums">
                  {formatPayAmount(row.withdrawable, row.token, lang)}
                  <FiatAmount
                    token={row.token}
                    amount={row.withdrawable}
                    className="ml-1.5"
                    ocid={`auction.balance.returned_fiat.${index + 1}`}
                  />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {failedCount > 0 && (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="auction.balance.failed_note"
        >
          {t.balanceFailedNote(failedCount.toString())}
        </p>
      )}
      {hasReturned && (
        <p className="text-sm" data-ocid="auction.balance.recover_note">
          <span className="text-muted-foreground">{t.balanceRecoverNote} </span>
          <Link
            to="/pools"
            hash="my-liquidity"
            className="font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="auction.balance.recover_link"
          >
            {t.balanceRecoverLink}
          </Link>
        </p>
      )}
    </section>
  );
}
