import { useClosedAuctions } from "../../hooks/useAuction";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { DexAccordion } from "../dex/DexAccordion";
import { formatDexDate } from "../dex/dexFormat";
import { ClosedAuctionResult } from "./ClosedAuctionResult";

/** Closed auctions, newest first, in an accordion closed by default. */
export function ClosedAuctions() {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const closed = useClosedAuctions();
  const list = [...(closed.data ?? [])].sort((a, b) =>
    a.closedAt < b.closedAt ? 1 : a.closedAt > b.closedAt ? -1 : 0,
  );

  return (
    <section className="flex flex-col gap-3" data-ocid="auction.closed">
      <DexAccordion
        label={
          <span className="font-display text-lg uppercase tracking-[0.2em]">
            {t.closedTitle}
          </span>
        }
        count={closed.data ? list.length.toString() : undefined}
        ocid="auction.closed.accordion"
      >
        <p className="text-sm text-muted-foreground">{t.closedIntro}</p>
        {closed.isPending ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.closed.loading_state"
          >
            {t.loading}
          </p>
        ) : closed.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="auction.closed.error_state"
          >
            {t.loadError}
          </p>
        ) : list.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.closed.empty_state"
          >
            {t.closedEmpty}
          </p>
        ) : (
          <div className="flex flex-col border-b border-border">
            {list.map((auction, index) => (
              <DexAccordion
                key={auction.id.toString()}
                label={t.closedItemLabel(
                  auction.id.toString(),
                  formatDexDate(auction.closedAt, lang),
                )}
                ocid={`auction.closed.item.${index + 1}`}
              >
                <ClosedAuctionResult auction={auction} />
              </DexAccordion>
            ))}
          </div>
        )}
      </DexAccordion>
    </section>
  );
}
