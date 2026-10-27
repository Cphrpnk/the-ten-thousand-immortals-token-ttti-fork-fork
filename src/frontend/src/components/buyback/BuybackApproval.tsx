import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import {
  useIcrc1BalanceOf,
  useIcrc1Fee,
  useIcrc2Allowance,
  useTttiIcrc2Approve,
} from "../../hooks/useQueries";
import { type Lang, toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import {
  APPROVAL_EXPIRY_PRESETS,
  type ApprovalExpiryChoice,
  isAllowanceExpired,
  needsStrongWarning,
  resolveExpiresAt,
} from "../../lib/approvals";
import { formatTttiQuantity } from "../../lib/buyback";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

export function formatBuybackNs(ns: bigint, lang: Lang): string {
  return new Date(Number(ns / 1_000_000n)).toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface BuybackApprovalProps {
  owner: Principal;
  spender: Principal;
  /** quote.tttiAllowanceRequired: the approval cap. */
  required: bigint;
  /** Called with whether an approval covering `required` is in place. */
  onReadyChange: (ready: boolean) => void;
}

/** Step 1: TTTI-T approval to the contract, capped and with an expiration. */
export function BuybackApproval({
  owner,
  spender,
  required,
  onReadyChange,
}: BuybackApprovalProps) {
  const t = useDict(BUYBACK_TEXT);
  const a = useDict(ADDRESS_BOOK_TEXT);
  const { lang } = useLanguage();
  const approve = useTttiIcrc2Approve();
  const { data: fee } = useIcrc1Fee();
  const { data: balance } = useIcrc1BalanceOf({ owner });
  const allowanceQuery = useIcrc2Allowance({
    account: { owner },
    spender: { owner: spender },
  });
  const [choice, setChoice] = useState<ApprovalExpiryChoice>("15m");
  const [customDate, setCustomDate] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = allowanceQuery.data;
  const currentExpiry = current?.expires_at;
  const inPlace =
    !!current &&
    current.allowance >= required &&
    !isAllowanceExpired({
      allowance: current.allowance,
      expiresAt: currentExpiry,
    });

  const custom = customDate ? new Date(customDate) : null;
  const expiresAt = resolveExpiresAt(choice, custom);
  const strong = needsStrongWarning({ amount: required, balance, expiresAt });
  const strongLines = [
    ...(strong.overBalance ? [t.warnOverBalance] : []),
    ...(strong.longLived ? [t.warnLongLived] : []),
  ];
  const amountText = formatTttiQuantity(required, lang);

  const send = async () => {
    setError(null);
    const at = resolveExpiresAt(choice, custom);
    if (at === null) {
      setError(a.errExpirationRequired);
      return;
    }
    try {
      const result = await approve.mutateAsync({
        amount: required,
        spender: { owner: spender },
        expires_at: at,
      });
      if (result.__kind__ === "Ok") {
        setChecked(false);
        await allowanceQuery.refetch();
        onReadyChange(true);
      } else {
        setError(`${t.approveError} (${result.Err.__kind__})`);
      }
    } catch {
      setError(t.approveError);
    }
  };

  return (
    <section
      className="flex flex-col gap-3 rounded-lg border border-gold bg-background/40 p-3"
      data-ocid="buyback.approval.panel"
    >
      <h4 className="font-display text-sm font-medium">{t.step1Title}</h4>
      <p className="callout-info px-3 py-2 text-xs">
        {t.approvalIntro(amountText)} {t.approvalTwoFees}
      </p>

      {inPlace && currentExpiry !== undefined && (
        <p
          className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
          aria-live="polite"
          data-ocid="buyback.approval.success_state"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {t.approvalInPlace(
            formatTttiQuantity(current.allowance, lang),
            formatBuybackNs(currentExpiry, lang),
          )}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm">
        <dt className="text-muted-foreground">{t.approvalAmountLabel}</dt>
        <dd className="text-right font-mono tabular-nums">{amountText}</dd>
        <dt className="text-muted-foreground">{t.spenderLabel}</dt>
        <dd className="text-right font-mono text-xs break-all">
          {spender.toText()}
        </dd>
      </dl>
      {balance !== undefined && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {t.balanceLine(formatTttiQuantity(balance, lang))}
        </p>
      )}

      <fieldset className="flex flex-col gap-2" disabled={approve.isPending}>
        <legend className="mb-2 text-sm font-medium">
          {a.expirationLabel}
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
              data-ocid={`buyback.approval.expiry.${c}.toggle`}
            >
              {a[EXPIRY_LABEL[c]]}
            </Button>
          ))}
        </div>
        {choice === "custom" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="buyback-approval-date">{a.customDateLabel}</Label>
            <Input
              id="buyback-approval-date"
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              aria-invalid={expiresAt === null}
              data-ocid="buyback.approval.custom_date.input"
            />
          </div>
        )}
        {expiresAt === null ? (
          <p
            className="text-xs text-destructive"
            data-ocid="buyback.approval.expiry.field_error"
          >
            {a.errExpirationRequired}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {a.allowanceExpiresAt(formatBuybackNs(expiresAt, lang))}
          </p>
        )}
      </fieldset>

      {fee !== undefined && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {t.approvalFeeLine(formatTttiQuantity(fee, lang))}
        </p>
      )}
      <ul
        className="callout-warning flex flex-col gap-1 px-3 py-2 text-xs"
        data-ocid="buyback.approval.warning"
      >
        {[t.warnCapped, t.warnFee, t.warnUnused, t.warnIrreversible].map(
          (line) => (
            <li key={line} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{line}</span>
            </li>
          ),
        )}
      </ul>
      {strongLines.length > 0 && (
        <ul
          className="callout-danger flex flex-col gap-1 px-3 py-2 text-xs font-medium"
          data-ocid="buyback.approval.danger_warning"
        >
          {strongLines.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-start gap-2">
        <Checkbox
          id="buyback-approval-confirm"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          disabled={approve.isPending}
          className="mt-0.5"
          data-ocid="buyback.approval.confirm.checkbox"
        />
        <Label
          htmlFor="buyback-approval-confirm"
          className="text-xs leading-snug"
        >
          {t.approveConfirm}
        </Label>
      </div>

      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid="buyback.approval.error_state"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {inPlace && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onReadyChange(true)}
            disabled={approve.isPending}
            className="rounded-lg"
            data-ocid="buyback.approval.skip_button"
          >
            {t.step2Title}
          </Button>
        )}
        <Button
          type="button"
          disabled={!checked || expiresAt === null || approve.isPending}
          onClick={() => void send()}
          className="rounded-lg shadow-gold"
          data-ocid="buyback.approval.confirm_button"
        >
          {approve.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.approving}
            </>
          ) : (
            t.approveButton
          )}
        </Button>
      </div>
    </section>
  );
}
