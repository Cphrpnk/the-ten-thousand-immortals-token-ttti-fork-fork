# Design Brief

## Direction

Gold & Obsidian, unchanged — admin (nine numbered sections) and now the public Pools page (five numbered sections), using only existing tokens plus additive utilities.

## Tone

Numismatic restraint: warm black, generous space, gold only for primary actions, active nav/filters, gauge fill, focus and section indices; text factual and minimal.

## Differentiation

Pages read like a bound ledger: mono gold numerals over a gold hairline, hairline-ruled compact rows instead of cards, every long block folded shut.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background / foreground | 0.13 0.008 60 / 0.94 0.025 85 | obsidian and warm ivory |
| card / popover / border | 0.155 0.01 60 / 0.16 0.012 60 / 0.265 0.024 70 | widgets, dropdowns, row hairlines |
| primary / accent | 0.79 0.13 82 / 0.63 0.1 58 | gold CTA "Add", gauge fill, filling dot, index / bronze |
| muted / muted-foreground | 0.19 0.012 60 / 0.7 0.035 78 | nav pill, details bg, captions, fee tier |
| success / warning / destructive | 0.72 0.14 150 / 0.75 0.15 55 / 0.63 0.2 27 | open dot / paused-removed, pause notice / errors |
| step-inactive | 0.3 0.02 65 | gauge track |

## Typography

- Display: Fraunces — page title `.text-imperial`, section titles `h2 font-display text-2xl`.
- Body: Satoshi — intro `text-sm text-muted-foreground`, labels, `.admin-stat-label`.
- Mono: JetBrains Mono — pairs `.pool-pair`, amounts, gauge caption, `.pool-fee`, principals, indices.

## Elevation & Depth

Flat. Pool rows are open (`.surface-open`, `.pool-row` hairline); widgets keep `GOLD_CARD`; accordions `.admin-accordion`; dropdowns `bg-popover border-gold shadow-elevated`.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header / Footer | existing | existing | unchanged |
| Pools section nav | `.pools-nav` bg-background/90 blur, sticky top-16 | `border-b` | 5 `.admin-nav-link`: Pools, Indicateurs, Ma liquidité, Protocole, Demandes; `aria-current` on visible section |
| Section | `bg-background`, `.pools-section` (scroll-margin) | `.admin-section-header` gold hairline | numerals 01–05, `space-y-20` |
| Pool list | transparent | `.pool-row` top hairline | one row per pool |
| Widget (Indicateurs, Rewards, sign-in) | `GOLD_CARD` | existing | dropdown top-right `.token-select` |
| Long content | `.admin-accordion` | `border` | closed by default |

## Spacing & Rhythm

Page `max-w-5xl`, `.section-breathing`; sections 80px apart; rows min 64px, 14px vertical padding; card `p-6 md:p-8`; stat grid `grid-cols-2 md:grid-cols-4 gap-6`; 44px touch targets.

## Component Patterns

- Pools section: pause notice (`DexPausedNotice`) → header → one intro sentence → rows → closed "Comment fonctionnent les pools" accordion (protocol statement once, fee split, rules).
- Pool row `.pool-row` (md: 5 columns): `.pool-pair` (two 20px token icons + pair) · `.pool-status[data-status=open|filling|paused|removed]` · gauge column (`.pool-gauge > .pool-gauge-fill` style width %, caption mono `text-xs` "37 / 100 USD"; `data-unavailable` when rate expired) · `.pool-fee` · actions (Swap `variant=outline size=sm`, Add gold primary `size=sm`, Détails ghost + chevron).
- Mobile row: pair+status left, actions right; gauge and fee wrap to second line.
- Détails: `.pool-details` full-width under the row, closed by default; open-pool rows show reserves instead of the gauge.
- "Nouvelle paire" badge: outline `border-gold text-primary text-[11px]`.
- Indicateurs: summary stats visible (`.admin-stat-label` / `.admin-stat-value`), single widget with pool `Select` (`.token-select`), blocks + proof of reserves as closed accordions.
- Ma liquidité: one sign-in card when signed out; balances + positions rows `.rule-quiet`; single Rewards widget; privacy sentence visible `text-xs text-muted-foreground`.
- Mon activité: closed accordion; `.filter-chip` row (All / Deposits & withdrawals / Mint fees / LP bonus) + token `.token-select`; 25/page, shadcn `Pagination`.
- Protocole: set-aside, injections, address lookup — each a closed accordion.
- Demandes: form in closed accordion; chips All / My requests / Pending / Approved / Rejected; status badges outline.
- Admin: unchanged (01 Overview … 09 Snapshot export, same utilities).
- Empty: one muted line; loading: skeleton rows.

## Motion

- Accordion `animate-accordion-down/up`; gauge width eases 0.6s; links/chips `transition-smooth`; no scale. Honor reduced motion.

## Constraints

- No existing token, font or tailwind value changed; Pools utilities only added.
- No swap widget on the Pools page; Swap button links out. Facts only: swap fees pay the liquidity provided and only fees actually paid over the last 30 days are shown; no promotional wording.

## Signature Detail

Thin gold gauge per pool over a dark hairline track — the only colour in an otherwise ivory-on-obsidian list.
