# Design Brief

## Direction

Gold & Obsidian, unchanged — guided setup flow plus wallet address book (recipient suggestions, contact card, ICRC-2 approvals) built only from existing tokens.

## Tone

Numismatic restraint: warm black framing, generous space, gold reserved for primary actions and focus; amber `warning` and red `destructive` used only for approval cautions; violet→magenta only for Plug.

## Differentiation

Calm ledger-like rows: a thin gold start-bar marks the highlighted suggestion; approvals read as factual statements with a required expiry and explicit confirmation.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background / foreground | 0.13 0.008 60 / 0.94 0.025 85 | obsidian and warm ivory |
| card / popover / border | 0.155 0.01 60 / 0.16 0.012 60 / 0.265 0.024 70 | dialogs, hairlines |
| primary / accent | 0.79 0.13 82 / 0.63 0.1 58 | gold CTAs, focus, highlighted row / bronze |
| muted / muted-foreground | 0.19 0.012 60 / 0.7 0.035 78 | hover rows, secondary lines |
| warning | 0.75 0.15 55 | approval caution callouts (existing, unchanged) |
| destructive | 0.63 0.2 27 | revoke / unlimited / high-risk notes |
| success | 0.72 0.14 150 | copied, approval confirmed, contact saved |
| choice-surface, step-inactive, plug-* | unchanged | setup flow only |
| reading-* | unchanged | white-paper parchment only |

## Typography

- Display: Fraunces — dialog titles (Send, Contact, Address book).
- Body: Satoshi — nicknames `text-sm font-medium`, secondary lines `text-xs text-muted-foreground`.
- Mono: JetBrains Mono — principals (short `xxxxx…xxx-cai`), allowances, amounts, expiry times.
- Script companions unchanged (Noto Serif/Sans KR, Noto Serif/Sans Gurmukhi via `@import`); `:lang(ko)` keep-all, `:lang(pa-Guru)` line-height 1.7; zh-Hans on system CJK.

## Elevation & Depth

Dialogs `bg-popover border-gold shadow-elevated`; suggestion dropdown `bg-popover border shadow-subtle`; rows and callouts flat — no extra shadows.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header / Footer | existing | existing | unchanged |
| Send dialog | `bg-popover` | `border-gold` | token → recipient (+ book icon) → amount → fee line → slider → memo (optional) → Send |
| Suggestion dropdown | `bg-popover` | `border-border` | groups "Contacts", "Recent (ledger)"; max-h-72 scroll |
| Address book dialog | `bg-popover` | `border-gold` | search input, contact list, "New contact" ghost button |
| Contact card dialog | `bg-popover` | `border-gold` | identity block → `.divider-gold` → approvals section |
| Setup dialog / Purchase page | existing | existing | unchanged |

## Spacing & Rhythm

Dialogs `max-w-lg p-6 md:p-8`; 24px between form groups; rows min 48px; 12px callout padding (`p-3 md:p-4`); 44px touch targets.

## Component Patterns

- Recipient suggestions: `.suggestion-row` (avatar initial in `bg-muted` circle, nickname + mono short principal; ledger rows show short principal + `text-xs` token/last-date); highlighted via `data-highlighted`/`aria-selected` → gold start-bar. Combobox ARIA, arrow keys + Enter.
- Address book button: ghost icon button (BookUser) inside the recipient field end, `aria-label`.
- Save recipient: after success, quiet `text-primary` text link "Save to contacts" under the success line.
- Address book list: rows separated by `.rule-quiet`; nickname, mono short principal, chevron; empty state = one muted line + "New contact".
- Contact card: inputs Nickname, Principal (mono, copy icon → `.address-chip` style feedback), Default memo; Save gold, Delete as `text-destructive` ghost.
- Approvals section: one row per token (ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT) — token icon, mono allowance, expiry or "None", `Modify` / `Revoke` text buttons; loading = skeleton rows.
- Approval form: amount + required expiry (date/time); `.callout-info` numbered 2–3 short steps above it.
- Warnings: `.callout-warning` (TriangleAlert icon `text-warning`) always visible above the approve button; `.callout-danger` for revoke, large amount vs balance, or spender = own principal.
- Confirmation: checkbox "I understand" required → outline-gold `Approve` (`border-gold-strong text-primary`); Revoke uses `variant="destructive"` after AlertDialog confirm stating token, spender, amount.
- Result: success line `text-success` with block index (mono) and explorer link.

## Motion

- Dropdown/dialog: `animate-fade-in`; setup steps keep `animate-step-in/back`.
- Hover: `transition-smooth` on rows and tiles; no scale bounce. Copy: `animate-copied-pop`. Honor reduced motion.

## Constraints

- No token value changed; new utilities only (`.suggestion-row`, `.callout-warning`, `.callout-danger`, `.callout-info`).
- Gold never used for warnings; amber/red never for CTAs; violet/magenta only on Plug.
- Text factual and minimal, all 7 languages; principals always mono and copyable; visible focus rings.

## Signature Detail

A single gold hairline at the start of the highlighted row — the address book reads like a ledger index.
