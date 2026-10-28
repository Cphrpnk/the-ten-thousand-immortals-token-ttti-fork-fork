import { Settings2 } from "lucide-react";
import type { PayToken } from "../../backend";
import { usePayTokenTreasuryAccounts } from "../../hooks/useQueries";
import { payTokenSymbol } from "../../lib/token";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { GOLD_CARD } from "./styles";

function toHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Former treasury account for one ck pay token, shown read-only. */
export function PayTokenAccountCard({ token }: { token: PayToken }) {
  const symbol = payTokenSymbol(token);
  const { accounts, isLoading } = usePayTokenTreasuryAccounts();
  const current = accounts.find((item) => item.token === token)?.account;
  const ocid = `admin.${token}_account`;

  return (
    <Card className={GOLD_CARD} data-ocid={`${ocid}_card`}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 font-display text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          {symbol} Receiving Account
        </CardTitle>
        <CardDescription>
          Former {symbol} account. Funds already sent there stay where they are.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : current ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Principal</dt>
            <dd className="font-mono break-all" data-ocid={`${ocid}_owner`}>
              {current.owner.toText()}
            </dd>
            <dt className="text-muted-foreground">Subaccount</dt>
            <dd className="font-mono break-all">
              {toHex(current.subaccount) || "Default"}
            </dd>
          </dl>
        ) : (
          <p
            className="text-sm text-muted-foreground"
            data-ocid={`${ocid}_empty_state`}
          >
            Not configured
          </p>
        )}
      </CardContent>
    </Card>
  );
}
