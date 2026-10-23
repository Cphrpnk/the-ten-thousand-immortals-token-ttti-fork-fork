import { loadConfig } from "@caffeineai/core-infrastructure";
import type { ActorSubclass } from "@icp-sdk/core/agent";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AcknowledgementError, Backend, PayToken } from "../backend";
import type {
  Account,
  DeliveryAddressResult,
  PurchaseAcknowledgement,
  PurchaseResult,
} from "../backend";
import { type _SERVICE, idlFactory } from "../declarations/backend.did";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import {
  ensurePlugSession,
  getPlugSessionVersion,
  plugWhitelist,
  usePlug,
} from "./usePlug";

const unsupportedBlob = async (): Promise<never> => {
  throw new Error("File transfer is not available through the Plug actor.");
};

/** Backend client reused while the Plug session stays the same. */
let cachedBackend: { version: number; backend: Backend } | null = null;

/**
 * Build a backend client whose calls are signed by the connected Plug wallet,
 * so purchases run as the same principal that approved on the ICP ledger.
 * Plug is only prompted when the session does not already whitelist both the
 * backend and the ICP ledger.
 */
async function createPlugBackend(): Promise<Backend> {
  const plug = typeof window !== "undefined" ? window.ic?.plug : undefined;
  if (!plug) {
    throw new Error(pickDict(MESSAGES_TEXT).plugNotDetected);
  }
  const config = await loadConfig();
  await ensurePlugSession(
    plug,
    plugWhitelist(config.backend_canister_id),
    config.backend_host,
  );
  const version = getPlugSessionVersion();
  if (cachedBackend && cachedBackend.version === version) {
    return cachedBackend.backend;
  }
  const actor = await plug.createActor<ActorSubclass<_SERVICE>>({
    canisterId: config.backend_canister_id,
    interfaceFactory: idlFactory,
  });
  const backend = new Backend(actor, unsupportedBlob, unsupportedBlob);
  cachedBackend = { version, backend };
  return backend;
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

export interface PlugPurchaseParams {
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

/** Purchase TTTI-T as the Plug principal (the same one that approved). */
export function usePlugPurchase() {
  const queryClient = useQueryClient();
  return useMutation<PurchaseResult, Error, PlugPurchaseParams>({
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
      const backend = await createPlugBackend();
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

/** Whether the Plug principal already accepted the six purchase acknowledgements. */
export function usePlugPurchaseAcknowledgement(enabled: boolean) {
  const { principal } = usePlug();
  return useQuery<PurchaseAcknowledgement>({
    queryKey: ["purchaseAcknowledgement", "plug", principal?.toText()],
    queryFn: async () => {
      const backend = await createPlugBackend();
      return backend.getMyPurchaseAcknowledgement();
    },
    enabled: enabled && !!principal,
    retry: 1,
  });
}

/** Records acceptance as the Plug principal (the same one that buys). */
export function usePlugAcceptPurchaseAcknowledgements() {
  const queryClient = useQueryClient();
  return useMutation<PurchaseAcknowledgement, Error, void>({
    mutationFn: async () => {
      const backend = await createPlugBackend();
      const result = await backend.acceptPurchaseAcknowledgements();
      if (result.__kind__ === "err") {
        throw new Error(
          result.err === AcknowledgementError.anonymousCaller
            ? pickDict(MESSAGES_TEXT).ackConnectPlugFirst
            : pickDict(MESSAGES_TEXT).ackNotRecorded,
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["purchaseAcknowledgement"],
      });
    },
  });
}

/** Saved delivery address of the Plug caller. */
export function usePlugDeliveryAddress(enabled: boolean) {
  const { principal } = usePlug();
  return useQuery<Account | null>({
    queryKey: ["deliveryAddress", "plug", principal?.toText()],
    queryFn: async () => {
      const backend = await createPlugBackend();
      return backend.getDeliveryAddress();
    },
    enabled: enabled && !!principal,
    retry: 1,
  });
}

export function usePlugSetDeliveryAddress() {
  const queryClient = useQueryClient();
  return useMutation<DeliveryAddressResult, Error, string>({
    mutationFn: async (principalText) => {
      const backend = await createPlugBackend();
      return backend.setDeliveryAddress(principalText.trim());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}

export function usePlugClearDeliveryAddress() {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, void>({
    mutationFn: async () => {
      const backend = await createPlugBackend();
      return backend.clearDeliveryAddress();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}
