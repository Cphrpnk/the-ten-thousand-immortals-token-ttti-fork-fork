import { motion } from "motion/react";
import { useDict } from "../../i18n/core";
import { STORY_TEXT } from "../../i18n/pages/landing";

const paragraphs = ["p1", "p2", "p3"] as const;

const epilogue = ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"] as const;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

export function StorySection() {
  const t = useDict(STORY_TEXT);
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="scroll-mt-20 bg-background py-20 md:py-28"
      data-ocid="landing.story.section"
    >
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          {...reveal}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {t.label}
          </p>
          <h2
            id="story-title"
            className="text-imperial text-balance text-3xl leading-tight text-foreground md:text-5xl"
          >
            {t.title}
          </h2>
          <div className="divider-gold max-w-24" />
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {paragraphs.map((key) => (
              <p key={key}>{t[key]}</p>
            ))}
          </div>
        </motion.div>

        <div
          className="mt-14 space-y-3 border-t border-border pt-8 text-sm italic leading-relaxed text-muted-foreground"
          data-ocid="landing.story.epilogue"
        >
          {epilogue.map((key) => (
            <p key={key}>{t[key]}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
