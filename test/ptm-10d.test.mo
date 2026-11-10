import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import DexLib "../src/backend/lib/dex";
import DexReserveLib "../src/backend/lib/dex-reserve";
import GuaranteeLib "../src/backend/lib/guarantee";
import AuctionLib "../src/backend/lib/auction";
import InflightLib "../src/backend/lib/inflight";
import BatchTypes "../src/backend/types/dex-batch";
import ReserveTypes "../src/backend/types/dex-reserve";
import IcrcLib "../src/backend/lib/icrc";
import RetryLib "../src/backend/lib/retry";
import ProtocolFeesLib "../src/backend/lib/protocol-fees";
import RetryTypes "../src/backend/types/retry";
import DexPotLib "../src/backend/lib/dex-pot";
import MintLib "../src/backend/lib/liquidity-mint";
import OracleLib "../src/backend/lib/oracle";
import DexTypes "../src/backend/types/dex";
import IndicatorTypes "../src/backend/types/dex-indicators";
import MintTypes "../src/backend/types/liquidity-mint";
import OracleTypes "../src/backend/types/oracle";

// PTM-10d: guard rails of the balance sheet. Pure tests that run in the
// interpreter (MintLib.core cannot run here: CertifiedData and traps), so:
//   1. depositAtRatio / withdrawAtRatio / fitAtRatio / ratioHeld (DexLib);
//   2. the mint balance sheet (pure functions of lib/liquidity-mint.mo);
//   3. the mint direction check;
//   4. the two-source rate check (sourceAgreement, rateSourcesVerdict);
//   5. a seeded run of 1 000 operations on a pool.
// A trap cannot be caught in the interpreter: the trapping paths are covered
// through ratioHeld and fitAtRatio, and by the fact that the seeded run
// completes (any trap of the guard rails would stop it).

// --- Pool fixtures --------------------------------------------------------------

let DAY : Int = DexTypes.SHARING_DAY_NS;

let tttiToken : DexTypes.PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
let icpToken : DexTypes.PoolToken = { ledger = #external(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")); symbol = "ICP"; decimals = 8 };

func owner(i : Nat) : Principal {
  Principal.fromBlob(Blob.fromArray([1, Nat8.fromNat(i)]));
};

func poolWith(reserve0 : Nat, reserve1 : Nat, totalShares : Nat) : DexTypes.Pool {
  {
    id = 1;
    token0 = tttiToken;
    token1 = icpToken;
    feeTier = #bps30;
    kind = #tttiPair;
    status = #active;
    createdAt = 0;
    subaccount = Blob.fromArray([]);
    minimumLocked = { token0 = ?1_000; token1 = ?10 };
    newPairBadgeUntil = null;
    requestId = null;
    removedAt = null;
    reserve0;
    reserve1;
    totalShares;
    lockedShares = if (totalShares == 0) 0 else 1_000;
    protocolFee0 = 0;
    protocolFee1 = 0;
    lockedFeesPaid0 = 0;
    lockedFeesPaid1 = 0;
  };
};

func storeWith(pool : DexTypes.Pool) : DexTypes.DexStore {
  let pools = Map.empty<Nat, DexTypes.Pool>();
  pools.add(1, pool);
  {
    pools;
    requests = Map.empty<DexTypes.RequestId, DexTypes.PairRequest>();
    lastRefusalAt = Map.empty<Principal, Int>();
    var nextPoolId = 2;
    var nextRequestId = 1;
    positions = Map.empty<DexTypes.PositionId, DexTypes.Position>();
    var nextPositionId = 100;
    removals = Map.empty<DexTypes.PoolId, DexTypes.PairRemoval>();
    icpswapSamples = Map.empty<Text, DexTypes.IcpSwapSample>();
    referenceReadings = Map.empty<Text, DexTypes.ReferenceReading>();
    poolPositions = Map.empty<DexTypes.PoolId, Set.Set<DexTypes.PositionId>>();
    fees = {
      var dayStart = 0;
      var nextSharingAt = DAY;
      pots = Map.empty<DexTypes.PoolId, DexTypes.PoolPot>();
      locks = Map.empty<DexTypes.PositionId, DexTypes.PositionLock>();
      unpaid = Map.empty<Text, DexTypes.UnpaidShare>();
    };
  };
};

func reservesOf(s : DexTypes.DexStore) : (Nat, Nat) {
  switch (s.pools.get(1)) {
    case (?p) (p.reserve0, p.reserve1);
    case null (0, 0);
  };
};

// Pool at 100 : 1 (TTTI-T : ICP, 8 decimals each).
let R0 : Nat = 100_000_000_000;
let R1 : Nat = 1_000_000_000;

// --- 1. Liquidity functions --------------------------------------------------------

// ratioHeld: the rule |a0 * r1 - a1 * r0| <= max(r0, r1).
do {
  // On the ratio.
  assert DexLib.ratioHeld(R0, R1, R0 + 100, R1 + 1);
  assert DexLib.ratioHeld(R0, R1, R0 + 100_000, R1 + 1_000);
  // Nothing moved.
  assert DexLib.ratioHeld(R0, R1, R0, R1);
  // The same amounts withdrawn.
  assert DexLib.ratioHeld(R0, R1, R0 - 100_000, R1 - 1_000);
  // One unit of rounding on either side holds (cross difference below max).
  assert DexLib.ratioHeld(R0, R1, R0 + 100 + 1, R1 + 1);
  assert DexLib.ratioHeld(R0, R1, R0 + 100 - 1, R1 + 1);
  assert DexLib.ratioHeld(R0, R1, R0 + 100, R1 + 1 + 1);
  // Exactly at the limit: the cross difference equals max(r0, r1) = r0.
  assert DexLib.ratioHeld(R0, R1, R0 + 1_100, R1 + 10);
  // One unit beyond the limit: refused (the deposit would trap).
  assert not DexLib.ratioHeld(R0, R1, R0 + 1_101, R1 + 10);
  assert not DexLib.ratioHeld(R0, R1, R0 + 1_000, R1 + 20);
  // Only one side added or removed.
  assert not DexLib.ratioHeld(R0, R1, R0 + 1_000_000, R1);
  assert not DexLib.ratioHeld(R0, R1, R0, R1 + 1_000_000);
  assert not DexLib.ratioHeld(R0, R1, R0 - 1_000_000, R1);
  // A swap-like move (price changes by 1 %) is not a ratio-preserving change.
  assert not DexLib.ratioHeld(R0, R1, R0 + R0 / 100, R1);
  // No ratio to keep when a reserve was zero before.
  assert DexLib.ratioHeld(0, 0, 5_000, 7);
  assert DexLib.ratioHeld(0, R1, 123, R1 + 77);
  assert DexLib.ratioHeld(R0, 0, R0 + 5, 9);
};

// fitAtRatio: the largest part that fits the ratio, rounded down.
do {
  let pool = poolWith(R0, R1, 1_000_000);
  // Too much token0: token1 limits.
  assert DexLib.fitAtRatio(pool, 1_000, 5) == (500, 5);
  // Too much token1: token0 limits.
  assert DexLib.fitAtRatio(pool, 1_000, 50) == (1_000, 10);
  // Exactly on the ratio: everything fits.
  assert DexLib.fitAtRatio(pool, 20_000, 200) == (20_000, 200);
  // Nothing on one side: nothing fits.
  assert DexLib.fitAtRatio(pool, 1_000, 0) == (0, 0);
  assert DexLib.fitAtRatio(pool, 0, 1_000) == (0, 0);
  // The fitted part never exceeds what is available and holds the ratio.
  for ((a0, a1) in [(1, 1), (99, 1), (101, 1), (7, 9_999), (123_456_789, 98_765), (1_000_000_000_000, 3)].values()) {
    let (p0, p1) = DexLib.fitAtRatio(pool, a0, a1);
    assert p0 <= a0 and p1 <= a1;
    assert DexLib.ratioHeld(R0, R1, R0 + p0, R1 + p1);
  };
  // No ratio when the pool has no shares or a reserve at zero: as they are.
  assert DexLib.fitAtRatio(poolWith(0, 0, 0), 1_000, 5) == (1_000, 5);
  assert DexLib.fitAtRatio(poolWith(R0, R1, 0), 1_000, 5) == (1_000, 5);
  assert DexLib.fitAtRatio(poolWith(0, R1, 10), 1_000, 5) == (1_000, 5);
  assert DexLib.fitAtRatio(poolWith(R0, 0, 10), 1_000, 5) == (1_000, 5);
};

// depositAtRatio / withdrawAtRatio: reserves only, stored, ratio kept.
do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let dep = DexLib.depositAtRatio(s, 1, 10_000, 100);
  assert dep.reserve0 == R0 + 10_000 and dep.reserve1 == R1 + 100;
  assert reservesOf(s) == (R0 + 10_000, R1 + 100);
  // Nothing but the reserves changed.
  assert dep.totalShares == 1_000_000 and dep.lockedShares == 1_000;
  assert dep.protocolFee0 == 0 and dep.protocolFee1 == 0;
  // A deposit with one unit of rounding is accepted.
  let dep2 = DexLib.depositAtRatio(s, 1, 10_001, 100);
  assert dep2.reserve0 == R0 + 20_001;
  // An empty deposit changes nothing.
  let before = reservesOf(s);
  ignore DexLib.depositAtRatio(s, 1, 0, 0);
  assert reservesOf(s) == before;
  // Withdrawal at the ratio.
  let w = DexLib.withdrawAtRatio(s, 1, 10_000, 100);
  assert w.reserve0 == R0 + 10_001 and w.reserve1 == R1 + 100;
  assert reservesOf(s) == (R0 + 10_001, R1 + 100);
  assert w.totalShares == 1_000_000;
  // The whole fitted part of an arbitrary pair is deposited, the rest is not.
  let (put0, put1) = DexLib.fitAtRatio(w, 5_000_000, 12_345);
  let (b0, b1) = reservesOf(s);
  ignore DexLib.depositAtRatio(s, 1, put0, put1);
  let (c0, c1) = reservesOf(s);
  assert c0 == b0 + put0 and c1 == b1 + put1;
  assert DexLib.ratioHeld(b0, b1, c0, c1);
};

// First deposit: no shares, no ratio to keep.
do {
  let s = storeWith(poolWith(0, 0, 0));
  let dep = DexLib.depositAtRatio(s, 1, 1_234_567, 89);
  assert dep.reserve0 == 1_234_567 and dep.reserve1 == 89;
  assert reservesOf(s) == (1_234_567, 89);
};

// A pool whose reserve is at zero takes any deposit (no ratio to keep).
do {
  let s = storeWith(poolWith(0, 500, 10));
  ignore DexLib.depositAtRatio(s, 1, 1_000, 3);
  assert reservesOf(s) == (1_000, 503);
};

// Withdrawal of the whole reserve at once keeps the (empty) ratio.
do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  ignore DexLib.withdrawAtRatio(s, 1, R0, R1);
  assert reservesOf(s) == (0, 0);
};

// --- 2. Mint balance sheet -------------------------------------------------------------

do {
  // paid = counterpart of the position + guarantee + fees (+ ledger fee).
  assert MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 9_900, 100);
  assert MintLib.mintPaymentBalanced(0, 0, 0, 0, 0);
  // Each single-unit difference is refused, on each side.
  assert not MintLib.mintPaymentBalanced(1_000_001, 495_000, 495_000, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(999_999, 495_000, 495_000, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_001, 495_000, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 494_999, 495_000, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_001, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 494_999, 9_900, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 9_901, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 9_899, 100);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 9_900, 101);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 9_900, 99);
  // Without a ledger fee.
  assert MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 10_000, 0);
  assert not MintLib.mintPaymentBalanced(1_000_000, 495_000, 495_000, 10_001, 0);
};

do {
  // PTM-10b: the contributed liquidity is the locked part plus the free part,
  // for choice A (everything pooled) and choice B (only the locked part).
  assert MintLib.mintContributionBalanced(247_500, 247_500, 495_000);
  assert not MintLib.mintContributionBalanced(247_500, 247_501, 495_000);
  assert not MintLib.mintContributionBalanced(247_499, 247_500, 495_000);
  assert MintLib.mintContributionOk(#pool, 495_000, 500_000, 247_500, 247_500);
  assert MintLib.mintContributionOk(#pool, 495_000, 0, 0, 495_000);
  assert not MintLib.mintContributionOk(#pool, 495_000, 500_000, 247_500, 247_499);
  assert MintLib.mintContributionOk(#wallet, 495_000, 500_000, 247_500, 0);
  assert MintLib.mintContributionOk(#wallet, 495_000, 0, 0, 0);
  assert not MintLib.mintContributionOk(#wallet, 495_000, 500_000, 247_500, 1);
  assert not MintLib.mintContributionOk(#wallet, 495_000, 500_000, 247_499, 0);
};

do {
  // minted (+ bought by the zap) = in the position + in hand (+ sold by the zap).
  assert MintLib.mintTttiBalanced(100_000_000, 60_000_000, 40_000_000, 0, 0);
  assert MintLib.mintTttiBalanced(100_000_000, 55_000_000, 40_000_000, 5_000_000, 0);
  assert MintLib.mintTttiBalanced(100_000_000, 65_000_000, 40_000_000, 0, 5_000_000);
  assert MintLib.mintTttiBalanced(100_000_000, 100_000_000, 0, 0, 0);
  // Each single-unit difference is refused.
  assert not MintLib.mintTttiBalanced(100_000_001, 60_000_000, 40_000_000, 0, 0);
  assert not MintLib.mintTttiBalanced(99_999_999, 60_000_000, 40_000_000, 0, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 60_000_001, 40_000_000, 0, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 59_999_999, 40_000_000, 0, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 60_000_000, 40_000_001, 0, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 60_000_000, 39_999_999, 0, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 55_000_000, 40_000_000, 5_000_001, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 55_000_000, 40_000_000, 4_999_999, 0);
  assert not MintLib.mintTttiBalanced(100_000_000, 65_000_000, 40_000_000, 0, 5_000_001);
  assert not MintLib.mintTttiBalanced(100_000_000, 65_000_000, 40_000_000, 0, 4_999_999);
};

// --- 3. Mint direction ---------------------------------------------------------------------

do {
  // ckBTC at 100 000 USD: 10 000 USD per TTTI-T = 0.1 ckBTC = 10_000_000 units.
  let btcRate = 100_000 * 100_000_000;
  let target = MintLib.mintTargetTokenPerTtti(btcRate, 100_000_000);
  assert target == 10_000_000;
  // ICP at 500 USD (8 decimals): 20 ICP per TTTI-T.
  assert MintLib.mintTargetTokenPerTtti(500 * 100_000_000, 100_000_000) == 2_000_000_000;
  // ckUSDC at 1 USD (6 decimals): 10 000 ckUSDC per TTTI-T.
  assert MintLib.mintTargetTokenPerTtti(100_000_000, 1_000_000) == 10_000_000_000;
  // Without a rate there is no target.
  assert MintLib.mintTargetTokenPerTtti(0, 100_000_000) == 0;

  let slack = MintLib.DIRECTION_SLACK_UNITS;
  assert slack == 16;
  let unit = 100_000_000; // one TTTI-T in the pool
  // Pool priced above the target (too many tokens per TTTI-T): 2 ckBTC/TTTI-T.
  let before = (unit, 2 * target);
  // A mint toward 10 000 USD: true.
  assert MintLib.mintDirectionOk(before, (unit, 15 * target / 10), target, slack);
  assert MintLib.mintDirectionOk(before, (unit, target + 1_000), target, slack);
  // Reaching the target (within the rounding allowance): true.
  assert MintLib.mintDirectionOk(before, (unit, target), target, slack);
  assert MintLib.mintDirectionOk(before, (unit, target + slack), target, slack);
  assert MintLib.mintDirectionOk(before, (unit, target - slack), target, slack);
  // Equal: true.
  assert MintLib.mintDirectionOk(before, before, target, slack);
  // Crossing 10 000 USD to the other side: false.
  assert not MintLib.mintDirectionOk(before, (unit, target / 2), target, slack);
  assert not MintLib.mintDirectionOk(before, (unit, target - slack - 1), target, slack);
  // Moving away from 10 000 USD: false.
  assert not MintLib.mintDirectionOk(before, (unit, 3 * target), target, slack);
  assert not MintLib.mintDirectionOk(before, (unit, 2 * target + 1_000), target, slack);

  // Same on the other side: a pool priced below the target.
  let low = (unit, target / 2);
  assert MintLib.mintDirectionOk(low, (unit, 3 * target / 4), target, slack);
  assert MintLib.mintDirectionOk(low, low, target, slack);
  assert MintLib.mintDirectionOk(low, (unit, target), target, slack);
  assert not MintLib.mintDirectionOk(low, (unit, 2 * target), target, slack);
  assert not MintLib.mintDirectionOk(low, (unit, target / 4), target, slack);

  // A pool already on the target stays on it; leaving it either way is refused.
  let on = (unit, target);
  assert MintLib.mintDirectionOk(on, (unit, target + 5), target, slack);
  assert MintLib.mintDirectionOk(on, (2 * unit, 2 * target), target, slack);
  assert not MintLib.mintDirectionOk(on, (unit, target + 1_000), target, slack);
  assert not MintLib.mintDirectionOk(on, (unit, target - 1_000), target, slack);

  // A larger allowance (the dust of the mint) widens the band.
  assert MintLib.mintDirectionOk(on, (unit, target + 1_000), target, slack + 1_000);
  // A pool with nothing before counts as on the target.
  assert MintLib.mintDirectionOk((0, 0), (unit, target), target, slack);
  assert not MintLib.mintDirectionOk((0, 0), (unit, 3 * target), target, slack);
  assert MintLib.mintDirectionOk((0, 0), (0, 0), target, slack);
};

// --- 4. Two-source rates -------------------------------------------------------------------------

do {
  assert MintLib.MAX_SOURCE_DIFFERENCE_BPS == 200;
  // 0 percent.
  let zero = MintLib.sourceAgreement(100_000, 100_000);
  assert zero.differenceBps == 0 and zero.agree;
  // Exactly 2 percent (measured against the lower rate): agree.
  let exact = MintLib.sourceAgreement(100_000, 102_000);
  assert exact.differenceBps == 200 and exact.agree;
  assert MintLib.sourceAgreement(102_000, 100_000) == exact;
  // Just above 2 percent: not agree, difference rounded up.
  let above = MintLib.sourceAgreement(100_000, 102_001);
  assert above.differenceBps == 201 and not above.agree;
  assert MintLib.sourceAgreement(102_001, 100_000) == above;
  // Measured against the lower rate: 100 vs 98 is 2.04 %, not 2 %.
  let lower = MintLib.sourceAgreement(98_000, 100_000);
  assert lower.differenceBps == 205 and not lower.agree;
  // A BTC rate diverging by 30 percent: 3 000 bps.
  let btc = MintLib.sourceAgreement(100_000 * 100_000_000, 130_000 * 100_000_000);
  assert btc.differenceBps == 3_000 and not btc.agree;
  // Small differences agree.
  let small = MintLib.sourceAgreement(100_000 * 100_000_000, 100_050 * 100_000_000);
  assert small.differenceBps == 5 and small.agree;
  // A zero rate never agrees.
  assert not MintLib.sourceAgreement(0, 100_000).agree;
  assert not MintLib.sourceAgreement(100_000, 0).agree;
  assert not MintLib.sourceAgreement(0, 0).agree;
};

let NOW : Int = 1_900_000_000_000_000_000;
let BTC_RATE : Nat = 100_000 * 100_000_000;

func priceWith(source : OracleTypes.PriceSource, usdE8 : Nat, usable : Bool, second : ?OracleTypes.SecondSourceObservation) : OracleTypes.TokenPrice {
  {
    secondSource = second;
    token = #ckbtc;
    pair = "BTC-USD";
    usdE8;
    source;
    fetchedAt = NOW - 60_000_000_000;
    validUntil = NOW + 3_540_000_000_000;
    usable;
    lastError = null;
    lastSuccessAt = ?(NOW - 60_000_000_000);
  };
};

func observation(source : OracleTypes.PriceSource, usdE8 : Nat, fetchedAt : Int) : ?OracleTypes.SecondSourceObservation {
  ?{ source; usdE8; fetchedAt };
};

func verdict(price : OracleTypes.TokenPrice) : { #ok; #diverge : MintTypes.LiquidityMintError; #other : MintTypes.LiquidityMintError } {
  switch (MintLib.rateSourcesVerdict(#ckbtc, price, NOW)) {
    case (#ok(_)) #ok;
    case (#err(#rateSourcesDiverge(r))) #diverge(#rateSourcesDiverge(r));
    case (#err(e)) #other(e);
  };
};

do {
  // Two fresh rates that agree: ok, whichever source is the stored one.
  let fresh = NOW - 600_000_000_000;
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, BTC_RATE + BTC_RATE / 100, fresh)), NOW) == #ok(());
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coingecko, BTC_RATE, true, observation(#coinbase, BTC_RATE - BTC_RATE / 100, fresh)), NOW) == #ok(());
  // Exactly 2 percent agrees.
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, BTC_RATE + 2 * BTC_RATE / 100, fresh)), NOW) == #ok(());
  // Second source fetched exactly at the end of its freshness: still fresh.
  let edge = NOW - OracleLib.VALID_FOR_NS - OracleLib.GRACE_NS;
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, BTC_RATE, edge)), NOW) == #ok(());
};

do {
  // A BTC rate that diverges by 30 percent: refused, with the numbers.
  let fresh = NOW - 600_000_000_000;
  let other = BTC_RATE + 30 * BTC_RATE / 100;
  let expected : MintTypes.LiquidityMintError = #rateSourcesDiverge({
    token = #ckbtc;
    coinbaseUsdE8 = ?BTC_RATE;
    coingeckoUsdE8 = ?other;
    differenceBps = ?3_000;
    maximumBps = 200;
  });
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, other, fresh)), NOW) == #err(expected);
  // The stored one is CoinGecko, the other one Coinbase.
  let swapped : MintTypes.LiquidityMintError = #rateSourcesDiverge({
    token = #ckbtc;
    coinbaseUsdE8 = ?other;
    coingeckoUsdE8 = ?BTC_RATE;
    differenceBps = ?3_000;
    maximumBps = 200;
  });
  assert MintLib.rateSourcesVerdict(#ckbtc, priceWith(#coingecko, BTC_RATE, true, observation(#coinbase, other, fresh)), NOW) == #err(swapped);
  // Just above 2 percent.
  switch (verdict(priceWith(#coinbase, 100_000, true, observation(#coingecko, 102_001, fresh)))) {
    case (#diverge(#rateSourcesDiverge(r))) { assert r.differenceBps == ?201 and r.maximumBps == 200 };
    case (_) { assert false };
  };
};

do {
  let fresh = NOW - 600_000_000_000;
  // Missing second source.
  switch (verdict(priceWith(#coinbase, BTC_RATE, true, null))) {
    case (#diverge(#rateSourcesDiverge(r))) {
      assert r.coinbaseUsdE8 == ?BTC_RATE and r.coingeckoUsdE8 == null and r.differenceBps == null and r.maximumBps == 200;
      assert r.token == #ckbtc;
    };
    case (_) { assert false };
  };
  // Stale second source (one nanosecond past its freshness).
  let stale = NOW - OracleLib.VALID_FOR_NS - OracleLib.GRACE_NS - 1;
  switch (verdict(priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, BTC_RATE, stale)))) {
    case (#diverge(#rateSourcesDiverge(r))) { assert r.coingeckoUsdE8 == null and r.differenceBps == null };
    case (_) { assert false };
  };
  // Unusable second source (zero rate).
  switch (verdict(priceWith(#coinbase, BTC_RATE, true, observation(#coingecko, 0, fresh)))) {
    case (#diverge(#rateSourcesDiverge(r))) { assert r.coingeckoUsdE8 == null and r.differenceBps == null };
    case (_) { assert false };
  };
  // The second source with no source tag counts for nothing.
  switch (verdict(priceWith(#coinbase, BTC_RATE, true, observation(#none, BTC_RATE, fresh)))) {
    case (#diverge(_)) {};
    case (_) { assert false };
  };
  // Both observations from the same source: the other feed is missing.
  switch (verdict(priceWith(#coinbase, BTC_RATE, true, observation(#coinbase, BTC_RATE, fresh)))) {
    case (#diverge(#rateSourcesDiverge(r))) { assert r.coingeckoUsdE8 == null };
    case (_) { assert false };
  };
  // The stored rate itself is not usable: rateUnavailable, not a divergence.
  switch (verdict(priceWith(#coinbase, BTC_RATE, false, observation(#coingecko, BTC_RATE, fresh)))) {
    case (#other(#rateUnavailable(r))) { assert r.token == #ckbtc };
    case (_) { assert false };
  };
  switch (verdict(priceWith(#none, 0, false, null))) {
    case (#other(#rateUnavailable(_))) {};
    case (_) { assert false };
  };
};

// --- 5. Seeded run of 1 000 operations -------------------------------------------------------------------

// Linear congruential generator, fixed seed (64 bits, high bits used).
let TWO_64 : Nat = 18_446_744_073_709_551_616;
var seed : Nat = 20_261_103;

func nextRandom() : Nat {
  seed := (seed * 6_364_136_223_846_793_005 + 1_442_695_040_888_963_407) % TWO_64;
  seed / 4_294_967_296;
};

// Uniform-ish number below `bound` (0 when bound is 0).
func rnd(bound : Nat) : Nat {
  if (bound == 0) 0 else nextRandom() % bound;
};

// The generator is deterministic: the first draws are fixed by the seed.
do {
  let saved = seed;
  seed := 1;
  let a = nextRandom();
  let b = nextRandom();
  seed := 1;
  assert nextRandom() == a and nextRandom() == b;
  assert a != b;
  seed := saved;
};

func indicatorsStore() : IndicatorTypes.IndicatorsStore {
  {
    var snapshot = null;
    var lastComputedAt = null;
    var lastError = null;
    var lastSuccessAt = null;
    var recordingSince = null;
    activity = Map.empty<Nat, IndicatorTypes.PoolActivity>();
  };
};

// ICP at 500 USD: the pool is deep enough for swaps.
func rateOf(token : DexTypes.PoolToken) : ?Nat {
  if (token.symbol == "ICP") ?(500 * 100_000_000) else null;
};

let USERS : Nat = 6;
let canister = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");

// Everything held by the DEX for `token`, from the point of view of the
// per-token balance sheet: pool reserves, protocol fees, the fee pot (pending
// and being shared) and the internal balances of the users.
func heldOf(s : DexTypes.DexStore, balances : DexTypes.DexBalances, token : DexTypes.DexToken) : Nat {
  var total = 0;
  for (pool in s.pools.values()) {
    let (pot0, pot1) = DexLib.potOwed(s, pool.id);
    if (DexLib.poolDexToken(pool.token0) == ?token) total += pool.reserve0 + pool.protocolFee0 + pot0;
    if (DexLib.poolDexToken(pool.token1) == ?token) total += pool.reserve1 + pool.protocolFee1 + pot1;
  };
  for (i in Nat.range(0, USERS)) {
    total += DexLib.available(balances, owner(i), token);
  };
  total;
};

// The pure checks of a mint, on random numbers: the balanced sheet is accepted
// and every single-unit difference is refused (point 2), and the direction
// rule (point 3).
func checkMintInvariants() {
  // Payment.
  let counterpart = 1 + rnd(1_000_000_000);
  let fees = rnd(10_000_000);
  let ledgerFee = rnd(100_000);
  let paid = counterpart + counterpart + fees + ledgerFee;
  assert MintLib.mintPaymentBalanced(paid, counterpart, counterpart, fees, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid + 1, counterpart, counterpart, fees, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid - 1, counterpart, counterpart, fees, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid, counterpart + 1, counterpart, fees, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid, counterpart, counterpart + 1, fees, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid, counterpart, counterpart, fees + 1, ledgerFee);
  assert not MintLib.mintPaymentBalanced(paid, counterpart, counterpart, fees, ledgerFee + 1);
  assert MintLib.mintContributionOk(#pool, counterpart, 0, 0, counterpart);
  assert not MintLib.mintContributionOk(#pool, counterpart, 0, 0, counterpart + 1);
  assert not MintLib.mintContributionOk(#pool, counterpart, 0, 1, counterpart);
  // TTTI-T.
  let inPosition = 1 + rnd(1_000_000_000);
  let inHand = rnd(1_000_000_000);
  let zapSold = rnd(500_000_000);
  let zapBought = rnd(500_000_000);
  let minted = inPosition + inHand + zapSold - Nat.min(zapBought, inPosition + inHand + zapSold);
  let bought = Nat.min(zapBought, inPosition + inHand + zapSold);
  assert MintLib.mintTttiBalanced(minted, inPosition, inHand, zapSold, bought);
  assert not MintLib.mintTttiBalanced(minted + 1, inPosition, inHand, zapSold, bought);
  assert not MintLib.mintTttiBalanced(minted, inPosition + 1, inHand, zapSold, bought);
  assert not MintLib.mintTttiBalanced(minted, inPosition, inHand + 1, zapSold, bought);
  assert not MintLib.mintTttiBalanced(minted, inPosition, inHand, zapSold + 1, bought);
  assert not MintLib.mintTttiBalanced(minted, inPosition, inHand, zapSold, bought + 1);
  // Direction: random target, pool away from it by more than the allowance.
  let rt = 100_000_000 * (1 + rnd(50));
  let targetPrice = 1_000_000 + rnd(1_000_000_000);
  let onTarget = targetPrice * rt / 100_000_000;
  let gapBefore = 1_000 + rnd(onTarget);
  let upper = rnd(2) == 0;
  let beforeToken = if (upper) onTarget + gapBefore else if (gapBefore < onTarget) onTarget - gapBefore else onTarget / 2;
  let beforeDist = Int.abs(beforeToken.toInt() - onTarget.toInt());
  let sign : Int = if (beforeToken > onTarget) 1 else -1;
  func at(distance : Nat) : Nat = Int.abs(onTarget.toInt() + sign * distance.toInt());
  func across(distance : Nat) : Nat = Int.abs(onTarget.toInt() - sign * distance.toInt());
  let slack = MintLib.DIRECTION_SLACK_UNITS;
  let before = (rt, beforeToken);
  assert MintLib.mintDirectionOk(before, before, targetPrice, slack);
  assert MintLib.mintDirectionOk(before, (rt, at(beforeDist / 2)), targetPrice, slack);
  assert MintLib.mintDirectionOk(before, (rt, onTarget), targetPrice, slack);
  assert not MintLib.mintDirectionOk(before, (rt, at(beforeDist + 1_000)), targetPrice, slack);
  assert not MintLib.mintDirectionOk(before, (rt, across(1_000 + slack)), targetPrice, slack);
};

do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  let indicators = indicatorsStore();
  var now : Int = DAY / 4;
  // Funds that entered / left the DEX from outside, per token.
  var in0 = R0;
  var in1 = R1;
  var out0 = 0;
  var out1 = 0;

  var adds = 0;
  var removes = 0;
  var swaps = 0;
  var injects = 0;
  var deposits = 0;
  var withdrawals = 0;
  var rolls = 0;
  var refused = 0;

  // Starting balances.
  for (i in Nat.range(0, USERS)) {
    DexLib.credit(balances, owner(i), #tttiT, 5_000_000_000);
    DexLib.credit(balances, owner(i), #icp, 50_000_000);
    in0 += 5_000_000_000;
    in1 += 50_000_000;
  };

  var op = 0;
  while (op < 1_000) {
    op += 1;
    let (before0, before1) = reservesOf(s);
    var changesPrice = false; // only a swap may
    now += 600_000_000_000 + rnd(7_200_000_000_000); // 10 minutes to 2 hours and 10 minutes
    let who = owner(rnd(USERS));
    let kind = rnd(100);
    if (kind < 12) {
      // Deposit / withdrawal of a user (outside funds).
      let token : DexTypes.DexToken = if (rnd(2) == 0) #tttiT else #icp;
      let amount = if (token == #tttiT) 1 + rnd(2_000_000_000) else 1 + rnd(20_000_000);
      if (rnd(3) == 0) {
        let have = DexLib.available(balances, who, token);
        let take = Nat.min(have, amount);
        if (DexLib.debit(balances, who, token, take)) {
          withdrawals += 1;
          if (token == #tttiT) { out0 += take } else { out1 += take };
        };
      } else {
        DexLib.credit(balances, who, token, amount);
        deposits += 1;
        if (token == #tttiT) { in0 += amount } else { in1 += amount };
      };
    } else if (kind < 34) {
      // Position of a user.
      let side : DexTypes.PoolSide = if (rnd(2) == 0) #token0 else #token1;
      let amount = if (side == #token0) 1_000 + rnd(2_000_000_000) else 10 + rnd(20_000_000);
      let lock : ?Nat = if (rnd(8) == 0) ?(DexLib.MIN_LOCK_NS + rnd(DexLib.MIN_LOCK_NS)) else null;
      switch (DexLib.addLiquidity(s, balances, canister, who, false, { poolId = 1; side; amount; counterAmount = null; slippageBps = null; lockDurationNs = lock }, rateOf, now)) {
        case (#ok(_)) { adds += 1 };
        case (#err(_)) { refused += 1 };
      };
    } else if (kind < 46) {
      // Removal of a position (any position, by its owner).
      let ids = s.positions.keys().toArray();
      if (ids.size() > 0) {
        let id = ids[rnd(ids.size())];
        switch (s.positions.get(id)) {
          case (?p) {
            switch (DexLib.removeLiquidity(s, balances, canister, p.owner, id, rateOf, now)) {
              case (#ok(_)) { removes += 1 };
              case (#err(_)) { refused += 1 };
            };
          };
          case null {};
        };
      };
    } else if (kind < 76) {
      // Swap (the only operation that moves the price).
      changesPrice := true;
      let tokenIn : DexTypes.DexToken = if (rnd(2) == 0) #tttiT else #icp;
      let reserveIn = if (tokenIn == #tttiT) before0 else before1;
      let amountIn = 1 + rnd(Nat.max(1, reserveIn / 20));
      let kBefore = before0 * before1;
      switch (DexLib.swap(s, balances, canister, who, 1, tokenIn, amountIn, 0, now + 60_000_000_000, false, rateOf, now, indicators)) {
        case (#ok(_)) {
          swaps += 1;
          let (a0, a1) = reservesOf(s);
          // The product of the reserves never decreases on a swap.
          assert a0 * a1 >= kBefore;
        };
        case (#err(_)) { refused += 1 };
      };
    } else if (kind < 88) {
      // Reinjection / auction settlement / refused deposit / permanent
      // liquidity: whatever fits the ratio goes through depositAtRatio.
      let pool = switch (s.pools.get(1)) {
        case (?p) p;
        case null { assert false; poolWith(0, 0, 0) };
      };
      let a0 = rnd(1_000_000_000);
      let a1 = rnd(10_000_000);
      let (put0, put1) = DexLib.fitAtRatio(pool, a0, a1);
      ignore DexLib.depositAtRatio(s, 1, put0, put1);
      in0 += put0;
      in1 += put1;
      injects += 1;
    } else {
      // Time passes: a few hours to a few days (the day roll follows).
      now += rnd(3 * Int.abs(DAY));
    };

    // Point 1 for the operation itself: only a swap changes the price.
    let (mid0, mid1) = reservesOf(s);
    if (not changesPrice) {
      assert DexLib.ratioHeld(before0, before1, mid0, mid1);
    };

    // The daily pass: the fee pot is shared and the remainder goes back to the
    // reserves at the pool ratio (never a price change, even after a swap).
    let roll = DexPotLib.startDayRoll(s, now);
    if (roll.rolled) {
      rolls += 1;
      var more = true;
      var calls = 0;
      while (more and calls < 10_000) {
        more := DexPotLib.runSlice(s, balances, 1, 5).more;
        calls += 1;
      };
      assert not more;
      let (after0, after1) = reservesOf(s);
      assert DexLib.ratioHeld(mid0, mid1, after0, after1);
    };

    // Point 5: per-token balance sheet. Everything that entered the DEX is held
    // in the pools, the fee pots or the balances.
    assert heldOf(s, balances, #tttiT) + out0 == in0;
    assert heldOf(s, balances, #icp) + out1 == in1;

    // Points 2 and 3: the pure checks of a mint hold.
    checkMintInvariants();
  };

  // The run really exercised every kind of operation.
  assert adds >= 20;
  assert removes >= 10;
  assert swaps >= 50;
  assert injects >= 20;
  assert deposits >= 10;
  assert withdrawals >= 5;
  assert rolls >= 5;
  assert refused > 0;

  // A pair removal at the end: positions liquidated, the fee pot returned to
  // the reserves only as far as it fits the ratio, and the totals still hold.
  let announced = DexLib.announceRemoval(s, 1, "end of the run", now);
  assert announced == #ok(switch (s.pools.get(1)) { case (?p) p; case null { assert false; poolWith(0, 0, 0) } });
  now += DexLib.REMOVAL_NOTICE_NS;
  assert DexLib.startRemovalExecution(s, 1, now);
  for (id in s.positions.keys().toArray().values()) {
    let (b0, b1) = reservesOf(s);
    switch (DexLib.liquidatePosition(s, balances, id)) {
      case (#ok(_)) {};
      case (#err(_)) { assert false };
    };
    let (a0, a1) = reservesOf(s);
    assert DexLib.ratioHeld(b0, b1, a0, a1);
    assert heldOf(s, balances, #tttiT) + out0 == in0;
    assert heldOf(s, balances, #icp) + out1 == in1;
  };
  let (e0, e1) = reservesOf(s);
  let owedBefore = DexLib.potOwed(s, 1);
  switch (DexLib.finishRemoval(s, 1, now)) {
    case (#ok(p)) { assert p.status == #removed };
    case (#err(_)) { assert false };
  };
  let (f0, f1) = reservesOf(s);
  assert DexLib.ratioHeld(e0, e1, f0, f1);
  // What went back to the reserves left the pot; the rest is still owed.
  let owedAfter = DexLib.potOwed(s, 1);
  assert (f0 - e0) + owedAfter.0 == owedBefore.0;
  assert (f1 - e1) + owedAfter.1 == owedBefore.1;
  assert heldOf(s, balances, #tttiT) + out0 == in0;
  assert heldOf(s, balances, #icp) + out1 == in1;
};

// --- 6. Per-token balance sheet of the reserve check ----------------------------------------

func newBatch() : BatchTypes.BatchStore {
  {
    var batchSize = 25;
    reserve = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var targetIndex = 0;
      var accountIndex = 0;
      var partialLedger = 0;
      var owedSnapshot = null;
      var accountsToCompare = 0;
      var accountsCompared = 0;
      var excludedZero = 0;
      var unreadable = 0;
      var lastBatchAt = null;
      var batches = 0;
      var totalBatches = 0;
    };
    sweep = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var tokenIndex = 0;
      var accountIndex = 0;
      var batches = 0;
      var lastBatchAt = null;
      progress = Map.empty();
    };
    var alert = null;
    var nextAlertId = 0;
    alertHistory = List.empty();
    zeroed = Map.empty();
    reread = {
      var active = false;
      var runId = 0;
      var startedAt = null;
      var lastKey = null;
      var read = 0;
      var reincluded = 0;
      var unreadable = 0;
      var lastBatchAt = null;
      var lastFinishedAt = null;
    };
  };
};

func newReserveStore() : ReserveTypes.DexReserveStore {
  {
    var lastCheck = null;
    history = List.empty();
    pause = { var paused = false; var reason = null; var resumed = null };
    var accounts = [];
    accountHistory = List.empty();
    var pauseAccount = null;
  };
};


func oracleStore() : OracleLib.OracleStore {
  { var usdE8 = 0; var source = #none; var fetchedAt = 0; var validUntil = 0; var lastError = null; var lastSuccessAt = null };
};

// A complete reserve context built from empty stores around the given pool
// store. Every reference is real; nothing reaches a ledger.
func reserveContext(dexStore : DexTypes.DexStore, balances : DexTypes.DexBalances) : DexReserveLib.ReserveContext {
  let reserve = newReserveStore();
  let batch = newBatch();
  let retry : RetryTypes.RetryStore = { var nextN = 0; forwards = Map.empty(); shares = Map.empty(); refunds = Map.empty(); traces = Map.empty(); toRefund = Map.empty(); btcCosts = Map.empty() };
  let ledger : IcrcLib.Ledger = {
    balances = Map.empty();
    approvals = Map.empty();
    blocks = Map.empty();
    state = { var totalSupply = 0; var fee = 0; var nextBlockIndex = 0; legacyBlockBoundary = 0; var lastBlockHash = null };
    dedup = Map.empty();
    dedupQueue = Map.empty();
  };
  let dexContext : RetryLib.DexContext = {
    retry;
    transfers = { deposits = Map.empty(); withdrawals = Map.empty(); pairRefunds = Map.empty(); liquidations = Map.empty() };
    balances;
    dex = dexStore;
    payments = Map.empty();
    ledger;
    locks = Set.empty<Text>();
    canister;
    pause = reserve.pause;
    indicators = indicatorsStore();
    batch;
    onWithdrawal = func(_ : Nat, _ : DexTypes.DexTransferStatus) {};
  };
  let protocol : ProtocolFeesLib.ProtocolFeeContext = {
    store = {
      buckets = Map.empty();
      priceSamples = Map.empty();
      batches = List.empty();
      var nextBatchId = 0;
      var lastBatchAt = null;
      dcSends = Map.empty();
      var bonusUndistributedE8s = 0;
      bonusClaimable = Map.empty();
      bonusClaimed = Map.empty();
      bonusDistributions = List.empty();
      var nextDistributionId = 0;
      bonusClaims = Map.empty();
      protocolLiquidity = Map.empty();
      var cyclesHeldE8s = 0;
      dcLegs = Map.empty();
    };
    dex = dexStore;
    retry;
    ledger;
    locks = Set.empty<Text>();
    canister;
    mintFees = {
      claimable = Map.empty();
      claimed = Map.empty();
      claims = Map.empty();
      routings = List.empty();
      var nextRoutingId = 0;
      setAside = Map.empty();
      injections = Map.empty();
      var nextInjectionId = 0;
    };
    oracle = oracleStore();
    tokenRates = { ckbtc = oracleStore(); ckusdc = oracleStore(); ckusdt = oracleStore() };
    refusedFeeds = Map.empty();
    payments = dexContext.payments;
    pause = reserve.pause;
    creator = { totals = Map.empty(); payouts = Map.empty() };
    permanent = { setAside = Map.empty(); log = List.empty(); var nextLogId = 0; lastWaiting = Map.empty() };
    consolidated = { samples = List.empty() };
    ratioSamples = { samples = List.empty() };
  };
  let inflight = InflightLib.emptyStore();
  {
    store = reserve;
    lock = { var busy = false };
    dex = dexContext;
    fees = protocol;
    router = {
      store = { swaps = Map.empty(); var nextSwapId = 0; feeTotals = Map.empty(); setAside = Map.empty(); redirected = Map.empty() };
      dex = dexContext;
      locks = Set.empty<Text>();
      protocol;
      ownerIndex = Map.empty();
      inflight;
    };
    auction = AuctionLib.newStore();
    closing = AuctionLib.newClosingStore();
    inflight;
    batch;
    guaranteeAccount = Map.empty();
    breakdown = DexReserveLib.emptyBreakdownCache();
  };
};

func rowTotal(r : ReserveTypes.TokenBalanceBreakdown) : Nat {
  r.poolReserves + r.guarantees + r.creatorHoldings + r.dexBalances + r.permanentLiquidity + r.requestDeposits + r.auctionDeposits + r.inFlight;
};

do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner(1), #tttiT, 7_000);
  DexLib.credit(balances, owner(2), #icp, 400);
  let ctx = reserveContext(s, balances);

  // The components of ICP: the pool reserve and the user balance.
  let icp = DexReserveLib.breakdownOf(ctx, #icp, R1 + 400);
  assert icp.poolReserves == R1;
  assert icp.dexBalances == 400;
  assert icp.guarantees == 0 and icp.creatorHoldings == 0 and icp.permanentLiquidity == 0;
  assert icp.requestDeposits == 0 and icp.auctionDeposits == 0 and icp.inFlight == 0;
  // The total is the sum of the parts; equal to the ledger balance: no mismatch.
  assert icp.total == rowTotal(icp) and icp.total == R1 + 400;
  assert icp.difference == 0 and icp.status == #ok;
  // The same token against the sum of the pieces of the DEX (cross check).
  assert icp.total == DexReserveLib.internalTotal(ctx, #icp);

  // A difference on one token only: ICP is one unit short, TTTI-T is fine.
  let short = DexReserveLib.breakdownOf(ctx, #icp, R1 + 399);
  assert short.status == #shortfall and short.difference == -1;
  let over = DexReserveLib.breakdownOf(ctx, #icp, R1 + 401);
  assert over.status == #surplus and over.difference == 1;
  let tttiRow = DexReserveLib.breakdownOf(ctx, #tttiT, R0 + 7_000);
  assert tttiRow.status == #ok and tttiRow.total == R0 + 7_000 and tttiRow.difference == 0;
  assert tttiRow.poolReserves == R0 and tttiRow.dexBalances == 7_000;

  // The fee pot (pending, not yet shared) is part of the pool reserves line.
  let (pot0, pot1) = (500, 5);
  let pot = DexLib.potOf(s, 1);
  pot.pending0 += pot0;
  pot.pending1 += pot1;
  assert DexLib.potOwed(s, 1) == (pot0, pot1);
  assert DexReserveLib.breakdownOf(ctx, #icp, R1 + 400 + pot1).status == #ok;
  assert DexReserveLib.breakdownOf(ctx, #tttiT, R0 + 7_000 + pot0).status == #ok;
  assert DexReserveLib.breakdownOf(ctx, #icp, R1 + 400).status == #shortfall;
};

// The guarantee is counted once: it sits in the contract's own DEX balance and
// in the guarantee account, and the breakdown shows it on its own line.
do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner(2), #icp, 400);
  DexLib.credit(balances, canister, #icp, 300);
  let ctx = reserveContext(s, balances);
  GuaranteeLib.creditAccount(ctx.guaranteeAccount, #icp, 300);
  let r = DexReserveLib.breakdownOf(ctx, #icp, R1 + 700);
  assert r.guarantees == 300 and r.dexBalances == 400 and r.poolReserves == R1;
  assert r.total == rowTotal(r) and r.total == R1 + 700;
  assert r.status == #ok;
  // A guarantee larger than the contract's own balance is added on top.
  GuaranteeLib.creditAccount(ctx.guaranteeAccount, #icp, 50);
  let more = DexReserveLib.breakdownOf(ctx, #icp, R1 + 750);
  assert more.guarantees == 350 and more.dexBalances == 400 and more.total == R1 + 750 and more.status == #ok;
};

// A per-token difference raises a mismatch and pauses the DEX, the same way an
// account difference does (compareTarget is the common recording step).
do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner(2), #icp, 400);
  let ctx = reserveContext(s, balances);
  let owed = DexReserveLib.breakdownOf(ctx, #icp, 0).total;
  let target : DexReserveLib.Target = { kind = #dexHoldings; token = #icp };
  DexReserveLib.beginRun(ctx.batch, 10);
  // Equal: no mismatch, no pause.
  assert DexReserveLib.openTarget(ctx.batch, 1, 0, false, owed) == #reading;
  DexReserveLib.recordBalance(ctx.batch, owed);
  switch (DexReserveLib.compareTarget(ctx.batch, ctx.store, target, 11, null)) {
    case (#compared(r)) { assert r.status == #ok and r.difference == 0 };
    case (#needsConfirm) { assert false };
  };
  assert not ctx.store.pause.paused;
  assert DexReserveLib.shortfallCount(ctx.store) == 0;
  assert ctx.store.accountHistory.size() == 0;
  // One unit short, confirmed by the second read: mismatch recorded, DEX paused.
  assert DexReserveLib.openTarget(ctx.batch, 1, 0, false, owed) == #reading;
  DexReserveLib.recordBalance(ctx.batch, owed - 1);
  assert DexReserveLib.compareTarget(ctx.batch, ctx.store, target, 12, null) == #needsConfirm;
  switch (DexReserveLib.compareTarget(ctx.batch, ctx.store, target, 13, ?{ owed; ledger = owed - 1 })) {
    case (#compared(r)) { assert r.status == #shortfall and r.difference == -1 };
    case (#needsConfirm) { assert false };
  };
  assert ctx.store.pause.paused;
  assert ctx.store.accountHistory.size() == 1;
  assert DexReserveLib.shortfallCount(ctx.store) == 1;
  switch (ctx.store.pause.reason) {
    case (?reason) { assert reason.token == #icp and reason.internalTotal == owed and reason.ledgerTotal == owed - 1 };
    case null { assert false };
  };
};

// getDexBalanceBreakdown (breakdownSnapshot): tokens, checkedAt, complete.
do {
  let s = storeWith(poolWith(R0, R1, 1_000_000));
  let balances = Map.empty<Principal, Map.Map<Text, DexTypes.DexBalance>>();
  DexLib.credit(balances, owner(2), #icp, 400);
  let ctx = reserveContext(s, balances);
  // Before any check: nothing to show.
  let empty = DexReserveLib.breakdownSnapshot(ctx);
  assert empty.tokens.size() == 0 and empty.checkedAt == 0 and not empty.complete;

  // After an upgrade (accounts stored, no published run): rebuilt, incomplete.
  ctx.store.accounts := [{ kind = #dexHoldings; accountLabel = "DEX holdings"; token = #icp; ledgerBalance = R1 + 400; owed = R1 + 400; difference = 0; status = #ok; checkedAt = 77 }];
  let rebuilt = DexReserveLib.breakdownSnapshot(ctx);
  assert rebuilt.tokens.size() == 1 and rebuilt.checkedAt == 77 and not rebuilt.complete;
  assert rebuilt.tokens[0].token == #icp and rebuilt.tokens[0].status == #ok and rebuilt.tokens[0].total == R1 + 400;

  // A published complete run is returned as it is, with its time.
  let row = DexReserveLib.breakdownOf(ctx, #icp, R1 + 400);
  ctx.breakdown.published := [row];
  ctx.breakdown.checkedAt := 1_234;
  ctx.breakdown.complete := true;
  let done = DexReserveLib.breakdownSnapshot(ctx);
  assert done.tokens.size() == 1 and done.tokens[0] == row and done.checkedAt == 1_234 and done.complete;
  // Incomplete while a run is in progress, and when a token was not compared.
  ctx.batch.reserve.active := true;
  assert not DexReserveLib.breakdownSnapshot(ctx).complete;
  ctx.batch.reserve.active := false;
  ctx.breakdown.complete := false;
  assert not DexReserveLib.breakdownSnapshot(ctx).complete;
};
