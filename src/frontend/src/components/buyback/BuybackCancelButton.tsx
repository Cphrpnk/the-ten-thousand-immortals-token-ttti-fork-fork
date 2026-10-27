import { Loader2, XCircle } from "lucide-react";
import type { Buyback } from "../../backend";
import { useCancelBuyback } from "../../hooks/useBuyback";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { buybackFailureMessage, formatTttiQuantity } from "../../lib/buyback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

/**
 * Cancel button of a buyback whose every payout attempt got a known Err, with
 * an explicit confirmation. Reports the cancelled buyback or the error text.
 */
export function BuybackCancelButton({
  buyback,
  ocid,
  className,
  size,
  disabled,
  onCancelled,
  onError,
}: {
  buyback: Buyback;
  /** data-ocid prefix, e.g. "buyback.result". */
  ocid: string;
  className?: string;
  size?: "sm" | "default";
  disabled?: boolean;
  onCancelled: (cancelled: Buyback) => void;
  onError: (message: string | null) => void;
}) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const cancel = useCancelBuyback();

  const onConfirm = async () => {
    onError(null);
    try {
      onCancelled(await cancel.mutateAsync(buyback.id));
    } catch (failure) {
      onError(buybackFailureMessage(failure, lang));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size}
          className={className}
          disabled={disabled || cancel.isPending}
          data-ocid={`${ocid}.cancel_button`}
        >
          {cancel.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {cancel.isPending ? t.cancelling : t.cancelButton}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent data-ocid={`${ocid}.cancel_dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.cancelTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.cancelDescription(formatTttiQuantity(buyback.tttiAmount, lang))}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-ocid={`${ocid}.cancel_dialog.cancel_button`}>
            {t.cancelKeep}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            data-ocid={`${ocid}.cancel_dialog.confirm_button`}
          >
            {t.cancelConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
