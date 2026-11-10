import { defineSplitDict } from "../core/dict";
import type en from "../split/history/en";
import type explorerEn from "../split/historyExplorer/en";

/**
 * Transaction history page (pages/HistoryPage.tsx).
 * Split per language: src/i18n/split/history/<lang>.ts.
 */
export const HISTORY_TEXT = defineSplitDict<typeof en>("history");

export type HistoryText = (typeof HISTORY_TEXT)["en"];

/**
 * History page labels for block anchors reached from /history#block-<n>.
 * Split per language: src/i18n/split/historyExplorer/<lang>.ts.
 */
export const HISTORY_EXPLORER_TEXT =
  defineSplitDict<typeof explorerEn>("historyExplorer");
