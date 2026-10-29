import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { PoolSide, PoolStatus } from "../../backend";
import type { DexConfig, DexTokenInfo, PoolView } from "../../backend";
import {
  useAddLiquidity,
  useDexBalances,
  useQuoteAddLiquidity,
} from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { formatNumber } from "../../i18n/core/lang";
import { DEX_TEXT } from "../../i18n/pages/dex";
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
import { AddLiquidityQuotePanel } from "./AddLiquidityQuotePanel";
import { DexAmountField } from "./DexAmountField";
import { DexPausedHint, useDexPaused } from "./DexPausedNotice";
import { LockDurationPicker } from "./LockDurationPicker";
import { dexCallErrorText, formatDexUnits } from "./dexFormat";
import { DAY_NS, addLiquidityErrorText } from "./liquidityFormat";

type Feedback = { tone: "info" | "danger"; text: string };

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
  const dexPaused = useDexPaused();
  const balances = useDexBalances(owner);
  const add = useAddLiquidity();
  const [side, setSide] = useState<PoolSide>(PoolSide.token0);
  const [amountText, setAmountText] = useState("");
  const [counterText, setCounterText] = useState("");
  const [lockNs, setLockNs] = useState<bigint | null>(30n * DAY_NS);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const first = pool.totalShares === 0n;
  const sideToken = side === PoolSide.token0 ? pool.token0 : pool.token1;
  const counterToken = side === PoolSide.token0 ? pool.token1 : pool.token0;
  const amount = parseUnits(amountText, sideToken.decimals);
  const counter = first ? parseUnits(counterText, counterToken.decimals) : null;
  const ready =
    amount !== null && amount > 0n && (!first || (counter ?? 0n) > 0n);
  const quoteArgs = ready
    ? {
        poolId: pool.id,
        side,
        amount,
        ...(first && counter !== null ? { counterAmount: counter } : {}),
      }
    : null;
  const quote = useQuoteAddLiquidity(quoteArgs);
  const pending = add.isPending;

  const available = (ledger: string) =>
    balances.data?.find((b) => b.ledgerId.toText() === ledger)?.available ?? 0n;
  const errorText = (err: Parameters<typeof addLiquidityErrorText>[1]) =>
    addLiquidityErrorText(t, err, pool, counterToken, tokens);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!quoteArgs || lockNs === null || pending || dexPaused) return;
    setFeedback(null);
    add.mutate(
      { ...quoteArgs, lockDurationNs: lockNs },
      {
        onSuccess: (outcome) => {
          if (outcome.__kind__ === "ok") {
            setFeedback({
              tone: "info",
              text: t.addDone(
                formatNumber(outcome.ok.position.id),
                formatNumber(outcome.ok.shares),
              ),
            });
            setAmountText("");
            setCounterText("");
          } else {
            setFeedback({ tone: "danger", text: errorText(outcome.err) });
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
  const quoteOk = quote.data?.__kind__ === "ok" ? quote.data.ok : null;

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
          {first ? (
            <p className="callout-info px-3 py-2 text-xs text-foreground">
              {t.firstDepositNote}
            </p>
          ) : (
            <fieldset className="flex flex-col gap-2" disabled={pending}>
              <legend className="mb-2 text-sm font-medium">
                {t.sideLabel}
              </legend>
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
          )}

          <DexAmountField
            id="dex-add-amount"
            label={t.tokenAmountLabel(sideToken.symbol)}
            value={amountText}
            onChange={setAmountText}
            decimals={sideToken.decimals}
            hint={t.availableAmount(
              formatDexUnits(available(sideToken.ledgerId.toText()), sideToken),
            )}
            disabled={pending}
            ocid="pools.add.amount"
          />
          {first && (
            <DexAmountField
              id="dex-add-counter"
              label={t.tokenAmountLabel(counterToken.symbol)}
              value={counterText}
              onChange={setCounterText}
              decimals={counterToken.decimals}
              hint={t.availableAmount(
                formatDexUnits(
                  available(counterToken.ledgerId.toText()),
                  counterToken,
                ),
              )}
              disabled={pending}
              ocid="pools.add.counter"
            />
          )}

          {ready && (
            <AddLiquidityQuotePanel
              pool={pool}
              side={side}
              loading={quote.isFetching && !quote.data}
              quote={quoteOk}
              error={
                quote.data?.__kind__ === "err"
                  ? errorText(quote.data.err)
                  : quote.isError
                    ? t.errCall(quote.error.message)
                    : null
              }
              showOpens={pool.status === PoolStatus.filling}
            />
          )}

          <LockDurationPicker
            minNs={config.minLockNs}
            maxNs={config.maxLockNs}
            disabled={pending}
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
                disabled={!quoteOk || lockNs === null || pending || dexPaused}
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
