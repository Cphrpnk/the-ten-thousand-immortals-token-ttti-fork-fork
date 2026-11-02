import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { FiatAmount } from "../FiatAmount";
import { NO_VALUE, fiatTokenOfDescriptor } from "./valuation";

/**
 * Discreet USD equivalent of an amount of a wallet token. A dash when the
 * token has no USD rate (tokens added to the swap selector).
 */
export function TokenFiat({
  token,
  amount,
  className,
  ocid,
}: {
  token: TokenDescriptor;
  amount: bigint | null | undefined;
  className?: string;
  ocid?: string;
}) {
  const fiat = fiatTokenOfDescriptor(token);
  if (fiat === null) {
    return (
      <span
        className={`whitespace-nowrap text-xs font-normal text-muted-foreground ${className ?? ""}`}
        data-ocid={ocid ?? "fiat.value"}
      >
        {NO_VALUE}
      </span>
    );
  }
  return (
    <FiatAmount
      token={fiat}
      amount={amount}
      className={className}
      ocid={ocid}
    />
  );
}
