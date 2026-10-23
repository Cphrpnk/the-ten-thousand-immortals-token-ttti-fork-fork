import { LANG_NAMES, LANG_SHORT_LABELS, SITE_TEXT } from "../i18n/common/site";
import { LANGS, useDict, useLanguage } from "../i18n/core";
import { Button } from "./ui/button";

interface LanguagePickerProps {
  /** Layout classes for the group (e.g. responsive visibility). */
  className?: string;
  /** Size classes for each language button. */
  buttonClassName?: string;
  /** data-ocid prefix, e.g. "header.language" or "header.mobile_language". */
  ocid: string;
}

/**
 * EN / FR / ES / 中文 / PT / 한국어 / ਪੰਜਾਬੀ switch; applies instantly and
 * remembers the visitor's choice. Wraps onto a second line when its container
 * is narrower than the seven entries (mobile menu).
 */
export function LanguagePicker({
  className = "",
  buttonClassName = "h-9 px-1.5",
  ocid,
}: LanguagePickerProps) {
  const { lang, setLang } = useLanguage();
  const t = useDict(SITE_TEXT);

  return (
    <fieldset
      aria-label={t.languagePicker}
      className={`m-0 flex flex-wrap items-center gap-x-0.5 gap-y-1 border-0 p-0 ${className}`}
      data-ocid={`${ocid}.toggle`}
    >
      {LANGS.map((code, index) => (
        <span key={code} className="flex items-center gap-0.5">
          {index > 0 && (
            <span
              aria-hidden="true"
              className="text-xs text-muted-foreground/60"
            >
              /
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            lang={code}
            aria-label={LANG_NAMES[code]}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            className={`${buttonClassName} text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground aria-pressed:text-primary${code === "pa-Guru" ? " tracking-normal" : ""}`}
            data-ocid={`${ocid}.${code.toLowerCase()}_button`}
          >
            {LANG_SHORT_LABELS[code]}
          </Button>
        </span>
      ))}
    </fieldset>
  );
}
