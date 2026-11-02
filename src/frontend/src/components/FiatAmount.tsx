import {
  type FiatToken,
  formatFiatText,
  useFiatValue,
} from "../hooks/useFiatValue";
import { cn } from "../lib/utils";

export { formatFiatText };
export type { FiatToken };

/** Props of {@link FiatAmount}. */
export interface FiatAmountProps {
  /** Token of the amount: PayToken.icp / ckbtc / ckusdc / ckusdt, or "ttti". */
  token: FiatToken;
  /** Raw amount in the token's base units (e.g. e8s); null or undefined shows a dash. */
  amount: bigint | null | undefined;
  /** Extra classes, e.g. to align or to override the discreet size. */
  className?: string;
  /** Test marker; defaults to "fiat.value". */
  ocid?: string;
}

/**
 * Discreet USD equivalent of a crypto amount, in the active language's number
 * format. Smaller and muted so the crypto amount stays dominant; a dash when
 * the rate is missing or expired. Inline, so it never moves the crypto amount.
 */
export function FiatAmount({
  token,
  amount,
  className,
  ocid = "fiat.value",
}: FiatAmountProps) {
  const { text } = useFiatValue(token, amount);
  return (
    <span
      className={cn(
        "whitespace-nowrap text-xs font-normal tabular-nums text-muted-foreground",
        className,
      )}
      data-ocid={ocid}
    >
      {text}
    </span>
  );
}

export default FiatAmount;
