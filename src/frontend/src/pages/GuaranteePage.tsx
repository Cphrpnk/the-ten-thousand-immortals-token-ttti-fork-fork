import { RefreshCw } from "lucide-react";
import { DexAccordionGroup } from "../components/dex/DexAccordion";
import { GuaranteeAccounts } from "../components/guarantee/GuaranteeAccounts";
import { MassCard } from "../components/guarantee/MassCard";
import { RedemptionHistory } from "../components/guarantee/RedemptionHistory";
import { RuleExplanations } from "../components/guarantee/RuleExplanations";
import { UnclaimedTotal } from "../components/guarantee/UnclaimedTotal";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useGuaranteeMasses } from "../hooks/useGuarantee";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { useDict } from "../i18n/core";
import { GUARANTEE_TEXT } from "../i18n/pages/guarantee";
import { sortMasses } from "../lib/guarantee";

const MASS_SKELETONS = ["mass-skeleton-1", "mass-skeleton-2"];

/** "Ma garantie": public unclaimed total, then the person's masses and history. */
export function GuaranteePage() {
  const t = useDict(GUARANTEE_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const owner = principal && !principal.isAnonymous() ? principal : undefined;
  const masses = useGuaranteeMasses();
  const sorted = sortMasses(masses.data);

  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-10 md:py-14"
      data-ocid="guarantee.page"
    >
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl uppercase tracking-[0.25em] md:text-5xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{t.intro}</p>
      </header>

      <UnclaimedTotal />

      <DexAccordionGroup className="-mt-4">
        <GuaranteeAccounts />
      </DexAccordionGroup>
      {!owner ? (
        <div
          className="flex flex-col items-start gap-4 rounded-lg border border-border bg-card p-6"
          data-ocid="guarantee.signin_state"
        >
          <p className="text-sm text-muted-foreground">{t.signInPrompt}</p>
          <Button
            type="button"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            className="min-h-11"
            data-ocid="guarantee.signin_button"
          >
            {layout.signIn}
          </Button>
        </div>
      ) : masses.isPending ? (
        <div
          className="flex flex-col gap-4"
          aria-label={t.loading}
          data-ocid="guarantee.loading_state"
        >
          {MASS_SKELETONS.map((id) => (
            <Skeleton key={id} className="h-48 w-full" />
          ))}
        </div>
      ) : masses.isError ? (
        <div
          className="callout-danger flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
          data-ocid="guarantee.error_state"
        >
          <span>{t.loadError}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void masses.refetch()}
            className="min-h-11 sm:min-h-9"
            data-ocid="guarantee.retry_button"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.retryButton}
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="flex flex-col gap-1 rounded-lg border border-dashed border-border p-6"
          data-ocid="guarantee.empty_state"
        >
          <p className="font-medium">{t.emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6" data-ocid="guarantee.mass.list">
          {sorted.map((mass, i) => (
            <MassCard
              key={mass.token}
              mass={mass}
              owner={owner}
              index={i + 1}
            />
          ))}
        </div>
      )}

      <DexAccordionGroup>
        <RuleExplanations />
        {owner && <RedemptionHistory />}
      </DexAccordionGroup>
    </div>
  );
}
