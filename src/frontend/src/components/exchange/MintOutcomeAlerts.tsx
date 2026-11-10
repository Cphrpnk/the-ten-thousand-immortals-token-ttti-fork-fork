import { Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Undo2 } from "lucide-react";
import type {
  LiquidityMintError,
  LiquidityMintResult,
  PayToken,
} from "../../backend";
import { useMintPricePreview } from "../../hooks/useMintPreview";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_LIQUIDITY_TEXT, BUY_PAGE_TEXT } from "../../i18n/pages/buy";
import { PAY_TOKENS, formatPayAmount } from "../../lib/token";
import { FiatAmount } from "../FiatAmount";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { describeMintError, formatMintTtti } from "./liquidityMint";
import { MINT_RESERVE_TEXT } from "./mintReserveText";
import { safePurchaseMessage } from "./purchaseOutcome";

/** What the last mint attempt produced; turned into text in the active language. */
export type MintOutcomeSource =
  | { kind: "minted"; result: LiquidityMintResult; token: PayToken }
  | { kind: "refused"; error: LiquidityMintError; token: PayToken }
  | { kind: "approval"; token: PayToken; message: string }
  | { kind: "thrown"; message: string | null };

/** Success and error alerts of a mint attempt. */
export function MintOutcomeAlerts({
  source,
}: { source: MintOutcomeSource | null }) {
  const t = useDict(BUY_PAGE_TEXT);
  const tl = useDict(BUY_LIQUIDITY_TEXT);
  const r = useDict(MINT_RESERVE_TEXT);
  const { lang } = useLanguage();
  const mintPreview = useMintPricePreview().data;
  if (!source) return null;

  if (source.kind === "minted") {
    const { result, token } = source;
    return (
      <Alert
        className="border-gold-strong bg-primary/10 shadow-gold"
        data-ocid="exchange.success_state"
      >
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertTitle className="font-display text-base tabular-nums">
          {tl.successTitle(formatMintTtti(result.tttiAmount))}
          <FiatAmount
            token="ttti"
            amount={result.tttiAmount}
            className="ml-1.5"
            ocid="exchange.success.minted_fiat"
          />
        </AlertTitle>
        <AlertDescription className="space-y-1 text-xs tabular-nums">
          <p>
            {tl.successPaid(
              formatPayAmount(result.totalPaid, token),
              result.mintId.toString(),
            )}
            <FiatAmount
              token={token}
              amount={result.totalPaid}
              className="ml-1.5"
              ocid="exchange.success.paid_fiat"
            />
          </p>
          <p data-ocid="exchange.success.position">
            {result.positionId !== undefined &&
              `${tl.successPosition(result.positionId.toString())}. `}
            {tl.successHoldings(
              formatPayAmount(result.positionTokenAmount, token),
              formatMintTtti(result.positionTttiAmount),
            )}
          </p>
          <p>
            {r.successReserve(
              formatPayAmount(result.reserveAmount, result.reserveToken),
            )}
          </p>
          <Link
            to="/pools"
            hash="my-liquidity"
            className="inline-block pt-1 font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="exchange.success.positions_link"
          >
            {tl.successLink}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const notice =
    source.kind === "refused"
      ? describeMintError(source.error, source.token, "mint", lang, mintPreview)
      : source.kind === "approval"
        ? {
            title: t.approvalFailed(PAY_TOKENS[source.token].symbol),
            message: source.message,
            refunded: false,
          }
        : {
            title: t.purchaseNotCompleted,
            message:
              source.message !== null
                ? safePurchaseMessage(source.message, lang)
                : t.purchaseNotSubmitted,
            refunded: false,
          };
  return (
    <Alert
      variant={notice.refunded ? "default" : "destructive"}
      className={notice.refunded ? "border-warning/50 bg-warning/10" : ""}
      data-ocid="exchange.error_state"
    >
      {notice.refunded ? (
        <Undo2 className="h-4 w-4 text-warning" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{notice.title}</AlertTitle>
      {notice.message.trim() && (
        <AlertDescription>{notice.message}</AlertDescription>
      )}
    </Alert>
  );
}
