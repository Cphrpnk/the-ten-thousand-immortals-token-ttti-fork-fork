import { Principal } from "@icp-sdk/core/principal";
import { ArrowDownToLine, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  type SetupExit,
  WALLET_BTC_HASH,
  WALLET_RECEIVE_HASH_PREFIX,
} from "../../hooks/useBuyFunnel";
import {
  type SetupWalletKind,
  useConnectedWallet,
} from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useWalletBalance } from "../../hooks/useWallet";
import { pickDict, useDict } from "../../i18n/core";
import { SETUP_TEXT } from "../../i18n/pages/setup";
import { ICP_LEDGER_CANISTER_ID } from "../../lib/icpLedger";
import { copyAddressAndOpenOnramper } from "../../lib/onramper";
import {
  BTC_PAY_OPTION,
  PAY_TOKENS,
  SETUP_PAY_OPTIONS,
  type SetupPayChoice,
  encodeAccountText,
} from "../../lib/token";
import { TokenLogoMark } from "../../lib/tokenLogos";
import { ChoiceTile } from "./ChoiceTile";
import { StepQuestion, TokenLogoRow } from "./StepParts";

export type IcpScreen = "hasPayToken" | "pickToken";

interface IcpStepProps {
  screen: IcpScreen;
  wallet: SetupWalletKind | null;
  onPickYes: () => void;
  /** Finish the setup as completed and leave through `exit` (default /buy). */
  onComplete: (exit?: SetupExit) => void;
  finishing: boolean;
}

const ICP_LEDGER = Principal.fromText(ICP_LEDGER_CANISTER_ID);
const POLL_MS = 4000;

/**
 * Step 3: payment token? Yes → pick a token, then the wallet (Receive panel or
 * BTC conversion). No → copy the address and open Onramper in one click.
 */
export function IcpStep({
  screen,
  wallet,
  onPickYes,
  onComplete,
  finishing,
}: IcpStepProps) {
  const { identity } = useInternetIdentity();
  const t = useDict(SETUP_TEXT);
  const { kind: connectedKind, principal: walletPrincipal } =
    useConnectedWallet();
  const owner =
    wallet && wallet !== "builtIn"
      ? connectedKind === wallet
        ? walletPrincipal
        : null
      : identity && !identity.getPrincipal().isAnonymous()
        ? identity.getPrincipal()
        : null;
  const address = owner ? encodeAccountText({ owner }) : "";
  const account = owner ? { owner } : undefined;
  const balanceQuery = useWalletBalance(ICP_LEDGER, account);
  const { refetch } = balanceQuery;
  const hasOwner = !!owner;
  const balance = balanceQuery.data;
  const hasIcp = balance !== undefined && balance > 0n;
  const finished = useRef(false);

  useEffect(() => {
    if (!hasOwner || screen !== "hasPayToken") return;
    const id = window.setInterval(() => void refetch(), POLL_MS);
    return () => window.clearInterval(id);
  }, [hasOwner, refetch, screen]);

  useEffect(() => {
    if (finished.current || screen !== "hasPayToken") return;
    if (hasIcp) {
      finished.current = true;
      onComplete();
    }
  }, [hasIcp, screen, onComplete]);

  const finishOnce = (exit: SetupExit) => {
    if (finished.current) return;
    finished.current = true;
    onComplete(exit);
  };

  const handleNo = () => {
    void copyAddressAndOpenOnramper(address).then((ok) => {
      const text = pickDict(SETUP_TEXT);
      if (ok) toast.success(text.copiedPasteOnramper);
      else toast.error(text.copyThenPaste);
    });
    finishOnce("stay");
  };

  const handlePick = (choice: SetupPayChoice) => {
    finishOnce({
      walletHash:
        choice === BTC_PAY_OPTION.id
          ? WALLET_BTC_HASH
          : `${WALLET_RECEIVE_HASH_PREFIX}${PAY_TOKENS[choice].ledgerCanisterId}`,
    });
  };

  if (screen === "pickToken") {
    return (
      <>
        <StepQuestion>{t.pickTokenTitle}</StepQuestion>
        <div className="flex w-full flex-col gap-3">
          {SETUP_PAY_OPTIONS.map((option) => (
            <ChoiceTile
              key={option.id}
              label={option.symbol}
              icon={<TokenLogoMark id={option.id} />}
              onClick={() => handlePick(option.id)}
              disabled={finishing}
              ocid={`setup.pay_token.option.${option.id}`}
            />
          ))}
        </div>
      </>
    );
  }

  const checking = (balanceQuery.isLoading && hasOwner) || hasIcp;
  return (
    <>
      <StepQuestion>{t.hasPayTokenQuestion}</StepQuestion>
      <TokenLogoRow />
      {checking ? (
        <div
          className="flex min-h-[11.5rem] items-center justify-center"
          data-ocid="setup.icp.check_loading_state"
        >
          <Loader2
            className="size-6 animate-spin text-primary"
            aria-label={t.checkingWallet}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <ChoiceTile
            label={t.yes}
            icon={<ArrowDownToLine />}
            onClick={onPickYes}
            ocid="setup.icp.yes_button"
          />
          <ChoiceTile
            label={t.no}
            icon={<CreditCard />}
            onClick={handleNo}
            disabled={!address || finishing}
            ocid="setup.icp.no_button"
          />
        </div>
      )}
    </>
  );
}
