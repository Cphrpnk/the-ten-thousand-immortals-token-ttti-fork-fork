import type { ReactNode } from "react";
import { useDict } from "../../i18n/core";
import { SETUP_TEXT } from "../../i18n/pages/setup";
import { SETUP_PAY_OPTIONS } from "../../lib/token";
import { PaymentTokenLogo } from "../../lib/tokenLogos";
import { DialogTitle } from "../ui/dialog";

export const STEP_COUNT = 3;

/** Segmented 3-step indicator with a mono counter. */
export function StepIndicator({ step }: { step: number }) {
  const t = useDict(SETUP_TEXT);
  return (
    <div
      className="flex flex-1 items-center gap-3"
      data-ocid="setup_flow.panel"
    >
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {["wallet", "sign-in", "icp"].map((id, index) => (
          <span
            key={id}
            className="step-segment"
            data-state={
              index + 1 < step ? "done" : index + 1 === step ? "active" : "todo"
            }
          />
        ))}
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        <span className="sr-only">{t.stepSr}</span>
        {step} / {STEP_COUNT}
      </span>
    </div>
  );
}

/** The single serif question of a setup screen. */
export function StepQuestion({ children }: { children: ReactNode }) {
  return (
    <DialogTitle className="text-balance text-center font-display text-3xl font-normal leading-tight text-foreground md:text-4xl">
      {children}
    </DialogTitle>
  );
}

/** Row of small logos of every accepted payment option (SETUP_PAY_OPTIONS). */
export function TokenLogoRow() {
  const t = useDict(SETUP_TEXT);
  return (
    <ul
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label={t.acceptedTokensAria}
      data-ocid="setup.pay_token.logo_list"
    >
      {SETUP_PAY_OPTIONS.map((option) => (
        <li key={option.id} title={option.symbol}>
          <PaymentTokenLogo id={option.id} size="sm" />
          <span className="sr-only">{option.symbol}</span>
        </li>
      ))}
    </ul>
  );
}
