import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type TokenApproval,
  useApproveSpender,
  useContactApprovals,
} from "../../hooks/useContactApprovals";
import { type Lang, toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import {
  APPROVAL_EXPIRY_PRESETS,
  type ApprovalExpiryChoice,
  isAllowanceActive,
  isAllowanceExpired,
  needsStrongWarning,
  resolveExpiresAt,
} from "../../lib/approvals";
import { formatUnits, parseUnits } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { normalizeToken } from "./TokenBalanceCard";
import { TokenLogo } from "./TokenLogo";

type Text = (typeof ADDRESS_BOOK_TEXT)["en"];
type ActionKind = "approve" | "revoke";

const EXPIRY_LABEL: Record<
  ApprovalExpiryChoice,
  "expiry15m" | "expiry1h" | "expiry24h" | "expiry7d" | "expiryCustom"
> = {
  "15m": "expiry15m",
  "1h": "expiry1h",
  "24h": "expiry24h",
  "7d": "expiry7d",
  custom: "expiryCustom",
};

function formatNs(ns: bigint, lang: Lang): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function amountText(value: bigint, token: TokenDescriptor, lang: Lang) {
  return `${formatUnits(value, token.decimals, 2, lang)} ${token.symbol}`;
}

function AllowanceStatus({ approval }: { approval: TokenApproval }) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const { lang } = useLanguage();
  const { allowance, token } = approval;
  if (approval.isLoading) {
    return (
      <span
        className="flex items-center gap-2"
        data-ocid="contact_approvals.loading_state"
      >
        <Skeleton className="h-3 w-24" />
        <span className="sr-only">{t.allowanceLoading}</span>
      </span>
    );
  }
  if (approval.isError || !allowance) {
    return (
      <span
        className="text-destructive"
        data-ocid="contact_approvals.error_state"
      >
        {t.allowanceError}
      </span>
    );
  }
  if (allowance.allowance === 0n) return <span>{t.allowanceNone}</span>;
  const expired = isAllowanceExpired(allowance);
  return (
    <span className="flex flex-wrap gap-x-2">
      <span className={cn("tabular-nums", expired && "line-through")}>
        {t.allowanceAmount(amountText(allowance.allowance, token, lang))}
      </span>
      <span className={expired ? "text-destructive" : undefined}>
        {expired
          ? t.allowanceExpired
          : allowance.expiresAt !== undefined
            ? t.allowanceExpiresAt(formatNs(allowance.expiresAt, lang))
            : t.allowanceNoExpiry}
      </span>
    </span>
  );
}

function Warnings({ t, strong }: { t: Text; strong: Array<string> }) {
  return (
    <>
      <ul
        className="callout-warning flex flex-col gap-1 px-3 py-2 text-xs"
        data-ocid="contact_approvals.warning"
      >
        {[t.warnTrust, t.warnUnknown, t.warnFee, t.warnRevoke].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {strong.length > 0 && (
        <ul
          className="callout-danger flex flex-col gap-1 px-3 py-2 text-xs font-medium"
          data-ocid="contact_approvals.danger_warning"
        >
          {strong.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ApprovalAction({
  approval,
  action,
  spender,
  onClose,
  onDone,
}: {
  approval: TokenApproval;
  action: ActionKind;
  spender: Principal;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const { lang } = useLanguage();
  const { token, balance, allowance } = approval;
  const mutation = useApproveSpender(spender);
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState<ApprovalExpiryChoice>("15m");
  const [customDate, setCustomDate] = useState("");
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === "approve";
  const parsed = parseUnits(amount, token.decimals);
  const amountValid = parsed !== null && parsed > 0n;
  const custom = customDate ? new Date(customDate) : null;
  const expiresAt = resolveExpiresAt(choice, custom);
  const strong = needsStrongWarning({
    amount: parsed ?? 0n,
    balance,
    expiresAt,
  });
  const strongLines = isApprove
    ? [
        ...(amountValid && strong.overBalance ? [t.warnOverBalance] : []),
        ...(strong.longLived ? [t.warnLongLived] : []),
      ]
    : [];
  const expected =
    allowance && !isAllowanceExpired(allowance) ? allowance.allowance : 0n;
  const ready = checked && (!isApprove || (amountValid && expiresAt !== null));

  const send = async () => {
    setError(null);
    const at = isApprove ? resolveExpiresAt(choice, custom) : null;
    if (isApprove && (at === null || parsed === null)) {
      setError(t.errExpirationRequired);
      setStep("edit");
      return;
    }
    // Opens the OISY / NFID window from this click, before any await.
    const release = mutation.begin();
    try {
      const outcome = await mutation.mutateAsync(
        isApprove && at !== null && parsed !== null
          ? {
              action: "approve",
              token,
              amount: parsed,
              expiresAt: at,
              expectedAllowance: expected,
            }
          : { action: "revoke", token, expectedAllowance: expected },
      );
      if (outcome.ok) {
        const message = isApprove
          ? t.approveSuccess(token.symbol)
          : t.revokeSuccess(token.symbol);
        toast.success(message);
        onDone(message);
      } else {
        setError(outcome.message);
        setStep("edit");
      }
    } catch {
      setError(t.approveError);
      setStep("edit");
    } finally {
      release();
    }
  };

  const idBase = `approval-${token.canisterId.toText()}`;

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-gold bg-background/40 p-3"
      data-ocid="contact_approvals.panel"
    >
      <p className="font-display text-sm font-medium">
        {isApprove ? t.formTitle(token.symbol) : t.revokeTitle(token.symbol)}
      </p>

      {step === "edit" && isApprove && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${idBase}-amount`}>{t.maxAmountLabel}</Label>
            <Input
              id={`${idBase}-amount`}
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={amount !== "" && !amountValid}
              className="font-mono text-sm"
              data-ocid="contact_approvals.amount.input"
            />
            {amount !== "" && !amountValid && (
              <p
                className="text-xs text-destructive"
                data-ocid="contact_approvals.amount.field_error"
              >
                {t.errAmountInvalid}
              </p>
            )}
            {balance !== undefined && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {t.balanceLine(amountText(balance, token, lang))}
              </p>
            )}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">
              {t.expirationLabel}
            </legend>
            <div className="flex flex-wrap gap-2">
              {[...APPROVAL_EXPIRY_PRESETS, "custom" as const].map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={choice === c ? "default" : "outline"}
                  aria-pressed={choice === c}
                  onClick={() => setChoice(c)}
                  className="rounded-lg transition-smooth"
                  data-ocid={`contact_approvals.expiry.${c}.toggle`}
                >
                  {t[EXPIRY_LABEL[c]]}
                </Button>
              ))}
            </div>
            {choice === "custom" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${idBase}-date`}>{t.customDateLabel}</Label>
                <Input
                  id={`${idBase}-date`}
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  aria-invalid={expiresAt === null}
                  data-ocid="contact_approvals.custom_date.input"
                />
              </div>
            )}
            {expiresAt === null ? (
              <p
                className="text-xs text-destructive"
                data-ocid="contact_approvals.expiry.field_error"
              >
                {t.errExpirationRequired}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t.allowanceExpiresAt(formatNs(expiresAt, lang))}
              </p>
            )}
          </fieldset>
        </>
      )}

      {step === "review" && isApprove && parsed !== null && (
        <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <dt className="text-muted-foreground">{t.maxAmountLabel}</dt>
          <dd className="text-right font-mono tabular-nums">
            {amountText(parsed, token, lang)}
          </dd>
          <dt className="text-muted-foreground">{t.expirationLabel}</dt>
          <dd className="text-right">
            {expiresAt !== null ? formatNs(expiresAt, lang) : "—"}
          </dd>
        </dl>
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        {t.feeLine(amountText(token.fee, token, lang))}
      </p>
      <Warnings t={t} strong={strongLines} />

      {step === "edit" && (
        <div className="flex items-start gap-2">
          <Checkbox
            id={`${idBase}-confirm`}
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
            data-ocid="contact_approvals.confirm.checkbox"
          />
          <Label htmlFor={`${idBase}-confirm`} className="text-xs leading-snug">
            {isApprove ? t.confirmCheckbox : t.confirmRevokeCheckbox}
          </Label>
        </div>
      )}

      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid="contact_approvals.error_state"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={step === "review" ? () => setStep("edit") : onClose}
          disabled={mutation.isPending}
          className="rounded-lg"
          data-ocid="contact_approvals.cancel_button"
        >
          {t.cancel}
        </Button>
        {step === "edit" ? (
          <Button
            type="button"
            variant={isApprove ? "default" : "destructive"}
            disabled={!ready}
            onClick={() => {
              setError(null);
              setStep("review");
            }}
            className="rounded-lg"
            data-ocid="contact_approvals.primary_button"
          >
            {isApprove
              ? allowance && isAllowanceActive(allowance)
                ? t.modify
                : t.grant
              : t.revoke}
          </Button>
        ) : (
          <Button
            type="button"
            variant={isApprove ? "default" : "destructive"}
            disabled={!ready || mutation.isPending}
            onClick={() => void send()}
            className="rounded-lg shadow-gold"
            data-ocid="contact_approvals.confirm_button"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.confirming}
              </>
            ) : (
              t.confirm
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Live ICRC-2 allowances granted to `spender`, with approve/modify/revoke. */
export function ContactApprovals({ spender }: { spender: Principal }) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const { approvals, signer, isLoading, isError, refetch } =
    useContactApprovals(spender);
  const [open, setOpen] = useState<{ id: string; action: ActionKind } | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <section
      className="flex flex-col gap-3"
      data-ocid="contact_approvals.section"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <h4 className="font-display text-base">{t.approvalsTitle}</h4>
      </div>
      <p className="callout-info px-3 py-2 text-xs">{t.approvalsIntro}</p>
      <p className="text-xs text-muted-foreground">
        {signer ? t.approvalsSignerHint : t.signerMissing}
      </p>

      {success && (
        <p
          className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          aria-live="polite"
          data-ocid="contact_approvals.success_state"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </p>
      )}

      {isError ? (
        <div
          className="flex items-center justify-between gap-2 text-sm text-destructive"
          data-ocid="contact_approvals.error_state"
        >
          <span>{t.allowanceError}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={refetch}
            data-ocid="contact_approvals.retry_button"
          >
            {t.retry}
          </Button>
        </div>
      ) : isLoading ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="contact_approvals.loading_state"
        >
          <span className="sr-only">{t.allowanceLoading}</span>
          {["a", "b", "c"].map((id) => (
            <Skeleton key={id} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2" data-ocid="contact_approvals.list">
          {approvals.map((raw, i) => {
            const approval = { ...raw, token: normalizeToken(raw.token) };
            const id = approval.token.canisterId.toText();
            const active =
              !!approval.allowance && isAllowanceActive(approval.allowance);
            const canAct = !!signer && !approval.isLoading && !approval.isError;
            return (
              <li
                key={id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3"
                data-ocid={`contact_approvals.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <TokenLogo
                    canisterId={id}
                    symbol={approval.token.symbol}
                    className="h-8 w-8"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {approval.token.symbol}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <AllowanceStatus approval={approval} />
                    </div>
                  </div>
                  {canAct && open?.id !== id && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSuccess(null);
                          setOpen({ id, action: "approve" });
                        }}
                        className="rounded-lg border-gold"
                        data-ocid={`contact_approvals.${active ? "edit_button" : "open_modal_button"}.${i + 1}`}
                      >
                        {active ? t.modify : t.grant}
                      </Button>
                      {active && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSuccess(null);
                            setOpen({ id, action: "revoke" });
                          }}
                          className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                          data-ocid={`contact_approvals.delete_button.${i + 1}`}
                        >
                          {t.revoke}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {open?.id === id && (
                  <ApprovalAction
                    key={`${id}-${open.action}`}
                    approval={approval}
                    action={open.action}
                    spender={spender}
                    onClose={() => setOpen(null)}
                    onDone={(message) => {
                      setOpen(null);
                      setSuccess(message);
                      refetch();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
