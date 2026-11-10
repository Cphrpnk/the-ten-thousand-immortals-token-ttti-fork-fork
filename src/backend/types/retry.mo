import Map "mo:core/Map";
import Result "mo:core/Result";
import Common "common";
import Dex "dex";
import Pay "pay-token";
import Treasury "treasury";

// Shared retry types for outgoing ledger transfers. Every transfer attempt is
// recorded (memo, created_at_time and the full request) before the first
// await, then sent exactly as recorded.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;

  public type DexToken = Dex.DexToken;

  // Memo prefixes: PC, RF, FW (treasury forward), SH (reserve share), GR (guarantee redemption payout), BR,
  // DD (DEX deposit), DW (DEX withdrawal), DQ (pair request deposit refund),
  // DEX lot 4: DC (converted protocol fees to the cycles reserve) and DL
  // (locked-LP bonus claim).
  // Mint revenue correction: OW (owner revenue send), SR (one-time sweep top-up
  // of the cycles reserve from MINT-TREASURY-ICP), MF (mint-fee LP claim).
  // DEX lot 5: IR (ICPSwap route transfer of a routed swap).
  // Mint revenue routing: ST (settlement / mint-fee move into the fee account).
  // DEX-1: SW (sweep of a legacy deposit or pool subaccount into the token custody account).
  // PTM-4: CF (creator fee payout to the receiving wallet) and CY (cycles share
  // of the 1 % mint and buyback fees moved from the ICP custody to the cycles reserve).
  public type TransferPrefix = { #PC; #RF; #FW; #SH; #GR; #BR; #DD; #DW; #DQ; #DC; #DL; #OW; #SR; #MF; #IR; #ST; #SW; #LQ; #CF; #CY; #AB; #PQ; #RD };

  // Transfer types handled by the admin review ("To review"): forwards (FW),
  // reserve shares (SH), purchase refunds (RF, keyed by purchase id),
  // payments to refund (PC, keyed by the purchase trace number n), BTC
  // refunds (BR, keyed by the BR attempt number n), BTC cost sends to the
  // treasury (BC, keyed by the trace number n of the TTTI-PC-<n> memo) and
  // BTC costs of a delivery-and-refund failure to refund by hand (BM, keyed
  // by the conversion id) and guarantee redemption payouts (GR, keyed by the redemption id n).
  // DEX lot 2: DEX deposits (DD, keyed by n), DEX withdrawals (DW, keyed by
  // n) and pair request deposit refunds (DQ, keyed by the request id).
  // DEX lot 4: DC sends and DL claims, both keyed by n.
  // Mint revenue correction: OW (keyed by owner send id), SR (keyed by 0, the
  // one-time sweep) and MF (keyed by claim n).
  // DEX lot 5: IR (keyed by routed swap id).
  // Mint revenue routing: ST (fee-account move, keyed by n).
  // DEX-1: SW (sweep transfer, keyed by n) and CS (custody surplus of a
  // token, keyed by the DEX token index; informational, no action).
  // DEX-2: LQ (liquidation payout of a removed pair position, keyed by n).
  public type TransferKind = { #FW; #SH; #RF; #PC; #BR; #BC; #BM; #GR; #DD; #DW; #DQ; #DC; #DL; #OW; #SR; #MF; #IR; #ST; #SW; #LQ; #CS };

  // Why a BTC (ckBTC) refund is sent from the buyer's deposit subaccount:
  // #excess       = R1, the excess above the delivered cost;
  // #fullRefund   = R2, the full refund after a failed delivery (legacy
  //                 failures included);
  // #deliveryFailedExcess = the excess kept by a delivery-and-refund failure.
  public type BtcRefundPurpose = { #excess; #fullRefund; #deliveryFailedExcess };

  // The BTC (ckBTC) cost send to the treasury of a BTC purchase, recorded with
  // its TTTI-PC-<n> memo and created_at_time before the first await and resent
  // identically for 23 h, then marked for review.
  public type BtcCostSend = {
    buyer : Principal;
    depositIndex : Nat;
    conversionId : ?Nat;
    attempt : TransferAttempt;
  };

  // Collect outcome of a payment to refund: #confirmed = the ledger returned a
  // block (delivery then failed before the purchase was recorded); #unknown =
  // the collect call was rejected or trapped, the debit may or may not exist.
  public type CollectState = { #confirmed; #unknown };

  // Active purchase trace, written before the collect await and removed when
  // the purchase is recorded (or on a collect Err). `reserved` is the TTTI-T
  // amount held in sale.reserved for this purchase; it is released only
  // through the trace.
  public type PurchaseTrace = {
    n : Nat; // global number (RetryStore.nextN)
    buyer : Principal;
    token : PayToken;
    amount : Nat; // pay-token base units to collect
    reserved : Nat; // TTTI-T base units reserved
    created_at_time : Nat64; // ns, sent with the collect
    memo : Blob; // "TTTI-PC-<n>", sent with the collect
  };

  // A collected (or possibly collected) payment that has no recorded purchase:
  // its reservation is released and the admin refunds or dismisses it.
  public type PaymentToRefund = {
    n : Nat;
    buyer : Principal;
    token : PayToken;
    amount : Nat;
    reserved : Nat;
    created_at_time : Nat64;
    memo : Blob;
    collect : CollectState;
    block : ?Nat; // collect block when known
    detectedAt : Int; // ns, when the trace became a payment to refund
  };

  // The full recorded request; a resend uses it unchanged.
  public type TransferRequest = {
    token : PayToken;
    from_subaccount : ?Blob;
    to : Account; // full destination account
    amount : Nat;
    fee : ?Nat;
  };

  // #pending   = recorded, not sent yet;
  // #unknown   = a send was rejected or trapped: the outcome is unknown and
  //              stays unknown until an Ok, a #Duplicate or the admin check,
  //              even if a resend gets an Err;
  // #failed    = known ledger Err: a new attempt is allowed;
  // #succeeded = Ok or #Duplicate, with the ledger block index.
  public type AttemptOutcome = {
    #pending;
    #unknown;
    #failed : Text;
    #succeeded : Nat;
  };

  public type TransferAttempt = {
    n : Nat; // global transfer number (RetryStore.nextN)
    attempt : Nat; // m: 1 for the first attempt
    memo : Blob; // "TTTI-<prefix>-<n>" (attempt 1) or "TTTI-<prefix>-<n>-<m>", <= 32 bytes, never a principal
    created_at_time : Nat64; // ns, fixed for the attempt, never null
    request : TransferRequest;
    sends : Nat; // number of sends of this attempt
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  // Stable retry state: the global counter n and the current attempt of each
  // forward (FW), reserve share (SH) and purchase refund (RF), keyed by
  // purchase (conversion) id; active purchase traces (PC) and payments to
  // refund, keyed by the trace number n.
  public type RetryStore = {
    var nextN : Nat;
    forwards : Map.Map<Nat, TransferAttempt>;
    shares : Map.Map<Nat, TransferAttempt>;
    refunds : Map.Map<Nat, TransferAttempt>;
    traces : Map.Map<Nat, PurchaseTrace>;
    toRefund : Map.Map<Nat, PaymentToRefund>;
    btcCosts : Map.Map<Nat, BtcCostSend>; // keyed by the trace number n
  };

  // --- DEX transfers (DD, DW, DQ): TTTI-T (internal, synchronous) or a pay
  // token (external, async). Recorded before the first await, sent as recorded.

  // DD: `from` = the user's account (ICRC-2 transfer_from by the canister),
  // `to` = the user's DEX deposit subaccount. DW / DQ: `from` = the canister
  // subaccount sending, `to` = the user's default account.
  public type DexTransferRequest = {
    token : DexToken;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
  };

  public type DexTransferAttempt = {
    // DD / DW: global number (RetryStore.nextN). DQ: the pair request number
    // (PairRequest id) for attempts created from the pair request number
    // scheme; attempts recorded earlier keep their global number.
    n : Nat;
    attempt : Nat; // m: 1 for the first attempt
    // "TTTI-DD-<n>", "TTTI-DW-<n>" (n = global number), "TTTI-DQ-<n>" (n = pair
    // request number); renewals add "-<m>".
    memo : Blob;
    created_at_time : Nat64; // ns, never null
    request : DexTransferRequest;
    sends : Nat;
    lastError : ?Text;
    outcome : AttemptOutcome;
  };

  // A DEX deposit or withdrawal of `owner`; `amount` = internal balance amount.
  public type DexTransfer = {
    n : Nat;
    owner : Principal;
    token : DexToken;
    amount : Nat;
    attempt : DexTransferAttempt;
    status : Dex.DexTransferStatus;
  };

  public type DexTransferStore = {
    deposits : Map.Map<Nat, DexTransfer>; // DD, keyed by n
    withdrawals : Map.Map<Nat, DexTransfer>; // DW, keyed by n
    pairRefunds : Map.Map<Nat, DexTransferAttempt>; // DQ, keyed by request id
    liquidations : Map.Map<Nat, LiquidationPayout>; // LQ, keyed by n (DEX-2)
  };

  // PTM-10c: how the deposit of one pair request was paid (keyed by request
  // id). A request without an entry was deposited in TTTI-T (earlier
  // requests); PTM-11b creates its entry (token #tttiT) when its refused
  // deposit is moved to the set-aside. `token` is the accepted token paid (ICP,
  // ckBTC, ckUSDC or ckUSDT) or #tttiT for those earlier requests;
  // PairRequest.depositAmount / depositBlock are in that token.
  // After a refusal the deposit is moved from its request deposit account to
  // the DEX custody account of the token by the RD attempt `setAside` (memo
  // TTTI-RD-<request id>) and counted in the permanent liquidity set-aside in
  // the same step that records the successful outcome (`setAsideAt`), so each
  // refused deposit is counted exactly once.
  public type PairPayDeposit = {
    requestId : Nat;
    token : DexToken;
    setAside : ?DexTransferAttempt;
    setAsideAt : ?Int;
  };

  // DEX-2, LQ: payout of one token of a liquidated position to the owner's
  // wallet after a pair removal. The internal balance was credited by the
  // liquidation; `amount` is reserved (available -> reserved) when the payout
  // is opened and sent from the token's custody account to the owner's default
  // account (amount - fee). Memo "TTTI-LQ-<n>" (renewals "-<m>"), at most 32
  // bytes, no principal. created_at_time is recorded before the first await,
  // the identical request is resent for 23 h, then #needsReview.
  public type LiquidationPayout = {
    n : Nat;
    poolId : Nat;
    positionId : Nat;
    owner : Principal;
    token : DexToken;
    amount : Nat;
    attempt : DexTransferAttempt;
    status : Dex.DexTransferStatus;
  };

  // The ICRC-1 transfer method every pay-token ledger provides.
  public type TransferLedger = actor {
    icrc1_transfer : shared Treasury.IcpTransferArgs -> async Treasury.IcpTransferResult;
  };

  // What the retry rule decides for a recorded attempt.
  public type RetryAction = {
    #resend; // pending or unknown within 23 h of created_at_time: same attempt
    #newAttempt; // known failure: new memo and new created_at_time
    #needsReview; // unknown after 23 h
    #done; // succeeded
  };

  // One row of the admin "To review" screen. For #PC rows `purchaseId` is the
  // trace number n, `destination` the buyer's default account, `block` the
  // collect block when known and `collect` is set; for #FW / #SH / #RF rows
  // `block` is null and `collect` is null. BTC rows (#BR, #BC, #BM) carry
  // `buyer`, `depositIndex`, `conversionId` when known and `outcome`; #BR rows
  // also `refundPurpose`; #BM rows have no memo nor created_at_time and
  // `amount` is the cost to refund by hand. Non-BTC rows leave these null.
  // DEX rows (#DD / #DW keyed by n, #DQ keyed by request id) carry `buyer` =
  // the owner / requester and `outcome`; `token` may be #tttiT.
  public type TransferReview = {
    kind : TransferKind;
    purchaseId : Nat;
    block : ?Nat;
    collect : ?CollectState;
    token : DexToken;
    memoText : ?Text; // null for a legacy transfer sent without memo
    memoHex : ?Text;
    createdAtTimeNs : ?Nat64; // null for a legacy transfer sent without created_at_time
    amount : Nat;
    fee : ?Nat;
    destination : ?Account;
    sends : Nat;
    lastError : ?Text;
    buyer : ?Principal;
    depositIndex : ?Nat;
    conversionId : ?Nat;
    refundPurpose : ?BtcRefundPurpose;
    outcome : ?AttemptOutcome;
  };

  public type ReviewError = {
    #notAdmin;
    #notFound;
    #notUnderReview;
    #notApplicable; // the action does not apply to this kind (e.g. Arrived on #PC)
  };

  public type ReviewResult = Result.Result<(), ReviewError>;
};
