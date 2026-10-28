import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useState } from "react";
import type {
  Account,
  OwnerSendSource,
  OwnerSendStatus,
  OwnerSendView,
} from "../../backend";
import { useOwnerSends } from "../../hooks/useQueries";
import { formatPayAmount, payTokenSymbol } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, SECONDARY_GOLD } from "./styles";

const PAGE_SIZE = 25n;

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function accountText(account: Account): string {
  const sub = toHex(account.subaccount);
  return sub ? `${account.owner.toText()} · ${sub}` : account.owner.toText();
}

function sourceText(source: OwnerSendSource): string {
  switch (source.__kind__) {
    case "mint":
      return `Mint #${source.mint.toString()}`;
    case "accumulated":
      return "Accumulated";
    case "treasurySweep":
      return "Treasury sweep";
  }
}

function StatusBadge({
  status,
  ocid,
}: { status: OwnerSendStatus; ocid: string }) {
  switch (status.__kind__) {
    case "pending":
      return (
        <Badge variant="secondary" data-ocid={ocid}>
          Pending
        </Badge>
      );
    case "sent":
      return (
        <Badge variant="secondary" className="text-success" data-ocid={ocid}>
          Sent
        </Badge>
      );
    case "needsReview":
      return (
        <Badge variant="destructive" data-ocid={ocid}>
          Needs review
        </Badge>
      );
    case "failed":
      return (
        <span className="space-y-0.5" data-ocid={ocid}>
          <Badge variant="destructive">Failed</Badge>
          <span className="block break-words text-destructive">
            {status.failed}
          </span>
        </span>
      );
  }
}

function SendRow({ item, index }: { item: OwnerSendView; index: number }) {
  return (
    <tr className="align-top" data-ocid={`admin.owner_sends.row.${index + 1}`}>
      <td className="py-2 pr-3 font-mono">#{item.id.toString()}</td>
      <td className="py-2 pr-3">{payTokenSymbol(item.token)}</td>
      <td className="py-2 pr-3 text-right font-mono tabular-nums">
        {formatPayAmount(item.amount, item.token, "en")}
      </td>
      <td className="py-2 pr-3 text-right font-mono tabular-nums">
        {item.fee === undefined
          ? "—"
          : formatPayAmount(item.fee, item.token, "en")}
      </td>
      <td className="max-w-56 py-2 pr-3 font-mono break-all">
        {accountText(item.destination)}
      </td>
      <td className="py-2 pr-3">{sourceText(item.source)}</td>
      <td className="py-2 pr-3">
        <StatusBadge
          status={item.status}
          ocid={`admin.owner_sends.status.${index + 1}`}
        />
        {item.lastError && item.status.__kind__ !== "failed" && (
          <span className="mt-1 block break-words text-muted-foreground">
            Last error: {item.lastError}
          </span>
        )}
      </td>
      <td className="py-2 pr-3 text-right font-mono tabular-nums">
        {item.block?.toString() ?? "—"}
      </td>
      <td className="py-2 pr-3 font-mono break-all">
        {item.memoText}
        <span className="block text-muted-foreground">
          attempt {item.attempt.toString()} · sends {item.sends.toString()}
        </span>
      </td>
      <td className="py-2 font-mono whitespace-nowrap text-muted-foreground">
        <span className="block">Created {formatTimestamp(item.createdAt)}</span>
        <span className="block">Updated {formatTimestamp(item.updatedAt)}</span>
      </td>
    </tr>
  );
}

/** Admin: paged history of the owner sends (OW), 25 per page. */
export function OwnerSendsCard() {
  const [page, setPage] = useState(0n);
  const offset = page * PAGE_SIZE;
  const { data, isLoading, isError, refetch } = useOwnerSends(
    offset,
    PAGE_SIZE,
  );
  const total = data?.total ?? 0n;
  const pageCount = total === 0n ? 1n : (total + PAGE_SIZE - 1n) / PAGE_SIZE;
  const hasNext = page + 1n < pageCount;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.owner_sends_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <History className="h-5 w-5 text-primary" />
          Owner Send History
        </CardTitle>
        <CardDescription>
          Every send to an owner destination (memo TTTI-OW), newest first.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton
            className="h-48 w-full"
            data-ocid="admin.owner_sends_loading_state"
          />
        ) : isError || !data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.owner_sends_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The owner sends could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.owner_sends_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : data.items.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.owner_sends.empty_state"
          >
            No owner send yet
          </p>
        ) : (
          <div className="max-h-[36rem] overflow-auto">
            <table className="w-full min-w-[60rem] text-xs">
              <thead className="sticky top-0 bg-card text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3 text-left font-normal">Id</th>
                  <th className="py-1.5 pr-3 text-left font-normal">Token</th>
                  <th className="py-1.5 pr-3 text-right font-normal">Amount</th>
                  <th className="py-1.5 pr-3 text-right font-normal">Fee</th>
                  <th className="py-1.5 pr-3 text-left font-normal">
                    Destination
                  </th>
                  <th className="py-1.5 pr-3 text-left font-normal">Source</th>
                  <th className="py-1.5 pr-3 text-left font-normal">Status</th>
                  <th className="py-1.5 pr-3 text-right font-normal">Block</th>
                  <th className="py-1.5 pr-3 text-left font-normal">Memo</th>
                  <th className="py-1.5 text-left font-normal">Dates</th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-border"
                data-ocid="admin.owner_sends.table"
              >
                {data.items.map((item, i) => (
                  <SendRow key={item.id.toString()} item={item} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-mono tabular-nums text-muted-foreground">
            Page {(page + 1n).toString()} of {pageCount.toString()} ·{" "}
            {total.toString()} sends
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={SECONDARY_GOLD}
              disabled={page === 0n}
              onClick={() => setPage((p) => (p > 0n ? p - 1n : 0n))}
              data-ocid="admin.owner_sends.pagination_prev"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={SECONDARY_GOLD}
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1n)}
              data-ocid="admin.owner_sends.pagination_next"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
