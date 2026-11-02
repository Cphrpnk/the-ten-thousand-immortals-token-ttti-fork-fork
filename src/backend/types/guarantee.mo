import Map "mo:core/Map";
import Common "common";
import Dex "dex";
import Pay "pay-token";
import Retry "retry";

// PTM-2: personal guarantee and redemption. Each minter has one mass per
// payment token: the TTTI-T quantity minted and the guarantee that matches it,
// built from the Guarantee recorded by every completed liquidity-forming mint.
// A mass belongs to one person only: no common reserve, no sharing. The right
// to redeem belongs to the person, not to specific tokens: any TTTI-T the
// person holds can be returned, up to the remaining mass. Returned TTTI-T go
// to a dedicated contract-held account and stay out of circulation until the
// auctions; nothing is burned.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type DexToken = Dex.DexToken;
  public type Timestamp = Int; // ns (Time.now())
  public type RedemptionId = Nat; // the global transfer number n of the payout memo TTTI-GR-<n>
  public type TokenKey = Text; // "icp", "ckbtc", "ckusdc", "ckusdt"

  // One person's mass in one payment token. Base units of TTTI-T and of the
  // token. remainingGuarantee is the guarantee still attached to remainingTtti
  // (redeemed pro rata); excess is the guarantee a redemption during the mint
  // left behind because the token had risen, kept for its owner.
  public type GuaranteeMass = {
    token : PayToken;
    totalTtti : Nat; // TTTI-T minted, ever
    totalGuarantee : Nat; // guarantee deposited, ever
    remainingTtti : Nat; // not redeemed yet
    remainingGuarantee : Nat; // attached to remainingTtti
    excess : Nat; // left in the guarantee, withdrawable once the mint has ended
  };

  // Stored: owner -> token key -> mass. Never shared between owners.
  public type GuaranteeMassStore = Map.Map<Principal, Map.Map<TokenKey, GuaranteeMass>>;

  // The caller's mass as shown on "Ma garantie".
  public type GuaranteeMassView = {
    token : PayToken;
    totalTtti : Nat;
    totalGuarantee : Nat;
    remainingTtti : Nat;
    remainingGuarantee : Nat;
    excess : Nat;
    withdrawableExcess : Nat; // excess once the mint has ended, else 0
    guaranteeValue : Nat; // remainingGuarantee + excess, token base units
    rateUsdE8 : ?Nat; // stored rate, null when absent or expired
    guaranteeValueUsdE8 : ?Nat; // guaranteeValue at rateUsdE8
    mintEnded : Bool;
  };

  public type RedeemPhase = { #duringMint; #afterMint };

  // Which quantity gave the returned amount.
  public type RedeemRule = {
    #depositedGuarantee; // during the mint: the deposited guarantee was lower
    #dayRate; // during the mint: the quantity worth 10 000 USD x amount was lower
    #proRata; // after the mint: pro rata of the mass, in kind, no cap
  };

  // Preview of redeeming tttiAmount of the caller's mass in `token`.
  public type RedeemQuote = {
    token : PayToken;
    tttiAmount : Nat;
    phase : RedeemPhase;
    rule : RedeemRule;
    depositedGuarantee : Nat; // guarantee for tttiAmount, pro rata of the remaining mass
    dayRateQuantity : ?Nat; // token quantity worth 10 000 USD x tttiAmount; null after the mint
    rateUsdE8 : ?Nat; // rate used; null after the mint
    returnedAmount : Nat; // before the fees
    excessKept : Nat; // stays in the guarantee (during the mint only)
    redemptionFee : Nat; // 1 % of returnedAmount, set aside for the creator
    thirdPartyFee : Nat; // token ledger fee of the payout
    netAmount : Nat; // returnedAmount - redemptionFee - thirdPartyFee
    tttiTransferFee : Nat; // TTTI-T ledger fee of the pull
    tttiAllowanceRequired : Nat; // tttiAmount + tttiTransferFee, ICRC-2 approval to the contract
  };

  public type RedemptionKind = { #redeem; #excessWithdrawal };

  // One redemption (or excess withdrawal, tttiAmount = 0) payout. Recorded with
  // its memo and created_at_time before the first await, in the same message
  // as the TTTI-T pull, so the person never keeps both. The payout is sent from
  // the token custody account and resent / renewed by lib/retry.mo (memo
  // TTTI-GR-<n>, renewals -<m>); #needsReview after 23 h of unknown outcome.
  public type Redemption = {
    id : RedemptionId;
    owner : Principal;
    account : Account; // TTTI-T pulled from, payout sent to
    kind : RedemptionKind;
    token : PayToken;
    phase : RedeemPhase;
    rule : RedeemRule;
    tttiAmount : Nat;
    tttiPullBlock : ?Nat; // TTTI-T ledger block of the pull to the returned account
    depositedGuarantee : Nat;
    rateUsdE8 : ?Nat;
    returnedAmount : Nat;
    excessKept : Nat;
    redemptionFee : Nat;
    thirdPartyFee : Nat;
    netAmount : Nat;
    createdAt : Timestamp;
    payout : Retry.DexTransferAttempt; // current attempt: memo, created_at_time, sends, outcome
    status : Dex.DexTransferStatus; // #completed carries the payout block
  };

  // 1 % redemption fee set aside for the creator (distribution is a later lot).
  public type RedemptionFee = {
    redemptionId : RedemptionId;
    token : PayToken;
    amount : Nat;
    createdAt : Timestamp;
  };

  public type RedemptionStore = {
    redemptions : Map.Map<RedemptionId, Redemption>;
    fees : Map.Map<RedemptionId, RedemptionFee>;
  };

  public type TokenGuaranteeTotal = {
    token : PayToken;
    remainingTtti : Nat;
    remainingGuarantee : Nat;
    excess : Nat;
  };

  // Public: the unclaimed mass.
  public type UnclaimedMassTotal = {
    remainingTtti : Nat; // sum of every remaining TTTI-T mass
    massCount : Nat;
    perToken : [TokenGuaranteeTotal];
    mintEnded : Bool;
  };

  // PTM-9b: dedicated internal guarantee account, one per token, in the common
  // custody. Stored: token key ("tttiT", "icp", "ckbtc", "ckusdc", "ckusdt") ->
  // balance in the token's base units. The mint and the auction settlement
  // credit it with each guarantee; a redemption debits only it. Funds stay in
  // the common custody; this is the internal account that owns them.
  public type GuaranteeAccountStore = Map.Map<TokenKey, Nat>;

  // Public: for one token, the sum of every guarantee mass (remainingGuarantee
  // + excess of all owners) against the balance of the dedicated account.
  public type GuaranteeAccountView = {
    token : DexToken;
    massTotal : Nat;
    accountBalance : Nat;
    equal : Bool; // massTotal == accountBalance
  };

  public type GuaranteeError = {
    #anonymous;
    #salesPaused; // refused before any lock, transfer or external call
    #massNotFound; // the caller has no mass in this token
    #nothingRemaining; // remaining mass is zero
    #amountTooSmall; // zero, or the net amount would be zero or negative
    #amountExceedsMass : { requested : Nat; remaining : Nat };
    #rateUnavailable : PayToken; // during the mint: absent or expired, refused before any transfer
    #tttiBalanceInsufficient : { balance : Nat; required : Nat };
    #allowanceInsufficient : { allowance : Nat; required : Nat };
    #slippage : { expectedNetAmount : Nat; netAmount : Nat };
    #redemptionInProgress; // one redemption at a time per (owner, token)
    #mintNotEnded; // withdrawGuaranteeExcess before the mint has ended
    #noExcess;
    #pullFailed : Text;
    #callFailed : Text;
  };
};
