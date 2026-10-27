import { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Account } from "../backend";
import { ExplorerLink } from "../components/ExplorerLink";
import { FlatTokenIcon } from "../components/FlatTokenIcon";
import { PercentBar } from "../components/exchange/WalletPercentBar";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetBurnAccount,
  useIcrc1BalanceOf,
  useIcrc1Transfer,
  useIcrc2Allowance,
  useIcrc2TransferFrom,
  useTokenInfo,
  useTttiIcrc2Approve,
} from "../hooks/useQueries";
import { pickDict, useDict } from "../i18n/core";
import {
  TRANSFER_EXPLORER_TEXT,
  TRANSFER_PERCENT_TEXT,
  TRANSFER_TEXT,
  type TransferText,
} from "../i18n/pages/transfer";
import { tttiBlockTarget } from "../lib/explorer";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  amountForSendPercent,
  encodeAccountText,
  formatTtti,
  formatUnits,
  parseTtti,
  percentForTypedSendAmount,
  unitsInputValue,
} from "../lib/token";

/** Open form sections let the page's spacing carry the hierarchy. */
const FORM_SECTION = "surface-open rounded-none";
/** Gold primary action with a soft glow. */
const PRIMARY_GOLD =
  "w-full shadow-gold transition-smooth hover:brightness-110";
const TAB_TRIGGER =
  "min-h-11 rounded-none border-b-2 border-transparent px-3 text-muted-foreground shadow-none transition-smooth hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

function parsePrincipal(input: string): Principal | null {
  try {
    return Principal.fromText(input.trim());
  } catch {
    return null;
  }
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 11)}…${principal.slice(-6)}`;
}

/**
 * A form message resolved at render time, so a stored error or success
 * message follows a language switch.
 */
type FormMessage = {
  text: (t: TransferText) => string;
  /** TTTI-T block index of a successful operation. */
  block?: bigint;
};

function msg(text: (t: TransferText) => string, block?: bigint): FormMessage {
  return { text, block };
}

function feeText(fee: bigint | undefined): string {
  return fee === undefined ? "—" : formatUnits(fee, TTTI_DECIMALS, 0);
}

/** The contract's refusal for transfers to its own (minting) address. */
const CONTRACT_ADDRESS_REFUSED = msg((t) => t.contractAddressRefused);

function describeTransferError(error: {
  __kind__: string;
  [key: string]: unknown;
}): FormMessage {
  switch (error.__kind__) {
    case "BadFee":
      return msg((t) => t.badFee);
    case "InsufficientFunds": {
      const detail = error.InsufficientFunds as
        | { balance?: bigint }
        | undefined;
      const balance =
        detail?.balance !== undefined ? formatTtti(detail.balance) : null;
      return balance
        ? msg((t) => t.insufficientFundsBalance(balance, TTTI_SYMBOL))
        : msg((t) => t.insufficientFunds);
    }
    case "InsufficientAllowance": {
      const detail = error.InsufficientAllowance as
        | { allowance?: bigint }
        | undefined;
      const allowance =
        detail?.allowance !== undefined ? formatTtti(detail.allowance) : null;
      return allowance
        ? msg((t) => t.insufficientAllowanceAmount(allowance, TTTI_SYMBOL))
        : msg((t) => t.insufficientAllowance);
    }
    case "Duplicate":
      return msg((t) => t.duplicateTransfer);
    case "TemporarilyUnavailable":
      return msg((t) => t.temporarilyUnavailable);
    case "CreatedInFuture":
      return msg((t) => t.createdInFuture);
    case "TooOld":
      return msg((t) => t.tooOldTransfer);
    case "GenericError": {
      const detail = error.GenericError as { error_code?: bigint } | undefined;
      return detail?.error_code === 8n
        ? CONTRACT_ADDRESS_REFUSED
        : msg((t) => t.genericRejected);
    }
    default:
      return msg((t) => t.rejected);
  }
}

function describeApproveError(error: {
  __kind__: string;
  [key: string]: unknown;
}): FormMessage {
  switch (error.__kind__) {
    case "AllowanceChanged": {
      const detail = error.AllowanceChanged as
        | { current_allowance?: bigint }
        | undefined;
      const current =
        detail?.current_allowance !== undefined
          ? formatTtti(detail.current_allowance)
          : null;
      return current
        ? msg((t) => t.allowanceChangedAmount(current, TTTI_SYMBOL))
        : msg((t) => t.allowanceChanged);
    }
    case "Expired":
      return msg((t) => t.approveExpired);
    case "ExpiredFrom":
      return msg((t) => t.approveExpiredFrom);
    case "InsufficientFunds":
      return msg((t) => t.approveInsufficientFunds);
    case "BadFee":
      return msg((t) => t.approveBadFee);
    case "Duplicate":
      return msg((t) => t.approveDuplicate);
    case "TemporarilyUnavailable":
      return msg((t) => t.temporarilyUnavailable);
    case "CreatedInFuture":
      return msg((t) => t.createdInFuture);
    case "TooOld":
      return msg((t) => t.approveTooOld);
    default:
      return msg((t) => t.approveRejected);
  }
}

function SignedOutNotice() {
  const t = useDict(TRANSFER_TEXT);
  return (
    <Card
      className="surface-open mx-auto w-full max-w-2xl rounded-none py-10"
      data-ocid="transfer.signed_out_card"
    >
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wallet className="w-5 h-5 text-primary" />
          {t.signedOutTitle}
        </CardTitle>
        <CardDescription>{t.signedOutBody}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function BalanceCard({ balance }: { balance: bigint | undefined }) {
  const t = useDict(TRANSFER_TEXT);
  return (
    <Card
      className="surface-open rounded-none border-l-2 border-l-primary py-1"
      data-ocid="transfer.balance_card"
    >
      <CardHeader className="px-6 py-3">
        <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
          <Wallet className="w-4 h-4 text-primary" />
          {t.balanceLabel}
        </CardDescription>
        <CardTitle className="font-mono text-4xl font-semibold tracking-tight tabular-nums text-primary">
          {balance === undefined ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            `${formatTtti(balance)} ${TTTI_SYMBOL}`
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

/** "Recorded in block N" line with a link to the block on the History page. */
function BlockRecord({ block, ocid }: { block: bigint; ocid: string }) {
  const tx = useDict(TRANSFER_EXPLORER_TEXT);
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
      <span>{tx.recordedInBlock}</span>
      <ExplorerLink
        target={tttiBlockTarget(block)}
        label={tx.viewBlockInHistory}
        data-ocid={ocid}
      >
        {block.toString()}
      </ExplorerLink>
    </span>
  );
}

function FormAlert({
  variant,
  message,
  ocid,
  block,
}: {
  variant: "error" | "success";
  message: string;
  ocid: string;
  block?: bigint;
}) {
  if (variant === "error") {
    return (
      <Alert variant="destructive" data-ocid={ocid}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert className="border-primary/40 bg-primary/5" data-ocid={ocid}>
      <CheckCircle2 className="h-4 w-4 text-primary" />
      <AlertDescription>
        <span>{message}</span>
        {block !== undefined && (
          <BlockRecord block={block} ocid={`${ocid}.block_link`} />
        )}
      </AlertDescription>
    </Alert>
  );
}

interface TransferFormProps {
  owner: Principal;
  fee: bigint | undefined;
  reservedAccount: Account | undefined;
  balance: bigint | undefined;
  balanceLoading: boolean;
}

function TransferForm({
  owner,
  fee,
  reservedAccount,
  balance,
  balanceLoading,
}: TransferFormProps) {
  const t = useDict(TRANSFER_TEXT);
  const percentText = useDict(TRANSFER_PERCENT_TEXT);
  const transfer = useIcrc1Transfer();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [percent, setPercent] = useState<number | null>(null);
  const [error, setError] = useState<FormMessage | null>(null);
  const [success, setSuccess] = useState<FormMessage | null>(null);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setPercent(
      balance !== undefined && fee !== undefined
        ? percentForTypedSendAmount(value, TTTI_DECIMALS, balance, fee)
        : null,
    );
  };

  const handlePercentSelect = (value: number) => {
    if (balance === undefined || fee === undefined) return;
    setPercent(value);
    setAmount(
      unitsInputValue(amountForSendPercent(balance, fee, value), TTTI_DECIMALS),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const to = parsePrincipal(recipient);
    if (!to) {
      setError(msg((t) => t.invalidRecipient));
      return;
    }
    if (!reservedAccount) {
      setError(msg((t) => t.destinationUnavailable));
      return;
    }
    if (to.toText() === reservedAccount.owner.toText()) {
      setError(CONTRACT_ADDRESS_REFUSED);
      return;
    }
    const parsed = parseTtti(amount);
    if (parsed === null || parsed <= 0n) {
      setError(msg((t) => t.invalidAmount(TTTI_DECIMALS)));
      return;
    }

    const capturedRecipient = recipient;
    const capturedAmount = amount;
    const capturedPercent = percent;
    setRecipient("");
    setAmount("");
    setPercent(null);

    transfer.mutate(
      { to: { owner: to }, amount: parsed },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "Ok") {
            const sent = formatTtti(parsed);
            const toText = truncatePrincipal(to.toText());
            setSuccess(
              msg((t) => t.transferSent(sent, TTTI_SYMBOL, toText), result.Ok),
            );
            toast.success(pickDict(TRANSFER_TEXT).toastTransfer);
          } else {
            setError(describeTransferError(result.Err));
            setRecipient(capturedRecipient);
            setAmount(capturedAmount);
            setPercent(capturedPercent);
          }
        },
        onError: () => {
          setError(msg((t) => t.transferFailed));
          setRecipient(capturedRecipient);
          setAmount(capturedAmount);
          setPercent(capturedPercent);
        },
      },
    );
  };

  return (
    <Card className={FORM_SECTION} data-ocid="transfer.transfer_card">
      <CardHeader className="px-0 pb-7">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          {t.transferTitle(TTTI_SYMBOL)}
        </CardTitle>
        <CardDescription>
          {t.transferDescription(feeText(fee), TTTI_SYMBOL)}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="transfer-recipient">{t.recipientLabel}</Label>
            <Input
              id="transfer-recipient"
              type="text"
              placeholder="aaaaa-aa"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              data-ocid="transfer.recipient_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-amount">
              {t.amountLabel(TTTI_SYMBOL)}
            </Label>
            <Input
              id="transfer-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              autoComplete="off"
              data-ocid="transfer.amount_input"
            />
            <PercentBar
              symbol={TTTI_SYMBOL}
              decimals={TTTI_DECIMALS}
              ledgerFee={fee ?? 0n}
              feeCount={1}
              balance={fee === undefined ? undefined : balance}
              balanceLoading={balanceLoading || fee === undefined}
              walletConnected
              percent={percent}
              currentAmount={parseTtti(amount) ?? 0n}
              disabled={transfer.isPending}
              text={percentText}
              formatAmount={(value) => formatTtti(value)}
              ocidPrefix="transfer.percent_bar"
              labelId="transfer-percent-label"
              onSelect={handlePercentSelect}
            />
            <p className="text-xs text-muted-foreground">
              {t.transferHint(
                TTTI_DECIMALS,
                feeText(fee),
                TTTI_SYMBOL,
                truncatePrincipal(owner.toText()),
              )}
            </p>
          </div>

          {error && (
            <FormAlert
              variant="error"
              message={error.text(t)}
              ocid="transfer.transfer_error_state"
            />
          )}
          {success && (
            <FormAlert
              variant="success"
              message={success.text(t)}
              block={success.block}
              ocid="transfer.transfer_success_state"
            />
          )}

          <Button
            type="submit"
            className={PRIMARY_GOLD}
            disabled={transfer.isPending || !reservedAccount}
            data-ocid="transfer.transfer_submit_button"
          >
            {transfer.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                {t.sendTokens}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ApproveForm({ owner }: { owner: Principal }) {
  const t = useDict(TRANSFER_TEXT);
  const approve = useTttiIcrc2Approve();
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<FormMessage | null>(null);
  const [success, setSuccess] = useState<FormMessage | null>(null);

  const spenderPrincipal = useMemo(() => parsePrincipal(spender), [spender]);

  const allowanceArgs = useMemo(
    () =>
      spenderPrincipal
        ? { account: { owner }, spender: { owner: spenderPrincipal } }
        : undefined,
    [owner, spenderPrincipal],
  );

  const { data: allowance, isLoading: isAllowanceLoading } =
    useIcrc2Allowance(allowanceArgs);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const to = parsePrincipal(spender);
    if (!to) {
      setError(msg((t) => t.invalidSpender));
      return;
    }
    const parsed = parseTtti(amount);
    if (parsed === null || parsed <= 0n) {
      setError(msg((t) => t.invalidAllowance(TTTI_DECIMALS)));
      return;
    }

    const capturedSpender = spender;
    const capturedAmount = amount;
    setSpender("");
    setAmount("");

    approve.mutate(
      { spender: { owner: to }, amount: parsed },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "Ok") {
            const approvedAmount = formatTtti(parsed);
            const spenderText = truncatePrincipal(to.toText());
            setSuccess(
              msg(
                (t) => t.approved(approvedAmount, TTTI_SYMBOL, spenderText),
                result.Ok,
              ),
            );
            toast.success(pickDict(TRANSFER_TEXT).toastApproved);
          } else {
            setError(describeApproveError(result.Err));
            setSpender(capturedSpender);
            setAmount(capturedAmount);
          }
        },
        onError: (err) => {
          setError(msg((t) => err.message || t.approvalFailed));
          setSpender(capturedSpender);
          setAmount(capturedAmount);
        },
      },
    );
  };

  return (
    <Card className={FORM_SECTION} data-ocid="transfer.approve_card">
      <CardHeader className="px-0 pb-7">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ShieldCheck className="w-5 h-5 text-primary" />
          {t.approveTitle}
        </CardTitle>
        <CardDescription>{t.approveDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-0">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="approve-spender">{t.spenderLabel}</Label>
            <Input
              id="approve-spender"
              type="text"
              placeholder="aaaaa-aa"
              value={spender}
              onChange={(e) => setSpender(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              data-ocid="transfer.spender_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="approve-amount">
              {t.allowanceLabel(TTTI_SYMBOL)}
            </Label>
            <Input
              id="approve-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoComplete="off"
              data-ocid="transfer.approve_amount_input"
            />
            <p className="text-xs text-muted-foreground">
              {t.approveHint(TTTI_DECIMALS, TTTI_SYMBOL)}
            </p>
          </div>

          {error && (
            <FormAlert
              variant="error"
              message={error.text(t)}
              ocid="transfer.approve_error_state"
            />
          )}
          {success && (
            <FormAlert
              variant="success"
              message={success.text(t)}
              block={success.block}
              ocid="transfer.approve_success_state"
            />
          )}

          <Button
            type="submit"
            className={PRIMARY_GOLD}
            disabled={approve.isPending}
            data-ocid="transfer.approve_submit_button"
          >
            {approve.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.approving}
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {t.approveAllowance}
              </>
            )}
          </Button>
        </form>

        <div className="rule-quiet pt-6" data-ocid="transfer.allowance_panel">
          <p className="text-sm text-muted-foreground">
            {spenderPrincipal
              ? t.currentAllowanceFor(
                  truncatePrincipal(spenderPrincipal.toText()),
                )
              : t.currentAllowance}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight font-mono tabular-nums text-foreground">
            {!spenderPrincipal
              ? t.enterSpenderToView
              : isAllowanceLoading
                ? t.loading
                : `${formatTtti(allowance?.allowance ?? 0n)} ${TTTI_SYMBOL}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TransferFromForm({
  reservedAccount,
}: { reservedAccount: Account | undefined }) {
  const t = useDict(TRANSFER_TEXT);
  const transferFrom = useIcrc2TransferFrom();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<FormMessage | null>(null);
  const [success, setSuccess] = useState<FormMessage | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fromPrincipal = parsePrincipal(from);
    if (!fromPrincipal) {
      setError(msg((t) => t.invalidFrom));
      return;
    }
    const toPrincipal = parsePrincipal(to);
    if (!toPrincipal) {
      setError(msg((t) => t.invalidTo));
      return;
    }
    if (!reservedAccount) {
      setError(msg((t) => t.destinationUnavailable));
      return;
    }
    if (toPrincipal.toText() === reservedAccount.owner.toText()) {
      setError(CONTRACT_ADDRESS_REFUSED);
      return;
    }
    const parsed = parseTtti(amount);
    if (parsed === null || parsed <= 0n) {
      setError(msg((t) => t.invalidAmount(TTTI_DECIMALS)));
      return;
    }

    const capturedFrom = from;
    const capturedTo = to;
    const capturedAmount = amount;
    setFrom("");
    setTo("");
    setAmount("");

    transferFrom.mutate(
      {
        from: { owner: fromPrincipal },
        to: { owner: toPrincipal },
        amount: parsed,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "Ok") {
            const moved = formatTtti(parsed);
            const fromText = truncatePrincipal(fromPrincipal.toText());
            const toText = truncatePrincipal(toPrincipal.toText());
            setSuccess(
              msg(
                (t) => t.transferredFrom(moved, TTTI_SYMBOL, fromText, toText),
                result.Ok,
              ),
            );
            toast.success(pickDict(TRANSFER_TEXT).toastTransferFrom);
          } else {
            setError(describeTransferError(result.Err));
            setFrom(capturedFrom);
            setTo(capturedTo);
            setAmount(capturedAmount);
          }
        },
        onError: () => {
          setError(msg((t) => t.transferFailed));
          setFrom(capturedFrom);
          setTo(capturedTo);
          setAmount(capturedAmount);
        },
      },
    );
  };

  return (
    <Card className={FORM_SECTION} data-ocid="transfer.transfer_from_card">
      <CardHeader className="px-0 pb-7">
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          {t.transferFromTitle}
        </CardTitle>
        <CardDescription>{t.transferFromDescription}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="transfer-from-source">{t.fromLabel}</Label>
            <Input
              id="transfer-from-source"
              type="text"
              placeholder="aaaaa-aa"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              data-ocid="transfer.from_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-from-destination">{t.toLabel}</Label>
            <Input
              id="transfer-from-destination"
              type="text"
              placeholder="aaaaa-aa"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              data-ocid="transfer.to_input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-from-amount">
              {t.amountLabel(TTTI_SYMBOL)}
            </Label>
            <Input
              id="transfer-from-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoComplete="off"
              data-ocid="transfer.transfer_from_amount_input"
            />
          </div>

          {error && (
            <FormAlert
              variant="error"
              message={error.text(t)}
              ocid="transfer.transfer_from_error_state"
            />
          )}
          {success && (
            <FormAlert
              variant="success"
              message={success.text(t)}
              block={success.block}
              ocid="transfer.transfer_from_success_state"
            />
          )}

          <Button
            type="submit"
            className={PRIMARY_GOLD}
            disabled={transferFrom.isPending || !reservedAccount}
            data-ocid="transfer.transfer_from_submit_button"
          >
            {transferFrom.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.transferring}
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                {t.transferFromButton}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TransferPage() {
  const t = useDict(TRANSFER_TEXT);
  const { identity } = useInternetIdentity();
  const owner = identity?.getPrincipal();

  const account = useMemo(() => (owner ? { owner } : undefined), [owner]);

  const { data: balance, isLoading: isBalanceLoading } =
    useIcrc1BalanceOf(account);
  const { data: tokenInfo } = useTokenInfo();
  const { data: reservedAccount } = useGetBurnAccount();
  const fee = tokenInfo?.fee;

  if (!owner) {
    return (
      <div className="flex flex-col gap-6" data-ocid="transfer.page">
        <SignedOutNotice />
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-10 md:gap-12"
      data-ocid="transfer.page"
    >
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center text-primary">
            <FlatTokenIcon className="h-9 w-9" alt="" />
          </div>
          <div className="min-w-0">
            <h1 className="text-imperial text-gradient-gold text-2xl leading-tight md:text-3xl">
              {t.pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.pageSubtitle(tokenInfo?.symbol || TTTI_SYMBOL)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-gold font-mono"
            title={encodeAccountText({ owner })}
            data-ocid="transfer.account_badge"
          >
            {truncatePrincipal(encodeAccountText({ owner }))}
          </Badge>
          <Badge
            variant="secondary"
            className="font-mono tabular-nums text-primary"
            data-ocid="transfer.fee_badge"
          >
            {t.feeBadge(feeText(fee), TTTI_SYMBOL)}
          </Badge>
        </div>
      </header>

      <BalanceCard balance={isBalanceLoading ? undefined : balance} />

      <Tabs defaultValue="transfer" data-ocid="transfer.tabs">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="transfer"
            className={TAB_TRIGGER}
            data-ocid="transfer.transfer.tab"
          >
            {t.tabTransfer}
          </TabsTrigger>
          <TabsTrigger
            value="approve"
            className={TAB_TRIGGER}
            data-ocid="transfer.approve.tab"
          >
            {t.tabApprove}
          </TabsTrigger>
          <TabsTrigger
            value="transfer-from"
            className={TAB_TRIGGER}
            data-ocid="transfer.transfer_from.tab"
          >
            {t.tabTransferFrom}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="mt-8">
          <TransferForm
            owner={owner}
            fee={fee}
            reservedAccount={reservedAccount}
            balance={isBalanceLoading ? undefined : balance}
            balanceLoading={isBalanceLoading}
          />
        </TabsContent>
        <TabsContent value="approve" className="mt-8">
          <ApproveForm owner={owner} />
        </TabsContent>
        <TabsContent value="transfer-from" className="mt-8">
          <TransferFromForm reservedAccount={reservedAccount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
