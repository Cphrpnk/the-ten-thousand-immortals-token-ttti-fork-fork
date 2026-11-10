import type { Principal } from "@icp-sdk/core/principal";
import { useState } from "react";
import { PayToken, RemainderChoice } from "../../backend";
import type { AuctionView } from "../../backend";
import {
  useAuctionDepositQuote,
  usePlaceAuctionBid,
} from "../../hooks/useAuction";
import { useDict, useLanguage } from "../../i18n/core";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { BUY_LIQUIDITY_TEXT } from "../../i18n/pages/buy";
import {
  PAY_TOKENS,
  TTTI_DECIMALS,
  formatPayAmount,
  parseUnits,
  unitsInputValue,
} from "../../lib/token";
import { cn } from "../../lib/utils";
import { FiatAmount } from "../FiatAmount";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DepositSplit } from "./DepositSplit";
import { TokenChoice } from "./TokenChoice";
import {
  bidErrorText,
  failureText,
  formatTttiE8,
  formatUsdPerTtti,
} from "./auctionFormat";

function parsePositive(text: string, decimals: number): bigint | null {
  return text.trim() === "" ? null : parseUnits(text, decimals);
}

/** Offer form: token, quantity, price B and optional larger deposit. */
export function BidForm({
  view,
  owner,
  closed,
  choice,
  onChoiceChange,
}: {
  view: AuctionView;
  owner: Principal;
  closed: boolean;
  /** Remainder choice: A pool, B keep the TTTI-T in the wallet. */
  choice: RemainderChoice;
  onChoiceChange: (choice: RemainderChoice) => void;
}) {
  const t = useDict(AUCTION_TEXT);
  const tl = useDict(BUY_LIQUIDITY_TEXT);
  const { lang } = useLanguage();
  const bid = usePlaceAuctionBid(owner);
  const [token, setToken] = useState<PayToken>(PayToken.icp);
  const [quantityText, setQuantityText] = useState("");
  const [priceText, setPriceText] = useState("");
  const [depositText, setDepositText] = useState("");

  const { decimals, symbol } = PAY_TOKENS[token];
  const busy = bid.phase !== "idle";
  const minimum = view.minQuantityE8s;
  const blockSale = view.blockSale;
  // A block sale takes the entire lot: the quantity is fixed by the contract.
  const quantity = blockSale
    ? view.lotSizeE8s
    : parsePositive(quantityText, TTTI_DECIMALS);
  const price = parsePositive(priceText, decimals);
  const validQuantity = blockSale
    ? view.lotSizeE8s > 0n
      ? view.lotSizeE8s
      : null
    : quantity !== null && quantity >= minimum
      ? quantity
      : null;
  const validPrice = price !== null && price > 0n ? price : null;

  const quoteResult = useAuctionDepositQuote(
    token,
    validPrice,
    validQuantity,
    choice,
  );
  const depositQuote = quoteResult.data?.quote ?? null;
  const quoteError = quoteResult.data?.error ?? null;
  const required = depositQuote?.required ?? null;
  const depositEmpty = depositText.trim() === "";
  const deposit = depositEmpty
    ? required
    : parsePositive(depositText, decimals);

  const quantityError =
    blockSale || quantityText.trim() === ""
      ? null
      : quantity === null
        ? t.errQuantity
        : quantity < minimum
          ? t.errQuantityMin(formatTttiE8(minimum, lang))
          : null;
  const priceError =
    priceText.trim() !== "" && validPrice === null
      ? t.errPrice(decimals.toString())
      : null;
  const depositError = depositEmpty
    ? null
    : deposit === null
      ? t.errDeposit(decimals.toString())
      : required !== null && deposit < required
        ? t.errDepositBelow(formatPayAmount(required, token, lang))
        : null;

  const canSubmit =
    validQuantity !== null &&
    validPrice !== null &&
    required !== null &&
    deposit !== null &&
    deposit >= required &&
    !closed &&
    !busy &&
    bid.ready;

  const chooseToken = (next: PayToken) => {
    setToken(next);
    setPriceText("");
    setDepositText("");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const ok = await bid.submit({
      token,
      quantityE8s: validQuantity,
      priceB: validPrice,
      deposit,
      choice,
    });
    if (ok) {
      setQuantityText("");
      setPriceText("");
      setDepositText("");
    }
  };

  const submitLabel =
    bid.phase === "approving"
      ? t.approvingButton
      : bid.phase === "sending"
        ? t.sendingButton
        : t.submitButton;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6"
      data-ocid="auction.bid_form"
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-lg uppercase tracking-[0.2em]">
          {t.formTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{t.formIntro}</p>
        {blockSale && (
          <p
            className="callout-info px-3 py-2 text-sm"
            data-ocid="auction.block_sale_note"
          >
            {t.blockSaleRule}
          </p>
        )}
      </div>

      <TokenChoice value={token} onChange={chooseToken} disabled={busy} />

      <fieldset
        className="flex flex-col gap-2"
        disabled={busy}
        data-ocid="auction.remainder_choice"
      >
        <legend className="text-sm font-medium">{tl.choiceLegend}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              [
                RemainderChoice.pool,
                "pool",
                tl.choicePoolTitle,
                tl.choicePoolText,
              ],
              [
                RemainderChoice.wallet,
                "wallet",
                tl.choiceWalletTitle,
                tl.choiceWalletText,
              ],
            ] as const
          ).map(([value, key, title, text]) => (
            <label
              key={key}
              htmlFor={`auction-choice-${key}`}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col gap-1 rounded-md border px-3 py-2 text-sm transition-smooth focus-within:ring-2 focus-within:ring-ring",
                choice === value
                  ? "border-gold bg-primary/10"
                  : "border-border hover:border-gold",
                busy && "cursor-not-allowed opacity-60",
              )}
              data-ocid={`auction.remainder_choice.${key}`}
            >
              <span className="flex items-start gap-2">
                <input
                  id={`auction-choice-${key}`}
                  type="radio"
                  name="auction-remainder-choice"
                  checked={choice === value}
                  onChange={() => onChoiceChange(value)}
                  disabled={busy}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary focus-visible:outline-none"
                  data-ocid={`auction.remainder_choice_radio.${key}`}
                />
                <span className="min-w-0 font-medium">{title}</span>
              </span>
              <span className="text-xs text-muted-foreground">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="auction-quantity">
            {blockSale ? t.blockQuantityLabel : t.quantityLabel}
          </Label>
          <Input
            id="auction-quantity"
            value={
              blockSale
                ? unitsInputValue(view.lotSizeE8s, TTTI_DECIMALS)
                : quantityText
            }
            readOnly={blockSale}
            onChange={(e) => setQuantityText(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            disabled={busy}
            aria-invalid={quantityError !== null}
            aria-describedby="auction-quantity-note"
            className="font-mono tabular-nums"
            data-ocid="auction.quantity.input"
          />
          <p
            id="auction-quantity-note"
            className={
              quantityError
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
            data-ocid={
              quantityError ? "auction.quantity.field_error" : undefined
            }
          >
            {blockSale
              ? t.blockQuantityHint(formatTttiE8(view.lotSizeE8s, lang))
              : (quantityError ?? t.quantityHint(formatTttiE8(minimum, lang)))}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="auction-price">{t.priceLabel(symbol)}</Label>
          <Input
            id="auction-price"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            disabled={busy}
            aria-invalid={priceError !== null}
            aria-describedby="auction-price-note"
            className="font-mono tabular-nums"
            data-ocid="auction.price.input"
          />
          <p
            id="auction-price-note"
            className={
              priceError
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
            data-ocid={priceError ? "auction.price.field_error" : undefined}
          >
            {priceError ?? (blockSale ? t.blockPriceHint : t.priceHint)}
          </p>
          <p
            className="text-xs text-muted-foreground"
            data-ocid="auction.price.minimum"
          >
            {t.priceMinimumHint(formatUsdPerTtti(view.reserveFloorUsdE8, lang))}
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-1 rounded-md border border-border bg-background/60 p-4 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">{t.requiredDepositLabel}</dt>
          <dd
            className="font-mono tabular-nums"
            data-ocid="auction.required_deposit"
          >
            {required === null
              ? t.requiredDepositPending
              : formatPayAmount(required, token, lang)}
            <FiatAmount
              token={token}
              amount={required}
              className="ml-1.5"
              ocid="auction.required_deposit_fiat"
            />
          </dd>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.requiredDepositFormula}
        </p>
      </dl>

      {quoteError && (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="auction.quote_error_state"
        >
          {bidErrorText(t, quoteError, token, lang)}
        </p>
      )}
      {depositQuote && validQuantity !== null && (
        <DepositSplit quote={depositQuote} quantityE8s={validQuantity} />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="auction-deposit">{t.depositLabel(symbol)}</Label>
        <Input
          id="auction-deposit"
          value={depositText}
          onChange={(e) => setDepositText(e.target.value)}
          placeholder={
            required === null ? "" : unitsInputValue(required, decimals)
          }
          inputMode="decimal"
          autoComplete="off"
          disabled={busy}
          aria-invalid={depositError !== null}
          aria-describedby="auction-deposit-note"
          className="font-mono tabular-nums"
          data-ocid="auction.deposit.input"
        />
        <p
          id="auction-deposit-note"
          className={
            depositError
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
          data-ocid={depositError ? "auction.deposit.field_error" : undefined}
        >
          {depositError ?? t.depositHint}
        </p>
        {deposit !== null && required !== null && deposit > required && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t.depositSentLabel}: {formatPayAmount(deposit, token, lang)}
            <FiatAmount
              token={token}
              amount={deposit}
              className="ml-1.5"
              ocid="auction.deposit_sent_fiat"
            />
          </p>
        )}
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        {bid.failure && (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="auction.bid_error_state"
          >
            {failureText(t, bid.failure, token, lang)}
          </p>
        )}
        {bid.placed && (
          <p
            className="callout-info px-3 py-2 text-sm"
            data-ocid="auction.bid_success_state"
          >
            {t.successMessage}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11 self-start"
        data-ocid="auction.submit_button"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
