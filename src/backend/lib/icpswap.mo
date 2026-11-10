import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Result "mo:core/Result";
import Types "../types/icpswap";
import DexTypes "../types/dex";

// ICPSwap v3 SwapPool inter-canister calls used by the set-aside liquidity
// injection (swap of 50 % of a set-aside amount into TTTI-T while no native
// TTTI-T pool of that pair is open). Flow: icrc1_transfer of the input token
// to the pool's deposit subaccount of this canister, deposit, swap with a
// bounded amountOutMinimum, withdraw of the TTTI-T obtained. No TTTI-T is
// ever minted for pools.
module {
  public type SwapPool = Types.SwapPool;
  public type PoolInfo = Types.PoolInfo;

  // ICPSwap SwapFactory (mainnet).
  public let FACTORY_ID : Text = "4mmnk-kiaaa-aaaag-qbllq-cai";

  type FactoryToken = { address : Text; standard : Text };
  type GetPoolArgs = { token0 : FactoryToken; token1 : FactoryToken; fee : Nat };
  type PoolData = { canisterId : Principal };
  type Factory = actor {
    getPool : shared query GetPoolArgs -> async { #ok : PoolData; #err : Types.IcpSwapError };
  };

  // Withdrawal to a subaccount of the caller (TTTI-T cannot be received on
  // this canister's default account: it is the TTTI-T minting account).
  type WithdrawToSubaccountArgs = { token : Text; amount : Nat; fee : Nat; subaccount : Blob };
  type SubaccountPool = actor {
    withdrawToSubaccount : shared WithdrawToSubaccountArgs -> async Types.NatResult;
  };

  public func pool(poolId : Principal) : SwapPool = actor (poolId.toText());

  // The ICPSwap pool of two ledgers (fee tiers 0.3 %, 0.05 %, 1 %; ICRC2
  // then ICRC1), or null when the factory has none or the call fails.
  public func findPool(ledgerA : Principal, ledgerB : Principal) : async ?Principal {
    let a = ledgerA.toText();
    let b = ledgerB.toText();
    let (first, second) = if (a < b) (a, b) else (b, a);
    let factory : Factory = actor (FACTORY_ID);
    let combos : [(Text, Text)] = [("ICRC2", "ICRC2"), ("ICRC1", "ICRC2"), ("ICRC2", "ICRC1"), ("ICRC1", "ICRC1")];
    for ((s0, s1) in combos.values()) {
      for (fee in [3000, 500, 10000].values()) {
        try {
          switch (await factory.getPool({ token0 = { address = first; standard = s0 }; token1 = { address = second; standard = s1 }; fee })) {
            case (#ok(data)) return ?data.canisterId;
            case (#err(_)) {};
          };
        } catch (_) {
          return null;
        };
      };
    };
    null;
  };

  // Subaccount of the pool on the input ledger where this canister deposits
  // (ICPSwap principal-to-subaccount of the depositor).
  public func depositSubaccount(canister : Principal) : Blob {
    let bytes = canister.toBlob().toArray();
    Array.tabulate(
      32,
      func(i : Nat) : Nat8 {
        if (i == 0) Nat8.fromNat(bytes.size()) else if (i <= bytes.size()) bytes[i - 1] else 0;
      },
    ).toBlob();
  };

  func errorText(e : Types.IcpSwapError) : Text {
    switch (e) {
      case (#CommonError) "ICPSwap: CommonError";
      case (#InternalError(t)) "ICPSwap: InternalError " # t;
      case (#UnsupportedToken(t)) "ICPSwap: UnsupportedToken " # t;
      case (#InsufficientFunds) "ICPSwap: InsufficientFunds";
    };
  };

  func natResult(r : Types.NatResult) : Result.Result<Nat, Text> {
    switch (r) {
      case (#ok(v)) #ok(v);
      case (#err(e)) #err(errorText(e));
    };
  };

  type Metadata = { info : PoolInfo; sqrtPriceX96 : ?Nat };

  func readMetadata(poolId : Principal, tttiLedger : Principal) : async Result.Result<Metadata, Text> {
    try {
      switch (await pool(poolId).metadata()) {
        case (#ok(m)) {
          let t = tttiLedger.toText();
          if (m.token0.address == t) {
            #ok({ info = { poolId; tttiIsToken0 = true; fee = m.fee }; sqrtPriceX96 = m.sqrtPriceX96 });
          } else if (m.token1.address == t) {
            #ok({ info = { poolId; tttiIsToken0 = false; fee = m.fee }; sqrtPriceX96 = m.sqrtPriceX96 });
          } else {
            #err("ICPSwap pool does not hold TTTI-T");
          };
        };
        case (#err(e)) #err(errorText(e));
      };
    } catch (e) {
      #err("ICPSwap metadata call rejected: " # e.message());
    };
  };

  public func info(poolId : Principal, tttiLedger : Principal) : async Result.Result<PoolInfo, Text> {
    switch (await readMetadata(poolId, tttiLedger)) {
      case (#ok(m)) #ok(m.info);
      case (#err(e)) #err(e);
    };
  };

  // Expected output for `amountIn`.
  public func quote(poolId : Principal, zeroForOne : Bool, amountIn : Nat) : async Result.Result<Nat, Text> {
    try {
      natResult(await pool(poolId).quote({ amountIn = amountIn.toText(); zeroForOne; amountOutMinimum = "0" }));
    } catch (e) {
      #err("ICPSwap quote call rejected: " # e.message());
    };
  };

  // Credits an amount already transferred to the deposit subaccount.
  public func deposit(poolId : Principal, tokenLedger : Principal, amount : Nat, fee : Nat) : async Result.Result<Nat, Text> {
    try {
      natResult(await pool(poolId).deposit({ token = tokenLedger.toText(); amount; fee }));
    } catch (e) {
      #err("ICPSwap deposit call rejected: " # e.message());
    };
  };

  // Swaps inside the pool; fails when the output is below amountOutMinimum.
  public func swap(poolId : Principal, zeroForOne : Bool, amountIn : Nat, amountOutMinimum : Nat) : async Result.Result<Nat, Text> {
    try {
      natResult(await pool(poolId).swap({ amountIn = amountIn.toText(); zeroForOne; amountOutMinimum = amountOutMinimum.toText() }));
    } catch (e) {
      #err("ICPSwap swap call rejected: " # e.message());
    };
  };

  // Withdraws `amount` of `tokenLedger` to this canister's default account.
  public func withdraw(poolId : Principal, tokenLedger : Principal, amount : Nat, fee : Nat) : async Result.Result<Nat, Text> {
    try {
      natResult(await pool(poolId).withdraw({ token = tokenLedger.toText(); amount; fee }));
    } catch (e) {
      #err("ICPSwap withdraw call rejected: " # e.message());
    };
  };

  // Withdraws `amount` of `tokenLedger` to `subaccount` of this canister.
  public func withdrawToSubaccount(poolId : Principal, tokenLedger : Principal, amount : Nat, fee : Nat, subaccount : Blob) : async Result.Result<Nat, Text> {
    let p : SubaccountPool = actor (poolId.toText());
    try {
      natResult(await p.withdrawToSubaccount({ token = tokenLedger.toText(); amount; fee; subaccount }));
    } catch (e) {
      #err("ICPSwap withdrawToSubaccount call rejected: " # e.message());
    };
  };

  // Amounts held by a pool (SwapPool.getTokenAmountState, query).
  type AmountStateResult = { #ok : { token0Amount : Nat; token1Amount : Nat }; #err : Types.IcpSwapError };
  type AmountStatePool = actor {
    getTokenAmountState : shared query () -> async AmountStateResult;
  };

  // --- Reference price reading -------------------------------------------

  public let FEE_SCALE : Nat = 1_000_000;

  // Smallest TTTI-T amount (e8s) quoted when the spot price is not readable.
  public let MIN_QUOTE_AMOUNT : Nat = 100;

  // Amount quoted on the quote path: 1 % of the pool's TTTI-T reserve, never
  // below 100 e8s. Pure.
  public func quoteAmountFor(tttiReserve : Nat) : Nat {
    let onePercent = tttiReserve / 100;
    if (onePercent < MIN_QUOTE_AMOUNT) MIN_QUOTE_AMOUNT else onePercent;
  };

  // Spot price from the pool's sqrtPriceX96: raw price token1 / token0 =
  // (sqrtPriceX96 / 2^96)^2 in base units, converted with the token order and
  // the counter decimals (TTTI-T has 8) to counter whole tokens x 1e8 per whole
  // TTTI-T. Null when the value is absent, zero or rounds to zero. Pure.
  public func priceFromSqrt(sqrtPriceX96 : ?Nat, tttiIsToken0 : Bool, counterDecimals : Nat8) : ?Nat {
    let s = switch (sqrtPriceX96) {
      case (?v) v;
      case null return null;
    };
    if (s == 0) return null;
    let q192 : Nat = 2 ** 192;
    let sq = s * s;
    let scale : Nat = 10 ** counterDecimals.toNat();
    let e16 : Nat = 10 ** 16;
    let price = if (tttiIsToken0) sq * e16 / (q192 * scale) else q192 * e16 / (sq * scale);
    if (price == 0) null else ?price;
  };

  // Price from a quote: `out` counter base units obtained for `amountIn` TTTI-T
  // e8s, with the pool fee (parts per FEE_SCALE) added back, as counter whole
  // tokens x 1e8 per whole TTTI-T. Null for an empty quote or an unusable fee.
  // Pure.
  public func priceFromQuote(amountIn : Nat, out : Nat, poolFee : Nat, counterDecimals : Nat8) : ?Nat {
    if (amountIn == 0 or out == 0 or poolFee >= FEE_SCALE) return null;
    let gross = out * FEE_SCALE / (FEE_SCALE - poolFee);
    let price = gross * 100_000_000 * 100_000_000 / (amountIn * 10 ** counterDecimals.toNat());
    if (price == 0) null else ?price;
  };

  public type Reading = {
    reading : DexTypes.ReferenceReading;
    sample : ?DexTypes.IcpSwapSample;
  };

  public func failedReading(counter : DexTypes.DexToken, poolCanister : ?Principal, step : DexTypes.ReadingStep, detail : ?Text, now : Int) : DexTypes.ReferenceReading {
    { counter; poolCanister; readAt = now; outcome = #failed({ step; detail }) };
  };

  func failed(counter : DexTypes.DexToken, poolCanister : ?Principal, step : DexTypes.ReadingStep, detail : ?Text, now : Int) : Reading {
    { reading = failedReading(counter, poolCanister, step, detail, now); sample = null };
  };

  func readReserves(poolId : Principal) : async Result.Result<{ token0Amount : Nat; token1Amount : Nat }, Text> {
    let state : AmountStatePool = actor (poolId.toText());
    try {
      switch (await state.getTokenAmountState()) {
        case (#ok(s)) #ok(s);
        case (#err(e)) #err(errorText(e));
      };
    } catch (e) {
      #err("ICPSwap getTokenAmountState call rejected: " # e.message());
    };
  };

  // Reads the TTTI-T price on the ICPSwap TTTI-T/<counter> pair (read only, no
  // transfer, no order). Steps: pool lookup through the factory, metadata
  // (token order, fee, sqrtPriceX96), pool amounts, then the price: the spot
  // price from sqrtPriceX96, or when it is absent or unusable a quote on 1 % of
  // the pool's TTTI-T reserve (minimum 100 e8s) with the pool fee added back.
  // The counter-side reserve gives the depth. Always returns the reading; the
  // sample is present only on success, and a failure names the step.
  public func readTttiSample(counter : DexTypes.DexToken, counterLedger : Principal, counterDecimals : Nat8, tttiLedger : Principal, now : Int) : async Reading {
    let poolId = switch (await findPool(tttiLedger, counterLedger)) {
      case (?p) p;
      case null return failed(counter, null, #poolLookup, ?"No ICPSwap pool found for the pair, or the factory call failed", now);
    };
    let meta = switch (await readMetadata(poolId, tttiLedger)) {
      case (#ok(m)) m;
      case (#err(e)) return failed(counter, ?poolId, #metadata, ?e, now);
    };
    let fee = meta.info.fee;
    if (fee >= FEE_SCALE) return failed(counter, ?poolId, #metadata, ?("Pool fee out of range: " # fee.toText()), now);
    let tttiIsToken0 = meta.info.tttiIsToken0;
    let reserves = switch (await readReserves(poolId)) {
      case (#ok(r)) r;
      case (#err(e)) return failed(counter, ?poolId, #reserve, ?e, now);
    };
    let tttiReserve = if (tttiIsToken0) reserves.token0Amount else reserves.token1Amount;
    let counterReserve = if (tttiIsToken0) reserves.token1Amount else reserves.token0Amount;

    var price : Nat = 0;
    var method : DexTypes.ReadingMethod = #spot;
    switch (priceFromSqrt(meta.sqrtPriceX96, tttiIsToken0, counterDecimals)) {
      case (?p) { price := p };
      case null {
        if (tttiReserve == 0) return failed(counter, ?poolId, #spotPrice, ?"sqrtPriceX96 absent or unusable and the pool holds no TTTI-T to quote on", now);
        let amountIn = quoteAmountFor(tttiReserve);
        let out = switch (await quote(poolId, tttiIsToken0, amountIn)) {
          case (#ok(v)) v;
          case (#err(e)) return failed(counter, ?poolId, #quote, ?e, now);
        };
        switch (priceFromQuote(amountIn, out, fee, counterDecimals)) {
          case (?p) {
            price := p;
            method := #quote;
          };
          case null return failed(counter, ?poolId, #quote, ?("Quote on " # amountIn.toText() # " e8s returned an empty or unusable price"), now);
        };
      };
    };
    let sample : DexTypes.IcpSwapSample = { poolCanister = poolId; counter; counterPerTttiE8 = price; counterReserve; readAt = now };
    {
      reading = { counter; poolCanister = ?poolId; readAt = now; outcome = #ok({ counterPerTttiE8 = price; method }) };
      sample = ?sample;
    };
  };
};
