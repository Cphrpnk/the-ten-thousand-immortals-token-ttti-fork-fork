import { RefreshCw } from "lucide-react";
import { DexToken, PayToken } from "../../backend";
import { useGuaranteeAccounts } from "../../hooks/useGuarantee";
import { useDict, useLanguage } from "../../i18n/core";
import type { Lang } from "../../i18n/core/lang";
import { GUARANTEE_TEXT } from "../../i18n/pages/guarantee";
import { formatTokenQuantity, formatTttiQuantity } from "../../lib/guarantee";
import { cn } from "../../lib/utils";
import { FiatAmount, type FiatToken } from "../FiatAmount";
import { DexAccordion } from "../dex/DexAccordion";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

/** Display order: TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT. */
const TOKEN_ORDER: ReadonlyArray<DexToken> = [
  DexToken.tttiT,
  DexToken.icp,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
];

const PAY_OF_DEX: Record<Exclude<DexToken, DexToken.tttiT>, PayToken> = {
  [DexToken.icp]: PayToken.icp,
  [DexToken.ckbtc]: PayToken.ckbtc,
  [DexToken.ckusdc]: PayToken.ckusdc,
  [DexToken.ckusdt]: PayToken.ckusdt,
};

function formatAmount(amount: bigint, token: DexToken, lang: Lang): string {
  return token === DexToken.tttiT
    ? formatTttiQuantity(amount, lang)
    : formatTokenQuantity(amount, PAY_OF_DEX[token], lang);
}

function fiatTokenOf(token: DexToken): FiatToken {
  return token === DexToken.tttiT ? "ttti" : PAY_OF_DEX[token];
}

/** Public check of each guarantee account against the sum of its masses. */
export function GuaranteeAccounts() {
  const t = useDict(GUARANTEE_TEXT);
  const { lang } = useLanguage();
  const query = useGuaranteeAccounts();

  const accounts = [...(query.data ?? [])].sort(
    (a, b) => TOKEN_ORDER.indexOf(a.token) - TOKEN_ORDER.indexOf(b.token),
  );

  return (
    <DexAccordion label={t.accountsTitle} ocid="guarantee.accounts">
      <p className="text-sm text-muted-foreground">{t.accountsIntro}</p>

      {query.isPending ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="guarantee.accounts.loading_state"
        >
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : query.isError ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="guarantee.accounts.error_state"
        >
          <span>{t.accountsLoadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            className="min-h-11 sm:min-h-9"
            data-ocid="guarantee.accounts.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.retryButton}
          </Button>
        </div>
      ) : (
        <ul
          className="flex flex-col divide-y divide-border border-y border-border"
          data-ocid="guarantee.accounts.list"
        >
          {accounts.map((account, i) => {
            const difference = account.accountBalance - account.massTotal;
            return (
              <li
                key={account.token}
                className="flex flex-col gap-2 py-3 text-sm"
                data-ocid={`guarantee.accounts.item.${i + 1}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">
                    {t.accountsMassTotal}
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    data-ocid={`guarantee.accounts.mass_total.${i + 1}`}
                  >
                    {formatAmount(account.massTotal, account.token, lang)}
                    <FiatAmount
                      token={fiatTokenOf(account.token)}
                      amount={account.massTotal}
                      className="ml-1.5"
                      ocid={`guarantee.accounts.mass_total_fiat.${i + 1}`}
                    />
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">
                    {t.accountsBalance}
                  </span>
                  <span
                    className="font-mono tabular-nums"
                    data-ocid={`guarantee.accounts.balance.${i + 1}`}
                  >
                    {formatAmount(account.accountBalance, account.token, lang)}
                    <FiatAmount
                      token={fiatTokenOf(account.token)}
                      amount={account.accountBalance}
                      className="ml-1.5"
                      ocid={`guarantee.accounts.balance_fiat.${i + 1}`}
                    />
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span
                    className={cn(
                      "text-xs uppercase tracking-wider",
                      account.equal ? "text-primary" : "text-destructive",
                    )}
                    data-ocid={`guarantee.accounts.status.${i + 1}`}
                  >
                    {account.equal ? t.accountsEqual : t.accountsMismatch}
                  </span>
                  {!account.equal && difference !== 0n && (
                    <span className="text-xs text-muted-foreground">
                      {difference < 0n
                        ? t.accountsBalanceBelow(
                            formatAmount(-difference, account.token, lang),
                          )
                        : t.accountsBalanceAbove(
                            formatAmount(difference, account.token, lang),
                          )}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DexAccordion>
  );
}
