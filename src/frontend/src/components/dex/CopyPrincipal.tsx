import type { Principal } from "@icp-sdk/core/principal";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { shortPrincipal } from "./liquidityFormat";

/** Shortened principal with a copy button for the full text. */
export function CopyPrincipal({
  principal,
  ocid,
}: {
  principal: Principal;
  ocid: string;
}) {
  const t = useDict(DEX_TEXT);
  const [copied, setCopied] = useState(false);
  const full = principal.toText();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono text-xs" title={full}>
        {shortPrincipal(principal)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => void onCopy()}
        aria-label={copied ? t.copied : t.copyPrincipal}
        data-ocid={ocid}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </Button>
    </span>
  );
}
