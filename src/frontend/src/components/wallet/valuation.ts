import { useEffect, useMemo, useState } from "react";
import { PayToken } from "../../backend";
import type { FiatToken } from "../../hooks/useFiatValue";
import { useIcpswapTttiPrice } from "../../hooks/useIcpSwap";
import { useGetIcpPrice } from "../../hooks/useQueries";
import { usableBtcUsdE8, useBtcUsdRate } from "../../hooks/useWallet";
import type { Lang } from "../../i18n/core";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  PRICE_SCALE,
  formatUsdE8,
} from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { isTttiToken } from "./TokenBalanceCard";

/** Pay token whose ledger is `canisterId`; null for TTTI-T or any other. */
export function payTokenForLedger(canisterId: string): PayToken | null {
  return (
    PAY_TOKEN_ORDER.find(
      (token) => PAY_TOKENS[token].ledgerCanisterId === canisterId,
    ) ?? null
  );
}

/** Fiat token of a wallet token (pay token or TTTI-T); null when it has no USD rate. */
export function fiatTokenOfDescriptor(
  token: TokenDescriptor,
): FiatToken | null {
  if (isTttiToken(token)) return "ttti";
  return payTokenForLedger(token.canisterId.toText());
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
  const { data: tttiPrice } = useIcpswapTttiPrice();
  const icpUsdE8 =
    icpPrice?.usable && icpPrice.usdE8 > 0n ? icpPrice.usdE8 : null;
  // Re-check expiry every minute so a rate that lapses turns into a dash.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const btcUsdE8 = usableBtcUsdE8(btcRate, nowMs);
  // TTTI-T: the ICPSwap price, cached in the browser for 24 hours.
  const tttiUsdE8 = tttiPrice?.usdE8 ?? null;

  return useMemo(() => {
    const rates = new Map<string, bigint | null>();
    for (const token of tokens) {
      const id = token.canisterId.toText();
      if (isTttiToken(token)) {
        rates.set(id, tttiUsdE8);
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
  }, [tokens, icpUsdE8, btcUsdE8, tttiUsdE8]);
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
