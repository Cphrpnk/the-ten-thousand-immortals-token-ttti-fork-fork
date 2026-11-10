import { RemainderChoice } from "../../backend";
import type { DepositQuote } from "../../backend";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { formatPayAmount } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { formatLockedShare } from "../exchange/liquidityMint";
import { formatTttiE8 } from "./auctionFormat";

/**
 * Split of the deposit of a winner, as quoted by the contract: the locked
 * share m, the position at price B, the locked part and the TTTI-T delivered
 * to the wallet for the remainder choice (A pool, B keep in wallet).
 */
export function DepositSplit({
  quote,
  quantityE8s,
}: { quote: DepositQuote; quantityE8s: bigint }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const { token } = quote;
  const choiceLetter = quote.choice === RemainderChoice.wallet ? "B" : "A";
  const pooledTtti =
    quantityE8s > quote.handE8s ? quantityE8s - quote.handE8s : 0n;
  const rows = [
    {
      key: "reserve",
      label: t.splitReserve,
      value: formatPayAmount(quote.reserveAmount, token, lang),
      amount: quote.reserveAmount,
    },
    {
      key: "position",
      label: t.splitPosition,
      value: t.settlePositionValue(
        formatPayAmount(quote.choicePooledAmount, token, lang),
        formatTttiE8(pooledTtti, lang),
      ),
      amount: quote.choicePooledAmount,
    },
    {
      key: "locked",
      label: t.splitLocked,
      value: formatPayAmount(quote.lockedAmount, token, lang),
      amount: quote.lockedAmount,
    },
    ...(quote.handE8s > 0n
      ? [
          {
            key: "hand",
            label: t.splitHand,
            value: `${formatTttiE8(quote.handE8s, lang)} TTTI-T`,
            amount: null,
          },
        ]
      : []),
    {
      key: "creator",
      label: t.splitCreator,
      value: formatPayAmount(quote.creatorAmount, token, lang),
      amount: quote.creatorAmount,
    },
    {
      key: "choice_payment",
      label: t.splitChoicePayment(choiceLetter),
      value: formatPayAmount(quote.choicePayment, token, lang),
      amount: quote.choicePayment,
    },
  ];

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-border bg-background/60 p-4 text-sm"
      data-ocid="auction.deposit_split"
    >
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {t.splitHeading}
      </h3>
      <dl className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">{t.splitShare}</dt>
          <dd
            className="font-mono tabular-nums"
            data-ocid="auction.deposit_split.share"
          >
            {formatLockedShare(quote.mShareE6)}
          </dd>
        </div>
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-wrap items-baseline justify-between gap-2"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd
              className="font-mono tabular-nums"
              data-ocid={`auction.deposit_split.${row.key}`}
            >
              {row.value}
              {row.amount !== null ? (
                <FiatAmount
                  token={token}
                  amount={row.amount}
                  className="ml-1.5"
                  ocid={`auction.deposit_split.${row.key}_fiat`}
                />
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      <p
        className="text-xs text-muted-foreground"
        data-ocid="auction.deposit_split.note"
      >
        {t.reserveKeptNote}
      </p>
      <p
        className="text-xs text-muted-foreground"
        data-ocid="auction.deposit_split.share_note"
      >
        {t.splitShareNote}
      </p>
    </div>
  );
}
