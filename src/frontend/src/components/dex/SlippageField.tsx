import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DEFAULT_SLIPPAGE_BPS, parsePercentBps } from "./liquidityFormat";

/** Stable DOM id of the shared tolerance field (one per dialog). */
export const SLIPPAGE_FIELD_ID = "dex-slippage";

/** Default tolerance (0.5 %) as input text in the active language. */
export function defaultSlippageText(): string {
  return formatNumber(Number(DEFAULT_SLIPPAGE_BPS) / 100, {
    maximumFractionDigits: 2,
  });
}

export interface SlippageFieldProps {
  /** Input text; '.' and ',' are both accepted as decimal separator. */
  value: string;
  /** New text and its parsed basis points, or null while the text is invalid. */
  onChange: (text: string, bps: bigint | null) => void;
  disabled?: boolean;
  /** data-ocid prefix; defaults to "pools.slippage". */
  ocidPrefix?: string;
}

/** Slippage tolerance shared by the swap and add-liquidity dialogs. */
export function SlippageField({
  value,
  onChange,
  disabled = false,
  ocidPrefix = "pools.slippage",
}: SlippageFieldProps) {
  const t = useDict(DEX_TEXT);
  const bps = parsePercentBps(value);
  const invalid = value.trim() !== "" && bps === null;
  const hintId = `${SLIPPAGE_FIELD_ID}-hint`;
  const errorId = `${SLIPPAGE_FIELD_ID}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={SLIPPAGE_FIELD_ID}>{t.slippageLabel}</Label>
      <Input
        id={SLIPPAGE_FIELD_ID}
        value={value}
        onChange={(e) =>
          onChange(e.target.value, parsePercentBps(e.target.value))
        }
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        className="w-28 font-mono tabular-nums"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${hintId} ${errorId}` : hintId}
        data-ocid={`${ocidPrefix}.input`}
      />
      <p id={hintId} className="text-xs text-muted-foreground">
        {t.slippageFieldHint} {t.addSlippageDefault}
      </p>
      {invalid && (
        <p
          id={errorId}
          className="text-xs text-destructive"
          data-ocid={`${ocidPrefix}.field_error`}
        >
          {t.slippageInvalid}
        </p>
      )}
    </div>
  );
}
