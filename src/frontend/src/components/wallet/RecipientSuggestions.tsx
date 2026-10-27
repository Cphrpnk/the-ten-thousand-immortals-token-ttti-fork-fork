import type { Principal } from "@icp-sdk/core/principal";
import { AlertTriangle, Loader2, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { Contact } from "../../backend";
import {
  useAddressBookEnabled,
  useMyContacts,
} from "../../hooks/useAddressBook";
import { useLedgerCounterparties } from "../../hooks/useLedgerCounterparties";
import { useDict, useLanguage } from "../../i18n/core";
import { toIntlLocale } from "../../i18n/core/lang";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import { timestampToDate } from "../../lib/token";
import { Input } from "../ui/input";

/** Recipient chosen from the suggestions. */
export interface RecipientPick {
  principal: string;
  /** Default memo of the contact, when it has one. */
  memo?: Uint8Array;
}

interface Suggestion {
  principal: string;
  contact?: Contact;
  /** Last ledger interaction, nanoseconds. */
  lastTimestamp?: bigint;
  sortKey: bigint;
}

interface RecipientSuggestionsProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (pick: RecipientPick) => void;
  /** Account owner whose ledger counterparties are suggested. */
  owner: Principal | undefined;
}

const MAX_ROWS = 8;

/** Recipient principal input with contact and ledger suggestions. */
export function RecipientSuggestions({
  id,
  value,
  onChange,
  onPick,
  owner,
}: RecipientSuggestionsProps) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const { lang } = useLanguage();
  const enabled = useAddressBookEnabled();
  const contactsQuery = useMyContacts();
  const contactsData = contactsQuery.data;
  const contacts = useMemo(
    () => (enabled ? (contactsData ?? []) : []),
    [enabled, contactsData],
  );
  const ledger = useLedgerCounterparties(
    owner,
    contacts.map((c) => c.principal),
  );
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const listId = `${id}-suggestions`;

  const all = useMemo(() => {
    const byPrincipal = new Map<string, Suggestion>();
    for (const cp of ledger.counterparties) {
      const text = cp.principal.toText();
      byPrincipal.set(text, {
        principal: text,
        lastTimestamp: cp.lastTimestamp,
        sortKey: cp.lastTimestamp,
      });
    }
    for (const contact of contacts) {
      const text = contact.principal.toText();
      const seen = byPrincipal.get(text);
      const ts = seen?.lastTimestamp;
      byPrincipal.set(text, {
        principal: text,
        contact,
        lastTimestamp: ts,
        sortKey:
          ts !== undefined && ts > contact.updatedAt ? ts : contact.updatedAt,
      });
    }
    return [...byPrincipal.values()].sort((a, b) =>
      a.sortKey === b.sortKey ? 0 : a.sortKey > b.sortKey ? -1 : 1,
    );
  }, [ledger.counterparties, contacts]);

  const query = value.trim().toLowerCase();
  const rows = (
    query === ""
      ? all
      : all.filter(
          (s) =>
            s.principal.toLowerCase().includes(query) ||
            (s.contact?.nickname.toLowerCase().includes(query) ?? false),
        )
  ).slice(0, MAX_ROWS);

  const contactsLoading = enabled && contactsQuery.isLoading;
  const isLoading = contactsLoading || ledger.isLoading;
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(lang), {
    dateStyle: "medium",
  });

  const pick = (s: Suggestion) => {
    onPick({ principal: s.principal, memo: s.contact?.memo });
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) => (rows.length === 0 ? -1 : (h + 1) % rows.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) =>
        rows.length === 0 ? -1 : h <= 0 ? rows.length - 1 : h - 1,
      );
    } else if (event.key === "Enter" && open && highlight >= 0) {
      const row = rows[highlight];
      if (row) {
        event.preventDefault();
        pick(row);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  };

  const showList = open;
  const activeId =
    showList && highlight >= 0 && rows[highlight]
      ? `${listId}-${highlight}`
      : undefined;

  return (
    <div
      className="relative min-w-0 flex-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Input
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="aaaaa-aa"
        className="font-mono text-sm"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeId}
        data-ocid="wallet.send_recipient_input"
      />
      {showList && (
        <div
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
          data-ocid="wallet.send_suggestions.popover"
        >
          {rows.length > 0 && (
            <div
              id={listId}
              // biome-ignore lint/a11y/useSemanticElements: combobox popup; a native select cannot hold rich rows
              role="listbox"
              tabIndex={-1}
              aria-label={t.suggestContacts}
            >
              {rows.map((s, index) => (
                <div
                  key={s.principal}
                  id={`${listId}-${index}`}
                  // biome-ignore lint/a11y/useSemanticElements: combobox option with nickname, principal and date
                  role="option"
                  aria-selected={index === highlight}
                  tabIndex={-1}
                  className="suggestion-row cursor-pointer select-none"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => pick(s)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      pick(s);
                    }
                  }}
                  data-ocid={`wallet.send_suggestions.item.${index + 1}`}
                >
                  <UserRound
                    className={`h-4 w-4 shrink-0 ${s.contact ? "text-primary" : "text-muted-foreground"}`}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    {s.contact ? (
                      <>
                        <span className="truncate text-sm">
                          {s.contact.nickname}
                        </span>
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {shortPrincipal(s.principal)}
                        </span>
                      </>
                    ) : (
                      <span className="truncate font-mono text-sm">
                        {shortPrincipal(s.principal)}
                      </span>
                    )}
                  </div>
                  {s.lastTimestamp !== undefined && (
                    <LastUsed
                      label={t.suggestLastUsed}
                      date={timestampToDate(s.lastTimestamp)}
                      format={dateFormat}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {rows.length === 0 && isLoading && (
            <p
              className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground"
              data-ocid="wallet.send_suggestions.loading_state"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.suggestLoading}
            </p>
          )}
          {rows.length === 0 && !isLoading && (
            <p
              className="px-3 py-3 text-sm text-muted-foreground"
              data-ocid="wallet.send_suggestions.empty_state"
            >
              {t.suggestEmpty}
            </p>
          )}
          {rows.length > 0 && isLoading && (
            <p className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              {t.suggestLoading}
            </p>
          )}
          {(ledger.isError || (enabled && contactsQuery.isError)) && (
            <p
              className="flex items-start gap-2 px-3 py-2 text-xs text-muted-foreground"
              data-ocid="wallet.send_suggestions.error_state"
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              {enabled && contactsQuery.isError ? t.loadError : t.suggestError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function LastUsed({
  label,
  date,
  format,
}: {
  label: string;
  date: Date | null;
  format: Intl.DateTimeFormat;
}) {
  if (!date) return null;
  return (
    <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">
      <span className="sr-only">{label} </span>
      {format.format(date)}
    </span>
  );
}

function shortPrincipal(principal: string): string {
  if (principal.length <= 17) return principal;
  return `${principal.slice(0, 11)}…${principal.slice(-5)}`;
}
