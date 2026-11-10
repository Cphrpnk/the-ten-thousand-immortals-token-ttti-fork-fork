import { ScrollText } from "lucide-react";
import { useDict } from "../../i18n/core/dict";
import { BUY_PAGE_TEXT } from "../../i18n/pages/buy";
import { Button } from "../ui/button";
import { useWalletTerms } from "./walletTermsContext";

/** One-line reminder shown while a signed-in account has not accepted. */
export function WalletTermsBanner() {
  const t = useDict(BUY_PAGE_TEXT);
  const { status, open } = useWalletTerms();
  if (!status.needsAcceptance) return null;

  return (
    <aside
      className="container mx-auto w-full px-4 pt-4"
      aria-label={t.wtTitle}
      data-ocid="wallet_terms.banner"
    >
      <div className="callout-warning flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm">
          <ScrollText
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          {t.wtBannerText}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-9 rounded-lg border-gold bg-transparent text-foreground transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          onClick={open}
          data-ocid="wallet_terms.banner.open_button"
        >
          {t.wtBannerButton}
        </Button>
      </div>
    </aside>
  );
}
