import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useDict } from "../../i18n/core/dict";
import { BUY_TRANSFER_OFFER_TEXT } from "../../i18n/pages/buy";
import { copyToClipboard } from "../../lib/onramper";

interface ZeroBalanceTransferOfferProps {
  /** Symbol of the selected pay token whose balance is zero. */
  symbol: string;
  /**
   * Wallet receive address (ICRC account text). Omitted when another panel
   * on the page already shows the address (ICP: GetIcpFirstPanel).
   */
  address?: string;
}

type CopyState = "idle" | "ok" | "failed";

/** Shown on /buy only when the selected pay token's loaded balance is zero. */
export function ZeroBalanceTransferOffer({
  symbol,
  address,
}: ZeroBalanceTransferOfferProps) {
  const t = useDict(BUY_TRANSFER_OFFER_TEXT);
  const [copied, setCopied] = useState<CopyState>("idle");

  useEffect(() => {
    if (copied === "idle") return;
    const timer = window.setTimeout(() => setCopied("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (address === undefined) {
    return (
      <p
        className="px-1 text-center text-sm text-muted-foreground"
        data-ocid="exchange.transfer_offer.panel"
      >
        {t.zeroBalance(symbol)} {t.transferOrBuy(symbol)}
      </p>
    );
  }

  const handleCopy = () => {
    void copyToClipboard(address).then((ok) => setCopied(ok ? "ok" : "failed"));
  };

  return (
    <section
      aria-label={t.aria(symbol)}
      className="flex flex-col items-center gap-4 rounded-xl border border-gold-strong bg-background/60 px-5 py-6 text-center"
      data-ocid="exchange.transfer_offer.panel"
    >
      <p className="text-sm text-muted-foreground">
        {t.zeroBalance(symbol)} {t.transferTo(symbol)}
      </p>

      <button
        type="button"
        onClick={handleCopy}
        title={address}
        aria-label={t.copyAria}
        className="flex min-h-11 w-full max-w-md items-center justify-center gap-2 rounded-md border border-gold bg-card px-4 py-2 font-mono text-xs text-foreground transition-smooth hover:border-gold-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-ocid="exchange.transfer_offer.copy_button"
      >
        <span className="min-w-0 break-all">{address}</span>
        {copied === "ok" ? (
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Copy
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </button>

      <p className="min-h-5 text-xs" aria-live="polite">
        {copied === "ok" && (
          <span
            className="text-primary"
            data-ocid="exchange.transfer_offer.copy_success_state"
          >
            {t.copied}
          </span>
        )}
        {copied === "failed" && (
          <span
            className="text-destructive"
            data-ocid="exchange.transfer_offer.copy_error_state"
          >
            {t.copyFailed}
          </span>
        )}
      </p>
    </section>
  );
}
