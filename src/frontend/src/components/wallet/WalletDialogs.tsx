import type { Account } from "../../backend";
import { useDict } from "../../i18n/core";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import { WALLET_EXPLORER_TEXT, WALLET_TEXT } from "../../i18n/pages/wallet";
import { payTokenSymbol } from "../../lib/token";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { ExplorerLink } from "../ExplorerLink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { PurchaseHistorySection } from "./PurchaseHistorySection";
import { ReceivePanel } from "./ReceivePanel";
import { SendPanel } from "./SendPanel";
import { SwapPanel } from "./SwapPanel";
import { isTttiToken } from "./TokenBalanceCard";
import { TttiMovements } from "./TttiMovements";
import { dashboardAccountUrl } from "./accountExplorer";
import { payTokenForLedger } from "./valuation";

/** Which wallet dialog is open, with the token chosen from a row (if any). */
export type WalletDialogState =
  | { kind: "send"; tokenId?: string }
  | { kind: "receive"; tokenId?: string }
  | { kind: "history"; tokenId: string }
  | { kind: "swap"; from?: string; to?: string }
  | null;

interface WalletDialogsProps {
  state: WalletDialogState;
  onClose: () => void;
  tokens: Array<TokenDescriptor>;
  account: Account | undefined;
  /** Purchase history is read for the Internet Identity caller only. */
  hasIi: boolean;
}

export function WalletDialogs({
  state,
  onClose,
  tokens,
  account,
  hasIi,
}: WalletDialogsProps) {
  const t = useDict(WALLET_TEXT);
  const ts = useDict(SWAP_TEXT);
  const open = state !== null;
  const historyToken =
    state?.kind === "history"
      ? tokens.find((tk) => tk.canisterId.toText() === state.tokenId)
      : undefined;
  // A new key per opening resets the form to the chosen token.
  const key = !state
    ? "closed"
    : state.kind === "swap"
      ? `swap-${state.from ?? ""}-${state.to ?? ""}`
      : `${state.kind}-${state.tokenId ?? "all"}`;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        data-ocid="wallet.dialog"
      >
        {state?.kind === "send" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t.send}</DialogTitle>
              <DialogDescription>{t.sendDescription}</DialogDescription>
            </DialogHeader>
            <SendPanel
              key={key}
              tokens={tokens}
              account={account}
              initialTokenId={state.tokenId}
            />
          </>
        )}
        {state?.kind === "receive" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t.receive}</DialogTitle>
              <DialogDescription>{t.receiveDescription}</DialogDescription>
            </DialogHeader>
            <ReceivePanel
              key={key}
              tokens={tokens}
              account={account}
              initialTokenId={state.tokenId}
            />
          </>
        )}
        {state?.kind === "history" && historyToken && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                {t.tokenHistoryTitle(historyToken.symbol)}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t.tokenHistoryTitle(historyToken.symbol)}
              </DialogDescription>
            </DialogHeader>
            <TokenHistory
              token={historyToken}
              account={account}
              hasIi={hasIi}
            />
          </>
        )}
        {state?.kind === "swap" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{t.swap}</DialogTitle>
              <DialogDescription>{ts.unifiedDescription}</DialogDescription>
            </DialogHeader>
            <SwapPanel
              key={key}
              tokens={tokens}
              account={account}
              initialFrom={state.from}
              initialTo={state.to}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TokenHistory({
  token,
  account,
  hasIi,
}: {
  token: TokenDescriptor;
  account: Account | undefined;
  hasIi: boolean;
}) {
  const t = useDict(WALLET_TEXT);
  const tx = useDict(WALLET_EXPLORER_TEXT);
  const payToken = payTokenForLedger(token.canisterId.toText());

  if (isTttiToken(token)) {
    return (
      <div className="flex flex-col gap-4">
        <TttiMovements account={account} />
        {hasIi ? (
          <PurchaseHistorySection />
        ) : (
          <p className="text-sm text-muted-foreground">{t.purchasesNeedIi}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {payToken && account && (
        <ExplorerLink
          target={dashboardAccountUrl(payToken, account.owner)}
          label={tx.viewOnIcpDashboard}
          className="self-start text-sm"
          data-ocid="wallet.token_history.dashboard_link"
        >
          {t.accountOnDashboard(token.symbol)}
        </ExplorerLink>
      )}
      {payToken && hasIi ? (
        <PurchaseHistorySection
          payToken={payToken}
          title={t.purchasesPaidWith(payTokenSymbol(payToken))}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{t.purchasesNeedIi}</p>
      )}
    </div>
  );
}
