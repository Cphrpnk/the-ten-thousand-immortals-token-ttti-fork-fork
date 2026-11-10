import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useConnectedWallet } from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useWalletAcceptPurchaseAcknowledgements,
  useWalletPurchaseAcknowledgement,
} from "../../hooks/usePlugPurchase";
import {
  useAcceptPurchaseAcknowledgements,
  useGetMyPurchaseAcknowledgement,
} from "../../hooks/useQueries";
import { useRememberedWalletKind } from "../../hooks/useSignerWallet";
import { MESSAGES_TEXT } from "../../i18n/common/messages";
import { useDict } from "../../i18n/core/dict";
import {
  WalletTermsContext,
  type WalletTermsValue,
} from "./walletTermsContext";

/**
 * One acceptance status for Internet Identity, Plug, OISY and NFID, picked the
 * same way as on the mint page. Any acceptance is final.
 */
export function WalletTermsProvider({ children }: { children: ReactNode }) {
  const messages = useDict(MESSAGES_TEXT);
  const { identity } = useInternetIdentity();
  const connected = useConnectedWallet();
  const remembered = useRememberedWalletKind();
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedFor, setAcceptedFor] = useState<string | null>(null);

  const iiPrincipal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal()
      : null;
  const isExternal = !!connected.kind && !!connected.principal;
  const isInternetIdentity = !isExternal && iiPrincipal !== null;
  const signedIn = isExternal || isInternetIdentity;
  const activePrincipalText =
    (connected.principal ?? iiPrincipal)?.toText() ?? null;

  const iiQuery = useGetMyPurchaseAcknowledgement(isInternetIdentity);
  const walletQuery = useWalletPurchaseAcknowledgement(isExternal);
  const iiAccept = useAcceptPurchaseAcknowledgements();
  const walletAccept = useWalletAcceptPurchaseAcknowledgements();
  const query = isExternal ? walletQuery : iiQuery;
  const { mutateAsync: acceptAsII } = iiAccept;
  const { mutateAsync: acceptAsWallet } = walletAccept;
  const { beginSession } = connected;

  const accepted =
    signedIn &&
    (query.data?.accepted === true ||
      (acceptedFor !== null && acceptedFor === activePrincipalText));
  const known = signedIn && (accepted || query.data !== undefined);

  let unavailableReason: string | null = null;
  if (!signedIn) {
    if (remembered === "plug") unavailableReason = messages.ackConnectPlugFirst;
    else if (remembered) unavailableReason = messages.ackConnectWalletFirst;
    else unavailableReason = messages.ackSignInFirst;
  }

  const accept = useCallback(async () => {
    if (unavailableReason) throw new Error(unavailableReason);
    if (isExternal) {
      // Opens the OISY/NFID window synchronously from the click.
      const release = beginSession();
      try {
        await acceptAsWallet();
      } finally {
        release();
      }
    } else {
      await acceptAsII();
    }
    setAcceptedFor(activePrincipalText);
  }, [
    unavailableReason,
    isExternal,
    beginSession,
    acceptAsWallet,
    acceptAsII,
    activePrincipalText,
  ]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const isAccepting = iiAccept.isPending || walletAccept.isPending;
  const isError = signedIn && query.isError && !known;

  const value = useMemo<WalletTermsValue>(
    () => ({
      isOpen,
      open,
      close,
      status: {
        signedIn,
        known,
        accepted,
        needsAcceptance: signedIn && known && !accepted,
        isError,
      },
      unavailableReason,
      isAccepting,
      accept,
    }),
    [
      isOpen,
      open,
      close,
      signedIn,
      known,
      accepted,
      isError,
      unavailableReason,
      isAccepting,
      accept,
    ],
  );

  return (
    <WalletTermsContext.Provider value={value}>
      {children}
    </WalletTermsContext.Provider>
  );
}
