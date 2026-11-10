import type { ReactNode } from "react";
import { SettlementStatus__1 } from "../../backend";
import type {
  BidSettlement,
  ClosedAuctionView,
  ClosedBidView,
} from "../../backend";
import { useAuctionResult } from "../../hooks/useAuction";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { PAY_TOKENS, formatPayAmount } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { formatDexDate } from "../dex/dexFormat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ClosedReserve } from "./ClosedReserve";
import {
  type AuctionText,
  closedStatusText,
  formatTttiE8,
  outcomeText,
  shortPrincipal,
} from "./auctionFormat";

function Row({
  label,
  ocid,
  children,
}: { label: string; ocid: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 tabular-nums sm:text-end" data-ocid={ocid}>
        {children}
      </dd>
    </div>
  );
}

/** Translated settlement status of one winner. */
function settlementStatusText(
  t: AuctionText,
  status: SettlementStatus__1,
): string {
  switch (status) {
    case SettlementStatus__1.pending:
      return t.settlementPending;
    case SettlementStatus__1.settled:
      return t.settlementSettled;
    case SettlementStatus__1.failed:
      return t.settlementFailed;
    case SettlementStatus__1.notRequired:
      return t.settlementNotRequired;
  }
}

/** Amounts taken, shared, pooled, guaranteed and returned for one winner. */
function SettlementDetail({
  bid,
  settlement,
  index,
  callerText,
}: {
  bid: ClosedBidView;
  settlement: BidSettlement;
  index: number;
  callerText: string;
}) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const bidder = bid.bidder.toText();
  const pay = (amount: bigint) => formatPayAmount(amount, bid.token, lang);
  const payFiat = (amount: bigint, name: string) => (
    <FiatAmount
      token={bid.token}
      amount={amount}
      className="ml-1.5"
      ocid={`auction.settlement.${name}_fiat.${index}`}
    />
  );
  const tttiFiat = (amount: bigint, name: string) => (
    <FiatAmount
      token="ttti"
      amount={amount}
      className="ml-1.5"
      ocid={`auction.settlement.${name}_fiat.${index}`}
    />
  );
  const settled = settlement.status === SettlementStatus__1.settled;
  const failed = settlement.status === SettlementStatus__1.failed;
  return (
    <li
      className="flex flex-col gap-2 rounded-md border border-border px-3 py-3"
      data-ocid={`auction.settlement.item.${index}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-mono" title={bidder}>
          {shortPrincipal(bidder)}
          {bidder === callerText && (
            <span className="ms-2 rounded-full border border-gold px-2 py-0.5 text-xs font-medium text-primary">
              {t.youBadge}
            </span>
          )}
        </span>
        <span className="font-medium">
          {settlementStatusText(t, settlement.status)}
        </span>
      </div>
      {settled && (
        <dl className="flex flex-col gap-1 text-sm">
          <Row label={t.settleTaken} ocid={`auction.settlement.taken.${index}`}>
            <span className="font-mono">
              {pay(settlement.takenAmount)}
              {payFiat(settlement.takenAmount, "taken")}
            </span>
          </Row>
          <Row
            label={t.settleCreator}
            ocid={`auction.settlement.creator.${index}`}
          >
            <span className="font-mono">
              {pay(settlement.creatorShare)}
              {payFiat(settlement.creatorShare, "creator")}
            </span>
          </Row>
          <Row
            label={t.settlePosition}
            ocid={`auction.settlement.position.${index}`}
          >
            <span className="font-mono">
              {t.settlePositionValue(
                pay(settlement.positionAmount),
                formatTttiE8(settlement.settledE8s, lang),
              )}
              {payFiat(settlement.positionAmount, "position")}
            </span>
          </Row>
          <Row
            label={t.settleReserve}
            ocid={`auction.settlement.reserve.${index}`}
          >
            <span className="font-mono">
              {pay(settlement.guaranteeAmount)}
              {payFiat(settlement.guaranteeAmount, "reserve")}
            </span>
          </Row>
          {settlement.mintedE8s > 0n && (
            <Row
              label={t.settleMinted}
              ocid={`auction.settlement.minted.${index}`}
            >
              <span className="font-mono">
                {formatTttiE8(settlement.mintedE8s, lang)} TTTI-T
                {tttiFiat(settlement.mintedE8s, "minted")}
              </span>
            </Row>
          )}
          <Row
            label={t.settleSurplus}
            ocid={`auction.settlement.surplus.${index}`}
          >
            <span className="font-mono">
              {pay(settlement.surplusReturned)}
              {payFiat(settlement.surplusReturned, "surplus")}
            </span>
          </Row>
        </dl>
      )}
      {failed && (
        <dl className="flex flex-col gap-1 text-sm">
          <Row
            label={t.settleNoPosition}
            ocid={`auction.settlement.none.${index}`}
          >
            {t.settleNone}
          </Row>
          <Row
            label={t.settleDepositReturned}
            ocid={`auction.settlement.returned.${index}`}
          >
            <span className="font-mono">
              {pay(settlement.surplusReturned)}
              {payFiat(settlement.surplusReturned, "returned")}
            </span>
          </Row>
          <Row
            label={t.settleCarried}
            ocid={`auction.settlement.carried.${index}`}
          >
            <span className="font-mono">
              {formatTttiE8(settlement.carriedE8s, lang)} TTTI-T
              {tttiFiat(settlement.carriedE8s, "carried")}
            </span>
          </Row>
          {settlement.failureReason && (
            <Row
              label={t.settleFailureReason}
              ocid={`auction.settlement.reason.${index}`}
            >
              {settlement.failureReason}
            </Row>
          )}
        </dl>
      )}
    </li>
  );
}

/** Result of one closed auction: reserve applied, quantities, status, every published offer and its settlement. */
export function ClosedAuctionResult({
  auction,
}: { auction: ClosedAuctionView }) {
  const t = useDict(AUCTION_TEXT);
  const { lang } = useLanguage();
  const { identity } = useInternetIdentity();
  const caller = identity?.getPrincipal();
  const callerText = caller && !caller.isAnonymous() ? caller.toText() : "";
  const result = useAuctionResult(auction.id);
  const key = auction.id.toString();
  const winners = (result.data?.bids ?? []).filter(
    (b) => b.settlement.status !== SettlementStatus__1.notRequired,
  );
  return (
    <div
      className="flex min-w-0 flex-col gap-6"
      data-ocid={`auction.closed.result.${key}`}
    >
      <dl className="flex flex-col gap-3 text-sm">
        <Row label={t.resultStatusLabel} ocid={`auction.closed.status.${key}`}>
          {closedStatusText(t, auction.status)}
        </Row>
        <Row
          label={t.resultClosedAtLabel}
          ocid={`auction.closed.closed_at.${key}`}
        >
          {formatDexDate(auction.closedAt, lang)}
        </Row>
        {auction.blockSale && (
          <Row
            label={t.blockSaleLabel}
            ocid={`auction.closed.block_sale.${key}`}
          >
            {t.blockSaleValue}
          </Row>
        )}
        <Row label={t.lotSize} ocid={`auction.closed.lot.${key}`}>
          <span className="font-mono">
            {formatTttiE8(auction.lotSizeE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={auction.lotSizeE8s}
              className="ml-1.5"
              ocid={`auction.closed.lot_fiat.${key}`}
            />
          </span>
        </Row>
        {auction.remainderE8s > 0n && (
          <Row
            label={t.lotRemainderLabel}
            ocid={`auction.closed.remainder.${key}`}
          >
            <span className="font-mono">
              {formatTttiE8(auction.remainderE8s, lang)} TTTI-T
              <FiatAmount
                token="ttti"
                amount={auction.remainderE8s}
                className="ml-1.5"
                ocid={`auction.closed.remainder_fiat.${key}`}
              />
            </span>
          </Row>
        )}
        <Row label={t.resultServedLabel} ocid={`auction.closed.served.${key}`}>
          <span className="font-mono">
            {formatTttiE8(auction.servedE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={auction.servedE8s}
              className="ml-1.5"
              ocid={`auction.closed.served_fiat.${key}`}
            />
          </span>
        </Row>
        <Row
          label={t.resultCarriedLabel}
          ocid={`auction.closed.carried.${key}`}
        >
          <span className="font-mono">
            {formatTttiE8(auction.carriedOverE8s, lang)} TTTI-T
            <FiatAmount
              token="ttti"
              amount={auction.carriedOverE8s}
              className="ml-1.5"
              ocid={`auction.closed.carried_fiat.${key}`}
            />
          </span>
        </Row>
        <Row
          label={t.resultOffersLabel}
          ocid={`auction.closed.bid_count.${key}`}
        >
          <span className="font-mono">{auction.bidCount.toString()}</span>
        </Row>
        <Row
          label={t.settlementSummaryLabel}
          ocid={`auction.closed.settlement.${key}`}
        >
          {t.settlementSummary(
            auction.settlement.settledCount.toString(),
            auction.settlement.pendingCount.toString(),
            auction.settlement.failedCount.toString(),
          )}
        </Row>
        {auction.settlement.failedCount > 0n && (
          <Row
            label={t.settlementFailedCarriedLabel}
            ocid={`auction.closed.failed_carried.${key}`}
          >
            <span className="font-mono">
              {formatTttiE8(auction.settlement.failedCarriedE8s, lang)} TTTI-T
              <FiatAmount
                token="ttti"
                amount={auction.settlement.failedCarriedE8s}
                className="ml-1.5"
                ocid={`auction.closed.failed_carried_fiat.${key}`}
              />
            </span>
          </Row>
        )}
      </dl>

      <ClosedReserve auction={auction} />

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <h4 className="text-sm font-medium">{t.offersHeading}</h4>
        {result.isPending ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid={`auction.closed.loading_state.${key}`}
          >
            {t.loading}
          </p>
        ) : result.isError ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid={`auction.closed.error_state.${key}`}
          >
            {t.loadError}
          </p>
        ) : !result.data ? (
          <p className="text-sm text-muted-foreground">
            {t.resultNotPublished}
          </p>
        ) : result.data.bids.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid={`auction.closed.empty_state.${key}`}
          >
            {t.offersEmpty}
          </p>
        ) : (
          <Table data-ocid={`auction.closed.table.${key}`}>
            <TableHeader>
              <TableRow>
                <TableHead>{t.colBidder}</TableHead>
                <TableHead>{t.colQuantity}</TableHead>
                <TableHead>{t.colPrice}</TableHead>
                <TableHead>{t.colToken}</TableHead>
                <TableHead>{t.colOutcome}</TableHead>
                <TableHead>{t.colServed}</TableHead>
                <TableHead>{t.colReturned}</TableHead>
                <TableHead>{t.colSettlement}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.bids.map((bid, index) => {
                const bidder = bid.bidder.toText();
                return (
                  <TableRow
                    key={bid.id.toString()}
                    data-ocid={`auction.closed.item.${index + 1}`}
                  >
                    <TableCell className="whitespace-nowrap font-mono">
                      <span title={bidder}>{shortPrincipal(bidder)}</span>
                      {bidder === callerText && (
                        <span className="ms-2 rounded-full border border-gold px-2 py-0.5 text-xs font-medium text-primary">
                          {t.youBadge}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatTttiE8(bid.quantityE8s, lang)}
                      <FiatAmount
                        token="ttti"
                        amount={bid.quantityE8s}
                        className="ml-1.5"
                        ocid={`auction.closed.quantity_fiat.${index + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatPayAmount(bid.priceB, bid.token, lang)}
                      <FiatAmount
                        token={bid.token}
                        amount={bid.priceB}
                        className="ml-1.5"
                        ocid={`auction.closed.price_fiat.${index + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {PAY_TOKENS[bid.token].symbol}
                    </TableCell>
                    <TableCell>{outcomeText(t, bid.outcome)}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatTttiE8(bid.servedE8s, lang)}
                      <FiatAmount
                        token="ttti"
                        amount={bid.servedE8s}
                        className="ml-1.5"
                        ocid={`auction.closed.served_item_fiat.${index + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatPayAmount(bid.returned, bid.token, lang)}
                      <FiatAmount
                        token={bid.token}
                        amount={bid.returned}
                        className="ml-1.5"
                        ocid={`auction.closed.returned_fiat.${index + 1}`}
                      />
                    </TableCell>
                    <TableCell
                      data-ocid={`auction.closed.settlement_status.${index + 1}`}
                    >
                      {settlementStatusText(t, bid.settlement.status)}
                      {bid.settlement.status === SettlementStatus__1.failed && (
                        <span className="block font-mono text-xs tabular-nums text-muted-foreground">
                          {t.settlementFailedCarried(
                            formatTttiE8(bid.settlement.carriedE8s, lang),
                          )}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {winners.length > 0 && (
          <div
            className="flex flex-col gap-3 pt-4"
            data-ocid={`auction.settlement.section.${key}`}
          >
            <h4 className="text-sm font-medium">{t.settlementHeading}</h4>
            <p className="text-sm text-muted-foreground">{t.settlementRule}</p>
            <ul className="flex flex-col gap-2">
              {winners.map((bid, index) => (
                <SettlementDetail
                  key={bid.id.toString()}
                  bid={bid}
                  settlement={bid.settlement}
                  index={index + 1}
                  callerText={callerText}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
