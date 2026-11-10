import { Loader2, Stethoscope } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { RecoveryAction } from "../../backend";
import type { BtcMintDiagnosis, FinishMintResult } from "../../backend";
import {
  useDiagnoseBtcMint,
  useFinishBtcMint,
} from "../../hooks/useBtcRecovery";
import { TTTI_SYMBOL, formatUnits } from "../../lib/token";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

const EXAMPLE_SUBACCOUNT =
  "bd1daf4a2b7bfc556b3b6a20821b2199b0686f47b5846dd66ac8c29e5c690200";

function ckbtc(sats: bigint): string {
  return `${formatUnits(sats, 8, 8, "en")} ckBTC`;
}

function ttti(units: bigint): string {
  return `${formatUnits(units, 8, 8, "en")} ${TTTI_SYMBOL}`;
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

interface Outcome {
  ok: boolean;
  text: string;
}

function describeResult(result: FinishMintResult): Outcome {
  switch (result.__kind__) {
    case "minted":
      return {
        ok: true,
        text: `Minted ${ttti(result.minted.tttiOut)} (conversion #${result.minted.conversionId.toString()}).`,
      };
    case "alreadyDone":
      return { ok: true, text: `Already done: ${result.alreadyDone}` };
    case "refundOpened":
      return {
        ok: true,
        text: `Refund opened: ${ckbtc(result.refundOpened.refundSats)} will be sent back to the buyer.`,
      };
    case "refused":
      return { ok: false, text: `Refused: ${result.refused}` };
  }
}

function ReportRow({
  label,
  children,
}: { label: string; children: ReactNode }) {
  return (
    <div className="contents">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words font-mono">{children}</dd>
    </div>
  );
}

function actionLabel(action: RecoveryAction): string {
  switch (action) {
    case RecoveryAction.finishMint:
      return "Recommended: finish the mint";
    case RecoveryAction.refund:
      return "Recommended: refund the ckBTC to the buyer";
    case RecoveryAction.none:
      return "Recommended: no action needed";
  }
}

function Report({ report }: { report: BtcMintDiagnosis }) {
  const cause = report.conversionCause
    ? `${report.conversionCause} (${report.causePermanent ? "permanent" : "not permanent"})`
    : "—";
  const lastError = report.lastErrorText
    ? `${report.lastErrorKind ? `${report.lastErrorKind}: ` : ""}${report.lastErrorText}`
    : (report.lastErrorKind ?? "—");
  const highlight =
    report.recommendedAction === RecoveryAction.none
      ? "border-border bg-secondary text-foreground"
      : "border-gold bg-secondary text-primary";
  return (
    <div className="space-y-5" data-ocid="admin.btc_recovery_report">
      <div
        className={`space-y-1.5 rounded-lg border px-4 py-3 ${highlight}`}
        data-ocid="admin.btc_recovery_verdict"
      >
        <p className="text-sm font-semibold">
          {actionLabel(report.recommendedAction)}
        </p>
        <p className="text-sm text-foreground">{report.verdictText}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {report.verdictCode}
        </p>
      </div>
      <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
        <ReportRow label="Buyer principal">{report.buyer}</ReportRow>
        <ReportRow label="Deposit subaccount">
          {report.depositSubaccountHex}
        </ReportRow>
        <ReportRow label="Deposit stage">{report.trackingStage}</ReportRow>
        <ReportRow label="Last error">{lastError}</ReportRow>
        <ReportRow label="Conversion cause">{cause}</ReportRow>
        <ReportRow label="Pending ckBTC">
          {ckbtc(report.pendingCkbtcSats)}
        </ReportRow>
        <ReportRow label="Subaccount balance">
          {ckbtc(report.subaccountBalanceSats)}
        </ReportRow>
        <ReportRow label="Purchase lock held">
          {yesNo(report.purchaseLockHeld)}
        </ReportRow>
        <ReportRow label="Open ckBTC cost attempt">
          {yesNo(report.costAttemptOpen)}
        </ReportRow>
        <ReportRow label="Mintable remaining">
          {ttti(report.mintableRemaining)}{" "}
          <span className="text-muted-foreground">
            (minimum mint {ttti(report.minimumMint)})
          </span>
        </ReportRow>
        <ReportRow label="Sales paused">{yesNo(report.salesPaused)}</ReportRow>
        <ReportRow label="DEX paused">{yesNo(report.dexPaused)}</ReportRow>
        <ReportRow label="Rate available">
          {yesNo(report.validRateAvailable)}
        </ReportRow>
      </dl>
    </div>
  );
}

/** Admin helper: diagnose a stuck ckBTC deposit, finish its mint or refund it. */
export function BtcRecoveryCard({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [report, setReport] = useState<BtcMintDiagnosis | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const diagnose = useDiagnoseBtcMint();
  const finish = useFinishBtcMint();

  const trimmed = input.trim();
  const busy = diagnose.isPending || finish.isPending;
  const permanent =
    (report?.causePermanent ?? false) ||
    report?.recommendedAction === RecoveryAction.refund ||
    (outcome !== null && !outcome.ok && /permanent|refund/i.test(outcome.text));

  const fail = (e: Error) => {
    const text = e.message || "The request failed.";
    setError(text);
    toast.error(text);
  };

  const handleDiagnose = () => {
    if (trimmed === "" || busy) return;
    setError(null);
    setOutcome(null);
    diagnose.mutate(trimmed, {
      onSuccess: (result) => setReport(result),
      onError: fail,
    });
  };

  const runFinish = (refund: boolean) => {
    if (trimmed === "" || busy) return;
    setError(null);
    setOutcome(null);
    finish.mutate(
      { input: trimmed, refund },
      {
        onSuccess: (result) => {
          const described = describeResult(result);
          setOutcome(described);
          if (described.ok) toast.success(described.text);
          else toast.error(described.text);
        },
        onError: fail,
      },
    );
  };

  return (
    <div
      className={`space-y-5 ${className ?? ""}`}
      data-ocid="admin.btc_recovery_card"
    >
      <p className="max-w-3xl text-sm text-muted-foreground">
        Find out why a ckBTC deposit did not convert to {TTTI_SYMBOL}. Enter the
        buyer principal or the 64 character deposit subaccount, read the report,
        then finish the mint or refund the ckBTC to the buyer.
      </p>
      <form
        className="flex flex-wrap items-end gap-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleDiagnose();
        }}
      >
        <div className="min-w-0 flex-1 space-y-1.5 basis-96">
          <Label htmlFor="btc-recovery-input">
            Buyer principal or deposit subaccount (hex)
          </Label>
          <Input
            id="btc-recovery-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={EXAMPLE_SUBACCOUNT}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
            data-ocid="admin.btc_recovery_input"
          />
        </div>
        <Button
          type="submit"
          disabled={trimmed === "" || busy}
          className={PRIMARY_GOLD}
          data-ocid="admin.btc_recovery_diagnose_button"
        >
          {diagnose.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
          )}
          Diagnose
        </Button>
      </form>

      {error && (
        <p
          className="text-sm text-destructive"
          data-ocid="admin.btc_recovery_error_state"
        >
          {error}
        </p>
      )}

      {report && <Report report={report} />}

      {(report || outcome) && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={trimmed === "" || busy}
            onClick={() => runFinish(false)}
            className={PRIMARY_GOLD}
            data-ocid="admin.btc_recovery_finish_button"
          >
            {finish.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish mint
          </Button>
          {permanent && (
            <Button
              type="button"
              variant="outline"
              disabled={trimmed === "" || busy}
              onClick={() => setConfirmOpen(true)}
              className={`${SECONDARY_GOLD} text-destructive`}
              data-ocid="admin.btc_recovery_refund_button"
            >
              Refund ckBTC to buyer
            </Button>
          )}
          {permanent && <Badge variant="destructive">Permanent cause</Badge>}
        </div>
      )}

      {outcome && (
        <p
          className={`text-sm ${outcome.ok ? "text-success" : "text-destructive"}`}
          data-ocid={
            outcome.ok
              ? "admin.btc_recovery_success_state"
              : "admin.btc_recovery_refused_state"
          }
        >
          {outcome.text}
        </p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid="admin.btc_recovery_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Refund ckBTC to the buyer?</AlertDialogTitle>
            <AlertDialogDescription>
              The ckBTC of this deposit goes back to the buyer and no{" "}
              {TTTI_SYMBOL} is minted for it. A refund cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.btc_recovery_cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => runFinish(true)}
              data-ocid="admin.btc_recovery_confirm_button"
            >
              Refund ckBTC
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
