import { TokenLogoMark } from "../../lib/tokenLogos";
import { cn } from "../../lib/utils";
import { FlatTokenIcon } from "../FlatTokenIcon";
import { payTokenForLedger } from "./valuation";

/** Round token logo: the flat TTTI icon for TTTI-T, a brand mark otherwise. */
export function TokenLogo({
  canisterId,
  symbol,
  className,
}: {
  canisterId: string;
  symbol: string;
  className?: string;
}) {
  if (symbol.toUpperCase().startsWith("TTTI")) {
    return <FlatTokenIcon className={cn("h-10 w-10", className)} alt="" />;
  }
  const payToken = payTokenForLedger(canisterId);
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold bg-muted text-primary",
        className,
      )}
      aria-hidden="true"
    >
      {payToken ? (
        <TokenLogoMark id={payToken} className="h-5 w-5" />
      ) : (
        <span className="font-mono text-xs">{symbol.slice(0, 2)}</span>
      )}
    </span>
  );
}
