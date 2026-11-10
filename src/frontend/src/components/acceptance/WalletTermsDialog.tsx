import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { MESSAGES_TEXT } from "../../i18n/common/messages";
import { useDict } from "../../i18n/core/dict";
import { BUY_PAGE_TEXT } from "../../i18n/pages/buy";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { WalletTermsBlock } from "./WalletTermsBlock";
import { useWalletTerms } from "./walletTermsContext";

/** Mounted only while the dialog is open, so its state resets each time. */
function WalletTermsForm() {
  const t = useDict(BUY_PAGE_TEXT);
  const messages = useDict(MESSAGES_TEXT);
  const terms = useWalletTerms();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    try {
      await terms.accept();
      terms.close();
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : messages.ackNotRecorded,
      );
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.wtTitle}</DialogTitle>
        <DialogDescription>{t.wtDescription}</DialogDescription>
      </DialogHeader>
      <WalletTermsBlock
        checked={checked}
        onCheckedChange={setChecked}
        disabled={terms.isAccepting}
        onNavigate={terms.close}
      />
      {terms.unavailableReason && (
        <p
          className="callout-warning px-3 py-2 text-sm"
          data-ocid="wallet_terms.sign_in_notice"
        >
          {terms.unavailableReason}
        </p>
      )}
      {error && (
        <Alert variant="destructive" data-ocid="wallet_terms.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <DialogFooter>
        <Button
          type="button"
          className="min-h-11 gap-2 rounded-lg border border-gold-strong bg-gradient-primary font-semibold text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:shadow-none"
          disabled={
            !checked || terms.isAccepting || terms.unavailableReason !== null
          }
          onClick={() => void handleAccept()}
          data-ocid="wallet_terms.accept_button"
        >
          {terms.isAccepting && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {terms.isAccepting ? t.recordingAcks : t.wtAcceptButton}
        </Button>
      </DialogFooter>
    </>
  );
}

/** Wallet terms dialog, usable at any time from any page. */
export function WalletTermsDialog() {
  const terms = useWalletTerms();
  return (
    <Dialog
      open={terms.isOpen}
      onOpenChange={(next) => {
        if (!next) terms.close();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        data-ocid="wallet_terms.dialog"
      >
        <WalletTermsForm />
      </DialogContent>
    </Dialog>
  );
}
