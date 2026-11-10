import type { MintFeeClaimStatus } from "../../hooks/useDex";
import type { MINT_REVENUE_TEXT } from "../../i18n/common";

export type MintText = (typeof MINT_REVENUE_TEXT)["en"];

/**
 * Status label of a mint fee payout already paid. The claim panel was removed;
 * only the history keeps these entries, marked "Legacy".
 */
export function claimStatusLabel(
  m: MintText,
  status: MintFeeClaimStatus,
): string {
  switch (status.__kind__) {
    case "completed":
      return m.statusSent;
    case "inProgress":
      return m.statusPending;
    case "needsReview":
      return m.statusReview;
    case "failed":
      return `${m.statusFailed}: ${status.failed}`;
  }
}
