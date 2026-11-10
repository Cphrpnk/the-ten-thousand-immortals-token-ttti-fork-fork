import IcpSwapLib "../src/backend/lib/icpswap";

// ICPSwap reference reading for the first deposit of an empty pool: pure tests
// that run in the interpreter.
//
//  1. A pool holding 0.0065 TTTI-T priced at 9 800 USD gives 9 800 USD within
//     1 % through the sqrtPriceX96 spot path (both token orders).
//  2. The same pool gives 9 800 USD within 1 % through the quote path: a quote
//     on 1 % of the TTTI-T reserve against a constant-product model with the
//     pool fee (the quote is independent of the token order).
//  3. The quote amount is never below 100 e8s.
//
// Prices are counter whole tokens x 1e8 per whole TTTI-T; the counter is
// ckUSDC (6 decimals, 1 USD), so the expected value is 9 800 x 1e8 =
// 980_000_000_000.

let EXPECTED : Nat = 980_000_000_000;
let TTTI_RESERVE : Nat = 650_000; // 0.0065 TTTI-T in e8s
let COUNTER_RESERVE : Nat = 63_700_000; // 63.7 ckUSDC = 0.0065 x 9 800
let COUNTER_DECIMALS : Nat8 = 6;
let FEE : Nat = 3_000; // 0.3 % in parts per 1_000_000

func withinOnePercent(price : Nat) : Bool {
  let diff : Nat = if (price > EXPECTED) price - EXPECTED else EXPECTED - price;
  diff * 100 <= EXPECTED;
};

// floor(sqrt(n)) by Newton's method.
func isqrt(n : Nat) : Nat {
  if (n == 0) return 0;
  var x = n;
  var y = (x + 1) / 2;
  while (y < x) {
    x := y;
    y := (x + n / x) / 2;
  };
  x;
};

let q192 : Nat = 2 ** 192;

// sqrtPriceX96 of a pool: sqrt(token1 base units / token0 base units) x 2^96.
func sqrtPriceX96(token0Reserve : Nat, token1Reserve : Nat) : Nat {
  isqrt(token1Reserve * q192 / token0Reserve);
};

// Constant-product output for `amountIn` with the pool fee taken from the input.
func constantProductOut(reserveIn : Nat, reserveOut : Nat, amountIn : Nat) : Nat {
  let net = amountIn * (1_000_000 - FEE) / 1_000_000;
  reserveOut * net / (reserveIn + net);
};

// 1. Spot path.
do {
  // TTTI-T is token0, the counter is token1.
  let s0 = sqrtPriceX96(TTTI_RESERVE, COUNTER_RESERVE);
  switch (IcpSwapLib.priceFromSqrt(?s0, true, COUNTER_DECIMALS)) {
    case (?p) { assert withinOnePercent(p) };
    case null { assert false };
  };

  // TTTI-T is token1, the counter is token0.
  let s1 = sqrtPriceX96(COUNTER_RESERVE, TTTI_RESERVE);
  switch (IcpSwapLib.priceFromSqrt(?s1, false, COUNTER_DECIMALS)) {
    case (?p) { assert withinOnePercent(p) };
    case null { assert false };
  };

  // Absent or zero sqrtPriceX96 is unusable: the quote path takes over.
  assert IcpSwapLib.priceFromSqrt(null, true, COUNTER_DECIMALS) == null;
  assert IcpSwapLib.priceFromSqrt(?0, true, COUNTER_DECIMALS) == null;
  assert IcpSwapLib.priceFromSqrt(?0, false, COUNTER_DECIMALS) == null;
};

// 2. Quote path: 1 % of the TTTI-T reserve, constant-product with the pool fee.
do {
  let amountIn = IcpSwapLib.quoteAmountFor(TTTI_RESERVE);
  assert amountIn == 6_500;

  let out = constantProductOut(TTTI_RESERVE, COUNTER_RESERVE, amountIn);
  switch (IcpSwapLib.priceFromQuote(amountIn, out, FEE, COUNTER_DECIMALS)) {
    case (?p) { assert withinOnePercent(p) };
    case null { assert false };
  };

  // Unusable quotes.
  assert IcpSwapLib.priceFromQuote(0, out, FEE, COUNTER_DECIMALS) == null;
  assert IcpSwapLib.priceFromQuote(amountIn, 0, FEE, COUNTER_DECIMALS) == null;
  assert IcpSwapLib.priceFromQuote(amountIn, out, 1_000_000, COUNTER_DECIMALS) == null;
};

// 3. The quote amount is 1 % of the reserve and never below 100 e8s.
do {
  assert IcpSwapLib.quoteAmountFor(0) == 100;
  assert IcpSwapLib.quoteAmountFor(1) == 100;
  assert IcpSwapLib.quoteAmountFor(9_999) == 100;
  assert IcpSwapLib.quoteAmountFor(10_000) == 100;
  assert IcpSwapLib.quoteAmountFor(19_999) == 199;
  assert IcpSwapLib.quoteAmountFor(20_000) == 200;
  assert IcpSwapLib.quoteAmountFor(650_000) == 6_500;
  assert IcpSwapLib.quoteAmountFor(100_000_000_000) == 1_000_000_000;
  var r : Nat = 0;
  while (r < 50_000) {
    assert IcpSwapLib.quoteAmountFor(r) >= IcpSwapLib.MIN_QUOTE_AMOUNT;
    r += 997;
  };
};
