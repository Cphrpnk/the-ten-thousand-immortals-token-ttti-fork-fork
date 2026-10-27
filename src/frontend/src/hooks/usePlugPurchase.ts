import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AcknowledgementError, PayToken } from "../backend";
import type {
  Account,
  DeliveryAddressResult,
  PurchaseAcknowledgement,
  PurchaseResult,
} from "../backend";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import { type ApproveOutcome, requiredBalance } from "../lib/icpLedger";
import { PAY_TOKENS, formatUnits } from "../lib/token";
import { isSignerKind, useConnectedWallet } from "./useConnectedWallet";
import { useGetCanisterPrincipal } from "./useQueries";
import { hasAcceptedHint, rememberAcceptedHint } from "./useSignerWallet";

export interface WalletApproveParams {
  token: PayToken;
  /** Purchase amount (the allowance adds that ledger's fee). */
  amount: bigint;
  /** Caller's balance of the token; when given, checked against amount + fee. */
  balance?: bigint;
}

/**
 * Approve the sale canister on the pay token's ledger, signed by the
 * connected wallet (Plug, OISY or NFID Wallet). Never rejects.
 */
export function useWalletApprove() {
  const { principal, approve } = useConnectedWallet();
  const { data: spender } = useGetCanisterPrincipal();
  const queryClient = useQueryClient();
  return useMutation<ApproveOutcome, Error, WalletApproveParams>({
    mutationFn: async ({ token, amount, balance }) => {
      const { symbol, decimals, fee } = PAY_TOKENS[token];
      const t = pickDict(MESSAGES_TEXT);
      const units = (value: bigint) =>
        `${formatUnits(value, decimals)} ${symbol}`;
      if (amount <= 0n) {
        return { ok: false, message: t.approveAmountZero(symbol) };
      }
      if (!spender) return { ok: false, message: t.approveSpenderLoading };
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
      if (!principal) {
        return { ok: false, message: t.approveConnectWallet(symbol) };
      }
      return approve(spender, token, amount);
    },
    onSuccess: (outcome) => {
      if (!outcome.ok) return;
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

function invalidateAfterPurchase(queryClient: QueryClient) {
  for (const key of [
    "saleStatus",
    "technicalDetails",
    "conversions",
    "treasuryState",
    "walletBalance",
    "icrc1BalanceOf",
    "tokenInfo",
    "icpPrice",
    "tokenPrices",
    "deliveryAddress",
    "exactQuote",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

export interface WalletPurchaseParams {
  /** Pay token; defaults to ICP. */
  token?: PayToken;
  /** Amount in the pay token's base units. */
  payAmount?: bigint;
  /** Legacy ICP amount in e8s, used when payAmount is absent. */
  icpAmount?: bigint;
  /** Delivery account; null credits the saved address or the caller. */
  recipient?: Account | null;
  /** Exact TTTI-T base units to deliver (TTTI-T mode); null or absent in amount-paid mode. */
  tttiTarget?: bigint | null;
}

/** Purchase TTTI-T as the connected wallet (the same principal that approved). */
export function useWalletPurchase() {
  const queryClient = useQueryClient();
  const { getBackend } = useConnectedWallet();
  return useMutation<PurchaseResult, Error, WalletPurchaseParams>({
    mutationFn: async ({
      token,
      payAmount,
      icpAmount,
      recipient,
      tttiTarget,
    }) => {
      const amount = payAmount ?? icpAmount;
      if (amount === undefined) {
        throw new Error(pickDict(MESSAGES_TEXT).enterAmount);
      }
      const backend = await getBackend();
      // null recipient: the backend credits the saved delivery address,
      // otherwise the caller's own principal.
      return backend.convertDepositWith(
        token ?? PayToken.icp,
        recipient ?? null,
        amount,
        tttiTarget ?? null,
      );
    },
    onSuccess: () => {
      invalidateAfterPurchase(queryClient);
    },
  });
}

/**
 * Whether the connected wallet already accepted the six acknowledgements.
 * Plug reads it from the backend; OISY/NFID cannot query without opening
 * their window, so a hint recorded in this browser is used instead.
 */
export function useWalletPurchaseAcknowledgement(enabled: boolean) {
  const { kind, principal, getBackend } = useConnectedWallet();
  const principalText = principal?.toText();
  return useQuery<PurchaseAcknowledgement>({
    queryKey: ["purchaseAcknowledgement", kind, principalText],
    queryFn: async () => {
      if (isSignerKind(kind)) {
        return { accepted: !!principalText && hasAcceptedHint(principalText) };
      }
      const backend = await getBackend();
      return backend.getMyPurchaseAcknowledgement();
    },
    enabled: enabled && !!principal,
    retry: 1,
  });
}

/** Records acceptance as the connected wallet (the same one that buys). */
export function useWalletAcceptPurchaseAcknowledgements() {
  const queryClient = useQueryClient();
  const { principal, getBackend } = useConnectedWallet();
  return useMutation<PurchaseAcknowledgement, Error, void>({
    mutationFn: async () => {
      const backend = await getBackend();
      const result = await backend.acceptPurchaseAcknowledgements();
      if (result.__kind__ === "err") {
        throw new Error(
          result.err === AcknowledgementError.anonymousCaller
            ? pickDict(MESSAGES_TEXT).ackConnectWalletFirst
            : pickDict(MESSAGES_TEXT).ackNotRecorded,
        );
      }
      if (principal) rememberAcceptedHint(principal.toText());
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["purchaseAcknowledgement"],
      });
    },
  });
}

/**
 * Saved delivery address of the connected wallet. Loaded automatically for
 * Plug; OISY/NFID load it on request (refetch from a click) because each of
 * their calls is approved in the wallet window.
 */
export function useWalletDeliveryAddress(enabled: boolean) {
  const { kind, principal, getBackend } = useConnectedWallet();
  return useQuery<Account | null>({
    queryKey: ["deliveryAddress", kind, principal?.toText()],
    queryFn: async () => {
      const backend = await getBackend();
      return backend.getDeliveryAddress();
    },
    enabled: enabled && !!principal && kind === "plug",
    retry: kind === "plug" ? 1 : false,
  });
}

export function useWalletSetDeliveryAddress() {
  const queryClient = useQueryClient();
  const { kind, principal, getBackend } = useConnectedWallet();
  return useMutation<DeliveryAddressResult, Error, string>({
    mutationFn: async (principalText) => {
      const backend = await getBackend();
      return backend.setDeliveryAddress(principalText.trim());
    },
    onSuccess: (result) => {
      if (isSignerKind(kind) && result.__kind__ === "Ok") {
        queryClient.setQueryData<Account | null>(
          ["deliveryAddress", kind, principal?.toText()],
          result.Ok,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}

export function useWalletClearDeliveryAddress() {
  const queryClient = useQueryClient();
  const { kind, principal, getBackend } = useConnectedWallet();
  return useMutation<boolean, Error, void>({
    mutationFn: async () => {
      const backend = await getBackend();
      return backend.clearDeliveryAddress();
    },
    onSuccess: () => {
      if (isSignerKind(kind)) {
        queryClient.setQueryData<Account | null>(
          ["deliveryAddress", kind, principal?.toText()],
          null,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}
