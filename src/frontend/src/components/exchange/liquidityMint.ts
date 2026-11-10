import { DexToken, PayToken, RemainderChoice } from "../../backend";
import type {
  LiquidityMintError,
  LiquidityMintQuote,
  MintAmount,
  MintChoiceFigures,
  MintPricePreview,
} from "../../backend";
import { toIntlLocale } from "../../i18n/core";
import { pickDict } from "../../i18n/core/dict";
import { type Lang, formatNumber, getLang } from "../../i18n/core/lang";
import { AUCTION_TEXT } from "../../i18n/pages/auction";
import { BUY_LIQUIDITY_TEXT, BUY_MINT_POOL_TEXT } from "../../i18n/pages/buy";
import {
  TTTI_DECIMALS,
  formatDecimal,
  formatPayAmount,
  formatUnits,
  parseUnits,
  payTokenSymbol,
} from "../../lib/token";

import { formatUsdE8 } from "../dex/liquidityFormat";
import type { Notice } from "./purchaseOutcome";

/** A mint not executed within 5 minutes is refused by the backend. */
export const MINT_DEADLINE_NS = 5n * 60n * 1_000_000_000n;
/** Wait after the last keystroke before the preview is requested. */
export const MINT_QUOTE_DEBOUNCE_MS = 400;

/** "ttti": quantity of TTTI-T; "usd": dollars paid. */
export type MintInputMode = "ttti" | "usd";

/** What the typed amount means before any backend call. */
export type MintInput =
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "belowMinimum" }
  | { kind: "ready"; amount: MintAmount };

/**
 * Plain decimal text with a dot, from text typed with a dot or a comma;
 * null when the text is not a non-negative decimal number.
 */
export function normalizeDecimalText(text: string): string | null {
  const raw = text.trim();
  const dotted =
    raw.split(",").length === 2 && !raw.includes(".")
      ? raw.replace(",", ".")
      : raw;
  if (!/^(\d+(\.\d*)?|\.\d+)$/.test(dotted)) return null;
  const [whole = "", fraction = ""] = dotted.split(".");
  return fraction ? `${whole || "0"}.${fraction}` : whole || "0";
}

/**
 * Interpret the typed amount; more than 8 TTTI-T decimals go to the backend.
 * `minimumTtti` is the backend minimum (base units); without it the backend
 * alone refuses an amount that is too small.
 */
export function parseMintInput(
  mode: MintInputMode,
  text: string,
  minimumTtti?: bigint,
): MintInput {
  if (text.trim() === "") return { kind: "empty" };
  if (mode === "usd") {
    const usd = parseUnits(text, 8);
    if (usd === null) return { kind: "invalid" };
    if (usd === 0n) return { kind: "belowMinimum" };
    return { kind: "ready", amount: { __kind__: "usd", usd } };
  }
  const normalized = normalizeDecimalText(text);
  if (normalized === null) return { kind: "invalid" };
  const fraction = normalized.split(".")[1] ?? "";
  if (fraction.length > TTTI_DECIMALS) {
    return {
      kind: "ready",
      amount: {
        __kind__: "ttti",
        ttti: { __kind__: "decimal", decimal: normalized },
      },
    };
  }
  const baseUnits = parseUnits(normalized, TTTI_DECIMALS);
  if (baseUnits === null) return { kind: "invalid" };
  if (
    baseUnits === 0n ||
    (minimumTtti !== undefined && baseUnits < minimumTtti)
  ) {
    return { kind: "belowMinimum" };
  }
  return {
    kind: "ready",
    amount: { __kind__: "ttti", ttti: { __kind__: "baseUnits", baseUnits } },
  };
}

/** Stable key of a typed amount, for the preview cache and the debounce. */
export function mintInputKey(token: PayToken, input: MintInput): string {
  if (input.kind !== "ready") return `${token}:${input.kind}`;
  const { amount } = input;
  if (amount.__kind__ === "usd") return `${token}:usd:${amount.usd}`;
  return amount.ttti.__kind__ === "decimal"
    ? `${token}:decimal:${amount.ttti.decimal}`
    : `${token}:base:${amount.ttti.baseUnits}`;
}

/** Highest payable amount accepted at a tolerance in basis points (rounded up). */
export function maxPayWithTolerance(
  payAmount: bigint,
  toleranceBps: bigint,
): bigint {
  return (payAmount * (10_000n + toleranceBps) + 9_999n) / 10_000n;
}

/** Deadline of a mint, in nanoseconds since the epoch, 5 minutes from now. */
export function mintDeadline(): bigint {
  return BigInt(Date.now()) * 1_000_000n + MINT_DEADLINE_NS;
}

/** Scale of the locked share m reported by the backend (`mShareE6`). */
const LOCKED_SHARE_SCALE = 1_000_000;

/** Locked share m as a localized percentage; the value comes from the backend. */
export function formatLockedShare(mShareE6: bigint): string {
  return formatNumber(Number(mShareE6) / LOCKED_SHARE_SCALE, {
    style: "percent",
    maximumFractionDigits: 2,
  });
}

/** Figures of one remainder choice, as quoted by the backend. */
export function choiceFigures(
  quote: LiquidityMintQuote,
  choice: RemainderChoice,
): MintChoiceFigures {
  return choice === RemainderChoice.wallet
    ? quote.choices.wallet
    : quote.choices.pool;
}

/** TTTI-T quantity as text, up to 8 decimals. */
export function formatMintTtti(value: bigint): string {
  return `${formatUnits(value, TTTI_DECIMALS)} TTTI-T`;
}

function dexToPayToken(token: DexToken): PayToken | null {
  switch (token) {
    case DexToken.icp:
      return PayToken.icp;
    case DexToken.ckbtc:
      return PayToken.ckbtc;
    case DexToken.ckusdc:
      return PayToken.ckusdc;
    case DexToken.ckusdt:
      return PayToken.ckusdt;
    default:
      return null;
  }
}

/** Amount of a pool token, TTTI-T included, with its symbol. */
export function dexAmountText(token: DexToken, amount: bigint): string {
  const pay = dexToPayToken(token);
  return pay === null ? formatMintTtti(amount) : formatPayAmount(amount, pay);
}

function dateText(timestamp: bigint, lang: Lang): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Backend minimum mint in dollars ("1 USD") from the mint price preview;
 * undefined until the preview is loaded.
 */
export function formatMinimumUsd(
  preview: MintPricePreview | undefined,
): string | undefined {
  return preview ? `${formatUsdE8(preview.minimumMintUsdE8)} USD` : undefined;
}

/**
 * A held-ckBTC conversion refused for a typed mint reason (deadline, cap,
 * slippage, target pool); nothing was taken from the buyer.
 */
export class MintRefusedError extends Error {
  readonly refusal: LiquidityMintError;
  constructor(refusal: LiquidityMintError) {
    super(refusal.__kind__);
    this.name = "MintRefusedError";
    this.refusal = refusal;
  }
}

/** The mint was refused because the wallet terms are not accepted. */
export function isTermsRequiredError(err: LiquidityMintError): boolean {
  return err.__kind__ === "acknowledgementRequired";
}

/**
 * Title and message for a refused preview or mint, in the active language.
 * `preview` is the backend mint price preview (minimum in dollars).
 */
export function describeMintError(
  err: LiquidityMintError,
  selected: PayToken,
  stage: "preview" | "mint",
  lang?: Lang,
  preview?: MintPricePreview,
): Notice {
  const t = pickDict(BUY_LIQUIDITY_TEXT, lang);
  const title = stage === "preview" ? t.previewFailedTitle : t.mintFailedTitle;
  const symbol = payTokenSymbol(selected);
  const percent = (bps: bigint) => formatDecimal(Number(bps) / 100, 0, 2, lang);
  switch (err.__kind__) {
    case "anonymousCaller":
      return { title, message: t.errAnonymous };
    case "rateUnavailable":
      return {
        title,
        message: t.errRateUnavailable(
          payTokenSymbol(err.rateUnavailable.token),
        ),
      };
    case "rateSourcesDiverge": {
      const detail = err.rateSourcesDiverge;
      const rate = (usdE8: bigint | undefined) =>
        usdE8 === undefined ? t.rateSourceMissing : `${formatUsdE8(usdE8)} USD`;
      return {
        title,
        message: t.errRateSourcesDiverge(
          payTokenSymbol(detail.token),
          rate(detail.coinbaseUsdE8),
          rate(detail.coingeckoUsdE8),
          percent(detail.maximumBps),
        ),
      };
    }
    case "belowMinimum":
      return {
        title,
        message: t.errBelowMinimum(
          formatMintTtti(err.belowMinimum.minimumTtti),
          formatMinimumUsd(preview),
        ),
      };
    case "tooManyDecimals":
      return {
        title,
        message: t.errTooManyDecimals(
          err.tooManyDecimals.maxDecimals.toString(),
          formatMintTtti(err.tooManyDecimals.granularityTtti),
        ),
      };
    case "invalidAmount":
      return { title, message: t.errInvalidAmount };
    case "aboveCap":
      return {
        title,
        message: t.errAboveCap(
          formatMintTtti(err.aboveCap.capTtti),
          formatMintTtti(err.aboveCap.remainingTtti),
        ),
      };
    case "insufficientBalance": {
      const detail = err.insufficientBalance;
      return {
        title,
        message: t.errInsufficientBalance(
          payTokenSymbol(detail.token),
          formatPayAmount(detail.required, detail.token),
          formatPayAmount(detail.balance, detail.token),
        ),
      };
    }
    case "insufficientAllowance": {
      const detail = err.insufficientAllowance;
      return {
        title,
        message: t.errInsufficientAllowance(
          payTokenSymbol(detail.token),
          formatPayAmount(detail.required, detail.token),
          formatPayAmount(detail.allowance, detail.token),
        ),
      };
    }
    case "slippageExceeded":
      return {
        title,
        message: t.errSlippageExceeded(
          percent(err.slippageExceeded.toleranceBps),
        ),
      };
    case "invalidSlippage":
      return {
        title,
        message: t.errInvalidSlippage(percent(err.invalidSlippage.maximumBps)),
      };
    case "maxPayExceeded":
      return {
        title,
        message: t.errMaxPayExceeded(
          formatPayAmount(err.maxPayExceeded.payAmount, selected),
          formatPayAmount(err.maxPayExceeded.maxPayAmount, selected),
        ),
      };
    case "deadlineExpired":
      return { title, message: t.errDeadlineExpired };
    case "purchaseInProgress":
      return { title, message: t.errInProgress };
    case "acknowledgementRequired":
      return { title, message: t.errAcknowledgements };
    case "salesPaused":
      return { title, message: t.errSalesPaused };
    case "mintEnded":
      return { title, message: pickDict(AUCTION_TEXT, lang).mintErrEnded };
    case "dexPaused":
      return { title, message: t.errDexPaused };
    case "poolRemoved":
      return { title, message: t.errPoolRemoved(symbol) };
    case "removalAnnounced":
      return {
        title,
        message: t.errRemovalAnnounced(
          symbol,
          dateText(err.removalAnnounced.effectiveAt, lang ?? getLang()),
        ),
      };
    case "invalidTargetPool": {
      const pools = pickDict(BUY_MINT_POOL_TEXT, lang);
      const reason = err.invalidTargetPool.reason;
      switch (reason.__kind__) {
        case "unknownPool":
          return { title, message: pools.errUnknownPool };
        case "otherPair":
          return { title, message: pools.errOtherPair };
        case "removalAnnounced":
          return {
            title,
            message: pools.errPoolRemovalAnnounced(
              dateText(reason.removalAnnounced.effectiveAt, lang ?? getLang()),
            ),
          };
        default:
          return { title, message: pools.errPoolRemoved };
      }
    }
    case "poolNotFound":
      return {
        title,
        message: t.errPoolNotFound(payTokenSymbol(err.poolNotFound.token)),
      };
    case "minimumsNotSet":
      return { title, message: t.errMinimumsNotSet };
    case "ledgerError":
      return {
        title,
        message: t.errLedger(
          payTokenSymbol(err.ledgerError.token),
          err.ledgerError.message,
        ),
      };
    case "depositFailedRefunded":
      return {
        title,
        message: t.errDepositRefunded(
          err.depositFailedRefunded.mintId.toString(),
        ),
        refunded: true,
      };
    case "depositFailedRefunding":
      return {
        title: t.refundingTitle,
        message: t.errDepositRefunding(
          err.depositFailedRefunding.mintId.toString(),
        ),
      };
    case "depositFailedRefundFailed":
      return {
        title,
        message: t.errDepositRefundFailed(
          err.depositFailedRefundFailed.mintId.toString(),
        ),
      };
    default:
      return { title, message: t.errGeneric };
  }
}
