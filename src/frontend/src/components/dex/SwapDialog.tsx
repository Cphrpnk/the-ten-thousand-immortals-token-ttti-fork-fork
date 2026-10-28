import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { PoolStatus } from "../../backend";
import type { DexTokenInfo, PoolView } from "../../backend";
import { useDexBalances, useQuoteSwap, useSwap } from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { nowNs } from "../../lib/approvals";
import { parseUnits } from "../../lib/token";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DexAmountField } from "./DexAmountField";
import { SwapQuoteDetails } from "./SwapQuoteDetails";
import { formatDexUnits } from "./dexFormat";
import {
  DEFAULT_SLIPPAGE_BPS,
  SWAP_DEADLINE_NS,
  gaugeText,
  parsePercentBps,
  swapErrorText,
} from "./liquidityFormat";

type Feedback = { tone: "info" | "danger"; text: string };

/** Swap between the two tokens of an open pool, from internal DEX balances. */
export function SwapDialog({
  pool,
  info0,
  info1,
  owner,
  onClose,
}: {
  pool: PoolView;
  info0: DexTokenInfo;
  info1: DexTokenInfo;
  owner: Principal;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const balances = useDexBalances(owner);
  const swap = useSwap();
  const [inIsToken0, setInIsToken0] = useState(true);
  const [amountText, setAmountText] = useState("");
  const [slippageText, setSlippageText] = useState(
    formatNumber(Number(DEFAULT_SLIPPAGE_BPS) / 100, {
      maximumFractionDigits: 2,
    }),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const open = pool.status === PoolStatus.active && pool.acceptsSwaps;
  const tokenIn = inIsToken0 ? info0 : info1;
  const tokenOut = inIsToken0 ? info1 : info0;
  const amountIn = parseUnits(amountText, tokenIn.decimals);
  const slippageBps = parsePercentBps(slippageText);
  const input =
    open && amountIn !== null && amountIn > 0n && slippageBps !== null
      ? { poolId: pool.id, tokenIn: tokenIn.token, amountIn, slippageBps }
      : null;
  const quote = useQuoteSwap(input);
  const quoteOk = quote.data?.__kind__ === "ok" ? quote.data.ok : null;
  const pending = swap.isPending;
  const available =
    balances.data?.find((b) => b.token === tokenIn.token)?.available ?? 0n;
  const errText = (err: Parameters<typeof swapErrorText>[1]) =>
    swapErrorText(t, err, tokenIn, tokenOut, lang);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input || !quoteOk || pending) return;
    setFeedback(null);
    swap.mutate(
      {
        poolId: pool.id,
        tokenIn: input.tokenIn,
        amountIn: input.amountIn,
        minAmountOut: quoteOk.minimumReceived,
        deadline: nowNs() + SWAP_DEADLINE_NS,
      },
      {
        onSuccess: (outcome) => {
          if (outcome.__kind__ === "ok") {
            setFeedback({
              tone: "info",
              text: t.swapDone(
                formatDexUnits(outcome.ok.amountIn, tokenIn),
                formatDexUnits(outcome.ok.amountOut, tokenOut),
              ),
            });
            setAmountText("");
          } else {
            setFeedback({ tone: "danger", text: errText(outcome.err) });
          }
        },
        onError: (err) =>
          setFeedback({ tone: "danger", text: t.errCall(err.message) }),
      },
    );
  };

  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const slippageInvalid = slippageText.trim() !== "" && slippageBps === null;

  return (
    <Dialog open onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-md"
        data-ocid="pools.swap.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {t.swapTitle(pair)}
          </DialogTitle>
          <DialogDescription>{t.swapIntro}</DialogDescription>
        </DialogHeader>
        {pool.status === PoolStatus.removed ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pools.swap.removed_state"
          >
            {t.removedNotice}
          </p>
        ) : !open ? (
          <p
            className="callout-info px-3 py-2 text-sm text-foreground"
            data-ocid="pools.swap.filling_state"
          >
            {t.swapsClosedFilling(gaugeText(t, pool.gauge))}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <fieldset className="flex flex-col gap-4" disabled={!open || pending}>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t.swapFrom}</span>
              <div className="flex gap-2">
                {[true, false].map((isZero) => {
                  const info = isZero ? info0 : info1;
                  return (
                    <Button
                      key={info.symbol}
                      type="button"
                      size="sm"
                      variant={inIsToken0 === isZero ? "default" : "outline"}
                      aria-pressed={inIsToken0 === isZero}
                      onClick={() => {
                        setInIsToken0(isZero);
                        setAmountText("");
                      }}
                      data-ocid={`pools.swap.token_${isZero ? "0" : "1"}.toggle`}
                    >
                      {info.symbol}
                    </Button>
                  );
                })}
              </div>
            </div>
            <DexAmountField
              id="dex-swap-amount"
              label={t.tokenAmountLabel(tokenIn.symbol)}
              value={amountText}
              onChange={setAmountText}
              decimals={tokenIn.decimals}
              hint={t.availableAmount(formatDexUnits(available, tokenIn))}
              disabled={!open || pending}
              ocid="pools.swap.amount"
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="dex-swap-slippage">{t.slippageLabel}</Label>
              <Input
                id="dex-swap-slippage"
                value={slippageText}
                onChange={(e) => setSlippageText(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                className="w-28 font-mono tabular-nums"
                aria-invalid={slippageInvalid}
                data-ocid="pools.swap.slippage.input"
              />
              {slippageInvalid && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="pools.swap.slippage.field_error"
                >
                  {t.slippageInvalid}
                </p>
              )}
            </div>
          </fieldset>

          {input && (
            <SwapQuoteDetails
              loading={quote.isFetching && !quote.data}
              quote={quoteOk}
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              error={
                quote.data?.__kind__ === "err"
                  ? errText(quote.data.err)
                  : quote.isError
                    ? t.errCall(quote.error.message)
                    : null
              }
            />
          )}
          {open && (
            <p className="text-xs text-muted-foreground">
              {t.swapDeadlineNote}
            </p>
          )}

          <div aria-live="polite">
            {pending && (
              <p
                className="callout-info flex items-center gap-2 px-3 py-2 text-sm text-foreground"
                data-ocid="pools.swap.loading_state"
              >
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {t.swapping}
              </p>
            )}
            {!pending && feedback && (
              <p
                className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                data-ocid={
                  feedback.tone === "info"
                    ? "pools.swap.success_state"
                    : "pools.swap.error_state"
                }
              >
                {feedback.text}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
              className="min-h-11"
              data-ocid="pools.swap.cancel_button"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!open || !quoteOk || pending}
              className="min-h-11"
              data-ocid="pools.swap.confirm_button"
            >
              {pending ? t.swapping : t.confirmSwap}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
