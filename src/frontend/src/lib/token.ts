import { Principal, base32Encode, getCrc32 } from "@icp-sdk/core/principal";
import { DeliveryAddressErrorCode, PayToken } from "../backend";
import type { Account } from "../backend";
import { FEE_TEXT } from "../i18n/common/fees";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { useDict } from "../i18n/core/dict";
import { type Lang, getLang, toIntlLocale } from "../i18n/core/lang";

/** TTTI-T ledger precision (current blocks). */
export const TTTI_DECIMALS = 8;
export const TTTI_DIVISOR = 10n ** BigInt(TTTI_DECIMALS);
/** Precision used by blocks written before the 8-decimal upgrade. */
export const LEGACY_TTTI_DECIMALS = 4;
export const TTTI_SYMBOL = "TTTI-T";
export const TOKEN_NAME = "The Ten Thousand Immortals";

export const ICP_DECIMALS = 8;
export const ICP_DIVISOR = 10n ** BigInt(ICP_DECIMALS);
/** ICP ledger transfer / approve fee: 0.0001 ICP. */
export const ICP_FEE_E8S = 10_000n;

/** Base price: 1 TTTI-T = 10 000 USD (before the fee). */
export const TOKEN_PRICE_USD = 10_000;
/** Fixed fee on ICP purchases (1/101 of the amount paid): 100 bps = 1%. */
export const CYCLES_FEE_BPS = 100n;
/** Fixed fee on ckBTC, ckUSDC and ckUSDT purchases: 100 bps = 1%. */
export const CK_FEE_BPS = 100n;
/** Price paid by the buyer per whole TTTI-T in ICP, fee included: 10 100 USD. */
export const BUYER_PRICE_USD =
  (TOKEN_PRICE_USD * (10_000 + Number(CYCLES_FEE_BPS))) / 10_000;
/** Minimum purchase in TTTI-T base units (0.0001 TTTI-T). */
export const MIN_PURCHASE = 10_000n;
/** Minimum ICP purchase shown to buyers, fee included: 1.01 USD. */
export const MIN_PURCHASE_USD = 1.01;
/** Minimum ckBTC / ckUSDC / ckUSDT purchase, fee included: 1.01 USD. */
export const CK_MIN_PURCHASE_USD = 1.01;
/** Of every 101 paid: 100 to the owner's destination account, 1 as the mint fee. */
export const MINT_PAID_UNITS = 101n;
export const MINT_OWNER_UNITS = 100n;
/** Mint fee halves are set aside until worth 0.001 TTTI-T (10 USD). */
export const SET_ASIDE_THRESHOLD_TTTI = 100_000n;
export const SET_ASIDE_THRESHOLD_USD = 10;
/** Native swap fee split: 70% to liquidity providers, 30% permanent liquidity. */
export const SWAP_FEE_LP_PERCENT = 70n;
export const SWAP_FEE_PERMANENT_PERCENT = 30n;
/** Cycles top-up through the CMC when the canister holds less than 20 T cycles. */
export const CYCLES_TOP_UP_THRESHOLD = 20_000_000_000_000n;
// --- Locale-aware number display ---------------------------------------------

/**
 * Language used for displayed numbers when none is given: the active language,
 * except on the admin pages, which stay English (en-US numbers).
 */
export function defaultNumberLang(): Lang {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return "en";
  }
  return getLang();
}

const decimalSeparators = new Map<string, string>();

/** Decimal separator of `lang`'s Intl locale ("." in en-US, "," in fr-FR). */
export function decimalSeparator(lang: Lang = defaultNumberLang()): string {
  const locale = toIntlLocale(lang);
  const cached = decimalSeparators.get(locale);
  if (cached !== undefined) return cached;
  const part = new Intl.NumberFormat(locale)
    .formatToParts(1.5)
    .find((p) => p.type === "decimal");
  const separator = part?.value ?? ".";
  decimalSeparators.set(locale, separator);
  return separator;
}

/** Whole number with `lang`'s grouping: 1,234 (en), 1 234 (fr), 1.234 (pt-BR). */
export function formatInteger(
  value: bigint | number,
  lang: Lang = defaultNumberLang(),
): string {
  return new Intl.NumberFormat(toIntlLocale(lang), {
    maximumFractionDigits: 0,
  }).format(value);
}

/** Decimal number in `lang`'s format with the given fraction digits. */
export function formatDecimal(
  value: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
  lang: Lang = defaultNumberLang(),
): string {
  return new Intl.NumberFormat(toIntlLocale(lang), {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/** Percentage label with 2 fixed decimals in `lang`'s format: "12.50%". */
export function formatPercent2(
  percent: number,
  lang: Lang = defaultNumberLang(),
): string {
  return `${formatDecimal(percent, 2, 2, lang)}%`;
}

/** Display label of the ICP buyer price per whole TTTI-T: "10,100 USD". */
export function buyerPriceLabel(lang: Lang = defaultNumberLang()): string {
  return `${formatInteger(BUYER_PRICE_USD, lang)} USD`;
}
/** Display label of the base price per whole TTTI-T: "10,000 USD". */
export function tokenPriceLabel(lang: Lang = defaultNumberLang()): string {
  return `${formatInteger(TOKEN_PRICE_USD, lang)} USD`;
}
/** Display label of the ICP minimum purchase: "1.01 USD". */
export function minPurchaseLabel(lang: Lang = defaultNumberLang()): string {
  return `${formatDecimal(MIN_PURCHASE_USD, 2, 2, lang)} USD`;
}
/** Display label of the ICP fee: "1%". */
export function cyclesFeeLabel(lang: Lang = defaultNumberLang()): string {
  return formatBps(CYCLES_FEE_BPS, lang);
}
/** Public price sentence shared by the buy page, landing, FAQ and white paper (English). */
export const PRICE_TEXT = FEE_TEXT.en.price;
/** Public description of the mint revenue, mint fee and cycles reserve (English). */
export const CYCLES_FEE_TEXT = FEE_TEXT.en.cyclesFee;

/** Price sentence in `lang` (default: the active language). */
export function priceText(lang: Lang = getLang()): string {
  return FEE_TEXT[lang].price;
}

/** Fee / cycles reserve sentence in `lang` (default: the active language). */
export function cyclesFeeText(lang: Lang = getLang()): string {
  return FEE_TEXT[lang].cyclesFee;
}

/** Price sentence in the active language; re-renders on a language switch. */
export function usePriceText(): string {
  return useDict(FEE_TEXT).price;
}

/** Fee / cycles reserve sentence in the active language; re-renders on a switch. */
export function useCyclesFeeText(): string {
  return useDict(FEE_TEXT).cyclesFee;
}

// --- Pay tokens ------------------------------------------------------------

export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
export const CKBTC_LEDGER_CANISTER_ID = "mxzaz-hqaaa-aaaar-qaada-cai";
export const CKUSDC_LEDGER_CANISTER_ID = "xevnm-gaaaa-aaaar-qafnq-cai";
export const CKUSDT_LEDGER_CANISTER_ID = "cngnf-vqaaa-aaaar-qag4q-cai";

/** A token accepted as payment for TTTI-T. */
export interface PayTokenDescriptor {
  token: PayToken;
  symbol: string;
  name: string;
  ledgerCanisterId: string;
  decimals: number;
  /** Ledger transfer / approve fee in the token's base units. */
  fee: bigint;
  /** Purchase fee in basis points. */
  feeBps: bigint;
  /** Minimum purchase in USD, fee included. */
  minimumUsd: number;
  /** True when the fee share funds the canister's cycles. */
  fundsCycles: boolean;
}

export const PAY_TOKENS: Record<PayToken, PayTokenDescriptor> = {
  [PayToken.icp]: {
    token: PayToken.icp,
    symbol: "ICP",
    name: "Internet Computer",
    ledgerCanisterId: ICP_LEDGER_ID,
    decimals: ICP_DECIMALS,
    fee: ICP_FEE_E8S,
    feeBps: CYCLES_FEE_BPS,
    minimumUsd: MIN_PURCHASE_USD,
    fundsCycles: true,
  },
  [PayToken.ckbtc]: {
    token: PayToken.ckbtc,
    symbol: "ckBTC",
    name: "ckBTC",
    ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
    decimals: 8,
    fee: 10n,
    feeBps: CK_FEE_BPS,
    minimumUsd: CK_MIN_PURCHASE_USD,
    fundsCycles: false,
  },
  [PayToken.ckusdc]: {
    token: PayToken.ckusdc,
    symbol: "ckUSDC",
    name: "ckUSDC",
    ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
    decimals: 6,
    fee: 10_000n,
    feeBps: CK_FEE_BPS,
    minimumUsd: CK_MIN_PURCHASE_USD,
    fundsCycles: false,
  },
  [PayToken.ckusdt]: {
    token: PayToken.ckusdt,
    symbol: "ckUSDT",
    name: "ckUSDT",
    ledgerCanisterId: CKUSDT_LEDGER_CANISTER_ID,
    decimals: 6,
    fee: 10_000n,
    feeBps: CK_FEE_BPS,
    minimumUsd: CK_MIN_PURCHASE_USD,
    fundsCycles: false,
  },
};

/** Pay tokens in display order. */
export const PAY_TOKEN_ORDER: ReadonlyArray<PayToken> = [
  PayToken.icp,
  PayToken.ckbtc,
  PayToken.ckusdc,
  PayToken.ckusdt,
];

/** Ledger canister IDs of every pay token. */
export const PAY_TOKEN_LEDGER_IDS: ReadonlyArray<string> = PAY_TOKEN_ORDER.map(
  (token) => PAY_TOKENS[token].ledgerCanisterId,
);

export function payTokenDescriptor(token: PayToken): PayTokenDescriptor {
  return PAY_TOKENS[token];
}

export function payTokenSymbol(token: PayToken): string {
  return PAY_TOKENS[token].symbol;
}

/** Buyer price per whole TTTI-T in USD for a fee in bps (10 100 at 100 bps). */
export function buyerPriceUsdFor(feeBps: bigint): bigint {
  return (BigInt(TOKEN_PRICE_USD) * (10_000n + feeBps)) / 10_000n;
}

/** Fee label for a fee in bps, e.g. 100n -> "1%". */
export function feeLabelFor(
  feeBps: bigint,
  lang: Lang = defaultNumberLang(),
): string {
  return formatBps(feeBps, lang);
}

/** Minimum purchase label for a pay token: "1.01 USD". */
export function minimumUsdLabel(
  token: PayToken,
  lang: Lang = defaultNumberLang(),
): string {
  return `${formatDecimal(PAY_TOKENS[token].minimumUsd, 2, 2, lang)} USD`;
}

/** Amount of a pay token as "1,234.56 ckUSDC". */
export function formatPayAmount(
  amount: bigint,
  token: PayToken,
  lang: Lang = defaultNumberLang(),
): string {
  const { decimals, symbol } = PAY_TOKENS[token];
  return `${formatUnits(amount, decimals, 2, lang)} ${symbol}`;
}

/**
 * TTTI-T base units bought with `payAmount` base units of a token with
 * `decimals`, at `usdE8` per whole token and a fee of `feeBps` (rounded down).
 */
export function tttiFromPay(
  payAmount: bigint,
  decimals: number,
  usdE8: bigint,
  feeBps: bigint,
): bigint {
  const denominator =
    10n ** BigInt(decimals) * buyerPriceUsdFor(feeBps) * PRICE_SCALE;
  return (payAmount * usdE8 * TTTI_DIVISOR) / denominator;
}

/**
 * Pay-token base units needed (rounded up) to receive `tttiBase` units of
 * TTTI-T, for a token with `decimals` at `usdE8` and a fee of `feeBps`.
 */
export function payForTtti(
  tttiBase: bigint,
  decimals: number,
  usdE8: bigint,
  feeBps: bigint,
): bigint {
  if (usdE8 <= 0n) return 0n;
  const numerator =
    tttiBase * buyerPriceUsdFor(feeBps) * PRICE_SCALE * 10n ** BigInt(decimals);
  return ceilDiv(numerator, usdE8 * TTTI_DIVISOR);
}

/** tttiFromPay using a pay token's descriptor. */
export function tttiFromToken(
  payAmount: bigint,
  token: PayToken,
  usdE8: bigint,
): bigint {
  const { decimals, feeBps } = PAY_TOKENS[token];
  return tttiFromPay(payAmount, decimals, usdE8, feeBps);
}

/** payForTtti using a pay token's descriptor. */
export function tokenForTtti(
  tttiBase: bigint,
  token: PayToken,
  usdE8: bigint,
): bigint {
  const { decimals, feeBps } = PAY_TOKENS[token];
  return payForTtti(tttiBase, decimals, usdE8, feeBps);
}
// --- Bitcoin deposits (BTC -> ckBTC) ----------------------------------------

export const CKBTC_MINTER_CANISTER_ID = "mqygn-kiaaa-aaaar-qaadq-cai";
export const BTC_DECIMALS = 8;
/** Minter defaults, used until getBtcDepositInfo answers. */
export const BTC_DEFAULT_MIN_CONFIRMATIONS = 6n;
export const BTC_DEFAULT_DEPOSIT_MIN_SATS = 10_000n;
export const BTC_DEFAULT_CHECK_FEE_SATS = 100n;

/** Selector-level BTC choice: paid in BTC, settled as ckBTC. */
export const BTC_PAY_OPTION = {
  id: "btc",
  symbol: "BTC",
  name: "Bitcoin",
  decimals: BTC_DECIMALS,
  feeBps: CK_FEE_BPS,
  settlesAs: PayToken.ckbtc,
} as const;

// --- Setup step 3 payment choices -------------------------------------------

/** A payment option offered in setup step 3: a pay token or BTC. */
export type SetupPayChoice = PayToken | typeof BTC_PAY_OPTION.id;

export interface SetupPayOption {
  id: SetupPayChoice;
  symbol: string;
}

/**
 * Setup payment options in display order: every pay token of PAY_TOKEN_ORDER,
 * then BTC. A token added to PAY_TOKENS / PAY_TOKEN_ORDER appears here too.
 */
export const SETUP_PAY_OPTIONS: ReadonlyArray<SetupPayOption> = [
  ...PAY_TOKEN_ORDER.map((token) => ({
    id: token as SetupPayChoice,
    symbol: PAY_TOKENS[token].symbol,
  })),
  { id: BTC_PAY_OPTION.id, symbol: BTC_PAY_OPTION.symbol },
];

/** True when `value` is one of the setup payment option ids. */
export function isSetupPayChoice(value: unknown): value is SetupPayChoice {
  return SETUP_PAY_OPTIONS.some((option) => option.id === value);
}

/** Symbol of a setup payment option: "ICP", "ckBTC", …, "BTC". */
export function setupPayChoiceSymbol(choice: SetupPayChoice): string {
  return choice === BTC_PAY_OPTION.id
    ? BTC_PAY_OPTION.symbol
    : PAY_TOKENS[choice].symbol;
}

/** Satoshis as "0.0005 BTC" (or another symbol, e.g. "ckBTC"). */
export function formatSats(
  sats: bigint,
  symbol = "BTC",
  lang: Lang = defaultNumberLang(),
): string {
  return `${formatUnits(sats, BTC_DECIMALS, 0, lang)} ${symbol}`;
}

/**
 * One-line deposit fact with the minimum deposit and required confirmations,
 * in `lang` (default: the active language).
 */
export function btcDepositText(
  minSats: bigint = BTC_DEFAULT_DEPOSIT_MIN_SATS,
  confirmations: bigint = BTC_DEFAULT_MIN_CONFIRMATIONS,
  lang: Lang = getLang(),
): string {
  return FEE_TEXT[lang].btcDeposit(
    formatSats(minSats, "BTC", lang),
    confirmations.toString(),
  );
}

/** Deposit fact with the minter defaults (English). */
export const BTC_DEPOSIT_TEXT = btcDepositText(
  BTC_DEFAULT_DEPOSIT_MIN_SATS,
  BTC_DEFAULT_MIN_CONFIRMATIONS,
  "en",
);

/** Backend nanosecond timestamp as a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint | undefined): Date | null {
  if (timestamp === undefined || timestamp <= 0n) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ICP always kept in the cycles reserve: 2 ICP. */
export const RESERVE_FLOOR_E8S = 200_000_000n;
/** Fixed-point scale of USD prices returned by the backend (usdE8). */
export const PRICE_SCALE = 10n ** 8n;

/**
 * Format base units as a decimal string in `lang`'s number format (grouping
 * and decimal separator), trimming trailing zeros. Display only: inputs use
 * unitsInputValue.
 */
export function formatUnits(
  value: bigint,
  decimals: number,
  minFractionDigits = 2,
  lang: Lang = defaultNumberLang(),
): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const divisor = 10n ** BigInt(decimals);
  const whole = formatInteger(abs / divisor, lang);
  let fraction =
    decimals > 0
      ? (abs % divisor).toString().padStart(decimals, "0").replace(/0+$/, "")
      : "";
  if (fraction.length < minFractionDigits) {
    fraction = fraction.padEnd(Math.min(minFractionDigits, decimals), "0");
  }
  const separator = decimalSeparator(lang);
  return `${negative ? "-" : ""}${whole}${fraction ? `${separator}${fraction}` : ""}`;
}

/** Parse a decimal string into base units; null when invalid or too precise. */
export function parseUnits(text: string, decimals: number): bigint | null {
  const raw = text.trim();
  // Accept ',' as the decimal separator; more than one separator stays invalid.
  const trimmed =
    raw.split(",").length === 2 && !raw.includes(".")
      ? raw.replace(",", ".")
      : raw;
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(trimmed)) return null;
  const [whole = "", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(`${whole || "0"}${fraction.padEnd(decimals, "0")}`);
}

export function formatTtti(
  value: bigint,
  decimals = TTTI_DECIMALS,
  lang: Lang = defaultNumberLang(),
): string {
  return formatUnits(value, decimals, 2, lang);
}

export function parseTtti(text: string): bigint | null {
  return parseUnits(text, TTTI_DECIMALS);
}

export function formatIcp(
  e8s: bigint,
  lang: Lang = defaultNumberLang(),
): string {
  return formatUnits(e8s, ICP_DECIMALS, 2, lang);
}

/** ICP e8s as "1,234.5678 ICP". */
export function formatIcpE8s(
  e8s: bigint,
  lang: Lang = defaultNumberLang(),
): string {
  return `${formatIcp(e8s, lang)} ICP`;
}

export function parseIcp(text: string): bigint | null {
  return parseUnits(text, ICP_DECIMALS);
}

/** Format a USD amount scaled by 10^8 (usdE8) as "$1,234.56" in `lang`'s format. */
export function formatUsdE8(
  usdE8: bigint,
  maximumFractionDigits = 4,
  lang: Lang = defaultNumberLang(),
): string {
  return new Intl.NumberFormat(toIntlLocale(lang), {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(Number(usdE8) / Number(PRICE_SCALE));
}

/** TTTI-T base units bought with `icpE8s` at `usdE8`, buyer price (fee included). */
export function tttiFromIcp(icpE8s: bigint, usdE8: bigint): bigint {
  return (icpE8s * usdE8) / (BigInt(BUYER_PRICE_USD) * PRICE_SCALE);
}

/** ICP e8s needed (rounded up) to buy `tttiBase` units at `usdE8`, fee included. */
export function icpForTtti(tttiBase: bigint, usdE8: bigint): bigint {
  if (usdE8 <= 0n) return 0n;
  const numerator = tttiBase * BigInt(BUYER_PRICE_USD) * PRICE_SCALE;
  return (numerator + usdE8 - 1n) / usdE8;
}

/** ICP network fees kept out of a wallet percentage: approve + transfer_from. */
export const WALLET_NETWORK_FEES_E8S = 2n * ICP_FEE_E8S;
/** Wallet percentages the bar snaps to. */
export const WALLET_PERCENT_SNAPS = [10, 25, 50, 75, 90, 100] as const;
const SNAP_RADIUS = 2;

/** Whole percentage in 1..100, pulled to a snap point when within 2 points. */
export function snapWalletPercent(value: number): number {
  const whole = Math.min(100, Math.max(1, Math.round(value)));
  const near = WALLET_PERCENT_SNAPS.find(
    (point) => Math.abs(point - whole) <= SNAP_RADIUS,
  );
  return near ?? whole;
}

/** ICP e8s a wallet can spend on a purchase: balance minus 2 network fees. */
export function spendableIcp(balanceE8s: bigint): bigint {
  return balanceE8s > WALLET_NETWORK_FEES_E8S
    ? balanceE8s - WALLET_NETWORK_FEES_E8S
    : 0n;
}

/** ICP e8s (rounded down) for a whole percentage of the spendable balance. */
export function icpForWalletPercent(
  balanceE8s: bigint,
  percent: number,
): bigint {
  return (spendableIcp(balanceE8s) * BigInt(Math.round(percent))) / 100n;
}

/** Ledger fees kept out of a wallet percentage: approve + transfer_from. */
export function walletNetworkFees(ledgerFee: bigint): bigint {
  return 2n * ledgerFee;
}

/** Base units a wallet can spend on a purchase: balance minus 2 ledger fees. */
export function spendableBalance(balance: bigint, ledgerFee: bigint): bigint {
  const fees = walletNetworkFees(ledgerFee);
  return balance > fees ? balance - fees : 0n;
}

/** Base units (rounded down) for a whole percentage of the spendable balance. */
export function amountForWalletPercent(
  balance: bigint,
  ledgerFee: bigint,
  percent: number,
): bigint {
  return (
    (spendableBalance(balance, ledgerFee) * BigInt(Math.round(percent))) / 100n
  );
}

/** Spendable balance of a pay token, as a decimal string in its units. */
export function formatSpendable(
  balance: bigint,
  decimals: number,
  ledgerFee: bigint,
): string {
  return formatUnits(spendableBalance(balance, ledgerFee), decimals);
}

/** Wallet-percentage amount for a pay token from its descriptor. */
export function tokenForWalletPercent(
  balance: bigint,
  token: PayToken,
  percent: number,
): bigint {
  return amountForWalletPercent(balance, PAY_TOKENS[token].fee, percent);
}

/** Spendable balance of a pay token from its descriptor. */
export function spendableToken(balance: bigint, token: PayToken): bigint {
  return spendableBalance(balance, PAY_TOKENS[token].fee);
}

/** Ledger fees kept out of a wallet percentage for `feeCount` ledger calls. */
export function networkFeesFor(ledgerFee: bigint, feeCount: number): bigint {
  return BigInt(Math.max(0, Math.round(feeCount))) * ledgerFee;
}

/** Balance minus `feeCount` ledger fees, never below 0. */
export function spendableWithFees(
  balance: bigint,
  ledgerFee: bigint,
  feeCount: number,
): bigint {
  const fees = networkFeesFor(ledgerFee, feeCount);
  return balance > fees ? balance - fees : 0n;
}

/** Base units (rounded down) for a whole percentage of balance − feeCount fees. */
export function amountForPercentWithFees(
  balance: bigint,
  ledgerFee: bigint,
  feeCount: number,
  percent: number,
): bigint {
  const pct = BigInt(Math.min(100, Math.max(0, Math.round(percent))));
  return (spendableWithFees(balance, ledgerFee, feeCount) * pct) / 100n;
}

/**
 * Whole percentage (1..100) of balance − feeCount fees that `amount`
 * represents; null when nothing is spendable, the amount is 0 or it exceeds
 * the spendable balance.
 */
export function percentForAmountWithFees(
  amount: bigint,
  balance: bigint,
  ledgerFee: bigint,
  feeCount: number,
): number | null {
  const spendable = spendableWithFees(balance, ledgerFee, feeCount);
  if (spendable <= 0n || amount <= 0n || amount > spendable) return null;
  if (amount === spendable) return 100;
  const pct = Number((amount * 100n) / spendable);
  return Math.min(100, Math.max(1, pct));
}

/** Plain transfer (one ledger fee): largest amount with amount + fee <= balance. */
export function sendableBalance(balance: bigint, ledgerFee: bigint): bigint {
  return spendableWithFees(balance, ledgerFee, 1);
}

/** Plain transfer: base units (rounded down) for a percentage of balance − fee. */
export function amountForSendPercent(
  balance: bigint,
  ledgerFee: bigint,
  percent: number,
): bigint {
  return amountForPercentWithFees(balance, ledgerFee, 1, percent);
}

/** Plain transfer: percentage of balance − fee that an amount represents. */
export function percentForSendAmount(
  amount: bigint,
  balance: bigint,
  ledgerFee: bigint,
): number | null {
  return percentForAmountWithFees(amount, balance, ledgerFee, 1);
}

/**
 * Plain transfer: percentage for a typed amount ('.' or ',' as the decimal
 * separator); null when the text is invalid or outside 0 < amount <= balance − fee.
 */
export function percentForTypedSendAmount(
  text: string,
  decimals: number,
  balance: bigint,
  ledgerFee: bigint,
): number | null {
  const amount = parseUnits(text, decimals);
  if (amount === null) return null;
  return percentForSendAmount(amount, balance, ledgerFee);
}

/** Integer division rounded up (positive operands). */
export function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) return 0n;
  return (numerator + denominator - 1n) / denominator;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * ICRC-1 textual account encoding: bare principal for a null / all-zero
 * subaccount, otherwise `principal-checksum.hexSubaccount`.
 */
export function encodeAccountText(account: Account): string {
  const ownerText = account.owner.toText();
  const sub = account.subaccount;
  if (!sub || sub.every((b) => b === 0)) return ownerText;
  const ownerBytes = account.owner.toUint8Array();
  const joined = new Uint8Array(ownerBytes.length + sub.length);
  joined.set(ownerBytes, 0);
  joined.set(sub, ownerBytes.length);
  const crc = getCrc32(joined) >>> 0;
  const crcBytes = new Uint8Array([
    (crc >>> 24) & 0xff,
    (crc >>> 16) & 0xff,
    (crc >>> 8) & 0xff,
    crc & 0xff,
  ]);
  const checksum = base32Encode(crcBytes);
  const hex = toHex(sub).replace(/^0+/, "");
  return `${ownerText}-${checksum}.${hex}`;
}

/** Shorten a long account / principal text for compact display. */
export function truncateAccountText(text: string, head = 11, tail = 6): string {
  if (text.length <= head + tail + 3) return text;
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

/** Basis points as a percentage label, e.g. 100n -> "1%". */
export function formatBps(
  bps: bigint,
  lang: Lang = defaultNumberLang(),
): string {
  return `${formatDecimal(Number(bps) / 100, 0, 2, lang)}%`;
}

/** Plain decimal string (no grouping) that parseUnits accepts. */
export function unitsInputValue(value: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const fraction = (value % divisor).toString().padStart(decimals, "0");
  return `${value / divisor}.${fraction}`.replace(/\.?0+$/, "");
}

/** USD value (usdE8) of a TTTI-T base-unit amount at the base price. */
export function tttiToUsdE8(tttiBase: bigint): bigint {
  return (tttiBase * BigInt(TOKEN_PRICE_USD) * PRICE_SCALE) / TTTI_DIVISOR;
}

/** USD paid (usdE8) for a TTTI-T base-unit amount at the buyer price (fee included). */
export function tttiToBuyerUsdE8(tttiBase: bigint): bigint {
  return (tttiBase * BigInt(BUYER_PRICE_USD) * PRICE_SCALE) / TTTI_DIVISOR;
}

/** Cycles fee part (usdE8) of the buyer price for a TTTI-T base-unit amount. */
export function cyclesFeeUsdE8(tttiBase: bigint): bigint {
  return tttiToBuyerUsdE8(tttiBase) - tttiToUsdE8(tttiBase);
}

/** Delivery-address messages in `lang` (default: the active language). */
export function deliveryAddressMessages(
  lang: Lang = getLang(),
): Record<DeliveryAddressErrorCode, string> {
  const t = MESSAGES_TEXT[lang];
  return {
    [DeliveryAddressErrorCode.empty]: t.deliveryEmpty,
    [DeliveryAddressErrorCode.accountIdentifier]: t.deliveryAccountIdentifier,
    [DeliveryAddressErrorCode.invalidPrincipal]: t.deliveryInvalidPrincipal,
    [DeliveryAddressErrorCode.anonymousPrincipal]: t.deliveryAnonymousPrincipal,
    [DeliveryAddressErrorCode.anonymousCaller]: t.deliveryAnonymousCaller,
  };
}

/** Delivery-address message for `code` in `lang` (default: the active language). */
export function deliveryAddressMessage(
  code: DeliveryAddressErrorCode,
  lang: Lang = getLang(),
): string {
  return deliveryAddressMessages(lang)[code];
}

/** English delivery-address messages. */
export const DELIVERY_ADDRESS_MESSAGES: Record<
  DeliveryAddressErrorCode,
  string
> = deliveryAddressMessages("en");

export type DeliveryAddressValidation =
  | { ok: true; principal: Principal }
  | { ok: false; code: DeliveryAddressErrorCode; message: string };

function invalid(code: DeliveryAddressErrorCode): DeliveryAddressValidation {
  return { ok: false, code, message: deliveryAddressMessage(code) };
}

/** Client-side mirror of the backend setDeliveryAddress rules. */
export function validateDeliveryAddress(
  text: string,
): DeliveryAddressValidation {
  const trimmed = text.trim();
  if (trimmed === "") return invalid(DeliveryAddressErrorCode.empty);
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return invalid(DeliveryAddressErrorCode.accountIdentifier);
  }
  let principal: Principal;
  try {
    principal = Principal.fromText(trimmed);
  } catch {
    return invalid(DeliveryAddressErrorCode.invalidPrincipal);
  }
  if (principal.isAnonymous()) {
    return invalid(DeliveryAddressErrorCode.anonymousPrincipal);
  }
  return { ok: true, principal };
}
