import { Actor, type Agent } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { readyPlug } from "../hooks/usePlug";
import { createLedgerAgent } from "./icpLedger";
import { PAY_TOKENS, TTTI_DECIMALS } from "./token";

/**
 * ICPSwap SwapFactory and SwapPool interfaces (ICPSwap-Labs/docs), written on
 * the injected IDL so Plug accepts them, plus the pool lookup and quote reads.
 */

/** ICPSwap SwapFactory canister (mainnet). */
export const ICPSWAP_FACTORY_ID = "4mmnk-kiaaa-aaaag-qbllq-cai";
/** Pool fee tiers looked up, in order: 3000 = 0.3 %, 500 = 0.05 %, 10000 = 1 %. */
export const ICPSWAP_POOL_FEES = [3000n, 500n, 10000n] as const;
/** Token standards tried for each ledger: ICRC2 first, then ICRC1. */
const STANDARDS = ["ICRC2", "ICRC1"] as const;
/** A quote is considered expired after this delay. */
export const QUOTE_TTL_MS = 30_000;

export type SwapPoolError =
  | { CommonError: null }
  | { InsufficientFunds: null }
  | { InternalError: string }
  | { UnsupportedToken: string };

type NatResult = { ok: bigint } | { err: SwapPoolError };

interface SwapToken {
  address: string;
  standard: string;
}

interface SwapArgs {
  amountIn: string;
  zeroForOne: boolean;
  amountOutMinimum: string;
}

interface DepositArgs {
  fee: bigint;
  token: string;
  amount: bigint;
}

export interface SwapPoolActor {
  quote: (args: SwapArgs) => Promise<NatResult>;
  depositFrom: (args: DepositArgs) => Promise<NatResult>;
  swap: (args: SwapArgs) => Promise<NatResult>;
  withdraw: (args: DepositArgs) => Promise<NatResult>;
  getUserUnusedBalance: (
    owner: Principal,
  ) => Promise<
    { ok: { balance0: bigint; balance1: bigint } } | { err: SwapPoolError }
  >;
  metadata: () => Promise<
    | { ok: { fee: bigint; token0: SwapToken; token1: SwapToken } }
    | { err: SwapPoolError }
  >;
}

interface SwapFactoryActor {
  getPool: (args: {
    token0: SwapToken;
    token1: SwapToken;
    fee: bigint;
  }) => Promise<{ ok: { canisterId: Principal } } | { err: SwapPoolError }>;
}

/** The IDL object injected into an interface factory (Plug supplies its own). */
type InjectedIdl = Parameters<IDL.InterfaceFactory>[0]["IDL"];

function errorType(I: InjectedIdl) {
  return I.Variant({
    CommonError: I.Null,
    InsufficientFunds: I.Null,
    InternalError: I.Text,
    UnsupportedToken: I.Text,
  });
}

function tokenType(I: InjectedIdl) {
  return I.Record({ address: I.Text, standard: I.Text });
}

export const swapPoolIdlFactory: IDL.InterfaceFactory = ({ IDL: I }) => {
  const PoolError = errorType(I);
  const Token = tokenType(I);
  const Result = I.Variant({ ok: I.Nat, err: PoolError });
  const SwapArgs = I.Record({
    amountIn: I.Text,
    zeroForOne: I.Bool,
    amountOutMinimum: I.Text,
  });
  const TokenAmount = I.Record({ fee: I.Nat, token: I.Text, amount: I.Nat });
  return I.Service({
    quote: I.Func([SwapArgs], [Result], ["query"]),
    depositFrom: I.Func([TokenAmount], [Result], []),
    swap: I.Func([SwapArgs], [Result], []),
    withdraw: I.Func([TokenAmount], [Result], []),
    getUserUnusedBalance: I.Func(
      [I.Principal],
      [
        I.Variant({
          ok: I.Record({ balance0: I.Nat, balance1: I.Nat }),
          err: PoolError,
        }),
      ],
      ["query"],
    ),
    metadata: I.Func(
      [],
      [
        I.Variant({
          ok: I.Record({ fee: I.Nat, token0: Token, token1: Token }),
          err: PoolError,
        }),
      ],
      ["query"],
    ),
  });
};

const swapFactoryIdlFactory: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Token = tokenType(I);
  return I.Service({
    getPool: I.Func(
      [I.Record({ token0: Token, token1: Token, fee: I.Nat })],
      [
        I.Variant({
          ok: I.Record({ canisterId: I.Principal }),
          err: errorType(I),
        }),
      ],
      ["query"],
    ),
  });
};

/** Readable text of a SwapPool error variant. */
export function swapErrorText(error: SwapPoolError): string {
  if ("InternalError" in error) return error.InternalError;
  if ("UnsupportedToken" in error) return error.UnsupportedToken;
  if ("InsufficientFunds" in error) return "InsufficientFunds";
  return "CommonError";
}

/** Error returned by an ICPSwap canister method. */
export class SwapPoolCallError extends Error {
  constructor(
    readonly step: "deposit" | "swap" | "withdraw" | "quote",
    readonly detail: string,
  ) {
    super(detail);
  }
}

/** True when the pool refused the swap because the minimum was not reached. */
export function isSlippageError(detail: string): boolean {
  return /slippage|amountOutMinimum|minimum/i.test(detail);
}

export function unwrapNat(
  result: NatResult,
  step: SwapPoolCallError["step"],
): bigint {
  if ("ok" in result) return result.ok;
  throw new SwapPoolCallError(step, swapErrorText(result.err));
}

/** Pool of a pair, with its token0 / token1 ledger IDs read from metadata. */
export interface SwapPoolInfo {
  poolId: string;
  token0: string;
  token1: string;
  fee: bigint;
}

async function anonymousActor<T>(
  idl: IDL.InterfaceFactory,
  canisterId: string,
): Promise<T> {
  const agent = await createLedgerAgent();
  return Actor.createActor<T>(idl, { agent, canisterId });
}

const poolCache = new Map<string, Promise<SwapPoolInfo | null>>();

/** First pool found for the pair: fee tiers 3000, 500, 10000; ICRC2 then ICRC1. */
async function findPoolId(
  factory: SwapFactoryActor,
  first: string,
  second: string,
): Promise<string | null> {
  const [icrc2, icrc1] = STANDARDS;
  const combos = [
    [icrc2, icrc2],
    [icrc1, icrc2],
    [icrc2, icrc1],
    [icrc1, icrc1],
  ] as const;
  for (const [standard0, standard1] of combos) {
    const results = await Promise.all(
      ICPSWAP_POOL_FEES.map((fee) =>
        factory.getPool({
          token0: { address: first, standard: standard0 },
          token1: { address: second, standard: standard1 },
          fee,
        }),
      ),
    );
    for (const found of results) {
      if ("ok" in found) return found.ok.canisterId.toText();
    }
  }
  return null;
}

/**
 * Direct ICPSwap pool of two ledgers, whatever its fee tier, or null when
 * the factory has none. Lookups are cached per pair; a failed call is
 * retried next time.
 */
export function resolveSwapPool(
  ledgerA: string,
  ledgerB: string,
): Promise<SwapPoolInfo | null> {
  const [first, second] =
    ledgerA < ledgerB ? [ledgerA, ledgerB] : [ledgerB, ledgerA];
  const key = `${first}:${second}`;
  const cached = poolCache.get(key);
  if (cached) return cached;
  const lookup = (async (): Promise<SwapPoolInfo | null> => {
    const factory = await anonymousActor<SwapFactoryActor>(
      swapFactoryIdlFactory,
      ICPSWAP_FACTORY_ID,
    );
    const poolId = await findPoolId(factory, first, second);
    if (!poolId) return null;
    const pool = await anonymousActor<SwapPoolActor>(
      swapPoolIdlFactory,
      poolId,
    );
    const meta = await pool.metadata();
    if ("err" in meta) throw new Error(swapErrorText(meta.err));
    return {
      poolId,
      token0: meta.ok.token0.address,
      token1: meta.ok.token1.address,
      fee: meta.ok.fee,
    };
  })();
  poolCache.set(key, lookup);
  lookup.catch(() => poolCache.delete(key));
  return lookup;
}

/** Swap direction: true when the input ledger is the pool's token0. */
export function zeroForOne(pool: SwapPoolInfo, fromLedger: string): boolean {
  return pool.token0 === fromLedger;
}

/** Estimated output (before the withdraw fee) for `amountIn` of `fromLedger`. */
export async function readSwapQuote(
  pool: SwapPoolInfo,
  fromLedger: string,
  amountIn: bigint,
): Promise<bigint> {
  const actor = await anonymousActor<SwapPoolActor>(
    swapPoolIdlFactory,
    pool.poolId,
  );
  const result = await actor.quote({
    amountIn: amountIn.toString(),
    zeroForOne: zeroForOne(pool, fromLedger),
    amountOutMinimum: "0",
  });
  return unwrapNat(result, "quote");
}

/** Balance of `owner` left in the pool, keyed by ledger ID. */
export async function readUnusedBalance(
  pool: SwapPoolInfo,
  owner: Principal,
): Promise<Record<string, bigint>> {
  const actor = await anonymousActor<SwapPoolActor>(
    swapPoolIdlFactory,
    pool.poolId,
  );
  const result = await actor.getUserUnusedBalance(owner);
  if ("err" in result) return {};
  return {
    [pool.token0]: result.ok.balance0,
    [pool.token1]: result.ok.balance1,
  };
}

/** Minimum output for a slippage tolerance in basis points (rounded down). */
export function minimumOut(quote: bigint, slippageBps: bigint): bigint {
  return (quote * (10_000n - slippageBps)) / 10_000n;
}

/**
 * SwapPool actor signed by the account's wallet: Plug through its own actor
 * (pool and factory added to the session whitelist), otherwise the agent of
 * Internet Identity, OISY or NFID.
 */
export async function signedSwapPool(
  poolId: string,
  plugSigner: boolean,
  agent: () => Promise<Agent>,
  ledgers: ReadonlyArray<string> = [],
): Promise<SwapPoolActor> {
  if (plugSigner) {
    const plug = await readyPlug([poolId, ICPSWAP_FACTORY_ID, ...ledgers]);
    return plug.createActor<SwapPoolActor>({
      canisterId: poolId,
      interfaceFactory: swapPoolIdlFactory,
    });
  }
  return Actor.createActor<SwapPoolActor>(swapPoolIdlFactory, {
    agent: await agent(),
    canisterId: poolId,
  });
}

/**
 * Add the pool, the factory and the pair's ledgers (added tokens included)
 * to the Plug session before the first signature.
 */
export async function preparePlugForSwap(
  poolId: string,
  ledgers: ReadonlyArray<string> = [],
): Promise<void> {
  await readyPlug([poolId, ICPSWAP_FACTORY_ID, ...ledgers]);
}

/** TTTI-T price read from ICPSwap (usdE8 per whole TTTI-T) and when it was read. */
export interface TttiPriceReading {
  usdE8: bigint;
  readAt: number;
}

/** The cached ICPSwap price is re-read only when older than this (24 hours). */
export const PRICE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const PRICE_CACHE_KEY = "ttti.icpswapTttiPrice.v1";
/** Probe quoted to read the price: 0.0001 TTTI-T, small enough to keep impact negligible. */
const PRICE_PROBE = 10_000n;
const FEE_SCALE = 1_000_000n;

/** Price stored in this browser, or null when absent or unreadable. */
export function loadCachedTttiPrice(): TttiPriceReading | null {
  try {
    const raw = window.localStorage.getItem(PRICE_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { usdE8, readAt } = parsed as { usdE8?: unknown; readAt?: unknown };
    if (typeof usdE8 !== "string" || typeof readAt !== "number") return null;
    const value = BigInt(usdE8);
    return value > 0n ? { usdE8: value, readAt } : null;
  } catch {
    return null;
  }
}

/** Store the price with its read timestamp; a blocked storage is ignored. */
export function storeTttiPrice(reading: TttiPriceReading): void {
  try {
    window.localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        usdE8: reading.usdE8.toString(),
        readAt: reading.readAt,
      }),
    );
  } catch {
    // Storage unavailable: the price is simply read again next time.
  }
}

/** True while a cached price is younger than 24 hours. */
export function isPriceFresh(reading: TttiPriceReading | null): boolean {
  return !!reading && Date.now() - reading.readAt < PRICE_CACHE_TTL_MS;
}

/** USD price of TTTI-T through one ICPSwap pair, quoted in `quoteLedger`; null when unavailable. */
async function priceThroughPair(
  tttiLedger: string,
  quoteLedger: string,
  quoteDecimals: number,
  quoteUsdE8: bigint,
): Promise<bigint | null> {
  try {
    const pool = await resolveSwapPool(tttiLedger, quoteLedger);
    if (!pool) return null;
    const out = await readSwapQuote(pool, tttiLedger, PRICE_PROBE);
    if (out <= 0n) return null;
    // The quote is net of the pool fee: gross it up to the mid price.
    const gross = (out * FEE_SCALE) / (FEE_SCALE - pool.fee);
    const usdE8 =
      (gross * quoteUsdE8 * 10n ** BigInt(TTTI_DECIMALS)) /
      (PRICE_PROBE * 10n ** BigInt(quoteDecimals));
    return usdE8 > 0n ? usdE8 : null;
  } catch {
    return null;
  }
}

/**
 * Live TTTI-T price from the ICPSwap TTTI-T/ICP pair (converted with the ICP
 * rate), else the TTTI-T/ckBTC pair. Never reads or writes the cache.
 */
export async function readIcpswapTttiUsdE8(
  tttiLedger: string,
  icpUsdE8: bigint | null,
  btcUsdE8: bigint | null,
): Promise<bigint | null> {
  const { icp, ckbtc } = PAY_TOKENS;
  if (icpUsdE8 !== null) {
    const viaIcp = await priceThroughPair(
      tttiLedger,
      icp.ledgerCanisterId,
      icp.decimals,
      icpUsdE8,
    );
    if (viaIcp !== null) return viaIcp;
  }
  if (btcUsdE8 === null) return null;
  return priceThroughPair(
    tttiLedger,
    ckbtc.ledgerCanisterId,
    ckbtc.decimals,
    btcUsdE8,
  );
}
