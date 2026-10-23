import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PayToken } from "../backend";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import {
  type ApproveOutcome,
  approveTokenWithIdentity,
  requiredBalance,
} from "../lib/icpLedger";
import { PAY_TOKENS, formatUnits } from "../lib/token";
import { useInternetIdentity } from "./useInternetIdentity";
import { usePlug } from "./usePlug";
import { useGetCanisterPrincipal } from "./useQueries";

export type ApproveWallet = "internetIdentity" | "plug";

/** Token-generic approval: `amount` in the pay token's base units. */
export interface PayTokenApproveParams {
  token: PayToken;
  /** Purchase amount (the allowance adds that ledger's fee). */
  amount: bigint;
  /** Caller's balance of the token; when given, checked against amount + 2 fees. */
  balance?: bigint;
  /** Force a wallet; defaults to Internet Identity when signed in, else Plug. */
  wallet?: ApproveWallet;
}

/** Legacy ICP-only approval parameters. */
export interface IcpApproveParams {
  /** Purchase amount in ICP e8s (the allowance adds the 0.0001 ICP fee). */
  purchaseE8s: bigint;
  /** Caller's ICP balance in e8s; when given, checked against requiredIcpBalance. */
  balanceE8s?: bigint;
  /** Force a wallet; defaults to Internet Identity when signed in, else Plug. */
  wallet?: ApproveWallet;
}

export type ApproveParams = PayTokenApproveParams | IcpApproveParams;

function normalize(params: ApproveParams): PayTokenApproveParams {
  if ("token" in params) return params;
  return {
    token: PayToken.icp,
    amount: params.purchaseE8s,
    balance: params.balanceE8s,
    wallet: params.wallet,
  };
}

/**
 * Approve the sale canister (getCanisterPrincipal) as ICRC-2 spender on the
 * chosen pay token's ledger, for the amount plus that ledger's fee, expiring
 * in 15 minutes. Resolves with an ApproveOutcome and never rejects, so callers
 * render `outcome.message` on failure.
 */
export function useIcpApprove() {
  const { identity } = useInternetIdentity();
  const { principal: plugPrincipal, approveToken } = usePlug();
  const { data: spender } = useGetCanisterPrincipal();
  const queryClient = useQueryClient();

  const hasIdentity = !!identity && !identity.getPrincipal().isAnonymous();
  const defaultWallet: ApproveWallet | null = hasIdentity
    ? "internetIdentity"
    : plugPrincipal
      ? "plug"
      : null;

  const mutation = useMutation<ApproveOutcome, Error, ApproveParams>({
    mutationFn: async (params) => {
      const { token, amount, balance, wallet } = normalize(params);
      const { symbol, decimals, fee } = PAY_TOKENS[token];
      const t = pickDict(MESSAGES_TEXT);
      const units = (value: bigint) =>
        `${formatUnits(value, decimals)} ${symbol}`;
      if (amount <= 0n) {
        return { ok: false, message: t.approveAmountZero(symbol) };
      }
      if (!spender) {
        return { ok: false, message: t.approveSpenderLoading };
      }
      const required = requiredBalance(amount, fee);
      if (balance !== undefined && balance < required) {
        return {
          ok: false,
          message: t.approveInsufficient(
            symbol,
            units(required),
            units(fee),
            units(balance),
          ),
        };
      }
      const chosen = wallet ?? defaultWallet;
      if (chosen === "plug") {
        if (!plugPrincipal) {
          return { ok: false, message: t.approveConnectPlug(symbol) };
        }
        return approveToken(spender, token, amount);
      }
      if (chosen === "internetIdentity" && identity && hasIdentity) {
        return approveTokenWithIdentity(identity, spender, token, amount);
      }
      return { ok: false, message: t.approveConnectWallet(symbol) };
    },
    onSuccess: (outcome) => {
      if (!outcome.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });

  return { ...mutation, spender, defaultWallet };
}

/** Token-generic name for the same approval hook. */
export const usePayTokenApprove = useIcpApprove;
