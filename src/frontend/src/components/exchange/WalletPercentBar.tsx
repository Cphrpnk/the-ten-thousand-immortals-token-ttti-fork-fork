import * as SliderPrimitive from "@radix-ui/react-slider";
import { useRef } from "react";
import type { PayToken } from "../../backend";
import { useDict } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";
import {
  PAY_TOKENS,
  WALLET_PERCENT_SNAPS,
  formatPayAmount,
  formatTtti,
  snapWalletPercent,
  spendableToken,
  tokenForWalletPercent,
  walletNetworkFees,
} from "../../lib/token";
import { cn } from "../../lib/utils";

const THUMB_PX = 20;

/** Left offset matching Radix's in-bounds thumb position for value 1..100. */
function markLeft(value: number): string {
  const pct = ((value - 1) / 99) * 100;
  return `calc(${pct}% + ${THUMB_PX / 2 - (pct * THUMB_PX) / 100}px)`;
}

interface WalletPercentBarProps {
  /** Selected pay token. */
  token: PayToken;
  /** Wallet balance of the token in base units. */
  balance: bigint | undefined;
  walletConnected: boolean;
  /** Chosen percentage, or null when the amount was typed. */
  percent: number | null;
  /** Current pay amount, used to place the thumb when no percentage is set. */
  currentAmount: bigint;
  disabled: boolean;
  /** TTTI-T received (rounded down) for a pay amount; null without a rate. */
  quote: (amount: bigint) => bigint | null;
  onSelect: (percent: number) => void;
}

export function WalletPercentBar({
  token,
  balance,
  walletConnected,
  percent,
  currentAmount,
  disabled,
  quote,
  onSelect,
}: WalletPercentBarProps) {
  const t = useDict(BUY_PANELS_TEXT);
  const keyboard = useRef(false);
  const { symbol, fee } = PAY_TOKENS[token];
  const feesText = formatPayAmount(walletNetworkFees(fee), token);
  const spendable = balance !== undefined ? spendableToken(balance, token) : 0n;
  const hint = !walletConnected
    ? t.percentConnect
    : balance === undefined
      ? t.percentBalanceUnavailable
      : spendable <= 0n
        ? t.percentNotCover(feesText)
        : null;
  const inactive = disabled || hint !== null;

  const approx =
    spendable > 0n ? Number((currentAmount * 100n) / spendable) : 1;
  const sliderValue = percent ?? Math.min(100, Math.max(1, approx));
  const amountAtPercent =
    percent !== null && balance !== undefined
      ? tokenForWalletPercent(balance, token, percent)
      : null;
  const tttiAtPercent =
    amountAtPercent !== null ? quote(amountAtPercent) : null;

  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid="exchange.percent_bar.panel"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span
          id="wallet-percent-label"
          className="text-sm text-muted-foreground"
        >
          {t.percentShare(symbol)}
        </span>
        <span
          className="font-mono text-sm font-semibold tabular-nums text-primary"
          aria-live="polite"
          data-ocid="exchange.percent_bar.value"
        >
          {percent !== null ? `${percent}%` : "—"}
        </span>
      </div>

      <div className="relative px-0">
        <SliderPrimitive.Root
          value={[sliderValue]}
          min={1}
          max={100}
          step={1}
          disabled={inactive}
          onKeyDown={() => {
            keyboard.current = true;
          }}
          onPointerDown={() => {
            keyboard.current = false;
          }}
          onValueChange={([value]) => {
            if (value === undefined) return;
            onSelect(
              keyboard.current ? Math.round(value) : snapWalletPercent(value),
            );
          }}
          className="relative flex w-full touch-none select-none items-center py-3 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
          data-ocid="exchange.percent_bar.input"
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-labelledby="wallet-percent-label"
            aria-valuetext={percent !== null ? `${percent}%` : undefined}
            className="block size-5 rounded-full border-2 border-gold-strong bg-background shadow-gold transition-smooth hover:ring-4 hover:ring-ring/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/70 data-[disabled]:pointer-events-none"
          />
        </SliderPrimitive.Root>
        <div className="relative h-2" aria-hidden="true">
          {WALLET_PERCENT_SNAPS.map((point) => (
            <span
              key={point}
              className={cn(
                "absolute top-0 h-2 w-px -translate-x-1/2",
                percent === point ? "bg-primary" : "bg-muted-foreground/50",
              )}
              style={{ left: markLeft(point) }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {WALLET_PERCENT_SNAPS.map((point, index) => (
          <button
            key={point}
            type="button"
            onClick={() => onSelect(point)}
            disabled={inactive}
            aria-pressed={percent === point}
            className={cn(
              "min-h-11 rounded-md border px-1 font-mono text-xs tabular-nums transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9",
              percent === point
                ? "border-gold-strong bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-gold hover:text-foreground",
            )}
            data-ocid={`exchange.percent_bar.button.${index + 1}`}
          >
            {point}%
          </button>
        ))}
      </div>

      {hint ? (
        <p
          className="text-xs text-muted-foreground"
          data-ocid="exchange.percent_bar.hint"
        >
          {hint}
        </p>
      ) : amountAtPercent !== null ? (
        <p
          className="text-xs tabular-nums text-muted-foreground"
          data-ocid="exchange.percent_bar.summary"
        >
          {t.percentSummary(
            String(percent),
            formatPayAmount(amountAtPercent, token),
            tttiAtPercent !== null ? formatTtti(tttiAtPercent) : "—",
          )}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t.percentComputedOn(feesText)}
        </p>
      )}
    </div>
  );
}
