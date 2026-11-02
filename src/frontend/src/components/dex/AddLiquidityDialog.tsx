import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { PoolSide, PoolStatus } from "../../backend";
import type {
  AddLiquidityArgs,
  AddLiquidityQuoteArgs,
  DexConfig,
  DexTokenInfo,
  PoolView,
} from "../../backend";
import {
  DexApprovalError,
  useAddLiquidity,
  useDexBalances,
  useQuoteAddLiquidity,
  useReferencePrice,
} from "../../hooks/useDex";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { parseUnits, unitsInputValue } from "../../lib/token";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AddLiquidityQuotePanel } from "./AddLiquidityQuotePanel";
import { DexAmountField } from "./DexAmountField";
import { DexFiat, useDexUnitsText } from "./DexFiat";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { DexPercentBar } from "./DexPercentBar";
import { ReferencePriceBlock } from "./IcpswapReference";
import { LockDurationPicker } from "./LockDurationPicker";
import { SlippageField, defaultSlippageText } from "./SlippageField";
import { dexCallErrorText, formatDexDate, formatDexUnits } from "./dexFormat";
import {
  addLiquidityErrorText,
  parsePercentBps,
  relayOutcomeText,
} from "./liquidityFormat";

type Feedback = { tone: "info" | "danger"; text: string; relay?: string };

/** Add liquidity from internal DEX balances to a filling or open pool. */
export function AddLiquidityDialog({
  pool,
  config,
  tokens,
  owner,
  onClose,
}: {
  pool: PoolView;
  config: DexConfig;
  tokens: ReadonlyArray<DexTokenInfo>;
  owner: Principal;
  onClose: () => void;
}) {
  const t = useDict(DEX_TEXT);
  const unitsText = useDexUnitsText();
  const { lang } = useLanguage();
  const dexPaused = useDexPaused();
  const balances = useDexBalances(owner);
  const add = useAddLiquidity(owner);
  const [side, setSide] = useState<PoolSide>(PoolSide.token0);
  const [amountText, setAmountText] = useState("");
  const [lockNs, setLockNs] = useState<bigint | null>(0n);
  const [slippageText, setSlippageText] = useState(defaultSlippageText);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const first = pool.totalShares === 0n;
  const sideToken = side === PoolSide.token0 ? pool.token0 : pool.token1;
  const counterToken = side === PoolSide.token0 ? pool.token1 : pool.token0;
  const amount = parseUnits(amountText, sideToken.decimals);
  const slippageBps = parsePercentBps(slippageText);
  const sideInfo = tokens.find(
    (tk) => tk.ledgerId.toText() === sideToken.ledgerId.toText(),
  );
  // First deposit: the other side is computed on the client from the reference
  // ratio (base units of token1 per base unit of token0) and sent as the
  // counter amount.
  const reference = useReferencePrice(first ? pool.id : undefined);
  const ratio = reference.data?.expected;
  const counter =
    first &&
    amount !== null &&
    amount > 0n &&
    ratio &&
    ratio.numerator > 0n &&
    ratio.denominator > 0n
      ? side === PoolSide.token0
        ? (amount * ratio.numerator) / ratio.denominator
        : (amount * ratio.denominator) / ratio.numerator
      : null;
  const referenceSettled = reference.isSuccess || reference.isError;
  const ready =
    amount !== null &&
    amount > 0n &&
    (!first || (counter ?? 0n) > 0n) &&
    slippageBps !== null &&
    pool.status !== PoolStatus.removed;
  const quoteArgs: AddLiquidityQuoteArgs | null = ready
    ? {
        poolId: pool.id,
        side,
        amount,
        slippageBps,
        ...(first && counter !== null ? { counterAmount: counter } : {}),
      }
    : null;
  const quote = useQuoteAddLiquidity(quoteArgs);
  const pending = add.isPending;
  const quoteOk = quote.data?.__kind__ === "ok" ? quote.data.ok : null;
  const removalNotice =
    pool.removal.__kind__ === "announced"
      ? t.errAddRemovalAnnounced(
          formatDexDate(pool.removal.announced.effectiveAt, lang),
        )
      : pool.removal.__kind__ === "executing"
        ? t.errAddRemovalAnnounced(
            formatDexDate(pool.removal.executing.effectiveAt, lang),
          )
        : pool.status === PoolStatus.removed
          ? t.errPoolRemoved
          : null;
  const blocked = removalNotice !== null;

  const available = (ledger: string) =>
    balances.data?.find((b) => b.ledgerId.toText() === ledger)?.available ?? 0n;
  const errorText = (err: Parameters<typeof addLiquidityErrorText>[1]) =>
    addLiquidityErrorText(t, err, pool, counterToken, tokens, lang);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quoteArgs || !quoteOk || lockNs === null) return;
    if (pending || dexPaused || blocked) return;
    setFeedback(null);
    // The quoted counter amount is the slippage reference: the add is refused
    // when the amount computed at execution moves beyond the tolerance.
    const args: AddLiquidityArgs = {
      ...quoteArgs,
      counterAmount: first ? (counter ?? 0n) : quoteOk.counterAmount,
      ...(lockNs > 0n ? { lockDurationNs: lockNs } : {}),
    };
    add.mutate(args, {
      onSuccess: (outcome) => {
        if (outcome.__kind__ === "ok") {
          const { surplus0, surplus1 } = outcome.ok;
          const surplus = [
            surplus0 > 0n ? unitsText(surplus0, pool.token0) : null,
            surplus1 > 0n ? unitsText(surplus1, pool.token1) : null,
          ].filter((part): part is string => part !== null);
          const id = formatNumber(outcome.ok.position.id);
          const shares = formatNumber(outcome.ok.shares);
          setFeedback({
            tone: "info",
            text:
              surplus.length > 0
                ? t.addDoneSurplus(id, shares, surplus.join(" · "))
                : t.addDone(id, shares),
            ...(lockNs > 0n
              ? { relay: relayOutcomeText(t, outcome.ok.relay) }
              : {}),
          });
          setAmountText("");
        } else {
          setFeedback({ tone: "danger", text: errorText(outcome.err) });
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
    });
  };

  const pair = `${pool.token0.symbol}/${pool.token1.symbol}`;

  return (
    <Dialog open onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        data-ocid="pools.add.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">{t.addTitle(pair)}</DialogTitle>
          <DialogDescription>{t.addIntro}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {removalNotice && (
            <p
              className="callout-danger px-3 py-2 text-sm break-words"
              data-ocid="pools.add.removal.error_state"
            >
              {removalNotice}
            </p>
          )}
          {first && (
            <div
              className="flex flex-col gap-3"
              data-ocid="pools.add.first_deposit.panel"
            >
              <div className="callout-info flex flex-col gap-1 px-3 py-2 text-xs text-foreground">
                <p className="text-sm font-medium">{t.emptyPoolTitle}</p>
                <p>{t.emptyPoolNote}</p>
              </div>
              <section
                className="flex flex-col gap-2"
                aria-labelledby="dex-add-reference-title"
                data-ocid="pools.add.reference_block.section"
              >
                <h3
                  id="dex-add-reference-title"
                  className="text-sm font-medium"
                >
                  {t.addReferenceBlockTitle}
                </h3>
                <ReferencePriceBlock pool={pool} />
              </section>
            </div>
          )}
          <fieldset className="flex flex-col gap-2" disabled={pending}>
            <legend className="mb-2 text-sm font-medium">{t.sideLabel}</legend>
            <div className="flex gap-2">
              {[PoolSide.token0, PoolSide.token1].map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={side === s ? "default" : "outline"}
                  aria-pressed={side === s}
                  onClick={() => {
                    setSide(s);
                    setAmountText("");
                  }}
                  data-ocid={`pools.add.side_${s}.toggle`}
                >
                  {s === PoolSide.token0
                    ? pool.token0.symbol
                    : pool.token1.symbol}
                </Button>
              ))}
            </div>
          </fieldset>

          <DexAmountField
            id="dex-add-amount"
            label={t.tokenAmountLabel(sideToken.symbol)}
            value={amountText}
            onChange={setAmountText}
            decimals={sideToken.decimals}
            hint={t.availableAmount(
              unitsText(available(sideToken.ledgerId.toText()), sideToken),
            )}
            fiatToken={sideToken}
            disabled={pending || blocked}
            ocid="pools.add.amount"
          />
          {sideInfo && (
            <DexPercentBar
              token={sideInfo}
              owner={owner}
              currentAmount={amount ?? 0n}
              disabled={pending || blocked}
              onAmountChange={(next) =>
                setAmountText(unitsInputValue(next, sideToken.decimals))
              }
              ocidPrefix="pools.add.percent_bar"
            />
          )}
          {first && amount !== null && amount > 0n && (
            <div
              className="flex flex-col gap-1 rounded-md border border-border px-3 py-2 text-sm tabular-nums"
              aria-live="polite"
              data-ocid="pools.add.expected_other.panel"
            >
              {counter !== null ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    {t.expectedOtherAmountLabel(counterToken.symbol)}
                  </span>
                  <span
                    className="font-medium"
                    data-ocid="pools.add.expected_other.value"
                  >
                    {formatDexUnits(counter, counterToken)}{" "}
                    <DexFiat token={counterToken} amount={counter} />
                  </span>
                </>
              ) : (
                referenceSettled && (
                  <span
                    className="text-muted-foreground"
                    data-ocid="pools.add.expected_other.error_state"
                  >
                    {t.expectedOtherAmountUnavailable}
                  </span>
                )
              )}
            </div>
          )}

          <SlippageField
            value={slippageText}
            onChange={setSlippageText}
            disabled={pending || blocked}
            ocidPrefix="pools.add.slippage"
          />

          {ready && (
            <AddLiquidityQuotePanel
              pool={pool}
              loading={quote.isFetching && !quote.data}
              quote={quoteOk}
              error={
                quote.data?.__kind__ === "err"
                  ? errorText(quote.data.err)
                  : quote.isError
                    ? t.errCall(quote.error.message)
                    : null
              }
            />
          )}

          <LockDurationPicker
            minNs={config.minLockNs}
            maxNs={config.maxLockNs}
            disabled={pending || blocked}
            onChange={setLockNs}
          />

          <div aria-live="polite">
            {pending && (
              <p
                className="callout-info flex items-center gap-2 px-3 py-2 text-sm text-foreground"
                data-ocid="pools.add.loading_state"
              >
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {t.adding}
              </p>
            )}
            {!pending && feedback && (
              <p
                className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
                data-ocid={
                  feedback.tone === "info"
                    ? "pools.add.success_state"
                    : "pools.add.error_state"
                }
              >
                {feedback.text}
                {feedback.relay && (
                  <span
                    className="mt-1 block text-xs text-muted-foreground"
                    data-ocid="pools.add.relay_result"
                  >
                    {feedback.relay}
                  </span>
                )}
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
              data-ocid="pools.add.cancel_button"
            >
              {t.cancel}
            </Button>
            <DexPausedHint paused={dexPaused}>
              <Button
                type="submit"
                disabled={
                  !quoteOk || lockNs === null || pending || dexPaused || blocked
                }
                className="min-h-11"
                data-ocid="pools.add.confirm_button"
              >
                {pending ? t.adding : t.confirmAdd}
              </Button>
            </DexPausedHint>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
