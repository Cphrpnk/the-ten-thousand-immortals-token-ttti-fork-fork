import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Loader2,
  Network,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  type ApprovePairError,
  CancelRemovalError,
  type DexTokenInfo,
  type PairRequestView,
  PoolKind,
  PoolStatus,
  type PoolTokenView,
  type PoolView,
  ReadingMethod,
  ReadingStep,
  type ReferenceReadingEntry,
  type RefusePairError,
  type RemovalView,
  type RemovePairError,
  SetMinimumsError,
  ThresholdBasis,
  type TokenMinimums,
} from "../../backend";
import {
  useApprovePair,
  useCancelPairRemoval,
  useDexPools,
  useDexTokens,
  usePairRequests,
  useReferenceReadings,
  useRefreshReferenceSources,
  useRefusePair,
  useRemovePair,
  useSetUtilityPairMinimums,
} from "../../hooks/useDex";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  formatBps,
  formatUnits,
  parseUnits,
} from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { AdminAccordion } from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

type Feedback = { ok: boolean; text: string } | null;
type Notify = (feedback: Feedback) => void;

const STATUS_LABEL: Record<PoolStatus, string> = {
  [PoolStatus.active]: "Active",
  [PoolStatus.filling]: "Filling",
  [PoolStatus.removed]: "Removed",
};

function approveErrorText(e: ApprovePairError): string {
  switch (e.__kind__) {
    case "notAuthorized":
      return "Only an admin can approve pairs.";
    case "requestNotFound":
      return "This request no longer exists.";
    case "notPending":
      return "This request is no longer pending.";
    case "minimumsRequired":
      return "Enter both minimums before approving a utility pair.";
    case "minimumsNotAllowed":
      return "Minimums are fixed for TTTI-T pairs and cannot be entered.";
    case "invalidMinimums":
      return "Both minimums must be greater than 0.";
    case "pairExists":
      return `This pair already exists (pool #${e.pairExists.poolId.toString()}).`;
    case "refundFailed":
      return `The deposit refund failed: ${e.refundFailed}. Nothing was created.`;
  }
}

function refuseErrorText(e: RefusePairError): string {
  switch (e.__kind__) {
    case "notAuthorized":
      return "Only an admin can refuse pairs.";
    case "requestNotFound":
      return "This request no longer exists.";
    case "notPending":
      return "This request is no longer pending.";
    case "reasonRequired":
      return "A reason is required to refuse a request.";
    case "reasonTooLong":
      return `The reason is too long (max ${e.reasonTooLong.max.toString()} characters).`;
  }
}

const REMOVE_REASON_MAX = 280;

function removeErrorText(e: RemovePairError): string {
  switch (e.__kind__) {
    case "notAuthorized":
      return "Only an admin can remove pairs.";
    case "alreadyRemoved":
      return "This pair is already removed.";
    case "poolNotFound":
      return "This pool no longer exists.";
    case "alreadyAnnounced":
      return `A removal is already announced (effective ${formatTimestamp(e.alreadyAnnounced.effectiveAt)}).`;
    case "reasonEmpty":
      return "A public reason is required.";
    case "reasonTooLong":
      return `The reason is too long (max ${e.reasonTooLong.maximumChars.toString()} characters).`;
  }
}

const CANCEL_REMOVAL_ERROR_TEXT: Record<CancelRemovalError, string> = {
  [CancelRemovalError.notAuthorized]: "Only an admin can cancel a removal.",
  [CancelRemovalError.poolNotFound]: "This pool no longer exists.",
  [CancelRemovalError.noAnnouncement]: "No removal is announced for this pool.",
  [CancelRemovalError.alreadyCancelled]: "This removal is already cancelled.",
  [CancelRemovalError.alreadyExecuting]:
    "The removal is already executing and can no longer be cancelled.",
  [CancelRemovalError.alreadyCompleted]: "The removal is already completed.",
};

/** One line describing the removal state of a pool, or null when none. */
function removalSummary(removal: RemovalView): string | null {
  switch (removal.__kind__) {
    case "none":
      return null;
    case "announced": {
      const r = removal.announced;
      return `Removal announced ${formatTimestamp(r.announcedAt)}, effective ${formatTimestamp(r.effectiveAt)}. Reason: ${r.reason}`;
    }
    case "cancelled": {
      const r = removal.cancelled;
      return `Removal announced ${formatTimestamp(r.announcedAt)} and cancelled ${formatTimestamp(r.cancelledAt)}. Reason: ${r.reason}`;
    }
    case "executing": {
      const r = removal.executing;
      return `Removal executing since ${formatTimestamp(r.startedAt)} (effective ${formatTimestamp(r.effectiveAt)}). Remaining positions are being paid out. Reason: ${r.reason}`;
    }
    case "completed": {
      const r = removal.completed;
      return `Removal completed ${formatTimestamp(r.completedAt)} (effective ${formatTimestamp(r.effectiveAt)}). Reason: ${r.reason}`;
    }
  }
}

const MINIMUMS_ERROR_TEXT: Record<SetMinimumsError, string> = {
  [SetMinimumsError.notAuthorized]: "Only an admin can set minimums.",
  [SetMinimumsError.poolNotFound]: "This pool no longer exists.",
  [SetMinimumsError.poolRemoved]: "This pair is removed.",
  [SetMinimumsError.notUtilityPair]: "Minimums apply to utility pairs only.",
  [SetMinimumsError.liquidityAlreadyAdded]:
    "Liquidity was already added; minimums can no longer change.",
  [SetMinimumsError.invalidMinimums]: "Both minimums must be greater than 0.",
};

/** Two per-token minimum inputs ('.' or ','); returns the parsed pair or null. */
function useMinimumsDraft(token0: PoolTokenView, token1: PoolTokenView) {
  const [text0, setText0] = useState("");
  const [text1, setText1] = useState("");
  const a = parseUnits(text0, token0.decimals);
  const b = parseUnits(text1, token1.decimals);
  const value: TokenMinimums | null =
    a !== null && b !== null && a > 0n && b > 0n
      ? { token0: a, token1: b }
      : null;
  return { text0, setText0, text1, setText1, value };
}

function MinimumsFields({
  ocid,
  token0,
  token1,
  draft,
}: {
  ocid: string;
  token0: PoolTokenView;
  token1: PoolTokenView;
  draft: ReturnType<typeof useMinimumsDraft>;
}) {
  const fields = [
    { token: token0, text: draft.text0, set: draft.setText0, n: 0 },
    { token: token1, text: draft.text1, set: draft.setText1, n: 1 },
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Minimum locked liquidity per token, about 1 USD each. Swaps open when
        the pool reaches 10 USD of depth (sum of both sides); this threshold
        applies only to swaps, never to creating the pool, depositing or adding
        liquidity. The first deposit of an empty pool has no minimum.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ token, text, set, n }) => {
          const id = `${ocid}-min${n}`;
          const invalid =
            text.trim() !== "" && parseUnits(text, token.decimals) === null;
          return (
            <div key={id} className="space-y-1">
              <Label htmlFor={id} className="text-xs">
                Minimum {token.symbol}
              </Label>
              <Input
                id={id}
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.0"
                value={text}
                onChange={(e) => set(e.target.value)}
                aria-invalid={invalid}
                className="font-mono"
                data-ocid={`${ocid}.min${n}_input`}
              />
              {invalid && (
                <p
                  className="text-xs text-destructive"
                  data-ocid={`${ocid}.min${n}_error`}
                >
                  Up to {token.decimals} decimals, '.' or ','.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function amountText(value: bigint, token: PoolTokenView): string {
  return `${formatUnits(value, token.decimals, 0)} ${token.symbol}`;
}

const usd = (e8: bigint) =>
  (Number(e8) / 1e8).toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Filling gauge in English: "7 / 10 USD of TTTI-T in the pool — 3 USD remaining until swaps open". */
function gaugeText(pool: PoolView): string {
  const g = pool.gauge;
  const measure =
    pool.thresholdBasis === ThresholdBasis.tttiSideAtPoolPrice
      ? "USD of TTTI-T in the pool"
      : "USD of depth";
  if (!g.valueAvailable || g.currentUsdE8 === undefined) {
    const missing = [
      g.missingRate.token0 ? pool.token0.symbol : null,
      g.missingRate.token1 ? pool.token1.symbol : null,
    ].filter((s): s is string => s !== null);
    return `Value momentarily unavailable${missing.length ? ` (no valid rate: ${missing.join(", ")})` : ""} · target ${usd(g.targetUsdE8)} ${measure}`;
  }
  const base = `${usd(g.currentUsdE8)} / ${usd(g.targetUsdE8)} ${measure}`;
  if (pool.status === PoolStatus.filling && g.remainingUsdE8 !== undefined) {
    return `${base} — ${usd(g.remainingUsdE8)} USD remaining until swaps open (swap threshold only)`;
  }
  return base;
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
      )}
      <span className={ok ? "" : "text-destructive"}>
        {label}: {ok ? "passed" : "failed"}
      </span>
    </li>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </>
  );
}

function RequestItem({
  request,
  index,
  notify,
}: { request: PairRequestView; index: number; notify: Notify }) {
  const ocid = `admin.dex_pairs.request.${index}`;
  const approve = useApprovePair();
  const refuse = useRefusePair();
  const [reason, setReason] = useState("");
  const [refuseOpen, setRefuseOpen] = useState(false);
  const isUtility = request.kind === PoolKind.utilityPair;
  const token0: PoolTokenView = {
    decimals: request.token.decimals,
    ledgerId: request.token.ledgerId,
    isTttiT: false,
    symbol: request.token.symbol,
  };
  const draft = useMinimumsDraft(token0, request.counter);
  const pair = `${request.token.symbol}/${request.counter.symbol}`;
  const busy = approve.isPending || refuse.isPending;
  const canApprove = !busy && (!isUtility || draft.value !== null);

  const onApprove = () => {
    notify(null);
    approve.mutate(
      { requestId: request.id, minimums: isUtility ? draft.value : null },
      {
        onSuccess: (r) =>
          notify(
            r.__kind__ === "ok"
              ? {
                  ok: true,
                  text: `${pair} approved: pool #${r.ok.id.toString()} created with the new-pair badge; the deposit was refunded.`,
                }
              : {
                  ok: false,
                  text: `Approval failed. ${approveErrorText(r.err)}`,
                },
          ),
        onError: (e) =>
          notify({ ok: false, text: `Approval failed. ${e.message}` }),
      },
    );
  };

  const onRefuse = () => {
    const captured = reason.trim();
    if (captured === "") return;
    notify(null);
    refuse.mutate(
      { requestId: request.id, reason: captured },
      {
        onSuccess: (r) => {
          if (r.__kind__ === "ok") {
            setRefuseOpen(false);
            setReason("");
            notify({
              ok: true,
              text: `${pair} refused. The deposit joins the permanent liquidity set aside.`,
            });
          } else {
            notify({
              ok: false,
              text: `Refusal failed. ${refuseErrorText(r.err)}`,
            });
          }
        },
        onError: (e) =>
          notify({ ok: false, text: `Refusal failed. ${e.message}` }),
      },
    );
  };

  const { checks } = request;
  return (
    <li className="space-y-4 border-l border-border pl-4" data-ocid={ocid}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-base">{pair}</span>
        <Badge variant="secondary">
          {isUtility ? "Utility pair" : "TTTI-T pair"}
        </Badge>
        <Badge variant="outline">{formatBps(request.feeBps)} fee tier</Badge>
        <span className="text-xs text-muted-foreground">
          #{request.id.toString()} · {formatTimestamp(request.createdAt)}
        </span>
      </div>
      {(request.copiedSymbol || checks.copiedSymbolOf) && (
        <Alert variant="destructive" data-ocid={`${ocid}.copied_symbol_flag`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The symbol {request.token.symbol} copies a known token
            {checks.copiedSymbolOf ? ` (${checks.copiedSymbolOf})` : ""}.
          </AlertDescription>
        </Alert>
      )}
      <dl className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-4 gap-y-1.5 text-sm">
        <Field label="Requester">
          <span className="font-mono text-xs">
            {request.requester.toText()}
          </span>
        </Field>
        <Field label="Token">
          {request.token.name} ({request.token.symbol}) ·{" "}
          {request.token.decimals} decimals · fee{" "}
          <span className="font-mono">
            {formatUnits(request.token.fee, request.token.decimals, 0)}
          </span>
        </Field>
        <Field label="Ledger">
          <span className="font-mono text-xs">
            {request.token.ledgerId.toText()}
          </span>
        </Field>
        <Field label="Counter token">
          {request.counter.symbol}{" "}
          <span className="font-mono text-xs text-muted-foreground">
            {request.counter.ledgerId.toText()}
          </span>
        </Field>
        <Field label="Deposit">
          <span className="font-mono">
            {formatUnits(request.depositAmount, TTTI_DECIMALS)} {TTTI_SYMBOL}
          </span>{" "}
          <span className="text-xs text-muted-foreground">
            block {request.depositBlock.toString()}
          </span>
        </Field>
        <Field label="Message">
          <span className="whitespace-pre-wrap break-words">
            {request.message || (
              <span className="text-muted-foreground">None</span>
            )}
          </span>
        </Field>
        <Field label="Checks">
          <ul
            className="grid gap-1 text-xs sm:grid-cols-2"
            data-ocid={`${ocid}.checks`}
          >
            <CheckItem ok={checks.icrc1} label="ICRC-1" />
            <CheckItem ok={checks.icrc2} label="ICRC-2" />
            <CheckItem ok={checks.metadataRead} label="Metadata" />
            <CheckItem ok={checks.pairUnique} label="Pair unique" />
          </ul>
        </Field>
      </dl>
      {isUtility && (
        <MinimumsFields
          ocid={ocid}
          token0={token0}
          token1={request.counter}
          draft={draft}
        />
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          className={PRIMARY_GOLD}
          disabled={!canApprove}
          onClick={onApprove}
          data-ocid={`${ocid}.approve_button`}
        >
          {approve.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve
        </Button>
        <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={SECONDARY_GOLD}
              disabled={busy}
              data-ocid={`${ocid}.refuse_button`}
            >
              <X className="mr-2 h-4 w-4" />
              Refuse
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid={`${ocid}.refuse_dialog`}>
            <DialogHeader>
              <DialogTitle>Refuse {pair}</DialogTitle>
              <DialogDescription>
                The reason is shown publicly. The deposit joins the permanent
                liquidity set aside.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1">
              <Label htmlFor={`${ocid}-reason`}>Reason</Label>
              <Textarea
                id={`${ocid}-reason`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                data-ocid={`${ocid}.reason_textarea`}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefuseOpen(false)}
                data-ocid={`${ocid}.refuse_cancel_button`}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={reason.trim() === "" || refuse.isPending}
                onClick={onRefuse}
                data-ocid={`${ocid}.refuse_confirm_button`}
              >
                {refuse.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                )}
                Refuse request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {isUtility && draft.value === null && (
        <p className="text-xs text-muted-foreground">
          Enter both minimums to enable Approve.
        </p>
      )}
    </li>
  );
}

function PoolItem({
  pool,
  index,
  notify,
}: { pool: PoolView; index: number; notify: Notify }) {
  const ocid = `admin.dex_pairs.pool.${index}`;
  const remove = useRemovePair();
  const cancelRemoval = useCancelPairRemoval();
  const setMinimums = useSetUtilityPairMinimums();
  const draft = useMinimumsDraft(pool.token0, pool.token1);
  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const removed = pool.status === PoolStatus.removed;
  const [reason, setReason] = useState("");
  const reasonValid =
    reason.trim().length > 0 && reason.trim().length <= REMOVE_REASON_MAX;
  const removalText = removalSummary(pool.removal);
  const canAnnounce =
    !removed &&
    (pool.removal.__kind__ === "none" || pool.removal.__kind__ === "cancelled");
  const needsMinimums =
    pool.kind === PoolKind.utilityPair && !removed && !pool.minimumsSet;

  const onRemove = () => {
    notify(null);
    remove.mutate(
      { poolId: pool.id, reason: reason.trim() },
      {
        onSuccess: (r) => {
          if (r.__kind__ === "ok") setReason("");
          notify(
            r.__kind__ === "ok"
              ? {
                  ok: true,
                  text: `${pair} removal announced. Swaps and additions are suspended; withdrawals stay open subject to locks.`,
                }
              : {
                  ok: false,
                  text: `Removal failed. ${removeErrorText(r.err)}`,
                },
          );
        },
        onError: (e) =>
          notify({ ok: false, text: `Removal failed. ${e.message}` }),
      },
    );
  };

  const onCancelRemoval = () => {
    notify(null);
    cancelRemoval.mutate(pool.id, {
      onSuccess: (r) =>
        notify(
          r.__kind__ === "ok"
            ? {
                ok: true,
                text: `${pair} removal announcement cancelled. Swaps and additions can resume.`,
              }
            : {
                ok: false,
                text: `Cancellation failed. ${CANCEL_REMOVAL_ERROR_TEXT[r.err]}`,
              },
        ),
      onError: (e) =>
        notify({ ok: false, text: `Cancellation failed. ${e.message}` }),
    });
  };

  const onSetMinimums = () => {
    if (!draft.value) return;
    notify(null);
    setMinimums.mutate(
      { poolId: pool.id, minimums: draft.value },
      {
        onSuccess: (r) =>
          notify(
            r.__kind__ === "ok"
              ? {
                  ok: true,
                  text: `Minimums set for ${pair}. Deposits are now open.`,
                }
              : {
                  ok: false,
                  text: `Setting minimums failed. ${MINIMUMS_ERROR_TEXT[r.err]}`,
                },
          ),
        onError: (e) =>
          notify({ ok: false, text: `Setting minimums failed. ${e.message}` }),
      },
    );
  };

  const minText = (value: bigint | undefined, token: PoolTokenView) =>
    value === undefined
      ? "Not set"
      : `${formatUnits(value, token.decimals, 0)} ${token.symbol}`;

  return (
    <li className="space-y-3 border-l border-border pl-4" data-ocid={ocid}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-base">{pair}</span>
        <Badge
          variant={removed ? "destructive" : "secondary"}
          data-ocid={`${ocid}.status`}
        >
          {STATUS_LABEL[pool.status]}
        </Badge>
        <Badge variant="outline">{formatBps(pool.feeBps)}</Badge>
        {pool.newPairBadgeActive && (
          <Badge variant="outline" className="border-gold text-primary">
            New pair
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          #{pool.id.toString()} ·{" "}
          {pool.kind === PoolKind.utilityPair ? "Utility" : "TTTI-T"}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Swaps {pool.acceptsSwaps ? "open" : "blocked"} · Deposits{" "}
        {pool.acceptsDeposits ? "open" : "blocked"} · LP withdrawals{" "}
        {pool.acceptsWithdrawals ? "open" : "blocked"} · Minimums{" "}
        {minText(pool.minimumLocked.token0, pool.token0)},{" "}
        {minText(pool.minimumLocked.token1, pool.token1)}
        {pool.removedAt !== undefined &&
          ` · Removed ${formatTimestamp(pool.removedAt)}`}
      </p>
      <dl
        className="grid grid-cols-[minmax(0,11rem)_1fr] gap-x-4 gap-y-1 text-xs"
        data-ocid={`${ocid}.liquidity`}
      >
        <Field label="Gauge">{gaugeText(pool)}</Field>
        <Field label="Reserves">
          {amountText(pool.reserve0, pool.token0)},{" "}
          {amountText(pool.reserve1, pool.token1)}
        </Field>
        <Field label="Total shares">{pool.totalShares.toString()}</Field>
        <Field label="Contract-locked shares">
          {pool.lockedShares.toString()}
        </Field>
        <Field label="Protocol fees (accumulated)">
          {amountText(pool.protocolFee0, pool.token0)},{" "}
          {amountText(pool.protocolFee1, pool.token1)}
        </Field>
      </dl>
      {needsMinimums && (
        <div className="space-y-3">
          <MinimumsFields
            ocid={ocid}
            token0={pool.token0}
            token1={pool.token1}
            draft={draft}
          />
          <Button
            type="button"
            size="sm"
            className={PRIMARY_GOLD}
            disabled={!draft.value || setMinimums.isPending}
            onClick={onSetMinimums}
            data-ocid={`${ocid}.set_minimums_button`}
          >
            {setMinimums.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
            )}
            Set minimums
          </Button>
        </div>
      )}
      {removalText && (
        <p
          className="text-xs text-muted-foreground"
          data-ocid={`${ocid}.removal_state`}
        >
          {removalText}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {pool.removal.__kind__ === "announced" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={SECONDARY_GOLD}
            disabled={cancelRemoval.isPending}
            onClick={onCancelRemoval}
            data-ocid={`${ocid}.cancel_removal_button`}
          >
            {cancelRemoval.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Cancel announcement
          </Button>
        )}
        {canAnnounce && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={SECONDARY_GOLD}
                disabled={remove.isPending}
                data-ocid={`${ocid}.remove_button`}
              >
                {remove.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Announce removal
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid={`${ocid}.remove_dialog`}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Announce the removal of {pair}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  The removal takes effect 5 days after the announcement. From
                  the announcement, swaps and additions are suspended.
                  Withdrawals stay open, subject to position locks. At the
                  effective date, all remaining positions are paid to their
                  owners' wallets. The reason is public.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`${ocid}-remove-reason`}>
                  Public reason (1 to {REMOVE_REASON_MAX} characters)
                </Label>
                <Textarea
                  id={`${ocid}-remove-reason`}
                  value={reason}
                  maxLength={REMOVE_REASON_MAX}
                  onChange={(e) => setReason(e.target.value)}
                  data-ocid={`${ocid}.remove_reason_input`}
                />
                <p className="text-xs text-muted-foreground">
                  {reason.trim().length} / {REMOVE_REASON_MAX}
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid={`${ocid}.remove_cancel_button`}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRemove}
                  disabled={!reasonValid}
                  data-ocid={`${ocid}.remove_confirm_button`}
                >
                  Announce removal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </li>
  );
}

const READING_STEP_LABEL: Record<ReadingStep, string> = {
  [ReadingStep.poolLookup]: "pool lookup",
  [ReadingStep.metadata]: "metadata",
  [ReadingStep.spotPrice]: "spot price",
  [ReadingStep.quote]: "quote",
  [ReadingStep.reserve]: "reserve",
};

const READING_METHOD_LABEL: Record<ReadingMethod, string> = {
  [ReadingMethod.spot]: "spot price",
  [ReadingMethod.quote]: "1% quote",
};

/** One ICPSwap pair: last price, failed step, or not read yet. */
function ReferenceReadingRow({
  entry,
  tokens,
  index,
}: {
  entry: ReferenceReadingEntry;
  tokens: Array<DexTokenInfo>;
  index: number;
}) {
  const counter =
    entry.__kind__ === "read" ? entry.read.counter : entry.notReadYet.counter;
  const info = tokens.find((t) => t.token === counter);
  const symbol = info?.symbol ?? counter;

  let body: React.ReactNode;
  if (entry.__kind__ === "notReadYet") {
    body = <span className="text-muted-foreground">Not read yet</span>;
  } else if (entry.read.outcome.__kind__ === "ok") {
    const { counterPerTttiE8, method } = entry.read.outcome.ok;
    body = (
      <span>
        <span className="font-mono">
          {formatUnits(counterPerTttiE8, 8, 2)} {symbol}
        </span>{" "}
        per {TTTI_SYMBOL}
        <span className="text-muted-foreground">
          {" "}
          · {READING_METHOD_LABEL[method]} ·{" "}
          {formatTimestamp(entry.read.readAt)}
        </span>
      </span>
    );
  } else {
    const { step, detail } = entry.read.outcome.failed;
    body = (
      <span>
        <span className="text-destructive">
          Failed at {READING_STEP_LABEL[step]}
        </span>
        <span className="text-muted-foreground">
          {" "}
          · {formatTimestamp(entry.read.readAt)}
        </span>
        {detail ? (
          <span className="block break-words text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <li
      className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 text-xs"
      data-ocid={`admin.dex_pairs.reference_reading.${index}`}
    >
      <span className="w-28 shrink-0 font-display text-sm">
        {TTTI_SYMBOL}/{symbol}
      </span>
      <span className="min-w-0 flex-1">{body}</span>
    </li>
  );
}

/** Last reading of every ICPSwap pair, under the refresh button. */
function ReferenceReadingsList() {
  const readings = useReferenceReadings();
  const tokens = useDexTokens();
  const entries = readings.data ?? [];

  if (readings.isLoading) {
    return (
      <Skeleton
        className="h-16 w-full"
        data-ocid="admin.dex_pairs.reference_readings_loading_state"
      />
    );
  }
  if (readings.isError) {
    return (
      <p
        className="text-xs text-destructive"
        data-ocid="admin.dex_pairs.reference_readings_error_state"
      >
        The last readings could not be loaded.
      </p>
    );
  }
  if (entries.length === 0) {
    return (
      <p
        className="text-xs text-muted-foreground"
        data-ocid="admin.dex_pairs.reference_readings_empty_state"
      >
        No ICPSwap pairs to read.
      </p>
    );
  }
  return (
    <ul
      className="divide-y divide-border"
      data-ocid="admin.dex_pairs.reference_readings_list"
    >
      {entries.map((entry, i) => (
        <ReferenceReadingRow
          key={
            entry.__kind__ === "read"
              ? entry.read.counter
              : entry.notReadYet.counter
          }
          entry={entry}
          tokens={tokens.data ?? []}
          index={i + 1}
        />
      ))}
    </ul>
  );
}

/** Refreshes the reference price sources used for first deposits. */
function ReferenceSourcesControl({ notify }: { notify: Notify }) {
  const refresh = useRefreshReferenceSources();
  const [count, setCount] = useState<bigint | null>(null);

  const onRefresh = () => {
    notify(null);
    refresh.mutate(undefined, {
      onSuccess: (n) => {
        setCount(n);
        notify({
          ok: true,
          text: `Reference price sources refreshed: ${n.toString()} readable ICPSwap ${n === 1n ? "pair" : "pairs"}.`,
        });
      },
      onError: (e) =>
        notify({ ok: false, text: `Refresh failed. ${e.message}` }),
    });
  };

  return (
    <section
      className="space-y-4 border-t border-border pt-6"
      data-ocid="admin.dex_pairs.reference_sources_section"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-xl space-y-1">
          <h3 className="font-display text-base">Reference price sources</h3>
          <p className="text-xs text-muted-foreground">
            First deposits into an empty pool are checked against these prices.
            Refresh them to read the ICPSwap pairs again.
            {count !== null && (
              <span data-ocid="admin.dex_pairs.reference_sources_count">
                {" "}
                Readable sources: {count.toString()}.
              </span>
            )}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={SECONDARY_GOLD}
          disabled={refresh.isPending}
          onClick={onRefresh}
          data-ocid="admin.dex_pairs.refresh_sources_button"
        >
          {refresh.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh reference sources
        </Button>
      </div>
      <ReferenceReadingsList />
    </section>
  );
}

/** Admin: DEX pair requests and pools (English, like the rest of the admin). */
export function DexPairsCard() {
  const requests = usePairRequests();
  const pools = useDexPools();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const pending = (requests.data ?? []).filter(
    (r) => r.status.__kind__ === "pending",
  );
  const refreshing = requests.isFetching || pools.isFetching;

  return (
    <Card className={GOLD_CARD} data-ocid="admin.dex_pairs.card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Network className="h-5 w-5 text-primary" />
            DEX pairs
          </CardTitle>
          <CardDescription>
            Pair requests, pools and utility pair minimums.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={SECONDARY_GOLD}
          disabled={refreshing}
          onClick={() => {
            void requests.refetch();
            void pools.refetch();
          }}
          data-ocid="admin.dex_pairs.refresh_button"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {feedback && (
          <Alert
            variant={feedback.ok ? "default" : "destructive"}
            data-ocid={
              feedback.ok
                ? "admin.dex_pairs.success_state"
                : "admin.dex_pairs.error_state"
            }
          >
            {feedback.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}

        <section
          className="space-y-4"
          data-ocid="admin.dex_pairs.requests_section"
        >
          {requests.isLoading ? (
            <Skeleton
              className="h-40 w-full"
              data-ocid="admin.dex_pairs.requests_loading_state"
            />
          ) : requests.error ? (
            <Alert
              variant="destructive"
              data-ocid="admin.dex_pairs.requests_error_state"
            >
              <AlertDescription>
                Pair requests could not be loaded: {requests.error.message}
              </AlertDescription>
            </Alert>
          ) : pending.length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="admin.dex_pairs.requests_empty_state"
            >
              No pending pair requests.
            </p>
          ) : (
            <AdminAccordion
              label="Pending pair requests"
              count={pending.length}
              ocid="admin.dex_pairs.requests_accordion"
            >
              <ul
                className="space-y-8"
                data-ocid="admin.dex_pairs.requests_list"
              >
                {pending.map((request, i) => (
                  <RequestItem
                    key={request.id.toString()}
                    request={request}
                    index={i + 1}
                    notify={setFeedback}
                  />
                ))}
              </ul>
            </AdminAccordion>
          )}
        </section>

        <section
          className="space-y-4 border-t border-border pt-6"
          data-ocid="admin.dex_pairs.pools_section"
        >
          {pools.isLoading ? (
            <Skeleton
              className="h-40 w-full"
              data-ocid="admin.dex_pairs.pools_loading_state"
            />
          ) : pools.error ? (
            <Alert
              variant="destructive"
              data-ocid="admin.dex_pairs.pools_error_state"
            >
              <AlertDescription>
                Pairs could not be loaded: {pools.error.message}
              </AlertDescription>
            </Alert>
          ) : (pools.data ?? []).length === 0 ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="admin.dex_pairs.pools_empty_state"
            >
              No pairs yet.
            </p>
          ) : (
            <AdminAccordion
              label="Pairs"
              count={(pools.data ?? []).length}
              ocid="admin.dex_pairs.pools_accordion"
            >
              <ul className="space-y-6" data-ocid="admin.dex_pairs.pools_list">
                {(pools.data ?? []).map((pool, i) => (
                  <PoolItem
                    key={pool.id.toString()}
                    pool={pool}
                    index={i + 1}
                    notify={setFeedback}
                  />
                ))}
              </ul>
            </AdminAccordion>
          )}
        </section>

        <ReferenceSourcesControl notify={setFeedback} />
      </CardContent>
    </Card>
  );
}
