import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useIcpSwapTokenList } from "../../hooks/useIcpSwap";
import { useDict } from "../../i18n/core";
import { SWAP_TEXT } from "../../i18n/pages/swap";
import {
  LedgerTokenError,
  type ListedToken,
  parseLedgerId,
  readLedgerToken,
  searchListedTokens,
} from "../../lib/swapTokens";
import type { TokenDescriptor } from "../../lib/tokenRegistry";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SwapNotice } from "./SwapParts";
import { TokenLogo } from "./TokenLogo";

interface AddSwapTokenProps {
  /** Every token already in the swap selector (base and added). */
  existing: Array<TokenDescriptor>;
  /** Tokens added in this browser, removable. */
  added: Array<TokenDescriptor>;
  onAdd: (token: TokenDescriptor) => void;
  onRemove: (canisterId: string) => void;
  onClose: () => void;
}

/** Add a token to the swap selector by ICPSwap symbol search or ledger ID. */
export function AddSwapToken({
  existing,
  added,
  onAdd,
  onRemove,
  onClose,
}: AddSwapTokenProps) {
  const t = useDict(SWAP_TEXT);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const isId = query.includes("-");
  const listQuery = useIcpSwapTokenList(true);
  const matches =
    !isId && listQuery.data ? searchListedTokens(listQuery.data, query) : [];

  const add = (ledgerText: string) => {
    setError(null);
    setDone(null);
    let ledger: ReturnType<typeof parseLedgerId>;
    try {
      ledger = parseLedgerId(ledgerText);
    } catch {
      setError(t.addTokenInvalidId);
      return;
    }
    const present = existing.find(
      (tk) => tk.canisterId.toText() === ledger.toText(),
    );
    if (present) {
      setError(t.addTokenAlready(present.symbol));
      return;
    }
    setBusy(true);
    void readLedgerToken(ledger)
      .then((token) => {
        onAdd(token);
        setQuery("");
        setDone(t.addTokenDone(token.symbol));
      })
      .catch((failure: unknown) => {
        setError(
          failure instanceof LedgerTokenError && failure.reason === "invalidId"
            ? t.addTokenInvalidId
            : t.addTokenNotIcrc,
        );
      })
      .finally(() => setBusy(false));
  };

  const trimmed = query.trim();
  const searchState = (() => {
    if (isId || trimmed === "") return null;
    if (listQuery.isLoading)
      return (
        <SwapNotice tone="info" ocid="wallet.swap.add_token.list_loading_state">
          {t.addTokenListLoading}
        </SwapNotice>
      );
    if (listQuery.isError)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.add_token.list_error_state">
          {t.addTokenListError}
        </SwapNotice>
      );
    if (matches.length === 0)
      return (
        <SwapNotice tone="error" ocid="wallet.swap.add_token.no_match_state">
          {t.addTokenNoMatch}
        </SwapNotice>
      );
    return (
      <ul
        className="flex flex-col gap-1"
        data-ocid="wallet.swap.add_token.results_list"
      >
        {matches.map((tk: ListedToken, index) => (
          <li key={tk.canisterId}>
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-smooth hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              onClick={() => add(tk.canisterId)}
              disabled={busy}
              data-ocid={`wallet.swap.add_token.result.${index + 1}`}
            >
              <TokenLogo
                canisterId={tk.canisterId}
                symbol={tk.symbol}
                className="h-6 w-6"
              />
              <span className="font-semibold text-foreground">{tk.symbol}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {tk.name}
              </span>
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    );
  })();

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-border bg-background/60 px-3 py-3"
      data-ocid="wallet.swap.add_token.panel"
    >
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="swap-add-token" className="font-semibold">
          {t.addTokenLabel}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onClose}
          aria-label={t.closeAddToken}
          title={t.closeAddToken}
          data-ocid="wallet.swap.add_token.close_button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (isId) add(query);
          else if (matches.length === 1 && matches[0])
            add(matches[0].canisterId);
        }}
      >
        <Input
          id="swap-add-token"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError(null);
            setDone(null);
          }}
          className="font-mono text-sm"
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          aria-invalid={!!error}
          data-ocid="wallet.swap.add_token.search_input"
        />
        <Button
          type="submit"
          variant="outline"
          className="rounded-lg"
          disabled={busy || !isId}
          data-ocid="wallet.swap.add_token.submit_button"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.addTokenSubmit}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">{t.addTokenHint}</p>
      {busy && (
        <SwapNotice tone="info" ocid="wallet.swap.add_token.loading_state">
          {t.addTokenReading}
        </SwapNotice>
      )}
      {error && (
        <SwapNotice tone="error" ocid="wallet.swap.add_token.error_state">
          {error}
        </SwapNotice>
      )}
      {done && (
        <SwapNotice tone="success" ocid="wallet.swap.add_token.success_state">
          {done}
        </SwapNotice>
      )}
      {!busy && searchState}
      {added.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground">
            {t.addedTokens}
          </p>
          <ul
            className="flex flex-col gap-1"
            data-ocid="wallet.swap.add_token.added_list"
          >
            {added.map((tk, index) => (
              <li
                key={tk.canisterId.toText()}
                className="flex min-w-0 items-center gap-2 text-sm"
                data-ocid={`wallet.swap.add_token.added.${index + 1}`}
              >
                <TokenLogo
                  canisterId={tk.canisterId.toText()}
                  symbol={tk.symbol}
                  className="h-6 w-6"
                />
                <span className="font-semibold text-foreground">
                  {tk.symbol}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                  {tk.canisterId.toText()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onRemove(tk.canisterId.toText())}
                  aria-label={t.removeToken(tk.symbol)}
                  title={t.removeToken(tk.symbol)}
                  data-ocid={`wallet.swap.add_token.delete_button.${index + 1}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
