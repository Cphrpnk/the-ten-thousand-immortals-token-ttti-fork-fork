import { TOKEN_NAME, TTTI_DECIMALS, TTTI_SYMBOL } from "./token";
import type { TokenDescriptor } from "./tokenRegistry";

/** True for this app's own presale token (any TTTI symbol variant). */
export function isTttiToken(token: TokenDescriptor): boolean {
  return token.symbol.toUpperCase().startsWith("TTTI");
}

/** Present TTTI-P with its canonical name, symbol and 8 decimals. */
export function normalizeToken(token: TokenDescriptor): TokenDescriptor {
  if (!isTttiToken(token)) return token;
  return {
    ...token,
    name: TOKEN_NAME,
    symbol: TTTI_SYMBOL,
    decimals: TTTI_DECIMALS,
  };
}
