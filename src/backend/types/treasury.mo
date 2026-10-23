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

  public type TokenAccountResult = {
    #Ok : TokenAccountInfo;
    #Err : Text;
  };

  // Admin-controlled configuration: the only setting is `icpAccount`, the
  // account that receives the creator's ICP (collected ICP is forwarded there
  // automatically after each delivery). Price and the fee (1% for every pay token)
  // are code constants; ck-token accounts are set with setPayTokenAccount.
  public type TreasuryConfig = {
    icpAccount : Account;
  };

  public type ConversionStatus = {
    #completed; // TTTI-T delivered
    #failed; // refused or ICP collection failed; nothing taken
    #refunded; // ICP taken, delivery failed, ICP refunded (minus ICP fee)
    #refundFailed; // ICP taken, delivery failed, refund also failed
  };

  // What happened to the collected ICP after a successful delivery.
  public type ForwardStatus = {
    #notRequired; // treasury icpAccount is the canister account (or legacy record)
    #pending; // not attempted yet
    #forwarded : Nat; // ICP ledger block index
    #failed : Text; // forwarding failed; the buyer's credit stands
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

  public type TreasuryConfigResult = {
    #Ok : TreasuryConfig;
    #Err : Text;
  };

  // Public subset of the treasury configuration (no buyer data).
  public type PublicTreasuryInfo = {
    icpAccount : Account;
    tokenAccounts : [TokenAccountInfo]; // #icp, #ckbtc, #ckusdc, #ckusdt in that order
  };
};
