import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { DexTokenInfo, PoolView, SwapError } from "../../backend";
import { DexApprovalError, useDexBalances } from "../../hooks/useDex";
import { useQuoteRoutedSwap, useRoutedSwap } from "../../hooks/useRouter";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { ROUTER_TEXT } from "../../i18n/pages/dexRouter";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import { nowNs } from "../../lib/approvals";
import { parseUnits, unitsInputValue } from "../../lib/token";
import { MINT_QUOTE_DEBOUNCE_MS } from "../exchange/liquidityMint";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DexAmountField } from "./DexAmountField";
import { useDexUnitsText } from "./DexFiat";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { DexPercentBar } from "./DexPercentBar";
import { swapsBlockedByRemoval } from "./PoolRow";
import { SlippageField, defaultSlippageText } from "./SlippageField";
import { SwapQuoteDetails } from "./SwapQuoteDetails";
import { dexCallErrorText } from "./dexFormat";
import {
  SWAP_DEADLINE_NS,
  parsePercentBps,
  swapErrorText,
} from "./liquidityFormat";
import { routeErrorText, routeName } from "./routeFormat";

type Feedback = { tone: "info" | "danger"; text: string };

/** The refusal the pool's current swap state stands for, or null while open. */
function stateRefusal(pool: PoolView): SwapError | null {
  const reason = pool.swapState.reason;
  switch (reason.__kind__) {
    case "open":
      return null;
    case "belowThreshold":
      return {
        __kind__: "depthBelowThreshold",
        depthBelowThreshold: reason.belowThreshold,
      };
    case "rateUnavailable":
      return { __kind__: "rateUnavailable", rateUnavailable: null };
    case "removalAnnounced":
      return {
        __kind__: "removalInProgress",
        removalInProgress: { effectiveAt: reason.removalAnnounced.effectiveAt },
      };
    case "removalExecuting": {
      const removal = pool.removal;
      return {
        __kind__: "removalInProgress",
        removalInProgress: {
          effectiveAt:
            removal.__kind__ === "executing"
              ? removal.executing.effectiveAt
              : 0n,
        },
      };
    }
    case "removed":
      return { __kind__: "poolRemoved", poolRemoved: null };
  }
}

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
  const ts = useDict(SWAP_TEXT);
  const { lang } = useLanguage();
  const dexPaused = useDexPaused();
  const unitsText = useDexUnitsText();
  const balances = useDexBalances(owner);
  const swap = useRoutedSwap(owner);
  const [inIsToken0, setInIsToken0] = useState(true);
  const [amountText, setAmountText] = useState("");
  const [slippageText, setSlippageText] = useState(defaultSlippageText);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [reading, setReading] = useState(false);
  const [debounced, setDebounced] = useState<bigint | null>(null);
  const [debouncedSlippage, setDebouncedSlippage] = useState<bigint | null>(
    null,
  );

  // Swaps are refused while a removal is announced, executing or done. Below
  // the depth threshold or without a rate the native pool is closed; the
  // router can still go through ICPSwap.
  const blocked = swapsBlockedByRemoval(pool);
  const open = !blocked;
  const tokenIn = inIsToken0 ? info0 : info1;
  const tokenOut = inIsToken0 ? info1 : info0;
  const amountIn = parseUnits(amountText, tokenIn.decimals);
  const slippageBps = parsePercentBps(slippageText);
  useEffect(() => {
    const valid = open && amountIn !== null && amountIn > 0n;
    const value = valid && slippageBps !== null ? amountIn : null;
    const id = window.setTimeout(() => {
      setDebounced(value);
      setDebouncedSlippage(value !== null ? slippageBps : null);
    }, MINT_QUOTE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [open, amountIn, slippageBps]);
  const input =
    open && debounced !== null && debouncedSlippage !== null
      ? {
          tokenIn: tokenIn.token,
          tokenOut: tokenOut.token,
          amountIn: debounced,
          slippageBps: debouncedSlippage,
        }
      : null;
  const quote = useQuoteRoutedSwap(input);
  const quoteFresh =
    debounced !== null &&
    debounced === amountIn &&
    debouncedSlippage !== null &&
    debouncedSlippage === slippageBps;
  const quoteOk =
    quoteFresh && quote.data?.__kind__ === "ok" ? quote.data.ok : null;
  const pending = swap.isPending || reading;
  const available =
    balances.data?.find((b) => b.token === tokenIn.token)?.available ?? 0n;
  const errText = (err: Parameters<typeof routeErrorText>[2]) =>
    routeErrorText(t, r, err, tokenIn, tokenOut, lang);
  const refusal = stateRefusal(pool);
  const refusalText = refusal
    ? swapErrorText(t, refusal, tokenIn, tokenOut, lang)
    : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input || !quoteFresh || !quoteOk || pending || dexPaused) return;
    setFeedback(null);
    // The price is read again now, live, never from the quote already shown.
    setReading(true);
    const refreshed = await quote.refetch();
    setReading(false);
    const live =
      !refreshed.isError && refreshed.data?.__kind__ === "ok"
        ? refreshed.data.ok
        : null;
    if (!live) {
      setFeedback({ tone: "danger", text: ts.livePriceUnavailable });
      return;
    }
    swap.mutate(
      {
        tokenIn: input.tokenIn,
        tokenOut: input.tokenOut,
        amountIn: input.amountIn,
        minAmountOut: live.minimumReceived,
        deadline: nowNs() + SWAP_DEADLINE_NS,
        route: live.route,
      },
      {
        onSuccess: (outcome) => {
          if (outcome.__kind__ === "ok") {
            setFeedback({
              tone: "info",
              text: r.swapDoneRoute(
                unitsText(outcome.ok.amountIn, tokenIn),
                unitsText(outcome.ok.amountOut, tokenOut),
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
            text:
              err instanceof DexApprovalError
                ? err.message
                : dexCallErrorText(t, err.message),
          }),
      },
    );
  };

  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;

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
        {refusalText && (
          <p
            className={`${blocked ? "callout-danger" : "callout-info text-foreground"} px-3 py-2 text-sm`}
            data-ocid={
              blocked ? "pools.swap.removed_state" : "pools.swap.closed_state"
            }
          >
            {refusalText}
          </p>
        )}
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
                        setDebounced(null);
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
              hint={t.availableAmount(unitsText(available, tokenIn))}
              fiatToken={tokenIn}
              disabled={!open || pending}
              ocid="pools.swap.amount"
            />
            <DexPercentBar
              token={tokenIn}
              owner={owner}
              currentAmount={amountIn ?? 0n}
              disabled={!open || pending}
              onAmountChange={(amount) =>
                setAmountText(unitsInputValue(amount, tokenIn.decimals))
              }
              ocidPrefix="pools.swap.percent_bar"
            />
            <SlippageField
              value={slippageText}
              onChange={setSlippageText}
              disabled={!open || pending}
              ocidPrefix="pools.swap.slippage"
            />
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
                disabled={
                  !open || !quoteFresh || !quoteOk || pending || dexPaused
                }
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
