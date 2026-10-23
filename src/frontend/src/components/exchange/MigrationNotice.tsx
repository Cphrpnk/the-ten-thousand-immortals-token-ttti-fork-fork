import { ArrowDown, ExternalLink, Info } from "lucide-react";
import { useState } from "react";
import { useDict } from "../../i18n/core/dict";
import { BUY_PANELS_TEXT } from "../../i18n/pages/buy";
import { TTTI_SYMBOL } from "../../lib/token";
import { Button } from "../ui/button";

const SESSION_KEY = "ttti-migration-notice-hidden";

const WALLETS = [
  { name: "Plug", url: "https://plugwallet.ooo" },
  { name: "NNS", url: "https://nns.ic0.app" },
  { name: "OISY", url: "https://oisy.com" },
];

/** Step ids and their BUY_PANELS_TEXT keys. */
const STEPS = [
  {
    id: "create",
    title: "migrationStep1Title",
    body: "migrationStep1Body",
  },
  {
    id: "copy",
    title: "migrationStep2Title",
    body: "migrationStep2Body",
  },
  {
    id: "paste",
    title: "migrationStep3Title",
    body: "migrationStep3Body",
  },
] as const;

function readHidden(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Shown to Internet Identity buyers who have not saved a delivery address. */
export function MigrationNotice() {
  const t = useDict(BUY_PANELS_TEXT);
  const [hidden, setHidden] = useState(readHidden);

  if (hidden) return null;

  const handleLater = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage unavailable: hide for this page view only.
    }
    setHidden(true);
  };

  const handleAdd = () => {
    document
      .getElementById("delivery-address")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("delivery-address-input")?.focus({
      preventScroll: true,
    });
  };

  return (
    <section
      aria-labelledby="migration-notice-title"
      className="rounded-xl border border-gold bg-gradient-surface p-4 shadow-elevated sm:p-5"
      data-ocid="migration.panel"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2
              id="migration-notice-title"
              className="font-display text-lg font-semibold"
            >
              {t.migrationTitle(TTTI_SYMBOL)}
            </h2>
            <p className="text-sm text-muted-foreground">{t.migrationBody}</p>
          </div>

          <ol className="grid gap-2 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.id}
                className="flex gap-2.5 rounded-lg border border-border bg-background/60 p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-strong bg-gradient-primary font-mono text-xs font-bold tabular-nums text-primary-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{t[step.title]}</p>
                  <p className="text-xs text-muted-foreground">
                    {t[step.body]}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {WALLETS.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gold bg-transparent px-3 text-sm font-medium transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid={`migration.${wallet.name.toLowerCase()}_link`}
                >
                  {wallet.name}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">{t.opensNewTab}</span>
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="rounded-lg border border-gold-strong bg-gradient-primary font-semibold text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
                onClick={handleAdd}
                data-ocid="migration.primary_button"
              >
                <ArrowDown className="h-4 w-4" />
                {t.migrationAdd}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-lg text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary"
                onClick={handleLater}
                data-ocid="migration.cancel_button"
              >
                {t.migrationLater}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
