import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  type DepositAlert,
  useDepositAlerts,
} from "../../hooks/useDepositAlerts";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_BTC_TEXT } from "../../i18n/pages/buy";
import { TTTI_DECIMALS, formatSats, formatTtti } from "../../lib/token";

const ALERT_DURATION_MS = 10_000;

/**
 * Mounted once in the app layout: announces a Bitcoin deposit that was
 * delivered (TTTI-T received) or refunded (ckBTC returned), on every page.
 * Renders nothing itself; the notification is a sonner toast.
 */
export function DepositAlerts() {
  const t = useDict(BUY_BTC_TEXT);
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const onAlert = useCallback(
    (alert: DepositAlert) => {
      const delivered = alert.type === "delivered";
      const amount = delivered
        ? `${formatTtti(alert.amount, TTTI_DECIMALS, lang)} TTTI-T`
        : formatSats(alert.amount, "ckBTC", lang);
      toast.success(
        delivered ? t.depositAlertDeliveredTitle : t.depositAlertRefundedTitle,
        {
          id: alert.id,
          description: delivered
            ? t.depositAlertDeliveredText(amount)
            : t.depositAlertRefundedText(amount),
          duration: ALERT_DURATION_MS,
          closeButton: true,
          action: {
            label: delivered
              ? t.depositAlertViewHistory
              : t.depositAlertViewDeposit,
            onClick: () => {
              void navigate({ to: delivered ? "/history" : "/buy" });
            },
          },
        },
      );
    },
    [t, lang, navigate],
  );

  useDepositAlerts(onAlert);
  return null;
}
