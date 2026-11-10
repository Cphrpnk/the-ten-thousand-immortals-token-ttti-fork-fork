import { ScrollText } from "lucide-react";
import { useDict } from "../../i18n/core/dict";
import { BUY_PAGE_TEXT } from "../../i18n/pages/buy";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useWalletTerms } from "./walletTermsContext";

/** Button for refusal messages: opens the wallet terms dialog. */
export function WalletTermsOpenButton({
  className,
  ocid = "wallet_terms.open_button",
}: {
  className?: string;
  ocid?: string;
}) {
  const t = useDict(BUY_PAGE_TEXT);
  const { open } = useWalletTerms();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={cn(
        "rounded-lg border-gold bg-transparent text-foreground transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onClick={open}
      data-ocid={ocid}
    >
      <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
      {t.wtOpenRefusal}
    </Button>
  );
}
