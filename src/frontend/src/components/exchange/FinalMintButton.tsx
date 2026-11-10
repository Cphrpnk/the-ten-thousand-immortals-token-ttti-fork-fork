import { AlertCircle, CheckCircle2, Loader2, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { PayToken } from "../../backend";
import {
  BtcDepositFailure,
  btcDepositErrorMessage,
} from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_BTC_TEXT, BUY_PAGE_TEXT } from "../../i18n/pages/buy";
import {
  TTTI_SYMBOL,
  formatPayAmount,
  formatSats,
  formatTtti,
} from "../../lib/token";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { MintRefusedError, describeMintError } from "./liquidityMint";
import {
  type ConvertState,
  type MintSourceKind,
  type MintSources,
  pickMintSource,
} from "./mintSources";

const FINAL_BUTTON =
  "min-h-14 w-full gap-2 rounded-lg border border-gold-strong bg-gradient-primary text-lg font-semibold tracking-wide text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:opacity-70 disabled:shadow-none";

interface FinalMintButtonProps {
  token: PayToken;
  symbol: string;
  sources: MintSources;
  /** Text of the running step, or null when nothing runs. */
  busyLabel: string | null;
  /** Sale closed or paused: the button stays disabled. */
  blocked?: boolean;
  /** Backend preview of the chosen amount, shown before the click. */
  preview?: string;
  onMint: (source: MintSourceKind) => void;
  /** Progress, success or error shown under the button. */
  notice?: ReactNode;
  /** Transfer offer shown when every balance is zero. */
  offer?: ReactNode;
  ocidPrefix: string;
}

/** Big last Mint button: active as soon as one of the three balances is not zero. */
export function FinalMintButton({
  token,
  symbol,
  sources,
  busyLabel,
  blocked = false,
  preview,
  onMint,
  notice,
  offer,
  ocidPrefix,
}: FinalMintButtonProps) {
  const t = useDict(BUY_PAGE_TEXT);
  const source = pickMintSource(sources);
  const busy = busyLabel !== null;
  const empty = sources.known && source === null;

  const sourceText =
    source === "contract"
      ? t.finalSourceContract(formatPayAmount(sources.held, PayToken.ckbtc))
      : source === "wallet"
        ? t.finalSourceWallet(formatPayAmount(sources.wallet ?? 0n, token))
        : source === "dex"
          ? t.finalSourceDex(formatPayAmount(sources.dex ?? 0n, token))
          : null;

  return (
    <section
      className="space-y-3"
      aria-label={t.finalMint(TTTI_SYMBOL)}
      data-ocid={`${ocidPrefix}.section`}
    >
      {sourceText !== null && (
        <div
          className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
          data-ocid={`${ocidPrefix}.source`}
        >
          <span className="text-muted-foreground">{t.finalSourceLabel}: </span>
          <span className="font-medium tabular-nums">{sourceText}</span>
          {source === "wallet" && preview !== undefined && (
            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
              {preview}
            </p>
          )}
        </div>
      )}
      {empty && (
        <p
          className="text-sm text-muted-foreground"
          data-ocid={`${ocidPrefix}.fund_first`}
        >
          {t.finalFundFirst(symbol)}
        </p>
      )}
      {empty && offer}
      <Button
        type="button"
        className={cn(FINAL_BUTTON)}
        disabled={busy || blocked || source === null}
        aria-busy={busy}
        onClick={() => source !== null && onMint(source)}
        data-ocid={`${ocidPrefix}.primary_button`}
      >
        {(busy || !sources.known) && (
          <Loader2
            className="h-5 w-5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
            data-ocid={`${ocidPrefix}.loading_state`}
          />
        )}
        {busyLabel ??
          (sources.known ? t.finalMint(TTTI_SYMBOL) : t.finalChecking)}
      </Button>
      {notice}
    </section>
  );
}

/** Result of a held-ckBTC conversion, in the active language. */
export function ConvertNotice({ state }: { state: ConvertState }) {
  const t = useDict(BUY_BTC_TEXT);
  const { lang } = useLanguage();
  if (state.kind === "idle" || state.kind === "working") return null;

  if (state.kind === "failed") {
    const { error } = state;
    const message =
      error instanceof MintRefusedError
        ? describeMintError(error.refusal, PayToken.ckbtc, "mint", lang).message
        : error instanceof BtcDepositFailure
          ? btcDepositErrorMessage(error.code, lang)
          : error instanceof Error && error.message
            ? error.message
            : t.requestFailed;
    return (
      <Alert variant="destructive" data-ocid="exchange.final_mint.error_state">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t.convertFailedTitle}</AlertTitle>
        <AlertDescription className="space-y-1">
          <span className="block">{message}</span>
          <span className="block">{t.convertNothingTaken}</span>
        </AlertDescription>
      </Alert>
    );
  }

  const { delivered, refunded, stillHeld, cause } = state.summary;
  const nothing = delivered === 0n && refunded === 0n && stillHeld === 0n;
  return (
    <div className="space-y-3" data-ocid="exchange.final_mint.result">
      {delivered > 0n && (
        <Alert
          className="border-gold-strong bg-primary/10 shadow-gold"
          data-ocid="exchange.final_mint.success_state"
        >
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle className="tabular-nums">
            {t.convertDelivered(formatTtti(delivered))}
          </AlertTitle>
        </Alert>
      )}
      {refunded > 0n && (
        <Alert
          className="border-warning/50 bg-warning/10"
          data-ocid="exchange.final_mint.refunded_state"
        >
          <Undo2 className="h-4 w-4 text-warning" />
          <AlertTitle className="tabular-nums">
            {t.convertRefunded(formatSats(refunded, "ckBTC"))}
          </AlertTitle>
          {cause !== undefined && (
            <AlertDescription className="break-words">
              {t.refundCause(cause)}
            </AlertDescription>
          )}
        </Alert>
      )}
      {stillHeld > 0n && (
        <Alert data-ocid="exchange.final_mint.held_state">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="tabular-nums">
            {t.convertStillHeld(formatSats(stillHeld, "ckBTC"))}
          </AlertTitle>
          {cause !== undefined && (
            <AlertDescription className="break-words">
              {t.refundCause(cause)}
            </AlertDescription>
          )}
        </Alert>
      )}
      {nothing && (
        <Alert data-ocid="exchange.final_mint.empty_state">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.convertNothing}</AlertTitle>
        </Alert>
      )}
    </div>
  );
}
