import { Principal } from "@icp-sdk/core/principal";
import type {
  Account,
  AddLiquidityArgs,
  AddLiquidityError,
  AddLiquidityQuote,
  AddLiquidityQuoteArgs,
  ApprovePairError,
  AutonomyView,
  Block,
  BtcDepositResult,
  Buyback,
  BuybackError,
  BuybackFunding,
  BuybackMass,
  BuybackPayoutAttempt,
  BuybackQuote,
  BonusClaimView,
  Contact,
  Conversion,
  CounterToken,
  CyclesShareView,
  DcBatch,
  DepositEntry,
  DepositTracking,
  DexAccount,
  DexBalanceView,
  DexConfig,
  DexDepositError,
  DexTokenInfo,
  DexTransferView,
  DexWithdrawError,
  ExtendLockError,
  GetBlocksArgs,
  IcpPrice,
  LiquidityInjection,
  LpBonusView,
  MintFeeClaimView,
  MintFeeLpView,
  MintTreasuryAccount,
  OwnerDestinationView,
  OwnerSendView,
  PairRequestView,
  PayTokenStatus,
  PoolMinimums,
  PoolTokenView,
  PoolView,
  PositionBonusWeight,
  PositionView,
  ProtocolLiquidityView,
  PurchaseAcknowledgement,
  PurchaseResult,
  PurchaseTrace,
  RefusePairError,
  RemoveLiquidityError,
  RequestPairArgs,
  RequestPairError,
  RequestedToken,
  ReserveWithdrawal,
  SetAsideView,
  ShareChange,
  ReservedReconciliation,
  ReviewResult,
  SwapError,
  SwapQuote,
  SweepToken,
  TokenMinimums,
  TokenPrice,
  TopUpAttempt,
  TopUpRecord,
  TransferReview,
  TreasuryConfig,
  TreasurySweepView,
  UpgradeReadiness,
  UsdGauge,
  Value__1,
  WeeklyAllocation,
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
  DexToken,
  DcTrigger,
  DexTransferDirection,
  FeeTier,
  HolderKind,
  OwnerRevenueError,
  PayToken,
  PoolKind,
  PoolSide,
  PoolStatus,
  PriceSource,
  ReconcileError,
  RemovePairError,
  ReviewError,
  SetMinimumsError,
  SweepStatus,
  TransferKind,
  UserRole,
} from "../backend";
import {
  BTC_DEFAULT_CHECK_FEE_SATS,
  BTC_DEFAULT_DEPOSIT_MIN_SATS,
  BTC_DEFAULT_MIN_CONFIRMATIONS,
  BUYER_PRICE_USD,
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_MINTER_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDT_LEDGER_CANISTER_ID,
  CK_FEE_BPS,
  CYCLES_FEE_BPS,
  CYCLES_FEE_TEXT,
  CYCLES_TOP_UP_THRESHOLD,
  ICP_DIVISOR,
  LEGACY_TTTI_DECIMALS,
  MIN_PURCHASE,
  PAY_TOKENS,
  PAY_TOKEN_ORDER,
  RESERVE_FLOOR_E8S,
  SWAP_FEE_LP_PERCENT,
  SWAP_FEE_PERMANENT_PERCENT,
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

/** Result type of a backend method; generated Result_N names get renumbered. */
type Outcome<K extends keyof backendInterface> = Awaited<ReturnType<backendInterface[K]>>;

/** TransferReview.token is a DexToken; payment tokens map onto it. */
const DEX_OF_PAY: Record<PayToken, DexToken> = {
  [PayToken.icp]: DexToken.icp,
  [PayToken.ckbtc]: DexToken.ckbtc,
  [PayToken.ckusdc]: DexToken.ckusdc,
  [PayToken.ckusdt]: DexToken.ckusdt,
};

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
const TOP_UP_THRESHOLD = CYCLES_TOP_UP_THRESHOLD;
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
  cyclesBalance: 24_820_000_000_000n,
  reserveBalanceE8s: 200_000_000n,
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
    bonusClaimsInFlight: [],
    protocolFeeLocks: [],
    dcSendsInFlight: [],
    ownerSendsInFlight: [],
    sweepStatus: mockSweep.status,
    mintFeeClaimsInFlight: [],
    injectionsInFlight: [],
  };
}

/** Same refusal order as the backend: paused, no purchase in flight, no open trace. */
function mockReconcileReserved(): Outcome<"reconcileReserved"> {
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
    token: DexToken.icp,
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
    token: DexToken.ckbtc,
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
    token: DexToken.ckbtc,
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
    token: DexToken.ckbtc,
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
    (kind === TransferKind.BB && mockBuybacks.some((b) => b.id === purchaseId)) ||
    ((kind === TransferKind.DD || kind === TransferKind.DW) &&
      mockDexTransfers.some((t) => t.n === purchaseId)) ||
    (kind === TransferKind.DQ &&
      mockPairRequests.some((r) => r.id === purchaseId && r.status.__kind__ === "approved")) ||
    (kind === TransferKind.DC && mockDcSends.some((d) => d.n === purchaseId)) ||
    (kind === TransferKind.DL && mockBonusClaims.some((c) => c.n === purchaseId)) ||
    ((kind === TransferKind.OW || kind === TransferKind.SR) &&
      mockOwnerSends.some((s) => s.id === purchaseId)) ||
    (kind === TransferKind.MF && mockMintFeeClaims.some((c) => c.n === purchaseId));
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
  if (kind === TransferKind.DD || kind === TransferKind.DW || kind === TransferKind.DQ) {
    dexMarkArrived(kind, purchaseId, block);
  }
  if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeArrived(kind, purchaseId, block);
  if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, block);
  if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, block);
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
  if (kind === TransferKind.DD || kind === TransferKind.DW) {
    // DD: nothing credited; DW: the reserved amount goes back to available.
    dexMarkNotArrived(kind, purchaseId);
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
  if (kind === TransferKind.DQ) dexMarkNotArrived(kind, purchaseId);
  if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeNotArrived(kind, purchaseId);
  if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, null);
  if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, null);
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
  "",
  "## DEX balances (lot 2)",
  "- Per-user deposit subaccount: [0xDD, principal length, principal bytes, zero padding] (32 bytes), recomputable by anyone, no secret.",
  "- getDexTokens() : [DexTokenInfo] — TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT with ledger, decimals, fee, minimumDeposit and minimumWithdrawal.",
  "- getDexDepositAccount(owner) : DexAccount; getDexPoolAccount(poolId) : ?DexAccount.",
  "- getDexBalances(owner) : [DexBalanceView] — public, one row per token with available and reserved; getDexTransfers(owner) : [DexTransferView] — public.",
  "- depositToDex({ token; amount }) — DD: icrc2_transfer_from of amount (the user approves amount plus the ledger fee), memo TTTI-DD-<n> with created_at_time; credits available. Errors: #anonymous, #amountTooSmall, #transferInProgress, #insufficientAllowance, #insufficientFunds, #ledgerError.",
  "- withdrawFromDex({ token; amount }) — DW: available -> reserved, transfer of amount minus the ledger fee to the owner, memo TTTI-DW-<n>; Ok: final debit, Err: given back. Errors: #anonymous, #amountTooSmall, #insufficientBalance, #transferInProgress, #ledgerError.",
  "- PairRequestView.refundStatus: #none, #inProgress, #needsReview or #refunded(block); the DQ refund of an approved request uses memo TTTI-DQ-<request id>.",
  "- To review adds DD, DW (id = transfer n) and DQ (id = request id). Arrived: DD credits, DW final debit, DQ #refunded. Not arrived: DD nothing credited, DW given back, DQ new attempt.",
  "",
  "## DEX liquidity and swaps (lot 3)",
  "- PoolStatus: #filling, #active or #removed. An approved pool starts #filling with zero reserves and shares; several users add liquidity while it fills. Swaps stay closed until the reserves total 100 USD, both sides combined; the pool opens (#active) as soon as that value is reached.",
  "- USD value: TTTI-T at a fixed 10,000 USD; ICP, ckBTC, ckUSDC and ckUSDT at the hourly stored rate, valid 1 h plus 5 minutes. Missing or expired rate: no opening, gauge valueAvailable = false (value momentarily unavailable).",
  "- PoolView adds reserve0, reserve1, totalShares, lockedShares, protocolFee0, protocolFee1 and gauge : UsdGauge { currentUsdE8; targetUsdE8; remainingUsdE8; valueAvailable; missingRate }.",
  "- quoteAddLiquidity({ poolId; side; amount; counterAmount }) -> AddLiquidityQuote — first deposit: counterAmount required, fixes the ratio, at least 10 times the minimum locked liquidity; shares = floor(sqrt(A x B)) minus the minimum shares locked to the contract forever. Later deposits follow the reserve ratio (counter amount rounded up); counterAmount, when given, is the maximum accepted.",
  "- addLiquidity({ poolId; side; amount; counterAmount; lockDurationNs }) -> AddLiquidityResult — from internal balances; one position per add, locked 24 h minimum, 5 years maximum. Errors: #anonymous, #poolNotFound, #poolRemoved, #minimumsNotSet, #unsupportedToken, #zeroAmount, #counterAmountRequired, #insufficientBalance, #belowMinimum, #ratioMismatch, #lockTooShort, #lockTooLong, #zeroShares, #operationInProgress.",
  "- removeLiquidity(positionId) -> RemoveLiquidityResult — owner only, after unlockAt, or at any time on a removed pair; pro rata amounts (rounded down) credited to internal balances.",
  "- extendLock(positionId, newUnlockAt) -> PositionView — owner only; never shorter, at most now + 5 years.",
  "- getDexPosition(positionId) : ?PositionView; listPoolPositions(poolId) and listDexPositionsOf(owner) : [PositionView] — public (principal, shares, amounts, lock, unlockAt, isCreator). Creator/admin positions follow the same rules; no admin function acts on other positions.",
  "- quoteSwap(poolId, tokenIn, amountIn, slippageBps) -> SwapQuote and swap(poolId, tokenIn, amountIn, minAmountOut, deadline) -> SwapResult — constant product on an open pool, from internal balances; fee 0.3 % for the 7 starting pairs (0.05 / 0.3 / 1 % tiers for added pairs), rounded up; 70 % stays in the reserves for LPs, 30 % becomes permanent liquidity in the same pool (counted in protocolFee0/1). Deadline at most 5 minutes after the call. Errors: #poolFilling (with the gauge), #poolRemoved, #slippageExceeded, #deadlineExceeded, #deadlineTooFar, #invalidSlippage, #insufficientBalance, #insufficientLiquidity, #tokenNotInPool, #zeroAmount.",
  "",
  "## Cycles autonomy and protocol liquidity (lot 4)",
  "- The cycles reserve has no withdrawal path. CyclesStatus has no excess or withdrawal fields. setTreasuryConfig and setPayTokenAccount are removed.",
  "- getCyclesStatus() : CyclesStatus (public) — topUpThreshold is 20 T cycles: below it, reserve ICP is converted into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP.",
  "- getCyclesAutonomy() : AutonomyView (admin) — cycles balance, reserve ICP and its cycles estimate at the CMC rate, 7- and 30-day average consumption per day, autonomy in days (target 90), sample count and oldest sample.",
  "- Read-only history: getCyclesShare(), getCyclesShareHistory(), getLastWeeklyAllocation(), listWeeklyAllocations() and listDcBatches() keep past records; no new share change, weekly allocation or DC batch is created.",
  "- getMintTreasuryAccounts() : [MintTreasuryAccount] (admin) — the former internal MINT-TREASURY-<token> subaccounts, emptied once by the treasury sweep; legacyExternalAccount is the old admin-set account.",
  "- Native swap fees: 70 % stays in the reserves for liquidity providers, 30 % is added as permanent liquidity in the same pool; nothing goes to cycles and nothing is converted to ICP.",
  "- getProtocolLiquidity() : [ProtocolLiquidityView] (public) — protocol-owned shares per pool, counted in totalShares with no position and locked forever: current amounts, the parts from fees and from the treasury, last addition.",
  "- getMyLpBonus() : LpBonusView (caller) and claimLpBonus() -> ClaimBonusResult — bonuses already earned stay claimable (memo TTTI-DL-<n>); swap fees credit no new bonus. Errors: #anonymous, #nothingToClaim, #belowMinimum { minimumE8s }, #claimInProgress.",
  "",
  "## Mint revenue (owner destinations, OW / SR)",
  "- A mint is paid 101 for 100: 100/101 of the paid amount goes, in the paid token, to the owner destination account set for that token; 1/101 is the mint fee.",
  "- setOwnerDestination(token, account) -> OwnerDestinationResult (admin) — errors #notAdmin, #anonymousOwner, #invalidSubaccount, #contractAccount; an accumulated amount is sent as soon as a destination is set (source #accumulated).",
  "- clearOwnerDestination(token) -> OwnerDestinationResult (admin) — #notConfigured when none is set; later owner shares accumulate.",
  "- listOwnerDestinations() : [OwnerDestinationView] (admin) — token, account, setAt, accumulated. getOwnerAccumulated() : [OwnerAccumulated] (admin).",
  "- listOwnerSends(offset, limit) : OwnerSendPage (admin) — newest first; id, token, amount, fee, destination, source (#mint(id), #accumulated, #treasurySweep), status (#pending, #sent(block), #needsReview, #failed), block, memoText (TTTI-OW-<n> or TTTI-SR-<n>), createdAtTimeNs, attempt, sends, lastError. Sends use lib/retry.mo.",
  "- getTreasurySweepStatus() : TreasurySweepView (admin) — one-time sweep of the internal mint treasuries: ICP first tops up the cycles reserve to 2 ICP (reserveTopUpE8s, block, memo), then each balance goes to its owner destination; per token #pending, #waitingDestination, #nothingToSend, #sending(send id) or #sent(send id); overall #notStarted, #toppingUpReserve, #sending or #completed.",
  "",
  "## Mint fee halves (MF, set-aside amounts, injections)",
  "- The 1/101 mint fee is split in two halves in the paid token, for the lowest-liquidity TTTI-T pair of that token.",
  "- Half A goes to that pair's liquidity providers pro rata; when the pair has none, it is set aside. getMyMintFees() : MintFeeLpView (caller) — balances { token; claimable; claimed } and claims.",
  "- claimMintFee(token) -> ClaimMintFeeResult — sends the whole claimable amount of that token (memo TTTI-MF-<n>). Errors: #anonymous, #nothingToClaim, #belowLedgerFee { fee }, #claimInProgress.",
  "- Half B is set aside until worth 0.001 TTTI-T (10 USD), then 50 % is swapped into TTTI-T (ICPSwap, then native pools) at bounded slippage and added with the other 50 % as permanent liquidity. A missing or expired rate waits. No TTTI-T is created for pools.",
  "- getSetAsideAmounts() : [SetAsideView] (public) — token, amount, valueUsdE8, thresholdUsdE8, totalReceived, totalInjected, lastInjectionAt, targetPoolId.",
  "- listLiquidityInjections(offset, limit) : InjectionPage (public) — newest first; token, poolId, venue (#native(poolId) or #icpswap(principal)), amountIn, swapAmountIn, pairAmountIn, minTttiOut, tttiReceived, used0, used1, liquidityShares, status (#swapping, #addingLiquidity, #completed, #needsReview, #failed).",
  "",
  "## To review",
  "- To review adds OW (id = owner send id), SR (id = sweep send id) and MF (id = claim n), next to the past DC and DL items. Arrived records the block; Not arrived opens a new attempt sent by the timer; markRefundedManually returns #notApplicable.",
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
    token: DEX_OF_PAY[b.tokenReturned],
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

// --- DEX lot 1: pair registry and pair requests (simulated) ---------------

const DEX_TTTI_MIN_LOCKED = 10_000n; // 0.0001 TTTI-T
const DEX_REQUEST_DEPOSIT = 50_000n; // 0.0005 TTTI-T
const DEX_FIRST_DEPOSIT_MULTIPLIER = 10n;
const DEX_BADGE_NS = 30n * 24n * HOUR_NS;
const DEX_COOLDOWN_NS = 7n * 24n * HOUR_NS;
const DEX_MAX_PENDING = 2n;
const DEX_MESSAGE_MAX = 500n;
const DEX_REASON_MAX = 300n;
const DEX_PROTOCOL_STATEMENT =
  "The protocol places no price-based order and mints no TTTI-T for pools.";
const DEX_LOCKED_SHARES_STATEMENT =
  "The minimum locked shares belong to the contract forever.";
const DEX_APPROVAL_STATEMENT = "Approval of a pair is not a recommendation.";
const DEX_USD_RATE_SCALE = 100_000_000n; // usdE8 = USD x 1e8
const DEX_LAUNCH_MIN_TOTAL_USD_E8 = 100n * DEX_USD_RATE_SCALE; // 100 USD
const DEX_TTTI_T_USD_E8 = 10_000n * DEX_USD_RATE_SCALE; // 10,000 USD fixed
const DEX_LAUNCH_DEPTH_STATEMENT =
  "The first deposit that launches a pool must be worth at least 100 USD in total, both sides combined.";
const DEX_FEE_BPS: Record<FeeTier, bigint> = {
  [FeeTier.bps5]: 5n,
  [FeeTier.bps30]: 30n,
  [FeeTier.bps100]: 100n,
};
// DEX lot 3: position locks, swap deadline and fee split.
const DEX_MIN_LOCK_NS = 24n * HOUR_NS; // 24 h
const DEX_MAX_LOCK_NS = 1_826n * 24n * HOUR_NS; // 5 years (1826 days)
const DEX_SWAP_DEADLINE_MAX_NS = 5n * 60n * 1_000_000_000n; // 5 minutes
const DEX_LP_FEE_SHARE_PERCENT = SWAP_FEE_LP_PERCENT;
/** 30 % of each swap fee becomes permanent liquidity in the same pool. */
const DEX_PROTOCOL_FEE_SHARE_PERCENT = SWAP_FEE_PERMANENT_PERCENT;
const DEX_MAX_SLIPPAGE_BPS = 5_000n;
const DEX_BPS = 10_000n;

const dexLabelBytes = (label: string, tail: bigint): Uint8Array => {
  const bytes = new Uint8Array(32);
  bytes.set(new TextEncoder().encode(label).slice(0, 24));
  let value = tail;
  for (let i = 31; i >= 24; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
};
const dexHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const DEX_DEPOSIT_ACCOUNT = {
  owner: TTTI_CANISTER,
  subaccount: dexLabelBytes("DEX-PAIR-REQUEST-DEPOSIT", 0n),
};

const dexToken = (
  ledgerId: Principal,
  symbol: string,
  decimals: number,
  isTttiT = false,
): PoolTokenView => ({ ledgerId, symbol, decimals, isTttiT });

const DEX_TTTI = dexToken(TTTI_CANISTER, TTTI_SYMBOL, TTTI_DECIMALS, true);
const DEX_ICP = dexToken(ICP_CANISTER, "ICP", 8);
const DEX_CKBTC = dexToken(Principal.fromText(CKBTC_LEDGER_CANISTER_ID), "ckBTC", 8);
const DEX_CKUSDC = dexToken(Principal.fromText(CKUSDC_LEDGER_CANISTER_ID), "ckUSDC", 6);
const DEX_CKUSDT = dexToken(Principal.fromText(CKUSDT_LEDGER_CANISTER_ID), "ckUSDT", 6);

const mockPools: Array<PoolView> = [];
let nextPoolId = 0n;
const mockPairRequests: Array<PairRequestView> = [];
let nextPairRequestId = 1n;
let nextDexBlock = 4_200n;

const dexSameLedger = (a: PoolTokenView, b: PoolTokenView) =>
  a.ledgerId.toText() === b.ledgerId.toText();
const dexSamePair = (
  a0: PoolTokenView,
  a1: PoolTokenView,
  b0: PoolTokenView,
  b1: PoolTokenView,
) =>
  (dexSameLedger(a0, b0) && dexSameLedger(a1, b1)) ||
  (dexSameLedger(a0, b1) && dexSameLedger(a1, b0));

function dexMinimums(
  token0: PoolTokenView,
  token1: PoolTokenView,
  minimums: TokenMinimums | null,
): PoolMinimums {
  if (token0.isTttiT || token1.isTttiT) {
    return token0.isTttiT
      ? { token0: DEX_TTTI_MIN_LOCKED }
      : { token1: DEX_TTTI_MIN_LOCKED };
  }
  return minimums ? { token0: minimums.token0, token1: minimums.token1 } : {};
}

const dexFirstDeposit = (m: PoolMinimums): PoolMinimums => ({
  ...(m.token0 !== undefined ? { token0: m.token0 * DEX_FIRST_DEPOSIT_MULTIPLIER } : {}),
  ...(m.token1 !== undefined ? { token1: m.token1 * DEX_FIRST_DEPOSIT_MULTIPLIER } : {}),
});

function dexCreatePool(
  token0: PoolTokenView,
  token1: PoolTokenView,
  feeTier: FeeTier,
  createdAt: bigint,
  request?: { id: bigint; minimums: TokenMinimums | null },
): PoolView {
  const id = nextPoolId++;
  const subaccount = dexLabelBytes("DEX-POOL", id);
  const kind =
    token0.isTttiT || token1.isTttiT ? PoolKind.tttiPair : PoolKind.utilityPair;
  const minimumLocked = dexMinimums(token0, token1, request?.minimums ?? null);
  const pool: PoolView = {
    id,
    token0,
    token1,
    feeTier,
    feeBps: DEX_FEE_BPS[feeTier],
    kind,
    status: PoolStatus.filling,
    createdAt,
    reserve0: 0n,
    reserve1: 0n,
    totalShares: 0n,
    lockedShares: 0n,
    protocolFee0: 0n,
    protocolFee1: 0n,
    gauge: {
      currentUsdE8: 0n,
      targetUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
      remainingUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
      valueAvailable: true,
      missingRate: { token0: false, token1: false },
    },
    subaccount,
    subaccountText: dexHex(subaccount),
    poolAccount: { owner: TTTI_CANISTER, subaccount },
    minimumLocked,
    firstDepositMinimum: dexFirstDeposit(minimumLocked),
    minimumsSet: kind === PoolKind.tttiPair || !!request?.minimums,
    lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
    launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
    newPairBadgeActive: false,
    acceptsSwaps: false,
    acceptsDeposits: true,
    acceptsWithdrawals: true,
    ...(request
      ? {
          requestId: request.id,
          approvalStatement: DEX_APPROVAL_STATEMENT,
          newPairBadgeUntil: createdAt + DEX_BADGE_NS,
        }
      : {}),
  };
  mockPools.push(pool);
  return pool;
}

/** Persists #filling -> #active (lot 3), then returns the view with a fresh gauge. */
const dexPoolOut = (pool: PoolView): PoolView => {
  dexRefreshOpening(pool);
  return {
    ...pool,
    gauge: dexGauge(pool),
    acceptsSwaps: pool.status === PoolStatus.active,
    newPairBadgeActive:
      pool.newPairBadgeUntil !== undefined && pool.newPairBadgeUntil > nowNs(),
  };
};

const dexStartedAt = nowNs() - 2n * 24n * HOUR_NS;
for (const [a, b] of [
  [DEX_TTTI, DEX_ICP],
  [DEX_TTTI, DEX_CKBTC],
  [DEX_TTTI, DEX_CKUSDC],
  [DEX_TTTI, DEX_CKUSDT],
  [DEX_CKBTC, DEX_ICP],
  [DEX_CKUSDC, DEX_ICP],
  [DEX_CKUSDT, DEX_ICP],
] as const) {
  dexCreatePool(a, b, FeeTier.bps30, dexStartedAt);
}

/** Simulated ledgers: one lacks ICRC-2, one reuses the ICP symbol, one is unreachable. */
const DEX_NO_ICRC2_LEDGER = principalFrom(21);
const DEX_COPYCAT_LEDGER = principalFrom(20);
const DEX_UNREACHABLE_LEDGER = principalFrom(23);
const DEX_SIM_METADATA: Record<string, Omit<RequestedToken, "ledgerId">> = {
  [DEX_COPYCAT_LEDGER.toText()]: { name: "Internet Computer", symbol: "ICP", decimals: 8, fee: 10_000n },
  [principalFrom(22).toText()]: { name: "Lumen", symbol: "LUMEN", decimals: 8, fee: 10_000n },
};

function dexReadToken(ledgerId: Principal): RequestedToken {
  const known = [DEX_TTTI, DEX_ICP, DEX_CKBTC, DEX_CKUSDC, DEX_CKUSDT].find(
    (token) => token.ledgerId.toText() === ledgerId.toText(),
  );
  if (known) {
    return { ledgerId, name: known.symbol, symbol: known.symbol, decimals: known.decimals, fee: 10_000n };
  }
  const meta = DEX_SIM_METADATA[ledgerId.toText()];
  if (meta) return { ledgerId, ...meta };
  const symbol = `T${ledgerId.toText().slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
  return { ledgerId, name: `${symbol} token`, symbol, decimals: 8, fee: 10_000n };
}

const dexCopiedSymbolOf = (token: RequestedToken): string | undefined => {
  const symbol = token.symbol.toLowerCase();
  for (const pool of mockPools) {
    for (const side of [pool.token0, pool.token1]) {
      if (side.symbol.toLowerCase() === symbol && side.ledgerId.toText() !== token.ledgerId.toText()) {
        return side.symbol;
      }
    }
  }
  return undefined;
};

function dexCounterToken(counter: CounterToken): PoolTokenView | null {
  switch (counter.__kind__) {
    case "icp":
      return DEX_ICP;
    case "ckbtc":
      return DEX_CKBTC;
    case "ckusdc":
      return DEX_CKUSDC;
    case "ckusdt":
      return DEX_CKUSDT;
    case "tttiT":
      return DEX_TTTI;
    case "poolToken": {
      const ledger = counter.poolToken.toText();
      for (const pool of mockPools) {
        if (pool.status === PoolStatus.removed) continue;
        if (pool.token0.ledgerId.toText() === ledger) return pool.token0;
        if (pool.token1.ledgerId.toText() === ledger) return pool.token1;
      }
      return null;
    }
  }
}

const dexActivePool = (a: PoolTokenView, b: PoolTokenView, feeTier: FeeTier) =>
  mockPools.find(
    (pool) =>
      pool.status !== PoolStatus.removed &&
      pool.feeTier === feeTier &&
      dexSamePair(pool.token0, pool.token1, a, b),
  );

const dexRequestToken = (request: PairRequestView): PoolTokenView =>
  dexToken(request.token.ledgerId, request.token.symbol, request.token.decimals);

function dexNewRequest(
  requester: Principal,
  token: RequestedToken,
  counter: PoolTokenView,
  feeTier: FeeTier,
  message: string,
  createdAt: bigint,
): PairRequestView {
  const copiedSymbolOf = dexCopiedSymbolOf(token);
  const request: PairRequestView = {
    id: nextPairRequestId++,
    requester,
    token,
    counter,
    feeTier,
    feeBps: DEX_FEE_BPS[feeTier],
    kind: counter.isTttiT ? PoolKind.tttiPair : PoolKind.utilityPair,
    message,
    createdAt,
    checks: {
      icrc1: true,
      icrc2: true,
      metadataRead: true,
      pairUnique: true,
      ...(copiedSymbolOf ? { copiedSymbolOf } : {}),
    },
    copiedSymbol: copiedSymbolOf !== undefined,
    depositAmount: DEX_REQUEST_DEPOSIT,
    depositBlock: nextDexBlock++,
    status: { __kind__: "pending", pending: null },
    refundStatus: { __kind__: "none", none: null },
  };
  mockPairRequests.push(request);
  return request;
}

dexNewRequest(
  HOLDER_2,
  dexReadToken(principalFrom(22)),
  DEX_TTTI,
  FeeTier.bps30,
  "Ledger with ICRC-1 and ICRC-2, metadata published.",
  nowNs() - 5n * HOUR_NS,
);
const dexRefusedSeed = dexNewRequest(
  HOLDER_3,
  dexReadToken(DEX_COPYCAT_LEDGER),
  DEX_CKUSDC,
  FeeTier.bps100,
  "",
  nowNs() - 3n * 24n * HOUR_NS,
);
dexRefusedSeed.status = {
  __kind__: "refused",
  refused: { reason: "The symbol copies ICP.", at: nowNs() - 2n * 24n * HOUR_NS },
};

function mockRequestPair(args: RequestPairArgs): Outcome<"requestPair"> {
  const err = (e: RequestPairError): Outcome<"requestPair"> => ({ __kind__: "err", err: e });
  if (BigInt(args.message.length) > DEX_MESSAGE_MAX) {
    return err({ __kind__: "messageTooLong", messageTooLong: { max: DEX_MESSAGE_MAX } });
  }
  if (args.ledgerId.isAnonymous()) {
    return err({ __kind__: "invalidToken", invalidToken: "The anonymous principal is not a ledger." });
  }
  const counter = dexCounterToken(args.counter);
  if (!counter) return err({ __kind__: "unknownCounterToken", unknownCounterToken: null });
  if (counter.ledgerId.toText() === args.ledgerId.toText()) {
    return err({ __kind__: "invalidToken", invalidToken: "The token and the counter token are the same ledger." });
  }
  if (args.ledgerId.toText() === DEX_UNREACHABLE_LEDGER.toText()) {
    return err({ __kind__: "ledgerUnreachable", ledgerUnreachable: "Canister has no wasm module." });
  }
  if (args.ledgerId.toText() === DEX_NO_ICRC2_LEDGER.toText()) {
    return err({ __kind__: "missingStandards", missingStandards: { icrc1: true, icrc2: false } });
  }
  const token = dexReadToken(args.ledgerId);
  const tokenView = dexToken(token.ledgerId, token.symbol, token.decimals, token.ledgerId.toText() === TTTI_CANISTER.toText());
  const pool = dexActivePool(tokenView, counter, args.feeTier);
  const pending = mockPairRequests.find(
    (r) =>
      r.status.__kind__ === "pending" &&
      r.feeTier === args.feeTier &&
      dexSamePair(dexRequestToken(r), r.counter, tokenView, counter),
  );
  if (pool || pending) {
    return err({
      __kind__: "pairExists",
      pairExists: {
        ...(pool ? { poolId: pool.id } : {}),
        ...(pending ? { requestId: pending.id } : {}),
      },
    });
  }
  const mine = mockPairRequests.filter((r) => r.requester.toText() === CALLER.toText());
  if (BigInt(mine.filter((r) => r.status.__kind__ === "pending").length) >= DEX_MAX_PENDING) {
    return err({ __kind__: "tooManyPending", tooManyPending: { max: DEX_MAX_PENDING } });
  }
  for (const r of mine) {
    if (r.status.__kind__ === "refused" && r.status.refused.at + DEX_COOLDOWN_NS > nowNs()) {
      return err({ __kind__: "cooldown", cooldown: { until: r.status.refused.at + DEX_COOLDOWN_NS } });
    }
  }
  const request = dexNewRequest(CALLER, token, counter, args.feeTier, args.message, nowNs());
  return { __kind__: "ok", ok: request };
}

function mockApprovePair(requestId: bigint, minimums: TokenMinimums | null): Outcome<"approvePair"> {
  const err = (e: ApprovePairError): Outcome<"approvePair"> => ({ __kind__: "err", err: e });
  const request = mockPairRequests.find((r) => r.id === requestId);
  if (!request) return err({ __kind__: "requestNotFound", requestNotFound: null });
  if (request.status.__kind__ !== "pending") return err({ __kind__: "notPending", notPending: null });
  if (request.kind === PoolKind.tttiPair && minimums) {
    return err({ __kind__: "minimumsNotAllowed", minimumsNotAllowed: null });
  }
  if (minimums && (minimums.token0 === 0n || minimums.token1 === 0n)) {
    return err({ __kind__: "invalidMinimums", invalidMinimums: null });
  }
  const token = dexRequestToken(request);
  const existing = dexActivePool(token, request.counter, request.feeTier);
  if (existing) return err({ __kind__: "pairExists", pairExists: { poolId: existing.id } });
  const [token0, token1] = request.counter.isTttiT ? [request.counter, token] : [token, request.counter];
  const at = nowNs();
  const pool = dexCreatePool(token0, token1, request.feeTier, at, { id: request.id, minimums });
  request.status = { __kind__: "approved", approved: { poolId: pool.id, at } };
  // DQ refund of the deposit minus one TTTI-T fee (memo TTTI-DQ-<request id>).
  request.refundBlock = nextDexBlock++;
  request.refundStatus = { __kind__: "refunded", refunded: request.refundBlock };
  return { __kind__: "ok", ok: dexPoolOut(pool) };
}

function mockRefusePair(requestId: bigint, reason: string): Outcome<"refusePair"> {
  const err = (e: RefusePairError): Outcome<"refusePair"> => ({ __kind__: "err", err: e });
  const request = mockPairRequests.find((r) => r.id === requestId);
  if (!request) return err({ __kind__: "requestNotFound", requestNotFound: null });
  if (request.status.__kind__ !== "pending") return err({ __kind__: "notPending", notPending: null });
  const trimmed = reason.trim();
  if (trimmed === "") return err({ __kind__: "reasonRequired", reasonRequired: null });
  if (BigInt(trimmed.length) > DEX_REASON_MAX) {
    return err({ __kind__: "reasonTooLong", reasonTooLong: { max: DEX_REASON_MAX } });
  }
  request.status = { __kind__: "refused", refused: { reason: trimmed, at: nowNs() } };
  return { __kind__: "ok", ok: request };
}

function mockRemovePair(poolId: bigint): Outcome<"removePair"> {
  const pool = mockPools.find((p) => p.id === poolId);
  if (!pool) return { __kind__: "err", err: RemovePairError.poolNotFound };
  if (pool.status === PoolStatus.removed) {
    return { __kind__: "err", err: RemovePairError.alreadyRemoved };
  }
  pool.status = PoolStatus.removed;
  pool.removedAt = nowNs();
  pool.acceptsSwaps = false;
  pool.acceptsDeposits = false;
  pool.acceptsWithdrawals = true;
  return { __kind__: "ok", ok: dexPoolOut(pool) };
}

function mockSetUtilityPairMinimums(poolId: bigint, minimums: TokenMinimums): Outcome<"setUtilityPairMinimums"> {
  const pool = mockPools.find((p) => p.id === poolId);
  if (!pool) return { __kind__: "err", err: SetMinimumsError.poolNotFound };
  if (pool.status === PoolStatus.removed) return { __kind__: "err", err: SetMinimumsError.poolRemoved };
  if (pool.kind !== PoolKind.utilityPair) return { __kind__: "err", err: SetMinimumsError.notUtilityPair };
  if (pool.totalShares > 0n) {
    return { __kind__: "err", err: SetMinimumsError.liquidityAlreadyAdded };
  }
  if (minimums.token0 === 0n || minimums.token1 === 0n) {
    return { __kind__: "err", err: SetMinimumsError.invalidMinimums };
  }
  pool.minimumLocked = { token0: minimums.token0, token1: minimums.token1 };
  pool.firstDepositMinimum = dexFirstDeposit(pool.minimumLocked);
  pool.minimumsSet = true;
  return { __kind__: "ok", ok: dexPoolOut(pool) };
}

function mockDexConfig(): DexConfig {
  return {
    requestDeposit: DEX_REQUEST_DEPOSIT,
    depositAccount: DEX_DEPOSIT_ACCOUNT,
    maxPendingPerUser: DEX_MAX_PENDING,
    refusalCooldownNs: DEX_COOLDOWN_NS,
    messageMaxChars: DEX_MESSAGE_MAX,
    reasonMaxChars: DEX_REASON_MAX,
    newPairBadgeNs: DEX_BADGE_NS,
    tttiMinimumLocked: DEX_TTTI_MIN_LOCKED,
    firstDepositMultiplier: DEX_FIRST_DEPOSIT_MULTIPLIER,
    feeTiers: [FeeTier.bps5, FeeTier.bps30, FeeTier.bps100],
    protocolStatement: DEX_PROTOCOL_STATEMENT,
    lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
    approvalStatement: DEX_APPROVAL_STATEMENT,
    launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
    usdRateScale: DEX_USD_RATE_SCALE,
    tttiTUsdE8: DEX_TTTI_T_USD_E8,
    rateValidForNs: HOUR_NS,
    rateGraceNs: 5n * 60n * 1_000_000_000n,
    launchDepthStatement: DEX_LAUNCH_DEPTH_STATEMENT,
    minLockNs: DEX_MIN_LOCK_NS,
    maxLockNs: DEX_MAX_LOCK_NS,
    swapDeadlineMaxNs: DEX_SWAP_DEADLINE_MAX_NS,
    lpFeeSharePercent: DEX_LP_FEE_SHARE_PERCENT,
    protocolFeeSharePercent: DEX_PROTOCOL_FEE_SHARE_PERCENT,
  };
}

// --- DEX lot 2: deposit subaccounts, internal balances, DD / DW / DQ -------

const DEX_TOKEN_ORDER: Array<DexToken> = [
  DexToken.tttiT,
  DexToken.icp,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
];
const DEX_TOKEN_VIEW: Record<DexToken, PoolTokenView> = {
  [DexToken.tttiT]: DEX_TTTI,
  [DexToken.icp]: DEX_ICP,
  [DexToken.ckbtc]: DEX_CKBTC,
  [DexToken.ckusdc]: DEX_CKUSDC,
  [DexToken.ckusdt]: DEX_CKUSDT,
};
const PAY_OF_DEX: Record<Exclude<DexToken, DexToken.tttiT>, PayToken> = {
  [DexToken.icp]: PayToken.icp,
  [DexToken.ckbtc]: PayToken.ckbtc,
  [DexToken.ckusdc]: PayToken.ckusdc,
  [DexToken.ckusdt]: PayToken.ckusdt,
};

const dexTokenFee = (token: DexToken): bigint =>
  token === DexToken.tttiT ? state.fee : PAY_TOKENS[PAY_OF_DEX[token]].fee;

function dexTokenInfo(token: DexToken): DexTokenInfo {
  const view = DEX_TOKEN_VIEW[token];
  const fee = dexTokenFee(token);
  return {
    token,
    symbol: view.symbol,
    ledgerId: view.ledgerId,
    decimals: view.decimals,
    fee,
    minimumDeposit: 10n * fee,
    minimumWithdrawal: 10n * fee,
  };
}

/** [0xDD, principal length, principal bytes, zero padding]: 32 bytes, no secret. */
function dexUserSubaccount(owner: Principal): Uint8Array {
  const bytes = owner.toUint8Array();
  const out = new Uint8Array(32);
  out[0] = 0xdd;
  out[1] = bytes.length;
  out.set(bytes.slice(0, 30), 2);
  return out;
}

const dexDepositAccountOf = (owner: Principal): DexAccount => ({
  owner: TTTI_CANISTER,
  subaccount: dexUserSubaccount(owner),
});

type DexBalance = { available: bigint; reserved: bigint };
const mockDexBalances = new Map<string, Map<DexToken, DexBalance>>();
const mockDexTransfers: Array<DexTransferView> = [];
let nextDexTransferN = 1n;
/** Last TTTI-T allowance granted to the contract through icrc2_approve. */
let mockTttiAllowance = 0n;

function dexBalanceOf(owner: Principal, token: DexToken): DexBalance {
  let byToken = mockDexBalances.get(owner.toText());
  if (!byToken) {
    byToken = new Map();
    mockDexBalances.set(owner.toText(), byToken);
  }
  let balance = byToken.get(token);
  if (!balance) {
    balance = { available: 0n, reserved: 0n };
    byToken.set(token, balance);
  }
  return balance;
}

function dexBalancesView(owner: Principal): Array<DexBalanceView> {
  return DEX_TOKEN_ORDER.map((token) => {
    const balance = dexBalanceOf(owner, token);
    const view = DEX_TOKEN_VIEW[token];
    return {
      token,
      symbol: view.symbol,
      ledgerId: view.ledgerId,
      available: balance.available,
      reserved: balance.reserved,
    };
  });
}

function dexNewTransfer(
  direction: DexTransferDirection,
  owner: Principal,
  token: DexToken,
  amount: bigint,
  createdAt: bigint,
): DexTransferView {
  const n = nextDexTransferN++;
  const fee = dexTokenFee(token);
  const deposit = direction === DexTransferDirection.deposit;
  const transfer: DexTransferView = {
    n,
    direction,
    owner,
    token,
    amount,
    ledgerAmount: deposit ? amount : amount - fee,
    fee,
    from: deposit ? { owner } : dexDepositAccountOf(owner),
    to: deposit ? dexDepositAccountOf(owner) : { owner },
    memoText: `TTTI-${deposit ? "DD" : "DW"}-${n}`,
    createdAtTimeNs: createdAt,
    attempt: 1n,
    sends: 1n,
    status: { __kind__: "inProgress", inProgress: null },
  };
  mockDexTransfers.push(transfer);
  return transfer;
}

function dexTransferReview(t: DexTransferView, lastError: string): TransferReview {
  return {
    kind: t.direction === DexTransferDirection.deposit ? TransferKind.DD : TransferKind.DW,
    purchaseId: t.n,
    token: t.token,
    memoText: t.memoText,
    memoHex: memoHexOf(t.memoText),
    createdAtTimeNs: t.createdAtTimeNs,
    amount: t.ledgerAmount,
    fee: t.fee,
    destination: t.to,
    sends: t.sends,
    lastError,
    buyer: t.owner,
  };
}

function mockDepositToDex(token: DexToken, amount: bigint): Outcome<"depositToDex"> {
  const err = (e: DexDepositError): Outcome<"depositToDex"> => ({ __kind__: "err", err: e });
  const info = dexTokenInfo(token);
  if (amount < info.minimumDeposit) {
    return err({ __kind__: "amountTooSmall", amountTooSmall: { minimum: info.minimumDeposit } });
  }
  if (token === DexToken.tttiT) {
    const required = amount + info.fee;
    if (mockTttiAllowance < required) {
      return err({
        __kind__: "insufficientAllowance",
        insufficientAllowance: { allowance: mockTttiAllowance, required },
      });
    }
    if (required > 250_000n) {
      return err({ __kind__: "insufficientFunds", insufficientFunds: { balance: 250_000n } });
    }
    mockTttiAllowance = 0n;
  }
  const transfer = dexNewTransfer(DexTransferDirection.deposit, CALLER, token, amount, nowNs());
  transfer.status = { __kind__: "completed", completed: nextDexBlock++ };
  dexBalanceOf(CALLER, token).available += amount;
  return { __kind__: "ok", ok: transfer };
}

function mockWithdrawFromDex(token: DexToken, amount: bigint): Outcome<"withdrawFromDex"> {
  const err = (e: DexWithdrawError): Outcome<"withdrawFromDex"> => ({ __kind__: "err", err: e });
  const info = dexTokenInfo(token);
  if (amount < info.minimumWithdrawal) {
    return err({ __kind__: "amountTooSmall", amountTooSmall: { minimum: info.minimumWithdrawal } });
  }
  const balance = dexBalanceOf(CALLER, token);
  if (balance.available < amount) {
    return err({ __kind__: "insufficientBalance", insufficientBalance: { available: balance.available } });
  }
  // available -> reserved, then the Ok is the final debit.
  balance.available -= amount;
  const transfer = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, token, amount, nowNs());
  transfer.status = { __kind__: "completed", completed: nextDexBlock++ };
  return { __kind__: "ok", ok: transfer };
}

/** Arrived: DD credits, DW final debit of the reserved amount, DQ refunded. */
function dexMarkArrived(kind: TransferKind, id: bigint, block: bigint) {
  if (kind === TransferKind.DQ) {
    const request = mockPairRequests.find((r) => r.id === id);
    if (request) {
      request.refundBlock = block;
      request.refundStatus = { __kind__: "refunded", refunded: block };
    }
    return;
  }
  const transfer = mockDexTransfers.find((t) => t.n === id);
  if (!transfer) return;
  transfer.status = { __kind__: "completed", completed: block };
  const balance = dexBalanceOf(transfer.owner, transfer.token);
  if (kind === TransferKind.DD) balance.available += transfer.amount;
  else balance.reserved -= transfer.amount;
}

/** Not arrived: DD nothing credited, DW given back, DQ new attempt sent by the timer. */
function dexMarkNotArrived(kind: TransferKind, id: bigint) {
  if (kind === TransferKind.DQ) {
    const request = mockPairRequests.find((r) => r.id === id);
    if (request) request.refundStatus = { __kind__: "inProgress", inProgress: null };
    return;
  }
  const transfer = mockDexTransfers.find((t) => t.n === id);
  if (!transfer) return;
  transfer.status = { __kind__: "failed", failed: "Not arrived (admin check)" };
  if (kind === TransferKind.DW) {
    const balance = dexBalanceOf(transfer.owner, transfer.token);
    balance.reserved -= transfer.amount;
    balance.available += transfer.amount;
  }
}

// Seeds: completed DD deposits, one DW and one DD to review (outcome unknown
// after 23 h), and an approved request whose DQ refund is to review.
{
  const ago = (hours: bigint) => nowNs() - hours * HOUR_NS;
  const seedDone = (direction: DexTransferDirection, owner: Principal, token: DexToken, amount: bigint, hours: bigint) => {
    const t = dexNewTransfer(direction, owner, token, amount, ago(hours));
    t.status = { __kind__: "completed", completed: nextDexBlock++ };
    return t;
  };
  seedDone(DexTransferDirection.deposit, CALLER, DexToken.tttiT, 120_000n, 72n);
  seedDone(DexTransferDirection.deposit, CALLER, DexToken.icp, ICP_DIVISOR * 6n / 10n, 48n);
  dexBalanceOf(CALLER, DexToken.tttiT).available = 120_000n;
  dexBalanceOf(CALLER, DexToken.icp).available = ICP_DIVISOR / 2n;
  seedDone(DexTransferDirection.deposit, HOLDER_2, DexToken.ckbtc, 25_000n, 40n);
  dexBalanceOf(HOLDER_2, DexToken.ckbtc).available = 25_000n;

  const unknown = "Call timed out (outcome unknown)";
  const dw = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, DexToken.icp, ICP_DIVISOR / 10n, ago(25n));
  dw.status = { __kind__: "needsReview", needsReview: null };
  dw.sends = 4n;
  dw.lastError = unknown;
  dexBalanceOf(CALLER, DexToken.icp).reserved = ICP_DIVISOR / 10n;
  mockReviews.push(dexTransferReview(dw, unknown));

  const dd = dexNewTransfer(DexTransferDirection.deposit, HOLDER_2, DexToken.ckusdc, 5_000_000n, ago(26n));
  dd.status = { __kind__: "needsReview", needsReview: null };
  dd.sends = 3n;
  dd.lastError = unknown;
  mockReviews.push(dexTransferReview(dd, unknown));

  const approved = dexNewRequest(HOLDER_3, dexReadToken(principalFrom(24)), DEX_ICP, FeeTier.bps30, "", ago(30n));
  const pool = dexCreatePool(dexRequestToken(approved), DEX_ICP, approved.feeTier, ago(27n), {
    id: approved.id,
    minimums: { token0: 100_000n, token1: 100_000n },
  });
  approved.status = { __kind__: "approved", approved: { poolId: pool.id, at: ago(27n) } };
  approved.refundStatus = { __kind__: "needsReview", needsReview: null };
  const memoText = `TTTI-DQ-${approved.id}`;
  mockReviews.push({
    kind: TransferKind.DQ,
    purchaseId: approved.id,
    token: DexToken.tttiT,
    memoText,
    memoHex: memoHexOf(memoText),
    createdAtTimeNs: ago(26n),
    amount: DEX_REQUEST_DEPOSIT - state.fee,
    fee: state.fee,
    destination: { owner: HOLDER_3 },
    sends: 3n,
    lastError: unknown,
    buyer: HOLDER_3,
  });
}

// --- DEX lot 3: filling gauge, v2 liquidity, positions and swaps ----------

type DexPlan<T, E> = { __kind__: "ok"; ok: T } | { __kind__: "err"; err: E };
type DexPosition = {
  id: bigint;
  poolId: bigint;
  owner: Principal;
  shares: bigint;
  createdAt: bigint;
  unlockAt: bigint;
  isCreator: boolean;
};
const mockPositions: Array<DexPosition> = [];
let nextPositionId = 1n;
/** The mock caller is the admin/creator; its positions follow the same rules. */
const DEX_CREATOR = CALLER;

const dexCeilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b;
const dexMin = (a: bigint, b: bigint) => (a < b ? a : b);

/** Integer square root, rounded down. */
function dexIsqrt(n: bigint): bigint {
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}

function dexTokenOfView(view: PoolTokenView): DexToken | undefined {
  return DEX_TOKEN_ORDER.find((token) => dexSameLedger(DEX_TOKEN_VIEW[token], view));
}

/** TTTI-T fixed at 10,000 USD; other tokens at the mock hourly rate while usable. */
function dexUsdRate(view: PoolTokenView): bigint | undefined {
  const token = dexTokenOfView(view);
  if (token === undefined) return undefined;
  if (token === DexToken.tttiT) return DEX_TTTI_T_USD_E8;
  return mockPrice().usable ? MOCK_PAY_USD_E8[PAY_OF_DEX[token]] : undefined;
}

function dexGauge(pool: PoolView, reserve0 = pool.reserve0, reserve1 = pool.reserve1): UsdGauge {
  const rate0 = dexUsdRate(pool.token0);
  const rate1 = dexUsdRate(pool.token1);
  const targetUsdE8 = DEX_LAUNCH_MIN_TOTAL_USD_E8;
  if (rate0 === undefined || rate1 === undefined) {
    return {
      targetUsdE8,
      valueAvailable: false,
      missingRate: { token0: rate0 === undefined, token1: rate1 === undefined },
    };
  }
  const currentUsdE8 =
    (reserve0 * rate0) / 10n ** BigInt(pool.token0.decimals) +
    (reserve1 * rate1) / 10n ** BigInt(pool.token1.decimals);
  return {
    currentUsdE8,
    targetUsdE8,
    remainingUsdE8: currentUsdE8 >= targetUsdE8 ? 0n : targetUsdE8 - currentUsdE8,
    valueAvailable: true,
    missingRate: { token0: false, token1: false },
  };
}

const dexGaugeOpens = (gauge: UsdGauge) =>
  gauge.valueAvailable && (gauge.currentUsdE8 ?? 0n) >= gauge.targetUsdE8;

function dexRefreshOpening(pool: PoolView) {
  if (pool.status === PoolStatus.filling && dexGaugeOpens(dexGauge(pool))) {
    pool.status = PoolStatus.active;
    pool.acceptsSwaps = true;
  }
}

function dexPositionView(position: DexPosition): PositionView {
  const pool = mockPools.find((p) => p.id === position.poolId);
  const total = pool?.totalShares ?? 0n;
  const unlocked = nowNs() >= position.unlockAt;
  return {
    id: position.id,
    poolId: position.poolId,
    owner: position.owner,
    shares: position.shares,
    amount0: pool && total > 0n ? (position.shares * pool.reserve0) / total : 0n,
    amount1: pool && total > 0n ? (position.shares * pool.reserve1) / total : 0n,
    token0Symbol: pool?.token0.symbol ?? "",
    token1Symbol: pool?.token1.symbol ?? "",
    createdAt: position.createdAt,
    lockDurationNs: position.unlockAt - position.createdAt,
    unlockAt: position.unlockAt,
    isCreator: position.isCreator,
    unlocked,
    withdrawable: unlocked || pool?.status === PoolStatus.removed,
  };
}

type DexAddPlan = { pool: PoolView; token0: DexToken; token1: DexToken; quote: AddLiquidityQuote };

function dexPlanAdd(args: AddLiquidityQuoteArgs): DexPlan<DexAddPlan, AddLiquidityError> {
  const fail = (err: AddLiquidityError): DexPlan<DexAddPlan, AddLiquidityError> => ({ __kind__: "err", err });
  const pool = mockPools.find((p) => p.id === args.poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  if (pool.status === PoolStatus.removed) return fail({ __kind__: "poolRemoved", poolRemoved: null });
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (token0 === undefined || token1 === undefined) {
    return fail({ __kind__: "unsupportedToken", unsupportedToken: null });
  }
  if (args.amount === 0n) return fail({ __kind__: "zeroAmount", zeroAmount: null });
  const onToken0 = args.side === PoolSide.token0;
  const isFirstDeposit = pool.totalShares === 0n;
  let amount0: bigint;
  let amount1: bigint;
  let shares: bigint;
  let lockedShares = 0n;
  if (isFirstDeposit) {
    if (!pool.minimumsSet) return fail({ __kind__: "minimumsNotSet", minimumsNotSet: null });
    if (args.counterAmount === undefined) {
      return fail({ __kind__: "counterAmountRequired", counterAmountRequired: null });
    }
    if (args.counterAmount === 0n) return fail({ __kind__: "zeroAmount", zeroAmount: null });
    amount0 = onToken0 ? args.amount : args.counterAmount;
    amount1 = onToken0 ? args.counterAmount : args.amount;
    const first = pool.firstDepositMinimum;
    if (
      (first.token0 !== undefined && amount0 < first.token0) ||
      (first.token1 !== undefined && amount1 < first.token1)
    ) {
      return fail({
        __kind__: "belowMinimum",
        belowMinimum: {
          ...(first.token0 !== undefined ? { token0Minimum: first.token0 } : {}),
          ...(first.token1 !== undefined ? { token1Minimum: first.token1 } : {}),
        },
      });
    }
    // Minimum locked amounts; a single-side minimum takes the other side at the deposit ratio.
    const m0 = pool.minimumLocked.token0;
    const m1 = pool.minimumLocked.token1;
    const locked0 = m0 ?? (m1 !== undefined ? dexCeilDiv(m1 * amount0, amount1) : 0n);
    const locked1 = m1 ?? (m0 !== undefined ? dexCeilDiv(m0 * amount1, amount0) : 0n);
    lockedShares = dexIsqrt(locked0 * locked1);
    const total = dexIsqrt(amount0 * amount1);
    shares = total > lockedShares ? total - lockedShares : 0n;
  } else {
    if (pool.reserve0 === 0n || pool.reserve1 === 0n) {
      return fail({ __kind__: "zeroShares", zeroShares: null });
    }
    // Counter amount from the reserve ratio, rounded up in favor of the pool.
    amount0 = onToken0 ? args.amount : dexCeilDiv(args.amount * pool.reserve0, pool.reserve1);
    amount1 = onToken0 ? dexCeilDiv(args.amount * pool.reserve1, pool.reserve0) : args.amount;
    const counter = onToken0 ? amount1 : amount0;
    if (args.counterAmount !== undefined && counter > args.counterAmount) {
      return fail({ __kind__: "ratioMismatch", ratioMismatch: { requiredCounterAmount: counter } });
    }
    shares = dexMin(
      (amount0 * pool.totalShares) / pool.reserve0,
      (amount1 * pool.totalShares) / pool.reserve1,
    );
  }
  if (shares === 0n) return fail({ __kind__: "zeroShares", zeroShares: null });
  const gaugeAfter = dexGauge(pool, pool.reserve0 + amount0, pool.reserve1 + amount1);
  return {
    __kind__: "ok",
    ok: {
      pool,
      token0,
      token1,
      quote: {
        poolId: pool.id,
        isFirstDeposit,
        amount0,
        amount1,
        shares,
        lockedShares,
        totalSharesAfter: pool.totalShares + shares + lockedShares,
        gaugeAfter,
        opensPool: pool.status === PoolStatus.filling && dexGaugeOpens(gaugeAfter),
      },
    },
  };
}

function mockQuoteAddLiquidity(args: AddLiquidityQuoteArgs): Outcome<"quoteAddLiquidity"> {
  const plan = dexPlanAdd(args);
  return plan.__kind__ === "err" ? plan : { __kind__: "ok", ok: plan.ok.quote };
}

function mockAddLiquidity(owner: Principal, args: AddLiquidityArgs): Outcome<"addLiquidity"> {
  if (args.lockDurationNs < DEX_MIN_LOCK_NS) {
    return { __kind__: "err", err: { __kind__: "lockTooShort", lockTooShort: { minimumNs: DEX_MIN_LOCK_NS } } };
  }
  if (args.lockDurationNs > DEX_MAX_LOCK_NS) {
    return { __kind__: "err", err: { __kind__: "lockTooLong", lockTooLong: { maximumNs: DEX_MAX_LOCK_NS } } };
  }
  const plan = dexPlanAdd(args);
  if (plan.__kind__ === "err") return plan;
  const { pool, token0, token1, quote } = plan.ok;
  const balance0 = dexBalanceOf(owner, token0);
  const balance1 = dexBalanceOf(owner, token1);
  for (const [token, balance, required] of [
    [token0, balance0, quote.amount0],
    [token1, balance1, quote.amount1],
  ] as const) {
    if (balance.available < required) {
      return {
        __kind__: "err",
        err: { __kind__: "insufficientBalance", insufficientBalance: { token, available: balance.available, required } },
      };
    }
  }
  balance0.available -= quote.amount0;
  balance1.available -= quote.amount1;
  pool.reserve0 += quote.amount0;
  pool.reserve1 += quote.amount1;
  pool.totalShares = quote.totalSharesAfter;
  pool.lockedShares += quote.lockedShares;
  const now = nowNs();
  const position: DexPosition = {
    id: nextPositionId++,
    poolId: pool.id,
    owner,
    shares: quote.shares,
    createdAt: now,
    unlockAt: now + args.lockDurationNs,
    isCreator: owner.toText() === DEX_CREATOR.toText(),
  };
  mockPositions.push(position);
  return {
    __kind__: "ok",
    ok: {
      position: dexPositionView(position),
      amount0: quote.amount0,
      amount1: quote.amount1,
      shares: quote.shares,
      lockedShares: quote.lockedShares,
      pool: dexPoolOut(pool),
    },
  };
}

function mockRemoveLiquidity(positionId: bigint): Outcome<"removeLiquidity"> {
  const fail = (err: RemoveLiquidityError): Outcome<"removeLiquidity"> => ({ __kind__: "err", err });
  const index = mockPositions.findIndex((p) => p.id === positionId);
  if (index < 0) return fail({ __kind__: "positionNotFound", positionNotFound: null });
  const position = mockPositions[index];
  if (position.owner.toText() !== CALLER.toText()) {
    return fail({ __kind__: "notPositionOwner", notPositionOwner: null });
  }
  const pool = mockPools.find((p) => p.id === position.poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  // Removed pair: withdrawals stay open even for locked positions.
  if (pool.status !== PoolStatus.removed && nowNs() < position.unlockAt) {
    return fail({ __kind__: "positionLocked", positionLocked: { unlockAt: position.unlockAt } });
  }
  const amount0 = (position.shares * pool.reserve0) / pool.totalShares;
  const amount1 = (position.shares * pool.reserve1) / pool.totalShares;
  pool.reserve0 -= amount0;
  pool.reserve1 -= amount1;
  pool.totalShares -= position.shares;
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (token0 !== undefined) dexBalanceOf(position.owner, token0).available += amount0;
  if (token1 !== undefined) dexBalanceOf(position.owner, token1).available += amount1;
  mockPositions.splice(index, 1);
  return {
    __kind__: "ok",
    ok: { positionId, poolId: pool.id, shares: position.shares, amount0, amount1, pool: dexPoolOut(pool) },
  };
}

function mockExtendLock(positionId: bigint, newUnlockAt: bigint): Outcome<"extendLock"> {
  const fail = (err: ExtendLockError): Outcome<"extendLock"> => ({ __kind__: "err", err });
  const position = mockPositions.find((p) => p.id === positionId);
  if (!position) return fail({ __kind__: "positionNotFound", positionNotFound: null });
  if (position.owner.toText() !== CALLER.toText()) {
    return fail({ __kind__: "notPositionOwner", notPositionOwner: null });
  }
  if (newUnlockAt < position.unlockAt) {
    return fail({ __kind__: "cannotShortenLock", cannotShortenLock: { unlockAt: position.unlockAt } });
  }
  const maximumUnlockAt = nowNs() + DEX_MAX_LOCK_NS;
  if (newUnlockAt > maximumUnlockAt) {
    return fail({ __kind__: "lockTooLong", lockTooLong: { maximumUnlockAt } });
  }
  position.unlockAt = newUnlockAt;
  return { __kind__: "ok", ok: dexPositionView(position) };
}

type DexSwapPlan = { pool: PoolView; tokenOut: DexToken; inIsToken0: boolean; quote: SwapQuote };

function dexPlanSwap(
  poolId: bigint,
  tokenIn: DexToken,
  amountIn: bigint,
  slippageBps: bigint,
): DexPlan<DexSwapPlan, SwapError> {
  const fail = (err: SwapError): DexPlan<DexSwapPlan, SwapError> => ({ __kind__: "err", err });
  const pool = mockPools.find((p) => p.id === poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  if (pool.status === PoolStatus.removed) return fail({ __kind__: "poolRemoved", poolRemoved: null });
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (token0 === undefined || token1 === undefined) {
    return fail({ __kind__: "unsupportedToken", unsupportedToken: null });
  }
  if (tokenIn !== token0 && tokenIn !== token1) {
    return fail({ __kind__: "tokenNotInPool", tokenNotInPool: null });
  }
  dexRefreshOpening(pool);
  if (pool.status === PoolStatus.filling) {
    return fail({ __kind__: "poolFilling", poolFilling: { gauge: dexGauge(pool) } });
  }
  if (amountIn === 0n) return fail({ __kind__: "zeroAmount", zeroAmount: null });
  if (slippageBps > DEX_MAX_SLIPPAGE_BPS) {
    return fail({ __kind__: "invalidSlippage", invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS } });
  }
  const inIsToken0 = tokenIn === token0;
  const reserveIn = inIsToken0 ? pool.reserve0 : pool.reserve1;
  const reserveOut = inIsToken0 ? pool.reserve1 : pool.reserve0;
  // Constant product v2: fee rounded up, output rounded down.
  const fee = dexCeilDiv(amountIn * pool.feeBps, DEX_BPS);
  const net = amountIn - fee;
  const amountOut = reserveIn + net === 0n ? 0n : (reserveOut * net) / (reserveIn + net);
  if (amountOut === 0n || amountOut >= reserveOut) {
    return fail({ __kind__: "insufficientLiquidity", insufficientLiquidity: null });
  }
  const protocolFee = (fee * DEX_PROTOCOL_FEE_SHARE_PERCENT) / 100n;
  const ideal = reserveIn === 0n ? 0n : (net * reserveOut) / reserveIn;
  const priceImpactBps =
    ideal > amountOut ? dexCeilDiv((ideal - amountOut) * DEX_BPS, ideal) : 0n;
  return {
    __kind__: "ok",
    ok: {
      pool,
      tokenOut: inIsToken0 ? token1 : token0,
      inIsToken0,
      quote: {
        poolId: pool.id,
        tokenIn,
        tokenOut: inIsToken0 ? token1 : token0,
        amountIn,
        amountOut,
        fee,
        lpFee: fee - protocolFee,
        protocolFee,
        feeBps: pool.feeBps,
        priceImpactBps,
        slippageBps,
        minimumReceived: (amountOut * (DEX_BPS - slippageBps)) / DEX_BPS,
        maxDeadlineNs: nowNs() + DEX_SWAP_DEADLINE_MAX_NS,
      },
    },
  };
}

function mockQuoteSwap(poolId: bigint, tokenIn: DexToken, amountIn: bigint, slippageBps: bigint): Outcome<"quoteSwap"> {
  const plan = dexPlanSwap(poolId, tokenIn, amountIn, slippageBps);
  return plan.__kind__ === "err" ? plan : { __kind__: "ok", ok: plan.ok.quote };
}

function mockSwap(
  poolId: bigint,
  tokenIn: DexToken,
  amountIn: bigint,
  minAmountOut: bigint,
  deadline: bigint,
): Outcome<"swap"> {
  const fail = (err: SwapError): Outcome<"swap"> => ({ __kind__: "err", err });
  const plan = dexPlanSwap(poolId, tokenIn, amountIn, 0n);
  if (plan.__kind__ === "err") return plan;
  const { pool, tokenOut, inIsToken0, quote } = plan.ok;
  const now = nowNs();
  if (now > deadline) return fail({ __kind__: "deadlineExceeded", deadlineExceeded: { deadline, now } });
  const maximum = now + DEX_SWAP_DEADLINE_MAX_NS;
  if (deadline > maximum) return fail({ __kind__: "deadlineTooFar", deadlineTooFar: { maximum } });
  if (quote.amountOut < minAmountOut) {
    return fail({ __kind__: "slippageExceeded", slippageExceeded: { amountOut: quote.amountOut, minAmountOut } });
  }
  const balanceIn = dexBalanceOf(CALLER, tokenIn);
  if (balanceIn.available < amountIn) {
    return fail({ __kind__: "insufficientBalance", insufficientBalance: { available: balanceIn.available } });
  }
  balanceIn.available -= amountIn;
  dexBalanceOf(CALLER, tokenOut).available += quote.amountOut;
  // 70 % of the fee stays in the reserves for LPs; the 30 % permanent-liquidity part is counted apart.
  const toReserve = amountIn - quote.protocolFee;
  if (inIsToken0) {
    pool.reserve0 += toReserve;
    pool.protocolFee0 += quote.protocolFee;
    pool.reserve1 -= quote.amountOut;
  } else {
    pool.reserve1 += toReserve;
    pool.protocolFee1 += quote.protocolFee;
    pool.reserve0 -= quote.amountOut;
  }
  return {
    __kind__: "ok",
    ok: {
      poolId: pool.id,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut: quote.amountOut,
      fee: quote.fee,
      lpFee: quote.lpFee,
      protocolFee: quote.protocolFee,
      pool: dexPoolOut(pool),
    },
  };
}

// Seed: another user fills the TTTI-T/ckUSDT pool to 37 of 100 USD (18 + 19 USD).
{
  const pool = mockPools.find(
    (p) => dexSameLedger(p.token0, DEX_TTTI) && dexSameLedger(p.token1, DEX_CKUSDT),
  );
  if (pool) {
    dexBalanceOf(HOLDER_2, DexToken.tttiT).available += 180_000n;
    dexBalanceOf(HOLDER_2, DexToken.ckusdt).available += 19_000_000n;
    mockAddLiquidity(HOLDER_2, {
      poolId: pool.id,
      side: PoolSide.token0,
      amount: 180_000n,
      counterAmount: 19_000_000n,
      lockDurationNs: 30n * 24n * HOUR_NS,
    });
  }
}

// --- DEX lot 4: cycles autonomy, protocol fees (DC / DL), mint treasuries ----

const LOT4_FIVE_YEARS_NS = 157_680_000_000_000_000n;
const LOT4_DAY_NS = 24n * HOUR_NS;
/** Simulated CMC rate: cycles per ICP. */
const LOT4_CYCLES_PER_ICP = 9_200_000_000_000n;
const LOT4_AVG7D = 212_000_000_000n;
const LOT4_AVG30D = 196_000_000_000n;
/** Simulated minimum DL claim: 0.001 ICP. */
const LOT4_MIN_CLAIM_E8S = 100_000n;

const lot4Pool = (a: PoolTokenView, b: PoolTokenView) =>
  mockPools.find((p) => dexSameLedger(p.token0, a) && dexSameLedger(p.token1, b));

/** 32-byte subaccount holding an ASCII label, zero padded. */
function lot4Subaccount(label: string): Uint8Array {
  const out = new Uint8Array(32);
  out.set(new TextEncoder().encode(label).slice(0, 32));
  return out;
}

function mockAutonomy(): AutonomyView {
  const reserveCyclesEstimate = (state.reserveBalanceE8s * LOT4_CYCLES_PER_ICP) / ICP_DIVISOR;
  const totalCycles = state.cyclesBalance + reserveCyclesEstimate;
  const perDay = LOT4_AVG7D > LOT4_AVG30D ? LOT4_AVG7D : LOT4_AVG30D;
  return {
    cyclesBalance: state.cyclesBalance,
    reserveBalanceE8s: state.reserveBalanceE8s,
    reserveCyclesEstimate,
    totalCycles,
    avg7dCyclesPerDay: LOT4_AVG7D,
    avg30dCyclesPerDay: LOT4_AVG30D,
    autonomyDays: totalCycles / perDay,
    targetDays: 90n,
    sampleCount: 31n * 24n,
    oldestSampleAt: nowNs() - 31n * LOT4_DAY_NS,
    computedAt: nowNs() - HOUR_NS / 4n,
  };
}

const mockShareHistory: Array<ShareChange> = [
  { at: nowNs() - 9n * LOT4_DAY_NS, oldShareBps: 4_000n, newShareBps: 3_000n, autonomyDays: 132n },
  { at: nowNs() - 5n * LOT4_DAY_NS, oldShareBps: 3_000n, newShareBps: 2_000n, autonomyDays: 158n },
  { at: nowNs() - 2n * LOT4_DAY_NS, oldShareBps: 2_000n, newShareBps: 1_000n, autonomyDays: 171n },
];

function mockCyclesShare(): CyclesShareView {
  const autonomyDays = mockAutonomy().autonomyDays;
  const last = mockShareHistory[mockShareHistory.length - 1];
  const days = autonomyDays ?? 0n;
  // Linear between 40 % at 45 days and 5 % at 180 days.
  const target =
    days <= 45n ? 4_000n : days >= 180n ? 500n : 4_000n - ((days - 45n) * 3_500n) / 135n;
  return {
    shareBps: last.newShareBps,
    targetShareBps: target,
    minShareBps: 500n,
    maxShareBps: 4_000n,
    lowAutonomyDays: 45n,
    highAutonomyDays: 180n,
    maxStepBps: 1_000n,
    minAdjustIntervalNs: LOT4_DAY_NS,
    lastAdjustAt: last.at,
    nextAdjustAfter: last.at + LOT4_DAY_NS,
    autonomyDays,
  };
}

const LOT4_TREASURY_BALANCES = {
  icp: 1_240_000_000n,
  ckbtc: 21_000n,
  ckusdc: 85_000_000n,
  ckusdt: 64_000_000n,
};

function mockMintTreasuryAccounts(): Array<MintTreasuryAccount> {
  const balanceOf: Record<PayToken, bigint> = {
    [PayToken.icp]: LOT4_TREASURY_BALANCES.icp,
    [PayToken.ckbtc]: LOT4_TREASURY_BALANCES.ckbtc,
    [PayToken.ckusdc]: LOT4_TREASURY_BALANCES.ckusdc,
    [PayToken.ckusdt]: LOT4_TREASURY_BALANCES.ckusdt,
  };
  return PAY_TOKEN_ORDER.map((token) => ({
    token,
    account: {
      owner: TTTI_CANISTER,
      subaccount: lot4Subaccount(`MINT-TREASURY-${PAY_TOKENS[token].symbol.toUpperCase()}`),
    },
    balance: balanceOf[token],
    legacyExternalAccount: state.treasuryConfig.icpAccount ?? undefined,
  }));
}

// Protocol liquidity, seeded on the open ckUSDC/ICP utility pool.
type MockProtocolLiquidity = {
  poolId: bigint;
  shares: bigint;
  fromFees0: bigint;
  fromFees1: bigint;
  fromTreasury0: bigint;
  fromTreasury1: bigint;
  lastAddedAt?: bigint;
};
const mockProtocolLiquidity: Array<MockProtocolLiquidity> = [];

/** Adds protocol-owned liquidity at the pool ratio: shares with no position. */
function lot4AddProtocolLiquidity(
  pool: PoolView,
  amount0: bigint,
  amount1: bigint,
  source: "fees" | "treasury",
  at: bigint,
): bigint {
  const shares = pool.reserve0 > 0n ? (amount0 * pool.totalShares) / pool.reserve0 : 0n;
  pool.reserve0 += amount0;
  pool.reserve1 += amount1;
  pool.totalShares += shares;
  let entry = mockProtocolLiquidity.find((e) => e.poolId === pool.id);
  if (!entry) {
    entry = { poolId: pool.id, shares: 0n, fromFees0: 0n, fromFees1: 0n, fromTreasury0: 0n, fromTreasury1: 0n };
    mockProtocolLiquidity.push(entry);
  }
  entry.shares += shares;
  if (source === "fees") {
    entry.fromFees0 += amount0;
    entry.fromFees1 += amount1;
  } else {
    entry.fromTreasury0 += amount0;
    entry.fromTreasury1 += amount1;
  }
  entry.lastAddedAt = at;
  return shares;
}

function mockProtocolLiquidityViews(): Array<ProtocolLiquidityView> {
  return mockProtocolLiquidity.flatMap((entry) => {
    const pool = mockPools.find((p) => p.id === entry.poolId);
    if (!pool) return [];
    const total = pool.totalShares;
    return [
      {
        poolId: entry.poolId,
        token0Symbol: pool.token0.symbol,
        token1Symbol: pool.token1.symbol,
        shares: entry.shares,
        totalShares: total,
        amount0: total > 0n ? (entry.shares * pool.reserve0) / total : 0n,
        amount1: total > 0n ? (entry.shares * pool.reserve1) / total : 0n,
        fromFees0: entry.fromFees0,
        fromFees1: entry.fromFees1,
        fromTreasury0: entry.fromTreasury0,
        fromTreasury1: entry.fromTreasury1,
        lastAddedAt: entry.lastAddedAt,
      },
    ];
  });
}

const mockWeeklyAllocations: Array<WeeklyAllocation> = [];
let lot4UsdcIcpPoolId = 0n;

// Seed: another user opens the ckUSDC/ICP utility pool (60 + 60 USD), then the
// protocol adds liquidity from fees and from the last weekly allocation.
{
  const pool = lot4Pool(DEX_CKUSDC, DEX_ICP);
  if (pool) {
    lot4UsdcIcpPoolId = pool.id;
    mockSetUtilityPairMinimums(pool.id, { token0: 1_000_000n, token1: 10_000_000n });
    dexBalanceOf(HOLDER_3, DexToken.ckusdc).available += 60_000_000n;
    dexBalanceOf(HOLDER_3, DexToken.icp).available += 480_000_000n;
    mockAddLiquidity(HOLDER_3, {
      poolId: pool.id,
      side: PoolSide.token0,
      amount: 60_000_000n,
      counterAmount: 480_000_000n,
      lockDurationNs: 90n * LOT4_DAY_NS,
    });
    lot4AddProtocolLiquidity(pool, 1_250_000n, 10_000_000n, "fees", nowNs() - 30n * HOUR_NS);
    const allocationAt = nowNs() - 20n * HOUR_NS;
    const shares = lot4AddProtocolLiquidity(pool, 2_500_000n, 20_000_000n, "treasury", allocationAt);
    dexRefreshOpening(pool);
    const ttti = (counter: PoolTokenView) => lot4Pool(DEX_TTTI, counter)?.id ?? 0n;
    mockWeeklyAllocations.push({
      id: 1n,
      at: allocationAt,
      autonomyDays: mockAutonomy().autonomyDays,
      treasuryBalances: LOT4_TREASURY_BALANCES,
      stockPayoutCap: {
        icp: LOT4_TREASURY_BALANCES.icp / 12n,
        ckbtc: LOT4_TREASURY_BALANCES.ckbtc / 12n,
        ckusdc: LOT4_TREASURY_BALANCES.ckusdc / 12n,
        ckusdt: LOT4_TREASURY_BALANCES.ckusdt / 12n,
      },
      toCyclesReserveE8s: 0n,
      surplusE8s: 40_000_000n,
      toBonusE8s: 20_000_000n,
      toLiquidity: { icp: 20_000_000n, ckbtc: 0n, ckusdc: 2_500_000n, ckusdt: 0n },
      poolAdds: [{ poolId: pool.id, amount0: 2_500_000n, amount1: 20_000_000n, shares }],
      skipped: [
        { poolId: ttti(DEX_ICP), reason: "No eligible TTTI-T" },
        { poolId: ttti(DEX_CKUSDT), reason: "Pool not yet open" },
        { poolId: lot4Pool(DEX_CKBTC, DEX_ICP)?.id ?? 0n, reason: "Empty pool" },
      ],
      waiting: { icp: 0n, ckbtc: 0n, ckusdc: 0n, ckusdt: 1_000_000n },
      note: "Autonomy above 100 days: surplus split 50 % DL bonus, 50 % protocol liquidity.",
    });
  }
}

// DC batches (fee conversions to ICP) and their sends to the cycles reserve.
const mockDcBatches: Array<DcBatch> = [];
const mockDcSends: Array<{ n: bigint; batchId: bigint }> = [];
{
  const tttiIcp = lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 0n;
  const tttiUsdt = lot4Pool(DEX_TTTI, DEX_CKUSDT)?.id ?? 0n;
  const usdcIcp = lot4UsdcIcpPoolId;
  mockDcBatches.push(
    {
      id: 1n,
      at: nowNs() - 3n * LOT4_DAY_NS,
      trigger: DcTrigger.daily,
      legs: [
        { poolId: usdcIcp, tokenSymbol: "ckUSDC", amountIn: 2_400_000n, referenceIcpOutE8s: 19_200_000n, executionIcpOutE8s: 19_050_000n, deviationBps: 78n, converted: true },
      ],
      toCyclesE8s: 1_905_000n,
      toBonusE8s: 17_145_000n,
      status: { __kind__: "sent", sent: 18_402_117n },
    },
    {
      id: 2n,
      at: nowNs() - 2n * LOT4_DAY_NS,
      trigger: DcTrigger.daily,
      legs: [
        { poolId: usdcIcp, tokenSymbol: "ckUSDC", amountIn: 1_600_000n, referenceIcpOutE8s: 12_800_000n, executionIcpOutE8s: 12_710_000n, deviationBps: 70n, converted: true },
      ],
      toCyclesE8s: 1_271_000n,
      toBonusE8s: 11_439_000n,
      status: { __kind__: "needsReview", needsReview: null },
    },
    {
      id: 3n,
      at: nowNs() - 26n * HOUR_NS,
      trigger: DcTrigger.threshold,
      legs: [
        { poolId: tttiIcp, tokenSymbol: "TTTI-T", amountIn: 1_200n, referenceIcpOutE8s: 96_000_000n, executionIcpOutE8s: 92_700_000n, deviationBps: 344n, converted: false },
        { poolId: tttiUsdt, tokenSymbol: "ckUSDT", amountIn: 900_000n, referenceIcpOutE8s: 7_200_000n, executionIcpOutE8s: 7_130_000n, deviationBps: 97n, converted: false },
      ],
      toCyclesE8s: 0n,
      toBonusE8s: 0n,
      status: { __kind__: "waitingPriceDeviation", waitingPriceDeviation: null },
    },
    {
      id: 4n,
      at: nowNs() - 2n * HOUR_NS,
      trigger: DcTrigger.daily,
      legs: [],
      toCyclesE8s: 0n,
      toBonusE8s: 0n,
      status: { __kind__: "nothingToConvert", nothingToConvert: null },
    },
  );
  mockDcSends.push({ n: 1n, batchId: 1n }, { n: 2n, batchId: 2n });
  mockReviews.push(
    reviewEntry(TransferKind.DC, 2n, "TTTI-DC-2", 1_271_000n - ICP_LEDGER_FEE, CYCLES_RESERVE_ACCOUNT, 3n, "Call timed out (outcome unknown)"),
  );
}

// DL bonus of the caller: a claimable amount, one paid claim and one to verify.
const mockBonus = { claimableE8s: 3_750_000n, claimInProgress: false };
const mockBonusClaims: Array<BonusClaimView> = [
  {
    n: 1n,
    amountE8s: 1_820_000n,
    createdAt: nowNs() - 6n * LOT4_DAY_NS,
    memoText: "TTTI-DL-1",
    status: { __kind__: "completed", completed: 18_390_552n },
  },
  {
    n: 2n,
    amountE8s: 940_000n,
    createdAt: nowNs() - 30n * HOUR_NS,
    memoText: "TTTI-DL-2",
    status: { __kind__: "needsReview", needsReview: null },
  },
];
mockReviews.push(
  reviewEntry(TransferKind.DL, 2n, "TTTI-DL-2", 940_000n - ICP_LEDGER_FEE, { owner: CALLER }, 2n, "Call rejected: canister ryjl3-tyaaa-aaaaa-aaaba-cai is stopping (outcome unknown)"),
);

// Seed: the caller holds a 1-year locked position in the TTTI-T/ckUSDT pair.
{
  const pool = lot4Pool(DEX_TTTI, DEX_CKUSDT);
  if (pool) {
    dexBalanceOf(CALLER, DexToken.tttiT).available += 20_000n;
    dexBalanceOf(CALLER, DexToken.ckusdt).available += 2_200_000n;
    const result = mockAddLiquidity(CALLER, {
      poolId: pool.id,
      side: PoolSide.token0,
      amount: 20_000n,
      counterAmount: 2_200_000n,
      lockDurationNs: 365n * LOT4_DAY_NS,
    });
    if (result.__kind__ === "ok") {
      // Take back what the seed did not use, so the caller's balances stay as before.
      dexBalanceOf(CALLER, DexToken.tttiT).available -= 20_000n - result.ok.amount0;
      dexBalanceOf(CALLER, DexToken.ckusdt).available -= 2_200_000n - result.ok.amount1;
    }
  }
}

/** Value of a position in ICP (e8s) at the mock rates; 0 when a rate is missing. */
function lot4PositionValueIcp(position: PositionView, pool: PoolView): bigint {
  const rate0 = dexUsdRate(pool.token0);
  const rate1 = dexUsdRate(pool.token1);
  const icpUsd = MOCK_PAY_USD_E8[PayToken.icp];
  if (rate0 === undefined || rate1 === undefined || icpUsd === 0n) return 0n;
  const usd =
    (position.amount0 * rate0) / 10n ** BigInt(pool.token0.decimals) +
    (position.amount1 * rate1) / 10n ** BigInt(pool.token1.decimals);
  return (usd * ICP_DIVISOR) / icpUsd;
}

function mockLpBonusView(): LpBonusView {
  const now = nowNs();
  const positions: Array<PositionBonusWeight> = mockPositions.flatMap((position) => {
    if (position.owner.toText() !== CALLER.toText() || position.unlockAt <= now) return [];
    const pool = mockPools.find((p) => p.id === position.poolId);
    if (!pool || pool.kind !== PoolKind.tttiPair || pool.status === PoolStatus.removed) return [];
    const valueIcpE8s = lot4PositionValueIcp(dexPositionView(position), pool);
    const remainingLockNs = position.unlockAt - now;
    return [
      {
        positionId: position.id,
        poolId: position.poolId,
        valueIcpE8s,
        remainingLockNs,
        weight: (valueIcpE8s * remainingLockNs) / LOT4_FIVE_YEARS_NS,
      },
    ];
  });
  return {
    claimableE8s: mockBonus.claimableE8s,
    claimedE8s: mockBonusClaims.reduce((sum, c) => sum + c.amountE8s, 0n),
    positions,
    claims: [...mockBonusClaims].reverse(),
  };
}

function mockClaimLpBonus(): Outcome<"claimLpBonus"> {
  if (CALLER.isAnonymous()) return { __kind__: "err", err: { __kind__: "anonymous", anonymous: null } };
  if (mockBonus.claimInProgress) {
    return { __kind__: "err", err: { __kind__: "claimInProgress", claimInProgress: null } };
  }
  const amountE8s = mockBonus.claimableE8s;
  if (amountE8s === 0n) return { __kind__: "err", err: { __kind__: "nothingToClaim", nothingToClaim: null } };
  if (amountE8s < LOT4_MIN_CLAIM_E8S) {
    return {
      __kind__: "err",
      err: { __kind__: "belowMinimum", belowMinimum: { minimumE8s: LOT4_MIN_CLAIM_E8S } },
    };
  }
  const n = BigInt(mockBonusClaims.length + 1);
  const claim: BonusClaimView = {
    n,
    amountE8s,
    createdAt: nowNs(),
    memoText: `TTTI-DL-${n}`,
    status: { __kind__: "completed", completed: 18_410_000n + n },
  };
  mockBonusClaims.push(claim);
  mockBonus.claimableE8s = 0n;
  return { __kind__: "ok", ok: claim };
}

/** Arrived on a DC or DL review: records the block. */
function protocolFeeArrived(kind: TransferKind, n: bigint, block: bigint) {
  if (kind === TransferKind.DC) {
    const send = mockDcSends.find((d) => d.n === n);
    const batch = send ? mockDcBatches.find((b) => b.id === send.batchId) : undefined;
    if (batch) batch.status = { __kind__: "sent", sent: block };
    return;
  }
  const claim = mockBonusClaims.find((c) => c.n === n);
  if (claim) claim.status = { __kind__: "completed", completed: block };
}

/** Not arrived on a DC or DL review: a new attempt is open, sent by the timer. */
function protocolFeeNotArrived(kind: TransferKind, n: bigint) {
  if (kind === TransferKind.DC) {
    const send = mockDcSends.find((d) => d.n === n);
    const batch = send ? mockDcBatches.find((b) => b.id === send.batchId) : undefined;
    if (batch) batch.status = { __kind__: "sending", sending: null };
    return;
  }
  const claim = mockBonusClaims.find((c) => c.n === n);
  if (claim) claim.status = { __kind__: "inProgress", inProgress: null };
}

// --- Mint revenue correction: owner destinations (OW), treasury sweep (SR), mint fee halves (MF) ---

/** Admin-set owner destination per paid token; ckUSDT has none, so its share accumulates. */
const OWNER_WALLET = principalFrom(21);
const mockOwnerDestinations: Record<PayToken, { account?: Account; setAt?: bigint; accumulated: bigint }> = {
  [PayToken.icp]: { account: { owner: OWNER_WALLET }, setAt: nowNs() - 3n * LOT4_DAY_NS, accumulated: 0n },
  [PayToken.ckbtc]: { account: { owner: OWNER_WALLET }, setAt: nowNs() - 3n * LOT4_DAY_NS, accumulated: 0n },
  [PayToken.ckusdc]: {
    account: { owner: OWNER_WALLET, subaccount: lot4Subaccount("OWNER-CKUSDC") },
    setAt: nowNs() - 2n * LOT4_DAY_NS,
    accumulated: 0n,
  },
  [PayToken.ckusdt]: { accumulated: 49_504_950n },
};

const mockOwnerSends: Array<OwnerSendView> = [];
function pushOwnerSend(
  token: PayToken,
  amount: bigint,
  source: OwnerSendView["source"],
  status: OwnerSendView["status"],
  ageNs: bigint,
  lastError?: string,
): OwnerSendView {
  const id = BigInt(mockOwnerSends.length + 1);
  const at = nowNs() - ageNs;
  const prefix = source.__kind__ === "treasurySweep" ? "SR" : "OW";
  const send: OwnerSendView = {
    id,
    token,
    amount,
    fee: PAY_TOKENS[token].fee,
    destination: mockOwnerDestinations[token].account ?? { owner: OWNER_WALLET },
    source,
    status,
    block: status.__kind__ === "sent" ? status.sent : undefined,
    memoText: `TTTI-${prefix}-${id}`,
    createdAtTimeNs: at,
    attempt: 1n,
    sends: status.__kind__ === "pending" ? 0n : 1n,
    lastError,
    createdAt: at,
    updatedAt: at,
  };
  mockOwnerSends.push(send);
  return send;
}

// One-time sweep: ICP first tops up the cycles reserve to 2 ICP, then each treasury balance goes to its owner destination.
const SWEEP_RESERVE_TOP_UP_E8S = 54_330_000n;
const mockSweepTokens: Array<SweepToken> = [];
{
  const icp = pushOwnerSend(PayToken.icp, LOT4_TREASURY_BALANCES.icp - SWEEP_RESERVE_TOP_UP_E8S - 2n * ICP_LEDGER_FEE, { __kind__: "treasurySweep", treasurySweep: null }, { __kind__: "sent", sent: 18_420_001n }, 4n * LOT4_DAY_NS);
  const ckbtc = pushOwnerSend(PayToken.ckbtc, LOT4_TREASURY_BALANCES.ckbtc - PAY_TOKENS[PayToken.ckbtc].fee, { __kind__: "treasurySweep", treasurySweep: null }, { __kind__: "sent", sent: 2_310_455n }, 4n * LOT4_DAY_NS);
  const ckusdc = pushOwnerSend(PayToken.ckusdc, LOT4_TREASURY_BALANCES.ckusdc - PAY_TOKENS[PayToken.ckusdc].fee, { __kind__: "treasurySweep", treasurySweep: null }, { __kind__: "needsReview", needsReview: null }, 4n * LOT4_DAY_NS, "Call timed out (outcome unknown)");
  mockSweepTokens.push(
    { token: PayToken.icp, balance: LOT4_TREASURY_BALANCES.icp, status: { __kind__: "sent", sent: icp.id } },
    { token: PayToken.ckbtc, balance: LOT4_TREASURY_BALANCES.ckbtc, status: { __kind__: "sent", sent: ckbtc.id } },
    { token: PayToken.ckusdc, balance: LOT4_TREASURY_BALANCES.ckusdc, status: { __kind__: "sending", sending: ckusdc.id } },
    { token: PayToken.ckusdt, balance: LOT4_TREASURY_BALANCES.ckusdt, status: { __kind__: "waitingDestination", waitingDestination: null } },
  );
  pushOwnerSend(PayToken.icp, 99_009_900n, { __kind__: "mint", mint: 41n }, { __kind__: "sent", sent: 18_431_220n }, 30n * HOUR_NS);
  pushOwnerSend(PayToken.ckbtc, 15_346n, { __kind__: "mint", mint: 42n }, { __kind__: "failed", failed: "InsufficientFunds (mock)" }, 20n * HOUR_NS, "InsufficientFunds (mock)");
  const owReview = pushOwnerSend(PayToken.ckusdc, 4_950_495n, { __kind__: "mint", mint: 43n }, { __kind__: "needsReview", needsReview: null }, 25n * HOUR_NS, "Call rejected (outcome unknown)");
  pushOwnerSend(PayToken.icp, 19_801_980n, { __kind__: "mint", mint: 44n }, { __kind__: "pending", pending: null }, HOUR_NS / 6n);
  mockReviews.push(
    { ...reviewEntry(TransferKind.OW, owReview.id, owReview.memoText, owReview.amount, owReview.destination, 2n, "Call rejected (outcome unknown)"), token: DexToken.ckusdc, fee: owReview.fee },
    { ...reviewEntry(TransferKind.SR, ckusdc.id, ckusdc.memoText, ckusdc.amount, ckusdc.destination, 3n, "Call timed out (outcome unknown)"), token: DexToken.ckusdc, fee: ckusdc.fee },
  );
}
const mockSweep = {
  status: SweepStatus.sending,
  startedAt: nowNs() - 4n * LOT4_DAY_NS,
  completedAt: undefined as bigint | undefined,
  reserveTopUpE8s: SWEEP_RESERVE_TOP_UP_E8S,
  reserveTopUpBlock: 18_419_998n as bigint | undefined,
  reserveTopUpMemo: "TTTI-SR-0" as string | undefined,
};

function mockSweepView(): TreasurySweepView {
  return { ...mockSweep, tokens: mockSweepTokens.map((t) => ({ ...t })) };
}

function ownerDestinationView(token: PayToken): OwnerDestinationView {
  const d = mockOwnerDestinations[token];
  return { token, account: d.account, setAt: d.setAt, accumulated: d.accumulated };
}

function mockSetOwnerDestination(token: PayToken, account: Account): Outcome<"setOwnerDestination"> {
  if (account.owner.isAnonymous()) return { __kind__: "err", err: OwnerRevenueError.anonymousOwner };
  if (account.owner.toText() === TTTI_CANISTER.toText()) {
    return { __kind__: "err", err: OwnerRevenueError.contractAccount };
  }
  if (account.subaccount !== undefined && account.subaccount.length !== 32) {
    return { __kind__: "err", err: OwnerRevenueError.invalidSubaccount };
  }
  const d = mockOwnerDestinations[token];
  d.account = account;
  d.setAt = nowNs();
  if (d.accumulated > 0n) {
    // The accumulated share leaves as soon as a destination exists.
    pushOwnerSend(token, d.accumulated - PAY_TOKENS[token].fee, { __kind__: "accumulated", accumulated: null }, { __kind__: "sent", sent: 18_440_000n + BigInt(mockOwnerSends.length) }, 0n);
    d.accumulated = 0n;
  }
  const sweep = mockSweepTokens.find((t) => t.token === token && t.status.__kind__ === "waitingDestination");
  if (sweep) {
    const send = pushOwnerSend(token, (sweep.balance ?? 0n) - PAY_TOKENS[token].fee, { __kind__: "treasurySweep", treasurySweep: null }, { __kind__: "sent", sent: 18_441_000n + BigInt(mockOwnerSends.length) }, 0n);
    sweep.status = { __kind__: "sent", sent: send.id };
  }
  return { __kind__: "ok", ok: ownerDestinationView(token) };
}

function mockClearOwnerDestination(token: PayToken): Outcome<"clearOwnerDestination"> {
  const d = mockOwnerDestinations[token];
  if (!d.account) return { __kind__: "err", err: OwnerRevenueError.notConfigured };
  d.account = undefined;
  d.setAt = undefined;
  return { __kind__: "ok", ok: ownerDestinationView(token) };
}

/** Arrived / Not arrived on an OW or SR review. */
function ownerSendReviewed(id: bigint, block: bigint | null) {
  const send = mockOwnerSends.find((s) => s.id === id);
  if (!send) return;
  send.status = block === null ? { __kind__: "pending", pending: null } : { __kind__: "sent", sent: block };
  send.block = block ?? undefined;
  send.updatedAt = nowNs();
  const sweep = mockSweepTokens.find((t) => t.status.__kind__ === "sending" && t.status.sending === id);
  if (sweep && block !== null) {
    sweep.status = { __kind__: "sent", sent: id };
    if (mockSweepTokens.every((t) => t.status.__kind__ !== "sending")) {
      mockSweep.status = SweepStatus.completed;
      mockSweep.completedAt = nowNs();
    }
  }
}

// Mint fee half A: claimable by the liquidity providers of the lowest-liquidity TTTI-T pair of the paid token.
const mockMintFeeBalances: Record<PayToken, { claimable: bigint; claimed: bigint }> = {
  [PayToken.icp]: { claimable: 1_240_000n, claimed: 0n },
  [PayToken.ckbtc]: { claimable: 0n, claimed: 0n },
  [PayToken.ckusdc]: { claimable: 260_000n, claimed: 140_000n },
  [PayToken.ckusdt]: { claimable: 8_000n, claimed: 0n },
};
const mockMintFeeClaims: Array<MintFeeClaimView> = [
  { n: 1n, token: PayToken.ckusdc, amount: 140_000n, createdAt: nowNs() - 5n * LOT4_DAY_NS, memoText: "TTTI-MF-1", status: { __kind__: "completed", completed: 1_904_221n } },
  { n: 2n, token: PayToken.icp, amount: 600_000n, createdAt: nowNs() - 28n * HOUR_NS, memoText: "TTTI-MF-2", status: { __kind__: "needsReview", needsReview: null } },
];
mockReviews.push(
  reviewEntry(TransferKind.MF, 2n, "TTTI-MF-2", 600_000n - ICP_LEDGER_FEE, { owner: CALLER }, 2n, "Call timed out (outcome unknown)"),
);
const mockMintFeeClaimsInProgress = new Set<PayToken>();

function mockMyMintFees(): MintFeeLpView {
  return {
    balances: PAY_TOKEN_ORDER.map((token) => ({ token, ...mockMintFeeBalances[token] })),
    claims: [...mockMintFeeClaims].reverse(),
  };
}

function mockClaimMintFee(token: PayToken): Outcome<"claimMintFee"> {
  if (CALLER.isAnonymous()) return { __kind__: "err", err: { __kind__: "anonymous", anonymous: null } };
  if (mockMintFeeClaimsInProgress.has(token)) {
    return { __kind__: "err", err: { __kind__: "claimInProgress", claimInProgress: null } };
  }
  const balance = mockMintFeeBalances[token];
  if (balance.claimable === 0n) return { __kind__: "err", err: { __kind__: "nothingToClaim", nothingToClaim: null } };
  const fee = PAY_TOKENS[token].fee;
  if (balance.claimable <= fee) {
    return { __kind__: "err", err: { __kind__: "belowLedgerFee", belowLedgerFee: { fee } } };
  }
  const n = BigInt(mockMintFeeClaims.length + 1);
  const claim: MintFeeClaimView = {
    n,
    token,
    amount: balance.claimable,
    createdAt: nowNs(),
    memoText: `TTTI-MF-${n}`,
    status: { __kind__: "completed", completed: 1_905_000n + n },
  };
  mockMintFeeClaims.push(claim);
  balance.claimed += balance.claimable;
  balance.claimable = 0n;
  return { __kind__: "ok", ok: claim };
}

function mintFeeReviewed(n: bigint, block: bigint | null) {
  const claim = mockMintFeeClaims.find((c) => c.n === n);
  if (claim) {
    claim.status = block === null ? { __kind__: "inProgress", inProgress: null } : { __kind__: "completed", completed: block };
  }
}

// Mint fee half B: set aside, then added once worth 0.001 TTTI-T (10 USD) as permanent liquidity.
const SET_ASIDE_THRESHOLD_USD_E8 = 1_000_000_000n;
const ICPSWAP_POOL = principalFrom(31);
const mockSetAside: Record<PayToken, Omit<SetAsideView, "token" | "valueUsdE8" | "thresholdUsdE8" | "targetPoolId">> = {
  [PayToken.icp]: { amount: 310_000n, totalReceived: 150_310_000n, totalInjected: 150_000_000n, lastInjectionAt: nowNs() - 2n * LOT4_DAY_NS },
  [PayToken.ckbtc]: { amount: 0n, totalReceived: 0n, totalInjected: 0n },
  [PayToken.ckusdc]: { amount: 0n, totalReceived: 0n, totalInjected: 0n },
  [PayToken.ckusdt]: { amount: 4_200_000n, totalReceived: 4_200_000n, totalInjected: 0n },
};
const SET_ASIDE_POOL: Record<PayToken, PoolTokenView> = {
  [PayToken.icp]: DEX_ICP,
  [PayToken.ckbtc]: DEX_CKBTC,
  [PayToken.ckusdc]: DEX_CKUSDC,
  [PayToken.ckusdt]: DEX_CKUSDT,
};

function mockSetAsideViews(): Array<SetAsideView> {
  return PAY_TOKEN_ORDER.map((token) => {
    const entry = mockSetAside[token];
    const rate = MOCK_PAY_USD_E8[token];
    return {
      token,
      ...entry,
      valueUsdE8: rate > 0n ? (entry.amount * rate) / 10n ** BigInt(PAY_TOKENS[token].decimals) : undefined,
      thresholdUsdE8: SET_ASIDE_THRESHOLD_USD_E8,
      targetPoolId: lot4Pool(DEX_TTTI, SET_ASIDE_POOL[token])?.id,
    };
  });
}

const mockInjections: Array<LiquidityInjection> = [
  {
    id: 1n,
    token: PayToken.icp,
    poolId: lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 1n,
    venue: { __kind__: "icpswap", icpswap: ICPSWAP_POOL },
    amountIn: 150_000_000n,
    swapAmountIn: 75_000_000n,
    pairAmountIn: 75_000_000n,
    minTttiOut: 49_500n,
    tttiReceived: 50_120n,
    used0: 50_120n,
    used1: 75_000_000n,
    liquidityShares: 1_936_018n,
    status: { __kind__: "completed", completed: null },
    startedAt: nowNs() - 2n * LOT4_DAY_NS,
    updatedAt: nowNs() - 2n * LOT4_DAY_NS + 60_000_000_000n,
  },
];

export const mockBackend: backendInterface = {
  _initialize_access_control: async () => undefined,
  setOwnerDestination: async (token, account) => mockSetOwnerDestination(token, account),
  clearOwnerDestination: async (token) => mockClearOwnerDestination(token),
  listOwnerDestinations: async () => PAY_TOKEN_ORDER.map(ownerDestinationView),
  listOwnerSends: async (offset, limit) => {
    const all = [...mockOwnerSends].reverse();
    return { items: all.slice(Number(offset), Number(offset + limit)), total: BigInt(all.length), offset };
  },
  getOwnerAccumulated: async () =>
    PAY_TOKEN_ORDER.map((token) => ({ token, amount: mockOwnerDestinations[token].accumulated })),
  getTreasurySweepStatus: async () => mockSweepView(),
  getMyMintFees: async () => mockMyMintFees(),
  claimMintFee: async (token) => mockClaimMintFee(token),
  getSetAsideAmounts: async () => mockSetAsideViews(),
  listLiquidityInjections: async (offset, limit) => {
    const all = [...mockInjections].reverse();
    return { items: all.slice(Number(offset), Number(offset + limit)), total: BigInt(all.length), offset };
  },
  getCyclesAutonomy: async () => mockAutonomy(),
  getCyclesShare: async () => mockCyclesShare(),
  getCyclesShareHistory: async () => [...mockShareHistory].reverse(),
  getMintTreasuryAccounts: async () => mockMintTreasuryAccounts(),
  getLastWeeklyAllocation: async () => mockWeeklyAllocations[mockWeeklyAllocations.length - 1] ?? null,
  listWeeklyAllocations: async () => [...mockWeeklyAllocations].reverse(),
  listDcBatches: async () => [...mockDcBatches].reverse(),
  getProtocolLiquidity: async () => mockProtocolLiquidityViews(),
  getMyLpBonus: async () => mockLpBonusView(),
  claimLpBonus: async () => mockClaimLpBonus(),
  quoteAddLiquidity: async (args) => mockQuoteAddLiquidity(args),
  addLiquidity: async (args) => mockAddLiquidity(CALLER, args),
  removeLiquidity: async (positionId) => mockRemoveLiquidity(positionId),
  extendLock: async (positionId, newUnlockAt) => mockExtendLock(positionId, newUnlockAt),
  getDexPosition: async (positionId) => {
    const position = mockPositions.find((p) => p.id === positionId);
    return position ? dexPositionView(position) : null;
  },
  listPoolPositions: async (poolId) =>
    mockPositions.filter((p) => p.poolId === poolId).map(dexPositionView),
  listDexPositionsOf: async (owner) =>
    mockPositions.filter((p) => p.owner.toText() === owner.toText()).map(dexPositionView),
  quoteSwap: async (poolId, tokenIn, amountIn, slippageBps) =>
    mockQuoteSwap(poolId, tokenIn, amountIn, slippageBps),
  swap: async (poolId, tokenIn, amountIn, minAmountOut, deadline) =>
    mockSwap(poolId, tokenIn, amountIn, minAmountOut, deadline),
  listDexPools: async () => mockPools.map(dexPoolOut),
  getDexPool: async (poolId) => {
    const pool = mockPools.find((p) => p.id === poolId);
    return pool ? dexPoolOut(pool) : null;
  },
  getDexConfig: async () => mockDexConfig(),
  listPairRequests: async () => [...mockPairRequests].reverse(),
  getMyPairRequests: async () =>
    mockPairRequests.filter((r) => r.requester.toText() === CALLER.toText()).reverse(),
  requestPair: async (args) => mockRequestPair(args),
  approvePair: async (requestId, minimums) => mockApprovePair(requestId, minimums),
  refusePair: async (requestId, reason) => mockRefusePair(requestId, reason),
  removePair: async (poolId) => mockRemovePair(poolId),
  setUtilityPairMinimums: async (poolId, minimums) =>
    mockSetUtilityPairMinimums(poolId, minimums),
  getDexTokens: async () => DEX_TOKEN_ORDER.map(dexTokenInfo),
  getDexDepositAccount: async (owner) => dexDepositAccountOf(owner),
  getDexPoolAccount: async (poolId) => mockPools.find((p) => p.id === poolId)?.poolAccount ?? null,
  getDexBalances: async (owner) => dexBalancesView(owner),
  getDexTransfers: async (owner) =>
    mockDexTransfers.filter((t) => t.owner.toText() === owner.toText()).reverse(),
  depositToDex: async ({ token, amount }) => mockDepositToDex(token, amount),
  withdrawFromDex: async ({ token, amount }) => mockWithdrawFromDex(token, amount),
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
    lastTopUp: state.lastTopUp,
    withdrawals: state.withdrawals,
  }),
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
  icrc2_approve: async (args) => {
    if (args.spender.owner.toText() === TTTI_CANISTER.toText()) mockTttiAllowance = args.amount;
    return { __kind__: "Ok", Ok: 9n };
  },
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
