import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useDict } from "../../i18n/core";
import {
  CAP_TEXT,
  FAQ_TEXT,
  TECH_BACKEND_TEXT,
} from "../../i18n/pages/landing";
import { useCyclesFeeText, usePriceText } from "../../lib/token";
import { useBtcPaymentText } from "../btcPaymentText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const linkClass =
  "font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-smooth hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

function useFaqs(): { id: string; question: string; answer: ReactNode }[] {
  const t = useDict(FAQ_TEXT);
  const cap = useDict(CAP_TEXT);
  const rateText = useDict(TECH_BACKEND_TEXT).refreshPolicy;
  const priceText = usePriceText();
  const cyclesFeeText = useCyclesFeeText();
  const btc = useBtcPaymentText();
  return [
    {
      id: "what",
      question: t.whatQ,
      answer: (
        <>
          {t.whatA} {priceText} {cyclesFeeText} {t.noReturns}
        </>
      ),
    },
    {
      id: "icp",
      question: t.icpQ,
      answer: (
        <>
          {t.icpBefore}
          <Link
            to="/buy-icp"
            className={linkClass}
            data-ocid="landing.faq.buy_icp_link"
          >
            {t.icpLink}
          </Link>
          {t.icpAfter}
        </>
      ),
    },
    {
      id: "btc",
      question: t.btcQ,
      answer: (
        <>
          {btc.payment} {btc.walletConversion}
        </>
      ),
    },
    {
      id: "rate",
      question: t.rateQ,
      answer: <>{rateText}</>,
    },
    {
      id: "wallets",
      question: t.walletsQ,
      answer: <>{t.walletsA}</>,
    },
    {
      id: "where",
      question: t.whereQ,
      answer: (
        <>
          {t.whereBefore}
          <Link
            to="/wallet"
            className={linkClass}
            data-ocid="landing.faq.wallet_link"
          >
            {t.whereLink}
          </Link>
          {t.whereAfter}
        </>
      ),
    },
    {
      id: "supply",
      question: t.supplyQ,
      answer: (
        <>
          {t.supplyIntro} {cap.ttti} {cap.tttiT}
        </>
      ),
    },
    {
      id: "privacy",
      question: t.privacyQ,
      answer: <>{t.privacyA}</>,
    },
  ];
}

export function FaqSection() {
  const t = useDict(FAQ_TEXT);
  const faqs = useFaqs();
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="section-breathing scroll-mt-20 bg-card/40"
      data-ocid="landing.faq.section"
    >
      <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t.label}
          </p>
          <h2
            id="faq-title"
            className="text-imperial text-balance text-3xl leading-tight text-foreground md:text-5xl"
          >
            {t.title}
          </h2>
          <p className="text-base text-muted-foreground">{t.intro}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="surface-open border-t border-border"
          data-ocid="landing.faq.list"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-border"
              data-ocid={`landing.faq.item.${index + 1}`}
            >
              <AccordionTrigger
                className="py-6 text-left font-display text-lg text-foreground transition-smooth hover:text-primary hover:no-underline md:py-7 md:text-xl [&[data-state=open]]:text-primary"
                data-ocid={`landing.faq.toggle.${index + 1}`}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-7 text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
