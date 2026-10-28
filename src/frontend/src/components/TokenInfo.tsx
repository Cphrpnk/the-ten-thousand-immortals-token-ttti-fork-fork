import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import type { Account, TechnicalDetails } from "../backend";
import {
  useCyclesStatus,
  useTechnicalDetails,
  useTokenInfo,
} from "../hooks/useQueries";
import { MINT_REVENUE_TEXT } from "../i18n/common";
import { type Lang, toIntlLocale, useDict, useLanguage } from "../i18n/core";
import {
  TECH_BACKEND_TEXT,
  TECH_EXPLORER_TEXT,
  TOKEN_INFO_TEXT,
} from "../i18n/pages/landing";
import { icpDashboardCanisterUrl } from "../lib/explorer";
import {
  PRICE_SCALE,
  TOKEN_PRICE_USD,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  encodeAccountText,
  formatBps,
  formatDecimal,
  formatIcpE8s,
  formatInteger,
  formatTtti,
  formatUnits,
  formatUsdE8,
  tttiToBuyerUsdE8,
  tttiToUsdE8,
  useCyclesFeeText,
} from "../lib/token";
import { ExplorerLink } from "./ExplorerLink";
import { useBtcPaymentText } from "./btcPaymentText";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

type TokenInfoText = (typeof TOKEN_INFO_TEXT)["en"];
type BackendText = (typeof TECH_BACKEND_TEXT)["en"];

const shellClass = "w-full rounded-lg border border-gold bg-card shadow-none";
const skeletonIds = ["maximum", "total", "price", "fee"];
const detailSkeletonIds = ["a", "b", "c", "d", "e", "f"];

function staticRows(t: TokenInfoText): DetailRow[] {
  return [
    { id: "source-code", label: t.sourceCode, value: t.notPublished },
    {
      id: "conversion",
      label: t.conversion,
      value: t.noConversion,
      wide: true,
    },
  ];
}

type DetailRow = {
  id: string;
  label: string;
  value: string;
  wide?: boolean;
  mono?: boolean;
  /** Canister ID row: value links to its ICP Dashboard canister page. */
  canister?: boolean;
};

/**
 * Shows a fixed English backend sentence in the active language; any other
 * value (a changed or unknown sentence) is shown exactly as returned.
 */
function translateBackend(value: string, local: BackendText): string {
  const english = TECH_BACKEND_TEXT.en;
  const key = (Object.keys(english) as Array<keyof BackendText>).find(
    (k) => english[k] === value,
  );
  return key ? local[key] : value;
}

function usd(whole: bigint): string {
  return `${formatInteger(whole)} USD`;
}

function buildRows(
  d: TechnicalDetails,
  t: TokenInfoText,
  local: BackendText,
  btcText: string,
): DetailRow[] {
  const sym = d.tokenSymbol || TTTI_SYMBOL;
  const dec = d.decimals;
  const ttti = (v: bigint) => `${formatTtti(v, dec)} ${sym}`;
  const tr = (v: string) => translateBackend(v, local);
  return [
    { id: "token-name", label: t.tokenName, value: d.tokenName, mono: true },
    { id: "symbol", label: t.symbol, value: sym, mono: true },
    {
      id: "decimals",
      label: t.decimals,
      value: dec.toString(),
      mono: true,
    },
    {
      id: "smallest-unit",
      label: t.smallestUnit,
      value: t.smallestUnitValue(
        d.smallestUnit.toString(),
        formatUnits(d.smallestUnit, dec, 0),
        sym,
      ),
    },
    { id: "max-supply", label: t.maximumSupply, value: ttti(d.maxSupply) },
    { id: "total-supply", label: t.totalSupply, value: ttti(d.totalSupply) },
    {
      id: "transfer-fee",
      label: t.transferFee,
      value: t.transferFeeValue(
        formatUnits(d.transferFee, dec, 0),
        sym,
        d.transferFee.toString(),
      ),
    },
    { id: "price", label: t.pricePerToken, value: usd(d.tokenPriceUsd) },
    { id: "buyer-price", label: t.buyerPrice, value: usd(d.buyerPriceUsd) },
    { id: "icp-fee", label: t.icpFee, value: formatBps(d.cyclesFeeBps) },
    {
      id: "min-purchase",
      label: t.minPurchase,
      value: t.minPurchaseValue(
        ttti(d.minPurchase),
        formatUsdE8(tttiToBuyerUsdE8(d.minPurchase), 2),
      ),
    },
    {
      id: "ledger-canister",
      label: t.ledgerCanister,
      value: d.ledgerCanisterId.toText(),
      mono: true,
      canister: true,
    },
    {
      id: "index-canister",
      label: t.indexCanister,
      value: d.ledgerCanisterId.toText(),
      mono: true,
      canister: true,
    },
    {
      id: "icp-ledger-canister",
      label: t.icpLedgerCanister,
      value: d.icpLedgerCanisterId.toText(),
      mono: true,
      canister: true,
    },
    {
      id: "ckbtc-minter",
      label: t.ckbtcMinter,
      value: d.ckbtcMinterId.toText(),
      mono: true,
      canister: true,
    },
    {
      id: "paying-in-btc",
      label: t.payingInBtc,
      value: btcText,
      wide: true,
    },
    { id: "standards", label: t.standards, value: d.standards.join(" · ") },
    {
      id: "price-sources",
      label: t.priceSources,
      value: d.oracleSources.map(tr).join(" · "),
      wide: true,
    },
    {
      id: "max-rate-age",
      label: t.maxRateAge,
      value: t.seconds(d.maxRateAgeSeconds.toString()),
    },
    {
      id: "refresh-policy",
      label: t.refreshPolicy,
      value: tr(d.refreshPolicy),
      wide: true,
    },
    {
      id: "rounding-rule",
      label: t.roundingRule,
      value: tr(d.roundingRule),
      wide: true,
    },
    {
      id: "excess-payment",
      label: t.excessPayment,
      value: tr(d.excessPaymentHandling),
      wide: true,
    },
    {
      id: "delivery-order",
      label: t.deliveryOrder,
      value: tr(d.deliveryOrder),
      wide: true,
    },
    {
      id: "controllers",
      label: t.controllers,
      value: d.controllers
        ? d.controllers.length > 0
          ? d.controllers.map((p) => p.toText()).join(", ")
          : t.none
        : t.notRead,
      wide: true,
      mono: d.controllers !== undefined && d.controllers.length > 0,
    },
    {
      id: "build-hash",
      label: t.buildHash,
      value: d.moduleHash || t.notRead,
      wide: true,
      mono: Boolean(d.moduleHash),
    },
    {
      id: "legacy-boundary",
      label: t.legacyBoundary,
      value: d.legacyBlockBoundary.toString(),
      mono: true,
    },
  ];
}

export function TokenInfo() {
  const { data: tokenInfo, isLoading, isError } = useTokenInfo();
  const technical = useTechnicalDetails();
  const t = useDict(TOKEN_INFO_TEXT);
  const backendText = useDict(TECH_BACKEND_TEXT);
  const btc = useBtcPaymentText();

  if (isLoading) {
    return (
      <Card className={shellClass} data-ocid="token.loading_state">
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent className="grid gap-8 sm:grid-cols-2">
          {skeletonIds.map((id) => (
            <Skeleton key={id} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !tokenInfo) {
    return (
      <Card className={shellClass} data-ocid="token.error_state">
        <CardHeader>
          <CardTitle className="font-display text-xl text-foreground">
            {t.errorTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.errorText}</p>
        </CardHeader>
      </Card>
    );
  }

  const decimals = tokenInfo.decimals || TTTI_DECIMALS;
  const symbol = tokenInfo.symbol || TTTI_SYMBOL;
  const feeUsd = Number(tttiToUsdE8(tokenInfo.fee)) / Number(PRICE_SCALE);
  const feeUsdText = formatDecimal(feeUsd, 2, 4);
  const details = technical.data;

  return (
    <Card className={shellClass} data-ocid="token.card">
      <CardHeader className="space-y-3 px-6 pb-4 pt-8 md:px-9 md:pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
          {t.eyebrow}
        </p>
        <CardTitle
          className="font-display text-2xl text-foreground md:text-3xl"
          data-ocid="token.name"
        >
          TTTI-T
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.liveFigures}
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-8 md:px-9 md:pb-10">
        <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          <Metric
            label={t.maximumSupply}
            value={formatTtti(tokenInfo.maxSupply, decimals)}
            unit={symbol}
          />
          <Metric
            label={t.totalSupply}
            value={formatTtti(tokenInfo.totalSupply, decimals)}
            unit={symbol}
          />
          <Metric
            label={t.referencePrice}
            value={formatInteger(TOKEN_PRICE_USD)}
            unit="USD"
          />
          <Metric
            label={t.transferFee}
            value={formatUnits(tokenInfo.fee, decimals, 0)}
            unit={symbol}
            note={`≈ ${feeUsdText} USD`}
          />
        </dl>

        <p className="border-t border-border/70 py-5 text-xs tracking-wide text-muted-foreground">
          {t.ledgerStandardsLine}
        </p>

        <details
          className="group border-t border-border/70 pt-5"
          data-ocid="token.technical.panel"
        >
          <summary
            className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
            data-ocid="token.technical.toggle"
          >
            {t.technicalDetails}
            <span
              aria-hidden="true"
              className="text-primary transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          {technical.isLoading ? (
            <div
              className="grid gap-5 pb-2 pt-5 sm:grid-cols-2"
              data-ocid="token.technical.loading_state"
            >
              {detailSkeletonIds.map((id) => (
                <Skeleton key={id} className="h-10 w-full" />
              ))}
            </div>
          ) : !details ? (
            <p
              className="pt-5 text-sm text-muted-foreground"
              data-ocid="token.technical.error_state"
            >
              {t.technicalError}
            </p>
          ) : null}
          <dl className="grid gap-5 pb-2 pt-5 sm:grid-cols-2">
            {details &&
              buildRows(
                details,
                t,
                backendText,
                `${btc.payment} ${btc.walletConversion}`,
              ).map((row) => <Detail key={row.id} row={row} />)}
            {details && (
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t.feeAccount}
                </dt>
                <dd className="mt-2">
                  <FeeAccount account={details.feeAccount} />
                </dd>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.feeAccountBalance}{" "}
                  {formatTtti(details.feeAccountBalance, details.decimals)}{" "}
                  {details.tokenSymbol || TTTI_SYMBOL}
                </p>
              </div>
            )}
            {details && <PayTokens details={details} />}
            {details && <CyclesReserve details={details} />}
            {staticRows(t).map((row) => (
              <Detail key={row.id} row={row} />
            ))}
          </dl>
        </details>
      </CardContent>
    </Card>
  );
}

function Detail({ row }: { row: DetailRow }) {
  const t = useDict(TOKEN_INFO_TEXT);
  const ex = useDict(TECH_EXPLORER_TEXT);
  return (
    <div className={`min-w-0 ${row.wide ? "sm:col-span-2" : ""}`}>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
        {row.label}
      </dt>
      <dd
        className={`mt-2 break-words text-sm text-foreground ${row.mono ? "font-mono break-all" : ""}`}
      >
        {row.canister && row.value ? (
          <ExplorerLink
            target={icpDashboardCanisterUrl(row.value)}
            label={ex.viewCanisterOnIcpDashboard}
            data-ocid={`token.technical.${row.id}.link`}
          >
            {row.value}
          </ExplorerLink>
        ) : (
          row.value || t.unavailable
        )}
      </dd>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  note,
}: { label: string; value: string; unit: string; note?: string }) {
  return (
    <div className="min-w-0 border-b border-border/70 py-6 first:pt-3 sm:[&:nth-child(-n+2)]:pt-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="min-w-0 break-all font-display text-2xl tabular-nums text-foreground md:text-[1.7rem]">
          {value}
        </span>
        <span className="text-xs font-medium tracking-wider text-primary">
          {unit}
        </span>
      </dd>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function formatNs(ns: bigint, lang: Lang, unavailable: string): string {
  const date = new Date(Number(ns / 1_000_000n));
  if (Number.isNaN(date.getTime())) return unavailable;
  return date.toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PayTokens({ details }: { details: TechnicalDetails }) {
  const t = useDict(TOKEN_INFO_TEXT);
  const cyclesFeeText = useCyclesFeeText();
  const ex = useDict(TECH_EXPLORER_TEXT);
  return (
    <div className="min-w-0 sm:col-span-2" data-ocid="token.pay_tokens.panel">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
        {t.acceptedPayTokens}
      </dt>
      <dd className="mt-2">
        <ul className="divide-y divide-border/70 border-y border-border/70">
          {details.payTokens.map((pay, index) => (
            <li
              key={pay.ledgerCanisterId.toText()}
              className="grid gap-x-6 gap-y-1 py-3 text-xs text-muted-foreground sm:grid-cols-[6rem_minmax(0,1fr)]"
              data-ocid={`token.pay_tokens.item.${index + 1}`}
            >
              <p className="text-sm font-medium text-foreground">
                {pay.symbol}
              </p>
              <div className="min-w-0 space-y-1">
                <p className="break-all font-mono text-foreground">
                  <ExplorerLink
                    target={icpDashboardCanisterUrl(
                      pay.ledgerCanisterId.toText(),
                    )}
                    label={ex.viewCanisterOnIcpDashboard}
                    data-ocid={`token.pay_tokens.link.${index + 1}`}
                  >
                    {pay.ledgerCanisterId.toText()}
                  </ExplorerLink>
                </p>
                <p className="tabular-nums">
                  {t.payTokenLine(
                    String(pay.decimals),
                    formatUnits(pay.ledgerFee, pay.decimals, 0),
                    pay.symbol,
                    pay.ledgerFee.toString(),
                    formatBps(pay.feeBps),
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p
          className="mt-3 text-sm leading-relaxed text-foreground"
          data-ocid="token.pay_tokens.fee_rule"
        >
          {cyclesFeeText}
        </p>
      </dd>
    </div>
  );
}

function CyclesReserve({ details }: { details: TechnicalDetails }) {
  const { data: cycles, isLoading } = useCyclesStatus();
  const t = useDict(TOKEN_INFO_TEXT);
  const { lang } = useLanguage();
  const mintRevenue = useDict(MINT_REVENUE_TEXT);
  const lastTopUp = cycles?.lastTopUp;
  const balanceText = isLoading
    ? t.loading
    : cycles
      ? formatIcpE8s(cycles.reserveBalanceE8s)
      : t.unavailable;
  const topUpText = isLoading
    ? t.loading
    : lastTopUp
      ? `${formatIcpE8s(lastTopUp.icpE8s)} · ${formatNs(lastTopUp.timestamp, lang, t.unavailable)}`
      : cycles
        ? t.noneYet
        : t.unavailable;

  return (
    <div
      className="min-w-0 sm:col-span-2"
      data-ocid="token.cycles_reserve.panel"
    >
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
        {t.cyclesReserve}
      </dt>
      <dd className="mt-2 space-y-3">
        <AccountCopy
          account={details.cyclesReserveAccount}
          name={t.cyclesReserveAccount}
          ocid="token.cycles_reserve_account"
        />
        <p
          className="text-sm leading-relaxed text-foreground"
          data-ocid="token.cycles_reserve.rule"
        >
          {mintRevenue.cyclesRule}
        </p>
        <div className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
          <p>
            {t.floor}{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatIcpE8s(details.reserveFloorE8s)}
            </span>
          </p>
          <p data-ocid="token.cycles_reserve.balance">
            {t.reserveBalance}{" "}
            <span className="font-mono tabular-nums text-foreground">
              {balanceText}
            </span>
          </p>
          <p data-ocid="token.cycles_reserve.last_top_up">
            {t.lastTopUp}{" "}
            <span className="tabular-nums text-foreground">{topUpText}</span>
          </p>
        </div>
      </dd>
    </div>
  );
}

function FeeAccount({ account }: { account: Account }) {
  const t = useDict(TOKEN_INFO_TEXT);
  return (
    <AccountCopy
      account={account}
      name={t.feeAccount}
      ocid="token.fee_collector_account"
    />
  );
}

function AccountCopy({
  account,
  name,
  ocid,
}: { account: Account; name: string; ocid: string }) {
  const t = useDict(TOKEN_INFO_TEXT);
  const [copied, setCopied] = useState(false);
  const fullText = encodeAccountText(account);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex min-w-0 items-center gap-2" data-ocid={ocid}>
      <span
        className="min-w-0 truncate font-mono text-xs text-foreground"
        title={fullText}
        aria-label={t.accountAria(name, fullText)}
      >
        {fullText}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary"
        aria-label={copied ? t.copiedAria(name) : t.copyAria(name)}
        onClick={() =>
          void navigator.clipboard
            .writeText(fullText)
            .then(() => setCopied(true))
            .catch(() => setCopied(false))
        }
        data-ocid={`${ocid}_copy_button`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
