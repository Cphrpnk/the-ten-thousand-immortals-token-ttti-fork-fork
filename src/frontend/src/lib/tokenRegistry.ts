import { Principal } from "@icp-sdk/core/principal";
import { PayToken } from "../backend";
import type { Account, MetadataValue, TransferArgs } from "../backend";
import type { RawMetadataValue } from "./icpLedger";
import {
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  TOKEN_NAME,
  TTTI_DECIMALS,
  TTTI_SYMBOL,
} from "./token";

export {
  CKBTC_LEDGER_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDT_LEDGER_CANISTER_ID,
} from "./token";

/** A wallet token, described from its ledger's ICRC-1 metadata. */
export interface TokenDescriptor {
  canisterId: Principal;
  name: string;
  symbol: string;
  decimals: number;
  fee: bigint;
}

/**
 * Wallet tokens in display order (ICP, TTTI-T, ckBTC, ckUSDC, ckUSDT), with
 * defaults used until (or if) the ledger metadata cannot be read. TTTI-T is
 * the app's backend canister.
 */
export function tokenRegistry(tttiCanisterId: string): Array<TokenDescriptor> {
  const fromPayToken = (token: PayToken): TokenDescriptor => {
    const pay = PAY_TOKENS[token];
    return {
      canisterId: Principal.fromText(pay.ledgerCanisterId),
      name: pay.name,
      symbol: pay.symbol,
      decimals: pay.decimals,
      fee: pay.fee,
    };
  };
  return [
    fromPayToken(PayToken.icp),
    {
      canisterId: Principal.fromText(tttiCanisterId),
      name: TOKEN_NAME,
      symbol: TTTI_SYMBOL,
      decimals: TTTI_DECIMALS,
      fee: 0n,
    },
    ...PAY_TOKEN_ORDER.filter((token) => token !== PayToken.icp).map(
      fromPayToken,
    ),
  ];
}

type MetadataEntry = [string, MetadataValue | RawMetadataValue];

function textField(entries: Array<MetadataEntry>, key: string) {
  const value = entries.find(([name]) => name === key)?.[1];
  if (!value) return undefined;
  if ("__kind__" in value) {
    return value.__kind__ === "Text" ? value.Text : undefined;
  }
  return "Text" in value ? value.Text : undefined;
}

function natField(entries: Array<MetadataEntry>, key: string) {
  const value = entries.find(([name]) => name === key)?.[1];
  if (!value) return undefined;
  if ("__kind__" in value) {
    return value.__kind__ === "Nat" ? value.Nat : undefined;
  }
  return "Nat" in value ? value.Nat : undefined;
}

/** Overlay icrc1_metadata (name, symbol, decimals, fee) on a descriptor. */
export function withMetadata(
  token: TokenDescriptor,
  entries: Array<MetadataEntry>,
): TokenDescriptor {
  const decimals = natField(entries, "icrc1:decimals");
  return {
    canisterId: token.canisterId,
    name: textField(entries, "icrc1:name") ?? token.name,
    symbol: textField(entries, "icrc1:symbol") ?? token.symbol,
    decimals: decimals !== undefined ? Number(decimals) : token.decimals,
    fee: natField(entries, "icrc1:fee") ?? token.fee,
  };
}

/** ICRC-1 memo limit, in bytes (also the address book limit). */
export const MAX_MEMO_BYTES = 32;

export type MemoEncoding =
  | { ok: true; bytes: Uint8Array | undefined; length: number }
  | { ok: false; length: number };

/**
 * Encode memo text as UTF-8 bytes. Blank text gives no memo; more than
 * MAX_MEMO_BYTES bytes is refused.
 */
export function encodeMemoText(text: string): MemoEncoding {
  const trimmed = text.trim();
  if (trimmed === "") return { ok: true, bytes: undefined, length: 0 };
  const bytes = new TextEncoder().encode(trimmed);
  if (bytes.length > MAX_MEMO_BYTES) return { ok: false, length: bytes.length };
  return { ok: true, bytes, length: bytes.length };
}

/** Memo bytes as text (UTF-8), or hex when they are not valid UTF-8. */
export function decodeMemoText(bytes: Uint8Array | undefined): string {
  if (!bytes || bytes.length === 0) return "";
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
}

/**
 * ICRC-1 transfer arguments built in the app (created now). The optional
 * memo must be at most MAX_MEMO_BYTES bytes.
 */
export function buildTransferArgs(
  to: Account,
  amount: bigint,
  fee: bigint,
  memo?: Uint8Array,
): TransferArgs {
  if (memo && memo.length > MAX_MEMO_BYTES) {
    throw new Error(`Memo longer than ${MAX_MEMO_BYTES} bytes`);
  }
  return {
    to,
    amount,
    fee,
    ...(memo && memo.length > 0 ? { memo } : {}),
    created_at_time: BigInt(Date.now()) * 1_000_000n,
  };
}
