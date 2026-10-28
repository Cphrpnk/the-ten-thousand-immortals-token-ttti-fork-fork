import { Globe } from "lucide-react";
import { LANG_NAMES, LANG_SHORT_LABELS, SITE_TEXT } from "../i18n/common/site";
import { LANGS, useDict, useLanguage } from "../i18n/core";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface LanguagePickerProps {
  /** Layout classes for the trigger wrapper (e.g. responsive visibility). */
  className?: string;
  /** Size classes for the trigger button. */
  buttonClassName?: string;
  /** data-ocid prefix, e.g. "header.language" or "header.mobile_language". */
  ocid: string;
}

/**
 * Compact language submenu: one trigger showing the current language's short
 * label; the menu lists every site language. Applies instantly and remembers
 * the visitor's choice.
 */
export function LanguagePicker({
  className = "",
  buttonClassName = "h-9 px-1.5",
  ocid,
}: LanguagePickerProps) {
  const { lang, setLang } = useLanguage();
  const t = useDict(SITE_TEXT);

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t.languagePicker}
            className={`${buttonClassName} gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground data-[state=open]:text-primary${lang === "pa-Guru" ? " tracking-normal" : ""}`}
            data-ocid={`${ocid}.toggle`}
          >
            <Globe aria-hidden="true" className="h-3.5 w-3.5" />
            <span lang={lang}>{LANG_SHORT_LABELS[lang]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-ocid={`${ocid}.dropdown_menu`}>
          <DropdownMenuRadioGroup value={lang}>
            {LANGS.map((code) => (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                lang={code}
                onSelect={() => setLang(code)}
                className="text-sm"
                data-ocid={`${ocid}.${code.toLowerCase()}_button`}
              >
                {LANG_NAMES[code]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
