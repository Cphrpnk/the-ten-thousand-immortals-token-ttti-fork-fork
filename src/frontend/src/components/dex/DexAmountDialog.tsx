import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { DexTransferView } from "../../backend";
import {
  type DexTokenInfo,
  useDepositToDex,
  useWithdrawFromDex,
} from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { parseUnits } from "../../lib/token";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import {
  type DexText,
  dexCallErrorText,
  dexTransferErrorText,
  formatDexUnits,
} from "./dexFormat";

export type DexDialogKind = "deposit" | "withdraw";

type Feedback = { tone: "info" | "danger"; text: string };

function transferFeedback(
  t: DexText,
  kind: DexDialogKind,
  view: DexTransferView,
): Feedback {
  const s = view.status;
  switch (s.__kind__) {
    case "completed":
      return {
        tone: "info",
        text: `${kind === "deposit" ? t.depositDone : t.withdrawDone} ${t.transferBlock(formatNumber(s.completed))}`,
      };
    case "inProgress":
      return { tone: "info", text: t.transferStatusInProgress };
    case "needsReview":
      return { tone: "danger", text: t.transferStatusNeedsReview };
    case "failed":
      return {
        tone: "danger",
        text: `${t.transferStatusFailed} · ${t.transferError(s.failed)}`,
      };
  }
}

/** Deposit (DD) or withdrawal (DW) dialog for one DEX token. */
export function DexAmountDialog({
  kind,
  token,
  available,
  owner,
  onClose,
}: {
  kind: DexDialogKind;
  token: DexTokenInfo;
  available: bigint;
  owner: Principal;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const dexPaused = useDexPaused();
  const deposit = useDepositToDex(owner);
  const withdraw = useWithdrawFromDex();
  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const isDeposit = kind === "deposit";
  const blocked = isDeposit && dexPaused;
  const pending = deposit.isPending || withdraw.isPending;
  const amount = parseUnits(text, token.decimals);
  const valid = amount !== null && amount > 0n;
  const invalid = touched && text.trim() !== "" && !valid;
  const minimum = isDeposit ? token.minimumDeposit : token.minimumWithdrawal;
  const receive =
    !isDeposit && amount !== null && amount > token.fee
      ? amount - token.fee
      : null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (amount === null || amount <= 0n || pending || blocked) return;
    setFeedback(null);
    const captured = text;
    const onFailure = (err: Error) =>
      setFeedback({
        tone: "danger",
        text: dexCallErrorText(
          t,
          err.message,
          isDeposit ? t.errDexApprovalFailed : t.errLedger,
        ),
      });
    if (isDeposit) {
      deposit.mutate(
        { token, amount },
        {
          onSuccess: (outcome) => {
            if (outcome.__kind__ === "ok") {
              setFeedback(transferFeedback(t, kind, outcome.ok));
              setText((cur) => (cur === captured ? "" : cur));
              setTouched(false);
            } else if (outcome.__kind__ === "approvalFailed") {
              setFeedback({
                tone: "danger",
                text: t.errDexApprovalFailed(outcome.approvalFailed),
              });
            } else {
              setFeedback({
                tone: "danger",
                text: dexTransferErrorText(t, outcome.err, token),
              });
            }
          },
          onError: onFailure,
        },
      );
    } else {
      withdraw.mutate(
        { token: token.token, amount },
        {
          onSuccess: (outcome) => {
            if (outcome.__kind__ === "ok") {
              setFeedback(transferFeedback(t, kind, outcome.ok));
              setText((cur) => (cur === captured ? "" : cur));
              setTouched(false);
            } else {
              setFeedback({
                tone: "danger",
                text: dexTransferErrorText(t, outcome.err, token),
              });
            }
          },
          onError: onFailure,
        },
      );
    }
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-md"
        data-ocid="pools.balances.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isDeposit
              ? t.depositTitle(token.symbol)
              : t.withdrawTitle(token.symbol)}
          </DialogTitle>
          <DialogDescription>
            {isDeposit
              ? t.depositFeeNote(formatDexUnits(token.fee, token))
              : t.withdrawFeeNote(formatDexUnits(token.fee, token))}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dex-amount">{t.amountLabel}</Label>
            <Input
              id="dex-amount"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t.amountPlaceholder}
              inputMode="decimal"
              autoComplete="off"
              className="font-mono tabular-nums"
              aria-invalid={invalid}
              aria-describedby={invalid ? "dex-amount-error" : undefined}
              disabled={pending}
              data-ocid="pools.balances.amount.input"
            />
            {invalid && (
              <p
                id="dex-amount-error"
                className="text-xs text-destructive"
                data-ocid="pools.balances.amount.field_error"
              >
                {t.amountInvalid}
              </p>
            )}
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground tabular-nums">
              {!isDeposit && (
                <span>
                  {t.availableAmount(formatDexUnits(available, token))}
                </span>
              )}
              <span>
                {isDeposit
                  ? t.minimumDeposit(formatDexUnits(minimum, token))
                  : t.minimumWithdrawal(formatDexUnits(minimum, token))}
              </span>
              {receive !== null && (
                <span className="text-foreground">
                  {t.withdrawReceive(formatDexUnits(receive, token))}
                </span>
              )}
            </div>
          </div>

          <div aria-live="polite">
            {pending && (
              <p
                className="callout-info flex items-center gap-2 px-3 py-2 text-sm text-foreground"
                data-ocid="pools.balances.dialog.loading_state"
              >
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {isDeposit ? t.depositing : t.withdrawing}
              </p>
            )}
            {!pending && feedback && (
              <p
                className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                data-ocid={
                  feedback.tone === "info"
                    ? "pools.balances.dialog.success_state"
                    : "pools.balances.dialog.error_state"
                }
              >
                {feedback.text}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="min-h-11"
              data-ocid="pools.balances.dialog.cancel_button"
            >
              {t.cancel}
            </Button>
            <DexPausedHint paused={blocked}>
              <Button
                type="submit"
                disabled={!valid || pending || blocked}
                className="min-h-11"
                data-ocid="pools.balances.dialog.confirm_button"
              >
                {pending
                  ? isDeposit
                    ? t.depositing
                    : t.withdrawing
                  : isDeposit
                    ? t.confirmDeposit
                    : t.confirmWithdraw}
              </Button>
            </DexPausedHint>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
