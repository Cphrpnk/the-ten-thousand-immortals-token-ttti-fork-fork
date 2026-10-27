import { Actor } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";
import type { Account, Backend, IndexTransaction } from "../backend";
import { createLedgerAgent } from "./icpLedger";
import { ICP_LEDGER_ID } from "./token";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDT_LEDGER_CANISTER_ID,
} from "./tokenRegistry";

/** Official index canister of each wallet ledger (TTTI-T: the backend). */
export const ICP_INDEX_CANISTER_ID = "qhbym-qaaaa-aaaaa-aaafq-cai";
export const INDEX_BY_LEDGER: Readonly<Record<string, string>> = {
  [ICP_LEDGER_ID]: ICP_INDEX_CANISTER_ID,
  [CKBTC_LEDGER_CANISTER_ID]: "n5wcd-faaaa-aaaar-qaaea-cai",
  [CKUSDC_LEDGER_CANISTER_ID]: "xrs4b-hiaaa-aaaar-qafoa-cai",
  [CKUSDT_LEDGER_CANISTER_ID]: "cefgz-dyaaa-aaaar-qag5a-cai",
};

/** Transactions read per index for suggestions. */
export const INDEX_MAX_RESULTS = 100n;

type Opt<T> = [] | [T];
interface RawAccount {
  owner: Principal;
  subaccount: Opt<Uint8Array>;
}

/** One counterparty seen on one ledger. */
export interface LedgerCounterparty {
  principal: Principal;
  /** Last interaction, nanoseconds since the epoch. */
  lastTimestamp: bigint;
  /** Ledger canister IDs (text) the counterparty appears on. */
  tokens: Array<string>;
}

// ---- ICRC index-ng (ckBTC, ckUSDC, ckUSDT) ---------------------------------

interface RawIcrcTransaction {
  kind: string;
  timestamp: bigint;
  transfer: Opt<{ from: RawAccount; to: RawAccount; spender: Opt<RawAccount> }>;
  approve: Opt<{ from: RawAccount; spender: RawAccount }>;
}
type RawIcrcResult =
  | {
      Ok: {
        transactions: Array<{ id: bigint; transaction: RawIcrcTransaction }>;
      };
    }
  | { Err: { message: string } };

interface IcrcIndexActor {
  get_account_transactions: (args: {
    account: RawAccount;
    start: Opt<bigint>;
    max_results: bigint;
  }) => Promise<RawIcrcResult>;
}

const icrcIndexIdl: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Acc = I.Record({
    owner: I.Principal,
    subaccount: I.Opt(I.Vec(I.Nat8)),
  });
  const Tx = I.Record({
    kind: I.Text,
    timestamp: I.Nat64,
    transfer: I.Opt(I.Record({ from: Acc, to: Acc, spender: I.Opt(Acc) })),
    approve: I.Opt(I.Record({ from: Acc, spender: Acc })),
  });
  return I.Service({
    get_account_transactions: I.Func(
      [I.Record({ account: Acc, start: I.Opt(I.Nat), max_results: I.Nat })],
      [
        I.Variant({
          Ok: I.Record({
            transactions: I.Vec(I.Record({ id: I.Nat, transaction: Tx })),
          }),
          Err: I.Record({ message: I.Text }),
        }),
      ],
      ["query"],
    ),
  });
};

interface MintingLedgerActor {
  icrc1_minting_account: () => Promise<Opt<RawAccount>>;
}
const mintingIdl: IDL.InterfaceFactory = ({ IDL: I }) =>
  I.Service({
    icrc1_minting_account: I.Func(
      [],
      [
        I.Opt(
          I.Record({ owner: I.Principal, subaccount: I.Opt(I.Vec(I.Nat8)) }),
        ),
      ],
      ["query"],
    ),
  });

// ---- ICP index (account identifiers) ---------------------------------------

type IcpOperation =
  | { Approve: { from: string; spender: string } }
  | { Burn: { from: string } }
  | { Mint: { to: string } }
  | { Transfer: { from: string; to: string; spender: Opt<string> } };
type RawIcpResult =
  | {
      Ok: {
        transactions: Array<{
          id: bigint;
          transaction: {
            operation: IcpOperation;
            timestamp: Opt<{ timestamp_nanos: bigint }>;
          };
        }>;
      };
    }
  | { Err: { message: string } };

interface IcpIndexActor {
  get_account_transactions: (args: {
    account: RawAccount;
    start: Opt<bigint>;
    max_results: bigint;
  }) => Promise<RawIcpResult>;
}

const icpIndexIdl: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Ts = I.Record({ timestamp_nanos: I.Nat64 });
  const Op = I.Variant({
    Approve: I.Record({ from: I.Text, spender: I.Text }),
    Burn: I.Record({ from: I.Text }),
    Mint: I.Record({ to: I.Text }),
    Transfer: I.Record({ from: I.Text, to: I.Text, spender: I.Opt(I.Text) }),
  });
  return I.Service({
    get_account_transactions: I.Func(
      [
        I.Record({
          account: I.Record({
            owner: I.Principal,
            subaccount: I.Opt(I.Vec(I.Nat8)),
          }),
          start: I.Opt(I.Nat),
          max_results: I.Nat,
        }),
      ],
      [
        I.Variant({
          Ok: I.Record({
            transactions: I.Vec(
              I.Record({
                id: I.Nat64,
                transaction: I.Record({ operation: Op, timestamp: I.Opt(Ts) }),
              }),
            ),
          }),
          Err: I.Record({ message: I.Text }),
        }),
      ],
      ["query"],
    ),
  });
};

// ---- ICP account identifier (SHA-224 + CRC32) -------------------------------

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha224(data: Uint8Array): Uint8Array {
  const h = new Uint32Array([
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939, 0xffc00b31, 0x68581511,
    0x64f98fa7, 0xbefa4fa4,
  ]);
  const length = Math.ceil((data.length + 9) / 64) * 64;
  const msg = new Uint8Array(length);
  msg.set(data);
  msg[data.length] = 0x80;
  const view = new DataView(msg.buffer);
  view.setUint32(length - 4, data.length * 8);
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = w[i - 16] + s0 + w[i - 7] + s1;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 =
        (hh +
          (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) +
          ((e & f) ^ (~e & g)) +
          K[i] +
          w[i]) >>>
        0;
      const t2 =
        ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) +
          ((a & b) ^ (a & c) ^ (b & c))) >>>
        0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
    h[5] += f;
    h[6] += g;
    h[7] += hh;
  }
  const out = new Uint8Array(28);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 7; i++) outView.setUint32(i * 4, h[i]);
  return out;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** ICP account identifier (hex) of a principal's default subaccount. */
export function icpAccountIdentifier(principal: Principal): string {
  const domain = new TextEncoder().encode("\x0Aaccount-id");
  const raw = principal.toUint8Array();
  const input = new Uint8Array(domain.length + raw.length + 32);
  input.set(domain);
  input.set(raw, domain.length);
  const hash = sha224(input);
  const out = new Uint8Array(32);
  new DataView(out.buffer).setUint32(0, crc32(hash));
  out.set(hash, 4);
  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- Readers ---------------------------------------------------------------

function toRaw(account: Account): RawAccount {
  return {
    owner: account.owner,
    subaccount: account.subaccount ? [account.subaccount] : [],
  };
}

function collect(
  out: Map<string, LedgerCounterparty>,
  principal: Principal,
  timestamp: bigint,
  ledgerId: string,
) {
  const key = principal.toText();
  const existing = out.get(key);
  if (!existing) {
    out.set(key, { principal, lastTimestamp: timestamp, tokens: [ledgerId] });
    return;
  }
  if (timestamp > existing.lastTimestamp) existing.lastTimestamp = timestamp;
  if (!existing.tokens.includes(ledgerId)) existing.tokens.push(ledgerId);
}

/**
 * Counterparties from ICRC transfers where `owner` (any subaccount) is the
 * from or to side: only the opposite side is kept. Spenders, approvals,
 * mints and burns never produce a counterparty.
 */
function fromIcrcTransactions(
  ledgerId: string,
  owner: Principal,
  minting: string | undefined,
  transactions: Array<{
    timestamp: bigint;
    transfer?: { from: Account; to: Account; spender?: Account };
    approve?: { from: Account; spender: Account };
  }>,
): Array<LedgerCounterparty> {
  const out = new Map<string, LedgerCounterparty>();
  const self = owner.toText();
  const add = (account: Account | undefined, ts: bigint) => {
    if (!account) return;
    const text = account.owner.toText();
    if (text === self || text === minting || account.owner.isAnonymous()) {
      return;
    }
    collect(out, account.owner, ts, ledgerId);
  };
  for (const tx of transactions) {
    const transfer = tx.transfer;
    if (!transfer) continue;
    const fromSelf = transfer.from.owner.toText() === self;
    const toSelf = transfer.to.owner.toText() === self;
    if (fromSelf && !toSelf) add(transfer.to, tx.timestamp);
    else if (toSelf && !fromSelf) add(transfer.from, tx.timestamp);
  }
  return [...out.values()];
}

const fromOpt = <T>(value: Opt<T>): T | undefined => value[0];
const fromRawAccount = (raw: RawAccount): Account => ({
  owner: raw.owner,
  subaccount: fromOpt(raw.subaccount),
});

async function mintingOwner(
  agentLedgerId: string,
  agent: Awaited<ReturnType<typeof createLedgerAgent>>,
): Promise<string | undefined> {
  try {
    const ledger = Actor.createActor<MintingLedgerActor>(mintingIdl, {
      agent,
      canisterId: agentLedgerId,
    });
    return fromOpt(await ledger.icrc1_minting_account())?.owner.toText();
  } catch {
    return undefined;
  }
}

/** Counterparties of `owner` on a ck ledger, read from its index-ng. */
export async function readIcrcIndexCounterparties(
  ledgerId: string,
  owner: Principal,
): Promise<Array<LedgerCounterparty>> {
  const indexId = INDEX_BY_LEDGER[ledgerId];
  if (!indexId) throw new Error(`No index for ${ledgerId}`);
  const agent = await createLedgerAgent();
  const index = Actor.createActor<IcrcIndexActor>(icrcIndexIdl, {
    agent,
    canisterId: indexId,
  });
  const [result, minting] = await Promise.all([
    index.get_account_transactions({
      account: { owner, subaccount: [] },
      start: [],
      max_results: INDEX_MAX_RESULTS,
    }),
    mintingOwner(ledgerId, agent),
  ]);
  if ("Err" in result) throw new Error(result.Err.message);
  return fromIcrcTransactions(
    ledgerId,
    owner,
    minting,
    result.Ok.transactions.map(({ transaction: tx }) => {
      const transfer = fromOpt(tx.transfer);
      const approve = fromOpt(tx.approve);
      const spender = transfer ? fromOpt(transfer.spender) : undefined;
      return {
        timestamp: tx.timestamp,
        transfer: transfer && {
          from: fromRawAccount(transfer.from),
          to: fromRawAccount(transfer.to),
          spender: spender && fromRawAccount(spender),
        },
        approve: approve && {
          from: fromRawAccount(approve.from),
          spender: fromRawAccount(approve.spender),
        },
      };
    }),
  );
}

/** Counterparties of `owner` on the TTTI-T ledger (backend index-ng). */
export async function readTttiCounterparties(
  backend: Backend,
  ledgerId: string,
  owner: Principal,
): Promise<Array<LedgerCounterparty>> {
  const [result, minting] = await Promise.all([
    backend.get_account_transactions({
      account: { owner },
      max_results: INDEX_MAX_RESULTS,
    }),
    backend.icrc1_minting_account().catch(() => null),
  ]);
  if (result.__kind__ === "Err") throw new Error(result.Err.message);
  return fromIcrcTransactions(
    ledgerId,
    owner,
    minting?.owner.toText(),
    result.Ok.transactions.map(
      ({ transaction }: { transaction: IndexTransaction }) => ({
        timestamp: transaction.timestamp,
        transfer: transaction.transfer,
        approve: transaction.approve,
      }),
    ),
  );
}

/**
 * Counterparties of `owner` on ICP. The ICP index reports account
 * identifiers only, so a counterparty is kept when its identifier matches
 * one of `known` principals (default subaccount).
 */
export async function readIcpCounterparties(
  owner: Principal,
  known: Array<Principal>,
): Promise<Array<LedgerCounterparty>> {
  const agent = await createLedgerAgent();
  const index = Actor.createActor<IcpIndexActor>(icpIndexIdl, {
    agent,
    canisterId: ICP_INDEX_CANISTER_ID,
  });
  const result = await index.get_account_transactions({
    account: toRaw({ owner }),
    start: [],
    max_results: INDEX_MAX_RESULTS,
  });
  if ("Err" in result) throw new Error(result.Err.message);
  const self = owner.toText();
  const byAccountId = new Map<string, Principal>();
  for (const principal of known) {
    if (principal.toText() !== self && !principal.isAnonymous()) {
      byAccountId.set(icpAccountIdentifier(principal), principal);
    }
  }
  const selfId = icpAccountIdentifier(owner);
  const out = new Map<string, LedgerCounterparty>();
  for (const { transaction } of result.Ok.transactions) {
    const op = transaction.operation;
    // Only the user's own transfers; approvals, mints and burns are skipped.
    if (!("Transfer" in op)) continue;
    const from = op.Transfer.from.toLowerCase();
    const to = op.Transfer.to.toLowerCase();
    const fromSelf = from === selfId;
    const toSelf = to === selfId;
    const otherId =
      fromSelf && !toSelf ? to : toSelf && !fromSelf ? from : undefined;
    const principal = otherId ? byAccountId.get(otherId) : undefined;
    if (!principal) continue;
    const ts = fromOpt(transaction.timestamp)?.timestamp_nanos ?? 0n;
    collect(out, principal, ts, ICP_LEDGER_ID);
  }
  return [...out.values()];
}

/** Merge per-ledger lists into one, newest interaction first. */
export function mergeCounterparties(
  lists: Array<Array<LedgerCounterparty>>,
): Array<LedgerCounterparty> {
  const out = new Map<string, LedgerCounterparty>();
  for (const list of lists) {
    for (const item of list) {
      for (const token of item.tokens) {
        collect(out, item.principal, item.lastTimestamp, token);
      }
    }
  }
  return [...out.values()].sort((a, b) =>
    a.lastTimestamp === b.lastTimestamp
      ? 0
      : a.lastTimestamp > b.lastTimestamp
        ? -1
        : 1,
  );
}

/** Parse principal text; undefined when invalid. */
export function parsePrincipal(text: string): Principal | undefined {
  try {
    return Principal.fromText(text.trim());
  } catch {
    return undefined;
  }
}
