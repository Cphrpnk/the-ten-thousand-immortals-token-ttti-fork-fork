import { loadConfig } from "@caffeineai/core-infrastructure";
import { Actor, HttpAgent, type Identity } from "@icp-sdk/core/agent";
import type { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { PayToken } from "../backend";
import type { ApproveError } from "../backend";
import { MESSAGES_TEXT } from "../i18n/common/messages";
import { pickDict } from "../i18n/core/dict";
import {
  ICP_FEE_E8S,
  ICP_LEDGER_ID,
  PAY_TOKENS,
  type PayTokenDescriptor,
  formatUnits,
} from "./token";

/** Mainnet ICP ledger. Purchases are approved on the pay token's ledger. */
export const ICP_LEDGER_CANISTER_ID = ICP_LEDGER_ID;

/** Allowance to grant: the purchase plus the transfer_from fee. */
export function approveAmount(
  purchaseE8s: bigint,
  ledgerFee: bigint = ICP_FEE_E8S,
): bigint {
  return purchaseE8s + ledgerFee;
}

/**
 * Balance needed for a purchase: the purchase, the transfer_from fee
 * covered by the allowance, and the fee charged by the approve itself.
 */
export function requiredBalance(amount: bigint, ledgerFee: bigint): bigint {
  return amount + 2n * ledgerFee;
}

/** ICP balance needed for an ICP purchase (purchase + 2 × 0.0001 ICP). */
export function requiredIcpBalance(purchaseE8s: bigint): bigint {
  return requiredBalance(purchaseE8s, ICP_FEE_E8S);
}

/** Balance needed for a purchase in the given pay token. */
export function requiredTokenBalance(token: PayToken, amount: bigint): bigint {
  return requiredBalance(amount, PAY_TOKENS[token].fee);
}

type Opt<T> = [] | [T];

export interface RawAccount {
  owner: Principal;
  subaccount: Opt<Uint8Array>;
}

export interface RawApproveArgs {
  fee: Opt<bigint>;
  memo: Opt<Uint8Array>;
  from_subaccount: Opt<Uint8Array>;
  created_at_time: Opt<bigint>;
  amount: bigint;
  expected_allowance: Opt<bigint>;
  expires_at: Opt<bigint>;
  spender: RawAccount;
}

export type RawApproveError =
  | { GenericError: { message: string; error_code: bigint } }
  | { TemporarilyUnavailable: null }
  | { Duplicate: { duplicate_of: bigint } }
  | { BadFee: { expected_fee: bigint } }
  | { AllowanceChanged: { current_allowance: bigint } }
  | { CreatedInFuture: { ledger_time: bigint } }
  | { TooOld: null }
  | { Expired: { ledger_time: bigint } }
  | { InsufficientFunds: { balance: bigint } };

export type RawApproveResult = { Ok: bigint } | { Err: RawApproveError };

export type RawMetadataValue =
  | { Nat: bigint }
  | { Int: bigint }
  | { Text: string }
  | { Blob: Uint8Array };

/** Raw-candid actor surface for the ICRC calls the app makes on ledgers. */
export interface IcpLedgerActor {
  icrc2_approve: (args: RawApproveArgs) => Promise<RawApproveResult>;
  icrc2_allowance: (args: {
    account: RawAccount;
    spender: RawAccount;
  }) => Promise<{ allowance: bigint; expires_at: Opt<bigint> }>;
  icrc1_balance_of: (account: RawAccount) => Promise<bigint>;
  icrc1_metadata: () => Promise<Array<[string, RawMetadataValue]>>;
  icrc1_fee: () => Promise<bigint>;
}

/** Minimal ICRC-1/ICRC-2 interface; uses the injected IDL so Plug can use it. */
export const icpLedgerIdlFactory: IDL.InterfaceFactory = ({ IDL: I }) => {
  const Account = I.Record({
    owner: I.Principal,
    subaccount: I.Opt(I.Vec(I.Nat8)),
  });
  const ApproveArgs = I.Record({
    fee: I.Opt(I.Nat),
    memo: I.Opt(I.Vec(I.Nat8)),
    from_subaccount: I.Opt(I.Vec(I.Nat8)),
    created_at_time: I.Opt(I.Nat64),
    amount: I.Nat,
    expected_allowance: I.Opt(I.Nat),
    expires_at: I.Opt(I.Nat64),
    spender: Account,
  });
  const ApproveError = I.Variant({
    GenericError: I.Record({ message: I.Text, error_code: I.Nat }),
    TemporarilyUnavailable: I.Null,
    Duplicate: I.Record({ duplicate_of: I.Nat }),
    BadFee: I.Record({ expected_fee: I.Nat }),
    AllowanceChanged: I.Record({ current_allowance: I.Nat }),
    CreatedInFuture: I.Record({ ledger_time: I.Nat64 }),
    TooOld: I.Null,
    Expired: I.Record({ ledger_time: I.Nat64 }),
    InsufficientFunds: I.Record({ balance: I.Nat }),
  });
  return I.Service({
    icrc2_approve: I.Func(
      [ApproveArgs],
      [I.Variant({ Ok: I.Nat, Err: ApproveError })],
      [],
    ),
    icrc2_allowance: I.Func(
      [I.Record({ account: Account, spender: Account })],
      [I.Record({ allowance: I.Nat, expires_at: I.Opt(I.Nat64) })],
      ["query"],
    ),
    icrc1_balance_of: I.Func([Account], [I.Nat], ["query"]),
    icrc1_metadata: I.Func(
      [],
      [
        I.Vec(
          I.Tuple(
            I.Text,
            I.Variant({
              Nat: I.Nat,
              Int: I.Int,
              Text: I.Text,
              Blob: I.Vec(I.Nat8),
            }),
          ),
        ),
      ],
      ["query"],
    ),
    icrc1_fee: I.Func([], [I.Nat], ["query"]),
  });
};

/** Lifetime of a purchase approval: 15 minutes in nanoseconds. */
export const APPROVAL_TTL_NS = 15n * 60n * 1_000_000_000n;

const ICP_DESCRIPTOR: PayTokenDescriptor = PAY_TOKENS[PayToken.icp];

/**
 * Build ICRC-2 approve args granting `spender` the purchase plus the
 * ledger fee, expiring 15 minutes from now. Defaults to the ICP fee.
 */
export function buildApproveArgs(
  spender: Principal,
  amount: bigint,
  ledgerFee: bigint = ICP_FEE_E8S,
): RawApproveArgs {
  return {
    fee: [ledgerFee],
    memo: [],
    from_subaccount: [],
    created_at_time: [],
    amount: approveAmount(amount, ledgerFee),
    expected_allowance: [],
    expires_at: [BigInt(Date.now()) * 1_000_000n + APPROVAL_TTL_NS],
    spender: { owner: spender, subaccount: [] },
  };
}

export type ApproveOutcome =
  | { ok: true; blockIndex: bigint }
  | { ok: false; message: string };

/** Convert a raw candid ApproveError into the typed backend shape. */
function toTypedError(error: RawApproveError): ApproveError {
  if ("GenericError" in error) {
    return { __kind__: "GenericError", GenericError: error.GenericError };
  }
  if ("TemporarilyUnavailable" in error) {
    return { __kind__: "TemporarilyUnavailable", TemporarilyUnavailable: null };
  }
  if ("Duplicate" in error) {
    return { __kind__: "Duplicate", Duplicate: error.Duplicate };
  }
  if ("BadFee" in error) return { __kind__: "BadFee", BadFee: error.BadFee };
  if ("AllowanceChanged" in error) {
    return {
      __kind__: "AllowanceChanged",
      AllowanceChanged: error.AllowanceChanged,
    };
  }
  if ("CreatedInFuture" in error) {
    return {
      __kind__: "CreatedInFuture",
      CreatedInFuture: error.CreatedInFuture,
    };
  }
  if ("TooOld" in error) return { __kind__: "TooOld", TooOld: null };
  if ("Expired" in error)
    return { __kind__: "Expired", Expired: error.Expired };
  return {
    __kind__: "InsufficientFunds",
    InsufficientFunds: error.InsufficientFunds,
  };
}

/** Message in the active language for every ICRC-2 ApproveError variant, token-named. */
export function describeApproveError(
  error: ApproveError,
  token: PayTokenDescriptor = ICP_DESCRIPTOR,
): string {
  const { symbol, decimals, fee } = token;
  const t = pickDict(MESSAGES_TEXT);
  const amount = (value: bigint) => `${formatUnits(value, decimals)} ${symbol}`;
  switch (error.__kind__) {
    case "InsufficientFunds":
      return t.approveErrInsufficientFunds(
        symbol,
        amount(error.InsufficientFunds.balance),
        amount(fee),
      );
    case "BadFee":
      return t.approveErrBadFee(symbol, amount(error.BadFee.expected_fee));
    case "AllowanceChanged":
      return t.approveErrAllowanceChanged(
        symbol,
        amount(error.AllowanceChanged.current_allowance),
      );
    case "Expired":
    case "ExpiredFrom":
      return t.approveErrExpired;
    case "TooOld":
      return t.approveErrTooOld;
    case "CreatedInFuture":
      return t.approveErrCreatedInFuture;
    case "Duplicate":
      return t.approveErrDuplicate(error.Duplicate.duplicate_of.toString());
    case "TemporarilyUnavailable":
      return t.approveErrUnavailable(symbol);
    case "GenericError":
      return t.approveErrGeneric(symbol, error.GenericError.message);
  }
}

export function mapApproveResult(
  result: RawApproveResult,
  token: PayTokenDescriptor = ICP_DESCRIPTOR,
): ApproveOutcome {
  if ("Ok" in result) return { ok: true, blockIndex: result.Ok };
  return {
    ok: false,
    message: describeApproveError(toTypedError(result.Err), token),
  };
}

/** Turn an agent/wallet exception into a readable, token-named message. */
export function describeCallFailure(error: unknown, symbol = "ICP"): string {
  const t = pickDict(MESSAGES_TEXT);
  const text = error instanceof Error ? error.message : String(error ?? "");
  if (/reject|denied|declin|cancel/i.test(text)) {
    return t.approveCancelled;
  }
  if (/fetch|network|timeout|timed out/i.test(text)) {
    return t.approveNetwork(symbol);
  }
  return t.approveFailed(symbol);
}

/** Agent for direct ledger calls; anonymous when no identity is given. */
export async function createLedgerAgent(
  identity?: Identity,
): Promise<HttpAgent> {
  const config = await loadConfig();
  const agent = new HttpAgent({ identity, host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(() => undefined);
  }
  return agent;
}

/** Raw ICRC actor for any ledger canister. */
export async function createLedgerActor(
  canisterId: string,
  identity?: Identity,
): Promise<IcpLedgerActor> {
  const agent = await createLedgerAgent(identity);
  return Actor.createActor<IcpLedgerActor>(icpLedgerIdlFactory, {
    agent,
    canisterId,
  });
}

/**
 * Approve `spender` on the pay token's own ledger for `amount` plus that
 * ledger's fee, signed by an Internet Identity.
 */
export async function approveTokenWithIdentity(
  identity: Identity,
  spender: Principal,
  token: PayToken,
  amount: bigint,
): Promise<ApproveOutcome> {
  const descriptor = PAY_TOKENS[token];
  try {
    const ledger = await createLedgerActor(
      descriptor.ledgerCanisterId,
      identity,
    );
    const result = await ledger.icrc2_approve(
      buildApproveArgs(spender, amount, descriptor.fee),
    );
    return mapApproveResult(result, descriptor);
  } catch (error) {
    return {
      ok: false,
      message: describeCallFailure(error, descriptor.symbol),
    };
  }
}

/** Approve with an Internet Identity on the ICP ledger. */
export function approveWithIdentity(
  identity: Identity,
  spender: Principal,
  purchaseE8s: bigint,
): Promise<ApproveOutcome> {
  return approveTokenWithIdentity(
    identity,
    spender,
    ICP_DESCRIPTOR.token,
    purchaseE8s,
  );
}
