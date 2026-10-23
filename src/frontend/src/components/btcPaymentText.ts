import { FEE_TEXT } from "../i18n/common/fees";
import { useDict } from "../i18n/core/dict";
import { type Lang, getLang } from "../i18n/core/lang";

/** Shared wording for paying in BTC, used by the corrected white paper, the FAQ and Technical details (English). */
export const BTC_PAYMENT_TEXT = FEE_TEXT.en.btcPayment;

export const BTC_WALLET_CONVERSION_TEXT = FEE_TEXT.en.btcWalletConversion;

/** BTC payment sentence in `lang` (default: the active language). */
export function btcPaymentText(lang: Lang = getLang()): string {
  return FEE_TEXT[lang].btcPayment;
}

/** BTC → ckBTC wallet conversion sentence in `lang` (default: the active language). */
export function btcWalletConversionText(lang: Lang = getLang()): string {
  return FEE_TEXT[lang].btcWalletConversion;
}

/** Both BTC sentences in the active language; re-renders on a language switch. */
export function useBtcPaymentText(): {
  payment: string;
  walletConversion: string;
} {
  const t = useDict(FEE_TEXT);
  return { payment: t.btcPayment, walletConversion: t.btcWalletConversion };
}
