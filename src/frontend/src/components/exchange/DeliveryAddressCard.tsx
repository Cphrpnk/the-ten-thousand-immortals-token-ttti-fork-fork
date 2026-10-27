import type { Principal } from "@icp-sdk/core/principal";
import { CheckCircle2, Loader2, MapPin, RefreshCw, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { DeliveryAddressErrorCode } from "../../backend";
import {
  type ConnectedWalletKind,
  isSignerKind,
  useConnectedWallet,
} from "../../hooks/useConnectedWallet";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useWalletClearDeliveryAddress,
  useWalletDeliveryAddress,
  useWalletSetDeliveryAddress,
} from "../../hooks/usePlugPurchase";
import {
  useClearDeliveryAddress,
  useGetDeliveryAddress,
  useSetDeliveryAddress,
} from "../../hooks/useQueries";
import { useDict, useLanguage } from "../../i18n/core/dict";
import { BUY_DELIVERY_TEXT } from "../../i18n/pages/buy";
import {
  TTTI_SYMBOL,
  deliveryAddressMessages,
  validateDeliveryAddress,
} from "../../lib/token";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";

/** Error to show; turned into text in the active language at render. */
type AddressError =
  | { kind: "code"; code: DeliveryAddressErrorCode; fallback: string }
  | { kind: "saveFailed"; message: string }
  | { kind: "removeFailed"; message: string };

interface DeliveryAddressCardProps {
  /** Wallet that signs the calls; external wallets save as their principal. */
  wallet: ConnectedWalletKind | "internetIdentity";
  walletPrincipal: Principal | null;
}

const noop = () => {};

export function DeliveryAddressCard({
  wallet,
  walletPrincipal,
}: DeliveryAddressCardProps) {
  const t = useDict(BUY_DELIVERY_TEXT);
  const { lang } = useLanguage();
  const isExternal = wallet !== "internetIdentity";
  const isPlug = wallet === "plug";
  // OISY/NFID approve each call in their window, so nothing runs unprompted.
  const isSigner = isSignerKind(isExternal ? wallet : null);
  const { beginSession } = useConnectedWallet();
  const iiQuery = useGetDeliveryAddress();
  const walletQuery = useWalletDeliveryAddress(isExternal);
  const iiSet = useSetDeliveryAddress();
  const walletSet = useWalletSetDeliveryAddress();
  const iiClear = useClearDeliveryAddress();
  const walletClear = useWalletClearDeliveryAddress();

  const query = isExternal ? walletQuery : iiQuery;
  const save = isExternal ? walletSet : iiSet;
  const clear = isExternal ? walletClear : iiClear;
  const savedText = query.data?.owner.toText() ?? null;
  const externalText = walletPrincipal?.toText() ?? null;
  const { identity } = useInternetIdentity();
  const iiPrincipal = identity?.getPrincipal();
  const iiText =
    iiPrincipal && !iiPrincipal.isAnonymous() ? iiPrincipal.toText() : null;
  // Principal of the active wallet, used to prefill and auto-save.
  const walletText = isExternal ? externalText : iiText;
  const openSession = () => (isSigner ? beginSession() : noop);

  const [draft, setDraft] = useState("");
  const [errorSource, setError] = useState<AddressError | null>(null);
  const [noticeKind, setNotice] = useState<"saved" | "removed" | null>(null);
  const initialized = useRef(false);
  const autoSaved = useRef(false);

  // One-time initialization of the editable field once the saved value loads.
  useEffect(() => {
    if (initialized.current) return;
    if (query.data === undefined && !(isSigner && walletText)) return;
    initialized.current = true;
    setDraft(savedText ?? walletText ?? "");
  }, [query.data, savedText, walletText, isSigner]);

  // If loading the saved address fails, still offer the wallet principal.
  const loadFailed = query.isError && query.data === undefined;
  useEffect(() => {
    if (!loadFailed || !walletText) return;
    setDraft((current) => (current === "" ? walletText : current));
  }, [loadFailed, walletText]);

  // Save the active wallet's principal automatically, once, when none is saved.
  const saveMutate = save.mutate;
  useEffect(() => {
    if (!walletText || autoSaved.current || isSigner) return;
    if (query.data !== null) return;
    autoSaved.current = true;
    setDraft((current) => (current === "" ? walletText : current));
    saveMutate(walletText);
  }, [walletText, query.data, saveMutate, isSigner]);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const validation = validateDeliveryAddress(draft);
    if (!validation.ok) {
      setError({
        kind: "code",
        code: validation.code,
        fallback: validation.message,
      });
      return;
    }
    const release = openSession();
    save.mutate(validation.principal.toText(), {
      onSuccess: (result) => {
        if (result.__kind__ === "Ok") {
          setNotice("saved");
        } else {
          setError({
            kind: "code",
            code: result.Err.code,
            fallback: result.Err.message,
          });
        }
      },
      onError: (err) => setError({ kind: "saveFailed", message: err.message }),
      onSettled: release,
    });
  };

  const handleClear = () => {
    setError(null);
    setNotice(null);
    if (draft.trim() === savedText) setDraft("");
    const release = openSession();
    clear.mutate(undefined, {
      onSuccess: () => setNotice("removed"),
      onError: (err) =>
        setError({ kind: "removeFailed", message: err.message }),
      onSettled: release,
    });
  };

  const handleLoad = () => {
    const release = openSession();
    void query.refetch().finally(release);
  };

  const busy = save.isPending || clear.isPending;
  const error = !errorSource
    ? null
    : errorSource.kind === "code"
      ? (deliveryAddressMessages(lang)[errorSource.code] ??
        errorSource.fallback)
      : errorSource.message ||
        (errorSource.kind === "saveFailed" ? t.saveFailed : t.removeFailed);
  const notice =
    noticeKind === "saved"
      ? t.saved
      : noticeKind === "removed"
        ? t.removed
        : null;

  return (
    <Card
      id="delivery-address"
      className="scroll-mt-24 rounded-xl border border-gold bg-gradient-surface shadow-elevated transition-smooth"
      data-ocid="delivery.card"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <MapPin className="h-4 w-4 text-primary" />
            {t.title}
          </CardTitle>
          <Badge
            variant="outline"
            className="rounded-full border-border text-muted-foreground"
          >
            {t.optional}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-gold bg-primary/10 text-primary"
          >
            {t.recommended}
          </Badge>
        </div>
        <CardDescription>
          {isPlug
            ? t.descPlug(TTTI_SYMBOL)
            : iiText
              ? t.descIi(TTTI_SYMBOL)
              : t.descNone(TTTI_SYMBOL)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSave} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="delivery-address-input">{t.principalId}</Label>
            <Input
              id="delivery-address-input"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
                setNotice(null);
              }}
              placeholder={t.placeholder}
              autoComplete="off"
              spellCheck={false}
              className="border-gold bg-background/60 font-mono text-sm transition-smooth focus-visible:border-gold-strong focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!error}
              aria-describedby={error ? "delivery-address-error" : undefined}
              data-ocid="delivery.input"
            />
            {error && (
              <p
                id="delivery-address-error"
                className="text-sm text-destructive"
                data-ocid="delivery.error_state"
              >
                {error}
              </p>
            )}
            {notice && (
              <p
                className="flex items-center gap-1.5 text-sm text-success"
                aria-live="polite"
                data-ocid="delivery.success_state"
              >
                <CheckCircle2 className="h-4 w-4" />
                {notice}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="min-h-10 rounded-lg border border-gold-strong bg-gradient-primary font-semibold text-primary-foreground shadow-gold transition-smooth hover:shadow-gold-lg hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:shadow-none sm:flex-1"
              disabled={busy || draft.trim() === ""}
              data-ocid="delivery.save_button"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 rounded-lg border-gold bg-transparent transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleClear}
              disabled={busy || !savedText}
              data-ocid="delivery.delete_button"
            >
              {clear.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t.clear}
            </Button>
          </div>
        </form>

        <div
          className="rounded-lg border border-border bg-background/60 p-3"
          data-ocid="delivery.saved"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.savedAddress}
          </p>
          {query.isLoading ? (
            <Skeleton className="mt-1 h-5 w-48" />
          ) : loadFailed || (isSigner && query.data === undefined) ? (
            <div
              className="mt-1 flex flex-wrap items-center gap-2"
              data-ocid="delivery.load_error_state"
            >
              {loadFailed && (
                <p className="text-sm text-destructive">{t.loadFailed}</p>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-lg border-gold bg-transparent px-2 text-xs transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-primary"
                onClick={handleLoad}
                disabled={query.isFetching}
                data-ocid="delivery.retry_button"
              >
                {query.isFetching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {t.retry}
              </Button>
            </div>
          ) : savedText ? (
            <p className="break-all font-mono text-sm">{savedText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t.noneSaved}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
