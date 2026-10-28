import type { Principal } from "@icp-sdk/core/principal";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { PayToken } from "../../backend";
import {
  type ClaimMintFeeError,
  type MintFeeClaimStatus,
  useClaimMintFee,
  useMyMintFees,
} from "../../hooks/useDex";
import { MINT_REVENUE_TEXT } from "../../i18n/common";
import { useDict, useLanguage } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { formatPayAmount, payTokenSymbol } from "../../lib/token";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { formatDexDate } from "./dexFormat";

type MintText = (typeof MINT_REVENUE_TEXT)["en"];
type Feedback = { token: PayToken; tone: "info" | "danger"; text: string };

function claimStatusLabel(m: MintText, status: MintFeeClaimStatus): string {
  switch (status.__kind__) {
    case "completed":
      return m.statusSent;
    case "inProgress":
      return m.statusPending;
    case "needsReview":
      return m.statusReview;
    case "failed":
      return `${m.statusFailed}: ${status.failed}`;
  }
}

function claimErrorText(
  m: MintText,
  err: ClaimMintFeeError,
  token: PayToken,
): string {
  switch (err.__kind__) {
    case "anonymous":
      return m.errClaimAnonymous;
    case "nothingToClaim":
      return m.errClaimNothing;
    case "belowLedgerFee":
      return m.errClaimBelowFee(formatPayAmount(err.belowLedgerFee.fee, token));
    case "claimInProgress":
      return m.errClaimInProgress;
  }
}

/** The signed-in user's mint fee shares (MF) per paid token, with claims. */
export function MintFeePanel({ owner }: { owner: Principal | undefined }) {
  const m = useDict(MINT_REVENUE_TEXT);
  const t = useDict(DEX_TEXT);
  const { lang } = useLanguage();
  const fees = useMyMintFees(owner?.toText());
  const claim = useClaimMintFee();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const data = fees.data;

  const onClaim = (token: PayToken) => {
    setFeedback(null);
    claim.mutate(token, {
      onSuccess: (outcome) =>
        setFeedback(
          outcome.__kind__ === "ok"
            ? {
                token,
                tone: "info",
                text: m.claimDone(
                  formatPayAmount(outcome.ok.amount, outcome.ok.token, lang),
                ),
              }
            : {
                token,
                tone: "danger",
                text: claimErrorText(m, outcome.err, token),
              },
        ),
      onError: (err) =>
        setFeedback({ token, tone: "danger", text: t.errCall(err.message) }),
    });
  };

  return (
    <div className="flex flex-col gap-3" data-ocid="pools.mint_fees.panel">
      <h3 className="font-display text-xl tracking-wide">{m.mintFeesTitle}</h3>
      <p className="text-xs text-muted-foreground">{m.mintFeesScope}</p>
      {!owner ? (
        <p
          className="text-sm text-muted-foreground"
          data-ocid="pools.mint_fees.signin_state"
        >
          {m.mintFeesSignIn}
        </p>
      ) : fees.isPending ? (
        <Skeleton
          className="h-24 rounded-lg"
          aria-label={m.mintFeesLoading}
          data-ocid="pools.mint_fees.loading_state"
        />
      ) : fees.isError || !data ? (
        <p
          className="callout-danger px-3 py-2 text-sm"
          data-ocid="pools.mint_fees.error_state"
        >
          {m.mintFeesLoadError}
        </p>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 text-sm">
          {data.balances.length === 0 ? (
            <p
              className="text-muted-foreground"
              data-ocid="pools.mint_fees.empty_state"
            >
              {m.mintFeesEmpty}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                data-ocid="pools.mint_fees.table"
              >
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-1.5 pe-3 text-start font-normal">
                      {m.colToken}
                    </th>
                    <th className="py-1.5 pe-3 text-end font-normal">
                      {m.colClaimable}
                    </th>
                    <th className="py-1.5 pe-3 text-end font-normal">
                      {m.colClaimed}
                    </th>
                    <th className="py-1.5 text-end font-normal">
                      <span className="sr-only">{m.claimsTitle}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.balances.map((b, i) => {
                    const pending =
                      claim.isPending && claim.variables === b.token;
                    const symbol = payTokenSymbol(b.token);
                    return (
                      <tr
                        key={b.token}
                        className="border-b border-border last:border-0"
                        data-ocid={`pools.mint_fees.row.${i + 1}`}
                      >
                        <td className="py-1.5 pe-3">{symbol}</td>
                        <td className="py-1.5 pe-3 text-end">
                          {formatPayAmount(b.claimable, b.token, lang)}
                        </td>
                        <td className="py-1.5 pe-3 text-end">
                          {formatPayAmount(b.claimed, b.token, lang)}
                        </td>
                        <td className="py-1.5 text-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onClaim(b.token)}
                            disabled={claim.isPending || b.claimable === 0n}
                            data-ocid={`pools.mint_fees.claim_button.${i + 1}`}
                          >
                            {pending && (
                              <Loader2
                                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                                aria-hidden="true"
                              />
                            )}
                            {pending ? m.claiming : m.claimButton(symbol)}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {feedback && (
            <p
              aria-live="polite"
              className={`${feedback.tone === "info" ? "callout-info text-foreground" : "callout-danger"} px-3 py-2 text-sm break-words`}
              data-ocid={
                feedback.tone === "info"
                  ? "pools.mint_fees.success_state"
                  : "pools.mint_fees.claim_error_state"
              }
            >
              {feedback.text}
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="font-medium">{m.claimsTitle}</p>
            {data.claims.length === 0 ? (
              <p
                className="text-xs text-muted-foreground"
                data-ocid="pools.mint_fees.claims_empty_state"
              >
                {m.claimsEmpty}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-xs tabular-nums">
                {data.claims.map((c, i) => (
                  <li
                    key={c.n.toString()}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                    data-ocid={`pools.mint_fees.claim.item.${i + 1}`}
                  >
                    <span>{formatPayAmount(c.amount, c.token, lang)}</span>
                    <span className="text-muted-foreground break-words">
                      {formatDexDate(c.createdAt, lang)} ·{" "}
                      {claimStatusLabel(m, c.status)}
                    </span>
                    <span className="w-full font-mono text-muted-foreground break-all">
                      {c.memoText}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
