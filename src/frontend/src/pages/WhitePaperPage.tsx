import {
  BTC_PAYMENT_TEXT,
  BTC_WALLET_CONVERSION_TEXT,
} from "../components/btcPaymentText";
import {
  useBtcDepositInfo,
  useGetLegacyBlockInfo,
  useTechnicalDetails,
} from "../hooks/useQueries";
import { MINT_REVENUE_TEXT, SITE_TEXT } from "../i18n/common";
import { useDict } from "../i18n/core";
import { MINT_INFO_EN } from "../i18n/pages/buy";
import { FAQ_TEXT } from "../i18n/pages/landing";
import { WHITE_PAPER_TEXT } from "../i18n/pages/whitePaper";
import {
  MIN_PURCHASE,
  PRICE_TEXT,
  TTTI_DECIMALS,
  encodeAccountText,
  formatInteger,
  formatUnits,
} from "../lib/token";
const RATE_TEXT =
  "The USD rate of ICP, BTC, USDC and USDT is fetched once an hour (Coinbase first, then CoinGecko) and is valid for one hour. A purchase is refused when the rate of the paid token has expired.";

/** English mint revenue sentences; sections 02 to 08 stay in English. */
const REVENUE_EN = MINT_REVENUE_TEXT.en;

/** Maximum supply of the future TTTI version. */
const FUTURE_MAX_SUPPLY = 10_000;
/** TOKEN_MAX_SUPPLY in base units (1 TTTI-T), used until the canister answers. */
const TEST_MAX_SUPPLY = 100_000_000n;

function formatFetchedAt(timestamp: bigint | undefined): string {
  if (timestamp === undefined) return "Not yet read";
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? "Not yet read" : date.toUTCString();
}

export function WhitePaperPage() {
  const t = useDict(WHITE_PAPER_TEXT);
  const site = useDict(SITE_TEXT);
  const revenue = useDict(MINT_REVENUE_TEXT);
  const contents = [
    { id: "reading-notice", label: t.contentsReading },
    { id: "present-ledger", label: t.contentsLedger },
    { id: "purchase-mechanics", label: t.contentsMechanics },
    { id: "mint-revenue", label: revenue.wpContentsRevenue },
    { id: "controls-risk", label: t.contentsControls },
    { id: "creator-disclosures", label: t.contentsDisclosures },
    { id: "privacy", label: t.contentsPrivacy },
    { id: "verification", label: t.contentsVerification },
  ];
  const technicalDetails = useTechnicalDetails();
  const legacyInfo = useGetLegacyBlockInfo();
  const btcInfo = useBtcDepositInfo();
  const details = technicalDetails.data;
  const rateText = details?.refreshPolicy || RATE_TEXT;
  const oracleSources = details?.oracleSources ?? [];
  const reserveAccount = details
    ? encodeAccountText(details.cyclesReserveAccount)
    : null;
  const decimals = details?.decimals ?? TTTI_DECIMALS;
  const maxSupply = details?.maxSupply ?? TEST_MAX_SUPPLY;
  const maxSupplyLabel = formatUnits(maxSupply, decimals, 0);
  const legacyBoundary =
    details?.legacyBlockBoundary ?? legacyInfo.data?.boundaryIndex ?? null;
  const pending = technicalDetails.isError ? "Could not be loaded" : "Loading…";
  const canisterRows = [
    {
      label: "Canister ID",
      value: details ? details.ledgerCanisterId.toText() : pending,
    },
    {
      label: "Controllers",
      value: details
        ? details.controllers && details.controllers.length > 0
          ? details.controllers.map((p) => p.toText()).join(", ")
          : "Not yet read"
        : pending,
    },
    {
      label: "Module hash",
      value: details ? (details.moduleHash ?? "Not yet read") : pending,
    },
    {
      label: "Read at",
      value: details ? formatFetchedAt(details.canisterInfoFetchedAt) : pending,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl pb-12" data-ocid="white_paper.page">
      <header className="mb-12 border-b border-border pb-10 text-center md:mb-14">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t.eyebrow}
        </p>
        <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t.subtitle}
        </p>
      </header>

      <div data-ocid="white_paper.corrected.panel">
        <div className="token-identity-note mb-9 max-w-3xl px-5 py-4 text-sm leading-relaxed">
          <strong className="block font-medium uppercase tracking-[0.1em] text-primary">
            {t.identityHeading}
          </strong>
          {t.identityBefore}
          <strong>TTTI-T</strong>
          {t.identityAfter}
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
          <nav aria-label={t.contentsAria} className="lg:sticky lg:top-24">
            <p className="mb-3 border-b border-border pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t.contentsHeading}
            </p>
            <ol className="space-y-1 text-sm">
              {contents.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-sm py-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-ocid={`white_paper.contents.link.${index + 1}`}
                  >
                    <span className="mr-2 text-primary">0{index + 1} /</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="paper-sheet min-w-0 px-6 py-8 shadow-lg shadow-background/20 sm:px-10 md:px-14 md:py-14">
            <div className="paper-prose mx-auto space-y-9">
              <section
                id="reading-notice"
                className="scroll-mt-24 space-y-4"
                aria-labelledby="reading-title"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {t.readingEyebrow}
                </p>
                <h2
                  id="reading-title"
                  className="font-display text-3xl md:text-4xl"
                >
                  {t.readingTitle}
                </h2>
                <p>{t.readingP1}</p>
                <p>{t.readingP2}</p>
                <p data-ocid="white_paper.reading_revenue.text">
                  {revenue.wpReadingP3}
                </p>
              </section>
              {t.englishOnlyNotice ? (
                <div
                  className="border-l paper-rule pl-5 text-sm"
                  data-ocid="white_paper.english_only.text"
                >
                  <p>{t.englishOnlyNotice}</p>
                  {site.conflictNotice ? (
                    <p className="mt-1">{site.conflictNotice}</p>
                  ) : null}
                </div>
              ) : null}
              <section
                id="present-ledger"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="ledger-title"
              >
                <h2 id="ledger-title" className="font-display text-3xl">
                  02 / Token &amp; supply
                </h2>
                <p>
                  TTTI is the future version, with a maximum of{" "}
                  <strong>{formatInteger(FUTURE_MAX_SUPPLY)} TTTI</strong>.
                  TTTI-T is the live test, with a maximum of{" "}
                  <strong>{maxSupplyLabel} TTTI-T</strong>. Every ledger value
                  on this page is shown in TTTI-T.
                </p>
                <p data-ocid="white_paper.cap.text">
                  There are never more than 10,000 TTTI and never more than{" "}
                  {maxSupplyLabel} TTTI-T. Tokens cannot be burned. Transfers to
                  the contract's own address are refused. That address is the
                  minting account: the canister principal with the default
                  subaccount; such a transfer is refused without any debit. Once
                  the cap is reached, minting stops for good; transfer fees
                  collected by the contract are issued again against ICP, ckBTC,
                  ckUSDC or ckUSDT, only after fresh minting reaches the cap:
                  when one falls, another takes his place.
                </p>
                <p>
                  The current ledger code uses{" "}
                  <strong>{decimals} decimal places</strong>: one TTTI-T is{" "}
                  {formatInteger(10n ** BigInt(decimals))} base units. The
                  implemented maximum is{" "}
                  <strong>{maxSupplyLabel} TTTI-T</strong> (
                  {formatInteger(maxSupply)} base units). A maximum is not a
                  statement of circulating or minted supply.
                </p>
                <p data-ocid="white_paper.legacy_blocks.text">
                  This ledger continues earlier test versions of the contract.
                  Blocks before index{" "}
                  <strong className="font-mono">
                    {legacyBoundary === null
                      ? "…"
                      : formatInteger(legacyBoundary)}
                  </strong>{" "}
                  come from those versions and encode amounts with{" "}
                  <strong>4 decimals</strong>; their amounts must be interpreted
                  according to their block index, not today's {decimals}-decimal
                  setting. The earliest record amounts without accounts.
                </p>
                <p data-ocid="white_paper.index.text">
                  The TTTI-T canister also serves as its own ICRC index canister
                  (index-ng interface: get_account_transactions, ledger_id,
                  status, list_subaccounts), built from its full history.
                </p>
                <p data-ocid="white_paper.price.text">
                  {PRICE_TEXT} The minimum of{" "}
                  <strong>
                    {formatUnits(MIN_PURCHASE, TTTI_DECIMALS, 0)} TTTI-T
                  </strong>{" "}
                  is {formatInteger(MIN_PURCHASE)} base units, as on the mint
                  page. A smaller purchase is accepted only when it takes
                  everything that remains available.
                </p>
              </section>
              <section
                id="purchase-mechanics"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="mechanics-title"
              >
                <h2 id="mechanics-title" className="font-display text-3xl">
                  03 / Purchase mechanics
                </h2>
                <p>
                  Tokens are created only by purchases paid in ICP, ckBTC,
                  ckUSDC or ckUSDT (BTC is first converted to ckBTC), up to the{" "}
                  {maxSupplyLabel} TTTI-T maximum. No one, administrators
                  included, has a separate mint operation. Each purchase mints
                  new tokens first; transfer fees collected in the fee account
                  are delivered to minters only after fresh minting has reached
                  the cap.
                </p>
                <div
                  className="space-y-2 border-l paper-rule pl-5"
                  data-ocid="white_paper.mint_info.panel"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    {t.mintInfoHeading}
                  </p>
                  <p>{MINT_INFO_EN.paragraphs[0]}</p>
                  <p>{MINT_INFO_EN.paragraphs[1]}</p>
                </div>
                <p data-ocid="white_paper.rate.text">
                  {rateText} A rate is never used more than 5 minutes past its
                  one-hour validity. When every source fails, the fetch is
                  retried every 5 minutes. There is no fallback rate and no
                  margin: without a valid rate, the purchase is refused before
                  any funds are taken. The amount of the paid token for a given
                  number of tokens therefore depends on the rate in force. No
                  amount of the paid token beyond the cost of what is delivered
                  is taken. Purchases can be paused, and ledger operations may
                  fail.
                </p>
                {oracleSources.length > 0 ? (
                  <p data-ocid="white_paper.oracle_sources.text">
                    Rate sources, read from the canister:{" "}
                    {oracleSources.join("; ")}.
                  </p>
                ) : null}
                <p>
                  After collection, delivery can fail; the code then refunds the
                  paid amount minus the paid token's ledger fee, and the refund
                  itself can fail. The routing of the paid amount and of the fee
                  is described in section 04. Review the current quote and
                  transaction before approving any payment.
                </p>
                <p data-ocid="white_paper.purchase_rules.text">
                  Each account can run one purchase at a time; a purchase
                  started while another is in progress is refused. An ICP
                  payment uses an approval that expires after 15 minutes. The
                  mint page opens with ICP selected.
                </p>
                <p data-ocid="white_paper.purchase_records.text">
                  Each purchase record keeps the exact amount paid, the fee, the
                  net amount exchanged, the TTTI-T received, the payment block
                  and the mint block. The wallet shows your own purchase history
                  with these quantities and the paid/received ratio, without any
                  USD value; only you and the administrators can see it. For a
                  delivered purchase, the net amount exchanged, fee excluded, is
                  recorded as the only refundable basis; the fee is never
                  refundable. Transaction numbers link to the official ICP
                  Explorer; Bitcoin transactions link to a live tracker
                  (mempool).
                </p>
                <p data-ocid="white_paper.btc_payment.text">
                  {BTC_PAYMENT_TEXT}
                </p>
                {btcInfo.data ? (
                  <p data-ocid="white_paper.btc_confirmations.text">
                    Confirmations currently required by the ckBTC minter, read
                    from the canister:{" "}
                    <strong>
                      {formatInteger(btcInfo.data.minConfirmations)}
                    </strong>
                    .
                  </p>
                ) : null}
                <p data-ocid="white_paper.btc_wallet_conversion.text">
                  {BTC_WALLET_CONVERSION_TEXT}
                </p>
                <p data-ocid="white_paper.ckbtc_minter.text">
                  ckBTC minter canister ID:{" "}
                  <span className="break-all font-mono text-sm">
                    {details ? details.ckbtcMinterId.toText() : pending}
                  </span>
                </p>
              </section>
              <section
                id="mint-revenue"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="revenue-title"
              >
                <h2 id="revenue-title" className="font-display text-3xl">
                  04 / {revenue.wpRevenueHeading}
                </h2>
                <p data-ocid="white_paper.mint_price.text">
                  {REVENUE_EN.priceRule} {REVENUE_EN.ownerShare}{" "}
                  {REVENUE_EN.ownerAccumulates}
                </p>
                <p data-ocid="white_paper.treasury_return.text">
                  Funds held in the internal mint treasuries stay in the
                  contract and are managed by the admin, after the ICP they hold
                  has topped the cycles reserve up to 2 ICP.
                </p>
                <p data-ocid="white_paper.mint_fee.text">
                  {REVENUE_EN.feeShare} {REVENUE_EN.halfLp}{" "}
                  {REVENUE_EN.halfPermanent} The swap goes through ICPSwap
                  first, then the native pools; while the rate of the paid token
                  is absent or expired, the amount waits. The addition is never
                  conditioned on price. {REVENUE_EN.noTttiCreated}
                </p>
                <p data-ocid="white_paper.swap_fee.text">
                  {REVENUE_EN.swapFeeSplit} {REVENUE_EN.routerFeeRule} Nothing
                  goes to cycles. {REVENUE_EN.bonusEarnedNote}
                </p>
                <p data-ocid="white_paper.pools_public.text">
                  Liquidity positions are public and linked to the identifier on
                  TTTI. Observed yield is only what was actually earned.
                </p>
                <p data-ocid="white_paper.cycles_topup.text">
                  {REVENUE_EN.cyclesRule} The conversion goes through the Cycles
                  Minting Canister from the published CYCLES_RESERVE subaccount.
                  The reserve has no withdrawal path. Past purchases keep the
                  fee recorded at the time.
                </p>
                <div
                  className="border-l paper-rule pl-5"
                  data-ocid="white_paper.cycles_reserve.panel"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Cycles reserve account
                  </p>
                  {reserveAccount ? (
                    <p className="mt-1 break-all font-mono text-sm">
                      {reserveAccount}
                    </p>
                  ) : technicalDetails.isError ? (
                    <p
                      className="mt-1 text-sm"
                      data-ocid="white_paper.cycles_reserve.error_state"
                    >
                      The reserve account could not be loaded. It is listed
                      under Technical details.
                    </p>
                  ) : (
                    <p
                      className="mt-1 text-sm"
                      data-ocid="white_paper.cycles_reserve.loading_state"
                    >
                      Loading reserve account…
                    </p>
                  )}
                </div>
              </section>
              <section
                id="controls-risk"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="controls-title"
              >
                <h2 id="controls-title" className="font-display text-3xl">
                  05 / Controls &amp; risk
                </h2>
                <p>
                  Administrators cannot mint tokens and cannot freeze transfers.
                  The TTTI-T transfer-fee collector account and the cycles
                  reserve cannot be withdrawn. The code also lets administrators
                  pause or resume sales, withdraw mint revenue to a destination
                  typed at each withdrawal, and export a balance snapshot. The
                  ledger transfer fee can be changed within fixed bounds only in
                  this test (TTTI-T) version. Ledger transactions carry the
                  current transfer fee.
                </p>
                <p data-ocid="white_paper.upgrade.text">
                  This canister can be upgraded by its controllers. The
                  guarantees on this page describe the current code, identified
                  by its module hash.
                </p>
                <p>
                  Holding the token grants no voting, revenue, redemption or
                  guaranteed liquidity. A listing, secondary market, buyback or
                  later full release is{" "}
                  <strong>not a present entitlement</strong>. A secondary
                  market, if one appears, may be illiquid and highly volatile.
                </p>
              </section>
              <section
                id="creator-disclosures"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="disclosures-title"
              >
                <h2 id="disclosures-title" className="font-display text-3xl">
                  06 / Creator disclosures
                </h2>
                <p>TTTI and THAT have the same creator.</p>
                <p>
                  No free tokens. The creator received no TTTI or TTTI-T at
                  creation. Any token the creator holds was minted at the same
                  price as everyone else.
                </p>
                <p>
                  Holdings: at launch, the creator holds no TTTI-T. Any later
                  holding will be published here.
                </p>
                <p>
                  No guaranteed price support. The protocol places no
                  price-linked order and creates no TTTI-T. The mint fee buys
                  TTTI-T without any price condition, to feed liquidity. The
                  creator may fund optional, limited buybacks with personal
                  funds, but does not defend a price or trade to create volume.
                </p>
                <p>
                  No mechanical link to THAT. TTTI cannot be exchanged for THAT
                  or used inside THAT. The success or failure of THAT gives TTTI
                  holders nothing.
                </p>
                <p>
                  Anyone, the creator included, may provide liquidity at their
                  discretion and withdraw it at any time. Trust only what you
                  can verify.
                </p>
              </section>
              <section
                id="privacy"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="privacy-title"
              >
                <h2 id="privacy-title" className="font-display text-3xl">
                  07 / Privacy
                </h2>
                <p data-ocid="white_paper.privacy.text">
                  {FAQ_TEXT.en.privacyA}
                </p>
              </section>
              <section
                id="verification"
                className="scroll-mt-24 space-y-4 border-t paper-rule pt-9"
                aria-labelledby="verification-title"
              >
                <h2 id="verification-title" className="font-display text-3xl">
                  08 / Verification
                </h2>
                <p>
                  The canister ID, controllers and module hash are read from the
                  canister and listed under Technical details on the home page.
                  The values in force are:
                </p>
                <dl
                  className="space-y-3 border-l paper-rule pl-5 text-sm"
                  data-ocid="white_paper.canister_info.panel"
                >
                  {canisterRows.map((row) => (
                    <div key={row.label}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em]">
                        {row.label}
                      </dt>
                      <dd className="mt-1 break-all font-mono">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  Current balances, supply, fee, sale remaining and status
                  should be read from the running ledger and sale before acting;
                  no fixed snapshot is asserted on this page.
                </p>
                <p>
                  This edition describes the current application source. It is
                  not a substitute for checking the deployed application
                  yourself.
                </p>
              </section>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
