import type { AuctionView } from "../../backend";
import { useOpenAuction } from "../../hooks/useAuction";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { FiatAmount } from "../FiatAmount";
import { Button } from "../ui/button";
import { formatTttiE8, openErrorText } from "./auctionFormat";

/** Shown when no auction is open: next lot size and the button that opens one. */
export function AuctionEmpty({ view }: { view: AuctionView }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const open = useOpenAuction();
  const result = open.data;
  const refusal =
    result?.__kind__ === "err" ? openErrorText(t, result.err) : null;
  const failed = open.isError ? t.openErrorUnexpected : null;
  const message = refusal ?? failed;

  return (
    <section
      className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
      data-ocid="auction.empty_state"
    >
      <h2 className="font-display text-lg uppercase tracking-[0.2em]">
        {t.emptyTitle}
      </h2>
      <p className="max-w-2xl text-sm text-muted-foreground">{t.emptyBody}</p>
      <p className="text-sm" data-ocid="auction.next_lot">
        <span className="text-muted-foreground">{t.nextLot}: </span>
        {view.pendingLotE8s > 0n ? (
          <span className="font-mono tabular-nums">
            {formatTttiE8(view.pendingLotE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={view.pendingLotE8s}
              className="ml-1.5"
              ocid="auction.next_lot_fiat"
            />
          </span>
        ) : (
          t.nextLotNone
        )}
      </p>
      {view.pendingRemainderE8s > 0n && (
        <p className="text-sm" data-ocid="auction.next_lot_remainder">
          <span className="text-muted-foreground">{t.lotRemainderLabel}: </span>
          <span className="font-mono tabular-nums">
            {formatTttiE8(view.pendingRemainderE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={view.pendingRemainderE8s}
              className="ml-1.5"
              ocid="auction.next_lot_remainder_fiat"
            />
          </span>
        </p>
      )}
      <Button
        type="button"
        onClick={() => open.mutate()}
        disabled={open.isPending}
        className="min-h-11"
        data-ocid="auction.open_button"
      >
        {open.isPending ? t.openingButton : t.openButton}
      </Button>
      {message && (
        <p
          className="callout-danger px-3 py-2 text-sm"
          role="alert"
          data-ocid="auction.open_error_state"
        >
          {message}
        </p>
      )}
    </section>
  );
}
