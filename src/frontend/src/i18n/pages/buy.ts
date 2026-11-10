import { defineSplitDict } from "../core/dict";
import type buyBtcEn from "../split/buyBtc/en";
import type buyDeliveryEn from "../split/buyDelivery/en";
import type buyExplorerEn from "../split/buyExplorer/en";
import type buyLiquidityEn from "../split/buyLiquidity/en";
import type buyMintPoolEn from "../split/buyMintPool/en";
import type buyOutcomeEn from "../split/buyOutcome/en";
import type buyPageEn from "../split/buyPage/en";
import type buyPanelsEn from "../split/buyPanels/en";
import type buyPoolCapEn from "../split/buyPoolCap/en";
import type buyTransferOfferEn from "../split/buyTransferOffer/en";

/**
 * Buy page (pages/ExchangePage.tsx) and its components (components/exchange,
 * components/btc). English is authoritative and kept word for word. Token
 * symbols, amounts, rates, fees and percentages are passed in unchanged.
 * Each dictionary lives in split/<name>/<lang>.ts and is loaded per language.
 */

/** pages/ExchangePage.tsx and components/exchange/MintOutcomeAlerts.tsx */
export const BUY_PAGE_TEXT = defineSplitDict<typeof buyPageEn>("buyPage");

/**
 * English buy-to-mint explanation, rendered as-is in the white paper so the
 * mint page and the white paper share one text. Read lazily: the English
 * split file is only in memory once the language loader has run.
 */
export const MINT_INFO_EN = {
  get toggle(): string {
    return BUY_PAGE_TEXT.en.mintInfoToggle;
  },
  get paragraphs(): readonly [string, string] {
    return [
      BUY_PAGE_TEXT.en.mintInfoBody1,
      BUY_PAGE_TEXT.en.mintInfoBody2,
    ] as const;
  },
};

/**
 * components/exchange/purchaseOutcome.ts. Read with pickDict(BUY_OUTCOME_TEXT, lang).
 * Entries taking `server` show the backend's message in English; the other
 * languages use their own sentence for the same error code.
 */
export const BUY_OUTCOME_TEXT =
  defineSplitDict<typeof buyOutcomeEn>("buyOutcome");

/** components/exchange/DeliveryAddressCard.tsx */
export const BUY_DELIVERY_TEXT =
  defineSplitDict<typeof buyDeliveryEn>("buyDelivery");

/**
 * Panels of components/exchange: GetIcpFirstPanel, MigrationNotice,
 * PayTokenSelector, PresaleProgress, TokenRateCard and WalletPercentBar.
 */
export const BUY_PANELS_TEXT = defineSplitDict<typeof buyPanelsEn>("buyPanels");

/** components/exchange/BtcPurchasePanel.tsx and components/btc/*. */
export const BUY_BTC_TEXT = defineSplitDict<typeof buyBtcEn>("buyBtc");

/** Explorer labels of the buy result and the BTC tracking widget. */
export const BUY_EXPLORER_TEXT =
  defineSplitDict<typeof buyExplorerEn>("buyExplorer");

/** components/exchange/ZeroBalanceTransferOffer.tsx */
export const BUY_TRANSFER_OFFER_TEXT =
  defineSplitDict<typeof buyTransferOfferEn>("buyTransferOffer");

/** Liquidity-forming mint: components/exchange (order, preview, outcome). */
export const BUY_LIQUIDITY_TEXT =
  defineSplitDict<typeof buyLiquidityEn>("buyLiquidity");

/** Pools value versus capitalisation block of the mint screen. */
export const BUY_POOL_CAP_TEXT =
  defineSplitDict<typeof buyPoolCapEn>("buyPoolCap");

/** Pool choice of the mint screen (components/exchange/MintPoolSelector.tsx). */
export const BUY_MINT_POOL_TEXT =
  defineSplitDict<typeof buyMintPoolEn>("buyMintPool");
