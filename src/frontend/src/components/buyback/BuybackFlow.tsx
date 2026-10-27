import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Buyback, PayToken } from "../../backend";
import {
  useBuybackMasses,
  useBuybackQuote,
  useRequestBuyback,
} from "../../hooks/useBuyback";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCanisterPrincipal,
  useIcrc1BalanceOf,
  useIcrc1Fee,
  useIcrc2Allowance,
} from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core";
import { BUYBACK_TEXT } from "../../i18n/pages/buyback";
import { isAllowanceExpired } from "../../lib/approvals";
import {
  buybackCap,
  buybackFailureMessage,
  formatAmountReturned,
  formatBuybackPercent,
  formatMassRatio,
  formatTttiQuantity,
  massTttiAmount,
  offerableMasses,
  payToUsdE8,
} from "../../lib/buyback";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  formatInteger,
  formatPayAmount,
  formatUsdE8,
  payTokenSymbol,
  tttiToUsdE8,
} from "../../lib/token";
import { PercentBar, type PercentBarText } from "../exchange/WalletPercentBar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { BuybackApproval } from "./BuybackApproval";
import { BuybackBreakdown } from "./BuybackBreakdown";
import { BuybackDetails } from "./BuybackDetails";
import { BuybackResult } from "./BuybackResult";

const ERROR_CLASS =
  "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive";

/**
 * Buyback of a share of one average mass: choose the mass (payment token)
 * and the percentage of its remainder, read the quote, approve TTTI-T,
 * confirm, then see the result. The buyback is paid in the mass token.
 */
export function BuybackFlow({
  initialMassToken,
}: { initialMassToken?: PayToken }) {
  const t = useDict(BUYBACK_TEXT);
  const { lang } = useLanguage();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const caller = principal && !principal.isAnonymous() ? principal : undefined;
  const masses = useBuybackMasses();
  const { data: contract } = useGetCanisterPrincipal();
  const request = useRequestBuyback();

  const [selected, setSelected] = useState<PayToken | undefined>(
    initialMassToken,
  );
  const [percent, setPercent] = useState<number | null>(null);
  const [approved, setApproved] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Buyback | null>(null);

  const options = offerableMasses(masses.data);
  const mass = options.find((m) => m.token === selected);
  const receiveToken = mass?.token;
  const quotable = !!mass && !mass.inProgress;

  // Cap: min(remaining mass, usable TTTI-T wallet balance), interface only.
  const balanceQuery = useIcrc1BalanceOf(
    caller ? { owner: caller } : undefined,
  );
  const feeQuery = useIcrc1Fee();
  const allowanceQuery = useIcrc2Allowance(
    caller && contract
      ? { account: { owner: caller }, spender: { owner: contract } }
      : undefined,
  );
  const allowanceData = allowanceQuery.data;
  const activeAllowance =
    allowanceData &&
    !isAllowanceExpired({
      allowance: allowanceData.allowance,
      expiresAt: allowanceData.expires_at,
    })
      ? allowanceData.allowance
      : 0n;
  const capLoading =
    balanceQuery.isPending || feeQuery.isPending || allowanceQuery.isPending;
  const cap =
    mass && balanceQuery.data !== undefined && feeQuery.data !== undefined
      ? buybackCap(
          mass.remainingTtti,
          balanceQuery.data,
          feeQuery.data,
          activeAllowance,
          percent ?? 100,
        )
      : undefined;
  const capReady = !!cap && !allowanceQuery.isPending;
  const tooLow = capReady && cap.massPercent === null;
  const massPercent = capReady && percent !== null ? cap.massPercent : null;

  const quote = useBuybackQuote(
    quotable ? mass.token : undefined,
    quotable ? massPercent : null,
    receiveToken,
  );

  const reset = () => {
    setApproved(false);
    setConfirmed(false);
    setError(null);
  };

  if (!caller) {
    return (
      <p
        className="callout-info px-3 py-2 text-sm"
        data-ocid="buyback.signin_state"
      >
        {t.signInRequired}
      </p>
    );
  }
  if (result) {
    return (
      <BuybackResult
        buyback={result}
        onNew={() => {
          setResult(null);
          setSelected(undefined);
          setPercent(null);
          reset();
        }}
      />
    );
  }
  if (masses.isPending) {
    return (
      <div className="flex flex-col gap-2" data-ocid="buyback.loading_state">
        <span className="sr-only">{t.loading}</span>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }
  if (masses.isError) {
    return (
      <div
        className="flex items-center justify-between gap-2 text-sm text-destructive"
        data-ocid="buyback.error_state"
      >
        <span>{t.loadError}</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void masses.refetch()}
          data-ocid="buyback.retry_button"
        >
          {t.retry}
        </Button>
      </div>
    );
  }
  if (options.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="buyback.empty_state"
      >
        {t.noEligible}
      </p>
    );
  }

  const submit = async () => {
    if (!mass || massPercent === null || !receiveToken) return;
    setError(null);
    try {
      setResult(
        await request.mutateAsync({
          massToken: mass.token,
          percent: massPercent,
          receiveToken,
        }),
      );
    } catch (failure) {
      setError(buybackFailureMessage(failure, lang));
      setConfirmed(false);
    }
  };

  const tooLowText =
    cap && mass
      ? t.capTooLow(
          formatTttiQuantity(cap.usable, lang),
          formatBuybackPercent(1, lang),
          formatTttiQuantity((mass.remainingTtti + 99n) / 100n, lang),
        )
      : t.errNothingRemaining;
  const percentText: PercentBarText = {
    percentConnect: t.signInRequired,
    percentLoading: t.loading,
    percentBalanceUnavailable: t.loadError,
    percentNotCover: () => tooLowText,
    percentShare:
      capReady && cap.walletLimited ? t.percentShareCapped : t.percentShare,
    percentSummary: () =>
      massPercent === null || !mass
        ? ""
        : t.percentSummary(
            formatBuybackPercent(massPercent, lang),
            formatTttiQuantity(
              massTttiAmount(mass.remainingTtti, massPercent),
              lang,
            ),
          ),
    percentComputedOn: () => t.percentRequired,
  };

  return (
    <div className="flex flex-col gap-4" data-ocid="buyback.flow">
      <div className="flex flex-col gap-2">
        <Label htmlFor="buyback-mass">{t.massLabel}</Label>
        <Select
          value={mass ? mass.token : ""}
          onValueChange={(value) => {
            setSelected(value as PayToken);
            setPercent(null);
            reset();
          }}
          disabled={request.isPending}
        >
          <SelectTrigger
            id="buyback-mass"
            className="rounded-lg"
            data-ocid="buyback.mass.select"
          >
            <SelectValue placeholder={t.massPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((m) => (
              <SelectItem key={m.token} value={m.token}>
                {t.massOption(
                  payTokenSymbol(m.token),
                  formatTttiQuantity(m.remainingTtti, lang),
                  formatPayAmount(m.remainingNet, m.token, lang),
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mass && (
        <dl
          className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-muted/50 p-3 text-sm"
          data-ocid="buyback.mass.details"
        >
          <dt className="text-muted-foreground">{t.massPurchasesLabel}</dt>
          <dd className="text-right font-mono tabular-nums">
            {formatInteger(Number(mass.purchaseCount), lang)}
          </dd>
          <dt className="text-muted-foreground">{t.massRemainingTttiLabel}</dt>
          <dd className="text-right font-mono tabular-nums break-words">
            {formatTttiQuantity(mass.remainingTtti, lang)}
          </dd>
          <dt className="text-muted-foreground">{t.massRemainingNetLabel}</dt>
          <dd className="text-right font-mono tabular-nums break-words">
            {formatPayAmount(mass.remainingNet, mass.token, lang)}
          </dd>
          <dt className="text-muted-foreground">{t.massRatioLabel}</dt>
          <dd className="text-right font-mono tabular-nums break-words">
            {formatMassRatio(mass.token, mass.totalNet, mass.totalTtti, lang) ??
              t.notRecorded}
          </dd>
        </dl>
      )}

      {mass?.inProgress && (
        <p
          className="callout-warning px-3 py-2 text-sm"
          data-ocid="buyback.mass.in_progress_state"
        >
          {t.massInProgress}
        </p>
      )}

      {quotable && (
        <PercentBar
          symbol={TTTI_SYMBOL}
          decimals={TTTI_DECIMALS}
          ledgerFee={0n}
          feeCount={0}
          balance={capReady ? (tooLow ? 0n : cap.max) : undefined}
          balanceLoading={capLoading}
          walletConnected
          percent={tooLow ? null : percent}
          currentAmount={0n}
          disabled={request.isPending}
          text={percentText}
          formatAmount={(amount) => formatTttiQuantity(amount, lang)}
          ocidPrefix="buyback.percent_bar"
          onSelect={(value) => {
            setPercent(value);
            reset();
          }}
        />
      )}

      {quotable && capReady && cap.walletLimited && !tooLow && (
        <p
          className="callout-info px-3 py-2 text-xs tabular-nums"
          data-ocid="buyback.cap.notice"
        >
          {t.capNotice(
            formatTttiQuantity(cap.usable, lang),
            formatTttiQuantity(mass.remainingTtti, lang),
          )}
        </p>
      )}

      {quotable && massPercent !== null && quote.isLoading && (
        <div
          className="flex flex-col gap-2"
          data-ocid="buyback.quote.loading_state"
        >
          <span className="sr-only">{t.quoteLoading}</span>
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      )}
      {quotable && massPercent !== null && quote.isError && (
        <p
          className={ERROR_CLASS}
          role="alert"
          data-ocid="buyback.quote.error_state"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {buybackFailureMessage(quote.error, lang)}
        </p>
      )}

      {quotable && massPercent !== null && quote.data && contract && (
        <>
          <section className="flex flex-col gap-2">
            <h4 className="font-display text-sm font-medium">{t.quoteTitle}</h4>
            <BuybackDetails figures={quote.data} />
            <p className="text-xs text-muted-foreground">{t.quoteNote}</p>
          </section>

          <BuybackBreakdown quote={quote.data} />

          <BuybackApproval
            key={`${mass.token}-${quote.data.tttiAllowanceRequired}`}
            owner={caller}
            spender={contract}
            required={quote.data.tttiAllowanceRequired}
            onReadyChange={setApproved}
          />

          {approved && (
            <section
              className="flex flex-col gap-3 rounded-lg border border-gold bg-background/40 p-3"
              data-ocid="buyback.request.panel"
            >
              <h4 className="font-display text-sm font-medium">
                {t.step2Title}
              </h4>
              <p className="text-sm">
                {t.requestIntro(
                  formatTttiQuantity(quote.data.tttiAmount, lang),
                  formatAmountReturned(quote.data, lang),
                )}
              </p>
              <p className="callout-warning px-3 py-2 text-xs">
                {t.warnIrreversible}
              </p>
              <p className="text-sm" data-ocid="buyback.request.summary">
                {t.summarySend(
                  formatTttiQuantity(quote.data.tttiAmount, lang),
                  formatUsdE8(tttiToUsdE8(quote.data.tttiAmount), 2, lang),
                  formatAmountReturned(quote.data, lang),
                  formatUsdE8(
                    payToUsdE8(
                      quote.data.amountReturned,
                      quote.data.tokenReturned,
                      quote.data.returnedRateUsdE8,
                    ),
                    2,
                    lang,
                  ),
                )}
              </p>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="buyback-request-confirm"
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                  disabled={request.isPending}
                  className="mt-0.5"
                  data-ocid="buyback.request.confirm.checkbox"
                />
                <Label
                  htmlFor="buyback-request-confirm"
                  className="text-xs leading-snug"
                >
                  {t.requestConfirm}
                </Label>
              </div>
              {error && (
                <p
                  className={ERROR_CLASS}
                  role="alert"
                  data-ocid="buyback.request.error_state"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  disabled={request.isPending}
                  className="rounded-lg"
                  data-ocid="buyback.request.cancel_button"
                >
                  {t.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={() => void submit()}
                  disabled={
                    !confirmed || request.isPending || massPercent === null
                  }
                  className="rounded-lg shadow-gold"
                  data-ocid="buyback.request.confirm_button"
                >
                  {request.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.requesting}
                    </>
                  ) : (
                    t.requestButton
                  )}
                </Button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
