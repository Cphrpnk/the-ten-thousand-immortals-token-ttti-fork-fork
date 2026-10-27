import { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookUser,
  CheckCircle2,
  Loader2,
  Send,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Account, Contact } from "../../backend";
import { useAccountSigner } from "../../hooks/useAccountSigner";
import {
  useAddressBookEnabled,
  useMyContacts,
} from "../../hooks/useAddressBook";
import { usePlug } from "../../hooks/usePlug";
import { walletFailureMessage } from "../../hooks/useSignerWallet";
import { useWalletBalance } from "../../hooks/useWallet";
import { formatNumber, pickDict, useDict } from "../../i18n/core";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import {
  SEND_PERCENT_TEXT,
  WALLET_EXPLORER_TEXT,
  WALLET_TEXT,
} from "../../i18n/pages/wallet";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "../../lib/explorer";
import {
  amountForSendPercent,
  formatUnits,
  parseUnits,
  percentForTypedSendAmount,
  unitsInputValue,
} from "../../lib/token";
import {
  MAX_MEMO_BYTES,
  type TokenDescriptor,
  buildTransferArgs,
  decodeMemoText,
  encodeMemoText,
} from "../../lib/tokenRegistry";
import { ExplorerLink } from "../ExplorerLink";
import { FlatTokenIcon } from "../FlatTokenIcon";
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
import { AddressBookDialog } from "./AddressBookDialog";
import { ContactCard } from "./ContactCard";
import {
  type RecipientPick,
  RecipientSuggestions,
} from "./RecipientSuggestions";
import { isTttiToken, normalizeToken } from "./TokenBalanceCard";

/** Ledger block of the last successful send and its explorer target. */
interface SentBlock {
  index: bigint;
  target: BlockLinkTarget | null;
}

interface SendPanelProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  /** Ledger canister ID preselected in the token selector. */
  initialTokenId?: string;
}

/** Send form (shown in the wallet's Send dialog). */
export function SendPanel({
  tokens: rawTokens,
  account,
  initialTokenId = "",
}: SendPanelProps) {
  const t = useDict(WALLET_TEXT);
  const tokens = rawTokens.map(normalizeToken);
  const [tokenId, setTokenId] = useState<string>(initialTokenId);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sentBlock, setSentBlock] = useState<SentBlock | null>(null);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const { requestTransfer } = usePlug();
  // Wallet that holds the sending account (Plug, OISY, NFID or II).
  const signer = useAccountSigner(
    account && isDefaultSubaccount(account.subaccount) ? account.owner : null,
  );
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ab = useDict(ADDRESS_BOOK_TEXT);
  const [memo, setMemo] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);
  const addressBookEnabled = useAddressBookEnabled();
  const { data: contacts } = useMyContacts();
  const memoEncoding = encodeMemoText(memo);
  const maxMemo = formatNumber(MAX_MEMO_BYTES);
  const sentToIsContact =
    !!sentTo && (contacts ?? []).some((c) => c.principal.toText() === sentTo);
  const canSaveContact =
    addressBookEnabled && !!sentTo && !!contacts && !sentToIsContact;

  const applyRecipient = (principal: string, contactMemo?: Uint8Array) => {
    setRecipient(principal);
    if (contactMemo && contactMemo.length > 0) {
      setMemo(decodeMemoText(contactMemo));
    }
  };

  const handlePick = (pick: RecipientPick) => {
    applyRecipient(pick.principal, pick.memo);
  };

  const handleBookSelect = (contact: Contact) => {
    applyRecipient(contact.principal.toText(), contact.memo);
    setBookOpen(false);
  };

  const selected = tokens.find((tk) => tk.canisterId.toText() === tokenId);
  const disabled = !account || tokens.length === 0;

  const { data: balanceData, isError: balanceError } = useWalletBalance(
    selected?.canisterId,
    account,
  );
  const balance = balanceData ?? null;
  const percentText = useDict(SEND_PERCENT_TEXT);
  const [percent, setPercent] = useState<number | null>(null);

  const handleTokenChange = (value: string) => {
    setTokenId(value);
    setPercent(null);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setPercent(
      selected && balance !== null
        ? percentForTypedSendAmount(
            value,
            selected.decimals,
            balance,
            selected.fee,
          )
        : null,
    );
  };

  const handlePercentSelect = (value: number) => {
    if (!selected || balance === null) return;
    setPercent(value);
    setAmount(
      unitsInputValue(
        amountForSendPercent(balance, selected.fee, value),
        selected.decimals,
      ),
    );
  };

  const invalidateBalances = () => {
    void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
    void queryClient.invalidateQueries({
      queryKey: ["tttiAccountTransactions"],
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSentBlock(null);
    setSentTo(null);
    setSavingContact(false);
    const text = pickDict(WALLET_TEXT);

    if (!account) {
      setError(text.errConnectWallet);
      return;
    }
    if (!selected) {
      setError(text.errSelectToken);
      return;
    }

    let recipientPrincipal: Principal;
    try {
      recipientPrincipal = Principal.fromText(recipient.trim());
    } catch {
      setError(text.errRecipient);
      return;
    }

    const baseAmount = parseUnits(amount, selected.decimals);
    if (baseAmount === null || baseAmount <= 0n) {
      setError(text.errAmount(selected.symbol));
      return;
    }

    const total = baseAmount + selected.fee;
    if (balance !== null && total > balance) {
      setError(
        text.errInsufficient(
          selected.symbol,
          formatAmount(balance, selected.decimals),
          formatAmount(total, selected.decimals),
        ),
      );
      return;
    }

    const memoCheck = encodeMemoText(memo);
    if (!memoCheck.ok) {
      setError(
        pickDict(ADDRESS_BOOK_TEXT).sendMemoTooLong(
          formatNumber(MAX_MEMO_BYTES),
        ),
      );
      return;
    }
    const memoBytes = memoCheck.bytes;

    const capturedRecipient = recipient;
    const capturedAmount = amount;
    const capturedMemo = memo;
    const to: Account = { owner: recipientPrincipal };
    const token = selected;
    const signerKind = signer.kind;
    // Opens the OISY / NFID window from this click, before any await.
    const release = signer.begin();

    const submit = async () => {
      setIsSubmitting(true);
      try {
        // Transfer arguments are built here; the fee comes from the
        // ledger's icrc1_metadata (see useListTokens).
        const args = buildTransferArgs(to, baseAmount, token.fee, memoBytes);
        let blockIndex: bigint | null = null;

        if (signerKind === "plug") {
          const plugResult = await requestTransfer(token.canisterId, {
            to: recipientPrincipal.toText(),
            amount: args.amount,
            opts: memoBytes
              ? { fee: args.fee, memo: memoBytes }
              : { fee: args.fee },
          });
          blockIndex =
            typeof plugResult?.height === "number" &&
            Number.isSafeInteger(plugResult.height) &&
            plugResult.height >= 0
              ? BigInt(plugResult.height)
              : null;
        } else if (signerKind) {
          // The app's own actor always targets the TTTI canister, so we build
          // a direct actor for the SELECTED token's ledger canister and call
          // icrc1_transfer on it, signed by Internet Identity or, through the
          // ICRC-49 signer agent, by OISY / NFID Wallet.
          const agent = await signer.ledgerAgent();
          const ledgerActor = createActor(
            token.canisterId.toText(),
            async () => {
              throw new Error("File upload is not supported for ledger calls.");
            },
            async () => {
              throw new Error(
                "File download is not supported for ledger calls.",
              );
            },
            { agent },
          );
          const result = await ledgerActor.icrc1_transfer(args);
          if (result.__kind__ === "Err") {
            throw new LedgerTransferError(describeTransferError(result.Err));
          }
          blockIndex = result.Ok;
          signer.remember();
        } else {
          throw new Error(pickDict(WALLET_TEXT).sendConnectHint);
        }

        invalidateBalances();
        setSentBlock(
          blockIndex === null
            ? null
            : {
                index: blockIndex,
                target: isTttiToken(token)
                  ? tttiBlockTarget(blockIndex)
                  : blockLinkTarget(token.canisterId.toText(), blockIndex),
              },
        );
        const done = pickDict(WALLET_TEXT);
        setSuccess(
          done.sentSuccess(
            formatAmount(baseAmount, token.decimals),
            token.symbol,
            truncatePrincipal(recipientPrincipal.toText()),
          ),
        );
        toast.success(done.toastSent(token.symbol));
        setSentTo(recipientPrincipal.toText());
      } finally {
        setIsSubmitting(false);
        release();
      }
    };

    setRecipient("");
    setAmount("");
    setMemo("");
    const capturedPercent = percent;
    setPercent(null);

    void submit().catch((submitError: unknown) => {
      const walletMessage =
        signerKind &&
        signerKind !== "ii" &&
        !(submitError instanceof LedgerTransferError)
          ? walletFailureMessage(submitError)
          : null;
      const message =
        walletMessage ??
        (submitError instanceof Error
          ? submitError.message
          : pickDict(WALLET_TEXT).errTransferFailed);
      setError(message);
      setRecipient(capturedRecipient);
      setAmount(capturedAmount);
      setMemo(capturedMemo);
      setPercent(capturedPercent);
      toast.error(message);
    });
  };

  return (
    <div data-ocid="wallet.send_panel">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="send-token">{t.token}</Label>
          <Select value={tokenId} onValueChange={handleTokenChange}>
            <SelectTrigger
              id="send-token"
              className="w-full"
              data-ocid="wallet.send_token_select"
            >
              <SelectValue placeholder={t.selectToken} />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem
                  key={token.canisterId.toText()}
                  value={token.canisterId.toText()}
                >
                  {token.symbol.startsWith("TTTI") ? (
                    <span className="inline-flex items-center gap-2">
                      <FlatTokenIcon className="h-4 w-4" alt="" />
                      {token.symbol} — {token.name}
                    </span>
                  ) : (
                    <>
                      {token.symbol} — {token.name}
                    </>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="send-recipient">{t.recipientPrincipal}</Label>
          <div className="flex items-start gap-2">
            <RecipientSuggestions
              id="send-recipient"
              value={recipient}
              onChange={setRecipient}
              onPick={handlePick}
              owner={account?.owner}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg"
              onClick={() => setBookOpen(true)}
              aria-label={ab.openButton}
              title={ab.openButton}
              data-ocid="wallet.send_address_book.open_modal_button"
            >
              <BookUser className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="send-memo">
            {ab.sendMemoLabel}{" "}
            <span className="font-normal text-muted-foreground">
              {ab.sendMemoOptional}
            </span>
          </Label>
          <Input
            id="send-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            className="text-sm"
            autoComplete="off"
            aria-invalid={!memoEncoding.ok}
            aria-describedby="send-memo-hint"
            data-ocid="wallet.send_memo_input"
          />
          <p
            id="send-memo-hint"
            className={`flex justify-between gap-2 text-xs tabular-nums ${memoEncoding.ok ? "text-muted-foreground" : "text-destructive"}`}
            data-ocid={
              memoEncoding.ok ? undefined : "wallet.send_memo.error_state"
            }
          >
            <span>
              {memoEncoding.ok
                ? ab.sendMemoHint(maxMemo)
                : ab.sendMemoTooLong(maxMemo)}
            </span>
            <span className="shrink-0">
              {ab.memoBytes(formatNumber(memoEncoding.length), maxMemo)}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="send-amount">{t.amount}</Label>
          <Input
            id="send-amount"
            value={amount}
            onChange={(event) => handleAmountChange(event.target.value)}
            placeholder={selected ? `0.${"0".repeat(selected.decimals)}` : "0"}
            inputMode="decimal"
            className="font-mono text-sm"
            autoComplete="off"
            data-ocid="wallet.send_amount_input"
          />
          {selected && (
            <p className="text-xs text-muted-foreground tabular-nums">
              {t.fee} {formatAmount(selected.fee, selected.decimals)}{" "}
              {selected.symbol}
              {balance !== null &&
                t.balanceSuffix(
                  formatAmount(balance, selected.decimals),
                  selected.symbol,
                )}
            </p>
          )}
          {selected && (
            <PercentBar
              symbol={selected.symbol}
              decimals={selected.decimals}
              ledgerFee={selected.fee}
              feeCount={1}
              balance={balanceData}
              balanceLoading={
                !!account && balanceData === undefined && !balanceError
              }
              walletConnected={!!account}
              percent={percent}
              currentAmount={parseUnits(amount, selected.decimals) ?? 0n}
              disabled={disabled || isSubmitting}
              text={percentText}
              formatAmount={(value) => formatAmount(value, selected.decimals)}
              ocidPrefix="wallet.send.percent_bar"
              labelId="send-percent-label"
              onSelect={handlePercentSelect}
            />
          )}
        </div>

        {error && (
          <p
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            data-ocid="wallet.send_error_state"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {success && (
          <div
            className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
            data-ocid="wallet.send_success_state"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex min-w-0 flex-col gap-1">
              <p>{success}</p>
              {sentBlock ? (
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{tx.recordedInBlock}</span>
                  {sentBlock.target ? (
                    <ExplorerLink
                      target={sentBlock.target}
                      label={
                        sentBlock.target.kind === "history"
                          ? tx.viewBlockInHistory
                          : tx.viewOnIcpDashboard
                      }
                      data-ocid="wallet.send_block_link"
                    >
                      {sentBlock.index.toString()}
                    </ExplorerLink>
                  ) : (
                    <span className="font-mono text-foreground">
                      {sentBlock.index.toString()}
                    </span>
                  )}
                </p>
              ) : null}
              {canSaveContact && !savingContact && (
                <button
                  type="button"
                  className="inline-flex min-h-6 items-center gap-1 self-start text-xs text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                  onClick={() => setSavingContact(true)}
                  data-ocid="wallet.send_save_contact.link"
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden />
                  {ab.saveAsContact}
                </button>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full rounded-lg shadow-gold transition-smooth hover:brightness-110"
          disabled={isSubmitting || disabled}
          data-ocid="wallet.send_button"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? t.sending : t.send}
        </Button>

        {!account && (
          <p className="text-xs text-muted-foreground">{t.sendConnectHint}</p>
        )}
      </form>
      {savingContact && sentTo && (
        <div
          className="mt-4 rounded-lg border border-border p-4"
          data-ocid="wallet.send_save_contact.panel"
        >
          <ContactCard
            initialPrincipal={sentTo}
            onDone={() => setSavingContact(false)}
          />
        </div>
      )}
      <AddressBookDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        onSelect={handleBookSelect}
      />
    </div>
  );
}

function formatAmount(value: bigint, decimals: number): string {
  return formatUnits(value, decimals, 0);
}

/** Error returned by the ledger itself, shown as is. */
class LedgerTransferError extends Error {}

function isDefaultSubaccount(sub: Uint8Array | undefined): boolean {
  return !sub || sub.every((b) => b === 0);
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 22) return principal;
  return `${principal.slice(0, 12)}…${principal.slice(-6)}`;
}

function describeTransferError(error: {
  __kind__: string;
  [key: string]: unknown;
}): string {
  const text = pickDict(WALLET_TEXT);
  switch (error.__kind__) {
    case "BadFee":
      return text.errBadFee;
    case "InsufficientFunds":
      return text.errInsufficientFunds;
    case "TooOld":
      return text.errTooOld;
    case "CreatedInFuture":
      return text.errCreatedInFuture;
    case "Duplicate":
      return text.errDuplicate;
    case "TemporarilyUnavailable":
      return text.errTemporarilyUnavailable;
    case "GenericError":
      return typeof error.GenericError === "object" &&
        error.GenericError !== null &&
        "message" in error.GenericError
        ? String((error.GenericError as { message: unknown }).message)
        : text.errGeneric;
    default:
      return text.errTransferFailed;
  }
}
