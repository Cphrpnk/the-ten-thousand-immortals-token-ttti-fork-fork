import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";
import {
  type RawMetadataValue,
  createLedgerActor,
  createLedgerAgent,
} from "./icpLedger";
import type { TokenDescriptor } from "./tokenRegistry";

/**
 * Tokens added to the swap selector only (never to the wallet token list),
 * stored in this browser, plus the ICPSwap token list used for symbol search.
 */

/** ICPSwap TokenList canister (mainnet, ICPSwap-Labs/docs). */
export const ICPSWAP_TOKEN_LIST_ID = "k37c6-riaaa-aaaag-qcyza-cai";

const STORAGE_KEY = "ttti.swapTokens.v1";

interface StoredToken {
  canisterId: string;
  name: string;
  symbol: string;
  decimals: number;
  fee: string;
}

const listeners = new Set<() => void>();
let cache: { raw: string | null; tokens: Array<TokenDescriptor> } | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Array<TokenDescriptor> {
  if (!raw) return [];
  try {
    const stored = JSON.parse(raw) as Array<StoredToken>;
    if (!Array.isArray(stored)) return [];
    return stored.flatMap((entry) => {
      try {
        return [
          {
            canisterId: Principal.fromText(entry.canisterId),
            name: String(entry.name),
            symbol: String(entry.symbol),
            decimals: Number(entry.decimals),
            fee: BigInt(entry.fee),
          },
        ];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

/** Added swap tokens; the same array is returned until storage changes. */
export function addedSwapTokensSnapshot(): Array<TokenDescriptor> {
  const raw = readRaw();
  if (!cache || cache.raw !== raw) cache = { raw, tokens: parse(raw) };
  return cache.tokens;
}

export function subscribeAddedSwapTokens(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function save(tokens: Array<TokenDescriptor>) {
  const stored: Array<StoredToken> = tokens.map((tk) => ({
    canisterId: tk.canisterId.toText(),
    name: tk.name,
    symbol: tk.symbol,
    decimals: tk.decimals,
    fee: tk.fee.toString(),
  }));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable: the change lasts for this visit only.
    cache = { raw: readRaw(), tokens };
  }
  for (const listener of listeners) listener();
}

export function addSwapToken(token: TokenDescriptor) {
  const current = addedSwapTokensSnapshot();
  const id = token.canisterId.toText();
  if (current.some((tk) => tk.canisterId.toText() === id)) return;
  save([...current, token]);
}

export function removeSwapToken(canisterId: string) {
  save(
    addedSwapTokensSnapshot().filter(
      (tk) => tk.canisterId.toText() !== canisterId,
    ),
  );
}

/** Reason a ledger ID is refused. */
export class LedgerTokenError extends Error {
  constructor(readonly reason: "invalidId" | "notIcrc") {
    super(reason);
  }
}

/** Parse a pasted ledger ID, or throw LedgerTokenError("invalidId"). */
export function parseLedgerId(text: string): Principal {
  try {
    const principal = Principal.fromText(text.trim());
    if (principal.isAnonymous() || principal.toText() === "aaaaa-aa") {
      throw new Error("reserved");
    }
    return principal;
  } catch {
    throw new LedgerTokenError("invalidId");
  }
}

function metaValue(
  entries: Array<[string, RawMetadataValue]>,
  key: string,
): RawMetadataValue | undefined {
  return entries.find(([name]) => name === key)?.[1];
}

/** Name, symbol, decimals and fee read from the ledger (icrc1_metadata). */
export async function readLedgerToken(
  canisterId: Principal,
): Promise<TokenDescriptor> {
  let entries: Array<[string, RawMetadataValue]>;
  try {
    const ledger = await createLedgerActor(canisterId.toText());
    entries = await ledger.icrc1_metadata();
  } catch {
    throw new LedgerTokenError("notIcrc");
  }
  const symbol = metaValue(entries, "icrc1:symbol");
  const decimals = metaValue(entries, "icrc1:decimals");
  const name = metaValue(entries, "icrc1:name");
  const fee = metaValue(entries, "icrc1:fee");
  if (!symbol || !("Text" in symbol) || !decimals || !("Nat" in decimals)) {
    throw new LedgerTokenError("notIcrc");
  }
  let feeValue = fee && "Nat" in fee ? fee.Nat : undefined;
  if (feeValue === undefined) {
    try {
      feeValue = await readLiveFee(canisterId);
    } catch {
      throw new LedgerTokenError("notIcrc");
    }
  }
  return {
    canisterId,
    symbol: symbol.Text,
    name: name && "Text" in name ? name.Text : symbol.Text,
    decimals: Number(decimals.Nat),
    fee: feeValue,
  };
}

/** Current transfer fee of a ledger (icrc1_fee). */
export async function readLiveFee(canisterId: Principal): Promise<bigint> {
  const ledger = await createLedgerActor(canisterId.toText());
  return ledger.icrc1_fee();
}

/** One entry of the ICPSwap token list. */
export interface ListedToken {
  canisterId: string;
  name: string;
  symbol: string;
}

interface TokenListActor {
  getList: () => Promise<
    | {
        ok: Array<{
          canisterId: string;
          name: string;
          symbol: string;
          decimals: bigint;
          fee: bigint;
          standard: string;
        }>;
      }
    | { err: string }
  >;
}

// Only the fields used are declared; extra record fields are skipped on decode.
const tokenListIdlFactory: IDL.InterfaceFactory = ({ IDL: I }) =>
  I.Service({
    getList: I.Func(
      [],
      [
        I.Variant({
          ok: I.Vec(
            I.Record({
              canisterId: I.Text,
              name: I.Text,
              symbol: I.Text,
              decimals: I.Nat,
              fee: I.Nat,
              standard: I.Text,
            }),
          ),
          err: I.Text,
        }),
      ],
      ["query"],
    ),
  });

/** Tokens listed by ICPSwap (TokenList.getList), read on-chain. */
export async function readIcpSwapTokenList(): Promise<Array<ListedToken>> {
  const agent = await createLedgerAgent();
  const actor = Actor.createActor<TokenListActor>(tokenListIdlFactory, {
    agent,
    canisterId: ICPSWAP_TOKEN_LIST_ID,
  });
  const result = await actor.getList();
  if ("err" in result) throw new Error(result.err);
  return result.ok.map(({ canisterId, name, symbol }) => ({
    canisterId,
    name,
    symbol,
  }));
}

/** Listed tokens whose symbol (or name) matches `query`, symbol prefix first. */
export function searchListedTokens(
  list: Array<ListedToken>,
  query: string,
  limit = 6,
): Array<ListedToken> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const score = (tk: ListedToken) => {
    const symbol = tk.symbol.toLowerCase();
    if (symbol === q) return 0;
    if (symbol.startsWith(q)) return 1;
    if (symbol.includes(q)) return 2;
    if (tk.name.toLowerCase().includes(q)) return 3;
    return 4;
  };
  return list
    .map((tk) => ({ tk, s: score(tk) }))
    .filter((e) => e.s < 4)
    .sort((a, b) => a.s - b.s || a.tk.symbol.localeCompare(b.tk.symbol))
    .slice(0, limit)
    .map((e) => e.tk);
}
