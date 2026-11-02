import Map "mo:core/Map";
import Common "common";
import Pay "pay-token";
import Dex "dex";

// PTM-1: the liquidity-forming mint. It replaces the previous purchase for
// every new mint of TTTI-T (already sold TTTI-T and the guarantee redemption are
// untouched).
//
// Price: 10 000 USD per TTTI-T, the same for everyone. For q TTTI-T the minter
// pays 20 000 USD x q / 0.99 in ICP, ckBTC, ckUSDC or ckUSDT at the stored
// hourly rate. That amount splits into:
//   - a liquidity position: 10 000 USD x q of the paid token + the q minted
//     TTTI-T, deposited in the pool TTTI-T/<paid token> in the minter's name
//     (after a balancing "zap" swap in that same pool);
//   - a personal guarantee: 10 000 USD x q kept in the paid token (rules: PTM-2);
//   - 1 % of the amount paid, set aside for the creator (split: PTM-4).
//
// Units: TTTI-T quantities are Nat in 8-decimal base units (1 TTTI-T =
// 100_000_000). USD amounts are Nat in e8 units (1 USD = 100_000_000). Token
// amounts are Nat in the paid token's own base units.
//   - Minimum mint: 0.0001 TTTI-T = 10_000 base units (about 1 USD of position).
//   - Finest granularity: 0.00000001 TTTI-T = 1 base unit. A quantity with
//     more than 8 decimals is refused, never rounded.
module {
  public type Account = Common.Account;
  public type PayToken = Pay.PayToken;
  public type Timestamp = Int; // ns
  public type MintId = Nat;
  public type PoolId = Dex.PoolId;
  public type PositionId = Dex.PositionId;
  public type DexToken = Dex.DexToken;

  // A TTTI-T quantity. #baseUnits is exact. #decimal is a decimal string such
  // as "0.0001" or "0.00012345"; more than 8 fractional digits is refused with
  // #tooManyDecimals.
  public type Quantity = {
    #baseUnits : Nat;
    #decimal : Text;
  };

  // What the minter enters: a TTTI-T quantity, or the total to pay in USD
  // (e8). With #usd the quantity is q = floor(usdE8 x 99 / 2_000_000)
  // base units, rounded down so the minter never gets more than paid for.
  public type MintAmount = {
    #ttti : Quantity;
    #usd : Nat;
  };

  // --- Quote -----------------------------------------------------------------

  public type QuoteArgs = {
    token : PayToken;
    amount : MintAmount;
  };

  // Pool state seen at one moment. tokenPerTtti = reserveToken x 10^8 /
  // reserveTtti (token base units per whole TTTI-T); usdPerTtti is the same
  // valued at the stored rate (USD e8). Both null while the pool is empty.
  public type PoolPrice = {
    reserveTtti : Nat;
    reserveToken : Nat;
    tokenPerTtti : ?Nat;
    usdPerTtti : ?Nat;
  };

  // PTM-5: consolidated TTTI-T price in USD (e8) over all open native TTTI-T
  // pools, converted with the current oracle rates and weighted by depth. It
  // is #unavailable (never a trap) when no pool is open or no valid rate exists.
  public type ConsolidatedMintPrice = {
    #available : Nat;
    #unavailable : Dex.ConsolidatedUnavailable;
  };

  // The balancing swap done in the pool before the deposit: the part of the
  // pair that does not fit the pool ratio is swapped at market price.
  public type ZapSwap = {
    tokenIn : DexToken;
    tokenOut : DexToken;
    amountIn : Nat;
    amountOut : Nat;
    feeAmount : Nat;
  };

  public type LiquidityMintQuote = {
    token : PayToken;
    // q, in TTTI-T base units; at least 10_000, granularity 1.
    tttiAmount : Nat;
    // USD per whole paid token (e8) and the end of its validity.
    rateUsdE8 : Nat;
    rateValidUntil : Timestamp;
    // 20 000 USD x q / 0.99 in the paid token, rounded up; and the same in USD e8.
    payAmount : Nat;
    payUsdE8 : Nat;
    // Position: positionTokenAmount (10 000 USD x q in the paid token, rounded
    // down) with positionTttiAmount (= q).
    positionTokenAmount : Nat;
    positionTttiAmount : Nat;
    // Personal guarantee: 10 000 USD x q in the paid token, rounded down.
    guaranteeAmount : Nat;
    // 1 % of payAmount, rounded down, set aside for the creator.
    creatorAmount : Nat;
    // payAmount - position - guarantee - creator: rounding dust, stays with the pool side.
    dustAmount : Nat;
    // Ledger fee the minter also bears on top of payAmount (ICRC-2 pull).
    ledgerFee : Nat;
    // Target pool TTTI-T/<paid token>.
    poolId : PoolId;
    firstDeposit : Bool;
    // Pool state before the zap swap and after zap + deposit.
    priceBefore : PoolPrice;
    priceAfter : PoolPrice;
    // PTM-5: consolidated TTTI-T price (USD e8) before the operation and after
    // zap + deposit; the pool prices above stay for the target pool detail.
    consolidatedPriceBefore : ConsolidatedMintPrice;
    consolidatedPriceAfter : ConsolidatedMintPrice;
    // null when no swap is needed (balanced pool or first deposit).
    zap : ?ZapSwap;
    // Shares the position would receive.
    shares : Nat;
    quotedAt : Timestamp;
  };

  // --- Mint ------------------------------------------------------------------

  public type MintArgs = {
    token : PayToken;
    quantity : Quantity;
    // Maximum payable, in the paid token's base units (price protection).
    maxPayAmount : Nat;
    // Tolerance on the balancing swap and the deposit ratio; null = 50 (0.5 %).
    slippageBps : ?Nat;
    // After this time (ns) the call is refused before any funds are taken.
    deadline : Timestamp;
    // Owner of the position and of the guarantee. null = the caller. The
    // payer is always the caller.
    recipient : ?Principal;
  };

  // #refunding: the isolated mint core was refused (nothing was minted, no
  // state changed) and the payment is on its way back to the payer through the
  // DW withdrawal number stored in the mint. It becomes #refunded when that
  // withdrawal succeeds and #refundFailed when it fails (the payment then stays
  // withdrawable in the payer's internal balance).
  public type MintStatus = {
    #inProgress;
    #completed;
    #refunding;
    #refunded;
    #refundFailed;
  };

  // The link between a mint and its liquidity position (pool TTTI-T/paid
  // token). The position itself lives in the DEX positions, owned by `owner`,
  // and is removed with the existing removeLiquidity(positionId).
  public type LiquidityMint = {
    id : MintId;
    payer : Principal;
    owner : Principal;
    token : PayToken;
    tttiAmount : Nat;
    payAmount : Nat;
    rateUsdE8 : Nat;
    poolId : PoolId;
    positionId : ?PositionId; // null until the position exists
    paymentBlock : ?Nat;
    status : MintStatus;
    createdAt : Timestamp;
    // DW withdrawal number of the refund; null for mints that were not refunded.
    refundWithdrawalN : ?Nat;
    // Why the isolated mint core refused (short text taken from its trap
    // message, at most 300 characters); null when it did not refuse.
    refusalCause : ?Text;
  };

  public type LiquidityMintResult = {
    mintId : MintId;
    token : PayToken;
    tttiAmount : Nat;
    // Payment collected from the caller (paid token base units).
    payAmount : Nat;
    paymentBlock : Nat;
    owner : Principal;
    poolId : PoolId;
    positionId : PositionId;
    shares : Nat;
    positionTokenAmount : Nat;
    positionTttiAmount : Nat;
    guaranteeAmount : Nat;
    creatorAmount : Nat;
    zap : ?ZapSwap;
    priceBefore : PoolPrice;
    priceAfter : PoolPrice;
    rateUsdE8 : Nat;
    createdAt : Timestamp;
  };

  // Shared by quoteLiquidityMint and mintLiquidity. A query cannot read the
  // ledgers, so #insufficientBalance / #insufficientAllowance and the
  // mint-only errors come from mintLiquidity (nothing taken).
  public type LiquidityMintError = {
    #anonymousCaller;
    #purchaseInProgress;
    #acknowledgementRequired;
    #salesPaused;
    #dexPaused;
    // PTM-9b: what remains to mint is below the minimum of one mint; the
    // remainder goes to the first auction lot.
    #mintEnded;
    // No stored USD rate for the token, or past validUntil + 5 minutes.
    #rateUnavailable : { token : PayToken };
    // Minimum 0.0001 TTTI-T = 10_000 base units; granularity 1 base unit.
    #belowMinimum : { minimumTtti : Nat; granularityTtti : Nat; requestedTtti : Nat };
    // More than 8 decimals: minimum 10_000 base units, granularity 1 base unit.
    #tooManyDecimals : { maxDecimals : Nat; minimumTtti : Nat; granularityTtti : Nat; given : Text };
    #invalidAmount;
    // Total cap 1 TTTI-T: sold + to be returned to the contract + requested.
    #aboveCap : { capTtti : Nat; remainingTtti : Nat; requestedTtti : Nat; soldTtti : Nat; returnedToContractTtti : Nat };
    #poolNotFound : { token : PayToken };
    #poolRemoved;
    #removalAnnounced : { effectiveAt : Timestamp };
    #minimumsNotSet;
    // The pool cannot take the balancing swap or the deposit right now (swaps not open, empty side, other pool refusal).
    #poolUnavailable : { message : Text };
    // Compatibility only: no longer returned (no first-deposit minimum; the
    // first deposit of an empty pool is a 1:1 mint at 10 000 USD per TTTI-T).
    #firstDepositBelowMinimum : { minimumTtti : Nat; requestedTtti : Nat };
    // mintLiquidity only.
    #insufficientBalance : { token : PayToken; balance : Nat; required : Nat };
    #insufficientAllowance : { token : PayToken; allowance : Nat; required : Nat };
    #maxPayExceeded : { payAmount : Nat; maxPayAmount : Nat };
    #invalidSlippage : { maximumBps : Nat };
    #slippageExceeded : { toleranceBps : Nat };
    #deadlineExpired : { deadline : Timestamp; now : Timestamp };
    #ledgerError : { token : PayToken; message : Text };
    // After the payment: the deposit failed and the payment was / was not refunded.
    #depositFailedRefunded : { mintId : MintId };
    #depositFailedRefundFailed : { mintId : MintId };
    // The refund withdrawal is not settled yet (unknown outcome, resent by the
    // retry timer); the mint status follows the withdrawal result.
    #depositFailedRefunding : { mintId : MintId };
  };

  // --- Stored records (amounts only) -----------------------------------------

  // Personal guarantee of one mint, kept in the paid token. Readable by its
  // owner and by an admin only. Rules of use: PTM-2.
  public type Guarantee = {
    mintId : MintId;
    owner : Principal;
    token : PayToken;
    amount : Nat;
    createdAt : Timestamp;
  };

  // 1 % set aside for the creator for one mint. Admin only. Split: PTM-4.
  public type CreatorSetAside = {
    mintId : MintId;
    token : PayToken;
    amount : Nat;
  };

  public type LiquidityMintStore = {
    mints : Map.Map<MintId, LiquidityMint>;
    guarantees : Map.Map<MintId, Guarantee>;
    creatorSetAsides : Map.Map<MintId, CreatorSetAside>;
    var nextMintId : Nat;
  };
};
