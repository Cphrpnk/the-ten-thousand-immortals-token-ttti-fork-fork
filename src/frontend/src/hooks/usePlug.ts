import { loadConfig } from "@caffeineai/core-infrastructure";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PayToken } from "../backend";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import {
  type ApproveOutcome,
  type IcpLedgerActor,
  buildApproveArgs,
  describeCallFailure,
  icpLedgerIdlFactory,
  mapApproveResult,
} from "../lib/icpLedger";
import { PAY_TOKENS, PAY_TOKEN_LEDGER_IDS } from "../lib/token";

/**
 * Canisters a Plug session must whitelist: the backend plus the ICP, ckBTC,
 * ckUSDC and ckUSDT ledgers.
 */
export function plugWhitelist(backendCanisterId: string): string[] {
  return [backendCanisterId, ...PAY_TOKEN_LEDGER_IDS];
}

/** Arguments accepted by Plug's `requestTransfer`. */
export interface PlugTransferArgs {
  to: string;
  amount: bigint;
  opts?: {
    fee?: bigint;
    memo?: bigint | Uint8Array;
    from_subaccount?: Uint8Array;
    createdAtTime?: bigint;
  };
}

/** Result returned by Plug's `requestTransfer`. */
export interface PlugTransferResult {
  height: number;
}

/** Minimal shape of the Plug extension API injected at `window.ic.plug`. */
export interface PlugApi {
  requestConnect: (options?: {
    whitelist?: string[];
    host?: string;
    onConnectionUpdate?: () => void;
    timeout?: number;
  }) => Promise<unknown>;
  isConnected: () => Promise<boolean>;
  getPrincipal: () => Promise<Principal>;
  disconnect: () => Promise<void>;
  requestTransfer: (
    args: PlugTransferArgs,
    options?: { host?: string; timeout?: number },
  ) => Promise<PlugTransferResult>;
  createActor: <T>(options: {
    canisterId: string;
    interfaceFactory: IDL.InterfaceFactory;
  }) => Promise<T>;
  /** Agent Plug creates once a session is connected. */
  agent?: unknown;
}

declare global {
  interface Window {
    ic?: {
      plug?: PlugApi;
    };
  }
}

/** Canisters whitelisted by the last requestConnect this page issued. */
let sessionWhitelist = new Set<string>();
/** Increments whenever the Plug session (agent/whitelist) is replaced. */
let sessionVersion = 0;

function recordSession(whitelist: string[]) {
  sessionWhitelist = new Set(whitelist);
  sessionVersion += 1;
}

/** Current Plug session version; cached Plug actors are valid for one version. */
export function getPlugSessionVersion(): number {
  return sessionVersion;
}

/**
 * Ensure Plug is connected with every canister in `whitelist` whitelisted.
 * Skips the Plug prompt when the current session already covers them.
 */
export async function ensurePlugSession(
  plug: PlugApi,
  whitelist: string[],
  host: string | undefined,
): Promise<void> {
  const connected = await plug.isConnected().catch(() => false);
  if (
    connected &&
    !!plug.agent &&
    whitelist.every((id) => sessionWhitelist.has(id))
  ) {
    return;
  }
  await plug.requestConnect({ whitelist, host });
  recordSession(whitelist);
}

export interface PlugContextValue {
  /** The principal currently connected through Plug, or null. */
  principal: Principal | null;
  /** True while a connect/disconnect request is in flight. */
  isConnecting: boolean;
  /** True when the Plug extension is available in this browser. */
  isAvailable: boolean;
  /** Open the Plug popup and connect the wallet. */
  connect: () => Promise<void>;
  /** Disconnect the Plug wallet. */
  disconnect: () => Promise<void>;
  /**
   * Ask the Plug wallet to sign and submit a transfer to the given ledger
   * canister. Resolves with the block height once Plug submits it.
   */
  requestTransfer: (
    canisterId: Principal,
    args: PlugTransferArgs,
  ) => Promise<PlugTransferResult>;
  /**
   * Approve `spender` on the ICP ledger for the purchase plus the 0.0001 ICP
   * transfer_from fee, signed by Plug. Never throws; failures are returned.
   */
  approveIcp: (
    spender: Principal,
    purchaseE8s: bigint,
  ) => Promise<ApproveOutcome>;
  /**
   * Approve `spender` on the pay token's ledger for `amount` plus that
   * ledger's fee, signed by Plug. Never throws; failures are returned.
   */
  approveToken: (
    spender: Principal,
    token: PayToken,
    amount: bigint,
  ) => Promise<ApproveOutcome>;
}

const PlugContext = createContext<PlugContextValue | undefined>(undefined);

function getPlug(): PlugApi | undefined {
  return typeof window !== "undefined" ? window.ic?.plug : undefined;
}

export function PlugProvider({ children }: { children: React.ReactNode }) {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const plug = getPlug();
    setIsAvailable(!!plug);
    if (!plug) return;

    let cancelled = false;
    const restore = async () => {
      try {
        const connected = await plug.isConnected();
        if (!connected || cancelled) return;
        const restored = await plug.getPrincipal();
        if (!cancelled) setPrincipal(restored);
      } catch {
        // Plug not reachable on this page; stay disconnected.
      }
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    const plug = getPlug();
    if (!plug) {
      throw new Error(pickDict(MESSAGES_TEXT).plugNotDetected);
    }
    setIsConnecting(true);
    try {
      const config = await loadConfig();
      const whitelist = plugWhitelist(config.backend_canister_id);
      await plug.requestConnect({
        whitelist,
        host: config.backend_host,
        onConnectionUpdate: () => {
          void plug.getPrincipal().then(setPrincipal);
        },
      });
      recordSession(whitelist);
      const connectedPrincipal = await plug.getPrincipal();
      setPrincipal(connectedPrincipal);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const plug = getPlug();
    if (!plug) return;
    setIsConnecting(true);
    try {
      await plug.disconnect();
    } finally {
      recordSession([]);
      setPrincipal(null);
      setIsConnecting(false);
    }
  }, []);

  const requestTransfer = useCallback(
    async (canisterId: Principal, args: PlugTransferArgs) => {
      const plug = getPlug();
      if (!plug) {
        throw new Error(pickDict(MESSAGES_TEXT).plugNotDetected);
      }
      const config = await loadConfig();
      // Plug's requestTransfer does not take a canister id: it transfers on the
      // canister whitelisted for this Plug session. Whitelist ONLY the selected
      // token's ledger canister so Plug signs against the selected ledger.
      await plug.requestConnect({
        whitelist: [canisterId.toText()],
        host: config.backend_host,
      });
      recordSession([canisterId.toText()]);
      return plug.requestTransfer(args, {
        host: config.backend_host,
      });
    },
    [],
  );

  const approveToken = useCallback(
    async (
      spender: Principal,
      token: PayToken,
      amount: bigint,
    ): Promise<ApproveOutcome> => {
      const descriptor = PAY_TOKENS[token];
      const plug = getPlug();
      if (!plug) {
        return {
          ok: false,
          message: pickDict(MESSAGES_TEXT).plugNotDetected,
        };
      }
      try {
        const config = await loadConfig();
        // The approval is signed on the pay token's ledger; the whitelist also
        // covers the backend so the purchase call that follows reuses it.
        await ensurePlugSession(
          plug,
          plugWhitelist(config.backend_canister_id),
          config.backend_host,
        );
        const ledger = await plug.createActor<IcpLedgerActor>({
          canisterId: descriptor.ledgerCanisterId,
          interfaceFactory: icpLedgerIdlFactory,
        });
        const result = await ledger.icrc2_approve(
          buildApproveArgs(spender, amount, descriptor.fee),
        );
        return mapApproveResult(result, descriptor);
      } catch (error) {
        return {
          ok: false,
          message: describeCallFailure(error, descriptor.symbol),
        };
      }
    },
    [],
  );

  const approveIcp = useCallback(
    (spender: Principal, purchaseE8s: bigint): Promise<ApproveOutcome> =>
      approveToken(spender, PayToken.icp, purchaseE8s),
    [approveToken],
  );

  const value = useMemo<PlugContextValue>(
    () => ({
      principal,
      isConnecting,
      isAvailable,
      connect,
      disconnect,
      requestTransfer,
      approveIcp,
      approveToken,
    }),
    [
      principal,
      isConnecting,
      isAvailable,
      connect,
      disconnect,
      requestTransfer,
      approveIcp,
      approveToken,
    ],
  );

  return createElement(PlugContext.Provider, { value }, children);
}

export function usePlug(): PlugContextValue {
  const context = useContext(PlugContext);
  if (!context) {
    throw new Error("usePlug must be used within a PlugProvider");
  }
  return context;
}
