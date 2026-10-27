import Map "mo:core/Map";
import Common "common";
import Pay "pay-token";
import Retry "retry";

module {
  // TTTI-T buyback from an aggregated per-payment-token mass: one mass per
  // (buyer, payment token). Partial buybacks by percentage, one at a time per
  // mass. TTTI-T valued at 10,000 USD per token.

  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // nanoseconds (Time.now())
  public type PurchaseId = Nat;
  public type BuybackId = Nat;

  // Which quantity was the smaller one.
  public type BuybackRule = {
    #originalNet; // the pro-rata net quantity of the mass
    #dayRate; // the quantity worth the TTTI-T at 10,000 USD, at the day's rate
  };

  // Distinct from the purchase status #refunded.
  public type BuybackStatus = {
    #inProgress; // TTTI-T pull or payout running
    #completed; // TTTI-T pulled, payout sent, TTTI-T released to the funder
    #payoutFailed; // TTTI-T pulled, payout failed or unknown; see payoutAttempts
    #cancelled; // every attempt got an Err (or none arrived, legacy): TTTI-T returned
  };

  // One payout attempt in the mass token: the lib/retry.mo attempt (n,
  // attempt index, memo TTTI-BB-<n>-<attempt>, created_at_time, request,
  // outcome) and the funder account it is drawn from (icrc2_transfer_from).
  // Legacy attempts (before lot 5) have attempt = 0 and an empty memo.
  public type BuybackPayoutAttempt = {
    from : Account; // funder account (admin) debited by the payout
    attempt : Retry.TransferAttempt;
  };

  // One buyback. Version 42 per-purchase records keep every original field,
  // with purchaseId = ?purchase, percent = 100 and the mass figures equal to
  // that purchase's net and TTTI-T. Records with legacy = false hold their
  // TTTI-T in the escrow account until completion or cancellation.
  public type Buyback = {
    id : BuybackId;
    purchaseId : ?PurchaseId; // set only on Version 42 per-purchase buybacks
    buyer : Principal;
    buyerAccount : Account; // TTTI-T pulled from, payout sent to
    timestamp : Timestamp;
    originalToken : PayToken; // the mass token (payment token)
    tokenReturned : PayToken;
    percent : Nat; // 1..100 of the mass remainder
    massTotalNet : Nat; // mass total net paid at request time, mass token base units
    massTotalTtti : Nat; // mass total TTTI-T received at request time
    massRemainingNet : Nat; // mass remaining net before this buyback
    massRemainingTtti : Nat; // mass remaining TTTI-T before this buyback
    originalRateUsdE8 : Nat; // day rate of the mass token, USD * 10^8
    returnedRateUsdE8 : Nat; // day rate of the returned token, USD * 10^8
    rule : BuybackRule;
    originalNetAmount : Nat; // pro-rata net, mass token base units
    baseAmount : Nat; // mass token base units
    baseAmountReturned : Nat; // base quantity expressed in the returned token
    buybackFee : Nat; // 1%, returned token base units
    thirdPartyFees : Nat; // ledger and network fees, returned token base units
    tttiTransferFee : Nat; // TTTI-T ledger fee of the pull, TTTI-T base units
    tttiEscrowFee : Nat; // second TTTI-T fee, paid by the escrow on release or cancel (0 for legacy)
    amountReturned : Nat; // returned token base units
    tttiAmount : Nat; // TTTI-T taken back, base units
    pullBlock : ?Nat; // TTTI-T ledger block of the pull (buyer -> escrow; legacy: buyer -> admin)
    payoutBlock : ?Nat; // returned token ledger block of the payout
    payoutAttempts : [BuybackPayoutAttempt]; // oldest first
    releaseBlock : ?Nat; // TTTI-T ledger block escrow -> funder
    cancelBlock : ?Nat; // TTTI-T block escrow -> buyer, or the admin's block (legacy)
    legacy : Bool; // created before lot 5: TTTI-T went straight to the admin
    status : BuybackStatus;
    message : ?Text;
  };

  public type BuybackStore = {
    records : Map.Map<BuybackId, Buyback>;
    var nextId : BuybackId;
    var adminAccount : ?Account; // funds the payouts, receives the TTTI-T
  };

  // Aggregated figures of one buyer's purchases in one payment token.
  // Average ratio = totalNet / totalTtti.
  public type BuybackMass = {
    buyer : Principal;
    token : PayToken;
    purchaseCount : Nat;
    totalNet : Nat; // mass token base units
    totalTtti : Nat; // TTTI-T base units
    boughtBackNet : Nat; // sum of originalNetAmount over non-failed-pull buybacks
    boughtBackTtti : Nat; // sum of tttiAmount over non-failed-pull buybacks
    remainingNet : Nat;
    remainingTtti : Nat; // 0 = fully bought back, not offered
    inProgress : Bool; // a buyback is running on this mass
  };

  public type BuybackQuote = {
    originalToken : PayToken; // the mass token
    tokenReturned : PayToken;
    percent : Nat;
    massTotalNet : Nat;
    massTotalTtti : Nat;
    massRemainingNet : Nat;
    massRemainingTtti : Nat;
    originalRateUsdE8 : Nat;
    returnedRateUsdE8 : Nat;
    rule : BuybackRule;
    originalNetAmount : Nat; // pro-rata net
    baseAmount : Nat;
    baseAmountReturned : Nat;
    buybackFee : Nat;
    thirdPartyFees : Nat;
    tttiTransferFee : Nat;
    tttiEscrowFee : Nat; // second TTTI-T fee (escrow -> funder or buyer)
    amountReturned : Nat;
    tttiAmount : Nat;
    tttiAllowanceRequired : Nat; // tttiAmount + two TTTI-T fees
  };

  public type BuybackError = {
    #anonymous;
    #salesPaused; // sale.salesPaused: refused before any lock, transfer or external call
    #buybackNotFound;
    #notBuyer;
    #invalidPercent; // percent outside 1..100
    #receiveTokenMismatch; // receiveToken differs from the mass token
    #nothingRemaining; // mass empty or fully bought back
    #massBuybackInProgress; // a buyback is already running on this mass
    #buybackInProgress;
    #rateUnavailable : PayToken; // absent or expired
    #adminAccountNotSet;
    #adminAllowanceInsufficient : { token : PayToken; allowance : Nat; required : Nat };
    #adminAllowanceExpired : { token : PayToken };
    #adminBalanceInsufficient : { token : PayToken; balance : Nat; required : Nat };
    #buyerAllowanceInsufficient : { allowance : Nat; required : Nat };
    #amountTooSmall; // returned amount zero or negative
    #notRetryable;
    #notCancellable; // not #payoutFailed, or not every attempt got an Err
    #attemptUnknown; // an attempt's outcome is unknown or pending
    #attemptArrived; // an attempt arrived (Ok, #Duplicate or admin check)
    #notLegacy; // markBuybackCancelled applies only to legacy records
    #notAuthorized; // neither the buyer nor an admin
    #cancelFailed : Text; // escrow -> buyer TTTI-T transfer refused
    #releaseFailed : Text; // escrow -> funder TTTI-T transfer refused
    #pullFailed : Text;
    #payoutFailed : Text;
    #callFailed : Text;
  };

  // Admin's current ICRC-2 approval to the contract, per pay token.
  public type BuybackFunding = {
    token : PayToken;
    allowance : Nat;
    expiresAt : ?Nat64; // nanoseconds
    balance : Nat;
    error : ?Text; // ledger call failure, if any
  };
};
