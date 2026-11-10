import Map "mo:core/Map";
import GuaranteeLib "../src/backend/lib/guarantee";
import Types "../src/backend/types/guarantee";

// Common reserve accounts: one dedicated internal account per token. The mint
// and the auction settlement credit it with the reserve part they create; a
// redemption debits only the account of its token. Pure tests that run in the
// interpreter. The payout rule is covered by ptm-11-reserve.test.mo.

func fresh() : Types.GuaranteeAccountStore {
  Map.empty<Types.TokenKey, Nat>();
};

func viewOf(views : [Types.GuaranteeAccountView], token : Types.DexToken) : Types.GuaranteeAccountView {
  switch (views.find(func(v : Types.GuaranteeAccountView) : Bool { v.token == token })) {
    case (?v) v;
    case null { assert false; loop {} };
  };
};

// One entry per token, in the DEX order, all empty to begin with.
do {
  let account = fresh();
  let views = GuaranteeLib.accountViews(account);
  assert views.size() == 5;
  assert views[0].token == #tttiT;
  assert views[1].token == #icp;
  assert views[2].token == #ckbtc;
  assert views[3].token == #ckusdc;
  assert views[4].token == #ckusdt;
  for (v in views.values()) {
    assert v.accountBalance == 0;
  };
};

// Credits add up per token and do not touch the other accounts.
do {
  let account = fresh();
  GuaranteeLib.creditAccount(account, #ckusdc, 5_000);
  GuaranteeLib.creditAccount(account, #ckusdc, 7_000);
  GuaranteeLib.creditAccount(account, #ckusdt, 2_000);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 12_000;
  assert GuaranteeLib.accountBalance(account, #ckusdt) == 2_000;
  assert GuaranteeLib.accountBalance(account, #ckbtc) == 0;
  let views = GuaranteeLib.accountViews(account);
  assert viewOf(views, #ckusdc).accountBalance == 12_000;
  assert viewOf(views, #ckusdt).accountBalance == 2_000;
  for (token in [#tttiT, #icp, #ckbtc].values()) {
    assert viewOf(views, token).accountBalance == 0;
  };
};

// A redemption debits only the account of its token; the other accounts do not move.
do {
  let account = fresh();
  GuaranteeLib.creditAccount(account, #ckusdc, 10_000);
  GuaranteeLib.creditAccount(account, #ckusdt, 8_000);
  assert GuaranteeLib.debitAccount(account, #ckusdc, 4_000);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 6_000;
  assert GuaranteeLib.accountBalance(account, #ckusdt) == 8_000;
};

// The account cannot be overdrawn: a debit above the balance changes nothing.
do {
  let account = fresh();
  GuaranteeLib.creditAccount(account, #ckusdc, 3_000);
  assert not GuaranteeLib.debitAccount(account, #ckusdc, 3_001);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 3_000;
  assert not GuaranteeLib.debitAccount(account, #ckusdt, 1);
  assert GuaranteeLib.accountBalance(account, #ckusdt) == 0;
  assert GuaranteeLib.debitAccount(account, #ckusdc, 3_000);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 0;
  // A zero credit or debit is a no-op.
  GuaranteeLib.creditAccount(account, #ckusdc, 0);
  assert GuaranteeLib.debitAccount(account, #ckusdc, 0);
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 0;
};

// The reserve invariant over the account balances: reserve >= 10 000 USD x circulation.
do {
  let account = fresh();
  let ONE : Nat = 100_000_000;
  let TOKEN : Nat = 1_000_000;
  let USD : Nat = 100_000_000;
  // Two TTTI-T minted: 20 000 USD in the reserve, 12 000 ckUSDC and 8 000 ckUSDT.
  GuaranteeLib.creditAccount(account, #ckusdc, 12_000 * TOKEN);
  GuaranteeLib.creditAccount(account, #ckusdt, 8_000 * TOKEN);
  func linesOf() : [Types.ReserveTokenLine] {
    [#ckusdc, #ckusdt].map(
      func(token : Types.PayToken) : Types.ReserveTokenLine {
        let balance = GuaranteeLib.accountBalance(account, switch (token) { case (#ckusdc) #ckusdc; case (_) #ckusdt });
        { token; balance; rateUsdE8 = ?USD; valueUsdE8 = balance * USD / TOKEN };
      }
    );
  };
  assert GuaranteeLib.reserveViewOf(linesOf(), 2 * ONE, []).invariantHolds;
  // One more TTTI-T outside the contract without a reserve part: the invariant fails.
  let view = GuaranteeLib.reserveViewOf(linesOf(), 3 * ONE, []);
  assert not view.invariantHolds;
  assert view.shortfallUsdE8 == 10_000 * USD;
};
