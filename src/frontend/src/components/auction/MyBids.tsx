import type { AuctionView, ClosedBidView, PayToken } from "../../backend";
import {
  useClosedAuctions,
  useMyAuctionBids,
  useMyClosedBids,
} from "../../hooks/useAuction";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { PAY_TOKENS, formatPayAmount } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { DexAccordion } from "../dex/DexAccordion";
import { formatDexDate } from "../dex/dexFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatTttiE8, outcomeText } from "./auctionFormat";

interface OfferRow {
  id: bigint;
  auctionId: bigint;
  quantityE8s: bigint;
  priceB: bigint;
  token: PayToken;
  deposited: bigint;
  createdAt: bigint;
  /** Present once the auction is closed. */
  closed?: ClosedBidView;
}

/** The caller's own offers with the outcome of each one, read-only, in a closed accordion. */
export function MyBids({ view }: { view: AuctionView }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const bids = useMyAuctionBids();
  const closedBids = useMyClosedBids();
  const closedAuctions = useClosedAuctions();
  const blockSaleIds = new Set<string>(
    (closedAuctions.data ?? [])
      .filter((a) => a.blockSale)
      .map((a) => a.id.toString()),
  );
  if (view.blockSale && view.auctionId !== undefined) {
    blockSaleIds.add(view.auctionId.toString());
  }
  const rows = new Map<string, OfferRow>();
  for (const bid of bids.data ?? []) {
    rows.set(bid.id.toString(), bid);
  }
  for (const bid of closedBids.bids) {
    rows.set(bid.id.toString(), { ...bid, closed: bid });
  }
  const sorted = [...rows.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
  );
  const openCount = (bids.data ?? []).filter(
    (b) => !rows.get(b.id.toString())?.closed,
  ).length;

  return (
    <section className="flex flex-col gap-3" data-ocid="auction.my_bids">
      <h2 className="font-display text-lg uppercase tracking-[0.2em]">
        {t.myOffersTitle}
      </h2>
      <p className="text-sm text-muted-foreground">{t.privacyNote}</p>
      <DexAccordion
        label={t.myOffersTitle}
        count={t.offerCount(
          openCount.toString(),
          view.maxBidsPerPerson.toString(),
        )}
        ocid="auction.my_bids.accordion"
      >
        <p className="text-sm text-muted-foreground">{t.firmNote}</p>
        {bids.isPending ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.my_bids.loading_state"
          >
            {t.loading}
          </p>
        ) : bids.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="auction.my_bids.error_state"
          >
            {t.loadError}
          </p>
        ) : sorted.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="auction.my_bids.empty_state"
          >
            {t.myOffersEmpty}
          </p>
        ) : (
          <Table data-ocid="auction.my_bids.table">
            <TableHeader>
              <TableRow>
                <TableHead>{t.colAuction}</TableHead>
                <TableHead>{t.colQuantity}</TableHead>
                <TableHead>{t.colPrice}</TableHead>
                <TableHead>{t.colToken}</TableHead>
                <TableHead>{t.colDeposit}</TableHead>
                <TableHead>{t.colOutcome}</TableHead>
                <TableHead>{t.colDate}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((bid, index) => (
                <TableRow
                  key={bid.id.toString()}
                  data-ocid={`auction.my_bids.item.${index + 1}`}
                >
                  <TableCell className="font-mono tabular-nums">
                    {bid.auctionId.toString()}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {formatTttiE8(bid.quantityE8s, lang)}
                    <FiatAmount
                      token="ttti"
                      amount={bid.quantityE8s}
                      className="ml-1.5"
                      ocid={`auction.my_bids.quantity_fiat.${index + 1}`}
                    />
                    {blockSaleIds.has(bid.auctionId.toString()) && (
                      <span
                        className="ms-2 rounded-full border border-gold px-2 py-0.5 font-body text-xs font-medium text-primary"
                        data-ocid={`auction.my_bids.block_sale.${index + 1}`}
                      >
                        {t.blockSaleBadge}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {formatPayAmount(bid.priceB, bid.token, lang)}
                    <FiatAmount
                      token={bid.token}
                      amount={bid.priceB}
                      className="ml-1.5"
                      ocid={`auction.my_bids.price_fiat.${index + 1}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono">
                    {PAY_TOKENS[bid.token].symbol}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {formatPayAmount(bid.deposited, bid.token, lang)}
                    <FiatAmount
                      token={bid.token}
                      amount={bid.deposited}
                      className="ml-1.5"
                      ocid={`auction.my_bids.deposit_fiat.${index + 1}`}
                    />
                  </TableCell>
                  <TableCell data-ocid={`auction.my_bids.outcome.${index + 1}`}>
                    {bid.closed ? (
                      <div className="flex flex-col gap-0.5">
                        <span>{outcomeText(t, bid.closed.outcome)}</span>
                        <span className="text-xs text-muted-foreground">
                          {bid.closed.servedE8s > 0n
                            ? t.outcomeDetail(
                                formatTttiE8(bid.closed.servedE8s, lang),
                                formatPayAmount(
                                  bid.closed.returned,
                                  bid.token,
                                  lang,
                                ),
                              )
                            : t.outcomeReturnedOnly(
                                formatPayAmount(
                                  bid.closed.returned,
                                  bid.token,
                                  lang,
                                ),
                              )}
                        </span>
                        {bid.closed.settlement.mintedE8s > 0n && (
                          <span
                            className="text-xs text-muted-foreground"
                            data-ocid={`auction.my_bids.minted.${index + 1}`}
                          >
                            {t.outcomeMinted(
                              formatTttiE8(
                                bid.closed.settlement.mintedE8s,
                                lang,
                              ),
                            )}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {t.outcomePending}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDexDate(bid.createdAt, lang)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DexAccordion>
    </section>
  );
}
