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
  type PairRequestView,
  PoolKind,
  PoolStatus,
  type PoolTokenView,
  type PoolView,
  type RefusePairError,
  RemovePairError,
  SetMinimumsError,
  type TokenMinimums,
} from "../../backend";
import {
  useApprovePair,
  useDexPools,
  usePairRequests,
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

const REMOVE_ERROR_TEXT: Record<RemovePairError, string> = {
  [RemovePairError.notAuthorized]: "Only an admin can remove pairs.",
  [RemovePairError.alreadyRemoved]: "This pair is already removed.",
  [RemovePairError.poolNotFound]: "This pool no longer exists.",
};

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
        Minimum locked liquidity per token, about 1 USD each. A pool stays in
        filling until its liquidity reaches 100 USD in total, both sides
        combined; swaps open from 100 USD.
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

/** Filling gauge in English: "37 / 100 USD — 63 USD remaining to open the pool". */
function gaugeText(pool: PoolView): string {
  const g = pool.gauge;
  if (!g.valueAvailable || g.currentUsdE8 === undefined) {
    const missing = [
      g.missingRate.token0 ? pool.token0.symbol : null,
      g.missingRate.token1 ? pool.token1.symbol : null,
    ].filter((s): s is string => s !== null);
    return `Value momentarily unavailable${missing.length ? ` (no valid rate: ${missing.join(", ")})` : ""} · target ${usd(g.targetUsdE8)} USD`;
  }
  const base = `${usd(g.currentUsdE8)} / ${usd(g.targetUsdE8)} USD`;
  if (pool.status === PoolStatus.filling && g.remainingUsdE8 !== undefined) {
    return `${base} — ${usd(g.remainingUsdE8)} USD remaining to open the pool`;
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
              text: `${pair} refused. The deposit was kept.`,
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
                The reason is shown publicly. The deposit is kept.
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
  const setMinimums = useSetUtilityPairMinimums();
  const draft = useMinimumsDraft(pool.token0, pool.token1);
  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const removed = pool.status === PoolStatus.removed;
  const needsMinimums =
    pool.kind === PoolKind.utilityPair && !removed && !pool.minimumsSet;

  const onRemove = () => {
    notify(null);
    remove.mutate(pool.id, {
      onSuccess: (r) =>
        notify(
          r.__kind__ === "ok"
            ? {
                ok: true,
                text: `${pair} removed. New swaps and deposits are blocked; LP withdrawals stay open.`,
              }
            : {
                ok: false,
                text: `Removal failed. ${REMOVE_ERROR_TEXT[r.err]}`,
              },
        ),
      onError: (e) =>
        notify({ ok: false, text: `Removal failed. ${e.message}` }),
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
      {!removed && (
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
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid={`${ocid}.remove_dialog`}>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {pair}?</AlertDialogTitle>
              <AlertDialogDescription>
                New swaps and deposits will be blocked. LP withdrawals stay
                open. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid={`${ocid}.remove_cancel_button`}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onRemove}
                data-ocid={`${ocid}.remove_confirm_button`}
              >
                Remove pair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
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
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pending requests ({pending.length})
          </h3>
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
            <ul className="space-y-8" data-ocid="admin.dex_pairs.requests_list">
              {pending.map((request, i) => (
                <RequestItem
                  key={request.id.toString()}
                  request={request}
                  index={i + 1}
                  notify={setFeedback}
                />
              ))}
            </ul>
          )}
        </section>

        <section
          className="space-y-4 border-t border-border pt-6"
          data-ocid="admin.dex_pairs.pools_section"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pairs ({pools.data?.length ?? 0})
          </h3>
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
          )}
        </section>
      </CardContent>
    </Card>
  );
}
