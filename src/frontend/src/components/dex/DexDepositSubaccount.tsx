import type { Principal } from "@icp-sdk/core/principal";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useDexDepositAccount } from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { toHex } from "../../lib/icrc3Blocks";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

/** Deposit subaccount of `owner` (public, recomputable), with a copy button. */
export function DexDepositSubaccount({
  owner,
  ocid,
}: {
  owner: Principal;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const account = useDexDepositAccount(owner);
  const [copied, setCopied] = useState(false);
  const sub = account.data?.subaccount;
  const hex = sub ? toHex(sub) : null;

  const onCopy = async () => {
    if (!hex) return;
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 text-sm" data-ocid={`${ocid}.panel`}>
      <span className="text-xs text-muted-foreground">
        {t.depositSubaccount}
      </span>
      {account.isPending ? (
        <Skeleton className="h-10 w-full" data-ocid={`${ocid}.loading_state`} />
      ) : hex ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <span className="min-w-0 flex-1 font-mono text-xs break-all">
            {hex}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => void onCopy()}
            aria-label={copied ? t.copied : t.copyDepositSubaccount}
            title={copied ? t.copied : t.copyDepositSubaccount}
            data-ocid={`${ocid}.copy_button`}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}
