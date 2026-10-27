import type { Principal } from "@icp-sdk/core/principal";
import { AlertCircle } from "lucide-react";
import type { Buyback, BuybackMass } from "../../backend";
import { useAllBuybackMasses, useAllBuybacks } from "../../hooks/useBuyback";
import {
  BUYBACK_TEXT,
  BUYBACK_ADMIN_TEXT as T,
} from "../../i18n/pages/buyback";
import {
  buybackRuleLabel,
  buybackStatusLabel,
  formatAmountReturned,
  formatBuybackPercent,
  formatMassRatio,
  formatTttiQuantity,
  massBuybacks,
  payoutBlockTarget,
  pullBlockTarget,
} from "../../lib/buyback";
import {
  PAY_TOKEN_ORDER,
  formatPayAmount,
  payTokenSymbol,
} from "../../lib/token";
import { ExplorerLink } from "../ExplorerLink";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

/** Admin views are English with en-US numbers. */
const BB = BUYBACK_TEXT.en;

const HEAD_CLASS =
  "bg-secondary [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground";

function shortPrincipal(principal: Principal): string {
  const text = principal.toText();
  return text.length <= 18 ? text : `${text.slice(0, 9)}…${text.slice(-6)}`;
}

function formatDate(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function massState(mass: BuybackMass): string {
  if (mass.inProgress) return T.stateInProgress;
  return mass.remainingTtti > 0n ? T.stateOpen : T.stateDone;
}

function sortByBuyerAndToken(masses: Array<BuybackMass>): Array<BuybackMass> {
  return [...masses].sort((a, b) => {
    const buyer = a.buyer.toText().localeCompare(b.buyer.toText());
    return buyer !== 0
      ? buyer
      : PAY_TOKEN_ORDER.indexOf(a.token) - PAY_TOKEN_ORDER.indexOf(b.token);
  });
}

/** Every buyer's average masses, one row per buyer and payment token. */
export function BuybackMassSummary() {
  const { data, isLoading, isError } = useAllBuybackMasses();
  const rows = sortByBuyerAndToken(data ?? []);

  return (
    <section className="space-y-3" data-ocid="admin.buyback_masses_section">
      <h3 className="font-display text-base">{T.massTitle}</h3>
      <p className="text-xs text-muted-foreground">{T.massIntro}</p>
      {isLoading ? (
        <Skeleton
          className="h-24 w-full rounded-lg"
          data-ocid="admin.buyback_masses_loading_state"
        />
      ) : isError ? (
        <Alert
          variant="destructive"
          data-ocid="admin.buyback_masses_error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{T.massLoadError}</AlertDescription>
        </Alert>
      ) : rows.length === 0 ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="admin.buyback_masses_empty_state"
        >
          {T.massEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table data-ocid="admin.buyback_masses_table">
            <TableHeader className={HEAD_CLASS}>
              <TableRow>
                <TableHead>{T.colBuyer}</TableHead>
                <TableHead>{T.colToken}</TableHead>
                <TableHead className="text-right">{T.colPurchases}</TableHead>
                <TableHead className="text-right">{T.colTotalNet}</TableHead>
                <TableHead className="text-right">{T.colTotalTtti}</TableHead>
                <TableHead className="text-right">{T.colRatio}</TableHead>
                <TableHead className="text-right">
                  {T.colBoughtBackTtti}
                </TableHead>
                <TableHead className="text-right">
                  {T.colRemainingTtti}
                </TableHead>
                <TableHead className="text-right">
                  {T.colRemainingNet}
                </TableHead>
                <TableHead>{T.colState}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m, i) => (
                <TableRow
                  key={`${m.buyer.toText()}-${m.token}`}
                  className="text-xs"
                  data-ocid={`admin.buyback_mass_row.${i + 1}`}
                >
                  <TableCell className="font-mono" title={m.buyer.toText()}>
                    {shortPrincipal(m.buyer)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {payTokenSymbol(m.token)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {m.purchaseCount.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatPayAmount(m.totalNet, m.token, "en")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatTttiQuantity(m.totalTtti, "en")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatMassRatio(m.token, m.totalNet, m.totalTtti, "en") ??
                      "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatTttiQuantity(m.boughtBackTtti, "en")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatTttiQuantity(m.remainingTtti, "en")}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
                    {formatPayAmount(m.remainingNet, m.token, "en")}
                  </TableCell>
                  <TableCell>{massState(m)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function BlockCell({
  block,
  target,
  label,
  ocid,
}: {
  block: bigint | undefined;
  target: ReturnType<typeof pullBlockTarget>;
  label: string;
  ocid: string;
}) {
  if (block === undefined || !target) {
    return <span className="text-muted-foreground">{BB.notRecorded}</span>;
  }
  return (
    <ExplorerLink target={target} label={label} data-ocid={ocid}>
      {block.toString()}
    </ExplorerLink>
  );
}

function RecordRows({
  records,
  offset,
}: {
  records: Array<Buyback>;
  offset: number;
}) {
  return (
    <>
      {records.map((b, i) => {
        const n = offset + i + 1;
        return (
          <TableRow
            key={b.id.toString()}
            className="text-xs"
            data-ocid={`admin.buyback_row.${n}`}
          >
            <TableCell className="whitespace-nowrap">
              {formatDate(b.timestamp)}
            </TableCell>
            <TableCell className="font-mono whitespace-nowrap">
              {b.purchaseId === undefined
                ? payTokenSymbol(b.originalToken)
                : T.legacyPurchase(b.purchaseId.toString())}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {b.purchaseId === undefined
                ? formatBuybackPercent(b.percent, "en")
                : "—"}
            </TableCell>
            <TableCell className="font-mono" title={b.buyer.toText()}>
              {shortPrincipal(b.buyer)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
              {formatTttiQuantity(b.tttiAmount, "en")}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums whitespace-nowrap">
              {formatAmountReturned(b, "en")}
            </TableCell>
            <TableCell>{buybackRuleLabel(b.rule, BB)}</TableCell>
            <TableCell>
              {buybackStatusLabel(b.status, BB)}
              {b.message && (
                <span className="block text-muted-foreground break-words">
                  {b.message}
                </span>
              )}
            </TableCell>
            <TableCell className="font-mono">
              <BlockCell
                block={b.pullBlock}
                target={pullBlockTarget(b)}
                label="View block on the History page"
                ocid={`admin.buyback_pull_link.${n}`}
              />
            </TableCell>
            <TableCell className="font-mono">
              <BlockCell
                block={b.payoutBlock}
                target={payoutBlockTarget(b)}
                label="View on the ICP Dashboard"
                ocid={`admin.buyback_payout_link.${n}`}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

/**
 * Every buyback grouped by mass (payment token) with the percentage of the
 * remainder, then the per-purchase records made before mass buybacks.
 */
export function MassBuybackRecords() {
  const { data, isLoading, isError } = useAllBuybacks();
  const groups = PAY_TOKEN_ORDER.map((token) => ({
    token,
    records: massBuybacks(data, token),
  })).filter((g) => g.records.length > 0);
  const legacy = (data ?? [])
    .filter((b) => b.purchaseId !== undefined)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  let offset = 0;

  return (
    <section className="space-y-3" data-ocid="admin.buyback_records_section">
      <h3 className="font-display text-base">{T.listTitle}</h3>
      <p className="text-xs text-muted-foreground">{T.listIntro}</p>
      {isLoading ? (
        <Skeleton
          className="h-24 w-full rounded-lg"
          data-ocid="admin.buyback_records_loading_state"
        />
      ) : isError ? (
        <Alert
          variant="destructive"
          data-ocid="admin.buyback_records_error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{T.listLoadError}</AlertDescription>
        </Alert>
      ) : groups.length === 0 && legacy.length === 0 ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="admin.buyback_records_empty_state"
        >
          {T.listEmpty}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table data-ocid="admin.buyback_records_table">
            <TableHeader className={HEAD_CLASS}>
              <TableRow>
                <TableHead>{T.colDate}</TableHead>
                <TableHead>{T.colMass}</TableHead>
                <TableHead className="text-right">{T.colPercent}</TableHead>
                <TableHead>{T.colBuyer}</TableHead>
                <TableHead className="text-right">{T.colTtti}</TableHead>
                <TableHead className="text-right">{T.colReturned}</TableHead>
                <TableHead>{T.colRule}</TableHead>
                <TableHead>{T.colStatus}</TableHead>
                <TableHead>{BB.pullBlockLabel}</TableHead>
                <TableHead>{T.colPayoutBlock}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...groups, { token: null, records: legacy }].map((group) => {
                if (group.records.length === 0) return null;
                const start = offset;
                offset += group.records.length;
                return (
                  <RecordGroup
                    key={group.token ?? "legacy"}
                    title={
                      group.token === null
                        ? T.legacyTitle
                        : T.massGroupTitle(payTokenSymbol(group.token))
                    }
                    records={group.records}
                    offset={start}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function RecordGroup({
  title,
  records,
  offset,
}: {
  title: string;
  records: Array<Buyback>;
  offset: number;
}) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell colSpan={10} className="text-xs font-semibold">
          {title}
        </TableCell>
      </TableRow>
      <RecordRows records={records} offset={offset} />
    </>
  );
}
