import { ArrowLeft, ExternalLink, Plug, RotateCcw, Wallet } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  type ConnectedWalletKind,
  PLUG_INSTALL_URL,
  WALLET_NAMES,
  WalletConnectError,
  type WalletErrorCode,
  isMobileDevice,
  useConnectedWallet,
  walletErrorText,
} from "../../hooks/useConnectedWallet";
import { useDict } from "../../i18n/core";
import { SETUP_TEXT } from "../../i18n/pages/setup";
import { ChoiceTile } from "./ChoiceTile";

interface WalletChoiceStepProps {
  /** Built-in wallet tile, rendered by WalletStep (it owns the sign-in). */
  renderBuiltIn: (disabled: boolean) => ReactNode;
  builtInBusy: boolean;
  onConnected: (kind: ConnectedWalletKind) => void;
  onBack: () => void;
}

interface Failure {
  kind: ConnectedWalletKind;
  code: WalletErrorCode;
}

/** Step 2 Yes → "Connect my wallet": pick Plug, OISY or NFID Wallet. */
export function WalletChoiceStep({
  renderBuiltIn,
  builtInBusy,
  onConnected,
  onBack,
}: WalletChoiceStepProps) {
  const t = useDict(SETUP_TEXT);
  const wallet = useConnectedWallet();
  const [pending, setPending] = useState<ConnectedWalletKind | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [mobile] = useState(isMobileDevice);

  const plugMissing =
    mobile ||
    !wallet.plugAvailable ||
    (failure?.kind === "plug" &&
      (failure.code === "notInstalled" ||
        failure.code === "mobileUnsupported"));

  // Called straight from the click so the wallet window opens immediately.
  const choose = (kind: ConnectedWalletKind) => {
    setFailure(null);
    if (wallet.kind === kind && wallet.principal) {
      onConnected(kind);
      return;
    }
    setPending(kind);
    wallet.connect(kind).then(
      () => {
        setPending(null);
        onConnected(kind);
      },
      (error: unknown) => {
        setPending(null);
        setFailure({
          kind,
          code: error instanceof WalletConnectError ? error.code : "failed",
        });
      },
    );
  };

  const busy = pending !== null || builtInBusy;
  // The Plug notice already explains a missing extension on mobile.
  const showError =
    failure !== null &&
    !(failure.kind === "plug" && failure.code === "mobileUnsupported");

  const tiles: {
    kind: ConnectedWalletKind;
    description: string;
    ocid: string;
  }[] = [
    {
      kind: "plug",
      description: t.walletPlugDescription,
      ocid: "setup.wallet_choice.plug_button",
    },
    {
      kind: "oisy",
      description: t.walletOisyDescription,
      ocid: "setup.wallet_choice.oisy_button",
    },
    {
      kind: "nfid",
      description: t.walletNfidDescription,
      ocid: "setup.wallet_choice.nfid_button",
    },
  ];

  return (
    <>
      <div className="flex w-full flex-col gap-3">
        {renderBuiltIn(busy)}
        {tiles.map((tile) => (
          <div key={tile.kind} className="flex flex-col gap-2">
            <ChoiceTile
              label={WALLET_NAMES[tile.kind]}
              description={tile.description}
              icon={tile.kind === "plug" ? <Plug /> : <Wallet />}
              tone={tile.kind === "plug" ? "plug" : "default"}
              onClick={() => choose(tile.kind)}
              loading={pending === tile.kind}
              disabled={busy}
              ocid={tile.ocid}
            />
            {tile.kind === "plug" && plugMissing ? (
              <p
                className="px-1 text-left text-xs text-muted-foreground"
                data-ocid="setup.wallet_choice.plug_notice"
              >
                {t.walletPlugMobile}{" "}
                <a
                  href={PLUG_INSTALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid="setup.wallet_choice.plug_install_link"
                >
                  {t.walletInstallPlug}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? t.walletConnecting(WALLET_NAMES[pending]) : ""}
      </p>
      {showError && failure ? (
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 text-sm text-destructive"
          role="alert"
          data-ocid="setup.wallet_choice.error_state"
        >
          <span>{walletErrorText(failure.code)}</span>
          <button
            type="button"
            onClick={() => choose(failure.kind)}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            data-ocid="setup.wallet_choice.retry_button"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {t.walletRetry}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onBack}
        disabled={pending !== null}
        className="mx-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        data-ocid="setup.wallet_choice.back_button"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.walletChoiceBack}
      </button>
    </>
  );
}
