import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  History,
  Undo2,
} from "lucide-react";
import { Fragment } from "react";
import type { Buyback, Conversion } from "../../backend";
import { ConversionStatus } from "../../backend";
import { useAllBuybacks } from "../../hooks/useBuyback";
import { useConversions } from "../../hooks/useQueries";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import {
  buybackFeeLabel,
  buybackForPurchase,
  buybackRuleLabel,
  buybackStatusLabel,
  formatAmountReturned,
  formatBuybackFee,
  formatThirdPartyFees,
  formatTttiQuantity,
  isBuybackEligible,
  payoutBlockTarget,
  pullBlockTarget,
} from "../../lib/buyback";
import type { BlockLinkTarget } from "../../lib/explorer";
import {
  formatBlockIndex,
  formatFeeQuantity,
  formatNetQuantity,
  formatPaidQuantity,
  formatPaidTokenPerTtti,
  formatTttiPerPaidToken,
  formatTttiReceived,
  mintBlockTarget,
  paymentBlockTarget,
} from "../../lib/purchaseHistory";
import {
  TTTI_SYMBOL,
  encodeAccountText,
  formatBps,
  formatUsdE8,
  payTokenSymbol,
  truncateAccountText,
} from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/** Format a nanosecond bigint timestamp as a locale string. */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Historical conversion rows keep their recorded message unchanged. */
function safeConversionMessage(message: string | undefined): string {
  return message ?? "";
}

const UNAVAILABLE = "Unavailable";
const AUDIT_RATE_LABEL = "Rate at purchase (audit)";

const DASHBOARD_LINK_LABEL = "View on the ICP Dashboard";
const HISTORY_LINK_LABEL = "View block on the History page";

interface PurchaseDetail {
  label: string;
  value: string;
  /** Explorer target when the value is a linkable block index. */
  target?: BlockLinkTarget | null;
  linkLabel?: string;
  /** data-ocid token of the link: "payment_block" or "mint_block". */
  linkKey?: string;
}

/** Detail value, rendered as an explorer link when it has a target. */
function DetailValue({
  detail,
  ocid,
}: { detail: PurchaseDetail; ocid: string }) {
  if (!detail.target || !detail.linkLabel) return <>{detail.value}</>;
  return (
    <ExplorerLink
      target={detail.target}
      label={detail.linkLabel}
      className="text-xs"
      data-ocid={ocid}
    >
      {detail.value}
    </ExplorerLink>
  );
}

/** Purchase details shared by the desktop detail row and the mobile list. */
function purchaseDetails(c: Conversion): PurchaseDetail[] {
  return [
    {
      label: "Net (refundable basis, fee excluded)",
      value: formatNetQuantity(c, "en") ?? UNAVAILABLE,
    },
    {
      label: `${TTTI_SYMBOL} per paid token`,
      value: formatTttiPerPaidToken(c, "en") ?? UNAVAILABLE,
    },
    {
      label: `Paid token per ${TTTI_SYMBOL}`,
      value: formatPaidTokenPerTtti(c, "en") ?? UNAVAILABLE,
    },
    {
      label: "Payment block",
      value: formatBlockIndex(c.paymentBlock) ?? UNAVAILABLE,
      target: paymentBlockTarget(c),
      linkLabel: DASHBOARD_LINK_LABEL,
      linkKey: "payment_block",
    },
    {
      label: "Mint block",
      value: formatBlockIndex(c.mintBlock) ?? UNAVAILABLE,
      target: mintBlockTarget(c),
      linkLabel: HISTORY_LINK_LABEL,
      linkKey: "mint_block",
    },
  ];
}

const BB = BUYBACK_TEXT.en;

/**
 * Buyback data of a purchase, shared by both layouts: its per-purchase record
 * made before mass buybacks, or the mass it counts in.
 */
function buybackDetails(
  c: Conversion,
  b: Buyback | undefined,
): PurchaseDetail[] {
  if (!b) {
    return [
      {
        label: BB.historyLabel,
        value: isBuybackEligible(c)
          ? `Counted in the ${payTokenSymbol(c.payToken)} mass (mass buybacks are listed in the Buybacks card)`
          : "Not eligible",
      },
    ];
  }
  return [
    { label: BB.historyLabel, value: buybackStatusLabel(b.status, BB) },
    { label: BB.ruleLabel, value: buybackRuleLabel(b.rule, BB) },
    {
      label: BB.amountReturnedLabel,
      value: formatAmountReturned(b, "en"),
    },
    {
      label: BB.feeLabel(buybackFeeLabel("en")),
      value: formatBuybackFee(b, "en"),
    },
    { label: BB.thirdPartyLabel, value: formatThirdPartyFees(b, "en") },
    {
      label: `${TTTI_SYMBOL} taken back`,
      value: formatTttiQuantity(b.tttiAmount, "en"),
    },
    { label: "Buyback date", value: formatTimestamp(b.timestamp) },
    {
      label: BB.pullBlockLabel,
      value: formatBlockIndex(b.pullBlock) ?? BB.notRecorded,
      target: pullBlockTarget(b),
      linkLabel: HISTORY_LINK_LABEL,
      linkKey: "buyback_pull_block",
    },
    {
      label: BB.payoutBlockLabel(payTokenSymbol(b.tokenReturned)),
      value: formatBlockIndex(b.payoutBlock) ?? BB.notRecorded,
      target: payoutBlockTarget(b),
      linkLabel: DASHBOARD_LINK_LABEL,
      linkKey: "buyback_payout_block",
    },
    ...(b.message ? [{ label: "Buyback message", value: b.message }] : []),
  ];
}

function truncatePrincipal(principal: Principal): string {
  const text = principal.toText();
  if (text.length <= 18) return text;
  return `${text.slice(0, 9)}…${text.slice(-6)}`;
}

const STATUS_STYLES: Record<
  ConversionStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  [ConversionStatus.completed]: {
    label: "Completed",
    className: "border-success/30 bg-success/10 text-success",
    icon: CheckCircle2,
  },
  [ConversionStatus.refunded]: {
    label: "Refunded",
    className: "border-warning/40 bg-warning/10 text-warning",
    icon: Undo2,
  },
  [ConversionStatus.refundFailed]: {
    label: "Refund failed",
    className:
      "border-destructive/50 bg-destructive/20 text-destructive font-semibold",
    icon: AlertCircle,
  },
  [ConversionStatus.refundReview]: {
    label: "Refund under review",
    className: "border-warning/50 bg-warning/15 text-warning font-semibold",
    icon: AlertCircle,
  },
  [ConversionStatus.failed]: {
    label: "Failed",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
    icon: AlertCircle,
  },
};

function ConversionStatusBadge({ status }: { status: ConversionStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[ConversionStatus.failed];
  const Icon = style.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 ${style.className}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {style.label}
    </Badge>
  );
}

function ConversionList({
  conversions,
  buybacks,
}: {
  conversions: Conversion[];
  buybacks: Buyback[] | undefined;
}) {
  const sorted = [...conversions].sort((a, b) =>
    a.id < b.id ? 1 : a.id > b.id ? -1 : 0,
  );

  return (
    <>
      <div className="hidden md:block">
        <Table data-ocid="admin.conversions_table">
          <TableHeader className="sticky top-0 bg-secondary [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Depositor</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">{TTTI_SYMBOL}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((conversion, index) => (
              <Fragment key={conversion.id.toString()}>
                <TableRow
                  className="border-b-0 transition-smooth hover:bg-primary/5"
                  data-ocid={`admin.conversion_row.${index + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{conversion.id.toString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {truncatePrincipal(conversion.depositor)}
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs"
                    title={encodeAccountText(conversion.recipient)}
                  >
                    {truncateAccountText(
                      encodeAccountText(conversion.recipient),
                      9,
                      6,
                    )}
                  </TableCell>
                  <TableCell
                    className="text-right font-mono tabular-nums whitespace-nowrap"
                    data-ocid={`admin.conversion_paid.${index + 1}`}
                  >
                    {formatPaidQuantity(conversion, "en")}
                  </TableCell>
                  <TableCell
                    className="text-right font-mono text-xs tabular-nums whitespace-nowrap"
                    data-ocid={`admin.conversion_fee.${index + 1}`}
                  >
                    <div>
                      {formatFeeQuantity(conversion, "en") ?? UNAVAILABLE}
                    </div>
                    <div className="text-muted-foreground">
                      {formatBps(conversion.feeBps)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold tabular-nums text-primary whitespace-nowrap">
                    {formatTttiReceived(conversion, "en")}
                  </TableCell>
                  <TableCell>
                    <ConversionStatusBadge status={conversion.status} />
                  </TableCell>
                  <TableCell
                    className="max-w-56 truncate text-xs text-muted-foreground"
                    title={safeConversionMessage(conversion.message)}
                  >
                    {safeConversionMessage(conversion.message) || "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(conversion.timestamp)}
                  </TableCell>
                </TableRow>
                <TableRow
                  className="hover:bg-transparent"
                  data-ocid={`admin.conversion_details.${index + 1}`}
                >
                  <TableCell colSpan={9} className="pt-0 pb-3">
                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                      {purchaseDetails(conversion).map((detail) => (
                        <div key={detail.label} className="flex gap-1.5">
                          <dt className="text-muted-foreground">
                            {detail.label}
                          </dt>
                          <dd className="font-mono tabular-nums">
                            <DetailValue
                              detail={detail}
                              ocid={`admin.conversion_${detail.linkKey}_link.${index + 1}`}
                            />
                          </dd>
                        </div>
                      ))}
                      <div
                        className="flex gap-1.5 text-muted-foreground/70"
                        data-ocid={`admin.conversion_audit_rate.${index + 1}`}
                      >
                        <dt>{AUDIT_RATE_LABEL}</dt>
                        <dd className="font-mono tabular-nums">
                          {formatUsdE8(conversion.priceUsdE8)}
                        </dd>
                      </div>
                    </dl>
                    <dl
                      className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1 border-l border-gold pl-3 text-xs"
                      data-ocid={`admin.conversion_buyback.${index + 1}`}
                    >
                      {buybackDetails(
                        conversion,
                        buybackForPurchase(buybacks, conversion.id),
                      ).map((detail) => (
                        <div key={detail.label} className="flex gap-1.5">
                          <dt className="text-muted-foreground">
                            {detail.label}
                          </dt>
                          <dd className="font-mono tabular-nums">
                            <DetailValue
                              detail={detail}
                              ocid={`admin.conversion_${detail.linkKey}_link.${index + 1}`}
                            />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div
        className="space-y-3 p-4 md:hidden"
        data-ocid="admin.conversions_list"
      >
        {sorted.map((conversion, index) => (
          <div
            key={conversion.id.toString()}
            className="space-y-3 border-t border-border py-5"
            data-ocid={`admin.conversion_item.${index + 1}`}
          >
            <div className="flex items-center justify-between gap-3">
              <ConversionStatusBadge status={conversion.status} />
              <span className="font-mono text-xs text-muted-foreground">
                #{conversion.id.toString()}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {TTTI_SYMBOL} credited
              </span>
              <span className="font-mono font-semibold tabular-nums text-primary">
                {formatTttiReceived(conversion, "en")}
              </span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt className="text-muted-foreground">Paid</dt>
              <dd className="font-mono text-right tabular-nums">
                {formatPaidQuantity(conversion, "en")}
              </dd>
              <dt className="text-muted-foreground">Fee</dt>
              <dd className="font-mono text-right tabular-nums">
                {formatFeeQuantity(conversion, "en") ?? UNAVAILABLE}{" "}
                <span className="text-muted-foreground">
                  ({formatBps(conversion.feeBps)})
                </span>
              </dd>
              {purchaseDetails(conversion).map((detail) => (
                <Fragment key={detail.label}>
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="font-mono text-right tabular-nums break-words">
                    <DetailValue
                      detail={detail}
                      ocid={`admin.conversion_item_${detail.linkKey}_link.${index + 1}`}
                    />
                  </dd>
                </Fragment>
              ))}
              {buybackDetails(
                conversion,
                buybackForPurchase(buybacks, conversion.id),
              ).map((detail) => (
                <Fragment key={`buyback-${detail.label}`}>
                  <dt className="text-muted-foreground">{detail.label}</dt>
                  <dd className="font-mono text-right tabular-nums break-words">
                    <DetailValue
                      detail={detail}
                      ocid={`admin.conversion_item_${detail.linkKey}_link.${index + 1}`}
                    />
                  </dd>
                </Fragment>
              ))}
              <dt className="text-muted-foreground/70">{AUDIT_RATE_LABEL}</dt>
              <dd className="font-mono text-right tabular-nums text-muted-foreground/70">
                {formatUsdE8(conversion.priceUsdE8)}
              </dd>
              <dt className="text-muted-foreground">Depositor</dt>
              <dd className="font-mono text-right break-all">
                {conversion.depositor.toText()}
              </dd>
              <dt className="text-muted-foreground">Recipient</dt>
              <dd className="font-mono text-right break-all">
                {conversion.recipient.owner.toText()}
              </dd>
              <dt className="text-muted-foreground">Time</dt>
              <dd className="text-right">
                {formatTimestamp(conversion.timestamp)}
              </dd>
            </dl>
            {conversion.message && (
              <p className="text-xs text-muted-foreground break-words">
                {safeConversionMessage(conversion.message)}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/** Read-only list of every purchase, most recent first. */
export function ConversionsCard({ className }: { className: string }) {
  const { data: conversions, isLoading } = useConversions();
  const { data: buybacks } = useAllBuybacks();

  return (
    <Card className={className} data-ocid="admin.conversions_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <History className="w-5 h-5 text-primary" />
          {TTTI_SYMBOL} Conversions
        </CardTitle>
        <CardDescription>
          Every purchase with the token paid, the fee, the net refundable basis,
          the {TTTI_SYMBOL} received, the ratios, the block indexes, the USD
          price used and its status, with its per-purchase buyback record or the
          mass it counts in, most recent first. Read-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div
            className="space-y-3 p-6"
            data-ocid="admin.conversions_loading_state"
          >
            {Array.from(
              { length: 3 },
              (_, i) => `conversion-skeleton-${i}`,
            ).map((id) => (
              <Skeleton key={id} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !conversions || conversions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
            data-ocid="admin.conversions_empty_state"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-secondary text-primary">
              <Banknote className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold">
                No conversions yet
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Purchases converted into {TTTI_SYMBOL} are listed here.
              </p>
            </div>
          </div>
        ) : (
          <ConversionList conversions={conversions} buybacks={buybacks} />
        )}
      </CardContent>
    </Card>
  );
}
