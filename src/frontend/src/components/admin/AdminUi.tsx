import { Check, Copy, Layers } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import type { OwnerSendStatus, PurchaseErrorCode } from "../../backend";
import { DexToken, PayToken } from "../../backend";
import { type BlockLinkTarget, blockLinkTarget } from "../../lib/explorer";
import {
  TTTI_DECIMALS,
  TTTI_SYMBOL,
  formatPayAmount,
  formatUnits,
  payTokenSymbol,
} from "../../lib/token";
import { TokenLogoMark } from "../../lib/tokenLogos";
import { ExplorerLink } from "../ExplorerLink";
import { FlatTokenIcon } from "../FlatTokenIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// --- Tokens ----------------------------------------------------------------

/** Every token shown in admin, as DexToken keys (TTTI-T included). */
export const ADMIN_TOKENS: ReadonlyArray<DexToken> = [
  DexToken.icp,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
  DexToken.tttiT,
];

/** Pay token of each DEX token; TTTI-T is not a pay token. */
export const DEX_PAY_TOKENS: Record<DexToken, PayToken | null> = {
  [DexToken.icp]: PayToken.icp,
  [DexToken.ckbtc]: PayToken.ckbtc,
  [DexToken.ckusdc]: PayToken.ckusdc,
  [DexToken.ckusdt]: PayToken.ckusdt,
  [DexToken.tttiT]: null,
};

/** Pay token of a token key; null for TTTI-T. */
export function payTokenOf(token: string): PayToken | null {
  return (DEX_PAY_TOKENS as Record<string, PayToken | null>)[token] ?? null;
}

/** Symbol of a token key (icp, ckbtc, ckusdc, ckusdt, tttiT). */
export function adminTokenSymbol(token: string): string {
  const pay = payTokenOf(token);
  return pay === null ? TTTI_SYMBOL : payTokenSymbol(pay);
}

/** Amount of a token key in English format, e.g. "1.25 ckUSDC". */
export function formatTokenAmount(value: bigint, token: DexToken): string {
  const pay = DEX_PAY_TOKENS[token];
  return pay === null
    ? `${formatUnits(value, TTTI_DECIMALS, 2, "en")} ${TTTI_SYMBOL}`
    : formatPayAmount(value, pay, "en");
}

/** 16 px icon of a token key. */
export function TokenGlyph({ token }: { token: string }) {
  const pay = payTokenOf(token);
  if (pay === null) {
    return <FlatTokenIcon alt="" className="h-4 w-4" />;
  }
  return <TokenLogoMark id={pay} className="h-4 w-4" />;
}

/** Link target of a block on a token's ledger. */
export function tokenBlockTarget(
  token: DexToken | PayToken,
  block: bigint,
): BlockLinkTarget | null {
  const pay = payTokenOf(token);
  return blockLinkTarget(pay === null ? TTTI_SYMBOL : pay, block);
}

// --- Purchase errors (admin text) ----------------------------------------

/** English admin text of a purchase error code, when admin shows it. */
export function purchaseErrorAdminText(code: PurchaseErrorCode): string | null {
  switch (code.__kind__) {
    case "receivingWalletNotConfigured":
      return `Mint refused: no receiving wallet is configured for ${payTokenSymbol(
        code.receivingWalletNotConfigured.token,
      )}. Set it in Treasury.`;
    case "tokenNotConfigured":
      return `Mint refused: ${payTokenSymbol(code.tokenNotConfigured.token)} is not configured.`;
    case "salesPaused":
      return "Mint refused: sales are paused.";
    case "priceUnavailable":
      return `Mint refused: no valid ${payTokenSymbol(code.priceUnavailable.token)} rate.`;
    default:
      return null;
  }
}

// --- Section header --------------------------------------------------------

export interface AdminSectionDef {
  id: string;
  title: string;
}

export function AdminSection({
  index,
  id,
  title,
  note,
  aside,
  children,
}: {
  index: number;
  id: string;
  title: string;
  note?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="admin-section"
      data-ocid={`admin.section.${id}`}
    >
      <div className="admin-section-header flex-wrap">
        <span className="admin-section-index">
          {index.toString().padStart(2, "0")}
        </span>
        <h2 id={headingId} className="font-display text-xl md:text-2xl">
          {title}
        </h2>
        {note ? (
          <span className="text-sm text-muted-foreground">{note}</span>
        ) : null}
        {aside ? <div className="ml-auto">{aside}</div> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

// --- Accordion -------------------------------------------------------------

/** List accordion, closed by default, with an item count in the trigger. */
export function AdminAccordion({
  label,
  count,
  ocid,
  children,
}: {
  label: string;
  count?: number | bigint | string;
  ocid: string;
  children: ReactNode;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="admin-accordion"
      data-ocid={ocid}
    >
      <AccordionItem value="list" className="border-b-0">
        <AccordionTrigger
          className="admin-accordion-trigger rounded-[inherit] font-normal hover:no-underline [&>svg]:translate-y-0"
          data-ocid={`${ocid}_toggle`}
        >
          <span className="flex flex-1 items-center justify-between gap-4">
            <span>{label}</span>
            {count !== undefined ? (
              <span className="admin-accordion-count">{count.toString()}</span>
            ) : null}
          </span>
        </AccordionTrigger>
        <AccordionContent className="border-t border-border px-4 pt-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// --- Filter chips ----------------------------------------------------------

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  ocid,
}: {
  options: ReadonlyArray<ChipOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  ocid: string;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2" data-ocid={ocid}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="filter-chip"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          data-ocid={`${ocid}.${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

// --- Token dropdown --------------------------------------------------------

export const ALL_TOKENS = "all" as const;
export type TokenChoice<T extends string> = T | typeof ALL_TOKENS;

export function TokenSelect<T extends string>({
  tokens,
  value,
  onChange,
  label,
  ocid,
  allowAll = false,
}: {
  tokens: ReadonlyArray<T>;
  value: TokenChoice<T>;
  onChange: (value: TokenChoice<T>) => void;
  label: string;
  ocid: string;
  allowAll?: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as TokenChoice<T>)}
    >
      <SelectTrigger
        className="token-select w-auto"
        aria-label={label}
        data-ocid={ocid}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allowAll ? (
          <SelectItem value={ALL_TOKENS}>
            <span className="flex items-center gap-2 font-mono text-[0.8125rem]">
              <Layers className="h-4 w-4 text-muted-foreground" aria-hidden />
              All tokens
            </span>
          </SelectItem>
        ) : null}
        {tokens.map((token) => (
          <SelectItem key={token} value={token}>
            <span className="flex items-center gap-2 font-mono text-[0.8125rem]">
              <TokenGlyph token={token} />
              {adminTokenSymbol(token)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --- Copy, block references ------------------------------------------------

export function CopyIconButton({
  text,
  label,
  ocid,
}: {
  text: string;
  label: string;
  ocid: string;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("The value could not be copied.");
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={() => void onCopy()}
      aria-label={copied ? "Copied" : label}
      data-ocid={ocid}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </Button>
  );
}

/** Long identifier: shortened, full text on click, copy through the icon. */
export function RevealText({
  text,
  label,
  ocid,
  head = 10,
  tail = 6,
}: {
  text: string;
  label: string;
  ocid: string;
  head?: number;
  tail?: number;
}) {
  const [open, setOpen] = useState(false);
  const short =
    text.length <= head + tail + 3
      ? text
      : `${text.slice(0, head)}…${text.slice(-tail)}`;
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Hide full ${label}` : `Show full ${label}`}
        className="min-w-0 rounded-sm text-left font-mono text-xs break-all hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        data-ocid={`${ocid}_reveal`}
      >
        {open ? text : short}
      </button>
      <CopyIconButton
        text={text}
        label={`Copy ${label}`}
        ocid={`${ocid}_copy`}
      />
    </span>
  );
}

/** Ledger block: explorer link plus copy icon. */
export function BlockRef({
  token,
  block,
  ocid,
}: {
  token: DexToken | PayToken;
  block: bigint;
  ocid: string;
}) {
  const target = tokenBlockTarget(token, block);
  const text = block.toString();
  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs">
      {target ? (
        <ExplorerLink
          target={target}
          label={`Block ${text} on the explorer`}
          data-ocid={`${ocid}_link`}
        >
          #{text}
        </ExplorerLink>
      ) : (
        <span>#{text}</span>
      )}
      <CopyIconButton
        text={text}
        label="Copy block number"
        ocid={`${ocid}_copy`}
      />
    </span>
  );
}

// --- Status ----------------------------------------------------------------

/** Status badge of an owner or settlement send. */
export function StatusBadge({
  status,
  ocid,
}: { status: OwnerSendStatus; ocid: string }) {
  switch (status.__kind__) {
    case "pending":
      return (
        <Badge variant="secondary" data-ocid={ocid}>
          Pending
        </Badge>
      );
    case "sent":
      return (
        <Badge variant="secondary" className="text-success" data-ocid={ocid}>
          Sent
        </Badge>
      );
    case "needsReview":
      return (
        <Badge variant="destructive" data-ocid={ocid}>
          Needs review
        </Badge>
      );
    case "failed":
      return (
        <span className="space-y-0.5" data-ocid={ocid}>
          <Badge variant="destructive">Failed</Badge>
          <span className="block break-words text-destructive">
            {status.failed}
          </span>
        </span>
      );
  }
}

/** Label / value figure. */
export function AdminStat({
  label,
  value,
  ocid,
  hint,
}: {
  label: string;
  value: ReactNode;
  ocid?: string;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="admin-stat-label">{label}</p>
      <div className="admin-stat-value break-words" data-ocid={ocid}>
        {value}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** Hex of a subaccount; empty for none. */
export function bytesToHex(bytes: Uint8Array | undefined): string {
  if (!bytes) return "";
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
