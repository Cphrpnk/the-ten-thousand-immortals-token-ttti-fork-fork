import { AlertTriangle, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Contact, ContactInput } from "../../backend";
import {
  useAddContact,
  useDeleteContact,
  useMyContacts,
  useUpdateContact,
  validateContactDraft,
} from "../../hooks/useAddressBook";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { formatNumber, useDict } from "../../i18n/core";
import { ADDRESS_BOOK_TEXT } from "../../i18n/pages/addressBook";
import { parsePrincipal } from "../../lib/ledgerIndex";
import {
  MAX_MEMO_BYTES,
  decodeMemoText,
  encodeMemoText,
} from "../../lib/tokenRegistry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ContactApprovals } from "./ContactApprovals";

export interface ContactCardProps {
  /** Contact to edit; absent for a new contact. */
  contact?: Contact;
  /** Principal to prefill for a new contact. */
  initialPrincipal?: string;
  /** Called when the card is closed, saved or deleted. */
  onDone: () => void;
}

/** Create, edit or delete a contact; ICRC-2 approvals for a saved one. */
export function ContactCard({
  contact,
  initialPrincipal,
  onDone,
}: ContactCardProps) {
  const t = useDict(ADDRESS_BOOK_TEXT);
  const savedPrincipal = contact?.principal.toText() ?? "";
  const [nickname, setNickname] = useState(contact?.nickname ?? "");
  const [principalText, setPrincipalText] = useState(
    savedPrincipal || initialPrincipal || "",
  );
  const [memo, setMemo] = useState(decodeMemoText(contact?.memo));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { identity } = useInternetIdentity();
  const { data: contacts = [] } = useMyContacts();
  const addContact = useAddContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const pending =
    addContact.isPending || updateContact.isPending || deleteContact.isPending;

  const memoEncoding = encodeMemoText(memo);
  const principalChanged = principalText.trim() !== savedPrincipal;
  const errors = validateContactDraft({
    nickname,
    principalText,
    memoValid: memoEncoding.ok,
    self: identity?.getPrincipal(),
    others: contacts.filter((c) => c.id !== contact?.id),
    parsePrincipal,
  });
  const showNickname = submitted && errors.nickname;
  // A changed principal is checked again as soon as it is edited.
  const showPrincipal =
    (submitted || (principalChanged && principalText.trim() !== "")) &&
    errors.principal;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    const principal = parsePrincipal(principalText);
    if (
      errors.nickname ||
      errors.principal ||
      errors.memo ||
      !principal ||
      !memoEncoding.ok
    ) {
      return;
    }
    const input: ContactInput = {
      principal,
      nickname: nickname.trim(),
      ...(memoEncoding.bytes ? { memo: memoEncoding.bytes } : {}),
    };
    const options = {
      onSuccess: () => {
        toast.success(t.savedToast);
        onDone();
      },
      onError: (e: Error) => setError(e.message),
    };
    if (contact) updateContact.mutate({ id: contact.id, input }, options);
    else addContact.mutate(input, options);
  };

  const handleDelete = () => {
    if (!contact) return;
    setError(null);
    deleteContact.mutate(contact.id, {
      onSuccess: () => {
        toast.success(t.deletedToast);
        onDone();
      },
      onError: (e) => setError(e.message),
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalText.trim());
      setCopied(true);
      toast.success(t.copied);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-6" data-ocid="contact_card.panel">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <h3 className="font-display text-lg">
          {contact ? t.cardTitle : t.newContactTitle}
        </h3>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-nickname">{t.nicknameLabel}</Label>
          <Input
            id="contact-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t.nicknamePlaceholder}
            autoComplete="off"
            aria-invalid={!!showNickname}
            data-ocid="contact_card.nickname.input"
          />
          {showNickname && (
            <p
              className="text-xs text-destructive"
              data-ocid="contact_card.nickname.field_error"
            >
              {errors.nickname}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-principal">{t.principalLabel}</Label>
          <div className="flex gap-2">
            <Input
              id="contact-principal"
              value={principalText}
              onChange={(e) => setPrincipalText(e.target.value)}
              placeholder={t.principalPlaceholder}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!showPrincipal}
              className="min-w-0 font-mono text-sm"
              data-ocid="contact_card.principal.input"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void handleCopy()}
              disabled={!!errors.principal}
              aria-label={t.copyPrincipal}
              title={t.copyPrincipal}
              className="shrink-0 rounded-lg border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10"
              data-ocid="contact_card.copy_button"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {showPrincipal && (
            <p
              className="text-xs text-destructive"
              data-ocid="contact_card.principal.field_error"
            >
              {errors.principal}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-memo">
            {t.memoLabel}{" "}
            <span className="font-normal text-muted-foreground">
              {t.memoOptional}
            </span>
          </Label>
          <Input
            id="contact-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder={t.memoPlaceholder}
            autoComplete="off"
            aria-invalid={!!errors.memo}
            data-ocid="contact_card.memo.input"
          />
          <div className="flex justify-between gap-2 text-xs">
            <span
              className={
                errors.memo ? "text-destructive" : "text-muted-foreground"
              }
              data-ocid={
                errors.memo ? "contact_card.memo.field_error" : undefined
              }
            >
              {errors.memo ?? t.memoHint(formatNumber(MAX_MEMO_BYTES))}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {t.memoBytes(
                formatNumber(memoEncoding.length),
                formatNumber(MAX_MEMO_BYTES),
              )}
            </span>
          </div>
        </div>

        {error && (
          <p
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
            data-ocid="contact_card.error_state"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {contact && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                  data-ocid="contact_card.delete_button"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.delete}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="contact_card.delete.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display">
                    {t.deleteTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.deleteBody(contact.nickname)}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="contact_card.delete.cancel_button">
                    {t.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="contact_card.delete.confirm_button"
                  >
                    {t.delete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onDone}
              disabled={pending}
              className="rounded-lg"
              data-ocid="contact_card.cancel_button"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-lg shadow-gold transition-smooth hover:brightness-110"
              data-ocid="contact_card.save_button"
            >
              {addContact.isPending || updateContact.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.saving}
                </>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </div>
      </form>

      {contact && (
        <div className="border-t border-border pt-5">
          <ContactApprovals spender={contact.principal} />
        </div>
      )}
    </div>
  );
}
