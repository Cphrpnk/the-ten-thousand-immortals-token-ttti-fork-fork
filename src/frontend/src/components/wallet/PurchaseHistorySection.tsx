import { AlertTriangle, ChevronDown, History, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { type Conversion, ConversionStatus } from "../../backend";
import { useMyConversions } from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core";
import { WALLET_EXPLORER_TEXT, WALLET_TEXT } from "../../i18n/pages/wallet";
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

type WalletText = (typeof WALLET_TEXT)["en"];

const OUTLINE_GOLD =
  "rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

const STATUS_CLASS: Record<ConversionStatus, string> = {
  [ConversionStatus.completed]: "border-gold text-primary",
  [ConversionStatus.refunded]: "border-border text-muted-foreground",
  [ConversionStatus.failed]: "border-destructive/50 text-destructive",
  [ConversionStatus.refundFailed]: "border-destructive/50 text-destructive",
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
}: {
  conversion: Conversion;
  index: number;
  t: WalletText;
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

export function PurchaseHistorySection() {
  const t = useDict(WALLET_TEXT);
  const { data, isLoading, isError, isFetching, refetch } = useMyConversions();

  const purchases = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) =>
        a.timestamp === b.timestamp
          ? Number(b.id - a.id)
          : b.timestamp > a.timestamp
            ? 1
            : -1,
      ),
    [data],
  );

  return (
    <section
      className="flex flex-col gap-4 md:gap-6"
      data-ocid="wallet.history.section"
    >
      <Card className="rounded-lg border-gold bg-card shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <History className="h-5 w-5 text-primary" />
            {t.historyTitle}
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
            <ul className="flex flex-col gap-4" data-ocid="wallet.history.list">
              {purchases.map((conversion, i) => (
                <PurchaseRow
                  key={conversion.id.toString()}
                  conversion={conversion}
                  index={i + 1}
                  t={t}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
