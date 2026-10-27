import { AlertTriangle, ChevronDown, History, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  type Buyback,
  type BuybackMass,
  type Conversion,
  ConversionStatus,
  type PayToken,
} from "../../backend";
import { useBuybackMasses, useMyBuybacks } from "../../hooks/useBuyback";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useMyConversions } from "../../hooks/useQueries";
import { WALLET_HISTORY_PAGE_SIZE } from "../../hooks/useWallet";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { WALLET_EXPLORER_TEXT, WALLET_TEXT } from "../../i18n/pages/wallet";
import { buybackForPurchase, massBuybacks, massFor } from "../../lib/buyback";
import type { BlockLinkTarget } from "../../lib/explorer";
import {
  formatBlockIndex,
  formatFeeQuantity,
  formatNetQuantity,
  formatPaidQuantity,
  formatPaidTokenPerTtti,
  formatPurchaseDate,
  formatTttiPerPaidToken,
  formatTttiReceived,
  mintBlockTarget,
  paymentBlockTarget,
} from "../../lib/purchaseHistory";
import { encodeAccountText, payTokenSymbol } from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { HistoryPager } from "./HistoryPager";
import {
  BuybackRecordState,
  PurchaseBuybackState,
} from "./PurchaseBuybackState";

type WalletText = (typeof WALLET_TEXT)["en"];

const OUTLINE_GOLD =
  "rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

const STATUS_CLASS: Record<ConversionStatus, string> = {
  [ConversionStatus.completed]: "border-gold text-primary",
  [ConversionStatus.refunded]: "border-border text-muted-foreground",
  [ConversionStatus.failed]: "border-destructive/50 text-destructive",
  [ConversionStatus.refundFailed]: "border-destructive/50 text-destructive",
  [ConversionStatus.refundReview]: "border-destructive/50 text-destructive",
};

function statusLabel(status: ConversionStatus, t: WalletText): string {
  switch (status) {
    case ConversionStatus.completed:
      return t.historyStatusCompleted;
    case ConversionStatus.refunded:
      return t.historyStatusRefunded;
    case ConversionStatus.failed:
      return t.historyStatusFailed;
    case ConversionStatus.refundFailed:
      return t.historyStatusRefundFailed;
    case ConversionStatus.refundReview:
      return t.historyStatusRefundReview;
  }
}

function Field({
  label,
  value,
  unavailable,
  emphasis = false,
  mono = false,
  link,
}: {
  label: string;
  value: string | null;
  unavailable: string;
  emphasis?: boolean;
  mono?: boolean;
  /** Explorer target and label; the value stays displayed unchanged. */
  link?: { target: BlockLinkTarget | null; label: string; ocid: string };
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`break-words text-sm tabular-nums ${mono ? "font-mono" : ""} ${
          value === null
            ? "text-muted-foreground"
            : emphasis
              ? "font-semibold text-foreground"
              : "text-foreground"
        }`}
      >
        {value !== null && link?.target ? (
          <ExplorerLink
            target={link.target}
            label={link.label}
            data-ocid={link.ocid}
          >
            {value}
          </ExplorerLink>
        ) : (
          (value ?? unavailable)
        )}
      </dd>
    </div>
  );
}

function PurchaseRow({
  conversion,
  index,
  t,
  buyback,
  mass,
  buybacksReady,
  isBuyer,
  onBuyback,
}: {
  conversion: Conversion;
  index: number;
  t: WalletText;
  buyback: Buyback | undefined;
  mass: BuybackMass | undefined;
  buybacksReady: boolean;
  isBuyer: boolean;
  onBuyback?: (purchaseId: bigint) => void;
}) {
  const { lang } = useLanguage();
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const [open, setOpen] = useState(false);
  const na = t.historyUnavailable;
  const detailsId = `purchase-details-${conversion.id.toString()}`;

  return (
    <li
      className="flex flex-col gap-5 rounded-lg border border-border bg-background/40 p-4 md:p-6"
      data-ocid={`wallet.history.item.${index}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground tabular-nums">
          {formatPurchaseDate(conversion, lang) ?? na}
        </p>
        <Badge
          variant="outline"
          className={`rounded-full font-mono ${STATUS_CLASS[conversion.status]}`}
          aria-label={`${t.historyStatus}: ${statusLabel(conversion.status, t)}`}
        >
          {statusLabel(conversion.status, t)}
        </Badge>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label={t.historyPaidToken}
          value={payTokenSymbol(conversion.payToken)}
          unavailable={na}
          mono
        />
        <Field
          label={t.historyPaid}
          value={formatPaidQuantity(conversion, lang)}
          unavailable={na}
        />
        <Field
          label={t.historyFee}
          value={formatFeeQuantity(conversion, lang)}
          unavailable={na}
        />
        <Field
          label={t.historyNet}
          value={formatNetQuantity(conversion, lang)}
          unavailable={na}
          emphasis
        />
        <Field
          label={t.historyReceived}
          value={formatTttiReceived(conversion, lang)}
          unavailable={na}
          emphasis
        />
        <div className="hidden lg:block" aria-hidden="true" />
        <Field
          label={t.historyRatioTttiPerPaid}
          value={formatTttiPerPaidToken(conversion, lang)}
          unavailable={na}
        />
        <Field
          label={t.historyRatioPaidPerTtti}
          value={formatPaidTokenPerTtti(conversion, lang)}
          unavailable={na}
        />
      </dl>

      <PurchaseBuybackState
        conversion={conversion}
        buyback={buyback}
        mass={mass}
        buybacksReady={buybacksReady}
        isBuyer={isBuyer}
        index={index}
        onBuyback={onBuyback}
      />

      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 self-start rounded-lg px-2 text-primary transition-smooth hover:bg-primary/10 hover:text-foreground sm:min-h-9"
          aria-expanded={open}
          aria-controls={detailsId}
          onClick={() => setOpen((v) => !v)}
          data-ocid={`wallet.history.toggle.${index}`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
          {open ? t.historyHideDetails : t.historyShowDetails}
        </Button>
        {open && (
          <dl
            id={detailsId}
            className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3"
            data-ocid={`wallet.history.panel.${index}`}
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <Field
                label={t.historyRecipient}
                value={encodeAccountText(conversion.recipient)}
                unavailable={na}
                mono
              />
            </div>
            <Field
              label={t.historyPaymentBlock}
              value={formatBlockIndex(conversion.paymentBlock)}
              unavailable={na}
              mono
              link={{
                target: paymentBlockTarget(conversion),
                label: tx.viewOnIcpDashboard,
                ocid: `wallet.history.payment_block.link.${index}`,
              }}
            />
            <Field
              label={t.historyMintBlock}
              value={formatBlockIndex(conversion.mintBlock)}
              unavailable={na}
              mono
              link={{
                target: mintBlockTarget(conversion),
                label: tx.viewBlockInHistory,
                ocid: `wallet.history.mint_block.link.${index}`,
              }}
            />
          </dl>
        )}
      </div>
    </li>
  );
}

interface PurchaseHistorySectionProps {
  /** Only purchases paid with this token (all purchases when absent). */
  payToken?: PayToken;
  /** Section title; defaults to the purchase history title. */
  title?: string;
  /** Opens the buyback flow on the mass of a purchase's payment token. */
  onBuyback?: (purchaseId: bigint) => void;
}

/**
 * The user's purchases, newest first, 25 per page, with the buyback state of
 * each purchase's mass, then the mass buybacks.
 */
export function PurchaseHistorySection({
  payToken,
  title,
  onBuyback,
}: PurchaseHistorySectionProps = {}) {
  const t = useDict(WALLET_TEXT);
  const tb = useDict(BUYBACK_TEXT);
  const { data, isLoading, isError, isFetching, refetch } = useMyConversions();
  const { data: buybacks } = useMyBuybacks();
  const masses = useBuybackMasses();
  const buybacksReady =
    buybacks !== undefined && (masses.data !== undefined || masses.isError);
  const records = massBuybacks(buybacks, payToken);
  const { identity } = useInternetIdentity();
  const callerText = identity?.getPrincipal().toText();
  const [page, setPage] = useState(1);

  const purchases = useMemo(
    () =>
      (data ?? [])
        .filter((c) => payToken === undefined || c.payToken === payToken)
        .sort((a, b) =>
          a.timestamp === b.timestamp
            ? Number(b.id - a.id)
            : b.timestamp > a.timestamp
              ? 1
              : -1,
        ),
    [data, payToken],
  );
  const pageCount = Math.max(
    1,
    Math.ceil(purchases.length / WALLET_HISTORY_PAGE_SIZE),
  );
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * WALLET_HISTORY_PAGE_SIZE;
  const visible = purchases.slice(offset, offset + WALLET_HISTORY_PAGE_SIZE);

  return (
    <section
      className="flex flex-col gap-4 md:gap-6"
      data-ocid="wallet.history.section"
    >
      <Card className="rounded-lg border-gold bg-card shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <History className="h-5 w-5 text-primary" />
            {title ?? t.historyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div
              className="flex flex-col items-center gap-4 py-10 text-center"
              data-ocid="wallet.history.error_state"
            >
              <p
                className="flex items-center gap-2 text-sm text-destructive"
                aria-live="polite"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {t.historyError}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={OUTLINE_GOLD}
                onClick={() => void refetch()}
                disabled={isFetching}
                data-ocid="wallet.history.retry_button"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin motion-reduce:animate-none" : ""}`}
                />
                {t.retry}
              </Button>
            </div>
          ) : isLoading || data === undefined ? (
            <div
              className="flex flex-col gap-4"
              aria-busy="true"
              data-ocid="wallet.history.loading_state"
            >
              <span className="sr-only">{t.historyLoading}</span>
              {Array.from({ length: 3 }, (_, i) => `history-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-40 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : purchases.length === 0 ? (
            <p
              className="rounded-lg border border-dashed border-gold py-10 text-center text-muted-foreground"
              data-ocid="wallet.history.empty_state"
            >
              {t.historyEmpty}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <ul
                className="flex flex-col gap-4"
                data-ocid="wallet.history.list"
              >
                {visible.map((conversion, i) => (
                  <PurchaseRow
                    key={conversion.id.toString()}
                    conversion={conversion}
                    index={offset + i + 1}
                    t={t}
                    buyback={buybackForPurchase(buybacks, conversion.id)}
                    mass={massFor(masses.data, conversion.payToken)}
                    buybacksReady={buybacksReady}
                    isBuyer={conversion.depositor.toText() === callerText}
                    onBuyback={onBuyback}
                  />
                ))}
              </ul>
              {pageCount > 1 && (
                <HistoryPager
                  page={currentPage}
                  hasNext={currentPage < pageCount}
                  onPrevious={() => setPage(currentPage - 1)}
                  onNext={() => setPage(currentPage + 1)}
                  ocid="wallet.history"
                />
              )}
              {buybacksReady && records.length > 0 && (
                <section
                  className="flex flex-col gap-4 border-t border-border pt-4"
                  data-ocid="wallet.history.mass_buybacks.section"
                >
                  <h3 className="font-display text-base">
                    {tb.historyMassTitle}
                  </h3>
                  <ul
                    className="flex flex-col gap-4"
                    data-ocid="wallet.history.mass_buybacks.list"
                  >
                    {records.map((record, i) => (
                      <li
                        key={record.id.toString()}
                        className="rounded-lg border border-border bg-background/40 p-4 md:p-6"
                        data-ocid={`wallet.history.mass_buybacks.item.${i + 1}`}
                      >
                        <BuybackRecordState
                          buyback={record}
                          isBuyer={record.buyer.toText() === callerText}
                          index={i + 1}
                          ocid="wallet.history.mass_buyback"
                          bordered={false}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
