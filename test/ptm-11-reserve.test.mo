import GuaranteeLib "../src/backend/lib/guarantee";
import Types "../src/backend/types/guarantee";

// PTM-11: common reserve. Pure functions of lib/guarantee.mo
// (payoutPlan, reserveViewOf) run in the interpreter; MintLib.core cannot.
//
// Units: TTTI-T base units (1 TTTI-T = 1e8), USD e8 (1 USD = 1e8), ckUSDC and
// ckUSDT base units (1 token = 1e6, rate 1e8 = 1 USD).

let ONE : Nat = 100_000_000; // 1 TTTI-T
let USD : Nat = 100_000_000; // 1 USD, USD e8
let TOKEN : Nat = 1_000_000; // 1 ckUSDC / ckUSDT
let PARITY_PER_TTTI : Nat = 10_000 * USD;

func line(token : Types.PayToken, tokens : Nat, rate : ?Nat) : Types.ReserveTokenLine {
  let value = switch (rate) {
    case (?r) tokens * TOKEN * r / TOKEN;
    case null 0;
  };
  { token; balance = tokens * TOKEN; rateUsdE8 = rate; valueUsdE8 = value };
};

// A reserve of `usdc` ckUSDC and `usdt` ckUSDT, both at 1 USD.
func reserveOf(usdc : Nat, usdt : Nat) : [Types.ReserveTokenLine] {
  [line(#ckusdc, usdc, ?USD), line(#ckusdt, usdt, ?USD)];
};

type Plan = {
  rule : Types.ReserveRedeemRule;
  parityUsdE8 : Nat;
  proportionalUsdE8 : Nat;
  payoutUsdE8 : Nat;
  reserveUsdE8 : Nat;
  payouts : [Types.ReservePayoutLine];
};

func planOf(lines : [Types.ReserveTokenLine], circulation : Nat, x : Nat) : Plan {
  switch (GuaranteeLib.payoutPlan(lines, circulation, x)) {
    case (#ok(p)) p;
    case (#err(_)) { assert false; loop {} };
  };
};

func errOf(lines : [Types.ReserveTokenLine], circulation : Nat, x : Nat) : Types.GuaranteeError {
  switch (GuaranteeLib.payoutPlan(lines, circulation, x)) {
    case (#err(e)) e;
    case (#ok(_)) { assert false; loop {} };
  };
};

func amountOf(p : Plan, token : Types.PayToken) : Nat {
  switch (p.payouts.find(func(l : Types.ReservePayoutLine) : Bool = l.token == token)) {
    case (?l) l.amount;
    case null 0;
  };
};

func usdOf(p : Plan) : Nat {
  var total : Nat = 0;
  for (l in p.payouts.values()) { total += l.valueUsdE8 };
  total;
};

// What a redemption does to the reserve: the payouts leave the accounts.
func apply(lines : [Types.ReserveTokenLine], p : Plan) : [Types.ReserveTokenLine] {
  lines.map(
    func(l : Types.ReserveTokenLine) : Types.ReserveTokenLine {
      let paid = switch (p.payouts.find(func(q : Types.ReservePayoutLine) : Bool = q.token == l.token)) {
        case (?q) q.amount;
        case null 0;
      };
      let balance = l.balance - paid;
      let rate = switch (l.rateUsdE8) {
        case (?r) r;
        case null 0;
      };
      { l with balance; valueUsdE8 = balance * rate / TOKEN };
    }
  );
};

// --- 1. A holder who never minted redeems 1 TTTI-T and receives 10 000 USD -------

do {
  // 1 TTTI-T outside the contract, full reserve of 10 000 USD in ckUSDC.
  let lines = reserveOf(10_000, 0);
  let p = planOf(lines, ONE, ONE);
  assert p.rule == #parity;
  assert p.parityUsdE8 == PARITY_PER_TTTI;
  assert p.payoutUsdE8 == 10_000 * USD;
  assert p.payouts.size() == 1;
  assert amountOf(p, #ckusdc) == 10_000 * TOKEN;
  assert usdOf(p) == 10_000 * USD;
  // No fee: the holder receives the whole amount, the ledger fee is a separate field.
  assert p.payouts[0].amount == 10_000 * TOKEN;
  assert p.payouts[0].ledgerFee > 0;
};

// --- 2. The reserve invariant holds after every operation -----------------------

do {
  // 3 TTTI-T minted: reserve 30 000 USD, 18 000 ckUSDC and 12 000 ckUSDT.
  var lines = reserveOf(18_000, 12_000);
  var circulation : Nat = 3 * ONE;
  assert GuaranteeLib.reserveViewOf(lines, circulation, []).invariantHolds;
  for (x in [ONE / 2, ONE, 3 * ONE / 10, 1_000].values()) {
    let p = planOf(lines, circulation, x);
    lines := apply(lines, p);
    // The returned TTTI-T go back to the contract: out of circulation.
    circulation -= x;
    let view = GuaranteeLib.reserveViewOf(lines, circulation, []);
    assert view.invariantHolds;
    assert view.shortfallUsdE8 == 0;
    assert view.requiredUsdE8 == circulation * 10_000;
  };
  // A full redemption of what remains leaves the reserve covering the rest (zero).
  let rest = planOf(lines, circulation, circulation);
  lines := apply(lines, rest);
  circulation := 0;
  assert GuaranteeLib.reserveViewOf(lines, circulation, []).invariantHolds;
};

// --- 3. Redemption larger than the circulation outside the contract is refused ---

do {
  let lines = reserveOf(10_000, 0);
  switch (errOf(lines, ONE, ONE + 1)) {
    case (#amountExceedsCirculation({ requested; circulation })) {
      assert requested == ONE + 1;
      assert circulation == ONE;
    };
    case _ assert false;
  };
  // Zero circulation: any amount is above it.
  switch (errOf(lines, 0, 1)) {
    case (#amountExceedsCirculation(_)) {};
    case _ assert false;
  };
  // Exactly the circulation is accepted.
  ignore planOf(lines, ONE, ONE);
};

// --- 4. Under-collateralized: (reserve / circulation) x x, split pro rata ---------

do {
  // 2 TTTI-T outside the contract, reserve 10 000 USD: 6 000 ckUSDC, 4 000 ckUSDT.
  // Reserve per TTTI-T = 5 000 USD < 10 000 USD.
  let lines = reserveOf(6_000, 4_000);
  let circulation = 2 * ONE;
  let view = GuaranteeLib.reserveViewOf(lines, circulation, []);
  assert not view.invariantHolds;
  assert view.reservePerTtti == ?(5_000 * USD);
  assert view.requiredUsdE8 == 20_000 * USD;
  assert view.shortfallUsdE8 == 10_000 * USD;
  let p = planOf(lines, circulation, ONE);
  assert p.rule == #reserveShare;
  assert p.proportionalUsdE8 == 5_000 * USD;
  assert p.payoutUsdE8 == 5_000 * USD;
  assert amountOf(p, #ckusdc) == 3_000 * TOKEN; // 60 % of 5 000
  assert amountOf(p, #ckusdt) == 2_000 * TOKEN; // 40 % of 5 000
  assert usdOf(p) == 5_000 * USD;
  // Half a TTTI-T pays half as much, same split.
  let half = planOf(lines, circulation, ONE / 2);
  assert half.payoutUsdE8 == 2_500 * USD;
  assert amountOf(half, #ckusdc) == 1_500 * TOKEN;
  assert amountOf(half, #ckusdt) == 1_000 * TOKEN;
};

do {
  // Only ckUSDT left in the reserve: it pays everything.
  let lines = reserveOf(0, 4_000);
  let p = planOf(lines, 2 * ONE, ONE);
  assert p.payouts.size() == 1;
  assert amountOf(p, #ckusdc) == 0;
  assert amountOf(p, #ckusdt) == 2_000 * TOKEN;
};

// --- 5. Above 10 000 USD per TTTI-T the payout is capped at 10 000 USD x x --------

do {
  // 1 TTTI-T outside, reserve 30 000 USD (more than needed).
  let lines = reserveOf(15_000, 15_000);
  let view = GuaranteeLib.reserveViewOf(lines, ONE, []);
  assert view.invariantHolds;
  assert view.reservePerTtti == ?(30_000 * USD);
  let p = planOf(lines, ONE, ONE);
  assert p.rule == #parity;
  assert p.proportionalUsdE8 == 30_000 * USD;
  assert p.payoutUsdE8 == 10_000 * USD;
  assert amountOf(p, #ckusdc) == 5_000 * TOKEN;
  assert amountOf(p, #ckusdt) == 5_000 * TOKEN;
  // Part of a TTTI-T: 10 000 USD x x exactly.
  let q = planOf(lines, ONE, ONE / 4);
  assert q.payoutUsdE8 == 2_500 * USD;
  assert usdOf(q) == 2_500 * USD;
};

// --- 6. Other refusals --------------------------------------------------------

do {
  // Zero amount.
  switch (errOf(reserveOf(10_000, 0), ONE, 0)) {
    case (#amountTooSmall) {};
    case _ assert false;
  };
  // Empty reserve.
  switch (errOf(reserveOf(0, 0), ONE, ONE)) {
    case (#reserveEmpty) {};
    case _ assert false;
  };
  // A funded reserve token without a usable rate.
  let noRate = [line(#ckusdc, 10_000, ?USD), line(#ckusdt, 100, null)];
  switch (errOf(noRate, ONE, ONE)) {
    case (#rateUnavailable(token)) assert token == #ckusdt;
    case _ assert false;
  };
  // A payout that rounds to nothing in every token is too small.
  switch (errOf(reserveOf(1, 0), 1_000_000_000 * ONE, 1)) {
    case (#amountTooSmall) {};
    case _ assert false;
  };
};

// --- 7. Reserve view -----------------------------------------------------------

do {
  // No TTTI-T outside the contract: no per-TTTI-T figure, invariant holds.
  let view = GuaranteeLib.reserveViewOf(reserveOf(0, 0), 0, []);
  assert view.reservePerTtti == null;
  assert view.invariantHolds;
  assert view.shortfallUsdE8 == 0;
  assert view.reserveUsdE8 == 0;
  // Legacy balances are listed in the view when given, and not counted in the reserve.
  let legacy = [{ token = (#icp : Types.PayToken); balance = 500 }];
  let v2 = GuaranteeLib.reserveViewOf(reserveOf(7_000, 0), ONE, legacy);
  assert v2.legacyPending.size() == 1;
  assert v2.reserveUsdE8 == 7_000 * USD;
  assert not v2.invariantHolds;
  assert v2.shortfallUsdE8 == 3_000 * USD;
  assert v2.reservePerTtti == ?(7_000 * USD);
  // A reserve token without a rate counts for zero in the reserve.
  let v3 = GuaranteeLib.reserveViewOf([line(#ckusdc, 10_000, null), line(#ckusdt, 0, null)], ONE, []);
  assert v3.reserveUsdE8 == 0;
  assert v3.shortfallUsdE8 == 10_000 * USD;
};

// --- 8. ICP and ckBTC count in the reserve, valued in USD at their rate ----------

do {
  let ICP : Nat = 100_000_000; // 1 ICP, 8 decimals
  let BTC : Nat = 100_000_000; // 1 ckBTC, 8 decimals
  let icpRate = 10 * USD; // 1 ICP = 10 USD
  let btcRate = 100_000 * USD; // 1 BTC = 100 000 USD
  // 1 000 ICP (10 000 USD) held as ICP: no conversion.
  let icpLine : Types.ReserveTokenLine = { token = #icp; balance = 1_000 * ICP; rateUsdE8 = ?icpRate; valueUsdE8 = 1_000 * ICP * icpRate / ICP };
  assert icpLine.valueUsdE8 == 10_000 * USD;
  let icpOnly = [icpLine];
  let v = GuaranteeLib.reserveViewOf(icpOnly, ONE, []);
  assert v.reserveUsdE8 == 10_000 * USD;
  assert v.invariantHolds;
  let p = planOf(icpOnly, ONE, ONE);
  assert p.payoutUsdE8 == 10_000 * USD;
  assert p.payouts.size() == 1;
  assert p.payouts[0].token == #icp;
  assert p.payouts[0].amount == 1_000 * ICP;

  // 0.1 ckBTC (10 000 USD) held as ckBTC.
  let btcLine : Types.ReserveTokenLine = { token = #ckbtc; balance = BTC / 10; rateUsdE8 = ?btcRate; valueUsdE8 = (BTC / 10) * btcRate / BTC };
  assert btcLine.valueUsdE8 == 10_000 * USD;
  let btcOnly = [btcLine];
  let pb = planOf(btcOnly, ONE, ONE);
  assert pb.payoutUsdE8 == 10_000 * USD;
  assert pb.payouts[0].token == #ckbtc;
  assert pb.payouts[0].amount == BTC / 10;

  // Mixed reserve of 20 000 USD (10 000 in ICP, 10 000 in ckBTC) with 2 TTTI-T
  // outside: 1 TTTI-T pays 10 000 USD split 50 / 50 by USD value.
  let mixed = [icpLine, btcLine];
  let pm = planOf(mixed, 2 * ONE, ONE);
  assert pm.rule == #parity;
  assert pm.payoutUsdE8 == 10_000 * USD;
  assert amountOf(pm, #icp) == 500 * ICP;
  assert amountOf(pm, #ckbtc) == BTC / 20;
  assert usdOf(pm) == 10_000 * USD;

  // The value follows the rate of the moment: ckBTC at 50 000 USD halves its share.
  let cheaper : Types.ReserveTokenLine = { btcLine with rateUsdE8 = ?(50_000 * USD); valueUsdE8 = (BTC / 10) * (50_000 * USD) / BTC };
  assert cheaper.valueUsdE8 == 5_000 * USD;
  let vc = GuaranteeLib.reserveViewOf([icpLine, cheaper], 2 * ONE, []);
  assert vc.reserveUsdE8 == 15_000 * USD;
  assert not vc.invariantHolds;
  assert vc.shortfallUsdE8 == 5_000 * USD;
  let pc = planOf([icpLine, cheaper], 2 * ONE, ONE);
  assert pc.rule == #reserveShare;
  assert pc.payoutUsdE8 == 7_500 * USD;

  // A funded ICP line without a usable rate refuses the redemption.
  let noRate : Types.ReserveTokenLine = { icpLine with rateUsdE8 = null; valueUsdE8 = 0 };
  switch (errOf([noRate, btcLine], ONE, ONE)) {
    case (#rateUnavailable(token)) assert token == #icp;
    case _ assert false;
  };
};

// --- Ledger fee source: creator share first, then the balance outside the reserve --

do {
  // The creator share covers the fee.
  assert GuaranteeLib.ledgerFeeSource(10_000, 0, 10_000) == #creator;
  assert GuaranteeLib.ledgerFeeSource(50_000, 50_000, 10_000) == #creator;
  // Creator share empty (mint paid in ICP / ckBTC): the surplus bears the fee.
  assert GuaranteeLib.ledgerFeeSource(0, 10_000, 10_000) == #surplus;
  assert GuaranteeLib.ledgerFeeSource(9_999, 20_000, 10_000) == #surplus;
  // Refused only when neither can bear it.
  assert GuaranteeLib.ledgerFeeSource(0, 9_999, 10_000) == #none;
  assert GuaranteeLib.ledgerFeeSource(0, 0, 10_000) == #none;
  // A zero fee never blocks a redemption.
  assert GuaranteeLib.ledgerFeeSource(0, 0, 0) == #creator;
};
