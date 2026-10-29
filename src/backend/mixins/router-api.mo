import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import OracleLib "../lib/oracle";
import DexLib "../lib/dex";
import RetryLib "../lib/retry";
import RouterLib "../lib/router";
import DexTypes "../types/dex";
import Types "../types/router";

// DEX lot 5: ICPSwap router public API.
mixin (
  router : RouterLib.RouterContext,
  accessControlState : AccessControl.AccessControlState,
  oracle : OracleLib.OracleStore,
  tokenRates : OracleLib.TokenRateStore,
) {
  // Same USD rates as mixins/dex-api.mo (fixed TTTI-T value, oracle rates).
  func routerUsdRateOf(token : DexTypes.PoolToken) : ?Nat {
    switch (DexLib.poolDexToken(token)) {
      case (?#tttiT) ?DexLib.TTTI_T_USD_E8;
      case (?t) {
        switch (RetryLib.dexPayToken(t)) {
          case (?pay) OracleLib.usableRate(OracleLib.storeFor(oracle, tokenRates, pay), Time.now());
          case null null;
        };
      };
      case null null;
    };
  };

  // Routed quote for a registry pair: compares the native pool and the
  // ICPSwap pool net of all fees and returns exactly one route. Update call
  // (it queries the ICPSwap pool on another subnet); changes no state.
  public shared ({ caller }) func quoteRoutedSwap(args : Types.RoutedQuoteArgs) : async { #ok : Types.RoutedQuote; #err : Types.RouteError } {
    if (caller.isAnonymous()) return #err(#anonymous);
    await RouterLib.routedQuote(router, routerUsdRateOf, args);
  };

  // Executes on exactly the chosen route from the caller's internal DEX
  // balances and credits the output to them.
  public shared ({ caller }) func routedSwap(args : Types.RoutedSwapArgs) : async { #ok : Types.RoutedSwapResult; #err : Types.RouteError } {
    if (router.dex.pause.paused) {
      Runtime.trap(DexLib.PAUSED_MESSAGE);
    };
    await RouterLib.routedSwap(router, routerUsdRateOf, caller, args);
  };

  // Caller's own routed swaps, newest first.
  public query ({ caller }) func getMyRoutedSwaps() : async [Types.RoutedSwap] {
    RouterLib.listByOwner(router, caller);
  };

  // Admin only: every ICPSwap routed swap with its status, newest first.
  public query ({ caller }) func adminListRoutedSwaps() : async { #ok : [Types.RoutedSwap]; #err : Types.RouterAdminError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    #ok(RouterLib.listIcpswapSwaps(router));
  };

  // Admin only: total 0.1 % collected per native pool (LP share paid, LP
  // share set aside, permanent-liquidity share) and the current set-aside.
  public query ({ caller }) func adminGetRouterFees() : async { #ok : [Types.RouterFeeView]; #err : Types.RouterAdminError } {
    if (not AccessControl.isAdmin(accessControlState, caller)) return #err(#notAuthorized);
    #ok(RouterLib.feeViews(router));
  };
};
