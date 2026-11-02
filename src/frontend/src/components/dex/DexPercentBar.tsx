import type { Principal } from "@icp-sdk/core/principal";
import { useState } from "react";
import type { DexToken, DexTokenInfo } from "../../backend";
import { useDexBalances } from "../../hooks/useDex";
import { useWalletBalance } from "../../hooks/useWallet";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { amountForPercentWithFees } from "../../lib/token";
import { PercentBar, type PercentBarText } from "../exchange/WalletPercentBar";
import { useDexUnitsText } from "./DexFiat";

/** Ledger fees on the part pulled from the wallet: approve + transfer_from. */
const WALLET_PULL_FEE_COUNT = 2;

export interface DexPercentBarProps {
  /** DEX token whose wallet balance and DEX balance form the base. */
  token: DexTokenInfo;
  /** Account whose wallet and DEX balances are read; null when signed out. */
  owner: Principal | null | undefined;
  /** Current amount in base units, used to place the thumb for typed amounts. */
  currentAmount: bigint;
  disabled?: boolean;
  /** Called with the amount (base units) and percent of a slider or snap pick. */
  onAmountChange: (amount: bigint, percent: number) => void;
  /** data-ocid prefix; defaults to "pools.percent_bar". */
  ocidPrefix?: string;
}

/**
 * Percentage bar of the swap and add-liquidity dialogs. Base = wallet balance
 * of the token + its available DEX balance; the ledger fees apply only to the
 * part pulled from the wallet, so 100 % is wallet + DEX minus those fees.
 */
export function DexPercentBar({
  token,
  owner,
  currentAmount,
  disabled = false,
  onAmountChange,
  ocidPrefix = "pools.percent_bar",
}: DexPercentBarProps) {
  const t = useDict(DEX_TEXT);
  const unitsText = useDexUnitsText();
  const wallet = useWalletBalance(
    token.ledgerId,
    owner ? { owner } : undefined,
  );
  const balances = useDexBalances(owner);
  const [selected, setSelected] = useState<{
    token: DexToken;
    percent: number;
  } | null>(null);

  const walletAmount = wallet.data;
  const dexAmount =
    balances.data?.find((b) => b.token === token.token)?.available ?? 0n;
  const total =
    walletAmount !== undefined && balances.data !== undefined
      ? walletAmount + dexAmount
      : undefined;
  const feeCount = (walletAmount ?? 0n) > 0n ? WALLET_PULL_FEE_COUNT : 0;
  const loading = !!owner && (wallet.isLoading || balances.isLoading);

  const amountAt = (percent: number): bigint =>
    total === undefined
      ? 0n
      : amountForPercentWithFees(total, token.fee, feeCount, percent);
  const picked = selected?.token === token.token ? selected.percent : null;
  const percent =
    picked !== null && amountAt(picked) === currentAmount ? picked : null;

  const text: PercentBarText = {
    percentConnect: t.dexPercentConnect,
    percentLoading: t.dexPercentLoading,
    percentBalanceUnavailable: t.dexPercentUnavailable,
    percentNotCover: t.dexPercentNotCover,
    percentShare: t.dexPercentShare,
    percentSummary: (p, amount) => t.dexPercentSummary(p, amount),
    percentComputedOn: t.dexPercentComputedOn,
  };

  return (
    <div className="flex flex-col gap-2" data-ocid={`${ocidPrefix}.section`}>
      <PercentBar
        symbol={token.symbol}
        decimals={token.decimals}
        ledgerFee={token.fee}
        feeCount={feeCount}
        balance={total}
        balanceLoading={loading}
        walletConnected={!!owner}
        percent={percent}
        currentAmount={currentAmount}
        disabled={disabled}
        text={text}
        formatAmount={(amount) => unitsText(amount, token)}
        ocidPrefix={ocidPrefix}
        onSelect={(next) => {
          setSelected({ token: token.token, percent: next });
          onAmountChange(amountAt(next), next);
        }}
      />
      {total !== undefined && walletAmount !== undefined && (
        <p
          className="text-xs tabular-nums text-muted-foreground"
          data-ocid={`${ocidPrefix}.base`}
        >
          {t.dexPercentBase(
            unitsText(walletAmount, token),
            unitsText(dexAmount, token),
            unitsText(total, token),
          )}
        </p>
      )}
    </div>
  );
}
