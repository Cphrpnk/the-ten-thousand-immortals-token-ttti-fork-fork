import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { RedeemQuote, Redemption } from "../../backend";
import { useAccountSigner } from "../../hooks/useAccountSigner";
import { useRedeemGuarantee } from "../../hooks/useGuarantee";
import { useGetCanisterPrincipal } from "../../hooks/useQueries";
import { useListTokens, useWalletBalance } from "../../hooks/useWallet";
import {
  type AllowanceState,
  isAllowanceExpired,
  readAllowance,
} from "../../lib/approvals";
import { allowanceCovers } from "../../lib/guarantee";
import { buildApproveArgs } from "../../lib/icpLedger";
import { TTTI_SYMBOL } from "../../lib/token";

export type RedeemPhaseState = "idle" | "approving" | "redeeming";

/** TTTI-T ledger descriptor, the owner's balance and the amount that can be returned. */
export function useTttiHolding(owner: Principal | undefined) {
  const tokens = useListTokens();
  const ttti =
    tokens.data?.find((token) => token.symbol === TTTI_SYMBOL) ??
    tokens.data?.[1];
  const balance = useWalletBalance(
    ttti?.canisterId,
    owner ? { owner } : undefined,
  );
  const held = balance.data;
  const fee = ttti?.fee ?? 0n;
  /** TTTI-T the wallet can return: balance minus the ledger fee of the pull. */
  const usable = held === undefined ? undefined : held > fee ? held - fee : 0n;
  return {
    ttti,
    held,
    usable,
    isLoading: tokens.isLoading || balance.isLoading,
    isError: tokens.isError || balance.isError,
  };
}

/** Active TTTI-T allowance of the owner for the contract; 0 when expired. */
export function useTttiAllowance(owner: Principal | undefined) {
  const { ttti } = useTttiHolding(owner);
  const spender = useGetCanisterPrincipal();
  const ownerText = owner?.toText();
  const spenderText = spender.data?.toText();
  const ledgerId = ttti?.canisterId;
  return useQuery<bigint>({
    queryKey: ["icrc2Allowance", ownerText, spenderText, "guarantee"],
    queryFn: async () => {
      if (!owner || !spender.data || !ledgerId) throw new Error("No account");
      const state: AllowanceState = await readAllowance(
        ledgerId.toText(),
        owner,
        spender.data,
      );
      return isAllowanceExpired(state) ? 0n : state.allowance;
    },
    enabled: !!owner && !!spender.data && !!ledgerId,
  });
}

/**
 * Confirm flow: requests the ICRC-2 allowance when it does not cover the
 * quote (signed by the wallet that holds the account, 15 minute expiration),
 * then redeems. Failures are kept as the thrown value in `error`.
 */
export function useGuaranteeRedeem(owner: Principal | undefined) {
  const signer = useAccountSigner(owner);
  const spender = useGetCanisterPrincipal();
  const { ttti } = useTttiHolding(owner);
  const redeem = useRedeemGuarantee();
  const [phase, setPhase] = useState<RedeemPhaseState>("idle");
  const [error, setError] = useState<unknown>(null);
  const [result, setResult] = useState<Redemption | null>(null);

  const ready = !!ttti && !!spender.data;

  const confirm = async (quote: RedeemQuote, allowance: bigint | undefined) => {
    if (!ttti || !spender.data) return;
    setError(null);
    const release = signer.begin();
    try {
      if (!allowanceCovers(allowance, quote)) {
        setPhase("approving");
        const outcome = await signer.approve(
          ttti,
          buildApproveArgs(
            spender.data,
            quote.tttiAmount,
            quote.tttiTransferFee,
          ),
        );
        if (!outcome.ok) throw new Error(outcome.message);
      }
      setPhase("redeeming");
      setResult(
        await redeem.mutateAsync({
          token: quote.token,
          tttiAmount: quote.tttiAmount,
          expectedNetAmount: quote.netAmount,
        }),
      );
    } catch (failure) {
      setError(failure);
    } finally {
      release();
      setPhase("idle");
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
    setPhase("idle");
  };

  return { ready, phase, error, result, confirm, reset };
}
