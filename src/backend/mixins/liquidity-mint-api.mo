import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import LiquidityMintLib "../lib/liquidity-mint";
import Types "../types/liquidity-mint";

// PTM-1 endpoints of the liquidity-forming mint. Minimum 0.0001 TTTI-T
// (10_000 base units), granularity 0.00000001 TTTI-T (1 base unit).
mixin (
  mintContext : LiquidityMintLib.MintContext,
  accessControlState : AccessControl.AccessControlState,
  purchasesInFlight : Set.Set<Principal>,
) {
  func requireMintAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only admins can list these records");
    };
  };

  // Preview: quantity, amount payable, position / reserve / creator split,
  // target pool, pool price before and after the balancing swap. Reads the
  // stored hourly rate only. Wallet and allowance shortfalls are reported by
  // mintLiquidity (a query cannot call a ledger).
  public query func quoteLiquidityMint(args : Types.QuoteArgs) : async Result.Result<Types.LiquidityMintQuote, Types.LiquidityMintError> {
    LiquidityMintLib.quote(mintContext, args, Time.now());
  };

  // Manual pool choice: every eligible TTTI-T/<token> pool (not removed, no
  // removal announced) with id, fee tier (bps), depth, pool price in the unit of
  // the mint preview, signed gap in bps with the consolidated price and the
  // recommended flag (lowest liquidity of the pair). Anonymous allowed.
  public query func listMintPools(token : Types.PayToken) : async Types.MintPoolList {
    LiquidityMintLib.listMintPools(mintContext, token, Time.now());
  };

  // Pool price before and after the zap for the chosen pool (args.targetPoolId;
  // null = the recommendation), with the consolidated price and signed gaps.
  // getMintPricePreview keeps its per-token figures unchanged. Anonymous allowed.
  public query func getMintPoolPreview(args : Types.QuoteArgs) : async Result.Result<Types.MintPoolPreview, Types.LiquidityMintError> {
    LiquidityMintLib.mintPoolPreview(mintContext, args, Time.now());
  };

  // Mints q TTTI-T for the caller. Refuses before taking any funds when the
  // rate is absent or expired, q < 10_000 base units, q has more than 8
  // decimals, or q exceeds the remaining 1 TTTI-T cap.
  public shared ({ caller }) func mintLiquidity(args : Types.MintArgs) : async Result.Result<Types.LiquidityMintResult, Types.LiquidityMintError> {
    if (caller.isAnonymous()) return #err(#anonymousCaller);
    // One purchase in flight per principal, shared with the BTC finalization.
    // The lock releases itself after 10 minutes if a cleanup was missed.
    let stamp = switch (LiquidityMintLib.takePurchaseLock(mintContext.lockTimes, purchasesInFlight, caller)) {
      case (?s) s;
      case null return #err(#purchaseInProgress);
    };
    try {
      await LiquidityMintLib.mint(mintContext, caller, args);
    } finally {
      LiquidityMintLib.releasePurchaseLock(mintContext.lockTimes, purchasesInFlight, caller, stamp);
    };
  };

  // The caller's mints with the position id of each (removable with the
  // existing removeLiquidity).
  public shared query ({ caller }) func getMyLiquidityMints() : async [Types.LiquidityMint] {
    LiquidityMintLib.mintsOf(mintContext.store, caller);
  };

  // Read-only history: the guarantees recorded for the caller's mints made
  // before PTM-11 (owner only). No new record is written.
  public shared query ({ caller }) func getMyGuarantees() : async [Types.Guarantee] {
    LiquidityMintLib.guaranteesOf(mintContext.store, caller);
  };

  // Admin: the recorded guarantee history, paged (read-only).
  public shared query ({ caller }) func listGuarantees(offset : Nat, limit : Nat) : async [Types.Guarantee] {
    requireMintAdmin(caller);
    LiquidityMintLib.listGuarantees(mintContext.store, offset, limit);
  };

  // Admin: every creator set-aside, paged.
  public shared query ({ caller }) func listCreatorSetAsides(offset : Nat, limit : Nat) : async [Types.CreatorSetAside] {
    requireMintAdmin(caller);
    LiquidityMintLib.listCreatorSetAsides(mintContext.store, offset, limit);
  };
};
