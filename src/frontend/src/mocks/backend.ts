import { Principal } from "@icp-sdk/core/principal";
import type {
  Account,
  Block,
  Conversion,
  GetBlocksArgs,
  OriginalDocument,
  PurchaseAcknowledgement,
  PurchaseResult,
  SetupStatusView,
  TreasuryConfig,
  Value__1,
  backendInterface,
} from "../backend";
import {
  ConversionStatus,
  HolderKind,
  OracleStatus,
  PriceSource,
  SetupOutcome,
  SetupStatus,
  UserRole,
} from "../backend";
import {
  BUYER_PRICE_USD,
  CYCLES_FEE_BPS,
  ICP_DIVISOR,
  LEGACY_TTTI_DECIMALS,
  MIN_PURCHASE,
  TOKEN_NAME,
  TOKEN_PRICE_USD,
  TTTI_DECIMALS,
  TTTI_DIVISOR,
  TTTI_SYMBOL,
  icpForTtti,
  tttiFromIcp,
  validateDeliveryAddress,
} from "../lib/token";

const FEE = 100n;
const FEE_BOUNDS = { min: 0n, max: 10_000n };
const MAX_SUPPLY = 10_000n * TTTI_DIVISOR;
const ICP_LEDGER_FEE = 10_000n;

// Mock oracle price: ICP = $12.50 (usdE8 = USD * 10^8).
const MOCK_USD_E8 = 1_250_000_000n;
const MOCK_USD_MICRO = MOCK_USD_E8 / 100n;
/** TTTI-T base units per whole ICP at the mock price, fee included. */
const MOCK_LIVE_RATE = tttiFromIcp(ICP_DIVISOR, MOCK_USD_E8);
const MAX_PRICE_AGE_SECONDS = 300n;

const nowNs = () => BigInt(Date.now()) * 1_000_000n;
const principalFrom = (seed: number) =>
  Principal.fromUint8Array(
    new Uint8Array(Array.from({ length: 29 }, (_, i) => (seed * 31 + i) & 0xff)),
  );

const ICP_CANISTER = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
const CKBTC_CANISTER = Principal.fromText("mxzaz-hqaaa-aaaar-qaada-cai");
const CKUSDC_CANISTER = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
const TTTI_CANISTER = Principal.fromUint8Array(
  new Uint8Array([0, 0, 0, 0, 0, 0x30, 0x00, 0x12, 0x01, 0x01]),
);

const CALLER = principalFrom(1);
const HOLDER_2 = principalFrom(2);
const HOLDER_3 = principalFrom(3);
const CALLER_ACCOUNT: Account = { owner: CALLER };
/** Canister principal + 'FEE-COLLECTOR-TTTI-T-00000000001' (32 bytes). */
const FEE_COLLECTOR: Account = {
  owner: TTTI_CANISTER,
  subaccount: new TextEncoder().encode("FEE-COLLECTOR-TTTI-T-00000000001"),
};
/** Burn / minting account: canister principal with a null subaccount. */
const BURN_ACCOUNT: Account = { owner: TTTI_CANISTER };
const TREASURY_ACCOUNT: Account = {
  owner: HOLDER_3,
  subaccount: new Uint8Array(Array.from({ length: 32 }, (_, i) => (i === 31 ? 7 : 0))),
};

const STANDARDS = [
  { name: "ICRC-1", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1" },
  { name: "ICRC-2", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2" },
  { name: "ICRC-3", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3" },
  { name: "ICRC-10", url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md" },
];

// Mutable mock state so switches, purchases and the delivery address persist.
const state = {
  originalWhitePaper: null as OriginalDocument | null,
  salesPaused: false,
  sold: 1_250_000n,
  fee: FEE,
  feeCollectorBalance: 300n,
  deliveryAddress: null as Account | null,
  conversions: [] as Array<Conversion>,
  setupStatus: { status: SetupStatus.notStarted } as SetupStatusView,
  acknowledgement: { accepted: false } as PurchaseAcknowledgement,
  treasuryConfig: {
    icpAccount: TREASURY_ACCOUNT,
  } as TreasuryConfig,
};

const tokens = () => [
  { canisterId: ICP_CANISTER, name: "Internet Computer", symbol: "ICP", decimals: 8, fee: ICP_LEDGER_FEE },
  { canisterId: TTTI_CANISTER, name: TOKEN_NAME, symbol: TTTI_SYMBOL, decimals: TTTI_DECIMALS, fee: state.fee },
  { canisterId: CKBTC_CANISTER, name: "ckBTC", symbol: "ckBTC", decimals: 8, fee: 10n },
  { canisterId: CKUSDC_CANISTER, name: "ckUSDC", symbol: "ckUSDC", decimals: 6, fee: 10_000n },
];

const SAMPLE_BALANCES: Record<string, bigint> = {
  [ICP_CANISTER.toText()]: 250_000_000n,
  [TTTI_CANISTER.toText()]: 250_000n,
  [CKBTC_CANISTER.toText()]: 1_500_000n,
  [CKUSDC_CANISTER.toText()]: 125_000_000n,
};

/** Live conversion at the buyer price (1% cycles fee included), floored. */
function liveTtti(icpAmount: bigint): bigint {
  return tttiFromIcp(icpAmount, MOCK_USD_E8);
}

/** Fresh minting plus the collected fee account, as in getSaleStatus. */
const mockTotalSupply = () => state.sold + state.feeCollectorBalance;

function saleAvailable(): bigint {
  const totalSupply = mockTotalSupply();
  const mintable = MAX_SUPPLY > totalSupply ? MAX_SUPPLY - totalSupply : 0n;
  return mintable + state.feeCollectorBalance;
}

function makeConversion(icpAmount: bigint, recipient: Account): Conversion {
  const tttiAmount = liveTtti(icpAmount);
  const fromCollector =
    state.feeCollectorBalance < tttiAmount ? state.feeCollectorBalance : tttiAmount;
  return {
    id: BigInt(state.conversions.length + 1),
    status: ConversionStatus.completed,
    depositor: CALLER,
    usedFallback: false,
    priceUsdE8: MOCK_USD_E8,
    minted: tttiAmount - fromCollector,
    fromCollector,
    recipient,
    timestamp: nowNs(),
    tttiAmount,
    icpAmount,
    forward: { __kind__: "forwarded", forwarded: icpAmount - ICP_LEDGER_FEE },
  };
}

state.conversions.push(makeConversion(ICP_DIVISOR, CALLER_ACCOUNT));
// One purchase whose ICP forward to the treasury failed (retryable by admins).
state.conversions.unshift({
  ...makeConversion(ICP_DIVISOR / 2n, { owner: HOLDER_2 }),
  depositor: HOLDER_2,
  forward: {
    __kind__: "failed",
    failed: "ICP ledger transfer failed: TemporarilyUnavailable",
  },
});

function purchaseError(
  code: Extract<PurchaseResult, { __kind__: "Err" }>["Err"]["code"],
  message: string,
): PurchaseResult {
  return { __kind__: "Err", Err: { code, message } };
}

function mockPurchase(recipient: Account | null, icpAmount: bigint): PurchaseResult {
  if (!state.acknowledgement.accepted) {
    return purchaseError(
      { __kind__: "acknowledgementRequired", acknowledgementRequired: null },
      "Accept the purchase acknowledgements before your first purchase.",
    );
  }
  if (icpAmount <= 0n) {
    return purchaseError({ __kind__: "invalidAmount", invalidAmount: null }, "Enter an amount greater than 0.");
  }
  if (state.salesPaused) {
    return purchaseError({ __kind__: "salesPaused", salesPaused: null }, "Sales are paused.");
  }
  const remaining = saleAvailable();
  if (remaining <= 0n) {
    return purchaseError({ __kind__: "saleComplete", saleComplete: null }, "Sale complete.");
  }
  const requested = liveTtti(icpAmount);
  if (requested < MIN_PURCHASE) {
    return purchaseError(
      { __kind__: "belowMinimum", belowMinimum: { minimumTtti: MIN_PURCHASE, requestedTtti: requested } },
      "The minimum purchase is 0.0001 TTTI-T (1.01 USD).",
    );
  }
  if (requested > remaining) {
    return purchaseError(
      {
        __kind__: "aboveRemaining",
        aboveRemaining: {
          maximumIcpE8s: icpForTtti(remaining, MOCK_USD_E8),
          maximumTtti: remaining,
          requestedTtti: requested,
        },
      },
      "Only the remaining TTTI-T can be purchased.",
    );
  }
  const conversion = makeConversion(icpAmount, recipient ?? state.deliveryAddress ?? CALLER_ACCOUNT);
  state.feeCollectorBalance -= conversion.fromCollector;
  state.sold += conversion.tttiAmount;
  state.conversions.unshift(conversion);
  return { __kind__: "Ok", Ok: conversion };
}

/** Seconds since the mock oracle rate was stored. */
const MOCK_PRICE_AGE_SECONDS = 42n;

const mockPrice = () => ({
  status: OracleStatus.ok,
  source: PriceSource.coinbase,
  usdMicro: MOCK_USD_MICRO,
  usdE8: MOCK_USD_E8,
  updatedAt: nowNs(),
  stale: false,
});

// ---------------------------------------------------------------------------
// ICRC-3 block log: legacy ':' Text blocks below the boundary (4 decimals),
// legacy ':' Text blocks at/above it (8 decimals), then standard Map blocks
// chained by phash (representation-independent SHA-256 hashes).
// ---------------------------------------------------------------------------

const LEGACY_BOUNDARY = 3n;
const MAX_BLOCKS_PER_CALL = 100n;

const vNat = (Nat: bigint): Value__1 => ({ __kind__: "Nat", Nat });
const vText = (Text: string): Value__1 => ({ __kind__: "Text", Text });
const vBlob = (Blob: Uint8Array): Value__1 => ({ __kind__: "Blob", Blob });
const vMap = (Map: Array<[string, Value__1]>): Value__1 => ({ __kind__: "Map", Map });
const vAccount = (account: Account): Value__1 => ({
  __kind__: "Array",
  Array: account.subaccount
    ? [vBlob(account.owner.toUint8Array()), vBlob(account.subaccount)]
    : [vBlob(account.owner.toUint8Array())],
});

function encodeLeb128(value: bigint): number[] {
  const out: number[] = [];
  let rest = value;
  do {
    const byte = Number(rest & 0x7fn);
    rest >>= 7n;
    out.push(rest > 0n ? byte | 0x80 : byte);
  } while (rest > 0n);
  return out;
}

function encodeSleb128(value: bigint): number[] {
  const out: number[] = [];
  let rest = value;
  for (;;) {
    const byte = Number(rest & 0x7fn);
    rest >>= 7n;
    const done = (rest === 0n && (byte & 0x40) === 0) || (rest === -1n && (byte & 0x40) !== 0);
    out.push(done ? byte : byte | 0x80);
    if (done) return out;
  }
}

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", copy));
}

function concat(parts: Array<Uint8Array>): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function compareBytes(a: Uint8Array, b: Uint8Array): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/** ICRC-3 representation-independent hash of a Value. */
async function hashValue(value: Value__1): Promise<Uint8Array> {
  switch (value.__kind__) {
    case "Nat":
      return sha256(new Uint8Array(encodeLeb128(value.Nat)));
    case "Int":
      return sha256(new Uint8Array(encodeSleb128(value.Int)));
    case "Text":
      return sha256(new TextEncoder().encode(value.Text));
    case "Blob":
      return sha256(value.Blob);
    case "Array":
      return sha256(concat(await Promise.all(value.Array.map(hashValue))));
    case "Map": {
      const pairs = await Promise.all(
        value.Map.map(async ([key, inner]) =>
          concat([await sha256(new TextEncoder().encode(key)), await hashValue(inner)]),
        ),
      );
      pairs.sort(compareBytes);
      return sha256(concat(pairs));
    }
  }
}

/** Builds each block value given the parent hash (legacy Text builders ignore it). */
const BLOCK_BUILDERS: Array<(ts: bigint, phash: Uint8Array | null) => Value__1> = [
  // Legacy Text blocks (4-decimal amounts, below the legacy boundary).
  (ts) => vText(`3:${CALLER.toText()}:2500:${ts}`),
  (ts) => vText(`1:${CALLER.toText()}:${HOLDER_2.toText()}:1000:1:${ts}`),
  (ts) => vText(`4:${HOLDER_2.toText()}:50:${ts}`),
  // Legacy Text blocks written after the 8-decimal rescale (at/above the
  // boundary), still in ':' form before the first standard Map block.
  (ts) => vText(`3:${CALLER.toText()}:500000:${ts}`),
  (ts) => vText(`1:${CALLER.toText()}:${HOLDER_2.toText()}:150000:${FEE}:${ts}`),
  // 1mint (first Map block; phash = hash of the last legacy Text block)
  (ts, phash) =>
    vMap([
      ["btype", vText("1mint")],
      ["ts", vNat(ts)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      ["tx", vMap([["to", vAccount(CALLER_ACCOUNT)], ["amt", vNat(250_000n)]])],
    ]),
  // 1xfer with block-level fee and fee collector
  (ts, phash) =>
    vMap([
      ["btype", vText("1xfer")],
      ["ts", vNat(ts)],
      ["fee", vNat(FEE)],
      ["fee_col", vAccount(FEE_COLLECTOR)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      [
        "tx",
        vMap([
          ["from", vAccount(CALLER_ACCOUNT)],
          ["to", vAccount({ owner: HOLDER_2 })],
          ["amt", vNat(100_000n)],
        ]),
      ],
    ]),
  // 2approve with expires_at and expected_allowance
  (ts, phash) =>
    vMap([
      ["btype", vText("2approve")],
      ["ts", vNat(ts)],
      ["fee", vNat(FEE)],
      ["fee_col", vAccount(FEE_COLLECTOR)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      [
        "tx",
        vMap([
          ["from", vAccount(CALLER_ACCOUNT)],
          ["spender", vAccount({ owner: HOLDER_3 })],
          ["amt", vNat(50_000n)],
          ["expected_allowance", vNat(0n)],
          ["expires_at", vNat(ts + 7n * 24n * 3_600n * 1_000_000_000n)],
        ]),
      ],
    ]),
  // 1burn to the minting account (fee-less)
  (ts, phash) =>
    vMap([
      ["btype", vText("1burn")],
      ["ts", vNat(ts)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      ["tx", vMap([["from", vAccount({ owner: HOLDER_2 })], ["amt", vNat(20_000n)]])],
    ]),
  // Fee-0 sale delivery from the fee collector
  (ts, phash) =>
    vMap([
      ["btype", vText("1xfer")],
      ["ts", vNat(ts)],
      ["fee", vNat(0n)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      [
        "tx",
        vMap([
          ["from", vAccount(FEE_COLLECTOR)],
          ["to", vAccount(CALLER_ACCOUNT)],
          ["amt", vNat(300n)],
        ]),
      ],
    ]),
  // 1xfer with memo, created_at_time and a caller-specified fee
  (ts, phash) =>
    vMap([
      ["btype", vText("1xfer")],
      ["ts", vNat(ts)],
      ["fee_col", vAccount(FEE_COLLECTOR)],
      ["phash", vBlob(phash ?? new Uint8Array(32))],
      [
        "tx",
        vMap([
          ["from", vAccount({ owner: HOLDER_2 })],
          ["to", vAccount({ owner: HOLDER_3 })],
          ["amt", vNat(12_345n)],
          ["fee", vNat(FEE)],
          ["memo", vBlob(new TextEncoder().encode("Immortal #42"))],
          ["created_at_time", vNat(ts - 1_000_000_000n)],
        ]),
      ],
    ]),
];

let blockLogPromise: Promise<{ blocks: Array<Block>; tipHash: Uint8Array }> | null = null;

/** Lazily builds the sample log so phash values are real SHA-256 hashes. */
function sampleBlockLog() {
  blockLogPromise ??= (async () => {
    const base = nowNs() - 3n * 24n * 3_600n * 1_000_000_000n;
    const blocks: Array<Block> = [];
    let previous: Uint8Array | null = null;
    for (const [index, build] of BLOCK_BUILDERS.entries()) {
      const id = BigInt(index);
      const ts = base + id * 3_600n * 1_000_000_000n;
      const block = build(ts, id >= LEGACY_BOUNDARY ? previous : null);
      blocks.push({ id, block });
      previous = await hashValue(block);
    }
    return { blocks, tipHash: previous ?? new Uint8Array(32) };
  })();
  return blockLogPromise;
}

/** Serves every requested range in order, capped at 100 blocks per call. */
async function mockGetBlocks(ranges: Array<GetBlocksArgs>) {
  const { blocks } = await sampleBlockLog();
  const logLength = BigInt(blocks.length);
  const out: Array<Block> = [];
  for (const { start, length } of ranges) {
    const end = start + length < logLength ? start + length : logLength;
    for (let i = start; i < end && BigInt(out.length) < MAX_BLOCKS_PER_CALL; i++) {
      out.push(blocks[Number(i)]);
    }
  }
  return { log_length: logLength, blocks: out, archived_blocks: [] };
}

// Mock shape only, not a real proof: ICRC-3 tip hash-tree layout with the
// real tip block hash and an opaque certificate blob.
const MOCK_CERTIFICATE = new Uint8Array(Array.from({ length: 64 }, (_, i) => (i * 7 + 3) & 0xff));

function cborBytes(data: ArrayLike<number>): number[] {
  const body = Array.from(data);
  return body.length < 24 ? [0x40 + body.length, ...body] : [0x58, body.length, ...body];
}

function labeledLeaf(label: string, value: ArrayLike<number>): number[] {
  return [0x83, 0x02, ...cborBytes(new TextEncoder().encode(label)), 0x82, 0x03, ...cborBytes(value)];
}

function buildMockHashTree(tipIndex: bigint, tipHash: Uint8Array): Uint8Array {
  return new Uint8Array([
    0xd9, 0xd9, 0xf7, 0x83, 0x01,
    ...labeledLeaf("last_block_hash", tipHash),
    ...labeledLeaf("last_block_index", encodeLeb128(tipIndex)),
  ]);
}

const findToken = (canisterId: Principal) => {
  const list = tokens();
  return list.find((t) => t.canisterId.toText() === canisterId.toText()) ?? list[0];
};

export const mockBackend: backendInterface = {
  _immutableObjectStorageBlobsAreLive: async (hashes) => hashes.map(() => false),
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async (blobHash) => ({ method: "GET", blob_hash: blobHash }),
  _immutableObjectStorageRefillCashier: async () => ({ success: true, topped_up_amount: 0n }),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initialize_access_control: async () => undefined,
  _internet_identity_sign_in_finish: async () => ({ __kind__: "ok", ok: null }),
  _internet_identity_sign_in_start: async () => new Uint8Array(),
  acceptPurchaseAcknowledgements: async () => {
    if (!state.acknowledgement.accepted) {
      state.acknowledgement = { accepted: true, acceptedAt: nowNs() };
    }
    return { __kind__: "ok", ok: state.acknowledgement };
  },
  assignCallerUserRole: async () => undefined,
  burn: async (from) =>
    from.owner.toText() === CALLER.toText()
      ? { __kind__: "Ok", Ok: 9n }
      : { __kind__: "Err", Err: { __kind__: "GenericError", GenericError: { message: "Only your own account can be burned from", error_code: 1n } } },
  clearDeliveryAddress: async () => {
    const had = state.deliveryAddress !== null;
    state.deliveryAddress = null;
    return had;
  },
  convertDeposit: async (recipient, icpAmount) => mockPurchase(recipient, icpAmount),
  execute: async () => ({ hasMore: false, rows: [] }),
  exportBalanceSnapshot: async () => ({
    exportedAt: nowNs(),
    totalSupply: state.sold + state.feeCollectorBalance,
    decimals: TTTI_DECIMALS,
    holders: [
      { account: CALLER_ACCOUNT, balance: 250_000n, deliveryAddress: state.deliveryAddress ?? undefined, needsMigration: state.deliveryAddress === null, kind: HolderKind.holder },
      { account: { owner: HOLDER_2 }, balance: 900_000n, deliveryAddress: { owner: HOLDER_3 }, needsMigration: false, kind: HolderKind.holder },
      { account: { owner: HOLDER_3 }, balance: state.sold - 1_150_000n, needsMigration: true, kind: HolderKind.holder },
      { account: FEE_COLLECTOR, balance: state.feeCollectorBalance, needsMigration: false, kind: HolderKind.feeCollector },
    ],
  }),
  getApiDoc: async () => JSON.stringify({ methods: [] }),
  getBalance: async (canisterId) => ({
    __kind__: "Ok",
    Ok: { token: findToken(canisterId), balance: SAMPLE_BALANCES[canisterId.toText()] ?? 0n },
  }),
  getBurnAccount: async () => BURN_ACCOUNT,
  getCallerIcpBalance: async () => 250_000_000n,
  getCallerUserProfile: async () => ({ name: "Aiko Tanaka" }),
  getCallerUserRole: async () => UserRole.admin,
  getCanisterPrincipal: async () => TTTI_CANISTER,
  getConversions: async () => state.conversions,
  getDeliveryAddress: async () => state.deliveryAddress,
  getFeeCollector: async () => ({ account: FEE_COLLECTOR, balance: state.feeCollectorBalance }),
  getIcpPrice: async () => mockPrice(),
  getLegacyBlockInfo: async () => ({
    boundaryIndex: LEGACY_BOUNDARY,
    legacyDecimals: LEGACY_TTTI_DECIMALS,
    currentDecimals: TTTI_DECIMALS,
  }),
  getMyPurchaseAcknowledgement: async () => state.acknowledgement,
  getMySetupStatus: async () => state.setupStatus,
  setMySetupStatus: async (outcome) => {
    state.setupStatus = {
      status: outcome === SetupOutcome.completed ? SetupStatus.completed : SetupStatus.skipped,
      updatedAt: nowNs(),
    };
    return { __kind__: "ok", ok: state.setupStatus };
  },
  getOriginalWhitePaper: async () => state.originalWhitePaper,
  getSaleStatus: async () => {
    const totalSupply = mockTotalSupply();
    const mintableRemaining = MAX_SUPPLY > totalSupply ? MAX_SUPPLY - totalSupply : 0n;
    const available = saleAvailable();
    return {
      maxSupply: MAX_SUPPLY,
      totalSupply,
      mintableRemaining,
      feeAccountBalance: state.feeCollectorBalance,
      sold: state.sold,
      reserved: 0n,
      available,
      complete: available === 0n,
      minPurchase: MIN_PURCHASE,
      tokenPriceUsd: BigInt(TOKEN_PRICE_USD),
      cyclesFeeBps: CYCLES_FEE_BPS,
      buyerPriceUsd: BigInt(BUYER_PRICE_USD),
      salesPaused: state.salesPaused,
      priceUsdE8: MOCK_USD_E8,
      priceUpdatedAt: nowNs(),
      priceSource: PriceSource.coinbase,
      priceAgeSeconds: MOCK_PRICE_AGE_SECONDS,
      maxPriceAgeSeconds: MAX_PRICE_AGE_SECONDS,
      liveRate: MOCK_LIVE_RATE,
    };
  },
  getTechnicalDetails: async () => ({
    ledgerCanisterId: TTTI_CANISTER,
    tokenName: TOKEN_NAME,
    tokenSymbol: TTTI_SYMBOL,
    decimals: TTTI_DECIMALS,
    standards: STANDARDS.map((standard) => standard.name),
    icpLedgerCanisterId: ICP_CANISTER,
    oracleSources: ["Coinbase ICP-USD spot price", "CoinGecko ICP/USD (backup)"],
    refreshPolicy: "Refreshed on demand at purchase when older than 5 minutes",
    maxRateAgeSeconds: MAX_PRICE_AGE_SECONDS,
    tokenPriceUsd: BigInt(TOKEN_PRICE_USD),
    cyclesFeeBps: CYCLES_FEE_BPS,
    buyerPriceUsd: BigInt(BUYER_PRICE_USD),
    minPurchase: MIN_PURCHASE,
    smallestUnit: 1n,
    roundingRule: "TTTI-T amounts rounded down to 1 base unit; ICP costs rounded up to 1 e8s",
    excessPaymentHandling: "Only the ICP cost of the delivered TTTI-T is collected; any excess is never pulled",
    deliveryOrder: "Fresh minting first; collected transfer fees are delivered only after minting reaches the maximum supply",
    transferFee: state.fee,
    maxSupply: MAX_SUPPLY,
    totalSupply: mockTotalSupply(),
    feeAccount: FEE_COLLECTOR,
    feeAccountBalance: state.feeCollectorBalance,
  }),
  getPublicTreasuryInfo: async () => ({
    icpAccount: state.treasuryConfig.icpAccount,
  }),
  getTokenMetadata: async (canisterId) => ({ __kind__: "Ok", Ok: findToken(canisterId) }),
  getTreasuryConfig: async () => state.treasuryConfig,
  get_account_transactions: async () => ({
    __kind__: "Ok",
    Ok: { balance: 0n, transactions: [], oldest_tx_id: undefined },
  }),
  get_fee: async () => state.fee,
  get_fee_bounds: async () => FEE_BOUNDS,
  get_max_supply: async () => MAX_SUPPLY,
  icrc10_supported_standards: async () => STANDARDS,
  icrc1_balance_of: async () => 250_000n,
  icrc1_decimals: async () => TTTI_DECIMALS,
  icrc1_fee: async () => state.fee,
  icrc1_metadata: async () => [
    ["icrc1:name", { __kind__: "Text", Text: TOKEN_NAME }],
    ["icrc1:symbol", { __kind__: "Text", Text: TTTI_SYMBOL }],
    ["icrc1:decimals", { __kind__: "Nat", Nat: BigInt(TTTI_DECIMALS) }],
    ["icrc1:fee", { __kind__: "Nat", Nat: state.fee }],
    ["icrc1:max_memo_length", { __kind__: "Nat", Nat: 32n }],
  ],
  icrc1_minting_account: async () => BURN_ACCOUNT,
  icrc1_name: async () => TOKEN_NAME,
  icrc1_supported_standards: async () => STANDARDS,
  icrc1_symbol: async () => TTTI_SYMBOL,
  icrc1_total_supply: async () => mockTotalSupply(),
  icrc1_transfer: async () => ({ __kind__: "Ok", Ok: 9n }),
  icrc2_allowance: async () => ({ allowance: 0n }),
  icrc2_approve: async () => ({ __kind__: "Ok", Ok: 9n }),
  icrc2_transfer_from: async () => ({ __kind__: "Ok", Ok: 9n }),
  icrc3_get_archives: async () => [],
  icrc3_get_blocks: async (ranges) => mockGetBlocks(ranges),
  icrc3_get_tip_certificate: async () => {
    const { blocks, tipHash } = await sampleBlockLog();
    return {
      certificate: MOCK_CERTIFICATE,
      hash_tree: buildMockHashTree(BigInt(blocks.length - 1), tipHash),
    };
  },
  icrc3_supported_block_types: async () => [
    { block_type: "1xfer", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1" },
    { block_type: "1mint", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1" },
    { block_type: "1burn", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-1" },
    { block_type: "2approve", url: "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-2" },
  ],
  isCallerAdmin: async () => true,
  ledger_id: async () => TTTI_CANISTER,
  listTokens: async () => tokens(),
  list_subaccounts: async () => [],
  prepareTransfer: async (canisterId, from, to, amount, memo) => ({
    __kind__: "Ok",
    Ok: { ledger: canisterId, from, to, amount, fee: findToken(canisterId).fee, memo: memo ?? undefined, createdAt: nowNs() },
  }),
  publishOriginalWhitePaper: async (document) => {
    state.originalWhitePaper = document;
  },
  refreshIcpPrice: async () => ({ __kind__: "Ok", Ok: mockPrice() }),
  saveCallerUserProfile: async () => undefined,
  schema: async () => JSON.stringify({ tables: [] }),
  setDeliveryAddress: async (principalText) => {
    const result = validateDeliveryAddress(principalText);
    if (!result.ok) {
      return { __kind__: "Err", Err: { code: result.code, message: result.message } };
    }
    state.deliveryAddress = { owner: result.principal };
    return { __kind__: "Ok", Ok: state.deliveryAddress };
  },
  setSalesPaused: async (paused) => {
    state.salesPaused = paused;
  },
  setTreasuryConfig: async (config) => {
    state.treasuryConfig = { ...config };
    return { __kind__: "Ok", Ok: state.treasuryConfig };
  },
  set_fee: async (newFee) => {
    if (newFee < FEE_BOUNDS.min || newFee > FEE_BOUNDS.max) {
      return {
        __kind__: "err",
        err: `Fee must be between ${FEE_BOUNDS.min} and ${FEE_BOUNDS.max} base units`,
      };
    }
    state.fee = newFee;
    return { __kind__: "ok", ok: null };
  },
  status: async () => ({ num_blocks_synced: 0n }),
  transform: async () => ({ status: 200n, body: new Uint8Array(), headers: [] }),
};
