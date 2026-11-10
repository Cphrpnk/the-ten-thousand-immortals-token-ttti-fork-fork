import { pickDict } from "../../i18n/core/dict";
import type { Lang } from "../../i18n/core/lang";
import { BUY_OUTCOME_TEXT } from "../../i18n/pages/buy";

export type Notice = { title: string; message: string; refunded?: boolean };

export function safePurchaseMessage(
  message: string | undefined,
  lang?: Lang,
): string {
  if (!message) {
    return pickDict(BUY_OUTCOME_TEXT, lang).fallbackMessage;
  }
  return message;
}
