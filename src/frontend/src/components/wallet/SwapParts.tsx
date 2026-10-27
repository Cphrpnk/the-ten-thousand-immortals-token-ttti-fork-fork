import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useId } from "react";
import { toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import { formatPercent2, formatUnits } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export function formatSwapAmount(value: bigint, decimals: number): string {
  return formatUnits(value, decimals, 0);
}

/** Amount net of the withdrawal fee, never below 0. */
export function netOfFee(value: bigint, fee: bigint): bigint {
  return value > fee ? value - fee : 0n;
}

export function SwapNotice({
  tone,
  children,
  ocid,
}: {
  tone: "info" | "error" | "success";
  children: React.ReactNode;
  ocid: string;
}) {
  const cls =
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : tone === "success"
        ? "border-success/40 bg-success/10 text-success"
        : "border-border bg-muted/40 text-muted-foreground";
  const Icon =
    tone === "error"
      ? AlertTriangle
      : tone === "success"
        ? CheckCircle2
        : Loader2;
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${cls}`}
      data-ocid={ocid}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "info" ? "animate-spin motion-reduce:animate-none" : ""}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

interface QuoteDetailsProps {
  from: TokenDescriptor;
  to: TokenDescriptor;
  quote: bigint;
  minOut: bigint;
  poolFee: bigint;
  expired: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

/** Estimated output, pool fee, ledger fees and guaranteed minimum. */
export function QuoteDetails({
  from,
  to,
  quote,
  minOut,
  poolFee,
  expired,
  refreshing,
  onRefresh,
}: QuoteDetailsProps) {
  const t = useDict(SWAP_TEXT);
  const { lang } = useLanguage();
  const rows: Array<[string, string, string]> = [
    [
      t.estimated,
      `${formatSwapAmount(netOfFee(quote, to.fee), to.decimals)} ${to.symbol}`,
      "estimated",
    ],
    [t.poolFee, formatPercent2(Number(poolFee) / 10_000, lang), "pool_fee"],
    [
      t.ledgerFees,
      t.ledgerFeesValue(
        `${formatSwapAmount(2n * from.fee, from.decimals)} ${from.symbol}`,
        `${formatSwapAmount(to.fee, to.decimals)} ${to.symbol}`,
      ),
      "ledger_fees",
    ],
    [
      t.minimumReceived,
      `${formatSwapAmount(netOfFee(minOut, to.fee), to.decimals)} ${to.symbol}`,
      "minimum",
    ],
  ];
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid="wallet.swap.quote.panel"
    >
      <dl className="flex flex-col gap-1.5 text-sm">
        {rows.map(([label, value, id]) => (
          <div key={id} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
              className="text-right font-mono tabular-nums text-foreground"
              data-ocid={`wallet.swap.quote.${id}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {expired && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-destructive">
          <span data-ocid="wallet.swap.quote_expired_state">
            {t.quoteExpired}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            data-ocid="wallet.swap.refresh_quote_button"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {t.refreshQuote}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ConfirmStepProps {
  from: TokenDescriptor;
  to: TokenDescriptor;
  amountIn: bigint;
  minOut: bigint;
  poolId: string;
  signerName: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

/** What the user signs, the warning and the explicit confirmation box. */
export function ConfirmStep({
  from,
  to,
  amountIn,
  minOut,
  poolId,
  signerName,
  checked,
  onCheckedChange,
}: ConfirmStepProps) {
  const t = useDict(SWAP_TEXT);
  const { lang } = useLanguage();
  const checkId = useId();
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString(
    toIntlLocale(lang),
    { hour: "2-digit", minute: "2-digit" },
  );
  return (
    <div className="flex flex-col gap-3" data-ocid="wallet.swap.confirm.panel">
      <h3 className="font-display text-base font-semibold text-foreground">
        {t.confirmTitle}
      </h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-foreground">
        <li>
          {t.confirmApproval(
            formatSwapAmount(amountIn + from.fee, from.decimals),
            from.symbol,
            poolId,
          )}
        </li>
        <li>{t.confirmExpiry(expiry)}</li>
        <li>{t.confirmSteps(from.symbol, to.symbol)}</li>
        <li>
          {t.confirmMinimum(
            formatSwapAmount(netOfFee(minOut, to.fee), to.decimals),
            to.symbol,
          )}
        </li>
        <li>{t.confirmSigner(signerName)}</li>
      </ul>
      <p
        className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        data-ocid="wallet.swap.warning"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {t.warning}
      </p>
      <div className="flex items-start gap-2">
        <Checkbox
          id={checkId}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          data-ocid="wallet.swap.confirm_checkbox"
        />
        <Label htmlFor={checkId} className="text-sm font-normal leading-snug">
          {t.confirmCheck}
        </Label>
      </div>
    </div>
  );
}

interface UnusedBalanceProps {
  entries: Array<{ token: TokenDescriptor; amount: bigint }>;
  busy: boolean;
  message: string | null;
  onWithdraw: () => void;
}

/** Balance left in the pool after an incomplete swap, with a withdraw action. */
export function UnusedBalance({
  entries,
  busy,
  message,
  onWithdraw,
}: UnusedBalanceProps) {
  const t = useDict(SWAP_TEXT);
  const withdrawable = entries.some((e) => e.amount > e.token.fee);
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-gold px-3 py-3"
      data-ocid="wallet.swap.unused.panel"
    >
      <p className="text-sm font-semibold text-foreground">{t.unusedTitle}</p>
      <p className="text-xs text-muted-foreground">{t.unusedText}</p>
      <ul className="flex flex-col gap-1 font-mono text-sm tabular-nums">
        {entries.map(({ token, amount }) => (
          <li key={token.canisterId.toText()}>
            {formatSwapAmount(amount, token.decimals)} {token.symbol}
          </li>
        ))}
      </ul>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      <Button
        type="button"
        variant="outline"
        className="self-start rounded-lg"
        onClick={onWithdraw}
        disabled={busy || !withdrawable}
        data-ocid="wallet.swap.withdraw_unused_button"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? t.withdrawing : t.withdrawUnused}
      </Button>
    </div>
  );
}
