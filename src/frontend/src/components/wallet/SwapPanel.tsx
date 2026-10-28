import { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, ArrowUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Account } from "../../backend";
import { SIGNER_NAMES, useAccountSigner } from "../../hooks/useAccountSigner";
import {
  useAddedSwapTokens,
  useSwapPool,
  useSwapQuote,
  useSwapUnusedBalance,
  useTttiLedgerId,
} from "../../hooks/useIcpSwap";
import { walletFailureMessage } from "../../hooks/useSignerWallet";
import { useWalletBalance } from "../../hooks/useWallet";
import { pickDict, useDict, useLanguage } from "../../i18n/core";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import {
  SEND_PERCENT_TEXT,
  WALLET_EXPLORER_TEXT,
  WALLET_TEXT,
} from "../../i18n/pages/wallet";
import { WALLET_SIGNING_TEXT } from "../../i18n/pages/walletSigning";
import { buildApproveArgs } from "../../lib/icpLedger";
import {
  QUOTE_TTL_MS,
  SwapPoolCallError,
  type SwapPoolInfo,
  isSlippageError,
  minimumOut,
  preparePlugForSwap,
  signedSwapPool,
  unwrapNat,
  zeroForOne,
} from "../../lib/icpswap";
import {
  addSwapToken,
  readLiveFee,
  removeSwapToken,
} from "../../lib/swapTokens";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  TOKEN_NAME,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  amountForPercentWithFees,
  formatDecimal,
  parseUnits,
  percentForAmountWithFees,
  spendableWithFees,
  unitsInputValue,
} from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { ExplorerLink } from "../ExplorerLink";
import { PercentBar } from "../exchange/WalletPercentBar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AddSwapToken } from "./AddSwapToken";
import {
  AddTokenTrigger,
  ConfirmStep,
  QuoteDetails,
  SwapNotice,
  UnusedBalance,
  formatSwapAmount,
  netOfFee,
} from "./SwapParts";
import { TokenLogo } from "./TokenLogo";
import { dashboardAccountUrl } from "./accountExplorer";
import { payTokenForLedger } from "./valuation";

/** Ledger fees kept out of the balance: the approve and the deposit transfer. */
const SWAP_FEE_COUNT = 2;
const SLIPPAGE_PRESETS = ["0.1", "0.5", "1"] as const;
const DEFAULT_SLIPPAGE = "0.5";
const ICP_ID = PAY_TOKENS.icp.ledgerCanisterId;
const CKBTC_ID = PAY_TOKENS.ckbtc.ledgerCanisterId;

type Step = "approve" | "deposit" | "swap" | "withdraw";

interface Plan {
  from: TokenDescriptor;
  to: TokenDescriptor;
  pool: SwapPoolInfo;
  amountIn: bigint;
  minOut: bigint;
}

interface SwapPanelProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  /** Ledger IDs preselected as source and destination. */
  initialFrom?: string;
  initialTo?: string;
}

/** Approval refused or failed in the wallet (message already localized). */
class ApproveFailure extends Error {}

const PAY_LEDGER_IDS = new Set<string>(
  PAY_TOKEN_ORDER.map((token) => PAY_TOKENS[token].ledgerCanisterId),
);

/**
 * Swap selector tokens: ICP, TTTI-T (backend canister ledger), ckBTC,
 * ckUSDC, ckUSDT, then the tokens added in this browser.
 */
function swapTokens(
  tokens: Array<TokenDescriptor>,
  tttiId: string | undefined,
  added: Array<TokenDescriptor>,
): Array<TokenDescriptor> {
  const pay = PAY_TOKEN_ORDER.map((token) => {
    const d = PAY_TOKENS[token];
    const found = tokens.find(
      (tk) => tk.canisterId.toText() === d.ledgerCanisterId,
    );
    return (
      found ?? {
        canisterId: Principal.fromText(d.ledgerCanisterId),
        name: d.name,
        symbol: d.symbol,
        decimals: d.decimals,
        fee: d.fee,
      }
    );
  });
  const base = [...pay];
  if (tttiId) {
    const ttti = tokens.find((tk) => tk.canisterId.toText() === tttiId) ?? {
      canisterId: Principal.fromText(tttiId),
      name: TOKEN_NAME,
      symbol: TTTI_SYMBOL,
      decimals: TTTI_DECIMALS,
      fee: 0n,
    };
    base.splice(1, 0, ttti);
  }
  const known = new Set(base.map((tk) => tk.canisterId.toText()));
  return [...base, ...added.filter((tk) => !known.has(tk.canisterId.toText()))];
}

/** Token with its live ledger fee (TTTI-T and added tokens). */
async function withLiveFee(token: TokenDescriptor): Promise<TokenDescriptor> {
  if (PAY_LEDGER_IDS.has(token.canisterId.toText())) return token;
  return { ...token, fee: await readLiveFee(token.canisterId) };
}

function isDefaultSubaccount(sub: Uint8Array | undefined): boolean {
  return !sub || sub.every((b) => b === 0);
}

/** Swap between the selector tokens through an ICPSwap pool. */
export function SwapPanel({
  tokens: rawTokens,
  account,
  initialFrom,
  initialTo,
}: SwapPanelProps) {
  const t = useDict(SWAP_TEXT);
  const tw = useDict(WALLET_TEXT);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const percentText = useDict(SEND_PERCENT_TEXT);
  const ts = useDict(WALLET_SIGNING_TEXT);
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const { data: tttiId } = useTttiLedgerId();
  const added = useAddedSwapTokens();
  const tokens = swapTokens(rawTokens, tttiId, added);
  const [showAdd, setShowAdd] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [fromId, setFromId] = useState(initialFrom ?? ICP_ID);
  const [toId, setToId] = useState(
    initialTo ?? (initialFrom === CKBTC_ID ? ICP_ID : CKBTC_ID),
  );
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [debounced, setDebounced] = useState<bigint | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [received, setReceived] = useState<{
    amount: bigint;
    token: TokenDescriptor;
  } | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);

  const owner =
    account && isDefaultSubaccount(account.subaccount) ? account.owner : null;
  const signer = useAccountSigner(owner);
  const from = tokens.find((tk) => tk.canisterId.toText() === fromId);
  const to = tokens.find((tk) => tk.canisterId.toText() === toId);
  const same = fromId === toId;

  const { data: balance, isError: balanceError } = useWalletBalance(
    from?.canisterId,
    account,
  );
  const poolQuery = useSwapPool(fromId, toId);
  const pool = poolQuery.data;
  const unusedQuery = useSwapUnusedBalance(pool, owner);

  const amountIn = from ? parseUnits(amount, from.decimals) : null;
  const max =
    from && balance !== undefined
      ? spendableWithFees(balance, from.fee, SWAP_FEE_COUNT)
      : null;
  const overMax = amountIn !== null && max !== null && amountIn > max;

  useEffect(() => {
    const value =
      amountIn !== null && amountIn > 0n && !overMax ? amountIn : null;
    const id = window.setTimeout(() => setDebounced(value), 400);
    return () => window.clearTimeout(id);
  }, [amountIn, overMax]);

  const quoteQuery = useSwapQuote(pool, fromId, debounced);
  const quoteFresh = debounced !== null && debounced === amountIn;
  const quote = quoteFresh ? quoteQuery.data : undefined;
  const expired =
    quote !== undefined && now - quoteQuery.dataUpdatedAt > QUOTE_TTL_MS;

  useEffect(() => {
    if (quote === undefined) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [quote]);

  const slippageBps = parseUnits(slippage, 2);
  const slippageValid =
    slippageBps !== null && slippageBps >= 1n && slippageBps <= 5000n;
  const minOut =
    quote !== undefined && slippageValid
      ? minimumOut(quote, slippageBps)
      : null;
  const tooSmall = to && minOut !== null && minOut <= to.fee;
  const running = step !== null;

  const resetResult = () => {
    setError(null);
    setReceived(null);
    setWithdrawMessage(null);
  };

  const pickFrom = (value: string) => {
    setFromId(value);
    setPercent(null);
    setAmount("");
    resetResult();
  };
  const pickTo = (value: string) => {
    setToId(value);
    resetResult();
  };
  const flip = () => {
    setFromId(toId);
    setToId(fromId);
    setAmount("");
    setPercent(null);
    resetResult();
  };

  /** Remove an added token; a side that used it goes back to the default. */
  const removeAdded = (canisterId: string) => {
    removeSwapToken(canisterId);
    if (fromId === canisterId) pickFrom(toId === ICP_ID ? CKBTC_ID : ICP_ID);
    if (toId === canisterId) pickTo(fromId === CKBTC_ID ? ICP_ID : CKBTC_ID);
  };

  const handleAmount = (value: string) => {
    setAmount(value);
    resetResult();
    const parsed = from ? parseUnits(value, from.decimals) : null;
    setPercent(
      from && parsed !== null && balance !== undefined
        ? percentForAmountWithFees(parsed, balance, from.fee, SWAP_FEE_COUNT)
        : null,
    );
  };

  const handlePercent = (value: number) => {
    if (!from || balance === undefined) return;
    setPercent(value);
    resetResult();
    setAmount(
      unitsInputValue(
        amountForPercentWithFees(balance, from.fee, SWAP_FEE_COUNT, value),
        from.decimals,
      ),
    );
  };

  const invalidate = (poolId: string) => {
    void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
    void queryClient.invalidateQueries({ queryKey: ["icpswapUnused", poolId] });
  };

  const canReview =
    !!owner &&
    !!signer.kind &&
    !!from &&
    !!to &&
    !same &&
    !!pool &&
    amountIn !== null &&
    amountIn > 0n &&
    !overMax &&
    quote !== undefined &&
    !expired &&
    minOut !== null &&
    !tooSmall &&
    !running &&
    !reviewing;

  const review = () => {
    if (!canReview || !from || !to || !pool || amountIn === null) return;
    if (minOut === null) return;
    const planMinOut = minOut;
    setChecked(false);
    resetResult();
    setReviewing(true);
    // TTTI-T and added tokens: the chain uses each ledger's current fee.
    void Promise.all([withLiveFee(from), withLiveFee(to)])
      .then(([liveFrom, liveTo]) => {
        if (planMinOut <= liveTo.fee) {
          setError(pickDict(SWAP_TEXT).tooSmall);
          return;
        }
        setPlan({
          from: liveFrom,
          to: liveTo,
          pool,
          amountIn,
          minOut: planMinOut,
        });
      })
      .catch(() => setError(pickDict(SWAP_TEXT).feeError))
      .finally(() => setReviewing(false));
  };

  const describeFailure = (failure: unknown): string => {
    const text = pickDict(SWAP_TEXT);
    if (failure instanceof ApproveFailure) return failure.message;
    if (failure instanceof SwapPoolCallError) {
      if (failure.step === "swap" && isSlippageError(failure.detail)) {
        return text.slippageError;
      }
      return text.failed(failure.detail);
    }
    const walletMessage =
      signer.kind && signer.kind !== "ii"
        ? walletFailureMessage(failure)
        : null;
    if (walletMessage) return walletMessage;
    return failure instanceof Error
      ? text.failed(failure.message)
      : text.refused;
  };

  const confirm = () => {
    if (!plan || !checked || !owner) return;
    const current = plan;
    const plugSigner = signer.kind === "plug";
    // Opens the OISY / NFID window from this click, before any await.
    const release = signer.begin();
    setStep("approve");
    setError(null);
    const run = async () => {
      const fromLedger = current.from.canisterId.toText();
      const toLedger = current.to.canisterId.toText();
      if (plugSigner) {
        await preparePlugForSwap(current.pool.poolId, [fromLedger, toLedger]);
      }
      const outcome = await signer.approve(
        current.from,
        buildApproveArgs(
          Principal.fromText(current.pool.poolId),
          current.amountIn,
          current.from.fee,
        ),
      );
      if (!outcome.ok) throw new ApproveFailure(outcome.message);
      const actor = await signedSwapPool(
        current.pool.poolId,
        plugSigner,
        signer.ledgerAgent,
        [fromLedger, toLedger],
      );
      setStep("deposit");
      unwrapNat(
        await actor.depositFrom({
          token: fromLedger,
          amount: current.amountIn,
          fee: current.from.fee,
        }),
        "deposit",
      );
      setStep("swap");
      const out = unwrapNat(
        await actor.swap({
          amountIn: current.amountIn.toString(),
          zeroForOne: zeroForOne(current.pool, fromLedger),
          amountOutMinimum: current.minOut.toString(),
        }),
        "swap",
      );
      setStep("withdraw");
      unwrapNat(
        await actor.withdraw({
          token: current.to.canisterId.toText(),
          amount: out,
          fee: current.to.fee,
        }),
        "withdraw",
      );
      signer.remember();
      return out;
    };
    void run()
      .then((out) => {
        const net = netOfFee(out, current.to.fee);
        setReceived({ amount: net, token: current.to });
        setPlan(null);
        setAmount("");
        setPercent(null);
        toast.success(
          pickDict(SWAP_TEXT).success(
            formatSwapAmount(net, current.to.decimals),
            current.to.symbol,
          ),
        );
      })
      .catch((failure: unknown) => {
        const message = describeFailure(failure);
        setError(message);
        setPlan(null);
        toast.error(message);
      })
      .finally(() => {
        release();
        setStep(null);
        invalidate(current.pool.poolId);
      });
  };

  const unusedEntries = pool
    ? tokens
        .filter((tk) => {
          const id = tk.canisterId.toText();
          return id === pool.token0 || id === pool.token1;
        })
        .map((tk) => ({
          token: tk,
          amount: unusedQuery.data?.[tk.canisterId.toText()] ?? 0n,
        }))
        .filter((e) => e.amount > 0n)
    : [];

  const withdrawUnused = () => {
    if (!pool || !owner || unusedEntries.length === 0) return;
    const plugSigner = signer.kind === "plug";
    const entries = unusedEntries.filter((e) => e.amount > e.token.fee);
    const release = signer.begin();
    setWithdrawing(true);
    setWithdrawMessage(null);
    const run = async () => {
      const actor = await signedSwapPool(
        pool.poolId,
        plugSigner,
        signer.ledgerAgent,
        [pool.token0, pool.token1],
      );
      for (const entry of entries) {
        unwrapNat(
          await actor.withdraw({
            token: entry.token.canisterId.toText(),
            amount: entry.amount,
            fee: entry.token.fee,
          }),
          "withdraw",
        );
      }
    };
    void run()
      .then(() => setWithdrawMessage(pickDict(SWAP_TEXT).withdrawDone))
      .catch((failure: unknown) => {
        const detail =
          failure instanceof SwapPoolCallError
            ? failure.detail
            : ((signer.kind !== "ii" ? walletFailureMessage(failure) : null) ??
              (failure instanceof Error ? failure.message : ""));
        setWithdrawMessage(pickDict(SWAP_TEXT).withdrawFailed(detail));
      })
      .finally(() => {
        release();
        setWithdrawing(false);
        invalidate(pool.poolId);
      });
  };

  const stepText: Record<Step, string> = {
    approve: t.stepApprove,
    deposit: t.stepDeposit,
    swap: t.stepSwap,
    withdraw: t.stepWithdraw,
  };

  const status = (() => {
    if (same)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.same_token_state">
          {t.sameToken}
        </SwapNotice>
      );
    if (poolQuery.isLoading)
      return (
        <SwapNotice tone="info" ocid="wallet.swap.pool_loading_state">
          {t.poolLoading}
        </SwapNotice>
      );
    if (poolQuery.isError)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.pool_error_state">
          {t.poolError}
        </SwapNotice>
      );
    if (pool === null && from && to)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.no_pool_state">
          {t.noPool(from.symbol, to.symbol)}
        </SwapNotice>
      );
    if (amount.trim() !== "" && (amountIn === null || amountIn <= 0n) && from)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.amount_error_state">
          {t.amountInvalid(from.symbol)}
        </SwapNotice>
      );
    if (overMax && from && max !== null)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.insufficient_state">
          {t.insufficient(formatSwapAmount(max, from.decimals), from.symbol)}
        </SwapNotice>
      );
    if (!slippageValid)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.slippage_invalid_state">
          {t.slippageInvalid}
        </SwapNotice>
      );
    if (amountIn !== null && amountIn > 0n && quote === undefined) {
      if (quoteFresh && quoteQuery.isError)
        return (
          <SwapNotice tone="error" ocid="wallet.swap.quote_error_state">
            {t.quoteError}
          </SwapNotice>
        );
      return (
        <SwapNotice tone="info" ocid="wallet.swap.quote_loading_state">
          {t.quoteLoading}
        </SwapNotice>
      );
    }
    if (tooSmall)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.too_small_state">
          {t.tooSmall}
        </SwapNotice>
      );
    return null;
  })();

  if (plan) {
    return (
      <div className="flex flex-col gap-4" data-ocid="wallet.swap_panel">
        <ConfirmStep
          from={plan.from}
          to={plan.to}
          amountIn={plan.amountIn}
          minOut={plan.minOut}
          poolId={plan.pool.poolId}
          signerName={signer.kind ? SIGNER_NAMES[signer.kind] : ""}
          checked={checked}
          onCheckedChange={setChecked}
        />
        {step && (
          <SwapNotice tone="info" ocid="wallet.swap.running_state">
            {stepText[step]}
          </SwapNotice>
        )}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={() => setPlan(null)}
            disabled={running}
            data-ocid="wallet.swap.back_button"
          >
            {t.back}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-lg shadow-gold transition-smooth hover:brightness-110"
            onClick={confirm}
            disabled={!checked || running}
            data-ocid="wallet.swap.confirm_button"
          >
            {running && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.confirm}
          </Button>
        </div>
      </div>
    );
  }

  const tokenSelect = (
    id: string,
    value: string,
    onChange: (v: string) => void,
    ocid: string,
  ) => (
    <Select value={value} onValueChange={onChange} disabled={running}>
      <SelectTrigger id={id} className="w-full" data-ocid={ocid}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem
            key={token.canisterId.toText()}
            value={token.canisterId.toText()}
          >
            <span className="inline-flex items-center gap-2">
              <TokenLogo
                canisterId={token.canisterId.toText()}
                symbol={token.symbol}
                className="h-5 w-5"
              />
              {token.symbol}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const receivedPayToken = received
    ? payTokenForLedger(received.token.canisterId.toText())
    : null;

  return (
    <div className="flex flex-col gap-4" data-ocid="wallet.swap_panel">
      <div className="flex flex-col gap-2">
        <Label htmlFor="swap-from">{t.from}</Label>
        {tokenSelect("swap-from", fromId, pickFrom, "wallet.swap.from_select")}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 self-center rounded-full"
        onClick={flip}
        disabled={running}
        aria-label={t.switchTokens}
        title={t.switchTokens}
        data-ocid="wallet.swap.switch_button"
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      <div className="flex flex-col gap-2">
        <Label htmlFor="swap-to">{t.to}</Label>
        {tokenSelect("swap-to", toId, pickTo, "wallet.swap.to_select")}
        <AddTokenTrigger
          open={showAdd}
          disabled={running}
          onToggle={() => setShowAdd((open) => !open)}
        />
      </div>

      {showAdd && (
        <AddSwapToken
          existing={tokens}
          added={added}
          onAdd={(token) => {
            addSwapToken(token);
            pickTo(token.canisterId.toText());
          }}
          onRemove={removeAdded}
          onClose={() => setShowAdd(false)}
        />
      )}

      {from && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="swap-amount">{t.amount}</Label>
          <Input
            id="swap-amount"
            value={amount}
            onChange={(event) => handleAmount(event.target.value)}
            placeholder="0"
            inputMode="decimal"
            className="font-mono text-sm"
            autoComplete="off"
            disabled={running}
            aria-invalid={overMax}
            data-ocid="wallet.swap.amount_input"
          />
          {balance !== undefined && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t.balance(formatSwapAmount(balance, from.decimals), from.symbol)}
            </p>
          )}
          <PercentBar
            symbol={from.symbol}
            decimals={from.decimals}
            ledgerFee={from.fee}
            feeCount={SWAP_FEE_COUNT}
            balance={balance}
            balanceLoading={!!account && balance === undefined && !balanceError}
            walletConnected={!!account}
            percent={percent}
            currentAmount={amountIn ?? 0n}
            disabled={running}
            text={percentText}
            formatAmount={(value) => formatSwapAmount(value, from.decimals)}
            ocidPrefix="wallet.swap.percent_bar"
            labelId="swap-percent-label"
            onSelect={handlePercent}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="swap-slippage">{t.slippage}</Label>
        <div className="flex flex-wrap items-center gap-2">
          {SLIPPAGE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant={slippage === preset ? "default" : "outline"}
              className="rounded-lg"
              onClick={() => setSlippage(preset)}
              disabled={running}
              data-ocid={`wallet.swap.slippage_${preset.replace(".", "_")}_button`}
            >
              {`${formatDecimal(Number(preset), 1, 2, lang)} %`}
            </Button>
          ))}
          <div className="flex items-center gap-1">
            <Input
              id="swap-slippage"
              value={slippage}
              onChange={(event) => setSlippage(event.target.value)}
              inputMode="decimal"
              className="h-9 w-20 font-mono text-sm"
              autoComplete="off"
              disabled={running}
              aria-invalid={!slippageValid}
              data-ocid="wallet.swap.slippage_input"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t.slippageHint}</p>
      </div>

      {status}

      {from && to && pool && quote !== undefined && minOut !== null && (
        <QuoteDetails
          from={from}
          to={to}
          quote={quote}
          minOut={minOut}
          poolFee={pool.fee}
          expired={expired}
          refreshing={quoteQuery.isFetching}
          onRefresh={() => {
            void quoteQuery.refetch();
          }}
        />
      )}

      {error && (
        <SwapNotice tone="error" ocid="wallet.swap.error_state">
          {error}
        </SwapNotice>
      )}

      {received && (
        <SwapNotice tone="success" ocid="wallet.swap.success_state">
          <p>
            {t.success(
              formatSwapAmount(received.amount, received.token.decimals),
              received.token.symbol,
            )}
          </p>
          {receivedPayToken && owner && (
            <ExplorerLink
              target={dashboardAccountUrl(receivedPayToken, owner)}
              label={tx.viewOnIcpDashboard}
              className="mt-1 text-xs"
              data-ocid="wallet.swap.explorer_link"
            >
              {tw.accountOnDashboard(received.token.symbol)}
            </ExplorerLink>
          )}
        </SwapNotice>
      )}

      {unusedEntries.length > 0 && (
        <UnusedBalance
          entries={unusedEntries}
          busy={withdrawing}
          message={withdrawMessage}
          onWithdraw={withdrawUnused}
        />
      )}

      <Button
        type="button"
        className="w-full rounded-lg shadow-gold transition-smooth hover:brightness-110"
        onClick={review}
        disabled={!canReview}
        data-ocid="wallet.swap.review_button"
      >
        <ArrowLeftRight className="h-4 w-4" />
        {reviewing && <Loader2 className="h-4 w-4 animate-spin" />}
        {t.review}
      </Button>
      {!account ? (
        <p className="text-xs text-muted-foreground">{t.connectHint}</p>
      ) : (
        !signer.kind && (
          <p className="text-xs text-muted-foreground">{ts.noSigner}</p>
        )
      )}
    </div>
  );
}
