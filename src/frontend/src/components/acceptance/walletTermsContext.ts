import { createContext, useContext } from "react";

export interface WalletTermsStatus {
  /** A wallet or Internet Identity session is active. */
  signedIn: boolean;
  /** The acceptance status has been read for the active account. */
  known: boolean;
  /** The active account has accepted the terms (final). */
  accepted: boolean;
  /** Signed in, status known, and not yet accepted. */
  needsAcceptance: boolean;
  /** Reading the status failed. */
  isError: boolean;
}

export interface WalletTermsValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  status: WalletTermsStatus;
  /**
   * Why acceptance cannot be recorded right now (sign-in or wallet-connect
   * message), or null when the user can accept.
   */
  unavailableReason: string | null;
  isAccepting: boolean;
  /** Records the acceptance; call directly from a click. Rejects on failure. */
  accept: () => Promise<void>;
}

export const WalletTermsContext = createContext<WalletTermsValue | undefined>(
  undefined,
);

export function useWalletTerms(): WalletTermsValue {
  const value = useContext(WalletTermsContext);
  if (!value) {
    throw new Error("useWalletTerms must be used within WalletTermsProvider");
  }
  return value;
}
