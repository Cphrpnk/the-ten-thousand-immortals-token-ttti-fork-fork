# Design Brief

## Direction

Gold & Obsidian, unchanged — the English admin page reorganized into nine numbered sections, using only existing tokens plus admin utilities (section header, accordion, filter chip, token selector).

## Tone

Numismatic restraint: warm black, generous space, gold only for active filters, primary actions, focus and section indices; text factual and minimal.

## Differentiation

The admin reads like a bound ledger: numbered sections (01–09) with a gold hairline, one widget per concern with a token dropdown, every long list folded shut.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background / foreground | 0.13 0.008 60 / 0.94 0.025 85 | obsidian and warm ivory |
| card / popover / border | 0.155 0.01 60 / 0.16 0.012 60 / 0.265 0.024 70 | section cards, dropdowns, hairlines |
| primary / accent | 0.79 0.13 82 / 0.63 0.1 58 | gold CTA, active chip, section index / bronze |
| muted / muted-foreground | 0.19 0.012 60 / 0.7 0.035 78 | token select bg, stat labels, counts |
| success / warning / destructive | 0.72 0.14 150 / 0.75 0.15 55 / 0.63 0.2 27 | completed / needs review / failed badges |
| choice-surface, plug-*, reading-* | unchanged | setup flow / white paper only |

## Typography

- Display: Fraunces — page title `.text-imperial`, section titles `font-display text-xl`.
- Body: Satoshi — labels `text-sm`, notes `text-xs text-muted-foreground`, `.admin-stat-label`.
- Mono: JetBrains Mono — amounts, block indices, memos, principals, `.admin-section-index`, `.token-select`, `.admin-stat-value`.

## Elevation & Depth

Section widgets keep `GOLD_CARD` (components/admin/styles.ts), flat; accordions `.admin-accordion` inset inside cards; dropdowns `bg-popover border-gold shadow-elevated`.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header / Footer | existing | existing | unchanged |
| Admin title | `bg-background` | none | `.text-imperial` "Admin", `.divider-gold` |
| Section index | `bg-background/90 backdrop-blur` sticky | `border-b` | `.admin-nav-link` jump links to 9 sections |
| Section | `bg-background` | `.admin-section-header` gold hairline | `space-y-16` between sections |
| Widget | `GOLD_CARD` | existing | one per concern; token dropdown top-right |
| Long list | `.admin-accordion` | `border` | closed by default, count in trigger |

## Spacing & Rhythm

Page `max-w-5xl`, `.section-breathing`; sections 64px apart; card `p-6 md:p-8`; stat grid `grid-cols-2 md:grid-cols-4 gap-6`; rows min 48px; 44px touch targets.

## Component Patterns

- Section order: 01 Overview · 02 Sales & rate · 03 Treasury · 04 Cycles · 05 To review · 06 History · 07 Buyback funding · 08 DEX · 09 Snapshot export.
- Section header: `.admin-section .admin-section-header` → `.admin-section-index` "01" + `h2 font-display` + optional right-aligned muted line.
- Overview: single `GOLD_CARD`, 4 stats (supply, max supply, mint progress with thin gold bar, transfer fee) via `.admin-stat-label` / `.admin-stat-value`.
- Per-token widget: shadcn `Select` with `.token-select` trigger (16px token icon + symbol); ICP, ckBTC, ckUSDC, ckUSDT, TTTI-T where relevant; content swaps below.
- Accordion: shadcn `Accordion type="single" collapsible` (no defaultValue); `.admin-accordion`, `.admin-accordion-trigger` label left, `.admin-accordion-count` + chevron right.
- Filter chips: `.filter-chip` row, `overflow-x-auto`, `aria-pressed`; History: All, Mint/Deposit, Revenue sent, Refund, Buyback, Swap, Liquidity, Destination; token `.token-select` at row end.
- History list: rows `.rule-quiet`, newest first, 25/page, shadcn `Pagination` below; type badge outline, mono amount right.
- To review: same chips (type) + token select; rows with Arrived / Not arrived actions (outline / gold).
- Status badges: outline; success / warning / destructive text colours; gold never for warnings.
- Empty: one muted line; loading: skeleton rows.

## Motion

- Accordion `animate-accordion-down/up`; chips and links `transition-smooth`; no scale. Honor reduced motion.

## Constraints

- No existing token, font or tailwind value changed; admin utilities only added.
- Non-admin pages untouched; admin English; no promotional wording.

## Signature Detail

Mono gold section numerals 01–09 over a fine gold hairline — the only ornament on the admin page.
