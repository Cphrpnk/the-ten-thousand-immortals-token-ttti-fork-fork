import { Principal } from "@icp-sdk/core/principal";
import { type FormEvent, useState } from "react";
import { FeeTier } from "../../backend";
import type { CounterToken, DexConfig } from "../../backend";
import { useRequestPair } from "../../hooks/useDex";
import { useIcrc1Fee } from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import {
  FEE_TIER_ORDER,
  approvalErrorText,
  feeTierLabel,
  formatTttiAmount,
  requestErrorText,
} from "./dexFormat";

type CounterKey = "icp" | "ckbtc" | "ckusdc" | "ckusdt" | "tttiT";

const COUNTERS: ReadonlyArray<{ key: CounterKey; label: string }> = [
  { key: "icp", label: "ICP" },
  { key: "ckbtc", label: "ckBTC" },
  { key: "ckusdc", label: "ckUSDC" },
  { key: "ckusdt", label: "ckUSDT" },
  { key: "tttiT", label: "TTTI-T" },
];

function toCounterToken(key: CounterKey): CounterToken {
  switch (key) {
    case "icp":
      return { __kind__: "icp", icp: null };
    case "ckbtc":
      return { __kind__: "ckbtc", ckbtc: null };
    case "ckusdc":
      return { __kind__: "ckusdc", ckusdc: null };
    case "ckusdt":
      return { __kind__: "ckusdt", ckusdt: null };
    case "tttiT":
      return { __kind__: "tttiT", tttiT: null };
  }
}

function parsePrincipal(text: string): Principal | null {
  try {
    return text.trim() ? Principal.fromText(text.trim()) : null;
  } catch {
    return null;
  }
}

function isCounterKey(value: string): value is CounterKey {
  return COUNTERS.some((c) => c.key === value);
}

export function PairRequestForm({ config }: { config: DexConfig }) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const feeQuery = useIcrc1Fee();
  const request = useRequestPair();

  const [ledgerText, setLedgerText] = useState("");
  const [ledgerTouched, setLedgerTouched] = useState(false);
  const [counter, setCounter] = useState<CounterKey | "">("");
  const [tier, setTier] = useState<FeeTier>(FeeTier.bps30);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tiers = FEE_TIER_ORDER.filter((f) => config.feeTiers.includes(f));
  const maxChars = Number(config.messageMaxChars);
  const ledgerId = parsePrincipal(ledgerText);
  const ledgerInvalid = ledgerTouched && ledgerText.trim() !== "" && !ledgerId;
  const tooLong = message.length > maxChars;
  const fee = feeQuery.data;
  const approvalAmount =
    fee !== undefined ? formatTttiAmount(config.requestDeposit + fee) : null;
  const canSubmit =
    !!ledgerId && counter !== "" && !tooLong && confirmed && !request.isPending;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLedgerTouched(true);
    if (!ledgerId || counter === "" || tooLong || !confirmed) return;
    const captured = { ledger: ledgerText, message };
    setError(null);
    setSuccess(false);
    request.mutate(
      {
        ledgerId,
        counter: toCounterToken(counter),
        feeTier: tier,
        message: message.trim(),
      },
      {
        onSuccess: (outcome) => {
          if (outcome.__kind__ === "ok") {
            setSuccess(true);
            setConfirmed(false);
            setLedgerTouched(false);
            setLedgerText((cur) => (cur === captured.ledger ? "" : cur));
            setMessage((cur) => (cur === captured.message ? "" : cur));
          } else if (outcome.__kind__ === "approvalFailed") {
            setError(approvalErrorText(t, outcome.approvalFailed, fee ?? 0n));
          } else {
            setError(requestErrorText(t, outcome.err, lang));
          }
        },
        onError: (err) => setError(t.errApprovalFailed(err.message)),
      },
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
      data-ocid="pair_request.form"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="pair-ledger-id">{t.ledgerId}</Label>
        <Input
          id="pair-ledger-id"
          value={ledgerText}
          onChange={(e) => setLedgerText(e.target.value)}
          onBlur={() => setLedgerTouched(true)}
          placeholder={t.ledgerIdPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          aria-invalid={ledgerInvalid}
          aria-describedby={ledgerInvalid ? "pair-ledger-error" : undefined}
          data-ocid="pair_request.ledger_id.input"
        />
        {ledgerInvalid && (
          <p
            id="pair-ledger-error"
            className="text-xs text-destructive"
            data-ocid="pair_request.ledger_id.field_error"
          >
            {t.ledgerIdInvalid}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pair-counter">{t.counterToken}</Label>
        <Select
          value={counter}
          onValueChange={(v) => isCounterKey(v) && setCounter(v)}
        >
          <SelectTrigger
            id="pair-counter"
            data-ocid="pair_request.counter.select"
          >
            <SelectValue placeholder={t.counterTokenPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {COUNTERS.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{t.feeTier}</legend>
        <div className="grid grid-cols-3 overflow-hidden rounded-md border border-input">
          {tiers.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={tier === f}
              onClick={() => setTier(f)}
              className={cn(
                "min-h-10 border-input text-sm tabular-nums transition-smooth border-e last:border-e-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                tier === f
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
              data-ocid={`pair_request.fee_tier.${f}.toggle`}
            >
              {feeTierLabel(t, f)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pair-message">{t.message}</Label>
        <Textarea
          id="pair-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          aria-invalid={tooLong}
          data-ocid="pair_request.message.textarea"
        />
        <p
          className={cn(
            "text-xs tabular-nums",
            tooLong ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {tooLong
            ? t.errMessageTooLong(formatNumber(maxChars))
            : `${formatNumber(message.length)} / ${t.messageMax(formatNumber(maxChars))}`}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm">
        <p className="font-mono tabular-nums" data-ocid="pair_request.deposit">
          {t.deposit(formatTttiAmount(config.requestDeposit))}
        </p>
        <p className="text-xs text-muted-foreground">{t.depositRule}</p>
        {approvalAmount && (
          <div className="callout-warning flex items-start gap-2 px-3 py-2.5">
            <Checkbox
              id="pair-approval-confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
              disabled={request.isPending}
              className="mt-0.5"
              data-ocid="pair_request.approval_confirm.checkbox"
            />
            <Label
              htmlFor="pair-approval-confirm"
              className="text-xs leading-relaxed font-normal"
            >
              {t.depositApproval(approvalAmount)}
            </Label>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11"
        data-ocid="pair_request.submit_button"
      >
        {request.isPending ? t.submitting : t.submit}
      </Button>

      <div aria-live="polite">
        {error && (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pair_request.error_state"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p
            className="callout-info px-3 py-2 text-sm text-foreground"
            data-ocid="pair_request.success_state"
          >
            {t.submitted}
          </p>
        )}
      </div>
    </form>
  );
}
