import { Actor, type Agent } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { readyPlug } from "../hooks/usePlug";
import { createLedgerAgent } from "./icpLedger";

/**
 * ICPSwap SwapFactory and SwapPool interfaces (ICPSwap-Labs/docs), written on
 * the injected IDL so Plug accepts them, plus the pool lookup and quote reads.
 */

/** ICPSwap SwapFactory canister (mainnet). */
export const ICPSWAP_FACTORY_ID = "4mmnk-kiaaa-aaaag-qbllq-cai";
/** Pool fee tier looked up: 3000 = 0.3 %. */
export const ICPSWAP_POOL_FEE = 3000n;
/** Token standard of the ICP, ckBTC, ckUSDC and ckUSDT ledgers in ICPSwap. */
const STANDARD = "ICRC2";
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

/**
 * Direct ICPSwap pool of two ledgers (fee 3000, ICRC2), or null when the
 * factory has none. Lookups are cached; a failed call is retried next time.
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
    const found = await factory.getPool({
      token0: { address: first, standard: STANDARD },
      token1: { address: second, standard: STANDARD },
      fee: ICPSWAP_POOL_FEE,
    });
    if ("err" in found) return null;
    const poolId = found.ok.canisterId.toText();
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
): Promise<SwapPoolActor> {
  if (plugSigner) {
    const plug = await readyPlug([poolId, ICPSWAP_FACTORY_ID]);
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

/** Add the pool and factory to the Plug session before the first signature. */
export async function preparePlugForSwap(poolId: string): Promise<void> {
  await readyPlug([poolId, ICPSWAP_FACTORY_ID]);
}
