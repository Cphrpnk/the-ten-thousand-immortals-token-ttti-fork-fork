import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { pickDict } from "../i18n/core/dict";
import { ADDRESS_BOOK_TEXT } from "../i18n/pages/addressBook";
import {
  type AllowanceState,
  buildRevokeArgs,
  buildSpenderApproveArgs,
  readAllowance,
} from "../lib/approvals";
import type { ApproveOutcome } from "../lib/icpLedger";
import type { TokenDescriptor } from "../lib/tokenRegistry";
import { type AccountSignerKind, useAccountSigner } from "./useAccountSigner";
import { useConnectedWallet } from "./useConnectedWallet";
import { useInternetIdentity } from "./useInternetIdentity";
import { useListTokens, useWalletBalances } from "./useWallet";

export type ApprovalSigner = AccountSignerKind;

/**
 * Account that signs approvals: the connected wallet (Plug, OISY, NFID
 * Wallet), otherwise the Internet Identity, with the wallet that holds it.
 */
export function useApprovalSigner(): {
  kind: ApprovalSigner | null;
  principal: Principal | undefined;
} {
  const connected = useConnectedWallet();
  const { identity } = useInternetIdentity();
  const ii = identity?.getPrincipal();
  const principal =
    connected.principal ?? (ii && !ii.isAnonymous() ? ii : undefined);
  const { kind } = useAccountSigner(principal);
  return { kind: principal ? kind : null, principal };
}

export function allowanceKey(
  ledgerId: string,
  owner: string | undefined,
  spender: string | undefined,
) {
  return ["contactAllowance", ledgerId, owner ?? "none", spender ?? "none"];
}

export interface TokenApproval {
  token: TokenDescriptor;
  allowance: AllowanceState | undefined;
  balance: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * icrc2_allowance(owner = signer, spender) on each of the 5 wallet ledgers,
 * with the signer's balance on each (for the stronger warning).
 */
export function useContactApprovals(spender: Principal | undefined) {
  const { principal: owner, kind } = useApprovalSigner();
  const tokensQuery = useListTokens();
  const tokens = tokensQuery.data ?? [];
  const ownerText = owner?.toText();
  const spenderText = spender?.toText();

  const allowances = useQueries({
    queries: tokens.map((token) => ({
      queryKey: allowanceKey(token.canisterId.toText(), ownerText, spenderText),
      queryFn: async (): Promise<AllowanceState> => {
        if (!owner || !spender) throw new Error("No account");
        return readAllowance(token.canisterId.toText(), owner, spender);
      },
      enabled: !!owner && !!spender,
    })),
  });
  const balances = useWalletBalances(
    tokens.map((t) => t.canisterId),
    owner ? { owner } : undefined,
  );

  const approvals: Array<TokenApproval> = tokens.map((token, i) => ({
    token,
    allowance: allowances[i]?.data,
    balance: balances[i]?.data,
    isLoading: tokensQuery.isLoading || !!allowances[i]?.isLoading,
    isError: !!allowances[i]?.isError,
  }));

  return {
    approvals,
    signer: kind,
    owner,
    isLoading: tokensQuery.isLoading,
    isError: tokensQuery.isError,
    refetch: () => {
      for (const q of allowances) void q.refetch();
    },
  };
}

export type ApprovalRequest =
  | {
      action: "approve";
      token: TokenDescriptor;
      amount: bigint;
      expiresAt: bigint;
      expectedAllowance: bigint;
    }
  | { action: "revoke"; token: TokenDescriptor; expectedAllowance: bigint };

/**
 * Sign an approval or a revocation (amount 0) for `spender` with the wallet
 * that holds `owner` (default: the signing account). Call `begin()` from the
 * click before mutating. Resolves to the mapped outcome (never throws for
 * ledger errors); allowance and balance queries are refreshed after success.
 */
export function useApproveSpender(
  spender: Principal | undefined,
  owner?: Principal | null,
) {
  const fallback = useApprovalSigner();
  const signer = useAccountSigner(owner ?? fallback.principal);
  const queryClient = useQueryClient();

  const mutation = useMutation<ApproveOutcome, Error, ApprovalRequest>({
    mutationFn: async (request) => {
      if (!spender) throw new Error("No spender");
      if (!signer.kind) {
        return {
          ok: false,
          message: pickDict(ADDRESS_BOOK_TEXT).signerMissing,
        };
      }
      const args =
        request.action === "approve"
          ? buildSpenderApproveArgs({
              spender,
              amount: request.amount,
              fee: request.token.fee,
              expiresAt: request.expiresAt,
              expectedAllowance: request.expectedAllowance,
            })
          : buildRevokeArgs({
              spender,
              fee: request.token.fee,
              expectedAllowance: request.expectedAllowance,
            });
      return signer.approve(request.token, args);
    },
    onSuccess: (outcome) => {
      if (!outcome.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["contactAllowance"] });
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
    },
  });
  return { ...mutation, begin: signer.begin, signerKind: signer.kind };
}
