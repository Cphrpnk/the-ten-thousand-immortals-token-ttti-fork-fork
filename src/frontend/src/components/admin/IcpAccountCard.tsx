import { Settings2 } from "lucide-react";
import { useTreasuryConfig } from "../../hooks/useQueries";
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

/** The former ICP receiving account, shown read-only. */
export function IcpAccountCard() {
  const { data: config, isLoading } = useTreasuryConfig();

  return (
    <Card className={GOLD_CARD} data-ocid="admin.treasury_card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Settings2 className="w-5 h-5 text-primary" />
          ICP Receiving Account
        </CardTitle>
        <CardDescription>
          Former ICP account. Funds already sent there stay where they are.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : config ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Principal</dt>
            <dd
              className="font-mono break-all"
              data-ocid="admin.treasury_owner"
            >
              {config.icpAccount.owner.toText()}
            </dd>
            <dt className="text-muted-foreground">Subaccount</dt>
            <dd className="font-mono break-all">
              {toHex(config.icpAccount.subaccount) || "Default"}
            </dd>
          </dl>
        ) : (
          <p
            className="text-sm text-muted-foreground"
            data-ocid="admin.treasury_empty_state"
          >
            Not configured
          </p>
        )}
      </CardContent>
    </Card>
  );
}
