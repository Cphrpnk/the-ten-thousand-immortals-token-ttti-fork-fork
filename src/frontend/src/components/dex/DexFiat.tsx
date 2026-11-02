import type { Principal } from "@icp-sdk/core/principal";
import { DexToken, PayToken, type PoolTokenView } from "../../backend";
import { useFiatRates } from "../../hooks/useFiatValue";
import { useLanguage } from "../../i18n/core";
import { PAY_TOKENS, PAY_TOKEN_ORDER } from "../../lib/token";
import { FiatAmount, type FiatToken, formatFiatText } from "../FiatAmount";
import { NO_VALUE } from "../wallet/valuation";
import { formatDexUnits, formatTokenAmount } from "./dexFormat";

/** A DEX token as given by pool views (isTttiT) or DEX token infos (token). */
export interface DexFiatSource {
  ledgerId: Principal;
  isTttiT?: boolean;
  token?: DexToken;
}

/** Fiat token of a DEX token identified by its backend enum value. */
export function fiatTokenOfDex(token: DexToken): FiatToken {
  switch (token) {
    case DexToken.tttiT:
      return "ttti";
    case DexToken.icp:
      return PayToken.icp;
    case DexToken.ckbtc:
      return PayToken.ckbtc;
    case DexToken.ckusdc:
      return PayToken.ckusdc;
    case DexToken.ckusdt:
      return PayToken.ckusdt;
  }
}

/** Fiat token of a DEX token, or null when it has no supported USD rate. */
export function dexFiatToken(
  source: FiatToken | DexFiatSource,
): FiatToken | null {
  if (typeof source === "string") return source;
  if (source.isTttiT || source.token === DexToken.tttiT) return "ttti";
  const id = source.ledgerId.toText();
  const found = PAY_TOKEN_ORDER.find(
    (p: PayToken) => PAY_TOKENS[p].ledgerCanisterId === id,
  );
  return found ?? null;
}

/**
 * Discreet USD equivalent next to a crypto amount: a leading space keeps it
 * apart from the amount; a dash when the rate is missing.
 */
export function DexFiat({
  token,
  amount,
  className,
  ocid,
}: {
  token: FiatToken | DexFiatSource;
  amount: bigint | null | undefined;
  className?: string;
  ocid?: string;
}) {
  const fiat = dexFiatToken(token);
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

/** Amount with its USD equivalent on one line: the amount first, USD after. */
export function DexAmountWithFiat({
  text,
  token,
  amount,
  className,
}: {
  text: string;
  token: FiatToken | DexFiatSource;
  amount: bigint | null | undefined;
  className?: string;
}) {
  return (
    <span className={className}>
      {text} <DexFiat token={token} amount={amount} />
    </span>
  );
}

/** Plain-text USD equivalent, for hints and sentences: "(12,34 $)" or a dash. */
export function useDexFiatText(): (
  token: FiatToken | DexFiatSource,
  amount: bigint | null | undefined,
) => string {
  const rates = useFiatRates();
  const { lang } = useLanguage();
  return (token, amount) => {
    const fiat = dexFiatToken(token);
    const value =
      fiat === null ? NO_VALUE : formatFiatText(rates, fiat, amount, lang);
    return `(${value})`;
  };
}

/** Plain-text "12.5 ICP (1,23 $)" for sentences, hints and slider labels. */
export function useDexUnitsText(): (
  amount: bigint,
  token: DexFiatSource & { decimals: number; symbol: string },
) => string {
  const fiatText = useDexFiatText();
  return (amount, token) =>
    `${formatDexUnits(amount, token)} ${fiatText(token, amount)}`;
}

/** Pool-token amount with its symbol, then its discreet USD equivalent. */
export function DexTokenAmount({
  amount,
  token,
}: {
  amount: bigint;
  token: PoolTokenView;
}) {
  return (
    <>
      {formatTokenAmount(amount, token)}{" "}
      <DexFiat token={token} amount={amount} />
    </>
  );
}
