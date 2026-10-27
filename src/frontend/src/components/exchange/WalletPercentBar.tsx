import * as SliderPrimitive from "@radix-ui/react-slider";
import { useId, useRef } from "react";
import type { PayToken } from "../../backend";
import { useDict } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";
import {
  PAY_TOKENS,
  WALLET_PERCENT_SNAPS,
  amountForPercentWithFees,
  formatPayAmount,
  formatTtti,
  formatUnits,
  networkFeesFor,
  snapWalletPercent,
  spendableWithFees,
} from "../../lib/token";
import { cn } from "../../lib/utils";

const THUMB_PX = 20;

/** Left offset matching Radix's in-bounds thumb position for value 1..100. */
function markLeft(value: number): string {
  const pct = ((value - 1) / 99) * 100;
  return `calc(${pct}% + ${THUMB_PX / 2 - (pct * THUMB_PX) / 100}px)`;
}

/** Labels of the bar: BUY_PANELS_TEXT (mint) or SEND_PERCENT_TEXT (send forms). */
export interface PercentBarText {
  percentConnect: string;
  /** Shown while the balance loads; falls back to percentBalanceUnavailable. */
  percentLoading?: string;
  percentBalanceUnavailable: string;
  percentNotCover: (fees: string) => string;
  percentShare: (symbol: string) => string;
  /** `quote` is the formatted quote, or "" when the bar has no quote. */
  percentSummary: (percent: string, amount: string, quote: string) => string;
  percentComputedOn: (fees: string) => string;
}

export interface PercentBarProps {
  /** Token symbol shown in the label. */
  symbol: string;
  /** Token decimals, used by the default amount format. */
  decimals: number;
  /** Ledger fee in base units. */
  ledgerFee: bigint;
  /** Ledger fees kept out of the balance: 2 for approve + transfer_from, 1 for a transfer. */
  feeCount: number;
  /** Wallet balance in base units. */
  balance: bigint | undefined;
  /** True while the balance is being fetched. */
  balanceLoading?: boolean;
  walletConnected: boolean;
  /** Chosen percentage, or null when the amount was typed. */
  percent: number | null;
  /** Current amount, used to place the thumb when no percentage is set. */
  currentAmount: bigint;
  disabled: boolean;
  text: PercentBarText;
  /** Amount display; defaults to formatUnits(amount, decimals). */
  formatAmount?: (amount: bigint) => string;
  /** Optional quote for an amount (e.g. TTTI-T received); null without a rate. */
  quote?: (amount: bigint) => bigint | null;
  /** Quote display; defaults to formatAmount. */
  formatQuote?: (value: bigint) => string;
  /** data-ocid prefix; defaults to "exchange.percent_bar". */
  ocidPrefix?: string;
  /** id of the label element; generated when omitted. */
  labelId?: string;
  onSelect: (percent: number) => void;
}

/** Wallet percentage bar: slider 1..100 snapping at 10/25/50/75/90/100. */
export function PercentBar({
  symbol,
  decimals,
  ledgerFee,
  feeCount,
  balance,
  balanceLoading = false,
  walletConnected,
  percent,
  currentAmount,
  disabled,
  text: t,
  formatAmount,
  quote,
  formatQuote,
  ocidPrefix = "exchange.percent_bar",
  labelId,
  onSelect,
}: PercentBarProps) {
  const keyboard = useRef(false);
  const generatedId = useId();
  const labelElementId = labelId ?? `percent-label-${generatedId}`;
  const format =
    formatAmount ?? ((amount: bigint) => formatUnits(amount, decimals));
  const feesText = format(networkFeesFor(ledgerFee, feeCount));
  const spendable =
    balance !== undefined
      ? spendableWithFees(balance, ledgerFee, feeCount)
      : 0n;
  const hint = !walletConnected
    ? t.percentConnect
    : balance === undefined
      ? balanceLoading && t.percentLoading
        ? t.percentLoading
        : t.percentBalanceUnavailable
      : spendable <= 0n
        ? t.percentNotCover(feesText)
        : null;
  const inactive = disabled || hint !== null;

  const approx =
    spendable > 0n ? Number((currentAmount * 100n) / spendable) : 1;
  const sliderValue = percent ?? Math.min(100, Math.max(1, approx));
  const amountAtPercent =
    percent !== null && balance !== undefined
      ? amountForPercentWithFees(balance, ledgerFee, feeCount, percent)
      : null;
  const quoteValue =
    quote && amountAtPercent !== null ? quote(amountAtPercent) : null;
  const quoteText = !quote
    ? ""
    : quoteValue !== null
      ? (formatQuote ?? format)(quoteValue)
      : "—";

  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid={`${ocidPrefix}.panel`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelElementId} className="text-sm text-muted-foreground">
          {t.percentShare(symbol)}
        </span>
        <span
          className="font-mono text-sm font-semibold tabular-nums text-primary"
          aria-live="polite"
          data-ocid={`${ocidPrefix}.value`}
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
          data-ocid={`${ocidPrefix}.input`}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-primary" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-labelledby={labelElementId}
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
            data-ocid={`${ocidPrefix}.button.${index + 1}`}
          >
            {point}%
          </button>
        ))}
      </div>

      {hint ? (
        <p
          className="text-xs text-muted-foreground"
          data-ocid={`${ocidPrefix}.hint`}
        >
          {hint}
        </p>
      ) : amountAtPercent !== null ? (
        <p
          className="text-xs tabular-nums text-muted-foreground"
          data-ocid={`${ocidPrefix}.summary`}
        >
          {t.percentSummary(
            String(percent),
            format(amountAtPercent),
            quoteText,
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

/** Mint page bar: pay token, 2 ledger fees (approve + transfer_from), TTTI-T quote. */
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
  const { symbol, decimals, fee } = PAY_TOKENS[token];
  return (
    <PercentBar
      symbol={symbol}
      decimals={decimals}
      ledgerFee={fee}
      feeCount={2}
      balance={balance}
      walletConnected={walletConnected}
      percent={percent}
      currentAmount={currentAmount}
      disabled={disabled}
      text={t}
      formatAmount={(amount) => formatPayAmount(amount, token)}
      quote={quote}
      formatQuote={(value) => formatTtti(value)}
      labelId="wallet-percent-label"
      onSelect={onSelect}
    />
  );
}
