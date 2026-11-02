import Map "mo:core/Map";
import Principal "mo:core/Principal";
import GuaranteeLib "../src/backend/lib/guarantee";
import Types "../src/backend/types/guarantee";

// PTM-9b point 5: one dedicated internal guarantee account per token. The mint
// and the auction settlement credit it with the guarantee they create; the
// redemption debits only that account; the sum of the masses equals its balance.
// Pure tests that run in the interpreter.

let alice = Principal.fromText("aaaaa-aa");
let bob = Principal.fromText("2vxsx-fae");
let carol = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

func fresh() : (Types.GuaranteeMassStore, Types.GuaranteeAccountStore) {
  (Map.empty<Principal, Map.Map<Types.TokenKey, Types.GuaranteeMass>>(), Map.empty<Types.TokenKey, Nat>());
};

func viewOf(views : [Types.GuaranteeAccountView], token : Types.DexToken) : Types.GuaranteeAccountView {
  switch (views.find(func(v : Types.GuaranteeAccountView) : Bool { v.token == token })) {
    case (?v) v;
    case null { assert false; loop {} };
  };
};

// What the liquidity mint does for a mint: the guarantee is credited to the
// account and added to the minter's mass in the same block.
func mint(masses : Types.GuaranteeMassStore, account : Types.GuaranteeAccountStore, who : Principal, token : Types.PayToken, ttti : Nat, guarantee : Nat) {
  GuaranteeLib.creditAccount(account, token, guarantee);
  GuaranteeLib.addMass(masses, who, token, ttti, guarantee);
};

// What the auction settlement does for a winner: same credit, pooled with the mass.
func settleWinner(masses : Types.GuaranteeMassStore, account : Types.GuaranteeAccountStore, who : Principal, token : Types.PayToken, ttti : Nat, guarantee : Nat) {
  GuaranteeLib.creditAccount(account, token, guarantee);
  GuaranteeLib.addMass(masses, who, token, ttti, guarantee);
};

// One entry per token, in the DEX order, all empty to begin with.
do {
  let (masses, account) = fresh();
  let views = GuaranteeLib.accountViews(masses, account);
  assert views.size() == 5;
  assert views[0].token == #tttiT;
  assert views[1].token == #icp;
  assert views[2].token == #ckbtc;
  assert views[3].token == #ckusdc;
  assert views[4].token == #ckusdt;
  for (v in views.values()) {
    assert v.massTotal == 0;
    assert v.accountBalance == 0;
    assert v.equal;
  };
};

// The mint and the auction credit the account of the token; the sum of the masses equals the balance.
do {
  let (masses, account) = fresh();
  mint(masses, account, alice, #icp, 1_000_000, 5_000);
  mint(masses, account, bob, #icp, 2_000_000, 7_000);
  settleWinner(masses, account, bob, #icp, 500_000, 2_000);
  settleWinner(masses, account, carol, #ckusdc, 300_000, 4_000);
  assert GuaranteeLib.accountBalance(account, #icp) == 14_000;
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 4_000;
  assert GuaranteeLib.accountBalance(account, #ckbtc) == 0;
  let views = GuaranteeLib.accountViews(masses, account);
  let icp = viewOf(views, #icp);
  assert icp.massTotal == 14_000;
  assert icp.accountBalance == 14_000;
  assert icp.equal;
  let usdc = viewOf(views, #ckusdc);
  assert usdc.massTotal == 4_000 and usdc.accountBalance == 4_000 and usdc.equal;
  for (token in [#tttiT, #ckbtc, #ckusdt].values()) {
    let v = viewOf(views, token);
    assert v.massTotal == 0 and v.accountBalance == 0 and v.equal;
  };
};

// The excess left in a mass counts in the sum, with the remaining guarantee.
do {
  let (masses, account) = fresh();
  mint(masses, account, alice, #ckbtc, 1_000_000, 9_000);
  switch (GuaranteeLib.massOf(masses, alice, #ckbtc)) {
    case (?m) {
      GuaranteeLib.setMass(masses, alice, { m with remainingGuarantee = 6_000; excess = 3_000 });
    };
    case null assert false;
  };
  let v = viewOf(GuaranteeLib.accountViews(masses, account), #ckbtc);
  assert v.massTotal == 9_000;
  assert v.accountBalance == 9_000;
  assert v.equal;
};

// The redemption debits only the account of its token; the other accounts do not move.
do {
  let (masses, account) = fresh();
  mint(masses, account, alice, #icp, 1_000_000, 10_000);
  mint(masses, account, alice, #ckusdc, 1_000_000, 8_000);
  // alice redeems 4 000 of her ICP guarantee: the account and the mass go down together.
  assert GuaranteeLib.debitAccount(account, #icp, 4_000);
  switch (GuaranteeLib.massOf(masses, alice, #icp)) {
    case (?m) {
      GuaranteeLib.setMass(masses, alice, { m with remainingTtti = 600_000; remainingGuarantee = 6_000 });
    };
    case null assert false;
  };
  assert GuaranteeLib.accountBalance(account, #icp) == 6_000;
  assert GuaranteeLib.accountBalance(account, #ckusdc) == 8_000;
  let views = GuaranteeLib.accountViews(masses, account);
  assert viewOf(views, #icp).equal;
  assert viewOf(views, #icp).massTotal == 6_000;
  assert viewOf(views, #ckusdc).equal;
  assert viewOf(views, #ckusdc).accountBalance == 8_000;
};

// The account cannot be overdrawn: a debit above the balance changes nothing.
do {
  let (masses, account) = fresh();
  mint(masses, account, alice, #icp, 1_000_000, 3_000);
  assert not GuaranteeLib.debitAccount(account, #icp, 3_001);
  assert GuaranteeLib.accountBalance(account, #icp) == 3_000;
  assert not GuaranteeLib.debitAccount(account, #ckbtc, 1);
  assert GuaranteeLib.accountBalance(account, #ckbtc) == 0;
  assert GuaranteeLib.debitAccount(account, #icp, 3_000);
  assert GuaranteeLib.accountBalance(account, #icp) == 0;
  // A zero credit or debit is a no-op.
  GuaranteeLib.creditAccount(account, #icp, 0);
  assert GuaranteeLib.debitAccount(account, #icp, 0);
  assert GuaranteeLib.accountBalance(account, #icp) == 0;
  let _ = masses;
};

// A balance that does not match the masses is shown as not equal (the public check).
do {
  let (masses, account) = fresh();
  mint(masses, account, alice, #icp, 1_000_000, 3_000);
  GuaranteeLib.creditAccount(account, #icp, 1);
  let v = viewOf(GuaranteeLib.accountViews(masses, account), #icp);
  assert v.massTotal == 3_000;
  assert v.accountBalance == 3_001;
  assert not v.equal;
};
