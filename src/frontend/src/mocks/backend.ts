import { Principal } from "@icp-sdk/core/principal";
import type {
  Account,
  Block,
  BtcDepositResult,
  Buyback,
  BuybackError,
  BuybackFunding,
  BuybackMass,
  BuybackPayoutAttempt,
  BuybackQuote,
  Contact,
  Conversion,
  DepositEntry,
  DepositTracking,
  GetBlocksArgs,
  IcpPrice,
  PayTokenStatus,
  PurchaseAcknowledgement,
  PurchaseResult,
  PurchaseTrace,
  ReserveWithdrawal,
  ReservedReconciliation,
  Result_2,
  ReviewResult,
  TokenPrice,
  TopUpAttempt,
  TopUpRecord,
  TransferReview,
  TreasuryConfig,
  UpgradeReadiness,
  Value__1,
  backendInterface,
} from "../backend";
import {
  BtcDepositErrorCode,
  BtcRefundPurpose,
  BuybackRule,
  BuybackStatus,
  CollectState,
  ConversionStatus,
  DepositErrorKind,
  DepositKind,
  HolderKind,
  PayToken,
  PriceSource,
  ReconcileError,
  ReviewError,
  TransferKind,
  UserRole,
} from "../backend";
import {
  BTC_DEFAULT_CHECK_FEE_SATS,
  BTC_DEFAULT_DEPOSIT_MIN_SATS,
  BTC_DEFAULT_MIN_CONFIRMATIONS,
  BUYER_PRICE_USD,
  CKBTC_MINTER_CANISTER_ID,
  CK_FEE_BPS,
  CYCLES_FEE_BPS,
  CYCLES_FEE_TEXT,
  ICP_DIVISOR,
  LEGACY_TTTI_DECIMALS,
  MIN_PURCHASE,
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  RESERVE_FLOOR_E8S,
  TOKEN_NAME,
  TOKEN_PRICE_USD,
  TTTI_DECIMALS,
  TTTI_DIVISOR,
  TTTI_SYMBOL,
  icpForTtti,
  tttiFromIcp,
  tttiFromToken,
  validateDeliveryAddress,
} from "../lib/token";

const FEE = 100n;
const FEE_BOUNDS = { min: 0n, max: 10_000n };
const MAX_SUPPLY = TTTI_DIVISOR;
const ICP_LEDGER_FEE = 10_000n;

// Mock oracle price: ICP = $12.50 (usdE8 = USD * 10^8).
const MOCK_USD_E8 = 1_250_000_000n;
/** TTTI-T base units per whole ICP at the mock price, fee included. */
const MOCK_LIVE_RATE = tttiFromIcp(ICP_DIVISOR, MOCK_USD_E8);
/** validUntil + 5-minute grace, as in the backend. */
const MAX_RATE_AGE_SECONDS = 3_900n;
const HOURLY_RATE_TEXT =
  "The ICP/USD rate is set once an hour from Coinbase, or from CoinGecko if Coinbase is unavailable, and applies to every purchase in that hour. If no valid rate exists, the purchase is refused and no ICP is taken.";

const nowNs = () => BigInt(Date.now()) * 1_000_000n;
const HOUR_NS = 3_600n * 1_000_000_000n;
/** Start of the current hour, in nanoseconds. */
const hourStartNs = () => (nowNs() / HOUR_NS) * HOUR_NS;
const principalFrom = (seed: number) =>
  Principal.fromUint8Array(
    new Uint8Array(Array.from({ length: 29 }, (_, i) => (seed * 31 + i) & 0xff)),
  );

const ICP_CANISTER = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
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
/** Minting account: canister principal with a null subaccount. */
const MINTING_ACCOUNT: Account = { owner: TTTI_CANISTER };
/** Transfers to the minting account are refused without any debit. */
const isMintingAccount = (account: Account) =>
  account.owner.toText() === TTTI_CANISTER.toText() &&
  (!account.subaccount || account.subaccount.every((byte) => byte === 0));
const MINTING_REFUSAL = {
  __kind__: "GenericError" as const,
  GenericError: {
    error_code: 8n,
    message: "Tokens cannot be burned; transfers to the contract address are refused.",
  },
};
const MOCK_CONTROLLERS = [principalFrom(9)];
const MOCK_MODULE_HASH =
  "3f1c9a7e52b04d8e6a1f0c2b7d9e4a5f8c3b1e0d6a2f9c7b4e8d1a0f5c3b2e9a";
/** Canister principal + 'CYCLES-RESERVE-TTTI-T-0000000001' (32 bytes), on the ICP ledger. */
const CYCLES_RESERVE_ACCOUNT: Account = {
  owner: TTTI_CANISTER,
  subaccount: new TextEncoder().encode("CYCLES-RESERVE-TTTI-T-0000000001"),
};
const TOP_UP_THRESHOLD = 3_000_000_000_000n;
/** The backend publishes the same rule text as CYCLES_FEE_TEXT. */
const RESERVE_RULE = CYCLES_FEE_TEXT;
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
  salesPaused: false,
  sold: 1_250_000n,
  fee: FEE,
  feeCollectorBalance: 300n,
  deliveryAddress: null as Account | null,
  conversions: [] as Array<Conversion>,
  /** Last mock ledger block index used by makeConversion. */
  nextBlock: 1_200n,
  /** Stored acceptance { acceptedAt; version }; a version-1 record no longer counts. */
  acknowledgement: { acceptedAt: nowNs() - 30n * 24n * HOUR_NS, version: 1n } as {
    acceptedAt: bigint;
    version: bigint;
  } | null,
  treasuryConfig: {
    icpAccount: TREASURY_ACCOUNT,
  } as TreasuryConfig,
  cyclesBalance: 4_820_000_000_000n,
  reserveBalanceE8s: 345_670_000n,
  lastTopUp: {
    timestamp: nowNs() - 3n * 24n * HOUR_NS,
    icpE8s: 50_000_000n,
    blockIndex: 18_204_311n,
    status: { __kind__: "notified", notified: { cycles: 1_910_000_000_000n } },
  } as TopUpRecord,
  withdrawals: [] as Array<ReserveWithdrawal>,
  btcPurchase: undefined as DepositTracking | undefined,
  btcWallet: undefined as DepositTracking | undefined,
  /** sale.reserved: a stale 0.00004 TTTI-T left by an interrupted purchase. */
  reserved: 4_000n,
  lastReconciliation: undefined as ReservedReconciliation | undefined,
};

// --- Upgrade readiness: while sales are open, one purchase is mid-collect. --

const MOCK_TRACE_MEMO = "TTTI-PC-14";
const MOCK_TOP_UP_MEMO = "TTTI-TPUP-6";

function mockOpenTraces(): Array<PurchaseTrace> {
  if (state.salesPaused) return [];
  return [
    {
      n: 14n,
      token: PayToken.icp,
      memo: new TextEncoder().encode(MOCK_TRACE_MEMO),
      reserved: 2_000n,
      buyer: HOLDER_2,
      created_at_time: nowNs() - 40n * 1_000_000_000n,
      amount: ICP_DIVISOR / 4n,
    },
  ];
}

function mockPendingTopUp(): TopUpAttempt {
  const createdAt = nowNs() - 2n * HOUR_NS;
  return {
    request: {
      to: { owner: Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai") },
      fee: ICP_LEDGER_FEE,
      from_subaccount: CYCLES_RESERVE_ACCOUNT.subaccount,
      amount: 50_000_000n,
    },
    memo: new TextEncoder().encode(MOCK_TOP_UP_MEMO),
    createdAt,
    created_at_time: createdAt,
    sends: 2n,
    blockIndex: undefined,
    needsReview: false,
    lastError: "The ICP ledger could not be reached (mock)",
    amount: 50_000_000n,
    outcome: { __kind__: "unknown", unknown: null },
  };
}

function mockUpgradeReadiness(): UpgradeReadiness {
  const traces = mockOpenTraces();
  const inFlight = state.salesPaused ? [] : [HOLDER_2];
  return {
    salesPaused: state.salesPaused,
    purchasesInFlightCount: BigInt(inFlight.length),
    purchasesInFlight: inFlight,
    btcLockHeld: false,
    buybacksInFlightCount: 0n,
    buybacksInFlight: [],
    reserveLockBusy: false,
    pendingTopUp: mockPendingTopUp(),
    openTraceCount: BigInt(traces.length),
    openTraces: traces,
    reserved: state.reserved,
    lastReconciliation: state.lastReconciliation,
  };
}

/** Same refusal order as the backend: paused, no purchase in flight, no open trace. */
function mockReconcileReserved(): Result_2 {
  const readiness = mockUpgradeReadiness();
  if (!readiness.salesPaused) return { __kind__: "err", err: ReconcileError.notPaused };
  if (readiness.purchasesInFlightCount > 0n) {
    return { __kind__: "err", err: ReconcileError.purchaseInFlight };
  }
  if (readiness.openTraceCount > 0n) return { __kind__: "err", err: ReconcileError.openTraces };
  const reconciliation: ReservedReconciliation = {
    previousReserved: state.reserved,
    reconciledAt: nowNs(),
    by: CALLER,
  };
  state.reserved = 0n;
  state.lastReconciliation = reconciliation;
  return { __kind__: "ok", ok: reconciliation };
}

// --- Bitcoin deposits: each check advances the tracking one stage. ---------

const CKBTC_MINTER = Principal.fromText(CKBTC_MINTER_CANISTER_ID);
const MOCK_BTC_DEPOSIT_SATS = 50_000n;
const MOCK_REFUND_HELD_SATS = 1_200n;
const MOCK_BTC_ADDRESSES: Record<DepositKind, string> = {
  [DepositKind.purchase]: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  [DepositKind.wallet]: "bc1q9h7garjz4l6dnf0kwz0rmd8gk2lwzkxv5f4u3e",
};

function newTracking(kind: DepositKind): DepositTracking {
  return {
    kind,
    btcAddress: MOCK_BTC_ADDRESSES[kind],
    stage: { __kind__: "addressShown", addressShown: null },
    deposits: [],
    createdAt: nowNs(),
    lastCheckedAt: undefined,
    errorKind: undefined,
    errorMessage: undefined,
  };
}

function newEntry(index: number): DepositEntry {
  return {
    index: BigInt(index),
    stage: { __kind__: "depositDetected", depositDetected: null },
    btcDetectedSats: MOCK_BTC_DEPOSIT_SATS,
    ckbtcMintedSats: 0n,
    ckbtcPendingSats: MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS,
    tttiDelivered: 0n,
    refundedSats: 0n,
    conversionId: undefined,
    btcTxids: [
      `${index.toString(16).padStart(2, "0")}c4f1a9e07b3d52c8e6f19a0b7d4c3e2f1a5b8c9d0e7f6a3b2c1d4e5f6a7b8c9d`,
    ],
    ckbtcMintBlockIndex: undefined,
    detectedAt: nowNs(),
    updatedAt: nowNs(),
    errorKind: undefined,
    errorMessage: undefined,
  };
}

/** A wallet entry fully minted earlier, for the two-deposit wallet mock. */
function mintedWalletEntry(index: number, ageNs: bigint): DepositEntry {
  const minted = MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS;
  return {
    ...newEntry(index),
    stage: { __kind__: "minted", minted: null },
    ckbtcMintedSats: minted,
    ckbtcPendingSats: 0n,
    ckbtcMintBlockIndex: 2_741_093n + BigInt(index),
    detectedAt: nowNs() - ageNs,
    updatedAt: nowNs() - ageNs,
  };
}

function closedEntry(kind: DepositKind, entry: DepositEntry): boolean {
  switch (entry.stage.__kind__) {
    case "delivered":
    case "refunded":
      return true;
    case "minted":
      return kind === DepositKind.wallet;
    case "error":
      return entry.errorKind === DepositErrorKind.unrecoverable;
    default:
      return false;
  }
}

function advanceEntry(kind: DepositKind, entry: DepositEntry): DepositEntry {
  const next = { ...entry, updatedAt: nowNs() };
  const required = BTC_DEFAULT_MIN_CONFIRMATIONS;
  const minted = MOCK_BTC_DEPOSIT_SATS - BTC_DEFAULT_CHECK_FEE_SATS;
  switch (entry.stage.__kind__) {
    case "depositDetected":
      return { ...next, stage: { __kind__: "confirming", confirming: { current: 2n, required } } };
    case "confirming": {
      const current = entry.stage.confirming.current + 2n;
      if (current < required) {
        return { ...next, stage: { __kind__: "confirming", confirming: { current, required } } };
      }
      state.nextBlock += 1n;
      return {
        ...next,
        stage: { __kind__: "minted", minted: null },
        ckbtcMintedSats: minted,
        ckbtcPendingSats: kind === DepositKind.purchase ? minted : 0n,
        ckbtcMintBlockIndex: 2_741_000n + state.nextBlock,
      };
    }
    case "minted":
    case "pendingRate":
      if (kind === DepositKind.wallet) return next;
      // Odd purchase deposits deliver but fail to refund a small excess.
      if (entry.index % 2n === 1n) {
        return {
          ...next,
          stage: { __kind__: "delivered", delivered: null },
          ckbtcPendingSats: MOCK_REFUND_HELD_SATS,
          tttiDelivered: tttiFromToken(
            minted - MOCK_REFUND_HELD_SATS,
            PayToken.ckbtc,
            MOCK_PAY_USD_E8[PayToken.ckbtc],
          ),
          conversionId: BigInt(state.conversions.length + 1),
          errorKind: DepositErrorKind.refundFailed,
          errorMessage: "ckBTC ledger transfer failed: TemporarilyUnavailable",
        };
      }
      return {
        ...next,
        stage: { __kind__: "delivered", delivered: null },
        ckbtcPendingSats: 0n,
        tttiDelivered: tttiFromToken(minted, PayToken.ckbtc, MOCK_PAY_USD_E8[PayToken.ckbtc]),
        conversionId: BigInt(state.conversions.length + 1),
      };
    default:
      return next;
  }
}

/** Checks with every deposit final before the mock sees a new transfer. */
const MOCK_IDLE_CHECKS_PER_TRANSFER = 3;
const mockIdleChecks: Record<DepositKind, number> = {
  [DepositKind.purchase]: 0,
  [DepositKind.wallet]: 0,
};

/**
 * Each check advances every open deposit one stage; once all are final, a new
 * transfer appears after a few idle checks.
 */
function advanceTracking(tracking: DepositTracking): DepositTracking {
  const open = tracking.deposits.some((entry) => !closedEntry(tracking.kind, entry));
  let deposits = tracking.deposits.map((entry) =>
    closedEntry(tracking.kind, entry) ? entry : advanceEntry(tracking.kind, entry),
  );
  if (!open) {
    mockIdleChecks[tracking.kind] += 1;
    if (
      tracking.deposits.length === 0 ||
      mockIdleChecks[tracking.kind] >= MOCK_IDLE_CHECKS_PER_TRANSFER
    ) {
      mockIdleChecks[tracking.kind] = 0;
      deposits = [newEntry(tracking.deposits.length), ...deposits];
    }
  }
  return {
    ...tracking,
    stage: deposits[0]?.stage ?? tracking.stage,
    deposits,
    lastCheckedAt: nowNs(),
    errorKind: deposits[0]?.errorKind,
    errorMessage: deposits[0]?.errorMessage,
  };
}

// Wallet address used twice before (one unrecoverable, one minted), with a
// third deposit confirming.
{
  const wallet = newTracking(DepositKind.wallet);
  const current: DepositEntry = {
    ...newEntry(2),
    stage: {
      __kind__: "confirming",
      confirming: { current: 2n, required: BTC_DEFAULT_MIN_CONFIRMATIONS },
    },
  };
  const unrecoverable: DepositEntry = {
    ...newEntry(0),
    stage: { __kind__: "error", error: null },
    ckbtcPendingSats: 0n,
    detectedAt: nowNs() - 4n * 24n * HOUR_NS,
    updatedAt: nowNs() - 4n * 24n * HOUR_NS,
    errorKind: DepositErrorKind.unrecoverable,
    errorMessage: "The minter cannot mint ckBTC for this UTXO.",
  };
  state.btcWallet = {
    ...wallet,
    createdAt: nowNs() - 5n * 24n * HOUR_NS,
    lastCheckedAt: nowNs() - 60_000_000_000n,
    stage: current.stage,
    deposits: [current, mintedWalletEntry(1, 2n * 24n * HOUR_NS), unrecoverable],
  };
}

/** Checks without a stored tracking before the mock detects a first deposit. */
const mockUnsavedChecks: Record<DepositKind, number> = {
  [DepositKind.purchase]: 0,
  [DepositKind.wallet]: 0,
};

const storedBtcTracking = (kind: DepositKind) =>
  kind === DepositKind.purchase ? state.btcPurchase : state.btcWallet;

/** Address call: the stored tracking, or an unsaved #addressShown one; stores nothing. */
const btcAddressResult = (kind: DepositKind): BtcDepositResult => ({
  __kind__: "Ok",
  Ok: storedBtcTracking(kind) ?? newTracking(kind),
});

/**
 * Check: advances a stored tracking; without one, returns an unsaved tracking
 * (deposits = [], lastCheckedAt set) and creates the tracking only once a
 * deposit is detected.
 */
function checkBtcResult(kind: DepositKind): BtcDepositResult {
  const stored = storedBtcTracking(kind);
  if (!stored) {
    mockUnsavedChecks[kind] += 1;
    if (mockUnsavedChecks[kind] < MOCK_IDLE_CHECKS_PER_TRANSFER) {
      return { __kind__: "Ok", Ok: { ...newTracking(kind), lastCheckedAt: nowNs() } };
    }
    mockUnsavedChecks[kind] = 0;
  }
  const next = advanceTracking(stored ?? newTracking(kind));
  if (kind === DepositKind.purchase) state.btcPurchase = next;
  else state.btcWallet = next;
  return { __kind__: "Ok", Ok: next };
}

/** Acknowledgement version in force, as in the backend. */
const ACK_VERSION = 2n;

/** Only a record of the version in force counts as accepted. */
function ackAccepted(): boolean {
  return state.acknowledgement !== null && state.acknowledgement.version === ACK_VERSION;
}

function ackView(): PurchaseAcknowledgement {
  return ackAccepted() && state.acknowledgement !== null
    ? { accepted: true, acceptedAt: state.acknowledgement.acceptedAt }
    : { accepted: false };
}

const btcAckRequired = (): BtcDepositResult => ({
  __kind__: "Err",
  Err: {
    code: BtcDepositErrorCode.acknowledgementRequired,
    message: "Accept the purchase acknowledgements before your first purchase.",
  },
});

/** Reserve minus the floor minus the ICP ledger fee, never negative. */
const withdrawableExcess = () => {
  const excess = state.reserveBalanceE8s - RESERVE_FLOOR_E8S - ICP_LEDGER_FEE;
  return excess > 0n ? excess : 0n;
};

/** Live conversion at the buyer price (1% cycles fee included), floored. */
function liveTtti(icpAmount: bigint): bigint {
  return tttiFromIcp(icpAmount, MOCK_USD_E8);
}

/** Fresh minting plus the collected fee account, as in getSaleStatus. */
const mockTotalSupply = () => state.sold + state.feeCollectorBalance;

/** What can still be minted: max(0, cap - totalSupply). */
const mintableRemaining = () => {
  const supply = mockTotalSupply();
  return MAX_SUPPLY > supply ? MAX_SUPPLY - supply : 0n;
};

function saleAvailable(): bigint {
  return mintableRemaining() + state.feeCollectorBalance;
}

function makeConversion(icpAmount: bigint, recipient: Account): Conversion {
  const tttiAmount = liveTtti(icpAmount);
  // Fresh minting first; fee-account tokens only once minting reaches the cap.
  const mintable = mintableRemaining();
  const minted = tttiAmount < mintable ? tttiAmount : mintable;
  const feeBps = PAY_TOKENS[PayToken.icp].feeBps;
  // payAmount includes the fee: fee = payAmount * feeBps / (10_000 + feeBps).
  const feeAmount = (icpAmount * feeBps) / (10_000n + feeBps);
  state.nextBlock += 2n;
  return {
    id: BigInt(state.conversions.length + 1),
    status: ConversionStatus.completed,
    depositor: CALLER,
    feeBps,
    feeAmount,
    netAmount: icpAmount - feeAmount,
    paymentBlock: state.nextBlock - 1n,
    mintBlock: state.nextBlock,
    payToken: PayToken.icp,
    payAmount: icpAmount,
    usedFallback: false,
    priceUsdE8: MOCK_USD_E8,
    minted,
    fromCollector: tttiAmount - minted,
    recipient,
    timestamp: nowNs(),
    tttiAmount,
    icpAmount,
    forward: { __kind__: "forwarded", forwarded: icpAmount - ICP_LEDGER_FEE },
  };
}

// Legacy ICP purchase recorded before fee, net and block fields existed.
{
  const {
    feeAmount: _fee,
    netAmount: _net,
    paymentBlock: _payment,
    mintBlock: _mint,
    ...legacy
  } = makeConversion(ICP_DIVISOR / 4n, CALLER_ACCOUNT);
  state.conversions.push({
    ...legacy,
    payAmount: 0n,
    timestamp: nowNs() - 30n * 24n * HOUR_NS,
  });
}
// Purchase with fee, net amount and ledger blocks recorded.
state.conversions.unshift(makeConversion(ICP_DIVISOR, CALLER_ACCOUNT));
// Purchase paid in ckUSDT: 101 ckUSDT, 1% fee, 100 ckUSDT net for 0.01 TTTI-T.
// Its mass exercises the one-time ckUSDT payout failure and the retry.
{
  const feeBps = PAY_TOKENS[PayToken.ckusdt].feeBps;
  const unit = 10n ** BigInt(PAY_TOKENS[PayToken.ckusdt].decimals);
  const payAmount = 101n * unit;
  const feeAmount = (payAmount * feeBps) / (10_000n + feeBps);
  const tttiAmount = TTTI_DIVISOR / 100n;
  state.conversions.unshift({
    ...makeConversion(ICP_DIVISOR, CALLER_ACCOUNT),
    payToken: PayToken.ckusdt,
    payAmount,
    feeBps,
    feeAmount,
    netAmount: payAmount - feeAmount,
    priceUsdE8: 100_000_000n,
    tttiAmount,
    minted: tttiAmount,
    fromCollector: 0n,
    icpAmount: 0n,
    forward: { __kind__: "forwarded", forwarded: feeAmount - PAY_TOKENS[PayToken.ckusdt].fee },
    timestamp: nowNs() - 2n * 24n * HOUR_NS,
  });
}
// One purchase whose ICP forward to the treasury failed (retryable by admins).
state.conversions.unshift({
  ...makeConversion(ICP_DIVISOR / 2n, { owner: HOLDER_2 }),
  depositor: HOLDER_2,
  forward: {
    __kind__: "failed",
    failed: "ICP ledger transfer failed: TemporarilyUnavailable",
  },
});

// --- Transfers to review (lib/retry.mo) --------------------------------------
// An ICP purchase whose treasury forward (FW) has had no confirmed outcome for
// 23 h, and the reserve share (SH) of purchase #2 in the same state.
const reviewPurchase = makeConversion(ICP_DIVISOR / 5n, { owner: HOLDER_3 });
state.conversions.unshift({
  ...reviewPurchase,
  depositor: HOLDER_3,
  forward: { __kind__: "needsReview", needsReview: null },
  timestamp: nowNs() - 26n * HOUR_NS,
});

// A purchase whose refund (RF) has had no confirmed outcome for 23 h.
const refundPurchase = {
  ...makeConversion(ICP_DIVISOR / 10n, { owner: HOLDER_2 }),
  depositor: HOLDER_2,
  status: ConversionStatus.refundReview,
  timestamp: nowNs() - 27n * HOUR_NS,
};
state.conversions.unshift(refundPurchase);

const memoHexOf = (text: string) =>
  Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

function reviewEntry(
  kind: TransferKind,
  purchaseId: bigint,
  memoText: string,
  amount: bigint,
  destination: Account,
  sends: bigint,
  lastError: string,
): TransferReview {
  return {
    kind,
    purchaseId,
    token: PayToken.icp,
    memoText,
    memoHex: memoHexOf(memoText),
    createdAtTimeNs: nowNs() - 24n * HOUR_NS,
    amount,
    fee: ICP_LEDGER_FEE,
    destination,
    sends,
    lastError,
  };
}

const mockReviews: Array<TransferReview> = [
  reviewEntry(
    TransferKind.FW,
    reviewPurchase.id,
    `TTTI-FW-${reviewPurchase.id}`,
    (reviewPurchase.netAmount ?? reviewPurchase.payAmount) - ICP_LEDGER_FEE,
    TREASURY_ACCOUNT,
    4n,
    "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)",
  ),
  reviewEntry(
    TransferKind.SH,
    2n,
    "TTTI-SH-2",
    (state.conversions.find((c) => c.id === 2n)?.feeAmount ?? 0n) - ICP_LEDGER_FEE,
    CYCLES_RESERVE_ACCOUNT,
    2n,
    "Call timed out (outcome unknown)",
  ),
  reviewEntry(
    TransferKind.RF,
    refundPurchase.id,
    `TTTI-RF-${refundPurchase.id}`,
    refundPurchase.payAmount - ICP_LEDGER_FEE,
    { owner: HOLDER_2 },
    3n,
    "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)",
  ),
  // Payments to refund (PC): purchaseId is the trace number, destination the
  // buyer's default account; one collect confirmed in a known block, one unknown.
  {
    ...reviewEntry(TransferKind.PC, 7n, "TTTI-PC-7", ICP_DIVISOR / 4n, { owner: HOLDER_3 }, 0n, ""),
    fee: undefined,
    lastError: undefined,
    block: 18_204_311n,
    collect: CollectState.confirmed,
  },
  {
    ...reviewEntry(TransferKind.PC, 8n, "TTTI-PC-8", ICP_DIVISOR / 20n, { owner: HOLDER_2 }, 0n, ""),
    fee: undefined,
    lastError: undefined,
    collect: CollectState.unknown,
  },
  // BTC refund (BR) to verify: id is the attempt number, memo TTTI-BR-<n>-<index>.
  {
    kind: TransferKind.BR,
    purchaseId: 12n,
    token: PayToken.ckbtc,
    memoText: "TTTI-BR-12-1",
    memoHex: memoHexOf("TTTI-BR-12-1"),
    createdAtTimeNs: nowNs() - 24n * HOUR_NS,
    amount: MOCK_REFUND_HELD_SATS - PAY_TOKENS[PayToken.ckbtc].fee,
    fee: PAY_TOKENS[PayToken.ckbtc].fee,
    destination: { owner: HOLDER_2 },
    sends: 3n,
    lastError: "Call timed out (outcome unknown)",
    depositIndex: 1n,
    buyer: HOLDER_2,
    refundPurpose: BtcRefundPurpose.excess,
    outcome: { __kind__: "unknown", unknown: null },
  },
  // BTC cost send (BC) to the treasury to verify: id is the trace number.
  {
    kind: TransferKind.BC,
    purchaseId: 9n,
    token: PayToken.ckbtc,
    memoText: "TTTI-PC-9",
    memoHex: memoHexOf("TTTI-PC-9"),
    createdAtTimeNs: nowNs() - 25n * HOUR_NS,
    amount: 450n,
    fee: PAY_TOKENS[PayToken.ckbtc].fee,
    destination: TREASURY_ACCOUNT,
    sends: 2n,
    lastError: "Call rejected: canister mxzaz-hqaaa-aaaar-qaada-cai is stopping (outcome unknown)",
    depositIndex: 0n,
    buyer: HOLDER_3,
    outcome: { __kind__: "unknown", unknown: null },
  },
  // Delivery-failure cost (BM) to refund by hand: id is the conversion id.
  {
    kind: TransferKind.BM,
    purchaseId: 3n,
    token: PayToken.ckbtc,
    amount: 600n,
    sends: 0n,
    depositIndex: 2n,
    buyer: HOLDER_3,
    conversionId: 3n,
  },
];
/** Transfers confirmed by the admin, with the ledger block entered. */
const mockArrivedTransfers: Array<{ kind: TransferKind; purchaseId: bigint; block: bigint }> = [];
/** New attempts opened by Not arrived; the 10-minute timer would send them. */
const mockPendingAttempts: Array<{
  kind: TransferKind;
  purchaseId: bigint;
  memoText: string;
  createdAtTimeNs: bigint;
}> = [];

function takeReview(kind: TransferKind, purchaseId: bigint): TransferReview | ReviewResult {
  const index = mockReviews.findIndex((r) => r.kind === kind && r.purchaseId === purchaseId);
  if (index >= 0) return mockReviews.splice(index, 1)[0];
  const known =
    ((kind === TransferKind.FW || kind === TransferKind.RF) &&
      state.conversions.some((c) => c.id === purchaseId)) ||
    (kind === TransferKind.SH &&
      state.conversions.some((c) => c.id === purchaseId && c.payToken === PayToken.icp)) ||
    (kind === TransferKind.BB && mockBuybacks.some((b) => b.id === purchaseId));
  return { __kind__: "err", err: known ? ReviewError.notUnderReview : ReviewError.notFound };
}

function setForward(purchaseId: bigint, forward: Conversion["forward"]) {
  state.conversions = state.conversions.map((c) => (c.id === purchaseId ? { ...c, forward } : c));
}

function setStatus(purchaseId: bigint, status: ConversionStatus) {
  state.conversions = state.conversions.map((c) => (c.id === purchaseId ? { ...c, status } : c));
}

function mockMarkArrived(kind: TransferKind, purchaseId: bigint, block: bigint): ReviewResult {
  if (kind === TransferKind.PC || kind === TransferKind.BM) {
    return { __kind__: "err", err: ReviewError.notApplicable };
  }
  const taken = takeReview(kind, purchaseId);
  if ("__kind__" in taken) return taken;
  mockArrivedTransfers.push({ kind, purchaseId, block });
  if (kind === TransferKind.FW) setForward(purchaseId, { __kind__: "forwarded", forwarded: block });
  if (kind === TransferKind.RF) setStatus(purchaseId, ConversionStatus.refunded);
  if (kind === TransferKind.BB) mockBuybackArrived(purchaseId, block);
  return { __kind__: "ok", ok: null };
}

/** Payments that never happened, removed by Not arrived on a PC item. */
const mockRemovedPayments: Array<bigint> = [];

function mockMarkNotArrived(kind: TransferKind, purchaseId: bigint): ReviewResult {
  if (kind === TransferKind.BM) return { __kind__: "err", err: ReviewError.notApplicable };
  const taken = takeReview(kind, purchaseId);
  if ("__kind__" in taken) return taken;
  if (kind === TransferKind.PC) {
    mockRemovedPayments.push(purchaseId);
    return { __kind__: "ok", ok: null };
  }
  if (kind === TransferKind.BC) {
    // The cost send and its payment to refund are removed; the timer converts the deposit again later.
    const paymentIndex = mockReviews.findIndex((r) => r.kind === TransferKind.PC && r.purchaseId === purchaseId);
    if (paymentIndex >= 0) mockReviews.splice(paymentIndex, 1);
    mockRemovedPayments.push(purchaseId);
    return { __kind__: "ok", ok: null };
  }
  if (kind === TransferKind.BB) {
    // The latest payment attempt becomes a known failure: the buyer can retry or cancel.
    mockBuybackNotArrived(purchaseId);
    return { __kind__: "ok", ok: null };
  }
  // New attempt: new memo (-<m>) and new created_at_time, sent by the timer.
  const attempt = mockPendingAttempts.filter((a) => a.kind === kind && a.purchaseId === purchaseId).length + 2;
  mockPendingAttempts.push({
    kind,
    purchaseId,
    memoText: `TTTI-${kind}-${purchaseId}-${attempt}`,
    createdAtTimeNs: nowNs(),
  });
  if (kind === TransferKind.FW) setForward(purchaseId, { __kind__: "pending", pending: null });
  return { __kind__: "ok", ok: null };
}

/** Refunds done by hand by the admin (RF, PC and BM), with the ledger block. */
const mockManualRefunds: Array<{ kind: TransferKind; purchaseId: bigint; block: bigint }> = [];

function mockMarkRefundedManually(kind: TransferKind, purchaseId: bigint, block: bigint): ReviewResult {
  if (kind !== TransferKind.RF && kind !== TransferKind.PC && kind !== TransferKind.BM) {
    return { __kind__: "err", err: ReviewError.notApplicable };
  }
  const taken = takeReview(kind, purchaseId);
  if ("__kind__" in taken) return taken;
  mockManualRefunds.push({ kind, purchaseId, block });
  if (kind === TransferKind.RF) setStatus(purchaseId, ConversionStatus.refunded);
  return { __kind__: "ok", ok: null };
}

const MOCK_API_DOC = [
  "# TTTI-T backend API (simulated contract)",
  "",
  "## Purchase acknowledgements",
  "- Acceptances are stored as { acceptedAt; version }; the version in force is 2 and records from before the change are version 1.",
  "- getMyPurchaseAcknowledgement() : query -> PurchaseAcknowledgement { accepted; acceptedAt } — accepted only for a version-2 record.",
  "- acceptPurchaseAcknowledgements() -> records version 2 (an existing version-2 record is kept unchanged).",
  "- A missing or version-1 record is refused with #acknowledgementRequired by the purchase, getBtcPurchaseAddress() and checkBtcPurchaseDeposit() until accepted again.",
  "",
  "## Transfer retries (lib/retry.mo)",
  "Every outgoing transfer is an attempt recorded before the first await: number, memo, created_at_time and the full request.",
  "Memos are TTTI-<prefix>-<n> or TTTI-<prefix>-<n>-<m> (32 bytes at most, no principal, n global); prefixes PC, RF, FW, SH, BB, BR.",
  "Ok or #Duplicate means sent; Err is a known failure; a reject or trap leaves the outcome unknown until an Ok, a #Duplicate or the admin's check.",
  "The same request is resent unchanged for 23 h, then the transfer becomes #needsReview. Only a new attempt changes destination, amount or fee, with a new memo and a new created_at_time.",
  "Treasury forwards (FW) and reserve shares (SH) are sent by a 10-minute timer, re-armed on every install and upgrade. A zero-amount forward is #notRequired.",
  "Purchase refunds (RF, memo TTTI-RF-<n>) are retried only when the balance covers the amount; success sets the purchase #refunded, an unknown outcome after 23 h sets it #refundReview.",
  "A purchase trace (memo TTTI-PC-<n>) is written before the collect await; an unknown collect outcome or a trap after the debit moves it to the payments to refund.",
  "",
  "## Buyback escrow (lib/buyback.mo)",
  "- Buybacks are optional and limited; they depend on available funds and on the funder's willingness. For now only the creator funds buybacks.",
  "- Bought-back TTTI-T go to the funder, who pays with their own money; they are never pre-mined or pre-allocated.",
  "- New buybacks keep the TTTI-T in the contract's holding account until the payout succeeds, then release them to the funder. Cancel is possible when every payout attempt is refused by the ledger; otherwise cancelling waits for the admin's check. A buyback cannot be undone once the payout has succeeded. Legacy buybacks sent the TTTI-T to the funder directly.",
  "- quoteBuyback(massToken, percent, receiveToken) -> Result<BuybackQuote, BuybackError> — tttiTransferFee is the pull fee, tttiEscrowFee the second TTTI-T fee paid by the escrow on release or cancel; tttiAllowanceRequired = tttiAmount + 2 TTTI-T fees. The mass-token ledger fee stays deducted from the amount returned.",
  "- requestBuyback(massToken, percent, receiveToken, fromSubaccount) -> Result<Buyback, BuybackError> — the TTTI-T go from the buyer to the escrow subaccount; the payout attempt (memo TTTI-BB-<n>-<attempt>, created_at_time) is recorded before it is sent in the mass token. Success: TTTI-T released to the funder (releaseBlock), #completed; otherwise #payoutFailed with the attempt outcome.",
  "- retryBuybackPayout(id) -> Result<Buyback, BuybackError> — resends the latest attempt unchanged within 23 h when its outcome is unknown; after a known Err opens the next attempt.",
  "- cancelBuyback(id) -> Result<Buyback, BuybackError> — buyer or admin, under the buyback lock, only on a non-legacy #payoutFailed buyback whose every attempt got an Err: returns tttiAmount from the escrow to the buyer (cancelBlock), #cancelled. Errors: #notCancellable, #attemptUnknown, #attemptArrived, #notAuthorized, #cancelFailed.",
  "- markBuybackCancelled(id, block) -> Result<Buyback, BuybackError> — admin only, legacy buybacks only (#notLegacy otherwise), refused with #attemptArrived when an attempt arrived: records the admin's TTTI-T block as cancelBlock, #cancelled.",
  "- Buyback adds tttiEscrowFee, payoutAttempts ({ from; attempt }), releaseBlock, cancelBlock and legacy; BuybackStatus adds #cancelled; BuybackError adds #releaseFailed.",
  "",
  "## Bitcoin deposits",
  "- getBtcPurchaseAddress(), getBtcWalletAddress() and getBtcWalletAddressFor(owner) (unsigned) -> BtcDepositResult — #Ok with the stored tracking, or an unsaved #addressShown tracking (deposits = []); they store nothing. Errors: #anonymousCaller, #acknowledgementRequired (purchase only), #minterUnavailable.",
  "- checkBtcPurchaseDeposit(), checkBtcWalletDeposit() and checkBtcWalletDepositFor(owner) -> BtcDepositResult — no deposit yet: #Ok with an unsaved tracking (#addressShown, deposits = [], lastCheckedAt set). A tracking is created only when a check detects a deposit; it then drives the progress. Purchase errors add #purchaseInProgress.",
  "- getMyBtcDeposits() : { purchase; wallet } and getBtcWalletDepositsFor(owner) : ?DepositTracking — null until a check detected a deposit.",
  "- The 600 s task watches only the stored trackings: purchases first, then recently active ones.",
  "",
  "## Upgrade readiness (admin only)",
  "- getUpgradeReadiness() : query -> UpgradeReadiness — sales pause, purchases in flight, BTC lock, buybacks in flight, reserve lock, pending cycles top-up attempt, open purchase traces, reserved and the last reconciliation. Non-admin callers trap.",
  "- reconcileReserved() -> Result<ReservedReconciliation, ReconcileError> — sets sale.reserved to 0 and keeps the previous value, date and caller; refused with #notAdmin, #notPaused, #purchaseInFlight or #openTraces.",
  "- requestBuyback, retryBuybackPayout and cancelBuyback return #salesPaused while sales are paused.",
  "",
  "## Review (admin only)",
  "- listTransfersToReview() : query -> [TransferReview] — FW, SH and RF under review, every PC payment to refund, BR BTC refunds to verify (id = BR attempt number), BC BTC cost sends to the treasury to verify (id = trace number), BM delivery-failure costs to refund by hand (id = conversion id) and BB buyback payments to verify plus legacy #payoutFailed buybacks (id = buyback id); kind, purchaseId, token, memoText, memoHex, createdAtTimeNs, amount, fee, destination (the buyer for PC), sends, lastError, block (when known), collect (PC: #confirmed or #unknown), buyer, depositIndex, conversionId, refundPurpose (BR: #excess, #fullRefund or #deliveryFailedExcess), outcome (BR/BC).",
  "- markTransferArrived(kind, purchaseId, block) -> ReviewResult — records the ledger block for FW, SH, RF, BR, BC or BB (RF sets the purchase #refunded; BB sets the payout block, releases the escrow and completes the buyback); PC and BM return #notApplicable.",
  "- markTransferNotArrived(kind, purchaseId) -> ReviewResult — FW, SH, RF or BR: opens a new attempt sent by the timer; BC: removes the cost send and its payment to refund, and the deposit is converted again later by the timer; PC: removes a payment that never happened; BB: the latest payment attempt becomes a known failure, so the buyer can retry or cancel; BM returns #notApplicable.",
  "- markRefundedManually(kind, purchaseId, block) -> ReviewResult — RF, PC or BM only: records the item as refunded with the block and removes it from the list; FW, SH, BR and BC return #notApplicable.",
  "- ReviewError: #notAdmin, #notFound, #notUnderReview, #notApplicable.",
  "- ConversionStatus adds #refundReview: refund outcome unknown after 23 h.",
].join("\n");

function purchaseError(
  code: Extract<PurchaseResult, { __kind__: "Err" }>["Err"]["code"],
  message: string,
): PurchaseResult {
  return { __kind__: "Err", Err: { code, message } };
}

function mockPurchase(recipient: Account | null, icpAmount: bigint): PurchaseResult {
  if (!ackAccepted()) {
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
          token: PayToken.icp,
          maximumPayAmount: icpForTtti(remaining, MOCK_USD_E8),
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

/** Hourly rate fetched at the start of the current hour, valid one hour. */
const mockPrice = (): IcpPrice => {
  const fetchedAt = hourStartNs();
  return {
    usdE8: MOCK_USD_E8,
    source: PriceSource.coinbase,
    fetchedAt,
    validUntil: fetchedAt + HOUR_NS,
    usable: true,
    lastSuccessAt: fetchedAt,
    lastError: {
      message: "coinbase: HTTP 503 Service Unavailable",
      at: fetchedAt - 2n * HOUR_NS,
    },
  };
};

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

/** Mock USD price per whole pay token (usdE8). */
const MOCK_PAY_USD_E8: Record<PayToken, bigint> = {
  [PayToken.icp]: MOCK_USD_E8,
  [PayToken.ckbtc]: 6_500_000_000_000n,
  [PayToken.ckusdc]: 100_000_000n,
  [PayToken.ckusdt]: 100_000_000n,
};

function mockTokenPrice(token: PayToken): TokenPrice {
  const price = mockPrice();
  return {
    token,
    pair: `${PAY_TOKENS[token].symbol}/USD`,
    usdE8: MOCK_PAY_USD_E8[token],
    source: price.source,
    fetchedAt: price.fetchedAt,
    validUntil: price.validUntil,
    usable: price.usable,
    lastSuccessAt: price.lastSuccessAt,
  };
}

function mockPayTokens(): Array<PayTokenStatus> {
  const price = mockPrice();
  return PAY_TOKEN_ORDER.map((token) => {
    const descriptor = PAY_TOKENS[token];
    return {
      token,
      symbol: descriptor.symbol,
      decimals: descriptor.decimals,
      ledgerCanisterId: Principal.fromText(descriptor.ledgerCanisterId),
      ledgerFee: descriptor.fee,
      feeBps: descriptor.feeBps,
      fundsCycles: descriptor.fundsCycles,
      buyerPriceUsd: (BigInt(TOKEN_PRICE_USD) * (10_000n + descriptor.feeBps)) / 10_000n,
      minimumUsdE8: BigInt(Math.round(descriptor.minimumUsd * 100)) * 1_000_000n,
      priceUsdE8: MOCK_PAY_USD_E8[token],
      priceSource: price.source,
      priceUsable: price.usable,
      priceFetchedAt: price.fetchedAt,
      priceValidUntil: price.validUntil,
      treasuryConfigured: true,
      liveRate: token === PayToken.icp ? MOCK_LIVE_RATE : undefined,
    };
  });
}

const mockContacts: Array<Contact> = [];
let nextContactId = 1n;

function hasDuplicateNickname(nickname: string, exceptId?: bigint): boolean {
  const wanted = nickname.trim().toLowerCase();
  return mockContacts.some((c) => c.id !== exceptId && c.nickname.trim().toLowerCase() === wanted);
}

// --- Buybacks -----------------------------------------------------------
const mockBuybacks: Array<Buyback> = [];
let mockBuybackAdmin: Account | null = { owner: HOLDER_3 };

type BuybackOutcome<T> = { __kind__: "ok"; ok: T } | { __kind__: "err"; err: BuybackError };
const buybackErr = <T>(err: BuybackError): BuybackOutcome<T> => ({ __kind__: "err", err });

let nextBuybackId = 1n;

/**
 * Average mass of one buyer for one payment token: completed purchases with a
 * recorded net amount (Version 26 onward; BTC purchases are already ckBTC),
 * minus every buyback already made on that token.
 */
function mockMassFor(buyer: Principal, token: PayToken): BuybackMass {
  let purchaseCount = 0n;
  let totalNet = 0n;
  let totalTtti = 0n;
  for (const c of state.conversions) {
    if (c.depositor.toText() !== buyer.toText() || c.payToken !== token) continue;
    if (c.status !== ConversionStatus.completed || c.netAmount === undefined) continue;
    purchaseCount += 1n;
    totalNet += c.netAmount;
    totalTtti += c.tttiAmount;
  }
  let boughtBackNet = 0n;
  let boughtBackTtti = 0n;
  let inProgress = false;
  for (const b of mockBuybacks) {
    if (b.buyer.toText() !== buyer.toText() || b.originalToken !== token) continue;
    boughtBackNet += b.originalNetAmount;
    boughtBackTtti += b.tttiAmount;
    if (b.status === BuybackStatus.inProgress) inProgress = true;
  }
  const remainingNet = totalNet > boughtBackNet ? totalNet - boughtBackNet : 0n;
  const remainingTtti = totalTtti > boughtBackTtti ? totalTtti - boughtBackTtti : 0n;
  return {
    buyer,
    token,
    purchaseCount,
    totalNet,
    totalTtti,
    boughtBackNet,
    boughtBackTtti,
    remainingNet,
    remainingTtti,
    inProgress,
  };
}

function mockMassesOf(buyer: Principal): Array<BuybackMass> {
  return PAY_TOKEN_ORDER.map((token) => mockMassFor(buyer, token)).filter(
    (m) => m.purchaseCount > 0n,
  );
}

function mockAllMasses(): Array<BuybackMass> {
  const buyers = new Map<string, Principal>();
  for (const c of state.conversions) buyers.set(c.depositor.toText(), c.depositor);
  return [...buyers.values()].flatMap((buyer) => mockMassesOf(buyer));
}

function mockBuybackQuote(
  massToken: PayToken,
  percent: bigint,
  receiveToken: PayToken,
): BuybackOutcome<BuybackQuote> {
  if (percent < 1n || percent > 100n) {
    return buybackErr({ __kind__: "invalidPercent", invalidPercent: null });
  }
  // The buyback is paid only in the mass token.
  if (receiveToken !== massToken) {
    return buybackErr({ __kind__: "receiveTokenMismatch", receiveTokenMismatch: null });
  }
  const mass = mockMassFor(CALLER, massToken);
  if (mass.inProgress) {
    return buybackErr({ __kind__: "massBuybackInProgress", massBuybackInProgress: null });
  }
  if (mass.remainingTtti === 0n || mass.totalTtti === 0n) {
    return buybackErr({ __kind__: "nothingRemaining", nothingRemaining: null });
  }
  if (!mockBuybackAdmin) return buybackErr({ __kind__: "adminAccountNotSet", adminAccountNotSet: null });
  const originalToken = massToken;
  const full = percent === 100n;
  const tttiAmount = full ? mass.remainingTtti : (mass.remainingTtti * percent) / 100n;
  const originalNetAmount = full
    ? mass.remainingNet
    : (mass.remainingNet * tttiAmount) / mass.remainingTtti;
  if (tttiAmount === 0n) {
    return buybackErr({ __kind__: "amountTooSmall", amountTooSmall: null });
  }
  const decimals = 10n ** BigInt(PAY_TOKENS[originalToken].decimals);
  const tttiUsdE8 = (tttiAmount * BigInt(TOKEN_PRICE_USD) * 100_000_000n) / TTTI_DIVISOR;
  const dayQuantity = (tttiUsdE8 * decimals) / MOCK_PAY_USD_E8[originalToken];
  const useNet = originalNetAmount <= dayQuantity;
  const baseAmount = useNet ? originalNetAmount : dayQuantity;
  // No conversion: amount, ledger fee and rate of the mass token.
  const baseAmountReturned = baseAmount;
  const buybackFee = baseAmountReturned / 100n;
  const thirdPartyFees = PAY_TOKENS[originalToken].fee;
  if (baseAmountReturned <= buybackFee + thirdPartyFees) {
    return buybackErr({ __kind__: "amountTooSmall", amountTooSmall: null });
  }
  return {
    __kind__: "ok",
    ok: {
      originalToken,
      tokenReturned: originalToken,
      percent,
      massTotalNet: mass.totalNet,
      massTotalTtti: mass.totalTtti,
      massRemainingNet: mass.remainingNet,
      massRemainingTtti: mass.remainingTtti,
      rule: useNet ? BuybackRule.originalNet : BuybackRule.dayRate,
      originalRateUsdE8: MOCK_PAY_USD_E8[originalToken],
      returnedRateUsdE8: MOCK_PAY_USD_E8[originalToken],
      originalNetAmount,
      baseAmount,
      baseAmountReturned,
      buybackFee,
      thirdPartyFees,
      tttiTransferFee: state.fee,
      amountReturned: baseAmountReturned - buybackFee - thirdPartyFees,
      tttiAmount,
      tttiEscrowFee: state.fee,
      // The buyer approves the amount plus the pull fee and the escrow fee.
      tttiAllowanceRequired: tttiAmount + 2n * state.fee,
    },
  };
}

/** Funder account the payout attempts are drawn from. */
function mockFunder(): Account {
  return mockBuybackAdmin ?? { owner: HOLDER_3 };
}

/** Payout attempt `attempt` of buyback `n` (memo TTTI-BB-<n>-<attempt>). */
function mockPayoutAttempt(
  b: Pick<Buyback, "id" | "buyerAccount" | "tokenReturned" | "amountReturned">,
  attempt: bigint,
  outcome: BuybackPayoutAttempt["attempt"]["outcome"],
  createdAt: bigint,
  lastError?: string,
): BuybackPayoutAttempt {
  const memo = attempt === 0n ? "" : `TTTI-BB-${b.id}-${attempt}`;
  return {
    from: mockFunder(),
    attempt: {
      n: b.id,
      attempt,
      memo: new TextEncoder().encode(memo),
      created_at_time: createdAt,
      request: {
        to: b.buyerAccount,
        token: b.tokenReturned,
        amount: b.amountReturned,
        fee: PAY_TOKENS[b.tokenReturned].fee,
      },
      sends: 1n,
      lastError,
      outcome,
    },
  };
}

function mockRequestBuyback(
  massToken: PayToken,
  percent: bigint,
  receiveToken: PayToken,
  fromSubaccount: Uint8Array | null,
): BuybackOutcome<Buyback> {
  const quote = mockBuybackQuote(massToken, percent, receiveToken);
  if (quote.__kind__ === "err") return quote;
  const { tttiAllowanceRequired: _required, ...figures } = quote.ok;
  // TTTI-T pull: buyer -> escrow subaccount.
  state.nextBlock += 1n;
  const pullBlock = state.nextBlock;
  // ckUSDT mass payouts fail once in the mock so the retry path can be exercised.
  const fails = massToken === PayToken.ckusdt;
  const base = {
    ...figures,
    id: nextBuybackId,
    buyerAccount: fromSubaccount ? { owner: CALLER, subaccount: fromSubaccount } : CALLER_ACCOUNT,
  };
  const payoutBlock = 4_200_000n + state.nextBlock;
  const attempt = mockPayoutAttempt(
    base,
    1n,
    fails
      ? { __kind__: "failed", failed: "InsufficientAllowance (mock)" }
      : { __kind__: "succeeded", succeeded: payoutBlock },
    nowNs(),
    fails ? "InsufficientAllowance (mock)" : undefined,
  );
  if (!fails) state.nextBlock += 1n; // TTTI-T release: escrow -> funder.
  const buyback: Buyback = {
    ...base,
    buyer: CALLER,
    timestamp: nowNs(),
    pullBlock,
    payoutBlock: fails ? undefined : payoutBlock,
    payoutAttempts: [attempt],
    releaseBlock: fails ? undefined : state.nextBlock,
    legacy: false,
    status: fails ? BuybackStatus.payoutFailed : BuybackStatus.completed,
    message: fails ? "InsufficientAllowance (mock)" : undefined,
  };
  mockBuybacks.unshift(buyback);
  nextBuybackId += 1n;
  return { __kind__: "ok", ok: buyback };
}

function mockRetryBuyback(buybackId: bigint): BuybackOutcome<Buyback> {
  const index = mockBuybacks.findIndex((b) => b.id === buybackId);
  if (index < 0) return buybackErr({ __kind__: "buybackNotFound", buybackNotFound: null });
  const record = mockBuybacks[index];
  if (record.buyer.toText() !== CALLER.toText()) {
    return buybackErr({ __kind__: "notBuyer", notBuyer: null });
  }
  if (record.status !== BuybackStatus.payoutFailed) {
    return buybackErr({ __kind__: "notRetryable", notRetryable: null });
  }
  // After a known Err the retry opens the next attempt (new memo and created_at_time).
  const payoutBlock = 4_200_000n + state.nextBlock;
  const next = mockPayoutAttempt(
    record,
    BigInt(record.payoutAttempts.length + 1),
    { __kind__: "succeeded", succeeded: payoutBlock },
    nowNs(),
  );
  state.nextBlock += 1n;
  const done: Buyback = {
    ...record,
    status: BuybackStatus.completed,
    payoutBlock,
    payoutAttempts: [...record.payoutAttempts, next],
    releaseBlock: record.legacy ? undefined : state.nextBlock,
    message: undefined,
  };
  mockBuybacks[index] = done;
  return { __kind__: "ok", ok: done };
}

/** Buyer or admin: return the escrowed TTTI-T when every attempt got an Err. */
function mockCancelBuyback(buybackId: bigint): BuybackOutcome<Buyback> {
  const index = mockBuybacks.findIndex((b) => b.id === buybackId);
  if (index < 0) return buybackErr({ __kind__: "buybackNotFound", buybackNotFound: null });
  const record = mockBuybacks[index];
  // The mock caller is the admin, so the buyer-or-admin check always passes.
  if (record.legacy || record.status !== BuybackStatus.payoutFailed) {
    return buybackErr({ __kind__: "notCancellable", notCancellable: null });
  }
  const outcomes = record.payoutAttempts.map((p) => p.attempt.outcome.__kind__);
  if (outcomes.includes("succeeded")) {
    return buybackErr({ __kind__: "attemptArrived", attemptArrived: null });
  }
  if (outcomes.some((o) => o !== "failed")) {
    return buybackErr({ __kind__: "attemptUnknown", attemptUnknown: null });
  }
  state.nextBlock += 1n; // TTTI-T escrow -> buyer, second fee paid by the escrow.
  const cancelled: Buyback = {
    ...record,
    status: BuybackStatus.cancelled,
    cancelBlock: state.nextBlock,
    message: undefined,
  };
  mockBuybacks[index] = cancelled;
  return { __kind__: "ok", ok: cancelled };
}

/** Admin, legacy buybacks only: record the block of the TTTI-T returned by hand. */
function mockMarkBuybackCancelled(buybackId: bigint, block: bigint): BuybackOutcome<Buyback> {
  const index = mockBuybacks.findIndex((b) => b.id === buybackId);
  if (index < 0) return buybackErr({ __kind__: "buybackNotFound", buybackNotFound: null });
  const record = mockBuybacks[index];
  if (!record.legacy) return buybackErr({ __kind__: "notLegacy", notLegacy: null });
  if (record.payoutAttempts.some((p) => p.attempt.outcome.__kind__ === "succeeded")) {
    return buybackErr({ __kind__: "attemptArrived", attemptArrived: null });
  }
  if (record.status !== BuybackStatus.payoutFailed) {
    return buybackErr({ __kind__: "notCancellable", notCancellable: null });
  }
  const cancelled: Buyback = {
    ...record,
    status: BuybackStatus.cancelled,
    cancelBlock: block,
    message: undefined,
  };
  mockBuybacks[index] = cancelled;
  const reviewIndex = mockReviews.findIndex((r) => r.kind === TransferKind.BB && r.purchaseId === buybackId);
  if (reviewIndex >= 0) mockReviews.splice(reviewIndex, 1);
  return { __kind__: "ok", ok: cancelled };
}

/** Replace the outcome of the latest payout attempt of a buyback. */
function setLatestOutcome(
  record: Buyback,
  outcome: BuybackPayoutAttempt["attempt"]["outcome"],
): Array<BuybackPayoutAttempt> {
  return record.payoutAttempts.map((p, i) =>
    i === record.payoutAttempts.length - 1 ? { ...p, attempt: { ...p.attempt, outcome } } : p,
  );
}

/** Admin Arrived on a BB row: payout block set, escrow released, #completed. */
function mockBuybackArrived(buybackId: bigint, block: bigint) {
  const index = mockBuybacks.findIndex((b) => b.id === buybackId);
  if (index < 0) return;
  const record = mockBuybacks[index];
  if (!record.legacy) state.nextBlock += 1n;
  mockBuybacks[index] = {
    ...record,
    status: BuybackStatus.completed,
    payoutBlock: block,
    payoutAttempts: setLatestOutcome(record, { __kind__: "succeeded", succeeded: block }),
    releaseBlock: record.legacy ? undefined : state.nextBlock,
    message: undefined,
  };
}

/** Admin Not arrived on a BB row: the latest attempt becomes a known failure. */
function mockBuybackNotArrived(buybackId: bigint) {
  const index = mockBuybacks.findIndex((b) => b.id === buybackId);
  if (index < 0) return;
  const record = mockBuybacks[index];
  mockBuybacks[index] = {
    ...record,
    status: BuybackStatus.payoutFailed,
    payoutAttempts: setLatestOutcome(record, {
      __kind__: "failed",
      failed: "Not arrived (admin check)",
    }),
  };
}

/** Seeded buyback of another buyer, already recorded. */
function seedBuyback(buyer: Principal, legacy: boolean, ageHours: bigint): Buyback {
  const token = PayToken.icp;
  const tttiAmount = TTTI_DIVISOR / 1000n;
  const net = ICP_DIVISOR / 2n;
  const buybackFee = net / 100n;
  const thirdPartyFees = ICP_LEDGER_FEE;
  const base = {
    id: nextBuybackId,
    buyerAccount: { owner: buyer },
    tokenReturned: token,
    amountReturned: net - buybackFee - thirdPartyFees,
  };
  const createdAt = nowNs() - ageHours * HOUR_NS;
  nextBuybackId += 1n;
  return {
    ...base,
    buyer,
    timestamp: createdAt,
    originalToken: token,
    percent: 100n,
    massTotalNet: net,
    massTotalTtti: tttiAmount,
    massRemainingNet: net,
    massRemainingTtti: tttiAmount,
    originalRateUsdE8: MOCK_PAY_USD_E8[token],
    returnedRateUsdE8: MOCK_PAY_USD_E8[token],
    rule: BuybackRule.originalNet,
    originalNetAmount: net,
    baseAmount: net,
    baseAmountReturned: net,
    buybackFee,
    thirdPartyFees,
    tttiTransferFee: state.fee,
    tttiEscrowFee: legacy ? 0n : state.fee,
    tttiAmount,
    pullBlock: 1_100n + nextBuybackId,
    payoutAttempts: [
      mockPayoutAttempt(
        base,
        legacy ? 0n : 1n,
        { __kind__: "unknown", unknown: null },
        legacy ? 0n : createdAt,
        "Call timed out (outcome unknown)",
      ),
    ],
    legacy,
    status: BuybackStatus.payoutFailed,
    message: "Call timed out (outcome unknown)",
  };
}

/** #BB review row of a seeded buyback (id = buyback id). */
function buybackReviewRow(b: Buyback): TransferReview {
  const latest = b.payoutAttempts[b.payoutAttempts.length - 1].attempt;
  const memoText = new TextDecoder().decode(latest.memo);
  return {
    kind: TransferKind.BB,
    purchaseId: b.id,
    token: b.tokenReturned,
    memoText: memoText === "" ? undefined : memoText,
    memoHex: memoText === "" ? undefined : memoHexOf(memoText),
    createdAtTimeNs: latest.created_at_time === 0n ? undefined : latest.created_at_time,
    amount: latest.request.amount,
    fee: latest.request.fee,
    destination: b.buyerAccount,
    sends: latest.sends,
    lastError: latest.lastError,
    buyer: b.buyer,
    outcome: latest.outcome,
  };
}

// A buyback payment to verify (outcome unknown after 23 h, memo TTTI-BB-1-1)
// and one legacy #payoutFailed buyback (before the escrow, no memo).
const reviewBuyback = seedBuyback(HOLDER_3, false, 25n);
const legacyBuyback = seedBuyback(HOLDER_2, true, 30n * 24n);
mockBuybacks.push(reviewBuyback, legacyBuyback);
mockReviews.push(buybackReviewRow(reviewBuyback), buybackReviewRow(legacyBuyback));

function mockBuybackFunding(): Array<BuybackFunding> {
  return PAY_TOKEN_ORDER.map((token) => ({
    token,
    allowance: token === PayToken.ckbtc ? 0n : 50n * 10n ** BigInt(PAY_TOKENS[token].decimals),
    expiresAt: token === PayToken.ckbtc ? undefined : nowNs() + 7n * 24n * HOUR_NS,
    balance: 80n * 10n ** BigInt(PAY_TOKENS[token].decimals),
  }));
}

export const mockBackend: backendInterface = {
  _initialize_access_control: async () => undefined,
  quoteBuyback: async (massToken, percent, receiveToken) =>
    mockBuybackQuote(massToken, percent, receiveToken),
  requestBuyback: async (massToken, percent, receiveToken, fromSubaccount) =>
    state.salesPaused
      ? buybackErr({ __kind__: "salesPaused", salesPaused: null })
      : mockRequestBuyback(massToken, percent, receiveToken, fromSubaccount),
  retryBuybackPayout: async (buybackId) =>
    state.salesPaused
      ? buybackErr({ __kind__: "salesPaused", salesPaused: null })
      : mockRetryBuyback(buybackId),
  cancelBuyback: async (buybackId) =>
    state.salesPaused
      ? buybackErr({ __kind__: "salesPaused", salesPaused: null })
      : mockCancelBuyback(buybackId),
  getUpgradeReadiness: async () => mockUpgradeReadiness(),
  reconcileReserved: async () => mockReconcileReserved(),
  markBuybackCancelled: async (buybackId, block) => mockMarkBuybackCancelled(buybackId, block),
  listMyBuybackMasses: async () => ({ __kind__: "ok", ok: mockMassesOf(CALLER) }),
  listAllBuybackMasses: async () => mockAllMasses(),
  listMyBuybacks: async () => ({
    __kind__: "ok",
    ok: mockBuybacks.filter((b) => b.buyer.toText() === CALLER.toText()),
  }),
  listAllBuybacks: async () => [...mockBuybacks],
  setBuybackAdminAccount: async (account) => {
    mockBuybackAdmin = account;
  },
  getBuybackAdminAccount: async () => mockBuybackAdmin,
  getBuybackFunding: async () => mockBuybackFunding(),
  addContact: async (input) => {
    if (hasDuplicateNickname(input.nickname)) {
      return { __kind__: "err", err: { __kind__: "duplicateNickname", duplicateNickname: null } };
    }
    const now = nowNs();
    const contact: Contact = {
      id: nextContactId,
      principal: input.principal,
      nickname: input.nickname.trim(),
      memo: input.memo,
      createdAt: now,
      updatedAt: now,
    };
    nextContactId += 1n;
    mockContacts.push(contact);
    return { __kind__: "ok", ok: contact };
  },
  updateContact: async (id, input) => {
    const index = mockContacts.findIndex((c) => c.id === id);
    if (index < 0) {
      return { __kind__: "err", err: { __kind__: "notFound", notFound: null } };
    }
    if (hasDuplicateNickname(input.nickname, id)) {
      return { __kind__: "err", err: { __kind__: "duplicateNickname", duplicateNickname: null } };
    }
    const updated: Contact = {
      ...mockContacts[index],
      principal: input.principal,
      nickname: input.nickname.trim(),
      memo: input.memo,
      updatedAt: nowNs(),
    };
    mockContacts[index] = updated;
    return { __kind__: "ok", ok: updated };
  },
  deleteContact: async (id) => {
    const index = mockContacts.findIndex((c) => c.id === id);
    if (index < 0) {
      return { __kind__: "err", err: { __kind__: "notFound", notFound: null } };
    }
    mockContacts.splice(index, 1);
    return { __kind__: "ok", ok: null };
  },
  listMyContacts: async () => ({ __kind__: "ok", ok: [...mockContacts] }),
  _internet_identity_sign_in_finish: async () => ({ __kind__: "ok", ok: null }),
  _internet_identity_sign_in_start: async () => new Uint8Array(),
  acceptPurchaseAcknowledgements: async () => {
    if (!ackAccepted()) {
      state.acknowledgement = { acceptedAt: nowNs(), version: ACK_VERSION };
    }
    return { __kind__: "ok", ok: ackView() };
  },
  assignCallerUserRole: async () => undefined,
  getBtcDepositInfo: async () => ({
    minterCanisterId: CKBTC_MINTER,
    ckbtcLedgerId: Principal.fromText(PAY_TOKENS[PayToken.ckbtc].ledgerCanisterId),
    minConfirmations: BTC_DEFAULT_MIN_CONFIRMATIONS,
    depositMinSats: BTC_DEFAULT_DEPOSIT_MIN_SATS,
    checkFeeSats: BTC_DEFAULT_CHECK_FEE_SATS,
    purchaseFeeBps: CK_FEE_BPS,
    suggestedPollSeconds: 30n,
    infoFetchedAt: hourStartNs(),
  }),
  getMyBtcDeposits: async () => ({ purchase: state.btcPurchase, wallet: state.btcWallet }),
  getBtcPurchaseAddress: async () =>
    ackAccepted() ? btcAddressResult(DepositKind.purchase) : btcAckRequired(),
  checkBtcPurchaseDeposit: async () =>
    ackAccepted() ? checkBtcResult(DepositKind.purchase) : btcAckRequired(),
  getBtcWalletAddress: async () => btcAddressResult(DepositKind.wallet),
  checkBtcWalletDeposit: async () => checkBtcResult(DepositKind.wallet),
  getBtcWalletAddressFor: async (_owner) => btcAddressResult(DepositKind.wallet),
  checkBtcWalletDepositFor: async (_owner) => checkBtcResult(DepositKind.wallet),
  getBtcWalletDepositsFor: async (_owner) => state.btcWallet ?? null,
  clearDeliveryAddress: async () => {
    const had = state.deliveryAddress !== null;
    state.deliveryAddress = null;
    return had;
  },
  convertDeposit: async (recipient, icpAmount) => mockPurchase(recipient, icpAmount),
  convertDepositWith: async (token, recipient, payAmount, _tttiTarget) =>
    token === PayToken.icp
      ? mockPurchase(recipient, payAmount)
      : purchaseError(
          { __kind__: "tokenNotConfigured", tokenNotConfigured: { token } },
          `${PAY_TOKENS[token].symbol} purchases are not available in the mock backend.`,
        ),
  getTokenPrices: async () => PAY_TOKEN_ORDER.map((token) => mockTokenPrice(token)),
  refreshTokenPrice: async (token) => {
    const price = mockTokenPrice(token);
    return price.usable
      ? { __kind__: "Err", Err: "The current rate is still valid; refresh is allowed only when the rate is expired or absent." }
      : { __kind__: "Ok", Ok: price };
  },
  setPayTokenAccount: async (token, account) => ({ __kind__: "Ok", Ok: { token, account } }),
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
  getApiDoc: async () => MOCK_API_DOC,
  listTransfersToReview: async () => [...mockReviews],
  markTransferArrived: async (kind, purchaseId, block) => mockMarkArrived(kind, purchaseId, block),
  markTransferNotArrived: async (kind, purchaseId) => mockMarkNotArrived(kind, purchaseId),
  markRefundedManually: async (kind, purchaseId, block) =>
    mockMarkRefundedManually(kind, purchaseId, block),
  getBurnAccount: async () => MINTING_ACCOUNT,
  getCallerUserRole: async () => UserRole.admin,
  getCanisterPrincipal: async () => TTTI_CANISTER,
  getConversions: async () => state.conversions,
  getMyConversions: async () =>
    state.conversions.filter(
      (c) => c.depositor.toText() === CALLER.toText() || c.recipient.owner.toText() === CALLER.toText(),
    ),
  getDeliveryAddress: async () => state.deliveryAddress,
  getFeeCollector: async () => ({ account: FEE_COLLECTOR, balance: state.feeCollectorBalance }),
  getIcpPrice: async () => mockPrice(),
  getBtcUsdRate: async () => {
    const price = mockPrice();
    return {
      usdE8: 6_500_000_000_000n,
      source: price.source,
      fetchedAt: price.fetchedAt,
      validUntil: price.validUntil,
    };
  },
  getLegacyBlockInfo: async () => ({
    boundaryIndex: LEGACY_BOUNDARY,
    legacyDecimals: LEGACY_TTTI_DECIMALS,
    currentDecimals: TTTI_DECIMALS,
  }),
  getMyPurchaseAcknowledgement: async () => ackView(),
  getSaleStatus: async () => {
    const totalSupply = mockTotalSupply();
    const available = saleAvailable();
    const price = mockPrice();
    return {
      maxSupply: MAX_SUPPLY,
      totalSupply,
      mintableRemaining: mintableRemaining(),
      feeAccountBalance: state.feeCollectorBalance,
      sold: state.sold,
      reserved: state.reserved,
      available,
      complete: available === 0n,
      minPurchase: MIN_PURCHASE,
      tokenPriceUsd: BigInt(TOKEN_PRICE_USD),
      cyclesFeeBps: CYCLES_FEE_BPS,
      buyerPriceUsd: BigInt(BUYER_PRICE_USD),
      salesPaused: state.salesPaused,
      priceUsdE8: price.usdE8,
      priceSource: price.source,
      priceFetchedAt: price.fetchedAt,
      priceValidUntil: price.validUntil,
      priceUsable: price.usable,
      liveRate: MOCK_LIVE_RATE,
      payTokens: mockPayTokens(),
    };
  },
  getTechnicalDetails: async () => ({
    ledgerCanisterId: TTTI_CANISTER,
    tokenName: TOKEN_NAME,
    tokenSymbol: TTTI_SYMBOL,
    decimals: TTTI_DECIMALS,
    standards: STANDARDS.map((standard) => standard.name),
    icpLedgerCanisterId: ICP_CANISTER,
    ckbtcMinterId: CKBTC_MINTER,
    oracleSources: [HOURLY_RATE_TEXT],
    refreshPolicy: HOURLY_RATE_TEXT,
    maxRateAgeSeconds: MAX_RATE_AGE_SECONDS,
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
    cyclesReserveAccount: CYCLES_RESERVE_ACCOUNT,
    reserveFloorE8s: RESERVE_FLOOR_E8S,
    reserveRule: RESERVE_RULE,
    controllers: MOCK_CONTROLLERS,
    moduleHash: MOCK_MODULE_HASH,
    canisterInfoFetchedAt: hourStartNs(),
    legacyBlockBoundary: LEGACY_BOUNDARY,
    payTokens: mockPayTokens(),
  }),
  getCyclesStatus: async () => ({
    cyclesBalance: state.cyclesBalance,
    topUpThreshold: TOP_UP_THRESHOLD,
    reserveAccount: CYCLES_RESERVE_ACCOUNT,
    reserveBalanceE8s: state.reserveBalanceE8s,
    reserveFloorE8s: RESERVE_FLOOR_E8S,
    withdrawableExcessE8s: withdrawableExcess(),
    withdrawalAllowed: true,
    withdrawalBlockedReason: undefined,
    lastTopUp: state.lastTopUp,
    withdrawals: state.withdrawals,
  }),
  withdrawReserveExcess: async (amount) => {
    const withdrawableE8s = withdrawableExcess();
    if (withdrawableE8s === 0n) return { __kind__: "noExcess", noExcess: null };
    if (amount === 0n || amount > withdrawableE8s) {
      return { __kind__: "amountExceedsExcess", amountExceedsExcess: { withdrawableE8s } };
    }
    const blockIndex = 18_300_000n + BigInt(state.withdrawals.length);
    state.reserveBalanceE8s -= amount + ICP_LEDGER_FEE;
    state.withdrawals = [...state.withdrawals, { timestamp: nowNs(), amountE8s: amount, blockIndex }];
    return { __kind__: "ok", ok: blockIndex };
  },
  getPublicTreasuryInfo: async () => ({
    icpAccount: state.treasuryConfig.icpAccount,
    tokenAccounts: PAY_TOKEN_ORDER.map((token) => ({
      token,
      account: state.treasuryConfig.icpAccount,
    })),
  }),
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
    ["icrc1:max_supply", { __kind__: "Nat", Nat: MAX_SUPPLY }],
  ],
  icrc1_minting_account: async () => MINTING_ACCOUNT,
  icrc1_name: async () => TOKEN_NAME,
  icrc1_supported_standards: async () => STANDARDS,
  icrc1_symbol: async () => TTTI_SYMBOL,
  icrc1_total_supply: async () => mockTotalSupply(),
  icrc1_transfer: async (args) =>
    isMintingAccount(args.to)
      ? { __kind__: "Err", Err: MINTING_REFUSAL }
      : { __kind__: "Ok", Ok: 9n },
  icrc2_allowance: async () => ({ allowance: 0n }),
  icrc2_approve: async () => ({ __kind__: "Ok", Ok: 9n }),
  icrc2_transfer_from: async (args) =>
    isMintingAccount(args.to)
      ? { __kind__: "Err", Err: MINTING_REFUSAL }
      : { __kind__: "Ok", Ok: 9n },
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
  list_subaccounts: async () => [],
  refreshIcpPrice: async () => {
    const price = mockPrice();
    if (price.usable) {
      return {
        __kind__: "Err",
        Err: "The current ICP/USD rate is still valid; refresh is allowed only when the rate is expired or absent.",
      };
    }
    return { __kind__: "Ok", Ok: price };
  },
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
