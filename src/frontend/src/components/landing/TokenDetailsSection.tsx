import { useDict } from "../../i18n/core";
import {
  CAP_TEXT,
  HERO_TEXT,
  TOKEN_DETAILS_TEXT,
} from "../../i18n/pages/landing";
import { useCyclesFeeText, usePriceText } from "../../lib/token";
import { TokenInfo } from "../TokenInfo";

export function TokenDetailsSection() {
  const t = useDict(TOKEN_DETAILS_TEXT);
  const badges = useDict(HERO_TEXT);
  const cap = useDict(CAP_TEXT);
  const priceText = usePriceText();
  const cyclesFeeText = useCyclesFeeText();
  const facts = [
    { id: "max-supply", text: t.factMaxSupply },
    { id: "decimals", text: t.factDecimals },
    { id: "smallest-unit", text: t.factSmallestUnit },
    { id: "price", text: priceText },
    { id: "cycles-fee", text: cyclesFeeText },
    { id: "ledger", text: t.factLedger },
  ];
  return (
    <section
      id="token"
      aria-labelledby="token-title"
      className="scroll-mt-20 bg-background section-breathing"
      data-ocid="landing.token.section"
    >
      <div className="container mx-auto grid items-start gap-12 px-4 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="space-y-6 lg:pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t.label}
          </p>
          <h2
            id="token-title"
            className="font-display text-balance text-4xl leading-tight text-foreground md:text-5xl"
          >
            {t.title}
          </h2>
          <div className="max-w-md space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
            <p>{t.p3}</p>
          </div>
          <div
            className="max-w-md rounded-lg border border-gold bg-card p-6 shadow-none"
            data-ocid="landing.token.facts.panel"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
              {t.factsTitle}
            </h3>
            <ul className="mt-4 divide-y divide-border/70 text-sm text-foreground">
              {facts.map((fact) => (
                <li key={fact.id} className="py-2.5 leading-relaxed">
                  {fact.text}
                </li>
              ))}
            </ul>
            <p
              className="mt-4 border-t border-border/70 pt-4 text-sm leading-relaxed text-muted-foreground"
              data-ocid="landing.token.cap_note"
            >
              {cap.ttti}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <TokenInfo />
        </div>
      </div>
      <div className="container mx-auto mt-10 px-4">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-5 border-t border-border/70 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t.ledgerStandards}
          </p>
          <img
            src="/assets/badges/icrc1-token-standard.png"
            alt={badges.icrc1Alt}
            loading="lazy"
            className="h-10 w-auto rounded object-contain"
          />
          <img
            src="/assets/badges/icrc2-token-standard.png"
            alt={badges.icrc2Alt}
            loading="lazy"
            className="h-10 w-auto rounded object-contain"
          />
          <img
            src="/assets/badges/icrc3-token-standard.svg"
            alt={badges.icrc3Alt}
            loading="lazy"
            className="h-10 w-auto rounded object-contain"
          />
        </div>
      </div>
    </section>
  );
}
