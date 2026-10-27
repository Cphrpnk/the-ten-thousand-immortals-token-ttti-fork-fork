import { loadConfig } from "@caffeineai/core-infrastructure";
import {
  Actor,
  type Agent,
  Certificate,
  HttpAgent,
  type UpdateResult,
  lookupResultToBuffer,
} from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import {
  ACTION_ABORTED_ERROR,
  PERMISSION_NOT_GRANTED_ERROR,
  Signer,
  SignerError,
} from "@slide-computer/signer";
import { SignerAgent } from "@slide-computer/signer-agent";
import { PostMessageTransport } from "@slide-computer/signer-web";
import { useCallback, useState, useSyncExternalStore } from "react";
import { type Backend, type PayToken, createActor } from "../backend";
import { pickDict } from "../i18n/core/dict";
import { SETUP_TEXT } from "../i18n/pages/setup";
import { WALLET_SIGNING_TEXT } from "../i18n/pages/walletSigning";
import {
  type ApproveOutcome,
  type IcpLedgerActor,
  buildApproveArgs,
  describeCallFailure,
  icpLedgerIdlFactory,
  mapApproveResult,
} from "../lib/icpLedger";
import { PAY_TOKENS } from "../lib/token";

/** External wallets the app connects to (Internet Identity is the built-in one). */
export type ConnectedWalletKind = "plug" | "oisy" | "nfid";
/** Wallets reached through the ICP signer standard (ICRC-25/27/29/49). */
export type SignerWalletKind = "oisy" | "nfid";
/** Wallet choice of the setup flow: the built-in wallet or an external one. */
export type SetupWalletKind = "builtIn" | ConnectedWalletKind;

export const WALLET_NAMES: Record<ConnectedWalletKind, string> = {
  plug: "Plug",
  oisy: "OISY",
  nfid: "NFID Wallet",
};

export const PLUG_INSTALL_URL = "https://plugwallet.ooo";

const SIGNER_URLS: Record<SignerWalletKind, string> = {
  oisy: "https://oisy.com/sign",
  nfid: "https://nfid.one/rpc",
};

/** Time allowed for a wallet window or popup before the connection times out. */
export const WALLET_CONNECT_TIMEOUT_MS = 60_000;

export type WalletErrorCode =
  | "notInstalled"
  | "rejected"
  | "timeout"
  | "failed"
  | "mobileUnsupported";

const ERROR_KEYS = {
  notInstalled: "walletErrorNotInstalled",
  rejected: "walletErrorRejected",
  timeout: "walletErrorTimeout",
  failed: "walletErrorFailed",
  mobileUnsupported: "walletPlugMobile",
} as const satisfies Record<WalletErrorCode, string>;

/** Text of a wallet connection error in the active language. */
export function walletErrorText(code: WalletErrorCode): string {
  return pickDict(SETUP_TEXT)[ERROR_KEYS[code]];
}

/** Typed wallet connection failure; `message` is in the active language. */
export class WalletConnectError extends Error {
  readonly code: WalletErrorCode;
  readonly kind: ConnectedWalletKind;
  constructor(code: WalletErrorCode, kind: ConnectedWalletKind) {
    super(walletErrorText(code));
    this.name = "WalletConnectError";
    this.code = code;
    this.kind = kind;
  }
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

/** Reject with a timeout error when `promise` does not settle in time. */
export function withWalletTimeout<T>(
  promise: Promise<T>,
  kind: ConnectedWalletKind,
  ms = WALLET_CONNECT_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new WalletConnectError("timeout", kind)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// ---------------------------------------------------------------- config

type AppConfig = Awaited<ReturnType<typeof loadConfig>>;
let configPromise: Promise<AppConfig> | null = null;
let configValue: AppConfig | null = null;

/** Load (once) the backend config used to build wallet sessions. */
export function walletConfig(): Promise<AppConfig> {
  if (!configPromise) {
    configPromise = loadConfig().then(
      (config) => {
        configValue = config;
        return config;
      },
      (error: unknown) => {
        configPromise = null;
        throw error;
      },
    );
  }
  return configPromise;
}

/** Config already loaded, so a wallet popup can open without awaiting. */
export function cachedWalletConfig(): AppConfig | null {
  return configValue;
}

// ------------------------------------------------------ remembered wallet

const KIND_KEY = "ttti.connectedWallet.kind";
const ACCOUNT_KEY = "ttti.signerWallet.account";
const ACK_KEY_PREFIX = "ttti.walletAck.v2.";
const kindListeners = new Set<() => void>();

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this visit.
  }
}

let rememberedKind: ConnectedWalletKind | null = (() => {
  if (typeof window === "undefined") return null;
  const value = readStorage(KIND_KEY);
  return value === "plug" || value === "oisy" || value === "nfid"
    ? value
    : null;
})();

export function rememberWalletKind(kind: ConnectedWalletKind | null) {
  rememberedKind = kind;
  writeStorage(KIND_KEY, kind);
  for (const listener of kindListeners) listener();
}

function subscribeKind(listener: () => void) {
  kindListeners.add(listener);
  return () => {
    kindListeners.delete(listener);
  };
}

/** Wallet kind remembered in this browser; re-renders when it changes. */
export function useRememberedWalletKind(): ConnectedWalletKind | null {
  return useSyncExternalStore(
    subscribeKind,
    () => rememberedKind,
    () => null,
  );
}

/**
 * Signer wallets cannot run a signed query without opening their window, so
 * the acceptance recorded from this browser is remembered as a hint. The
 * backend stays the authority: accepting again is harmless.
 */
export function hasAcceptedHint(principalText: string): boolean {
  return readStorage(`${ACK_KEY_PREFIX}${principalText}`) === "1";
}

export function rememberAcceptedHint(principalText: string) {
  writeStorage(`${ACK_KEY_PREFIX}${principalText}`, "1");
}

// ------------------------------------------------------------ signer core

const signers: Partial<Record<SignerWalletKind, Signer>> = {};

function getSigner(kind: SignerWalletKind): Signer {
  const existing = signers[kind];
  if (existing) return existing;
  const mobile = isMobileDevice();
  const width = 460;
  const height = 720;
  const left =
    typeof window !== "undefined"
      ? Math.max(0, window.screenX + (window.outerWidth - width) / 2)
      : 0;
  const top =
    typeof window !== "undefined"
      ? Math.max(0, window.screenY + (window.outerHeight - height) / 2)
      : 0;
  const signer = new Signer({
    transport: new PostMessageTransport({
      url: SIGNER_URLS[kind],
      // Mobile browsers open the wallet in a tab.
      windowOpenerFeatures: mobile
        ? ""
        : `toolbar=0,location=0,menubar=0,width=${width},height=${height},left=${left},top=${top}`,
      establishTimeout: WALLET_CONNECT_TIMEOUT_MS,
      pendingTimeout: 3 * WALLET_CONNECT_TIMEOUT_MS,
      // Form submits run after the click event; callers open the window first.
      detectNonClickEstablishment: false,
    }),
    // Keep the window open across approve + purchase; callers close it.
    autoCloseTransportChannel: false,
  });
  signers[kind] = signer;
  return signer;
}

/**
 * Open the signer window right now (call synchronously from a click) so the
 * calls that follow reuse it. Returns a function that closes it.
 */
export function openSignerSession(kind: SignerWalletKind): () => void {
  const signer = getSigner(kind);
  void signer.openChannel().catch(() => undefined);
  return () => {
    void signer.closeChannel().catch(() => undefined);
  };
}

function classifySignerError(
  error: unknown,
  kind: SignerWalletKind,
): WalletConnectError {
  if (error instanceof WalletConnectError) return error;
  if (error instanceof SignerError) {
    if (
      error.code === ACTION_ABORTED_ERROR ||
      error.code === PERMISSION_NOT_GRANTED_ERROR
    ) {
      return new WalletConnectError("rejected", kind);
    }
    const message = error.message.toLowerCase();
    if (
      message.includes("reasonable time") ||
      message.includes("too long") ||
      message.includes("closed")
    ) {
      return new WalletConnectError("timeout", kind);
    }
  }
  return new WalletConnectError("failed", kind);
}

/**
 * Localized text for a failure on the wallet side of a signed call (refused,
 * closed, unreachable); null when the failure came from the canister call.
 */
export function walletFailureMessage(error: unknown): string | null {
  const t = pickDict(WALLET_SIGNING_TEXT);
  if (error instanceof WalletConnectError) {
    if (error.code === "rejected") return t.refused;
    if (error.code === "timeout") return t.closed;
    return error.message;
  }
  if (error instanceof SignerError) {
    if (
      error.code === ACTION_ABORTED_ERROR ||
      error.code === PERMISSION_NOT_GRANTED_ERROR
    ) {
      return t.refused;
    }
  }
  const message = (
    error instanceof Error ? error.message : String(error ?? "")
  ).toLowerCase();
  if (/closed|reasonable time|too long|timed out|timeout/.test(message)) {
    return t.closed;
  }
  if (/reject|denied|declin|cancel|abort/.test(message)) return t.refused;
  if (error instanceof SignerError) return t.failed;
  return null;
}

/** Open the wallet window (from a click) and read the user's principal. */
export async function connectSigner(
  kind: SignerWalletKind,
): Promise<Principal> {
  const signer = getSigner(kind);
  const opening = signer.openChannel();
  try {
    await withWalletTimeout(opening, kind);
    return await withWalletTimeout(
      (async () => {
        try {
          const granted = await signer.requestPermissions([
            { method: "icrc27_accounts" },
            { method: "icrc49_call_canister" },
          ]);
          const accounts = granted.find(
            (item) => item.scope.method === "icrc27_accounts",
          );
          if (accounts && accounts.state === "denied") {
            throw new WalletConnectError("rejected", kind);
          }
        } catch (error) {
          // Signers that ask on use do not need an explicit request.
          if (
            error instanceof WalletConnectError ||
            (error instanceof SignerError &&
              (error.code === ACTION_ABORTED_ERROR ||
                error.code === PERMISSION_NOT_GRANTED_ERROR))
          ) {
            throw error;
          }
        }
        const accounts = await signer.accounts();
        const owner = accounts[0]?.owner;
        if (!owner || owner.isAnonymous()) {
          throw new WalletConnectError("failed", kind);
        }
        return owner;
      })(),
      kind,
      3 * WALLET_CONNECT_TIMEOUT_MS,
    );
  } catch (error) {
    throw classifySignerError(error, kind);
  } finally {
    void signer.closeChannel().catch(() => undefined);
  }
}

const agents = new Map<string, Promise<Agent>>();

const textDecoder = new TextDecoder();

/**
 * @icp-sdk/core 5 actors call `agent.update`, which SignerAgent 4 lacks.
 * This adapter submits the call through the signer and reads the certified
 * reply from the certificate the signer returned.
 */
function toActorAgent(inner: SignerAgent): Agent {
  return {
    get rootKey() {
      return inner.rootKey;
    },
    getPrincipal: () => inner.getPrincipal(),
    call: (canisterId, fields) => inner.call(canisterId, fields),
    query: (canisterId, options) => inner.query(canisterId, options),
    readState: (canisterId, options) => inner.readState(canisterId, options),
    status: () => inner.status(),
    fetchRootKey: () => inner.fetchRootKey(),
    async update(canisterId, fields): Promise<UpdateResult> {
      const cid = Principal.from(canisterId);
      const submit = await inner.call(cid, fields);
      const { certificate: rawCertificate } = await inner.readState(cid, {
        paths: [[new TextEncoder().encode("request_status"), submit.requestId]],
      });
      const certificate = await Certificate.create({
        certificate: rawCertificate,
        rootKey: inner.rootKey,
        principal: { canisterId: cid },
      });
      const base = ["request_status", submit.requestId];
      const status = lookupResultToBuffer(
        certificate.lookup_path([...base, "status"]),
      );
      const statusText = status ? textDecoder.decode(status) : "";
      if (statusText === "replied") {
        const reply = lookupResultToBuffer(
          certificate.lookup_path([...base, "reply"]),
        );
        if (reply) {
          return {
            certificate,
            reply,
            rawCertificate,
            callResponse: submit.response,
          };
        }
      }
      const rejectMessage = lookupResultToBuffer(
        certificate.lookup_path([...base, "reject_message"]),
      );
      throw new Error(
        rejectMessage
          ? textDecoder.decode(rejectMessage)
          : `Call ${fields.methodName} was not replied (${statusText || "unknown"}).`,
      );
    },
  };
}

/** Agent whose calls for `principal` are approved in the signer wallet. */
export function getSignerAgent(
  kind: SignerWalletKind,
  principal: Principal,
): Promise<Agent> {
  const key = `${kind}:${principal.toText()}`;
  const existing = agents.get(key);
  if (existing) return existing;
  const created = (async () => {
    const config = await walletConfig();
    const http = HttpAgent.createSync({ host: config.backend_host });
    if (config.backend_host?.includes("localhost")) {
      await http.fetchRootKey().catch(() => undefined);
    }
    return toActorAgent(
      SignerAgent.createSync({
        signer: getSigner(kind),
        account: principal,
        agent: http,
      }),
    );
  })();
  created.catch(() => agents.delete(key));
  agents.set(key, created);
  return created;
}

const unsupportedBlob = async (): Promise<never> => {
  throw new Error("File transfer is not available through a wallet actor.");
};

/** Backend client whose calls are approved in the signer wallet. */
export async function createSignerBackend(
  kind: SignerWalletKind,
  principal: Principal,
): Promise<Backend> {
  const [config, agent] = await Promise.all([
    walletConfig(),
    getSignerAgent(kind, principal),
  ]);
  return createActor(
    config.backend_canister_id,
    unsupportedBlob,
    unsupportedBlob,
    { agent },
  );
}

/** icrc2_approve on the pay token's ledger, approved in the signer wallet. */
export async function approveWithSigner(
  kind: SignerWalletKind,
  principal: Principal,
  spender: Principal,
  token: PayToken,
  amount: bigint,
): Promise<ApproveOutcome> {
  const descriptor = PAY_TOKENS[token];
  try {
    const agent = await getSignerAgent(kind, principal);
    const ledger = Actor.createActor<IcpLedgerActor>(icpLedgerIdlFactory, {
      agent,
      canisterId: descriptor.ledgerCanisterId,
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
}

// ------------------------------------------------------------ React state

export interface SignerAccount {
  kind: SignerWalletKind;
  principal: Principal;
}

/** OISY / NFID Wallet account last connected in this browser, if any. */
export function readStoredAccount(): SignerAccount | null {
  if (typeof window === "undefined") return null;
  const raw = readStorage(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "kind" in parsed &&
      "principal" in parsed &&
      (parsed.kind === "oisy" || parsed.kind === "nfid") &&
      typeof parsed.principal === "string"
    ) {
      return {
        kind: parsed.kind,
        principal: Principal.fromText(parsed.principal),
      };
    }
  } catch {
    // Corrupt entry: treat as disconnected.
  }
  return null;
}

export interface SignerWalletState {
  account: SignerAccount | null;
  connectingKind: SignerWalletKind | null;
  /** Start from a click: opens the wallet window before any await. */
  connect: (kind: SignerWalletKind) => Promise<Principal>;
  disconnect: () => void;
}

/** Signer-wallet session (OISY, NFID Wallet), restored from this browser. */
export function useSignerWalletState(): SignerWalletState {
  const [account, setAccount] = useState<SignerAccount | null>(
    readStoredAccount,
  );
  const [connectingKind, setConnectingKind] = useState<SignerWalletKind | null>(
    null,
  );

  const connect = useCallback(async (kind: SignerWalletKind) => {
    const pending = connectSigner(kind);
    setConnectingKind(kind);
    try {
      const principal = await pending;
      writeStorage(
        ACCOUNT_KEY,
        JSON.stringify({ kind, principal: principal.toText() }),
      );
      setAccount({ kind, principal });
      return principal;
    } finally {
      setConnectingKind(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    writeStorage(ACCOUNT_KEY, null);
    agents.clear();
    for (const signer of Object.values(signers)) {
      void signer?.closeChannel().catch(() => undefined);
    }
    setAccount(null);
  }, []);

  return { account, connectingKind, connect, disconnect };
}
