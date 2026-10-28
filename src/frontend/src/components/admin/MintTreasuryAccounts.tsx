import { Landmark, Lock } from "lucide-react";
import type { Account, MintTreasuryAccount } from "../../backend";
import { useMintTreasuryAccounts } from "../../hooks/useQueries";
import { formatPayAmount, payTokenSymbol } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { PAY_TOKEN_KEYS } from "./protocolFormat";
import { GOLD_CARD } from "./styles";

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function AccountRows({ account, ocid }: { account: Account; ocid: string }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
      <dt className="text-muted-foreground">Principal</dt>
      <dd className="font-mono break-all" data-ocid={ocid}>
        {account.owner.toText()}
      </dd>
      <dt className="text-muted-foreground">Subaccount</dt>
      <dd className="font-mono break-all">
        {toHex(account.subaccount) || "Default"}
      </dd>
    </dl>
  );
}

function TreasuryCard({ item }: { item: MintTreasuryAccount }) {
  const symbol = payTokenSymbol(item.token);
  const ocid = `admin.${item.token}_treasury`;
  return (
    <Card className={GOLD_CARD} data-ocid={`${ocid}_card`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Landmark className="h-5 w-5 text-primary" />
          {symbol} Mint Treasury
        </CardTitle>
        <CardDescription>
          Internal account of the contract. New {symbol} mint payments arrive
          here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 border-l border-border pl-4">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p
            className="text-lg font-semibold tracking-tight font-mono tabular-nums"
            data-ocid={`${ocid}_balance`}
          >
            {item.balance === undefined
              ? "Unavailable"
              : formatPayAmount(item.balance, item.token, "en")}
          </p>
        </div>
        <AccountRows account={item.account} ocid={`${ocid}_owner`} />
        <div className="space-y-1.5" data-ocid={`${ocid}_legacy`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Former external account (read-only)
          </p>
          {item.legacyExternalAccount ? (
            <>
              <AccountRows
                account={item.legacyExternalAccount}
                ocid={`${ocid}_legacy_owner`}
              />
              <p className="text-xs text-muted-foreground">
                Funds already sent there stay where they are.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">None</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Internal mint treasury accounts with balances; no withdrawal path. */
export function MintTreasuryAccounts() {
  const { data, isLoading, isError, refetch } = useMintTreasuryAccounts();

  if (isLoading) {
    return (
      <div
        className="grid gap-10 lg:grid-cols-2"
        data-ocid="admin.mint_treasury_loading_state"
      >
        {PAY_TOKEN_KEYS.map((token) => (
          <Skeleton key={token} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive" data-ocid="admin.mint_treasury_error_state">
        <AlertDescription className="flex flex-wrap items-center gap-3">
          The mint treasury accounts could not be loaded.
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
            data-ocid="admin.mint_treasury_retry_button"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const ordered = PAY_TOKEN_KEYS.flatMap((token) =>
    data.filter((item) => item.token === token),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {ordered.map((item) => (
          <TreasuryCard key={item.token} item={item} />
        ))}
      </div>
      <p
        className="flex items-start gap-2 text-xs text-muted-foreground"
        data-ocid="admin.mint_treasury_note"
      >
        <Lock
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        These accounts have no withdrawal function and cannot be changed. The
        funds they held are emptied once to the owner destinations, after the
        cycles reserve is topped up to 2 ICP.
      </p>
    </div>
  );
}
