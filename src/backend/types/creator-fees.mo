import Map "mo:core/Map";
import Common "common";
import Dex "dex";
import Retry "retry";

// PTM-4: the creator's holdings, kept per DEX token in the contract's DEX
// custody (no separate account) until an admin payout sends them to the
// receiving wallet configured for the token. Credits come from the native
// swap fee share, the router share, the mint fee, the buyback fee and the
// TTTI-T transfer fee.
module {
  public type Account = Common.Account;
  public type Timestamp = Int;
  public type DexToken = Dex.DexToken;
  public type DexTransferAttempt = Retry.DexTransferAttempt;
  public type DexTransferStatus = Dex.DexTransferStatus;

  public type CreatorFeeSource = {
    #swapFeeShare; // two thirds of the 30 % native swap fee protocol share
    #routerShare; // two thirds of the 30 % protocol share of the router 0.1 %
    #mintFee; // ICP part of the 1 % mint fee left after the cycles reserve
    #buybackFee; // ICP part of the 1 % buyback fee left after the cycles reserve
    #transferFee; // 0.00001 TTTI-T per TTTI-T transfer
  };

  // Per token, stable. Amounts are base units of the token. Held amount =
  // sum of the sources - paidOut - inFlight.
  public type CreatorTokenTotals = {
    token : DexToken;
    swapFeeShare : Nat;
    routerShare : Nat;
    mintFee : Nat;
    buybackFee : Nat;
    transferFee : Nat;
    paidOut : Nat; // gross amount of the payouts that succeeded
    inFlight : Nat; // gross amount of the payouts in progress or to review
    lastCreditAt : ?Timestamp;
  };

  // One payout of the whole held amount of a token. `grossAmount` leaves the
  // holdings; the wallet receives `netAmount` (gross minus the ledger fee).
  // Transfer memo "TTTI-CF-<n>" (renewals "-<m>"), created_at_time recorded
  // before the first await.
  public type CreatorPayout = {
    n : Nat;
    token : DexToken;
    grossAmount : Nat;
    netAmount : Nat;
    wallet : Account;
    createdAt : Timestamp;
    attempt : DexTransferAttempt;
    status : DexTransferStatus;
  };

  // Stable creator fee state (new stable field `creatorFees`).
  public type CreatorFeeStore = {
    totals : Map.Map<Text, CreatorTokenTotals>; // keyed by the token symbol
    payouts : Map.Map<Nat, CreatorPayout>; // keyed by the transfer number n
  };

  // --- Views -----------------------------------------------------------------

  public type CreatorTokenView = {
    token : DexToken;
    symbol : Text;
    held : Nat; // credited, not yet paid out or in flight
    paidOut : Nat;
    inFlight : Nat;
    swapFeeShare : Nat;
    routerShare : Nat;
    mintFee : Nat;
    buybackFee : Nat;
    transferFee : Nat;
    lastCreditAt : ?Timestamp;
  };

  public type CreatorPayoutView = {
    n : Nat;
    symbol : Text;
    grossAmount : Nat;
    netAmount : Nat;
    createdAt : Timestamp;
    memoText : Text;
    status : DexTransferStatus;
  };

  // Public view of the creator's holdings. `transferFeeCollectorE8s` is the
  // TTTI-T balance of the ledger fee collector account (read only, base
  // units): the TTTI-T transfer fees received and not yet moved.
  public type CreatorHoldingsView = {
    tokens : [CreatorTokenView];
    transferFeeCollectorE8s : Nat;
    payouts : [CreatorPayoutView]; // newest first, at most 20
  };

  public type PayoutError = {
    #paused;
    #noWallet; // no receiving wallet configured for the token
    #nothingToPay;
    #belowFee : { held : Nat; fee : Nat };
    #payoutInProgress;
  };

  public type PayoutResult = {
    #ok : CreatorPayoutView;
    #err : PayoutError;
  };
};
