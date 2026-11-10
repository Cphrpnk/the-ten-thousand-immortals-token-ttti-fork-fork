import { defineSplitDict } from "../core/dict";
import type en from "../split/pagedList/en";

/**
 * Page-by-page loading of the public DEX lists (swap history, transfers and
 * other cursor-paged lists). English is authoritative. Counts are passed in
 * already formatted for the active language.
 * Split per language: src/i18n/split/pagedList/<lang>.ts.
 */
export const PAGED_LIST_TEXT = defineSplitDict<typeof en>("pagedList");

/** English text of the admin lists (admin screens stay in English). */
export const ADMIN_PAGED_LIST_TEXT = {
  loadMore: "Load more",
  loading: "Loading…",
  loadingMore: "Loading more…",
  noMoreResults: "No more results",
  empty: "Nothing to show yet.",
  loadError: "The list could not be loaded.",
  loadMoreError: "More results could not be loaded.",
  retry: "Retry",
  showing: (count: string) => `Showing ${count}`,
} as const;

/** English text of the reserve-check alert and its progress (admin). */
export const RESERVE_ALERT_TEXT = {
  title: "Reserve check alert",
  accountsCompared: (compared: string, toCompare: string) =>
    `${compared} of ${toCompare} accounts compared`,
  raisedAt: (date: string) => `Raised ${date}`,
  runLabel: (runId: string) => `Run #${runId}`,
  alertId: (id: string) => `Alert #${id}`,
  progressTitle: "Reserve check progress",
  progressRunning: "A reserve check is running.",
  progressIdle: "No reserve check is running.",
  progressInProgress: (batch: string, totalBatches: string) =>
    `In progress (batch ${batch} of ${totalBatches})`,
  progressFinished: "Finished",
  progressIdleBadge: "Idle",
  checkInProgress: (batch: string, totalBatches: string) =>
    `Reserve check in progress (batch ${batch} of ${totalBatches}). The result is final once every batch is read.`,
  excludedTitle: "Excluded accounts daily re-read",
  excludedActive: "Re-reading",
  excludedIdle: "Idle",
  excludedRead: (read: string, total: string) =>
    `Read ${read} of ${total} excluded accounts`,
  excludedReincluded: (count: string) => `Re-included: ${count}`,
  excludedUnreadable: (count: string) => `Unreadable: ${count}`,
  excludedBatchSize: (size: string) => `Batch size ${size}`,
  excludedStarted: (date: string) => `Started ${date}`,
  excludedLastBatch: (date: string) => `Last batch ${date}`,
  excludedLastFinished: (date: string) => `Last finished ${date}`,
  excludedNextRun: (date: string) => `Next run ${date}`,
  excludedNever: "Never",
  excludedNote:
    "A non-zero balance re-includes an excluded account at once, in the check and in the sweep.",
  batchSize: (size: string) => `Batch size ${size}`,
  excludedZero: (count: string) => `Excluded at zero: ${count}`,
  unreadable: (count: string) => `Unreadable: ${count}`,
  lastBatch: (date: string) => `Last batch ${date}`,
  runAgain: "Run the reserve check again",
} as const;

/** English text of the DEX sweep progress (admin). */
export const SWEEP_PROGRESS_TEXT = {
  title: "Sweep progress",
  running: "A sweep is running.",
  idle: "No sweep is running.",
  runLabel: (runId: string) => `Run #${runId}`,
  batches: (count: string) => `${count} batches`,
  batchSize: (size: string) => `Batch size ${size}`,
  startedAt: (date: string) => `Started ${date}`,
  lastBatch: (date: string) => `Last batch ${date}`,
  tokenDone: "Done",
  tokenPending: "In progress",
  listed: "Accounts listed",
  read: "Accounts read",
  withBalance: "With a balance",
  excludedZero: "Excluded at zero",
  skipped: "Skipped",
  unreadable: "Unreadable",
  inFlight: "In flight",
} as const;
