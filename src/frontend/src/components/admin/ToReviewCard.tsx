import { ClipboardCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  AttemptOutcome,
  DexToken,
  ReviewResult,
  TransferReview,
} from "../../backend";
import {
  BtcRefundPurpose,
  CollectState,
  ReviewError,
  TransferKind,
} from "../../backend";
import { useAllBuybacks } from "../../hooks/useBuyback";
import {
  useMarkBuybackCancelled,
  useMarkRefundedManually,
  useMarkTransferArrived,
  useMarkTransferNotArrived,
  useTransfersToReviewFiltered,
} from "../../hooks/useTransferReview";
import { buybackFailureMessage } from "../../lib/buyback";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import {
  ADMIN_TOKENS,
  ALL_TOKENS,
  AdminAccordion,
  type ChipOption,
  FilterChips,
  type TokenChoice,
  TokenSelect,
  adminTokenSymbol,
  formatTokenAmount,
} from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

export { formatTokenAmount } from "./AdminUi";

const KIND_LABELS: Record<TransferKind, string> = {
  [TransferKind.FW]: "FW · treasury forward",
  [TransferKind.SH]: "SH · reserve share",
  [TransferKind.RF]: "Refund (RF)",
  [TransferKind.PC]: "Payment to refund (PC)",
  [TransferKind.BR]: "BTC refund to verify (BR)",
  [TransferKind.BC]: "BTC cost send to treasury (BC)",
  [TransferKind.BM]: "Delivery-failure cost to refund (BM)",
  [TransferKind.BB]: "Buyback payment (BB)",
  [TransferKind.DD]: "DEX deposit (DD)",
  [TransferKind.DW]: "DEX withdrawal (DW)",
  [TransferKind.DQ]: "Pair request deposit refund (DQ)",
  [TransferKind.DC]: "Converted fees sent to the cycles reserve (DC)",
  [TransferKind.DL]: "ICP bonus claim paid to an LP (DL)",
  [TransferKind.OW]: "Mint revenue send to the receiving wallet (OW)",
  [TransferKind.SR]: "Treasury sweep send (SR)",
  [TransferKind.MF]: "Mint fee claim paid to an LP (MF)",
  [TransferKind.IR]: "ICPSwap routed swap transfer (IR)",
  [TransferKind.ST]: "One-time settlement send (ST)",
};

function tokenSymbol(token: DexToken): string {
  return adminTokenSymbol(token);
}

type ReviewGroup =
  | "all"
  | "mint"
  | "revenue"
  | "refund"
  | "buyback"
  | "dex"
  | "swap"
  | "fees";

const REVIEW_GROUPS: ReadonlyArray<
  ChipOption<ReviewGroup> & { kinds: ReadonlyArray<TransferKind> }
> = [
  { value: "all", label: "All", kinds: [] },
  {
    value: "mint",
    label: "Mint/Deposit",
    kinds: [TransferKind.PC, TransferKind.FW, TransferKind.SH, TransferKind.BC],
  },
  {
    value: "revenue",
    label: "Revenue & settlement",
    kinds: [TransferKind.OW, TransferKind.ST, TransferKind.SR],
  },
  {
    value: "refund",
    label: "Refund",
    kinds: [TransferKind.RF, TransferKind.BR, TransferKind.BM, TransferKind.DQ],
  },
  { value: "buyback", label: "Buyback", kinds: [TransferKind.BB] },
  { value: "swap", label: "Swap", kinds: [TransferKind.IR] },
  { value: "dex", label: "DEX", kinds: [TransferKind.DD, TransferKind.DW] },
  {
    value: "fees",
    label: "Fees & claims",
    kinds: [TransferKind.DC, TransferKind.DL, TransferKind.MF],
  },
];

const PURPOSE_LABELS: Record<BtcRefundPurpose, string> = {
  [BtcRefundPurpose.excess]: "Excess",
  [BtcRefundPurpose.fullRefund]: "Full refund",
  [BtcRefundPurpose.deliveryFailedExcess]: "Delivery-failed excess",
};

function outcomeText(outcome: AttemptOutcome | undefined): string {
  if (!outcome) return "—";
  switch (outcome.__kind__) {
    case "pending":
      return "Pending";
    case "unknown":
      return "Unknown";
    case "failed":
      return `Failed: ${outcome.failed}`;
    case "succeeded":
      return `Succeeded in block ${outcome.succeeded.toString()}`;
  }
}

const ID_LABELS: Record<TransferKind, string> = {
  [TransferKind.FW]: "Purchase",
  [TransferKind.SH]: "Purchase",
  [TransferKind.RF]: "Purchase",
  [TransferKind.PC]: "Trace",
  [TransferKind.BR]: "Attempt",
  [TransferKind.BC]: "Trace",
  [TransferKind.BM]: "Conversion",
  [TransferKind.BB]: "Buyback",
  [TransferKind.DD]: "Transfer",
  [TransferKind.DW]: "Transfer",
  [TransferKind.DQ]: "Pair request",
  [TransferKind.DC]: "DC send",
  [TransferKind.DL]: "Bonus claim",
  [TransferKind.OW]: "Owner send",
  [TransferKind.SR]: "Sweep send",
  [TransferKind.MF]: "Claim",
  [TransferKind.IR]: "Routed swap",
  [TransferKind.ST]: "Settlement send",
};

const COLLECT_LABELS: Record<CollectState, string> = {
  [CollectState.confirmed]: "Collect confirmed",
  [CollectState.unknown]: "Collect outcome unknown",
};

const REVIEW_ERRORS: Record<ReviewError, string> = {
  [ReviewError.notAdmin]: "Not admin",
  [ReviewError.notFound]: "Not found",
  [ReviewError.notUnderReview]: "Not under review",
  [ReviewError.notApplicable]: "This action does not apply to this item",
};

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function reviewMessage(result: ReviewResult, success: string): string {
  return result.__kind__ === "ok" ? success : REVIEW_ERRORS[result.err];
}

interface Field {
  label: string;
  value: string;
}

function amountText(value: bigint, t: TransferReview): string {
  return `${formatTokenAmount(value, t.token)} (${value.toString()} base units)`;
}

function commonFields(t: TransferReview): Field[] {
  return [
    { label: "Token", value: tokenSymbol(t.token) },
    { label: "Memo (text)", value: t.memoText ?? "—" },
    { label: "Memo (hex)", value: t.memoHex ?? "—" },
    {
      label: "created_at_time (ns)",
      value: t.createdAtTimeNs?.toString() ?? "—",
    },
    {
      label: "created_at_time (date)",
      value:
        t.createdAtTimeNs === undefined
          ? "—"
          : formatTimestamp(t.createdAtTimeNs),
    },
    { label: "Amount", value: amountText(t.amount, t) },
  ];
}

function reviewFields(t: TransferReview, legacy: boolean): Field[] {
  if (t.kind === TransferKind.BB) {
    return [
      { label: "Buyer", value: t.buyer?.toText() ?? "—" },
      { label: "Legacy (before escrow)", value: legacy ? "Yes" : "No" },
      ...commonFields(t),
      {
        label: "Fee",
        value: t.fee === undefined ? "—" : amountText(t.fee, t),
      },
      {
        label: "Destination owner",
        value: t.destination?.owner.toText() ?? "—",
      },
      {
        label: "Destination subaccount (hex)",
        value: t.destination
          ? toHex(t.destination.subaccount) || "Default"
          : "—",
      },
      { label: "TTTI-T pull block", value: t.block?.toString() ?? "—" },
      { label: "Sends", value: t.sends.toString() },
      { label: "Last error", value: t.lastError ?? "—" },
      { label: "Outcome", value: outcomeText(t.outcome) },
    ];
  }
  if (t.kind === TransferKind.BM) {
    return [
      { label: "Deposit index", value: t.depositIndex?.toString() ?? "—" },
      { label: "Principal", value: t.buyer?.toText() ?? "—" },
      { label: "Token", value: tokenSymbol(t.token) },
      { label: "Amount", value: amountText(t.amount, t) },
      { label: "Conversion id", value: t.conversionId?.toString() ?? "—" },
    ];
  }
  if (t.kind === TransferKind.BR || t.kind === TransferKind.BC) {
    return [
      { label: "Deposit index", value: t.depositIndex?.toString() ?? "—" },
      { label: "Principal", value: t.buyer?.toText() ?? "—" },
      {
        label: "Purpose",
        value: t.refundPurpose ? PURPOSE_LABELS[t.refundPurpose] : "—",
      },
      ...commonFields(t),
      { label: "Block", value: t.block?.toString() ?? "Unknown" },
      { label: "Outcome", value: outcomeText(t.outcome) },
    ];
  }
  if (
    t.kind === TransferKind.DD ||
    t.kind === TransferKind.DW ||
    t.kind === TransferKind.DQ ||
    t.kind === TransferKind.IR
  ) {
    return [
      {
        label:
          t.kind === TransferKind.DQ
            ? "Pair request id"
            : t.kind === TransferKind.IR
              ? "Routed swap id"
              : "Transfer n",
        value: t.purchaseId.toString(),
      },
      { label: "Owner", value: t.buyer?.toText() ?? "—" },
      ...commonFields(t),
      {
        label: "Fee",
        value: t.fee === undefined ? "—" : amountText(t.fee, t),
      },
      {
        label: "Destination owner",
        value: t.destination?.owner.toText() ?? "—",
      },
      {
        label: "Destination subaccount (hex)",
        value: t.destination
          ? toHex(t.destination.subaccount) || "Default"
          : "—",
      },
      { label: "Sends", value: t.sends.toString() },
      { label: "Last error", value: t.lastError ?? "—" },
      { label: "Outcome", value: outcomeText(t.outcome) },
    ];
  }
  if (t.kind === TransferKind.PC) {
    return [
      { label: "Buyer", value: t.destination?.owner.toText() ?? "—" },
      ...commonFields(t),
      { label: "Block", value: t.block?.toString() ?? "Unknown" },
      {
        label: "Collect",
        value: t.collect ? COLLECT_LABELS[t.collect] : "—",
      },
    ];
  }
  return [
    ...commonFields(t),
    {
      label: "Fee",
      value: t.fee === undefined ? "—" : amountText(t.fee, t),
    },
    {
      label: "Destination owner",
      value: t.destination?.owner.toText() ?? "—",
    },
    {
      label: "Destination subaccount (hex)",
      value: t.destination ? toHex(t.destination.subaccount) || "Default" : "—",
    },
    { label: "Sends", value: t.sends.toString() },
    { label: "Last error", value: t.lastError ?? "—" },
  ];
}

const NOT_ARRIVED_SUCCESS: Record<TransferKind, string> = {
  [TransferKind.FW]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.SH]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.RF]: "Marked as not arrived. A new refund attempt is pending.",
  [TransferKind.PC]: "Removed: this payment never happened.",
  [TransferKind.BR]: "Marked as not arrived. A new refund attempt is pending.",
  [TransferKind.BC]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.BM]: "This action does not apply to this item",
  [TransferKind.BB]:
    "Marked as not arrived. The buyer can retry the payout or cancel the buyback.",
  [TransferKind.DD]:
    "Marked as not arrived. The deposit is failed; no balance was credited.",
  [TransferKind.DW]:
    "Marked as not arrived. The amount is back in the owner's DEX balance.",
  [TransferKind.DQ]:
    "Marked as not arrived. A new refund attempt with a new memo is pending.",
  [TransferKind.DC]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.DL]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.OW]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.SR]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.MF]: "Marked as not arrived. A new attempt is pending.",
  [TransferKind.IR]:
    "Marked as not arrived. The input amount is back in the owner's DEX balance.",
  [TransferKind.ST]: "Marked as not arrived. A new attempt is pending.",
};

const ARRIVED_SUCCESS: Partial<Record<TransferKind, string>> = {
  [TransferKind.DD]: "The owner's DEX balance was credited once.",
  [TransferKind.DW]: "The withdrawal debit is final.",
  [TransferKind.DQ]: "The pair request deposit refund is complete.",
  [TransferKind.DC]: "The ICP send to the cycles reserve is recorded.",
  [TransferKind.DL]: "The ICP bonus claim is paid.",
  [TransferKind.OW]: "The send to the receiving wallet is recorded.",
  [TransferKind.ST]: "The settlement send is recorded.",
  [TransferKind.SR]: "The treasury sweep send is recorded.",
  [TransferKind.MF]: "The mint fee claim is paid.",
  [TransferKind.IR]: "The IR transfer to ICPSwap is recorded with its block.",
};

/** Short effect of each button for the DEX kinds. */
const DEX_HINTS: Partial<Record<TransferKind, string>> = {
  [TransferKind.DD]:
    "Enter the ledger block of the deposit. Arrived credits the owner's DEX balance once. Not arrived marks the deposit as failed with no credit.",
  [TransferKind.DW]:
    "Enter the ledger block of the withdrawal. Arrived makes the debit final. Not arrived gives the amount back to the owner's DEX balance.",
  [TransferKind.DQ]:
    "Enter the ledger block of the refund. Arrived closes the refund. Not arrived opens a new attempt with a new memo.",
  [TransferKind.DC]:
    "Enter the ICP ledger block of the send to the cycles reserve. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.DL]:
    "Enter the ICP ledger block of the bonus payment. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.OW]:
    "Enter the ledger block of the send to the receiving wallet. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.ST]:
    "Enter the ledger block of the one-time settlement send. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.SR]:
    "Enter the ledger block of the treasury sweep send. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.MF]:
    "Enter the ledger block of the mint fee claim payment. Arrived records the block. Not arrived opens a new attempt.",
  [TransferKind.IR]:
    "Enter the ledger block of the IR transfer to the ICPSwap deposit subaccount. Arrived records the block. Not arrived records that nothing moved and gives the input amount back to the owner's DEX balance.",
};

function ReviewRow({
  transfer,
  index,
  legacy,
}: { transfer: TransferReview; index: number; legacy: boolean }) {
  const [blockText, setBlockText] = useState("");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const arrived = useMarkTransferArrived();
  const notArrived = useMarkTransferNotArrived();
  const refunded = useMarkRefundedManually();
  const cancelled = useMarkBuybackCancelled();
  const pending =
    arrived.isPending ||
    notArrived.isPending ||
    refunded.isPending ||
    cancelled.isPending;
  const trimmed = blockText.trim();
  const blockValid = /^\d+$/.test(trimmed);
  const showBlockError = trimmed !== "" && !blockValid;
  const kind = transfer.kind;
  const purchaseId = transfer.purchaseId;
  const canArrive = kind !== TransferKind.PC && kind !== TransferKind.BM;
  const canRefund =
    kind === TransferKind.RF ||
    kind === TransferKind.PC ||
    kind === TransferKind.BM;
  const canNotArrive = kind !== TransferKind.BM;
  const canCancel = kind === TransferKind.BB && legacy;

  const report = (result: ReviewResult, success: string) => {
    const ok = result.__kind__ === "ok";
    const text = reviewMessage(result, success);
    setFeedback({ ok, text });
    if (ok) toast.success(text);
    else toast.error(text);
  };
  const reportError = (error: Error) => {
    const text = error.message || "The request failed.";
    setFeedback({ ok: false, text });
    toast.error(text);
  };

  const handleArrived = () => {
    if (!blockValid || pending) return;
    setFeedback(null);
    arrived.mutate(
      { kind, purchaseId, block: BigInt(trimmed) },
      {
        onSuccess: (result) =>
          report(
            result,
            `Marked as arrived in block ${trimmed}.${
              ARRIVED_SUCCESS[kind] ? ` ${ARRIVED_SUCCESS[kind]}` : ""
            }`,
          ),
        onError: reportError,
      },
    );
  };

  const handleRefunded = () => {
    if (!blockValid || pending) return;
    setFeedback(null);
    refunded.mutate(
      { kind, purchaseId, block: BigInt(trimmed) },
      {
        onSuccess: (result) =>
          report(result, `Marked as refunded manually in block ${trimmed}.`),
        onError: reportError,
      },
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canArrive) handleArrived();
    else handleRefunded();
  };

  const handleCancelled = () => {
    if (!blockValid || pending) return;
    setFeedback(null);
    cancelled.mutate(
      { buybackId: purchaseId, block: BigInt(trimmed) },
      {
        onSuccess: () => {
          const text = `Marked as cancelled with TTTI-T return block ${trimmed}.`;
          setFeedback({ ok: true, text });
          toast.success(text);
        },
        onError: (error) => {
          const text = buybackFailureMessage(error, "en");
          setFeedback({ ok: false, text });
          toast.error(text);
        },
      },
    );
  };

  const handleNotArrived = () => {
    if (pending) return;
    setFeedback(null);
    notArrived.mutate(
      { kind, purchaseId },
      {
        onSuccess: (result) => report(result, NOT_ARRIVED_SUCCESS[kind]),
        onError: reportError,
      },
    );
  };

  const ocid = (name: string) => `admin.to_review_${name}.${index + 1}`;
  const inputId = `review-block-${kind}-${purchaseId}`;

  return (
    <li
      className="space-y-4 border-t border-border py-5"
      data-ocid={ocid("item")}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-sm font-semibold text-primary">
          {KIND_LABELS[kind]}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {ID_LABELS[kind]} #{purchaseId.toString()}
        </span>
      </div>
      <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
        {reviewFields(transfer, legacy).map((field) => (
          <div key={field.label} className="contents">
            <dt className="text-muted-foreground">{field.label}</dt>
            <dd className="font-mono break-all">{field.value}</dd>
          </div>
        ))}
      </dl>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={inputId}>Block number</Label>
          <Input
            id={inputId}
            inputMode="numeric"
            required
            value={blockText}
            onChange={(e) => setBlockText(e.target.value)}
            placeholder="e.g. 18204311"
            className="w-48 font-mono"
            aria-invalid={showBlockError}
            data-ocid={ocid("block_input")}
          />
        </div>
        {canArrive && (
          <Button
            type="submit"
            disabled={!blockValid || pending}
            className={PRIMARY_GOLD}
            data-ocid={ocid("arrived_button")}
          >
            {arrived.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Arrived
          </Button>
        )}
        {canRefund && (
          <Button
            type={canArrive ? "button" : "submit"}
            variant={canArrive ? "outline" : "default"}
            disabled={!blockValid || pending}
            onClick={canArrive ? handleRefunded : undefined}
            className={canArrive ? SECONDARY_GOLD : PRIMARY_GOLD}
            data-ocid={ocid("refunded_manually_button")}
          >
            {refunded.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {kind === TransferKind.BM ? "Refunded" : "Refunded manually"}
          </Button>
        )}
        {canNotArrive && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleNotArrived}
            className={SECONDARY_GOLD}
            data-ocid={ocid("not_arrived_button")}
          >
            {notArrived.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Not arrived
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={!blockValid || pending}
            onClick={handleCancelled}
            className={SECONDARY_GOLD}
            data-ocid={ocid("cancelled_button")}
          >
            {cancelled.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Cancelled
          </Button>
        )}
      </form>
      {showBlockError ? (
        <p className="text-xs text-destructive" data-ocid={ocid("block_error")}>
          Enter the block number as a whole number.
        </p>
      ) : trimmed === "" ? (
        <p className="text-xs text-muted-foreground">
          {DEX_HINTS[kind]
            ? DEX_HINTS[kind]
            : kind === TransferKind.PC
              ? "Enter the ledger block of the manual refund to mark it as refunded. Not arrived removes a payment that never happened."
              : kind === TransferKind.BM
                ? "Refund this cost by hand, then enter the ledger block of the refund to mark it as refunded."
                : kind === TransferKind.RF
                  ? "Enter the ledger block number to mark the refund as arrived or as refunded manually."
                  : canCancel
                    ? "Enter the ledger block of the payment to mark it as arrived, or the TTTI-T block of the TTTI-T returned by hand to mark the buyback as cancelled. Not arrived lets the buyer retry."
                    : kind === TransferKind.BB
                      ? "Enter the ledger block of the payment to mark it as arrived. Not arrived lets the buyer retry or cancel."
                      : "Enter the ledger block number to mark the transfer as arrived."}
        </p>
      ) : null}
      {feedback && (
        <p
          className={`text-sm ${feedback.ok ? "text-success" : "text-destructive"}`}
          data-ocid={ocid(feedback.ok ? "success_state" : "error_state")}
        >
          {feedback.text}
        </p>
      )}
    </li>
  );
}

/** Transfers and payments whose outcome is unknown, checked by the admin. */
export function ToReviewCard({ className }: { className?: string }) {
  const [group, setGroup] = useState<ReviewGroup>("all");
  const [token, setToken] = useState<TokenChoice<DexToken>>(ALL_TOKENS);
  const kinds = REVIEW_GROUPS.find((g) => g.value === group)?.kinds ?? [];
  const {
    data: transfers,
    isLoading,
    isError,
    refetch,
  } = useTransfersToReviewFiltered(kinds, token === ALL_TOKENS ? null : token);
  const { data: buybacks } = useAllBuybacks();
  // Legacy buybacks (before the escrow) have no payout memo when the list of
  // buybacks is not loaded yet.
  const isLegacy = (transfer: TransferReview) =>
    transfer.kind === TransferKind.BB &&
    (buybacks?.find((b) => b.id === transfer.purchaseId)?.legacy ??
      transfer.memoText === undefined);

  return (
    <div
      className={`space-y-5 ${className ?? ""}`}
      data-ocid="admin.to_review_card"
    >
      <p className="max-w-3xl text-sm text-muted-foreground">
        Transfers with no confirmed outcome after 23 h, payments to refund and
        costs refunded by hand. Check each one on the ledger, then mark it with
        its block number.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          options={REVIEW_GROUPS}
          value={group}
          onChange={setGroup}
          label="Transfer type"
          ocid="admin.to_review_filter"
        />
        <TokenSelect
          tokens={ADMIN_TOKENS}
          value={token}
          onChange={setToken}
          label="To review token"
          ocid="admin.to_review_token_select"
          allowAll
        />
      </div>
      <AdminAccordion
        label="Transfers to review"
        count={transfers ? transfers.length : undefined}
        ocid="admin.to_review_accordion"
      >
        {isLoading ? (
          <div className="space-y-3" data-ocid="admin.to_review_loading_state">
            {Array.from({ length: 2 }, (_, i) => `review-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-32 w-full rounded-lg" />
              ),
            )}
          </div>
        ) : isError || !transfers ? (
          <Alert variant="destructive" data-ocid="admin.to_review_error_state">
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The transfers to review could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.to_review_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : transfers.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 py-10 text-center"
            data-ocid="admin.to_review_empty_state"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-secondary text-primary">
              <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-semibold">
                Nothing to review
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                No transfer matches these filters.
              </p>
            </div>
          </div>
        ) : (
          <ul data-ocid="admin.to_review_list">
            {transfers.map((transfer, index) => (
              <ReviewRow
                key={`${transfer.kind}-${transfer.purchaseId.toString()}`}
                transfer={transfer}
                index={index}
                legacy={isLegacy(transfer)}
              />
            ))}
          </ul>
        )}
      </AdminAccordion>
    </div>
  );
}
