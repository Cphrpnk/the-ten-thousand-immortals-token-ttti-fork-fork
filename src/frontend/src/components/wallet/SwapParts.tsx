import { AlertTriangle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { useId } from "react";
import { toIntlLocale, useDict, useLanguage } from "../../i18n/core";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import type { RouteKind } from "../../lib/swapRoutes";
import { formatUnits } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { TokenFiat } from "./TokenFiat";

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

/** « Add a token » entry of the swap token selector. */
export function AddTokenTrigger({
  open,
  disabled,
  onToggle,
}: {
  open: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const t = useDict(SWAP_TEXT);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="self-end rounded-lg text-muted-foreground hover:text-foreground"
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={open}
      data-ocid="wallet.swap.add_token.open_modal_button"
    >
      <Plus className="h-4 w-4" />
      {t.addToken}
    </Button>
  );
}

interface ConfirmStepProps {
  route: RouteKind;
  from: TokenDescriptor;
  to: TokenDescriptor;
  amountIn: bigint;
  minOut: bigint;
  /** ICPSwap pool canister ID; unused for the native route. */
  poolId: string;
  signerName: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

/** What the user signs, the warning and the explicit confirmation box. */
export function ConfirmStep({
  route,
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
  const native = route === "native";
  return (
    <div className="flex flex-col gap-3" data-ocid="wallet.swap.confirm.panel">
      <h3 className="font-display text-base font-semibold text-foreground">
        {t.confirmTitle}
      </h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-foreground">
        <li>
          {native
            ? t.confirmNativeApproval(
                formatSwapAmount(amountIn + from.fee, from.decimals),
                from.symbol,
              )
            : t.confirmApproval(
                formatSwapAmount(amountIn + from.fee, from.decimals),
                from.symbol,
                poolId,
              )}
        </li>
        <li>{t.confirmExpiry(expiry)}</li>
        <li>
          {native
            ? t.confirmNativeSteps(from.symbol, to.symbol)
            : t.confirmSteps(from.symbol, to.symbol)}
        </li>
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
        {native ? t.warningNative : t.warning}
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
  /** Title and text; default to the ICPSwap pool wording. */
  title?: string;
  text?: string;
  panelOcid?: string;
  buttonOcid?: string;
}

/** Balance left in the pool after an incomplete swap, with a withdraw action. */
export function UnusedBalance({
  entries,
  busy,
  message,
  onWithdraw,
  title,
  text,
  panelOcid = "wallet.swap.unused.panel",
  buttonOcid = "wallet.swap.withdraw_unused_button",
}: UnusedBalanceProps) {
  const t = useDict(SWAP_TEXT);
  const withdrawable = entries.some((e) => e.amount > e.token.fee);
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-gold px-3 py-3"
      data-ocid={panelOcid}
    >
      <p className="text-sm font-semibold text-foreground">
        {title ?? t.unusedTitle}
      </p>
      <p className="text-xs text-muted-foreground">{text ?? t.unusedText}</p>
      <ul className="flex flex-col gap-1 font-mono text-sm tabular-nums">
        {entries.map(({ token, amount }) => (
          <li key={token.canisterId.toText()}>
            {formatSwapAmount(amount, token.decimals)} {token.symbol}{" "}
            <TokenFiat token={token} amount={amount} />
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
        data-ocid={buttonOcid}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? t.withdrawing : t.withdrawUnused}
      </Button>
    </div>
  );
}
