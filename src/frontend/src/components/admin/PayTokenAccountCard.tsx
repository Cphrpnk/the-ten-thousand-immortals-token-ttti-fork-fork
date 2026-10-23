import { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  CheckCircle2,
  CircleSlash,
  Loader2,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Account, PayToken } from "../../backend";
import {
  usePayTokenTreasuryAccounts,
  useSetPayTokenAccount,
} from "../../hooks/useQueries";
import { payTokenSymbol } from "../../lib/token";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
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
import { Skeleton } from "../ui/skeleton";
import { GOLD_CARD, PRIMARY_GOLD } from "./styles";

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Treasury account receiving one ck pay token; purchases stay closed until set. */
export function PayTokenAccountCard({ token }: { token: PayToken }) {
  const symbol = payTokenSymbol(token);
  const { accounts, isLoading } = usePayTokenTreasuryAccounts();
  const setAccount = useSetPayTokenAccount();
  const current = accounts.find((item) => item.token === token)?.account;

  const [owner, setOwner] = useState("");
  const [subaccount, setSubaccount] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);

    let principal: Principal;
    try {
      principal = Principal.fromText(owner.trim());
    } catch {
      setError(`Enter a valid ${symbol} account principal.`);
      return;
    }

    const hex = subaccount.trim().replace(/^0x/i, "");
    let bytes: Uint8Array | undefined;
    if (hex.length > 0) {
      if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
        setError(
          "The subaccount must be 64 hex characters (32 bytes) or left empty.",
        );
        return;
      }
      bytes = new Uint8Array(
        hex.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
      );
    }

    const account: Account = bytes
      ? { owner: principal, subaccount: bytes }
      : { owner: principal };

    setAccount.mutate(
      { token, account },
      {
        onSuccess: () => {
          setSuccess(`${symbol} receiving account saved.`);
          toast.success(`${symbol} receiving account saved`);
        },
        onError: (err) => {
          setError(err.message || "Failed to save the account.");
          toast.error(err.message || "Failed to save the account.");
        },
      },
    );
  };

  const ocid = `admin.${token}_account`;

  return (
    <Card className={GOLD_CARD} data-ocid={`${ocid}_card`}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 font-display text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          {symbol} Receiving Account
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : current ? (
            <Badge
              variant="outline"
              className="gap-1 border-success/30 bg-success/10 text-success"
              data-ocid={`${ocid}_status`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Configured
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-destructive/30 bg-destructive/10 text-destructive"
              data-ocid={`${ocid}_status`}
            >
              <CircleSlash className="h-3.5 w-3.5" aria-hidden="true" />
              Not configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {current
            ? `The address that receives the ${symbol} paid for each purchase.`
            : `Purchases with ${symbol} stay closed until this account is set.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${token}-owner`}>
                {symbol} Account Principal
              </Label>
              <Input
                id={`${token}-owner`}
                type="text"
                placeholder="aaaaa-aa"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                data-ocid={`${ocid}_owner_input`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${token}-subaccount`}>
                Subaccount (optional, 64 hex)
              </Label>
              <Input
                id={`${token}-subaccount`}
                type="text"
                placeholder="Leave empty for the default subaccount"
                value={subaccount}
                onChange={(e) => setSubaccount(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
                data-ocid={`${ocid}_subaccount_input`}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" data-ocid={`${ocid}_error_state`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert
              className="border-primary/40 bg-primary/5"
              data-ocid={`${ocid}_success_state`}
            >
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className={`w-full sm:w-auto ${PRIMARY_GOLD}`}
            disabled={setAccount.isPending || owner.trim() === ""}
            data-ocid={`${ocid}_save_button`}
          >
            {setAccount.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings2 className="h-4 w-4" />
                Save {symbol} Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
