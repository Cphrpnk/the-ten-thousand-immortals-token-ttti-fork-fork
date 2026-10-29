import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { PoolStatus } from "../../backend";
import type { DexTokenInfo, PoolView } from "../../backend";
import { useDexBalances } from "../../hooks/useDex";
import { useQuoteRoutedSwap, useRoutedSwap } from "../../hooks/useRouter";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
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
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { SwapQuoteDetails } from "./SwapQuoteDetails";
import { dexCallErrorText, formatDexUnits } from "./dexFormat";
import {
  DEFAULT_SLIPPAGE_BPS,
  SWAP_DEADLINE_NS,
  gaugeText,
  parsePercentBps,
} from "./liquidityFormat";
import { routeErrorText, routeName } from "./routeFormat";

type Feedback = { tone: "info" | "danger"; text: string };

/**
 * Routed swap between the two tokens of a pool, from internal DEX balances:
 * the native pool or ICPSwap, whichever the routed quote chose.
 */
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
  const r = useDict(ROUTER_TEXT);
  const { lang } = useLanguage();
  const dexPaused = useDexPaused();
  const balances = useDexBalances(owner);
  const swap = useRoutedSwap();
  const [inIsToken0, setInIsToken0] = useState(true);
  const [amountText, setAmountText] = useState("");
  const [slippageText, setSlippageText] = useState(
    formatNumber(Number(DEFAULT_SLIPPAGE_BPS) / 100, {
      maximumFractionDigits: 2,
    }),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // The native pool may be filling or empty: the router can still go through ICPSwap.
  const removed = pool.status === PoolStatus.removed;
  const nativeOpen = pool.status === PoolStatus.active && pool.acceptsSwaps;
  const open = !removed;
  const tokenIn = inIsToken0 ? info0 : info1;
  const tokenOut = inIsToken0 ? info1 : info0;
  const amountIn = parseUnits(amountText, tokenIn.decimals);
  const slippageBps = parsePercentBps(slippageText);
  const input =
    open && amountIn !== null && amountIn > 0n && slippageBps !== null
      ? {
          tokenIn: tokenIn.token,
          tokenOut: tokenOut.token,
          amountIn,
          slippageBps,
        }
      : null;
  const quote = useQuoteRoutedSwap(input);
  const quoteOk = quote.data?.__kind__ === "ok" ? quote.data.ok : null;
  const pending = swap.isPending;
  const available =
    balances.data?.find((b) => b.token === tokenIn.token)?.available ?? 0n;
  const errText = (err: Parameters<typeof routeErrorText>[2]) =>
    routeErrorText(t, r, err, tokenIn, tokenOut, lang);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input || !quoteOk || pending || dexPaused) return;
    setFeedback(null);
    swap.mutate(
      {
        tokenIn: input.tokenIn,
        tokenOut: input.tokenOut,
        amountIn: input.amountIn,
        minAmountOut: quoteOk.minimumReceived,
        deadline: nowNs() + SWAP_DEADLINE_NS,
        route: quoteOk.route,
      },
      {
        onSuccess: (outcome) => {
          if (outcome.__kind__ === "ok") {
            setFeedback({
              tone: "info",
              text: r.swapDoneRoute(
                formatDexUnits(outcome.ok.amountIn, tokenIn),
                formatDexUnits(outcome.ok.amountOut, tokenOut),
                routeName(r, outcome.ok.route),
              ),
            });
            setAmountText("");
          } else {
            setFeedback({ tone: "danger", text: errText(outcome.err) });
          }
        },
        onError: (err) =>
          setFeedback({
            tone: "danger",
            text: dexCallErrorText(t, err.message),
          }),
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
        {removed ? (
          <p
            className="callout-danger px-3 py-2 text-sm"
            data-ocid="pools.swap.removed_state"
          >
            {t.removedNotice}
          </p>
        ) : !nativeOpen ? (
          <p
            className="callout-info px-3 py-2 text-sm text-foreground"
            data-ocid="pools.swap.filling_state"
          >
            {r.fillingViaIcpswap(gaugeText(t, pool.gauge))}
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
              {r.routeRule} {t.swapDeadlineNote}
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
            <DexPausedHint paused={dexPaused}>
              <Button
                type="submit"
                disabled={!open || !quoteOk || pending || dexPaused}
                className="min-h-11"
                data-ocid="pools.swap.confirm_button"
              >
                {pending ? t.swapping : t.confirmSwap}
              </Button>
            </DexPausedHint>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
