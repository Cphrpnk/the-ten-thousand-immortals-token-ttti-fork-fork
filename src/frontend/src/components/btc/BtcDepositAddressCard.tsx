import { Check, Copy, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { DepositKind } from "../../backend";
import { useDict } from "../../i18n/core/dict";
import { BUY_BTC_TEXT, BUY_EXPLORER_TEXT } from "../../i18n/pages/buy";
import { mempoolAddressUrl } from "../../lib/explorer";

interface BtcDepositAddressCardProps {
  address: string;
  /** Flow of the address; shows « BTC → ckBTC (wallet) » or « BTC → TTTI-T (purchase) ». */
  kind?: DepositKind;
  /** Short label above the address. */
  label?: string;
  /** Optional one-line fact under the address (e.g. BTC_DEPOSIT_TEXT). */
  note?: string;
  /** data-ocid prefix, e.g. "btc.purchase" or "btc.wallet". */
  ocidPrefix?: string;
}

/** Bitcoin deposit address with a QR code; the address copies on click. */
export function BtcDepositAddressCard({
  address,
  kind,
  label: labelProp,
  note,
  ocidPrefix = "btc.address",
}: BtcDepositAddressCardProps) {
  const t = useDict(BUY_BTC_TEXT);
  const tx = useDict(BUY_EXPLORER_TEXT);
  const label = labelProp ?? t.addressDefaultLabel;
  const flowLabel =
    kind === undefined
      ? null
      : kind === DepositKind.wallet
        ? t.flowWallet
        : t.flowPurchase;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success(t.addressCopiedToast);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t.addressCopyFailedToast);
    }
  };

  return (
    <section
      className="flex flex-col items-center gap-5 rounded-lg border border-gold bg-card p-5 sm:flex-row sm:items-start sm:gap-6"
      aria-label={label}
      data-ocid={`${ocidPrefix}.card`}
    >
      <div
        className="shrink-0 rounded-md bg-foreground p-3 text-background [.light_&]:bg-background [.light_&]:text-foreground"
        data-ocid={`${ocidPrefix}.qr`}
      >
        <QRCodeSVG
          value={`bitcoin:${address}`}
          size={148}
          level="M"
          bgColor="transparent"
          fgColor="currentColor"
          title={t.qrTitle(address)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {flowLabel ? (
          <p
            className="w-fit rounded-full border border-gold px-2.5 py-0.5 font-mono text-xs text-primary"
            data-ocid={`${ocidPrefix}.flow_label`}
          >
            {flowLabel}
          </p>
        ) : null}
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="group flex w-full min-w-0 items-start gap-3 rounded-md border border-border bg-background/60 px-3 py-3 text-left transition-smooth hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={t.copyAddressAria(address)}
          data-ocid={`${ocidPrefix}.copy_button`}
        >
          <span className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
            {address}
          </span>
          {copied ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <Copy className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary" />
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          {copied ? t.copied : t.clickToCopy}
        </p>
        {kind !== undefined ? (
          <p
            className="text-sm text-foreground/80"
            data-ocid={`${ocidPrefix}.reuse_note`}
          >
            {kind === DepositKind.wallet ? t.reuseWallet : t.reusePurchase}
          </p>
        ) : null}
        <a
          href={mempoolAddressUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          title={tx.addressOnMempool}
          className="flex w-fit items-center gap-1.5 rounded-sm text-xs text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-ocid={`${ocidPrefix}.mempool.link`}
        >
          {tx.addressOnMempool}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </section>
  );
}
