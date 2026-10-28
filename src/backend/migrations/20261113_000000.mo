import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import CorePrincipal "mo:core/Principal";

// DEX lot 1: adds the pool registry with the 7 starting pairs, empty and
// awaiting first liquidity, and the empty pair-request store. Touches only the
// new `dex` field (never sale.reserved, balances, blocks or other state).
module {
  type OldActor = {};

  type FeeTier = { #bps5; #bps30; #bps100 };
  type PoolStatus = { #awaitingFirstLiquidity; #active; #removed };
  type PoolKind = { #tttiPair; #utilityPair };
  type TokenLedger = { #internal; #external : CorePrincipal.Principal };
  type PoolToken = { ledger : TokenLedger; symbol : Text; decimals : Nat8 };
  type PoolMinimums = { token0 : ?Nat; token1 : ?Nat };

  type Pool = {
    id : Nat;
    token0 : PoolToken;
    token1 : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    status : PoolStatus;
    createdAt : Int;
    subaccount : Blob;
    minimumLocked : PoolMinimums;
    newPairBadgeUntil : ?Int;
    requestId : ?Nat;
    removedAt : ?Int;
  };

  type RequestedToken = {
    ledgerId : CorePrincipal.Principal;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    fee : Nat;
  };

  type RequestChecks = {
    icrc1 : Bool;
    icrc2 : Bool;
    metadataRead : Bool;
    pairUnique : Bool;
    copiedSymbolOf : ?Text;
  };

  type RequestStatus = {
    #pending;
    #approved : { poolId : Nat; at : Int };
    #refused : { reason : Text; at : Int };
  };

  type PairRequest = {
    id : Nat;
    requester : CorePrincipal.Principal;
    token : RequestedToken;
    counter : PoolToken;
    feeTier : FeeTier;
    kind : PoolKind;
    message : Text;
    createdAt : Int;
    checks : RequestChecks;
    depositAmount : Nat;
    depositBlock : Nat;
    status : RequestStatus;
    refundBlock : ?Nat;
  };

  type DexStore = {
    pools : Map.Map<Nat, Pool>;
    requests : Map.Map<Nat, PairRequest>;
    lastRefusalAt : Map.Map<CorePrincipal.Principal, Int>;
    var nextPoolId : Nat;
    var nextRequestId : Nat;
  };

  type NewActor = {
    dex : DexStore;
  };

  // "DEX-POOL-" followed by the id zero-padded to 23 digits (32 ASCII bytes).
  func poolSubaccount(id : Nat) : Blob {
    var digits = id.toText();
    while (digits.size() < 23) {
      digits := "0" # digits;
    };
    ("DEX-POOL-" # digits).encodeUtf8();
  };

  public func migration(_ : OldActor) : NewActor {
    let now = Time.now();
    let ttti : PoolToken = { ledger = #internal; symbol = "TTTI-T"; decimals = 8 };
    let icp : PoolToken = { ledger = #external(CorePrincipal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai")); symbol = "ICP"; decimals = 8 };
    let ckbtc : PoolToken = { ledger = #external(CorePrincipal.fromText("mxzaz-hqaaa-aaaar-qaada-cai")); symbol = "ckBTC"; decimals = 8 };
    let ckusdc : PoolToken = { ledger = #external(CorePrincipal.fromText("xevnm-gaaaa-aaaar-qafnq-cai")); symbol = "ckUSDC"; decimals = 6 };
    let ckusdt : PoolToken = { ledger = #external(CorePrincipal.fromText("cngnf-vqaaa-aaaar-qag4q-cai")); symbol = "ckUSDT"; decimals = 6 };

    let starting : [(PoolToken, PoolToken, PoolKind)] = [
      (ttti, icp, #tttiPair),
      (ttti, ckbtc, #tttiPair),
      (ttti, ckusdc, #tttiPair),
      (ttti, ckusdt, #tttiPair),
      (ckbtc, icp, #utilityPair),
      (ckusdc, icp, #utilityPair),
      (ckusdt, icp, #utilityPair),
    ];

    let pools = Map.empty<Nat, Pool>();
    var id = 1;
    for ((token0, token1, kind) in starting.values()) {
      pools.add(
        id,
        {
          id;
          token0;
          token1;
          feeTier = #bps30;
          kind;
          status = #awaitingFirstLiquidity;
          createdAt = now;
          subaccount = poolSubaccount(id);
          minimumLocked = switch (kind) {
            case (#tttiPair) { { token0 = ?10_000; token1 = null } };
            case (#utilityPair) { { token0 = null; token1 = null } };
          };
          newPairBadgeUntil = null;
          requestId = null;
          removedAt = null;
        },
      );
      id += 1;
    };

    {
      dex = {
        pools;
        requests = Map.empty();
        lastRefusalAt = Map.empty();
        var nextPoolId = id;
        var nextRequestId = 1;
      };
    };
  };
};
