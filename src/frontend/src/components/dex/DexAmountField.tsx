import { useState } from "react";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { parseUnits } from "../../lib/token";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/** Amount input accepting '.' or ',' as decimal separator. */
export function DexAmountField({
  id,
  label,
  value,
  onChange,
  decimals,
  hint,
  disabled,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (text: string) => void;
  decimals: number;
  hint?: string;
  disabled: boolean;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const [touched, setTouched] = useState(false);
  const parsed = parseUnits(value, decimals);
  const invalid =
    touched && value.trim() !== "" && (parsed === null || parsed <= 0n);
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={t.amountPlaceholder}
        inputMode="decimal"
        autoComplete="off"
        className="font-mono tabular-nums"
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        disabled={disabled}
        data-ocid={`${ocid}.input`}
      />
      {invalid && (
        <p
          id={errorId}
          className="text-xs text-destructive"
          data-ocid={`${ocid}.field_error`}
        >
          {t.amountInvalid}
        </p>
      )}
      {hint && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {hint}
        </span>
      )}
    </div>
  );
}
