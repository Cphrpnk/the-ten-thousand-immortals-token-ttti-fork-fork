# Project Guidance

## User Preferences

- Keep the English interface spacious and restrained, with gold as an accent.
- Use verified official standards imagery where available.
- Use verified current app figures in the corrected white paper and preserve the original separately.
- Keep historical account and transaction data intact.
- Flat token icon for header, footer and token/exchange menus; full-detail emblem for hero and showcase spots.
- Built-in wallet is the promoted default path; Plug is highlighted in colour among wallets to create.
- Abstract identity and blockchain as much as possible; keep funnel text minimal.
- The purchase funnel is a guided setup flow (wallet? then ICP?) shown at first sign-in and relaunchable from the menu.
- Onramper is the only ICP purchase provider in the funnel.
- Open the public Onramper buy page https://onramper.com/buy.
- The footer carries a neutral copyright line with no third-party build credit.
- Trust badges stay low-key and never compete with the hero Buy TTTI-T button; white badge on dark backgrounds, black on light.
- Do not name the creator
- State facts only; no promotional or value-suggesting wording
- Transfer fee adjustable only in the test (TTTI-T) version, not in the real version
- Message conveyed: no TTTI held prior to launch and no TTTI pre-allocated
- Six purchase acknowledgements are asked only once, at the account's first purchase
- Backend limited to the core contract; no admin power to mint, freeze or move ICP or collected fees
- Present TTTI as a perfect instrument without denigrating it; no profit, scarcity-as-value or price-rise promises
- Amounts accept both '.' and ',' as the decimal separator

## Accepted Requirements

- « Créer un wallet » propose Plug en premier, mis en avant par une couleur distinctive
- L'adresse du wallet interne se copie au clic
- Réduction du texte explicatif au minimum
- Flow de configuration à la première connexion, reconfigurable depuis le menu
- Étape 1 : avez-vous un wallet ICP ? Oui / Non
- Étape 2 Non : utiliser le wallet interne ou en créer un ; Oui : connecter son wallet ICP ou utiliser le wallet interne
- Retour dans l'app puis achat de TTTI-T
- Un seul clic sur « Acheter de l'ICP » copie l'adresse et ouvre Onramper (seul fournisseur) via https://onramper.com/buy
- Étape 3 : avez-vous de l'ICP ? Oui : transfert ; Non : acheter de l'ICP ici via Onramper
- Remove the word presale everywhere; new title and meta description as given
- Rename ledger metadata to name TTTI-T and symbol TTTI-T; remove on-page TTTI-P explanations
- Explain the Exchange page and relabel or remove it according to who operates it
- Rewrite the narrative: Immortals as adversary, TTTI the lazy money, THAT the three hundred; remove the listed phrases and cards
- Remove price-rise, scarcity, early-advantage and limited-supply wording; state only the listed facts
- Whitepaper opens automatically on the first buy; after that no need
- TTTI-T section with the stated terms
- Creator disclosures as stated, creator unnamed; creator does not list TTTI on any other exchange
- Footer without 'not an investment, a security'; keep no returns, final purchases, afford to lose
- Only two Buy TTTI-T buttons (header and end of page); no sticky bottom bar
- Technical details filled with real deployed values and reported back; 'Not yet published' accepted for this beta
- Remove the adjustable seller margin; small fixed fee to pay for the canister's own cycles, with an estimate of the needed margin
- No fallback rate; refuse purchase when the rate is stale
- No one, admin included, can mint tokens outside the buy-to-mint logic
- Collected TTTI transfer fees are reissued only at the end, after fresh minting reaches the cap
- Convey: no TTTI held prior to launch and no TTTI pre-allocated
- Excess ICP is refunded
- Admin cannot freeze transfers; transfer fee change only in the test version
- Fixed 1% cycles fee confirmed by the user
- Price 10,000 USD per TTTI plus fixed 1% fee, minimum 1.01 USD
- Buy not blocked by inactivity; rate refreshed at purchase, refusal with no ICP taken if not refreshable
- Six exact-sentence checkboxes required only once, at the first purchase
- Only two Buy TTTI-T buttons (header and end of page); no sticky bar; Buy not in menus
- Admin: remove mint, fallback-rate and presale controls; fixed order; fee account not withdrawable; transfer fee adjustable in beta only
- Remove unused freeze UI on the Transfer page
- Backend limited to the contract's essentials
- The TTTI-T token canister also acts as its own ICRC index canister (index-ng interface) built from the full history, without changing balances
- Technical details show the index canister ID
- Number inputs accept '.' and ',' as the decimal separator
- Choosing the internal wallet automatically prefills the delivery address with the user's principal

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend renames: getPresaleStatus -> getSaleStatus, PresaleStatus -> SaleStatus, #presaleComplete -> #saleComplete; new getTechnicalDetails; removed mint, setTransfersFrozen, setFallbackEnabled, marginBps and fallback rate (migration 20261020_000000).
- Fixed 1% cycles fee constant CYCLES_FEE_BPS=100 in lib/treasury.mo and lib/token.ts; buyer price 10,100 USD per TTTI-T; purchases mint first up to the cap, then deliver fee-account tokens; only delivered cost is pulled.
- /buy renders ExchangePage and /exchange redirects there; the first startBuy per browser opens /white-paper and sets localStorage ttti.whitePaperSeen (lib/whitePaperGate.ts).
- Page-level copy rewrites (landing story/facts/disclosures/technical details, buy page six checkboxes, whitepaper current edition, admin controls) were planned but not finished in the TTTI-T revision build; consumers of removed hooks may only have minimal compile fixes.
- Backend endpoints acceptPurchaseAcknowledgements and getMyPurchaseAcknowledgement store a one-time per-principal acknowledgement (migration 20261021_000000); convertDeposit is the only purchase endpoint and refuses #acknowledgementRequired until accepted.
- ExchangePage picks II hooks (useGetMyPurchaseAcknowledgement, useAcceptPurchaseAcknowledgements in useQueries.ts) or Plug hooks (usePlugPurchaseAcknowledgement, usePlugAcceptPurchaseAcknowledgements in usePlugPurchase.ts) by active wallet; handleBuy runs accept (if needed), approve, convertDeposit with the same principal.
- SaleStatus has no priceStale (priceAgeSeconds display only); backend refreshes the rate on every purchase via OracleLib.refreshPrice and refuses with #priceUnavailable before taking ICP.
- Removed endpoints: getTreasuryState, getFailedForwards, retryTreasuryForward, getOnRampLinks, setOnRampLinks, handleDeposit, quoteExactTtti, buyExactTtti, getAdminSwitches, getUserProfile; failed ICP forwards retry automatically after purchases. TreasuryConfig is { icpAccount }.
- Admin page uses components/admin cards: LaunchControls, TransferFeeCard, IcpAccountCard, SnapshotExport, ConversionsCard. Buy TTTI-T buttons render only in Header.tsx (desktop and mobile) and ClosingCta.tsx; MobileBuyBar removed.
- useQueries.ts still exports @deprecated shims for removed endpoints and mixins/access-control-api.mo is unwired; both are unused and can be deleted later.
- Mock backend must match generated names exactly: access control is _initialize_access_control.
- Narrative rewrite applied: Hero 'It does nothing. Except move.'; StorySection has three legend paragraphs plus small italic Thermopylae epilogue (data-ocid landing.story.epilogue); TokenDetailsSection holds 'What TTTI is' and a FACTS list; PresaleSection holds the TTTI-T test-release terms and Creator disclosures; ClosingCta h2 'Ten thousand units. One function.'
- LandingPage order: Hero(top), Story, Divider, TokenDetails, Presale, HowItWorks, Faq, Divider, ClosingCta(join).
- TokenInfo Technical details uses useTechnicalDetails; controllers, source code and build hash show 'Not yet published'; conversion row says 'No conversion function exists yet'.
- WhitePaperPage original edition is the `original` template string (kept untouched, still says 'not a presale'); current edition is the JSX under edition === 'corrected' and still describes admin mint, freeze and fallback-rate controls that the backend removed.
- FaqSection 'How do I get ICP?' answer still says 'TTTI-T (Test)'.
- Hero h1 is now '10,000 Immortals.' (Immortals in gold span); subline starts with 'Fast. Secure. Unbreakable in formation.' then a paragraph stating TTTI has all the qualities of ICP plus a fixed maximum supply of 10,000 units; eyebrow says 'TTTI-T is open'.
- TokenDetailsSection 'What TTTI is' paragraphs: 'Organized. Reliable. Interchangeable by design...', 'TTTI does one thing, and does it without fail: it moves value.', 'An instrument is only as good as the hand that holds it.'
- ClosingCta h2 now reads 'The formation is ready.' with 'is ready.' in the gold span.
- WhitePaperPage corrected edition now matches the backend: no admin mint, no freeze, no fallback rate or margin, mint first then fee tokens, 1.01 USD minimum; original edition untouched. FaqSection no longer says 'TTTI-T (Test)'.
- Admin-only backend calls: setSalesPaused, setTreasuryConfig, set_fee (bounded), exportBalanceSnapshot; the fee account cannot be burned.
- Hero h1 in components/landing/HeroSection.tsx now reads 'Ten Thousand Immortals.' (words, Immortals in gold span); the subline still says 'fixed maximum supply of 10,000 units'.
- Backend now exposes ICRC index-ng (get_account_transactions, ledger_id, status, list_subaccounts) via lib/index.mo, types/index.mo (Index-prefixed types) and mixins/index-api.mo, derived on the fly from ledger.blocks; legacy 4-decimal amounts are scaled to 8 decimals; 'legacy:index:amount' blocks have no accounts and appear in no account history.
- When backend bindings gain methods, the frontend check must also own src/frontend/src/mocks/backend.ts or the TS2739 typecheck fix is refused.
- lib/token.ts parseUnits accepts ',' as the decimal separator (converted to '.' when no '.' is present); DeliveryAddressCard prefills and auto-saves the Plug or non-anonymous Internet Identity principal; TokenInfo shows an 'Index canister' row equal to the ledger ID.
