import { Principal } from "@icp-sdk/core/principal";
import type {
  Account,
  Account__5,
  AccountMismatch,
  AccountRef,
  AccountResult,
  AttemptOutcome,
  Comparison,
  ConsolidatedMintPrice,
  ConsolidatedPrice,
  ExcludedRereadProgress,
  PoolSpread,
  PoolSpreadAlert,
  PoolSpreadReport,
  ReserveAlert,
  ReserveCheckView,
  ReserveProgress,
  SweepProgress,
  SweepTransferView,
  TokenState,
  AddLiquidityArgs,
  AddLiquidityError,
  AddLiquidityQuote,
  AddLiquidityQuoteArgs,
  ApprovePairError,
  Auction,
  AuctionResultView,
  AuctionSettlementSummary,
  AuctionView,
  AutonomyView,
  Bid,
  BidError,
  Block,
  BidSettlement,
  ClosedAuctionView,
  ClosedBidView,
  ClosingRate,
  SettleCoreArgs,
  SettleCoreResult,
  SettleReport,
  MyBalance,
  ReserveBreakdown,
  BtcDepositResult,
  BonusClaimView,
  Contact,
  Conversion,
  CreatorPayoutView,
  CreatorSetAside,
  CreatorTokenView,
  CyclesFeeSettlement,
  DexTransferAttempt,
  DexTransferStatus,
  FeeSplitRow,
  PermanentLogEntry,
  PermanentPoolSummary,
  PendingPotView,
  PotSliceReport,
  PermanentSummary,
  PublicBoard,
  ReserveCoverage,
  Guarantee,
  GuaranteeError,
  GuaranteeAccountView,
  GuaranteeMassView,
  LiquidityMint,
  LiquidityMintError,
  LiquidityMintQuote,
  MintArgs,
  PoolPrice,
  Quantity,
  QuoteArgs,
  ZapSwap,
  CounterToken,
  CyclesShareView,
  DcBatch,
  DepositEntry,
  DepthLevel,
  DexIndicatorsSnapshot,
  FeeTotals,
  IndicatorsStatus,
  PoolIndicators,
  TokenProof,
  UnlockBucket,
  DepositTracking,
  DexAccount,
  DexBalanceView,
  DexConfig,
  DexDepositError,
  DexPauseView,
  DexReserveError,
  DexReserveStatus,
  DexTokenInfo,
  DexTransferView,
  DexWithdrawError,
  DayRollReport,
  EstimatedShareView,
  ExtendLockError,
  FeeAccountView,
  GuaranteedDepth,
  RelayOutcome,
  HistoryRow,
  ReceivingWalletView,
  ReviewFilter,
  TokenSettlementView,
  GetBlocksArgs,
  IcpPrice,
  LiquidityInjection,
  LpBonusView,
  Mismatch,
  MintFeeClaimView,
  MintFeeLpView,
  MintTreasuryAccount,
  OwnerSendView,
  PairRequestView,
  PauseReason,
  PayTokenStatus,
  PoolCapRatioView,
  PoolDepth,
  PoolMinimums,
  PoolTokenView,
  PoolView,
  PositionBonusWeight,
  PositionView,
  ProtocolLiquidityView,
  PublicDexPause,
  PurchaseAcknowledgement,
  PurchaseResult,
  PurchaseTrace,
  Ratio,
  ReferenceCheck,
  ReferencePrice,
  ReferenceSource,
  ReferenceUnavailable,
  RefusePairError,
  RemovalView,
  RemoveLiquidityError,
  RemovePairError,
  RequestPairArgs,
  RequestPairError,
  RequestedToken,
  ReserveCheck,
  ReserveWithdrawal,
  SetAsideView,
  ShareChange,
  ReservedReconciliation,
  ReviewResult,
  Route,
  RouteError,
  RouteFees,
  RoutedQuoteArgs,
  RoutedSwap,
  RoutedSwapArgs,
  RoutedSwapStatus,
  RouterFeeView,
  SwapError,
  SwapQuote,
  SwapState,
  SweepToken,
  TokenMinimums,
  TokenPrice,
  TokenReserveResult,
  TopUpAttempt,
  TopUpRecord,
  TransferReview,
  TreasuryConfig,
  TreasurySweepView,
  WithdrawalView,
  UpgradeReadiness,
  UsdGauge,
  Value__1,
  WeeklyAllocation,
  RedeemQuote,
  Redemption,
  RedemptionFee,
  TokenGuaranteeTotal,
  UnclaimedMassTotal,
  backendInterface,
} from "../backend";
import {
  BidOutcome,
  ClosedStatus,
  SettleError,
  SharingPhase,
  SettlementStatus__1,
  OpenAuctionError,
  BtcDepositErrorCode,
  BtcRefundPurpose,
  CancelRemovalError,
  CollectState,
  ComputationResult,
  ConsolidatedUnavailable,
  ConversionStatus,
  DepositErrorKind,
  DepositKind,
  DepthBasis,
  ThresholdBasis,
  DexToken,
  DcTrigger,
  DexTransferDirection,
  FeeSplitSource,
  FeeTier,
  HistoryFilter,
  HistoryKind,
  HistoryToken,
  HolderKind,
  MintStatus,
  PayToken,
  PermanentKind,
  PoolKind,
  PoolSide,
  PoolStatus,
  RedeemPhase,
  RedeemRule,
  RedemptionKind,
  PriceSource,
  ReconcileError,
  ReferenceSourceKind,
  AccountKind,
  ReserveBinding,
  ReservePhase,
  ReserveStatus,
  ReviewError,
  RouteReason,
  RoutedSwapStage,
  SetMinimumsError,
  SettlementLegPurpose,
  SpreadStatus,
  SweepStatus,
  TransferKind,
  TreasurySource,
  UserRole,
  Variant_surplus_shortfall_balanced,
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
  encodeAccountText,
  icpForTtti,
  parseUnits,
  tttiFromIcp,
  tttiFromToken,
  validateDeliveryAddress,
} from "../lib/token";

/** The transfer fee is fixed in the code: 100 base units (0.000001 TTTI-T), paid to the creator. */
const FEE = 100n;
const FEE_BOUNDS = { min: FEE, max: FEE };
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
  feeCollectorBalance: 2_000_000n,
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
    redemptionsInFlightCount: 0n,
    redemptionsInFlight: [],
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
    revenueSendsInFlight: mockOwnerSends
      .filter((s) => s.source.__kind__ === "mint" && s.status.__kind__ === "pending")
      .map((s) => s.id),
    settlementsInFlight: mockSettlements
      .filter((s) => s.status.__kind__ === "sending")
      .map((s) => PAY_TOKENS[s.token].symbol),
    dexPaused: mockDexReserve.pause.paused,
    dexPauseReason: mockDexReserve.pause.paused ? mockDexReserve.pause.reason : undefined,
    lastReserveCheckAt: mockDexReserve.lastCheck?.checkedAt,
    lastReserveCheckStatus: mockLastReserveStatus(),
    unresolvedShortfallCount: dexReserveUnresolved(),
    dexOperationsInFlight: [],
    dexReady: !mockDexReserve.pause.paused && dexReserveUnresolved() === 0n,
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

/**
 * PTM-9b: simulated end of the mint (`?guarantee=ended`) leaves a remainder below the
 * minimum of one mint; it is minted at settlement for the auction winner.
 */
const MOCK_ENDED_REMAINDER_E8S = 6_500n;
/** TTTI-T minted at auction settlement from the end-of-mint remainder. */
let mockRemainderMinted = 0n;

/** What can still be minted; the simulated end of the mint pins it to the remainder. */
const saleMintable = (): bigint => {
  if (guaranteeScenario() === "ended") {
    return MOCK_ENDED_REMAINDER_E8S > mockRemainderMinted ? MOCK_ENDED_REMAINDER_E8S - mockRemainderMinted : 0n;
  }
  return mintableRemaining();
};

/** The mint is over when what remains to mint is below the minimum of one mint. */
const saleMintEnded = (): boolean => saleMintable() < MIN_PURCHASE;

/** The remainder carried to the first auction lot (0 while the mint is running). */
const saleRemainder = (): bigint => (saleMintEnded() ? saleMintable() : 0n);

/** Transfer fees belong to the creator (source transferFee); they are never part of what is available at mint. */
function saleAvailable(): bigint {
  return saleMintable();
}

function makeConversion(icpAmount: bigint, recipient: Account): Conversion {
  const tttiAmount = liveTtti(icpAmount);
  // Fresh minting only: transfer fees held for the creator are never delivered.
  const mintable = saleMintable();
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
    fromCollector: 0n,
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
    (kind === TransferKind.GR && mockRedemptions.some((r) => r.id === purchaseId)) ||
    ((kind === TransferKind.DD || kind === TransferKind.DW) &&
      mockDexTransfers.some((t) => t.n === purchaseId)) ||
    (kind === TransferKind.DQ &&
      mockPairRequests.some((r) => r.id === purchaseId && r.status.__kind__ === "approved")) ||
    (kind === TransferKind.DC && mockDcSends.some((d) => d.n === purchaseId)) ||
    (kind === TransferKind.DL && mockBonusClaims.some((c) => c.n === purchaseId)) ||
    ((kind === TransferKind.OW || kind === TransferKind.SR) &&
      mockOwnerSends.some((s) => s.id === purchaseId)) ||
    (kind === TransferKind.MF && mockMintFeeClaims.some((c) => c.n === purchaseId)) ||
    (kind === TransferKind.LQ && mockLqPayouts.some((p) => p.n === purchaseId)) ||
    (kind === TransferKind.IR && mockRoutedSwaps.some((s) => s.id === purchaseId)) ||
    (kind === TransferKind.SW && mockSweepTransfers.some((t) => t.n === purchaseId));
  return { __kind__: "err", err: known ? ReviewError.notUnderReview : ReviewError.notFound };
}

function setForward(purchaseId: bigint, forward: Conversion["forward"]) {
  state.conversions = state.conversions.map((c) => (c.id === purchaseId ? { ...c, forward } : c));
}

function setStatus(purchaseId: bigint, status: ConversionStatus) {
  state.conversions = state.conversions.map((c) => (c.id === purchaseId ? { ...c, status } : c));
}

function mockMarkArrived(kind: TransferKind, purchaseId: bigint, block: bigint): ReviewResult {
  if (kind === TransferKind.PC || kind === TransferKind.BM || kind === TransferKind.CS) {
    return { __kind__: "err", err: ReviewError.notApplicable };
  }
  const taken = takeReview(kind, purchaseId);
  if ("__kind__" in taken) return taken;
  mockArrivedTransfers.push({ kind, purchaseId, block });
  if (kind === TransferKind.FW) setForward(purchaseId, { __kind__: "forwarded", forwarded: block });
  if (kind === TransferKind.RF) setStatus(purchaseId, ConversionStatus.refunded);
  if (kind === TransferKind.GR) redemptionArrived(purchaseId, block);
  if (kind === TransferKind.DD || kind === TransferKind.DW || kind === TransferKind.DQ) {
    dexMarkArrived(kind, purchaseId, block);
  }
  if (kind === TransferKind.LQ) dexLqArrived(purchaseId);
  if (kind === TransferKind.DC || kind === TransferKind.DL) protocolFeeArrived(kind, purchaseId, block);
  if (kind === TransferKind.OW || kind === TransferKind.SR) ownerSendReviewed(purchaseId, block);
  if (kind === TransferKind.MF) mintFeeReviewed(purchaseId, block);
  if (kind === TransferKind.IR) routerSetStatus(purchaseId, { __kind__: "reviewedArrived", reviewedArrived: block });
  if (kind === TransferKind.SW) sweepReviewed(purchaseId, block);
  return { __kind__: "ok", ok: null };
}

/** Payments that never happened, removed by Not arrived on a PC item. */
const mockRemovedPayments: Array<bigint> = [];

function mockMarkNotArrived(kind: TransferKind, purchaseId: bigint): ReviewResult {
  if (kind === TransferKind.BM || kind === TransferKind.CS) {
    return { __kind__: "err", err: ReviewError.notApplicable };
  }
  const taken = takeReview(kind, purchaseId);
  if ("__kind__" in taken) return taken;
  if (kind === TransferKind.SW) {
    // The transfer is closed as failed; a later sweep run moves the balance again.
    sweepReviewed(purchaseId, null);
    return { __kind__: "ok", ok: null };
  }
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
  if (kind === TransferKind.GR) {
    // The payout is closed as not sent; the redemption is shown as failed.
    redemptionNotArrived(purchaseId);
    return { __kind__: "ok", ok: null };
  }
  if (kind === TransferKind.IR) {
    // Nothing moved: the input amount goes back to the owner's DEX balance.
    routerSetStatus(purchaseId, { __kind__: "reviewedNotArrived", reviewedNotArrived: null });
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
    memoText: kind === TransferKind.DQ ? dexDqMemo(purchaseId, attempt) : `TTTI-${kind}-${purchaseId}-${attempt}`,
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

// ---------------------------------------------------------------------------
// Auction (PTM-6a / PTM-6b): in-memory sealed-bid auction. Closing converts the
// offers to USD at the closing rates, discards those below the reserve, serves
// the rest at their own price (price, then volume, then age) and credits
// returns to the withdrawable balance. Served deposits stay pending settlement.
// Mock-only switch in the page URL: `?auction=closing` (closes in 20 s) or
// `?auction=pending` (past closing time, no valid rate: closing pending).
// ---------------------------------------------------------------------------

const AUCTION_MIN_QUANTITY_E8S = 100_000n;
const AUCTION_MAX_BIDS = 10n;
const AUCTION_DURATION_NS = 24n * HOUR_NS;
const AUCTION_RESERVE_USD_E8 = 10_000n * 100_000_000n;

function auctionScenario(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("auction") ?? "";
  } catch {
    return "";
  }
}

const mockAuctionInitialClosesAt = (): bigint => {
  const scenario = auctionScenario();
  if (scenario === "closing") return nowNs() + 20_000_000_000n;
  if (scenario === "pending") return nowNs() - 5n * 60n * 1_000_000_000n;
  return nowNs() - HOUR_NS + AUCTION_DURATION_NS;
};

/**
 * PTM-9b first lot: `?auction=blocksale` opens a lot below the minimum of one bid (sold in
 * block); with `?guarantee=ended` that lot is the end-of-mint remainder, minted at settlement.
 */
const mockInitialLot = (): { lotSizeE8s: bigint; remainderE8s: bigint } => {
  if (auctionScenario() !== "blocksale") return { lotSizeE8s: 42_000_000n, remainderE8s: 0n };
  if (guaranteeScenario() === "ended") {
    return { lotSizeE8s: MOCK_ENDED_REMAINDER_E8S, remainderE8s: MOCK_ENDED_REMAINDER_E8S };
  }
  return { lotSizeE8s: 60_000n, remainderE8s: 0n };
};
const mockFirstLot = mockInitialLot();

const mockAuctionState: {
  current: Auction | null;
  /** Next lot, remainder included. */
  pendingLotE8s: bigint;
  /** PTM-9b: end-of-mint remainder not yet committed to a lot (part of pendingLotE8s). */
  pendingRemainderE8s: bigint;
  /** The end-of-mint remainder joined the first lot (or the pending lot). */
  remainderAbsorbed: boolean;
  nextAuctionId: bigint;
  nextBidId: bigint;
  bids: Array<Bid>;
} = {
  current: {
    id: 3n,
    lotSizeE8s: mockFirstLot.lotSizeE8s,
    blockSale: mockFirstLot.lotSizeE8s < AUCTION_MIN_QUANTITY_E8S,
    remainderE8s: mockFirstLot.remainderE8s,
    openedAt: nowNs() - HOUR_NS,
    closesAt: mockAuctionInitialClosesAt(),
  },
  pendingLotE8s: 0n,
  pendingRemainderE8s: 0n,
  remainderAbsorbed: mockFirstLot.remainderE8s > 0n,
  nextAuctionId: 4n,
  nextBidId: 10n,
  bids: [],
};

/** PTM-9b: once the mint is over, its remainder joins the first lot to open (never minted before settlement). */
const mockAbsorbMintRemainder = () => {
  if (mockAuctionState.remainderAbsorbed) return;
  const remainder = saleRemainder();
  if (remainder === 0n) return;
  mockAuctionState.remainderAbsorbed = true;
  mockAuctionState.pendingLotE8s += remainder;
  mockAuctionState.pendingRemainderE8s += remainder;
};

interface MockClosedRecord {
  auction: ClosedAuctionView;
  bids: Array<ClosedBidView>;
  /** Winners whose settlement fails in this simulation. */
  failBidIds: Set<bigint>;
  /** A failed quantity joins the next lot (not for the seeded history). */
  carryFailed: boolean;
  /** PTM-9b: TTTI-T of the end-of-mint remainder minted for each winner at its settlement. */
  mintPlan: Map<bigint, bigint>;
}

const mockClosedAuctions: Array<MockClosedRecord> = [];
/**
 * Auction amounts per principal text and token. `withdrawable` is what the
 * auction credited to the DEX internal balance and has not left it yet;
 * `pending` is the deposit of served bids awaiting settlement.
 */
const mockAuctionBalances = new Map<
  string,
  Map<PayToken, { withdrawable: bigint; pending: bigint }>
>();

/** Moves amounts between pending and the DEX balance; `withdrawable` is credited to the DEX available balance. */
const mockAuctionCredit = (
  who: Principal,
  token: PayToken,
  withdrawable: bigint,
  pending: bigint,
) => {
  const perToken =
    mockAuctionBalances.get(who.toText()) ??
    new Map<PayToken, { withdrawable: bigint; pending: bigint }>();
  const entry = perToken.get(token) ?? { withdrawable: 0n, pending: 0n };
  perToken.set(token, {
    withdrawable: entry.withdrawable + withdrawable,
    pending: entry.pending + pending,
  });
  mockAuctionBalances.set(who.toText(), perToken);
  if (withdrawable > 0n) dexBalanceOf(who, DEX_OF_PAY[token]).available += withdrawable;
};

/** A withdrawal from the DEX balance also reduces what the auction reports as withdrawable. */
const mockAuctionWithdrawn = (who: Principal, dexToken: DexToken, amount: bigint) => {
  const perToken = mockAuctionBalances.get(who.toText());
  if (!perToken) return;
  for (const [token, entry] of perToken) {
    if (DEX_OF_PAY[token] !== dexToken) continue;
    perToken.set(token, {
      ...entry,
      withdrawable: entry.withdrawable > amount ? entry.withdrawable - amount : 0n,
    });
  }
};

const mockCompare = (a: bigint, b: bigint): number => (a < b ? -1 : a > b ? 1 : 0);

interface MockClosingInput {
  id: bigint;
  openedAt: bigint;
  closesAt: bigint;
  closedAt: bigint;
  lotSizeE8s: bigint;
  blockSale?: boolean;
  remainderE8s?: bigint;
  bids: Array<Bid>;
  reserve: ReserveBreakdown;
  rates: Array<ClosingRate>;
}

/**
 * Closing: USD conversion at the closing rates, discard below the reserve,
 * sort by price then volume then age, serve each offer at its own price up to
 * the lot. The last offer may be served in part when at least the minimum
 * quantity remains; a remainder below the minimum is carried over.
 */
const mockRunClosing = (input: MockClosingInput): MockClosedRecord => {
  const rateOf = (token: PayToken): bigint =>
    input.rates.find((r) => r.token === token)?.usdE8 ?? 0n;
  const usdOf = (bid: Bid): bigint =>
    (bid.priceB * rateOf(bid.token)) / 10n ** BigInt(PAY_TOKENS[bid.token].decimals);
  const reserveUsd = input.reserve.reserveUsdE8;
  const valid = input.bids.filter((b) => usdOf(b) >= reserveUsd);
  const discarded = input.bids.filter((b) => usdOf(b) < reserveUsd);
  valid.sort(
    (a, b) =>
      mockCompare(usdOf(b), usdOf(a)) ||
      mockCompare(b.quantityE8s * usdOf(b), a.quantityE8s * usdOf(a)) ||
      mockCompare(a.createdAt, b.createdAt) ||
      mockCompare(a.id, b.id),
  );
  const remainderE8s = input.remainderE8s ?? 0n;
  const mintPlan = new Map<bigint, bigint>();
  let remaining = input.lotSizeE8s;
  let servedTotal = 0n;
  /** The remainder is the last part of the lot: a winner mints the overlap of its served range with it. */
  const planMint = (bidId: bigint, from: bigint, to: bigint) => {
    const start = input.lotSizeE8s - remainderE8s;
    const lo = from > start ? from : start;
    const hi = to < input.lotSizeE8s ? to : input.lotSizeE8s;
    if (hi > lo) mintPlan.set(bidId, hi - lo);
  };
  const toClosed = (bid: Bid, outcome: BidOutcome, served: bigint): ClosedBidView => {
    const servedDeposit = served > 0n ? mockAuctionRequired(bid.priceB, served) : 0n;
    const returned = bid.deposited - servedDeposit;
    // Unserved deposits go straight to the DEX balance; a served bid's deposit waits for its settlement.
    if (served > 0n) mockAuctionCredit(bid.bidder, bid.token, 0n, bid.deposited);
    else mockAuctionCredit(bid.bidder, bid.token, bid.deposited, 0n);
    return {
      id: bid.id,
      auctionId: input.id,
      bidder: bid.bidder,
      token: bid.token,
      quantityE8s: bid.quantityE8s,
      priceB: bid.priceB,
      requiredDeposit: bid.requiredDeposit,
      deposited: bid.deposited,
      createdAt: bid.createdAt,
      outcome,
      servedE8s: served,
      pricePaidB: served > 0n ? bid.priceB : 0n,
      servedDeposit,
      returned: served > 0n ? returned : bid.deposited,
      settlement: {
        auctionId: input.id,
        bidId: bid.id,
        bidder: bid.bidder,
        token: bid.token,
        status: served > 0n ? SettlementStatus__1.pending : SettlementStatus__1.notRequired,
        settledE8s: 0n,
        takenAmount: 0n,
        creatorShare: 0n,
        positionAmount: 0n,
        guaranteeAmount: 0n,
        surplusReturned: 0n,
        carriedE8s: 0n,
        mintedE8s: 0n,
      },
    };
  };
  const closedBids: Array<ClosedBidView> = [];
  for (const bid of valid) {
    if (bid.quantityE8s <= remaining) {
      planMint(bid.id, servedTotal, servedTotal + bid.quantityE8s);
      remaining -= bid.quantityE8s;
      servedTotal += bid.quantityE8s;
      closedBids.push(toClosed(bid, BidOutcome.served, bid.quantityE8s));
    } else if (remaining >= AUCTION_MIN_QUANTITY_E8S) {
      planMint(bid.id, servedTotal, servedTotal + remaining);
      servedTotal += remaining;
      closedBids.push(toClosed(bid, BidOutcome.partiallyServed, remaining));
      remaining = 0n;
    } else {
      closedBids.push(toClosed(bid, BidOutcome.notServed, 0n));
    }
  }
  for (const bid of discarded) {
    closedBids.push(toClosed(bid, BidOutcome.discardedBelowReserve, 0n));
  }
  const status =
    servedTotal === 0n
      ? ClosedStatus.unsold
      : servedTotal === input.lotSizeE8s
        ? ClosedStatus.fullySold
        : ClosedStatus.partiallySold;
  return {
    auction: {
      id: input.id,
      openedAt: input.openedAt,
      closesAt: input.closesAt,
      closedAt: input.closedAt,
      lotSizeE8s: input.lotSizeE8s,
      blockSale: input.blockSale ?? false,
      remainderE8s,
      reserve: input.reserve,
      rates: input.rates,
      bidCount: BigInt(input.bids.length),
      servedE8s: servedTotal,
      carriedOverE8s: input.lotSizeE8s - servedTotal,
      status,
      settlement: mockSettlementSummary(closedBids),
    },
    bids: closedBids,
    failBidIds: new Set(),
    carryFailed: true,
    mintPlan,
  };
};

const mockSettlementSummary = (bids: Array<ClosedBidView>): AuctionSettlementSummary => {
  const summary: AuctionSettlementSummary = {
    pendingCount: 0n,
    settledCount: 0n,
    failedCount: 0n,
    settledE8s: 0n,
    failedCarriedE8s: 0n,
  };
  for (const { settlement } of bids) {
    if (settlement.status === SettlementStatus__1.pending) summary.pendingCount += 1n;
    else if (settlement.status === SettlementStatus__1.settled) {
      summary.settledCount += 1n;
      summary.settledE8s += settlement.settledE8s;
    } else if (settlement.status === SettlementStatus__1.failed) {
      summary.failedCount += 1n;
      summary.failedCarriedE8s += settlement.carriedE8s;
    }
  }
  return summary;
};

const MOCK_SETTLE_DELAY_NS = 30_000_000_000n;

/**
 * Settles every pending winner of one auction. Served quantity q at price B:
 * 2 x B x q / 0.99 is taken from the deposit, the creator share is 1 % of the amount paid
 * after the cycles reserve, a position of B x q holds q TTTI-T, a guarantee of B per TTTI-T is set, and
 * the rest of the deposit is credited to the DEX balance. A failed winner has
 * no position or guarantee: the whole deposit is credited to its DEX balance
 * and the quantity is carried to the next lot. Other winners are unaffected.
 */
const mockSettleRecord = (record: MockClosedRecord): SettleReport => {
  const now = nowNs();
  const report: SettleReport = {
    auctionId: record.auction.id,
    attempted: 0n,
    settled: 0n,
    failed: 0n,
    settledE8s: 0n,
    carriedE8s: 0n,
    remaining: 0n,
  };
  for (const bid of record.bids) {
    if (bid.settlement.status !== SettlementStatus__1.pending) continue;
    report.attempted += 1n;
    mockAuctionCredit(bid.bidder, bid.token, 0n, -bid.deposited);
    if (record.failBidIds.has(bid.id)) {
      bid.servedDeposit = 0n;
      bid.returned = bid.deposited;
      mockAuctionCredit(bid.bidder, bid.token, bid.deposited, 0n);
      bid.settlement = {
        ...bid.settlement,
        status: SettlementStatus__1.failed,
        carriedE8s: bid.servedE8s,
        surplusReturned: bid.deposited,
        failureReason: "Position creation refused: pool temporarily unavailable",
        attemptedAt: now,
      };
      if (record.carryFailed) {
        mockAuctionState.pendingLotE8s += bid.servedE8s;
        // The unminted remainder goes back with the quantity.
        mockAuctionState.pendingRemainderE8s += record.mintPlan.get(bid.id) ?? 0n;
      }
      report.failed += 1n;
      report.carriedE8s += bid.servedE8s;
      continue;
    }
    const taken = bid.servedDeposit;
    const amountB = (bid.priceB * bid.servedE8s) / 10n ** 8n;
    const surplus = bid.deposited - taken;
    mockAuctionCredit(bid.bidder, bid.token, surplus, 0n);
    bid.returned = surplus;
    // PTM-9b: the remainder is minted now, for the winner, pooled with its mass.
    const minted = record.mintPlan.get(bid.id) ?? 0n;
    if (minted > 0n) {
      state.sold += minted;
      mockRemainderMinted += minted;
    }
    mockAuctionGuaranteeCredit(bid.token, bid.servedE8s, amountB);
    bid.settlement = {
      ...bid.settlement,
      status: SettlementStatus__1.settled,
      mintedE8s: minted,
      settledE8s: bid.servedE8s,
      takenAmount: taken,
      creatorShare: taken - 2n * amountB,
      positionAmount: amountB,
      guaranteeAmount: amountB,
      surplusReturned: surplus,
      positionId: nextPositionId++,
      attemptedAt: now,
      settledAt: now,
    };
    report.settled += 1n;
    report.settledE8s += bid.servedE8s;
  }
  record.auction.settlement = mockSettlementSummary(record.bids);
  return report;
};

/** Pending settlements run 30 s after closing (switch ?auction=settlepending keeps them pending). */
const mockSettleDue = () => {
  if (auctionScenario() === "settlepending") return;
  const now = nowNs();
  for (const record of mockClosedAuctions) {
    if (record.auction.settlement.pendingCount > 0n && now - record.auction.closedAt >= MOCK_SETTLE_DELAY_NS) {
      mockSettleRecord(record);
    }
  }
};

/** Closing rates; absent when no valid rate exists (closing then waits). */
const mockAuctionRates = (): Array<ClosingRate> | undefined =>
  dexRatesValid() && auctionScenario() !== "pending"
    ? PAY_TOKEN_ORDER.map((token) => ({ token, usdE8: MOCK_PAY_USD_E8[token] }))
    : undefined;

let mockClosedSeeded = false;

/** Two closed auctions: one partly sold, one fully sold with every outcome. */
const mockSeedClosed = () => {
  if (mockClosedSeeded) return;
  mockClosedSeeded = true;
  const now = nowNs();
  const usd = (n: number) => BigInt(n) * 100_000_000n;
  const priceIn = (token: PayToken, usdWhole: number): bigint =>
    (usd(usdWhole) * 10n ** BigInt(PAY_TOKENS[token].decimals)) / MOCK_PAY_USD_E8[token];
  const rates = PAY_TOKEN_ORDER.map((token) => ({ token, usdE8: MOCK_PAY_USD_E8[token] }));
  const bid = (
    id: bigint,
    auctionId: bigint,
    bidder: Principal,
    token: PayToken,
    quantityE8s: bigint,
    usdWhole: number,
    createdAt: bigint,
    extraDeposit = 0n,
  ): Bid => {
    const priceB = priceIn(token, usdWhole);
    const required = mockAuctionRequired(priceB, quantityE8s);
    return {
      id,
      auctionId,
      bidder,
      token,
      quantityE8s,
      priceB,
      requiredDeposit: required,
      deposited: required + extraDeposit,
      memo: new TextEncoder().encode(`TTTI-AB-${id}`),
      block: 1_000n + id,
      createdAt,
    };
  };
  const firstOpened = now - 74n * HOUR_NS;
  const first = mockRunClosing({
    id: 1n,
    openedAt: firstOpened,
    closesAt: firstOpened + AUCTION_DURATION_NS,
    closedAt: firstOpened + AUCTION_DURATION_NS + 120_000_000_000n,
    lotSizeE8s: 25_000_000n,
    reserve: {
      floorUsdE8: usd(10_000),
      dailyAverageUsdE8: usd(9_870),
      consolidatedUsdE8: usd(9_940),
      reserveUsdE8: usd(10_000),
      binding: ReserveBinding.floor,
    },
    rates,
    bids: [
      bid(1n, 1n, HOLDER_2, PayToken.ckusdc, 10_000_000n, 10_200, firstOpened + HOUR_NS),
      bid(2n, 1n, CALLER, PayToken.ckusdt, 5_000_000n, 10_100, firstOpened + 2n * HOUR_NS),
      bid(3n, 1n, HOLDER_3, PayToken.ckusdc, 2_000_000n, 9_800, firstOpened + 3n * HOUR_NS),
    ],
  });
  const secondOpened = now - 50n * HOUR_NS;
  const second = mockRunClosing({
    id: 2n,
    openedAt: secondOpened,
    closesAt: secondOpened + AUCTION_DURATION_NS,
    closedAt: secondOpened + AUCTION_DURATION_NS + 120_000_000_000n,
    lotSizeE8s: 50_000_000n,
    reserve: {
      floorUsdE8: usd(10_000),
      dailyAverageUsdE8: usd(10_150),
      consolidatedUsdE8: usd(10_420),
      reserveUsdE8: usd(10_420),
      binding: ReserveBinding.consolidated,
    },
    rates,
    bids: [
      bid(4n, 2n, HOLDER_2, PayToken.ckusdc, 20_000_000n, 11_000, secondOpened + HOUR_NS),
      bid(5n, 2n, CALLER, PayToken.icp, 20_000_000n, 10_800, secondOpened + 2n * HOUR_NS),
      bid(6n, 2n, HOLDER_3, PayToken.ckusdt, 20_000_000n, 10_600, secondOpened + 3n * HOUR_NS),
      bid(7n, 2n, CALLER, PayToken.ckusdc, 15_000_000n, 10_500, secondOpened + 4n * HOUR_NS),
      bid(8n, 2n, HOLDER_2, PayToken.ckusdc, 10_000_000n, 10_000, secondOpened + 5n * HOUR_NS),
      bid(9n, 2n, CALLER, PayToken.ckusdt, 5_000_000n, 9_900, secondOpened + 6n * HOUR_NS, 25_000_000n),
    ],
  });
  // History: one winner of the first auction failed settlement (its quantity went to the next lot).
  first.failBidIds.add(2n);
  first.carryFailed = false;
  second.carryFailed = false;
  mockClosedAuctions.push(first, second);
  mockSettleDue();
};

/** Closes the current auction when a valid rate exists; false while closing is pending. */
const mockCloseCurrent = (current: Auction): boolean => {
  const rates = mockAuctionRates();
  if (!rates) return false;
  const { reserve, binding, current: consolidatedNow, dailyAverage } = mockAuctionReserve();
  const record = mockRunClosing({
    id: current.id,
    openedAt: current.openedAt,
    closesAt: current.closesAt,
    closedAt: nowNs(),
    lotSizeE8s: current.lotSizeE8s,
    blockSale: current.blockSale,
    remainderE8s: current.remainderE8s,
    bids: mockAuctionState.bids,
    reserve: {
      floorUsdE8: AUCTION_RESERVE_USD_E8,
      dailyAverageUsdE8: dailyAverage,
      consolidatedUsdE8: consolidatedNow,
      reserveUsdE8: reserve,
      binding,
    },
    rates,
  });
  if (auctionScenario() === "settlefail") {
    const firstWinner = record.bids.find((b) => b.servedE8s > 0n);
    if (firstWinner) record.failBidIds.add(firstWinner.id);
  }
  mockClosedAuctions.push(record);
  mockAuctionState.pendingLotE8s += record.auction.carriedOverE8s;
  // The part of the remainder that no winner is served for stays an unminted remainder.
  let mintedPlanned = 0n;
  for (const planned of record.mintPlan.values()) mintedPlanned += planned;
  mockAuctionState.pendingRemainderE8s += current.remainderE8s - mintedPlanned;
  mockAuctionState.current = null;
  mockAuctionState.bids = [];
  return true;
};

/** The auction still accepting a closing (open, or past its time with closing pending). */
const mockAuctionOpen = (): Auction | null => {
  mockSeedClosed();
  const current = mockAuctionState.current;
  if (!current || current.closesAt > nowNs()) return current;
  return mockCloseCurrent(current) ? null : current;
};

/** Reads that must see the settlement state after any due settlement ran. */
const mockAuctionSettled = (): Auction | null => {
  const current = mockAuctionOpen();
  mockSettleDue();
  return current;
};

const mockAuctionRequired = (priceB: bigint, quantityE8s: bigint): bigint =>
  (2n * priceB * quantityE8s * 100n + 10n ** 8n * 99n - 1n) / (10n ** 8n * 99n);

/** USD (e8) per whole TTTI-T of a price expressed in base units of the pay token per whole TTTI-T. */
const mockBidUsdE8 = (token: PayToken, priceB: bigint): bigint =>
  (priceB * MOCK_PAY_USD_E8[token]) / 10n ** BigInt(PAY_TOKENS[token].decimals);

const mockAuctionCheck = (
  priceB: bigint,
  quantityE8s: bigint,
  token: PayToken,
): BidError | null => {
  if (priceB === 0n) return { __kind__: "invalidPrice", invalidPrice: null };
  // The offered price may not be below the fixed minimum (10 000 USD per TTTI-T) at the current rate.
  const bidUsdE8 = mockBidUsdE8(token, priceB);
  if (bidUsdE8 < AUCTION_RESERVE_USD_E8) {
    return {
      __kind__: "priceBelowMinimum",
      priceBelowMinimum: { minimumUsdE8: AUCTION_RESERVE_USD_E8, bidUsdE8 },
    };
  }
  // PTM-9b: a lot below the minimum of one bid is sold in block; the bid must cover the whole lot.
  const open = mockAuctionState.current;
  if (open?.blockSale && quantityE8s !== open.lotSizeE8s) {
    return {
      __kind__: "wholeLotRequired",
      wholeLotRequired: { lotSizeE8s: open.lotSizeE8s },
    };
  }
  if (quantityE8s < AUCTION_MIN_QUANTITY_E8S) {
    return {
      __kind__: "quantityBelowMinimum",
      quantityBelowMinimum: { minimum: AUCTION_MIN_QUANTITY_E8S },
    };
  }
  return null;
};

/**
 * Reserve per TTTI-T: the highest of the fixed floor, the 24 h average of the
 * consolidated price and the current consolidated price. A component that is
 * unavailable is left out, so the reserve never falls below the floor.
 */
const mockAuctionReserve = (): {
  reserve: bigint;
  binding: ReserveBinding;
  current: bigint | undefined;
  dailyAverage: bigint | undefined;
} => {
  const consolidated = dexConsolidatedPrice();
  const current =
    consolidated.price.__kind__ === "available" ? consolidated.price.available : undefined;
  const dailyAverage = current === undefined ? undefined : consolidated.dailyAverageUsdE8;
  let reserve = AUCTION_RESERVE_USD_E8;
  let binding = ReserveBinding.floor;
  if (dailyAverage !== undefined && dailyAverage > reserve) {
    reserve = dailyAverage;
    binding = ReserveBinding.dailyAverage;
  }
  if (current !== undefined && current > reserve) {
    reserve = current;
    binding = ReserveBinding.consolidated;
  }
  return { reserve, binding, current, dailyAverage };
};

const mockAuctionView = (): AuctionView => {
  const current = mockAuctionOpen();
  mockAbsorbMintRemainder();
  const price = mockPrice();
  const { reserve, binding, current: consolidatedNow, dailyAverage } = mockAuctionReserve();
  return {
    open: current !== null,
    auctionId: current?.id,
    lotSizeE8s: current?.lotSizeE8s ?? 0n,
    pendingLotE8s: mockAuctionState.pendingLotE8s,
    lotRemainderE8s: current?.remainderE8s ?? 0n,
    pendingRemainderE8s: mockAuctionState.pendingRemainderE8s,
    blockSale: current?.blockSale ?? false,
    openedAt: current?.openedAt,
    closesAt: current?.closesAt,
    reservePriceUsdE8: reserve,
    reserveFloorUsdE8: AUCTION_RESERVE_USD_E8,
    consolidatedPriceUsdE8: consolidatedNow,
    dailyAverageUsdE8: dailyAverage,
    reserveBinding: binding,
    reservePrices: PAY_TOKEN_ORDER.map((token) => ({
      token,
      price:
        token === PayToken.icp && !price.usable
          ? undefined
          : (reserve * 10n ** BigInt(PAY_TOKENS[token].decimals)) / MOCK_PAY_USD_E8[token],
    })),
    minQuantityE8s: AUCTION_MIN_QUANTITY_E8S,
    maxBidsPerPerson: AUCTION_MAX_BIDS,
    guaranteeRecoverable: true,
    closingPending: current !== null && current.closesAt <= nowNs(),
  };
};

const mockPlaceAuctionBid = (
  token: PayToken,
  quantityE8s: bigint,
  priceB: bigint,
  depositAmount: bigint,
): { __kind__: "ok"; ok: Bid } | { __kind__: "err"; err: BidError } => {
  const current = mockAuctionOpen();
  if (!current || current.closesAt <= nowNs()) {
    return { __kind__: "err", err: { __kind__: "noOpenAuction", noOpenAuction: null } };
  }
  const invalid = mockAuctionCheck(priceB, quantityE8s, token);
  if (invalid) return { __kind__: "err", err: invalid };
  const mine = mockAuctionState.bids.filter(
    (b) => b.bidder.toText() === CALLER.toText(),
  );
  if (BigInt(mine.length) >= AUCTION_MAX_BIDS) {
    return {
      __kind__: "err",
      err: { __kind__: "tooManyBids", tooManyBids: { maximum: AUCTION_MAX_BIDS } },
    };
  }
  const required = mockAuctionRequired(priceB, quantityE8s);
  const ledgerFee = PAY_TOKENS[token].fee;
  if (depositAmount < ledgerFee) {
    return {
      __kind__: "err",
      err: {
        __kind__: "depositBelowLedgerFee",
        depositBelowLedgerFee: { fee: ledgerFee, deposited: depositAmount },
      },
    };
  }
  if (depositAmount < required) {
    return {
      __kind__: "err",
      err: {
        __kind__: "depositBelowRequired",
        depositBelowRequired: { deposited: depositAmount, required },
      },
    };
  }
  const id = mockAuctionState.nextBidId;
  mockAuctionState.nextBidId += 1n;
  const bid: Bid = {
    id,
    auctionId: current.id,
    bidder: CALLER,
    token,
    quantityE8s,
    priceB,
    requiredDeposit: required,
    deposited: depositAmount,
    memo: new TextEncoder().encode(`TTTI-AB-${id}`),
    block: 1_000n + id,
    createdAt: nowNs(),
  };
  mockAuctionState.bids.push(bid);
  return { __kind__: "ok", ok: bid };
};

const mockOpenAuction = ():
  | { __kind__: "ok"; ok: Auction }
  | { __kind__: "err"; err: OpenAuctionError } => {
  if (mockAuctionOpen()) {
    return { __kind__: "err", err: OpenAuctionError.alreadyOpen };
  }
  mockAbsorbMintRemainder();
  if (mockAuctionState.pendingLotE8s === 0n) {
    return { __kind__: "err", err: OpenAuctionError.emptyLot };
  }
  const openedAt = nowNs();
  const auction: Auction = {
    id: mockAuctionState.nextAuctionId,
    lotSizeE8s: mockAuctionState.pendingLotE8s,
    blockSale: mockAuctionState.pendingLotE8s < AUCTION_MIN_QUANTITY_E8S,
    remainderE8s: mockAuctionState.pendingRemainderE8s,
    openedAt,
    closesAt: openedAt + AUCTION_DURATION_NS,
  };
  mockAuctionState.nextAuctionId += 1n;
  mockAuctionState.pendingLotE8s = 0n;
  mockAuctionState.pendingRemainderE8s = 0n;
  mockAuctionState.current = auction;
  return { __kind__: "ok", ok: auction };
};

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
  "Memos are TTTI-<prefix>-<n> or TTTI-<prefix>-<n>-<m> (32 bytes at most, no principal, n global); prefixes PC, RF, FW, SH, GR, BR.",
  "Ok or #Duplicate means sent; Err is a known failure; a reject or trap leaves the outcome unknown until an Ok, a #Duplicate or the admin's check.",
  "The same request is resent unchanged for 23 h, then the transfer becomes #needsReview. Only a new attempt changes destination, amount or fee, with a new memo and a new created_at_time.",
  "Treasury forwards (FW) and reserve shares (SH) are sent by a 10-minute timer, re-armed on every install and upgrade. A zero-amount forward is #notRequired.",
  "Purchase refunds (RF, memo TTTI-RF-<n>) are retried only when the balance covers the amount; success sets the purchase #refunded, an unknown outcome after 23 h sets it #refundReview.",
  "A purchase trace (memo TTTI-PC-<n>) is written before the collect await; an unknown collect outcome or a trap after the debit moves it to the payments to refund.",
  "",
  "## Pools and rules in plain words (lot PTM-7)",
  "Rules only; no text describes an expected price or effect.",
  "- The protocol never places a price-linked order. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price (journal: listLiquidityInjections).",
  "- No reward is created: everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it on the ledgers and in the public records.",
  "- TTTI-T generates nothing by itself. Swap fees pay the liquidity provided, and only the fees actually paid over the past 30 days are shown, stated as a recorded fact.",
  "- Impermanent loss: a liquidity position holds a share of the pool, not a fixed amount of each token. When the pool price moves, the position can be worth less than the same tokens held outside the pool, whatever the fees collected.",
  "- Exposure: through its pools (TTTI-T/ICP, TTTI-T/ckBTC, TTTI-T/ckUSDC, TTTI-T/ckUSDT) the TTTI-T side of a position is exposed to the value of BTC and ICP.",
  "- Mint zap: an automatic swap in the target pool, made with the minter's own money at the moment of the mint, at the pool's market price and fee, so that the rest can be deposited at the pool ratio.",
  "- Personal guarantee: each minter can recover their own stake by returning TTTI-T under the redemption rules; there is no common reserve and no promise of value.",
  "- Chance: at the mint every minter has an equal chance (same price, no bid, no priority). At auctions the highest bids win, in price order, until the lot is sold.",
  "- Lock (relay): optional, from 3 months to 5 years of remaining time, at opening and after an extension. A third of the weight of each new commitment relieves the other locked positions of the pool (relief of a third party); an owner can extend. A relieved or expired position is unlocked without eviction: it stays in the pool as free liquidity.",
  "- LP fees: half stays in the reserves pro rata to shares; half is set aside and shared among locked positions by capital x sqrt(remaining time / 5 years), only fees actually paid.",
  "- Auctions: sealed bids; each bidder pays their own bid; the reserve is the highest of 10_000 USD, the 24 h average of the consolidated price and the current consolidated price; nothing is reissued below 10_000 USD.",
  "- The creator's holdings are declared and public (getCreatorHoldings); the creator is not named.",
  "",
  "## Liquidity-forming mint (isolated)",
  "- quoteLiquidityMint(args) : query -> Result<LiquidityMintQuote, LiquidityMintError> and mintLiquidity(args) -> Result<LiquidityMintResult, LiquidityMintError> — the creator share is 1 % of the amount paid after the cycles reserve; the rest forms the minter's position and guarantee.",
  "- The mint is isolated: the swap, the pool deposit and the guarantee form one unit. If swap is refused, the deposit is refused or the balance cannot cover the guarantee, the whole mint fails: no TTTI-T is minted (total supply and mintable remaining unchanged), pool reserves and positions are unchanged, the mass and the guarantee are unchanged, and the payment sits in the payer's internal balance, where it is withdrawable.",
  "- The contract then withdraws the payment to the payer's wallet (memo TTTI-DW-<n>). LiquidityMint { id; status; refundWithdrawalN?; refusalCause?; paymentBlock?; positionId?; ... } records the withdrawal number and the cause of the refusal.",
  "- MintStatus: #inProgress, #completed, #refunding (withdrawal in progress), #refunded, #refundFailed (the payment stays in the internal balance and can be withdrawn with withdrawFromDex). Only #completed mints count as sold and in the mass.",
  "- LiquidityMintError for a failed isolated mint: #depositFailedRefunded { mintId } (payment returned, ledger fee deducted), #depositFailedRefunding { mintId } (payment being returned, it remains in the internal wallet balance until the withdrawal ends) and #depositFailedRefundFailed { mintId } (withdrawal failed, the payment remains in the internal balance).",
  "- liquidityMintCore(args) is the isolated core of the mint, reserved to the canister itself (self-call): any other caller is rejected with \"Unauthorized: reserved to the canister itself\". A refusal inside it rolls the whole message back.",
  "- The mint lock releases itself: a mint that fails, traps or stops on a refusal frees the caller's lock without any manual action, so a new mint can follow at once (#purchaseInProgress only while a call is running).",
  "- Simulation switch ?mint=: rate, cap, balance, allowance, slippage (refused before payment); swap, deposit, guarantee (isolated failure, payment returned); refunding (withdrawal in progress, then succeeded on the next getMyLiquidityMints); refundfailed (withdrawal failed). A built-in self-check throws if a failed isolated mint minted TTTI-T, moved the pool, changed the mass or guarantee, or did not leave the payment in the payer's balance.",
  "",
  "## Personal guarantee and redemption (PTM-2)",
  "- Each minter has one personal mass per payment token: the TTTI-T minted and the guarantee deposited with the mint. No mass is shared between owners.",
  "- Each minter can recover their own stake by returning TTTI-T under the redemption rules; the guarantee is personal, with no common reserve and no promise of value.",
  "- The right to redeem belongs to the person: any TTTI-T the person holds can be returned, up to the remaining mass. Returned TTTI-T go to a contract-held account and stay out of circulation; nothing is burned.",
  "- getMyGuaranteeMasses() : query -> [GuaranteeMassView] — token, totalTtti, totalGuarantee, remainingTtti, remainingGuarantee, excess, withdrawableExcess (excess once the mint has ended), guaranteeValue (remainingGuarantee + excess), rateUsdE8, guaranteeValueUsdE8, mintEnded.",
  "- quoteGuaranteeRedeem(token, tttiAmount) : query -> Result<RedeemQuote, GuaranteeError> — during the mint the returned amount is the lower of the guarantee deposited for the amount and the quantity worth 10,000 USD x amount at the stored rate (rule #depositedGuarantee or #dayRate); the difference stays in the guarantee as excessKept. After the mint it is the pro rata share of the mass, in kind (rule #proRata). redemptionFee is 1 % of returnedAmount; netAmount = returnedAmount - redemptionFee - thirdPartyFee; tttiAllowanceRequired = tttiAmount + tttiTransferFee.",
  "- redeemGuarantee(token, tttiAmount, expectedNetAmount) -> Result<Redemption, GuaranteeError> — pulls tttiAmount with ICRC-2 transfer_from, updates the mass and records the payout (memo TTTI-GR-<n>, created_at_time) before the first await. Refused with #slippage when the net amount is lower than expectedNetAmount, and with #salesPaused while sales are paused.",
  "- withdrawGuaranteeExcess(token) -> Result<Redemption, GuaranteeError> — pays the caller's excess once the mint has ended (#mintNotEnded before, #noExcess when none); kind #excessWithdrawal, tttiAmount 0.",
  "- listMyRedemptions() : query -> [Redemption] — status, amounts, TTTI-T pull block, payout attempt.",
  "- getUnclaimedMassTotal() : query -> UnclaimedMassTotal — public: remainingTtti, massCount, mintEnded and, per token, remainingTtti, remainingGuarantee and excess.",
  "- getGuaranteeAccounts() : query -> [GuaranteeAccountView] — public, one entry per token (TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT): { token; massTotal (sum of every guarantee mass, remaining guarantee + excess, all owners); accountBalance (balance of the dedicated internal guarantee account); equal (massTotal == accountBalance) }. The mint and the auction settlement credit the account with each guarantee; a redemption (and an excess withdrawal) is the only debit. The funds stay in the common custody.",
  "- listRedemptionFees(offset, limit) : query -> [RedemptionFee] — admin: the 1 % redemption fees set aside for the creator.",
  "- GuaranteeError: #anonymous, #salesPaused, #massNotFound, #nothingRemaining, #amountTooSmall, #amountExceedsMass, #rateUnavailable, #tttiBalanceInsufficient, #allowanceInsufficient, #slippage, #redemptionInProgress, #mintNotEnded, #noExcess, #pullFailed, #callFailed.",
  "",
  "## Bitcoin deposits",
  "- getBtcPurchaseAddress(), getBtcWalletAddress() and getBtcWalletAddressFor(owner) (unsigned) -> BtcDepositResult — #Ok with the stored tracking, or an unsaved #addressShown tracking (deposits = []); they store nothing. Errors: #anonymousCaller, #acknowledgementRequired (purchase only), #minterUnavailable.",
  "- checkBtcPurchaseDeposit(), checkBtcWalletDeposit() and checkBtcWalletDepositFor(owner) -> BtcDepositResult — no deposit yet: #Ok with an unsaved tracking (#addressShown, deposits = [], lastCheckedAt set). A tracking is created only when a check detects a deposit; it then drives the progress. Purchase errors add #purchaseInProgress.",
  "- getMyBtcDeposits() : { purchase; wallet } and getBtcWalletDepositsFor(owner) : ?DepositTracking — null until a check detected a deposit.",
  "- The 600 s task watches only the stored trackings: purchases first, then recently active ones.",
  "",
  "## Upgrade readiness (admin only)",
  "- getUpgradeReadiness() : query -> UpgradeReadiness — sales pause, purchases in flight, BTC lock, redemptions in flight, reserve lock, pending cycles top-up attempt, open purchase traces, reserved and the last reconciliation. Non-admin callers trap.",
  "- reconcileReserved() -> Result<ReservedReconciliation, ReconcileError> — sets sale.reserved to 0 and keeps the previous value, date and caller; refused with #notAdmin, #notPaused, #purchaseInFlight or #openTraces.",
  "- redeemGuarantee returns #salesPaused while sales are paused.",
  "",
  "## DEX reserve check and pause (lot 6)",
  "- runDexReserveCheck() -> Result<ReserveCheck, DexReserveError> — admin update: compares, per DEX token, the internal total (user balances available + reserved, pool reserves) with the ledger total. ReserveCheck { checkedAt; results [{ token; internalTotal; ledgerTotal; difference = ledgerTotal - internalTotal; status #ok | #surplus | #shortfall }]; lastSuccessAt; error { message; at } }. Nothing is corrected automatically. A #shortfall pauses the DEX and records a Mismatch { id; at; token; internalTotal; ledgerTotal }.",
  "- resumeDex() -> Result<DexPauseView, DexReserveError> — admin update: refused with #notPaused when the DEX is not paused and with #checkFailed(text) while a shortfall remains in the last check. DexPauseView { paused; reason { token; internalTotal; ledgerTotal; at }; resumed { by; at } }.",
  "- getDexReserveStatus() : query -> Result<DexReserveStatus, DexReserveError> — admin: { lastCheck; unresolvedShortfallCount; checkInProgress; pause; history [Mismatch] }.",
  "- getDexPauseStatus() : query -> PublicDexPause { paused; reasonToken } — public.",
  "- DexReserveError: #unauthorized, #checkInProgress, #notPaused, #checkFailed(text).",
  "- While the DEX is paused, swap, routedSwap, depositToDex and addLiquidity are refused with a paused error; withdrawFromDex and removeLiquidity still work. Sales and minting are not paused.",
  "- runDexReserveCheck() now returns ReserveCheckView (ReserveCheck plus accounts [AccountResult { kind #dexHoldings | #requestDeposits | #mintFee | #protocolFees; token; accountLabel; ledgerBalance; owed; difference; status; checkedAt }]). getDexReserveStatus() adds accounts and accountHistory [AccountMismatch { id; at; token; kind; accountLabel; owed; ledgerBalance }]. DexPauseView adds account (AccountRef { token; kind; accountLabel }) naming the account that caused the pause.",
  "- DEX custody sweep (admin): runDexSweep() and resendDexSweepTransfers() -> Result<[TokenState], ...>; getDexSweepState() -> [TokenState]; getDexCustodyComparison() -> [{ token; comparison }]; listDexSweepTransfers(cursor, limit) -> Page { items [SweepTransferView]; nextCursor ?Nat } (limit capped at 100, default 50); getDexSweepProgress() -> SweepProgress { runId; active; batches; tokens [SweepTokenProgressView] }; getDexCustodyAccounts() (public) -> [{ token; account }]. Review kinds #SW (sweep transfer, Arrived and Not arrived) and #CS (custody surplus, credited to no one, #notApplicable for both buttons).",
  "- Reserve check in batches (PTM-9e, PTM-9f): ReserveProgress adds phase (#idle, #inProgress or #finished), batch, totalBatches and alertDecided. The zero-compared alert is decided only once the complete run has ended (alertDecided true), never after the first batch. DexReserveStatus adds excludedReread { active; runId; startedAt; excludedCount; read; reincluded; unreadable; batchSize; lastBatchAt; lastFinishedAt; nextRunAt }: once a day the accounts excluded after a sweep to zero are read again in batches; a non-zero balance re-includes the account at once, in the check and in the sweep, and a new DEX operation of the account includes it again. There is no 30-day delay.",
  "- UpgradeReadiness adds dexPaused, dexPauseReason, lastReserveCheckAt, lastReserveCheckStatus, unresolvedShortfallCount, dexOperationsInFlight and dexReady.",
  "- The simulated contract finds a shortfall on ICP at every second check, seen by two consecutive checks and then repaired, so the pause and resume paths can be exercised.",
  "",
  "## Review (admin only)",
  "- listTransfersToReview() : query -> [TransferReview] — FW, SH and RF under review, every PC payment to refund, BR BTC refunds to verify (id = BR attempt number), BC BTC cost sends to the treasury to verify (id = trace number), BM delivery-failure costs to refund by hand (id = conversion id) and GR redemption payouts to verify (id = redemption id); kind, purchaseId, token, memoText, memoHex, createdAtTimeNs, amount, fee, destination (the buyer for PC), sends, lastError, block (when known), collect (PC: #confirmed or #unknown), buyer, depositIndex, conversionId, refundPurpose (BR: #excess, #fullRefund or #deliveryFailedExcess), outcome (BR/BC).",
  "- markTransferArrived(kind, purchaseId, block) -> ReviewResult — records the ledger block for FW, SH, RF, BR, BC or GR (RF sets the purchase #refunded; GR sets the payout block and completes the redemption); PC and BM return #notApplicable.",
  "- markTransferNotArrived(kind, purchaseId) -> ReviewResult — FW, SH, RF or BR: opens a new attempt sent by the timer; BC: removes the cost send and its payment to refund, and the deposit is converted again later by the timer; PC: removes a payment that never happened; GR: the payout is closed as not sent; BM returns #notApplicable.",
  "- markRefundedManually(kind, purchaseId, block) -> ReviewResult — RF, PC or BM only: records the item as refunded with the block and removes it from the list; FW, SH, BR and BC return #notApplicable.",
  "- ReviewError: #notAdmin, #notFound, #notUnderReview, #notApplicable.",
  "- ConversionStatus adds #refundReview: refund outcome unknown after 23 h.",
  "",
  "## DEX balances (lot 2)",
  "- Per-user deposit subaccount: [0xDD, principal length, principal bytes, zero padding] (32 bytes), recomputable by anyone, no secret.",
  "- getDexTokens() : [DexTokenInfo] — TTTI-T, ICP, ckBTC, ckUSDC, ckUSDT with ledger, decimals, fee, minimumDeposit and minimumWithdrawal.",
  "- getDexDepositAccount(owner) : DexAccount; getDexPoolAccount(poolId) : ?DexAccount.",
  "- getDexBalances(owner) : [DexBalanceView] — public, one row per token with available and reserved; getDexTransfers(owner) : [DexTransferView] — public, unpaged; getDexTransfersPage(owner, cursor : ?Nat, limit : Nat) : Page { items [DexTransferView]; nextCursor ?Nat } — public, newest first, cursor = transfer number n (global across deposits and withdrawals): null returns the newest items, ?c the transfers with n strictly below c; limit 0 means 50, capped at 100; nextCursor = n of the last returned transfer while older ones may remain, null on the last page.",
  "- depositToDex({ token; amount }) — DD: icrc2_transfer_from of amount (the user approves amount plus the ledger fee), memo TTTI-DD-<n> with created_at_time; credits available. Errors: #anonymous, #amountTooSmall, #transferInProgress, #insufficientAllowance, #insufficientFunds, #ledgerError.",
  "- withdrawFromDex({ token; amount }) — DW: available -> reserved, transfer of amount minus the ledger fee to the owner, memo TTTI-DW-<n>; Ok: final debit, Err: given back. Errors: #anonymous, #amountTooSmall, #insufficientBalance, #transferInProgress, #ledgerError.",
  "- PairRequestView.refundStatus: #none, #inProgress, #needsReview or #refunded(block); the DQ refund of an approved request uses memo TTTI-DQ-<pair request id> (the request number, not a transfer counter); renewed attempts append -<m>. The deposit of a refused request is counted once as TTTI-T feeding the protocol liquidity (mockRefusedPairDeposits, a per-request flag plus a running total); pending or approved requests add nothing and no TTTI-T is created.",
  "- To review adds DD, DW (id = transfer n) and DQ (id = request id). Arrived: DD credits, DW final debit, DQ #refunded. Not arrived: DD nothing credited, DW given back, DQ new attempt.",
  "",
  "## DEX liquidity and swaps (lot 3)",
  "- PoolStatus: #filling, #active or #removed. An approved pool starts #filling with zero reserves and shares; several users add liquidity. #active follows the depth: it is derived from the current depth and rate, so a pool can go back to #filling. Liquidity positions are public and linked to the identifier on TTTI: principal, shares, amounts, lock and unlock date are public.",
  "- Pool depth (PoolView.depth : PoolDepth { usdE8 optional; basis; missingRate }) is the USD value of the reserves at the pool price. basis #twiceNonTttiSide: a TTTI-T pair counts twice the USD value of its non-TTTI-T side (no fixed value for TTTI-T). basis #sumOfSides: other pairs count both sides at the hourly stored rate, valid 1 h plus 5 minutes. Missing or expired rate: usdE8 absent and missingRate names the tokens.",
  "- Swap threshold: PoolView.swapThresholdUsdE8 = 10 USD, measured on PoolView.thresholdMeasuredUsdE8 with PoolView.thresholdBasis (#tttiSideAtPoolPrice: 10 USD of TTTI-T in the pool for TTTI-T pairs; #sumOfSides: 10 USD of depth for utility pairs), evaluated dynamically at each call. It applies only to swaps, never to pool creation, deposits, liquidity, buying or minting. Swaps are refused below it and reopen as soon as the measure is back at or above it. The mint minimum is 1 USD (about 0.0001 TTTI-T). PoolView.swapState : SwapState { open; reason } with reason #open, #belowThreshold, #rateUnavailable, #removalAnnounced(effectiveAt), #removalExecuting or #removed. The first deposit has no minimum; shares = floor(sqrt(A x B)) minus the minimum shares locked to the contract forever. PoolView also carries reserve0, reserve1, totalShares, lockedShares, guaranteedDepth : GuaranteedDepth { lockedPositionShares; permanentShares; amount0; amount1; depth } (locked positions plus permanent liquidity), protocolFee0, protocolFee1, gauge : UsdGauge (same threshold) and removal : RemovalView.",
  "- getReferencePrice(poolId) : query ?ReferencePrice { poolId; kind; computedAt; available; unavailable; tttiPriceUsdE8; expected; toleranceBps; sources; ratesValid } — public. TTTI-T pools: the price of TTTI-T in USD is the weighted mean (weightBps, total 10000) of the readable sources, ICPSwap pairs and native open TTTI-T pools (ReferenceSource { kind; sourceLabel; poolId; counter; tttiPriceUsdE8; depthUsdE8; weightBps; readAt }); utility pairs use the hourly rates. Unavailable: #noReadableSource or #rateUnavailable { token0; token1 }. refreshReferenceSources() -> Nat reads the ICPSwap pairs again and returns the number of readable pairs.",
  "- getConsolidatedTttiPrice() : query ConsolidatedPrice { price : #available(usdE8) | #unavailable(#noValidRate | #noOpenPool); hourlyAverageUsdE8; hourlySamples; dailyAverageUsdE8; dailySamples; sources : [ConsolidatedSource { poolId; counterSymbol; priceUsdE8; depthUsdE8; weightBps }]; computedAt } — public. Price of one TTTI-T in USD: mean of the open TTTI-T pool prices weighted by depth; the averages come from the stored hourly and 24 h samples.",
  "- getPoolSpreads() : query PoolSpreadReport { consolidatedPriceUsdE8; computedAt; thresholdBps (200 = 2 %); pools : [PoolSpread { poolId; counterSymbol; status : #ok | #empty | #noRate | #notOpen | #noConsolidatedPrice; priceUsdE8; spreadBps (signed, pool price versus consolidated price); exceedsThreshold }] } — public.",
  "- getPoolCapRatio() : query PoolCapRatioView { computedAt; poolsValueUsdE8 (optional); poolCount; circulatingTttiT; consolidatedPriceUsdE8 (optional); capitalisationUsdE8 (optional); currentRatio (optional); averageRatio24h (optional); samples; retainedRatio (optional); targetRatio; lockedShare; ratioScale; lockedShareScale } — public, no argument. USD amounts are USD x 1e8. Ratios are fixed-point with scale ratioScale (10^12 is 100 %; the target 5e11 is 50 %). lockedShare uses scale lockedShareScale (10^6 is 100 %; 500000 is 50 %). Pools value = 2 x the counterpart reserve of each TTTI-T pool at oracle rates; capitalisation = circulating TTTI-T x the instantaneous consolidated price measured at the same moment as the pools value; ratio = pools value / capitalisation; the locked share m is derived from the retained ratio, the lower of the current ratio and the 24 h average (50 % when the ratio is missing).",
  "- getMyPoolSpreadAlerts() : query [PoolSpreadAlert { poolId; counterSymbol; spreadBps; thresholdBps; poolPriceUsdE8; consolidatedPriceUsdE8; computedAt; positionIds }] — caller only: the pools whose spread exceeds the threshold and where the caller holds a position; anonymous callers get an empty list.",
  "- DexConfig adds swapThresholdUsdE8 (10 USD, swaps only), defaultSlippageBps (50), referenceToleranceBps (200) and removalNoticeNs (5 days); tttiTUsdE8 is 0 (no fixed TTTI-T value); minLockNs is 91 days (3 months, 7862400000000000 ns) and maxLockNs 5 years (157766400000000000 ns); relayDivisor is 3 and lockedFeeSharePercent 50.",
  "- quoteAddLiquidity({ poolId; side; amount; counterAmount; slippageBps }) -> AddLiquidityQuote — side and amount are the fixed side. On an open or filling pool the counter side is computed from the pool ratio at the call (counterSide, counterAmount, rounded up) and counterAmount, when given, is the expected value the slippage is measured against. First deposit of an empty pool: counterAmount required, fixes the ratio, no minimum. The quote also returns slippageBps (default 0.5 %, maximum 10000), shares, lockedShares, gaugeAfter, depthAfterUsdE8, referenceCheck : ReferenceCheck { applicable; withinBand; expected; deviationBps; toleranceBps; unavailable }, opensPool and isFirstDeposit.",
  "- addLiquidity({ poolId; side; amount; counterAmount; slippageBps; lockDurationNs }) -> AddLiquidityResult — from internal balances; one position per add. The lock is optional: lockDurationNs absent or 0 = no lock; a lock lasts from 3 months (91 days) to 5 years of remaining time. Each commitment relays one third of its weight (capital x time) to the committed positions of the pool: they are shortened in proportion to capital x time served, none is lengthened, and a relieved position stays in the pool as free liquidity (AddLiquidityResult.relay : RelayOutcome { weight; relayWeight; shortenedWeight; positionsShortened; positionsFreed }). If the counter amount moved beyond the slippage tolerance the call is refused with #slippageExceeded { toleranceBps; expectedCounterAmount; actualCounterAmount } and nothing is debited: the funds stay in the internal balance. Unused amount (surplus0, surplus1) is never debited and stays in the internal balance. First deposit of an empty pool: refused with #referenceOutOfBand { expected; deviationBps; toleranceBps } outside the 2 % band around the reference price, or #referenceUnavailable. Errors: #anonymous, #poolNotFound, #poolRemoved, #removalAnnounced { effectiveAt }, #minimumsNotSet, #unsupportedToken, #zeroAmount, #counterAmountRequired, #insufficientBalance, #belowMinimum, #ratioMismatch, #invalidSlippage { maximumBps }, #slippageExceeded, #referenceOutOfBand, #referenceUnavailable, #lockTooShort { minimumNs }, #lockTooLong { maximumNs }, #zeroShares, #operationInProgress.",
  "- removeLiquidity(positionId) -> RemoveLiquidityResult — owner only, after unlockAt, in every pool state including #removed; pro rata amounts (rounded down) credited to internal balances. No function lets the admin shorten or cancel a lock.",
  "- extendLock(positionId, newUnlockAt) -> ExtendLockResult { position; relay; pool } — owner only; never shorter; the only rule is the remaining time after the extension: at least 3 months (lockTooShort { minimumNs }) and at most 5 years (lockTooLong { maximumUnlockAt = now + 5 years }); there is no cap from the lock start. The added time relays one third of its weight to the other committed positions of the pool. Errors: #anonymous, #positionNotFound, #notPositionOwner, #poolNotFound, #poolRemoved, #removalAnnounced { effectiveAt }, #cannotShortenLock, #lockTooLong, #lockTooShort, #operationInProgress.",
  "- removePair(poolId, reason) -> Result<PoolView, RemovePairError> (PoolView.removal = #announced) — admin only. Announces the removal of a pair with a public reason (1 to 280 characters), effective after 5 days (removalNoticeNs). RemovalView: #none, #announced { reason; announcedAt; effectiveAt }, #cancelled { reason; announcedAt; effectiveAt; cancelledAt }, #executing { ...; startedAt }, #completed { ...; completedAt }. While announced, swaps and additions are suspended (swapState #removalAnnounced, addLiquidity #removalAnnounced) and removeLiquidity stays permitted, subject to each position's unlockAt. Errors: #notAuthorized, #poolNotFound, #alreadyAnnounced { effectiveAt }, #alreadyRemoved, #reasonEmpty, #reasonTooLong { maximumChars }.",
  "- cancelPairRemoval(poolId) -> Result<PoolView, CancelRemovalError> (PoolView.removal = #cancelled) — admin only, before the effective date. Errors: #notAuthorized, #poolNotFound, #noAnnouncement, #alreadyCancelled, #alreadyExecuting, #alreadyCompleted. Swaps and additions reopen according to the depth.",
  "- At the effective date every position is liquidated (all positions, locked ones included; the locks end with the pair) and the pool becomes #removed; the amounts are paid out to the owners as liquidation payouts (memo TTTI-LQ-<n>, lib/retry.mo rules). A payout whose outcome is unknown or that fails appears in To review with kind LQ (id = transfer n); Arrived records the block, Not arrived opens a new attempt. Swaps and additions on a #removed pool return #poolRemoved.",
  "- Pair removal (finishRemoval) of a TTTI-T pair: what the contract itself holds in the pool (minimum locked shares and permanent liquidity) is not paid to any wallet. It is reinjected into the least liquid TTTI-T pool as locked shares (the counter token valued at the rates of the hour), and a line of kind #injected is added to the public permanent liquidity log (listPermanentLiquidityLog).",
  "- getDexPosition(positionId) : ?PositionView; listPoolPositions(poolId) and listDexPositionsOf(owner) : [PositionView] — public, linked to the identifier on TTTI (principal, shares, amounts, lock, lockStartedAt, unlockAt, remainingNs, locked, relayReceivedNs, feesCollected0, feesCollected1, isCreator). Creator/admin positions follow the same rules; no admin function acts on other positions.",
  "- startDexDayRoll() : DayRollReport and runDexPotSlice(poolId) : PotSliceReport — timer entries, callable by anyone: the day roll runs once the day is over (freezes each pool's pot and starts its sliced sharing; a pool with no locked position moves its pot to the reserves); one slice shares the frozen pot in two passes (#summing, then #paying). Both do nothing when there is nothing to do.",
  "- getDexPendingPots() : [PendingPotView] and getDexPendingPot(poolId) : ?PendingPotView — public; the pending pot of each pool { poolId; pending0; pending1; dayStart; nextSharingAt; sharingRunning }. The pot is fed by the locked half of the LP fees and shared once a day (nextSharingAt) among the positions locked during the day; without a locked position it carries over.",
  "- getDexEstimatedShare(positionId) : ?EstimatedShareView (public) and getMyDexEstimatedShares() : [EstimatedShareView] (caller) — estimate for the current day { positionId; poolId; owner; weight; lockedNs; dayFractionBps; estimated0; estimated1; nextSharingAt }: proportional to the weight (shares x sqrt(remaining time / 5 years)) and to the fraction of the day the position is locked, over the pot at the time of the call. The amount paid depends on the pot at the next sharing.",
  "- quoteSwap(poolId, tokenIn, amountIn, slippageBps) -> SwapQuote and swap(poolId, tokenIn, amountIn, minAmountOut, deadline) -> SwapResult — constant product, from internal balances, only while swapState is open; fee 0.3 % for the 7 starting pairs (0.05 / 0.3 / 1 % tiers for added pairs), rounded up; 70 % is the LP fee; the 30 % protocol share goes two thirds to the creator and one third to permanent liquidity in the same pool (counted in protocolFee0/1). Of the LP fee, half stays in the reserves pro rata to shares and half (the locked half) feeds the pending pot of the pool; once a day the pot is shared among the positions locked during the day by capital x sqrt(remaining time / 5 years) x fraction of the day locked, credited to feesCollected0/1 and to the owners' DEX balances; only fees actually paid are shared. Only the fees actually paid over the past 30 days are shown, recorded as a fact. Deadline at most 5 minutes after the call. Errors: #poolFilling (with the gauge), #depthBelowThreshold { depthUsdE8; thresholdUsdE8 }, #rateUnavailable, #removalInProgress { effectiveAt }, #poolRemoved, #slippageExceeded, #deadlineExceeded, #deadlineTooFar, #invalidSlippage, #insufficientBalance, #insufficientLiquidity, #tokenNotInPool, #zeroAmount.",
  "",
  "## Cycles autonomy and protocol liquidity (lot 4)",
  "- The cycles reserve has no withdrawal path. CyclesStatus has no excess or withdrawal fields. setTreasuryConfig and setPayTokenAccount are removed.",
  "- getCyclesStatus() : CyclesStatus (public) — topUpThreshold is 20 T cycles: below it, reserve ICP is converted into cycles through the Cycles Minting Canister; the reserve is kept at 2 ICP.",
  "- getCyclesAutonomy() : AutonomyView (admin) — cycles balance, reserve ICP and its cycles estimate at the CMC rate, 7- and 30-day average consumption per day, autonomy in days (target 90), sample count and oldest sample.",
  "- Read-only history: getCyclesShare(), getCyclesShareHistory(), getLastWeeklyAllocation(), listWeeklyAllocations() and listDcBatches() keep past records; no new share change, weekly allocation or DC batch is created.",
  "- getMintTreasuryAccounts() : [MintTreasuryAccount] (admin) — the former internal MINT-TREASURY-<token> subaccounts, read-only; their owner share was settled once to the receiving wallets; legacyExternalAccount is the old admin-set account.",
  "- Native swap fees: 70 % goes to the liquidity providers; the 30 % protocol share goes two thirds to the creator and one third to permanent liquidity in the same pool; nothing goes to cycles and nothing is converted to ICP.",
  "- getProtocolLiquidity() : [ProtocolLiquidityView] (public) — protocol-owned shares per pool, counted in totalShares with no position and locked forever: current amounts, the parts from fees and from the treasury, last addition.",
  "- getMyLpBonus() : LpBonusView (caller) and claimLpBonus() -> ClaimBonusResult — bonuses already earned stay claimable (memo TTTI-DL-<n>); swap fees credit no new bonus. Errors: #anonymous, #nothingToClaim, #belowMinimum { minimumE8s }, #claimInProgress.",
  "",
  "## Mint revenue: direct sends (OW), fee account and settlement (ST)",
  "- A mint is paid 101 for 100. At each mint the 100/101 share is sent directly, in the paid token, to the receiving wallet the admin configured for that token, ledger fee deducted (memo TTTI-OW-<n>, lib/retry.mo rules; an unknown outcome goes to To review). BTC mints follow ckBTC. Nothing accumulates in the contract and there is no withdraw endpoint.",
  "- A mint with a token that has no receiving wallet is refused with #receivingWalletNotConfigured { token } before any funds are taken.",
  "- setReceivingWallet(token, account) -> ReceivingWalletResult (admin) — owner principal plus optional 32-byte subaccount. Errors: #notAdmin, #anonymousOwner, #invalidSubaccount, #contractAccount. getReceivingWallets() -> ReceivingWalletsResult (admin) — per token: wallet, accountText, setAt, setBy.",
  "- The 1/101 mint fee stays in a dedicated contract fee account that cannot be withdrawn. getMintFeeAccount() -> FeeAccountResult (admin) — owner, subaccountHex, accountText, readAt and per token: balance, received, redistributedToLps, setAside, injected.",
  "- getSettlementStatus() -> SettlementStatusResult (admin) — one-time settlement per token: the accumulated revenue and the legacy mint-treasury owner share (minus past withdrawals) are sent to the receiving wallet; legacy and pending fees are moved once to the fee account; LP credits are unchanged. Status #pendingWallet, #sending, #sent([block]), #toReview or #failed(text); legs with purpose #ownerAccumulated, #ownerMintTreasury, #feePending or #feeLegacy, amount, destination, memoText (TTTI-ST-<n>), status and block.",
  "- listAdminHistory(filter, token, offset, limit) -> HistoryResult (admin) — one history, newest first, with total for pagination. filter: #all, #revenueSent, #destination, #swap, #liquidity, #mintDeposit, #redemption, #refund; token: optional ICP, TTTI-T, ckBTC, ckUSDC or ckUSDT. Row: id, kind, token, amount, status, detail, counterparty, memo, block, timestamp. Errors: #notAdmin.",
  "- getOwnerAccumulated() : [OwnerAccumulated] (admin); listOwnerSends(offset, limit) : OwnerSendPage and listTreasuryWithdrawals(offset, limit) (admin) — read-only history of past sends (source #mint(id), #accumulated, #treasurySweep, #withdrawal { by, from }, #settlement { from }).",
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
  "- To review adds OW (id = owner send id), SR (id = past sweep send id), ST (id = settlement leg n) and MF (id = claim n), next to the past DC and DL items. Arrived records the block; Not arrived opens a new attempt sent by the timer; markRefundedManually returns #notApplicable.",
  "- listTransfersToReviewFiltered({ kinds; token }) : [TransferReview] (admin) — the same list restricted to the given kinds (empty = all) and optional token.",
  "",
  "## Auction (sealed bids, PTM-6a)",
  "- getAuctionView() : AuctionView (public) — open, auctionId, lotSizeE8s, pendingLotE8s, openedAt, closesAt, reservePriceUsdE8 (effective reserve per TTTI-T: the highest of reserveFloorUsdE8 = 10 000 USD, dailyAverageUsdE8 = 24 h average of the consolidated TTTI-T price and consolidatedPriceUsdE8 = current consolidated TTTI-T price; a component that is unavailable is absent and left out, so the reserve is never below 10 000 USD; the reserve stays at 10 000 USD, no offer below it passes and nothing is reissued below 10 000 USD, the lot stays in the contract), reserveBinding (#floor | #dailyAverage | #consolidated: the component that sets the reserve), reservePrices per pay token (reserve at the current rate; price absent when the rate is absent or expired), minQuantityE8s (100 000 = 0.001 TTTI-T), maxBidsPerPerson (10), guaranteeRecoverable. PTM-9b adds blockSale (the open lot is below minQuantityE8s and is sold in block), lotRemainderE8s (part of the open lot that is the end-of-mint remainder) and pendingRemainderE8s (remainder not yet committed to a lot, included in pendingLotE8s).",
  "- getMyAuctionBids() : [Bid] — only the caller's own offers; offers of other principals are never returned.",
  "- quoteAuctionDeposit(token, priceB, quantityE8s) : Result<Nat, BidError> — required deposit = ceil(2 x priceB x quantityE8s / (10^8 x 0.99)) in the token's base units; #invalidPrice for a zero price, #priceBelowMinimum { minimumUsdE8; bidUsdE8 } under the minimum price of 10 000 USD per TTTI-T at the current rate, #quantityBelowMinimum under the minimum, #wholeLotRequired { lotSizeE8s } on a block sale when the quantity is not the whole lot.",
  "- placeAuctionBid(token, quantityE8s, priceB, depositAmount) : Result<Bid, BidError> — pulls the deposit with icrc2_transfer_from (ICRC-2 approval first); errors #noOpenAuction, #quantityBelowMinimum, #wholeLotRequired { lotSizeE8s } (block sale: a partial bid is refused), #invalidPrice, #priceBelowMinimum { minimumUsdE8; bidUsdE8 } (price under 10 000 USD per TTTI-T at the current rate), #tooManyBids (10), #depositBelowLedgerFee { fee; deposited } (the deposit must cover at least the ledger fee), #depositBelowRequired. Offers are firm: no withdrawal or change.",
  "- openAuction() : Result<Auction, OpenAuctionError> — opens a 24 hour auction on the pending lot; #alreadyOpen, #emptyLot, #paused.",
  "",
  "## End of the mint, block sale and transfer fees (PTM-9b)",
  "- Transfer fees are paid to the creator (CreatorTokenView.transferFee, source #transferFee). They are never counted in the TTTI-T available at mint: mintableRemaining is fresh minting up to the cap only, and available = mintableRemaining (collected fees are never delivered by a purchase).",
  "- getSaleStatus() : SaleStatus adds mintEnded (true when mintableRemaining is below minPurchase, the minimum of one mint) and remainderE8s (mintableRemaining while mintEnded, else 0). Once the mint is over, mintLiquidity and quoteLiquidityMint return #mintEnded.",
  "- The end-of-mint remainder joins the first auction lot (AuctionView.pendingRemainderE8s, then lotRemainderE8s and Auction.remainderE8s) and is minted only at the settlement of the winner for the part it is served (BidSettlement.mintedE8s, SettleCoreResult.mintedE8s), pooled with the winner's mass. A part nobody is served for, or a failed settlement, goes back to the remainder of the next lot.",
  "- Block sale: a lot below the minimum of one bid (minQuantityE8s) is sold whole (AuctionView.blockSale, Auction.blockSale, ClosedAuctionView.blockSale). Each bid is a price per TTTI-T for the whole lot (quantityE8s = lotSizeE8s); a partial bid returns #wholeLotRequired { lotSizeE8s }. The best price at or above the reserve wins the entire lot at its own price; below the reserve there is no sale and the lot goes to the next lot. The winner is pooled as in any other settlement.",
  "- ClosedAuctionView adds blockSale and remainderE8s.",
  "",
  "## Auction closing (PTM-6b)",
  "- getAuctionView() also returns closingPending (true when the closing time has passed and closing waits for a valid rate).",
  "- Closing: the reserve is taken at closing as the highest of 10 000 USD, the 24 h average of the consolidated TTTI-T price and the current consolidated TTTI-T price. Without a valid oracle rate closing waits (closingPending). Offers are converted to USD at the closing rates and offers below the reserve are discarded (#discardedBelowReserve). The others are sorted by price, then volume (quantity x price), then age, and served at their own price until the lot is used up. The last offer may be served in part (#partiallyServed) when at least the minimum quantity remains; a remainder below the minimum quantity is carried over. Offers that are not reached are #notServed. The unsold lot goes to the next lot (status #fullySold | #partiallySold | #unsold).",
  "- Returns: unserved offers and unserved parts are credited to the bidder's DEX internal balance; the deposits of the served quantities stay pending settlement until the winners are settled.",
  "- getClosedAuctions() : [ClosedAuctionView] (public query, newest first) — id, openedAt, closesAt, closedAt, lotSizeE8s, reserve (floorUsdE8, dailyAverageUsdE8, consolidatedUsdE8, reserveUsdE8, binding), rates [{ token; usdE8 }], bidCount, servedE8s, carriedOverE8s, status.",
  "- getAuctionResult(auctionId) : ?AuctionResultView (public query) — { auction; bids : [ClosedBidView] }; null while the auction is open. After closing every offer is published: bidder, token, quantityE8s, priceB, requiredDeposit, deposited, createdAt, outcome, servedE8s, pricePaidB, servedDeposit, returned. Before closing offers of other principals stay hidden.",
  "- getMyWithdrawable() : [MyBalance] — the caller's balance per token: withdrawable (returned to the balance) and pendingSettlement (awaiting settlement).",
  "",
  "## Auction settlement of winners (PTM-6c)",
  "- Unserved offers, unserved parts and deposits of discarded offers are credited to the bidder's DEX internal balance at closing and can be taken out with withdrawFromDex (the Recover button). The deposit of each served offer stays pending settlement (pendingSettlement in getMyWithdrawable) until its settlement.",
  "- settleAuctionWinners(auctionId) : Result<SettleReport, SettleError> — settles every pending winner of a closed auction, one by one; a failure of one winner never affects the others. SettleReport { auctionId; attempted; settled; failed; settledE8s; carriedE8s; remaining }. Errors #unknownAuction, #nothingToSettle, #inProgress, #paused.",
  "- For a served quantity q at price B: 2 x B x q / 0.99 is taken from the deposit (takenAmount); the creator share is 1 % of the amount paid after the cycles reserve (creatorShare), and the rest forms the minter's position and guarantee: a position of B x q holding q TTTI-T is created (positionAmount, positionId) and a guarantee of B per TTTI-T is set in the paid token (guaranteeAmount); the deposit surplus is credited to the DEX internal balance (surplusReturned).",
  "- Failed settlement for one winner: no position and no guarantee, the whole deposit is credited to that winner's DEX balance (withdrawable with withdrawFromDex), and the quantity q is carried to the next lot (carriedE8s, failureReason). Other winners are unaffected.",
  "- auctionSettleCore(args : SettleCoreArgs) : SettleCoreResult — isolated core of one settlement (reserved to the canister itself): { takenAmount; creatorShare; positionAmount; guaranteeAmount; positionId; shares }. A refusal rolls the whole message back.",
  "- SettlementStatus of a bid: #notRequired (not served), #pending, #settled, #failed. BidSettlement { auctionId; bidId; bidder; token; status; settledE8s; takenAmount; creatorShare; positionAmount; guaranteeAmount; surplusReturned; carriedE8s; positionId?; failureReason?; attemptedAt?; settledAt? }.",
  "- getClosedAuctions() returns [ClosedAuctionView] (ClosedAuction plus settlement : AuctionSettlementSummary { pendingCount; settledCount; failedCount; settledE8s; failedCarriedE8s }); getAuctionResult(auctionId) returns ?AuctionResultView { auction : ClosedAuctionView; bids : [ClosedBidView] } where each ClosedBidView is a ClosedBid plus settlement : BidSettlement.",
  "- Mock-only URL switches: ?auction=closing closes the open auction after 20 s; ?auction=pending leaves it past its closing time without a valid rate; ?auction=settlefail fails the settlement of the first winner of the next closing; ?auction=settlepending keeps settlements pending. Otherwise settlement runs 30 s after closing.",
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
  const noWallet = walletNotConfigured(PayToken.icp);
  if (noWallet) return noWallet;
  const remaining = saleAvailable();
  if (remaining <= 0n) {
    return purchaseError({ __kind__: "saleComplete", saleComplete: null }, "Sale complete.");
  }
  const requested = liveTtti(icpAmount);
  if (requested < MIN_PURCHASE) {
    return purchaseError(
      { __kind__: "belowMinimum", belowMinimum: { minimumTtti: MIN_PURCHASE, requestedTtti: requested } },
      "The minimum mint is 1 USD (about 0.0001 TTTI-T).",
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
  recordMintRevenue(
    PayToken.icp,
    conversion.id,
    conversion.netAmount ?? icpAmount - (conversion.feeAmount ?? 0n),
    conversion.feeAmount ?? 0n,
  );
  return { __kind__: "Ok", Ok: conversion };
}

/** Same refusal as the backend: no receiving wallet for the paid token, before any funds are taken. */
function walletNotConfigured(token: PayToken): PurchaseResult | null {
  if (mockReceivingWallets[token].wallet) return null;
  return purchaseError(
    { __kind__: "receivingWalletNotConfigured", receivingWalletNotConfigured: { token } },
    `Minting with ${PAY_TOKENS[token].symbol} is not available yet: no receiving wallet is configured for this token.`,
  );
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

// --- DEX lot 1: pair registry and pair requests (simulated) ---------------

const DEX_TTTI_MIN_LOCKED = 10_000n; // 0.0001 TTTI-T
const DEX_REQUEST_DEPOSIT = 50_000n; // 0.0005 TTTI-T
/** No first-deposit minimum: the multiplier is 0 and firstDepositMinimum is empty. */
const DEX_FIRST_DEPOSIT_MULTIPLIER = 0n;
const DEX_BADGE_NS = 30n * 24n * HOUR_NS;
const DEX_COOLDOWN_NS = 7n * 24n * HOUR_NS;
const DEX_MAX_PENDING = 2n;
const DEX_MESSAGE_MAX = 500n;
const DEX_REASON_MAX = 300n;
const DEX_PROTOCOL_STATEMENT =
  "The protocol never places a price-linked order. Permanent liquidity is depth management: a mechanical, public rebalancing of the protocol share, never conditioned on price. No reward is created: everything paid out was first paid by someone (minters, traders, transfers), and anyone can verify it. TTTI-T generates nothing by itself; swap fees pay the liquidity provided, and only the fees actually paid over the past 30 days are shown. No text here promises or aims at a price rise.";
const DEX_LOCKED_SHARES_STATEMENT =
  "The minimum locked shares √(A×B) belong to the contract forever.";
const DEX_APPROVAL_STATEMENT = "Approval of a pair is not a recommendation.";
const DEX_USD_RATE_SCALE = 100_000_000n; // usdE8 = USD x 1e8
/** Swap opening threshold: 10 USD of TTTI-T at the pool price (TTTI-T pairs) or 10 USD of depth (utility pairs); swaps only. */
const DEX_SWAP_THRESHOLD_USD_E8 = 10n * DEX_USD_RATE_SCALE;
/** Gauge target and legacy launch field: the same 10 USD swap threshold (no first-deposit minimum). */
const DEX_LAUNCH_MIN_TOTAL_USD_E8 = DEX_SWAP_THRESHOLD_USD_E8;
/** Market price of one TTTI-T used only by the simulated ICPSwap sources; pool depth never uses it. */
const DEX_TTTI_T_USD_E8 = 10_000n * DEX_USD_RATE_SCALE;
const DEX_LAUNCH_DEPTH_STATEMENT =
  "Swaps open when a TTTI-T pair holds 10 USD of TTTI-T at the pool price (the USD value of its counterpart side at the hourly rate), or when a utility pair reaches 10 USD of depth (both sides at the hourly rates), and stay open while that measure remains at or above 10 USD. This threshold applies only to swaps, never to pool creation, deposits, liquidity, buying or minting; the mint minimum is 1 USD (about 0.0001 TTTI-T). The first deposit of an empty pool has no minimum. Adding liquidity is suspended while a pair removal is announced; voluntary withdrawals stay allowed, subject to position locks.";
const DEX_DEFAULT_SLIPPAGE_BPS = 50n; // 0.5 %
const DEX_REFERENCE_TOLERANCE_BPS = 200n; // 2 %
const DEX_REMOVAL_NOTICE_NS = 5n * 24n * HOUR_NS; // 5 days
const DEX_FEE_BPS: Record<FeeTier, bigint> = {
  [FeeTier.bps5]: 5n,
  [FeeTier.bps30]: 30n,
  [FeeTier.bps100]: 100n,
};
// DEX lot 3: position locks, swap deadline and fee split.
const DEX_MIN_LOCK_NS = 91n * 24n * HOUR_NS; // 3 months (91 days); no lock (0) stays allowed
const DEX_MAX_LOCK_NS = 157_766_400_000_000_000n; // 5 years (1826 days)
/** One third of the weight of each new commitment is relayed to the committed positions of the pool. */
const DEX_RELAY_DIVISOR = 3n;
/** Half of the LP fee of each swap is set aside for the locked positions. */
const DEX_LOCKED_FEE_SHARE_PERCENT = 50n;
const DEX_SWAP_DEADLINE_MAX_NS = 5n * 60n * 1_000_000_000n; // 5 minutes
const DEX_LP_FEE_SHARE_PERCENT = SWAP_FEE_LP_PERCENT;
/** 30 % of each swap fee becomes permanent liquidity in the same pool. */
const DEX_PROTOCOL_FEE_SHARE_PERCENT = SWAP_FEE_PERMANENT_PERCENT;
const DEX_MAX_SLIPPAGE_BPS = 10_000n;
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
/** Refused pair-request deposits fed once to the protocol liquidity as TTTI-T (no TTTI-T is created). */
const mockRefusedPairDeposits = { fed: new Set<bigint>(), totalTttiT: 0n };
function dexFeedRefusedDeposit(request: PairRequestView) {
  if (request.status.__kind__ !== "refused" || mockRefusedPairDeposits.fed.has(request.id)) return;
  mockRefusedPairDeposits.fed.add(request.id);
  mockRefusedPairDeposits.totalTttiT += request.depositAmount;
}

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

/** The first deposit of an empty pool has no minimum: both sides are null. */
const DEX_NO_FIRST_DEPOSIT_MINIMUM: PoolMinimums = {};

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
    firstDepositMinimum: { ...DEX_NO_FIRST_DEPOSIT_MINIMUM },
    thresholdBasis:
      kind === PoolKind.tttiPair ? ThresholdBasis.tttiSideAtPoolPrice : ThresholdBasis.sumOfSides,
    thresholdMeasuredUsdE8: 0n,
    minimumsSet: kind === PoolKind.tttiPair || !!request?.minimums,
    lockedSharesStatement: DEX_LOCKED_SHARES_STATEMENT,
    launchMinimumTotalUsdE8: DEX_LAUNCH_MIN_TOTAL_USD_E8,
    swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
    guaranteedDepth: {
      lockedPositionShares: 0n,
      permanentShares: 0n,
      amount0: 0n,
      amount1: 0n,
      depth: {
        usdE8: 0n,
        basis: kind === PoolKind.tttiPair ? DepthBasis.twiceNonTttiSide : DepthBasis.sumOfSides,
        missingRate: { token0: false, token1: false },
      },
    },
    depth: {
      usdE8: 0n,
      basis: kind === PoolKind.tttiPair ? DepthBasis.twiceNonTttiSide : DepthBasis.sumOfSides,
      missingRate: { token0: false, token1: false },
    },
    removal: { __kind__: "none", none: null },
    swapState: {
      open: false,
      reason: {
        __kind__: "belowThreshold",
        belowThreshold: { depthUsdE8: 0n, thresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8 },
      },
    },
    newPairBadgeActive: false,
    acceptsSwaps: false,
    acceptsDeposits: kind === PoolKind.tttiPair || !!request?.minimums,
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

/** Persists the opening state, then returns the view with fresh depth, gauge and swap state. */
const dexPoolOut = (pool: PoolView): PoolView => {
  dexProcessRemovals();
  dexRefreshOpening(pool);
  const swapState = dexSwapState(pool);
  const removal = pool.removal.__kind__;
  const spread = dexSpreadOf(pool);
  return {
    ...pool,
    ...(spread ? { spread } : {}),
    gauge: dexGauge(pool),
    depth: dexDepthAt(pool),
    thresholdBasis:
      pool.kind === PoolKind.tttiPair ? ThresholdBasis.tttiSideAtPoolPrice : ThresholdBasis.sumOfSides,
    thresholdMeasuredUsdE8: dexThresholdMeasure(pool),
    guaranteedDepth: dexGuaranteedDepth(pool),
    swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
    swapState,
    acceptsSwaps: swapState.open,
    acceptsDeposits:
      pool.status !== PoolStatus.removed &&
      pool.minimumsSet &&
      removal !== "announced" &&
      removal !== "executing",
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
dexFeedRefusedDeposit(dexRefusedSeed);

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

/** DQ memo: the pair request id, with -<m> appended on a renewed attempt. */
const dexDqMemo = (requestId: bigint, attempt?: number) =>
  attempt === undefined ? `TTTI-DQ-${requestId}` : `TTTI-DQ-${requestId}-${attempt}`;

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
  // DQ refund of the deposit minus one TTTI-T fee (memo TTTI-DQ-<pair request id>).
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
  dexFeedRefusedDeposit(request);
  return { __kind__: "ok", ok: request };
}

const DEX_REMOVAL_REASON_MAX = 280n;

/** Announces the removal of a pair: effective after 5 days, swaps and additions suspended. */
function mockRemovePair(poolId: bigint, reason: string): Outcome<"removePair"> {
  const fail = (err: RemovePairError): Outcome<"removePair"> => ({ __kind__: "err", err });
  const pool = mockPools.find((p) => p.id === poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  dexProcessRemovals();
  if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") {
    return fail({ __kind__: "alreadyRemoved", alreadyRemoved: null });
  }
  if (pool.removal.__kind__ === "announced") {
    return fail({
      __kind__: "alreadyAnnounced",
      alreadyAnnounced: { effectiveAt: pool.removal.announced.effectiveAt },
    });
  }
  if (pool.removal.__kind__ === "executing") {
    return fail({
      __kind__: "alreadyAnnounced",
      alreadyAnnounced: { effectiveAt: pool.removal.executing.effectiveAt },
    });
  }
  const trimmed = reason.trim();
  if (trimmed.length === 0) return fail({ __kind__: "reasonEmpty", reasonEmpty: null });
  if (BigInt(trimmed.length) > DEX_REMOVAL_REASON_MAX) {
    return fail({ __kind__: "reasonTooLong", reasonTooLong: { maximumChars: DEX_REMOVAL_REASON_MAX } });
  }
  const announcedAt = nowNs();
  pool.removal = {
    __kind__: "announced",
    announced: { reason: trimmed, announcedAt, effectiveAt: announcedAt + DEX_REMOVAL_NOTICE_NS },
  };
  return { __kind__: "ok", ok: dexPoolOut(pool) };
}

/** Admin only: cancels an announced removal before its effective date. */
function mockCancelPairRemoval(poolId: bigint): Outcome<"cancelPairRemoval"> {
  const pool = mockPools.find((p) => p.id === poolId);
  if (!pool) return { __kind__: "err", err: CancelRemovalError.poolNotFound };
  dexProcessRemovals();
  const removal = pool.removal;
  if (removal.__kind__ === "none") return { __kind__: "err", err: CancelRemovalError.noAnnouncement };
  if (removal.__kind__ === "cancelled") return { __kind__: "err", err: CancelRemovalError.alreadyCancelled };
  if (removal.__kind__ === "executing") return { __kind__: "err", err: CancelRemovalError.alreadyExecuting };
  if (removal.__kind__ === "completed") return { __kind__: "err", err: CancelRemovalError.alreadyCompleted };
  pool.removal = {
    __kind__: "cancelled",
    cancelled: { ...removal.announced, cancelledAt: nowNs() },
  };
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
  pool.firstDepositMinimum = { ...DEX_NO_FIRST_DEPOSIT_MINIMUM };
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
    tttiTUsdE8: 0n, // no fixed TTTI-T value: depth never uses one
    rateValidForNs: HOUR_NS,
    rateGraceNs: 5n * 60n * 1_000_000_000n,
    launchDepthStatement: DEX_LAUNCH_DEPTH_STATEMENT,
    minLockNs: DEX_MIN_LOCK_NS,
    maxLockNs: DEX_MAX_LOCK_NS,
    swapDeadlineMaxNs: DEX_SWAP_DEADLINE_MAX_NS,
    lpFeeSharePercent: DEX_LP_FEE_SHARE_PERCENT,
    protocolFeeSharePercent: DEX_PROTOCOL_FEE_SHARE_PERCENT,
    swapThresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8,
    defaultSlippageBps: DEX_DEFAULT_SLIPPAGE_BPS,
    referenceToleranceBps: DEX_REFERENCE_TOLERANCE_BPS,
    removalNoticeNs: DEX_REMOVAL_NOTICE_NS,
    relayDivisor: DEX_RELAY_DIVISOR,
    lockedFeeSharePercent: DEX_LOCKED_FEE_SHARE_PERCENT,
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

// --- DEX reserve check: simulated ledger totals, pause and resume. ----------

/**
 * Every second check finds a simulated shortfall on ICP (internal credits above
 * the ledger balance). It is seen by two consecutive checks, so the resume
 * refusal can be exercised, and is repaired before the next one.
 */
const RESERVE_SHORTFALL_TOKEN = DexToken.icp;
const RESERVE_SHORTFALL_E8S = 50_000_000n;
const mockDexReserve = {
  runs: 0,
  deficit: 0n,
  deficitSeen: 0,
  lastCheck: undefined as ReserveCheck | undefined,
  lastSuccessAt: undefined as bigint | undefined,
  history: [] as Array<Mismatch>,
  accountHistory: [] as Array<AccountMismatch>,
  lastAccounts: [] as Array<AccountResult>,
  openTokens: new Set<DexToken>(),
  nextMismatchId: 1n,
  pause: { paused: false } as DexPauseView,
  alert: undefined as ReserveAlert | undefined,
  nextAlertId: 1n,
  progress: undefined as ReserveProgress | undefined,
  /** Batches read so far by a multi-batch run in progress. */
  active: undefined as { runId: bigint; batch: bigint } | undefined,
};

/** Every fifth simulated reserve check compares no account and raises the visible alert. */
const RESERVE_ALERT_EVERY = 5;
const RESERVE_BATCH_SIZE = 50n;

function reserveProgress(
  runId: bigint,
  compared: bigint,
  toCompare: bigint,
  at: bigint,
  phase: ReservePhase = ReservePhase.finished,
  batch = 1n,
  totalBatches = 1n,
): ReserveProgress {
  return {
    runId,
    phase,
    batch,
    totalBatches,
    alertDecided: phase === ReservePhase.finished,
    active: phase === ReservePhase.inProgress,
    startedAt: at,
    lastBatchAt: at,
    batchSize: RESERVE_BATCH_SIZE,
    targetCount: toCompare,
    targetIndex: toCompare,
    accountIndex: toCompare,
    accountsToCompare: toCompare,
    accountsCompared: compared,
    excludedZero: 0n,
    unreadable: 0n,
  };
}

/** Every third simulated check (not an alert run) takes several batches before it finishes. */
const RESERVE_MULTI_BATCH_EVERY = 3;
const RESERVE_TOTAL_BATCHES = 3n;

/**
 * Daily re-read of the accounts excluded after a sweep to zero. A non-zero
 * balance re-includes an account at once, in the check and in the sweep: any new
 * DEX operation of a user does the same, and the re-read run of a finished
 * reserve check finds one more account to re-include every second run.
 */
const mockExcludedReread = {
  excludedCount: 4n,
  runId: 0n,
  read: 0n,
  reincluded: 0n,
  startedAt: undefined as bigint | undefined,
  lastBatchAt: undefined as bigint | undefined,
  lastFinishedAt: undefined as bigint | undefined,
};
const EXCLUDED_REREAD_INTERVAL_NS = 86_400_000_000_000n;

/** A new DEX operation of an excluded account includes it again. */
function mockReincludeExcluded() {
  if (mockExcludedReread.excludedCount === 0n) return;
  mockExcludedReread.excludedCount -= 1n;
  mockExcludedReread.reincluded += 1n;
}

/** One daily re-read run, reading every excluded account; one non-zero balance is re-included every second run. */
function mockRunExcludedReread(now: bigint) {
  const reread = mockExcludedReread;
  reread.runId += 1n;
  reread.startedAt = now;
  reread.lastBatchAt = now;
  reread.read = reread.excludedCount;
  reread.reincluded = 0n;
  if (reread.runId % 2n === 0n) mockReincludeExcluded();
  reread.lastFinishedAt = now;
}

function mockExcludedRereadProgress(): ExcludedRereadProgress {
  const reread = mockExcludedReread;
  return {
    active: false,
    runId: reread.runId,
    startedAt: reread.startedAt,
    lastBatchAt: reread.lastBatchAt,
    lastFinishedAt: reread.lastFinishedAt,
    nextRunAt:
      reread.lastFinishedAt === undefined ? undefined : reread.lastFinishedAt + EXCLUDED_REREAD_INTERVAL_NS,
    excludedCount: reread.excludedCount,
    read: reread.read,
    reincluded: reread.reincluded,
    unreadable: 0n,
    batchSize: RESERVE_BATCH_SIZE,
  };
}

/** Sum of the internal DEX balances (available and reserved) of one token. */
function dexUserBalanceTotal(token: DexToken): bigint {
  let total = 0n;
  for (const byToken of mockDexBalances.values()) {
    const balance = byToken.get(token);
    if (balance) total += balance.available + balance.reserved;
  }
  return total;
}

/** Sum of the pool reserves of one token. */
function dexPoolReserveTotal(token: DexToken): bigint {
  const ledgerId = DEX_TOKEN_VIEW[token].ledgerId.toText();
  let total = 0n;
  for (const pool of mockPools) {
    if (pool.token0.ledgerId.toText() === ledgerId) total += pool.reserve0;
    if (pool.token1.ledgerId.toText() === ledgerId) total += pool.reserve1;
  }
  return total;
}

/** Sum of the internal DEX balances (available and reserved) and the pool reserves of one token. */
function dexInternalTotal(token: DexToken): bigint {
  return dexUserBalanceTotal(token) + dexPoolReserveTotal(token);
}

/**
 * Accounts checked besides the DEX holdings, with a simulated balance equal to
 * the amount owed: pair-request deposits, the MINT_FEE account and PROTOCOL_FEES.
 */
const RESERVE_EXTRA_ACCOUNTS: ReadonlyArray<{ kind: AccountKind; token: DexToken; owed: bigint }> = [
  { kind: AccountKind.requestDeposits, token: DexToken.tttiT, owed: 5_000_000n },
  { kind: AccountKind.requestDeposits, token: DexToken.icp, owed: 20_000_000n },
  { kind: AccountKind.mintFee, token: DexToken.icp, owed: 3_400_000n },
  { kind: AccountKind.protocolFees, token: DexToken.icp, owed: 1_250_000n },
];

const ACCOUNT_LABELS: Record<AccountKind, string> = {
  [AccountKind.dexHoldings]: "DEX holdings",
  [AccountKind.requestDeposits]: "Pair-request deposits",
  [AccountKind.auctionDeposits]: "Auction deposits",
  [AccountKind.mintFee]: "MINT_FEE",
  [AccountKind.protocolFees]: "PROTOCOL_FEES",
};

const accountLabelOf = (kind: AccountKind, token: DexToken): string =>
  `${ACCOUNT_LABELS[kind]} ${DEX_TOKEN_VIEW[token].symbol}`;

const dexReserveUnresolved = (): bigint =>
  BigInt(
    mockDexReserve.lastCheck?.results.filter((r) => r.status === ReserveStatus.shortfall).length ?? 0,
  );

function dexReserveErr(err: DexReserveError): { __kind__: "err"; err: DexReserveError } {
  return { __kind__: "err", err };
}

function mockInProgressView(runId: bigint, batch: bigint): ReserveCheckView {
  const reserve = mockDexReserve;
  const toCompare = BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length);
  const progress = reserveProgress(
    runId,
    (toCompare * batch) / RESERVE_TOTAL_BATCHES,
    toCompare,
    nowNs(),
    ReservePhase.inProgress,
    batch,
    RESERVE_TOTAL_BATCHES,
  );
  return {
    checkedAt: nowNs(),
    results: reserve.lastCheck?.results ?? [],
    accounts: reserve.lastAccounts,
    progress,
    lastSuccessAt: reserve.lastSuccessAt,
    error: undefined,
  };
}

function mockRunDexReserveCheck(): Outcome<"runDexReserveCheck"> {
  const reserve = mockDexReserve;
  if (reserve.active) {
    // Resumes the persisted cursor: reads the next batch, and the last batch ends the run.
    reserve.active.batch += 1n;
    if (reserve.active.batch < RESERVE_TOTAL_BATCHES) {
      return { __kind__: "ok", ok: mockInProgressView(reserve.active.runId, reserve.active.batch) };
    }
    reserve.active = undefined;
    return finishDexReserveCheck();
  }
  reserve.runs += 1;
  if (reserve.runs % RESERVE_ALERT_EVERY === 0) {
    const at = nowNs();
    const runId = BigInt(reserve.runs);
    const toCompare = BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length);
    const progress = reserveProgress(runId, 0n, toCompare, at);
    reserve.progress = progress;
    reserve.alert = {
      id: reserve.nextAlertId,
      at,
      runId,
      accountsToCompare: toCompare,
      accountsCompared: 0n,
      message: "The reserve check compared 0 accounts. Run it again; this alert does not pause the DEX.",
    };
    reserve.nextAlertId += 1n;
    const view: ReserveCheckView = {
      checkedAt: at,
      results: [],
      accounts: [],
      progress,
      lastSuccessAt: reserve.lastSuccessAt,
      error: undefined,
    };
    return { __kind__: "ok", ok: view };
  }
  if (reserve.deficit > 0n) {
    reserve.deficitSeen += 1;
    if (reserve.deficitSeen > 2) {
      reserve.deficit = 0n;
      reserve.deficitSeen = 0;
    }
  } else if (reserve.runs % 2 === 0) {
    reserve.deficit = RESERVE_SHORTFALL_E8S;
    reserve.deficitSeen = 1;
  }
  if (reserve.runs % RESERVE_MULTI_BATCH_EVERY === 0) {
    reserve.active = { runId: BigInt(reserve.runs), batch: 1n };
    return { __kind__: "ok", ok: mockInProgressView(reserve.active.runId, 1n) };
  }
  return finishDexReserveCheck();
}

/** Compares every account and records the result: the end of a run, whether it took one batch or several. */
function finishDexReserveCheck(): Outcome<"runDexReserveCheck"> {
  const reserve = mockDexReserve;
  const now = nowNs();
  const results: Array<TokenReserveResult> = DEX_TOKEN_ORDER.map((token) => {
    const ledgerTotal = dexInternalTotal(token);
    const internalTotal = token === RESERVE_SHORTFALL_TOKEN ? ledgerTotal + reserve.deficit : ledgerTotal;
    const difference = ledgerTotal - internalTotal;
    const status =
      difference < 0n ? ReserveStatus.shortfall : difference > 0n ? ReserveStatus.surplus : ReserveStatus.ok;
    return { token, internalTotal, ledgerTotal, difference, status };
  });
  const accounts: Array<AccountResult> = [
    ...results.map((r) => ({
      kind: AccountKind.dexHoldings,
      token: r.token,
      accountLabel: accountLabelOf(AccountKind.dexHoldings, r.token),
      ledgerBalance: r.ledgerTotal,
      owed: r.internalTotal,
      difference: r.difference,
      status: r.status,
      checkedAt: now,
    })),
    ...RESERVE_EXTRA_ACCOUNTS.map((a) => ({
      kind: a.kind,
      token: a.token,
      accountLabel: accountLabelOf(a.kind, a.token),
      ledgerBalance: a.owed,
      owed: a.owed,
      difference: 0n,
      status: ReserveStatus.ok,
      checkedAt: now,
    })),
  ];
  for (const result of results) {
    if (result.status !== ReserveStatus.shortfall) {
      reserve.openTokens.delete(result.token);
      continue;
    }
    if (!reserve.openTokens.has(result.token)) {
      reserve.openTokens.add(result.token);
      reserve.history.push({
        id: reserve.nextMismatchId,
        at: now,
        token: result.token,
        internalTotal: result.internalTotal,
        ledgerTotal: result.ledgerTotal,
      });
      reserve.accountHistory.push({
        id: reserve.nextMismatchId,
        at: now,
        token: result.token,
        kind: AccountKind.dexHoldings,
        accountLabel: accountLabelOf(AccountKind.dexHoldings, result.token),
        owed: result.internalTotal,
        ledgerBalance: result.ledgerTotal,
      });
      reserve.nextMismatchId += 1n;
    }
    if (!reserve.pause.paused) {
      const pauseReason: PauseReason = {
        token: result.token,
        internalTotal: result.internalTotal,
        ledgerTotal: result.ledgerTotal,
        at: now,
      };
      const account: AccountRef = {
        token: result.token,
        kind: AccountKind.dexHoldings,
        accountLabel: accountLabelOf(AccountKind.dexHoldings, result.token),
      };
      reserve.pause = { paused: true, reason: pauseReason, account };
    }
  }
  reserve.lastSuccessAt = now;
  const check: ReserveCheck = { checkedAt: now, results, lastSuccessAt: now, error: undefined };
  reserve.lastCheck = check;
  reserve.lastAccounts = accounts;
  const progress = reserveProgress(BigInt(reserve.runs), BigInt(accounts.length), BigInt(accounts.length), now);
  reserve.progress = progress;
  reserve.alert = undefined;
  mockRunExcludedReread(now);
  const view: ReserveCheckView = { ...check, accounts, progress };
  return { __kind__: "ok", ok: view };
}

function mockResumeDex(): Outcome<"resumeDex"> {
  const reserve = mockDexReserve;
  if (!reserve.pause.paused) return dexReserveErr({ __kind__: "notPaused", notPaused: null });
  if (dexReserveUnresolved() > 0n) {
    const symbol = reserve.pause.reason ? DEX_TOKEN_VIEW[reserve.pause.reason.token].symbol : "a token";
    return dexReserveErr({
      __kind__: "checkFailed",
      checkFailed: `A shortfall remains for ${symbol}. Run a new reserve check once the ledger balance matches the internal total.`,
    });
  }
  reserve.pause = {
    paused: false,
    reason: reserve.pause.reason,
    account: reserve.pause.account,
    resumed: { by: CALLER, at: nowNs() },
  };
  return { __kind__: "ok", ok: reserve.pause };
}

function mockDexReserveStatus(): DexReserveStatus {
  const reserve = mockDexReserve;
  return {
    lastCheck: reserve.lastCheck,
    unresolvedShortfallCount: dexReserveUnresolved(),
    checkInProgress: false,
    alert: reserve.alert,
    excludedReread: mockExcludedRereadProgress(),
    progress: reserve.active
      ? mockInProgressView(reserve.active.runId, reserve.active.batch).progress
      : (reserve.progress ??
        reserveProgress(
          0n,
          0n,
          BigInt(DEX_TOKEN_ORDER.length + RESERVE_EXTRA_ACCOUNTS.length),
          0n,
          ReservePhase.idle,
          0n,
          0n,
        )),
    pause: reserve.pause,
    history: [...reserve.history].reverse(),
    accounts: reserve.lastAccounts,
    accountHistory: [...reserve.accountHistory].reverse(),
  };
}

function mockPublicDexPause(): PublicDexPause {
  const { pause } = mockDexReserve;
  return { paused: pause.paused, reasonToken: pause.paused ? pause.reason?.token : undefined };
}

/** Worst status of the last check, for the readiness checklist. */
function mockLastReserveStatus(): ReserveStatus | undefined {
  const results = mockDexReserve.lastCheck?.results;
  if (!results) return undefined;
  if (results.some((r) => r.status === ReserveStatus.shortfall)) return ReserveStatus.shortfall;
  if (results.some((r) => r.status === ReserveStatus.surplus)) return ReserveStatus.surplus;
  return ReserveStatus.ok;
}

// --- DEX custody sweep: legacy accounts, custody comparison, SW and CS review rows. ---

const DEX_CUSTODY_OWNER = principalFrom(7);

function dexCustodyAccount(token: DexToken): Account__5 {
  const subaccount = new Uint8Array(32);
  subaccount[0] = DEX_TOKEN_ORDER.indexOf(token) + 1;
  return { owner: DEX_CUSTODY_OWNER, subaccount };
}

/** Amount of a token in tenths of a whole unit. */
const tenthsOf = (token: DexToken, tenths: bigint): bigint =>
  (tenths * 10n ** BigInt(DEX_TOKEN_VIEW[token].decimals)) / 10n;

/** The simulated custody account of ICP holds this much more than the total owed. */
const CUSTODY_SURPLUS_TOKEN = DexToken.icp;
const CUSTODY_SURPLUS_E8S = 30_000n;

const mockSweepTransfers: Array<SweepTransferView> = [];
const mockSweepRun = { lastRunAt: new Map<DexToken, bigint>(), checkedAt: nowNs() - 2n * HOUR_NS };

function sweepTransfer(
  n: bigint,
  token: DexToken,
  source: SweepTransferView["source"],
  tenths: bigint,
  status: SweepTransferView["status"],
): SweepTransferView {
  const fee = dexTokenFee(token);
  const ledgerBalance = tenthsOf(token, tenths);
  const recordedAt = nowNs() - (30n - n) * HOUR_NS;
  return {
    n,
    token,
    source,
    from: { owner: HOLDER_2 },
    to: dexCustodyAccount(token),
    ledgerBalance,
    amount: ledgerBalance - fee,
    fee,
    status,
    attempt: 1n,
    sends: 1n,
    memoText: `TTTI-SW-${n}`,
    createdAtTimeNs: recordedAt,
    recordedAt,
    lastError: status.__kind__ === "needsReview" ? "Call rejected: the ledger did not answer (outcome unknown)" : undefined,
  };
}

mockSweepTransfers.push(
  sweepTransfer(1n, DexToken.icp, { __kind__: "userDeposit", userDeposit: HOLDER_2 }, 12n, { __kind__: "completed", completed: 9_120_441n }),
  sweepTransfer(2n, DexToken.ckusdc, { __kind__: "pool", pool: 1n }, 25n, { __kind__: "completed", completed: 482_113n }),
  sweepTransfer(3n, DexToken.ckusdt, { __kind__: "userDeposit", userDeposit: HOLDER_3 }, 8n, { __kind__: "needsReview", needsReview: null }),
  sweepTransfer(4n, DexToken.ckbtc, { __kind__: "userDeposit", userDeposit: HOLDER_2 }, 3n, { __kind__: "inProgress", inProgress: null }),
);
for (const token of DEX_TOKEN_ORDER) mockSweepRun.lastRunAt.set(token, nowNs() - 2n * HOUR_NS);

function sweepReviewRow(t: SweepTransferView): TransferReview {
  return {
    ...reviewEntry(TransferKind.SW, t.n, t.memoText, t.amount, t.to, t.sends, t.lastError ?? ""),
    token: t.token,
    fee: t.fee,
    buyer: t.source.__kind__ === "userDeposit" ? t.source.userDeposit : undefined,
  };
}
mockReviews.push(...mockSweepTransfers.filter((t) => t.status.__kind__ === "needsReview").map(sweepReviewRow));

/** Custody ledger balance against the total owed, per token. */
function sweepComparison(token: DexToken): Comparison {
  const userBalances = dexUserBalanceTotal(token);
  const poolReserves = dexPoolReserveTotal(token);
  const poolProtocolFees = token === DexToken.icp ? 120_000n : 0n;
  const routerSetAside = 0n;
  const owed = userBalances + poolReserves + poolProtocolFees + routerSetAside;
  const surplus = token === CUSTODY_SURPLUS_TOKEN ? CUSTODY_SURPLUS_E8S : 0n;
  return {
    checkedAt: mockSweepRun.checkedAt,
    custodyLedger: owed + surplus,
    userBalances,
    poolReserves,
    poolProtocolFees,
    routerSetAside,
    owed,
    surplus,
    shortfall: 0n,
    status:
      surplus > 0n ? Variant_surplus_shortfall_balanced.surplus : Variant_surplus_shortfall_balanced.balanced,
  };
}

function mockSweepState(): Array<TokenState> {
  return DEX_TOKEN_ORDER.map((token) => {
    const own = mockSweepTransfers.filter((t) => t.token === token);
    const completed = own.filter((t) => t.status.__kind__ === "completed");
    const pending = BigInt(own.filter((t) => t.status.__kind__ === "inProgress").length);
    const unknownOutcome = BigInt(own.filter((t) => t.status.__kind__ === "needsReview").length);
    return {
      token,
      custodyAccount: dexCustodyAccount(token),
      lastRunAt: mockSweepRun.lastRunAt.get(token),
      legacyAccountsFound: BigInt(own.length),
      accountsWithBalance: BigInt(own.length),
      accountsSkipped: 0n,
      transfersRecorded: BigInt(own.length),
      ledgerSwept: completed.reduce((sum, t) => sum + t.amount, 0n),
      feesPaid: completed.reduce((sum, t) => sum + t.fee, 0n),
      pending,
      unknownOutcome,
      failed: BigInt(own.filter((t) => t.status.__kind__ === "failed").length),
      notes: own.length === 0 ? ["No legacy account holds a balance above the fee."] : [],
      comparison: sweepComparison(token),
      comparisonPending: pending + unknownOutcome > 0n,
    };
  });
}

function mockSweepProgress(): SweepProgress {
  return {
    runId: BigInt(mockSweepTransfers.length),
    active: false,
    startedAt: mockSweepRun.lastRunAt.get(DexToken.icp),
    lastBatchAt: mockSweepRun.lastRunAt.get(DexToken.icp),
    batchSize: 50n,
    batches: mockSweepTransfers.length === 0 ? 0n : 1n,
    tokenIndex: BigInt(DEX_TOKEN_ORDER.length),
    accountIndex: BigInt(mockSweepTransfers.length),
    tokens: DEX_TOKEN_ORDER.map((token) => {
      const own = mockSweepTransfers.filter((t) => t.token === token);
      return {
        token,
        done: true,
        accountsListed: BigInt(own.length),
        accountsRead: BigInt(own.length),
        withBalance: BigInt(own.length),
        excludedZero: 0n,
        skipped: 0n,
        unreadable: 0n,
        inFlight: BigInt(own.filter((t) => t.status.__kind__ === "inProgress").length),
      };
    }),
  };
}

/** Newest-first page; the cursor is the offset of the next item. Size defaults to 50 and is capped at 100. */
function mockPage<T>(
  newestFirst: Array<T>,
  cursor: bigint | null | undefined,
  limit: bigint,
): { items: Array<T>; nextCursor?: bigint } {
  const size = limit <= 0n ? 50 : Number(limit > 100n ? 100n : limit);
  const start = cursor === null || cursor === undefined ? 0 : Number(cursor);
  const end = start + size;
  return {
    items: newestFirst.slice(start, end),
    ...(end < newestFirst.length ? { nextCursor: BigInt(end) } : {}),
  };
}

/**
 * Newest-first page of the transfers of `owner`. The cursor is the transfer
 * number `n` (global across deposits and withdrawals): the page holds the
 * transfers with n strictly below the cursor, and nextCursor is the n of its
 * last transfer while older ones remain.
 */
function mockDexTransfersPage(
  owner: Principal,
  cursor: bigint | null | undefined,
  limit: bigint,
): { items: Array<DexTransferView>; nextCursor?: bigint } {
  const older = mockDexTransfers
    .filter((t) => t.owner.toText() === owner.toText() && (cursor === null || cursor === undefined || t.n < cursor))
    .sort((a, b) => (a.n === b.n ? 0 : a.n > b.n ? -1 : 1));
  const page = mockPage(older, null, limit);
  const last = page.items[page.items.length - 1];
  return {
    items: page.items,
    ...(page.nextCursor !== undefined && last ? { nextCursor: last.n } : {}),
  };
}

function mockRunDexSweep(): Outcome<"runDexSweep"> {
  const now = nowNs();
  const n = BigInt(mockSweepTransfers.length + 1);
  mockSweepTransfers.push(
    sweepTransfer(n, DexToken.icp, { __kind__: "userDeposit", userDeposit: HOLDER_3 }, 5n, {
      __kind__: "completed",
      completed: 9_200_000n + n,
    }),
  );
  mockSweepTransfers[mockSweepTransfers.length - 1].recordedAt = now;
  for (const token of DEX_TOKEN_ORDER) mockSweepRun.lastRunAt.set(token, now);
  mockSweepRun.checkedAt = now;
  return { __kind__: "ok", ok: mockSweepState() };
}

function mockResendDexSweepTransfers(): Outcome<"resendDexSweepTransfers"> {
  for (const t of mockSweepTransfers) {
    if (t.status.__kind__ === "inProgress") {
      t.status = { __kind__: "completed", completed: 9_300_000n + t.n };
      t.sends += 1n;
    }
  }
  return { __kind__: "ok", ok: mockSweepState() };
}

/** Arrived / Not arrived on an SW review. */
function sweepReviewed(n: bigint, block: bigint | null) {
  const transfer = mockSweepTransfers.find((t) => t.n === n);
  if (!transfer) return;
  transfer.status =
    block === null
      ? { __kind__: "failed", failed: "Not arrived (admin verification)" }
      : { __kind__: "completed", completed: block };
}

/** One CS row per token whose last comparison shows a custody surplus; credited to no one. */
function custodySurplusReviews(): Array<TransferReview> {
  return mockSweepState().flatMap((state): Array<TransferReview> => {
    const surplus = state.comparison?.surplus ?? 0n;
    if (!state.comparison || surplus === 0n) return [];
    const symbol = DEX_TOKEN_VIEW[state.token].symbol;
    return [
      {
        kind: TransferKind.CS,
        purchaseId: BigInt(DEX_TOKEN_ORDER.indexOf(state.token)),
        token: state.token,
        createdAtTimeNs: state.comparison.checkedAt,
        amount: surplus,
        destination: { owner: state.custodyAccount.owner, subaccount: state.custodyAccount.subaccount },
        sends: 0n,
        lastError: `Custody surplus: the ${symbol} custody account holds ${surplus.toString()} base units more than the total owed. Credited to no one; no automatic action.`,
      },
    ];
  });
}

/** Swaps, deposits and liquidity additions refuse while paused; withdrawals and liquidity removal do not. */
function assertDexNotPaused() {
  const { pause } = mockDexReserve;
  if (!pause.paused) return;
  const symbol = pause.reason ? DEX_TOKEN_VIEW[pause.reason.token].symbol : "a token";
  throw new Error(
    `The DEX is paused after a reserve check found a shortfall for ${symbol}. Swaps, deposits and liquidity additions are unavailable. Withdrawals and liquidity removal remain available.`,
  );
}

function dexNewTransfer(
  direction: DexTransferDirection,
  owner: Principal,
  token: DexToken,
  amount: bigint,
  createdAt: bigint,
): DexTransferView {
  const n = nextDexTransferN++;
  mockReincludeExcluded();
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
  mockAuctionWithdrawn(CALLER, token, amount);
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
  const memoText = dexDqMemo(approved.id);
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
  /** Start of the current commitment; equals createdAt for a position that was never locked. */
  lockStartedAt: bigint;
  unlockAt: bigint;
  isCreator: boolean;
  /** Total time removed from the lock by the relay of other commitments. */
  relayReceivedNs: bigint;
  feesCollected0: bigint;
  feesCollected1: bigint;
};
const mockPositions: Array<DexPosition> = [];
/** Protocol-owned (permanent) shares per pool id; counted in the guaranteed depth. */
const dexProtocolShares = new Map<bigint, bigint>();
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

/** Mock-only simulation switch: `?dexRef=rate`, `?dexRef=nosource` or `?dexRef=drift` in the page URL. */
function dexScenario(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("dexRef") ?? "";
  } catch {
    return "";
  }
}

const dexRatesValid = () => mockPrice().usable && dexScenario() !== "rate";

/**
 * Hourly USD rate of a pay token while usable. TTTI-T has no fixed value: its
 * price is the pool price (depth) or the reference price (first deposit).
 */
function dexUsdRate(view: PoolTokenView): bigint | undefined {
  const token = dexTokenOfView(view);
  if (token === undefined || token === DexToken.tttiT) return undefined;
  return dexRatesValid() ? MOCK_PAY_USD_E8[PAY_OF_DEX[token]] : undefined;
}

/** Pool depth at the pool price: twice the non-TTTI-T side for TTTI-T pairs, both sides otherwise. */
function dexDepthAt(pool: PoolView, reserve0 = pool.reserve0, reserve1 = pool.reserve1): PoolDepth {
  const usdOf = (view: PoolTokenView, amount: bigint, rate: bigint) =>
    (amount * rate) / 10n ** BigInt(view.decimals);
  if (pool.kind === PoolKind.tttiPair) {
    const nonTttiIs0 = !pool.token0.isTttiT;
    const view = nonTttiIs0 ? pool.token0 : pool.token1;
    const reserve = nonTttiIs0 ? reserve0 : reserve1;
    const rate = dexUsdRate(view);
    return {
      basis: DepthBasis.twiceNonTttiSide,
      missingRate: { token0: nonTttiIs0 && rate === undefined, token1: !nonTttiIs0 && rate === undefined },
      ...(rate !== undefined ? { usdE8: 2n * usdOf(view, reserve, rate) } : {}),
    };
  }
  const rate0 = dexUsdRate(pool.token0);
  const rate1 = dexUsdRate(pool.token1);
  return {
    basis: DepthBasis.sumOfSides,
    missingRate: { token0: rate0 === undefined, token1: rate1 === undefined },
    ...(rate0 !== undefined && rate1 !== undefined
      ? { usdE8: usdOf(pool.token0, reserve0, rate0) + usdOf(pool.token1, reserve1, rate1) }
      : {}),
  };
}

/**
 * Swap-threshold measure: for a TTTI-T pair the counterpart USD at the hourly rate
 * (equal to the TTTI-T side at the pool price); for a utility pair the sum of both sides.
 */
function dexThresholdMeasure(
  pool: PoolView,
  reserve0 = pool.reserve0,
  reserve1 = pool.reserve1,
): bigint | undefined {
  const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
  if (depth === undefined) return undefined;
  return pool.kind === PoolKind.tttiPair ? depth / 2n : depth;
}

function dexGauge(pool: PoolView, reserve0 = pool.reserve0, reserve1 = pool.reserve1): UsdGauge {
  const depth = dexDepthAt(pool, reserve0, reserve1);
  const measured = dexThresholdMeasure(pool, reserve0, reserve1);
  const targetUsdE8 = DEX_SWAP_THRESHOLD_USD_E8;
  if (measured === undefined) {
    return { targetUsdE8, valueAvailable: false, missingRate: depth.missingRate };
  }
  return {
    currentUsdE8: measured,
    targetUsdE8,
    remainingUsdE8: measured >= targetUsdE8 ? 0n : targetUsdE8 - measured,
    valueAvailable: true,
    missingRate: { token0: false, token1: false },
  };
}

const dexGaugeOpens = (gauge: UsdGauge) =>
  gauge.valueAvailable && (gauge.currentUsdE8 ?? 0n) >= gauge.targetUsdE8;

/** Swap state: removal first, then the hourly rates, then the 10 USD depth threshold (dynamic). */
function dexSwapState(pool: PoolView): SwapState {
  const closed = (reason: SwapState["reason"]): SwapState => ({ open: false, reason });
  if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") {
    return closed({ __kind__: "removed", removed: null });
  }
  if (pool.removal.__kind__ === "executing") {
    return closed({ __kind__: "removalExecuting", removalExecuting: null });
  }
  if (pool.removal.__kind__ === "announced") {
    return closed({
      __kind__: "removalAnnounced",
      removalAnnounced: { effectiveAt: pool.removal.announced.effectiveAt },
    });
  }
  const measured = dexThresholdMeasure(pool);
  if (measured === undefined) return closed({ __kind__: "rateUnavailable", rateUnavailable: null });
  if (measured < DEX_SWAP_THRESHOLD_USD_E8) {
    return closed({
      __kind__: "belowThreshold",
      belowThreshold: { depthUsdE8: measured, thresholdUsdE8: DEX_SWAP_THRESHOLD_USD_E8 },
    });
  }
  return { open: true, reason: { __kind__: "open", open: null } };
}

/** Status follows the depth: #active while the swap threshold is met, #filling below it. */
function dexRefreshOpening(pool: PoolView) {
  if (pool.status === PoolStatus.removed) return;
  pool.status = dexGaugeOpens(dexGauge(pool)) ? PoolStatus.active : PoolStatus.filling;
  pool.acceptsSwaps = dexSwapState(pool).open;
}

/** Executes due removals, then refreshes the opening state of every pool. */
function dexRefreshAllOpenings() {
  dexProcessRemovals();
  for (const pool of mockPools) dexRefreshOpening(pool);
}

// --- PTM-5: consolidated TTTI-T price and pool spreads ----------------------

const DEX_SPREAD_THRESHOLD_BPS = 200n; // 2 %
const DEX_TTTI_UNIT = 10n ** BigInt(TTTI_DECIMALS);

/** Pool price of one TTTI-T in USD (usdE8) from the reserves, when both the rate and the reserves exist. */
function dexTttiPoolPriceUsdE8(
  pool: PoolView,
  reserve0 = pool.reserve0,
  reserve1 = pool.reserve1,
): bigint | undefined {
  if (pool.kind !== PoolKind.tttiPair || pool.status === PoolStatus.removed) return undefined;
  const tttiReserve = pool.token0.isTttiT ? reserve0 : reserve1;
  const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
  if (tttiReserve === 0n || depth === undefined) return undefined;
  return ((depth / 2n) * DEX_TTTI_UNIT) / tttiReserve;
}

const dexCounterSymbol = (pool: PoolView) =>
  pool.token0.isTttiT ? pool.token1.symbol : pool.token0.symbol;

/** Reserves of one pool replaced by the figures expected after a mint. */
type DexReservesOverride = { pool: PoolView; reserve0: bigint; reserve1: bigint };

/** Consolidated price: mean of the open TTTI-T pool prices weighted by their depth. */
function dexConsolidatedPrice(override?: DexReservesOverride): ConsolidatedPrice {
  const computedAt = nowNs();
  const base = { computedAt, hourlySamples: 0n, dailySamples: 0n, sources: [] };
  if (!dexRatesValid()) {
    return { ...base, price: { __kind__: "unavailable", unavailable: ConsolidatedUnavailable.noValidRate } };
  }
  const open =
    dexScenario() === "nosource"
      ? []
      : mockPools.flatMap((pool) => {
          const replaced = override?.pool === pool ? override : undefined;
          const reserve0 = replaced?.reserve0 ?? pool.reserve0;
          const reserve1 = replaced?.reserve1 ?? pool.reserve1;
          const price = dexTttiPoolPriceUsdE8(pool, reserve0, reserve1);
          const depth = dexDepthAt(pool, reserve0, reserve1).usdE8;
          if (price === undefined || depth === undefined) return [];
          const open = replaced
            ? (pool.removal.__kind__ === "none" || pool.removal.__kind__ === "cancelled") &&
              (dexThresholdMeasure(pool, reserve0, reserve1) ?? 0n) >= DEX_SWAP_THRESHOLD_USD_E8
            : dexSwapState(pool).open;
          return open ? [{ pool, price, depth }] : [];
        });
  const total = open.reduce((sum, o) => sum + o.depth, 0n);
  if (open.length === 0 || total === 0n) {
    return { ...base, price: { __kind__: "unavailable", unavailable: ConsolidatedUnavailable.noOpenPool } };
  }
  let assigned = 0n;
  const sources = open.map((o, i) => {
    const weightBps = i === open.length - 1 ? DEX_BPS - assigned : (o.depth * DEX_BPS) / total;
    assigned += weightBps;
    return {
      poolId: o.pool.id,
      counterSymbol: dexCounterSymbol(o.pool),
      priceUsdE8: o.price,
      depthUsdE8: o.depth,
      weightBps,
    };
  });
  const price = open.reduce((sum, o) => sum + o.price * o.depth, 0n) / total;
  return {
    computedAt,
    price: { __kind__: "available", available: price },
    // Simulated rolling averages of the stored 5-minute samples.
    hourlyAverageUsdE8: (price * 9_990n) / DEX_BPS,
    hourlySamples: 12n,
    dailyAverageUsdE8: (price * 10_015n) / DEX_BPS,
    dailySamples: 288n,
    sources,
  };
}

/** Consolidated price as carried by a mint quote, with the pool reserves replaced when given. */
function dexConsolidatedMintPrice(override?: DexReservesOverride): ConsolidatedMintPrice {
  const { price } = dexConsolidatedPrice(override);
  return price.__kind__ === "available"
    ? { __kind__: "available", available: price.available }
    : { __kind__: "unavailable", unavailable: price.unavailable };
}

/** Spread of a TTTI-T pool versus the consolidated price, as carried by the pool view. */
function dexSpreadOf(pool: PoolView): PoolSpread | undefined {
  return dexPoolSpreads().pools.find((spread) => spread.poolId === pool.id);
}

function dexConsolidatedUsdE8(): bigint | undefined {
  const consolidated = dexConsolidatedPrice();
  return consolidated.price.__kind__ === "available" ? consolidated.price.available : undefined;
}

/** Ratio scale: 10^12 is 100 %. The 50 % target is 5 x 10^11. */
const POOL_CAP_RATIO_SCALE = 1_000_000_000_000n;
const POOL_CAP_TARGET_RATIO = 500_000_000_000n;
/** Locked share scale: 10^6 is 100 %; the maximum m is 50 %. */
const POOL_CAP_LOCKED_SCALE = 1_000_000n;
const POOL_CAP_LOCKED_MAX = 500_000n;

/**
 * Pools value versus capitalisation: 2 x the counterpart reserve of each TTTI-T pool at the
 * simulated oracle rates, over circulating TTTI-T x the instantaneous consolidated price.
 */
function dexPoolCapRatio(): PoolCapRatioView {
  const tttiPools = mockPools.filter(
    (pool) => pool.kind === PoolKind.tttiPair && pool.status !== PoolStatus.removed,
  );
  const depths = tttiPools.map((pool) => dexDepthAt(pool).usdE8);
  const poolsValueUsdE8 =
    tttiPools.length > 0 && depths.every((d) => d !== undefined)
      ? depths.reduce((sum: bigint, d) => sum + (d ?? 0n), 0n)
      : undefined;
  const consolidated = dexConsolidatedPrice();
  const consolidatedPriceUsdE8 =
    consolidated.price.__kind__ === "available" ? consolidated.price.available : undefined;
  const circulatingTttiT = mockTotalSupply();
  const capitalisationUsdE8 =
    consolidatedPriceUsdE8 === undefined
      ? undefined
      : (circulatingTttiT * consolidatedPriceUsdE8) / 100_000_000n;
  const currentRatio =
    poolsValueUsdE8 !== undefined && capitalisationUsdE8 !== undefined && capitalisationUsdE8 > 0n
      ? (poolsValueUsdE8 * POOL_CAP_RATIO_SCALE) / capitalisationUsdE8
      : undefined;
  const averageRatio24h = currentRatio === undefined ? undefined : (currentRatio * 97n) / 100n;
  const retainedRatio =
    currentRatio === undefined || averageRatio24h === undefined
      ? undefined
      : currentRatio < averageRatio24h
        ? currentRatio
        : averageRatio24h;
  let lockedShare = POOL_CAP_LOCKED_MAX;
  if (retainedRatio !== undefined && retainedRatio < POOL_CAP_TARGET_RATIO) {
    const gap = POOL_CAP_TARGET_RATIO - retainedRatio;
    lockedShare =
      (POOL_CAP_LOCKED_MAX * gap + POOL_CAP_TARGET_RATIO - 1n) / POOL_CAP_TARGET_RATIO;
  } else if (retainedRatio !== undefined) {
    lockedShare = 0n;
  }
  return {
    computedAt: nowNs(),
    poolsValueUsdE8,
    poolCount: BigInt(tttiPools.length),
    circulatingTttiT,
    consolidatedPriceUsdE8,
    capitalisationUsdE8,
    currentRatio,
    averageRatio24h,
    samples: averageRatio24h === undefined ? 0n : 288n,
    retainedRatio,
    targetRatio: POOL_CAP_TARGET_RATIO,
    lockedShare,
    ratioScale: POOL_CAP_RATIO_SCALE,
    lockedShareScale: POOL_CAP_LOCKED_SCALE,
  };
}

function dexPoolSpreads(): PoolSpreadReport {
  const consolidated = dexConsolidatedUsdE8();
  const pools: Array<PoolSpread> = mockPools
    .filter((pool) => pool.kind === PoolKind.tttiPair && pool.status !== PoolStatus.removed)
    .map((pool): PoolSpread => {
      const base = { poolId: pool.id, counterSymbol: dexCounterSymbol(pool), exceedsThreshold: false };
      const price = dexTttiPoolPriceUsdE8(pool);
      const tttiReserve = pool.token0.isTttiT ? pool.reserve0 : pool.reserve1;
      if (tttiReserve === 0n) return { ...base, status: SpreadStatus.empty };
      if (price === undefined) return { ...base, status: SpreadStatus.noRate };
      if (!dexSwapState(pool).open) return { ...base, status: SpreadStatus.notOpen, priceUsdE8: price };
      if (consolidated === undefined) {
        return { ...base, status: SpreadStatus.noConsolidatedPrice, priceUsdE8: price };
      }
      const spreadBps = ((price - consolidated) * DEX_BPS) / consolidated;
      const exceedsThreshold = (spreadBps < 0n ? -spreadBps : spreadBps) > DEX_SPREAD_THRESHOLD_BPS;
      return { ...base, status: SpreadStatus.ok, priceUsdE8: price, spreadBps, exceedsThreshold };
    });
  return {
    ...(consolidated !== undefined ? { consolidatedPriceUsdE8: consolidated } : {}),
    computedAt: nowNs(),
    thresholdBps: DEX_SPREAD_THRESHOLD_BPS,
    pools,
  };
}

/** Pools above the threshold where the caller holds a position. */
function dexMySpreadAlerts(): Array<PoolSpreadAlert> {
  const report = dexPoolSpreads();
  const consolidatedPriceUsdE8 = report.consolidatedPriceUsdE8;
  if (consolidatedPriceUsdE8 === undefined) return [];
  return report.pools.flatMap((spread): Array<PoolSpreadAlert> => {
    if (!spread.exceedsThreshold || spread.spreadBps === undefined || spread.priceUsdE8 === undefined) return [];
    const positionIds = mockPositions
      .filter((p) => p.poolId === spread.poolId && p.shares > 0n && p.owner.toText() === CALLER.toText())
      .map((p) => p.id);
    if (positionIds.length === 0) return [];
    return [
      {
        poolId: spread.poolId,
        counterSymbol: spread.counterSymbol,
        spreadBps: spread.spreadBps,
        thresholdBps: report.thresholdBps,
        poolPriceUsdE8: spread.priceUsdE8,
        consolidatedPriceUsdE8,
        computedAt: report.computedAt,
        positionIds,
      },
    ];
  });
}

/**
 * Demo state: the ckUSDC pool at 10 000 USD and the ckBTC pool at 10 350 USD per TTTI-T (about
 * 3 % above the consolidated price), each with a position of the demo user. The other TTTI-T
 * pools stay empty and so have no spread.
 */
function dexSeedSpreadDemo() {
  const seeds: Array<{ counter: DexToken.ckusdc | DexToken.ckbtc; counterAmount: bigint; priceUsdE8: bigint }> = [
    { counter: DexToken.ckusdc, counterAmount: 5_000_000_000n, priceUsdE8: 10_000n * DEX_USD_RATE_SCALE },
    { counter: DexToken.ckbtc, counterAmount: 1_000_000n, priceUsdE8: 10_350n * DEX_USD_RATE_SCALE },
  ];
  for (const seed of seeds) {
    const pool = mockPools.find(
      (p) => p.kind === PoolKind.tttiPair && dexTokenOfView(p.token0.isTttiT ? p.token1 : p.token0) === seed.counter,
    );
    if (!pool) continue;
    const view = pool.token0.isTttiT ? pool.token1 : pool.token0;
    const rate = MOCK_PAY_USD_E8[PAY_OF_DEX[seed.counter]];
    const counterUsdE8 = (seed.counterAmount * rate) / 10n ** BigInt(view.decimals);
    const tttiAmount = (counterUsdE8 * DEX_TTTI_UNIT) / seed.priceUsdE8;
    pool.reserve0 = pool.token0.isTttiT ? tttiAmount : seed.counterAmount;
    pool.reserve1 = pool.token0.isTttiT ? seed.counterAmount : tttiAmount;
    const shares = dexIsqrt(pool.reserve0 * pool.reserve1);
    pool.totalShares = shares;
    const now = nowNs() - 24n * HOUR_NS;
    mockPositions.push({
      id: nextPositionId++,
      poolId: pool.id,
      owner: CALLER,
      shares,
      createdAt: now,
      lockStartedAt: now,
      unlockAt: now,
      isCreator: true,
      relayReceivedNs: 0n,
      feesCollected0: 0n,
      feesCollected1: 0n,
    });
    dexRefreshOpening(pool);
  }
}
dexSeedSpreadDemo();

// --- DEX-2: reference price of the first deposit ---------------------------

const DEX_REF_ICPSWAP_DEPTH_USD_E8 = 4_000n * DEX_USD_RATE_SCALE;
/** Simulated ICPSwap TTTI-T pairs: counter token and price offset from the market price, in bps. */
const DEX_REF_ICPSWAP_PAIRS: Array<{ counter: DexToken; offsetBps: bigint; label: string }> = [
  { counter: DexToken.icp, offsetBps: 40n, label: "ICPSwap TTTI-T/ICP" },
  { counter: DexToken.ckbtc, offsetBps: -30n, label: "ICPSwap TTTI-T/ckBTC" },
  { counter: DexToken.ckusdc, offsetBps: 10n, label: "ICPSwap TTTI-T/ckUSDC" },
  { counter: DexToken.ckusdt, offsetBps: 0n, label: "ICPSwap TTTI-T/ckUSDT" },
];
let dexReferenceReadAt = nowNs() - 12n * 60n * 1_000_000_000n;

/** Simulates reading the ICPSwap pairs again; returns the number of readable pairs. */
function dexRefreshReferenceSources(): number {
  if (dexScenario() === "nosource") return 0;
  dexReferenceReadAt = nowNs();
  return DEX_REF_ICPSWAP_PAIRS.length;
}

function dexReferenceSources(pool: PoolView): Array<ReferenceSource> {
  if (dexScenario() === "nosource") return [];
  const raw: Array<Omit<ReferenceSource, "weightBps">> = DEX_REF_ICPSWAP_PAIRS.map((pair) => ({
    kind: ReferenceSourceKind.icpswap,
    sourceLabel: pair.label,
    counter: pair.counter,
    tttiPriceUsdE8: (DEX_TTTI_T_USD_E8 * (DEX_BPS + pair.offsetBps)) / DEX_BPS,
    depthUsdE8: DEX_REF_ICPSWAP_DEPTH_USD_E8,
    readAt: dexReferenceReadAt,
  }));
  for (const other of mockPools) {
    if (other.id === pool.id || other.kind !== PoolKind.tttiPair || !dexSwapState(other).open) continue;
    const tttiIs0 = other.token0.isTttiT;
    const counterView = tttiIs0 ? other.token1 : other.token0;
    const counter = dexTokenOfView(counterView);
    const depth = dexDepthAt(other).usdE8;
    const tttiReserve = tttiIs0 ? other.reserve0 : other.reserve1;
    if (counter === undefined || depth === undefined || tttiReserve === 0n) continue;
    raw.push({
      kind: ReferenceSourceKind.native,
      sourceLabel: `TTTI pool ${other.token0.symbol}/${other.token1.symbol}`,
      poolId: other.id,
      counter,
      tttiPriceUsdE8: (depth / 2n * 10n ** BigInt(TTTI_DECIMALS)) / tttiReserve,
      depthUsdE8: depth,
      readAt: nowNs(),
    });
  }
  const total = raw.reduce((sum, source) => sum + source.depthUsdE8, 0n);
  let assigned = 0n;
  return raw.map((source, index) => {
    const weightBps = index === raw.length - 1 ? DEX_BPS - assigned : (source.depthUsdE8 * DEX_BPS) / total;
    assigned += weightBps;
    return { ...source, weightBps };
  });
}

/** Reference ratio (amount1 per amount0, base units) of a pool with its sources and weights. */
function dexReference(pool: PoolView): ReferencePrice {
  const ratesValid = dexRatesValid();
  const base = { poolId: pool.id, kind: pool.kind, computedAt: nowNs(), toleranceBps: DEX_REFERENCE_TOLERANCE_BPS };
  const rate0 = dexUsdRate(pool.token0);
  const rate1 = dexUsdRate(pool.token1);
  const d0 = 10n ** BigInt(pool.token0.decimals);
  const d1 = 10n ** BigInt(pool.token1.decimals);
  if (pool.kind !== PoolKind.tttiPair) {
    if (rate0 === undefined || rate1 === undefined) {
      return {
        ...base,
        available: false,
        ratesValid,
        sources: [],
        unavailable: {
          __kind__: "rateUnavailable",
          rateUnavailable: { token0: rate0 === undefined, token1: rate1 === undefined },
        },
      };
    }
    return {
      ...base,
      available: true,
      ratesValid,
      sources: [],
      expected: { numerator: rate0 * d1, denominator: rate1 * d0 },
    };
  }
  const tttiIs0 = pool.token0.isTttiT;
  const counterRate = tttiIs0 ? rate1 : rate0;
  const sources = dexReferenceSources(pool);
  if (counterRate === undefined) {
    return {
      ...base,
      available: false,
      ratesValid,
      sources,
      unavailable: {
        __kind__: "rateUnavailable",
        rateUnavailable: { token0: !tttiIs0, token1: tttiIs0 },
      },
    };
  }
  if (sources.length === 0) {
    return { ...base, available: false, ratesValid, sources, unavailable: { __kind__: "noReadableSource", noReadableSource: null } };
  }
  const price = sources.reduce((sum, s) => sum + s.tttiPriceUsdE8 * s.weightBps, 0n) / DEX_BPS;
  const tttiUnit = 10n ** BigInt(TTTI_DECIMALS);
  const counterUnit = tttiIs0 ? d1 : d0;
  // Counter units per TTTI-T unit: price x counterUnit / (counterRate x tttiUnit).
  const expected: Ratio = tttiIs0
    ? { numerator: price * counterUnit, denominator: counterRate * tttiUnit }
    : { numerator: counterRate * tttiUnit, denominator: price * counterUnit };
  return { ...base, available: true, ratesValid, sources, tttiPriceUsdE8: price, expected };
}

/** First-deposit check of the amounts against the reference ratio. */
function dexReferenceCheck(pool: PoolView, isFirstDeposit: boolean, amount0: bigint, amount1: bigint): ReferenceCheck {
  const toleranceBps = DEX_REFERENCE_TOLERANCE_BPS;
  if (!isFirstDeposit) return { applicable: false, withinBand: true, toleranceBps };
  const reference = dexReference(pool);
  if (!reference.available || !reference.expected) {
    return { applicable: true, withinBand: false, toleranceBps, unavailable: reference.unavailable };
  }
  const { numerator, denominator } = reference.expected;
  const expectedAmount1 = numerator * amount0;
  const actualScaled = amount1 * denominator;
  const gap = actualScaled > expectedAmount1 ? actualScaled - expectedAmount1 : expectedAmount1 - actualScaled;
  const deviationBps = expectedAmount1 === 0n ? 0n : (gap * DEX_BPS) / expectedAmount1;
  return {
    applicable: true,
    withinBand: deviationBps <= toleranceBps,
    expected: reference.expected,
    deviationBps,
    toleranceBps,
  };
}

// --- DEX-2: announced pair removal and liquidation -------------------------

type DexLqPayout = {
  n: bigint;
  poolId: bigint;
  positionId: bigint;
  owner: Principal;
  token: DexToken;
  amount: bigint;
  memoText: string;
  createdAtTimeNs: bigint;
  /** Outcome unknown: listed in To review with kind LQ until the admin decides. */
  review: boolean;
};
const mockLqPayouts: Array<DexLqPayout> = [];
let nextLqPayoutN = 1n;
/** One simulated payout fails (outcome unknown) in the first executed removal. */
let dexLqFailureUsed = false;

/** Liquidates every position of a pool: pool debited, owner credited, payout sent to the owner wallet. */
function dexLiquidatePool(pool: PoolView, at: bigint) {
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  const positions = mockPositions.filter((p) => p.poolId === pool.id);
  const payouts: Array<DexLqPayout> = [];
  for (const position of positions) {
    const total = pool.totalShares;
    const amount0 = total > 0n ? (position.shares * pool.reserve0) / total : 0n;
    const amount1 = total > 0n ? (position.shares * pool.reserve1) / total : 0n;
    pool.reserve0 -= amount0;
    pool.reserve1 -= amount1;
    pool.totalShares -= position.shares;
    for (const [token, amount] of [
      [token0, amount0],
      [token1, amount1],
    ] as const) {
      if (token === undefined || amount === 0n) continue;
      const balance = dexBalanceOf(position.owner, token);
      balance.available += amount;
      // At or below the ledger fee nothing is sent: the amount stays in the internal balance.
      if (amount <= dexTokenFee(token)) continue;
      const n = nextLqPayoutN++;
      payouts.push({
        n,
        poolId: pool.id,
        positionId: position.id,
        owner: position.owner,
        token,
        amount,
        memoText: `TTTI-LQ-${n}`,
        createdAtTimeNs: at,
        review: false,
      });
    }
    mockPositions.splice(mockPositions.indexOf(position), 1);
  }
  if (!dexLqFailureUsed && payouts.length > 0) {
    dexLqFailureUsed = true;
    payouts[payouts.length - 1].review = true;
  }
  for (const payout of payouts) {
    const balance = dexBalanceOf(payout.owner, payout.token);
    balance.available -= payout.amount;
    if (payout.review) {
      balance.reserved += payout.amount;
      mockLqPayouts.push(payout);
      mockReviews.push(dexLqReview(payout));
    }
  }
}

function dexLqReview(payout: DexLqPayout): TransferReview {
  return {
    kind: TransferKind.LQ,
    purchaseId: payout.n,
    token: payout.token,
    memoText: payout.memoText,
    memoHex: memoHexOf(payout.memoText),
    createdAtTimeNs: payout.createdAtTimeNs,
    amount: payout.amount - dexTokenFee(payout.token),
    fee: dexTokenFee(payout.token),
    destination: { owner: payout.owner },
    sends: 4n,
    lastError: "Call timed out (outcome unknown)",
    buyer: payout.owner,
  };
}

/** Arrived: the reserved amount is debited for good. Not arrived: a new attempt is sent later. */
function dexLqArrived(n: bigint) {
  const index = mockLqPayouts.findIndex((p) => p.n === n);
  if (index < 0) return;
  const payout = mockLqPayouts[index];
  dexBalanceOf(payout.owner, payout.token).reserved -= payout.amount;
  mockLqPayouts.splice(index, 1);
}

/**
 * PTM-9b, finishRemoval of a TTTI-T pair: what the contract still holds in the pool (its locked and
 * permanent shares) is reinjected into the least liquid TTTI-T pool as locked shares, with a line in
 * the public permanent liquidity log (kind injected). No wallet receives it.
 */
function dexReinjectRemovedReserves(pool: PoolView, at: bigint) {
  if (pool.kind !== PoolKind.tttiPair) return;
  const tttiAmount = pool.token0.isTttiT ? pool.reserve0 : pool.reserve1;
  const counterAmount = pool.token0.isTttiT ? pool.reserve1 : pool.reserve0;
  if (tttiAmount === 0n && counterAmount === 0n) return;
  const targets = mockPools.filter(
    (p) =>
      p.id !== pool.id &&
      p.kind === PoolKind.tttiPair &&
      p.status !== PoolStatus.removed &&
      p.removal.__kind__ !== "announced" &&
      p.removal.__kind__ !== "executing",
  );
  if (targets.length === 0) return;
  const depthOf = (p: PoolView): bigint => dexDepthAt(p).usdE8 ?? 0n;
  const target = targets.reduce((least, p) => (depthOf(p) < depthOf(least) ? p : least));
  const fromView = pool.token0.isTttiT ? pool.token1 : pool.token0;
  const toView = target.token0.isTttiT ? target.token1 : target.token0;
  const fromRate = dexUsdRate(fromView);
  const toRate = dexUsdRate(toView);
  // The counter token of the removed pair is valued at the rates of the hour and carried to the target's counter token.
  const counterInTarget =
    fromRate !== undefined && toRate !== undefined
      ? (((counterAmount * fromRate) / 10n ** BigInt(fromView.decimals)) * 10n ** BigInt(toView.decimals)) / toRate
      : 0n;
  pool.reserve0 = 0n;
  pool.reserve1 = 0n;
  pool.totalShares = 0n;
  pool.lockedShares = 0n;
  dexProtocolShares.delete(pool.id);
  const heldIndex = mockProtocolLiquidity.findIndex((e) => e.poolId === pool.id);
  if (heldIndex >= 0) mockProtocolLiquidity.splice(heldIndex, 1);
  const shares = target.token0.isTttiT
    ? lot4AddProtocolLiquidity(target, tttiAmount, counterInTarget, "fees", at)
    : lot4AddProtocolLiquidity(target, counterInTarget, tttiAmount, "fees", at);
  dexRefreshOpening(target);
  const toToken = dexTokenOfView(toView);
  if (toToken === undefined) return;
  mockPermanentLog.push({
    id: mockPermanentLog.reduce((max, e) => (e.id > max ? e.id : max), 0n) + 1n,
    at,
    kind: PermanentKind.injected,
    token: toToken,
    amount: counterInTarget,
    otherToken: DexToken.tttiT,
    otherAmount: tttiAmount,
    route: { __kind__: "native", native: target.id },
    poolId: target.id,
    shares,
    reason: `Reserves held by the contract after the removal of the ${pool.token0.symbol}/${pool.token1.symbol} pair.`,
  });
}

/** At the effective date: liquidates every position and sets the pool to removed. */
function dexProcessRemovals() {
  const now = nowNs();
  for (const pool of mockPools) {
    const removal = pool.removal;
    if (removal.__kind__ !== "announced" || removal.announced.effectiveAt > now) continue;
    const info = removal.announced;
    pool.removal = { __kind__: "executing", executing: { ...info, startedAt: info.effectiveAt } };
    dexLiquidatePool(pool, info.effectiveAt);
    dexReinjectRemovedReserves(pool, info.effectiveAt);
    const completedAt = dexMin(now, info.effectiveAt + 120_000_000_000n);
    pool.status = PoolStatus.removed;
    pool.removedAt = completedAt;
    pool.acceptsSwaps = false;
    pool.removal = { __kind__: "completed", completed: { ...info, completedAt } };
  }
  dexSharingTimer();
}

function dexPositionView(position: DexPosition): PositionView {
  const pool = mockPools.find((p) => p.id === position.poolId);
  const total = pool?.totalShares ?? 0n;
  const now = nowNs();
  const remainingNs = position.unlockAt > now ? position.unlockAt - now : 0n;
  const unlocked = remainingNs === 0n;
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
    lockDurationNs: position.unlockAt > position.lockStartedAt ? position.unlockAt - position.lockStartedAt : 0n,
    lockStartedAt: position.lockStartedAt,
    unlockAt: position.unlockAt,
    remainingNs,
    locked: !unlocked,
    relayReceivedNs: position.relayReceivedNs,
    feesCollected0: position.feesCollected0,
    feesCollected1: position.feesCollected1,
    isCreator: position.isCreator,
    unlocked,
    withdrawable: unlocked,
  };
}

/** Locked positions plus permanent liquidity: the depth that cannot leave the pool before its term. */
function dexGuaranteedDepth(pool: PoolView): GuaranteedDepth {
  const now = nowNs();
  const lockedPositionShares = mockPositions
    .filter((p) => p.poolId === pool.id && p.unlockAt > now)
    .reduce((sum, p) => sum + p.shares, 0n);
  const permanentShares = pool.lockedShares + (dexProtocolShares.get(pool.id) ?? 0n);
  const guaranteed = lockedPositionShares + permanentShares;
  const total = pool.totalShares;
  const amount0 = total > 0n ? (guaranteed * pool.reserve0) / total : 0n;
  const amount1 = total > 0n ? (guaranteed * pool.reserve1) / total : 0n;
  return { lockedPositionShares, permanentShares, amount0, amount1, depth: dexDepthAt(pool, amount0, amount1) };
}

/**
 * Relay of a commitment: one third of its weight (capital x time) shortens the committed
 * positions of the pool in proportion to capital x time served. No lock is lengthened;
 * a position whose remaining time reaches zero stays in the pool as free liquidity.
 */
function dexRelay(pool: PoolView, source: DexPosition, weight: bigint, now: bigint): RelayOutcome {
  const relayWeight = weight / DEX_RELAY_DIVISOR;
  const none: RelayOutcome = { weight, relayWeight, shortenedWeight: 0n, positionsShortened: 0n, positionsFreed: 0n };
  if (relayWeight === 0n) return none;
  const served = mockPositions
    .filter((p) => p.poolId === pool.id && p !== source && p.unlockAt > now && p.shares > 0n)
    .map((p) => ({ p, basis: p.shares * (now > p.lockStartedAt ? now - p.lockStartedAt : 0n) }));
  const totalBasis = served.reduce((sum, x) => sum + x.basis, 0n);
  if (totalBasis === 0n) return none;
  let shortenedWeight = 0n;
  let positionsShortened = 0n;
  let positionsFreed = 0n;
  for (const { p, basis } of served) {
    if (basis === 0n) continue;
    const cut = dexMin((relayWeight * basis) / totalBasis / p.shares, p.unlockAt - now);
    if (cut === 0n) continue;
    p.unlockAt -= cut;
    p.relayReceivedNs += cut;
    shortenedWeight += cut * p.shares;
    positionsShortened += 1n;
    if (p.unlockAt <= now) positionsFreed += 1n;
  }
  return { weight, relayWeight, shortenedWeight, positionsShortened, positionsFreed };
}

const DEX_SHARING_DAY_NS = 86_400_000_000_000n;

/**
 * Pending pot of a pool: the locked half of the LP fees (pending0/1), frozen at the day roll and
 * shared in slices among the positions locked during the day (summing pass, then paying pass).
 */
type DexPot = {
  pending0: bigint;
  pending1: bigint;
  phase: SharingPhase;
  frozen0: bigint;
  frozen1: bigint;
  sharedDayStart: bigint;
  totalProduct: bigint;
  paid0: bigint;
  paid1: bigint;
};
const dexPots = new Map<bigint, DexPot>();
const dexDayStartOf = (t: bigint) => t - (t % DEX_SHARING_DAY_NS);
/** Start of the current sharing day; nextSharingAt is one day later. */
const dexSharing = { dayStart: dexDayStartOf(nowNs()) };

function dexPotOf(poolId: bigint): DexPot {
  let pot = dexPots.get(poolId);
  if (!pot) {
    pot = {
      pending0: 0n,
      pending1: 0n,
      phase: SharingPhase.idle,
      frozen0: 0n,
      frozen1: 0n,
      sharedDayStart: 0n,
      totalProduct: 0n,
      paid0: 0n,
      paid1: 0n,
    };
    dexPots.set(poolId, pot);
  }
  return pot;
}

type DexShareLine = {
  p: DexPosition;
  weight: bigint;
  lockedNs: bigint;
  dayFractionBps: bigint;
  /** weight x ns locked during the day: the basis of the share. */
  basis: bigint;
};

/** Positions locked during a day: capital x sqrt(remaining time / 5 years) taken at max(day start, lock start). */
function dexShareLines(pool: PoolView, dayStart: bigint): Array<DexShareLine> {
  const dayEnd = dayStart + DEX_SHARING_DAY_NS;
  const lines: Array<DexShareLine> = [];
  for (const p of mockPositions) {
    if (p.poolId !== pool.id || p.shares === 0n) continue;
    const from = p.lockStartedAt > dayStart ? p.lockStartedAt : dayStart;
    const to = p.unlockAt < dayEnd ? p.unlockAt : dayEnd;
    if (to <= from) continue;
    const lockedNs = to - from;
    const dayFractionBps = (lockedNs * 10_000n) / DEX_SHARING_DAY_NS;
    const weight =
      p.shares * dexIsqrt((dexMin(p.unlockAt - from, DEX_MAX_LOCK_NS) * 10n ** 18n) / DEX_MAX_LOCK_NS);
    lines.push({ p, weight, lockedNs, dayFractionBps, basis: weight * lockedNs });
  }
  return lines;
}

/** Estimated shares of every position locked during the current day of a pool, as if the pot were shared now. */
function dexPoolEstimates(pool: PoolView): Array<EstimatedShareView> {
  const pot = dexPotOf(pool.id);
  const lines = dexShareLines(pool, dexSharing.dayStart);
  const total = lines.reduce((sum, l) => sum + l.basis, 0n);
  return lines.map((line) => ({
    positionId: line.p.id,
    poolId: pool.id,
    owner: line.p.owner,
    weight: line.weight,
    lockedNs: line.lockedNs,
    dayFractionBps: line.dayFractionBps,
    estimated0: total > 0n ? (pot.pending0 * line.basis) / total : 0n,
    estimated1: total > 0n ? (pot.pending1 * line.basis) / total : 0n,
    nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS,
  }));
}

function dexPendingPotView(pool: PoolView): PendingPotView {
  const pot = dexPotOf(pool.id);
  return {
    poolId: pool.id,
    pending0: pot.pending0,
    pending1: pot.pending1,
    dayStart: dexSharing.dayStart,
    nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS,
    sharingRunning: pot.phase !== SharingPhase.idle,
  };
}

/** One sharing slice of a pool (all its positions fit in one slice): summing pass, then paying pass. */
function dexRunPotSlice(pool: PoolView): PotSliceReport {
  const pot = dexPotOf(pool.id);
  const idle: PotSliceReport = { poolId: pool.id, phase: SharingPhase.idle, processed: 0n, more: false, paid0: 0n, paid1: 0n };
  if (pot.phase === SharingPhase.idle) return idle;
  const lines = dexShareLines(pool, pot.sharedDayStart);
  if (pot.phase === SharingPhase.summing) {
    pot.totalProduct = lines.reduce((sum, l) => sum + l.basis, 0n);
    pot.phase = SharingPhase.paying;
    return { ...idle, phase: SharingPhase.summing, processed: BigInt(lines.length), more: true };
  }
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (pot.totalProduct > 0n && token0 !== undefined && token1 !== undefined) {
    for (const line of lines) {
      const part0 = (pot.frozen0 * line.basis) / pot.totalProduct;
      const part1 = (pot.frozen1 * line.basis) / pot.totalProduct;
      line.p.feesCollected0 += part0;
      line.p.feesCollected1 += part1;
      dexBalanceOf(line.p.owner, token0).available += part0;
      dexBalanceOf(line.p.owner, token1).available += part1;
      pot.paid0 += part0;
      pot.paid1 += part1;
    }
  }
  const report: PotSliceReport = {
    poolId: pool.id,
    phase: SharingPhase.paying,
    processed: BigInt(lines.length),
    more: false,
    paid0: pot.paid0,
    paid1: pot.paid1,
  };
  // Rounding dust goes back to the next pot.
  pot.pending0 += pot.frozen0 - pot.paid0;
  pot.pending1 += pot.frozen1 - pot.paid1;
  pot.frozen0 = 0n;
  pot.frozen1 = 0n;
  pot.paid0 = 0n;
  pot.paid1 = 0n;
  pot.totalProduct = 0n;
  pot.phase = SharingPhase.idle;
  return report;
}

/**
 * Day roll, once the day is over: freezes each pool's pending pot and starts its sliced sharing.
 * A pool with no position locked during the day moves its pot to the pool reserves.
 */
function dexStartDayRoll(): DayRollReport {
  const now = nowNs();
  const nextSharingAt = dexSharing.dayStart + DEX_SHARING_DAY_NS;
  if (now < nextSharingAt) {
    return { rolled: false, dayStart: dexSharing.dayStart, nextSharingAt, poolsStarted: 0n };
  }
  let poolsStarted = 0n;
  for (const pool of mockPools) {
    const pot = dexPotOf(pool.id);
    while (pot.phase !== SharingPhase.idle) dexRunPotSlice(pool);
    if (pot.pending0 === 0n && pot.pending1 === 0n) continue;
    if (dexShareLines(pool, dexSharing.dayStart).length === 0) {
      pool.reserve0 += pot.pending0;
      pool.reserve1 += pot.pending1;
    } else {
      pot.frozen0 = pot.pending0;
      pot.frozen1 = pot.pending1;
      pot.sharedDayStart = dexSharing.dayStart;
      pot.phase = SharingPhase.summing;
      poolsStarted += 1n;
    }
    pot.pending0 = 0n;
    pot.pending1 = 0n;
  }
  dexSharing.dayStart = dexDayStartOf(now);
  return { rolled: true, dayStart: dexSharing.dayStart, nextSharingAt: dexSharing.dayStart + DEX_SHARING_DAY_NS, poolsStarted };
}

/** The recurring timer: rolls the day when it is over and runs the pending slices. */
function dexSharingTimer() {
  dexStartDayRoll();
  for (const pool of mockPools) {
    const pot = dexPotOf(pool.id);
    while (pot.phase !== SharingPhase.idle) dexRunPotSlice(pool);
  }
}

/**
 * Sets aside the locked half of an LP fee into the pool's pending pot. Returns the amount set
 * aside; nothing is set aside without a locked position, and the rest of the fee stays in the reserves.
 */
function dexCreditLockedFees(pool: PoolView, _tokenIn: DexToken, inIsToken0: boolean, lpFee: bigint): bigint {
  const now = nowNs();
  const setAside = (lpFee * DEX_LOCKED_FEE_SHARE_PERCENT) / 100n;
  const anyLocked = mockPositions.some((p) => p.poolId === pool.id && p.unlockAt > now && p.shares > 0n);
  if (setAside === 0n || !anyLocked) return 0n;
  const pot = dexPotOf(pool.id);
  if (inIsToken0) pot.pending0 += setAside;
  else pot.pending1 += setAside;
  return setAside;
}

type DexAddPlan = { pool: PoolView; token0: DexToken; token1: DexToken; quote: AddLiquidityQuote };

function dexPlanAdd(args: AddLiquidityQuoteArgs): DexPlan<DexAddPlan, AddLiquidityError> {
  const fail = (err: AddLiquidityError): DexPlan<DexAddPlan, AddLiquidityError> => ({ __kind__: "err", err });
  dexProcessRemovals();
  const pool = mockPools.find((p) => p.id === args.poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  if (pool.status === PoolStatus.removed || pool.removal.__kind__ === "completed") {
    return fail({ __kind__: "poolRemoved", poolRemoved: null });
  }
  if (pool.removal.__kind__ === "announced" || pool.removal.__kind__ === "executing") {
    const effectiveAt =
      pool.removal.__kind__ === "announced" ? pool.removal.announced.effectiveAt : pool.removal.executing.effectiveAt;
    return fail({ __kind__: "removalAnnounced", removalAnnounced: { effectiveAt } });
  }
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (token0 === undefined || token1 === undefined) {
    return fail({ __kind__: "unsupportedToken", unsupportedToken: null });
  }
  const slippageBps = args.slippageBps ?? DEX_DEFAULT_SLIPPAGE_BPS;
  if (slippageBps > DEX_MAX_SLIPPAGE_BPS) {
    return fail({ __kind__: "invalidSlippage", invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS } });
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
    // No first-deposit minimum. Locked shares = min(usual minimum, total / 2);
    // a single-side minimum takes the other side at the deposit ratio.
    const m0 = pool.minimumLocked.token0;
    const m1 = pool.minimumLocked.token1;
    const locked0 = m0 ?? (m1 !== undefined ? dexCeilDiv(m1 * amount0, amount1) : 0n);
    const locked1 = m1 ?? (m0 !== undefined ? dexCeilDiv(m0 * amount1, amount0) : 0n);
    const total = dexIsqrt(amount0 * amount1);
    lockedShares = dexMin(dexIsqrt(locked0 * locked1), total / 2n);
    shares = total > lockedShares ? total - lockedShares : 0n;
  } else {
    if (pool.reserve0 === 0n || pool.reserve1 === 0n) {
      return fail({ __kind__: "zeroShares", zeroShares: null });
    }
    // The fixed side is the given amount; the counter side comes from the pool ratio, rounded up.
    amount0 = onToken0 ? args.amount : dexCeilDiv(args.amount * pool.reserve0, pool.reserve1);
    amount1 = onToken0 ? dexCeilDiv(args.amount * pool.reserve1, pool.reserve0) : args.amount;
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
        slippageBps,
        counterSide: onToken0 ? PoolSide.token1 : PoolSide.token0,
        counterAmount: onToken0 ? amount1 : amount0,
        ...(gaugeAfter.currentUsdE8 !== undefined ? { depthAfterUsdE8: gaugeAfter.currentUsdE8 } : {}),
        referenceCheck: dexReferenceCheck(pool, isFirstDeposit, amount0, amount1),
      },
    },
  };
}

function mockQuoteAddLiquidity(args: AddLiquidityQuoteArgs): Outcome<"quoteAddLiquidity"> {
  const plan = dexPlanAdd(args);
  return plan.__kind__ === "err" ? plan : { __kind__: "ok", ok: plan.ok.quote };
}

function mockAddLiquidity(owner: Principal, args: AddLiquidityArgs): Outcome<"addLiquidity"> {
  const fail = (err: AddLiquidityError): Outcome<"addLiquidity"> => ({ __kind__: "err", err });
  const lockDurationNs = args.lockDurationNs ?? 0n;
  // No lock (0) is allowed; a commitment lasts from 3 months to 5 years.
  if (lockDurationNs > 0n && lockDurationNs < DEX_MIN_LOCK_NS) {
    return fail({ __kind__: "lockTooShort", lockTooShort: { minimumNs: DEX_MIN_LOCK_NS } });
  }
  if (lockDurationNs > DEX_MAX_LOCK_NS) {
    return fail({ __kind__: "lockTooLong", lockTooLong: { maximumNs: DEX_MAX_LOCK_NS } });
  }
  // `?dexRef=drift` simulates a concurrent swap that moves the pool ratio before execution.
  const drifting = dexScenario() === "drift";
  const target = mockPools.find((p) => p.id === args.poolId);
  if (drifting && target && target.totalShares > 0n && target.reserve1 > 0n) {
    target.reserve1 += target.reserve1 / 50n;
  }
  const plan = dexPlanAdd(args);
  if (plan.__kind__ === "err") return plan;
  const { pool, token0, token1, quote } = plan.ok;
  const onToken0 = args.side === PoolSide.token0;
  const check = quote.referenceCheck;
  if (check.applicable && !check.withinBand) {
    if (check.unavailable) return fail({ __kind__: "referenceUnavailable", referenceUnavailable: check.unavailable });
    if (check.expected && check.deviationBps !== undefined) {
      return fail({
        __kind__: "referenceOutOfBand",
        referenceOutOfBand: {
          expected: check.expected,
          deviationBps: check.deviationBps,
          toleranceBps: check.toleranceBps,
        },
      });
    }
  }
  // Later deposits: the counter amount seen in the quote is the slippage reference.
  if (!quote.isFirstDeposit && args.counterAmount !== undefined) {
    const limit = (args.counterAmount * (DEX_BPS + quote.slippageBps)) / DEX_BPS;
    if (quote.counterAmount > limit) {
      return fail({
        __kind__: "slippageExceeded",
        slippageExceeded: {
          toleranceBps: quote.slippageBps,
          expectedCounterAmount: args.counterAmount,
          actualCounterAmount: quote.counterAmount,
        },
      });
    }
  }
  // Only the amounts that match the shares are used; the rest of each side stays in the internal balance.
  const total = pool.totalShares;
  const used0 = quote.isFirstDeposit ? quote.amount0 : dexMin(quote.amount0, dexCeilDiv(quote.shares * pool.reserve0, total));
  const used1 = quote.isFirstDeposit ? quote.amount1 : dexMin(quote.amount1, dexCeilDiv(quote.shares * pool.reserve1, total));
  const offered0 = onToken0 || args.counterAmount === undefined ? quote.amount0 : args.counterAmount;
  const offered1 = !onToken0 || args.counterAmount === undefined ? quote.amount1 : args.counterAmount;
  const balance0 = dexBalanceOf(owner, token0);
  const balance1 = dexBalanceOf(owner, token1);
  for (const [token, balance, required] of [
    [token0, balance0, quote.amount0],
    [token1, balance1, quote.amount1],
  ] as const) {
    if (balance.available < required) {
      return fail({
        __kind__: "insufficientBalance",
        insufficientBalance: { token, available: balance.available, required },
      });
    }
  }
  balance0.available -= used0;
  balance1.available -= used1;
  pool.reserve0 += used0;
  pool.reserve1 += used1;
  pool.totalShares = quote.totalSharesAfter;
  pool.lockedShares += quote.lockedShares;
  const now = nowNs();
  const position: DexPosition = {
    id: nextPositionId++,
    poolId: pool.id,
    owner,
    shares: quote.shares,
    createdAt: now,
    lockStartedAt: now,
    unlockAt: now + lockDurationNs,
    isCreator: owner.toText() === DEX_CREATOR.toText(),
    relayReceivedNs: 0n,
    feesCollected0: 0n,
    feesCollected1: 0n,
  };
  mockPositions.push(position);
  const relay = dexRelay(pool, position, quote.shares * lockDurationNs, now);
  dexRefreshOpening(pool);
  return {
    __kind__: "ok",
    ok: {
      position: dexPositionView(position),
      amount0: used0,
      amount1: used1,
      shares: quote.shares,
      lockedShares: quote.lockedShares,
      surplus0: offered0 > used0 ? offered0 - used0 : 0n,
      surplus1: offered1 > used1 ? offered1 - used1 : 0n,
      pool: dexPoolOut(pool),
      relay,
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
  // Withdrawals stay open in every pool state, subject to the lock (unlockAt) only.
  if (nowNs() < position.unlockAt) {
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
  dexRefreshOpening(pool);
  return {
    __kind__: "ok",
    ok: { positionId, poolId: pool.id, shares: position.shares, amount0, amount1, pool: dexPoolOut(pool) },
  };
}

function mockExtendLock(positionId: bigint, newUnlockAt: bigint): Outcome<"extendLock"> {
  const fail = (err: ExtendLockError): Outcome<"extendLock"> => ({ __kind__: "err", err });
  dexProcessRemovals();
  const position = mockPositions.find((p) => p.id === positionId);
  if (!position) return fail({ __kind__: "positionNotFound", positionNotFound: null });
  if (position.owner.toText() !== CALLER.toText()) {
    return fail({ __kind__: "notPositionOwner", notPositionOwner: null });
  }
  const pool = mockPools.find((p) => p.id === position.poolId);
  if (!pool) return fail({ __kind__: "poolNotFound", poolNotFound: null });
  const removal = pool.removal;
  if (pool.status === PoolStatus.removed || removal.__kind__ === "completed") {
    return fail({ __kind__: "poolRemoved", poolRemoved: null });
  }
  if (removal.__kind__ === "announced" || removal.__kind__ === "executing") {
    const effectiveAt = removal.__kind__ === "announced" ? removal.announced.effectiveAt : removal.executing.effectiveAt;
    return fail({ __kind__: "removalAnnounced", removalAnnounced: { effectiveAt } });
  }
  const now = nowNs();
  // Same rule as the backend: the REMAINING time after the extension (newUnlockAt - now)
  // is 3 months to 5 years in every case, at opening and after an extension.
  const tooShort = () => fail({ __kind__: "lockTooShort", lockTooShort: { minimumNs: DEX_MIN_LOCK_NS } });
  const tooLong = (maximumUnlockAt: bigint) =>
    fail({ __kind__: "lockTooLong", lockTooLong: { maximumUnlockAt } });
  let added: bigint;
  if (position.unlockAt > now) {
    // Locked position: never shortened; the only bound is the remaining time (no cap from the lock start).
    if (newUnlockAt < position.unlockAt) {
      return fail({ __kind__: "cannotShortenLock", cannotShortenLock: { unlockAt: position.unlockAt } });
    }
    if (newUnlockAt <= now) return tooShort();
    const remaining = newUnlockAt - now;
    if (remaining < DEX_MIN_LOCK_NS) return tooShort();
    if (remaining > DEX_MAX_LOCK_NS) return tooLong(now + DEX_MAX_LOCK_NS);
    added = newUnlockAt - position.unlockAt;
    position.unlockAt = newUnlockAt;
  } else {
    // Free or expired position: committed anew from now.
    if (newUnlockAt <= now) return tooShort();
    const duration = newUnlockAt - now;
    if (duration < DEX_MIN_LOCK_NS) return tooShort();
    if (duration > DEX_MAX_LOCK_NS) return tooLong(now + DEX_MAX_LOCK_NS);
    added = duration;
    position.lockStartedAt = now;
    position.relayReceivedNs = 0n;
    position.unlockAt = newUnlockAt;
  }
  // Only the added weight relays, and never onto the extending position itself.
  const relay =
    added === 0n
      ? { weight: 0n, relayWeight: 0n, shortenedWeight: 0n, positionsShortened: 0n, positionsFreed: 0n }
      : dexRelay(pool, position, position.shares * added, now);
  return { __kind__: "ok", ok: { position: dexPositionView(position), relay, pool: dexPoolOut(pool) } };
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
  dexProcessRemovals();
  const token0 = dexTokenOfView(pool.token0);
  const token1 = dexTokenOfView(pool.token1);
  if (token0 === undefined || token1 === undefined) {
    return fail({ __kind__: "unsupportedToken", unsupportedToken: null });
  }
  if (tokenIn !== token0 && tokenIn !== token1) {
    return fail({ __kind__: "tokenNotInPool", tokenNotInPool: null });
  }
  dexRefreshOpening(pool);
  const swapState = dexSwapState(pool);
  const reason = swapState.reason;
  if (reason.__kind__ === "removed") return fail({ __kind__: "poolRemoved", poolRemoved: null });
  if (reason.__kind__ === "removalAnnounced") {
    return fail({ __kind__: "removalInProgress", removalInProgress: { effectiveAt: reason.removalAnnounced.effectiveAt } });
  }
  if (reason.__kind__ === "removalExecuting") {
    const removal = pool.removal;
    const effectiveAt = removal.__kind__ === "executing" ? removal.executing.effectiveAt : nowNs();
    return fail({ __kind__: "removalInProgress", removalInProgress: { effectiveAt } });
  }
  if (reason.__kind__ === "rateUnavailable") return fail({ __kind__: "rateUnavailable", rateUnavailable: null });
  if (reason.__kind__ === "belowThreshold") {
    return fail({ __kind__: "depthBelowThreshold", depthBelowThreshold: reason.belowThreshold });
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
  dexRefreshAllOpenings();
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
  dexRefreshAllOpenings();
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
  // 30 % of the fee is permanent liquidity (counted apart). Half of the LP fee is set aside for the
  // locked positions and added to the pool's pending pot; the rest stays in the reserves, pro rata to shares.
  const creditedToLocked = dexCreditLockedFees(pool, tokenIn, inIsToken0, quote.lpFee);
  const toReserve = amountIn - quote.protocolFee - creditedToLocked;
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

// Seed: another user makes the first deposit in the TTTI-T/ckUSDT pool (18 USD per side, at the reference ratio).
{
  const pool = mockPools.find(
    (p) => dexSameLedger(p.token0, DEX_TTTI) && dexSameLedger(p.token1, DEX_CKUSDT),
  );
  if (pool) {
    dexBalanceOf(HOLDER_2, DexToken.tttiT).available += 180_000n;
    dexBalanceOf(HOLDER_2, DexToken.ckusdt).available += 18_000_000n;
    mockAddLiquidity(HOLDER_2, {
      poolId: pool.id,
      side: PoolSide.token0,
      amount: 180_000n,
      counterAmount: 18_000_000n,
      lockDurationNs: 730n * 24n * HOUR_NS, // 2 years
    });
  }
}

// --- DEX lot 4: cycles autonomy, protocol fees (DC / DL), mint treasuries ----

const LOT4_FIVE_YEARS_NS = DEX_MAX_LOCK_NS;
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
  dexProtocolShares.set(pool.id, (dexProtocolShares.get(pool.id) ?? 0n) + shares);
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
      lockDurationNs: 182n * LOT4_DAY_NS, // 6 months, within 3 months to 5 years
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

// Seed: the caller holds a 3-year locked position in the TTTI-T/ckUSDT pair.
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
      lockDurationNs: 1_095n * LOT4_DAY_NS,
    });
    if (result.__kind__ === "ok") {
      // Take back what the seed did not use, so the caller's balances stay as before.
      dexBalanceOf(CALLER, DexToken.tttiT).available -= 20_000n - result.ok.amount0;
      dexBalanceOf(CALLER, DexToken.ckusdt).available -= 2_200_000n - result.ok.amount1;
    }
  }
}

// Seed: two more positions of the caller in the same pair, one relieved by the relay (free
// before its term, with the time received) and one without lock (free).
{
  const pool = lot4Pool(DEX_TTTI, DEX_CKUSDT);
  const tokenOffer0 = 12_000n;
  const tokenOffer1 = 3_000_000n;
  if (pool) {
    for (const lockDurationNs of [DEX_MIN_LOCK_NS, 0n]) {
      dexBalanceOf(CALLER, DexToken.tttiT).available += tokenOffer0;
      dexBalanceOf(CALLER, DexToken.ckusdt).available += tokenOffer1;
      const result = mockAddLiquidity(CALLER, {
        poolId: pool.id,
        side: PoolSide.token0,
        amount: tokenOffer0,
        lockDurationNs,
      });
      if (result.__kind__ !== "ok") continue;
      dexBalanceOf(CALLER, DexToken.tttiT).available -= tokenOffer0 - result.ok.amount0;
      dexBalanceOf(CALLER, DexToken.ckusdt).available -= tokenOffer1 - result.ok.amount1;
      const position = mockPositions.find((p) => p.id === result.ok.position.id);
      if (position && lockDurationNs > 0n) {
        // Served 200 days, then the relay of other commitments removed the remaining 348 days.
        const freedAt = nowNs() - 2n * HOUR_NS;
        position.lockStartedAt = freedAt - 200n * LOT4_DAY_NS;
        position.createdAt = position.lockStartedAt;
        position.unlockAt = freedAt;
        position.relayReceivedNs = lockDurationNs - 200n * LOT4_DAY_NS;
      }
    }
  }
}

// --- DEX-2 seeds: one pair with an announced removal and one with a completed removal ---

/** Opens a utility pair at the reference ratio with the given positions (amount0 in base units, lock in days). */
function dexSeedPair(
  token0: PoolTokenView,
  token1: PoolTokenView,
  minimums: TokenMinimums,
  createdAt: bigint,
  deposits: Array<{ owner: Principal; amount0: bigint; lockDays: bigint }>,
): PoolView {
  const pool = dexCreatePool(token0, token1, FeeTier.bps30, createdAt);
  mockSetUtilityPairMinimums(pool.id, minimums);
  const expected = dexReference(pool).expected;
  const view0 = dexTokenOfView(token0);
  const view1 = dexTokenOfView(token1);
  if (!expected || view0 === undefined || view1 === undefined) return pool;
  for (const deposit of deposits) {
    const amount1 = (deposit.amount0 * expected.numerator) / expected.denominator;
    dexBalanceOf(deposit.owner, view0).available += deposit.amount0;
    dexBalanceOf(deposit.owner, view1).available += amount1;
    const result = mockAddLiquidity(deposit.owner, {
      poolId: pool.id,
      side: PoolSide.token0,
      amount: deposit.amount0,
      counterAmount: amount1,
      lockDurationNs: deposit.lockDays * LOT4_DAY_NS,
    });
    if (result.__kind__ === "ok") {
      const position = mockPositions.find((p) => p.id === result.ok.position.id);
      if (position) {
        position.createdAt = createdAt;
        position.lockStartedAt = createdAt;
        position.unlockAt = createdAt + deposit.lockDays * LOT4_DAY_NS;
      }
    }
  }
  return pool;
}

{
  const now = nowNs();
  // Completed removal: announced 6 days ago, effective 1 day ago; one LQ payout is in To review.
  const removed = dexSeedPair(DEX_CKBTC, DEX_CKUSDC, { token0: 10_000n, token1: 1_000_000n }, now - 20n * LOT4_DAY_NS, [
    { owner: HOLDER_2, amount0: 1_000_000n, lockDays: 0n },
    { owner: HOLDER_3, amount0: 500_000n, lockDays: 730n },
  ]);
  removed.removal = {
    __kind__: "announced",
    announced: {
      reason: "No trading activity on this pair for 60 days",
      announcedAt: now - 6n * LOT4_DAY_NS,
      effectiveAt: now - 1n * LOT4_DAY_NS,
    },
  };
  dexProcessRemovals();
  // Announced removal: effective in 3 days; the caller's locked position stays withdrawable subject to its lock.
  const announced = dexSeedPair(DEX_CKBTC, DEX_CKUSDT, { token0: 10_000n, token1: 1_000_000n }, now - 12n * LOT4_DAY_NS, [
    { owner: CALLER, amount0: 500_000n, lockDays: 730n },
    { owner: HOLDER_2, amount0: 500_000n, lockDays: 0n },
  ]);
  announced.removal = {
    __kind__: "announced",
    announced: {
      reason: "Replaced by pairs with deeper liquidity",
      announcedAt: now - 2n * LOT4_DAY_NS,
      effectiveAt: now - 2n * LOT4_DAY_NS + DEX_REMOVAL_NOTICE_NS,
    },
  };
}


/** Value of a position in ICP (e8s) at the mock rates; 0 when a rate is missing. */
function lot4PositionValueIcp(position: PositionView, pool: PoolView): bigint {
  const icpUsd = MOCK_PAY_USD_E8[PayToken.icp];
  const usd = dexDepthAt(pool, position.amount0, position.amount1).usdE8;
  if (usd === undefined || icpUsd === 0n) return 0n;
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

/** Past automatic owner sends keep their destination; ckUSDT keeps an accumulated amount not yet withdrawn. */
const OWNER_WALLET = principalFrom(21);
const mockOwnerDestinations: Record<PayToken, { account?: Account; accumulated: bigint }> = {
  [PayToken.icp]: { account: { owner: OWNER_WALLET }, accumulated: 0n },
  [PayToken.ckbtc]: { account: { owner: OWNER_WALLET }, accumulated: 0n },
  [PayToken.ckusdc]: {
    account: { owner: OWNER_WALLET, subaccount: lot4Subaccount("OWNER-CKUSDC") },
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

// --- Past admin withdrawals (read-only history; there is no withdraw endpoint) ---

const mockWithdrawals: Array<WithdrawalView> = [];
function pushWithdrawal(
  token: PayToken,
  source: TreasurySource,
  amount: bigint,
  destination: Account,
  status: WithdrawalView["status"],
  ageNs: bigint,
): WithdrawalView {
  const id = BigInt(mockWithdrawals.length + 1);
  const at = nowNs() - ageNs;
  const view: WithdrawalView = {
    id,
    token,
    source,
    amount,
    fee: PAY_TOKENS[token].fee,
    destination,
    status,
    block: status.__kind__ === "sent" ? status.sent : undefined,
    memoText: `TTTI-OW-${id}`,
    createdAtTimeNs: at,
    attempt: 1n,
    sends: status.__kind__ === "pending" ? 0n : 1n,
    createdAt: at,
    updatedAt: at,
    requestedBy: CALLER,
  };
  mockWithdrawals.push(view);
  return view;
}
pushWithdrawal(PayToken.icp, TreasurySource.mintTreasury, 150_000_000n, { owner: OWNER_WALLET }, { __kind__: "sent", sent: 18_460_120n }, 3n * LOT4_DAY_NS);
pushWithdrawal(PayToken.ckusdc, TreasurySource.accumulated, 20_000_000n, { owner: OWNER_WALLET, subaccount: lot4Subaccount("OWNER-CKUSDC") }, { __kind__: "sent", sent: 2_330_871n }, 2n * LOT4_DAY_NS);
pushWithdrawal(PayToken.ckbtc, TreasurySource.mintTreasury, 50_000n, { owner: OWNER_WALLET }, { __kind__: "needsReview", needsReview: null }, LOT4_DAY_NS);

// --- Receiving wallets: the 100/101 share of each mint goes directly to the wallet set for the paid token. ---

const HISTORY_TOKEN: Record<PayToken, HistoryToken> = {
  [PayToken.icp]: HistoryToken.icp,
  [PayToken.ckbtc]: HistoryToken.ckbtc,
  [PayToken.ckusdc]: HistoryToken.ckusdc,
  [PayToken.ckusdt]: HistoryToken.ckusdt,
};

function receivingWallet(token: PayToken, wallet: Account | undefined, ageNs: bigint): ReceivingWalletView {
  return wallet
    ? { token, wallet, accountText: encodeAccountText(wallet), setAt: nowNs() - ageNs, setBy: CALLER }
    : { token };
}

/** ckUSDT has no receiving wallet yet: a ckUSDT mint is refused and its settlement waits. */
const mockReceivingWallets: Record<PayToken, ReceivingWalletView> = {
  [PayToken.icp]: receivingWallet(PayToken.icp, { owner: OWNER_WALLET }, 2n * LOT4_DAY_NS),
  [PayToken.ckbtc]: receivingWallet(PayToken.ckbtc, { owner: OWNER_WALLET }, 2n * LOT4_DAY_NS),
  [PayToken.ckusdc]: receivingWallet(
    PayToken.ckusdc,
    { owner: OWNER_WALLET, subaccount: lot4Subaccount("OWNER-CKUSDC") },
    2n * LOT4_DAY_NS,
  ),
  [PayToken.ckusdt]: receivingWallet(PayToken.ckusdt, undefined, 0n),
};

// --- Unified admin history (newest first, filtered by kind and token). ---

const mockHistory: Array<HistoryRow> = [];
function pushHistory(row: Omit<HistoryRow, "id">): HistoryRow {
  const entry: HistoryRow = { id: `H-${mockHistory.length + 1}`, ...row };
  mockHistory.push(entry);
  return entry;
}

const sendStatusText = (status: OwnerSendView["status"]): string =>
  status.__kind__ === "sent"
    ? "Sent"
    : status.__kind__ === "needsReview"
      ? "To review"
      : status.__kind__ === "failed"
        ? "Failed"
        : "Pending";

// Revenue sent rows for the seeded mint sends.
for (const send of mockOwnerSends) {
  if (send.source.__kind__ !== "mint") continue;
  pushHistory({
    kind: HistoryKind.revenueSent,
    token: HISTORY_TOKEN[send.token],
    amount: send.amount,
    status: sendStatusText(send.status),
    detail: `Mint #${send.source.mint}: 100/101 share sent to the receiving wallet`,
    counterparty: encodeAccountText(send.destination),
    memo: send.memoText,
    block: send.block,
    timestamp: send.createdAt,
  });
}
// Destination rows for the configured receiving wallets.
for (const token of PAY_TOKEN_ORDER) {
  const view = mockReceivingWallets[token];
  if (!view.wallet || view.setAt === undefined) continue;
  pushHistory({
    kind: HistoryKind.destination,
    token: HISTORY_TOKEN[token],
    status: "Set",
    detail: `Receiving wallet set for ${PAY_TOKENS[token].symbol}`,
    counterparty: view.accountText,
    timestamp: view.setAt,
  });
}
// One sample row for each remaining kind.
pushHistory({
  kind: HistoryKind.mintDeposit,
  token: HistoryToken.icp,
  amount: 101_000_000n,
  status: "Completed",
  detail: "Mint #41: 1.01 ICP paid, 0.0001 TTTI-T minted",
  counterparty: HOLDER_2.toText(),
  memo: "TTTI-PC-41",
  block: 18_431_219n,
  timestamp: nowNs() - 30n * HOUR_NS,
});
pushHistory({
  kind: HistoryKind.swap,
  token: HistoryToken.ckusdt,
  amount: 25_000_000n,
  status: "Completed",
  detail: "Routed swap ckUSDT -> TTTI-T through ICPSwap",
  counterparty: HOLDER_2.toText(),
  timestamp: nowNs() - 3n * HOUR_NS,
});
pushHistory({
  kind: HistoryKind.liquidity,
  token: HistoryToken.icp,
  amount: 150_000_000n,
  status: "Completed",
  detail: "Mint fee set-aside added as permanent liquidity to the TTTI-T/ICP pool",
  timestamp: nowNs() - 2n * LOT4_DAY_NS,
});
pushHistory({
  kind: HistoryKind.redemption,
  token: HistoryToken.tttiT,
  amount: 5_000n,
  status: "Completed",
  detail: "Redemption of 0.00005 TTTI-T paid in ICP",
  counterparty: HOLDER_3.toText(),
  memo: "TTTI-GR-1",
  block: 18_401_552n,
  timestamp: nowNs() - 6n * LOT4_DAY_NS,
});
pushHistory({
  kind: HistoryKind.refund,
  token: HistoryToken.icp,
  amount: ICP_DIVISOR / 10n,
  status: "To review",
  detail: "Purchase refund with no confirmed outcome after 23 h",
  counterparty: HOLDER_2.toText(),
  memo: "TTTI-RF-1",
  timestamp: nowNs() - 27n * HOUR_NS,
});

function mockListAdminHistory(
  filter: HistoryFilter,
  token: HistoryToken | null,
  offset: bigint,
  limit: bigint,
): Outcome<"listAdminHistory"> {
  const rows = mockHistory
    .filter((row) => filter === HistoryFilter.all || (row.kind as string) === (filter as string))
    .filter((row) => token === null || row.token === token)
    .sort((a, b) => (a.timestamp === b.timestamp ? 0 : a.timestamp > b.timestamp ? -1 : 1));
  return {
    __kind__: "ok",
    ok: {
      total: BigInt(rows.length),
      offset,
      limit,
      items: rows.slice(Number(offset), Number(offset + limit)),
    },
  };
}

// --- Mint fee account: the 1/101 stays in a dedicated contract subaccount, never withdrawable. ---

const MINT_FEE_SUBACCOUNT = lot4Subaccount("MINT-FEE-ACCOUNT");
/** Fees received by mints made in this session, on top of the seeded totals. */
const mockFeeReceived: Record<PayToken, bigint> = {
  [PayToken.icp]: 0n,
  [PayToken.ckbtc]: 0n,
  [PayToken.ckusdc]: 0n,
  [PayToken.ckusdt]: 0n,
};

function mockFeeAccount(): FeeAccountView {
  return {
    owner: TTTI_CANISTER,
    subaccountHex: Array.from(MINT_FEE_SUBACCOUNT)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
    accountText: encodeAccountText({ owner: TTTI_CANISTER, subaccount: MINT_FEE_SUBACCOUNT }),
    readAt: nowNs(),
    tokens: PAY_TOKEN_ORDER.map((token) => {
      const lp = mockMintFeeBalances[token];
      const setAside = mockSetAside[token];
      const redistributedToLps = lp.claimable + lp.claimed;
      const extra = mockFeeReceived[token];
      return {
        token,
        received: redistributedToLps + setAside.totalReceived + extra,
        redistributedToLps,
        setAside: setAside.amount,
        injected: setAside.totalInjected,
        balance: lp.claimable + setAside.amount + extra,
      };
    }),
  };
}

/** Sends the 100/101 share of a mint to the receiving wallet and records a Revenue sent row. */
function recordMintRevenue(token: PayToken, mintId: bigint, ownerShare: bigint, feeAmount: bigint) {
  const wallet = mockReceivingWallets[token].wallet;
  if (!wallet) return;
  mockFeeReceived[token] += feeAmount;
  const amount = ownerShare - PAY_TOKENS[token].fee;
  const block = 18_480_000n + BigInt(mockOwnerSends.length);
  const send = pushOwnerSend(token, amount, { __kind__: "mint", mint: mintId }, { __kind__: "sent", sent: block }, 0n);
  send.destination = wallet;
  pushHistory({
    kind: HistoryKind.mintDeposit,
    token: HISTORY_TOKEN[token],
    amount: ownerShare + feeAmount,
    status: "Completed",
    detail: `Mint #${mintId}: payment received`,
    counterparty: CALLER.toText(),
    timestamp: send.createdAt,
  });
  pushHistory({
    kind: HistoryKind.revenueSent,
    token: HISTORY_TOKEN[token],
    amount,
    status: sendStatusText(send.status),
    detail: `Mint #${mintId}: 100/101 share sent to the receiving wallet`,
    counterparty: encodeAccountText(wallet),
    memo: send.memoText,
    block,
    timestamp: send.createdAt,
  });
}

// --- One-time settlement (ST) of the accumulated revenue and legacy mint-treasury owner share. ---

function settlementLeg(
  n: number,
  purpose: SettlementLegPurpose,
  amount: bigint,
  destination: Account,
  status: OwnerSendView["status"],
): TokenSettlementView["legs"][number] {
  return {
    purpose,
    amount,
    destination,
    memoText: `TTTI-ST-${n}`,
    status,
    block: status.__kind__ === "sent" ? status.sent : undefined,
  };
}

const FEE_ACCOUNT: Account = { owner: TTTI_CANISTER, subaccount: MINT_FEE_SUBACCOUNT };
const SETTLED_AT = nowNs() - LOT4_DAY_NS;
const mockSettlements: Array<TokenSettlementView> = [
  {
    token: PayToken.icp,
    ownerAmount: 162_450_000n,
    feeAmount: 1_240_000n,
    destination: { owner: OWNER_WALLET },
    status: { __kind__: "sent", sent: [18_470_101n, 18_470_102n] },
    startedAt: SETTLED_AT,
    completedAt: SETTLED_AT + 60_000_000_000n,
    legs: [
      settlementLeg(1, SettlementLegPurpose.ownerMintTreasury, 162_450_000n, { owner: OWNER_WALLET }, { __kind__: "sent", sent: 18_470_101n }),
      settlementLeg(2, SettlementLegPurpose.feeLegacy, 1_240_000n, FEE_ACCOUNT, { __kind__: "sent", sent: 18_470_102n }),
    ],
  },
  {
    token: PayToken.ckbtc,
    ownerAmount: 134_200n,
    feeAmount: 0n,
    destination: { owner: OWNER_WALLET },
    status: { __kind__: "sent", sent: [2_340_010n] },
    startedAt: SETTLED_AT,
    completedAt: SETTLED_AT + 60_000_000_000n,
    legs: [
      settlementLeg(3, SettlementLegPurpose.ownerMintTreasury, 134_200n, { owner: OWNER_WALLET }, { __kind__: "sent", sent: 2_340_010n }),
    ],
  },
  {
    token: PayToken.ckusdc,
    ownerAmount: 76_400_000n,
    feeAmount: 260_000n,
    destination: mockReceivingWallets[PayToken.ckusdc].wallet,
    status: { __kind__: "toReview", toReview: null },
    startedAt: SETTLED_AT,
    lastError: "Call timed out (outcome unknown)",
    legs: [
      settlementLeg(4, SettlementLegPurpose.ownerMintTreasury, 76_400_000n, mockReceivingWallets[PayToken.ckusdc].wallet ?? { owner: OWNER_WALLET }, { __kind__: "needsReview", needsReview: null }),
      settlementLeg(5, SettlementLegPurpose.feePending, 260_000n, FEE_ACCOUNT, { __kind__: "sent", sent: 2_340_011n }),
    ],
  },
  {
    token: PayToken.ckusdt,
    ownerAmount: mockOwnerDestinations[PayToken.ckusdt].accumulated + 41_250_000n,
    feeAmount: 8_000n,
    status: { __kind__: "pendingWallet", pendingWallet: null },
    legs: [],
  },
];
{
  const leg = mockSettlements[2].legs[0];
  mockReviews.push({
    ...reviewEntry(TransferKind.ST, 4n, leg.memoText, leg.amount, leg.destination, 3n, "Call timed out (outcome unknown)"),
    token: DexToken.ckusdc,
    fee: PAY_TOKENS[PayToken.ckusdc].fee,
  });
  for (const settlement of mockSettlements) {
    for (const l of settlement.legs) {
      pushHistory({
        kind: HistoryKind.revenueSent,
        token: HISTORY_TOKEN[settlement.token],
        amount: l.amount,
        status: sendStatusText(l.status),
        detail: `One-time settlement (${l.purpose})`,
        counterparty: encodeAccountText(l.destination),
        memo: l.memoText,
        block: l.block,
        timestamp: SETTLED_AT,
      });
    }
  }
}

function mockSetReceivingWallet(token: PayToken, account: Account): Outcome<"setReceivingWallet"> {
  if (account.owner.isAnonymous()) return { __kind__: "err", err: { __kind__: "anonymousOwner", anonymousOwner: null } };
  if (account.owner.toText() === TTTI_CANISTER.toText()) {
    return { __kind__: "err", err: { __kind__: "contractAccount", contractAccount: null } };
  }
  if (account.subaccount !== undefined && account.subaccount.length !== 32) {
    return { __kind__: "err", err: { __kind__: "invalidSubaccount", invalidSubaccount: null } };
  }
  const view = receivingWallet(token, account, 0n);
  mockReceivingWallets[token] = view;
  pushHistory({
    kind: HistoryKind.destination,
    token: HISTORY_TOKEN[token],
    status: "Set",
    detail: `Receiving wallet set for ${PAY_TOKENS[token].symbol}`,
    counterparty: view.accountText,
    timestamp: view.setAt ?? nowNs(),
  });
  const settlement = mockSettlements.find((s) => s.token === token);
  if (settlement && settlement.status.__kind__ === "pendingWallet") {
    const n = mockSettlements.reduce((sum, s) => sum + s.legs.length, 0) + 1;
    const ownerBlock = 18_490_000n + BigInt(n);
    settlement.destination = account;
    settlement.startedAt = nowNs();
    settlement.legs = [
      settlementLeg(n, SettlementLegPurpose.ownerAccumulated, settlement.ownerAmount, account, { __kind__: "sent", sent: ownerBlock }),
      settlementLeg(n + 1, SettlementLegPurpose.feePending, settlement.feeAmount, FEE_ACCOUNT, { __kind__: "sent", sent: ownerBlock + 1n }),
    ];
    settlement.status = { __kind__: "sent", sent: [ownerBlock, ownerBlock + 1n] };
    settlement.completedAt = nowNs();
    for (const l of settlement.legs) {
      pushHistory({
        kind: HistoryKind.revenueSent,
        token: HISTORY_TOKEN[token],
        amount: l.amount,
        status: "Sent",
        detail: `One-time settlement (${l.purpose})`,
        counterparty: encodeAccountText(l.destination),
        memo: l.memoText,
        block: l.block,
        timestamp: nowNs(),
      });
    }
  }
  return { __kind__: "ok", ok: { ...view } };
}

function mockReviewsFiltered(filter: ReviewFilter): Array<TransferReview> {
  dexProcessRemovals();
  return [...mockReviews, ...custodySurplusReviews()].filter(
    (r) =>
      (filter.kinds.length === 0 || filter.kinds.includes(r.kind)) &&
      (filter.token === undefined || r.token === filter.token),
  );
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

// DEX lot 5: ICPSwap router. One route per swap: the native pool (0.3 %) or
// the ICPSwap pool of the same pair (0.3 % plus a 0.1 % protocol fee on the
// input token, 70 % to the native pool LPs and 30 % to its permanent liquidity).
const ROUTER_PROTOCOL_FEE_BPS = 10n;
const ROUTER_ICPSWAP_FEE_BPS = 30n;
const ROUTER_LP_PERCENT = 70n;
/** Simulated ICPSwap depth: 2,000 USD on each side of every registry pair. */
const ROUTER_ICPSWAP_DEPTH_USD_E8 = 2_000n * DEX_USD_RATE_SCALE;

type IcpswapPool = { canisterId: Principal; reserves: Map<DexToken, bigint> };
const mockIcpswapPools = new Map<string, IcpswapPool>();
const mockRoutedSwaps: Array<RoutedSwap> = [];
const mockRouterFees = new Map<string, RouterFeeView>();
let nextRoutedSwapId = 1n;

const routerPairKey = (a: DexToken, b: DexToken) => [a, b].sort().join("/");

function routerUsdE8(token: DexToken): bigint {
  return token === DexToken.tttiT ? DEX_TTTI_T_USD_E8 : MOCK_PAY_USD_E8[PAY_OF_DEX[token]];
}

function routerIcpswapPool(a: DexToken, b: DexToken): IcpswapPool {
  const key = routerPairKey(a, b);
  let pool = mockIcpswapPools.get(key);
  if (!pool) {
    const reserves = new Map<DexToken, bigint>();
    for (const token of [a, b]) {
      const scale = 10n ** BigInt(DEX_TOKEN_VIEW[token].decimals);
      reserves.set(token, (ROUTER_ICPSWAP_DEPTH_USD_E8 * scale) / routerUsdE8(token));
    }
    pool = { canisterId: principalFrom(40 + mockIcpswapPools.size), reserves };
    mockIcpswapPools.set(key, pool);
  }
  return pool;
}

type RouterLeg = { route: Route; amountOut: bigint; fees: RouteFees };

function routerIcpswapLeg(tokenIn: DexToken, tokenOut: DexToken, amountIn: bigint): RouterLeg | null {
  const pool = routerIcpswapPool(tokenIn, tokenOut);
  const reserveIn = pool.reserves.get(tokenIn) ?? 0n;
  const reserveOut = pool.reserves.get(tokenOut) ?? 0n;
  const protocolFee = dexCeilDiv(amountIn * ROUTER_PROTOCOL_FEE_BPS, DEX_BPS);
  const sent = amountIn - protocolFee;
  const icpswapFee = dexCeilDiv(sent * ROUTER_ICPSWAP_FEE_BPS, DEX_BPS);
  const net = sent - icpswapFee;
  const amountOut = net <= 0n ? 0n : (reserveOut * net) / (reserveIn + net);
  if (amountOut === 0n || amountOut >= reserveOut) return null;
  const protocolLpShare = (protocolFee * ROUTER_LP_PERCENT) / 100n;
  return {
    route: { __kind__: "icpswap", icpswap: { poolCanisterId: pool.canisterId } },
    amountOut,
    fees: {
      __kind__: "icpswap",
      icpswap: {
        icpswapFeeBps: ROUTER_ICPSWAP_FEE_BPS,
        icpswapFee,
        protocolFeeBps: ROUTER_PROTOCOL_FEE_BPS,
        protocolFee,
        protocolLpShare,
        protocolPermanentShare: protocolFee - protocolLpShare,
      },
    },
  };
}

function routerNativeLeg(pool: PoolView, tokenIn: DexToken, amountIn: bigint): RouterLeg | null {
  const plan = dexPlanSwap(pool.id, tokenIn, amountIn, 0n);
  if (plan.__kind__ === "err") return null;
  return {
    route: { __kind__: "native", native: { poolId: pool.id } },
    amountOut: plan.ok.quote.amountOut,
    fees: { __kind__: "native", native: { feeBps: plan.ok.quote.feeBps, fee: plan.ok.quote.fee } },
  };
}

function routerNativePool(tokenIn: DexToken, tokenOut: DexToken): PoolView | undefined {
  const pools = mockPools.filter((p) => {
    const t0 = dexTokenOfView(p.token0);
    const t1 = dexTokenOfView(p.token1);
    return (t0 === tokenIn && t1 === tokenOut) || (t0 === tokenOut && t1 === tokenIn);
  });
  return pools.find((p) => p.status !== PoolStatus.removed) ?? pools[0];
}

const sameRoute = (a: Route, b: Route) =>
  a.__kind__ === "native"
    ? b.__kind__ === "native" && a.native.poolId === b.native.poolId
    : b.__kind__ === "icpswap" && a.icpswap.poolCanisterId.toText() === b.icpswap.poolCanisterId.toText();

function mockQuoteRoutedSwap(args: RoutedQuoteArgs): Outcome<"quoteRoutedSwap"> {
  const fail = (err: RouteError): Outcome<"quoteRoutedSwap"> => ({ __kind__: "err", err });
  const { tokenIn, tokenOut, amountIn, slippageBps } = args;
  if (amountIn === 0n) return fail({ __kind__: "zeroAmount", zeroAmount: null });
  if (tokenIn === tokenOut) return fail({ __kind__: "sameToken", sameToken: null });
  if (slippageBps > DEX_MAX_SLIPPAGE_BPS) {
    return fail({ __kind__: "invalidSlippage", invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS } });
  }
  dexRefreshAllOpenings();
  const pool = routerNativePool(tokenIn, tokenOut);
  if (!pool) return fail({ __kind__: "pairNotFound", pairNotFound: null });
  if (pool.status === PoolStatus.removed) return fail({ __kind__: "pairRemoved", pairRemoved: null });
  const native = routerNativeLeg(pool, tokenIn, amountIn);
  const icpswap = routerIcpswapLeg(tokenIn, tokenOut, amountIn);
  let chosen: RouterLeg;
  let alternative: RouterLeg | null;
  let reason: RouteReason;
  if (native && icpswap) {
    const nativeWins = native.amountOut >= icpswap.amountOut;
    chosen = nativeWins ? native : icpswap;
    alternative = nativeWins ? icpswap : native;
    reason = RouteReason.bestAmount;
  } else if (icpswap) {
    [chosen, alternative, reason] = [icpswap, null, RouteReason.nativeUnavailable];
  } else if (native) {
    [chosen, alternative, reason] = [native, null, RouteReason.icpswapUnavailable];
  } else {
    return fail({ __kind__: "noRouteAvailable", noRouteAvailable: null });
  }
  const now = nowNs();
  return {
    __kind__: "ok",
    ok: {
      tokenIn,
      tokenOut,
      amountIn,
      slippageBps,
      route: chosen.route,
      reason,
      nativePoolId: pool.id,
      amountOut: chosen.amountOut,
      fees: chosen.fees,
      minimumReceived: (chosen.amountOut * (DEX_BPS - slippageBps)) / DEX_BPS,
      ...(alternative ? { alternative } : {}),
      maxDeadline: now + DEX_SWAP_DEADLINE_MAX_NS,
      quotedAt: now,
    },
  };
}

function routerFeeView(poolId: bigint): RouterFeeView {
  const key = poolId.toString();
  let view = mockRouterFees.get(key);
  if (!view) {
    view = {
      totals: {
        poolId,
        collected0: 0n,
        collected1: 0n,
        lpPaid0: 0n,
        lpPaid1: 0n,
        lpSetAside0: 0n,
        lpSetAside1: 0n,
        permanent0: 0n,
        permanent1: 0n,
      },
      setAside: { amount0: 0n, amount1: 0n },
    };
    mockRouterFees.set(key, view);
  }
  return view;
}

/** Splits the 0.1 %: 70 % to the native pool LPs (set aside with no LP), 30 % permanent. */
function routerRecordFee(pool: PoolView, tokenIn: DexToken, fees: RouteFees) {
  if (fees.__kind__ !== "icpswap") return;
  const f = fees.icpswap;
  const view = routerFeeView(pool.id);
  const side = dexTokenOfView(pool.token0) === tokenIn ? 0 : 1;
  const hasLp = mockPositions.some((p) => p.poolId === pool.id && p.shares > 0n);
  const t = view.totals;
  if (side === 0) {
    t.collected0 += f.protocolFee;
    t.permanent0 += f.protocolPermanentShare;
    if (hasLp) t.lpPaid0 += f.protocolLpShare;
    else {
      t.lpSetAside0 += f.protocolLpShare;
      view.setAside.amount0 += f.protocolLpShare;
    }
  } else {
    t.collected1 += f.protocolFee;
    t.permanent1 += f.protocolPermanentShare;
    if (hasLp) t.lpPaid1 += f.protocolLpShare;
    else {
      t.lpSetAside1 += f.protocolLpShare;
      view.setAside.amount1 += f.protocolLpShare;
    }
  }
}

function routerRecord(
  owner: Principal,
  pool: PoolView,
  args: Omit<RoutedSwapArgs, "route">,
  leg: RouterLeg,
  status: RoutedSwapStatus,
  stage: RoutedSwapStage,
  createdAt: bigint,
  lastError?: string,
): RoutedSwap {
  const swap: RoutedSwap = {
    id: nextRoutedSwapId++,
    status,
    stage,
    owner,
    tokenIn: args.tokenIn,
    tokenOut: args.tokenOut,
    amountIn: args.amountIn,
    amountOut: leg.amountOut,
    minAmountOut: args.minAmountOut,
    deadline: args.deadline,
    fees: leg.fees,
    route: leg.route,
    nativePoolId: pool.id,
    zeroForOne: dexTokenOfView(pool.token0) === args.tokenIn,
    createdAt,
    updatedAt: createdAt,
    ...(lastError ? { lastError } : {}),
  };
  mockRoutedSwaps.push(swap);
  return swap;
}

function mockRoutedSwap(args: RoutedSwapArgs): Outcome<"routedSwap"> {
  const fail = (err: RouteError): Outcome<"routedSwap"> => ({ __kind__: "err", err });
  const now = nowNs();
  if (now > args.deadline) {
    return fail({ __kind__: "deadlineExceeded", deadlineExceeded: { deadline: args.deadline, now } });
  }
  const maximum = now + DEX_SWAP_DEADLINE_MAX_NS;
  if (args.deadline > maximum) return fail({ __kind__: "deadlineTooFar", deadlineTooFar: { maximum } });
  const quoted = mockQuoteRoutedSwap({ ...args, slippageBps: 0n });
  if (quoted.__kind__ === "err") return quoted;
  const quote = quoted.ok;
  if (!sameRoute(quote.route, args.route)) {
    return fail({ __kind__: "routeMismatch", routeMismatch: { expected: quote.route } });
  }
  if (quote.amountOut < args.minAmountOut) {
    return fail({
      __kind__: "slippageExceeded",
      slippageExceeded: { amountOut: quote.amountOut, minAmountOut: args.minAmountOut },
    });
  }
  const balanceIn = dexBalanceOf(CALLER, args.tokenIn);
  if (balanceIn.available < args.amountIn) {
    return fail({
      __kind__: "insufficientBalance",
      insufficientBalance: { token: args.tokenIn, available: balanceIn.available, required: args.amountIn },
    });
  }
  const pool = mockPools.find((p) => p.id === quote.nativePoolId);
  if (!pool) return fail({ __kind__: "pairNotFound", pairNotFound: null });
  let amountOut = quote.amountOut;
  if (quote.route.__kind__ === "native") {
    const done = mockSwap(pool.id, args.tokenIn, args.amountIn, args.minAmountOut, args.deadline);
    if (done.__kind__ === "err") return fail({ __kind__: "noRouteAvailable", noRouteAvailable: null });
    amountOut = done.ok.amountOut;
  } else {
    const icp = routerIcpswapPool(args.tokenIn, args.tokenOut);
    const fees = quote.fees.__kind__ === "icpswap" ? quote.fees.icpswap : null;
    const sent = args.amountIn - (fees?.protocolFee ?? 0n);
    icp.reserves.set(args.tokenIn, (icp.reserves.get(args.tokenIn) ?? 0n) + sent);
    icp.reserves.set(args.tokenOut, (icp.reserves.get(args.tokenOut) ?? 0n) - amountOut);
    balanceIn.available -= args.amountIn;
    dexBalanceOf(CALLER, args.tokenOut).available += amountOut;
    routerRecordFee(pool, args.tokenIn, quote.fees);
  }
  const leg = { route: quote.route, amountOut, fees: quote.fees };
  const swap = routerRecord(
    CALLER,
    pool,
    args,
    leg,
    { __kind__: "completed", completed: null },
    RoutedSwapStage.done,
    now,
  );
  return {
    __kind__: "ok",
    ok: {
      id: swap.id,
      tokenIn: args.tokenIn,
      tokenOut: args.tokenOut,
      amountIn: args.amountIn,
      amountOut,
      fees: quote.fees,
      route: quote.route,
    },
  };
}

function routerSetStatus(id: bigint, status: RoutedSwapStatus) {
  const swap = mockRoutedSwaps.find((s) => s.id === id);
  if (!swap) return;
  swap.status = status;
  swap.stage = RoutedSwapStage.done;
  swap.updatedAt = nowNs();
  if (status.__kind__ === "reviewedNotArrived") {
    dexBalanceOf(swap.owner, swap.tokenIn).available += swap.amountIn;
  }
}

// Seed: a ckUSDT -> TTTI-T swap through ICPSwap while the native TTTI-T/ckUSDT
// pool is filling, and an ICP -> TTTI-T IR transfer whose outcome is unknown.
{
  const seed = (owner: Principal, tokenIn: DexToken, tokenOut: DexToken, amountIn: bigint, ageNs: bigint) => {
    const pool = routerNativePool(tokenIn, tokenOut);
    const leg = routerIcpswapLeg(tokenIn, tokenOut, amountIn);
    if (!pool || !leg) return null;
    const createdAt = nowNs() - ageNs;
    const args = {
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut: (leg.amountOut * 9_950n) / DEX_BPS,
      deadline: createdAt + DEX_SWAP_DEADLINE_MAX_NS,
    };
    return { pool, leg, args, createdAt };
  };
  const filling = seed(HOLDER_2, DexToken.ckusdt, DexToken.tttiT, 25_000_000n, 3n * HOUR_NS);
  if (filling) {
    routerRecord(
      HOLDER_2,
      filling.pool,
      filling.args,
      filling.leg,
      { __kind__: "completed", completed: null },
      RoutedSwapStage.done,
      filling.createdAt,
    );
    routerRecordFee(filling.pool, DexToken.ckusdt, filling.leg.fees);
  }
  const unknown = seed(HOLDER_3, DexToken.icp, DexToken.tttiT, 200_000_000n, 25n * HOUR_NS);
  if (unknown && unknown.leg.route.__kind__ === "icpswap") {
    const lastError = "Call timed out (outcome unknown)";
    const swap = routerRecord(
      HOLDER_3,
      unknown.pool,
      unknown.args,
      unknown.leg,
      { __kind__: "needsReview", needsReview: null },
      RoutedSwapStage.movingIn,
      unknown.createdAt,
      lastError,
    );
    const fees = unknown.leg.fees.__kind__ === "icpswap" ? unknown.leg.fees.icpswap.protocolFee : 0n;
    mockReviews.push({
      ...reviewEntry(
        TransferKind.IR,
        swap.id,
        `TTTI-IR-${swap.id}`,
        unknown.args.amountIn - fees - ICP_LEDGER_FEE,
        { owner: unknown.leg.route.icpswap.poolCanisterId, subaccount: dexUserSubaccount(TTTI_CANISTER) },
        6n,
        lastError,
      ),
      buyer: HOLDER_3,
      createdAtTimeNs: unknown.createdAt,
    });
  }
}

// --- DEX indicators snapshot (lot 7): hourly snapshot of the seven starter pools. ---

const INDICATORS_MINUTE_NS = 60n * 1_000_000_000n;
const INDICATORS_COMPUTED_AT = nowNs() - 25n * INDICATORS_MINUTE_NS;

/** Plausible reserves and activity per starter pool (index = pool id); pool 3 stays empty. */
const INDICATORS_SEEDS: ReadonlyArray<{
  reserve0: string;
  reserve1: string;
  firmBps: bigint;
  positions: bigint;
  largestBps: bigint;
  topFiveBps: bigint;
  swaps24h: bigint;
  swaps7d: bigint;
  turnover24hBps: bigint;
  turnover7dBps: bigint;
}> = [
  { reserve0: "5", reserve1: "4000", firmBps: 8_200n, positions: 14n, largestBps: 3_100n, topFiveBps: 7_600n, swaps24h: 18n, swaps7d: 96n, turnover24hBps: 140n, turnover7dBps: 820n },
  { reserve0: "3", reserve1: "0.46", firmBps: 7_400n, positions: 9n, largestBps: 4_200n, topFiveBps: 8_900n, swaps24h: 7n, swaps7d: 41n, turnover24hBps: 90n, turnover7dBps: 510n },
  { reserve0: "2", reserve1: "20000", firmBps: 9_000n, positions: 6n, largestBps: 5_200n, topFiveBps: 9_700n, swaps24h: 4n, swaps7d: 23n, turnover24hBps: 60n, turnover7dBps: 330n },
  { reserve0: "0", reserve1: "0", firmBps: 0n, positions: 0n, largestBps: 0n, topFiveBps: 0n, swaps24h: 0n, swaps7d: 0n, turnover24hBps: 0n, turnover7dBps: 0n },
  { reserve0: "0.2", reserve1: "1040", firmBps: 6_300n, positions: 11n, largestBps: 2_600n, topFiveBps: 6_800n, swaps24h: 12n, swaps7d: 67n, turnover24hBps: 210n, turnover7dBps: 1_150n },
  { reserve0: "9000", reserve1: "720", firmBps: 5_800n, positions: 8n, largestBps: 3_400n, topFiveBps: 7_900n, swaps24h: 9n, swaps7d: 52n, turnover24hBps: 170n, turnover7dBps: 940n },
  { reserve0: "6500", reserve1: "520", firmBps: 6_100n, positions: 5n, largestBps: 4_700n, topFiveBps: 9_500n, swaps24h: 3n, swaps7d: 19n, turnover24hBps: 80n, turnover7dBps: 450n },
];
/** Share of the firm liquidity per unlock bucket, in basis points (sums to 10,000). */
const INDICATORS_UNLOCK_BPS = {
  thisWeek: 500n,
  days30: 1_500n,
  days90: 2_000n,
  year1: 1_000n,
  overYear1: 1_000n,
  permanent: 4_000n,
};

const bpsOfAmount = (value: bigint, bps: bigint): bigint => (value * bps) / 10_000n;

function indicatorsDepth(reserve0: bigint, reserve1: bigint, bps: number): DepthLevel {
  const side = (reserveIn: bigint, reserveOut: bigint) => {
    if (reserveIn === 0n || reserveOut === 0n) return { amountIn: 0n, amountOut: 0n };
    const factor = 1 / Math.sqrt(1 - bps / 10_000) - 1;
    const amountIn = BigInt(Math.floor(Number(reserveIn) * factor));
    return { amountIn, amountOut: reserveOut - (reserveIn * reserveOut) / (reserveIn + amountIn) };
  };
  return { token0In: side(reserve0, reserve1), token1In: side(reserve1, reserve0) };
}

function indicatorsFees(volume0: bigint, volume1: bigint, feeBps: bigint): FeeTotals {
  const collected0 = bpsOfAmount(volume0, feeBps);
  const collected1 = bpsOfAmount(volume1, feeBps);
  const lp0 = (collected0 * BigInt(SWAP_FEE_LP_PERCENT)) / 100n;
  const lp1 = (collected1 * BigInt(SWAP_FEE_LP_PERCENT)) / 100n;
  return { collected0, collected1, lp0, lp1, permanent0: collected0 - lp0, permanent1: collected1 - lp1 };
}

function mockPoolIndicators(pool: PoolView): PoolIndicators {
  const seed = INDICATORS_SEEDS[Number(pool.id)] ?? INDICATORS_SEEDS[3];
  const reserve0 = wholeUnitsOrZero(seed.reserve0, pool.token0.decimals);
  const reserve1 = wholeUnitsOrZero(seed.reserve1, pool.token1.decimals);
  const isOpen = reserve0 > 0n && reserve1 > 0n;
  const valueUsdE8 = isOpen ? dexGauge(pool, reserve0, reserve1).currentUsdE8 : undefined;
  const totalShares = BigInt(Math.floor(Math.sqrt(Number(reserve0) * Number(reserve1))));
  const firm0 = bpsOfAmount(reserve0, seed.firmBps);
  const firm1 = bpsOfAmount(reserve1, seed.firmBps);
  const firmShares = bpsOfAmount(totalShares, seed.firmBps);
  const bucket = (bps: bigint): UnlockBucket => ({
    shares: bpsOfAmount(firmShares, bps),
    amount0: bpsOfAmount(firm0, bps),
    amount1: bpsOfAmount(firm1, bps),
  });
  const window = (swapCount: bigint, turnoverBps: bigint) => ({
    swapCount,
    volume0: bpsOfAmount(reserve0, turnoverBps),
    volume1: bpsOfAmount(reserve1, turnoverBps),
    volumeUsdE8: valueUsdE8 === undefined ? undefined : bpsOfAmount(valueUsdE8, turnoverBps),
  });
  const last7d = window(seed.swaps7d, seed.turnover7dBps);
  const fees7d = indicatorsFees(last7d.volume0, last7d.volume1, pool.feeBps);
  const feesUsdE8 =
    valueUsdE8 === undefined ? undefined : bpsOfAmount(last7d.volumeUsdE8 ?? 0n, pool.feeBps);
  return {
    poolId: pool.id,
    token0Symbol: pool.token0.symbol,
    token1Symbol: pool.token1.symbol,
    isOpen,
    reserve0,
    reserve1,
    valueUsdE8,
    depth: {
      onePercent: indicatorsDepth(reserve0, reserve1, 100),
      twoPercent: indicatorsDepth(reserve0, reserve1, 200),
      fivePercent: indicatorsDepth(reserve0, reserve1, 500),
    },
    liquidity: {
      firmAmount0: firm0,
      firmAmount1: firm1,
      freeAmount0: reserve0 - firm0,
      freeAmount1: reserve1 - firm1,
      firmShares,
      freeShares: totalShares - firmShares,
      totalShares,
      firmBps: isOpen ? seed.firmBps : 0n,
      freeBps: isOpen ? 10_000n - seed.firmBps : 0n,
    },
    unlock: {
      thisWeek: bucket(INDICATORS_UNLOCK_BPS.thisWeek),
      days30: bucket(INDICATORS_UNLOCK_BPS.days30),
      days90: bucket(INDICATORS_UNLOCK_BPS.days90),
      year1: bucket(INDICATORS_UNLOCK_BPS.year1),
      overYear1: bucket(INDICATORS_UNLOCK_BPS.overYear1),
      permanent: bucket(INDICATORS_UNLOCK_BPS.permanent),
    },
    concentration: {
      positionCount: seed.positions,
      largestPositionBps: seed.largestBps,
      topFiveBps: seed.topFiveBps,
      permanentProtocolBps: isOpen ? INDICATORS_UNLOCK_BPS.permanent : 0n,
    },
    activity: { last24h: window(seed.swaps24h, seed.turnover24hBps), last7d },
    fees: {
      last7d: fees7d,
      cumulative: indicatorsFees(last7d.volume0 * 6n, last7d.volume1 * 6n, pool.feeBps),
      cumulativeSince: isOpen ? dexStartedAt : undefined,
      observed: {
        periodDays: 7n,
        feesUsdE8,
        liquidityUsdE8: valueUsdE8,
        feeToLiquidityBps:
          feesUsdE8 === undefined || valueUsdE8 === undefined || valueUsdE8 === 0n
            ? undefined
            : (feesUsdE8 * 10_000n) / valueUsdE8,
      },
    },
  };
}

function wholeUnitsOrZero(whole: string, decimals: number): bigint {
  return parseUnits(whole, decimals) ?? 0n;
}

function mockDexIndicators(): DexIndicatorsSnapshot {
  const lastCheck = mockDexReserve.lastCheck;
  const proofs: Array<TokenProof> = DEX_TOKEN_ORDER.map((token) => {
    const checked = lastCheck?.results.find((r) => r.token === token);
    if (checked) {
      return {
        token,
        internalTotal: checked.internalTotal,
        ledgerTotal: checked.ledgerTotal,
        difference: checked.difference,
        status: checked.status,
      };
    }
    const total = dexInternalTotal(token);
    return { token, internalTotal: total, ledgerTotal: total, difference: 0n, status: ReserveStatus.ok };
  });
  return {
    computedAt: INDICATORS_COMPUTED_AT,
    reserveCheckedAt: lastCheck?.checkedAt ?? INDICATORS_COMPUTED_AT - 10n * INDICATORS_MINUTE_NS,
    proofs,
    pools: mockPools.map(mockPoolIndicators),
  };
}

const mockDexIndicatorsStatus = (): IndicatorsStatus => ({
  snapshotAt: INDICATORS_COMPUTED_AT,
  lastComputedAt: INDICATORS_COMPUTED_AT,
  lastResult: ComputationResult.ok,
  lastSuccessAt: INDICATORS_COMPUTED_AT,
  lastError: undefined,
});

// --- PTM-1: liquidity-forming mint (simulated) ----------------------------

const MINT_MIN_TTTI = 10_000n; // 0.0001 TTTI-T
const MINT_CAP_TTTI = 100_000_000n; // 1 TTTI-T in total
const MINT_MAX_DECIMALS = 8;
const mockLiquidityMints: Array<LiquidityMint> = [];
const mockGuarantees: Array<Guarantee> = [];
const mockCreatorSetAsides: Array<CreatorSetAside> = [];
let nextMintId = 1n;

/**
 * Mock-only simulation switch: `?mint=` in the page URL.
 * Refused before payment: rate | cap | balance | allowance | slippage.
 * Isolated failure (the mint fails as a whole, the payment returns to the payer's
 * internal balance, then is withdrawn): swap (swap refused), deposit (pool deposit
 * refused), guarantee (insufficient balance for the guarantee), refunding (withdrawal
 * in progress, then succeeded on the next read) and refundfailed (withdrawal failed,
 * the payment stays in the internal balance).
 */
function mintScenario(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("mint") ?? "";
  } catch {
    return "";
  }
}

type MintFail = { __kind__: "err"; err: LiquidityMintError };
const mintFail = (err: LiquidityMintError): MintFail => ({ __kind__: "err", err });

function mintQuantity(quantity: Quantity): { ok: bigint } | MintFail {
  if (quantity.__kind__ === "baseUnits") return { ok: quantity.baseUnits };
  const text = quantity.decimal.trim().replace(",", ".");
  if (!/^\d+(\.\d*)?$/.test(text)) return mintFail({ __kind__: "invalidAmount", invalidAmount: null });
  const [whole, fraction = ""] = text.split(".");
  if (fraction.length > MINT_MAX_DECIMALS) {
    return mintFail({
      __kind__: "tooManyDecimals",
      tooManyDecimals: {
        granularityTtti: 1n,
        minimumTtti: MINT_MIN_TTTI,
        maxDecimals: BigInt(MINT_MAX_DECIMALS),
        given: text,
      },
    });
  }
  return { ok: BigInt(whole) * TTTI_DIVISOR + BigInt(fraction.padEnd(MINT_MAX_DECIMALS, "0")) };
}

function mintTttiFromUsd(usdE8: bigint): bigint {
  return (usdE8 * 99n) / 2_000_000n;
}

/** The TTTI-T / token pool of a payment token, created on first use. */
function mintPool(token: PayToken): PoolView {
  const counter = DEX_TOKEN_VIEW[DEX_OF_PAY[token]];
  const found = mockPools.find(
    (p) =>
      p.kind === PoolKind.tttiPair &&
      p.status !== PoolStatus.removed &&
      (dexSameLedger(p.token0, counter) || dexSameLedger(p.token1, counter)),
  );
  return found ?? dexCreatePool(DEX_TTTI, counter, FeeTier.bps30, nowNs());
}

function mintPoolPrice(token: PayToken, reserveToken: bigint, reserveTtti: bigint): PoolPrice {
  if (reserveTtti === 0n || reserveToken === 0n) return { reserveToken, reserveTtti };
  const tokenPerTtti = (reserveToken * TTTI_DIVISOR) / reserveTtti;
  const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
  return {
    reserveToken,
    reserveTtti,
    tokenPerTtti,
    // Same figure as the consolidated price of the pool, so the gap between the two blocks is coherent.
    usdPerTtti: (((reserveToken * MOCK_PAY_USD_E8[token]) / decimals) * TTTI_DIVISOR) / reserveTtti,
  };
}

function mintSoldTtti(): bigint {
  return mockLiquidityMints.reduce((sum, m) => (m.status === MintStatus.completed ? sum + m.tttiAmount : sum), 0n);
}

function mintPlan(token: PayToken, q: bigint): { __kind__: "ok"; ok: LiquidityMintQuote } | MintFail {
  if (!dexRatesValid() || mintScenario() === "rate") {
    return mintFail({ __kind__: "rateUnavailable", rateUnavailable: { token } });
  }
  if (state.salesPaused) return mintFail({ __kind__: "salesPaused", salesPaused: null });
  // PTM-9b: the mint is over once the remainder is below the minimum of one mint.
  const capRemaining = MINT_CAP_TTTI > mintSoldTtti() ? MINT_CAP_TTTI - mintSoldTtti() : 0n;
  if (saleMintEnded() || capRemaining < MINT_MIN_TTTI) {
    return mintFail({ __kind__: "mintEnded", mintEnded: null });
  }
  if (q < MINT_MIN_TTTI) {
    return mintFail({
      __kind__: "belowMinimum",
      belowMinimum: { granularityTtti: 1n, minimumTtti: MINT_MIN_TTTI, requestedTtti: q },
    });
  }
  const sold = mintSoldTtti();
  if (mintScenario() === "cap" || sold + q > MINT_CAP_TTTI) {
    return mintFail({
      __kind__: "aboveCap",
      aboveCap: {
        returnedToContractTtti: 0n,
        remainingTtti: MINT_CAP_TTTI > sold ? MINT_CAP_TTTI - sold : 0n,
        capTtti: MINT_CAP_TTTI,
        soldTtti: sold,
        requestedTtti: q,
      },
    });
  }
  const pool = mintPool(token);
  const tttiIs0 = pool.token0.isTttiT;
  const reserveTtti = tttiIs0 ? pool.reserve0 : pool.reserve1;
  const reserveToken = tttiIs0 ? pool.reserve1 : pool.reserve0;
  const firstDeposit = pool.totalShares === 0n || reserveTtti === 0n || reserveToken === 0n;
  const rate = MOCK_PAY_USD_E8[token];
  const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
  const payUsdE8 = dexCeilDiv(q * 2_000_000n, 99n);
  const payAmount = dexCeilDiv(payUsdE8 * decimals, rate);
  const guaranteeAmount = (q * 10_000n * decimals) / rate;
  const positionTokenAmount = guaranteeAmount;
  const creatorAmount = (payAmount * 100n) / 10_000n;
  const spent = guaranteeAmount + positionTokenAmount + creatorAmount;
  const dustAmount = payAmount > spent ? payAmount - spent : 0n;
  let zap: ZapSwap | undefined;
  let shares: bigint;
  if (firstDeposit) {
    shares = dexIsqrt(positionTokenAmount * q);
  } else {
    const needed = (q * reserveToken) / reserveTtti;
    const amountIn = positionTokenAmount > needed ? (positionTokenAmount - needed) / 2n : 0n;
    if (amountIn > 0n) {
      zap = {
        tokenIn: DEX_OF_PAY[token],
        tokenOut: DexToken.tttiT,
        amountIn,
        amountOut: (amountIn * 997n * reserveTtti) / (reserveToken * 1000n + amountIn * 997n),
        feeAmount: (amountIn * 3n) / 1000n,
      };
    }
    shares = (q * pool.totalShares) / reserveTtti;
  }
  const now = nowNs();
  return {
    __kind__: "ok",
    ok: {
      ...(zap ? { zap } : {}),
      rateUsdE8: rate,
      token,
      dustAmount,
      shares,
      payUsdE8,
      ledgerFee: PAY_TOKENS[token].fee,
      firstDeposit,
      payAmount,
      guaranteeAmount,
      priceAfter: mintPoolPrice(token, reserveToken + positionTokenAmount, reserveTtti + q),
      consolidatedPriceBefore: dexConsolidatedMintPrice(),
      consolidatedPriceAfter: dexConsolidatedMintPrice({
        pool,
        reserve0: tttiIs0 ? reserveTtti + q : reserveToken + positionTokenAmount,
        reserve1: tttiIs0 ? reserveToken + positionTokenAmount : reserveTtti + q,
      }),
      rateValidUntil: now + HOUR_NS,
      quotedAt: now,
      tttiAmount: q,
      positionTttiAmount: q,
      positionTokenAmount,
      priceBefore: mintPoolPrice(token, reserveToken, reserveTtti),
      creatorAmount,
      poolId: pool.id,
    },
  };
}

function mockQuoteLiquidityMint(args: QuoteArgs): Outcome<"quoteLiquidityMint"> {
  if (args.amount.__kind__ === "usd") {
    return mintPlan(args.token, mintTttiFromUsd(args.amount.usd));
  }
  const parsed = mintQuantity(args.amount.ttti);
  return "ok" in parsed ? mintPlan(args.token, parsed.ok) : parsed;
}

/** A step of the isolated mint that the simulation can refuse. */
type MintStep = "swap" | "deposit" | "guarantee";
type IsolatedFailure = { step: MintStep; cause: string; withdrawal: "done" | "pending" | "failed" };

const ISOLATED_FAILURES = new Map<string, IsolatedFailure>([
  ["swap", { step: "swap", cause: "Swap refused by the pool.", withdrawal: "done" }],
  ["deposit", { step: "deposit", cause: "Deposit refused by the pool.", withdrawal: "done" }],
  ["guarantee", { step: "guarantee", cause: "Insufficient balance for the guarantee.", withdrawal: "done" }],
  ["refunding", { step: "deposit", cause: "Deposit refused by the pool.", withdrawal: "pending" }],
  ["refundfailed", { step: "deposit", cause: "Deposit refused by the pool.", withdrawal: "failed" }],
]);

class MintStepRefused extends Error {}

/** Everything a failed isolated mint must leave untouched, plus the payer's internal balance. */
function mintSnapshot(token: PayToken, pool: PoolView) {
  const mass = massOf(token);
  return {
    totalSupply: mockTotalSupply(),
    mintableRemaining: mintableRemaining(),
    soldTtti: mintSoldTtti(),
    reserve0: pool.reserve0,
    reserve1: pool.reserve1,
    totalShares: pool.totalShares,
    positions: mockPositions.length,
    guarantees: mockGuarantees.length,
    setAsides: mockCreatorSetAsides.length,
    massTtti: mass?.totalTtti ?? 0n,
    massGuarantee: mass?.totalGuarantee ?? 0n,
    available: dexBalanceOf(CALLER, DEX_OF_PAY[token]).available,
  };
}

/**
 * Runs the mint steps (swap, pool deposit, guarantee) and, when one is refused,
 * puts the pool back exactly as it was: the mint fails as a whole.
 */
function attemptIsolatedMint(pool: PoolView, quote: LiquidityMintQuote, failure: IsolatedFailure): void {
  const saved = { reserve0: pool.reserve0, reserve1: pool.reserve1, totalShares: pool.totalShares };
  const positions = mockPositions.length;
  const tttiIs0 = pool.token0.isTttiT;
  const addReserves = (ttti: bigint, token: bigint) => {
    if (tttiIs0) {
      pool.reserve0 += ttti;
      pool.reserve1 += token;
    } else {
      pool.reserve1 += ttti;
      pool.reserve0 += token;
    }
  };
  try {
    if (failure.step === "swap") throw new MintStepRefused(failure.cause);
    if (quote.zap) addReserves(-quote.zap.amountOut, quote.zap.amountIn);
    if (failure.step === "deposit") throw new MintStepRefused(failure.cause);
    addReserves(quote.positionTttiAmount, quote.positionTokenAmount);
    pool.totalShares += quote.shares;
    mockPositions.push({
      id: nextPositionId,
      poolId: pool.id,
      owner: CALLER,
      shares: quote.shares,
      createdAt: quote.quotedAt,
      lockStartedAt: quote.quotedAt,
      unlockAt: quote.quotedAt,
      isCreator: false,
      relayReceivedNs: 0n,
      feesCollected0: 0n,
      feesCollected1: 0n,
    });
    if (failure.step === "guarantee") throw new MintStepRefused(failure.cause);
  } catch (error) {
    if (!(error instanceof MintStepRefused)) throw error;
    pool.reserve0 = saved.reserve0;
    pool.reserve1 = saved.reserve1;
    pool.totalShares = saved.totalShares;
    mockPositions.length = positions;
  }
}

/** Scenario self-check: a failed isolated mint minted nothing, moved nothing, and the payment is in the payer's balance. */
function assertIsolatedMintFailure(
  scenario: string,
  before: ReturnType<typeof mintSnapshot>,
  after: ReturnType<typeof mintSnapshot>,
  payAmount: bigint,
): void {
  const broken = (what: string): never => {
    throw new Error(`Mock invariant broken (?mint=${scenario}): ${what}`);
  };
  if (after.totalSupply !== before.totalSupply || after.mintableRemaining !== before.mintableRemaining) {
    broken("TTTI-T was minted (total supply or mintable remaining changed)");
  }
  if (after.soldTtti !== before.soldTtti) broken("TTTI-T was counted as sold");
  if (
    after.reserve0 !== before.reserve0 ||
    after.reserve1 !== before.reserve1 ||
    after.totalShares !== before.totalShares ||
    after.positions !== before.positions
  ) {
    broken("the pool reserves or positions moved");
  }
  if (
    after.massTtti !== before.massTtti ||
    after.massGuarantee !== before.massGuarantee ||
    after.guarantees !== before.guarantees ||
    after.setAsides !== before.setAsides
  ) {
    broken("the mass or the guarantee changed");
  }
  if (after.available !== before.available + payAmount) {
    broken("the payment is not in the payer's internal balance");
  }
}

/** A mint refused after payment: nothing is minted, the payment is returned to the payer. */
function mockFailedIsolatedMint(
  scenario: string,
  args: MintArgs,
  quote: LiquidityMintQuote,
  failure: IsolatedFailure,
  now: bigint,
): Outcome<"mintLiquidity"> {
  const pool = mintPool(args.token);
  const dexToken = DEX_OF_PAY[args.token];
  const before = mintSnapshot(args.token, pool);
  // The payment is credited first to the payer's internal balance (withdrawable).
  const balance = dexBalanceOf(CALLER, dexToken);
  balance.available += quote.payAmount;
  attemptIsolatedMint(pool, quote, failure);
  assertIsolatedMintFailure(scenario, before, mintSnapshot(args.token, pool), quote.payAmount);

  const mintId = nextMintId++;
  const transfer = dexNewTransfer(DexTransferDirection.withdrawal, CALLER, dexToken, quote.payAmount, now);
  let status: MintStatus;
  let err: LiquidityMintError;
  if (failure.withdrawal === "failed") {
    transfer.status = { __kind__: "failed", failed: "The ledger refused the withdrawal." };
    transfer.lastError = "The ledger refused the withdrawal.";
    status = MintStatus.refundFailed;
    err = { __kind__: "depositFailedRefundFailed", depositFailedRefundFailed: { mintId } };
  } else if (failure.withdrawal === "pending") {
    balance.available -= quote.payAmount;
    balance.reserved += quote.payAmount;
    status = MintStatus.refunding;
    err = { __kind__: "depositFailedRefunding", depositFailedRefunding: { mintId } };
  } else {
    balance.available -= quote.payAmount;
    transfer.status = { __kind__: "completed", completed: nextDexBlock++ };
    status = MintStatus.refunded;
    err = { __kind__: "depositFailedRefunded", depositFailedRefunded: { mintId } };
  }
  mockLiquidityMints.push({
    id: mintId,
    status,
    rateUsdE8: quote.rateUsdE8,
    token: args.token,
    owner: CALLER,
    createdAt: now,
    paymentBlock: nextDexBlock++,
    refundWithdrawalN: transfer.n,
    refusalCause: failure.cause,
    payAmount: quote.payAmount,
    tttiAmount: quote.tttiAmount,
    payer: CALLER,
    poolId: pool.id,
  });
  return mintFail(err);
}

/** A withdrawal in progress ends on the next read: the payment leaves the internal balance. */
function settleMintRefunds(): void {
  for (const mint of mockLiquidityMints) {
    if (mint.status !== MintStatus.refunding || mint.refundWithdrawalN === undefined) continue;
    dexMarkArrived(TransferKind.DW, mint.refundWithdrawalN, nextDexBlock++);
    mint.status = MintStatus.refunded;
  }
}

function mockMintLiquidity(args: MintArgs): Outcome<"mintLiquidity"> {
  if (!ackAccepted()) {
    return mintFail({ __kind__: "acknowledgementRequired", acknowledgementRequired: null });
  }
  const parsed = mintQuantity(args.quantity);
  if (!("ok" in parsed)) return parsed;
  const slippageBps = args.slippageBps ?? 50n;
  if (slippageBps > DEX_MAX_SLIPPAGE_BPS) {
    return mintFail({ __kind__: "invalidSlippage", invalidSlippage: { maximumBps: DEX_MAX_SLIPPAGE_BPS } });
  }
  const now = nowNs();
  if (args.deadline < now) {
    return mintFail({ __kind__: "deadlineExpired", deadlineExpired: { now, deadline: args.deadline } });
  }
  const plan = mintPlan(args.token, parsed.ok);
  if (plan.__kind__ === "err") return plan;
  const quote = plan.ok;
  const scenario = mintScenario();
  if (scenario === "balance") {
    return mintFail({
      __kind__: "insufficientBalance",
      insufficientBalance: { token: args.token, balance: 0n, required: quote.payAmount + 2n * quote.ledgerFee },
    });
  }
  if (scenario === "allowance") {
    return mintFail({
      __kind__: "insufficientAllowance",
      insufficientAllowance: { token: args.token, required: quote.payAmount + quote.ledgerFee, allowance: 0n },
    });
  }
  if (scenario === "slippage") {
    return mintFail({ __kind__: "slippageExceeded", slippageExceeded: { toleranceBps: slippageBps } });
  }
  if (args.maxPayAmount < quote.payAmount) {
    return mintFail({
      __kind__: "maxPayExceeded",
      maxPayExceeded: { maxPayAmount: args.maxPayAmount, payAmount: quote.payAmount },
    });
  }
  const isolatedFailure = ISOLATED_FAILURES.get(scenario);
  if (isolatedFailure) return mockFailedIsolatedMint(scenario, args, quote, isolatedFailure, now);
  const pool = mintPool(args.token);
  if (pool.token0.isTttiT) {
    pool.reserve0 += quote.positionTttiAmount;
    pool.reserve1 += quote.positionTokenAmount;
  } else {
    pool.reserve1 += quote.positionTttiAmount;
    pool.reserve0 += quote.positionTokenAmount;
  }
  pool.totalShares += quote.shares;
  const positionId = nextPositionId++;
  mockPositions.push({
    id: positionId,
    poolId: pool.id,
    owner: CALLER,
    shares: quote.shares,
    createdAt: now,
    lockStartedAt: now,
    unlockAt: now,
    isCreator: false,
    relayReceivedNs: 0n,
    feesCollected0: 0n,
    feesCollected1: 0n,
  });
  dexRefreshOpening(pool);
  const mintId = nextMintId++;
  const paymentBlock = nextDexBlock++;
  mockLiquidityMints.push({
    id: mintId,
    status: MintStatus.completed,
    rateUsdE8: quote.rateUsdE8,
    token: args.token,
    owner: CALLER,
    createdAt: now,
    paymentBlock,
    positionId,
    payAmount: quote.payAmount,
    tttiAmount: quote.tttiAmount,
    payer: CALLER,
    poolId: pool.id,
  });
  mockGuarantees.push({
    token: args.token,
    owner: CALLER,
    createdAt: now,
    mintId,
    amount: quote.guaranteeAmount,
  });
  mockCreatorSetAsides.push({ token: args.token, mintId, amount: quote.creatorAmount });
  mockGuaranteeCredit(args.token, quote.guaranteeAmount);
  return {
    __kind__: "ok",
    ok: {
      ...(quote.zap ? { zap: quote.zap } : {}),
      rateUsdE8: quote.rateUsdE8,
      token: args.token,
      shares: quote.shares,
      owner: CALLER,
      createdAt: now,
      mintId,
      paymentBlock,
      positionId,
      payAmount: quote.payAmount,
      guaranteeAmount: quote.guaranteeAmount,
      priceAfter: quote.priceAfter,
      tttiAmount: quote.tttiAmount,
      positionTttiAmount: quote.positionTttiAmount,
      positionTokenAmount: quote.positionTokenAmount,
      priceBefore: quote.priceBefore,
      creatorAmount: quote.creatorAmount,
      poolId: quote.poolId,
    },
  };
}

// --- PTM-2: personal guarantee and redemption (simulated) ------------------

const mockRedemptions: Array<Redemption> = [];
const mockRedemptionFees: Array<RedemptionFee> = [];
let nextRedemptionId = 1n;

/** Redeemed part of the caller's mass, per token (the masses themselves come from the simulated mints). */
interface RedeemedState {
  ttti: bigint;
  guarantee: bigint;
  excess: bigint;
  withdrawn: bigint;
}
const mockRedeemed: Record<PayToken, RedeemedState> = {
  [PayToken.icp]: { ttti: 0n, guarantee: 0n, excess: 0n, withdrawn: 0n },
  [PayToken.ckbtc]: { ttti: 0n, guarantee: 0n, excess: 0n, withdrawn: 0n },
  [PayToken.ckusdc]: { ttti: 0n, guarantee: 0n, excess: 0n, withdrawn: 0n },
  [PayToken.ckusdt]: { ttti: 0n, guarantee: 0n, excess: 0n, withdrawn: 0n },
};

/** Mass of other minters counted in the public unclaimed total (simulated). */
const OTHER_MASS_COUNT = 3n;
const OTHER_MASS_TTTI = 20_000_000n; // 0.2 TTTI-T, in ICP

/** Mock-only simulation switch: `?guarantee=ended|rate|balance|allowance|slippage` in the page URL. */
function guaranteeScenario(): string {
  if (typeof window === "undefined") return "";
  try {
    return new URLSearchParams(window.location.search).get("guarantee") ?? "";
  } catch {
    return "";
  }
}

const guaranteeMintEnded = () => guaranteeScenario() === "ended" || mintSoldTtti() >= MINT_CAP_TTTI;

const guaranteeRate = (token: PayToken): bigint | undefined =>
  dexRatesValid() && guaranteeScenario() !== "rate" ? MOCK_PAY_USD_E8[token] : undefined;

/**
 * PTM-9b: the dedicated internal guarantee account of each token, inside the common custody.
 * The mint and the auction settlement credit it; a redemption (or an excess withdrawal) is the only debit.
 * It starts at the guarantee of the other minters' masses (ICP).
 */
let mockGuaranteeAccountState: Record<PayToken, bigint> | undefined;
const mockGuaranteeAccountBalances = (): Record<PayToken, bigint> => {
  if (!mockGuaranteeAccountState) {
    mockGuaranteeAccountState = {
      [PayToken.icp]: mockOtherGuarantee(),
      [PayToken.ckbtc]: 0n,
      [PayToken.ckusdc]: 0n,
      [PayToken.ckusdt]: 0n,
    };
  }
  return mockGuaranteeAccountState;
};
const mockGuaranteeCredit = (token: PayToken, amount: bigint) => {
  mockGuaranteeAccountBalances()[token] += amount;
};
const mockGuaranteeDebit = (token: PayToken, amount: bigint) => {
  const balances = mockGuaranteeAccountBalances();
  balances[token] = balances[token] > amount ? balances[token] - amount : 0n;
};

/** Guarantee of the other minters' masses, in ICP. */
const mockOtherGuarantee = (): bigint =>
  (OTHER_MASS_TTTI * 10_000n * 10n ** BigInt(PAY_TOKENS[PayToken.icp].decimals)) /
  MOCK_PAY_USD_E8[PayToken.icp];

/** Masses created by settled auction winners (all principals), per payment token. */
const mockAuctionMass: Record<PayToken, { ttti: bigint; guarantee: bigint; count: bigint }> = {
  [PayToken.icp]: { ttti: 0n, guarantee: 0n, count: 0n },
  [PayToken.ckbtc]: { ttti: 0n, guarantee: 0n, count: 0n },
  [PayToken.ckusdc]: { ttti: 0n, guarantee: 0n, count: 0n },
  [PayToken.ckusdt]: { ttti: 0n, guarantee: 0n, count: 0n },
};

/** A settled winner's guarantee joins the common mass and credits the guarantee account. */
function mockAuctionGuaranteeCredit(token: PayToken, tttiE8s: bigint, guarantee: bigint) {
  const mass = mockAuctionMass[token];
  mass.ttti += tttiE8s;
  mass.guarantee += guarantee;
  mass.count += 1n;
  mockGuaranteeCredit(token, guarantee);
}

/** Sum of every guarantee mass (remaining guarantee + excess) of one token, all owners. */
function mockGuaranteeMassTotal(token: PayToken): bigint {
  const own = massOf(token)?.guaranteeValue ?? 0n;
  const other = token === PayToken.icp ? mockOtherGuarantee() : 0n;
  return own + other + mockAuctionMass[token].guarantee;
}

/** Public: per token, the sum of the masses against the balance of the dedicated account. */
function mockGuaranteeAccounts(): Array<GuaranteeAccountView> {
  const balances = mockGuaranteeAccountBalances();
  const entries: Array<GuaranteeAccountView> = [
    // TTTI-T carries no guarantee mass: its guarantee account stays empty.
    { token: DexToken.tttiT, massTotal: 0n, accountBalance: 0n, equal: true },
  ];
  for (const token of PAY_TOKEN_ORDER) {
    const massTotal = mockGuaranteeMassTotal(token);
    entries.push({
      token: DEX_OF_PAY[token],
      massTotal,
      accountBalance: balances[token],
      equal: massTotal === balances[token],
    });
  }
  return entries;
}

function massOf(token: PayToken): GuaranteeMassView | undefined {
  const mints = mockLiquidityMints.filter(
    (m) => m.status === MintStatus.completed && m.token === token && m.owner.toText() === CALLER.toText(),
  );
  if (mints.length === 0) return undefined;
  const totalTtti = mints.reduce((sum, m) => sum + m.tttiAmount, 0n);
  const totalGuarantee = mockGuarantees
    .filter((g) => g.token === token && g.owner.toText() === CALLER.toText())
    .reduce((sum, g) => sum + g.amount, 0n);
  const done = mockRedeemed[token];
  const excess = done.excess - done.withdrawn;
  const remainingGuarantee = totalGuarantee - done.guarantee;
  const guaranteeValue = remainingGuarantee + excess;
  const rate = guaranteeRate(token);
  const ended = guaranteeMintEnded();
  return {
    token,
    totalTtti,
    totalGuarantee,
    remainingTtti: totalTtti - done.ttti,
    remainingGuarantee,
    excess,
    withdrawableExcess: ended ? excess : 0n,
    guaranteeValue,
    rateUsdE8: rate,
    guaranteeValueUsdE8: rate === undefined ? undefined : (guaranteeValue * rate) / 10n ** BigInt(PAY_TOKENS[token].decimals),
    mintEnded: ended,
  };
}

function mockGuaranteeMasses(): Array<GuaranteeMassView> {
  return PAY_TOKEN_ORDER.map(massOf).filter((m): m is GuaranteeMassView => m !== undefined);
}

type QuoteResult = { __kind__: "ok"; ok: RedeemQuote } | { __kind__: "err"; err: GuaranteeError };
type RedeemResult = { __kind__: "ok"; ok: Redemption } | { __kind__: "err"; err: GuaranteeError };
const quoteFail = (err: GuaranteeError): QuoteResult => ({ __kind__: "err", err });
const redeemFail = (err: GuaranteeError): RedeemResult => ({ __kind__: "err", err });

function mockQuoteGuarantee(token: PayToken, tttiAmount: bigint): QuoteResult {
  const mass = massOf(token);
  if (!mass) return quoteFail({ __kind__: "massNotFound", massNotFound: null });
  if (mass.remainingTtti === 0n) return quoteFail({ __kind__: "nothingRemaining", nothingRemaining: null });
  if (tttiAmount === 0n) return quoteFail({ __kind__: "amountTooSmall", amountTooSmall: null });
  if (tttiAmount > mass.remainingTtti) {
    return quoteFail({
      __kind__: "amountExceedsMass",
      amountExceedsMass: { requested: tttiAmount, remaining: mass.remainingTtti },
    });
  }
  const decimals = 10n ** BigInt(PAY_TOKENS[token].decimals);
  const deposited = (mass.remainingGuarantee * tttiAmount) / mass.remainingTtti;
  const phase = mass.mintEnded ? RedeemPhase.afterMint : RedeemPhase.duringMint;
  let returned = deposited;
  let rule = RedeemRule.proRata;
  let excessKept = 0n;
  let dayRateQuantity: bigint | undefined;
  const rate = mass.rateUsdE8;
  if (!mass.mintEnded) {
    if (rate === undefined) return quoteFail({ __kind__: "rateUnavailable", rateUnavailable: token });
    dayRateQuantity = (tttiAmount * 10_000n * decimals) / rate;
    if (dayRateQuantity < deposited) {
      returned = dayRateQuantity;
      rule = RedeemRule.dayRate;
      excessKept = deposited - dayRateQuantity;
    } else {
      rule = RedeemRule.depositedGuarantee;
    }
  }
  const redemptionFee = returned / 100n;
  const thirdPartyFee = PAY_TOKENS[token].fee;
  if (returned <= redemptionFee + thirdPartyFee) return quoteFail({ __kind__: "amountTooSmall", amountTooSmall: null });
  return {
    __kind__: "ok",
    ok: {
      token,
      tttiAmount,
      phase,
      rule,
      depositedGuarantee: deposited,
      dayRateQuantity,
      rateUsdE8: mass.mintEnded ? undefined : rate,
      returnedAmount: returned,
      excessKept,
      redemptionFee,
      thirdPartyFee,
      netAmount: returned - redemptionFee - thirdPartyFee,
      tttiTransferFee: state.fee,
      tttiAllowanceRequired: tttiAmount + state.fee,
    },
  };
}

function redemptionPayout(
  id: bigint,
  token: PayToken,
  netAmount: bigint,
  thirdPartyFee: bigint,
  outcome: AttemptOutcome,
  createdAt: bigint,
  owner: Principal,
): Redemption["payout"] {
  return {
    n: id,
    attempt: 1n,
    request: {
      to: { owner },
      fee: thirdPartyFee,
      token: DEX_OF_PAY[token],
      from: dexCustodyAccount(DEX_OF_PAY[token]),
      amount: netAmount,
    },
    memo: new TextEncoder().encode(`TTTI-GR-${id}`),
    sends: 1n,
    created_at_time: createdAt,
    outcome,
  };
}

function mockRedeemGuarantee(token: PayToken, tttiAmount: bigint, expectedNetAmount: bigint): RedeemResult {
  const quoted = mockQuoteGuarantee(token, tttiAmount);
  if (quoted.__kind__ === "err") return quoted;
  const quote = quoted.ok;
  const scenario = guaranteeScenario();
  if (scenario === "balance") {
    return redeemFail({
      __kind__: "tttiBalanceInsufficient",
      tttiBalanceInsufficient: { balance: 0n, required: quote.tttiAllowanceRequired },
    });
  }
  if (scenario === "allowance") {
    return redeemFail({
      __kind__: "allowanceInsufficient",
      allowanceInsufficient: { allowance: 0n, required: quote.tttiAllowanceRequired },
    });
  }
  if (scenario === "slippage" || quote.netAmount < expectedNetAmount) {
    return redeemFail({
      __kind__: "slippage",
      slippage: { netAmount: quote.netAmount, expectedNetAmount },
    });
  }
  const done = mockRedeemed[token];
  done.ttti += quote.tttiAmount;
  done.guarantee += quote.depositedGuarantee;
  done.excess += quote.excessKept;
  // The redemption is the only debit of the guarantee account: what leaves the masses.
  mockGuaranteeDebit(token, quote.returnedAmount);
  const id = nextRedemptionId++;
  const now = nowNs();
  const pullBlock = nextDexBlock++;
  const payoutBlock = nextDexBlock++;
  const redemption: Redemption = {
    id,
    owner: CALLER,
    account: { owner: CALLER },
    kind: RedemptionKind.redeem,
    token,
    phase: quote.phase,
    rule: quote.rule,
    tttiAmount: quote.tttiAmount,
    tttiPullBlock: pullBlock,
    depositedGuarantee: quote.depositedGuarantee,
    rateUsdE8: quote.rateUsdE8,
    returnedAmount: quote.returnedAmount,
    excessKept: quote.excessKept,
    redemptionFee: quote.redemptionFee,
    thirdPartyFee: quote.thirdPartyFee,
    netAmount: quote.netAmount,
    createdAt: now,
    payout: redemptionPayout(id, token, quote.netAmount, quote.thirdPartyFee, { __kind__: "succeeded", succeeded: payoutBlock }, now, CALLER),
    status: { __kind__: "completed", completed: payoutBlock },
  };
  mockRedemptions.push(redemption);
  mockRedemptionFees.push({ redemptionId: id, token, amount: quote.redemptionFee, createdAt: now });
  return { __kind__: "ok", ok: redemption };
}

function mockWithdrawExcess(token: PayToken): RedeemResult {
  const mass = massOf(token);
  if (!mass) return redeemFail({ __kind__: "massNotFound", massNotFound: null });
  if (!mass.mintEnded) return redeemFail({ __kind__: "mintNotEnded", mintNotEnded: null });
  if (mass.withdrawableExcess === 0n) return redeemFail({ __kind__: "noExcess", noExcess: null });
  const thirdPartyFee = PAY_TOKENS[token].fee;
  const amount = mass.withdrawableExcess;
  if (amount <= thirdPartyFee) return redeemFail({ __kind__: "amountTooSmall", amountTooSmall: null });
  mockRedeemed[token].withdrawn += amount;
  mockGuaranteeDebit(token, amount);
  const id = nextRedemptionId++;
  const now = nowNs();
  const payoutBlock = nextDexBlock++;
  const netAmount = amount - thirdPartyFee;
  const redemption: Redemption = {
    id,
    owner: CALLER,
    account: { owner: CALLER },
    kind: RedemptionKind.excessWithdrawal,
    token,
    phase: RedeemPhase.afterMint,
    rule: RedeemRule.proRata,
    tttiAmount: 0n,
    depositedGuarantee: 0n,
    returnedAmount: amount,
    excessKept: 0n,
    redemptionFee: 0n,
    thirdPartyFee,
    netAmount,
    createdAt: now,
    payout: redemptionPayout(id, token, netAmount, thirdPartyFee, { __kind__: "succeeded", succeeded: payoutBlock }, now, CALLER),
    status: { __kind__: "completed", completed: payoutBlock },
  };
  mockRedemptions.push(redemption);
  return { __kind__: "ok", ok: redemption };
}

function mockUnclaimedTotal(): UnclaimedMassTotal {
  const own = mockGuaranteeMasses();
  const otherGuarantee = mockOtherGuarantee();
  const perToken: Array<TokenGuaranteeTotal> = PAY_TOKEN_ORDER.map((token) => {
    const mass = own.find((m) => m.token === token);
    const other = token === PayToken.icp;
    return {
      token,
      remainingTtti: (mass?.remainingTtti ?? 0n) + (other ? OTHER_MASS_TTTI : 0n) + mockAuctionMass[token].ttti,
      remainingGuarantee:
        (mass?.remainingGuarantee ?? 0n) + (other ? otherGuarantee : 0n) + mockAuctionMass[token].guarantee,
      excess: mass?.excess ?? 0n,
    };
  }).filter((entry) => entry.remainingTtti > 0n || entry.excess > 0n);
  return {
    massCount:
      OTHER_MASS_COUNT +
      BigInt(own.filter((m) => m.remainingTtti > 0n).length) +
      PAY_TOKEN_ORDER.reduce((sum, token) => sum + mockAuctionMass[token].count, 0n),
    remainingTtti: perToken.reduce((sum, entry) => sum + entry.remainingTtti, 0n),
    mintEnded: guaranteeMintEnded(),
    perToken,
  };
}

function setRedemptionStatus(id: bigint, status: Redemption["status"], outcome: AttemptOutcome) {
  const index = mockRedemptions.findIndex((r) => r.id === id);
  if (index < 0) return;
  const record = mockRedemptions[index];
  mockRedemptions[index] = { ...record, status, payout: { ...record.payout, outcome } };
}

function redemptionArrived(id: bigint, block: bigint) {
  setRedemptionStatus(id, { __kind__: "completed", completed: block }, { __kind__: "succeeded", succeeded: block });
}

function redemptionNotArrived(id: bigint) {
  setRedemptionStatus(id, { __kind__: "failed", failed: "Payout not sent" }, { __kind__: "failed", failed: "Payout not sent" });
}

/** #GR review row of a redemption payout (id = redemption id). */
function redemptionReviewRow(r: Redemption): TransferReview {
  const memoText = new TextDecoder().decode(r.payout.memo);
  return {
    kind: TransferKind.GR,
    purchaseId: r.id,
    token: r.payout.request.token,
    memoText,
    memoHex: memoHexOf(memoText),
    createdAtTimeNs: r.payout.created_at_time,
    amount: r.payout.request.amount,
    fee: r.payout.request.fee,
    destination: r.payout.request.to,
    sends: r.payout.sends,
    lastError: "Call timed out (outcome unknown)",
    buyer: r.owner,
    outcome: r.payout.outcome,
  };
}

// One redemption payout of another minter, unknown after 23 h: listed in To review.
{
  const id = nextRedemptionId++;
  const createdAt = nowNs() - 25n * HOUR_NS;
  const token = PayToken.icp;
  const returned = ICP_DIVISOR / 2n;
  const redemptionFee = returned / 100n;
  const thirdPartyFee = ICP_LEDGER_FEE;
  const netAmount = returned - redemptionFee - thirdPartyFee;
  const review: Redemption = {
    id,
    owner: HOLDER_3,
    account: { owner: HOLDER_3 },
    kind: RedemptionKind.redeem,
    token,
    phase: RedeemPhase.afterMint,
    rule: RedeemRule.proRata,
    tttiAmount: TTTI_DIVISOR / 1000n,
    tttiPullBlock: 1_100n + id,
    depositedGuarantee: returned,
    returnedAmount: returned,
    excessKept: 0n,
    redemptionFee,
    thirdPartyFee,
    netAmount,
    createdAt,
    payout: redemptionPayout(id, token, netAmount, thirdPartyFee, { __kind__: "unknown", unknown: null }, createdAt, HOLDER_3),
    status: { __kind__: "needsReview", needsReview: null },
  };
  mockRedemptions.push(review);
  mockRedemptionFees.push({ redemptionId: id, token, amount: redemptionFee, createdAt });
  mockReviews.push(redemptionReviewRow(review));
}

const mintPage = <T,>(items: Array<T>, offset: bigint, limit: bigint): Array<T> =>
  items.slice(Number(offset), Number(offset + limit));

const replacedByLiquidityMint = (): PurchaseResult =>
  purchaseError(
    { __kind__: "replacedByLiquidityMint", replacedByLiquidityMint: null },
    "Minting now forms liquidity: use mintLiquidity.",
  );

// --- PTM-4: public board, creator holdings, cycles fee routing, permanent liquidity ---
// Protocol share of a swap fee: 30 %, two thirds credited to the creator and one third set
// aside as permanent liquidity; the other 70 % stays with the liquidity providers.

/** ICP part of the 1 % mint and buyback fees waiting for the next settlement to the reserve. */
let mockPendingFeeShareE8s = 3_400_000n;

/** Reserve coverage from the measured daily consumption; the one-year target is the fill reference. */
function mockReserveCoverage(): ReserveCoverage {
  const autonomy = mockAutonomy();
  const dailyConsumptionCycles = LOT4_AVG7D > LOT4_AVG30D ? LOT4_AVG7D : LOT4_AVG30D;
  const yearTargetCycles = dailyConsumptionCycles * 365n;
  const monthlyConsumptionCycles = dailyConsumptionCycles * 30n;
  const filled = (autonomy.totalCycles * 10_000n) / yearTargetCycles;
  return {
    rateKnown: true,
    totalCycles: autonomy.totalCycles,
    dailyConsumptionCycles,
    monthlyConsumptionCycles,
    yearTargetCycles,
    yearTargetE8s: (yearTargetCycles * ICP_DIVISOR) / LOT4_CYCLES_PER_ICP,
    monthsCoveredX100: (autonomy.totalCycles * 100n) / monthlyConsumptionCycles,
    fillBps: filled > 10_000n ? 10_000n : filled,
  };
}

function mockTopUpCycles(): Outcome<"topUpCycles"> {
  // Like the real contract (system func inspect): refused when the balance is at or above the
  // threshold and no attempt is pending.
  const attemptPending = state.lastTopUp.status.__kind__ === "transferred";
  if (state.cyclesBalance >= TOP_UP_THRESHOLD && !attemptPending) {
    throw new Error(
      `Top-up not needed: the cycles balance (${state.cyclesBalance}) is at or above the threshold (${TOP_UP_THRESHOLD}) and no top-up is pending.`,
    );
  }
  const spendable = state.reserveBalanceE8s > RESERVE_FLOOR_E8S ? state.reserveBalanceE8s - RESERVE_FLOOR_E8S : 0n;
  const icpE8s = spendable > 50_000_000n ? 50_000_000n : spendable;
  if (icpE8s > 0n) {
    const cycles = (icpE8s * LOT4_CYCLES_PER_ICP) / ICP_DIVISOR;
    state.reserveBalanceE8s -= icpE8s;
    state.cyclesBalance += cycles;
    state.lastTopUp = {
      timestamp: nowNs(),
      icpE8s,
      blockIndex: state.nextBlock++,
      status: { __kind__: "notified", notified: { cycles } },
    };
  }
  return {
    __kind__: "ran",
    ran: {
      cyclesBalance: state.cyclesBalance,
      reserveBalanceE8s: state.reserveBalanceE8s,
      lastTopUp: state.lastTopUp,
      attemptOpen: false,
    },
  };
}

function mockTransferAttempt(
  n: bigint,
  token: DexToken,
  to: Account,
  amount: bigint,
  createdAt: bigint,
  memo: string,
  outcome: DexTransferAttempt["outcome"],
): DexTransferAttempt {
  return {
    n,
    attempt: 1n,
    request: { to, fee: dexTokenFee(token), token, from: { owner: TTTI_CANISTER }, amount },
    memo: new TextEncoder().encode(memo),
    sends: 1n,
    created_at_time: createdAt,
    outcome,
    ...(outcome.__kind__ === "unknown" ? { lastError: "Call timed out (outcome unknown)" } : {}),
  };
}

// Cycles fee settlements: the ICP part of the 1 % fees moves to the reserve account (memo TTTI-CY-n).
const mockCyclesFeeSettlements: Array<CyclesFeeSettlement> = [1n, 2n, 3n].map((n) => {
  const grossE8s = n === 1n ? 12_000_000n : n === 2n ? 8_500_000n : 5_100_000n;
  const createdAt = nowNs() - (n === 1n ? 6n * LOT4_DAY_NS : n === 2n ? 3n * LOT4_DAY_NS : 26n * HOUR_NS);
  const block = 18_190_000n + n * 1_100n;
  const reviewed = n === 3n;
  const outcome: DexTransferAttempt["outcome"] = reviewed
    ? { __kind__: "unknown", unknown: null }
    : { __kind__: "succeeded", succeeded: block };
  const status: DexTransferStatus = reviewed
    ? { __kind__: "needsReview", needsReview: null }
    : { __kind__: "completed", completed: block };
  return {
    n,
    grossE8s,
    netE8s: grossE8s - ICP_LEDGER_FEE,
    createdAt,
    status,
    attempt: mockTransferAttempt(n, DexToken.icp, CYCLES_RESERVE_ACCOUNT, grossE8s - ICP_LEDGER_FEE, createdAt, `TTTI-CY-${n}`, outcome),
  };
});

// Fee splits recorded with each 1 % fee: the reserve is below its one-year target, so the ICP part goes to it first.
const mockCyclesFeeSplits: Array<FeeSplitRow> = [
  { id: 1n, source: FeeSplitSource.mint, split: { cyclesE8s: 2_000_000n, creator: 0n } },
  { id: 2n, source: FeeSplitSource.mint, split: { cyclesE8s: 1_200_000n, creator: 0n } },
  { id: 3n, source: FeeSplitSource.mint, split: { cyclesE8s: 3_100_000n, creator: 0n } },
  { id: 1n, source: FeeSplitSource.buyback, split: { cyclesE8s: 600_000n, creator: 0n } },
  { id: 2n, source: FeeSplitSource.buyback, split: { cyclesE8s: 1_900_000n, creator: 0n } },
];

type MockCreatorToken = {
  mintFee: bigint;
  buybackFee: bigint;
  swapFeeShare: bigint;
  routerShare: bigint;
  transferFee: bigint;
  paidOut: bigint;
  inFlight: bigint;
  lastCreditAt?: bigint;
};
const mockCreatorTokens: Record<DexToken, MockCreatorToken> = {
  [DexToken.icp]: {
    mintFee: 41_200_000n,
    buybackFee: 8_000_000n,
    swapFeeShare: 12_600_000n,
    routerShare: 1_900_000n,
    transferFee: 0n,
    paidOut: 30_000_000n,
    inFlight: 0n,
    lastCreditAt: nowNs() - 5n * HOUR_NS,
  },
  [DexToken.tttiT]: {
    mintFee: 0n,
    buybackFee: 0n,
    swapFeeShare: 4_300_000n,
    routerShare: 610_000n,
    transferFee: 2_000_000n,
    paidOut: 0n,
    inFlight: 0n,
    lastCreditAt: nowNs() - 9n * HOUR_NS,
  },
  [DexToken.ckbtc]: {
    mintFee: 12_000n,
    buybackFee: 0n,
    swapFeeShare: 3_400n,
    routerShare: 0n,
    transferFee: 0n,
    paidOut: 0n,
    inFlight: 0n,
    lastCreditAt: nowNs() - 2n * LOT4_DAY_NS,
  },
  [DexToken.ckusdc]: {
    mintFee: 18_500_000n,
    buybackFee: 0n,
    swapFeeShare: 2_100_000n,
    routerShare: 400_000n,
    transferFee: 0n,
    paidOut: 8_000_000n,
    inFlight: 5_000_000n,
    lastCreditAt: nowNs() - 20n * HOUR_NS,
  },
  [DexToken.ckusdt]: {
    mintFee: 7_000_000n,
    buybackFee: 0n,
    swapFeeShare: 900_000n,
    routerShare: 0n,
    transferFee: 0n,
    paidOut: 0n,
    inFlight: 0n,
    lastCreditAt: nowNs() - 3n * LOT4_DAY_NS,
  },
};
const MOCK_CREATOR_TOKEN_ORDER: Array<DexToken> = [
  DexToken.icp,
  DexToken.tttiT,
  DexToken.ckbtc,
  DexToken.ckusdc,
  DexToken.ckusdt,
];
const mockCreatorPayouts: Array<CreatorPayoutView> = [
  {
    n: 1n,
    symbol: "ICP",
    grossAmount: 30_000_000n,
    netAmount: 30_000_000n - ICP_LEDGER_FEE,
    createdAt: nowNs() - 8n * LOT4_DAY_NS,
    memoText: "TTTI-CF-1",
    status: { __kind__: "completed", completed: 18_170_552n },
  },
  {
    n: 2n,
    symbol: "ckUSDC",
    grossAmount: 8_000_000n,
    netAmount: 8_000_000n - PAY_TOKENS[PayToken.ckusdc].fee,
    createdAt: nowNs() - 5n * LOT4_DAY_NS,
    memoText: "TTTI-CF-2",
    status: { __kind__: "completed", completed: 912_440n },
  },
  {
    n: 3n,
    symbol: "ckUSDC",
    grossAmount: 5_000_000n,
    netAmount: 5_000_000n - PAY_TOKENS[PayToken.ckusdc].fee,
    createdAt: nowNs() - 27n * HOUR_NS,
    memoText: "TTTI-CF-3",
    status: { __kind__: "needsReview", needsReview: null },
  },
];
let nextCreatorPayoutN = 4n;

const mockCreatorHeld = (t: MockCreatorToken): bigint =>
  t.mintFee + t.buybackFee + t.swapFeeShare + t.routerShare + t.transferFee - t.paidOut - t.inFlight;

const DEX_TOKEN_SYMBOL: Record<DexToken, string> = {
  [DexToken.icp]: "ICP",
  [DexToken.tttiT]: TTTI_SYMBOL,
  [DexToken.ckbtc]: "ckBTC",
  [DexToken.ckusdc]: "ckUSDC",
  [DexToken.ckusdt]: "ckUSDT",
};

function mockCreatorTokenViews(): Array<CreatorTokenView> {
  return MOCK_CREATOR_TOKEN_ORDER.map((token) => {
    const t = mockCreatorTokens[token];
    return {
      token,
      symbol: DEX_TOKEN_SYMBOL[token],
      held: mockCreatorHeld(t),
      paidOut: t.paidOut,
      inFlight: t.inFlight,
      mintFee: t.mintFee,
      buybackFee: t.buybackFee,
      swapFeeShare: t.swapFeeShare,
      routerShare: t.routerShare,
      transferFee: t.transferFee,
      ...(t.lastCreditAt !== undefined ? { lastCreditAt: t.lastCreditAt } : {}),
    };
  });
}

function mockCreatorHoldings(): Outcome<"getCreatorHoldings"> {
  return {
    tokens: mockCreatorTokenViews(),
    transferFeeCollectorE8s: state.feeCollectorBalance,
    payouts: [...mockCreatorPayouts].reverse().slice(0, 20),
  };
}

function mockPayCreatorFees(token: DexToken): Outcome<"payCreatorFees"> {
  const t = mockCreatorTokens[token];
  const held = mockCreatorHeld(t);
  const fee = dexTokenFee(token);
  if (held <= 0n) return { __kind__: "err", err: { __kind__: "nothingToPay", nothingToPay: null } };
  if (t.inFlight > 0n) return { __kind__: "err", err: { __kind__: "payoutInProgress", payoutInProgress: null } };
  if (held <= fee) return { __kind__: "err", err: { __kind__: "belowFee", belowFee: { fee, held } } };
  const n = nextCreatorPayoutN++;
  const payout: CreatorPayoutView = {
    n,
    symbol: DEX_TOKEN_SYMBOL[token],
    grossAmount: held,
    netAmount: held - fee,
    createdAt: nowNs(),
    memoText: `TTTI-CF-${n}`,
    status: { __kind__: "completed", completed: state.nextBlock++ },
  };
  t.paidOut += held;
  mockCreatorPayouts.push(payout);
  return { __kind__: "ok", ok: payout };
}

type MockReviewResult = { __kind__: "ok"; ok: null } | { __kind__: "err"; err: string };

function mockReviewCreatorPayout(n: bigint, block: bigint | null): MockReviewResult {
  const payout = mockCreatorPayouts.find((x) => x.n === n);
  if (!payout || payout.status.__kind__ !== "needsReview") {
    return { __kind__: "err", err: "This payout is unknown or is not waiting for a review." };
  }
  const token = MOCK_CREATOR_TOKEN_ORDER.find((x) => DEX_TOKEN_SYMBOL[x] === payout.symbol);
  if (token === undefined) return { __kind__: "err", err: "The payout token is unknown." };
  const t = mockCreatorTokens[token];
  t.inFlight -= payout.grossAmount;
  if (block !== null) {
    t.paidOut += payout.grossAmount;
    payout.status = { __kind__: "completed", completed: block };
  } else {
    payout.status = { __kind__: "failed", failed: "Marked as not arrived by the admin; the amount is held again." };
  }
  return { __kind__: "ok", ok: null };
}

function mockReviewCyclesSettlement(n: bigint, block: bigint | null): MockReviewResult {
  const settlement = mockCyclesFeeSettlements.find((x) => x.n === n);
  if (!settlement || settlement.status.__kind__ !== "needsReview") {
    return { __kind__: "err", err: "This settlement is unknown or is not waiting for a review." };
  }
  if (block !== null) {
    settlement.status = { __kind__: "completed", completed: block };
    settlement.attempt = { ...settlement.attempt, outcome: { __kind__: "succeeded", succeeded: block } };
  } else {
    settlement.status = { __kind__: "failed", failed: "Marked as not arrived by the admin; the amount is sent again." };
    settlement.attempt = { ...settlement.attempt, outcome: { __kind__: "failed", failed: "Not arrived" } };
    mockPendingFeeShareE8s += settlement.grossE8s;
  }
  return { __kind__: "ok", ok: null };
}

// Permanent liquidity journal: set-aside accrued, rebalanced on the best route, injected as locked shares.
const mockPermanentLog: Array<PermanentLogEntry> = (() => {
  const poolId = lot4Pool(DEX_TTTI, DEX_ICP)?.id ?? 1n;
  const entry = (
    id: bigint,
    hoursAgo: bigint,
    kind: PermanentKind,
    token: DexToken,
    amount: bigint,
    extra: Partial<PermanentLogEntry> = {},
  ): PermanentLogEntry => ({
    id,
    at: nowNs() - hoursAgo * HOUR_NS,
    kind,
    token,
    amount,
    otherAmount: 0n,
    shares: 0n,
    ...extra,
  });
  return [
    entry(1n, 150n, PermanentKind.accrued, DexToken.icp, 4_200_000n),
    entry(2n, 130n, PermanentKind.accrued, DexToken.ckusdt, 3_100_000n),
    entry(3n, 96n, PermanentKind.waiting, DexToken.icp, 6_500_000n, {
      reason: "Set-aside is below the injection threshold of 1 ICP.",
    }),
    entry(4n, 70n, PermanentKind.accrued, DexToken.icp, 51_000_000n),
    entry(5n, 69n, PermanentKind.rebalanced, DexToken.icp, 51_000_000n, {
      otherToken: DexToken.tttiT,
      otherAmount: 40_400n,
      route: { __kind__: "native", native: poolId },
      poolId,
    }),
    entry(6n, 69n, PermanentKind.injected, DexToken.icp, 51_000_000n, {
      otherToken: DexToken.tttiT,
      otherAmount: 40_400n,
      route: { __kind__: "native", native: poolId },
      poolId,
      shares: 1_435_000n,
    }),
    entry(7n, 30n, PermanentKind.failed, DexToken.ckusdt, 3_100_000n, {
      reason: "No route within 2 % of the average price of the last hour.",
    }),
    entry(8n, 6n, PermanentKind.accrued, DexToken.icp, 7_800_000n),
  ];
})();

function mockPermanentSummary(): PermanentSummary {
  const pools: Array<PermanentPoolSummary> = mockPools.flatMap((pool) => {
    const lockedShares = pool.lockedShares + (dexProtocolShares.get(pool.id) ?? 0n);
    if (lockedShares === 0n || pool.totalShares === 0n) return [];
    const amount0 = (lockedShares * pool.reserve0) / pool.totalShares;
    const amount1 = (lockedShares * pool.reserve1) / pool.totalShares;
    const usd = dexDepthAt(pool, amount0, amount1).usdE8;
    return [
      {
        poolId: pool.id,
        token0Symbol: pool.token0.symbol,
        token1Symbol: pool.token1.symbol,
        lockedShares,
        totalShares: pool.totalShares,
        amount0,
        amount1,
        ...(usd !== undefined ? { valueUsdE8: usd } : {}),
      },
    ];
  });
  const setAside = [
    { token: DexToken.icp, symbol: "ICP", amount: 14_300_000n, valueIcpE8s: 14_300_000n },
    { token: DexToken.ckusdt, symbol: "ckUSDT", amount: 3_100_000n, valueIcpE8s: 2_480_000n },
  ];
  return {
    pools,
    totalLockedShares: pools.reduce((sum, x) => sum + x.lockedShares, 0n),
    setAside,
    setAsideValueIcpE8s: setAside.reduce((sum, x) => sum + x.valueIcpE8s, 0n),
    thresholdIcpE8s: 100_000_000n,
    maxDeviationBps: 200n,
    targetPoolId: lot4Pool(DEX_TTTI, DEX_ICP)?.id,
  };
}

function mockPublicBoard(): PublicBoard {
  const newestFirst = [...mockPermanentLog].reverse();
  return {
    cycles: {
      cyclesBalance: state.cyclesBalance,
      reserveBalanceE8s: state.reserveBalanceE8s,
      pendingFeeShareE8s: mockPendingFeeShareE8s,
      coverage: mockReserveCoverage(),
    },
    permanentLiquidity: {
      summary: mockPermanentSummary(),
      journalEntries: BigInt(newestFirst.length),
      latestEntries: newestFirst.slice(0, 10),
    },
    creator: {
      tokens: mockCreatorTokenViews(),
      transferFeeCollectorE8s: state.feeCollectorBalance,
    },
  };
}

// Seed: pools with a locked position already hold a pending pot (the locked half of earlier LP fees).
for (const pool of mockPools) {
  if (!mockPositions.some((p) => p.poolId === pool.id && p.unlockAt > nowNs() && p.shares > 0n)) continue;
  const pot = dexPotOf(pool.id);
  pot.pending0 += pool.reserve0 / 2_000n;
  pot.pending1 += pool.reserve1 / 2_000n;
}

export const mockBackend: backendInterface = {
  _initialize_access_control: async () => undefined,
  setReceivingWallet: async (token, account) => mockSetReceivingWallet(token, account),
  getReceivingWallets: async () => ({
    __kind__: "ok",
    ok: PAY_TOKEN_ORDER.map((token) => ({ ...mockReceivingWallets[token] })),
  }),
  getSettlementStatus: async () => ({
    __kind__: "ok",
    ok: mockSettlements.map((s) => ({ ...s, legs: s.legs.map((l) => ({ ...l })) })),
  }),
  getMintFeeAccount: async () => ({ __kind__: "ok", ok: mockFeeAccount() }),
  listAdminHistory: async (filter, token, offset, limit) => mockListAdminHistory(filter, token, offset, limit),
  listTransfersToReviewFiltered: async (filter) => mockReviewsFiltered(filter),
  listTreasuryWithdrawals: async (offset, limit) => {
    const all = [...mockWithdrawals].reverse();
    return { __kind__: "ok", ok: { items: all.slice(Number(offset), Number(offset + limit)), total: BigInt(all.length), offset } };
  },
  listOwnerSends: async (offset, limit) => {
    const all = [...mockOwnerSends].reverse();
    return { items: all.slice(Number(offset), Number(offset + limit)), total: BigInt(all.length), offset };
  },
  getOwnerAccumulated: async () =>
    PAY_TOKEN_ORDER.map((token) => ({ token, amount: mockOwnerDestinations[token].accumulated })),
  getTreasurySweepStatus: async () => mockSweepView(),
  getMyMintFees: async () => mockMyMintFees(),
  claimMintFee: async (token) => mockClaimMintFee(token),
  getPublicBoard: async () => mockPublicBoard(),
  getCreatorHoldings: async () => mockCreatorHoldings(),
  payCreatorFees: async (token) => mockPayCreatorFees(token),
  listCreatorPayoutsToReview: async () =>
    mockCreatorPayouts.filter((x) => x.status.__kind__ === "needsReview"),
  markCreatorPayoutArrived: async (n, block) => mockReviewCreatorPayout(n, block),
  markCreatorPayoutNotArrived: async (n) => mockReviewCreatorPayout(n, null),
  topUpCycles: async () => mockTopUpCycles(),
  listCyclesFeeSettlements: async (offset, limit) =>
    [...mockCyclesFeeSettlements].reverse().slice(Number(offset), Number(offset + limit)),
  listCyclesFeeSplits: async (source, offset, limit) =>
    mockCyclesFeeSplits
      .filter((x) => x.source === source)
      .reverse()
      .slice(Number(offset), Number(offset + limit)),
  listCyclesFeeSettlementsToReview: async () =>
    mockCyclesFeeSettlements.filter((x) => x.status.__kind__ === "needsReview"),
  markCyclesFeeSettlementArrived: async (n, block) => mockReviewCyclesSettlement(n, block),
  markCyclesFeeSettlementNotArrived: async (n) => mockReviewCyclesSettlement(n, null),
  listPermanentLiquidityLog: async (offset, limit) => {
    const all = [...mockPermanentLog].reverse();
    const capped = limit > 100n ? 100n : limit;
    return {
      total: BigInt(all.length),
      entries: all.slice(Number(offset), Number(offset + capped)),
    };
  },
  getPermanentLiquiditySummary: async () => mockPermanentSummary(),
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
  addLiquidity: async (args) => {
    assertDexNotPaused();
    return mockAddLiquidity(CALLER, args);
  },
  removeLiquidity: async (positionId) => mockRemoveLiquidity(positionId),
  extendLock: async (positionId, newUnlockAt) => mockExtendLock(positionId, newUnlockAt),
  getDexPosition: async (positionId) => {
    const position = mockPositions.find((p) => p.id === positionId);
    return position ? dexPositionView(position) : null;
  },
  listPoolPositions: async (poolId) => {
    dexProcessRemovals();
    return mockPositions.filter((p) => p.poolId === poolId).map(dexPositionView);
  },
  listDexPositionsOf: async (owner) => {
    dexProcessRemovals();
    return mockPositions.filter((p) => p.owner.toText() === owner.toText()).map(dexPositionView);
  },
  startDexDayRoll: async () => dexStartDayRoll(),
  runDexPotSlice: async (poolId) => {
    const pool = mockPools.find((p) => p.id === poolId);
    return pool
      ? dexRunPotSlice(pool)
      : { poolId, phase: SharingPhase.idle, processed: 0n, more: false, paid0: 0n, paid1: 0n };
  },
  getDexPendingPots: async () => {
    dexProcessRemovals();
    return mockPools.map(dexPendingPotView);
  },
  getDexPendingPot: async (poolId) => {
    dexProcessRemovals();
    const pool = mockPools.find((p) => p.id === poolId);
    return pool ? dexPendingPotView(pool) : null;
  },
  getDexEstimatedShare: async (positionId) => {
    dexProcessRemovals();
    const position = mockPositions.find((p) => p.id === positionId);
    const pool = position ? mockPools.find((p) => p.id === position.poolId) : undefined;
    return pool ? (dexPoolEstimates(pool).find((e) => e.positionId === positionId) ?? null) : null;
  },
  getMyDexEstimatedShares: async () => {
    dexProcessRemovals();
    return mockPools
      .flatMap(dexPoolEstimates)
      .filter((e) => e.owner.toText() === CALLER.toText())
      .sort((a, b) => (a.positionId === b.positionId ? 0 : a.positionId < b.positionId ? -1 : 1));
  },
  quoteRoutedSwap: async (args) => mockQuoteRoutedSwap(args),
  routedSwap: async (args) => {
    assertDexNotPaused();
    return mockRoutedSwap(args);
  },
  runDexReserveCheck: async () => mockRunDexReserveCheck(),
  resumeDex: async () => mockResumeDex(),
  getDexReserveStatus: async () => ({ __kind__: "ok", ok: mockDexReserveStatus() }),
  getDexPauseStatus: async () => mockPublicDexPause(),
  runDexSweep: async () => mockRunDexSweep(),
  resendDexSweepTransfers: async () => mockResendDexSweepTransfers(),
  getDexSweepState: async () => mockSweepState(),
  getDexCustodyComparison: async () =>
    mockSweepState().map((s) => ({ token: s.token, comparison: s.comparison })),
  getDexCustodyAccounts: async () =>
    DEX_TOKEN_ORDER.map((token) => ({ token, account: dexCustodyAccount(token) })),
  listDexSweepTransfers: async (cursor, limit) => mockPage([...mockSweepTransfers].reverse(), cursor, limit),
  getDexSweepProgress: async () => mockSweepProgress(),
  getDexIndicators: async () => mockDexIndicators(),
  getDexIndicatorsStatus: async () => ({ __kind__: "ok", ok: mockDexIndicatorsStatus() }),
  getMyRoutedSwaps: async (cursor, limit) =>
    mockPage(mockRoutedSwaps.filter((s) => s.owner.toText() === CALLER.toText()).reverse(), cursor, limit),
  adminListRoutedSwaps: async (cursor, limit) => ({
    __kind__: "ok",
    ok: mockPage([...mockRoutedSwaps].reverse(), cursor, limit),
  }),
  adminGetRouterFees: async () => ({ __kind__: "ok", ok: [...mockRouterFees.values()] }),
  quoteSwap: async (poolId, tokenIn, amountIn, slippageBps) =>
    mockQuoteSwap(poolId, tokenIn, amountIn, slippageBps),
  swap: async (poolId, tokenIn, amountIn, minAmountOut, deadline) => {
    assertDexNotPaused();
    // Automatic ICRC-2 deposit: the missing amount is pulled from the wallet into the DEX balance.
    const held = dexBalanceOf(CALLER, tokenIn);
    const before = held.available;
    if (before < amountIn) held.available = amountIn;
    const done = mockSwap(poolId, tokenIn, amountIn, minAmountOut, deadline);
    if (done.__kind__ === "err") held.available = before;
    return done;
  },
  listDexPools: async () => {
    dexRefreshAllOpenings();
    return mockPools.map(dexPoolOut);
  },
  getDexPool: async (poolId) => {
    dexRefreshAllOpenings();
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
  removePair: async (poolId, reason) => mockRemovePair(poolId, reason),
  cancelPairRemoval: async (poolId) => mockCancelPairRemoval(poolId),
  getReferencePrice: async (poolId) => {
    const pool = mockPools.find((p) => p.id === poolId);
    return pool ? dexReference(pool) : null;
  },
  refreshReferenceSources: async () => BigInt(dexRefreshReferenceSources()),
  getConsolidatedTttiPrice: async () => {
    dexRefreshAllOpenings();
    return dexConsolidatedPrice();
  },
  getPoolSpreads: async () => {
    dexRefreshAllOpenings();
    return dexPoolSpreads();
  },
  getPoolCapRatio: async () => {
    dexRefreshAllOpenings();
    return dexPoolCapRatio();
  },
  getMyPoolSpreadAlerts: async () => {
    dexRefreshAllOpenings();
    return dexMySpreadAlerts();
  },
  setUtilityPairMinimums: async (poolId, minimums) =>
    mockSetUtilityPairMinimums(poolId, minimums),
  getDexTokens: async () => DEX_TOKEN_ORDER.map(dexTokenInfo),
  getDexDepositAccount: async (owner) => dexDepositAccountOf(owner),
  getDexPoolAccount: async (poolId) => mockPools.find((p) => p.id === poolId)?.poolAccount ?? null,
  getDexBalances: async (owner) => dexBalancesView(owner),
  getDexTransfers: async (owner) =>
    mockDexTransfers.filter((t) => t.owner.toText() === owner.toText()).reverse(),
  getDexTransfersPage: async (owner, cursor, limit) => mockDexTransfersPage(owner, cursor, limit),
  depositToDex: async ({ token, amount }) => {
    assertDexNotPaused();
    return mockDepositToDex(token, amount);
  },
  withdrawFromDex: async ({ token, amount }) => mockWithdrawFromDex(token, amount),
  getUpgradeReadiness: async () => mockUpgradeReadiness(),
  reconcileReserved: async () => mockReconcileReserved(),
  getMyGuaranteeMasses: async () => mockGuaranteeMasses(),
  quoteGuaranteeRedeem: async (token, tttiAmount) => mockQuoteGuarantee(token, tttiAmount),
  redeemGuarantee: async (token, tttiAmount, expectedNetAmount) =>
    state.salesPaused
      ? redeemFail({ __kind__: "salesPaused", salesPaused: null })
      : mockRedeemGuarantee(token, tttiAmount, expectedNetAmount),
  withdrawGuaranteeExcess: async (token) => mockWithdrawExcess(token),
  listMyRedemptions: async () =>
    mockRedemptions.filter((r) => r.owner.toText() === CALLER.toText()).reverse(),
  getUnclaimedMassTotal: async () => mockUnclaimedTotal(),
  getGuaranteeAccounts: async () => mockGuaranteeAccounts(),
  getAuctionView: async () => mockAuctionView(),
  getMyAuctionBids: async () =>
    mockAuctionState.bids.filter((b) => b.bidder.toText() === CALLER.toText()),
  quoteAuctionDeposit: async (token, priceB, quantityE8s) => {
    const invalid = mockAuctionCheck(priceB, quantityE8s, token);
    return invalid
      ? { __kind__: "err", err: invalid }
      : { __kind__: "ok", ok: mockAuctionRequired(priceB, quantityE8s) };
  },
  placeAuctionBid: async (token, quantityE8s, priceB, depositAmount) =>
    mockPlaceAuctionBid(token, quantityE8s, priceB, depositAmount),
  openAuction: async () => mockOpenAuction(),
  getClosedAuctions: async () => {
    mockAuctionSettled();
    return [...mockClosedAuctions].map((r) => r.auction).sort((a, b) => mockCompare(b.id, a.id));
  },
  getAuctionResult: async (auctionId): Promise<AuctionResultView | null> => {
    mockAuctionSettled();
    const record = mockClosedAuctions.find((r) => r.auction.id === auctionId);
    return record ? { auction: record.auction, bids: record.bids } : null;
  },
  getMyWithdrawable: async (): Promise<Array<MyBalance>> => {
    mockAuctionSettled();
    const perToken = mockAuctionBalances.get(CALLER.toText());
    return PAY_TOKEN_ORDER.flatMap((token) => {
      const entry = perToken?.get(token);
      if (!entry) return [];
      // What the auction credited and is still in the DEX balance, ready for the Recover button.
      const available = dexBalanceOf(CALLER, DEX_OF_PAY[token]).available;
      const withdrawable = entry.withdrawable < available ? entry.withdrawable : available;
      return withdrawable > 0n || entry.pending > 0n
        ? [{ token, withdrawable, pendingSettlement: entry.pending }]
        : [];
    });
  },
  settleAuctionWinners: async (auctionId) => {
    mockAuctionSettled();
    const record = mockClosedAuctions.find((r) => r.auction.id === auctionId);
    if (!record) return { __kind__: "err", err: SettleError.unknownAuction };
    if (record.auction.settlement.pendingCount === 0n) {
      return { __kind__: "err", err: SettleError.nothingToSettle };
    }
    return { __kind__: "ok", ok: mockSettleRecord(record) };
  },
  auctionSettleCore: async (args: SettleCoreArgs): Promise<SettleCoreResult> => {
    const taken = mockAuctionRequired(args.priceB, args.quantityE8s);
    const amountB = (args.priceB * args.quantityE8s) / 10n ** 8n;
    return {
      mintedE8s: args.mintE8s,
      takenAmount: taken,
      creatorShare: taken - 2n * amountB,
      positionAmount: amountB,
      guaranteeAmount: amountB,
      positionId: nextPositionId,
      shares: args.quantityE8s,
    };
  },
  listRedemptionFees: async (offset, limit) =>
    mockRedemptionFees.slice(Number(offset), Number(offset + limit)),
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
  convertDeposit: async () => replacedByLiquidityMint(),
  convertDepositWith: async () => replacedByLiquidityMint(),
  quoteLiquidityMint: async (args) => mockQuoteLiquidityMint(args),
  mintLiquidity: async (args) => mockMintLiquidity(args),
  liquidityMintCore: async () => {
    throw new Error("Unauthorized: reserved to the canister itself");
  },
  getMyLiquidityMints: async () => {
    settleMintRefunds();
    return [...mockLiquidityMints].reverse();
  },
  getMyGuarantees: async () => [...mockGuarantees].reverse(),
  listGuarantees: async (offset, limit) => mintPage(mockGuarantees, offset, limit),
  listCreatorSetAsides: async (offset, limit) => mintPage(mockCreatorSetAsides, offset, limit),
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
  listTransfersToReview: async () => {
    dexProcessRemovals();
    return [...mockReviews, ...custodySurplusReviews()];
  },
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
      mintableRemaining: saleMintable(),
      mintEnded: saleMintEnded(),
      remainderE8s: saleRemainder(),
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
    deliveryOrder: "Fresh minting only; collected transfer fees belong to the creator (source transferFee) and are never delivered at mint",
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
    pendingFeeShareE8s: mockPendingFeeShareE8s,
    coverage: mockReserveCoverage(),
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
    dexRefreshAllOpenings();
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
  status: async () => ({ num_blocks_synced: 0n }),
  transform: async () => ({ status: 200n, body: new Uint8Array(), headers: [] }),
};
