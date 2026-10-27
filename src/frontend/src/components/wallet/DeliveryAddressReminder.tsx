import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { useConnectedWallet } from "../../hooks/useConnectedWallet";
import { useWalletDeliveryAddress } from "../../hooks/usePlugPurchase";
import { useGetDeliveryAddress } from "../../hooks/useQueries";
import { useDict } from "../../i18n/core";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import { TTTI_SYMBOL } from "../../lib/token";

interface DeliveryAddressReminderProps {
  /** Only remind once a wallet or identity is connected. */
  enabled: boolean;
}

/**
 * Small notice shown while the caller has no saved delivery address.
 * Hidden while loading, on error and once an address is set.
 * When an external wallet is active the lookup is signed by it (Plug only;
 * OISY/NFID would need their window, so the notice stays hidden for them),
 * otherwise by Internet Identity, so it always reflects the connected caller.
 */
export function DeliveryAddressReminder({
  enabled,
}: DeliveryAddressReminderProps) {
  const t = useDict(WALLET_TEXT);
  const { principal: walletPrincipal } = useConnectedWallet();
  const isExternal = !!walletPrincipal;
  const iiQuery = useGetDeliveryAddress();
  const walletQuery = useWalletDeliveryAddress(enabled && isExternal);
  const { data, isSuccess } = isExternal ? walletQuery : iiQuery;

  if (!enabled || !isSuccess || data !== null) return null;

  return (
    <aside
      className="flex flex-col gap-3 rounded-lg border border-gold bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      data-ocid="wallet.delivery_reminder.panel"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold bg-secondary text-primary">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-medium">{t.deliveryTitle}</p>
          <p className="text-xs text-muted-foreground">
            {t.deliveryBody(TTTI_SYMBOL)}
          </p>
        </div>
      </div>
      <Link
        to="/exchange"
        hash="delivery-address"
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-gold px-3 py-2 text-sm font-medium text-primary transition-smooth hover:border-gold-strong hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-center"
        data-ocid="wallet.delivery_reminder.link"
      >
        {t.deliveryAdd}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
