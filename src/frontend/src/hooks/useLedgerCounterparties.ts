import { loadConfig } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  INDEX_BY_LEDGER,
  type LedgerCounterparty,
  mergeCounterparties,
  readIcpCounterparties,
  readIcrcIndexCounterparties,
  readTttiCounterparties,
} from "../lib/ledgerIndex";
import { ICP_LEDGER_ID } from "../lib/token";
import { tokenRegistry } from "../lib/tokenRegistry";
import { useActor } from "./useActor";

export type { LedgerCounterparty };

const CK_LEDGERS = Object.keys(INDEX_BY_LEDGER).filter(
  (id) => id !== ICP_LEDGER_ID,
);

export interface LedgerCounterpartiesState {
  /** Deduplicated counterparties, latest interaction first. */
  counterparties: Array<LedgerCounterparty>;
  isLoading: boolean;
  /** At least one index failed; `counterparties` holds the rest. */
  isError: boolean;
  /** Ledgers whose index failed: canister IDs, "ttti" for TTTI-T. */
  failedLedgers: Array<string>;
  refetch: () => void;
}

/**
 * Recent counterparties of `owner` on ICP, TTTI-T, ckBTC, ckUSDC and ckUSDT,
 * read from each official index. ICP account identifiers are attributed to
 * `knownPrincipals` (e.g. contacts) and to principals found on the other
 * ledgers. The owner is excluded, and the contract (TTTI-T minting) address,
 * the backend canister principal with any subaccount, is excluded on every
 * ledger.
 */
export function useLedgerCounterparties(
  owner: Principal | undefined,
  knownPrincipals: Array<Principal> = [],
): LedgerCounterpartiesState {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText();
  const enabled = !!owner;

  const icrcResults = useQueries({
    queries: [
      {
        queryKey: ["ledgerCounterparties", "ttti", ownerText],
        queryFn: async () => {
          if (!actor || !owner) throw new Error("Actor not initialized");
          const config = await loadConfig();
          const ledgerId = tokenRegistry(
            config.backend_canister_id,
          )[1].canisterId.toText();
          return readTttiCounterparties(actor, ledgerId, owner);
        },
        enabled: enabled && !!actor && !isFetching,
        staleTime: 60_000,
      },
      ...CK_LEDGERS.map((ledgerId) => ({
        queryKey: ["ledgerCounterparties", ledgerId, ownerText],
        queryFn: async () => {
          if (!owner) throw new Error("No account");
          return readIcrcIndexCounterparties(ledgerId, owner);
        },
        enabled,
        staleTime: 60_000,
      })),
    ],
  });

  // The backend canister owns the TTTI-T minting account and receives every
  // purchase on ICP/ckBTC/ckUSDC/ckUSDT: never suggest it, on any ledger.
  const { data: contractText } = useQuery({
    queryKey: ["ledgerCounterparties", "contractPrincipal"],
    queryFn: async () => (await loadConfig()).backend_canister_id,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const notContract = (p: Principal) =>
    contractText !== undefined && p.toText() !== contractText;

  const icrcPrincipals = icrcResults
    .flatMap((r) => (r.data ?? []).map((c) => c.principal))
    .filter(notContract);
  const knownForIcp = [...knownPrincipals, ...icrcPrincipals].filter(
    notContract,
  );
  const knownKey = knownForIcp
    .map((p) => p.toText())
    .sort()
    .filter((text, i, all) => all.indexOf(text) === i);
  const knownJoined = knownKey.join(",");

  const [icpResult] = useQueries({
    queries: [
      {
        queryKey: [
          "ledgerCounterparties",
          ICP_LEDGER_ID,
          ownerText,
          knownJoined,
        ],
        queryFn: async () => {
          if (!owner) throw new Error("No account");
          const icp = await readIcpCounterparties(owner, knownForIcp);
          return icp.filter((c) => notContract(c.principal));
        },
        enabled:
          enabled &&
          contractText !== undefined &&
          icrcResults.every((r) => !r.isLoading),
        staleTime: 60_000,
      },
    ],
  });

  const all = [...icrcResults, icpResult];
  const ledgerOrder = ["ttti", ...CK_LEDGERS, ICP_LEDGER_ID];
  const dataStamp = all.map((r) => r.dataUpdatedAt).join(",");

  // biome-ignore lint/correctness/useExhaustiveDependencies: recomputed when any query's data or the contract principal changes
  const counterparties = useMemo(
    () =>
      mergeCounterparties(all.map((r) => r.data ?? [])).filter((c) =>
        notContract(c.principal),
      ),
    [dataStamp, contractText],
  );

  const failedLedgers = all.flatMap((r, i) =>
    r.isError ? [ledgerOrder[i]] : [],
  );

  return {
    counterparties,
    isLoading: enabled && all.some((r) => r.isLoading),
    isError: failedLedgers.length > 0,
    failedLedgers,
    refetch: () => {
      for (const r of all) void r.refetch();
    },
  };
}
