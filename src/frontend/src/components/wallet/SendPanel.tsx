import { loadConfig } from "@caffeineai/core-infrastructure";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type { Account } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { usePlug } from "../../hooks/usePlug";
import { useWalletBalance } from "../../hooks/useWallet";
import { pickDict, useDict } from "../../i18n/core";
import { WALLET_EXPLORER_TEXT, WALLET_TEXT } from "../../i18n/pages/wallet";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "../../lib/explorer";
import { formatUnits, parseUnits } from "../../lib/token";
import {
  type TokenDescriptor,
  buildTransferArgs,
} from "../../lib/tokenRegistry";
import { ExplorerLink } from "../ExplorerLink";
import { FlatTokenIcon } from "../FlatTokenIcon";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isTttiToken, normalizeToken } from "./TokenBalanceCard";

/** Ledger block of the last successful send and its explorer target. */
interface SentBlock {
  index: bigint;
  target: BlockLinkTarget | null;
}

interface SendPanelProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
}

export function SendPanel({ tokens: rawTokens, account }: SendPanelProps) {
  const t = useDict(WALLET_TEXT);
  const tokens = rawTokens.map(normalizeToken);
  const [tokenId, setTokenId] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sentBlock, setSentBlock] = useState<SentBlock | null>(null);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const { principal: plugPrincipal, requestTransfer } = usePlug();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = tokens.find((tk) => tk.canisterId.toText() === tokenId);
  const disabled = !account || tokens.length === 0;

  const { data: balanceData } = useWalletBalance(selected?.canisterId, account);
  const balance = balanceData ?? null;

  const invalidateBalances = () => {
    void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSentBlock(null);
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

    const capturedRecipient = recipient;
    const capturedAmount = amount;
    const to: Account = { owner: recipientPrincipal };
    const token = selected;

    const submit = async () => {
      setIsSubmitting(true);
      try {
        // Transfer arguments are built here; the fee comes from the
        // ledger's icrc1_metadata (see useListTokens).
        const args = buildTransferArgs(to, baseAmount, token.fee);
        let blockIndex: bigint | null = null;

        if (plugPrincipal) {
          const plugResult = await requestTransfer(token.canisterId, {
            to: recipientPrincipal.toText(),
            amount: args.amount,
            opts: { fee: args.fee },
          });
          blockIndex =
            typeof plugResult?.height === "number" &&
            Number.isSafeInteger(plugResult.height) &&
            plugResult.height >= 0
              ? BigInt(plugResult.height)
              : null;
        } else if (identity) {
          // The app's own actor always targets the TTTI canister, so for
          // Internet Identity we build a direct actor for the SELECTED token's
          // ledger canister (createActor accepts a canisterId) and call
          // icrc1_transfer on it with the connected identity.
          const config = await loadConfig();
          const agent = new HttpAgent({
            identity,
            host: config.backend_host,
          });
          if (config.backend_host?.includes("localhost")) {
            await agent.fetchRootKey().catch(() => undefined);
          }
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
            throw new Error(describeTransferError(result.Err));
          }
          blockIndex = result.Ok;
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
      } finally {
        setIsSubmitting(false);
      }
    };

    setRecipient("");
    setAmount("");

    void submit().catch((submitError: unknown) => {
      const message =
        submitError instanceof Error
          ? submitError.message
          : pickDict(WALLET_TEXT).errTransferFailed;
      setError(message);
      setRecipient(capturedRecipient);
      setAmount(capturedAmount);
      toast.error(message);
    });
  };

  return (
    <Card
      className="rounded-lg border-gold bg-card shadow-elevated"
      data-ocid="wallet.send_panel"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-display">
          <Send className="h-4 w-4 text-primary" />
          {t.send}
        </CardTitle>
        <CardDescription>{t.sendDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="send-token">{t.token}</Label>
            <Select value={tokenId} onValueChange={setTokenId}>
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
            <Input
              id="send-recipient"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="aaaaa-aa"
              className="font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
              data-ocid="wallet.send_recipient_input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="send-amount">{t.amount}</Label>
            <Input
              id="send-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={
                selected ? `0.${"0".repeat(selected.decimals)}` : "0"
              }
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
      </CardContent>
    </Card>
  );
}

function formatAmount(value: bigint, decimals: number): string {
  return formatUnits(value, decimals, 0);
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
