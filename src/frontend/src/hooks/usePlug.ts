import type { ActorSubclass } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Backend, PayToken } from "../backend";
import { type _SERVICE, idlFactory } from "../declarations/backend.did";
import {
  type ApproveOutcome,
  type IcpLedgerActor,
  buildApproveArgs,
  describeCallFailure,
  icpLedgerIdlFactory,
  mapApproveResult,
} from "../lib/icpLedger";
import { PAY_TOKENS, PAY_TOKEN_LEDGER_IDS } from "../lib/token";
import {
  WALLET_CONNECT_TIMEOUT_MS,
  WalletConnectError,
  cachedWalletConfig,
  isMobileDevice,
  rememberWalletKind,
  walletConfig,
  withWalletTimeout,
} from "./useSignerWallet";

/**
 * Canisters a Plug session must whitelist: the backend plus the ICP, ckBTC,
 * ckUSDC and ckUSDT ledgers.
 */
export function plugWhitelist(backendCanisterId: string): string[] {
  return [backendCanisterId, ...PAY_TOKEN_LEDGER_IDS];
}

/** Arguments of a Plug-signed ICRC-1 transfer. */
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

/** Result of a Plug-signed transfer (ledger block index). */
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
  createAgent?: (options: {
    whitelist: string[];
    host?: string;
  }) => Promise<unknown>;
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

/** Canisters whitelisted by the current Plug session. */
let sessionWhitelist = new Set<string>();
/** Increments whenever the Plug session (agent/whitelist) is replaced. */
let sessionVersion = 0;

function recordSession(whitelist: string[]) {
  sessionWhitelist = new Set(whitelist);
  sessionVersion += 1;
}

export function getPlugSessionVersion(): number {
  return sessionVersion;
}

/** Plug as injected right now (checked at call time, not only at load). */
export function getPlug(): PlugApi | undefined {
  return typeof window !== "undefined" ? window.ic?.plug : undefined;
}

function missingPlugError(): WalletConnectError {
  return new WalletConnectError(
    isMobileDevice() ? "mobileUnsupported" : "notInstalled",
    "plug",
  );
}

function classifyPlugError(error: unknown): WalletConnectError {
  if (error instanceof WalletConnectError) return error;
  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();
  if (message.includes("timeout") || message.includes("timed out")) {
    return new WalletConnectError("timeout", "plug");
  }
  if (
    message.includes("reject") ||
    message.includes("denied") ||
    message.includes("declin") ||
    message.includes("cancel")
  ) {
    return new WalletConnectError("rejected", "plug");
  }
  return new WalletConnectError("failed", "plug");
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
  await withWalletTimeout(
    plug.requestConnect({
      whitelist,
      host,
      timeout: WALLET_CONNECT_TIMEOUT_MS,
    }),
    "plug",
    WALLET_CONNECT_TIMEOUT_MS + 2_000,
  ).catch((error: unknown) => {
    throw classifyPlugError(error);
  });
  recordSession(whitelist);
}

/** Full session whitelist, plus the `extra` canisters not already covered. */
export async function readyPlug(
  extra?: string | ReadonlyArray<string>,
): Promise<PlugApi> {
  const plug = getPlug();
  if (!plug) throw missingPlugError();
  const config = await walletConfig();
  const whitelist = plugWhitelist(config.backend_canister_id);
  const extras = typeof extra === "string" ? [extra] : (extra ?? []);
  for (const id of extras) {
    if (!whitelist.includes(id)) whitelist.push(id);
  }
  await ensurePlugSession(plug, whitelist, config.backend_host);
  return plug;
}

const unsupportedBlob = async (): Promise<never> => {
  throw new Error("File transfer is not available through a wallet actor.");
};

let cachedBackend: { version: number; backend: Backend } | null = null;

/** Backend client whose calls are signed by the connected Plug wallet. */
export async function createPlugBackend(): Promise<Backend> {
  const plug = await readyPlug();
  const version = getPlugSessionVersion();
  if (cachedBackend && cachedBackend.version === version) {
    return cachedBackend.backend;
  }
  const config = await walletConfig();
  const actor = await plug.createActor<ActorSubclass<_SERVICE>>({
    canisterId: config.backend_canister_id,
    interfaceFactory: idlFactory,
  });
  const backend = new Backend(actor, unsupportedBlob, unsupportedBlob);
  cachedBackend = { version, backend };
  return backend;
}

type TransferResult = { Ok: bigint } | { Err: Record<string, unknown> };
interface Icrc1TransferActor {
  icrc1_transfer: (args: {
    to: { owner: Principal; subaccount: [] | [Uint8Array] };
    amount: bigint;
    fee: [] | [bigint];
    memo: [] | [Uint8Array];
    from_subaccount: [] | [Uint8Array];
    created_at_time: [] | [bigint];
  }) => Promise<TransferResult>;
}

const icrc1TransferIdl: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Account = I.Record({
    owner: I.Principal,
    subaccount: I.Opt(I.Vec(I.Nat8)),
  });
  const TransferError = I.Variant({
    BadFee: I.Record({ expected_fee: I.Nat }),
    BadBurn: I.Record({ min_burn_amount: I.Nat }),
    InsufficientFunds: I.Record({ balance: I.Nat }),
    TooOld: I.Null,
    CreatedInFuture: I.Record({ ledger_time: I.Nat64 }),
    TemporarilyUnavailable: I.Null,
    Duplicate: I.Record({ duplicate_of: I.Nat }),
    GenericError: I.Record({ error_code: I.Nat, message: I.Text }),
  });
  return I.Service({
    icrc1_transfer: I.Func(
      [
        I.Record({
          to: Account,
          amount: I.Nat,
          fee: I.Opt(I.Nat),
          memo: I.Opt(I.Vec(I.Nat8)),
          from_subaccount: I.Opt(I.Vec(I.Nat8)),
          created_at_time: I.Opt(I.Nat64),
        }),
      ],
      [I.Variant({ Ok: I.Nat, Err: TransferError })],
      [],
    ),
  });
};

export interface PlugContextValue {
  principal: Principal | null;
  isConnecting: boolean;
  /** Plug extension present (re-checked while the page is open). */
  isAvailable: boolean;
  /** Call from a click: the Plug popup opens before any await. */
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  /** ICRC-1 transfer on `canisterId`, signed by Plug. */
  requestTransfer: (
    canisterId: Principal,
    args: PlugTransferArgs,
  ) => Promise<PlugTransferResult>;
  approveIcp: (
    spender: Principal,
    purchaseE8s: bigint,
  ) => Promise<ApproveOutcome>;
  approveToken: (
    spender: Principal,
    token: PayToken,
    amount: bigint,
  ) => Promise<ApproveOutcome>;
}

const PlugContext = createContext<PlugContextValue | undefined>(undefined);

export function PlugProvider({ children }: { children: React.ReactNode }) {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(() => !!getPlug());

  // Preload config so connect() can call requestConnect without awaiting.
  useEffect(() => {
    void walletConfig().catch(() => undefined);
  }, []);

  // Detect an extension installed or injected after the page loaded.
  useEffect(() => {
    if (isAvailable) return;
    const check = () => {
      if (getPlug()) setIsAvailable(true);
    };
    const timer = window.setInterval(check, 1_500);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [isAvailable]);

  // Restore a Plug session left connected on a previous visit.
  useEffect(() => {
    const plug = isAvailable ? getPlug() : undefined;
    if (!plug) return;
    let cancelled = false;
    const restore = async () => {
      try {
        const connected = await plug.isConnected();
        if (!connected || cancelled) return;
        const config = await walletConfig();
        const whitelist = plugWhitelist(config.backend_canister_id);
        if (!plug.agent && plug.createAgent) {
          await plug
            .createAgent({ whitelist, host: config.backend_host })
            .catch(() => undefined);
        }
        if (plug.agent) recordSession(whitelist);
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
  }, [isAvailable]);

  const connect = useCallback(async () => {
    const plug = getPlug();
    if (!plug) throw missingPlugError();
    setIsAvailable(true);
    // Normally preloaded: then the popup opens synchronously from the click.
    const config = cachedWalletConfig() ?? (await walletConfig());
    const whitelist = plugWhitelist(config.backend_canister_id);
    const request = plug.requestConnect({
      whitelist,
      host: config.backend_host,
      timeout: WALLET_CONNECT_TIMEOUT_MS,
      onConnectionUpdate: () => {
        void plug.getPrincipal().then(setPrincipal, () => undefined);
      },
    });
    setIsConnecting(true);
    try {
      await withWalletTimeout(
        request,
        "plug",
        WALLET_CONNECT_TIMEOUT_MS + 2_000,
      );
      recordSession(whitelist);
      const connectedPrincipal = await plug.getPrincipal();
      setPrincipal(connectedPrincipal);
      rememberWalletKind("plug");
    } catch (error) {
      throw classifyPlugError(error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const plug = getPlug();
    setIsConnecting(true);
    try {
      await plug?.disconnect();
    } catch {
      // Already disconnected on Plug's side.
    } finally {
      recordSession([]);
      cachedBackend = null;
      setPrincipal(null);
      setIsConnecting(false);
    }
  }, []);

  const requestTransfer = useCallback(
    async (canisterId: Principal, args: PlugTransferArgs) => {
      const plug = await readyPlug(canisterId.toText());
      const ledger = await plug.createActor<Icrc1TransferActor>({
        canisterId: canisterId.toText(),
        interfaceFactory: icrc1TransferIdl,
      });
      const memo = args.opts?.memo;
      const result = await ledger.icrc1_transfer({
        to: { owner: Principal.fromText(args.to), subaccount: [] },
        amount: args.amount,
        fee: args.opts?.fee === undefined ? [] : [args.opts.fee],
        memo: memo instanceof Uint8Array ? [memo] : [],
        from_subaccount: args.opts?.from_subaccount
          ? [args.opts.from_subaccount]
          : [],
        created_at_time:
          args.opts?.createdAtTime === undefined
            ? []
            : [args.opts.createdAtTime],
      });
      if ("Err" in result) {
        throw new Error(
          `Transfer failed: ${Object.keys(result.Err)[0] ?? "unknown error"}`,
        );
      }
      return { height: Number(result.Ok) };
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
      try {
        // The full whitelist already covers every pay ledger and the backend,
        // so no extra Plug prompt opens for the approval or the purchase.
        const plug = await readyPlug();
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
          message:
            error instanceof WalletConnectError
              ? error.message
              : describeCallFailure(error, descriptor.symbol),
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
