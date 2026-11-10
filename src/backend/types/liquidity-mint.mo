import Map "mo:core/Map";
import Common "common";
import Pay "pay-token";
import Dex "dex";
import Router "router";

// PTM-1: the liquidity-forming mint. It replaces the previous purchase for
// every new mint of TTTI-T (already sold TTTI-T is untouched).
//
// Price: 10 000 USD per TTTI-T, the same for everyone, redeemable at 10 000 USD
// at any time. PTM-10b: the minter pays (10 000 USD + L) x q / 0.99 in ICP,
// ckBTC, ckUSDC or ckUSDT at the stored hourly rate, rounded up, where L is the
// liquidity the minter contributes per TTTI-T (and keeps as their own position):
//   - m = the locked share of PTM-10a (scale 10^6), read at payment time.
//     m x q TTTI-T and m x 10 000 USD x q of the paid token are pooled and
//     LOCKED in the minter's name for 3 months (released by the relay at the
//     latest after 3 months); m is recorded with the position and the mint;
//   - the rest (1 - m) is chosen by the minter before paying:
//       #pool   (A): pooled too, (1 - m) x q TTTI-T and (1 - m) x 10 000 USD x q,
//                    no lock; L = 10 000 USD;
//       #wallet (B): (1 - m) x q TTTI-T go to the minter's wallet (DEX balance),
//                    the matching liquidity is not paid; L = m x 10 000 USD;
//   - the reserve part: 10 000 USD x q always goes to the common reserve (PTM-11);
//   - 1 % of the amount paid is set aside for the creator (split: PTM-4).
// TTTI-T never enters a pool without its dollars; the balancing "zap" swap is
// done in that same pool as before, so the pool price moves only through the zap.
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

  // PTM-10b: what the minter does with the share (1 - m) of the mint.
  //   #pool   A: pool it too, with its dollars, no lock
  //   #wallet B: keep the TTTI-T in the wallet, outside the pool, and do not
  //              pay the matching liquidity
  public type RemainderChoice = {
    #pool;
    #wallet;
  };

  // A TTTI-T quantity. #baseUnits is exact. #decimal is a decimal string such
  // as "0.0001" or "0.00012345"; more than 8 fractional digits is refused with
  // #tooManyDecimals.
  public type Quantity = {
    #baseUnits : Nat;
    #decimal : Text;
  };

  // What the minter enters: a TTTI-T quantity, or the total to pay in USD
  // (e8). With #usd the quantity is q = floor(usdE8 x 99 / (10^6 + c)) base
  // units, c = 10^6 for #pool and m for #wallet (scale 10^6), rounded down so
  // the minter never gets more than paid for.
  public type MintAmount = {
    #ttti : Quantity;
    #usd : Nat;
  };

  // --- Quote -----------------------------------------------------------------

  public type QuoteArgs = {
    token : PayToken;
    amount : MintAmount;
    // PTM-10b: the minter's choice for the share (1 - m); selects the figures
    // at the top level of the quote (both choices are always in `choices`).
    choice : RemainderChoice;
    // Manual choice of the target pool. null = the backend recommendation (the
    // eligible TTTI-T/<token> pool with the lowest liquidity). A pool that is
    // not eligible is refused with #invalidTargetPool.
    targetPoolId : ?PoolId;
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

  // PTM-11: the guarantee part (10 000 USD x q) goes to the common reserve,
  // held in the paid token itself (ICP, ckBTC, ckUSDC or ckUSDT): no
  // conversion, no cost added to the amount paid. `applies` is always false.
  public type ReserveConversionQuote = {
    applies : Bool; // always false: the reserve is never converted
    reserveToken : PayToken; // token the reserve part is held in (the paid token)
    reserveAmount : Nat; // 10 000 USD x q in reserveToken base units, credited to the common reserve
    conversionInput : Nat; // paid-token amount swapped (reserve part + conversionCost); 0 without conversion
    conversionCost : Nat; // added to the amount paid, paid-token base units; 0 without conversion
    route : ?Router.Route; // best route; null without conversion
    maxDeviationBps : Nat; // 200: maximum deviation from the hourly average
  };

  // PTM-10b: the figures of one choice for the same q. Token amounts are in the
  // paid token's base units, TTTI-T amounts in base units, USD in e8.
  //   pooledTokenAmount / pooledTttiAmount  the position: locked + free parts
  //   lockedTokenAmount / lockedTttiAmount  the part locked for 3 months (m x ...)
  //   freeTokenAmount / freeTttiAmount      the part pooled without lock (choice #pool)
  //   handTttiAmount                        TTTI-T delivered to the wallet (choice #wallet)
  //   liquidityUsdE8                        the liquidity the minter contributes, USD e8
  //                                         (stays theirs in the position)
  //   payAmount                             (10 000 USD + liquidity) x q / 0.99, rounded up
  //   totalPayAmount                        payAmount + reserve conversion cost
  public type MintChoiceFigures = {
    choice : RemainderChoice;
    payAmount : Nat;
    payUsdE8 : Nat;
    totalPayAmount : Nat;
    conversionCost : Nat;
    liquidityUsdE8 : Nat;
    pooledTokenAmount : Nat;
    pooledTttiAmount : Nat;
    lockedTokenAmount : Nat;
    lockedTttiAmount : Nat;
    freeTokenAmount : Nat;
    freeTttiAmount : Nat;
    handTttiAmount : Nat;
    creatorAmount : Nat;
    dustAmount : Nat;
  };

  public type LiquidityMintQuote = {
    token : PayToken;
    // PTM-10b: locked share m at this moment (scale 10^6) and the selected choice.
    mShareE6 : Nat;
    choice : RemainderChoice;
    // PTM-10b: the figures of both choices (m is the same for both).
    choices : { pool : MintChoiceFigures; wallet : MintChoiceFigures };
    // PTM-10b: TTTI-T delivered to the wallet by the selected choice.
    handTttiAmount : Nat;
    // PTM-10b: part of the position locked for 3 months (selected choice).
    lockedTokenAmount : Nat;
    lockedTttiAmount : Nat;
    // q, in TTTI-T base units; at least 10_000, granularity 1.
    tttiAmount : Nat;
    // USD per whole paid token (e8) and the end of its validity.
    rateUsdE8 : Nat;
    rateValidUntil : Timestamp;
    // (10 000 USD + liquidity) x q / 0.99 in the paid token, rounded up (selected
    // choice); and the same in USD e8.
    payAmount : Nat;
    payUsdE8 : Nat;
    // Position (selected choice): positionTokenAmount is the token side pooled
    // (locked + free), positionTttiAmount the TTTI-T pooled (<= q).
    positionTokenAmount : Nat;
    positionTttiAmount : Nat;
    // PTM-11: guarantee part, 10 000 USD x q in the paid token, rounded down;
    // it goes to the common reserve (see `reserve`).
    guaranteeAmount : Nat;
    // PTM-11: where the guarantee part goes and what its conversion costs.
    reserve : ReserveConversionQuote;
    // payAmount + reserve.conversionCost: what the payer is charged (maxPayAmount applies to it).
    totalPayAmount : Nat;
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
    // The two prices above are the independent reference: the consolidated
    // price of the open pools OTHER than the target pool, so they are equal and
    // do not depend on the target pool's reserves. true when no other pool is
    // open (both #unavailable, no gap).
    noIndependentReference : Bool;
    // null when no swap is needed (balanced pool or first deposit).
    zap : ?ZapSwap;
    // Shares the position would receive.
    shares : Nat;
    quotedAt : Timestamp;
  };

  // --- PTM-11c: mint price figures (query results only, nothing stored) -------
  // Every amount the screens show about the mint price comes from these
  // results; the frontend does no price or fee arithmetic. LiquidityMintQuote
  // above is unchanged.

  // The mint price of one pay token at the current stored rate. Each amount is
  // null while the token has no usable rate. The conversion cost is the
  // estimate of PTM-11 (always 0: the reserve is not converted). "Per whole TTTI-T" means q = 100_000_000 base units.
  public type MintTokenPrice = {
    token : PayToken;
    rateUsdE8 : ?Nat;
    rateValidUntil : ?Timestamp;
    // Choice #pool (A): 20 000 USD / 0.99 in the pay token, rounded up (same
    // rounding as the mint).
    payAmountPerTtti : ?Nat;
    conversionCostPerTtti : ?Nat;
    // payAmountPerTtti + conversionCostPerTtti.
    totalPayAmountPerTtti : ?Nat;
    // Same three figures for the minimum mint (minimumTtti base units).
    minimumPayAmount : ?Nat;
    minimumConversionCost : ?Nat;
    minimumTotalPayAmount : ?Nat;
    // PTM-10b: the same figures for choice #wallet (B), (10 000 USD + m x
    // 10 000 USD) / 0.99 at the current m; the conversion cost is the same.
    walletPayAmountPerTtti : ?Nat;
    walletTotalPayAmountPerTtti : ?Nat;
    walletMinimumPayAmount : ?Nat;
    walletMinimumTotalPayAmount : ?Nat;
  };

  public type MintPricePreview = {
    // PTM-10b: locked share m (scale 10^6) at this moment.
    mShareE6 : Nat;
    // Choice #wallet (B): full mint price of one whole TTTI-T and of the minimum, USD e8.
    pricePerTttiWalletUsdE8 : Nat;
    minimumMintWalletUsdE8 : Nat;
    // Cost in USD (e8) of minting 100 USD of TTTI-T value: 100 / 0.99 = 101.01 USD.
    mintCostPer100UsdE8 : Nat;
    // Cost in USD (e8) of the prepaid redemption of 100 USD: 100 / 0.99 = 101.01 USD.
    prepaidRedemptionCostPer100UsdE8 : Nat;
    // Choice #pool (A): full mint price of one whole TTTI-T in USD (e8): 20 000 / 0.99, rounded up.
    pricePerTttiUsdE8 : Nat;
    // Minimum mint: 10_000 base units, with its cost in USD (e8), rounded up.
    minimumTtti : Nat;
    minimumMintUsdE8 : Nat;
    // One entry per pay token (icp, ckbtc, ckusdc, ckusdt).
    tokens : [MintTokenPrice];
    computedAt : Timestamp;
  };

  // A payment amount in a pay token. `payAmount` is the total the payer spends,
  // conversion cost included, so a balance percentage bar can use it directly.
  public type PaymentToMintArgs = {
    token : PayToken;
    payAmount : Nat;
    choice : RemainderChoice; // PTM-10b
    targetPoolId : ?PoolId; // null = recommendation; otherwise the chosen pool
  };

  // The largest q (base units, granularity 1) whose total pay amount does not
  // exceed the payment, under (10 000 USD + liquidity) x q / 0.99 rounded up as
  // in the mint (liquidity = 10 000 USD for #pool, m x 10 000 USD for #wallet).
  // belowMinimum is returned as an error when q is under the minimum mint.
  public type PaymentToMint = {
    token : PayToken;
    choice : RemainderChoice; // PTM-10b
    mShareE6 : Nat; // PTM-10b: locked share used
    payAmountGiven : Nat;
    tttiAmount : Nat;
    // Amount paid for tttiAmount before the conversion cost, its USD value (e8),
    // the conversion cost and the total charged.
    payAmount : Nat;
    payUsdE8 : Nat;
    conversionCost : Nat;
    totalPayAmount : Nat;
    rateUsdE8 : Nat;
    rateValidUntil : Timestamp;
  };

  public type TttiToPayArgs = {
    token : PayToken;
    tttiAmount : Nat;
    choice : RemainderChoice; // PTM-10b
    targetPoolId : ?PoolId; // null = recommendation; otherwise the chosen pool
  };

  // The pay-token amount for a TTTI-T amount: the mint's own rounding, plus the
  // conversion cost where applicable, for percent bars and rate cards.
  public type TttiToPay = {
    token : PayToken;
    choice : RemainderChoice; // PTM-10b
    mShareE6 : Nat; // PTM-10b: locked share used
    tttiAmount : Nat;
    payAmount : Nat;
    payUsdE8 : Nat;
    conversionCost : Nat;
    totalPayAmount : Nat;
    rateUsdE8 : Nat;
    rateValidUntil : Timestamp;
  };

  // --- Manual choice of the target pool ----------------------------------------

  // One eligible TTTI-T/<pay token> pool (not removed, no removal announced).
  // `price` is in the same unit as the quote and the mint preview (PoolPrice:
  // tokenPerTtti in pay-token base units per whole TTTI-T, usdPerTtti in USD
  // e8). gapBps = (pool usdPerTtti - consolidated) x 10 000 / consolidated,
  // signed; null while the pool is empty or the consolidated price is
  // unavailable. depthUsdE8 is the pool depth at the oracle rate (null when a
  // rate is missing); the recommendation uses the lowest liquidity.
  public type MintPoolOption = {
    poolId : PoolId;
    feeBps : Nat;
    depthUsdE8 : ?Nat;
    price : PoolPrice;
    // Gap against the independent reference (consolidated price without this
    // pool); null while the pool is empty or there is no independent reference.
    gapBps : ?Int;
    referencePrice : ConsolidatedMintPrice;
    noIndependentReference : Bool;
    recommended : Bool;
  };

  // Eligible pools of the pair TTTI-T/<token>, recommended pool first, then by
  // pool id. recommendedPoolId is null when no pool is eligible.
  public type MintPoolList = {
    token : PayToken;
    pools : [MintPoolOption];
    recommendedPoolId : ?PoolId;
    consolidatedPrice : ConsolidatedMintPrice;
    computedAt : Timestamp;
  };

  // Pool price before and after the zap and deposit for the chosen pool
  // (QuoteArgs.targetPoolId; null = the recommendation), next to the
  // reference. Gaps are signed bps against the consolidated price of the other pools.
  public type MintPoolPreview = {
    token : PayToken;
    poolId : PoolId;
    feeBps : Nat;
    isRecommended : Bool;
    recommendedPoolId : ?PoolId;
    tttiAmount : Nat;
    priceBefore : PoolPrice;
    priceAfter : PoolPrice;
    // Independent reference: the consolidated price without the target pool,
    // the same before and after the zap.
    consolidatedPriceBefore : ConsolidatedMintPrice;
    consolidatedPriceAfter : ConsolidatedMintPrice;
    noIndependentReference : Bool;
    gapBeforeBps : ?Int;
    gapAfterBps : ?Int;
    zap : ?ZapSwap;
    firstDeposit : Bool;
    quotedAt : Timestamp;
  };

  // --- Mint ------------------------------------------------------------------

  public type MintArgs = {
    token : PayToken;
    quantity : Quantity;
    // PTM-10b: what to do with the share (1 - m): pool it (#pool, A) or keep
    // the TTTI-T in the wallet (#wallet, B). Required.
    choice : RemainderChoice;
    // Manual choice of the target pool; null = the backend recommendation. The
    // choice is checked again at execution: a pool that has become ineligible
    // is refused with #invalidTargetPool before any funds are taken.
    targetPoolId : ?PoolId;
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

  // The user's final mint choices for ckBTC already held by the contract (BTC
  // deposit path), the same ones the wallet and DEX paths pass to mintLiquidity.
  // Every field is required: without these parameters nothing is minted and the
  // ckBTC stays held for the user (or is refunded to them).
  public type DepositMintParams = {
    targetPoolId : PoolId; // the user's final pool choice
    choice : RemainderChoice; // #pool = A, #wallet = B
    slippageBps : Nat; // tolerance on the balancing swap and the deposit ratio
    maxPayAmount : Nat; // maximum payable in ckBTC base units (conversion cost included)
    deadline : Timestamp; // ns; the frontend sends now + 5 minutes
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

  // The link between a mint and its liquidity positions (pool TTTI-T/paid
  // token). The positions live in the DEX positions, owned by `owner`: the
  // locked one (3 months, m x q) and, with choice #pool, the free one. They are
  // removed with the existing removeLiquidity(positionId) once unlocked.
  // PTM-10b: mShareE6 (scale 10^6), choice and the locked / hand amounts are
  // recorded; mints made before PTM-10b read m = 0, choice #pool.
  public type LiquidityMint = {
    id : MintId;
    payer : Principal;
    owner : Principal;
    token : PayToken;
    tttiAmount : Nat;
    payAmount : Nat;
    rateUsdE8 : Nat;
    poolId : PoolId;
    positionId : ?PositionId; // null until the position exists; the free position, else the locked one
    mShareE6 : Nat; // PTM-10b: locked share m used by this mint (scale 10^6)
    choice : RemainderChoice; // PTM-10b
    lockedPositionId : ?PositionId; // PTM-10b: the 3-month locked position; null when m = 0 or not yet created
    lockedTokenAmount : Nat; // PTM-10b: m x 10 000 USD x q in the paid token, pooled and locked
    lockedTttiAmount : Nat; // PTM-10b: m x q TTTI-T, pooled and locked
    handTttiAmount : Nat; // PTM-10b: TTTI-T left in the wallet by the mint: (1 - m) x q for choice #wallet, plus any unmatched leftover of the deposit
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
    // Payment collected from the caller (paid token base units), without the conversion cost.
    payAmount : Nat;
    paymentBlock : Nat;
    owner : Principal;
    poolId : PoolId;
    // PTM-10b: null when nothing was pooled (choice #wallet with m = 0).
    positionId : ?PositionId; // the free position, else the locked one
    lockedPositionId : ?PositionId;
    freePositionId : ?PositionId;
    mShareE6 : Nat;
    choice : RemainderChoice;
    lockedTokenAmount : Nat;
    lockedTttiAmount : Nat;
    handTttiAmount : Nat; // TTTI-T delivered to the wallet (choice #wallet) + any unmatched leftover of the deposit
    shares : Nat;
    positionTokenAmount : Nat;
    positionTttiAmount : Nat;
    guaranteeAmount : Nat;
    creatorAmount : Nat;
    // PTM-11: token and amount credited to the common reserve, conversion cost
    // added to the payment, and the total charged (payAmount + conversionCost).
    reserveToken : PayToken;
    reserveAmount : Nat;
    conversionCost : Nat;
    totalPaid : Nat;
    zap : ?ZapSwap;
    priceBefore : PoolPrice;
    priceAfter : PoolPrice;
    rateUsdE8 : Nat;
    createdAt : Timestamp;
  };

  public type InvalidTargetReason = {
    #unknownPool;
    #otherPair;
    #removed;
    #removalAnnounced : { effectiveAt : Timestamp };
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
    // PTM-10d: the paid token's rate differs by more than maximumBps (200 =
    // 2 %) between Coinbase and CoinGecko, or has no second source. Nothing is
    // taken from the payer. A rate is null when that feed has no stored value;
    // differenceBps is null when only one feed has a value.
    #rateSourcesDiverge : {
      token : PayToken;
      coinbaseUsdE8 : ?Nat;
      coingeckoUsdE8 : ?Nat;
      differenceBps : ?Nat;
      maximumBps : Nat;
    };
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
    // Manual target pool refused: unknown id, pool of another pair (not
    // TTTI-T/<paid token>), removed pool, or removal announced. Used by quote,
    // previews and mint; the pool errors above remain for the automatic choice.
    #invalidTargetPool : { poolId : PoolId; reason : InvalidTargetReason };
    #minimumsNotSet;
    // The pool cannot take the balancing swap or the deposit right now (swaps not open, empty side, other pool refusal).
    #poolUnavailable : { message : Text };
    // Compatibility only: no longer returned (no first-deposit minimum; the
    // first deposit of an empty pool is a 1:1 mint at 10 000 USD per TTTI-T).
    #firstDepositBelowMinimum : { minimumTtti : Nat; requestedTtti : Nat };
    // mintLiquidity only.
    #insufficientBalance : { token : PayToken; balance : Nat; required : Nat };
    #insufficientAllowance : { token : PayToken; allowance : Nat; required : Nat };
    // PTM-11: payAmount is the total charged, conversion cost included.
    #maxPayExceeded : { payAmount : Nat; maxPayAmount : Nat };
    // PTM-11: kept for compatibility; no longer returned (the reserve is not converted).
    #reserveConversionFailed : { message : Text };
    #reserveConversionDeviation : { deviationBps : Nat; maximumBps : Nat };
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

  // Read-only history of the mints made before PTM-11: the guarantee kept in
  // the paid token for one mint. No new record is written. Readable by its
  // owner and by an admin only.
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
