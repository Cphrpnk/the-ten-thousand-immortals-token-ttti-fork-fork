import { Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useFeeBounds,
  useGetFee,
  useGetFeeCollector,
  useGetMaxSupply,
  useSetFee,
  useTokenInfo,
} from "../../hooks/useQueries";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  encodeAccountText,
  formatTtti,
  parseTtti,
} from "../../lib/token";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { AdminStat, RevealText } from "./AdminUi";
import { GOLD_CARD, SECONDARY_GOLD } from "./styles";

function TransferFeeForm() {
  const { data: currentFee } = useGetFee();
  const { data: feeBounds } = useFeeBounds();
  const setFee = useSetFee();
  const [feeInput, setFeeInput] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const feeMin = feeBounds?.min ?? 0n;
  const feeMax = feeBounds?.max;
  const boundsLabel =
    feeMax === undefined
      ? null
      : `${formatTtti(feeMin)} – ${formatTtti(feeMax)} ${TTTI_SYMBOL}`;
  const parsed = parseTtti(feeInput);
  const inlineError =
    feeInput.trim() === ""
      ? null
      : parsed === null
        ? `Enter a fee with up to ${TTTI_DECIMALS} decimals ('.' or ',').`
        : parsed < feeMin || (feeMax !== undefined && parsed > feeMax)
          ? `The fee must be between ${boundsLabel ?? "the allowed bounds"}.`
          : null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (parsed === null || inlineError) return;
    const fee = parsed;
    const captured = feeInput;
    setFeeInput("");
    setFee.mutate(fee, {
      onSuccess: () => {
        const text = `Transfer fee updated to ${formatTtti(fee)} ${TTTI_SYMBOL}.`;
        setMessage({ ok: true, text });
        toast.success("Fee updated");
      },
      onError: (error) => {
        const text = error.message || "Failed to update the fee.";
        setMessage({ ok: false, text });
        toast.error(text);
        setFeeInput((current) => (current === "" ? captured : current));
      },
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2"
      noValidate
      data-ocid="admin.fee_form"
    >
      <Label htmlFor="fee-amount" className="admin-stat-label">
        New transfer fee · test version only
      </Label>
      <div className="flex flex-wrap items-start gap-3">
        <Input
          id="fee-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={formatTtti(currentFee ?? 0n)}
          value={feeInput}
          onChange={(e) => setFeeInput(e.target.value)}
          aria-invalid={!!inlineError}
          aria-describedby="fee-amount-hint"
          className="w-48 font-mono"
          data-ocid="admin.fee_input"
        />
        <Button
          type="submit"
          variant="secondary"
          className={SECONDARY_GOLD}
          disabled={
            setFee.isPending ||
            !!inlineError ||
            feeInput.trim() === "" ||
            feeMax === undefined
          }
          data-ocid="admin.fee_submit_button"
        >
          {setFee.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update fee
        </Button>
      </div>
      <p
        id="fee-amount-hint"
        className={`text-xs ${inlineError ? "text-destructive" : "text-muted-foreground"}`}
        data-ocid={inlineError ? "admin.fee_field_error" : undefined}
      >
        {inlineError ??
          (boundsLabel
            ? `Allowed range: ${boundsLabel}.`
            : "Loading the allowed range…")}
      </p>
      {message && (
        <output
          className={`block text-sm ${message.ok ? "text-success" : "text-destructive"}`}
          data-ocid={
            message.ok ? "admin.fee_success_state" : "admin.fee_error_state"
          }
        >
          {message.text}
        </output>
      )}
    </form>
  );
}

/** Supply, mint progress and the TTTI-T transfer fee in one card. */
export function OverviewCard() {
  const { data: tokenInfo, isLoading: isTokenLoading } = useTokenInfo();
  const { data: maxSupply } = useGetMaxSupply();
  const { data: currentFee, isLoading: isFeeLoading } = useGetFee();
  const { data: collector } = useGetFeeCollector();

  const totalSupply = tokenInfo?.totalSupply ?? 0n;
  const cap = maxSupply ?? tokenInfo?.maxSupply ?? 0n;
  const percent = cap > 0n ? Number((totalSupply * 10000n) / cap) / 100 : 0;
  const percentText =
    totalSupply > 0n && percent < 0.01 ? "<0.01%" : `${percent.toFixed(2)}%`;

  const loading = <Skeleton className="h-6 w-28" />;

  return (
    <div
      className={`${GOLD_CARD} space-y-8 pt-6`}
      data-ocid="admin.overview_card"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          label="Total supply"
          value={
            isTokenLoading
              ? loading
              : `${formatTtti(totalSupply)} ${TTTI_SYMBOL}`
          }
          ocid="admin.total_supply"
        />
        <AdminStat
          label="Max supply"
          value={isTokenLoading ? loading : `${formatTtti(cap)} ${TTTI_SYMBOL}`}
          ocid="admin.max_supply"
        />
        <div className="min-w-0 space-y-1.5">
          <p className="admin-stat-label">Mint progress</p>
          <div
            className="admin-stat-value text-primary"
            data-ocid="admin.supply_progress"
          >
            {isTokenLoading ? loading : percentText}
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
        <AdminStat
          label="Transfer fee"
          value={
            isFeeLoading
              ? loading
              : `${formatTtti(currentFee ?? 0n)} ${TTTI_SYMBOL}`
          }
          ocid="admin.transfer_fee"
        />
      </div>

      <div className="grid gap-8 border-t border-border pt-6 lg:grid-cols-2">
        <TransferFeeForm />
        <div className="space-y-2 text-sm" data-ocid="admin.fee_collector">
          <p className="admin-stat-label">Transfer fee account</p>
          {collector ? (
            <>
              <p className="font-mono tabular-nums">
                {formatTtti(collector.balance)} {TTTI_SYMBOL}
              </p>
              <RevealText
                text={encodeAccountText(collector.account)}
                label="transfer fee account"
                ocid="admin.fee_collector_account"
                head={18}
                tail={10}
              />
            </>
          ) : (
            <Skeleton className="h-10 w-full" />
          )}
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            Not withdrawable by anyone. Collected fees are delivered only after
            fresh minting reaches the cap.
          </p>
        </div>
      </div>
    </div>
  );
}
