import { type Dict, defineSplitDict } from "../core/dict";
import { LANGS } from "../core/lang";
import type en from "../split/dex/en";
import type plainEn from "../split/dexPlainRules/en";

/**
 * Public Pools page (DEX lot 1): pair registry and pair requests.
 * English is authoritative. Amounts, symbols, ledger IDs, dates and limits
 * are passed in already formatted for the active language.
 * Split per language: src/i18n/split/dex/<lang>.ts and
 * src/i18n/split/dexPlainRules/<lang>.ts.
 */
/**
 * Admin-facing strings of the DEX-2 batch (pair removal, LQ payouts, depth
 * columns). The admin screens are in English, so every language carries the
 * same English text.
 */
const DEX_ADMIN_EN = {
  adminRemovalTitle: "Pair removal",
  adminRemovalIntro: (days: string) =>
    `Announces the removal for ${days} days from now. Swaps and additions are suspended during the notice; withdrawals stay open, subject to position locks. At the effective date all positions are liquidated.`,
  adminRemoveButton: "Remove pair…",
  adminReasonLabel: "Reason (public)",
  adminReasonPlaceholder: "Reason for the removal",
  adminReasonCount: (count: string, max: string) =>
    `${count} / ${max} characters`,
  adminAnnounceButton: "Announce removal",
  adminAnnouncing: "Announcing…",
  adminAnnounceDone: (date: string) => `Removal announced. Effective ${date}.`,
  adminCancelRemovalButton: "Cancel removal",
  adminCancelling: "Cancelling…",
  adminCancelDone: "Removal cancelled.",
  adminErrNotAuthorized: "Only the admin can do this.",
  adminErrPoolNotFound: "This pool does not exist.",
  adminErrAlreadyAnnounced: (date: string) =>
    `A removal is already announced. Effective ${date}.`,
  adminErrAlreadyRemoved: "This pair is already removed.",
  adminErrReasonEmpty: "Enter a reason.",
  adminErrReasonTooLong: (max: string) =>
    `The reason is longer than ${max} characters.`,
  adminErrNoAnnouncement: "No removal is announced for this pair.",
  adminErrAlreadyCancelled: "The removal is already cancelled.",
  adminErrAlreadyExecuting: "The removal is already in progress.",
  adminErrAlreadyCompleted: "The removal is already completed.",
  adminLqLabel: "LQ — liquidation payout",
  adminLqHint:
    "Payout of a position at the removal of a pair. Check the ledger, then mark Arrived or Not arrived.",
  adminDepthColumn: "Depth (USD)",
  adminSwapStateColumn: "Swap state",
  adminRemovalColumn: "Removal",
  adminRemovalNone: "None",
  adminConfigThreshold: "Swap threshold",
  adminConfigSlippage: "Default slippage",
  adminConfigTolerance: "Reference tolerance",
  adminConfigNotice: "Removal notice",
  // PTM-4: creator payouts, cycles fee settlements and the fixed transfer fee.
  adminTransferFeeFixed:
    "Transfer fee: fixed at 100 e8s (0.000001 TTTI-T), paid to the creator. It cannot be changed.",
  adminCreatorTitle: "Creator holdings and payouts",
  adminCreatorIntro:
    "Amounts held by the contract for the creator, per token. A payout sends the held amount, minus the ledger fee, to the wallet configured for that token.",
  adminCreatorColToken: "Token",
  adminCreatorColHeld: "Held",
  adminCreatorColInFlight: "In transit",
  adminCreatorColPaidOut: "Paid out",
  adminCreatorColSources: "Sources",
  adminCreatorPayButton: (symbol: string) => `Pay out ${symbol}`,
  adminCreatorPaying: "Paying…",
  adminCreatorPayDone: (amount: string) => `Payout sent: ${amount}.`,
  adminCreatorErrNothing: "There is nothing to pay out for this token.",
  adminCreatorErrInProgress: "A payout is already in progress for this token.",
  adminCreatorErrNoWallet: "No wallet is configured for this token.",
  adminCreatorErrBelowFee: (fee: string, held: string) =>
    `The held amount ${held} does not cover the ledger fee ${fee}.`,
  adminCreatorErrPaused: "Payouts are paused.",
  adminCreatorPayoutsTitle: "Creator payouts",
  adminCreatorPayoutsEmpty: "No creator payout yet.",
  adminCreatorColNumber: "No.",
  adminCreatorColGross: "Gross",
  adminCreatorColNet: "Net",
  adminCreatorColStatus: "Status",
  adminCreatorColDate: "Date",
  adminCreatorColMemo: "Memo",
  adminCreatorReviewTitle: "Creator payouts to review",
  adminCreatorReviewEmpty: "No creator payout to review.",
  adminReviewArrived: "Arrived",
  adminReviewNotArrived: "Not arrived",
  adminReviewBlockLabel: "Block index",
  adminReviewBlockInvalid: "Enter a valid block index.",
  adminReviewDone: "Marked.",
  adminTransferStatusCompleted: (block: string) => `Completed · block ${block}`,
  adminTransferStatusNeedsReview: "Needs review",
  adminTransferStatusInProgress: "In progress",
  adminTransferStatusFailed: (detail: string) => `Failed: ${detail}`,
  adminCyclesFeesTitle: "Cycles fee settlements",
  adminCyclesFeesIntro:
    "Part of the 1 % mint fee sent to the cycles reserve before the creator receives the remainder.",
  adminCyclesFeesEmpty: "No cycles fee settlement yet.",
  adminCyclesFeesReviewTitle: "Cycles fee settlements to review",
  adminCyclesFeesReviewEmpty: "No cycles fee settlement to review.",
  adminCyclesColGross: "Gross",
  adminCyclesColNet: "Net to reserve",
  adminCyclesSplitsTitle: "Fee splits",
  adminCyclesSplitsEmpty: "No fee split yet.",
  adminSplitSourceLabel: "Source",
  adminSplitSourceMint: "Mint",
  adminSplitColCycles: "To cycles reserve",
  adminSplitColCreator: "To creator",
  adminCyclesPendingShare: (amount: string) =>
    `Fee share pending for the cycles reserve: ${amount}`,
  adminCyclesCoverage: (months: string, pct: string) =>
    `Reserve coverage: ${months} months, ${pct} % of the one-year target`,
  adminCyclesCoverageUnknown: "Reserve coverage: not available yet.",
  adminPageOlder: "Older",
  adminPageNewer: "Newer",
};

/** Pools page strings of one language, plus the English-only admin strings. */
type DexText = typeof en & typeof DEX_ADMIN_EN;

const DEX_SPLIT = defineSplitDict<typeof en>("dex");

/** Merged objects, one per loaded split language object. */
const dexMerged = new WeakMap<object, DexText>();

function dexFor(lang: (typeof LANGS)[number]): DexText {
  const base = DEX_SPLIT[lang];
  let merged = dexMerged.get(base);
  if (!merged) {
    merged = { ...DEX_ADMIN_EN, ...base };
    dexMerged.set(base, merged);
  }
  return merged;
}

/**
 * Pools page strings. Every language loads on demand; the admin strings are
 * English in all languages and merged in when a language is read.
 */
export const DEX_TEXT: Dict<DexText> = (() => {
  const dict = {} as { [L in (typeof LANGS)[number]]: DexText };
  for (const lang of LANGS) {
    Object.defineProperty(dict, lang, {
      enumerable: true,
      get: () => dexFor(lang),
    });
  }
  return dict;
})();

/**
 * Lot PTM-7: plain-language explanations of the pool-to-mint rules, shared by
 * the Pools, mint, guarantee and white paper areas. Rules only, no comment on
 * any expected effect. English is authoritative.
 */
export const PLAIN_RULES_TEXT =
  defineSplitDict<typeof plainEn>("dexPlainRules");
