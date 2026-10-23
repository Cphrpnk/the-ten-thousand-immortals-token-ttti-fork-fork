import type { PayToken } from "../../backend";
import { useDict } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";
import {
  BTC_PAY_OPTION,
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  feeLabelFor,
} from "../../lib/token";

/** Optional BTC choice; it does not change the PayToken value. */
interface BtcChoice {
  selected: boolean;
  onSelect: () => void;
  available?: boolean;
}

interface PayTokenSelectorProps {
  value: PayToken;
  onChange: (token: PayToken) => void;
  /** Whether each token can be bought with (treasury configured). */
  available: (token: PayToken) => boolean;
  disabled?: boolean;
  /** Adds a "BTC" option (paid by Bitcoin deposit, settled as ckBTC). */
  btc?: BtcChoice;
}

const OPTION_CLASS =
  "flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-background/60 px-2 py-2 text-center transition-smooth hover:border-gold peer-checked:border-gold-strong peer-checked:bg-primary/15 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:border-border";

function symbolClass(active: boolean): string {
  return active
    ? "font-mono text-sm font-semibold text-primary"
    : "font-mono text-sm font-semibold text-foreground";
}

/** Radio selector of the token paid: ICP, ckBTC, ckUSDC, ckUSDT and optionally BTC. */
export function PayTokenSelector({
  value,
  onChange,
  available,
  disabled = false,
  btc,
}: PayTokenSelectorProps) {
  const t = useDict(BUY_PANELS_TEXT);
  const btcSelected = btc?.selected ?? false;
  const btcOpen = btc?.available ?? true;
  return (
    <fieldset
      className={
        btc
          ? "grid grid-cols-2 gap-1.5 sm:grid-cols-5"
          : "grid grid-cols-2 gap-1.5 sm:grid-cols-4"
      }
      disabled={disabled}
      data-ocid="exchange.pay_token.select"
    >
      <legend className="mb-2 text-sm text-muted-foreground">
        {t.payWith}
      </legend>
      {PAY_TOKEN_ORDER.map((token) => {
        const descriptor = PAY_TOKENS[token];
        const open = available(token);
        const checked = !btcSelected && value === token;
        return (
          <label key={token} className="relative block min-w-0">
            <input
              type="radio"
              name="exchange-pay-token"
              value={token}
              checked={checked}
              disabled={!open}
              onChange={() => onChange(token)}
              className="peer sr-only"
              data-ocid={`exchange.pay_token.radio.${token}`}
            />
            <span className={OPTION_CLASS}>
              <span className={symbolClass(checked)}>{descriptor.symbol}</span>
              <span className="text-xs text-muted-foreground">
                {open
                  ? t.feeShort(feeLabelFor(descriptor.feeBps))
                  : t.unavailable}
              </span>
            </span>
          </label>
        );
      })}
      {btc ? (
        <label className="relative block min-w-0">
          <input
            type="radio"
            name="exchange-pay-token"
            value={BTC_PAY_OPTION.id}
            checked={btcSelected}
            disabled={!btcOpen}
            onChange={btc.onSelect}
            className="peer sr-only"
            data-ocid="exchange.pay_token.radio.btc"
          />
          <span className={OPTION_CLASS}>
            <span className={symbolClass(btcSelected)}>
              {BTC_PAY_OPTION.symbol}
            </span>
            <span className="text-xs text-muted-foreground">
              {btcOpen
                ? t.feeShort(feeLabelFor(BTC_PAY_OPTION.feeBps))
                : t.unavailable}
            </span>
          </span>
        </label>
      ) : null}
    </fieldset>
  );
}
