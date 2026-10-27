import { loadConfig } from "@caffeineai/core-infrastructure";
import { useLocation } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  Copy,
  Hash,
  History,
  Link2,
  PiggyBank,
  ShieldCheck,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DataCertificate, GetBlocksArgs } from "../backend";
import { ExplorerLink } from "../components/ExplorerLink";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useIsMobile } from "../hooks/use-mobile";
import {
  useGetLegacyBlockInfo,
  useIcrc3GetBlocks,
  useIcrc3GetTipCertificate,
  useTechnicalDetails,
} from "../hooks/useQueries";
import { EXPLORER_TEXT } from "../i18n/common/explorer";
import { type Lang, getLang, toIntlLocale, useDict } from "../i18n/core";
import {
  HISTORY_EXPLORER_TEXT,
  HISTORY_TEXT,
  type HistoryText,
} from "../i18n/pages/history";
import {
  blockAnchorId,
  blockIndexFromHash,
  icpDashboardCanisterUrl,
  tttiBlockTarget,
} from "../lib/explorer";
import {
  type BlockKind,
  type DecodedBlock,
  type DecodedHashTree,
  type DecodedMemo,
  MAX_BLOCKS_PER_CALL,
  decodeBlock,
  decodeTipHashTree,
  hashBlockValue,
  shortHex,
  toHex,
} from "../lib/icrc3Blocks";
import { TTTI_SYMBOL, formatInteger, formatUnits } from "../lib/token";

/** Blocks shown per page (always below the 100-block per-call cap). */
const PAGE_SIZE = 50n;

/** Open ledger surfaces separated by quiet rules. */
const GOLD_CARD =
  "surface-open rounded-none border-t border-border shadow-none";
const OUTLINE_GOLD =
  "border-gold transition-smooth hover:border-gold-strong hover:bg-primary/10 hover:text-foreground";

function formatAmount(amount: bigint | null | undefined, decimals: number) {
  if (amount === null || amount === undefined) return "—";
  return formatUnits(amount, decimals);
}

function formatTimestamp(
  timestamp: bigint | null | undefined,
  lang: Lang = getLang(),
): string {
  if (timestamp === null || timestamp === undefined) return "—";
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(toIntlLocale(lang), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function truncateAccount(account: string): string {
  if (account.length <= 18) return account;
  return `${account.slice(0, 9)}…${account.slice(-6)}`;
}

function AccountText({ account }: { account: string | undefined }) {
  if (!account) return <span className="text-muted-foreground">—</span>;
  return <span title={account}>{truncateAccount(account)}</span>;
}

function TipPanel({
  certificate,
  isLoading,
  logLength,
}: {
  certificate: DataCertificate | null | undefined;
  isLoading: boolean;
  logLength: bigint | undefined;
}) {
  const t = useDict(HISTORY_TEXT);
  const isCertified = !!certificate && certificate.certificate.length > 0;

  const decoded = useMemo<
    { ok: true; tree: DecodedHashTree } | { ok: false } | null
  >(() => {
    if (!certificate) return null;
    try {
      return { ok: true, tree: decodeTipHashTree(certificate.hash_tree) };
    } catch {
      return { ok: false };
    }
  }, [certificate]);

  return (
    <Card
      className="surface-open rounded-none border-t border-border shadow-none"
      data-ocid="history.tip_panel"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <CardTitle className="font-display text-lg">{t.tipTitle}</CardTitle>
          </div>
          {!isLoading && (
            <Badge
              variant="outline"
              className={
                isCertified
                  ? "border-gold bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              }
              data-ocid="history.tip_certificate_badge"
            >
              {isCertified ? t.tipCertified : t.tipNoCertificate}
            </Badge>
          )}
        </div>
        <CardDescription>{t.tipDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="history.tip_loading_state">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-full" />
          </div>
        ) : !certificate ? (
          <div
            className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground"
            data-ocid="history.tip_empty_state"
          >
            {logLength === 0n ? t.tipEmptyLog : t.tipMissing}
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {t.tipIndex}
              </span>
              <span
                className="font-mono text-lg font-semibold tabular-nums text-primary"
                data-ocid="history.tip_index"
              >
                {decoded?.ok ? decoded.tree.lastBlockIndex.toString() : "—"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {t.tipCertificateSize}
              </span>
              <span
                className="font-mono text-sm tabular-nums"
                data-ocid="history.tip_certificate_size"
              >
                {t.tipBytes(formatInteger(certificate.certificate.length))}
              </span>
            </div>
            {decoded?.ok ? (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">
                  {t.tipLastBlockHash}
                </span>
                <p
                  className="select-all border-l border-gold bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed break-all"
                  data-ocid="history.tip_hash"
                >
                  {toHex(decoded.tree.lastBlockHash)}
                </p>
              </div>
            ) : (
              <div
                className="space-y-1.5"
                data-ocid="history.tip_decode_error_state"
              >
                <p className="text-sm text-destructive">{t.tipDecodeError}</p>
                <pre
                  className="max-h-32 select-all overflow-auto border-l border-border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap"
                  data-ocid="history.tip_hash_tree"
                >
                  {certificate.hash_tree.length === 0
                    ? "—"
                    : toHex(certificate.hash_tree)}
                </pre>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t.tipReturnedBy}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const KIND_META: Record<
  BlockKind,
  {
    labelKey: keyof HistoryText & `kind${string}`;
    icon: typeof ArrowUpRight;
    className: string;
  }
> = {
  transfer: {
    labelKey: "kindTransfer",
    icon: ArrowUpRight,
    className: "bg-primary/10 text-primary border-gold",
  },
  transferFrom: {
    labelKey: "kindTransfer",
    icon: ArrowUpRight,
    className: "bg-primary/10 text-primary border-gold",
  },
  mint: {
    labelKey: "kindMint",
    icon: Coins,
    className: "bg-success/10 text-success border-success/30",
  },
  burn: {
    labelKey: "kindBurn",
    icon: History,
    className: "bg-muted text-muted-foreground border-border",
  },
  approve: {
    labelKey: "kindApprove",
    icon: ArrowDownLeft,
    className: "bg-accent/10 text-accent border-accent/30",
  },
  "legacy-unknown": {
    labelKey: "kindLegacyUnknown",
    icon: History,
    className: "bg-muted text-muted-foreground border-border",
  },
};

function KindBadge({ kind }: { kind: BlockKind }) {
  const t = useDict(HISTORY_TEXT);
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium ${meta.className}`}
      title={kind === "transferFrom" ? t.transferFromTitle : undefined}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {t[meta.labelKey]}
    </Badge>
  );
}

function FeeDetail({ entry }: { entry: DecodedBlock }) {
  const t = useDict(HISTORY_TEXT);
  if (entry.kind === "burn") {
    return <span className="text-muted-foreground">{t.noFee}</span>;
  }
  if (entry.fee === undefined || entry.fee === 0n) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <span className="font-mono tabular-nums">
        {formatAmount(entry.fee, entry.decimals)}
      </span>
      {entry.feeCollector && (
        <span
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
          title={t.feeCollectorTitle(entry.feeCollector)}
          data-ocid="history.fee_collector_credit"
        >
          <PiggyBank className="h-3 w-3" aria-hidden="true" />
          {t.toFeeCollector}
        </span>
      )}
    </span>
  );
}

function MemoValue({ memo }: { memo: DecodedMemo }) {
  return (
    <span className="break-all" title={`0x${memo.hex}`}>
      {memo.utf8 ? (
        <>
          “{memo.utf8}”{" "}
          <span className="text-muted-foreground">0x{shortHex(memo.hex)}</span>
        </>
      ) : (
        `0x${shortHex(memo.hex)}`
      )}
    </span>
  );
}

interface DetailItem {
  key: string;
  label: string;
  value: ReactNode;
}

/** Optional ICRC-3 fields shown beneath a block. */
function detailItems(entry: DecodedBlock, t: HistoryText): DetailItem[] {
  const items: DetailItem[] = [];
  if (entry.kind === "transferFrom" && entry.spender) {
    items.push({
      key: "spender",
      label: t.detailSpender,
      value: <AccountText account={entry.spender} />,
    });
  }
  if (entry.memo) {
    items.push({
      key: "memo",
      label: t.detailMemo,
      value: <MemoValue memo={entry.memo} />,
    });
  }
  if (entry.createdAt !== undefined) {
    items.push({
      key: "created",
      label: t.detailCreated,
      value: formatTimestamp(entry.createdAt),
    });
  }
  if (entry.expiresAt !== undefined) {
    items.push({
      key: "expires",
      label: t.detailExpires,
      value: formatTimestamp(entry.expiresAt),
    });
  }
  if (entry.expectedAllowance !== undefined) {
    items.push({
      key: "expected",
      label: t.detailExpectedAllowance,
      value: `${formatAmount(entry.expectedAllowance, entry.decimals)} ${TTTI_SYMBOL}`,
    });
  }
  return items;
}

function BlockId({
  entry,
  index,
  onJump,
}: {
  entry: DecodedBlock;
  index: number;
  onJump: (id: bigint) => void;
}) {
  const t = useDict(HISTORY_TEXT);
  const tx = useDict(HISTORY_EXPLORER_TEXT);
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-1.5">
        <ExplorerLink
          target={tttiBlockTarget(entry.id)}
          label={tx.blockLabel(entry.id.toString())}
          className="text-inherit decoration-transparent hover:decoration-current"
          hideIcon
          data-ocid={`history.block_link.${index + 1}`}
        >
          #{entry.id.toString()}
        </ExplorerLink>
        {entry.legacy && (
          <Badge
            variant="outline"
            className="px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
            title={t.legacyBadgeTitle(String(entry.decimals))}
          >
            {t.legacyBadge}
          </Badge>
        )}
      </span>
      {entry.phash && entry.id > 0n && (
        <button
          type="button"
          onClick={() => onJump(entry.id - 1n)}
          className="inline-flex items-center gap-1 rounded text-[11px] text-muted-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={t.parentHashTitle(entry.phash)}
          aria-label={t.parentHashAria(
            shortHex(entry.phash),
            (entry.id - 1n).toString(),
          )}
          data-ocid={`history.phash_link.${index + 1}`}
        >
          <Link2 className="h-3 w-3" aria-hidden="true" />
          {shortHex(entry.phash)}
        </button>
      )}
    </span>
  );
}

/** The block's own hash: shortened toggle to the full hex, plus a copy icon. */
function BlockHash({ hash, index }: { hash: string; index: number }) {
  const t = useDict(HISTORY_TEXT);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = () => {
    void navigator.clipboard
      .writeText(hash)
      .then(() => {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  };

  const copyLabel = copied ? t.blockHashCopied : t.blockHashCopy;
  return (
    <span
      className="inline-flex max-w-[18rem] items-start gap-1 text-[11px] text-muted-foreground"
      data-ocid={`history.block_hash.${index + 1}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        title={t.blockHash}
        className="inline-flex min-w-0 items-start gap-1 rounded text-left font-mono transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-ocid={`history.block_hash_toggle.${index + 1}`}
      >
        <Hash className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="sr-only">{t.blockHash} </span>
        <span className={expanded ? "min-w-0 break-all" : ""}>
          {expanded ? hash : shortHex(hash)}
        </span>
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label={copyLabel}
        title={copyLabel}
        className="-my-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-5 md:w-5"
        data-ocid={`history.block_hash_copy.${index + 1}`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" aria-hidden="true" />
        ) : (
          <Copy className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
      <span
        className={copied ? "shrink-0 text-success" : "sr-only"}
        aria-live="polite"
      >
        {copied ? t.blockHashCopied : ""}
      </span>
    </span>
  );
}

function FromValue({ entry }: { entry: DecodedBlock }) {
  const t = useDict(HISTORY_TEXT);
  if (entry.kind === "mint") {
    return <span className="text-muted-foreground">{t.minted}</span>;
  }
  return <AccountText account={entry.from} />;
}

function ToValue({ entry }: { entry: DecodedBlock }) {
  const t = useDict(HISTORY_TEXT);
  if (entry.kind === "burn") {
    return <span className="text-muted-foreground">{t.ledger}</span>;
  }
  if (entry.kind === "approve") {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <AccountText account={entry.spender ?? entry.to} />
        <span className="font-body text-[11px] text-muted-foreground">
          {t.spenderNote}
        </span>
      </span>
    );
  }
  return <AccountText account={entry.to} />;
}

interface EntryProps {
  entry: DecodedBlock;
  index: number;
  highlighted: boolean;
  /** Carries the block anchor id (visible layout only, so ids stay unique). */
  anchored: boolean;
  /** Lowercase hex of the block's own ICRC-3 hash, once computed. */
  hash?: string;
  onJump: (id: bigint) => void;
}

function EntryRow({
  entry,
  index,
  highlighted,
  anchored,
  hash,
  onJump,
}: EntryProps) {
  const t = useDict(HISTORY_TEXT);
  const details = detailItems(entry, t);
  const rowTone = highlighted ? "bg-primary/10" : "";
  return (
    <>
      <TableRow
        id={anchored ? blockAnchorId(entry.id) : undefined}
        className={`scroll-mt-24 transition-smooth hover:bg-primary/5 ${rowTone} ${details.length > 0 ? "border-b-0" : ""}`}
        data-block-id={entry.id.toString()}
        data-ocid={`history.item.${index + 1}`}
      >
        <TableCell className="align-top font-mono text-xs text-muted-foreground">
          <span className="inline-flex flex-col items-start gap-1">
            <BlockId entry={entry} index={index} onJump={onJump} />
            {hash && <BlockHash hash={hash} index={index} />}
          </span>
        </TableCell>
        <TableCell className="align-top">
          <KindBadge kind={entry.kind} />
        </TableCell>
        <TableCell className="align-top font-mono text-xs">
          <span className="inline-flex flex-col gap-0.5">
            <FromValue entry={entry} />
            {entry.kind === "transferFrom" && entry.spender && (
              <span className="font-body text-[11px] text-muted-foreground">
                {t.via(truncateAccount(entry.spender))}
              </span>
            )}
          </span>
        </TableCell>
        <TableCell className="align-top font-mono text-xs">
          <ToValue entry={entry} />
        </TableCell>
        <TableCell className="align-top text-right font-mono font-semibold tabular-nums text-foreground">
          {entry.kind === "burn" && entry.amount !== null ? "−" : ""}
          {formatAmount(entry.amount, entry.decimals)}
        </TableCell>
        <TableCell className="align-top text-right text-xs">
          <FeeDetail entry={entry} />
        </TableCell>
        <TableCell className="align-top text-right text-xs text-muted-foreground whitespace-nowrap tabular-nums">
          {formatTimestamp(entry.ts)}
        </TableCell>
      </TableRow>
      {details.length > 0 && (
        <TableRow className={`hover:bg-primary/5 ${rowTone}`}>
          <TableCell colSpan={7} className="pt-0 pb-3">
            <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[11px]">
              {details.map((item) => (
                <div key={item.key} className="flex min-w-0 gap-1.5">
                  <dt className="text-muted-foreground">{item.label}</dt>
                  <dd className="min-w-0 font-mono">{item.value}</dd>
                </div>
              ))}
            </dl>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function EntryCard({
  entry,
  index,
  highlighted,
  anchored,
  hash,
  onJump,
}: EntryProps) {
  const t = useDict(HISTORY_TEXT);
  return (
    <Card
      id={anchored ? blockAnchorId(entry.id) : undefined}
      className={`scroll-mt-24 ${GOLD_CARD} ${highlighted ? "ring-2 ring-primary/50" : ""}`}
      data-block-id={entry.id.toString()}
      data-ocid={`history.item.${index + 1}`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <KindBadge kind={entry.kind} />
          <span className="font-mono text-xs text-muted-foreground">
            <BlockId entry={entry} index={index} onJump={onJump} />
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {entry.kind === "approve" ? t.allowance : t.amount}
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-primary">
            {entry.kind === "burn" && entry.amount !== null ? "−" : ""}
            {formatAmount(entry.amount, entry.decimals)} {TTTI_SYMBOL}
          </span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
          <dt className="text-muted-foreground">{t.from}</dt>
          <dd className="font-mono text-right break-all">
            {entry.kind === "mint" ? t.minted : (entry.from ?? "—")}
          </dd>
          <dt className="text-muted-foreground">
            {entry.kind === "approve" ? t.spender : t.to}
          </dt>
          <dd className="font-mono text-right break-all">
            {entry.kind === "burn"
              ? t.ledger
              : entry.kind === "approve"
                ? (entry.spender ?? entry.to ?? "—")
                : (entry.to ?? "—")}
          </dd>
          <dt className="text-muted-foreground">{t.fee}</dt>
          <dd className="text-right">
            <FeeDetail entry={entry} />
          </dd>
          {entry.feeCollector && (
            <>
              <dt className="text-muted-foreground">{t.feeCollector}</dt>
              <dd className="font-mono text-right break-all">
                {entry.feeCollector}
              </dd>
            </>
          )}
          {detailItems(entry, t).map((item) => (
            <div key={item.key} className="contents">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="min-w-0 font-mono text-right">{item.value}</dd>
            </div>
          ))}
          <dt className="text-muted-foreground">{t.time}</dt>
          <dd className="text-right">{formatTimestamp(entry.ts)}</dd>
          {hash && (
            <>
              <dt className="text-muted-foreground">{t.blockHash}</dt>
              <dd className="flex min-w-0 justify-end">
                <BlockHash hash={hash} index={index} />
              </dd>
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  const ids = Array.from({ length: 5 }, (_, i) => `history-skeleton-${i}`);
  return (
    <div className="space-y-3" data-ocid="history.loading_state">
      {ids.map((id) => (
        <Skeleton key={id} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useDict(HISTORY_TEXT);
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 border-t border-border px-6 py-16 text-center"
      data-ocid="history.empty_state"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-secondary text-primary shadow-gold">
        <History className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">{t.emptyTitle}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t.emptyDescription}
        </p>
      </div>
      <Button
        asChild
        variant="outline"
        className={OUTLINE_GOLD}
        data-ocid="history.primary_button"
      >
        <a href="/">{t.emptyBack}</a>
      </Button>
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  rangeLabel,
  disabled,
  onPage,
}: {
  page: number;
  totalPages: number;
  rangeLabel: string;
  disabled: boolean;
  onPage: (page: number) => void;
}) {
  const t = useDict(HISTORY_TEXT);
  const isNewest = page === 0;
  const isOldest = page >= totalPages - 1;
  const controls = [
    {
      id: "pagination_first",
      label: t.pageLatest,
      icon: ChevronsLeft,
      target: 0,
      off: isNewest,
    },
    {
      id: "pagination_prev",
      label: t.pageNewerBlocks,
      icon: ChevronLeft,
      target: page - 1,
      off: isNewest,
    },
    {
      id: "pagination_next",
      label: t.pageOlderBlocks,
      icon: ChevronRight,
      target: page + 1,
      off: isOldest,
    },
    {
      id: "pagination_last",
      label: t.pageOldest,
      icon: ChevronsRight,
      target: totalPages - 1,
      off: isOldest,
    },
  ];
  return (
    <nav
      aria-label={t.paginationAria}
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
      data-ocid="history.pagination"
    >
      <p
        className="text-xs text-muted-foreground tabular-nums"
        data-ocid="history.pagination_range"
      >
        {t.pageOf(rangeLabel, String(page + 1), String(totalPages))}
      </p>
      <div className="flex items-center gap-2">
        {controls.map((control) => {
          const Icon = control.icon;
          const compact =
            control.id === "pagination_first" ||
            control.id === "pagination_last";
          return (
            <Button
              key={control.id}
              type="button"
              variant="outline"
              size={compact ? "icon" : "sm"}
              className={`rounded-lg ${OUTLINE_GOLD}`}
              disabled={disabled || control.off}
              onClick={() => onPage(control.target)}
              aria-label={control.label}
              title={control.label}
              data-ocid={`history.${control.id}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {!compact && (
                <span>
                  {control.id === "pagination_prev" ? t.pageNewer : t.pageOlder}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

export function HistoryPage() {
  const t = useDict(HISTORY_TEXT);
  const tx = useDict(HISTORY_EXPLORER_TEXT);
  const te = useDict(EXPLORER_TEXT);
  const isMobile = useIsMobile();
  const locationHash = useLocation({ select: (loc) => loc.hash });
  const hashBlockId = useMemo(
    () => blockIndexFromHash(locationHash),
    [locationHash],
  );

  // TTTI-T ledger canister ID: technical details, else the frontend config.
  const { data: technicalDetails } = useTechnicalDetails();
  const [configCanisterId, setConfigCanisterId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadConfig()
      .then((config) => {
        if (active) setConfigCanisterId(config.backend_canister_id);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  const ledgerCanisterId =
    technicalDetails?.ledgerCanisterId.toText() ?? configCanisterId;
  // Probe the log so we know its total length before paging from the tip.
  const probeArgs = useMemo<GetBlocksArgs[]>(
    () => [{ start: 0n, length: 1n }],
    [],
  );
  const {
    data: probe,
    isLoading: isProbeLoading,
    isError: isProbeError,
    refetch: refetchProbe,
  } = useIcrc3GetBlocks(probeArgs);

  const [requestedPage, setRequestedPage] = useState(0);
  const [focusId, setFocusId] = useState<bigint | null>(null);
  const [highlightId, setHighlightId] = useState<bigint | null>(null);

  const logLength = probe?.log_length;
  const totalPages =
    logLength === undefined
      ? 0
      : Number((logLength + PAGE_SIZE - 1n) / PAGE_SIZE);
  const page = Math.max(0, Math.min(requestedPage, totalPages - 1));

  // Page 0 holds the newest PAGE_SIZE blocks; one capped range per page.
  const pageArgs = useMemo<GetBlocksArgs[]>(() => {
    if (logLength === undefined) return [];
    const end = logLength - BigInt(page) * PAGE_SIZE;
    if (end <= 0n) return [];
    const start = end > PAGE_SIZE ? end - PAGE_SIZE : 0n;
    const length = end - start;
    return [
      {
        start,
        length: length > MAX_BLOCKS_PER_CALL ? MAX_BLOCKS_PER_CALL : length,
      },
    ];
  }, [logLength, page]);

  const {
    data,
    isLoading: isPageLoading,
    isError: isPageError,
    refetch: refetchPage,
  } = useIcrc3GetBlocks(pageArgs);

  const {
    data: tipCertificate,
    isLoading: isTipLoading,
    refetch: refetchTip,
  } = useIcrc3GetTipCertificate();

  const {
    data: legacyInfo,
    isLoading: isLegacyLoading,
    isError: isLegacyError,
    refetch: refetchLegacy,
  } = useGetLegacyBlockInfo();

  const isLoading = isProbeLoading || isLegacyLoading;
  const isListLoading = pageArgs.length > 0 && isPageLoading;
  const isError = isProbeError || isPageError || isLegacyError;
  const refetch = useCallback(async () => {
    await refetchLegacy();
    await refetchProbe();
    await refetchPage();
    await refetchTip();
  }, [refetchLegacy, refetchProbe, refetchPage, refetchTip]);

  const entries = useMemo<DecodedBlock[]>(() => {
    if (!data?.blocks || !legacyInfo) return [];
    return data.blocks
      .map((block) => decodeBlock(block, legacyInfo))
      .sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
  }, [data, legacyInfo]);

  // Each block's own hash over the raw Value (before decoding), by block id.
  const [blockHashes, setBlockHashes] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  useEffect(() => {
    const blocks = data?.blocks;
    if (!blocks) return;
    let active = true;
    Promise.all(
      blocks.map(
        async (block) =>
          [
            block.id.toString(),
            toHex(await hashBlockValue(block.block)),
          ] as const,
      ),
    )
      .then((pairs) => {
        if (active) setBlockHashes(new Map(pairs));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [data]);

  // Follow a phash link: switch to the page holding the parent, then scroll.
  const jumpToBlock = useCallback(
    (id: bigint) => {
      if (logLength === undefined || id >= logLength) return;
      setRequestedPage(Number((logLength - 1n - id) / PAGE_SIZE));
      setFocusId(id);
      setHighlightId(id);
    },
    [logLength],
  );

  // Open /history#block-<n>: load the page holding block n once per hash.
  const handledHash = useRef<string | null>(null);
  useEffect(() => {
    if (hashBlockId === null || logLength === undefined) return;
    if (handledHash.current === locationHash) return;
    handledHash.current = locationHash;
    jumpToBlock(hashBlockId);
  }, [hashBlockId, locationHash, logLength, jumpToBlock]);

  useEffect(() => {
    if (focusId === null || !entries.some((entry) => entry.id === focusId)) {
      return;
    }
    const nodes = document.querySelectorAll<HTMLElement>(
      `[data-block-id="${focusId.toString()}"]`,
    );
    const target = Array.from(nodes).find((node) => node.offsetParent !== null);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    setFocusId(null);
  }, [focusId, entries]);

  const total = data?.log_length ?? logLength ?? 0n;
  const rangeArgs = pageArgs[0];
  const rangeLabel = rangeArgs
    ? t.rangeBlocks(
        (rangeArgs.start + rangeArgs.length - 1n).toString(),
        rangeArgs.start.toString(),
        formatInteger(total),
      )
    : t.rangeEmpty(formatInteger(total));

  const linkedBlockOffPage =
    hashBlockId !== null &&
    logLength !== undefined &&
    hashBlockId < logLength &&
    !isListLoading &&
    entries.length > 0 &&
    !entries.some((entry) => entry.id === hashBlockId);

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:gap-14"
      data-ocid="history.page"
    >
      <header className="flex flex-wrap items-end justify-between gap-6 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold bg-secondary text-primary shadow-gold">
            <History className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-imperial text-gradient-gold text-2xl leading-tight md:text-3xl">
              {t.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {logLength !== undefined && (
            <Badge
              variant="outline"
              className="border-gold bg-primary/10 font-mono text-primary tabular-nums"
              data-ocid="history.total_count"
            >
              {t.totalBlocks(formatInteger(total))}
            </Badge>
          )}
          {ledgerCanisterId && (
            <ExplorerLink
              target={icpDashboardCanisterUrl(ledgerCanisterId)}
              label={te.viewCanisterOnIcpDashboard}
              className="text-xs text-muted-foreground"
              data-ocid="history.canister_link"
            >
              {ledgerCanisterId}
            </ExplorerLink>
          )}
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <Card
          className="rounded-lg border-destructive bg-card"
          data-ocid="history.error_state"
        >
          <CardHeader>
            <CardTitle className="font-display text-lg text-destructive">
              {t.errorTitle}
            </CardTitle>
            <CardDescription>{t.errorDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className={OUTLINE_GOLD}
              onClick={() => void refetch()}
              data-ocid="history.retry_button"
            >
              {t.retry}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <TipPanel
            certificate={tipCertificate}
            isLoading={isTipLoading}
            logLength={logLength}
          />

          {logLength === 0n ? (
            <EmptyState />
          ) : (
            <>
              {linkedBlockOffPage && hashBlockId !== null && (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-l border-gold bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
                  data-ocid="history.linked_block_panel"
                >
                  <span>
                    {tx.linkedBlock} · {tx.blockLabel(hashBlockId.toString())} —{" "}
                    {tx.linkedBlockNotOnPage}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`rounded-lg ${OUTLINE_GOLD}`}
                    onClick={() => jumpToBlock(hashBlockId)}
                    data-ocid="history.show_linked_block_button"
                  >
                    {tx.showLinkedBlock}
                  </Button>
                </div>
              )}

              {isListLoading ? (
                <LoadingState />
              ) : (
                <>
                  {/* Desktop table */}
                  <Card
                    className={`hidden md:block ${GOLD_CARD}`}
                    data-ocid="history.table"
                  >
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="sticky top-0 bg-card [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
                          <TableRow>
                            <TableHead className="w-32">{t.colBlock}</TableHead>
                            <TableHead className="w-32">{t.colType}</TableHead>
                            <TableHead>{t.colFrom}</TableHead>
                            <TableHead>{t.colTo}</TableHead>
                            <TableHead className="text-right">
                              {t.colAmount(TTTI_SYMBOL)}
                            </TableHead>
                            <TableHead className="text-right">
                              {t.colFee}
                            </TableHead>
                            <TableHead className="text-right">
                              {t.colTime}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entries.map((entry, index) => (
                            <EntryRow
                              key={entry.id.toString()}
                              entry={entry}
                              index={index}
                              highlighted={entry.id === highlightId}
                              anchored={!isMobile}
                              hash={blockHashes.get(entry.id.toString())}
                              onJump={jumpToBlock}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Mobile cards */}
                  <div className="space-y-2 md:hidden" data-ocid="history.list">
                    {entries.map((entry, index) => (
                      <EntryCard
                        key={entry.id.toString()}
                        entry={entry}
                        index={index}
                        highlighted={entry.id === highlightId}
                        anchored={isMobile}
                        hash={blockHashes.get(entry.id.toString())}
                        onJump={jumpToBlock}
                      />
                    ))}
                  </div>
                </>
              )}

              <PaginationBar
                page={page}
                totalPages={totalPages}
                rangeLabel={rangeLabel}
                disabled={isListLoading}
                onPage={(next) => {
                  setHighlightId(null);
                  setRequestedPage(next);
                }}
              />

              {legacyInfo && legacyInfo.boundaryIndex > 0n && (
                <p className="text-center text-xs text-muted-foreground">
                  {t.legacyNote(
                    legacyInfo.boundaryIndex.toString(),
                    String(legacyInfo.legacyDecimals),
                    String(legacyInfo.currentDecimals),
                  )}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
