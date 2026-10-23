import { type Conversion, PayToken } from "../backend";
import { type Lang, toIntlLocale } from "../i18n/core/lang";
import {
  type BlockLinkTarget,
  blockLinkTarget,
  tttiBlockTarget,
} from "./explorer";
import {
  PAY_TOKENS,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  formatDecimal,
  formatInteger,
  formatPayAmount,
  formatTtti,
  payTokenSymbol,
  timestampToDate,
} from "./token";

/**
 * Pure helpers shared by the wallet purchase history and the admin
 * Conversions card. Quantities only; no USD value is derived here.
 */

/** Quantity paid in the pay token's base units, fee included. */
export function paidQuantity(conversion: Conversion): bigint {
  if (conversion.payAmount > 0n) return conversion.payAmount;
  // Legacy ICP rows recorded only icpAmount.
  return conversion.payToken === PayToken.icp
    ? conversion.icpAmount
    : conversion.payAmount;
}

/** Fee in the pay token's base units; null when not recorded. */
export function feeQuantity(conversion: Conversion): bigint | null {
  return conversion.feeAmount ?? null;
}

/** Net quantity exchanged (fee excluded) in base units; null when not recorded. */
export function netQuantity(conversion: Conversion): bigint | null {
  return conversion.netAmount ?? null;
}

/** Whole paid tokens and whole TTTI-T of a row, or null when either is zero. */
function wholeQuantities(
  conversion: Conversion,
): { paid: number; ttti: number } | null {
  const paidBase = paidQuantity(conversion);
  if (paidBase <= 0n || conversion.tttiAmount <= 0n) return null;
  const { decimals } = PAY_TOKENS[conversion.payToken];
  return {
    paid: Number(paidBase) / 10 ** decimals,
    ttti: Number(conversion.tttiAmount) / 10 ** TTTI_DECIMALS,
  };
}

/** TTTI-T received per 1 paid token; null when unavailable. */
export function tttiPerPaidToken(conversion: Conversion): number | null {
  const q = wholeQuantities(conversion);
  return q ? q.ttti / q.paid : null;
}

/** Paid tokens per 1 TTTI-T received; null when unavailable. */
export function paidTokenPerTtti(conversion: Conversion): number | null {
  const q = wholeQuantities(conversion);
  return q ? q.paid / q.ttti : null;
}

/** Ratio value with 2 decimals at or above 1, else 4 significant digits. */
function formatRatioValue(value: number, maxDecimals: number, lang: Lang) {
  if (value >= 1) return formatDecimal(value, 2, 2, lang);
  const digits = Math.min(
    Math.max(2, Math.ceil(-Math.log10(value)) + 3),
    maxDecimals,
  );
  return formatDecimal(value, 2, digits, lang);
}

/** Paid quantity with symbol, fee included: "1.0101 ckBTC". */
export function formatPaidQuantity(conversion: Conversion, lang: Lang): string {
  return formatPayAmount(paidQuantity(conversion), conversion.payToken, lang);
}

/** Fee with symbol, or null when not recorded. */
export function formatFeeQuantity(
  conversion: Conversion,
  lang: Lang,
): string | null {
  const fee = feeQuantity(conversion);
  return fee === null ? null : formatPayAmount(fee, conversion.payToken, lang);
}

/** Net quantity exchanged with symbol, or null when not recorded. */
export function formatNetQuantity(
  conversion: Conversion,
  lang: Lang,
): string | null {
  const net = netQuantity(conversion);
  return net === null ? null : formatPayAmount(net, conversion.payToken, lang);
}

/** TTTI-T received with symbol: "8.02 TTTI-T". */
export function formatTttiReceived(conversion: Conversion, lang: Lang): string {
  return `${formatTtti(conversion.tttiAmount, TTTI_DECIMALS, lang)} ${TTTI_SYMBOL}`;
}

/** "1 ckBTC ≈ 8.02 TTTI-T", or null when unavailable. */
export function formatTttiPerPaidToken(
  conversion: Conversion,
  lang: Lang,
): string | null {
  const ratio = tttiPerPaidToken(conversion);
  if (ratio === null) return null;
  const value = formatRatioValue(ratio, TTTI_DECIMALS, lang);
  return `${formatInteger(1, lang)} ${payTokenSymbol(conversion.payToken)} ≈ ${value} ${TTTI_SYMBOL}`;
}

/** "1 TTTI-T ≈ 0.1247 ckBTC", or null when unavailable. */
export function formatPaidTokenPerTtti(
  conversion: Conversion,
  lang: Lang,
): string | null {
  const ratio = paidTokenPerTtti(conversion);
  if (ratio === null) return null;
  const { decimals, symbol } = PAY_TOKENS[conversion.payToken];
  const value = formatRatioValue(ratio, decimals, lang);
  return `${formatInteger(1, lang)} ${TTTI_SYMBOL} ≈ ${value} ${symbol}`;
}

/** Purchase date and time in `lang`'s local format, or null when invalid. */
export function formatPurchaseDate(
  conversion: Conversion,
  lang: Lang,
): string | null {
  const date = timestampToDate(conversion.timestamp);
  if (!date) return null;
  return date.toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Ledger block index as text, or null when not recorded. */
export function formatBlockIndex(block: bigint | undefined): string | null {
  return block === undefined ? null : block.toString();
}

/** Explorer target of the payment block (ICP Dashboard of the pay token's ledger). */
export function paymentBlockTarget(
  conversion: Conversion,
): BlockLinkTarget | null {
  return conversion.paymentBlock === undefined
    ? null
    : blockLinkTarget(conversion.payToken, conversion.paymentBlock);
}

/** In-app History target of the TTTI-T mint block, or null when not recorded. */
export function mintBlockTarget(
  conversion: Conversion,
): BlockLinkTarget | null {
  return conversion.mintBlock === undefined
    ? null
    : tttiBlockTarget(conversion.mintBlock);
}
