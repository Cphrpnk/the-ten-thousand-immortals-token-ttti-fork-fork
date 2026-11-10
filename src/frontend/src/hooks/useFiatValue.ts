import { Principal } from "@icp-sdk/core/principal";
import { useMemo } from "react";
import type { PayToken } from "../backend";
import {
  NO_VALUE,
  usdValueE8,
  useConsolidatedTttiUsdE8,
  useTokenUsdRates,
} from "../components/wallet/valuation";
import { type Lang, useLanguage } from "../i18n/core";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  TTTI_DECIMALS,
  formatUsdE8,
} from "../lib/token";
import type { TokenDescriptor } from "../lib/tokenRegistry";

/** Token whose amount can be shown in USD: ICP, ckBTC, ckUSDC, ckUSDT or TTTI-T. */
export type FiatToken = PayToken | "ttti";

/** USD unit prices (usdE8 per whole token) of the supported tokens. */
export interface FiatRates {
  /** usdE8 per whole token; null while the rate is missing or expired. */
  usdE8PerToken: (token: FiatToken) => bigint | null;
}

/** Result of {@link useFiatValue}. */
export interface FiatValue {
  /** USD value scaled by 10^8; null when the rate or the amount is missing. */
  usdE8: bigint | null;
  /** Formatted USD text in the active language, or a dash when unavailable. */
  text: string;
}

/** Pay-token descriptors, built once: the rate hook is keyed by ledger ID. */
const PAY_DESCRIPTORS: Array<TokenDescriptor> = PAY_TOKEN_ORDER.map((token) => {
  const pay = PAY_TOKENS[token];
  return {
    canisterId: Principal.fromText(pay.ledgerCanisterId),
    name: pay.name,
    symbol: pay.symbol,
    decimals: pay.decimals,
    fee: pay.fee,
  };
});

/** Decimals of the ledger unit of `token`. */
function decimalsOf(token: FiatToken): number {
  return token === "ttti" ? TTTI_DECIMALS : PAY_TOKENS[token].decimals;
}

/**
 * Current USD unit prices of every supported token. ICP, ckBTC and the
 * stablecoins come from `useTokenUsdRates`; TTTI-T comes from the
 * consolidated price. A missing or expired rate is null, never a guess.
 */
export function useFiatRates(): FiatRates {
  const payRates = useTokenUsdRates(PAY_DESCRIPTORS);
  const tttiUsdE8 = useConsolidatedTttiUsdE8();
  return useMemo(
    () => ({
      usdE8PerToken: (token: FiatToken) =>
        token === "ttti"
          ? tttiUsdE8
          : (payRates.get(PAY_TOKENS[token].ledgerCanisterId) ?? null),
    }),
    [payRates, tttiUsdE8],
  );
}

/** USD value (usdE8) of `amount` base units of `token`; null when unknown. */
export function fiatUsdE8(
  rates: FiatRates,
  token: FiatToken,
  amount: bigint | null | undefined,
): bigint | null {
  if (amount === null || amount === undefined) return null;
  const rate = rates.usdE8PerToken(token);
  if (rate === null || rate <= 0n) return null;
  return usdValueE8(amount, decimalsOf(token), rate);
}

/**
 * Plain-text USD equivalent of `amount` base units of `token`, in `lang`'s
 * number format; a dash when the rate or the amount is missing. For places a
 * component cannot be used: tooltips, input hints, aria labels.
 * Get `rates` from `useFiatRates()`.
 */
export function formatFiatText(
  rates: FiatRates,
  token: FiatToken,
  amount: bigint | null | undefined,
  lang: Lang,
): string {
  const value = fiatUsdE8(rates, token, amount);
  if (value === null) return NO_VALUE;
  // Under one cent, keep four decimals so the value does not read as $0.00.
  const tiny = value !== 0n && value < 1_000_000n && value > -1_000_000n;
  return formatUsdE8(value, tiny ? 4 : 2, lang);
}

/**
 * USD equivalent of `amount` (raw base units, using the token's decimals) in
 * the active language. Same text as {@link formatFiatText}.
 */
export function useFiatValue(
  token: FiatToken,
  amount: bigint | null | undefined,
): FiatValue {
  const rates = useFiatRates();
  const { lang } = useLanguage();
  return useMemo(
    () => ({
      usdE8: fiatUsdE8(rates, token, amount),
      text: formatFiatText(rates, token, amount, lang),
    }),
    [rates, token, amount, lang],
  );
}
