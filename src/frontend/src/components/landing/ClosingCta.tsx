import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useDict } from "../../i18n/core";
import { CLOSING_TEXT } from "../../i18n/pages/landing";
import { CrestLogo } from "../Footer";
import { BuyTttiButton } from "../funnel/BuyTttiButton";

interface ClosingCtaProps {
  id: string;
}

export function ClosingCta({ id }: ClosingCtaProps) {
  const t = useDict(CLOSING_TEXT);
  return (
    <section
      id={id}
      aria-labelledby="closing-title"
      className="relative overflow-hidden bg-background pb-28 pt-20 md:py-28"
      data-ocid="landing.closing.section"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-pattern-imperial [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 glow-crest"
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="container relative mx-auto flex flex-col items-center gap-6 px-4 text-center"
      >
        <CrestLogo
          loading="lazy"
          className="h-20 w-20 shadow-gold md:h-24 md:w-24"
        />
        <h2
          id="closing-title"
          className="text-imperial text-balance text-3xl leading-tight text-foreground md:text-6xl"
        >
          {t.titleLead}
          <span className="text-gradient-gold">{t.titleAccent}</span>
        </h2>
        <p className="max-w-xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
          {t.readBefore}
          <Link
            to="/white-paper"
            className="text-primary underline-offset-4 transition-colors hover:underline focus-visible:underline"
            data-ocid="landing.closing.whitepaper_link"
          >
            {t.readLink}
          </Link>
          {t.readAfter}
        </p>
        <BuyTttiButton
          size="lg"
          showIcon
          className="mt-2"
          ocid="landing.closing.primary_button"
        />
      </motion.div>
    </section>
  );
}
