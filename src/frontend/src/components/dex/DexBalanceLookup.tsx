import { Principal } from "@icp-sdk/core/principal";
import { type FormEvent, useState } from "react";
import { useDexBalances, useDexTokens } from "../../hooks/useDex";
import { useDict } from "../../i18n/core";
import { DEX_TEXT } from "../../i18n/pages/dex";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { DexBalanceTable, buildBalanceRows } from "./DexBalanceTable";
import { DexDepositSubaccount } from "./DexDepositSubaccount";

function parsePrincipal(text: string): Principal | null {
  try {
    return text.trim() ? Principal.fromText(text.trim()) : null;
  } catch {
    return null;
  }
}

/** Public lookup of any principal's DEX balances and deposit subaccount. */
export function DexBalanceLookup() {
  const t = useDict(DEX_TEXT);
  const [text, setText] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [shown, setShown] = useState<Principal | null>(null);
  const tokens = useDexTokens();
  const balances = useDexBalances(shown);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const principal = parsePrincipal(text);
    setInvalid(!principal);
    if (principal) setShown(principal);
  };

  const rows = buildBalanceRows(tokens.data ?? [], balances.data ?? []);
  const empty = rows.every((r) => r.available === 0n && r.reserved === 0n);

  return (
    <div
      className="flex flex-col gap-4"
      data-ocid="pools.balances.lookup.section"
    >
      <h3 className="font-display text-lg tracking-wide">{t.lookupTitle}</h3>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-2"
        noValidate
        data-ocid="pools.balances.lookup.form"
      >
        <Label htmlFor="dex-lookup">{t.lookupLabel}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="dex-lookup"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setInvalid(false);
            }}
            placeholder={t.lookupPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 font-mono"
            aria-invalid={invalid}
            aria-describedby={invalid ? "dex-lookup-error" : undefined}
            data-ocid="pools.balances.lookup.search_input"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={text.trim() === ""}
            className="min-h-11 shrink-0"
            data-ocid="pools.balances.lookup.submit_button"
          >
            {t.lookupButton}
          </Button>
        </div>
        {invalid && (
          <p
            id="dex-lookup-error"
            className="text-xs text-destructive"
            data-ocid="pools.balances.lookup.field_error"
          >
            {t.lookupInvalid}
          </p>
        )}
      </form>

      {shown && (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-xs break-all text-muted-foreground">
            {shown.toText()}
          </p>
          <DexDepositSubaccount
            owner={shown}
            ocid="pools.balances.lookup.subaccount"
          />
          {tokens.isPending || balances.isPending ? (
            <Skeleton
              className="h-40 w-full"
              data-ocid="pools.balances.lookup.loading_state"
            />
          ) : tokens.isError || balances.isError ? (
            <p
              className="callout-danger px-3 py-2 text-sm"
              data-ocid="pools.balances.lookup.error_state"
            >
              {t.balancesLoadError}
            </p>
          ) : empty ? (
            <p
              className="text-sm text-muted-foreground"
              data-ocid="pools.balances.lookup.empty_state"
            >
              {t.lookupEmpty}
            </p>
          ) : (
            <DexBalanceTable rows={rows} ocid="pools.balances.lookup" />
          )}
        </div>
      )}
    </div>
  );
}
