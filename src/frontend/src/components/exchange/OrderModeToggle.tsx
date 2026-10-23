import { useDict } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";

/** "pay": amount of the pay token; "ttti": number of TTTI-T to receive. */
export type OrderMode = "pay" | "ttti";

interface OrderModeToggleProps {
  mode: OrderMode;
  onChange: (mode: OrderMode) => void;
  /** Symbol of the selected pay token, e.g. "ckBTC". */
  tokenSymbol: string;
  disabled?: boolean;
}

/** Two-option radio selector between pay-token and TTTI-T amount orders. */
export function OrderModeToggle({
  mode,
  onChange,
  tokenSymbol,
  disabled = false,
}: OrderModeToggleProps) {
  const t = useDict(BUY_PANELS_TEXT);
  const options: { value: OrderMode; label: string }[] = [
    { value: "pay", label: t.orderAmountIn(tokenSymbol) },
    { value: "ttti", label: t.orderAmountTtti },
  ];
  return (
    <fieldset
      className="grid grid-cols-2 gap-1 rounded-lg border border-gold bg-background/60 p-1"
      disabled={disabled}
      data-ocid="exchange.order_mode.toggle"
    >
      <legend className="sr-only">{t.orderLegend}</legend>
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
