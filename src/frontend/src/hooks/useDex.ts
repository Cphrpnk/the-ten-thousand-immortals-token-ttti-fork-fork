import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DexToken, PayToken } from "../backend";
import type {
  AddLiquidityArgs,
  AddLiquidityQuoteArgs,
  ApproveError,
  DcBatch,
  DexAccount,
  DexAmountArgs,
  DexBalanceView,
  DexConfig,
  DexTokenInfo,
  DexTransferView,
  InjectionPage,
  LpBonusView,
  MintFeeLpView,
  PairRequestView,
  PoolView,
  PositionView,
  ProtocolLiquidityView,
  RequestPairArgs,
  SetAsideView,
  TokenMinimums,
  backendInterface,
} from "../backend";
import { nowNs } from "../lib/approvals";
import {
  APPROVAL_TTL_NS,
  buildApproveArgs,
  describeApproveError,
} from "../lib/icpLedger";
import { PAY_TOKENS } from "../lib/token";
import { useAccountSigner } from "./useAccountSigner";
import { useActor } from "./useActor";
import { useIsCallerAdmin } from "./useQueries";

export type {
  AddLiquidityError,
  BonusClaimView,
  ClaimBonusError,
  ClaimMintFeeError,
  InjectionPage,
  InjectionStatus,
  LiquidityInjection,
  MintFeeBalance,
  MintFeeClaimStatus,
  MintFeeClaimView,
  MintFeeLpView,
  SetAsideView,
  DcBatch,
  DcBatchStatus,
  DcLeg,
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
  PairRefundStatus,
  PositionView,
  RemoveLiquidityError,
  SwapError,
  SwapQuote,
  UsdGauge,
} from "../backend";

/** React Query keys of the DEX registry (lot 1) and DEX balances (lot 2). */
export const DEX_KEYS = {
  pools: ["dexPools"],
  pool: (poolId: bigint) => ["dexPool", poolId.toString()],
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
  protocolLiquidity: ["dexProtocolLiquidity"],
  myLpBonus: (owner: string) => ["myLpBonus", owner],
  dcBatches: ["dcBatches"],
  myMintFees: (owner: string) => ["myMintFees", owner],
  setAside: ["setAsideAmounts"],
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
export type SetMinimumsResult = Outcome<"setUtilityPairMinimums">;
export type DepositToDexResult = Outcome<"depositToDex">;
export type WithdrawFromDexResult = Outcome<"withdrawFromDex">;
export type QuoteAddLiquidityOutcome = Outcome<"quoteAddLiquidity">;
export type AddLiquidityOutcome = Outcome<"addLiquidity">;
export type RemoveLiquidityOutcome = Outcome<"removeLiquidity">;
export type ExtendLockOutcome = Outcome<"extendLock">;
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

/** requestPair outcome, or the TTTI-T approval error that stopped it first. */
export type RequestPairOutcome =
  | RequestPairResult
  | { __kind__: "approvalFailed"; approvalFailed: ApproveError };

/** depositToDex outcome, or the approval message that stopped it first. */
export type DexDepositOutcome =
  | DepositToDexResult
  | { __kind__: "approvalFailed"; approvalFailed: string };

/** Deposit input: the token row from getDexTokens and the amount in base units. */
export interface DexDepositInput {
  token: DexTokenInfo;
  amount: bigint;
}

function useInvalidateDex() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.pools });
    void queryClient.invalidateQueries({ queryKey: ["dexPool"] });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.requests });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.myRequests });
  };
}

/** DEX balances, DEX transfers and the wallet's own ledger balances. */
function useInvalidateDexFunds() {
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

/** Public: DD deposits and DW withdrawals of any principal. */
export function useDexTransfers(owner: Principal | null | undefined) {
  const { actor, isFetching } = useActor();
  const ownerText = owner?.toText() ?? "";
  return useQuery<Array<DexTransferView>>({
    queryKey: DEX_KEYS.transfers(ownerText),
    queryFn: async () => {
      if (!actor || !owner) return [];
      return actor.getDexTransfers(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
  });
}

/**
 * Approve the request deposit plus the TTTI-T ledger fee to the contract
 * (expiring after 15 minutes), then call requestPair.
 */
export function useRequestPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateDex();
  return useMutation<RequestPairOutcome, Error, RequestPairArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      const config = await queryClient.fetchQuery({
        queryKey: DEX_KEYS.config,
        queryFn: () => actor.getDexConfig(),
      });
      const fee = await actor.icrc1_fee();
      const approval = await actor.icrc2_approve({
        amount: config.requestDeposit + fee,
        spender: { owner: config.depositAccount.owner },
        expires_at: nowNs() + APPROVAL_TTL_NS,
      });
      if (approval.__kind__ === "Err") {
        return { __kind__: "approvalFailed", approvalFailed: approval.Err };
      }
      return actor.requestPair(args);
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
        if (token.token === DexToken.tttiT) {
          const approval = await actor.icrc2_approve({
            amount: amount + token.fee,
            spender: { owner: spender },
            expires_at: nowNs() + APPROVAL_TTL_NS,
          });
          if (approval.__kind__ === "Err") {
            return {
              __kind__: "approvalFailed",
              approvalFailed: describeApproveError(approval.Err, {
                ...PAY_TOKENS[PayToken.icp],
                symbol: token.symbol,
                name: token.symbol,
                ledgerCanisterId: token.ledgerId.toText(),
                decimals: token.decimals,
                fee: token.fee,
              }),
            };
          }
        } else {
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
          if (!outcome.ok) {
            return {
              __kind__: "approvalFailed",
              approvalFailed: outcome.message,
            };
          }
        }
        return actor.depositToDex({ token: token.token, amount });
      } finally {
        release();
      }
    },
    onSettled: () => {
      invalidate();
    },
  });
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

export function useRemovePair() {
  const { actor } = useActor();
  const invalidate = useInvalidateDex();
  return useMutation<RemovePairResult, Error, bigint>({
    mutationFn: async (poolId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removePair(poolId);
    },
    onSuccess: () => {
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
function useInvalidateLiquidity() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.pools });
    void queryClient.invalidateQueries({ queryKey: ["dexPool"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPosition"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPoolPositions"] });
    void queryClient.invalidateQueries({ queryKey: ["dexPositionsOf"] });
    void queryClient.invalidateQueries({ queryKey: ["dexBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["quoteAddLiquidity"] });
    void queryClient.invalidateQueries({ queryKey: ["quoteSwap"] });
    void queryClient.invalidateQueries({
      queryKey: DEX_KEYS.protocolLiquidity,
    });
    void queryClient.invalidateQueries({ queryKey: ["myLpBonus"] });
    void queryClient.invalidateQueries({ queryKey: ["myMintFees"] });
    void queryClient.invalidateQueries({ queryKey: DEX_KEYS.setAside });
  };
}

/** Add-liquidity quote; pass null while the input is incomplete. */
export function useQuoteAddLiquidity(args: AddLiquidityQuoteArgs | null) {
  const { actor, isFetching } = useActor();
  return useQuery<QuoteAddLiquidityOutcome | null>({
    queryKey: [
      "quoteAddLiquidity",
      args?.poolId.toString() ?? "",
      args?.side ?? "",
      args?.amount.toString() ?? "",
      args?.counterAmount?.toString() ?? "",
    ],
    queryFn: async () => {
      if (!actor || !args) return null;
      return actor.quoteAddLiquidity(args);
    },
    enabled: !!actor && !isFetching && !!args,
  });
}

export function useAddLiquidity() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  return useMutation<AddLiquidityOutcome, Error, AddLiquidityArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLiquidity(args);
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/** Withdraws the whole position into the owner's internal DEX balances. */
export function useRemoveLiquidity() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  return useMutation<RemoveLiquidityOutcome, Error, bigint>({
    mutationFn: async (positionId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeLiquidity(positionId);
    },
    onSettled: () => {
      invalidate();
    },
  });
}

/** Moves the unlock date of a position later; `newUnlockAt` in nanoseconds. */
export function useExtendLock() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  return useMutation<
    ExtendLockOutcome,
    Error,
    { positionId: bigint; newUnlockAt: bigint }
  >({
    mutationFn: async ({ positionId, newUnlockAt }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.extendLock(positionId, newUnlockAt);
    },
    onSettled: () => {
      invalidate();
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

export function useSwap() {
  const { actor } = useActor();
  const invalidate = useInvalidateLiquidity();
  return useMutation<SwapOutcome, Error, SwapInput>({
    mutationFn: async (input) => {
      if (!actor) throw new Error("Actor not available");
      return actor.swap(
        input.poolId,
        input.tokenIn,
        input.amountIn,
        input.minAmountOut,
        input.deadline,
      );
    },
    onSettled: () => {
      invalidate();
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

/** Admin: DC fee conversion batches, newest first. */
export function useDcBatches() {
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  return useQuery<Array<DcBatch>>({
    queryKey: DEX_KEYS.dcBatches,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDcBatches();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });
}

// Mint fee halves: LP claimable shares (MF), set-aside amounts and injections.

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

/** Public: mint fee halves set aside per paid token, awaiting injection. */
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
