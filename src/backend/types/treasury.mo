import List "mo:core/List";
import Common "common";
import Pay "pay-token";

module {
  // Treasury domain types: treasury ICP account, mode, conversion history,
  // and the ICP ledger integration shapes.

  public type Account = Common.Account;
  public type Timestamp = Common.Timestamp;
  public type PayToken = Pay.PayToken;

  // Receiving account per ck token (ICP uses TreasuryConfig.icpAccount).
  // A purchase in a ck token is refused with #tokenNotConfigured while null.
  public type TokenAccounts = {
    ckbtc : ?Account;
    ckusdc : ?Account;
    ckusdt : ?Account;
  };

  // One pay token's receiving account (null = not configured).
  public type TokenAccountInfo = {
    token : PayToken;
    account : ?Account;
  };

  // Legacy configuration (set by the admin before DEX lot 4, no longer
  // settable): the old external ICP account. Its funds stay where they are;
  // new forwards go to the internal mint treasury subaccounts.
  public type TreasuryConfig = {
    icpAccount : Account;
  };

  public type ConversionStatus = {
    #completed; // TTTI-T delivered
    #failed; // refused or ICP collection failed; nothing taken
    #refunded; // ICP taken, delivery failed, ICP refunded (minus ICP fee)
    #refundFailed; // taken, delivery failed, refund not done yet: an RF attempt (RetryStore.refunds) is retried by the timer
    #refundReview; // refund outcome unknown after 23 h, or legacy / BTC-path failure: admin verification required
  };

  // What happened to the collected ICP after a successful delivery.
  public type ForwardStatus = {
    #notRequired; // zero amount, treasury account is the canister account, or legacy record
    #pending; // an attempt is open (RetryStore.forwards); sent or resent by the 10-min timer
    #forwarded : Nat; // pay-token ledger block index
    #failed : Text; // legacy: forwarding failed; the buyer's credit stands
    #needsReview; // outcome unknown after 23 h (or legacy): admin verification required
  };

  // One pay token -> TTTI-T conversion record.
  public type Conversion = {
    id : Nat;
    depositor : Principal; // the buyer (payer)
    recipient : Account; // delivery account credited with TTTI-T
    payToken : PayToken; // token paid with (#icp for records before multi-token)
    payAmount : Nat; // pay-token base units collected (only the cost of delivered TTTI-T)
    feeBps : Nat; // sale fee applied, as recorded at purchase time (100 = 1% for new purchases)
    icpAmount : Nat; // ICP e8s collected (= payAmount for #icp, 0 otherwise)
    tttiAmount : Nat; // TTTI-T base units (8 decimals)
    status : ConversionStatus;
    timestamp : Timestamp; // nanoseconds
    priceUsdE8 : Nat; // USD rate of the paid token at purchase time, USD * 10^8 (background audit data; 0 on historical fallback records)
    usedFallback : Bool; // historical records only; always false for new purchases
    minted : Nat; // TTTI-T freshly minted (filled first)
    fromCollector : Nat; // TTTI-T delivered from the fee account (only after the mint cap)
    forward : ForwardStatus;
    message : ?Text; // human-readable failure / refund note
    // Exact purchase quantities (null on records created before they were kept).
    feeAmount : ?Nat; // sale fee, pay-token base units (never refundable)
    netAmount : ?Nat; // net pay-token base units converted, fee excluded (the refundable basis)
    paymentBlock : ?Nat; // pay-token ledger block index of the payment collection
    mintBlock : ?Nat; // TTTI-T ledger block index of the mint
  };

  // --- ICP ledger integration (ICRC-1 / ICRC-2) ------------------------------

  public type IcpTransferArgs = {
    from_subaccount : ?Common.Subaccount;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Timestamp;
  };

  public type IcpTransferFromArgs = {
    spender_subaccount : ?Common.Subaccount;
    from : Account;
    to : Account;
    amount : Nat;
    fee : ?Nat;
    memo : ?Blob;
    created_at_time : ?Timestamp;
  };

  // icrc1_transfer error variants.
  public type IcpTransferError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Timestamp };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  // icrc2_transfer_from error variants (every ICRC-2 variant, so replies decode).
  public type IcpTransferFromError = {
    #BadFee : { expected_fee : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #InsufficientFunds : { balance : Nat };
    #InsufficientAllowance : { allowance : Nat };
    #TooOld;
    #CreatedInFuture : { ledger_time : Timestamp };
    #Duplicate : { duplicate_of : Nat };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type IcpTransferResult = {
    #Ok : Nat;
    #Err : IcpTransferError;
  };

  public type IcpTransferFromResult = {
    #Ok : Nat;
    #Err : IcpTransferFromError;
  };

  // Outcome of collecting ICP from the buyer: block index, a ledger error, or a
  // rejected call (caught, never trapped).
  public type CollectResult = {
    #ok : Nat;
    #ledgerError : IcpTransferFromError;
    #callFailed : Text;
  };

  // --- Treasury API results --------------------------------------------------

  // Public subset of the treasury configuration (no buyer data).
  public type PublicTreasuryInfo = {
    icpAccount : Account;
    tokenAccounts : [TokenAccountInfo]; // #icp, #ckbtc, #ckusdc, #ckusdt in that order
  };

  // --- DEX lot 4: internal mint treasuries and the weekly allocation ---------

  // One mint treasury: the internal subaccount of this canister that receives
  // new forwards (FW), with no withdrawal path, and the old external account
  // (admin-set before lot 4) whose funds stay where they are.
  public type MintTreasuryAccount = {
    token : PayToken;
    account : Account; // canister + MINT-TREASURY-<token> subaccount
    balance : ?Nat; // cached balance in the token's base units, null until read
    legacyExternalAccount : ?Account;
  };

  // Amounts per mint treasury token, in each token's base units.
  public type TokenAmounts = {
    icp : Nat;
    ckbtc : Nat;
    ckusdc : Nat;
    ckusdt : Nat;
  };

  // Fixed protocol liquidity added to one pool by a weekly allocation, at
  // the pool ratio with no swap.
  public type AllocationPoolAdd = {
    poolId : Nat;
    amount0 : Nat;
    amount1 : Nat;
    shares : Nat;
  };

  // A pool skipped by the weekly allocation (empty, not yet open, removed,
  // or no eligible TTTI-T).
  public type AllocationSkip = {
    poolId : Nat;
    reason : Text;
  };

  // One weekly allocation calculation.
  public type WeeklyAllocation = {
    id : Nat;
    at : Int; // nanoseconds (Time.now())
    autonomyDays : ?Nat;
    treasuryBalances : TokenAmounts; // internal mint treasuries at calculation
    stockPayoutCap : TokenAmounts; // at most 1/12 of the accumulated stock
    toCyclesReserveE8s : Nat; // treasury ICP sent first to the cycles reserve below 90 days
    surplusE8s : Nat; // ICP beyond about 100 days of autonomy
    toBonusE8s : Nat; // 50 % of the surplus, to the DL bonus of locked TTTI-T-pair LPs
    toLiquidity : TokenAmounts; // 50 % side, used as fixed protocol liquidity
    poolAdds : [AllocationPoolAdd];
    skipped : [AllocationSkip];
    waiting : TokenAmounts; // token in excess of the pool ratio, waits for next week
    note : Text;
  };

  // Stable weekly allocation state (new stable field `treasuryAllocation`).
  public type AllocationStore = {
    var nextId : Nat;
    var lastRunAt : ?Int; // nanoseconds
    history : List.List<WeeklyAllocation>;
    // Accumulated stock at the first lot 4 calculation; paid out at most
    // 1/12 per week. Null until the first calculation.
    var stockBase : ?TokenAmounts;
    var stockPaid : TokenAmounts;
    var balances : TokenAmounts; // cached internal mint treasury balances
  };
};
