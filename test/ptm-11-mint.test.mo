import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AuctionLib "../src/backend/lib/auction";
import DexLib "../src/backend/lib/dex";
import GuaranteeLib "../src/backend/lib/guarantee";
import MintLib "../src/backend/lib/liquidity-mint";
import SaleLib "../src/backend/lib/presale";
import SaleTypes "../src/backend/types/presale";
import DexTypes "../src/backend/types/dex";
import Types "../src/backend/types/guarantee";

// Mint, auction and redemption with the common reserve. Pure functions only
// (MintLib.core cannot run in the interpreter).
//
// Units: TTTI-T e8 (1 TTTI-T = 1e8), rates in USD e8 (1 USD = 1e8), ckUSDC base
// units 1e6, ckBTC base units 1e8.

let ONE : Nat = 100_000_000;
let USDC_UNIT : Nat = 1_000_000;
let BTC_UNIT : Nat = 100_000_000;
let BTC_RATE : Nat = 100_000 * 100_000_000; // 1 BTC = 100 000 USD
let USDC_RATE : Nat = 100_000_000; // 1 ckUSDC = 1 USD
let USD : Nat = 100_000_000; // 1 USD, USD e8

// The reserve lines of the four reserve tokens: ICP at 10 USD, ckBTC at 100 000 USD,
// ckUSDC and ckUSDT at 1 USD.
func reserveLines(account : Types.GuaranteeAccountStore) : [Types.ReserveTokenLine] {
  [#icp, #ckbtc, #ckusdc, #ckusdt].map(
    func(token : Types.PayToken) : Types.ReserveTokenLine {
      let (dex, rate, unit) : (DexTypes.DexToken, Nat, Nat) = switch (token) {
        case (#icp) (#icp, 10 * USD, 100_000_000);
        case (#ckbtc) (#ckbtc, BTC_RATE, BTC_UNIT);
        case (#ckusdc) (#ckusdc, USDC_RATE, USDC_UNIT);
        case (#ckusdt) (#ckusdt, USDC_RATE, USDC_UNIT);
      };
      let balance = GuaranteeLib.accountBalance(account, dex);
      { token; balance; rateUsdE8 = ?rate; valueUsdE8 = balance * rate / unit };
    }
  );
};

func planOf(lines : [Types.ReserveTokenLine], circulation : Nat, x : Nat) : {
  rule : Types.ReserveRedeemRule;
  payoutUsdE8 : Nat;
  payouts : [Types.ReservePayoutLine];
} {
  switch (GuaranteeLib.payoutPlan(lines, circulation, x)) {
    case (#ok(p)) p;
    case (#err(_)) { assert false; loop {} };
  };
};

func amountOf(p : { payouts : [Types.ReservePayoutLine] }, token : Types.PayToken) : Nat {
  switch (p.payouts.find(func(l : Types.ReservePayoutLine) : Bool = l.token == token)) {
    case (?l) l.amount;
    case null 0;
  };
};

// --- 1. A mint credits the reserve part directly in the paid token -----------------

do {
  // 1 TTTI-T paid in ckBTC: 20 000 / 0.99 = 20 202.02 USD = 0.20202020... BTC, rounded up.
  let m = MintLib.mintAmounts(ONE, BTC_RATE, BTC_UNIT, 0, #pool);
  assert m.payAmount == 20_202_021;
  // The position counterpart is 10 000 USD in the paid token (0.1 BTC), as before.
  assert m.position == 10_000_000;
  // The reserve part (10 000 USD) goes to the common reserve in ckBTC, as paid.
  assert m.reserve == 10_000_000;
  // No token is converted for the reserve: no pool, no deviation check, no cost.
  assert not MintLib.reserveConverts(#ckbtc);
  assert not MintLib.reserveConverts(#icp);
  assert not MintLib.reserveConverts(#ckusdc);
  assert not MintLib.reserveConverts(#ckusdt);
  // Everything paid is accounted for: position + reserve + creator + dust.
  assert m.position + m.reserve + m.creator + m.dust == m.payAmount;
};

// --- 2. Mint, then redemption: the creator fee is taken at the mint only -----------

do {
  // Paid in ckUSDC: 20 202.02 USD in total.
  let m = MintLib.mintAmounts(ONE, USDC_RATE, USDC_UNIT, 0, #pool);
  assert m.payAmount == 20_202_020_203;
  assert m.position == 10_000 * USDC_UNIT;
  assert m.reserve == 10_000 * USDC_UNIT;
  // The creator fee is 1 % of the amount paid, taken at the mint only.
  assert m.creator == 202_020_202;
  // Everything paid is accounted for: position + reserve + creator + dust.
  assert m.position + m.reserve + m.creator + m.dust == m.payAmount;

  // The reserve account receives the reserve part; the minter holds 1 TTTI-T.
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckusdc, m.reserve);
  let lines = reserveLines(account);
  assert GuaranteeLib.reserveViewOf(lines, ONE, []).invariantHolds;

  // The same TTTI-T redeemed at once pays 10 000 USD from the reserve, with no fee.
  let p = planOf(lines, ONE, ONE);
  assert p.rule == #parity;
  assert p.payoutUsdE8 == 10_000 * USD;
  assert p.payouts.size() == 1;
  assert p.payouts[0].token == #ckusdc;
  assert p.payouts[0].amount == 10_000 * USDC_UNIT;
  // The position stays the minter's; no profit: what is lost is the creator fee and the dust.
  let back = p.payouts[0].amount + m.position;
  assert back < m.payAmount;
  assert m.payAmount - back == m.creator + m.dust;
  assert m.payAmount - back == 202_020_203;
};

// --- 3. A holder who never minted redeems against the reserve -------------------------

do {
  // Two mints of 1 TTTI-T fill the reserve; the second TTTI-T is sold on to a holder.
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckusdc, 10_000 * USDC_UNIT);
  GuaranteeLib.creditAccount(account, #ckusdt, 10_000 * USDC_UNIT);
  let lines = reserveLines(account);
  let p = planOf(lines, 2 * ONE, ONE);
  assert p.payoutUsdE8 == 10_000 * USD;
  // Split in proportion to the reserve composition (50 / 50).
  assert amountOf(p, #ckusdc) == 5_000 * USDC_UNIT;
  assert amountOf(p, #ckusdt) == 5_000 * USDC_UNIT;
  // The payout leaves the accounts, the invariant holds for what remains in circulation.
  for (l in p.payouts.values()) { assert GuaranteeLib.debitAccount(account, l.token, l.amount) };
  assert GuaranteeLib.reserveViewOf(reserveLines(account), ONE, []).invariantHolds;
};

// --- 4. The ledger fee is taken from the creator share, never from the holder ----------

do {
  let fee = 10_000;
  // The creator share covers the fee: it bears it.
  assert GuaranteeLib.ledgerFeeSource(fee, 0, fee) == #creator;
  // Otherwise the contract balance outside the reserve bears it.
  assert GuaranteeLib.ledgerFeeSource(0, fee, fee) == #surplus;
  // Neither covers it: the redemption is refused before any transfer.
  assert GuaranteeLib.ledgerFeeSource(fee - 1, fee - 1, fee) == #none;
  // The payout line carries the whole amount; the fee is a separate field.
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckusdc, 10_000 * USDC_UNIT);
  let p = planOf(reserveLines(account), ONE, ONE);
  assert p.payouts[0].amount == 10_000 * USDC_UNIT;
  assert p.payouts[0].ledgerFee > 0;
};

// --- 5. A mint paid in ckBTC gives the redeemer ckBTC from the reserve --------------------

do {
  let m = MintLib.mintAmounts(ONE, BTC_RATE, BTC_UNIT, 0, #pool);
  assert m.reserve == 10_000_000;
  // The reserve is credited with 0.1 BTC (10 000 USD at 100 000 USD per BTC), not converted.
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckbtc, m.reserve);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 0;
  let lines = reserveLines(account);
  assert GuaranteeLib.reserveViewOf(lines, ONE, []).invariantHolds;
  let p = planOf(lines, ONE, ONE);
  assert p.payoutUsdE8 == 10_000 * USD;
  assert amountOf(p, #ckbtc) == 10_000_000;
  assert amountOf(p, #ckusdc) == 0;
};

// --- 6. Redemption above the circulation outside the contract is refused ----------------

do {
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckusdc, 10_000 * USDC_UNIT);
  switch (GuaranteeLib.payoutPlan(reserveLines(account), ONE, ONE + 1)) {
    case (#err(#amountExceedsCirculation({ requested; circulation }))) {
      assert requested == ONE + 1;
      assert circulation == ONE;
    };
    case _ assert false;
  };
  // Exactly the circulation is accepted.
  ignore planOf(reserveLines(account), ONE, ONE);
};

// --- 7. Undercollateralised reserve: the proportional share is paid ------------------------

do {
  // 2 TTTI-T outside the contract, 10 000 USD in the reserve: 5 000 USD per TTTI-T.
  let account : Types.GuaranteeAccountStore = Map.empty();
  GuaranteeLib.creditAccount(account, #ckusdc, 6_000 * USDC_UNIT);
  GuaranteeLib.creditAccount(account, #ckusdt, 4_000 * USDC_UNIT);
  let lines = reserveLines(account);
  assert not GuaranteeLib.reserveViewOf(lines, 2 * ONE, []).invariantHolds;
  let p = planOf(lines, 2 * ONE, ONE);
  assert p.rule == #reserveShare;
  assert p.payoutUsdE8 == 5_000 * USD;
  assert amountOf(p, #ckusdc) == 3_000 * USDC_UNIT;
  assert amountOf(p, #ckusdt) == 2_000 * USDC_UNIT;
};

// --- 8. Wallet terms: only the current version (3) allows a mint or a redemption -----------

do {
  assert SaleLib.CURRENT_ACK_VERSION == 3;
  assert not SaleLib.isCurrentAckVersion(1);
  assert not SaleLib.isCurrentAckVersion(2);
  assert SaleLib.isCurrentAckVersion(3);
  let store : SaleTypes.AcknowledgementStore = Map.empty();
  let v2 = Principal.fromText("aaaaa-aa");
  let v3 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let none = Principal.fromText("2vxsx-fae");
  store.add(v2, { acceptedAt = 1; version = 2 });
  store.add(v3, { acceptedAt = 2; version = 3 });
  // A version-2 acceptance counts as not accepted: redemption is refused.
  assert not SaleLib.hasAccepted(store, v2);
  assert GuaranteeLib.acknowledgementError(store, v2) == ?#acknowledgementRequired;
  // A version-3 acceptance allows it.
  assert SaleLib.hasAccepted(store, v3);
  assert GuaranteeLib.acknowledgementError(store, v3) == null;
  // No acceptance, and the anonymous caller, are refused.
  assert GuaranteeLib.acknowledgementError(store, none) == ?#acknowledgementRequired;
  assert GuaranteeLib.acknowledgementError(store, Principal.anonymous()) == ?#acknowledgementRequired;
  // Accepting again replaces the version-2 record.
  switch (SaleLib.accept(store, v2, 3)) {
    case (#ok(_)) {};
    case (#err(_)) assert false;
  };
  assert GuaranteeLib.acknowledgementError(store, v2) == null;
};

// --- 3. Auction winner: (B + 10 000 USD) x q / 0.99 -------------------------------

do {
  // ckUSDC: B = 15 000 USD per TTTI-T, q = 2 TTTI-T, reserve unit 10 000 USD.
  let reserveUnit : Nat = 10_000 * USDC_UNIT;
  let b : Nat = 15_000 * USDC_UNIT;
  let q : Nat = 2 * ONE;
  let a = AuctionLib.settleAmounts(b, reserveUnit, q, 0, #pool);
  // (15 000 + 10 000) x 2 / 0.99 = 50 505.05... USD, rounded up.
  assert a.taken == AuctionLib.depositFormula(b, reserveUnit, q);
  assert a.taken == 50_505_050_506;
  assert a.taken * 99 >= (b + reserveUnit) * 2 * 100;
  assert a.taken * 99 < (b + reserveUnit) * 2 * 100 + 99;
  // B x q to the position, 10 000 USD x q to the reserve, 1 % to the creator.
  assert a.position == 30_000 * USDC_UNIT;
  assert a.guarantee == 20_000 * USDC_UNIT;
  assert a.creator == a.taken / 100;
  assert a.creator + a.position + a.guarantee + a.dust == a.taken;
  // The winner pays (B + 10 000 USD) x q / 0.99, not 2 x B x q / 0.99.
  assert a.taken != AuctionLib.depositFormula(b, b, q);
  // At B = 10 000 USD the price equals the reserve part.
  assert AuctionLib.depositFormula(reserveUnit, reserveUnit, ONE) == 20_202_020_203;
};

// --- 4. No conversion buffer on an auction deposit ----------------------------------

do {
  // The reserve part stays in the paid token, whatever the token: no buffer.
  let reserve = 10_000_000; // 0.1 BTC
  assert AuctionLib.conversionBuffer(#ckusdc, 10_000 * USDC_UNIT) == 0;
  assert AuctionLib.conversionBuffer(#ckusdt, 10_000 * USDC_UNIT) == 0;
  assert AuctionLib.conversionBuffer(#ckbtc, reserve) == 0;
  assert AuctionLib.conversionBuffer(#icp, reserve) == 0;
};
