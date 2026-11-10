import Map "mo:core/Map";
import Common "common";
import Dex "dex";
import Pay "pay-token";
import Retry "retry";

// PTM-11 / PTM-11b: the COMMON RESERVE and its redemption. 10 000 USD per
// TTTI-T minted is held, in USD terms and without any conversion, in the token
// the minter paid in (ICP, ckBTC, ckUSDC or ckUSDT) in the dedicated per-token
// internal guarantee accounts of the common custody. Any holder, minter or not, redeems
// TTTI-T against that reserve for at most 10 000 USD per TTTI-T, with no fee.
// Returned TTTI-T go to a dedicated contract-held account and stay out of
// circulation until the auctions; nothing is burned.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type DexToken = Dex.DexToken;
  public type Timestamp = Int; // ns (Time.now())
  public type RedemptionId = Nat; // the global transfer number n of the payout memo TTTI-GR-<n>
  public type TokenKey = Text; // "icp", "ckbtc", "ckusdc", "ckusdt"

  // Rule of a quote: parity (10 000 USD per TTTI-T) or the proportional share of the reserve, whichever is smaller.
  public type ReserveRedeemRule = { #parity; #reserveShare };

  // PTM-11: one payout line of a quote, in one reserve token (ICP, ckBTC, ckUSDC, ckUSDT).
  // The ledger fee of the payout is borne by the creator share, so the holder
  // receives `amount` in full.
  public type ReservePayoutLine = {
    token : PayToken;
    amount : Nat; // token base units paid to the holder
    ledgerFee : Nat; // token ledger fee, taken from the creator share
    valueUsdE8 : Nat; // amount at rateUsdE8
    rateUsdE8 : Nat; // USD e8 per whole token
  };

  // PTM-11: preview of redeeming `tttiAmount` against the common reserve. No
  // fee. payoutUsdE8 = min(parityUsdE8, proportionalUsdE8), split over the
  // reserve tokens in proportion to the reserve composition.
  public type RedeemQuote = {
    tttiAmount : Nat; // TTTI-T base units (e8)
    rule : ReserveRedeemRule;
    parityUsdE8 : Nat; // 10 000 USD x tttiAmount
    proportionalUsdE8 : Nat; // (reserve USD / circulation outside the contract) x tttiAmount
    payoutUsdE8 : Nat; // min(parity, proportional share)
    reserveUsdE8 : Nat; // reserve value, all tokens
    reservePerTtti : ?Nat; // USD e8 per whole TTTI-T; null when the circulation is zero
    circulationOutside : Nat; // TTTI-T base units outside the contract
    payouts : [ReservePayoutLine]; // one per reserve token with a non-zero amount
    tttiTransferFee : Nat; // TTTI-T ledger fee of the pull
    tttiAllowanceRequired : Nat; // tttiAmount + tttiTransferFee, ICRC-2 approval to the contract
  };

  // PTM-11: one reserve token in the reserve view.
  public type ReserveTokenLine = {
    token : PayToken; // #icp, #ckbtc, #ckusdc or #ckusdt
    balance : Nat; // balance of the dedicated guarantee account, token base units
    rateUsdE8 : ?Nat; // null when absent or expired
    valueUsdE8 : Nat; // balance at rateUsdE8; 0 without a rate
  };

  // PTM-11: kept for compatibility; no longer used (ICP / ckBTC count in the reserve).
  public type LegacyGuaranteeBalance = {
    token : PayToken;
    balance : Nat;
  };

  // PTM-11: the common reserve. Invariant: reserveUsdE8 >= 10 000 USD x
  // TTTI-T in circulation outside the contract (requiredUsdE8).
  public type ReserveView = {
    perToken : [ReserveTokenLine];
    reserveUsdE8 : Nat;
    circulationOutside : Nat; // TTTI-T base units
    reservePerTtti : ?Nat; // USD e8 per whole TTTI-T; null when the circulation is zero
    requiredUsdE8 : Nat; // 10 000 USD x circulationOutside
    invariantHolds : Bool; // reserveUsdE8 >= requiredUsdE8
    shortfallUsdE8 : Nat; // requiredUsdE8 - reserveUsdE8, 0 when none
    legacyPending : [LegacyGuaranteeBalance]; // always empty: kept for compatibility
  };

  // PTM-11: kept for compatibility; convertLegacyGuarantees converts nothing any more.
  public type LegacyConversion = {
    tokenIn : PayToken; // #icp or #ckbtc
    amountIn : Nat;
    amountOut : Nat; // ckUSDC credited to the common reserve
  };

  // A redemption pays one Redemption per reserve token (leg); the first leg
  // carries tttiAmount, the other legs carry tttiAmount = 0, all share the same
  // tttiPullBlock. Recorded with its memo and created_at_time before the first
  // await, in the same message as the TTTI-T pull, so the person never keeps
  // both. The payout is sent from the token custody account and resent /
  // renewed by lib/retry.mo (memo TTTI-GR-<n>, renewals -<m>); #needsReview
  // after 23 h of unknown outcome. thirdPartyFee is the token ledger fee, borne
  // by the creator share; netAmount is paid to the holder in full.
  public type Redemption = {
    id : RedemptionId;
    owner : Principal;
    account : Account; // TTTI-T pulled from, payout sent to
    token : PayToken;
    tttiAmount : Nat;
    tttiPullBlock : ?Nat; // TTTI-T ledger block of the pull to the returned account
    rateUsdE8 : ?Nat;
    thirdPartyFee : Nat;
    netAmount : Nat;
    createdAt : Timestamp;
    payout : Retry.DexTransferAttempt; // current attempt: memo, created_at_time, sends, outcome
    status : Dex.DexTransferStatus; // #completed carries the payout block
  };

  public type RedemptionStore = {
    redemptions : Map.Map<RedemptionId, Redemption>;
  };

  // Dedicated internal reserve account, one per token, in the common custody.
  // Stored: token key ("tttiT", "icp", "ckbtc", "ckusdc", "ckusdt") -> balance in
  // the token's base units. The mint and the auction settlement credit it; a
  // redemption debits only it. Funds stay in the common custody; this is the
  // internal account that owns them.
  public type GuaranteeAccountStore = Map.Map<TokenKey, Nat>;

  // Public: balance of the dedicated account of one token.
  public type GuaranteeAccountView = {
    token : DexToken;
    accountBalance : Nat;
  };

  public type GuaranteeError = {
    #anonymous;
    #salesPaused; // refused before any lock, transfer or external call
    #acknowledgementRequired; // the stored wallet-terms acceptance is not the current version; refused before any transfer
    #amountTooSmall; // zero, or a payout line would not cover its ledger fee
    #amountExceedsCirculation : { requested : Nat; circulation : Nat }; // PTM-11: the only refusal on the amount
    #reserveEmpty; // PTM-11: no reserve to pay from
    #rateUnavailable : PayToken; // a reserve token rate is absent or expired, refused before any transfer
    #tttiBalanceInsufficient : { balance : Nat; required : Nat };
    #allowanceInsufficient : { allowance : Nat; required : Nat };
    #slippage : { expectedPayoutUsdE8 : Nat; payoutUsdE8 : Nat }; // PTM-11
    #redemptionInProgress; // one redemption at a time per caller
    #ledgerFeeNotCovered : { token : PayToken; fee : Nat }; // PTM-11: the creator share cannot bear the ledger fee
    #nothingToConvert; // PTM-11: no legacy guarantee left to convert
    #conversionFailed : Text; // PTM-11: router conversion refused, nothing moved
    #pullFailed : Text;
    #callFailed : Text;
  };
};
