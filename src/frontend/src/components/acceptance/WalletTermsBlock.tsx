import { Link } from "@tanstack/react-router";
import { useId } from "react";
import { SITE_TEXT } from "../../i18n/common/site";
import { useDict } from "../../i18n/core/dict";
import { BUY_PAGE_TEXT } from "../../i18n/pages/buy";

/** The six points, in order, with their existing text keys. */
const POINTS = [
  { id: "read-first", titleKey: "wtPoint1Title", textKey: "ackReadFirst" },
  { id: "no-rights", titleKey: "wtPoint2Title", textKey: "ackNoRights" },
  { id: "price-zero", titleKey: "wtPoint3Title", textKey: "ackPriceZero" },
  { id: "icp-creator", titleKey: "wtPoint4Title", textKey: "ackIcpCreator" },
  { id: "no-profit", titleKey: "wtPoint5Title", textKey: "ackNoProfit" },
  { id: "afford-loss", titleKey: "wtPoint6Title", textKey: "ackAffordLoss" },
] as const;

interface WalletTermsBlockProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Prefix of the data-ocid markers. */
  ocidPrefix?: string;
  /** Called when the white paper link is followed. */
  onNavigate?: () => void;
}

/** The six wallet-terms points in one block, then a single checkbox. */
export function WalletTermsBlock({
  checked,
  onCheckedChange,
  disabled = false,
  ocidPrefix = "wallet_terms",
  onNavigate,
}: WalletTermsBlockProps) {
  const t = useDict(BUY_PAGE_TEXT);
  const site = useDict(SITE_TEXT);
  const checkboxId = useId();

  return (
    <fieldset
      className="space-y-3 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid={`${ocidPrefix}.panel`}
    >
      <legend className="px-1 text-xs text-muted-foreground">
        {t.ackLegend}
      </legend>
      <ol className="space-y-3">
        {POINTS.map((point, index) => (
          <li
            key={point.id}
            className="flex gap-3 text-sm"
            data-ocid={`${ocidPrefix}.point.${index + 1}`}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-strong bg-gradient-primary font-mono text-xs font-bold tabular-nums text-primary-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="min-w-0 space-y-0.5">
              <h3 className="font-semibold text-foreground">
                {t[point.titleKey]}
              </h3>
              <p className="text-muted-foreground">{t[point.textKey]}</p>
            </div>
          </li>
        ))}
      </ol>
      {site.conflictNotice && (
        <p
          className="px-1 text-xs text-muted-foreground"
          data-ocid={`${ocidPrefix}.conflict_notice`}
        >
          {site.conflictNotice}
        </p>
      )}
      <Link
        to="/white-paper"
        hash="reading-notice"
        onClick={onNavigate}
        className="inline-block px-1 text-xs font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-ocid={`${ocidPrefix}.white_paper.link`}
      >
        {t.ackWhitePaperLink}
      </Link>
      <label
        htmlFor={checkboxId}
        className="flex min-h-11 cursor-pointer items-start gap-3 border-t border-border pt-3 text-sm font-medium text-foreground"
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
          data-ocid={`${ocidPrefix}.checkbox`}
        />
        <span className="min-w-0">{t.wtAcceptLabel}</span>
      </label>
    </fieldset>
  );
}
