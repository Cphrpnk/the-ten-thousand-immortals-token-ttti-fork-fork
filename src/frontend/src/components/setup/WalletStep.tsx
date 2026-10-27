import {
  ExternalLink,
  Link2,
  Plug,
  Plus,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ConnectedWalletKind,
  PLUG_INSTALL_URL,
  type SetupWalletKind,
  WalletConnectError,
  useConnectedWallet,
  walletErrorText,
} from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useDict } from "../../i18n/core";
import { SETUP_TEXT } from "../../i18n/pages/setup";
import { ChoiceTile } from "./ChoiceTile";
import { StepQuestion } from "./StepParts";
import { WalletChoiceStep } from "./WalletChoiceStep";

export type WalletScreen = "pickNo" | "pickYes" | "chooseWallet" | "createList";

interface WalletStepProps {
  screen: WalletScreen;
  onShowList: () => void;
  onChooseWallet: () => void;
  onBack: () => void;
  onConnected: (kind: SetupWalletKind) => void;
}

const OTHER_WALLETS = [
  { id: "oisy", name: "OISY", href: "https://oisy.com" },
  { id: "nfid", name: "NFID Wallet", href: "https://nfid.one" },
] as const;

const TITLE_KEY = {
  pickNo: "titlePickNo",
  pickYes: "titlePickYes",
  chooseWallet: "chooseWalletTitle",
  createList: "titleCreateList",
} as const satisfies Record<WalletScreen, string>;

/** Step 2: pick or connect a wallet. Sign-in happens right here. */
export function WalletStep({
  screen,
  onShowList,
  onChooseWallet,
  onBack,
  onConnected,
}: WalletStepProps) {
  const { identity, login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const wallet = useConnectedWallet();
  const t = useDict(SETUP_TEXT);
  const [pending, setPending] = useState<"builtIn" | "plug" | null>(null);
  const [failed, setFailed] = useState<"builtIn" | "plug" | null>(null);
  const [failText, setFailText] = useState<string>(t.signInFailed);
  const [plugOpened, setPlugOpened] = useState(false);
  const errorAtStart = useRef<Error | undefined>(undefined);
  const sawLoggingIn = useRef(false);
  const attemptedBuiltIn = useRef(false);
  const connectedBuiltIn = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const builtInReady = !!identity && !identity.getPrincipal().isAnonymous();
  const signInFailedText = t.signInFailed;

  const clearBuiltInTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Connect once after a builtIn attempt, whatever state login is in.
  const finishBuiltIn = useCallback(() => {
    if (connectedBuiltIn.current) return;
    connectedBuiltIn.current = true;
    clearBuiltInTimeout();
    setPending(null);
    setFailed(null);
    onConnected("builtIn");
  }, [clearBuiltInTimeout, onConnected]);

  useEffect(() => clearBuiltInTimeout, [clearBuiltInTimeout]);

  // Resolve the Internet Identity popup started by chooseBuiltIn.
  useEffect(() => {
    if (builtInReady && attemptedBuiltIn.current) {
      finishBuiltIn();
      return;
    }
    if (pending !== "builtIn") return;
    if (isLoggingIn) {
      sawLoggingIn.current = true;
      return;
    }
    const newError = isLoginError && loginError !== errorAtStart.current;
    if (newError || sawLoggingIn.current) {
      clearBuiltInTimeout();
      setPending(null);
      setFailed("builtIn");
      setFailText(signInFailedText);
    }
  }, [
    pending,
    builtInReady,
    isLoggingIn,
    isLoginError,
    loginError,
    finishBuiltIn,
    clearBuiltInTimeout,
    signInFailedText,
  ]);

  // Identity may land after pending/failure already settled on a pick screen.
  useEffect(() => {
    if (screen === "createList") return;
    if (builtInReady && attemptedBuiltIn.current) finishBuiltIn();
  }, [screen, builtInReady, finishBuiltIn]);

  const chooseBuiltIn = useCallback(() => {
    setFailed(null);
    if (builtInReady) {
      attemptedBuiltIn.current = true;
      connectedBuiltIn.current = true;
      clearBuiltInTimeout();
      setPending(null);
      onConnected("builtIn");
      return;
    }
    attemptedBuiltIn.current = true;
    connectedBuiltIn.current = false;
    errorAtStart.current = loginError;
    sawLoggingIn.current = false;
    setPending("builtIn");
    clearBuiltInTimeout();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setPending((current) => (current === "builtIn" ? null : current));
      setFailed("builtIn");
      setFailText(signInFailedText);
    }, 60_000);
    if (!isLoggingIn) login();
  }, [
    builtInReady,
    onConnected,
    loginError,
    login,
    isLoggingIn,
    clearBuiltInTimeout,
    signInFailedText,
  ]);

  const {
    kind: connectedKind,
    principal: connectedPrincipal,
    connect,
  } = wallet;
  const connectPlug = useCallback(() => {
    setFailed(null);
    if (connectedKind === "plug" && connectedPrincipal) {
      onConnected("plug");
      return;
    }
    setPending("plug");
    connect("plug").then(
      () => {
        setPending(null);
        onConnected("plug");
      },
      (error: unknown) => {
        setPending(null);
        setFailed("plug");
        setFailText(
          walletErrorText(
            error instanceof WalletConnectError ? error.code : "failed",
          ),
        );
      },
    );
  }, [connectedKind, connectedPrincipal, connect, onConnected]);

  const handleChoiceConnected = useCallback(
    (kind: ConnectedWalletKind) => {
      setFailed(null);
      onConnected(kind);
    },
    [onConnected],
  );

  const retry = () => {
    if (failed === "builtIn") chooseBuiltIn();
    else connectPlug();
  };

  const busy = pending !== null;
  const builtInTile = (
    ocid: string,
    disabled: boolean,
    description?: string,
  ) => (
    <ChoiceTile
      label={t.useBuiltIn}
      description={description}
      icon={<Wallet />}
      tone="primary"
      badge={t.recommended}
      onClick={chooseBuiltIn}
      loading={pending === "builtIn"}
      disabled={disabled}
      ocid={ocid}
    />
  );
  const connectPlugTile = (label: string, ocid: string) => (
    <ChoiceTile
      label={label}
      icon={<Link2 />}
      tone="plug"
      onClick={connectPlug}
      loading={pending === "plug"}
      disabled={busy}
      ocid={ocid}
    />
  );

  return (
    <>
      <StepQuestion>{t[TITLE_KEY[screen]]}</StepQuestion>
      {screen === "chooseWallet" ? (
        <WalletChoiceStep
          renderBuiltIn={(disabled) =>
            builtInTile(
              "setup.wallet_choice.builtin_button",
              disabled || busy,
              t.walletBuiltInDescription,
            )
          }
          builtInBusy={busy}
          onConnected={handleChoiceConnected}
          onBack={onBack}
        />
      ) : (
        <div className="flex w-full flex-col gap-3">
          {screen === "pickNo" ? (
            <>
              {builtInTile("setup.wallet.builtin_button", busy)}
              <ChoiceTile
                label={t.createWallet}
                icon={<Plus />}
                onClick={onShowList}
                disabled={busy}
                ocid="setup.wallet.create_button"
              />
            </>
          ) : null}
          {screen === "pickYes" ? (
            <>
              <ChoiceTile
                label={t.connectMyWallet}
                icon={<Link2 />}
                tone="plug"
                onClick={onChooseWallet}
                disabled={busy}
                ocid="setup.wallet.connect_button"
              />
              {builtInTile("setup.wallet.builtin_button", busy)}
            </>
          ) : null}
          {screen === "createList" ? (
            <>
              <ChoiceTile
                label="Plug"
                icon={<Plug />}
                tone="plug"
                href={PLUG_INSTALL_URL}
                onClick={() => setPlugOpened(true)}
                trailing={<ExternalLink />}
                ocid="setup.wallet.plug_link"
              />
              {plugOpened || wallet.plugAvailable
                ? connectPlugTile(
                    t.connectPlug,
                    "setup.wallet.plug_connect_button",
                  )
                : null}
              <p className="pt-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                {t.otherWallets}
              </p>
              {OTHER_WALLETS.map((item, index) => (
                <ChoiceTile
                  key={item.id}
                  label={item.name}
                  icon={<Wallet />}
                  tone="quiet"
                  href={item.href}
                  trailing={<ExternalLink />}
                  ocid={`setup.wallet.other_link.${index + 1}`}
                />
              ))}
            </>
          ) : null}
        </div>
      )}
      {failed ? (
        <div
          className="flex items-center justify-center gap-3 text-sm text-destructive"
          role="alert"
          data-ocid="setup.wallet.error_state"
        >
          <span>{failText}</span>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="setup.wallet.retry_button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t.tryAgain}
          </button>
        </div>
      ) : null}
    </>
  );
}
