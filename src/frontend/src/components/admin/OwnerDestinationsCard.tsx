import { Principal } from "@icp-sdk/core/principal";
import { Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  Account,
  OwnerDestinationResult,
  OwnerDestinationView,
} from "../../backend";
import { PayToken } from "../../backend";
import {
  ownerRevenueErrorMessage,
  useClearOwnerDestination,
  useOwnerDestinations,
  useSetOwnerDestination,
} from "../../hooks/useQueries";
import { formatPayAmount, payTokenSymbol } from "../../lib/token";
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
  AlertDialogTrigger,
} from "../ui/alert-dialog";
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
import { formatTimestamp } from "./ConversionsCard";
import { PAY_TOKEN_KEYS } from "./protocolFormat";
import { GOLD_CARD, PRIMARY_GOLD, SECONDARY_GOLD } from "./styles";

const LABEL =
  "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Account from the form, or an English error for the first invalid field. */
function parseAccount(
  principalText: string,
  subText: string,
): { account: Account } | { error: string } {
  let owner: Principal;
  try {
    owner = Principal.fromText(principalText.trim());
  } catch {
    return { error: "Enter a valid principal." };
  }
  const hex = subText.trim().replace(/^0x/i, "");
  if (hex === "") return { account: { owner } };
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    return {
      error:
        "The subaccount must be 64 hexadecimal characters (32 bytes), or left empty.",
    };
  }
  return { account: { owner, subaccount: hexToBytes(hex) } };
}

function tokenLabel(token: PayToken): string {
  const symbol = payTokenSymbol(token);
  return token === PayToken.ckbtc ? `${symbol} (BTC counted as ckBTC)` : symbol;
}

function DestinationRow({
  token,
  view,
}: { token: PayToken; view: OwnerDestinationView | undefined }) {
  const [principalText, setPrincipalText] = useState("");
  const [subText, setSubText] = useState("");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const setDestination = useSetOwnerDestination();
  const clearDestination = useClearOwnerDestination();
  const pending = setDestination.isPending || clearDestination.isPending;
  const symbol = payTokenSymbol(token);
  const ocid = (name: string) => `admin.owner_destination_${token}_${name}`;
  const current = view?.account;

  const show = (ok: boolean, text: string) => {
    setFeedback({ ok, text });
    if (ok) toast.success(text);
    else toast.error(text);
  };

  const handleResult = (result: OwnerDestinationResult, success: string) => {
    if (result.__kind__ === "ok") {
      show(true, success);
      return true;
    }
    show(false, ownerRevenueErrorMessage(result.err));
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setFeedback(null);
    const parsed = parseAccount(principalText, subText);
    if ("error" in parsed) {
      setFeedback({ ok: false, text: parsed.error });
      return;
    }
    const capturedPrincipal = principalText;
    const capturedSub = subText;
    const restore = () => {
      setPrincipalText((c) => (c === "" ? capturedPrincipal : c));
      setSubText((c) => (c === "" ? capturedSub : c));
    };
    setPrincipalText("");
    setSubText("");
    setDestination.mutate(
      { token, account: parsed.account },
      {
        onSuccess: (result) => {
          if (!handleResult(result, `${symbol} destination saved.`)) restore();
        },
        onError: (error) => {
          restore();
          show(false, error.message || "The request failed.");
        },
      },
    );
  };

  const handleClear = () => {
    if (pending) return;
    setFeedback(null);
    clearDestination.mutate(token, {
      onSuccess: (result) =>
        void handleResult(
          result,
          `${symbol} destination cleared. Owner amounts accumulate until a new destination is set.`,
        ),
      onError: (error) => show(false, error.message || "The request failed."),
    });
  };

  const principalId = `owner-destination-${token}-principal`;
  const subId = `owner-destination-${token}-subaccount`;

  return (
    <li
      className="space-y-4 border-t border-border py-5"
      data-ocid={ocid("item")}
    >
      <p className="font-mono text-sm font-semibold text-primary">
        {tokenLabel(token)}
      </p>
      <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground">Destination principal</dt>
        <dd className="font-mono break-all" data-ocid={ocid("principal")}>
          {current ? current.owner.toText() : "Not set"}
        </dd>
        <dt className="text-muted-foreground">Subaccount (hex)</dt>
        <dd className="font-mono break-all">
          {current ? toHex(current.subaccount) || "Default" : "—"}
        </dd>
        <dt className="text-muted-foreground">Set at</dt>
        <dd className="font-mono">
          {view?.setAt === undefined ? "—" : formatTimestamp(view.setAt)}
        </dd>
        <dt className="text-muted-foreground">Accumulated, not yet sent</dt>
        <dd className="font-mono tabular-nums" data-ocid={ocid("accumulated")}>
          {formatPayAmount(view?.accumulated ?? 0n, token, "en")}
        </dd>
      </dl>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3"
        noValidate
      >
        <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-64">
          <Label htmlFor={principalId}>Principal</Label>
          <Input
            id={principalId}
            value={principalText}
            onChange={(e) => setPrincipalText(e.target.value)}
            placeholder="aaaaa-aa"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            data-ocid={ocid("principal_input")}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 sm:min-w-64">
          <Label htmlFor={subId}>Subaccount (hex, optional)</Label>
          <Input
            id={subId}
            value={subText}
            onChange={(e) => setSubText(e.target.value)}
            placeholder="64 hex characters"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
            data-ocid={ocid("subaccount_input")}
          />
        </div>
        <Button
          type="submit"
          disabled={pending || principalText.trim() === ""}
          className={PRIMARY_GOLD}
          data-ocid={ocid("save_button")}
        >
          {setDestination.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {current ? "Change destination" : "Set destination"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={pending || !current}
              className={SECONDARY_GOLD}
              data-ocid={ocid("delete_button")}
            >
              {clearDestination.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid={ocid("dialog")}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Clear the {symbol} destination?
              </AlertDialogTitle>
              <AlertDialogDescription>
                New owner amounts in {symbol} accumulate in the contract and are
                sent once a destination is set again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid={ocid("cancel_button")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClear}
                data-ocid={ocid("confirm_button")}
              >
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
      {!current && !feedback && (
        <p className="text-xs text-muted-foreground">
          Leave the subaccount empty to use the default subaccount.
        </p>
      )}
      {feedback && (
        <p
          className={`text-sm ${feedback.ok ? "text-success" : "text-destructive"}`}
          data-ocid={ocid(feedback.ok ? "success_state" : "error_state")}
        >
          {feedback.text}
        </p>
      )}
    </li>
  );
}

/** Admin: owner destination account per pay token, with accumulated amounts. */
export function OwnerDestinationsCard() {
  const { data, isLoading, isError, refetch } = useOwnerDestinations();

  return (
    <Card className={GOLD_CARD} data-ocid="admin.owner_destinations_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Owner Destinations
        </CardTitle>
        <CardDescription>
          The mint collects 101 for 100; 100/101 is sent automatically, in the
          paid token, to the destination set for that token. Without a
          destination the amount accumulates and is sent once one is set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton
            className="h-64 w-full"
            data-ocid="admin.owner_destinations_loading_state"
          />
        ) : isError || !data ? (
          <Alert
            variant="destructive"
            data-ocid="admin.owner_destinations_error_state"
          >
            <AlertDescription className="flex flex-wrap items-center gap-3">
              The owner destinations could not be loaded.
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                data-ocid="admin.owner_destinations_retry_button"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className={LABEL}>Per pay token</p>
            <ul data-ocid="admin.owner_destinations_list">
              {PAY_TOKEN_KEYS.map((token) => (
                <DestinationRow
                  key={token}
                  token={token}
                  view={data.find((v) => v.token === token)}
                />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
