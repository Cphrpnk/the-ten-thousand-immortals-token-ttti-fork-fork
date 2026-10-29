import { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, BuybackFunding } from "../../backend";
import { SIGNER_NAMES, useAccountSigner } from "../../hooks/useAccountSigner";
import {
  useBuybackAdminAccount,
  useBuybackFunding,
  useSetBuybackAdminAccount,
} from "../../hooks/useBuyback";
import {
  type ConnectedWalletKind,
  WALLET_NAMES,
  useConnectedWallet,
} from "../../hooks/useConnectedWallet";
import { useApproveSpender } from "../../hooks/useContactApprovals";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCanisterPrincipal } from "../../hooks/useQueries";
import { useDict } from "../../i18n/core";
import { BUYBACK_ADMIN_TEXT as T } from "../../i18n/pages/buyback";
import { WALLET_SIGNING_TEXT } from "../../i18n/pages/walletSigning";
import {
  APPROVAL_EXPIRY_PRESETS,
  type ApprovalExpiryChoice,
  needsStrongWarning,
  nowNs,
  resolveExpiresAt,
} from "../../lib/approvals";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  formatPayAmount,
  parseUnits,
} from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import {
  BuybackMassSummary,
  MassBuybackRecords,
} from "../buyback/AdminBuybackMasses";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { AdminAccordion } from "./AdminUi";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

const EXPIRY_LABEL: Record<ApprovalExpiryChoice, string> = {
  "15m": "15 minutes",
  "1h": "1 hour",
  "24h": "24 hours",
  "7d": "7 days",
  custom: "Custom date",
};

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function formatNs(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isDefaultSubaccount(sub: Uint8Array | undefined): boolean {
  return !sub || sub.every((b) => b === 0);
}

function descriptorFor(funding: BuybackFunding): TokenDescriptor {
  const pay = PAY_TOKENS[funding.token];
  return {
    canisterId: Principal.fromText(pay.ledgerCanisterId),
    name: pay.name,
    symbol: pay.symbol,
    decimals: pay.decimals,
    fee: pay.fee,
  };
}

/** Admin account that funds buybacks and receives the TTTI-T taken back. */
function AdminAccountForm() {
  const { data: current, isLoading } = useBuybackAdminAccount();
  const setAccount = useSetBuybackAdminAccount();
  const [owner, setOwner] = useState("");
  const [subaccount, setSubaccount] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One-time initialization of the draft from the loaded account.
  if (!initialized && !isLoading) {
    if (current) {
      setOwner(current.owner.toText());
      setSubaccount(toHex(current.subaccount));
    }
    setInitialized(true);
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let principal: Principal;
    try {
      principal = Principal.fromText(owner.trim());
    } catch {
      setError("Enter a valid principal.");
      return;
    }
    const hex = subaccount.trim().replace(/^0x/i, "");
    let bytes: Uint8Array | undefined;
    if (hex.length > 0) {
      if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
        setError("The subaccount must be 64 hex characters or left empty.");
        return;
      }
      bytes = new Uint8Array(
        hex.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
      );
    }
    const account: Account = bytes
      ? { owner: principal, subaccount: bytes }
      : { owner: principal };
    setAccount.mutate(account, {
      onSuccess: () => toast.success(T.accountSaved),
      onError: (err) => {
        setError(err.message || T.accountError);
        toast.error(T.accountError);
      },
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-display text-base">{T.accountLabel}</h3>
        {isLoading ? (
          <Skeleton className="h-4 w-48" />
        ) : current ? (
          <p
            className="font-mono text-xs break-all text-muted-foreground"
            data-ocid="admin.buyback_account_current"
          >
            {current.owner.toText()}
            {isDefaultSubaccount(current.subaccount)
              ? ""
              : ` · ${toHex(current.subaccount)}`}
          </p>
        ) : (
          <p
            className="text-sm text-destructive"
            data-ocid="admin.buyback_account_empty_state"
          >
            {T.accountNotSet}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="buyback-owner">Account principal</Label>
          <Input
            id="buyback-owner"
            placeholder={T.accountPlaceholder}
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            data-ocid="admin.buyback_account_owner_input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyback-subaccount">Subaccount (optional)</Label>
          <Input
            id="buyback-subaccount"
            placeholder={T.subaccountPlaceholder}
            value={subaccount}
            onChange={(e) => setSubaccount(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            data-ocid="admin.buyback_account_subaccount_input"
          />
        </div>
      </div>
      {error && (
        <Alert
          variant="destructive"
          data-ocid="admin.buyback_account_error_state"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className={`w-full sm:w-auto ${PRIMARY_GOLD}`}
        disabled={setAccount.isPending || owner.trim() === ""}
        data-ocid="admin.buyback_account_save_button"
      >
        {setAccount.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {T.savingAccount}
          </>
        ) : (
          T.saveAccount
        )}
      </Button>
    </form>
  );
}

/** Capped, expiring ICRC-2 approval of the contract on one pay token ledger. */
function FundingApproval({
  funding,
  spender,
  owner,
  onClose,
}: {
  funding: BuybackFunding;
  spender: Principal;
  owner: Principal;
  onClose: () => void;
}) {
  const token = descriptorFor(funding);
  // Signed by the wallet that holds the registered funding account.
  const mutation = useApproveSpender(spender, owner);
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState<ApprovalExpiryChoice>("24h");
  const [customDate, setCustomDate] = useState("");
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [error, setError] = useState<string | null>(null);

  const parsed = parseUnits(amount, token.decimals);
  const amountValid = parsed !== null && parsed > 0n;
  const custom = customDate ? new Date(customDate) : null;
  const expiresAt = resolveExpiresAt(choice, custom);
  const strong = needsStrongWarning({
    amount: parsed ?? 0n,
    balance: funding.balance,
    expiresAt,
  });
  const strongLines = [
    ...(amountValid && strong.overBalance
      ? ["The cap exceeds the current balance of the account."]
      : []),
    ...(strong.longLived
      ? ["This approval stays valid for more than 24 hours."]
      : []),
  ];
  const expired =
    funding.expiresAt !== undefined && funding.expiresAt <= nowNs();
  const expected = expired ? 0n : funding.allowance;
  const ready = checked && amountValid && expiresAt !== null;
  const ocid = `admin.buyback_approval.${funding.token}`;

  const send = async () => {
    setError(null);
    const at = resolveExpiresAt(choice, custom);
    if (at === null || parsed === null) {
      setError("Choose an expiration in the future.");
      setStep("edit");
      return;
    }
    // Opens the OISY / NFID window from this click, before any await.
    const release = mutation.begin();
    try {
      const outcome = await mutation.mutateAsync({
        action: "approve",
        token,
        amount: parsed,
        expiresAt: at,
        expectedAllowance: expected,
      });
      if (outcome.ok) {
        toast.success(`${token.symbol} buyback approval recorded`);
        onClose();
      } else {
        setError(outcome.message);
        setStep("edit");
      }
    } catch {
      setError("The approval was not recorded.");
      setStep("edit");
    } finally {
      release();
    }
  };

  return (
    <div
      className="mt-3 flex flex-col gap-3 rounded-lg border border-gold bg-background/40 p-3"
      data-ocid={`${ocid}.panel`}
    >
      <p className="font-display text-sm font-medium">
        Approve the contract on the {token.symbol} ledger
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
        <li>Enter the maximum amount the contract may take for buybacks.</li>
        <li>Choose an expiration. An expiration is mandatory.</li>
        <li>Read the warnings, confirm, review, then sign.</li>
      </ol>

      {step === "edit" ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocid}-amount`}>
              Maximum amount ({token.symbol})
            </Label>
            <Input
              id={`${ocid}-amount`}
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={amount !== "" && !amountValid}
              className="font-mono text-sm"
              data-ocid={`${ocid}.amount_input`}
            />
            {amount !== "" && !amountValid && (
              <p
                className="text-xs text-destructive"
                data-ocid={`${ocid}.amount_error`}
              >
                Enter an amount greater than 0.
              </p>
            )}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Expiration</legend>
            <div className="flex flex-wrap gap-2">
              {[...APPROVAL_EXPIRY_PRESETS, "custom" as const].map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={choice === c ? "default" : "outline"}
                  aria-pressed={choice === c}
                  onClick={() => setChoice(c)}
                  className="rounded-lg transition-smooth"
                  data-ocid={`${ocid}.expiry_${c}.toggle`}
                >
                  {EXPIRY_LABEL[c]}
                </Button>
              ))}
            </div>
            {choice === "custom" && (
              <Input
                type="datetime-local"
                aria-label="Custom expiration date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                aria-invalid={expiresAt === null}
                data-ocid={`${ocid}.custom_date_input`}
              />
            )}
            {expiresAt === null ? (
              <p
                className="text-xs text-destructive"
                data-ocid={`${ocid}.expiry_error`}
              >
                Choose an expiration in the future.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Expires {formatNs(expiresAt)}
              </p>
            )}
          </fieldset>
        </>
      ) : (
        parsed !== null && (
          <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <dt className="text-muted-foreground">Maximum amount</dt>
            <dd className="text-right font-mono tabular-nums">
              {formatPayAmount(parsed, funding.token, "en")}
            </dd>
            <dt className="text-muted-foreground">Expiration</dt>
            <dd className="text-right">
              {expiresAt !== null ? formatNs(expiresAt) : "—"}
            </dd>
            <dt className="text-muted-foreground">Spender</dt>
            <dd className="text-right font-mono text-xs break-all">
              {spender.toText()}
            </dd>
          </dl>
        )
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        Ledger fee for the approval:{" "}
        {formatPayAmount(token.fee, funding.token, "en")}
      </p>
      <ul
        className="callout-warning flex flex-col gap-1 px-3 py-2 text-xs"
        data-ocid={`${ocid}.warning`}
      >
        {[
          `The contract can take up to the cap from this ${token.symbol} account for buybacks until the expiration.`,
          "The new approval replaces the current one on this ledger.",
          "The approval costs a ledger fee, even if no buyback uses it.",
          "Funds taken for a completed buyback cannot be recovered.",
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {strongLines.length > 0 && (
        <ul
          className="callout-danger flex flex-col gap-1 px-3 py-2 text-xs font-medium"
          data-ocid={`${ocid}.danger_warning`}
        >
          {strongLines.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {step === "edit" && (
        <div className="flex items-start gap-2">
          <Checkbox
            id={`${ocid}-confirm`}
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5"
            data-ocid={`${ocid}.confirm_checkbox`}
          />
          <Label htmlFor={`${ocid}-confirm`} className="text-xs leading-snug">
            I approve the contract to take up to this {token.symbol} amount from
            the buyback account until the chosen expiration.
          </Label>
        </div>
      )}

      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
          data-ocid={`${ocid}.error_state`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={step === "review" ? () => setStep("edit") : onClose}
          disabled={mutation.isPending}
          className="rounded-lg"
          data-ocid={`${ocid}.cancel_button`}
        >
          {step === "review" ? "Back" : "Cancel"}
        </Button>
        {step === "edit" ? (
          <Button
            type="button"
            disabled={!ready}
            onClick={() => {
              setError(null);
              setStep("review");
            }}
            className="rounded-lg"
            data-ocid={`${ocid}.primary_button`}
          >
            Review approval
          </Button>
        ) : (
          <Button
            type="button"
            disabled={!ready || mutation.isPending}
            onClick={() => void send()}
            className={`rounded-lg ${PRIMARY_GOLD}`}
            data-ocid={`${ocid}.confirm_button`}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing…
              </>
            ) : (
              "Confirm and sign"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Buyback admin account, per-token funding and capped ICRC-2 approvals, then
 * the masses per buyer and token and the buybacks by mass.
 */
export function BuybackFundingCard() {
  const { data: account } = useBuybackAdminAccount();
  const funding = useBuybackFunding();
  const { data: spender } = useGetCanisterPrincipal();
  const ws = useDict(WALLET_SIGNING_TEXT);
  const defaultSub = !!account && isDefaultSubaccount(account.subaccount);
  const owner = account && defaultSub ? account.owner : null;
  const signer = useAccountSigner(owner);
  const connected = useConnectedWallet();
  const { identity } = useInternetIdentity();
  const [open, setOpen] = useState<string | null>(null);
  const [lastConnected, setLastConnected] = useState<Principal | null>(null);
  const [connecting, setConnecting] = useState<ConnectedWalletKind | null>(
    null,
  );
  const [connectError, setConnectError] = useState<string | null>(null);

  const signerMatches = !!owner && !!signer.kind;
  const ii = identity?.getPrincipal();
  const connectedAccount =
    lastConnected ??
    connected.principal ??
    (ii && !ii.isAnonymous() ? ii : null);

  // One click: opens the wallet window and reads the account it holds.
  const connectWallet = (kind: ConnectedWalletKind) => {
    setConnectError(null);
    setConnecting(kind);
    signer
      .connect(kind)
      .then((principal) => {
        setLastConnected(principal);
        if (owner && principal.toText() !== owner.toText()) {
          setConnectError(ws.fundingMismatch);
        }
      })
      .catch((error: unknown) => {
        setConnectError(error instanceof Error ? error.message : ws.failed);
      })
      .finally(() => setConnecting(null));
  };
  const rows = PAY_TOKEN_ORDER.map((token) =>
    funding.data?.find((f) => f.token === token),
  ).filter((f): f is BuybackFunding => f !== undefined);

  return (
    <Card className={GOLD_CARD} data-ocid="admin.buyback_funding_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Undo2 className="h-5 w-5 text-primary" />
          {T.title}
        </CardTitle>
        <CardDescription>{T.intro}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <p
          className="callout-info px-3 py-2 text-xs"
          data-ocid="admin.buyback_cycles_notice"
        >
          The ICP cycles reserve is never used for buybacks. Buybacks are paid
          only from the admin account below, within its approvals.
        </p>

        <AdminAccountForm />

        <section
          className="space-y-4"
          data-ocid="admin.buyback_funding_section"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base">{T.fundingTitle}</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={SECONDARY_GOLD}
              onClick={() => void funding.refetch()}
              disabled={funding.isFetching}
              data-ocid="admin.buyback_funding_refresh_button"
            >
              <RefreshCw
                className={`h-4 w-4 ${funding.isFetching ? "animate-spin" : ""}`}
              />
              {T.refresh}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{ws.fundingHelp}</p>
          {account &&
            (signerMatches && signer.kind ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="admin.buyback_funding_signer"
              >
                {ws.fundingSignedWith(SIGNER_NAMES[signer.kind])}
              </p>
            ) : !defaultSub ? (
              <p
                className="text-xs text-destructive"
                data-ocid="admin.buyback_funding_signer_error"
              >
                {ws.fundingSubaccount}
              </p>
            ) : (
              <div
                className="space-y-2 text-xs"
                data-ocid="admin.buyback_funding_signer_missing"
              >
                <p className="text-muted-foreground">{ws.fundingNoMatch}</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">
                    {ws.fundingExpected}
                  </dt>
                  <dd className="font-mono break-all">
                    {account.owner.toText()}
                  </dd>
                  <dt className="text-muted-foreground">
                    {ws.fundingConnected}
                  </dt>
                  <dd className="font-mono break-all">
                    {connectedAccount?.toText() ?? ws.fundingNone}
                  </dd>
                </dl>
                <div className="flex flex-wrap gap-2">
                  {(["oisy", "nfid", "plug"] as const).map((kind) => (
                    <Button
                      key={kind}
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`rounded-lg ${SECONDARY_GOLD}`}
                      disabled={connecting !== null}
                      onClick={() => connectWallet(kind)}
                      data-ocid={`admin.buyback_funding_connect_${kind}_button`}
                    >
                      {connecting === kind && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {ws.fundingConnect(WALLET_NAMES[kind])}
                    </Button>
                  ))}
                </div>
                {connectError && (
                  <p
                    className="text-destructive"
                    role="alert"
                    data-ocid="admin.buyback_funding_connect_error_state"
                  >
                    {connectError}
                  </p>
                )}
              </div>
            ))}

          {funding.isLoading ? (
            <div
              className="space-y-2"
              data-ocid="admin.buyback_funding_loading_state"
            >
              {PAY_TOKEN_ORDER.map((t) => (
                <Skeleton key={t} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : funding.isError ? (
            <Alert
              variant="destructive"
              data-ocid="admin.buyback_funding_error_state"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{T.fundingLoadError}</AlertDescription>
            </Alert>
          ) : (
            <ul className="space-y-3" data-ocid="admin.buyback_funding_list">
              {rows.map((row, i) => {
                const expired =
                  row.expiresAt !== undefined && row.expiresAt <= nowNs();
                return (
                  <li
                    key={row.token}
                    className="rounded-lg border border-border p-3"
                    data-ocid={`admin.buyback_funding_item.${i + 1}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs sm:grid-cols-[auto_1fr_auto_1fr]">
                        <dt className="text-muted-foreground">
                          {T.fundingToken}
                        </dt>
                        <dd className="font-medium">
                          {PAY_TOKENS[row.token].symbol}
                        </dd>
                        <dt className="text-muted-foreground">
                          {T.fundingBalance}
                        </dt>
                        <dd className="font-mono tabular-nums">
                          {formatPayAmount(row.balance, row.token, "en")}
                        </dd>
                        <dt className="text-muted-foreground">
                          {T.fundingAllowance}
                        </dt>
                        <dd
                          className={`font-mono tabular-nums ${expired ? "line-through" : ""}`}
                        >
                          {formatPayAmount(row.allowance, row.token, "en")}
                        </dd>
                        <dt className="text-muted-foreground">
                          {T.fundingExpires}
                        </dt>
                        <dd
                          className={expired ? "text-destructive" : undefined}
                        >
                          {expired
                            ? T.fundingExpired
                            : row.expiresAt !== undefined
                              ? formatNs(row.expiresAt)
                              : T.fundingNoExpiry}
                        </dd>
                      </dl>
                      {open !== row.token && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={`rounded-lg ${SECONDARY_GOLD}`}
                          disabled={!spender || !signerMatches}
                          onClick={() => setOpen(row.token)}
                          data-ocid={`admin.buyback_funding_approve_button.${i + 1}`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Grant approval
                        </Button>
                      )}
                    </div>
                    {row.error && (
                      <p
                        className="mt-2 text-xs text-destructive"
                        data-ocid={`admin.buyback_funding_item_error.${i + 1}`}
                      >
                        {T.fundingError(row.error)}
                      </p>
                    )}
                    {open === row.token && spender && owner && (
                      <FundingApproval
                        funding={row}
                        spender={spender}
                        owner={owner}
                        onClose={() => {
                          setOpen(null);
                          void funding.refetch();
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!account && !funding.isLoading && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle
                className="h-3.5 w-3.5 text-primary"
                aria-hidden="true"
              />
              Set the buyback funding account first; funding is read from it.
            </p>
          )}
        </section>

        <AdminAccordion
          label="Buyback masses and records"
          ocid="admin.buyback_records_accordion"
        >
          <div className="space-y-8">
            <BuybackMassSummary />
            <MassBuybackRecords />
          </div>
        </AdminAccordion>
      </CardContent>
    </Card>
  );
}
