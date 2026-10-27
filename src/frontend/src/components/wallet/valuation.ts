import { useMemo } from "react";
import { PayToken } from "../../backend";
import { useGetIcpPrice } from "../../hooks/useQueries";
import { useBtcUsdRate } from "../../hooks/useWallet";
import type { Lang } from "../../i18n/core";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  PRICE_SCALE,
  TOKEN_PRICE_USD,
  formatUsdE8,
} from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { isTttiToken } from "./TokenBalanceCard";

/** Fixed TTTI-T calculation value (usdE8 per whole token). */
export const TTTI_CALCULATION_USD_E8 = BigInt(TOKEN_PRICE_USD) * PRICE_SCALE;

/** Pay token whose ledger is `canisterId`; null for TTTI-T or any other. */
export function payTokenForLedger(canisterId: string): PayToken | null {
  return (
    PAY_TOKEN_ORDER.find(
      (token) => PAY_TOKENS[token].ledgerCanisterId === canisterId,
    ) ?? null
  );
}

/**
 * USD unit price (usdE8 per whole token) of each wallet token, keyed by
 * ledger canister ID; null when the rate is unavailable.
 */
export function useTokenUsdRates(
  tokens: Array<TokenDescriptor>,
): Map<string, bigint | null> {
  const { data: icpPrice } = useGetIcpPrice();
  const { data: btcRate } = useBtcUsdRate();
  const icpUsdE8 =
    icpPrice?.usable && icpPrice.usdE8 > 0n ? icpPrice.usdE8 : null;
  const btcUsdE8 = btcRate && btcRate.usdE8 > 0n ? btcRate.usdE8 : null;

  return useMemo(() => {
    const rates = new Map<string, bigint | null>();
    for (const token of tokens) {
      const id = token.canisterId.toText();
      if (isTttiToken(token)) {
        rates.set(id, TTTI_CALCULATION_USD_E8);
        continue;
      }
      switch (payTokenForLedger(id)) {
        case PayToken.icp:
          rates.set(id, icpUsdE8);
          break;
        case PayToken.ckbtc:
          rates.set(id, btcUsdE8);
          break;
        case PayToken.ckusdc:
        case PayToken.ckusdt:
          rates.set(id, PRICE_SCALE);
          break;
        default:
          rates.set(id, null);
      }
    }
    return rates;
  }, [tokens, icpUsdE8, btcUsdE8]);
}

/** USD value (usdE8) of a base-unit balance at a usdE8 unit price. */
export function usdValueE8(
  balance: bigint,
  decimals: number,
  rateUsdE8: bigint,
): bigint {
  return (balance * rateUsdE8) / 10n ** BigInt(decimals);
}

/** Unit price: 2 decimals from 1 USD, up to 4 below. */
export function formatUnitPrice(rateUsdE8: bigint, lang: Lang): string {
  return formatUsdE8(rateUsdE8, rateUsdE8 >= PRICE_SCALE ? 2 : 4, lang);
}

/** Wallet USD value with 2 decimals. */
export function formatUsdValue(valueUsdE8: bigint, lang: Lang): string {
  return formatUsdE8(valueUsdE8, 2, lang);
}

/** Shown in place of an unknown price or value. */
export const NO_VALUE = "—";
