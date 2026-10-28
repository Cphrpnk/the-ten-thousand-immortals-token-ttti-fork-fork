import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat8 "mo:core/Nat8";
import Result "mo:core/Result";
import Types "../types/icpswap";
import PayTypes "../types/pay-token";

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

  // The ICPSwap TTTI-T/<token> pool known statically for `token`: none, as
  // the TTTI-T ledger is this canister; pools are resolved with `findPool`.
  public func poolFor(token : PayTypes.PayToken) : ?Principal {
    ignore token;
    null;
  };

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

  public func info(poolId : Principal, tttiLedger : Principal) : async Result.Result<PoolInfo, Text> {
    try {
      switch (await pool(poolId).metadata()) {
        case (#ok(m)) {
          let t = tttiLedger.toText();
          if (m.token0.address == t) #ok({ poolId; tttiIsToken0 = true; fee = m.fee }) else if (m.token1.address == t) #ok({ poolId; tttiIsToken0 = false; fee = m.fee }) else #err("ICPSwap pool does not hold TTTI-T");
        };
        case (#err(e)) #err(errorText(e));
      };
    } catch (e) {
      #err("ICPSwap metadata call rejected: " # e.message());
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
};
