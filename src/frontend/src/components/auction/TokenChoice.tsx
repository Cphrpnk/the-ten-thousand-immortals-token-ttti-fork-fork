import type { PayToken } from "../../backend";
import { useDict } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { PAY_TOKENS, PAY_TOKEN_ORDER } from "../../lib/token";

const OPTION_CLASS =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/60 px-2 py-2 text-center font-mono text-sm font-semibold text-foreground transition-smooth hover:border-gold peer-checked:border-gold-strong peer-checked:bg-primary/15 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

/** Radio choice of the token used for the deposit. */
export function TokenChoice({
  value,
  onChange,
  disabled,
}: {
  value: PayToken;
  onChange: (token: PayToken) => void;
  disabled: boolean;
}) {
  const t = useDict(AUCTION_TEXT);
  return (
    <fieldset
      className="grid grid-cols-2 gap-1.5 sm:grid-cols-4"
      disabled={disabled}
      data-ocid="auction.token.select"
    >
      <legend className="mb-2 text-sm text-muted-foreground">
        {t.tokenLegend}
      </legend>
      {PAY_TOKEN_ORDER.map((token) => (
        <label key={token} className="relative block min-w-0">
          <input
            type="radio"
            name="auction-token"
            value={token}
            checked={value === token}
            onChange={() => onChange(token)}
            className="peer sr-only"
            data-ocid={`auction.token.radio.${token}`}
          />
          <span className={OPTION_CLASS}>{PAY_TOKENS[token].symbol}</span>
        </label>
      ))}
    </fieldset>
  );
}
