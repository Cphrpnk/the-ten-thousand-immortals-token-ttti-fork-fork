import { DexAccordionGroup } from "../components/dex/DexAccordion";
import { RedeemPanel } from "../components/guarantee/RedeemPanel";
import { RedemptionHistory } from "../components/guarantee/RedemptionHistory";
import { ReserveSummary } from "../components/guarantee/ReserveSummary";
import { Button } from "../components/ui/button";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { useDict } from "../i18n/core";
import { GUARANTEE_TEXT } from "../i18n/pages/guarantee";

/** Rachat: public common reserve, redemption open to any holder, own redemption history. */
export function GuaranteePage() {
  const t = useDict(GUARANTEE_TEXT);
  const layout = useDict(LAYOUT_TEXT);
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const owner = principal && !principal.isAnonymous() ? principal : undefined;

  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 px-4 py-10 md:py-14"
      data-ocid="guarantee.page"
    >
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-4xl uppercase tracking-[0.25em] md:text-5xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-lg" data-ocid="guarantee.rule_summary">
          {t.ruleSummary}
        </p>
        <ul
          className="flex max-w-2xl list-disc flex-col gap-1 pl-5 text-muted-foreground"
          data-ocid="guarantee.rules"
        >
          <li>{t.rulePayout}</li>
          <li>{t.rulePayment}</li>
          <li>{t.ruleAnyHolder}</li>
          <li>{t.ruleMintLock}</li>
          <li>{t.ruleMintChoice}</li>
          <li>{t.ruleMintReserve}</li>
        </ul>
      </header>

      <ReserveSummary />

      {owner ? (
        <section
          className="rounded-lg border border-border bg-card p-5 md:p-6"
          data-ocid="guarantee.redeem.card"
        >
          <RedeemPanel owner={owner} />
        </section>
      ) : (
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
      )}

      {owner && (
        <DexAccordionGroup>
          <RedemptionHistory />
        </DexAccordionGroup>
      )}
    </div>
  );
}
