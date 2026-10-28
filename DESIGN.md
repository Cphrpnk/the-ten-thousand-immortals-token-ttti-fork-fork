# Design Brief

## Direction

Gold & Obsidian, unchanged — public Pools page (pair cards, status badges, "New pair" badge, pair request form, requests list) and an English admin pairs card, built only from existing tokens and the admin `GOLD_CARD` style.

## Tone

Numismatic restraint: warm black framing, generous space, gold reserved for primary actions, focus and the "New pair" badge; text factual and minimal — approval is not a recommendation.

## Differentiation

Pairs read like a ledger index: quiet cards with mono figures, a single gold-outlined badge for new pairs, statuses stated plainly.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background / foreground | 0.13 0.008 60 / 0.94 0.025 85 | obsidian and warm ivory |
| card / popover / border | 0.155 0.01 60 / 0.16 0.012 60 / 0.265 0.024 70 | pair cards, form, hairlines |
| primary / accent | 0.79 0.13 82 / 0.63 0.1 58 | gold CTA, focus, "New pair" badge / bronze |
| muted / muted-foreground | 0.19 0.012 60 / 0.7 0.035 78 | "Awaiting first liquidity", "Pending", secondary lines |
| success | 0.72 0.14 150 | "Approved" badge, request sent |
| warning | 0.75 0.15 55 | copied-symbol flag in automatic checks |
| destructive | 0.63 0.2 27 | "Removed" / "Refused" badges, Refuse/Remove actions |
| choice-surface, step-inactive, plug-*, reading-* | unchanged | setup flow / white paper only |

## Typography

- Display: Fraunces — page title (`.text-imperial`), section titles, pair names on cards.
- Body: Satoshi — labels `text-sm`, notes `text-xs text-muted-foreground`.
- Mono: JetBrains Mono — ledger IDs (short `xxxxx…-cai`, copyable), minimums, deposit 0.0005 TTTI-T, fee tiers, reserves.
- Script companions unchanged (Noto KR / Gurmukhi via `@import`); `:lang(ko)` keep-all, `:lang(pa-Guru)` line-height 1.7.

## Elevation & Depth

Pair cards and request form `bg-card border-gold`, flat (no shadow); admin card uses `GOLD_CARD` from `components/admin/styles.ts`; dialogs `bg-popover border-gold shadow-elevated`.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header / Footer | existing | existing | unchanged; Pools link only in the hamburger Sheet |
| Pools intro | `bg-background` | none | `.text-imperial` title, one muted line, `.divider-gold` |
| Pair grid | `bg-background` | — | `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`, 7 starting pairs then approved pairs |
| Pair card | `bg-card` | `border-gold` | icons pair → name → status badge → mono minimum + fee tier |
| Request form | `bg-card` | `border-gold` | signed-in only; anonymous sees one muted line + sign-in button |
| Requests list | `bg-background` | `.rule-quiet` rows | pair, mono ledger id, status badge, reason line |
| Admin pairs card | `GOLD_CARD` | existing | English; pending requests + Approve / Refuse / Remove |

## Spacing & Rhythm

Page `.section-breathing`, `max-w-6xl`; cards `p-5 md:p-6`; 24px between form groups; rows min 48px; 44px touch targets.

## Component Patterns

- Status badge: shadcn `Badge variant="outline"` + text colour: awaiting first liquidity / pending `text-muted-foreground`; approved `border-success/40 text-success`; removed / refused `border-destructive/40 text-destructive`.
- New pair badge: `Badge variant="outline"` `border-gold-strong text-primary`, shown 30 days after approval.
- Pair card: two overlapping 24px token icons (existing token logo map), pair name `font-display text-lg`, mono `text-xs` lines for minimum locked liquidity and fee tier.
- Request form: Ledger ID input (mono), paired token select, fee tier as segmented `ToggleGroup`, optional message textarea, fixed mono line "Deposit: 0.0005 TTTI-T", `.callout-info` for the deposit rule (kept on refusal, returned on approval), gold `Button` submit; automatic-check results as `.callout-warning` (copied symbol) or `.callout-danger` (not ICRC-1/2, pair exists, limit reached, cooldown).
- Requests list: `.suggestion-row`-like rows without highlight; refused rows show reason `text-xs text-muted-foreground`.
- Admin card: inside `GOLD_CARD`, pending requests as rows (pair, ledger id mono, fee tier, message, checks); `Approve` gold, `Refuse` outline + reason input, `Remove` `variant="destructive"` behind AlertDialog stating swaps/deposits blocked, LP withdrawals stay open.
- Loading: skeleton cards/rows; empty: one muted line.

## Motion

- Cards/rows `transition-smooth` on hover (border to `border-gold-strong`), no scale; dialogs `animate-fade-in`. Honor reduced motion.

## Constraints

- No token, font or tailwind value changed; no new utilities.
- Gold never for warnings or removed states; amber/red never for CTAs; violet/magenta only on Plug.
- All public text in the 7 dictionaries; admin in English; no promotional wording.

## Signature Detail

A single gold-outlined "New pair" badge is the only accent on the grid — everything else stays ivory, muted and mono.
