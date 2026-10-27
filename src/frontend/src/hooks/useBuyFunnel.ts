import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { SetupFlow } from "../components/funnel/SetupFlow";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import { type SetupPayChoice, isSetupPayChoice } from "../lib/token";
import { hasSeenWhitePaper, markWhitePaperSeen } from "../lib/whitePaperGate";
import { useConnectedWallet } from "./useConnectedWallet";
import { useInternetIdentity } from "./useInternetIdentity";
import { SetupOutcome, SetupStatus, useSetupStatus } from "./useSetupStatus";

export { SetupOutcome, hasSeenWhitePaper, markWhitePaperSeen };
export type { SetupPayChoice };

/** Route of the buy page. */
export const BUY_PATH = "/buy";

/** /wallet hash that opens the Receive dialog on a ledger: receive-<ledgerId>. */
export const WALLET_RECEIVE_HASH_PREFIX = "receive-";
/** /wallet hash that scrolls to the BTC → ckBTC conversion. */
export const WALLET_BTC_HASH = "wallet-btc";

/**
 * Where finishSetup goes: "buy" (default, /buy + mint card), "stay" (no
 * navigation) or /wallet with the given hash.
 */
export type SetupExit = "buy" | "stay" | { walletHash: string };

const MINT_CARD_SELECTOR =
  '[data-ocid="exchange.form_card"], [data-ocid="exchange.connect_card"]';
const MINT_CARD_WAIT_MS = 2000;
const PAY_CHOICE_STORAGE_KEY = "ttti.setup.payChoice";

function storePayChoice(choice: SetupPayChoice | null): void {
  try {
    if (choice) window.sessionStorage.setItem(PAY_CHOICE_STORAGE_KEY, choice);
    else window.sessionStorage.removeItem(PAY_CHOICE_STORAGE_KEY);
  } catch {
    // Storage unavailable: the in-memory value still works for this page.
  }
}

function readStoredPayChoice(): SetupPayChoice | null {
  try {
    const value = window.sessionStorage.getItem(PAY_CHOICE_STORAGE_KEY);
    return isSetupPayChoice(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * After the navigation settles, scroll the mint card into view (retrying until
 * it renders, for about 2 s). Falls back to the top of the page. Also runs when
 * the user is already on /buy.
 */
function scrollToMintCard(navigation: Promise<unknown>): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const run = () => {
    const deadline = Date.now() + MINT_CARD_WAIT_MS;
    const tick = () => {
      const element = document.querySelector(MINT_CARD_SELECTOR);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (Date.now() >= deadline) {
        window.scrollTo({ top: 0 });
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  };
  navigation.then(run, run);
}

export interface BuyFunnelContextValue {
  /**
   * First click in this browser → white paper (flag recorded); then signed
   * out or setup not started → setup flow; otherwise → /buy.
   */
  startBuy: () => void;
  /** Open the setup flow from step 1 (menu "Set up wallet"). */
  openSetup: () => void;
  /** Close the setup flow without recording an outcome. */
  closeSetup: () => void;
  /**
   * Save #completed / #skipped, close the flow and go to /buy (or to `exit`).
   * When a payment option is given, /buy preselects it once (see
   * consumePreselectedPayChoice).
   */
  finishSetup: (
    outcome: SetupOutcome,
    payChoice?: SetupPayChoice,
    exit?: SetupExit,
  ) => Promise<void>;
  /**
   * Payment option chosen in setup step 3, returned once then cleared; null
   * when none was chosen (/buy keeps ICP).
   */
  consumePreselectedPayChoice: () => SetupPayChoice | null;
  /**
   * Incremented on every finishSetup; /buy watches it to consume the choice
   * again when the flow finishes while the page is already mounted.
   */
  payChoiceVersion: number;
  /** True when an Internet Identity session or an external wallet is connected. */
  isSignedIn: boolean;
  /** Current setup status of the signed-in user (notStarted when signed out). */
  setupStatus: SetupStatus;
  isSetupOpen: boolean;
  /** True while finishSetup is saving the outcome. */
  isFinishingSetup: boolean;
}

const BuyFunnelContext = createContext<BuyFunnelContextValue | undefined>(
  undefined,
);

/**
 * Shared Buy TTTI-T funnel. Must be rendered inside the router so it can
 * navigate. Renders the guided SetupFlow dialog once for the whole app.
 */
export function BuyFunnelProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { principal: walletPrincipal } = useConnectedWallet();
  const {
    principalText,
    status,
    isLoading,
    hasSeen,
    markSeen,
    saveOutcome,
    isSaving,
  } = useSetupStatus();
  const [open, setOpen] = useState(false);
  // Bumped on every fresh open so SetupFlow remounts at step 1.
  const [session, setSession] = useState(0);
  const prompted = useRef<Set<string>>(new Set());
  // Payment option chosen in setup, kept until /buy consumes it.
  const preselectedPayChoice = useRef<SetupPayChoice | null>(null);
  const [payChoiceVersion, setPayChoiceVersion] = useState(0);

  const isSignedIn = !!identity || !!walletPrincipal;

  const openSetup = useCallback(() => {
    setSession((current) => current + 1);
    setOpen(true);
  }, []);

  const closeSetup = useCallback(() => {
    setOpen(false);
  }, []);

  // First sign-in: show the setup flow once per principal, then record it as
  // seen in this browser so it does not open by itself again (even on reload).
  // If the flow is already open (the sign-in happened inside it), keep its step.
  useEffect(() => {
    if (!principalText || isLoading) return;
    if (prompted.current.has(principalText)) return;
    prompted.current.add(principalText);
    if (hasSeen || status !== SetupStatus.notStarted) return;
    markSeen();
    if (!open) setSession((s) => s + 1);
    setOpen(true);
  }, [principalText, isLoading, hasSeen, status, open, markSeen]);

  const startBuy = useCallback(() => {
    if (!hasSeenWhitePaper()) {
      markWhitePaperSeen();
      void navigate({ to: "/white-paper" });
      return;
    }
    const needsSetup =
      !isSignedIn ||
      (!!principalText && !isLoading && status === SetupStatus.notStarted);
    if (needsSetup) {
      openSetup();
      return;
    }
    scrollToMintCard(navigate({ to: BUY_PATH }));
  }, [isSignedIn, principalText, isLoading, status, openSetup, navigate]);

  const finishSetup = useCallback(
    async (
      outcome: SetupOutcome,
      payChoice?: SetupPayChoice,
      exit: SetupExit = "buy",
    ) => {
      // A finish without a choice clears any stale one so it is never applied
      // on a later, unrelated arrival on /buy.
      preselectedPayChoice.current = payChoice ?? null;
      storePayChoice(payChoice ?? null);
      setPayChoiceVersion((current) => current + 1);
      try {
        await saveOutcome(outcome);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : pickDict(MESSAGES_TEXT).setupNotSaved,
        );
      }
      setOpen(false);
      if (exit === "stay") return;
      if (exit === "buy") {
        scrollToMintCard(navigate({ to: BUY_PATH }));
        return;
      }
      void navigate({ to: "/wallet", hash: exit.walletHash });
    },
    [saveOutcome, navigate],
  );

  const consumePreselectedPayChoice = useCallback(() => {
    const choice = preselectedPayChoice.current ?? readStoredPayChoice();
    preselectedPayChoice.current = null;
    if (choice) storePayChoice(null);
    return choice;
  }, []);

  const value = useMemo<BuyFunnelContextValue>(
    () => ({
      startBuy,
      openSetup,
      closeSetup,
      finishSetup,
      consumePreselectedPayChoice,
      payChoiceVersion,
      isSignedIn,
      setupStatus: status,
      isSetupOpen: open,
      isFinishingSetup: isSaving,
    }),
    [
      startBuy,
      openSetup,
      closeSetup,
      finishSetup,
      consumePreselectedPayChoice,
      payChoiceVersion,
      isSignedIn,
      status,
      open,
      isSaving,
    ],
  );

  return createElement(
    BuyFunnelContext.Provider,
    { value },
    children,
    createElement(SetupFlow, {
      key: session,
      open,
      onOpenChange: (next: boolean) => {
        if (next) setOpen(true);
        else closeSetup();
      },
    }),
  );
}

export function useBuyFunnel(): BuyFunnelContextValue {
  const context = useContext(BuyFunnelContext);
  if (!context) {
    throw new Error("useBuyFunnel must be used within a BuyFunnelProvider");
  }
  return context;
}
