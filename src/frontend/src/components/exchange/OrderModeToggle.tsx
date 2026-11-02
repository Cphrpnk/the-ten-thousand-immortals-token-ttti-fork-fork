import { useDict } from "../../i18n/core/dict";
import { BUY_LIQUIDITY_TEXT } from "../../i18n/pages/buy";
import type { MintInputMode } from "./liquidityMint";

/** "ttti": quantity of TTTI-T to mint; "usd": dollars to pay. */
export type OrderMode = MintInputMode;

interface OrderModeToggleProps {
  mode: OrderMode;
  onChange: (mode: OrderMode) => void;
  disabled?: boolean;
}

/** Two-option radio selector between TTTI-T and dollar amount entry. */
export function OrderModeToggle({
  mode,
  onChange,
  disabled = false,
}: OrderModeToggleProps) {
  const t = useDict(BUY_LIQUIDITY_TEXT);
  const options: { value: OrderMode; label: string }[] = [
    { value: "ttti", label: t.modeTtti },
    { value: "usd", label: t.modeUsd },
  ];
  return (
    <fieldset
      className="grid grid-cols-2 gap-1 rounded-lg border border-gold bg-background/60 p-1"
      disabled={disabled}
      data-ocid="exchange.order_mode.toggle"
    >
      <legend className="sr-only">{t.modeLegend}</legend>
      {options.map((option) => (
        <label key={option.value} className="relative block min-w-0">
          <input
            type="radio"
            name="exchange-order-mode"
            value={option.value}
            checked={mode === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
            data-ocid={`exchange.order_mode.radio.${option.value}`}
          />
          <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-transparent px-3 text-center text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground peer-checked:border-gold-strong peer-checked:bg-primary/15 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
