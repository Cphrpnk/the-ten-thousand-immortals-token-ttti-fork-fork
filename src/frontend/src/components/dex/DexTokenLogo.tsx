import type { PoolTokenView } from "../../backend";
import { PAY_TOKENS, PAY_TOKEN_ORDER } from "../../lib/token";
import { PaymentTokenLogo } from "../../lib/tokenLogos";
import { FlatTokenIcon } from "../FlatTokenIcon";

/** Round logo of a pool token: TTTI-T emblem, payment token logo or initial. */
export function DexTokenLogo({ token }: { token: PoolTokenView }) {
  if (token.isTttiT) {
    return <FlatTokenIcon alt="" className="h-7 w-7" />;
  }
  const ledger = token.ledgerId.toText();
  const pay = PAY_TOKEN_ORDER.find(
    (p) => PAY_TOKENS[p].ledgerCanisterId === ledger,
  );
  if (pay) return <PaymentTokenLogo id={pay} size="sm" />;
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-mono text-xs text-foreground"
    >
      {token.symbol.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** Two overlapping token logos. */
export function DexPairLogos({
  token0,
  token1,
}: { token0: PoolTokenView; token1: PoolTokenView }) {
  return (
    <span className="flex items-center -space-x-2">
      <span className="rounded-full ring-2 ring-card">
        <DexTokenLogo token={token0} />
      </span>
      <span className="rounded-full ring-2 ring-card">
        <DexTokenLogo token={token1} />
      </span>
    </span>
  );
}
