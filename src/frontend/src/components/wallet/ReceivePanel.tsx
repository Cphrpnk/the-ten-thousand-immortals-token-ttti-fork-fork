import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Account } from "../../backend";
import { pickDict, useDict } from "../../i18n/core";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import { encodeAccountText } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { FlatTokenIcon } from "../FlatTokenIcon";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ReceivePanelProps {
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  /** Ledger canister ID preselected in the token selector. */
  initialTokenId?: string;
}

/** Receive account (shown in the wallet's Receive dialog); same for every ICRC token. */
export function ReceivePanel({
  tokens,
  account,
  initialTokenId = "",
}: ReceivePanelProps) {
  const t = useDict(WALLET_TEXT);
  const [tokenId, setTokenId] = useState<string>(initialTokenId);
  const [copied, setCopied] = useState(false);

  const selected = tokens.find((tk) => tk.canisterId.toText() === tokenId);
  const identifier = account ? encodeAccountText(account) : "";

  const handleCopy = async () => {
    if (!identifier) return;
    try {
      await navigator.clipboard.writeText(identifier);
      setCopied(true);
      toast.success(pickDict(WALLET_TEXT).toastAccountCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(pickDict(WALLET_TEXT).toastCopyFailed);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-ocid="wallet.receive_panel">
      <div className="flex flex-col gap-2">
        <Label htmlFor="receive-token">{t.token}</Label>
        <Select value={tokenId} onValueChange={setTokenId}>
          <SelectTrigger
            id="receive-token"
            className="w-full"
            data-ocid="wallet.receive_token_select"
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
        <Label htmlFor="receive-identifier">{t.account}</Label>
        <button
          id="receive-identifier"
          type="button"
          onClick={handleCopy}
          disabled={!identifier}
          title={identifier ? t.copyAccount : undefined}
          className="rounded-lg border border-gold bg-muted p-3 text-left transition-smooth hover:border-gold-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
          data-ocid="wallet.receive_identifier"
        >
          <span className="block break-all font-mono text-xs text-foreground">
            {identifier || t.receiveConnectHint}
          </span>
        </button>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground"
        onClick={handleCopy}
        disabled={!identifier}
        data-ocid="wallet.receive_copy_button"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? t.copied : t.copyAccount}
      </Button>

      {selected && (
        <p className="text-xs text-muted-foreground">
          {t.receivingTo(selected.symbol)}
        </p>
      )}
    </div>
  );
}
