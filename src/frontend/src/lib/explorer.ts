import { PayToken } from "../backend";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDT_LEDGER_CANISTER_ID,
  ICP_LEDGER_ID,
  PAY_TOKENS,
  TTTI_SYMBOL,
} from "./token";

/**
 * Pure URL helpers for transaction and canister explorers.
 * ICP Dashboard for ICP, ckBTC, ckUSDC and ckUSDT; mempool.space for Bitcoin;
 * the in-app History page for TTTI-T blocks.
 */

const ICP_DASHBOARD = "https://dashboard.internetcomputer.org";
const MEMPOOL = "https://mempool.space";

/** ICP Dashboard transaction path prefix, keyed by ledger canister ID. */
const DASHBOARD_TX_PREFIX: Readonly<Record<string, string>> = {
  [ICP_LEDGER_ID]: `${ICP_DASHBOARD}/transaction/`,
  [CKBTC_LEDGER_CANISTER_ID]: `${ICP_DASHBOARD}/bitcoin/transaction/`,
  [CKUSDC_LEDGER_CANISTER_ID]: `${ICP_DASHBOARD}/ethereum/${CKUSDC_LEDGER_CANISTER_ID}/transaction/`,
  [CKUSDT_LEDGER_CANISTER_ID]: `${ICP_DASHBOARD}/ethereum/${CKUSDT_LEDGER_CANISTER_ID}/transaction/`,
};

const PAY_TOKEN_VALUES = new Set<string>(Object.values(PayToken));

/** Ledger canister ID for a pay token, token symbol or ledger ID; null otherwise. */
export function payLedgerId(ledger: PayToken | string): string | null {
  if (PAY_TOKEN_VALUES.has(ledger)) {
    return PAY_TOKENS[ledger as PayToken].ledgerCanisterId;
  }
  if (DASHBOARD_TX_PREFIX[ledger] !== undefined) return ledger;
  const bySymbol = Object.values(PAY_TOKENS).find(
    (token) => token.symbol.toLowerCase() === ledger.toLowerCase(),
  );
  return bySymbol ? bySymbol.ledgerCanisterId : null;
}

/**
 * ICP Dashboard transaction URL for a block of the ICP, ckBTC, ckUSDC or
 * ckUSDT ledger (by pay token, symbol or ledger canister ID); null otherwise.
 */
export function icpDashboardTxUrl(
  ledger: PayToken | string,
  blockIndex: bigint,
): string | null {
  const id = payLedgerId(ledger);
  if (id === null) return null;
  return `${DASHBOARD_TX_PREFIX[id]}${blockIndex.toString()}`;
}

/** ICP Dashboard page of a canister. */
export function icpDashboardCanisterUrl(canisterId: string): string {
  return `${ICP_DASHBOARD}/canister/${encodeURIComponent(canisterId)}`;
}

/** Anchor id of a TTTI-T block row on the History page: "block-42". */
export function blockAnchorId(blockIndex: bigint | number): string {
  return `block-${blockIndex.toString()}`;
}

/** Block index from a History page hash ("#block-42" or "block-42"); null otherwise. */
export function blockIndexFromHash(hash: string): bigint | null {
  const match = /^#?block-(\d+)$/.exec(hash);
  return match ? BigInt(match[1]) : null;
}

/** In-app History path of a TTTI-T block: "/history#block-42". */
export function tttiBlockHistoryPath(blockIndex: bigint | number): string {
  return `/history#${blockAnchorId(blockIndex)}`;
}

/** mempool.space page of a Bitcoin transaction. */
export function mempoolTxUrl(txid: string): string {
  return `${MEMPOOL}/tx/${encodeURIComponent(txid)}`;
}

/** mempool.space page of a Bitcoin address. */
export function mempoolAddressUrl(address: string): string {
  return `${MEMPOOL}/address/${encodeURIComponent(address)}`;
}

/** Where a block link points: an external explorer or the in-app History page. */
export type BlockLinkTarget =
  | { kind: "external"; href: string }
  | { kind: "history"; to: "/history"; hash: string; path: string };

/** In-app History target of a TTTI-T block. */
export function tttiBlockTarget(blockIndex: bigint): BlockLinkTarget {
  return {
    kind: "history",
    to: "/history",
    hash: blockAnchorId(blockIndex),
    path: tttiBlockHistoryPath(blockIndex),
  };
}

/**
 * Link target of a block: the ICP Dashboard for ICP, ckBTC, ckUSDC and
 * ckUSDT, the in-app History page for TTTI-T (symbol "TTTI-T" or the TTTI-T
 * ledger canister ID when given). Null for any other ledger.
 */
export function blockLinkTarget(
  ledger: PayToken | string,
  blockIndex: bigint,
  tttiLedgerId?: string,
): BlockLinkTarget | null {
  if (
    ledger === TTTI_SYMBOL ||
    ledger.toUpperCase() === "TTTI" ||
    (tttiLedgerId !== undefined && ledger === tttiLedgerId)
  ) {
    return tttiBlockTarget(blockIndex);
  }
  const href = icpDashboardTxUrl(ledger, blockIndex);
  return href === null ? null : { kind: "external", href };
}
