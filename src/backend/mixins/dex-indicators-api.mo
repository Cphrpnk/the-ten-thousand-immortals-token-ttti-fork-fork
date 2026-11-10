import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Time "mo:core/Time";
import Types "../types/dex-indicators";
import ProtocolFeeTypes "../types/protocol-fees";
import ProtocolFeesLib "../lib/protocol-fees";
import DexReserveLib "../lib/dex-reserve";

// DEX lot 7: public indicators snapshot (computed once per hour by a timer) and
// its admin status.
mixin (
  indicators : Types.IndicatorsStore,
  accessControlState : AccessControl.AccessControlState,
  protocolFees : ProtocolFeesLib.ProtocolFeeContext,
  // PTM-10d: the reserve check context (same value as the one given to DexReserveApi).
  reserve : DexReserveLib.ReserveContext,
) {
  // PTM-10a: public, no sign-in. Pools value, capitalisation, current ratio,
  // 24 h average, 50 % target and locked share m, computed on each call
  // (nothing stored by the call). The mint does not use m yet.
  public query func getPoolCapRatio() : async ProtocolFeeTypes.PoolCapRatioView {
    ProtocolFeesLib.poolCapRatioView(protocolFees, Time.now());
  };

  // Public: the stored snapshot, null until the first computation. Never
  // recomputes on read.
  public query func getDexIndicators() : async ?Types.DexIndicatorsSnapshot {
    indicators.snapshot;
  };

  // PTM-10d: public, no sign-in. Per-token breakdown of what the contract must
  // hold (pool reserves, guarantees, creator holdings, DEX balances, permanent
  // liquidity, pair-request deposits, auction deposits, operations in flight)
  // against the ledger balance, from the last complete reserve check.
  // checkedAt = end of that check (0 before any); complete = false while a
  // check is running, when a token could not be compared, or after an upgrade
  // until the next check. Nothing is stored by the call.
  public query func getDexBalanceBreakdown() : async Types.DexBalanceBreakdownSnapshot {
    DexReserveLib.breakdownSnapshot(reserve);
  };

  // Admin only (#err(#unauthorized) otherwise): snapshot time, last computation
  // result, last error text with its date and the last success time.
  public shared query ({ caller }) func getDexIndicatorsStatus() : async Result.Result<Types.IndicatorsStatus, Types.DexIndicatorsError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#unauthorized);
    let snapshotAt = switch (indicators.snapshot) {
      case (?s) ?s.computedAt;
      case null null;
    };
    let lastResult : ?Types.ComputationResult = switch (indicators.lastComputedAt) {
      case null null;
      case (?_) {
        switch (indicators.lastError) {
          case (?_) ?#failed;
          case null ?#ok;
        };
      };
    };
    #ok({
      snapshotAt;
      lastComputedAt = indicators.lastComputedAt;
      lastResult;
      lastError = indicators.lastError;
      lastSuccessAt = indicators.lastSuccessAt;
    });
  };
};
