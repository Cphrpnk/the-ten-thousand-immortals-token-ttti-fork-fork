import {
  AlertTriangle,
  BookUser,
  ChevronLeft,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { Contact } from "../../backend";
import {
  MAX_CONTACTS,
  useAddressBookEnabled,
  useMyContacts,
} from "../../hooks/useAddressBook";
import { formatNumber, useDict } from "../../i18n/core";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { ContactCard } from "./ContactCard";

export interface AddressBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when a contact is chosen (e.g. as a Send recipient). */
  onSelect?: (contact: Contact) => void;
  /** Principal to prefill when opening on a new contact. */
  initialPrincipal?: string;
}

type View = { kind: "list" } | { kind: "card"; contact?: Contact };

function shortPrincipal(text: string): string {
  return text.length > 23 ? `${text.slice(0, 11)}…${text.slice(-9)}` : text;
}

function AddressBookBody({
  onSelect,
  initialPrincipal,
  onClose,
}: {
  onSelect?: (contact: Contact) => void;
  initialPrincipal?: string;
  onClose: () => void;
}) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const enabled = useAddressBookEnabled();
  const contactsQuery = useMyContacts();
  const [view, setView] = useState<View>(
    initialPrincipal ? { kind: "card" } : { kind: "list" },
  );
  const [prefill, setPrefill] = useState(initialPrincipal);
  const [search, setSearch] = useState("");

  if (!enabled) {
    return (
      <p
        className="callout-info px-3 py-3 text-sm"
        data-ocid="address_book.sign_in.empty_state"
      >
        {t.signInRequired}
      </p>
    );
  }

  if (view.kind === "card") {
    return (
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setView({ kind: "list" })}
          className="self-start rounded-lg px-2 text-muted-foreground hover:text-foreground"
          data-ocid="address_book.back_button"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.title}
        </Button>
        <ContactCard
          key={view.contact ? String(view.contact.id) : "new"}
          contact={view.contact}
          initialPrincipal={view.contact ? undefined : prefill}
          onDone={() => {
            setPrefill(undefined);
            setView({ kind: "list" });
          }}
        />
      </div>
    );
  }

  const contacts = contactsQuery.data ?? [];
  const query = search.trim().toLowerCase();
  const filtered = query
    ? contacts.filter(
        (c) =>
          c.nickname.toLowerCase().includes(query) ||
          c.principal.toText().toLowerCase().includes(query),
      )
    : contacts;
  const full = contacts.length >= MAX_CONTACTS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="pl-9"
            data-ocid="address_book.search_input"
          />
        </div>
        <Button
          type="button"
          onClick={() => setView({ kind: "card" })}
          disabled={full || contactsQuery.isLoading}
          className="shrink-0 rounded-lg shadow-gold transition-smooth hover:brightness-110"
          data-ocid="address_book.add_button"
        >
          <Plus className="h-4 w-4" />
          {t.addContact}
        </Button>
      </div>

      {contactsQuery.isSuccess && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {full
            ? t.errLimitReached(formatNumber(MAX_CONTACTS))
            : t.count(
                formatNumber(contacts.length),
                formatNumber(MAX_CONTACTS),
              )}
        </p>
      )}

      {contactsQuery.isLoading ? (
        <div
          className="flex flex-col gap-2"
          data-ocid="address_book.loading_state"
        >
          <span className="sr-only">{t.loading}</span>
          {["a", "b", "c", "d"].map((id) => (
            <Skeleton key={id} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : contactsQuery.isError ? (
        <div
          className="flex flex-col items-center gap-3 py-6 text-center"
          data-ocid="address_book.error_state"
        >
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t.loadError}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void contactsQuery.refetch()}
            className="rounded-lg border-gold"
            data-ocid="address_book.retry_button"
          >
            {t.retry}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gold py-8 text-center text-sm text-muted-foreground"
          data-ocid="address_book.empty_state"
        >
          <BookUser className="h-6 w-6 text-primary" />
          {contacts.length === 0 ? t.empty : t.emptyNoMatch}
        </div>
      ) : (
        <ul
          className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto"
          data-ocid="address_book.list"
        >
          {filtered.map((contact, i) => {
            const principal = contact.principal.toText();
            return (
              <li
                key={String(contact.id)}
                className="suggestion-row"
                data-ocid={`address_book.item.${i + 1}`}
              >
                <button
                  type="button"
                  onClick={() => setView({ kind: "card", contact })}
                  className="flex min-w-0 flex-1 flex-col items-start rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${t.edit}: ${contact.nickname}`}
                  data-ocid={`address_book.edit_button.${i + 1}`}
                >
                  <span className="w-full truncate text-sm font-medium text-foreground">
                    {contact.nickname}
                  </span>
                  <span
                    className="w-full truncate font-mono text-xs text-muted-foreground"
                    title={principal}
                  >
                    {shortPrincipal(principal)}
                  </span>
                </button>
                {onSelect && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelect(contact);
                      onClose();
                    }}
                    className="shrink-0 rounded-lg border-gold hover:bg-primary/10"
                    data-ocid={`address_book.select_button.${i + 1}`}
                  >
                    {t.select}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Private address book: search, add, open a contact card, optionally use it. */
export function AddressBookDialog({
  open,
  onOpenChange,
  onSelect,
  initialPrincipal,
}: AddressBookDialogProps) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        data-ocid="address_book.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">{t.title}</DialogTitle>
          <DialogDescription className="sr-only">{t.title}</DialogDescription>
        </DialogHeader>
        {open && (
          <AddressBookBody
            onSelect={onSelect}
            initialPrincipal={initialPrincipal}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
