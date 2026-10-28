import type { Principal } from "@icp-sdk/core/principal";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  AcknowledgementError,
  BtcDepositErrorCode,
  DepositErrorKind,
  DepositKind,
  OwnerRevenueError,
  PayToken,
  PriceSource,
} from "../backend";
import type {
  Account,
  Allowance,
  AllowanceArgs,
  ApproveArgs,
  ApproveResult,
  AutonomyView,
  Backend,
  BalanceSnapshot,
  BtcDepositInfo,
  BtcDepositResult,
  Conversion,
  CyclesShareView,
  CyclesStatus,
  DataCertificate,
  DeliveryAddressResult,
  DepositEntry,
  DepositTracking,
  FeeBounds,
  FeeCollectorInfo,
  GetBlocksArgs,
  GetBlocksResult,
  IcpPrice,
  LegacyBlockInfo,
  MintTreasuryAccount,
  MyBtcDeposits,
  OwnerAccumulated,
  OwnerDestinationResult,
  OwnerDestinationView,
  OwnerSendPage,
  PayTokenStatus,
  PriceResult,
  PublicTreasuryInfo,
  PurchaseAcknowledgement,
  PurchaseResult,
  SaleStatus,
  ShareChange,
  SupportedBlockType,
  SupportedStandard,
  TechnicalDetails,
  TokenPrice,
  TransferArgs,
  TransferFromArgs,
  TransferFromResult,
  TransferResult,
  TreasuryConfig,
  TreasurySweepView,
  WeeklyAllocation,
} from "../backend";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import { type Lang, getLang, toIntlLocale } from "../i18n/core/lang";
import {
  PAY_TOKEN_ORDER,
  defaultNumberLang,
  formatDecimal,
  payTokenSymbol,
} from "../lib/token";
import { useActor } from "./useActor";
import { useConnectedWallet } from "./useConnectedWallet";
import { useInternetIdentity } from "./useInternetIdentity";

export {
  useListTokens,
  usePayTokenBalance,
  useTokenMetadata,
  useWalletBalance,
} from "./useWallet";

/** Refresh everything a purchase or admin switch can change. */
function invalidateSale(queryClient: QueryClient) {
  for (const key of [
    "saleStatus",
    "technicalDetails",
    "adminSwitches",
    "conversions",
    "myConversions",
    "failedForwards",
    "icrc1BalanceOf",
    "walletBalance",
    "tokenInfo",
    "feeCollector",
    "icpPrice",
    "tokenPrices",
    "cyclesStatus",
    "icrc3GetBlocks",
    "purchaseAcknowledgement",
    "ownerSends",
    "ownerAccumulated",
    "ownerDestinations",
    "setAsideAmounts",
    "liquidityInjections",
    "myMintFees",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: bigint;
  totalSupply: bigint;
  fee: bigint;
  standards: Array<SupportedStandard>;
}

export function useTokenInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<TokenInfo>({
    queryKey: ["tokenInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");

      const [name, symbol, decimals, maxSupply, totalSupply, fee, standards] =
        await Promise.all([
          actor.icrc1_name(),
          actor.icrc1_symbol(),
          actor.icrc1_decimals(),
          actor.get_max_supply(),
          actor.icrc1_total_supply(),
          actor.icrc1_fee(),
          actor.icrc1_supported_standards(),
        ]);

      return {
        name,
        symbol,
        decimals,
        maxSupply,
        totalSupply,
        fee,
        standards,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIcrc1Fee() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["icrc1Fee"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.icrc1_fee();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFee() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["getFee"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.get_fee();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMaxSupply() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["getMaxSupply"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.get_max_supply();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIcrc1BalanceOf(account: Account | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["icrc1BalanceOf", account?.owner.toText(), account?.subaccount],
    queryFn: async () => {
      if (!actor || !account) throw new Error("Actor not initialized");
      return actor.icrc1_balance_of(account);
    },
    enabled: !!actor && !isFetching && !!account,
  });
}

export function useIcrc1Transfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<TransferResult, Error, TransferArgs>({
    mutationFn: async (args: TransferArgs) => {
      if (!actor) throw new Error("Actor not available");
      return actor.icrc1_transfer(args);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
      void queryClient.invalidateQueries({ queryKey: ["tokenInfo"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
      void queryClient.invalidateQueries({
        queryKey: ["icrc3GetTipCertificate"],
      });
    },
  });
}

/**
 * ICRC-2 approve on the TTTI-T ledger itself (Transfer page only).
 * Purchases must approve on the ICP ledger: use hooks/useIcpApprove.
 */
export function useTttiIcrc2Approve() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ApproveResult, Error, ApproveArgs>({
    mutationFn: async (args: ApproveArgs) => {
      if (!actor) throw new Error("Actor not available");
      return actor.icrc2_approve(args);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["icrc2Allowance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
      void queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
    },
  });
}

export function useIcrc2Allowance(args: AllowanceArgs | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Allowance>({
    queryKey: [
      "icrc2Allowance",
      args?.account.owner.toText(),
      args?.spender.owner.toText(),
    ],
    queryFn: async () => {
      if (!actor || !args) throw new Error("Actor not initialized");
      return actor.icrc2_allowance(args);
    },
    enabled: !!actor && !isFetching && !!args,
  });
}

export function useIcrc2TransferFrom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<TransferFromResult, Error, TransferFromArgs>({
    mutationFn: async (args: TransferFromArgs) => {
      if (!actor) throw new Error("Actor not available");
      return actor.icrc2_transfer_from(args);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["icrc1BalanceOf"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc2Allowance"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc3GetBlocks"] });
      void queryClient.invalidateQueries({
        queryKey: ["icrc3GetTipCertificate"],
      });
    },
  });
}

export function useIcrc3GetBlocks(args: Array<GetBlocksArgs>) {
  const { actor, isFetching } = useActor();

  return useQuery<GetBlocksResult>({
    queryKey: [
      "icrc3GetBlocks",
      args.map((a) => [a.start.toString(), a.length.toString()]),
    ],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.icrc3_get_blocks(args);
    },
    enabled: !!actor && !isFetching && args.length > 0,
  });
}

export function useIcrc3GetTipCertificate() {
  const { actor, isFetching } = useActor();

  return useQuery<DataCertificate | null>({
    queryKey: ["icrc3GetTipCertificate"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.icrc3_get_tip_certificate();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIcrc3SupportedBlockTypes() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<SupportedBlockType>>({
    queryKey: ["icrc3SupportedBlockTypes"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.icrc3_supported_block_types();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Inclusive transfer-fee bounds (base units) accepted by set_fee. */
export function useFeeBounds() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeBounds>({
    queryKey: ["feeBounds"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.get_fee_bounds();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Sets the transfer fee; rejects with the backend err text on failure. */
export function useSetFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, bigint>({
    mutationFn: async (newFee: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.set_fee(newFee);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tokenInfo"] });
      void queryClient.invalidateQueries({ queryKey: ["getFee"] });
      void queryClient.invalidateQueries({ queryKey: ["icrc1Fee"] });
      void queryClient.invalidateQueries({ queryKey: ["technicalDetails"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// --- Treasury (ICP -> TTTI) -------------------------------------------------

/** True only once the backend confirmed the caller is an admin. */
function useAdminGate(): boolean {
  const { data: isAdmin } = useIsCallerAdmin();
  return isAdmin === true;
}

/** Public treasury mode and ICP account (no buyer data). */
export function usePublicTreasuryInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicTreasuryInfo | null>({
    queryKey: ["publicTreasuryInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPublicTreasuryInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Full treasury config (admin-only endpoint; never called for non-admins). */
export function useTreasuryConfig() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<TreasuryConfig | null>({
    queryKey: ["treasuryConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTreasuryConfig();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** All conversions (admin-only endpoint; never called for non-admins). */
export function useConversions() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<Conversion>>({
    queryKey: ["conversions"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getConversions();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** The caller's own purchases (depositor or recipient), newest first. */
export function useMyConversions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toText();

  return useQuery<Array<Conversion>>({
    queryKey: ["myConversions", principalText],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyConversions();
    },
    enabled: !!actor && !isFetching && !!principalText,
  });
}

export function useConvertDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    PurchaseResult,
    Error,
    { recipient: Account | null; icpAmount: bigint }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Actor not available");
      return actor.convertDeposit(params.recipient, params.icpAmount);
    },
    onSuccess: () => {
      invalidateSale(queryClient);
    },
  });
}

export interface ConvertDepositWithParams {
  token: PayToken;
  /** Delivery account; null credits the saved address or the caller. */
  recipient: Account | null;
  /** Amount in the pay token's base units. */
  payAmount: bigint;
  /** Exact TTTI-T base units to deliver (TTTI-T mode); null in amount-paid mode. */
  tttiTarget: bigint | null;
}

/** Purchase TTTI-T with ICP, ckBTC, ckUSDC or ckUSDT (Internet Identity). */
export function useConvertDepositWith() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<PurchaseResult, Error, ConvertDepositWithParams>({
    mutationFn: async ({ token, recipient, payAmount, tttiTarget }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.convertDepositWith(token, recipient, payAmount, tttiTarget);
    },
    onSuccess: () => {
      invalidateSale(queryClient);
    },
  });
}

// --- Per-token prices & treasury accounts ------------------------------------

/** Hourly USD rate of every pay token (public query). */
export function useGetTokenPrices() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<TokenPrice>>({
    queryKey: ["tokenPrices"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTokenPrices();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

/** Admin: refresh one pay token's rate; rejects with the backend Err text. */
export function useRefreshTokenPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<TokenPrice, Error, PayToken>({
    mutationFn: async (token: PayToken) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.refreshTokenPrice(token);
      if (result.__kind__ === "Err") throw new Error(result.Err);
      return result.Ok;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tokenPrices"] });
      void queryClient.invalidateQueries({ queryKey: ["icpPrice"] });
      void queryClient.invalidateQueries({ queryKey: ["saleStatus"] });
      void queryClient.invalidateQueries({ queryKey: ["technicalDetails"] });
    },
  });
}

/**
 * Treasury account receiving `token`, from the public treasury info.
 * ICP falls back to icpAccount when no per-token entry is listed.
 */
export function payTokenTreasuryAccount(
  info: PublicTreasuryInfo | null | undefined,
  token: PayToken,
): Account | null {
  if (!info) return null;
  const entry = info.tokenAccounts.find((item) => item.token === token);
  if (entry?.account) return entry.account;
  return token === PayToken.icp ? info.icpAccount : null;
}

/** Per-token treasury accounts in pay-token display order. */
export function usePayTokenTreasuryAccounts() {
  const query = usePublicTreasuryInfo();
  const accounts = PAY_TOKEN_ORDER.map((token) => ({
    token,
    account: payTokenTreasuryAccount(query.data, token),
  }));
  return { ...query, accounts };
}

/** Display labels of the rate sources (English). */
export const PRICE_SOURCE_LABELS: Record<PriceSource, string> = {
  [PriceSource.coinbase]: "Coinbase",
  [PriceSource.coingecko]: "CoinGecko",
  [PriceSource.none]: "No live source",
};

/** Rate source label in `lang` (default: the active language). */
export function priceSourceLabel(
  source: PriceSource,
  lang: Lang = getLang(),
): string {
  return source === PriceSource.none
    ? MESSAGES_TEXT[lang].priceSourceNone
    : PRICE_SOURCE_LABELS[source];
}

/** USD rate (usdE8) as plain text with 2 to 3 decimals, or an em dash. */
export function formatRateUsd(
  usdE8: bigint,
  lang: Lang = defaultNumberLang(),
): string {
  if (usdE8 <= 0n) return "—";
  return formatDecimal(Number(usdE8) / 100_000_000, 2, 3, lang);
}

/**
 * "Rate for this hour: 1 <token> = X USD (source) · valid until HH:MM",
 * or an empty string when no usable rate is set.
 */
export function formatTokenRateLine(
  token: PayToken,
  rate:
    | { usdE8: bigint; source: PriceSource; validUntil: bigint }
    | null
    | undefined,
): string {
  if (!rate || rate.usdE8 <= 0n || rate.source === PriceSource.none) return "";
  return String(
    pickDict(MESSAGES_TEXT).rateLine(
      payTokenSymbol(token),
      formatRateUsd(rate.usdE8),
      priceSourceLabel(rate.source),
      formatValidUntil(rate.validUntil),
    ),
  );
}

/** Rate line for a PayTokenStatus from getSaleStatus / getTechnicalDetails. */
export function payTokenRateLine(status: PayTokenStatus | undefined): string {
  if (!status) return "";
  return formatTokenRateLine(status.token, {
    usdE8: status.priceUsdE8,
    source: status.priceSource,
    validUntil: status.priceValidUntil,
  });
}

/** PayTokenStatus of `token` in a sale status, when listed. */
export function findPayTokenStatus(
  status: SaleStatus | TechnicalDetails | undefined,
  token: PayToken,
): PayTokenStatus | undefined {
  return status?.payTokens.find((item) => item.token === token);
}

export function useGetCanisterPrincipal() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal>({
    queryKey: ["canisterPrincipal"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCanisterPrincipal();
    },
    enabled: !!actor && !isFetching,
  });
}

// --- Purchase acknowledgements (asked once, at the first purchase) ----------

/** Whether the caller already accepted the six purchase acknowledgements. */
export function useGetMyPurchaseAcknowledgement(enabled = true) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toText() ?? "anon";

  return useQuery<PurchaseAcknowledgement>({
    queryKey: ["purchaseAcknowledgement", principalText],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyPurchaseAcknowledgement();
    },
    enabled: enabled && !!actor && !isFetching,
  });
}

/** Records acceptance; rejects when the caller is anonymous. */
export function useAcceptPurchaseAcknowledgements() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<PurchaseAcknowledgement, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.acceptPurchaseAcknowledgements();
      if (result.__kind__ === "err") {
        throw new Error(
          result.err === AcknowledgementError.anonymousCaller
            ? pickDict(MESSAGES_TEXT).ackSignInFirst
            : pickDict(MESSAGES_TEXT).ackNotRecorded,
        );
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["purchaseAcknowledgement"],
      });
    },
  });
}

// --- Bitcoin deposits (BTC -> ckBTC, optionally -> TTTI-T) ------------------

/** Short factual sentence for each BTC deposit error code, in `lang`. */
export function btcDepositErrorMessages(
  lang: Lang = getLang(),
): Record<BtcDepositErrorCode, string> {
  const t = MESSAGES_TEXT[lang];
  return {
    [BtcDepositErrorCode.anonymousCaller]: t.btcAnonymousCaller,
    [BtcDepositErrorCode.acknowledgementRequired]: t.btcAcknowledgementRequired,
    [BtcDepositErrorCode.purchaseInProgress]: t.btcPurchaseInProgress,
    [BtcDepositErrorCode.noAddressYet]: t.btcNoAddressYet,
    [BtcDepositErrorCode.minterUnavailable]: t.btcMinterUnavailable,
  };
}

/** English BTC deposit error sentences. */
export const BTC_DEPOSIT_ERROR_MESSAGES: Record<BtcDepositErrorCode, string> =
  btcDepositErrorMessages("en");

/** BTC deposit error sentence in `lang` (default: the active language). */
export function btcDepositErrorMessage(
  code: BtcDepositErrorCode,
  lang: Lang = getLang(),
): string {
  return btcDepositErrorMessages(lang)[code];
}

/** Error thrown by the BTC deposit mutations, carrying the backend code. */
export class BtcDepositFailure extends Error {
  readonly code: BtcDepositErrorCode;
  constructor(code: BtcDepositErrorCode) {
    super(btcDepositErrorMessage(code));
    this.name = "BtcDepositFailure";
    this.code = code;
  }
}

function unwrapBtcDeposit(result: BtcDepositResult): DepositTracking {
  if (result.__kind__ === "Err") throw new BtcDepositFailure(result.Err.code);
  return result.Ok;
}

/** A whole tracking (read through its newest deposit) or one deposit entry. */
export type DepositSource = DepositTracking | DepositEntry;

function entryOf(source: DepositSource): DepositEntry | null {
  return "deposits" in source ? latestDeposit(source) : source;
}

/** Newest deposit on the tracking's address, or null before any deposit. */
export function latestDeposit(tracking: DepositTracking): DepositEntry | null {
  return tracking.deposits[0] ?? null;
}

/** Deposits before the newest one on the same address, newest first. */
export function earlierDeposits(tracking: DepositTracking): DepositEntry[] {
  return tracking.deposits.slice(1);
}

/** Bitcoin txids of a deposit (or a tracking's newest deposit), display order. */
export function depositTxids(source: DepositSource): string[] {
  const entry = entryOf(source);
  return entry && Array.isArray(entry.btcTxids) ? entry.btcTxids : [];
}

/** ckBTC ledger mint block of a deposit (or newest deposit), or null. */
export function depositCkbtcMintBlock(source: DepositSource): bigint | null {
  return entryOf(source)?.ckbtcMintBlockIndex ?? null;
}

/** True when one deposit entry of a `kind` flow is final. */
export function isDepositEntryTerminal(
  entry: DepositEntry,
  kind: DepositKind,
): boolean {
  switch (entry.stage.__kind__) {
    case "delivered":
    case "refunded":
      return true;
    case "minted":
      return kind === DepositKind.wallet;
    case "error":
      return (
        entry.errorKind === DepositErrorKind.tainted ||
        entry.errorKind === DepositErrorKind.valueTooSmall ||
        entry.errorKind === DepositErrorKind.unrecoverable
      );
    default:
      return false;
  }
}

/** Deposits of the tracking that are not final yet, newest first. */
export function pendingDeposits(tracking: DepositTracking): DepositEntry[] {
  return tracking.deposits.filter(
    (entry) => !isDepositEntryTerminal(entry, tracking.kind),
  );
}

/**
 * True when every deposit on the tracking's address is final. A tracking with
 * no deposit yet, or whose last check failed transiently, is not terminal.
 */
export function isDepositTerminal(tracking: DepositTracking): boolean {
  if (!latestDeposit(tracking)) return false;
  if (
    tracking.stage.__kind__ === "error" &&
    tracking.errorKind === DepositErrorKind.minterUnavailable
  ) {
    return false;
  }
  return pendingDeposits(tracking).length === 0;
}

/** What a deposit widget shows: the deposit in progress, a summary or waiting. */
export interface DepositView {
  /** Deposit shown in the main progress; null while waiting for a transfer. */
  focus: DepositEntry | null;
  /** Newest deposit, final, while its completion summary is shown. */
  finished: DepositEntry | null;
  /** All deposits are final and the widget waits for a new transfer. */
  waiting: boolean;
  /** Ends the completion summary now (display only). */
  returnToWaiting: () => void;
}

/** How long the completion summary stays before the widget waits again. */
const DEPOSIT_SUMMARY_MS = 20_000;

/**
 * Display state of a deposit widget. The oldest deposit in progress is shown
 * first; once every deposit is final, the newest one is summarised briefly,
 * then the widget returns to waiting for a new transfer on the same address.
 */
export function useDepositView(
  tracking: DepositTracking | undefined,
): DepositView {
  const pending = tracking ? pendingDeposits(tracking) : [];
  const inProgress = pending[pending.length - 1] ?? null;
  const newest = tracking ? latestDeposit(tracking) : null;
  const final = inProgress === null ? newest : null;
  const finalKey =
    tracking && final ? `${tracking.btcAddress}:${final.index}` : null;
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    if (finalKey === null || dismissed === finalKey) return;
    const timer = window.setTimeout(
      () => setDismissed(finalKey),
      DEPOSIT_SUMMARY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [finalKey, dismissed]);

  const waiting = finalKey !== null && dismissed === finalKey;
  return {
    focus: inProgress ?? (waiting ? null : final),
    finished: waiting ? null : final,
    waiting: waiting || (tracking !== undefined && newest === null),
    returnToWaiting: () => {
      if (finalKey !== null) setDismissed(finalKey);
    },
  };
}

/**
 * Refreshes balances and purchase history when a deposit's credited ckBTC
 * grows, a new deposit appears (also on first load) or a purchase settles.
 */
export function useRefreshOnDepositProgress(
  tracking: DepositTracking | undefined,
) {
  const queryClient = useQueryClient();
  let signature: string | null = null;
  if (tracking && tracking.deposits.length > 0) {
    let minted = 0n;
    let settled = 0;
    for (const entry of tracking.deposits) {
      minted += entry.ckbtcMintedSats;
      if (
        entry.stage.__kind__ === "delivered" ||
        entry.stage.__kind__ === "refunded"
      ) {
        settled += 1;
      }
    }
    signature = `${tracking.btcAddress}|${tracking.deposits.length}|${minted}|${settled}`;
  }
  const lastRef = useRef<string | null>(null);
  useEffect(() => {
    if (signature === null || signature === lastRef.current) return;
    lastRef.current = signature;
    for (const key of [
      "walletBalance",
      "icrc1BalanceOf",
      "myConversions",
      "conversions",
      "saleStatus",
    ]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }, [signature, queryClient]);
}

/** True when a deposit was received and its newest entry is not final yet. */
export function isDepositInProgress(
  tracking: DepositTracking | undefined,
): boolean {
  return (
    tracking !== undefined &&
    latestDeposit(tracking) !== null &&
    !isDepositTerminal(tracking)
  );
}

/** Minter parameters: confirmations, minimum deposit, check fee, poll period. */
export function useBtcDepositInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<BtcDepositInfo>({
    queryKey: ["btcDepositInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBtcDepositInfo();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60_000,
  });
}

/**
 * The caller's persisted purchase and wallet trackings, loaded as soon as a
 * principal exists and polled while a stored tracking exists (null until a
 * check detects a deposit): every 10 to 30 s while a deposit is open, every
 * 60 s otherwise.
 */
export function useMyBtcDeposits(enabled = true) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const activeMs = useBtcActivePollMs();
  const principalText = identity?.getPrincipal().toText();

  return useQuery<MyBtcDeposits>({
    queryKey: ["myBtcDeposits", principalText],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMyBtcDeposits();
    },
    enabled: enabled && !!actor && !isFetching && !!principalText,
    refetchInterval: (query) => depositsPollMs(query.state.data, activeMs),
  });
}

/** Poll period while a deposit is open: the minter's suggestion, 10 to 30 s. */
function useBtcActivePollMs(): number {
  const { data: info } = useBtcDepositInfo();
  const suggestedMs = Number(info?.suggestedPollSeconds ?? 30n) * 1000;
  return Math.min(Math.max(suggestedMs, 10_000), 30_000);
}

/** activeMs while any tracking is open, 60 s otherwise, off without address. */
function depositsPollMs(
  data: MyBtcDeposits | undefined,
  activeMs: number,
): number | false {
  if (!data || (!data.purchase && !data.wallet)) return false;
  const active = [data.purchase, data.wallet].some(
    (tracking) => tracking !== undefined && !isDepositTerminal(tracking),
  );
  return active ? activeMs : 60_000;
}

/**
 * Wallet-path tracking of `owner` (an external wallet principal), read through
 * the plain actor: no signature, no wallet window. Polled like useMyBtcDeposits.
 */
export function useBtcWalletDepositsFor(owner: Principal | undefined) {
  const { actor, isFetching } = useActor();
  const activeMs = useBtcActivePollMs();
  const ownerText = owner?.toText();

  return useQuery<DepositTracking | null>({
    queryKey: ["btcWalletDepositsFor", ownerText],
    queryFn: async () => {
      if (!actor || !owner) throw new Error("Actor not available");
      return actor.getBtcWalletDepositsFor(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
    refetchInterval: (query) =>
      depositsPollMs(
        query.state.data ? { wallet: query.state.data } : undefined,
        activeMs,
      ),
  });
}

/**
 * Purchase-path tracking of the connected external wallet through its signed
 * backend. Plug signs silently, so it is loaded and polled; OISY/NFID open a
 * window per call, so their tracking only comes from signed call results.
 */
export function useWalletBtcDeposits(enabled: boolean) {
  const { kind, principal, getBackend } = useConnectedWallet();
  const activeMs = useBtcActivePollMs();
  const plug = kind === "plug";

  return useQuery<MyBtcDeposits>({
    queryKey: ["walletBtcDeposits", kind, principal?.toText()],
    queryFn: async () => {
      const backend = await getBackend();
      return backend.getMyBtcDeposits();
    },
    enabled: enabled && !!principal && plug,
    retry: plug ? 1 : false,
    refetchInterval: (query) =>
      plug ? depositsPollMs(query.state.data, activeMs) : false,
  });
}

function invalidateBtcDeposits(queryClient: QueryClient) {
  for (const key of [
    "myBtcDeposits",
    "saleStatus",
    "conversions",
    "myConversions",
    "walletBalance",
    "icrc1BalanceOf",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

function useBtcDepositMutation(
  call: (
    actor: NonNullable<ReturnType<typeof useActor>["actor"]>,
  ) => Promise<BtcDepositResult>,
  invalidate: (queryClient: QueryClient) => void,
) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<DepositTracking, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return unwrapBtcDeposit(await call(actor));
    },
    onSettled: () => {
      invalidate(queryClient);
    },
  });
}

function invalidateMyBtcDeposits(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["myBtcDeposits"] });
}

const BTC_SHOWN_KEY = "ttti.btcAddressShown";

/**
 * Device-local hint that a BTC address was shown to `principalText` on `path`,
 * so the panel fetches and shows it again on return (no tracking is stored
 * before a deposit is detected).
 */
export function rememberBtcAddressShown(
  path: "purchase" | "wallet",
  principalText: string | undefined,
): void {
  if (!principalText) return;
  try {
    window.localStorage.setItem(
      `${BTC_SHOWN_KEY}.${path}.${principalText}`,
      "1",
    );
  } catch {
    // Storage unavailable: the address is requested again by hand.
  }
}

export function btcAddressShownBefore(
  path: "purchase" | "wallet",
  principalText: string | undefined,
): boolean {
  if (!principalText) return false;
  try {
    return (
      window.localStorage.getItem(
        `${BTC_SHOWN_KEY}.${path}.${principalText}`,
      ) === "1"
    );
  } catch {
    return false;
  }
}

/** Bitcoin address for a BTC -> ckBTC -> TTTI-T purchase. */
export function useGetBtcPurchaseAddress() {
  return useBtcDepositMutation(
    (actor) => actor.getBtcPurchaseAddress(),
    invalidateMyBtcDeposits,
  );
}

/** Asks the minter for new deposits on the purchase address. */
export function useCheckBtcPurchaseDeposit() {
  return useBtcDepositMutation(
    (actor) => actor.checkBtcPurchaseDeposit(),
    invalidateBtcDeposits,
  );
}

/** Bitcoin address for a BTC -> ckBTC conversion into the caller's wallet. */
export function useGetBtcWalletAddress() {
  return useBtcDepositMutation(
    (actor) => actor.getBtcWalletAddress(),
    invalidateMyBtcDeposits,
  );
}

/** Asks the minter for new deposits on the wallet address. */
export function useCheckBtcWalletDeposit() {
  return useBtcDepositMutation(
    (actor) => actor.checkBtcWalletDeposit(),
    invalidateBtcDeposits,
  );
}

/** get/check on the wallet path of `owner` through the plain actor (unsigned). */
function useBtcWalletForMutation(
  owner: Principal | undefined,
  call: (
    actor: NonNullable<ReturnType<typeof useActor>["actor"]>,
    owner: Principal,
  ) => Promise<BtcDepositResult>,
  invalidate: (queryClient: QueryClient) => void,
) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const ownerText = owner?.toText();

  return useMutation<DepositTracking, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (!owner) {
        throw new BtcDepositFailure(BtcDepositErrorCode.anonymousCaller);
      }
      return unwrapBtcDeposit(await call(actor, owner));
    },
    onSuccess: (tracking) => {
      // Only a tracking with deposits is stored; an unsaved one stays local.
      if (tracking.deposits.length === 0) return;
      queryClient.setQueryData<DepositTracking | null>(
        ["btcWalletDepositsFor", ownerText],
        tracking,
      );
    },
    onSettled: () => {
      invalidate(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ["btcWalletDepositsFor", ownerText],
      });
    },
  });
}

/** Personal BTC address of an external wallet `owner` (no signature). */
export function useGetBtcWalletAddressFor(owner: Principal | undefined) {
  return useBtcWalletForMutation(
    owner,
    (actor, target) => actor.getBtcWalletAddressFor(target),
    () => undefined,
  );
}

/** Asks the minter for new deposits on `owner`'s wallet address (no signature). */
export function useCheckBtcWalletDepositFor(owner: Principal | undefined) {
  return useBtcWalletForMutation(
    owner,
    (actor, target) => actor.checkBtcWalletDepositFor(target),
    invalidateBtcDeposits,
  );
}

/** get/check on the purchase path, signed by the connected external wallet. */
function useWalletBtcPurchaseMutation(
  call: (backend: Backend) => Promise<BtcDepositResult>,
  refreshBalances: boolean,
) {
  const { kind, principal, getBackend } = useConnectedWallet();
  const queryClient = useQueryClient();
  const principalText = principal?.toText();

  return useMutation<DepositTracking, Error, void>({
    mutationFn: async () => {
      const backend = await getBackend();
      return unwrapBtcDeposit(await call(backend));
    },
    onSuccess: (tracking) => {
      // Only a tracking with deposits is stored; an unsaved one stays local.
      if (tracking.deposits.length === 0) return;
      queryClient.setQueryData<MyBtcDeposits>(
        ["walletBtcDeposits", kind, principalText],
        (prev) => ({ ...prev, purchase: tracking }),
      );
    },
    onSettled: () => {
      if (kind === "plug") {
        void queryClient.invalidateQueries({
          queryKey: ["walletBtcDeposits", kind, principalText],
        });
      }
      if (refreshBalances) invalidateBtcDeposits(queryClient);
    },
  });
}

/** Purchase BTC address of the connected external wallet (signed call). */
export function useWalletGetBtcPurchaseAddress() {
  return useWalletBtcPurchaseMutation(
    (backend) => backend.getBtcPurchaseAddress(),
    false,
  );
}

/** Checks the external wallet's purchase address (signed call). */
export function useWalletCheckBtcPurchaseDeposit() {
  return useWalletBtcPurchaseMutation(
    (backend) => backend.checkBtcPurchaseDeposit(),
    true,
  );
}

// --- ICP/USD oracle ---------------------------------------------------------

export function useGetIcpPrice() {
  const { actor, isFetching } = useActor();

  return useQuery<IcpPrice>({
    queryKey: ["icpPrice"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getIcpPrice();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRefreshIcpPrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<PriceResult, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.refreshIcpPrice();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["icpPrice"] });
      void queryClient.invalidateQueries({ queryKey: ["tokenPrices"] });
      void queryClient.invalidateQueries({ queryKey: ["saleStatus"] });
    },
  });
}

/**
 * Local HH:MM for a backend nanosecond timestamp (e.g. the hourly rate's
 * validUntil). Returns an em dash when the timestamp is absent or invalid.
 */
export function formatValidUntil(
  timestampNs: bigint | undefined,
  lang: Lang = getLang(),
): string {
  if (timestampNs === undefined || timestampNs <= 0n) return "—";
  const date = new Date(Number(timestampNs / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString(toIntlLocale(lang), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Sale status, technical details & admin switches -----------------------

/**
 * True when the backend reports a valid hourly ICP/USD rate. When false, a
 * purchase is refused (no ICP taken) until the next hourly rate is set.
 */
export function isSalePriceUsable(status: SaleStatus): boolean {
  return status.priceUsable;
}

export function useGetSaleStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SaleStatus>({
    queryKey: ["saleStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSaleStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

/** Public technical details of the ledger, oracle and purchase rules. */
export function useTechnicalDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<TechnicalDetails>({
    queryKey: ["technicalDetails"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTechnicalDetails();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

// --- Cycles reserve ---------------------------------------------------------

/** Public cycles balance, reserve, floor and top-up history. */
export function useCyclesStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<CyclesStatus>({
    queryKey: ["cyclesStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCyclesStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

// --- Cycles autonomy, share, mint treasuries, weekly allocation (admin) ----

/** Admin: autonomy in days from the 7- and 30-day average consumption. */
export function useCyclesAutonomy() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<AutonomyView>({
    queryKey: ["cyclesAutonomy"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCyclesAutonomy();
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 60_000,
  });
}

/** Admin: current cycles share, its target and the fixed code bounds. */
export function useCyclesShare() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<CyclesShareView>({
    queryKey: ["cyclesShare"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCyclesShare();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: cycles share changes, newest first. */
export function useCyclesShareHistory() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<ShareChange>>({
    queryKey: ["cyclesShareHistory"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCyclesShareHistory();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: internal mint treasury accounts (no withdrawal path) and legacy accounts. */
export function useMintTreasuryAccounts() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<MintTreasuryAccount>>({
    queryKey: ["mintTreasuryAccounts"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMintTreasuryAccounts();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: the last weekly allocation calculation, or null before the first. */
export function useLastWeeklyAllocation() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<WeeklyAllocation | null>({
    queryKey: ["lastWeeklyAllocation"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLastWeeklyAllocation();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: every weekly allocation calculation, newest first. */
export function useWeeklyAllocations() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<WeeklyAllocation>>({
    queryKey: ["weeklyAllocations"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listWeeklyAllocations();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

// --- Owner revenue: destinations, sends, accumulated, treasury sweep (admin) --

/** React Query keys of the owner revenue (admin) views. */
export const OWNER_KEYS = {
  destinations: ["ownerDestinations"],
  sends: (offset: bigint, limit: bigint) => [
    "ownerSends",
    offset.toString(),
    limit.toString(),
  ],
  accumulated: ["ownerAccumulated"],
  sweep: ["treasurySweepStatus"],
} as const;

function invalidateOwnerRevenue(queryClient: QueryClient) {
  for (const key of [
    "ownerDestinations",
    "ownerSends",
    "ownerAccumulated",
    "treasurySweepStatus",
    "transfersToReview",
  ]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

/** Admin: owner destination account per paid token, with accumulated amounts. */
export function useOwnerDestinations() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<OwnerDestinationView>>({
    queryKey: OWNER_KEYS.destinations,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listOwnerDestinations();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: one page of owner sends (OW), newest first. */
export function useOwnerSends(offset: bigint, limit: bigint) {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<OwnerSendPage>({
    queryKey: OWNER_KEYS.sends(offset, limit),
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listOwnerSends(offset, limit);
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 30_000,
  });
}

/** Admin: owner amounts kept because the token has no destination yet. */
export function useOwnerAccumulated() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<Array<OwnerAccumulated>>({
    queryKey: OWNER_KEYS.accumulated,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getOwnerAccumulated();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });
}

/** Admin: status of the one-time treasury sweep and reserve top-up. */
export function useTreasurySweepStatus() {
  const { actor, isFetching } = useActor();
  const isAdmin = useAdminGate();

  return useQuery<TreasurySweepView>({
    queryKey: OWNER_KEYS.sweep,
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTreasurySweepStatus();
    },
    enabled: !!actor && !isFetching && isAdmin,
    refetchInterval: 30_000,
  });
}

export interface SetOwnerDestinationInput {
  token: PayToken;
  account: Account;
}

/** Admin: set the owner destination account of one paid token. */
export function useSetOwnerDestination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<OwnerDestinationResult, Error, SetOwnerDestinationInput>({
    mutationFn: async ({ token, account }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setOwnerDestination(token, account);
    },
    onSuccess: () => {
      invalidateOwnerRevenue(queryClient);
    },
  });
}

/** Admin: clear the owner destination of one paid token (amounts accumulate). */
export function useClearOwnerDestination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<OwnerDestinationResult, Error, PayToken>({
    mutationFn: async (token) => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearOwnerDestination(token);
    },
    onSuccess: () => {
      invalidateOwnerRevenue(queryClient);
    },
  });
}

/** English admin message of an owner destination error. */
export function ownerRevenueErrorMessage(error: OwnerRevenueError): string {
  switch (error) {
    case OwnerRevenueError.notAdmin:
      return "Only an administrator can change owner destinations.";
    case OwnerRevenueError.anonymousOwner:
      return "The anonymous principal cannot be a destination.";
    case OwnerRevenueError.invalidSubaccount:
      return "The subaccount must be exactly 32 bytes.";
    case OwnerRevenueError.contractAccount:
      return "A contract account cannot be a destination.";
    case OwnerRevenueError.notConfigured:
      return "No destination is set for this token.";
  }
}

function useSwitchMutation(
  call: (
    actor: NonNullable<ReturnType<typeof useActor>["actor"]>,
    value: boolean,
  ) => Promise<void>,
) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, boolean>({
    mutationFn: async (value: boolean) => {
      if (!actor) throw new Error("Actor not available");
      await call(actor, value);
    },
    onSuccess: () => {
      invalidateSale(queryClient);
    },
  });
}

export function useSetSalesPaused() {
  return useSwitchMutation((actor, paused) => actor.setSalesPaused(paused));
}

// --- Delivery address (optional, for the later migration) -------------------

export function useGetDeliveryAddress() {
  const { actor, isFetching } = useActor();

  return useQuery<Account | null>({
    queryKey: ["deliveryAddress"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDeliveryAddress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDeliveryAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<DeliveryAddressResult, Error, string>({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setDeliveryAddress(principalText.trim());
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}

export function useClearDeliveryAddress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearDeliveryAddress();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["deliveryAddress"] });
    },
  });
}

// --- Admin: snapshot, fee collector, minting account, legacy blocks ---------

/** On-demand export (admin) of all holder balances for the migration. */
export function useExportBalanceSnapshot() {
  const { actor } = useActor();

  return useMutation<BalanceSnapshot, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.exportBalanceSnapshot();
    },
  });
}

export function useGetFeeCollector() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeCollectorInfo>({
    queryKey: ["feeCollector"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getFeeCollector();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBurnAccount() {
  const { actor, isFetching } = useActor();

  return useQuery<Account>({
    queryKey: ["burnAccount"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBurnAccount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLegacyBlockInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<LegacyBlockInfo>({
    queryKey: ["legacyBlockInfo"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLegacyBlockInfo();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
