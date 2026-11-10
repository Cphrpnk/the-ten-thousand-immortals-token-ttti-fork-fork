import type { Principal } from "@icp-sdk/core/principal";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DexToken, PayToken, PoolSide } from "../backend";
import type {
  AddLiquidityArgs,
  AddLiquidityQuoteArgs,
  ConsolidatedPrice,
  DexAccount,
  DexAmountArgs,
  DexBalanceView,
  DexConfig,
  DexTokenInfo,
  DexTransferView,
  EstimatedShareView,
  ExtendLockError,
  ExtendLockResult,
  InjectionPage,
  LpBonusView,
  MintFeeLpView,
  PairRequestView,
  PendingPotView,
  PermanentLogPage,
  PermanentSummary,
  PoolCapRatioView,
  PoolSpreadAlert,
  PoolSpreadReport,
  PoolView,
  PositionView,
  ProtocolLiquidityView,
  ReferencePrice,
  ReferenceReadingEntry,
  RequestPairArgs,
  SetAsideView,
  TokenMinimums,
  backendInterface,
} from "../backend";
import { DEFAULT_SLIPPAGE_BPS } from "../components/dex/liquidityFormat";
import { pickDict } from "../i18n/core/dict";
import { DEX_TEXT } from "../i18n/pages/dex";
import { nowNs } from "../lib/approvals";
import {
  APPROVAL_TTL_NS,
  buildApproveArgs,
  describeApproveError,
} from "../lib/icpLedger";
import { PAY_TOKENS } from "../lib/token";
import { type AccountSigner, useAccountSigner } from "./useAccountSigner";
import { useActor } from "./useActor";
import { type PagedList, usePagedList } from "./usePagedList";
import { useIsCallerAdmin } from "./useQueries";

export { PermanentKind } from "../backend";

export type {
  AddLiquidityError,
  BonusClaimView,
  ClaimBonusError,
  ClaimMintFeeError,
  InjectionPage,
  InjectionStatus,
  PermanentLogEntry,
  PermanentLogPage,
  PermanentPoolSummary,
  PermanentRoute,
  PermanentSummary,
  LiquidityInjection,
  MintFeeBalance,
  MintFeeClaimStatus,
  MintFeeClaimView,
  MintFeeLpView,
  SetAsideView,
  LpBonusView,
  PositionBonusWeight,
  ProtocolLiquidityView,
  AddLiquidityQuote,
  DexAccount,
  DexBalanceView,
  DexDepositError,
  DexTokenInfo,
  DexTransferStatus,
  DexTransferView,
  DexWithdrawError,
  ExtendLockError,
  ExtendLockResult,
  GuaranteedDepth,
  RelayOutcome,
  PairRefundStatus,
  PositionView,
  RemoveLiquidityError,
  SwapError,
  SwapQuote,
  UsdGauge,
  CancelRemovalError,
  DepthBasis,
  PoolDepth,
  Ratio,
  ReferenceCheck,
  ReferencePrice,
  ReferenceSource,
  ReferenceSourceKind,
  ReferenceUnavailable,
  RemovalView,
  RemovePairError,
  SwapState,
  SwapStateReason,
} from "../backend";

/** React Query keys of the DEX registry (lot 1) and DEX balances (lot 2). */
export const DEX_KEYS = {
  pools: ["dexPools"],
  consolidatedPrice: ["dexConsolidatedPrice"],
  poolCapRatio: ["dexPoolCapRatio"],
  poolSpreads: ["dexPoolSpreads"],
  myPoolSpreadAlerts: (owner: string) => ["myPoolSpreadAlerts", owner],
  pool: (poolId: bigint) => ["dexPool", poolId.toString()],
  referencePrice: (poolId: bigint) => ["dexReferencePrice", poolId.toString()],
  referenceReadings: ["dexReferenceReadings"],
  config: ["dexConfig"],
  requests: ["pairRequests"],
  myRequests: ["myPairRequests"],
  tokens: ["dexTokens"],
  depositAccount: (owner: string) => ["dexDepositAccount", owner],
  balances: (owner: string) => ["dexBalances", owner],
  transfers: (owner: string) => ["dexTransfers", owner],
  position: (id: bigint) => ["dexPosition", id.toString()],
  poolPositions: (poolId: bigint) => ["dexPoolPositions", poolId.toString()],
  positionsOf: (owner: string) => ["dexPositionsOf", owner],
  pendingPots: ["dexPendingPots"],
  pendingPot: (poolId: bigint) => ["dexPendingPot", poolId.toString()],
  estimatedShare: (positionId: bigint) => [
    "dexEstimatedShare",
    positionId.toString(),
  ],
  myEstimatedShares: (owner: string) => ["myDexEstimatedShares", owner],
  protocolLiquidity: ["dexProtocolLiquidity"],
  myLpBonus: (owner: string) => ["myLpBonus", owner],
  dcBatches: ["dcBatches"],
  myMintFees: (owner: string) => ["myMintFees", owner],
  setAside: ["setAsideAmounts"],
  permanentLog: (offset: bigint, limit: bigint) => [
    "permanentLiquidityLog",
    offset.toString(),
    limit.toString(),
  ],
  permanentSummary: ["permanentLiquiditySummary"],
  injections: (offset: bigint, limit: bigint) => [
    "liquidityInjections",
    offset.toString(),
    limit.toString(),
  ],
} as const;

type Outcome<K extends keyof backendInterface> = Awaited<
  ReturnType<backendInterface[K]>
>;
export type RequestPairResult = Outcome<"requestPair">;
export type ApprovePairResult = Outcome<"approvePair">;
export type RefusePairResult = Outcome<"refusePair">;
export type RemovePairResult = Outcome<"removePair">;
export type CancelPairRemovalResult = Outcome<"cancelPairRemoval">;
export type SetMinimumsResult = Outcome<"setUtilityPairMinimums">;
export type DepositToDexResult = Outcome<"depositToDex">;
export type WithdrawFromDexResult = Outcome<"withdrawFromDex">;
export type QuoteAddLiquidityOutcome = Outcome<"quoteAddLiquidity">;
export type AddLiquidityOutcome = Outcome<"addLiquidity">;
export type RemoveLiquidityOutcome = Outcome<"removeLiquidity">;
/**
 * extendLock outcome. On success `ok` is the backend ExtendLockResult plus
 * `unlockAt`, copied from `ok.position` so call sites can read the new unlock
 * date directly.
 */
export type ExtendLockOutcome =
  | { __kind__: "ok"; ok: ExtendLockResult & { unlockAt: bigint } }
  | { __kind__: "err"; err: ExtendLockError };
export type QuoteSwapOutcome = Outcome<"quoteSwap">;
export type SwapOutcome = Outcome<"swap">;
export type ClaimLpBonusOutcome = Outcome<"claimLpBonus">;
export type ClaimMintFeeOutcome = Outcome<"claimMintFee">;

/** quoteSwap / swap input, amounts in base units, deadline in nanoseconds. */
export interface QuoteSwapInput {
  poolId: bigint;
  tokenIn: DexToken;
  amountIn: bigint;
  slippageBps: bigint;
}
export interface SwapInput {
  poolId: bigint;
  tokenIn: DexToken;
  amountIn: bigint;
  minAmountOut: bigint;
  deadline: bigint;
}

/** requestPair outcome, or the approval message that stopped it first. */
export type RequestPairOutcome =
  | RequestPairResult
  | { __kind__: "approvalFailed"; approvalFailed: string };

/** requestPair arguments plus the allowance to approve first, in base units. */
export interface RequestPairInput extends RequestPairArgs {
  allowance: bigint;
}

/** depositToDex outcome, or the approval message that stopped it first. */
export type DexDepositOutcome =
  | DepositToDexResult
  | { __kind__: "approvalFailed"; approvalFailed: string };

/** Deposit input: the token row from getDexTokens and the amount in base units. */
export interface DexDepositInput {
  token: DexTokenInfo;
  amount: bigint;
}

/** Pools data refresh period: depth and swap state stay current. */
export const DEX_POOLS_REFRESH_MS = 15_000;

function useInvalidateDex() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.pools });
    void queryClient.invalidateQueries({ queryKey: ["dexPool"] });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.requests });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.myRequests });
    void queryClient.invalidateQueries({ queryKey: ["dexReferencePrice"] });
    invalidateSpreads(queryClient);
  };
}

/** Consolidated price, per-pool spreads and the caller's spread alerts. */
function invalidateSpreads(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: DEX_KEYS.consolidatedPrice });
  void queryClient.invalidateQueries({ queryKey: DEX_KEYS.poolSpreads });
  void queryClient.invalidateQueries({ queryKey: ["myPoolSpreadAlerts"] });
}

/** Pools, positions, balances, transfers and the review list after a pair removal call. */
function useInvalidateRemoval() {
  const invalidate = useInvalidateDex();
  const queryClient = useQueryClient();
  return () => {
    invalidate();
    for (const key of [
      "dexPosition",
      "dexPoolPositions",
      "dexPositionsOf",
      "dexBalances",
      "dexTransfers",
      "transfersToReview",
      "quoteAddLiquidity",
      "quoteSwap",
    ]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
}

/** DEX balances, DEX transfers and the wallet's own ledger balances. */
export function useInvalidateDexFunds() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["dexBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["dexTransfers"] });
    void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc2Allowance"] });
    void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
  };
}

export function useDexPools() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PoolView>>({
    queryKey: DEX_KEYS.pools,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDexPools();
    },
    enabled: !!actor && !isFetching,
    // Depth, swap state and removal status change without any action of the user.
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/**
 * Public: consolidated TTTI-T price in USD (weighted by pool depth) with the
 * hourly and 24 h averages and their sample counts.
 */
export function useConsolidatedTttiPrice() {
  const { actor, isFetching } = useActor();
  return useQuery<ConsolidatedPrice>({
    queryKey: DEX_KEYS.consolidatedPrice,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getConsolidatedTttiPrice();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/**
 * Public: pools value, capitalisation, current and 24 h average ratio, the
 * 50 % target and the locked share m.
 */
export function usePoolCapRatio() {
  const { actor, isFetching } = useActor();
  return useQuery<PoolCapRatioView>({
    queryKey: DEX_KEYS.poolCapRatio,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPoolCapRatio();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/** Public: spread of every TTTI-T pool versus the consolidated price. */
export function usePoolSpreads() {
  const { actor, isFetching } = useActor();
  return useQuery<PoolSpreadReport>({
    queryKey: DEX_KEYS.poolSpreads,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPoolSpreads();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/**
 * The caller's spread alerts: pools where the caller holds a position and the
 * spread exceeds the threshold. Pass the signed-in principal text, or undefined.
 */
export function useMyPoolSpreadAlerts(principalText: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PoolSpreadAlert>>({
    queryKey: DEX_KEYS.myPoolSpreadAlerts(principalText ?? ""),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPoolSpreadAlerts();
    },
    enabled: !!actor && !isFetching && !!principalText,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

export function useDexPool(poolId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<PoolView | null>({
    queryKey: DEX_KEYS.pool(poolId ?? -1n),
    queryFn: async () => {
      if (!actor || poolId === undefined) return null;
      return actor.getDexPool(poolId);
    },
    enabled: !!actor && !isFetching && poolId !== undefined,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

export function useDexConfig() {
  const { actor, isFetching } = useActor();
  return useQuery<DexConfig>({
    queryKey: DEX_KEYS.config,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDexConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePairRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PairRequestView>>({
    queryKey: DEX_KEYS.requests,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPairRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The caller's own requests; pass the signed-in principal text, or undefined. */
export function useMyPairRequests(principalText: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PairRequestView>>({
    queryKey: [...DEX_KEYS.myRequests, principalText ?? ""],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPairRequests();
    },
    enabled: !!actor && !isFetching && !!principalText,
  });
}

/** DEX tokens with ledger, decimals, fee and deposit / withdrawal minimums. */
export function useDexTokens() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<DexTokenInfo>>({
    queryKey: DEX_KEYS.tokens,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDexTokens();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public: the deposit subaccount of any principal (recomputable, no secret). */
export function useDexDepositAccount(owner: Principal | null | undefined) {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText() ?? "";
  return useQuery<DexAccount | null>({
    queryKey: DEX_KEYS.depositAccount(ownerText),
    queryFn: async () => {
      if (!actor || !owner) return null;
      return actor.getDexDepositAccount(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

/** Public: available and reserved DEX balances of any principal, per token. */
export function useDexBalances(owner: Principal | null | undefined) {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText() ?? "";
  return useQuery<Array<DexBalanceView>>({
    queryKey: DEX_KEYS.balances(ownerText),
    queryFn: async () => {
      if (!actor || !owner) return [];
      return actor.getDexBalances(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

const dexTransferKey = (transfer: DexTransferView): string =>
  `${transfer.direction}-${transfer.n.toString()}`;

/** Public: DD deposits and DW withdrawals of any principal, newest first, one page at a time. */
export function useDexTransfers(
  owner: Principal | null | undefined,
): PagedList<DexTransferView> {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText() ?? "";
  return usePagedList<DexTransferView>({
    queryKey: DEX_KEYS.transfers(ownerText),
    enabled: !!actor && !isFetching && !!owner,
    getKey: dexTransferKey,
    fetchPage: async (cursor, limit) => {
      if (!actor || !owner) throw new Error("Actor not available");
      return actor.getDexTransfersPage(owner, cursor, limit);
    },
  });
}

/**
 * Approve `allowance` (plus the paid token's ledger fee) to the contract on
 * the ledger of the paid token (15-minute expiry), signed by the wallet that
 * holds `owner`, then call requestPair. `allowance` covers the deposit and a
 * margin for rate changes; the contract takes only the exact deposit.
 */
export function useRequestPair(owner: Principal | null | undefined) {
  const { actor } = useActor();
  const signer = useAccountSigner(owner);
  const invalidate = useInvalidateDex();
  const queryClient = useQueryClient();
  return useMutation<RequestPairOutcome, Error, RequestPairInput>({
    mutationFn: async ({ allowance, ...args }) => {
      if (!actor) throw new Error("Actor not available");
      const release = signer.begin();
      try {
        const [spender, tokens] = await Promise.all([
          actor.getCanisterPrincipal(),
          actor.getDexTokens(),
        ]);
        const info = tokens.find((tk) => tk.token === args.payToken);
        if (!info) throw new Error("Payment token not available");
        const failure = await approveOnLedger(
          actor,
          signer,
          info,
          spender,
          allowance,
        );
        if (failure !== null) {
          return { __kind__: "approvalFailed", approvalFailed: failure };
        }
        return await actor.requestPair(args);
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ["icrc2Allowance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
    },
  });
}

/**
 * DD deposit: approve `amount` plus the token's ledger fee to the contract on
 * that token's ledger (15-minute expiry), signed by the wallet that holds
 * `owner` (TTTI-T through this canister's own ledger), then depositToDex.
 */
export function useDepositToDex(owner: Principal | null | undefined) {
  const { actor } = useActor();
  const signer = useAccountSigner(owner);
  const invalidate = useInvalidateDexFunds();
  return useMutation<DexDepositOutcome, Error, DexDepositInput>({
    mutationFn: async ({ token, amount }) => {
      if (!actor) throw new Error("Actor not available");
      const release = signer.begin();
      try {
        const spender = await actor.getCanisterPrincipal();
        const failure = await approveOnLedger(
          actor,
          signer,
          token,
          spender,
          amount,
        );
        if (failure !== null) {
          return { __kind__: "approvalFailed", approvalFailed: failure };
        }
        return await actor.depositToDex({ token: token.token, amount });
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/**
 * ICRC-2 approval of `amount` plus the token's ledger fee to `spender`
 * (15-minute expiry). TTTI-T goes through this canister's own ledger; every
 * other token is signed by the wallet that holds the account. Resolves to
 * null on success, or the failure message.
 */
async function approveOnLedger(
  actor: backendInterface,
  signer: AccountSigner,
  token: DexTokenInfo,
  spender: Principal,
  amount: bigint,
): Promise<string | null> {
  if (token.token === DexToken.tttiT) {
    const approval = await actor.icrc2_approve({
      amount: amount + token.fee,
      spender: { owner: spender },
      expires_at: nowNs() + APPROVAL_TTL_NS,
    });
    if (approval.__kind__ === "Err") {
      return describeApproveError(approval.Err, {
        ...PAY_TOKENS[PayToken.icp],
        symbol: token.symbol,
        name: token.symbol,
        ledgerCanisterId: token.ledgerId.toText(),
        decimals: token.decimals,
        fee: token.fee,
      });
    }
    return null;
  }
  const outcome = await signer.approve(
    {
      canisterId: token.ledgerId,
      name: token.symbol,
      symbol: token.symbol,
      decimals: token.decimals,
      fee: token.fee,
    },
    buildApproveArgs(spender, amount, token.fee),
  );
  return outcome.ok ? null : outcome.message;
}

/** Amount of one DEX token an operation needs, in base units. */
export interface DexFundsNeed {
  token: DexToken;
  amount: bigint;
}

/** Thrown when the automatic ICRC-2 approval of a swap or liquidity call fails. */
export class DexApprovalError extends Error {
  readonly detail: string;
  constructor(detail: string) {
    super(pickDict(DEX_TEXT).errDexApprovalFailed(detail));
    this.name = "DexApprovalError";
    this.detail = detail;
  }
}

/**
 * Automatic approval for operations that pull missing funds by transfer_from
 * (swap, routed swap, add liquidity): for each need, the amount minus the
 * available DEX balance is approved to the canister, signed by the wallet that
 * holds `owner`. `begin` must be called synchronously in the click.
 */
export function useDexPullApproval(owner: Principal | null | undefined) {
  const { actor } = useActor();
  const signer = useAccountSigner(owner);
  const ensureApproved = async (
    backend: backendInterface,
    needs: ReadonlyArray<DexFundsNeed>,
    approver?: backendInterface,
  ): Promise<void> => {
    const [spender, tokens, balances] = await Promise.all([
      backend.getCanisterPrincipal(),
      backend.getDexTokens(),
      owner ? backend.getDexBalances(owner) : Promise.resolve([]),
    ]);
    for (const need of needs) {
      const info = tokens.find((tk) => tk.token === need.token);
      if (!info) continue;
      const held =
        balances.find((b) => b.token === need.token)?.available ?? 0n;
      const pull = need.amount > held ? need.amount - held : 0n;
      if (pull === 0n) continue;
      const failure = await approveOnLedger(
        approver ?? backend,
        signer,
        info,
        spender,
        pull,
      );
      if (failure !== null) throw new DexApprovalError(failure);
    }
  };
  return { actor, begin: signer.begin, ensureApproved };
}

/** DW withdrawal of `amount` from the caller's available DEX balance; the ledger fee is deducted. */
export function useWithdrawFromDex() {
  const { actor } = useActor();
  const invalidate = useInvalidateDexFunds();
  return useMutation<WithdrawFromDexResult, Error, DexAmountArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      return actor.withdrawFromDex(args);
    },
    onSettled: () => {
      invalidate();
    },
  });
}

export function useApprovePair() {
  const { actor } = useActor();
  const invalidate = useInvalidateDex();
  return useMutation<
    ApprovePairResult,
    Error,
    { requestId: bigint; minimums: TokenMinimums | null }
  >({
    mutationFn: async ({ requestId, minimums }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approvePair(requestId, minimums);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useRefusePair() {
  const { actor } = useActor();
  const invalidate = useInvalidateDex();
  return useMutation<
    RefusePairResult,
    Error,
    { requestId: bigint; reason: string }
  >({
    mutationFn: async ({ requestId, reason }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.refusePair(requestId, reason);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/** Reference price of a pool's first deposit: sources, weights, tolerance, availability. */
export function useReferencePrice(poolId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ReferencePrice | null>({
    queryKey: DEX_KEYS.referencePrice(poolId ?? -1n),
    queryFn: async () => {
      if (!actor || poolId === undefined) return null;
      return actor.getReferencePrice(poolId);
    },
    enabled: !!actor && !isFetching && poolId !== undefined,
    refetchInterval: DEX_POOLS_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
}

/** Loading, error and data of one pool's reference price, read from the shared query. */
export interface PoolReferenceState {
  data: ReferencePrice | null | undefined;
  isPending: boolean;
  isError: boolean;
}

type PairReading = { ok: true; data: ReferencePrice | null } | { ok: false };

/** Token pair of a pool, in the pool's own order: pools of one pair share a reading. */
function referencePairKey(pool: PoolView): string {
  return `${pool.token0.ledgerId.toText()}/${pool.token1.ledgerId.toText()}`;
}

/**
 * Reference prices of several pools in one shared query: one backend read per
 * distinct token pair (the lowest pool id of the pair), so the number of calls
 * per refresh follows the pairs, not the pools. Polling pauses with the tab.
 */
export function usePoolReferencePrices(pools: PoolView[]) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const representatives = new Map<string, bigint>();
  for (const pool of pools) {
    const key = referencePairKey(pool);
    const current = representatives.get(key);
    if (current === undefined || pool.id < current) {
      representatives.set(key, pool.id);
    }
  }
  const ids = [...representatives.values()].sort((a, b) =>
    a === b ? 0 : a < b ? -1 : 1,
  );
  const query = useQuery<Record<string, PairReading>>({
    queryKey: ["dexReferencePrice", "pools", ...ids.map((id) => id.toString())],
    queryFn: async () => {
      if (!actor) return {};
      const entries = [...representatives.entries()];
      const settled = await Promise.allSettled(
        entries.map(([, id]) => actor.getReferencePrice(id)),
      );
      if (settled.length > 0 && settled.every((s) => s.status === "rejected")) {
        throw settled[0].status === "rejected"
          ? settled[0].reason
          : new Error("Reference price unavailable");
      }
      const readings: Record<string, PairReading> = {};
      entries.forEach(([key], i) => {
        const result = settled[i];
        readings[key] =
          result.status === "fulfilled"
            ? { ok: true, data: result.value ?? null }
            : { ok: false };
      });
      // Single-pool readers of the same pools start from the same values.
      for (const pool of pools) {
        const reading = readings[referencePairKey(pool)];
        if (reading?.ok) {
          queryClient.setQueryData(
            DEX_KEYS.referencePrice(pool.id),
            reading.data,
          );
        }
      }
      return readings;
    },
    enabled: !!actor && !isFetching && ids.length > 0,
    refetchInterval: DEX_POOLS_REFRESH_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previous) => previous,
  });

  const forPool = (pool: PoolView): PoolReferenceState => {
    const reading = query.data?.[referencePairKey(pool)];
    if (reading?.ok) {
      return { data: reading.data, isPending: false, isError: false };
    }
    if (reading || query.isError) {
      return { data: undefined, isPending: false, isError: true };
    }
    return { data: undefined, isPending: true, isError: false };
  };
  return { forPool };
}

/** Admin: last reading of each ICPSwap TTTI-T pair (price, or failed step, or not read yet). */
export function useReferenceReadings() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<ReferenceReadingEntry>>({
    queryKey: DEX_KEYS.referenceReadings,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReferenceReadings();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Reads the ICPSwap TTTI-T pairs again; resolves to the number of readable pairs. */
export function useRefreshReferenceSources() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.refreshReferenceSources();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["dexReferencePrice"] });
      void queryClient.invalidateQueries({
        queryKey: DEX_KEYS.referenceReadings,
      });
      void queryClient.invalidateQueries({ queryKey: ["quoteAddLiquidity"] });
    },
  });
}

/** Admin: announces the removal of a pair with a public reason (effective after the notice period). */
export function useRemovePair() {
  const { actor } = useActor();
  const invalidate = useInvalidateRemoval();
  return useMutation<
    RemovePairResult,
    Error,
    { poolId: bigint; reason: string }
  >({
    mutationFn: async ({ poolId, reason }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removePair(poolId, reason);
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/** Admin: cancels an announced removal before its effective date. */
export function useCancelPairRemoval() {
  const { actor } = useActor();
  const invalidate = useInvalidateRemoval();
  return useMutation<CancelPairRemovalResult, Error, bigint>({
    mutationFn: async (poolId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelPairRemoval(poolId);
    },
    onSettled: () => {
      invalidate();
    },
  });
}

export function useSetUtilityPairMinimums() {
  const { actor } = useActor();
  const invalidate = useInvalidateDex();
  return useMutation<
    SetMinimumsResult,
    Error,
    { poolId: bigint; minimums: TokenMinimums }
  >({
    mutationFn: async ({ poolId, minimums }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUtilityPairMinimums(poolId, minimums);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

// DEX lot 3: liquidity positions and swaps.

/** Pools, positions and DEX balances after a liquidity or swap call. */
export function useInvalidateLiquidity() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.pools });
    void queryClient.invalidateQueries({ queryKey: ["dexPool"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPosition"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPoolPositions"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPositionsOf"] });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.pendingPots });
    void queryClient.invalidateQueries({ queryKey: ["dexPendingPot"] });
    void queryClient.invalidateQueries({ queryKey: ["dexEstimatedShare"] });
    void queryClient.invalidateQueries({
      queryKey: ["myDexEstimatedShares"],
    });
    void queryClient.invalidateQueries({ queryKey: ["dexBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["dexTransfers"] });
    void queryClient.invalidateQueries({ queryKey: ["dexReferencePrice"] });
    void queryClient.invalidateQueries({ queryKey: ["quoteAddLiquidity"] });
    void queryClient.invalidateQueries({ queryKey: ["quoteSwap"] });
    invalidateSpreads(queryClient);
    void queryClient.invalidateQueries({
      queryKey: DEX_KEYS.protocolLiquidity,
    });
    void queryClient.invalidateQueries({ queryKey: ["myLpBonus"] });
    void queryClient.invalidateQueries({ queryKey: ["myMintFees"] });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.setAside });
  };
}

/**
 * Add-liquidity quote; pass null while the input is incomplete. `side`/`amount` is the
 * fixed side; the quote returns the counter side computed at the pool ratio. `slippageBps`
 * absent = the default tolerance.
 */
export function useQuoteAddLiquidity(args: AddLiquidityQuoteArgs | null) {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteAddLiquidityOutcome | null>({
    queryKey: [
      "quoteAddLiquidity",
      args?.poolId.toString() ?? "",
      args?.side ?? "",
      args?.amount.toString() ?? "",
      args?.counterAmount?.toString() ?? "",
      args?.slippageBps?.toString() ?? "",
    ],
    queryFn: async () => {
      if (!actor || !args) return null;
      return actor.quoteAddLiquidity(args);
    },
    enabled: !!actor && !isFetching && !!args,
    // The counter amount follows the pool ratio, which moves with every swap.
    refetchInterval: 15_000,
  });
}

/**
 * Adds liquidity. `slippageBps` absent = default tolerance; `lockDurationNs` absent or 0n = no lock
 * (5 years maximum). On a refusal nothing is debited: the funds stay in the internal balance.
 * Missing funds (amount needed minus the DEX balance) are approved automatically before the call,
 * signed by the wallet that holds `owner`. The counter side is approved with the slippage tolerance
 * on top, since it can move by up to that tolerance between the quote and the execution.
 */
export function useAddLiquidity(owner?: Principal | null) {
  const { actor, begin, ensureApproved } = useDexPullApproval(owner);
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  return useMutation<AddLiquidityOutcome, Error, AddLiquidityArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      const release = begin();
      try {
        const needs = await addLiquidityNeeds(actor, args);
        await ensureApproved(actor, needs);
        return await actor.addLiquidity(args);
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
      invalidateFunds();
    },
  });
}

/** Funds an addLiquidity call may pull: the fixed side, and the counter side with tolerance. */
async function addLiquidityNeeds(
  actor: backendInterface,
  args: AddLiquidityArgs,
): Promise<Array<DexFundsNeed>> {
  const [pool, tokens] = await Promise.all([
    actor.getDexPool(args.poolId),
    actor.getDexTokens(),
  ]);
  if (!pool) return [];
  const fixedSide = args.side === PoolSide.token0 ? pool.token0 : pool.token1;
  const counterSide = args.side === PoolSide.token0 ? pool.token1 : pool.token0;
  let counter = args.counterAmount;
  if (counter === undefined) {
    const quote = await actor.quoteAddLiquidity(args);
    counter = quote.__kind__ === "ok" ? quote.ok.counterAmount : 0n;
  }
  const bps = args.slippageBps ?? DEFAULT_SLIPPAGE_BPS;
  const withTolerance = (counter * (10_000n + bps) + 9_999n) / 10_000n;
  const byLedger = (ledgerText: string) =>
    tokens.find((tk) => tk.ledgerId.toText() === ledgerText);
  const needs: Array<DexFundsNeed> = [];
  const fixedInfo = byLedger(fixedSide.ledgerId.toText());
  const counterInfo = byLedger(counterSide.ledgerId.toText());
  if (fixedInfo) needs.push({ token: fixedInfo.token, amount: args.amount });
  if (counterInfo) {
    needs.push({ token: counterInfo.token, amount: withTolerance });
  }
  return needs;
}

/** Withdraws the whole position into the owner's internal DEX balances. */
export function useRemoveLiquidity() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  return useMutation<RemoveLiquidityOutcome, Error, bigint>({
    mutationFn: async (positionId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeLiquidity(positionId);
    },
    onSettled: () => {
      invalidate();
      invalidateFunds();
    },
  });
}

/**
 * Moves the unlock date of a position later; `newUnlockAt` in nanoseconds.
 * The extension relays part of its weight to the other committed positions of
 * the pool, so pools, positions and balances are all refreshed.
 */
export function useExtendLock() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  return useMutation<
    ExtendLockOutcome,
    Error,
    { positionId: bigint; newUnlockAt: bigint }
  >({
    mutationFn: async ({ positionId, newUnlockAt }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.extendLock(positionId, newUnlockAt);
      if (result.__kind__ === "err") return result;
      return {
        __kind__: "ok",
        ok: { ...result.ok, unlockAt: result.ok.position.unlockAt },
      };
    },
    onSettled: () => {
      invalidate();
      invalidateFunds();
    },
  });
}

export function useDexPosition(positionId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<PositionView | null>({
    queryKey: DEX_KEYS.position(positionId ?? -1n),
    queryFn: async () => {
      if (!actor || positionId === undefined) return null;
      return actor.getDexPosition(positionId);
    },
    enabled: !!actor && !isFetching && positionId !== undefined,
  });
}

/** Public: every position of a pool. */
export function usePoolPositions(poolId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PositionView>>({
    queryKey: DEX_KEYS.poolPositions(poolId ?? -1n),
    queryFn: async () => {
      if (!actor || poolId === undefined) return [];
      return actor.listPoolPositions(poolId);
    },
    enabled: !!actor && !isFetching && poolId !== undefined,
  });
}

/** Public: every position of any principal. */
export function useDexPositionsOf(owner: Principal | null | undefined) {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText() ?? "";
  return useQuery<Array<PositionView>>({
    queryKey: DEX_KEYS.positionsOf(ownerText),
    queryFn: async () => {
      if (!actor || !owner) return [];
      return actor.listDexPositionsOf(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

/** Public: pending pot (locked half of the LP fees) of every pool. */
export function useDexPendingPots() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<PendingPotView>>({
    queryKey: DEX_KEYS.pendingPots,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDexPendingPots();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/** Public: pending pot of one pool (null when the pool has none). */
export function useDexPendingPot(poolId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PendingPotView | null>({
    queryKey: DEX_KEYS.pendingPot(poolId),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDexPendingPot(poolId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/** Public: estimated share of the current day of one position (null when none). */
export function useDexEstimatedShare(positionId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<EstimatedShareView | null>({
    queryKey: DEX_KEYS.estimatedShare(positionId ?? -1n),
    queryFn: async () => {
      if (!actor || positionId === undefined) return null;
      return actor.getDexEstimatedShare(positionId);
    },
    enabled: !!actor && !isFetching && positionId !== undefined,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/** Caller: estimated share of the current day of each of the caller's positions. */
export function useMyDexEstimatedShares(ownerText: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<EstimatedShareView>>({
    queryKey: DEX_KEYS.myEstimatedShares(ownerText ?? ""),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDexEstimatedShares();
    },
    enabled: !!actor && !isFetching && !!ownerText,
    refetchInterval: DEX_POOLS_REFRESH_MS,
  });
}

/** Swap quote; pass null while the input is incomplete. */
export function useQuoteSwap(input: QuoteSwapInput | null) {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteSwapOutcome | null>({
    queryKey: [
      "quoteSwap",
      input?.poolId.toString() ?? "",
      input?.tokenIn ?? "",
      input?.amountIn.toString() ?? "",
      input?.slippageBps.toString() ?? "",
    ],
    queryFn: async () => {
      if (!actor || !input) return null;
      return actor.quoteSwap(
        input.poolId,
        input.tokenIn,
        input.amountIn,
        input.slippageBps,
      );
    },
    enabled: !!actor && !isFetching && !!input,
    refetchInterval: 15_000,
  });
}

/**
 * Native-pool swap. The amount in minus the DEX balance is approved to the
 * canister automatically, signed by the wallet that holds `owner`.
 */
export function useSwap(owner?: Principal | null) {
  const { actor, begin, ensureApproved } = useDexPullApproval(owner);
  const invalidate = useInvalidateLiquidity();
  const invalidateFunds = useInvalidateDexFunds();
  return useMutation<SwapOutcome, Error, SwapInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not available");
      const release = begin();
      try {
        await ensureApproved(actor, [
          { token: input.tokenIn, amount: input.amountIn },
        ]);
        return await actor.swap(
          input.poolId,
          input.tokenIn,
          input.amountIn,
          input.minAmountOut,
          input.deadline,
        );
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
      invalidateFunds();
    },
  });
}

// DEX lot 4: protocol liquidity, ICP bonus (DL) and fee conversion batches (DC).

/** Public: protocol-owned liquidity per pool, locked forever. */
export function useProtocolLiquidity() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<ProtocolLiquidityView>>({
    queryKey: DEX_KEYS.protocolLiquidity,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProtocolLiquidity();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * The caller's ICP bonus: claimable, claimed, weights of locked TTTI-T-pair
 * positions and claims. Pass the signed-in principal text, or undefined.
 */
export function useMyLpBonus(principalText: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<LpBonusView | null>({
    queryKey: DEX_KEYS.myLpBonus(principalText ?? ""),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyLpBonus();
    },
    enabled: !!actor && !isFetching && !!principalText,
  });
}

/** Claims the whole claimable ICP bonus (DL, memo TTTI-DL-<n>). */
export function useClaimLpBonus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ClaimLpBonusOutcome, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimLpBonus();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["myLpBonus"] });
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
      void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
    },
  });
}

// Mint fee payouts: LP claimable shares (MF), set-aside amounts and injections.

/** The caller's mint fee shares per paid token and their claims (MF). */
export function useMyMintFees(principalText: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<MintFeeLpView | null>({
    queryKey: DEX_KEYS.myMintFees(principalText ?? ""),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyMintFees();
    },
    enabled: !!actor && !isFetching && !!principalText,
  });
}

/** Claims the caller's whole claimable mint fee share of one paid token. */
export function useClaimMintFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ClaimMintFeeOutcome, Error, PayToken>({
    mutationFn: async (token) => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimMintFee(token);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["myMintFees"] });
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["payTokenBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["transfersToReview"] });
    },
  });
}

/** Public: amounts set aside per paid token, awaiting injection. */
export function useSetAsideAmounts() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<SetAsideView>>({
    queryKey: DEX_KEYS.setAside,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSetAsideAmounts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

/** Public: one page of permanent liquidity injections, newest first. */
export function useLiquidityInjections(offset: bigint, limit: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<InjectionPage>({
    queryKey: DEX_KEYS.injections(offset, limit),
    queryFn: async () => {
      if (!actor) return { items: [], total: 0n, offset };
      return actor.listLiquidityInjections(offset, limit);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

/**
 * Public: one page of the permanent liquidity journal, newest first
 * (kinds accrued, rebalanced, injected, waiting, failed). `total` is the entry count.
 */
export function usePermanentLiquidityLog(offset: bigint, limit: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PermanentLogPage>({
    queryKey: DEX_KEYS.permanentLog(offset, limit),
    queryFn: async () => {
      if (!actor) return { entries: [], total: 0n };
      return actor.listPermanentLiquidityLog(offset, limit);
    },
    enabled: !!actor && !isFetching,
    placeholderData: (previous) => previous,
    refetchInterval: 60_000,
  });
}

/** Public: permanent liquidity per pool, amounts set aside and the injection threshold. */
export function usePermanentLiquiditySummary() {
  const { actor, isFetching } = useActor();
  return useQuery<PermanentSummary | null>({
    queryKey: DEX_KEYS.permanentSummary,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPermanentLiquiditySummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}
