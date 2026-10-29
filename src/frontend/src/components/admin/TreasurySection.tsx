import { Principal } from "@icp-sdk/core/principal";
import { AlertTriangle, Loader2, Lock, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Account,
  FeeAccountTokenView,
  SettlementStatus,
  TokenSettlementView,
} from "../../backend";
import { PayToken, SettlementLegPurpose } from "../../backend";
import {
  useMintFeeAccount,
  useReceivingWallets,
  useSetReceivingWallet,
  useSettlementStatus,
} from "../../hooks/useAdminTreasury";
import {
  PAY_TOKEN_ORDER,
  encodeAccountText,
  formatPayAmount,
  payTokenSymbol,
} from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import {
  AdminAccordion,
  AdminStat,
  BlockRef,
  RevealText,
  StatusBadge,
  TokenSelect,
  bytesToHex,
} from "./AdminUi";
import { formatTimestamp } from "./ConversionsCard";
import { PRIMARY_GOLD } from "./styles";

const BLOCK_LABEL =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

type ParsedAccount =
  | { ok: true; account: Account }
  | { ok: false; message: string };

function parseAccount(principalText: string, subText: string): ParsedAccount {
  let owner: Principal;
  try {
    owner = Principal.fromText(principalText.trim());
  } catch {
    return { ok: false, message: "Enter a valid principal." };
  }
  if (owner.isAnonymous()) {
    return {
      ok: false,
      message: "The anonymous principal cannot be a wallet.",
    };
  }
  const hex = subText.trim().replace(/^0x/i, "");
  if (hex !== "" && !/^[0-9a-fA-F]{64}$/.test(hex)) {
    return {
      ok: false,
      message:
        "The subaccount must be 64 hexadecimal characters (32 bytes), or left empty.",
    };
  }
  return {
    ok: true,
    account: hex === "" ? { owner } : { owner, subaccount: hexToBytes(hex) },
  };
}

// --- Receiving wallet ------------------------------------------------------

function ReceivingWalletBlock({ token }: { token: PayToken }) {
  const wallets = useReceivingWallets();
  const setWallet = useSetReceivingWallet();
  const [principalText, setPrincipalText] = useState("");
  const [subText, setSubText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Account | null>(null);
  const symbol = payTokenSymbol(token);
  const view = wallets.data?.find((w) => w.token === token);
  const configured = view?.wallet !== undefined;
  const accountText =
    view?.accountText ?? (view?.wallet ? encodeAccountText(view.wallet) : "");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const parsed = parseAccount(principalText, subText);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setPending(parsed.account);
  };

  const onConfirm = () => {
    if (!pending) return;
    const account = pending;
    setWallet.mutate(
      { token, account },
      {
        onSuccess: () => {
          setPending(null);
          setPrincipalText("");
          setSubText("");
          toast.success(`${symbol} receiving wallet saved`);
        },
        onError: (e) => {
          setPending(null);
          setError(e.message);
          toast.error(e.message);
        },
      },
    );
  };

  const fieldId = `receiving-${token}`;

  return (
    <div className="space-y-5" data-ocid="admin.receiving_wallet">
      <p className={BLOCK_LABEL}>Receiving wallet</p>
      {wallets.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : wallets.isError ? (
        <Alert
          variant="destructive"
          data-ocid="admin.receiving_wallet_error_state"
        >
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {wallets.error.message ||
              "The receiving wallets could not be loaded."}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void wallets.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : configured ? (
        <div className="space-y-2">
          <RevealText
            text={accountText}
            label={`${symbol} receiving wallet`}
            ocid="admin.receiving_wallet_account"
            head={18}
            tail={10}
          />
          <p className="text-xs text-muted-foreground">
            {view?.setAt !== undefined
              ? `Set ${formatTimestamp(view.setAt)}`
              : "Set"}
            {view?.setBy ? ` by ${view.setBy.toText()}` : ""}. Each mint paid
            with {symbol} sends 100/101 here, ledger fee deducted.
          </p>
        </div>
      ) : (
        <Alert
          className="border-destructive/40 bg-destructive/5"
          data-ocid="admin.receiving_wallet_missing_state"
        >
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            No receiving wallet is set for {symbol}. Mints paid with {symbol}
            {token === PayToken.ckbtc ? " (and BTC)" : ""} are refused before
            any funds are taken.
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-principal`}>Principal</Label>
          <Input
            id={`${fieldId}-principal`}
            value={principalText}
            onChange={(e) => setPrincipalText(e.target.value)}
            placeholder="aaaaa-aa…"
            autoComplete="off"
            className="font-mono"
            data-ocid="admin.receiving_wallet_principal_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-sub`}>Subaccount (hex, optional)</Label>
          <Input
            id={`${fieldId}-sub`}
            value={subText}
            onChange={(e) => setSubText(e.target.value)}
            placeholder="64 hex characters"
            autoComplete="off"
            className="font-mono"
            data-ocid="admin.receiving_wallet_subaccount_input"
          />
        </div>
        <Button
          type="submit"
          className={PRIMARY_GOLD}
          disabled={principalText.trim() === "" || setWallet.isPending}
          data-ocid="admin.receiving_wallet_submit_button"
        >
          {setWallet.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {configured ? "Change wallet" : "Set wallet"}
        </Button>
      </form>
      {error && (
        <p
          className="text-sm text-destructive"
          role="alert"
          data-ocid="admin.receiving_wallet_form_error"
        >
          {error}
        </p>
      )}

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !setWallet.isPending) setPending(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.receiving_wallet_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {configured ? "Change" : "Set"} the {symbol} receiving wallet?
            </AlertDialogTitle>
            <AlertDialogDescription>
              From now on, 100/101 of each mint paid with {symbol} is sent to
              this account. Check it carefully: ledger sends cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pending && (
            <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
              <dt className="text-muted-foreground">Principal</dt>
              <dd className="font-mono break-all">{pending.owner.toText()}</dd>
              <dt className="text-muted-foreground">Subaccount</dt>
              <dd className="font-mono break-all">
                {bytesToHex(pending.subaccount) || "Default"}
              </dd>
              <dt className="text-muted-foreground">Account</dt>
              <dd className="font-mono break-all">
                {encodeAccountText(pending)}
              </dd>
            </dl>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={setWallet.isPending}
              data-ocid="admin.receiving_wallet_cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={PRIMARY_GOLD}
              disabled={setWallet.isPending}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              data-ocid="admin.receiving_wallet_confirm_button"
            >
              {setWallet.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Settlement ------------------------------------------------------------

const LEG_PURPOSES: Record<SettlementLegPurpose, string> = {
  [SettlementLegPurpose.ownerAccumulated]: "Accumulated revenue",
  [SettlementLegPurpose.ownerMintTreasury]: "Legacy mint-treasury share",
  [SettlementLegPurpose.feePending]: "Pending fees to fee account",
  [SettlementLegPurpose.feeLegacy]: "Legacy fees to fee account",
};

function SettlementBadge({ status }: { status: SettlementStatus }) {
  switch (status.__kind__) {
    case "pendingWallet":
      return <Badge variant="secondary">Waiting for wallet</Badge>;
    case "sending":
      return <Badge variant="secondary">Sending</Badge>;
    case "sent":
      return (
        <Badge variant="secondary" className="text-success">
          Sent
        </Badge>
      );
    case "toReview":
      return <Badge variant="destructive">To review</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
  }
}

function SettlementBlock({ token }: { token: PayToken }) {
  const settlement = useSettlementStatus();
  const view: TokenSettlementView | undefined = settlement.data?.find(
    (s) => s.token === token,
  );

  return (
    <div className="space-y-5" data-ocid="admin.settlement">
      <div className="flex flex-wrap items-center gap-3">
        <p className={BLOCK_LABEL}>One-time settlement</p>
        {view && <SettlementBadge status={view.status} />}
      </div>
      {settlement.isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : settlement.isError ? (
        <Alert variant="destructive" data-ocid="admin.settlement_error_state">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {settlement.error.message ||
              "The settlement status could not be loaded."}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void settlement.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !view ? (
        <p className="text-sm text-muted-foreground">
          Nothing to settle for {payTokenSymbol(token)}.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStat
              label="Owner share"
              value={formatPayAmount(view.ownerAmount, token, "en")}
            />
            <AdminStat
              label="Fees to fee account"
              value={formatPayAmount(view.feeAmount, token, "en")}
            />
            <AdminStat
              label="Started"
              value={
                view.startedAt === undefined
                  ? "—"
                  : formatTimestamp(view.startedAt)
              }
            />
            <AdminStat
              label="Completed"
              value={
                view.completedAt === undefined
                  ? "—"
                  : formatTimestamp(view.completedAt)
              }
            />
          </div>
          {view.status.__kind__ === "pendingWallet" && (
            <p className="text-sm text-muted-foreground">
              Starts once the {payTokenSymbol(token)} receiving wallet is set.
            </p>
          )}
          {view.status.__kind__ === "toReview" && (
            <p className="text-sm text-muted-foreground">
              A settlement send has an unknown outcome. Check it in To review.
            </p>
          )}
          {view.destination && (
            <div className="space-y-1">
              <p className="admin-stat-label">Destination</p>
              <RevealText
                text={encodeAccountText(view.destination)}
                label="settlement destination"
                ocid="admin.settlement_destination"
                head={18}
                tail={10}
              />
            </div>
          )}
          {(view.lastError || view.status.__kind__ === "failed") && (
            <p className="break-words text-sm text-destructive">
              Last error:{" "}
              {view.status.__kind__ === "failed"
                ? view.status.failed
                : view.lastError}
            </p>
          )}
          {view.status.__kind__ === "sent" && view.status.sent.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              Blocks:
              {view.status.sent.map((block, i) => (
                <BlockRef
                  key={block.toString()}
                  token={token}
                  block={block}
                  ocid={`admin.settlement_block.${i + 1}`}
                />
              ))}
            </div>
          )}
          <AdminAccordion
            label="Settlement sends"
            count={view.legs.length}
            ocid="admin.settlement_legs"
          >
            {view.legs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No send yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {view.legs.map((leg, i) => (
                  <li
                    key={leg.memoText}
                    className="grid gap-2 py-3 text-xs md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-start"
                    data-ocid={`admin.settlement_legs.item.${i + 1}`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-foreground">
                        {LEG_PURPOSES[leg.purpose]}
                      </p>
                      <p className="font-mono text-muted-foreground break-all">
                        {leg.memoText}
                      </p>
                    </div>
                    <p className="font-mono tabular-nums">
                      {formatPayAmount(leg.amount, token, "en")}
                    </p>
                    <div>
                      {leg.block !== undefined ? (
                        <BlockRef
                          token={token}
                          block={leg.block}
                          ocid={`admin.settlement_legs.block.${i + 1}`}
                        />
                      ) : (
                        <span className="text-muted-foreground">No block</span>
                      )}
                    </div>
                    <StatusBadge
                      status={leg.status}
                      ocid={`admin.settlement_legs.status.${i + 1}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </AdminAccordion>
        </>
      )}
    </div>
  );
}

// --- Fee account -----------------------------------------------------------

function FeeAccountBlock({ token }: { token: PayToken }) {
  const fee = useMintFeeAccount();
  const view = fee.data;
  const row: FeeAccountTokenView | undefined = view?.tokens.find(
    (t) => t.token === token,
  );

  return (
    <div className="space-y-5" data-ocid="admin.mint_fee_account">
      <div className="flex flex-wrap items-center gap-3">
        <p className={BLOCK_LABEL}>Fee account (1/101)</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Read-only, never withdrawable
        </span>
      </div>
      {fee.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : fee.isError || !view ? (
        <Alert
          variant="destructive"
          data-ocid="admin.mint_fee_account_error_state"
        >
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {fee.error?.message || "The fee account could not be loaded."}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void fee.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[auto_1fr] sm:items-center">
            <dt className="text-muted-foreground">Account</dt>
            <dd className="min-w-0">
              <RevealText
                text={view.accountText}
                label="fee account"
                ocid="admin.mint_fee_account_text"
                head={18}
                tail={10}
              />
            </dd>
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="min-w-0">
              <RevealText
                text={view.owner.toText()}
                label="fee account owner"
                ocid="admin.mint_fee_account_owner"
                head={18}
                tail={8}
              />
            </dd>
            <dt className="text-muted-foreground">Subaccount</dt>
            <dd className="min-w-0">
              <RevealText
                text={view.subaccountHex}
                label="fee account subaccount"
                ocid="admin.mint_fee_account_subaccount"
                head={12}
                tail={8}
              />
            </dd>
          </dl>
          {row ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AdminStat
                label="Ledger balance"
                value={
                  row.balance === undefined
                    ? "Unavailable"
                    : formatPayAmount(row.balance, token, "en")
                }
                ocid="admin.mint_fee_account_balance"
              />
              <AdminStat
                label="Received"
                value={formatPayAmount(row.received, token, "en")}
              />
              <AdminStat
                label="Moved in once"
                value={formatPayAmount(row.injected, token, "en")}
              />
              <AdminStat
                label="Set aside"
                value={formatPayAmount(row.setAside, token, "en")}
              />
              <AdminStat
                label="Redistributed to LPs"
                value={formatPayAmount(row.redistributedToLps, token, "en")}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No {payTokenSymbol(token)} fee recorded yet.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Read {formatTimestamp(view.readAt)}.
          </p>
        </>
      )}
    </div>
  );
}

/** Treasury: receiving wallet, one-time settlement and fee account per token. */
export function TreasurySection() {
  const [token, setToken] = useState<PayToken>(PayToken.icp);

  return (
    <div className="space-y-10" data-ocid="admin.treasury_widget">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
          {token === PayToken.ckbtc
            ? "BTC mints use the ckBTC wallet."
            : "Per pay token."}
        </div>
        <TokenSelect
          tokens={PAY_TOKEN_ORDER}
          value={token}
          onChange={(next) => {
            if (next !== "all") setToken(next);
          }}
          label="Treasury token"
          ocid="admin.treasury_token_select"
        />
      </div>
      <ReceivingWalletBlock key={`wallet-${token}`} token={token} />
      <div className="border-t border-border" />
      <SettlementBlock token={token} />
      <div className="border-t border-border" />
      <FeeAccountBlock token={token} />
    </div>
  );
}
