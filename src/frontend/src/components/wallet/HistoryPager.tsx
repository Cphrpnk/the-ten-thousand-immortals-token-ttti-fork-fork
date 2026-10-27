import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDict, useLanguage } from "../../i18n/core";
import { formatNumber } from "../../i18n/core";
import { WALLET_TEXT } from "../../i18n/pages/wallet";
import { Button } from "../ui/button";

const OUTLINE_GOLD =
  "rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

/** Previous / Next controls with the current page number (1-based). */
export function HistoryPager({
  page,
  hasNext,
  onPrevious,
  onNext,
  disabled = false,
  ocid,
}: {
  page: number;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
  ocid: string;
}) {
  const t = useDict(WALLET_TEXT);
  const { lang } = useLanguage();
  return (
    <nav
      className="flex items-center justify-between gap-3 pt-2"
      aria-label={t.pageNumber(formatNumber(page, undefined, lang))}
      data-ocid={`${ocid}.pagination`}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`min-h-11 sm:min-h-9 ${OUTLINE_GOLD}`}
        onClick={onPrevious}
        disabled={disabled || page <= 1}
        data-ocid={`${ocid}.pagination_prev`}
      >
        <ChevronLeft className="h-4 w-4" />
        {t.pagePrevious}
      </Button>
      <span
        className="text-sm text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {t.pageNumber(formatNumber(page, undefined, lang))}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`min-h-11 sm:min-h-9 ${OUTLINE_GOLD}`}
        onClick={onNext}
        disabled={disabled || !hasNext}
        data-ocid={`${ocid}.pagination_next`}
      >
        {t.pageNext}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
