import type { Principal } from "@icp-sdk/core/principal";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { Backend, PayToken } from "../backend";
import type { ApproveOutcome } from "../lib/icpLedger";
import { createPlugBackend, usePlug } from "./usePlug";
import {
  type ConnectedWalletKind,
  type SignerWalletKind,
  WALLET_NAMES,
  approveWithSigner,
  createSignerBackend,
  openSignerSession,
  rememberWalletKind,
  useRememberedWalletKind,
  useSignerWalletState,
} from "./useSignerWallet";

export type {
  ConnectedWalletKind,
  SetupWalletKind,
  SignerWalletKind,
  WalletErrorCode,
} from "./useSignerWallet";
export {
  PLUG_INSTALL_URL,
  WALLET_NAMES,
  WalletConnectError,
  isMobileDevice,
  walletErrorText,
} from "./useSignerWallet";

export function isSignerKind(
  kind: ConnectedWalletKind | null,
): kind is SignerWalletKind {
  return kind === "oisy" || kind === "nfid";
}

export interface ConnectedWalletValue {
  /** Connected external wallet, or null (built-in wallet / signed out). */
  kind: ConnectedWalletKind | null;
  /** Principal of the connected external wallet. */
  principal: Principal | null;
  /** Display name of the connected wallet ("Plug", "OISY", "NFID Wallet"). */
  name: string | null;
  /** Wallet whose connection is in progress. */
  connectingKind: ConnectedWalletKind | null;
  /** Plug extension present in this browser (re-checked live). */
  plugAvailable: boolean;
  /**
   * Call directly from a click: the Plug popup or wallet window opens before
   * any await. Rejects with a WalletConnectError.
   */
  connect: (kind: ConnectedWalletKind) => Promise<void>;
  disconnect: () => Promise<void>;
  /** icrc2_approve of `amount` plus the ledger fee for `spender`. Never throws. */
  approve: (
    spender: Principal,
    token: PayToken,
    amount: bigint,
  ) => Promise<ApproveOutcome>;
  /** Backend client whose calls are signed by the connected wallet. */
  getBackend: () => Promise<Backend>;
  /**
   * Call synchronously from a click before signed calls: opens the OISY/NFID
   * window so the following calls reuse it. Returns a release function.
   */
  beginSession: () => () => void;
}

const ConnectedWalletContext = createContext<ConnectedWalletValue | undefined>(
  undefined,
);

const noop = () => undefined;

/** One connected-wallet abstraction over Plug, OISY and NFID Wallet. */
export function ConnectedWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const plug = usePlug();
  const signer = useSignerWalletState();
  const remembered = useRememberedWalletKind();
  const signerKind = signer.account?.kind ?? null;

  let kind: ConnectedWalletKind | null = null;
  if (remembered === "plug" && plug.principal) kind = "plug";
  else if (signerKind && (remembered === signerKind || !plug.principal)) {
    kind = signerKind;
  } else if (plug.principal) kind = "plug";

  const principal =
    kind === "plug"
      ? plug.principal
      : kind
        ? (signer.account?.principal ?? null)
        : null;

  const connectingKind: ConnectedWalletKind | null = plug.isConnecting
    ? "plug"
    : signer.connectingKind;

  const { connect: plugConnect, disconnect: plugDisconnect } = plug;
  const plugPrincipal = plug.principal;
  const { connect: signerConnect, disconnect: signerDisconnect } = signer;

  const connect = useCallback(
    async (target: ConnectedWalletKind) => {
      if (target === "plug") {
        await plugConnect();
        signerDisconnect();
        rememberWalletKind("plug");
        return;
      }
      await signerConnect(target);
      rememberWalletKind(target);
      if (plugPrincipal) void plugDisconnect();
    },
    [
      plugConnect,
      plugDisconnect,
      plugPrincipal,
      signerConnect,
      signerDisconnect,
    ],
  );

  const disconnect = useCallback(async () => {
    rememberWalletKind(null);
    signerDisconnect();
    if (plugPrincipal) await plugDisconnect();
  }, [plugDisconnect, plugPrincipal, signerDisconnect]);

  const { approveToken: plugApprove } = plug;
  const signerAccount = signer.account;

  const approve = useCallback(
    async (
      spender: Principal,
      token: PayToken,
      amount: bigint,
    ): Promise<ApproveOutcome> => {
      if (isSignerKind(kind) && signerAccount) {
        return approveWithSigner(
          kind,
          signerAccount.principal,
          spender,
          token,
          amount,
        );
      }
      return plugApprove(spender, token, amount);
    },
    [kind, signerAccount, plugApprove],
  );

  const getBackend = useCallback(async () => {
    if (isSignerKind(kind) && signerAccount) {
      return createSignerBackend(kind, signerAccount.principal);
    }
    return createPlugBackend();
  }, [kind, signerAccount]);

  const beginSession = useCallback(
    () => (isSignerKind(kind) ? openSignerSession(kind) : noop),
    [kind],
  );

  const value = useMemo<ConnectedWalletValue>(
    () => ({
      kind,
      principal,
      name: kind ? WALLET_NAMES[kind] : null,
      connectingKind,
      plugAvailable: plug.isAvailable,
      connect,
      disconnect,
      approve,
      getBackend,
      beginSession,
    }),
    [
      kind,
      principal,
      connectingKind,
      plug.isAvailable,
      connect,
      disconnect,
      approve,
      getBackend,
      beginSession,
    ],
  );

  return createElement(ConnectedWalletContext.Provider, { value }, children);
}

export function useConnectedWallet(): ConnectedWalletValue {
  const context = useContext(ConnectedWalletContext);
  if (!context) {
    throw new Error(
      "useConnectedWallet must be used within a ConnectedWalletProvider",
    );
  }
  return context;
}
