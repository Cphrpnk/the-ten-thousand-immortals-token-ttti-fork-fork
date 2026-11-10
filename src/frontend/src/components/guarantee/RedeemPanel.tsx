import type { Principal } from "@icp-sdk/core/principal";
import { useState } from "react";
import { useGuaranteeQuote, useReserveView } from "../../hooks/useGuarantee";
import { useDict, useLanguage } from "../../i18n/core";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import {
  formatTttiQuantity,
  parseTttiAmount,
  redeemableAmount,
} from "../../lib/guarantee";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  amountForPercentWithFees,
  unitsInputValue,
} from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { PercentBar, type PercentBarText } from "../exchange/WalletPercentBar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RedeemConfirmDialog } from "./RedeemConfirmDialog";
import { RedeemPreview } from "./RedeemPreview";
import { useTttiAllowance, useTttiHolding } from "./useGuaranteeRedeem";

interface RedeemPanelProps {
  owner: Principal | undefined;
}

/** Redeem control open to any holder: amount, percentage bar, live preview, confirm. */
export function RedeemPanel({ owner }: RedeemPanelProps) {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const holding = useTttiHolding(owner);
  const allowance = useTttiAllowance(owner);
  const [text, setText] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const reserve = useReserveView();

  const ocid = "guarantee.redeem";
  const inputId = "guarantee-amount";
  const usable = holding.usable;
  const circulation = reserve.data?.circulationOutside;
  const redeemable = redeemableAmount(usable, circulation);
  const limitedByBalance =
    usable !== undefined && circulation !== undefined && usable < circulation;
  const limitedByCirculation =
    usable !== undefined && circulation !== undefined && circulation < usable;

  const parsed = parseTttiAmount(text);
  const withinLimits =
    parsed !== null &&
    (circulation === undefined || parsed <= circulation) &&
    (usable === undefined || parsed <= usable);
  const quoteAmount = withinLimits ? parsed : null;
  const quote = useGuaranteeQuote(quoteAmount);

  let inputError: string | null = null;
  if (text.trim() !== "" && parsed === null) {
    inputError = t.errInvalidAmount;
  } else if (
    parsed !== null &&
    circulation !== undefined &&
    parsed > circulation
  ) {
    inputError = t.errAmountExceedsCirculation(
      formatTttiQuantity(parsed, lang),
      formatTttiQuantity(circulation, lang),
    );
  } else if (parsed !== null && usable !== undefined && parsed > usable) {
    inputError = t.errTttiBalance(
      formatTttiQuantity(usable, lang),
      formatTttiQuantity(parsed, lang),
    );
  }

  const pick = (next: number) => {
    if (redeemable === undefined) return;
    const amount = amountForPercentWithFees(redeemable, 0n, 0, next);
    setPercent(next);
    setText(amount > 0n ? unitsInputValue(amount, TTTI_DECIMALS) : "");
  };

  const barText: PercentBarText = {
    percentConnect: t.signInPrompt,
    percentLoading: t.previewLoading,
    percentBalanceUnavailable: t.loadError,
    percentNotCover: () => t.balanceNone,
    percentShare: () => t.percentShare,
    percentSummary: (p, amount) => `${p}% = ${amount}`,
    percentComputedOn: () => t.percentComputedOn,
  };

  const canConfirm = quote.isSuccess && withinLimits;

  return (
    <div className="flex flex-col gap-5" data-ocid={ocid}>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{t.redeemTitle}</h3>
        <p className="text-sm text-muted-foreground">{t.redeemIntro}</p>
        <p
          className="text-sm text-muted-foreground"
          data-ocid={`${ocid}.held_note`}
        >
          {t.redeemHeldNote}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-muted-foreground">{t.heldLabel}</dt>
          <dd className="font-mono tabular-nums" data-ocid={`${ocid}.held`}>
            {holding.held === undefined
              ? "–"
              : formatTttiQuantity(holding.held, lang)}
            <FiatAmount
              token="ttti"
              amount={holding.held}
              className="ml-1.5"
              ocid={`${ocid}.held_fiat`}
            />
          </dd>
        </div>
      </dl>

      {limitedByCirculation &&
        circulation !== undefined &&
        redeemable !== undefined && (
          <p
            className="callout-info px-3 py-2 text-sm"
            data-ocid={`${ocid}.circulation_notice`}
          >
            {t.limitedByCirculation(
              formatTttiQuantity(circulation, lang),
              formatTttiQuantity(redeemable, lang),
            )}
          </p>
        )}
      {limitedByBalance && usable !== undefined && redeemable !== undefined && (
        <p
          className="callout-info px-3 py-2 text-sm"
          data-ocid={`${ocid}.balance_notice`}
        >
          {t.limitedByBalance(
            formatTttiQuantity(usable, lang),
            formatTttiQuantity(redeemable, lang),
          )}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>
          {t.amountLabel} ({TTTI_SYMBOL})
        </Label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={t.amountPlaceholder}
            value={text}
            aria-invalid={inputError !== null}
            aria-describedby={inputError ? `${inputId}-error` : undefined}
            onChange={(event) => {
              setText(event.target.value);
              setPercent(null);
            }}
            className="min-h-11 font-mono tabular-nums sm:min-h-9"
            data-ocid={`${ocid}.input`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => pick(100)}
            disabled={redeemable === undefined || redeemable === 0n}
            className="min-h-11 shrink-0 sm:min-h-9"
            data-ocid={`${ocid}.max_button`}
          >
            {t.maxButton}
          </Button>
        </div>
        {inputError && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-destructive"
            role="alert"
            data-ocid={`${ocid}.error_state`}
          >
            {inputError}
          </p>
        )}
      </div>

      <PercentBar
        symbol={TTTI_SYMBOL}
        decimals={TTTI_DECIMALS}
        ledgerFee={0n}
        feeCount={0}
        balance={redeemable}
        balanceLoading={holding.isLoading}
        walletConnected={!!owner}
        percent={percent}
        currentAmount={parsed ?? 0n}
        disabled={false}
        text={barText}
        formatAmount={(amount) => formatTttiQuantity(amount, lang)}
        ocidPrefix={`${ocid}.percent_bar`}
        onSelect={pick}
      />

      <RedeemPreview
        query={quote}
        hasAmount={quoteAmount !== null}
        ocid={`${ocid}.preview`}
      />

      <Button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={!canConfirm}
        className="min-h-11 self-start sm:min-h-9"
        data-ocid={`${ocid}.submit_button`}
      >
        {t.redeemButton}
      </Button>

      {confirming && quote.data && (
        <RedeemConfirmDialog
          owner={owner}
          quote={quote.data}
          allowance={allowance.data}
          onClose={(done) => {
            setConfirming(false);
            if (done) {
              setText("");
              setPercent(null);
            }
          }}
        />
      )}
    </div>
  );
}
